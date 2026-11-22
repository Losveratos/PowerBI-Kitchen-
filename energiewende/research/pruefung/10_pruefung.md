# Prüfbericht 10 · Wirtschaftslage und Energiepreise

Stand 22.11.2026 · Phase 2 · Auftrag P2 (Gegenprüfung) · geprüftes Dossier: `research/10_wirtschaftslage.md` ·
Prüfer: Opus-Agent, nicht Autor des Dossiers · Regeln: `agents/REGELN.md`, `agents/briefs/P2_gegenpruefung.md` ·
Rohdateien: `quellen/raw/P2-10/`, Prüfsummen: `quellen/manifest_P2-10.json` ·
Nachrechnung: `scripts/pruefung/p2_10_nachrechnung.py` (eigener JSON-stat-Leser `p2_10_jsonstat.py`, nicht das Phase-1-Skript).

## 1. Urteil in fünf Zeilen

1. Die Zahlen sind sehr belastbar: Von 43 geprüften Werten sind 38 bestätigt, 3 abweichend (Darstellung oder Abgrenzung), 2 nicht prüfbar. Alle nachgerechneten Eurostat-, Destatis- und KfW-Werte habe ich aus neu abgerufenen Primärdaten genau wiedergefunden (Abweichung 0 bis 0,1 Prozentpunkte).
2. Schief sind die Auswahl und die Abgrenzung, nicht die Werte. Kernaussage 2 nennt nur die beiden Zweige, in denen die EU fast so stark fiel wie Deutschland (Chemie, Metall). Papier und Glas/Keramik fehlen, dort liegt Deutschland deutlich schlechter. Der EU-Wert des Verarbeitenden Gewerbes (+2,7 %) ist durch Irland verzerrt.
3. Kernaussage 1 stützt R21s Basis „vor 2020“ mit dem KfW-Wert „80 % des Vorkrisenniveaus“. Die KfW meint damit aber das Niveau vor der Energiekrise (Index Januar 2021 = 100), nicht 2019.
4. Zwei Schwerpunkte sind jetzt am Original belegt. Die Bundesbank beziffert die Wirkung dauerhaft verdoppelter Energiepreise (gegenüber 2019) auf −4,4 % der Wertschöpfung der Industrie und rund −2 % gesamt. Der Bundeshaushalt zahlte 2024 18,49 Mrd. € auf das EEG-Konto. Eine Ex-post-Zerlegung des Produktionsrückgangs nach Ursachen gibt es weiterhin nicht (ifo nicht abrufbar).
5. Kernaussage 10 hält und wird stärker: Nach den Ember-Daten hat Großbritannien fossile und Kernerzeugung relativ noch stärker durch Erneuerbare ersetzt als Deutschland. Konfidenz A ist für die Preis- und Komponentenwerte formal nicht erfüllt: Es gibt nur eine Quelle (Eurostat, Meldungen der Mitgliedstaaten). Die Werte selbst sind sicher.

## 2. Prüftabelle

Ergebnis: **bestätigt** · **abweichend** · **nicht prüfbar**. „P2“ = Fundstelle von mir selbst im Original gelesen.

### 2.1 Kernaussagen

