# Dossier 08 · Wasserstoff, E-Fuels und der Lkw (Teil 5)

Stand 22.11.2026 · Phase 1 · Auftrag P1-08 · Rechercheur: Sonnet (Agent) ·
Quellenzugriff nach `agents/REGELN.md`. Primär gelesen sind die Dokumente, die
im Manifest `quellen/manifest_P1-08.json` mit Prüfsumme stehen (18 Dateien).
Alles andere stammt aus Suchtreffer-Auszügen und trägt `primaer_gelesen: false`
und nie Stufe A.

Zahlen in diesem Dossier sind brutto Energiemengen am Verbraucher (Endenergie,
Heizwert/LHV), sofern nicht anders vermerkt. Umrechnung: 1 TWh = 3,6 PJ.
„Setzung (M)“ heißt: eigene Annahme, in der Spalte Abgrenzung begründet.

## 1. Kernaussagen

1. **Der Elektrolyse-Hochlauf in Deutschland liegt weit hinter dem Ziel.**
   Ende März 2026 waren 180,5 MW in Betrieb (Ziel der Wasserstoffstrategie 2023:
   10 GW bis 2030); 1,27 GW haben eine Investitionsentscheidung oder sind im Bau.
   Konservativ rechnet die KfW bis Ende 2030 mit bis zu 2,4 GW, Marktschätzungen
   (über die DIHK-Studie zitiert) liegen bei 2,4 bis 6,6 GW. **Konfidenz B**
   (EWI-Datenbank, KfW und DIHK/r2b stützen sich auf dieselbe Grundlage;
   primär gelesen).
2. **Die Kosten sind nicht gefallen, wie erwartet.** DIHK/r2b: Elektrolyse-Investition
   weiter bei 2.000–3.000 €/kW, „entgegen früheren Erwartungen“; Großhandelsindex
   für grünen Wasserstoff knapp über 8 €/kg; Spanne der Studien für 2040:
   2,5–7,5 €/kg. **B**, primär gelesen. Gegenbild (nur Suchtreffer, C): In China
   werden Elektrolyseure für 500–1.100 USD/kW installiert, außerhalb für
   1.900–2.500 USD/kW.
3. **Lkw: Der Batterie-Lkw braucht für dieselbe Transportleistung etwa
   40 bis 45 % des Stroms eines Brennstoffzellen-Lkw.** UBA-Gesamtwirkungsgrad aus
   erneuerbarem Strom: Batterie-Lkw 73 %, Brennstoffzellen-Lkw 31 %, Diesel-Lkw
   mit E-Fuel 21 %. Der Faktor 2,35 (73/31) gilt für die Kette bis zum Rad.
   **B**, primär gelesen (eine Quelle, UBA-Eigenrechnung ohne offene Rechenschritte).
4. **Im Modell kostet „Lkw 100 % Wasserstoff statt Batterie“ rund 140 TWh Strom
   und rund 56 GW Elektrolyse mehr (Bandbreite 75–215 TWh bzw. 23–107 GW), wenn
   alles im Inland erzeugt wird.** Setzung (M) mit Quellen für die Einzelfaktoren;
   Formel in Abschnitt 7, Skript `scripts/p1_08_regler.py`. **C** (Modellrechnung
   auf B-Parametern).
5. **Der Importanteil verschiebt den Strombedarf ins Ausland, er senkt ihn nicht.**
   Bei 100 % Import fällt der deutsche Strombedarf für Wasserstoff und E-Fuels auf
   null; der Gesamtstrombedarf im Ausland bleibt (mittlere Setzung: rund 560 TWh
   bei „Lkw Batterie“, rund 780 TWh bei „Lkw Wasserstoff“), ohne Transportverluste.
   Ariadne (2025) sieht 2045 Importe von 60–250 TWh Wasserstoff und 100–125 TWh
   E-Fuels, also mindestens 160–200 TWh. **B**, primär gelesen.
6. **Flug und Schiff sind der unstrittige Kern des E-Fuel-Bedarfs.** Ariadne:
   180–195 TWh synthetische und biogene Kraftstoffe im Verkehr 2045, davon etwa
   90 % internationaler Verkehr; Agora (Dez. 2024): rund 155 TWh Power-to-Liquid.
   Heute: Kerosin-Absatz in Deutschland 2023 rund 112 TWh (402 PJ).
   **B** (zwei Modellfamilien, unterschiedliche Abgrenzung; primär gelesen).
7. **E-Kerosin ist heute ein Vielfaches des fossilen Preises, und die Streuung
   zwischen den Quellen ist riesig.** Modellrechnungen (Batteiger 2022 über UBA
   2025): 168–219 €/MWh in Deutschland 2030, 89–166 €/MWh 2050 (an Standorten
   mit Spanien/Marokko-Bedingungen), also rund 0,85–2,1 €/Liter; der EASA-Auszug
   nennt dagegen 6.820–8.590 €/t, also rund 6 €/Liter. Fossil: etwa 0,5–0,65 €/Liter.
   **C** für die Spanne, **B** je Einzelquelle. Der Break-even-CO₂-Preis liegt in
   der UBA-/LBST-Rechnung bei 300–620 €/t CO₂.
8. **Die Infrastruktur ist weiter als die Nachfrage.** Genehmigtes Kernnetz
   9.040 km, 9.241 km bis 2037 im zweiten NEP-Entwurf (24,3 Mrd. €); die
   Kapazitätsreservierungen (Stand 13.05.2026) summieren sich auf 2,9 GW Ein-
   und Ausspeisung bei 101/87 GW Auslegung. DIHK/r2b: das Netz „hängt in der Luft“.
   **B**, primär gelesen.
9. **Pkw mit E-Fuels und Wasserstoff im Gebäude verlieren die Effizienzrechnung
   deutlich:** drei- bis sechsfacher Strombedarf gegenüber Batterie-Pkw (UBA,
   primär gelesen, B); vier- bis fünffacher gegenüber der Wärmepumpe (UBA,
   Suchtreffer, C). Die Befürworter-Position (eFuel Alliance/Porsche Consulting,
   März 2026) beruht auf der Bestandsflotte und ist Industrienah; nur Suchtreffer.
10. **Die Datenlücke bei Lkw-Zahlen ist groß.** Brennstoffzellen-Lkw-Bestand,
    Zulassungen und €/km-Werte der Studien konnten nicht aus Primärquellen gelesen
    werden (KBA, ICCT, Fraunhofer ISI, NOW nicht freigegeben). Die zwei
    gefundenen E-Lkw-Zulassungszahlen 2025 widersprechen sich (4.200 gegen 1.398).

## 2. Der Bedarf, der sich nicht direkt elektrifizieren lässt

### 2.1 Heutige Mengen

| Größe | Wert | Quelle, Fundstelle | Abgrenzung | Konf. | primär |
|---|---|---|---|---|---|
| Wasserstoffverbrauch Deutschland 2024 | 49,9 TWh (43,2 fossil, 0,4 Elektrolyse, 6,3 Nebenprodukte) | DIHK/r2b 2026, S. 15 (nach European Hydrogen Observatory 2026) | stofflich und energetisch, fast ganz fossil | B | ja |
| Wasserstoffbedarf bestehend | rund 55 TWh | UBA TEXTE 96/2025, S. 16, Fn. 1 (nach BMWK 2023) | „bereits heute bestehender, über CO₂-intensiven Wasserstoff gedeckter Bedarf“ | B | ja |
| Kerosin-Absatz Deutschland 2023 | 402 PJ = 111,7 TWh | UBA TREMOD 2024 (TEXTE 125/2025), Tab. 36 | Absatz laut Energiebilanz, inkl. Tankering und Auslandsflüge | B | ja |
| Kerosin-Verbrauch Flugverkehr 2023 | 330,4 PJ = 91,8 TWh, davon international 314,9 PJ = 87,5 TWh | ebd., Tab. 34, S. 64 | berechneter Verbrauch (Inland-Abflug); Differenz zum Absatz −4 % bis +22 % | B | ja |
| Anteil Flugkraftstoffe am Kraftstoffverbrauch 2024 | 16 % (Diesel 49,4 %, Benzin 29,5 %) | UBA, „Energieverbrauch und Kraftstoffe“ (Webseite, abgerufen 22.11.2026) | Energiegehalt, ohne Strom | B | ja |
| Schiffskraftstoffe (See-Bunker) | **nicht gefunden** | – | – | – | – |
| Kohle in der Metallerzeugung 2021 | 56 TWh | Ariadne 2025, PDF-S. 47 | Roheisen/Stahl/Ferrolegierungen | B | ja |
| Wasserstoffbedarf der geplanten Direktreduktionsanlagen | rund 26 TWh für 16 Mio. t Stahl | Agora Energiewende, Pressemitteilung 04.07.2024, S. 2 | nur bisher geplante Anlagen | B | ja |

### 2.2 Szenariowerte 2030 und 2045

