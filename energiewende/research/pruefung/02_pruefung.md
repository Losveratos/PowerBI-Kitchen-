# Gegenprüfung Dossier 02 · Kostenstudien

Stand 22.11.2026 · Phase 2 · Auftrag P2 (Gegenprüfung) · Prüfer: Recherche-Agent (Opus),
nicht Autor des Dossiers · Regeln: `agents/REGELN.md`, `agents/briefs/P2_gegenpruefung.md` ·
Manifest: `quellen/manifest_P2-02.json` · Nachrechnung: `scripts/pruefung/p2_02_bip_anteile.py`

Geprüft: `research/02_kostenstudien.md` (Stand 22.11.2026). Alle Primärdokumente der Phase 1
unter `quellen/raw/P1-02/` und `quellen/raw/P0/` wurden an den genannten Stellen erneut
aufgeschlagen. Neu gelesen (Hosts jetzt freigegeben): Bundesrechnungshof-Bericht BT-Drs.
20/10585, Antwort der Bundesregierung BT-Drs. 21/903, ef.Ruhr/EWI 2024 (Netzentgelte),
BET/EWI-Monitoringbericht 2025, EWI „Investitionen der Energiewende bis 2030“ (2024),
UBA-Klimakostentabelle Methodenkonvention 4.0 (6.7.2026) samt UBA-Webseite, DIW
Wochenbericht 38+39/2025 (Kemfert, mit PwC-Abgrenzung), Fraunhofer ISE 2015.

## 1. Urteil in fünf Zeilen

1. Die Zahlen, die das Dossier als „primär gelesen“ führt, stehen fast alle wörtlich an der angegebenen Stelle; die Seitenangaben stimmen. Erfundene oder falsch abgeschriebene Studienwerte wurden nicht gefunden.
2. Die Eigenrechnungen (Jahreswerte, % des BIP 2024) lassen sich bis auf Rundungen (≤ 0,2 Prozentpunkte) unabhängig nachrechnen.
3. Schief sind mehrere **Zusammenfassungen**: Die Spannen in den Kernaussagen 3 und 4 passen nicht zur eigenen Tabelle. Kernaussage 9 stellt die Mehrkosten von Beharrungs-Szenarien deutlich zu niedrig dar („30 bis 100 %“, tatsächlich bis +225 %). ISE 2021 wird als „Ausreißer“ geführt, obwohl drei von vier Szenarien über der genannten Obergrenze liegen. Beide Fehler fallen zugunsten der Energiewende aus.
4. Eine Zuschreibung ist falsch: Die „172 Mrd. €/Jahr“ in Drs. 21/903 rechnen die AfD-Fragesteller, nicht die Bundesregierung. Die Antwort der Bundesregierung selbst (die Studien seien keine „energiewendebedingten Zusatzkosten“) stützt dagegen Kernaussage 3 und fehlt im Dossier.
5. Kernaussagen 1 und 2 (PwC 13,3 Bio. €; Pittel/Henning) bleiben am Original nicht prüfbar. Die Abgrenzung von PwC ist jetzt aber durch eine frei lesbare Quelle (DIW 2025) belegt: Zeitraum bis 2050, Energiekosten inklusive Netzentgelte, Umlagen und CO₂-Preis. Insgesamt ist das Dossier **belastbar in den Einzelzahlen und korrekturbedürftig in vier Verdichtungen**.

## 2. Prüftabelle

Stichprobe Konfidenz B (Regel aus dem Auftrag): 22 B-Parameter, alphabetisch sortiert,
k = ⌊22/10⌋ = 2, jeder zweite ab dem ersten. Das ergibt elf Treffer; die ersten zehn wurden
genommen: `agora_gesamtinvestitionen_bio_eur`, `ariadne_investitionen_mrd_eur_pa`,
`dena_ewi_netzinvestitionen_mrd_eur`, `dihk_planb_einsparung_mrd_eur`,
`dihk_systemkosten_2025_2049_bio_eur`, `ise2021_vermiedene_umweltkosten_bio_eur`,
`ise2024_gesamtaufwand_bio_eur`, `kfw2021_mehrinvestitionen_bio_eur`,
`kfw2026_ksi_netto_mrd_eur_pa`, `klimafolgekosten_de_2022_2050_mrd_eur` (in der Tabelle mit **S**
markiert). Konfidenz A hat nur `bip_de_2024_mrd_eur`.

