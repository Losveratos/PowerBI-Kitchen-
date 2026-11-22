# Prüfbericht zu Dossier 05 · Speicher, Flexibilität und Dunkelflaute

Stand 22.11.2026 · Phase 2 · Auftrag `agents/briefs/P2_gegenpruefung.md` · Prüfer P2-05 (Opus),
nicht Verfasser des Dossiers · geprüftes Dossier `research/05_speicher_dunkelflaute.md` ·
eigene Nachrechnung `scripts/pruefung/p2_05_nachrechnung.py` (Ergebnis `scripts/pruefung/p2_05_ergebnis.json`) ·
neue Quellen mit Prüfsumme in `quellen/manifest_P2-05.json`.

## 1 · Urteil in fünf Zeilen

1. Die Zahlen des Dossiers halten fast durchgängig: Die Dunkelflauten-Rechnung lässt sich aus `data/profiles_*.json` mit eigenem Code auf ≤ 1 % genau nachbauen, und alle primär gelesenen Fundstellen (R21, KfW, ISE, NEP, BNetzA, SMARD) stimmen.
2. Echte Fehler sind klein: Bei der Summe der Netzengpasskosten 2019–2021 wurde eine GWh-Spalte als Kosten mitgezählt. Beim Dezember 2024 wird ein Wert (4,5 GW) fälschlich als „nicht im Pressetext“ bezeichnet. Bei Agora ist die Abgrenzung „inkl. V2G“ falsch.
3. Das Hauptproblem ist die Einordnung, nicht die Arithmetik: Variante V3 legt den Wasserstoffspeicher für ein einziges 5-Tage-Ereignis aus (10–15 TWh). Alle herangezogenen Studien brauchen dagegen 80–95 TWh. Variante V4 überträgt einen 5-GW-Auktionspreis auf 61–77 GW. Beides fällt zugunsten des Hauptpfads aus.
4. Es fehlt eine starke Gegenposition aus genau der Forschergruppe, die das Dossier zitiert: Kittel/Schill finden für Deutschland als Insel ein Extremereignis von 109 Tagen mit etwa einem Drittel der üblichen Wind- und PV-Verfügbarkeit (Winter 1995/96).
5. Die Konfidenz ist mehrfach zu hoch angesetzt: Sechs A-Werte stützen sich auf eine einzige Quelle, auf eine eigene Rechnung oder auf einen Suchauszug. Sie sollten B heißen. Die Kernaussage „R21 nimmt die falsche Technik“ bleibt davon unberührt und ist gut belegt.

## 2 · Prüftabelle

Ergebnis: **bestätigt** · **abweichend** · **nicht prüfbar**. „neu“ = vorgeschlagene Konfidenz / `primaer_gelesen`.

### 2.1 Kernaussagen

