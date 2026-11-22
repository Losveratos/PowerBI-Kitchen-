# Prüfbericht 08 · Wasserstoff, E-Fuels und der Lkw

Stand 22.11.2026 · Phase 2 · Auftrag P2-08 · Prüfer: Opus (Agent), nicht Verfasser
des Dossiers. Geprüft: `research/08_wasserstoff_efuels_lkw.md`. Grundlage sind die
18 Rohdateien der Phase 1 unter `quellen/raw/P1-08/`. Ihre Prüfsummen stimmen alle
mit `quellen/manifest_P1-08.json` überein. Den Text habe ich selbst mit `pdftotext`
neu extrahiert und nicht aus den `.txt`-Dateien der Phase 1 übernommen. Mein
Nachrechnungs-Code liegt in `scripts/pruefung/p2_08_nachrechnung.py`.
Neue Downloads gab es keine: EUR-Lex hat geantwortet, aber nichts geliefert (siehe
Abschnitt 6). Deshalb gibt es kein eigenes Manifest.

## 1. Urteil in fünf Zeilen

1. Das Dossier ist bei den Zahlen solide. Von 45 geprüften Werten stehen 36 so in der Quelle, wie das Dossier sie wiedergibt. Die 6 Abweichungen sind fast alle Fundstellen- oder Etikettenfehler und keine falschen Werte.
2. Die Eigenrechnung (Regler, 140 TWh / 56 GW) ergibt beim unabhängigen Nachrechnen dieselben Zahlen (Abweichung höchstens ±2,4 %, Rundung). Schwächer sind die Setzungen dahinter: Das Modell rechnet den Wasserstoff-Lkw um etwa 13 % ungünstiger als die UBA-Kette. Mit dem UBA-Verhältnis sind es 115–132 TWh statt 140 TWh.
3. In der Low-Spalte widersprechen sich die PtL-Parameter: Allein der Elektrolysestrom ist dort größer als der gesamte PtL-Strom. Außerdem liegt die E-Fuel-Menge (100–195 TWh) über dem zweiten Ariadne-Wert für Schiff und Flug (51–128 TWh). Diesen Wert führt das Dossier zwar auf, setzt ihn aber nicht ins Modell ein.
4. Beim E-Kerosin-Preis ist eine Spanne falsch beschriftet (Marokko 2030). Der „Widerspruch“ zu EASA ist größtenteils erklärbar: EASA nennt Kosten von Erstanlagen im Jahr 2024, die Modellwerte gelten für ausgereifte Anlagen 2030/2050. Das Dossier lässt diesen Widerspruch offen.
5. Nicht prüfbar bleiben die ReFuelEU-Unterquoten am Amtsblatt (EUR-Lex lieferte keinen Inhalt), der EASA-Wert und die Lkw-Zulassungszahlen (Kernaussage 10).

## 2. Prüftabelle

Abkürzungen: EWI = EWI-Folien 16.06.2026 · DIHK = r2b/DIHK 2026 · FAQ = UBA „Wasserstoff im Verkehr: FAQ“ · TREMOD = UBA TEXTE 125/2025 · PtL22 = UBA/LBST/Bauhaus Luftfahrt 2022 · T96 = UBA TEXTE 96/2025 · T169 = UBA TEXTE 169/2021 · T68 = UBA TEXTE 68/2020 Anhang. Ariadne-Seiten sind PDF-Seiten.

### 2.1 Kernaussagen

