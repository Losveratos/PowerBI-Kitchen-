# Was braucht ein gesunder Strommix — und was kostet er?

> Interaktives White Paper: ein nachgerechnetes Kostenmodell fuer das deutsche Stromsystem 2045, mit Monte-Carlo-Unsicherheit, Emissionsbilanz und offengelegten Datenluecken.

- **Quelle:** https://datenwgknowledgekitchen.com/whitepaper-strommix.html
- **Markdown-Fassung:** https://datenwgknowledgekitchen.com/md/whitepaper-strommix.md
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Stand der Daten:** 2026-08-19 (Git-Commit-Datum der Quelldaten)
- **Modellstand:** v0.2c
- **Status:** Entwurf. Jede Zahl traegt eine Konfidenzstufe — A/B/C bzw. M fuer Modellsetzung. Ohne die Konfidenzstufe ist eine Zahl aus diesem Dokument nicht zitierfaehig.
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/whitepaper-strommix.html — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwuenscht; Zahlen bitte mit Konfidenzstufe und Stand uebernehmen.
- **Erzeugt von:** `strommix/scripts/build_md_exports.py` (generierte Datei — nicht von Hand editieren)
- **Simulation:** 1.000 gepaarte Ziehungen je Konfiguration, Basis-Seed 20260815, PRNG mulberry32 (32-Bit, bitidentisch nach JavaScript portierbar)
- **Maschinenlesbare Rohdaten:** `https://datenwgknowledgekitchen.com/strommix/data/model_params.json`, `https://datenwgknowledgekitchen.com/strommix/data/monte_carlo_reference.json`, `https://datenwgknowledgekitchen.com/strommix/data/page_data.json`

---

## Kernaussagen

1. **Der Vergleich ist nicht entschieden.** Die beiden vordersten Pfade — das kernkraftgestuetzte Kostenminimum und der gasgestuetzte 80-%-EE-Pfad — liegen im deterministischen Punktwert 159,0 zu 156,8 EUR/MWh auseinander. Das ist weniger als die Breite der Unsicherheit.
2. **Der Beinahe-Gleichstand vergleicht ungleiche Emissionen.** 28 gegen 107 Mt CO2 pro Jahr. Erst mit Abscheidung auf beiden Seiten wird der Vergleich emissionsaequivalent — und dreht die Richtung.
3. **Ein einziger Modellparameter bewegt das Ergebnis ueber die ganze Breite.** Der mixunabhaengige Sockel im Uebertragungsnetz (Setzung 0,40, Sensitivitaet 0,20–0,60) verschiebt den Abstand zwischen beiden Pfaden von -2,3 bis +4,5 EUR/MWh.
4. **Der CO2-Preis ist der Kipppunkt.** Deterministisch kippt der Vergleich bei 101,8 EUR/t, ueber gepaarte Ziehungen bei rund 152 EUR/t. Der ETS-1-Marktpreis lag bei 74 EUR/t — also unterhalb der Kippmarke; gerechnet wird mit 75 EUR/t.
5. **Das Ist-System ist der teuerste Anker.** 180,8 EUR/MWh bei 136 Mt CO2 — jedes Zielszenario ist billiger und sauberer als der Status quo.
6. **Die Datenbasis der Simulation ist unvollstaendig.** Die Stundenprofile decken 4.416 Stunden ab (`PARTIAL`, H2-2024-basiert (Teilzeitraum)). Netzbetrieb, Redispatch, Verluste, Import, Export und Lastmanagement sind nicht modelliert.

---

## 1 · Ist-Zustand 2025

Quelle der Jahreszahlen: AG Energiebilanzen, STRERZ-Datenblatt 2025 / AGEB-Wintertagung 15.12.2025 (Konfidenz: medium).

| Kennzahl | Wert |
|:---|---:|
| Bruttostromerzeugung inkl. Pumpspeicher | 509,3 TWh |
| Bruttostromerzeugung ohne Pumpspeicher | 502,2 TWh |
| Erneuerbare gesamt | 292,0 TWh |
| Fossil gesamt | 217,3 TWh |
| Kernenergie | 0,0 TWh |
| Import | 76,2 TWh |
| Export | 54,3 TWh |

### Bruttostromerzeugung nach Energietraegern (TWh)

| Energietraeger | TWh | Konfidenz | Anmerkung |
|:---|---:|:---:|:---|
| wind onshore | 110,1 | medium |  |
| photovoltaik | 89,5 | medium |  |
| erdgas | 84,9 | medium |  |
| braunkohle | 75,2 | medium |  |
| biomasse | 42,7 | medium |  |
| mineraloel sonstige abfall | 28,9 | low | gemeinsam ausgewiesen; im Fossil-Block enthalten, nicht additiv |
| wind offshore | 28,0 | low | Differenzrechnung aus EE-Summe · abgeleitet |
| steinkohle | 25,0–28,0 | low | abgeleitet |
| wasserkraft | 21,0 | low | Differenzrechnung aus EE-Summe · abgeleitet |
| kernenergie | 0,0 | high |  |

---

## 2 · Methodik in Kurzfassung

- **Modell:** `scripts/model.py (mix_system, Schritt 3)`, Version 0.2c.
- **Kennzahl:** System-LSCOE in EUR/MWh — Vollkosten des *Systems* (Erzeugung, Speicher, Backup, Netzanteil) je gelieferter MWh, nicht LCOE einzelner Kraftwerke.
- **Unsicherheit:** 1.000 Ziehungen je Konfiguration, Dreieck, Modus = mid, Grenzen = min/max aus data/model_params.json.
- **Gepaarte Ziehungen:** True — je Konfiguration laeuft EIN Ziehungsstrom, jede Ziehung wird auf ALLE Szenarien angewandt (common random numbers). Deshalb sind Rangvergleiche zwischen Szenarien zulaessig, obwohl die Verteilungen breit ueberlappen.
- **Perzentile:** lineare Interpolation zwischen Rangplaetzen, Index = (n-1)*p.
- **CO2-Preis im Basisfall:** 75,0 EUR/t.
- **Lastprofile:** H2-2024-basiert (Teilzeitraum), 4.416 Stunden, Vollstaendigkeit `PARTIAL`.
- **Reproduzierbarkeit:** Basis-Seed 20260815, PRNG mulberry32 (32-Bit, bitidentisch nach JavaScript portierbar) — die Ergebnisse sind aus den veroeffentlichten Rohdaten nachrechenbar.

### Modellannahmen

- Der Dispatch wird je Preset EINMAL mit mittleren Parametern gerechnet und zwischengespeichert; die 1000 Ziehungen wirken nur auf die Kostenseite.
- Damit wirkt die Volllaststunden-Ziehung nur auf die abgeleiteten Kapazitaeten und deren Kosten, nicht auf Erzeugungsmengen, Backup-Bedarf oder Abregelung.
- Gezogen werden CAPEX, Opex, Volllaststunden und der Erdgas-Brennstoffpreis je Technologie; optional WACC (Dreieck 3/5/9 %), CO2-Preis (Dreieck 0/75/400 EUR/t) und ein empirischer CAPEX-Ueberschreitungsfaktor.
- Bauzins- und Ueberschreitungsaufschlag werden nur auf die dafuer geeignete Kostenabgrenzung gelegt (idc_applicable_share / overrun_applicable_share, zwischen den CAPEX-Stuetzstellen linear interpoliert). Fuer Kernkraft heisst das: kein zusaetzlicher Bauzins auf Gesamtprojekt-Anker, kein Ueberschreitungsfaktor auf den bereits eskalierten Hinkley-Point-C-Anker.
- v0.2c (Fix 3): Der Ueberschreitungsaufschlag wird fuer Kernkraft als ABSOLUTER Betrag auf einer einzigen Schaetzbasis gerechnet ((f-1) x 7.500 EUR/kW x Rest-Anteil 0,48/0,50/0,00), nicht multiplikativ auf dem gezogenen CAPEX. Damit ist die Abbildung 'gezogener CAPEX -> effektiver CAPEX' in JEDER Konfiguration monoton nicht fallend (geprueft in validate_model.py und als Testvektor capex_eff_monotonic_nuclear exportiert).
- v0.2c (Fix 1): Das Uebertragungsnetz hat einen mixunabhaengigen Sockel (transmission_socket_share, SETZUNG 0,40 mit Sensitivitaet 0,20-0,60). Der Sockelanteil skaliert mit dem Jahresbedarf, der Rest mit der genutzten fEE-Arbeit.
- v0.2c (Fix 4): Abgeschiedene Menge und Restemission stammen aus EINER Massenbilanz (model.ccs_balance). Die capture_rate-Ziehung bewegt deshalb beide Seiten; captured + residual = Brennstoffeintrag gilt in jeder Ziehung exakt.
- Der Ist-2025-Anker traegt das heutige Netzentgelt statt der Netzinvestition bis 2045 und ist deshalb NICHT direkt mit den Zielszenarien vergleichbar (comparable_to_target_scenarios = false).
- Innerhalb einer Ziehung sind die Parameter ueber alle Presets identisch. Zwischen den Parametern sind die Ziehungen unabhaengig - MIT ZWEI AUSNAHMEN (v0.2c, siehe shared_links): Der Erdgaspreis wird einmal gezogen und von gas_ccgt und gas_ccs geteilt, und der CCS-CAPEX ist ein gezogener Faktor auf den in derselben Ziehung gezogenen GuD-CAPEX. Weitere reale Korrelationen (z. B. hoher CAPEX an guten Standorten) sind NICHT abgebildet - das unterschaetzt die Breite der Verteilung an den Raendern eher, als sie zu uebertreiben.
- Nicht variiert werden: Wetterjahr, Lastprofil, Lebensdauern, Wirkungsgrade, Kernbrennstoff- und Entsorgungskosten, Netzinvestitionsvolumen (ausser ueber den Ueberschreitungsfaktor 'netz').
- Ebenfalls nicht variiert: die H2-Speicherkosten (105 EUR/MWh_H2). Ihre dokumentierte Spanne oeffnet nur nach unten und ist laut Parameternotiz nur bei hoher Zyklenzahl erreichbar - der simulierte Saisonspeicher hat aber genau einen Zyklus im Jahr.
- Batterie, Elektrolyse, H2-Speicher und H2-Turbine haben in den Ueberschreitungsdatensaetzen (Flyvbjerg, Sovacool & Ryu) keine Projektklasse und bleiben deshalb bei Faktor 1,00. Das ist eine LUECKE, keine Messung - das Ueberschreitungs-Szenario ist damit asymmetrisch (siehe limitations.overrun_asymmetry).