| Nr. | Wert im Dossier | geprüfte Fundstelle | Ergebnis | neu |
|---|---|---|---|---|
| K1 | Lücke im schwächsten 5-Tage-Fenster bei Zielen 2030: 4,8 / 5,7 / 7,0 TWh; Winterlast 1,02–1,18; R21 7,1 TWh | eigene Nachrechnung aus `data/profiles_2015…2025.json`; R21 PDF S. A-1 | **bestätigt**: 4,87 / 5,73 / 6,97 TWh (+1,0 / +0,4 / +0,2 %); Lastfaktor 1,019–1,18. Wählt man das Fenster mit der *größten Lücke 2030* statt mit dem geringsten historischen EE-Anteil: 4,96 / 5,74 / 6,98 TWh | B / true (Setzung M) |
| K2 | NEP 2045: H₂-Kraftwerke 60,6–81,3 GW; Batterien 2 h bzw. 2,5 h, zusammen 231–390 GWh = 3–6 % von 7 TWh; R21: „gegenwärtig dafür vorgesehene Technik ist der Batteriespeicher“ | NEP 2037/2045 V2025, 2. Entwurf, Tab. 8 (PDF-S. 48), Tab. 1 (PDF-S. 28), S. 50; R21 S. 9 Fn. 2 | **bestätigt**: 41,1×2 + 59,7×2,5 = 231,5 GWh; 94,1×2 + 80,9×2,5 = 390,5 GWh; 3,3–5,6 %. Hinweis: Die H₂-Kraftwerksleistung ist im NEP eine Vorgabe des Szenariorahmens („pauschal an den Langfristszenarien des BMWE“) und kein Modellergebnis | A / true (NEP und R21 sind jeweils Urheber; Aussage trägt) |
| K3 | V3 38 / 69 / 111 Mrd. €; V4 9,4–11,9 Mrd. €/a; R21-Batterie als Annuität ≈ 135 Mrd. €/a | `data/p1_05_factsheet_a.json`, nachgerechnet; ISE 2024 Tab. 1; INES/DBI über cleanthinking; BNetzA PM 03.11.2026 | **rechnerisch bestätigt** (38,4 / 69,1 / 111,2; 9,43 / 10,90 / 11,88; 134,9). **Einordnung schief**, s. Abschnitt 3.1 und 3.2 | B / true (Rechnung), Setzungen benennen |
| K4 | Ohlendorf/Schill: ~5 Tage jährlich, ~8 Tage je Jahrzehnt, „möglicherweise überbewertet“; eigene Auswertung: längste Wind-Phase 120 / 130 / 185 h | Original (arxiv, iopscience, econstor) nicht freigegeben; auf www.diw.de nicht vorhanden. Eigene Nachrechnung | Eigene Zahl **bestätigt** (exakt 120 / 130 / 185). Studienzitat **nicht prüfbar**; die Websuche stützt „knapp 10 Tage längstes Ereignis“ und „Sorge möglicherweise übertrieben“ | **B** statt A / Studie false |
| K5 | 1.422 Ereignisse ≥ 10 h (2016–2025); Uniper 1.435; ≥ 48 h 2–7 je Jahr, Mittel 4,0 | eigene Nachrechnung | **bestätigt**: 1.426 (+0,3 %); ≥ 48 h 2–7, Mittel 4,18 (+4,5 %). Uniper nur über strommix, nicht primär | **B** statt A |
| K6 | Batterien 22,7 GW / 35,6 GWh (11/2026), ≈ 80 % Heimspeicher; Li-Großspeicher ≈ 3 GW, ≈ 1,5 h; 400 GW Anfragen / 25 GW Zusagen | `quellen/raw/P1-05/ec_installed_power_monthly.json` (11.2026: 22,659 GW / 35,61 GWh); KfW 555 S. 1–2 („eineinhalb Stunden“, Grafik 4: 3 GW) | **bestätigt** | A (Bestand) / B (Rest), true |
| K7 | Elektrolyse ≈ 0,2 GW, ≤ 2,4 GW bis 2030; Kavernen frühestens 2033/2035 | KfW 04.03.2026 S. 1; **EWI PM 20.01.2026 (neu, primär): 181 MWel, 1,3 GWel in Bau/finanziert**; cleanthinking 06.11.2026 | **bestätigt** | A / true (Elektrolyse); B / false (Kavernen, Interessenverband über Presse) |
| K8 | Europa 1996/97: 55 Tage, 47 %; Langzeitspeicher Europa 351 TWh (7 % Jahresverbrauch) bzw. 159 TWh; gesicherte CO₂-freie Erzeugung senkt ihn „nur moderat“ | **DIW: Vortrag Kittel, dena, 22.09.2025, Folie 13 (neu, primär)**; DIW-Podcast „fossilfrei“ Folge 44 (Transkript) | 55 Tage, „knapp die Hälfte“ der Verfügbarkeit, 351 und 159 TWh **bestätigt**. „7 % des Jahresverbrauchs“ und „nur moderat“ **nicht prüfbar**: Die Folie sagt nur, Kernkraft „reduces optimal long-duration storage … energy capacity“ | B / true (Autorenvortrag, nicht das Paper) |
| K9 | Netzengpasskosten 1,3 → 4,2 → 3,3 → 3,0 → 3,1 Mrd. €; Abregelung ≈ 9,4 TWh (≈ 3,5 %); negative Stunden 301 → 457 → 576 | BNetzA Ganzjahr 2022, Tab. 2; SMARD 2024 und Q4/2025; eigene Zählung `ec_price_*.json` | 2022–2025 und Abregelung **bestätigt** (3.071 / 2.954 Mio. €; 9.379 GWh; „3.5 %“). **2019–2021 abweichend** (s. 3.4). Negative Stunden **exakt bestätigt** | B / true |
| K10 | R21 beruft sich auf Bischof (560 GWh, 112 Mrd. €, 12,5-fach); Gutachten RBID für DUH/WVW mit gegenteiligem Ergebnis | R21 S. A-1 (bestätigt); RBID-Original auf duh.de nicht freigegeben | R21-Teil **bestätigt**; Gutachten **nicht prüfbar** | B / false |

### 2.2 Alle Parameter mit Konfidenz A (11)