| Nr. | Wert im Dossier | geprüfte Fundstelle | Ergebnis | neue Konf. · primär |
|---|---|---|---|---|
| K1 | 180,5 MW in Betrieb; 1,27 GW FID/Bau; Ziel 10 GW; KfW bis 2,4 GW; Markt 2,4–6,6 GW | EWI Folie 2, 3, 6; KfW S. 1; DIHK S. 15–16 (Dena 2025) | **bestätigt** | B · true |
| K2 | CAPEX 2.000–3.000 €/kW „entgegen früheren Erwartungen“; Index knapp über 8 €/kg; 2040: 2,5–7,5 €/kg | DIHK S. 27 (8 €/kg), S. 28 (CAPEX), S. 29 (2,5–7,5, €₂₀₂₅ nach CPI-Umrechnung aus €₂₀₁₈, Fn. 79) | **bestätigt** (China-Werte IEA: nicht prüfbar, Host nicht freigegeben) | B · true (China C · false) |
| K3 | 73 / 31 / 21 %; Faktor 2,35; 40–45 % | FAQ Frage 8 (Wortlaut: „Diesel-Lkw mit PtL nur bei 21 Prozent, … Brennstoffzellen-Lkw … 31 Prozent und … Elektro-Lkw (BEV oder O-BEV) bei 73 Prozent“); 73/31 = 2,355; 31/73 = 42,5 % | **bestätigt** (Abgrenzung: 73 % umfasst auch den Oberleitungs-Lkw) | B · true |
| K4 | +140 TWh, +56 GW (75–214 TWh / 23–107 GW) | eigene Nachrechnung | **bestätigt (Rechnung)**; Setzungen siehe 3.1 | C · false |
| K5 | 100 % Import: Ausland rund 560 / 780 TWh; Ariadne 60–250 TWh H₂ + 100–125 TWh E-Fuels, „mindestens 160–200 TWh“ | Nachrechnung 558,9 / 783,9 TWh; Ariadne S. 64 (wörtlich „mindestens 160–200 TWh“) | **bestätigt** | B · true |
| K6 | Ariadne 180–195 TWh, ca. 90 % international; Agora 155 TWh PtL; Kerosin 2023 112 TWh (402 PJ) | Ariadne S. 29; Agora-Webseite „Biomasse, Wasserstoff und CCS“; TREMOD Tab. 34 und 36 (402,3 PJ) | **bestätigt**; Ariadne S. 23 nennt aber für Schiff und Flug nur 51–128 TWh (siehe 3.3) | B · true |
| K7 | 168–219 €/MWh (DE 2030), 89–166 €/MWh 2050 „Spanien/Marokko“, 0,85–2,1 €/l; EASA 6.820–8.590 €/t; Break-even 300–620 €/t CO₂ | T96 Tab. 3 (S. 51); PtL22 Abb. 12 (S. 27); EASA nur per Suche | **abweichend**: 166,1 ist Deutschland 2050, nicht Spanien/Marokko (dort 89,1–133,7); in Abschnitt 5.3 lautet „Marokko 2030, DAC“ laut Tab. 3 145,8–171,0 statt 131,7–171,0. EASA-Spanne laut Suchtreffer bis 9.405 €/t, nicht 8.590; Erstanlagen, 2024 | C (Spanne) · B je Einzelquelle |
| K8 | Kernnetz 9.040 km; 9.241 km bis 2037, 24,3 Mrd. €; 2,9 GW bei 101/87 GW | BNetzA-PM 15.06.2026 (zweiter Entwurf, vorgelegt 01.06.2026); DIHK S. 23 | **bestätigt** (DIHK nennt zusätzlich 0,6 GW Clusterübergang) | B · true |
| K9 | Pkw drei- bis sechsfach (UBA); Wärmepumpe vier- bis fünffach; Befürworter mit Bestandsflotte | UBA „Kraftstoffe und Antriebe“ (wörtlich „drei- beziehungsweise sechsfache Menge“); FAQ Frage 5 | **abweichend (Zuordnung)**: Die Zahl „78 % Verbrenner 2030“ steht in `eauto/research/parameter_quellen.md` Z. 62 als Befund einer TUM-Studie, nicht der eFuel Alliance/Porsche Consulting. Den Wärmepumpen-Faktor konnte ich nicht prüfen | B (Pkw) · true; C (Wärme) · false |
| K10 | E-Lkw-Zulassungen 4.200 gegen 1.398; Lücke beim Brennstoffzellen-Lkw | – | **nicht prüfbar** (KBA nicht freigegeben; die Aussage selbst ist eine Lückenmeldung) | C · false |

### 2.2 Parameter mit Konfidenz A

| ID | Wert | Fundstelle | Ergebnis | Konf. · primär |
|---|---|---|---|---|
| h2_elektrolyse_ziel_2030_gw | 10 GW | DIHK S. 15, Fn. 7 (28 TWh bei 4.000 h und 70 %); EWI Folie 2; KfW S. 1 | **bestätigt**. Drei Herausgeber, alle primär gelesen. Alle drei zitieren aber dieselbe Urquelle (BMWK 2023), A bleibt deshalb vertretbar | A · true |

### 2.3 Stichprobe B

33 B-Parameter, alphabetisch sortiert, k = ⌊33/10⌋ = 3, Indizes 0, 3, …, 27:

| ID | Wert | Fundstelle | Ergebnis | Konf. · primär |
|---|---|---|---|---|
| co2_breakeven_ekerosin_eur_t | 300–620 €/t CO₂ | PtL22 Abb. 12, S. 27 (620 Mitteleuropa, 300 Südeuropa/MENA, künftige DAC-Anlagen) | **bestätigt** | B · true |
| elektrolyse_capex_de_eur_kw | 2.000 / 2.200 / 3.000 | DIHK S. 28 (2.000–3.000); 2.200 in den Parametern zu Abb. 3-2, S. 29 | **bestätigt** (2.200 steht auf S. 29, nicht S. 27–28) | B · true |
| h2_elektrolyse_2030_realistisch_gw | 2,4–6,6 GW | DIHK S. 15–16, Fn. 9 Dena (2025) | **bestätigt** | B · true |
| h2_elektrolyse_in_betrieb_gw | 0,1805 | EWI Folie 3 und 6 | **bestätigt** | B · true |
| h2_import_2045_ariadne_twh | 60–250 | Ariadne S. 64 | **bestätigt** | B · true |
| h2_inland_erzeugung_2030_twh_fid | 4,3 | EWI Folie 5 (in Betrieb + FID/Bau, 4.000 h, 75 %) | **bestätigt**; nachgerechnet 4,35 TWh | B · true |
| h2_verbrauch_2024_twh | 49,9 | DIHK S. 15: 43,2 + 0,4 + 6,3 (Summe vom Dossier gebildet) | **bestätigt** | B · true |
| kerosin_absatz_2023_twh | 111,7 | TREMOD Tab. 34 (S. 64) und 36: 402,3 PJ | **bestätigt** | B · true |
| lkw_dieselenergie_2023_twh | 169,7 | TREMOD Tab. 41, S. 83: SNF 611 PJ | **bestätigt** | B · true |
| lkw_wirkungsgrad_fcev | 0,31 | FAQ Frage 8 | **bestätigt** | B · true |

### 2.4 Schwerpunkte und weitere Prüfungen

| ID / Aussage | Wert | Fundstelle | Ergebnis | Konf. · primär |
|---|---|---|---|---|
| h2_elektrolyse_fid_bau_gw | 1,271 | EWI Folie 3, 7 | **bestätigt** | B · true |
| h2_elektrolyse_geplant_bis_2030_gw | 7,227 (gesamt 8,6685) | EWI Folie 3, 8 | **bestätigt** | B · true |
| Pipeline nach 2030 / ohne Jahr | 4.669,5 MW | EWI Folie 3 | **bestätigt** | B · true |
| refueleu_synth_quote | 1,2 % … 35 % | FAQ Frage 10 (primär): „Unterquote, die von 0,7 Prozent, bzw. 1,2 Prozent im Jahr 2030 auf 35 Prozent im Jahr 2050 steigt“; Amtsblatt nicht lesbar | **nicht prüfbar** am Amtsblatt. Die Werte für 2030 und 2050 sind durch das UBA belegt; 0,7 % ist die Jahresmindestquote innerhalb des Durchschnitts von 1,2 %. Für 2035 nennt ein Suchtreffer (Clean Hydrogen Observatory) 5 %, die abweichende T&E-Formulierung „2 % bis 2035“ betrifft 2032–2034 | B (2030, 2050) · true via UBA; C (Zwischenwerte) · false |
| lkw_wirkungsgrad_bev / _ptl_diesel | 0,73 / 0,21 | FAQ Frage 8 | **bestätigt** | B · true |
| elektrolyse_wirkungsgrad | 67 / 69 / 72 % „PEM“ | T68 Anhang, S. 23–24 | **abweichend (Etikett)**: 67/69/72 % steht im Technologieblatt **alkalische** Elektrolyse; PEM hat 67/71/80 % (2015/2030/2050). Die Modellspanne 0,64–0,75 bleibt davon unberührt | B · true |
| ptl_wirkungsgrad_kerosin | 37–57 % | PtL22 Tab. 3, S. 21; Text: langfristig 42–57 % | **bestätigt** | B · true |
| ptl_h2_je_kraftstoff | 1,35 | T169 S. 21 und S. 70 | **bestätigt**; Fischer-Tropsch-Pfad, CO₂ aus Luft | B · true |
| „0,92 MWh Strom“ (T169), vom Dossier verworfen | – | T169 S. 21: „Strombedarf für die weiterverarbeitenden Prozesse Elektrolyse und Fischer-Tropsch-Synthese“; S. 70: zusätzlich zum H₂ | **eindeutig abgrenzbar**: zusätzlicher Prozessstrom. Daraus folgen rund 3,1 MWh Strom je MWh Kraftstoff (η ≈ 0,32), ungünstiger als das Modell im High-Fall (0,37) | B · true |
| ekerosin_kosten_2030_de_eur_mwh | 167,7–219,2 | T96 Tab. 3, S. 51 | **bestätigt** | B · true |
| ekerosin_kosten_easa_eur_t | 6.820 / 7.695 / 8.590 | nur Suchtreffer (EASA Briefing Note 2025) | **nicht prüfbar**; laut Suchtreffer reicht die Spanne bis 9.405 €/t; Erstanlagen, ohne Marge, gewichtetes Mittel 2024 | C · false |
| kerosin_fossil_eur_t | 280 / 600 / 816 | PtL22 S. 27 (280–720), S. 35 (600 €/t, Sept. 2021) | **abweichend**: 600 €/t steht auf S. 35, nicht S. 28. Der Höchstwert 816 €/t ist ein Suchtreffer (EASA) und gehört nicht unter primaer_gelesen: true | B (280–720) · true; 816: C · false |
| ekerosin 1.700 €/t „zukünftig (DAC)“ | 1.700 €/t | PtL22 Abb. 12 | **bestätigt mit Abgrenzung**: Kostenbeispiel für eine künftige Fischer-Tropsch-Anlage mit DAC **in MENA** (S. 27 Text) | B · true |
| lkw_bestand_2023_tsd | 759 Tsd. | TREMOD Tab. 12 | **abweichend (Seite)**: S. 38, nicht S. 46; Werte stimmen (98,5 % / 0,90 % / 0,58 %) | B · true |
| pkw_strombedarf_fcev_gegen_bev | Faktor 3 (54/18) | FAQ **Frage 5**, nicht Frage 2; dort auch „zwei- bis dreimal so viel Strom“, WtW 75 % gegen 28 % | **abweichend (Fundstelle)**; Wert bestätigt | B · true |
| efuel_bedarf_2045_ariadne_twh | 180–195 | Ariadne S. 29 | **bestätigt**; ob biogen enthalten ist, lässt der Wortlaut offen (siehe 3.3) | B · true |
| ptl_bedarf_2045_agora_twh | 155 | Agora-Webseite (auch Energiewirtschaft, nicht nur Flug) | **bestätigt** | B · true |
| kernnetz_laenge_km / _reservierungen_gw | 9.040 / 2,9 | BNetzA-PM; DIHK S. 23 | **bestätigt** | B · true |
| h2_grosshandel_eur_kg / h2_preis_2040 | 8 / 2,5–7,5 | DIHK S. 27, S. 29 | **bestätigt** | B · true |
| h2_import_gruen_heute_ct_kwh | 20–22 | FAQ Frage 9 | **bestätigt** | B · true |
| model_* (4 Parameter) | siehe Dossier | eigene Nachrechnung | **bestätigt (Rechnung)** | C · false |

