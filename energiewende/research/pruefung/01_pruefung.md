# Prüfbericht 01 · Gegenprüfung des Dossiers „Behauptungs-Inventar der R21-Erklärung“

Stand 22.11.2026 · Phase 2 · Auftrag P2 (`agents/briefs/P2_gegenpruefung.md`) · geprüft wird
`research/01_r21_behauptungen.md` · Prüfer: Opus, nicht Autor des Dossiers.
Neu abgerufene Dokumente: `quellen/manifest_P2-01.json`. Eigener Code:
`scripts/pruefung/p2_01_nachrechnung.py`, `p2_01_zew_barwert.py`, `p2_01_inventar_zaehlung.py`.
Seitenangaben „PDF/Druck“ wie im Dossier.

## 1. Urteil in fünf Zeilen

Das Dossier ist belastbar: Alle zehn Kernaussagen halten der Nachprüfung im Kern stand, alle
neun A-Parameter und alle zehn B-Stichproben stehen so in den Quellen, und jede nachgerechnete
Arithmetik stimmt. Schwächen liegen in der Abgrenzung, nicht in den Zahlen: Die ZEW-Zahl
(824 Mrd. €) ist jetzt am Original lesbar und misst etwas anderes, als R21 behauptet, das Dossier
hatte das nur als Suchtreffer. Zwei Befunde gehen zu weit: der „Widerspruch“ bei der ETS-Minderung
(die drei Werte gehören zu verschiedenen Jahren) und die Aussage, R21 widerspreche beim
Monitoring-Bericht seiner eigenen Quelle (die WD-Stelle betrifft einen anderen Bericht).

## 2. Prüftabelle

Ergebnis: **bestätigt** · **abweichend** (Wert an der Stelle) · **nicht prüfbar** (Grund).
„primär“ = von mir selbst im Originaldokument gelesen.

### 2.1 Kernaussagen

| Nr | Kernaussage (Dossier) | geprüfte Fundstelle | Ergebnis | neue Konfidenz · primär |
|---|---|---|---|---|
| K1 | 170 Behauptungen, 103 Zahlen; Haupttext 39 Zahlen, 4 mit Fundstelle, 6 nur Urheber, 27 ohne Quelle; Factsheets 41 von 64 belegt | Inventartabelle des Dossiers, unabhängig ausgezählt (`p2_01_inventar_zaehlung.py`) | **bestätigt**: 170 Zeilen; Z 103 · K 39 · P 9 · F 7 · W 12; Haupttext 39 Z (4 Literatur · 6 genannt · 1 Verweis · 1 eigene · 27 keine). Factsheets: 42 statt 41 mit Literatur, wenn Nr. 103 als Literatur zählt — Abgrenzungsfrage, ±1 | A (Auszählung) · ja |
| K2 | „2.100 Mrd. € Netzkosten (DIHK)“ sind bei Plan B Gesamtsystemkosten 2025–2034; Netzkosten 1,2 Bio. € 2025–2049 | R21 PDF 3/3 und 11/10; Frontier/DIHK „Plan B“ S. 8 und S. 27 (Abb. 8) | **bestätigt**: „Allein in den nächsten 10 Jahren entstehen Gesamtsystemkosten in Summe von rund 2,1 bis zu 2,3 Billionen €“, Bestandteile CAPEX, OPEX, Netze, Energieimporte; Netzkosten (CAPEX & OPEX) 1,2 Bio. € für 2025–2049 | B (Zuordnung erschlossen) · ja |
| K3 | Factsheet B: „1200 Mrd. € bis 2034“ falsch datiert; 310 Mrd. € widerspricht Wendland (7.000 €/kW, ca. 350 Mrd.) | R21 PDF 13/B-1, 15/B-3; Plan B S. 27; Wendland PDF 3, 16, 31 | **bestätigt**. Ergänzung: Wendlands eigenes Papier zeigt in der Factsheet-Grafik (PDF 4) ebenfalls 310 Mrd. — der Widerspruch steckt in der Referenz selbst. 7.000 €/kW × 49,6 GW = 347 Mrd. | A · ja |
| K4 | 8,2 ct ist der Modellpreis bei 43 % Kernkraft; dieselbe Studie: 10,5 ct für das reine EE-System; Vergleich mit 38 ct Endkundenpreis | Wendland PDF 16: „82 Euro pro Megawattstunde, im nur auf EE basierenden System bei 105 EUR/MWh (Quantified Carbon 2025a)“ | **bestätigt** am Referat. QC-Original weiterhin nicht erreichbar; Websuche (C): WePlanet-Bericht nennt „average electricity price −22 %“ Kernkraft- gegen VRE100-Szenario — passt zu 82/105 = −21,9 % | B · Wendland ja, QC nein |
| K5 | Factsheet A rechnet richtig, Ergebnis hängt an 100 % Batterie; Plan B plant 450 GWh + 46 GW Gas | R21 PDF 10/A-1; Plan B S. 35; DIW-Seite Ohlendorf/Schill 2020 (neu) | **bestätigt**, mit Ergänzung (Abschnitt 3.2): die zitierte DIW-Studie definiert die 5 Tage als Wind-Kapazitätsfaktor **unter 10 %** (nicht null), als **jährlich** wiederkehrendes Ereignis; alle zehn Jahre fast 8 Tage, längstes knapp 10 Tage | A · ja |
| K6 | Factsheet H: Tabelle rechnet mit 4,86 statt 4,68 t; 704/12 = 58,67 statt 68,60 | R21 PDF 49–50/H-1–H-2 | **bestätigt** (eigene Rechnung). Zusätzlich: Auch mit 4,68 t ergäben sich 63,47 €/Monat, nicht 68,60 | A · ja |
| K7 | Selbstwidersprüche: ETS 40/51/47 %; ZEW 824/850; Fn. 2 Batterien gegen 11 GW Gas; Sozialausgaben konstant/explodiert | R21 PDF 23–24/15–16, 28/D-4, 39/F-1, 37/20, 29/D-5, 9/9, 13/B-1, 19/C-1, 22/14 | **bestätigt** (alle Stellen stehen so), aber **teils schief**: ETS-Werte und Sozialausgaben sind eher Spannungen als Widersprüche (Abschnitt 3.4) | A für das Vorkommen · ja |
| K8 | „Faktor 6“ gilt nur für Vorketten; BNetzA-Gaszahlen quellentreu | UBA CC 21/2019 Druck S. 19 (PDF 22), S. 20; BNetzA Rückblick 2025 | **bestätigt**: 3.805 und 23.600 g CO₂eq/GJ, Quotient 6,20; BNetzA 864 TWh, 106 TWh, 96 % (nach BDEW), 34 TWh | A · ja |
| K9 | Erstbefund hält; Korrekturen Seiten, Pittel, „verlangt“, Weimann; dazu Punkt 6 (Monitoring) | WD 5-135/24 S. 1, 2, 3, 5; `00_aufhaenger_r21.md` | **bestätigt** für Pittel (Fn. 4 „Pittel, H.“, Fn. 5 und 8 „Pittel, Henning“) und „verlangt“ (WD S. 5: Monitoring-Bericht „weist darauf hin“). **Abweichend** bei Punkt 6, Abschnitt 3.3 | B · ja |
| K10 | Nur zwei von neun Factsheets nennen einen Autor; acht Quellen von Ratsmitgliedern | R21-Textebene PDF 10, 13, 19, 25, 33, 39, 43, 49, 54 | **bestätigt** für die Autorenzeilen (nur A Breyer, B Wendland). Zählung der Ratsmitglieder-Quellen nicht nachgezählt | A (Autoren) · ja |

