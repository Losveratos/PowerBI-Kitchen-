---
title: "Kostendaten erneuerbare Energien, Speicher und Backup-Kraftwerke (DE/EU)"
subtitle: "Recherche- und Validierungsbericht für das Strommix-Kostenmodell"
scope: "Deutschland / EU"
date: "2026-08-15"
zugriffsdatum: "2026-08-15"
status: "Recherche-Ergebnis, Phase 1"
language: "de"
tags: [lcoe, capex, opex, volllaststunden, photovoltaik, wind, batteriespeicher, wasserstoff, gaskraftwerke]
---

# Kostendaten EE + Speicher + Backup — Recherche und Validierung

> **Zweck:** Belastbare, quellenbasierte Bandbreiten für CAPEX, OPEX, Volllaststunden,
> Lebensdauer und (wo verfügbar) LCOE je Technologie, als Input für das
> Simulationsmodell des Strommix-White-Papers. Abschließend ein maschinenlesbarer
> JSON-Block.

---

## 0. Wichtige methodische Vorbemerkung — bitte zuerst lesen

**Einschränkung der Quellenprüfung in dieser Recherche-Session:** Der Netzwerk-Egress
dieser Arbeitsumgebung hat den direkten Volltext-Abruf (WebFetch) für praktisch
**alle** einschlägigen Domains blockiert — darunter `ise.fraunhofer.de`,
`lazard.com`, `irena.org`, `bundesnetzagentur.de`, `windguard.de`, `pv-magazine.de`,
`utilitydive.com`, `foes.de`, `gridlab.org`, `dena.de`, `pexapark.com`,
`docs.nrel.gov`, `en.wikipedia.org`.

Konsequenz: **Alle Zahlen in diesem Dokument stammen aus Suchmaschinen-Zusammen­fassungen
der jeweiligen Primärquellen, nicht aus dem selbst gelesenen Volltext der PDFs.**
Die URLs und Titel sind belegt und auflösbar, die einzelnen Zahlenwerte konnten aber
nicht Zeile für Zeile am Original gegengeprüft werden. Jede Zeile trägt daher eine
**Konfidenz-Kennzeichnung**:

| Kennzeichen | Bedeutung |
|---|---|
| **A** | Zahl in mehreren unabhängigen Treffern konsistent wiedergegeben, Primärquelle institutionell (Fraunhofer, BNetzA, IRENA, BNEF, Lazard, WindGuard) |
| **B** | Zahl aus einem Treffer, Primärquelle institutionell, aber nicht mehrfach bestätigt |
| **C** | Zahl aus Branchen-/Markt-/Beratungsquelle oder Anbieter-Blog; als Marktindikation, nicht als wissenschaftlicher Beleg zu werten |
| **nicht verifiziert** | Quelle oder Zahl konnte nicht aufgefunden/bestätigt werden |

**Empfehlung an den Orchestrator:** Vor Veröffentlichung sollten mindestens die
A-Werte aus Fraunhofer ISE 2024, Deutsche WindGuard 2025, BNetzA-Ausschreibungen und
IRENA 2024 einmal am Original-PDF nachgeprüft werden (z. B. manuell durch Michael oder
aus einer Umgebung ohne Egress-Filter). Bis dahin gilt dieses Dokument als
**belastbare Arbeitsgrundlage, nicht als zitierfähige Endfassung**.

### Rechen- und Umrechnungsannahmen

- **Wechselkurs:** USD→EUR mit ~0,92 EUR/USD gerechnet (≈ 1,09 USD/EUR).
  Der tatsächliche Kurs zum jeweiligen Erhebungsstichtag der Quellen wurde **nicht**
  verifiziert. Alle aus USD umgerechneten Werte sind mit „≈" markiert und mit
  ±8 % Unsicherheit allein aus dem Wechselkurs zu behandeln.
- **LCOE-Formel** (identisch zum Grundlagen-Dokument, damit vergleichbar):
  `LCOE = (CAPEX × CRF + CAPEX × opex_pct) / (Volllaststunden/1000) + Brennstoff`
  mit `CRF = r(1+r)^n / ((1+r)^n − 1)`, r = 5 % (WACC).
- **Preisbasis:** nominal, Erhebungsjahre 2024–2026 gemischt. Keine Inflationierung
  auf ein einheitliches Basisjahr vorgenommen — das ist eine **bewusste Datenlücke**
  (siehe Abschnitt 11).

---

## 1. Zusammenfassung der wichtigsten Befunde

1. **PV Freifläche: Die Spanne 600–1.000 €/kW aus dem Grundlagen-Dokument ist
   bestätigt** und wird durch einen harten, unabhängigen Realitäts-Check gestützt:
   die BNetzA-Ausschreibung Freifläche vom 1. März 2026 ergab Zuschlagswerte von
   **3,99–5,10 ct/kWh, mengengewichtet 4,94 ct/kWh**. Das ist ein Marktpreis, kein
   Modellwert.