**Bilanz:** 45 geprüfte Werte · 36 bestätigt · 6 abweichend (K7, K9,
elektrolyse_wirkungsgrad, kerosin_fossil_eur_t, lkw_bestand_2023_tsd,
pkw_strombedarf_fcev_gegen_bev) · 3 nicht prüfbar (K10, refueleu_synth_quote,
ekerosin_kosten_easa_eur_t).

## 3. Abweichungen im Detail (nach Gewicht)

### 3.1 Lkw-Regler: Die Rechnung stimmt, die Setzung belastet den H₂-Lkw stärker als die UBA-Quelle

Mit den mittleren Parametern ist der Wasserstoff-Lkw im Modell 2,65-mal so stromintensiv wie der
Batterie-Lkw (0,88 / 0,665 / 0,50). Das UBA, das das Dossier als Hauptquelle nennt,
kommt auf 2,35. Mit dem UBA-Verhältnis ergibt sich als Wirkung des Lkw-Reglers:
- bei R_BEV = 0,50: **+115 TWh** statt +140 TWh (−18 %),
- direkt aus der UBA-Kette mit 42 % Diesel-Wirkungsgrad: **+132 TWh** (−5 %).

Die Ursache ist R_H2 = 0,88: Es kommt aus ICCT-Suchtreffern (C) und ergibt zusammen mit
η_sys = 0,665 einen schlechteren Wert als die 31 % des UBA. Kernaussage 4 sollte die
UBA-Gegenrechnung (115–132 TWh) neben dem Modellwert nennen. Die Bandbreite 75–214 TWh
deckt beides ab.

### 3.2 PtL-Parameter in der Low-Spalte sind in sich widersprüchlich

Low verbindet η_ptl = 0,57 (Methanol-Pfad, konzentrierte CO₂-Quelle, langfristig) mit
H2_per_EF = 1,35 (Fischer-Tropsch, DAC, T169) und η_el = 0,75. Allein für die
Elektrolyse ergibt das 1,80 MWh Strom je MWh Kraftstoff. Der gesamte PtL-Strom ist dort
aber nur 1/0,57 = 1,75 MWh. Für Synthese und CO₂-Bereitstellung bliebe also negativer
Strom übrig. Die Wirkung auf die Ergebnisse ist klein: In der Low-Spalte sind die
Elektrolyse-GW um rund 3 % zu hoch, relativ zum Strombedarf. Der Widerspruch zeigt aber,
dass die Spalten „günstigste Werte“ aus unterschiedlichen Verfahren mischen.
Auf der anderen Seite ergibt die vom Dossier verworfene Zahl aus T169 (0,92 MWh
Prozessstrom zusätzlich zum H₂, S. 21 eindeutig) einen Gesamtwirkungsgrad von nur
etwa 0,32. Das ist schlechter als die High-Spalte (0,37). Je nach Quelle ist die
Spanne für η_ptl also nach unten nicht weit genug.

### 3.3 Höhe des E-Fuel-Bedarfs (D_EF): Ariadne enthält zwei sehr verschiedene Werte