### Bewusste Modellentscheidungen

- Kernkraft-Opex absolut in EUR/kW/a (kosten_kernkraft.md 4.2/7.2) - NICHT als CAPEX-Prozentsatz.
- Brennstoff und Entsorgung/Rueckbau als getrennte variable Posten (kosten_kernkraft.md 7.2).
- WACC global (3-9 %, Default 5 % wie GES); IDC-Aufschlag ueber Bauzeit separat.
- CO2-Preis wirkt nur ueber den direkten Emissionsfaktor fossiler Erzeugung; Lebenszyklus-g/kWh nur informativ.
- Backup/Speicher entstehen im Dispatch, nicht als pauschaler Risiko-Aufschlag (risiken_co2.md 9 risiko_aufschlaege_zusammenfassung backup_und_speicher).
- min/mid/max nicht mechanisch kombinieren - siehe scenario_sets (kosten_ee_speicher.md 12 derived_lcoe_selfcheck.warning).
- v0.2/M1: IDC nur auf Overnight-Anker (capex_scope/idc_applicable_share). Die Kernkraft-Anker mid/max enthalten Finanzierung bereits (kosten_kernkraft.md 7.3).
- v0.2/M2: Erdgas-Brennstoffpreis als thermischer Parameter (fuel_eur_mwh_th), Umrechnung ueber den Wirkungsgrad. Damit ist die Asymmetrie 'Gas gratis vs. H2 bezahlt' aufgehoben.
- v0.2/M3: Netzkosten in Uebertragung (328 Mrd., skaliert mit genutzter fEE-Energie) und Verteilnetz (323 Mrd., Sockel, skaliert mit Jahresbedarf) getrennt; Skalierung auf 1,0 gedeckelt.
- v0.2/M5: Restemissionen je Szenario werden ausgewiesen (Mt CO2/a). CCS ist NICHT modelliert.
- v0.2/M6: Ist-2025-Anker mit Kohle-, Biomasse- und Wasserbaendern und heutigen Netzentgelten statt der Netzinvestition bis 2045.
- v0.2/M7: Ueberschreitungsfaktor nur auf Schaetzbasis-Anker (overrun_applicable_share).
- v0.2b: Technologie gas_ccs (Abscheidung an GuD). CAPEX-Faktor 2,0 (NETL 2023), Wirkungsgradverlust 8 pp, Abscheiderate 90 %, Vollkette 50/80/100 EUR/t; die Restemission (49/120/220 g/kWh) traegt weiterhin den vollen CO2-Preis.
- v0.2b: Kontrastverteilung Asien/Golf fuer Kernkraft-CAPEX (1.870/3.150/4.950 EUR/kW, Bauzeit 8 a) - ausschliesslich als eigene Monte-Carlo-Konfiguration, NIE in der Basisspanne (Begruendung kosten_kernkraft.md 7.1, maschinenlesbar hinterlegt).
- v0.2c/1: Auch das Uebertragungsnetz bekommt einen mixunabhaengigen Sockel (transmission_socket_share, SETZUNG 0,20/0,40/0,60 mit Sensitivitaet). Bis v0.2b skalierte der 328-Mrd.-Block linear von null mit der genutzten fEE-Arbeit.
- v0.2c/2: Gemeinsame Rohstoff- und Definitionsziehungen - der Gaspreis wird EINMAL je Ziehung gezogen und von gas_ccgt und gas_ccs geteilt; der CCS-CAPEX ist ein gezogener FAKTOR (capex_factor_on_ccgt) auf den in derselben Ziehung gezogenen GuD-CAPEX.
- v0.2c/3: Der Ueberschreitungsaufschlag wird als absoluter Betrag auf EINER Schaetzbasis gerechnet (overrun_estimate_base_eur_kw = 7.500) mit Rest-Overrun-Anteilen 0,48/0,50/0,00 - damit ist die Abbildung 'gezogener CAPEX -> effektiver CAPEX' monoton und die Doppelzaehlung an den unteren Ankern beseitigt.
- v0.2c/4: Geschlossene CCS-Massenbilanz - abgeschiedene Menge und Restemission werden aus EINEM Brennstoffeintrag gebildet (upstream_share_of_lifecycle); captured + residual = Eintrag gilt exakt, auch unter Ziehung von Wirkungsgrad und Abscheiderate.

---

## 3 · Szenarien im Vergleich

System-LSCOE in EUR/MWh. Spalte *deterministisch* = Punktwert mit mittleren Parametern. Spalte *P50 [P5–P95]* = Median und 90-%-Band aus 1.000 Ziehungen der Konfiguration `base` (WACC fest 5 %, CO2 fest 75 EUR/t, ohne Kostenueberschreitung).

| Szenario | Bedarf TWh | determin. | P50 [P5–P95] | Mt CO2/a | davon abgeschieden | vergleichbar |
|:---|---:|---:|---:|---:|---:|:---:|
| Ist 2025 (Referenzsystem) | 520 | 180,8 | 182,6 [174,3–191,6] | 136,0 | 0,0 | nein |
| GES · Kostenminimum | 950 | 159,0 | 164,9 [154,3–185,9] | 27,9 | 0,0 | ja |
| GES · Kostenminimum (Gas mit CCS) | 950 | 169,6 | 175,9 [164,1–197,0] | 8,3 | 23,9 | ja |
| GES · 80 % EE + Gas | 950 | 156,8 | 158,9 [147,7–171,4] | 106,5 | 0,0 | ja |
| GES · 80 % EE + Gas mit CCS | 950 | 185,0 | 188,6 [171,8–205,6] | 31,7 | 91,2 | ja |
| GES · 80 % EE + H₂ | 950 | 199,5 | 199,5 [189,2–210,5] | 4,8 | 0,0 | ja |
| GES · 100 % Erneuerbare | 950 | 245,2 | 244,7 [227,6–263,0] | 1,3 | 0,0 | ja |

*Hinweis:* `Ist 2025 (Referenzsystem)` ist ein Anker, kein Zielszenario — es ist mit den Zukunftsszenarien nicht rangfaehig (anderer Bedarf, andere Kostenabgrenzung).

### Kostenkomponenten der Zielszenarien (EUR/MWh, deterministisch)

| Szenario | battery | coal band | electrolyser | gas backup | h2 storage | h2 turbine | netz | nuclear | pv | wind offshore | wind onshore |
|:---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ist 2025 (Referenzsystem) | 3,2 | 11,0 | — | 43,1 | — | — | 93,0 | — | 10,2 | 5,0 | 15,3 |
| GES · Kostenminimum | — | — | — | 15,5 | — | — | 29,9 | 99,5 | 2,6 | 5,0 | 6,6 |
| GES · Kostenminimum (Gas mit CCS) | — | — | — | 26,1 | — | — | 29,9 | 99,5 | 2,6 | 5,0 | 6,6 |
| GES · 80 % EE + Gas | 3,5 | — | — | 47,7 | — | — | 36,6 | — | 12,7 | 24,3 | 31,9 |
| GES · 80 % EE + Gas mit CCS | 3,5 | — | — | 75,8 | — | — | 36,6 | — | 12,7 | 24,3 | 31,9 |
| GES · 80 % EE + H₂ | 3,6 | — | 24,4 | 4,5 | 47,5 | 11,8 | 38,4 | — | 12,8 | 24,4 | 32,1 |
| GES · 100 % Erneuerbare | 5,3 | — | 38,9 | 3,7 | 20,1 | 13,3 | 40,0 | — | 22,8 | 43,7 | 57,4 |

### Systemkennzahlen der Szenarien

