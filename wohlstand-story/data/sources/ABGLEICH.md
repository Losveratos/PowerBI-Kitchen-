# Abgleich „Zwei Heimaten“ mit den Originalquellen

Stand: Abruf 11.11.2026. Geprüft wird `wohlstandsatlas/atlas-data.js` (Einheiten, `ts.series`) gegen die Ämter.
Die Rohwerte liegen aufbereitet in diesem Ordner und lassen sich mit
`python3 -I wohlstand-story/scripts/fetch_sources.py` neu abrufen.

Kennzeichnung: **[Q]** aus der Quelle gelesen · **[R]** gerechnet (aus Quelle bzw. Atlas) · **[V]** Vermutung.

| Datei | Quelle, Code | Stand der Quelle |
|---|---|---|
| `eurostat_nuts3_de.json` | Eurostat `nama_10r_3gdp` (MIO_EUR), `nama_10r_3popgdp` (THS), 2022 und 2023, DE bis NUTS-3 | `updated` 10.02.2026, Status „p“ (vorläufig) |
| `eurostat_hhinc_nuts2.json` | Eurostat `nama_10r_2hhinc`, B6N, BAL, EUR_HAB / PPS_EU27_2020_HAB / MIO_EUR, 2019–2023 | `updated` 20.05.2026 |
| `vgrdl_verfuegbares_einkommen_kreise.json` | VGRdL Reihe 2 Band 3, Tab. 2.4, verfügbares Einkommen je Einwohner, 2021–2023 | Berechnungsstand Februar 2025 (Datei `vgrdl_r2b3_bs2024.xlsx`) |
| `vgrdl_bip_kreise.json` | VGRdL Reihe 2 Band 1, Tab. 1.1 / 5 / 6, BIP, Einwohner, BIP je Einwohner, 2023–2024 | Berechnungsstand August 2025 (Datei `vgrdl_r2b1_bs2025_4.xlsx`, Revision 2024) |
| `worldbank_gdp_pc_ppp_2024.json` | Weltbank WDI `NY.GDP.PCAP.PP.CD`, 2024 | WDI `lastupdated` 08.10.2026 |
| `worldbank_gdp_pc_ppp_kd.json` | WDI `NY.GDP.PCAP.PP.KD`, 2000–2024 | 08.10.2026 |
| `worldbank_pop.json` | WDI `SP.POP.TOTL`, 2000–2024 (ISO3 → Liste) | 08.10.2026 |
| `worldbank_gini_deu.json` | WDI `SI.POV.GINI`, Deutschland | 08.10.2026 |

Nicht beschaffbar: IWF WEO (Host gesperrt), deshalb nicht prüfbar: Atlas-Werte mit `src` „IWF (WEO)“ (z. B. Puerto Rico, Jemen).

---

## 1 · BIP pro Kopf der 400 Kreise

**Rechenweg [R]:** BIP_Kreis / Bev_Kreis ÷ BIP_DE / Bev_DE (Eurostat 2023: 4.219.310 Mio. EUR, 83.287 Tsd.) × 73.957,0 Int.$
(WDI `NY.GDP.PCAP.PP.CD` DEU 2024 [Q] = 73.957,0; Atlas 73.957 → bestätigt).

| | Atlas | aus Eurostat 2023 [R] | Abw. | Rang Atlas / Quelle | Bev. Atlas | Bev. Eurostat 2023 [Q] |
|---|---|---|---|---|---|---|
| Köln `DEA23` | 114.620 | 114.619 | +0,001 % | 28 / 28 | 1.025.600 | 1.022.830 |
| OSL `DE40B` | 51.305 | 51.305 | +0,001 % | 307 / 307 | 109.060 | 108.760 |
| Südwestpfalz `DEB3K` | 30.299 | 30.299 | −0,001 % | 400 / 400 | 90.408 | 90.160 |
| Wolfsburg `DE913` | 270.230 | 270.226 | +0,001 % | 1 / 1 | 129.020 | 128.670 |
| München `DE212` | 147.230 | 147.231 | −0,000 % | 11 / 11 | 1.493.700 | 1.489.610 |

- **Alle 400 Kreise [R]:** größte Abweichung 0,004 % (Nürnberg, Memmingen, Wiesbaden, Dingolfing-Landau, Mannheim,
  Weiden, Bayreuth, Lkr. Heilbronn, Aschaffenburg, Ludwigshafen – alles Rundung auf fünf Stellen), Mittel 0,0006 %.
  Alle 400 Ränge identisch. „61 Kreise innerhalb ±5 %, Rang 276 bis 337“ aus Quellwerten nachgerechnet: identisch;
  bei ±10 % (neue einheitliche Toleranz der Story): 113 Kreise, Rang 248 bis 361.
