# Dossier 04 · Gesamtenergiesystem: Ist-Bilanz und Bedarfspfade

Stand 22.11.2026 · Phase 1, Auftrag P1-04 · Recherche-Agent (Sonnet) ·
Manifest: `quellen/manifest_P1-04.json` · aufbereitete offene Daten:
`data/p104_eurostat_de_energiebilanz.json` (Skript `scripts/p104_eurostat_aufbereiten.py`).

Lesehinweis: „primär gelesen“ heißt, die Stelle steht im heruntergeladenen
Originaldokument und wurde dort gelesen. Zahlen aus Suchtreffer-Auszügen sind
als solche gekennzeichnet (Konfidenz höchstens B, meist C). Eigene Rechnungen
heißen „Rechnung (M)“, eigene Annahmen „Setzung (M)“.

## Kernaussagen

1. **Endenergie 2024: rund 2.070 TWh (Eurostat-Abgrenzung, ohne internationalen
   Verkehr), rund 2.170 TWh mit internationalem Luftverkehr; in der
   AGEB-Abgrenzung rechnerisch rund 2.260 TWh.** 2024 ist der niedrigste Wert seit
   der Wiedervereinigung (2008: 2.424 TWh Eurostat, −15 %). *Konfidenz B*
   (Eurostat und UBA stimmen im Trend überein, die AGEB-Tabellen selbst waren
   nicht abrufbar).
2. **Fossile Träger decken 2024 rund 61 % der Endenergie** (Öl 706, Gas 524,
   Kohle 28 von 2.067 TWh); Strom 472 TWh (23 %), direkte Erneuerbare
   197 TWh (10 %), Fernwärme 101 TWh (5 %). Im Verkehr sind es 90 % Öl.
   *Konfidenz B* (Eurostat, primär gelesen; UBA bestätigt „über 90 %
   Mineralöl“ im Verkehr).
3. **Treibhausgase 2025: 648,9 Mt CO₂-Äq., −0,1 % gegen 2024, rund −48 %
   gegen 1990.** Industrie sinkt (−5,7 Mt, schwache Konjunktur), Gebäude
   (+3,4) und Verkehr (+2,1) steigen. Verkehr (146 Mt) und Gebäude (103 Mt)
   liegen deutlich über ihrer angepassten Jahresmenge. *Konfidenz B*
   (UBA primär gelesen, Expertenrat bestätigt die Daten laut Suchtreffer).
4. **Die Szenariostudien nennen für 2045 einen Strombedarf von rund
   1.000 bis 1.550 TWh** (Ariadne 1.037–1.423, Agora 1.267, Fraunhofer ISE
   1.227–1.544, NEP 989–1.294); das ist das Zwei- bis Dreifache von 2024
   (518 TWh). Die Spanne entsteht vor allem durch die Annahme, wie viel
   Wasserstoff und E-Fuels im Inland statt im Ausland erzeugt werden.
   *Konfidenz A* (vier unabhängige Studien, alle primär gelesen).
5. **Für 2030 sind die Prognosen deutlich gesunken.** Frühere Planungsgröße
   750 TWh; Monitoring der Bundesregierung (Sept. 2025) 600–700 TWh;
   Studien 670–807 TWh; Ist 2024 nur 518–522 TWh, 2025 etwa 512–526 TWh.
   *Konfidenz A.*
6. **Bedarf an grünen Molekülen 2045: 175–420 TWh Wasserstoff plus
   85–165 TWh Derivate (Ariadne)**, Agora 268 TWh H₂ + 155 TWh PtL
   (davon 339 TWh importiert). Deutschland bliebe auf Importe von mindestens
   160–200 TWh angewiesen. *Konfidenz B* (zwei Studien primär, ISE bestätigt
   die Größenordnung: 244 TWh Import + 126 TWh heimisch).
7. **Industrie: 407 TWh Prozesswärme (67 % des Industrie-EEV), davon nur
   30,7 TWh (7,5 %) elektrisch; der Elektrifizierungsanteil stagniert seit
   2020.** Nach Temperaturniveau ist die Prozesswärme in den
   zugänglichen Quellen nicht aufgeschlüsselt (Lücke). *Konfidenz B* (UBA,
   primär gelesen, eine Quelle).
8. **Wärmepumpen im Bestand: Jahresarbeitszahl 3,4 (Luft/Wasser, 2,6–4,9) und
   4,3 (Erdreich, 3,6–5,4); die Netzplanung rechnet mit 3,2–3,3
   (Bundesnetzagentur) bzw. 3,6–3,8 (ÜNB-Entwurf), Agora mit 3,5 (2045).**
   *Konfidenz A* für die Größenordnung 3–4.
9. **Elektro-Pkw: rund 18 kWh/100 km real; Pkw-Flotte Verbrenner 7,40 l/100 km
   (≈ 69 kWh/100 km Brennstoffenergie).** Endenergieseitig spart der Wechsel
   den Faktor ≈ 3,8 (Rechnung (M)); über die ganze Kette zu E-Fuels kehrt sich
   das um (UBA: Gesamtwirkungsgrad BEV 75 %, FCEV 28 %, Diesel mit PtL 21 %).
   *Konfidenz A* für Pkw (UBA/BMDV, ISE, Agora übereinstimmend), *C* für Lkw.
10. **Gegenposition:** Der Stromverbrauch ist seit 2017 gefallen (602 → 522 TWh)
    statt gestiegen; die Prognosen wurden mehrfach nach unten korrigiert
    (NEP 2023 → 2025: −50 TWh 2037, −120 TWh 2045). Dagegen warnen BEE,
    BNetzA-Szenario (750 TWh) und der Expertenrat für Klimafragen: Die
    niedrigen Ist-Werte spiegeln auch Konjunkturschwäche und verzögerte
    Elektrifizierung, und die UBA-Projektion für 2030 gilt dem Expertenrat
    als zu optimistisch. *Konfidenz A* für die Datenlage, die Deutung bleibt
    offen.

## 1. Ist-Bilanz, jüngstes verfügbares Jahr (2024)

**Jahr:** Eurostat weist 2024 als jüngstes Jahr aus (Datenbankstand
27.08.2026). Die AG Energiebilanzen (AGEB) liegt mit 2025 vorn
(Primärenergie 10.530 PJ laut Suchtreffer), ihre Tabellen waren nicht abrufbar
(siehe „Nicht erreichbar“). Die Bilanz unten ist daher **Eurostat 2024**, ergänzt
um UBA- und TREMOD-Daten. Eurostat und AGEB unterscheiden sich in der
Abgrenzung (Eurostat-„FC_E“ ohne internationalen Luft- und Seeverkehr; AGEB
rechnet anders ab); die AGEB-Abgrenzung ergibt aus den UBA-Folien
(Industrie 607,6 TWh = 26,9 % des EEV) rechnerisch 2.259 TWh.