| Größe | 2030 | 2045 | Quelle, Fundstelle | Abgrenzung | Konf. | primär |
|---|---|---|---|---|---|---|
| Wasserstoff und Derivate, Gesamtbedarf | 95–130 TWh (NWS) | 360–500 TWh Wasserstoff plus rund 200 TWh Derivate (NWS) | UBA TEXTE 96/2025, S. 16, Fn. 1; Ariadne 2025, PDF-S. 64 | Annahmen der Bundesregierung (Nationale Wasserstoffstrategie 2023), kein Modellergebnis | B | ja |
| Wasserstoff, Modellergebnisse Ariadne | – | 175–350 TWh (PyPSA-DE, REMIND), 330–420 TWh (REMod) | Ariadne 2025, PDF-S. 64, Kap. 6.1.2 | Szenario „Technologiemix“; enthält Wasserstoff für E-Fuel-Herstellung (22–66 TWh) und Rückverstromung (20–55 TWh) | B | ja |
| Derivate/E-Fuels, Modellergebnisse Ariadne | – | 85–165 TWh | ebd. | wie oben | B | ja |
| Wasserstoff, Industrie (Stahl, Ammoniak) | – | 102–253 TWh (Bandbreite der Modelle); PyPSA-DE: 102 TWh | ebd., PDF-S. 64 und 81 | Technologiemix | B | ja |
| Wasserstoff in der Stahlindustrie | – | 65–90 TWh (Mix: 78 TWh); 29 Mio. t H₂-Direktreduktion | Ariadne 2025, PDF-S. 47 | Endenergie Metallerzeugung | B | ja |
| Schiffs- und Flugverkehr, nichtelektrischer Bedarf | – | 51–128 TWh | ebd., PDF-S. 23 | Hybrid-Modell, Technologiemix | B | ja |
| Synthetische und biogene Kraftstoffe im Verkehr | – | 180–195 TWh (Technologiemix, Fokus Elektrifizierung, Fokus Wasserstoff); 205 (Hohe Nachfrage); 160 (Niedrige Nachfrage); rund 90 % internationaler Verkehr | ebd., PDF-S. 29, Kap. 3.1 | enthält biogene Anteile, Anteil nicht ausgewiesen | B | ja |
| Wasserstoff, Agora | – | knapp 270 TWh, überwiegend Importe | Agora, „Klimaneutrales Deutschland“, 16.12.2024, Abschnitt „Biomasse, Wasserstoff und CCS“ | Szenario der Studie, Finanzierung nicht geprüft | B | ja |
| Power-to-Liquid, Agora | – | 155 TWh, vor allem Flugverkehr | ebd. | wie oben | B | ja |
| Wasserstoffbedarf 2040 (Spanne aktueller Studien) | – | 200–250 TWh (2040) | DIHK/r2b 2026, S. 16, Abb. 2-3 | Literaturübersicht | B | ja |
| Zusatzbedarf stoffliche Energie bei „Fokus Wasserstoff“ | – | rund 250 TWh mehr als Technologiemix, „maßgeblich“ durch Wasserstoff in der Industrie (Prozesswärme) | Ariadne 2025, PDF-S. 23 | Differenz zweier Szenarien | B | ja |

**Hochtemperatur-Prozesswärme:** Ein eigener TWh-Wert für Hochtemperatur-
Prozesswärme steht in den gelesenen Dokumenten nicht. Ariadne nennt nur die
Differenz „Fokus Wasserstoff“ gegen „Technologiemix“ (rund 250 TWh) und den
Satz, in „Fokus Wasserstoff“ werde im Industriesektor mehr Wasserstoff für die
Prozesswärme genutzt (PDF-S. 64). Eintrag unter Lücken.

**Warum die Spannen so groß sind:** Die Industrie-Nachfrage hängt an der Frage,
ob Ammoniak und Eisenschwamm in Deutschland oder im Ausland hergestellt werden.
Ariadne (PDF-S. 81): „Im Falle einer Verlagerung der Herstellung von Ammoniak
und des Zwischenprodukts Eisenschwamm … ins Ausland würde mehr als die Hälfte
der Nachfrage nach Wasserstoff wegfallen.“

## 3. Lkw

### 3.1 Bestand, Fahrleistung, Verbrauch

| Größe | Wert | Quelle, Fundstelle | Abgrenzung | Konf. | primär |
|---|---|---|---|---|---|
| Bestand schwere Nutzfahrzeuge (> 3,5 t), Güterverkehr | 759.000 (Jahresmitte 2023); davon 98,5 % Diesel, 0,90 % CNG/LNG, 0,58 % batterieelektrisch | UBA TREMOD 2024, Tab. 12, S. 46 (Quelle KBA, eigene Annahmen) | Solo-Lkw und Sattelzüge; Wasserstoff-Lkw nicht ausgewiesen | B | ja |
| Fahrleistung schwere Nutzfahrzeuge | 60,5 Mrd. km (2023); 60,1 Mrd. km (2024, UBA-Webseite) | TREMOD Tab. 22, S. 47; UBA „Emissionen des Verkehrs“ | Inlandsfahrleistung | B | ja |
| Energieverbrauch schwere Nutzfahrzeuge Inland | 611 PJ = 169,7 TWh (2023) | TREMOD Tab. 41, S. 83 | fast ausschließlich Diesel; Mittel 2,8 kWh/km (28 l/100 km), eigene Division | B | ja |
| Diesel gesamt (alle Sektoren) Absatz 2023 | 1.415 PJ = 393 TWh; Biokraftstoffe darin 97 PJ = 26,9 TWh (6,9 %) | TREMOD Tab. 36 | Energiebilanz | B | ja |
| Batterie-Lkw Neuzulassungen 2025 | rund 4.200 (> 3,5 t, knapp 12 % Anteil) **gegen** 1.398 | Suchtreffer (eurotransport.de, dpa/Destatis; Verkehrsrundschau) | Quellen widersprechen sich in Abgrenzung; nicht auflösbar | C | nein |
| Elektro-Lkw-Bestand 2024 | rund 7.600, unter 1,5 % des Lkw-Bestands, Sattelzugmaschinen 0,4 % | Suchtreffer (Eurostat-Auswertung) | – | C | nein |
| Brennstoffzellen-Lkw Bestand/Zulassungen Deutschland | **nicht gefunden**; UBA: „nur eine kleine Anzahl von Fahrzeugen im Einsatz“ | UBA FAQ „Wasserstoff im Verkehr“ (Webseite) | – | – | ja (qualitativ) |
| Wasserstofftankstellen Deutschland | rund 80 (Stand 2025), teils wirtschaftlich rückgebaut | UBA FAQ | alle Fahrzeugtypen | B | ja |
| Brennstoffzellen-Busse gegen Batterie-Busse 2025 | 339 gegen 3.375 | UBA FAQ | Omnibusse | B | ja |

### 3.2 Technik und Hersteller

- Mercedes-Benz eActros 600: Serienauslieferung seit Dezember 2024, Batterie über
  600 kWh, Herstellerangabe 500 km ohne Zwischenladen (40 t, 20 °C, vorkonditioniert),
  Laden mit bis zu 400 kW (CCS), Vorrüstung für MCS (Megawatt-Laden) bei
  noch ausstehender Normierung. **C**, Pressemitteilung nur im Suchtreffer.
- Daimler GenH2 (Brennstoffzelle): fünf Fahrzeuge im Kundenversuch, Testfahrt
  1.047 km mit einer Füllung; Daimler verfolgt „dual strategy“. Zeitpunkt einer
  Serienproduktion: **nicht gefunden**. **C**.
- UBA (FAQ): Batterie-Lkw im Stadt- und Regionalverkehr bereits möglich; im
  Fernverkehr werde der Brennstoffzellen-Einsatz intensiver diskutiert, weil
  rein batterieelektrischer Fernverkehr „in den nächsten Jahren … noch
  unwahrscheinlich“ sei. Oberleitungs-Lkw-Projekte wurden Ende 2024/2025 nicht
  fortgeführt (Wortlaut der Fundstelle nicht vollständig gelesen).
- Ariadne (PDF-S. 27): Lkw bis 12 t langfristig nur noch elektrisch; im
  Schwerlastverkehr „unter günstigen Rahmenbedingungen (niedriger
  Wasserstoffpreis, geringe Kosten für Brennstoffzellen, flächendeckender
  Infrastrukturausbau)“ auch Brennstoffzellen-Lkw, „andernfalls … elektrische Lkw“.

### 3.3 Gesamtkosten (TCO)

| Aussage | Quelle | Konf. | primär |
|---|---|---|---|
| Brennstoffzellen-Lkw 2030 ohne staatliche Steuerung mehr als 40 % höhere Gesamtbetriebskosten als Batterie-Lkw | UBA FAQ „Wasserstoff im Verkehr“, Frage 9 (UBA-Eigenrechnung auf Daten der NOW) | B | ja |
| Fernverkehrs-Brennstoffzellen-Lkw erreicht Dieselkosten-Parität 2030 bei rund 4 €/kg Wasserstoff an der Zapfsäule | ICCT 2022 (Suchtreffer) | C | nein |
| Batterie-Lkw 2030 in 99,6 % der Einsatzprofile günstiger als Diesel; Brennstoffzellen-Lkw nur in Nischen | TNO-Studie für Agora Verkehrswende und T&E (Suchtreffer, transport-online.de). Auftraggeber sind Interessenvertreter der Elektrifizierung | C | nein |
| Batterie-Lkw ist 2030 für die meisten Lkw-Klassen der kostengünstigste Dekarbonisierungspfad | ICCT, Nov. 2023 (Suchtreffer) | C | nein |
| Brennstoffzellen-Lkw nur bei sehr niedrigen Wasserstoffpreisen im Fernverkehr eine Rolle | Ariadne 2025, PDF-S. 25 | B | ja |

**Werte in ct/km oder €/km:** In keinem gelesenen Primärdokument stehen
Gesamtkosten je km; die Studien dazu (ICCT, Fraunhofer ISI, NOW) liegen auf nicht
freigegebenen Hosts. Eintrag unter „Nicht erreichbar“.

### 3.4 Strombedarf für dieselbe Transportleistung

Ausgangswert: 170 TWh Dieselenergie des Straßengüterverkehrs (> 3,5 t; 2023).
Setzung (M): gleich hohe Transportleistung 2045 (Spanne 130–185 TWh, ohne Beleg;
Effizienzgewinne und Verlagerung auf die Schiene würden senken, Verkehrswachstum
erhöhen).

