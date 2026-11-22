# Prüfbericht 04 · Gesamtenergiesystem: Ist-Bilanz und Bedarfspfade

Stand 22.11.2026 · Phase 2, Auftrag P2 (Gegenprüfung) · Prüfer: Opus, nicht
Autor des Dossiers · geprüftes Dossier: `research/04_energiesystem_bedarf.md` ·
Manifest: `quellen/manifest_P2-04.json` · eigener Code:
`scripts/pruefung/p2_04_eurostat.py`, `scripts/pruefung/p2_04_nachrechnung.py`.

Arbeitsweise: Jede Zahl wurde im Originaldokument nachgeschlagen. Eurostat wurde
neu abgefragt (eigene Abfrage, Datenbankstand 27.08.2026); die AG Energiebilanzen
(AGEB) ist jetzt erreichbar und wurde als zweite, unabhängige Bilanz gelesen. Für
die übrigen Studien wurden die PDF-Originale aus `quellen/raw/P1-04/` erneut mit
`pdftotext` Seite für Seite gelesen, nicht die `.txt`-Auszüge des Dossiers. Die
Grafiken der UBA-Präsentation (Folien 4 und 14) wurden als Bild gelesen.

## 1. Urteil in fünf Zeilen

1. Das Dossier ist **zahlenseitig sehr belastbar**: Von 73 geprüften Werten stehen
   66 an der Fundstelle (11 davon mit Abgrenzungshinweis); Eurostat, Studien, WD-Gutachten und UBA stimmen bis auf Rundung.
2. Die Schwächen liegen in **Abgrenzung und Deutung**, nicht in Tippfehlern: „niedrigster
   Wert seit der Wiedervereinigung“ gilt nur nach Eurostat, nicht nach AGEB; die AGEB-Werte 2025
   (Endenergie +1,8 %, Primärenergie revidiert auf +0,5 %) fehlen.
3. Eine **erklärte Lücke ist keine**: Die Prozesswärme nach Temperaturniveau steht in einer Quelle,
   die das Dossier selbst hatte (UBA V 1.4, Folie 14) – 63 % liegen über 500 °C.
4. Die **Aufteilung Pkw/Lkw im Straßenverkehr** (407 / 142 TWh) weicht stark von der AGEB ab
   (Pkw 351, Güter + ÖPNV 215 TWh); der Lkw-Rest ist rund 50 % zu niedrig.
5. Der LFS3-Widerspruch für 2030 bleibt **nicht prüfbar** (BMWK-Seite mit Browser-Prüfung,
   langfristszenarien.de nicht freigegeben); dena-Zahlen und Expertenrat sind jetzt primär belegt.

## 2. Prüftabelle

Ergebnis: **b** = bestätigt · **b*** = bestätigt, aber Abgrenzung oder Darstellung schief
(siehe Abschnitt 3) · **abw** = abweichend · **n. p.** = nicht prüfbar.
Spalte „neu“: empfohlene Konfidenz / `primaer_gelesen`.

### 2.1 Kernaussagen und ihre Zahlen