### 1.1 Primärenergie (Eurostat „Gross available energy“ 2024, TWh)

| Träger | TWh | Anteil |
|---|---:|---:|
| Mineralöl (ohne Biokraftstoffe) | 1.090,1 | 37 % |
| Erdgas | 754,2 | 26 % |
| Feste fossile Brennstoffe (Kohle) | 439,3 | 15 % |
| Erneuerbare (Eurostat-Zählung, inkl. Biomasse) | 581,6 | 20 % |
| Nicht erneuerbare Abfälle | 46,2 | 2 % |
| Strom (Nettoimport) | 26,3 | 1 % |
| Kernenergie | 0,0 | 0 % |
| **Summe** | **2.937,5** | |

Fundstelle: Eurostat nrg_bal_c, nrg_bal = GAE, geo = DE, Einheit GWh, Jahr 2024
(`raw/P1-04/eurostat_balances_DE_2024.json`). Gross inland consumption (GIC)
2024: 251.301 ktoe = 2.922,6 TWh; 2008: 343.742 ktoe = 3.997 TWh (−27 %).
Zum Vergleich AGEB 2025 laut Suchtreffer: 10.530 PJ = 2.925 TWh (Infografik 06|2026;
frühere Fassung 10.490 PJ; Q3-Bericht noch 10.651 PJ) – Konfidenz C, nicht
primär gelesen. UBA erläutert, dass das Wirkungsgradprinzip den
PEV-Rückgang durch Erneuerbare statistisch überzeichnet (UBA „Primärenergieverbrauch“,
Stand 18.12.2025). Der Erneuerbaren-Anteil am Bruttoendenergieverbrauch lag 2025 bei
23,8 % (UBA, 15.05.2026).

### 1.2 Endenergie nach Sektor und Träger (Eurostat 2024, TWh)

| Sektor | Gesamt | Kohle | Öl | Gas | Strom | Fernwärme | Erneuerb. direkt | Sonstige¹ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Industrie | 562,5 | 26,4 | 27,2 | 195,7 | 196,6 | 43,8 | 33,0 | 39,8 |
| Verkehr (ohne int. Luft/See) | 575,9 | 0,0 | 520,3 | 7,9 | 17,5 | 0,0 | 30,3 | 0,0 |
| Haushalte | 610,1 | 2,0 | 116,2 | 224,0 | 132,4 | 39,3 | 96,0 | 0,2 |
| Gewerbe, Handel, Dienstleistungen (GHD) | 276,8 | 0,0 | 18,0 | 92,2 | 120,8 | 17,8 | 28,0 | 0,0 |
| Land- und Forstwirtschaft, Fischerei | 40,9 | 0,0 | 23,4 | 3,8 | 4,5 | 0,0 | 9,2 | 0,0 |
| **Summe Endenergie (FC_E)** | **2.067,2** | 28,4 | 705,9 | 523,7 | 471,8 | 101,0 | 196,5 | 39,9 |
| Nachrichtlich: int. Luftverkehr | 103,2 | – | 103,2 | – | – | – | – | – |
| Nachrichtlich: int. Seeverkehr (Bunker) | 14,9 | – | 14,9 | – | – | – | – | – |

¹ Rest zur Summe: Kuppelgase (Hochofen u. a.) und Abfall in der Industrie
(13,0 TWh Abfall; Rest Kuppelgase), Rundungen. Fundstelle: Eurostat nrg_bal_c
(FC_IND_E, FC_TRA_E, FC_OTH_HH_E, FC_OTH_CP_E, FC_OTH_AF_E, FC_E; INTAVI, INTMARB),
Abruf 22.11.2026. **Abgrenzung:** Endenergie ohne nichtenergetischen
Verbrauch (Rohstoffe der Chemie); GHD in der AGEB-Gliederung enthält
Land- und Forstwirtschaft, hier getrennt ausgewiesen.

**Strom nach Sektor** (Eurostat, TWh): Industrie 196,6 · GHD 120,8 · Haushalte
132,4 · Verkehr 17,5 · Landwirtschaft 4,5 · Summe 471,8. Der Endverbrauch an
Strom ist von 528 TWh (2008) auf 472 TWh (2024) gefallen; die Industrie von
235 auf 197 TWh. Der Bruttostromverbrauch 2024 war 518 TWh (NEP-Basisjahr) bzw.
522 TWh (Antwort der Bundesregierung, WD 5-050-26 S. 10).

### 1.3 Verkehr nach Verkehrsträger (2024)

| Verkehrsträger | Endenergie 2024 | Fundstelle / Abgrenzung |
|---|---:|---|
| Straße gesamt | 549,5 TWh (Öl 509,2; Biokraftstoffe 30,1; Gas 4,2; Strom 5,9) | Eurostat FC_TRA_ROAD_E |
| davon Pkw und Kombi | ≈ 407 TWh | Rechnung (M): 25.884 Mio. l Benzin und 17.612 Mio. l Diesel (BMDV „Verkehr in Zahlen 2025/26“ über UBA-Excel) × Heizwert-Setzung (M) 8,94 bzw. 9,97 kWh/l; Inländerfahrleistung, nicht Inlandsabsatz |
| davon Lkw, Busse, Krafträder, übrige | ≈ 142 TWh | Rechnung (M): Straße minus Pkw; Differenz enthält Abgrenzungsunterschiede |
| Schiene | 14,4 TWh (Strom 11,6; Diesel 2,7) | Eurostat FC_TRA_RAIL_E; UBA: Strom 75,7 % |
| Luftverkehr inländisch | 4,1 TWh | Eurostat FC_TRA_DAVI_E |
| Luftverkehr international (in D vertankt) | 103,2 TWh | Eurostat INTAVI; UBA: Flugkraftstoffe 16 % der Verkehrskraftstoffe |
| Binnenschifffahrt | 2,7 TWh | Eurostat FC_TRA_DNAVI_E |
| Seeverkehr international (Bunker) | 14,9 TWh | Eurostat INTMARB |

