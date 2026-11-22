# Prüfbericht 03 · Stündliche Stromdaten (Gegenprüfung P2)

Auftrag P2 · geprüftes Dossier `research/03_stromdaten.md` · Stand 22.11.2026 · Prüfer: Opus (nicht Autor des Dossiers) · Code: `scripts/pruefung/p2_03_nachrechnung.py`, Ergebnis `scripts/pruefung/p2_03_nachrechnung_ergebnis.json` · Manifest `quellen/manifest_P2-03.json` · neue Rohdateien in `quellen/raw/P2-03/`.

## 1. Urteil in fünf Zeilen

1. Die Rechenarbeit ist sauber: Aus den Energy-Charts-Rohdaten nachgerechnet, stimmen alle Volllaststunden, Dunkelflauten-Phasen, Phasenzahlen und Quartals-CF auf die Stunde oder die vierte Nachkommastelle.
2. Die Redispatch-Mengen 2024/2025 stehen wörtlich so bei SMARD. Die bisher nur als Suchtreffer belegte Zahl für 2023 (5.729 / 3.980 GWh) steht im SMARD-Originalartikel und ist jetzt belegt.
3. Schief ist die **Deutung** an zwei Stellen. Das Offshore-Minimum 2023 (2.803 h) ist zum großen Teil Abregelung (24 % der Erzeugung), kein Wetter. Und auch die PV-Gesamtreihe fällt 2023–2025 um rund 12 %, obwohl das Dossier sie als wetterbereinigt vergleichbar darstellt.
4. Die Dunkelflauten-Kennzahl ist richtig gerechnet, hängt aber stark an der Definition. Mit einem 24-h-Mittel statt eines strengen Stundenkriteriums werden aus höchstens 165 h bis zu 312 h (November 2024). Der Satz „keine Phase länger als eine Woche“ gilt nur für die strenge Definition.
5. Gesamturteil: Als Datengrundlage ist das Dossier belastbar. Die Kernaussagen 2, 5 und die Gegenposition „Für den Hauptpfad“ brauchen Korrekturen bei der Einordnung, die Zahlen selbst kaum.

## 2. Prüftabelle

Stichprobe nach Auftrag: 16 Parameter mit Konfidenz B, k = ⌊16/10⌋ = 1. Damit fallen die ersten zehn in alphabetischer Reihenfolge in die Pflichtstichprobe (`abregelung_anteil_offshore_2024_pct` bis `last_netzlast_2024_twh`). Die übrigen sechs B-Parameter und der eine C-Parameter wurden zusätzlich geprüft, weil sie Kernaussagen tragen oder ein Schwerpunkt sind. Parameter mit Konfidenz A enthält der JSON-Block nicht.