| Parameter | Wert im Dossier | Fundstelle geprüft | Ergebnis | neu |
|---|---|---|---|---|
| df_wind_laengste_phase_h | 120 / 130 / 185 h | eigene Nachrechnung (6-h-Mittel, Wind an Land + See) | **bestätigt** (identisch, ob das Mittel nachlaufend oder zentriert gebildet wird) | **B** / true: eigene Rechnung, keine unabhängige zweite Quelle mit gleicher Definition |
| df_ereignisse_ge10h_2016_2025 | 1.422 | eigene Nachrechnung | **bestätigt**: 1.426 (+0,3 %); mit PV inkl. Eigenverbrauch 1.440 | **B** / true: Uniper nicht primär gelesen |
| df_ereignisse_ge48h_pro_jahr | 2 / 4,0 / 7 | eigene Nachrechnung | **bestätigt**: 2 / 4,18 (Median 4) / 7; je Jahr ±1 (2017, 2020, 2021 +1; 2024 −1) | **B** / true |
| dez2024_reserven_gw | Markt 3,4 GW; Reserven 12–13 GW | BNetzA/BKartA PM 21.10.2025 | **abweichend (unvollständig)**: Die PM nennt Marktkapazität **ca. 4,5 GW am 6.11.** und **ca. 3,4 GW am 12.12.2024**, jeweils 17–18 Uhr; Reserven 12–13 GW bestätigt | **B** / true (eine Quelle) |
| r21_fa_speicher_twh | 7,12 TWh | R21 S. A-1 | **bestätigt** (520/73 = 7,123; im Papier „≈ 7 TWh“) | A / true |
| r21_fa_kosten_mrd_eur | 1.400 | R21 S. A-1 | **bestätigt** | A / true |
| batterie_bestand_de_2026_11 | 22,7 GW / 35,6 GWh | Energy-Charts installed_power 11.2026; KfW 555 (06/2026: 19 GW / 29 GWh) | **bestätigt**; Energy-Charts 06/2026 = 19,9 GW / 30,8 GWh, passt zu KfW. Der Monat 11/2026 kann noch unvollständig sein | A / true |
| pumpspeicher_de | 10 GW / 55 GWh | KfW 555 S. 2; NEP Tab. 1 (9,9 GW) | **bestätigt** | A für GW, B für GWh (nur KfW) / true |
| elektrolyse_installiert_gw_2026 | 0,2 GW | KfW 04.03.2026; **EWI PM 20.01.2026: 181 MWel** | **bestätigt**, jetzt beide primär | A / true |
| vsm2025_zusatzbedarf_steuerbar_2035_gw | 22,4 / 35,5 GW | BNetzA, Seite zum Versorgungssicherheitsmonitoring | **bestätigt** („Bruttowerte, die den Zubau ohne Stilllegungen beziffern“) | **B** / true: nur eine Quelle, der Urheber selbst |
| negative_preisstunden | 211 / 298 / 139 / 69 / 301 / 457 / 576 | eigene Zählung `quellen/raw/P1-05/ec_price_*.json` | **exakt bestätigt**. 2025: 576 Stunden mit negativem Stundenmittel; 588 Stunden mit mindestens einem negativen Viertelstundenwert; 724 negative Einzelwerte. 2023/2024 laut Websuche auch BNetzA (über pv magazine) | **B** / true, solange BNetzA/SMARD nicht primär gelesen ist |

### 2.3 Stichprobe B (35 B-Werte, alphabetisch, k = 3, ab dem ersten)

| Parameter | Wert im Dossier | Fundstelle geprüft | Ergebnis | neu |
|---|---|---|---|---|
| agora_speicher_ausspeisung_2045_gw | 538 / 24 / 3,3 GW, „inkl. V2G“; WP+E-Auto 2,6 GW | Agora KNDE, PDF-S. 54 f., Abb. 11 | Werte **bestätigt**; Abgrenzung **abweichend**: Fußnote „* Großspeicher und Heimspeicher“, E-Mobilität steht getrennt (60 GW in 1 h). Quellenangabe der Abbildung: „Agora Energiewende und Prognos (2024)“ | B / true |
| batterie_gross_li_gw_2026 | 3 GW, ≈ 1,5 h | KfW 555 S. 2, Grafik 4 | **bestätigt** („eineinhalb Stunden bei Volllast“) | B / true |
| bischof_speicher_gwh | 560 GWh | R21 S. A-1 | Wiedergabe durch R21 **bestätigt**; RBID-Original **nicht prüfbar** (duh.de) | B / false |
| df_5d_anteil_windpv_an_last | 0,035 / 0,098 / 0,131 | eigene Nachrechnung | **bestätigt** (identisch) | B / true |
| df_5d_winterlastfaktor | 1,02–1,18 | eigene Nachrechnung | **bestätigt** (1,019–1,180) | B / true |
| df_ohlendorf_schill_dauer_jaehrlich_tage | 5 Tage | arxiv, econstor, iopscience nicht freigegeben; auf diw.de kein Volltext gefunden | **nicht prüfbar** | B / false |
| fa_r21_batterie_annuitaet_mrd_eur_pro_jahr | 135 | eigene Rechnung: 1.400 × Annuitätenfaktor(5 %, 15 a) = 1.400 × 0,09634 | **bestätigt** (134,9) | B / true |
| fa_v4_stromvkg_mrd_eur_pro_jahr | 9,4 / 10,9 / 11,9 | BNetzA PM 03.11.2026 und Seite zum Gebotstermin | **rechnerisch bestätigt**; Übertragbarkeit zweifelhaft (s. 3.2) | B / true |
| h2_speicherbedarf_2045_twh | 76 / 80 / 94,6 | Agora PDF-S. 29 („etwa 80 TWh“, inkl. Resilienzpuffer); cleanthinking (94,6 TWh) | 80 und 94,6 **bestätigt**; 76 (BMWK-Weißbuch) **nicht geprüft**. 94,6 TWh stammt laut cleanthinking aus dem BMWK-Langfristszenario O45-Strom und ist daher keine unabhängige Studie | B / true (Agora), false (Rest) |
| ldes_bedarf_europa_twh | 159 / 351 TWh | DIW, Vortrag Kittel (dena, 22.09.2025), Folie 13 | **bestätigt** („Copperplate 159 TWh … TYNDP 351 TWh“) | B / **true** (Autorenvortrag; das Paper selbst weiter nicht gelesen) |

### 2.4 Schwerpunkte aus dem Auftrag

