# Wohlstandsatlas — wie die Welt wirtschaftlich strukturiert ist

> Interaktive Weltkarte: BIP pro Kopf (Kaufkraft, real, nominal, zu regionalen Preisen), Haushaltskonsum, Nationaleinkommen, EU-Index, Ungleichheit (Gini) und Bevölkerungsdichte für 217 Länder und Gebiete, 6.051 Regionen in 60 Ländern und 674 Metropolregionen — auf vier Ebenen, die jeweils die ganze Welt abdecken.

- **Quelle:** https://datenwgknowledgekitchen.com/wohlstandsatlas.html
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Stand:** Länderwerte 2024 (Weltbank WDI, Ausgabe Oktober 2026; IWF WEO Oktober 2026 für fehlende oder veraltete Länder) · diese Fassung 2026-11
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, Wohlstandsatlas, https://datenwgknowledgekitchen.com/wohlstandsatlas.html — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwünscht.
- **Hinweis für Agenten:** Diese Markdown-Fassung enthält Methodik, Quellen und die wichtigsten Kennzahlen. Karte, Quadrat-Ansicht, Schwellen-Highlight und Gruppenvergleich gibt es nur in der HTML-Fassung. Die vollständige Tabelle aller Einheiten liegt als CSV vor (siehe unten).
- **Wichtige Einschränkung:** Regionalwerte sind Hochrechnungen (Anteil laut nationaler Statistik × Landeswert 2024), keine amtlichen Werte für 2024. Innerhalb eines Landes gelten außer in den USA und Deutschland dieselben Preise.

---

## Was die Seite zeigt

Jede Fläche auf der Karte ist eine Einheit: ein Land, ein Bundesland oder eine kleinere Region. Die Seite beantwortet zwei Fragen: Wo steht ein Ort im Vergleich zur ganzen Welt? Und wie viele Menschen leben über oder unter einer Schwelle?

**Ebenen**

| Ebene | Inhalt |
|---|---|
| Länder | 217 Länder und Gebiete |
| Bundesländer-Ebene | Bundesländer, US-Bundesstaaten, Provinzen, Kantone, NUTS-1/2 in Europa |
| Feinste Ebene | NUTS-3-Regionen und Kreise in Europa, ITL3 in Großbritannien, US-Counties, Präfekturen in China; sonst die feinste verfügbare Ebene |
| Metropolregionen | EU-Metropolregionen und US-Metropolregionen (MSA) samt ländlichem Rest; außerhalb davon wie die Bundesländer-Ebene |

Auf jeder Ebene summieren sich die Einheiten zu 8,12 Mrd. Menschen und 198,9 Bio. internationalen Dollar Wirtschaftsleistung.

**Kennzahlen**