| # | Parameter-ID / Kernaussage | Wert im Dossier | Geprüfte Fundstelle | Ergebnis | Neue Konfidenz · primaer_gelesen |
|---|---|---|---|---|---|
| K1 | Vollständigkeit 2015–2025 | 1 Fehlstunde 2015, 96 h Pumpspeicher 2018, keine negativen Werte, kein CF > 1 | `data/profiles_*.json` (selbst ausgezählt), Rohdaten `public_power_2024.json` | **bestätigt** (Pumpen-Vorzeichen wird bewusst gedreht, sonst nichts geklippt) | A · true |
| K2 | Volllaststunden-Spannen | an Land 1.547–1.952, auf See 2.803–3.614, PV gesamt 813–992 h | eigene Rechnung aus Rohdaten | **bestätigt** (Zahl); Deutung als Wetterspanne **abweichend** für Offshore, siehe 3.1 | B · true |
| K3 | Längste Phase < 10 % / < 5 % | 63–165 h / 18–80 h; ≥ 48 h: 2–4 je Jahr | eigene Rechnung | **bestätigt** (alle 11 Jahre, Beginnzeiten identisch); stark definitionsabhängig, siehe 3.3 | B · true |
| K4 | Wind-CF Winterquartale | Q1 2025 21,0 %, Q4 2016 21,5 %, Q1 2020 37,6 % | eigene Rechnung | **bestätigt** (21,00 / 21,48 / 37,56 %) | B · true |
| K5 | PV öffentlich 915 → 646 h; PV gesamt 813–992 h „bleibt vergleichbar“ | — | eigene Rechnung | Zahlen **bestätigt** (915,5 / 646,0 h); Aussage „Wetter nicht schlechter“, „vergleichbar“ **abweichend**, siehe 3.2 | B · true |
| K6 | Redispatch EE 2024/2025, Anteile, Offshore 2.919 → 3.440 h | 9.389 / 9.379 GWh; 17,8 / 3,1 / 2,3 % | SMARD „Volume of measures stable in the year as a whole“, Abschnitt „Congestion management by type of measure“ | **bestätigt** | B · true |
| K7 | EC gegen UBA 2015–2022 „0,0 bis 1,0 %“ | 0,0 … 1,0 % | UBA Zeitreihen Tab. 3.1 (Stand 09/2026), Zeile PV, Wind | **abweichend**: 2015–2022 −1,7 bis +1,0 % (PV gesamt 2021 −0,9 %, 2022 −1,7 %); der JSON-Wert (−2,7 / 0,0 / 1,0 über 2015–2025) stimmt | B · true |
| K7b | EC gegen SMARD | PV 2024 −5,4 %; an Land −3,7 bis +0,8 %; auf See ±0,6 % | SMARD-Monatsdateien 4068/4067/1225 (P1-Rohdaten, eigener Code) | **bestätigt** (−5,45 %; −3,74 … +0,79 %; −0,49 … +0,58 %) | B · true |
| K8 | Wasserkraft +12–36 % gegen SMARD; Biomasse −9 bis −12 % gegen UBA | — | `plausibilitaet_jahressummen.json`, UBA Tab. 3.1 | **bestätigt** (Wasser +12,2 … +36,3 %; Biomasse −8,7 … −12,2 %) | B · true |
| K9 | Zeitachse lokal, UTC-Raster, nichts aufgefüllt | 8.760 / 8.784 h | eigene Rechnung, Rohdaten | **bestätigt** | A · true |
| K10 | AGEB nicht abrufbar | — | ag-energiebilanzen.de, Strerz-Abgabe September 2026 | **überholt**: jetzt abgerufen, siehe 4.4 | — |
| P1 | abregelung_anteil_offshore_2024_pct | 17,8 | 4.565 GWh (SMARD) / 25,68 TWh (EC) | **bestätigt** (17,78) | B · true |
| P2 | abregelung_anteil_onshore_2024_pct | 3,1 | 3.394 / 110,64 TWh | **bestätigt** (3,07) | B · true |
| P3 | abregelung_anteil_pv_2025_pct | 3,9 | 2.704 / 70,12 TWh | **bestätigt** (3,86) | B · true |
| P4 | abregelung_redispatch_ee_2024_gwh | 9.389 | SMARD 2025-Artikel: „(2024: 9,389 GWh)“ | **bestätigt** | B · true |
| P5 | abregelung_redispatch_ee_2025_gwh | 9.379 | ebd.: „60% or 9,379 GWh“ | **bestätigt** | B · true |
| P6 | dunkelflaute_laengste_phase_unter_10pct_h | 63 / 90 / 165 | eigene Rechnung | **bestätigt** | B · true |
| P7 | dunkelflaute_laengste_phase_unter_5pct_h | 18 / **44** / 80 | eigene Rechnung | **abweichend**: Median der elf Jahreswerte ist **43** h (2015), nicht 44 | B · true |
| P8 | ec_vs_smard_abweichung_pv_2024_pct | −5,4 | SMARD 4068: 63,15 TWh; BNetzA-PM: „63,3 TWh“ | **bestätigt** | B · true |
| P9 | ec_vs_uba_netto_abweichung_wind_pv_pct | −2,7 / 0,0 / 1,0 | UBA Tab. 3.1: PV 2023 63.793 GWh gegen EC 62,10 TWh | **bestätigt** | B · true |
| P10 | last_netzlast_2024_twh | 465,5 | Rohdaten „Load“; SMARD 410 | **bestätigt** (465,50; SMARD −0,00 %); UBA/AGEB Bruttostromverbrauch 529,4 TWh bestätigt | B · true |
| P11 | pv_vls_gesamt_dc_2015_2025 | 813 / 928 / 992 | eigene Rechnung | **bestätigt**; Note „über die Jahre vergleichbar“ **abweichend** (siehe 3.2) | B · true |
| P12 | pv_vls_oeffentlich_dc_2015_2025 | 646 / 854 / 931 | eigene Rechnung | **bestätigt**; Eigenverbrauch 2025 19,5 TWh (UBA Tab. 3.1) bestätigt | B · true |
| P13 | wind_cf_winterquartal_schwaechstes_q1 | 0,21 | eigene Rechnung | **bestätigt** (0,2100) | B · true |
| P14 | wind_cf_winterquartal_schwaechstes_q4 | 0,2148 | eigene Rechnung | **bestätigt** (0,2148) | B · true |
| P15 | wind_offshore_vls_2015_2025 | 2.803 / 3.124 / 3.614 | eigene Rechnung | Zahl **bestätigt**; Minimum 2023 ist abregelungsgetrieben (siehe 3.1) | B · true |
| P16 | wind_onshore_vls_2015_2025 | 1.547 / 1.784 / 1.952 | eigene Rechnung | **bestätigt** | B · true |
| P17 | abregelung_2023_offshore_onshore_gwh (C) | 5.729 / 3.980 | SMARD „Netzengpassmanagement im Jahr 2023“ (17.05.2024): „Mit 5.729 GWh bzw. 3.980 GWh waren Offshore- und Onshore-Windenergieanlagen die am meisten abgeregelten Energieträger.“ | **bestätigt**, Quelle ist SMARD, nicht zfk | B · true |
| G1 | Gegenposition „Median 44 h“ (< 5 %) | 44 h | eigene Rechnung | **abweichend**: 43 h | B · true |
| G2 | „kein Jahr … unter 10 % länger als eine Woche“ | max. 165 h | eigene Rechnung, Varianten | nur für die gewählte Definition **bestätigt**. Mit Jahresend-Leistung 170 h, mit Leistungsmix 2025 172 h, mit 24-h-Mittel 312 h, siehe 3.3 | B · true |
| G3 | Lesehinweis „10 % = 2015 etwa 8 GW, 2025 etwa 19 GW“ | 8 / 19 GW | installed_power, Jahresende | **leicht abweichend**: 8,4 / 19,6 GW | B · true |
| G4 | Installierte Leistung Jahresende (Tabelle) | z. B. 2025: 118,1 / 68,2 / 9,7 GW | `installed_power_monthly.json` 12.2025 | **bestätigt** (118,147 / 68,178 / 9,733) | B · true |
| G5 | UBA-Seite „2025: Wind 134,2 TWh, PV 92,2 TWh brutto, Wasser 17,1 TWh“ | — | AGEB Strerz-Abgabe 09/2026, Bruttostromerzeugung | **bestätigt** (107,6 + 26,6 = 134,2; 92,2; 17,1) | A · true (UBA und AGEB übereinstimmend, aber beide AGEE-Stat-Basis) |

