# Peer-Review · Raser-Story Version 3 (26.09.2026)

Sieben Gutachten aus unterschiedlichen Rollen, jeweils unabhängig auf Stand v3 (Karten-Akt).
Personas nur als Rollen, keine realen Personen. Ziel: die Story als Blogbeitrag und LinkedIn-Post
tauglich machen, als Mischung aus Zahlen, Story und Hintergrund. Umgesetzt in **Version 3.1**.

## Gutachten (verdichtet)

| Rolle | Note | Kern der Kritik |
|---|---|---|
| Leser einer Boulevardzeitung | 2 | Service fehlt vorne (Top-Blitzer, Preise). Brüche wechseln (Fünftel, Viertel, drei Viertel). „fünfmal so viele“ klingt nach mehr Rasern. „Wo schwer gerast wird“ stellt Vingst an den Pranger. |
| Datenjournalismus | 2− | Eher Datenatlas als Story; mit der Lernkurve aufmachen. −79 % nimmt den Tiefpunkt. Kontrollkurve einzeichnen (eigene Gegenprobe: Bestand bleibt bei Index ≈ 90). A 4 „213 pro Tag“ aus 9 Tagen. „Ortskundige“ ist eine Hypothese. Pressezahlen erklären. |
| Lokalreporter Köln | 2 | Beide Spitzenreiter liegen auf der Achse Innere Kanalstraße, Zoobrücke, B 55a. „Goldgrube“ bedient die Abzocke-Debatte. Polizei-Messungen fehlen im Prolog. Rekord am Vorabend des 1. Mai; Platz zwei drei Tage nach Start. Sechs Anlagen an der Inneren Kanalstraße. |
| Verkehrsforschung | 2,5 | Lernkurve trägt (Anteil ≥ 21 km/h an der B 55a 14 % → 5 %). Aber alle neuen Anlagen zeigen, kleine liegen bei −20 % bis +13 %. Kontrollreihe einzeichnen. Känguru- und Ausweicheffekt nennen. 6 km/h ist die Auslöseschwelle. Stadtteilkarte ohne Ranking. |
| Kommunalpolitik | 2 | Fair, aber drei Stellen liefern Abzocke-Munition (Goldgrube, Euro-Ranking, „Wo schwer gerast wird“). „Wann Köln rast“ widerspricht der eigenen Regel. Die politische Frage: mobil vor allem tagsüber, schwere Verstöße nachts. |
| Datenexpertise | 2 | 177 Kreuzungszeilen mit 0 km/h Überschreitung zählen als Tempofall. Limit gegen Standorttabelle prüfbar (98 %, Ausreißer Militärringstraße). Doku widersprüchlich (47/59, 5.911/5.905). Fest eingetragene Zahlen per Skript prüfen. Atlas zeigt bei n ≤ 3 Einzelfälle. Lizenzhinweise (CC BY, ODbL, Geoapify). |
| Statistik | 2− | 3 Uhr gegen 14 Uhr sind Extremstunden; Nacht gegen Tag je Anlage bereinigt: 2,3× (≥ 21), 4,1× (≥ 31). Lernkurve mit Woche 0–1 gegen 12–19: −71 %. Stadtteile: Ossendorf 0,3 % ist 1 Fall, Merkenich hängt an Tempo-10-Stellen; mindestens 30 schwere Fälle und 3 Messstellen, drei Klassen. „17,8 Mio.“ täuscht Genauigkeit vor. Robusteste Zahl: 97 % ohne Punkte. |

## Synthese und Entscheidungen