- **Gegenprobe Jahr [R]:** Mit 2022 statt 2023 wären es im Mittel 2,7 %, maximal 29,7 % (Mainz) Abweichung → der Atlas
  nutzt eindeutig 2023.
- **Bevölkerung:** Der Atlas führt nicht die Eurostat-Zahl, sondern Eurostat-Anteil 2023 × Bevölkerung Deutschlands 2024
  (83,517 Mio., WDI/Destatis) [R]: Faktor in allen Kreisen 1,0027–1,0028. Köln „1.025.600“ ist also eine Hochrechnung;
  Eurostat zählt im Jahresmittel 2023 1.022.830 [Q]. Für Anteile ohne Wirkung, für eine im Text genannte Einwohnerzahl
  nicht korrekt zitierbar.

**Bewertung: bestätigt** (Werte, Ränge, Bevölkerungsanteile). Einschränkung: Eurostat-Werte sind vorläufig („p“) und
stammen aus einem älteren Rechenstand als die VGR der Länder.

**Revisionsrisiko [Q/R]:** Die VGRdL (Reihe 2 Band 1, August 2025, Revision 2024) weisen für 2023 bei gleichem
Deutschland-BIP andere Kreiswerte aus. Gleiche Rechnung damit:

| | Atlas (Eurostat) | VGRdL 2023 [R] | VGRdL 2024 [R] |
|---|---|---|---|
| Köln | 114.620 · Rang 28 | 114.634 · Rang 27 | 114.034 · Rang 27 |
| OSL | 51.305 · Rang 307 | 51.989 · Rang 300 | 52.038 · Rang 297 |
| Wolfsburg (Rang 1) | 270.230 | 249.337 | 275.793 |
| Kreise ±5 % um OSL | 61 (Rang 276–337) | 58 (268–326) | 56 (268–324) |
| Kreise ±10 % um OSL | 113 (Rang 248–361) | 118 (237–355) | 115 (237–352) |
| Welt unter OSL / Köln (feinste Ebene) | 85,6 % / 98,3 % | 85,8 % / 98,3 % | 85,8 % / 98,3 % |
| Südwestpfalz, Welt darunter | 73 % | 74,0 % | 74,0 % |

Mittlere Abweichung VGRdL-2023 zu Atlas 1,8 %, 25 Kreise über 5 %, größte: Erlangen-Höchstadt +34,9 %,
Freising +28,5 %, Mainz −26,4 %. Wenn Eurostat den VGRdL-Stand übernimmt, verschieben sich die Ränge (28 → 27,
307 → 300); „rund 86 %“, „rund 98 %“, „rund 73 %“, „Faktor 2,2“ halten. [V] Eurostat dürfte den Stand mit dem
nächsten Regional-Release übernehmen.

## 2 · Verfügbares Einkommen auf Kreisebene

**Quelle [Q]:** VGRdL R2B3 Tab. 2.4, 2023 (jüngstes Jahr), EUR je Einwohner.

| | EUR je Einwohner 2023 [Q] | relativ zu DE [R] | Rang von 400 [R] |
|---|---|---|---|
| Deutschland | 28.452 | 1,000 | – |
| Köln, kreisfreie Stadt (05315) | 28.764 | 1,011 | 164 |
| Oberspreewald-Lausitz (12066) | 25.139 | 0,884 | 352 |
| Minimum: Gelsenkirchen | 20.138 | 0,708 | 400 |
| Maximum: Lkr. Starnberg | 44.520 | 1,565 | 1 |

- Köln/OSL **1,144** [R] (BIP pro Kopf: 2,23). Innerhalb ±10 % von OSL: **179 Kreise**, ±5 %: 91 [R].
  Spanne Max/Min 2,21 [R].
- **NUTS-2 Eurostat** `nama_10r_2hhinc` B6N 2023 [Q]: RB Köln (DEA2) 28.000, Brandenburg (DE40) 26.000, DE 28.200
  EUR/Ew. → Verhältnis **1,077** [R]; in KKS 25.700 / 23.900 = 1,075. Atlas: 38.688 / 35.925 = 1,0769, und
  38.688 / 38.964 = 0,9929 = 28.000 / 28.200 [R] → **der Atlas-Faktor 1,08 ist bestätigt** und stammt genau aus
  dieser Tabelle. VGRdL-Stand für dieselben Gebiete: 28.361 / 26.440 = 1,073.
- **Kreis statt Bezirk:** Der Abstand ist auf Kreisebene größer (1,14 statt 1,08), weil Köln über und OSL unter
  dem Schnitt seines Bezirks/Landes liegt.

**Vorschlag zur Verbindung mit dem Weltvergleich** (gleiche Logik wie der Atlas auf NUTS-2): Kreiswert / DE-Wert
derselben Quelle × `hh_pc_ppp` DEU (38.964 Int.$). Anteil darunter wie im Datenskript `below(v, "hh_pc_ppp", FINE)` [R]:

| | Int.$ [R] | Welt darunter [R] | bei ±5 % [R] |
|---|---|---|---|
| Köln (Kreis) | 39.391 | 86,4 % | 85,3–87,0 % |
| OSL (Kreis) | 34.427 | 83,5 % | 82,8–84,5 % |
| zum Vergleich Atlas RB Köln / Brandenburg | 38.688 / 35.925 | 86,0 % / 84,4 % | |

Abstand in der Welt: **2,8 Punkte** statt 1,6. Vorbehalt: Die übrigen deutschen Regionen haben im Atlas nur
NUTS-2-Werte; der Vergleich mischt also eine Kreis- mit einer Bezirksverteilung. Relativ zu DE derselben Quelle
rechnen, weil VGRdL (28.452) und Eurostat (28.200) für Deutschland 2023 nicht übereinstimmen.

**Bewertung:** Atlas-NUTS-2-Werte **bestätigt**. Aussage „keine 2 Punkte auseinander“ gilt nur für Bezirk/Land;
auf Kreisebene **weicht ab** (knapp 3 Punkte, Faktor 1,14).

## 3 · Zeitvergleich 2000–2024 mit Bevölkerung des jeweiligen Jahres

**Quellen:** Atlas `ts.series` (187 Länder mit durchgehender Reihe), WDI `SP.POP.TOTL` [Q] für alle 187 vorhanden.

| | Story (Bev. 2024) | Bev. je Jahr 2000 [R] | Bev. je Jahr 2024 [R] |
|---|---|---|---|
| Weltbevölkerung in Ländern mit niedrigerem realem BIP p. K. | 92,3 % → 93,0 % | **91,6 %** | 93,0 % |
| Rang Deutschland (von 187) | 22 → 21 | 22 | 21 |
| Weltdurchschnitt (Int.$ 2021) | 11.896 → 21.488 | **12.817** | 21.488 |
| DE / Weltdurchschnitt | 4,2 → 2,9 | **3,9** | 2,9 |
| DE / Land des mittleren Menschen | 12,3 (China) → 4,3 (Indonesien) | 12,3 (China) | 4,3 (Indonesien) |

- 2024 ist definitionsgemäß gleich (Atlas-Bevölkerung 2024 = WDI, außer Jemen, s. u.). 2000 ändert sich: Anteil
  −0,7 Punkte, Faktor zum Durchschnitt 4,2 → 3,9. China deckt im Jahr 2000 das Band 32–53 % der Weltbevölkerung ab
  [R], der Median liegt also weiter in China.
- **`ts.series` gegen `NY.GDP.PCAP.PP.KD` [Q/R]:** DEU 49.956 / 62.950 / 62.655 (2000/2019/2024), USA 55.046 / 69.121 /
  75.698, POL 18.566 / 38.182 / 45.153, CHN 4.066 / 18.821 / 23.841, IND 3.010 / 7.702 / 9.416 – Abweichung höchstens
  0,013 %; über alle 4.675 Werte max. 0,055 % (Rundung). **Bestätigt.**
- **Seit 2019 [R]:** DEU −0,47 %, USA +9,52 % (WDI +9,51 %), POL +18,26 %. **Bestätigt.**
- **Taiwan [Q]:** nicht in WDI (`TWN` fehlt in allen drei Reihen). **Bestätigt.**

**Bewertung:** Methode (Bev. 2024) reproduziert; mit zeitgerechter Bevölkerung **weicht 2000 ab**: 91,6 % statt
92,3 %, 3,9-fach statt 4,2-fach. Ränge und Median-Faktoren unverändert.

## 4 · Länderwerte 2024 (`NY.GDP.PCAP.PP.CD`)

| ISO | Atlas | WDI 2024 [Q] | Abw. |
|---|---|---|---|
| DEU | 73.957 | 73.957,0 | 0,000 % |
| POL | 51.263 | 51.262,5 | +0,001 % |
| EST | 50.396 | 50.395,8 | 0,000 % |
| JPN | 54.156 | 54.156,3 | 0,000 % |
| PRT | 52.513 | 52.512,6 | +0,001 % |
| NOR | 105.660 | 105.657,0 | +0,003 % |
| QAT | 126.710 | 126.712,6 | −0,002 % |
| USA | 86.170 | 86.169,7 | 0,000 % |
| CHN | 27.140 | 27.139,5 | +0,002 % |
| IND | 10.719 | 10.718,6 | +0,004 % |
| IDN | 16.472 | 16.472,5 | −0,003 % |
| RUS | 47.686 | 47.686,1 | 0,000 % |

Alle zwölf liegen 2024 bei der Weltbank vor. **Bestätigt.** Über alle 195 Länder mit WDI-Wert: nur Puerto Rico
weicht über 0,01 % ab (0,13 %, Quelle IWF). Ohne WDI-Wert 2024 sind u. a. Kuba, Nordkorea, Venezuela, Jemen,
Syrien, Südsudan, Eritrea.

