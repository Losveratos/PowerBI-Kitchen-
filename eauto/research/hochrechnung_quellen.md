---
title: "Hochrechnungs-Parameter und Quellen: Flotten-Skalierung E-Auto vs. Verbrenner"
subtitle: "Recherche-Dossier für die Hochrechnungs-Stufe des Monte-Carlo-Modells (Bestand, Neuzulassungen, CO₂-Nenner, Verteilungen)"
scope: "Deutschland / EU-27 / Welt"
date: "2026-08-30"
zugriffsdatum: "2026-08-30"
status: "Recherche-Ergebnis, Hochrechnungs-Stufe"
language: "de"
tags: [hochrechnung, pkw-bestand, neuzulassungen, co2-emissionen, pkw-sektor, flottenerneuerung, monte-carlo, verteilungen, kba, acea, uba, eea, iea, gcp]
---

# Hochrechnungs-Dossier: „Was bringt es, wenn die Flotte elektrisch wird?"

> **Zweck:** Belastbare, quellenbasierte Größen für die Hochrechnungs-Stufe des
> Monte-Carlo-Modells „E-Auto vs. Verbrenner": Pkw-Bestände, Neuzulassungen,
> CO₂-Gesamtemissionen und Pkw-Sektor-Emissionen (jeweils DE / EU-27 / Welt),
> Flottenerneuerungs-Dauern sowie Streubreiten für die MC-Verteilungen
> (Fahrleistung, Nutzungsdauer, Verbräuche). Abschließend ein maschinen-
> lesbarer JSON-Block `scaleup_params` und eine Lückenliste `gaps`.
>
> Ergänzt das Parameter-Dossier `eauto/research/parameter_quellen.md`
> (Pro-Fahrzeug-LCA); Quellennummern hier sind eigenständig.

---

## 0. Methodische Vorbemerkung — bitte zuerst lesen

**Einschränkung der Quellenprüfung:** Wie schon bei `parameter_quellen.md` blockiert
der Netzwerk-Egress dieser Arbeitsumgebung den direkten Volltext-Abruf (WebFetch)
für die meisten externen Domains. In dieser Session wurde daher **ausschließlich
mit Suchmaschinen-Zusammenfassungen** gearbeitet (WebSearch, viele Einzelabfragen);
auf Fetch-Versuche wurde aufgrund der dokumentierten Block-Erfahrung verzichtet.

Konsequenz: **Alle Zahlen stammen aus Suchtreffer-Zusammenfassungen der jeweiligen
Primärquellen, nicht aus selbst gelesenen Volltexten.** URLs und Titel sind belegt
und auflösbar; Einzelwerte konnten nicht Zeile für Zeile am Original geprüft werden.
Konfidenz-Kennzeichnung analog zum Parameter-Dossier:

| Kennzeichen | Bedeutung |
|---|---|
| **A** | Amtlich (KBA, UBA, EEA, destatis) bzw. quasi-amtlich (ACEA, IEA, Global Carbon Project, UNEP) oder mehrfach unabhängig konsistent wiedergegeben |
| **B** | Seriöse Sekundärquelle, nicht mehrfach unabhängig bestätigt |
| **C** | Einzelquelle, Branchenquelle oder von mir abgeleiteter/errechneter Wert |
| **Lücke** | Nicht belegbar → siehe `gaps` |

**CO₂ vs. CO₂e:** In diesem Dossier wird bei jeder Emissionszahl explizit
ausgewiesen, ob es sich um **CO₂** (nur Kohlendioxid, i. d. R. energiebedingt)
oder **CO₂e** (alle Treibhausgase in CO₂-Äquivalenten) handelt. Die beiden dürfen
im Modell **nicht gemischt** werden — für die „Anteil der Pkw an X"-Aussage
immer Zähler und Nenner in derselben Metrik wählen.

---

## 1. Pkw-Bestand (DE / EU-27 / Welt) und BEV-Anteil am Bestand

### Deutschland (KBA, amtlich — Konf. A)

Stichtag 1. Januar 2026 (KBA-Pressemitteilung 09/2026, FZ 1):

| Größe | Wert | Konf. |
|---|---|---|
| Pkw-Bestand gesamt | **49.486.487** (+0,3 % ggü. Vorjahr) | A |
| davon Benziner | 29,34 Mio. (59,3 %) | A |
| davon Diesel | 13,39 Mio. (27,0 %) | A |
| davon Hybrid (inkl. PHEV) | 4,36 Mio. (8,8 %) | A |
| davon **BEV** | **2.034.260 (4,1 %)**, +23,2 % ggü. Vorjahr | A |

Der Auftrags-Schätzwert „~49 Mio." ist damit **bestätigt** (49,5 Mio.).

### EU-27 (ACEA „Vehicles on European Roads", quasi-amtlich — Konf. A/B)

| Größe | Wert | Datenjahr | Konf. |
|---|---|---|---|
| Pkw-Bestand EU | **256 Mio.** (+1,4 % ggü. 249 Mio. 2023) | 2024 (Report-Ausgabe 2026) | A |
| **BEV-Anteil am EU-Pkw-Bestand** | **2,3 %** (≈ 5,9 Mio. BEV, abgeleitet) | 2024/2026-Report | B (Anteil) / C (Absolutwert abgeleitet) |
| Nutzfahrzeuge zur Einordnung | Vans 31,1 Mio., Lkw 6,2 Mio., Busse 0,7 Mio. | 2024 | B |

Der Auftrags-Schätzwert „~250 Mio." ist **leicht zu niedrig**: aktuell 256 Mio.

### Welt (Konf. B/C)

| Größe | Wert | Konf. |
|---|---|---|
| **Pkw**-Bestand weltweit | **> 1,3 Mrd.** (2025; 1978: 275 Mio.) | B |
| Kfz gesamt (inkl. Lkw/Busse) | häufig zitiert **~1,6 Mrd.** — Sekundär-/Zählerquellen, keine amtliche Statistik | C |

**Achtung Abgrenzung:** Der Auftrags-Schätzwert „1,4–1,6 Mrd." trifft eher den
**Kfz-Gesamtbestand**; der reine **Pkw**-Bestand liegt bei **~1,3 Mrd.**
Für die Hochrechnung „Pkw-Flotte elektrisch" ist 1,3 Mrd. der richtige Wert
(mit Unsicherheitsspanne 1,2–1,5 Mrd.). BEV-Anteil am Welt-Bestand: kein
belastbarer aktueller Wert in dieser Session gefunden (IEA nennt Bestandszahlen
im Global EV Outlook; nicht abrufbar) → `gaps`. Grobe Einordnung: ~58 Mio.
E-Autos Bestand 2024 (GEVO-Berichterstattung) wäre ~4 % — **nicht verifiziert**.