| Befund (Anzahl Gutachten) | Entscheidung | Status v3.1 |
|---|---|---|
| Rechenfehler: K-04-Zeilen mit 0 km/h (1) | Tempofall verlangt Überschreitung > 0 | umgesetzt: 445.660 → 445.483 |
| Rechenfehler: Klammer „Tempo ≤ 50: 0,09 % gegen 1,2 %“ (1) | aus den Daten: 0,10 % gegen 1,45 % | umgesetzt |
| Doppelte Rundung 8,05 → 8,1 % (eigener Befund) | Anteile mit drei Nachkommastellen speichern | umgesetzt: 8,0 % |
| Lernkurve mit Extremwochen (3) | Woche 0–1 gegen Woche 12–19, Kontrollreihe (27 Anlagen) im Chart | umgesetzt: −71 %, Bestand −5 % |
| „Kein Einzelfall“ zu stark (3) | alle 11 neuen Anlagen als Tabelle, Text „Nicht jede neue Anlage wirkt so“ | umgesetzt |
| „Goldgrube“ (4) | „Ein neuer Blitzer wirkt, und zwar schnell“ | umgesetzt |
| Nacht-Faktor aus zwei Stunden (3) | Nacht 22–6 gegen Tag 10–18, je Anlage bereinigt; Absolutzahlen; Faktor 20 aus dem Fazit | umgesetzt |
| Stadtteil-Karte stigmatisiert (5) | ≥ 30 schwere Fälle an ≥ 3 Messstellen, drei Klassen, keine Rangliste, dominierende Stelle im Tooltip, Hinweis zuerst | umgesetzt (46 Stadtteile) |
| Bußgeld als Einnahme lesbar (4) | „Katalogwert, keine Einnahme“ im selben Satz, rund 18 Mio., 40 € je Fall, Rangfolge-Annahme offen | umgesetzt |
| „Ortskundige“ als Kausalität (3) | als Hypothese, Verkehrszusammensetzung zuerst | umgesetzt |
| 6 km/h als „die meisten“ (2) | „knapp über der Schwelle“, kein Freibrief | umgesetzt |
| Polizei-Messungen fehlen (2) | Prolog + Grenzen-Karte „Nur die Stadt“ | umgesetzt |
| Pressezahlen 451.735 / 25.419 (3) | im Appendix eingeordnet | umgesetzt |
| A 4 „213 pro Tag“ aus 9 Tagen (2) | Hinweis in Akt 3 | umgesetzt |
| Lokale Achse, sechs Anlagen, Rekord-Kontext (1) | in Akt 3 und Epilog | umgesetzt |
| Limit-Gegenprobe mit Standorttabelle (1) | Appendix + Grenzen: 98,2 %, ohne Militärringstraße 99,9 % | umgesetzt |
| Datenschutz n < 5 (1) | Atlas blendet Köln-Anteil, Höchstwert und Tagesprofil aus | umgesetzt |
| Lizenzen (1) | CC BY mit Urheber und Link, ODbL, „Powered by Geoapify“ | umgesetzt |
| Fest eingetragene Zahlen (1) | `scripts/check_numbers.py`: 67 Textzahlen gegen JSON | umgesetzt |
| Doku-Widersprüche (1) | README korrigiert (59 Zeilen, 5.905 + 5 zweiteilige) | umgesetzt |
| Gedankenstriche (Stil des Autors) | im sichtbaren Text ersetzt | umgesetzt |
| Service: Top-Blitzer, Preise (1) | im Blogbeitrag als Tabellen | umgesetzt (Blog) |
| Schulen/Kitas, Unfallatlas als Kartenebene (1) | neue Datenquellen, eigener Schritt | offen |
| Stellungnahme der Stadt (4) | Fragen gesammelt (siehe unten) | offen |
| Nach Tempolimit standardisierte Stadtteilwerte (2) | wäre präziser, aber schwerer lesbar | offen |
| Innere Kanalstraße: Ursache des Knicks Mitte August (2) | als offen markiert | offen |

## Offene Fragen an die Stadt Köln

1. Bedeuten die Dienststellen-Codes S-01, S-02 und K-04 feste Anlagen, mobile Messung und Kreuzungsanlagen?
2. Warum wird mobil zu 90 % tagsüber und zu 80 % werktags gemessen, und warum gab es vom 20. bis 31.12.2025 keine mobile Messung?
3. Nach welchen Kriterien werden feste und mobile Standorte gewählt (Unfalllage, Schulwege, Beschwerden)?
4. Was geschah Mitte August 2025 an der Inneren Kanalstraße (Baustelle, Umleitung, Spurführung)?
5. Gilt an der Militärringstraße, Höhe Am Eifeltor, Tempo 70 (Standorttabelle) oder 50 (Daten)?
6. Ab welcher Überschreitung wird geahndet (die Daten zeigen praktisch nichts unter 6 km/h)?

## Veröffentlichung

- Blogbeitrag: `blog/koeln-blitzt.md` → `/koelner-raser-post.html` (`scripts/build_post.py`)
- LinkedIn: `blog/koeln-blitzt-linkedin.md`, Karussell `blog/assets/raser-karussell.pdf` (`scripts/build_social.py`)
- Titelfoto: Hohenzollernbrücke bei Nacht, Detlef Huhn, CC BY-SA 4.0, via Wikimedia Commons