| # | Parameter / Kernaussage | Wert im Dossier | Geprüfte Fundstelle | Ergebnis | neu: Konfidenz · primaer_gelesen |
|---|---|---|---|---|---|
| 1 | `pwc_gesamtkosten_wwb_bio_eur` (K1) | 13,3 Bio. € = 3,9 Inv. + 9,4 Energie | DIW Wochenbericht 38+39/2025, S. 618 (PDF-S. 6) mit Fn. 31; WD 5-135/24, S. 2, Fn. 6 | **nicht prüfbar** am Original (PwC nur nach Registrierung). Werte sekundär bestätigt; Abgrenzung jetzt belegt: „einheitlicher Betrachtungszeitraum bis 2050“; Energiekosten = „reine Energiebeschaffungskosten, Netzentgelte, Umlagen sowie CO₂-Bepreisung“ (DIW Fn. 30). WD schreibt dagegen „bis zum Jahr 2045“. | C · false |
| 2 | `pwc_gesamtkosten_beschleunigt_bio_eur` (K1) | 13,2 Bio. € = 5,3 + 7,9 | DIW 2025, PDF-S. 6 | **nicht prüfbar** am Original; sekundär bestätigt. DIW Fn. 30: Szenario mit CO₂-Preis bis 180 €/t bis 2030 | C · false |
| 3 | K1: „Weiter wie bisher“ verfehlt Ziel 2045 | — | keine frei lesbare Stelle gefunden (DIW beschreibt nur das beschleunigte Szenario) | **nicht prüfbar** | C · false |
| 4 | K2: WD referiert „500 Mrd. € pro Jahr“ | 500 Mrd. €/Jahr | WD 5-135/24, S. 2, Fn. 5 | **bestätigt** | A · true (eigene Aussage des WD) |
| 5 | `pittel_henning_mehrkosten_bis2050_mrd_eur` (K2) | 500 bis >3.000 Mrd. € kumuliert bis 2050 | ifo.de: Browser-Prüfung („Client Challenge“), nicht umgangen; Websuche ohne Inhaltsauszug | **nicht prüfbar**. Plausibilität: 500–3.000 Mrd. € über 32 Jahre = 0,45–2,7 % des BIP 2018 (Eurostat) und passt damit zum referierten „0,4–2,5 %“; 500 Mrd. €/Jahr wären 14,5 % des BIP 2018 | C · false |
| 6 | K3: Spannen G1 4,8–13,3 · G2 5–11,3 · G3 0,3–3,3 Bio. €, „Konfidenz A“ | s. links | eigene Tabelle Abschnitt 3 des Dossiers | **abweichend**: In der eigenen Tabelle stehen unter G1 auch Aurora 3,44 Bio. € (nur Strom), unter G2 auch Ariadne 2,4–2,8 Bio. € (M) und BDEW/EY 0,72 Bio. €. Die Obergrenze von G1 (PwC) ist nur C. Konfidenz A ist deshalb nicht gedeckt | B · true (Spannen der primär gelesenen Studien) |
| 7 | K4: Brutto 4,4–12 % BIP 2024 | 4,4–12 % | eigene Nachrechnung | **abweichend**: In der eigenen Tabelle reicht die Spanne von 2,6 % (Ariadne; DIHK ohne Importe) über 3,7 % (Aurora) bis 12,3 % (Agora). „4,4–12 %“ gilt nur für die Studien mit ganzem Energiesystem oder allen Sektoren | B · true |
| 8 | K4: Mehrinvestitionen 1,5–3,4 % | 1,5–3,4 % | eigene Nachrechnung | **bestätigt** (1,48–3,42 %; BCG 2,0, KfW 2021 1,6 liegen innerhalb) | B · true |
| 9 | K4: Mehrkosten 0,4–1,9 %, „Ausreißer ISE 2021 Inakzeptanz 2,9 %“ | 0,4–1,9 % | ISE 2021, PDF-S. 8, 41; eigene Nachrechnung | **abweichend**: ISE 2021 Referenz 2.500 Mrd. € = 2,2 %, Beharrung 2.900 = 2,5 %, Inakzeptanz 3.300 = 2,9 % (je ÷ 26 J., BIP 2024). Drei von vier ISE-2021-Szenarien liegen über 1,9 %; die Studie selbst nennt „rund 2,5 % (Referenz)“ | B · true |
| 10 | K5: Kein EWI-Dokument mit „740 Mrd. €“ | — | ef.Ruhr/EWI 2024; BET/EWI 2025 (259 S., Volltextsuche); EWI 2024 „Investitionen bis 2030“ | **bestätigt**: in keinem der drei EWI-Dokumente steht 740 Mrd. € für Netze. Das „740“ in BET/EWI ist ein PV-Wert (740–980 Volllaststunden) | B · true |
| 11 | `efruhr_ewi_netzinvestitionen_mrd_eur` | 732 (ÜN 301, VN 431) | ef.Ruhr/EWI 2024, PDF-S. 4 und 7–8 | **bestätigt**: „ca. 732 Mrd. €“; VN 430 (S. 4) bzw. 431 (S. 8), ÜN 301 aus NEP 2037/2045 (2023, 2. Entwurf); „Kostenbasis entspricht dem Jahr 2024 … keine Inflation“; Auftraggeber Netze-Gesellschaft Südwest (Netze BW) | B · true |
| 12 | BET/EWI 2025: ÜN ~440 (vormals 323) + VN >235 Mrd. € | 440 / 235 | BET/EWI 2025, PDF-S. 13, 79, 93; Auftraggeber BMWE | **bestätigt**. Der Ausgangswert heißt dort „320“ (S. 13) bzw. „etwa 324“ (S. 79), im NEP „rund 323“. VN 235 = 206 Ausbau + 29 Ersatz | B · true |
| 13 | K5/Abschn. 4: „Studien: 651–732 Mrd. € ÜN+VN“ | 651–732 | eigene Nachrechnung | **abweichend**: 651 lässt sich aus keiner genannten Quelle bilden. Belegt sind 675 (BET/EWI 440 + 235), 732 (ef.Ruhr) und 792 (440 + 352 Mrd. € VN aus den Langfristszenarien O45-Strom, BET/EWI PDF-S. 99) | B · true |
| 14 | `dihk_netzkosten_2025_2049_bio_eur` (K6) | 1,2 Bio. € | DIHK-Studie Abb. 8, PDF-S. 27; Begleitpapier S. 2 | **bestätigt** („bis zum Jahr 2049 kumuliert … rund die Hälfte … in den kommenden zehn Jahren“) | B · true |
| 15 | `dihk_systemkosten_2025_2034_bio_eur` (K6) | 2,1–2,3 Bio. € | DIHK PDF-S. 8 und 27 | **bestätigt** (Gesamtsystemkosten der nächsten zehn Jahre) | B · true |
| 16 | K6: R21-Zitate „2.100 Mrd. € Netz“, „1200 Mrd. € bis 2034“ | — | R21-Erklärung, Text-Z. 78, 340–341 (Executive Summary, Kap. 3), Factsheet B | **bestätigt** | B · true |
| 17 | `dihk_systemkosten_2025_2049_bio_eur` (K7, **S**) | 4,8–5,4 Bio. €, davon Importe 2,0–2,3 | DIHK Abb. 8, PDF-S. 27 | **bestätigt**. Die DIHK überschreibt Abb. 8 selbst mit „Gesamtkosten des Energiesystems durch die Energiewende“ | B · true |
| 18 | `dihk_planb_einsparung_mrd_eur` (K7, **S**) | 530–910 Mrd. €, 11–17 % | DIHK PDF-S. 12 | **bestätigt** („mindestens“, „bis zum Jahr 2050“, „etwa 11 bis 17 %“) | B · true |
| 19 | `klimafolgekosten_de_2022_2050_mrd_eur` (K8, **S**) | 280–900 Mrd. € | hib 411/2024 | **bestätigt** (hib; „Untergrenze“). Die Studie selbst wurde nicht gelesen. DIW 2025 (PDF-S. 1) nennt in derselben Größenordnung „800 Mrd. € Klimakosten bis 2050“ (frühe DIW-Projektion) | B · false |
| 20 | `uba_kostensatz_2024_eur_t` (K8) | 300 / 880 €/t | umweltbundesamt.de: 2024er Tabelle 404 (mit und ohne www) | **nicht prüfbar** | C · false |
| 21 | UBA Methodenkonvention 4.0 (Text Abschn. 5) | 0 %: 990–1.240 €/t; 1 %: „niedriger“ | UBA-Tabelle 6.7.2026, S. 1; UBA-Webseite | **bestätigt** und präzisiert: €₂₀₂₅/t CO₂, 1 % Zeitpräferenz 345 (2025) · 350 (2026) · 355 (2027) · 375 (2030) · 485 (2050); 0 %: 990 · 1.000 · 1.010 · 1.050 · 1.240 | B · true (neuer Parameter) |
| 22 | `ise2021_vermiedene_umweltkosten_bio_eur` (K8, **S**) | ~2.000 Mrd. € | ISE 2021, PDF-S. 40–42, Tab. 4 | **bestätigt**; UBA-Sätze 199/201/219/255 €₂₀₂₁/t stehen dort ebenfalls | B · true |
| 23 | `nep2023_kostenanstieg_mrd_eur` (K9) | 323 → 440 Mrd. € | NEP 2025 kompakt, PDF-S. 11 | **bestätigt**. Unerwähnt bleibt: Derselbe NEP senkt die ÜN-Kosten wieder um 50–80 auf 364–392 Mrd. € (PDF-S. 12) | B · true |
| 24 | K9: „Akzeptanz- und Verzögerungsszenarien kosten 30 bis 100 % mehr“ | 30–100 % | Ariadne PDF-S. 8; ISE 2021 PDF-S. 41; ISE 2024 PDF-S. 81 | **abweichend**: Ariadne „Beharren in Nachfragesektoren“ 52 Mrd. €/a gegen 15,5–16 Mrd. € bottom-up = **+225 bis +235 %** (gegen 26 top-down +100 %); ISE 2024 Beharrung/Robust +30 bis +57 %; ISE 2021 Beharrung +16 %, Inakzeptanz +28 bis +32 % | B · true |
| 25 | K10: Geldgeber und Interessen | — | DIHK PDF-S. 3 (Vorwort „Realitätsprüfung“, „Narrativ“); Ariadne PDF-S. 9 (BMBF); ISE 2024 Impressum (TRANSDE/BMWK, Ariadne/BMBF); KfW 2026 (Auftraggeber KfW) | **bestätigt** (Agora-Geldgeber weiter nur C) | B · true |
| 26 | `bip_de_2024_mrd_eur` (A) | 4.386,94 Mrd. € | Rohdatei `quellen/raw/P1-02/eurostat_nama_10_gdp_de.json` (aktualisiert 11.11.2026) | **bestätigt** (4.386.940 Mio. €) | A · true |
| 27 | `agora_gesamtinvestitionen_bio_eur` (**S**) | 11,3 Bio. € | Agora 2024, PDF-S. 11–12 | **bestätigt** (540 Mrd. €/a, 11 %; Ohnehin 393 Mrd. € = 72,8 %; reale Preise 2023) | B · true |
| 28 | `ariadne_investitionen_mrd_eur_pa` (**S**) | 116–131 Mrd. €/a | Ariadne-Zusammenfassung PDF-S. 6 | **bestätigt**; „etwa 3,5 % des BIP 2024“ steht so in der Quelle, nachgerechnet 2,6–3,0 % | B · true |
| 29 | `dena_ewi_netzinvestitionen_mrd_eur` (**S**) | 345 Mrd. € | WD 5-151/24, PDF-S. 16 (Zitat, Fn. 55: EWI S. 125) | **bestätigt** als wörtliches Zitat; das Original ist weiter nicht erreichbar (dena.de 404, ewi.uni-koeln.de 404) | B · false |
| 30 | `ise2024_gesamtaufwand_bio_eur` (**S**) | 8,6 Bio. € | ISE 2024, PDF-S. 82 | **bestätigt**. Hinweis: Aus den Jahreswerten derselben Seite (Investitionen 210–270, Betrieb 110–130 Mrd. €/a × 21 J.) ergeben sich nur 6,7–8,4 Bio. € | B · true |
| 31 | `kfw2021_mehrinvestitionen_bio_eur` (**S**) | 1,9 Bio. €, 72 Mrd. €/a | KfW-Fokus 350, S. 2 | **bestätigt**. Kleiner Rechenfehler in der Dossier-Tabelle: 72/4.386,94 = 1,6 %, nicht 1,7 % | B · true |
| 32 | `kfw2026_ksi_netto_mrd_eur_pa` (**S**) | 145 (130–153) | Prognos-Studie PDF-S. 10 („135 bis 153“); Focus 561 PDF-S. 3 („around EUR 145 billion … EUR 130-150 billion“) | **bestätigt** | B · true |
| 33 | `aurora_gesamtkosten_bio_eur`: „Die Bundesregierung rechnet in Drs. 21/903 linear 172 Mrd. €/Jahr“ | 172 Mrd. €/a (BReg) | BT-Drs. 21/903, S. 1 (Vorbemerkung der Fragesteller) und S. 2 (Antwort) | **abweichend**: 3,44 Bio. € und „Linear gerechnet … 172 Mrd. Euro pro Jahr“ stehen in der **Vorbemerkung der AfD-Fragesteller**. Die Bundesregierung nimmt „keine eigenen Abschätzungen“ vor und erklärt, die Studien von BDI, BDEW und EnBW „stellen keine energiewendebedingten Zusatzkosten dar“ | C · false (Aurora-Zahl); Drs. 21/903: A · true |
| 34 | BRH-Bericht: keine eigene Gesamtkostenzahl, „Kosten klar benennen“ | — | BT-Drs. 20/10585, PDF-S. 2, 9, 41, 44 | **bestätigt**. Das Dossier lässt aber weg: Der BRH nennt **mehr als 460 Mrd. €** Netzausbau-Investitionen 2024–2045 (BNetzA-Schätzung: ÜN mind. 313,7, VN „gut 150“, Presse 250) und wirft dem BMWK vor, mit niedrigen Stromgestehungskosten „ein falsches Bild der tatsächlichen Kosten“ zu erzeugen | A · true (Bericht primär gelesen) |
| 35 | `ise2024_differenzkosten_mrd_eur_pa`, Summe „~1,1 Bio. € (M)“ über 21 J. | 54 Mrd. €/a; 1,1 Bio. € | ISE 2024, PDF-S. 6 und 80–81 | **bestätigt** mit Hinweis: Die Studie schreibt „im Mittel über die nächsten 25 Jahre“ (× 25 = 1,35 Bio. €). Die 21-Jahres-Setzung des Dossiers wird aber durch die Studie selbst gestützt: (54 − 28) × 21 = 546 ≈ „550 Mrd. € bis 2045“ (Effizienz gegen Technologieoffen) | B · true |
| 36 | Gegenpositionen: „2024 laut KfW im Mittel 81 Mrd. € fossile Importe pro Jahr“ | 81 Mrd. €, 2024 | Focus 561, PDF-S. 1 und S. 9, Fn. 35 (Rode 2025) | **abweichend** (geringfügig): ein Mittelwert („most recently averaged“, „Ø 81 Mrd. EUR“) über mehrere Jahre, kein Wert für 2024 | B · true |
| 37 | Klimafolgen: ≥145 Mrd. € Schäden 2000–2021 | 145 Mrd. € (C) | DIW 2025, PDF-S. 1 | **bestätigt** (sekundär; „davon 80 Mrd. € allein seit 2018“) | B · false |
| 38 | Tabelle Brutto: KfW/Prognos 2026 „6,2–7,0 %“ | 6,2–7,0 % | eigene Nachrechnung | **abweichend** (Rundung): 270–300/4.386,94 = 6,2–6,8 % | B · true |

