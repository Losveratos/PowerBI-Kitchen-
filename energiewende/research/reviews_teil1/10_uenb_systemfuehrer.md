# Review Teil 1 · Rolle 10 · Systemführer eines Übertragungsnetzbetreibers

Stand 22.11.2026 · Auftrag P5 (`agents/briefs/P5_reviews_teil1.md`) · Regeln `agents/REGELN.md`,
`TRANSPARENZ.md` · Gegenstand: `energiewende-1-story.html`, `energiewende-1-belege.html`
(gerendert mit Playwright/Chromium bei 1280 px und 390 px über `python3 -m http.server`;
gerenderter Text und Vollbild-Aufnahmen bei 1280 px im Scratch-Ordner
`/tmp/claude-0/-home-user-PowerBI-Kitchen-/1fbaed4c-7d52-5720-8332-772815f12ca6/scratchpad/r10/`).
Grundlage: `docs/03_teil1_freigabe.md`, `data/teil1_data.json`. Am Original nachgeschlagen:
BT-Drs. 20/10585 (Bundesrechnungshof, `quellen/raw/P2-02/btd_20_10585_brh.txt`, Druckseiten
7–8 und 39–42), NEP 2037/2045 (2025) kompakt (`quellen/raw/P1-02/…kompakt.txt`, S. 11–12),
ef.Ruhr/EWI 2024 (`quellen/raw/P2-02/efruhr_ewi_netzentgelte_2024.txt`, S. 2–4, 8, 13–14),
DIHK „Plan B“ Studie und Begleitpapier (`quellen/raw/P1-02/dihk_planb_*.txt`, S. 27, 34;
Begleitpapier S. 2), R21-Erklärung (`quellen/raw/P0/…R21_2026-11.txt`, Druckseite 8–9,
Factsheet B-1). Kein neuer Abruf, deshalb kein Manifest.

Technischer Nebenbefund: Beide Seiten laden nichts von fremden Servern, werfen keine
Konsolenfehler und haben bei 390 px keinen waagerechten Überlauf.

## 1. Urteil in fünf Zeilen

Die Quellenkritik an den Netzzahlen (2.100 Mrd. € vs. DIHK-Systemkosten, 740 vs. 732 Mrd. €) ist
sauber und würde ich intern weitergeben. Als Erklärung dessen, was Netze kosten und warum, ist die
Seite aber dünn: Sie behandelt Netze nur als Summe von Investitionen und lässt Engpassmanagement,
Reserven, Systemdienstleistungen und die Wirkung auf die Netzentgelte weg — genau den Teil, in dem
R21 nachweislich recht hat. Die Einschränkung in GP11 („NEP senkt die Kosten wieder“) würde ich
öffentlich korrigieren. Empfehlen: mit Vorbehalt. Zitieren: die Akt-4-Netzpassage, ja. Angreifen:
GP11 und das Netz-Diagramm.

## 2. Befunde nach Gewicht

### Kritisch