| Kennzahl | Bedeutung |
|---|---|
| BIP/Kopf (KKP) | Wirtschaftsleistung pro Einwohner in internationalen Dollar (Kaufkraftparität, laufende Preise) |
| Haushalte/Kopf (KKP) | Konsumausgaben der privaten Haushalte pro Kopf; Regionen über das regionale verfügbare Einkommen verteilt |
| Regionale Kaufkraft | BIP/Kopf bereinigt um regionale Preisniveaus (USA: BEA Regional Price Parities, Deutschland: Kreise) |
| BIP/Kopf real | in konstanten internationalen Dollar von 2021 |
| BIP/Kopf nominal | in US-Dollar zu Marktwechselkursen |
| BNE/Kopf (KKP) | Bruttonationaleinkommen; Irland mit GNI* des CSO; nur Länderebene |
| EU-Index | BIP/Kopf (KKP) in Prozent des EU-27-Schnitts |
| BIP gesamt | Wirtschaftsleistung der Einheit in US-Dollar |
| Bevölkerungsdichte | Einwohner je km² Fläche der Einheit (Flächenbegriff je nach Quelle mit oder ohne Binnengewässer) |
| Ungleichheit (Gini) | Gini-Index der Einkommen, 0–100 (Weltbank über Gapminder, jüngster Wert bis 2024); nur Länderebene, dieselben Werte wie im [Länder-Indikatoren-Explorer](https://datenwgknowledgekitchen.com/laender-indikatoren-explorer.html) |

## Kennzahlen auf einen Blick

- Weltdurchschnitt BIP pro Kopf (KKP): **24.500 Int.$**
- Der mittlere Mensch (die Hälfte der Weltbevölkerung lebt darunter) auf Länderebene: **16.500 Int.$**, auf der feinsten Ebene: **15.200 Int.$**
- **68 %** der Weltbevölkerung leben in Regionen unter dem Weltdurchschnitt
- Höheres BIP pro Kopf als Berlin (79.900 Int.$) haben Regionen mit zusammen **357 Mio.** Menschen (4,4 % der Welt)

### Höchstes BIP pro Kopf (KKP), feinste Ebene

Nur Einheiten ab 50.000 Einwohnern. Die Spitzenwerte sind Arbeitsorte mit vielen Einpendlern oder Rohstoffförderung; die Ebene „Metropolregionen“ gleicht das aus.

| Rang | Region | Land | BIP/Kopf (Int.$) | Einwohner (Mio.) |
|---|---|---|---|---|
| 1 | Camden and City of London | Vereinigtes Königreich | 1.090.000 | 0,23 |
| 2 | Westminster | Vereinigtes Königreich | 712.000 | 0,22 |
| 3 | New York | Vereinigte Staaten | 606.000 | 1,66 |
| 4 | Autonomer Kreis der Jamal-Nenzen | Russland | 451.000 | 0,52 |
| 5 | Zug | Schweiz | 324.000 | 0,13 |
| 6 | San Francisco | Vereinigte Staaten | 324.000 | 0,83 |
| 7 | Basel-Stadt | Schweiz | 307.000 | 0,20 |
| 8 | San Mateo | Vereinigte Staaten | 292.000 | 0,74 |
| 9 | Wolfsburg | Deutschland | 270.000 | 0,13 |
| 10 | District of Columbia | Vereinigte Staaten | 265.000 | 0,70 |

### Niedrigstes BIP pro Kopf (KKP), feinste Ebene

| Rang | Region | Land | BIP/Kopf (Int.$) | Einwohner (Mio.) |
|---|---|---|---|---|
| 3728 | Liberia | Liberia | 1.870 | 5,61 |
| 3729 | Malawi | Malawi | 1.860 | 21,66 |
| 3730 | DR Kongo | DR Kongo | 1.820 | 109,28 |
| 3731 | Eritrea | Eritrea | 1.740 | 3,54 |
| 3732 | Mosambik | Mosambik | 1.710 | 34,63 |
| 3733 | Somalia | Somalia | 1.600 | 19,01 |
| 3734 | Jemen | Jemen | 1.600 | 18,26 |
| 3735 | Zentralafrikanische Republik | Zentralafrikanische Republik | 1.260 | 5,33 |
| 3736 | Burundi | Burundi | 1.190 | 14,05 |
| 3737 | Südsudan | Südsudan | 994 | 11,94 |

## Länder mit Regionaldaten

Alle anderen Länder werden als Ganzes gezeigt und sind auf der Karte schraffiert.

| Land | Bundesländer-Ebene | Feinste Ebene | Quelle | Jahr der Verteilung |
|---|---|---|---|---|
| Albanien | 12 × Region | wie Bundesländer-Ebene | Eurostat | 2022 |
| Australien | 9 × Bundesstaat | wie Bundesländer-Ebene | ABS | 2024 |
| Belgien | 11 × Provinz | 44 × Region (NUTS-3) | Eurostat | 2023 |
| Bolivien | 9 × Departamento | wie Bundesländer-Ebene | INE | 2023 |
| Brasilien | 27 × Bundesstaat | wie Bundesländer-Ebene | IBGE | 2023 |
| Bulgarien | 28 × Oblast | wie Bundesländer-Ebene | Eurostat | 2023 |
| Chile | 16 × Region | wie Bundesländer-Ebene | Banco Central de Chile | 2024 |
| China | 31 × Provinz | 369 × Präfektur / Stadt | städtische Statistikkommuniqués / NBS China | 2024 |
| Deutschland | 16 × Bundesland | 400 × Kreis | Eurostat | 2023 |
| Dänemark | 5 × Region | 11 × Region (NUTS-3) | Eurostat | 2023 |
| Ecuador | 24 × Provinz | wie Bundesländer-Ebene | BCE | 2023 |
| Estland | 5 × Region | wie Bundesländer-Ebene | Eurostat | 2023 |
| Finnland | 19 × Landschaft | wie Bundesländer-Ebene | Eurostat | 2023 |
| Frankreich | 14 × Region | 101 × Region (NUTS-3) | Eurostat | 2023 |
| Griechenland | 13 × Region | 52 × Region (NUTS-3) | Eurostat | 2023 |
| Indien | 36 × Bundesstaat | wie Bundesländer-Ebene | MOSPI | 2024 |
| Indonesien | 33 × Provinz | wie Bundesländer-Ebene | BPS | 2024 |
| Iran | 30 × Provinz | wie Bundesländer-Ebene | Statistical Centre of Iran | 2018 |
| Irland | 3 × Region | 8 × Region (NUTS-3) | Eurostat | 2023 |
| Italien | 21 × Region | 107 × Region (NUTS-3) | Eurostat | 2023 |
| Japan | 47 × Präfektur | wie Bundesländer-Ebene | Cabinet Office (Präfekturrechnung) | 2022 |
| Kanada | 13 × Provinz | wie Bundesländer-Ebene | Statistics Canada | 2025 |
| Kasachstan | 15 × Gebiet | wie Bundesländer-Ebene | BNS Kasachstan | 2024 |
| Kenia | 8 × Provinz | wie Bundesländer-Ebene | KNBS | 2024 |
| Kolumbien | 32 × Departamento | wie Bundesländer-Ebene | DANE | 2024 |
| Kroatien | 21 × Gespanschaft | wie Bundesländer-Ebene | Eurostat | 2023 |
| Lettland | 5 × Region | wie Bundesländer-Ebene | Eurostat | 2023 |
| Litauen | 10 × Region | wie Bundesländer-Ebene | Eurostat | 2023 |
| Malaysia | 16 × Bundesstaat | wie Bundesländer-Ebene | DOSM | 2024 |
| Malta | 2 × Region | wie Bundesländer-Ebene | Eurostat | 2023 |
| Mexiko | 32 × Bundesstaat | wie Bundesländer-Ebene | INEGI | 2024 |
| Niederlande | 12 × Provinz | 40 × Region (NUTS-3) | Eurostat | 2023 |
| Nordmazedonien | 8 × Region | wie Bundesländer-Ebene | Eurostat | 2023 |
| Norwegen | 17 × Provinz (Fylke) | wie Bundesländer-Ebene | SSB | 2023 |
| Peru | 25 × Region | wie Bundesländer-Ebene | INEI | 2024 |
| Philippinen | 83 × Provinz | wie Bundesländer-Ebene | PSA | 2024 |
| Polen | 17 × Woiwodschaft | 73 × Region (NUTS-3) | Eurostat | 2023 |
| Portugal | 9 × Region | 26 × Region (NUTS-3) | Eurostat | 2023 |
| Rumänien | 42 × Kreis (Județ) | wie Bundesländer-Ebene | Eurostat | 2023 |
| Russland | 83 × Föderationssubjekt | wie Bundesländer-Ebene | Rosstat | 2024 |
| Schweden | 21 × Provinz (Län) | wie Bundesländer-Ebene | Eurostat | 2023 |
| Schweiz | 26 × Kanton | wie Bundesländer-Ebene | BFS | 2024 |
| Serbien | 25 × Region | wie Bundesländer-Ebene | Eurostat | 2023 |
| Slowakei | 8 × Region (Kraj) | wie Bundesländer-Ebene | Eurostat | 2023 |
| Slowenien | 12 × Region | wie Bundesländer-Ebene | Eurostat | 2023 |
| Spanien | 19 × Autonome Gemeinschaft | 53 × Region (NUTS-3) | Eurostat | 2023 |
| Südafrika | 9 × Provinz | wie Bundesländer-Ebene | Stats SA | 2024 |
| Südkorea | 17 × Provinz | wie Bundesländer-Ebene | KOSTAT | 2024 |
| Tansania | 30 × Region | wie Bundesländer-Ebene | NBS Tansania | 2024 |
| Thailand | 77 × Provinz | wie Bundesländer-Ebene | NESDC | 2023 |
| Tschechien | 14 × Region (Kraj) | wie Bundesländer-Ebene | Eurostat | 2023 |
| Türkei | 81 × Provinz | wie Bundesländer-Ebene | Eurostat | 2023 |
| Ukraine | 25 × Oblast | wie Bundesländer-Ebene | Ukrstat | 2021 |
| Ungarn | 20 × Komitat | wie Bundesländer-Ebene | Eurostat | 2023 |
| Usbekistan | 14 × Provinz | wie Bundesländer-Ebene | Statistikagentur Usbekistan | 2024 |
| Vereinigte Staaten | 51 × Bundesstaat | 3135 × County | BEA / Census / BEA | 2024 |
| Vereinigtes Königreich | 12 × Region (ITL1) | 179 × Region (ITL3) | ONS | 2023 |
| Vietnam | 63 × Provinz | wie Bundesländer-Ebene | GSO | 2024 |
| Ägypten | 27 × Gouvernement | wie Bundesländer-Ebene | nationale Statistik | 2021 |
| Österreich | 9 × Bundesland | 35 × Region (NUTS-3) | Eurostat | 2023 |

## Methodik und Quellen

**Was du siehst.** Wirtschaftsleistung, Haushaltskonsum und Bevölkerungsdichte für 217 Länder und Gebiete und ihre Regionen. Länder ohne amtliche Regionaldaten sind schraffiert und werden als Ganzes gezeigt.

**Länderwerte.** Weltbank (World Development Indicators, Stand Oktober 2026, Jahr 2024). Wo die Weltbank nur alte Werte hat (Venezuela, Jemen, Südsudan) oder ein Gebiet fehlt (Taiwan, Puerto Rico), stammen die Werte vom Internationalen Währungsfonds (World Economic Outlook, Oktober 2026). Eritrea, Kuba und Nordkorea haben nur alte oder keine Werte.

**So werden Regionen berechnet.** Jede Region bekommt ihren Anteil am BIP und an der Bevölkerung ihres Landes laut nationaler Statistik und diesen Anteil an den Landeswerten 2024. So summieren sich Regionen genau zum Land, und jede Ebene deckt die ganze Welt ab. Wirtschaftsleistung ohne Region (US-Bundesaktivität im Ausland, Norwegens Förderung auf See) ist als eigene Einheit ohne Kartenfläche geführt. Die Jahre der Regionaldaten unterscheiden sich je Land (meist 2023–2025, Ukraine 2021, Iran 2018); sie bestimmen nur die Verteilung innerhalb des Landes.

**Regionale Quellen.** Europa: Eurostat (NUTS-3, meist 2023), Schweiz BFS, Norwegen SSB, Großbritannien ONS. USA: BEA und Census Bureau (Bundesstaaten und Counties 2024). Kanada: Statistics Canada. Mexiko: INEGI. Brasilien: IBGE. Russland: Rosstat. Japan: Cabinet Office. Südkorea: KOSTAT. China: NBS und städtische Statistikkommuniqués. Indien: MOSPI. Weitere Länder: die nationalen Statistikämter; Quelle und Jahr stehen bei jeder Region. Grenzen: Eurostat GISCO, US Census, Natural Earth.

**Kennzahlen.** KKP = Kaufkraftparität in internationalen Dollar (Int.$). „Haushalte/Kopf“: Länder = Konsumausgaben der privaten Haushalte (Weltbank); Regionen = Landeswert × regionales verfügbares Einkommen pro Kopf im Verhältnis zum Land (Eurostat, ONS, BEA, Statistics Canada, NBS, Cabinet Office, KOSTAT). „Regionale Kaufkraft“ nutzt regionale Preisindizes, wo es sie gibt (USA: BEA Regional Price Parities; Deutschland: Regionaler Preisindex 2022 von BBSR und IW für alle 400 Kreise); sonst gilt das Preisniveau des Landes. Haushaltswerte haben oft eine gröbere Auflösung als die Karte (in Deutschland NUTS-2, in vielen Ländern nur der Landeswert); die Profilkarte nennt jeweils die Region, für die der Wert gilt. BNE = Bruttonationaleinkommen (Weltbank; Irland: GNI* des CSO). EU-Index = BIP pro Kopf (KKP) im Verhältnis zum EU-27-Schnitt, eine Annäherung an die offizielle Einstufung. Gini = Einkommensungleichheit innerhalb eines Landes (Weltbank über Gapminder, jüngster Wert bis 2024), dieselben Werte wie im [Länder-Indikatoren-Explorer](https://datenwgknowledgekitchen.com/laender-indikatoren-explorer.html) der Knowledge Kitchen.

**Ränge und Ausreißer.** Statt Rängen zeigt die Profilkarte, welcher Anteil der Menschheit in Einheiten mit höherem Wert lebt, und wie stark das von der Ebene abhängt. Einheiten unter 50.000 Einwohnern bekommen keinen Ländervergleich: Einzelne Ölfelder oder Firmen verzerren dort alles. Regionen mit mehr als doppelt so hohem BIP pro Kopf wie ihr Land sind markiert (Pendler, Konzernsitze, Rohstoffe). Die Verteilungsgrafik kappt die obersten 0,5 % der Bevölkerung; gekappte Balken haben ein kleines Dreieck.

**Anteile an der Welt.** Bezugsgröße ist immer die gesamte Weltbevölkerung aller Länder (8,1 Mrd.); wer keine Daten hat, wird als „ohne Daten“ ausgewiesen. Regionale Verteilungen von 2021 oder früher (z. B. Ukraine 2021, Iran 2018) sind als „ältere Regionaldaten“ gekennzeichnet; die Ukraine-Werte stammen aus der Zeit vor dem russischen Angriff. Der Anteil „darunter“ hängt von der Ebene ab: Feinere Regionen zeigen die Unterschiede genauer.

**Umstrittene Gebiete** sind schraffiert markiert, mit dem Status im Tooltip. Die Krim hat keine Daten; die russischen Werte enthalten weder die Krim noch die 2022 besetzten Gebiete.

**Grenzen der Methode.** Preise innerhalb eines Landes gelten außer in den USA und Deutschland als gleich. Das BIP zählt am Arbeitsort, die Bevölkerung am Wohnort – Kernstädte wirken deshalb reicher als ihr Umland; die Ebene „Metropolregionen“ gleicht das aus, wo es sie gibt. Die Daten einiger Länder (China, Russland) gelten als weniger verlässlich.

## Daten zum Download

`wohlstandsatlas-einheiten.csv` — 7.236 Einheiten aller Ebenen, UTF-8, komma-getrennt: https://datenwgknowledgekitchen.com/wohlstandsatlas/wohlstandsatlas-einheiten.csv

| Spalte | Inhalt |
|---|---|
| id, name, kind | Kennung, deutscher Name, Art der Einheit |
| country, parent | ISO3-Code des Landes, übergeordnete Einheit |
| levels | Ebenen, auf denen die Einheit vorkommt (0 Länder, 1 Bundesländer, 2 feinste Ebene, 3 Metropolregionen), durch Semikolon getrennt |
| pop, area_km2, density | Einwohner, Fläche, Einwohner je km² |
| gdp_ppp, gdp_usd | BIP in internationalen Dollar (KKP) und in US-Dollar |
| gdp_pc_ppp, gdp_pc_ppp_real, gdp_pc_usd | BIP pro Kopf: KKP laufend, KKP real (2021), US-Dollar |
| hh_pc_ppp | Haushaltskonsum pro Kopf (KKP) |
| gdp_pc_rp, price_index | BIP pro Kopf zu regionalen Preisen, regionales Preisniveau (Land = 100) |
| gni_pc_ppp, eu_index, gini | BNE pro Kopf (KKP), EU-Index, Gini (nur Länder) |
| year, src, flag | Jahr und Quelle der regionalen Verteilung; flag: estimate = geschätzt, older = ältere Daten, missing = keine Daten |