Ergänzung TREMOD (UBA, Primärenergie **inklusive Vorkette**, Petajoule 2024,
`uba_pv_primaer.xlsx`, `uba_gv_primaer.xlsx`): Personenverkehr Straße 1.867,
Schiene 75, Luft 306; Güterverkehr Straße 1.039, Schiene 32, Binnenschiff 18,
Luft 116; Verkehr gesamt 3.454 PJ (≈ 959 TWh). Diese Zahlen sind nicht mit
der Endenergie oben vergleichbar. Verteilung der Kraftstoffe nach
Energiegehalt (UBA, 2024): Diesel 49,4 %, Benzin 29,5 %, Flugkraftstoffe 16 %,
Biokraftstoffe 5,0 %, Gas 0,4 %; Strom 2,5 % der Verkehrsendenergie.

### 1.4 Wärme

- Wärme und Kälte machen gut die Hälfte des Endenergieverbrauchs aus; Raumwärme
  rund 27 %, Prozesswärme rund 20 % des gesamten EEV (UBA, sektorübergreifend).
  Auf die AGEB-Abgrenzung (≈ 2.260 TWh) bezogen sind das **Raumwärme ≈ 610 TWh
  und Prozesswärme ≈ 450 TWh** (Rechnung (M), Prozentsätze gerundet).
- Haushalte: fast 90 % der Endenergie für Wärme, davon rund zwei Drittel
  Raumwärme. GHD: Wärme rund 56 %, Raumwärme rund 50 % des EEV.
- **Industrie:** Prozesswärme 407,0 TWh = 67 % des Industrie-EEV (607,6 TWh,
  AGEB-Abgrenzung 2024); Strom deckt davon 30,7 TWh (7,5 %; 2008: 8,7 %),
  Erneuerbare 27,2 TWh (6,7 %). Industriestrom insgesamt 186,0 TWh (−20 % gegen
  2008). UBA-Fachgebiet V 1.4, Präsentation vom 15./16.06.2026.
- **Temperaturniveau:** nur qualitativ (UBA: bis 200 °C Wärmepumpen,
  Abwärme, Wärmerückgewinnung; über 200 °C direkte Elektrifizierung). Eine
  TWh-Aufteilung (< 100 °C, 100–500 °C, > 500 °C) ist in den zugänglichen
  Quellen nicht enthalten. Siehe Lücken.
- Anteil erneuerbarer Energien an Wärme und Kälte: 19,0 % (2025), 209,8 TWh
  (UBA Treibhausgas-Seite, Stand 31.08.2026).

## 2. Treibhausgase

### 2.1 Emissionen 2025 nach KSG-Sektor (Mio. t CO₂-Äq.)

| Sektor | 2025 | 2024 | angepasste Jahresmenge 2025 | Abstand | Projektion 2030 (UBA 2026) |
|---|---:|---:|---:|---:|---:|
| Energiewirtschaft | 189,1 | 189,7 | keine Sektorvorgabe | – | 94 |
| Industrie | 144,1 | 149,8 | 164 | −20 | 116,5 |
| Gebäude | 103,4 | 100,0 | 90,1 | +13,3 | n. n. im Text² |
| Verkehr | 146,3 | 144,2 | 116,8 (PDF: 117) | +29,5 | 115 |
| Landwirtschaft | 60,8 | ≈ 60,8 | 66 | −5,2 | 58,2 |
| Abfall und Sonstiges | 5,1 | 5,3 | 8,8 | −3,7 | 4,1 |
| **Summe (ohne LULUCF)** | **648,9** | 649,8 | 661,6 | −12,7 | −62,6 % ggü. 1990 |
| LULUCF (netto, außerhalb der Summe) | +26,9 | – | Ziel 2030: −25 | – | Zielverfehlung 2030 knapp 50 |

² Die Gebäude-Projektion 2030 nennt die UBA-Presseunterlage nur als
kumulierte Zielverfehlung 2021–2030 von 110,1 Mt.
Fundstellen: UBA, „Emissionsdaten 2025 & Projektionsdaten 2026“, Stand
14.03.2026, S. 1–9 (primär gelesen); UBA-Seite „Treibhausgas-Emissionen“,
Stand 31.08.2026.

**Ziele (KSG, laut UBA-Seite):** −65 % bis 2030, −88 % bis 2040 gegen 1990,
Netto-Treibhausgasneutralität 2045. Nach der KSG-Novelle 2024 zählt das
Gesamtergebnis, nicht mehr der einzelne Sektor. Hinweis: Die UBA-Seite schreibt
„CO₂-Emissionen“, gemeint sind die Treibhausgase insgesamt. Die ursprünglichen
Sektorziele 2030 (Anlage 2a KSG) konnten nicht an der Quelle belegt werden
(Suchtreffer nennen Energiewirtschaft 108, Industrie 118 Mt, Konfidenz C; die
übrigen Werte fehlen).

**UBA-Projektion 2026 (Stand der Beschlüsse Nov. 2025):** 2030 −62,6 % (Ziel
−65 %; Lücke 30 Mt), 2040 rund −80 %, 2045 Brutto-Emissionen 212,5 Mt (−83 %).
Kumulierte Jahresgesamtmengen 2021–2030 würden rechnerisch nur um 3,8 Mt
unterschritten; UBA nennt das „nicht richtungssicher“. Die EU-Lastenteilung
(ESR) wird um 255 Mt verfehlt.
**Gegenposition:** Der Expertenrat für Klimafragen (Prüfbericht 18.05.2026,
Drucksache 21/6175) bestätigt die Emissionsdaten 2025, hält die Projektion für
zu optimistisch und erwartet eine Überschreitung des 2030-Budgets (Angaben
im Suchtreffer: 60–100 Mt; ein anderer Treffer: rund 30 Mt) – Konfidenz C,
nicht primär gelesen.

### 2.2 CO₂-Restbudget

| Quelle | Aussage | Annahmen | Konfidenz |
|---|---|---|---|
| SRU (Sachverständigenrat für Umweltfragen), Stellungnahme 03/2024, korrigiert 11/2024 | 1,5 °C: deutsches Budget „aufgebraucht“; **1,75 °C bei 67 %: 3,8 Gt CO₂ ab 2024** (Erstfassung 3,9 Gt; EU: 28,7 Gt); lineare Reduktion hieße Klimaneutralität 2036 | gleiche Pro-Kopf-Rechte, IPCC AR6 / Forster et al. 2023 | C (Suchtreffer, nicht primär) |
| SRU, Stellungnahme Verfassungsbeschwerden 10/2025 | 1,75 °C-Budget bei linearer Minderung 2033 erschöpft | Stand 2025 | C |
| Ariadne-Gesamtsystemmodelle | indikatives Budget 2020–2045: **8,2 Gt CO₂-Äq.** (netto, inkl. Senken, ohne int. Flug-/Schiffsverkehr) | modellintern, kein Gerechtigkeitsmaßstab | B (primär, PDF S. 17) |
| KSG-Gesamtmenge 2021–2030 | rund 6.200 Mt laut Suchtreffer | gesetzliche Jahresmengen | C |