**K1 · GP11 deutet eine Kürzung des Netzumfangs als Kostensenkung.**
Fundstelle: Story, Kasten GP11 „Netz- und Windkosten steigen“: „Für das Übertragungsnetz stieg der
Kostenansatz im bestätigten Netzentwicklungsplan 2023 von rund 323 auf etwa 440 Mrd. €“ und
„Einschränkung: Der Entwurf des Netzentwicklungsplans 2025 senkt die Übertragungsnetzkosten wieder
auf 364 bis 392 Mrd. €“; gleichlautend Belegseite N09 und Kasten GP11.
Problem: Zwei verschiedene Dinge werden als Auf und Ab einer Kostenreihe erzählt.
(a) Die 440 Mrd. € sind kein „Kostenansatz im NEP 2023“. Der NEP 2025 schreibt, die Kosten des
bestätigten Netzes 2023 „würden bei Realisierung von seinerzeit rund 323 Mrd. Euro auf mittlerweile
etwa 440 Mrd. Euro ansteigen“, und verweist dafür auf das BET/EWI-Monitoring. Es ist dasselbe Netz zu
heutigen Preisen.
(b) Die 364–392 Mrd. € beschreiben ein **kleineres oder anders gebautes Netz**, kein billiger
gewordenes. Der NEP nennt die Gründe selbst: vier bis sieben Offshore-Netzanbindungen weniger, in
Szenario A nur 59,2 GW Offshore-Wind statt der gesetzlichen 70 GW, neue HGÜ-Leitungen an Land als
Freileitung statt Erdkabel angesetzt, weniger inländische Elektrolyse, Flexibilität eingerechnet.
Die Freileitungs-Annahme setzt voraus, dass der gesetzliche Erdkabelvorrang fällt. Das fordert auch
die DIHK, und sie nennt diesen Hebel als einen der größten.
Der Satz in der Einschränkung erweckt also den Eindruck, die Preise seien wieder gefallen. Belegt ist
nur, dass weniger oder anders gebaut werden soll. Das schwächt die Gegenposition zu Unrecht ab.
Beleg: NEP 2037/2045 (2025) kompakt, S. 11 (323 → 440 „würden … ansteigen“, BET/EWI) und S. 11–12
(Aufzählung der Maßnahmen, „Reduzierung der Investitionskosten für Szenario A um knapp 80 Mrd. auf 364
Mrd. Euro … B und C um rund 50 Mrd.“); DIHK-Begleitpapier S. 2 (Erdkabelvorrang aufheben).
Vorschlag: „Zu heutigen Preisen würde das 2023 bestätigte Übertragungsnetz statt rund 323 etwa 440
Mrd. € kosten (Schätzung BET/EWI, zitiert im NEP 2025). Der Entwurf des NEP 2025 kommt auf 364 bis
392 Mrd. €, weil er weniger Offshore-Anbindungen plant, neue Gleichstromleitungen als Freileitung
statt als Erdkabel ansetzt und weniger Elektrolyse im Inland unterstellt. Für die Freileitungen
müsste der gesetzliche Erdkabelvorrang fallen.“ Die Zeile N09 in der Freigabeliste entsprechend
umformulieren (Status „korrigiert“).

### Mittel

**M1 · Das Netz-Diagramm stellt Investitionen und Investitionen plus Betrieb nebeneinander.**
Fundstelle: Story, Akt 4, Grafik „Netze laut R21 und in der DIHK-Studie“: Balken „DIHK: nur Netze,
2025 bis 2049 · 1,2 Bio. €“ auf derselben Achse wie „Netze bis 2045 in anderen Quellen“ (675 / 732 /
740 / 792 / >460 / 364–392 Mrd. €). Fließtext Akt 4 Schritt 4: „kosten die Netze 1,2 Bio. € von 2025
bis 2049“.
Problem: Die DIHK-Zahl enthält Investitionen **und** Betriebskosten über 25 Jahre. Die
Begleitpapier-Formulierung („Die Netzkosten haben sich seit 2010 verdoppelt. Sie werden bis zum Jahr
2049 kumuliert eine Höhe von 1,2 Bio. Euro erreichen“) spricht dafür, dass auch Betrieb und
Kapitalkosten des Bestandsnetzes darin stecken. Das sage ich als Lesart, das Begleitpapier sagt es
nicht ausdrücklich. Alle anderen Balken sind reine Ausbau-Investitionen bis 2045. Wer die Grafik
liest, schließt: Die DIHK schätzt die Netze rund 60 % teurer als alle anderen. Belegt ist das nicht.
Die Belegseite (N02) schreibt „(Investition und Betrieb)“, die Story-Grafik und der Story-Text
schreiben es nicht.
Beleg: DIHK „Plan B“, S. 27, Abb. 8 („Netzkosten (CAPEX & OPEX) 1,2 Billionen €“), Hinweis zu Abb. 8;
Begleitpapier S. 2.
Vorschlag: Balken beschriften mit „DIHK: Netze, Investition und Betrieb, 2025–2049“ und optisch
absetzen, zum Beispiel schraffiert oder mit eigener Zeile „andere Größe“. Im Story-Satz „Investition
und Betrieb“ ergänzen. Alternativ die DIHK-Netzzahl nur im oberen Block zeigen, nicht auf derselben
Achse wie die Investitionsbalken.

