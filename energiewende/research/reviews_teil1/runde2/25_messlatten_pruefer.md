# Nachprüfung Teil 1 · Rolle 25 · Messlatten-Prüfer (unabhängig)

Auftrag: `energiewende/agents/briefs/P6-E_nachpruefung.md` · Regeln: `agents/REGELN.md`
Messlatte: `docs/01_messlatte.md` v1.1 vom 23.11.2026 (zusätzlich gewertet nach v1.0)
Geprüft am 23.11.2026: `energiewende-1-story.html`, `energiewende-1-belege.html` (gerendert
mit Playwright/Chromium bei 1280 px und 390 px), `docs/03_teil1_freigabe.md`,
`data/teil1_data.json` (Version 2), `scripts/build_teil1_data.py`, Originale unter `quellen/raw/`.
Nicht gelesen: die Berichte der ersten Runde, die Synthese, alles unter `research/reviews_teil1/`
außer diesem Ordner. (Das Build-Skript liest die Synthese selbst ein; für den Nachbau habe
ich die Datei nur dem Skript in einer Arbeitskopie bereitgestellt, nicht gelesen.)

## Urteil in fünf Zeilen

1. Nach v1.0: **17 von 20 Punkten**, ohne K3 **15 von 18**. Nach v1.1: **14 von 16** (ohne K3 und K4), **K3 getrennt: 2 Punkte**, K4 nicht anwendbar.
2. K3-Stichprobe (zwölf Zahlen, Startwert 25): alle zwölf am Original gefunden bzw. nachgerechnet, **keine Abweichung**; zwölf von zwölf prüfbar.
3. Der Datensatz lässt sich aus der Freigabeliste nachbauen: Bis auf den mitwachsenden Block `prozess_protokoll` (Phase 6) kommt dasselbe heraus, und alle eingebauten Prüfungen laufen durch.
4. Punkte verliert Teil 1 an zwei Stellen, die auf der Seite selbst fehlen: Geldgeber und Verantwortliche (K1) sowie ein sichtbarer Weg für Korrekturen von außen (K10). Beides steht nur im Repository.
5. Fünf mittlere Befunde, keiner kritisch. Am schwersten wiegen ein falsches Abzeichen an R21s Untergrenze von 10 Billionen und eine Wertung in V14, die über die Belege hinausgeht.

## Dokumenttyp und Vergleichsgruppe

Teil 1 ist eine **Quellenprüfung ohne eigenes Kostenmodell** (Story, Abschnitt „Grenzen“, L04:
„Teil 1 hat kein eigenes Kostenmodell“). In der Typenliste der Messlatte passt das am ehesten
zu „Gutachten“. Ich werte K6 deshalb nach dem Rechenweg, nicht mit der v1.0-Regel für
Positionspapiere („bekommt bei K6 keine Punkte“). Wer Teil 1 als „Erklärung oder
Positionspapier“ einordnet, kommt nach v1.0 bei K6 auf 0 statt 2 Punkte (dann 15/20 bzw. 13/18).
Diese Einordnung muss der Mensch einmal festlegen (siehe „Entscheidungen“).

## Punktetabelle nach v1.0

