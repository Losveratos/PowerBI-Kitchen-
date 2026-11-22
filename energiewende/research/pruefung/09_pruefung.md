# Gegenprüfung Dossier 09 · Referenzpfade

Prüfbericht P2-09 · Stand 22.11.2026 · Prüfer (Opus), nicht Verfasser des
Dossiers · Auftrag `agents/briefs/P2_gegenpruefung.md` · Regeln
`agents/REGELN.md`

Geprüft: `research/09_referenzpfade.md` (65 Parameter: 8 × A, 47 × B,
10 × C). Neu abgerufene Dateien: `quellen/raw/P2-09/`, Prüfsummen in
`quellen/manifest_P2-09.json`. Nachrechnung:
`scripts/pruefung/p2_09_nachrechnung.py` (eigener Code, Eingangswerte aus
den Primärdokumenten).

---

## 1. Urteil in fünf Zeilen

1. Das Dossier ist bei den R21-Zitaten, den UBA-, BNetzA-, Ariadne- und
   Kommissionszahlen sehr sauber: Jede am Original nachgeschlagene Zahl steht
   dort in der angegebenen Abgrenzung. Alle Eigenrechnungen liegen innerhalb von ±3 %.
2. Die Kernkraft-Reaktivierung ist der schwächste Teil. Die jetzt lesbaren
   Primärquellen (Drs. 21/7609, 21/6126, Landtag BW 18/292) bestätigen den
   Rückbaustand. Sie zeigen aber auch zwei Dinge, die im Dossier fehlen:
   Radiants größte Variante (12 GW für rund 18–19 Mrd. €) und den Abbau des
   Primärkreislaufs in Neckarwestheim II, den EnBW „praktisch irreversibel“ nennt.
3. Ein innerer Widerspruch: Kernaussage 2 nennt für den ersten Neubau-Block
   „2038–2047“, die eigene Tabelle 2.4 ergibt 2040 / 2047 / 2056.
4. Der EU-ETS-Preis „rund 81 €/t“ (20.11.2026) ist nicht bestätigt.
   Sekundärquellen melden für den 12./13.11.2026 Kurse um und über 90 €/t.
5. Gesamturteil: belastbar mit drei Korrekturen und zwei Ergänzungen. Keine
   Kernaussage kippt.

---

## 2. Prüftabelle

Ergebnis: **b** = bestätigt · **a** = abweichend · **n** = nicht prüfbar.
„neu“ = neue Konfidenz / `primaer_gelesen`.

### 2.1 Kernaussagen

