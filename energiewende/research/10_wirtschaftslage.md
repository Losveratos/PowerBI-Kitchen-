# Dossier 10 · Wirtschaftslage und Energiepreise

Stand 22.11.2026 · Phase 1 · Auftrag P1-10 · geschrieben von einem Sonnet-Agenten (Recherche, Daten) ·
Regeln: `agents/REGELN.md` · Rohdaten und Prüfsummen: `quellen/manifest_P1-10.json` ·
aufbereitete Daten: `data/p1_10_*.csv` (Skripte `scripts/p1_10_aufbereiten.py`, `scripts/p1_10_jsonstat.py`).

Wichtig vorab: Ein großer Teil der Bezugsgrößen (Eurostat, Weltbank, Destatis-Tabelle, KfW-Studien, UBA) wurde aus
Primärdaten selbst gelesen. Die Fachliteratur der Institute (Bundesbank, Sachverständigenrat, ifo, IfW, DIW, IW) war
**nicht abrufbar**; dazu liegen nur Suchtreffer-Zusammenfassungen vor (alle `primaer_gelesen: false`, höchstens Stufe C
bzw. B bei Primärbeleg über KfW). Die Frage „wie groß ist der Anteil der Energiepreise am Produktionsrückgang“ bleibt
deshalb **offen** (siehe Lücken).

## 1. Kernaussagen

1. **Die Größenordnung der R21-Angaben zur Industrie stimmt, die Basis ist günstig gewählt.** Industrieproduktion
   (Bergbau, Verarbeitendes Gewerbe, Energie; Eurostat, kalenderbereinigt) 2025 gegenüber 2018: −15,0 %, gegenüber 2019: −12,2 %.
   Energieintensive Zweige 2025 gegenüber 2019: Chemie −17,9 %, Glas/Keramik/Steine und Erden −20,0 %, Metall −15,6 %,
   Papier −18,2 %; gegenüber dem Höchststand 2018: −20 bis −21 %. R21 schreibt „gegenüber der Zeit vor dem Jahr 2020“
   ohne Basisjahr. **Konfidenz A** (Eurostat, KfW-Kapitel 3: „etwa 80 % des Vorkrisenniveaus“; beide selbst gelesen).
2. **Der Rückgang der energieintensiven Produktion ist kein rein deutsches Phänomen.** EU27: Chemie −16,0 %, Metall −12,2 %
   gegenüber 2019; Frankreich Chemie −11,6 %, Italien −14,4 %; Polen dagegen +19,3 %, Spanien +1,3 %. Das Verarbeitende
   Gewerbe insgesamt: Deutschland −11,3 %, EU27 +2,7 %, Frankreich −3,8 %, Italien −6,1 %, Spanien −0,3 %, Polen +27,5 %.
   Deutschland ist die größte Schwäche der großen EU-Länder, aber nicht allein. **Konfidenz B** (eine Quelle, Eurostat; EU-Aggregat
   enthält Sondereffekte, nicht geprüft).
3. **Strompreis: Deutschland liegt für Industrie und Haushalte über dem EU-Durchschnitt, und der Abstand ist älter als die Krise.**
   Industriestrom (Band 2.000–19.999 MWh, ohne MwSt), 2026-S1: DE 17,4 ct/kWh, EU27 15,6, FR 12,4, ES 11,8, PL 18,1, IT 19,9.
   Vor der Krise (2019-S1) lag DE bei 13,1 gegen EU27 10,5 (+25 %); 2025-S2 bei 19,2 gegen 16,0 (+20 %). Haushaltsstrom
   (2.500–4.999 kWh, alle Steuern) 2026-S1: DE 36,2 ct, EU27 28,3 ct (+28 %); 2025 im Jahresmittel 38,5 ct, R21 nennt 38 ct. **Konfidenz A**
   (Eurostat-Zeitreihen, R21-Zahl gegengeprüft; Quellen sind nicht unabhängig voneinander, Mitgliedstaaten melden an Eurostat).
4. **Gas: Industriegaspreise liegen in Deutschland nahe am EU-Durchschnitt** (Band 10.000–99.999 GJ, ohne MwSt, 2026-S1:
   DE 6,8 ct/kWh, EU27 6,2, FR 6,1, ES 4,9, IT 5,9). Der große Abstand besteht gegenüber Nordamerika: Großhandel 1. Halbjahr 2025
   rund 11,5 €/MWh dort gegen 41 €/MWh in Europa (KfW). Der Satz „höchste Energiekosten aller Industriestaaten“ (R21) ist für Gas
   innerhalb der EU nicht, für Strom nur teilweise belegt (Italien und die Niederlande liegen bei Industriestrom gleichauf oder höher).
   **Konfidenz B**.
5. **Was den Strompreis seit 2021 getrieben hat, ist vor allem die Beschaffung (Gaspreis), nicht Umlagen.** Haushalt, ct/kWh: Beschaffung
   2019 5,8 → 2023 19,9 → 2025 14,8; Netz 7,4 → 11,3; Steuern, Abgaben ohne MwSt 11,0 → 6,3 (die EEG-Umlage, 6,7 ct, entfiel 2022;
   die Kosten trägt seit 2023 der Bundeshaushalt). Industrie (2.000–19.999 MWh): Beschaffung 3,1 → 10,5, Netz 3,1 → 5,5, Steuern ohne MwSt
   8,7 → 3,9. Der gestiegene Netzanteil (+3,9 ct Haushalt, +2,4 ct Industrie gegenüber 2019) ist der Teil, der mit dem Netzausbau
   zusammenhängen kann; eine Aufspaltung nach Ursache liefert Eurostat nicht. **Konfidenz A** für die Zahlen, **C** für jede Ursachenzuschreibung.
6. **EEG-Kosten sind nicht verschwunden, sondern verlagert.** Bundeszuschuss zum EEG-Konto 2025: rund 16,5 Mrd. €, 2026 im Haushalt
   rund 17,2 Mrd. € (Netzbetreiber-Prognose 12,4 Mrd.); 2024 lagen die Ausgaben des Kontos bei 21,985 Mrd. €. Nur aus Suchtreffern
   und Verbandsseiten, kein Primärdokument gelesen. **Konfidenz C**.
7. **Insolvenzen: „immer mehr“ stimmt seit 2022, ein Rekord ist es nicht.** Unternehmensinsolvenzen: 2021: 13.993, 2022: 14.590,
   2023: 17.814, 2024: 21.812, 2025: 24.064 (Destatis, Stand 13.03.2026). Das ist der höchste Wert seit 2014 (24.085), aber unter 2010
   (31.998) und weit unter 2003 (39.320). Die Zahl der Insolvenzen sagt nichts über Größe und Branche. **Konfidenz B** (eine amtliche Quelle,
   selbst gelesen).
8. **Investitionen: Die Schwäche ist real und geht über den Industriesektor hinaus.** Bruttoanlageinvestitionen real 2025 gegenüber 2019:
   Deutschland −6,4 %, EU27 +5,0 %, Frankreich +3,8 %, Spanien +13,5 %. Investitionsquote DE 21,0 % (2019) → 20,2 % (2025), nominal
   915 Mrd. €. Reales BIP 2025 gegenüber 2019: DE +0,8 % (Eurostat) bzw. +0,3 % (Weltbank), EU27 +7,6 %, USA +15,2 %, Japan +2,1 %, Italien +6,4 %.
   Direktinvestitionen: Zuflüsse nach Deutschland im Mittel 2015–19 und 2021–25 praktisch gleich (93 bzw. 91 Mrd. US-$); Abflüsse eher niedriger
   (154 → 137). Ein Einbruch der Direktinvestitionen zeigt sich **nicht**. **Konfidenz A** (Eurostat und Weltbank).
9. **Zur Gegenrechnung „Investition gegen Verlust“ fand dieses Dossier keine abrufbaren makroökonomischen Primärstudien.** Die KfW/Prognos-Studie
   (Auftraggeber KfW, Juni 2026) rechnet 5,7–6,4 Bio. € Bruttoinvestitionen 2025–2045, 270–300 Mrd. €/Jahr, davon klimaschutzbedingter Mehrbedarf
   135–153 Mrd. €/Jahr, und schreibt ausdrücklich, ihr Modell erlaube keine Aussagen zu BIP und Beschäftigung. Das ist ein Beleg dafür, dass R21 eine
   Bruttosumme mit einem Verlust gleichsetzt; die Gegenrechnung steht in den Dossiers zu Kostenstudien und im Modell. **Konfidenz A** für die Aussage der
   KfW-Studie, **C** für die Literaturlage zu Wachstumseffekten (nur Suchtreffer).