| Nr. | Kriterium | Punkte | Fundstelle und Begründung |
|---|---|---|---|
| K1 | Auftraggeber und Finanzierung | **1** | Story „Transparenz“ → „Auftraggeber: Daten-WG Knowledge Kitchen: kein Auftraggeber.“; Fußzeile „erstellt mit KI-Agenten (Claude)“; Tabelle „Agentenläufe“. Auf **keiner der beiden Seiten** steht, dass es keine Finanzierung durch Dritte gibt und wer die Verantwortung trägt. Beides steht nur in `TRANSPARENZ.md` Abschn. 9 („keine Finanzierung durch Dritte, bestätigt von Michael“), und die Seite verlinkt die Datei nur. Die Rolle des Menschen erscheint nur nebenbei („Entscheidung: Michael lädt sie hoch“). |
| K2 | Quellenangabe je Zahl | **2** | Jede gerenderte Zahl trägt Q-Nummer und Fundstelle (Story: jeder Absatz mit „Quelle: Q… · Fundstelle“; jede Grafik mit „Werte der Grafik als Tabelle“ und Spalte „Quelle, Fundstelle“; Belege Abschn. 2, „Zahlen und Herkunft“ je Aussage). Schwachstelle (klein): Eigene Rechnungen zeigen in den Grafiktabellen die Fundstelle „Q57 · -“ (Story Akt 2/2, 4/2, 5/1). Der Rechenweg steht aber jeweils hinter der Zahl. |
| K3 | Quellentreue (Stichprobe) | **2** | 12 von 12 ohne Abweichung, Tabelle unten. |
| K4 | Vergleichspfad | **1** | Die Seite nennt die Vergleichspfade der Studien und beziffert deren Mehrkosten und Mehrinvestitionen (Story Akt 4/3, 5/2; Belege Abschn. 3, Spalte Systemgrenze und Referenz). Einen eigenen Referenzpfad beziffert Teil 1 nicht: Die Grafik „Vergleich zweier Pfade“ (Akt 2/4) ist ausdrücklich „noch leer“, R21s eigener Pfad ist nur in Teilen beziffert (Akt 5/1). |
| K5 | Kostenabgrenzung | **2** | Größen G1/G2/G3a/G3b mit Glossar (Akt 4/1, „Begriffe“). Studientabelle mit Systemgrenze, Zeitraum, Preisbasis und Abzinsung je Studie (Belege Abschn. 3; Datensatz `studien[].preisbasis`, `abgezinst`). Abzinsung im Vorspann („Die Billionen-Summen sind einfache Summen über die Jahre …“). |
| K6 | Reproduzierbarkeit | **2** | Datensatz `data/teil1_data.json` und Freigabeliste verlinkt (Story „Im Repository“). Jede eigene Rechnung hat `rechenweg` und `eingaben` und ist per Klick sichtbar (Belege: „Rechenweg: …“). Nachbau: `build_teil1_data.py` in einer Arbeitskopie erzeugt einen identischen Datensatz bis auf `prozess_protokoll[6]` und meldet „Alle Prüfungen bestanden … Nachrechnung“. Fünf eigene Rechnungen der Stichprobe habe ich von Hand nachgerechnet. Bei Einordnung als Positionspapier gilt v1.0: 0. |
| K7 | Unsicherheit | **2** | Spannen statt Punktwerte. Die tragende eigene Annahme (BIP-Nenner) ist doppelt gerechnet: festes BIP 2024 und wachsendes BIP mit 0,5 bis 3,5 % (Akt 4/3, Tabelle „beide Rechnungen“ mit „Angabe der Studie“). Gründe für höhere und niedrigere Werte mit Belegen in beide Richtungen (Akt 5/3). Kernkraft-Kostenansätze 372/595/868 Mrd. € und Jahreszahlen als Spannen (Akt 5/1). Die Annahmen der Studien selbst sind nicht variiert; das steht offen da (L05). |
| K8 | Gegenpositionen und Grenzen | **2** | 13 Gegenpositionen, darunter sechs Kacheln „Hier hat R21 recht“ und fünf „Mehrkosten können zu niedrig sein“ (Story Akt 5/Schluss, „Gegenpositionen“; Belege Abschn. 5). Grenzen im eigenen Abschnitt (Story „Grenzen“, Belege Abschn. 9). Liste der ungelesenen Quellen (Belege Abschn. 6). |
| K9 | Befund und Forderung getrennt | **2** | Teil 1 stellt keine Forderungen. Befunde und Wertungen sind fast überall getrennt, offene Punkte gehen an Teil 6. Eine Ausnahme ist V14 (Befund M3). |
| K10 | Korrektur- und Versionspraxis | **1** | Sehr gute Änderungsdokumentation: 43 eigene Korrekturen mit altem Wortlaut, Richtung und Beleg (Story „Eigene Fehler“; Belege Abschn. 7), Stand „Datenstand 23.11.2026 · Freigabeliste v2“. Es fehlt ein **offener Korrekturweg** auf der Seite: kein Hinweis, wie Leser Fehler melden, kein Link auf die Versionsgeschichte oder auf v1 („in der Git-Historie“ steht nur im Datensatz, `meta.vorgaenger`). |
| | **Summe** | **17 / 20** | ohne K3: **15 / 18** |

