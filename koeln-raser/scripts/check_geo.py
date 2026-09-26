#!/usr/bin/env python3
"""Prüft die Geocodierung der Messstellen gegen OpenStreetMap — offline, nur aus Dateien.

Für jede Messstelle wird unabhängig vom Geocoder ein OSM-Punkt bestimmt
(Adresspunkt der Hausnummer bzw. Mitte eines Hausnummern-Bereichs, Kreuzungspunkt
zweier Straßen oder Straßenmitte im genannten Stadtteil) und mit dem
Geoapify-Treffer verglichen. Auffälligkeiten landen in der Spalte „pruefen“.

    python3 koeln-raser/scripts/check_geo.py

Eingaben (data/geo/):
  messstellen_geocoded.json    Geoapify-Treffer (fetch_geo.py --nur geocode)
  osm_adressen_koeln.json.gz   Adresspunkte + Straßen (fetch_geo.py --nur adressen, nicht versioniert)
  koeln_grenzen_osm.json.gz    86 Stadtteile (fetch_geo.py --nur stadtteile)
  manual_coords.csv            geprüfte Korrekturen (dienststelle,code,lat,lon,notiz) — nur zur Anzeige
Ausgabe:
  messstellen_review.csv       eine Zeile je Messstelle, mit OSM-Link zum Gegenprüfen
"""
import csv
import difflib
import gzip
import json
import math
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fetch_geo as F                                                     # noqa: E402
from geo_util import centroid, dist_m, in_poly, line_dist_m, norm_name, poly_dist_m   # noqa: E402

GEO = F.GEO
GRENZ_M = 150        # so weit darf ein Punkt außerhalb „seines“ Stadtteils liegen (Grenzstraßen)


def load_manual():
    p = GEO / "manual_coords.csv"
    if not p.exists():
        return {}
    with open(p, encoding="utf-8", newline="") as fh:
        return {(r["dienststelle"], r["code"]): r for r in csv.DictReader(fh) if not r["dienststelle"].startswith("#")}


def parse_site(s):
    """→ (Straße, Hausnummer, Hausnummer-Ende, Querstraße) aus Ort/Lage der Standorttabelle."""
    ort, lage = s["ort"], s["lage"]
    if F.looks_like_street(ort) and not re.search(r"(?i)^(BAB|Bundesstra)", ort):
        street = F._expand(re.sub(r"\(.*?\)", "", ort))
        hn = F.parse_lage(lage)[1] if re.search(r"(?i)haus|hs|nr|geg", lage) else None
        cross = F.cross_street(lage)
    else:
        street, hn = F.parse_lage(lage)
        cross = F.cross_street(lage)                         # z. B. „Militärring v.Bachemer Landstr“
    hn2 = None
    if hn:
        clean = re.sub(r"(?i)\b(?:laterne|lat\.?|l)\s*\.?\s*(?:nr\.?\s*)?\d+[a-z]?(?:\s*[-/]\s*\d+[a-z]?)?", " ", lage)
        m = re.search(rf"\b{re.escape(hn)}\s*-\s*(\d+[a-z]?)\b", clean, re.I)
        hn2 = m.group(1).lower() if m else None
    return street, (hn or "").lower() or None, hn2, cross