### 2.2 Alle Parameter mit Konfidenz A

| Parameter-ID | Wert Dossier | Fundstelle geprüft | Ergebnis | Konfidenz · primär |
|---|---|---|---|---|
| r21_netzkosten_dihk_zitat_mrd_eur | 2.100 | R21 PDF 3/3, 11/10 | bestätigt (Wortlaut „2.100 Milliarden“) | A · ja |
| r21_factsheet_a_batterie_bio_eur | 1,4 | R21 PDF 10/A-1 | bestätigt; exakt 1,425 Bio. € (7,123 TWh × 200 €/kWh) | A · ja |
| r21_factsheet_a_speicher_twh | 7,12 | R21 PDF 10/A-1 | bestätigt (520 × 5/365 = 7,123) | A · ja |
| r21_factsheet_b_neubau_mrd_eur | 310 | R21 PDF 15/B-3 | bestätigt; = 6.250 €/kW bei 49,6 GW | A · ja |
| r21_factsheet_h_zuteilung_angegeben_t | 4,68 | R21 PDF 49/H-1 | bestätigt (Kasten „4,68 t“) | A · ja |
| r21_factsheet_h_zuteilung_gerechnet_t | 4,86 | R21 PDF 50/H-2 | bestätigt: Emission − Zukauf = 4,86 für alle fünf Länder | A · ja |
| r21_factsheet_h_familie_monat_eur | 58,67 | R21 PDF 50/H-2 | bestätigt (4 × 176 / 12) | A · ja |
| r21_ets_minderung_seit_2005_pct | 40 / 47 / 51 | R21 PDF 23/15, 28/D-4, 39/F-1 | bestätigt als Zitate. Referenzwert neu: Kommission 04.04.2025 „dropped by 50 % compared to 2005“ (Stand 2024) | A (Zitate) · ja |
| r21_zew_ersparnis_mrd_eur | 824 / 850 | R21 PDF 37/20, 29/D-5; ZEW Rausch 2026 S. 3, 15, 16 | bestätigt als Zitate; 824 steht bei ZEW, **850 nirgends**; Abgrenzung abweichend, Abschnitt 3.1 | A (Zitate) · ja |