| Szenario | Gas-Backup TWh/a | Gas-Spitzenlast GW | Abregelung TWh/a | ungedeckt TWh/a |
|:---|---:|---:|---:|---:|
| Ist 2025 (Referenzsystem) | 148,1 | 58,0 | 6,2 | 0,00 |
| GES · Kostenminimum | 69,2 | 53,9 | 64,7 | 0,00 |
| GES · Kostenminimum (Gas mit CCS) | 69,2 | 53,9 | 64,7 | 0,00 |
| GES · 80 % EE + Gas | 264,4 | 137,0 | 140,9 | 0,00 |
| GES · 80 % EE + Gas mit CCS | 264,4 | 137,0 | 140,9 | 0,00 |
| GES · 80 % EE + H₂ | 11,9 | 20,0 | 12,1 | 4,58 |
| GES · 100 % Erneuerbare | 3,2 | 20,0 | 377,6 | 1,29 |

---

## 4 · CO2-Preis als Kipppunkt

- Deterministischer Kipppunkt: **101,8 EUR/t**
- Ueber gepaarte Ziehungen (Median-Delta = 0): **152 EUR/t**
- ETS-1-Marktpreis: 74 EUR/t · Modellwert: 75 EUR/t
- Konfidenz: B

Mit Abscheidung auf beiden Seiten existiert kein Kipppunkt: Der Kernkraft-Pfad liegt bei jedem CO2-Preis vorn (Delta -13,6 EUR/MWh bei 0 EUR/t, -62,9 bei 2.000 EUR/t).

*Methode:* Szenariensatz mittel, WACC 5 %, Netzvariante mid, Uebertragungsnetz-Sockelquote 0,40; variiert wird ausschliesslich der CO2-Preis. Deterministisch per Bisektion, probabilistisch als Median-Delta = 0 ueber 1.000 gepaarte Ziehungen.

### System-LSCOE je CO2-Preisniveau (EUR/MWh)

| CO2 EUR/t | Niveau | Ist 2025 (Referenzsystem) | GES · Kostenminimum | GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas | GES · 80 % EE + Gas mit CCS | GES · 80 % EE + H₂ | GES · 100 % Erneuerbare |
|---:|:---|---:|---:|---:|---:|---:|---:|---:|
| 0 | kein CO2-Preis | 161,2 | 156,8 | 168,9 | 148,4 | 182,5 | 199,1 | 245,1 |
| 75 | Modellwert (ETS-1-Marktniveau) | 180,8 | 159,0 | 169,6 | 156,8 | 185,0 | 199,5 | 245,2 |
| 350 | UBA-Klimakostensatz MK 3.2 (1 % Diskontierung) | 252,8 | 167,1 | 172,0 | 187,7 | 194,1 | 200,9 | 245,5 |
| 990 | UBA-Klimakostensatz MK 4.0 (Zentralwert) | 420,2 | 185,9 | 177,6 | 259,4 | 215,5 | 204,1 | 246,4 |

---

## 5 · Rangwahrscheinlichkeiten

Aus den gepaarten Ziehungen: in wie vielen der 1.000 Zukuenfte ist Szenario A guenstiger als B. `entschieden` bedeutet, dass die Wahrscheinlichkeit die selbstgesetzte Schwelle von 95 % ueberschreitet — alles darunter ist ein offener Ausgang, kein Sieg.

### Konfiguration `base` — WACC fest (5 %), CO2 fest (75 EUR/t), ohne Kostenueberschreitung

| A | B | P(A guenstiger) | P(B guenstiger) | Median A−B | P5 … P95 (A−B) | entschieden |
|:---|:---|---:|---:|---:|---:|:---:|
| Ist 2025 (Referenzsystem) | GES · Kostenminimum | 8,5 % | 91,5 % | 17,3 | -3,6 … 29,8 | nein |
| Ist 2025 (Referenzsystem) | GES · Kostenminimum (Gas mit CCS) | 28,0 % | 72,0 % | 6,3 | -14,3 … 18,6 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas | 0,0 % | 100,0 % | 23,4 | 17,7 … 28,6 | ja |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas mit CCS | 81,0 % | 19,0 % | -5,9 | -16,5 … 4,0 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + H₂ | 99,0 % | 1,0 % | -16,9 | -28,0 … -5,4 | ja |
| Ist 2025 (Referenzsystem) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -62,6 | -78,1 … -44,9 | ja |
| GES · Kostenminimum | GES · Kostenminimum (Gas mit CCS) | 100,0 % | 0,0 % | -11,0 | -13,9 … -8,1 | ja |
| GES · Kostenminimum | GES · 80 % EE + Gas | 25,7 % | 74,3 % | 6,4 | -8,5 … 27,7 | nein |
| GES · Kostenminimum | GES · 80 % EE + Gas mit CCS | 94,3 % | 5,7 % | -22,7 | -40,9 … 1,0 | nein |
| GES · Kostenminimum | GES · 80 % EE + H₂ | 99,6 % | 0,4 % | -33,7 | -48,9 … -12,7 | ja |
| GES · Kostenminimum | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -78,2 | -99,2 … -55,2 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas | 2,3 % | 97,7 % | 17,4 | 2,6 … 37,8 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas mit CCS | 82,2 % | 17,8 % | -11,7 | -28,3 … 10,4 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + H₂ | 95,8 % | 4,2 % | -22,4 | -39,3 … -1,7 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -66,9 | -88,8 … -44,7 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + Gas mit CCS | 100,0 % | 0,0 % | -29,2 | -37,0 … -21,8 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + H₂ | 100,0 % | 0,0 % | -40,4 | -50,4 … -29,5 | ja |
| GES · 80 % EE + Gas | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -85,7 | -99,2 … -70,9 | ja |
| GES · 80 % EE + Gas mit CCS | GES · 80 % EE + H₂ | 87,4 % | 12,6 % | -10,9 | -26,8 … 4,5 | nein |
| GES · 80 % EE + Gas mit CCS | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -56,6 | -74,3 … -38,1 | ja |
| GES · 80 % EE + H₂ | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -45,3 | -52,5 … -37,9 | ja |

### Konfiguration `wacc` — WACC unsicher (Dreieck 3/5/9 %), CO2 fest

| A | B | P(A guenstiger) | P(B guenstiger) | Median A−B | P5 … P95 (A−B) | entschieden |
|:---|:---|---:|---:|---:|---:|:---:|
| Ist 2025 (Referenzsystem) | GES · Kostenminimum | 37,5 % | 62,5 % | 8,3 | -35,1 … 38,2 | nein |
| Ist 2025 (Referenzsystem) | GES · Kostenminimum (Gas mit CCS) | 54,7 % | 45,3 % | -3,6 | -48,6 … 27,7 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas | 11,0 % | 89,0 % | 18,2 | -5,3 … 35,3 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas mit CCS | 78,8 % | 21,2 % | -12,3 | -44,6 … 10,6 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + H₂ | 95,6 % | 4,4 % | -22,3 | -52,2 … -0,3 | ja |
| Ist 2025 (Referenzsystem) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -71,5 | -117,0 … -36,9 | ja |
| GES · Kostenminimum | GES · Kostenminimum (Gas mit CCS) | 100,0 % | 0,0 % | -11,5 | -15,9 … -8,2 | ja |
| GES · Kostenminimum | GES · 80 % EE + Gas | 22,2 % | 77,8 % | 10,0 | -8,0 … 38,3 | nein |
| GES · Kostenminimum | GES · 80 % EE + Gas mit CCS | 89,3 % | 10,7 % | -20,9 | -40,2 … 5,7 | nein |
| GES · Kostenminimum | GES · 80 % EE + H₂ | 96,7 % | 3,3 % | -31,4 | -47,8 … -3,0 | ja |
| GES · Kostenminimum | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -79,3 | -102,6 … -53,6 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas | 2,1 % | 97,9 % | 21,6 | 2,7 … 50,7 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas mit CCS | 75,7 % | 24,3 % | -9,3 | -27,8 … 18,2 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + H₂ | 88,4 % | 11,6 % | -19,8 | -37,9 … 10,0 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -67,3 | -90,7 … -40,6 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + Gas mit CCS | 100,0 % | 0,0 % | -30,7 | -41,9 … -22,2 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + H₂ | 100,0 % | 0,0 % | -40,6 | -52,0 … -29,2 | ja |
| GES · 80 % EE + Gas | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -89,4 | -115,3 … -69,5 | ja |
| GES · 80 % EE + Gas mit CCS | GES · 80 % EE + H₂ | 82,5 % | 17,5 % | -10,0 | -26,1 … 8,2 | nein |
| GES · 80 % EE + Gas mit CCS | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -59,0 | -82,8 … -37,7 | ja |
| GES · 80 % EE + H₂ | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -48,9 | -66,4 … -35,7 | ja |

### Konfiguration `co2` — CO2-Preis unsicher (Dreieck 0/75/400 EUR/t), WACC fest