Die Spanne zwischen SRU (Pro-Kopf, 1,75 °C) und Ariadne (modellhafte Kosteneffizienz)
zeigt: Das „Budget“ hängt an der Gerechtigkeitsregel, nicht nur an der Physik.
Die Brutto-Budget-Dossiers sollten beide Lesarten führen.

## 3. Bedarfspfade aus den Szenariostudien

**Wichtig vorab:** Die Studien weisen unterschiedliche Größen aus (Bruttostrom-
verbrauch, „Stromnachfrage = Netto plus Netzverluste“, „Stromnutzung inkl.
Elektrolyse und PtX“). Elektrolysestrom steckt in den meisten 2045-Zahlen.
Auftraggeber: Ariadne (BMBF-Kopernikus), Agora (Stiftungen: Mercator, European
Climate Foundation), ISE (BMWK, BMBF), NEP (Übertragungsnetzbetreiber,
von der Bundesnetzagentur genehmigter Rahmen), BMWK-Langfristszenarien
(BMWK), dena-Leitstudie (dena, EWI), BDI/BCG (BDI).

### 3.1 Bruttostromverbrauch / Stromnachfrage (TWh pro Jahr)

| Studie (Jahr, Status) | 2030 | 2037 / 2035 | 2045 | Abgrenzung und Fundstelle | primär gelesen |
|---|---|---|---|---|---|
| Ariadne „Die Energiewende kosteneffizient gestalten“ (03/2025) | 681–807 | – (nur Grafik) | 1.037–1.423 | Netto + Netzverluste, 3 Technologieszenarien + Existierende Politiken; PDF S. 20 | ja |
| Agora „Klimaneutrales Deutschland“, Vertiefung (2024) | 727 | – | 1.267 | Bruttostromverbrauch; davon 2045 Verkehr 221, Industrie 448, Gebäude 302, Elektrolyse 119 (Tab. Kernindikatoren, PDF S. 46) | ja |
| Fraunhofer ISE „Wege zu einem klimaneutralen Energiesystem“ (2024) | 670–789 | – | 1.227–1.544 | Stromnachfrage inkl. H₂/PtX-Erzeugung, ca. 10 % Verluste; 4 Szenarien; PDF S. 33; Gebäude+Industrie direkt 675–752 | ja |
| NEP Strom 2037/2045, Version 2025, 2. Entwurf (04/2026) | – | 866–1.087 | 989–1.294 | Bruttostromverbrauch, Szenarien A, B, C; Kurzfassung S. 5 | ja |
| BMWK-Langfristszenarien 3 (2024), T45 | 765–792 | – | 1.217–1.302 | Sekundärzitat (DUH-Auswertung); abweichend nennt `strommix/` 594–638 für 2030 – **Widerspruch ungeklärt** | **nein** (C) |
| dena-Leitstudie „Aufbruch Klimaneutralität“ (2021), KN100 | 698 | – | 910 | EWI-Pressemitteilung laut Suchtreffer; veraltet | **nein** (C) |
| BDI/BCG „Klimapfade 2.0“ (2021) | – | – | 993 (netto) | BCG-Seite laut Suchtreffer | **nein** (C) |
| Monitoringbericht EWI/BET i. A. BMWE (09/2025) | 600–700 (explorativ 580–700; normativ 530–910) | – | – | über WD 5-050-26 S. 8–9 zitiert | ja (Zitat) |
| McKinsey „Zukunftspfad Stromnachfrage“ (01/2025) | 530 / 615 (Netto, Trend/Transformation) | 635 / 805 (2035) | – | **Nettostrom**, nicht brutto; über WD 5-050-26 S. 8 | ja (Zitat) |
| Bundesnetzagentur Versorgungssicherheitsmonitoring | 750 / 675 | – | – | Annahmen der Szenarien; über WD S. 10 | ja (Zitat) |
| EEG-Planungsgröße 2023 | 750 | – | – | Monitoringbericht 2023, über WD S. 7 | ja (Zitat) |
| BEE-Update (09/2025) | rund 700 | – | – | über WD S. 11 | ja (Zitat) |
| **Ist** | **518 (2024), 512–526 (2025)** | | | NEP-Basisjahr 2024; strommix-Dossier 1.5 | ja |

**Aggregation (Setzung (M), nur Studien 2024–2026, primär gelesen):**

| Größe | min | mid | max | Hinweis |
|---|---:|---:|---:|---|
| Strombedarf 2030 | 600 | 730 | 807 | min = Monitoring (nicht Szenariostudie), mid = Median der Studienmitten |
| Strombedarf 2037 (NEP) | 866 | 977 | 1.087 | nur NEP |
| Strombedarf 2045 | 989 | 1.250 | 1.544 | mid = Median der vier Studienmitten (1.142 / 1.230 / 1.267 / 1.386) |
| Strombedarf 2045, alle Studien inkl. 2021 | 910 | 1.250 | 1.544 | dena 910 als Untergrenze |

**NEP 2037/2045 V2025 (Marktsimulation, TWh, Kap. 3 Tab. S. 74):**
„Stromverbrauch“ (ohne Elektrolyse, Power-to-Heat, DSM) A/B/C 2037: 776 / 882 / 918;
2045: 831 / 959 / 1.015. Elektrolyse-Strom 2037: 52 / 114 / 124; 2045:
116 / 201 / 241. Power-to-Heat 2045: 36 / 31 / 31. Nettoimport Strom 2045:
42 / 73 / 91 TWh (Importe minus Exporte aus derselben Tabelle). Die
Szenarien liegen in der Kurzfassung „nach unten korrigiert“ gegenüber NEP 2023
(rund −50 TWh 2037, −120 TWh 2045 in den A-Szenarien).
Abweichung zum `strommix`-Dossier: Dort stehen 845–1.065 (2037) und 948–1.275
(2045) aus dem 1. Entwurf bzw. Szenariorahmen; hier gelten die Zahlen des
2. Entwurfs.

### 3.2 Wasserstoff, E-Fuels und Biomasse (TWh pro Jahr)

