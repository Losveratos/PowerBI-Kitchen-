# Dossier 06 · Europäische Integration

Stand 22.11.2026 · Auftrag P1-06 · Rechercheur: Sonnet (Phase 1) · Regeln: `agents/REGELN.md`
Manifest: `quellen/manifest_P1-06_europa.json` · aufbereitete Daten: `data/europa_*.json` (Lizenz: `data/europa_LIZENZ.md`) · Skripte: `scripts/europa_*.py`

Lesehinweis zur Belegqualität: Zahlen aus Energy-Charts, Eurostat, NEP und Szenariorahmen habe ich selbst abgerufen und gelesen oder gerechnet (`primaer_gelesen: true`). Alles, was nur aus Websuche-Auszügen stammt (ACER, Kritik der Nachbarn, Wasserkraft-Speicher, ETS-Preise, Literatur zu Flauten), ist `primaer_gelesen: false` und höchstens Konfidenz C. ENTSO-E und ACER waren nicht abrufbar.

## 1. Kernaussagen

1. **Die Richtung hat sich 2023 gedreht.** Deutschland war bis 2022 Netto-Exporteur (kommerziell 2018: −54 TWh, 2022: −27 TWh), ist seit 2023 Netto-Importeur: +11,7 TWh (2023), +28,3 TWh (2024), +21,9 TWh (2025). Eurostat bestätigt die Richtung: +9,2 / +26,3 TWh für 2023/2024. Konfidenz A (zwei unabhängige Datensätze), primär gelesen.
2. **Die tatsächlich genutzte Spitze ist kleiner als das, was die Netzplanung künftig unterstellt.** Höchste stündliche Summe über alle Grenzen 2023–2025: 16–17 GW Import, 17,6–19,2 GW Export (kommerziell). Die Netzplanung rechnet für 2045 mit rund 50 GW NTC je Richtung auf dem Stand des NEP 2037/2045 (Tabelle 11) und mit 58–69 GW im Szenariorahmenentwurf zum NEP 2040/2045. Konfidenz B (Energy-Charts allein, aber mit Eurostat auf Jahresebene gegengeprüft), primär gelesen.
3. **Der Verbund hilft in Preisspitzen sehr deutlich.** 2024 lag der deutsche Day-Ahead-Preis in 129 Stunden über 200 €/MWh; in allen 129 war Deutschland Netto-Importeur, im Mittel mit 11,1 GW. 2025: 161 von 162 Stunden. Konfidenz B (eigene Rechnung auf Energy-Charts/SMARD-Daten), primär gelesen. Das ist ein Zusammenhang, kein Beweis, dass es ohne Import zu Abschaltungen gekommen wäre.
4. **Die Nachbarn haben nicht unabhängig Flaute.** Stündliche Wind-Kapazitätsfaktoren der Nachbarn korrelieren mit Deutschland (2023/2024): Niederlande 0,79/0,71, Tschechien 0,75/0,69, Belgien 0,73/0,67, Polen 0,71/0,66, Dänemark 0,70/0,69, Frankreich 0,57/0,56, aber Norwegen 0,31/0,35, Schweden 0,26/0,31, Österreich 0,26/0,30. Der leistungsgewichtete Nachbar-Aggregat korreliert mit 0,83/0,82. In den 10 % windschwächsten deutschen Stunden erreicht das Aggregat nur 0,12 (Mittel 0,25). Konfidenz B, primär gelesen, erste Abschätzung (Setzung M zu Kapazitäten, siehe Abschnitt 6).
5. **Die große Flexibilität liegt im Norden und Süden, aber der Flaschenhals ist die Leitung.** Norwegen hat rund 84–87 TWh Speicher, Schweden etwa 34 TWh (Websuche, C). Die Netzplanung unterstellt für 2045 aber nur 1,4 GW zwischen Norwegen und Deutschland und 0,6 GW zu Schweden (Tabelle 11). In fünf Tagen (120 h) sind das bei voller Auslastung 168 GWh aus Norwegen direkt, 72 GWh aus Schweden. Eigene Rechnung (Setzung M), Konfidenz B für die Leistungswerte.
6. **Frankreichs Atomstrom ist kein konstanter Puffer.** Eurostat: französische Bruttoerzeugung 2021 556 TWh, 2022 475 TWh, 2023 525 TWh, 2024 571 TWh; Frankreich war 2022 Netto-Importeur (+14,9 TWh), 2024 Netto-Exporteur (+90 TWh). Energy-Charts: Kernkraft Dez–Feb im Mittel 42,0 GW (2023) und 47,1 GW (2024) bei 63 GW installiert, Minimum 23,7 GW (2023/24). Konfidenz A für Jahreswerte, B für Winterwerte.
7. **Die Netzplanung erwartet dauerhaften Netto-Import.** NEP 2037/2045, 2. Entwurf: Nettoimport 25 TWh (A 2037), 2045: 42 / 73 / 91 TWh (A / B / C). Dazu Handelstransite von 54–72 TWh (2037) bis rund 95 TWh (2045). Konfidenz A (Primärquelle gelesen, Szenarien sind Modellergebnisse, keine Prognosen).
8. **Die Nachbarn sind nicht nur Freunde der Spitzen.** Schweden hat 2024 die Hansa PowerBridge (700 MW) ausgesetzt (laut Genehmigung des Szenariorahmens, Primärquelle gelesen, A); schwedische und norwegische Politiker haben im Dezember 2024 deutsche Preisspitzen kritisiert (Presse, C, nicht primär gelesen).
9. **Rahmen:** EU-Klimaziel 2040 −90 % netto, bis zu 5 Prozentpunkte aus internationalen Gutschriften ab 2036 (Parlament, Rat 5.3.2026, Suchtreffer, C); ETS 2 von 2027 auf 2028 verschoben (Suchtreffer, C); EUA Dez-2026 am 12.10.2026 bei rund 88 €/t (Suchtreffer, C).
10. **Nicht gefunden bzw. nicht belegt:** heutige NTC je Grenze, ACER-/ENTSO-E-Nutzen in Euro für Deutschland, Wasserstoff-Importkorridore. Siehe „Lücken".

## 2. Kuppelkapazitäten

### 2.1 Planwerte (primär gelesen)