| A | B | P(A guenstiger) | P(B guenstiger) | Median A−B | P5 … P95 (A−B) | entschieden |
|:---|:---|---:|---:|---:|---:|:---:|
| Ist 2025 (Referenzsystem) | GES · Kostenminimum | 4,8 % | 95,2 % | 33,4 | 0,4 … 73,8 | ja |
| Ist 2025 (Referenzsystem) | GES · Kostenminimum (Gas mit CCS) | 13,4 % | 86,6 % | 23,7 | -10,8 … 67,6 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas | 0,0 % | 100,0 % | 33,6 | 16,7 … 59,2 | ja |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas mit CCS | 32,9 % | 67,1 % | 10,7 | -17,4 … 49,3 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + H₂ | 47,4 % | 52,6 % | 1,4 | -29,4 … 44,7 | nein |
| Ist 2025 (Referenzsystem) | GES · 100 % Erneuerbare | 93,4 % | 6,6 % | -43,2 | -78,0 … 3,6 | nein |
| GES · Kostenminimum | GES · Kostenminimum (Gas mit CCS) | 100,0 % | 0,0 % | -9,4 | -13,6 … -5,1 | ja |
| GES · Kostenminimum | GES · 80 % EE + Gas | 50,9 % | 49,1 % | -0,6 | -20,0 … 23,8 | nein |
| GES · Kostenminimum | GES · 80 % EE + Gas mit CCS | 94,8 % | 5,2 % | -23,8 | -42,5 … 0,8 | nein |
| GES · Kostenminimum | GES · 80 % EE + H₂ | 99,3 % | 0,7 % | -32,5 | -48,3 … -9,0 | ja |
| GES · Kostenminimum | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -76,9 | -99,1 … -51,1 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas | 24,0 % | 76,0 % | 9,0 | -12,9 … 34,1 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas mit CCS | 86,3 % | 13,7 % | -14,5 | -31,8 … 8,7 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + H₂ | 94,3 % | 5,7 % | -23,1 | -39,6 … 0,7 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -67,8 | -89,4 … -41,3 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + Gas mit CCS | 99,8 % | 0,2 % | -23,6 | -36,6 … -8,2 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + H₂ | 99,5 % | 0,5 % | -32,3 | -48,9 … -11,5 | ja |
| GES · 80 % EE + Gas | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -77,6 | -97,4 … -53,8 | ja |
| GES · 80 % EE + Gas mit CCS | GES · 80 % EE + H₂ | 79,5 % | 20,5 % | -8,7 | -24,2 … 9,2 | nein |
| GES · 80 % EE + Gas mit CCS | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -53,9 | -72,2 … -32,2 | ja |
| GES · 80 % EE + H₂ | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -44,7 | -53,1 … -38,2 | ja |

### Konfiguration `wacc_co2` — WACC und CO2-Preis unsicher

| A | B | P(A guenstiger) | P(B guenstiger) | Median A−B | P5 … P95 (A−B) | entschieden |
|:---|:---|---:|---:|---:|---:|:---:|
| Ist 2025 (Referenzsystem) | GES · Kostenminimum | 20,1 % | 79,9 % | 23,7 | -20,3 … 74,9 | nein |
| Ist 2025 (Referenzsystem) | GES · Kostenminimum (Gas mit CCS) | 33,0 % | 67,0 % | 13,0 | -33,6 … 68,1 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas | 3,1 % | 96,9 % | 28,3 | 2,9 … 59,4 | ja |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas mit CCS | 44,9 % | 55,1 % | 2,9 | -33,7 … 46,8 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + H₂ | 58,6 % | 41,4 % | -6,4 | -42,6 … 43,6 | nein |
| Ist 2025 (Referenzsystem) | GES · 100 % Erneuerbare | 94,0 % | 6,0 % | -54,0 | -103,1 … 1,6 | nein |
| GES · Kostenminimum | GES · Kostenminimum (Gas mit CCS) | 100,0 % | 0,0 % | -10,0 | -14,7 … -5,3 | ja |
| GES · Kostenminimum | GES · 80 % EE + Gas | 40,1 % | 59,9 % | 3,9 | -19,5 … 31,4 | nein |
| GES · Kostenminimum | GES · 80 % EE + Gas mit CCS | 91,0 % | 9,0 % | -21,0 | -41,8 … 6,6 | nein |
| GES · Kostenminimum | GES · 80 % EE + H₂ | 96,8 % | 3,2 % | -29,7 | -47,1 … -5,2 | ja |
| GES · Kostenminimum | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -77,8 | -101,3 … -51,7 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas | 17,1 % | 82,9 % | 14,2 | -12,5 … 42,9 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas mit CCS | 78,1 % | 21,9 % | -11,2 | -30,8 … 15,3 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + H₂ | 88,9 % | 11,1 % | -19,3 | -38,2 … 6,3 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -67,7 | -91,1 … -42,2 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + Gas mit CCS | 99,9 % | 0,1 % | -25,4 | -38,9 … -9,2 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + H₂ | 99,6 % | 0,4 % | -33,8 | -50,2 … -12,4 | ja |
| GES · 80 % EE + Gas | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -82,4 | -108,0 … -55,6 | ja |
| GES · 80 % EE + Gas mit CCS | GES · 80 % EE + H₂ | 76,1 % | 23,9 % | -8,6 | -25,8 … 10,0 | nein |
| GES · 80 % EE + Gas mit CCS | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -56,7 | -80,6 … -34,7 | ja |
| GES · 80 % EE + H₂ | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -48,7 | -65,5 … -35,0 | ja |

### Konfiguration `overrun` — WACC fest, CO2 fest, mit empirischer Kostenueberschreitung

| A | B | P(A guenstiger) | P(B guenstiger) | Median A−B | P5 … P95 (A−B) | entschieden |
|:---|:---|---:|---:|---:|---:|:---:|
| Ist 2025 (Referenzsystem) | GES · Kostenminimum | 60,3 % | 39,7 % | -1,9 | -15,8 … 12,5 | nein |
| Ist 2025 (Referenzsystem) | GES · Kostenminimum (Gas mit CCS) | 93,6 % | 6,4 % | -14,1 | -27,8 … 1,1 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas | 0,0 % | 100,0 % | 16,3 | 9,3 … 22,4 | ja |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas mit CCS | 99,0 % | 1,0 % | -15,5 | -27,5 … -4,7 | ja |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + H₂ | 100,0 % | 0,0 % | -21,9 | -34,2 … -9,6 | ja |
| Ist 2025 (Referenzsystem) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -71,0 | -90,0 … -52,6 | ja |
| GES · Kostenminimum | GES · Kostenminimum (Gas mit CCS) | 100,0 % | 0,0 % | -11,9 | -15,5 … -8,8 | ja |
| GES · Kostenminimum | GES · 80 % EE + Gas | 3,2 % | 96,8 % | 18,2 | 2,2 … 33,8 | ja |
| GES · Kostenminimum | GES · 80 % EE + Gas mit CCS | 86,8 % | 13,2 % | -13,5 | -33,6 … 6,1 | nein |
| GES · Kostenminimum | GES · 80 % EE + H₂ | 98,2 % | 1,8 % | -19,5 | -35,6 … -4,7 | ja |
| GES · Kostenminimum | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -68,8 | -89,9 … -49,6 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas | 0,1 % | 99,9 % | 30,4 | 14,7 … 45,3 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas mit CCS | 56,5 % | 43,5 % | -1,6 | -19,3 … 16,3 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + H₂ | 77,9 % | 22,1 % | -7,5 | -24,3 … 8,1 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -56,8 | -78,5 … -36,9 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + Gas mit CCS | 100,0 % | 0,0 % | -31,7 | -40,7 … -23,6 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + H₂ | 100,0 % | 0,0 % | -38,1 | -49,8 … -26,9 | ja |
| GES · 80 % EE + Gas | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -87,7 | -103,2 … -71,8 | ja |
| GES · 80 % EE + Gas mit CCS | GES · 80 % EE + H₂ | 73,4 % | 26,6 % | -6,4 | -23,2 … 11,2 | nein |
| GES · 80 % EE + Gas mit CCS | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -55,8 | -76,2 … -34,8 | ja |
| GES · 80 % EE + H₂ | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -49,2 | -57,3 … -41,4 | ja |

### Konfiguration `wacc_overrun` — WACC unsicher, mit empirischer Kostenueberschreitung

| A | B | P(A guenstiger) | P(B guenstiger) | Median A−B | P5 … P95 (A−B) | entschieden |
|:---|:---|---:|---:|---:|---:|:---:|
| Ist 2025 (Referenzsystem) | GES · Kostenminimum | 65,7 % | 34,3 % | -12,2 | -61,2 … 21,7 | nein |
| Ist 2025 (Referenzsystem) | GES · Kostenminimum (Gas mit CCS) | 85,7 % | 14,3 % | -24,7 | -75,2 … 11,1 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas | 23,7 % | 76,3 % | 10,1 | -14,6 … 28,2 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas mit CCS | 94,6 % | 5,4 % | -23,7 | -56,6 … 0,4 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + H₂ | 99,0 % | 1,0 % | -28,2 | -57,8 … -6,6 | ja |
| Ist 2025 (Referenzsystem) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -81,6 | -130,1 … -47,7 | ja |
| GES · Kostenminimum | GES · Kostenminimum (Gas mit CCS) | 100,0 % | 0,0 % | -12,6 | -17,2 … -9,1 | ja |
| GES · Kostenminimum | GES · 80 % EE + Gas | 5,1 % | 94,9 % | 22,3 | -0,1 … 51,1 | nein |
| GES · Kostenminimum | GES · 80 % EE + Gas mit CCS | 77,8 % | 22,2 % | -10,9 | -33,5 … 17,7 | nein |
| GES · Kostenminimum | GES · 80 % EE + H₂ | 85,5 % | 14,5 % | -16,1 | -37,5 … 12,0 | nein |
| GES · Kostenminimum | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -69,9 | -94,3 … -45,9 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas | 0,2 % | 99,8 % | 35,0 | 11,8 … 65,0 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas mit CCS | 45,6 % | 54,4 % | 1,7 | -20,3 … 30,0 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + H₂ | 59,6 % | 40,4 % | -3,4 | -25,7 … 25,8 | nein |
| GES · Kostenminimum (Gas mit CCS) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -57,4 | -82,6 … -32,3 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + Gas mit CCS | 100,0 % | 0,0 % | -33,4 | -45,0 … -24,4 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + H₂ | 100,0 % | 0,0 % | -38,6 | -50,7 … -27,9 | ja |
| GES · 80 % EE + Gas | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -92,1 | -118,5 … -72,7 | ja |
| GES · 80 % EE + Gas mit CCS | GES · 80 % EE + H₂ | 68,6 % | 31,4 % | -4,7 | -22,6 … 12,5 | nein |
| GES · 80 % EE + Gas mit CCS | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -58,6 | -84,8 … -37,2 | ja |
| GES · 80 % EE + H₂ | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -53,8 | -72,7 … -40,3 | ja |