| Schwerpunkt | Ergebnis |
|---|---|
| Lücke 4,8 / 5,7 / 7,0 TWh samt Annahmen | **bestätigt** (Abschnitt 4). 215 / 115 / 30 GW sind die gesetzlichen Ausbauziele 2030 (EEG, WindSeeG; Gesetzestext nicht primär gelesen, gesetze-im-internet.de nicht freigegeben). Mit dem Bestand 11/2026 statt der Ziele: **6,3 / 6,8 / 7,5 TWh**. R21s 7 TWh treffen den heutigen Anlagenpark also ziemlich genau |
| Drei Kostenvarianten | rechnerisch **bestätigt**, Einordnung s. 3.1–3.2 |
| DIW/MCC 2020 am Original | **nicht prüfbar**: Das Paper liegt nicht auf www.diw.de; diw.de ohne „www“ wird vom Proxy abgelehnt. Gefunden und gelesen: neuere DIW-Arbeiten derselben Gruppe (Kittel/Schill) |
| Batteriekosten-Lücke ISE 400–600 gegen strommix 180–260 €/kWh | **geklärt, keine Widersprüche**: Die beiden Zahlen messen Verschiedenes (s. 3.5) |
| H₂-Kraftwerke und Batterien im NEP 2045 | **bestätigt** (K2) |
| Negative Preisstunden | **exakt bestätigt** |

Summe: **36 geprüfte Werte bzw. Aussagen**: 10 Kernaussagen, 11 A-Werte, 10 B-Stichproben, 5 Schwerpunkte (ohne Doppelzählung).
Davon **27 bestätigt** (bei 8 davon wird die Konfidenz herabgestuft), **5 abweichend** (dez2024_reserven_gw, netzengpass 2019–2021, Agora-Abgrenzung, Einordnung V3/V4 in K3, Wind+PV-Phasen je Jahr) und **4 nicht prüfbar** (Ohlendorf/Schill, Bischof/RBID, „7 %“ und „nur moderat“ in K8, BMWK 76 TWh).

## 3 · Abweichungen im Detail, nach Gewicht

### 3.1 V3: Der Wasserstoffspeicher reicht nur für ein einziges 5-Tage-Ereignis (zugunsten des Hauptpfads)

V3 bemisst die Kaverne mit Lücke/Wirkungsgrad = 10–15 TWh H₂. Dieselbe Literatur, die das Dossier zitiert, bemisst den deutschen H₂-Speicher 2045 viel größer:
- Agora: etwa 80 TWh inkl. Resilienzpuffer (PDF-S. 29),
- INES/DBI: 94,6 TWh,
- Kittel/Schill: Extremereignisse über viele Wochen.

Die Kavernenkosten dafür liegen nach INES/DBI bei rund 18 + 37,6 = **55,6 Mrd. €** statt 5–19 Mrd. €. V3 stiege damit grob auf **≈ 90–150 Mrd. €**. Hinzu kommen die nicht enthaltenen Elektrolyseure (NEP 2045: 31,6–70 GW). Das bleibt eine Größenordnung unter 1,4 Bio. €. Kernaussage 3 trägt also weiter, aber die Spanne „38 / 69 / 111“ ist als Kostenblock „Dunkelflaute“ zu niedrig. Das Fazit „40–180 Mrd. €“ mischt zudem Investitionen (V3) mit 15 Jahren Kapazitätszahlung (V4).

### 3.2 V4: Ein Auktionspreis aus 5 GW wird auf 61–77 GW hochgerechnet (zugunsten des Hauptpfads)

Ausgeschrieben waren 4.500 rMW. Geboten wurden insgesamt nur 11.958 rMW, bezuschlagt 5.160 rMW. Die Zuschlagswerte lagen zwischen **129.551 und 189.970 €/rMW·a**, der Höchstwert bei 244.000 (BNetzA, Seite zum Gebotstermin, primär). Für eine Menge, die mehr als das Fünffache des gesamten Gebotsvolumens beträgt, ist der Durchschnittspreis kein Beleg. Setzt man den Höchstwert an, ergeben sich bei 61–77 GW **14,8–18,7 Mrd. €/a**. Die Gleichsetzung „1 GW Lücke = 1 rMW“ ist im Dossier als Vereinfachung benannt. Dass der Preis über die Menge hinweg gleich bleibt, steht dort nicht.

### 3.3 Fehlende Gegenposition: 109 Tage für Deutschland als Insel (zugunsten des Hauptpfads)

Im DIW-Podcast „fossilfrei“, Folge 44 (Transkript, primär, 00:45:27–00:46:38), berichten Kittel und Schill:
- Europaweit dauert das extremste Ereignis 55 Tage, bei „knapp der Hälfte“ der langjährigen Verfügbarkeit.
- Für **Deutschland allein** ergibt sich **109 Tage (Winter 1995/96)** mit „ungefähr einem Drittel“ der durchschnittlichen Wind- und PV-Verfügbarkeit.

Das Dossier nennt nur den europäischen Wert. Für die R21-Frage (Auslegung Deutschlands) ist der Inselwert die naheliegende Gegenposition. Er zeigt: Die 5 Tage sind kein Bemessungsfall für die Energiemenge, und Importe zu begrenzen kostet viel.

### 3.4 Netzengpasskosten 2019–2021: GWh-Spalte als Kosten addiert