| Variante | Strom je TWh Dieselenergie (low / mid / high) | Strombedarf bei 170 TWh |
|---|---|---|
| 100 % Batterie-Lkw | 0,40 / 0,50 / 0,58 | rund 85 TWh (Bandbreite 52–107 über alle Setzungen) |
| 100 % Brennstoffzellen-Lkw, Wasserstoff aus dem Inland | 0,97 / 1,32 / 1,74 | rund 225 TWh (Bandbreite 127–321 über alle Setzungen, Industrie-H₂ nicht enthalten) |
| Verhältnis | 2,0–3,0 (UBA: 2,35) | |

Herleitung der Faktoren in Abschnitt 7.

## 4. Wirkungsgradketten

| Kette | Gesamtwirkungsgrad Strom → Nutzenergie | Strom je km relativ zu Batterie | Quelle, Fundstelle | Konf. | primär |
|---|---|---|---|---|---|
| Strom → Batterie → Rad, Lkw | 73 % | 1 | UBA FAQ „Wasserstoff im Verkehr“, Frage 8 | B | ja |
| Strom → H₂ (Elektrolyse, Verdichtung, Kühlung) → Brennstoffzelle → Rad, Lkw | 31 % | 2,35 | ebd. | B | ja |
| Strom → E-Fuel (PtL) → Dieselmotor, Lkw | 21 % | 3,5 | ebd. | B | ja |
| Batterie-Pkw | rund 75 % (Well-to-Wheel) | 1 | UBA FAQ, Frage 2 | B | ja |
| Brennstoffzellen-Pkw (Mittelklasse) | 54 kWh/100 km gegen 18 kWh/100 km Batterie, Faktor 3 (bei verflüssigtem Import-H₂) | 3 | UBA FAQ | B | ja |
| PtG-Methan oder PtL im Verbrenner-Pkw | Faktor 6 | 6 | UBA „Kraftstoffe und Antriebe“ (Webseite) | B | ja |
| Wasserstoff im Verbrennungsmotor | Tank-to-Wheel rund 35 %, zusätzliche Erzeugungsverluste nicht enthalten | – | UBA FAQ | B | ja |

**Teilschritte:**

| Schritt | Wert | Quelle | Konf. | primär |
|---|---|---|---|---|
| Elektrolyse-Systemwirkungsgrad (LHV) | 67 % (2015), 69 % (2030), 72 % (2050); PEM, Daten nach Smolinka 2011 | UBA TEXTE 68/2020, Anhang, Technologieblatt Elektrolyse | B | ja |
| Elektrolyse in Projektrechnungen | 70 % (r2b, DIHK), 75 % (EWI nach BMWK 2024) | DIHK/r2b S. 15 Fn. 7, S. 29; EWI Folie 5 Fn. 2 | B | ja |
| PtL gate-to-gate, Methanol-Weg | heute 41 % (CO₂ aus Luft) bis 50 % (konzentrierte Quelle); langfristig 45 % bis 57 % | UBA/LBST/Bauhaus Luftfahrt 2022, Tab. 3, S. 21 | B | ja |
| PtL gate-to-gate, Fischer-Tropsch-Weg | heute 37 % (Luft) bis 45 % (konzentriert); langfristig 42 % bis 51 % | ebd. | B | ja |
| Wasserstoff-Einsatz je MWh synthetischem Kraftstoff | 1,35 MWh H₂ und 0,26 t CO₂; DAC rund 0,7 MWh/t CO₂ | UBA TEXTE 169/2021, S. 69–70 (nach Liebich et al. 2020) | B | ja |
| CO₂-Quelle | Punktquellen derzeit billiger, DAC unsicher in Kosten; Punktquelle bringt rund 10 Prozentpunkte Wirkungsgrad | UBA TEXTE 96/2025, Zusammenfassung; UBA 2022, Kap. 3.2 | B | ja |

Hinweis zur Quelle der Zahl „0,92 MWh Strom je MWh Kraftstoff“ in UBA TEXTE 169/2021
(S. 70): Die Abgrenzung ist im Text nicht eindeutig (sie lässt sich nicht
mit 1,35 MWh H₂ zu einem Gesamtwirkungsgrad zusammenführen). Wir nutzen sie
nicht.

## 5. Kosten

### 5.1 Elektrolyse und Wasserstoff

| Größe | Wert | Quelle, Fundstelle | Abgrenzung | Konf. | primär |
|---|---|---|---|---|---|
| Elektrolyse-Investition Deutschland | 2.000–3.000 €/kW, „nicht signifikant gefallen … entgegen früheren Erwartungen“; r2b-Beispiel 2.200 €/kW | DIHK/r2b 2026, S. 27–28 | installiertes System, Beispielrechnung | B | ja |
| Elektrolyse-Installation China gegen Ausland 2025 | 500–1.100 USD/kW gegen 1.900–2.500 USD/kW; 2030 außerhalb Chinas 1.500–1.900 USD/kW möglich | IEA (Suchtreffer); CRU weist darauf hin, dass chinesische Preise oft nur das Gerät enthalten | nicht vergleichbar abgegrenzt | C | nein |
| Fertigungsauslastung Elektrolyseure weltweit | 58 GW/Jahr Kapazität, rund 9 % Auslastung 2025 | IEA Global Hydrogen Review (Suchtreffer) | – | C | nein |
| Großhandelsindex grüner Wasserstoff Deutschland | knapp über 8 €/kg | DIHK/r2b S. 27 (Hydrix/EEX 2026) | geringe Markttiefe, „Orientierungs- und Benchmarksignal“ | B | ja |
| Bezugskosten RFNBO-Wasserstoff, Beispiel | rund 3 €/kg Kapital und Finanzierung + 3 €/kg Strom und Netzentgelt + 1–2 €/kg Speicher (+ bis 2 €/kg Trailer) | DIHK/r2b S. 28 | Einzelfall, WACC 12 %, 4.500 Volllaststunden, Strom 50 €/MWh | B | ja |
| Erwartete Wasserstoffpreise 2040 | 2,5–7,5 €/kg | DIHK/r2b S. 29, Abb. 3-3 | Studienspanne (€₂₀₂₅) | B | ja |
| Grauer/blauer Wasserstoff 2030er | unter 3 €/kg Parität erreichbar | DIHK/r2b S. 30, Fn. 80 | indikative r2b-Rechnung | C | ja |
| Bereitstellungskosten fossiler Wasserstoff | 9–10 ct/kWh (≈ 3,0–3,3 €/kg), 2050 10–12 ct/kWh | UBA FAQ, Frage 9 | ohne Steuern | B | ja |
| Importierter grüner Wasserstoff heute | 20–22 ct/kWh (≈ 6,7–7,3 €/kg); an der Tankstelle 2050 14–19 ct/kWh | ebd. | Bereitstellungskosten | B | ja |
| Kernnetz-Hochlaufentgelt | 25 €/kWh/h/a | DIHK/r2b S. 27 (BNetzA 2025) | Ein- und Ausspeisung | B | ja |

### 5.2 Import gegen Inland

- UBA TEXTE 96/2025 (Auswertung von Studien bis Februar 2024, Autor Germanwatch,
  im Auftrag UBA; Zahlen nur in Abbildungen, im Text nur qualitativ): Iberische
  Halbinsel und MENA haben die geringsten Produktionskosten; Schiffstransport
  hängt kaum von der Entfernung ab, Pipelines werden mit der Entfernung teurer,
  ab etwa 5.000 km ist das Schiff günstiger; Rückwandlung von Ammoniak zu H₂
  kostet 10–28 €/MWh (Staiß 2022) bzw. 20–25 €/MWh (Carels 2023), LOHC
  7–35 €/MWh; für **reinen** Wasserstoff bringt der Umweg über Derivate keinen
  Kostenvorteil, für das Derivat zur Direktnutzung schon. Verteilkosten im
  Inland: 18,6 €/MWh Wasserstoff, 13,7 €/MWh Kerosin (Kreidelmeyer 2020).
  Die Studien streuen stark; Bottom-up-Studien mit optimierten Standorten
  weisen niedrige Kosten aus, „die in realen Projekten vermutlich nicht immer
  erreicht werden können“. **B**, primär gelesen.
- Agora/Guidehouse 2024 (Pressemitteilung; Studie selbst nicht gelesen): Pipeline-Importe
  2030 nur 17 TWh grün (plus 15 TWh blau und 11 TWh Inland), 2035 60–100 TWh;
  Korridore Dänemark/Norwegen zuerst, Spanien/Tunesien später. **B**.
- DIHK/r2b: erwartete Importe 2040 meist 75–155 TWh bei 200–250 TWh Bedarf (S. 16);
  die Importländer „haben dieselben Kostenhürden zu nehmen“ wie die inländische
  Produktion (S. 28). Importstrategie der Bundesregierung (Juli 2024):
  95–130 TWh 2030, 50–70 % Import (Suchtreffer, **C**).

### 5.3 E-Kerosin