| Nr. | Wert im Dossier | geprüfte Fundstelle | Ergebnis | neu |
|---|---|---|---|---|
| KA1 Rückbaustand Konvoi-Trio (RDB „in Einbaulage“, Einbauten werden zerlegt, nicht kernbrennstofffrei) | hib 658/2026 | Drs. 21/7609, S. 3 (Antwort zu Fragen 1–6) | **b**, wortgleich | A / true |
| KA1 Grohnde, Brokdorf weiter zurückgebaut; Gundremmingen C Maschinenhaus abgebaut | hib 658/2026 | Drs. 21/7609, S. 3 f. | **b**; Ergänzung: Grohnde hat am 12.05.2026 die 2. Abbaugenehmigung erhalten (S. 6) | A / true |
| KA1 keine Gespräche, keine Gutachten der Betreiber | hib 658/2026 | Drs. 21/7609, S. 5 (Fragen 12–14) | **b** | A / true |
| KA1 Betreiber lehnen ab | Presse (C) | Landtag BW Drs. 18/292, S. 4 (Stellungnahme UM BW 14.08.2026) | **b** für EnBW: „Wiedereinstieg unrentabel“, Rückbau GKN II „praktisch gesehen irreversibel“ | B / true |
| KA1 Kosten 8,5 Mrd. € (R21/Radiant) | R21 B-3; Radiant via Sekundärquellen | R21 S. B-3 (b); Radiant nur über Drs. 21/7394 (Vorbemerkung in 21/7609, S. 1): **12 GW, ca. 19 Mrd. €**; Drs. 21/6126, S. 4: **12 GW, ca. 18 Mrd. €** | **a** (Radiant-Gesamtzahl fehlt im Dossier; 8,5 Mrd. für 5 Anlagen weiter nur sekundär) | C / false (Radiant) |
| KA1 KernD 1–3 Mrd. € je Anlage, ca. 3 Jahre | via Drs. 21/6126 (C) | Drs. 21/6126, S. 4 | **b** als AfD-Wiedergabe im Ausschussbericht, keine KernD-Originalquelle | C / true (Fundstelle) |
| KA1 BMWE 11,9 Mrd. € | taz (C) | — | **n** (taz.de nicht freigegeben) | C / false |
| KA1 frühestens 2031 | Radiant 41–50 Monate | LT BW 18/292, S. 1: Radiant GKN II **47 Monate, 1,7 Mrd. €** | **b** für GKN II | C→B / true (als Zitat einer Partei-Begründung) |
| KA2 310 Mrd. € / 31 EPR / 49,6 GW / 6.250 €/kW | R21 B-3 | R21 S. B-3; Nachrechnung | **b** (±0 %) | A / true |
| KA2 EPR2 ≈ 7.300 €/kW (€2020) | WNN | Suchtreffer EDF-Pressemitteilung 18.12.2025, WNN, AFP | **b**: 72,8 Mrd. €2020 ohne Finanzierung, Obergrenze; 7.265 €/kW bei 1,67 GW je Block | B / false |
| KA2 „etwa Hälfte von Sizewell C“ | 13.500 €/kW | Rechnung 6.250 / 13.500 = 46 % | **b** (Sizewell-Zahl selbst nicht primär) | B / false |
| KA2 erster Block „2038–2047“ | Kernaussage | Dossier Tab. 2.4: 2040 / 2047 / 2056 | **a**, innerer Widerspruch | — |
| KA3 Darlington: Okt. 2030 und 7,7 Mrd. CAD nicht haltbar | WNN | Suchtreffer WNN, Power Engineering, Canary Media | **b**; Abgrenzung: 7,7 Mrd. CAD umfassen auch gemeinsame Infrastruktur für vier Blöcke (Gesamt 20,9 Mrd. CAD) | B / false |
| KA3 Linglong One im Heißtest | WNN | — | **n** (world-nuclear-news.org nicht freigegeben) | B / false |
| KA4 BGR, BNetzA, Faktor 6, 6–22 % | UBA 2019, BNetzA | UBA CC 21/2019 S. 14 und S. 19 (gedruckt); BNetzA-Rückblick; Nachrechnung | **b** (Abweichung ≤ 3,4 %) | B / true |
| KA5 Transport + Speicherung 100 €/t | UBA-Rahmendaten | Tab. 10, S. 39 | **b** | B / true |
| KA5 Kette 150–300 €/t | Agora/Öko-Institut | — | **n** (oeko.de nicht freigegeben) | B / false |
| KA5 EUA „rund 81 €/t“ Nov. 2026 | ICE via Suchtreffer | Suchtreffer Carbon Pulse 12.11.2026 („EUAs back over €90“), 13.11. (−2,50 €), gmk.center („exceeded €90/t in November“) | **a**: Mitte November rund 88–90 €/t; Wert für 20.11. nicht auffindbar | C / false |
| KA5 Boundary Dam 57 %, Petra Nova 58 % | IEEFA | — | **n** (ieefa.org nicht freigegeben) | B/C / false |
| KA6 Kommissionsvorschlag 01.04.2026: Löschung oberhalb 400 Mio. stoppen | QANDA 26/667 | QANDA 26/667; EK-Seite MSR (Abruf 22.11.2026) | **b** | A / true |
| KA6 Einigung 20.10.2026: Löschung bleibt, Schwelle 700 Mio. | Suchtreffer Rat | consilium.europa.eu: Browser-Prüfung (403). Suchtreffer: Brussels Times, Steelorbis, Carbon Pulse, MLex, gmk.center | **b** über mehrere unabhängige Sekundärquellen; Datum laut Suchtreffern der 20.10. (Pressemitteilung 21.10.) | B / false |
| KA6 § 8 TEHG / Art. 12(4): Löschung der Netto-Minderung | UBA CC 18/2022 Annex B | Annex B, S. 10 und Gesetzeszitat § 8 TEHG | **b**; Einschränkung: Gelöscht wird nur, „soweit diese Menge dem Markt nicht durch die MSR entzogen wird“, und nur bei Stilllegung von Stromerzeugungskapazität | B / true |
| KA7 Cap null ab etwa 2039 | UBA S. 32; R21 F-1 | UBA-Rahmendaten S. 32 (wörtlich); R21 F-1; Nachrechnung mit EK-Cap 2024 | **b**: stationär 2039, inkl. Seeverkehr 2040 | A / true |
| KA7 Vorschlag 17.07.2026: LRF 3,7 % / 1,7 % | EPRS/ICAP | EK-Pressemitteilung IP/26/1596 (primär) | **b**; „2,7 % ohne internationale Gutschriften“ steht dort nicht (n) | B / true |
| KA8 Ariadne 275 (210–405) / ETS 130 (95–210) €/t | Ariadne | Ariadne-Hintergrund 11/2021, Zusammenfassung | **b**; Abgrenzung: EU-weit, Stand 2021 | B / true |
| KA8 UBA CC 44/2025: Wärmepumpe 130–285, E-Fuels Pkw > 400 €/t | UBA | CC 44/2025, S. 11 | **b** | B / true |
| KA9 Klimakosten 345/990 → 485/1.240 €₂₀₂₅/t | UBA | Tabelle 06.07.2026 | **b** | B / true |
| KA10 R21: 40 % (S. 15 f.), 51 % (D-4), 47 % (F-1); 850 (D-5) / 824 Mrd. € (S. 20) | R21 | R21 an allen fünf Stellen | **b** | A / true |
| KA10 40 %/70 % entspricht „wörtlich“ der EK-Aussage −39 %/+71 % (1990–2024) | QANDA 26/667 | QANDA 26/667 | **b** für die EK-Zahl; „wörtlich“ zu stark: R21 schreibt „über 40“ und „70 Prozent“, Zeitraum 2005–2025. Zudem nennt die EK in IP/26/1596 für die ETS-Sektoren **−50 %** seit 2005 | B / true |