| Kernaussage / Zahl | Wert im Dossier | Geprüfte Fundstelle | Ergebnis | neue Konfidenz, primaer_gelesen |
|---|---|---|---|---|
| KA 1 Industrie B–D 2025 vs. 2019 / 2018 | −12,2 % / −15,0 % | Eurostat sts_inpr_a, I21, CA, Stand 19.11.2026 | bestätigt (−12,2 / −15,0) | B, true |
| KA 1 Chemie, Glas, Metall, Papier 2025 vs. 2019 | −17,9 / −20,0 / −15,6 / −18,2 % | ebd. C20, C23, C24, C17 | bestätigt | B, true |
| KA 1 „gegenüber dem Höchststand 2018: −20 bis −21 %“ | −20 bis −21 % | ebd. | **abweichend (gering):** Spanne −19,9 % (C17) bis −21,1 % (C23). Bei Chemie (100,8) und Papier (101,0) lag der Höchststand 2017, nicht 2018 | B, true |
| KA 1 KfW „etwa 80 % des Vorkrisenniveaus“ als Beleg für R21 „vor 2020“ | Konfidenz A | KfW Kap. 3, S. 3; Grafik 3.2 „Indizes: Jan 2021 = 100“; S. 2: „Bis Ende des Jahres 2022 sank die reale Produktion … um gut 15 %“ | **abweichend (Abgrenzung):** Bei der KfW heißt „Vorkrise“ vor der Energiekrise (2021). Die KfW-Zahl bestätigt deshalb nicht R21s Basis „vor 2020“. Die KfW zählt außerdem fünf Zweige (mit Kokerei/Mineralöl C19), das Dossier vier | Kernaussage **B** statt A |
| KA 2 EU27/FR/IT/ES/PL (C20, C24, C) | siehe Dossier | sts_inpr_a | Zahlen bestätigt. **Abweichend in der Darstellung:** Papier EU27 −6,5 % gegen DE −18,2 %, Glas/Keramik EU27 −10,8 % gegen DE −20,0 % sind nicht genannt. EU27 C ohne Irland ≈ −1,4 % statt +2,7 % (Näherung, siehe 4.) | B, true |
| KA 3 Industriestrom ID 2026-S1 | DE 17,4; EU 15,6; FR 12,4; ES 11,8; PL 18,1; IT 19,9 | nrg_pc_205, X_VAT, Stand 19.10.2026 | bestätigt (17,42 / 15,59 / 12,39 / 11,77 / 18,12 / 19,91) | B (formal), true |
| KA 3 DE vs. EU 2019-S1 / 2025-S2 | +25 % / +20 % | ebd. | bestätigt (+25,4 % / +20,4 %). Nicht genannt: 2026-S1 nur noch **+11,7 %**, also halb so viel wie vor der Krise | B, true |
| KA 3 Haushalt 2026-S1, DE vs. EU; Jahresmittel 2025 | 36,2 / 28,3 (+28 %); 38,5 | nrg_pc_204, I_TAX | bestätigt (36,18 / 28,32 / +27,8 %; Mittel S1/S2 2025 = 38,52) | B (formal), true |
| KA 4 Industriegas I3 2026-S1 | DE 6,8; EU 6,2; FR 6,1; ES 4,9; IT 5,9 | nrg_pc_203 | bestätigt (6,82 / 6,16 / 6,06 / 4,93 / 5,88) | B, true |
| KA 4 Großhandel Gas 1. Hj. 2025 | Europa 41, Nordamerika 11,5 €/MWh | KfW Kap. 3, S. 2 | bestätigt | B, true |
| KA 4 „IT und NL gleichauf oder höher“ | – | nrg_pc_205 2026-S1 | bestätigt. Ergänzung: auch PL (18,1) liegt höher. Von 7 Ländern steht DE 2026-S1 auf Platz 4, 2025-S2 auf Platz 2 | B, true |
| KA 5 Komponenten Haushalt 2019 → 2025 | Beschaffung 5,8 → 14,8; Netz 7,4 → 11,3; Steuern ohne MwSt 11,0 → 6,3 | nrg_pc_204_c (TAX_FEE_LEV_CHRG enthält die MwSt; abgezogen) | bestätigt (5,81 → 14,81; 7,40 → 11,30; 10,98 → 6,26) | B (formal), true |
| KA 5 Komponenten Industrie | 3,1 → 10,5; 3,1 → 5,5; 8,7 → 3,9 | nrg_pc_205_c | bestätigt (3,10 → 10,52; 3,13 → 5,54; 8,73 → 3,89) | B, true |
| KA 6 EEG-Bundeszuschuss 2025 | rund 16,5 Mrd. €, C | Drs. 20/14522, S. 2: Finanzierungsbedarf 2025 laut ÜNB „rund 16,53 Mrd. Euro“ (Prognose). Ist 2025 nur in Fachpresse (pv magazine 13.01.2026, nicht gelesen) | Prognose bestätigt, Ist nicht prüfbar | **B** (Prognose), true |
| KA 6 „2026 im Haushalt rund 17,2 Mrd. €“ | 17,2 | Drs. 21/601 (Finanzplan 2025–2029), S. 29: „in 2025: 17,2 Mrd. €, in 2026: 17,2 Mrd. €“, ab 2025 im Kernhaushalt statt KTF | bestätigt. Ergänzung: der Ansatz 2025 war ebenfalls 17,2 | B, true |
| KA 6 „2024 Ausgaben des Kontos 21,985 Mrd. €“ | 21,985 | nicht gefunden. Drs. 20/14522, S. 1: 2024 überwies der Bundeshaushalt „rund 18,49 Mrd. Euro“ auf das EEG-Konto (Ansatz 10,60, überplanmäßig +7,89) | nicht prüfbar. **Neu:** Bundeszuschuss 2024 = 18,49 Mrd. € | B, true |
| KA 6 Netzbetreiber-Prognose 2026 12,4 Mrd. € | 12,4 | netztransparenz.de nicht freigegeben | nicht prüfbar | C, false |
| KA 7 Unternehmensinsolvenzen 2021–2025; 2014; 2010; 2003 | 13.993 … 24.064; 24.085; 31.998; 39.320 | Destatis lrins01, Stand 13.03.2026 (neu abgerufen) | bestätigt (alle sieben Werte) | B, true |
| KA 8 BIP real DE 2025 vs. 2019 | +0,8 % (Eurostat) / +0,3 % (Weltbank) | nama_10_gdp CLV20; Weltbank NY.GDP.MKTP.KD (Phase-1-Rohdatei, API bei mir Timeout) | bestätigt (+0,83 / +0,28). Eurostat 2023 und 2024 sind wirklich identisch (3.645.641,5 Mio. €) | B, true |
| KA 8 Investitionen real 2025 vs. 2019 | DE −6,4; EU +5,0; FR +3,8; ES +13,5 | nama_10_gdp P51G | bestätigt (−6,39 / +5,05 / +3,80 / +13,49) | B, true |
| KA 8 EU27 +7,6; USA +15,2; Japan +2,1; Italien +6,4 | – | Eurostat bzw. Weltbank | bestätigt. Italien +6,4 ist der Weltbank-Wert, Eurostat ergibt +7,4. Die Quellen sind im Satz gemischt | B, true |
| KA 8 Direktinvestitionen 2015–19 / 2021–25 | Zufluss 93 / 91; Abfluss 154 / 137 Mrd. US-$ | Weltbank BX/BM.KLT.DINV.CD.WD (Phase-1-Rohdatei) | bestätigt (93,4 / 90,6; 153,8 / 137,3) | B, true |
| KA 9 KfW/Prognos 5,7–6,4 Bio., 270–300, 135–153 Mrd. €/Jahr; keine BIP-Aussage | – | KfW/Prognos Endbericht, Zusammenfassung S. 1 und S. 5 | bestätigt. **Fehlt:** gleicher Absatz: „Gegenüber dem Status quo ergibt sich ein zusätzlicher Investitionsbedarf von etwa 160 bis 220 Milliarden Euro pro Jahr“. Preisbasis €2024 | B (eine Studie), true |
| KA 10 Eurostat-Mengen DE, ES, IT, DK, EU27 | siehe Dossier | nrg_bal_peh GEP | bestätigt (alle auf 0,1 TWh) | B, true |
| KA 10 „einziges Industrieland“ nicht haltbar | – | Ember, release_generation_yearly_global.csv (jetzt abrufbar) | bestätigt und verschärft, siehe 4.4 | A für das Urteil (Eurostat + Ember unabhängig), true |
| KA 10 Weltbank-Anteile Kernenergie JP 27,5 → 9,2; UK 20,5 → 14,2 | – | Weltbank EG.ELC.NUCL.ZS (Phase-1-Rohdatei) | bestätigt. Ember-Mengen: UK 81,6 → 40,6 TWh (−50 %), JP 293 → 85 TWh (−71 %) | B, true |