| # | Parameter-ID / Aussage | Wert im Dossier | geprüfte Fundstelle | Ergebnis | neu |
|---|---|---|---|---|---|
| 1 | ist_eev_de_2024_eurostat (K1) | 2.067,2 TWh | Eurostat nrg_bal_c, FC_E TOTAL 2024 (eigene Abfrage): 2.067,18 | b | B / true |
| 2 | ist_eev_de_2024_inkl_intavi (K1) | 2.170,4 TWh | FC_E + INTAVI (103,24): 2.170,42 | b | B / true |
| 3 | ist_eev_de_2008_eurostat (K1) | 2.424 TWh | FC_E 2008: 2.423,5 | b | B / true |
| 4 | Rückgang 2008–2024 (K1) | −15 % | Nachrechnung: −14,7 % | b | B / true |
| 5 | „2024 niedrigster Wert seit der Wiedervereinigung“ (K1) | – | Eurostat FC_E 1990–2024: Minimum 2024 (2.067,2) → stimmt. AGEB Tab. 2.2 (S. 11): EEV 2023 8.123 PJ < 2024 8.141 PJ; 2025: 8.288 PJ | **abw** (nur in Eurostat-Abgrenzung wahr) | B / true |
| 6 | ist_eev_de_2024_ageb_abgeleitet (K1) | 2.259 TWh | AGEB Auswertungstabellen 09/2026, Tab. 2.2 (S. 11): 8.141 PJ = 2.261,4 TWh | b (−0,1 %) | **A** / true |
| 7 | ist_pev_de_2024_eurostat_gae | 2.937,5 TWh | GAE TOTAL 2024: 2.937,55; AGEB Tab. 2.1: 10.571 PJ = 2.936,4 TWh | b | A / true |
| 8 | ist_pev_de_2025_ageb_pj | 10.530 PJ | AGEB-Jahresbericht 2025 (Stand 28.05.2026), S. 3 und 57: 10.530 PJ (−0,4 %). **Revidiert** in Auswertungstabellen 09/2026, Tab. 2.1 (S. 10): **10.628 PJ (+0,5 %)** | **abw** (überholt) | B / true |
| 9 | Fossiler Anteil Endenergie 61 % (K2) | 61 % | Nachrechnung Eurostat: 60,9 % (Öl+Gas+Kohle ohne Kuppelgase); mit Kuppelgasen 62,2 %. AGEB Tab. 6.1 (S. 20): 64,6 % | b* | B / true |
| 10 | Öl 705,9 · Gas 523,7 · Kohle 28,4 (K2) | TWh | FC_E 2024: 705,93 · 523,68 · 28,44 | b | B / true |
| 11 | ist_eev_2024_traeger_strom (K2) | 471,8 TWh, 23 % | FC_E E7000: 471,79 = 22,8 %; AGEB 1.668 PJ = 20,5 % | b | B / true |
| 12 | Direkte EE 197 (10 %), Fernwärme 101 (5 %) (K2) | – | FC_E RA000 196,5 (9,5 %); H8000 101,0 (4,9 %) | b | B / true |
| 13 | Verkehr 90 % Öl (K2) | 90 % | FC_TRA_E: 90,3 % | b | B / true |
| 14 | THG 2025 (K3) | 648,9 Mt | UBA-Hintergrundpapier 14.03.2026, S. 1 und 2; ERK Drs. 21/6175, S. 19 | b | **A** / true |
| 15 | Veränderung 2025 (K3) | −0,1 % | UBA S. 1; ERK S. 19 | b | A / true |
| 16 | THG 2025 gegen 1990 (K3) | rund −48 % | in keiner Quelle wörtlich; Nachrechnung über ERK S. 57 (438,6 Mt = −65 %) → Basis 1.253 Mt → −48,2 % | b (rechnerisch) | B / true |
| 17 | Sektorveränderungen (K3) | Ind −5,7 · Geb +3,4 · Verk +2,1 | UBA S. 1 (−5,7) bzw. S. 5 (−5,6), S. 6, S. 7; ERK S. 19 (−5,6) | b | A / true |
| 18 | Verkehr 146 / Gebäude 103 Mt über Jahresmenge (K3) | 146,3 / 103,4 | UBA S. 6–7: 146,3 (Menge 117), 103,4 (Menge 90,1) | b | A / true |
| 19 | Abstand zur angepassten Gesamtmenge | −12,7 Mt | UBA S. 2: „rund 12,5“; Differenz 648,9 − 661,6 = −12,7 | b | B / true |
| 20 | Expertenrat bestätigt Daten 2025 | Suchtreffer (C) | ERK Drs. 21/6175 S. 19: „keinen Grund, von anderen Emissionswerten auszugehen“ | b | **B** / **true** |
| 21 | Expertenrat: Budget 2030 überschritten | „60–100 Mt; anderer Treffer 30 Mt“ (C) | ERK S. 22: 50/50-Pfad 60–100 Mt über dem **kumulierten** Budget 2021–2030; S. 57: Lücke **im Jahr 2030** 29,8 Mt (−63 % statt −65 %) – zwei verschiedene Größen | b* | **B** / **true** |
| 22 | KSG-Gesamtmenge 2021–2030 | rund 6.200 Mt (C) | ERK S. 20: 6.199 Mt (§ 4 i. V. m. Anlage 2 KSG); Projektion 6.194 Mt, Puffer 4,5 Mt (UBA: 3,8 Mt) | b | **B** / **true** |
| 23 | thg_ksg_ziel_2030 | 65 % | UBA-Seite Abschnitt 5; UBA-Hintergrundpapier S. 1; ERK S. 57 | b | A / true |
| 24 | Ariadne 2045 (K4) | 1.037–1.423 TWh | Ariadne-Report 03/2025, PDF S. 20 | b | A / true |
| 25 | Agora 2045 (K4) | 1.267 TWh | Agora KNDE Szenariopfade, PDF S. 46 (Kernindikatoren) | b | A / true |
| 26 | ISE 2045 (K4) | 1.227–1.544 TWh | ISE „Wege …“, PDF S. 33 | b | A / true |
| 27 | NEP 2045 (K4) | 989–1.294 TWh | NEP V2025 2. Entwurf, Kurzfassung S. 5 | b | A / true |
| 28 | strom_2037_nep | 866–1.087 TWh | Kurzfassung S. 5 | b | A / true |
| 29 | ist_bruttostrom_2024 (K4) | 518 TWh | Kurzfassung S. 5, Fn. 1 (BDEW-Jahresbericht); AGEB Strerz 09/2026: 523,1 (ohne Pumpspeicher) / 529,4 (mit) | b* | A / true |
| 30 | Faktor 2045 gegen 2024 (K4) | „Zwei- bis Dreifache“ | Nachrechnung 989/518 = 1,91; 1.544/518 = 2,98 | b | – |
| 31 | strom_2045_studien (mid) | 1.250 | Median der Studienmitten 1.230 / 1.267 / 1.385,5 / 1.141,5 = 1.248,5 | b | A / true |
| 32 | strom_2030_studien | 600 / 730 / 807 | Median der Mitten Ariadne/Agora/ISE 729,5; min 600 ist Monitoring, keine Studie | b* | A / true |
| 33 | strom_2030_monitoring_2025 (K5) | 600–700 | WD 5-050-26 S. 9 (Antwort Bundesregierung), S. 11 (BDEW) | b | A / true |
| 34 | Frühere Planungsgröße 750 (K5) | 750 | WD S. 7 (Monitoringbericht 2023), S. 10 (BNetzA-Zielszenario) | b | A / true |
| 35 | Studien 2030 (K5) | 670–807 | ISE S. 33 (670–789); Ariadne S. 20 (681–807); Agora S. 46 (727) | b | A / true |
| 36 | strom_ist_2017 (K10) | 602 TWh | WD S. 10; AGEB Strerz: 601,9 (mit PSE) / 595,9 (ohne) | b* | A / true |
| 37 | strom_ist_2024_bundesregierung (K5, K10) | 522 TWh | WD S. 10; AGEB: 523,1 (ohne PSE) / 529,4 (mit PSE) | b* | A / true |
| 38 | Ist 2025 (K5) | 512–526 TWh | AGEB Strerz 09/2026: 522,4 (ohne PSE) / 529,3 (mit PSE); Jahresbericht S. 57: 528,4 | **abw** (obere Grenze zu niedrig) | A / true |
| 39 | NEP-Korrektur gegen 2023 (K10) | −50 (2037) / −120 (2045) | Kurzfassung S. 5: „insbesondere in den A-Szenarien“ | b* | A / true |
| 40 | BEE rund 700 TWh, BNetzA 750/675 (K10) | – | WD S. 10–11 | b | A / true |
| 41 | Ariadne H₂ 2045 (K6) | 175–420 TWh | Ariadne PDF S. 64: 175–350 (PyPSA-DE, REMIND), 330–420 (REMod) | b | B / true |
| 42 | Ariadne Derivate (K6) | 85–165 TWh | PDF S. 64 | b | B / true |
| 43 | Mindestimport (K6) | 160–200 TWh | PDF S. 64 | b | B / true |
| 44 | Agora H₂ 268, PtL 155, Import 339 (K6) | TWh | Agora PDF S. 29 | b | B / true |
| 45 | ISE 244 Import + 126 heimisch (K6) | TWh | ISE PDF S. 5 | b | B / true |
| 46 | Import E-Fuels | 100–130 TWh | Ariadne S. 8: 100–130; S. 64: 100–125 | b* | B / true |
| 47 | Prozesswärme 407,0 TWh = 67 % (K7) | – | UBA V 1.4, Folie 4 (Grafik): 407,0 TWh, 67,0 % von 608 TWh | b | B / true |
| 48 | Strom 30,7 TWh = 7,5 %; Stagnation seit 2020 (K7) | – | Folie 9 | b | B / true |
| 49 | „Prozesswärme nach Temperatur nicht aufgeschlüsselt“ (K7, Lücke 2) | – | UBA V 1.4, **Folie 14** (Quelle HS Niederrhein 2024): < 100 °C 47,5 · 100–200 °C 79,7 · 200–500 °C 42,9 · 500–1.000 °C 107,2 · 1.000–1.500 °C 153,1 · > 1.500 °C 28,7 TWh/a | **abw** | B / true |
| 50 | jaz_bestand_luft_wasser (K8) | 2,6 / 3,4 / 4,9 | ISE-Presseinformation 03.11.2025 | b* | **B** / true |
| 51 | JAZ Erdreich (K8) | 3,6 / 4,3 / 5,4 | dto., 16 Anlagen | b | B / true |
| 52 | JAZ NEP (BNetzA) (K8) | 3,17–3,32 | Genehmigung Szenariorahmen, PDF S. 27, Tab. 2 | b | B / true |
| 53 | JAZ ÜNB-Entwurf (K8) | 3,6–3,8 | Szenariorahmenentwurf, Tabelle (3,6 / 3,8) | b | B / true |
| 54 | JAZ Agora (K8) | 3,5 / 4,0 | Agora PDF S. 89 | b | B / true |
| 55 | epkw_verbrauch_real (K9) | 15 / 18 / 25, „inkl. 17,5 % Ladeverlust“ | UBA TEXTE 160/2022 S. 12–13: 18 kWh/100 km, +15 % über WLTP; Ladeverluste 17,5 % **separat** ausgewiesen, im WLTP nur idealisiert enthalten | b* | A / true |
| 56 | pkw_verbrenner_verbrauch_flotte (K9) | 6,95 / 7,40 / 7,74 l | UBA-Excel (BMDV VIZ 2025/26 S. 309), 2024: 6,952 / 7,402 / 7,742 | b | A / true |
| 57 | Faktor ≈ 3,8 (K9) | 3,2 / 3,8 / 4,6 | Nachrechnung 69/21,5 = 3,21; 69/18 = 3,83; 69/15 = 4,60 | b | B / – |
| 58 | UBA-Wirkungsgrade BEV 75, FCEV 28, Diesel+PtL 21 % (K9) | – | UBA-FAQ „Wasserstoff im Verkehr“ | b | B / true |
| 59 | kernnetz_laenge | 9.040 km | BNetzA-Seite Kernnetz | b | A / true |
| 60 | kernnetz_kosten | 18,9 Mrd. € | dto. | b | A / true |

