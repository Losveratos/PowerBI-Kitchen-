# Dossier 03 · Stündliche Stromdaten über elf Wetterjahre (2015–2025)

> Stand Phase 1. Geprüft in `pruefung/03_pruefung.md`; maßgeblich sind die korrigierten Werte in `data/model_params.json`.

Auftrag P1-03 · Stand 22.11.2026 · Agent: Sonnet · Ergebnisdateien: `data/profiles_<jahr>.json`, `data/stats_wetterjahre.json`, `data/plausibilitaet_jahressummen.json`, Skripte `scripts/build_profiles.py` und `scripts/check_plausibility.py`, Manifest `quellen/manifest_P1-03_stromdaten.json`.

## Kernaussagen

1. **Die Lücke ist geschlossen:** Es liegen elf vollständige Kalenderjahre 2015–2025 stündlich vor (Last, PV öffentlich und gesamt, Wind an Land, Wind auf See, Laufwasser, Biomasse, Pumpspeicher Erzeugung und Pumpen) mit Offshore-Reihe. Außer einer fehlenden Stunde am 01.01.2015 und 96 fehlenden Pumpspeicher-Stunden in 2018 gibt es keine Lücken, keine negativen Werte, keine Kapazitätsfaktoren über 1 (Konfidenz A für die Vollständigkeit, selbst geprüft).
2. **Wetterjahre unterscheiden sich stark:** Volllaststunden Wind an Land 1.547 (2016) bis 1.952 (2023), Wind auf See 2.803 (2023) bis 3.614 (2017), PV gesamt 813 bis 992 h (je DC-Leistung). Ein Einzeljahr trägt keine Dunkelflauten-Aussage (B).
3. **Längste Phase mit Wind+PV-Kapazitätsfaktor unter 10 %:** 63 bis 165 Stunden je Jahr, Maximum 165 h am 22.–29.01.2023; unter 5 %: 18 bis 80 h, Maximum 80 h Ende November 2023 (B). Phasen von mindestens 48 h unter 10 % kommen in jedem Jahr 2 bis 4 Mal vor.
4. **Schwächstes Winterquartal (Wind):** Q1 2025 mit 21,0 % (kapazitätsgewichteter Wind-CF) und Q4 2016 mit 21,5 %; zum Vergleich Q1 2020 mit 37,6 % (B).
5. **Eigenverbrauch verzerrt die PV-Reihe:** Aus `public_power` sinken die PV-Volllaststunden von 915 (2015) auf 646 (2025), obwohl das Wetter nicht schlechter wurde. Grund ist der wachsende, nicht erfasste Eigenverbrauch. Mit `total_power` bleiben es 813–992 h (B). Wer Kapazitätsfaktoren braucht, nimmt `solar_total_mw`.
6. **Abregelung:** Redispatch-Abregelung EE lag 2024 bei 9.389 GWh und 2025 bei 9.379 GWh (SMARD/BNetzA, B). Das sind 2024 rund 17,8 % der Offshore-, 3,1 % der Onshore- und 2,3 % der PV-Einspeisung; Offshore-Volllaststunden steigen damit von 2.919 auf rund 3.440 h. Marktbedingte Abregelung (negative Preise, Direktvermarktung) ist darin nicht enthalten (B).
7. **Der Abgleich gegen veröffentlichte Jahreswerte ist weniger unabhängig, als er aussieht:** Energy-Charts weicht von UBA/AGEE-Stat (Tab. 3.1) für Wind und PV 2015–2022 um 0,0 bis 1,0 % ab, also auf die GWh genau. Die Reihen sind offenbar auf die amtliche Jahressumme kalibriert (B). Unabhängiger ist der Vergleich mit SMARD: PV −5,4 % in 2024, Wind an Land −3,7 bis +0,8 %, Offshore ±0,6 %.
8. **Wasserkraft und Biomasse folgen anderen Abgrenzungen:** Energy-Charts-Wasserkraft liegt 12–36 % über SMARD (kleine Anlagen sind dort nicht gemeldet), Biomasse 9–12 % unter UBA (ohne Abfallanteil; mit biogenem Abfall 17–21 % darunter; es ist die „öffentliche“ Nettoerzeugung) (B).
9. **Zeitachse:** Die Quelle liefert Viertelstunden in UTC. Alle Reihen sind auf lokale Kalenderjahre (8.760 oder 8.784 h) ausgerichtet; Sommerzeit wird über die UTC-Achse sauber abgebildet, nichts wird aufgefüllt (A).
10. **Offen:** Hochaufgelöste Redispatch-Daten für 2015–2022, ENTSO-E-Originalreihen, AGEB-Tabellen und renewables.ninja waren nicht abrufbar (siehe Lücken).

## 1. Datenquellen