## Punktetabelle nach v1.1

| Nr. | Punkte | Änderung gegenüber v1.0 (Präzisierung) |
|---|---|---|
| K1 | 1 | unverändert (Präz. 4 betrifft nur Auftragsstudien) |
| K2 | 2 | unverändert |
| K3 | **2, getrennt ausgewiesen** | Präz. 1 und 2: Rahmen sind 147 von 180 Zahlen (82 %), Stichprobe 12, prüfbar 12 von 12 (100 %), keine Abweichung |
| K4 | **nicht anwendbar** | Präz. 5: Quellenprüfung ohne eigenes Modell |
| K5 | 2 | unverändert |
| K6 | 2 | Präz. 3: nach Rechenweg; die tragenden eigenen Zahlen sind nachrechenbar, der Datensatz ist nachgebaut |
| K7 | 2 | unverändert |
| K8 | 2 | unverändert |
| K9 | 2 | unverändert |
| K10 | 1 | unverändert |
| **Summe** | **14 / 16** ohne K3 und K4 · K3 = 2 | |

Zum Vergleich steht auf der Belegseite (Abschn. 8, P04): „15 von 18“ nach v1.0. Das ist
dieselbe Summe wie hier ohne K3. Die Zusammensetzung der ersten Wertung kenne ich nicht.

## K3 · Stichprobe

**Rahmen (Präz. 2):** Zahlen aus `data/teil1_data.json`, die auf einer der beiden Seiten
erscheinen: als Platzhalter in Aussagen mit `ort` ≠ „keiner“, in Schritten, Gegenpositionen
oder Glossar, oder als von der Studientabelle erzeugte Zahl. Davon gehören in den Rahmen:
Zitate und Statistiken mit mindestens einer externen Quelle sowie alle eigenen Rechnungen.
Nicht im Rahmen sind Setzungen (`art` = „Setzung“) und Zahlen, die nur auf eigene Dokumente
gestützt sind (Lauf-Protokoll, Synthese, Prüfberichte). Ergebnis: 147 Zahlen.
19 Zahlen des Datensatzes erscheinen auf keiner Seite, zum Beispiel `anteil_bai_eigen`
und `bai_de_2024`.
**Ziehung:** Ids alphabetisch sortiert, `random.Random(25).sample(frame, 12)` (Python 3.13).

