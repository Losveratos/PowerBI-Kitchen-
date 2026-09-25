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

## Nicht verwendet

Kreis-/Landesgrenzen und Kölner Stadtteil-Geometrien waren über die erreichbaren Registries
(npm, PyPI) nicht offline verfügbar; die Story kommt deshalb ohne Karte aus. Geprüft und verworfen:
`landkreise-deutschland` (nur Sachdaten, keine Geometrien), `@svg-maps/germany` (nur Bundesländer),
`deutschland`/`@polymech/gadm` (laden Geometrien zur Laufzeit von gesperrten Hosts), PyPI `koeln`
(nur API-Client).