### Konfiguration `asia` — Kontrast: Kernkraft-CAPEX aus dem Cluster Asien/Golf (1.870/3.150/4.950 EUR/kW, Bauzeit 8 a), WACC fest

| A | B | P(A guenstiger) | P(B guenstiger) | Median A−B | P5 … P95 (A−B) | entschieden |
|:---|:---|---:|---:|---:|---:|:---:|
| Ist 2025 (Referenzsystem) | GES · Kostenminimum | 0,0 % | 100,0 % | 67,6 | 56,9 … 77,1 | ja |
| Ist 2025 (Referenzsystem) | GES · Kostenminimum (Gas mit CCS) | 0,0 % | 100,0 % | 56,6 | 45,8 … 66,6 | ja |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas | 0,0 % | 100,0 % | 23,4 | 17,5 … 28,7 | ja |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas mit CCS | 81,1 % | 18,9 % | -5,6 | -16,3 … 4,6 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + H₂ | 99,0 % | 1,0 % | -17,0 | -28,8 … -5,6 | ja |
| Ist 2025 (Referenzsystem) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -62,3 | -80,2 … -45,6 | ja |
| GES · Kostenminimum | GES · Kostenminimum (Gas mit CCS) | 100,0 % | 0,0 % | -10,8 | -14,0 … -8,0 | ja |
| GES · Kostenminimum | GES · 80 % EE + Gas | 100,0 % | 0,0 % | -44,4 | -55,8 … -31,5 | ja |
| GES · Kostenminimum | GES · 80 % EE + Gas mit CCS | 100,0 % | 0,0 % | -73,6 | -88,1 … -57,3 | ja |
| GES · Kostenminimum | GES · 80 % EE + H₂ | 100,0 % | 0,0 % | -84,1 | -97,1 … -71,0 | ja |
| GES · Kostenminimum | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -129,4 | -148,5 … -111,2 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas | 100,0 % | 0,0 % | -33,6 | -44,7 … -20,6 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas mit CCS | 100,0 % | 0,0 % | -62,9 | -75,6 … -47,9 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + H₂ | 100,0 % | 0,0 % | -73,2 | -86,9 … -59,5 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -118,7 | -138,7 … -99,4 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + Gas mit CCS | 100,0 % | 0,0 % | -28,8 | -36,9 … -21,7 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + H₂ | 100,0 % | 0,0 % | -40,2 | -50,9 … -28,4 | ja |
| GES · 80 % EE + Gas | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -85,4 | -100,7 … -71,0 | ja |
| GES · 80 % EE + Gas mit CCS | GES · 80 % EE + H₂ | 86,3 % | 13,7 % | -11,0 | -27,7 … 5,4 | nein |
| GES · 80 % EE + Gas mit CCS | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -56,7 | -76,9 … -37,0 | ja |
| GES · 80 % EE + H₂ | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -45,5 | -53,0 … -38,3 | ja |

### Konfiguration `asia_wacc` — Kontrast Asien/Golf mit unsicherem WACC (Dreieck 3/5/9 %)

| A | B | P(A guenstiger) | P(B guenstiger) | Median A−B | P5 … P95 (A−B) | entschieden |
|:---|:---|---:|---:|---:|---:|:---:|
| Ist 2025 (Referenzsystem) | GES · Kostenminimum | 0,0 % | 100,0 % | 63,0 | 42,1 … 78,2 | ja |
| Ist 2025 (Referenzsystem) | GES · Kostenminimum (Gas mit CCS) | 0,0 % | 100,0 % | 51,7 | 29,0 … 67,8 | ja |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas | 10,6 % | 89,4 % | 18,0 | -6,0 … 35,1 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + Gas mit CCS | 79,7 % | 20,3 % | -12,6 | -42,1 … 9,8 | nein |
| Ist 2025 (Referenzsystem) | GES · 80 % EE + H₂ | 96,5 % | 3,5 % | -22,3 | -50,7 … -1,4 | ja |
| Ist 2025 (Referenzsystem) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -71,2 | -117,8 … -37,7 | ja |
| GES · Kostenminimum | GES · Kostenminimum (Gas mit CCS) | 100,0 % | 0,0 % | -11,5 | -15,4 … -8,2 | ja |
| GES · Kostenminimum | GES · 80 % EE + Gas | 100,0 % | 0,0 % | -44,9 | -59,8 … -31,9 | ja |
| GES · Kostenminimum | GES · 80 % EE + Gas mit CCS | 100,0 % | 0,0 % | -76,1 | -97,1 … -57,8 | ja |
| GES · Kostenminimum | GES · 80 % EE + H₂ | 100,0 % | 0,0 % | -85,4 | -103,1 … -72,0 | ja |
| GES · Kostenminimum | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -134,4 | -166,4 … -108,9 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas | 100,0 % | 0,0 % | -33,5 | -47,3 … -21,2 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + Gas mit CCS | 100,0 % | 0,0 % | -64,2 | -83,0 … -48,5 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 80 % EE + H₂ | 100,0 % | 0,0 % | -73,9 | -91,4 … -60,1 | ja |
| GES · Kostenminimum (Gas mit CCS) | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -123,2 | -153,9 … -98,2 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + Gas mit CCS | 100,0 % | 0,0 % | -30,6 | -40,8 … -22,0 | ja |
| GES · 80 % EE + Gas | GES · 80 % EE + H₂ | 100,0 % | 0,0 % | -40,6 | -52,1 … -30,1 | ja |
| GES · 80 % EE + Gas | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -89,5 | -114,1 … -70,4 | ja |
| GES · 80 % EE + Gas mit CCS | GES · 80 % EE + H₂ | 84,4 % | 15,6 % | -9,9 | -26,3 … 6,7 | nein |
| GES · 80 % EE + Gas mit CCS | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -58,7 | -83,2 … -38,7 | ja |
| GES · 80 % EE + H₂ | GES · 100 % Erneuerbare | 100,0 % | 0,0 % | -48,7 | -67,1 … -35,4 | ja |

---

## 6 · Limitationen und Datenluecken

### Modell-Limitationen

