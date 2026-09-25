# Kontext-Recherche: Geschwindigkeitsüberwachung Köln 2025

Recherchestand: 25.09.2026. Methode: ausschließlich WebSearch-Snippets (WebFetch war im
Sandbox-Netzwerk für praktisch alle getesteten Domains blockiert — bussgeldkatalog.org/.de,
adac.de, koeln.de, t-online.de, de.wikipedia.org, koeln.polizei.nrw meldeten
`EGRESS_BLOCKED`; offenedaten-koeln.de/stadt-koeln.de/open.nrw waren laut Vorgabe ohnehin
gesperrt). Alle Aussagen unten stammen daher aus Suchmaschinen-Snippets, nicht aus
Primärdokumenten. Konfidenz-Codes: **A** = Primärquelle selbst gelesen, **B** = mehrere
unabhängige Suchsnippets stimmen überein, **C** = nur ein Snippet / unsichere Herleitung.
In dieser Recherche kommt **A** nicht vor, da kein direkter Dokumenten-Fetch möglich war.

---

## 1. Datensatzbeschreibung: Fahrzeugart-, Dienststellen- und Standort-Codes

**Fahrzeugart-Codes** (Konfidenz B — zwei unabhängige Suchen lieferten ein konsistentes,
in sich stimmiges Schema; keine Primärquelle direkt gelesen):

| Code | Bedeutung |
|---|---|
| 01a | Kraftrad (Motorrad) |
| 02a | Leichtkraftrad |
| 03a | Kleinkraftrad |
| 04a | Pkw |
| 05a | Pkw mit Anhänger |
| 06a | Lkw über 3,5 t bis 7,5 t zGG |
| 06b | Lkw über 7,5 t zGG |
| 06c | Lkw bis 3,5 t zGG |
| 06d | Wohnmobil über 3,5 t bis 7,5 t (laut einer Quelle) |
| 07a | vermutlich Lkw mit Anhänger / Gespann (nicht sicher belegt) |
| 08a | Kraftomnibus (Bus) |
| 08b | Kraftomnibus mit Fahrgästen |
| 09a | nicht sicher belegt |
| 10a | nicht sicher belegt |
| 11a | Sattelzug |
| 11b | vermutlich Sattelzug-Variante, nicht sicher belegt |
| 13a | Land-/forstwirtschaftliche Zugmaschine mit Anhänger |
| 99a | Sonstige Fahrzeuge |

**Wichtiger Vorbehalt:** Diese Liste wurde aus Suchmaschinen-Zusammenfassungen
rekonstruiert, die selbst wieder KI-generierte Snippet-Syntheses sind (das WebSearch-Tool
verarbeitet Trefferseiten mit einem eigenen Modell). Die Codes 07a, 09a, 10a, 11b konnten
in keiner Suche zweifelsfrei bestätigt werden — das Schema ähnelt stark den in mehreren
deutschen Kommunal-Open-Data-Portalen (Blitzer-Messsysteme) verwendeten Standard-
Fahrzeugartenschlüsseln, aber eine Bestätigung direkt aus der Kölner Datensatzbeschreibung
liegt nicht vor. **04a = Pkw** ist die am robustesten belegte Zuordnung (in allen Treffern
identisch) und erklärt plausibel den 98-%-Anteil dieses Codes im Datensatz.