### 2.2 Parameter mit Konfidenz A (alle sechs)

| Parameter-ID | Wert | Fundstelle | Ergebnis | neue Konfidenz |
|---|---|---|---|---|
| de_industriestrom_id_2026s1_ct_kwh | 17,42 | nrg_pc_205 | bestätigt | **B** (nur eine Quelle; REGELN verlangen für A mehrere unabhängige) |
| de_haushaltsstrom_2026s1_ct_kwh | 36,18 | nrg_pc_204 | bestätigt | **B** (R21-Zahl 38 ct stammt von stromreport.com und ist ein anderer Wert/Zeitraum) |
| de_industriegas_i3_2026s1_ct_kwh | 6,82 | nrg_pc_203 | bestätigt | **B** |
| de_strompreis_haushalt_beschaffung_2019_2023_2025_ct | 5,81 / 19,92 / 14,81 | nrg_pc_204_c NRG_SUP | bestätigt | **B**. Außerdem: Das Feldschema min/mid/max für eine Zeitreihe ist irreführend (mid > max) |
| de_strompreis_haushalt_netz_2019_2025_ct | 7,40 / 11,30 | NETC | bestätigt | **B** |
| de_strompreis_haushalt_eeg_position_2021_2025_ct | 6,75 / 0,28 | TAX_RNW | bestätigt | **B**. min > max, Schema wie oben |

### 2.3 Stichprobe Konfidenz B

23 B-Parameter, alphabetisch sortiert, k = 23 // 10 = 2, beginnend beim ersten: Positionen 0, 2, 4 … 18.

| # | Parameter-ID | Wert | Fundstelle | Ergebnis |
|---|---|---|---|---|
| 0 | de_beschaeftigte_energieversorgung_2025_vs_2019_pct | +20,2 % | nama_10_a64_e D | bestätigt (262 → 315 Tsd., +20,2 %) |
| 2 | de_beschaeftigte_verarbeitendes_gewerbe_2025_vs_2019_pct | −6,6 % | nama_10_a64_e C | bestätigt (7.773 → 7.262, −6,57 %) |
| 4 | de_bip_real_2025_vs_2019_pct | 0,3 / 0,8 / 0,8 | Eurostat, Weltbank | bestätigt |
| 6 | de_fdi_zufluss_mittel_2021_25_mrd_usd | 91 | Weltbank | bestätigt (90,6) |
| 8 | de_industrieproduktion_bd_2025_vs_2019_pct | −12,2 % | sts_inpr_a | bestätigt. Notiz „EU27 +1,5 %“ ebenfalls bestätigt |
| 10 | de_investitionen_nominal_2025_mrd_eur | 915,1 | nama_10_gdp P51G CP_MEUR | bestätigt (915.092 Mio. €) |
| 12 | de_investitionsquote_2025_pct | 20,2 | P51G PC_GDP | bestätigt (2019: 21,0; EU27 2025: 21,5) |
| 14 | de_produktion_glas_keramik_2025_vs_2019_pct | −20,0 % | sts_inpr_a C23 | bestätigt (EU27 −10,8 %) |
| 16 | de_produktion_papier_2025_vs_2019_pct | −18,2 % | sts_inpr_a C17 | bestätigt (EU27 −6,5 %) |
| 18 | es_fossile_erzeugung_2005_2024_twh | 184,6 / 65,7 | nrg_bal_peh ES FE | bestätigt (EE 42,3 → 161,0) |

Zusätzlich geprüft, weil sie Kernaussagen tragen: `gas_ttf_2022_eur_mwh` 124 (KfW S. 1, bestätigt, Mittel 2010–19: 23); `de_energieintensive_produktion_niveau_pct_vorkrise` 80 (KfW S. 3, Wortlaut bestätigt, Abgrenzung siehe KA 1); `de_industrie_energieverbrauch_2025_pj` 3.248 (Destatis PM 400, bestätigt mit 2.662 PJ, 82,0 %, 28,6 %, 29,2 %, 21,2 %); `kfw_klimainvest_*` (bestätigt); `r21_kosten_in_bip_vielfachen` 2,2–3,0 (nachgerechnet 2,21–3,05; R21 S. 12 bestätigt).

### 2.4 Schwerpunkte