### 2.2 Stichprobe Konfidenz B (78 Parameter, k = 7, Start beim ersten)

| # | Parameter-ID | Wert im Dossier | Fundstelle | Ergebnis | neu |
|---|---|---|---|---|---|
| 61 | biomasse_2045_agora | 294 TWh | Agora PDF S. 28: „286 TWh 2020 und 294 TWh 2045“ | b | B / true |
| 62 | endenergie_rueckgang_ariadne_2015_2045 | 31–45 % | Ariadne PDF S. 22 | b | B / true |
| 63 | h2_2045_agora | 268 TWh | Agora PDF S. 29 (230 + 38) | b | B / true |
| 64 | ist_eev_2024_ghd | 276,8 TWh | FC_OTH_CP_E: 276,80 | b | B / true |
| 65 | ist_eev_2024_traeger_kohle | 28,4 TWh | FC_E C0000X0350-0370: 28,44 (ohne 26,9 TWh Kuppelgase) | b* | B / true |
| 66 | ist_eev_de_2024_inkl_intavi | 2.170,4 TWh | siehe Nr. 2 | b | B / true |
| 67 | ist_strom_eev_2008 | 528 TWh | FC_E E7000 2008: 527,76 | b | B / true |
| 68 | ist_verkehr_strasse_2024 | 549,5 TWh | FC_TRA_ROAD_E: 549,46 (Öl 509,2; Bio 30,1) | b | B / true |
| 69 | pkw_verbrenner_kwh_100km | 69 | 7,74 × 8,94 = 69,2; 6,95 × 9,97 = 69,3 | b | B / – |
| 70 | strom_2035_mckinsey_netto | 635 / 720 / 805 | WD S. 8 (Netto; 720 ist Setzung) | b | B / true |