| Wert | Bedeutung | Quelle | Konf. | primär |
|---|---|---|---|---|
| 167,7–219,2 €/MWh (Deutschland 2030), 115,0–166,1 €/MWh (Deutschland 2050) | Herstellkosten FT/Methanol-Weg, Punktquelle gegen DAC | UBA TEXTE 96/2025, Tab. 3 (Batteiger et al. 2022) | B | ja |
| 89,1–133,7 €/MWh (Spanien/Marokko 2050), 131,7–171,0 €/MWh (Marokko 2030, DAC) | wie oben | ebd. | B | ja |
| 264 €/MWh (Europa 2050, DAC), 142–171 €/MWh (MENA 2050) | Soler et al. 2022 | UBA TEXTE 96/2025, Tab. 4 | B | ja |
| 1.700 €/t Herstellkosten „zukünftig“ (DAC), Break-even CO₂-Preis 300 bis 620 €/t CO₂ | LBST-Projektion; fossiler Referenzpreis 280–720 €/t (2014–2021) | UBA 2022, Abb. 12, S. 27 | B | ja |
| 7.695 €/t (6.820–8.590), ohne Gewinnmarge | EASA 2024, Suchtreffer; T&E schätzt 4.900–9.000 €/t | Suchtreffer | C | nein |
| Fossiles Kerosin 600 €/t (2021, rund 50 ct/l); 816 €/t (2023, EASA) | | UBA 2022, S. 28; EASA (Suchtreffer) | B / C | ja / nein |

**Umrechnung in €/Liter (eigene Rechnung, Setzung (M): Heizwert 11,94 kWh/kg nach
UBA TEXTE 96/2025 Tab. 5, Dichte 0,8 kg/l, also 9,55 kWh je Liter):**
Modellwerte 2030 Deutschland rund 1,6–2,1 €/l, 2050 Deutschland rund 1,1–1,6 €/l,
Spanien/Marokko 2050 rund 0,85–1,3 €/l, EASA-Auszug rund 6,2 €/l, fossil rund
0,5–0,65 €/l. Der Faktor 3 zwischen den Modellwerten und dem EASA-Auszug ist
nicht aufgeklärt (Modelle: optimierte Standorte, künftige Anlagen; EASA: laufende
Projektangaben, Herkunft des Werts im Suchtreffer nicht lesbar).

## 6. Stand der Umsetzung

| Größe | Stand | Quelle, Fundstelle | Konf. | primär |
|---|---|---|---|---|
| Elektrolyse in Betrieb | 180,5 MW (44 Projekte), 31.03.2026; Dezember 2025: 181,4 MW | EWI, „Wasserstoffproduktion mit Elektrolyse: Stand & Ausblick“, 16.06.2026, Folien 3 und 6 | B | ja |
| Größte Anlage in Betrieb | 54 MW (BASF Ludwigshafen), dann 20 MW (Thyssenkrupp), 14 MW (RWE Lingen) | ebd., Folie 6 | B | ja |
| FID oder im Bau | 1.271 MW (27 Projekte), seit Juni 2025 kaum Zuwachs | ebd., Folien 3 und 7 | B | ja |
| In Planung bis 2030 (ohne FID) | 7.227 MW (56 Projekte); gesamt bis 2030 8.668,5 MW; Planungsmenge ohne FID von 11,3 GW (Aug. 2024) auf 7,2 GW gesunken, „größerer Teil … offiziell abgesagt oder nicht weiterverfolgt“ | ebd., Folien 3 und 8 | B | ja |
| Nach 2030 oder ohne Jahr | 4.669,5 MW (42 Projekte) | ebd., Folie 3 | B | ja |
| Erzeugung | 2026 etwa 0,5 TWh; bei Inbetriebnahme aller FID/Bau-Projekte bis 2030 etwa 4,3 TWh; weitere 22,5 TWh nur aus Projekten ohne FID (Annahme 4.000 Volllaststunden, 75 %) | ebd., Folie 5 | B | ja |
| KfW-Einschätzung | rund 0,2 GW in Betrieb, 1,1 GW im Bau; bis Ende 2030 konservativ bis 2,4 GW; Gründe: höhere Kosten als erwartet, geringe Zahlungsbereitschaft der Nachfrage, Förder- und Regulierungsunsicherheit | KfW Research, „Auf einen Blick“, 04.03.2026 | B | ja |
| Marktschätzung 2030 | 2,4–6,6 GW (dena 2025) | DIHK/r2b S. 15–16 | C | ja (zitiert) |
| Ziel der Wasserstoffstrategie | 10 GW bis 2030 (≈ 28 TWh bei 4.000 Volllaststunden, 70 %) | DIHK/r2b S. 15, Fn. 7; EWI Folie 2 | A | ja |
| Kernnetz | genehmigt 9.040 km; zweiter NEP-Entwurf (01.06.2026): 9.241 km bis 2037, Kosten 24,3 Mrd. € (Stand 15.06.2026) | Bundesnetzagentur, Pressemitteilung 15.06.2026 | B | ja |
| Kernnetz, Auslegung und Nachfrage | ausgelegt auf rund 101 GW Einspeisung und 87 GW Ausspeisung; Reservierungen Stand 13.05.2026: 32 Anfragen, 2,9 GW; frühester Nutzungsbeginn 2027 | DIHK/r2b S. 22–23 | B | ja |
| Kernnetz in Betrieb | über 500 km seit 2025, davon rund 400 km Umstellungsleitung Lubmin–Bitterfeld (Dezember 2025) | Suchtreffer (BMWK-Webseite) | C | nein |
| Wasserstoffspeicher | angekündigt rund 15 TWh bis 2040, fortgeschritten nur 3,5 TWh | DIHK/r2b S. 24 | B | ja |
| ReFuelEU Aviation, Unterquote synthetische Kraftstoffe | 1,2 % (2030–2031), 2 % (2032–2034), 5 % (2035), 10 % (2040), 15 % (2045), 35 % (2050) | Suchtreffer (Parlamentszusammenfassung, Clean Hydrogen Observatory, T&E); der Wert aus dem Amtsblatt (Anhang I VO (EU) 2023/2405) ist nicht gelesen; T&E meldet für 2035 einen abweichenden Wert (2 % bis 2035) | C | nein |
| Nationale PtL-Quote Deutschland (Luftverkehr) | 0,5 % 2026, 1 % 2028, 2 % 2030 | Suchtreffer (einmaliger Treffer) | C | nein |
| E-Fuel-Produktion weltweit | **kein belastbarer Betriebswert gefunden.** Demonstration Werlte (D): rund 350 t Fischer-Tropsch-Rohöl/Jahr (UBA 2022, S. 22). T&E: 64 angekündigte Großprojekte weltweit, 26 bis 2030, bei Realisierung aller 2,1 Mio. t bis 2030; ohne FID „hypothetisch“ | UBA 2022; T&E (Suchtreffer, Interessenverband) | B / C | ja / nein |
| Stahl | Hochlauf der Direktreduktion mit H₂ hängt an der Liefermenge; BASF-Methanpyrolyse-Skalierung zuerst in den USA (DIHK/r2b S. 16) | | C | ja |

Wirkungsmaß: 2030 sind in Deutschland höchstens ein Zehntel bis ein Siebtel der
28 TWh aus dem 10-GW-Ziel in Sicht (4,3 TWh bei FID/Bau; 26,8 TWh nur, wenn alle
angekündigten Projekte ohne FID gebaut werden). Eigene Rechnung nach EWI Folie 5.

## 7. Für das Modell: Regler und Formeln

### 7.1 Regler

- `h` Lkw-Anteil Wasserstoff an der Dieselenergie des Güterverkehrs > 3,5 t: 0 / 0,5 / 1.
- `m_H2` und `m_EF` Importanteil Wasserstoff und E-Fuels: 0 / 0,5 / 1 (im Skript gemeinsam
  gesetzt, getrennt wählbar).
- Pkw elektrisch und Flug mit E-Fuels sind gesetzt. Strom für Pkw gehört nicht in diese Rechnung.

### 7.2 Formeln

```
η_sys   = η_el · η_dist                         Strom → Wasserstoff beim Verbraucher
Strom_Lkw_BEV   = (1 − h) · E_d · R_BEV
H2_Bedarf       = D_H2 + h · E_d · R_H2
Strom_H2_ges    = H2_Bedarf / η_sys
Strom_EF_ges    = D_EF / η_ptl
Strom_DE        = Strom_Lkw_BEV + (1 − m_H2) · Strom_H2_ges + (1 − m_EF) · Strom_EF_ges
Strom_Ausland   = m_H2 · Strom_H2_ges + m_EF · Strom_EF_ges      (ohne Transportverluste)
Elektrolyse_GW  = [ (1 − m_H2) · Strom_H2_ges
                  + (1 − m_EF) · H2_per_EF · D_EF / η_el ] / VLS · 1000
```

Der „zusätzliche deutsche Strombedarf durch den Lkw-Regler“ ist die Differenz
von `Strom_DE` bei `h` gegen `h = 0`.

### 7.3 Parameter (low = geringer Bedarf / mid / high = hoher Bedarf)