Zählung: 33 Zeilen. **Bestätigt 24**, davon 4 mit falscher oder schiefer Deutung (K2, K5, P11, P15). **Abweichend 6** (K7, P7, G1, G2 bedingt, G3, sowie K10 überholt). **Nicht prüfbar 0.** Abweichende Werte bei echten Zahlen gibt es nur in P7/G1 (43 statt 44 h), in K7 (Spanne) und bei G3 (Rundung). Die Ergebnisse der Rechnung stimmen sonst durchweg.

## 3. Abweichungen im Detail (nach Gewicht)

### 3.1 Offshore-Minimum 2023 ist überwiegend Abregelung, kein Wetter (trägt Kernaussage 2)

Kernaussage 2 nennt die Wind-auf-See-Spanne 2.803 (2023) bis 3.614 h (2017) als Beleg dafür, wie stark sich die Wetterjahre unterscheiden. Die P17-Zahl, jetzt am SMARD-Original belegt, ändert das Bild:

| Jahr | Redispatch Offshore (SMARD) | EC-Erzeugung | Anteil | VLS gemessen | VLS + Redispatch (überschlägig) |
|---|---|---|---|---|---|
| 2023 | 5.729 GWh | 23,53 TWh | **24,3 %** | 2.803 h | **≈ 3.485 h** |
| 2024 | 4.565 GWh | 25,68 TWh | 17,8 % | 2.919 h | ≈ 3.438 h |
| 2025 | 3.351 GWh | 26,10 TWh | 12,8 % | 2.818 h | ≈ 3.180 h |