**Zählung:** 38 geprüfte Werte und Aussagen · **25 bestätigt** · **8 abweichend** (Nr. 6, 7, 9,
13, 24, 33, 36, 38) · **5 nicht prüfbar** (Nr. 1, 2, 3, 5, 20).

## 3. Abweichungen im Detail (nach Gewicht)

1. **Beharrungs-Mehrkosten untertrieben (K9, Nr. 24) — zugunsten der Energiewende.** Das
   Dossier schreibt, Akzeptanz- und Verzögerungsszenarien kosteten „30 bis 100 % mehr“. Bei
   Ariadne steigen die Mehrkosten im Szenario NFhoch auf 52 Mrd. €/a. Gegen den
   vergleichbaren Bottom-up-Wert (15,5–16 Mrd. €/a, ebenfalls Summe der Sektormodelle) ist das
   **mehr als das Dreifache (+225 %)**. Die Spanne über alle drei Studien ist +16 % bis +235 %.
   Das trägt die Kernaussage „die niedrigen Mehrkosten könnten zu optimistisch sein“. Weil
   der bisherige Hochlauf von Wärmepumpen und E-Autos eher dem Beharrungs-Szenario gleicht
   (Dossier, Gegenposition 4), ist das die wichtigste Zahl für die Gegenrechnung.