| Parameter | low | mid | high | Herkunft |
|---|---|---|---|---|
| `E_d` Dieselenergie Lkw > 3,5 t, TWh | 130 | 170 | 185 | 2023: 169,7 TWh (TREMOD Tab. 41). Spanne: Setzung (M), nicht belegt |
| `R_BEV` Strom je TWh Diesel, Batterie-Lkw | 0,40 | 0,50 | 0,58 | Setzung (M): untere Grenze aus ICCT-Verbrauch 127–150 kWh/100 km gegen rund 300–330 kWh Diesel (Suchtreffer, C); obere aus UBA 73 % und Dieselmotor-Wirkungsgrad 42 % (0,42/0,73 = 0,58) |
| `R_H2` Wasserstoff je TWh Diesel, Brennstoffzellen-Lkw | 0,73 | 0,88 | 1,00 | ICCT: 6,6–9 kg H₂/100 km bei 33 kWh/kg (Suchtreffer, C), gegen rund 300 kWh Diesel; Gegenprobe mit UBA 31 %: 0,42/0,31 · 0,70 = 0,95 |
| `η_el` Elektrolyse-Wirkungsgrad | 0,75 | 0,70 | 0,64 | EWI 75 %; DIHK/r2b 70 %; UBA 67–72 %; 0,64 = Setzung (M) für Teillastbetrieb |
| `η_dist` Verdichtung, Verteilung, Speicherung | 1,00 | 0,95 | 0,90 | Setzung (M), nicht belegt; UBA nennt Mehrverbrauch bei Verflüssigung |
| `D_H2` Wasserstoff Industrie (Stahl, Chemie, Prozesswärme), ohne E-Fuel-Vorprodukt und ohne Rückverstromung, TWh | 100 | 150 | 250 | Ariadne: Industrie 102–253 TWh; Mitte Setzung (M). Rückverstromung gehört in das Stromsystem-Modell (Teil 2) |
| `D_EF` E-Kraftstoff für Flug und Schiff, TWh | 100 | 150 | 195 | Ariadne 180–195 (einschließlich biogener Anteile, ohne Ausweis); Agora 155; 100 = Setzung (M), wenn ein Drittel biogen oder wegfällt |
| `η_ptl` Strom → Kraftstoff | 0,57 | 0,45 | 0,37 | UBA/LBST 2022 Tab. 3 und Abb. 12 (45 % Annahme Mitteleuropa) |
| `H2_per_EF` TWh H₂ je TWh Kraftstoff | 1,35 | 1,35 | 1,35 | UBA TEXTE 169/2021 |
| `VLS` Volllaststunden Elektrolyse | 5.500 | 4.000 | 3.000 | DIHK/r2b 4.500–5.500; EWI 4.000; Untergrenze Setzung (M) für Betrieb im Überschussstrom |

Alle drei Spalten bündeln jeweils die günstigsten (low) oder ungünstigsten (high)
Werte; das ist die breiteste mögliche Bandbreite, kein statistisches Intervall.

### 7.4 Ergebnis (mid), Skript `scripts/p1_08_regler.py`

| Lkw-Anteil H₂ | Import | Lkw Batterie, TWh | H₂ Inland, TWh Strom | E-Fuel Inland, TWh Strom | **Strom DE gesamt, TWh** | Strom Ausland, TWh | **Elektrolyse DE, GW** |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 85 | 226 | 333 | **644** | 0 | **129** |
| 0 | 0,5 | 85 | 113 | 167 | **364** | 279 | **64** |
| 0 | 1 | 85 | 0 | 0 | **85** | 559 | **0** |
| 0,5 | 0 | 43 | 338 | 333 | **714** | 0 | **157** |
| 0,5 | 0,5 | 43 | 169 | 167 | **378** | 336 | **78** |
| 0,5 | 1 | 43 | 0 | 0 | **43** | 671 | **0** |
| 1 | 0 | 0 | 451 | 333 | **784** | 0 | **185** |
| 1 | 0,5 | 0 | 225 | 167 | **392** | 392 | **93** |
| 1 | 1 | 0 | 0 | 0 | **0** | 784 | **0** |

Bandbreite des Gesamt-Strombedarfs DE (Spalte „Strom DE gesamt“):

| h | m | low | mid | high |
|---|---|---|---|---|
| 0 | 0 | 361 | 644 | 1.068 |
| 1 | 0 | 435 | 784 | 1.282 |
| 0 | 0,5 | 206 | 364 | 588 |
| 1 | 0,5 | 218 | 392 | 641 |

Die Zahlen für Elektrolyse-GW bei `m = 0` und `h = 0` reichen von 57 (low) über
129 (mid) bis 282 (high) GW.

**Wirkung des Lkw-Reglers allein** (Differenz `h = 1` gegen `h = 0`, `m = 0`):
+140 TWh Strom, +56 GW Elektrolyse (low +75 TWh, +23 GW; high +214 TWh, +107 GW).
Bei `m = 0,5` nur noch +27 TWh und +28 GW (low +11, high +53 TWh) im Inland, weil
die Hälfte des Wasserstoffs im Ausland erzeugt wird.

**Plausibilitätsprobe (keine Validierung):** Mit den Importanteilen aus Ariadne
(Wasserstoff 68 % Inland, E-Fuels 80 % Import; `h = 0`, `m_H2 = 0,32`, `m_EF = 0,8`) ergibt
mid 53 GW Elektrolyse; Ariadne PyPSA-DE nennt etwa 40 GW bei 130 TWh inländischer
Wasserstoffproduktion und 61 TWh Pipeline-Import, das NEP-Szenario C 2045 55 GW
(PDF-S. 79–80). Gleiche Größenordnung.

**Was die Formel nicht enthält:** Verluste und Kosten des Imports (Pipeline, Ammoniak,
Flüssigwasserstoff, Rückwandlung), Strom für Pkw, Rückverstromung, Wärme- und
Sauerstoff-Nebenerlöse, Zeitprofil (Elektrolyse im Überschuss gegen Dauerbetrieb).
Importverluste (Setzung (M), ohne Beleg gelassen) würden den Auslandsstrom je nach Träger
um einen zweistelligen Prozentwert erhöhen.

## 8. Gegenpositionen

1. **E-Fuels für Pkw.** Befürworter (eFuel Alliance mit Porsche Consulting, März
   2026, Suchtreffer): Fossile Kraftstoffe in der EU ab 2046 ersetzbar; auch der
   Pkw-Bestand ließe sich versorgen; die Bestandsflotte bestehe 2030 noch zu rund
   78 % aus Verbrennern (`eauto/research/parameter_quellen.md`, Zeile 62).
   Kritik: Industrienähe, Optimismus (elektroauto-news.net).
   Effizienzrechnung (UBA, primär gelesen): drei- bis sechsfacher Strombedarf
   gegenüber Batterie-Pkw. FÖS-Metastudie (Suchtreffer): Strom von 150 Windrädern
   reicht für 37.500 Verbrenner mit E-Fuels oder 240.000 Elektroautos.
   Fraunhofer-Forscher Wietschel: E-Fuels müssten zu großen Teilen importiert werden.
   **Einordnung:** Das stärkste Argument der Befürworter ist die Bestandsflotte,
   nicht die Effizienz; die Studien dazu sind Auftragsstudien beider Seiten.
2. **Biokraftstoffe.** 2023 deckten Biokraftstoffe 97 PJ = 26,9 TWh (6,9 %) des
   Dieselabsatzes (TREMOD Tab. 36). Agora (Dez. 2024): Biomasse-Angebot 2045
   294 TWh, davon 74 TWh stofflich, 41 TWh gasförmig, 171 TWh fest energetisch.
   Ariadne rechnet für Flug und Schiff 180–195 TWh synthetisch **und** biogen,
   Aufteilung ohne Ausweis. Die Mengengrenze (Anbaufläche, Reststoffe)
   steht in Ariadne mit Verweis auf Thrän et al. 2019; Zahl nicht gelesen. Lücke.
3. **Wasserstoff im Gebäude.** UBA (Suchtreffer): vier- bis fünffacher
   Strombedarf gegenüber der Luft-Wärmepumpe. Ariadne-Analyse 2021 mit Fraunhofer ISE
   (Suchtreffer): Wasserstoffkessel mit Inlandswasserstoff rund 10–15 % teurer als
   Wärmepumpe; Ariadne-Report 2025 (PDF-S. 23, gelesen): „im Gebäudesektor
   dominiert klar die Nutzung von Strom und Fernwärme“. **C** bis **B**.
4. **„Champagner der Energiewende“ gegen „Rückgrat“.** Beide Etiketten sind in den
   gelesenen Quellen nicht auffindbar und wurden nicht geprüft. Die Daten tragen
   eine Zwischenposition: Wasserstoff und Derivate sind in den Modellen unverzichtbar
   für Flug, Schiff, Stahl und Chemie (28–39 % des Energiebedarfs 2045 laut
   Ariadne, PDF-S. 23), nicht aber für Pkw, Gebäude und den größten Teil des
   Straßengüterverkehrs.
5. **Stärkste Gegenposition gegen den Hauptpfad „Erneuerbare + Speicher“ aus diesem Dossier:**
   (a) Die Wasserstoff-Versorgung ist 2045 mindestens zur Hälfte auf Importe
   angewiesen, die es bisher nicht gibt (Ariadne: mindestens 160–200 TWh;
   Agora: knapp 270 TWh Wasserstoff, E-Fuels voll importiert). (b) Der Hochlauf liegt
   um den Faktor vier bis sechzig hinter dem Ziel (180 MW gegen 10 GW; 2,4 GW
   KfW 2030). (c) Die Kostenannahmen früherer Szenarien wurden nicht erreicht.
   (d) Ein Teil der Nachfrage (Ammoniak, Eisenschwamm) könnte ins Ausland
   abwandern (Ariadne: mehr als die Hälfte der H₂-Nachfrage).
6. **Stärkste Gegenposition gegen Wasserstoff im Lkw (aus den Quellen, die für
   Wasserstoff werben):** Daimler hält an der Brennstoffzelle fest; ICCT 2022 sieht
   Parität bei rund 4 €/kg an der Zapfsäule 2030, während der Index heute bei
   über 8 €/kg liegt (Suchtreffer, C). Reichweite und Ladeinfrastruktur sind
   zusätzliche Argumente für Wasserstoff im Fernverkehr (UBA FAQ). Die Stufe der
   Belege ist niedrig (C).

## 9. Lücken

