# Köln blitzt. 445.660 Mal.

> Ein Jahr Tempoverstöße der Stadt Köln (2025), jeder einzelne mit Uhrzeit, Ort und Herkunft: wann Köln rast, wo die Stadt hinschaut — und wie schnell ein neuer Blitzer seltener auslöst.

- **Quelle:** https://datenwgknowledgekitchen.com/koelner-raser-story.html
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Extrahiert aus:** `koelner-raser-story.html` · Stand 2026-09-25
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/koelner-raser-story.html — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwuenscht.
- **Hinweis fuer Agenten:** Diese Markdown-Fassung enthaelt den Fliesstext der Seite. Die animierten Charts und der durchsuchbare Raser-Atlas (alle 655 Messstellen) sind nur in der HTML-Fassung nutzbar; die zentralen Zahlen stehen hier als Tabelle.
- **Datengrundlage:** Stadt Koeln, Offene Daten Koeln, „Geschwindigkeitsueberwachung Koeln ab 2025“ + Standorttabellen sloc-01/02/04/11, Datenlizenz Deutschland – Zero – 2.0; 451.676 Zeilen, davon 445.660 Tempofaelle
- **Reproduzierbarkeit:** `koeln-raser/scripts/build_db.py` (SQLite) → `build_story_data.py` (SQL-Kennzahlen) → `build_story_html.py`. Jede Zahl stammt aus `koeln-raser/data/story_data.json`.

---

## Prolog · Alle 71 Sekunden

So oft hat es 2025 in Köln im Schnitt geblitzt — Tag und Nacht, das ganze Jahr. Die Stadt veröffentlicht jede Verwarnung und jedes Bußgeldverfahren als Zeile: Datum, Uhrzeit, gemessene Geschwindigkeit, vorwerfbare Überschreitung, Fahrzeugart, Messstelle und das Kürzel des Zulassungsbezirks.

Wichtigste Regel: **Ein Blitz zählt nicht die Raser. Er zählt die Raser, die dort vorbeikommen, wo die Stadt gerade misst.**

## Akt 1 · Der Takt

- Feste Anlagen (43 Standorte): **231.143** Fälle, rund um die Uhr, an allen 365 Tagen. Samstags und sonntags lösen sie **45 % öfter** aus als montags. Hellster Tag: 20. Dezember (1.562 Fälle), zwei Tage nach dem Start zweier neuer Messstellen an der A 4, Anschluss Eifeltor.
- Mobile Messung (600 Standorte): **203.278** Fälle, stark unter der Woche, sonntags nur gut halb so viel wie mittwochs. An **18 Tagen** keine mobile Messung: Neujahr, 4./5. Januar, Karnevalswochenende samt Rosenmontag (1.–3. März) und 20.–31. Dezember.
- Fazit: Die Fallzahl misst mindestens so sehr den Messaufwand wie das Fahrverhalten. Belastbar sind Anteile und die festen Anlagen.

## Akt 2 · Die Uhr (nur feste Anlagen)

| Stunde | Fälle | Anteil ≥ 21 km/h zu viel | Anteil ≥ 31 km/h zu viel |
|---|---:|---:|---:|
| 03 Uhr | 3.628 | 8,0 % | 2,5 % |
| 11 Uhr | 13.595 | 2,5 % | 0,35 % |
| 14 Uhr | 11.992 | 1,7 % | 0,12 % |

Um 3 Uhr nachts ist der Anteil schwerer Verstöße rund fünfmal (ab 21 km/h, Punkte) bis zwanzigmal (ab 31 km/h, innerorts droht ein Regelfahrverbot) so hoch wie um 14 Uhr. Nur Tempo ≤ 50 gerechnet: 0,09 % gegen 1,2 %.

## Akt 3 · Die Orte (feste Anlagen)

