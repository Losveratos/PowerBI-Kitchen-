# Validierung des Kosten- und Dispatch-Modells

> Erzeugt von `scripts/validate_model.py` (Phase 3). Datenbasis: `data/model_params.json` (aus `scripts/consolidate_params.py`) und `data/profiles_2024.json` (H2-2024-basiert (Teilzeitraum), 4416 h).
> Abweichungen werden ausgewiesen und diskutiert, nicht wegoptimiert.

## Kurzfassung

| Test | Kriterium | Ergebnis |
|---|---|---|
| (a) LCOE-Reproduktion GES | +/-2 % auf 4 Werte | BESTANDEN (max. Abweichung 0.04 %) |
| (a2) Eigene Spannen vs. Fraunhofer ISE | Ueberlappung der Bandbreiten | BESTANDEN |
| (b) Ist-2024 (H2) | +/-5 % je verfuegbarer Reihe | BESTANDEN |
| (c) GES-Szenarien | Groessenordnung der 4 LSCOE | kostenminimum: -7 %; ee80_gas: -35 %; ee80_h2: -4 %; ee100: -6 % |

## (a) Ebene 1 - LCOE-Reproduktion

### a1 - GES-Annahmen gegen GES-Ergebnisse

Gerechnet mit exakt den Annahmen aus `docs/01_grundlage_ges_faktencheck.md` (WACC 5 %, Opex als CAPEX-Prozentsatz, ohne Bauzins-Aufschlag - die GES-Studie modelliert keinen IDC).

| Technologie | Annahmen | GES-LCOE | Modell | Abweichung | +/-2 % |
|---|---|---:|---:|---:|:--:|
| Photovoltaik | 1500 EUR/kW, 1 %/a, 940 h, 27 a | 124.9 | 124.9 | +0.03 % | OK |
| Wind onshore | 1749 EUR/kW, 2 %/a, 1700 h, 27 a | 90.8 | 90.8 | +0.04 % | OK |
| Wind offshore | 3500 EUR/kW, 3 %/a, 3500 h, 27 a | 98.3 | 98.3 | -0.01 % | OK |
| Kernkraft | 6000 EUR/kW, 7 %/a, 8000 h, 65 a | 101.6 | 101.6 | +0.04 % | OK |

**Befund:** Die Annuitaetenmethode des Modells ist mit der GES-Methodik identisch. Damit ist jede spaetere Abweichung im Ergebnis eine Frage der *Inputs*, nicht der Rechenmethode - genau die Trennung, die das White Paper braucht.

### a2 - Eigene Parameterspannen gegen Fraunhofer ISE / Lazard

Die drei konsistenten Szenariensaetze (`guenstig`/`mittel`/`teuer`, siehe `scenario_sets` in `model_params.json`) - **keine** mechanische min/max-Kombination, der `teuer`-Satz kombiniert max-CAPEX bewusst mit *mittleren* Volllaststunden.

| Technologie | guenstig | mittel | teuer | Modellband | Referenzband | Quelle | Ueberlappung |
|---|---:|---:|---:|---|---|---|:--:|
| Photovoltaik Freiflaeche | 29.5 | 58.3 | 118.3 | 29.5-118.3 | 41-69 | kosten_ee_speicher.md | ja |
| Wind onshore | 35.5 | 69.6 | 115.3 | 35.5-115.3 | 43-92 | kosten_ee_speicher.md | ja |
| Wind offshore | 43.9 | 87.9 | 167.9 | 43.9-167.9 | 55-103 | kosten_ee_speicher.md | ja |

Kernkraft (ohne IDC): Modellband **61.1-262.9 EUR/MWh** gegen Fraunhofer ISE 136-490 EUR/MWh, Lazard 122-190 EUR/MWh und den einzigen vertraglich fixierten Wert (Hinkley-Point-C-CfD, 147 EUR/MWh).