| # | Zahl (id) | Wert auf der Seite | Original, Fundstelle | Ergebnis |
|---|---|---|---|---|
| 1 | `pa_dihk_g1` (eigene Rechnung) | 192,0–216,0 Mrd. € pro Jahr (Belege Abschn. 3) | DIHK „Plan B“ PDF-S. 8 (Z. 281) und S. 27 (Z. 1259): „4,8 bis 5,4 Billionen € für den Zeitraum 2025-2049“; 4.800 bzw. 5.400 ÷ 25 = 192 / 216 | stimmt |
| 2 | `ariadne_mehrkosten_pa` | 16–26 Mrd. € pro Jahr, Beharren 52 (Story Akt 5/2) | Ariadne Zusammenfassung PDF-S. 8: „Mehrkosten von 16–26 Mrd. EUR pro Jahr“; „Beharren in Nachfragesektoren … auf 52 Mrd. EUR pro Jahr (Szenario NFhoch)“ | stimmt |
| 3 | `dihk_planb_einsparung` | 530–910 Mrd. € bis 2050, 11–17 % (Akt 5/2) | DIHK PDF-S. 12 (Z. 463–465): „mindestens 530 bis 910 Mrd. € … etwa 11 bis 17 %“; „gleicher Endenergieverbrauch“ Z. 521 | stimmt |
| 4 | `ise2024_zeitraum` | „nächsten 25 Jahre“ (Akt 4/2) | ISE 2024 PDF-S. 6: „im Mittel über die nächsten 25 Jahre auf rund 54 Mrd. € pro Jahr“ | stimmt |
| 5 | `r21_kkw_reaktivierung` | 7 GW, 8,5 Mrd. €, 2032 (Belege) | R21 Factsheet B-3 PDF-S. 15 (Z. 495–496): „ca. 8,5 Mrd € für 7 GW“, „2032 am Netz“; Wendland PDF-S. 11: „Kosten für die insgesamt 7 Gigawatt … 8,5 Milliarden Euro“ (der Datensatz nennt PDF-S. 4 und 10; Seitenangabe um eins verschoben, Wert stimmt) | stimmt (Wert); Fundstelle klein ungenau |
| 6 | `bip_de_2025` | 4.529,71 Mrd. € (Akt 1/3) | Eurostat nama_10_gdp (`quellen/raw/P1-10/gdp_nama.json`), B1GQ, CP_MEUR, DE, 2025 = 4.529.710 Mio. € | stimmt |
| 7 | `ets_minderung_seit_2005` | 50 % (Akt 5, Kachel ETS) | Kommission 04.04.2025 (`P2-01/ec_ets_50pct_2025-04-04.html`): „around 50% below 2005 levels“ | stimmt |
| 8 | `bip_de_2020` | 3.477,67 Mrd. € (Belege, ISE-2021-Zeile) | Eurostat nama_10_gdp, B1GQ, CP_MEUR, DE, 2020 = 3.477.670 Mio. € | stimmt |
| 9 | `wendland_systempreise` | 82 bzw. 105 €/MWh (Akt 5/1) | Wendland PDF-S. 16: „bei 82 Euro pro Megawattstunde, im nur auf EE basierenden System bei 105 EUR/MWh (Quantified Carbon 2025a)“ | stimmt (Zweitquelle korrekt als C ausgewiesen) |
| 10 | `r21_13_3_vielfaches` (eigene Rechnung) | rund 2,9 Jahres-BIP (Akt 2/2) | WD 135/24 S. 2 (Z. 144): „13,3 Billionen Euro“; 13.300 ÷ 4.529,71 = 2,94 | stimmt |
| 11 | `bipfest_kfw2026_zuwachs` (eigene Rechnung) | 1,5 % (Akt 4/3, Tabelle) | KfW-Focus 561 PDF-S. 1 und 3: „additional EUR 65 billion per year or 1.5% of the gross domestic …“; 65 ÷ 4.386,94 = 1,48 | stimmt |
| 12 | `bipwachs_ariadne_g3b` (eigene Rechnung) | 0,2–0,6 % (Akt 4/3, Tabelle) | Eingänge 16/26 (Nr. 2) und BIP 2024. Mittel 2025–2045 bei g = 3,5 % → 16 ÷ Mittel = 0,24 %; bei g = 0,5 % → 26 ÷ Mittel = 0,56 % | stimmt |

Prüfbar 12 von 12, abweichend 0. Bei dieser Stichprobe ist die Wahrscheinlichkeit, keinen
Fehler zu ziehen, bei einer Fehlerquote von 10 % im Rahmen noch rund 28 %. Das Ergebnis
schließt einzelne Fehler also nicht aus, es spricht gegen viele.

## Befunde nach Gewicht

### Kritisch

keine.

### Mittel

**M1 · R21s Untergrenze trägt das Abzeichen „Setzung (M)“.** Story Akt 2/2, Aussage F07:
„Woher die Untergrenze von 10 [Wert: Setzung (M)] Billionen kommt, sagt das Papier nicht.“
In der Grafiktabelle desselben Schritts steht „R21, untere Angabe · 10 Bio. € · Setzung (M) ·
Q57 · -“. Die 10 Billionen sind R21s Zahl (`r21_kosten_zitat|min`, Behauptung, Druckseite 3
und 12). Unsere Setzung ist nur die Herleitung 500 × 20 (`r21_untergrenze_herleitung`).
Leser lesen daraus, die Untergrenze sei unsere Annahme. Das berührt K2 und K3, denn das
Abzeichen gibt die Herkunft falsch an.
*Vorschlag:* In F07 `[[r21_kosten_zitat|min]]` verwenden. In der Grafik die Zeile umbenennen
in „unsere Vermutung: 500 Mrd. × 20 Jahre = 10 Bio. €“ und die Setzung daran hängen;
R21s 10 Billionen als eigene Zeile mit „Behauptung“.