| Schwerpunkt | Ergebnis |
|---|---|
| Bundesbank zum Anteil der Energiepreise | **jetzt gelesen.** Monatsbericht Dez. 2022, S. 29 f., Kasten „Auswirkungen dauerhaft höherer Energiekosten auf das deutsche Produktionspotenzial“: Bei Energiepreisen von „mehr als das Doppelte“ gegenüber 2019, dauerhaft, dämpft das Modell „die Bruttowertschöpfung in der Industrie um rund 4½ %“ (Tabelle: −4,4 % direkt) und im Transportgewerbe um 3½ % (−5,8 % mit indirekten Effekten). Insgesamt ergibt sich ein Angebotseffekt von „rund 2 % der Bruttowertschöpfung“ (Gesamteffekt −2,1). Produktionspotenzial 2025 rund 1¾ % unter der Juni-Projektion. Ausdrücklich „hoher Unsicherheit“ unterworfen. Das ist eine **Ex-ante-Modellrechnung**, keine Zerlegung des beobachteten Rückgangs. B, true |
| Sachverständigenrat | **jetzt gelesen.** JG 2022/23, Kap. 5, „Wichtigste Botschaften“ (Kapitelbeginn): Strukturwandel wird beschleunigt, „dürfte aber nicht zu einer breiten Deindustrialisierung führen“. Abwanderung von Teilen der Produktion möglich in Metall, Glas/Keramik/Steine-Erden und Grundstoffchemie. Energiekostenanteil „zwischen 2 bis 5 %“ der Gesamtkosten für die meisten Bereiche. Ziffer 318 (S. 251): Median-Unternehmen 1,6 % vom Umsatz (Durchschnitt 2,3 %), Keramik 8,1 % vom Umsatz, Grundstoffchemie 7,5 % der Materialkosten. Datenbasis AFiD 2018. Eine Zahl zum Anteil am Produktionsrückgang nennt der SVR nicht. B, true |
| ifo (Schaller/Schasching, Schnelldienst 6/2024) | **nicht prüfbar:** www.ifo.de liefert eine Browser-Prüfung (HTML, 3 KB) statt des PDF. Nicht umgangen, Datei gelöscht |
| Industrieproduktion und Strompreise aus Eurostat nachrechnen | erledigt, siehe 4.1–4.3: alle Werte bestätigt |
| Ember-Jahresdatei „als einziges Industrieland“ | erledigt, siehe 4.4 |
| EEG-Zuschuss aus dem Bundeshaushalt | teilweise: Ist 2024 = 18,49 Mrd. € (Drs. 20/14522), Ansatz 2025 und 2026 je 17,2 Mrd. € (Drs. 21/601), Prognose 2025 16,53 Mrd. €. Ist 2025 nur aus Fachpresse |

## 3. Abweichungen im Detail (nach Gewicht)

1. **KA 2 ist selektiv belegt.** Der Satz „kein rein deutsches Phänomen“ wird nur mit Chemie (EU27 −16,0 gegen DE −17,9) und Metall (−12,2 gegen −15,6) belegt. Papier (EU27 −6,5 gegen DE −18,2) und Glas/Keramik (−10,8 gegen −20,0) zeigen einen deutschen Sonderrückgang von 10 bis 12 Prozentpunkten, stehen aber nur im JSON. Ungewichtetes Mittel der vier Zweige: DE −17,9 %, EU27 −11,4 %. Das EU27-Aggregat des Verarbeitenden Gewerbes (+2,7 %) ist durch Irland verzerrt: IE C +85,8 % gegen 2019 bei 7,1 % Wertschöpfungsanteil 2021. Ohne Irland ergeben sich ≈ −1,4 %, ohne Irland und Deutschland ≈ +4,0 % (Näherung mit festen Gewichten 2021; der Kettenindex ist nicht exakt additiv). Die Lücke 12 des Dossiers ist damit beantwortet: Die Verzerrung ist erheblich. Gegen die Lesart „nicht allein“ spricht zugleich: Frankreich mit billigem Kernstrom hat bei Metall (−24,6 %) und Glas/Keramik (−18,7 %) ähnlich oder stärker verloren als Deutschland, bei Kfz −23,2 %. Diese Zahl fehlt ebenfalls und stützt die Aussage, dass nicht nur der Strompreis wirkt. **Vorschlag:** alle vier Zweige nennen, EU27 ohne Irland ausweisen, Frankreich als Gegenbeispiel aufnehmen. Konfidenz B bleibt.
2. **KA 1 vermischt zwei Basen.** R21 schreibt „gegenüber der Zeit vor dem Jahr 2020“. Die KfW-Zahl „80 % des Vorkrisenniveaus“ bezieht sich auf die Zeit vor dem Energiepreisschock (Grafik 3.2: Jan 2021 = 100) und auf fünf Zweige einschließlich Kokerei/Mineralöl. Sie ist keine unabhängige zweite Quelle für die R21-Basis. Gegen 2021 ergeben die Eurostat-Indizes für Chemie −21,4 %, die Größenordnung „−20 %“ passt also auch dort. Die Kernaussage steht, die Konfidenz ist aber **B** (eine Quelle für die R21-Basis), nicht A.
3. **Konfidenz A ohne zweite unabhängige Quelle** (KA 3, KA 5, sechs A-Parameter). Alle Werte stammen allein aus Eurostat. Das Dossier räumt das selbst ein. Nach REGELN ist das Stufe B. Die Werte sind exakt reproduziert; an der Sache ändert die Herabstufung nichts.
4. **KA 6 EEG:** Die 21,985 Mrd. € „Ausgaben des Kontos 2024“ sind ein anderer Begriff als der Bundeszuschuss und nicht belegt. Belegt ist der Zuschuss 2024 mit 18,49 Mrd. € (Haushaltsansatz 10,60). Damit liegt die Last 2024 höher als die im Dossier genannten 16,5 (2025) und 17,2 (Ansatz 2026). Konfidenz C → B für Ansatz und Prognose.
5. **KA 9 lässt den mittleren Wert der KfW-Studie weg.** Neben brutto 270–300 und klimabedingtem Mehrbedarf 135–153 Mrd. €/Jahr nennt dieselbe Zusammenfassung 160–220 Mrd. €/Jahr „zusätzlichen Investitionsbedarf gegenüber dem Status quo“. Wer die R21-Zahl einordnet, sollte alle drei Abgrenzungen zeigen. Kleinigkeit: Der Faktor R21 gegen KfW ist 1,7 bis 2,6 (690/270 = 2,56), nicht 2,5. Die KfW-Summe gilt für 21 Jahre (2025–2045), die R21-Zahl wird im Dossier auf 20 Jahre verteilt.
6. **KA 3: Abstand zur EU halbiert.** Der Industriestrom-Abstand DE/EU27 lag 2019-S1 bei +25 % und 2026-S1 nur noch bei +12 %. Das Dossier nennt die Werte, aber nicht diese Verengung. Sie widerspricht R21 („höchste Energiekosten“) stärker als dargestellt. Der Satz zu Frankreich („Abstand vergrößert“, 1,26 → 1,50) gilt nur für Band IE. Im Band ID der Kernaussage 3 sank er von 1,57 auf 1,41. Die Richtung hängt am Verbrauchsband.
7. **Kleinigkeiten:** „Höchststand 2018“ stimmt für C20 und C17 nicht (2017). Im Haushalt ist die Jahres-Komponentensumme 2019 (28,8 ct) um 7 % niedriger als die Halbjahresreihe 2019-S1 (30,9 ct); die Tabellen 2.3 und 2.4 sind daher nicht direkt vergleichbar. KA 8 mischt bei Italien Weltbank (+6,4) und Eurostat (+7,4). C20-Wertschöpfung −8,2 statt −8,1 (Rundung).