### 2.3 Stichprobe B (20 B-Parameter alphabetisch, k = 2, ab dem ersten)

| Parameter-ID | Wert Dossier | Fundstelle geprüft | Ergebnis | Konfidenz · primär |
|---|---|---|---|---|
| bnetza_gasfoerderung_inland_2025_twh | 34 | BNetzA Rückblick 2025, Abschnitt Gasförderung | bestätigt („34 TWh (2024: 36 TWh)“) | B · ja |
| bnetza_lng_anteil_usa_2025_pct | 96 | ebd., Gasflüsse | bestätigt („nach Angaben des BDEW … rund 96 Prozent“) | B · ja |
| planb_batterie_2045_gwh | 450 | Plan B S. 35 | bestätigt („nahezu 450 GWh“) | B · ja |
| planb_netzkosten_2025_2049_bio_eur | 1,2 | Plan B S. 27, Abb. 8 | bestätigt | B · ja |
| planb_systemkosten_2025_2049_bio_eur | 4,8–5,4 | Plan B S. 8, 27 | bestätigt | B · ja |
| r21_haupttext_zahlen_gesamt | 39 | Inventar, Nachzählung | bestätigt | B · ja |
| r21_inventar_behauptungen_gesamt | 170 | Inventar, Nachzählung | bestätigt | B · ja |
| uba_thg_de_2025_mio_t | 648,9 | UBA Hintergrundpapier 14.03.2026, S. 1 | bestätigt. Die Note „Nahzeitprognose“ trifft die Bezeichnung nicht ganz: UBA nennt es „Emissionsdaten 2025“ (vorläufig) | B · ja |
| uba_vorkette_pipeline_norwegen_g_gj | 3.805 | UBA CC 21/2019, Druck S. 19 = PDF 22 | bestätigt | B · ja |
| wb_bip_kopf_indien_2023_usd | 2.434 | `raw/P1-01/wb_gdp_pc_ind_gdp_deu.json` | bestätigt (2.434,45) | B · ja |

### 2.4 Schwerpunkte (bisher Konfidenz C oder Suchtreffer)

| Wert / Kernaussage | Wert Dossier | Fundstelle geprüft | Ergebnis | Konfidenz · primär |
|---|---|---|---|---|
| wendland_qc_preis_mischsystem_eur_mwh | 82 | Wendland PDF 16 | bestätigt am Referat; QC-Original nicht erreichbar | B · Wendland ja, QC nein |
| wendland_qc_preis_ee_system_eur_mwh | 105 | Wendland PDF 16 | bestätigt am Referat; QC-Original nicht erreichbar | B · Wendland ja, QC nein |
| ZEW 824 Mrd. € (Nr. 74) | „bis zu 824, EU-weit, 2028–2048“ (C) | ZEW Rausch 2026, Executive Summary S. 3; Tab. 1 S. 15; S. 16 | **bestätigt als Zahl, Abgrenzung abweichend**: Barwert (1,5 % p. a.), EU-27, Wohlfahrt ohne vermiedene Klimaschäden; Hebel „nationale nicht-marktliche Maßnahmen entfallen“, nicht „ESR einstellen“; Gesamteffekt gegenüber Status quo eher rund 1.071 Mrd. € (20,4 %) | B · ja |
| ZEW 850 Mrd. € (D-5) | Widerspruch zu 824 | ZEW gesamt | **abweichend**: 850 steht nirgends in der Studie | A · ja |
| ZEW „Emissionen bis 2048 auf 500 Mio. t“ (D-5) | nicht geprüft | ZEW Abb. 3, S. 12 | **abweichend**: Zielpfade 2048 grob ETS1 ≈ 0,43 Gt und ETS2 ≈ 0,5 Gt (Ablesung aus Grafik ±0,05), zusammen rund 0,9 Gt; 500 Mio. t passt nur zum ETS2-Pfad | B · ja (Grafik) |
| DIW-MCC-Studie 2020, 5 Tage (Nr. 92) | nicht gelesen | DIW-Seite zu Ohlendorf/Schill, Environ. Res. Lett. 15 (2020) 084045, Abstract | **Zahl bestätigt, Abgrenzung abweichend**: „Every year, a period of around five consecutive days with an average wind capacity factor below 10 % occurs“, alle zehn Jahre fast 8 Tage, längstes Ereignis knapp 10 Tage; nur Wind an Land; Fazit der Autoren: Sorgen um Winterflauten „may be overrated“ | B · ja (Abstract, nicht Volltext) |
| EWI 740 Mrd. € (Nr. 37) | Websuche: 732 Mrd., „für Netze BW“ (C) | ef.Ruhr/EWI April 2024, S. 2, 4, 7, 8 | **leicht abweichend**: 732 Mrd. € (Verteilnetz 430 indikativ + Übertragungsnetz 301 aus dem NEP) bis 2045; R21 „etwa 740“ = +1,1 %. Hauptautor ist ef.Ruhr, das EWI arbeitete im Unterauftrag; Auftraggeber ist die **Netze-Gesellschaft Südwest mbH**, nicht Netze BW | B · ja |
| Factsheet H, welcher Pro-Kopf-Wert stimmt | offen | Websuche: GCP 2024 nennt 37,0 Gt CO₂ fossil für 2023 | **nicht prüfbar** am Original (openclimatedata.net, globalcarbonbudget.org nicht freigegeben). 37,0 Gt ÷ rund 8 Mrd. Menschen ≈ 4,6 t: 4,68 ist plausibel, 4,86 nicht | C · nein |