**M2 · Die Messlatte auf der Belegseite vergleicht über Dokumenttypen hinweg und nennt nur v1.0.**
Belege Abschn. 8 (P04) zeigt Teil 1, KfW/Prognos, DIHK/Frontier und R21 in einem Balkenbild,
„15 von 18 … R21 6“. Darunter steht selbst: „Verglichen wird nur innerhalb eines Dokumenttyps“.
Die Messlatte schreibt das im Abschnitt „Verfahren“ vor. Im Bild stehen Studie mit Modell,
Positionspapier und Quellenprüfung nebeneinander, ohne Typ. Außerdem steht nach v1.1 noch
„nicht neu bewertet“.
*Vorschlag:* Je Dokument den Typ dazuschreiben und die Balken nach Typ gruppieren.
v1.1-Werte nachtragen: Teil 1 14/16 ohne K3 und K4, K3 = 2 aus dieser Prüfung. Den
Nenner je Dokument nennen (16 oder 18, je nach K4).

**M3 · V14 zieht einen Schluss, den die zitierten Befunde nicht tragen.** Story Akt 5/2 und
Belege: „Hier hat R21 einen Punkt: Zwei Studien sehen ein Einsparpotenzial … (DIHK und
Frontier, ZEW). Das Geld liegt im Wie der Energiewende, nicht in ihrem Abbruch.“ DIHK
„Plan B“ vergleicht zwei Klimaneutralitätspfade (PDF-S. 12: „bei identischen
Treibhausgasemissionen“). Das ZEW rechnet für die EU (R12c). Keine der beiden rechnet einen
Abbruch, die Seite verweist dafür selbst auf Teil 6. Der zweite Satz ist eine Wertung ohne
Befund (K9) und nimmt Teil 6 vorweg.
*Vorschlag:* Den zweiten Satz ersetzen durch: „Beide rechnen Einsparungen innerhalb eines
Klimapfads; was ein Abbruch kostet oder spart, rechnet keine von beiden, das rechnet Teil 6.“
Beim ZEW „für die EU“ ergänzen.

**M4 · K1: Geldgeber und Verantwortliche fehlen auf der Seite.** Story „Transparenz“ →
„Auftraggeber“ nennt nur „kein Auftraggeber“. `TRANSPARENZ.md` Abschn. 9 sagt mehr
(„keine Finanzierung durch Dritte“, bestätigt vom Menschen).
*Vorschlag:* Den Block auf beiden Seiten ergänzen um „keine Finanzierung durch Dritte;
verantwortlich für Auswahl, Entscheidungen und Freigabe: [Name/Rolle]; die Texte schreiben
KI-Agenten nach Freigabeliste“. Damit gäbe es bei K1 2 Punkte.

**M5 · K10: Kein sichtbarer Korrekturweg, Vorgängerfassung nicht verlinkt.** Die Seiten
dokumentieren Korrekturen vorbildlich (Belege Abschn. 7), sagen aber nicht, wie man einen
Fehler meldet, und verlinken weder v1 noch die Versionsgeschichte (`meta.vorgaenger` steht
nur im Datensatz).
*Vorschlag:* Unter „Transparenz“ einen Satz „Fehler gefunden? …“ mit Kontaktweg
(Impressum-Adresse oder Issue im Repository) und einen Link auf die Git-Historie von
`data/teil1_data.json` bzw. der Freigabeliste. Damit gäbe es bei K10 2 Punkte.

### Klein

- **K-1 · Internes Kürzel und nicht eingelöstes Versprechen.** Story Akt 2/4, Grafik
  „Vergleich zweier Pfade“: Untertitel „noch leer; Akt 5 nimmt die Waage wieder auf (P120)“.
  Akt 5 enthält keine Waage, und „P120“ ist eine Nummer der Arbeitsliste. *Vorschlag:* Das
  Kürzel streichen und den Satz so fassen, dass er stimmt: „Teil 6 füllt die Waage“.
