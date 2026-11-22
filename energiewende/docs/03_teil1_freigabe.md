# Freigabeliste Teil 1 · „Die 13,8 Billionen“

Stand 22.11.2026 · Phase 3 · Auftrag P3-B (`agents/briefs/P3-B_teil1_freigabe.md`) ·
geschrieben von einem Agenten (Opus), der an Dossiers und Prüfberichten nicht beteiligt war ·
Regeln: `agents/REGELN.md`, `TRANSPARENZ.md` · Vorbild: `strommix/research/story_claims_check.md`.

**Zweck.** Teil 1 erzählt, woher die Schlagzeilen-Zahl kommt, was sie misst und was der
Vergleichspfad kostet. Auf die Seite kommt **nur, was in dieser Liste freigegeben ist**,
und nur in der hier festgelegten Form. Die maschinenlesbare Fassung steht am Ende im
Block `teil1_data`. Wer eine Zahl ändern will, ändert sie zuerst hier (und im Dossier).

**Material.** `research/00_aufhaenger_r21.md`, Dossiers 01, 02, 05, 07, 09, 10 und ihre
Prüfberichte unter `research/pruefung/`. Wo Dossier und Prüfbericht sich widersprechen,
gilt der Prüfbericht. Dazu die Tabelle „Entscheidungen“ im `README.md`.

**Selbst am Original nachgeschlagen** (Dateien unter `quellen/raw/`, Prüfsummen in den
dortigen Manifesten): R21-Erklärung (Text Z. 76–86, 158–166, 276–305, 330–341, 585–628),
WD 5 – 3000 – 135/24 (alle sechs Seiten), WD 5 – 3000 – 151/24 (PDF-S. 14), DIW
Wochenbericht 38+39/2025 (S. 618 mit Fn. 30–31), DIHK/Frontier „Plan B“ (Vorwort, S. 8,
S. 27 mit Abb. 8, S. 12, S. 27–28), KfW/Prognos 2026 (Zusammenfassung, S. 14) und
KfW-Focus 561, KfW-Fokus 350 (2021), Agora 2024 (S. 11–12), Ariadne-Zusammenfassung 2025
(S. 6, 8), Fraunhofer ISE 2021 (S. 8) und 2024 (S. 6, 82), BT-Drs. 20/10585
(Bundesrechnungshof) und 21/903 (Bundesregierung), NEP 2037/2045 (2025, kompakt,
S. 11–12), Eurostat `nama_10_gdp` (BIP 2019, 2024, 2025), Kommissionsseite zum EU-ETS
(04.04.2025), ZEW-Pressemitteilung zu Rausch 2026. Für Dossier 05, 07, 09 und 10 stütze
ich mich auf die Nachrechnungen der Prüfer (eigener Code, Abweichung ≤ 1 % bzw. ≤ 0,1
Prozentpunkte); deren Fundstellen habe ich nicht alle erneut geöffnet — das steht je
Zeile in der Spalte „primär“. Kein neuer Abruf, deshalb kein eigenes Manifest.

## 0. Lesehilfe

| Status | Bedeutung für die Seite |
|---|---|
| **bestätigt** | am Original gelesen, Fundstelle angegeben; darf so erzählt werden |
| **korrigiert** | alter Wert (Dossier, Erstbefund oder R21) ist falsch oder schief; nur der neue Wert darf auf die Seite |
| **verworfen** | darf auf der Seite nicht vorkommen, weder als Zahl noch als Formulierung |
| **Setzung (M)** | eigene Annahme oder eigene Rechnung auf Annahmen; nur als „unsere Annahme“ / „unsere Rechnung“ erzählen |
| **nicht prüfbar** | Original nicht gelesen; nur mit dem hier festgelegten Vorbehalt im selben Satz |

Konfidenz A / B / C wie in `TRANSPARENZ.md`. „primär“ = `primaer_gelesen`.
BIP-Bezug für alle Anteile auf der Seite: **BIP 2024 nominal, 4.386,94 Mrd. €**
(Eurostat `nama_10_gdp`, B1GQ, CP_MEUR) — Setzung (M), weil die Studien mit
unterschiedlichen Preisbasen rechnen (nominal, €2023, €2024). Wo R21 selbst rechnet,
zeigt die Seite zusätzlich das BIP 2025 (4.529,71 Mrd. €), damit R21 mit seiner eigenen
Bezugsgröße gemessen wird.

## 1. Zusammenfassung in Zahlen

| Status | Anzahl Aussagen |
|---|---|
| bestätigt | 57 |
| korrigiert | 17 |
| verworfen | 4 (dazu 11 verworfene Zahlenwerte in `teil1_data.verworfen` und 14 Formulierungen in der Verbotsliste, Abschnitt 7) |
| Setzung (M) | 3 |
| nicht prüfbar | 6 |
| **Summe** | **87** |

Die Zählung gilt für die Zeilen in Abschnitt 2 und ist identisch mit dem Feld `status`
in `teil1_data`.

## 2. Freigabeliste · jede Aussage einzeln

### 2.1 Der Satz in der Schlagzeile und im Papier

| ID | Aussage | Status | Wert | Fundstelle | Konf. · primär |
|---|---|---|---|---|---|
| S01 | BILD titelte am 20.11.2026 „Deutschland wird Energiewende ‚nicht überleben‘“ und stützt sich auf das R21-Papier | nicht prüfbar | – | BILD-Teaser, vom Nutzer übermittelt; bild.de vom Abruf-Werkzeug gesperrt, Artikel hinter BILDplus | C · nein |
| S02 | Das Dokument heißt „Erklärung des Expertenrates Klima- und Energiepolitik“, Herausgeber REPUBLIK21 e. V., November 2026, 59 Seiten; es ist eine Erklärung mit Factsheets, kein Rechenmodell | bestätigt | 59 S. | R21-PDF, Titelblatt; `00_aufhaenger_r21.md` Abschn. 1 | A · ja |
| S03 | Auf den Factsheet-Seiten steht: „Gefördert durch das Presse- und Informationsamt der Bundesregierung aufgrund eines Beschlusses des Deutschen Bundestages.“ | bestätigt | – | R21-Text Z. 309, 581, 767 u. ö. (Fußzeilen) | A · ja |
| S04 | Zusammenfassung (Druckseite 3): Der Wissenschaftliche Dienst „beziffert die Kosten der Energiewende bis 2045 auf 10 bis 13,8 Billionen Euro“; diesen „Wertschöpfungsentzug“ werde die Wirtschaft „nicht überleben“ | bestätigt | 10 / 13,8 Bio. € | R21 Druckseite 3 (Text Z. 83–86) | A · ja |
| S05 | Kapitel 3 (Druckseite 12 = PDF-Seite 17): Der WD „kommt auf Investitionskosten von 10 bis 13,8 Billionen Euro“, Fußnote 5 nennt WD 5 – 3000 – 135/24 vom 16.09.2024 | bestätigt | 10 / 13,8 Bio. € | R21 Druckseite 12 (Text Z. 595–600), Fn. 5 (Z. 626–628) | A · ja |
| S06 | R21: Das entspreche „dem Zwei- bis Dreifachen der jährlichen Wirtschaftsleistung“ — die Rechnung geht auf | bestätigt | 2,2- bis 3,0-fach (BIP 2025) | R21 Druckseite 12; Eurostat `nama_10_gdp` 2025 = 4.529,71 Mrd. € | A · ja |
| S07 | Fußnote 5 ist die einzige externe Fundstelle des Haupttexts; von 39 Zahlen im Haupttext haben 4 eine Fundstelle, 27 keine Quelle | bestätigt | 4 / 39 | Dossier 01, Abschn. 3.1 und Zählung; Prüfbericht 01, K1 (unabhängig nachgezählt) | A · ja |
| S08 | R21 behandelt die Summe als „Entzug von Wertschöpfung“, also als reinen Verlust, nicht als Investition mit Gegenwert, und zieht nicht ab, was ein anderes Energiesystem im selben Zeitraum kosten würde | bestätigt | – | R21 Druckseite 3 und 12 (Wortlaut) | A · ja |

### 2.2 Die Fußnote: was in der Kurzinformation steht

| ID | Aussage | Status | Wert | Fundstelle | Konf. · primär |
|---|---|---|---|---|---|
| F01 | Die Kurzinformation schreibt: „Je nach Betrachtungszeitraum werden die Kosten auf Beträge zwischen 500 Milliarden Euro pro Jahr oder 13,3 Billionen Euro insgesamt bis zum Jahr 2045 beziffert.“ | bestätigt | 500 Mrd. €/a; 13,3 Bio. € | WD 5 – 3000 – 135/24, S. 2 | A · ja |
| F02 | Die Zahl 13,8 kommt in der Kurzinformation nicht vor | bestätigt | – | WD 135/24, Volltext aller sechs Seiten | A · ja |
| F03 | Eine Spanne „10 bis 13,8“ steht dort nicht; genannt sind zwei Einzelwerte aus zwei Quellen mit verschiedenem Zeitbezug (pro Jahr / insgesamt) | bestätigt | – | WD 135/24, S. 2, Fn. 5 und 6 | A · ja |
| F04 | Die Kurzinformation rechnet nicht selbst, sie referiert fremde Studien; sie schreibt, die Bundesregierung erstelle „keine (eigene) Gesamtkostenrechnung“, und die Studien seien „hinsichtlich der Kostenbestandteile nicht immer transparent“ | bestätigt | – | WD 135/24, S. 1 und S. 4 | A · ja |
| F05 | Die Kurzinformation referiert den 8. Monitoring-Bericht: Eine vollständige Kostenbetrachtung sei nur im Vergleich mit einem Energiesystem ohne Energiewende möglich, „da auch bei Fortführung einer Energieversorgung ohne Energiewende Investitionen erforderlich wären“ | bestätigt | – | WD 135/24, S. 5, Fn. 20 | A · ja |
| F06 | Erstbefund: Die Kurzinformation „verlangt ausdrücklich“ den Vergleich | korrigiert | alt „verlangt“ → neu „referiert“ | WD 135/24, S. 5 („weist darauf hin“); Dossier 01, Q11 | A · ja |
| F07 | Die Untergrenze „10 Billionen“ ergäbe sich aus 500 Mrd. € × 20 Jahre; im R21-Papier steht keine Herleitung | Setzung (M) | 10 Bio. € | eigene Vermutung; R21 Druckseite 12 ohne Rechenweg | M · – |
| F08 | Die Kurzinformation trägt im Titel „Investitionskosten“ und nennt die 13,3 Billionen im Text „Kosten“ | bestätigt | – | WD 135/24, Titel und S. 2 | A · ja |
| F09 | R21 schreibt, der Monitoring-Bericht der Bundesregierung enthalte zu Kosten „nichts“; die Bundesregierung selbst legt keine eigene Kostenzahl vor | bestätigt | – | R21 Druckseite 12 (Z. 591–594); WD 135/24 S. 1; BT-Drs. 21/903, S. 2 („keine eigenen Abschätzungen“) | A · ja |
| F10 | Dossier 01: „R21 widerspricht beim Monitoring-Bericht seiner eigenen Quelle (WD S. 1)“ | verworfen | – | Prüfbericht 01, Abschn. 3.3: WD S. 1 betrifft den Bericht der Expertenkommission, nicht den der Bundesregierung | B · ja |

### 2.3 Die Quelle der Quelle: PwC und der FAZ-Gastbeitrag

| ID | Aussage | Status | Wert | Fundstelle | Konf. · primär |
|---|---|---|---|---|---|
| Q01 | Die 13,3 Billionen führt die Kurzinformation auf PwC (2024) zurück, „S. 4 (abrufbar nach Registrierung)“ | bestätigt | 13,3 Bio. € | WD 135/24, Fn. 6 | A · ja |
| Q02 | Die PwC-Studie heißt „Beschleunigte Investitionen in den Klimaschutz lohnen sich – jetzt auch ökonomisch!“ | bestätigt | – | WD 135/24, Fn. 4 und 6 | A · ja |
| Q03 | PwC schätzt „aggregierte Gesamtkosten“: nicht nur Investitionen, sondern auch aufsummierte jährliche Energiekosten | bestätigt | – | WD 5 – 3000 – 151/24, PDF-S. 14 (Fn. 48) | A · ja (WD), PwC nein |
| Q04 | Die 13,3 Billionen als „Investitionskosten“ (R21, Druckseite 12) | korrigiert | alt „Investitionskosten 13,8“ → neu „Gesamtkosten aus Investitionen und Energiekosten, 13,3“ | WD 151/24, PDF-S. 14; WD 135/24, S. 2 | A · ja |
| Q05 | Laut DIW sind die 13,3 Billionen bei PwC die Gesamtkosten des Szenarios „Weiter wie bisher“: 3,9 Bio. € Investitionen + 9,4 Bio. € Energiekosten; der beschleunigte Klimaschutzpfad kommt auf 13,2 Bio. € (5,3 + 7,9) | nicht prüfbar | 13,3 / 13,2 Bio. € | DIW Wochenbericht 38+39/2025, S. 618, Fn. 30–31 (gelesen); PwC-Original nicht gelesen | C · DIW ja, PwC nein |
| Q06 | Laut DIW rechnet PwC „einheitlich“ bis 2050; die Energiekosten enthalten Energiebeschaffung, Netzentgelte, Umlagen und CO₂-Bepreisung | nicht prüfbar | bis 2050 | DIW 38+39/2025, Fn. 30–31; WD 135/24 nennt dagegen „bis zum Jahr 2045“ | C · DIW ja, PwC nein |
| Q07 | Die 500 Mrd. € pro Jahr führt die Kurzinformation auf einen FAZ-Gastbeitrag von 2019 zurück; die Autorenangabe ist in den Fußnoten uneinheitlich („Pittel, H.“ in Fn. 4, „Pittel, Henning“ in Fn. 5 und 8) | bestätigt | 500 Mrd. €/a | WD 135/24, Fn. 4, 5, 8 | A · ja |
| Q08 | Der Gastbeitrag nennt kumulierte Mehrkosten von etwa 500 Mrd. bis über 3.000 Mrd. € bis 2050, nicht 500 Mrd. pro Jahr | nicht prüfbar | 500–>3.000 Mrd. € (kumuliert?) | nur ifo-Teaser in einem Suchtreffer; ifo.de verlangt eine Browser-Prüfung (nicht umgangen, `quellen/raw/P0b/ifo_pittel_2019.html` enthält nur die Prüfseite), faz.net nicht freigegeben | C · nein |
| Q09 | Plausibilität zu Q08: 500 Mrd. € pro Jahr wären 14,5 % des BIP 2018; kumuliert über 32 Jahre wären 500–3.000 Mrd. € 0,45–2,7 % des BIP 2018 | Setzung (M) | 0,45–2,7 % | Prüfbericht 02, Nr. 5 (Nachrechnung); Eurostat | M · – |

### 2.4 Drei verschiedene Größen

| ID | Aussage | Status | Wert | Fundstelle | Konf. · primär |
|---|---|---|---|---|---|
| G01 | Kostenstudien messen drei verschiedene Größen: G1 Brutto-Gesamtkosten der Energieversorgung (Investitionen, Betrieb, Energieträger); G2 Brutto-Investitionen in klimarelevante Güter (auch was ohnehin anfiele); G3 Mehrinvestitionen oder Mehrkosten gegen eine Referenz | bestätigt | – | Dossier 02 Abschn. 1; Prüfbericht 02 bestätigt die Einordnung; WD 151/24 PDF-S. 14; Drs. 21/903 S. 2 | B · ja |
| G02 | Spannen: G1 für das ganze Energiesystem 4,8 bis 13,3 Bio. € (Obergrenze PwC nur C); G2 2,4 bis 11,3 Bio. €; G3 als Anteil am BIP: Mehrinvestitionen 1,5–3,5 %, Mehrkosten nach Abzug eingesparter Energie 0,4–2,9 % pro Jahr | korrigiert | s. links | Prüfbericht 02, Korrekturen `kernaussage_3_konfidenz`, `kernaussage_4_*`; Nachrechnung hier (Abschn. 8) | B · ja |
| G03 | Dossier 02: „Konfidenz A“ für die Spannen; Mehrkosten „0,4 bis 1,9 %, Ausreißer ISE 2021“ | korrigiert | alt A, 0,4–1,9 % → neu B, 0,4–2,9 % | Prüfbericht 02, Nr. 6, 9 | B · ja |
| G04 | Brutto-Werte „4,4 bis 12 % des BIP“ | korrigiert | → 4,4–12,3 % für ganzes System oder alle Sektoren; mit Teilabgrenzungen ab 2,6 % | Prüfbericht 02, Nr. 7 | B · ja |
| G05 | Eine Studie nennt beide Größen: Fraunhofer ISE 2024 beziffert die gesamte Energieversorgung 2025–2045 auf rund 8,6 Bio. €, die Differenzkosten gegenüber dem fortgeschriebenen heutigen System auf rund 54 Mrd. € pro Jahr (1,2 % des BIP) | bestätigt | 8,6 Bio. €; 54 Mrd. €/a | ISE 2024, PDF-S. 6 und 82 | B · ja |
| G06 | Zu G05: Aus den Jahreswerten derselben Seite ergeben sich nur 6,7–8,4 Bio. €; die 54 Mrd. € gelten laut Studie „im Mittel über die nächsten 25 Jahre“ | bestätigt | 6,7–8,4 Bio. € | Prüfbericht 02, Nr. 30, 35 | B · ja |
| G07 | DIHK/Frontier „Plan B“: Gesamtsystemkosten 4,8–5,4 Bio. € 2025–2049, davon Energieimporte 2,0–2,3 Bio. €, Netze 1,2 Bio. €; nachfrageseitige Investitionen (Gebäude, Verkehr, Industrie) „werden nicht berücksichtigt“; Abb. 8 heißt „Gesamtkosten des Energiesystems durch die Energiewende bei einer Fortsetzung des Status Quo“ | bestätigt | 4,8–5,4 Bio. € | DIHK „Plan B“, S. 8, S. 27 (Abb. 8 mit Hinweis) | B · ja |
| G08 | KfW/Prognos 2026: Brutto-Klimaschutzinvestitionen 5,7–6,4 Bio. € 2025–2045 (270–300 Mrd. €/a, €2024); „Die KSI sind nicht mit den Kosten für Klimaschutz gleichzusetzen“ | bestätigt | 5,7–6,4 Bio. € | Prognos für KfW, Juni 2026, Zusammenfassung S. 1 und S. 14 | B · ja |
| G09 | Agora 2024: Gesamtinvestitionen 11,3 Bio. € bis 2045 (540 Mrd. €/a); davon 147 Mrd. €/a Klimaschutz-Mehrinvestitionen, rund 393 Mrd. €/a (72,8 %) fielen ohnehin an | bestätigt | 11,3 Bio. €; 147 Mrd. €/a | Agora 2024, PDF-S. 11–12 | B · ja |
| G10 | Die Bundesregierung schreibt, die Investitionsstudien von BDI, BDEW und EnBW „stellen keine energiewendebedingten Zusatzkosten dar“, weil Ersatzinvestitionen enthalten und Einsparungen bei fossilen Energieträgern nicht abgezogen sind | bestätigt | – | BT-Drs. 21/903 vom 15.07.2025, S. 2 (Antwort zu Fragen 1, 2, 4–6) | A · ja |
| G11 | Dossier 02: „Die Bundesregierung rechnet in Drs. 21/903 linear 172 Mrd. €/Jahr“ | korrigiert | → die 172 Mrd. € rechnen die Fragesteller (AfD) in ihrer Vorbemerkung | BT-Drs. 21/903, S. 1 | A · ja |
| G12 | Zum Vergleich: 10 bis 13,8 Bio. € über 20 Jahre sind 11,4–15,7 % des BIP 2024 pro Jahr; als G1 liegt das in der Größenordnung der Brutto-Studien (4,4–12,3 %), als Mehrkosten über allem, was die gelesenen Studien ausweisen (0,4–2,9 %) | bestätigt | 11,4–15,7 % | eigene Division, BIP 2024; Prüfbericht 02, Abschn. 4 | B · ja |
| G13 | Dossier 02: „als Mehrkosten um den Faktor 5 bis 30 über allem, was die Studien ausweisen“ | verworfen | – | Nachrechnung: 11,4–15,7 % gegen 0,4–2,9 % ergibt Faktor 4 bis 44; ein Faktor täuscht Genauigkeit vor. Ersetzt durch G12 | B · ja |

