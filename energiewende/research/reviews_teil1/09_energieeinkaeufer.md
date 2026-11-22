# Review Teil 1 · Rolle 09 · Energieeinkäufer eines energieintensiven Betriebs

Auftrag: `energiewende/agents/briefs/P5_reviews_teil1.md`, Rolle 09.
Gegenstand: `energiewende-1-story.html` und `energiewende-1-belege.html`, gerendert
am 22.11.2026 mit Playwright (Chromium) über `python3 -m http.server`, bei 1280 px und
390 px. Beide Seiten laden ohne Konsolenfehler, ohne Anfragen an fremde Server und ohne
waagerechtes Scrollen bei 390 px. Gelesen wurde der gerenderte Text. Nachgeschlagen:
`docs/03_teil1_freigabe.md`, `research/10_wirtschaftslage.md`,
`research/pruefung/10_pruefung.md`, `research/02_kostenstudien.md`,
`data/p1_10_energiepreise_halbjahr.csv`, `data/p1_10_strompreis_komponenten_de.csv`
und das ef.Ruhr/EWI-Original unter `quellen/raw/P2-02/`.

Eigene Nachrechnungen in diesem Bericht stammen aus `data/p1_10_energiepreise_halbjahr.csv`
(Eurostat `nrg_pc_205`, Halbjahre, CC BY 4.0, Quelle Eurostat). Es sind Divisionen
der dort abgelegten Werte, keine neuen Abrufe. Konfidenz B (eine Quelle), primär gelesen
im Sinne der Datei.

## 1. Urteil in fünf Zeilen

Ich würde die Seite meinem Vorstand als Erklärung empfehlen, warum die „13,8 Billionen“
keine Rechnung sind, die auf unserer Stromrechnung landet. Das ist sauber gemacht.
Für meine eigentliche Arbeit (Strompreis, Netzentgelte, Planbarkeit) hilft sie wenig, und an
der einzigen Stelle, an der sie den Industriestrompreis erklärt (GP3), erklärt sie ihn
eher weg. Dort lese ich einen Satz, den ich mit den Daten aus dem eigenen Repository
widerlegen kann. Zitieren würde ich Akt 4 (drei Größen) und Akt 4/Schritt 4 (Netz).
GP3 würde ich in dieser Form öffentlich angreifen.

## 2. Befunde

### Kritisch

**K1 · GP3: „Der Abstand ist älter als die Energiekrise und zuletzt kleiner geworden.“**

- *Fundstelle:* Story, Kasten „Gegenposition GP3 · Hier hat R21 recht · Strom ist in
  Deutschland teurer als im EU-Mittel“, Absatz „Einschränkung“. Gleich auf der
  Belegseite, GP3 („Der Abstand ist älter als die Krise und zuletzt kleiner geworden.“).
  Freigabeliste Abschnitt 5, GP3.
- *Problem:* Der Satz ist für das eine Verbrauchsband, das die Seite zeigt, wahr. Als
  Einschränkung einer „Hier hat R21 recht“-Aussage führt er einen Industrie-Leser aber in
  drei Punkten in die Irre:
  1. **Der Abstand vor der Krise bestand aus Steuern und Umlagen, vor allem der EEG-Umlage.**
     Ohne Steuern und Abgaben (Eurostat-Stufe X_TAX) lag Deutschland im 1. Hj. 2019
     *unter* dem EU-Mittel: Band 2.000–19.999 MWh 7,17 gegen 7,47 ct/kWh (0,96-fach),
     Band 20.000–69.999 MWh 5,82 gegen 6,62 ct/kWh (0,88-fach). Den ganzen Abstand
     machten also Steuern und Umlagen aus. In der Industrie-Zusammensetzung 2019 sind von
     8,7 ct Steuern und Abgaben 6,0 ct EEG (Dossier 10, Tab. 2.4; Prüfbericht 10, KA 5
     bestätigt). „Älter als die Krise“ heißt hier also nicht „hat mit der Energiewende
     nichts zu tun“. Es heißt: Der alte Abstand bestand zum größten Teil aus den Kosten
     der Energiewende-Förderung, die damals auf den Strompreis umgelegt wurden.
  2. **Kleiner wurde der Abstand vor allem, weil diese Umlage in den Bundeshaushalt
     gewandert ist,** nicht weil die Versorgung billiger wurde. Die EEG-Position sank in
     der Industrie von 6,0 auf 0,2 ct (2019 → 2025). Vor Steuern und Abgaben ist es
     umgekehrt: Deutschland lag 2026-S1 *über* dem EU-Mittel (Band ID 13,82 gegen
     13,06 ct, 1,06-fach; Band IE 11,95 gegen 11,71 ct, 1,02-fach). Seit 2019 stieg der
     Preis vor Steuern in Deutschland um 93 % (ID) bzw. 105 % (IE), im EU-Mittel um 75 %
     bzw. 77 %. Der Teil des Abstands, den Energie und Netz ausmachen, ist neu und
     gewachsen.
  3. **Bei größeren Abnehmern ist der Abstand nicht kleiner geworden.** Im Band IE
     (20.000–69.999 MWh, ohne MwSt) stieg das Verhältnis Deutschland zu EU-Mittel von
     1,07 (2019-S1) auf 1,09 (2026-S1), Deutschland zu Frankreich von 1,26 auf 1,50.
     Prüfbericht 10 hat genau das angemerkt („Die Richtung hängt am Verbrauchsband“,
     Abschn. 3, Nr. 6; Korrektur `kernaussage_3_abstand_eu`). In die Freigabeliste kam nur
     das Band ID.