**Summe:** 37 geprüfte Werte und Aussagen · 32 bestätigt (davon 4 mit abweichender Abgrenzung
oder Ergänzung) · 4 abweichend · 1 nicht prüfbar.

## 3. Abweichungen im Detail (nach Gewicht)

### 3.1 ZEW (Rausch 2026): Die 824 Mrd. € messen etwas anderes, als R21 sagt

R21 S. 20: Wenn die Nationalstaaten „die nationale ESR-Regulierung einstellen … könnten die
kumulierten Politikkosten bis 2048 um 824 Mrd. Euro sinken“. Factsheet D-5: „bis zu 850 Mrd.“.
Die Studie (ZEW, 17.02.2026, 30 S.) sagt:

- **Bezugsraum EU-27, nicht Deutschland**; **Barwert** 2028–2048 mit 1,5 % Diskont; gemessen als
  Wohlfahrtsänderung ohne monetarisierte vermiedene Klimaschäden (S. 3, Tab. 1 S. 15).
- **Zwei Hebel:** (1) ESR-Budgets flexibler machen oder ETS2 von der ESR entkoppeln: −247 Mrd. €
  (−4,7 %); (2) zusätzlich nationale nicht-marktliche Maßnahmen (Standards, Verbote,
  Förderprogramme) in Gebäuden und Verkehr abbauen: „additional EUR 824 billion (–20.4 %)“ (S. 3).
  Die 824 Mrd. gehören zu Hebel 2, nicht zum „Einstellen der ESR“.
- **Die Studie ist in sich uneinheitlich:** S. 16 nennt 824 Mrd. als Gesamteffekt des Szenarios
  ohne nationale Maßnahmen, S. 3 als Zusatz. 824 sind 15,7 % von 5.257 Mrd.; 20,4 % entsprechen
  247 + 824 = 1.071 Mrd. Meine Nachrechnung der Jahreswerte aus Tab. 1 (lineare Interpolation,
  1,5 % Diskont) ergibt für das Szenario rund 1.074 Mrd. € = 20,4 % — die Tabellenzeile „PV“ ist also
  vermutlich der Zusatzbetrag, der Gesamteffekt liegt bei rund 1,07 Bio. €. Das ist **günstiger für
  R21**, als das Papier selbst schreibt.
- **850 Mrd.** steht nirgends; „500 Mio. t bis 2048“ passt nur zum ETS2-Zielpfad (Abb. 3).
- ZEW-Pressemitteilung: nationale Maßnahmen „are helpful in removing market barriers“; die Studie
  (S. 19) unterscheidet ebenso Maßnahmen gegen Marktbarrieren von solchen, die Mengen oder
  Technologien vorschreiben (vgl. Fn. 12, S. 13). Das Papier lässt das weg.

Konsequenz für das Dossier: Kernaussage 7 (824 gegen 850) hält. Die Fußnote „Websuche (C)“ kann
durch das Original ersetzt werden; dazu gehört die Abgrenzung (EU-27, Barwert, Hebel 2).

### 3.2 Factsheet A: Die zitierte Studie definiert die Dunkelflaute anders

Die „DIW-MCC-Studie 2020“ ist Ohlendorf/Schill, Environmental Research Letters 15 (2020) 084045
(Ohlendorf laut Suchtreffer am MCC, Schill am DIW). Abstract auf der DIW-Seite: Ein etwa
fünftägiger Zeitraum mit einem **mittleren Wind-Kapazitätsfaktor unter 10 %** tritt **jedes Jahr**
auf, ein knapp achttägiger alle zehn Jahre, der längste dauert knapp zehn Tage. Daraus folgt in
beide Richtungen:

- **Ungünstig für R21:** Die Studie misst Windstrom unter 10 % der Leistung, nicht null, und nur
  Wind an Land. PV, Biomasse, Wasser und Wind auf See sind nicht ausgeschlossen. Meine
  Nachrechnung aus `data/profiles_2023–2025.json`: Im schwächsten 120-Stunden-Fenster jedes
  Jahres deckten Wind, PV, Wasser und Biomasse des **heutigen** Parks 21 % (2023), 24 % (2024)
  und 26 % (2025) der Last. Die Lücke lag bei 5,3–5,8 TWh, nicht bei 100 % der Last. Die Autoren
  schließen, die Sorge vor Winterflauten sei womöglich „overrated“.