| Größe | 2030 | 2045 | Studie / Fundstelle | primär |
|---|---|---|---|---|
| H₂-Nachfrage inländisch | – | 175–420 | Ariadne, Zusammenfassung und Kap. 6.1.2 (PDF S. 8, 64): 175–350 (PyPSA-DE, REMIND), 330–420 (REMod) | ja |
| H₂-Derivate (E-Fuels, Methanol, Ammoniak) | – | 85–165 | Ariadne, PDF S. 64 | ja |
| Nicht-elektrischer Brennstoff-, Kraftstoff-, Rohstoffbedarf („grüne Moleküle“) | – | 515–1.023 | Ariadne, Zusammenfassung (PDF S. 8); stofflicher Energiebedarf Technologiemix 577–771 (S. 23) | ja |
| Importe H₂ / E-Fuels | – | 60–250 / 100–130 | Ariadne (S. 8, 64); Mindestimport H₂ + Derivate 160–200 | ja |
| Wasserstoffnachfrage Agora | 16 (Elektrolyse-Strom) | 268 (230 energetisch, 38 stofflich) + PtL 155 = 423; davon importiert 339 | Agora Szenariopfade PDF S. 29; Tab. S. 46 | ja |
| ISE Szenario „Technologieoffen“ | – | 370 (244 Import + 126 inländisch); H₂-Speicher 130 TWh | ISE PDF S. 5 | ja |
| NEP 2045, inländische Elektrolyse | – | 116–241 TWh Strom → bei 70 % Wirkungsgrad (NEP-Annahme) 81–169 TWh H₂ | NEP Kap. 3 S. 74, Wirkungsgrad S. 30 | ja |
| Nationale Wasserstoffstrategie (Zitat in Ariadne) | – | 360–500 H₂ + 200 Derivate | Ariadne PDF S. 64 | ja (Zitat) |
| dena KN100 | 66 | 458 | EWI-Auszug laut Suchtreffer | nein (C) |
| BDI/BCG 2021 | – | > 540 (H₂ + Synfuels) | BCG-Seite laut Suchtreffer | nein (C) |
| Synthetische und biogene Kraftstoffe (Verkehr) | – | 180–195 (Technologieszenarien), 160 bis 205 über alle Szenarien; ca. 90 % für int. Verkehr | Ariadne Kap. 3 (PDF S. 29) | ja |
| Biomasse | – | Ariadne: ca. 300 Primärenergie (Annahme), davon ca. 200 für Industrie/Flug/Schiff; Agora: 294 | Ariadne PDF S. 17; Agora PDF S. 28 | ja |

**Einordnung (Ariadne PDF S. 64):** Zum Vergleich importierte Deutschland im
Schnitt 2010–2019 jährlich 943 TWh Erdgas und 1.041 TWh Rohöl. Der Import grüner
Moleküle läge 2045 also bei rund einem Zehntel bis einem Sechstel der heutigen
fossilen Importe (Rechnung (M): 160–380 gegen rund 1.980 TWh). Die
Wasserstoff-Gestehungskosten rechnet Ariadne mit 156 EUR/MWh 2030 und
110 EUR/MWh 2045.

### 3.3 Endenergie und Elektrifizierung in den Studien

- **Ariadne:** Endenergiebedarf sinkt 2015–2045 um 31–45 %; Stromanteil an der
  Endenergie 2045 bei 53–80 % (ohne int. Verkehr und stofflichen Bedarf), bei
  voller Zählung 47–59 %. Pkw-Endenergie 2045: 90 (niedrige Nachfrage) bis
  130 TWh (hohe Nachfrage).
- **Agora:** Verkehr 2045 rund 275–280 TWh Endenergie (Strom 221, H₂ 32,
  strombasierte Kraftstoffe 22), weniger als die Hälfte von 2022; Gebäude
  2045 700 TWh Endenergie bei konstant knapp 280 TWh Strom; Industrie-Strom
  2045 448 TWh (Verdopplung gegen 2023: 187 TWh); Wärmepumpen-Strom 85 TWh
  (2030: 41).
- **ISE:** Primärenergiebedarf 2045 bei 69 % („Effizienz“) bis 80 %
  („Beharrung“) des Wertes 2022 (3.250 TWh); Wind und PV 57–76 % der
  Primärenergie; Verkehr 13–14 % des Strombedarfs.
- **Eigene Rechnung (M), Agora gegen Ist:** Verkehr 576 TWh (2024) → 280 TWh
  (2045) = −51 % Endenergie bei steigendem Stromanteil von 3 % auf rund 80 %.

## 4. Umrechnungsfaktoren für das Modell

Jede Zeile mit Quelle, Abgrenzung und Bandbreite; „Setzung (M)“ nur dort, wo
die Quellen nichts hergeben.