### 2.3 Schwerpunkte und weitere Konfidenz-C-Werte

| # | Parameter-ID | Wert im Dossier | Fundstelle | Ergebnis | neu |
|---|---|---|---|---|---|
| 71 | strom_2030_lfs3 | 765–792 TWh | BMWK-Seite: Browser-Prüfung, nicht umgangen; langfristszenarien.de nicht freigegeben | **n. p.** | C / false |
| 72 | dena KN100 Strom 2030 / 2045 | 698 / 910 TWh (C) | EWI-Zusammenfassung dena-Leitstudie, 10/2021, PDF S. 5 | b | **B** / **true** |
| 73 | h2_2045_dena | 458 TWh (C) | dto., PDF S. 7 | b | **B** / **true** |
| 74 | ist_verkehr_lkw_bus_rest_2024 | 142 TWh (C) | AGEB Tab. 6.8 (S. 27): Güterverkehr 733 PJ = 203,6 TWh + ÖPNV 40 PJ = 11,1 TWh → **214,7 TWh** | **abw** | B / true |
| 75 | Pkw und Kombi 2024 | ≈ 407 TWh (Rechnung M) | AGEB Tab. 6.8: motorisierter Individualverkehr 1.265 PJ = **351,4 TWh** (inkl. Bio und Strom); Nachrechnung Dossier-Methode 407,0 (+15,8 %) | **abw** (Abgrenzung) | B / true |

Gezählt: 75 Zeilen, davon zwei Doppelungen (Nr. 66 = Nr. 2, Nr. 65 = Teil von Nr. 10) → **73 geprüfte Werte**: **66 bestätigt** (davon 11 mit Abgrenzungs- oder Darstellungshinweis b*), **6 abweichend** (Nr. 5, 8, 38, 49, 74, 75), **1 nicht prüfbar** (Nr. 71).

## 3. Abweichungen im Detail (nach Gewicht)

1. **Prozesswärme nach Temperatur liegt vor (Nr. 49).** Das Dossier führt sie als
   Lücke 2 und sagt in Kernaussage 7, sie sei „nicht aufgeschlüsselt“. Folie 14
   derselben UBA-Präsentation (Quelle: HS Niederrhein, Kurzstudie Energieeffiziente und
   CO₂-freie Prozesswärme, 2024) zeigt 459,1 TWh/a nach sechs Bereichen. Nur **27,7 %**
   liegen unter 200 °C (wärmepumpentauglich), **62,9 % über 500 °C**. Das ist die
   naheliegende Gegenposition zu „Elektrifizierung löst die Industrie“ und stützt
   den Molekül- und Importbedarf aus Kernaussage 6. Achtung Abgrenzung: Die Summe
   (459) ist eine andere Basis als die 407 TWh der Folie 4 (anderes Bezugsjahr bzw.
   Definition „Endenergiebedarf“, in der Folie nicht genannt).
2. **Straßenverkehr: Pkw zu hoch, Lkw zu niedrig (Nr. 74, 75).** Die Rechnung
   „Liter × Heizwert“ ergibt 407 TWh Pkw und als Rest 142 TWh für Lkw, Busse und
   Krafträder. Die AGEB weist 351 TWh MIV und 215 TWh Güter- plus öffentlichen Verkehr aus.
   Ursache vermutlich: Inländerfahrleistung (inkl. Auslandsstrecken deutscher Pkw)
   gegen Inlandsabsatz, dazu die Heizwert-Setzung; die Straße insgesamt ist bei Eurostat
   549,5, bei der AGEB 566,1 TWh. Für ein Lkw-Elektrifizierungsmodell würde der
   Dossierwert den Strombedarf der Lkw um rund ein Drittel unterschätzen.
