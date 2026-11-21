# Ein Jahr in Bewegung: animierte Mobilitäts-Karte aus deinen E-Mail-Belegen

> Anleitung zum Beitrag [mobilitaets-karte-post.html](../mobilitaets-karte-post.html) · https://datenwgknowledgekitchen.com/mobilitaets-karte-post.html · Daten-WG Knowledge Kitchen, Stand November 2026

Eine Anleitung zum Nachbauen: Aus Buchungsbestätigungen und Belegen im Postfach wird eine dunkle, animierte Globus-Karte. Sie zeigt Tag für Tag jeden Flug, jede Bahnfahrt, jedes Taxi und jeden E-Scooter. Dazu zählt sie die Kilometer je Verkehrsmittel hoch, ebenso besuchte Orte, Länder und Hotelnächte. Am Ende hast du eine interaktive HTML-Seite und ein 9:16-Video für Instagram-Reels oder Stories.

> Gebaut mit Claude: Postfach auswerten, Daten bereinigen, Karte und Video bauen. Du kannst alles auch selbst machen, die Schritte unten funktionieren mit jedem Werkzeug.

---

## 1. Was du am Ende hast

| Ergebnis | Format | Wofür |
|---|---|---|
| Animierte Karte | eine HTML-Datei, läuft im Browser | anschauen, scrubben, Zeitraum wählen, Format 9:16 / 1:1 / 16:9 |
| Reel | MP4, 1080 × 1920, ca. 50 s | Instagram, TikTok, Stories |
| Datensatz | `mobility.json` | Grundlage für alles, wiederverwendbar |

**Look „Dark Kitchen“:** Anthrazit statt Schwarz, matte Körnung und eine Vignette. Jedes Verkehrsmittel hat eine Akzentfarbe aus Küchen-Materialien:

| Modus | Farbe | Hex |
|---|---|---|
| Flug | Messing | `#d4ad6a` |
| Bahn | Kupfer | `#cf6a3f` |
| Taxi | Marmorweiß | `#e8e2d6` |
| E-Scooter | Salbei | `#97ad8d` |
| Hintergrund | Anthrazit | `#121110` |
| Land / besuchte Länder | Walnuss-dunkel | `#2a2622` / `#3b3229` |

Schrift: **Barlow Condensed** für Zahlen und Datum (wirkt wie eine Bahnhofs-Anzeigetafel), **Barlow** für Text. Beide sind frei (SIL Open Font License). Für eine Website am besten selbst hosten, statt sie bei jedem Aufruf vom Google-Server zu laden.

---

## 2. Daten sammeln (aus dem Postfach)

Suche im Postfach nach diesen Absendern bzw. Betreffs für den gewünschten Zeitraum:

| Quelle | Suche (Gmail-Syntax) | Was du brauchst |
|---|---|---|
| Hotels | `from:booking.com subject:bestätigt`, `from:airbnb.com Buchung bestätigt` | Ort, Land, Check-in, Check-out, Nächte |
| Flüge | `subject:(Buchungsbestätigung OR Reiseplan OR itinerary)` von Airlines und Portalen | Datum, Abflug- und Zielflughafen (IATA-Code), Umsteigeorte |
| Taxi | `from:uber.com subject:Fahrt`, `from:free-now.com` | Datum, Uhrzeit, Betrag, Stadt |
| E-Scooter | `from:receipts@bolt.eu`, PayPal-Belege an Voi und LimeBike | Datum, Uhrzeit, Betrag |

Tipps:
- **Stornos herausfiltern.** Bei geänderten Buchungen nur den letzten Stand nehmen.
- **Nicht genutzte Tickets** markieren (z. B. annullierte Flüge). Sie zählen keine Kilometer.
- **Scooter über PayPal:** Eine PayPal-Zahlung entspricht meist einer Fahrt. Monatsabos (z. B. LimePrime 5,99 €) als „Pass“ markieren, sie bekommen keine km.
- **Nicht doppelt zählen:** Wenn ein Anbieter eigene Belege schickt (Bolt) und zusätzlich über PayPal abbucht, nur eine der beiden Quellen nehmen.
- Hinweise wie „Bankkonto nicht ausreichend gedeckt“ sind keine Zahlungen.

---

## 3. Das Datenmodell: `mobility.json`