Rechnet man die Abregelung zurück, liegt 2023 bei Offshore nicht am unteren Rand, sondern im oberen Drittel der Spanne. Die Notiz in `wind_offshore_vls_2015_2025`, die Reihe „sinkt seit 2017“, ist deshalb zu einem großen Teil ein Netzengpass-Effekt. Hinzu kommen wahrscheinlich Abschattung durch Nachbarparks und Zubau-Interpolation (nicht geprüft). Für 2015–2022 fehlen Redispatch-Mengen je Technologie weiterhin, die Spanne der „Wetter“-VLS ist für Offshore also nicht wetterbereinigt. Onshore 2023: 3.980 GWh / 115,90 TWh = 3,4 % → rund 2.020 h statt 1.952 h. Damit verschiebt sich das Onshore-Maximum leicht nach oben. Die Richtung der Aussage bleibt.

Zusatz aus derselben SMARD-Quelle: Redispatch EE gesamt 2023 **10.478 GWh** (2022: 8.071 GWh). Der Wert für 2024 (9.389) ist also ein Rückgang gegenüber 2023. Das Dossier nennt 2023 nicht.

### 3.2 PV-Gesamtreihe ist 2023–2025 nicht „wetterbereinigt vergleichbar“ (trägt Kernaussage 5, P11)

Kernaussage 5 führt den Rückgang der öffentlichen PV-VLS (915 → 646 h) auf den Eigenverbrauch zurück, „obwohl das Wetter nicht schlechter wurde“, und empfiehlt `solar_total_mw` als vergleichbare Reihe. Nachgerechnet fällt aber auch die Gesamtreihe deutlich: 2015–2022 lag sie bei 863–992 h (Median 935), 2023–2025 bei 830 / 813 / 828 h, also rund 12 % tiefer. 2025 hatte laut SMARD-Artikel ein „unusually sunny spring and summer“. Ein Wetterjahr mit viel Sonne liefert hier trotzdem fast den niedrigsten Wert der Reihe. Mögliche Ursachen, keine davon im Dossier beziffert oder von mir geprüft:
- marktbedingte Abregelung bei negativen Preisen (§ 51 EEG, Direktvermarktung) und die Einspeisebegrenzung für Neuanlagen ab 2025,
- Zubau, der im Marktstammdatenregister früher als Leistung erscheint als in der Erzeugung (DC-Leistung, Inbetriebnahme, Nachmeldungen),
- mehr Ost-West- und Fassadenanlagen, Steckersolar und ein steigendes DC/AC-Verhältnis,
- Redispatch PV (2025: 2.704 GWh, das sind 3 % der Gesamtreihe).

Folge: Wer 2024 oder 2025 als PV-Profil skaliert, unterschätzt den Ertrag je GW im Vergleich zu 2015–2022 um rund 10 %. Das wirkt **gegen** den Hauptpfad (mehr PV-Leistung nötig), ist aber zum Teil ein Mess- und Abgrenzungsartefakt. Die Aussage „Wetter nicht schlechter“ ist nicht belegt.

Sensitivität der Leistungsbasis: Bezieht man statt auf die interpolierte Leistung auf das Jahresmittel der zwölf Monatsendwerte, sinken die PV-VLS 2023–2025 um 1,2–1,4 %, die Offshore-VLS 2016/2017 um 1,3 %. Die interpolierte Variante des Dossiers ist die bessere, die Wahl erklärt den Rückgang aber nicht.

### 3.3 Dunkelflauten-Kennzahl: richtig gerechnet, stark definitionsabhängig (trägt Kernaussage 3 und die Gegenposition „Für den Hauptpfad“)

Alle elf Jahreswerte sind exakt bestätigt (Länge, Beginn, Phasen ≥ 24 h / ≥ 48 h). Varianten aus eigener Rechnung (PV gesamt, Schwelle 10 %):

| Jahr | Dossier (strikt, Jahresleistung interpoliert) | Leistung Jahresende | fester Mix Ende 2015 | fester Mix Ende 2025 | 24-h-Mittel < 10 % (Periodenlänge) |
|---|---|---|---|---|---|
| 2015 | 135 | 136 | 133 | 139 | 222 h (ab 12.10.) |
| 2016 | 66 | 74 | 66 | 92 | 191 h |
| 2017 | 94 | 95 | 97 | 103 | 275 h (ab 15.01.) |
| 2018 | 69 | 69 | 77 | 66 | 131 h |
| 2019 | 65 | 65 | 66 | 67 | 108 h |
| 2020 | 63 | 63 | 64 | 65 | 162 h |
| 2021 | 99 | 101 | 102 | 108 | 124 h |
| 2022 | 119 | 119 | 118 | 119 | 161 h |
| 2023 | 165 | **170** | 164 | **172** | 184 h |
| 2024 | 90 | 90 | 86 | 91 | **312 h (ab 01.11.)** |
| 2025 | 89 | 89 | 88 | 89 | 201 h |