2. **ISE 2021 als „Ausreißer“ (K4, Nr. 9) — zugunsten der Energiewende.** Die Obergrenze der
   Mehrkosten von „1,9 % des BIP“ gilt nur, wenn man ISE 2021 bis auf ein Szenario ausblendet.
   ISE 2021 ist die einzige primär gelesene Studie, die gegen „keine weitere CO₂-Minderung“
   rechnet, also gegen die am ehesten fossile Referenz (vgl. Gegenposition 1 des Dossiers).
   Gerade sie liegt mit 2,2–2,9 % über der Spanne. Hinzu kommt: ISE rechnet mit einem
   BIP 2020 von „etwa 3,806 Billionen €“ (PDF-S. 42). Eurostat weist heute 3.477,67 Mrd. € aus.
   Die Anteile, die die Studie selbst nennt („rund 2,5 %“), sind deshalb eher zu niedrig
   (2.500 Mrd. € ÷ 26 J. ÷ BIP 2020 = 2,8 %). Vorschlag: 0,4 bis 2,9 %, mit dem Satz „am
   oberen Rand die Studie mit der fossilsten Referenz“.
3. **Falsche Urheberschaft der 172 Mrd. €/Jahr (Nr. 33).** In Drs. 21/903 rechnen die
   Fragesteller (AfD) linear über 20 Jahre. Die Bundesregierung macht keine eigene Schätzung,
   hält aber ausdrücklich fest, dass die Studien von BDI, BDEW und EnBW keine
   „energiewendebedingten Zusatzkosten“ messen, weil Ersatzinvestitionen enthalten und
   fossile Einsparungen nicht abgezogen sind (PDF-S. 2). Das ist eine amtliche Bestätigung
   der zentralen These des Dossiers (Kernaussage 3). Sie gehört in die Kernaussagen, und die
   172 Mrd. € gehören den Fragestellern. Zugleich gehört dazu: Die Bundesregierung legt auf
   die Frage nach den Kosten bis 2035 und 2045 **keine Zahl** vor. Das stützt die R21-Kritik
   „es gibt kein Monitoring der Kosten“.
4. **Spannen in K3 und K4 passen nicht zur eigenen Tabelle (Nr. 6, 7).** G1 „4,8–13,3“ und
   G2 „5–11,3 Bio. €“ lassen Aurora (3,44), Ariadne (2,4–2,8) und BDEW/EY (0,72/1,2) weg, die
   das Dossier selbst so einordnet. Für Brutto-Anteile „4,4–12 %“ gilt dasselbe (eigene
   Tabelle: 2,6–12,3 %). Entweder die Teilabdeckungen (nur Strom, nur Energiewirtschaft) als
   eigene Gruppe ausweisen oder die Spannen erweitern. Konfidenz A für K3 ist nicht gedeckt,
   weil die Obergrenze 13,3 nur C hat.