### 2.2 Alle Parameter mit Konfidenz A

| Parameter | Wert | Fundstelle | Ergebnis | neu |
|---|---|---|---|---|
| r21_fsb_reakt_kosten_mrd_eur | 8,5 | R21 S. B-3 | **b** | A / true |
| r21_fsb_reakt_leistung_gw | 7 | R21 S. B-2 (Reform-Strommix), B-3 | **b** | A / true |
| r21_fsb_reakt_jahr | 2032 | R21 S. B-3 | **b** | A / true |
| r21_fsb_neubau_kosten_mrd_eur | 310 | R21 S. B-3 | **b** | A / true |
| r21_fsb_neubau_capex_eur_kw | 6.250 | Nachrechnung | **b** (±0 %) | A / true |
| ets1_cap_null_jahr_geltendes_recht | 2039 | UBA S. 32; R21 F-1; Nachrechnung | **b** (stationär 2039; inkl. Seeverkehr 2040) | A / true |
| r21_ets_minderung_seit_2005_pct | 40 / 51 / 47 | R21 S. 15 f., D-4, F-1 | **b** | A / true |
| r21_zew_ersparnis_mrd_eur | 850 / 824 | R21 D-5, S. 20 | **b** | A / true |

### 2.3 Stichprobe Konfidenz B

47 B-Parameter, alphabetisch sortiert, k = 47 // 10 = 4, Positionen
0, 4, 8, …, 36:

| Parameter | Wert | Fundstelle | Ergebnis | neu |
|---|---|---|---|---|
| bgr_schiefergas_mrd_m3 | 320–2.030 | bgr.bund.de antwortet mit HTTP 400. Suchtreffer-Text der BGR-Pressemitteilung 18.01.2016 | **b** (nur Suchtreffer); Original **n** | B / false |
| ccs_speicherprojekt_vorlauf_jahre | 6–13 | — | **n** (oeko.de nicht freigegeben) | B / false |
| co2preis_paritaet_waermepumpe_eur_t | 130–285 | UBA CC 44/2025, S. 11 | **b** | B / true |
| ef_erdgas_t_tj | 55,8 | UBA CC 28/2022, Tab. 23, Wert 2020 | **b** | B / true |
| epr2_kosten_mrd_eur2020 | 72,8 | Suchtreffer EDF-PM, WNN, AFP | **b**; Ergänzung: zu heutigen Preisen ca. 85 Mrd. €, mit Finanzierung laut Cour des comptes > 100 Mrd. € | B / false |
| eu_thg_1990_2024_pct | −39 | QANDA 26/667 | **b** | B / true |
| gas_import_de_2025_twh | 1.031 | BNetzA-Rückblick 2025 | **b** (vorläufig; Exporte 221 TWh) | B / true |
| kkw_netto_gruppeA_mw | 6.825 | Summe b; Einzelwerte laut WNA-Suchtreffer b | **b** (Summe). Zusammensetzung „Gruppe A“ **n**: Drs. 21/6126 nennt für Priorität A „unter anderem Brokdorf, Emsland, Neckarwestheim II und Isar 2“, Grohnde nicht ausdrücklich | B / false |
| lng_import_de_2025_twh | 106 | BNetzA-Rückblick 2025 | **b** (10,3 % der Importe; 96 % USA laut BDEW) | B / true |
| preis_erdgas_eur2023_mwh | 42/21/19/18/17 | UBA-Rahmendaten Tab. 6, S. 22 | **b** | B / true |

### 2.4 Schwerpunkte laut Auftrag

