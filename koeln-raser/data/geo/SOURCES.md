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
nur Kürzel → Klartext-Name. Muss über den Namen mit den Landkreis-Daten (B)
gejoint werden (Fuzzy-Match nötig, siehe unten).

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

## B) Landkreise/kreisfreie Städte — Sachdaten (keine Geometrien gefunden)

**Paket:** `landkreise-deutschland@3.0.0`
**Lizenz:** CC-BY-4.0 © Statistisches Bundesamt (Destatis), Quelle:
Gemeindeverzeichnis-Informationssystem GV-ISys, Stand 31.12.2018
**Download-URL:** https://registry.npmjs.org/landkreise-deutschland/-/landkreise-deutschland-3.0.0.tgz
**Datei im Paket:** `data/districts.json` (99.9 KB) / `data/districts.csv` (27.6 KB, Trennzeichen `;`)
**Abgelegt als:** `landkreise-deutschland-districts.json` + `.csv`

**Feldnamen (Beispiel):**
```json
{
  "AGS": "05315",
  "type": "Kreisfreie Stadt",
  "name": "Köln, Stadt",
  "NUTS3": "DEA23",
  "area_km2": 405.01,
  "population": 1085664,
  "population_male": 529368,
  "population_female": 556296,
  "population_per_km2": 2681
}
```
**Abdeckung:** 401 Einträge (98 Kreisfreie Stadt, 9 Stadtkreis, 251 Landkreis,
42 Kreis, 1 Regionalverband Saarbrücken) = vollständige Fläche Deutschlands
Stand 2018. Hinweis: Zum aktuellen Stand (2026) sind es offiziell 400 Kreise/
kreisfreie Städte — die Fusion Eisenach → Wartburgkreis (Thüringen, 2021) ist
in dieser Version noch **nicht** nachgeführt. Für die Köln-Story irrelevant,
da NRW nicht betroffen ist.

**WICHTIG:** Enthält **keine Koordinaten** (kein Lat/Lon, kein Kreissitz-Punkt)
und **kein explizites Bundesland-Feld**. Die Bundesland-Zuordnung lässt sich
nur strukturell über die ersten zwei Ziffern des AGS ableiten (amtliche
Systematik, z. B. `05` = Nordrhein-Westfalen) — diese Ableitungstabelle ist
in keinem der gefundenen Pakete als Datei enthalten; ich habe sie **nicht**
selbst erzeugt/eingefügt, um keine Daten "aus dem Gedächtnis" zu erfinden.
Falls gewünscht, bitte separat als offizielle Destatis-Systematik-Tabelle
nachliefern lassen.

**Join A↔B:** über `name` (Fuzzy-Match nötig, z. B. Kennzeichen-Datensatz
"Köln" vs. Landkreis-Datensatz "Köln, Stadt"; "Rhein-Erft-Kreis" passt exakt).
Das Paket selbst bringt für genau diesen Zweck `getDistrictByNameAndType()`
mit (string-similarity), aber nur als Node-Funktion, nicht als flache Zuordnungsdatei
— d. h. der Join muss im eigenen Build-Skript nachgebaut werden.

**Geometrien:** Trotz gezielter Suche (npm: "germany geojson", "landkreise
geojson", "deutschland topojson", "kreise geojson", "nuts3 geojson",
"gadm" u. a.; PyPI: "deutschland", "germany-geojson" etc.) **kein** npm-/PyPI-
Paket mit Kreis-Umrissen (GeoJSON/TopoJSON, 400 Polygone) gefunden, das ohne
Laufzeit-Netzwerkzugriff auf einen gesperrten Host auskommt:
- `deutschland` (PyPI, bundesAPI, Apache-2.0) — `geo.py` lädt Vektor-Kacheln
  zur Laufzeit von `sgx.geodatenzentrum.de` nach — **kein Bundle**, verworfen.
- `@polymech/gadm` (npm) — Parquet mit Namen/Hierarchie, aber Geometrie wird
  laut Readme "from GADM CDN" nachgeladen; zudem **keine Lizenzangabe** im
  package.json und GADM selbst untersagt Weiterverbreitung ohne Erlaubnis —
  verworfen.
- `sane-topojson` (npm, MIT) — Natural-Earth-Ableitung, Layer `subunits` hat
  nur Länder-/Provinz-Grobauflösung (Weltmaßstab), keine deutschen Kreise.