## 4. Nachrechnungen

Code: `scripts/pruefung/p2_10_nachrechnung.py`. Er liest nur die in Phase 2 neu geladenen Dateien unter `quellen/raw/P2-10/`. Ausnahme: Weltbank-Werte aus den Phase-1-Rohdateien, weil api.worldbank.org bei mir zweimal nach 90 s ohne Antwort blieb. Die Ausgabe ist reproduzierbar mit `python3 -I scripts/pruefung/p2_10_nachrechnung.py`.

### 4.1 Industrieproduktion (Eurostat sts_inpr_a, Stand 19.11.2026)

| Größe | Dossier | Nachrechnung | Abweichung |
|---|---|---|---|
| DE B–D 25 vs. 19 / 18 | −12,2 / −15,0 | −12,2 / −15,0 | 0 % |
| DE C, C20, C24, C17, C23, C29 vs. 2019 | −11,3 / −17,9 / −15,6 / −18,2 / −20,0 / −16,3 | identisch | 0 % |
| EU27 C, C20, C24, C17, C23 | +2,7 / −16,0 / −12,2 / −6,5 / −10,8 | identisch | 0 % |
| FR / IT / ES / PL C | −3,8 / −6,1 / −0,3 / +27,5 | identisch | 0 % |
| EU27 C ohne IE (neu) | – | ≈ −1,4 % | – |
| EU27 C ohne IE und DE (neu) | – | ≈ +4,0 % | – |
| DE reale Wertschöpfung C 2025 vs. 2019 (aus `data/p1_10_branchen_beschaeftigung_bws_de.csv`) | −4,5 % | −4,5 % | 0 % |

Bemerkenswert und im Dossier nur am Rand: Produktionsindex C −11,3 %, reale Wertschöpfung C nur −4,5 %. Die R21-Zahl „Industrieproduktion −15 %“ beschreibt Mengen, nicht Wertschöpfung. Die Bundesbank-Modellwirkung (−4,4 % Industrie-Wertschöpfung) liegt in der Größenordnung des beobachteten Wertschöpfungsrückgangs. Das ist ein Hinweis, aber keine Zuschreibung.

### 4.2 Energiepreise (nrg_pc_203/204/205, Stand 19.10.2026)

Alle Tabellenwerte der Dossier-Abschnitte 2.3 (Industriestrom ID und IE, Haushaltsstrom, Industriegas) stimmen auf 0,1 ct/kWh. Verhältnisse: DE/EU Industrie ID 1,254 (2019-S1), 1,204 (2025-S2), 1,117 (2026-S1). DE/EU Haushalt 1,377 (2010-S1), 1,424 (2019-S1), 1,278 (2026-S1). Halbjahre mit DE ≤ EU27 beim Haushaltsstrom: keines (bestätigt „in allen Halbjahren über dem EU-Schnitt“). Abweichung 0 %.

### 4.3 Strompreis-Komponenten (nrg_pc_204_c, nrg_pc_205_c)

Eurostat-Position `TAX_FEE_LEV_CHRG` enthält die MwSt. Das Dossier hat sie korrekt abgezogen. Alle Werte der Tabellen in Abschnitt 2.4 sind bestätigt (Abweichung ≤ 0,05 ct). Veränderung 2019 → 2025: Haushalt Netz +3,90 ct, Industrie +2,41 ct, bestätigt.

### 4.4 „Als einziges Industrieland“ (Ember, 46 Länder aus OECD und G20)