- Brennstoffzellen-Lkw: Bestand und Neuzulassungen in Deutschland (KBA nicht erreichbar).
- Batterie-Lkw-Neuzulassungen 2025: zwei widersprüchliche Zahlen (4.200 gegen 1.398).
- Gesamtkosten je km für Batterie-, Brennstoffzellen- und Diesel-Lkw aus ICCT,
  Fraunhofer ISI, NOW im Wortlaut.
- Megawatt-Laden: Normungs- und Ausbaustand (nur Herstellerangabe zu Vorrüstung).
- Hersteller-Strategien Volvo, MAN, Scania, Iveco, Hyundai; Zeitpunkt der
  Brennstoffzellen-Serie bei Daimler.
- Schiffskraftstoffe (Bunker) in TWh, heute und 2045, aus einem primär gelesenen Dokument.
- Hochtemperatur-Prozesswärme: eigener TWh-Wert.
- Wirkungsgrad des Elektro-Lkw je km und des Diesel-Lkw (Motorwirkungsgrad im
  Fahrbetrieb) aus einer Primärquelle; ICCT-Verbrauchswerte nur als Suchtreffer.
- Importverluste und -kosten je Träger (Pipeline, Ammoniak, LH₂, LOHC) als Zahl; im UBA-Papier nur Abbildungen.
- Tatsächliche gegen prognostizierte Elektrolysekosten für Deutschland/EU: kein Dokument
  gefunden, das beide Reihen nebeneinander stellt.
- E-Fuel-Produktion weltweit in t/Jahr im Betrieb; Absagen und Verschiebungen
  einzelner Projekte (HIF, Norsk e-Fuel u. a.) ohne Primärbeleg.
- ReFuelEU Anhang I (Amtsblatt) im Wortlaut; Abweichung 2035 (2 % gegen 5 %).
- Stand Importstrategie 2026: erste Lieferungen, abgeschlossene Abnahmeverträge, H2Global-Ergebnisse.
- Stand der Kernnetz-Inbetriebnahme zum Jahresende 2026 (nur Suchtreffer: über 500 km).
- Fraunhofer ISE (Host freigegeben): keine einschlägige Studie ausgewertet (Systemstudie
  Deutschland 2026 nur als Suchtreffer erwähnt).
- Pkw-E-Fuel-Befürworterstudie im Original (eFuel Alliance/Porsche Consulting).

## 10. Nicht erreichbar

| Host | gewünschtes Dokument | Grund |
|---|---|---|
| agora-verkehrswende.de | Studien zu Lkw-Antrieben, Abb. 23 | Proxy 403 (nicht freigegeben) |
| transport.ec.europa.eu | ReFuelEU-Aviation-Seite der Kommission | Proxy 403 |
| energy.ec.europa.eu | Seite zu nachhaltigen Flugkraftstoffen | Proxy 403 |
| Nicht auf der Freigabeliste, nicht versucht, nur per Suche (Auszüge) behandelt: theicct.org, isi.fraunhofer.de, now-gmbh.de, diw.de, ifeu.de, elib.dlr.de, easa.europa.eu, transportenvironment.org, iea.org, kba.de, destatis.de-Zulassungsstatistik (Host freigegeben, Dokument nicht gefunden), bdew.de, ewi.uni-koeln.de, bundesregierung.de, bundeswirtschaftsministerium.de, eur-lex.europa.eu | | |

## 11. Quellenliste

Primär gelesen (Manifest `quellen/manifest_P1-08.json`):

1. KfW Research: „Wasserstoff-Elektrolyse: Ausbau bleibt hinter Erwartungen zurück“, 04.03.2026, 1 S. Herausgeber KfW (bundeseigene Förderbank).
2. EWI (Energiewirtschaftliches Institut an der Universität zu Köln): „Wasserstoffproduktion mit Elektrolyse: Stand & Ausblick“, 16.06.2026, 10 Folien (Vortrag, abgelegt auf der UBA-Seite). Finanzierung der Datenbank im Dokument nicht genannt.
3. r2b energy consulting im Auftrag der DIHK: „Meilensteine für einen erfolgreichen Wasserstoffhochlauf bis 2040“, 26.06.2026, 67 S. Auftraggeber DIHK (Wirtschaftsverband, hat ein Interesse an einem wirtschaftsverträglichen Hochlauf).
4. Ariadne-Konsortium: „Die Energiewende kosteneffizient gestalten: Szenarien zur Klimaneutralität 2045“, März 2025. Förderung: Bundesministerium für Bildung und Forschung (Kopernikus-Projekt Ariadne, Impressum des Reports).
5. Umweltbundesamt (Bauhaus Luftfahrt, LBST): „Power-to-Liquids – a scalable and sustainable fuel supply perspective for aviation“, Januar 2022.
6. Umweltbundesamt, Germanwatch (S. Schreck): „Überblick zur Kostenentwicklung von strombasierten erneuerbaren Energieträgern“, TEXTE 96/2025.
7. Agora Energiewende, Agora Industrie: Pressemitteilung „Deutschlands Wasserstoff-Zukunft: Europäische Pipelines als Schlüssel“, 04.07.2024 (Studie Guidehouse nicht gelesen). Finanzierung nicht geprüft.
8. Agora Energiewende: „Klimaneutrales Deutschland“, 16.12.2024 (Webseite mit Kernaussagen); Präsentation „Klimaneutrales Deutschland 2045“, 06.05.2021 (Zahlen 265 TWh, 158 TWh, 422 TWh; nicht tragend).
9. Umweltbundesamt, TREMOD: „Aktualisierung TREMOD 2024“, TEXTE 125/2025.
10. Umweltbundesamt, Webseiten: „Energieverbrauch und Kraftstoffe“; „Emissionen des Verkehrs“; „Kraftstoffe und Antriebe“; „Wasserstoff im Verkehr: Häufig gestellte Fragen“ (alle abgerufen 22.11.2026).
11. Umweltbundesamt: TEXTE 169/2021 (Flächenrucksäcke, Teilbericht II); TEXTE 68/2020 Anhang (Systemvergleich speicherbarer Energieträger); Strategiepapier Luftfahrt 2021 (nicht tragend).
12. Bundesnetzagentur: Pressemitteilung „Bundesnetzagentur startet Konsultation für Netzentwicklungsplan Gas und Wasserstoff 2025-2037/2045“, 15.06.2026.

Nur Suchtreffer (nie Stufe A, `primaer_gelesen: false`): ICCT 2022/2023 (TCO), TNO/Agora Verkehrswende/T&E (TCO), DIW Wochenbericht 47/2024, Daimler Truck Pressemitteilungen, IEA Global Hydrogen Review 2025/2026 und CRU (Elektrolysekosten), EASA 2024 (E-Kerosin), T&E (E-Kerosin-Projekte), Parlament/Kommission/Clean Hydrogen Observatory (ReFuelEU), Bundesregierung (Importstrategie 2024), eFuel Alliance/Porsche Consulting, FÖS-Metastudie, Eurostat/Destatis/Verkehrsrundschau (Lkw-Zahlen), BMWK (Kernnetz).

## 12. Maschinenlesbarer Block