| Quelle | Endpunkt (funktionierende Form) | Auflösung | Lizenz | Zeitzone, Besonderheiten |
|---|---|---|---|---|
| Energy-Charts (Fraunhofer ISE) | `https://api.energy-charts.info/public_power?country=de&start=2024-01-01&end=2024-12-31` | 15 min (2015–2025), je Jahr ein Abruf, rund 5 MB | CC BY 4.0, Nennung „Energy-Charts.info“ (OpenAPI-Text, gelesen) | `unix_seconds` = Beginn der Periode in UTC; Tagesformat der Parameter lokal; Erzeugung = öffentliche Nettostromerzeugung ohne Eigenverbrauch; „Load“ = Netzlast |
| Energy-Charts | `.../total_power?country=de&start=...&end=...` | 15 min | CC BY 4.0 | Zusätzlich Eigenverbrauch (Industrie, Haushalts-PV); nur Deutschland; „Load (incl. self-consumption)“ |
| Energy-Charts | `.../installed_power?country=de&time_step=monthly&installation_decommission=false` und `yearly` | monatlich/jährlich, GW | CC BY 4.0 | Wert = Bestand am **Ende** der Periode; Monatsreihe nur für Wind, Solar, Biomasse, Batterie; Wasserkraft und Pumpspeicher nur jährlich |
| SMARD (Bundesnetzagentur) | `https://www.smard.de/app/chart_data/<filter>/DE/index_<auflösung>.json`, dann `<filter>_DE_<auflösung>_<unix-ms>.json` | hour (Wochenblöcke), month (Jahresblöcke) u. a. | CC BY 4.0 laut Auftrag (nicht gesondert geprüft) | Zeitstempel in ms, Beginn lokal; Filter: 410 Netzlast, 4068 PV, 4067 Wind an Land, 1225 Wind auf See, 4066 Biomasse, 1226 Wasserkraft |

Rate-Limit Energy-Charts: 2 Anfragen je Minute (Burst 4), laut OpenAPI-Text. Beim Abruf von 22 Jahresdateien ist kein 429 aufgetreten.

**Behandlung von Zeit und Lücken:** Die Rohdaten tragen UTC. `build_profiles.py` bildet das lokale Kalenderjahr (Europe/Berlin) auf eine UTC-Stundenachse ab: 8.760 Stunden, in Schaltjahren (2016, 2020, 2024) 8.784. Die Stunde 02:00 kommt im Herbst doppelt vor, im Frühjahr fehlt sie; `timestamps_utc` ist eindeutig, `timestamps` (lokal, naiv) ist für Anzeige. Ein Stundenwert gilt nur, wenn alle vier Viertelstunden vorliegen; sonst `null`. Es wird nichts interpoliert oder aufgefüllt.

## 2. Aufbereitete Dateien

`data/profiles_<jahr>.json` (je rund 2,4 MB, 2015–2025): Aufbau wie `strommix/data/profiles_2024.json` (`meta`, `series` mit `label_de`, `available`, `mandatory`, `coverage`, `annual_sum_mwh_covered_period`, `hourly_profile`, `timestamps`), dazu je Reihe `mw`, `capacity_factor`, `full_load_hours`, `installed_gw_*`. Unterschiede, die das Modell beachten muss:

- Reihennamen wie im Strommix-Modell (`load_mw`, `solar_mw`, `wind_onshore_mw`, `wind_offshore_mw`, `hydro_ror_mw`, `biomass_mw`); neu: `solar_total_mw`, `pumped_gen_mw`, `pumped_cons_mw`.
- `timestamps` liegt auf Dateiebene (nicht je Reihe), dazu `timestamps_utc`. Die Modellfunktion in `strommix/scripts/model.py` liest `s["timestamps"]` je Reihe; hier ist eine kleine Anpassung nötig (nicht von diesem Auftrag geändert).
- `hourly_profile` enthält `null` an fehlenden Stunden; 2015 eine Stunde, 2018 bei den Pumpspeicher-Reihen 96 Stunden (21.01. 24 h, 02.08. 48 h, 23.08. 24 h). Das Modell muss `null` behandeln.
- Die Normierung (Summe = 1) bleibt erhalten, damit alte Aufrufe funktionieren.

Jahressummen und installierte Leistung (Jahresende):

| Jahr | Last TWh | PV öff. | PV ges. | Wind an Land | Wind auf See | Laufwasser | Biomasse | Pumpen (Verbrauch) |
|---|---|---|---|---|---|---|---|---|
| 2015 | 501,9 | 35,2 | 37,3 | 70,9 | 8,2 | 17,7 | 39,7 | 9,5 |
| 2016 | 503,9 | 34,5 | 36,8 | 66,3 | 12,1 | 19,5 | 40,2 | 9,2 |
| 2017 | 506,8 | 35,4 | 38,0 | 86,3 | 17,4 | 19,4 | 40,2 | 7,4 |
| 2018 | 509,2 | 40,8 | 43,5 | 88,7 | 19,2 | 16,7 | 39,8 | 11,7 |
| 2019 | 497,4 | 41,7 | 44,3 | 99,2 | 24,4 | 18,0 | 40,1 | 11,0 |
| 2020 | 485,4 | 45,4 | 48,5 | 102,7 | 26,9 | 17,0 | 41,0 | 12,6 |
| 2021 | 504,6 | 45,3 | 49,5 | 90,3 | 24,0 | 17,9 | 40,6 | 10,5 |
| 2022 | 482,3 | 54,3 | 59,8 | 97,2 | 24,8 | 15,9 | 39,4 | 13,6 |
| 2023 | 458,4 | 53,9 | 62,1 | 115,9 | 23,5 | 18,1 | 36,6 | 12,7 |
| 2024 | 465,5 | 59,7 | 74,4 | 110,6 | 25,7 | 20,4 | 37,0 | 13,1 |
| 2025 | 465,8 | 70,1 | 90,0 | 105,1 | 26,1 | 15,4 | 36,1 | 12,7 |