| Größe | Wert | Quelle, Fundstelle | Konf. |
|---|---|---|---|
| NTC 2045 gesamt, DE → Nachbarn | 49,6 GW (Summe der 13 Zeilenwerte der Tabelle) | NEP 2037/2045 (V2025), 2. Entwurf, Kap. 2, Tabelle 11, S. 54 | B |
| NTC 2045 gesamt, Nachbarn → DE | 49,6 GW (Summe der Spaltenwerte) | ebd. | B |
| NTC 2040/2045, Pfade A und B | rund 58 GW Richtung DE, rund 59 GW aus DE | Szenariorahmenentwurf NEP 2040/2045 (2027), Kap. 6.3, S. 121 | A (Primärdokument gelesen) |
| NTC Pfad C | 65 / 66 GW (2040), 68 / 69 GW (2045) | ebd. | A |
| BMWE-Langfristszenarien O45-Strom | rund 92,4 GW | ebd. (Zitat) | B |
| EU-Mindestmarge 70 % | Seit 31.12.2025 verpflichtend, mindestens 70 % der austauschlimitierenden Kapazität für den Handel | ebd. Kap. 6.1, S. 116; Kap. 6.2: 70 % RAM je CNEC bei AC-Verbindungen, bis 100 % bei HGÜ | A |
| EU-Verbundziel 15 % bis 2030 | Anteil an installierter Erzeugungsleistung; in allen Szenarien unterschritten | ebd. Kap. 6.1 und 6.3 | A |

Tabelle 11, Aufschlüsselung (GW, NTC 2045; `*` enthält Kapazität über Offshore-Gebotszonen; DE → X / X → DE). Das Layout des PDF ist eine Matrix, die ich anhand der Spaltenköpfe gelesen habe. Lesefehler sind möglich, daher Konfidenz B.

| Nachbar | DE → X | X → DE |
|---|---|---|
| Österreich | 8,5 | 8,4 |
| Belgien | 3,0 | 3,0 |
| Schweiz | 7,5 | 5,5 |
| Tschechien | 3,0 | 3,0 |
| Dänemark Ost (DKE) | 1,8* | 2,6* |
| Dänemark West (DKW) | 5,5* | 5,5* |
| Estland | 0,7* | 2,0* |
| Frankreich | 4,8 | 4,8 |
| Großbritannien | 4,8* | 4,8* |
| Niederlande | 5,0 | 5,0 |
| Norwegen | 1,4 | 1,4 |
| Polen | 3,0 | 3,0 |
| Schweden | 0,6 | 0,6 |
| Summe | 49,6 | 49,6 |

Zusätzliche Projekte (Szenariorahmen 2027, Tabelle 27): 2. Interkonnektor Belgien 2.000 MW, DC Deutschland–Schweiz 2.000 MW, FR–DE 1.000 MW (nur C 2045), Eichstetten–Chamoson 1.500 MW (nur C 2045), Hansa PowerBridge I 700 MW (nur C), Hybride nach UK, Norwegen, Dänemark (TYSDAN, 2 GW), Baltikum. Kapazität der Hybriden hängt vom Konzept ab.

### 2.2 Heute

Eine Tabelle der heutigen NTC je Grenze habe ich aus den erreichbaren Quellen nicht gefunden (siehe Lücken). Als Untergrenze der tatsächlich genutzten Kapazität dienen die beobachteten Spitzen der Summe über alle Grenzen (Abschnitt 3.2). Die Sicht ist verzerrt, weil die Spitze der Summe kleiner ist als die Summe der Spitzen je Grenze.

Zur Vorsicht: Die NTC der Netzplanung sind „Modell-NTC" des NEP für 2045 und keine heutigen Betriebswerte. Der EU-Schwellenwert von 70 % gilt für Kapazität in der Flow-Based-Marktkopplung (Margin Available for Cross-Zonal Trade). Der Szenariorahmen sagt nicht, ob Deutschland die 70 % heute einhält.

## 3. Tatsächlicher Austausch

Quelle: Energy-Charts (Fraunhofer ISE, CC BY 4.0), Endpunkte `cbet` (kommerzieller Handel) und `cbpf` (physikalische Flüsse), 15-Minuten-Raster, Länder AT, BE, CH, CZ, DK, FR, LU, NL, NO, PL, SE. Großbritannien fehlt. Positive Werte = Import. Aufbereitung: `scripts/europa_flows.py` → `data/europa_fluesse_jahre.json`. Vorzeichen und Größenordnung gegen Eurostat und die bekannte Netto-Wende 2023 geprüft.

### 3.1 Jahresbilanz Deutschlands, TWh

| Jahr | Netto kommerziell (cbet) | Netto physisch (cbpf) | Eurostat Netto (Import − Export) |
|---|---|---|---|
| 2015 | – | −37,7 | – |
| 2016 | – | −41,8 | – |
| 2017 | – | −46,0 | – |
| 2018 | −54,2 | −48,0 | – |
| 2019 | −35,2 | −34,1 | −32,7 |
| 2020 | −18,5 | −19,8 | −19,0 |
| 2021 | −17,8 | −20,0 | −18,6 |
| 2022 | −26,8 | −27,8 | −27,3 |
| 2023 | +11,7 | +8,9 | +9,2 |
| 2024 | +28,3 | +25,1 | +26,3 |
| 2025 | +21,9 | +18,2 | – |

Konfidenz A für die Richtung, B für die genaue Höhe (drei Definitionen, vier bis fünf TWh Spannweite). Eurostat-Werte: `nrg_cb_e`, E7000, Abruf 22.11.2026 (Datenstand 22.10.2026). Brutto laut Eurostat 2024: Import 81,7 TWh, Export 55,4 TWh (in Energy-Charts je Grenze summiert: 66,6 / 38,3 TWh kommerziell). Der Unterschied ist die Abgrenzung (Eurostat inkl. Transit und GB; Energy-Charts ohne GB, Quarterhour-Saldo je Grenze). Wer „Bruttoimport" zitiert, muss die Quelle nennen.

### 3.2 Spitzenleistung, Summe aller Grenzen, Stundenmittel, GW

| Jahr | Max. Import kommerziell | Max. Export kommerziell | Max. Import physisch | Max. Export physisch |
|---|---|---|---|---|
| 2022 | 12,4 | 15,7 | 11,4 | 15,4 |
| 2023 | 17,1 | 19,2 | 16,9 | 18,9 |
| 2024 | 17,0 | 17,6 | 17,3 | 16,2 |
| 2025 | 16,2 | 18,0 | 16,7 | 17,3 |

Höchster Netto-Import 2024: 12.12.2024, 07:00 UTC, 17,0 GW (kommerziell). 25 Stunden 2024 lagen über 15 GW. Konfidenz B.

### 3.3 Nach Nachbar 2024 und 2025, kommerziell, TWh (positiv = Netto-Import nach DE)

| Nachbar | 2023 | 2024 | 2025 |
|---|---|---|---|
| Dänemark | +10,7 | +12,0 | +12,4 |
| Frankreich | +0,4 | +12,9 | +11,2 |
| Norwegen | +4,6 | +5,8 | +7,0 |
| Niederlande | +2,1 | +2,5 | +8,4 |
| Schweiz | +1,0 | +7,1 | +0,9 |
| Schweden | +2,9 | +2,6 | +2,4 |
| Belgien | −0,2 | +2,7 | +3,0 |
| Luxemburg | −3,6 | −3,5 | −3,5 |
| Polen | −0,5 | −3,5 | −3,4 |
| Tschechien | +0,1 | −2,8 | −4,2 |
| Österreich | −5,8 | −7,4 | −12,2 |