| Faktor | min | mid | max | Quelle, Fundstelle, Abgrenzung | Konfidenz / primär |
|---|---:|---:|---:|---|---|
| **WP-Jahresarbeitszahl Bestand, Luft/Wasser** | 2,6 | 3,4 | 4,9 | Fraunhofer ISE, Presseinformation 03.11.2025, 61 Anlagen, EFH-Bestand, BMWE-gefördert (FKZ 03EN2029A); Vorprojekt 3,1 | A (Vorprojekt, Feldtest, NEP-Annahmen passen) / ja |
| WP-JAZ Bestand, Erdreich | 3,6 | 4,3 | 5,4 | wie oben, 16 Anlagen | B / ja |
| WP-JAZ Neubau | 2,9 (Luft) | 3,9 (Erdreich) | 4,1 | ISE „WP-Effizienz“, 110 Anlagen in Neubau-EFH, Messung 2007–2010: Erdreich 3,9 bzw. 4,1, Luft 2,9 bzw. 3,0; **veraltete Technik, kein aktueller Neubau-Wert** | C / ja |
| WP-JAZ in der Netzplanung (NEP, HH) | 3,17 | 3,3 | 3,32 | Bundesnetzagentur, Genehmigung Szenariorahmen 2025, S. 27: A 3,17 / 3,19; B, C 3,27–3,32 (2037/2045), entspricht LFS3 | B / ja |
| WP-JAZ ÜNB-Entwurf | 3,6 | 3,7 | 3,8 | Szenariorahmenentwurf 2024, S. 43; BNetzA hat niedriger genehmigt | B / ja |
| WP-JAZ Agora 2045 | 3,5 (Wohn) | – | 4,0 (Nichtwohn) | Agora Szenariopfade PDF S. 89 | B / ja |
| **E-Pkw real** [kWh/100 km] | 15 | 18 | 25 | UBA TEXTE 160/2022 (ifeu/TU Graz): Realverbrauch rund 18, im Mittel 15 % über WLTP, inkl. 17,5 % Ladeverlust; −20 °C bis doppelt; ISE setzt 18 (S. 71); ADAC-Test 13,4–29,7 laut Suchtreffer | A (UBA, ISE, Agora) / ja für UBA, ISE |
| **Verbrenner-Pkw Flotte** [l/100 km] | 6,95 (Diesel) | 7,40 | 7,74 (Benzin) | BMDV „Verkehr in Zahlen 2025/26“ S. 309 über UBA-Excel, Pkw+Kombi 2024, Inländerfahrleistung | A / ja (UBA-Excel) |
| Verbrenner-Pkw in kWh/100 km | 69 | 69 | 69 | Rechnung (M): 7,74 l × 8,94 kWh/l = 69,2; 6,95 l × 9,97 = 69,3; Heizwert-Setzung (M) | B |
| **Endenergie-Einsparung Pkw durch Elektrifizierung** | 3,2 | 3,8 | 4,6 | Rechnung (M): 69 ÷ (15 … 18 … 21,5) – Faktor; UBA-Gesamtwirkungsgrad BEV 75 %, Verbrenner < 50 % Antrieb | B |
| Batterie-Lkw Fernverkehr [kWh/100 km] | 106 | 127 | 129 | NOW-Studie (≈ 2023): 106; Kostenstudie über 26 t: 127 (ICCT-Bericht); Agora Verkehrswende 2023: 129,4 (500-kWh-Lkw); ISI-Simulation Sattelzug 156 (ohne Ladeverluste) | C / nein (Suchtreffer) |
| Wasserstoff-Lkw Fernverkehr [kg H₂/100 km] | 6,6 | 7,5 | 9,0 | Agora Verkehrswende 7,4; NOW 7,48; ICCT heute 9, künftig 6,6; × 33,3 kWh/kg ≈ 220–300 kWh/100 km | C / nein |
| Diesel-Lkw Fernverkehr [l/100 km] | 26 | 30 | 33,7 | NOW 26; Agora Verkehrswende 33,7; mid ist Setzung (M) | C / nein |
| Elektrolyse-Wirkungsgrad (Strom → H₂, Heizwert) | 0,60 | 0,70 | 0,75 | NEP Szenariorahmen/Kap. 3: 70 %; UBA-FAQ: 25 % Verlust (75 %); Übersicht: alkalisch 60–70, PEM 65–75 (Suchtreffer) | B / ja (NEP, UBA) |
| H₂-Transport und Verdichtung | 0,90 | 0,90 | 0,90 | UBA-FAQ Wasserstoff im Verkehr: rund 10 % Verlust | B / ja |
| Brennstoffzelle (H₂ → Strom) | – | 0,55 | – | UBA-FAQ: Umwandlungsverlust rund 45 % | B / ja |
| Rückverstromung im Kraftwerk (H₂ → Strom) | 0,40 | 0,55 | 0,64 | GuD „bis 64 %“ (DLR laut Suchtreffer); Gasturbine 30–40 %; **mid ist Setzung (M)**; reine H₂-Turbinen noch nicht kommerziell (Fraunhofer ISI laut Suchtreffer) | C / nein |
| Power-to-Gas-to-Power Gesamtkette | 0,25 | 0,35 | 0,45 | Rechnung (M): 0,70 × 0,90 × 0,55 ≈ 0,35; RLI-Beispiel 36 % bei je 60 % | C |
| E-Fuel-Kette (Strom → flüssiger Kraftstoff) | 0,45 | 0,47 | 0,63 | Öko-Institut laut Suchtreffer: 47 %, im besten Fall 63 %; ältere Angabe 45 % | C / nein |
| Gesamtwirkungsgrad Strom → Rad (Pkw) | – | 0,75 (BEV) / 0,28 (FCEV) | – | UBA-FAQ (Stand 30.04.2026) | B / ja |
| Gesamtwirkungsgrad Strom → Rad (Lkw) | 0,21 (Diesel + PtL) | 0,31 (FCEV) | 0,73 (BEV) | UBA-FAQ | B / ja |
| Wärme: Strom je kWh Nutzwärme | 0,20 (JAZ 5) | 0,29 (JAZ 3,4) | 0,38 (JAZ 2,6) | Rechnung (M) = 1 ÷ JAZ | B |

**Endenergie-Einsparung durch Elektrifizierung je Sektor** (Ableitung aus
den Studien, kein einzelner Literaturwert):

| Sektor | Größe | Wert | Quelle |
|---|---|---|---|
| Verkehr | Endenergie 2045 gegen 2024 | −51 % (576 → rund 280 TWh) | Rechnung (M) aus Agora S. 22 und Eurostat |
| Verkehr Pkw | je 100 km | Faktor 3,2–4,6 | siehe oben |
| Gebäude | Endenergie 2045 | 700 TWh bei konstantem Strom ≈ 280 TWh | Agora Kap. 1.4 (Gebäude), Kernindikatoren S. 46 |
| Gebäude | Wärmepumpe gegen Gasbrennwert | je kWh Nutzwärme 0,2–0,4 kWh Strom statt 1,0 kWh Gas; **Kesselnutzungsgrad ist Setzung (M)** | Rechnung |
| Industrie | Strom statt Brennstoff | Industrie-Strom 2024: 186 TWh (AGEB-Abgrenzung); 2045 laut Agora 448 TWh; der Brennstoffersatz erfolgt über Strom, Wasserstoff und Biomasse (Ariadne: H₂ und E-Fuels tragen 41–59 % des Industrie-Energiebedarfs 2045, FORECAST-Modell) | UBA V 1.4, Agora S. 46, Ariadne Kap. 5 |
| Gesamt | Endenergie 2015–2045 | −31 bis −45 % | Ariadne PDF S. 22 |

## 5. Der aktuelle Regierungspfad

Für Ausbau- und Kraftwerksfragen übernimmt dieses Dossier die Zahlen des
Dossiers `strommix/research/ist_zustand_de.md` (§ 3 und § 6) als Sekundärbeleg;
sie wurden **nicht** erneut an den Originalen geprüft (Konfidenz B bis C, siehe dort).