**M2 · Engpassmanagement fehlt ganz, obwohl R21 dort recht hat.**
Fundstelle: beide Seiten. Die Wörter Redispatch, Engpassmanagement, Netzreserve und
Systemdienstleistungen kommen im gerenderten Text nicht vor. Die Rubrik „Hier hat R21 recht“ hat
sechs Kästen, keiner betrifft das Netz.
Problem: R21 nennt in Factsheet B „Redispatch 3,1 Mrd. € pro Jahr (Korb 2026)“. Unser eigenes
Dossier 05 hat für 2025 nach SMARD 3.071 Mio. € gelesen, davon Netzreserve 1.359, Redispatch
konventionell 1.176, Entschädigung EE 433 und Countertrading 102 Mio. € (primär, B). Das ist ein
**Treffer von R21**, der in den Pflicht-Gegenpositionen fehlt. Bei einem Papier mit 27 Zahlen ohne
Quelle fällt das besonders auf: Die Seite prüft die Netzzahlen, bei denen R21 danebenliegt, und
lässt die Netzzahl weg, die stimmt. Dazu kommt GP10: Er zitiert den Bundesrechnungshof
(Drs. 20/10585) für die 460 Mrd. € und das „falsche Bild“, lässt aber den Satz direkt dazwischen weg:
„wird das Netzengpassmanagement voraussichtlich 6,5 Mrd. Euro pro Jahr kosten“. Diese Prognose der
ÜNB von 2022/23 ist bislang nicht eingetreten (2024: 2.954 Mio. €, 2025: 3.071 Mio. €). Auch das
gehört dazu.
Beleg: R21 Factsheet B-1 (Text Z. 410–413); `research/05_speicher_dunkelflaute.md` Abschn. 5.1
(SMARD, Netzengpassmanagement 2024 und Q4/Gesamtjahr 2025); Drs. 20/10585, Druckseite 8 und 42
(Abb. 9: 4,2 Mrd. € 2022, Prognose 4,9 → 6,5 Mrd. € 2024–2028); `research/01_r21_behauptungen.md`
Zeile 102 und Abschn. „stärkste Argumente“ Nr. 2.
Vorschlag: In die Freigabeliste aufnehmen (Status „bestätigt“, B, primär über SMARD) und einen
siebten Kasten „Hier hat R21 recht“ anlegen: „Engpassmanagement kostet rund 3 Mrd. € im Jahr — R21s
3,1 Mrd. € stimmen (SMARD 2025: 3,07 Mrd. €). Einschränkung: Die vom Bundesrechnungshof genannte
Prognose von 6,5 Mrd. € pro Jahr ist bisher nicht eingetreten. Fast die Hälfte der Summe ist
Netzreserve, also Vorhaltung von Kraftwerken im Süden, solange Leitungen fehlen.“ Über 20 Jahre sind
das 60 bis 130 Mrd. € (Setzung M: 3 bis 6,5 Mrd. € × 20). Das ist klein gegen Billionen, aber nicht
null, und es steht in keiner Investitionssumme.