| Land | fossil 2005 → 2024, TWh | Kernenergie | Erneuerbare | Gesamt | Ersatzquote −Δ(fossil+Kern)/ΔEE |
|---|---|---|---|---|---|
| Deutschland | 386,9 → 205,1 (−47 %) | 163,1 → 0 | 63,4 → 286,7 | 613 → 492 | 1,54 |
| Großbritannien | 299,8 → 99,7 (−67 %) | 81,6 → 40,6 | 16,9 → 144,2 | 398 → 284 | **1,89** |
| Japan | 757,2 → 699,1 (−8 %) | 293,0 → 84,9 | 102,8 → 230,9 | 1.153 → 1.015 | 2,08 (Rückgang durch Nachfrage) |
| Spanien | 189,7 → 65,3 (−66 %) | 57,5 → 54,5 | 42,3 → 161,1 | 289 → 281 | 1,07 |
| Italien | 246,2 → 133,3 (−46 %) | 0 | 48,4 → 134,2 | 295 → 268 | 1,32 |
| Frankreich | 62,6 → 28,7 (−54 %) | 451,5 → 380,4 | 55,0 → 155,4 | 569 → 564 | 1,05 |
| USA | 2.900 → 2.553 (−12 %) | 782 → 782 | 353 → 1.057 | 4.035 → 4.391 | 0,49 |
| Südkorea | 238,6 → 373,3 (+56 %) | 146,8 → 188,8 | 4,1 → 65,7 | 389 → 628 | negativ (zusätzlich) |
| China | 2.043 → 6.250 | 53 → 451 | 404 → 3.324 | 2.500 → 10.025 | negativ (zusätzlich) |

27 der 46 Länder haben 2024 weniger als 90 % ihrer fossilen Erzeugung von 2005 und mehr Erneuerbare. Halbiert oder stärker gesunken ist die Kernenergie in Deutschland, Japan, Großbritannien und Litauen. Ergebnis: Die R21-Aussage ist widerlegt. Großbritannien ersetzt relativ sogar mehr. Was Deutschland heraushebt, ist allein der **vollständige** Kernenergieausstieg. Die Ember-Gesamtwerte für DE (613/492 TWh) weichen von Eurostat GEP (623/514) um 2–4 % ab (netto gegen brutto). Das Urteil hängt daran nicht. Die Formulierung im Dossier „Japan, Belgien und die UK haben teilweise reduziert“ untertreibt den britischen Fall.

### 4.5 Weitere Rechnungen

R21-Vielfache: 10 / 4,5297 = 2,21; 13,8 / 4,5297 = 3,05 (Dossier 2,2–3,0, bestätigt). Gleichverteilt über 20 Jahre: 11,0–15,2 % des BIP 2025 und 54,6–75,4 % der Bruttoanlageinvestitionen (bestätigt). KfW in % des BIP 5,96–6,62 und 2,98–3,38; in % der Investitionen 29,5–32,8 und 14,8–16,7 (bestätigt).

## 5. Einseitigkeit und fehlende Gegenpositionen

In Richtung „Energiewende entlasten“:
- KA 2 wählt die Zweige aus, in denen die EU ähnlich fiel; die deutlich deutschen Rückgänge (Papier, Glas) bleiben im Hintergrund, das EU-Aggregat ist durch Irland geschönt (siehe 3.1).
- KA 2 und 2.2 nutzen den Kfz-Rückgang als Hinweis, „dass nicht nur Energiekosten wirken“. Die naheliegende Gegenposition fehlt: Ein Teil der Kfz-Schwäche hängt selbst mit Klimapolitik zusammen (Flottengrenzwerte, Umstieg auf E-Autos, Wettbewerb chinesischer E-Autos). Ein Beleg dafür liegt in diesem Dossier nicht vor. Die Aussage sollte offen formuliert sein. Auffällig auch: Kfz-Produktion −16 %, reale Kfz-Wertschöpfung 2024 aber +5,9 % gegen 2019. Der Index ist hier ein schwacher Indikator.
- Die Bundesbank nennt einen Mechanismus, den R21 meint und das Dossier nicht aufgreift: Teile des Kapitalstocks werden „obsolet, wenn energieintensive Anlagen bei hohen Energiekosten nicht mehr rentabel sind“. Das ist eine Verdrängung bzw. Entwertung, wie sie das Dossier unter 2.7 vergeblich gesucht hat. Sie betrifft allerdings den Gaspreisschock, nicht die Energiewende-Investitionen.
- Die KfW nennt als Hintergrund die Abhängigkeit von russischem Gas (rund die Hälfte des Erdgases 2021, Fn. 1). Ob der Kernenergieausstieg diese Abhängigkeit erhöht hat, ist eine naheliegende R21-These. Das Dossier spricht sie nicht an; sie gehört eher in Dossier 09.

In Richtung „R21 stützen“:
- KA 1 übernimmt die KfW-Zahl als Beleg für R21s Basis, obwohl sie eine andere Basis hat (siehe 3.2).
- R21s Satz „Industrieproduktion −15 %“ bezieht sich auf Mengen. Die reale Wertschöpfung des Verarbeitenden Gewerbes sank nur um 4,5 %. Das gehört als Gegenposition in die Kernaussage, nicht nur in 2.6.
- Der Industriestrom-Abstand zur EU hat sich von +25 % auf +12 % halbiert (2026-S1). Das schwächt R21s „höchste Energiekosten aller Industriestaaten“ noch mehr, als das Dossier schreibt.
- Der SVR hält fest: Energiekosten machen für die meisten Branchen 2–5 % der Kosten aus, beim Median-Unternehmen 1,6 % vom Umsatz. Er erwartet keine breite Deindustrialisierung und empfiehlt, den Ausbau der Erneuerbaren zu forcieren. Die Energiekostenanteile im Dossier (Statista 2006: 20–25 % der Wertschöpfung) stammen aus einer anderen Bezugsgröße und sind veraltet. Sie wirken dramatischer als die SVR-Primärdaten.

## 6. Weiterhin nicht erreichbar