5. **Netzspanne „651–732 Mrd. €“ nicht nachvollziehbar (Nr. 13), BRH-Zahl fehlt (Nr. 34).**
   Belegbar sind 675 (BET/EWI: 440 ÜN + 235 VN aus den Netzausbauplänen), 732 (ef.Ruhr/EWI,
   Preisbasis 2024, ÜN noch auf NEP-2023-Kosten) und 792 (440 + 352 VN aus den
   Langfristszenarien, BET/EWI PDF-S. 99). BET/EWI sagt selbst, die 235 seien „deutlich über“
   und wahrscheinlich zu niedrig (20–25 % der Nieder- und Mittelspannung fehlen, Preissteigerungen
   noch nicht eingerechnet). Der BRH nennt „mehr als 460 Mrd. €“ für 2024–2045 auf älterer
   Kostenbasis. Fazit unverändert: 740 Mrd. € sind als Größenordnung plausibel, eher am
   unteren Rand neuerer Werte; die Zuschreibung an das EWI bleibt ungenau (EWI war bei der
   732 nur Unterauftragnehmer).
6. **PwC-Abgrenzung (Nr. 1–2) — jetzt besser belegt, eine Folge fehlt.** Laut DIW (Fn. 30, 31)
   umfasst die PwC-Rechnung Energiekosten **einschließlich Netzentgelten, Umlagen und
   CO₂-Bepreisung**, „einheitlich bis 2050“. CO₂-Preise sind volkswirtschaftlich Transfers,
   keine Ressourcenkosten. Die 13,3 Bio. € sind also nicht einmal Systemkosten im engen Sinn,
   sondern eher Endkundenausgaben für Energie plus Investitionen. Die DIW-Darstellung ist
   sekundär und stammt von einer Autorin, die Klimaschutz als „volkswirtschaftlichen Vorteil“
   vertritt. Konfidenz bleibt C. Für die Abgrenzung ist sie aber die erste frei lesbare,
   zitierfähige Fundstelle. Der Zeitraum ist umstritten: WD „bis 2045“, DIW und PwC-Webseite
   „bis 2050“. Bei 21 statt 26 Jahren wären es 14,4 statt 11,7 % des BIP pro Jahr.
7. **Kleinere Punkte:** KfW 2021 1,6 statt 1,7 % (Nr. 31); KfW 2026 brutto 6,2–6,8 statt
   6,2–7,0 % (Nr. 38); 81 Mrd. € Importe sind ein Mehrjahresmittel, kein Wert für 2024 (Nr. 36);
   ISE 2024 gibt „über die nächsten 25 Jahre“ an (Nr. 35); in ISE 2024 passen 8,6 Bio. € nicht
   ganz zu den eigenen Jahreswerten (Nr. 30); NEP 2025 senkt die ÜN-Kosten wieder auf
   364–392 Mrd. € (Nr. 23).

## 4. Nachrechnungen

Code: `energiewende/scripts/pruefung/p2_02_bip_anteile.py` (eigene Umsetzung, liest die
Eurostat-Rohdatei der Phase 1; Studienwerte von Hand aus den Primärdokumenten).
Aufruf: `python3 -I energiewende/scripts/pruefung/p2_02_bip_anteile.py`.

| Rechnung | Dossier | Nachgerechnet | Abweichung |
|---|---|---|---|
| BIP 2024 nominal | 4.386,94 Mrd. € | 4.386,94 | 0 % |
| PwC 13,3 ÷ 26 J. | ~512 Mrd. €, 11,7 % | 511,5 · 11,66 % | 0 % |
| Agora 540 Mrd. €/a | 12,3 % | 12,31 % | 0 % |
| ISE 2024 8,6 Bio. ÷ 21 | ~410 · 9,3 % | 409,5 · 9,34 % | 0 % |
| KfW/Prognos 2026 270–300 | 6,2–7,0 % | 6,15–6,84 % | Obergrenze −2,3 % (7,0 → 6,8) |
| KfW 2021 191 / 72 Mrd. € | 4,4 % / 1,7 % | 4,35 % / 1,64 % | 0 % / −3,5 % (1,7 → 1,6) |
| DIHK 4,8–5,4 Bio. ÷ 25 | 192–216 · 4,4–4,9 % | 192–216 · 4,38–4,92 % | 0 % |
| DIHK ohne Importe | 2,8–3,1 Bio. · 2,6–2,8 % | 2,8–3,1 · 2,55–2,83 % | 0 % |
| Aurora 3,44 ÷ 21 | 164 · 3,7 % | 163,8 · 3,73 % | 0 % (Fragesteller: ÷ 20 = 172) |
| Ariadne 116–131 | 2,6–3,0 % | 2,64–2,99 % | 0 % |
| Agora 147 × 21 | ~3,1 Bio. | 3,087 Bio. | 0 % |
| KfW 2026 netto 130–150 × 21 | 2,7–3,2 Bio. | 2,73–3,15 Bio. | 0 % |
| KfW 2026 Zuwachs 65 × 21 | ~1,4 Bio. · 1,5 % | 1,365 Bio. · 1,48 % | 0 % |
| ISE 2021 1,0–3,3 Bio. ÷ 26 | 0,9–2,9 % | 0,88–2,89 % | 0 % |
| ISE 2021 Referenz 2,5 Bio. ÷ 26 | (nicht ausgewiesen) | 2,19 % (BIP 2024) | liegt über der Obergrenze 1,9 % in K4 |
| ISE 2024 54 (28–85) × 21 | ~1,1 (0,6–1,8) Bio. | 1,134 (0,588–1,785) | 0 %; × 25 J. = 1,35 Bio. (+19 %) |
| ISE 2024 Prüfsumme (54 − 28) × 21 | — | 546 Mrd. € | −0,7 % gegen „550 Mrd. €“ der Studie |
| Ariadne 16–26 × 21 | 0,34–0,55 Bio. | 0,336–0,546 | 0 % |
| Pittel/Henning ÷ 32 J. (BIP 2024) | 0,4–2,1 % | 0,36–2,14 % | 0 % |
| Pittel/Henning in % BIP 2018 | „0,4–2,5 %“ (ifo-Teaser, C) | 0,45–2,72 % | passt zur Lesart „kumuliert“ |
| R21 10 / 13,8 Bio. in BIP-Jahren | 2,3- / 3,1-fach; 11–16 %/a | 2,28 / 3,15; 11,4–15,7 % | 0 % |
| Agora Ohnehin-Anteil 393/540 | 72 % | 72,8 % | 0 % |
| DIHK Plan B Anteil | 11–17 % | 9,8–19,0 % je nach Paarung; Quelle nennt 11–17 % | Studie paart min/min, max/max |
| Ariadne NFhoch 52 gegen 16 | (K9: bis +100 %) | +225 % | **K9 zu niedrig** |
| Netze ÜN + VN | 651–732 | 675 / 732 / 792 | **651 nicht reproduzierbar** |