| Schwerpunkt | Ergebnis |
|---|---|
| Antwort der Bundesregierung zum Rückbau (dserver) | Drs. 21/7609 gelesen: hib-Zusammenfassung stimmt. Neu: Genehmigungstabelle (S. 6), Hinweis auf fehlende internationale Präzedenz (S. 9), AtG-Änderung nötig (S. 10). Drs. 21/6126 gelesen: KernD- und Radiant-Zahlen (als AfD-Vortrag), Ablehnung des Expertenkommissions-Antrags am 20.05.2026 |
| Radiant-Gutachten (Landtag BW) | Drs. 18/292 gelesen. Sie enthält nicht das Gutachten, sondern dessen Wiedergabe durch die AfD: GKN II 1,7 Mrd. € / 47 Monate / 42 bzw. 38 €/MWh; KKP 2 4,4 Mrd. € / 63 Monate / 66 bzw. 55 €/MWh. Dazu die Stellungnahme des Umweltministeriums. Radiant-Original: Host nicht freigegeben |
| BGR-Schiefergas-Studie | **n**: bgr.bund.de antwortet mit HTTP 400 (nicht umgangen). Wert nur über Suchtreffer bestätigt |
| Einigung Rat/EP zur Löschung | **n** am Original (Browser-Prüfung auf consilium.europa.eu). Über fünf unabhängige Sekundärquellen bestätigt |
| COM(2026) 616 | **n** am Original (EUR-Lex und EK-Download liefern HTTP 202 ohne Inhalt). LRF-Werte und Datum über EK-Pressemitteilung IP/26/1596 primär bestätigt; die Nummer 616 nur über EPRS |
| Ende der Zertifikatsausgabe um 2039 | bestätigt (UBA wörtlich; Nachrechnung) |
| EPR2-Kosten | bestätigt über Suchtreffer (edf.fr nicht freigegeben) |

---

## 3. Abweichungen im Detail (nach Gewicht)

1. **Reaktivierung, mid 4,1 GW, ist optimistischer, als die Primärquellen
   hergeben (KA1, `kkw_reakt_leistung_gw`).** Der mid-Wert setzt alle drei
   Konvoi-Anlagen als reaktivierbar an, „weil der RDB in Einbaulage ist“. Das
   Umweltministerium BW schreibt am 14.08.2026 (Drs. 18/292, S. 4): In GKN II
   sei „der Abbau zentraler Komponenten des Primärkreislaufs wie der
   Hauptkühlmittelleitungen und der Hauptkühlmittelpumpen in vollem Gange“.
   EnBW halte den Rückbaustatus „praktisch gesehen [für] irreversibel“. Die
   Bundesregierung kennt kein Kernkraftwerk, das nach Beginn der Stilllegung
   wieder in den Leistungsbetrieb gegangen ist (Drs. 21/7609, S. 9). Für
   einen Stopp müsste das AtG geändert werden (S. 10).
   *Folge:* Der mid-Wert sollte als Obergrenze unter günstigen Annahmen
   gekennzeichnet werden. Vorschlag: mid 2,7 GW (Isar 2 + Emsland), Begründung
   in `korrekturen`. Das ist eine Setzung (M) des Prüfers.
2. **Die stärkste Pro-Reaktivierungszahl fehlt (KA1, Gegenpositionen).**
   Radiant beziffert laut Drs. 21/7394 und 21/6126 insgesamt **rund 12 GW
   netto für 18–19 Mrd. €** (LCOE 33–46 €/MWh bei 7,38 % WACC). Das sind etwa
   1,5–1,6 Mrd. €/GW. Damit liegt R21s 8,5 Mrd. € für 7 GW (1,2 Mrd. €/GW)
   unter Radiants eigenem Durchschnitt. Das Dossier nennt nur 8,5 Mrd. für fünf
   Anlagen und 14 Mrd. für sechs Anlagen, beides aus Partei- und
   Meinungsmedien.
3. **Innerer Widerspruch beim ersten Neubau-Block (KA2).** Kernaussage:
   „2038–2047“. Tabelle 2.4 und Parameter `neubau_de_erster_block_jahr`:
   2040 / 2047 / 2056. Die 2038 tauchen sonst nur bei Penly 1 (EPR2) auf.
4. **EUA-Preis Nov. 2026 (`eua_preis_nov2026_eur_t` = 81).** Suchtreffer für
   den 12./13.11.2026 nennen Kurse um 88–90 €/t. Einen Settlement-Wert für
   den 20.11. fand ich nicht. ABN AMRO nennt für Sept./Okt. rund 88 €/t. Das
   Dossier liegt damit wohl 8–10 % zu tief, und das Gefälle „CCS teurer als
   CO₂-Preis“ wirkt dadurch etwas größer. Die Kernaussage 5 bleibt richtig
   (150–300 €/t gegen rund 90 €/t). Konfidenz auf C senken, bis eine
   ICE- oder EEX-Notierung vorliegt.
5. **EPR2-Vergleich, Preisbasis (KA2).** Das Dossier stellt R21s 6.250 €/kW
   (Preisbasis offen, vermutlich nominal 2026) der EPR2-Zahl in €2020 gegenüber.
   Zu heutigen Preisen sind es etwa 85 Mrd. € bzw. 8.500 €/kW, mit Finanzierung
   laut Cour des comptes über 100 Mrd. € bzw. über 10.000 €/kW. Die Aussage
   „R21 billiger als jedes westliche Projekt“ wird dadurch stärker, nicht
   schwächer. Der Abstand ist im Dossier also eher untertrieben.