> Limitation: Die Eingangsannahmen von Fraunhofer ISE und Lazard (CAPEX, VLh, WACC) sind in den Dossiers **nicht** enthalten - nur deren Ergebnisspannen. Der Test prueft daher die Ueberlappung der Bandbreiten, nicht die Reproduktion Zeile fuer Zeile.

### a3 - Reproduktion der Kernkraft-Szenarien aus `kosten_kernkraft.md` 7.3

| Szenario | CAPEX | WACC | VLh | Dossier | Opex low | Opex mid | Opex max | beste Abweichung |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| optimistisch | 7500 | 3 % | 8000 | 59 | 61.1 | 70.5 | 83.9 | +3.6 % |
| ges_nah | 6000 | 5 % | 8000 | 62 | 66.9 | 76.2 | 89.6 | +7.9 % |
| realistisch_eu | 12000 | 5 % | 7500 | 133 | 112.9 | 122.5 | 136.2 | +2.4 % |
| realistisch_de | 12000 | 7 % | 7500 | 162 | 142.3 | 152.0 | 165.6 | +2.2 % |
| pessimistisch | 17500 | 9 % | 6500 | 275 | 274.7 | 285.1 | 299.5 | -0.1 % |

**Befund (Inkonsistenz im Dossier, ehrlich auszuweisen):** Die LCOE-Tabelle in `kosten_kernkraft.md` 7.3 ist mit den in 7.2 empfohlenen Parametern (Opex 130/165/200 EUR/kW/a, Brennstoff 6/8/11, Entsorgung 5/8/14) **nicht durchgaengig** reproduzierbar. Die Werte passen nur, wenn je Szenario unterschiedliche Kombinationen unterstellt werden - `realistisch_eu` (133) etwa entspricht dem Rechenbeispiel aus 5.3 mit Opex 240 EUR/kW/a, `ges_nah` (62) dagegen dem unteren Ende (Opex 130, Brennstoff 6, ohne Entsorgungsposten). Das Modell verwendet die in 7.2 **empfohlenen** Werte und weicht deshalb bewusst ab.

### a4 - Kalibrierung des Bauzins-Aufschlags (IDC)

Formel: `IDC = (1 + WACC)^(Bauzeit/2) - 1` (gleichmaessig verteilte Bauausgaben).

| Stufe | Bauzeit | Dossier-Wert | Modell (WACC 5 %) | Abweichung |
|---|---:|---:|---:|---:|
| low | 8 a | 20 % | 21.6 % | +1.6 pp |
| mid | 12 a | 33 % | 34.0 % | +1.0 pp |
| high | 17 a | 55 % | 51.4 % | -3.6 pp |

Die generische Formel reproduziert die Dossier-Werte fuer Kernkraft und liefert fuer die kurzen Bauzeiten der uebrigen Technologien deutlich kleinere Aufschlaege (PV 1 a: 2,5 %; Wind onshore 2 a: 5,0 %; Wind offshore 3 a: 7,6 % bei WACC 5 %). Damit wird der von `kosten_kernkraft.md` 5.4 beschriebene strukturelle Vorteil der langbauenden Technologie beseitigt, ohne sie einseitig zu bestrafen.

> Offene Luecke: Bauzeiten **ausserhalb** der Kernkraft sind in keinem Dossier belegt (Ausnahme: PV 1 Jahr, `kosten_kernkraft.md` 5.4). Die uebrigen Werte sind als MODELLANNAHME gekennzeichnet und in `model_params.json.gaps` gelistet.

## (b) Ebene 3 - Ist-Check gegen die realen Profile 2024

Reale Kapazitaeten Ende 2024 (Richtwerte, `profiles_2024.json` meta): PV 99.3 GW, Wind onshore 62.4 GW. Geprueft wird der abgedeckte Zeitraum (01.07.-31.12.2024, 4416 h).