Ariadne nennt auf S. 23 für Schiff und Flug einen nichtelektrischen Bedarf von
**51–128 TWh** (Hybrid-Modell, Technologiemix). Auf S. 29 nennt Ariadne **180–195 TWh**
synthetische (und, je nach Lesart, biogene) Kraftstoffe im Verkehr. Das Dossier
führt beide Werte auf, im Modell verwendet es aber nur den höheren (D_EF 100 / 150 / 195).
Wer sich am Wert von S. 23 orientiert, käme mit 128 TWh statt 150 TWh in der Mitte auf
etwa 50 TWh weniger E-Fuel-Strom (bei η 0,45). Dann sinkt der Gesamtwert
„Strom DE h=0, m=0“ von 644 TWh auf rund 595 TWh. Die Herkunft der Abweichung (national
gegen international, Modellgrenzen) ist nicht aufgeklärt. Diese Wahl sollte im Dossier
offen benannt werden.

### 3.4 E-Kerosin: falsche Etiketten, und der Widerspruch zu EASA lässt sich weitgehend erklären

- T96 Tab. 3: „Marokko 2030, DAC“ = 145,8–171,0 €/MWh, nicht 131,7–171,0. Der Wert 131,7
  gilt für Marokko 2050 (DAC, Fischer-Tropsch).
- In Kernaussage 7 steht „89–166 €/MWh 2050 (Spanien/Marokko)“. 166,1 ist aber
  Deutschland 2050 (DAC, Fischer-Tropsch). Für Spanien und Marokko 2050 gelten 89,1–133,7 €/MWh.
- PtL22 nennt 1.700 €/t (≈ 142 €/MWh, ≈ 1,36 €/l) für eine künftige DAC-Anlage
  in MENA. Das Dossier lässt die Region weg.
- EASA, nur per Suche: gewichtete **Produktionskosten von Erstanlagen (FOAK) im
  Jahr 2024**, ohne Marge; Spanne laut Treffer 6.820–**9.405** €/t, mit CO₂ aus der Luft
  8.470 €/t; 2024 gab es im EU-Kraftstoffmix keinen synthetischen Kraftstoff. Die
  Modellwerte gelten dagegen für Anlagen 2030/2050 an optimierten Standorten. Der
  „Faktor 3“ (644 €/MWh gegen 168–219 €/MWh) ist damit **zum größten Teil eine Frage
  von Zeitpunkt und Reifegrad und kein Widerspruch** zwischen den Quellen. Für die Folge
  ist das wichtig: Heutige Projektkosten liegen um ein Mehrfaches über den Modellwerten,
  und ob die Lernkurve kommt, ist unbelegt. Das ist ein Argument gegen den Optimismus
  der Modellwerte.

### 3.5 Fundstellen und Konfidenz-Etiketten

- TREMOD Tab. 12 steht auf S. 38 (nicht S. 46).
- Die Faktoren 75 % und 3 (54/18 kWh) für den Pkw stehen in FAQ Frage 5 (der Wert 75 % auch in Frage 3), nicht in Frage 2.
- T68: 67/69/72 % gelten für die alkalische Elektrolyse, nicht für PEM.
- PtL22: 600 €/t steht auf S. 35. Der Parameter `kerosin_fossil_eur_t` mischt den
  Suchtreffer 816 €/t in einen Eintrag mit `primaer_gelesen: true`.
- Kernaussage 9: Die Zahl „78 % Verbrenner 2030“ stammt laut dem zitierten eauto-Dossier
  aus einer TUM-Studie, nicht von der eFuel Alliance.
- Abschnitt 6, „Wirkungsmaß“: 4,3 TWh (EWI, 75 % Wirkungsgrad) gegen 28 TWh (DIHK,
  70 %). Auf einheitlicher Basis (75 %) wären es 30 TWh, also 14 %. Für „ein Zehntel“
  findet sich keine Grundlage; richtig ist „rund ein Siebtel“.
- Abschnitt 8.5: „Faktor vier bis sechzig“ – nachgerechnet 4,2 bis 55.

## 4. Nachrechnungen

Code: `energiewende/scripts/pruefung/p2_08_nachrechnung.py`. Formeln und Parameter
sind aus den Abschnitten 7.2 und 7.3 des Dossiers neu implementiert,
`scripts/p1_08_regler.py` wird nicht importiert.