- *Warum kritisch:* Ein energieintensiver Betrieb liegt in den Bändern IE bis IG, nicht
  in ID. Für ihn ist die Einschränkung in ihrer Richtung falsch. Und sie nimmt einer
  Aussage, die R21 zugestanden wird, das Gewicht. Dabei ist das genau der Satz, für den
  ein Industrieleser die Seite aufschlägt.
- *Beleg:* `data/p1_10_energiepreise_halbjahr.csv` (Eurostat `nrg_pc_205`, Stufen X_TAX
  und X_VAT, 2019-S1 und 2026-S1); `research/10_wirtschaftslage.md` Tab. 2.4;
  `research/pruefung/10_pruefung.md` KA 3, KA 5, Abschn. 3 Nr. 6.
- *Änderungsvorschlag (über die Freigabeliste, R06 erweitern):* Einschränkung ersetzen
  durch sinngemäß: „Vor der Krise bestand der Abstand vor allem aus Steuern und Umlagen,
  darunter die EEG-Umlage. Ohne Steuern und Abgaben lag Deutschland 2019 unter dem
  EU-Mittel. Kleiner wurde der Abstand vor allem, weil der Bund die EEG-Kosten seit 2022
  aus dem Haushalt zahlt (siehe GP10). Vor Steuern liegt Deutschland heute über dem
  EU-Mittel. Bei Abnehmern von 20 bis 70 GWh im Jahr ist der Abstand nicht kleiner
  geworden; zu Frankreich ist er gewachsen (1,26 → 1,50).“ Den Halbsatz zum Gaspreis
  siehe M2. Das Verbrauchsband gehört in den Kasten (siehe M3).

### Mittel

**M1 · Netzentgelte: ein Halbsatz, keine Zahl, keine Brücke von den Netz-Milliarden zur Rechnung.**

- *Fundstelle:* Story, GP3: „die Netzentgelte stiegen.“ Akt 4/Schritt 4 und GP9 bis GP11
  nennen Netzinvestitionen nur in Mrd. € (675 / 732 / 792 Mrd., > 460 Mrd., 323 → 440
  Mrd.) sowie „Über die Netzentgelte zahlen Kundinnen und Kunden aber Abschreibung und
  Verzinsung mit“ (GP9).