| Reihe | Kapazitaet | Kapazitaetsfaktor | Profil-Summe | Modell | Abweichung | +/-5 % |
|---|---:|---:|---:|---:|---:|:--:|
| solar_mw | 99.3 GW | 0.0696 | 30.537 TWh | 30.520 TWh | -0.06 % | OK |
| wind_onshore_mw | 62.4 GW | 0.1886 | 51.978 TWh | 51.970 TWh | -0.02 % | OK |
| load_mw | - GW | - | 231.801 TWh | 231.805 TWh | +0.00 % | OK |

**Wichtige Einschraenkung zur Aussagekraft:** Der Kapazitaetsfaktor stammt aus derselben Datei wie die Zielgroesse. Der Test weist damit die *Konsistenz* der Umrechnungskette Kapazitaet -> Profil -> Energie nach, nicht die Richtigkeit der Profile selbst. Unabhaengige Gegenproben:

| Gegenprobe | Wert | Referenz | Abweichung |
|---|---:|---|---:|
| PV-Anteil Jul-Dez an der Jahreserzeugung | 45.2 % (aus Plausibilitaetsspanne) | 42.3 % (72,2 TWh Jahres-PV 2024, ist_zustand_de.md 1.3) | +7.0 % |
| Lastsumme Teilzeitraum | 231.8 TWh | erwartete Jahressumme 455-470 TWh -> Anteil 50.1 % | plausibel (Halbjahr) |
| Wind-onshore-Anteil Jul-Dez | 48.4 % | erwartete Jahressumme 100-115 TWh | plausibel (winterlastig) |

**Volllaststunden-Gegenprobe (relevanter Befund):**

- Aus dem Profil hochgerechnete Ist-Volllaststunden Wind onshore: **1723 h/a** (Kapazitaetsfaktor 0.1886 x 4416 h / Saisonanteil).
- Dossier-Wert Bestandsflotte 2025: 1608 h/a - dieselbe Groessenordnung.
- Modellannahme fuer **Neuanlagen**: 2400 h/a (+39 % gegenueber der Ist-Flotte).

Das ist kein Modellfehler, sondern der Kern des Befunds aus `kosten_ee_speicher.md` 4: Wer mit Bestandsflotten-Volllaststunden (1.600-1.700 h) rechnet, verteuert Windstrom systematisch um rund 30 % gegenueber Neuanlagen (2.400 h). Fuer den **Dispatch** ist dagegen die Profilform massgeblich, nicht die Volllaststundenannahme - deshalb bietet `dispatch()` beide Modi (`profile_cf` fuer den Ist-Check, `flh` fuer Zukunftsszenarien).

**Nicht pruefbar:** Wind offshore, Wasserkraft und Biomasse fehlen komplett in den Rohdaten (`profiles_2024.json` meta.gaps). Fuer Wind offshore verwendet das Modell als ausgewiesene Uebergangsloesung die Onshore-Profilform, skaliert auf die Offshore-Volllaststunden; die reale Offshore-Glaettung fehlt damit (konservativ - der Systemwert von Offshore wird unterschaetzt).

## (c) Ebene 2 - GES-Szenarien als Testfall

Aufbau: GES-Kostenannahmen fuer die Erzeuger (CAPEX/Opex/VLh/Lebensdauer aus `docs/01`), WACC 5 %, kein IDC, Bedarf 950 TWh. Backup, Speicher und Netz stammen aus dem eigenen Parametersatz, weil die GES-Studie ihre Kostenaufschluesselung nur als Grafik veroeffentlicht.

Hauptlauf ohne CO2-Preis (GES rechnet ein klimaneutrales Zielsystem); die Spalte 'mit CO2' zeigt denselben Lauf mit dem Default-CO2-Preis (75 EUR/t) als Sensitivitaet.

| Szenario | GES-LSCOE | Modell | Abweichung | mit CO2 | fEE-Anteil (Energie) | inst. Leistung GES / Modell | ungedeckte Last |
|---|---:|---:|---:|---:|---:|---:|---:|
| kostenminimum | 125 | 116.0 | -7 % | 118.1 | 15 % | 215 / 241 GW | 0.0 % |
| ee80_gas | 197 | 128.6 | -35 % | 139.8 | 75 % | 542 / 575 GW | 0.0 % |
| ee80_h2 | 212 | 202.8 | -4 % | 202.8 | 75 % | 618 / 619 GW | 0.0 % |
| ee100 | 321 | 301.9 | -6 % | 301.9 | 135 % | 1162 / 1163 GW | 0.0 % |