Installierte Leistung am Jahresende in GW (Energy-Charts installed_power; PV als DC):

| Jahr | PV (DC) | Wind an Land | Wind auf See | Biomasse | Pumpspeicher |
|---|---|---|---|---|---|
| 2015 | 39,2 | 41,3 | 3,4 | 6,9 | 9,5 |
| 2016 | 40,7 | 45,3 | 4,2 | 7,1 | 9,5 |
| 2017 | 42,4 | 50,2 | 5,5 | 7,4 | 9,5 |
| 2018 | 45,4 | 52,3 | 6,5 | 7,9 | 9,9 |
| 2019 | 49,4 | 53,2 | 7,7 | 8,2 | 10,0 |
| 2020 | 54,6 | 54,4 | 7,9 | 8,6 | 10,0 |
| 2021 | 60,3 | 56,0 | 7,9 | 8,7 | 10,0 |
| 2022 | 67,8 | 58,0 | 8,2 | 8,8 | 10,0 |
| 2023 | 83,3 | 61,0 | 8,5 | 8,8 | 10,0 |
| 2024 | 100,8 | 63,6 | 9,2 | 8,9 | 9,9 |
| 2025 | 118,1 | 68,2 | 9,7 | 9,0 | 9,9 |

## 3. Wetterjahr-Kennzahlen

Volllaststunden = Σ stündlicher Kapazitätsfaktor mit monatsgenauer, linear interpolierter Leistung; Wind-CF = (Onshore + Offshore) / Summe der Nennleistungen. Erzeugung ist **nach** Abregelung.

| Jahr | PV öffentl. (DC) | PV gesamt (DC) | Wind an Land | Wind auf See | Wind-CF Jahr (ges.) | Wind-CF Q1 | Wind-CF Q4 |
|---|---|---|---|---|---|---|---|
| 2015 | 916 | 971 | 1.820 | 3.124 | 21,8 % | 26,4 % | 27,5 % |
| 2016 | 869 | 928 | 1.547 | 3.222 | 19,1 % | 26,2 % | 21,5 % |
| 2017 | 854 | 916 | 1.810 | 3.614 | 22,6 % | 25,2 % | 31,4 % |
| 2018 | 931 | 992 | 1.728 | 3.281 | 21,5 % | 27,2 % | 27,1 % |
| 2019 | 875 | 931 | 1.885 | 3.472 | 23,7 % | 32,7 % | 27,5 % |
| 2020 | 879 | 938 | 1.914 | 3.437 | 24,0 % | 37,6 % | 26,8 % |
| 2021 | 790 | 863 | 1.636 | 3.050 | 20,7 % | 25,4 % | 25,6 % |
| 2022 | 851 | 937 | 1.712 | 3.104 | 21,5 % | 31,5 % | 24,1 % |
| 2023 | 720 | 830 | 1.952 | 2.803 | 23,5 % | 29,5 % | 32,5 % |
| 2024 | 653 | 813 | 1.784 | 2.919 | 21,9 % | 30,8 % | 24,4 % |
| 2025 | 646 | 828 | 1.601 | 2.818 | 20,0 % | 21,0 % | 26,4 % |

**Dunkelflauten-Kennzahl:** Phase mit Kombi-CF (PV gesamt + Wind an Land + Wind auf See, geteilt durch die Summe der Nennleistungen des jeweiligen Jahres) unter 10 % beziehungsweise 5 %, am Stück. Lokale Zeit.

| Jahr | längste Phase < 10 % | Beginn (lokal) | Phasen ≥ 24 h / ≥ 48 h | längste Phase < 5 % | Beginn (lokal) |
|---|---|---|---|---|---|
| 2015 | 135 h | 2015-01-18 15:00 bis 01-24 05:00 | 7 / 2 | 43 h | 2015-01-19 15:00 |
| 2016 | 66 h | 2016-01-19 15:00 bis 01-22 08:00 | 10 / 3 | 20 h | 2016-12-18 14:00 |
| 2017 | 94 h | 2017-11-29 02:00 bis 12-02 23:00 | 10 / 4 | 44 h | 2017-01-23 15:00 |
| 2018 | 69 h | 2018-11-22 14:00 bis 11-25 10:00 | 10 / 2 | 18 h | 2018-01-26 15:00 |
| 2019 | 65 h | 2019-11-19 16:00 bis 11-22 08:00 | 7 / 2 | 29 h | 2019-11-24 21:00 |
| 2020 | 63 h | 2020-12-08 13:00 bis 12-11 03:00 | 6 / 2 | 48 h | 2020-12-08 23:00 |
| 2021 | 99 h | 2021-01-06 07:00 bis 01-10 09:00 | 11 / 4 | 34 h | 2021-11-15 16:00 |
| 2022 | 119 h | 2022-12-08 12:00 bis 12-13 10:00 | 8 / 3 | 45 h | 2022-12-10 13:00 |
| 2023 | 165 h | 2023-01-22 07:00 bis 01-29 03:00 | 6 / 2 | 80 h | 2023-11-29 22:00 |
| 2024 | 90 h | 2024-12-10 14:00 bis 12-14 07:00 | 5 / 3 | 61 h | 2024-12-10 20:00 |
| 2025 | 89 h | 2025-02-12 16:00 bis 02-16 08:00 | 7 / 4 | 21 h | 2025-11-08 14:00 |