### 2.5 Dasselbe Muster beim Netz

| ID | Aussage | Status | Wert | Fundstelle | Konf. · primär |
|---|---|---|---|---|---|
| N01 | R21: „Allein der notwendige Aus- und Umbau der Netze wird nach einer Studie der DIHK 2.100 Milliarden kosten“ (Druckseite 3); „Gesamtkosten des Netzausbaus sogar auf 2.100 Milliarden“ (Druckseite 10) — ohne Fundstelle | bestätigt | 2.100 Mrd. € | R21 Text Z. 78–79, 340–341 | A · ja |
| N02 | In der DIHK-Studie „Plan B“ kosten die Netze 1,2 Bio. € (Investition und Betrieb) für 2025–2049; 2,1–2,3 Bio. € sind dort die Gesamtsystemkosten der nächsten zehn Jahre einschließlich Energieimporten | korrigiert | alt 2.100 Mrd. € Netz → neu 1.200 Mrd. € Netz 2025–2049 | DIHK „Plan B“, S. 8 und S. 27, Abb. 8; Begleitpapier S. 2 | B · ja |
| N03 | Dass R21 diese DIHK-Studie meint, ist unser Schluss aus der Zahl; das Papier nennt keine Fundstelle | nicht prüfbar | – | Dossier 01, Q1 und Abschn. 8; Wendlands R21-Papier zitiert dieselbe Studie mit 1,2 Bio. € | B · ja |
| N04 | Factsheet B: „Netzausbau 1200 Mrd. € bis 2034 (Bothe et al. 2025)“ — in der Studie gilt die Zahl für 2025–2049, rund die Hälfte fällt in den nächsten zehn Jahren an | korrigiert | alt „bis 2034“ → neu „2025–2049“ | R21 Factsheet B (PDF 13); DIHK S. 27; Begleitpapier S. 2 | A · ja |
| N05 | R21: EWI „etwa 740 Milliarden Euro“ bis 2045 für Übertragungs- und Verteilnetz. Nächste Fundstelle: ef.Ruhr mit EWI im Unterauftrag (April 2024), rund 732 Mrd. € (Verteilnetz 430, Übertragungsnetz 301), Auftraggeber Netze-Gesellschaft Südwest | korrigiert | 740 → 732 Mrd. € (+1,1 %), Urheber ef.Ruhr/EWI | ef.Ruhr/EWI 2024, S. 2, 4, 8; Prüfbericht 01 und 02 | B · ja |
| N06 | Neuere Netzzahlen bis 2045: 675 Mrd. € (BET/EWI 2025: 440 ÜN + 235 VN), 732 (ef.Ruhr/EWI), 792 (440 + 352 VN aus den Langfristszenarien); die Größenordnung von R21s 740 ist plausibel | bestätigt | 675 / 732 / 792 Mrd. € | Prüfbericht 02, Nr. 12, 13 (BET/EWI PDF-S. 13, 79, 93, 99) | B · ja |
| N07 | Dossier 02: „Studien: 651–732 Mrd. € ÜN + VN“ | verworfen | – | Prüfbericht 02, Nr. 13: 651 aus keiner Quelle reproduzierbar | B · ja |
| N08 | Bundesrechnungshof 2024: Netzausbau bis 2045 „mehr als 460 Mrd. Euro“; das BMWK erzeuge mit Stromgestehungskosten ohne Netzkosten „außerhalb der Fachöffentlichkeit ein falsches Bild der tatsächlichen Kosten der Transformation“ | bestätigt | >460 Mrd. € | BT-Drs. 20/10585, PDF-S. 9 (Z. 365–375) und Abb. 8 | A · ja |
| N09 | Übertragungsnetz: der bestätigte NEP 2023 stieg von rund 323 auf etwa 440 Mrd. €; der NEP 2025 (2. Entwurf) senkt das wieder auf rund 364–392 Mrd. € | bestätigt | 323 → 440 → 364–392 Mrd. € | NEP 2037/2045 (2025), kompakt, PDF-S. 11–12 | B · ja |
| N10 | Keine der Netzzahlen enthält Zinsen; über Netzentgelte zahlen Kunden Abschreibung plus Verzinsung (ef.Ruhr/EWI rechnet diese Vollkosten methodisch aus) | bestätigt | – | ef.Ruhr/EWI 2024, S. 4 („Vollkosten … Abschreibung, Zins…“); DIHK Fn. 27 | B · ja |

### 2.6 Der Vergleichspfad

| ID | Aussage | Status | Wert | Fundstelle | Konf. · primär |
|---|---|---|---|---|---|
| V01 | R21 beziffert die Kosten des eigenen Kurses nicht: „Auch eine Kehrtwende in der Energiepolitik erfordert erhebliche Investitionen … Der Mittelbedarf liegt aber weit unter den Kosten“ der Energiewende | bestätigt | – | R21 Druckseite 5 und 27 (Text Z. 162–166, 2187–2191) | A · ja |
| V02 | Factsheet B rechnet für 50 GW Kernkraft-Neubau (31 EPR, 49,6 GW) 310 Mrd. €, das sind 6.250 €/kW; das eigene Referenzpapier (Wendland, R21, Okt. 2026) rechnet mit 7.000 €/kW und „ca. 350 Milliarden Euro“ | bestätigt | 310 Mrd. €; 6.250 €/kW | R21 Factsheet B (PDF 15); Wendland PDF 3 und 16; Prüfbericht 01, K3 | A · ja |
| V03 | Dieselben 49,6 GW zur Spanne gebauter westlicher Projekte (7.500 / 12.000 / 17.500 €/kW) kosten 372 / 595 / 868 Mrd. € | Setzung (M) | 372 / 595 / 868 Mrd. € | eigene Multiplikation; Spanne aus Dossier 09 (`neubau_de_capex_eur_kw`, B) und README-Entscheidung | M · – |
| V04 | 50 GW Neubau bis 2045 sind nach westlichen Bauzeiten ausgeschlossen; ein erster deutscher Block bei Entscheidung 2027 ginge 2040–2047 ans Netz, im ungünstigen Fall 2056 | korrigiert | alt „2038–2047“ → neu „2040–2047 (max. 2056)“ | Prüfbericht 09, Abschn. 3 Nr. 3 | B · ja |
| V05 | R21s Kostenzahlen für den eigenen Pfad decken nur Kraftwerke ab (Neubau, Modernisierung 8,5 Mrd. €, Gas 21,7 Mrd. €), nicht Netze, Energieimporte, Gebäude, Verkehr und Industrie; mit den 13,3 Billionen sind sie nicht vergleichbar | bestätigt | – | Dossier 01, Factsheet B; Prüfbericht 01, Nachrechnung Factsheet B | A · ja |
| V06 | Laut DIW kosten bei PwC der beschleunigte Klimapfad (13,2 Bio. €) und „Weiter wie bisher“ (13,3 Bio. €) fast gleich viel | nicht prüfbar | 13,2 / 13,3 Bio. € | DIW 38+39/2025, S. 618; PwC nicht gelesen | C · DIW ja, PwC nein |
| V07 | Fraunhofer ISE 2021: Netto-Mehraufwendungen bis 2045 gegenüber einer Entwicklung „ohne weitere Reduzierung der energiebedingten CO₂-Emissionen“ zwischen 1.000 Mrd. € (Suffizienz) und 3.300 Mrd. € (Inakzeptanz), Referenz rund 2.500 Mrd. € | bestätigt | 1,0–3,3 Bio. € | ISE 2021, PDF-S. 8 | B · ja |
| V08 | Ariadne 2025: Mehrkosten gegenüber „Existierenden Politiken“ 16–26 Mrd. € pro Jahr (2025–2045), bei Beharren in den Nachfragesektoren 52 Mrd. € | bestätigt | 16–26; 52 Mrd. €/a | Ariadne-Zusammenfassung, PDF-S. 8 | B · ja |
| V09 | KfW/Prognos 2026: netto gegenüber fossiler Referenztechnik 130–153 Mrd. € pro Jahr; zusätzlich zum heutigen Niveau „around EUR 65 billion“, 1,5 % des BIP | bestätigt | 130–153; 65 Mrd. €/a | Prognos S. 1; KfW-Focus 561, S. 1 und 3 | B · ja |
| V10 | DIHK „Plan B“: Ein anders gesteuerter Klimapfad spart „mindestens 530 bis 910 Mrd. €“ bis 2050 (11–17 %) bei gleichem Endenergieverbrauch; Plan B ist selbst ein Klimaneutralitätspfad, kein Ausstieg | bestätigt | 530–910 Mrd. € | DIHK „Plan B“, S. 12 und Hinweis zu Abb. 2 | B · ja |
| V11 | Klimafolgekosten nur durch Extremwetter in Deutschland 2022–2050: 280–900 Mrd. €, ausdrücklich Untergrenze | bestätigt | 280–900 Mrd. € | hib 411/2024 (gelesen); DIW 38+39/2025 (gelesen); Studie IÖW/Prognos/GWS nicht gelesen | B · nein (Studie) |
| V12 | UBA-Klimakosten 2025: 345 €/t CO₂ (1 % Zeitpräferenz) bzw. 990 €/t (0 %), €2025; globale Schäden je Tonne | bestätigt | 345 / 990 €/t | UBA-Tabelle 06.07.2026, S. 1 | B · ja |
| V13 | Die 280–900 Mrd. € (Schäden in Deutschland) und die UBA-Sätze (globale Schäden je deutscher Tonne) dürfen nicht addiert werden | bestätigt | – | Dossier 02 Abschn. 5 (Hinweis zur Vergleichbarkeit) | B · ja |

### 2.7 Warum niedrige Mehrkosten zu optimistisch sein können

| ID | Aussage | Status | Wert | Fundstelle | Konf. · primär |
|---|---|---|---|---|---|
| O01 | Die Referenz enthält schon Klimaschutz: KfW 2021 rechnet gegen eine Referenz mit „klimaschutzbezogenen ‚ohnehin‘-Investitionen“ (z. B. beschlossener EE-Ausbaupfad); Ariadne gegen „Existierende Politiken“; KfW/Prognos 2026 verzichtet deshalb ganz auf eine Referenz | bestätigt | – | KfW-Fokus 350, S. 1; Ariadne S. 8; Prognos S. 14 | B · ja |
| O02 | Beharrungs- und Akzeptanzszenarien kosten 16 bis 235 % mehr (ISE 2021 +16 bis +32 %, ISE 2024 +30 bis +57 %, Ariadne 52 statt 15,5–16 Mrd. € bottom-up) | korrigiert | alt „30 bis 100 %“ → neu „16 bis 235 %“ | Prüfbericht 02, Nr. 24 | B · ja |
| O03 | Die Investitionssummen enthalten keine Finanzierungskosten (DIHK zählt Investitionen im Jahr der Realisierung) | bestätigt | – | DIHK Fn. 27; Agora, KfW: Investitionsausgaben | B · ja |
| O04 | Reale Investitionskosten je kW für Windkraft sind „seit 2020 wieder gestiegen, statt weiter zu sinken“ | bestätigt | – | DIHK „Plan B“, S. 27–28 | B · ja |
| O05 | Gesamtmodell gegen Sektormodelle: Ariadne 26 Mrd. € (REMIND) gegen 16 Mrd. € | bestätigt | 16 / 26 Mrd. €/a | Ariadne S. 8 | B · ja |
| O06 | Kosten werden vom Strompreis in den Haushalt verschoben: Der Bund zahlte 2024 18,49 Mrd. € auf das EEG-Konto | bestätigt | 18,49 Mrd. € | BT-Drs. 20/14522, S. 1 (Prüfbericht 10, KA 6) | B · ja |
| O07 | ISE 2021 rechnet mit einem BIP 2020 von 3,806 Bio. €; Eurostat: 3,478 Bio. €; die BIP-Anteile der Studie sind dadurch rund 9 % zu niedrig (Referenz 2,8 statt 2,5 %) | bestätigt | 2,8 % | Prüfbericht 02, Korrektur `ise2021_bip_bezug` | B · ja |

### 2.8 Wo R21 recht hat

| ID | Aussage | Status | Wert | Fundstelle | Konf. · primär |
|---|---|---|---|---|---|
| R01 | Chinas Anteil an den Extra-EU-Einfuhren stieg 2015 → 2025 bei PV-Modulen und -Zellen von 38 % auf 98 %, bei Lithium-Ionen-Akkus von 29 % auf 90 % | bestätigt | 38 → 98 %; 29 → 90 % | Eurostat Comext DS-045409 (Dossier 07, Tab. 3.1; Prüfbericht 07 bestätigt ≤ 0,5 Prozentpunkte) | B · ja |
| R02 | Zu R01: 2018 endeten die EU-Mindestimportpreise für chinesische Module; ein Teil des Anstiegs folgt daraus | bestätigt | – | Prüfbericht 07, Urteil Nr. 5 | B · ja |
| R03 | Industrieproduktion (Bergbau, Verarbeitendes Gewerbe, Energie) 2025: −15,0 % gegenüber 2018, −12,2 % gegenüber 2019; energieintensive Zweige gegenüber 2019: Chemie −17,9 %, Glas/Keramik −20,0 %, Metall −15,6 %, Papier −18,2 % | bestätigt | s. links | Eurostat `sts_inpr_a` (Prüfbericht 10, KA 1) | B · ja |
| R04 | R21 nennt „−20 %“ (energieintensiv) und „−15 %“ (Industrie) „gegenüber der Zeit vor dem Jahr 2020“ ohne Basisjahr; mit Basis 2018 trifft die Größenordnung zu | bestätigt | – | R21 Druckseite 6; Prüfbericht 10 | B · ja |
| R05 | Der Rückgang ist nicht allein deutsch (EU27 Chemie −16,0 %, Metall −12,2 %), aber bei Papier (EU27 −6,5 %) und Glas/Keramik (−10,8 %) liegt Deutschland deutlich schlechter | bestätigt | – | Prüfbericht 10, KA 2 | B · ja |
| R06 | Industriestrom (2.000–19.999 MWh, ohne MwSt): DE 13,1 gegen EU27 10,5 ct/kWh im 1. Hj. 2019 (+25 %); 1. Hj. 2026 17,4 gegen 15,6 ct (+11,7 %). Haushaltsstrom 1. Hj. 2026: DE 36,2 gegen EU27 28,3 ct (+28 %) | bestätigt | s. links | Eurostat `nrg_pc_205`, `nrg_pc_204` (Prüfbericht 10, KA 3) | B · ja |
| R07 | Bundesbank (Modellrechnung, ex ante): dauerhaft mehr als verdoppelte Energiepreise gegenüber 2019 dämpfen die Wertschöpfung der Industrie um rund 4,4 %, gesamt um rund 2 % | bestätigt | −4,4 % / −2,1 % | Bundesbank, Monatsbericht Dez. 2022, S. 29–30 (Prüfbericht 10) | B · ja |
| R08 | Energiemenge der Dunkelflaute: Im schwächsten 5-Tage-Fenster 2015–2025 hätten die Ausbauziele 2030 eine Lücke von 4,8 / 5,7 / 7,0 TWh (min / Median / max) gelassen, mit dem Anlagenbestand 11/2026 6,3 / 6,8 / 7,5 TWh; R21 rechnet mit 7,1 TWh | bestätigt | s. links | Dossier 05 K1; Prüfbericht 05, Abschn. 4 (eigene Nachrechnung, Abweichung ≤ 1 %) | B · ja (eigene Rechnung auf Messdaten) |
| R09 | Die Technik in Factsheet A passt nicht zur Planung: Der NEP setzt für 2045 Batterien mit zusammen 231–390 GWh (2–2,5 h) und 60,6–81,3 GW Wasserstoffkraftwerke; R21 Fn. 2 nennt Batterien die „vorgesehene Technik“ | bestätigt | 231–390 GWh | NEP 2037/2045 (2025), Tab. 1 und 8; R21 Fn. 2 (Text Z. 272) | A · ja |
| R10 | ETS-Minderung seit 2005: R21s „ca. 51 %“ (Factsheet D) ist gedeckt; die Kommission nennt −50 % (Stand 2024); „−47 %“ (Factsheet F) entspricht dem Stand 2023 | bestätigt | −50 % | Kommission, 04.04.2025 (`quellen/raw/P2-01/ec_ets_50pct_2025-04-04.html`) | B · ja |
| R11 | Dossier 01: Die drei ETS-Werte (40 / 51 / 47 %) seien ein „Widerspruch“ | korrigiert | → „uneinheitlich; 51 % korrekt, 47 % veraltet, ‚über 40 %‘ als Untergrenze nicht falsch“ | Prüfbericht 01, Abschn. 3.4 | B · ja |
| R12 | ZEW (Rausch 2026): Die 824 Mrd. € sind ein Barwert 2028–2048 für die EU-27, Hebel „nationale nicht-marktliche Maßnahmen entfallen“; der Gesamteffekt liegt eher bei rund 1.071 Mrd. € (20,4 %), also höher als bei R21; „850 Mrd.“ (Factsheet D) steht nicht in der Studie | korrigiert | 824 → 824–1.071 Mrd. € (EU-27) | ZEW Rausch 2026, S. 3, 15, 16; ZEW-PM; Prüfbericht 01, Abschn. 3.1 | B · ja |
| R13 | „Als einziges Industrieland“ nutze Deutschland Erneuerbare als Ersatz statt als Zusatz | verworfen | – | Prüfbericht 10, KA 10: Ersatz fossiler Erzeugung ist europäisches Muster (ES, IT, DK, UK); Konfidenz A. Gehört nicht in Teil 1, auf der Seite nicht als R21-Treffer führen | A · ja |