- *Problem:* Für mich ist das Netzentgelt der Teil des Preises, der am direktesten am
  Umbau hängt und den ich nicht am Terminmarkt absichern kann. Die Seite nennt ihn, aber
  beziffert ihn nicht, obwohl die Zahlen im Repository liegen:
  - Eurostat, Industrie Band ID: Netzentgelt 3,1 → 5,5 ct/kWh (2019 → 2025), also +77 %
    (Dossier 10, Tab. 2.4; Prüfbericht 10, KA 5: 3,13 → 5,54, bestätigt, B).
  - ef.Ruhr/EWI 2024 (auf der Seite schon als Q17 geführt und „gelesen“): Im
    Basisszenario bedeutet der Netzausbaubedarf bis 2045 „eine Steigerung der
    Netzentgelte von … 7,0 Cent/kWh für Industriekunden“, Haushalte 18,0, Gewerbe 15,2
    ct/kWh. Das ist der Anstieg 2045 gegenüber 2023 (Abb. 6, „Möglicher Anstieg der
    Netznutzungsentgelte in Deutschland im Jahr 2045 gegenüber 2023“), Geldwert 2024,
    WACC 5,5 %, Wälzung „analog zu Heute“ (Original, Zusammenfassung und Kap. 3.2,
    Text Z. 120–137 und 590–606 der Textfassung).
  - DIHK-Ergänzungsstudie (Frontier, 27.10.2025): Netzentgelte bis 2045 „+70 % und mehr
    Industrie, fast +130 % Großverbraucher“, nur aus der Pressemitteilung
    (`research/02_kostenstudien.md`). Höchstens Konfidenz C.
- *Beleg:* wie oben.
- *Änderungsvorschlag:* In GP9 oder GP11 ein Satz mit Freigabe: „Was das für die Rechnung
  heißt: Eine von uns gelesene Netzstudie (ef.Ruhr/EWI 2024, für einen
  Verteilnetzbetreiber) rechnet für Industriekunden bis 2045 mit rund 7 ct/kWh mehr
  Netzentgelt als 2023, in Preisen von 2024. Heute liegt es für mittlere
  Industriekunden bei rund 5,5 ct/kWh.“ Dazu als Einschränkung, dass die Aufteilung auf
  die Kundengruppen dort eine Annahme ist und der Auftraggeber ein Netzbetreiber.

**M2 · „Seit 2021 trieb vor allem die Beschaffung den Preis, also der Gaspreis.“**

- *Fundstelle:* Story GP3, Einschränkung; Belegseite GP3 („Haupttreiber seit 2021 war die
  Beschaffung (Gaspreis)“).
- *Problem:* Bei Eurostat ist „Beschaffung“ der Posten „Energie und Versorgung“. Er
  enthält den Großhandelspreis, damit auch den eingepreisten CO₂-Preis des
  Emissionshandels, und die Marge des Lieferanten (Dossier 10, unter Tab. 2.4). Der
  CO₂-Anteil ist im Dossier ausdrücklich „nicht quantifiziert … Lücke“ (Tab. 2.5). „Also
  der Gaspreis“ setzt Beschaffung mit Gaspreis gleich. Damit verschwindet der Teil, der
  aus der Klimapolitik kommt, aus dem Bild. Den Vorbehalt „Zuordnung der Ursachen nur
  schwach (Konfidenz C)“ druckt die Seite. Die Gleichsetzung im Satz davor nimmt er nicht
  zurück.
- *Änderungsvorschlag:* „Seit 2021 trieb vor allem die Beschaffung den Preis, also der
  Großhandelspreis. Den bestimmt überwiegend der Gaspreis; der CO₂-Preis steckt ebenfalls
  darin, wir haben ihn nicht beziffert.“

**M3 · Welcher Abnehmer? Verbrauchsband, Steuerstufe und Entlastungen fehlen in der Story.**

- *Fundstelle:* Story GP3: „Industriestrom (ohne Mehrwertsteuer) kostete … 17,4 gegen
  15,6 ct/kWh“; Akt-5-Leiste „Strompreis Industrie · Deutschland 17,4 · EU 15,6 ct/kWh
  (erstes Halbjahr 2026)“. Das Band nennt nur die Belegseite („Abgrenzung laut Datensatz:
  Band 2.000–19.999 MWh“).
- *Problem:* 2 bis 20 GWh im Jahr ist ein mittelständischer Abnehmer, kein
  energieintensiver Betrieb. Die Zahl taugt, um R21s „hohe Strompreise“ zu prüfen. Für die
  Frage „Wird die Lage der Industrie ernst genommen?“ ist sie der falsche Abnehmerfall,
  und die Richtung des Befunds hängt am Band (K1, Punkt 3). Zwei Ungenauigkeiten kommen
  dazu: Die Eurostat-Stufe X_VAT heißt „ohne MwSt und andere erstattbare Steuern“, nicht
  nur „ohne Mehrwertsteuer“. Und große Verbraucher zahlen mit Entlastungen deutlich
  andere Preise (Strompreiskompensation, besondere Netzentgelte, Stromsteuer). Dossier 10
  nennt nach KfW (Quelle BDEW) 14 ct/kWh für Großverbraucher mit Entlastungen 2024.