6. **„Wörtlich“ in KA10.** Die Nähe von R21 „über 40 % / 70 %“ zur
   EK-Aussage „−39 % / +71 %, 1990–2024“ ist auffällig, aber nicht wörtlich.
   Die R21-Fundstelle (von der Leyen) ist nicht belegt. Wichtiger: Die
   Kommission nennt selbst **−50 % in den ETS-Sektoren** seit 2005
   (IP/26/1596). R21s 51 % (D-4) ist damit gedeckt; Ausreißer sind die 40 %.
7. **Gundremmingen (Tab. 1.2).** Das Dossier ordnet „dritte und letzte
   Abbaugenehmigung Mai 2024“ Gundremmingen C zu. Drs. 21/7609, S. 6 führt
   den 28.05.2024 (3. AG) unter „Gundremmingen B, KBR II B“. Möglicherweise
   gilt die Genehmigung für die Doppelanlage KRB II. Die Zuordnung sollte
   neutral als „KRB II“ formuliert werden.
8. **Darlington-Budget (KA3).** Die 7,7 Mrd. CAD enthalten auch die
   gemeinsame Infrastruktur aller vier Blöcke (Gesamtbudget 20,9 Mrd. CAD). Die
   Abgrenzung fehlt in `note`.
9. **§ 8 TEHG (KA6, 6.1 b).** Gelöscht wird nur die Netto-Minderung abzüglich
   dessen, was die MSR ohnehin aufnimmt, und nur bei Stilllegung von
   Stromerzeugungskapazität. Für EE-Ausbau ohne Stilllegung greift § 8 TEHG
   nicht. Die Formulierung „dann ist die Maßnahme im EU-Saldo wirksam“ gilt
   also nur für den Kohleausstieg.
10. **Kleinere Fundstellen:** UBA-Aussage „Marktakteure erwarten keine
    vollständige Verknappung ab 2039“ steht auf S. 33, nicht S. 34. Die
    Kommissions-Seite zur MSR nennt am 22.11.2026 noch den Vorschlag vom
    1.4.2026 als Stand; die Einigung ist dort nicht eingetragen.

---

## 4. Nachrechnungen

Code: `scripts/pruefung/p2_09_nachrechnung.py`, Aufruf mit `python3 -I`.

| Rechnung (Dossier) | Dossier | Prüfer | Abw. |
|---|---|---|---|
| 31 × 1,6 GW; 310 Mrd. / 49,6 GW | 49,6 GW; 6.250 €/kW | 49,6; 6.250 | 0 % |
| Netto-MW Konvoi-Trio / Gruppe A / + KRB C | 4.055 / 6.825 / 8.113 | gleich | 0 % |
| t CO₂/MWh_el Gas-GuD 58 % / GT 40 % / SK 45 % / BK Rh. / BK Lau. 40 % | 0,35 / 0,50 / 0,75 / 1,02 / 0,99 | 0,346 / 0,502 / 0,749 / 1,020 / 0,992 | ≤ 1 % |
| 6,8 GW × 8.000 h | 55 TWh; 19 / 56 Mt | 54,4 TWh; 19,0 / 54,4 Mt | −1,1 % / +0,2 % / **−2,9 %** |
| 4,1 GW × 8.000 h | 32 TWh; 11 / 33 Mt | 32,8 TWh; 11,5 / 32,8 Mt | +2,5 % / +4,4 % / −0,6 % |
| Hinweis: Rechenbeispiel nutzt 8.000 h, Parameter-mid ist 7.800 h | — | 6,8 GW × 7.800 h = 53,0 TWh | −2,5 % gegen 54,4 |
| Faktor Vorkette US-LNG / Norwegen | 6,2 | 6,20 | 0 % |
| Schiefergas gegen US-LNG (Vollkette) | 6–22 % weniger | 5,8–21,5 % | ≤ 3,4 % |
| Schiefergas gegen Norwegen | 5–26 % mehr | 4,5–25,5 % | ≤ 10 % relativ, 0,5 Prozentpunkte |
| Mengenbeispiel 200 TWh | −5,6 bis +3,3 Mt/a | −5,61 bis +3,39 Mt/a | +2,6 % am oberen Rand |
| Plateau 200 TWh / Verbrauch 864 / Förderung 34 | 23 %; ≈ 6-fach | 23,1 %; 5,9-fach | ≤ 2 % |
| CCS Gas: abgeschieden; Mehrkosten | 0,36 t; 54–108 €/MWh | 0,362; 54,3–108,7 | +0,6 % |
| CCS Braunkohle: abgeschieden; Mehrkosten | 1,15 t; 170–345 €/MWh | **1,125**; 169–338 | **−2,2 %** (1,0 × 1,25 × 0,9 = 1,125) |
| Rest bei 57 % Gas / BK | 0,17 / 0,55 t | 0,173 / 0,537 | ±2,3 % |
| Erster Block 2027 + Vorlauf + Bau | 2040 / 2047 / 2056 | gleich | 0 |
| EPR2 €/kW | ≈ 7.300–7.600 | 7.265 (1,67 GW netto) / 7.583 (1,6 GW) | −0,5 % / +3,9 % |
| ETS-1-Cap = 0 (Cap 2024 1.386,05 Mio. laut EK; −84 Mio./a bis 2027, −86 Mio./a ab 2028 laut UBA; Rebasing −27 Mio. 2026) | 2039 | stationär + Seeverkehr: 2039 noch 75 Mio., null ab **2040**; ohne Seeverkehr null ab **2039** | +1 Jahr im weiten Umfang |