### 2.9 Was unsere eigenen Dossiers falsch hatten

| ID | Aussage | Status | Wert | Fundstelle | Konf. · primär |
|---|---|---|---|---|---|
| E01 | Dossier 05 hat den Wasserstoffspeicher der Vergleichsrechnung nur für ein einziges 5-Tage-Ereignis ausgelegt (10–15 TWh); die zitierte Literatur braucht 80–95 TWh; die Absicherung kostet damit eher 90–150 statt 38–111 Mrd. € Investition — weiter weit unter 1,4 Bio. € | korrigiert | 38–111 → ~90–150 Mrd. € | Prüfbericht 05, Abschn. 3.1 | B · ja |
| E02 | Dossier 05 nannte nur das europäische Extremereignis (55 Tage); für Deutschland allein finden Kittel/Schill 109 Tage (Winter 1995/96) mit rund einem Drittel der üblichen Wind- und PV-Verfügbarkeit | korrigiert | + 109 Tage | Prüfbericht 05, Abschn. 3.3 (DIW-Podcast, Transkript) | B · ja |
| E03 | Dossier 07 hat den Preisaufschlag im Stresstest „China liefert nicht“ zu hoch angesetzt: +3 / +10 / +22 % statt +7,5 / +27 / +57 % | korrigiert | s. links | Prüfbericht 07, Urteil Nr. 2 | B · ja |
| E04 | Dossier 09 hat die Kernkraft-Reaktivierung im Mittel mit 4,1 GW zu günstig angesetzt; Entscheidung: Mitte 2,7 GW (Isar 2, Emsland), oberes Ende rund 12 GW laut Radiant (nur als Parteiwiedergabe gelesen) | korrigiert | 4,1 → 2,7 GW | Prüfbericht 09, Abschn. 3 Nr. 1, 2; README-Entscheidung | B · ja |

Die Korrekturen E01 bis E04 gehören nicht zur Zahlenerzählung von Teil 1, sondern in den
Kasten „Wo wir uns korrigieren mussten“ (Gegenposition GP10). Die übrigen Korrekturen
(F06, G02–G04, G11, G13, N07, O02, R11, R12, F10) sind in den Tabellen oben.

## 3. Was nicht am Original gelesen ist · die erlaubten Sätze

Beide Originale bleiben nach der Entscheidung vom 22.11.2026 („später“) ungelesen: die
PwC-Studie (Registrierung) und der FAZ-Gastbeitrag (ifo.de mit Browser-Prüfung, faz.net
nicht freigegeben). Alles, was daran hängt, steht auf der Seite nur in einer der folgenden
Fassungen. Jede Fassung ist so gebaut, dass sie auch dann stimmt, wenn das Original
etwas anderes sagt als die Sekundärquellen: Sie schreibt die Aussage dem zu, der sie
gemacht hat, und sagt, dass wir das Original nicht kennen.

| ID | Woran es hängt | Erlaubter Satz auf der Seite |
|---|---|---|
| Q05 | PwC: was die 13,3 sind | „Nach der Darstellung des DIW Berlin (Wochenbericht 38+39/2025) sind die 13,3 Billionen bei PwC die Gesamtkosten eines Szenarios ‚Weiter wie bisher‘ — 3,9 Billionen Investitionen und 9,4 Billionen Energiekosten. Die PwC-Studie selbst ist nur nach Registrierung abrufbar; wir haben sie nicht gelesen.“ |
| Q06 | PwC: Zeitraum und Abgrenzung | „Das DIW schreibt, PwC rechne bis 2050 und zähle zu den Energiekosten auch Netzentgelte, Umlagen und den CO₂-Preis. Die Kurzinformation des Bundestags schreibt ‚bis zum Jahr 2045‘. Welche Angabe stimmt, können wir ohne das Original nicht sagen.“ |
| V06 | PwC: beide Pfade gleich teuer | „Laut DIW kommt in derselben Studie der beschleunigte Klimaschutzpfad auf 13,2 Billionen, also fast dieselbe Summe. Auch das haben wir nicht am PwC-Original geprüft.“ |
| Q03 + Q04 | was „aggregierte Gesamtkosten“ heißt (am Original gelesen, trägt den Befund unabhängig von PwC) | „Eine zweite Kurzinformation des Bundestags (WD 5 – 3000 – 151/24) erklärt den Begriff: ‚Aggregierte Gesamtkosten‘ heißt, dass nicht nur die Investitionskosten betrachtet werden, sondern auch aufsummierte jährliche Energiekosten. Die 13,3 Billionen sind also keine reinen Investitionskosten.“ |
| Q08 | FAZ: was der Gastbeitrag sagt | „Die 500 Milliarden pro Jahr stammen laut Kurzinformation aus einem FAZ-Gastbeitrag von 2019. Den Beitrag konnten wir nicht lesen: Die Seite des ifo-Instituts verlangt eine Browser-Prüfung, die wir nicht umgehen. Ob dort 500 Milliarden pro Jahr stehen, wissen wir deshalb nicht.“ |
| Q08 (Fußnote, optional) | FAZ: Hinweis aus dem Suchtreffer | „Eine Kurzfassung auf der ifo-Seite, die uns nur als Suchmaschinen-Auszug vorlag, spricht von 500 Milliarden bis über 3 Billionen Euro insgesamt bis 2050. Das ist ungeprüft (Konfidenz C).“ — nur in der Fußnote oder im White Paper, nicht im Story-Text; Entscheidung D4 |
| Q09 | Plausibilität | „500 Milliarden Euro pro Jahr wären 2018 rund 14,5 Prozent der Wirtschaftsleistung gewesen. Das ist unsere Rechnung, kein Beleg dafür, was im Gastbeitrag steht.“ |

**Was ausdrücklich nicht gesagt werden darf** (Verbotsliste, Abschnitt 7): dass der
Wissenschaftliche Dienst falsch referiert habe; dass die 13,3 Billionen „das
Weiter-wie-bisher-Szenario sind“ ohne Zuschreibung an das DIW; dass PwC zeige,
Klimaschutz koste nichts.

## 4. Erzählbogen · fünf Akte

Je Schritt: Kernaussage in einem Satz, die freigegebenen Zahlen (IDs aus Abschnitt 2),
die Grafik-Idee. Grafiken ziehen ihre Werte aus `data/` (Abschnitt 4 von `TRANSPARENZ.md`).

### Akt 1 · Der Satz

| Schritt | Kernaussage | Zahlen | Grafik-Idee |
|---|---|---|---|
| 1.1 | Eine Schlagzeile sagt, Deutschland werde die Energiewende „nicht überleben“, und beruft sich auf ein Papier der Denkfabrik R21. | S01, S02, S03 | Schlagzeile als Zitatkarte mit Vermerk „Artikel hinter Bezahlschranke, nicht gelesen“; daneben das Titelblatt der R21-Erklärung mit dem Etikett „Erklärung, 59 Seiten“ |
| 1.2 | Im Papier steht der Satz zweimal: in der Zusammenfassung als „Kosten der Energiewende“, im Kapitel 3 als „Investitionskosten“ von 10 bis 13,8 Billionen Euro. | S04, S05 | zwei Textausschnitte übereinander, die abweichenden Wörter („Kosten“ / „Investitionskosten“) markiert |
| 1.3 | R21 rechnet die Summe in Wirtschaftsleistung um: das Zwei- bis Dreifache eines Jahres-BIP — die Rechnung geht auf. | S06, S08 | Balken: BIP 2025 (4,53 Bio. €) als Einheit, daneben 10 und 13,8 Bio. € als 2,2- und 3,0-fache |
| 1.4 | Für diese Zahl nennt das Papier genau eine Quelle, Fußnote 5 — die einzige externe Fundstelle im ganzen Haupttext. | S07 | Zählstreifen der 39 Haupttext-Zahlen: 4 mit Fundstelle, 6 mit Urheber, 27 ohne Quelle; Fußnote 5 hervorgehoben |

### Akt 2 · Die Fußnote

| Schritt | Kernaussage | Zahlen | Grafik-Idee |
|---|---|---|---|
| 2.1 | In der zitierten Kurzinformation steht ein anderer Satz: 500 Milliarden pro Jahr oder 13,3 Billionen insgesamt. | F01, F08 | Zitat R21 und Zitat WD nebeneinander, Unterschiede farbig |
| 2.2 | 13,8 kommt dort nicht vor, und auch keine Spanne „10 bis 13,8“ — woher die Abweichung kommt, wissen wir nicht. | F02, F03, F07 | Suchfeld-Animation „13,8“ über sechs Seiten: 0 Treffer; die „10“ als offene Frage mit der Vermutung 500 × 20, klar als „unsere Vermutung“ beschriftet |
| 2.3 | Die Kurzinformation rechnet nicht selbst: Sie referiert Studien und schreibt, die Bundesregierung habe keine eigene Gesamtkostenrechnung. | F04, F09 | Schema „Wer rechnet hier?“: WD als Pfeil zu fremden Studien, nicht als Rechenkasten |
| 2.4 | Dieselbe Kurzinformation gibt den Hinweis wieder, dass man Kosten nur im Vergleich mit einem System ohne Energiewende vollständig betrachten kann. | F05, F06 | Zitatkarte S. 5; Vorgriff auf Akt 5 (Waage „Pfad A gegen Pfad B“, noch leer) |

### Akt 3 · Die Quelle der Quelle

| Schritt | Kernaussage | Zahlen | Grafik-Idee |
|---|---|---|---|
| 3.1 | Die 13,3 Billionen stammen von PwC — aus einer Studie mit dem Titel „Beschleunigte Investitionen in den Klimaschutz lohnen sich – jetzt auch ökonomisch!“. | Q01, Q02 | Quellenkette als Stufen: BILD → R21 → WD → PwC; jede Stufe mit „gelesen / nicht gelesen“-Marke |
| 3.2 | Die 13,3 Billionen sind keine reinen Investitionen, sondern Investitionen plus Energiekosten — das sagt der Bundestag selbst. | Q03, Q04 | gestapelter Balken „aggregierte Gesamtkosten“ mit zwei Schichten, Beschriftung nur mit den Begriffen, ohne Teilzahlen |
| 3.3 | Laut DIW ist es die Summe für „Weiter wie bisher“, und der Klimaschutzpfad kostet dort fast gleich viel — das PwC-Original haben wir nicht gelesen. | Q05, Q06, V06 | zwei gestapelte Balken 3,9 + 9,4 und 5,3 + 7,9 mit deutlichem Badge „C · laut DIW, PwC nicht gelesen“ |
| 3.4 | Auch die 500 Milliarden pro Jahr haben eine Quelle, die wir nicht lesen konnten; was dort steht, bleibt offen. | Q07, Q08, Q09 | grauer Kasten „nicht gelesen“ mit Grund (Browser-Prüfung) und der Plausibilitätsrechnung als Setzung |

### Akt 4 · Drei Größen

| Schritt | Kernaussage | Zahlen | Grafik-Idee |
|---|---|---|---|
| 4.1 | Kostenstudien messen drei verschiedene Dinge: was Energie insgesamt kostet, was investiert wird, und was zusätzlich anfällt. | G01, G10 | drei Gefäße G1, G2, G3 mit Inhaltsliste (Investitionen, Betrieb, Energieträger, Ohnehin-Anteil, Einsparungen) |
| 4.2 | Eine einzige Studie zeigt den Unterschied: Fraunhofer ISE nennt 8,6 Billionen für die gesamte Energieversorgung und rund 54 Milliarden pro Jahr Differenzkosten. | G05, G06 | ein großer Block (8,6 Bio. €) und darin ein kleiner (54 Mrd. €/a × 21 bis 25 Jahre = 1,1–1,35 Bio. €) |
| 4.3 | Auf gemeinsamer Basis liegen die Studien je nach Größe bei 4–12 %, 2,6–12 % oder 0,4–2,9 % des BIP pro Jahr — R21s Zahl passt zur ersten Gruppe, nicht zur letzten. | G02–G04, G07–G09, G12 | Punktdiagramm % BIP pro Jahr, drei Zeilen G1/G2/G3, jede Studie ein Punkt oder Balken; R21 (11,4–15,7 %) als Band darüber; Tabelle aus Abschnitt 8 darunter |
| 4.4 | Dasselbe Muster beim Netz: Die „2.100 Milliarden Netzkosten“ sind in der DIHK-Studie die Gesamtsystemkosten von zehn Jahren; das Netz kostet dort 1,2 Billionen über 25 Jahre. | N01–N06, N08 | Abb.-8-Nachbau der DIHK als Torte (Erzeugung, Betrieb, Netze, Importe), der 2,1-Bio.-Zehnjahresblock markiert; daneben Netzbalken 675 / 732 / 740 (R21) / 792 / >460 (BRH) |

### Akt 5 · Der Vergleichspfad und was R21 richtig sieht

| Schritt | Kernaussage | Zahlen | Grafik-Idee |
|---|---|---|---|
| 5.1 | R21 sagt, der eigene Kurs koste „weit“ weniger, nennt aber keine Summe; seine eigenen Zahlen decken nur Kraftwerke ab. | V01, V02, V03, V04, V05 | leere Waagschale „R21-Pfad: nicht beziffert“; daneben Kernkraft-Neubau 310 Mrd. € (R21) gegen 372 / 595 / 868 Mrd. € (Setzung, gebaute Projekte), Zeitachse erster Block 2040–2047 |
| 5.2 | Wo Studien gegen ein System ohne weiteren Klimaschutz rechnen, liegen die Mehrkosten bei 1 bis 3,3 Billionen bis 2045 — nicht bei 10 und mehr. | V07, V08, V09, V10, O07 | Balken der Mehrkosten mit Beschriftung der Referenz („keine weitere CO₂-Minderung“, „existierende Politiken“, „fossile Referenztechnik“) |
| 5.3 | Diese niedrigen Zahlen können zu niedrig sein: Die Referenz enthält schon Klimaschutz, Beharrung kostet bis zum Dreifachen, Zinsen fehlen, Netz- und Windkosten steigen. | O01–O06, N08, N09 | Fehlerbalken-Diagramm: Basiswert je Studie und die Aufschläge aus den Gegenpositionen als nach oben offene Pfeile |
| 5.4 | R21 sieht Wichtiges richtig: China-Abhängigkeit, Industrierückgang, Strompreis, die Energiemenge einer Dunkelflaute, den Emissionshandel und das fehlende Kosten-Monitoring. | R01–R12, F09 | sechs Kästen „Hier hat R21 recht“ (Abschnitt 5, GP1–GP6), jeweils mit Zahl und Einschränkung |

Ausklang (kein eigener Akt): Was Teil 1 nicht zeigt (Abschnitt 6), Hinweis auf Teil 6
(eigene Gesamtrechnung der vier Pfade) und der Kasten „Wo wir uns korrigieren mussten“.

## 5. Pflicht-Gegenpositionen · eigene Kästen auf der Seite

Zwölf Kästen. GP1 bis GP6: wo R21 recht hat. GP7 bis GP11: warum niedrige
Mehrkosten zu optimistisch sein können. GP12: wo unsere Dossiers falsch lagen.

