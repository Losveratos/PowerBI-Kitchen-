# Speicher, Flexibilität und Dunkelflaute · Dossier P1-05

> Stand Phase 1. Geprüft in `pruefung/05_pruefung.md`; maßgeblich sind die korrigierten Werte in `data/model_params.json`.

Stand 22.11.2026 · Phase 1 · Auftrag `agents/briefs/P1-05_speicher_dunkelflaute.md` ·
Agent P1-05 (Opus) · Quellen mit Prüfsumme in `quellen/manifest_P1-05.json` ·
eigene Auswertungen in `data/p1_05_dunkelflaute.json` und `data/p1_05_factsheet_a.json`
(Skripte `scripts/p1_05_dunkelflaute.py`, `scripts/p1_05_factsheet_a.py`, Begleitdatei
`data/p1_05_README.md`).

Konfidenz: **A** mehrere unabhängige Quellen · **B** eine Quelle · **C** kursiert, nicht geprüft.
„primär“ heißt: Stelle im Originaldokument selbst gelesen. „Setzung (M)“ ist eine eigene Annahme.

## Kernaussagen

1. **Die R21-Rechnung trifft die Energiemenge ungefähr, aber die falsche Technik.**
   Im jeweils schwächsten 5-Tage-Fenster der Jahre 2015–2025 hätten die gesetzlichen
   Ziel-Kapazitäten 2030 bei 520 TWh Jahresverbrauch eine Lücke von **4,8 / 5,7 / 7,0 TWh**
   (min / Median / max) hinterlassen — R21 rechnet mit 7,1 TWh. Die Annahme „Erzeugung null“
   ist falsch, wird aber durch die höhere Winterlast (Faktor 1,02–1,18) teilweise ausgeglichen.
   Der Fehler, der aus Milliarden Billionen macht, ist die Annahme, diese Energie komme
   aus Batterien. (Eigene Rechnung, Setzung (M) für die Hochrechnung · **B**)
2. **Keine offizielle Planung sieht Batterien als Dunkelflauten-Technik vor.** Der
   Netzentwicklungsplan 2037/2045 (2. Entwurf 2026) setzt für 2045 **60,6–81,3 GW
   Wasserstoffkraftwerke** und Batterien mit nur 2 bzw. 2,5 Stunden Speicherdauer
   (zusammen rund **231–390 GWh**, also 3–6 % der R21-Menge). R21 behauptet das Gegenteil
   („die gegenwärtig dafür vorgesehene Technik ist der Batteriespeicher“). (**A**, primär)
3. **Mit Technikmix kostet dieselbe Absicherung einen Bruchteil.** H₂-Gasturbinen für die
   Spitzenlücke (61–77 GW) plus Kavernenspeicher für 10–15 TWh Wasserstoff:
   **38 / 69 / 111 Mrd. €** Investition statt 1.400 Mrd. €. Über den Marktpreis
   gesicherter Leistung aus der ersten StromVKG-Ausschreibung (155.296 €/MW·a) gerechnet:
   **9,4–11,9 Mrd. €/Jahr** gegenüber einer Annuität der R21-Batterie von rund
   **135 Mrd. €/Jahr**. Elektrolyseure, Brennstoff und Netz sind nicht enthalten. (**B**, Setzungen benannt)
4. **„5 Tage“ ist für Wind allein ein jährlich wiederkehrendes Ereignis — aber mit Resterzeugung.**
   Die von R21 zitierte DIW/MCC-Arbeit (Ohlendorf/Schill 2020) misst Wind an Land mit
   Kapazitätsfaktor *im Mittel unter 10 %*, nicht null; sie findet etwa 5 Tage jährlich,
   knapp 8 Tage einmal im Jahrzehnt und schließt, die Sorge sei „möglicherweise überbewertet“.
   Eigene Auswertung 2015–2025 (Wind an Land + See, 6-h-Mittel < 10 %): längste
   Phase je Jahr **120 / 130 / 185 Stunden**. (**A**: eigene Rechnung + Studie über Suchauszug)
5. **Kurze Flauten sind häufig.** Ereignisse über 10 h mit Wind+PV unter 10 % der Leistung:
   **1.422** in 2016–2025 (eigene Rechnung), Uniper meldet 1.435 — unabhängig übereinstimmend.
   Über 48 h: **2–7 je Jahr**, im Mittel 4,0. (**A**, primär)
6. **Batterien wachsen schnell, bleiben aber Stundenspeicher.** Bestand Nov. 2026:
   **22,7 GW / 35,6 GWh**, davon rund 80 % Heimspeicher; Lithium-Großspeicher ≈ 3 GW mit
   ≈ 1,5 h Entladedauer. Anschlussbegehren 2024: 400 GW, zugesagt 25 GW. (**A**/**B**, primär)
7. **Die Langzeit-Seite hinkt.** Elektrolyse ≈ **0,2 GW** installiert gegen 10 GW Ziel 2030
   (KfW: bis 2030 konservativ höchstens 2,4 GW). Umgestellte H₂-Kavernen frühestens 2033,
   neue ab 2035 (Bau bis zu 10 Jahre). Das ist der stärkste Beleg gegen den Hauptpfad. (**B**)
8. **Europa hilft, aber nicht beliebig.** Das extremste europäische Ereignis (Winter 1996/97)
   dauerte 55 Tage bei 47 % der üblichen EE-Verfügbarkeit; der kostenoptimale europäische
   Langzeitspeicherbedarf liegt bei 351 TWh (7 % des Jahresverbrauchs), selbst bei
   unbegrenztem Ausgleich bei 159 TWh — und gesicherte CO₂-freie Erzeugung (etwa Kernkraft)
   senkt ihn nur moderat (Kittel/Roth/Schill 2026). (**B**, Suchauszug)
9. **Netz-Systemkosten: rund 3 Mrd. €/Jahr, kein ungebremster Anstieg.** Netzengpass-
   management 2019: 1,3 Mrd. € → 2022: 4,2 → 2023: 3,3 → 2024: 3,0 → 2025: 3,1 Mrd. €
   (vorläufig). Abregelung EE stabil bei rund 9,4 TWh (≈ 3,5 %). Negative Preisstunden
   steigen: 301 (2023) → 457 (2024) → 576 (2025). (**A**/**B**, primär)
10. **Factsheet A beruft sich auf eine Studie mit gegenteiligem Ergebnis.** „Bischof 2026“
    ist ein Gutachten der RBID GmbH im Auftrag von Deutscher Umwelthilfe und
    Wirtschaftsverband Windkraftwerke; es setzt pauschal 1 kWh Speicher je kW Wind/PV
    (560 GWh, 112 Mrd. €) und kommt zu dem Schluss, Wind und PV seien inklusive Netz und
    Speicher günstiger als neue Gaskraftwerke. (**B**, Suchauszüge; Original nicht abrufbar)

## 1 · Dunkelflaute empirisch

### 1.1 Definitionen

| Definition | Schwelle | Dauer | Quelle | Konf. | primär |
|---|---|---|---|---|---|
| DWD (2018) | < 10 % der Nennleistung Wind+PV | ≥ 48 h | DWD laut stromauskunft.de; strommix `risiken_co2.md` | C | nein |
| Ohlendorf/Schill 2020 („DIW-MCC“) | Kapazitätsfaktor Wind an Land im *Mittel* < 10 % (Mean-below-threshold) | variabel | Environ. Res. Lett. 15 (2020) 084045, laut arXiv-Abstract | B | nein |
| Uniper 2026 | < 10 % der installierten Wind+PV-Leistung, 6-h-Mittel | ≥ 10 h | Uniper-Kurzstudie, referiert in strommix | B | nein |
| Kittel/Schill 2024–2026 | mehrere Schwellen relativ zum langjährigen Mittel, europaweit | variabel | arXiv 2402.06758, 2410.00244; Nat. Commun. 17 (2026) 4210 | B | nein |
| **diese Auswertung** | 6-h-Mittel < 10 % der monatlichen Leistung (a) Wind+PV, (b) nur Wind; dazu das energieschwächste 120-h-Fenster je Jahr | ≥ 10/24/48 h | Energy-Charts 2015–2025 | — | ja |

Wichtig für die Rechnung: Keine dieser Definitionen bedeutet „Erzeugung null“. Bei 10 %
Kapazitätsfaktor liefern die Ziel-Kapazitäten 2030 (360 GW Wind+PV) im Schnitt noch rund
36 GW.

### 1.2 Was die DIW/MCC-Studie zu „5 Tagen“ sagt

R21 Factsheet A nennt „Dauer der Dunkelflaute: 5 Tage = 1/73 des Jahres (DIW-MCC-Studie, 2020)“
(PDF S. A-1, primär). Gemeint ist erkennbar Nils Ohlendorf (MCC) und Wolf-Peter Schill (DIW),
„Frequency and duration of low-wind-power events in Germany“, Environmental Research
Letters 15 (2020) 084045. Laut Abstract (arXiv 2003.04133, über Suchauszug, **nicht primär**):