Dieselbe Kennzahl mit PV nur öffentlich (Eigenverbrauch ausgeblendet; in Datei `stats_wetterjahre.json` unter `dunkelflaute_wind_pv`):

| Jahr | längste Phase < 10 % | längste Phase < 5 % |
|---|---|---|
| 2015 | 135 h (2015-01-18) | 43 h (2015-01-19) |
| 2016 | 74 h (2016-12-12) | 20 h (2016-12-18) |
| 2017 | 94 h (2017-11-29) | 44 h (2017-01-23) |
| 2018 | 69 h (2018-11-22) | 18 h (2018-01-26) |
| 2019 | 66 h (2019-11-19) | 37 h (2019-11-19) |
| 2020 | 63 h (2020-12-08) | 48 h (2020-12-08) |
| 2021 | 99 h (2021-01-06) | 40 h (2021-01-08) |
| 2022 | 126 h (2022-12-08) | 68 h (2022-12-09) |
| 2023 | 165 h (2023-01-22) | 80 h (2023-11-29) |
| 2024 | 132 h (2024-11-08) | 64 h (2024-11-05) |
| 2025 | 108 h (2025-11-06) | 44 h (2025-11-08) |

Lesehinweise: (a) Der Kombi-CF wird je Jahr auf die Nennleistung dieses Jahres bezogen. 10 % bedeuten 2015 etwa 8 GW, 2025 etwa 19 GW. Die Phasen sind deshalb als Wetterkennzahl vergleichbar, nicht als Absolutlücke. (b) Eine kurze Überschreitung der Schwelle (etwa Mittags-PV) beendet die Phase; die tatsächliche Flautenperiode ist oft länger. (c) Das windschwächste Winterquartal ist Q1 2025 (21,0 %), das schwächste Q4 2016 (21,5 %). Meteorologischer Winter (Dez–Feb) ist nicht ausgewiesen, nur Jan–Feb in der Datei.

## 4. Plausibilität gegen veröffentlichte Jahreswerte

Referenz: UBA/AGEE-Stat, Zeitreihen Stand 09/2026, Tab. 3.1 (Nettostromerzeugung) und Tab. 7 (Bruttostromverbrauch), selbst aus der Excel-Datei gelesen. Abweichung Energy-Charts gegen Referenz in Prozent:

| Jahr | Wind an Land | Wind auf See | PV gesamt | PV öffentl. | Wasserkraft | Biomasse | Last / Bruttostromverbrauch |
|---|---|---|---|---|---|---|---|
| 2015 | -0,0 % | -0,0 % | 0,0 % | -0,0 % | -0,0 % | -10,2 % | 83,6 % |
| 2016 | -0,0 % | -0,0 % | -0,0 % | -0,0 % | 0,0 % | -10,1 % | 83,9 % |
| 2017 | -0,0 % | -0,0 % | 0,0 % | 0,0 % | -0,0 % | -10,1 % | 84,2 % |
| 2018 | 0,0 % | 0,0 % | -0,0 % | 0,1 % | -0,0 % | -10,1 % | 85,6 % |
| 2019 | 0,0 % | 0,0 % | 0,0 % | 0,8 % | -0,0 % | -9,0 % | 86,1 % |
| 2020 | 0,0 % | -0,0 % | -0,0 % | 1,0 % | -0,0 % | -8,7 % | 87,0 % |
| 2021 | -0,0 % | -0,0 % | -0,9 % | 0,3 % | -0,0 % | -9,6 % | 87,8 % |
| 2022 | -0,0 % | 0,0 % | -1,7 % | -0,3 % | -0,0 % | -11,3 % | 87,3 % |
| 2023 | 0,3 % | -0,0 % | -2,7 % | -0,9 % | -0,0 % | -12,2 % | 87,9 % |
| 2024 | -0,8 % | 0,0 % | 0,5 % | -0,7 % | -0,0 % | -12,1 % | 88,0 % |
| 2025 | -0,4 % | -0,4 % | -0,5 % | -1,1 % | -1,1 % | -10,6 % | 88,0 % |

Nicht unabhängig: Wind und PV stimmen bis 2022 auf die GWh, weil beide Datensätze auf AGEE-Stat abgestimmt sind. Die Abweichungen ab 2023 sind die vorläufigen Werte der letzten Jahre. Biomasse liegt strukturell unter UBA, weil Energy-Charts nur die öffentliche Nettoeinspeisung führt. Die Netzlast ist per Definition kleiner als der Bruttostromverbrauch (Verluste, Kraftwerkseigenverbrauch, Eigenverbrauch); der Quotient 84 bis 88 % ist nur ein Konsistenzblick.

Unabhängigerer Abgleich Energy-Charts gegen SMARD (Jahressummen aus Monatswerten, selbst abgerufen):