- **[hoch] scenarios_not_emission_equivalent** — Die verglichenen Szenarien haben sehr unterschiedliche Restemissionen (1 bis ueber 100 Mt CO2/a). Ein Kostenvergleich in EUR/MWh ist nur unter gleicher Emissionsnebenbedingung eine Aussage ueber Technologien. Seit v0.2b gibt es dafuer die CCS-Varianten - die Szenarien OHNE CCS bleiben untereinander nicht emissionsaequivalent. *(betrifft: alle Szenarien)*
- **[hoch] ccs_storage_availability** — Deutschland hat keine in Betrieb befindliche CO2-Speicherstaette. Die CCS-Varianten unterstellen Export in norwegische/niederlaendische Offshore-Speicher samt Logistik, Genehmigungen und Akzeptanz. Modelliert ist davon NUR der Kostensatz je Tonne - keine Kapazitaetsgrenze, keine Hochlaufkurve, kein Verfuegbarkeitsrisiko. Die jaehrlich einzulagernde Menge steht als `emissions.captured_mt_co2_a` im Ergebnis. *(betrifft: kostenminimum_ccs, ee80_gas_ccs)*
- **[mittel] ccs_cost_band_optimistic** — Der CCS-Vollkettensatz 50/80/100 EUR/t ist die im Repository belegte Spanne. Eine Recherche (2026-08-19, Clean Air Task Force / Carbon Management Europe) nennt fuer europaeische Anlagen mit den derzeit geplanten Speichern rund 70-250 EUR/t. Das Modellband liegt am unteren Rand und beguenstigt den CCS-Pfad. *(betrifft: kostenminimum_ccs, ee80_gas_ccs)*
- **[hoch] ccs_on_full_backup_fleet** — Die CCS-Varianten ruesten den GESAMTEN Backup-Park aus, auch die Stunden mit sehr wenigen Volllaststunden. Weil der CAPEX-Block dabei rund verdoppelt wird, die Anlage aber nur 1.300-1.900 h im Jahr laeuft, faellt der Kapitalanteil je abgeschiedener Tonne sehr hoch aus. Ein real optimiertes System wuerde CCS nur an den hochausgelasteten Bloecken bauen und die Spitzenlast unabgeschieden fahren. Die hier ausgewiesenen Vermeidungskosten sind deshalb eine OBERGRENZE. *(betrifft: kostenminimum_ccs, ee80_gas_ccs)*
- **[mittel] ccs_residual_is_lifecycle** — Die Restemission von Gas+CCS bleibt ein LEBENSZYKLUS-Wert: Seit v0.2c wird sie aus der Massenbilanz gerechnet (Brennstoffeintrag minus abgeschiedene Verbrennungsemissionen), der Eintrag selbst ist aber weiterhin der Lebenszyklus-Faktor inklusive Vorkette. Fuer eine reine ETS-Bepreisung ist der Wert eher zu hoch - dieselbe Richtung wie beim GuD-Proxy, also gegen den CCS-Pfad. Der Vorkettenanteil (upstream_share_of_lifecycle) ist gegen die belegte Restemission von 120 g/kWh KALIBRIERT, nicht eigenstaendig belegt. *(betrifft: kostenminimum_ccs, ee80_gas_ccs)*
- **[hoch] grid_transmission_socket_assumption** — Die mixunabhaengige Sockelquote des Uebertragungsnetzes (v0.2c: 0,40; Sensitivitaet 0,20-0,60) ist eine SETZUNG. Weder NEP 2037/2045 V2025 noch die IMK-Studie teilen die 328 (bzw. 365-392) Mrd. EUR nach Treibern auf - eine belastbare Quote existiert nicht. Die Setzung bewegt den Abstand zwischen dem Kernkraft- und dem gasgestuetzten Pfad unmittelbar; das Ergebnis weist die Differenz zum sockellosen Lauf (v0.2b) je Szenario als detail.netz.socket_effect_eur_mwh aus. *(betrifft: alle Zukunftsszenarien, Kernkraft-Pfad am staerksten)*
- **[mittel] overrun_estimate_base_assumption** — Der empirische Ueberschreitungsfaktor wird seit v0.2c als absoluter Betrag auf EINER Schaetzbasis gerechnet (Kernkraft 7.500 EUR/kW) und nur auf den Rest-Anteil der Eskalation gelegt (0,48/0,50/0,00). Das beseitigt die Nicht-Monotonie und die Doppelzaehlung an den unteren Ankern, ist aber eine Modellstruktur: Die Rest-Anteile sind aus den Eskalationsangaben des eigenen Datensatzes abgeleitet (EPR2 +40 %, Sizewell C +90 %, Lubiatowo Planzahl), der mid-Wert zusaetzlich auf 0,50 abgerundet, damit die Abbildung ueber den gesamten Faktor-Support monoton bleibt. *(betrifft: Konfigurationen mit Kostenueberschreitung)*
- **[mittel] emission_factor_proxy** — Der Emissionsfaktor fuer Gas (0,403 t/MWh_el) und Kohle (0,751 t/MWh_el) ist die UNECE-Lebenszyklus-Untergrenze, kein direkter Verbrennungsfaktor. Fuer die ETS-Bepreisung ueberschaetzt das die CO2-Kosten um rund 10-20 %. *(betrifft: CO2-Kosten und Mt-Ausweis)*
- **[hoch] grid_opex_missing** — Netzbetrieb, Instandhaltung, Verluste und Redispatch sind nicht enthalten - nur die Investitionsannuitaet. Der Netzblock der Zukunftsszenarien ist eine Untergrenze. *(betrifft: alle Zukunftsszenarien)*
- **[hoch] overrun_asymmetry** — Der empirische Ueberschreitungsfaktor ist fuer Batterie, Elektrolyse, H2-Speicher und H2-Turbine NICHT gemessen (Faktor 1,00 = Datenluecke). Das Ueberschreitungs-Szenario stresst deshalb die Kernkraft- und Netzseite staerker als die Speicher-/H2-Seite. *(betrifft: Konfigurationen mit Kostenueberschreitung)*
- **[mittel] grid_allocation_assumption** — Die Aufteilung 328 Mrd. (Uebertragung) / 323 Mrd. (Verteilung) ist quellenbelegt, die ZUORDNUNG der Treiber (Transport vs. Elektrifizierung) ist eine begruendete Modellannahme. Keine raeumliche Netzsimulation, keine ueberproportionale Kostenkurve. *(betrifft: alle Szenarien)*
- **[mittel] gas_price_transfer** — Der Erdgaspreis (20/35/60 EUR/MWh_th) ist eine Marktspanne von August 2026. Die Uebertragbarkeit auf ein Zieljahr 2045 ist nicht belegt (Konfidenz C). *(betrifft: alle Szenarien mit Gas-Backup)*
- **[hoch] h2_initial_fill_free** — Der Saisonspeicher startet in den H2-Presets gefuellt; die Stromkosten dieser Anfangsfuellung liegen ausserhalb des abgedeckten Halbjahres und sind NICHT enthalten. Die H2-Pfade sind insoweit eine Untergrenze - das ist die Gegenrichtung zur Gas-Asymmetrie und bleibt auch nach M2 bestehen. *(betrifft: ee80_h2, ee100)*
- **[mittel] nuclear_base_range_is_western** — Die Kernkraft-Basisverteilung (7.500/12.000/17.500 EUR/kW) enthaelt bewusst kein asiatisches oder Golf-Projekt - Begruendung in kosten_kernkraft.md 7.1 (Uebertragbarkeit). Der Cluster Asien/Golf (1.870-4.950 EUR/kW) ist real und belegt und wird seit v0.2b als EIGENE Monte-Carlo-Konfiguration ('asia', 'asia_wacc') gerechnet - nicht in die Basisspanne gemischt. *(betrifft: alle Szenarien mit Kernkraft)*
- **[hoch] half_year_profile** — Das Stundenprofil deckt nur Jul-Dez 2024 ab (4.416 von 8.784 h) und enthaelt den Sommerueberschuss nicht, aus dem Saisonspeicher befuellt werden. *(betrifft: alle Szenarien, H2-Pfade am staerksten)*

### Dokumentierte Datenluecken

- **gaspreis_erdgas** (`technologies.gas_*.params.fuel_eur_mwh_th`) · Status: GESCHLOSSEN in v0.2 (ausserhalb der Dossiers belegt) — Kein Erdgas-Brennstoffpreis in den Recherche-Dossiers. Seit v0.2 mit einer Marktspanne 20/35/60 EUR/MWh_th parametrisiert (TTF-Notierung, Recherche 2026-08-19, Konfidenz B; Uebertragbarkeit auf 2045 Konfidenz C). Die Nullsetzung war eine Luecke der Recherche, nicht der Welt.
- **netz_opex** (`system.grid (Betrieb, Instandhaltung, Verluste, Redispatch)`) — Fuer das Zielsystem 2045 existiert in keinem Dossier ein Netzbetriebskostensatz. Das Modell enthaelt ausschliesslich die Investitionsannuitaet - der Netzblock der Zukunftsszenarien ist damit eine Untergrenze. Belegt ist nur der Ist-Wert Engpassmanagement (2,776 Mrd. EUR 2024 bzw. 2,7-3,1 Mrd. EUR 2025).
- **ccs_nicht_modelliert** (`technologies.gas_ccs`) · Status: GESCHLOSSEN in v0.2b — Die gepruefte GES-Studie rechnet ihren Gas-Pfad mit CCS. Seit v0.2b existiert die Technologie gas_ccs (CAPEX-Aufschlag, Wirkungsgradverlust, Abscheiderate, Vollketten-Kostensatz je Tonne, Restemission mit CO2-Preis) und wird in den Presets kostenminimum_ccs und ee80_gas_ccs gerechnet. OFFEN BLEIBT die physische Verfuegbarkeit von Transport und Speicherung - siehe ccs_speicher_verfuegbarkeit.
- **ccs_speicher_verfuegbarkeit** (`technologies.gas_ccs.ccs_chain.storage_availability_de`) — Deutschland hat keine in Betrieb befindliche CO2-Speicherstaette. Der CCS-Pfad unterstellt Export in norwegische/niederlaendische Offshore-Speicher samt Logistik, Genehmigungen und Akzeptanz. Im Modell steckt davon nur der Kostensatz je Tonne - keine Kapazitaetsgrenze, keine Hochlaufkurve, kein Verfuegbarkeitsrisiko. SETZUNG (M), Konfidenz C.
- **ccs_kostenband_optimistisch** (`technologies.gas_ccs.params.ccs_cost_eur_t`) — Verwendet wird die im Repository belegte Spanne 50/80/100 EUR/t. Eine Recherche vom 2026-08-19 (Clean Air Task Force; Carbon Management Europe/ZEP) nennt fuer europaeische Anlagen mit den derzeit geplanten Speichern eine Vollkettenspanne von rund 70-250 EUR/t. Das Modellband liegt damit am unteren Rand und beguenstigt den CCS-Pfad.
- **overrun_ungemessen_speicher_h2** (`system.cost_overrun_factors.unmeasured_technologies`) — Batterie, Elektrolyse, H2-Speicher und H2-Turbine haben in Flyvbjerg/Sovacool keine Projektklasse und bleiben bei Faktor 1,00. Das ist eine Luecke, keine Messung - das Ueberschreitungs-Szenario ist deshalb asymmetrisch.
- **emissionsfaktor_direkt** (`technologies.gas_*.params.emission_factor_t_mwh`) — Kein direkter Verbrennungs-Emissionsfaktor in den Dossiers. Als Proxy dient die UNECE-Lebenszyklus-Untergrenze fuer GuD (403 g/kWh). Vor Veroeffentlichung ersetzen.
- **profile_partial** (`data/profiles_2024.json`) — Nur 4.416 von 8.784 Stunden (Jul-Dez 2024); Wind offshore, Wasserkraft und Biomasse fehlen komplett. Alle Dispatch-Ergebnisse sind H2-2024-basiert.
- **offshore_profil** (`technologies.wind_offshore.profile_series`) — Kein Offshore-Profil vorhanden; Uebergangsloesung mit Onshore-Profilform.
- **ges_technologie_split** (`ges_scenario_reconstruction`) — GES veroeffentlicht die Technologie-Aufteilung je Szenario nur als Grafik; der Mix-Test arbeitet daher mit einer rekonstruierten Aufteilung.
- **hydro_biomasse_band** (`technologies (Wasserkraft, Biomasse)`) — Keine Kostenparameter fuer Wasserkraft und Biomasse in den Dossiers; im Mix-Modell nur als optionales Band ohne Kostenansatz fuehrbar.