## 5. Einseitigkeit und fehlende Gegenpositionen

Zugunsten der Energiewende verzerrt (Dossier günstiger als die Quelle):

- Beharrungs-Mehrkosten „30–100 %“ statt bis +235 % (Abschnitt 3, Nr. 1).
- ISE 2021 als „Ausreißer“ statt als die Studie mit der fossilsten Referenz und den höchsten
  Mehrkosten (Nr. 2).
- **Bundesrechnungshof** nur mit „nicht auf Kurs“ und „Kosten benennen“ zitiert. Der Bericht
  enthält zwei schärfere Befunde, die fehlen: über 460 Mrd. € Netzinvestitionen bis 2045,
  „in den derzeitigen Strompreisen noch nicht enthalten“ (PDF-S. 44), und den Vorwurf, das
  BMWK erzeuge mit Stromgestehungskosten ohne Systemkosten „außerhalb der Fachöffentlichkeit
  ein falsches Bild der tatsächlichen Kosten der Transformation“ (PDF-S. 9). Dazu kommt, dass
  staatliche Zuschüsse zu Netzentgelten und EEG die Kosten von der Stromrechnung in den
  Haushalt verschieben (PDF-S. 9, 44). Das ist die stärkste amtliche Gegenposition zu
  „niedrige Mehrkosten“ und gehört in Abschnitt „Gegenpositionen“.
- Die Bundesregierung legt in Drs. 21/903 **keine** eigene Kostenzahl vor und hat
  „keinen klar abgrenzbaren … Maßnahmenbestand der Energiewende“ (PDF-S. 6). Das ist ein
  Beleg für die R21-Kritik am fehlenden Kosten-Monitoring.

Zulasten der Energiewende verzerrt oder einseitig ausgelassen:

- Drs. 21/903 bestätigt amtlich, dass Brutto-Investitionsstudien keine Zusatzkosten sind und
  dass vermiedene Importe und Klimaschäden nicht gegengerechnet werden (PDF-S. 2). Im
  Dossier fehlt das; stattdessen wird der Bundesregierung eine Linearrechnung der
  Fragesteller zugeschrieben.
- Gegenposition 3 („Netzkosten laufen davon“, 323 → 440) verschweigt, dass der NEP 2025 im
  2. Entwurf die ÜN-Kosten durch Offshore-Optimierung auf 364–392 Mrd. € senkt (PDF-S. 12).
  BET/EWI nennt für Verteilnetze rund 30 % Einsparpotenzial aus Drittstudien (PDF-S. 13).
- DIW 2025 (PDF-S. 1): 18–25 Mrd. € jährlich vermiedene Importe und 8–12 Mrd. €
  Gesundheitskosten durch erneuerbare Energien. Die Quelle ist erkennbar eine Pro-Position,
  gehört aber neben die Klimafolgekosten.

Neutral, aber für die Abgrenzung wichtig:

- PwC-Energiekosten enthalten CO₂-Preis, Umlagen und Netzentgelte (DIW Fn. 30). Der Vergleich
  „beschleunigt lohnt sich“ hängt damit auch an Transfers und am angenommenen CO₂-Preis
  (bis 180 €/t bis 2030), nicht nur an Ressourcenkosten. Das relativiert beide Lesarten:
  R21s „13,3 Bio. € Investitionskosten“ ist falsch, PwCs „lohnt sich ökonomisch“ ist keine
  volkswirtschaftliche Kosten-Nutzen-Rechnung.
- Die ef.Ruhr/EWI-Studie rechnet über Netzentgelte die **Vollkosten** einschließlich Zinsen
  (PDF-S. 4). Das Dossier sagt unter „Lücken“, keine Studie beziffere Finanzierungskosten.
  Für das Netz gibt es diese Rechnung zumindest methodisch; die Zahl selbst wurde nicht
  ausgewertet.

## 6. Weiterhin nicht erreichbar

| Host | Dokument | Ergebnis |
|---|---|---|
| www.pwc.de | PwC 2024, Studie | Registrierung; nicht versucht (Regel: nicht umgehen) |
| www.ifo.de | Pittel/Henning 2019, ifo-Fassung des FAZ-Gastbeitrags | 200, aber Browser-Prüfung („Client Challenge“, 3.038 Byte); nicht umgangen, Datei gelöscht |
| www.faz.net | FAZ-Gastbeitrag 12.7.2019 | Host nicht freigegeben |
| www.dena.de | EWI-Gutachten zur dena-Leitstudie (`…/211006_DLS_Gutachten_EWI_final.pdf`); Abschlussbericht (`…/2021/dena-Leitstudie_Aufbruch_Klimaneutralitaet_DS.pdf`) | je 404 |
| www.ewi.uni-koeln.de | EWI-Gutachterbericht (`…/2021/10/211005_EWI-Gutachterbericht_dena-Leitstudie-Aufbruch-Klimaneutralitaet.pdf`) | 404 |
| umweltbundesamt.de | UBA-Klimakostentabelle 26.11.2024 (Methodenkonvention 3.2) | 404 |
| www.umweltbundesamt.de | Tabelle 2026 unter der im Dossier genannten URL (ohne Suffix `_1`) | 403; unter der aktuellen URL mit `_1` erreichbar und gelesen |
| auroraer.com | Aurora/EnBW Systemkostenstudie | Host nicht freigegeben |
| web-assets.bcg.com, www.iwkoeln.de, www.mckinsey.com, ey.com, foes.de | BCG, IW, McKinsey, BDEW/EY, FÖS | Hosts nicht freigegeben |
| www.bundesregierung.de | Studie „Kosten durch Klimawandelfolgen“ | Host nicht freigegeben |
| www.bundesrechnungshof.de | Volltext BRH 2024 | nicht nötig: identisch als BT-Drs. 20/10585 auf dserver.bundestag.de gelesen |

## 7. Korrekturen