BNetzA, Bericht Gesamtjahr 2022, Tab. 2: Die letzte Spalte „Anpassungen von Stromeinspeisung — Menge GWh“ (9,3 / 16 / 20,4) wurde zu den Kostenspalten addiert. Richtig sind die Summen 227,2 + 64,2 + 81,6 + 196,5 + 709,5:

| Jahr | Dossier | richtig | Abweichung |
|---|---:|---:|---:|
| 2019 | 1.288 | **1.279,0 Mio. €** | −0,7 % |
| 2020 | 1.448 | **1.432,4** | −1,1 % |
| 2021 | 2.306 | **2.285,6** | −0,9 % (BNetzA-Text: „2,3 Mrd.“) |

Die Aussage in K9 bleibt richtig, die Tabellenwerte nicht.

### 3.5 Batteriekosten: Die „ungeklärte Differenz“ ist eine Abgrenzungsfrage

**ISE 2024, Tab. 1 und 8 (primär):** „Batteriespeicher für PV-Freiflächenanlagen (> 1 MWp, PV-Leistung zu Batteriekapazität 3:2)“, **€/kWh Nutzkapazität inkl. Installation, ohne MwSt.**, Preisstand 2024 („Fraunhofer ISE intern, Lazard 2024“). Gemeint ist also ein an eine PV-Anlage gekoppelter Speicher im Bereich weniger MWh. Für Heim- und Dachanlagen gibt das ISE 450–1.000 €/kWh an.

**strommix 180–260 €/kWh:** „schlüsselfertiges 4-h-System, Europa, Marktdaten 2026“. Das ist ein großer, netzgekoppelter Speicher nach dem Zellpreisverfall 2024/25. Die Angabe ist B und nicht primär; strommix nennt selbst „kein ‚WindGuard für Speicher‘“.

Die Differenz erklären Baujahr, Anlagengröße, Speicherdauer (4 h verteilt die leistungsbezogenen Kosten) und Nutz- statt Nennkapazität. Keine der beiden Zahlen gilt für ein Speichersystem mit 120 h Entladedauer. R21s 200 €/kWh liegt im Marktband. Die V2-Obergrenze von 600 €/kWh (3.694 Mrd. €) ist für Großspeicher 2026 deshalb wenig plausibel. Das Dossier sollte „ungeklärt“ durch diese Abgrenzung ersetzen.

### 3.6 Dezember 2024: 4,5 GW stehen im Pressetext

Im Abschnitt „Abweichungen gegenüber strommix“ heißt es, „4,5 GW nicht im Pressetext“. Die PM vom 21.10.2025 nennt aber „ca. 4,5 Gigawatt bzw. ca. 3,4 Gigawatt an Marktkapazitäten“ (6.11. bzw. 12.12.2024). Der strommix-Wert „3,4–4,5 GW“ war also richtig. Die PM schreibt außerdem: „Für zukünftige Dunkelflauten sehen wir weiterhin einen dringenden Bedarf an neuen steuerbaren Kapazitäten“. Das Dossier lässt das weg, obwohl es den Fall als Beleg für Versorgungssicherheit anführt.

### 3.7 Wind+PV-Phasen je Jahr hängen an der PV-Leistungsbasis

Das P1-05-Skript rechnet den PV-Kapazitätsfaktor gegen die **AC-Leistung**. Die Profile von P1-03 rechnen gegen die **DC-Leistung**. Die gesetzlichen 215 GW sind Modulleistung, also DC. Folgen:
- Die Lücke ändert sich kaum (+0,05 TWh).
- Die längste Wind+PV-Phase je Jahr verschiebt sich stark: 2024 sind es 248 h (DC) statt 133 h (AC), 2023 107 h statt 164 h.

Die Wind+PV-Spalte „längste“ in Tabelle 1.3 ist damit methodenabhängig und sollte nicht als Einzelwert zitiert werden. Die Nur-Wind-Werte sind robust.

### 3.8 Kleinere Punkte

- Agora: Die Abgrenzung „inkl. V2G“ ist falsch (s. 2.3). Die Quelle der Abbildung ist Agora/Prognos 2024.
- NEP: Pumpspeicher 2045 laut Tab. 1 12,0 GW, laut Tab. 8 11,9 GW (netto). Das Dossier nennt beide Werte; besser einheitlich Tab. 8 angeben.
- K4 und K5 tragen „A“, obwohl die zweite Quelle nur ein Suchauszug oder eine strommix-Angabe ist. Das widerspricht REGELN.md („nie Stufe A“ aus Suchauszug).

## 4 · Nachrechnungen

Code: `energiewende/scripts/pruefung/p2_05_nachrechnung.py`. Eigener Ansatz: Rollsummen über alle 120-h-Fenster, Kapazitäten aus `mw / capacity_factor` der P1-03-Profile. Aufruf `python3 -I …`; mit `P2_05_SENS=1` zusätzlich die Variante mit dem Anlagenbestand 11/2026.