2. **Wind onshore: CAPEX bestätigt, aber die Volllaststunden-Annahme ist der
   eigentliche Hebel — und im Grundlagen-Dokument nicht adressiert.** Deutsche
   WindGuard (Stand 2025) nennt Hauptinvestitionskosten ~1.240 €/kW plus
   Investitionsnebenkosten ~550 €/kW ≈ **1.790 €/kW gesamt** — mitten in der
   angenommenen Spanne 1.600–1.900 €/kW. Aber: Die GES-Studie rechnet mit
   **1.700 Volllaststunden**, was dem *Bestandsflotten*-Durchschnitt entspricht.
   **Neuanlagen erreichen im Mittel über 2.400 Volllaststunden.** Bei sonst
   identischen Annahmen sinkt der LCOE dadurch von ~93 auf ~66 €/MWh (−29 %).
   Der Realitäts-Check bestätigt die niedrigere Zahl: BNetzA-Ausschreibung Mai 2026
   ergab **5,06 ct/kWh mengengewichtet (4,44–5,19 ct/kWh)**.
   → **Das Grundlagen-Dokument urteilt bei Wind zu milde** („keine systematische
   Verzerrung"). Die CAPEX stimmen, die Volllaststunden nicht.

3. **Wind offshore: Spanne 3.000–4.500 €/kW plausibel, aber die zitierte Quelle
   („Branchendaten WAB/BWE") ist nicht verifizierbar.** IRENA nennt global
   2.852 USD/kW (≈ 2.620 €/kW) für 2024 — die Untergrenze im Grundlagen-Dokument
   ist also eher zu hoch angesetzt, während europäische Projektkosten unter Druck
   nach oben stehen (Lazard 2026: 105–167 USD/MWh offshore). Deutsche
   Offshore-Ausschreibungen liefern **keinen** LCOE-Realitäts-Check, weil sie im
   Null-Cent-/Gebotskomponenten-Verfahren laufen (2025: TotalEnergies zahlte
   180 Mio. € an den Staat statt EEG-Vergütung zu erhalten). Die 2026-Runden wurden
   auf 2027 verschoben.

4. **Batteriespeicher sind erstmals seit Jahren wieder teurer geworden.** BNEF
   meldet zwar Rekordtiefstände bei Zellen/Packs (stationäre Packs 70 USD/kWh, 2025),
   Lazard weist für das Gesamtsystem aber aus, dass **Speicherkosten seit 2020 um
   27 % gestiegen** sind, LCOS für 100 MW/4 h bei **210–292 USD/MWh**. Für Europa
   liegen schlüsselfertige 4-h-Systeme bei **rund 180–260 €/kWh**. Die Diskrepanz
   Pack-Preis vs. Systempreis (Faktor ~2,5–3) ist für das Modell zentral.

5. **Die H2-Speicherkette ist der teuerste und unsicherste Block.** Europäische
   Elektrolyseur-CAPEX 2025 liegen bei **~2.075 €/kW (Alkali) bzw. ~2.196 €/kW (PEM)** —
   deutlich über den in vielen Modellen unterstellten 1.000–1.500 €/kW.
   Round-Trip-Wirkungsgrad Strom→H2→Strom: **realistisch 30–40 %**, nicht 50 %+.
   Kavernenspeicherung: 0,66–1,75 €/kg (≈ 2,0–5,3 ct/kWh_H2), bei geringer
   Zyklenzahl bis 3,50 €/kg. Neue reine H2-Kraftwerke erreichen laut Fraunhofer ISE
   **40,1–60,5 ct/kWh** Stromgestehungskosten.

6. **Gaskraftwerke: Der weit verbreitete Referenzwert „800 €/kW für GuD" ist für
   2026 nicht mehr haltbar.** Gasturbinenpreise sind um bis zu **195 %** gestiegen;
   komplette CCGT-Projekte mit Fertigstellung 2026/27 werden mit
   **1.116–2.000+ USD/kW** berichtet; für Deutschland wird ein neues 0,5-GW-GuD mit
   **über 1 Mrd. € (→ >2.000 €/kW)** beziffert. Das trifft alle Szenarien mit
   Gas-Backup — auch das „Kostenminimum"-Szenario der GES-Studie.

7. **Fraunhofer ISE: Die aktuellste auffindbare Ausgabe der Studie
   „Stromgestehungskosten Erneuerbare Energien" ist die vom Juli 2024.** Es konnte
   **keine** 2025er- oder 2026er-Neuauflage gefunden werden. Lazard hingegen hat am
   13. Juli 2026 die 19. Ausgabe des LCOE+ veröffentlicht — das ist derzeit die
   aktuellste verfügbare internationale Referenz.

---

## 2. Photovoltaik Freifläche

| Parameter | min | typisch | max | Einheit | Quelle | Konf. |
|---|---|---|---|---|---|---|
| CAPEX | 600 | 750 | 1.000 | €/kW | Marktangaben DE Freifläche (Logic Energy u. a.) | **C** |
| CAPEX (global, gewichtet) | – | ≈ 636 (691 USD) | – | €/kW | IRENA, Renewable Power Generation Costs in 2024 | **A** |
| OPEX | 1,0 | 1,5 | 2,0 | % CAPEX/a | Konvention Fraunhofer ISE / GES | **B** |
| Volllaststunden DE | 950 | 1.030 | 1.150 | h/a | spez. Ertrag 850–1.150 kWh/kWp, Freifläche am oberen Rand | **B** |
| Lebensdauer | 25 | 30 | 35 | a | Fraunhofer ISE 2024 | **B** |
| **LCOE (Fraunhofer ISE 2024)** | **4,1** | – | **6,9** | ct/kWh | Fraunhofer ISE, Juli 2024 | **A** |
| **LCOE-Realitäts-Check: BNetzA-Zuschläge 1.3.2026** | **3,99** | **4,94** | **5,10** | ct/kWh | Bundesnetzagentur, März 2026 | **A** |
| LCOE-Prognose 2045 | 3,1 | – | 5,0 | ct/kWh | Fraunhofer ISE, Juli 2024 | **A** |
| Solar-PPA DE, langfristig | 55 | 60 | 65 | €/MWh | Marktberichte 2026 | **C** |
| Europ. PPA-Index (Mischprodukt) | – | 42,70 | – | €/MWh | Pexapark, Feb. 2026 (via pv magazine) | **B** |

**Einordnung:** Die BNetzA-Zuschlagswerte sind der belastbarste Punkt im ganzen
Datensatz — sie sind bindende Marktpreise mit Realisierungspflicht, keine
Modellrechnung. Sie liegen mit 3,99–5,10 ct/kWh am **unteren** Rand der
Fraunhofer-Spanne und **weit** unter dem GES-Studienwert von 12,5 ct/kWh.

**Achtung Interpretation:** Ausschreibungswerte ≠ LCOE. Sie enthalten die
Erwartung zusätzlicher Erlöse und Risikoprämien und beziehen sich auf einen
20-Jahre-Förderzeitraum, während die Anlage 30+ Jahre läuft. Sie sind ein
*Plausibilitäts-Korridor*, keine direkte LCOE-Substitution — tendenziell eher eine
**Obergrenze** für die kalkulierten Vollkosten des Betreibers über 20 Jahre.

**Unsicherheit:** Die CAPEX-Untergrenze von 600 €/kW stammt aus einer kommerziellen
Branchenquelle (Logic Energy), nicht aus einer institutionellen Erhebung. Sie ist
durch die Ausschreibungsergebnisse indirekt gestützt, aber nicht primärquellenfest.

---

## 3. Photovoltaik Dach

| Parameter | min | typisch | max | Einheit | Quelle | Konf. |
|---|---|---|---|---|---|---|
| CAPEX Großdach (MW-Bereich) | 630 | 700 | 720 | €/kW | Marktangaben Gewerbe-PV 2026 | **C** |
| CAPEX Gewerbe 100–750 kWp | 700 | 900 | 1.100 | €/kW | Marktangaben Gewerbe-PV 2026 | **C** |
| CAPEX Gewerbe 30–100 kWp | 950 | 1.100 | 1.300 | €/kW | Marktangaben Gewerbe-PV 2026 | **C** |
| CAPEX Kleinanlage (Wohngebäude) | 1.100 | 1.450 | 1.800 | €/kW | Marktangaben 2026 | **C** |
| Durchschnittl. Systempreis (alle Segmente) | – | 1.015 | – | €/kWp | Fraunhofer ISE, Stand März 2026 (via Sekundärquellen) | **B** |
| OPEX | 1,0 | 1,5 | 2,0 | % CAPEX/a | Konvention | **B** |
| Volllaststunden | 850 | 950 | 1.100 | h/a | spez. Ertrag DE | **B** |
| Lebensdauer | 25 | 30 | 30 | a | Fraunhofer ISE 2024 | **B** |
| LCOE (PV gesamt, alle Typen) | 3,12 | – | 11,01 | ct/kWh | Fraunhofer ISE, Juli 2024 | **A** |
| LCOE-Prognose Dach 2045 | 4,9 | – | 10,4 | ct/kWh | Fraunhofer ISE, Juli 2024 | **A** |

**Einordnung:** Dach-PV ist **kein** homogenes Produkt — die Spanne von 630 €/kW
(MW-Großdach) bis 1.800 €/kW (Einfamilienhaus) ist fast Faktor 3. Für ein
Systemmodell auf 950-TWh-Ebene ist das **Großdach-/Gewerbe-Segment** die relevante
Referenz, nicht der Eigenheim-Speicher-Markt.

**Datenlücke:** Für PV Dach liegt **kein** Ausschreibungs-Realitäts-Check auf dem
Niveau der Freifläche vor. Die BNetzA-Ausschreibung für Aufdach-Solaranlagen zum
1. Februar 2026 war **unterzeichnet** — das ist ein Signal, dass die Höchstwerte für
dieses Segment am Markt nicht auskömmlich sind, liefert aber keine belastbare
Preisspanne.

**Warnung zur Quellenqualität:** Die Dach-CAPEX-Werte stammen überwiegend aus
Vergleichsportalen und Anbieter-Blogs (42watt, reduco.ai, energie-experten u. a.).
Das sind **Marktindikationen, keine wissenschaftlichen Erhebungen.** Für die
Veröffentlichung sollten sie durch die Fraunhofer-ISE-Originaltabellen ersetzt oder
zumindest als solche gekennzeichnet werden.

---

## 4. Wind onshore Deutschland

| Parameter | min | typisch | max | Einheit | Quelle | Konf. |
|---|---|---|---|---|---|---|
| Hauptinvestitionskosten | – | 1.240 | – | €/kW | Deutsche WindGuard, Stand 2025 (Marktbefragung Sommer 2025) | **A** |
| Investitionsnebenkosten (o. Fundament) | – | 550 | – | €/kW | Deutsche WindGuard, Stand 2025 (IBN 2025–2028) | **A** |
| **CAPEX gesamt** | **1.500** | **1.790** | **2.100** | **€/kW** | Summe WindGuard 2025 + Bandbreite | **A/B** |
| CAPEX (Vergleich) | 1.300 | – | 1.900 | €/kW | Fraunhofer ISE, Juli 2024 | **A** |
| CAPEX (global, gewichtet) | – | ≈ 958 (1.041 USD) | – | €/kW | IRENA, Costs in 2024 | **A** |
| OPEX | 2,0 | 2,5 | 3,0 | % CAPEX/a | Konvention / WindGuard | **B** |
| **Volllaststunden Neuanlagen** | **2.200** | **2.400** | **3.000** | **h/a** | „im Mittel über 2.400 h" (normalisiert), Bandbreite 2.000–3.000 | **B** |
| Volllaststunden Bestandsflotte | 1.608 (2025) | 1.770 (Ø seit 2015) | – | h/a | Fraunhofer / Betriebsstatistik | **A** |
| Lebensdauer | 25 | 27 | 30 | a | Konvention / GES | **B** |
| LCOE (Fraunhofer ISE 2024) | 4,3 | – | 9,2 | ct/kWh | Fraunhofer ISE, Juli 2024 | **A** |
| LCOE Europa (IRENA 2024) | – | ≈ 4,7 (0,051 USD) | – | ct/kWh | IRENA, Costs in 2024 | **A** |
| **Realitäts-Check: BNetzA Feb. 2026** | 5,19 | **5,54** | 5,64 | ct/kWh | Bundesnetzagentur, Feb. 2026 | **A** |
| **Realitäts-Check: BNetzA Mai 2026** | 4,44 | **5,06** | 5,19 | ct/kWh | Bundesnetzagentur, Mai 2026 | **A** |
| Höchstwert 2026 | – | 7,25 | – | ct/kWh | Bundesnetzagentur, Festlegung 12.12.2025 | **A** |
| PPA onshore DE 2026 | 70 | 80 | 93 | €/MWh | Marktberichte / PPA-Preisindex | **C** |

### Der Volllaststunden-Befund (wichtigster neuer Punkt dieser Recherche)

Eigene Nachrechnung mit der Formel des Grundlagen-Dokuments
(CAPEX 1.790 €/kW, opex 2 %, n = 27 a, r = 5 % → CRF = 0,0683):

| Volllaststunden-Annahme | LCOE | Δ zur GES-Studie |
|---|---|---|
| 1.700 h (GES-Studie, ≈ Bestandsflotte) | **93,0 €/MWh** | Referenz |
| 2.400 h (Neuanlagen-Mittel) | **65,9 €/MWh** | **−29 %** |
| 2.600 h (gute Standorte) | **60,8 €/MWh** | −35 % |

Zum Vergleich: BNetzA-Zuschlag Mai 2026 **50,6 €/MWh**. Selbst der 2.600-h-Wert liegt
noch über dem realen Ausschreibungspreis — die Rechnung ist also eher konservativ.

**Schlussfolgerung:** Die GES-Studie unterschätzt Wind onshore nicht über die CAPEX
(die passen), sondern über die **Volllaststunden**. Wer neu gebaute Anlagen mit dem
Ertragsprofil einer 15 Jahre alten Bestandsflotte rechnet, verteuert Windstrom
systematisch um rund ein Drittel. **Diese Abweichung ist im Grundlagen-Dokument
nicht erfasst** und sollte dort ergänzt werden — der dortige Befund „Wind: keine
systematische Verzerrung" ist nur für die CAPEX richtig.

**Gegen-Einwand, der fairerweise dazugehört:** Der Wert 1.700 h könnte in der
GES-Studie bewusst als *systemweiter Flottendurchschnitt 2045* gemeint sein (inkl.
Altanlagen, Abregelung, Einspeisemanagement). Ob das so ist, lässt sich ohne
Volltext-Zugriff auf Tabelle 4 der Studie **nicht entscheiden**. Der Punkt sollte
im White Paper als offene Frage formuliert werden, nicht als erwiesener Fehler.

---

## 5. Wind offshore Deutschland / Nordsee

| Parameter | min | typisch | max | Einheit | Quelle | Konf. |
|---|---|---|---|---|---|---|
| CAPEX inkl. Netzanbindung | 2.200 | 3.000 | 3.400 | €/kW | Branchenangaben DE 2025/26 | **C** |
| CAPEX (global, gewichtet) | – | ≈ 2.624 (2.852 USD) | – | €/kW | IRENA, Costs in 2024 | **A** |
| **CAPEX Modellansatz** | **2.600** | **3.400** | **4.500** | **€/kW** | Synthese IRENA + europ. Kostendruck | **B** |
| OPEX | 2,5 | 3,0 | 4,0 | % CAPEX/a | Konvention / GES | **B** |
| Volllaststunden Nordsee (gut) | 4.000 | 4.300 | 4.500 | h/a | Fraunhofer ISE 2024 („bis zu 4.500 h") | **A** |
| Volllaststunden mit Abschattung | 2.700 | 3.000 | 3.300 | h/a | Fraunhofer IWES für BWO, Feb. 2025 | **B** |
| **Volllaststunden Modellansatz** | **3.000** | **3.800** | **4.500** | **h/a** | Synthese | **B** |
| Lebensdauer | 25 | 27 | 30 | a | Konvention | **B** |
| LCOE (Fraunhofer ISE 2024) | 5,5 | – | 10,3 | ct/kWh | Fraunhofer ISE, Juli 2024 | **A** |
| LCOE Europa (IRENA 2024) | – | ≈ 7,4 (0,080 USD) | – | ct/kWh | IRENA, Costs in 2024 | **A** |
| LCOE (Lazard 2026) | ≈ 9,7 (105 USD) | – | ≈ 15,4 (167 USD) | ct/kWh | Lazard LCOE+ v19.0, Juli 2026 | **A** |

### Wichtig: Deutsche Offshore-Ausschreibungen taugen NICHT als LCOE-Check

Anders als bei PV und Wind onshore liefern die deutschen Offshore-Ausschreibungen
**keinen** Preissignal für die Stromgestehungskosten:

- Sie laufen als **Null-Cent-Gebote mit dynamischem Gebotsverfahren** — Bieter
  verzichten auf jede EEG-Vergütung und **zahlen** stattdessen an den Staat.
- Beispiel: Fläche N-9.4 (Nordsee, 1.000 MW), Zuschlag 17.06.2025 an TotalEnergies
  (North Sea OFW One GmbH), Zahlung **180 Mio. €** an den Bund.
- Diese Zahlungen sind ein **Kostenaufschlag** auf das Projekt, kein Kostenbeleg —
  sie erhöhen die realen Gestehungskosten des Projekts, tauchen aber in keinem
  LCOE-Vergleich auf.
- Die für 2026 geplanten Offshore-Ausschreibungen wurden mit der Änderung des
  Flächenentwicklungsplans (30.01.2026) **auf 2027 verschoben**.

**Datenlücke:** Projektspezifische CAPEX-Zahlen für die aktuellen deutschen Parks
(He Dreiht 960 MW, EnBW, IBN 2026; Borkum Riffgrund 3, 913 MW, Ørsted, erste
Einspeisung 12/2025) sind **öffentlich nicht in €/kW aufgeschlüsselt**. Ørsted nennt
für sechs deutsche Parks kumuliert ~7,5 Mrd. € seit 2012 — daraus lässt sich keine
saubere spezifische Kennzahl ableiten. Das ist eine echte Lücke.

**Abweichung zum Grundlagen-Dokument:** Dort steht 3.000–4.500 €/kW mit Quelle
„Branchendaten (WAB/BWE)". Eine konkrete WAB- oder BWE-Publikation mit genau diesen
Werten **konnte nicht aufgefunden werden → nicht verifiziert.** Die IRENA-Zahl
(≈ 2.620 €/kW global 2024) legt nahe, dass die **Untergrenze eher bei 2.600 €/kW**
liegt. Die Obergrenze 4.500 €/kW ist angesichts der Lazard-2026-Werte plausibel.

---

## 6. Batteriespeicher (Großspeicher / Utility-Scale)

| Parameter | min | typisch | max | Einheit | Quelle | Konf. |
|---|---|---|---|---|---|---|
| Zell-/Pack-Preis stationär | – | ≈ 64 (70 USD) | – | €/kWh | BloombergNEF Battery Price Survey, Dez. 2025 | **A** |
| Pack-Preis alle Segmente | – | ≈ 99 (108 USD) | – | €/kWh | BloombergNEF, Dez. 2025 | **A** |
| Pack-Preis Prognose 2026 | – | ≈ 97 (105 USD) | – | €/kWh | BloombergNEF, Dez. 2025 | **A** |
| **System schlüsselfertig, 4 h, Europa** | **180** | **210** | **260** | **€/kWh** | Marktdaten Europa 2026; BNEF ~177 €/kWh (2025) | **B** |
| Reine Batteriekosten netzdienl. Großspeicher | 150 | – | 350 | €/kWh | Marktangaben DE 2026 | **C** |
| Impliziter Projektwert DE | – | ≈ 200 | – | €/kWh | 50–500 MWh ↔ 10–100 Mio. € (Branchenreport) | **C** |
| **CAPEX leistungsbezogen (4-h-System)** | **720** | **840** | **1.040** | **€/kW** | abgeleitet aus €/kWh × 4 h | **B** |
| CAPEX kleine PV-Heimspeicher (Abgrenzung!) | 400 | – | 1.000 | €/kWh | Fraunhofer ISE, Juli 2024 | **A** |
| OPEX | 1,5 | 2,0 | 3,0 | % CAPEX/a | Konvention | **C** |
| Round-Trip-Wirkungsgrad (AC-AC, netto) | 0,85 | 0,88 | 0,92 | – | Branchen-Engineering-Quellen | **C** |
| Vollzyklen bis 80 % SoH (LFP) | 6.000 | 8.000 | 12.000 | Zyklen | LFP-Marktdaten | **C** |
| Kalendarische Lebensdauer | 15 | 20 | 25 | a | LFP-Marktdaten, temperaturabhängig | **C** |
| **LCOS 100 MW / 4 h (Lazard 2026)** | ≈ 193 (210 USD) | – | ≈ 269 (292 USD) | €/MWh | Lazard LCOE+ v19.0, Juli 2026 | **A** |
| Kostenentwicklung Speicher seit 2020 | – | **+27 %** | – | % | Lazard LCOE+ v19.0, Juli 2026 | **A** |

### Der zentrale Befund: Zelle ≠ System

Es kursiert regelmäßig die Zahl „Batterien kosten nur noch 70–100 $/kWh". Das ist der
**Pack-Preis**, nicht der Systempreis. Zwischen Pack und betriebsbereitem
Netzspeicher liegen Leistungselektronik (PCS), Trafo, Netzanschluss, Brandschutz,
Container, Kühlung, Steuerung, Tiefbau, Projektentwicklung und Netzanschlusskosten.
Der Faktor beträgt in Europa aktuell rund **2,5–3×**.

**Wichtigste Trendumkehr:** Lazard weist für 2026 explizit aus, dass Speicherkosten
**gestiegen** sind (+27 % seit 2020) — entgegen der verbreiteten Erwartung
kontinuierlich fallender Preise. Ursachen laut Berichterstattung: Zinsen, Zölle,
Lieferkettendruck, Nachfrageschub durch Rechenzentren. Für das Simulationsmodell
bedeutet das: **keine automatische Lernkurven-Extrapolation nach unten** ohne
Sensitivitätsbetrachtung.

**Marktkontext Deutschland:** Der Zubau boomt — 2026 erstmals über 15 GWh kumuliert,
Jahresinvestitionsvolumen über 2 Mrd. €. Projekte in Bau u. a. Förderstedt (716 MWh),
Klostermansfeld (1.000 MW / bis 5.700 MWh, Baustart Juli 2026), Waltrop (900 MW /
≥ 1.800 MWh). Historische Realisierungsquote genehmigter Projekte: 60–70 %.
(Konfidenz **C**, Branchenreport.)

**Datenlücken:**
- Round-Trip-Wirkungsgrad und Zyklenzahlen stammen aus Anbieter-/Engineering-Quellen,
  nicht aus einer institutionellen Erhebung → **Konfidenz C**.
- Die Aufteilung €/kW vs. €/kWh ist im Modell **entscheidungsrelevant**: Ein
  1-h-System und ein 8-h-System haben bei gleicher Leistung völlig verschiedene
  Kosten. Die hier angegebenen €/kW gelten **ausschließlich für 4-h-Systeme**.
- Es fehlt eine belastbare deutsche institutionelle Erhebung zu
  Großspeicher-Systemkosten (analog WindGuard für Wind). Das ist eine Lücke im
  gesamten deutschen Datenbestand, nicht nur in dieser Recherche.

---

## 7. Elektrolyse + Wasserstoff-Rückverstromung (H2-Kette)

### 7.1 Elektrolyseur

| Parameter | min | typisch | max | Einheit | Quelle | Konf. |
|---|---|---|---|---|---|---|
| CAPEX Alkali (EU) | – | 2.075 | – | €/kW | Global Hydrogen Hub, EU-Elektrolyseurkosten 2025 | **B** |
| CAPEX PEM (EU) | – | 2.196 | – | €/kW | Global Hydrogen Hub, 2025 | **B** |
| **CAPEX Modellansatz** | **1.200** | **2.100** | **2.600** | **€/kW** | Synthese (Untergrenze = Großprojekt-/Zielwerte) | **B/C** |
| OPEX | 2,0 | 3,0 | 4,0 | % CAPEX/a | Konvention | **C** |
| Wirkungsgrad (Strom→H2, LHV) | 0,60 | 0,66 | 0,70 | – | Marktübliche Systeme | **B** |
| Wirkungsgrad SOEC (Hochtemperatur) | – | – | 0,84 | – | SOEC-Angaben | **C** |
| Stromverbrauch | 45 | 48 | 50 | kWh/kg H2 | Kommerzielle Elektrolyseure | **B** |
| Stack-Lebensdauer | 30.000 | 60.000 | 90.000 | Betriebs-h | Herstellerangaben | **C** |
| Systemlebensdauer | 20 | 22 | 25 | a | Herstellerangaben | **C** |
| Volllaststunden (EE-gekoppelt) | 3.000 | 4.000 | 6.000 | h/a | Modellannahme, nicht quellenbelegt | **nicht verifiziert** |

**Befund:** Die europäischen Ist-CAPEX von ~2.100 €/kW liegen **deutlich über** den
in vielen Energiesystemmodellen unterstellten 800–1.500 €/kW. Zwar sind die Kosten
2025 zweistellig gefallen und die europäische Fertigungskapazität ist auf 13,1 GW/a
gestiegen — der Abstand zwischen Modellannahme und Marktpreis ist aber real und
sollte im White Paper explizit sichtbar gemacht werden.

### 7.2 Wasserstoff-Kavernenspeicher

| Parameter | min | typisch | max | Einheit | Quelle | Konf. |
|---|---|---|---|---|---|---|
| Speicherkosten | 0,66 | 1,20 | 1,75 | €/kg H2 | EWI, Analyse untertägige H2-Speicher (2024) | **A** |
| Speicherkosten (energiebezogen) | 1,98 | 3,60 | 5,25 | ct/kWh_H2 | EWI, umgerechnet auf Heizwert | **A** |
| bei **geringer** Zyklenzahl | – | – | 3,50 | €/kg H2 | EWI | **A** |
| bei **hoher** Zyklenzahl | 0,45 | – | – | €/kg H2 | EWI | **A** |
| Kapazität je Kaverne (DE-typisch) | 35 | – | 140 | GWh | EWI | **A** |
| Potenzial Umwidmung Erdgas-Kavernen | – | ~30 | – | TWh | EWI / pv magazine | **B** |
| Bedarf DE 2030 | – | bis 3 | – | TWh | EWI-Prognose | **B** |
| Bedarf DE 2045 | – | > 100 | – | TWh | EWI-Prognose | **B** |

**Wichtigster Kostentreiber ist die Auslastung, nicht die Bauart.** Faktor ~7,8
zwischen hoher (0,45 €/kg) und niedriger Zyklenzahl (3,50 €/kg). Für einen
**saisonalen** Speicher — genau der Anwendungsfall in 100-%-EE-Szenarien — gilt
naturgemäß die **niedrige** Zyklenzahl, also das **teure** Ende. Das ist ein
strukturelles Argument, das in Kostenvergleichen oft untergeht und für das White
Paper hoch relevant ist.

### 7.3 Rückverstromung und Round-Trip

| Parameter | min | typisch | max | Einheit | Quelle | Konf. |
|---|---|---|---|---|---|---|
| **Round-Trip Strom→H2→Strom (ohne Wärmenutzung)** | **0,30** | **0,34** | **0,40** | – | Energie-Lexikon, TÜV SÜD, Vattenfall u. a. | **B** |
| Round-Trip reversible SOFC (Reverion) | – | – | 0,75 | – | Herstellerangabe, nicht großtechnisch validiert | **C** |
| Wirkungsgrad H2-GuD (Rückverstromung) | 0,55 | 0,58 | 0,62 | – | GuD-Technik | **B** |
| Wirkungsgrad H2-Gasturbine (offen) | 0,38 | 0,40 | 0,42 | – | Gasturbinen-Technik | **B** |
| CAPEX H2-Kraftwerk (Neubau) | 800 | 1.400 | 2.200 | €/kW | Synthese aus Gaskraftwerks-CAPEX + H2-Aufschlag | **C** |
| H2-Aufschlag „H2-ready" GuD | – | < 10 | – | % der Erstinvestition | Reiner Lemoine Institut, Policy Briefing 2024 | **B** |
| H2-Aufschlag Gasmotoren | – | bis +20 | – | %-Punkte zusätzl. | RLI, 2024 | **B** |
| **LCOE H2-Kraftwerk Neubau** | **40,1** | – | **60,5** | ct/kWh | Fraunhofer ISE, Kurzanalyse flexible Kraftwerke | **A** |
| LCOE Gaskraftwerk 2024 mit H2-Umrüstung ab 2035 | 14,3 | – | 32,5 | ct/kWh | Fraunhofer ISE, Kurzanalyse (500–3.000 VLh) | **A** |

**Zentraler Befund:** Der Round-Trip-Wirkungsgrad der H2-Kette ist mit realistisch
**30–40 %** der kritische Parameter. Er bedeutet: Für 1 kWh rückverstromten Strom
müssen **2,5–3,3 kWh** erneuerbarer Strom erzeugt werden. Genau hier entsteht die
massive Überkapazität, die die GES-Studie im 100-%-EE-Szenario ausweist
(1.162 GW installiert). Dieser Mechanismus ist **physikalisch korrekt** und darf
im White Paper nicht kleingeredet werden — die Frage ist nicht *ob*, sondern
*wie viel* saisonale Speicherung gebraucht wird und ob Alternativen (Import,
Flexibilisierung, Netzausbau, DSM) günstiger sind.

Reverions Angabe von 75 % Round-Trip beruht auf reversibler Festoxid-Technologie und
ist bislang **nicht im GW-Maßstab demonstriert**. Sie gehört als Ausblick ins White
Paper, nicht als Modell-Basisannahme.

**Anmerkung zu einer Quelle im Grundlagen-Dokument:** Global Energy Solutions e.V.
hat 2022 selbst ein Lagebild „Elektrolyse — Status Quo" publiziert
(`global-energy-solutions.org`, Feb. 2022). Das stützt die im Grundlagen-Dokument
getroffene Beobachtung, dass der Verein ursprünglich H2-fokussiert war.

---

## 8. Gaskraftwerke (GuD und OCGT, inkl. H2-ready)

| Parameter | min | typisch | max | Einheit | Quelle | Konf. |
|---|---|---|---|---|---|---|
| **CAPEX GuD (klassische Referenz, veraltet)** | – | 800 | – | €/kW | Branchen-Standardwert, Erhebung ≤ 2020 | **C / veraltet** |
| CAPEX OCGT (klassische Referenz, veraltet) | – | 400 | – | €/kW | Branchen-Standardwert, Erhebung ≤ 2020 | **C / veraltet** |
| CCGT Projekte Fertigstellung 2026/27 (US) | ≈ 1.027 (1.116 USD) | – | ≈ 1.313 (1.427 USD) | €/kW | GridLab, Gas Turbine Costs Report, Sept. 2025 | **B** |
| CCGT aktuelle Projektmeldungen (US) | – | ≥ ≈ 1.840 (2.000 USD) | – | €/kW | GridLab / Branchenberichte 2025/26 | **B** |
| **Neubau GuD Deutschland 0,5 GW** | – | **> 2.000** | – | **€/kW** | „über 1 Mrd. € für 0,5 GW", Berichterstattung 2026 | **B** |
| Gasturbinen-Preisanstieg | – | **+195** | – | % | power-eng.com / Branchenanalyse 2026 | **B** |
| Gasturbinenpreis Prognose Ende 2027 | – | ≈ 552 (600 USD) | – | €/kW (nur Turbine) | Branchenanalyse 2026 | **B** |
| **CAPEX GuD Modellansatz 2026** | **1.000** | **1.600** | **2.200** | **€/kW** | Synthese | **B** |
| **CAPEX OCGT Modellansatz 2026** | **500** | **750** | **1.100** | **€/kW** | Synthese (Turbinenpreis + BOP) | **C** |
| Investitionskostenförderung KWSG-Konsultation | – | 660 | – | €/kW (660.000 €/MW) | BMWK-Konsultation Kraftwerkssicherheitsgesetz | **B** |
| Wirkungsgrad GuD (Erdgas) | 0,58 | 0,60 | 0,64 | – | GuD-Technik | **A** |
| Wirkungsgrad OCGT | 0,35 | 0,40 | 0,42 | – | Gasturbinen-Technik | **B** |
| OPEX | 2,5 | 3,0 | 4,0 | % CAPEX/a | Konvention | **C** |
| Lebensdauer | 25 | 30 | 35 | a | Konvention | **C** |
| Volllaststunden Backup-Betrieb | 500 | 1.500 | 3.000 | h/a | Fraunhofer ISE Kurzanalyse (Analyserahmen) | **A** |
| LCOE neues Gaskraftwerk DE (reine Erzeugung) | 23 | – | 28 | ct/kWh | FÖS-Studie für Green Planet Energy, 2025 | **B** |
| LCOE inkl. gesellschaftlicher Kosten | – | – | 67 | ct/kWh | FÖS-Studie, 2025 | **B** |
| LCOE bei Gaspreis-Krisenniveau (2022) | 48 | – | 53 | ct/kWh | FÖS-Studie, 2025 | **B** |

### Der Kostenanstieg bei Gasturbinen ist der unterschätzte Systemrisiko-Faktor

Die weltweite Nachfrage nach Gasturbinen (getrieben u. a. durch Rechenzentren) hat zu
einem strukturellen Engpass geführt:

- Nur drei dominante OEMs (GE Vernova, Siemens Energy, Mitsubishi Power).
- Auftragsbestand GE Vernova 40 → 44 GW; Slot-Reservierungen 43 → 56 GW.
- Reservierungsgebühren sind inzwischen nötig, um überhaupt einen Fertigungsslot zu
  bekommen; Slots sind bis 2030 knapp.
- GE Vernova investiert > 160 Mio. USD, um von ~50 auf 70–80 Großturbinen/Jahr zu
  kommen (bis Ende 2026) — das entlastet den Markt frühestens ab Ende der Dekade.

**Modell-Konsequenz:** Jedes Szenario, das auf Gas-Backup setzt — einschließlich des
GES-„Kostenminimum"-Szenarios und der 80-%-EE-Szenarien — arbeitet mit einer
CAPEX-Annahme, die um **Faktor 2–2,5** unter aktuellen Marktrealitäten liegen dürfte,
wenn 800 €/kW für GuD unterstellt wird. Das ist eine **Verzerrung, die alle
Szenarien betrifft**, aber die gas-intensiven am stärksten.

### Kraftwerkssicherheitsgesetz / Kraftwerksstrategie — Regulatorischer Rahmen

- Ausgeschrieben: **12,5 GW** Kraftwerkskapazität + 500 MW Langzeitspeicher
  (Struktur variiert je nach Eckpunkte-Stand: 8 GW H2-ready-Gaskraftwerke,
  2 GW technologieneutral, 2 GW H2-fähige Sprinterkraftwerke bzw. in anderer
  Darstellung 5 GW Neubau + 2 GW Modernisierung + 5 GW zweite Säule).
- Ausschreibungsstart **2026**, weitere Runden 2027 und 2029/30; erste Anlagen aus
  Runde 1 sollen **2031** in Betrieb gehen.
- Umstellung auf grünen/blauen Wasserstoff **spätestens im 8. Betriebsjahr**.
- Gefördert werden CAPEX sowie ab H2-Umstieg die Differenzkosten H2/Erdgas
  für **800 Vollbenutzungsstunden/a**.
- Finanzierung über eine Umlage ab 2031; Förderkosten laut Regierungsschätzung
  1–3 Mrd. € (2031) und 0,9–2,3 Mrd. €/a (2032–2045).

**Hinweis zur Quellenlage:** Zum Stand der Kraftwerksstrategie kursieren mehrere,
teils widersprüchliche Kapazitätsangaben (12 GW vs. 12,5 GW; unterschiedliche
Aufteilungen). Das liegt an mehreren Novellen/Eckpunktepapieren zwischen 2024 und
2026. **Vor Veröffentlichung ist der aktuelle Gesetzesstand einmal am Original
(BMWK/Gesetzestext) zu prüfen.**

---

## 9. Konsistenzprüfung gegen `docs/01_grundlage_ges_faktencheck.md`

| Wert im Grundlagen-Dokument | Meine Funde | Bewertung |
|---|---|---|
| PV Freifläche **600–1.000 €/kW** | 600–1.000 €/kW (Markt); IRENA global ≈ 636 €/kW; durch BNetzA-Zuschläge 3,99–5,10 ct/kWh gestützt | ✅ **konsistent und gut belegt** |
| PV LCOE unten **50 €/MWh** | BNetzA Ø 49,4 €/MWh (März 2026); Fraunhofer ISE 41–69 €/MWh | ✅ **konsistent, sogar präziser belegbar** |
| Solar-PPA Q4/2025 **~50 €/MWh** | Europ. Pexapark-Index 42,70 €/MWh (Feb. 2026); DE-Solar-PPA langfristig 55–65 €/MWh | ⚠️ **teilweise abweichend** — Größenordnung stimmt, aber die deutsche solarspezifische Langfrist-PPA liegt eher bei 55–65 €/MWh. Der Index-Wert ist ein europäisches Mischprodukt und nicht direkt vergleichbar. |
| Wind onshore **1.600–1.900 €/kW** | WindGuard 2025: 1.240 + 550 ≈ **1.790 €/kW**; Fraunhofer 1.300–1.900 €/kW | ✅ **konsistent, durch neuere WindGuard-Ausgabe (Stand 2025) bestätigt** |
| Wind onshore LCOE **83–99 €/MWh** | Eigene Rechnung bei 2.400 VLh: **~66 €/MWh**; BNetzA Mai 2026: **50,6 €/MWh** | ❌ **abweichend — zu hoch.** Ursache ist nicht die CAPEX, sondern die Volllaststunden-Annahme (1.700 h = Bestandsflotte statt 2.400 h = Neuanlagen) |
| Befund „Wind: keine systematische Verzerrung" | CAPEX ja, Volllaststunden nein | ⚠️ **zu milde** — sollte um den VLh-Punkt ergänzt werden (s. Abschnitt 4) |
| Wind offshore **3.000–4.500 €/kW** | IRENA global ≈ 2.620 €/kW; DE-Branchenangaben 2.200–3.400 €/kW; Lazard-LCOE deutet nach oben | ⚠️ **Untergrenze vermutlich zu hoch**; Obergrenze plausibel. Empfehlung: 2.600–4.500 €/kW |
| Quelle „Branchendaten (WAB/BWE)" für Offshore | Keine WAB-/BWE-Publikation mit diesen Werten auffindbar | ❌ **nicht verifiziert** — Quelle konkretisieren oder durch IRENA/Fraunhofer ersetzen |
| Quelle „Logic Energy, PV-Marktbericht 2026" | Website existiert (`logicenergy.de`), Wert „ab 600 €/kWp" auffindbar | ⚠️ **Quelle existiert, ist aber ein kommerzieller Anbieter-Blog, keine institutionelle Erhebung.** Inhaltlich durch BNetzA/Fraunhofer gestützt — die Zahl ist richtig, die Quellenangabe ist schwach. Empfehlung: durch Fraunhofer ISE + BNetzA ersetzen. |
| Quelle „Deutsche WindGuard / BMWK-Bericht 2024" | Existiert; **neuere Ausgabe „Stand 2025" (Okt. 2025) verfügbar** | ✅ **verifiziert** — bitte auf die 2025er-Ausgabe aktualisieren |
| To-Do „Fraunhofer ISE (Juli 2024) einarbeiten" | Juli 2024 ist weiterhin die **aktuellste auffindbare Ausgabe**; keine 2025/2026-Neuauflage gefunden | ✅ **bestätigt** — 2024 ist korrekt und aktuell |
| GES-Annahme PV **940 VLh** | 850–1.150 kWh/kWp DE; Freifläche eher 1.000–1.100 | ⚠️ **leicht konservativ**, aber im plausiblen Bereich. Verstärkt den PV-Kosten-Bias zusätzlich um ~10 % |
| GES-Annahme Offshore **3.500 VLh** | Gute Nordsee-Standorte 4.000–4.500 h; mit Abschattung 2.700–3.300 h | ✅ **plausibler Mittelwert** |
| GES-Annahme Batteriespeicher: **keine modelliert** | Batteriespeicher-Zubau DE boomt (>15 GWh kumuliert 2026, >2 Mrd. €/a) | ⚠️ **relevante Modell-Lücke der GES-Studie** — sollte im White Paper benannt werden, da Batterien einen Teil der H2-Rückverstromung substituieren |

### Zusätzliche, im Grundlagen-Dokument noch nicht erfasste Punkte

1. **Gaskraftwerks-CAPEX-Explosion** (Abschnitt 8) — betrifft alle Szenarien, nicht
   nur die EE-Szenarien. Sollte als eigener Bias-Check ergänzt werden.
2. **Volllaststunden Wind onshore** (Abschnitt 4) — größter einzelner
   Korrektur-Hebel bei Wind.
3. **Batteriespeicher-Kostentrendumkehr** (Lazard: +27 % seit 2020) — widerlegt die
   Annahme automatisch fallender Speicherkosten in beide Richtungen der Debatte.
4. **Saisonale H2-Speicherung trifft strukturell das teure Ende der EWI-Spanne**
   (Abschnitt 7.2), weil geringe Zyklenzahl = hohe spezifische Kosten. Das stützt
   teilweise die Kernthese der GES-Studie und gehört aus Neutralitätsgründen
   ausdrücklich ins White Paper.

---

## 9b. Eigene Nachrechnung — Selbstkonsistenz-Check

Mit der Formel und dem WACC des Grundlagen-Dokuments (r = 5 %), angewandt auf die
in diesem Bericht empfohlenen Parameter. Zweck: zu prüfen, ob die empfohlenen
CAPEX/VLh/Lebensdauer-Kombinationen LCOE-Werte ergeben, die zu den unabhängig
erhobenen Referenzwerten (Fraunhofer, IRENA, BNetzA) passen.

| Technologie | Parameter | LCOE (eigene Rechnung) | Referenzspanne | Passt? |
|---|---|---|---|---|
| PV Freifläche | 600 €/kW, 1.050 h, 1,5 %, 30 a | **45,7 €/MWh** | Fraunhofer 41–69; BNetzA 39,9–51,0 | ✅ |
| PV Freifläche | 750 €/kW, 1.030 h, 1,5 %, 30 a | **58,3 €/MWh** | Fraunhofer 41–69 | ✅ |
| PV Freifläche | 1.000 €/kW, 950 h, 1,5 %, 30 a | **84,3 €/MWh** | oberhalb Fraunhofer-Max (69) | ⚠️ Obergrenze etwas hoch |
| Wind onshore | 1.790 €/kW, 1.700 h, 2 %, 27 a | **93,0 €/MWh** | GES-Studie: 91 | ✅ (reproduziert GES) |
| Wind onshore | 1.790 €/kW, 2.400 h, 2 %, 27 a | **65,9 €/MWh** | Fraunhofer 43–92; BNetzA 50,6 | ✅ |
| Wind offshore | 2.600 €/kW, 4.500 h, 3 %, 27 a | **56,8 €/MWh** | Fraunhofer 55–103 | ✅ |
| Wind offshore | 3.400 €/kW, 3.800 h, 3 %, 27 a | **87,9 €/MWh** | Fraunhofer 55–103; IRENA EU 74 | ✅ |
| Wind offshore | 4.500 €/kW, 3.000 h, 3 %, 27 a | **147,4 €/MWh** | oberhalb Fraunhofer-Max; nahe Lazard-Max (154) | ⚠️ nur Worst-Case-Kombination |

**Lesart:** Die Kombination aus *maximalem* CAPEX und *minimalen* Volllaststunden
ergibt naturgemäß Extremwerte, die keine typische Projektkonstellation abbilden.
Für das Simulationsmodell heißt das: **min/max-Werte nicht mechanisch koppeln.**
CAPEX-Obergrenze tritt in der Regel gemeinsam mit *guten* Standortbedingungen auf
(teure Küstenferne/Wassertiefe ↔ hohe Windhöffigkeit), nicht mit schlechten.
Eine korrelierte statt einer unabhängigen Sampling-Logik ist vorzuziehen; andernfalls
sollte die Spanne im Chart als „Extremkombination" gekennzeichnet werden.

Die Rechnung reproduziert außerdem den GES-Studienwert für Wind onshore (91 €/MWh)
mit 93,0 €/MWh nahezu exakt — das bestätigt, dass die hier verwendete Methodik mit
der der Studie übereinstimmt und der Unterschied allein aus den
Volllaststunden-Annahmen stammt, nicht aus der Rechenmethode.

---

## 10. Quellenverzeichnis

Alle Zugriffe: **15.08.2026**. Volltext-Abruf war für alle mit ⚠️ markierten Domains
durch den Netzwerk-Egress blockiert; die Zahlen stammen aus Suchindex-Zusammenfassungen.

| # | Titel | Herausgeber | Datum | URL | Konf. |
|---|---|---|---|---|---|
| 1 | Stromgestehungskosten Erneuerbare Energien | Fraunhofer ISE | Juli 2024 | ⚠️ https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/DE2024_ISE_Studie_Stromgestehungskosten_Erneuerbare_Energien.pdf | A |
| 2 | Photovoltaik mit Batteriespeicher günstiger als konventionelle Kraftwerke (PI zur Studie) | Fraunhofer ISE | 06.08.2024 | ⚠️ https://www.ise.fraunhofer.de/content/dam/ise/de/documents/presseinformationen/2024/2024_ISE_d_PI_Photovoltaik-mit-Batteriespeicher-guenstiger-als-konventionelle-Kraftwerke%20.pdf | A |
| 3 | Kurzanalyse Stromgestehungskosten und Volllaststunden flexibler Kraftwerke | Fraunhofer ISE (Kost, Sepúlveda Schweiger, Thomsen) | o. D. (2024/25) | ⚠️ https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/Kurzanalyse_flexibleKraftwerke.pdf | A |
| 4 | Levelized Cost of Energy+ (LCOE+), Version 19.0 | Lazard | 13.07.2026 | ⚠️ https://www.lazard.com/media/sdvdrvc5/lazards-lcoeplus_vf.pdf | A |
| 5 | Lazard Releases 2026 Levelized Cost of Energy+ Report (PM) | Lazard | 13.07.2026 | ⚠️ https://www.lazard.com/news-announcements/lazard-releases-2026-levelized-cost-of-energyplus-report-pr/ | A |
| 6 | Renewables remain cheapest, but their LCOE is rising | Utility Dive | Juli 2026 | ⚠️ https://www.utilitydive.com/news/renewables-remain-cheapest-lcoe-rising-lazard/825443/ | A |
| 7 | Battery storage costs up 27% since 2020, says Lazard | ESS News | 13.07.2026 | ⚠️ https://www.ess-news.com/2026/07/13/battery-storage-costs-up-27-since-2020-says-lazard/ | A |
| 8 | Renewable Power Generation Costs in 2024 | IRENA | Juli 2025 | ⚠️ https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2025/Jul/IRENA_TEC_RPGC_in_2024_Summary_2025.pdf | A |
| 9 | Global average solar LCOE stood at $0.043/kWh in 2024, says IRENA | pv magazine Global | 23.07.2025 | https://www.pv-magazine.com/2025/07/23/global-average-solar-lcoe-stood-at-0-043-kwh-in-2024-says-irena/ | A |
| 10 | Kostensituation der Windenergie an Land — Stand 2025 | Deutsche WindGuard (i. A. BMWK) | Okt. 2025 | ⚠️ https://www.windguard.de/veroeffentlichungen.html?file=files%2Fcto_layout%2Fimg%2Funternehmen%2Fveroeffentlichungen%2F2025%2FKostensituation+der+Windenergie+an+Land+%E2%80%93+Stand+2025.pdf | A |
| 11 | Volllaststunden von Windenergieanlagen an Land | Deutsche WindGuard | 2026 | ⚠️ https://www.windguard.de/veroeffentlichungen.html?file=files%2Fcto_layout%2Fimg%2Funternehmen%2Fveroeffentlichungen%2F2026%2FVolllaststunden+von+Windenergieanlagen+an+Land.pdf | B |
| 12 | Hohes Wettbewerbsniveau bei der Ausschreibung für Wind an Land (Mai 2026) | Bundesnetzagentur | Juni 2026 | ⚠️ https://www.bundesnetzagentur.de/1110006 | A |
| 13 | Überzeichnung bei der Ausschreibung für Wind an Land (Februar 2026) | Bundesnetzagentur | 31.03.2026 | ⚠️ https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2026/20260331_EE_AusschreibungWind.html | A |
| 14 | Deutliche Überzeichnung der Ausschreibung für PV-Freiflächenanlagen, Gebotstermin 1. März 2026 | Bundesnetzagentur | 2026 | ⚠️ https://bundesnetzagentur.de/1105972 | A |
| 15 | Solar Freifläche, Gebotstermin 1. März 2026 (Ergebnisse) | Bundesnetzagentur | 2026 | ⚠️ https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Ausschreibungen/Solaranlagen1/BeendeteAusschreibungen/2026/01032026/start.html | A |
| 16 | Festlegung der Höchstwerte 2026 für Wind an Land und Solar-Dachanlagen | Bundesnetzagentur | 16.12.2025 | ⚠️ https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20251216_Hoechstwerte.html | A |
| 17 | Windenergieanlagen an Land: Ausschreibung im Mai 2026 erneut überzeichnet | BDEW | Mai/Juni 2026 | https://www.bdew.de/energie/ausschreibung-windenergieanlagen-an-land-mai-2026/ | A |
| 18 | Ausschreibungsergebnisse 2025 (Offshore) | Stiftung Offshore-Windenergie | 2025 | https://www.offshore-stiftung.de/de/Pressemitteilung-Ausschreibungsergebnisse-2025 | B |
| 19 | TotalEnergies ersteigert Offshore-Windfläche N-9.4, zahlt 180 Mio. € | IWR | Juni 2025 | https://www.iwr.de/news/einnahmen-statt-eeg-ausgaben-total-energies-ersteigert-offshore-windflaeche-in-der-nordsee-und-zahlt-180-mio-euro-an-den-deutschen-staat-news39194 | B |
| 20 | Status des Offshore-Windenergieausbaus in Deutschland, Jahr 2025 | Deutsche WindGuard i. A. BWE/VDMA u. a. | Jan. 2026 | https://www.wind-energie.de/fileadmin/redaktion/dokumente/pressemitteilungen/2026/Status_des_Offshore-Windenergieausbaus_Jahr_2025.pdf | B |
| 21 | Abschattungseffekte und Offshore-Ausbau (Volllaststunden Nordsee) | Fraunhofer IWES i. A. BWO | 13.02.2025 | https://bwo-offshorewind.de/wp-content/uploads/2025/02/20250213_FraunhoferIWES_OffshoreAusbau_final.pdf | B |
| 22 | Lithium-Ion Battery Pack Prices Fall to $108/kWh | BloombergNEF | 09.12.2025 | https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/ | A |
| 23 | BNEF: Li-ion battery pack prices fall to $108/kWh, stationary storage becomes lowest price segment | ESS News | 09.12.2025 | https://www.ess-news.com/2025/12/09/bnef-lithium-ion-battery-pack-prices-fall-to-108-kwh-stationary-storage-becomes-lowest-price-segment/ | A |
| 24 | Cost Projections for Utility-Scale Battery Storage: 2025 Update | NREL | 2025 | ⚠️ https://docs.nrel.gov/docs/fy25osti/93281.pdf | B |
| 25 | How cheap is battery storage? | Ember Energy | 2025/26 | https://ember-energy.org/latest-insights/how-cheap-is-battery-storage/ | B |
| 26 | Speicherzubau im ersten Halbjahr 2026 in Deutschland auf Rekordkurs | IWR | 2026 | https://www.iwr.de/news/speicherzubau-im-ersten-halbjahr-2026-in-deutschland-auf-rekordkurs-news39878 | B |
| 27 | Deutschlands größter Batteriespeicher mit 716 MWh entsteht in Förderstedt | IWR | 2026 | https://www.iwr.de/news/speichermarkt-boomt-deutschlands-groesster-batteriespeicher-mit-716-mwh-entsteht-in-foerderstedt-news39637 | B |
| 28 | Rekordzubau bei Batteriespeichern | Bundesverband Solarwirtschaft | 03.05.2026 | https://www.solarwirtschaft.de/2026/05/03/rekordzubau-bei-batteriespeichern/ | B |
| 29 | European electrolyser costs fall in 2025 as manufacturing capacity expands | Global Hydrogen Hub | 2025 | https://globalhydrogenhub.com/european-electrolyser-costs-fall-in-2025-as-manufacturing-capacity-expands.html | B |
| 30 | Wasserstoffspeicherung in Salzkavernen kostet 0,66 bis 1,77 Euro pro Kilogramm (EWI-Analyse) | pv magazine Deutschland | 06.03.2024 | ⚠️ https://www.pv-magazine.de/2024/03/06/wasserstoffspeicherung-in-salzkavernen-kostet-066-bis-177-euro-pro-kilogramm/ | A |
| 31 | Ab 0,66 Euro pro Kilo: EWI analysiert Kosten für H2-Speicherung | H2-news.de | 2024 | https://h2-news.de/forschung/ab-066-euro-pro-kilogramm-ewi-analysiert-kosten-fuer-h2-speicherung/ | A |
| 32 | Policy Briefing: H2-Ready-Gaskraftwerke | Reiner Lemoine Institut | Sept. 2024 | https://reiner-lemoine-institut.de/wp-content/uploads/2024/09/RLI-Studie-H2-ready_DE.pdf | B |
| 33 | Kraftwerkssicherheitsgesetz — Neue Ausschreibungen für wasserstofffähige Gaskraftwerke | BMWK | o. D. | https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Downloads/Energie/kraftwerkssicherheitsgesetz-wasserstofffaehige-gaskraftwerke.pdf | B |
| 34 | 20 GW Gaskraftwerke bis 2030 — Was kostet die Erweiterung? | FÖS i. A. BUND | April 2025 | ⚠️ https://foes.de/publikationen/2025/2025-04_FOES_BUND_Kraftwerkskosten.pdf | B |
| 35 | Studie: Neue Gaskraftwerke kosten bis zu 67 Cent je Kilowattstunde | Green Planet Energy (FÖS-Studie) | 2025 | https://green-planet-energy.de/presse/artikel/studie-neue-gaskraftwerke-kosten-bis-zu-67-cent-je-kilowattstunde | B |
| 36 | The New Reality of Power Generation: An Analysis of Increasing Gas Turbine Costs | GridLab | Sept. 2025 | ⚠️ https://gridlab.org/wp-content/uploads/2025/09/GridLab_Gas-Turbine-Costs-Report-1.pdf | B |
| 37 | Gas turbine prices climb 195% as supply crunch reshapes power development | Power Engineering | 2026 | https://www.power-eng.com/gas/turbines/gas-turbine-prices-climb-195-as-supply-crunch-reshapes-power-development/ | B |
| 38 | Gaskraftwerke: Ausbau, Kosten und Umweltauswirkungen | BUND | o. D. | https://www.bund.net/energiewende/erdgas/gaskraftwerke-in-deutschland/ | C |
| 39 | Pexapark registers 30 European PPAs for 2.2 GW in February | pv magazine International | 17.03.2026 | https://www.pv-magazine.com/2026/03/17/pexapark-registers-30-european-ppas-for-2-2-gw-in-february/ | B |
| 40 | PPA-Marktanalyse 2025 | dena | 2026 | ⚠️ https://www.dena.de/fileadmin/dena/Publikationen/PDFs/2026/PPA_Marktanalyse_2025.pdf | B |
| 41 | Photovoltaik Zubau Deutschland / PV-Freiflächenanlagen | Logic Energy (kommerziell) | 2026 | https://www.logicenergy.de/neuigkeiten/photovoltaik-zubau-deutschland | C |
| 42 | Aktuelle Fakten zur Photovoltaik in Deutschland | Fraunhofer ISE (H. Wirth) | Stand 05.05.2026 | ⚠️ https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/aktuelle-fakten-zur-photovoltaik-in-deutschland.pdf | B |

### Nicht verifizierbare / zu ersetzende Quellen aus dem Grundlagen-Dokument

| Quellenangabe | Status |
|---|---|
| „Branchendaten (WAB/BWE)" für Offshore 3.000–4.500 €/kW | **nicht verifiziert** — keine passende Publikation auffindbar |
| „Logic Energy, PV-Marktbericht 2026" | Website existiert, aber **kommerzieller Anbieter-Blog**; kein „Marktbericht 2026" als eigenständige Publikation auffindbar. Zahl inhaltlich korrekt, Quellenangabe schwach. |
| „pv magazine, zitiert nach Logic Energy 2026" (Solar-PPA 50 €/MWh Q4/2025) | **Zitatkette nicht auflösbar** — der pv-magazine-Originalartikel konnte nicht identifiziert werden. Größenordnung durch Pexapark-Daten plausibel. |

---

## 11. Datenlücken und Unsicherheiten (explizit)

### Harte Lücken

1. **Kein Volltext-Zugriff auf die Primärquellen** (siehe Abschnitt 0). Das ist die
   größte Einschränkung dieser Recherche. Alle A-Werte sollten vor Veröffentlichung
   am Original nachgeprüft werden.
2. **Keine institutionelle deutsche Erhebung zu Großbatteriespeicher-Systemkosten.**
   Es existiert kein „WindGuard für Speicher". Die €/kWh-Werte stammen aus
   Marktberichten und internationalen Quellen.
3. **Keine projektspezifischen Offshore-CAPEX in €/kW** für die aktuellen deutschen
   Parks (He Dreiht, Borkum Riffgrund 3). Betreiber veröffentlichen nur
   Gesamtinvestitionen über Portfolios.
4. **Elektrolyseur-Volllaststunden** sind reine Modellannahme, nicht empirisch
   belegt — sie hängen vollständig vom Betriebsmodell ab (netzgekoppelt vs.
   EE-gekoppelt vs. überschussgetrieben).
5. **Kein einheitliches Preisbasisjahr.** Werte mischen 2024, 2025 und 2026 nominal.
   Bei ~2–3 % Inflation p. a. sind das bis zu 6 % Verzerrung zwischen den ältesten
   und neuesten Werten.
6. **Wechselkurs USD/EUR nicht stichtagsgenau.** Alle „≈"-Werte tragen ±8 %
   Wechselkurs-Unsicherheit zusätzlich zur Sachunsicherheit.
7. **Netzanschluss- und Netzausbaukosten** sind in keinem der hier genannten
   CAPEX-Werte einheitlich enthalten. Bei Offshore teilweise ja, bei Onshore als
   Nebenkostenanteil (24 % der Nebenkosten laut WindGuard), bei PV Freifläche
   uneinheitlich. **Für das Systemmodell ist das separat zu behandeln.**

### Weiche Unsicherheiten / Interpretationsfragen

8. **Ausschreibungswerte ≠ LCOE.** Zuschlagswerte enthalten Risikoprämien,
   Erlöserwartungen aus dem Zeitraum nach der 20-jährigen Förderung, und beziehen
   sich auf einen Referenzstandort (100-%-Standort). Sie sind ein starker
   Plausibilitäts-Anker, aber keine direkte Substitution.
9. **Volllaststunden Wind onshore:** Ob die GES-Studie 1.700 h als
   Neuanlagen- oder als Flottenwert 2045 meint, ist ohne Volltext nicht
   entscheidbar (s. Abschnitt 4).
10. **Batteriekosten-Trend:** Lazard (+27 % seit 2020, System) und BNEF (Rekordtief,
    Pack) scheinen sich zu widersprechen. Sie tun es nicht — sie messen verschiedene
    Dinge. Das muss im White Paper sauber erklärt werden, sonst entsteht ein
    scheinbarer Quellenkonflikt.
11. **H2-Round-Trip:** Die Spanne 30–40 % vs. Reverions 75 % ist keine
    Messunsicherheit, sondern ein Technologiesprung-Versprechen. Basisannahme:
    30–40 %. Optimistisches Szenario: bis 50 %. 75 % nur als Ausblick.
12. **Gaskraftwerks-CAPEX:** Die Übertragbarkeit US-amerikanischer
    Turbinen-/EPC-Preise auf Deutschland ist **nicht gesichert** (andere
    Lohnkosten, Genehmigungsverfahren, Netzanschluss). Der deutsche Datenpunkt
    („0,5 GW > 1 Mrd. €") stützt die Größenordnung, ist aber eine einzelne
    journalistische Angabe.

### Empfohlene Nacharbeiten

- [ ] Fraunhofer ISE 2024, Tabellen der CAPEX-Annahmen je Technologie im Volltext
      erfassen (ersetzt die C-Werte bei PV Dach und OPEX-Konventionen)
- [ ] Lazard LCOE+ v19.0 (Juli 2026) Volltext: CAPEX-Bandbreiten je Technologie
- [ ] Deutsche WindGuard „Stand 2025" Volltext: Betriebskosten in ct/kWh und
      Nutzungsdauer-Annahme
- [ ] Deutsche WindGuard „Volllaststunden von Windenergieanlagen an Land" (2026):
      belastbarer Neuanlagen-VLh-Wert statt der hier genutzten Sekundärangabe
- [ ] EWI-Originalstudie zu H2-Kavernenspeichern (statt pv-magazine-Referat)
- [ ] Aktueller Gesetzesstand Kraftwerkssicherheitsgesetz / Kraftwerksstrategie
- [ ] Einheitliches Preisbasisjahr festlegen (Vorschlag: real 2026) und alle Werte
      deflationieren
- [ ] Wechselkurs-Stichtag dokumentieren und Sensitivität testen

---

## 12. Maschinenlesbarer Datenblock

```json
{
  "meta": {
    "title": "Kostenparameter EE, Speicher und Backup für DE/EU",
    "created": "2026-08-15",
    "access_date": "2026-08-15",
    "scope": "Deutschland / EU",
    "currency": "EUR",
    "price_basis": "nominal, gemischte Erhebungsjahre 2024-2026, nicht auf ein Basisjahr deflationiert",
    "fx_assumption": {"eur_per_usd": 0.92, "note": "nicht stichtagsgenau verifiziert, +/-8% Unsicherheit auf alle umgerechneten Werte"},
    "methodology": {
      "wacc": 0.05,
      "formula": "LCOE = (CAPEX*CRF + CAPEX*opex_pct) / (full_load_hours/1000) + fuel_cost",
      "crf_formula": "r*(1+r)^n / ((1+r)^n - 1)"
    },
    "confidence_scale": {
      "A": "mehrfach bestaetigt, institutionelle Primaerquelle",
      "B": "einzelner Treffer, institutionelle Primaerquelle",
      "C": "Branchen-/Markt-/Anbieterquelle, Marktindikation",
      "unverified": "Quelle oder Wert nicht auffindbar/bestaetigt"
    },
    "limitation": "Volltext-Abruf (WebFetch) war fuer praktisch alle Primaerquellen-Domains durch den Netzwerk-Egress blockiert. Alle Werte stammen aus Suchindex-Zusammenfassungen der genannten Quellen, nicht aus selbst gelesenem PDF-Volltext. Vor Veroeffentlichung am Original nachpruefen."
  },

  "technologies": {

    "pv_freiflaeche": {
      "label": "Photovoltaik Freifläche",
      "capex_eur_kw": {"min": 600, "mid": 750, "max": 1000, "confidence": "C"},
      "capex_eur_kw_global_irena_2024": {"value": 636, "usd": 691, "confidence": "A"},
      "opex_pct": {"min": 0.010, "mid": 0.015, "max": 0.020, "confidence": "B"},
      "full_load_hours": {"min": 950, "mid": 1030, "max": 1150, "confidence": "B"},
      "lifetime_years": {"min": 25, "mid": 30, "max": 35, "confidence": "B"},
      "lcoe_eur_mwh_reference": {"min": 41, "mid": 55, "max": 69, "source": "fraunhofer-ise-2024", "confidence": "A"},
      "auction_reality_check_eur_mwh": {"min": 39.9, "mid": 49.4, "max": 51.0, "source": "bnetza-pv-2026-03", "note": "Zuschlagswerte, nicht LCOE - eher Obergrenze der Betreiber-Vollkosten ueber 20 Jahre", "confidence": "A"},
      "ppa_eur_mwh_de_longterm": {"min": 55, "mid": 60, "max": 65, "confidence": "C"},
      "lcoe_2045_forecast_eur_mwh": {"min": 31, "max": 50, "source": "fraunhofer-ise-2024", "confidence": "A"},
      "sources": ["fraunhofer-ise-2024", "irena-2024", "bnetza-pv-2026-03", "logic-energy"]
    },

    "pv_dach_gross": {
      "label": "Photovoltaik Dach, Gewerbe/Großdach (modellrelevantes Segment)",
      "capex_eur_kw": {"min": 630, "mid": 850, "max": 1100, "confidence": "C"},
      "opex_pct": {"min": 0.010, "mid": 0.015, "max": 0.020, "confidence": "B"},
      "full_load_hours": {"min": 850, "mid": 950, "max": 1100, "confidence": "B"},
      "lifetime_years": {"min": 25, "mid": 30, "max": 30, "confidence": "B"},
      "lcoe_eur_mwh_reference": {"min": 31.2, "max": 110.1, "source": "fraunhofer-ise-2024", "note": "Spanne gilt fuer PV gesamt, alle Anlagentypen", "confidence": "A"},
      "lcoe_2045_forecast_eur_mwh": {"min": 49, "max": 104, "source": "fraunhofer-ise-2024", "confidence": "A"},
      "data_gap": "Kein Ausschreibungs-Realitaetscheck; BNetzA-Aufdach-Ausschreibung 02/2026 war unterzeichnet. CAPEX-Werte aus Vergleichsportalen, nicht institutionell.",
      "sources": ["fraunhofer-ise-2024", "markt-de-2026"]
    },

    "pv_dach_klein": {
      "label": "Photovoltaik Dach, Kleinanlage Wohngebäude (nur zur Abgrenzung)",
      "capex_eur_kw": {"min": 1100, "mid": 1450, "max": 1800, "confidence": "C"},
      "opex_pct": {"min": 0.010, "mid": 0.015, "max": 0.020, "confidence": "C"},
      "full_load_hours": {"min": 850, "mid": 950, "max": 1100, "confidence": "B"},
      "lifetime_years": {"min": 25, "mid": 30, "max": 30, "confidence": "B"},
      "note": "Fuer ein 950-TWh-Systemmodell nicht die relevante Referenz. Nur zur Einordnung gegen Marktkommunikation.",
      "sources": ["markt-de-2026"]
    },

    "wind_onshore": {
      "label": "Wind onshore Deutschland",
      "capex_eur_kw": {"min": 1500, "mid": 1790, "max": 2100, "confidence": "A"},
      "capex_breakdown_windguard_2025": {
        "hauptinvestitionskosten_eur_kw": 1240,
        "investitionsnebenkosten_eur_kw": 550,
        "nebenkosten_anteile": {"planung": 0.30, "netzanbindung": 0.24, "infrastruktur": 0.22, "sonstige": 0.18, "kompensation": 0.06},
        "note": "Nebenkosten ohne Fundament, IBN 2025-2028",
        "confidence": "A"
      },
      "capex_eur_kw_fraunhofer_2024": {"min": 1300, "max": 1900, "confidence": "A"},
      "capex_eur_kw_global_irena_2024": {"value": 958, "usd": 1041, "confidence": "A"},
      "opex_pct": {"min": 0.020, "mid": 0.025, "max": 0.030, "confidence": "B"},
      "full_load_hours": {"min": 2200, "mid": 2400, "max": 3000, "confidence": "B", "note": "NEUANLAGEN, normalisiert. Nicht mit Bestandsflotte verwechseln."},
      "full_load_hours_fleet": {"value_2025": 1608, "mean_since_2015": 1770, "confidence": "A", "note": "Bestandsflotte - NICHT fuer Neubau-LCOE verwenden"},
      "lifetime_years": {"min": 25, "mid": 27, "max": 30, "confidence": "B"},
      "lcoe_eur_mwh_reference": {"min": 43, "mid": 66, "max": 92, "source": "fraunhofer-ise-2024", "confidence": "A"},
      "lcoe_eur_mwh_europe_irena": {"value": 47, "usd": 51, "confidence": "A"},
      "auction_reality_check_eur_mwh": [
        {"date": "2026-02", "min": 51.9, "weighted_avg": 55.4, "max": 56.4, "confidence": "A"},
        {"date": "2026-05", "min": 44.4, "weighted_avg": 50.6, "max": 51.9, "awarded_mw": 2499, "confidence": "A"}
      ],
      "auction_cap_2026_eur_mwh": {"value": 72.5, "source": "bnetza-hoechstwert-2026", "confidence": "A"},
      "ppa_eur_mwh_de": {"min": 70, "mid": 80, "max": 93, "confidence": "C"},
      "sensitivity_flh": [
        {"flh": 1700, "lcoe_eur_mwh": 93.0, "note": "GES-Studienannahme, entspricht Bestandsflotte"},
        {"flh": 2400, "lcoe_eur_mwh": 65.9, "note": "Neuanlagen-Mittel"},
        {"flh": 2600, "lcoe_eur_mwh": 60.8, "note": "gute Standorte"}
      ],
      "sources": ["windguard-2025", "fraunhofer-ise-2024", "irena-2024", "bnetza-wind-2026-02", "bnetza-wind-2026-05"]
    },

    "wind_offshore": {
      "label": "Wind offshore Deutschland / Nordsee",
      "capex_eur_kw": {"min": 2600, "mid": 3400, "max": 4500, "confidence": "B"},
      "capex_eur_kw_global_irena_2024": {"value": 2624, "usd": 2852, "confidence": "A"},
      "capex_eur_kw_branchenangabe_de": {"min": 2200, "max": 3400, "note": "inkl. Netzanbindung", "confidence": "C"},
      "opex_pct": {"min": 0.025, "mid": 0.030, "max": 0.040, "confidence": "B"},
      "full_load_hours": {"min": 3000, "mid": 3800, "max": 4500, "confidence": "B"},
      "full_load_hours_detail": {
        "nordsee_gut": {"min": 4000, "max": 4500, "confidence": "A"},
        "mit_abschattung": {"min": 2700, "max": 3300, "source": "fraunhofer-iwes-bwo-2025", "confidence": "B"}
      },
      "lifetime_years": {"min": 25, "mid": 27, "max": 30, "confidence": "B"},
      "lcoe_eur_mwh_reference": {"min": 55, "mid": 78, "max": 103, "source": "fraunhofer-ise-2024", "confidence": "A"},
      "lcoe_eur_mwh_europe_irena": {"value": 74, "usd": 80, "confidence": "A"},
      "lcoe_eur_mwh_lazard_2026": {"min": 97, "max": 154, "usd_min": 105, "usd_max": 167, "confidence": "A"},
      "auction_reality_check": {
        "available": false,
        "reason": "Deutsche Offshore-Ausschreibungen laufen als Null-Cent-Gebote mit dynamischem Bieterverfahren. Bieter ZAHLEN an den Staat (N-9.4, 2025: TotalEnergies 180 Mio. EUR fuer 1000 MW) statt Verguetung zu erhalten. Kein LCOE-Signal ableitbar; die Zahlungen sind ein zusaetzlicher Kostenaufschlag.",
        "auctions_2026": "auf 2027 verschoben (Flaechenentwicklungsplan-Aenderung 30.01.2026)"
      },
      "data_gap": "Keine projektspezifischen CAPEX in EUR/kW fuer He Dreiht (960 MW, EnBW) oder Borkum Riffgrund 3 (913 MW, Oersted) oeffentlich verfuegbar.",
      "sources": ["fraunhofer-ise-2024", "irena-2024", "lazard-2026", "fraunhofer-iwes-bwo-2025", "offshore-stiftung-2025"]
    },

    "battery_grid_scale": {
      "label": "Batteriespeicher Großspeicher (Utility-Scale, LFP, 4h-Auslegung)",
      "capex_eur_kwh": {"min": 180, "mid": 210, "max": 260, "confidence": "B", "note": "schluesselfertiges 4h-System Europa"},
      "capex_eur_kw": {"min": 720, "mid": 840, "max": 1040, "confidence": "B", "note": "ABGELEITET aus EUR/kWh x 4h. Gilt NUR fuer 4h-Systeme."},
      "duration_hours_assumed": 4,
      "pack_price_eur_kwh_bnef": {
        "stationary_2025": {"value": 64, "usd": 70, "confidence": "A"},
        "all_segments_2025": {"value": 99, "usd": 108, "confidence": "A"},
        "forecast_2026": {"value": 97, "usd": 105, "confidence": "A"},
        "note": "PACK-Preis, NICHT Systempreis. Faktor Pack->System in Europa ca. 2.5-3x."
      },
      "opex_pct": {"min": 0.015, "mid": 0.020, "max": 0.030, "confidence": "C"},
      "efficiency_roundtrip_ac": {"min": 0.85, "mid": 0.88, "max": 0.92, "confidence": "C"},
      "cycles_to_80pct_soh": {"min": 6000, "mid": 8000, "max": 12000, "confidence": "C"},
      "lifetime_years": {"min": 15, "mid": 20, "max": 25, "confidence": "C"},
      "lcos_eur_mwh_lazard_2026": {"min": 193, "max": 269, "usd_min": 210, "usd_max": 292, "config": "100 MW / 4h", "confidence": "A"},
      "cost_trend": {"change_since_2020_pct": 27, "direction": "steigend", "source": "lazard-2026", "confidence": "A", "note": "Trendumkehr - keine automatische Lernkurven-Extrapolation nach unten annehmen"},
      "market_de_2026": {"cumulative_gwh": 15, "annual_investment_bn_eur": 2.0, "realization_rate": [0.60, 0.70], "confidence": "C"},
      "data_gap": "Keine institutionelle deutsche Erhebung zu Grossspeicher-Systemkosten (kein 'WindGuard fuer Speicher'). Wirkungsgrad und Zyklen aus Anbieterquellen.",
      "sources": ["lazard-2026", "bnef-2025-12", "nrel-atb-2025", "markt-eu-2026"]
    },

    "electrolyser": {
      "label": "Elektrolyseur (Alkali / PEM)",
      "capex_eur_kw": {"min": 1200, "mid": 2100, "max": 2600, "confidence": "B"},
      "capex_eur_kw_eu_2025": {"alkaline": 2075, "pem": 2196, "source": "global-hydrogen-hub-2025", "confidence": "B", "note": "beide zweistellig gefallen ggue. 2024"},
      "opex_pct": {"min": 0.020, "mid": 0.030, "max": 0.040, "confidence": "C"},
      "efficiency_lhv": {"min": 0.60, "mid": 0.66, "max": 0.70, "confidence": "B"},
      "efficiency_soec": {"max": 0.84, "confidence": "C"},
      "specific_consumption_kwh_per_kg": {"min": 45, "mid": 48, "max": 50, "confidence": "B"},
      "stack_lifetime_hours": {"min": 30000, "mid": 60000, "max": 90000, "confidence": "C"},
      "lifetime_years": {"min": 20, "mid": 22, "max": 25, "confidence": "C"},
      "full_load_hours": {"min": 3000, "mid": 4000, "max": 6000, "confidence": "unverified", "note": "reine Modellannahme, betriebsmodellabhaengig"},
      "eu_manufacturing_capacity_gw_a": 13.1,
      "finding": "EU-Ist-CAPEX ~2100 EUR/kW liegen deutlich ueber den in vielen Energiesystemmodellen unterstellten 800-1500 EUR/kW.",
      "sources": ["global-hydrogen-hub-2025"]
    },

    "h2_cavern_storage": {
      "label": "Wasserstoff-Kavernenspeicher (Salzkaverne)",
      "storage_cost_eur_per_kg": {"min": 0.66, "mid": 1.20, "max": 1.75, "source": "ewi", "confidence": "A"},
      "storage_cost_ct_per_kwh_h2": {"min": 1.98, "mid": 3.60, "max": 5.25, "source": "ewi", "confidence": "A"},
      "storage_cost_low_cycling_eur_per_kg": {"value": 3.50, "confidence": "A", "note": "gilt fuer SAISONALE Speicherung - der relevante Fall in 100%-EE-Szenarien"},
      "storage_cost_high_cycling_eur_per_kg": {"value": 0.45, "confidence": "A"},
      "cavern_capacity_gwh": {"min": 35, "max": 140, "confidence": "A"},
      "de_repurposing_potential_twh": 30,
      "de_demand_2030_twh": 3,
      "de_demand_2045_twh": 100,
      "key_finding": "Hauptkostentreiber ist die Zyklenzahl (Faktor ~7.8 zwischen hoher und niedriger Auslastung). Saisonale Speicherung = niedrige Zyklenzahl = teures Ende der Spanne.",
      "sources": ["ewi-h2-speicher"]
    },

    "h2_rueckverstromung": {
      "label": "Wasserstoff-Rückverstromung (H2-Kraftwerk)",
      "capex_eur_kw": {"min": 800, "mid": 1400, "max": 2200, "confidence": "C"},
      "efficiency_h2_ccgt": {"min": 0.55, "mid": 0.58, "max": 0.62, "confidence": "B"},
      "efficiency_h2_ocgt": {"min": 0.38, "mid": 0.40, "max": 0.42, "confidence": "B"},
      "roundtrip_efficiency_p2g2p": {"min": 0.30, "mid": 0.34, "max": 0.40, "confidence": "B", "note": "ohne Waermenutzung, Strom->H2->Strom"},
      "roundtrip_efficiency_reversible_sofc": {"value": 0.75, "confidence": "C", "note": "Herstellerangabe Reverion, nicht im GW-Massstab demonstriert - nur als Ausblick verwenden"},
      "energy_input_ratio": {"min": 2.5, "max": 3.3, "unit": "kWh_EE je kWh rueckverstromt", "note": "Physikalische Ursache der Ueberkapazitaet in 100%-EE-Szenarien"},
      "h2_ready_surcharge_pct": {"ccgt": 0.10, "note": "<10% der Erstinvestition fuer groessere GuD; Gasturbinen deutlich hoeher; Gasmotoren bis +20 Prozentpunkte", "source": "rli-2024", "confidence": "B"},
      "lcoe_eur_mwh_new_h2_plant": {"min": 401, "max": 605, "source": "fraunhofer-ise-flexkraftwerke", "confidence": "A"},
      "lcoe_eur_mwh_gas_retrofit_2035": {"min": 143, "max": 325, "flh_range": [500, 3000], "source": "fraunhofer-ise-flexkraftwerke", "confidence": "A"},
      "sources": ["fraunhofer-ise-flexkraftwerke", "rli-2024", "energie-lexikon"]
    },

    "ccgt_gas": {
      "label": "Gaskraftwerk GuD (Combined Cycle)",
      "capex_eur_kw": {"min": 1000, "mid": 1600, "max": 2200, "confidence": "B"},
      "capex_eur_kw_legacy_reference": {"value": 800, "confidence": "C", "status": "VERALTET - Erhebung <=2020, fuer 2026 nicht mehr haltbar"},
      "capex_eur_kw_de_datapoint": {"value": 2000, "note": "'0.5 GW GuD kostet ueber 1 Mrd. EUR', Berichterstattung 2026", "confidence": "B"},
      "capex_usd_kw_us_projects_2026_27": {"min": 1116, "max": 1427, "source": "gridlab-2025", "confidence": "B"},
      "capex_usd_kw_us_recent": {"value": 2000, "note": "aktuelle Projektmeldungen", "confidence": "B"},
      "turbine_price_increase_pct": 195,
      "opex_pct": {"min": 0.025, "mid": 0.030, "max": 0.040, "confidence": "C"},
      "efficiency": {"min": 0.58, "mid": 0.60, "max": 0.64, "confidence": "A"},
      "lifetime_years": {"min": 25, "mid": 30, "max": 35, "confidence": "C"},
      "full_load_hours_backup": {"min": 500, "mid": 1500, "max": 3000, "confidence": "A", "note": "Analyserahmen Fraunhofer ISE fuer flexible Kraftwerke"},
      "lcoe_eur_mwh_de_new": {"min": 230, "max": 280, "source": "foes-2025", "note": "reine Erzeugungskosten je nach CO2-Preis", "confidence": "B"},
      "lcoe_eur_mwh_incl_external": {"max": 670, "source": "foes-2025", "confidence": "B"},
      "lcoe_eur_mwh_gas_crisis_price": {"min": 480, "max": 530, "source": "foes-2025", "note": "bei Gaspreisniveau 2022", "confidence": "B"},
      "key_finding": "Der Standardwert 800 EUR/kW ist fuer 2026 um Faktor 2-2.5 zu niedrig. Betrifft ALLE Szenarien mit Gas-Backup, auch das GES-'Kostenminimum'-Szenario.",
      "sources": ["gridlab-2025", "power-eng-2026", "foes-2025", "fraunhofer-ise-flexkraftwerke"]
    },

    "ocgt_gas": {
      "label": "Gaskraftwerk offene Gasturbine (OCGT, Peaker)",
      "capex_eur_kw": {"min": 500, "mid": 750, "max": 1100, "confidence": "C"},
      "capex_eur_kw_legacy_reference": {"value": 400, "confidence": "C", "status": "VERALTET - Erhebung <=2020"},
      "turbine_only_price_forecast_eur_kw_2027": {"value": 552, "usd": 600, "confidence": "B"},
      "opex_pct": {"min": 0.025, "mid": 0.030, "max": 0.040, "confidence": "C"},
      "efficiency": {"min": 0.35, "mid": 0.40, "max": 0.42, "confidence": "B"},
      "lifetime_years": {"min": 25, "mid": 30, "max": 35, "confidence": "C"},
      "full_load_hours_backup": {"min": 200, "mid": 800, "max": 2000, "confidence": "C"},
      "sources": ["power-eng-2026", "gridlab-2025"]
    }
  },

  "regulatory_context": {
    "kraftwerkssicherheitsgesetz": {
      "total_tendered_gw": 12.5,
      "long_duration_storage_mw": 500,
      "capex_support_eur_kw_consultation": 660,
      "opex_support_full_load_hours": 800,
      "first_auction_year": 2026,
      "further_auctions": [2027, "2029/2030"],
      "first_plants_operational": 2031,
      "h2_switch_year_after_commissioning": 8,
      "levy_start": 2031,
      "estimated_support_bn_eur": {"2031": [1, 3], "2032_2045_annual": [0.9, 2.3]},
      "caveat": "Kapazitaetsangaben variieren zwischen Eckpunktepapieren (12 vs 12.5 GW, unterschiedliche Aufteilungen). Vor Veroeffentlichung am Gesetzestext pruefen.",
      "confidence": "B"
    },
    "auction_caps_2026_eur_mwh": {
      "wind_onshore": 72.5,
      "source": "bnetza-hoechstwert-2026",
      "confidence": "A"
    },
    "offshore_auctions": {
      "mechanism": "Null-Cent-Gebote mit dynamischem Bieterverfahren, Zahlung an den Staat",
      "example_2025": {"area": "N-9.4", "capacity_mw": 1000, "winner": "TotalEnergies / North Sea OFW One GmbH", "payment_mn_eur": 180, "date": "2025-06-17"},
      "auctions_2026": "verschoben auf 2027",
      "confidence": "B"
    }
  },

  "consistency_check_vs_grundlagendokument": [
    {"item": "PV Freiflaeche CAPEX 600-1000 EUR/kW", "status": "konsistent", "note": "durch BNetzA-Zuschlaege und IRENA gestuetzt"},
    {"item": "PV LCOE unten 50 EUR/MWh", "status": "konsistent", "note": "BNetzA Maerz 2026 Durchschnitt 49.4 EUR/MWh"},
    {"item": "Solar-PPA ~50 EUR/MWh Q4/2025", "status": "teilweise abweichend", "note": "DE-Solar-Langfrist-PPA eher 55-65 EUR/MWh; europ. Mischindex 42.7 EUR/MWh (Feb 2026). Groessenordnung ok, Zitatkette nicht aufloesbar."},
    {"item": "Wind onshore CAPEX 1600-1900 EUR/kW", "status": "konsistent", "note": "WindGuard Stand 2025: 1240+550 = ~1790 EUR/kW"},
    {"item": "Wind onshore LCOE 83-99 EUR/MWh", "status": "abweichend", "note": "zu hoch. Bei 2400 VLh ~66 EUR/MWh; BNetzA Mai 2026: 50.6 EUR/MWh. Ursache: Volllaststunden, nicht CAPEX."},
    {"item": "Befund 'Wind: keine systematische Verzerrung'", "status": "zu milde", "note": "gilt nur fuer CAPEX. Volllaststunden-Annahme 1700h entspricht Bestandsflotte statt Neuanlagen (2400h)."},
    {"item": "Wind offshore CAPEX 3000-4500 EUR/kW", "status": "untergrenze zu hoch", "note": "IRENA global 2024: ~2620 EUR/kW. Empfehlung 2600-4500."},
    {"item": "Quelle 'Branchendaten (WAB/BWE)'", "status": "nicht verifiziert", "note": "keine passende Publikation auffindbar"},
    {"item": "Quelle 'Logic Energy PV-Marktbericht 2026'", "status": "schwach", "note": "Website existiert, aber kommerzieller Anbieter-Blog, kein eigenstaendiger Marktbericht. Zahl inhaltlich korrekt."},
    {"item": "Quelle 'Deutsche WindGuard / BMWK 2024'", "status": "verifiziert, veraltet", "note": "neuere Ausgabe 'Stand 2025' (Okt 2025) verfuegbar - bitte aktualisieren"},
    {"item": "Fraunhofer ISE Juli 2024 als aktuellste Ausgabe", "status": "bestaetigt", "note": "keine 2025/2026-Neuauflage auffindbar"},
    {"item": "GES-Annahme PV 940 VLh", "status": "leicht konservativ", "note": "DE-Freiflaeche eher 1000-1100 h; verstaerkt PV-Kostenbias um ~10%"},
    {"item": "GES-Annahme Offshore 3500 VLh", "status": "plausibel", "note": "gute Nordsee 4000-4500h, mit Abschattung 2700-3300h"},
    {"item": "GES modelliert keine Batteriespeicher", "status": "relevante Modell-Luecke", "note": "DE-Speicherzubau >15 GWh kumuliert 2026; Batterien substituieren teilweise H2-Rueckverstromung"}
  ],

  "new_findings_not_in_grundlagendokument": [
    {"id": "gas-capex-escalation", "summary": "Gaskraftwerks-CAPEX um Faktor 2-2.5 gestiegen (Turbinenpreise +195%, Slot-Knappheit bis 2030). Betrifft ALLE Szenarien mit Gas-Backup, auch das kernkraftlastige 'Kostenminimum'.", "impact": "hoch"},
    {"id": "wind-flh", "summary": "Volllaststunden-Annahme 1700h (Bestandsflotte) statt 2400h (Neuanlagen) verteuert Windstrom systematisch um ~29%.", "impact": "hoch"},
    {"id": "battery-trend-reversal", "summary": "Lazard 2026: Speicher-Systemkosten +27% seit 2020. Pack-Preise fallen weiter (BNEF), Systemkosten nicht. Kein automatischer Lernkurven-Optimismus.", "impact": "mittel"},
    {"id": "h2-seasonal-storage-expensive-end", "summary": "Saisonale H2-Speicherung trifft strukturell das teure Ende der EWI-Spanne (niedrige Zyklenzahl -> bis 3.50 EUR/kg statt 0.45 EUR/kg). Stuetzt teilweise die GES-Kernthese - aus Neutralitaetsgruenden auszuweisen.", "impact": "mittel"},
    {"id": "electrolyser-capex-gap", "summary": "EU-Ist-CAPEX Elektrolyseure ~2100 EUR/kW vs. 800-1500 EUR/kW in vielen Modellen.", "impact": "mittel"},
    {"id": "offshore-auction-no-signal", "summary": "Deutsche Offshore-Ausschreibungen liefern kein LCOE-Signal (Null-Cent-Gebote); Zahlungen an den Staat sind ein zusaetzlicher Kostenaufschlag, der in keinem LCOE-Vergleich auftaucht.", "impact": "mittel"}
  ],

  "derived_lcoe_selfcheck": {
    "note": "Eigene Nachrechnung mit r=0.05 und der Formel des Grundlagendokuments. Dient der Pruefung, ob empfohlene Parameter zu den unabhaengig erhobenen Referenzwerten passen.",
    "warning": "min/max NICHT mechanisch koppeln. Max-CAPEX tritt real meist mit GUTEN Standortbedingungen auf, nicht mit schlechten. Korrelierte Sampling-Logik verwenden oder Extremkombinationen im Chart kennzeichnen.",
    "cases": [
      {"tech": "pv_freiflaeche", "capex_eur_kw": 600, "flh": 1050, "opex_pct": 0.015, "n": 30, "lcoe_eur_mwh": 45.7, "fits_reference": true},
      {"tech": "pv_freiflaeche", "capex_eur_kw": 750, "flh": 1030, "opex_pct": 0.015, "n": 30, "lcoe_eur_mwh": 58.3, "fits_reference": true},
      {"tech": "pv_freiflaeche", "capex_eur_kw": 1000, "flh": 950, "opex_pct": 0.015, "n": 30, "lcoe_eur_mwh": 84.3, "fits_reference": false, "note": "oberhalb Fraunhofer-Max 69"},
      {"tech": "wind_onshore", "capex_eur_kw": 1790, "flh": 1700, "opex_pct": 0.02, "n": 27, "lcoe_eur_mwh": 93.0, "fits_reference": true, "note": "reproduziert GES-Studienwert 91 EUR/MWh - Methodik stimmt ueberein"},
      {"tech": "wind_onshore", "capex_eur_kw": 1790, "flh": 2400, "opex_pct": 0.02, "n": 27, "lcoe_eur_mwh": 65.9, "fits_reference": true},
      {"tech": "wind_onshore", "capex_eur_kw": 1790, "flh": 2600, "opex_pct": 0.02, "n": 27, "lcoe_eur_mwh": 60.8, "fits_reference": true},
      {"tech": "wind_offshore", "capex_eur_kw": 2600, "flh": 4500, "opex_pct": 0.03, "n": 27, "lcoe_eur_mwh": 56.8, "fits_reference": true},
      {"tech": "wind_offshore", "capex_eur_kw": 3400, "flh": 3800, "opex_pct": 0.03, "n": 27, "lcoe_eur_mwh": 87.9, "fits_reference": true},
      {"tech": "wind_offshore", "capex_eur_kw": 4500, "flh": 3000, "opex_pct": 0.03, "n": 27, "lcoe_eur_mwh": 147.4, "fits_reference": false, "note": "Extremkombination, nahe Lazard-Max 154"}
    ]
  },

  "data_gaps": [
    "Kein Volltext-Zugriff auf Primaerquellen-PDFs (Netzwerk-Egress blockiert) - alle Werte aus Suchindex-Zusammenfassungen",
    "Keine institutionelle deutsche Erhebung zu Grossbatteriespeicher-Systemkosten",
    "Keine projektspezifischen Offshore-CAPEX in EUR/kW fuer aktuelle deutsche Parks",
    "Elektrolyseur-Volllaststunden sind reine Modellannahme ohne empirischen Beleg",
    "Kein einheitliches Preisbasisjahr (2024/2025/2026 nominal gemischt, bis 6% Verzerrung)",
    "Wechselkurs USD/EUR nicht stichtagsgenau (+/-8% auf alle umgerechneten Werte)",
    "Netzanschluss-/Netzausbaukosten uneinheitlich in den CAPEX enthalten - im Systemmodell separat zu behandeln",
    "Uebertragbarkeit US-Gasturbinen-/EPC-Preise auf Deutschland nicht gesichert",
    "Aktueller Gesetzesstand Kraftwerkssicherheitsgesetz uneindeutig (12 vs 12.5 GW)"
  ],

  "sources": [
    {"id": "fraunhofer-ise-2024", "title": "Stromgestehungskosten Erneuerbare Energien", "publisher": "Fraunhofer ISE", "date": "2024-07", "url": "https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/DE2024_ISE_Studie_Stromgestehungskosten_Erneuerbare_Energien.pdf", "accessed": "2026-08-15", "fulltext_verified": false, "note": "aktuellste auffindbare Ausgabe; keine 2025/2026-Neuauflage gefunden"},
    {"id": "fraunhofer-ise-flexkraftwerke", "title": "Kurzanalyse Stromgestehungskosten und Volllaststunden flexibler Kraftwerke", "publisher": "Fraunhofer ISE (Kost, Sepulveda Schweiger, Thomsen)", "date": "2024/2025", "url": "https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/Kurzanalyse_flexibleKraftwerke.pdf", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "lazard-2026", "title": "Levelized Cost of Energy+ (LCOE+), Version 19.0", "publisher": "Lazard", "date": "2026-07-13", "url": "https://www.lazard.com/media/sdvdrvc5/lazards-lcoeplus_vf.pdf", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "irena-2024", "title": "Renewable Power Generation Costs in 2024", "publisher": "IRENA", "date": "2025-07", "url": "https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2025/Jul/IRENA_TEC_RPGC_in_2024_Summary_2025.pdf", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "windguard-2025", "title": "Kostensituation der Windenergie an Land - Stand 2025", "publisher": "Deutsche WindGuard i.A. BMWK", "date": "2025-10", "url": "https://www.windguard.de/veroeffentlichungen.html?file=files%2Fcto_layout%2Fimg%2Funternehmen%2Fveroeffentlichungen%2F2025%2FKostensituation+der+Windenergie+an+Land+%E2%80%93+Stand+2025.pdf", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "windguard-vlh-2026", "title": "Volllaststunden von Windenergieanlagen an Land", "publisher": "Deutsche WindGuard", "date": "2026", "url": "https://www.windguard.de/veroeffentlichungen.html?file=files%2Fcto_layout%2Fimg%2Funternehmen%2Fveroeffentlichungen%2F2026%2FVolllaststunden+von+Windenergieanlagen+an+Land.pdf", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "bnetza-wind-2026-05", "title": "Hohes Wettbewerbsniveau bei der Ausschreibung fuer Wind an Land zum 1. Mai 2026", "publisher": "Bundesnetzagentur", "date": "2026-06", "url": "https://www.bundesnetzagentur.de/1110006", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "bnetza-wind-2026-02", "title": "Ueberzeichnung bei der Ausschreibung fuer Wind an Land zum 1. Februar 2026", "publisher": "Bundesnetzagentur", "date": "2026-03-31", "url": "https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2026/20260331_EE_AusschreibungWind.html", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "bnetza-pv-2026-03", "title": "Ausschreibung Solaranlagen erstes Segment, Gebotstermin 1. Maerz 2026", "publisher": "Bundesnetzagentur", "date": "2026", "url": "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Ausschreibungen/Solaranlagen1/BeendeteAusschreibungen/2026/01032026/start.html", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "bnetza-hoechstwert-2026", "title": "Festlegung der Hoechstwerte 2026 fuer Wind an Land und Solar-Dachanlagen", "publisher": "Bundesnetzagentur", "date": "2025-12-16", "url": "https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20251216_Hoechstwerte.html", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "bnef-2025-12", "title": "Lithium-Ion Battery Pack Prices Fall to $108 Per Kilowatt-Hour", "publisher": "BloombergNEF", "date": "2025-12-09", "url": "https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "nrel-atb-2025", "title": "Cost Projections for Utility-Scale Battery Storage: 2025 Update", "publisher": "NREL", "date": "2025", "url": "https://docs.nrel.gov/docs/fy25osti/93281.pdf", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "global-hydrogen-hub-2025", "title": "European electrolyser costs fall in 2025 as manufacturing capacity expands", "publisher": "Global Hydrogen Hub", "date": "2025", "url": "https://globalhydrogenhub.com/european-electrolyser-costs-fall-in-2025-as-manufacturing-capacity-expands.html", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "ewi-h2-speicher", "title": "Wasserstoffspeicherung in Salzkavernen kostet 0,66 bis 1,77 Euro pro Kilogramm (EWI-Analyse)", "publisher": "EWI / referiert in pv magazine Deutschland", "date": "2024-03-06", "url": "https://www.pv-magazine.de/2024/03/06/wasserstoffspeicherung-in-salzkavernen-kostet-066-bis-177-euro-pro-kilogramm/", "accessed": "2026-08-15", "fulltext_verified": false, "note": "Originalstudie des EWI sollte noch direkt beschafft werden"},
    {"id": "rli-2024", "title": "Policy Briefing: H2-Ready-Gaskraftwerke", "publisher": "Reiner Lemoine Institut", "date": "2024-09", "url": "https://reiner-lemoine-institut.de/wp-content/uploads/2024/09/RLI-Studie-H2-ready_DE.pdf", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "gridlab-2025", "title": "The New Reality of Power Generation: An Analysis of Increasing Gas Turbine Costs", "publisher": "GridLab", "date": "2025-09", "url": "https://gridlab.org/wp-content/uploads/2025/09/GridLab_Gas-Turbine-Costs-Report-1.pdf", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "power-eng-2026", "title": "Gas turbine prices climb 195% as supply crunch reshapes power development", "publisher": "Power Engineering", "date": "2026", "url": "https://www.power-eng.com/gas/turbines/gas-turbine-prices-climb-195-as-supply-crunch-reshapes-power-development/", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "foes-2025", "title": "20 GW Gaskraftwerke bis 2030 - Was kostet die Erweiterung?", "publisher": "FOES i.A. BUND", "date": "2025-04", "url": "https://foes.de/publikationen/2025/2025-04_FOES_BUND_Kraftwerkskosten.pdf", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "fraunhofer-iwes-bwo-2025", "title": "Abschattungseffekte und der Offshore-Ausbau", "publisher": "Fraunhofer IWES i.A. BWO", "date": "2025-02-13", "url": "https://bwo-offshorewind.de/wp-content/uploads/2025/02/20250213_FraunhoferIWES_OffshoreAusbau_final.pdf", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "offshore-stiftung-2025", "title": "Ausschreibungsergebnisse 2025", "publisher": "Stiftung Offshore-Windenergie", "date": "2025", "url": "https://www.offshore-stiftung.de/de/Pressemitteilung-Ausschreibungsergebnisse-2025", "accessed": "2026-08-15", "fulltext_verified": false},
    {"id": "logic-energy", "title": "Photovoltaik Zubau Deutschland / PV-Freiflaechenanlagen", "publisher": "Logic Energy (kommerzieller Anbieter)", "date": "2026", "url": "https://www.logicenergy.de/neuigkeiten/photovoltaik-zubau-deutschland", "accessed": "2026-08-15", "fulltext_verified": false, "quality": "C - Marktindikation, keine institutionelle Erhebung"}
  ]
}
```