class OSM:
    def __init__(self):
        d = json.load(gzip.open(GEO / "osm_adressen_koeln.json.gz", "rt", encoding="utf-8"))
        self.adr = defaultdict(lambda: defaultdict(list))
        for street, hn, lon, lat in d["adressen"]:
            for h in re.split(r"[;,]", hn):
                h = h.strip().lower().replace(" ", "")
                parts = re.split(r"-", h) if re.fullmatch(r"\d+[a-z]?-\d+[a-z]?", h) else [h]
                for x in parts:
                    self.adr[norm_name(street)][x].append((lon, lat))
        self.streets = defaultdict(list)
        for name, _hw, geom in d["strassen"]:
            self.streets[norm_name(name)].append([tuple(p) for p in geom])
        self.keys = sorted(set(self.streets) | set(self.adr))

    def resolve(self, street):
        """Straßenname → OSM-Schlüssel; toleriert Abkürzungen („H.-Erpenbach-Str.“, „Lib.Landstr.“),
        fehlendes „-straße“ („Militärring“) und Tippfehler der Quelle („Lützeratherstr.“)."""
        if not street:
            return None
        k = norm_name(street)
        if k in self.streets or k in self.adr:
            return k
        if k + "str" in self.streets:
            return k + "str"
        if "." in street:
            parts = [norm_name(p) for p in street.split(".") if norm_name(p)]
            rx = re.compile(".*".join(map(re.escape, parts)) + "$")
            hits = [x for x in self.keys if rx.match(x)]
            if len(hits) == 1:
                return hits[0]
        close = difflib.get_close_matches(k, self.keys, n=1, cutoff=0.9)
        return close[0] if close else k

    def near_area(self, pts, st):
        """Kandidaten in/nahe dem Stadtteil bevorzugen."""
        if not st or len(pts) <= 1:
            return pts
        ins = [p for p in pts if poly_dist_m(p, st) <= GRENZ_M]
        if ins:
            return ins
        c = centroid(st)
        return [min(pts, key=lambda p: dist_m(p, c))]

    def locate(self, street, hn, hn2, cross, st):
        k = self.resolve(street)
        cross_name, cross = cross, self.resolve(cross)
        if k and hn and self.adr.get(k, {}).get(hn):
            cands = self.near_area(self.adr[k][hn], st)
            p = cands[0]
            ambig = max(dist_m(p, c) for c in cands) > 300      # Gebäude + Eingang liegen dicht beieinander
            if hn2 and self.adr[k].get(hn2):
                q = min(self.adr[k][hn2], key=lambda x: dist_m(x, p))
                if dist_m(p, q) < 1500:
                    return ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2), f"osm_hausnummer {hn}–{hn2}", ambig
            return p, f"osm_hausnummer {hn}", ambig
        lines = self.streets.get(k) if k else None
        if lines and cross and cross != k and self.streets.get(cross):
            best = (math.inf, None)
            for la in lines:
                for lb in self.streets[cross]:
                    for a in la:
                        for b in lb:
                            if abs(a[0] - b[0]) < .003 and abs(a[1] - b[1]) < .002:
                                d = dist_m(a, b)
                                if d < best[0] and (not st or poly_dist_m(a, st) <= 400):
                                    best = (d, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2))
            if best[1] and best[0] < 80:
                return best[1], f"osm_kreuzung {cross_name}", False
        if lines:
            pts = [p for ln in lines for p in ln]
            if st:
                ins = [p for p in pts if poly_dist_m(p, st) <= GRENZ_M]
                if not ins:
                    return None, "strasse_nicht_im_stadtteil", False
                pts = ins
            cx, cy = sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)
            p = min(pts, key=lambda q: dist_m(q, (cx, cy)))
            span = max(dist_m(p, q) for q in pts)
            return p, f"osm_strasse (±{round(span, -1):.0f} m)", st is None
        return None, "nicht_in_osm", False