| Größe | Dossier | Nachrechnung | Abweichung |
|---|---|---|---|
| Lücke 5 Tage, Ziele 2030 (min / Median / max), Fenster = geringster EE-Anteil | 4,82 / 5,71 / 6,96 TWh | 4,87 / 5,73 / 6,97 | +1,0 / +0,4 / +0,2 % |
| dto., Fenster = größte Lücke 2030 | — | 4,96 / 5,74 / 6,98 | +2,9 / +0,5 / +0,3 % |
| dto., nur Defizitstunden (keine Verrechnung von Überschüssen) | — | 4,94 / 5,73 / 6,97 | ≤ 2,5 % |
| dto., PV inkl. Eigenverbrauch | — | 4,79 / 5,59 / 6,95 | −0,6 / −2,1 / −0,1 % |
| dto., Bestand 11/2026 statt Ziele (PV 133,4 / Wind an Land 72,3 / See 11,7 GW) | — | **6,30 / 6,83 / 7,52** | Sensitivität |
| Spitzenlücke im Fenster | 60,7 / 70,2 / 76,5 GW | 60,7 / 70,2 / 76,5 | 0 % |
| Lastfaktor im Fenster | 1,02–1,18 | 1,019–1,180 | 0 % |
| Wind+PV-Anteil an der Last | 3,5 / 9,8 / 13,1 % | 3,5 / 9,8 / 13,1 % | 0 % |
| Biomasse + Laufwasser im Fenster | 0,73–0,83 TWh | 0,725–0,832 | 0 % |
| Ereignisse ≥ 10 h, 2016–2025 | 1.422 | 1.426 | +0,3 % |
| Ereignisse ≥ 48 h je Jahr (min / Mittel / max) | 2 / 4,0 / 7 | 2 / 4,18 / 7 | Mittel +4,5 % |
| Längste Nur-Wind-Phase | 120 / 130 / 185 h | 120 / 130 / 185 | 0 % |
| Negative Stunden 2019–2025 | 211 … 576 | identisch | 0 % |
| V1 (Lücke − 0,8 TWh) × 200 €/kWh | 804 / 983 / 1.231 Mrd. € | 804 / 983 / 1.231 | 0 % |
| V2 Spanne 130–600 €/kWh | 523–3.694 | 522,6–3.693,6 | 0 % |
| V3 Turbinen + Kaverne | 38 / 69 / 111 | 38,4 / 69,1 / 111,2 | 0 % (Setzungen s. 3.1) |
| V4 155.296 €/rMW·a × Spitzenlücke | 9,4 / 10,9 / 11,9 Mrd. €/a | 9,43 / 10,90 / 11,88 | 0 %; mit Höchstwert 244.000: 14,8 / 17,1 / 18,7 |
| R21-Batterie als Annuität (5 %, 15 a) | 135 | 134,9 | 0 % |
| Netzengpasskosten 2019 / 2020 / 2021 | 1.288 / 1.448 / 2.306 | 1.279,0 / 1.432,4 / 2.285,6 | −0,7 / −1,1 / −0,9 % |

## 5 · Einseitigkeit und fehlende Gegenpositionen

**Zugunsten des Hauptpfads „Erneuerbare + Speicher“ geschönt oder ausgelassen:**
- **V3** legt den H₂-Speicher für ein einziges 5-Tage-Ereignis aus (3.1).
- **V4** rechnet einen Auktionspreis über die Menge hinaus hoch (3.2).
- Der **Inselwert 109 Tage** für Deutschland fehlt (3.3).
- Die Mahnung der BNetzA zu **„dringendem Bedarf an neuen steuerbaren Kapazitäten“** aus derselben PM fehlt (3.6).
- **Unsichere Ausbauziele:** Mit dem Bestand 11/2026 statt der Ziele 2030 ist die Lücke 6,3–7,5 TWh. R21 liegt dann beim Energiebedarf nicht „ungefähr“, sondern ziemlich genau richtig. Das Dossier erwähnt nicht, dass vor allem 30 GW auf See 2030 (Bestand 11,7 GW) unsicher ist.
- **Biomasse und Laufwasser:** V1 zieht 0,8 TWh aus dem heutigen Park ab, obwohl das Dossier selbst den Rückgang der Biomasse auf 3 GW (NEP 2045) nennt.

**Zu Ungunsten des Hauptpfads bzw. zugunsten R21 dargestellt:**
- **V2-Obergrenze:** 600 €/kWh für Großspeicher 2026 ist zu hoch angesetzt (3.5) und bläst die „3.694 Mrd. €“ auf.
- **Fehlender Beleg für die Lösbarkeit:** Das DIW-Glossar (Kittel, primär) ordnet die Technik zu: Batterien für kurze Flauten, Pumpspeicher und steuerbare Kraftwerke für lange, H₂-Speicher und Backup-Kraftwerke für extreme. Fazit dort: „Dunkelflauten sind also kein Showstopper der Energiewende“. Das stützt Kernaussage 2 aus einer unabhängigen Quelle; das Dossier nutzt es nicht.

**Methodisch neutral, aber offenzulegen:**
- Die H₂-Kraftwerksleistung im NEP ist eine Szenario-Vorgabe aus den BMWE-Langfristszenarien und kein optimiertes Ergebnis. Der INES-Speicherbedarf (94,6 TWh) stammt aus demselben Szenario O45-Strom. „Mehrere Studien“ sind hier also teilweise eine Quelle.

## 6 · Weiterhin nicht erreichbar