| Element | Stand | Quelle / Konfidenz |
|---|---|---|
| EEG-Ziele 2030 | PV 215 GW, Wind onshore 115 GW, Wind offshore ≥ 30 GW, EE-Anteil ≥ 80 % am Bruttostromverbrauch | strommix § 3.1, B |
| WindSeeG | ≥ 40 GW 2035, ≥ 70 GW 2045 | strommix § 3.1, B |
| Zielerreichung Anfang 2026 | PV 117 GW (54 %); Wind onshore 68,1 GW (59 %); offshore 9,6–10,8 GW (32–36 %); Zubau 2025: PV 16,4 GW, Wind onshore 4,6 GW | strommix § 3.2, B |
| EE-Anteil am Bruttoendenergieverbrauch 2025 | 23,8 % (NECP-Ziel 2030: 41 %) | UBA, primär gelesen, A/B |
| Strombedarf 2030 (Planungsgröße) | von 750 auf 600–700 TWh gesenkt (Monitoringbericht 15.09.2025) | WD 5-050-26 S. 8–10, primär, A |
| Effizienzgesetz (EnEfG) | Endenergie 2030 1.867 TWh (−26,5 % gegen 2008), 2045 1.400 TWh; Primärenergie 2030 −39,3 %; Projektion UBA: 9.800 PJ (≈ 2.720 TWh), −32 % | UBA, primär, B |
| Kohleausstieg | spätestens 2038 (KVBG); Rheinisches Revier 2030; Überprüfung 2026 (Vorziehen auf 2035) ohne gefundenes Ergebnis | strommix § 6.1, B |
| Kraftwerksstrategie (StromVKG) | Kabinett 13.05.2026; Ausschreibungen 4,5 GW (01.09.2026) und 4,5 GW (08.12.2026), insgesamt zunächst 11 GW, Inbetriebnahme spätestens 2031; Koalitionsvertrag nennt bis zu 20 GW bis 2030 | strommix § 6.2, B |
| Wasserstoff-Kernnetz | genehmigt 22.10.2024: 9.040 km (rund 60 % umgestellte Gasleitungen), 18,9 Mrd. EUR, Inbetriebnahme bis 2032; erste rund 500 km 2025 laut Suchtreffer | Bundesnetzagentur, primär gelesen (Länge, Kosten), A; Inbetriebnahmen C |
| Treibhausgas-Ziel 2030 | −62,6 % projiziert statt −65 %; Gebäude und Verkehr verfehlen kumuliert um 110 bzw. 187 Mt | UBA 14.03.2026, primär, A |

**Was die Bundesregierung 2025/2026 geändert hat:** (1) Der
Monitoringbericht „Energiewende. Effizient. Machen.“ (EWI/BET, 15.09.2025)
senkte die Strombedarfs-Erwartung 2030 von 750 auf 600–700 TWh und hebt hervor,
dass explorative Szenarien kurzfristig belastbarer seien als zielgetriebene. (2) Die
Kraftwerksstrategie wurde zu einem ausgeschriebenen Kapazitätsmodell mit 11 GW
im ersten Schritt. (3) Der Netzentwicklungsplan wurde nach unten korrigiert.
Das Original des Monitoringberichts (bundeswirtschaftsministerium.de) war nicht
freigegeben, die Zahlen stammen aus der Bundestags-Dokumentation WD 5-050-26.
**Zusatz:** Die Bundesnetzagentur hat in ihrem genehmigten Szenariorahmen die
WP-JAZ der ÜNB (3,6–3,8) auf 3,17–3,32 gesenkt (Genehmigung S. 27); die
Genehmigung bewertet die Wärmepumpen-Annahmen der LFS3 als maßgeblich.

## 6. Gegenpositionen

### 6.1 „Die Prognosen sind zu hoch“

- **Ist gegen Planung:** Bruttostromverbrauch 2017 602 TWh, 2024 522 TWh
  (Bundesregierung, Schriftliche Frage 30.09.2025); BDEW: erste acht Monate
  2025 +0,1 %. Um die Mitte der Bandbreite (650 TWh) zu erreichen, müsste der
  Verbrauch in fünf Jahren um über 25 % wachsen (WD 5-050-26 S. 10).
- **Final consumption Strom (Eurostat):** 528 TWh (2008) → 472 TWh (2024);
  Industrie 235 → 197 TWh; die Industrie-Elektrifizierung stagniert bei 7,5 %
  der Prozesswärme (UBA).
- **McKinsey (01/2025):** Netto 530 TWh im Trendpfad 2030 (615 im
  Transformationspfad); größte Abweichungen bei Verkehr und Wasserstoff.
- **NEP:** 2025er Szenarien gegen 2023 um 50 TWh (2037) bzw. 120 TWh (2045)
  gesenkt; die Marktsimulation unterstellt in Szenario C 2045 noch 241 TWh
  Elektrolysestrom, während Wasserstoff-Projekte ausbleiben.
- **Wasserstoffbedarfe:** Ariadne hält die Modellergebnisse (160–200 TWh
  Mindestimport) für niedriger als die Annahmen der Nationalen
  Wasserstoffstrategie (360–500 + 200 TWh).

### 6.2 „Die Prognosen sind zu niedrig oder die niedrigen Ist-Werte täuschen“

- **Deindustrialisierung als Ursache, nicht als Beleg:** UBA führt das
  Industrie-Emissionsminus 2025 „primär“ auf schwächere Wirtschaft zurück
  (Primärstahl −10 %, Chemie-Gas −8 %). Weniger Verbrauch aus
  Produktionsverlust ist nicht Elektrifizierung. Industrie-EEV 2024:
  607,6 TWh, −15 % gegen 2008; Industriestrom −20 % gegen 2008 (UBA V 1.4).
  *Das Deindustrialisierungs-Argument stützt sich damit auf reale Daten; ob der
  Rückgang struktureller Verlust oder Konjunktur ist, lässt sich aus dem
  Energieverbrauch allein nicht entscheiden.*
- **Rechenzentren:** Bitkom/Borderstep (11/2025, Suchtreffer): 21,3 TWh in 2025
  (rund 4 % des Stroms), Szenarien 2030 zwischen 25 und 37 TWh; BMWK-LFS bis
  88 TWh IT-Strom 2045 (strommix, Konfidenz B). Der NEP unterstellt rund 50 TWh
  mehr als der Korridor (Monitoring, über strommix) – eine der wenigen Stellen, an
  denen eine Prognose nach oben läuft.
- **Elektrifizierung kommt verzögert:** Das BNetzA-Szenario 750 TWh und der BEE
  (rund 700 TWh) argumentieren mit einer nachholenden Elektrifizierung; der
  Expertenrat für Klimafragen sieht die UBA-Projektion 2030 als zu optimistisch.
  Die Datenlage widerlegt beides: 2025 ist der Verbrauch im Vorjahresvergleich
  kaum gestiegen.