| Nr. | Überschrift | Inhalt (freigegebene Zahlen) | Beleg | Einschränkung, die im Kasten stehen muss |
|---|---|---|---|---|
| GP1 | **Die Abhängigkeit von China ist real und gewachsen** | PV-Module 38 → 98 %, Lithium-Ionen-Akkus 29 → 90 % der Extra-EU-Einfuhren 2015 → 2025 (R01) | Eurostat Comext; Dossier 07, Prüfbericht 07 | Teil des Anstiegs folgt aus dem Ende der Mindestimportpreise 2018 (R02); Anlagen laufen bei einem Lieferstopp weiter, Brennstoffe nicht (Teil 4) |
| GP2 | **Die Industrie produziert deutlich weniger** | −15,0 % gegen 2018, energieintensive Zweige −16 bis −20 % gegen 2019 (R03, R04) | Eurostat `sts_inpr_a` | auch andere EU-Länder verlieren, Deutschland aber stärker (R05); die Ursachen sind nicht zerlegt; die Bundesbank-Zahl (R07) ist eine Modellrechnung zum Gaspreisschock, keine Zuschreibung an die Energiewende |
| GP3 | **Strom ist in Deutschland teurer als im EU-Mittel** | Industrie +25 % (2019), +11,7 % (2026); Haushalte +28 % (2026) (R06) | Eurostat `nrg_pc_204/205` | der Abstand ist älter als die Krise und zuletzt kleiner geworden; Haupttreiber seit 2021 war die Beschaffung (Gaspreis), Netzentgelte stiegen (Dossier 10, KA 5, Konfidenz A für Zahlen, C für Ursachen) |
| GP4 | **Die Energiemenge einer Dunkelflaute hat R21 ungefähr richtig** | Lücke 4,8–7,0 TWh (Ziele 2030), 6,3–7,5 TWh (Bestand 11/2026), R21 7,1 TWh (R08) | eigene Rechnung auf Messdaten 2015–2025, nachgerechnet vom Prüfer | der Fehler liegt in der Technik: Batterien sind nicht vorgesehen (R09); und fünf Tage sind nicht der schwerste Fall (E02: 109 Tage) |
| GP5 | **Beim Emissionshandel stimmt R21s Zahl** | −51 % seit 2005 (R21), Kommission −50 % (R10); ZEW-Gesamteffekt eher 1,07 Bio. € statt 824 Mrd. € (R12) | Kommission 04.04.2025; ZEW Rausch 2026 | ZEW-Werte gelten für die EU-27 als Barwert; die Wirkung nationaler Maßnahmen im ETS ist „teilweise, zeitabhängig und politisch“ (Dossier 09 KA 6) |
| GP6 | **Ein Kosten-Monitoring fehlt tatsächlich** | Die Bundesregierung macht „keine eigenen Abschätzungen“ (F09, G10); der Bundesrechnungshof spricht von einem „falschen Bild der tatsächlichen Kosten“ (N08) | WD 135/24 S. 1; Drs. 21/903 S. 2; Drs. 20/10585 S. 9 | dieselbe Antwort der Bundesregierung sagt auch, dass Brutto-Investitionsstudien keine Zusatzkosten messen (G10) |
| GP7 | **Die Referenz enthält schon Klimaschutz** | KfW 2021: Referenz mit beschlossenem EE-Ausbau; Ariadne: „Existierende Politiken“; KfW 2026 verzichtet deshalb auf eine Referenz (O01) | KfW-Fokus 350 S. 1; Ariadne S. 8; Prognos S. 14 | niedrige Mehrkosten messen oft nur den letzten Schritt zum Ziel; die fossilste Referenz (ISE 2021) liefert die höchsten Werte (V07, 2,2–2,9 % BIP) |
| GP8 | **Beharrung kann ein Mehrfaches kosten** | +16 bis +235 % (O02); Ariadne 52 statt 16 Mrd. €/a (V08) | Ariadne S. 8; ISE 2021 S. 41; ISE 2024 S. 81 | der bisherige Hochlauf von Wärmepumpen und E-Autos gleicht eher dem Beharrungs-Szenario |
| GP9 | **Finanzierungskosten fehlen in den Summen** | Investitionen werden im Jahr der Realisierung gezählt (O03); über Netzentgelte zahlen Kunden Zinsen mit (N10) | DIHK Fn. 27; ef.Ruhr/EWI S. 4 | wir haben keine Studie mit einer Gesamtzahl für die Kapitalkosten gefunden (Lücke) |
| GP10 | **Der Bundesrechnungshof widerspricht dem Bild billiger Erneuerbarer** | >460 Mrd. € Netzausbau bis 2045, „falsches Bild der tatsächlichen Kosten“ (N08); EEG-Kosten in den Haushalt verschoben, 18,49 Mrd. € 2024 (O06) | Drs. 20/10585 S. 9; Drs. 20/14522 S. 1 | der Bericht nennt keine Gesamtkostenzahl der Energiewende |
| GP11 | **Netz- und Windkosten steigen** | NEP 2023: 323 → 440 Mrd. € (N09); Wind-Investitionskosten je kW seit 2020 wieder gestiegen (O04) | NEP 2025 kompakt S. 11; DIHK S. 27–28 | derselbe NEP senkt die Übertragungsnetzkosten wieder auf 364–392 Mrd. € (N09) |
| GP12 | **Wo wir uns korrigieren mussten — in beide Richtungen** | zu Gunsten der Energiewende geschönt: Beharrung „30–100 %“ statt bis 235 % (O02), ISE 2021 als „Ausreißer“ (G03), H₂-Speicher für nur ein Ereignis (E01), 109-Tage-Ereignis fehlte (E02). Zu Lasten der Energiewende: China-Stresstest zu hoch (E03). Zu Lasten von R21 zu hart: ETS-„Widerspruch“ (R11), Monitoring-Bericht (F10), ZEW-Gesamteffekt übersehen (R12). Zu freundlich zum R21-Pfad: Reaktivierung 4,1 statt 2,7 GW (E04). Im Erstbefund: „verlangt“ statt „referiert“ (F06), Seitenangaben | Prüfberichte 01, 02, 05, 07, 09; `00_aufhaenger_r21.md`, Tabelle „Korrekturen“ | Die Prüfer haben fast keine falsch abgeschriebenen Zahlen gefunden; die Fehler lagen in Ableitungen und Zusammenfassungen |

## 6. Was Teil 1 nicht zeigt

1. **Kein eigenes Kostenmodell.** Teil 1 vergleicht fremde Studien. Was die vier Pfade
   auf derselben Grundlage kosten, rechnet erst Teil 6. Teil 1 kann deshalb nicht sagen,
   ob der R21-Pfad billiger oder teurer ist — nur, dass R21 es nicht beziffert.
2. **Die Studien sind nicht nachgerechnet.** Wir haben ihre Zahlen am Original gelesen und
   auf eine gemeinsame BIP-Basis umgerechnet, aber keine Studie in ihren Annahmen
   (Brennstoffpreise, Lernkurven, Zinsen, Nachfrage) überprüft. Eine Studie mit anderen
   Annahmen kann zu anderen Mehrkosten kommen.
3. **Zwei Originale fehlen:** die PwC-Studie (Quelle der 13,3 Billionen) und der
   FAZ-Gastbeitrag (Quelle der 500 Milliarden). Dazu nicht gelesen: Agora-Hauptstudie,
   Ariadne-Hauptbericht, KfW-2021-Langfassung, dena/EWI-Gutachten, Aurora, BDI/BCG,
   McKinsey, BDEW/EY, die Klimafolgekosten-Studie von IÖW/Prognos/GWS.
4. **Der BIP-Bezug ist eine Setzung.** Alle Anteile beziehen sich auf das nominale BIP
   2024, obwohl die Studien in nominalen Euro, €2023 oder €2024 rechnen und
   unterschiedliche Zeiträume (20 bis 32 Jahre) haben. Die Anteile sind Näherungen
   (Abweichung je nach Studie einige Zehntel Prozentpunkte).
5. **Mehrkosten sind nicht gleich Belastung.** Keine der Zahlen sagt, wer zahlt
   (Haushalte, Unternehmen, Staat), und keine enthält Verteilungswirkungen. Ob eine
   Volkswirtschaft eine Summe „überlebt“, hängt auch an Finanzierung, Gegenwert und
   Wachstumseffekten, die keine der Studien quantifiziert (KfW/Prognos schließt
   BIP-Aussagen ausdrücklich aus).
6. **Klimaschäden sind nur angerissen.** Die 280–900 Mrd. € betreffen nur Extremwetter in
   Deutschland und sind eine Untergrenze; sie hängen kaum von deutschen Emissionen allein
   ab. Eine Kosten-Nutzen-Rechnung macht Teil 1 nicht.
7. **Die Ursache des Industrierückgangs ist nicht zerlegt.** Teil 1 zeigt, dass die
   Produktion gefallen ist und Strom teurer ist; welchen Anteil die Energiepolitik daran
   hat, kann keine gelesene Quelle ex post beziffern.
8. **Wir kennen die Gründe für die Abweichungen nicht.** Warum im R21-Papier 13,8 statt
   13,3 steht und welche DIHK-Veröffentlichung mit 2.100 Milliarden gemeint ist, wissen
   wir nicht. Eine Nachfrage bei R21 steht aus (Entscheidung D1).

## 7. Fairness-Check gegenüber R21

Ich habe die Liste als Verteidiger des Papiers gelesen. Diese Punkte würde ein Verteidiger
anführen; die Konsequenz steht daneben.

| Einwand eines Verteidigers | berechtigt? | Konsequenz für die Seite |
|---|---|---|
| „13,8 statt 13,3 ist ein Tippfehler; ihr macht daraus eine Geschichte.“ | teilweise: Wir kennen den Grund nicht | Satz nur: „In der Quelle steht 13,3, nicht 13,8. Woher die Abweichung kommt, wissen wir nicht.“ Keine Spekulation über Absicht, kein „aufgerundet“, kein „erfunden“ |
| „Die Kurzinformation heißt selbst ‚Investitionskosten‘ und nennt die 13,3 ‚Kosten‘. R21 hat nur den Titel übernommen.“ | ja (F08) | Auf der Seite sagen, dass die Bezeichnung aus dem Titel der Kurzinformation stammt; der Befund ist, dass die Zahl Energiekosten enthält (Q03), nicht, dass R21 sie umgetauft hat |
| „Der WD ‚kommt auf‘ — das ist eine verkürzte, aber übliche Formulierung für ‚referiert‘.“ | teilweise | Formulierung „Der WD referiert Studien und rechnet nicht selbst“ ohne Vorwurf; nicht „R21 schreibt dem WD eine Rechnung zu, die es nicht gibt“ |
| „Die Bundesregierung legt keine Kostenrechnung vor; R21 benutzt die einzige amtliche Zahl, die es gibt.“ | ja (F09, GP6) | GP6 steht als eigener Kasten vor den Korrekturen der Kostenzahl, nicht dahinter versteckt |
| „PwC und das DIW stehen für Klimaschutz; ihr verlasst euch auf die Gegenseite.“ | ja, für Q05/Q06/V06 | Konfidenz C sichtbar; Herkunft „laut DIW“ in jedem Satz; die tragende Aussage („enthält Energiekosten“) stützt sich auf den Bundestag (Q03), nicht auf DIW oder PwC |
| „Die 2.100 Milliarden könnten aus einer anderen DIHK-Veröffentlichung stammen.“ | möglich (N03) | Satz: „In der DIHK-Studie, die wir gefunden haben … Ob R21 eine andere Veröffentlichung meint, sagt das Papier nicht.“ |
| „Factsheet A zeigt bewusst die Obergrenze, um die Größenordnung sichtbar zu machen.“ | steht so nicht im Factsheet; Fn. 2 nennt Batterien die „vorgesehene Technik“ | GP4 nennt zuerst, was R21 richtig hat (Energiemenge), dann die Technik-Frage; Dunkelflaute nur als Kasten, Hauptthema ist Teil 2 |
| „Die Studien mit niedrigen Mehrkosten sind von Stiftungen und dem Staat bezahlt.“ | als Hinweis berechtigt | Studien-Tabelle nennt Auftraggeber und Geldgeber für jede Zeile, auch DIHK (Verband) und KfW (Förderbank); kein Urteil aus dem Absender ableiten |
| „Ihr vergleicht ein politisches Papier mit Studien.“ | ja | Dokumenttyp „Erklärung“ steht auf der Seite (S02); die Messlatte bewertet innerhalb des Typs |
| „Das Papier ist vom Bundespresseamt gefördert — das klingt, als wolltet ihr es diskreditieren.“ | Gefahr der Unterstellung | S03 nur als Faktenangabe im Steckbrief (wie Auftraggeber bei jeder Studie), nicht im Story-Text als Pointe |
| „‚Nicht überleben‘ ist eine Zuspitzung, keine Prognose.“ | ja | Wir prüfen die Zahl, nicht die Prognose; Satz: „Ob eine Wirtschaft eine Summe ‚überlebt‘, ist keine prüfbare Aussage. Prüfbar ist, was die Summe misst.“ |

**Verbotsliste · Formulierungen, die auf der Seite nicht vorkommen dürfen**

| Nr. | Formulierung | Grund | Ersatz |
|---|---|---|---|
| X01 | „gefälscht“, „erfunden“, „gelogen“, „manipuliert“, „Fake“ | unterstellt Absicht; wir kennen die Gründe nicht | „steht so nicht in der Quelle“ |
| X02 | „R21 hat die Zahl aufgerundet / aufgebläht“ | unterstellt Absicht | „In der Quelle steht 13,3.“ |
| X03 | „Der Wissenschaftliche Dienst hat falsch referiert“ / „Referatsfehler um den Faktor 30“ | Original nicht gelesen (Q08) | Satz aus Abschnitt 3 zu Q08 |
| X04 | „Die 13,3 Billionen sind das Weiter-wie-bisher-Szenario“ ohne „laut DIW“ | Konfidenz C (Q05) | Satz aus Abschnitt 3 zu Q05 |
| X05 | „PwC zeigt: Klimaschutz kostet nichts“ / „Die Energiewende lohnt sich“ als Befund | C; PwC-Energiekosten enthalten Transfers (CO₂-Preis, Umlagen) | „Laut DIW kommen bei PwC beide Pfade auf fast dieselbe Summe.“ |
| X06 | „Die Energiewende kostet nur 16 Milliarden im Jahr“ | eine Studie, Referenz mit beschlossener Politik (O01) | Spanne 0,4–2,9 % des BIP mit Referenz-Angabe |
| X07 | „als Mehrkosten um den Faktor 5 bis 30 zu hoch“ | rechnerisch nicht gedeckt (G13) | Bänder nebeneinander (G12) |
| X08 | „ISE 2021 ist ein Ausreißer“ | Prüfbericht 02 (G03) | „am oberen Rand die Studie mit der fossilsten Referenz“ |
| X09 | „Beharrung kostet 30 bis 100 % mehr“ | Prüfbericht 02 (O02) | „16 bis 235 % mehr“ |
| X10 | „Netzkosten laut Studien 651–732 Mrd. €“ | nicht reproduzierbar (N07) | 675 / 732 / 792 Mrd. € |
| X11 | „Die Bundesregierung rechnet 172 Mrd. € pro Jahr“ | falsche Urheberschaft (G11) | weglassen |
| X12 | „R21 widerspricht seiner eigenen Quelle beim Monitoring-Bericht“ | falscher Bericht (F10) | F09 |
| X13 | „Die Energieimporte fielen auch ohne Energiewende an“ (als gleich hoch) | unbelegt; ohne Energiewende lägen sie vermutlich höher (Prüfbericht 01, 3.5) | „Energieimporte hätte auch ein fossiles System, vermutlich höhere“ — nur mit dieser Einschränkung |
| X14 | „Als einziges Industrieland …“ als R21-Treffer | verworfen (R13) | nicht in Teil 1 |

Die drei heikelsten Formulierungen, über die ein Mensch vor Veröffentlichung entscheiden
sollte: (1) wie Akt 2.2 die Abweichung 13,3 → 13,8 benennt (X01, X02); (2) jeder Satz,
der die 13,3 Billionen als „Weiter wie bisher“ beschreibt (X04, X05); (3) der Satz zur
Netzzahl 2.100 Milliarden, weil die Zuordnung zur DIHK-Studie unser Schluss ist (N03).

## 8. Studien-Vergleichstabelle für die Seite

**Gemeinsame Basis.** BIP 2024 nominal 4.386,94 Mrd. € (Setzung M). „pro Jahr“ ist der
Studienwert, wo die Studie einen nennt; sonst Summe ÷ Jahre (M, mit „(M)“ markiert).
Prozentwerte eigene Division, auf eine Nachkommastelle gerundet; Studienangaben in
Klammern, wo sie abweichen. G1 = Brutto-Gesamtkosten, G2 = Brutto-Investitionen,
G3 = Mehrinvestitionen (G3a) oder Mehrkosten nach Abzug eingesparter Energie (G3b).

### 8.1 Kernzahl am Original gelesen

| Studie | Herausgeber · Auftraggeber / Geldgeber | Größe | Zeitraum | Summe | pro Jahr | % BIP 2024 | Fundstelle |
|---|---|---|---|---|---|---|---|
| Frontier Economics „Plan B“ (Sept. 2025) | Frontier Economics · Auftraggeberin und Geldgeberin DIHK | G1, nur Angebotsseite, inkl. 2,0–2,3 Bio. € Importe | 2025–2049 | 4,8–5,4 Bio. € | 192–216 Mrd. € (M) | 4,4–4,9 % | S. 8, 27 |
| Fraunhofer ISE „Bundesländer im Transformationsprozess“ (Nov. 2024) | Fraunhofer ISE · Modellarbeiten gefördert in TRANSDE (BMWK) und Ariadne (BMBF) | G1, gesamte Energieversorgung | 2025–2045 | 8,6 Bio. € | ~410 Mrd. € (M) | 9,3 % (Studie: 7–10 %) | PDF-S. 82 |
| dieselbe | dto. | G3b gegen fortgeschriebenes System 2024 | „über die nächsten 25 Jahre“ | 1,1–1,35 Bio. € (M) | 54 Mrd. € (28–85) | 1,2 % (0,6–1,9 %) | PDF-S. 6, 80–81 |
| Agora „Investitionen für ein klimaneutrales Deutschland“ (2024) | Agora Think Tanks; Berechnung Prognos, Öko-Institut, Wuppertal Institut, Uni Kassel · Geldgeber laut Agora Stiftungen (C, nicht im PDF) | G2 | 2025–2045 | 11,3 Bio. € | 540 Mrd. € | 12,3 % (Studie: 11 %) | PDF-S. 11–12 |
| dieselbe | dto. | G3a gegen fossile Referenztechnik | 2025–2045 | ~3,1 Bio. € (M) | 147 Mrd. € | 3,4 % (Studie: 3 %) | PDF-S. 12 |
| Prognos „Investitionen für Klimaschutz“ (Juni 2026), KfW-Focus 561 | Prognos · Auftraggeber KfW | G2 | 2025–2045 | 5,7–6,4 Bio. € (€2024) | 270–300 Mrd. € | 6,2–6,8 % | Studie S. 1; Focus S. 3 |
| dieselbe | dto. | G3a netto gegen fossile Referenztechnik | 2025–2045 | 2,7–3,2 Bio. € (M) | 130–153 Mrd. € | 3,0–3,5 % | Studie S. 1, 55; Focus S. 3 |
| dieselbe | dto. | Zuwachs gegenüber heutigem Netto-Niveau | 2025–2045 | ~1,4 Bio. € (M) | 65 Mrd. € | 1,5 % | Focus S. 1, 3 |
| KfW-Fokus Nr. 350 (2021), Studie Prognos/Nextra/NKI | KfW Research · Auftraggeber KfW; nur der Fokus gelesen | G2 | ~2020–2045 | ~5 Bio. € | 191 Mrd. € | 4,4 % (Studie: 5,2 % des damaligen BIP) | S. 1–2 |
| dieselbe | dto. | G3a gegen beschlossene Politik | ~2020–2045 | 1,9 Bio. € | 72 Mrd. € | 1,6 % | S. 1–2 |
| Ariadne „Die Energiewende kosteneffizient gestalten“ (2025), Zusammenfassung | Kopernikus-Projekt Ariadne, 27 Partner · gefördert vom BMBF | G2, nur Energiewende-Investitionen | 2025–2045 | 2,4–2,8 Bio. € (M) | 116–131 Mrd. € | 2,6–3,0 % (Studie: „etwa 3,5 %“) | PDF-S. 6 |
| dieselbe | dto. | G3b gegen „Existierende Politiken“ | 2025–2045 | 0,34–0,55 Bio. € (M) | 16–26 Mrd. €; Beharrung 52 | 0,4–0,6 %; Beharrung 1,2 % | PDF-S. 8 |
| Fraunhofer ISE „Update Klimaneutralität 2045“ (Nov. 2021) | Fraunhofer ISE · Geldgeber im Dokument nicht genannt | G3b gegen „keine weitere CO₂-Minderung“ | 2020–2045 | 1,0–3,3 Bio. € (Referenz 2,5) | 38–127 Mrd. € (M) | 0,9–2,9 % (Referenz 2,2 %) | PDF-S. 8, 40–41 |
| **Zum Vergleich: R21-Erklärung (Nov. 2026)** | REPUBLIK21 e. V. · Förderhinweis Presse- und Informationsamt der Bundesregierung | ohne Abgrenzung („Kosten“ / „Investitionskosten“) | „bis 2045“, „zwanzig Jahre“ | 10–13,8 Bio. € | 500–690 Mrd. € (M) | 11,4–15,7 % | Druckseite 3, 12 |