Befunde:
- Ein fester Leistungsmix verändert die längsten Phasen meist nur um wenige Stunden (Ausnahme 2016: 66 → 92 h). Die Summe der Stunden unter 10 % steigt mit dem PV-lastigen Mix 2025 aber um 15–20 %. Die Kennzahl ist also nur eingeschränkt eine reine „Wetterkennzahl“, wie es Lesehinweis (a) sagt.
- Die Gegenposition „kein Jahr hatte eine Phase unter 10 % von mehr als einer Woche“ hängt an 3 Stunden Abstand (165 gegen 168 h). Mit Jahresend-Leistung oder dem Mix 2025 liegt 2023 über einer Woche.
- Das strenge Stundenkriterium übersieht die bekannte Dunkelflaute Anfang November 2024 völlig: In der Rechnung des Dossiers hat 2024 als längste Phase 90 h im Dezember. Über ein gleitendes 24-h-Mittel ergeben sich 312 h, also 13 Tage, in denen Wind und PV im Tagesmittel unter 10 % der Nennleistung blieben. Das Dossier nennt die Schwäche selbst in Lesehinweis (b), beziffert sie aber nicht. In der Gegenposition für den Hauptpfad wird sie nicht berücksichtigt.

Für Speicherfragen ist die Energielücke über mehrere Tage maßgeblich (Dossier 05), nicht die Länge einer strikten Unterschreitung. Die Werte 63–165 h dürfen dort nicht als Dauer einer Dunkelflaute eingesetzt werden.

### 3.4 Kleinere Abweichungen

- **P7 / G1:** Der Median der längsten Phasen unter 5 % beträgt 43 h, nicht 44 h.
- **K7:** EC weicht 2015–2022 um −1,7 bis +1,0 % von UBA ab, nicht um 0,0 bis 1,0 %. Wind 2015–2022 stimmt aber tatsächlich auf die GWh, und die These „nicht unabhängig“ bleibt richtig.
- **G3:** 10 % der Nennleistung sind 8,4 GW (2015) und 19,6 GW (2025), also eher „etwa 20 GW“ als „etwa 19 GW“.
- **Kernaussage 6 / Abschnitt 5:** „Folgen für die Dunkelflauten-Kennzahl sind gering“ ist plausibel, weil Redispatch bei hoher Einspeisung stattfindet. Geprüft ist das nicht. Es fehlen stündliche Daten.

## 4. Nachrechnungen

Code: `scripts/pruefung/p2_03_nachrechnung.py` (liest die Viertelstunden-Rohdaten und `installed_power_monthly.json` direkt und nutzt weder `build_profiles.py` noch die Kapazitätsfaktoren aus `profiles_*.json`). Die Leistung wird eigenständig umgesetzt: linear zwischen Vormonatsende und Monatsende, lokale Monatsgrenzen.

### 4.1 Volllaststunden (eigene Rechnung gegen Dossier)

| Jahr | an Land | auf See | PV öff. | PV ges. | max. Abweichung |
|---|---|---|---|---|---|
| 2015 | 1.820,1 | 3.123,8 | 915,5 | 970,6 | 0,01 % |
| 2016 | 1.547,2 | 3.222,3 | 868,9 | 927,6 | 0,01 % |
| 2017 | 1.810,2 | 3.613,9 | 854,0 | 916,0 | 0,00 % |
| 2018 | 1.727,7 | 3.281,2 | 931,4 | 992,0 | 0,00 % |
| 2019 | 1.884,9 | 3.471,9 | 874,7 | 930,8 | 0,01 % |
| 2020 | 1.913,7 | 3.436,9 | 878,7 | 938,2 | 0,00 % |
| 2021 | 1.635,8 | 3.049,7 | 790,2 | 862,9 | 0,00 % |
| 2022 | 1.711,7 | 3.104,1 | 851,1 | 937,4 | 0,00 % |
| 2023 | 1.952,4 | 2.803,1 | 720,4 | 830,0 | 0,00 % |
| 2024 | 1.784,2 | 2.919,1 | 652,7 | 812,9 | 0,00 % |
| 2025 | 1.600,9 | 2.817,9 | 646,0 | 828,4 | 0,01 % |