> Achtung bei der Lesart: Das LSCOE bezieht sich auf die **tatsaechlich gedeckte** Last. Ein Szenario mit ungedeckter Last ist damit nicht guenstiger, sondern unvollstaendig - die Deckungsluecke muesste durch zusaetzliche Kapazitaet (oder Importe/Lastmanagement, beides nicht modelliert) geschlossen werden.

### Kostenaufschluesselung des Modells (EUR/MWh)

| Szenario | electrolyser | gas_backup | h2_storage | h2_turbine | netz | nuclear | pv | wind_offshore | wind_onshore |
|---|---|---|---|---|---|---|---|---|---|
| kostenminimum | 0.0 | 8.1 | 0.0 | 0.0 | 6.2 | 86.0 | 5.0 | 4.9 | 5.9 |
| ee80_gas | 0.0 | 22.0 | 0.0 | 0.0 | 30.0 | 0.0 | 24.4 | 23.8 | 28.5 |
| ee80_h2 | 10.0 | 0.0 | 66.9 | 19.2 | 30.0 | 0.0 | 24.4 | 23.8 | 28.5 |
| ee100 | 56.2 | 0.0 | 35.3 | 19.0 | 53.8 | 0.0 | 43.7 | 42.7 | 51.1 |

### Dispatch-Kennzahlen (H2-2024-Zeitraum)

| Szenario | Abregelung TWh | Anteil fEE | Anteil Gesamterzeugung | Gas/H2-Backup TWh | Backup-Spitze GW | ungedeckte Last TWh |
|---|---:|---:|---:|---:|---:|---:|
| kostenminimum | 31.5 | 45.3 % | 6.6 % | 33.0 | 50.6 | 0.00 |
| ee80_gas | 38.8 | 11.4 % | 11.4 % | 176.0 | 137.3 | 0.00 |
| ee80_h2 | 9.1 | 2.7 % | 2.7 % | 176.0 | 137.3 | 0.00 |
| ee100 | 13.3 | 2.2 % | 2.2 % | 92.8 | 136.0 | 0.00 |

**Benoetigter Wasserstoff-Saisonspeicher (aus dem Fuellstandshub des Dispatchs):**

| Szenario | benoetigt | Fraunhofer-ISE-Referenz | DE-Umwidmungspotenzial (Kavernen) |
|---|---:|---:|---:|
| ee80_h2 | 284.0 TWh_H2 | 130 TWh | 30 TWh |
| ee100 | 49.1 TWh_H2 | 130 TWh | 30 TWh |

**Gegenprobe zum Startfuellstand des Saisonspeichers:**

| Szenario | H2 aus Startfuellstand | LSCOE ohne Startfuellstand | ungedeckte Last ohne Startfuellstand |
|---|---:|---:|---:|
| ee80_h2 | 283.8 TWh_H2 | 214.3 | 34.6 % |
| ee100 | 20.3 TWh_H2 | 314.9 | 5.0 % |

**Ehrliche Einordnung dieses Kunstgriffs:** Der Saisonspeicher startet gefuellt, weil der abgedeckte Zeitraum erst am 1. Juli beginnt. Der Strom, der dieses Wasserstoff-Inventar erzeugt hat, faellt in das nicht abgedeckte Halbjahr und ist in den Kosten **nicht** enthalten. Ohne Startfuellstand kippt das `ee80_h2`-Szenario dagegen in eine grosse Deckungsluecke. Beide Varianten sind falsch - die Wahrheit liegt dazwischen und ist mit einem Halbjahresprofil nicht ermittelbar. Das ist der staerkste Grund, `data/profiles_2024.json` als Volljahr nachzuziehen.