| Host | Dokument | Status |
|---|---|---|
| arxiv.org, iopscience.iop.org, www.econstor.eu | Ohlendorf/Schill 2020 (ERL 15 084045) | nicht freigegeben; auf www.diw.de nicht vorhanden |
| diw.de (ohne www) | Transkript fossilfrei 44 | Proxy 403; über www.diw.de abgerufen |
| www.nature.com | Kittel/Roth/Schill 2026 (Paper) | nicht freigegeben; ersetzt durch DIW-Vortrag |
| www.duh.de | RBID/Bischof 2026 | nicht freigegeben |
| www.gesetze-im-internet.de | StromVKG Anlage 4; EEG § 4, WindSeeG § 1 (Ausbauziele 215 / 115 / 30 GW) | nicht freigegeben |
| www.pv-magazine.de | negative Stunden 2024/2025 (BNetzA-Angabe) | nicht freigegeben; nur Websuche |
| data.bundesnetzagentur.de | Monitoringbericht 2025 | nicht erneut versucht (in P1 Proxy 403) |

Nicht versucht, weil für die Prüfung nicht nötig: www.bundeswirtschaftsministerium.de (VSM-Hauptbericht, Weißbuch H₂-Speicher), www.entsoe.eu (ERAA 2025, DE-Werte). Beides bleibt eine Lücke im Dossier.