**Dienststellen-Codes S-01 / S-02 / K-04 / S-11:** Keine explizite Definition in den
Suchergebnissen gefunden. Aus den vom Nutzer bereitgestellten Eckdaten und allgemeinem
Kontext (Kommunaler Ordnungsdienst / Verkehrsdienst der Stadt Köln ist laut
stadt-koeln.de-Snippet für Verkehrsüberwachung zuständig, Polizei-Fälle sind nicht
enthalten) lässt sich nur folgende Arbeitshypothese ableiten (**Konfidenz C, nicht
belegt**):
- **S-01**: stationäre feste Blitzer-Standorte (44 feste Standorte laut Nutzer-Kontext,
  „S“ vermutlich für „stationär")
- **S-02**: vermutlich semistationäre/mobile Anlagen (601 Standorte — passt zur Größenordnung
  der 13 semistationären Anlagen + Radarwagen/Stative, die im Jahresverlauf viele
  unterschiedliche Standorte anfahren, s. Abschnitt 3)
- **K-04**: vermutlich Kreuzungs-/Rotlicht- bzw. Kombianlagen („K" = Kreuzung)
- **S-11**: Sonderfall A1-Rheinbrücke Leverkusen (laut Nutzer-Kontext), vermutlich eine
  gesonderte stationäre Autobahn-Messstelle außerhalb des Kölner Stadtgebiets

Diese Zuordnung ist **nicht durch eine Datensatzbeschreibung bestätigt** — sie ist eine
plausible Interpretation der Präfixe und sollte vor Veröffentlichung nicht als gesichert
dargestellt werden. Offenedaten-koeln.de-Distributionsseiten mit Titeln „Standorttabelle
s01", „s02", „s04", „s11" wurden in den Suchtreffern gefunden (Bestätigung, dass es diese
vier Standorttabellen als eigene Downloads gibt), aber ihr Inhalt/Spaltenschema konnte
nicht gelesen werden (Domain blockiert).

**Zweite Spalte der Standorttabellen (Werte 0/2/3/6/x):** Keine Quelle gefunden, die dieses
Feld erklärt. **Nicht belegbar** über WebSearch — siehe „Offene Punkte" unten.

**Zwei Tempolimit-Werte in Standorttabellen (z. B. „080;060" an der B55a):** Kein
Primärbeleg, aber ein sehr plausibler Erklärungsansatz existiert (**Konfidenz C**): Für die
Zoobrücke/B55a wurde die zulässige Höchstgeschwindigkeit laut einer Stadt-Köln-Pressemitteilung
(nur als Snippet-Titel „Tempo 50 auf der Zoobrücke" gefunden, Inhalt nicht lesbar) zum
1. Oktober 2023 von 80 auf 50 km/h abgesenkt. Ein zweiter Wert in der Standorttabelle könnte
also **„altes Tempolimit; neues/aktuelles Tempolimit"** nach einer Limit-Änderung
kodieren, oder alternativ Tag-/Nacht- bzw. Fahrtrichtungs-Limits. Ohne Primärquelle bleibt
dies eine Hypothese.

---

## 2. Bußgeldkatalog 2025 für Pkw — Geschwindigkeitsüberschreitung

Vollständige Tabelle unten und maschinenlesbar in
`/home/user/PowerBI-Kitchen-/koeln-raser/data/bussgeld_2025.json`. Rechtsgrundlage laut
Snippets: Bußgeldkatalog-Verordnung (BKatV) in der seit der StVO-Novelle vom 09.11.2021
geltenden Fassung; keine Hinweise auf eine erneute Anpassung der Geschwindigkeits-Sätze
für 2025/2026 gefunden (mehrere Portale referenzieren dieselben Beträge unter dem Label
„Bußgeldkatalog 2026"). **Konfidenz B** für alle Werte, die durch mindestens zwei
unabhängige Snippets bestätigt wurden (praktisch alle Zeilen unten); **Konfidenz C** für
06d/07a/09a/10a/11b-Fahrzeugcodes (siehe oben, nicht Teil dieser Tabelle).

### Innerorts (Pkw)

| Überschreitung | Euro | Punkte | Fahrverbot |
|---|---|---|---|
| bis 10 km/h | 30 € | 0 | – |
| 11–15 km/h | 50 € | 0 | – |
| 16–20 km/h | 70 € | 0 | – |
| 21–25 km/h | 115 € | 1 | – |
| 26–30 km/h | 180 € | 1 | nur bei Wiederholung |
| 31–40 km/h | 260 € | 2 | 1 Monat |
| 41–50 km/h | 400 € | 2 | 1 Monat |
| 51–60 km/h | 560 € | 2 | 2 Monate |
| 61–70 km/h | 700 € | 2 | 3 Monate |
| über 70 km/h | 800 € | 2 | 3 Monate |

Quellen (B): juraforum.de/lexikon/bussgeldkatalog-innerorts, bussgeldkatalog.org/
geschwindigkeitsueberschreitung, jusora.de (53 km/h-Einzelseite bestätigt 560€/2 Monate),
derbussgeldkatalog.de (61-70 km/h-Einzelseite bestätigt 700€/3 Monate),
bussgeldcheck.org (über 70 km/h-Einzelseite bestätigt 800€/3 Monate).

### Außerorts (Pkw)

| Überschreitung | Euro | Punkte | Fahrverbot |
|---|---|---|---|
| bis 10 km/h | 20 € | 0 | – |
| 11–15 km/h | 40 € | 0 | – |
| 16–20 km/h | 60 € | 0 | – |
| 21–25 km/h | 100 € | 1 | – |
| 26–30 km/h | 150 € | 1 | – |
| 31–40 km/h | 200 € | 1 | nur bei Wiederholung |
| 41–50 km/h | 320 € | 2 | 1 Monat |
| 51–60 km/h | 480 € | 2 | 1 Monat |
| 61–70 km/h | 600 € | 2 | 2 Monate |
| über 70 km/h | 700 € | 2 | 3 Monate |

Quellen (B): juraforum.de/lexikon/bussgeld-geschwindigkeit-ausserorts,
bussgeldkatalog.org/geschwindigkeitsueberschreitung, derbussgeldkatalog.de
(41-50 km/h-Einzelseite bestätigt 320€/1 Monat, 51-60 km/h-Einzelseite bestätigt 480€),
bussgeldkatalog.org/61-bis-70-km-h-zu-schnell (bestätigt 600€/2 Monate),
bussgeldkatalog.org/ueber-70-km-h-zu-schnell (bestätigt 700€/3 Monate außerorts vs.
800€ innerorts).

### Toleranzabzug

Bis einschließlich 100 km/h gemessener Geschwindigkeit werden pauschal **3 km/h**
abgezogen, oberhalb von 100 km/h **3 % des Messwerts**. Diese Verkehrsfehlergrenzen gehen
auf Vorgaben der Physikalisch-Technischen Bundesanstalt (PTB) zurück. (Konfidenz B —
juraforum.de, bussgeldkatalog.de/toleranz-blitzer, anwalt.org/toleranzabzug stimmen
überein.)

Beispiel Raderthalgürtel (siehe Abschnitt 3): 203 km/h gemessen, 3 % Toleranzabzug ≈ 6 km/h
→ rund 197 km/h amtlich verwertbar bei 50 km/h Limit ≈ 147 km/h Überschreitung (eigene
Berechnung auf Basis der Toleranzregel, nicht durch eine Quelle mit dem exakt verwerteten
Wert belegt — Konfidenz C für die konkrete Rechnung, B für die Regel selbst).

### Wiederholungstäter-Regel

Wer innerhalb von 12 Monaten **zweimal mit mindestens 26 km/h** zu schnell (inner- oder
außerorts) erwischt wird, muss beim zweiten Verstoß zusätzlich mit einem **einmonatigen
Fahrverbot** rechnen — unabhängig von den regulären Fahrverbotsschwellen (31 km/h
innerorts bzw. 41 km/h außerorts für Einzelverstöße). (Konfidenz B — bussgeldkatalog.de/
fahrverbot-wiederholungstaeter, bussgeldrechner.org/wiederholungstaeter,
bussgeldrechner.org/fahrverbot-wiederholungstaeter stimmen überein.)

---

## 3. Kölner Kontext

**Gesamtzahl Verstöße 2025 (Konfidenz B, zwei unabhängige Snippets aus derselben
zugrunde liegenden Quelle koeln.t-online.de bestätigen dieselben Zahlen):**
- **451.735 Geschwindigkeitsverstöße** in Köln 2025 registriert
- Im Schnitt **1.238 Verstöße pro Tag**, ca. **52 pro Stunde**
- Meiste Verstöße im **Oktober** mit **43.092 Fällen**
- **16,6 %** aller Verstöße zwischen 22:00 und 5:00 Uhr; nachts im Schnitt **10,6 km/h**
  höhere Überschreitung als tagsüber
- **51,5 %** der erfassten Fahrzeuge trugen **auswärtige (nicht-Kölner) Kennzeichen**
- **5.096 Fälle** mit mindestens 100 km/h an Stellen mit max. 80 km/h erlaubt (≈ 14/Tag)
- Häufigster Blitzer: **B55a, Ausfahrt Frankfurter Straße**, mit **25.419 Verstößen**
  im Jahr (≈ 186/Tag)

Quelle: koeln.t-online.de, „Köln 2025: Fast eine halbe Million Geschwindigkeitsverstöße
registriert" (Artikel selbst nicht direkt lesbar — WebFetch blockiert — Angaben stammen aus
Suchsnippets, die den Artikel zusammenfassen; die Kernzahl 451.735 wurde in zwei
unabhängigen Suchanfragen identisch reproduziert, daher Konfidenz B trotz Single-Source-
Charakter des Originalartikels).

**Rekordraser 2025 — 203 km/h Raderthalgürtel:** Bestätigt (Konfidenz B, zwei
Suchanfragen konsistent). Im **April 2025** wurde am Raderthalgürtel (Tempo-50-Zone) ein
Fahrzeug mit **Düsseldorfer Kennzeichen** mit **203 km/h** gemessen — eine Überschreitung
von **146 km/h**. Quelle: koeln.t-online.de (Snippet-Zusammenfassung).

**Messtechnik-Ausstattung Köln (Konfidenz B/C, teils widersprüchliche Einzelangaben):**
- **6 Radarwagen, 3 Stative, 13 semistationäre Anlagen** (mehrfach in Snippets genannt)
- **Mehr als 50 feste Blitzer** laut Presse-Snippet — steht in leichtem Spannungsverhältnis
  zu den vom Nutzer genannten „44 feste Standorte" im S-01-Datensatz; Differenz könnte auf
  neu hinzugekommene Anlagen zurückgehen: eine Stadt-Köln-Pressemitteilung (nur als Titel
  gefunden, Inhalt nicht lesbar) kündigt **neue Blitzer an den Autobahnen A4 (Eifeltor) und
  A57 (Herkulestunnel)** an, was die Differenz erklären könnte (Konfidenz C für diese
  Erklärung).
- Eine ältere Angabe („über 2.400 Messstellen") bezieht sich vermutlich auf die Summe aller
  im Jahresverlauf angefahrenen mobilen Einzelpositionen, nicht auf permanente Standorte
  (Konfidenz C, nicht explizit erläutert in den Snippets).

**Einnahmen Stadt Köln aus Bußgeldern Geschwindigkeit/Rotlicht:**
- **2024: 19,2 Mio. €** (Köln liegt damit hinter Hamburg [~47 Mio. €], Berlin [30,2 Mio. €]
  und Leipzig [19,4 Mio. €], vor Düsseldorf [17,4 Mio. €]). Quelle: t-online.de/
  mobilitaet/aktuelles/id_101341136 (Konfidenz B, Snippet mit klarer Städte-Rangliste).
- **2022: 21,5 Mio. €** für Köln, Düsseldorf 14,5 Mio. €, Berlin bundesweit an der Spitze
  mit 30,2 Mio. € (dieselbe Zahl 30,2 Mio. € taucht sowohl für 2022 als auch — in einem
  anderen Snippet — für 2024 bei Berlin auf; das deutet auf eine mögliche Verwechslung/
  Caching in den Suchzusammenfassungen hin — **Konfidenz C** für die 2022er Reihe, mit
  Vorsicht zu verwenden). Quelle: t-online.de/region/duesseldorf/id_100281266.
- **2025/2023: keine belegte Zahl gefunden** — siehe „Offene Punkte".

**Bekannte Blitzer-Standorte:**
- **Innere Kanalstraße** (L100, Höhe Hornstraße/Escher Straße, Richtung Zoobrücke):
  mehrere stationäre Traffi-Tower-Anlagen zur Überwachung des Tempo-50-Limits bestätigt
  (Konfidenz B, mehrere unabhängige Blitzer-Portale). Ob dies tatsächlich der
  „einträglichste" Blitzer Kölns ist, konnte **nicht bestätigt werden** — keine Quelle
  nennt ihn explizit als umsatzstärksten Standort (offen).
- **B55a / Zoobrücke-Zubringer** (Stadtautobahn, AS Höhenberg bzw. Waldecker Straße
  Richtung Zoobrücke): mehrfach als Blitzerstandort bestätigt; laut Abschnitt „Gesamtzahl
  Verstöße 2025" ist die Anlage an der **Ausfahrt Frankfurter Straße auf der B55a** mit
  25.419 Verstößen 2025 der **meistauslösende Blitzer** Kölns (Konfidenz B). Zusätzlich:
  Die zulässige Höchstgeschwindigkeit auf der **Zoobrücke** wurde laut Stadt-Köln-
  Pressemitteilungstitel zum **1. Oktober 2023 von 80 auf 50 km/h** gesenkt (Konfidenz C,
  Inhalt der Pressemitteilung nicht lesbar, nur Titel-Snippet).
- **Kaiser-Wilhelm-Ring:** keine spezifische Blitzer-Bestätigung gefunden, aber Teil der
  Tempo-30-Umstellung der Kölner Ringe (s. u.).

**Tempo 30 auf den Kölner Ringen:** Schrittweise Einführung (Konfidenz B, wz.de-Snippet):
- **2016**: erste Abschnitte (Hansaring, Kaiser-Wilhelm-Ring, Hohenzollernring,
  Habsburgerring) im Zuge einer Ampel-Erneuerung und Wegfall der Radwegbenutzungspflicht
- **2017**: Ausweitung auf Theodor-Heuss-Ring, nördlichen Hohenstaufenring, Sachsenring
- **16. August 2019**: durchgängiges Tempo 30 auf dem **gesamten Kölner Ring** von
  Ubierring bis Theodor-Heuss-Ring

**Frühere „Blitzer-Panne" Köln (historischer Kontext, nicht 2025, aber relevant für
Mess­fehler-Thematik):** 2016 führte ein fehlendes Verkehrsschild an der A3/Kreuz Heumar
(Tempolimit-Reduzierung von 80 auf 60 km/h während einer Lärmschutzwand-Baustelle, Schild
nach Bauende nicht korrekt zurückgesetzt) dazu, dass **453.597 Fahrzeuge zu Unrecht
geblitzt** wurden; die Stadt nahm dadurch **11 Mio. €** ein, später gingen **über 1.500
Rückerstattungsanträge** ein, rund **284.000 Fälle** waren als rechtskräftig abgeschlossen
und damit erstattungsfähig identifiziert. (Konfidenz B, mehrere Presse-/Kanzlei-Snippets
stimmen überein: autohaus.de, heise.de, cd-anwaltskanzlei.de.) **Hinweis:** Dies betrifft
einen anderen, historischen Fall (A3, nicht Teil des „ab 2025"-Datensatzes) und sollte in
der Daten-Story nur als Hintergrund zur generellen Fehleranfälligkeit von
Geschwindigkeitsmessung erwähnt werden, nicht als 2025er-Ereignis.

---

## 4. Unfallkontext (Polizei Köln)

Quelle für beide Jahre: koeln.polizei.nrw (Verkehrsunfallstatistik-PDFs 2024 und 2025 —
Domain nicht explizit gesperrt, aber WebFetch dorthin ebenfalls durch die
Netzwerk-Policy blockiert; Zahlen daher nur aus Suchmaschinen-Snippets, die die PDFs
zusammenfassen). **Konfidenz B** (in sich konsistente Zahlenreihe aus einer einzelnen
Suchanfrage, keine zweite unabhängige Quelle geprüft).

| Jahr | Unfälle gesamt | Unfälle mit Verunglückten | Verunglückte gesamt | Schwerverletzte | Getötete |
|---|---|---|---|---|---|
| 2024 | 36.398 | 4.615 | 5.395 | 570 | 15 |
| 2025 | 37.636 (+3,0 %) | 4.738 | 5.650 | 551 | 12 |

**Unfallursachen:** Laut Snippet-Zusammenfassung sind die häufigsten Unfallursachen in
Köln Fehler beim Abbiegen/Wenden, Vorfahrtsverletzungen und Fehlverhalten von
Radfahrenden; „nicht angepasste Geschwindigkeit" wird als (mit-)relevante Ursache genannt,
aber **ohne konkrete Fallzahl oder Anteil**. Eine belastbare Zahl „X Unfälle mit
Geschwindigkeit als Hauptursache" bzw. „Y Getötete durch überhöhte Geschwindigkeit" konnte
**nicht ermittelt werden** — die genauen Ursachenstatistiken liegen nur in den PDF-Tabellen
selbst vor, die nicht gelesen werden konnten. Siehe „Offene Punkte".

---

## 5. Kennzeichen „EU" und rein numerische Einträge

**„EU" als Zulassungsbezirk-Kürzel:** Im deutschen Kfz-Kennzeichensystem steht das
Unterscheidungszeichen **„EU" für den Landkreis Euskirchen** (Regierungsbezirk Köln, NRW,
direkter Nachbarkreis von Köln). Das ist die naheliegendste Erklärung für den Wert „EU" im
Feld `kennz`, da laut Aufgabenstellung dieses Feld ein „Zulassungsbezirk-Präfix" ist — und
Euskirchen als angrenzender Landkreis plausibel häufig in Kölner Blitzerdaten auftaucht.
(Konfidenz B — ein klares, eindeutiges Snippet von bussgeldkatalog.org bestätigt „EU" =
Euskirchen als Unterscheidungszeichen; die Interpretation als generisches „EU-Kennzeichen"
der Europäischen Union ist dagegen **unwahrscheinlich**, da echte unionsweite Kennzeichen
kein Präfix „EU" tragen, sondern lediglich einen blauen EU-Sternenkranz-Balken links neben
dem normalen Landkreis-Kürzel — d. h. „EU" würde dort nie als eigenständiger
Zulassungsbezirks-Code erscheinen.) **Empfehlung für die Daten-Story:** „EU" = Euskirchen
verwenden, aber als Annahme kennzeichnen.

**Rein numerische Kennz-Werte („1", „2", „98") und leere Einträge:** Keine Quelle gefunden,
die dies für Kölner Blitzerdaten spezifisch erklärt. **Nicht belegbar** — plausible, aber
unbestätigte Vermutungen (Konfidenz C, reine Spekulation, nicht in der Datei verwenden ohne
Kennzeichnung): interne Codes für nicht lesbare/verdeckte Kennzeichen, Testauslösungen der
Anlage, oder Sammelcode für ausländische Kennzeichen ohne Zuordnung zu einem
deutschen Zulassungsbezirk-Schema. Sollte im Zweifel beim städtischen Open-Data-Team
nachgefragt oder direkt aus der (gesperrten) Datensatzbeschreibung gelesen werden.

---

## Offene Punkte / nicht belegbar

1. **Exakte Definition der Dienststellen-Codes S-01/S-02/K-04/S-11** — nicht in einer
   Datensatzbeschreibung gefunden; nur Arbeitshypothese (Abschnitt 1).
2. **Bedeutung der zweiten Spalte (Werte 0/2/3/6/x) in den Standorttabellen** — keine
   Quelle gefunden, komplett offen.
3. **Exakte Bedeutung der beiden Tempolimit-Werte** (z. B. „080;060") in den
   Standorttabellen — nur Hypothese (alt/neu-Limit wegen Zoobrücke-Absenkung 2023),
   nicht bestätigt.
4. **Vollständige, primärquellenbasierte Fahrzeugart-Codeliste** (insb. 07a, 09a, 10a,
   11b) — nur aus Suchmaschinen-Synthese rekonstruiert, nicht aus der offiziellen
   Kölner Datensatzbeschreibung gelesen.
5. **Einnahmen der Stadt Köln aus Geschwindigkeits-Bußgeldern für 2023 und 2025** — nur
   2024 (19,2 Mio. €) und mit Vorbehalt 2022 (21,5 Mio. €) belegt; keine 2023/2025-Zahl
   gefunden.
6. **Fallzahlen 2023/2024 im Vergleich zu den 451.735 Fällen 2025** — keine
   Zeitungsberichte mit direktem Vorjahresvergleich gefunden (nur die 2025er-Gesamtzahl
   selbst, ohne Delta zum Vorjahr).
7. **„Innere Kanalstraße" als „einträglichster Blitzer" Kölns** — nicht bestätigt; laut
   den gefundenen 2025er-Zahlen ist die B55a-Anlage an der Frankfurter-Straße-Ausfahrt die
   mit den meisten Verstößen (25.419), nicht explizit als „einträglichste" (Euro-Einnahme)
   bezeichnet.
8. **Anzahl Unfälle/Getötete mit Geschwindigkeit als Hauptursache** in Köln 2024/2025 —
   nur allgemeine Unfallzahlen und eine unspezifische Erwähnung von „nicht angepasster
   Geschwindigkeit" als Ursachenfaktor gefunden, keine konkrete Fallzahl.
9. **Bedeutung rein numerischer `kennz`-Werte** („1", „2", „98") und leerer Einträge —
   keine Quelle gefunden, reine Spekulation in Abschnitt 5.
10. **Kein einziger Primärquellen-Fetch möglich** in dieser Recherche: Sowohl die laut
    Aufgabenstellung gesperrten Domains (offenedaten-koeln.de, stadt-koeln.de, open.nrw)
    als auch alle anderen getesteten Domains (bussgeldkatalog.org/.de, adac.de, koeln.de,
    t-online.de, wikipedia.org, koeln.polizei.nrw) wurden vom Sandbox-Egress-Proxy mit
    `EGRESS_BLOCKED` abgewiesen. Alle Aussagen in diesem Dokument beruhen ausschließlich
    auf WebSearch-Snippets (die selbst bereits KI-zusammengefasste Auszüge sind), nicht
    auf direkt gelesenen Volltexten. Vor Veröffentlichung der Daten-Story sollten
    insbesondere die Zahlen in Abschnitt 3 (Einnahmen, Blitzeranzahl) und Abschnitt 4
    (Unfallursachen) gegen die Original-PDFs/Webseiten geprüft werden, sobald direkter
    Zugriff möglich ist.
