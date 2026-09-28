# Köln blitzt. 445.483 Mal.

> Ein Jahr Tempoverstöße der Stadt Köln (2025), jeder einzelne mit Uhrzeit, Ort und Herkunft: wann und wo in Köln geblitzt wird, wer ins Netz geht und wie schnell ein neuer Blitzer wirkt.

- **Quelle:** https://datenwgknowledgekitchen.com/koelner-raser-story.html
- **Blogbeitrag:** https://datenwgknowledgekitchen.com/koelner-raser-post.html
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Extrahiert aus:** `koelner-raser-story.html` · Version 3.1 (Karten-Akt, überarbeitet nach Peer-Review) · Stand 2026-09-26
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/koelner-raser-story.html, Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwuenscht.
- **Hinweis fuer Agenten:** Diese Markdown-Fassung enthaelt die Befunde der Seite. Die animierten Charts, die Karte und der durchsuchbare Raser-Atlas (alle 655 Messstellen) sind nur in der HTML-Fassung nutzbar; die zentralen Zahlen stehen hier als Tabelle.
- **Datengrundlage:** Stadt Koeln, Offene Daten Koeln, „Geschwindigkeitsueberwachung Koeln ab 2025“ + Standorttabellen sloc-01/02/04/11, Datenlizenz Deutschland – Zero – 2.0; 451.676 Zeilen, davon 445.483 Tempofaelle (ohne Rotlichtfaelle der Kreuzungsanlagen). Nur die staedtische Ueberwachung, keine Polizeimessungen. Karte: © OpenStreetMap-Mitwirkende (ODbL), Geocodierung Geoapify
- **Reproduzierbarkeit:** `koeln-raser/scripts/build_db.py` (SQLite) → `build_story_data.py` (SQL-Kennzahlen + Karte aus `data/geo/`) → `build_story_html.py`; `check_numbers.py` prueft die Textzahlen gegen die Daten. Geodaten einmalig lokal: `fetch_geo.py` → `check_geo.py`. Jede Zahl stammt aus `koeln-raser/data/story_data.json`.

---

## Prolog · Alle 71 Sekunden

So oft hat es 2025 in Köln im Schnitt geblitzt, Tag und Nacht, das ganze Jahr: 1.221 Fälle am Tag. Die Stadt veröffentlicht jede Verwarnung und jedes Bußgeldverfahren als Zeile: Datum, Uhrzeit, gemessene Geschwindigkeit, vorwerfbare Überschreitung, Fahrzeugart, Messstelle und das Kürzel des Zulassungsbezirks.

Wichtigste Regel: **Ein Blitz zählt nicht die Raser. Er zählt die Raser, die dort vorbeikommen, wo die Stadt gerade misst.**

## Akt 1 · Der Takt

- Feste Anlagen (43 Standorte): **231.143** Fälle, rund um die Uhr, an allen 365 Tagen. Samstags und sonntags lösen sie **45 % öfter** aus als montags (naheliegend: weniger Stau, freiere Fahrt). Hellster Tag: 20. Dezember (1.562 Fälle), zwei Tage nach dem Start zweier neuer Messstellen an der A 4, Anschluss Eifeltor.
- Mobile Messung (600 Standorte): **203.278** Fälle, stark unter der Woche. An **18 Tagen** keine mobile Messung, darunter die komplette Zeit vom 20. bis 31. Dezember.
- Fazit: Die Fallzahl misst mindestens so sehr den Messaufwand wie das Fahrverhalten. Belastbar sind Anteile und die festen Anlagen.

## Akt 2 · Die Uhr (nur feste Anlagen)

| Stunde | Fälle | Anteil ≥ 21 km/h zu viel | Anteil ≥ 31 km/h zu viel |
|---|---:|---:|---:|
| 03 Uhr | 3.628 | 8,0 % | 2,5 % |
| 11 Uhr | 13.595 | 2,5 % | 0,35 % |
| 14 Uhr | 11.992 | 1,7 % | 0,12 % |