Deutschland importiert von Norden und Westen und exportiert nach Süden und Osten. Das stimmt mit dem NEP-Befund überein. Konfidenz A (NEP Kap. 3.1, S. 70, qualitativ identisch).

### 3.4 Preise bei Import und Export (Day-Ahead, stündlich)

Methode: `scripts/europa_preise.py`. Importpreis = mengengewichteter Nachbarpreis (DK → DK1, NO → NO2, SE → SE4, Setzung M). Exportpreis = mengengewichteter DE-LU-Preis. Alle Beträge in €/MWh.

| Größe | 2023 | 2024 | 2025 |
|---|---|---|---|
| Mittlerer DE-LU-Preis | 95,2 | 78,5 | 89,3 |
| Mengengewichteter Importpreis (Nachbarzone) | 92,8 | 69,1 | 82,8 |
| DE-Preis in denselben Importstunden | 106,3 | 90,5 | 103,5 |
| Mengengewichteter Exportpreis (DE-Preis) | 79,8 | 57,4 | 69,0 |
| Stunden mit Netto-Import / Netto-Export | 5.105 / 3.655 | 6.366 / 2.418 | 6.126 / 2.634 |
| DE-Preis in Netto-Importstunden | 107,5 | 91,5 | 106,3 |
| DE-Preis in Netto-Exportstunden | 78,0 | 44,4 | 49,7 |
| Stunden über 200 €/MWh (davon Netto-Import) | 112 (102) | 129 (129) | 162 (161) |
| Mittlerer Netto-Import in diesen Spitzen, GW | 5,5 | 11,1 | 10,0 |

Konfidenz B, primär gelesen (selbst gerechnet). Der Abstand Importpreis zu DE-Preis in denselben Stunden beträgt 2024 rund 21 €/MWh; bei 66,6 TWh Import ergäbe das als Größenordnung 1,4 Mrd. € (Setzung M, reine Rechnung auf Preisunterschiede). Das ist kein Nutzen im Sinne einer Kosten-Nutzen-Rechnung: Importe verändern den Preis, die Auswahl der Stunden ist nicht zufällig.

Export bringt 2024 im Mittel 57 €/MWh. Die deutschen Preise in Exportstunden sind niedrig (44 €/MWh), weil dort Überschuss herrscht. Zu Norwegen, Schweden und Dänemark liegen die Exportpreise noch tiefer (2024: NO2 12 €/MWh, SE4 18 €/MWh, DK1 21 €/MWh).

## 4. Gleichzeitigkeit von Wind

Methode: `scripts/europa_wind_korrelation.py`, Daten Energy-Charts `public_power` (Wind onshore + offshore) und `installed_power`, stündlich, 2023 und 2024 (8.757 und 8.784 gemeinsame Stunden). Kapazitätsfaktor = Erzeugung / installierte Jahresleistung (Setzung M: keine unterjährige Zubauanpassung; die Korrelation ist von diesem Skalierungsfaktor unabhängig).

### 4.1 Korrelation der Wind-Kapazitätsfaktoren mit Deutschland

| Land | r 2023 | r 2024 | Mittlerer CF der Nachbarn in den 10 % schwächsten DE-Windstunden (2023 / 2024) | Mittlerer CF gesamt (2023 / 2024) |
|---|---|---|---|---|
| Niederlande | 0,79 | 0,71 | 0,05 / 0,05 | 0,19 / 0,22 |
| Tschechien¹ | 0,75 | 0,69 | 0,09 / 0,08 | 0,24 / 0,21 |
| Belgien | 0,73 | 0,67 | 0,07 / 0,06 | 0,30 / 0,26 |
| Polen | 0,71 | 0,66 | 0,09 / 0,09 | 0,26 / 0,26 |
| Dänemark² | 0,70 | 0,69 | 0,10 / 0,11 | 0,29 / 0,41² |
| Frankreich | 0,57 | 0,56 | 0,11 / 0,10 | 0,24 / 0,22 |
| Schweiz¹ | 0,52 | 0,49 | 0,10 / 0,10 | – |
| Norwegen | 0,31 | 0,35 | 0,21 / 0,22 | 0,31 / 0,32 |
| Schweden | 0,26 | 0,31 | 0,17 / 0,19 | 0,23 / 0,26 |
| Österreich | 0,26 | 0,30 | 0,16 / 0,17 | 0,24 / 0,26 |
| **Nachbar-Aggregat³** | **0,83** | **0,82** | **0,12 / 0,12** | 0,25 / 0,26 |

¹ Installierte Windleistung in Energy-Charts sehr klein (CH 0,09–0,10 GW, CZ 0,34–0,37 GW), Werte mit Vorsicht. ² Energy-Charts weist für Dänemark 2024 nur 5,64 GW Wind aus (2023: 7,51 GW); der CF 2024 ist deshalb überschätzt. Die Korrelation ist davon unberührt. ³ FR, NL, DK, PL, AT, BE, CZ, NO, SE, gewichtet nach installierter Leistung (84–85 GW).

Zur Flaute: Deutschland hatte 2023 / 2024 in 2.380 / 2.481 Stunden einen Wind-CF unter 10 %. In 622 / 543 dieser Stunden lag auch das Nachbar-Aggregat unter 10 %, also rund ein Viertel bis ein Fünftel. Die längste zusammenhängende Phase mit DE unter 10 % und Nachbar-Aggregat unter 15 % dauerte 123 Stunden (2023) und 57 Stunden (2024). Konfidenz B. Es fehlen Solar und Last; eine „Dunkelflaute" im engeren Sinn (Wind + Solar) ist damit nicht abgebildet. Zwei Jahre sind keine Klimatologie.

### 4.2 Literatur (Suchtreffer, nicht primär gelesen, Konfidenz C)

- Schill/Kittel (DIW Berlin), „Quantifying the Dunkelflaute", arXiv 2410.00244: In einem Kupferplatten-Szenario mit uneingeschränktem Ausgleich über 33 Länder verkürzt sich die längste Flaute des Technologie-Portfolios um 65 %; die extremste speicherdimensionierende Flaute in Deutschland dauerte 109 Tage (Winter 1995/96).
- Mockert et al., arXiv 2212.04870: Dunkelflauten in Deutschland treten meist im Winter bei Hochdrucklagen (Blocking) auf.
- TU Delft, Studie zu elf Nord- und Ostseeanrainern: Flauten werden von großräumigen Hochdrucklagen und Bewölkung getrieben, also gemeinsam für mehrere Länder.

