# Konsolidierung · Geprüfter Parametersatz (Phase 3, Auftrag P3-A)

Stand 22.11.2026 · erzeugt von `scripts/consolidate_params.py` · Ergebnis: `data/model_params.json` · maßgeblich für Modell und Seiten ist allein diese Datei; die Dossiers 00 bis 10 bleiben als historischer Stand unverändert.

## 1. Bilanz

| Größe | Zahl |
|---|---:|
| Parameter in den Dossiers 00 bis 10 (Eingang) | 456 |
| Parameter in `model_params.json` (Ausgang) | 456 |
| Korrekturen in den zehn Prüfberichten | 151 |
| davon angewendet (Parameter-ID, auch über Zusatz-Zuordnung) | 89 |
| davon Textkorrektur (Kernaussage, Textstelle, neuer Wert ohne Parameter) | 58 |
| davon nicht zugeordnet (Zweifelsfall, nicht geraten) | 4 |
| Herabstufungen der Konfidenz (Prüfbericht, Prüftabelle, Regel A) | 53 |
| Hochstufungen | 15 |

Die Summen gehen auf: 151 = 89 + 58 + 4; kein Parameter ist verschwunden. Die Parameter-IDs tragen ein Dossier-Präfix (`d05.…`), weil vier IDs (`r21_factsheet_a_batterie_bio_eur`, `r21_ets_minderung_seit_2005_pct`, `r21_zew_ersparnis_mrd_eur`, `elektrolyse_wirkungsgrad`) in zwei Dossiers vorkommen.

## 2. Parameter je Dossier und Prüfstatus

| Dossier | Parameter | bestätigt | korrigiert | nicht prüfbar | nicht in der Stichprobe | A | B | C |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 00_aufhaenger_r21 | 5 | 0 | 0 | 0 | 5 | 0 | 5 | 0 |
| 01_r21_behauptungen | 32 | 14 | 8 | 0 | 10 | 0 | 30 | 2 |
| 02_kostenstudien | 31 | 13 | 5 | 3 | 10 | 0 | 24 | 7 |
| 03_stromdaten | 17 | 12 | 5 | 0 | 0 | 0 | 17 | 0 |
| 04_energiesystem_bedarf | 104 | 24 | 9 | 0 | 71 | 7 | 87 | 10 |
| 05_speicher_dunkelflaute | 46 | 10 | 15 | 1 | 20 | 2 | 44 | 0 |
| 06_europa | 31 | 16 | 12 | 3 | 0 | 3 | 25 | 3 |
| 07_lieferketten | 54 | 9 | 12 | 0 | 33 | 2 | 39 | 13 |
| 08_wasserstoff_efuels_lkw | 41 | 27 | 8 | 0 | 6 | 1 | 34 | 6 |
| 09_referenzpfade | 65 | 14 | 11 | 1 | 39 | 1 | 52 | 12 |
| 10_wirtschaftslage | 30 | 16 | 7 | 0 | 7 | 0 | 30 | 0 |
| **Summe** | **456** | **155** | **92** | **8** | **201** | **16** | **387** | **53** |

Der Prüfstatus stammt aus der Prüftabelle (Abschnitt 2 des Prüfberichts) und dem `korrekturen`-Block; 
wo ein Parameter nur im Fließtext des Prüfberichts als geprüft genannt ist, steht die Stelle im Feld `pruefergebnis` (12 Parameter, Tabelle `PRUEFSTATUS_MANUELL` im Skript). „Korrigiert“ heißt: Der Prüfbericht hat den Eintrag geändert, auch wenn nur Fundstelle, Konfidenz oder Abgrenzung betroffen sind (Feld `korrektur_art`). Die Konfidenzspalten zeigen den Stand nach Prüfung und Regel A.

## 3. Angewendete Korrekturen (alt → neu)

Je Zeile eine Korrektur eines Prüfberichts, die einem Parameter zugeordnet ist. „Art“: wert · text · fundstelle · konfidenz · hinweis (siehe `meta.korrektur_art`). Bei Wertänderungen steht der Wert vor und nach der Prüfung; bei den übrigen der Wortlaut des Prüfers.