```json
{
  "dossier": "08_wasserstoff_efuels_lkw",
  "stand": "2026-11-22",
  "parameters": [
    {"id": "h2_elektrolyse_ziel_2030_gw", "value": 10, "unit": "GW", "source": "dihk_r2b_2026", "fundstelle": "S. 15, Fn. 7; auch EWI Folie 2, KfW", "confidence": "A", "primaer_gelesen": true, "note": "Ziel der Wasserstoffstrategie 2023; entspricht 28 TWh bei 4.000 Volllaststunden und 70 %"},
    {"id": "h2_elektrolyse_in_betrieb_gw", "value": 0.1805, "unit": "GW", "source": "ewi_2026", "fundstelle": "Folie 3 und 6", "confidence": "B", "primaer_gelesen": true, "note": "Stichtag 31.03.2026, 44 Projekte; KfW 0,2 GW; selbe Datengrundlage"},
    {"id": "h2_elektrolyse_fid_bau_gw", "value": 1.271, "unit": "GW", "source": "ewi_2026", "fundstelle": "Folie 3 und 7", "confidence": "B", "primaer_gelesen": true, "note": "27 Projekte, Stichtag 31.03.2026"},
    {"id": "h2_elektrolyse_geplant_bis_2030_gw", "value": 7.227, "unit": "GW", "source": "ewi_2026", "fundstelle": "Folie 3", "confidence": "B", "primaer_gelesen": true, "note": "ohne FID, 56 Projekte; Gesamt bis 2030 inklusive FID/Bau: 8,6685 GW"},
    {"id": "h2_elektrolyse_2030_realistisch_gw", "min": 2.4, "mid": null, "max": 6.6, "unit": "GW", "source": "dihk_r2b_2026", "fundstelle": "S. 15-16 (dena 2025); KfW: bis 2,4 GW konservativ", "confidence": "B", "primaer_gelesen": true, "note": "Marktschätzung, zitiert; nicht eigene Rechnung"},
    {"id": "h2_inland_erzeugung_2030_twh_fid", "value": 4.3, "unit": "TWh/Jahr", "source": "ewi_2026", "fundstelle": "Folie 5", "confidence": "B", "primaer_gelesen": true, "note": "nur FID/Bau, 4.000 Volllaststunden, 75 %; plus 22,5 TWh aus Projekten ohne FID"},
    {"id": "h2_verbrauch_2024_twh", "value": 49.9, "unit": "TWh", "source": "dihk_r2b_2026", "fundstelle": "S. 15", "confidence": "B", "primaer_gelesen": true, "note": "43,2 fossil, 0,4 Elektrolyse, 6,3 Nebenprodukte (European Hydrogen Observatory); UBA nennt rund 55 TWh (BMWK 2023)"},
    {"id": "h2_nws_bedarf_2030_twh", "min": 95, "mid": null, "max": 130, "unit": "TWh", "source": "uba_texte_96_2025", "fundstelle": "S. 16, Fn. 1", "confidence": "B", "primaer_gelesen": true, "note": "Wasserstoff plus Derivate, Annahme der Bundesregierung; Importanteil 50-70 % laut Importstrategie (Suchtreffer)"},
    {"id": "h2_bedarf_2045_ariadne_twh", "min": 175, "mid": null, "max": 420, "unit": "TWh", "source": "ariadne_2025", "fundstelle": "PDF-S. 64, Kap. 6.1.2", "confidence": "B", "primaer_gelesen": true, "note": "Technologiemix; PyPSA-DE/REMIND 175-350, REMod 330-420; enthält E-Fuel-Vorprodukt und Rückverstromung"},
    {"id": "h2_industrie_2045_twh", "min": 102, "mid": null, "max": 253, "unit": "TWh", "source": "ariadne_2025", "fundstelle": "PDF-S. 64", "confidence": "B", "primaer_gelesen": true, "note": "Technologiemix, Bandbreite über Modelle"},
    {"id": "efuel_bedarf_2045_ariadne_twh", "min": 180, "mid": null, "max": 195, "unit": "TWh", "source": "ariadne_2025", "fundstelle": "PDF-S. 29, Kap. 3.1", "confidence": "B", "primaer_gelesen": true, "note": "synthetisch und biogen, rund 90 % international; Hohe Nachfrage 205, Niedrige 160"},
    {"id": "ptl_bedarf_2045_agora_twh", "value": 155, "unit": "TWh", "source": "agora_knde_2024", "fundstelle": "Abschnitt Biomasse, Wasserstoff und CCS", "confidence": "B", "primaer_gelesen": true, "note": "überwiegend Flugverkehr"},
    {"id": "h2_import_2045_ariadne_twh", "min": 60, "mid": null, "max": 250, "unit": "TWh", "source": "ariadne_2025", "fundstelle": "PDF-S. 64", "confidence": "B", "primaer_gelesen": true, "note": "Wasserstoff; E-Fuels zusätzlich 100-125 TWh; zusammen mindestens 160-200 TWh"},
    {"id": "h2_import_2030_agora_twh", "value": 17, "unit": "TWh", "source": "agora_pm_2024", "fundstelle": "S. 1", "confidence": "B", "primaer_gelesen": true, "note": "grüner Wasserstoff per Pipeline; 2035: 60-100 TWh; Studie selbst nicht gelesen"},
    {"id": "kerosin_absatz_2023_twh", "value": 111.7, "unit": "TWh", "source": "tremod_2024", "fundstelle": "Tab. 36", "confidence": "B", "primaer_gelesen": true, "note": "402 PJ Energiebilanz; Verbrauch Flugverkehr 91,8 TWh, davon international 87,5"},
    {"id": "lkw_dieselenergie_2023_twh", "value": 169.7, "unit": "TWh", "source": "tremod_2024", "fundstelle": "Tab. 41, S. 83", "confidence": "B", "primaer_gelesen": true, "note": "611 PJ schwere Nutzfahrzeuge Inland; 60,5 Mrd. km (Tab. 22); 2,8 kWh/km"},
    {"id": "lkw_bestand_2023_tsd", "value": 759, "unit": "Tausend", "source": "tremod_2024", "fundstelle": "Tab. 12, S. 46", "confidence": "B", "primaer_gelesen": true, "note": "schwere Nutzfahrzeuge Güterverkehr; 98,5 % Diesel, 0,58 % batterieelektrisch; Wasserstoff-Lkw nicht ausgewiesen"},
    {"id": "lkw_wirkungsgrad_bev", "value": 0.73, "unit": "Strom → Rad", "source": "uba_h2_faq", "fundstelle": "Frage 8", "confidence": "B", "primaer_gelesen": true, "note": "Well-to-Wheel aus erneuerbarem Strom"},
    {"id": "lkw_wirkungsgrad_fcev", "value": 0.31, "unit": "Strom → Rad", "source": "uba_h2_faq", "fundstelle": "Frage 8", "confidence": "B", "primaer_gelesen": true, "note": "Brennstoffzelle mit grünem Wasserstoff; Verdichtung und Kühlung eingerechnet"},
    {"id": "lkw_wirkungsgrad_ptl_diesel", "value": 0.21, "unit": "Strom → Rad", "source": "uba_h2_faq", "fundstelle": "Frage 8", "confidence": "B", "primaer_gelesen": true, "note": "Diesel-Lkw mit PtL"},
    {"id": "lkw_tco_fcev_gegen_bev_2030", "value": 1.4, "unit": "Faktor, mindestens", "source": "uba_h2_faq", "fundstelle": "Frage 9", "confidence": "B", "primaer_gelesen": true, "note": "mehr als 40 % höhere Gesamtbetriebskosten ohne staatliche Steuerung; UBA-Eigenrechnung auf NOW-Daten"},
    {"id": "pkw_strombedarf_fcev_gegen_bev", "value": 3, "unit": "Faktor", "source": "uba_h2_faq", "fundstelle": "Frage 2", "confidence": "B", "primaer_gelesen": true, "note": "54 gegen 18 kWh/100 km; PtL/PtG im Verbrenner Faktor 6 (UBA Kraftstoffe und Antriebe)"},
    {"id": "elektrolyse_wirkungsgrad", "min": 0.64, "mid": 0.70, "max": 0.75, "unit": "LHV, System", "source": "uba_texte_68_2020", "fundstelle": "Anhang, Technologieblatt Elektrolyse; DIHK S. 29; EWI Folie 5", "confidence": "B", "primaer_gelesen": true, "note": "UBA 67/69/72 % (2015/2030/2050); 0,64 Setzung (M) Teillast"},
    {"id": "ptl_wirkungsgrad_kerosin", "min": 0.37, "mid": 0.45, "max": 0.57, "unit": "gate-to-gate", "source": "uba_ptl_2022", "fundstelle": "Tab. 3, S. 21; Abb. 12", "confidence": "B", "primaer_gelesen": true, "note": "FT 37-51 %, Methanol 41-57 %; CO₂ aus Luft gegen Punktquelle; Mitte = Annahme Mitteleuropa in Abb. 12"},
    {"id": "ptl_h2_je_kraftstoff", "value": 1.35, "unit": "MWh H₂ je MWh Kraftstoff", "source": "uba_texte_169_2021", "fundstelle": "S. 69-70", "confidence": "B", "primaer_gelesen": true, "note": "0,26 t CO₂/MWh; DAC 0,7 MWh/t"},
    {"id": "elektrolyse_capex_de_eur_kw", "min": 2000, "mid": 2200, "max": 3000, "unit": "EUR/kW", "source": "dihk_r2b_2026", "fundstelle": "S. 27-28", "confidence": "B", "primaer_gelesen": true, "note": "mid = r2b-Beispielrechnung; nicht gefallen entgegen früheren Erwartungen"},
    {"id": "elektrolyse_capex_china_usd_kw", "min": 500, "mid": null, "max": 1100, "unit": "USD/kW", "source": "iea_ghr_2025", "fundstelle": "Suchtreffer", "confidence": "C", "primaer_gelesen": false, "note": "in China gebaut und installiert, 2025; außerhalb 1.900-2.500 USD/kW; Abgrenzung nicht vergleichbar (CRU)"},
    {"id": "h2_grosshandel_eur_kg", "value": 8, "unit": "EUR/kg", "source": "dihk_r2b_2026", "fundstelle": "S. 27", "confidence": "B", "primaer_gelesen": true, "note": "knapp über; Hydrix/EEX 2026; wenige Transaktionen"},
    {"id": "h2_preis_2040_eur_kg", "min": 2.5, "mid": null, "max": 7.5, "unit": "EUR/kg (€2025)", "source": "dihk_r2b_2026", "fundstelle": "S. 29, Abb. 3-3", "confidence": "B", "primaer_gelesen": true, "note": "Spanne aktueller Studien"},
    {"id": "h2_import_gruen_heute_ct_kwh", "min": 20, "mid": null, "max": 22, "unit": "ct/kWh", "source": "uba_h2_faq", "fundstelle": "Frage 9", "confidence": "B", "primaer_gelesen": true, "note": "Bereitstellungskosten; fossiler Wasserstoff 9-10 ct/kWh"},
    {"id": "ekerosin_kosten_2030_de_eur_mwh", "min": 167.7, "mid": null, "max": 219.2, "unit": "EUR/MWh LHV", "source": "uba_texte_96_2025", "fundstelle": "Tab. 3 (Batteiger 2022)", "confidence": "B", "primaer_gelesen": true, "note": "Punktquelle gegen DAC; 2050 Deutschland 115,0-166,1; Spanien/Marokko 2050 89,1-133,7; ca. 1,6-2,1 EUR/l (Setzung (M) Dichte 0,8)"},
    {"id": "ekerosin_kosten_easa_eur_t", "min": 6820, "mid": 7695, "max": 8590, "unit": "EUR/t", "source": "easa_2024", "fundstelle": "Suchtreffer", "confidence": "C", "primaer_gelesen": false, "note": "Produktionskosten ohne Gewinn; ca. 6,2 EUR/l; Faktor 3 über den Modellwerten, Ursache offen"},
    {"id": "kerosin_fossil_eur_t", "min": 280, "mid": 600, "max": 816, "unit": "EUR/t", "source": "uba_ptl_2022", "fundstelle": "S. 28; EASA 2023 (816, Suchtreffer)", "confidence": "B", "primaer_gelesen": true, "note": "ohne CO₂-Preis und Steuern; 2014-2021 280-720; 600 = 2021"},
    {"id": "co2_breakeven_ekerosin_eur_t", "min": 300, "mid": null, "max": 620, "unit": "EUR/t CO₂", "source": "uba_ptl_2022", "fundstelle": "Abb. 12, S. 27", "confidence": "B", "primaer_gelesen": true, "note": "LBST-Projektion, künftige Anlagen, Mitteleuropa gegen MENA"},
    {"id": "refueleu_synth_quote", "value": 0.012, "unit": "Anteil 2030-2031", "source": "refueleu_suche", "fundstelle": "Suchtreffer", "confidence": "C", "primaer_gelesen": false, "note": "2032-34 2 %, 2035 5 %, 2040 10 %, 2045 15 %, 2050 35 %; Anhang I im Amtsblatt nicht gelesen; 2035-Wert strittig"},
    {"id": "kernnetz_laenge_km", "value": 9040, "unit": "km", "source": "bnetza_pm_2026_06", "fundstelle": "Pressemitteilung 15.06.2026", "confidence": "B", "primaer_gelesen": true, "note": "genehmigt; NEP-Entwurf 9.241 km bis 2037, 24,3 Mrd. EUR"},
    {"id": "kernnetz_reservierungen_gw", "value": 2.9, "unit": "GW", "source": "dihk_r2b_2026", "fundstelle": "S. 23", "confidence": "B", "primaer_gelesen": true, "note": "Ein- und Ausspeisung zusammen, Stand 13.05.2026, 32 Anfragen; Auslegung 101 GW Einspeisung, 87 GW Ausspeisung"},
    {"id": "model_lkw_h2_zusatz_strom_twh", "min": 75, "mid": 140, "max": 214, "unit": "TWh", "source": "eigene_rechnung", "fundstelle": "scripts/p1_08_regler.py", "confidence": "C", "primaer_gelesen": false, "note": "Setzung (M): h=1 gegen h=0, Import 0; Parameter siehe Abschnitt 7.3"},
    {"id": "model_lkw_h2_zusatz_elektrolyse_gw", "min": 23, "mid": 56, "max": 107, "unit": "GW", "source": "eigene_rechnung", "fundstelle": "scripts/p1_08_regler.py", "confidence": "C", "primaer_gelesen": false, "note": "wie oben"},
    {"id": "model_strom_de_h0_m0_twh", "min": 361, "mid": 644, "max": 1068, "unit": "TWh", "source": "eigene_rechnung", "fundstelle": "scripts/p1_08_regler.py", "confidence": "C", "primaer_gelesen": false, "note": "Lkw Batterie, kein Import: Lkw-Strom 85, Industrie-H₂ 226, E-Fuel 333 (mid)"},
    {"id": "model_elektrolyse_h0_m0_gw", "min": 57, "mid": 129, "max": 282, "unit": "GW", "source": "eigene_rechnung", "fundstelle": "scripts/p1_08_regler.py", "confidence": "C", "primaer_gelesen": false, "note": "kein Import; Ariadne PyPSA-DE: rund 40 GW bei 68 % Inland-H₂ und 80 % E-Fuel-Import; NEP-Szenario C 55 GW"}
  ],
  "sources": {
    "dihk_r2b_2026": {"titel": "Meilensteine für einen erfolgreichen Wasserstoffhochlauf bis 2040", "herausgeber": "r2b energy consulting GmbH im Auftrag der DIHK", "datum": "2026-06-26", "url": "https://www.dihk.de/resource/blob/183558/062d6b214805a131e8e31b07e61b701b/dihk-studie-wasserstoffhochlauf-data.pdf", "abruf": "2026-11-22"},
    "ewi_2026": {"titel": "Wasserstoffproduktion mit Elektrolyse: Stand & Ausblick", "herausgeber": "EWI, Universität zu Köln (A.-K. Klaas)", "datum": "2026-06-16", "url": "https://www.umweltbundesamt.de/system/files/document/7_Klaas_EWI_AGEEStat_Elektrolyse.pdf", "abruf": "2026-11-22"},
    "kfw_2026": {"titel": "Wasserstoff-Elektrolyse: Ausbau bleibt hinter Erwartungen zurück", "herausgeber": "KfW Research", "datum": "2026-03-04", "url": "https://www.kfw.de/PDF/Download-Center/Konzernthemen/Research/PDF-Auf-einen-Blick/2026_03_04_Elektrolyse.pdf", "abruf": "2026-11-22"},
    "ariadne_2025": {"titel": "Die Energiewende kosteneffizient gestalten: Szenarien zur Klimaneutralität 2045", "herausgeber": "Ariadne-Konsortium (BMBF-gefördert)", "datum": "2025-03", "url": "https://ariadneprojekt.de/media/2025/03/Ariadne-Report_Szenarien2025_Maerz2025_lowres.pdf", "abruf": "2026-11-22"},
    "agora_knde_2024": {"titel": "Klimaneutrales Deutschland (Webseite)", "herausgeber": "Agora Energiewende", "datum": "2024-12-16", "url": "https://www.agora-energiewende.de/publikationen/klimaneutrales-deutschland-szenariopfade", "abruf": "2026-11-22"},
    "agora_pm_2024": {"titel": "Deutschlands Wasserstoff-Zukunft: Europäische Pipelines als Schlüssel (Pressemitteilung)", "herausgeber": "Agora Energiewende, Agora Industrie", "datum": "2024-07-04", "url": "https://www.agora-energiewende.de/fileadmin/Projekte/2023/2023-34_IND_H2_Imports_DE/24_07_04_Pressemitteilung_Wasserstoffimporte.pdf", "abruf": "2026-11-22"},
    "uba_ptl_2022": {"titel": "Power-to-Liquids: A scalable and sustainable fuel supply perspective for aviation", "herausgeber": "Umweltbundesamt (Bauhaus Luftfahrt, LBST)", "datum": "2022-01", "url": "https://www.umweltbundesamt.de/system/files/medien/376/publikationen/background_paper_power-to-liquids_aviation_2022.pdf", "abruf": "2026-11-22"},
    "uba_texte_96_2025": {"titel": "Überblick zur Kostenentwicklung von strombasierten erneuerbaren Energieträgern", "herausgeber": "Umweltbundesamt (Germanwatch)", "datum": "2025", "url": "https://www.umweltbundesamt.de/system/files/medien/11850/publikationen/96_2025_texte.pdf", "abruf": "2026-11-22"},
    "uba_texte_169_2021": {"titel": "Flächenrucksäcke von Gütern und Dienstleistungen, Teilbericht II", "herausgeber": "Umweltbundesamt", "datum": "2021", "url": "https://www.umweltbundesamt.de/system/files/medien/479/publikationen/texte_169-2021_flaechenrucksaecke_von_guetern_und_dienstleistungen_teilbericht_ii.pdf", "abruf": "2026-11-22"},
    "uba_texte_68_2020": {"titel": "Detailanalysen zum Systemvergleich speicherbarer Energieträger, Anhang", "herausgeber": "Umweltbundesamt", "datum": "2020", "url": "https://www.umweltbundesamt.de/system/files/medien/479/publikationen/texte_2020_68_anhang_detailanalysen_zum_systemvergleich_speicherbarer_energietraeger_aus_erneuerbaren_energien.pdf", "abruf": "2026-11-22"},
    "tremod_2024": {"titel": "Aktualisierung TREMOD 2024 (TEXTE 125/2025)", "herausgeber": "Umweltbundesamt", "datum": "2025", "url": "https://www.umweltbundesamt.de/system/files/medien/11850/publikationen/125_2025_texte.pdf", "abruf": "2026-11-22"},
    "uba_h2_faq": {"titel": "Wasserstoff im Verkehr: Häufig gestellte Fragen (FAQs)", "herausgeber": "Umweltbundesamt", "datum": "Stand 2025", "url": "https://www.umweltbundesamt.de/themen/verkehr/kraftstoffe-antriebe/wasserstoff-im-verkehr-haeufig-gestellte-fragen", "abruf": "2026-11-22"},
    "bnetza_pm_2026_06": {"titel": "Bundesnetzagentur startet Konsultation für Netzentwicklungsplan Gas und Wasserstoff 2025-2037/2045", "herausgeber": "Bundesnetzagentur", "datum": "2026-06-15", "url": "https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2026/20260615_NEP_Gas.html?nn=659906", "abruf": "2026-11-22"},
    "iea_ghr_2025": {"titel": "Global Hydrogen Review 2025/2026 (Suchtreffer)", "herausgeber": "IEA", "datum": "2025/2026", "url": "https://www.iea.org/reports/global-hydrogen-review-2025/investment-and-innovation", "abruf": "2026-11-22"},
    "easa_2024": {"titel": "SAF market / ReFuelEU Aviation (Suchtreffer)", "herausgeber": "EASA", "datum": "2024", "url": "https://www.easa.europa.eu/en/downloads/142604/en", "abruf": "2026-11-22"},
    "refueleu_suche": {"titel": "ReFuelEU Aviation, Verordnung (EU) 2023/2405 (Suchtreffer)", "herausgeber": "EU", "datum": "2023", "url": "https://observatory.clean-hydrogen.europa.eu/eu-policy/refueleu-aviation", "abruf": "2026-11-22"},
    "eigene_rechnung": {"titel": "Regler-Rechnung P1-08", "herausgeber": "Daten-WG Knowledge Kitchen (Agent)", "datum": "2026-11-22", "url": "energiewende/scripts/p1_08_regler.py", "abruf": "2026-11-22"}
  }
}
```