- **Günstig für R21:** Fünf Tage sind das jährliche Ereignis, kein Extremfall; für
  Versorgungssicherheit wären 8 bis 10 Tage maßgeblich.
- **Neu, im Dossier nicht erwähnt:** „520 TWh (= 10 % mehr als heute)“ passt zur Netzlast
  (2024: 465,5 TWh, Dossier 03), nicht zum Bruttostromverbrauch (2024: 518–529 TWh, Dossiers 03
  und 04). Als Bruttowert ist 520 TWh der heutige Stand, keine Zukunft mit Elektrifizierung.
  Konfidenz B, nicht selbst am Original geprüft.

### 3.3 Kernaussage 9, Punkt 6: R21 widerspricht seiner Quelle nur bedingt

Das Dossier: R21 behaupte, der Monitoring-Bericht enthalte zu Kosten „nichts“, und der WD sage
auf S. 1, der Bericht behandle „die Bezahlbarkeit und Kosten“. Am Original: R21 (PDF 17/12)
spricht vom „Monitoring-Bericht **der Bundesregierung**“. Das WD-Zitat auf S. 1 betrifft den
Bericht der **unabhängigen Expertenkommission** Energiewende-Monitoring, ein anderes Dokument.
Besser trägt WD S. 5: Der „8. Monitoring-Bericht der Bundesregierung“ weist darauf hin, dass eine
vollständige Kostenbetrachtung einen Vergleich mit einem System ohne Energiewende braucht — er
befasst sich also mit Kosten. Offen bleibt, welchen Bericht R21 meint (es gibt auch den
Monitoringbericht von EWI/BET für das BMWE von 2025). Neue Formulierung: „Die vom Papier
zitierte Kurzinformation zeigt, dass Monitoring-Berichte die Kosten behandeln (WD S. 1 zur
Expertenkommission, S. 5 zum 8. Monitoring-Bericht der Bundesregierung).“ Konfidenz B.

### 3.4 Kernaussage 7: Zwei der vier „Widersprüche“ sind Spannungen

- **ETS-Minderung:** Die drei Zahlen gehören zu verschiedenen Ständen. Kommission 04.04.2025
  (primär): „dropped by 50 % compared to 2005“ (Stand 2024); Websuche (C): EEA −51 % für
  stationäre Anlagen 2005–2024, −47 % für 2023. „Ca. 51 %“ (D-4) ist damit korrekt, „−47 %“ (F-1,
  Stand März 2026) ist veraltet, „über 40 %“ ist das referierte von-der-Leyen-Zitat und als
  Untergrenze nicht falsch. Uneinheitlich ja, ein Fehler nur bei F-1.
- **Sozialausgaben:** S. 14 spricht vom BIP-Anteil („vergleichsweise konstant … etwa 31 %“), C-1
  von „explodiert“ nach Corona. Das ist eine Spannung in Ton und Bezugsgröße, kein harter
  Zahlenwiderspruch.
- **Fn. 2 gegen Factsheet B** und **824 gegen 850** sind echte Widersprüche (siehe 3.1).

### 3.5 Kleinere Punkte

- EWI: Auftraggeber Netze-Gesellschaft Südwest mbH, Hauptautor ef.Ruhr, EWI im Unterauftrag
  (EWI-Bericht S. 1–2); 732 statt „etwa 740“ Mrd. € (+1,1 %). Das Dossier nannte „Netze BW“.
- Seitenangaben zum Wendland-Papier sind im Dossier uneinheitlich: Inventar Nr. 107 „S. 11“,
  Nr. 115 „S. 4 und 11“, Nr. 42 „S. 12“ — die Stellen stehen auf PDF 16 (82/105, 350 Mrd.),
  PDF 3 und 31 (350 Mrd.), PDF 4 (310-Grafik), PDF 11 und 17 („um 4 Cent“ / „um 4 ct/kWh“).
- Q1 sagt, die Energieimporte in Plan B fielen „auch ohne Energiewende“ an. Das ist eine Wertung
  ohne Beleg: Ohne Energiewende lägen die Importe vermutlich höher, nicht gleich. Sie sollte als
  solche markiert werden; der Befund „keine Netzkosten“ bleibt davon unberührt.
- `uba_vorkette_*`: Die Fundstelle „S. 19“ ist die Druckseite, im PDF Seite 22.

## 4. Nachrechnungen