10. **„Als einziges Industrieland nutzt Deutschland Erneuerbare als Ersatz“ ist in dieser Form nicht haltbar.** Fossile Stromerzeugung 2005 → 2024
    (Eurostat): Spanien 185 → 66 TWh, Italien 247 → 134 TWh, Dänemark 26 → 4 TWh, Deutschland 387 → 215 TWh; Erneuerbare im gleichen Zeitraum in Spanien
    42 → 161 TWh. Der Ersatz fossiler Erzeugung ist europäisches Muster. Deutschland unterscheidet sich im **vollständigen Kernenergieausstieg**
    (163 TWh 2005 → 0 TWh 2024) und darin, dass die Gesamterzeugung um 17 % sank (EU27: −3 %). Atomausstieg bzw. -rückgang gab es auch in Japan
    (Kernenergieanteil 27,5 % 2005 → 9,2 % 2024) und Großbritannien (20,5 % → 14,2 %). **Konfidenz A** für die Eurostat-Zahlen, **B** für Weltbank-Anteile.

## 2. Befunde

### 2.1 Bezugsgrößen

Deutschland, Eurostat `nama_10_gdp`, Stand 11.11.2026. Reihe 1975–2025 in `data/p1_10_bip_investitionen.csv`.

| Größe | 2010 | 2019 | 2022 | 2024 | 2025 |
|---|---|---|---|---|---|
| BIP nominal, Mrd. € | 2.615 | 3.558 | 4.011 | 4.387 | 4.530 |
| BIP real (Kettenindex 2020), Mrd. € | 3.086 | 3.624 | 3.683 | 3.646 | 3.654 |
| Bruttoanlageinvestitionen nominal, Mrd. € | 502 | 748 | 865 | 898 | 915 |
| Investitionsquote, % des BIP | 19,2 | 21,0 | 21,6 | 20,5 | 20,2 |
| Bruttoanlageinvestitionen real, Mrd. € | 603 | 759 | 744 | 714 | 710 |

Auffälligkeit: Eurostat weist für 2023 und 2024 identische reale BIP-Werte aus (3.645.641,5 Mio. €), die Weltbank −0,5 % für 2024.
Ursache nicht geklärt; deshalb die Spanne +0,3 bis +0,8 % für 2025 gegenüber 2019.

**Gegenprüfung R21 (Zusammenfassung S. 3, Kap. 3 S. 12):** „10 bis 13,8 Billionen Euro … das Zwei- bis Dreifache der jährlichen Wirtschaftsleistung
für einen Zeitraum von zwanzig Jahren.“ Gegen das BIP 2025 (4,53 Bio. €): 10 Bio. = 2,2-faches, 13,8 Bio. = 3,0-faches. Die Rechnung des Papiers geht also auf. Der
Satz „für einen Zeitraum von zwanzig Jahren“ ist aber das Entscheidende: Verteilt auf 20 Jahre sind das 0,50–0,69 Bio. €/Jahr, 11–15 % des Jahres-BIP (Setzung (M):
BIP konstant bei 2025-Niveau, Summe der 20 Jahre 90,6 Bio. €).

Einordnung mit der KfW/Prognos-Bruttozahl (5,7–6,4 Bio. €, 270–300 Mrd. €/Jahr), jeweils gegen 2025 (Setzung (M)):

| Größe | Mrd. €/Jahr | % des BIP 2025 | % der Bruttoanlageinvestitionen 2025 |
|---|---|---|---|
| Brutto-Klimaschutzinvestitionen (KfW/Prognos) | 270–300 | 6,0–6,6 | 29,5–32,8 |
| Davon durch Klimaschutz ausgelöster Mehrbedarf | 135–153 | 3,0–3,4 | 14,8–16,7 |
| R21-Zitat, gleichverteilt über 20 Jahre | 500–690 | 11,0–15,2 | 55–75 |

Die R21-Zahl liegt damit um den Faktor 1,7 bis 2,5 über der KfW/Prognos-Bruttozahl; die Abgrenzung der Quellen ist verschieden (Dossier 02).

### 2.2 Industrieproduktion

Eurostat `sts_inpr_a`, Index 2021 = 100, kalenderbereinigt, Stand 19.11.2026. Reihen ab 2010 in `data/p1_10_industrieproduktion.csv`.

Deutschland, Index 2021 = 100:

| Zweig (NACE) | 2017 | 2018 | 2019 | 2022 | 2023 | 2024 | 2025 | 2025 vs. 2019 | 2025 vs. 2018 |
|---|---|---|---|---|---|---|---|---|---|
| Industrie insg. (B–D) | 107,6 | 108,6 | 105,1 | 99,1 | 97,3 | 92,8 | 92,3 | −12,2 % | −15,0 % |
| Verarbeitendes Gewerbe (C) | 107,2 | 108,4 | 105,2 | 99,3 | 98,6 | 94,0 | 93,3 | −11,3 % | −13,9 % |
| Chemie (C20) | 100,8 | 98,7 | 95,7 | 89,7 | 78,6 | 81,0 | 78,6 | −17,9 % | −20,4 % |
| Metallerzeugung (C24) | 111,5 | 111,7 | 104,8 | 95,7 | 91,6 | 90,1 | 88,4 | −15,6 % | −20,9 % |
| Papier (C17) | 101,0 | 100,6 | 98,5 | 93,8 | 82,4 | 82,6 | 80,6 | −18,2 % | −19,9 % |
| Glas, Keramik, Steine/Erden (C23) | 98,7 | 99,0 | 97,6 | 97,1 | 83,3 | 79,9 | 78,1 | −20,0 % | −21,1 % |
| Kfz (C29) | 136,0 | 133,9 | 127,3 | 102,9 | 116,1 | 107,3 | 106,6 | −16,3 % | −20,4 % |

Das Kfz-Gewerbe liegt im selben Rückgangsbereich wie die energieintensiven Zweige, obwohl es kein Großverbraucher von Energie ist. Das ist ein Hinweis, dass nicht
nur Energiekosten wirken (siehe 2.5), aber keine Zuschreibung.

Vergleich Verarbeitendes Gewerbe (C) 2025 vs. 2019: DE −11,3 %, EU27 +2,7 %, FR −3,8 %, IT −6,1 %, ES −0,3 %, PL +27,5 %.
Chemie (C20): DE −17,9 %, EU27 −16,0 %, FR −11,6 %, IT −14,4 %, ES +1,3 %, PL +19,3 %.

Anteil am Verarbeitenden Gewerbe laut Weltbank (Wertschöpfung, % BIP, 2025): DE 17,6 %, IT 15,0 %, FR 9,5 %, ES 10,6 %, KR 27,4 %, CN 24,7 % (Japan 2024: 18,8 %).

**Gegenprüfung R21 (Präambel S. 6):** „energieintensiver Sektor −20 % gegenüber der Zeit vor 2020, Industrieproduktion −15 %.“ Siehe Kernaussage 1: bestätigt in der Größenordnung; die Prozentzahl hängt vom Basisjahr ab (2018/2017 ergibt −15 % bzw. −20 %, 2019 ergibt −12 % bzw. −16 bis −20 %).
Das KfW-Kapitel nennt: reale Produktion der energieintensiven Branchen Ende 2022 um gut 15 % gefallen, seitdem seitwärts bei etwa 80 % des Vorkrisenniveaus.

### 2.3 Energiepreise im Vergleich

Eurostat `nrg_pc_202…205`, Halbjahresdaten, Stand 19./20.10.2026. Alle Reihen (DE, EU27, FR, PL, ES, IT, DK, NL; Bänder; drei Steuerstufen) in
`data/p1_10_energiepreise_halbjahr.csv`. Die Reihen ab 2007 (neue Verbrauchsbänder) liegen vor; die Tabelle nennt ausgewählte Halbjahre.
Eurostat-Stufe „X_VAT“ = ohne MwSt und andere erstattbare Steuern. Preise in €/kWh.

Industriestrom, Band ID (2.000–19.999 MWh), ct/kWh, ohne MwSt:

| Land | 2010-S1 | 2015-S1 | 2019-S1 | 2021-S1 | 2022-S2 | 2023-S1 | 2024-S1 | 2025-S2 | 2026-S1 |
|---|---|---|---|---|---|---|---|---|---|
| DE | 9,9 | 13,2 | 13,1 | 15,0 | 19,5 | 20,6 | 20,2 | 19,2 | 17,4 |
| EU27 | 9,1 | 10,3 | 10,5 | 11,0 | 20,2 | 20,2 | 16,3 | 16,0 | 15,6 |
| FR | 7,0 | 9,0 | 8,4 | 8,7 | 11,4 | 22,4 | 14,1 | 12,1 | 12,4 |
| PL | 8,5 | 7,7 | 9,3 | 9,6 | 16,5 | 20,9 | 18,1 | 17,4 | 18,1 |
| ES | 9,3 | 9,7 | 9,7 | 8,8 | 24,0 | 14,4 | 11,6 | 11,9 | 11,8 |
| IT | 12,1 | 14,9 | 14,2 | 13,4 | 31,5 | 24,2 | 18,4 | 19,5 | 19,9 |
| DK | 9,2 | 9,0 | 7,0 | 7,9 | 22,2 | 13,5 | 10,8 | 12,3 | 12,7 |
| NL | 8,9 | 8,2 | 8,8 | 10,7 | 21,1 | 25,1 | 19,6 | 18,2 | 18,2 |

Band IE (20.000–69.999 MWh): DE 2026-S1 14,6 ct, EU27 13,5, FR 9,8, ES 10,5, PL 16,9, IT 17,3. Der Abstand zu Frankreich und Spanien hat sich gegenüber 2019 vergrößert
(DE/FR 2019-S1: 1,26-fach; 2026-S1: 1,50-fach), was KfW mit dem geringeren fossilen Anteil dort in Verbindung bringt (Vermutung des KfW-Textes, nicht belegt). Großverbraucher mit
Entlastungen zahlten in Deutschland 2024 nach KfW (Quelle BDEW) 14 ct/kWh, knapp 50 % über dem Mittel 2010–2019.

Haushaltsstrom, 2.500–4.999 kWh, alle Steuern, ct/kWh:

| Land | 2010-S1 | 2019-S1 | 2022-S2 | 2023-S1 | 2025-S2 | 2026-S1 |
|---|---|---|---|---|---|---|
| DE | 23,8 | 30,9 | 33,6 | 41,3 | 38,7 | 36,2 |
| EU27 | 17,3 | 21,7 | 27,7 | 28,9 | 29,0 | 28,3 |
| FR | 12,8 | 17,8 | 22,0 | 23,0 | 25,6 | 24,9 |
| PL | 13,4 | 13,4 | 16,0 | 17,7 | 27,1 | 30,0 |
| ES | 17,3 | 24,0 | 33,5 | 24,5 | 26,7 | 25,1 |
| IT | 19,7 | 23,0 | 36,4 | 37,8 | 29,7 | 31,4 |
| DK | 26,7 | 29,8 | 58,7 | 38,1 | 33,1 | 23,8 |

Deutschland lag bei Haushaltsstrom in allen Halbjahren seit 2010 über dem EU-Schnitt (2010: +38 %, 2019: +42 %, 2026-S1: +28 %). Der Abstand war vor der Krise größer als heute.

Industriegas, Band I3 (10.000–99.999 GJ), ct/kWh, ohne MwSt: DE 2010-S1 3,6; 2019-S1 3,2; 2022-S2 6,1; 2023-S1 8,1; 2026-S1 6,8. EU27: 3,2; 3,4; 8,7; 8,2; 6,2.
Haushaltsgas (20–199 GJ, alle Steuern): DE 5,7 (2010-S1), 6,3 (2019-S1), 12,3 (2023-S1), 11,6 (2026-S1); EU27 5,6; 6,7; 11,6; 11,0.

**USA und China** (Eurostat deckt beide nicht ab, nur Sekundärquellen aus Suchtreffern, `primaer_gelesen: false`, Stufe C):

| Angabe | Quelle laut Suchtreffer | Wert |
|---|---|---|
| Industriestrom 2025, $/MWh | BloombergNEF | DE ca. 226, USA ca. 110, China ca. 89, UK ca. 327 |
| Energieintensive Industrie 2025 | IEA, Electricity 2026 | EU über doppelt so hoch wie USA, rund 50 % über China |
| Typischer Industriekunde ohne Ausnahmen | Bundesnetzagentur (laut Pressebericht) | DE 16,77 ct/kWh, China 2024 ca. 8 ct |
| Großhandel Gas, 1. Hj. 2025 | KfW Kap. 3 (selbst gelesen), Quelle Macrobond | Europa 41 €/MWh, Nordamerika 11,5 €/MWh |

### 2.4 Zusammensetzung des deutschen Strompreises, je Jahr

Eurostat `nrg_pc_204_c` und `nrg_pc_205_c`, Jahreswerte, ct/kWh; ab 2019 vollständig aufgeschlüsselt (`data/p1_10_strompreis_komponenten_de.csv`). „Steuern/Abgaben“ enthalten alle
Steuern, Umlagen, Abgaben **ohne** MwSt; „davon erneuerbare“ ist die EEG-Position (Eurostat `TAX_RNW`). Haushalt, Band 2.500–4.999 kWh:

| Jahr | Beschaffung | Netz | Steuern/Abgaben | davon erneuerbare | MwSt | Summe |
|---|---|---|---|---|---|---|
| 2019 | 5,8 | 7,4 | 11,0 | 6,7 | 4,6 | 28,8 |
| 2020 | 5,7 | 8,6 | 11,4 | 7,0 | 4,5 | 30,3 |
| 2021 | 8,0 | 7,8 | 11,2 | 6,8 | 5,1 | 32,1 |
| 2022 | 13,0 | 8,0 | 6,8 | 2,3 | 5,3 | 33,2 |
| 2023 | 19,9 | 9,4 | 5,0 | 0,4 | 6,5 | 40,8 |
| 2024 | 16,5 | 11,5 | 5,2 | 0,3 | 6,3 | 39,5 |
| 2025 | 14,8 | 11,3 | 6,3 | 0,3 | 6,2 | 38,5 |

Industrie, Band 2.000–19.999 MWh (die MwSt ist für Unternehmen i. d. R. erstattbar):

| Jahr | Beschaffung | Netz | Steuern/Abgaben | davon erneuerbare | MwSt | Summe |
|---|---|---|---|---|---|---|
| 2019 | 3,1 | 3,1 | 8,7 | 6,0 | 2,9 | 17,8 |
| 2021 | 5,0 | 3,1 | 8,6 | 5,9 | 3,2 | 19,9 |
| 2022 | 12,6 | 3,2 | 4,6 | 1,8 | 3,9 | 24,3 |
| 2023 | 13,9 | 4,1 | 3,4 | 0,4 | 4,0 | 25,4 |
| 2024 | 12,3 | 5,4 | 3,4 | 0,2 | 4,0 | 25,2 |
| 2025 | 10,5 | 5,5 | 3,9 | 0,2 | 3,8 | 23,7 |

Abweichung: Summe ohne MwSt 2025 = 19,9 ct, die Halbjahresreihe „X_VAT“ liegt bei 19,2 ct; Gewichtung und Abgrenzung nicht geklärt (Abweichung unter 4 %).
„Beschaffung“ ist bei Eurostat „Energie und Versorgung“ und enthält die Marge des Lieferanten.

Veränderung 2019 → 2025 (ct/kWh): Haushalt Beschaffung +9,0, Netz +3,9, Steuern/Abgaben ohne MwSt −4,7 (davon erneuerbare −6,4), MwSt +1,6. Industrie: Beschaffung +7,4, Netz +2,4, Steuern/Abgaben −4,8 (erneuerbare −5,8).
Ohne den Wegfall der EEG-Umlage hätten die Preise 2025 um etwa 6 ct (Haushalt) bzw. 5,8 ct (Industrie) höher gelegen, **wenn** die Kosten stattdessen über den Preis erhoben würden. Sie werden aus dem Bundeshaushalt gezahlt (siehe 2.5).

### 2.5 Was hat den Preis getrieben (2021–2026)?