**M3 · R21s eigentliches Netzargument wird nicht geprüft, nur seine Quellen.**
Fundstelle: Story, Akt 4 Schritt 4 „Dasselbe Muster beim Netz“; Akt 5 Schritt 1.
Problem: R21 behauptet nicht nur eine Summe. Der Kern ist: „um aus volatiler Erzeugung … gesicherte
Leistung zu machen, benötigt man EE-spezifischen Netzausbau, Netzengpassmanagement,
Reservekraftwerke und Stromspeicher“, und ein Kernkraftpfad brauche „weit weniger Netzausbau,
Reservekraftwerke, Redispatch“. Die Seite zeigt, dass die 2.100 Mrd. € falsch zugeordnet sind und
die 740 Mrd. € plausibel. Sie sagt aber nicht, **welcher Teil** der Netzkosten durch Wind und PV
entsteht und welcher sowieso anfiele (Ersatz alter Anlagen, Elektrifizierung von Wärme und Verkehr
im Verteilnetz). Damit wendet die Seite ihr eigenes Raster aus Akt 4 (G1 / G2 / G3) bei den Netzen
nicht an. Alle Netzzahlen sind Brutto-Investitionen (G2), keine Mehrkosten. Aus Netzsicht ist das
die entscheidende Frage. Einen Teil kann man den Erneuerbaren eindeutig zuordnen: Die
Offshore-Anbindungen kosten im NEP 2025 allein 149–167 Mrd. € bis 2045, in ef.Ruhr/EWI 155 Mrd. €.
Ein anderer Teil folgt der Last: ef.Ruhr/EWI nennt das Verteilnetz mit rund 430 Mrd. €, also rund
20 Mrd. € pro Jahr, und treibt es mit „EE-Anlagen und Elektro…“ (Wärmepumpen, E-Autos).
Beleg: R21 Druckseite 8 (Text Z. 334–341) und Factsheet B-1 (Z. 437–440, 462–464); NEP 2025 kompakt
S. 12; ef.Ruhr/EWI S. 8.
Vorschlag: Einen Satz ergänzen: „Alle Netzzahlen sind Brutto-Investitionen. Wie viel davon ohne
Wind und Sonne wegfiele, sagt keine der gelesenen Studien. Eindeutig den Erneuerbaren zuzuordnen
sind die Offshore-Anbindungen (rund 150–170 Mrd. € bis 2045). Das Verteilnetz wächst auch mit
Wärmepumpen und E-Autos. Ob ein Kernkraftpfad weniger Netz braucht, rechnet Teil 6.“ Die Netzzeile in
der Freigabeliste als G2 kennzeichnen.

**M4 · Was Netzkosten für Netzentgelte bedeuten, steht nicht da, obwohl die Quelle schon zitiert ist.**
Fundstelle: Story GP3 („die Netzentgelte stiegen“, ohne Zahl), GP9 („über die Netzentgelte zahlen
Kundinnen und Kunden … Verzinsung mit“), GP10 („Kosten wandern … in den Bundeshaushalt: … 18,49 Mrd. €
auf das EEG-Konto“).
Problem: Für Leser und Industrie ist nicht die Investitionssumme die Belastung, sondern das
Netzentgelt. Die Seite zitiert ef.Ruhr/EWI (Q17), verschweigt aber deren Kernergebnis: Der
Netzausbau bis 2045 bedeutet im Basisszenario eine **Steigerung** der Netzentgelte um 18,0 ct/kWh
für Haushalte, 15,2 ct/kWh für Gewerbe und 7,0 ct/kWh für Industrie (Geldwert 2024, heutige Wälzung,
WACC 5,5 %, Sensitivitäten 3 % und 8 %). Bei Haushalten bedeutet das mehr als eine Verdopplung. Der
Bundesrechnungshof belegt außerdem eine zweite Verschiebung in den Haushalt, die GP10 fehlt: 2023
gab der Bund 12,84 Mrd. € Zuschuss zu den Übertragungsnetzkosten. Als er 2024 wegfiel, verdoppelten
die ÜNB die Übertragungsnetzentgelte von 3,12 auf 6,43 ct/kWh. Das ist die konkreteste Zahl dafür,
wie Netzkosten beim Kunden ankommen.
Beleg: ef.Ruhr/EWI 2024, S. 2–3 und 13–14; Drs. 20/10585, Druckseite 8 und 39 (Zuschuss 12,84 Mrd.
€, 3,12 → 6,43 ct/kWh).
Vorschlag: In GP9 oder GP10 einen Satz ergänzen: „Eine Studie von ef.Ruhr und EWI rechnet den
Netzausbau bis 2045 in Netzentgelte um: plus 18 ct/kWh für Haushalte, plus 7 ct/kWh für die
Industrie (Geldwert 2024, wenn die Kosten wie heute verteilt werden). 2023 hat der Bund die
Übertragungsnetzentgelte mit 12,84 Mrd. € gestützt; als der Zuschuss 2024 entfiel, verdoppelten sie
sich.“ Beides in die Freigabeliste (B, primär).

### Klein

**k1 · GP4: „Die Netzplanung sieht … Batterien … vor“.** Der NEP plant keine Speicher und keine
Kraftwerke. Er übernimmt sie aus dem von der BNetzA genehmigten Szenariorahmen und rechnet das Netz
dafür. Vorschlag: „Der Szenariorahmen, auf dem der Netzentwicklungsplan aufbaut, unterstellt für
2045 Batterien mit 231 bis 390 GWh …“. Gleiches auf der Belegseite R09 („Der Netzentwicklungsplan
setzt …“, dort zutreffender).