def main():
    grenzen = json.load(gzip.open(GEO / "koeln_grenzen_osm.json.gz", "rt", encoding="utf-8"))
    teile = {norm_name(f["name"]): f for f in grenzen["stadtteile"]}
    geo_p = GEO / "messstellen_geocoded.json"
    geo = {(g["d"], g["c"]): g for g in json.loads(geo_p.read_text(encoding="utf-8"))} if geo_p.exists() else {}
    manual = load_manual()
    osm = OSM()
    rows, stats, decisions = [], Counter(), {}
    for s in F.load_sites():
        key = (s["d"], s["c"])
        st = teile.get(norm_name(s["ort"]))
        if not st:                                   # Stadtteil steht bei Straßen-Orten oft in der Lage
            st = next((f for n, f in teile.items() if n and n in norm_name(s["lage"])), None)
        street, hn, hn2, cross = parse_site(s)
        op, how, ambig = osm.locate(street, hn, hn2, cross, st)
        g = geo.get(key, {})
        gp = (g["lon"], g["lat"]) if g.get("lat") is not None else None
        st_pt = next((f["name"] for f in grenzen["stadtteile"] if gp and in_poly(gp, f)), "")
        d_osm = round(dist_m(gp, op)) if gp and op else ""
        d_str = ""
        sk = osm.resolve(street)
        if gp and sk and osm.streets.get(sk):
            d = line_dist_m(gp, osm.streets[sk])
            d_str = round(d) if d < 5000 else 5000               # > ~1 km: Vorfilter greift, Wert ist nur „weit weg“
        why = []
        if s["d"] != "S-02":
            why.append("feste Anlage/Kreuzung: einzeln prüfen")
        if not gp:
            why.append("kein Geocoder-Treffer")
        else:
            if g.get("genauigkeit") != "hausnummer":
                why.append(f"genauigkeit={g.get('genauigkeit')}")
            if d_osm != "" and how.startswith("osm_hausnummer") and d_osm > 150:
                why.append(f"{d_osm} m von OSM-Hausnummer")
            if d_osm != "" and how.startswith("osm_kreuzung") and d_osm > 150:
                why.append(f"{d_osm} m von OSM-Kreuzung")
            if d_str != "" and d_str > 60:
                why.append(f"{d_str} m neben der Straße")
            if st and poly_dist_m(gp, st) > GRENZ_M:
                why.append(f"liegt in {st_pt or 'außerhalb'}, nicht in {st['name']}")
        if ambig:
            why.append("Name mehrdeutig")
        if s["d"] == "S-02":
            dec = decide(g, gp, op, how, st, st_pt, d_osm, d_str)
            if dec:
                decisions[key] = dec
        stats["mit Geocoder-Punkt"] += bool(gp)
        stats["OSM-Punkt gefunden"] += bool(op)
        stats["zu prüfen"] += bool(why)
        stats[f"osm:{how.split(' ')[0]}"] += 1
        link = lambda p: f"https://www.openstreetmap.org/?mlat={p[1]:.6f}&mlon={p[0]:.6f}#map=18/{p[1]:.6f}/{p[0]:.6f}" if p else ""
        m = manual.get(key)
        rows.append({
            "dienststelle": s["d"], "code": s["c"], "ort": s["ort"], "lage": s["lage"], "richtung": s["ri"],
            "genauigkeit": g.get("genauigkeit", "fehlt"), "lat": g.get("lat", ""), "lon": g.get("lon", ""),
            "gefunden_als": g.get("formatted", ""), "osm_link": link(gp),
            "osm_methode": how, "osm_lat": round(op[1], 6) if op else "", "osm_lon": round(op[0], 6) if op else "",
            "abstand_osm_m": d_osm, "abstand_strasse_m": d_str,
            "stadtteil_laut_ort": st["name"] if st else "", "stadtteil_des_punkts": st_pt,
            "pruefen": "; ".join(why), "osm_link_abgleich": link(op),
            "manuell": (f"{m['lat']},{m['lon']} · {m['notiz']}" if m else ""),
        })
    with open(GEO / "messstellen_review.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]), lineterminator="\n")
        w.writeheader()
        w.writerows(rows)
    print(f"✓ messstellen_review.csv · {len(rows)} Messstellen · " + " · ".join(f"{k}: {v}" for k, v in sorted(stats.items())))
    if "--korrekturen" in sys.argv:
        write_corrections(decisions, manual)


AUTO = "OSM-Abgleich: "


MAX_SPANNE = 1000    # Straßenmitte gilt nur als Punkt, wenn die Straße im Stadtteil höchstens ±1 km lang ist


def decide(g, gp, op, how, st, st_pt, d_osm, d_str):
    """Mobile Messstelle: None = Geocoder-Punkt behalten, sonst (Punkt|None, Genauigkeit, Grund).
    Genauigkeit „hausnummer“ steht hier für punktgenau (Adresse oder Kreuzung)."""
    in_st = lambda p: st is None or poly_dist_m(p, st) <= GRENZ_M
    acc = g.get("genauigkeit")
    m = re.search(r"±(\d+)", how)
    span = int(m.group(1)) if m else 0
    osm_ok = op is not None and in_st(op)
    osm_exact = osm_ok and how.startswith(("osm_hausnummer", "osm_kreuzung"))
    far_hn = osm_ok and how.startswith("osm_hausnummer") and d_osm != "" and d_osm > 150
    if gp and acc == "hausnummer" and in_st(gp) and not far_hn:
        return None
    geo_street_ok = gp and acc == "strasse" and in_st(gp) and (d_str == "" or d_str <= 60)
    if geo_street_ok and not osm_exact and span <= MAX_SPANNE:
        return None
    if not gp or acc not in ("hausnummer", "strasse"):
        why = "Geocoder fand nur den Stadtteil" if gp else "kein Geocoder-Treffer"
    elif not in_st(gp):
        why = f"Geocoder-Punkt lag in {st_pt or 'einem anderen Stadtteil'}, nicht in {st['name']}"
    elif far_hn:
        why = f"Geocoder-Punkt {d_osm} m von der OSM-Adresse entfernt"
    elif geo_street_ok and osm_exact:
        why = "Geocoder fand nur die Straße"
    elif geo_street_ok:
        why = "Geocoder fand nur die Straße"
    else:
        why = f"Geocoder-Punkt {d_str} m neben der Straße"
    label = how.replace("osm_hausnummer", "OSM-Adresse Nr.").replace("osm_kreuzung", "OSM-Kreuzung mit") \
               .replace("osm_strasse", "OSM-Straßenmitte im Stadtteil")
    if osm_exact:
        return op, "hausnummer", f"{why}; ersetzt durch {label}"
    if osm_ok and span <= MAX_SPANNE:
        return op, "strasse", f"{why}; ersetzt durch {label}"
    if osm_ok:
        return None, "", f"{why}; Straße im Stadtteil zu lang für einen verlässlichen Punkt (±{span} m) → weggelassen"
    if gp and acc in ("hausnummer", "strasse") and in_st(gp):
        return None                                   # kleiner Befund, aber kein besserer Punkt
    return None, "", f"{why}; auch in OSM kein verlässlicher Punkt → weggelassen"


def write_corrections(decisions, manual):
    """Schreibt die Vorschläge für mobile Messstellen in manual_coords.csv.
    Von Hand gepflegte Zeilen (Notiz ohne „OSM-Abgleich:“) bleiben unangetastet und haben Vorrang."""
    keep = {k: r for k, r in manual.items() if not r["notiz"].startswith(AUTO)}
    out = dict(keep)
    for k, (p, acc, why) in decisions.items():
        if k in keep:
            continue
        out[k] = {"dienststelle": k[0], "code": k[1], "lat": f"{p[1]:.6f}" if p else "", "lon": f"{p[0]:.6f}" if p else "",
                  "notiz": AUTO + why, "genauigkeit": acc}
    with open(GEO / "manual_coords.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["dienststelle", "code", "lat", "lon", "notiz", "genauigkeit"], lineterminator="\n")
        w.writeheader()
        for k in sorted(out):
            w.writerow({f: out[k].get(f, "") for f in w.fieldnames})
    n_auto = sum(1 for k in out if k not in keep)
    print(f"✓ manual_coords.csv · {len(keep)} von Hand · {n_auto} aus dem OSM-Abgleich "
          f"(davon {sum(1 for k in out if k not in keep and not out[k]['lat'])} weggelassen)")


if __name__ == "__main__":
    main()