Zusatzrechnung zur Abgrenzung (KA5): Bei Gas-GuD mit CCS werden 0,362 t je
MWh abgeschieden, vermieden aber nur 0,310 t, weil der Mehrverbrauch
zusätzlich emittiert. Aus 150–300 €/t **abgeschiedenes** CO₂ werden
175–351 €/t **vermiedenes** CO₂. Der Vergleich mit dem CO₂-Preis müsste
streng genommen die vermiedene Tonne nehmen; das stützt die Kernaussage.

Gesamt: Keine Eigenrechnung weicht um mehr als 4,4 % ab. Die größten
Abweichungen sind Rundungen und der Faktor 1,15 statt 1,125 bei
Braunkohle-CCS.

---

## 5. Einseitigkeit und fehlende Gegenpositionen

**Zugunsten des R21-Pfads (das Dossier ist hier zu freundlich):**

- Reaktivierung mid 4,1 GW: siehe Abweichung 1. EnBW, Landesregierung BW
  und Bundesregierung sprechen gegen GKN II. Die fehlende internationale
  Präzedenz einer Wiederinbetriebnahme aus der Stilllegung fehlt im Dossier.
- Kostenspanne 8,5–15 Mrd. € ohne Finanzierung, Erstkern, Nachrüstung auf
  heutigen Stand (die SPD verweist in Drs. 21/6126 auf seit 14 Jahren
  ausgebliebene Periodische Sicherheitsüberprüfungen) und Personal. Das
  Dossier nennt die Lücke, gewichtet sie aber nicht.

**Zulasten des R21-Pfads oder der Preis-Instrumente:**

- KA8 betont E-Fuels (über 400 €/t). Dieselbe UBA-Studie (CC 44/2025,
  S. 11) zeigt aber auch: Batterie-Pkw sind bei 1,80 €/l Benzin und
  36 ct/kWh „auch ohne CO₂-Preis“ wirtschaftlich, Batterie-Lkw mit
  CO₂-Maut teils ebenfalls, und im Gebäudesektor reicht „ein niedriger
  dreistelliger CO₂-Preis“. „Müsste dreistellig werden“ stimmt, aber
  E-Fuels sind nicht der maßgebliche Pfad. Ariadne (2021) ist EU-weit und
  stammt aus der Zeit vor der Energiekrise.
- Erdgaspreis max 85 €/MWh „Krisenniveau als Dauerzustand“ ist eine harte
  Annahme gegen den fossilen Pfad. Der UBA-Pfad (21 €/MWh 2030) ist
  aus der Zeit vor der Krise. Das Dossier nennt beides offen, aber ein
  Terminmarktwert (TTF-Kalenderjahre 2028–2030) fehlt als neutraler
  Anker.
- CCS: Die Referenzanlagen sind nachgerüstete Kohlekraftwerke aus den Jahren
  2014–2017. Für neue Gas-CCS-Projekte geben Planer höhere Abscheideraten an.
  Diese Gegenposition fehlt; das Dossier stützt sich nur auf Kohle-Erfahrung
  (57/58 %).
- Schiefergas: Die Vollkettenrechnung ist fair. Sie nimmt den ganzen
  UBA-Bereich (6,5–19 g/MJ). UBA nennt für unkonventionelles Gas aus USA, UK
  und Australien rund 12 g/MJ (S. 11). Mit diesem Mittelwert ergeben sich
  rund 15 % Einsparung gegen US-LNG. Diese Zahl wäre als mid zu nennen.

**Ausgewogen:** Wasserbett-Abschnitt (beide Literaturseiten, R21-Fehler und
R21-Berechtigtes), Klimakosten, Emissionsfaktoren.

---

## 6. Weiterhin nicht erreichbar

| Host | Dokument | Grund |
|---|---|---|
| www.bgr.bund.de | Pressemitteilung 18.01.2016; Abschlussbericht Schieferöl/Schiefergas 2016 | HTTP 400 auf jeden Abruf; nicht umgangen |
| www.consilium.europa.eu | Pressemitteilung 21.10.2026 MSR-Einigung | HTTP 403, Browser-Prüfung; nicht umgangen |
| eur-lex.europa.eu | COM(2026) 616 (PDF) | HTTP 202 ohne Inhalt (2 Versuche) |
| climate.ec.europa.eu (Download) | ETS-Richtlinienvorschlag 07/2026 mit Anhängen | HTTP 202 ohne Inhalt (2 Versuche); HTML-Seiten waren lesbar |
| radiantenergygroup.com | Radiant-Gutachten Juni 2026 | Host nicht freigegeben, nicht versucht |
| taz.de, www.oeko.de, ieefa.org, www.opg.com, world-nuclear-news.org, www.edf.fr, www.ice.com, pris.iaea.org | BMWE-Zahl, CCS-Kette, Boundary Dam, Darlington, Linglong, EPR2, EUA-Settlement, Nettoleistungen | Hosts nicht freigegeben; Werte nur über Suchtreffer |