| Rechnung | Dossier | Nachrechnung (eigener Code) | Abweichung |
|---|---|---|---|
| Factsheet A Speicher | 7,12 TWh | 520 × 5/365 = 7,123 TWh | 0,0 % |
| Factsheet A Kosten | 1,42 Bio. € | 7,123 × 10⁶ MWh × 200.000 € = 1,425 Bio. € | +0,2 % (Rundung) |
| Factsheet A Bischof | 200 €/kWh; 12,5-fach | 112 Mrd./560 GWh = 200; 7.000/560 = 12,5 | 0 % |
| Schwächstes 120-h-Fenster, heutiger Park | – (P1-05) | Lücke 5,76 / 5,31 / 5,27 TWh (2023/24/25); EE-Deckung 21/24/26 % | neu |
| Factsheet B Auslastung | 86 % | 430.000 GWh / 57 GW = 7.544 h = 86,1 % | 0 % |
| Factsheet B €/kW | 6.250 | 310 Mrd./49,6 GW = 6.250; 7.000 × 49,6 GW = 347 Mrd. | 0 % |
| Factsheet B Gas | 21,7 Mrd. € | 11 + 12,2 × 11/12,5 = 21,74 | 0 % |
| QC Preisrelation | – | 82/105 = −21,9 % (Websuche: −22 %) | – |
| Factsheet H Zukauf | 4,86 t implizit | Emission − Zukauf = 4,86 in allen fünf Fällen | 0 % |
| Factsheet H mit 4,68 t | +1,2 Mrd. € DE | DE 15,8 statt 14,6 Mrd. € (+8,2 %); China 514 statt 494 (+4,1 %); USA +2,0 %; Indien −6,5 % | bestätigt |
| Factsheet H Familie | 58,67 € | 704/12 = 58,67; mit 4,68 t: 63,47 € | 0 % |
| Factsheet I Reichweite | 3,7–23,6 Jahre | 3.200/860 = 3,7; 20.300/860 = 23,6; ÷ 200: 16–102 Jahre | 0 % (102 statt 101: Rundung) |
| UBA Faktor | 6,2 | 23.600/3.805 = 6,20 | 0 % |
| BIP-Relation S. 12 | 2,2–3,1 | 10/4,47 = 2,24; 13,8/4,47 = 3,09; mit korrekten 13,3 Bio.: 2,98 | 0 % |
| Factsheet G | 0,83 % p. a.; Anteile | 0,83 %; 27,6 · 10,3 · 7,7 · 5,3 · 4,5 · 1,0 % | 0 % |
| ZEW Barwert | – | BAU 5.254 (Studie 5.257); mit nat. Maßnahmen 249 (247); ohne nat. Maßnahmen 1.074 = 20,4 % (Studie: 824 / 20,4 %) | 824 ist Zusatzbetrag |
| Inventar-Zählung | 170/103/39/27 | identisch; Factsheets 42 statt 41 mit Literatur | ±1 (Abgrenzung) |

## 5. Einseitigkeit und fehlende Gegenpositionen

Das Dossier ist im Ganzen fair: Es hat einen Abschnitt „stärkste Fassung“ und Gegenpositionen zu
den eigenen Befunden. Fehler in beide Richtungen:

**Zu hart gegenüber R21:**
- ETS-„Widerspruch“ (3.4): „ca. 51 %“ ist korrekt, das Dossier sagt nicht, welcher Wert stimmt.
- Monitoring-Bericht (3.3): Der Beleg betrifft einen anderen Bericht.
- ZEW: Das Dossier hält nur die Inkonsistenz 824/850 fest. Dass der Gesamteffekt bei ZEW eher
  1,07 Bio. € beträgt, also größer ist als von R21 genannt, fehlt.
- Plan B, Energieimporte „auch ohne Energiewende“: unbelegte Wertung zulasten von R21 (3.5).

**Zu milde gegenüber R21:**
- Factsheet A: Das Dossier nennt den Batterieanteil von 100 % eine „Setzung“. Die zitierte Studie
  selbst definiert die Flaute als Wind unter 10 %, und ihre Autoren halten die Sorge für womöglich
  übertrieben. Das Papier zitiert also eine Quelle gegen deren eigenes Fazit. Auch die Basis
  „520 TWh = +10 %“ ist als Bruttowert der heutige Stand.
- ZEW: Bezugsraum EU-27 und Hebel „nationale Maßnahmen“ statt „ESR einstellen“ — R21 stellt den
  Wert so dar, als sei es der Gewinn eines deutschen Politikwechsels. Ebenso fehlt die Aussage der
  Studie, nationale Maßnahmen seien gegen Marktbarrieren „helpful“.

**Fehlende Gegenposition:** Zu Kernaussage 4 die Verteidigung, dass der 8,2-ct-Wert im
Kernkraft-Szenario mit „konservativ sehr hohen“ Baukosten (7.000 €/kW) modelliert ist — der
Modellvergleich (−22 %) spricht für die Richtung von Factsheet B, auch wenn der Vergleich mit dem
Endkundenpreis schief bleibt. Das Dossier nennt die Gegenposition zu den Baukosten, nicht aber,
dass der Modellvorteil von −22 % in der Studie selbst unter diesen Annahmen entsteht.

## 6. Weiterhin nicht erreichbar