Das ist ein eigenstaendiger Befund: Der modellierte Speicherbedarf liegt um ein Vielfaches ueber dem in `kosten_ee_speicher.md` 7.2 genannten deutschen Umwidmungspotenzial von 30 TWh. Da das Modell H2-Speicherung ueber den **Durchsatz** bepreist (EWI EUR/kg) und nicht ueber die Kavernenkapazitaet, taucht diese physische Restriktion in den Kosten NICHT auf - sie ist eine Mengen-, keine Kostenrestriktion und muss im White Paper separat benannt werden.

Beide Abregelungs-Bezugsgroessen sind noetig, weil im `kostenminimum`-Szenario ein grosser Teil des Ueberschusses aus dem **Must-run-Band der Kernkraft** stammt und nicht aus fEE: Ein 100-GW-Kernkraftblock im Grundlastbetrieb liegt in Schwachlaststunden ueber der Residuallast. Das Modellkonzept sieht Kernkraft ausdruecklich als Band vor (docs/02, Ebene 3, Schritt 2); ein lastfolgender Betrieb wuerde die Abregelung senken, aber die Volllaststunden - und damit die LCOE-Basis - ebenfalls.

### Diskussion der Abweichungen (nicht wegoptimiert)

1. **Die Rangfolge der Szenarien wird reproduziert, die Absolutwerte nicht.** Das Kostenminimum-Szenario bleibt im Modell das guenstigste, das 100-%-EE-Szenario das teuerste - aber die Spreizung faellt anders aus als bei GES.
2. **Rekonstruktionsfehler ist die groesste Einzelursache.** Die Technologie-Aufteilung je Szenario liegt in der GES-Studie nur als Grafik vor (`docs/01` Kap. 6). Das Modell verteilt die veroeffentlichte fEE-Leistung im Verhaeltnis der EEG-/WindSeeG-Ziele 2045 (PV 45 / Wind on 40 / Wind off 15 %). Jede andere Aufteilung verschiebt das Ergebnis um zweistellige EUR/MWh-Betraege.
3. **Backup- und Netzkosten stammen nicht von GES.** Der Netzzuschlag (top-down, linear mit dem fEE-Anteil) und die Gas-CAPEX (1.600 statt der frueher ueblichen 800 EUR/kW) sind eigene Parameter. Die Gas-**Brennstoffkosten** fehlen in allen Dossiers und werden mit 0 angesetzt - alle Szenarien mit Gas-Backup sind daher nach unten verzerrt (ausgewiesene Untergrenze).
4. **Ein Halbjahresprofil ist kein Jahr.** Der abgedeckte Zeitraum Jul-Dez ist winterlastig; Backup-Mengen und Residuallastspitzen sind darin ueberrepraesentiert, PV-Ertraege unterrepraesentiert. Die Hochrechnung erfolgt ueber den Lastanteil des Zeitraums und ist in jedem Ergebnis als Warnung mitgefuehrt.
5. **GES modelliert keine Batteriespeicher** (`docs/01` Kap. 4). Das Modell bildet die GES-Szenarien deshalb ebenfalls ohne Batterien ab - was die H2-Kette und das Backup systematisch teurer macht, als es mit Speichern noetig waere.
6. **Keine Importe, kein Lastmanagement** (bewusste Vereinfachung des Konzepts, konservativ gegenueber allen Szenarien).
7. **Das `kostenminimum`-Szenario haengt fast vollstaendig an einer einzigen Zahl.** 86 der rund 116 EUR/MWh sind Kernkraft - gerechnet mit der GES-CAPEX-Annahme von 6.000 EUR/kW. Mit den Presets aus `kosten_kernkraft.md` (7.500 / 12.000 / 17.500 EUR/kW) verschiebt sich dieser Block etwa proportional zum Kapitalanteil. Genau das ist der Hebel, den das White Paper interaktiv zeigen sollte.

### Warnungen der Modelllaeufe (unveraendert uebernommen)