Die Befunde passen zu meiner Abschätzung: Gleiche Wetterlage, hohe Gleichzeitigkeit bei den direkten Nachbarn, wenig bei Norwegen, Schweden und den Alpen.

## 5. Erzeugungsmix und Reserven der Nachbarn

| Thema | Befund | Quelle, Konf., primär gelesen |
|---|---|---|
| Frankreich Brutto 2021–2024 | 556 / 475 / 525 / 571 TWh; Im- und Export 2022: 52,4 / 37,5 TWh, 2024: 15,1 / 105,1 TWh | Eurostat nrg_cb_e, A, ja |
| Frankreich Kernkraft | Installiert 63,0 GW; Erzeugung 2023 319 TWh, 2024 360 TWh (Energy-Charts); im Winter Dez–Feb Mittel 42,0 / 47,1 GW, Minimum 23,7 / 31,8 GW | Energy-Charts, B, ja |
| Wasserkraft Norwegen | Speicherpotenzial rund 84–87 TWh, rund die Hälfte Europas; Speicher-Wasserkraft installiert 26,7 GW | Suchtreffer SINTEF und Energifakta Norge (C, nein); Energy-Charts (B, ja) |
| Wasserkraft Schweden | rund 34 TWh Speicher, 16,4 GW Speicherwasser | Suchtreffer (C, nein); Energy-Charts (B, ja) |
| Wasserkraft Alpen | AT 3,2 TWh, CH 8,4 TWh Speicher; Pumpspeicher-Potenzial 303 GWh (eStorage 2016) | Suchtreffer (C, nein) |
| Kohle Polen | Brutto-Erzeugung PL 2024 172 TWh, Netto-Export an DE schwankend | Eurostat, A, ja (nur Gesamtmengen, kein Kohleanteil) |
| Offshore-Wind Nordsee | NEP rechnet mit starkem Ausbau in NL, DK, GB, die zu Exporteuren nach DE werden, und mit Estland-Verbindung | NEP Kap. 3.1, S. 71, A, ja |
| Französische Kernkraft 2045 | Rückläufig, in allen NEP-Szenarien 2045 über 100 TWh unter 2037; FR wird zum Netto-Importeur | NEP Kap. 3.1, S. 71, A, ja |

Wer kann in einer deutschen Flaute liefern? Nach den eigenen Zahlen: Norwegen und Schweden haben die Energie, aber nur 2 GW Leitung nach Deutschland (NTC 2045); die Alpen sind klein im Speicher, aber gut angebunden (AT 8,4 und CH 5,5 GW); Frankreich ist leistungsstark, aber wetter- und ausfallabhängig; die direkten Windnachbarn (NL, BE, DK, PL) sind in Flauten gleichzeitig schwach. Konfidenz B, weil die Schlüsse eigene Verknüpfungen sind.

NEP-Modellsicht (Primärquelle): In allen Szenarien kann die Last 2045 in jeder Stunde ohne lastnahe Reserven gedeckt werden; in der Stunde mit höchster Residuallast besteht außer in C 2037 ein negativer Handelssaldo (= Import); die Stunde höchsten Handels 2037 hat rund 40 GW Netto-Import. Wasserstoff-Importe sind in allen Szenarien nötig. Das sind Modellergebnisse mit einem einzigen Wetterjahr (NEP Kap. 3.3.1, S. 86). Konfidenz A für „steht so im NEP", kein Beleg für die reale Wirkung.

## 6. Abhängigkeit oder Versicherung?

### 6.1 Für „Versicherung"

- Alle 129 Preisspitzen über 200 €/MWh 2024 fielen mit Netto-Import zusammen (3.3 und 3.4).
- Netzplanung: Importe tragen in Zeiten geringen Dargebots zur Versorgung bei; Speicherwasser der Nachbarn glättet (NEP Kap. 3.2.1, S. 68; Kap. 3.1, S. 71). A, ja.
- Schill/Kittel: Kupferplatte kürzt die längste Flaute um 65 % (C, nein).
- ACER (Suchtreffer, C, nein): Hätte die Core-Region 2024 die 70 %-Regel eingehalten, wäre mindestens 580 Mio. € Wohlfahrt gewonnen worden; EU-weite Engpasskosten 2023 4,2 Mrd. €. Beide Zahlen betreffen nicht Deutschland allein und messen Kapazitätsmängel, nicht den Gesamtnutzen des Verbunds.

### 6.2 Für „Abhängigkeit"

- Seit 2023 Netto-Import in jedem Jahr (3.1). Der NEP erwartet Netto-Import in allen Szenarien, 2045 zwischen 42 und 91 TWh (A, ja).
- Gleichzeitigkeit: Die Wind-Korrelation mit den Nachbarn ist hoch (4.1). In rund einem Viertel bis einem Fünftel der deutschen Schwachwindstunden (unter 10 %) ist auch das Nachbar-Aggregat unter 10 %; die längste gemeinsame Schwachphase dauerte 123 Stunden (2023).
- Frankreich: 2022 Netto-Importeur, 2045 laut NEP wieder (A, ja).
- Politisches Risiko: Schweden hat die Hansa PowerBridge ausgesetzt (Szenariorahmen-Genehmigung, A, ja). Im Dezember 2024 kritisierte die schwedische Energieministerin Ebba Busch deutsche Politik; norwegische Politiker drohten, Kabel zu überprüfen; beide forderten eine Preiszonen-Teilung Deutschlands (Presseberichte, C, nein; Preisspitze 900–1.000 €/MWh nach den Berichten, nicht von mir am 12.12.2024 geprüft). Das deutsche Klimaministerium verwies auf nur 600 MW Kapazität nach Schweden, was zur NTC-Tabelle passt.
- Ein Befund aus der Forschung (Suchtreffer, C, nein): NordLink hat die Preise in Südnorwegen im Mittel erhöht und die Volatilität gesteigert, in Deutschland gesenkt.

### 6.3 Ehrliche Einordnung

Der Verbund ist 2024 und 2025 messbar die Versicherung für die Spitzen, und er ist zugleich eine Abhängigkeit, weil Deutschland seit 2023 netto importiert. Beides stimmt. Die offene Frage ist die Gleichzeitigkeit in mehrtägigen Flauten mit hoher Last; das haben zwei Jahre Wind-Daten nicht klar entschieden. Dafür ist das Mehr-Zonen-Modell mit Last und Solar nötig.

Gründe für die Wende 2023: Die NEP nennt als Treiber die kostengünstigere Erzeugung im Ausland und die teure inländische Wasserstoff- und Gaserzeugung (Kap. 3.2.1) für die Zukunft. Für die tatsächliche Wende 2023 habe ich keine Primärquelle gelesen (Lücke).