- Grundlage: 40 Jahre Reanalysedaten, **nur Wind an Land**, keine PV, kein Offshore.
- Ein Ereignis von rund **5 Tagen** mit mittlerem Kapazitätsfaktor unter 10 % tritt
  **jedes Jahr** auf, knapp **8 Tage einmal im Jahrzehnt**, längstes Ereignis knapp 10 Tage.
- Auf Wintermonate beschränkt werden die Ereignisse **kürzer**.
- Fazit der Autoren: öffentliche Sorgen vor winterlichen Windflauten seien
  „möglicherweise überbewertet“; Modelle sollten mehrere Wetterjahre rechnen.

Die Studie stützt also die Dauer, nicht aber die Annahme, in diesen 5 Tagen komme kein
Strom aus Wind und Sonne. Sie misst zudem nur einen Erzeugungstyp.

### 1.3 Eigene Auswertung 2015–2025 (Energy-Charts, CC BY 4.0)

| Jahr | Ereign. Wind+PV ≥10 h | ≥24 h | ≥48 h | längste Wind+PV (h) | längste nur Wind (h) | schwächstes 5-Tage-Fenster ab | Wind+PV-Anteil an Last | Lastfaktor ggü. Jahresmittel | Lücke bei Zielen 2030 (TWh) | Spitzenlücke (GW) |
|---|---:|---:|---:|---:|---:|---|---:|---:|---:|---:|
| 2015 | 145 | 9 | 4 | 134 | 127 | 18.01. | 3,5 % | 1,16 | 6,96 | 76,5 |
| 2016 | 163 | 14 | 7 | 74 | 150 | 17.01. | 7,4 % | 1,15 | 5,62 | 69,1 |
| 2017 | 131 | 12 | 4 | 138 | 124 | 20.01. | 5,5 % | 1,11 | 6,17 | 74,8 |
| 2018 | 125 | 12 | 2 | 77 | 130 | 05.02. | 10,4 % | 1,13 | 4,89 | 68,4 |
| 2019 | 113 | 9 | 3 | 64 | 126 | 20.01. | 10,8 % | 1,18 | 5,53 | 74,8 |
| 2020 | 115 | 8 | 3 | 93 | 185 | 06.11. | 11,4 % | 1,02 | 4,82 | 67,9 |
| 2021 | 155 | 13 | 5 | 98 | 148 | 05.01. | 12,2 % | 1,05 | 5,04 | 60,7 |
| 2022 | 149 | 13 | 4 | 143 | 180 | 08.12. | 8,7 % | 1,04 | 5,71 | 66,8 |
| 2023 | 135 | 11 | 2 | 164 | 120 | 23.01. | 9,8 % | 1,16 | 6,38 | 70,2 |
| 2024 | 160 | 12 | 4 | 133 | 143 | 05.11. | 9,7 % | 1,05 | 5,94 | 73,9 |
| 2025 | 176 | 17 | 6 | 106 | 123 | 15.01. | 13,1 % | 1,12 | 5,87 | 73,4 |

Lesehilfe: „Lücke bei Zielen 2030“ ist eine **Setzung (M)**: beobachtete Kapazitätsfaktoren
im schwächsten Fenster × 215 GW PV, 115 GW Wind an Land, 30 GW Wind auf See; Last auf
520 TWh/a skaliert. Die Lücke ist das, was Biomasse, Wasserkraft, Importe, Speicher,
Lastverzicht und steuerbare Kraftwerke zusammen decken müssen — vor deren Abzug.

Befunde:

- **Häufigkeit:** 2016–2025 zusammen 1.422 Ereignisse ≥ 10 h; Uniper meldet 1.435 mit
  derselben Definition. Damit ist die Uniper-Zahl unabhängig bestätigt (**A**).
- **Mehrtägig:** ≥ 48 h 2–7-mal je Jahr (Mittel 4,0). Nur Wind: längste Phase 5–7,7 Tage —
  passt zur DIW/MCC-Aussage „etwa 5 Tage jährlich“.
- **Resterzeugung:** Im schwächsten 5-Tage-Fenster lieferten Wind und PV im Mittel
  3,2–7,1 % ihrer Leistung (Kapazitätsfaktor), Wind auf See 7–28 %. Einzelne Stunden fallen
  fast auf null (2024: 0,2 % der Last), das 5-Tage-Mittel nicht.
- **Winterlast:** Die Fenster liegen fast alle zwischen November und Februar; die Last
  liegt 2–18 % über dem Jahresmittel. Diesen Effekt ignoriert R21 — zu seinen Ungunsten.
- **Biomasse und Laufwasser** lieferten in diesen Fenstern 0,73–0,83 TWh (heutiger Park;
  der NEP sieht für 2045 nur noch 3 GW Biomasse statt 9,1 GW).
- Methodische Grenze: Der kombinierte Kapazitätsfaktor Wind+PV fällt im Winter allein
  durch den wachsenden PV-Anteil niedriger aus; deshalb ist die energiebasierte
  Fenster-Rechnung belastbarer als Ereigniszählungen.

### 1.4 Europäische Ausdehnung

| Befund | Wert | Quelle | Konf. | primär |
|---|---|---|---|---|
| Dunkelflauten Wind+PV in DE | ≈ 2 je Jahr (≥ 48 h) | DWD 2018, laut stromauskunft.de | C | nein |
| Dunkelflauten europaweit (gleiche Definition) | ≈ 0,2 je Jahr | DWD 2018, ebd. | C | nein |
| Typische Wetterlage | „Hoch Mitteleuropa“: wenig Wind in DE, oft überdurchschnittlich in Skandinavien | DWD, EMS-2025-Abstract | C | nein |
| Extremstes europäisches Ereignis 1979–2017 | Winter 1996/97, 55 Tage, EE-Verfügbarkeit 47 % des Mittels | Kittel/Schill, arXiv 2410.00244 | B | nein |
| Langzeitspeicherbedarf Europa für dieses Ereignis | 351 TWh (7 % Jahresverbrauch); 159 TWh bei unbegrenztem Ausgleich | Kittel/Roth/Schill, Nat. Commun. 17 (2026) 4210 | B | nein |
| Deutschland, frühere Studien | 55 TWh (Ruhnau/Qvist, Typ 1996/97); 67 TWh H₂ für stilisierte 2-Wochen-Flaute (Kondziella et al.) | zitiert in Kittel et al. | C | nein |
| Grenzüberschreitende Kapazität DE | ≈ 25 GW heute → 52 GW 2050 (Studienannahme) | Fraunhofer ISE u. a., Systemstudie Deutschland 2026, PDF-S. 25 | B | ja |

Referenzfall Dezember 2024 (primär, Bundesnetzagentur/Bundeskartellamt, PM 21.10.2025):
Dunkelflauten 5.–7.11. und 11.–12.12.2024, Day-Ahead zeitweise über 300 €/MWh, Spitze über
900 €/MWh; in den teuersten Stunden standen noch 3,4 GW Marktkapazität und 12–13 GW
Reserven und Regelenergie zur Verfügung; „die sichere Stromversorgung war … zu jedem
Zeitpunkt gewährleistet“. Unsere Fensteranalyse findet für 2024 genau den 5.11. als
schwächstes 5-Tage-Fenster. Ein Preis-, kein Blackout-Ereignis (**A**).

## 2 · Factsheet A nachgerechnet

Text (R21, PDF S. A-1, primär): 5 Tage = 1/73 des Jahres; 520 TWh; 520/73 ≈ 7 TWh;
200.000 €/MWh; 7 Mio. MWh × 200.000 € = 1,4 Billionen €. Anmerkung des Autors: Bischof (2026)
rechne mit 560 GWh und 112 Mrd. €; die eigene Rechnung unterstelle die 12,5-fache Kapazität.
Im Hauptteil (S. 9, Fn. 2) heißt es, die „gegenwärtig dafür vorgesehene Technik“ sei der
Batteriespeicher.

### 2.1 Annahmen einzeln

| Annahme R21 | Prüfung | Urteil |
|---|---|---|
| Dauer 5 Tage (DIW-MCC 2020) | Für Wind allein jährliches Ereignis; eigene Daten 5–7,7 Tage | **vertretbar** als Auslegungsfall; für Extremjahre zu kurz (Europa 1996/97: 55 Tage bei reduzierter, nicht null Erzeugung) |
| Verbrauch 520 TWh | Heute rund 464 TWh netto (NEP-Referenz 2024); NEP 2045: 869–1.195 TWh | **vertretbar für ~2030**, für 2045 zu niedrig — R21 räumt das selbst ein |
| Gleichverteilung 1/73 | Winterlast im Flautenfenster 2–18 % über Mittel | **zu niedrig** (Fehler zu Ungunsten R21) |
| Erzeugung null | Wind+PV im schwächsten Fenster 3–7 % Kapazitätsfaktor; bei Zielkapazitäten 2030 1,3–3,2 TWh in 5 Tagen; dazu Biomasse/Wasser ≈ 0,8 TWh | **nicht vertretbar** |
| Batterie als einzige Technik | NEP: 60–81 GW H₂-Kraftwerke 2045, Batterien 2–2,5 h; StromVKG-Ausschreibung für steuerbare Leistung; BNetzA-Monitoring fordert 22–36 GW steuerbare Leistung | **nicht vertretbar**, widerspricht allen offiziellen Planungen |
| 200.000 €/MWh | Fraunhofer ISE 2024: 400–600 €/kWh (PV-Freiflächen-Batterie, 2024), 130–400 €/kWh (2045); strommix-Marktwerte 180–260 €/kWh | **plausibel** für heutige 2–4-h-Systeme; für 120-h-Systeme unerprobt |
| Quelle Bischof 2026 | Gutachten RBID für DUH/WVW; 1 kWh je kW Wind/PV als Kostenzuschlag; Ergebnis: EE inkl. Speicher günstiger als Gas | **zweckentfremdet**: Bischof dimensioniert keinen Dunkelflauten-Speicher |
| Nur Investition, keine Lebensdauer | ISE: Batterie-Lebensdauer 15 Jahre → Ersatz nötig | ergänzt, als Annuität |