Robuster als zwei Einzelstunden: Nacht (22–6 Uhr) gegen Tag (10–18 Uhr), je Anlage bereinigt. Der Anteil ab 21 km/h ist nachts **2,3-mal**, ab 31 km/h **4,1-mal** so hoch. Nur innerorts (Tempo ≤ 50): ab 31 km/h 1,45 % um 3 Uhr gegen 0,10 % um 14 Uhr. In absoluten Zahlen 292 gegen 207 schwere Fälle übers Jahr, nachts aber bei einem Bruchteil des Verkehrs.

## Akt 3 · Die Orte (feste Anlagen)

| Anlage | Limit | Fälle 2025 | Fälle pro Betriebstag |
|---|---:|---:|---:|
| B 55a · Ausfahrt Frankfurter Str. → Olpe (ab 14.08.) | 80 | 25.612 | 186,9 |
| Innere Kanalstraße · Höhe Lentstraße → Niehler Str. (regulär ab 15.05.) | 50 | 24.963 | 107,6 |
| Kaiser-Wilhelm-Ring 17–21 → Christophstr. | 30 | 16.376 | 45,0 |
| A 4 · AS Köln-Eifeltor → Olpe (ab 18.12., nur 9 Tage) | 60 | 1.914 | 212,7 |

Die beiden Spitzenreiter liegen auf derselben Achse (Innere Kanalstraße, Zoobrücke, B 55a), beide in Fahrtrichtung Osten; an der Inneren Kanalstraße stehen sechs Anlagen. Katalogwert aller Fälle: rund **18 Mio. €**, im Schnitt 40 € pro Fall. Das ist keine Einnahme (ohne Gebühren, Rotlicht, Einstellungen, Einsprüche); neun von zehn Fällen sind Verwarnungsgelder.

## Akt 4 · Köln bei Nacht (Karte)

- **Feste Anlagen:** 16 der 43 Anlagen stehen höchstens 3 km vom Dom entfernt und erzeugen 57,8 % aller Fälle fester Anlagen.
- **Mobile Messung:** Messstellen in 78 von 86 Stadtteilen, die meisten in Neustadt/Süd (26), Dellbrück (23) und Mülheim (20).
- **24 Stunden im Zeitraffer:** Um 11 Uhr blitzt es am Durchschnittstag rund 90-mal pro Stunde, mehr als die Hälfte mobil. Um 3 Uhr sind es 13, davon 75 % an festen Anlagen.
- **Wo die Messungen die Schnellsten erwischen:** Anteil der mobilen Fälle mit 21 km/h und mehr zu viel, nur ab 30 solchen Fällen an mindestens 3 Messstellen (46 Stadtteile), in drei Klassen ohne Rangliste. Köln-weit 2,8 %. Oft prägt eine Stelle den Wert: In Merkenich kommen 85 % der schweren Fälle von einer Tempo-10-Strecke, in Eil 94 % von einer Stelle an der Bensberger Straße. Die Werte beschreiben Messstellen, nicht Anwohner.

**Geocodierung:** Die Standorttabellen nennen nur Adressen. Geoapify mit Plausibilitätsprüfung (Straße und Stadtteil müssen passen) plus zweiter Punkt aus OpenStreetMap; alle festen Anlagen und Kreuzungen einzeln geprüft. Von 655 Messstellen: 433 punktgenau (66,1 %), 144 auf Straßenebene bis ±1 km (22,0 %), 52 von Hand verortet (7,9 %), 26 ohne verlässlichen Punkt (7.036 Fälle) weggelassen.

## Akt 5 · Die Lernkurve

| B 55a (Fälle pro Tag) | Woche 0–1 | Woche 12–19 | Veränderung |
|---|---:|---:|---:|
| alle | 443 | 127 | −71 % |
| davon K-Kennzeichen | 201 | 44 | −78 % |
| davon andere | 242 | 82 | −66 % |
| 27 Anlagen im Bestand (Kontrolle) | | | −5 % |