## 7. Europäischer Rahmen (nur Eckdaten)

Alle Einträge: Suchtreffer, nicht primär gelesen, Konfidenz C.

| Thema | Eckdaten | Quelle |
|---|---|---|
| EU-Klimaziel 2040 | −90 % netto gegenüber 1990, bis zu 5 Prozentpunkte internationale Gutschriften ab 2036; Rat verabschiedete am 5.3.2026; Gutschriften nicht im ETS 1 anrechenbar | Europäisches Parlament (europarl.europa.eu, 5.2.2026); ICAP |
| ETS 2 | Start von 2027 auf 2028 verschoben | ICAP, Öko-Institut |
| EUA-Preis | Dez-2026-Kontrakt: April 74–76 €/t, 5.10.: 82,4 €/t, 12.10.: 88,3 €/t (höchster Stand seit Ende Januar) | GMK Center, S&P Global (Auszüge) |
| CBAM | Kommission schlägt vor, 15 % der wegen CBAM wegfallenden freien Zuteilung ab 2028 wieder einzuführen | Carbon Brief u. a. |
| Wasserstoff-Importkorridore | nicht recherchiert (siehe Lücken); NEP: H2-Importe in allen Szenarien notwendig | NEP Kap. 3, A, ja |

Die ETS-Mechanik gehört zu P1-09.

## 8. Daten für ein Mehr-Zonen-Modell

| Baustein | Quelle und Endpunkt | Stand |
|---|---|---|
| Stündliche Erzeugung je Technologie, Länder AT, BE, CH, CZ, DE, DK, FR, NL, NO, PL, SE | Energy-Charts `/public_power?country=<xx>&start&end` (Raster 15 min bzw. 60 min, je nach Land) | 2023 und 2024 geladen, `data/raw/europa/pp_*` |
| Installierte Leistung, jährlich, auch Planwerte bis 2030 für DE | `/installed_power?country=<xx>&time_step=yearly` | geladen |
| Kommerzielle und physikalische Flüsse je Grenze | `/cbet`, `/cbpf` | 2015/2018–2025 geladen |
| Day-Ahead-Preise je Gebotszone | `/price?bzn=<zone>` (DE-LU ab 2018; 429-Drosselung bei zu schnellen Abrufen) | 2018–2025 DE-LU, Nachbarn 2023–2025 |
| NTC 2045 je Grenze | NEP 2037/2045, Kap. 2, Tabelle 11 (oben) | Tabelle übernommen |
| Last der Nachbarn | `/public_power_forecast?production_type=load` o. Ä. — **nicht geprüft** | offen |
| Solar-Kapazitätsfaktoren je Land | aus `public_power` (Solar) und `installed_power` ableitbar | nicht ausgewertet |
| Wetterjahr-Repräsentativität | Nur 2023 und 2024 | offen: mehr Jahre nötig |

Aufwand und Stolpersteine: Die Datenpunkte unterscheiden sich in der Auflösung (DE, NL, AT: 15 min; andere: 60 min). Norwegen und Schweden sind mehrere Gebotszonen. Die Wind-Kapazitäten der Länder in Energy-Charts weisen Lücken auf (CH, CZ, DK 2024).

## 9. Gegenpositionen

- **Gegen „Versicherung":** Die Mehrzahl der direkten Nachbarn teilt das Wetter (r 0,56–0,79). Eine Versicherung, die bei demselben Ereignis ausfällt, hilft wenig. Dagegen spricht, dass Norwegen, Schweden, die Alpen und teils Frankreich unabhängiger sind (r 0,26–0,57).
- **Gegen „Abhängigkeit":** Importe fließen vor allem, wenn der Strom billiger ist (Preis des Nachbarn 2024 im Mittel 21 €/MWh unter dem deutschen in denselben Stunden). Das ist Handel, kein Mangel. Ob jede importierte Stunde bei Ausbleiben durch deutsche Kraftwerke gedeckt wäre, ist ohne Modell offen.
- **Gegen die Messung selbst:** Zwei Jahre, nur Wind, kein Solar, keine Last; Netto-Importzahlen sind je nach Datensatz bis zu 4 TWh verschieden.
- **Gegen den NEP:** Der NEP rechnet mit höheren Kapazitäten (50–69 GW) als heute genutzt (17–19 GW); der Szenariorahmen selbst warnt, zusätzliche Kapazität über bekannte Projekte hinaus sei „problematisch" (BNetzA-Genehmigung S. 76). Die BMWE-Langfristszenarien (92,4 GW) liegen weit darüber.

## 10. Lücken