- Profil unvollstaendig (H2-2024-basiert (Teilzeitraum), 4416 h) - alle Dispatch-Ergebnisse sind auf diesen Zeitraum bezogen.
- wind_offshore: UEBERGANGSLOESUNG: profiles_2024.json enthaelt keine Offshore-Reihe (series.wind_offshore_mw.available=false). Es wird ersatzweise die Onshore-Profilform verwendet, skaliert auf die Offshore-Volllaststunden. Die reale Offshore-Glaettung (hoehere Grundproduktion, weniger Flauten) fehlt damit - konservativ, d. h. das Modell unterschaetzt den Systemwert von Offshore-Wind.
- Teilzeitraum-Hochrechnung: Dispatch-Mengen wurden mit Faktor 1.995 (Lastanteil des abgedeckten Zeitraums) auf ein Jahr hochgerechnet. Der abgedeckte Zeitraum Jul-Dez ist winterlastig - Backup- und Speichermengen werden dadurch eher ueber- als unterschaetzt.
- Gas-Brennstoffkosten fehlen in den Dossiers (gaps.gaspreis_erdgas) - im Ergebnis mit 0 EUR/MWh angesetzt. Das LSCOE ist insoweit eine UNTERGRENZE.
- 283.8 TWh H2 stammen aus dem gesetzten Anfangsfuellstand des Saisonspeichers. Die Stromkosten fuer deren Erzeugung liegen ausserhalb des abgedeckten Zeitraums und sind NICHT enthalten - das LSCOE ist insoweit eine Untergrenze.
- 20.3 TWh H2 stammen aus dem gesetzten Anfangsfuellstand des Saisonspeichers. Die Stromkosten fuer deren Erzeugung liegen ausserhalb des abgedeckten Zeitraums und sind NICHT enthalten - das LSCOE ist insoweit eine Untergrenze.
- Ungedeckte Last: 0.00 TWh im abgedeckten Zeitraum (0.00 % der Last), Spitze 0.0 GW. Import/Export und Lastmanagement sind bewusst nicht modelliert (konservativ).

## Verbleibende Luecken (aus `model_params.json.gaps`)

| ID | Parameter | Beschreibung |
|---|---|---|
| gaspreis_erdgas | `technologies.gas_*.params.fuel_eur_mwh` | Kein Erdgas-Brennstoffpreis (EUR/MWh_th oder EUR/MWh_el) in den Dossiers. Das Modell rechnet ohne expliziten Wert mit 0 und weist das Ergebnis als Untergrenze aus; gas_fuel_implied liefert eine rueckgerechnete Obergrenze. |
| emissionsfaktor_direkt | `technologies.gas_*.params.emission_factor_t_mwh` | Kein direkter Verbrennungs-Emissionsfaktor in den Dossiers. Als Proxy dient die UNECE-Lebenszyklus-Untergrenze fuer GuD (403 g/kWh). Vor Veroeffentlichung ersetzen. |
| profile_partial | `data/profiles_2024.json` | Nur 4.416 von 8.784 Stunden (Jul-Dez 2024); Wind offshore, Wasserkraft und Biomasse fehlen komplett. Alle Dispatch-Ergebnisse sind H2-2024-basiert. |
| offshore_profil | `technologies.wind_offshore.profile_series` | Kein Offshore-Profil vorhanden; Uebergangsloesung mit Onshore-Profilform. |
| ges_technologie_split | `ges_scenario_reconstruction` | GES veroeffentlicht die Technologie-Aufteilung je Szenario nur als Grafik; der Mix-Test arbeitet daher mit einer rekonstruierten Aufteilung. |
| hydro_biomasse_band | `technologies (Wasserkraft, Biomasse)` | Keine Kostenparameter fuer Wasserkraft und Biomasse in den Dossiers; im Mix-Modell nur als optionales Band ohne Kostenansatz fuehrbar. |

## Reproduktion

```bash
python3 scripts/consolidate_params.py   # research/*.md -> data/model_params.json
python3 scripts/validate_model.py       # -> research/validierung_modell.md
```