| Größe | Dossier | Nachrechnung | Abweichung |
|---|---|---|---|
| Strom DE h=0, m=0 (low / mid / high) | 361 / 644 / 1.068 TWh | 360,8 / 643,9 / 1.068,4 | ≤ 0,1 % |
| Strom DE h=1, m=0 (low / mid / high) | 435 / 784 / 1.282 | 435,3 / 783,9 / 1.282,2 | ≤ 0,1 % |
| Strom DE m=0,5 (vier Werte je Fall) | 206–641 | 206,4–641,1 | ≤ 0,2 % |
| Elektrolyse h=0, m=0 | 57 / 129 / 282 GW | 57,0 / 128,7 / 281,8 | ≤ 0,2 % |
| Lkw-Regler, m=0 | +75 / +140 / +214 TWh; +23 / +56 / +107 GW | +74,5 / +140,0 / +213,9; +23,0 / +56,2 / +107,1 | ≤ 0,6 % |
| Lkw-Regler, m=0,5 | +11 / +27 / +53 TWh; +28 GW | +11,3 / +27,5 / +53,3; +28,1 | ≤ 2,4 % (Rundung) |
| Tabelle 7.4 (9 Zeilen × 6 Spalten, mid) | – | alle Werte | ≤ 1,2 % (43 gegen 42,5 TWh) |
| Plausibilitätsprobe Ariadne | 53 GW | 52,8 GW | −0,4 % |
| Abschnitt 3.4 (Faktoren und Bandbreiten) | 0,97/1,32/1,74; 52–107; 127–321 | 0,97/1,32/1,74; 52–107; 126,5–321,2 | ≤ 0,4 % |
| **Gegenprobe Lkw-Regler mit UBA-Verhältnis** | 140 TWh | 115 TWh (R_BEV 0,5) bzw. 132 TWh (Diesel 42 %) | **−18 % bzw. −5 %** |
| EWI 4,3 TWh (1.451,5 MW · 4.000 h · 75 %) | 4,3 | 4,35 | +1,3 % |
| 10 GW · 4.000 h · 70 % / 75 % | 28 TWh | 28,0 / 30,0 | 0 / +7 % |
| E-Kerosin €/l (9,55 kWh/l) | 0,85–2,1 €/l | 0,85–2,10 | ≤ 1,8 % |
| EASA 7.695 €/t | 6,2 €/l | 6,16 €/l; 644 €/MWh | −0,7 % |
| SNF 611 PJ / 60,5 Mrd. km | 2,8 kWh/km | 2,81 | +0,2 % |

Die Rechnung ist fehlerfrei nachvollziehbar. Abweichungen gibt es nur bei den Setzungen
(3.1–3.3), nicht in der Arithmetik.

## 5. Einseitigkeit und fehlende Gegenpositionen

**Zugunsten des Hauptpfads „Erneuerbare + Speicher“ bzw. des Batterie-Lkw schief:**
- Kernaussage 4 beruht auf einem FCEV/BEV-Verhältnis von 2,65, das UBA nennt 2,35 (3.1).
  Das lässt den Wasserstoff-Lkw schlechter aussehen, als die Hauptquelle es tut.
- Kernaussage 3 vergleicht nur Wirkungsgrade. Die Kosten für Megawatt-Ladeinfrastruktur und
  Netzanschlüsse an Autobahnen sind nicht beziffert. Das UBA schreibt selbst, dass
  batterieelektrischer Fernverkehr „in den nächsten Jahren … noch unwahrscheinlich“ ist,
  Oberleitungen wurden eingestellt, und Brennstoffzellen-Lkw „könnten daher eine
  Alternative oder Ergänzung“ sein (FAQ Frage 8). Das Dossier zitiert das, stellt es aber
  nicht neben Kernaussage 3.
- Ariadne erwartet weiter wachsenden Güterverkehr auf der Straße (PDF-S. 25). Die Setzung
  E_d = 130–185 TWh („gleich hohe Transportleistung“) liegt damit eher am unteren Rand.

**Gegen den Hauptpfad bzw. ungünstig für die Energiewende schief:**
- Der hohe E-Fuel-Bedarf (D_EF bis 195 TWh) übergeht den Ariadne-Wert 51–128 TWh (3.3)
  und erhöht so den Gesamtstrombedarf (644 TWh in der Mitte).
- Den Widerspruch beim E-Kerosin-Preis stellt das Dossier als „nicht aufgeklärt“ dar.
  Er lässt sich aber weitgehend erklären (Erstanlage 2024 gegen Zielkosten 2050). Ungünstig
  für den Hauptpfad bleibt trotzdem: Belegt ist heute nur der hohe Wert.

**Fehlende oder unterbelichtete Punkte:**
- EWI Folie 5: Für 2026 sind 738 MW angekündigt, davon nur 521 MW mit FID. 11 Großprojekte bis
  2028 haben Förderzusagen, aber keine FID, und könnten abgesagt werden. Weitere 38 Projekte
  mit 4.375 MW haben kein Jahr. Damit lässt sich die Aussage „Hochlauf stagniert“ noch
  deutlicher belegen.