```json
{
  "dossier": "05_speicher_dunkelflaute",
  "pruefer": "P2-05",
  "stand": "2026-11-22",
  "korrekturen": [
    {"id": "netzengpass_kosten_mio_eur", "alt": {"2019": 1288, "2020": 1448, "2021": 2306}, "neu": {"2019": 1279.0, "2020": 1432.4, "2021": 2285.6}, "fundstelle": "BNetzA, Netzengpassmanagement Gesamtjahr 2022, Tab. 2 (Summe Redispatch-, Countertrading-, Netzreserve-Abruf-, Vorhalte- und EinsMan-Kosten; ohne Spalte 'Anpassungen … Menge GWh')", "confidence": "B", "primaer_gelesen": true, "begruendung": "Dossier hat die GWh-Spalte 'Anpassungen von Stromeinspeisung' (9,3 / 16 / 20,4) zu den Kosten addiert."},
    {"id": "dez2024_reserven_gw", "alt": {"markt": 3.4, "reserven_min": 12, "reserven_max": 13}, "neu": {"markt_06_11_2024": 4.5, "markt_12_12_2024": 3.4, "reserven_min": 12, "reserven_max": 13}, "fundstelle": "BNetzA/BKartA PM 21.10.2025", "confidence": "B", "primaer_gelesen": true, "begruendung": "PM nennt ca. 4,5 GW (6.11.) und ca. 3,4 GW (12.12.); 'nicht im Pressetext' ist falsch; nur eine Quelle, daher B."},
    {"id": "df_wind_laengste_phase_h", "alt": "A", "neu": "B", "fundstelle": "Nachrechnung scripts/pruefung/p2_05_nachrechnung.py: 120 / 130 / 185 h (identisch)", "confidence": "B", "primaer_gelesen": true, "begruendung": "Wert bestätigt; zweite Stütze (Ohlendorf/Schill) nur Suchauszug und andere Definition."},
    {"id": "df_ereignisse_ge10h_2016_2025", "alt": {"value": 1422, "confidence": "A"}, "neu": {"value": 1422, "nachrechnung": 1426, "confidence": "B"}, "fundstelle": "Nachrechnung P2-05", "confidence": "B", "primaer_gelesen": true, "begruendung": "Bestätigt (+0,3 %); Uniper 1.435 nicht primär gelesen."},
    {"id": "df_ereignisse_ge48h_pro_jahr", "alt": {"min": 2, "mid": 4.0, "max": 7, "confidence": "A"}, "neu": {"min": 2, "mid": 4.0, "max": 7, "nachrechnung_mittel": 4.18, "confidence": "B"}, "fundstelle": "Nachrechnung P2-05", "confidence": "B", "primaer_gelesen": true, "begruendung": "Bandbreite bestätigt; je Jahr ±1 je nach PV-Leistungsbasis; nur eigene Rechnung."},
    {"id": "negative_preisstunden", "alt": "A", "neu": "B", "fundstelle": "Nachzählung quellen/raw/P1-05/ec_price_2019..2025.json: identisch; 2025 zusätzlich 588 h mit ≥1 negativem Viertelstundenwert", "confidence": "B", "primaer_gelesen": true, "begruendung": "Exakt bestätigt, aber nur eine Datenquelle; pv magazine/BNetzA nur Suchauszug. A erst nach primärer BNetzA/SMARD-Angabe."},
    {"id": "vsm2025_zusatzbedarf_steuerbar_2035_gw", "alt": "A", "neu": "B", "fundstelle": "BNetzA-Seite Versorgungssicherheitsmonitoring (raw/P1-05/bnetza_vsm_landing.html)", "confidence": "B", "primaer_gelesen": true, "begruendung": "Werte bestätigt; nur eine Quelle (Urheber)."},
    {"id": "elektrolyse_installiert_gw_2026", "alt": {"value": 0.2, "ewi": "181 MW laut Suche"}, "neu": {"value": 0.2, "ewi_mw_01_2026": 181}, "fundstelle": "EWI PM 20.01.2026, S. 1 (quellen/raw/P2-05/ewi_pm_elektrolyse_20260120.pdf); KfW 04.03.2026 S. 1", "confidence": "A", "primaer_gelesen": true, "begruendung": "Zweite Quelle jetzt primär gelesen; A damit begründet."},
    {"id": "ldes_bedarf_europa_twh", "alt": {"primaer_gelesen": false}, "neu": {"min": 159, "mid": 351, "primaer_gelesen": true}, "fundstelle": "DIW, Kittel: Coping with the Dunkelflaute, Vortrag dena 22.09.2025, Folie 13", "confidence": "B", "primaer_gelesen": true, "begruendung": "Werte im Autorenvortrag bestätigt; '7 % Jahresverbrauch' dort nicht genannt, Paper selbst weiter nicht gelesen."},
    {"id": "df_europa_extrem_1996_97_tage", "alt": {"value": 55, "primaer_gelesen": false}, "neu": {"value": 55, "verfuegbarkeit": "knapp die Hälfte des langjährigen Mittels", "de_insel_1995_96_tage": 109, "de_insel_verfuegbarkeit": "etwa ein Drittel", "primaer_gelesen": true}, "fundstelle": "DIW-Podcast fossilfrei Folge 44, Transkript 00:42:31–00:46:38 (Kittel, Schill)", "confidence": "B", "primaer_gelesen": true, "begruendung": "55 Tage bestätigt; ergänzend fehlende Gegenposition: Deutschland allein 109 Tage."},
    {"id": "agora_speicher_ausspeisung_2045_gw", "alt": {"abgrenzung": "inkl. V2G"}, "neu": {"1h": 538, "24h": 24, "1woche": 3.3, "abgrenzung": "Großspeicher und Heimspeicher (Fußnote *); E-Mobilität getrennt ausgewiesen", "quelle_abbildung": "Agora Energiewende und Prognos (2024)"}, "fundstelle": "Agora KNDE, PDF-S. 55, Abb. 11 mit Fußnote", "confidence": "B", "primaer_gelesen": true, "begruendung": "Werte bestätigt, Abgrenzung im Dossier falsch."},
    {"id": "fa_v3_h2_turbine_kaverne_mrd_eur", "alt": {"min": 38, "mid": 69, "max": 111}, "neu": {"min": 38, "mid": 69, "max": 111, "hinweis": "Kaverne nur für ein 5-Tage-Ereignis (10–15 TWh H2); bei Auslegung auf 80–95 TWh (Agora, INES/DBI) Kavernen ≈ 56 Mrd. €, V3 grob 90–150 Mrd. €; ohne Elektrolyse"}, "fundstelle": "Agora KNDE PDF-S. 29; cleanthinking 06.11.2026 (INES/DBI 18 + 37,6 Mrd. €)", "confidence": "B", "primaer_gelesen": true, "begruendung": "Arithmetik bestätigt; Auslegung unterschätzt den Speicherbedarf gegenüber allen zitierten Studien."},
    {"id": "fa_v4_stromvkg_mrd_eur_pro_jahr", "alt": {"min": 9.4, "mid": 10.9, "max": 11.9}, "neu": {"min": 9.4, "mid": 10.9, "max": 11.9, "bei_hoechstwert_244000": {"min": 14.8, "mid": 17.1, "max": 18.7}, "hinweis": "Zuschlagswerte 129.551–189.970 €/rMW·a bei 5,16 GW; Gebotsvolumen gesamt nur 11,96 GW"}, "fundstelle": "BNetzA, Seite 1. Gebotstermin (bundesnetzagentur.de/1111198); PM 03.11.2026", "confidence": "B", "primaer_gelesen": true, "begruendung": "Übertragung eines 5-GW-Auktionspreises auf 61–77 GW unbelegt; Obergrenze ergänzen."},
    {"id": "df_5d_luecke_ziel2030_twh", "alt": {"min": 4.82, "mid": 5.71, "max": 6.96}, "neu": {"min": 4.82, "mid": 5.71, "max": 6.96, "nachrechnung": {"min": 4.87, "mid": 5.73, "max": 6.97}, "sensitivitaet_bestand_2026_11": {"min": 6.30, "mid": 6.83, "max": 7.52}}, "fundstelle": "Nachrechnung P2-05 aus data/profiles_2015..2025.json", "confidence": "B", "primaer_gelesen": true, "begruendung": "Bestätigt (≤ 1 %); Sensitivität zeigt Abhängigkeit von der Ausbauannahme."},
    {"id": "batterie_capex_pvffa_eur_kwh", "alt": {"hinweis": "Differenz zu strommix ungeklärt"}, "neu": {"hinweis": "ISE: PV-gekoppelte Batterie (>1 MWp, 3:2), €/kWh Nutzkapazität inkl. Installation, ohne MwSt., Preisstand 2024; strommix: schlüsselfertiges 4-h-Großsystem Europa 2026 (nicht primär). Differenz = Baujahr, Größe, Dauer, Kapazitätsbegriff; keine Zahl gilt für 120-h-Systeme"}, "fundstelle": "ISE Stromgestehungskosten 2024, Tab. 1, Tab. 2, Tab. 8 und Text S. 12", "confidence": "B", "primaer_gelesen": true, "begruendung": "Abgrenzung klären statt 'ungeklärt'."}
  ]
}
```