**k2 · GP4 misst Versorgungssicherheit in TWh.** Für die Systemführung entscheidet die Leistung in
der kritischsten Stunde, nicht die Energiemenge über fünf Tage. Dossier 05 hat dafür eine
Spitzenlücke von 61 / 70 / 77 GW (Setzung M auf Messdaten) und den NEP-Wert von 60,6–81,3 GW
H₂-Kraftwerken. Der Kasten nennt Wasserstoffkraftwerke ohne Zahl. Vorschlag: „… daneben 60 bis
81 GW Wasserstoffkraftwerke für die Spitzenlast“ ergänzen. Das Hauptthema bleibt Teil 2.

**k3 · Falsche Quellmarke im Akt-4-Text.** „Andere Studien kommen … auf 675, 732 oder 792 Mrd. €“
trägt nur Q18 (BET/EWI). Die 732 Mrd. € stammen von ef.Ruhr/EWI (Q17). Vorschlag: Q17 und Q18 setzen.
Auf der Belegseite N06 heißt es „675 bis 792 (Mitte: 732)“. 732 ist keine Mitte, sondern eine eigene
Studie mit anderem Verteilnetzansatz. Vorschlag: „675, 732 oder 792“.

**k4 · Die Spanne der Netzzahlen kommt fast nur aus dem Verteilnetz.** Das Übertragungsnetz liegt in
allen Quellen bei rund 300–440 Mrd. €. Das Verteilnetz schwankt zwischen „gut 150“ (BNetzA, Jan.
2024, nach BRH), 235 (BET/EWI), 352 (Langfristszenarien) und 430 Mrd. € (ef.Ruhr/EWI). Vorschlag:
Die Balken in Übertragungs- und Verteilnetz teilen oder einen Satz ergänzen: „Die größte
Unsicherheit liegt im Verteilnetz.“ Beleg: Drs. 20/10585, Druckseite 40; Freigabeliste N06.

**k5 · Woraus der BRH-Wert besteht.** Die „mehr als 460 Mrd. €“ setzen sich beim
Bundesrechnungshof aus 313,7 Mrd. € Übertragungsnetz (NEP-2023-Entwurf, Preisstand damals) und „gut
150 Mrd. €“ Verteilnetz zusammen (Druckseite 40–41, Abb. 8). Bei der Beschriftung „Bundesrechnungshof
2024: mehr als“ sollte „ÜN + VN, Preisstand 2023“ stehen, sonst wirkt der Wert neben 675–792 wie ein
Widerspruch.

**k6 · Seitenangabe BRH.** Story und Belege nennen „Drucksache 20/10585, S. 9“. Der Satz steht auf
Druckseite 8 (PDF-Seite 9). Vorschlag: „Druckseite 8“, wie bei R21 („Druckseite 3“).

**k7 · „Was Teil 1 nicht zeigt“ nennt keine Systemkosten außerhalb der Investitionen.** Vorschlag
für einen neunten Punkt: „Engpassmanagement, Reservekraftwerke, Systemdienstleistungen und
Netzverluste stehen in keiner der Netzsummen. Ob die Systemstudien sie enthalten, haben wir nicht
geprüft.“

## 3. Was aus Netzsicht fehlt

1. **Netzausbau-Verzug als Kostentreiber.** Laut Bundesrechnungshof lag der
   Übertragungsnetzausbau Ende September 2023 „sieben Jahre und 6 000 km“ hinter der Planung
   (Drs. 20/10585, Druckseite 7 und 39). Der Verzug ist der Grund für Redispatch und Netzreserve.
   Ein Satz dazu verbindet M2 mit dem Netzkapitel.
2. **Abregelung.** 2024 und 2025 wurden je rund 9,4 TWh Strom aus Erneuerbaren per Redispatch
   abgeregelt, 2024 rund 17,8 % der Offshore-Einspeisung (`research/03_stromdaten.md`, SMARD, B).
   Das ist bezahlte, aber ungenutzte Erzeugung, ein Systemkostenposten, den R21 meint.