| Jahr | PV | Wind an Land | Wind auf See | Last | Biomasse | Wasserkraft (Laufwasser+Speicher) |
|---|---|---|---|---|---|---|
| 2015 | 1,4 % | -0,4 % | -0,0 % | -0,0 % | -0,0 % | 32,4 % |
| 2016 | -1,5 % | 0,0 % | -0,0 % | -0,0 % | -2,2 % | 12,2 % |
| 2017 | -1,0 % | 0,4 % | -0,0 % | 0,0 % | -1,0 % | 28,1 % |
| 2018 | -1,0 % | -0,7 % | 0,6 % | -0,0 % | 0,8 % | 15,3 % |
| 2019 | -0,1 % | -0,6 % | -0,0 % | -0,0 % | 1,6 % | 21,2 % |
| 2020 | -0,7 % | -0,3 % | 0,1 % | -0,0 % | 2,5 % | 16,3 % |
| 2021 | -2,0 % | 0,8 % | 0,0 % | -0,0 % | 6,1 % | 30,9 % |
| 2022 | -2,5 % | -3,7 % | 0,0 % | -0,0 % | 4,4 % | 36,3 % |
| 2023 | -2,9 % | -2,6 % | 0,1 % | -0,0 % | -1,8 % | 31,3 % |
| 2024 | -5,4 % | -1,7 % | 0,1 % | -0,0 % | 2,3 % | 26,9 % |
| 2025 | -5,0 % | -1,6 % | -0,5 % | -0,0 % | 0,5 % | 17,9 % |

Befund: Wind und Last stimmen innerhalb weniger Prozent (Last identisch, gleiche ENTSO-E-Basis). PV liegt bei Energy-Charts 2024/25 um 5 % unter SMARD, 2021–2023 um 2–3 %; die BNetzA-Pressemitteilung (gelesen) nennt für 2024 63,3 TWh Einspeisung gegen 59,7 TWh bei Energy-Charts und 60,1 TWh bei UBA (netto ohne Selbstverbrauch). Die Ursache ist offen. Wasserkraft: SMARD enthält nur gemeldete Großanlagen, Energy-Charts ist auf die UBA-Summe inklusive Kleinwasserkraft skaliert.

## 5. Abregelung: Größe des Effekts und Korrekturidee

Die Messwerte sind Erzeugung nach Abregelung. Die amtlichen Redispatch-Mengen (SMARD-Seite zum Netzengpassmanagement, gelesen):

| Größe | 2024 | 2025 |
|---|---|---|
| Redispatch-Reduktion Erzeugungsanlagen gesamt | 14.469 GWh | 15.549 GWh |
| davon Erneuerbare | 9.389 GWh | 9.379 GWh |
| Wind auf See | 4.565 GWh | 3.351 GWh |
| Wind an Land | 3.394 GWh | 3.225 GWh |
| PV | 1.394 GWh | 2.704 GWh |
| Anteil an EC-Erzeugung: Offshore / Onshore / PV öffentlich | 17,8 % / 3,1 % / 2,3 % | 12,9 % / 3,1 % / 3,9 % |
| Korrigierte Volllaststunden Onshore / Offshore (überschlägig) | 1.839 / 3.438 | 1.650 / 3.180 |

Der Effekt trifft Wind auf See am stärksten (Netzanbindung, Engpass Nord–Süd) und ist in 2024 durch den sehr windigen Dezember überhöht. Für 2023 meldet ein Suchtreffer (zfk, Konfidenz C, nicht im Original gelesen) 5.729 GWh Offshore und 3.980 GWh Onshore.

**Korrekturvorschlag:** `CF_korr = (Erzeugung + Abregelung) / (Leistung × Stunden)`. Jahressummen reichen für eine Korrektur der Volllaststunden. Für eine stündliche Korrektur fehlen stündliche Redispatch-Mengen je Technologie; als Setzung (M) ließe sich die Jahresmenge proportional auf Stunden mit hohem CF (über 70 % der Nennleistung bei Wind) verteilen. Folgen für die Dunkelflauten-Kennzahl sind gering, weil Abregelung bei hoher Einspeisung stattfindet und Flautenphasen kaum betrifft. Nicht enthalten ist die marktbedingte Abregelung (negative Preise, Direktvermarktung nach §51 EEG), die zusätzlich zu den Redispatch-Zahlen anfällt; sie wurde in diesem Lauf nicht beziffert.

## 6. Reanalyse-Reihen (nur dokumentiert, nicht geladen)

| Reihe | Abdeckung | Zugang | Status |
|---|---|---|---|
| renewables.ninja (Staffell/Pfenninger), MERRA-2 mit Bias-Korrektur | laut Sekundärquelle 1980–2019 für Europa, stündlich, länderweite Kalibrierung | Host nicht freigegeben | nicht abgerufen; Angabe aus Suchtreffer (C) |
| Tröndle/Pfenninger, 50-km-Raster Europa, Zenodo | 2000–2016, stündlich (Suchtreffer) | zenodo.org nicht freigegeben | nicht abgerufen (C) |
| Open Power System Data, ENTSO-E Transparency | Last und Erzeugung seit 2015 | Hosts nicht freigegeben | nicht abgerufen |
| Studie „Frequency and duration of low-wind-power events in Germany“ (arXiv 2003.04133), 40 Jahre MERRA-2 | 1980–2019 | arXiv nicht freigegeben | nicht gelesen (C) |