| Treiber | Befund | Quelle, Konfidenz |
|---|---|---|
| Gaspreisschock | TTF-Jahresmittel 2022 rund 124 €/MWh, Mittel 2010–19: 23 €/MWh; Erzeugerpreisindex Energie Anfang 2021 bis Spätsommer 2022 +150 %; 1. Hj. 2025 TTF 41 €/MWh, rund doppelt so hoch wie 2010–19 | KfW Kap. 3, selbst gelesen, **B** |
| Strom folgt Gas (Merit-Order) | Strompreise „werden im Merit-Order-Prinzip stark vom aktuellen Gaspreis bestimmt“; Großhandel 2024 78 €/MWh, Termin 2029 77 €/MWh | KfW Kap. 3, **B** |
| CO₂-Preis | in diesem Dossier **nicht** quantifiziert (nicht abgerufen) | Lücke |
| Netzentgelte | Haushalt 7,4 → 11,3 ct, Industrie 3,1 → 5,5 ct (2019 → 2025) | Eurostat, **A** |
| EEG | Umlage entfiel Juli 2022; Bundeszuschuss 2025 rund 16,5 Mrd. €, 2026 Haushalt 17,2 Mrd. €, Prognose Netzbetreiber 12,4 Mrd. €; Ausgaben des Kontos 2024: 21,985 Mrd. € | IHK Lippe-Detmold, pv magazine (Suchtreffer), **C** |
| Merit-Order-Effekt der Erneuerbaren | Die Suche lieferte keine Zahl für Deutschland; eine enervis-Studie (nur Österreich) und eine Montel/BUND-Kurzstudie (2026) wurden nur im Treffer-Auszug gesehen | **C**, `primaer_gelesen: false`, **Lücke** |

Industrieverbrauch 2025: 3.248 PJ, −2,9 % gegenüber 2024; die energieintensiven Zweige verbrauchen 82,0 % (2.662 PJ), die Chemie 28,6 % des Industrieverbrauchs; Erdgas 29,2 %, Strom 21,2 %.
Destatis nennt als Auslöser des erneuten Rückgangs 2025 „hohe Energiepreise und damit einhergehende Produktionsrückgänge insbesondere in der energieintensiven Industrie“ (Pressemitteilung 400 vom 16.11.2026, selbst gelesen, **B**).

Was die Institute sagen (nur über Suchtreffer-Zusammenfassungen, **C**):

| Institut | Aussage laut Zusammenfassung |
|---|---|
| ifo (Schaller/Schasching, Schnelldienst 6/2024) | qualitatives Bild: Energiepreise, Materialknappheit, Nachfrage; ökonometrische Zahlen im Treffer nicht enthalten |
| IW Köln (Bardt/Schmitz 2023) | Umfrage: rund drei Viertel der energieintensiven Firmen drosseln oder erwägen es; mehr als die Hälfte der verlorenen Produktion durch Importe ersetzt |
| IW Köln (Küper/Obst 2023) | Produktion energieintensiver Zweige fällt stärker als in der Pandemie |
| Bundesbank, Monatsbericht Dez. 2022 (S. 29) | enthält Berechnung des Produktionspotenzials bei dauerhaft höheren Energiekosten; Zahl nicht im Treffer; KfW schreibt, das Niveau passe zum heutigen Produktionsniveau energieintensiver Zweige |
| Sachverständigenrat, Jahresgutachten 2022, Kap. 5 | laut KfW: dauerhafte Abwanderung von Teilen der energieintensiven Industrie, aber keine breite Deindustrialisierung |

### 2.6 Ursachen der Industrieschwäche

Aus den selbst gelesenen Quellen (KfW Kap. 3, Destatis, Eurostat):

- **Energiepreise:** Das KfW-Kapitel führt den Produktionsverlust der fünf energieintensivsten Zweige (vor der Krise 17 % der industriellen Wertschöpfung, 15 % der Beschäftigung, rund drei Viertel des industriellen Energieverbrauchs) auf den Energiepreisschock zurück, nennt aber ausdrücklich weitere Gründe: konjunkturell schwache Nachfrage nach Grundstoffen,
  Nachfragerückgang in der Bauwirtschaft durch gestiegene Zinsen (Steine/Erden), schwache Bauwirtschaft und Autoabsatz (Metall). „Zu den Gründen für die Persistenz der Produktionsverluste gehört neben der konjunkturell schwachen Nachfrage … eine unvollständige Rückbildung der Energiepreise.“
- **Struktur:** Die Produktion außerhalb der energieintensiven Zweige blieb nach KfW-Grafik 3.2 zunächst stabil (Kfz-Erholung), fiel aber später (siehe Kfz-Index 2.2).
- **Branchen mit wenig Energiebezug:** Kfz −16,3 % (2025 vs. 2019).
- Welcher Prozentanteil des Rückgangs auf Energiepreise entfällt, ist **in keiner selbst gelesenen Quelle beziffert**. Eine ökonometrische Schätzung (ifo, IfW, Bundesbank) war nicht abrufbar. Die KfW verweist auf die Bundesbank-Rechnung, ohne Zahl.

Energiekostenanteil je Branche (nur Suchtreffer, **C**): IW-Analyse für 2020: Anteil am Bruttoproduktionswert 3,3 % (Chemie) bis 4,9 % (Glas und Metall), Verarbeitendes Gewerbe 1,7 %. Eine Statista-Reihe für 2006 bezieht
sich auf die Bruttowertschöpfung: Metall 24,7 %, Papier 23,7 %, chemische Grundstoffe 22,5 %, Glas/Keramik/Steine-Erden 20,1 %. Die Basis (Produktionswert gegen Wertschöpfung) ist unterschiedlich; aktuelle Destatis-Kostenstrukturdaten wurden nicht gefunden.

Branchenentwicklung Deutschland, reale Bruttowertschöpfung 2024 gegen 2019 (Eurostat `nama_10_a64`, Kettenindex 2020; Verkettung macht die Branchenwerte nicht additiv, bei C23 Sprung 2022 → 2023, Vorsicht):
Chemie −8,1 %, Papier −15,1 %, Glas/Keramik −23,9 %, Metall −27,2 %; Verarbeitendes Gewerbe insg. 2025 −4,5 %; Gesamtwirtschaft 2025 +1,2 %. Quelle: `data/p1_10_branchen_beschaeftigung_bws_de.csv`.

### 2.7 Die Gegenrechnung „Investition gegen Verlust“

Was R21 tut (Zusammenfassung S. 3, Kap. 3 S. 12): Die Bruttosumme der Investitionen wird als „Entzug von Wertschöpfung“ behandelt; die Aufbauten seien „nicht zu neuen oder besseren Produkten“ führend. Zwei Prüffragen:

1. **Was steht in den Zahlen?** Investitionen sind Teil des BIP (Bruttoanlageinvestitionen 915 Mrd. € im Jahr 2025) und erzeugen Nachfrage, Einkommen und einen Kapitalstock. Sie sind kein Abfluss aus der Wertschöpfung
   in dem Sinne, dass Geld verschwände; ob sie Wertschöpfung **verdrängen** (weniger Konsum oder andere Investitionen) oder **zusätzlich auslösen**, ist eine Frage der Finanzierung und der Auslastung. Die KfW/Prognos-Studie sagt ausdrücklich, ihre Bottom-up-Modelle „ermöglichen jedoch keine Aussagen zu den Auswirkungen … auf gesamtwirtschaftliche Kenngrößen (z. B. BIP, Beschäftigung)“, die Berechnung sei „nicht Teil des Aufgabenspektrums“. Auch die R21-Rechnung ist also keine Wirkungsrechnung.
2. **Was sagt die Literatur?** Gefunden wurden nur Suchtreffer (alle **C**, `primaer_gelesen: false`):