3. **AGEB 2025 fehlt, und sie läuft gegen die Erzählung vom stetigen Rückgang
   (Nr. 5, 8, 38).** Nach den Auswertungstabellen 09/2026 stieg 2025 die Endenergie um
   1,8 % auf 8.288 PJ (2.302 TWh) und die Primärenergie um 0,5 % auf 10.628 PJ. Der
   AGEB-Jahresbericht (Mai 2026) hatte noch −0,4 % und „tiefster Stand seit 1990“
   gemeldet; das gilt nach der Revision nicht mehr. Nach AGEB war 2023, nicht 2024, das
   Tief der Endenergie. Die Aussage „2024 niedrigster Wert seit der
   Wiedervereinigung“ stimmt nur in der Eurostat-Abgrenzung.
4. **Bruttostromverbrauch: Abgrenzungen gemischt (Nr. 29, 36–38).** 602 (2017) ist
   die AGEB-Zahl **mit** Pumpspeicher, 522 (2024) und 518 (NEP/BDEW) liegen bei der Größe
   **ohne**. Konsistent gerechnet fiel der Verbrauch 2017–2024 um 12,0 % (mit PSE:
   601,9 → 529,4) bzw. 12,2 % (ohne: 595,9 → 523,1), nicht um 13,3 %. Die Ist-Spanne
   2025 „512–526“ muss nach AGEB 522–529 heißen. Das ändert die Richtung nicht,
   verschiebt aber den Abstand zu 600–700 TWh um rund 7 TWh.
5. **E-Pkw „inkl. 17,5 % Ladeverlust“ (Nr. 55).** UBA TEXTE 160/2022 nennt 18 kWh/100 km
   als Realverbrauch und die Ladeverluste von 17,5 % gesondert; im WLTP seien sie nur
   unter idealen Bedingungen enthalten. Ob die 18 kWh netzseitig gelten, sagt die
   Quelle nicht eindeutig. Die UBA-FAQ setzt nur 10 % Ladeverlust an. Wird 18 kWh als
   batterieseitig gelesen, wären es netzseitig bis rund 21 kWh; der Faktor 3,8 sinkt
   dann auf rund 3,3.
6. **Fossilanteil 61 % (Nr. 9).** Die Rechnung lässt 26,9 TWh Kuppelgase (Hochofen-,
   Kokereigas, also Kohle) und 13 TWh nicht erneuerbare Abfälle außen vor. Mit
   Kuppelgasen 62,2 %; in der AGEB-Bilanz 64,6 %. Die Kernaussage stellt den fossilen
   Anteil leicht günstiger dar, als beide Bilanzen hergeben.
7. **Expertenrat (Nr. 21).** Die zwei Suchtreffer-Zahlen sind beide richtig, messen
   aber Verschiedenes: 60–100 Mt Überschreitung des kumulierten Budgets 2021–2030
   (ERK-Schätzung für einen 50/50-Pfad) gegen 29,8 Mt Lücke im Zieljahr 2030 (laut
   UBA-Projektion). Der Expertenrat hält zudem die Projektion für den Sektor
   Energiewirtschaft für „unterschätzt“, unter anderem wegen niedrigerer Volllaststunden der
   Erneuerbaren (+38,1 Mt, ERK S. 21) – das fehlt im Dossier.

Kleinere Punkte (ohne Auswirkung auf Kernaussagen): Agora beschreibt den
Gebäudestrom im Text als „konstant bei knapp 280 TWh“, die Kernindikatoren-Tabelle
(S. 46) zeigt 255 → 270 → 302 TWh – Widerspruch in der Quelle selbst, das Dossier
übernimmt den Text. Ariadne nennt E-Fuel-Importe auf S. 8 mit 100–130, auf S. 64 mit
100–125 TWh. ISE rechnet von einem Basiswert 2023 von 501 TWh (S. 33), die AGEB
nennt 515 / 520,5 TWh; die ISE-Steigerungsraten (+34 bis +57 %) sind deshalb nicht
auf die AGEB-Reihe übertragbar. Der Import grüner Moleküle entspricht 8–19 % der
früheren fossilen Importe (Dossier: „ein Zehntel bis ein Sechstel“).

## 4. Nachrechnungen

Code: `scripts/pruefung/p2_04_eurostat.py` (liest die eigene Eurostat-Abfrage) und
`scripts/pruefung/p2_04_nachrechnung.py` (Eingaben an der Fundstelle abgelesen).