Folgerung: Für mehr als elf Wetterjahre (etwa 30–40 Jahre als Gegenstück zum Messzeitraum) braucht es eine Reanalyse-Reihe. Wegen der Freigaben muss der Mensch entscheiden, ob zusätzliche Hosts freigegeben werden.

## Gegenpositionen

- **Gegen den Hauptpfad:** Die längsten Phasen unter 10 % (bis 165 h) und die 2–4 Phasen von mehr als 48 h je Jahr zeigen, dass Dunkelflauten kein Ausreißer sind. Ein Modell, das nur 2024 kennt (H2), unterschätzt das.
- **Für den Hauptpfad:** Die Kombi-CF-Schwelle von 5 % wird nur in wenigen Stunden am Stück erreicht (Median 44 h), und kein Jahr hatte eine Phase unter 10 % von mehr als einer Woche am Stück. Biomasse, Laufwasser und Pumpspeicher sind im Kombi-CF nicht enthalten und mildern die Lücke.
- **Datenqualität:** Energy-Charts-Jahreswerte sind auf amtliche Summen kalibriert. Wer das Modell gegen „unabhängige“ Jahreswerte prüft, prüft sich teilweise gegen sich selbst.

## Lücken

- Unabhängige Jahreswerte von AG Energiebilanzen und Fraunhofer-ISE-Jahresauswertung nicht erhalten (AGEB-Host verweigert, ISE-Seite 404). Der Abgleich beruht auf UBA und SMARD.
- Abregelung 2015–2022 sowie marktbedingte Abregelung nicht beziffert; keine stündlichen Redispatch-Reihen.
- Ursache der PV-Differenz Energy-Charts gegen SMARD (−5 % in 2024) unklar.
- Laufwasser-CF ist unterschätzt: Bezug auf die gesamte Wasserkraftleistung (rund 5,4 GW, laut UBA inklusive Speicher- und Pumpspeicher-Anteil mit natürlichem Zufluss) statt auf Laufwasser allein.
- Offshore-Zubau wird linear zwischen Monatsenden interpoliert; Inbetriebnahmedaten einzelner Parks sind nicht berücksichtigt (Kapazitätsfaktoren im Zubaujahr leicht verzerrt).
- Meteorologischer Winter Dez–Feb nicht ausgewiesen.
- Raw-Dateien liegen nicht in `data/raw/strom/` (120 MB), sondern in `quellen/raw/P1-03_stromdaten/` (nicht im Repo); `data/QUELLE_LIZENZ_strom.md` verweist darauf.

## Nicht erreichbar

| Host | Gewünschtes Dokument | Folge |
|---|---|---|
| www.ag-energiebilanzen.de | Stromerzeugung nach Energieträgern (Auswertungstabellen) | 403 vom Proxy, Abgleich über UBA/SMARD |
| renewables.ninja, zenodo.org, arxiv.org, data.open-power-system-data.org | Reanalyse-Reihen, Studien | nicht freigegeben, nicht umgangen; Angaben nur aus Websuche (C) |
| www.ise.fraunhofer.de | Jahresauswertung „Öffentliche Nettostromerzeugung 2024“ | Pressemitteilungs-URL lieferte 404 (URL geraten), keine weitere Suche |
| dserver.bundestag.de, dsc.bund.de, data.bundesnetzagentur.de | Redispatch-Quartalsberichte, Monitoringbericht | nicht freigegeben |

## Quellenliste

- Energy-Charts API (Fraunhofer ISE): `public_power`, `total_power`, `installed_power`, OpenAPI-Beschreibung (`https://api.energy-charts.info/openapi.json`), abgerufen 22.11.2026.
- SMARD chart_data, Bundesnetzagentur, abgerufen 22.11.2026.
- SMARD, „Volume of measures stable in the year as a whole“ (Netzengpassmanagement Q4/Gesamtjahr 2025).
- Bundesnetzagentur, Pressemitteilung „Daten zum Strommarkt 2024“, 03.01.2025.
- Umweltbundesamt, „Zeitreihen zur Entwicklung der erneuerbaren Energien in Deutschland“, Stand 09/2026, und „Erneuerbare Energien in Zahlen“ (Seite, 2025: Wind 134,2 TWh, PV 92,2 TWh brutto, Wasserkraft 17,1 TWh).
- Websuche (nicht im Original gelesen): zfk zu Redispatch 2023, pv magazine zu Abregelung 2024 (Entschädigung 554 Mio. €, Konfidenz C), renewables.ninja/MERRA-2 (Staffell/Pfenninger).