- *Änderungsvorschlag:* In der Story einmal den Abnehmerfall nennen („Unternehmen mit 2
  bis 20 GWh Jahresverbrauch“) und einen Satz anfügen: „Große energieintensive Betriebe
  zahlen wegen Entlastungen anders; für Abnehmer bis 70 GWh ist der Abstand zur EU nicht
  kleiner geworden.“ Den BDEW-Wert nur mit Freigabe und mit seiner Konfidenz aufnehmen.

### Klein

**k1 · Bundesbank-Szenario und tatsächliche Preise.**
Story GP2: Die Bundesbank rechnet mit „dauerhaft mehr als verdoppelte[n]
Energiepreise[n]“. Industriestrom (Band ID, ohne MwSt) stieg 2019-S1 → 2026-S1 um 33 %,
Industriegas (Band I3) von 3,2 auf 6,8 ct/kWh, also gut auf das Doppelte (Dossier 10,
Abschn. 2.3). Für Gas trifft die Voraussetzung des Szenarios also ungefähr zu, für Strom
nicht. *Vorschlag:* Halbsatz „Die Voraussetzung trifft heute etwa für Gas zu, nicht für
Strom.“ Das hilft beiden Seiten: R21 bekommt eine Größenordnung, und es bleibt klar, dass
es keine Zuschreibung an die Energiewende ist.

**k2 · Frankreich als Gegenbeispiel fehlt in GP2.**
Prüfbericht 10 (Abschn. 3, Nr. 1) schlägt vor, Frankreich aufzunehmen: trotz billigerem
Strom Metall −24,6 %, Glas/Keramik −18,7 % gegenüber 2019. Das passt zu „Die Ursachen sind
nicht zerlegt“ und schützt die Seite vor dem Vorwurf, sie sähe den Rückgang allein beim
Strompreis oder gar nicht dort. *Vorschlag:* ein Satz in der Einschränkung von GP2.

**k3 · GP10, EEG-Konto: Die Verlagerung ist auch eine Frage der Planbarkeit.**
„Diese Summe sieht man auf keiner Stromrechnung“ trifft zu. Für den Einkäufer zählt aber
die andere Seite: Dass sie heute nicht auf der Rechnung steht, hängt am Haushalt und
kann sich mit jedem Haushalt ändern. *Vorschlag:* Halbsatz „… und sie hängt an
Haushaltsentscheidungen, nicht an einer festen Regel“. Belegt durch die Tatsache der
jährlichen Haushaltsfinanzierung (Drs. 20/14522). Weitere Zahlen dafür sind nicht nötig.

**k4 · Akt-5-Leiste „Strompreis Industrie“ ohne Band und Steuerstufe.**
In der Grafik steht „Deutschland 17,4 · EU 15,6 ct/kWh (erstes Halbjahr 2026)“ ohne den
Hinweis auf Band und „ohne MwSt“. Wer nur die Grafik ansieht, liest einen allgemeinen
Industriestrompreis. *Vorschlag:* „(2–20 GWh/a, ohne MwSt)“ ergänzen.

## 3. Was fehlt aus Sicht der Rolle

- **Eine Übersetzung in €/MWh.** Alle Mehrkosten stehen als Prozent des BIP. Meinem
  Vorstand sagt „0,4 bis 2,9 % des BIP pro Jahr“ nichts. Gefragt wird: Was heißt das je
  MWh, und welcher Teil kommt über Netzentgelte, Umlagen und Steuern bei uns an? Teil 1
  sagt ehrlich „Keine Zahl sagt, wer zahlt“. Ich wünsche mir, dass Teil 6 das als
  ausdrückliche Zusage übernimmt (Kosten je MWh nach Kundengruppe, getrennt nach
  Energie, Netz, Umlagen und Steuern).
- **Die Zusammensetzung des Industriestrompreises als Grafik.** Die Daten liegen in
  `data/p1_10_strompreis_komponenten_de.csv` (Beschaffung 3,1 → 10,5; Netz 3,1 → 5,5;
  Steuern und Abgaben 8,7 → 3,9 ct/kWh, 2019 → 2025). Ein gestapelter Balken 2019 gegen
  2025 würde K1 und M1 auf einen Blick zeigen und die Ursachenfrage ehrlicher machen als
  jeder Satz.