| Rechnung im Dossier | Dossier | Nachrechnung | Abweichung |
|---|---:|---:|---:|
| Endenergie Eurostat 2024 | 2.067,2 | 2.067,18 | 0,0 % |
| Endenergie inkl. int. Luftverkehr | 2.170,4 | 2.170,42 | 0,0 % |
| Rückgang 2008–2024 | −15 % | −14,7 % | 0,3 Pp. |
| AGEB-EEV abgeleitet (607,6 / 0,269) | 2.259 | AGEB direkt 2.261,4 | −0,1 % |
| Fossilanteil Endenergie | 61 % | 60,9 % (wie Dossier) / 62,2 % (inkl. Kuppelgase) / 64,6 % (AGEB) | bis 3,6 Pp. |
| Median Strombedarf 2045 | 1.250 | 1.248,5 | +0,1 % |
| Median Strombedarf 2030 | 730 | 729,5 | +0,1 % |
| NEP-Mitte 2037 | 977 | 976,5 | 0,0 % |
| Faktor 2045 gegen 2024 | 2–3 | 1,91–2,98 | – |
| Rückgang Bruttostrom 2017–2024 | −13,3 % (602 → 522) | −12,0 % (AGEB einheitlich mit PSE) | 1,3 Pp. |
| Pkw-Endenergie 2024 | 407 | 407,0 (Methode); AGEB MIV 351,4 | +15,8 % gegen AGEB |
| Lkw/Bus/Rest 2024 | 142 | AGEB Güter + ÖPNV 214,7 | −33,9 % |
| Verbrenner-Pkw kWh/100 km | 69 | 69,2 / 69,3 | 0,3 % |
| Faktor Pkw | 3,2 / 3,8 / 4,6 | 3,21 / 3,83 / 4,60 | 0,0 % |
| THG 2025 gegen 1990 | −48 % | −48,2 % (Basis 1.253 Mt aus ERK S. 57) | 0,2 Pp. |
| Prozesswärme-Anteil am Industrie-EEV | 67 % | 67,0 % (407,0 / 607,6) | 0,0 % |
| Strom-Anteil an Prozesswärme | 7,5 % | 7,54 % | 0,0 % |
| Import grüner Moleküle / fossile Importe | 1/10–1/6 | 0,081–0,192 | Spanne weiter |
| Zusatz: Prozesswärme über 500 °C | – | 62,9 % von 459,1 TWh/a | neu |

## 5. Einseitigkeit und fehlende Gegenpositionen

In beide Richtungen:

- **Zu günstig für den Hauptpfad:** (a) Die Temperaturverteilung der Prozesswärme
  fehlt; sie zeigt, dass zwei Drittel der industriellen Wärme nicht mit Wärmepumpen
  und nur teuer direkt elektrisch zu decken sind. (b) Der Fossilanteil ist mit der
  engsten Abgrenzung gerechnet. (c) Die Wärmepumpen-JAZ 3,4 stammt aus einem
  Feldtest mit Hersteller- und Versorgerpartnern (77 betreute Anlagen); das ist kein
  repräsentativer Bestand. „A“ für die Größenordnung 3–4 ist vertretbar, für den Punktwert
  3,4 eher B; die Bundesnetzagentur rechnet mit 3,2–3,3. (d) Der Expertenrat
  sieht die Emissionsprojektion der Energiewirtschaft unter anderem wegen schwächerer
  Volllaststunden der Erneuerbaren als unterschätzt (ERK S. 21–22) – fehlt.
- **Zu ungünstig für den Hauptpfad bzw. zu einseitig in der Deutung:** (a) Abschnitt
  6.2 schreibt: „Die Datenlage widerlegt beides“ (nachholende Elektrifizierung,
  Einschätzung des Expertenrats). Ist-Daten bis 2025 können eine Projektion für 2030 nicht
  widerlegen; zudem betrifft die Expertenrats-Einschätzung die Emissionen, nicht den
  Stromverbrauch. Formulierung „die Ist-Daten stützen das bisher nicht“ wäre
  quellengerecht. (b) Der Lkw-Endenergieanteil ist zu niedrig angesetzt (Abschnitt 3,
  Nr. 2); das verkleinert den künftigen Strombedarf des Güterverkehrs.
- **Fehlende Lesart:** Die AGEB-Werte 2025 (Endenergie +1,8 %, vor allem Witterung und Verkehr)
  zeigen, dass der Rückgang nicht stetig ist. Die AGEB führt den Rückgang des
  Stromverbrauchs 2025 ausdrücklich auf die Produktion der energieintensiven Branchen
  zurück, gebremst durch Elektrifizierung (Jahresbericht S. 57) – das stützt die
  Deindustrialisierungs-Lesart in 6.2 mit einer zweiten Quelle.
- **Auftraggeber:** Das Dossier notiert sie korrekt. Ergänzen: EWI ist Gutachter der
  dena-Leitstudie (Auftraggeber dena), und das ISE-Feldtestprojekt wurde vom BMWE
  gefördert und mit Industriepartnern durchgeführt.

## 6. Weiterhin nicht erreichbar

| Host | Dokument | Grund |
|---|---|---|
| www.bundeswirtschaftsministerium.de | LFS3-Schlaglicht (04/2024), Monitoringbericht 09/2025 | Antwort ist eine Browser-Prüfung (Radware, „Verifying your browser“); nicht umgangen |
| langfristszenarien.de | LFS3-Ergebnisse T45/O45 2030 | nicht freigegeben, nicht versucht |
| umweltrat.de | SRU-CO₂-Budget | nicht freigegeben, nicht versucht |
| gesetze-im-internet.de | KSG Anlage 2a (Sektorziele 2030) | nicht freigegeben; Gesamtmenge über ERK Drs. 21/6175 belegt, Sektorwerte nicht |
| icct.org, now-gmbh.de, agora-verkehrswende.de | Lkw-Verbräuche | nicht freigegeben, nicht versucht |