---

## 2. Neuzulassungen pro Jahr und BEV-Anteil an Neuzulassungen (2025)

### Deutschland (KBA-Jahresbilanz 2025, amtlich — Konf. A)

| Größe | Wert | Konf. |
|---|---|---|
| Pkw-Neuzulassungen 2025 | **2.857.591** (+1,4 % ggü. 2024) | A |
| davon **BEV** | **545.142 → 19,1 %** (+43,2 %) | A |
| davon PHEV | 311.398 → 10,9 % (+62,3 %) | A |
| davon Hybrid gesamt | 1.127.509 → 39,5 % | A |

Auftrags-Schätzwert „~2,8 Mio." **bestätigt** (2,86 Mio.); BEV-Anteil DE 2025: **19,1 %**.

### EU-27 (ACEA, Konf. A)

| Größe | Wert | Konf. |
|---|---|---|
| BEV-Neuzulassungen EU 2025 | **1.880.370 → 17,4 % Marktanteil** (Vorjahr 13,6 %) | A |
| Pkw-Neuzulassungen EU 2025 gesamt | **≈ 10,8 Mio.** (abgeleitet: 1.880.370 / 0,174; ACEA: +1,8 % ggü. 2024) | C (Ableitung aus A-Daten) |
| Benzin+Diesel-Anteil 2025 | 35,5 % (2024: 45,2 %); Hybrid 34,5 % | A |
| Trend 2026 | BEV-Anteil H1 2026: 20,7 % | A |

Auftrags-Schätzwert „EU ~10–11 Mio." **bestätigt** (~10,8 Mio.).

### Welt (Konf. B, Abgrenzung beachten)

| Größe | Wert | Konf. |
|---|---|---|
| Light-Vehicle-Verkäufe 2025 (Pkw + leichte Nutzfahrzeuge) | **91,9 Mio.** (+3,6 %; GlobalData) | B |
| „Cars" im IEA-Sinn (Basis der 25-%-Quote) | **≈ 83 Mio.** (abgeleitet: 20,7 Mio. EV = 25 %) | C (Ableitung) |
| China als größter Markt | 24,3 Mio. (~30 % der Welt-Neuzulassungen) | B |
| EV-Verkäufe 2025 (BEV **+ PHEV**) | **20,7–21 Mio. → 25 %** aller Neuwagen (IEA GEVO 2026) | A |
| davon BEV / PHEV | **BEV 67 % / PHEV 33 %** → BEV ≈ **13,9 Mio. ≈ ~17 %** aller Neuwagen | B |

**Wichtig für das Modell:** Der Auftrags-Schätzwert „Welt-BEV-Anteil ~20 %"
liegt **zwischen** den beiden korrekten Zahlen: **25 % inkl. PHEV**, **~17 %
nur BEV**. Die Spanne „75–90 Mio. Neuzulassungen" ist je nach Abgrenzung
(Pkw vs. Light Vehicles) am **oberen Rand** zu verorten: ~83 Mio. „cars",
91,9 Mio. Light Vehicles.

---

## 3. CO₂-Gesamtemissionen (aktuellstes Jahr, Metrik jeweils ausgewiesen)

### Deutschland (UBA, amtlich — Konf. A)

| Größe | Wert | Metrik | Jahr | Konf. |
|---|---|---|---|---|
| THG gesamt | **649 Mt** (−0,1 % ggü. 2024; −48 % ggü. 1990) | **CO₂e** | 2025 (UBA-Schätzung, März 2026) | A |

Auftrags-Schätzwert „~600–650 Mt" **bestätigt** (oberes Ende), aber als
**CO₂e**; ein reiner CO₂-Wert (~85–88 % der THG) wurde in dieser Session nicht
separat belegt → `gaps`.

### EU-27 (EEA — Konf. A/B)

| Größe | Wert | Metrik | Jahr | Konf. |
|---|---|---|---|---|
| THG **netto** (inkl. LULUCF) | **2.786 Mt** (−37 % ggü. 1990; −2,5 % ggü. 2023) | CO₂e | 2024 (EEA-Schätzung) | A |
| THG gesamt (2023, Vergleich) | **3.106 Mt** | CO₂e | 2023 | A |

Auftrags-Schätzwert „~3 Gt" ist für 2023 korrekt; **2024 netto bereits ~2,8 Gt**.
Netto- vs. Brutto-Abgrenzung (mit/ohne LULUCF-Senke) beachten → für den
Pkw-Anteils-Nenner eher die Brutto-Größe (~3,0–3,1 Gt) verwenden; exakter
Brutto-Wert 2024 nicht belegt → `gaps`.

### Welt (Global Carbon Project / UNEP — Konf. A)

| Größe | Wert | Metrik | Jahr | Konf. |
|---|---|---|---|---|
| Fossiles CO₂ (energie-/prozessbedingt) | **38,1 Gt** (+1,1 %, Rekord) | **CO₂** | 2025 (GCB-Projektion) | A |
| + Landnutzungsänderung | 4,1 Gt → gesamt **~42,2 Gt** | CO₂ | 2025 | A |
| THG gesamt | **57,7 Gt** (+2,3 %, Rekord) | **CO₂e** | 2024 (UNEP Emissions Gap Report 2025) | A |

Auftrags-Schätzwerte: „37–38 Gt energiebedingt" **bestätigt** (38,1);
„~53 Gt THG gesamt" ist **veraltet/zu niedrig** — aktuell **57,7 Gt CO₂e (2024)**.

---

## 4. CO₂-Emissionen des Pkw-Verkehrs (der richtige Nenner)

### Deutschland

| Größe | Wert | Metrik | Jahr | Konf. |
|---|---|---|---|---|
| Verkehr gesamt | **146,3 Mt** (+2,1 Mt ggü. 2024) | CO₂e | 2025 (UBA) | A |
| Straßenverkehr-Anteil am Verkehr | Großteil; UBA: ~72 % der verkehrsbedingten CO₂ aus dem Straßenverkehr (ältere UBA-Angabe nennt bis ~96 % je nach Abgrenzung nationale/internationale Verkehre) | — | — | B |
| Pkw-Anteil am Straßenverkehr | **61 %** (Eurostat-Systematik, auch für DE) | CO₂ | 2021 | A |
| **Pkw absolut DE** | **~87–100 Mt**: 61 % × 142,1 Mt Straßenverkehr 2021 ≈ **87 Mt CO₂**; BUND: „~100 Mt CO₂/a" | CO₂ | 2021/aktuell | B/C |