| Host | Dokument | Wirkung |
|---|---|---|
| www.ifo.de | Schnelldienst 6/2024, Schaller/Schasching „Energieintensive Industrie unter Druck“ | Browser-Prüfung, nicht umgangen. Ex-post-Anteil der Energiepreise bleibt offen |
| api.worldbank.org | Neuabruf NY.GDP.MKTP.KD, BX/BM.KLT.DINV | Timeout zweimal; Nachrechnung mit Phase-1-Rohdateien |
| www.netztransparenz.de (nicht freigegeben) | EEG-Konto Ist 2025, Prognose 2026 (12,4 Mrd. €) | Ist 2025 nur aus Fachpresse |
| www.iwkoeln.de, www.ifw-kiel.de, about.bnef.com, www.iea.org (nicht freigegeben) | IW-Kostenstruktur, BNEF/IEA-Preise USA/China | bleiben C |

## 7. Korrekturen

```json
{
  "dossier": "10_wirtschaftslage",
  "pruefung": "P2-10",
  "stand": "2026-11-22",
  "korrekturen": [
    {"id": "kernaussage_1_konfidenz", "alt": "Konfidenz A (Eurostat, KfW-Kapitel 3: etwa 80 % des Vorkrisenniveaus)", "neu": "Konfidenz B; KfW-Zahl bezieht sich auf das Niveau vor der Energiekrise (Index Jan 2021 = 100, fünf Zweige inkl. C19), nicht auf die R21-Basis 'vor 2020'", "fundstelle": "KfW Research, Kap. 3 Industriepapier Nov. 2025, S. 1 (Grafik 3.2), S. 2, S. 3", "confidence": "B", "primaer_gelesen": true, "begruendung": "Keine zweite unabhängige Quelle für die Basis 2019; Abgrenzung der KfW-Zahl verschieden"},
    {"id": "kernaussage_1_hoechststand", "alt": "gegenüber dem Höchststand 2018: −20 bis −21 %", "neu": "gegenüber 2018: −19,9 % (Papier) bis −21,1 % (Glas/Keramik); Höchststand bei Chemie und Papier war 2017", "fundstelle": "Eurostat sts_inpr_a, I21, CA, Stand 19.11.2026", "confidence": "B", "primaer_gelesen": true, "begruendung": "Spanne und Jahr präzisiert"},
    {"id": "kernaussage_2_darstellung", "alt": "EU27: Chemie −16,0 %, Metall −12,2 % … Verarbeitendes Gewerbe EU27 +2,7 %", "neu": "zusätzlich Papier EU27 −6,5 % (DE −18,2 %), Glas/Keramik EU27 −10,8 % (DE −20,0 %); EU27 C ohne Irland ≈ −1,4 % (ohne IE und DE ≈ +4,0 %, Näherung mit Wertschöpfungsgewichten 2021); Frankreich Metall −24,6 %, Glas/Keramik −18,7 %", "fundstelle": "Eurostat sts_inpr_a; nama_10_a64 B1G CP_MEUR 2021 (IE 7,1 %, DE 31,5 % der EU27-Wertschöpfung C)", "confidence": "B", "primaer_gelesen": true, "begruendung": "Selektive Zweigauswahl; Irland (C +85,8 % ggü. 2019) verzerrt das EU-Aggregat; Lücke 12 damit geschlossen"},
    {"id": "de_industriestrom_id_2026s1_ct_kwh", "alt": "confidence A", "neu": "confidence B (Wert 17,42 bestätigt)", "fundstelle": "Eurostat nrg_pc_205, MWH2000-19999, X_VAT, 2026-S1", "confidence": "B", "primaer_gelesen": true, "begruendung": "Nur eine Quelle; REGELN verlangen für A mehrere unabhängige"},
    {"id": "de_haushaltsstrom_2026s1_ct_kwh", "alt": "confidence A", "neu": "confidence B (Wert 36,18 bestätigt)", "fundstelle": "Eurostat nrg_pc_204, KWH2500-4999, I_TAX, 2026-S1", "confidence": "B", "primaer_gelesen": true, "begruendung": "Nur eine Quelle"},
    {"id": "de_industriegas_i3_2026s1_ct_kwh", "alt": "confidence A", "neu": "confidence B (Wert 6,82 bestätigt)", "fundstelle": "Eurostat nrg_pc_203, GJ10000-99999, X_VAT, 2026-S1", "confidence": "B", "primaer_gelesen": true, "begruendung": "Nur eine Quelle"},
    {"id": "de_strompreis_haushalt_beschaffung_2019_2023_2025_ct", "alt": "confidence A; min/mid/max 5,81/19,92/14,81", "neu": "confidence B; Werte bestätigt; Zeitreihe besser als eigene Felder (v2019, v2023, v2025) statt min/mid/max", "fundstelle": "Eurostat nrg_pc_204_c NRG_SUP", "confidence": "B", "primaer_gelesen": true, "begruendung": "Nur eine Quelle; Bandbreiten-Schema missverständlich (mid > max)"},
    {"id": "de_strompreis_haushalt_netz_2019_2025_ct", "alt": "confidence A", "neu": "confidence B (7,40 / 11,30 bestätigt)", "fundstelle": "Eurostat nrg_pc_204_c NETC", "confidence": "B", "primaer_gelesen": true, "begruendung": "Nur eine Quelle"},
    {"id": "de_strompreis_haushalt_eeg_position_2021_2025_ct", "alt": "confidence A; min 6,75 max 0,28", "neu": "confidence B; Werte bestätigt; Schema wie oben (min > max)", "fundstelle": "Eurostat nrg_pc_204_c TAX_RNW", "confidence": "B", "primaer_gelesen": true, "begruendung": "Nur eine Quelle"},
    {"id": "eeg_bundeszuschuss_2025_mrd_eur", "alt": "16,5 (C, Suchtreffer IHK); 2026 Haushalt 17,2; 2024 Ausgaben Konto 21,985", "neu": "Prognose 2025 16,53 (ÜNB, Drs. 20/14522 S. 2); Haushaltsansatz 2025 und 2026 je 17,2 Mrd. €, ab 2025 im Kernhaushalt (Drs. 21/601 S. 29); Ist 2024 18,49 Mrd. € bei Ansatz 10,60 (Drs. 20/14522 S. 1); 21,985 nicht belegt; Ist 2025 nur Fachpresse", "fundstelle": "BT-Drs. 20/14522 (Antwort der Bundesregierung), S. 1–2; BT-Drs. 21/601 Finanzplan 2025–2029, S. 29", "confidence": "B", "primaer_gelesen": true, "begruendung": "Primärquelle jetzt gelesen; Ist 2024 höher als die im Dossier genannten Werte"},
    {"id": "eeg_bundeszuschuss_2024_mrd_eur", "alt": "fehlt", "neu": "18,49", "fundstelle": "BT-Drs. 20/14522, S. 1", "confidence": "B", "primaer_gelesen": true, "begruendung": "Neuer Parameter: tatsächliche Überweisung aus dem Bundeshaushalt 2024"},
    {"id": "kernaussage_3_abstand_eu", "alt": "Vor der Krise +25 %; 2025-S2 +20 %", "neu": "ergänzen: 2026-S1 +11,7 % (17,42 gegen 15,59); DE/FR im Band ID 1,57 (2019-S1) → 1,41 (2026-S1), im Band IE 1,26 → 1,50", "fundstelle": "Eurostat nrg_pc_205, X_VAT", "confidence": "B", "primaer_gelesen": true, "begruendung": "Verengung des Abstands und bandabhängige Richtung zu Frankreich nicht dargestellt"},
    {"id": "kernaussage_9_kfw", "alt": "270–300 brutto; 135–153 Mehrbedarf; Faktor R21/KfW 1,7–2,5", "neu": "zusätzlich 160–220 Mrd. €/Jahr Mehrbedarf gegenüber Status quo; Preisbasis €2024; Zeitraum 2025–2045 (21 Jahre); Faktor 1,7–2,6", "fundstelle": "KfW/Prognos, Investitionen für Klimaschutz, Endbericht Juni 2026, Zusammenfassung S. 1", "confidence": "B", "primaer_gelesen": true, "begruendung": "Dritte Abgrenzung derselben Studie fehlt; Rundung"},
    {"id": "kernaussage_10_ember", "alt": "Absolutmengen für UK/USA/JP/KR fehlen; UK 'teilweise reduziert'", "neu": "Ember 2005→2024: UK fossil 299,8→99,7 TWh, Kern 81,6→40,6, EE 16,9→144,2, gesamt 398→284; Ersatzquote UK 1,89 gegen DE 1,54; JP Kern 293→85 TWh; KR und CN fossil steigend", "fundstelle": "Ember, release_generation_yearly_global.csv (abgerufen 22.11.2026), Generation (TWh)", "confidence": "A", "primaer_gelesen": true, "begruendung": "Zweite unabhängige Quelle neben Eurostat; Urteil 'einziges Industrieland stimmt nicht' bestätigt und verschärft"},
    {"id": "bundesbank_energiepreis_wertschoepfung_industrie_pct", "alt": "Lücke (Zahl nicht im Treffer)", "neu": "−4,4 % Bruttowertschöpfung Industrie (direkt), Gesamtwirtschaft −2,1 %, bei dauerhaft mehr als verdoppelten Energiepreisen ggü. 2019; Modellrechnung ex ante, hohe Unsicherheit", "fundstelle": "Deutsche Bundesbank, Monatsbericht Dezember 2022, S. 29–30, Kasten und Tabelle 'Direkte und indirekte Angebotseffekte'", "confidence": "B", "primaer_gelesen": true, "begruendung": "Primärdokument jetzt gelesen; keine Ex-post-Zerlegung des beobachteten Rückgangs"},
    {"id": "svr_energiekostenanteil", "alt": "IW 2020 3,3–4,9 % BPW; Statista 2006 20–25 % BWS (C)", "neu": "SVR: 2–5 % der Gesamtkosten für die meisten Bereiche; Median-Unternehmen 1,6 % vom Umsatz (Mittel 2,3 %); Keramik 8,1 % vom Umsatz; Grundstoffchemie 7,5 % der Materialkosten; Daten AFiD 2018; 'keine breite Deindustrialisierung'", "fundstelle": "Sachverständigenrat, Jahresgutachten 2022/23, Kap. 5, Wichtigste Botschaften und Ziffer 318 (S. 251)", "confidence": "B", "primaer_gelesen": true, "begruendung": "Primärquelle ersetzt Suchtreffer; Statista-Bezug (2006, Wertschöpfung) veraltet und nicht vergleichbar"},
    {"id": "kernaussage_1_wertschoepfung", "alt": "nicht in der Kernaussage", "neu": "ergänzen: reale Wertschöpfung Verarbeitendes Gewerbe 2025 vs. 2019 −4,5 % gegen Produktionsindex −11,3 %", "fundstelle": "Eurostat nama_10_a64 (data/p1_10_branchen_beschaeftigung_bws_de.csv), sts_inpr_a", "confidence": "B", "primaer_gelesen": true, "begruendung": "Gegenposition zu R21 'Industrieproduktion −15 %': Mengen- und Wertschöpfungsrückgang klaffen weit auseinander"}
  ]
}
```