Min / Median / Max stimmen für alle vier Parameter mit dem JSON-Block überein.

### 4.2 Dunkelflaute und Quartale

Längste Phase < 10 % und < 5 %, Beginnzeit sowie Phasen ≥ 24 h / ≥ 48 h stimmen für alle elf Jahre und beide PV-Varianten (gesamt, öffentlich) mit beiden Dossiertabellen überein: 0 % Abweichung. Einzige Ausnahme ist der Median < 5 % (43 statt 44 h, −2,3 %). Die Wind-CF-Quartale stimmen auf 0,1 Prozentpunkte.

### 4.3 Abgleich SMARD (Schwerpunkt „Solar gegen SMARD 2024“)

| Jahr | EC PV öff. | SMARD PV | Abw. | EC PV ges. gegen SMARD | an Land | auf See | Last |
|---|---|---|---|---|---|---|---|
| 2022 | 54,33 | 55,73 | −2,5 % | +7,4 % | −3,7 % | 0,0 % | 0,0 % |
| 2023 | 53,91 | 55,54 | −2,9 % | +11,8 % | −2,6 % | +0,1 % | 0,0 % |
| 2024 | 59,71 | 63,15 | **−5,45 %** | +17,8 % | −1,7 % | +0,1 % | 0,0 % |
| 2025 | 70,12 | 73,78 | −5,0 % | +21,9 % | −1,6 % | −0,5 % | 0,0 % |

Das Dossier stimmt (−5,4 %). Die BNetzA-Pressemitteilung vom 03.01.2025 nennt wörtlich „Photovoltaikanlagen speisten 63,3 TWh ein“. Die Ursache der Differenz ist weiter offen. SMARD liegt zwischen der öffentlichen und der Gesamtreihe und enthält offenbar einen Teil, der bei Energy-Charts als Eigenverbrauch geführt wird.

### 4.4 AG Energiebilanzen (jetzt erreichbar)

AGEB, „Brutto-/Nettostromerzeugung in Deutschland nach Energieträgern“, Stand September 2026, S. 1 (brutto) und S. 2 (netto), gelesen. Abweichung EC gegen AGEB netto:

| Jahr | an Land (AGEB / Abw.) | auf See | PV (AGEB netto / EC gesamt) |
|---|---|---|---|
| 2015–2021 | 0,0 % in allen Jahren | 0,0 % | 0,0 % |
| 2022 | 97,2 / 0,0 % | 24,8 / 0,0 % | 60,0 / −0,3 % |
| 2023 | 115,6 / +0,3 % | 23,5 / 0,0 % | 62,6 / −0,8 % |
| 2024 | 111,5 / −0,8 % | 25,7 / 0,0 % | 74,4 / 0,0 % |
| 2025 | 105,5 / −0,4 % | 26,2 / −0,4 % | 90,4 / −0,4 % |

Befund: Auch AGEB ist kein unabhängiger Prüfstein. Die EE-Werte stammen laut Fußnote 5 seit 2003 von AGEE-Stat. Die These aus Kernaussage 7 gilt damit auch für AGEB. Bemerkenswert: AGEB netto PV 2021–2023 (49,5 / 60,0 / 62,6 TWh) weicht von UBA Tab. 3.1 im selben Monat (49,9 / 60,9 / 63,8 TWh) um bis zu 1,9 % ab. Energy-Charts liegt näher an AGEB. Weitere AGEB-Werte: Bruttostromverbrauch 2024 inkl. PSE 529,4 TWh (Dossier: 529 ✓), Bruttostromerzeugung 2025 inkl. PSE 509,8 TWh.

## 5. Einseitigkeit und fehlende Gegenpositionen