| Studie | Auftraggeber/Geldgeber | Aussage laut Treffer | Richtung |
|---|---|---|---|
| BMWK-Schlaglicht 04/2025 zu GWS/Prognos-Modellanalyse | BMWK (Bundesregierung) | zusätzlicher Klimaschutz erhöht BIP um etwa 0,2 % pro Jahr 2020–2030; verweist auf Bundesbank-Studie zu Kapitalstockeffekten | positiv, klein |
| BMWK-Schlaglicht 04/2024 | BMWK | Beschäftigung 2030 insgesamt positiv; Bau und Unternehmensdienstleister gewinnen, Bergbau, Energieversorgung, Handel leicht rückläufig | gemischt |
| UBA/adelphi (2018/2019), gesamtwirtschaftliche Effekte | Umweltbundesamt | positive Wachstums- und Beschäftigungseffekte bis 2030 | positiv |
| Krebs (Universität Mannheim) | nicht ermittelt | Ausweitung öffentlicher Klima- und Sozialinvestitionen um rund 1 % des BIP, schuldenfinanziert; Wachstumsimpuls | positiv (Plädoyer) |
| Greenpeace „Jobmotor Klimaschutz“ (2021) | Greenpeace | Überblick: meist mehrere hunderttausend zusätzliche Arbeitsplätze | positiv (NGO) |

Studien mit negativer Richtung (Verdrängung, Kapitalstock-Entwertung, Produktivität) wurden mit den Suchen **nicht gefunden**; das heißt nicht, dass es sie nicht gibt. Der Suchtreffer-Text vermerkt ausdrücklich, dass keine
Verdrängungsschätzungen auftauchten. Das ist eine Lücke und ein Auftrag an die Gegenprüfung (Phase 2), die Bundesbank-Studie zum Kapitalstock, ifo/IfW/IW- und Ariadne-Papiere zu holen.

### 2.8 Beschäftigung und Wertschöpfung nach Branche

Eurostat `nama_10_a64_e` (Erwerbstätige im Inland, in Tausend), Deutschland, Stand 20.11.2026:

| Branche | 2005 | 2010 | 2015 | 2019 | 2022 | 2024 | 2025 | 2025 (bzw. 2024) vs. 2019 |
|---|---|---|---|---|---|---|---|---|
| Bergbau (B) | 87 | 71 | 59 | 46 | 42 | 39 | 38 | −17 % |
| Verarbeitendes Gewerbe (C) | 7.244 | 7.142 | 7.512 | 7.773 | 7.486 | 7.415 | 7.262 | −6,6 % |
| Chemie (C20) | 332 | 329 | 348 | 352 | 370 | 363 | – | +3,1 % (2024) |
| Metall (C24) | 265 | 259 | 268 | 271 | 249 | 245 | – | −9,6 % (2024) |
| Papier (C17) | 158 | 146 | 145 | 147 | 135 | 129 | – | −12,2 % (2024) |
| Glas/Keramik (C23) | 249 | 241 | 245 | 248 | 241 | 230 | – | −7,3 % (2024) |
| Kfz (C29) | 852 | 781 | 872 | 916 | 858 | 858 | – | −6,3 % (2024) |
| Energieversorgung (D) | 248 | 249 | 251 | 262 | 276 | 303 | 315 | +20,2 % |
| Alle Branchen | 39.322 | 41.099 | 43.137 | 45.291 | 45.622 | 45.960 | 45.878 | +1,3 % |

Befund: Im Verarbeitenden Gewerbe sind seit 2019 rund 510.000 Erwerbstätige weniger (7.773 → 7.262), die Energieversorgung (einschließlich Netz und Betrieb von Anlagen, aber auch fossile Versorger) hat rund 53.000 mehr (+20 %). Die Chemie hat trotz −18 % Produktion kaum Stellen abgebaut (Beschäftigung hängt träge; Auslastung statt Abbau, vermutlich, nicht belegt).
Bergbau (inkl. Braun- und Steinkohle) ist von 87.000 (2005) auf 38.000 (2025) gesunken.

Erneuerbare nach UBA-Indikator (Quelle GreenTech Atlas 2025, Destatis/BA-Daten, direkte Beschäftigung, selbst gelesen): 2023 rund 276.000 Beschäftigte, 2010–2023 +2,3 %; der Wert fasst Solar, Wind, Bio, Wasser, Geothermie, Speicher, intelligente Netze und Elektrifizierung. Rückgang in den 2010er Jahren durch Einbruch der inländischen Solarproduktion, „zum größten Teil in andere Länder abgewandert, vor allem nach China“, bei Wind durch Exporteinbußen und Zubaueinbruch. **Konfidenz B**.

**Fallbeispiel Solarindustrie** (nur Suchtreffer, **C**): Höchststand der Beschäftigung 2011 je nach Abgrenzung 110.900 (zitierte Zahl), über 125.000 (DIW), über 150.000 (IG Metall); 2012 87.800 (erste Zahl);
Insolvenzen Q-Cells (April 2012), Solon, Solar Millennium, Conergy (Juli 2013); SolarWorld verlor 2011–2013 1,1 Mrd. €, Umsatz −fast zwei Drittel. Ursache nach den Treffern: chinesische Module und Kürzung der Förderung. Aussagekräftig für R21 („Investitionsgüter müssen importiert werden“): Die Zahl stützt
den Befund, aber die Primärstudien (DIW, BSW-Solar) wurden nicht gelesen.

### 2.9 „Als einziges Industrieland …“ gegen die Daten

Bruttostromerzeugung (Eurostat `nrg_bal_peh`, TWh), Auszug aus `data/p1_10_stromerzeugung_brutto_gwh.csv`:

| Land, Größe | 2005 | 2010 | 2019 | 2024 |
|---|---|---|---|---|
| DE gesamt | 623 | 633 | 607 | 514 |
| DE fossil | 387 | 379 | 284 | 215 |
| DE Kernenergie | 163 | 141 | 75 | 0 |
| DE Erneuerbare | 63 | 105 | 240 | 289 |
| ES fossil | 185 | 138 | 112 | 66 |
| ES Erneuerbare | 42 | 98 | 101 | 161 |
| ES Kernenergie | 58 | 62 | 58 | 55 |
| IT fossil | 247 | 221 | 175 | 134 |
| IT Erneuerbare | 48 | 77 | 116 | 134 |
| DK fossil | 26 | 26 | 6 | 4 |
| DK Erneuerbare | 10 | 12 | 23 | 31 |
| FR Kernenergie | 452 | 429 | 399 | 381 |
| PL fossil | 151 | 146 | 138 | 119 |
| EU27 Kernenergie | 916 | 855 | 765 | 650 |
| EU27 Erneuerbare | 444 | 653 | 979 | 1.333 |
| EU27 gesamt | 2.927 | 2.984 | 2.908 | 2.829 |

Außerhalb der EU nur Anteile (Weltbank, Strom aus fossilen Quellen bzw. Kernenergie, % der Erzeugung; 2005 / 2015 / 2024):

| Land | fossil | Kernenergie |
|---|---|---|
| Deutschland | 61,6 / 54,4 / 40,9 | 26,2 / 14,2 / ≈0 (Eurostat: 0 in 2024) |
| Großbritannien | 73,9 / 52,9 / 32,0 | 20,5 / 20,8 / 14,2 |
| USA | 71,7 / 66,8 / 58,3 | 18,9 / 19,2 / 17,7 |
| Japan | 61,1 / 82,1 / 63,2 | 27,5 / 0,9 / 9,2 |
| Südkorea | 60,6 / 66,0 / 59,7 | 37,9 / 30,1 / 28,9 |
| China | 81,7 / 72,8 / 61,6 (2024) | 2,1 / 2,9 / 4,4 (2024) |

Lesart: (a) Der Ersatz fossiler Erzeugung durch Erneuerbare ist in Großbritannien, Dänemark, Spanien, Italien, Polen und selbst den USA zu beobachten; Dänemark (fossil 71 % → 8 %) und
Großbritannien (74 % → 32 %) liegen weiter als Deutschland (62 % → 41 %). (b) Der **gleichzeitige** Wegfall der Kernenergie (26 % → 0) ist in diesem Ausmaß deutsch; Japan (Fukushima 2011), Belgien und die UK haben teilweise reduziert (Belgien nicht geprüft). (c) „Zusätzlich statt als Ersatz“ lässt sich für China (Gesamterzeugung wächst stark) und
USA/Südkorea nachvollziehen, die dort stärker steigende Nachfrage erfüllen. (d) Die deutsche Gesamterzeugung sank von 623 auf 514 TWh; damit wird
der Ersatzcharakter zum Teil durch Nachfragerückgang und Import erklärt (Stromhandelssaldo nicht in diesem Dossier).
**Urteil:** „einziges Industrieland“ stimmt nicht, „vollständiger Kernenergieausstieg bei gleichzeitigem Kohleabbau in einer großen Volkswirtschaft“ trifft den belastbaren Teil.
Der Weltbank-Wert für Deutschland 2024 (40,9 %) ist mit dem Eurostat-Wert (215/514 = 41,8 %) vergleichbar. Die Weltbank-Reihen zu Gesamtverbrauch pro Kopf enden 2019/20 und wurden deshalb nicht in absolute Mengen umgerechnet.