- KfW (S. 1): Grüner Wasserstoff und Derivate seien „aus heutiger Sicht die einzigen
  großmaßstäblich verfügbaren Optionen“ für saisonale Speicher, Stahl, Chemie, Luft- und
  Hochseeschifffahrt. Das ist das stärkste Argument für die Unverzichtbarkeit und fehlt in
  der Debatte „Champagner gegen Rückgrat“ (Abschnitt 8.4).
- DIHK Fn. 73: Die angesetzten 50 €/MWh Strombezugskosten liegen „teils deutlich
  unterhalb“ diskutierter Werte. Das 8-€/kg-Beispiel ist also eher optimistisch.
- Importverluste fehlen weiterhin als Zahl (das Dossier benennt das). Wenn sie fehlen,
  wirkt der Strombedarf bei Import kleiner als er ist.

## 6. Weiterhin nicht erreichbar

| Host | Dokument | Grund |
|---|---|---|
| eur-lex.europa.eu | VO (EU) 2023/2405 (ReFuelEU), HTML und PDF, Anhang I | HTTP 202 ohne Inhalt (0 Byte, vermutlich Browser-Prüfung); nicht umgangen |
| easa.europa.eu | Briefing Note / Annual Technical Report 2025 (E-Kerosin-Kosten) | nicht freigegeben; nur Suchtreffer |
| iea.org | Global Hydrogen Review (Elektrolysekosten China) | nicht freigegeben |
| kba.de | Lkw-Zulassungen nach Antrieb 2025 | nicht freigegeben |
| theicct.org | Lkw-Verbrauch und Gesamtkosten | nicht freigegeben |

## 7. Korrekturen

