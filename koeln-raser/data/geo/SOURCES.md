# Geodaten-Quellen (Köln-Raser Story)

Alle Dateien stammen aus npm (registry.npmjs.org). PyPI wurde ebenfalls
durchsucht (siehe unten), lieferte aber nichts Zusätzliches ohne Laufzeit-
Netzwerkzugriff auf gesperrte Hosts. GitHub-raw / städtische Portale /
OSM-Nominatim wurden nicht verwendet.

Netzwerk-Check im Container: registry.npmjs.org und pypi.org/files.pythonhosted.org
erreichbar; cdn.jsdelivr.net und unpkg.com liefern 403 (Proxy-Policy) — daher
alles über `npm pack`/Registry-Tarballs bezogen, nichts über CDN.

---

## A) Kfz-Kennzeichen → Zulassungsbezirk

**Paket:** `german-license-plate-prefixes@2.18.0`
**Lizenz:** CC-BY-3.0 (Quelle lt. Paket: Senatsverwaltung für Wirtschaft,
Technologie und Forschung Berlin, http://daten.berlin.de/datensaetze/kfz-kennzeichen-deutschland)
**Download-URL:** https://registry.npmjs.org/german-license-plate-prefixes/-/german-license-plate-prefixes-2.18.0.tgz
**Datei im Paket:** `index.json` (36.7 KB unpacked)
**Abgelegt als:** `kfz-kennzeichen-prefixes.json` (14.7 KB) + Readme als
`kfz-kennzeichen-prefixes.README.md`

**Struktur:** flaches JSON-Objekt `{ "<Kürzel>": "<Kreis-/Stadtname>" }`,
697 Einträge (Alt- und Neukennzeichen gemischt, keine Groß-Klein-Varianten).
Beispiel:
```json
{ "K": "Köln", "BM": "Rhein-Erft-Kreis", "AC": "Städteregion Aachen" }
```
**Keine** Koordinaten, **keine** AGS, **keine** Bundesland-Angabe enthalten —
nur Kürzel → Klartext-Name. Mehr braucht die Story nicht (Herkunfts-Kategorien + Ortsnamen im Tooltip).

**Abdeckungs-Check für die 26 gefragten Kürzel** — alle vorhanden:
```
K→Köln  BM→Rhein-Erft-Kreis  GL→Rheinisch-Bergischer Kreis  SU→Rhein-Sieg-Kreis
GM→Oberbergischer Kreis  BN→Bonn  NE→Rhein-Kreis Neuss  LEV→Leverkusen
D→Düsseldorf  M→München  HH→Hamburg  ME→Mettmann  WI→Wiesbaden
AC→Städteregion Aachen  B→Berlin  DN→Düren  SI→Siegen-Wittgenstein  E→Essen
W→Wuppertal  KR→Krefeld  MG→Mönchengladbach  DU→Duisburg  OE→Olpe
F→Frankfurt am Main  NR→Neuwied  SG→Solingen  MK→Märkischer Kreis
```
Sonderfall **WI**: kein "Altkennzeichen einer Kreisstadt", sondern das aktuell
gültige Unterscheidungszeichen der kreisfreien Stadt Wiesbaden (Landeshauptstadt
Hessen) — regulär, kein Merge-Sonderfall.

**Alternative geprüft, aber verworfen:** npm-Paket `kennzeichen@0.1.6` (MIT) —
enthält nur eine Validierungs-Liste gültiger Kürzel-Strings (Regex-Zwecke),
**keine** Zuordnung zu Ortsnamen. Nicht verwendet.

---

## B) Karte (Version 3, lokal geholt mit `scripts/fetch_geo.py`, 26.09.2026)

| Datei | Inhalt | Quelle · Lizenz |
|---|---|---|
| `koeln_grenzen_osm.json.gz` | Stadtgrenze (admin_level 6), 9 Stadtbezirke (9), 86 Stadtteile (10), Ringe aus den Member-Ways zusammengesetzt | OpenStreetMap via Overpass API · © OpenStreetMap-Mitwirkende, ODbL |
| `osm_koeln.json.gz` | Rhein (waterway=river) und Straßen motorway/trunk/primary im Stadtgebiet | OpenStreetMap via Overpass API · ODbL |
| `koeln_grenzen.json` | Stadt, Bezirke, Stadtteile laut Geoapify Boundaries (liefert ebenfalls 86 Stadtteile; nur zum Gegencheck) | Geoapify · Daten © OSM-Mitwirkende, ODbL |
| `messstellen_geocoded.json` | Geocoder-Treffer je Messstelle mit Genauigkeit | Geoapify Geocoding API |
| `manual_coords.csv` | geprüfte Koordinaten: 56 feste Anlagen/Kreuzungen von Hand, übrige Zeilen aus dem OSM-Abgleich (`check_geo.py --korrekturen`); leeres lat/lon = bewusst weggelassen | eigene Prüfung auf OSM-Basis |
| `messstellen_review.csv` | Prüfliste: Geocoder-Punkt, unabhängiger OSM-Punkt, Abstände, Stadtteil-Abgleich, OSM-Links | abgeleitet |

Nicht versioniert: `geocode_cache.json` (Geocoder-Zwischenspeicher), `osm_adressen_koeln.json.gz`
(167.551 OSM-Adresspunkte + 27.021 Straßenabschnitte für den Abgleich, ~2,5 MB; per
`fetch_geo.py --nur adressen` neu zu holen).

Attribution auf der Seite: „Kartendaten © OpenStreetMap-Mitwirkende (ODbL) · Geocodierung: Geoapify“.

## Nicht verwendet

Kreis-/Landesgrenzen und Kölner Stadtteil-Geometrien waren in der Cloud-Umgebung von v1/v2 über die erreichbaren
Registries (npm, PyPI) nicht offline verfügbar. Seit Version 3 kommen sie lokal aus OpenStreetMap (siehe B). Geprüft und verworfen:
`landkreise-deutschland` (nur Sachdaten, keine Geometrien), `@svg-maps/germany` (nur Bundesländer),
`deutschland`/`@polymech/gadm` (laden Geometrien zur Laufzeit von gesperrten Hosts), PyPI `koeln`
(nur API-Client).