### 2.2 Rechnung mit je einer korrigierten Annahme

(`data/p1_05_factsheet_a.json`; Werte min / mid / max)

| Variante | Speicher bzw. Leistung | Kosten | Bemerkung |
|---|---|---|---|
| R21 original | 7,0 TWh Batterie | **1.400 Mrd. €** | 520/73 = 7,12 TWh, auf 7 gerundet |
| V1 · Resterzeugung + Winterlast, weiter nur Batterie à 200 €/kWh | 4,0 / 4,9 / 6,2 TWh | **804 / 983 / 1.231 Mrd. €** | Lücke 2030 abzüglich 0,8 TWh Biomasse/Wasser; ohne Importe |
| V2 · wie V1, Batteriepreis 130–600 €/kWh | wie V1 | 523 – 3.694 Mrd. € | zeigt: Batterie-only bleibt in jeder Preisannahme dreistellig |
| V3 · H₂-Gasturbinen (Spitzenlücke) + H₂-Kaverne (Energie) | 61 / 70 / 77 GW; 10 / 12 / 15 TWh H₂ | **38 / 69 / 111 Mrd. €** | Turbine 550–1.200 €/kW (ISE 2024), Wirkungsgrad 40 %, Kaverne 0,50–0,63 €/kWh (INES/DBI) bzw. 1,26 Setzung (M) |
| V4 · Marktpreis gesicherter Leistung (StromVKG, 1. Runde) | 61 / 70 / 77 GW | **9,4 / 10,9 / 11,9 Mrd. €/Jahr** (141–178 Mrd. € über 15 Jahre, nominal) | ohne Brennstoff; 1 GW Lücke = 1 rMW vereinfacht |
| Vergleich: R21-Batterie als Annuität | 7 TWh | **≈ 135 Mrd. €/Jahr** | 15 Jahre, 5 % Zins (Setzung M) |

Was V3/V4 nicht enthalten: Elektrolyseure (bei 0,2 GW Bestand der eigentliche Engpass),
Wasserstoff-Kernnetz, Brennstoffkosten je Ereignis (bei 10–15 TWh H₂ und einem H₂-Preis von
150–250 €/MWh, Setzung (M), rund 1,5–3,8 Mrd. € je 5-Tage-Ereignis), Netzanschlüsse. Was sie
zu ihren Ungunsten weglassen: Importe, vorhandene Batterien (231–390 GWh laut NEP),
Lastverzicht der Industrie, Pumpspeicher. Für eine Übergangszeit mit Erdgas statt H₂ entfällt
der Kavernen-Neubau, dafür fallen CO₂-Kosten an.

**Urteil, ohne Polemik:** Die Größenordnung der zu überbrückenden Energie (einige TWh in
5 Tagen) ist richtig und eher unterschätzt, wenn man 2045-Verbrauch ansetzt. Die
Kostenaussage beruht auf einer Technikwahl, die niemand plant: Eine Flaute, die einmal im
Jahr auftritt, mit einem Speicher zu decken, der dafür einmal im Jahr voll zyklisiert,
ist die teuerste denkbare Lösung. Der Kostenblock „Dunkelflaute“ liegt nach unseren
Rechnungen eher bei 40–180 Mrd. € (Investition bzw. 15 Jahre Kapazitätszahlung) als bei
1,4 Billionen — zuzüglich Brennstoff und Elektrolyse, deren Kosten Dossier P1-08 klärt.

## 3 · Technologien mit Kosten und Bandbreiten

### 3.1 Batterie-Großspeicher

| Parameter | min / mid / max | Einheit | Quelle | Konf. | primär |
|---|---|---|---|---|---|
| Bestand alle Batterien DE, 11/2026 | 22,7 GW / 35,6 GWh | — | Energy-Charts `installed_power` | B | ja |
| Bestand 06/2026 | 19 GW / ≈ 29 GWh, ≈ 80 % Heimspeicher | — | KfW Research Fokus 555 (2026), S. 1 | A | ja |
| Lithium-Großspeicher am Netz 06/2026 | ≈ 3 GW, Entladedauer ≈ 1,5 h | — | KfW 555, S. 2 | B | ja |
| Anschlussbegehren 2024 / Zusagen | 400 GW / 25 GW | GW | KfW 555 nach BNetzA (2025) | B | ja |
| Konkret geplanter Zubau bis Mitte 2030 | ≈ 14 GW | GW | KfW 555 nach MaStR | B | ja |
| CAPEX Batterie für PV-Freiflächen, 2024 | 400 / – / 600 | €/kWh | Fraunhofer ISE, Stromgestehungskosten 2024, Tab. 1 | B | ja |
| CAPEX dto. 2035 | 225 / – / 473 | €/kWh | ISE 2024, Tab. 8 | B | ja |
| CAPEX dto. 2045 | 130 / – / 400 | €/kWh | ISE 2024, Tab. 8 | B | ja |
| CAPEX System 4 h Europa (Markt) | 180 / 210 / 260 | €/kWh | strommix `kosten_ee_speicher.md` | B | nein |
| Investition stationäre Batterie im BNetzA-Modell | 656.053 | €/MW | BNetzA VSM 2025, Anhang 2, Tab. 19 | B | ja |
| Lebensdauer | 15 | a | ISE 2024, Tab. 2 | B | ja |
| Zyklen / Wirkungsgrad | bis 10.000 / 85–97 % | — | KfW 555, S. 2 | B | ja |
| Lernrate Zellpreise seit 1998 | 19 % je Verdopplung; Preisindex 2035 = 0,81 (0,72–0,89) ggü. 2024 | — | KfW 555, S. 1 und Fn. 7 | B | ja |
| Speicherkosten System seit 2020 | +27 % | % | Lazard 2026 laut strommix | B | nein |

Abweichung zum strommix-Bestand: Dort stand „> 15 GWh kumuliert 2026“ (C). Tatsächlich
35,6 GWh inklusive Heimspeicher (Energy-Charts, 11/2026). Die ISE-Kostenwerte (400–600 €/kWh
für 2024) liegen deutlich über den strommix-Marktwerten (180–260 €/kWh); die Differenz ist
ungeklärt (Abgrenzung: ISE inkl. Installation, PV-gekoppelt; Markt 2026 nach Preisverfall).

### 3.2 Pumpspeicher

| Parameter | Wert | Quelle | Konf. | primär |
|---|---|---|---|---|
| Leistung / Kapazität am deutschen Netz (inkl. LU/AT) | ≈ 10 GW / 55 GWh, 5,5 h | KfW 555, S. 2 | A | ja |
| Leistung 2024 → 2037/2045 | 9,9 → 12,0 GW | NEP 2037/2045 (2025), 2. Entwurf, Tab. 1 | A | ja |
| Letzte nennenswerte Erweiterung in DE | 2004 | KfW 555 | B | ja |

### 3.3 Wasserstoff: Elektrolyse, Kavernen, Kraftwerke

| Parameter | Wert | Quelle | Konf. | primär |
|---|---|---|---|---|
| Elektrolyse installiert | ≈ 0,2 GW (+ 1,1 GW im Bau), 03/2026 | KfW Research, 04.03.2026 | A (EWI: 181 MW, 01/2026) | ja |
| Elektrolyse bis Ende 2030 (konservativ) | ≤ 2,4 GW gegen Ziel 10 GW | KfW, 04.03.2026 | B | ja |
| Elektrolyse 2045 im NEP | 31,6 / 58,5 / 70 GW (A/B/C) | NEP 2037/2045, Tab. 1 | A | ja |
| H₂-Speicher Bedarf 2045 | 94,6 TWh (35,7 umgestellt, 59,5 Neubau in 49 Kavernen) | INES/DBI 2026, laut cleanthinking 06.11.2026 | B | nein |
| Kosten dafür | 18 Mrd. € Umstellung + 37,6 Mrd. € Neubau → 0,50 bzw. 0,63 €/kWh_H₂ | ebd. | B | nein |
| Zeitbedarf | Umstellung 7 J., Neubau bis 10 J.; Betrieb frühestens 2033 bzw. 2035 | ebd. | B | nein |
| Umwidmungspotenzial Erdgaskavernen | ≈ 30–33 TWh | EWI, Nationaler Wasserstoffrat (Suchauszüge) | C | nein |
| H₂-Speicherbedarf 2045 andere Studien | 76–80 TWh (BMWK-Weißbuch 2025); ≈ 80 TWh (Agora KNDE 2023, PDF-S. 29) | — | B | Agora ja |
| H₂-Gasturbine CAPEX 2024 | 550–1.200 €/kW (Erdgas-GT 450–700; GuD 900–1.300; H₂-GuD 1.100–2.400) | ISE 2024, Tab. 1 | B | ja |
| Gasturbine / GuD im BNetzA-Modell | 634.890 / 1.015.824 €/MW | BNetzA VSM 2025, Anhang 2, Tab. 19 | B | ja |
| Kommerzieller H₂-Kraftwerksbetrieb in DE | keiner (Stand 2024) | ISE 2024, PDF-S. 29 | B | ja |
| H₂-Kraftwerke 2045 | 60,6 / 81,3 / 81,3 GW (A/B/C); 2037 zusätzlich 13,9–15,2 GW Erdgas | NEP 2037/2045, Tab. 8 | B | ja |