```json
{
 "dossier": "03_stromdaten",
 "stand": "2026-11-22",
 "parameters": [
  {
   "id": "wind_onshore_vls_2015_2025",
   "value": {
    "min": 1547,
    "mid": 1784,
    "max": 1952
   },
   "unit": "h/a (Volllaststunden, Mittel der Jahre 2015–2025: min/Median/max)",
   "source": "ec_api_2026",
   "fundstelle": "public_power + installed_power (monthly), eigene Rechnung scripts/build_profiles.py",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Σ stündlicher Kapazitätsfaktor mit monatsgenauer installierter Leistung; Erzeugung nach Abregelung; min 2016, max 2023"
  },
  {
   "id": "wind_offshore_vls_2015_2025",
   "value": {
    "min": 2803,
    "mid": 3124,
    "max": 3614
   },
   "unit": "h/a (min/Median/max 2015–2025)",
   "source": "ec_api_2026",
   "fundstelle": "wie oben",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Offshore-Reihe sinkt seit 2017; Zubau im Jahresverlauf linear interpoliert, Netzanbindungs-Verzögerungen nicht abgebildet; Abregelung 2024 rund 18 % der Erzeugung"
  },
  {
   "id": "pv_vls_gesamt_dc_2015_2025",
   "value": {
    "min": 813,
    "mid": 928,
    "max": 992
   },
   "unit": "h/a bezogen auf DC-Leistung (min/Median/max, PV inkl. Eigenverbrauch)",
   "source": "ec_api_2026",
   "fundstelle": "total_power + installed_power Solar DC",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Mit total_power (inkl. Eigenverbrauch) ist die Reihe über die Jahre vergleichbar; bezogen auf AC-Leistung rund 6–8 % höher"
  },
  {
   "id": "pv_vls_oeffentlich_dc_2015_2025",
   "value": {
    "min": 646,
    "mid": 854,
    "max": 931
   },
   "unit": "h/a bezogen auf DC-Leistung (min/Median/max, nur öffentliche Nettoeinspeisung)",
   "source": "ec_api_2026",
   "fundstelle": "public_power + installed_power Solar DC",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Fällt 2023–2025 auf 650–720 h, weil der Eigenverbrauch (2025: rund 20 TWh laut UBA) fehlt; als Kapazitätsfaktor ungeeignet, Gesamtreihe verwenden"
  },
  {
   "id": "dunkelflaute_laengste_phase_unter_10pct_h",
   "value": {
    "min": 63,
    "mid": 90,
    "max": 165
   },
   "unit": "h am Stück, Wind+PV-Kapazitätsfaktor < 10 % (Jahresmaxima 2015–2025: min/Median/max)",
   "source": "ec_api_2026",
   "fundstelle": "stats_wetterjahre.json, dunkelflaute_wind_pv_gesamt_inkl_eigenverbrauch",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Kombi-CF = (PV gesamt + Wind an Land + auf See) / Summe der Nennleistungen des jeweiligen Jahres; maximal 165 h vom 22.–29.01.2023; Phasen brechen schon bei kurzer Überschreitung ab"
  },
  {
   "id": "dunkelflaute_laengste_phase_unter_5pct_h",
   "value": {
    "min": 18,
    "mid": 44,
    "max": 80
   },
   "unit": "h am Stück, Kombi-CF < 5 % (Jahresmaxima 2015–2025: min/Median/max)",
   "source": "ec_api_2026",
   "fundstelle": "wie oben",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Maximum 80 h vom 29.11. 22:00 bis 03.12.2023 05:00"
  },
  {
   "id": "wind_cf_winterquartal_schwaechstes_q1",
   "value": 0.21,
   "unit": "Anteil (Wind an Land + See, kapazitätsgewichtet, Jan–Mrz 2025)",
   "source": "ec_api_2026",
   "fundstelle": "stats_wetterjahre.json, wind_cf_quartale",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Schwächstes Q1 der elf Jahre; Q1 2020 war mit 37,6 % das stärkste; Jahresmittel Wind 2025: 20,0 %"
  },
  {
   "id": "wind_cf_winterquartal_schwaechstes_q4",
   "value": 0.2148,
   "unit": "Anteil (Wind an Land + See, kapazitätsgewichtet, Okt–Dez 2016)",
   "source": "ec_api_2026",
   "fundstelle": "wie oben",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Schwächstes Q4; Q4 2016 ebenfalls Jahresminimum Wind insgesamt (19,1 %)"
  },
  {
   "id": "abregelung_redispatch_ee_2024_gwh",
   "value": 9389,
   "unit": "GWh/a (Redispatch-Abregelung EE, ohne marktbedingte Abregelung)",
   "source": "smard_ngem_2025",
   "fundstelle": "Abschnitt „Congestion management by type of measure“",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Davon Offshore 4.565, Wind an Land 3.394, PV 1.394 GWh; Redispatch-Begriff, Einspeisemanagement seit 2022 eingerechnet"
  },
  {
   "id": "abregelung_redispatch_ee_2025_gwh",
   "value": 9379,
   "unit": "GWh/a",
   "source": "smard_ngem_2025",
   "fundstelle": "wie oben",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Offshore 3.351, Wind an Land 3.225, PV 2.704 GWh; Q4 2025 rund 4 % der EE-Erzeugung abgeregelt (Quartalswert)"
  },
  {
   "id": "abregelung_anteil_offshore_2024_pct",
   "value": 17.8,
   "unit": "% der EC-Offshore-Erzeugung 2024",
   "source": "smard_ngem_2025",
   "fundstelle": "eigene Rechnung: 4,565 / 25,68 TWh",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Aufschlag auf die Offshore-Volllaststunden: 2.919 h → rund 3.440 h"
  },
  {
   "id": "abregelung_anteil_onshore_2024_pct",
   "value": 3.1,
   "unit": "% der EC-Erzeugung Wind an Land 2024",
   "source": "smard_ngem_2025",
   "fundstelle": "eigene Rechnung: 3,394 / 110,6 TWh",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Aufschlag: 1.784 h → rund 1.840 h"
  },
  {
   "id": "abregelung_anteil_pv_2025_pct",
   "value": 3.9,
   "unit": "% der EC-Einspeisung PV 2025",
   "source": "smard_ngem_2025",
   "fundstelle": "eigene Rechnung: 2,704 / 70,1 TWh",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "2024: 2,3 %; Wachstum durch Verteilnetz und Zubau"
  },
  {
   "id": "abregelung_2023_offshore_onshore_gwh",
   "value": {
    "offshore": 5729,
    "onshore": 3980
   },
   "unit": "GWh (Redispatch 2023)",
   "source": "zfk_redispatch_2023",
   "fundstelle": "Suchtreffer-Auszug",
   "confidence": "C",
   "primaer_gelesen": false,
   "note": "Nur über Zusammenfassung einer Websuche; nicht im Original gelesen"
  },
  {
   "id": "ec_vs_uba_netto_abweichung_wind_pv_pct",
   "value": {
    "min": -2.7,
    "mid": 0.0,
    "max": 1.0
   },
   "unit": "% Jahressumme Energy-Charts gegen UBA Tab. 3.1 (Wind, PV, 2015–2025)",
   "source": "uba_zeitreihen_2026",
   "fundstelle": "Tab. 3.1 Nettostromerzeugung",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "Nicht unabhängig: 2015–2022 gleich auf die GWh, Energy-Charts ist offenbar auf AGEE-Stat kalibriert"
  },
  {
   "id": "ec_vs_smard_abweichung_pv_2024_pct",
   "value": -5.4,
   "unit": "% Energy-Charts PV öffentlich gegen SMARD Photovoltaik 2024",
   "source": "smard_chart_data",
   "fundstelle": "Monatsreihe 4068, Jahressumme 63,1 TWh",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "BNetzA-Pressemitteilung nennt 63,3 TWh Einspeisung (gelesen); UBA netto abzüglich Selbstverbrauch 60,1 TWh; Ursache der Differenz offen"
  },
  {
   "id": "last_netzlast_2024_twh",
   "value": 465.5,
   "unit": "TWh Netzlast 2024",
   "source": "ec_api_2026",
   "fundstelle": "public_power Name „Load“",
   "confidence": "B",
   "primaer_gelesen": true,
   "note": "SMARD-Netzlast identisch (0,0 %), also dieselbe ENTSO-E-Basis, nicht unabhängig; Bruttostromverbrauch laut UBA 529 TWh"
  }
 ],
 "sources": {
  "ec_api_2026": {
   "titel": "Energy-Charts API (public_power, total_power, installed_power), Fraunhofer ISE",
   "herausgeber": "Fraunhofer ISE",
   "datum": "Abruf 2026-11-22",
   "url": "https://api.energy-charts.info/openapi.json",
   "abruf": "2026-11-22",
   "lizenz": "CC BY 4.0"
  },
  "smard_chart_data": {
   "titel": "SMARD chart_data, Monatsauflösung, Filter 4068/4067/1225/410/4066/1226",
   "herausgeber": "Bundesnetzagentur",
   "datum": "Abruf 2026-11-22",
   "url": "https://www.smard.de/app/chart_data/4068/DE/index_month.json",
   "abruf": "2026-11-22",
   "lizenz": "CC BY 4.0 laut Auftrag, nicht erneut geprüft"
  },
  "smard_ngem_2025": {
   "titel": "Congestion management: volume of measures stable in the year as a whole (Q4/2025)",
   "herausgeber": "Bundesnetzagentur / SMARD",
   "datum": "2026-03",
   "url": "https://www.smard.de/page/en/topic-article/5892/220534/volume-of-measures-stable-in-the-year-as-a-whole",
   "abruf": "2026-11-22"
  },
  "uba_zeitreihen_2026": {
   "titel": "Zeitreihen zur Entwicklung der erneuerbaren Energien in Deutschland (Excel)",
   "herausgeber": "Umweltbundesamt / AGEE-Stat",
   "datum": "Stand 2026-09",
   "url": "https://www.umweltbundesamt.de/system/files/document/zeitreihen-zur-entwicklung-der-erneuerbaren-energien-in-deutschland-excel_uba_deu_0_0.xlsx",
   "abruf": "2026-11-22"
  },
  "bnetza_pm_smard_2024": {
   "titel": "Bundesnetzagentur veröffentlicht Daten zum Strommarkt 2024",
   "herausgeber": "Bundesnetzagentur",
   "datum": "2025-01-03",
   "url": "https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20250103_smard.html",
   "abruf": "2026-11-22"
  },
  "zfk_redispatch_2023": {
   "titel": "Mehr Redispatch-Maßnahmen, aber geringere Kosten (zfk)",
   "herausgeber": "ZfK",
   "datum": "2024",
   "url": "https://www.zfk.de/energie/strom/mehr-redispatch-massnahmen-aber-geringere-kosten",
   "abruf": "2026-11-22",
   "hinweis": "nur Suchtreffer-Auszug"
  }
 }
}
```