| Parameter | Art | alt | neu | Konfidenz |
|---|---|---|---|---|
| `d01.r21_zew_ersparnis_mrd_eur` | konfidenz, text, wert | {"min": 824, "max": 850} | {"zew_studie_barwert_ohne_nationale_massnahmen": 824, "r21_zitat_nicht_in_studie": 850} | A → B |
| `d01.r21_factsheet_a_batterie_bio_eur` | hinweis | Setzung: 100 % der Last 5 Tage aus Batterien | wie bisher 1,4 Bio. EUR; Zusatz: zitierte Studie misst Wind < 10 % CF, nicht null; heutiger EE-Park deckte im schwächsten 120-h-Fenster 2023-2025 21-26 % der Last (Lücke 5,3-5,8 TWh); 520 T… | A → B |
| `d01.r21_ets_minderung_seit_2005_pct` | hinweis, konfidenz | Drei Angaben, alle ohne Fundstelle (als Widerspruch gewertet) | Referenz: rund -50 % 2005-2024 (Kommission 04.04.2025); D-4 'ca. 51 %' korrekt, F-1 '-47 %' entspricht Stand 2023, 'über 40 %' ist Zitat und als Untergrenze nicht falsch | A → B |
| `d01.r21_factsheet_h_zuteilung_angegeben_t` | hinweis, konfidenz | welcher Wert stimmt, offen | 4,68 t plausibel (GCP 2024: 37,0 Gt fossiles CO2 2023 / rund 8 Mrd. Menschen = ca. 4,6 t); Tabelle mit 4,86 unterschätzt die Zahlungen der Käufer um 2-8 % | A → C |
| `d01.wendland_qc_preis_mischsystem_eur_mwh` | konfidenz | C, primaer_gelesen false | 82 | C → B |
| `d01.wendland_qc_preis_ee_system_eur_mwh` | konfidenz | C, primaer_gelesen false | 105 | C → B |
| `d01.uba_vorkette_pipeline_norwegen_g_gj` | fundstelle | Fundstelle: S. 19 | Fundstelle: UBA CC 21/2019, Druckseite 19 = PDF-Seite 22 | B |
| `d01.uba_vorkette_lng_usa_g_gj` (Zusatz) | fundstelle | (gilt laut Korrektur auch hier) Fundstelle: S. 19 | Fundstelle: UBA CC 21/2019, Druckseite 19 = PDF-Seite 22 | B |
| `d02.aurora_gesamtkosten_bio_eur` | hinweis | Die Bundesregierung rechnet in Drs. 21/903 linear 172 Mrd. EUR/Jahr | Die AfD-Fragesteller rechnen in der Vorbemerkung zu Drs. 21/903 linear 172 Mrd. EUR/Jahr (3,44 Bio. ÷ 20). Die Bundesregierung macht keine eigene Schätzung und stellt fest, dass die Studien… | C |
| `d02.efruhr_ewi_netzinvestitionen_mrd_eur` | fundstelle, konfidenz, text | confidence C, primaer_gelesen false, Fundstelle Suchtreffer | 732 Mrd. EUR (VN 430/431, ÜN 301 nach NEP 2037/2045 Version 2023, 2. Entwurf), Kostenbasis 2024 ohne Inflation; Auftraggeber Netze-Gesellschaft Südwest | C → B |
| `d02.pwc_gesamtkosten_wwb_bio_eur` | text | Zeitraum bis 2045/2050 unklar; Abgrenzung nur aus Suchtreffern | 13,3 Bio. EUR = 3,9 Investitionen + 9,4 Energiekosten, 'einheitlicher Betrachtungszeitraum bis 2050'; Energiekosten = Energiebeschaffung, Netzentgelte, Umlagen und CO2-Bepreisung (also inkl… | C |
| `d02.ise2024_differenzkosten_mrd_eur_pa` | hinweis | 54 Mrd. EUR/a, 2025-2045; Summe ~1,1 Bio. EUR (M) | unverändert, aber mit Hinweis: Studie schreibt 'im Mittel über die nächsten 25 Jahre' (× 25 = 1,35 Bio. EUR); die 21-Jahres-Summe wird durch die Studienangabe 550 Mrd. EUR Einsparung Effizi… | B |
| `d02.nep2023_kostenanstieg_mrd_eur` | hinweis | Gegenposition 3: bestätigter NEP von 323 auf rund 440 Mrd. EUR | ergänzen: NEP 2025 (2. Entwurf) senkt die ÜN-Investitionen durch Offshore-Optimierung um 50-80 auf 364-392 Mrd. EUR | B |
| `d03.abregelung_2023_offshore_onshore_gwh` | konfidenz, text, wert | {"offshore": 5729, "onshore": 3980} | {"offshore": 5729, "onshore": 3980, "ee_gesamt": 10478, "ee_gesamt_2022": 8071} | C → B |
| `d03.wind_offshore_vls_2015_2025` | text | note: 'Offshore-Reihe sinkt seit 2017 …' | Wert unverändert (2803/3124/3614); note ergänzen: 'Minimum 2023 ist abregelungsgetrieben (Redispatch 24 % der Erzeugung; zurückgerechnet ≈ 3.485 h). Spanne ist keine reine Wetterspanne; 201… | B |
| `d03.pv_vls_gesamt_dc_2015_2025` | text | note: 'Mit total_power … ist die Reihe über die Jahre vergleichbar' | Wert unverändert (813/928/992); note: '2023–2025 (830/813/828 h) rund 12 % unter 2015–2022 (Median 935 h), trotz sonnigem 2025; Ursache nicht belegt (marktbedingte Abregelung, Leistungsbuch… | B |
| `d03.dunkelflaute_laengste_phase_unter_5pct_h` | wert | {"min": 18, "mid": 44, "max": 80} | {"min": 18, "mid": 43, "max": 80} | B |
| `d03.dunkelflaute_laengste_phase_unter_10pct_h` | text | note ohne Sensitivität | Wert unverändert (63/90/165); note ergänzen: 'Mit gleitendem 24-h-Mittel < 10 %: 108–312 h je Jahr (max. 01.–13.11.2024); mit Jahresend-Leistung 2023: 170 h; mit Leistungsmix 2025: 172 h. N… | B |
| `d04.ist_pev_de_2025_ageb_pj` | fundstelle, konfidenz, text, wert | 10530 | 10628 | C → B |
| `d04.ist_eev_de_2024_ageb_abgeleitet` | fundstelle, konfidenz, text, wert | 2259 | 2261.4 | B → B |
| `d04.ist_verkehr_lkw_bus_rest_2024` | fundstelle, konfidenz, text, wert | 142 | 214.7 | C → B |
| `d04.ist_verkehr_pkw_2024` | fundstelle, text, wert | 407 | 351.4 | B |
| `d04.strom_ist_2017` | text | 602 | 602 | A |
| `d04.jaz_bestand_luft_wasser` | konfidenz | A | B | A → B |
| `d04.epkw_verbrauch_real` | text | 18 inkl. 17,5 % Ladeverlust | 18 kWh/100 km Realverbrauch; Ladeverluste 17,5 % (Spanne 10–26 %) gesondert, nicht eindeutig enthalten | A → B |
| `d04.h2_2045_dena` | fundstelle, konfidenz | Fundstelle: Suchtreffer | Fundstelle: EWI-Zusammenfassung dena-Leitstudie 10/2021, PDF S. 7 | C → B |
| `d04.strom_2030_lfs3` | hinweis | 765–792 (C) | 765–792 (C), Widerspruch zu 594–638 offen | C |
| `d05.netzengpass_kosten_mio_eur` | text, wert | {"2019": 1288, "2020": 1448, "2021": 2306, "2022": 4248, "2023": 3335, "2024": 2954, "2025": 3071} | {"2019": 1279.0, "2020": 1432.4, "2021": 2285.6, "2022": 4248, "2023": 3335, "2024": 2954, "2025": 3071} | B |
| `d05.dez2024_reserven_gw` | konfidenz, wert | {"markt": 3.4, "reserven_min": 12, "reserven_max": 13} | {"markt_06_11_2024": 4.5, "markt_12_12_2024": 3.4, "reserven_min": 12, "reserven_max": 13} | A → B |
| `d05.df_wind_laengste_phase_h` | konfidenz | A | B | A → B |
| `d05.df_ereignisse_ge10h_2016_2025` | hinweis, konfidenz | {"value": 1422, "confidence": "A"} | {"value": 1422, "nachrechnung": 1426, "confidence": "B"} | A → B |
| `d05.df_ereignisse_ge48h_pro_jahr` | hinweis, konfidenz | {"min": 2, "mid": 4.0, "max": 7, "confidence": "A"} | {"min": 2, "mid": 4.0, "max": 7, "nachrechnung_mittel": 4.18, "confidence": "B"} | A → B |
| `d05.negative_preisstunden` | konfidenz | A | B | A → B |
| `d05.vsm2025_zusatzbedarf_steuerbar_2035_gw` | konfidenz | A | B | A → B |
| `d05.elektrolyse_installiert_gw_2026` | text | {"value": 0.2, "ewi": "181 MW laut Suche"} | {"value": 0.2, "ewi_mw_01_2026": 181} | A |
| `d05.ldes_bedarf_europa_twh` | konfidenz, text | {"primaer_gelesen": false} | {"min": 159, "mid": 351, "primaer_gelesen": true} | B → B |
| `d05.df_europa_extrem_1996_97_tage` | hinweis, konfidenz | {"value": 55, "primaer_gelesen": false} | {"value": 55, "verfuegbarkeit": "knapp die Hälfte des langjährigen Mittels", "de_insel_1995_96_tage": 109, "de_insel_verfuegbarkeit": "etwa ein Drittel", "primaer_gelesen": true} | B → B |
| `d05.agora_speicher_ausspeisung_2045_gw` | text | {"abgrenzung": "inkl. V2G"} | {"1h": 538, "24h": 24, "1woche": 3.3, "abgrenzung": "Großspeicher und Heimspeicher (Fußnote *); E-Mobilität getrennt ausgewiesen", "quelle_abbildung": "Agora Energiewende und Prognos (2024)… | B |
| `d05.fa_v3_h2_turbine_kaverne_mrd_eur` | hinweis | {"min": 38, "mid": 69, "max": 111} | {"min": 38, "mid": 69, "max": 111, "hinweis": "Kaverne nur für ein 5-Tage-Ereignis (10–15 TWh H2); bei Auslegung auf 80–95 TWh (Agora, INES/DBI) Kavernen ≈ 56 Mrd. €, V3 grob 90–150 Mrd. €;… | B |
| `d05.fa_v4_stromvkg_mrd_eur_pro_jahr` | hinweis | {"min": 9.4, "mid": 10.9, "max": 11.9} | {"min": 9.4, "mid": 10.9, "max": 11.9, "bei_hoechstwert_244000": {"min": 14.8, "mid": 17.1, "max": 18.7}, "hinweis": "Zuschlagswerte 129.551–189.970 €/rMW·a bei 5,16 GW; Gebotsvolumen gesam… | B |
| `d05.df_5d_luecke_ziel2030_twh` | hinweis | {"min": 4.82, "mid": 5.71, "max": 6.96} | {"min": 4.82, "mid": 5.71, "max": 6.96, "nachrechnung": {"min": 4.87, "mid": 5.73, "max": 6.97}, "sensitivitaet_bestand_2026_11": {"min": 6.3, "mid": 6.83, "max": 7.52}} | B |
| `d05.batterie_capex_pvffa_eur_kwh` | hinweis | {"hinweis": "Differenz zu strommix ungeklärt"} | {"hinweis": "ISE: PV-gekoppelte Batterie (>1 MWp, 3:2), €/kWh Nutzkapazität inkl. Installation, ohne MwSt., Preisstand 2024; strommix: schlüsselfertiges 4-h-Großsystem Europa 2026 (nicht pr… | B |
| `d06.acer_70pct_core_wohlfahrt_mio_eur` | konfidenz, text | 580 Mio. EUR mindestens wären gewonnen worden; EU-Engpasskosten 2023 4,2 Mrd. EUR (C, nicht gelesen) | 580 Mio. EUR Gesamtnutzen der 70-%-Regel in der Core-Region 2024 (at least), davon 240 Mio. EUR 2024 realisiert, 340 Mio. EUR offen; EU-Engpasskosten 2024: 4,3 Mrd. EUR für 60 TWh | C → B |
| `d06.nep_nettoimport_2037_a_twh` | fundstelle | Fundstelle: Kap. 3.2.1, S. 68 | Fundstelle: Kap. 3.1, S. 69 | A → B |
| `d06.nep_nettoimport_2045_twh` | fundstelle | Fundstelle: Kap. 3, Zusammenfassung S. 66 und Kap. 3.2.1 S. 68 | Fundstelle: Kap. 3, Zusammenfassung S. 67; Kap. 3.1, S. 69 | A → B |
| `d06.nep_handelstransit_2045_twh` | fundstelle | Fundstelle: Kap. 3.1, S. 71 | Fundstelle: Kap. 3.1, S. 72 | A → B |
| `d06.ntc_2040_2045_pfad_ab_gw` | fundstelle | Fundstelle: Kap. 6.3, S. 121 | Fundstelle: Kap. 6.3, S. 122 | A → B |
| `d06.ntc_2045_pfad_c_gw` (Zusatz) | fundstelle | (gilt laut Korrektur auch hier) Fundstelle: Kap. 6.3, S. 121 | Fundstelle: Kap. 6.3, S. 122 | A → B |
| `d06.ntc_bmwe_o45_strom_gw` (Zusatz) | fundstelle, konfidenz | (gilt laut Korrektur auch hier) Fundstelle: Kap. 6.3, S. 121 (Zitat BMWE-Langfristszenarien) | Fundstelle: Kap. 6.3, S. 122 (Zitat BMWE-Langfristszenarien) | B → B |
| `d06.eu_mindestkapazitaet_handel_pct` | hinweis | confidence A, eine Quelle (Szenariorahmen) | confidence A, zwei Quellen: Szenariorahmen 2027 S. 116/121 und ACER MMR 2025 S. 5 | A |
| `d06.eu_klimaziel_2040_pct` | konfidenz, text | C, primaer_gelesen false | 90 % netto ggü. 1990, davon 85 % heimisch und bis zu 5 % internationale Gutschriften; Annahme März 2026. 'ab 2036' nicht wörtlich bestätigt (Kommission: 'second part of 2030-2040') | C → B |
| `d06.fr_kernkraft_winter_mittel_gw` | text | Dez-Feb; installiert 63,0 GW | Jan+Feb+Dez desselben Kalenderjahres (2023: 42,0 GW, Min 23,7; 2024: 47,1 GW, Min 31,8); installiert 2023 61,4 GW, 2024 63,0 GW | B |
| `d06.importpreis_2024_eur_mwh` | text | Exportpreis 57,4 (2023: 79,8; 2025: 69,0) | Exportpreis ohne Luxemburg 57,4 / 79,8 / 69,0; mit Luxemburg 60,0 / 81,7 / 71,4 EUR/MWh | B |
| `d06.gleichzeitige_flaute_stunden` | fundstelle | Fundstelle: DE und Nachbar-Aggregat beide unter 10 % CF; DE allein unter 10 %: 2.380 (2023), 2.481 (2024) | Fundstelle: DE und Nachbar-Aggregat beide unter 10 % CF; DE allein unter 10 %: 2.382 (2023), 2.481 (2024) | B |
| `d07.stresstest_kostenaufschlag_grossanlage_pct` | text, wert | 27; min 7.5 / mid 27 / max 57 | 10.3; min 2.9 / mid 10.3 / max 21.8 | B |
| `d07.stresstest_modulpreisfaktor` | hinweis | 1.25 / 1.9 / 2.9 als Folge des Lieferstopps | Werte unverändert, aber aufteilen: Normalisierung auf China-Mindestpreis 1,83 (15,9/8,7), Aufschlag Nicht-China gegen China-Mindestpreis SOA 1,04, EU skaliert 1,60 | B |
| `d07.de_import_china_energiewendegueter_2025_mio_eur` | text, wert | 11750 | 11748 | B |
| `d07.hhi_de_rohoel_import_2021` | wert | 1788 | 1878 | B |
| `d07.de_fossile_nettoimportrechnung_mrd_eur` | fundstelle | Fundstelle: Tabelle 3 (Destatis), S. 11 | Fundstelle: AGEB Jahresbericht 2024, Tabelle 3, gedruckt S. 10 (PDF-S. 12) | B |
| `d07.de_importabhaengigkeit_gas_2024_pct` | konfidenz, wert | 91.6 | 91.6 | A → B |
| `d07.de_importabhaengigkeit_gesamt_2024_pct` | wert | 66.8 | 66.8 | A |
| `d07.de_russland_anteil_steinkohleimport_2021_pct` | text, wert | 50.1 | 52.6 | B |
| `d07.eu_extra_import_china_anteil_trafo_gt10mva_2025_pct` | text, wert | 55 | 54.6 | B |
| `d07.eu_extra_import_china_anteil_pv_module_2025_pct` | text | Anstieg 38 → 98 % ohne Kontext | Wert bestätigt (98,4); Hinweis: 2013–03.09.2018 EU-Antidumping-/Ausgleichszölle mit Mindestimportpreis, Startwert 2015 dadurch gedrückt; Mengenanteil 46,8 → 99,3 % | B |
| `d07.nzia_eigenfertigung_ziel_2030_pct` | text | 40 (B, nicht gelesen) | 40, indikativer Richtwert ('approaches or reaches at least 40 % of annual deployment needs'), nicht bindend | B |
| `d07.pv_modulkapazitaet_ausserhalb_china_gw` | text | 180 | 180 (Ablesung ca. 184 inkl. JP/KR 7 und LatAm 4); dazu Zellen SO-Asien ca. 45 GW, Wafer ca. 15 GW, EU-Polysilizium ca. 30 GW im Betrieb | C |
| `d08.ekerosin_kosten_easa_eur_t` | text, wert | min 6820 / mid 7695 / max 8590 | min 6820 / mid 7695 / max 9405 | C |
| `d08.kerosin_fossil_eur_t` | fundstelle, text, wert | min 280 / mid 600 / max 816 | min 280 / mid 600 / max 720 | B |
| `d08.model_lkw_h2_zusatz_strom_twh` | hinweis | mid 140 TWh | mid 140 TWh (Modell); UBA-Gegenrechnung 115–132 TWh ergänzen | C |
| `d08.elektrolyse_wirkungsgrad` | text | UBA 67/69/72 % (PEM) | UBA 67/69/72 % (alkalische Elektrolyse); PEM 67/71/80 % | B |
| `d08.lkw_bestand_2023_tsd` | fundstelle | Fundstelle: Tab. 12, S. 46 | Fundstelle: Tab. 12, S. 38 | B |
| `d08.pkw_strombedarf_fcev_gegen_bev` | fundstelle, text | Frage 2 | Frage 5 (zwei- bis dreimal; Mittelklasse 54/18 kWh = Faktor 3) | B |
| `d08.elektrolyse_capex_de_eur_kw` | fundstelle | Fundstelle: S. 27-28 | Fundstelle: DIHK/r2b 2026, S. 28 (2.000-3.000); 2.200 EUR/kW auf S. 29 (Parameter zu Abb. 3-2) | B |
| `d08.refueleu_synth_quote` | hinweis, konfidenz | C, primaer_gelesen false | 2030: 1,2 % (Jahresmindestwert 0,7 %), 2050: 35 % als B über UBA FAQ Frage 10; Zwischenwerte 2032–2034: 2 %, 2035: 5 %, 2040: 10 %, 2045: 15 % weiter C | C → B |
| `d09.kkw_reakt_leistung_gw` | wert | {"min": 0, "mid": 4.1, "max": 6.8} | {"min": 0, "mid": 2.7, "max": 12} | C |
| `d09.eua_preis_nov2026_eur_t` | konfidenz, wert | 81 | {"min": 81, "mid": 88, "max": 91} | B → C |
| `d09.ets1_cap_null_jahr_geltendes_recht` | text | 2039 | 2039 | A |
| `d09.ets1_lrf_vorschlag_pct` | konfidenz, text | B, primaer_gelesen false (EPRS/ICAP) | {"2031_2035": 3.7, "2036_2040": 1.7} | B → B |
| `d09.darlington_smr1_budget_mrd_cad` | text | note: wird überschritten | note ergänzen: 7,7 Mrd. CAD schließen gemeinsame Infrastruktur für vier Blöcke ein; Gesamtbudget 20,9 Mrd. CAD | B |
| `d09.ccs_mehrkosten_braunkohle_eur_mwh` | text, wert | {"min": 170, "max": 345} | {"min": 169, "max": 338} | C |
| `d09.epr2_kosten_mrd_eur2020` | text | 72.8 | 72.8 | B |
| `d09.r21_ets_minderung_seit_2005_pct` | text | S. 15 entspricht 'wörtlich' Kommissionsaussage | S. 15 ähnelt der Kommissionsaussage −39 %/+71 % (1990–2024); Kommission nennt für ETS-Sektoren −50 % seit 2005 (IP/26/1596) | A → B |
| `d09.kkw_reakt_bundesregierung_gespraeche` | konfidenz | B, hib | 0 | B → B |
| `d09.msr_loeschschwelle_mio` | hinweis | {"bisher": 400, "einigung_okt_2026": 700} | {"bisher": 400, "einigung_okt_2026": 700} | B |
| `d09.schiefergas_vs_uslng_einsparung_vollkette_pct` | wert | {"min": 6, "max": 22} | {"min": 6, "mid": 15, "max": 22} | B |
| `d10.de_industriestrom_id_2026s1_ct_kwh` | konfidenz | confidence A | confidence B (Wert 17,42 bestätigt) | A → B |
| `d10.de_haushaltsstrom_2026s1_ct_kwh` | konfidenz | confidence A | confidence B (Wert 36,18 bestätigt) | A → B |
| `d10.de_industriegas_i3_2026s1_ct_kwh` | konfidenz | confidence A | confidence B (Wert 6,82 bestätigt) | A → B |
| `d10.de_strompreis_haushalt_beschaffung_2019_2023_2025_ct` | konfidenz, text, wert | min 5.81 / mid 19.92 / max 14.81 | {"v2019": 5.81, "v2023": 19.92, "v2025": 14.81} | A → B |
| `d10.de_strompreis_haushalt_netz_2019_2025_ct` | konfidenz | confidence A | confidence B (7,40 / 11,30 bestätigt) | A → B |
| `d10.de_strompreis_haushalt_eeg_position_2021_2025_ct` | konfidenz, text, wert | min 6.75 / max 0.28 | {"v2021": 6.75, "v2025": 0.28} | A → B |
| `d10.eeg_bundeszuschuss_2025_mrd_eur` | konfidenz, text, wert | 16.5 | 16.53 | C → B |

Zusatz-Zuordnungen (eine Korrektur, mehrere Parameter, im Text der Korrektur ausdrücklich genannt): `d01.uba_vorkette_pipeline_norwegen_g_gj` → `d01.uba_vorkette_lng_usa_g_gj`; `d06.ntc_2040_2045_pfad_ab_gw` → `d06.ntc_2045_pfad_c_gw`, `d06.ntc_bmwe_o45_strom_gw`.

## 4. Nicht auf Parameter angewendete Korrekturen

### 4.1 Textkorrekturen (58)

Diese Korrekturen betreffen Kernaussagen, Textstellen oder Zahlen ohne Parameter-ID im Dossier; sie stehen unverändert in `textkorrekturen` (je Dossier). Einordnung: `kernaussage` = Aussage des Dossiers, `text` = Zahl oder Formulierung im Fließtext, `neuer_wert` = Wert, den der Prüfer neu gefunden hat und der noch kein Parameter ist.

| Dossier | ID | Einordnung | alt | neu |
|---|---|---|---|---|
| 01 | `zew_politikkosten_bau_2028_2048_mrd_eur` | neuer_wert | null | 5257 |
| 01 | `zew_effekt_ohne_nationale_massnahmen_mrd_eur` | neuer_wert | null | {"min": 824, "max": 1071} |
| 01 | `r21_zew_emissionen_2048` | text | nicht geprüft (D-5: 500 Mio. t bis 2048) | ZEW-Zielpfade 2048: ETS1 ca. 0,43 Gt, ETS2 ca. 0,5 Gt (Grafikablesung ±0,05), zusammen ca. 0,9 Gt |
| 01 | `diw_mcc_2020_dunkelflaute` | text | Studie nicht gelesen, nicht eindeutig bezeichnet | Ohlendorf/Schill, Environ. Res. Lett. 15 (2020) 084045: jährlich ca. 5 Tage mit mittlerem Wind-Kapazitätsfaktor (an Land) unter 10 %, alle 10 Jahre k… |
| 01 | `ewi_netzausbau_2045_mrd_eur` | text | Websuche (C): rund 732 Mrd. EUR, EWI/ef.Ruhr 2024 für Netze BW | 732 |
| 01 | `kernaussage_9_monitoring` | kernaussage | R21 widerspricht seiner eigenen Quelle (WD S. 1) | WD S. 1 betrifft den Bericht der Expertenkommission, R21 spricht vom Monitoring-Bericht der Bundesregierung; tragender Beleg ist WD S. 5 (8. Monitori… |
| 01 | `inventar_wendland_seiten` | text | Nr. 42 'S. 12', Nr. 107 'S. 11', Nr. 115 'S. 4 und 11' | PDF 11 und 17 (4 ct), PDF 16 (82/105, 350 Mrd., 7.000 EUR/kW), PDF 3 und 31 (350 Mrd.), PDF 4 (310-Grafik) |
| 02 | `kernaussage_9_akzeptanz_mehrkosten` | kernaussage | Akzeptanz- und Verzögerungsszenarien kosten 30 bis 100 % mehr | Beharrungs- und Akzeptanzszenarien kosten 16 bis 235 % mehr (ISE 2021 +16 bis +32 %, ISE 2024 +30 bis +57 %, Ariadne NFhoch 52 statt 15,5-16 Mrd. EUR… |
| 02 | `kernaussage_4_mehrkosten_bip` | kernaussage | Mehrkosten nach Abzug eingesparter Energiekosten rund 0,4 bis 1,9 % (Ausreißer nach oben: ISE 2021 Inakzeptan… | rund 0,4 bis 2,9 % des BIP 2024; am oberen Rand ISE 2021 (Referenz 2,2 %, Beharrung 2,5 %, Inakzeptanz 2,9 %), die einzige primär gelesene Studie mit… |
| 02 | `kernaussage_4_brutto_bip` | kernaussage | Brutto-Werte rund 4,4 bis 12 % des BIP 2024 | Brutto-Werte für das ganze Energiesystem oder alle Sektoren rund 4,4 bis 12,3 %; mit Teilabgrenzungen (nur Strom, nur Energiewende-Investitionen, DIH… |
| 02 | `kernaussage_3_konfidenz` | kernaussage | Konfidenz A für die Spannen; G1 4,8-13,3, G2 5-11,3 Bio. EUR | Konfidenz B; G1 3,44 (nur Strom) bzw. 4,8 bis 13,3 Bio. EUR; G2 0,72 (nur Energiewirtschaft) bzw. 2,4 bis 11,3 Bio. EUR |
| 02 | `netze_spanne_uen_vn` | text | Studien: 651-732 Mrd. EUR ÜN+VN | Studien: 675 (BET/EWI 2025: 440 ÜN + 235 VN), 732 (ef.Ruhr/EWI 2024, Preisbasis 2024), 792 (440 ÜN + 352 VN aus den Langfristszenarien); BRH 2024: üb… |
| 02 | `bet_ewi_netze_2025` | text | BET/EWI-Monitoring im Original nicht gelesen (C) | ÜN ~440 Mrd. EUR (NEP 2023, vormals 320 bzw. 324), VN rund 235 Mrd. EUR bis 2045 (206 Ausbau + 29 Ersatz), laut Bericht 'deutlich über 235' und wahrs… |
| 02 | `brh_netzinvestitionen_mrd_eur` | neuer_wert | (fehlt) BRH: keine eigene Gesamtkostenzahl | BRH: Netzausbau 2024-2045 mehr als 460 Mrd. EUR (BNetzA-Schätzung; ÜN mind. 313,7, VN gut 150), in den Strompreisen noch nicht enthalten; Vorwurf an… |
| 02 | `klimafolgen_schaeden_2000_2021_mrd_eur` | text | >=145 Mrd. EUR, Konfidenz C | 145 Mrd. EUR realisierte Klimaschäden 2000-2021, davon 80 Mrd. seit 2018 |
| 02 | `kfw2021_mehrinvestitionen_bip_tabelle` | text | 1,7 % BIP 2024 | 1,6 % BIP 2024 (72 / 4.386,94) |
| 02 | `kfw2026_ksi_brutto_bip_tabelle` | text | 6,2-7,0 % BIP 2024 | 6,2-6,8 % BIP 2024 (270-300 / 4.386,94) |
| 02 | `kfw_fossile_importe_mrd_eur` | text | 2024 laut KfW im Mittel 81 Mrd. EUR fossile Importe pro Jahr | zuletzt im Mittel rund 81 Mrd. EUR fossile Importe pro Jahr (Mehrjahresmittel nach Rode 2025) |
| 02 | `ise2021_bip_bezug` | text | ISE 2021: Jahresmittel 1 % bis 3,0-3,5 % des BIP 2020 (Studienangabe übernommen) | Hinweis ergänzen: ISE rechnet mit BIP 2020 = 3,806 Bio. EUR; Eurostat 3.477,67 Mrd. EUR; die Anteile der Studie sind dadurch rund 9 % zu niedrig (Ref… |
| 03 | `abregelung_anteil_offshore_2023_pct` | neuer_wert | null | {"value": 24.3, "vls_korrigiert_h": 3485} |
| 03 | `kernaussage_7_ec_vs_uba_2015_2022` | kernaussage | 0,0 bis 1,0 % | −1,7 bis +1,0 % (Wind 2015–2022 auf die GWh gleich; PV gesamt 2021 −0,9 %, 2022 −1,7 %) |
| 03 | `ec_vs_ageb_netto_abweichung_wind_pv_pct` | neuer_wert | null | {"min": -0.8, "mid": 0.0, "max": 0.3} |
| 03 | `lesehinweis_10pct_gw` | text | 2015 etwa 8 GW, 2025 etwa 19 GW | 2015 rund 8,4 GW, 2025 rund 19,6 GW |
| 03 | `nicht_erreichbar_ageb` | text | www.ag-energiebilanzen.de: 403, Abgleich über UBA/SMARD | erreichbar über ag-energiebilanzen.de; Strerz-Abgabe September 2026 gelesen |
| 04 | `ist_eev_de_2025_ageb` | neuer_wert | null | 2302.2 |
| 04 | `kernaussage_1_tiefstwert` | kernaussage | 2024 niedrigster Wert seit der Wiedervereinigung | 2024 niedrigster Wert seit 1990 in der Eurostat-Abgrenzung; nach AGEB war 2023 das Tief (8.123 PJ), 2025 stieg die Endenergie auf 8.288 PJ |
| 04 | `strom_ist_2025` | text | 512–526 | 522,4 (ohne Pumpspeicher) / 529,3 (mit Pumpspeicher) |
| 04 | `prozesswaerme_temperatur_2024` | neuer_wert | Lücke (nicht ausgewiesen) | {"unter_100": 47.5, "100_200": 79.7, "200_500": 42.9, "500_1000": 107.2, "1000_1500": 153.1, "ueber_1500": 28.7, "summe": 459.1, "unit": "TWh/a"} |
| 04 | `fossil_anteil_eev_2024` | text | 61 | {"min": 60.9, "mid": 62.2, "max": 64.6, "unit": "%"} |
| 04 | `erk_budget_2021_2030` | text | 60–100 Mt bzw. rund 30 Mt (Suchtreffer, C) | {"kumuliert_2021_2030_ueberschreitung": "60–100 Mt", "luecke_2030": 29.8, "budget": 6199, "unit": "Mt CO2-Äq."} |
| 06 | `kernaussage_7_dauerhafter_import` | kernaussage | Die Netzplanung erwartet dauerhaften Netto-Import. | Die Netzplanung erwartet für 2037 und 2045 Netto-Import (25-91 TWh), im Trendszenario 2032 dagegen Netto-Export von 32 TWh (Export 116, Import 83 TWh… |
| 06 | `acer_macztde_pct_fmax` | neuer_wert | Lücke: Einhaltung der 70-%-Regel durch Deutschland | Deutschland, mittlere minimale MACZT in Core: 2022 38 %, 2023 41 %, 2024 50 % von Fmax (Ziel 70 % bis Ende 2025) |
| 06 | `kernaussage_3_preisspitzen` | kernaussage | Der Verbund hilft in Preisspitzen sehr deutlich. | In Preisspitzen importiert Deutschland deutlich mehr als sonst (2024 Ø 11,1 GW gegen 6,4 GW in allen Importstunden); dass Spitzen mit Import zusammen… |
| 06 | `de_max_preis_2024_eur_mwh` | text | Presse: 900-1.000 EUR/MWh am 12.12.2024, nicht geprüft | 936,3 EUR/MWh, 12.12.2024 16:00 UTC |
| 06 | `kernaussage_5_nordische_leitung` | kernaussage | nur 1,4 GW zwischen Norwegen und Deutschland und 0,6 GW zu Schweden | direkt 1,4 GW (NO) und 0,6 GW (SE); indirekt zusätzlich über DKW/DKE (NO->DKW 1,4; SE->DKE 1,3; SE->DKW 1,4; DKW->DE 5,5; DKE->DE 2,6) und NL (NO->NL… |
| 06 | `kernaussage_8_hansa_powerbridge` | kernaussage | Schweden hat 2024 die Hansa PowerBridge (700 MW) ausgesetzt (laut Genehmigung, A) | Hansa PowerBridge I und II wurden von schwedischer Seite ausgesetzt; positiver Mehrwert in allen KNA, Wiederaufnahme aus deutscher Sicht begrüßenswer… |
| 08 | `K7_ekerosin_2050_spanne` | kernaussage | 89–166 €/MWh 2050 (Spanien/Marokko-Bedingungen) | 89,1–133,7 €/MWh (Spanien/Marokko 2050); Deutschland 2050: 115,0–166,1 €/MWh |
| 08 | `ekerosin_marokko_2030_dac` | text | 131,7–171,0 €/MWh (Marokko 2030, DAC) | 145,8–171,0 €/MWh (Marokko 2030, DAC) |
| 08 | `ekerosin_1700_eur_t` | text | 1.700 €/t Herstellkosten zukünftig (DAC) | 1.700 €/t Kostenbeispiel künftige Fischer-Tropsch-Anlage mit DAC in MENA |
| 08 | `K9_bestandsflotte_78` | kernaussage | eFuel Alliance/Porsche Consulting … Bestandsflotte 2030 noch zu rund 78 % Verbrenner | 78 % Verbrenner 2030 laut TUM-Studie (eauto-Dossier), nicht laut eFuel Alliance |
| 08 | `wirkungsmass_2030` | text | höchstens ein Zehntel bis ein Siebtel der 28 TWh | rund ein Siebtel (4,3 von 28 TWh; auf einheitlicher Basis von 75 % 4,3 von 30 TWh = 14 %) |
| 08 | `faktor_hochlauf` | text | Faktor vier bis sechzig | Faktor rund 4 bis 55 |
| 09 | `kernaussage_2_erster_block` | kernaussage | erster deutscher Neubau-Block bei Entscheidung 2027 realistisch bei 2038–2047 | 2040–2047 (max 2056), wie Tabelle 2.4 |
| 09 | `radiant_gesamt_neu` | neuer_wert | null | {"leistung_gw_netto": 12, "kosten_mrd_eur": {"min": 18, "max": 19}, "lcoe_eur_mwh": {"min": 33, "max": 46}, "wacc_pct": 7.38} |
| 09 | `radiant_gkn2_neu` | text | Neckarwestheim 2: Radiant 1,7 Mrd. €, 47 Monate (C, über Landtag BW) | {"kosten_mrd_eur": 1.7, "monate": 47, "lcoe_eur_mwh": {"wacc_7_38": 42, "wacc_4_25": 38}, "kkp2_kosten_mrd_eur": 4.4, "kkp2_monate": 63} |
| 09 | `kernd_reakt_kosten` | text | KernD laut Drs. 21/6126, C | 1–3 Mrd. € je Anlage, ca. 3 Jahre (Vortrag der AfD-Fraktion im Ausschuss) |
| 09 | `gundremmingen_abbaugenehmigung` | text | Gundremmingen C: dritte und letzte Abbaugenehmigung Mai 2024 | KRB II (Bundesregierung führt sie unter Gundremmingen B): 3. AG vom 28.05.2024 |
| 09 | `grohnde_status` | text | wie Brokdorf | wie Brokdorf; zusätzlich 2. Abbaugenehmigung am 12.05.2026 |
| 10 | `kernaussage_1_konfidenz` | kernaussage | Konfidenz A (Eurostat, KfW-Kapitel 3: etwa 80 % des Vorkrisenniveaus) | Konfidenz B; KfW-Zahl bezieht sich auf das Niveau vor der Energiekrise (Index Jan 2021 = 100, fünf Zweige inkl. C19), nicht auf die R21-Basis 'vor 20… |
| 10 | `kernaussage_1_hoechststand` | kernaussage | gegenüber dem Höchststand 2018: −20 bis −21 % | gegenüber 2018: −19,9 % (Papier) bis −21,1 % (Glas/Keramik); Höchststand bei Chemie und Papier war 2017 |
| 10 | `kernaussage_2_darstellung` | kernaussage | EU27: Chemie −16,0 %, Metall −12,2 % … Verarbeitendes Gewerbe EU27 +2,7 % | zusätzlich Papier EU27 −6,5 % (DE −18,2 %), Glas/Keramik EU27 −10,8 % (DE −20,0 %); EU27 C ohne Irland ≈ −1,4 % (ohne IE und DE ≈ +4,0 %, Näherung mi… |
| 10 | `eeg_bundeszuschuss_2024_mrd_eur` | neuer_wert | fehlt | 18,49 |
| 10 | `kernaussage_3_abstand_eu` | kernaussage | Vor der Krise +25 %; 2025-S2 +20 % | ergänzen: 2026-S1 +11,7 % (17,42 gegen 15,59); DE/FR im Band ID 1,57 (2019-S1) → 1,41 (2026-S1), im Band IE 1,26 → 1,50 |
| 10 | `kernaussage_9_kfw` | kernaussage | 270–300 brutto; 135–153 Mehrbedarf; Faktor R21/KfW 1,7–2,5 | zusätzlich 160–220 Mrd. €/Jahr Mehrbedarf gegenüber Status quo; Preisbasis €2024; Zeitraum 2025–2045 (21 Jahre); Faktor 1,7–2,6 |
| 10 | `kernaussage_10_ember` | kernaussage | Absolutmengen für UK/USA/JP/KR fehlen; UK 'teilweise reduziert' | Ember 2005→2024: UK fossil 299,8→99,7 TWh, Kern 81,6→40,6, EE 16,9→144,2, gesamt 398→284; Ersatzquote UK 1,89 gegen DE 1,54; JP Kern 293→85 TWh; KR u… |
| 10 | `bundesbank_energiepreis_wertschoepfung_industrie_pct` | neuer_wert | Lücke (Zahl nicht im Treffer) | −4,4 % Bruttowertschöpfung Industrie (direkt), Gesamtwirtschaft −2,1 %, bei dauerhaft mehr als verdoppelten Energiepreisen ggü. 2019; Modellrechnung… |
| 10 | `svr_energiekostenanteil` | text | IW 2020 3,3–4,9 % BPW; Statista 2006 20–25 % BWS (C) | SVR: 2–5 % der Gesamtkosten für die meisten Bereiche; Median-Unternehmen 1,6 % vom Umsatz (Mittel 2,3 %); Keramik 8,1 % vom Umsatz; Grundstoffchemie… |
| 10 | `kernaussage_1_wertschoepfung` | kernaussage | nicht in der Kernaussage | ergänzen: reale Wertschöpfung Verarbeitendes Gewerbe 2025 vs. 2019 −4,5 % gegen Produktionsindex −11,3 % |

### 4.2 Nicht zugeordnet (4)

Zweifelsfälle: Name oder Thema passen zu einem Parameter, der Gegenstand aber nicht eindeutig. Sie werden **nicht** angewendet; die Zuordnung braucht eine Entscheidung (Tabelle `NICHT_ZUGEORDNET` im Skript, je Zeile begründet).

| Dossier | ID | alt → neu | Warum nicht zugeordnet |
|---|---|---|---|
| 02 | `uba_kostensatz_mk40_eur_t` | UBA Methodenkonvention 4.0: 0 %-Satz 990-1.240 EUR/t, 1 %-Werte niedriger (C, Fragmente) → EUR2025 pro t CO2, 1 % Zeitpräferenz: 345 (2025), 350 (2026), 355 (2027), 375 (2030), 485 (2050); 0 %: 990, 1.000, 1.010, 1.050,… | Neuer, primaer gelesener CO2-Kostensatz (Methodenkonvention 4.0, EUR2025) als Ersatz fuer d02.uba_kostensatz_2024_eur_t (C, nicht pruefbar). Gleiche Groesse, andere Konvention und Preisbasis; welche das Modell nutzt, ist offen (siehe Dopplungen). |
| 04 | `strom_2045_dena` | 698 / 910 (C) → 698 (2030) / 910 (2045) | Betrifft die dena-Werte 698/910 TWh. Parameter d04.strom_2045_alle_inkl_dena ist ein Sammelwert aus fuenf Quellen (dena nur als Untergrenze 910); die Korrektur hebt einen Einzelwert, nicht den Sammelwert an. Nicht geraten. |
| 08 | `ptl_wirkungsgrad_kerosin_low` | low 0,57 mit H2_per_EF 1,35 und eta_el 0,75 → low entweder 0,51 (Fischer-Tropsch, konzentriert, langfristig) oder H2_per_EF für den Methanol-Pfad anpassen; Hinweis auf η ≈ 0,3… | Betrifft die Modell-Spalte 'low' (eta 0,57 mit H2_je_Kraftstoff 1,35), also eine Setzung im Reglerbereich, nicht den Parameter d08.ptl_wirkungsgrad_kerosin (min 0,37 / mid 0,45 / max 0,57). Der Namensbestandteil passt, der Gegenstand nicht. |
| 08 | `D_EF_setzung` | 100 / 150 / 195 TWh, Herkunft Ariadne 180–195 → Spanne beibehalten oder erweitern; Ariadne PDF-S. 23 (51–128 TWh Schiff/Flug, nichtelektrisch) als zweiten Ariadne-Wert im Modell… | Betrifft die Modell-Setzung D_EF (100/150/195 TWh). Der inhaltliche Kern (zweiter, niedrigerer Ariadne-Wert 51-128 TWh) ist ueber die Entscheidung E-Fuel-Menge in d08.efuel_bedarf_2045_ariadne_twh eingearbeitet; die Setzung selbst ist kein Parameter. |

### 4.3 Zuordnungstabelle (Begründung je Zeile)

| Regel | Eintrag | Begründung |
|---|---|---|
| Zusatz-Zuordnung | `d01.uba_vorkette_pipeline_norwegen_g_gj` → auch `d01.uba_vorkette_lng_usa_g_gj` | Die Begründung der Korrektur sagt wörtlich: „gilt auch für uba_vorkette_lng_usa_g_gj“ (gleiche Quelle UBA CC 21/2019, gleiche Seitenkonkordanz). |
| Zusatz-Zuordnung | `d06.ntc_2040_2045_pfad_ab_gw` → auch `d06.ntc_2045_pfad_c_gw`, `d06.ntc_bmwe_o45_strom_gw` | Die Begründung nennt beide IDs; der Prüfbericht 06 führt `ntc_2045_pfad_c_gw` zusätzlich mit „Seite 122“. |
| Konfidenz-Ausnahme | `d02.aurora_gesamtkosten_bio_eur` | Die Korrektur trägt A/true für die Drucksache 21/903 (Urheberschaft der 172 Mrd. EUR/a), nicht für die Aurora-Zahl; Prüfbericht 02 führt die Aurora-Zahl weiter als C/false. |
| Konfidenz-Ausnahme | `d07.eu_extra_import_china_anteil_pv_module_2025_pct` | primaer_gelesen false der Korrektur gilt dem Zollkontext (Suchtreffer); der Wert 98,4 % ist am Comext-Original bestätigt. |
| Konfidenz-Ausnahme | `d07.de_importabhaengigkeit_gas_2024_pct` | Prüfbericht: A nur für „über 90 %“, der Punktwert ist methodenabhängig (Eurostat 91,6 gegen AGEB 95,6): Punktwert B, Spanne als Feld `spanne`. |
| nicht zugeordnet | `d04.strom_2045_dena`, `d08.ptl_wirkungsgrad_kerosin_low`, `d08.D_EF_setzung`, `d02.uba_kostensatz_mk40_eur_t` | siehe 4.2. |
| Text, obwohl ID ähnlich | `d09.kernaussage_2_erster_block` | Der Parameter `neubau_de_erster_block_jahr` (2040 / 2047 / 2056) ist richtig; die Kernaussage des Dossiers war inkonsistent und wird auf den Parameter angeglichen. Korrigiert wird der Text, nicht der Parameter. |
| Text, obwohl Wert verwandt | `d01.ewi_netzausbau_2045_mrd_eur` | Dasselbe Thema wie `d02.efruhr_ewi_netzinvestitionen_mrd_eur` (732 Mrd. EUR), aber Dossier 01 führt keinen Parameter dazu; die Korrektur von Dossier 02 ist angewendet, die Dopplung in Abschnitt 7 gelistet. |
| Text, obwohl Wert verwandt | `d03.kernaussage_7_ec_vs_uba_2015_2022` | Betrifft die Spanne 2015-2022 im Text; der Parameter `ec_vs_uba_netto_abweichung_wind_pv_pct` (2015-2025: -2,7 / 0,0 / 1,0) ist laut Prüfbericht richtig. |

## 5. Herabstufungen und Hochstufungen der Konfidenz

### 5.1 Herabstufungen (53)

| Parameter | von | nach | primaer_gelesen | Grund |
|---|---|---|---|---|
| `d00.r21_kosten_zitat_min_bio_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d00.r21_kosten_zitat_max_bio_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d00.wd_kosten_gesamt_bio_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d00.wd_kosten_pro_jahr_mrd_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d00.r21_factsheet_a_batterie_bio_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d01.r21_netzkosten_dihk_zitat_mrd_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d01.r21_factsheet_a_batterie_bio_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d01.r21_factsheet_a_speicher_twh` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d01.r21_factsheet_b_neubau_mrd_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d01.r21_factsheet_h_zuteilung_angegeben_t` | A | C | true → false | Prüfbericht schlägt Herabstufung vor |
| `d01.r21_factsheet_h_zuteilung_gerechnet_t` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d01.r21_factsheet_h_familie_monat_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d01.r21_ets_minderung_seit_2005_pct` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d01.r21_zew_ersparnis_mrd_eur` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d02.bip_de_2024_mrd_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d04.strom_2037_nep` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d04.strom_2030_monitoring_2025` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d04.jaz_bestand_luft_wasser` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d04.epkw_verbrauch_real` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d04.pkw_verbrenner_verbrauch_flotte` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d04.kernnetz_laenge` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d04.kernnetz_kosten` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d05.df_wind_laengste_phase_h` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d05.df_ereignisse_ge10h_2016_2025` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d05.df_ereignisse_ge48h_pro_jahr` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d05.dez2024_reserven_gw` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d05.r21_fa_speicher_twh` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d05.r21_fa_kosten_mrd_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d05.pumpspeicher_de` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d05.vsm2025_zusatzbedarf_steuerbar_2035_gw` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d05.negative_preisstunden` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d06.ntc_2040_2045_pfad_ab_gw` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d06.ntc_2045_pfad_c_gw` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d06.eu_verbundziel_2030_pct` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d06.nep_nettoimport_2037_a_twh` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d06.nep_nettoimport_2045_twh` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d06.nep_handelstransit_2045_twh` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d06.fr_bruttoerzeugung_2022_twh` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d07.de_importabhaengigkeit_gas_2024_pct` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d09.r21_fsb_reakt_kosten_mrd_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d09.r21_fsb_reakt_leistung_gw` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d09.r21_fsb_reakt_jahr` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d09.r21_fsb_neubau_kosten_mrd_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d09.r21_fsb_neubau_capex_eur_kw` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d09.eua_preis_nov2026_eur_t` | B | C | false → false | Prüfbericht schlägt Herabstufung vor |
| `d09.r21_ets_minderung_seit_2005_pct` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d09.r21_zew_ersparnis_mrd_eur` | A | B | true → true | Regel A: nur eine Quelle (oder nicht primär gelesen) |
| `d10.de_industriestrom_id_2026s1_ct_kwh` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d10.de_haushaltsstrom_2026s1_ct_kwh` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d10.de_industriegas_i3_2026s1_ct_kwh` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d10.de_strompreis_haushalt_beschaffung_2019_2023_2025_ct` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d10.de_strompreis_haushalt_netz_2019_2025_ct` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |
| `d10.de_strompreis_haushalt_eeg_position_2021_2025_ct` | A | B | true → true | Prüfbericht schlägt Herabstufung vor |

Davon durch die Regel „A nur bei mehreren unabhängigen Quellen und primär gelesen“ (Parameter, die A tragen, aber nur eine Quelle nennen): **38**. Ausgenommen sind 14 Parameter, bei denen der Prüfbericht ausdrücklich eine zweite unabhängige Quelle nennt (Feld `zweite_quelle`, Tabelle `ZWEITE_QUELLE` im Skript): `d04.ist_pev_de_2024_eurostat_gae`, `d04.ist_bruttostrom_2024`, `d04.thg_ksg_ziel_2030`, `d04.strom_ist_2017`, `d04.strom_ist_2024_bundesregierung`, `d05.batterie_bestand_de_2026_11`, `d05.elektrolyse_installiert_gw_2026`, `d06.de_netto_import_2023_twh`, `d06.de_netto_import_2024_twh`, `d06.eu_mindestkapazitaet_handel_pct`, `d07.de_importabhaengigkeit_gesamt_2024_pct`, `d07.de_importabhaengigkeit_oel_2024_pct`, `d08.h2_elektrolyse_ziel_2030_gw`, `d09.ets1_cap_null_jahr_geltendes_recht`.

### 5.2 Hochstufungen (15)

| Parameter | von | nach | primaer_gelesen | Quelle |
|---|---|---|---|---|
| `d01.wendland_qc_preis_mischsystem_eur_mwh` | C | B | false → true | Prüfbericht |
| `d01.wendland_qc_preis_ee_system_eur_mwh` | C | B | false → true | Prüfbericht |
| `d02.efruhr_ewi_netzinvestitionen_mrd_eur` | C | B | false → true | Prüfbericht |
| `d03.abregelung_2023_offshore_onshore_gwh` | C | B | false → true | Prüfbericht |
| `d04.ist_pev_de_2024_eurostat_gae` | B | A | true → true | Prüftabelle |
| `d04.ist_pev_de_2025_ageb_pj` | C | B | false → true | Prüfbericht |
| `d04.ist_verkehr_lkw_bus_rest_2024` | C | B | true → true | Prüfbericht |
| `d04.h2_2045_dena` | C | B | false → true | Prüfbericht |
| `d05.df_europa_extrem_1996_97_tage` | B | B | false → true | Prüfbericht |
| `d05.ldes_bedarf_europa_twh` | B | B | false → true | Prüfbericht |
| `d06.acer_70pct_core_wohlfahrt_mio_eur` | C | B | false → true | Prüfbericht |
| `d06.eu_klimaziel_2040_pct` | C | B | false → true | Prüfbericht |
| `d08.refueleu_synth_quote` | C | B | false → true | Prüfbericht |
| `d09.ets1_lrf_vorschlag_pct` | B | B | false → true | Prüfbericht |
| `d10.eeg_bundeszuschuss_2025_mrd_eur` | C | B | false → true | Prüfbericht |

## 6. Entscheidungen von Michael, eingearbeitet

Quelle der Überschreibung: „Entscheidung Michael 22.11.2026“ (Feld `source`; die frühere Quelle steht in `quelle_vor_entscheidung`, der Wert davor in `ueberschreibung`).

| Nr. | Thema | Festlegung | Parameter | Anmerkung |
|---|---|---|---|---|
| E01 | Gaspreis-Regler | 20 / 35 / 85 EUR/MWh (min / mid / max), Vorschlag aus Dossier 09, bestätigt. | `d09.modell_gaspreis_2030_2045_eur_mwh` | Setzung, keine Messgröße. Der Regler-Höchstwert 85 liegt unter dem TTF-Stand November 2026 (85,5-88,5, d09.preis_ttf_nov2026_eur_mwh); der obere Rand deckt den heutigen Preis also nicht ab. |
| E02 | Kernkraft-Neubaukosten | Spanne aus gebauten Projekten 7.500 / 12.000 / 17.500 EUR/kW, daneben das Szenario 'R21 wie veröffentlicht' mit 6.250 EUR/kW. | `d09.neubau_de_capex_eur_kw`, `d09.r21_fsb_neubau_capex_eur_kw` | 6.250 EUR/kW ist 310 Mrd. EUR / 49,6 GW aus Factsheet B; Preisbasis und Finanzierung im R21-Papier nicht angegeben. |
| E03 | Kernkraft-Reaktivierung | Mitte 2,7 GW (Isar 2 und Emsland), oberes Ende rund 12 GW laut Radiant-Gutachten, solange es nicht im Original gelesen ist. | `d09.kkw_reakt_leistung_gw` | 12 GW: Radiant, nicht primär gelesen (Wiedergabe der AfD-Fraktion in Drs. 21/7609 S. 1 und 21/6126 S. 4). |
| E04 | Wasserstoff-Lkw-Verhältnis (Setzungen Wasserstoff) | UBA-Wert als Mitte, die bisherige Setzung als oberes Ende der Bandbreite. | `d08.model_lkw_h2_zusatz_strom_twh`, `d08.model_lkw_h2_zusatz_elektrolyse_gw` | Verhältnis FCEV/BEV im Strombedarf: UBA 2,35 (73 % / 31 %), bisherige Setzung 2,65. Mit dem UBA-Verhältnis sinkt der Zusatzstrom von 140 auf 115 TWh. Die Spalten low (75) und high (214) und die GW-Werte sind nicht neu gerechnet. |
| E05 | E-Fuel-Menge | Den niedrigeren Ariadne-Wert aufnehmen. | `d08.efuel_bedarf_2045_ariadne_twh` | Ariadne nennt zwei Werte: 51-128 TWh (PDF-S. 23, nichtelektrisch, Schiff und Flug) und 180-195 TWh (PDF-S. 29, synthetisch und biogen). Das Modell nutzte nur den hohen. |
| E06 | Solarleistung | Einheitlich gegen die Modulleistung (DC), wie in den Stundenprofilen. | `d03.pv_vls_gesamt_dc_2015_2025`, `d03.pv_vls_oeffentlich_dc_2015_2025`, `d07.de_pv_bestand_gwp_2025`, `d07.de_pv_ersatzbedarf_gwp_pro_jahr` | Bezogen auf AC-Leistung wären die Volllaststunden rund 6-8 % höher (d03). Quellen, die AC-Leistung nennen, sind vor der Verwendung umzurechnen. |
| E07 | Führende Energiebilanz | AG Energiebilanzen führend; Eurostat als Abgleich und für internationale Vergleiche. | `d04.ist_eev_de_2024_eurostat`, `d04.ist_eev_de_2024_inkl_intavi`, `d04.ist_eev_de_2008_eurostat`, `d04.ist_eev_de_2024_ageb_abgeleitet`, `d04.ist_pev_de_2024_eurostat_gae`, `d04.ist_pev_de_2025_ageb_pj` … (+19) | Bei AGEB-Werten (Dossier 04) gilt der AGEB-Wert; die Eurostat-Reihen bleiben als Abgleich stehen. Abweichungen bei Endenergie: Eurostat 2.067,2 TWh (ohne int. Luft/See) gegen AGEB 2.261,4 TWh. |
| E08 | Dunkelflauten-Definition | Ereignisse über das Tagesmittel, Speicherbedarf über die Energielücke; das strenge Stundenkriterium als günstigste Lesart daneben. | `d03.dunkelflaute_laengste_phase_unter_5pct_h`, `d03.dunkelflaute_laengste_phase_unter_10pct_h`, `d05.df_wind_laengste_phase_h`, `d05.df_ereignisse_ge10h_2016_2025`, `d05.df_ereignisse_ge48h_pro_jahr`, `d05.df_5d_luecke_ziel2030_twh` … (+2) | OFFEN: Die Ereigniszahlen in d05 beruhen auf dem 6-h-Mittel, die Phasen in d03 auf dem Stundenkriterium; nach der Entscheidung sind sie mit dem 24-h-Mittel neu auszuzählen (d03: 108-312 h je Jahr, max. 01.-13.11.2024). |
| E09 | Stresstest China | Zwei Stufen getrennt: erst die Rückkehr vom Überkapazitätspreis auf den Mindestpreis, dann der Aufschlag für Ware außerhalb Chinas. | `d07.stresstest_modulpreisfaktor`, `d07.stresstest_kostenaufschlag_grossanlage_pct` | Stufe 1: 15,9 / 8,7 = 1,83. Stufe 2 gegen den China-Mindestpreis: Südostasien 1,04, EU skaliert 1,60. Die Kostenanteile je Stufe sind aus der Formel des Prüfberichts 07 abgeleitet (Setzung M). |
| E10 | ZEW-Zahl | Die Reihe nennt die 824 Mrd. EUR aus der Studie, mit Hinweis auf deren Uneinheitlichkeit; keine eigene 'richtige' Zahl. | `d01.r21_zew_ersparnis_mrd_eur` | 824 ist ein Barwert (1,5 % p. a.) für EU-27 ohne vermiedene Klimaschäden; R21 nennt zusätzlich 850, das in der Studie nicht steht. |
| E11 | PwC-Studie und ifo-Gastbeitrag | 'später': Teil 1 weist bis dahin offen aus, dass beide Originale nicht gelesen wurden. | `d02.pwc_gesamtkosten_wwb_bio_eur`, `d02.pwc_gesamtkosten_beschleunigt_bio_eur`, `d02.pittel_henning_mehrkosten_bis2050_mrd_eur` | Beide bleiben C und primaer_gelesen false. |

## 7. Dopplungen zwischen den Dossiers

Dieselbe Größe steht in mehreren Dossiers. Es wird **kein Sieger** gewählt; „Urteil“ sagt nur, ob die Werte sich widersprechen (gleiche Größe, verschiedene Zahl), verschieden abgegrenzt sind oder übereinstimmen. Die Widersprüche sind offene Punkte (Abschnitt 8).

### BIP Deutschland · WIDERSPRUCH

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d01.wb_bip_de_2025_bio_eur` | 4.47 | Bio. EUR (nominal) | B | nicht in der Stichprobe |
| `d10.de_bip_nominal_2025_mrd_eur` | 4529.7 | Mrd. EUR | B | nicht in der Stichprobe |
| `d02.bip_de_2024_mrd_eur` | 4386.94 | Mrd. EUR nominal | B | bestätigt |
| `d10.r21_kosten_in_bip_vielfachen` | min 2.2 / mid 2.6 / max 3.0 | x BIP 2025 | B | bestätigt |

Für 2025 stehen 4,47 Bio. EUR (Weltbank, NY.GDP.MKTP.CN) und 4,5297 Bio. EUR (Eurostat, Stand 11.11.2026): 1,3 % Abstand durch Quelle und Revisionsstand. Dossier 02 rechnet mit BIP 2024 (4.386,94), Dossier 10 teilt durch 4,53, Prüfbericht 01 rechnet mit 4,47. Welche Basis gilt, ist offen.

### Strombedarf 2045 (NEP) · ABGRENZUNG

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d04.strom_2045_nep` | min 989 / mid 1142 / max 1294 | TWh | B | nicht in der Stichprobe |
| `d05.nep2045_nettostromverbrauch_twh` | {"min": 868.7, "max": 1195.1} | TWh | B | nicht in der Stichprobe |
| `d04.strom_2045_studien` | min 989 / mid 1250 / max 1544 | TWh | A | bestätigt |

d04 nennt 989-1.294 TWh (Kurzfassung S. 5; der Prüfbericht 04, Nr. 30, setzt sie gegen den Bruttostromverbrauch 2024), d05 nennt 868,7-1.195,1 TWh als Nettostromverbrauch (Tab. 1) aus demselben NEP. Ob beide dieselbe Größe meinen, ist nicht belegt; die Untergrenzen liegen 120 TWh auseinander. Das Modell muss eine festlegen.

### Bruttostromverbrauch 2024 · ABGRENZUNG

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d04.ist_bruttostrom_2024` | 518 | TWh | A | bestätigt |
| `d04.strom_ist_2024_bundesregierung` | 522 | TWh | A | bestätigt |
| `d03.last_netzlast_2024_twh` | 465.5 | TWh Netzlast 2024 | B | bestätigt |

518 (NEP/BDEW), 522 (Bundesregierung/WD; AGEB 523,1 ohne und 529,4 mit Pumpspeicher) und Netzlast 465,5 TWh messen verschiedene Größen. Bei 518 gegen 522 ist es dieselbe Größe mit 4 TWh Abstand.

### Elektrolyse-Bestand 2026 und 2030 · ÜBEREINSTIMMEND

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d05.elektrolyse_installiert_gw_2026` | 0.2 | GW | A | korrigiert |
| `d08.h2_elektrolyse_in_betrieb_gw` | 0.1805 | GW | B | bestätigt |
| `d05.elektrolyse_2030_konservativ_gw` | 2.4 | GW | B | nicht in der Stichprobe |
| `d08.h2_elektrolyse_2030_realistisch_gw` | min 2.4 / max 6.6 | GW | B | bestätigt |
| `d08.h2_elektrolyse_ziel_2030_gw` | 10 | GW | A | bestätigt |

0,2 GW gegen 0,1805 GW ist Rundung (EWI 181 MW). Die konservative Schätzung 2030 (2,4 GW) ist die Untergrenze der 'realistischen' Spanne (2,4-6,6); das Ziel 10 GW bleibt Ziel.

### Wirkungsgrad Elektrolyse · WIDERSPRUCH

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d04.elektrolyse_wirkungsgrad` | min 0.6 / mid 0.7 / max 0.75 | - | B | nicht in der Stichprobe |
| `d08.elektrolyse_wirkungsgrad` | min 0.64 / mid 0.7 / max 0.75 | LHV, System | B | korrigiert |

Gleiche ID in zwei Dossiers: d04 min 0,60 / mid 0,70 / max 0,75 (NEP, UBA-FAQ), d08 min 0,64 / mid 0,70 / max 0,75 (UBA TEXTE 68/2020, 0,64 Setzung M Teillast). Nur die Untergrenze weicht ab; kein Prüfbericht legt sie fest.

### Netzinvestitionen und Netzkosten · ABGRENZUNG

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d02.efruhr_ewi_netzinvestitionen_mrd_eur` | 732 | Mrd. EUR bis 2045 | B | korrigiert |
| `d02.dena_ewi_netzinvestitionen_mrd_eur` | 345 | Mrd. EUR bis 2045 | B | bestätigt |
| `d02.nep2023_kostenanstieg_mrd_eur` | 440 | Mrd. EUR | B | korrigiert |
| `d02.nep2025_uen_investitionen_mrd_eur` | min 365 / max 392 | Mrd. EUR bis 2045 | B | nicht in der Stichprobe |
| `d01.planb_netzkosten_2025_2049_bio_eur` | 1.2 | Bio. EUR (2025-2049) | B | bestätigt |
| `d02.dihk_netzkosten_2025_2049_bio_eur` | 1.2 | Bio. EUR2024, 2025-2049 | B | bestätigt |
| `d01.r21_netzkosten_dihk_zitat_mrd_eur` | 2100 | Mrd. EUR | B | bestätigt |

732 (ÜN+VN, 2024er Basis), 345 (nur Leitungen), 440 bzw. 365-392 (nur ÜN), 1,2 Bio. EUR (CAPEX und OPEX, 2025-2049) sind verschiedene Größen. d01 und d02 nennen die 1,2 Bio. übereinstimmend. Die 2.100 Mrd. EUR im R21-Papier sind laut Prüfbericht 01 (K2) die Gesamtsystemkosten 2025-2034 der DIHK, keine Netzkosten.

### Redispatch und Abregelung Erneuerbarer · ÜBEREINSTIMMEND

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d03.abregelung_redispatch_ee_2024_gwh` | 9389 | GWh/a (Redispatch-Abregelung EE, ohne marktbedingte Abregel… | B | bestätigt |
| `d03.abregelung_redispatch_ee_2025_gwh` | 9379 | GWh/a | B | bestätigt |
| `d03.abregelung_2023_offshore_onshore_gwh` | {"offshore": 5729, "onshore": 3980, "ee_gesamt": 10478, "ee_gesamt_2022": 8071} | GWh (Redispatch 2023) | B | korrigiert |
| `d05.ee_abregelung_gwh` | {"2019": 6482, "2020": 6146, "2021": 5818, "2022": 8071, "2023": 10479, "2024": 9389, "2025": 9379} | GWh | B | nicht in der Stichprobe |

2024 (9.389) und 2025 (9.379) stimmen überein. Für 2023 steht 10.478 GWh (d03, SMARD-Original) gegen 10.479 (d05): 1 GWh Rundung.

### EUA-Preis (CO₂-Preis ETS 1) · WIDERSPRUCH

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d06.eua_dez_2026_eur_t` | min 74 / mid 82.4 / max 88.3 | EUR/t CO2 | C | nicht prüfbar |
| `d09.eua_preis_nov2026_eur_t` | {"min": 81, "mid": 88, "max": 91} | EUR/t | C | korrigiert |

d06: 74 / 82,4 / 88,3 EUR/t (letzter Wert 12.10.2026); d09: 81 / 88 / 91 EUR/t (nach Prüfung, Mitte November). Beide C und nicht primär; verschiedene Stichtage, kein Primärbeleg.

### CO₂-Kostensatz (UBA) · ABGRENZUNG

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d02.uba_kostensatz_2024_eur_t` | 300; max 880 | EUR2024 pro t CO2 (Jahr 2024) | C | nicht prüfbar |
| `d02.uba_kostensatz_2021_eur_t` | 201 | EUR2021 pro t CO2 (Jahr 2021) | B | nicht in der Stichprobe |
| `d09.uba_klimakosten_1pct_eur2025_t` | {"2025": 345, "2026": 350, "2027": 355, "2030": 375, "2050": 485} | EUR2025/t CO2 | B | nicht in der Stichprobe |
| `d09.uba_klimakosten_0pct_eur2025_t` | {"2025": 990, "2026": 1000, "2027": 1010, "2030": 1050, "2050": 1240} | EUR2025/t CO2 | B | nicht in der Stichprobe |

300/880 EUR2024 (Konvention 3.2, C, nicht prüfbar), 201 EUR2021, gegen 345/990 EUR2025 (Konvention 4.0, B, primär gelesen): verschiedene Konventionen und Preisbasen. Offen, welcher Satz ins Modell geht (nicht zugeordnete Korrektur d02.uba_kostensatz_mk40_eur_t).

### ETS-Minderung seit 2005 (R21-Zitate) · ÜBEREINSTIMMEND

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d01.r21_ets_minderung_seit_2005_pct` | {"min": 40, "mid": 47, "max": 51} | % seit 2005 | B | korrigiert |
| `d09.r21_ets_minderung_seit_2005_pct` | {"S15": 40, "D4": 51, "F1": 47} | % | B | korrigiert |

40 / 47 / 51 % (S. 15, F-1, D-4) in beiden Dossiers gleich; Referenz der Kommission rund -50 % (2005-2024).

### ZEW-Ersparnis · ABGRENZUNG

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d01.r21_zew_ersparnis_mrd_eur` | {"zew_studie_barwert_ohne_nationale_massnahmen": 824, "r21_zitat_nicht_in_studie": 850} | Mrd. EUR bis 2048 | B | korrigiert |
| `d09.r21_zew_ersparnis_mrd_eur` | {"D5": 850, "S20": 824} | Mrd. EUR bis 2048 | B | bestätigt |

d09 gibt R21 wieder (D-5: 850, S. 20: 824), d01 nach Prüfung die Studie (824; 850 steht dort nirgends). Entscheidung E10: die 824 mit Hinweis nennen.

### KfW-Klimainvestitionen (Prognos 2026) · ÜBEREINSTIMMEND

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d02.kfw2026_ksi_brutto_bio_eur` | 6.0; min 5.7 / max 6.4 | Bio. EUR2024, 2025-2045 | B | nicht in der Stichprobe |
| `d02.kfw2026_ksi_netto_mrd_eur_pa` | 145; min 130 / max 153 | Mrd. EUR2024 pro Jahr | B | bestätigt |
| `d02.kfw2026_netto_zuwachs_mrd_eur_pa` | 65; min 60 / max 70 | Mrd. EUR2024 pro Jahr | B | nicht in der Stichprobe |
| `d10.kfw_klimainvest_brutto_pro_jahr_mrd_eur` | min 270 / mid 285 / max 300 | Mrd. EUR/Jahr | B | bestätigt |
| `d10.kfw_klimainvest_mehrbedarf_pro_jahr_mrd_eur` | min 135 / mid 144 / max 153 | Mrd. EUR/Jahr | B | bestätigt |

6,0 Bio. EUR über 21 Jahre entsprechen 285 Mrd. EUR/a (d10 mid), netto 145 (d02) gegen 144 (d10 mid): gleiche Studie, gleiche Größenordnung, Rundung. 'Netto' (145) und 'Zuwachs' (65) sind verschiedene Größen.

### Batteriekosten · ABGRENZUNG

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d01.r21_factsheet_a_batterie_bio_eur` | 1.4 | Bio. EUR | B | korrigiert |
| `d05.r21_fa_kosten_mrd_eur` | 1400 | Mrd. EUR | B | bestätigt |
| `d05.bischof_speicher_gwh` | 560 | GWh | B | bestätigt |
| `d05.batterie_capex_pvffa_eur_kwh` | {"2024": [400, 600], "2035": [225, 473], "2045": [130, 400]} | EUR/kWh | B | korrigiert |

R21 und Bischof rechnen mit 200 EUR/kWh (7,12 TWh = 1,4 Bio. EUR; 112 Mrd. EUR / 560 GWh); ISE 2024 nennt 400-600 EUR/kWh (PV-gekoppelt, > 1 MWp, 2024), 225-473 (2035), 130-400 (2045). Prüfbericht 05 (3.5): Die Differenz ist eine Abgrenzungsfrage (Baujahr, Größe, Dauer, Kapazitätsbegriff); keine Zahl gilt für 120-h-Systeme.

### R21 Factsheet A (Speicher) · ÜBEREINSTIMMEND

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d00.r21_factsheet_a_batterie_bio_eur` | 1.4 | Bio. EUR | B | nicht in der Stichprobe |
| `d01.r21_factsheet_a_batterie_bio_eur` | 1.4 | Bio. EUR | B | korrigiert |
| `d01.r21_factsheet_a_speicher_twh` | 7.12 | TWh | B | bestätigt |
| `d05.r21_fa_speicher_twh` | 7.12 | TWh | B | bestätigt |

1,4 Bio. EUR und 7,12 TWh in allen Fassungen gleich (exakt 1,425 Bio. EUR, 7,123 TWh).

### Gasbilanz 2025 (BNetzA) · ÜBEREINSTIMMEND

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d01.bnetza_gasverbrauch_2025_twh` | 864 | TWh | B | nicht in der Stichprobe |
| `d09.gas_verbrauch_de_2025_twh` | 864 | TWh | B | nicht in der Stichprobe |
| `d01.bnetza_lng_import_2025_twh` | 106 | TWh | B | nicht in der Stichprobe |
| `d09.lng_import_de_2025_twh` | 106 | TWh | B | bestätigt |
| `d01.bnetza_gasfoerderung_inland_2025_twh` | 34 | TWh | B | bestätigt |
| `d09.gas_foerderung_de_2025_twh` | 34 | TWh | B | nicht in der Stichprobe |

864 / 106 / 34 TWh in beiden Dossiers gleich.

### Treibhausgasemissionen 2025 · ÜBEREINSTIMMEND

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d01.uba_thg_de_2025_mio_t` | 648.9 | Mio. t CO2-Äq. | B | bestätigt |
| `d04.thg_2025_gesamt` | 648.9 | Mt CO2-Aeq | B | nicht in der Stichprobe |

648,9 Mt CO₂-Äquivalente in beiden Dossiers gleich.

### Vorkettenemissionen Gas (UBA) · ÜBEREINSTIMMEND

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d01.uba_vorkette_pipeline_norwegen_g_gj` | 3805 | g CO2eq/GJ | B | korrigiert |
| `d09.vorkette_pipeline_norwegen_kg_gj` | 3.805 | kg CO2e/GJ | B | nicht in der Stichprobe |
| `d01.uba_vorkette_lng_usa_g_gj` | 23600 | g CO2eq/GJ | B | korrigiert |
| `d09.vorkette_lng_usa_kg_gj` | 23.6 | kg CO2e/GJ | B | nicht in der Stichprobe |

3.805 g/GJ = 3,805 kg/GJ und 23.600 g/GJ = 23,6 kg/GJ: nur die Einheit unterscheidet sich.

### Wasserstoff-Kernnetz · ÜBEREINSTIMMEND

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d04.kernnetz_laenge` | 9040 | km | B | bestätigt |
| `d08.kernnetz_laenge_km` | 9040 | km | B | bestätigt |
| `d04.kernnetz_kosten` | 18.9 | Mrd EUR | B | bestätigt |

9.040 km in beiden Dossiers gleich. Kosten 18,9 Mrd. EUR (d04, Genehmigung 2024); Dossier 08 nennt im Text 24,3 Mrd. EUR bis 2037 (zweiter Entwurf 2026), dazu kein Parameter.

### Netzentgelt Haushalt 2025 · WIDERSPRUCH

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d05.netzentgelt_haushalt_2025_ct_kwh` | 10.6 | ct/kWh netto | B | nicht in der Stichprobe |
| `d10.de_strompreis_haushalt_netz_2019_2025_ct` | min 7.4 / max 11.3 | ct/kWh (2019 / 2025) | B | korrigiert |

10,6 ct/kWh netto (d05, Bundesdurchschnitt Verteilnetz, vor Bundeszuschuss 2026) gegen 11,30 ct/kWh (d10, Eurostat NETC 2025). Unterschiedliche Abgrenzung wahrscheinlich, nicht belegt.

### Gaspreis · ABGRENZUNG

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d09.modell_gaspreis_2030_2045_eur_mwh` | {"min": 20, "mid": 35, "max": 85} | EUR/MWh | C | nicht in der Stichprobe |
| `d09.preis_ttf_nov2026_eur_mwh` | {"min": 85.5, "max": 88.5} | EUR/MWh | B | nicht in der Stichprobe |
| `d09.preis_erdgas_eur2023_mwh` | {"2025": 42, "2030": 21, "2035": 19, "2040": 18, "2045": 17} | EUR2023/MWh Hu | B | bestätigt |
| `d10.gas_ttf_2022_eur_mwh` | 124 | EUR/MWh | B | bestätigt |

Regler 20 / 35 / 85 (Entscheidung E01), UBA-Pfad 42 (2025) bis 17 (2045) in EUR2023, TTF November 2026 85,5-88,5 und Spitze 2022 124 EUR/MWh. Der aktuelle TTF liegt über dem Regler-Höchstwert.

### Kernkraft-Neubau (Kosten) · ÜBEREINSTIMMEND

| Parameter | Wert | Einheit | Konf. | Prüfstatus |
|---|---|---|---|---|
| `d01.r21_factsheet_b_neubau_mrd_eur` | 310 | Mrd. EUR fuer 50 GW | B | bestätigt |
| `d09.r21_fsb_neubau_kosten_mrd_eur` | 310 | Mrd. EUR | B | bestätigt |
| `d09.r21_fsb_neubau_capex_eur_kw` | 6250 | EUR/kW | B | bestätigt |
| `d09.neubau_de_capex_eur_kw` | {"min": 7500, "mid": 12000, "max": 17500} | EUR/kW | B | nicht in der Stichprobe |

310 Mrd. EUR in beiden Dossiers gleich (= 6.250 EUR/kW). Die Setzung 7.500 / 12.000 / 17.500 EUR/kW liegt bewusst darüber (Entscheidung E02).

Zählung: 21 Dopplungen, davon 4 Widerspruch, 7 Abgrenzung, 10 übereinstimmend.

## 8. Offene Punkte (Entscheidung nötig)

1. **BIP-Basis:** 4,47 (Weltbank) gegen 4,5297 Bio. EUR (Eurostat) für 2025; Teil 1 braucht eine Basis für „x-faches BIP“.
2. **Elektrolyse-Wirkungsgrad:** d04 min 0,60, d08 min 0,64 – gleiche ID, kein Prüfbericht legt die Untergrenze fest.
3. **EUA-Preis:** zwei Werte aus zwei Dossiers (74-88 gegen 81-91 EUR/t), beide ohne Primärbeleg.
4. **CO₂-Kostensatz:** Konvention 3.2 (300/880 EUR2024, C) oder 4.0 (345/990 EUR2025, B); die Korrektur `uba_kostensatz_mk40_eur_t` ist nicht zugeordnet.
5. **Strombedarf 2045 aus dem NEP:** brutto (d04) oder netto (d05) als Modellgröße.
6. **Netzentgelt Haushalt 2025:** 10,6 ct/kWh netto (d05) gegen 11,30 ct/kWh Eurostat (d10), Abgrenzung nicht belegt.
7. **Dunkelflaute (Entscheidung E08):** Die Ereignisparameter in d05 beruhen auf dem 6-h-Mittel, die in d03 auf dem Stundenkriterium; nach der Entscheidung („Tagesmittel“) sind sie neu auszuzählen. Das ist Modellarbeit, nicht Konsolidierung.
8. **Wasserstoff-Lkw (E04):** Die Mitte ist mit dem UBA-Verhältnis (115 TWh) gesetzt, `min`, `max` und die GW-Werte sind nicht neu gerechnet.
9. **Gaspreis-Regler (E01):** Der Höchstwert 85 EUR/MWh liegt unter dem TTF-Stand November 2026 (85,5-88,5). Festlegung bleibt, der Hinweis steht im Parameter.
10. **PwC und ifo (E11):** Beide Originale bleiben ungelesen; Teil 1 muss das offen ausweisen.
11. **Dossier 00:** Kein eigener Prüfbericht; Werte tragen `nicht in der Stichprobe`, die Regel A senkt die R21-Zitate auf B.

## 9. Lücken, die das Modell blockieren

Aus den Abschnitten „Lücken“ der Dossiers, den Prüfberichten und den C-Parametern tragender Größen (vollständig in `gaps`). „Teil“ nennt den Teil der Reihe, den die Lücke berührt.

| Nr. | Dossier | Art | Teil | Lücke |
|---|---|---|---|---|
| G01 | 02 | nur C bei tragender Größe | 1 | PwC 2024 (13,3 Bio. EUR) im Original nicht gelesen (Registrierung); Zeitraum, Preisbasis, Diskontierung offen. Entscheidung E11: später. |
| G02 | 02 | nur C bei tragender Größe | 1 | Pittel/Henning 2019 (ifo) nicht gelesen; 'kumuliert bis 2050' statt '500 Mrd. EUR pro Jahr' stützt sich auf einen Teaser. Entscheidung E11: später. |
| G03 | 02 | nur C bei tragender Größe | 1 | Aurora/EnBW (3,44 Bio. EUR) nur über Zitate; Original nicht freigegeben. |
| G04 | 02 | fehlender Wert | 1 | Keine Studie mit einer Zahl für die Kapitalkosten (Finanzierung) der Energiewende insgesamt gefunden. |
| G05 | 01 | Originalquelle nicht gelesen | 1 | Quantified Carbon 2025a (Preise 82 / 105 EUR/MWh, 17 g CO₂/kWh) nur im Referat bei Wendland gelesen; 17 g ohne Emissionsfaktoren nicht nachrechenbar. |
| G06 | 01 | Originalquelle nicht gelesen | 2 | Bischof/RBID 2026 (560 GWh, 112 Mrd. EUR) nicht im Original gelesen; offen, ob Backup-Kraftwerke mitgerechnet sind. |
| G07 | 05 | Originalquelle nicht gelesen | 2 | Ohlendorf/Schill 2020 und Kittel et al. nur über Abstract bzw. Autorenvortrag; die Dauer 'etwa fünf Tage jährlich' bleibt B. |
| G08 | 05 | fehlender Wert | 2 | Wetterbasis: nur elf Jahre (2015-2025) und nur Deutschland; für das Modell sind mehrere Jahrzehnte (z. B. ERA5) und die Nachbarländer nötig. |
| G09 | 05 | fehlender Wert | 2 | ERAA 2025: LOLE-Werte für Deutschland nicht ermittelt; StromVKG Anlage 4 (Reduktionsfaktoren Batterie je Speicherdauer) nicht primär gelesen; BNetzA-Hauptbericht Versorgungssicherheitsmonitoring nicht gelesen. |
| G10 | 05 | Widerspruch offen | 2 | Batteriekosten für 120-h-Systeme: ISE 400-600 EUR/kWh (2024) gegen R21/Bischof 200 EUR/kWh; keine Zahl gilt für lange Speicherdauern. |
| G11 | 04 | Widerspruch offen | 2 | Strombedarf 2030 nach BMWK-Langfristszenarien 3: 765-792 TWh gegen 594-638 TWh im strommix-Dossier; nur Sekundärquellen (BMWK-Seite hinter Browser-Prüfung). Möglicherweise T45- gegen O45-Szenario. |
| G12 | 04 | nur C bei tragender Größe | 2, 5 | Lkw-Verbräuche (BEV, H₂, Diesel) nur aus Suchtreffer-Auszügen (ICCT, NOW, Agora Verkehrswende); Originalstudien nicht gelesen. |
| G13 | 04 | fehlender Wert | 2, 5 | Keine belastbare Primärquelle für Wirkungsgrade künftiger H₂-Kraftwerke (Rückverstromung); JAZ von Wärmepumpen im Neubau aktueller Technik fehlt. |
| G14 | 04 | fehlender Wert | 6 | Sektorziele 2030 nach Anlage 2a KSG nicht an der Quelle belegt; SRU-Restbudget nur als Suchtreffer (C). |
| G15 | 06 | fehlender Wert | 3 | Heutige NTC bzw. handelbare Kapazität je Grenze (ENTSO-E, ACER) fehlt; nur Planwerte 2045 und beobachtete Spitzen. Einhaltung der 70-%-Regel durch Deutschland nicht belegt. |
| G16 | 06 | nur C bei tragender Größe | 3 | Speicherpotenzial Norwegen (84-87 TWh) und Schweden (34 TWh) nur C; Statnett, NVE, Svenska kraftnät nicht freigegeben. |
| G17 | 06 | nur C bei tragender Größe | 3, 6 | EUA-Preis ohne Primärbeleg (zwei Dossiers, zwei Werte, beide C). |
| G18 | 07 | fehlender Wert | 4 | Weltmarktanteile bei Abbau und Raffinade (Lithium, Kobalt, Nickel, Graphit) ohne Einzelwerte (IEA nicht freigegeben); Anteile bei Windturbinen, Getrieben, Rotorblättern fehlen; Elektrolyseure und Heimspeicher ohne saubere HS-Codes. |
| G19 | 07 | fehlender Wert | 4 | Stresstest: Lieferzeiten und Preisaufschläge bei Exportkontrollen nicht gefunden (nur Suchtreffer, C); EU-Modulbedarf (SolarPower Europe) fehlt, deshalb ist 'Ausweichkapazität gegen Bedarf' nicht schließbar; Modullagerbestand nur 2023 geschätzt. |
| G20 | 07 | fehlender Wert | 4 | Realisierter BIP-Effekt der Gaskrise 2022/23 nicht abgerufen (nur Ex-ante-Szenarien, C); Weltproduktionsanteile fossiler Träger für einen gleichartigen Konzentrationsvergleich fehlen (der HHI-Vergleich nutzt Bezugsländer). |
| G21 | 08 | nur C bei tragender Größe | 5 | E-Kerosin-Kosten nach EASA (6.820-9.405 EUR/t) nur Suchtreffer; ReFuelEU-Zwischenwerte (2032-2045) C; Elektrolysekosten China C; Importverluste und -kosten je Träger (Pipeline, Ammoniak, LH₂, LOHC) ohne Zahl. |
| G22 | 08 | nur C bei tragender Größe | 5 | Lkw-Regler: alle vier model_*-Werte sind C (Setzung M); Verhältnis FCEV/BEV im Strombedarf 2,65 (Modell) gegen 2,35 (UBA), Entscheidung E04 offen, ob low/high neu zu rechnen sind. Brennstoffzellen-Lkw-Bestand und Neuzulassungen (KBA) fehlen. |
| G23 | 09 | Originalquelle nicht gelesen | 1, 6 | Radiant-Gutachten (Juni 2026) im Original nicht gelesen; die 12 GW und 18-19 Mrd. EUR sind Wiedergabe der AfD-Fraktion (Drs. 21/7609, 21/6126). Reaktivierungskosten und frühestes Jahr C. |
| G24 | 09 | nur C bei tragender Größe | 1, 6 | CCS-Kosten in EUR/MWh (Gas, Braunkohle) ohne Primärquelle, nur eigene Umrechnung (Setzung M, C); Schiefergas-Plateau und -Vorlauf C; Kosten der Kraftwerksstrategie (StromVKG) und Ersatzbedarf des fossilen Parks nicht gefunden; Steinkohle- und Ölpreise am Terminmarkt nicht recherchiert. |
| G25 | 09 | Widerspruch offen | 6 | Wirksamkeitsdatum der MSR-Löschschwelle 700 Mio. (sofort oder 2031) widersprüchlich; Einigung vom 20.10.2026 nur über Sekundärquellen (consilium.europa.eu hinter Browser-Prüfung); tatsächlich nach § 8 TEHG gelöschte Mengen nicht gefunden. |
| G26 | 10 | fehlender Wert | 1, 6 | Anteil der Energiepreise am Produktionsrückgang: keine ökonometrische Schätzung gelesen (ifo, Bundesbank, SVR, IfW, DIW); Merit-Order-Effekt und Zerlegung der Strompreissteigerung nach Ursache fehlen; Preise USA und China ohne Primärquelle. |
| G27 | 10 | fehlender Wert | 1, 6 | Makroökonomische Wirkung der Klimainvestitionen (positiv wie negativ): Primärstudien (Bundesbank, GWS/Prognos, Ariadne, IW, DIW, ifo) nicht gelesen; Verdrängungseffekte nicht gefunden. EEG-Bundeszuschuss: Ist 2025 nur Fachpresse, Netzbetreiber-Prognose 2026 nicht prüfbar. |
| G28 | 03 | fehlender Wert | 2 | Abregelung 2015-2022 nach Technologie und marktbedingte Abregelung nicht beziffert; die Offshore- und PV-Volllaststunden sind deshalb nicht als reine Wetterspanne lesbar (siehe Korrekturen d03.wind_offshore_vls und d03.pv_vls_gesamt). |

Parameter mit Konfidenz C nach Prüfung: d01: 2, d02: 7, d04: 10, d06: 3, d07: 13, d08: 6, d09: 12 (insgesamt 53 von 456).

## 10. Prüfung dieser Arbeit

- Das Skript läuft zweimal mit identischer Ausgabe (SHA-256 von `model_params.json` und `konsolidierung.md` verglichen).
- Jede der 151 Korrekturen erscheint genau einmal: angewendet (89), Text (58) oder nicht zugeordnet (4).
- Eingangs- und Ausgangsparameter: 456 = 456.
- Das Skript bricht ab, wenn eine Korrektur mit Parameter-ID keine Aktion hat, eine Zuordnung auf einen unbekannten Parameter zeigt, eine Prüftabelle „abweichend“ ohne Korrektur meldet oder die Summen nicht aufgehen.