Die Einordnung der Rückverstromungs-Wirkungsgrade (30–40 % Strom→H₂→Strom) und der
EWI-Kavernenkosten je kg aus strommix wurde nicht neu geprüft (EWI-Host nicht freigegeben).

### 3.4 Gaskraftwerke als Reserve, Biomasse

- Heutige Reserven: Netzreserve ≈ 8,8 GW, Kapazitätsreserve ≈ 1,37 GW (ISE-Systemstudie 2026,
  Fn. 8, **B**, primär).
- StromVKG (in Kraft 22.07.2026 laut Grant Thornton, **C**): erste Ausschreibung
  „Langzeitkapazitäten“ 4.500 MW reduzierte Leistung, Verpflichtung 15 Jahre, Höchstwert
  244.000 €/MW·a; 41 Gebote mit 11.958 rMW, 11 Zuschläge mit 5.160 rMW, Durchschnitt
  **155.296 €/rMW·a** (BNetzA PM 21.07. und 03.11.2026, **B**, primär). Zuschläge laut
  Presse fast nur an RWE und LEAG (**C**). Der Vorwurf, Batterien seien faktisch
  ausgeschlossen gewesen (cleanthinking), ist nicht geprüft; die BNetzA spricht von
  „Wettbewerb … zwischen Kraftwerken und Stromspeichern“. Reduktionsfaktoren nach
  Anlage 4 StromVKG (GuD 0,85 laut Suchauszug) nicht primär gelesen.
- Biomasse: 9,1 GW (2024) → 3,0 GW im NEP 2045 (**B**, primär) — als Flexoption schrumpfend geplant.

### 3.5 Lastverschiebung und Importe

| Option | Wert | Quelle | Konf. | primär |
|---|---|---|---|---|
| Speicher (inkl. V2G) Ausspeisung 2045 | 538 GW über 1 h, 24 GW über 24 h, 3,3 GW über 1 Woche | Agora KNDE 2023, PDF-S. 55, Abb. 11 | B | ja |
| Wärmepumpen + E-Autos über 1 Woche | zusammen 2,6 GW Lastreduktion | ebd. | B | ja |
| E-Auto-Lastsenkung 2030 | max. 11,6 GW, Median 3,5 GW | BNetzA VSM 2025, Anhang 2, Abb. 16 | B | ja |
| Industrielle Lastreduktion | bis 18 GW Potenzial | ISE-Systemstudie 2026, Fn. 8 (zit. Studie) | B | ja |
| DSM Industrie+GHD im NEP 2045 | 8,4–14,5 GW | NEP Tab. 1 | B | ja |
| Importanteil 2045 | 7–11 % zeitweise; Import „ersetzt keine national vorgehaltene Kapazität“ | ISE-Systemstudie 2026, S. 45 f. | B | ja |

Befund: Lastverschiebung entlastet Stunden und Tage, über eine Woche fast nicht. Für
mehrtägige Flauten bleiben steuerbare Kraftwerke, Importe und Langzeitspeicher.

## 4 · Was offizielle Planungen vorsehen

| Planung | Zieljahr | gesicherte/steuerbare Leistung | Speicher | Quelle | Konf. |
|---|---|---|---|---|---|
| BNetzA Versorgungssicherheitsmonitoring 2025 | 2035 | +22,4 GW (Zielszenario) bis +35,5 GW (verzögerte Energiewende), brutto | Batterien teils in „steuerbarer Kapazität“ enthalten; laut zfk nur 0,8 GW Großspeicher modelliert (C) | BNetzA PM 03.09.2025 | A |
| VSM 2022 (zum Vergleich) | 2030 | 17–21 GW | — | ebd. | B |
| StromVKG 1. Runde | ab ≈ 2031 | 4,5 GW rMW ausgeschrieben, 5,16 GW rMW bezuschlagt | Speicher teilnahmeberechtigt | BNetzA PM 03.11.2026 | B |
| NEP 2037/2045 (2025), 2. Entwurf | 2045 | H₂-Kraftwerke 60,6–81,3 GW; Pumpspeicher 11,9 GW | Großbatterie 41–94 GW × 2 h; Kleinbatterie 60–81 GW × 2,5 h → ≈ 231–390 GWh | NEP Tab. 1, 8; S. 50 | B |
| Fraunhofer ISE/EY/Fichtner „Systemstudie Deutschland 2026“ (Auftraggeber Hitachi Energy) | 2045 | 85–89 GW Gaskraftwerke + bis 40 GW H₂ als „Dunkelflautenreserve“ | stationär + mobil, z. B. 110 GWh NRW | PDF-S. 46, S. 28 | B |
| Agora KNDE 2023 (Geldgeber nicht geprüft) | 2045 | 71 GW, davon 38 GW H₂, 30 GW Synfuel | Großbatterie 102 GW; H₂-Speicher ≈ 80 TWh | PDF-S. 29, 54 | B |
| ERAA 2025 (ENTSO-E/ACER) | 2028–2035 | DE-Werte nicht gefunden | — | — | Lücke |

## 5 · Systemkosten jenseits der Erzeugung

### 5.1 Netzengpassmanagement (Redispatch, Countertrading, Netzreserve)

| Jahr | Kosten (Mio. €) | Abregelung EE (GWh) | Quelle | Konf. | primär |
|---|---:|---:|---|---|---|
| 2019 | 1.288 (Summe Tabellenspalten) | 6.482 (EinsMan) | BNetzA, Bericht Netzengpassmanagement 07/2023, Tab. 2 | B | ja |
| 2020 | 1.448 (dto.) | 6.146 | ebd. | B | ja |
| 2021 | 2.306 (dto.; BNetzA: „2,3 Mrd.“) | 5.818 | ebd. | B | ja |
| 2022 | 4.248 (vorläufig) | 8.071 | ebd., S. 7 | B | ja |
| 2023 | 3.335 | 10.479 | SMARD, Netzengpassmanagement 2024 | A | ja |
| 2024 | 2.776 (vorläufig) bzw. **2.954** (revidiert) | 9.374 bzw. 9.389 | SMARD 2024 und SMARD Q4/2025 | A | ja |
| 2025 | **3.071** (vorläufig) | 9.379 (≈ 3,5 % der EE-Erzeugung) | SMARD, „Congestion management in Q4 2025 and the full year 2025“, 30.03.2026 | B | ja |

2025 im Detail (SMARD): Redispatch konventionell 1.176 Mio. €, Entschädigung EE 433 Mio. €,
Netzreserve 1.359 Mio. € (Vorhaltung 952, Einsatz 407), Countertrading 102 Mio. €. PV-Abregelung
2.704 GWh (+94 %), Offshore 3.351 GWh (−27 %), Onshore 3.225 GWh. Anteil Verteilnetz-Engpässe
an EE-Redispatch steigt (2024: 26 %, 2025: ≈ 35 %).

Die Reihe 2019–2021 ist methodisch nicht deckungsgleich mit 2022 ff. (Redispatch 2.0 seit
10/2021, EinsMan seit Q3 2022 im Redispatch). Wir haben für 2019–2021 die Kostenspalten selbst
summiert.

### 5.2 Negative Strompreisstunden (Day-Ahead DE-LU)

| 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---:|---:|---:|---:|---:|---:|---:|
| 211 | 298 | 139 | 69 | **301** | 457 | 576 |

Eigene Zählung aus Energy-Charts (Stundenmittel; 2025 ab Oktober Viertelstundenpreise,
724 negative Viertelstunden-Werte). 2024 stimmt mit pv magazine (457) überein, 2025 fast (573).
**Abweichung zu strommix:** Dort stand für 2023 „399“ (B); gemessen sind 301.

### 5.3 Netzentgelte (Haushalte, netto, Bundesdurchschnitt)