## 3. Gegenpositionen

| Kernaussage dieses Dossiers | Stärkste Gegenposition | Stand |
|---|---|---|
| Industrieproduktion fiel nicht nur wegen Energiepreisen | KfW selbst: Energiepreisschock ist der zentrale Auslöser für energieintensive Zweige, Abwanderung teils dauerhaft; Destatis führt den Verbrauchsrückgang 2025 auf hohe Preise zurück | belegt, aber ohne Zahl |
| EU-weiter Rückgang spricht gegen deutsche Sonderursache | Der Abstand DE–EU beim Verarbeitenden Gewerbe (−11,3 % gegen +2,7 %) ist groß; EU-Mittel enthält Sondereffekte | nicht geprüft |
| Kein Einbruch der Direktinvestitionen | Weltbank-Zuflüsse sind Bestandsveränderungen und Sondereffekte; Abwanderung zeigt sich eher in unterlassener Inlandsinvestition (reale Investitionen −6,4 % seit 2019) | belegt |
| Preisanstieg v. a. Beschaffung | Netzentgelte stiegen um 3,9 ct (Haushalt) und bleiben Folge des Ausbaus; EEG-Kosten sind nur verlagert | belegt |
| „Als einziges Industrieland“ ist falsch | Deutschland ist das einzige große Industrieland mit vollständigem Kernenergieausstieg und gleichzeitiger industrieller Schwäche; Japan zeigt ähnliche Wachstumsschwäche (+2,1 % real 2019–2025) bei Kernenergie-Rückbau | Lesart der Daten |

## 4. Lücken

1. **Anteil der Energiepreise am Produktionsrückgang:** keine ökonometrische Schätzung gelesen (ifo Schnelldienst 6/2024, Bundesbank Monatsbericht 12/2022, Sachverständigenrat 2022, IfW, DIW nicht erreichbar).
2. **Merit-Order-Effekt der Erneuerbaren in €/MWh für Deutschland 2021–2026** und Aufteilung des Börsenpreises in Gas- und CO₂-Anteil: nicht gefunden.
3. **CO₂-Preis und Zerlegung der Strompreissteigerung nach Ursache** (Gas, CO₂, Netz, EEG): nur Eurostat-Komponenten, keine Ursachenzerlegung; Monitoringbericht der Bundesnetzagentur und BDEW-Strompreisanalyse nicht gelesen.
4. **EEG-Bundeszuschuss je Jahr:** nur Treffer; Netztransparenz-Daten fehlen.
5. **Preise USA und China:** keine Primärquelle; BNEF/IEA nur aus Suchtreffern.
6. **Makroökonomische Wirkung der Klimainvestitionen (positiv wie negativ):** die Primärstudien (Bundesbank-Kapitalstock, GWS/Prognos, Ariadne, IW, DIW, ifo) nicht gelesen; Verdrängungseffekte nicht gefunden.
7. **Energiekostenanteil je Branche:** aktuelle Destatis-Kostenstruktur nicht gefunden.
8. **Beschäftigung nach Technologie** (Wind, PV, Netze) und fossile Branchen im Detail: nur Eurostat-Aggregate und UBA-Gesamtzahl; Solar-Zeitreihe nur aus Treffern.
9. **Direktinvestitionen nach Branchen:** nur Gesamtzufluss und -abfluss (Weltbank, Zahlungsbilanz).
10. **Stromhandelssaldo Deutschland** (erklärt Rückgang der Eigenerzeugung): nicht abgerufen.
11. **Belgien, Taiwan, Schweden** für Atomausstiegs-Vergleich nicht geprüft; Absolutmengen für UK, USA, Japan, Südkorea nicht ermittelt (Ember-Datei gesperrt).
12. Nicht geprüft, ob das Eurostat-EU27-Aggregat der Industrieproduktion durch Irland (Pharma) verzerrt ist.

## 5. Nicht erreichbar

| Host | Gewünschtes Dokument | Wirkung |
|---|---|---|
| files.ember-energy.org | `release_generation_yearly_global.csv` (Ember Jahresdaten Strom, alle Länder) | Absolutmengen für UK/USA/JP/KR fehlen; Ersatz über Weltbank-Anteile |
| www.bundesbank.de / bundesbank.de | Monatsbericht Dezember 2022, S. 29 (Energiekosten und Produktionspotenzial); Kapitalstock-Studie | Anteil der Energiepreise am Rückgang bleibt offen |
| www.sachverstaendigenrat-wirtschaft.de | Jahresgutachten 2022, Kap. 5; spätere Gutachten | desgleichen |
| www.ifo.de | Schnelldienst 6/2024 (Schaller/Schasching), Deindustrialisierung 3/2023 | desgleichen |
| www.iwkoeln.de | Bardt/Schmitz 2023, Küper/Obst 2023, Kostenstruktur | Energiekostenanteil je Branche |
| www.diw.de, www.ifw-kiel.de | Studien zu Wachstum, Beschäftigung, Solarindustrie | Gegenrechnung |
| www.bundeswirtschaftsministerium.de | Schlaglichter 04/2024, 04/2025, EE-Beschäftigung | nur über Suchtreffer |
| www.netztransparenz.de | EEG-Konto je Jahr | Bundeszuschuss nur über Treffer |
| www.bdew.de | Strompreisanalyse | Industriestrompreise im Detail |
| about.bnef.com, www.iea.org, aegis.acer.europa.eu | USA/China-Strompreise | nur Suchtreffer |

Nicht versucht (Zeit): Bundesnetzagentur Monitoringbericht, SMARD-Großhandelspreise, Destatis-Genesis (Kostenstruktur), AGEB-Auswertungstabellen, Eurostat-Handelsbilanz Strom.

## 6. Quellenliste

Selbst gelesen (Rohdateien unter `quellen/raw/P1-10/`, Prüfsummen im Manifest):

- Eurostat: `nama_10_gdp` (BIP, Investitionen), `sts_inpr_a` (Industrieproduktion), `nrg_pc_202/203/204/205` (Energiepreise), `nrg_pc_204_c`, `nrg_pc_205_c` (Preiskomponenten), `nama_10_a64`, `nama_10_a64_e` (Wertschöpfung, Erwerbstätige), `nrg_bal_peh` (Stromerzeugung). Abruf 22.11.2026. Lizenz: CC BY 4.0.
- Weltbank, World Development Indicators (BX.KLT.DINV.CD.WD, BX.KLT.DINV.WD.GD.ZS, BM.KLT.DINV.CD.WD, NY.GDP.MKTP.KD, NV.IND.MANF.ZS, EG.ELC.FOSL.ZS, EG.ELC.NUCL.ZS, EG.ELC.RNEW.ZS, EG.USE.COMM.FO.ZS, EG.USE.ELEC.KH.PC, SP.POP.TOTL), Stand 11.11.2026. Lizenz: CC BY 4.0.
- Destatis, Insolvenzen nach Jahren (lrins01), Stand 13.03.2026; Pressemitteilung Nr. 400 vom 16.11.2026 „Energieverbrauch der Industrie 2025 um 2,9 % gesunken“.
- KfW Research (Scheuermeyer), „Ein Energiepreisschock mit hartnäckigen Folgen“, Kap. 3 des Industriepapiers, November 2025. Auftraggeber/Herausgeber: KfW (Förderbank, Bundesbeteiligung).
- KfW/Prognos (Kreidelmeyer et al.), „Investitionen für Klimaschutz“, Endbericht, Juni 2026, im Auftrag der KfW.
- Umweltbundesamt, Indikator „Beschäftigte im Bereich Erneuerbare Energien“ (GreenTech Atlas 2025), aktualisiert 25.06.2025.
- R21-Erklärung 2026 und Bundestags-WD (Dossier 00).