```json
{
  "korrekturen": [
    {"id": "K7_ekerosin_2050_spanne", "alt": "89–166 €/MWh 2050 (Spanien/Marokko-Bedingungen)", "neu": "89,1–133,7 €/MWh (Spanien/Marokko 2050); Deutschland 2050: 115,0–166,1 €/MWh", "fundstelle": "UBA TEXTE 96/2025, Tab. 3, S. 51 (Batteiger et al. 2022)", "confidence": "B", "primaer_gelesen": true, "begruendung": "166,1 ist der Wert für Deutschland 2050 (DAC, Fischer-Tropsch)"},
    {"id": "ekerosin_marokko_2030_dac", "alt": "131,7–171,0 €/MWh (Marokko 2030, DAC)", "neu": "145,8–171,0 €/MWh (Marokko 2030, DAC)", "fundstelle": "UBA TEXTE 96/2025, Tab. 3, S. 51", "confidence": "B", "primaer_gelesen": true, "begruendung": "131,7 gehört zu Marokko 2050"},
    {"id": "ekerosin_kosten_easa_eur_t", "alt": "min 6820, mid 7695, max 8590; Ursache des Faktors 3 offen", "neu": "min 6820, mid 7695, max 9405 (laut Suchtreffer); Erstanlagen (FOAK), gewichtetes Mittel 2024, ohne Marge", "fundstelle": "EASA Briefing Note 2025, Tab. 1 (nur Suchtreffer)", "confidence": "C", "primaer_gelesen": false, "begruendung": "Der Abstand zu den Modellwerten erklärt sich weitgehend durch Zeitpunkt und Reifegrad; die Obergrenze weicht ab"},
    {"id": "ekerosin_1700_eur_t", "alt": "1.700 €/t Herstellkosten zukünftig (DAC)", "neu": "1.700 €/t Kostenbeispiel künftige Fischer-Tropsch-Anlage mit DAC in MENA", "fundstelle": "UBA/LBST 2022, Abb. 12 und Text S. 27", "confidence": "B", "primaer_gelesen": true, "begruendung": "Regionale Abgrenzung fehlte"},
    {"id": "kerosin_fossil_eur_t", "alt": "min 280, mid 600, max 816; primaer_gelesen true; S. 28", "neu": "min 280, mid 600, max 720 (primär); 816 (EASA 2023) getrennt als C, primaer_gelesen false; 600 €/t auf S. 35", "fundstelle": "UBA/LBST 2022, S. 27 (280–720), S. 35 (600 €/t, Sept. 2021)", "confidence": "B", "primaer_gelesen": true, "begruendung": "Suchtreffer in einem als primär gelesen markierten Parameter; Seitenangabe"},
    {"id": "model_lkw_h2_zusatz_strom_twh", "alt": "mid 140 TWh", "neu": "mid 140 TWh (Modell); UBA-Gegenrechnung 115–132 TWh ergänzen", "fundstelle": "UBA FAQ Frage 8 (73 % / 31 %); scripts/pruefung/p2_08_nachrechnung.py", "confidence": "C", "primaer_gelesen": false, "begruendung": "Modellverhältnis FCEV/BEV 2,65 gegen UBA 2,35; die Rechnung selbst ist bestätigt"},
    {"id": "ptl_wirkungsgrad_kerosin_low", "alt": "low 0,57 mit H2_per_EF 1,35 und eta_el 0,75", "neu": "low entweder 0,51 (Fischer-Tropsch, konzentriert, langfristig) oder H2_per_EF für den Methanol-Pfad anpassen; Hinweis auf η ≈ 0,32 nach UBA TEXTE 169/2021", "fundstelle": "UBA/LBST 2022 Tab. 3, S. 21; UBA TEXTE 169/2021 S. 21 und S. 70", "confidence": "B", "primaer_gelesen": true, "begruendung": "In der Low-Spalte übersteigt der Elektrolysestrom (1,80 MWh/MWh) den gesamten PtL-Strom (1,75 MWh/MWh)"},
    {"id": "D_EF_setzung", "alt": "100 / 150 / 195 TWh, Herkunft Ariadne 180–195", "neu": "Spanne beibehalten oder erweitern; Ariadne PDF-S. 23 (51–128 TWh Schiff/Flug, nichtelektrisch) als zweiten Ariadne-Wert im Modell benennen", "fundstelle": "Ariadne-Report 2025, PDF-S. 23 und S. 29", "confidence": "B", "primaer_gelesen": true, "begruendung": "Zwei Ariadne-Werte unterscheiden sich um Faktor 1,5–3,5; das Modell nutzt nur den hohen"},
    {"id": "elektrolyse_wirkungsgrad", "alt": "UBA 67/69/72 % (PEM)", "neu": "UBA 67/69/72 % (alkalische Elektrolyse); PEM 67/71/80 %", "fundstelle": "UBA TEXTE 68/2020 Anhang, Technologieblätter AEL und PEM (S. 23–24)", "confidence": "B", "primaer_gelesen": true, "begruendung": "Etikett vertauscht"},
    {"id": "lkw_bestand_2023_tsd", "alt": "Tab. 12, S. 46", "neu": "Tab. 12, S. 38", "fundstelle": "UBA TEXTE 125/2025", "confidence": "B", "primaer_gelesen": true, "begruendung": "Seitenangabe"},
    {"id": "pkw_strombedarf_fcev_gegen_bev", "alt": "Frage 2", "neu": "Frage 5 (zwei- bis dreimal; Mittelklasse 54/18 kWh = Faktor 3)", "fundstelle": "UBA FAQ Wasserstoff im Verkehr, Frage 5", "confidence": "B", "primaer_gelesen": true, "begruendung": "Fundstelle; die Quelle nennt auch die Spanne 2–3"},
    {"id": "elektrolyse_capex_de_eur_kw", "alt": "fundstelle S. 27-28", "neu": "S. 28 (2.000–3.000); 2.200 €/kW S. 29 (Parameter zu Abb. 3-2)", "fundstelle": "DIHK/r2b 2026", "confidence": "B", "primaer_gelesen": true, "begruendung": "Seitenangabe"},
    {"id": "refueleu_synth_quote", "alt": "C, primaer_gelesen false", "neu": "2030: 1,2 % (Jahresmindestwert 0,7 %), 2050: 35 % als B über UBA FAQ Frage 10; Zwischenwerte 2032–2034: 2 %, 2035: 5 %, 2040: 10 %, 2045: 15 % weiter C", "fundstelle": "UBA FAQ Frage 10; Amtsblatt (EUR-Lex) nicht abrufbar", "confidence": "B", "primaer_gelesen": true, "begruendung": "Endpunkte durch eine Behördenquelle primär belegt; Amtsblatt weiter offen"},
    {"id": "K9_bestandsflotte_78", "alt": "eFuel Alliance/Porsche Consulting … Bestandsflotte 2030 noch zu rund 78 % Verbrenner", "neu": "78 % Verbrenner 2030 laut TUM-Studie (eauto-Dossier), nicht laut eFuel Alliance", "fundstelle": "eauto/research/parameter_quellen.md, Z. 62", "confidence": "B", "primaer_gelesen": false, "begruendung": "Falsche Zuordnung der Zahl"},
    {"id": "wirkungsmass_2030", "alt": "höchstens ein Zehntel bis ein Siebtel der 28 TWh", "neu": "rund ein Siebtel (4,3 von 28 TWh; auf einheitlicher Basis von 75 % 4,3 von 30 TWh = 14 %)", "fundstelle": "EWI Folie 5; DIHK S. 15 Fn. 7", "confidence": "B", "primaer_gelesen": true, "begruendung": "Für ein Zehntel gibt es keine Grundlage; unterschiedliche Wirkungsgrad-Annahmen"},
    {"id": "faktor_hochlauf", "alt": "Faktor vier bis sechzig", "neu": "Faktor rund 4 bis 55", "fundstelle": "EWI Folie 3; KfW S. 1", "confidence": "B", "primaer_gelesen": true, "begruendung": "10 / 0,1805 = 55; 10 / 2,4 = 4,2"}
  ]
}
```