**Nebenbefund:** Jemen hat im Atlas 18,3 Mio. Einwohner (Quelle IWF), WDI 2024 40,6 Mio. [Q]. Wirkung auf die Story
[R]: OSL 85,56 → 85,60 %, Köln 98,26 → 98,27 % – vernachlässigbar, aber im Atlas zu prüfen.

## 5 · Gini Deutschland

WDI `SI.POV.GINI` [Q]: jüngster Wert **33,7 (2022)**, davor 33,6 (2021), 32,5 (2020). 35,2 kommt in der WDI-Reihe
1991–2022 nicht vor. **Weicht ab** (+1,5 Punkte), [V] anderer Datenstand oder andere Quelle in der Atlas-Pipeline.
Der Überschlag in Akt 4 rechnet Varianten mit ±5 Gini-Punkten, 33,7 liegt darin; die Textaussagen (nur
variantenfeste) sollten halten, die Hauptvariante ist leicht zu ungleich.

---

## Folgen für die Story

1. **Bevölkerung (falls genannt, z. B. „Zum Nachprüfen“):** nicht „1.025.600 Einwohner“ als Eurostat-Zahl ausgeben.
   Vorschlag: „Einwohner: Anteil laut Eurostat 2023, hochgerechnet auf die Bevölkerung Deutschlands 2024.“
2. **Zeitvergleich, Lead und Akt „Seit 2000“:** „vom 4,2-Fachen auf das 2,9-Fache“ → „vom 3,9-Fachen auf das
   2,9-Fache“ (mit Bevölkerung des jeweiligen Jahres). Akt-Text: „Im Jahr 2000 war Deutschlands BIP pro Kopf gut
   4-mal so hoch wie der Weltdurchschnitt“ → „knapp 4-mal so hoch“. „92 % → 93 %“ bleibt (91,6 % → rund 92 %), in
   „Zum Nachprüfen“ 91,6 % statt 92,3 %. Satz in der Grafikzeile und im README „Anteile und Durchschnitt mit der
   Bevölkerung von 2024 gewichtet, weil der Atlas keine Bevölkerung je Jahr führt“ → „mit der Bevölkerung des
   jeweiligen Jahres gewichtet (Weltbank SP.POP.TOTL)“ – setzt voraus, dass `build_story_data.py`
   `data/sources/worldbank_pop.json` einliest.
3. **„Beim Konsum fast gleichauf“** ergänzen (Kreisebene, VGRdL 2023): „Auf Kreisebene ist der Abstand größer: Das
   verfügbare Einkommen je Einwohner liegt in Köln bei 28.800 Euro, in OSL bei 25.100 Euro, Faktor 1,14 (Rang 164 und
   352 von 400). Auf den Konsum Deutschlands umgelegt sind das 39.400 und 34.400 Int.$, in der Welt rund 86 und
   rund 84 %, knapp 3 Punkte auseinander.“ Schluss-Satz „stehen beide Regionen in der Welt keine 2 Punkte
   auseinander“ → „stehen Regierungsbezirk Köln und Brandenburg keine 2 Punkte auseinander, die beiden Kreise
   knapp 3“. Optional als „eng“-Beleg: „179 Kreise liegen beim verfügbaren Einkommen höchstens 10 % von OSL entfernt.“
4. **Rang 28 / 307:** gegen Eurostat bestätigt. Hinweis in „Zum Nachprüfen“ empfohlen: „Nach dem neueren Rechenstand
   der Statistischen Ämter (VGR der Länder, August 2025) stehen Köln auf Rang 27 und OSL auf Rang 300; an den
   Anteilen in der Welt ändert das nichts.“ Wenn der Atlas auf diesen Stand umgestellt wird: „279 Plätze“ → 273,
   „61 Kreise“ → 58, „Rang 276 bis 337“ → 268 bis 326 (bei ±10 %: 113 → 118 Kreise, Rang 248–361 → 237–355).
5. **Gini:** In der Methodik „Gini-Index der Weltbank“ nur lassen, wenn der Atlas auf 33,7 (2022) aktualisiert wird;
   sonst Quelle des Werts 35,2 nennen.
6. **Quellenangabe:** „Eurostat (NUTS-3, regionale Haushaltseinkommen)“ präzisieren: „Eurostat nama_10r_3gdp,
   nama_10r_3popgdp (Stand 10.02.2026, vorläufig), nama_10r_2hhinc (Stand 20.05.2026); Weltbank WDI (Stand
   08.10.2026)“, bei Ergänzung 3 zusätzlich „VGR der Länder, Reihe 2 Band 3 (Berechnungsstand Februar 2025)“.