3. **Leistungsbilanz und Reserven.** Der Bundesrechnungshof spricht von einem nötigen „weitgehend
   redundanten System mit gesicherter, steuerbarer Leistung“ und sagt, die Kraftwerksstrategie sei
   im Verzug (Druckseite 7). Dossier 05 nennt Netzreserve rund 8,8 GW und Kapazitätsreserve rund
   1,37 GW. Teil 1 muss das nicht ausrechnen. Es sollte aber sagen, dass die Studien gesicherte
   Leistung sehr unterschiedlich ansetzen (DIHK: +46 GW Gaskraftwerke bis 2045, S. 34).
4. **Netzanschluss als Engpass.** 400 GW Anschlussbegehren für Batterien und 25 GW Zusagen (Dossier
   05 nach KfW/BNetzA, B). Das ist der Grund, warum die Batterien aus dem Szenariorahmen kein
   Selbstläufer sind. Das gehört nach Teil 2, ein Hinweis in GP4 genügt.
5. **Kostenhebel aus Netzsicht.** Erdkabelvorrang, Baukostenzuschüsse für Speicher und Erzeuger,
   regionale Steuerung des Zubaus (DIHK-Begleitpapier S. 2). Die Seite erwähnt als Vergleichspfad
   nur Plan B insgesamt. Dass ein großer Teil der Netz-Einsparung an einer einzigen
   Gesetzesänderung hängt, ist für Leser wichtig.
6. **Wer zahlt.** Offshore-Netzumlage (0,416 → 0,656 ct/kWh 2019–2024, BRH Druckseite 39),
   Netzentgelte, Bundeszuschüsse. Teil 1 nennt das als Lücke („Mehrkosten sind nicht gleich
   Belastung“). Für das Netz liegen die Zahlen aber vor (siehe M4).

## 4. Was gut ist und bleiben soll

- Die Zuordnung der 2.100 Mrd. € zu den DIHK-Gesamtsystemkosten über zehn Jahre, mit dem fairen
  Vorbehalt „Ob R21 eine andere Veröffentlichung meint, sagt das Papier nicht“ (N03).
- Die 740 Mrd. € werden als plausibel bestätigt und nicht wegerklärt. Die Korrektur „bis 2034 →
  2025–2049“ ist sauber belegt.
- GP9 (Zinsen fehlen in den Investitionssummen; Netzkunden zahlen Abschreibung und Verzinsung) ist
  aus Netzsicht richtig und selten so klar gesagt.
- GP10 nimmt den Bundesrechnungshof ernst. Der Satz zum „falschen Bild der tatsächlichen Kosten“ ist
  wörtlich und richtig zitiert.
- Technisch: keine fremden Server, keine Konsolenfehler, mobil lesbar. Die Netzgrafik setzt bei 390
  px die Werte an die Beschriftungen, das ist besser als bei 1280 px.

## 5. Der härteste Einwand

„Die Seite rechnet R21 sauber nach, wo R21 Netzkosten falsch zitiert. Wo R21 bei den Netzen recht
hat, schweigt sie. Engpassmanagement kostet tatsächlich rund drei Milliarden Euro im Jahr, so wie
R21 schreibt. Fast die Hälfte davon ist Netzreserve: Wir halten Kohle- und Gaskraftwerke im Süden
vor, weil die Leitungen sieben Jahre zu spät kommen. Davon steht auf der Seite kein Wort. Stattdessen
erfährt der Leser, der Netzentwicklungsplan 2025 ‚senke die Kosten wieder‘. Das stimmt nicht. Wir
planen weniger Offshore-Anbindungen und unterstellen Freileitungen, für die erst ein Gesetz geändert
werden muss. Der Preis pro Kilometer ist nicht gesunken. Und wer wissen will, was das für die
Stromrechnung heißt, findet die Antwort nicht, obwohl sie in einer zitierten Quelle steht: plus 18
Cent je Kilowattstunde Netzentgelt für Haushalte bis 2045. Eine Seite, die sich vornimmt, ‚was die
Summe misst‘, muss beim Netz auch sagen, was der Kunde zahlt und wofür.“