- **Internationaler Vergleich über die EU hinaus.** Für Standortentscheidungen zählen die
  USA und China. Die Seite vergleicht nur mit dem EU-Mittel. Das ist ein Mittel aus teuren
  und billigen Ländern (Italien 19,9, Frankreich 12,4, Spanien 11,8 ct). Die Werte für USA
  und China liegen im Dossier nur auf Stufe C. Dann wenigstens einen Satz, dass der
  Abstand zu Nordamerika vor allem beim Gas besteht (KfW, gelesen: Großhandel Gas 1. Hj.
  2025 Europa 41 gegen Nordamerika 11,5 €/MWh, B).
- **Planbarkeit:** Terminpreise, Bundeszuschüsse und ihre Befristung, der Zuschuss zu den
  Übertragungsnetzentgelten 2026 (im Repository nur als B, nicht primär gelesen,
  `research/05_speicher_dunkelflaute.md`). Teil 1 muss das nicht leisten. Die
  Grenzen-Liste sollte aber sagen, dass Teil 1 nichts über künftige Preise für einzelne
  Kundengruppen aussagt.
- **R21s Preisvergleich 8,2 gegen 38 ct (Factsheet B).** Dossier 01 nennt ihn „Ungleiches
  verglichen“. Für Industriekunden ist er irrelevant, weil er den Haushaltspreis nimmt. Ein
  Hinweis, dass der Vergleich in Teil 6 kommt, würde die Lücke schließen.

## 4. Was gut ist und so bleiben soll

- Akt 4 „Drei Größen“: Die Trennung Brutto-Gesamtkosten / Brutto-Investitionen /
  Mehrkosten ist das Nützlichste der Seite. So erkläre ich das ab jetzt intern.
- Netz-Abschnitt (Akt 4/Schritt 4): 2.100 Mrd. gegen 1,2 Bio. € Netz in „Plan B“, mit
  dem offenen Eingeständnis, dass die gemeinte Veröffentlichung unbekannt ist.
- GP2 und GP3 stehen als „Hier hat R21 recht“ da und nicht als Fußnote. Die Industrie
  kommt also vor. Auch GP10 gehört hierher: Der Satz, dass EEG-Kosten in den Haushalt
  verschoben wurden, ist für Industrieleser wichtig.
- „Mehrkosten sind nicht gleich Belastung“ und „Die Ursache des Industrierückgangs ist
  offen“ in den Grenzen: ehrlich, und so bleibt die Seite unangreifbar gegen den Vorwurf,
  sie rechne die Krise klein.
- GP9: Zinsen fehlen in den Summen. Das ist der Punkt, den die meisten Kostenvergleiche
  unterschlagen, und genau der, der über Netzentgelte bei uns ankommt.
- Technisch: keine fremden Server, Zahlen mit Quelle und Konfidenz-Abzeichen, mobil
  lesbar.

## 5. Der härteste Einwand

„Die Seite sagt, Deutschlands Industriestrom sei zwar teurer als im EU-Mittel, der
Abstand sei aber ‚älter als die Energiekrise und zuletzt kleiner geworden‘. Das klingt
beruhigend und stimmt nur für mittelgroße Abnehmer. Vor der Krise bestand der Abstand
aus Steuern und der EEG-Umlage, also aus den Kosten der Energiewende-Förderung. Ohne
Steuern lag Deutschland 2019 sogar unter dem EU-Schnitt. Kleiner wurde der Abstand, weil
der Staat die EEG-Kosten in den Haushalt verschoben hat, nicht weil Strom billiger
wurde. Vor Steuern liegen wir heute über dem EU-Schnitt. Für Betriebe ab 20 GWh ist der
Abstand zum EU-Mittel gar nicht geschrumpft, zu Frankreich ist er auf das Anderthalbfache
gewachsen. Die Netzentgelte, die mit dem Ausbau weiter steigen, sind in einem Halbsatz
abgehandelt, obwohl eine Studie aus der eigenen Quellenliste dafür bis 2045 rund
7 Cent je Kilowattstunde mehr ausweist. Eine Seite, die R21 Ungenauigkeit nachweist,
sollte bei den Preisen, die die Industrie tatsächlich zahlt, nicht ungenauer sein als das
Papier, das sie prüft.“