### Grenze der Quellenpruefung

Volltext-Abruf (WebFetch) war fuer praktisch alle Primaerquellen-Domains durch den Netzwerk-Egress blockiert. Alle Werte stammen aus Suchindex-Zusammenfassungen der genannten Quellen, nicht aus selbst gelesenem PDF-Volltext. Vor Veroeffentlichung am Original nachpruefen.

---

## 7 · Quellenverzeichnis

Konfidenzstufen: **A** mehrfach bestaetigt / institutionelle Primaerquelle · **B** einzelner Treffer, institutionelle Quelle · **C** Branchen-/Marktquelle oder Modellannahme mit schwacher Belegbasis · **M** Setzung/Modellannahme, nicht quellenbelegt.

| Nr. | Titel | Herausgeber | Datum | Konfidenz |
|---:|:---|:---|:---|:---:|
| 1 | [Netzentwicklungsplan Strom 2037 mit Ausblick 2045, Version 2025, 1. Entwurf](https://www.netzentwicklungsplan.de/sites/default/files/2025-12/NEP_2037_2045_V2025_1_Entwurf_0.pdf) | 50Hertz, Amprion, TenneT, TransnetBW | 2025-12 | A |
| 2 | [Bruttostromerzeugung in Deutschland nach Energietraegern (Datenblatt STRERZ) / Jahresauswertung Wintertagung](https://ag-energiebilanzen.de/wp-content/uploads/2025/02/STRERZ-Abgabe-2025-06.pdf) | AG Energiebilanzen e. V. | 2025-12-15 | B |
| 3 | [Comparing the Costs of Intermittent and Dispatchable Electricity Generating Technologies](https://www.aeaweb.org/articles?id=10.1257/aer.101.3.238) | American Economic Review 101(3), S. 238–241 (P. L. Joskow) | 2011-05 | A |
| 4 | [How Big Things Get Done (Megaprojekt-Datenbank, ~16.000 Projekte)](https://budgetoverrun.com/studies/flyvbjerg-megaproject-database) | B. Flyvbjerg / D. Gardner, Currency/Penguin | 2023 | A |
| 5 | [Monitoringbericht zur Energiewende (wiss. Zuarbeit EWI und BET Aachen)](https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Publikationen/Energie/monitoringbericht-energiewende.html) | BMWE | 2025-09-15 | A |
| 6 | [Endlagerung — Statusinformationen Finnland, Frankreich, Deutschland](https://www.base.bund.de/de/endlager/endlager-ausland/finnland/finnland-endlager.html) | Bundesamt fuer die Sicherheit der nuklearen Entsorgung (BASE) | 2026 | A |
| 7 | [Grundsatzeinigung mit der Europaeischen Kommission ueber Eckpunkte der Kraftwerksstrategie (StromVKG)](https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/01/20260115-grundsatzeinigung-mit-europaeischen-kommission-ueber-eckpunkte-der-kraftwerksstrategie.html) | Bundesministerium fuer Wirtschaft und Energie (BMWE) | 2026-01-15 | B |
| 8 | [Erneuerbare-Energien-Gesetz (EEG 2023), §§ 1 und 4 — Ausbauziele](https://www.umweltbundesamt.de/themen/klima-energie/erneuerbare-energien/erneuerbare-energien-gesetz) | Bundesministerium fuer Wirtschaft und Energie / UBA | 2023 | A |
| 9 | [Festlegung der Hoechstwerte 2026 fuer Wind an Land und Solar-Dachanlagen](https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20251216_Hoechstwerte.html) | Bundesnetzagentur | 2025-12-16 | B |
| 10 | [Ausschreibung Solaranlagen erstes Segment, Gebotstermin 1. Maerz 2026](https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Ausschreibungen/Solaranlagen1/BeendeteAusschreibungen/2026/01032026/start.html) | Bundesnetzagentur | 2026 | B |
| 11 | [Hohes Wettbewerbsniveau bei der Ausschreibung fuer Wind an Land zum 1. Mai 2026](https://www.bundesnetzagentur.de/1110006) | Bundesnetzagentur | 2026-06 | B |
| 12 | [Untersuchung zu Strompreisspitzen waehrend Dunkelflauten 2024 (Pressemitteilung)](https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20251021_Preisspitzen.html) | Bundesnetzagentur / Bundeskartellamt | 2025-10-21 | A |
| 13 | [Kostensituation der Windenergie an Land - Stand 2025](https://www.windguard.de/veroeffentlichungen.html?file=files%2Fcto_layout%2Fimg%2Funternehmen%2Fveroeffentlichungen%2F2025%2FKostensituation+der+Windenergie+an+Land+%E2%80%93+Stand+2025.pdf) | Deutsche WindGuard i.A. BMWK | 2025-10 | B |
| 14 | [Die Versicherungspflicht von Atomkraftwerken (WD 3 - 330/10)](https://www.bundestag.de/resource/blob/412752/5782d652a8e25945c65d84744d314b88/WD-3-330-10-pdf.pdf) | Deutscher Bundestag, Wissenschaftliche Dienste | 2010 | B |
| 15 | [Wasserstoffspeicherung in Salzkavernen kostet 0,66 bis 1,77 Euro pro Kilogramm (EWI-Analyse)](https://www.pv-magazine.de/2024/03/06/wasserstoffspeicherung-in-salzkavernen-kostet-066-bis-177-euro-pro-kilogramm/) | EWI / referiert in pv magazine Deutschland | 2024-03-06 | B |
| 16 | [Revisiting the Cost Escalation Curse of Nuclear Power: New Lessons from the French Experience](https://shs.hal.science/hal-00780566/) | Economics of Energy & Environmental Policy 4(2) (L. Escobar Rangel, F. Lévêque) | 2015-09 | B |
| 17 | [System LCOE: What are the costs of variable renewables?](https://www.sciencedirect.com/science/article/abs/pii/S0360544213009390) | Energy 63, S. 61–75 (F. Ueckerdt, L. Hirth, G. Luderer, O. Edenhofer) | 2013 | A |
| 18 | [Nuclear reactors' construction costs: The role of lead-time, standardization and technological progress](https://www.sciencedirect.com/science/article/abs/pii/S0301421515001214) | Energy Policy 82, S. 118–130 (M. Berthélemy, L. Escobar Rangel) | 2015-07 | B |
| 19 | [Beyond economies of scale: Learning from construction cost overrun risks and time delays in global energy infrastructure projects](https://www.sciencedirect.com/science/article/pii/S2214629625001380) | Energy Research & Social Science (Sovacool, Ryu) | 2025-03 | A |
| 20 | [Euratom Supply Agency — Annual Report 2024](https://euratom-supply.ec.europa.eu/) | Europaeische Kommission | 2025 | A |
| 21 | [Euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) | Europaeische Zentralbank | 2026-03-09 / laufend | B |
| 22 | [20 GW Gaskraftwerke bis 2030 - Was kostet die Erweiterung?](https://foes.de/publikationen/2025/2025-04_FOES_BUND_Kraftwerkskosten.pdf) | FOES i.A. BUND | 2025-04 | B |
| 23 | [Kurzanalyse Stromgestehungskosten und Volllaststunden flexibler Kraftwerke](https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/Kurzanalyse_flexibleKraftwerke.pdf) | Fraunhofer ISE (Kost, Sepulveda Schweiger, Thomsen) | 2024/2025 | B |
| 24 | [Stromerzeugung in Deutschland im Jahr 2025 (Jahresauswertung)](https://www.energy-charts.info/downloads/Stromerzeugung_2025.pdf) | Fraunhofer ISE / Energy-Charts (B. Burger) | 2026-01 | A |
| 25 | [Stromgestehungskosten Erneuerbare Energien](https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/DE2024_ISE_Studie_Stromgestehungskosten_Erneuerbare_Energien.pdf) | Fraunhofer-Institut fuer Solare Energiesysteme ISE | 2024-07 | B |
| 26 | [Der klimaneutrale Strommix der Zukunft — Eine Szenarioanalyse zu den Kosten des zukuenftigen deutschen Stromsystems](https://global-energy-solutions.org/wp-content/uploads/2026/05/DER-KLIMANEUTRALE-STROMMIX-DER-ZUKUNFT-veroeffentlicht-V1.1.pdf) | Global Energy Solutions e. V. | 2026-07 | C |
| 27 | [How long does it take to build a nuclear reactor?](https://hannahritchie.substack.com/p/nuclear-construction-time) | Hannah Ritchie (Sustainability by Numbers), auf Basis IAEA PRIS | 2023 | B |
| 28 | [Special Report on Solar PV Global Supply Chains](https://www.iea.org/reports/solar-pv-global-supply-chains/executive-summary) | IEA | 2022 | A |
| 29 | [Global Critical Minerals Outlook 2025](https://www.iea.org/reports/global-critical-minerals-outlook-2025) | IEA | 2025 | A |
| 30 | [Projected Costs of Generating Electricity - 2020 Edition](https://www.iea.org/reports/projected-costs-of-generating-electricity-2020) | IEA / OECD NEA | 2020-12 | B |
| 31 | [Netzinvestitionsbedarf bis 2045 (Uebertragungs- und Verteilnetz)](https://www.imk-boeckler.de/) | IMK / Hans-Boeckler-Stiftung | 2025 | B |
| 32 | [Climate Change 2023: Synthesis Report — Summary for Policymakers](https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/) | IPCC | 2023-03 | A |
| 33 | [Climate Change 2021: The Physical Science Basis — Summary for Policymakers](https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/) | IPCC (WG1) | 2021-08 | A |
| 34 | [Renewable Power Generation Costs in 2024](https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2025/Jul/IRENA_TEC_RPGC_in_2024_Summary_2025.pdf) | IRENA | 2025-07 | B |
| 35 | [Britisches Atomkraftwerk Hinkley Point C verzoegert sich weiter und wird teurer - Atomstrom kostet mindestens 15 Cent pro Kilowattstunde](https://www.iwr.de/news/britisches-atomkraftwerk-hinkley-point-c-verzoegert-sich-weiter-und-wird-teurer-atomstrom-kostet-mindestens-15-cent-pro-kilowattstunde-news39541) | IWR-Pressedienst | 2026-02-23 | B |
| 36 | [Fonds zur Finanzierung der kerntechnischen Entsorgung — Kennzahlen und Jahresergebnis 2025](https://www.kenfo.de/) | KENFO | 2026 | A |
| 37 | [Analysen und Statistiken zu Dunkelflauten in Deutschland](https://www.lbbw.de/artikel/research-studien-2025/dunkelflaute_ake25jccd8_d.html) | LBBW Research | 2025 | B |
| 38 | [Levelized Cost of Energy+ (LCOE+), Version 19.0](https://www.lazard.com/media/sdvdrvc5/lazards-lcoeplus_vf.pdf) | Lazard | 2026-07-13 | B |
| 39 | [Hinkley Point C's cost climbs to GBP35bn with confirmation Unit 1 will power up in 2030](https://www.newcivilengineer.com/latest/hinkley-point-cs-cost-climbs-to-35bn-with-confirmation-unit-1-will-power-up-in-2030-20-02-2026/) | New Civil Engineer | 2026-02-20 | B |
| 40 | [Stuendliche SMARD-Exportdaten Deutschland Jul-Dez 2024 (GitHub-Mirror, Notloesung)](https://github.com/hakimdalim/smard-data-extractor) | SMARD / Bundesnetzagentur, ueber github.com/hakimdalim/smard-data-extractor | 2024 | C |
| 41 | [Ausschreibungsergebnisse 2025](https://www.offshore-stiftung.de/de/Pressemitteilung-Ausschreibungsergebnisse-2025) | Stiftung Offshore-Windenergie | 2025 | B |
| 42 | [Carbon Neutrality in the UNECE Region — Integrated Life-cycle Assessment of Electricity Sources](https://unece.org/sed/documents/2021/10/reports/life-cycle-assessment-electricity-generation-options) | UNECE | 2022 | A |
| 43 | [Methodenkonvention 3.2 zur Ermittlung von Umweltkosten (CO2-Schattenpreise)](https://www.umweltbundesamt.de/publikationen/methodenkonvention-32-methodische-grundlagen) | Umweltbundesamt | 2020 | B |
| 44 | [Kurzstudie Dunkelflauten (Zeitreihenanalyse 2016-2025)](https://www.pv-magazine.de/2026/06/01/uniper-dunkelflauten-sind-regelmaessiger-bestandteil-des-deutschen-stromsystems/) | Uniper SE | 2026-06 | A |

### Anmerkungen zu einzelnen Quellen

- **Nr. 3 · Comparing the Costs of Intermittent and Dispatchable Electricity Generating Technologies** — Begruendet, warum LCOE-Punktwerte fluktuierende und disponible Erzeugung nicht vergleichbar machen — die methodische Referenz fuer den Schritt von LCOE zu Systemkosten. Bibliographische Angaben aus der Verlagsseite, kein Volltext gelesen.
- **Nr. 7 · Grundsatzeinigung mit der Europaeischen Kommission ueber Eckpunkte der Kraftwerksstrategie (StromVKG)** — Zeitschiene und Volumina der Kraftwerksausschreibungen; die Ausgestaltung des Kapazitaetsmechanismus ab 2031 ist darin ausdruecklich noch offen.
- **Nr. 15 · Wasserstoffspeicherung in Salzkavernen kostet 0,66 bis 1,77 Euro pro Kilogramm (EWI-Analyse)** — Originalstudie des EWI sollte noch direkt beschafft werden
- **Nr. 16 · Revisiting the Cost Escalation Curse of Nuclear Power: New Lessons from the French Experience** — Rechnet das franzoesische Programm mit den Daten des Cour-des-Comptes-Berichts nach und findet eine deutlich moderatere Eskalation als Grubler 2010; innerhalb gleicher Baugroesse und Bauart zeigt sich eine Lernkurve. Gegenposition zum „negativen Lernen“. Bibliographie aus Repositorien, kein Volltext gelesen.
- **Nr. 17 · System LCOE: What are the costs of variable renewables?** — Fuehrt die Kennzahl System-LCOE ein und zerlegt Integrationskosten in Profil-, Ausgleichs- und Netzkosten. Die LSCOE-Definition dieses Papiers ist eine engere Systemgrenze als dort — der Unterschied steht in Kapitel 3.
- **Nr. 18 · Nuclear reactors' construction costs: The role of lead-time, standardization and technological progress** — Oekonometrie der Baukosten in Frankreich und den USA: Standardisierung senkt Bauzeit und Kosten, Designwechsel erhoehen beides. Stuetzt die Lesart, dass die Eskalation an Programmorganisation haengt, nicht an der Technologie als solcher.
- **Nr. 26 · Der klimaneutrale Strommix der Zukunft — Eine Szenarioanalyse zu den Kosten des zukuenftigen deutschen Stromsystems** — Volltext-PDF in der Arbeitsumgebung nicht abrufbar (Egress-Policy). Alle Studienwerte stammen aus der Aufbereitung in docs/01 und aus Suchindex-Zusammenfassungen, nicht aus selbst gelesenem Volltext.
- **Nr. 30 · Projected Costs of Generating Electricity - 2020 Edition** — Domain in dieser Session blockiert; LCOE-Calculator unter https://www.oecd-nea.org/lcoe/
- **Nr. 40 · Stuendliche SMARD-Exportdaten Deutschland Jul-Dez 2024 (GitHub-Mirror, Notloesung)** — Primaerquellen (energy-charts, smard.de, OPSD) waren aus der Arbeitsumgebung per Egress-Policy nicht erreichbar.
- **Nr. 44 · Kurzstudie Dunkelflauten (Zeitreihenanalyse 2016-2025)** — Interessenlage: Uniper betreibt konventionelle Kraftwerke. 10-h-Schwelle statt DWD-48-h.

---

## Interaktive Fassung und weiterfuehrende Dateien

- Interaktives White Paper (Charts, Regler, Szenario-Vergleich): https://datenwgknowledgekitchen.com/whitepaper-strommix.html
- Visual Story zum selben Thema (erzaehlerisch): https://datenwgknowledgekitchen.com/strommix-story.html
- Markdown-Fassung der Story: https://datenwgknowledgekitchen.com/md/strommix-story.md
- Parametersatz des Modells: https://datenwgknowledgekitchen.com/strommix/data/model_params.json
- Monte-Carlo-Referenz: https://datenwgknowledgekitchen.com/strommix/data/monte_carlo_reference.json
- Redaktioneller Datensatz: https://datenwgknowledgekitchen.com/strommix/data/page_data.json
- Maschinenlesbarer Index der Kitchen: https://datenwgknowledgekitchen.com/llms.txt