| Jahr | ct/kWh | Quelle | Konf. | primär |
|---|---:|---|---|---|
| 2018 | 7,19 | WD 5 – 3000 – 012/20 (Suchauszug) | C | nein |
| 2019 | 7,22 | ebd. | C | nein |
| 2020 | 7,60 | BNetzA PM 14.01.2021 (Zahl im Suchauszug, im geladenen Seitentext nicht gefunden) | B | nein |
| 2021 | 7,65 | ebd. | B | nein |
| 2025 | ≈ 10,6 (abgeleitet: Saarland 11,21 = Bundesschnitt + 5,8 %) | WD 5 – 3000 – 065/26, S. 3 | B | ja |
| 2026 | 9,3 (nach Bundeszuschuss 6,5 Mrd. € zu Übertragungsnetzentgelten) | strommix `ist_zustand_de.md` | B | nein |

Die vollständige Reihe steht im Monitoringbericht 2025 der BNetzA, der nur über
data.bundesnetzagentur.de abrufbar ist (gesperrt, s. u.).

## 6 · Gegenpositionen

### 6.1 Langzeitspeicher werden teurer oder später verfügbar

- **Elektrolyse-Hochlauf stockt:** 0,2 GW statt Pfad zu 10 GW 2030; konservativ ≤ 2,4 GW
  bis 2030; Gründe: höhere Kosten, geringe Zahlungsbereitschaft, regulatorische Unsicherheit
  (KfW, 04.03.2026, primär). Der NEP setzt für 2045 31,6–70 GW — eine Lücke von Faktor 150–350
  zum heutigen Bestand.
- **Kavernen kommen spät:** Umgestellte Speicher frühestens 2033, neue ab 2035; erste
  Neubauprojekte hätten laut INES „bereits angestoßen werden müssen“; Umwidmung deckt nur
  rund ein Drittel des Bedarfs (INES/DBI 2026; Interessenverband der Speicherbetreiber).
- **H₂-Kraftwerke sind unerprobt** (ISE 2024: keine energiewirtschaftliche Bereitstellung
  in DE). Gasturbinenpreise sind laut Branchenberichten um bis zu 195 % gestiegen (strommix, B).
- **Batteriesysteme wurden zuletzt teurer:** Lazard +27 % seit 2020 (strommix, B); ISE-Werte
  2024 (400–600 €/kWh) liegen über den Marktmeldungen.
- **Extremjahre sind länger als die Messreihe:** Unsere 11 Jahre enthalten kein Ereignis wie
  1996/97 (55 Tage, europaweit). Kittel/Roth/Schill: 351 TWh Langzeitspeicher für Europa;
  auch gesicherte CO₂-freie Erzeugung senkt das nur moderat.
- **Großer, selten genutzter Kraftwerkspark:** ISE-Systemstudie: 85–89 GW Gas + bis 40 GW H₂,
  in knapp der Hälfte der Stunden ungenutzt, oberhalb 80 GW nur wenige Stunden; „Missing
  Money“ — ohne Kapazitätsmarkt nicht finanzierbar.
- **Importe sind in korrelierten Wetterlagen begrenzt** („Hoch Mitteleuropa“, DWD; ISE).
- **Biomasse schrumpft** im NEP von 9,1 auf 3 GW.

### 6.2 Der Bedarf ist kleiner als oft behauptet

- Ohlendorf/Schill 2020: Sorge vor Winterflauten „möglicherweise überbewertet“; im Winter
  sind die Ereignisse kürzer.
- DWD 2018: Europaweite Dunkelflaute nur ≈ 0,2-mal je Jahr (C).
- BNetzA VSM 2025: Der Unterschied 22,4 ↔ 35,5 GW ist vor allem Nachfrageflexibilität —
  gelingt sie, sinkt der Kraftwerksbedarf um ein Drittel.
- StromVKG: Wettbewerb drückte den Preis auf 155.296 €/rMW·a, 36 % unter dem Höchstwert;
  2,7-fache Überzeichnung.
- Agora: Ein Verbund, der jedes Land auf 100 % Autarkie auslegt, „wäre überdimensioniert“.
- LCP Delta: 82–87 % aller Knappheitsereignisse dauern ≤ 10 h (Suchauszug, C); Eco Stor
  (Batterieprojektierer): 60 GW Batterien mit 2–4 h senken Backup-Bedarf um 15–20 GW (C,
  Interessenlage).
- Dezember 2024: Das heutige System hat zwei Dunkelflauten mit Reserven bewältigt (BNetzA).

## Lücken

- Bischof/RBID 2026 nicht im Original gelesen (duh.de nicht freigegeben); unklar, ob das
  Gutachten Backup-Kraftwerke für Dunkelflauten mitrechnet und worauf sich 112 Mrd. € genau beziehen.
- Ohlendorf/Schill 2020 und Kittel et al. nur über Abstracts/Suchauszüge (arxiv.org,
  iopscience, nature.com nicht freigegeben). Der „5 Tage“-Befund ist daher B, nicht A.
- DWD-Studie 2018 im Original nicht gefunden.
- ERAA 2025: Werte für Deutschland (LOLE) nicht ermittelt.
- StromVKG Anlage 4 (Reduktionsfaktoren Batterie je Speicherdauer) nicht primär gelesen.
- BNetzA-Hauptbericht VSM 2025 (BMWE-Host) nicht gelesen; nur Pressemitteilung und Anhang 2.
- Netzentgelt-Zeitreihe 2015–2026 lückenhaft.
- Unsere Dunkelflauten-Auswertung deckt nur 11 Wetterjahre und nur Deutschland ab;
  für das Modell sind mehrere Jahrzehnte (z. B. ERA5) und Nachbarländer nötig (Dossier P1-06).
- Geldgeber der Agora-Studie und Förderung der KfW-Research-Papiere nicht geprüft.
- Keine Lebenszyklus- oder Rohstoffbetrachtung (Dossier P1-07), keine H₂-Preise (P1-08).

## Nicht erreichbar

| Host | Gewünschtes Dokument | Status |
|---|---|---|
| data.bundesnetzagentur.de | Monitoringbericht Energie 2025 (Netzentgelt-Reihe, Speicherbestand) | Proxy 403, nicht umgangen |
| www.duh.de | RBID-Gutachten „Systemkostenvergleich …“ (20260426), DUH-Hintergrundpapier | nicht freigegeben; nur Websuche |
| arxiv.org, iopscience.iop.org, www.nature.com | Ohlendorf/Schill 2020; Kittel/Schill 2024; Kittel/Roth/Schill 2026 | nicht freigegeben; nur Websuche |
| www.diw.de | Transkript „Glossar Dunkelflaute“, Vortrag Kittel 2025 | nicht freigegeben |
| www.ewi.uni-koeln.de | EWI-Analyse H₂-Speicher 2024, Elektrolyse-Monitor, Großbatterie-Endbericht 2026 | nicht freigegeben |
| www.bundeswirtschaftsministerium.de | VSM-Bericht 2025, Weißbuch H₂-Speicher | nicht freigegeben |
| www.gesetze-im-internet.de | StromVKG, Anlage 4 | nicht freigegeben |
| www.entsoe.eu, www.acer.europa.eu | ERAA 2025 | nicht freigegeben |
| www.dwd.de | Dunkelflauten-Studie 2018 | nicht freigegeben |

## Abweichungen gegenüber strommix

| strommix-Wert (Konf.) | Nachprüfung | Ergebnis |
|---|---|---|
| Negative Stunden 2023: 399 (B) | Energy-Charts: 301 | **abweichend** |
| Netzengpasskosten 2024: 2,776 Mrd. € (A) | SMARD revidiert 2,954 Mrd. € | vorläufiger Wert, inzwischen revidiert |
| Netzengpasskosten 2025: ≈ 3,1 Mrd. € (B) | SMARD: 3,071 Mrd. € (vorläufig) | bestätigt, jetzt primär |
| Abregelung 2024 ≈ 9,4 TWh (A); PV 2025 ≈ 2,7 TWh (B) | 9.389 GWh; 2.704 GWh | bestätigt |
| Uniper: 1.435 Ereignisse > 10 h (A) | eigene Rechnung 1.422 | bestätigt |
| „17–21 GW bis 2030“ (B) | stammt aus VSM 2022, nicht 2025 | Zuordnung korrigieren |
| Dezember 2024: 3,4–4,5 GW Markt, 12–13 GW Reserven (A) | BNetzA PM nennt 3,4 GW und 12–13 GW | bestätigt (4,5 GW nicht im Pressetext) |
| Batteriebestand „> 15 GWh kumuliert 2026“ (C) | 35,6 GWh inkl. Heimspeicher (11/2026) | **veraltet** |
| Kraftwerksstrategie 12,5 GW (B) | abgelöst durch StromVKG; 1. Runde 4,5 GW rMW | **veraltet** |
| OCGT-CAPEX 500–1.100 €/kW (C) | ISE 2024: 450–700; BNetzA: 635 €/kW | Untergrenze gestützt |
| Batterie-System 180–260 €/kWh (B) | ISE 2024: 400–600 €/kWh (2024) | **ungeklärte Differenz** |
| H₂-Speicher „mind. 130 TWh Fraunhofer ISE“ (C) | nicht gefunden; andere Studien 76–95 TWh | nicht bestätigt |

## Quellenliste