- **K-2 · Doppeltes Minus.** Belege R07: „dämpfen die Wertschöpfung der Industrie um rund
  -4,4 Prozent, insgesamt um rund -2,1 Prozent“. Im Original stehen „– 4,4“ und
  „Gesamteffekt – 2,1“ (Bundesbank MB 12/2022, Tabelle S. 29–30), „dämpfen um“ verlangt den
  Betrag. *Vorschlag:* Den Betrag ausgeben, also `abs()` im Platzhalter, oder umformulieren
  zu „ändern … um -4,4 Prozent“.
- **K-3 · Fundstelle „-“ bei eigenen Rechnungen in Grafiktabellen** (Story Akt 2/2, 4/2, 5/1,
  „Q57 · -“). *Vorschlag:* Stattdessen „Rechenweg: …“ oder die Fundstellen der Eingänge zeigen.
- **K-4 · Zahlen zu Phase 6 sind ein Schnappschuss.** In der Tabelle „Agentenläufe“ steht
  Phase 6 mit 1 Lauf und 462.108 Token. Beim Nachbau aus dem heutigen `agents/PROTOKOLL.md`
  kommen 4 Läufe und 1.692.678 Token heraus. *Vorschlag:* Die Tabelle mit „Stand beim Bau,
  [Datum]“ beschriften oder beim nächsten Bau erneuern.
- **K-5 · Uneinheitliches Zahlenformat.** Industrieproduktion: Story „15,0 Prozent“, Belege
  „15 Prozent“ (GP-Kachel und Belege-Kasten). *Vorschlag:* `dezimalen` je Zahl einheitlich setzen.
- **K-6 · Ungenutzte eigene Rechnung mit abweichendem Ergebnis.** `anteil_bai_eigen` (15,0 bis
  17,0 % der Bruttoanlageinvestitionen) steht im Datensatz, aber auf keiner Seite. Die Seite
  zeigt die Studienangabe 14 bis 16 % (G16). Nachgerechnet: 135 ÷ 898,273 = 15,0 % und
  153 ÷ 898,273 = 17,0 %; der Bezug der Studie ist offenbar ein anderer. *Vorschlag:* Den
  Unterschied in einem Satz erklären oder die Zahl aus dem Datensatz nehmen.

## Was weiterhin fehlt

- Die Wertung nach v1.1 auf der Belegseite, mit Dokumenttyp und getrenntem K3 (M2).
- Auf der Seite selbst: Geldgeber, Verantwortliche und Korrekturweg (M4, M5). Mit diesen
  drei Sätzen käme Teil 1 nach v1.1 auf 16 von 16.
- K4 wird erst mit Teil 6 bewertbar. Die leere Waage in Akt 2/4 bleibt bis dahin ein offenes
  Versprechen (K-1).
- Gleiche Prüftiefe für die fremden Dokumente: K3 für R21, DIHK und KfW/Prognos nach
  Präz. 1 und 2 ist nicht Teil dieses Auftrags.

## Entscheidungen für den Menschen

1. Dokumenttyp von Teil 1 festlegen: „Gutachten/Quellenprüfung“ (so hier gewertet) oder
   „Erklärung“. Davon hängt K6 nach v1.0 ab (2 oder 0 Punkte).
2. Was heißt „Korrekturweg offen“ bei K10? Reicht ein öffentliches Repository, oder braucht
   es eine sichtbare Einladung auf der Seite? Hier ist strenger gewertet (1 Punkt).

## Arbeitsmaterial

Gerenderte Texte und Bildschirmfotos (390 px) liegen im Scratch-Ordner dieser Sitzung,
nicht im Repository. Ergebnis beim Rendern: keine Konsolenfehler, Abrufe nur an den eigenen
Host, keine horizontale Scrollbreite bei 390 px. Die Belegseite ist bei 390 px standardmäßig
zugeklappt (Inhaltsverzeichnis mit Aufklappern).