Netz-Zahlen (nur Netze, nicht mit der Tabelle oben summieren):

| Quelle | Auftraggeber | Was | Zeitraum | Summe | Fundstelle |
|---|---|---|---|---|---|
| DIHK „Plan B“ | DIHK | Netze CAPEX + OPEX | 2025–2049 | 1,2 Bio. € | Abb. 8, S. 27 |
| ef.Ruhr mit EWI (Unterauftrag), April 2024 | Netze-Gesellschaft Südwest | ÜN 301 + VN 430, Investition, Kostenbasis 2024 | bis 2045 | 732 Mrd. € | S. 4, 8 |
| BET/EWI-Monitoring 2025 | BMWE | ÜN 440 + VN 235 | bis 2045 | 675 Mrd. € (792 mit VN aus Langfristszenarien) | PDF-S. 13, 79, 93, 99 |
| Bundesrechnungshof 2024 (nach BNetzA) | – | Netzausbau Strom | 2024–2045 | > 460 Mrd. € | Drs. 20/10585 S. 9 |
| NEP 2037/2045 (2025, 2. Entwurf) | Übertragungsnetzbetreiber | nur Übertragungsnetz | bis 2045 | 364–392 Mrd. € | kompakt S. 11–12 |
| R21 | – | „Aus- und Umbau der Netze“ | – / bis 2045 | 2.100 bzw. 740 Mrd. € | Druckseite 3, 10 |

### 8.2 Kernzahl nicht am Original gelesen

Diese Zeilen erscheinen auf der Seite nur als zweite, grau abgesetzte Tabelle mit der
Überschrift „nicht am Original gelesen“ und Konfidenz-Badge C.

| Studie | Herausgeber · Auftraggeber | Größe | Zeitraum | Summe | pro Jahr | % BIP 2024 | gelesen über |
|---|---|---|---|---|---|---|---|
| PwC (2024) „Beschleunigte Investitionen in den Klimaschutz lohnen sich – jetzt auch ökonomisch!“, „Weiter wie bisher“ | PwC Deutschland · Auftraggeber unbekannt | G1 (Investitionen + Energiekosten inkl. Netzentgelte, Umlagen, CO₂-Preis, laut DIW) | bis 2050 (DIW) bzw. 2045 (WD) | 13,3 Bio. € | 512 Mrd. € (26 J., M) bzw. 633 Mrd. € (21 J., M) | 11,7 % bzw. 14,4 % | DIW 38+39/2025; WD 135/24 |
| dieselbe, beschleunigter Pfad | dto. | G1 | dto. | 13,2 Bio. € | ~508 Mrd. € (M) | 11,6 % | DIW 38+39/2025 |
| FAZ-Gastbeitrag 2019 („Pittel, Henning“ laut WD) | – | laut WD „pro Jahr“; laut ifo-Teaser Mehrkosten kumuliert bis 2050 | offen | 500 Mrd. €/a oder 0,5–>3 Bio. € | offen | offen | WD 135/24; Suchtreffer |
| Aurora für EnBW (April 2025) | Aurora Energy Research · Auftraggeber EnBW | G1, nur Stromsystem | bis 2045 | 3,44 Bio. € | ~164 Mrd. € (M) | 3,7 % | Vorbemerkung der Fragesteller in Drs. 21/903 |
| BDI/BCG „Klimapfade 2.0“ (2021) | BCG · Auftraggeber BDI | G3a | 2021–2030 | 0,86 Bio. € | ~86–100 Mrd. € | ~2,0 % | Zitat in WD 151/24, Suchtreffer |
| BDEW/EY Fortschrittsmonitor 2024 | EY · BDEW | G2, nur Energiewirtschaft | bis 2030 / 2035 | 0,72 / ~1,2 Bio. € | – | – | Suchtreffer; WD 135/24 Fn. 8 |
| dena-Leitstudie, Gutachten EWI (2021) | EWI · dena | G2, nur Stromnetz-Leitungen | bis 2045 | 345 Mrd. € | – | – | wörtliches Zitat in WD 151/24 |

## 9. Was vor Veröffentlichung eine Entscheidung braucht

| Nr. | Frage | Vorschlag |
|---|---|---|
| D1 | Soll R21 vor Veröffentlichung Gelegenheit zur Stellungnahme bekommen (13,8 statt 13,3; welche DIHK-Studie; Herleitung der 10)? | ja; Antwort oder Nicht-Antwort auf der Seite vermerken. Das ist der fairste Weg, X01/X02 dauerhaft zu vermeiden |
| D2 | PwC-Studie doch vor Teil 1 lesen (Registrierung durch den Menschen, nicht durch Agenten)? | empfohlen: Akt 3.3 hängt an Konfidenz C. Ohne Lektüre bleiben die Sätze aus Abschnitt 3 |
| D3 | BIP-Bezug: 2024 (Dossiers) oder 2025 (aktuell, R21-nah)? | 2024 für die Studientabelle (Rechnungen geprüft), 2025 nur für die R21-eigene Rechnung in Akt 1.3 |
| D4 | Darf der ifo-Teaser (Q08, C) überhaupt auf die Seite, und wenn ja, nur in der Fußnote? | nur Fußnote oder White Paper |
| D5 | Gehört die Kernkraft-Neubaurechnung (V03, 372–868 Mrd. €) in Teil 1 oder erst in Teil 6? | in Teil 1 nur als Illustration, dass R21 seinen eigenen Pfad zu einem niedrigeren Satz rechnet als das eigene Referenzpapier; die Spanne als Setzung markiert |
| D6 | Klimafolgekosten (V11–V13) in Teil 1? | ja, aber nur als ein Kasten „Kosten des Nicht-Handelns: Untergrenze, nicht addierbar“ |
| D7 | BILD-Autorenname auf der Seite? | nein; Überschrift und Datum genügen, der Text ist nicht gelesen |
| D8 | Der Förderhinweis (S03): Steckbrief oder Story-Text? | nur Steckbrief, gleichrangig mit Auftraggebern der Studien |

## 10. Maschinenlesbarer Freigabe-Datensatz