Hinweis zum LFS3-Widerspruch (765–792 gegen 594–638 TWh 2030): Die Genehmigung des
Szenariorahmens (PDF S. 23) unterscheidet die älteren T45-Szenarien (2022/23) von den
O45-Orientierungsszenarien (2024). Eine naheliegende, **nicht belegte** Erklärung
ist, dass die beiden Zahlen aus verschiedenen Szenariofamilien oder Abgrenzungen (mit
oder ohne Elektrolyse) stammen. Bis zur Lektüre des Originals bleiben beide Werte C.

## Quellen dieser Prüfung

- Eurostat, nrg_bal_c, DE, eigene Abfragen 22.11.2026 (Datenbankstand 27.08.2026).
- AG Energiebilanzen: Auswertungstabellen zur Energiebilanz 1990–2025, Stand 09/2026;
  Jahresbericht „Energieverbrauch in Deutschland 2025“, Stand 28.05.2026;
  Bruttostromerzeugung nach Energieträgern, Stand 09/2026.
- Expertenrat für Klimafragen: Prüfbericht Emissionsdaten 2025 und Projektionsdaten 2026,
  BT-Drs. 21/6175 vom 18.05.2026 (dserver.bundestag.de).
- EWI: Zusammenfassung dena-Leitstudie Aufbruch Klimaneutralität, 10/2021 (Auftraggeber dena).
- Aus `raw/P1-04/` erneut gelesen: UBA-Hintergrundpapier 14.03.2026; UBA-Seiten
  Treibhausgase, Wasserstoff-FAQ; UBA V 1.4 (Folien 3, 4, 8, 9, 14); UBA TEXTE 160/2022;
  UBA-Excel Kraftstoffverbrauch; Ariadne-Report 03/2025; Agora KNDE 2024; ISE „Wege“
  2024 und Presseinformation 03.11.2025; NEP V2025 Kurzfassung und Kap. 3;
  Szenariorahmen-Entwurf und -Genehmigung; WD 5-050-26; BNetzA Kernnetz.
- Websuche (nur zur Fundortsuche): DUH-Auswertung LFS3; EWI-Seite dena-Leitstudie.