Der Anteil mit 21 km/h und mehr zu viel sinkt an der B 55a von 13,0 % auf 5,9 %. Die Jahreszeit erklärt den Rückgang nicht, die Anlagen im Bestand bleiben stabil. Aber nicht jede neue Anlage wirkt so: Innere Kanalstraße −59 % (größter Teil abrupt Mitte August, Ursache offen), die kleineren neuen Anlagen 2025 zwischen −22 % und +29 %. Was hinter dem Kasten passiert (wieder beschleunigen, ausweichen), zeigen die Daten nicht. Das Kennzeichen nennt den Halter, nicht den Fahrer.

## Akt 6 · Die Ortskundigen

| Messart | Köln (K) | Umland (BM, GL, SU, NE, LEV) | übriges Deutschland | ohne/sonstige |
|---|---:|---:|---:|---:|
| alle | 48,5 % | 19,6 % | 28,8 % | 3,0 % |
| mobil | 60,8 % | 18,1 % | 19,9 % | 1,3 % |
| fest | 37,5 % | 20,9 % | 36,9 % | 4,6 % |

Viel erklärt, wo gemessen wird: feste Anlagen an Hauptachsen mit Einpendlern, mobil vor allem in Wohnstraßen (84 % bei Tempo 30). Dazu eine Hypothese, die zu Akt 5 passt: Einen festen Blitzer kennt, wer von hier ist. 648 verschiedene deutsche Kennzeichen-Kürzel.

## Akt 7 · Wie schnell?

- Häufigster Wert: **6 km/h** zu viel nach Toleranzabzug (20,5 % aller Fälle); darunter praktisch keine Fälle, bei Tempo 30 also erst ab 39 km/h gemessen. Kein Freibrief: Die Schwelle ist Praxis, kein Recht. 68 % der Fälle liegen bei 6–10 km/h.
- **96,9 %** bleiben bei höchstens 20 km/h (keine Punkte), 90,2 % bei höchstens 15 km/h (Verwarnungsgeld). 13.615 Fälle (3,1 %) bringen Punkte.
- 1.697 Fälle erreichen Fahrverbots-Tempo (innerorts ab 31, außerorts ab 41 km/h zu viel); zählt man Tempo 60–80 als innerorts, bis zu 2.307. 61,6 % aller Fälle passieren bei Tempolimit 30.

## Epilog · Die Ausreißer

| Datum | Uhrzeit | Ort | Limit | gemessen | zu viel |
|---|---|---|---:|---:|---:|
| 30.04.2025 | 19:20 | Raderthalgürtel (Vorabend des 1. Mai, Pkw) | 50 | 203 | 146 |
| 17.08.2025 | 06:20 | B 55a, Ausfahrt Frankfurter Str. (drei Tage nach Start) | 80 | 191 | 105 |
| 18.09.2025 | 03:38 | Aachener Straße 327-285 | 50 | 154 | 99 |
| 04.11.2025 | 23:10 | Sachsenring | 30 | 133 | 99 |

## Fazit

Die Summe beschreibt vor allem, wo und wann die Stadt misst. Robust sind die Verhältnisse: nachts deutlich mehr schwere Fälle (2,3- bzw. 4,1-mal, je Anlage bereinigt), ein neuer Blitzer wirkt an der Messstelle (B 55a −71 % bei stabilem Bestand), und 97 % der Fälle liegen höchstens 20 km/h drüber. Eine Frage an die Stadt: Mobil wird zu 90 % tagsüber und zu 80 % werktags gemessen, die schweren Verstöße passieren vor allem nachts.

## Grenzen

Messaufwand ≠ Raserei · keine Verkehrsmengen im Nenner · keine Unfalldaten · nur die Stadt, keine Polizeimessungen · Kennzeichen = Halter · Tempolimit aus Messwert, Überschreitung und Toleranz abgeleitet (stimmt zu 98,2 % mit den Standorttabellen überein) · Bußgeld = Katalogwert, keine Einnahme · Orte teils ungefähr (22 % nur auf Straßenebene, 26 Messstellen ohne Punkt) · Dienststellen-Codes (S-01 fest, S-02 mobil, K-04 Kreuzung) aus dem Verhalten der Daten gedeutet · Presseberichte nannten 451.735 Fälle, Abgrenzung und Datenstand können abweichen.
