# LinkedIn-Post · Köln blitzt, Raser-Atlas 2025

> **Fassungen zum Kopieren.** Hauptfassung mit Karussell, Kurzfassung mit Einzelbild.
>
> **Publish-Checkliste:**
> 1. Branch mergen und prüfen, dass live ist: `https://datenwgknowledgekitchen.com/koelner-raser-story.html` und `…/koelner-raser-post.html`.
> 2. Karussell anhängen: `blog/assets/raser-karussell.pdf` als Dokument hochladen, Titel „Köln blitzt: Was 445.483 Blitzer-Fälle zeigen“. Alternativ nur `blog/assets/raser-2-lernkurve.png` als Bild.
> 3. Links stehen im Post. Wer sie lieber im ersten Kommentar hat: Link-Zeilen aus dem Post nehmen und den Kommentar-Baustein unten nutzen.
> 4. Keine Namen von Personen, keine Kennzeichen einzelner Fälle.

---

## DE · Hauptfassung (mit Karussell)

14. August 2025: An der B 55a in Köln geht ein neuer Blitzer in Betrieb. 443 Auslösungen am Tag. Drei Monate später: 127.

Die Stadt Köln stellt jede Verwarnung und jedes Bußgeldverfahren ihrer Geschwindigkeitsüberwachung als offene Daten ins Netz. 445.483 Tempofälle im Jahr 2025, im Schnitt alle 71 Sekunden einer. Wir haben die Datei in SQLite geladen und befragt. Drei Befunde:

1. Ein neuer Blitzer wirkt, und zwar schnell. −71 % an der B 55a, während 27 Anlagen im Bestand im selben Zeitraum fast gleich bleiben. Auch der Anteil schwerer Fälle sinkt, von 13,0 auf 5,9 %.

2. Nachts wird aus „etwas zu schnell“ „deutlich zu schnell“. An den festen Anlagen ist der Anteil ab 31 km/h zu viel nachts 4,1-mal so hoch wie am Tag, je Anlage bereinigt.

3. Die große Masse ist knapp dran. 97 % der Fälle liegen höchstens 20 km/h drüber, ohne Punkt in Flensburg. Häufigster Wert: 6 km/h.

Und eine Frage an die Stadt: Mobil wird zu 90 % tagsüber und zu 80 % werktags gemessen. Die schweren Verstöße passieren aber vor allem nachts.

Was die Daten nicht können: Verkehrsmengen, Unfälle, Fahrer. Das Kennzeichen nennt den Halter.

Für die Daten-Leute: Die Standorttabelle kennt keine Koordinaten, nur Einträge wie „Innere Kanalstr. zw. Lat. 177-176“. Der Geocoder machte aus der Hauptstraße 55 in Widdersdorf die Kalker Hauptstraße 55. Also: Plausibilitätsprüfung, zweite Meinung aus OpenStreetMap, 26 Stellen lieber weggelassen als falsch gezeigt. Und ein Review aus sieben Perspektiven, das uns noch einen Rechenfehler gezeigt hat.

Die ganze Story mit Karte „Köln bei Nacht“, 24-Stunden-Zeitraffer und Atlas aller 655 Messstellen:
https://datenwgknowledgekitchen.com/koelner-raser-story.html

Hintergrund und Methode:
https://datenwgknowledgekitchen.com/koelner-raser-post.html

#OpenData #Datenjournalismus #Köln #DataViz #SQLite #OpenStreetMap #DatenWG

**Kommentar-Baustein:**
Daten: Stadt Köln, Offene Daten Köln („Geschwindigkeitsüberwachung Köln ab 2025“, dl-de/zero-2-0). Karte © OpenStreetMap-Mitwirkende, Geocodierung Geoapify. Pipeline von den Rohdaten bis zum HTML liegt offen im Repo (Ordner koeln-raser). Wer seinen Blitzer sucht: Atlas unten in der Story, ein Klick zeigt die Stelle auf der Karte.

---

## DE · Kurzfassung (Einzelbild Lernkurve)

Ein neuer Blitzer an der B 55a in Köln: 443 Auslösungen am Tag in den ersten zwei Wochen, 127 drei Monate später. Anlagen im Bestand bleiben im selben Zeitraum fast gleich, die Jahreszeit erklärt es also nicht.

Das und mehr aus einem Jahr offener Blitzerdaten der Stadt Köln: 445.483 Tempofälle, Nächte mit deutlich mehr schweren Fällen, 97 % ohne Punkt. Mit Karte und Atlas aller 655 Messstellen:
https://datenwgknowledgekitchen.com/koelner-raser-story.html

#OpenData #Köln #DataViz #DatenWG

---

## Alternativtexte für das Karussell

1. **Karte:** Dunkle Karte von Köln mit leuchtendem Rhein und Hauptstraßen. Orange Kreise für 43 feste Blitzer, Größe nach Fällen, die größten an der Inneren Kanalstraße, am Kaiser-Wilhelm-Ring und an der B 55a. Blaue Punkte für 574 mobile Messstellen über die ganze Stadt.
2. **Lernkurve:** Liniendiagramm. Die Fälle pro Tag am neuen Blitzer B 55a fallen von 443 in den ersten zwei Wochen auf 127 in den Wochen 12 bis 19 (−71 %). Eine gepunktete Vergleichslinie für 27 Anlagen im Bestand bleibt fast gleich (−5 %).
3. **Nacht und Tag:** Balkendiagramm nach Uhrzeit. Anteil der Geblitzten mit 21 km/h und mehr zu viel: 8,0 % um 3 Uhr, 1,7 % um 14 Uhr. Über die ganze Nacht je Anlage bereinigt 2,3-mal, ab 31 km/h 4,1-mal so hoch.
4. **97 %:** 97 % der 445.483 Fälle liegen höchstens 20 km/h über dem Limit. Histogramm der Überschreitung mit Gipfel bei 6 km/h. 1.697 Fälle mit Fahrverbots-Tempo, Rekord 203 km/h bei Tempo 50.
5. **Grenzen:** Was die Daten nicht zeigen: keine Verkehrsmengen, keine Unfälle, Kennzeichen nennt den Halter, nur Messungen der Stadt. Frage an die Stadt: Mobil wird zu 90 % tagsüber und 80 % werktags gemessen, schwere Verstöße passieren vor allem nachts.