| Host | Dokument | Anmerkung |
|---|---|---|
| quantifiedcarbon.com | Projektseite „Role of Nuclear in Germany’s Decarbonisation“ | www.quantifiedcarbon.com leitet auf die Domain ohne „www“ um; diese lehnt der Proxy ab (403). Nicht umgangen |
| cdn.prod.website-files.com, weplanet-dach.org | Quantified Carbon 2025a (WePlanet-Bericht, PDF) | Host nicht freigegeben |
| iopscience / doi.org, econstor.eu | Volltext Ohlendorf/Schill 2020 | Host nicht freigegeben; nur Abstract auf diw.de gelesen |
| openclimatedata.net, globalcarbonbudget.org | GCP 2024, globaler Pro-Kopf-Wert 2023 | Host nicht freigegeben |
| www.eea.europa.eu | ETS-Indikator (−51 % 2005–2024) | Host nicht freigegeben; Kommissionsseite stattdessen gelesen |
| api.worldbank.org | Weltbevölkerung 2023 (WLD) | zweimal Zeitüberschreitung (Proxy), nicht weiter versucht |
| www.ifo.de | Pittel 2019 | nicht versucht (Browser-Prüfung laut Auftrag) |

## 7. Korrekturen

```json
{
  "dossier": "01_r21_behauptungen",
  "pruefung": "P2-01",
  "stand": "2026-11-22",
  "korrekturen": [
    {"id": "r21_zew_ersparnis_mrd_eur", "alt": "Websuche (C): ZEW-PM 'bis zu 824 Mrd.', EU-weit 2028-2048", "neu": "ZEW Rausch 2026 (primär): 824 Mrd. EUR = Barwert (1,5 % p.a.) 2028-2048, EU-27, Wohlfahrt ohne vermiedene Klimaschäden, Hebel 'nationale nicht-marktliche Maßnahmen entfallen' zusätzlich zu ESR-Flexibilisierung (247 Mrd.); Gesamteffekt laut 20,4 % und Tabellenwerten rund 1.071 Mrd.; 850 Mrd. steht nicht in der Studie", "fundstelle": "ZEW, Carbon Pricing in the EU and ETS2, 17.02.2026, S. 3 (Executive Summary), S. 13 (Szenarien), S. 15 Tab. 1, S. 16", "confidence": "B", "primaer_gelesen": true, "begruendung": "Original jetzt auf www.zew.de lesbar; Barwert-Nachrechnung scripts/pruefung/p2_01_zew_barwert.py"},
    {"id": "zew_politikkosten_bau_2028_2048_mrd_eur", "alt": null, "neu": 5257, "fundstelle": "ZEW Rausch 2026, S. 3 und Tab. 1 S. 15", "confidence": "B", "primaer_gelesen": true, "begruendung": "Neuer Parameter: Barwert der Wohlfahrtskosten der heutigen EU-Klimapolitik-Architektur, EU-27, 2,74 % des Konsums"},
    {"id": "zew_effekt_ohne_nationale_massnahmen_mrd_eur", "alt": null, "neu": {"min": 824, "max": 1071}, "fundstelle": "ZEW Rausch 2026, S. 3, Tab. 1 S. 15, S. 16", "confidence": "B", "primaer_gelesen": true, "begruendung": "Neuer Parameter: Studie nennt 824 einmal als Zusatz-, einmal als Gesamteffekt; 20,4 % von 5.257 = 1.071; Spanne bis zur Klärung"},
    {"id": "r21_zew_emissionen_2048", "alt": "nicht geprüft (D-5: 500 Mio. t bis 2048)", "neu": "ZEW-Zielpfade 2048: ETS1 ca. 0,43 Gt, ETS2 ca. 0,5 Gt (Grafikablesung ±0,05), zusammen ca. 0,9 Gt", "fundstelle": "ZEW Rausch 2026, Abb. 3, S. 12", "confidence": "B", "primaer_gelesen": true, "begruendung": "R21-Angabe passt nur zum ETS2-Pfad"},
    {"id": "diw_mcc_2020_dunkelflaute", "alt": "Studie nicht gelesen, nicht eindeutig bezeichnet", "neu": "Ohlendorf/Schill, Environ. Res. Lett. 15 (2020) 084045: jährlich ca. 5 Tage mit mittlerem Wind-Kapazitätsfaktor (an Land) unter 10 %, alle 10 Jahre knapp 8 Tage, längstes Ereignis knapp 10 Tage; Fazit: Sorge um Winterflauten 'may be overrated'", "fundstelle": "DIW-Publikationsseite, Abstract", "confidence": "B", "primaer_gelesen": true, "begruendung": "Abstract am Original gelesen, Volltext (IOP/econstor) nicht freigegeben"},
    {"id": "r21_factsheet_a_batterie_bio_eur", "alt": "Setzung: 100 % der Last 5 Tage aus Batterien", "neu": "wie bisher 1,4 Bio. EUR; Zusatz: zitierte Studie misst Wind < 10 % CF, nicht null; heutiger EE-Park deckte im schwächsten 120-h-Fenster 2023-2025 21-26 % der Last (Lücke 5,3-5,8 TWh); 520 TWh entspricht dem heutigen Bruttostromverbrauch, '+10 %' nur gegenüber der Netzlast", "fundstelle": "R21 PDF 10/A-1; DIW-Abstract; data/profiles_2023-2025.json; Dossier 03 (Netzlast 465,5 TWh, brutto 529 TWh) und 04 (brutto 518 TWh)", "confidence": "A", "primaer_gelesen": true, "begruendung": "Nachrechnung scripts/pruefung/p2_01_nachrechnung.py; Bruttowerte aus anderen Dossiers (dort B)"},
    {"id": "ewi_netzausbau_2045_mrd_eur", "alt": "Websuche (C): rund 732 Mrd. EUR, EWI/ef.Ruhr 2024 für Netze BW", "neu": 732, "fundstelle": "ef.Ruhr mit EWI (Unterauftrag), Abschätzung der Netzausbaukosten … zum Jahr 2045, April 2024, S. 4 und 8: Verteilnetz 430-431, Übertragungsnetz 301 (NEP)", "confidence": "B", "primaer_gelesen": true, "begruendung": "Auftraggeber laut S. 2: Netze-Gesellschaft Südwest mbH, nicht Netze BW; R21 'etwa 740' = +1,1 %"},
    {"id": "r21_ets_minderung_seit_2005_pct", "alt": "Drei Angaben, alle ohne Fundstelle (als Widerspruch gewertet)", "neu": "Referenz: rund -50 % 2005-2024 (Kommission 04.04.2025); D-4 'ca. 51 %' korrekt, F-1 '-47 %' entspricht Stand 2023, 'über 40 %' ist Zitat und als Untergrenze nicht falsch", "fundstelle": "climate.ec.europa.eu, News 04.04.2025 'EU ETS has reduced emissions in the sectors covered by 50 % since 2005'", "confidence": "B", "primaer_gelesen": true, "begruendung": "Kernaussage 7 beim ETS von 'Widerspruch' auf 'uneinheitlich, F-1 veraltet' abschwächen; EEA -51 % nur Websuche (C)"},
    {"id": "kernaussage_9_monitoring", "alt": "R21 widerspricht seiner eigenen Quelle (WD S. 1)", "neu": "WD S. 1 betrifft den Bericht der Expertenkommission, R21 spricht vom Monitoring-Bericht der Bundesregierung; tragender Beleg ist WD S. 5 (8. Monitoring-Bericht der Bundesregierung zur Kostenbetrachtung); welchen Bericht R21 meint, bleibt offen", "fundstelle": "R21 PDF 17/12; WD 5-135/24 S. 1 und S. 5", "confidence": "B", "primaer_gelesen": true, "begruendung": "Zuordnung des Belegs zum falschen Bericht"},
    {"id": "r21_factsheet_h_zuteilung_angegeben_t", "alt": "welcher Wert stimmt, offen", "neu": "4,68 t plausibel (GCP 2024: 37,0 Gt fossiles CO2 2023 / rund 8 Mrd. Menschen = ca. 4,6 t); Tabelle mit 4,86 unterschätzt die Zahlungen der Käufer um 2-8 %", "fundstelle": "Websuche GCP 2024 (Pressemitteilungen); R21 PDF 49-50", "confidence": "C", "primaer_gelesen": false, "begruendung": "GCP-Original nicht freigegeben"},
    {"id": "wendland_qc_preis_mischsystem_eur_mwh", "alt": "C, primaer_gelesen false", "neu": 82, "fundstelle": "Wendland 2026, PDF S. 16", "confidence": "B", "primaer_gelesen": true, "begruendung": "Referat bei Wendland selbst gelesen; QC-Original weiter nicht erreichbar; Websuche: -22 % Durchschnittspreis Kernkraft- gegen VRE100-Szenario, konsistent"},
    {"id": "wendland_qc_preis_ee_system_eur_mwh", "alt": "C, primaer_gelesen false", "neu": 105, "fundstelle": "Wendland 2026, PDF S. 16", "confidence": "B", "primaer_gelesen": true, "begruendung": "wie oben"},
    {"id": "uba_vorkette_pipeline_norwegen_g_gj", "alt": "Fundstelle S. 19", "neu": 3805, "fundstelle": "UBA CC 21/2019, Druckseite 19 = PDF-Seite 22", "confidence": "B", "primaer_gelesen": true, "begruendung": "Seitenkonkordanz ergänzen; gilt auch für uba_vorkette_lng_usa_g_gj"},
    {"id": "inventar_wendland_seiten", "alt": "Nr. 42 'S. 12', Nr. 107 'S. 11', Nr. 115 'S. 4 und 11'", "neu": "PDF 11 und 17 (4 ct), PDF 16 (82/105, 350 Mrd., 7.000 EUR/kW), PDF 3 und 31 (350 Mrd.), PDF 4 (310-Grafik)", "fundstelle": "Wendland 2026, Diskussionspapier_Kernenergie-2.pdf", "confidence": "A", "primaer_gelesen": true, "begruendung": "uneinheitliche Seitenangaben im Inventar"}
  ]
}
```