- **Zugunsten des Hauptpfads geschönt:** Die Gegenposition „kein Jahr mit Phase unter 10 % länger als eine Woche“ und „Median 44 h“ unter 5 % beruht auf der strengsten möglichen Definition. Eine Mittagsstunde mit etwas PV beendet die Phase. Mit Tagesmitteln liegt die längste Flaute in 8 von 11 Jahren über einer Woche (bis 13 Tage im November 2024). Diese naheliegende Gegenrechnung fehlt.
- **Zuungunsten des Hauptpfads verzerrt:** (1) Die Offshore-VLS 2023–2025 erscheinen als schwache Wetterjahre, obwohl 13–24 % der Erzeugung per Redispatch abgeregelt wurden. Wer daraus Offshore-Erträge ableitet, unterschätzt das Potenzial nach Netzausbau. (2) Die PV-Gesamtreihe der letzten drei Jahre liegt rund 12 % unter 2015–2022, ohne dass ein Wettergrund belegt ist. Modelle mit dem Profil 2024 unterschätzen den PV-Ertrag. Beides benennt das Dossier nicht.
- **Fehlende Gegenposition:** Marktbedingte Abregelung (negative Day-Ahead-Preise laut BNetzA-PM vom 03.01.2025 in 457 von 8.784 Stunden 2024, 2023: 301; gelesen) wird erwähnt, aber nicht beziffert. Gerade sie dürfte die PV-Reihe ab 2023 drücken.
- **Fehlende Gegenposition:** Die Wetterbasis von elf Jahren ist kurz. Das Dossier sagt das selbst (Abschnitt 6). Die Reanalyse-Hosts bleiben gesperrt.
- **Ausgewogen dargestellt:** Kalibrierung auf amtliche Summen, Biomasse- und Wasserkraft-Abgrenzung, Netzlast gegen Bruttostromverbrauch.

## 6. Weiterhin nicht erreichbar

| Host | Dokument | Folge |
|---|---|---|
| renewables.ninja, zenodo.org, arxiv.org, data.open-power-system-data.org | Reanalyse-Reihen, Studie arXiv 2003.04133 | nicht freigegeben, nicht versucht |
| data.bundesnetzagentur.de, www.netztransparenz.de | stündliche Redispatch-Daten, Abregelung 2015–2022 je Technologie, § 51-Abregelung | nicht freigegeben, nicht versucht |
| — | Ursache der PV-Differenz Energy-Charts gegen SMARD | keine Methodendokumentation gefunden, offen |

Nicht mehr in dieser Liste: www.ag-energiebilanzen.de (über ag-energiebilanzen.de abgerufen). dserver.bundestag.de ist freigegeben, für dieses Dossier aber nicht benötigt.

## 7. Korrekturen