```json
{
  "dossier": "02_kostenstudien",
  "pruefer": "P2-02",
  "stand": "2026-11-22",
  "korrekturen": [
    {"id": "kernaussage_9_akzeptanz_mehrkosten", "alt": "Akzeptanz- und Verzögerungsszenarien kosten 30 bis 100 % mehr", "neu": "Beharrungs- und Akzeptanzszenarien kosten 16 bis 235 % mehr (ISE 2021 +16 bis +32 %, ISE 2024 +30 bis +57 %, Ariadne NFhoch 52 statt 15,5-16 Mrd. EUR/a bottom-up = +225 %)", "fundstelle": "Ariadne-Zusammenfassung PDF-S. 8; ISE 2021 PDF-S. 41; ISE 2024 PDF-S. 81", "confidence": "B", "primaer_gelesen": true, "begruendung": "Die Dossier-Spanne unterschätzt die Ariadne-Beharrung um den Faktor gut 2; Vergleich Bottom-up gegen Bottom-up."},
    {"id": "kernaussage_4_mehrkosten_bip", "alt": "Mehrkosten nach Abzug eingesparter Energiekosten rund 0,4 bis 1,9 % (Ausreißer nach oben: ISE 2021 Inakzeptanz mit 2,9 %)", "neu": "rund 0,4 bis 2,9 % des BIP 2024; am oberen Rand ISE 2021 (Referenz 2,2 %, Beharrung 2,5 %, Inakzeptanz 2,9 %), die einzige primär gelesene Studie mit einer Referenz ohne weitere CO2-Minderung", "fundstelle": "ISE 2021 PDF-S. 8 und 41; scripts/pruefung/p2_02_bip_anteile.py", "confidence": "B", "primaer_gelesen": true, "begruendung": "Drei von vier ISE-2021-Szenarien liegen über 1,9 %; das ist kein Ausreißer, sondern eine Folge der Referenzwahl."},
    {"id": "kernaussage_4_brutto_bip", "alt": "Brutto-Werte rund 4,4 bis 12 % des BIP 2024", "neu": "Brutto-Werte für das ganze Energiesystem oder alle Sektoren rund 4,4 bis 12,3 %; mit Teilabgrenzungen (nur Strom, nur Energiewende-Investitionen, DIHK ohne Importe) ab 2,6 %", "fundstelle": "Dossier Abschnitt 3, Tabelle Brutto; Nachrechnung", "confidence": "B", "primaer_gelesen": true, "begruendung": "Die Kernaussage passt nicht zur eigenen Tabelle."},
    {"id": "kernaussage_3_konfidenz", "alt": "Konfidenz A für die Spannen; G1 4,8-13,3, G2 5-11,3 Bio. EUR", "neu": "Konfidenz B; G1 3,44 (nur Strom) bzw. 4,8 bis 13,3 Bio. EUR; G2 0,72 (nur Energiewirtschaft) bzw. 2,4 bis 11,3 Bio. EUR", "fundstelle": "Dossier Abschnitt 3; PwC-Obergrenze nur Konfidenz C", "confidence": "B", "primaer_gelesen": true, "begruendung": "Die Obergrenze von G1 ist nicht primär gelesen; Teilabdeckungen der eigenen Tabelle fehlen in der Spanne."},
    {"id": "aurora_gesamtkosten_bio_eur", "alt": "Die Bundesregierung rechnet in Drs. 21/903 linear 172 Mrd. EUR/Jahr", "neu": "Die AfD-Fragesteller rechnen in der Vorbemerkung zu Drs. 21/903 linear 172 Mrd. EUR/Jahr (3,44 Bio. ÷ 20). Die Bundesregierung macht keine eigene Schätzung und stellt fest, dass die Studien von BDI, BDEW und EnBW keine energiewendebedingten Zusatzkosten darstellen", "fundstelle": "BT-Drs. 21/903, S. 1 (Vorbemerkung der Fragesteller), S. 2 (Antwort zu Fragen 1, 2, 4-6)", "confidence": "A", "primaer_gelesen": true, "begruendung": "Falsche Urheberschaft; die Antwort der Bundesregierung stützt Kernaussage 3 und gehört in die Kernaussagen."},
    {"id": "netze_spanne_uen_vn", "alt": "Studien: 651-732 Mrd. EUR ÜN+VN", "neu": "Studien: 675 (BET/EWI 2025: 440 ÜN + 235 VN), 732 (ef.Ruhr/EWI 2024, Preisbasis 2024), 792 (440 ÜN + 352 VN aus den Langfristszenarien); BRH 2024: über 460 Mrd. EUR (2024-2045, BNetzA, ältere Kostenbasis)", "fundstelle": "BET/EWI 2025 PDF-S. 13, 79, 93, 99; ef.Ruhr/EWI PDF-S. 4, 7; BT-Drs. 20/10585 PDF-S. 9, 41, 44", "confidence": "B", "primaer_gelesen": true, "begruendung": "651 ist aus keiner genannten Quelle reproduzierbar."},
    {"id": "efruhr_ewi_netzinvestitionen_mrd_eur", "alt": "confidence C, primaer_gelesen false, Fundstelle Suchtreffer", "neu": "732 Mrd. EUR (VN 430/431, ÜN 301 nach NEP 2037/2045 Version 2023, 2. Entwurf), Kostenbasis 2024 ohne Inflation; Auftraggeber Netze-Gesellschaft Südwest", "fundstelle": "ef.Ruhr/EWI 2024, PDF-S. 4, 7-8", "confidence": "B", "primaer_gelesen": true, "begruendung": "Original jetzt gelesen."},
    {"id": "bet_ewi_netze_2025", "alt": "BET/EWI-Monitoring im Original nicht gelesen (C)", "neu": "ÜN ~440 Mrd. EUR (NEP 2023, vormals 320 bzw. 324), VN rund 235 Mrd. EUR bis 2045 (206 Ausbau + 29 Ersatz), laut Bericht 'deutlich über 235' und wahrscheinlich höher; Auftraggeber BMWE", "fundstelle": "BET/EWI 2025, PDF-S. 13, 79, 93", "confidence": "B", "primaer_gelesen": true, "begruendung": "Original jetzt gelesen."},
    {"id": "brh_netzinvestitionen_mrd_eur", "alt": "(fehlt) BRH: keine eigene Gesamtkostenzahl", "neu": "BRH: Netzausbau 2024-2045 mehr als 460 Mrd. EUR (BNetzA-Schätzung; ÜN mind. 313,7, VN gut 150), in den Strompreisen noch nicht enthalten; Vorwurf an das BMWK, mit Stromgestehungskosten ohne Systemkosten ein 'falsches Bild der tatsächlichen Kosten der Transformation' zu erzeugen", "fundstelle": "BT-Drs. 20/10585, PDF-S. 9, 41, 44", "confidence": "A", "primaer_gelesen": true, "begruendung": "Bericht jetzt primär gelesen; wichtige Gegenposition fehlt im Dossier."},
    {"id": "pwc_gesamtkosten_wwb_bio_eur", "alt": "Zeitraum bis 2045/2050 unklar; Abgrenzung nur aus Suchtreffern", "neu": "13,3 Bio. EUR = 3,9 Investitionen + 9,4 Energiekosten, 'einheitlicher Betrachtungszeitraum bis 2050'; Energiekosten = Energiebeschaffung, Netzentgelte, Umlagen und CO2-Bepreisung (also inklusive Transfers)", "fundstelle": "DIW Wochenbericht 38+39/2025 (Kemfert), S. 618 = PDF-S. 6, Fn. 30-31; WD 5-135/24 S. 2 Fn. 6 nennt dagegen 'bis 2045'", "confidence": "C", "primaer_gelesen": false, "begruendung": "PwC-Original weiter nicht lesbar; frei zugängliche Sekundärquelle belegt die Abgrenzung."},
    {"id": "uba_kostensatz_mk40_eur_t", "alt": "UBA Methodenkonvention 4.0: 0 %-Satz 990-1.240 EUR/t, 1 %-Werte niedriger (C, Fragmente)", "neu": "EUR2025 pro t CO2, 1 % Zeitpräferenz: 345 (2025), 350 (2026), 355 (2027), 375 (2030), 485 (2050); 0 %: 990, 1.000, 1.010, 1.050, 1.240", "fundstelle": "UBA-Tabelle 'UBA-Empfehlung zu den Klimakosten', 6.7.2026, S. 1; UBA-Webseite 'Gesellschaftliche Kosten von Umweltbelastungen'", "confidence": "B", "primaer_gelesen": true, "begruendung": "Tabelle jetzt im Original gelesen."},
    {"id": "klimafolgen_schaeden_2000_2021_mrd_eur", "alt": ">=145 Mrd. EUR, Konfidenz C", "neu": "145 Mrd. EUR realisierte Klimaschäden 2000-2021, davon 80 Mrd. seit 2018", "fundstelle": "DIW Wochenbericht 38+39/2025, PDF-S. 1", "confidence": "B", "primaer_gelesen": false, "begruendung": "Zweite, unabhängig lesbare Sekundärquelle; Originalstudie weiter nicht gelesen."},
    {"id": "kfw2021_mehrinvestitionen_bip_tabelle", "alt": "1,7 % BIP 2024", "neu": "1,6 % BIP 2024 (72 / 4.386,94)", "fundstelle": "Nachrechnung", "confidence": "B", "primaer_gelesen": true, "begruendung": "Rundungsfehler."},
    {"id": "kfw2026_ksi_brutto_bip_tabelle", "alt": "6,2-7,0 % BIP 2024", "neu": "6,2-6,8 % BIP 2024 (270-300 / 4.386,94)", "fundstelle": "Nachrechnung", "confidence": "B", "primaer_gelesen": true, "begruendung": "Rundungsfehler an der Obergrenze."},
    {"id": "kfw_fossile_importe_mrd_eur", "alt": "2024 laut KfW im Mittel 81 Mrd. EUR fossile Importe pro Jahr", "neu": "zuletzt im Mittel rund 81 Mrd. EUR fossile Importe pro Jahr (Mehrjahresmittel nach Rode 2025)", "fundstelle": "KfW Focus 561, PDF-S. 1 und Fn. 35", "confidence": "B", "primaer_gelesen": true, "begruendung": "Kein Jahreswert 2024."},
    {"id": "ise2024_differenzkosten_mrd_eur_pa", "alt": "54 Mrd. EUR/a, 2025-2045; Summe ~1,1 Bio. EUR (M)", "neu": "unverändert, aber mit Hinweis: Studie schreibt 'im Mittel über die nächsten 25 Jahre' (× 25 = 1,35 Bio. EUR); die 21-Jahres-Summe wird durch die Studienangabe 550 Mrd. EUR Einsparung Effizienz bis 2045 gestützt", "fundstelle": "ISE 2024 PDF-S. 6, 80-81", "confidence": "B", "primaer_gelesen": true, "begruendung": "Zeitraumangabe der Studie widersprüchlich; Setzung des Dossiers plausibel."},
    {"id": "nep2023_kostenanstieg_mrd_eur", "alt": "Gegenposition 3: bestätigter NEP von 323 auf rund 440 Mrd. EUR", "neu": "ergänzen: NEP 2025 (2. Entwurf) senkt die ÜN-Investitionen durch Offshore-Optimierung um 50-80 auf 364-392 Mrd. EUR", "fundstelle": "NEP 2037/2045 V2025 2. Entwurf kompakt, PDF-S. 11-12", "confidence": "B", "primaer_gelesen": true, "begruendung": "Gegenposition einseitig ohne die Gegenbewegung im selben Dokument."},
    {"id": "ise2021_bip_bezug", "alt": "ISE 2021: Jahresmittel 1 % bis 3,0-3,5 % des BIP 2020 (Studienangabe übernommen)", "neu": "Hinweis ergänzen: ISE rechnet mit BIP 2020 = 3,806 Bio. EUR; Eurostat 3.477,67 Mrd. EUR; die Anteile der Studie sind dadurch rund 9 % zu niedrig (Referenz 2,8 statt 2,5 %)", "fundstelle": "ISE 2021 PDF-S. 42; Eurostat nama_10_gdp", "confidence": "B", "primaer_gelesen": true, "begruendung": "Bezugsgröße der Studie weicht von der amtlichen Statistik ab."}
  ]
}
```