Nur über Suchtreffer-Zusammenfassungen gesehen (`primaer_gelesen: false`): IHK Lippe-Detmold (EEG-Konto), pv magazine (EEG), BloombergNEF, IEA „Electricity 2026“, Bundesnetzagentur (über Pressebericht), IW Köln, ifo, BMWK-Schlaglichter, Krebs (Mannheim), Greenpeace, UBA/adelphi, Bundesbank, Tagesspiegel/IG Metall/DIW zur Solarindustrie, Statista zu Energiekostenanteilen.

```json
{
  "dossier": "10_wirtschaftslage",
  "stand": "2026-11-22",
  "parameters": [
    {"id": "de_bip_nominal_2025_mrd_eur", "value": 4529.7, "unit": "Mrd. EUR", "source": "eurostat_nama_10_gdp", "fundstelle": "B1GQ, CP_MEUR, 2025", "confidence": "B", "primaer_gelesen": true, "note": "Nominal, laufende Preise; Eurostat-Stand 11.11.2026"},
    {"id": "de_bip_real_2025_vs_2019_pct", "min": 0.3, "mid": 0.8, "max": 0.8, "unit": "%", "source": "eurostat_nama_10_gdp", "fundstelle": "B1GQ, CLV20_MEUR; Weltbank NY.GDP.MKTP.KD", "confidence": "B", "primaer_gelesen": true, "note": "mid und max Eurostat (+0,8), min Weltbank (+0,3); Eurostat weist 2023 und 2024 identisch aus"},
    {"id": "de_investitionen_nominal_2025_mrd_eur", "value": 915.1, "unit": "Mrd. EUR", "source": "eurostat_nama_10_gdp", "fundstelle": "P51G, CP_MEUR, 2025", "confidence": "B", "primaer_gelesen": true, "note": "Bruttoanlageinvestitionen"},
    {"id": "de_investitionsquote_2025_pct", "value": 20.2, "unit": "% des BIP", "source": "eurostat_nama_10_gdp", "fundstelle": "P51G, PC_GDP, 2025 (2019: 21,0)", "confidence": "B", "primaer_gelesen": true, "note": "EU27 2025: 21,5"},
    {"id": "de_investitionen_real_2025_vs_2019_pct", "value": -6.4, "unit": "%", "source": "eurostat_nama_10_gdp", "fundstelle": "P51G, CLV20_MEUR", "confidence": "B", "primaer_gelesen": true, "note": "EU27 +5,0 %; Berechnung aus Kettenindex"},
    {"id": "r21_kosten_in_bip_vielfachen", "min": 2.2, "mid": 2.6, "max": 3.0, "unit": "x BIP 2025", "source": "r21_erklaerung_2026", "fundstelle": "S. 12; eigene Rechnung mit BIP 2025", "confidence": "B", "primaer_gelesen": true, "note": "Setzung (M): 10 und 13,8 Bio. EUR geteilt durch 4,53 Bio. EUR"},
    {"id": "kfw_klimainvest_brutto_pro_jahr_mrd_eur", "min": 270, "mid": 285, "max": 300, "unit": "Mrd. EUR/Jahr", "source": "kfw_prognos_investitionen_2026", "fundstelle": "Zusammenfassung", "confidence": "B", "primaer_gelesen": true, "note": "Brutto, 2025-2045, 5,7-6,4 Bio. EUR gesamt; Auftraggeber KfW"},
    {"id": "kfw_klimainvest_mehrbedarf_pro_jahr_mrd_eur", "min": 135, "mid": 144, "max": 153, "unit": "Mrd. EUR/Jahr", "source": "kfw_prognos_investitionen_2026", "fundstelle": "Zusammenfassung", "confidence": "B", "primaer_gelesen": true, "note": "Nur durch Klimaschutz ausgelöster Mehrbedarf; Studie macht keine Aussage zu BIP und Beschäftigung"},
    {"id": "de_industrieproduktion_bd_2025_vs_2019_pct", "value": -12.2, "unit": "%", "source": "eurostat_sts_inpr_a", "fundstelle": "B-D, I21, CA", "confidence": "B", "primaer_gelesen": true, "note": "vs. 2018: -15,0 %; EU27 +1,5 %"},
    {"id": "de_produktion_chemie_2025_vs_2019_pct", "value": -17.9, "unit": "%", "source": "eurostat_sts_inpr_a", "fundstelle": "C20", "confidence": "B", "primaer_gelesen": true, "note": "vs. 2018 -20,4 %; EU27 -16,0 %"},
    {"id": "de_produktion_glas_keramik_2025_vs_2019_pct", "value": -20.0, "unit": "%", "source": "eurostat_sts_inpr_a", "fundstelle": "C23", "confidence": "B", "primaer_gelesen": true, "note": "EU27 -10,8 %"},
    {"id": "de_produktion_metall_2025_vs_2019_pct", "value": -15.6, "unit": "%", "source": "eurostat_sts_inpr_a", "fundstelle": "C24", "confidence": "B", "primaer_gelesen": true, "note": "EU27 -12,2 %"},
    {"id": "de_produktion_papier_2025_vs_2019_pct", "value": -18.2, "unit": "%", "source": "eurostat_sts_inpr_a", "fundstelle": "C17", "confidence": "B", "primaer_gelesen": true, "note": "EU27 -6,5 %"},
    {"id": "de_energieintensive_produktion_niveau_pct_vorkrise", "value": 80, "unit": "% des Vorkrisenniveaus", "source": "kfw_energiepreisschock_2025", "fundstelle": "Kap. 3, S. 3", "confidence": "B", "primaer_gelesen": true, "note": "Seit gut zwei Jahren seitwaerts"},
    {"id": "de_insolvenzen_unternehmen_2025", "value": 24064, "unit": "Fälle", "source": "destatis_lrins01", "fundstelle": "Tabelle Insolvenzen nach Jahren, Stand 13.03.2026", "confidence": "B", "primaer_gelesen": true, "note": "2021: 13.993; 2010: 31.998; 2003: 39.320"},
    {"id": "de_industriestrom_id_2026s1_ct_kwh", "value": 17.42, "unit": "ct/kWh", "source": "eurostat_nrg_pc_205", "fundstelle": "Band 2.000-19.999 MWh, X_VAT, 2026-S1", "confidence": "A", "primaer_gelesen": true, "note": "EU27 15,59; FR 12,39; PL 18,12; IT 19,91; 2019-S1 DE 13,10 / EU27 10,45"},
    {"id": "de_haushaltsstrom_2026s1_ct_kwh", "value": 36.18, "unit": "ct/kWh", "source": "eurostat_nrg_pc_204", "fundstelle": "Band 2.500-4.999 kWh, alle Steuern, 2026-S1", "confidence": "A", "primaer_gelesen": true, "note": "EU27 28,32; 2025-S2 DE 38,69; Jahresmittel 2025 aus Komponenten 38,5"},
    {"id": "de_industriegas_i3_2026s1_ct_kwh", "value": 6.82, "unit": "ct/kWh", "source": "eurostat_nrg_pc_203", "fundstelle": "Band 10.000-99.999 GJ, X_VAT, 2026-S1", "confidence": "A", "primaer_gelesen": true, "note": "EU27 6,16"},
    {"id": "de_strompreis_haushalt_beschaffung_2019_2023_2025_ct", "min": 5.81, "mid": 19.92, "max": 14.81, "unit": "ct/kWh (2019 / 2023 / 2025)", "source": "eurostat_nrg_pc_204_c", "fundstelle": "NRG_SUP", "confidence": "A", "primaer_gelesen": true, "note": "Reihenfolge min/mid/max steht fuer 2019/2023/2025, nicht fuer eine Bandbreite"},
    {"id": "de_strompreis_haushalt_netz_2019_2025_ct", "min": 7.40, "max": 11.30, "unit": "ct/kWh (2019 / 2025)", "source": "eurostat_nrg_pc_204_c", "fundstelle": "NETC", "confidence": "A", "primaer_gelesen": true, "note": "Nur Netzentgelt, ohne Steuern"},
    {"id": "de_strompreis_haushalt_eeg_position_2021_2025_ct", "min": 6.75, "max": 0.28, "unit": "ct/kWh (2021 / 2025)", "source": "eurostat_nrg_pc_204_c", "fundstelle": "TAX_RNW", "confidence": "A", "primaer_gelesen": true, "note": "EEG-Umlage entfiel Juli 2022; Kosten im Bundeshaushalt"},
    {"id": "eeg_bundeszuschuss_2025_mrd_eur", "value": 16.5, "unit": "Mrd. EUR", "source": "ihk_lippe_eeg_konto", "fundstelle": "Suchtreffer", "confidence": "C", "primaer_gelesen": false, "note": "2026 Haushalt 17,2; Netzbetreiber-Prognose 12,4; 2024 Ausgaben Konto 21,985"},
    {"id": "gas_ttf_2022_eur_mwh", "value": 124, "unit": "EUR/MWh", "source": "kfw_energiepreisschock_2025", "fundstelle": "Kap. 3, S. 1", "confidence": "B", "primaer_gelesen": true, "note": "Mittel 2010-2019: 23; 1. Hj. 2025: 41; Nordamerika 1. Hj. 2025: 11,5"},
    {"id": "de_industrie_energieverbrauch_2025_pj", "value": 3248, "unit": "PJ", "source": "destatis_pm_400_2026", "fundstelle": "Pressemitteilung Nr. 400", "confidence": "B", "primaer_gelesen": true, "note": "-2,9 % ggü. 2024; energieintensive Zweige 82,0 %"},
    {"id": "de_beschaeftigte_verarbeitendes_gewerbe_2025_vs_2019_pct", "value": -6.6, "unit": "%", "source": "eurostat_nama_10_a64_e", "fundstelle": "C, EMP_DC", "confidence": "B", "primaer_gelesen": true, "note": "7.773 auf 7.262 Tsd."},
    {"id": "de_beschaeftigte_energieversorgung_2025_vs_2019_pct", "value": 20.2, "unit": "%", "source": "eurostat_nama_10_a64_e", "fundstelle": "D, EMP_DC", "confidence": "B", "primaer_gelesen": true, "note": "262 auf 315 Tsd.; enthaelt fossile Versorger"},
    {"id": "de_beschaeftigte_erneuerbare_2023", "value": 276000, "unit": "Personen", "source": "uba_indikator_beschaeftigte_ee", "fundstelle": "Die wichtigsten Fakten", "confidence": "B", "primaer_gelesen": true, "note": "direkte Beschaeftigung inkl. Speicher/Netze; +2,3 % ggue. 2010"},
    {"id": "de_stromerzeugung_kernenergie_2005_2024_twh", "min": 163.1, "max": 0.0, "unit": "TWh (2005 / 2024)", "source": "eurostat_nrg_bal_peh", "fundstelle": "GEP, N900H", "confidence": "B", "primaer_gelesen": true, "note": "Gesamterzeugung 623 auf 514 TWh"},
    {"id": "es_fossile_erzeugung_2005_2024_twh", "min": 184.6, "max": 65.7, "unit": "TWh (2005 / 2024)", "source": "eurostat_nrg_bal_peh", "fundstelle": "GEP, FE", "confidence": "B", "primaer_gelesen": true, "note": "Spanien; Erneuerbare 42,3 auf 161,0 TWh"},
    {"id": "de_fdi_zufluss_mittel_2021_25_mrd_usd", "value": 91, "unit": "Mrd. USD/Jahr", "source": "worldbank_wdi", "fundstelle": "BX.KLT.DINV.CD.WD", "confidence": "B", "primaer_gelesen": true, "note": "Mittel 2015-19: 93; Abfluesse 154 auf 137"}
  ],
  "sources": {
    "eurostat_nama_10_gdp": {"titel": "Gross domestic product and main components (nama_10_gdp)", "herausgeber": "Eurostat", "datum": "2026-11-11", "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nama_10_gdp", "abruf": "2026-11-22"},
    "eurostat_sts_inpr_a": {"titel": "Production in industry, annual data (sts_inpr_a)", "herausgeber": "Eurostat", "datum": "2026-11-19", "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sts_inpr_a", "abruf": "2026-11-22"},
    "eurostat_nrg_pc_205": {"titel": "Electricity prices for non-household consumers, bi-annual (nrg_pc_205)", "herausgeber": "Eurostat", "datum": "2026-10-19", "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_205", "abruf": "2026-11-22"},
    "eurostat_nrg_pc_204": {"titel": "Electricity prices for household consumers, bi-annual (nrg_pc_204)", "herausgeber": "Eurostat", "datum": "2026-10-19", "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_204", "abruf": "2026-11-22"},
    "eurostat_nrg_pc_203": {"titel": "Gas prices for non-household consumers, bi-annual (nrg_pc_203)", "herausgeber": "Eurostat", "datum": "2026-10-19", "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_203", "abruf": "2026-11-22"},
    "eurostat_nrg_pc_204_c": {"titel": "Electricity prices components for household consumers (nrg_pc_204_c)", "herausgeber": "Eurostat", "datum": "2026-10-19", "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_204_c", "abruf": "2026-11-22"},
    "eurostat_nama_10_a64_e": {"titel": "Employment by branch (nama_10_a64_e)", "herausgeber": "Eurostat", "datum": "2026-11-20", "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nama_10_a64_e", "abruf": "2026-11-22"},
    "eurostat_nrg_bal_peh": {"titel": "Production of electricity and heat by fuel (nrg_bal_peh)", "herausgeber": "Eurostat", "datum": "2026-06-02", "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_bal_peh", "abruf": "2026-11-22"},
    "worldbank_wdi": {"titel": "World Development Indicators (div. Indikatoren)", "herausgeber": "Weltbank", "datum": "2026-11-11", "url": "https://api.worldbank.org/v2/country/DEU/indicator/BX.KLT.DINV.CD.WD", "abruf": "2026-11-22"},
    "destatis_lrins01": {"titel": "Insolvenzen nach Jahren", "herausgeber": "Statistisches Bundesamt", "datum": "2026-03-13", "url": "https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Unternehmen/Gewerbemeldungen-Insolvenzen/Tabellen/lrins01.html", "abruf": "2026-11-22"},
    "destatis_pm_400_2026": {"titel": "Energieverbrauch der Industrie 2025 um 2,9 % gesunken (PM Nr. 400)", "herausgeber": "Statistisches Bundesamt", "datum": "2026-11-16", "url": "https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/11/PD26_400_435.html", "abruf": "2026-11-22"},
    "kfw_energiepreisschock_2025": {"titel": "Ein Energiepreisschock mit hartnäckigen Folgen (Kap. 3 Industriepapier)", "herausgeber": "KfW Research", "datum": "2025-11", "url": "https://www.kfw.de/PDF/Download-Center/Konzernthemen/Research/PDF-Industriepapier/Kapitel-3-Energiepreisschock-November-2025.pdf", "abruf": "2026-11-22"},
    "kfw_prognos_investitionen_2026": {"titel": "Investitionen für Klimaschutz. Endbericht (Prognos im Auftrag der KfW)", "herausgeber": "Prognos AG / KfW", "datum": "2026-06", "url": "https://www.kfw.de/PDF/Download-Center/Konzernthemen/Research/PDF-Dokumente-Studien-und-Materialien/Investitionen-für-Klimaschutz.pdf", "abruf": "2026-11-22"},
    "uba_indikator_beschaeftigte_ee": {"titel": "Indikator: Beschäftigte im Bereich Erneuerbare Energien", "herausgeber": "Umweltbundesamt", "datum": "2025-06-25", "url": "https://www.umweltbundesamt.de/daten/umweltindikatoren/indikator-beschaeftigte-im-bereich-erneuerbare", "abruf": "2026-11-22"},
    "r21_erklaerung_2026": {"titel": "Erklärung des Expertenrates Klima- und Energiepolitik", "herausgeber": "REPUBLIK21 e. V.", "datum": "2026-11", "url": "https://denkfabrik-r21.de/wp-content/uploads/2026/11/Erklaerung_Expertenrat_R21_November-2026.pdf", "abruf": "2026-11-22"},
    "ihk_lippe_eeg_konto": {"titel": "EEG-Konto 2025: 16,5 Milliarden Euro Bundeszuschuss (Suchtreffer, nicht gelesen)", "herausgeber": "IHK Lippe zu Detmold", "datum": "2026", "url": "https://www.ihk.de/lippe-detmold/hauptnavigation/beraten-und-informieren/energie/aktuelles/eeg-konto-4803792", "abruf": "2026-11-22"}
  }
}
```