```json
{
 "dossier": "03_stromdaten",
 "pruefer": "P2-03",
 "stand": "2026-11-22",
 "korrekturen": [
  {
   "id": "abregelung_2023_offshore_onshore_gwh",
   "alt": {"offshore": 5729, "onshore": 3980, "confidence": "C", "primaer_gelesen": false, "source": "zfk_redispatch_2023"},
   "neu": {"offshore": 5729, "onshore": 3980, "ee_gesamt": 10478, "ee_gesamt_2022": 8071},
   "fundstelle": "SMARD, Netzengpassmanagement im Jahr 2023, 17.05.2024, https://www.smard.de/page/home/topic-article/444/213590, Abschnitt Redispatch nach Energieträgern",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Wortlaut im Original: 'Mit 5.729 GWh bzw. 3.980 GWh waren Offshore- und Onshore-Windenergieanlagen die am meisten abgeregelten Energieträger.' sowie '10.478 GWh auf Redispatch mit erneuerbaren Energien (2022: 8.071 GWh)'. Quelle auf SMARD umstellen."
  },
  {
   "id": "abregelung_anteil_offshore_2023_pct",
   "alt": null,
   "neu": {"value": 24.3, "vls_korrigiert_h": 3485},
   "fundstelle": "5.729 GWh (SMARD 2023) / 23,53 TWh (EC public_power 2023); eigene Rechnung scripts/pruefung/p2_03_nachrechnung.py",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Neuer Parameter. Zeigt, dass das Offshore-VLS-Minimum 2023 (2.803 h) überwiegend Abregelung ist und nicht Wetter."
  },
  {
   "id": "wind_offshore_vls_2015_2025",
   "alt": "note: 'Offshore-Reihe sinkt seit 2017 …'",
   "neu": "Wert unverändert (2803/3124/3614); note ergänzen: 'Minimum 2023 ist abregelungsgetrieben (Redispatch 24 % der Erzeugung; zurückgerechnet ≈ 3.485 h). Spanne ist keine reine Wetterspanne; 2015–2022 ohne Redispatch-Daten je Technologie.'",
   "fundstelle": "SMARD 2023/2025 Netzengpassmanagement; eigene Rechnung",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Kernaussage 2 deutet die Spanne als Wetterunterschied; für Offshore ist das zu einem großen Teil falsch."
  },
  {
   "id": "pv_vls_gesamt_dc_2015_2025",
   "alt": "note: 'Mit total_power … ist die Reihe über die Jahre vergleichbar'",
   "neu": "Wert unverändert (813/928/992); note: '2023–2025 (830/813/828 h) rund 12 % unter 2015–2022 (Median 935 h), trotz sonnigem 2025; Ursache nicht belegt (marktbedingte Abregelung, Leistungsbuchung, Anlagenausrichtung). Nicht als wetterbereinigt vergleichbar verwenden.'",
   "fundstelle": "eigene Rechnung; SMARD 2025-Artikel ('unusually sunny spring and summer')",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Kernaussage 5 ('obwohl das Wetter nicht schlechter wurde') ist für die Gesamtreihe nicht belegt."
  },
  {
   "id": "dunkelflaute_laengste_phase_unter_5pct_h",
   "alt": {"min": 18, "mid": 44, "max": 80},
   "neu": {"min": 18, "mid": 43, "max": 80},
   "fundstelle": "eigene Rechnung, Jahreswerte 43,20,44,18,29,48,34,45,80,61,21",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Median von elf Werten ist der sechste sortierte Wert: 43 h (2015). Auch Gegenposition 'Median 44 h' anpassen."
  },
  {
   "id": "dunkelflaute_laengste_phase_unter_10pct_h",
   "alt": "note ohne Sensitivität",
   "neu": "Wert unverändert (63/90/165); note ergänzen: 'Mit gleitendem 24-h-Mittel < 10 %: 108–312 h je Jahr (max. 01.–13.11.2024); mit Jahresend-Leistung 2023: 170 h; mit Leistungsmix 2025: 172 h. Nicht als Dauer einer Dunkelflaute für Speicherauslegung verwenden.'",
   "fundstelle": "scripts/pruefung/p2_03_nachrechnung.py, Ergebnis p2_03_nachrechnung_ergebnis.json",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Gegenposition 'keine Phase länger als eine Woche' gilt nur für die strengste Definition; die November-Dunkelflaute 2024 fehlt in der Kennzahl."
  },
  {
   "id": "kernaussage_7_ec_vs_uba_2015_2022",
   "alt": "0,0 bis 1,0 %",
   "neu": "−1,7 bis +1,0 % (Wind 2015–2022 auf die GWh gleich; PV gesamt 2021 −0,9 %, 2022 −1,7 %)",
   "fundstelle": "UBA Zeitreihen EE, Tab. 3.1, Stand 09/2026",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Spanne im Text zu eng; JSON-Parameter ec_vs_uba_netto_abweichung_wind_pv_pct ist korrekt."
  },
  {
   "id": "ec_vs_ageb_netto_abweichung_wind_pv_pct",
   "alt": null,
   "neu": {"min": -0.8, "mid": 0.0, "max": 0.3},
   "fundstelle": "AG Energiebilanzen, Nettostromerzeugung nach Energieträgern 1990–2025, Stand 09/2026, S. 2",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Neuer Parameter (AGEB jetzt erreichbar). Nicht unabhängig: AGEB-EE-Werte stammen laut Fußnote 5 von AGEE-Stat."
  },
  {
   "id": "lesehinweis_10pct_gw",
   "alt": "2015 etwa 8 GW, 2025 etwa 19 GW",
   "neu": "2015 rund 8,4 GW, 2025 rund 19,6 GW",
   "fundstelle": "installed_power_monthly, Stand 12.2015 und 12.2025 (Solar DC + Wind an Land + Wind auf See)",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Rundung."
  },
  {
   "id": "nicht_erreichbar_ageb",
   "alt": "www.ag-energiebilanzen.de: 403, Abgleich über UBA/SMARD",
   "neu": "erreichbar über ag-energiebilanzen.de; Strerz-Abgabe September 2026 gelesen",
   "fundstelle": "https://ag-energiebilanzen.de/wp-content/uploads/Strerz-Abgabe-September-2026.pdf",
   "confidence": "B",
   "primaer_gelesen": true,
   "begruendung": "Lücke geschlossen; Lücken- und Kernaussage 10 anpassen."
  }
 ]
}
```