```json
{
  "home": "Köln",
  "start": "2026-01-01",
  "ende": "2026-11-21",
  "legs": [
    {"datum": "2026-03-08", "mode": "Flug", "von": "Düsseldorf", "nach": "Singapur",
     "path": [[6.77, 51.29], [2.55, 49.01], [103.99, 1.36]], "km": 11117,
     "land_von": "Deutschland", "land_nach": "Singapur", "hinweis": "via Paris"}
  ],
  "visits": [
    {"datum": "2026-03-11", "bis": "2026-03-15", "ort": "Taipeh", "land": "Taiwan",
     "lat": 25.03, "lon": 121.57, "naechte": 4}
  ],
  "rides": [
    {"datum": "2026-03-13", "zeit": "14:21", "mode": "Taxi", "anbieter": "Uber",
     "ort": "Taipeh", "land": "Taiwan", "lat": 25.03, "lon": 121.57, "km": 4.0, "eur": 3.99}
  ]
}
```

- `legs` sind Strecken **zwischen** Orten (Flug, Bahn). `path` ist eine Liste von `[Längengrad, Breitengrad]`, Umsteigeorte stehen dazwischen.
- `visits` sind Aufenthalte (Hotelnächte). Daraus kommen „Orte“, „Länder“ und „Hotelnächte“.
- `rides` sind kurze Fahrten **in** einer Stadt (Taxi, Scooter). Sie erscheinen als kurzes Aufleuchten am Ort.

Koordinaten für Städte und Flughäfen trägst du einmal in eine Tabelle ein (z. B. aus Wikipedia oder OpenStreetMap).

---

## 4. Kilometer berechnen

**Flug:** Großkreis-Entfernung (Haversine) über alle Punkte im `path`, inklusive Umsteigen.

```python
import math
def haversine(a, b):  # a, b = (lat, lon)
    R = 6371.0
    la1, lo1, la2, lo2 = map(math.radians, (*a, *b))
    h = math.sin((la2-la1)/2)**2 + math.cos(la1)*math.cos(la2)*math.sin((lo2-lo1)/2)**2
    return 2 * R * math.asin(math.sqrt(h))
```

**Bahn (geschätzt):** Die meisten Bahnfahrten haben keinen Beleg (z. B. mit BahnCard 100). Darum werden sie aus der Reihenfolge der Aufenthalte abgeleitet:

1. Start an der Basis (Wohnort).
2. Geht ein Hotelaufenthalt los und du bist woanders, gibt es eine Bahnfahrt dorthin.
3. Nach dem Check-out in Europa geht es nach Hause, außer der nächste Aufenthalt beginnt am selben Tag (dann direkt weiter).
4. Vor einem Flug gibt es eine Fahrt zum Abflughafen, nach der Landung nach Hause, wenn danach mindestens 2 Tage nichts kommt.
5. Wird der Zielort ohnehin per Flug erreicht (Flug innerhalb von 2 Tagen), gibt es keine zusätzliche Bahnfahrt.
6. Entfernung = Luftlinie × **1,25** (Schienenumweg). Wege unter 15 km und Flughafen-Transfers in derselben Stadt fallen weg.

**Taxi (geschätzt):** km = Fahrpreis ÷ Preis je km im Land, zum Beispiel:

| Land | € je km |
|---|---|
| Deutschland, Belgien | 2,80 |
| Spanien | 1,80 |
| Ungarn | 1,40 |
| Hongkong | 1,30 |
| Tschechien, Singapur | 1,20 |
| Südkorea | 1,10 |
| Taiwan | 1,00 |
| China | 0,60 |
| Vietnam | 0,50 |

Wo ein Taxi stattfand, ergibt sich aus dem Datum: Es ist der Ort, an dem du laut Reiseverlauf an dem Tag warst.

**E-Scooter (geschätzt):** etwa 0,8 km je Euro Fahrpreis, höchstens 12 km je Fahrt. Pässe und Abos zählen keine km.

> Wichtig für die Ehrlichkeit: Bahn, Taxi und Scooter immer mit „geschätzt“ beschriften. Exakt sind nur die Flüge.

---

## 5. Die Karte bauen