Der folgende Block ist der einzige ```json-Block dieser Datei. Er trägt
`meta.block = "teil1_data"`. Seiten verwenden **nur** Zahlen aus `zahlen`, je
Erzählschritt nur die IDs aus `schritte[].zahlen`. Alles unter `verworfen` darf auf der
Seite nicht vorkommen. Werte in Mrd. € oder Bio. € wie angegeben; Prozent als Zahl.

```json
{
  "meta": {
    "block": "teil1_data",
    "document": "energiewende/docs/03_teil1_freigabe.md",
    "stand": "2026-11-22",
    "auftrag": "P3-B",
    "bip_bezug": {"id": "bip_de_2024_mrd_eur", "value": 4386.94, "unit": "Mrd. EUR", "source": "eurostat_nama_10_gdp", "note": "Setzung (M) als gemeinsame Basis; BIP 2025 = 4529.71 nur für R21-eigene Rechnung"},
    "status_werte": ["bestätigt", "korrigiert", "verworfen", "Setzung (M)", "nicht prüfbar"],
    "counts": {"bestätigt": 57, "korrigiert": 17, "verworfen": 4, "Setzung (M)": 3, "nicht prüfbar": 6, "summe": 87},
    "nicht_gelesen": [
      {"source": "pwc_2024", "grund": "nur nach Registrierung abrufbar; Entscheidung 22.11.2026: später"},
      {"source": "faz_pittel_2019", "grund": "ifo.de verlangt Browser-Prüfung (nicht umgangen), faz.net nicht freigegeben"}
    ]
  },

  "zahlen": [
    {"id": "r21_kosten_zitat", "value": {"min": 10, "max": 13.8}, "unit": "Bio. EUR", "abgrenzung": "im Papier ohne Abgrenzung; Druckseite 3 'Kosten der Energiewende bis 2045', Druckseite 12 'Investitionskosten'", "source": "r21_erklaerung_2026", "fundstelle": "Druckseite 3 und 12 (PDF-Seite 17), Fn. 5", "confidence": "A", "primaer_gelesen": true, "status": "bestätigt", "claim": ["S04", "S05"]},
    {"id": "r21_bip_vielfaches", "value": {"min": 2.2, "max": 3.0}, "unit": "Jahres-BIP", "abgrenzung": "10 bzw. 13,8 Bio. EUR / BIP 2025 (4.529,71 Mrd. EUR)", "source": "r21_erklaerung_2026", "fundstelle": "Druckseite 12; Eurostat nama_10_gdp 2025", "confidence": "A", "primaer_gelesen": true, "status": "bestätigt", "claim": ["S06"]},
    {"id": "r21_haupttext_zahlen", "value": {"gesamt": 39, "mit_fundstelle": 4, "nur_urheber": 6, "ohne_quelle": 27}, "unit": "Zahlen", "abgrenzung": "Haupttext ohne Factsheets", "source": "dossier_01", "fundstelle": "Abschn. 3.1, Zählung; Prüfbericht 01 K1", "confidence": "A", "primaer_gelesen": true, "status": "bestätigt", "claim": ["S07"]},
    {"id": "wd_kosten_pro_jahr", "value": 500, "unit": "Mrd. EUR pro Jahr", "abgrenzung": "Referat eines FAZ-Gastbeitrags 2019; Abgrenzung im Original nicht geprüft", "source": "wd5_135_24", "fundstelle": "S. 2, Fn. 5", "confidence": "A", "primaer_gelesen": true, "status": "bestätigt", "claim": ["F01", "Q07"]},
    {"id": "wd_kosten_gesamt", "value": 13.3, "unit": "Bio. EUR", "abgrenzung": "Referat PwC 2024; laut WD 151/24 aggregierte Gesamtkosten inkl. Energiekosten; WD: bis 2045", "source": "wd5_135_24", "fundstelle": "S. 2, Fn. 6 (PwC S. 4)", "confidence": "A", "primaer_gelesen": true, "status": "bestätigt", "claim": ["F01", "Q01"]},
    {"id": "r21_untergrenze_herleitung", "value": 10, "unit": "Bio. EUR", "abgrenzung": "Vermutung 500 Mrd. EUR x 20 Jahre; im Papier keine Herleitung", "source": "eigene_rechnung", "fundstelle": "-", "confidence": "M", "primaer_gelesen": false, "status": "Setzung (M)", "claim": ["F07"]},
    {"id": "pwc_wwb_gesamt", "value": 13.3, "unit": "Bio. EUR", "abgrenzung": "laut DIW: Szenario 'Weiter wie bisher', Investitionen 3,9 + Energiekosten 9,4 (inkl. Netzentgelte, Umlagen, CO2-Preis), bis 2050", "source": "diw_wb_2025_38", "fundstelle": "S. 618 (PDF-S. 6), Fn. 30-31", "confidence": "C", "primaer_gelesen": false, "status": "nicht prüfbar", "claim": ["Q05", "Q06"], "pflichtsatz": "Nach der Darstellung des DIW Berlin (Wochenbericht 38+39/2025) ... Die PwC-Studie selbst ist nur nach Registrierung abrufbar; wir haben sie nicht gelesen."},
    {"id": "pwc_wwb_investitionen", "value": 3.9, "unit": "Bio. EUR", "abgrenzung": "wie pwc_wwb_gesamt", "source": "diw_wb_2025_38", "fundstelle": "S. 618", "confidence": "C", "primaer_gelesen": false, "status": "nicht prüfbar", "claim": ["Q05"]},
    {"id": "pwc_wwb_energiekosten", "value": 9.4, "unit": "Bio. EUR", "abgrenzung": "wie pwc_wwb_gesamt", "source": "diw_wb_2025_38", "fundstelle": "S. 618", "confidence": "C", "primaer_gelesen": false, "status": "nicht prüfbar", "claim": ["Q05"]},
    {"id": "pwc_beschleunigt_gesamt", "value": 13.2, "unit": "Bio. EUR", "abgrenzung": "laut DIW: beschleunigter Klimaschutzpfad, Investitionen 5,3 + Energiekosten 7,9, CO2-Preis bis 180 EUR/t bis 2030", "source": "diw_wb_2025_38", "fundstelle": "S. 618, Fn. 30", "confidence": "C", "primaer_gelesen": false, "status": "nicht prüfbar", "claim": ["V06"]},
    {"id": "pittel_bis2050_kumuliert", "value": {"min": 500, "max": 3000}, "unit": "Mrd. EUR", "abgrenzung": "laut ifo-Teaser kumulierte Mehrkosten bis 2050; nur Fußnote", "source": "faz_pittel_2019", "fundstelle": "Suchtreffer ifo.de", "confidence": "C", "primaer_gelesen": false, "status": "nicht prüfbar", "claim": ["Q08"]},
    {"id": "pittel_plausibilitaet_bip2018", "value": {"pro_jahr_pct": 14.5, "kumuliert_min_pct": 0.45, "kumuliert_max_pct": 2.7}, "unit": "% BIP 2018", "abgrenzung": "eigene Rechnung, kein Beleg für den Inhalt des Gastbeitrags", "source": "pruefbericht_02", "fundstelle": "Nr. 5", "confidence": "M", "primaer_gelesen": false, "status": "Setzung (M)", "claim": ["Q09"]},
    {"id": "ise2024_gesamtaufwand", "value": 8.6, "unit": "Bio. EUR", "abgrenzung": "G1, gesamte Energieversorgung 2025-2045; aus Jahreswerten derselben Seite nur 6,7-8,4", "source": "ise_2024", "fundstelle": "PDF-S. 82", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["G05", "G06"]},
    {"id": "ise2024_differenzkosten", "value": {"min": 28, "mid": 54, "max": 85}, "unit": "Mrd. EUR pro Jahr", "abgrenzung": "G3b gegen fortgeschriebenes System 2024; mid Technologieoffen, min Effizienz, max Beharrung/Robust; 'über die nächsten 25 Jahre'", "source": "ise_2024", "fundstelle": "PDF-S. 6, 80-81", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["G05"]},
    {"id": "dihk_systemkosten_2025_2049", "value": {"min": 4.8, "max": 5.4}, "unit": "Bio. EUR", "abgrenzung": "G1 nur Angebotsseite, inkl. Energieimporte 2,0-2,3; ohne Gebäude, Verkehr, Industrie; real 2024, ohne Zinsen", "source": "dihk_planb_2025", "fundstelle": "S. 8, S. 27 Abb. 8", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["G07"]},
    {"id": "dihk_energieimporte_2025_2049", "value": {"min": 2.0, "max": 2.3}, "unit": "Bio. EUR", "abgrenzung": "Teil von dihk_systemkosten", "source": "dihk_planb_2025", "fundstelle": "S. 27 Abb. 8", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["G07"]},
    {"id": "dihk_systemkosten_2025_2034", "value": {"min": 2.1, "max": 2.3}, "unit": "Bio. EUR", "abgrenzung": "Gesamtsystemkosten der nächsten zehn Jahre inkl. Importe", "source": "dihk_planb_2025", "fundstelle": "S. 8, S. 27", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["N02"], "alt": "R21: 2.100 Mrd. EUR Netzkosten"},
    {"id": "dihk_netzkosten_2025_2049", "value": 1.2, "unit": "Bio. EUR", "abgrenzung": "Netze CAPEX + OPEX 2025-2049, rund die Hälfte in den ersten zehn Jahren", "source": "dihk_planb_2025", "fundstelle": "S. 27 Abb. 8; Begleitpapier S. 2", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["N02", "N04"], "alt": "R21 Factsheet B: 1200 Mrd. EUR bis 2034"},
    {"id": "dihk_planb_einsparung", "value": {"min": 530, "max": 910}, "unit": "Mrd. EUR bis 2050", "abgrenzung": "Einsparung eines anders gesteuerten Klimaneutralitätspfads, gleicher Endenergieverbrauch; 11-17 %", "source": "dihk_planb_2025", "fundstelle": "S. 12", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["V10"]},
    {"id": "kfw2026_ksi_brutto", "value": {"min": 5.7, "max": 6.4}, "unit": "Bio. EUR (EUR2024)", "abgrenzung": "G2 2025-2045; ohne Betriebskosten, Importe, Klimafolgen; 'nicht mit den Kosten für Klimaschutz gleichzusetzen'", "source": "kfw_prognos_2026", "fundstelle": "Studie S. 1, S. 14", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["G08"]},
    {"id": "kfw2026_ksi_brutto_pa", "value": {"min": 270, "max": 300}, "unit": "Mrd. EUR pro Jahr", "abgrenzung": "wie kfw2026_ksi_brutto", "source": "kfw_prognos_2026", "fundstelle": "Studie S. 1", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["G08"]},
    {"id": "kfw2026_ksi_netto_pa", "value": {"min": 130, "mid": 145, "max": 153}, "unit": "Mrd. EUR pro Jahr", "abgrenzung": "G3a gegen fossile Referenztechnik; Studie 135-153, Focus 130-150", "source": "kfw_prognos_2026", "fundstelle": "Studie S. 1, 55; Focus 561 S. 3", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["V09"]},
    {"id": "kfw2026_zuwachs_pa", "value": 65, "unit": "Mrd. EUR pro Jahr", "abgrenzung": "zusätzlich zum heutigen Netto-Niveau; 1,5 % BIP", "source": "kfw_prognos_2026", "fundstelle": "Focus 561 S. 1, 3", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["V09"]},
    {"id": "kfw2021_ksi_brutto", "value": 5, "unit": "Bio. EUR", "abgrenzung": "G2, ~2020-2045, 191 Mrd. EUR/a; nur Fokus gelesen", "source": "kfw_fokus_350_2021", "fundstelle": "S. 1-2", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["O01"]},
    {"id": "kfw2021_mehrinvestitionen", "value": 1.9, "unit": "Bio. EUR", "abgrenzung": "G3a gegen Referenz mit beschlossener Politik; 72 Mrd. EUR/a; 1,6 % BIP 2024", "source": "kfw_fokus_350_2021", "fundstelle": "S. 1-2", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["O01"]},
    {"id": "agora_gesamtinvestitionen", "value": 11.3, "unit": "Bio. EUR (real 2023)", "abgrenzung": "G2 2025-2045, 540 Mrd. EUR/a; 72,8 % ohnehin", "source": "agora_2024", "fundstelle": "PDF-S. 11-12", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["G09"]},
    {"id": "agora_mehrinvestitionen_pa", "value": 147, "unit": "Mrd. EUR pro Jahr", "abgrenzung": "G3a gegen fossile Referenztechnik, ohne eingesparte Energie", "source": "agora_2024", "fundstelle": "PDF-S. 12", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["G09"]},
    {"id": "ariadne_investitionen_pa", "value": {"min": 116, "max": 131}, "unit": "Mrd. EUR pro Jahr", "abgrenzung": "G2 nur Energiewende-Investitionen 2025-2045; Studie 'etwa 3,5 % BIP', nachgerechnet 2,6-3,0 %", "source": "ariadne_2025", "fundstelle": "PDF-S. 6", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["G02"]},
    {"id": "ariadne_mehrkosten_pa", "value": {"min": 16, "max": 26, "beharrung": 52}, "unit": "Mrd. EUR pro Jahr", "abgrenzung": "G3b gegen 'Existierende Politiken'; 16 bottom-up, 26 REMIND; Beharrung 52", "source": "ariadne_2025", "fundstelle": "PDF-S. 8", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["V08", "O05"]},
    {"id": "ise2021_mehraufwand", "value": {"min": 1.0, "mid": 2.5, "max": 3.3}, "unit": "Bio. EUR", "abgrenzung": "G3b gegen 'keine weitere Reduzierung der energiebedingten CO2-Emissionen' bis 2045; ohne Umweltkosten", "source": "ise_2021", "fundstelle": "PDF-S. 8, 40-41", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["V07"]},
    {"id": "g1_spanne", "value": {"min": 4.8, "max": 13.3}, "unit": "Bio. EUR", "abgrenzung": "G1 ganzes Energiesystem; Obergrenze PwC nur C; Teilabdeckung Strom (Aurora 3,44) separat", "source": "pruefbericht_02", "fundstelle": "Korrektur kernaussage_3_konfidenz", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["G02"], "alt": "Konfidenz A"},
    {"id": "g2_spanne", "value": {"min": 2.4, "max": 11.3}, "unit": "Bio. EUR", "abgrenzung": "G2; Teilabdeckung Energiewirtschaft (BDEW/EY 0,72) separat", "source": "pruefbericht_02", "fundstelle": "Korrektur kernaussage_3_konfidenz", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["G02"], "alt": "5 bis 11,3"},
    {"id": "brutto_anteil_bip_pa", "value": {"min": 4.4, "max": 12.3}, "unit": "% BIP 2024 pro Jahr", "abgrenzung": "G1/G2 ganzes System oder alle Sektoren; mit Teilabgrenzungen ab 2,6", "source": "pruefbericht_02", "fundstelle": "Korrektur kernaussage_4_brutto_bip", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["G04"], "alt": "4,4 bis 12"},
    {"id": "mehrinvestitionen_anteil_bip_pa", "value": {"min": 1.5, "max": 3.5}, "unit": "% BIP 2024 pro Jahr", "abgrenzung": "G3a; KfW 2026 Zuwachs 1,5 bis KfW 2026 netto 3,5", "source": "eigene_rechnung", "fundstelle": "Abschn. 8.1", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["G02"], "alt": "1,5 bis 3,4"},
    {"id": "mehrkosten_anteil_bip_pa", "value": {"min": 0.4, "max": 2.9}, "unit": "% BIP 2024 pro Jahr", "abgrenzung": "G3b; oberer Rand ISE 2021 mit der fossilsten Referenz", "source": "pruefbericht_02", "fundstelle": "Korrektur kernaussage_4_mehrkosten_bip", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["G03"], "alt": "0,4 bis 1,9, ISE 2021 Ausreißer"},
    {"id": "r21_anteil_bip_pa", "value": {"min": 11.4, "max": 15.7}, "unit": "% BIP 2024 pro Jahr", "abgrenzung": "10 bzw. 13,8 Bio. EUR / 20 Jahre / BIP 2024; Division ist Setzung", "source": "eigene_rechnung", "fundstelle": "Abschn. 8.1", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["G12"]},
    {"id": "r21_netz_dihk_zitat", "value": 2100, "unit": "Mrd. EUR", "abgrenzung": "R21-Wortlaut, ohne Fundstelle", "source": "r21_erklaerung_2026", "fundstelle": "Druckseite 3 und 10", "confidence": "A", "primaer_gelesen": true, "status": "bestätigt", "claim": ["N01"]},
    {"id": "r21_netz_ewi_zitat", "value": 740, "unit": "Mrd. EUR", "abgrenzung": "R21-Wortlaut, bis 2045, ÜN + VN", "source": "r21_erklaerung_2026", "fundstelle": "Druckseite 10", "confidence": "A", "primaer_gelesen": true, "status": "korrigiert", "claim": ["N05"], "neu": "efruhr_ewi_netze"},
    {"id": "efruhr_ewi_netze", "value": 732, "unit": "Mrd. EUR", "abgrenzung": "Investition ÜN 301 + VN 430 bis 2045, Kostenbasis 2024; Auftraggeber Netze-Gesellschaft Südwest; EWI im Unterauftrag", "source": "efruhr_ewi_2024", "fundstelle": "S. 2, 4, 8", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["N05"]},
    {"id": "netze_spanne_studien", "value": {"min": 675, "mid": 732, "max": 792}, "unit": "Mrd. EUR", "abgrenzung": "ÜN + VN bis 2045, Investitionen ohne Zinsen", "source": "bet_ewi_2025", "fundstelle": "PDF-S. 13, 79, 93, 99; ef.Ruhr S. 4", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["N06"]},
    {"id": "brh_netzausbau", "value": 460, "unit": "Mrd. EUR (mehr als)", "abgrenzung": "Netzausbau Strom 2024-2045 nach BNetzA, ältere Kostenbasis", "source": "brh_2024", "fundstelle": "BT-Drs. 20/10585 PDF-S. 9 und Abb. 8", "confidence": "A", "primaer_gelesen": true, "status": "bestätigt", "claim": ["N08"]},
    {"id": "nep_uen_kosten", "value": {"nep2023_alt": 323, "nep2023_neu": 440, "nep2025_min": 364, "nep2025_max": 392}, "unit": "Mrd. EUR", "abgrenzung": "nur Übertragungsnetz bis 2045", "source": "nep_2025", "fundstelle": "kompakt PDF-S. 11-12", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["N09"]},
    {"id": "r21_kkw_neubau", "value": 310, "unit": "Mrd. EUR", "abgrenzung": "49,6 GW, 31 EPR; = 6.250 EUR/kW; Preisbasis und Finanzierung nicht angegeben", "source": "r21_erklaerung_2026", "fundstelle": "Factsheet B (PDF 15)", "confidence": "A", "primaer_gelesen": true, "status": "bestätigt", "claim": ["V02"]},
    {"id": "wendland_kkw_neubau", "value": 350, "unit": "Mrd. EUR", "abgrenzung": "7.000 EUR/kW 'konservativ', R21-Diskussionspapier", "source": "wendland_2026", "fundstelle": "PDF-S. 3, 16", "confidence": "A", "primaer_gelesen": true, "status": "bestätigt", "claim": ["V02"]},
    {"id": "kkw_neubau_spanne_gebaut", "value": {"min": 372, "mid": 595, "max": 868}, "unit": "Mrd. EUR", "abgrenzung": "49,6 GW x 7.500 / 12.000 / 17.500 EUR/kW; Setzung, keine Aussage über Machbarkeit bis 2045", "source": "eigene_rechnung", "fundstelle": "Dossier 09 neubau_de_capex_eur_kw", "confidence": "M", "primaer_gelesen": false, "status": "Setzung (M)", "claim": ["V03"]},
    {"id": "kkw_erster_block_jahr", "value": {"min": 2040, "mid": 2047, "max": 2056}, "unit": "Jahr", "abgrenzung": "bei Entscheidung 2027, westliche Bauzeiten", "source": "dossier_09", "fundstelle": "Abschn. 2.4; Prüfbericht 09 Nr. 3", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["V04"], "alt": "2038-2047"},
    {"id": "klimafolgen_de_2022_2050", "value": {"min": 280, "max": 900}, "unit": "Mrd. EUR", "abgrenzung": "nur Extremwetter in Deutschland, Untergrenze; nicht mit UBA-Sätzen addieren", "source": "hib_411_2024", "fundstelle": "hib 411/2024; DIW 38+39/2025 S. 1", "confidence": "B", "primaer_gelesen": false, "status": "bestätigt", "claim": ["V11", "V13"]},
    {"id": "uba_klimakosten_2025", "value": {"zeitpraeferenz_1pct": 345, "zeitpraeferenz_0pct": 990}, "unit": "EUR2025 pro t CO2", "abgrenzung": "globale Schäden je Tonne, Methodenkonvention 4.0", "source": "uba_klimakosten_2026", "fundstelle": "Tabelle 06.07.2026, S. 1", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["V12"]},
    {"id": "beharrung_aufschlag_pct", "value": {"min": 16, "max": 235}, "unit": "% Mehrkosten gegenüber Basisszenario", "abgrenzung": "ISE 2021 +16 bis +32, ISE 2024 +30 bis +57, Ariadne +225 bis +235 (bottom-up)", "source": "pruefbericht_02", "fundstelle": "Nr. 24", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["O02"], "alt": "30 bis 100"},
    {"id": "eeg_bundeszuschuss_2024", "value": 18.49, "unit": "Mrd. EUR", "abgrenzung": "Zahlung des Bundeshaushalts auf das EEG-Konto 2024", "source": "btd_20_14522", "fundstelle": "S. 1", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["O06"]},
    {"id": "china_anteil_pv_extra_eu", "value": {"2015": 38, "2025": 98}, "unit": "% der Extra-EU-Einfuhren (Wert)", "abgrenzung": "PV-Module und -Zellen; Ende der EU-Mindestimportpreise 2018", "source": "eurostat_comext", "fundstelle": "Dossier 07 Tab. 3.1", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["R01", "R02"]},
    {"id": "china_anteil_liion_extra_eu", "value": {"2015": 29, "2025": 90}, "unit": "% der Extra-EU-Einfuhren (Wert)", "abgrenzung": "HS 850760, auch Nicht-Energiewende-Verwendung", "source": "eurostat_comext", "fundstelle": "Dossier 07 Tab. 3.1", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["R01"]},
    {"id": "industrieproduktion_de_2025", "value": {"ggue_2018_pct": -15.0, "ggue_2019_pct": -12.2}, "unit": "% Produktionsindex", "abgrenzung": "Bergbau, Verarbeitendes Gewerbe, Energie (B-D), kalenderbereinigt; Mengen, nicht Wertschöpfung", "source": "eurostat_sts_inpr_a", "fundstelle": "Prüfbericht 10 KA 1", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["R03", "R04"]},
    {"id": "energieintensiv_de_2025_ggue_2019", "value": {"chemie": -17.9, "glas_keramik": -20.0, "metall": -15.6, "papier": -18.2}, "unit": "% Produktionsindex", "abgrenzung": "C20, C23, C24, C17", "source": "eurostat_sts_inpr_a", "fundstelle": "Prüfbericht 10 KA 1", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["R03"]},
    {"id": "industriestrom_de_eu", "value": {"2019s1_de": 13.1, "2019s1_eu": 10.5, "2026s1_de": 17.4, "2026s1_eu": 15.6}, "unit": "ct/kWh ohne MwSt", "abgrenzung": "Band 2.000-19.999 MWh; Abstand 2019 +25 %, 2026 +11,7 %", "source": "eurostat_nrg_pc_205", "fundstelle": "Prüfbericht 10 KA 3", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["R06"]},
    {"id": "haushaltsstrom_de_eu_2026s1", "value": {"de": 36.2, "eu": 28.3}, "unit": "ct/kWh inkl. Steuern", "abgrenzung": "Band 2.500-4.999 kWh", "source": "eurostat_nrg_pc_204", "fundstelle": "Prüfbericht 10 KA 3", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["R06"]},
    {"id": "bundesbank_energiepreis_wertschoepfung", "value": {"industrie_pct": -4.4, "gesamt_pct": -2.1}, "unit": "% Bruttowertschöpfung", "abgrenzung": "Modellrechnung ex ante, dauerhaft mehr als verdoppelte Energiepreise ggü. 2019; keine Zerlegung des beobachteten Rückgangs", "source": "bundesbank_mb_2022_12", "fundstelle": "S. 29-30", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["R07"]},
    {"id": "dunkelflaute_luecke_5tage", "value": {"ziele2030": {"min": 4.8, "mid": 5.7, "max": 7.0}, "bestand_2026_11": {"min": 6.3, "mid": 6.8, "max": 7.5}, "r21": 7.1}, "unit": "TWh", "abgrenzung": "schwächstes 120-h-Fenster je Wetterjahr 2015-2025, 520 TWh Jahresverbrauch; eigene Rechnung auf Messprofilen", "source": "dossier_05", "fundstelle": "K1; Prüfbericht 05 Abschn. 4", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["R08"]},
    {"id": "nep_batterien_2045", "value": {"min": 231, "max": 390}, "unit": "GWh", "abgrenzung": "Speicherdauer 2-2,5 h; daneben 60,6-81,3 GW H2-Kraftwerke (Szenariovorgabe)", "source": "nep_2025", "fundstelle": "Tab. 1 und 8", "confidence": "A", "primaer_gelesen": true, "status": "bestätigt", "claim": ["R09"]},
    {"id": "ets_minderung_seit_2005", "value": -50, "unit": "%", "abgrenzung": "EU-ETS-Sektoren 2005-2024 laut Kommission; R21 D-4 'ca. 51 %' gedeckt", "source": "ec_ets_2025", "fundstelle": "Kommission 04.04.2025", "confidence": "B", "primaer_gelesen": true, "status": "bestätigt", "claim": ["R10", "R11"]},
    {"id": "zew_effekt_ohne_nationale_massnahmen", "value": {"min": 824, "max": 1071}, "unit": "Mrd. EUR Barwert 2028-2048", "abgrenzung": "EU-27, 1,5 % Diskont, Wohlfahrt ohne vermiedene Klimaschäden; 850 steht nicht in der Studie", "source": "zew_rausch_2026", "fundstelle": "S. 3, 15, 16", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["R12"], "alt": "824 bzw. 850 (R21)"},
    {"id": "h2_absicherung_dunkelflaute_inv", "value": {"min": 90, "max": 150}, "unit": "Mrd. EUR", "abgrenzung": "H2-Turbinen + Kavernen für 80-95 TWh, ohne Elektrolyseure; grob", "source": "pruefbericht_05", "fundstelle": "Abschn. 3.1", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["E01"], "alt": "38 / 69 / 111"},
    {"id": "dunkelflaute_insel_de_tage", "value": 109, "unit": "Tage", "abgrenzung": "Deutschland allein, Winter 1995/96, rund ein Drittel der üblichen Wind- und PV-Verfügbarkeit", "source": "diw_fossilfrei_44", "fundstelle": "Transkript 00:45:27-00:46:38", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["E02"], "alt": "fehlte"},
    {"id": "stresstest_china_aufschlag_pct", "value": {"min": 3, "mid": 10, "max": 22}, "unit": "% Anlagenkosten PV", "abgrenzung": "konsistente Modulpreisbasis", "source": "pruefbericht_07", "fundstelle": "Urteil Nr. 2", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["E03"], "alt": "7,5 / 27 / 57"},
    {"id": "kkw_reaktivierung_gw", "value": {"min": 0, "mid": 2.7, "max": 12}, "unit": "GW", "abgrenzung": "mid Isar 2 + Emsland; max Radiant laut Parteiwiedergabe (C)", "source": "pruefbericht_09", "fundstelle": "Abschn. 3 Nr. 1, 2; README-Entscheidung", "confidence": "B", "primaer_gelesen": true, "status": "korrigiert", "claim": ["E04"], "alt": "mid 4,1"}
  ],

  "claims": [
    {"id": "S01", "status": "nicht prüfbar"}, {"id": "S02", "status": "bestätigt"}, {"id": "S03", "status": "bestätigt"}, {"id": "S04", "status": "bestätigt"}, {"id": "S05", "status": "bestätigt"}, {"id": "S06", "status": "bestätigt"}, {"id": "S07", "status": "bestätigt"}, {"id": "S08", "status": "bestätigt"},
    {"id": "F01", "status": "bestätigt"}, {"id": "F02", "status": "bestätigt"}, {"id": "F03", "status": "bestätigt"}, {"id": "F04", "status": "bestätigt"}, {"id": "F05", "status": "bestätigt"}, {"id": "F06", "status": "korrigiert"}, {"id": "F07", "status": "Setzung (M)"}, {"id": "F08", "status": "bestätigt"}, {"id": "F09", "status": "bestätigt"}, {"id": "F10", "status": "verworfen"},
    {"id": "Q01", "status": "bestätigt"}, {"id": "Q02", "status": "bestätigt"}, {"id": "Q03", "status": "bestätigt"}, {"id": "Q04", "status": "korrigiert"}, {"id": "Q05", "status": "nicht prüfbar"}, {"id": "Q06", "status": "nicht prüfbar"}, {"id": "Q07", "status": "bestätigt"}, {"id": "Q08", "status": "nicht prüfbar"}, {"id": "Q09", "status": "Setzung (M)"},
    {"id": "G01", "status": "bestätigt"}, {"id": "G02", "status": "korrigiert"}, {"id": "G03", "status": "korrigiert"}, {"id": "G04", "status": "korrigiert"}, {"id": "G05", "status": "bestätigt"}, {"id": "G06", "status": "bestätigt"}, {"id": "G07", "status": "bestätigt"}, {"id": "G08", "status": "bestätigt"}, {"id": "G09", "status": "bestätigt"}, {"id": "G10", "status": "bestätigt"}, {"id": "G11", "status": "korrigiert"}, {"id": "G12", "status": "bestätigt"}, {"id": "G13", "status": "verworfen"},
    {"id": "N01", "status": "bestätigt"}, {"id": "N02", "status": "korrigiert"}, {"id": "N03", "status": "nicht prüfbar"}, {"id": "N04", "status": "korrigiert"}, {"id": "N05", "status": "korrigiert"}, {"id": "N06", "status": "bestätigt"}, {"id": "N07", "status": "verworfen"}, {"id": "N08", "status": "bestätigt"}, {"id": "N09", "status": "bestätigt"}, {"id": "N10", "status": "bestätigt"},
    {"id": "V01", "status": "bestätigt"}, {"id": "V02", "status": "bestätigt"}, {"id": "V03", "status": "Setzung (M)"}, {"id": "V04", "status": "korrigiert"}, {"id": "V05", "status": "bestätigt"}, {"id": "V06", "status": "nicht prüfbar"}, {"id": "V07", "status": "bestätigt"}, {"id": "V08", "status": "bestätigt"}, {"id": "V09", "status": "bestätigt"}, {"id": "V10", "status": "bestätigt"}, {"id": "V11", "status": "bestätigt"}, {"id": "V12", "status": "bestätigt"}, {"id": "V13", "status": "bestätigt"},
    {"id": "O01", "status": "bestätigt"}, {"id": "O02", "status": "korrigiert"}, {"id": "O03", "status": "bestätigt"}, {"id": "O04", "status": "bestätigt"}, {"id": "O05", "status": "bestätigt"}, {"id": "O06", "status": "bestätigt"}, {"id": "O07", "status": "bestätigt"},
    {"id": "R01", "status": "bestätigt"}, {"id": "R02", "status": "bestätigt"}, {"id": "R03", "status": "bestätigt"}, {"id": "R04", "status": "bestätigt"}, {"id": "R05", "status": "bestätigt"}, {"id": "R06", "status": "bestätigt"}, {"id": "R07", "status": "bestätigt"}, {"id": "R08", "status": "bestätigt"}, {"id": "R09", "status": "bestätigt"}, {"id": "R10", "status": "bestätigt"}, {"id": "R11", "status": "korrigiert"}, {"id": "R12", "status": "korrigiert"}, {"id": "R13", "status": "verworfen"},
    {"id": "E01", "status": "korrigiert"}, {"id": "E02", "status": "korrigiert"}, {"id": "E03", "status": "korrigiert"}, {"id": "E04", "status": "korrigiert"}
  ],

  "schritte": [
    {"id": "1.1", "akt": 1, "kern": "Eine Schlagzeile sagt, Deutschland werde die Energiewende 'nicht überleben', und beruft sich auf ein R21-Papier.", "zahlen": [], "claims": ["S01", "S02", "S03"]},
    {"id": "1.2", "akt": 1, "kern": "Im Papier steht der Satz zweimal: als 'Kosten' und als 'Investitionskosten' von 10 bis 13,8 Billionen.", "zahlen": ["r21_kosten_zitat"], "claims": ["S04", "S05"]},
    {"id": "1.3", "akt": 1, "kern": "R21 rechnet die Summe in Jahres-BIP um; die Rechnung geht auf.", "zahlen": ["r21_kosten_zitat", "r21_bip_vielfaches"], "claims": ["S06", "S08"]},
    {"id": "1.4", "akt": 1, "kern": "Für diese Zahl gibt es genau eine Quelle, Fußnote 5.", "zahlen": ["r21_haupttext_zahlen"], "claims": ["S07"]},
    {"id": "2.1", "akt": 2, "kern": "In der zitierten Kurzinformation steht: 500 Milliarden pro Jahr oder 13,3 Billionen insgesamt.", "zahlen": ["wd_kosten_pro_jahr", "wd_kosten_gesamt"], "claims": ["F01", "F08"]},
    {"id": "2.2", "akt": 2, "kern": "13,8 und die Spanne kommen dort nicht vor; woher die Abweichung kommt, wissen wir nicht.", "zahlen": ["wd_kosten_gesamt", "r21_kosten_zitat", "r21_untergrenze_herleitung"], "claims": ["F02", "F03", "F07"]},
    {"id": "2.3", "akt": 2, "kern": "Die Kurzinformation referiert Studien; die Bundesregierung hat keine eigene Gesamtkostenrechnung.", "zahlen": [], "claims": ["F04", "F09"]},
    {"id": "2.4", "akt": 2, "kern": "Sie gibt den Hinweis wieder, dass Kosten nur im Vergleich mit einem System ohne Energiewende vollständig sind.", "zahlen": [], "claims": ["F05", "F06"]},
    {"id": "3.1", "akt": 3, "kern": "Die 13,3 Billionen stammen von PwC, aus einer Studie mit dem Titel '... lohnen sich – jetzt auch ökonomisch!'.", "zahlen": ["wd_kosten_gesamt"], "claims": ["Q01", "Q02"]},
    {"id": "3.2", "akt": 3, "kern": "Es sind Investitionen plus Energiekosten, sagt der Bundestag selbst.", "zahlen": ["wd_kosten_gesamt"], "claims": ["Q03", "Q04"]},
    {"id": "3.3", "akt": 3, "kern": "Laut DIW ist es die Summe für 'Weiter wie bisher', und der Klimaschutzpfad kostet dort fast gleich viel; PwC selbst nicht gelesen.", "zahlen": ["pwc_wwb_gesamt", "pwc_wwb_investitionen", "pwc_wwb_energiekosten", "pwc_beschleunigt_gesamt"], "claims": ["Q05", "Q06", "V06"]},
    {"id": "3.4", "akt": 3, "kern": "Auch die 500 Milliarden haben eine Quelle, die wir nicht lesen konnten.", "zahlen": ["wd_kosten_pro_jahr", "pittel_bis2050_kumuliert", "pittel_plausibilitaet_bip2018"], "claims": ["Q07", "Q08", "Q09"]},
    {"id": "4.1", "akt": 4, "kern": "Kostenstudien messen drei verschiedene Dinge.", "zahlen": [], "claims": ["G01", "G10"]},
    {"id": "4.2", "akt": 4, "kern": "Eine Studie zeigt beide Größen: 8,6 Billionen gesamt, rund 54 Milliarden pro Jahr zusätzlich.", "zahlen": ["ise2024_gesamtaufwand", "ise2024_differenzkosten"], "claims": ["G05", "G06"]},
    {"id": "4.3", "akt": 4, "kern": "Auf gemeinsamer Basis passt R21s Zahl zu den Brutto-Studien, nicht zu den Mehrkosten.", "zahlen": ["g1_spanne", "g2_spanne", "brutto_anteil_bip_pa", "mehrinvestitionen_anteil_bip_pa", "mehrkosten_anteil_bip_pa", "r21_anteil_bip_pa", "dihk_systemkosten_2025_2049", "dihk_energieimporte_2025_2049", "kfw2026_ksi_brutto", "kfw2026_ksi_brutto_pa", "agora_gesamtinvestitionen", "agora_mehrinvestitionen_pa", "ariadne_investitionen_pa", "ariadne_mehrkosten_pa", "kfw2021_ksi_brutto", "kfw2021_mehrinvestitionen", "ise2021_mehraufwand", "ise2024_gesamtaufwand", "ise2024_differenzkosten", "kfw2026_ksi_netto_pa", "kfw2026_zuwachs_pa", "bip_de_2024_mrd_eur"], "claims": ["G02", "G03", "G04", "G07", "G08", "G09", "G12"]},
    {"id": "4.4", "akt": 4, "kern": "Dasselbe Muster beim Netz: 2.100 Milliarden sind bei der DIHK die Systemkosten von zehn Jahren.", "zahlen": ["r21_netz_dihk_zitat", "dihk_systemkosten_2025_2034", "dihk_netzkosten_2025_2049", "r21_netz_ewi_zitat", "efruhr_ewi_netze", "netze_spanne_studien", "brh_netzausbau"], "claims": ["N01", "N02", "N03", "N04", "N05", "N06", "N08"]},
    {"id": "5.1", "akt": 5, "kern": "R21 beziffert den eigenen Kurs nicht; seine Zahlen decken nur Kraftwerke ab.", "zahlen": ["r21_kkw_neubau", "wendland_kkw_neubau", "kkw_neubau_spanne_gebaut", "kkw_erster_block_jahr"], "claims": ["V01", "V02", "V03", "V04", "V05"]},
    {"id": "5.2", "akt": 5, "kern": "Gegen ein System ohne weiteren Klimaschutz liegen die Mehrkosten bei 1 bis 3,3 Billionen bis 2045.", "zahlen": ["ise2021_mehraufwand", "ariadne_mehrkosten_pa", "kfw2026_ksi_netto_pa", "kfw2026_zuwachs_pa", "dihk_planb_einsparung", "mehrkosten_anteil_bip_pa", "klimafolgen_de_2022_2050", "uba_klimakosten_2025"], "claims": ["V07", "V08", "V09", "V10", "V11", "V12", "V13", "O07"]},
    {"id": "5.3", "akt": 5, "kern": "Diese niedrigen Zahlen können zu niedrig sein.", "zahlen": ["beharrung_aufschlag_pct", "ariadne_mehrkosten_pa", "brh_netzausbau", "nep_uen_kosten", "eeg_bundeszuschuss_2024", "kfw2021_mehrinvestitionen"], "claims": ["O01", "O02", "O03", "O04", "O05", "O06", "N08", "N09", "N10"]},
    {"id": "5.4", "akt": 5, "kern": "R21 sieht Wichtiges richtig.", "zahlen": ["china_anteil_pv_extra_eu", "china_anteil_liion_extra_eu", "industrieproduktion_de_2025", "energieintensiv_de_2025_ggue_2019", "industriestrom_de_eu", "haushaltsstrom_de_eu_2026s1", "bundesbank_energiepreis_wertschoepfung", "dunkelflaute_luecke_5tage", "nep_batterien_2045", "ets_minderung_seit_2005", "zew_effekt_ohne_nationale_massnahmen"], "claims": ["R01", "R02", "R03", "R04", "R05", "R06", "R07", "R08", "R09", "R10", "R11", "R12", "F09"]},
    {"id": "kasten_korrekturen", "akt": 5, "kern": "Wo wir uns korrigieren mussten, in beide Richtungen.", "zahlen": ["h2_absicherung_dunkelflaute_inv", "dunkelflaute_insel_de_tage", "stresstest_china_aufschlag_pct", "kkw_reaktivierung_gw", "beharrung_aufschlag_pct", "mehrkosten_anteil_bip_pa"], "claims": ["E01", "E02", "E03", "E04", "O02", "G03", "R11", "F10", "R12", "F06"]}
  ],

  "gegenpositionen": ["GP1", "GP2", "GP3", "GP4", "GP5", "GP6", "GP7", "GP8", "GP9", "GP10", "GP11", "GP12"],

  "verworfen": [
    {"id": "faktor_5_bis_30", "claim": "als Mehrkosten um den Faktor 5 bis 30 über allem, was die Studien ausweisen", "grund": "rechnerisch Faktor 4 bis 44; Scheingenauigkeit", "ersatz": "r21_anteil_bip_pa neben mehrkosten_anteil_bip_pa"},
    {"id": "netze_651_732", "value": {"min": 651, "max": 732}, "unit": "Mrd. EUR", "grund": "651 aus keiner Quelle reproduzierbar", "ersatz": "netze_spanne_studien"},
    {"id": "monitoring_widerspruch", "claim": "R21 widerspricht beim Monitoring-Bericht seiner eigenen Quelle (WD S. 1)", "grund": "WD S. 1 betrifft den Bericht der Expertenkommission"},
    {"id": "einziges_industrieland", "claim": "R21 hat recht: Deutschland als einziges Industrieland nutzt EE als Ersatz", "grund": "Ersatz fossiler Erzeugung ist europäisches Muster (Prüfbericht 10 KA 10)"},
    {"id": "mehrkosten_0_4_bis_1_9", "value": {"min": 0.4, "max": 1.9}, "unit": "% BIP", "grund": "ISE 2021 ausgeblendet", "ersatz": "mehrkosten_anteil_bip_pa"},
    {"id": "beharrung_30_100", "value": {"min": 30, "max": 100}, "unit": "%", "grund": "Ariadne-Beharrung +225 %", "ersatz": "beharrung_aufschlag_pct"},
    {"id": "breg_172", "value": 172, "unit": "Mrd. EUR pro Jahr", "grund": "Rechnung der Fragesteller, nicht der Bundesregierung"},
    {"id": "konfidenz_a_spannen", "claim": "Konfidenz A für die Spannen G1-G3", "grund": "Obergrenze G1 (PwC) nur C"},
    {"id": "erster_block_2038", "value": 2038, "unit": "Jahr", "grund": "innerer Widerspruch Dossier 09; 2038 ist Penly 1", "ersatz": "kkw_erster_block_jahr"},
    {"id": "h2_absicherung_38_111", "value": {"min": 38, "mid": 69, "max": 111}, "unit": "Mrd. EUR", "grund": "Speicher nur für ein Ereignis ausgelegt", "ersatz": "h2_absicherung_dunkelflaute_inv"},
    {"id": "stresstest_7_5_27_57", "value": {"min": 7.5, "mid": 27, "max": 57}, "unit": "%", "grund": "inkonsistente Preisbasis", "ersatz": "stresstest_china_aufschlag_pct"}
  ],

  "verbotene_formulierungen": [
    {"id": "X01", "text": "gefälscht / erfunden / gelogen / manipuliert / Fake", "ersatz": "steht so nicht in der Quelle"},
    {"id": "X02", "text": "R21 hat die Zahl aufgerundet / aufgebläht", "ersatz": "In der Quelle steht 13,3."},
    {"id": "X03", "text": "Der Wissenschaftliche Dienst hat falsch referiert / Referatsfehler um den Faktor 30", "ersatz": "Pflichtsatz zu Q08"},
    {"id": "X04", "text": "Die 13,3 Billionen sind das Weiter-wie-bisher-Szenario (ohne 'laut DIW')", "ersatz": "Pflichtsatz zu Q05"},
    {"id": "X05", "text": "PwC zeigt: Klimaschutz kostet nichts / Die Energiewende lohnt sich (als Befund)", "ersatz": "Laut DIW kommen bei PwC beide Pfade auf fast dieselbe Summe."},
    {"id": "X06", "text": "Die Energiewende kostet nur 16 Milliarden im Jahr", "ersatz": "Spanne 0,4-2,9 % des BIP mit Referenz-Angabe"},
    {"id": "X07", "text": "als Mehrkosten um den Faktor 5 bis 30 zu hoch", "ersatz": "Bänder nebeneinander"},
    {"id": "X08", "text": "ISE 2021 ist ein Ausreißer", "ersatz": "am oberen Rand die Studie mit der fossilsten Referenz"},
    {"id": "X09", "text": "Beharrung kostet 30 bis 100 % mehr", "ersatz": "16 bis 235 % mehr"},
    {"id": "X10", "text": "Netzkosten laut Studien 651-732 Mrd. EUR", "ersatz": "675 / 732 / 792 Mrd. EUR"},
    {"id": "X11", "text": "Die Bundesregierung rechnet 172 Mrd. EUR pro Jahr", "ersatz": "weglassen"},
    {"id": "X12", "text": "R21 widerspricht seiner eigenen Quelle beim Monitoring-Bericht", "ersatz": "F09"},
    {"id": "X13", "text": "Die Energieimporte fielen auch ohne Energiewende (gleich hoch) an", "ersatz": "auch ein fossiles System hätte Energieimporte, vermutlich höhere"},
    {"id": "X14", "text": "Als einziges Industrieland ... (als R21-Treffer)", "ersatz": "nicht in Teil 1"}
  ],

  "studien_tabelle": {
    "bip_bezug_mrd_eur": 4386.94,
    "am_original_gelesen": [
      {"studie": "Frontier Economics für DIHK, Plan B (2025)", "auftraggeber": "DIHK", "groesse": "G1 Angebotsseite inkl. Importe", "zeitraum": "2025-2049", "summe_bio_eur": {"min": 4.8, "max": 5.4}, "pro_jahr_mrd_eur": {"min": 192, "max": 216, "setzung": true}, "bip_pct": {"min": 4.4, "max": 4.9}, "zahl_ids": ["dihk_systemkosten_2025_2049"]},
      {"studie": "Fraunhofer ISE, Bundesländer im Transformationsprozess (2024)", "auftraggeber": "keiner; gefördert TRANSDE (BMWK), Ariadne (BMBF)", "groesse": "G1 gesamte Energieversorgung", "zeitraum": "2025-2045", "summe_bio_eur": 8.6, "pro_jahr_mrd_eur": {"value": 410, "setzung": true}, "bip_pct": 9.3, "zahl_ids": ["ise2024_gesamtaufwand"]},
      {"studie": "Fraunhofer ISE (2024)", "auftraggeber": "wie oben", "groesse": "G3b gegen fortgeschriebenes System", "zeitraum": "nächste 25 Jahre", "summe_bio_eur": {"min": 1.1, "max": 1.35, "setzung": true}, "pro_jahr_mrd_eur": {"min": 28, "mid": 54, "max": 85}, "bip_pct": {"min": 0.6, "mid": 1.2, "max": 1.9}, "zahl_ids": ["ise2024_differenzkosten"]},
      {"studie": "Agora Energiewende, Investitionen (2024)", "auftraggeber": "Agora Think Tanks; Geldgeber Stiftungen (C)", "groesse": "G2", "zeitraum": "2025-2045", "summe_bio_eur": 11.3, "pro_jahr_mrd_eur": 540, "bip_pct": 12.3, "zahl_ids": ["agora_gesamtinvestitionen"]},
      {"studie": "Agora Energiewende (2024)", "auftraggeber": "wie oben", "groesse": "G3a gegen fossile Referenztechnik", "zeitraum": "2025-2045", "summe_bio_eur": {"value": 3.1, "setzung": true}, "pro_jahr_mrd_eur": 147, "bip_pct": 3.4, "zahl_ids": ["agora_mehrinvestitionen_pa"]},
      {"studie": "Prognos für KfW (2026)", "auftraggeber": "KfW", "groesse": "G2", "zeitraum": "2025-2045", "summe_bio_eur": {"min": 5.7, "max": 6.4}, "pro_jahr_mrd_eur": {"min": 270, "max": 300}, "bip_pct": {"min": 6.2, "max": 6.8}, "zahl_ids": ["kfw2026_ksi_brutto", "kfw2026_ksi_brutto_pa"]},
      {"studie": "Prognos für KfW (2026)", "auftraggeber": "KfW", "groesse": "G3a netto gegen fossile Referenztechnik", "zeitraum": "2025-2045", "summe_bio_eur": {"min": 2.7, "max": 3.2, "setzung": true}, "pro_jahr_mrd_eur": {"min": 130, "max": 153}, "bip_pct": {"min": 3.0, "max": 3.5}, "zahl_ids": ["kfw2026_ksi_netto_pa"]},
      {"studie": "Prognos für KfW (2026)", "auftraggeber": "KfW", "groesse": "Zuwachs gegenüber heutigem Niveau", "zeitraum": "2025-2045", "summe_bio_eur": {"value": 1.4, "setzung": true}, "pro_jahr_mrd_eur": 65, "bip_pct": 1.5, "zahl_ids": ["kfw2026_zuwachs_pa"]},
      {"studie": "KfW-Fokus 350 (2021), Prognos/Nextra/NKI", "auftraggeber": "KfW", "groesse": "G2", "zeitraum": "~2020-2045", "summe_bio_eur": 5, "pro_jahr_mrd_eur": 191, "bip_pct": 4.4, "zahl_ids": ["kfw2021_ksi_brutto"]},
      {"studie": "KfW-Fokus 350 (2021)", "auftraggeber": "KfW", "groesse": "G3a gegen beschlossene Politik", "zeitraum": "~2020-2045", "summe_bio_eur": 1.9, "pro_jahr_mrd_eur": 72, "bip_pct": 1.6, "zahl_ids": ["kfw2021_mehrinvestitionen"]},
      {"studie": "Ariadne, Szenarien zur Klimaneutralität 2045 (2025)", "auftraggeber": "BMBF (Kopernikus)", "groesse": "G2 nur Energiewende-Investitionen", "zeitraum": "2025-2045", "summe_bio_eur": {"min": 2.4, "max": 2.8, "setzung": true}, "pro_jahr_mrd_eur": {"min": 116, "max": 131}, "bip_pct": {"min": 2.6, "max": 3.0}, "zahl_ids": ["ariadne_investitionen_pa"]},
      {"studie": "Ariadne (2025)", "auftraggeber": "BMBF (Kopernikus)", "groesse": "G3b gegen Existierende Politiken", "zeitraum": "2025-2045", "summe_bio_eur": {"min": 0.34, "max": 0.55, "setzung": true}, "pro_jahr_mrd_eur": {"min": 16, "max": 26, "beharrung": 52}, "bip_pct": {"min": 0.4, "max": 0.6, "beharrung": 1.2}, "zahl_ids": ["ariadne_mehrkosten_pa"]},
      {"studie": "Fraunhofer ISE, Update Klimaneutralität 2045 (2021)", "auftraggeber": "im Dokument nicht genannt", "groesse": "G3b gegen keine weitere CO2-Minderung", "zeitraum": "2020-2045", "summe_bio_eur": {"min": 1.0, "mid": 2.5, "max": 3.3}, "pro_jahr_mrd_eur": {"min": 38, "max": 127, "setzung": true}, "bip_pct": {"min": 0.9, "mid": 2.2, "max": 2.9}, "zahl_ids": ["ise2021_mehraufwand"]},
      {"studie": "Zum Vergleich: R21-Erklärung (2026)", "auftraggeber": "REPUBLIK21 e. V.; Förderhinweis Bundespresseamt", "groesse": "ohne Abgrenzung", "zeitraum": "bis 2045 / zwanzig Jahre", "summe_bio_eur": {"min": 10, "max": 13.8}, "pro_jahr_mrd_eur": {"min": 500, "max": 690, "setzung": true}, "bip_pct": {"min": 11.4, "max": 15.7}, "zahl_ids": ["r21_kosten_zitat", "r21_anteil_bip_pa"]}
    ],
    "nicht_am_original_gelesen": [
      {"studie": "PwC (2024), Weiter wie bisher", "auftraggeber": "unbekannt", "groesse": "G1 inkl. Energiekosten mit Netzentgelten, Umlagen, CO2-Preis (laut DIW)", "zeitraum": "bis 2050 (DIW) bzw. 2045 (WD)", "summe_bio_eur": 13.3, "pro_jahr_mrd_eur": {"26_jahre": 512, "21_jahre": 633, "setzung": true}, "bip_pct": {"26_jahre": 11.7, "21_jahre": 14.4}, "confidence": "C", "gelesen_ueber": "DIW 38+39/2025; WD 135/24"},
      {"studie": "PwC (2024), beschleunigt", "auftraggeber": "unbekannt", "groesse": "G1", "zeitraum": "wie oben", "summe_bio_eur": 13.2, "pro_jahr_mrd_eur": {"value": 508, "setzung": true}, "bip_pct": 11.6, "confidence": "C", "gelesen_ueber": "DIW 38+39/2025"},
      {"studie": "FAZ-Gastbeitrag 2019 (Pittel, Henning laut WD)", "auftraggeber": "-", "groesse": "offen", "zeitraum": "offen", "summe": "500 Mrd. EUR/a laut WD oder 0,5 bis über 3 Bio. EUR bis 2050 laut ifo-Teaser", "confidence": "C", "gelesen_ueber": "WD 135/24; Suchtreffer"},
      {"studie": "Aurora für EnBW (2025)", "auftraggeber": "EnBW", "groesse": "G1 nur Strom", "zeitraum": "bis 2045", "summe_bio_eur": 3.44, "pro_jahr_mrd_eur": {"value": 164, "setzung": true}, "bip_pct": 3.7, "confidence": "C", "gelesen_ueber": "Vorbemerkung der Fragesteller, Drs. 21/903"},
      {"studie": "BDI/BCG Klimapfade 2.0 (2021)", "auftraggeber": "BDI", "groesse": "G3a", "zeitraum": "2021-2030", "summe_bio_eur": 0.86, "bip_pct": 2.0, "confidence": "C", "gelesen_ueber": "WD 151/24 (Teilzitat), Suchtreffer"},
      {"studie": "BDEW/EY Fortschrittsmonitor 2024", "auftraggeber": "BDEW", "groesse": "G2 nur Energiewirtschaft", "zeitraum": "bis 2030 / 2035", "summe_bio_eur": {"bis_2030": 0.72, "bis_2035": 1.2}, "confidence": "C", "gelesen_ueber": "Suchtreffer; WD 135/24 Fn. 8"},
      {"studie": "dena-Leitstudie, Gutachten EWI (2021)", "auftraggeber": "dena", "groesse": "G2 nur Stromnetz-Leitungen", "zeitraum": "bis 2045", "summe_bio_eur": 0.345, "confidence": "B", "gelesen_ueber": "wörtliches Zitat in WD 151/24"}
    ]
  },

  "offene_entscheidungen": ["D1 Stellungnahme R21", "D2 PwC vor Veröffentlichung lesen", "D3 BIP-Bezug", "D4 ifo-Teaser nur Fußnote", "D5 Kernkraft-Neubaurechnung in Teil 1", "D6 Klimafolgekosten-Kasten", "D7 BILD-Autor", "D8 Förderhinweis im Steckbrief"],

  "sources": {
    "r21_erklaerung_2026": {"titel": "Erklärung des Expertenrates Klima- und Energiepolitik", "herausgeber": "REPUBLIK21 e. V.", "datum": "2026-11", "url": "https://denkfabrik-r21.de/wp-content/uploads/2026/11/Erklaerung_Expertenrat_R21_November-2026.pdf", "abruf": "2026-11-22", "datei": "quellen/raw/P0/Erklaerung_Expertenrat_R21_2026-11.pdf"},
    "wd5_135_24": {"titel": "Zur Berechnung der Investitionskosten für die Energiewende", "herausgeber": "Wissenschaftliche Dienste des Deutschen Bundestages", "datum": "2024-09-16", "url": "https://www.bundestag.de/resource/blob/1019134/59b54bba98e93b9fecf43013668d86b3/WD-5-135-24-pdf.pdf", "abruf": "2026-11-22", "datei": "quellen/raw/P0/WD-5-135-24.pdf"},
    "wd5_151_24": {"titel": "Zu Einflüssen auf Energiepreise", "herausgeber": "Wissenschaftliche Dienste des Deutschen Bundestages", "datum": "2024-11-22", "datei": "quellen/raw/P1-02/WD-5-151-24.pdf", "manifest": "quellen/manifest_P1-02.json"},
    "diw_wb_2025_38": {"titel": "Wochenbericht 38+39/2025 (Kemfert u. a.)", "herausgeber": "DIW Berlin", "datum": "2025-09", "datei": "quellen/raw/P2-02/diw_wb_2025_38_3.pdf", "manifest": "quellen/manifest_P2-02.json", "hinweis": "Wiedergabe von PwC 2024; Autorin vertritt Klimaschutz als volkswirtschaftlichen Vorteil"},
    "pwc_2024": {"titel": "Beschleunigte Investitionen in den Klimaschutz lohnen sich – jetzt auch ökonomisch!", "herausgeber": "PwC Deutschland", "datum": "2024", "url": "https://www.pwc.de/de/energiewirtschaft/klimaschutzinvestitionen-lohnen-sich.html", "gelesen": false, "grund": "Registrierung"},
    "faz_pittel_2019": {"titel": "Was uns die Energiewende wirklich kosten wird (FAZ-Gastbeitrag, ifo-Fassung)", "herausgeber": "ifo / FAZ", "datum": "2019-07-12", "url": "https://www.ifo.de/medienbeitrag/2019-07-12/was-uns-die-energiewende-wirklich-kosten-wird", "gelesen": false, "grund": "Browser-Prüfung, nicht umgangen"},
    "dihk_planb_2025": {"titel": "Neue Wege für die Energiewende (Plan B)", "herausgeber": "Frontier Economics im Auftrag der DIHK", "datum": "2025-09", "datei": "quellen/raw/P1-02/dihk_planb_studie.pdf", "manifest": "quellen/manifest_P1-02.json"},
    "kfw_prognos_2026": {"titel": "Investitionen für Klimaschutz (Endbericht); KfW-Focus Nr. 561", "herausgeber": "Prognos im Auftrag der KfW; KfW Research", "datum": "2026-06 / 2026-10", "datei": "quellen/raw/P1-02/kfw_prognos_2026_studie.pdf", "manifest": "quellen/manifest_P1-02.json"},
    "kfw_fokus_350_2021": {"titel": "KfW Research Fokus Volkswirtschaft Nr. 350", "herausgeber": "KfW Research", "datum": "2021", "datei": "quellen/raw/P1-02/kfw_fokus_350_2021.pdf"},
    "agora_2024": {"titel": "Investitionen für ein klimaneutrales Deutschland", "herausgeber": "Agora Think Tanks gGmbH", "datum": "2024", "datei": "quellen/raw/P1-02/agora_knde_investitionen_2024.pdf"},
    "ariadne_2025": {"titel": "Die Energiewende kosteneffizient gestalten: Szenarien zur Klimaneutralität 2045 (Zusammenfassung)", "herausgeber": "Kopernikus-Projekt Ariadne", "datum": "2025", "datei": "quellen/raw/P1-02/ariadne_szenarien2025_zusammenfassung.pdf"},
    "ise_2021": {"titel": "Wege zu einem klimaneutralen Energiesystem – Update Klimaneutralität 2045", "herausgeber": "Fraunhofer ISE", "datum": "2021-11", "datei": "quellen/raw/P1-02/ise_wege_update2045_2021.pdf"},
    "ise_2024": {"titel": "Wege zu einem klimaneutralen Energiesystem – Bundesländer im Transformationsprozess", "herausgeber": "Fraunhofer ISE", "datum": "2024-11 (Version 2025-04)", "datei": "quellen/raw/P1-02/ise_wege_bundeslaender_2024.pdf"},
    "btd_21_903": {"titel": "Antwort der Bundesregierung, Drucksache 21/903", "herausgeber": "Deutscher Bundestag", "datum": "2025-07-15", "datei": "quellen/raw/P2-02/btd_21_903.pdf", "manifest": "quellen/manifest_P2-02.json"},
    "brh_2024": {"titel": "Bericht nach § 99 BHO zur Umsetzung der Energiewende, Drucksache 20/10585", "herausgeber": "Bundesrechnungshof / Deutscher Bundestag", "datum": "2024-03-07", "datei": "quellen/raw/P2-02/btd_20_10585_brh.pdf"},
    "efruhr_ewi_2024": {"titel": "Abschätzung der Netzausbaukosten und der resultierenden Netzentgelte bis 2045", "herausgeber": "ef.Ruhr mit EWI (Unterauftrag), für Netze-Gesellschaft Südwest", "datum": "2024-04", "datei": "quellen/raw/P2-02/efruhr_ewi_netzentgelte_2024.pdf"},
    "bet_ewi_2025": {"titel": "Energiewende. Effizient. Machen. (Monitoringbericht)", "herausgeber": "BET / EWI für das BMWE", "datum": "2025-09", "datei": "quellen/raw/P2-02/ewi_bet_effizient_2025.pdf"},
    "nep_2025": {"titel": "Netzentwicklungsplan Strom 2037/2045 (2025), 2. Entwurf, kompakt", "herausgeber": "Übertragungsnetzbetreiber", "datum": "2026", "datei": "quellen/raw/P1-02/nep_2037_2045_v2025_2e_kompakt.pdf"},
    "eurostat_nama_10_gdp": {"titel": "GDP and main components (nama_10_gdp), B1GQ, CP_MEUR", "herausgeber": "Eurostat", "datum": "Stand 2026-11-11", "datei": "quellen/raw/P1-02/eurostat_nama_10_gdp_de.json", "lizenz": "CC BY 4.0"},
    "eurostat_comext": {"titel": "EU trade since 1988 by HS2-4-6 and CN8 (DS-045409)", "herausgeber": "Eurostat", "datum": "Stand 2026-11-13", "manifest": "quellen/manifest_P1-07.json"},
    "eurostat_sts_inpr_a": {"titel": "Production in industry, annual data", "herausgeber": "Eurostat", "manifest": "quellen/manifest_P2-10.json"},
    "eurostat_nrg_pc_204": {"titel": "Electricity prices for household consumers", "herausgeber": "Eurostat", "manifest": "quellen/manifest_P1-10.json"},
    "eurostat_nrg_pc_205": {"titel": "Electricity prices for non-household consumers", "herausgeber": "Eurostat", "manifest": "quellen/manifest_P1-10.json"},
    "bundesbank_mb_2022_12": {"titel": "Monatsbericht Dezember 2022, Kasten Energiekosten und Produktionspotenzial", "herausgeber": "Deutsche Bundesbank", "datum": "2022-12", "datei": "quellen/raw/P2-10/bbk_mb_2022_12.pdf"},
    "btd_20_14522": {"titel": "Drucksache 20/14522 (EEG-Konto)", "herausgeber": "Deutscher Bundestag", "datei": "quellen/raw/P2-10/btd_20_14522.pdf"},
    "ec_ets_2025": {"titel": "EU ETS has reduced emissions in the sectors covered by 50 % since 2005", "herausgeber": "Europäische Kommission", "datum": "2025-04-04", "datei": "quellen/raw/P2-01/ec_ets_50pct_2025-04-04.html"},
    "zew_rausch_2026": {"titel": "Carbon Pricing in the EU and ETS2", "herausgeber": "ZEW Mannheim (Rausch)", "datum": "2026-02-17", "datei": "quellen/raw/P2-01/zew_rausch_2026_carbon_pricing_ets2.pdf"},
    "uba_klimakosten_2026": {"titel": "UBA-Empfehlung zu den Klimakosten (Methodenkonvention 4.0)", "herausgeber": "Umweltbundesamt", "datum": "2026-07-06", "datei": "quellen/raw/P2-02/uba_klimakosten_2026-07-06.pdf"},
    "hib_411_2024": {"titel": "hib 411/2024 (Kosten durch Klimawandelfolgen)", "herausgeber": "Deutscher Bundestag", "datei": "quellen/raw/P1-02/hib_411_2024_klimafolgen.html"},
    "diw_fossilfrei_44": {"titel": "Podcast fossilfrei, Folge 44 (Transkript)", "herausgeber": "DIW Berlin", "datei": "quellen/raw/P2-05/diw_fossilfrei_44_dunkelflaute.pdf"},
    "wendland_2026": {"titel": "Diskussionspapier Kernenergie", "herausgeber": "REPUBLIK21 (A. V. Wendland)", "datum": "2026-10", "datei": "quellen/raw/P1-01/Diskussionspapier_Kernenergie-2.pdf"},
    "dossier_01": {"datei": "research/01_r21_behauptungen.md"},
    "dossier_05": {"datei": "research/05_speicher_dunkelflaute.md"},
    "dossier_09": {"datei": "research/09_referenzpfade.md"},
    "pruefbericht_02": {"datei": "research/pruefung/02_pruefung.md"},
    "pruefbericht_05": {"datei": "research/pruefung/05_pruefung.md"},
    "pruefbericht_07": {"datei": "research/pruefung/07_pruefung.md"},
    "pruefbericht_09": {"datei": "research/pruefung/09_pruefung.md"},
    "eigene_rechnung": {"datei": "dieses Dokument, Abschnitt 8; BIP 2024 aus eurostat_nama_10_gdp"}
  }
}
```