---

## 7. Korrekturen

```json
{
  "dossier": "09_referenzpfade",
  "pruefung": "P2-09",
  "stand": "2026-11-22",
  "korrekturen": [
    {"id": "kernaussage_2_erster_block", "alt": "erster deutscher Neubau-Block bei Entscheidung 2027 realistisch bei 2038–2047", "neu": "2040–2047 (max 2056), wie Tabelle 2.4", "fundstelle": "Dossier Abschn. 2.4 und Parameter neubau_de_erster_block_jahr", "confidence": "B", "primaer_gelesen": true, "begruendung": "innerer Widerspruch; 2038 ist das Penly-1-Datum des EPR2-Programms"},
    {"id": "kkw_reakt_leistung_gw", "alt": {"min": 0, "mid": 4.1, "max": 6.8}, "neu": {"min": 0, "mid": 2.7, "max": 6.8}, "fundstelle": "Landtag BW Drs. 18/292, S. 4 (Stellungnahme UM BW 14.08.2026); Drs. 21/7609, S. 3, 9, 10", "confidence": "B", "primaer_gelesen": true, "begruendung": "Setzung (M) des Prüfers: in GKN II laufender Abbau von Hauptkühlmittelleitungen und -pumpen, EnBW nennt Rückbau 'praktisch irreversibel'; mid nur Isar 2 + Emsland (1.410 + 1.335 MW). Alternativ mid 4,1 belassen, aber als günstigen Fall kennzeichnen"},
    {"id": "radiant_gesamt_neu", "alt": null, "neu": {"leistung_gw_netto": 12, "kosten_mrd_eur": {"min": 18, "max": 19}, "lcoe_eur_mwh": {"min": 33, "max": 46}, "wacc_pct": 7.38}, "fundstelle": "Drs. 21/7609 S. 1 (Vorbemerkung der Fragesteller, Drs. 21/7394); Drs. 21/6126 S. 4", "confidence": "C", "primaer_gelesen": true, "begruendung": "stärkste Pro-Position fehlt; Zahlen sind Wiedergabe der AfD-Fraktion, nicht Radiant-Original"},
    {"id": "radiant_gkn2_neu", "alt": "Neckarwestheim 2: Radiant 1,7 Mrd. €, 47 Monate (C, über Landtag BW)", "neu": {"kosten_mrd_eur": 1.7, "monate": 47, "lcoe_eur_mwh": {"wacc_7_38": 42, "wacc_4_25": 38}, "kkp2_kosten_mrd_eur": 4.4, "kkp2_monate": 63}, "fundstelle": "Landtag BW Drs. 18/292, S. 1 f. (Begründung des AfD-Antrags)", "confidence": "C", "primaer_gelesen": true, "begruendung": "Fundstelle jetzt gelesen; Inhalt bleibt Parteiwiedergabe eines Befürworter-Gutachtens"},
    {"id": "kernd_reakt_kosten", "alt": "KernD laut Drs. 21/6126, C", "neu": "1–3 Mrd. € je Anlage, ca. 3 Jahre (Vortrag der AfD-Fraktion im Ausschuss)", "fundstelle": "Drs. 21/6126, S. 4", "confidence": "C", "primaer_gelesen": true, "begruendung": "Fundstelle bestätigt, aber nur als Wiedergabe; Ausschuss lehnte Antrag 21/5479 am 20.05.2026 ab"},
    {"id": "eua_preis_nov2026_eur_t", "alt": 81, "neu": {"min": 81, "mid": 88, "max": 91}, "fundstelle": "Suchtreffer Carbon Pulse 12./13.11.2026, gmk.center 11/2026, ABN AMRO (Sept./Okt. ~88)", "confidence": "C", "primaer_gelesen": false, "begruendung": "Sekundärquellen melden Mitte November über 90 €/t; 20.11.-Settlement nicht auffindbar"},
    {"id": "ets1_cap_null_jahr_geltendes_recht", "alt": 2039, "neu": 2039, "fundstelle": "UBA-Rahmendaten 2025 S. 32; EK-Seite ETS-Cap (Cap 2024 = 1.386.051.745); Nachrechnung p2_09_nachrechnung.py", "confidence": "A", "primaer_gelesen": true, "begruendung": "bestätigt; note ergänzen: inkl. Seeverkehr erst 2040 null (2039 noch ca. 75 Mio.)"},
    {"id": "ets1_lrf_vorschlag_pct", "alt": "B, primaer_gelesen false (EPRS/ICAP)", "neu": {"2031_2035": 3.7, "2036_2040": 1.7}, "fundstelle": "EK-Pressemitteilung IP/26/1596 vom 17.07.2026", "confidence": "B", "primaer_gelesen": true, "begruendung": "LRF und Datum primär bestätigt; '2,7 % ohne internationale Gutschriften' dort nicht genannt (bis zu 2 % Gutschriften)"},
    {"id": "darlington_smr1_budget_mrd_cad", "alt": "note: wird überschritten", "neu": "note ergänzen: 7,7 Mrd. CAD schließen gemeinsame Infrastruktur für vier Blöcke ein; Gesamtbudget 20,9 Mrd. CAD", "fundstelle": "Suchtreffer WNN, Power Engineering, Canary Media", "confidence": "B", "primaer_gelesen": false, "begruendung": "Abgrenzung fehlt"},
    {"id": "ccs_mehrkosten_braunkohle_eur_mwh", "alt": {"min": 170, "max": 345}, "neu": {"min": 169, "max": 338}, "fundstelle": "Nachrechnung: 1,0 t/MWh × 1,25 × 0,90 = 1,125 t", "confidence": "C", "primaer_gelesen": false, "begruendung": "Rechenfehler 1,15 statt 1,125 t/MWh"},
    {"id": "epr2_kosten_mrd_eur2020", "alt": 72.8, "neu": 72.8, "fundstelle": "EDF-PM 18.12.2025 laut Suchtreffer; AFP/connaissancedesenergies", "confidence": "B", "primaer_gelesen": false, "begruendung": "bestätigt; note ergänzen: Obergrenze, zu heutigen Preisen ca. 85 Mrd. €, mit Finanzierung > 100 Mrd. € (Cour des comptes) → ca. 8.500 bzw. > 10.000 €/kW"},
    {"id": "r21_ets_minderung_seit_2005_pct", "alt": "S. 15 entspricht 'wörtlich' Kommissionsaussage", "neu": "S. 15 ähnelt der Kommissionsaussage −39 %/+71 % (1990–2024); Kommission nennt für ETS-Sektoren −50 % seit 2005 (IP/26/1596)", "fundstelle": "QANDA/26/667; IP/26/1596", "confidence": "A", "primaer_gelesen": true, "begruendung": "'wörtlich' zu stark; R21s 51 % (D-4) ist durch die Kommission gedeckt"},
    {"id": "gundremmingen_abbaugenehmigung", "alt": "Gundremmingen C: dritte und letzte Abbaugenehmigung Mai 2024", "neu": "KRB II (Bundesregierung führt sie unter Gundremmingen B): 3. AG vom 28.05.2024", "fundstelle": "Drs. 21/7609, S. 6", "confidence": "B", "primaer_gelesen": true, "begruendung": "Zuordnung zum Block C in der Primärquelle nicht so ausgewiesen"},
    {"id": "grohnde_status", "alt": "wie Brokdorf", "neu": "wie Brokdorf; zusätzlich 2. Abbaugenehmigung am 12.05.2026", "fundstelle": "Drs. 21/7609, S. 6", "confidence": "A", "primaer_gelesen": true, "begruendung": "fortgeschrittener als Brokdorf; schwächt Grohnde als Teil der max-Variante"},
    {"id": "kkw_reakt_bundesregierung_gespraeche", "alt": "B, hib", "neu": 0, "fundstelle": "Drs. 21/7609, S. 5 (Fragen 12–14)", "confidence": "A", "primaer_gelesen": true, "begruendung": "Originaldrucksache gelesen; zusätzlich: keine Wiederinbetriebnahme aus der Stilllegung weltweit bekannt (S. 9)"},
    {"id": "msr_loeschschwelle_mio", "alt": {"bisher": 400, "einigung_okt_2026": 700}, "neu": {"bisher": 400, "einigung_okt_2026": 700}, "fundstelle": "Suchtreffer Brussels Times, Steelorbis, Carbon Pulse, MLex, gmk.center; EK-Seite MSR (Vorschlag 01.04.2026, primär)", "confidence": "B", "primaer_gelesen": false, "begruendung": "bestätigt über mehrere unabhängige Sekundärquellen; Original auf consilium.europa.eu hinter Browser-Prüfung; Datum der Einigung 20.10., Pressemitteilung 21.10."},
    {"id": "schiefergas_vs_uslng_einsparung_vollkette_pct", "alt": {"min": 6, "max": 22}, "neu": {"min": 6, "mid": 15, "max": 22}, "fundstelle": "UBA CC 21/2019 S. 11 (ca. 12 g/MJ für unkonventionelles Gas USA/UK/AUS), S. 14, S. 19; Nachrechnung", "confidence": "B", "primaer_gelesen": true, "begruendung": "mid ergänzt; min/max bestätigt"}
  ]
}
```