- **Spannweite statt Punktwert:** Normative Szenarien projizieren für 2030
  530–910 TWh (EWI/BET), explorative 580–700; die Studien sind zielgetrieben.

### 6.3 Schwächen dieser Datenbasis (Quellenkritik)

- Ariadne und ISE sind forschungsfinanziert (BMBF/BMWK); Agora wird von Stiftungen
  getragen und vertritt ein erklärtes Ziel; der NEP stammt von den
  Netzbetreibern, die vom Netzausbau leben. Keine der Studien rechnet den
  Verzicht auf die Energiewende gegen.
- Die 2045-Zahlen lassen sich nicht einfach mitteln: Sie enthalten teils
  Elektrolysestrom, teils nicht, teils Netzverluste.

## Lücken

1. **AGEB-Originaltabellen** (Energiebilanz 2024/2025, Auswertungstabellen
   Endenergie nach Sektoren und Anwendungszwecken, Jahresbericht 2025): nicht
   abrufbar. Folge: keine AGEB-Zahlen für 2025, EEV nur aus Eurostat und
   rechnerisch aus UBA-Folien.
2. **Prozesswärme nach Temperaturniveau** (TWh unter 100 °C, 100–500 °C,
   über 500 °C): in den erreichbaren Quellen nicht ausgewiesen. Eine
   Kurzstudie (DENEFF 2024) und ISI-Policy-Brief kamen nur als Treffer.
3. **BMWK-Langfristszenarien 3, dena-Leitstudie, BDI/BCG:** nur Sekundärzahlen;
   ein Widerspruch bei LFS3 2030 (765–792 gegen 594–638) bleibt ungeklärt.
4. **Szenariowerte für 2035:** Es gibt keine Primärwerte außer McKinsey (Netto);
   die Ariadne-Zahlen liegen nur in Grafiken.
5. **Lkw-Verbräuche** (BEV, H₂, Diesel) stammen aus Suchtreffer-Auszügen;
   Originalstudien (ICCT, NOW, Agora Verkehrswende) nicht gelesen.
6. **WP-JAZ im Neubau** aktueller Technik: kein Wert; der gelesene ist 2007–2010.
7. **Sektorziele 2030 nach Anlage 2a KSG** nicht an der Quelle belegt;
   Gesamtbudget 2021–2030 nur als Suchtreffer.
8. **SRU-Restbudget** nur über Suchtreffer; der Gigatonnen-Wert für 2025 fehlt.
9. **Zielerreichung Ausbau (EEG)** und Kraftwerksstrategie aus dem
   strommix-Dossier übernommen, nicht neu geprüft.
10. **Wasserstoff-Kernnetz:** tatsächlich in Betrieb befindliche Kilometer 2026
    nicht belegt.
11. **Rückverstromung:** keine belastbare Primärquelle für Wirkungsgrade
    künftiger H₂-Kraftwerke.

## Nicht erreichbar

| Host | Gewünschtes Dokument | Grund |
|---|---|---|
| ag-energiebilanzen.de | Energiebilanz 2024/2025, Auswertungstabellen, Jahresbericht 2025, Infografiken 05/06 2026 | Die freigegebene Adresse `www.ag-energiebilanzen.de` leitet auf `ag-energiebilanzen.de` um; der Proxy lehnt diesen Host mit 403 ab. Nicht umgangen. Zahlen nur aus Suchtreffer. |
| bundeswirtschaftsministerium.de, langfristszenarien.de | Monitoringbericht „Energiewende. Effizient. Machen.“ (09/2025), LFS3-Ergebnisse | nicht auf der Freigabeliste, nicht versucht |
| dena.de, ewi.uni-koeln.de | dena-Leitstudie, EWI-Szenarienvergleich | nicht freigegeben, nicht versucht |
| bdi.eu, bcg.com | Klimapfade 2.0 | nicht freigegeben, nicht versucht |
| umweltrat.de, gesetze-im-internet.de, expertenrat-klima.de | SRU-CO₂-Budget, KSG Anlage 2a, Expertenrat-Prüfbericht 2026 | nicht freigegeben, nicht versucht |
| adac.de, icct.org, bitkom.org, bdew.de | E-Auto-Test, ICCT-Lkw, Rechenzentrums-Studie, Energieversorgung 2025 | nicht freigegeben, nicht versucht |

## Quellenliste

Primär gelesen (Original im Manifest): Eurostat nrg_bal_c (DE, Datenbankstand
27.08.2026); UBA-Seiten Treibhausgas-Emissionen (31.08.2026), Endenergieverbrauch
(15.05.2026), Primärenergieverbrauch (18.12.2025), Wärme, Stromverbrauch,
Verkehr (Excel-Dateien TREMOD 6.71B, BMDV „Verkehr in Zahlen 2025/26“); UBA
„Emissionsdaten 2025 & Projektionsdaten 2026“ (14.03.2026); UBA V 1.4
„Endenergieverbrauch in der Industrie“ (15./16.06.2026); UBA TEXTE 160/2022
„Energieverbrauch von Elektroautos (BEV)“; UBA-FAQ „Wasserstoff im Verkehr“
(30.04.2026); Ariadne-Report „Die Energiewende kosteneffizient gestalten“
(03/2025) und Webinarfolien; Agora Energiewende et al. „Klimaneutrales
Deutschland – Vertiefung der Szenariopfade“ (2024); Fraunhofer ISE „Wege zu
einem klimaneutralen Energiesystem“ (2024) und Pressemitteilung 03.11.2025;
Fraunhofer ISE Projektseiten WPsmart und WP-Effizienz; NEP Strom 2037/2045
V2025 2. Entwurf Kurzfassung und Kap. 3, Szenariorahmen 2025 (Entwurf und
Genehmigung); Bundestag WD 5-050-26 „Prognosen zum Bruttostromverbrauch“
(23.04.2026); Bundesnetzagentur Wasserstoff-Kernnetz.
Nur Suchtreffer (nicht primär gelesen): AGEB-Infografiken, dena/EWI, BDI/BCG,
BMWK-LFS3 (über DUH), SRU, Expertenrat, Bitkom, ADAC, ICCT, NOW, Agora
Verkehrswende, Öko-Institut, DLR, RLI.
Repo-intern: `strommix/research/ist_zustand_de.md`.

```json
@@JSON@@
```