- **Heutige NTC bzw. handelbare Kapazität je Grenze** (ENTSO-E, ACER). Nur Planwerte 2045 und beobachtete Spitzen.
- **Einhaltung der 70 %-Regel durch Deutschland** (ACER-Bericht „Cross-zonal electricity trade 2025", Länderkapitel).
- **Nutzen des Verbunds in Euro für Deutschland** laut ENTSO-E (TYNDP-Kosten-Nutzen, ERAA) und ACER.
- **TYNDP 2024/2026-Zahlen** (Szenario National Trends) für 2030/2035/2045 je Grenze.
- **Schwedische und norwegische Kritik im Original** (nur Presse-Auszüge).
- **Wasserkraft-Speicher** aus Primärquelle (Statnett, Svenska kraftnät, Swissgrid, EU-Verwaltungsangaben).
- **Gründe der Wende 2023** (Kernkraftausstieg, Gaspreis, Nachfrage, französische Verfügbarkeit): nicht belegt.
- **Wasserstoff-Importkorridore** und **CBAM-Stand** (Eckdaten nur aus Suchtreffern, Details fehlen).
- **EUA-Preis am 22.11.2026** (letzter Wert: 12.10.2026).
- **Wind-Korrelation:** keine Solar-/Lastdaten, nur zwei Jahre, keine Großbritannien-Zone, DK2 und andere Teilzonen nicht berücksichtigt.
- Ember „European Electricity Review 2025": nur die Einleitung der Seite lesbar (Executive Summary), Zahlen aus dem Bericht nicht übernommen.

## 11. Nicht erreichbar

| Host / Dokument | Gebraucht für |
|---|---|
| ENTSO-E (entsoe.eu, transparency.entsoe.eu): ERAA 2024/2025, TYNDP 2024 Scenarios und System Needs Study, Transparency Platform (grenzüberschreitende NTC) | heutige NTC je Grenze, Nutzen des Verbunds in Euro, Plan-Kapazitäten 2030/2035 |
| ACER (acer.europa.eu): Market Monitoring Report „Cross-zonal electricity trade capacities 2025" (und die Fassung 2024), Länderkapitel Deutschland | 70 %-Erfüllung, Wohlfahrtsgewinne |
| Nur per Websuche gelesen (kein Volltext): europarl.europa.eu, icapcarbonaction.com, oeko.de, carbonbrief.org, spglobal.com, gmk.center, brusselssignal.eu, cleanenergywire.org, arxiv.org, sintef.no, energifaktanorge.no | Rahmendaten, Kritik der Nachbarn, Literatur zu Flauten, Wasserkraft-Speicher |
| Statnett, Svenska kraftnät, Swissgrid, RTE | Speicherstände, Kernkraftverfügbarkeit im Original |

## 12. Quellenliste

- Netzentwicklungsplan Strom 2037/2045, Version 2025, 2. Entwurf (Übertragungsnetzbetreiber), Kap. 2, 3, 7, März 2026. https://www.netzentwicklungsplan.de/sites/default/files/2026-03/NEP_2037_2045_V2025_2_Entwurf_Kap2.pdf (Kap3, Kap7 analog). Abruf 22.11.2026.
- Bundesnetzagentur, Genehmigung des Szenariorahmens 2025–2037/2045, April 2025, Abschn. 3.7.2, S. 73–76. https://www.netzentwicklungsplan.de/sites/default/files/2025-04/Genehmigung%20Szenariorahmen%202025_0.pdf
- Übertragungsnetzbetreiber, Szenariorahmenentwurf zum NEP 2040/2045 (2027), Juli 2026, Kap. 6. https://www.netzentwicklungsplan.de/sites/default/files/2026-07/Szenariorahmen_zum_NEP_2040_2045_Version_2027_.pdf
- Fraunhofer ISE, Energy-Charts API (cbet, cbpf, public_power, installed_power, price). https://api.energy-charts.info, CC BY 4.0; Preise: Bundesnetzagentur | SMARD.de, CC BY 4.0. Abruf 22.11.2026.
- Eurostat, nrg_cb_e (Electricity supply, transformation and consumption – annual data). https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_cb_e, Datenstand 22.10.2026.
- Ember, European Electricity Review 2025 (Seite, Einleitung gelesen). https://ember-energy.org/latest-insights/european-electricity-review-2025/
- Suchtreffer (nicht primär gelesen): ACER Monitoring 2025 (acer.europa.eu/monitoring/cross-zonal-electricity-trade-2025); Brussels Signal, Clean Energy Wire, Bloomberg zu Norwegen/Schweden Dez. 2024; Europäisches Parlament 2040-Ziel; ICAP/Öko-Institut zu ETS 2; GMK Center/S&P Global zu EUA-Preisen; arXiv 2410.00244 (Schill/Kittel), arXiv 2212.04870 (Mockert et al.); SINTEF/Energifakta Norge zu Speicherkapazität.

Auftraggeber und Geldgeber: NEP (Übertragungsnetzbetreiber, Szenariorahmen von der BNetzA genehmigt), Energy-Charts (Fraunhofer ISE, öffentlich finanziert), Eurostat. Zu den Studien aus Suchtreffern (Schill/Kittel: DIW Berlin; Mockert: Hochschulumfeld) sind Geldgeber nicht geprüft.

```json
{
  "dossier": "06_europa",
  "stand": "2026-11-22",
  "parameters": [
    {"id": "de_netto_import_2023_twh", "min": 8.9, "mid": 11.7, "max": 11.7, "unit": "TWh/a", "source": "energy_charts_cbet_cbpf", "fundstelle": "cbet/cbpf, Summe aller Grenzen; Eurostat 9,2", "confidence": "A", "primaer_gelesen": true, "note": "Kommerziell 11,7, physisch 8,9, Eurostat 9,2"},
    {"id": "de_netto_import_2024_twh", "min": 25.1, "mid": 28.3, "max": 28.3, "unit": "TWh/a", "source": "energy_charts_cbet_cbpf", "fundstelle": "wie oben; Eurostat 26,3", "confidence": "A", "primaer_gelesen": true, "note": "ohne Großbritannien"},
    {"id": "de_netto_import_2025_twh", "min": 18.2, "mid": 21.9, "max": 21.9, "unit": "TWh/a", "source": "energy_charts_cbet_cbpf", "fundstelle": "wie oben", "confidence": "B", "primaer_gelesen": true, "note": "Jahr 2025 vollständig, ohne Eurostat-Gegenprobe"},
    {"id": "de_netto_export_2018_twh", "value": 54.2, "unit": "TWh/a Export", "source": "energy_charts_cbet_cbpf", "fundstelle": "cbet 2018 (physisch 48,0)", "confidence": "B", "primaer_gelesen": true, "note": "Exportjahr, Spitze der Reihe"},
    {"id": "de_max_import_gw_h_2024", "value": 17.0, "unit": "GW (Stundenmittel, Summe aller Grenzen)", "source": "energy_charts_cbet_cbpf", "fundstelle": "cbet 2024, 12.12.2024 07:00 UTC", "confidence": "B", "primaer_gelesen": true, "note": "2023: 17,1; 2025: 16,2"},
    {"id": "de_max_export_gw_h_2023", "value": 19.2, "unit": "GW (Stundenmittel, Summe aller Grenzen)", "source": "energy_charts_cbet_cbpf", "fundstelle": "cbet 2023", "confidence": "B", "primaer_gelesen": true, "note": "2024: 17,6; 2025: 18,0"},
    {"id": "ntc_2045_summe_aus_de_gw", "value": 49.6, "unit": "GW", "source": "nep_2037_2045_v2025_2", "fundstelle": "Kap. 2, Tabelle 11, S. 54 (Zeile DE, Summe der Zellen)", "confidence": "B", "primaer_gelesen": true, "note": "Layout der Matrix gelesen; inkl. Offshore-Hybride; Szenarien A/B/C gleich"},
    {"id": "ntc_2045_summe_nach_de_gw", "value": 49.6, "unit": "GW", "source": "nep_2037_2045_v2025_2", "fundstelle": "Kap. 2, Tabelle 11, S. 54 (Spalte DE)", "confidence": "B", "primaer_gelesen": true, "note": "wie oben"},
    {"id": "ntc_2040_2045_pfad_ab_gw", "min": 58, "mid": 58.5, "max": 59, "unit": "GW je Richtung", "source": "szenariorahmen_nep_2040_2045_v2027", "fundstelle": "Kap. 6.3, S. 121", "confidence": "A", "primaer_gelesen": true, "note": "58 Richtung DE, 59 aus DE; Pfade A und B"},
    {"id": "ntc_2045_pfad_c_gw", "min": 68, "mid": 68.5, "max": 69, "unit": "GW je Richtung", "source": "szenariorahmen_nep_2040_2045_v2027", "fundstelle": "Kap. 6.3, S. 121", "confidence": "A", "primaer_gelesen": true, "note": "2040: 65 / 66"},
    {"id": "ntc_bmwe_o45_strom_gw", "value": 92.4, "unit": "GW", "source": "szenariorahmen_nep_2040_2045_v2027", "fundstelle": "Kap. 6.3, S. 121 (Zitat BMWE-Langfristszenarien)", "confidence": "B", "primaer_gelesen": true, "note": "Obergrenze für den Regler; Zahl aus Sekundärzitat im Szenariorahmen"},
    {"id": "eu_mindestkapazitaet_handel_pct", "value": 70, "unit": "% der austauschlimitierenden Kapazität", "source": "szenariorahmen_nep_2040_2045_v2027", "fundstelle": "Kap. 6.1, S. 116; Kap. 6.2, S. 120", "confidence": "A", "primaer_gelesen": true, "note": "Pflicht seit 31.12.2025; AC-Verbindungen, bei HGÜ bis 100 %"},
    {"id": "eu_verbundziel_2030_pct", "value": 15, "unit": "% der installierten Erzeugungsleistung", "source": "szenariorahmen_nep_2040_2045_v2027", "fundstelle": "Kap. 6.1 und 6.3", "confidence": "A", "primaer_gelesen": true, "note": "in allen NEP-Szenarien unterschritten"},
    {"id": "nep_nettoimport_2037_a_twh", "value": 25, "unit": "TWh/a", "source": "nep_2037_2045_v2025_2", "fundstelle": "Kap. 3.2.1, S. 68", "confidence": "A", "primaer_gelesen": true, "note": "Modellergebnis, ein Wetterjahr"},
    {"id": "nep_nettoimport_2045_twh", "min": 42, "mid": 73, "max": 91, "unit": "TWh/a", "source": "nep_2037_2045_v2025_2", "fundstelle": "Kap. 3, Zusammenfassung S. 66 und Kap. 3.2.1 S. 68", "confidence": "A", "primaer_gelesen": true, "note": "Pfade A / B / C"},
    {"id": "nep_handelstransit_2045_twh", "min": 87, "mid": 90, "max": 95, "unit": "TWh/a", "source": "nep_2037_2045_v2025_2", "fundstelle": "Kap. 3.1, S. 71", "confidence": "A", "primaer_gelesen": true, "note": "2037: 54-72 TWh; Maximum einer Stunde ca. 25 GW (B 2045)"},
    {"id": "preis_spitzen_stunden_ueber_200_2024", "value": 129, "unit": "Stunden/a", "source": "energy_charts_price_cbet", "fundstelle": "eigene Rechnung scripts/europa_preise.py", "confidence": "B", "primaer_gelesen": true, "note": "alle 129 mit Netto-Import, im Mittel 11,1 GW; 2025: 162 (161); 2023: 112 (102)"},
    {"id": "importpreis_2024_eur_mwh", "value": 69.1, "unit": "EUR/MWh", "source": "energy_charts_price_cbet", "fundstelle": "eigene Rechnung, mengengewichtet über 10 Grenzen", "confidence": "B", "primaer_gelesen": true, "note": "DE-Preis in denselben Stunden: 90,5; Exportpreis 57,4; 2023: 92,8 / 106,3 / 79,8; 2025: 82,8 / 103,5 / 69,0"},
    {"id": "wind_korrelation_nachbar_aggregat_2024", "min": 0.82, "mid": 0.82, "max": 0.83, "unit": "r (stündliche Wind-CF)", "source": "energy_charts_public_power", "fundstelle": "eigene Rechnung scripts/europa_wind_korrelation.py; 2023: 0,83; 2024: 0,82", "confidence": "B", "primaer_gelesen": true, "note": "Nachbarn FR NL DK PL AT BE CZ NO SE, leistungsgewichtet"},
    {"id": "wind_korrelation_fr_nl_dk_pl_be_cz_range", "min": 0.56, "mid": 0.70, "max": 0.79, "unit": "r", "source": "energy_charts_public_power", "fundstelle": "wie oben, Einzelländer", "confidence": "B", "primaer_gelesen": true, "note": "FR 0,56-0,57; NL 0,71-0,79; BE 0,67-0,73; PL 0,66-0,71; DK 0,69-0,70; CZ 0,69-0,75"},
    {"id": "wind_korrelation_no_se_at_range", "min": 0.26, "mid": 0.30, "max": 0.35, "unit": "r", "source": "energy_charts_public_power", "fundstelle": "wie oben", "confidence": "B", "primaer_gelesen": true, "note": "NO 0,31-0,35; SE 0,26-0,31; AT 0,26-0,30"},
    {"id": "nachbar_cf_in_de_flaute_dezil", "value": 0.12, "unit": "Kapazitätsfaktor (Mittel in den 10 % schwächsten DE-Windstunden)", "source": "energy_charts_public_power", "fundstelle": "wie oben; Mittel der Nachbarn über alle Stunden 0,25-0,26", "confidence": "B", "primaer_gelesen": true, "note": "DE-Schwelle CF 0,043-0,045"},
    {"id": "gleichzeitige_flaute_stunden", "min": 543, "mid": 583, "max": 622, "unit": "Stunden/a", "source": "energy_charts_public_power", "fundstelle": "DE und Nachbar-Aggregat beide unter 10 % CF; DE allein unter 10 %: 2.380 (2023), 2.481 (2024)", "confidence": "B", "primaer_gelesen": true, "note": "längste Phase DE<10 % und Nachbarn<15 %: 123 h (2023), 57 h (2024)"},
    {"id": "fr_kernkraft_winter_mittel_gw", "min": 42.0, "mid": 44.5, "max": 47.1, "unit": "GW (Dez-Feb)", "source": "energy_charts_public_power", "fundstelle": "FR Nuclear 2023 / 2024; installiert 63,0 GW; Minimum 23,7 / 31,8 GW", "confidence": "B", "primaer_gelesen": true, "note": "eigene Rechnung"},
    {"id": "fr_bruttoerzeugung_2022_twh", "value": 475.1, "unit": "TWh", "source": "eurostat_nrg_cb_e", "fundstelle": "geo=FR, nrg_bal=GEP, 2022", "confidence": "A", "primaer_gelesen": true, "note": "2021: 555,6; 2023: 524,9; 2024: 570,7; FR Netto-Import 2022: 14,9 TWh"},
    {"id": "norwegen_speicherpotenzial_twh", "min": 84, "mid": 85.5, "max": 87, "unit": "TWh", "source": "suchtreffer_sintef_energifakta", "fundstelle": "Suchtreffer-Auszug", "confidence": "C", "primaer_gelesen": false, "note": "Primärquelle Statnett/NVE offen"},
    {"id": "schweden_speicher_twh", "value": 34, "unit": "TWh", "source": "suchtreffer_wasserkraft", "fundstelle": "Suchtreffer-Auszug (Spanne 30-34)", "confidence": "C", "primaer_gelesen": false, "note": "Primärquelle offen"},
    {"id": "acer_70pct_core_wohlfahrt_mio_eur", "value": 580, "unit": "Mio. EUR (Core-Region, 2024, mindestens)", "source": "suchtreffer_acer_2025", "fundstelle": "Suchtreffer-Auszug zu ACER-Bericht 2025", "confidence": "C", "primaer_gelesen": false, "note": "Region, nicht Deutschland; EU-Engpasskosten 2023: 4,2 Mrd. EUR (C)"},
    {"id": "eu_klimaziel_2040_pct", "value": 90, "unit": "% netto gegenüber 1990, bis zu 5 Prozentpunkte Gutschriften ab 2036", "source": "suchtreffer_europarl_2026", "fundstelle": "Suchtreffer-Auszug, Rat 5.3.2026", "confidence": "C", "primaer_gelesen": false, "note": "Gutschriften nicht im ETS 1 anrechenbar"},
    {"id": "eua_dez_2026_eur_t", "min": 74, "mid": 82.4, "max": 88.3, "unit": "EUR/t CO2", "source": "suchtreffer_gmk_sp", "fundstelle": "April / 5.10.2026 / 12.10.2026", "confidence": "C", "primaer_gelesen": false, "note": "kein Wert für November 2026 gefunden"},
    {"id": "regler_kuppelkapazitaet_gw", "min": 0, "mid": 50, "max": 92.4, "unit": "GW je Richtung (Setzung M für Reglerbereich)", "source": "eigene_setzung", "fundstelle": "Ist-Spitze 17-19 GW (3.2), NEP 2045 49,6 GW (Tab. 11), Szenariorahmen 58-69 GW, BMWE 92,4 GW", "confidence": "B", "primaer_gelesen": true, "note": "Setzung (M): Reglerstufen 0 / 18 / 50 / 59 / 69 / 92 GW"}
  ],
  "sources": {
    "nep_2037_2045_v2025_2": {"titel": "Netzentwicklungsplan Strom 2037/2045, Version 2025, 2. Entwurf, Kap. 2, 3, 7", "herausgeber": "Übertragungsnetzbetreiber (50Hertz, Amprion, TenneT, TransnetBW)", "datum": "2026-03", "url": "https://www.netzentwicklungsplan.de/sites/default/files/2026-03/NEP_2037_2045_V2025_2_Entwurf_Kap2.pdf", "abruf": "2026-11-22"},
    "bnetza_genehmigung_szenariorahmen_2025": {"titel": "Genehmigung des Szenariorahmens 2025-2037/2045", "herausgeber": "Bundesnetzagentur", "datum": "2025-04", "url": "https://www.netzentwicklungsplan.de/sites/default/files/2025-04/Genehmigung%20Szenariorahmen%202025_0.pdf", "abruf": "2026-11-22"},
    "szenariorahmen_nep_2040_2045_v2027": {"titel": "Szenariorahmenentwurf zum NEP 2040/2045 (2027)", "herausgeber": "Übertragungsnetzbetreiber", "datum": "2026-07", "url": "https://www.netzentwicklungsplan.de/sites/default/files/2026-07/Szenariorahmen_zum_NEP_2040_2045_Version_2027_.pdf", "abruf": "2026-11-22"},
    "energy_charts_cbet_cbpf": {"titel": "Energy-Charts API: cbet und cbpf (grenzüberschreitender Handel und physikalische Flüsse)", "herausgeber": "Fraunhofer ISE", "datum": "laufend", "url": "https://api.energy-charts.info/cbet?country=de", "abruf": "2026-11-22", "lizenz": "CC BY 4.0"},
    "energy_charts_public_power": {"titel": "Energy-Charts API: public_power und installed_power", "herausgeber": "Fraunhofer ISE", "datum": "laufend", "url": "https://api.energy-charts.info/public_power", "abruf": "2026-11-22", "lizenz": "CC BY 4.0"},
    "energy_charts_price_cbet": {"titel": "Energy-Charts API: price (Day-Ahead) und cbet", "herausgeber": "Fraunhofer ISE; Preisdaten Bundesnetzagentur | SMARD.de", "datum": "laufend", "url": "https://api.energy-charts.info/price", "abruf": "2026-11-22", "lizenz": "CC BY 4.0"},
    "eurostat_nrg_cb_e": {"titel": "Electricity supply, transformation and consumption - annual data (nrg_cb_e)", "herausgeber": "Eurostat", "datum": "2026-10-22", "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_cb_e", "abruf": "2026-11-22"},
    "suchtreffer_acer_2025": {"titel": "ACER Monitoring Report 2025, Cross-zonal electricity trade capacities (nur Suchtreffer)", "herausgeber": "ACER", "datum": "2025", "url": "https://www.acer.europa.eu/monitoring/cross-zonal-electricity-trade-2025", "abruf": "2026-11-22"},
    "suchtreffer_europarl_2026": {"titel": "EU climate law: a 2040 emissions reduction target of 90% (nur Suchtreffer)", "herausgeber": "Europäisches Parlament", "datum": "2026-02-05", "url": "https://www.europarl.europa.eu/news/en/press-room/20260205IPR33620/eu-climate-law-a-2040-emissions-reduction-target-of-90-for-the-eu", "abruf": "2026-11-22"},
    "suchtreffer_gmk_sp": {"titel": "Europäische CO2-Preise Oktober 2026 (GMK Center, S&P Global; nur Suchtreffer)", "herausgeber": "GMK Center / S&P Global", "datum": "2026-10", "url": "https://gmk.center/?p=130209", "abruf": "2026-11-22"},
    "suchtreffer_sintef_energifakta": {"titel": "Speicherpotenzial norwegischer Wasserkraft (nur Suchtreffer)", "herausgeber": "SINTEF / Energifakta Norge", "datum": "mehrere", "url": "https://energifaktanorge.no/en/norsk-energiforsyning/kraftproduksjon/", "abruf": "2026-11-22"},
    "suchtreffer_wasserkraft": {"titel": "Speicherwasser Schweden/Alpen (nur Suchtreffer)", "herausgeber": "div.", "datum": "mehrere", "url": "https://gemenergyanalytics.substack.com/p/hydropower-and-seasonal-electricity", "abruf": "2026-11-22"},
    "eigene_setzung": {"titel": "Setzung (M) des Rechercheurs", "herausgeber": "Daten-WG Knowledge Kitchen", "datum": "2026-11-22", "url": "", "abruf": "2026-11-22"}
  }
}
```