**Zutaten:** [d3](https://d3js.org) (Version 7.9.0) für Projektion und Zeichnen, [topojson-client](https://github.com/topojson/topojson-client) und die Weltkarte `countries-50m.json` aus dem npm-Paket [world-atlas](https://github.com/topojson/world-atlas). Gezeichnet wird auf ein `<canvas>`. Das ist schnell und lässt sich direkt als Video speichern.

### 5.1 Globus statt flacher Karte
`d3.geoOrthographic()` mit `clipAngle(90)`. Bei kurzen Strecken ist die Kamera nah dran, dann wirkt der Globus wie eine flache Karte. Bei Langstreckenflügen zoomt sie heraus und man sieht die Erdkrümmung. Linien werden als Großkreise gezeichnet (`d3.geoInterpolate`). So entstehen die typischen Flugbögen.

### 5.2 Zeit-Verzerrung (der Trick für ein gutes Tempo)
Ein Jahr linear abzuspielen ist langweilig, weil an den meisten Tagen nichts passiert. Darum bekommt jeder Block eine eigene Dauer:

| Block | Dauer bei 1× |
|---|---|
| Tag ohne Reise | 0,032 s |
| Bahnfahrt | 0,12 s Kamera + 0,26 s Linie + 0,08 s Pause |
| Flug | 0,45 s Kamera + 0,55–1,45 s Linie (je nach Länge) + 0,35 s Pause |
| Hook am Anfang | 1,3 s Endbild + 1,5 s Zurückspulen |
| Abspann | 3,2 s, Kamera zoomt auf alle Strecken |

So sind elf Monate rund 60 Sekunden lang. Für das Reel mit Tempo 1,3 rendern, dann sind es etwa 50 Sekunden.

### 5.3 Kamera
Für jede Strecke werden Kamera-Stationen angelegt: vorher (aktueller Ort), Strecke im Bild (Mittelpunkt + passender Zoom), danach (Zielort). Dazwischen wird weich interpoliert, die Mitte über `d3.geoInterpolate`, der Zoom logarithmisch, mit Easing `easeInOutCubic`. Zoom als „sichtbarer Winkel“: `scale = Radius / sin(winkel)`.

### 5.4 Ebenen pro Frame (von hinten nach vorn)
1. Hintergrund `#121110`
2. Globus mit leichtem Verlauf, Gradnetz sehr schwach
3. Landflächen, bereits besuchte Länder etwas heller
4. Ländergrenzen (`topojson.mesh`)
5. Alte Strecken als Spuren (Deckkraft 40–50 %)
6. Besuchte Orte als Punkte
7. Taxi- und Scooter-Fahrten als kurz aufleuchtende Ringe
8. Aktive Strecke: Linie mit Glow (`shadowBlur`) und hellem Kopf-Punkt
9. Vignette + Körnung (kleines Rauschmuster mit 7 % Deckkraft, gekachelt)
10. Anzeige: Datum, „Flug Frankfurt → Prag“, km gesamt, km je Modus, „× um die Erde“ (Gesamt-km ÷ 40.075), Orte, Länder, Hotelnächte

### 5.5 Drei Extras, die das Reel tragen
- **Hook:** Das Video startet 1,3 s mit dem Endbild (alle Strecken, Gesamt-km), spult dann in 1,5 s zurück auf den ersten Tag. Technisch: dieselbe Render-Funktion, nur mit rückwärts laufender Zeit und fester Übersichts-Kamera.
- **Länder-Stempel:** Beim ersten Betreten eines Landes erscheint 1,7 s lang ein Stempel („Land Nr. 4 · TAIWAN · 11. März“). Das Heimatland bekommt keinen Stempel, zählt aber mit.
- **CO₂-Zähler (grob):** km × Durchschnittswert des Umweltbundesamts je Personenkilometer: Flug 290 g (Inlandsflug 2024, inkl. Nicht-CO₂-Effekte), Bahn-Fernverkehr 26 g, Taxi wie Pkw 164 g. Langstreckenflüge liegen je km eher darunter, der Wert ist also eine Obergrenze. Immer als „≈“ beschriften.

Dazu kleine Design-Details: Sterne und ein Messing-Schimmer um den Globus, leuchtende Punkte für besuchte Städte, eine dünne Jahres-Fortschrittsleiste am unteren Rand.

### 5.6 Formate
Zeichne in festen Designmaßen (1080 × 1920 für Story, 1080 × 1080, 1920 × 1080) und skaliere das Canvas nur. Dann sieht jedes Format überall gleich aus und das Video ist pixelgenau.

---

## 6. Video fürs Reel erzeugen

Am saubersten ist es, **Frame für Frame zu rendern** statt den Bildschirm aufzunehmen. Dann gibt es keine Ruckler.

1. Seite in Headless Chrome öffnen (z. B. mit Playwright).
2. Für jeden Frame `render(t)` aufrufen und das Canvas als JPEG speichern (`canvas.toDataURL('image/jpeg', 0.92)`).
3. Mit ffmpeg zusammensetzen:

```bash
ffmpeg -framerate 30 -i frames/%05d.jpg \
  -vf "tpad=stop_mode=clone:stop_duration=2" \
  -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -movflags +faststart reel.mp4
```

`tpad` hält das letzte Bild 2 Sekunden lang, gut für den Schlussblick. Musik fügst du am besten direkt in Instagram hinzu.

**Ohne Programmieren:** Seite im Browser öffnen, „Aufnahme-Modus“ klicken und mit der Bildschirmaufnahme vom Handy oder Mac mitschneiden.

---

## 7. Prompt-Vorlagen für Claude

**Schritt 1 – Daten:**
> Werte mein Gmail für 2026 aus: alle Hotelbuchungen (Booking, Airbnb), Flüge, Uber- und Freenow-Fahrten und E-Scooter-Zahlungen (Bolt, Voi, Lime, auch über PayPal). Stornos raus, nichts doppelt zählen, Fremdwährungen in Euro. Bau mir daraus ein Dashboard.

**Schritt 2 – Bewegungen:**
> Leite daraus eine Reiseroute ab: Basis ist [Stadt]. Flüge exakt mit Großkreis-km, Bahnfahrten zwischen den Hotels geschätzt (Luftlinie × 1,25), Taxi- und Scooter-km aus dem Fahrpreis geschätzt. Speichere alles als `mobility.json` mit legs, visits und rides.

**Schritt 3 – Karte und Reel:**
> Bau daraus eine animierte Globus-Karte im Dark-Kitchen-Look (Anthrazit, Messing, Kupfer, Marmor, Salbei). Die Kamera folgt jeder Strecke, Zähler zeigen km je Verkehrsmittel, Orte und Länder. Ich will den Zeitraum wählen und zwischen 9:16, 1:1 und 16:9 umschalten können. Render zusätzlich ein 9:16-MP4 fürs Reel.

---

## 8. Auswerten in Power BI

`mobility.json` ist im Kern ein kleines Sternschema:

| Tabelle | Rolle | Felder |
|---|---|---|
| `legs` | Fakten: Strecken | Datum, Verkehrsmittel, von, nach, km |
| `visits` | Fakten: Aufenthalte | Datum, bis, Ort, Land, Nächte |
| `rides` | Fakten: Taxi und Scooter | Datum, Uhrzeit, Verkehrsmittel, Ort, km, Euro |
| Kalender, Ort, Land, Verkehrsmittel | Dimensionen | aus den Faktentabellen abgeleitet |

Per Power Query laden, eine Kalendertabelle ergänzen, und Measures wie Kilometer je Verkehrsmittel, Hotelnächte je Land oder CO₂ je Monat sind schnell gebaut. Das Reel ist der Hingucker, der Bericht der Blick ins Detail.

---

## 9. Datenschutz

Eine solche Karte ist ein ziemlich genaues Bewegungsprofil. Vor dem Posten prüfen:
- **Wohnort:** Die Basis-Stadt ist sichtbar. Wenn du das nicht willst, setz die Basis auf eine größere Stadt in der Nähe oder lass die Heimfahrten weg.
- **Zeitverzug:** Erst posten, wenn du schon zurück bist, und keine laufenden Reisen zeigen.
- **Arbeit:** Dienstreisen können Kunden oder Projekte verraten. Kleine Orte zu Regionen zusammenfassen („Oberpfalz“, „Emsland“) und mit den Koordinaten der Region weiterrechnen; die Kilometer bleiben gleich. Im HUD das Datum nur als Monat zeigen, dann lässt sich kein einzelner Besuch mehr zuordnen.