**Fazit B (Kreise):** Für echte Kreis-Umrisse braucht es einen Host außerhalb
der freigegebenen Registries (z. B. BKG/VG250, GeoJSON-Mirrors auf GitHub) —
das ist mit der aktuellen Netzwerk-Policy nicht möglich. Bitte klären, ob ein
Ausnahme-Host freigeschaltet werden kann, oder ob eine grob vereinfachte
Karte (z. B. nur NRW + Nachbarkreise als handgezeichnetes SVG) ausreicht.

## B') Bundesländer-Umrisse — gefunden, aber nur als Illustration

**Paket:** `@svg-maps/germany@2.0.0`
**Lizenz:** CC-BY-4.0
**Download-URL:** https://registry.npmjs.org/@svg-maps/germany/-/germany-2.0.0.tgz
**Dateien im Paket:** `germany.svg` (fertiges SVG) + `index.js` (JS-Modul mit
denselben Pfaden als Daten-Objekt), zusammen ca. 150 KB unpacked
**Abgelegt als:** `bundeslaender-svg-maps-germany.svg` +
`bundeslaender-svg-maps-germany.paths.js`

**Struktur (index.js):**
```js
export default {
  "label": "Map of Germany",
  "viewBox": "0 0 586 793",
  "locations": [
    { "name": "North Rhine-Westphalia", "id": "nw", "path": "m 181.25...z" },
    // ... 16 Einträge total
  ]
}
```
**Abdeckung:** alle 16 Bundesländer vollständig, IDs als ISO-3166-2-Kürzel
(`nw`, `by`, `be`, …). **Wichtig:** Koordinaten sind SVG-Pfaddaten in einem
eigenen `viewBox`-Koordinatensystem (0..586 × 0..793), **keine** echten
Lat/Lon-Projektionen — für eine reine HTML/SVG-Illustration ohne
Kartenprojektion aber direkt einsetzbar (passt zur Vorgabe "reines HTML/SVG,
keine Laufzeit-Abhängigkeiten"). Namen sind englisch ("North Rhine-Westphalia"
statt "Nordrhein-Westfalen") — für die Story ggf. selbst übersetzen.

---

## C) Köln — Stadtteile / Stadtbezirke

**Ergebnis: nichts gefunden.** Gezielte npm-Suche ("koeln", "cologne
geojson", "veedel", "stadtteile koeln", "cologne districts") und PyPI-Suche
("koeln", "cologne") ergaben nur:
- `koeln@0.3.1` (PyPI) — async API-Client für Köln-Open-Data-Endpunkte,
  **kein** gebündelter Datensatz, ruft zur Laufzeit die städtische API auf
  (laut Aufgabenstellung gesperrt) — verworfen.
- `cologne-phonetic@1.1.1` (npm) — Kölner-Phonetik-Algorithmus (Textvergleich),
  keine Geodaten — irrelevant.

Es gibt **keine** npm-/PyPI-verfügbaren Umrisse der 86 Kölner Stadtteile oder
9 Stadtbezirke, und auch keine reine Köln-Stadtgrenze/Rhein-Linie als
GeoJSON/SVG in einem Paket. Muss extern beschafft oder von Hand nachgebaut
werden (außerhalb dieser Netzwerk-Policy).

---

## Nicht verwendete Kandidaten (zur Dokumentation)

| Paket | Registry | Grund für Verwerfung |
|---|---|---|
| `kennzeichen@0.1.6` | npm | nur Format-Validierung, keine Ortsnamen |
| `german-postal-codes@2.0.0` | npm | nur PLZ-Liste, keine Koordinaten/Zuordnung |
| `deutschland@0.4.2` | PyPI | Geo-Modul lädt zur Laufzeit von gesperrtem Host nach |
| `@polymech/gadm@1.0.0` | npm | Geometrie kommt vom GADM-CDN, unklare/keine Lizenz |
| `sane-topojson@…` | npm | nur Welt-Grobauflösung (Natural Earth), keine Kreise |
| `koeln@0.3.1` | PyPI | API-Client, kein Datenbundle |

---

## Dateien in diesem Ordner

| Datei | Quelle | Größe |
|---|---|---|
| `kfz-kennzeichen-prefixes.json` | german-license-plate-prefixes@2.18.0 | 14.7 KB |
| `kfz-kennzeichen-prefixes.README.md` | dito (Original-Readme) | 1.2 KB |
| `landkreise-deutschland-districts.json` | landkreise-deutschland@3.0.0 | 99.9 KB |
| `landkreise-deutschland-districts.csv` | dito | 27.6 KB |
| `bundeslaender-svg-maps-germany.svg` | @svg-maps/germany@2.0.0 | 66.2 KB |
| `bundeslaender-svg-maps-germany.paths.js` | dito (JS-Modul, gleiche Pfade) | 66 KB |