```json
{
 "pruefung": "04_energiesystem_bedarf",
 "stand": "2026-11-22",
 "geprueft": 73,
 "bestaetigt": 66,
 "abweichend": 6,
 "nicht_pruefbar": 1,
 "korrekturen": [
  {
   "id": "ist_pev_de_2025_ageb_pj",
   "alt": 10530,
   "neu": 10628,
   "fundstelle": "AGEB, Auswertungstabellen zur Energiebilanz Deutschland, Stand 09/2026, Tab. 2.1 (PDF S. 10); 10.530 PJ stand im Jahresbericht vom 28.05.2026, S. 3/57",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Spätere Revision; 2025 +0,5 % statt −0,4 % gegen 2024 (10.571 PJ)"
  },
  {
   "id": "ist_eev_de_2024_ageb_abgeleitet",
   "alt": 2259,
   "neu": 2261.4,
   "fundstelle": "AGEB Auswertungstabellen 09/2026, Tab. 2.2 (PDF S. 11): 8.141 PJ",
   "confidence": "A",
   "primaer_gelesen": true,
   "begruendung": "Direkt belegt statt aus UBA-Folie abgeleitet; Abweichung −0,1 %"
  },
  {
   "id": "ist_eev_de_2025_ageb",
   "alt": null,
   "neu": 2302.2,
   "fundstelle": "AGEB Auswertungstabellen 09/2026, Tab. 2.2: 8.288 PJ (vorläufig)",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Neuer Parameter; Endenergie 2025 +1,8 % gegen 2024"
  },
  {
   "id": "kernaussage_1_tiefstwert",
   "alt": "2024 niedrigster Wert seit der Wiedervereinigung",
   "neu": "2024 niedrigster Wert seit 1990 in der Eurostat-Abgrenzung; nach AGEB war 2023 das Tief (8.123 PJ), 2025 stieg die Endenergie auf 8.288 PJ",
   "fundstelle": "Eurostat nrg_bal_c FC_E 1990–2024; AGEB Tab. 2.2",
   "confidence": "A",
   "primaer_gelesen": true,
   "begruendung": "Aussage hängt an der Abgrenzung"
  },
  {
   "id": "ist_verkehr_lkw_bus_rest_2024",
   "alt": 142,
   "neu": 214.7,
   "fundstelle": "AGEB Auswertungstabellen 09/2026, Tab. 6.8 (PDF S. 27): Güterverkehr 733 PJ + Öffentlicher Personenverkehr 40 PJ",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Restrechnung des Dossiers mischt Inländerfahrleistung mit Eurostat-Inlandsabsatz"
  },
  {
   "id": "ist_verkehr_pkw_2024",
   "alt": 407,
   "neu": 351.4,
   "fundstelle": "AGEB Tab. 6.8: motorisierter Individualverkehr 1.265 PJ (inkl. Biokraftstoffe und Strom)",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Dossier-Rechnung Liter x Heizwert liegt 15,8 % über der Bilanzzahl"
  },
  {
   "id": "strom_ist_2025",
   "alt": "512–526",
   "neu": "522,4 (ohne Pumpspeicher) / 529,3 (mit Pumpspeicher)",
   "fundstelle": "AGEB, Bruttostromerzeugung nach Energieträgern, Stand 09/2026",
   "confidence": "A",
   "primaer_gelesen": true,
   "begruendung": "AGEB-Wert jetzt lesbar; obere Grenze der Dossierspanne zu niedrig"
  },
  {
   "id": "strom_ist_2017",
   "alt": 602,
   "neu": 602,
   "fundstelle": "WD 5-050-26 S. 10; AGEB Strerz: 601,9 mit / 595,9 ohne Pumpspeicher",
   "confidence": "A",
   "primaer_gelesen": true,
   "begruendung": "Wert bleibt; Hinweis ergänzen: Größe mit Pumpspeicher, 522 (2024) ohne; konsistenter Rückgang −12,0 % statt −13,3 %"
  },
  {
   "id": "prozesswaerme_temperatur_2024",
   "alt": "Lücke (nicht ausgewiesen)",
   "neu": {"unter_100": 47.5, "100_200": 79.7, "200_500": 42.9, "500_1000": 107.2, "1000_1500": 153.1, "ueber_1500": 28.7, "summe": 459.1, "unit": "TWh/a"},
   "fundstelle": "UBA V 1.4, Präsentation 15.06.2026, Folie 14 (Quelle: Hochschule Niederrhein, Kurzstudie Energieeffiziente und CO2-freie Prozesswärme, 2024)",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Stand in einer Quelle des Dossiers; 62,9 % über 500 °C; Basis weicht von 407 TWh (Folie 4) ab"
  },
  {
   "id": "fossil_anteil_eev_2024",
   "alt": 61,
   "neu": {"min": 60.9, "mid": 62.2, "max": 64.6, "unit": "%"},
   "fundstelle": "Eurostat FC_E 2024 (mit/ohne Kuppelgase C0350-0370 26,9 TWh); AGEB Tab. 6.1 (PDF S. 20)",
   "confidence": "A",
   "primaer_gelesen": true,
   "begruendung": "61 % ist die engste Abgrenzung"
  },
  {
   "id": "jaz_bestand_luft_wasser",
   "alt": "A",
   "neu": "B",
   "fundstelle": "Fraunhofer ISE, Presseinformation 03.11.2025",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Werte bestätigt; Punktwert aus einem nicht repräsentativen Feldtest mit Industriepartnern, Vorprojekt vom selben Institut; Größenordnung 3–4 bleibt A"
  },
  {
   "id": "epkw_verbrauch_real",
   "alt": "18 inkl. 17,5 % Ladeverlust",
   "neu": "18 kWh/100 km Realverbrauch; Ladeverluste 17,5 % (Spanne 10–26 %) gesondert, nicht eindeutig enthalten",
   "fundstelle": "UBA TEXTE 160/2022, S. 12–13",
   "confidence": "A",
   "primaer_gelesen": true,
   "begruendung": "Abgrenzung im Dossier nicht durch die Quelle gedeckt; UBA-FAQ setzt 10 % Ladeverlust"
  },
  {
   "id": "erk_budget_2021_2030",
   "alt": "60–100 Mt bzw. rund 30 Mt (Suchtreffer, C)",
   "neu": {"kumuliert_2021_2030_ueberschreitung": "60–100 Mt", "luecke_2030": 29.8, "budget": 6199, "unit": "Mt CO2-Äq."},
   "fundstelle": "BT-Drs. 21/6175, S. 20, 22, 57",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Beide Zahlen richtig, verschiedene Größen; ERK bestätigt Emissionsdaten 2025 (S. 19)"
  },
  {
   "id": "strom_2045_dena",
   "alt": "698 / 910 (C)",
   "neu": "698 (2030) / 910 (2045)",
   "fundstelle": "EWI, Zusammenfassung dena-Leitstudie Aufbruch Klimaneutralität, 10/2021, PDF S. 5",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Jetzt am Gutachtertext gelesen (Auftraggeber dena)"
  },
  {
   "id": "h2_2045_dena",
   "alt": "458 (C)",
   "neu": 458,
   "fundstelle": "EWI-Zusammenfassung dena-Leitstudie, PDF S. 7",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Jetzt primär gelesen"
  },
  {
   "id": "strom_2030_lfs3",
   "alt": "765–792 (C)",
   "neu": "765–792 (C), Widerspruch zu 594–638 offen",
   "fundstelle": "nicht prüfbar: bundeswirtschaftsministerium.de Browser-Prüfung; langfristszenarien.de nicht freigegeben",
   "confidence": "C",
   "primaer_gelesen": false,
   "begruendung": "Möglicherweise T45- gegen O45-Szenarien; unbelegt"
  }
 ]
}
```