Auftrags-Schätzwerte „Verkehr ~146 Mt" **bestätigt**, „Pkw ~90–100 Mt"
**plausibel bestätigt** (belegte Spanne 87–100; ein amtlicher aktueller
Einzelwert „Pkw 20XX: X Mt" wurde nicht gefunden → `gaps`).

### EU-27

| Größe | Wert | Metrik | Jahr | Konf. |
|---|---|---|---|---|
| Straßenverkehr | **749 Mt** | CO₂ | 2023 | A |
| Pkw (+ Motorräder) Anteil | **61 %** | — | 2023 | A |
| **Pkw absolut EU** | **≈ 457 Mt** (749 × 0,61) | CO₂ | 2023 | B (Ableitung aus A-Daten) |
| Neuwagen-Flotte zur Einordnung | Ø-Emission neuer Pkw 2022: 108,2 g CO₂/km | CO₂ | 2022 | A |

### Welt (IEA)

| Größe | Wert | Metrik | Jahr | Konf. |
|---|---|---|---|---|
| Straßenverkehr gesamt | **> 6 Gt** (+8 % ggü. 2015) | CO₂ | 2024 | A |
| **Pkw + Vans** | **3,8 Gt** (> 60 % des Straßenverkehrs) | CO₂ | 2023 | A |

Auftrags-Schätzwerte „Straße ~6 Gt, Pkw ~3–3,5 Gt" **weitgehend bestätigt**;
IEA-Wert 3,8 Gt umfasst **Pkw + leichte Nutzfahrzeuge** — reine Pkw liegen
darunter (~3–3,3 Gt, nicht separat belegt → `gaps`).

### Konsolidierte Nenner-Tabelle für die Hochrechnung

| Region | Gesamt (CO₂e) | Gesamt (CO₂ fossil) | Pkw-Sektor (CO₂) | Pkw-Anteil an Gesamt |
|---|---|---|---|---|
| DE | 649 Mt (2025) | Lücke | ~87–100 Mt | **~14–15 %** (an THG CO₂e) |
| EU-27 | 2.786 Mt netto / 3.106 Mt (2023) | Lücke | ~457 Mt (2023) | **~15 %** |
| Welt | 57,7 Gt (2024) | 38,1 Gt (2025) | ~3,0–3,8 Gt (Pkw[+Vans], 2023) | **~6–7 %** (an THG) bzw. ~10 % (an fossilem CO₂) |

(Anteile: eigene Rechnung aus obigen Werten, Konf. C — als Modell-Kontrollgröße,
nicht als Zitat verwenden. Kernaussage: Selbst vollständige Elektrifizierung
der Welt-Pkw-Flotte adressiert nur ~10 % des fossilen CO₂ — die Hochrechnung
muss deshalb beide Nenner zeigen: Pkw-Sektor **und** Gesamtemissionen.)

---

## 5. Flottenerneuerung (Alter, Umschlagdauer)

| Größe | Wert | Quelle | Konf. |
|---|---|---|---|
| Ø-Alter Pkw-Bestand DE | **10,9 Jahre** (1.1.2026; +0,3 ggü. Vorjahr, Rekord) | KBA via Sekundär | A |
| Ø-Alter Pkw-Bestand EU | **12,7 Jahre** (2024er-Daten, ACEA-Report 2026; Vorjahr 12,5) | ACEA | A |
| Ø-Alter bei endgültiger Stilllegung DE | **~18 Jahre** (Bandbreite je Marke ~15–26) | entsorgung.de-Auswertung 2014, Sekundär | C |
| Rechn. Umschlagdauer DE (Bestand/Neuzulassungen) | 49,49 Mio. / 2,86 Mio. ≈ **17,3 Jahre** | eigene Rechnung aus KBA A-Daten | C |
| Rechn. Umschlagdauer EU | 256 Mio. / 10,8 Mio. ≈ **23,7 Jahre** | eigene Rechnung aus ACEA-Daten | C |
| Rechn. Umschlagdauer Welt | 1,3 Mrd. / ~83 Mio. ≈ **~16 Jahre** | eigene Rechnung | C |

**Abweichung vom Auftrags-Schätzwert:** „~15–18 Jahre bis der Bestand einmal
durchgetauscht ist" stimmt für **DE (~17) und Welt (~16)**, aber **nicht für die
EU (~24 Jahre)** — der EU-Bestand wächst und die Neuzulassungen sind relativ
schwach; zudem altert die EU-Flotte messbar (12,5 → 12,7 Jahre). Für die
Hochrechnung „Flotte einmal komplett getauscht" empfohlen: min 15 / mid 18 /
max 24 Jahre.

---

## 6. Streubreiten für die MC-Verteilungen

### Jahresfahrleistung über Fahrer (km/a)

| Größe | Wert | Quelle | Konf. |
|---|---|---|---|
| Mittelwert DE 2023 | **12.320 km/a** (Benziner 9.580 / Diesel 17.187 / alternative 15.852) | KBA-Inländerfahrleistung | A |
| Häufigste Klasse (Fahrer-Verteilung) | **5.001–10.000 km/a** (größte Gruppe, 2021) | Statista-Umfrage | B |
| Verteilungsform / Perzentile | Median und Perzentile der Fahrleistungs-**Verteilung** (MiD-Rohdaten) nicht zugänglich | — | Lücke |
| **MC-Empfehlung** | min **5.000** / mid **12.300** / max **30.000** km/a, rechtsschief (z. B. Lognormal) | Ableitung | C |

Der Auftrags-Schätzwert (5.000–30.000, „Median ~12.300") ist als Spanne
plausibel; **Achtung:** 12.320 ist der KBA-**Mittelwert** pro Fahrzeug, der
**Median dürfte darunter liegen** (rechtsschiefe Verteilung, größte Gruppe
5–10 tkm) — als Median-Annahme ist 12.300 daher **leicht konservativ pro-BEV**
(nicht belegt, Konf. C).

### Nutzungsdauer-Streuung (Jahre)

| Größe | Wert | Quelle | Konf. |
|---|---|---|---|
| DE-Erstnutzung bis Abmeldung/Export | ~9,5 a | Sekundär (siehe parameter_quellen.md) | C |
| Stilllegungsalter DE | ~18 a (Marken-Spanne ~15–26) | entsorgung.de 2014 | C |
| ICCT-Annahme Gesamtleben EU | 20 a / 240.000 km | ICCT 2025 | A |
| **MC-Empfehlung** | min **9** / mid **15–18** / max **22** a | Ableitung | C |

Der Auftrags-Vorschlag (9–22, Median ~15) ist mit den Ankern 9,5 / 18 / 20
konsistent; ein Median 15 ist **nicht direkt belegt** (Ableitung).

### Realverbrauch Benziner über Segmente (l/100 km)

| Segment | Realverbrauch | Quelle | Konf. |
|---|---|---|---|
| Kleinwagen | ~4,5–6 | Sekundär-Aggregation (Spritmonitor-basiert) | C |
| Kompaktklasse | ~5,5–7,5 | dito | C |
| Mittelklasse | ~6,5–8,5 | dito | C |
| SUV | ~8–12 | dito | C |
| Flottenmittel | **~7,9** (OBFCM: real +23,7 % über WLTP) | Spritmonitor / EU-OBFCM (siehe parameter_quellen.md [26]) | B |
| **MC-Empfehlung** | min **6,5** / mid **7,9** / max **9,5** l/100 km | Ableitung | C |

Auftrags-Spanne 6,5–9,5 **plausibel**: schneidet Kleinwagen-Extreme unten und
schwere SUV oben ab, Mitte = belegtes Flottenmittel. Wer die volle
Segment-Streuung will: 4,5–12.

### Realverbrauch BEV über Segmente (kWh/100 km, inkl. Ladeverluste)

| Größe | Wert | Quelle | Konf. |
|---|---|---|---|
| ADAC-Ecotest-Gesamtspanne | **15,5–29,7** (alle Testwagen 2025) | ADAC (siehe parameter_quellen.md [24][25]) | B |
| Kompakt-/Mittelklasse typisch | 16–20 | ADAC | B |
| **MC-Empfehlung** | min **15,5** / mid **18,5** / max **25** kWh/100 km | Ableitung (identisch zu parameter_quellen.md, max leicht erweitert für Segment-Streuung) | C |

Auftrags-Spanne 15,5–25 **plausibel** (obere Ecotest-Extreme > 25 sind große
SUV/Luxus, für die Flottenhochrechnung verzichtbar).

---

## 7. Kontext: Korrelation über den Strommix (für korrelierte MC-Ziehungen)

**These im Modell:** Ein saubererer Strommix senkt nicht nur die Fahremissionen
des BEV, sondern korreliert auch mit (a) der Batteriefertigung und (b) der
Kraftstoff-Vorkette. Befund dieser Recherche: **(a) stark, (b) nur schwach.**

### (a) Batteriefertigung hängt stark am Fertigungsstrom → hohe positive Korrelation

- Energiebedarf der Zellfertigung: ältere Angaben **40–80 kWh Energie pro kWh
  Zellkapazität**, moderne Fabriken **~30–35 kWh/kWh** (MDPI Environments 2025;
  Konf. B).
- Der Beitrag der Fertigungsenergie zum Batterie-Fußabdruck variiert je nach
  Strommix des Standorts **um eine Größenordnung** (ScienceDirect 2024:
  „Think global act local"; Konf. B). Beispiel Zellfertigung: Schweden/Norwegen
  Median **2,8 / 1,6 kg CO₂e pro kWh Zelle** (nur Fertigungsschritt) gegenüber
  0–60 kg je nach EE-Anteil (Sekundär-Aggregation, Konf. B/C).
- Konsistent mit parameter_quellen.md: Nature Comm. 2024 Regionalspannen
  (LFP: Norwegen 27–64 vs. China 90–127 kg CO₂e/kWh) und P3-Whitepaper
  (saubere Prozesskette ≈ −⅓).
- **Modell-Empfehlung:** Batteriefertigungs-Faktor und Strommix-Pfad **positiv
  korreliert ziehen** (ρ ≈ 0,5–0,8, eigene Setzung, Konf. C) — der
  Fertigungsstrom-Anteil am Batterie-Fußabdruck liegt grob bei **~30–50 %**
  (Rest Material-Vorketten; Ableitung aus obigen Spannen, Konf. C).

### (b) Raffinerie-/Kraftstoff-Vorkette hängt nur schwach am Netzstrom → geringe Korrelation

- Der kursierende Wert „**1,5–1,6 kWh Strom pro Liter Benzin**" ist **irreführend**:
  Er beschreibt den (überwiegend **thermischen**) Gesamt-Energieeinsatz der
  Raffinerie, der größtenteils aus Eigenverbrauch der Rohöl-Fraktionen gedeckt
  wird (sedl.at-Faktencheck; BFE energeiaplus 2025; Konf. B).
- Tatsächlicher **Netzstrom**-Bezug: **~0,05–0,175 kWh pro Liter Benzin**
  (Diesel ~0,12); Netzstrom deckte in europäischen Raffinerien (2010) nur
  **~7 % des Primärenergieeinsatzes** (BFE/energeiaplus, sedl.at; Konf. B).
- Konsequenz: Die WTT-Vorkette des Kraftstoffs (+15–25 % auf TTW, siehe
  parameter_quellen.md §7) besteht überwiegend aus Förderung, Transport und
  **thermischer** Raffinerie-Prozessenergie — ein sauberer **Strommix** senkt
  sie nur marginal (< 1–2 % des Kraftstoff-Fußabdrucks; Ableitung, Konf. C).
- **Modell-Empfehlung:** Korrelation Strommix ↔ Kraftstoff-Vorkette **klein
  halten** (ρ ≈ 0–0,2) oder die Vorkette unkorreliert ziehen; die im Netz
  verbreitete Behauptung „Verbrenner fahren mit so viel Strom wie ein E-Auto"
  nicht ins Modell übernehmen.

---

## 8. Konsolidierte Hochrechnungs-Parameter

```json
{
  "scaleup_params": {
    "bestand_pkw_de": {"value": 49486487, "min": 49000000, "max": 49500000, "unit": "Pkw", "source": "KBA PM 09/2026, Stichtag 2026-01-01 [1][2]", "confidence": "A", "note": "Benzin 29,34 Mio / Diesel 13,39 Mio / Hybrid 4,36 Mio / BEV 2,03 Mio."},
    "bev_anteil_bestand_de": {"value": 4.1, "min": 4.1, "max": 4.1, "unit": "%", "source": "KBA 2026 [1][2]", "confidence": "A", "note": "2.034.260 BEV, +23,2 % ggü. Vorjahr."},
    "bestand_pkw_eu27": {"value": 256000000, "min": 249000000, "max": 256000000, "unit": "Pkw", "source": "ACEA Vehicles on European Roads 2026 (Daten 2024) [3][4]", "confidence": "A", "note": "min = Datenjahr 2023 (249 Mio). Auftrags-Schätzwert 250 Mio leicht zu niedrig."},
    "bev_anteil_bestand_eu27": {"value": 2.3, "min": 2.0, "max": 2.5, "unit": "%", "source": "ACEA-Report 2026 [3][4]", "confidence": "B", "note": "Ca. 5,9 Mio BEV (abgeleitet). min/max eigene Unsicherheitsspanne."},
    "bestand_pkw_welt": {"value": 1300000000, "min": 1200000000, "max": 1500000000, "unit": "Pkw", "source": "Wikipedia Wirtschaftszahlen zum Automobil (2025) [5]", "confidence": "B", "note": "NUR Pkw. '1,6 Mrd' bezieht sich auf Kfz gesamt inkl. Lkw (Konf. C). BEV-Anteil Welt-Bestand: LUECKE."},
    "neuzulassungen_de_2025": {"value": 2857591, "min": 2857591, "max": 2857591, "unit": "Pkw/a", "source": "KBA Jahresbilanz 2025 [6][7]", "confidence": "A", "note": "+1,4 % ggü. 2024."},
    "bev_anteil_neuzulassungen_de_2025": {"value": 19.1, "min": 19.1, "max": 19.1, "unit": "%", "source": "KBA [6][7]", "confidence": "A", "note": "545.142 BEV (+43,2 %); PHEV 10,9 %."},
    "neuzulassungen_eu27_2025": {"value": 10800000, "min": 10600000, "max": 11000000, "unit": "Pkw/a", "source": "Ableitung aus ACEA: 1.880.370 BEV = 17,4 % [8]", "confidence": "C", "note": "ACEA-Gesamtwert nicht direkt zitiert; +1,8 % ggü. 2024. Auftrags-Schaetzwert 10-11 Mio bestaetigt."},
    "bev_anteil_neuzulassungen_eu27_2025": {"value": 17.4, "min": 17.4, "max": 17.4, "unit": "%", "source": "ACEA [8]", "confidence": "A", "note": "2024: 13,6 %; H1 2026: 20,7 % [9]."},
    "neuzulassungen_welt_2025": {"value": 83000000, "min": 80000000, "max": 91900000, "unit": "Fahrzeuge/a", "source": "IEA-Ableitung (20,7 Mio EV = 25 %) [10][11]; max = GlobalData Light Vehicles [12]", "confidence": "B", "note": "Abgrenzung! 'cars' (IEA) ca. 83 Mio; Light Vehicles inkl. LCV 91,9 Mio; China 24,3 Mio (ca. 30 %) [13]."},
    "ev_anteil_neuzulassungen_welt_2025": {"value": 25, "min": 25, "max": 25, "unit": "%", "source": "IEA GEVO 2026 [10][11]", "confidence": "A", "note": "INKL. PHEV (20,7-21 Mio EV)."},
    "bev_anteil_neuzulassungen_welt_2025": {"value": 17, "min": 16, "max": 18, "unit": "%", "source": "Ableitung: BEV = 67 % der EV-Verkaeufe [14]", "confidence": "B", "note": "Ca. 13,9 Mio BEV. Auftrags-Schaetzwert '20 %' liegt zwischen BEV-only (17) und inkl. PHEV (25)."},
    "thg_gesamt_de_2025": {"value": 649, "min": 648, "max": 650, "unit": "Mt CO2e/a", "source": "UBA-Schaetzung Maerz 2026 [15][16]", "confidence": "A", "note": "-0,1 % ggü. 2024; -48 % ggü. 1990. CO2e, nicht CO2! Reiner CO2-Wert: LUECKE."},
    "thg_gesamt_eu27_2024": {"value": 2786, "min": 2786, "max": 3106, "unit": "Mt CO2e/a", "source": "EEA [17][18]", "confidence": "A", "note": "value = netto inkl. LULUCF 2024 (-37 % ggü. 1990); max = Gesamtemission 2023 (3.106 Mt). Brutto 2024: LUECKE."},
    "co2_fossil_welt_2025": {"value": 38.1, "min": 38.1, "max": 42.2, "unit": "Gt CO2/a", "source": "Global Carbon Budget 2025 [19][20]", "confidence": "A", "note": "value = fossil; max = inkl. Landnutzung (+4,1 Gt). Nur CO2."},
    "thg_gesamt_welt_2024": {"value": 57.7, "min": 57.7, "max": 57.7, "unit": "Gt CO2e/a", "source": "UNEP Emissions Gap Report 2025 [21]", "confidence": "A", "note": "Rekord, +2,3 % ggü. 2023. Auftrags-Schaetzwert '53 Gt' veraltet."},
    "verkehr_de_2025": {"value": 146.3, "min": 144, "max": 146.3, "unit": "Mt CO2e/a", "source": "UBA [15][22]", "confidence": "A", "note": "+2,1 Mt ggü. 2024; ca. 22-23 % der DE-THG."},
    "pkw_de": {"value": 95, "min": 87, "max": 100, "unit": "Mt CO2/a", "source": "Ableitung: 61 % x 142,1 Mt Strassenverkehr 2021 (destatis/Eurostat) [23]; BUND: ~100 Mt [24]", "confidence": "B", "note": "Kein amtlicher aktueller Einzelwert gefunden (LUECKE). mid = eigene Setzung."},
    "strassenverkehr_eu27_2023": {"value": 749, "min": 749, "max": 749, "unit": "Mt CO2/a", "source": "destatis/Eurostat [23][25]", "confidence": "A", "note": "Kraftstoffverbrennung Strassenverkehr EU."},
    "pkw_eu27_2023": {"value": 457, "min": 440, "max": 470, "unit": "Mt CO2/a", "source": "Ableitung: 61 % von 749 Mt [23][25][26]", "confidence": "B", "note": "'Pkw + Motorraeder'; 61-%-Anteil mehrfach belegt (EP-Infografik, Eurostat)."},
    "strassenverkehr_welt_2024": {"value": 6.0, "min": 6.0, "max": 6.2, "unit": "Gt CO2/a", "source": "IEA Breakthrough Agenda Report 2025 [27]", "confidence": "A", "note": "'just over 6 Gt', +8 % ggü. 2015."},
    "pkw_vans_welt_2023": {"value": 3.8, "min": 3.0, "max": 3.8, "unit": "Gt CO2/a", "source": "IEA Cars and Vans [28]", "confidence": "A", "note": "Pkw + leichte Nutzfahrzeuge (>60 % des Strassenverkehrs). Reine Pkw ~3-3,3 Gt (Ableitung, LUECKE)."},
    "flottenalter_de": {"value": 10.9, "min": 10.3, "max": 10.9, "unit": "Jahre", "source": "KBA via Sekundaer, Stand 2026-01-01 [29]", "confidence": "A", "note": "Rekordwert, +0,3 ggü. Vorjahr; min = Wert 2023."},
    "flottenalter_eu27": {"value": 12.7, "min": 12.5, "max": 12.7, "unit": "Jahre", "source": "ACEA-Report 2026 (Daten 2024) [3][30]", "confidence": "A", "note": "Vorjahr 12,5 - EU-Flotte altert."},
    "stilllegungsalter_de": {"value": 18, "min": 15, "max": 26, "unit": "Jahre", "source": "entsorgung.de-Auswertung 2014 via Sekundaer [31]", "confidence": "C", "note": "Alte Einzelquelle (2014); Markenspanne 15-26. Amtlicher Wert: LUECKE."},
    "flottenumschlag_dauer": {"value": 18, "min": 15, "max": 24, "unit": "Jahre", "source": "Eigene Rechnung Bestand/Neuzulassungen: DE 17,3 / Welt ~16 / EU 23,7", "confidence": "C", "note": "Auftrags-Schaetzwert 15-18 a gilt fuer DE+Welt, NICHT fuer EU (~24 a)."},
    "mc_jahresfahrleistung": {"value": 12300, "min": 5000, "max": 30000, "unit": "km/a", "source": "KBA-Mittel 12.320 (2023) [32]; groesste Fahrergruppe 5-10 tkm [33]", "confidence": "B", "note": "Rechtsschief (Lognormal empfohlen). 12.320 ist MITTELWERT; Median vermutlich darunter (nicht belegt). Antriebs-Split: Benziner 9.580 / Diesel 17.187."},
    "mc_nutzungsdauer": {"value": 15, "min": 9, "max": 22, "unit": "Jahre", "source": "Anker: DE-Erstnutzung 9,5 / Stilllegung ~18 [31] / ICCT 20 a", "confidence": "C", "note": "Median 15 nicht direkt belegt (Ableitung); konsistent mit parameter_quellen.md."},
    "mc_verbrauch_benziner": {"value": 7.9, "min": 6.5, "max": 9.5, "unit": "l/100km", "source": "Flottenmittel Spritmonitor [34]; Segmentspannen 4,5-12 (Sekundaer) [35]", "confidence": "B", "note": "min/max = Auftrags-Spanne, plausibel (schneidet Kleinwagen unten, schwere SUV oben ab); volle Segment-Streuung 4,5-12 (C)."},
    "mc_verbrauch_bev": {"value": 18.5, "min": 15.5, "max": 25, "unit": "kWh/100km", "source": "ADAC Ecotest (Gesamtspanne 15,5-29,7) [36]", "confidence": "B", "note": "Inkl. Ladeverluste. max 25 schneidet grosse SUV/Luxus ab (Ecotest bis 29,7)."},
    "batterie_strom_anteil_fussabdruck": {"value": 40, "min": 30, "max": 50, "unit": "%", "source": "Ableitung aus [37][38][39] (Fertigungsenergie 30-80 kWh/kWh Zelle; Standort-Varianz eine Groessenordnung)", "confidence": "C", "note": "Anteil Fertigungsstrom am Batterie-Fussabdruck. Fuer korrelierte MC-Ziehung: rho Strommix<->Batteriefertigung ~0,5-0,8 (eigene Setzung)."},
    "raffinerie_netzstrom_pro_liter": {"value": 0.1, "min": 0.05, "max": 0.175, "unit": "kWh/l", "source": "BFE energeiaplus 2025 [40], sedl.at [41]", "confidence": "B", "note": "NETZstrom Benzin (Diesel ~0,12). Der kursierende Wert 1,5-1,6 kWh/l ist GESAMTenergie (v. a. thermisch, Eigenverbrauch) - nicht verwenden. Netzstrom ~7 % des Raffinerie-Primaerenergieeinsatzes (EU 2010)."},
    "korrelation_strommix_kraftstoffvorkette": {"value": 0.1, "min": 0, "max": 0.2, "unit": "rho", "source": "Ableitung aus [40][41]", "confidence": "C", "note": "Sauberer Strommix senkt Kraftstoff-WTT nur marginal (<1-2 % des Kraftstoff-Fussabdrucks) - Korrelation klein halten."}
  },
  "gaps": [
    "BEV-Anteil am WELT-Pkw-Bestand 2025: kein belastbarer Wert (IEA-GEVO-Bestandszahl nicht zugaenglich; ~58 Mio E-Autos 2024 = ~4 % NICHT verifiziert)",
    "Reiner CO2-Wert (ohne andere THG) fuer Deutschland gesamt: nur CO2e (649 Mt) belegt",
    "EU-27 Brutto-THG 2024 (ohne LULUCF-Verrechnung): nur Netto-Wert 2.786 Mt belegt; 2023-Gesamtwert 3.106 Mt als Naeherung",
    "Amtlicher aktueller Einzelwert 'Pkw-Emissionen Deutschland 20XX in Mt' (UBA/BMDV-Differenzierung nach Fahrzeugart): nur Ableitung 87-100 Mt aus 61-%-Anteil (2021) + BUND-Angabe",
    "Reine Pkw-Emissionen Welt (ohne Vans): IEA weist nur 'cars and vans' = 3,8 Gt (2023) aus; Pkw-only ~3-3,3 Gt ist Ableitung",
    "Anteil Straßenverkehr an DE-Verkehrsemissionen: widerspruechliche Angaben (72 % vs. ~96 % je nach Abgrenzung nationale/internationale Verkehre) - vor Nutzung am UBA-Original klaeren",
    "Median und Perzentile der Jahresfahrleistungs-VERTEILUNG ueber Fahrer (MiD-Mikrodaten): nicht zugaenglich; nur Mittelwert (KBA) + groesste Gruppe 5-10 tkm (Statista 2021)",
    "Nutzungsdauer-Verteilung: kein amtlicher aktueller Wert fuer Stilllegungsalter (einzige Quelle: entsorgung.de 2014); Median 15 a ist Ableitung",
    "Spritmonitor-Segmentspannen Benziner: nur Sekundaer-Aggregation (Deutschlandrechner u. a.), nicht Spritmonitor-Original",
    "Pkw-Neuzulassungen WELT (reine Pkw nach OICA-Abgrenzung) 2025: Statista-Wert paywalled; nur Ableitung ~83 Mio (IEA-Basis) bzw. 91,9 Mio Light Vehicles",
    "Anteil Fertigungsstrom am Batterie-Fussabdruck (30-50 %): eigene Ableitung aus Spannen, kein direkt zitierbarer Einzelwert",
    "Volltexte generell nicht abrufbar (Egress-Policy); alle Werte aus WebSearch-Zusammenfassungen - A-Werte vor Veroeffentlichung am Original pruefen (KBA PM 09/2026, ACEA-Report-PDF 2026, UBA-Schaetzung 2026, GCB 2025, UNEP EGR 2025)"
  ]
}
```

---

## 9. Quellenliste

Alle Zugriffe am **2026-08-30** über Suchmaschinen-Zusammenfassungen (WebSearch);
Volltexte per Egress-Policy nicht abrufbar (siehe Abschnitt 0). Konfidenz bezieht
sich auf die Quelle als Institution, nicht auf jede Einzelzahl.

| # | Quelle | URL | Konf. |
|---|---|---|---|
| 1 | KBA-Pressemitteilung 09/2026: „Der Fahrzeugbestand am 1. Januar 2026" (49.486.487 Pkw; BEV 2.034.260 = 4,1 %) | https://www.kba.de/DE/Presse/Pressemitteilungen/Fahrzeugbestand/2026/pm09_fz_bestand_pm_komplett.html | A |
| 2 | KBA PM 09/2026 (PDF-Fassung) | https://www.kba.de/SharedDocs/Downloads/DE/Pressemitteilungen/2026/pm_09_2026_bestand_01_26.pdf | A |
| 3 | ACEA: „Report – Vehicles on European roads 2026" (256 Mio. Pkw 2024; BEV-Bestandsanteil 2,3 %; Ø-Alter 12,7 a) | https://www.acea.auto/publication/report-vehicles-on-european-roads-2026/ | A |
| 4 | ACEA-Report-PDF „Vehicles on European Roads January 2026" | https://www.acea.auto/files/ACEA_Report-%E2%80%93-Vehicles_on_European_roads_2026.pdf | A |
| 5 | Wikipedia: „Wirtschaftszahlen zum Automobil" (Welt-Pkw-Bestand > 1,3 Mrd. 2025) | https://de.wikipedia.org/wiki/Wirtschaftszahlen_zum_Automobil | B |
| 6 | KBA-Pressemitteilung 01/2026: „Fahrzeugzulassungen im Dezember 2025 – Jahresbilanz" (2.857.591 Pkw; BEV 545.142 = 19,1 %) | https://www.kba.de/DE/Presse/Pressemitteilungen/Fahrzeugzulassungen/2026/pm01_2026_n_12_25_pm_komplett.html | A |
| 7 | KBA PM 03/2026: „Neuzulassungen … 2025 nach Marken und alternativen Antrieben" (PHEV 311.398 = 10,9 %) | https://www.kba.de/DE/Presse/Pressemitteilungen/AlternativeAntriebe/2026/pm03_2026_Antriebe_12_25_komplett.html | A |
| 8 | ACEA: „New car registrations: +1.8% in 2025; battery-electric 17.4% market share" (1.880.370 BEV) | https://www.acea.auto/pc-registrations/new-car-registrations-1-8-in-2025-battery-electric-17-4-market-share/ | A |
| 9 | ACEA: „New car registrations: +5.7% in H1 2026; battery-electric 20.7% market share" | https://www.acea.auto/pc-registrations/new-car-registrations-5-7-in-h1-2026-battery-electric-20-7-market-share/ | A |
| 10 | IEA Global EV Outlook 2026 – Executive Summary (21 Mio. E-Autos 2025, 1 von 4 Neuwagen) | https://www.iea.org/reports/global-ev-outlook-2026/executive-summary | A |
| 11 | IEA Global EV Outlook 2026 – Trends in electric cars (Regionalzahlen, China > 13 Mio.) | https://www.iea.org/reports/global-ev-outlook-2026/trends-in-electric-cars | A |
| 12 | Just Auto / GlobalData: „Global light vehicle sales fall 2% in December 2025" (Jahreswert 91,9 Mio. Light Vehicles, +3,6 %) | https://www.just-auto.com/industry-data/global-light-vehicle-sales-fall-2-in-december-2025/ | B |
| 13 | ecomento: „Pkw-Markt 2025: China Wachstumstreiber" (China 24,3 Mio. ≈ 30 % der Welt) | https://ecomento.de/2025/12/23/pkw-markt-2025-china-bleibt-wachstumstreiber-europa-verliert-an-dynamik/ | B |
| 14 | RK Equity Blog: „EVs: What do 2025 trends tell us about 2026?" (EV 20,7 Mio.; BEV 67 % / PHEV 33 %) | https://blog.rkequity.com/2026/02/05/evs-what-do-2025-trends-tell-us-about-2026/ | B |
| 15 | Deutscher Bundestag (hib): „Umweltbundesamt: CO2-Emissionen 2025 kaum gesunken" (649 Mt CO₂e; Verkehr +2,1 Mt) | https://www.bundestag.de/presse/hib/kurzmeldungen-1170464 | A |
| 16 | ecomento (16.03.2026): „Treibhausgasdaten zeigen laut UBA: Klimaschutz braucht neuen Schub" | https://ecomento.de/2026/03/16/treibhausgasdaten-zeigen-laut-uba-klimaschutz-braucht-neuen-schub/ | B |
| 17 | EEA: „Total net greenhouse gas emission trends and projections in Europe" (2024: 2.786 Mt CO₂e netto, −37 % ggü. 1990) | https://www.eea.europa.eu/en/analysis/indicators/total-greenhouse-gas-emission-trends/ | A |
| 18 | UBA: „Treibhausgas-Emissionen in der Europäischen Union" (2023: 3.106 Mt CO₂e) | https://www.umweltbundesamt.de/daten/klima/treibhausgas-emissionen-in-der-europaeischen-union | A |
| 19 | Global Carbon Budget 2025: „Fossil fuel CO2 emissions hit record high in 2025" (38,1 Gt fossil; +4,1 Gt LUC ≈ 42,2 Gt) | https://globalcarbonbudget.org/fossil-fuel-co2-emissions-hit-record-high-in-2025/ | A |
| 20 | Carbon Brief: „Fossil-fuel CO2 emissions to set new record in 2025" | https://www.carbonbrief.org/analysis-fossil-fuel-co2-emissions-to-set-new-record-in-2025-as-land-sink-recovers | B |
| 21 | UNEP Emissions Gap Report 2025 (via PBL/NewClimate): globale THG 2024 = 57,7 Gt CO₂e (+2,3 %) | https://www.pbl.nl/en/publications/unep-emissions-gap-report-2025 | A |
| 22 | RECYCLING magazin (16.03.2026): „Treibhausgasemissionen 2025 stagnieren weitgehend" (Verkehr 146,3 Mt CO₂e) | https://www.recyclingmagazin.de/2026/03/16/treibhausgasemissionen-deutschland-2025/ | B |
| 23 | destatis: „CO2-Ausstoß im EU-Straßenverkehr" (DE Straßenverkehr 2021: 142,14 Mt CO₂, Pkw-Anteil 61 %; EU 2023: 749 Mt) | https://www.destatis.de/Europa/DE/Thema/Umwelt-Energie/CO2_Strassenverkehr.html | A |
| 24 | BUND: „Autoverkehr: Klimawandel bremsen" (Pkw-Verkehr DE ≈ 100 Mt CO₂/a) | https://www.bund.net/themen/mobilitaet/autos/ | C |
| 25 | destatis (EN): „Road transport: EU-wide carbon dioxide emissions since 1990" | https://www.destatis.de/Europa/EN/Topic/Environment-energy/CarbonDioxideRoadTransport.html | A |
| 26 | Europäisches Parlament: „CO2 emissions from cars: facts and figures" (Pkw = 61 % des EU-Straßenverkehrs) | https://www.europarl.europa.eu/topics/en/article/20190313STO31218/co2-emissions-from-cars-facts-and-figures-infographics | A |
| 27 | IEA Breakthrough Agenda Report 2025 – Road transport (Straße > 6 Gt CO₂ 2024, +8 % ggü. 2015) | https://www.iea.org/reports/breakthrough-agenda-report-2025/road-transport | A |
| 28 | IEA Energy System – Cars and Vans (Pkw+Vans 3,8 Gt CO₂ 2023, > 60 % des Straßenverkehrs) | https://www.iea.org/energy-system/transport/cars-and-vans | A |
| 29 | autoservicepraxis / Mittelstand Cafe: „Pkw-Durchschnittsalter: Autos werden immer älter" (DE 10,9 a zum 1.1.2026, KBA-Daten) | https://www.autoservicepraxis.de/nachrichten/autobranche/pkw-durchschnittsalter-autos-werden-immer-aelter-3364784 | B |
| 30 | ACEA-Figure: „Average age of the EU vehicle fleet, by country" (EU 12,7 a) | https://www.acea.auto/figure/average-age-of-eu-vehicle-fleet-by-country/ | A |
| 31 | Runter vom Gas (BMDV-Kampagne): „Vom Ende einer Ära" (Verschrottungsalter Ø ~18 a, Marken 15–26; Basis entsorgung.de 2014) | https://www.runtervomgas.de/menschen-und-geschichten/artikeluebersicht/vom-ende-einer-aera/ | C |
| 32 | KBA-Pressemitteilung 21/2024: „Inländerfahrleistung 2023" (Ø 12.320 km/a; Benziner 9.580 / Diesel 17.187) | https://www.kba.de/DE/Presse/Pressemitteilungen/Allgemein/2024/pm21_2024_Entw_Fahrleistung.html | A |
| 33 | Statista: „Jährliche Fahrleistung des Pkw in Deutschland" (größte Gruppe 5.001–10.000 km/a, 2021) | https://de.statista.com/statistik/daten/studie/183003/umfrage/pkw-gefahrene-kilometer-pro-jahr/ | B |
| 34 | fahrzeugschein.de / Spritmonitor-Auswertung: Realverbrauch Benziner ~7,9 l/100 km; OBFCM +23,7 % über WLTP | https://www.fahrzeugschein.de/blog/artikel/spritverbrauch-berechnen | B |
| 35 | Deutschlandrechner: „Spritverbrauch-Rechner" (Segmentspannen: Kleinwagen 4,5–6 / Kompakt 5,5–7,5 / Mittel 6,5–8,5 / SUV 8–12) | https://www.deutschland-rechner.de/spritverbrauch-rechner | C |
| 36 | ADAC: „Stromverbrauch Elektroautos im ADAC Test" (Spanne 15,5–29,7 kWh/100 km inkl. Ladeverluste) | https://www.adac.de/rund-ums-fahrzeug/elektromobilitaet/elektroauto/stromverbrauch-elektroautos-adac-test/ | B |
| 37 | MDPI Environments (2025): „Energy Use and Environmental Impact of Three Lithium-Ion Battery Factories …" (moderne Fabriken ~30–35 kWh Energie/kWh Zelle; ältere Angaben 40–80) | https://doi.org/10.3390/environments12010024 | B |
| 38 | ScienceDirect (2024): „Think global act local: The dependency of global lithium-ion battery emissions on production location and material sources" (Strommix-Varianz ≈ eine Größenordnung; Zellfertigung Schweden/Norwegen 2,8/1,6 kg CO₂e/kWh) | https://www.sciencedirect.com/science/article/pii/S0959652624011739 | B |
| 39 | Nature Communications (2024): „Carbon footprint distributions of lithium-ion batteries and their materials" (Regionalspannen, vgl. parameter_quellen.md [21]) | https://www.nature.com/articles/s41467-024-54634-y | B |
| 40 | BFE energeiaplus (31.03.2025): „Wieviel Strom braucht's für die Bereitstellung von Benzin und Diesel?" (Netzstrom ~0,175 kWh/l Benzin, ~0,12 kWh/l Diesel) | https://energeiaplus.com/2025/03/31/wieviel-strom-brauchts-fuer-die-bereitstellung-von-benzin-und-diesel/ | B |
| 41 | sedl.at: „Gigantischer Stromverbrauch von Raffinerien?" (Faktencheck 1,5-kWh-Mythos; Netzstrom < 0,05 kWh/l bzw. ~7 % des Raffinerie-Primärenergieeinsatzes EU 2010) | https://sedl.at/Umweltirrtuemer/Stromverbrauch_Raffinerien | B |