| Anlage | Limit | Fälle 2025 | Fälle pro Betriebstag | Bußgeld-Schätzung |
|---|---:|---:|---:|---:|
| B 55a · Ausfahrt Frankfurter Str. → Olpe (ab 14.08.) | 80 | 25.612 | 186,9 | ≈ 1,08 Mio. € |
| Innere Kanalstraße · Lat. 177 → Niehler Str. (regulär ab 15.05.) | 50 | 24.963 | 107,6 | ≈ 1,11 Mio. € |
| Kaiser-Wilhelm-Ring 17–21 → Christophstr. | 30 | 16.376 | 45,0 | ≈ 0,57 Mio. € |
| A 4 · AS Köln-Eifeltor → Olpe (ab 18.12.) | 60 | 1.914 | 212,7 | — |

Bußgeld nach Katalog für alle Messstellen zusammen: **≈ 17,8 Mio. €** (grobe Schätzung: Pkw-Sätze, innerorts bei Limit ≤ 50 angenommen; ohne Gebühren, Einsprüche, Lkw-Sätze).

## Akt 4 · Die Lernkurve

| | erste Woche | nach 15 Wochen | Veränderung |
|---|---:|---:|---:|
| B 55a gesamt (Fälle pro Tag) | 548 | 114 | −79 % |
| davon K-Kennzeichen | 247 | 38 | −85 % |
| davon andere | 300 | 76 | −75 % |

Danach pendelt sich die B 55a bei etwa einem Viertel ein. Innere Kanalstraße: drei Monate fast unverändert, dann ein steiler Abfall von 213 auf rund 60 Fälle am Tag nach einem halben Jahr (−72 %). Dellbrücker Hauptstraße: −56 %. Verkehrsmengen liegen nicht vor; ein Rückgang dieser Größe ist aber ein starkes Indiz, dass dort langsamer gefahren wird. Das Kennzeichen nennt den Halter, nicht den Fahrer.

## Akt 5 · Die Ortskundigen

| Messart | Köln (K) | Umland (BM, GL, SU, NE, LEV) | übriges Deutschland | ohne/sonstige |
|---|---:|---:|---:|---:|
| alle | 48,5 % | 19,6 % | 28,8 % | 3,0 % |
| mobil | 60,8 % | 18,1 % | 19,9 % | 1,3 % |
| fest | 37,5 % | 20,9 % | 36,9 % | 4,6 % |

Auch ohne B 55a und A 4 bleibt der Köln-Anteil an festen Anlagen bei knapp 38 %. Mögliche Erklärung: Wer von hier ist, kennt die festen Blitzer. Häufigste Kürzel nach K: BM, GL, SU; an der B 55a Richtung Olpe nach K: GL, dann GM. 648 verschiedene deutsche Kennzeichen-Kürzel.

## Akt 6 · Wie schnell?

- Häufigster Wert: **6 km/h** zu viel (nach Toleranzabzug); darunter praktisch keine Fälle — bei Tempo 30 also erst ab 39 km/h gemessen. 68 % der Fälle liegen bei 6–10 km/h.
- 96,9 % bleiben bei höchstens 20 km/h (keine Punkte), 90,2 % bei höchstens 15 km/h (Verwarnungsgeld). 13.615 Fälle (3,1 %) bringen Punkte.
- 1.697 Fälle erreichen Fahrverbots-Tempo (innerorts ab 31, außerorts ab 41 km/h zu viel). 61,5 % aller Fälle passieren bei Tempolimit 30.

## Epilog · Die Ausreißer

| Datum | Uhrzeit | Ort | Limit | gemessen | zu viel |
|---|---|---|---:|---:|---:|
| 30.04.2025 | 19:20 | Raderthalgürtel | 50 | 203 | 146 |
| 17.08.2025 | 06:20 | B 55a, Ausfahrt Frankfurter Str. | 80 | 191 | 105 |
| 18.09.2025 | 03:38 | Aachener Straße 327-285 | 50 | 154 | 99 |
| 04.11.2025 | 23:10 | Sachsenring | 30 | 133 | 99 |

## Grenzen

Messaufwand ≠ Raserei · keine Verkehrsmengen im Nenner · Kennzeichen = Halter · Tempolimit aus Messwert, Überschreitung und Toleranz abgeleitet (für 98,7 % der Zeilen plausibel) · Bußgeld = Schätzung · Dienststellen-Codes (S-01 fest, S-02 mobil, K-04 Kreuzung) aus dem Verhalten der Daten gedeutet, nicht dokumentiert.