1. REPUBLIK21 e. V.: Erklärung des Expertenrates Klima- und Energiepolitik, Factsheet A (F. Breyer), 11/2026 — `quellen/raw/P0/` (Manifest P0). Gefördert vom Presse- und Informationsamt der Bundesregierung.
2. Energy-Charts (Fraunhofer ISE): API public_power 2015–2025, installed_power, price 2019–2025, abgerufen 22.11.2026, CC BY 4.0.
3. KfW Research: Fokus Volkswirtschaft Nr. 555 „Batteriespeicher sind Hebel der Energiewende“, 19.08.2026. KfW ist staatliche Förderbank.
4. KfW Research: „Wasserstoff-Elektrolyse: Ausbau bleibt hinter Erwartungen zurück“, 04.03.2026.
5. Bundesnetzagentur: PM „Veröffentlichung des Versorgungssicherheitsmonitorings“, 03.09.2025; Anhang 2 „Annahmen und Szenarienbeschreibung“, 09/2025.
6. Bundesnetzagentur: PM „Start der Ausschreibungen für Langzeitkapazitäten nach StromVKG“, 21.07.2026; PM „StromVKG – Ergebnisse der ersten Ausschreibung“, 03.11.2026; Seite „1. Gebotstermin (8.9.2026)“.
7. Bundesnetzagentur: Bericht Netzengpassmanagement Gesamtjahr 2022 (07/2023).
8. SMARD (BNetzA): Netzengpassmanagement Gesamtjahr 2024; Q3 2025; Q4 und Gesamtjahr 2025 (30.03.2026).
9. Bundesnetzagentur/Bundeskartellamt: PM Preisspitzen während Dunkelflauten 2024, 21.10.2025.
10. Übertragungsnetzbetreiber: Netzentwicklungsplan Strom 2037 mit Ausblick 2045, Version 2025, 2. Entwurf (05/2026); BNetzA: Genehmigung des Szenariorahmens 2025 (30.04.2025).
11. Fraunhofer ISE: Stromgestehungskosten erneuerbare Energien, Juli 2024.
12. Fichtner IT Consulting, Fraunhofer ISE, EY-Parthenon: Systemstudie Deutschland 2026 (Rev. 1, 08.07.2026), **Auftraggeber Hitachi Energy Germany AG** (Impressum S. 2).
13. Agora Energiewende: Klimaneutrales Deutschland — Von der Zielsetzung zur Umsetzung, 2023 (Auftraggeber/Geldgeber der Studie hier nicht geprüft; Prüfung offen).
14. Wissenschaftliche Dienste des Bundestages: WD 5 – 3000 – 065/26 „Netzentgelte im Saarland“, 16.06.2026.
15. cleanthinking.de: „Studie: Deutschland braucht 49 neue Wasserstoffspeicher“, 06.11.2026 (Referat INES/DBI; INES = Verband der Gas- und H₂-Speicherbetreiber).
16. Über Websuche (nicht primär): Ohlendorf/Schill 2020, ERL 15 084045; Kittel/Schill arXiv 2402.06758 und 2410.00244; Kittel/Roth/Schill, Nat. Commun. 17 (2026) 4210; RBID/Bischof 2026 für DUH und WVW (Pressemitteilungen DUH, solarserver, energiezukunft); DWD 2018 (stromauskunft.de); BMWK Weißbuch H₂-Speicher 2025; EWI Elektrolyse-Monitor 01/2026; zfk zu VSM-Batterieannahmen; Grant Thornton zu StromVKG.
17. strommix/research/kosten_ee_speicher.md und risiken_co2.md (Bestand im Repo).

```json
{
  "dossier": "05_speicher_dunkelflaute",
  "stand": "2026-11-22",
  "parameters": [
    {"id": "df_ohlendorf_schill_dauer_jaehrlich_tage", "value": 5, "unit": "Tage", "source": "ohlendorf_schill_2020", "fundstelle": "Abstract", "confidence": "B", "primaer_gelesen": false, "abgrenzung": "nur Wind an Land, Kapazitätsfaktor im Mittel < 10 %, 40 Reanalysejahre; knapp 8 Tage einmal je Jahrzehnt"},
    {"id": "df_wind_laengste_phase_h", "value": {"min": 120, "mid": 130, "max": 185}, "unit": "h je Jahr", "source": "eigene_energycharts", "fundstelle": "data/p1_05_dunkelflaute.json, laengstes_wind_rolling6h_h", "confidence": "A", "primaer_gelesen": true, "abgrenzung": "Wind an Land + See, 6-h-Mittel < 10 % der Monatsleistung, DE 2015–2025; gestützt durch Ohlendorf/Schill"},
    {"id": "df_ereignisse_ge10h_2016_2025", "value": 1422, "unit": "Ereignisse", "source": "eigene_energycharts", "fundstelle": "Summe ereignisse_ws_rolling6h_ge10h", "confidence": "A", "primaer_gelesen": true, "abgrenzung": "Wind+PV < 10 % der Leistung, 6-h-Mittel; Uniper 2026: 1.435"},
    {"id": "df_ereignisse_ge48h_pro_jahr", "value": {"min": 2, "mid": 4.0, "max": 7}, "unit": "je Jahr", "source": "eigene_energycharts", "fundstelle": "ereignisse_ws_rolling6h_ge48h", "confidence": "A", "primaer_gelesen": true, "abgrenzung": "DE 2015–2025, Wind+PV; mid = Mittelwert"},
    {"id": "df_5d_anteil_windpv_an_last", "value": {"min": 0.035, "mid": 0.098, "max": 0.131}, "unit": "Anteil", "source": "eigene_energycharts", "fundstelle": "schwaechstes_5d_fenster", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "schwächstes 120-h-Fenster je Jahr, damaliger Anlagenpark"},
    {"id": "df_5d_winterlastfaktor", "value": {"min": 1.02, "max": 1.18}, "unit": "Faktor", "source": "eigene_energycharts", "fundstelle": "lastfaktor_vs_jahresmittel", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Last im schwächsten Fenster / Jahresmittel"},
    {"id": "df_5d_luecke_ziel2030_twh", "value": {"min": 4.82, "mid": 5.71, "max": 6.96}, "unit": "TWh je 5 Tage", "source": "eigene_energycharts", "fundstelle": "hochrechnung_ziel2030_setzung_M", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Setzung (M): Ziel-Kapazitäten 2030 x beobachtete CF, Last 520 TWh; vor Biomasse, Importen, Speichern"},
    {"id": "df_5d_spitzenluecke_ziel2030_gw", "value": {"min": 60.7, "mid": 70.2, "max": 76.5}, "unit": "GW", "source": "eigene_energycharts", "fundstelle": "spitze_luecke_gw", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Setzung (M), wie oben, Stundenmaximum"},
    {"id": "df_biomasse_laufwasser_5d_twh", "value": {"min": 0.73, "max": 0.83}, "unit": "TWh je 5 Tage", "source": "eigene_energycharts", "fundstelle": "biomasse_laufwasser_twh", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "heutiger Park"},
    {"id": "df_europa_extrem_1996_97_tage", "value": 55, "unit": "Tage", "source": "kittel_schill_2024", "fundstelle": "Abstract arXiv 2410.00244", "confidence": "B", "primaer_gelesen": false, "abgrenzung": "Europa, perfekter Verbund, EE-Verfügbarkeit 47 % des Mittels"},
    {"id": "ldes_bedarf_europa_twh", "value": {"min": 159, "mid": 351}, "unit": "TWh", "source": "kittel_roth_schill_2026", "fundstelle": "Abstract", "confidence": "B", "primaer_gelesen": false, "abgrenzung": "Europa; 351 = politikrelevanter Verbund (7 % Jahresverbrauch), 159 = unbegrenzter Ausgleich"},
    {"id": "dez2024_reserven_gw", "value": {"markt": 3.4, "reserven_min": 12, "reserven_max": 13}, "unit": "GW", "source": "bnetza_bkarta_2025_preisspitzen", "fundstelle": "PM 21.10.2025", "confidence": "A", "primaer_gelesen": true, "abgrenzung": "teuerste Stunden 6.11. und 12.12.2024"},
    {"id": "r21_fa_speicher_twh", "value": 7.12, "unit": "TWh", "source": "r21_erklaerung_2026", "fundstelle": "Factsheet A, S. A-1", "confidence": "A", "primaer_gelesen": true, "abgrenzung": "520/73, im Papier auf 7 gerundet"},
    {"id": "r21_fa_kosten_mrd_eur", "value": 1400, "unit": "Mrd. EUR", "source": "r21_erklaerung_2026", "fundstelle": "Factsheet A", "confidence": "A", "primaer_gelesen": true, "abgrenzung": "Investition, keine Lebensdauer, Batterie als einzige Technik"},
    {"id": "fa_v1_batterie_mit_resterzeugung_mrd_eur", "value": {"min": 804, "mid": 983, "max": 1231}, "unit": "Mrd. EUR", "source": "eigene_factsheet_a", "fundstelle": "data/p1_05_factsheet_a.json v1", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Setzung (M); nur Annahme Erzeugung null korrigiert"},
    {"id": "fa_v3_h2_turbine_kaverne_mrd_eur", "value": {"min": 38, "mid": 69, "max": 111}, "unit": "Mrd. EUR", "source": "eigene_factsheet_a", "fundstelle": "v3", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Investition Turbinen + Kaverne; ohne Elektrolyse, Netz, Brennstoff, Importe"},
    {"id": "fa_v4_stromvkg_mrd_eur_pro_jahr", "value": {"min": 9.4, "mid": 10.9, "max": 11.9}, "unit": "Mrd. EUR/a", "source": "eigene_factsheet_a", "fundstelle": "v4", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Zuschlagswert 1. Runde x Spitzenlücke; ohne Brennstoff"},
    {"id": "fa_r21_batterie_annuitaet_mrd_eur_pro_jahr", "value": 135, "unit": "Mrd. EUR/a", "source": "eigene_factsheet_a", "fundstelle": "vergleich", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "1.400 Mrd., 15 a, 5 % (Setzung M)"},
    {"id": "bischof_speicher_gwh", "value": 560, "unit": "GWh", "source": "rbid_bischof_2026", "fundstelle": "laut R21 Factsheet A und DUH-Material", "confidence": "B", "primaer_gelesen": false, "abgrenzung": "1 kWh je kW Wind/PV als Kostenzuschlag; 112 Mrd. EUR; keine Dunkelflauten-Auslegung"},
    {"id": "batterie_bestand_de_2026_11", "value": {"gw": 22.7, "gwh": 35.6}, "unit": "GW / GWh", "source": "energycharts_installed", "fundstelle": "installed_power 11.2026", "confidence": "A", "primaer_gelesen": true, "abgrenzung": "alle Batterien inkl. Heimspeicher; KfW 06/2026: 19 GW / 29 GWh"},
    {"id": "batterie_gross_li_gw_2026", "value": 3, "unit": "GW", "source": "kfw_555", "fundstelle": "S. 2, Grafik 4", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Lithium-Großspeicher am Netz, 06/2026, ≈1,5 h"},
    {"id": "batterie_anschlussbegehren_2024_gw", "value": {"begehren": 400, "zusagen": 25}, "unit": "GW", "source": "kfw_555", "fundstelle": "S. 2 nach BNetzA 2025", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Großspeicher, Verteil- und Übertragungsnetz"},
    {"id": "batterie_capex_pvffa_eur_kwh", "value": {"2024": [400, 600], "2035": [225, 473], "2045": [130, 400]}, "unit": "EUR/kWh", "source": "ise_lcoe_2024", "fundstelle": "Tab. 1 und Tab. 8", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Nutzkapazität inkl. Installation, ohne MwSt., PV:Batterie 3:2"},
    {"id": "batterie_lebensdauer_a", "value": 15, "unit": "a", "source": "ise_lcoe_2024", "fundstelle": "Tab. 2", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "PV-Batteriesysteme"},
    {"id": "pumpspeicher_de", "value": {"gw": 10, "gwh": 55}, "unit": "GW / GWh", "source": "kfw_555", "fundstelle": "S. 2", "confidence": "A", "primaer_gelesen": true, "abgrenzung": "inkl. LU/AT am deutschen Netz; NEP: 9,9 GW 2024, 12,0 GW 2037/2045"},
    {"id": "elektrolyse_installiert_gw_2026", "value": 0.2, "unit": "GW", "source": "kfw_elektrolyse_2026", "fundstelle": "S. 1", "confidence": "A", "primaer_gelesen": true, "abgrenzung": "03/2026, +1,1 GW im Bau; EWI 01/2026: 181 MW"},
    {"id": "elektrolyse_2030_konservativ_gw", "value": 2.4, "unit": "GW", "source": "kfw_elektrolyse_2026", "fundstelle": "S. 1", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Obergrenze bei konservativer Schätzung; Ziel NWS 10 GW"},
    {"id": "h2_speicherbedarf_2045_twh", "value": {"min": 76, "mid": 80, "max": 94.6}, "unit": "TWh_H2", "source": "agora_knde_2023", "fundstelle": "Agora PDF-S. 29 (80); BMWK-Weißbuch 76–80 (Suche); INES/DBI 94,6", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "nur Agora primär gelesen"},
    {"id": "h2_kaverne_kosten_eur_kwh", "value": {"umstellung": 0.50, "neubau": 0.63}, "unit": "EUR/kWh_H2", "source": "ines_dbi_2026", "fundstelle": "laut cleanthinking 06.11.2026", "confidence": "B", "primaer_gelesen": false, "abgrenzung": "18 Mrd/35,7 TWh; 37,6 Mrd/59,5 TWh; Interessenverband"},
    {"id": "h2_kaverne_inbetriebnahme_fruehestens", "value": {"umgestellt": 2033, "neu": 2035}, "unit": "Jahr", "source": "ines_dbi_2026", "fundstelle": "ebd.", "confidence": "B", "primaer_gelesen": false, "abgrenzung": "Umstellung 7 J., Neubau bis 10 J."},
    {"id": "capex_h2_gasturbine_eur_kw", "value": {"min": 550, "max": 1200}, "unit": "EUR/kW", "source": "ise_lcoe_2024", "fundstelle": "Tab. 1", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "2024; Erdgas-GT 450–700, GuD 900–1.300, H2-GuD 1.100–2.400"},
    {"id": "capex_bnetza_vsm_eur_mw", "value": {"ocgt": 634890, "ccgt": 1015824, "batterie": 656053}, "unit": "EUR/MW", "source": "bnetza_vsm2025_anhang2", "fundstelle": "Tab. 19", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Modellannahme 2025, Neubau"},
    {"id": "stromvkg_zuschlagswert_eur_mw_a", "value": 155296, "unit": "EUR/rMW/a", "source": "bnetza_stromvkg_2026", "fundstelle": "PM 03.11.2026", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "mengengewichtet, 1. Runde, 15 Jahre Verpflichtung, Höchstwert 244.000"},
    {"id": "stromvkg_runde1_rmw", "value": {"ausgeschrieben": 4500, "geboten": 11958, "bezuschlagt": 5160}, "unit": "MW reduzierte Leistung", "source": "bnetza_stromvkg_2026", "fundstelle": "PM 03.11.2026", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Gebotstermin 08.09.2026"},
    {"id": "vsm2025_zusatzbedarf_steuerbar_2035_gw", "value": {"min": 22.4, "max": 35.5}, "unit": "GW", "source": "bnetza_vsm2025", "fundstelle": "PM 03.09.2025", "confidence": "A", "primaer_gelesen": true, "abgrenzung": "brutto, Zielszenario bzw. verzögerte Energiewende"},
    {"id": "nep2045_h2_kraftwerke_gw", "value": {"min": 60.6, "max": 81.3}, "unit": "GW", "source": "nep_2037_2045_v2025", "fundstelle": "Tab. 8", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Szenarien A bzw. B/C 2045"},
    {"id": "nep2045_batterie_gwh", "value": {"min": 231, "max": 390}, "unit": "GWh", "source": "nep_2037_2045_v2025", "fundstelle": "Tab. 1, S. 50 (abgeleitet: Groß x 2 h + Klein x 2,5 h)", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Großbatterie 41,1–94,1 GW, Kleinbatterie 59,7–80,9 GW"},
    {"id": "nep2045_nettostromverbrauch_twh", "value": {"min": 868.7, "max": 1195.1}, "unit": "TWh", "source": "nep_2037_2045_v2025", "fundstelle": "Tab. 1", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Szenarien A–C 2045"},
    {"id": "ise_systemstudie_backup_gw", "value": {"gas_min": 85, "gas_max": 89, "h2_max": 40}, "unit": "GW", "source": "ise_systemstudie_2026", "fundstelle": "PDF-S. 46", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "2045, Auftraggeber Hitachi Energy"},
    {"id": "agora_speicher_ausspeisung_2045_gw", "value": {"1h": 538, "24h": 24, "1woche": 3.3}, "unit": "GW", "source": "agora_knde_2023", "fundstelle": "PDF-S. 54 f., Abb. 11", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "inkl. V2G; WP+E-Auto über 1 Woche zusammen 2,6 GW"},
    {"id": "netzengpass_kosten_mio_eur", "value": {"2019": 1288, "2020": 1448, "2021": 2306, "2022": 4248, "2023": 3335, "2024": 2954, "2025": 3071}, "unit": "Mio. EUR", "source": "bnetza_smard_nem", "fundstelle": "BNetzA Bericht 07/2023 Tab. 2; SMARD 2024, 2025", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "2019–2021 eigene Summe der Kostenspalten; 2022 und 2025 vorläufig; 2024 revidiert (vorläufig 2.776)"},
    {"id": "ee_abregelung_gwh", "value": {"2019": 6482, "2020": 6146, "2021": 5818, "2022": 8071, "2023": 10479, "2024": 9389, "2025": 9379}, "unit": "GWh", "source": "bnetza_smard_nem", "fundstelle": "wie oben", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "bis Q2 2022 EinsMan, danach Redispatch EE; ≈3,5 % der EE-Erzeugung 2025"},
    {"id": "negative_preisstunden", "value": {"2019": 211, "2020": 298, "2021": 139, "2022": 69, "2023": 301, "2024": 457, "2025": 576}, "unit": "h", "source": "eigene_energycharts", "fundstelle": "negative_preisstunden_de_lu", "confidence": "A", "primaer_gelesen": true, "abgrenzung": "Day-Ahead DE-LU, Stundenmittel; 2024/2025 durch pv magazine gestützt"},
    {"id": "netzentgelt_haushalt_2025_ct_kwh", "value": 10.6, "unit": "ct/kWh netto", "source": "wd5_065_26", "fundstelle": "S. 3 (abgeleitet aus Saarland 11,21 = +5,8 %)", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Bundesdurchschnitt Verteilnetz Haushalte 2025, vor Bundeszuschuss 2026"},
    {"id": "lastsenkung_bev_2030_gw", "value": {"max": 11.6, "median": 3.5}, "unit": "GW", "source": "bnetza_vsm2025_anhang2", "fundstelle": "Abb. 16", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "Modellannahme Cluster BEV"},
    {"id": "biomasse_leistung_gw", "value": {"2024": 9.1, "2045": 3.0}, "unit": "GW", "source": "nep_2037_2045_v2025", "fundstelle": "Tab. 1", "confidence": "B", "primaer_gelesen": true, "abgrenzung": "alle NEP-Szenarien 2045"}
  ],
  "sources": {
    "r21_erklaerung_2026": {"titel": "Erklärung des Expertenrates Klima- und Energiepolitik", "herausgeber": "REPUBLIK21 e. V.", "datum": "2026-11", "url": "https://denkfabrik-r21.de/wp-content/uploads/2026/11/Erklaerung_Expertenrat_R21_November-2026.pdf", "abruf": "2026-11-22"},
    "eigene_energycharts": {"titel": "Eigene Auswertung Energy-Charts 2015–2025", "herausgeber": "Daten-WG / Agent P1-05; Daten Fraunhofer ISE Energy-Charts, CC BY 4.0", "datum": "2026-11-22", "url": "https://api.energy-charts.info/", "abruf": "2026-11-22", "datei": "data/p1_05_dunkelflaute.json"},
    "eigene_factsheet_a": {"titel": "Nachrechnung R21 Factsheet A", "herausgeber": "Daten-WG / Agent P1-05", "datum": "2026-11-22", "url": "", "abruf": "2026-11-22", "datei": "data/p1_05_factsheet_a.json"},
    "energycharts_installed": {"titel": "Energy-Charts installed_power (monatlich)", "herausgeber": "Fraunhofer ISE", "datum": "2026-11", "url": "https://api.energy-charts.info/installed_power?country=de&time_step=monthly&installation_decommission=false", "abruf": "2026-11-22"},
    "ohlendorf_schill_2020": {"titel": "Frequency and duration of low-wind-power events in Germany", "herausgeber": "Environmental Research Letters 15, 084045 (N. Ohlendorf, MCC; W.-P. Schill, DIW)", "datum": "2020", "url": "https://arxiv.org/abs/2003.04133", "abruf": "2026-11-22", "hinweis": "nur Abstract über Websuche"},
    "kittel_schill_2024": {"titel": "Quantifying the Dunkelflaute: An analysis of variable renewable energy droughts in Europe", "herausgeber": "M. Kittel, W.-P. Schill (DIW Berlin)", "datum": "2024", "url": "https://arxiv.org/abs/2410.00244", "abruf": "2026-11-22", "hinweis": "nur Abstract über Websuche"},
    "kittel_roth_schill_2026": {"titel": "Long-duration electricity storage needs for coping with Dunkelflaute events in Europe", "herausgeber": "Nature Communications 17, 4210", "datum": "2026", "url": "https://doi.org/10.1038/s41467-026-72681-5", "abruf": "2026-11-22", "hinweis": "nur Abstract über Websuche"},
    "rbid_bischof_2026": {"titel": "Systemkostenvergleich von neuen Erdgaskraftwerken mit neuen Solar- und Windenergieanlagen an Land", "herausgeber": "RBID GmbH (R. Bischof) im Auftrag von Deutsche Umwelthilfe und Wirtschaftsverband Windkraftwerke", "datum": "2026-04-26", "url": "https://www.duh.de/fileadmin/user_upload/download/Projektinformation/Energiewende/20260426_RBID_Systemkostenvergleich_Erdgas_-_PV_-_Wind_an_Land.pdf", "abruf": "nicht abgerufen (Host nicht freigegeben)"},
    "kfw_555": {"titel": "Batteriespeicher sind Hebel der Energiewende – Großspeicher glätten Strompreise (Fokus Volkswirtschaft Nr. 555)", "herausgeber": "KfW Research", "datum": "2026-08-19", "url": "https://www.kfw.de/PDF/Download-Center/Konzernthemen/Research/PDF-Dokumente-Fokus-Volkswirtschaft/Fokus-2026/Fokus-Nr.-555-August-2026-Batteriespeicher.pdf", "abruf": "2026-11-22"},
    "kfw_elektrolyse_2026": {"titel": "Wasserstoff-Elektrolyse: Ausbau bleibt hinter Erwartungen zurück", "herausgeber": "KfW Research", "datum": "2026-03-04", "url": "https://www.kfw.de/PDF/Download-Center/Konzernthemen/Research/PDF-Auf-einen-Blick/2026_03_04_Elektrolyse.pdf", "abruf": "2026-11-22"},
    "ise_lcoe_2024": {"titel": "Stromgestehungskosten erneuerbare Energien", "herausgeber": "Fraunhofer ISE", "datum": "2024-07", "url": "https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/DE2024_ISE_Studie_Stromgestehungskosten_Erneuerbare_Energien.pdf", "abruf": "2026-11-22"},
    "ise_systemstudie_2026": {"titel": "Systemstudie Deutschland 2026", "herausgeber": "Fichtner IT Consulting, Fraunhofer ISE, EY-Parthenon; Auftraggeber Hitachi Energy Germany AG", "datum": "2026-07-08", "url": "https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/Systemstudie-Deutschland.pdf", "abruf": "2026-11-22"},
    "agora_knde_2023": {"titel": "Klimaneutrales Deutschland – Von der Zielsetzung zur Umsetzung", "herausgeber": "Agora Energiewende", "datum": "2023", "url": "https://www.agora-energiewende.de/fileadmin/Projekte/2023/2023-30_DE_KNDE_Update/A-EW_349_KNDE_Szenariopfade_WEB.pdf", "abruf": "2026-11-22"},
    "ines_dbi_2026": {"titel": "Studie: Deutschland braucht 49 neue Wasserstoffspeicher (Referat INES/DBI)", "herausgeber": "cleanthinking.de", "datum": "2026-11-06", "url": "https://www.cleanthinking.de/?p=1075614", "abruf": "2026-11-22"},
    "bnetza_vsm2025": {"titel": "Veröffentlichung des Versorgungssicherheitsmonitorings", "herausgeber": "Bundesnetzagentur", "datum": "2025-09-03", "url": "https://www.bundesnetzagentur.de/1072798", "abruf": "2026-11-22"},
    "bnetza_vsm2025_anhang2": {"titel": "Versorgungssicherheit Strom, Anhang 2: Annahmen und Szenarienbeschreibung", "herausgeber": "Bundesnetzagentur", "datum": "2025-09", "url": "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Versorgungssicherheit/Monitoring_Strom/DL/Anhang_2.pdf", "abruf": "2026-11-22"},
    "bnetza_stromvkg_2026": {"titel": "StromVKG – Ergebnisse der ersten Ausschreibung für Langzeitkapazitäten", "herausgeber": "Bundesnetzagentur", "datum": "2026-11-03", "url": "https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2026/20261103_StromVKG.html", "abruf": "2026-11-22"},
    "bnetza_bkarta_2025_preisspitzen": {"titel": "Untersuchung zu Strompreisspitzen während Dunkelflauten 2024", "herausgeber": "Bundesnetzagentur / Bundeskartellamt", "datum": "2025-10-21", "url": "https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20251021_Preisspitzen.html", "abruf": "2026-11-22"},
    "bnetza_smard_nem": {"titel": "Netzengpassmanagement: Bericht Gesamtjahr 2022; SMARD Gesamtjahr 2024; SMARD Q4 und Gesamtjahr 2025", "herausgeber": "Bundesnetzagentur / SMARD", "datum": "2023-07 / 2025 / 2026-03-30", "url": "https://www.smard.de/page/en/topic-article/5892/220534/volume-of-measures-stable-in-the-year-as-a-whole", "abruf": "2026-11-22"},
    "nep_2037_2045_v2025": {"titel": "Netzentwicklungsplan Strom 2037 mit Ausblick 2045, Version 2025, 2. Entwurf", "herausgeber": "Übertragungsnetzbetreiber", "datum": "2026-05", "url": "https://www.netzentwicklungsplan.de/sites/default/files/2026-05/NEP_2037_2045_V2025_2_Entwurf_1.pdf", "abruf": "2026-11-22"},
    "wd5_065_26": {"titel": "Netzentgelte im Saarland", "herausgeber": "Wissenschaftliche Dienste des Deutschen Bundestages", "datum": "2026-06-16", "url": "https://www.bundestag.de/resource/blob/1201294/WD-5-065-26.pdf", "abruf": "2026-11-22"}
  }
}
```
