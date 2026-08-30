---
title: "Parameter und Quellen: Lebenszyklus-CO₂-Modell E-Auto vs. Verbrenner"
subtitle: "Recherche- und Validierungsbericht für das E-Auto-Klimabilanz-Modell"
scope: "Deutschland / EU, Kompaktklasse als Referenzsegment"
date: "2026-08-30"
zugriffsdatum: "2026-08-30"
status: "Recherche-Ergebnis, Phase 1"
language: "de"
tags: [lebenszyklus, lca, bev, verbrenner, strommix, batterie, tum, icct, emissionsfaktoren, fahrleistung]
---

# Parameter-Dossier: Lebenszyklus-CO₂ „E-Auto vs. Verbrenner"

> **Zweck:** Belastbare, quellenbasierte Bandbreiten für alle Eingangsparameter eines
> kleinen Lebenszyklus-CO₂-Modells (BEV vs. Benziner/Diesel, Kompaktklasse, DE/EU).
> Anlass ist die Kontroverse **TUM-Meta-Studie 2026 (−41 %)** vs. **ICCT-Studie
> Juli 2025 (−73 %)**. Abschließend ein maschinenlesbarer JSON-Block `model_params`
> und eine explizite Lückenliste `gaps`.

---

## 0. Wichtige methodische Vorbemerkung — bitte zuerst lesen

**Einschränkung der Quellenprüfung in dieser Recherche-Session:** Der Netzwerk-Egress
dieser Arbeitsumgebung blockiert den direkten Volltext-Abruf (WebFetch) für die
einschlägigen Domains. Konkret getestet und **geblockt**: `cleanthinking.de`,
`developer.myptv.com`. Aufgrund der Erfahrung aus der Strommix-Recherche
(`strommix/research/kosten_ee_speicher.md`) wurde auf weitere Fetch-Versuche
verzichtet und primär mit Suchmaschinen-Zusammenfassungen gearbeitet.

Konsequenz: **Alle Zahlen stammen aus Suchmaschinen-Zusammenfassungen der jeweiligen
Primärquellen, nicht aus dem selbst gelesenen Volltext.** URLs und Titel sind belegt
und auflösbar; die Einzelwerte konnten nicht Zeile für Zeile am Original geprüft
werden. Konfidenz-Kennzeichnung analog zum Strommix-Dossier:

| Kennzeichen | Bedeutung |
|---|---|
| **A** | Amtlich (UBA, KBA, EEA) oder in mehreren unabhängigen Treffern konsistent wiedergegeben |
| **B** | Seriöse Sekundärquelle (ICCT, VDI, Fraunhofer, Ember, Fachpresse), aber nicht mehrfach unabhängig bestätigt |
| **C** | Einzelquelle, Beratungs-/Branchenquelle oder von mir abgeleiteter Wert |
| **nicht verifiziert / Lücke** | Zahl konnte nicht belegt werden → siehe `gaps` |

**Empfehlung:** Vor Veröffentlichung mindestens die A-Werte (UBA-Strommix, KBA-Fahrleistung)
und die beiden Kernstudien (TUM-Whitepaper-PDF, ICCT-Report ID-392) am Original
nachlesen. Der ICCT-Report ist als PDF frei verfügbar (Quelle [7]); das TUM-Whitepaper
war zum Zugriffsdatum noch nicht öffentlich auffindbar.

---

## 1. TUM-Studie 2026 (Anlass des Modells)

**Gesichert (mehrere unabhängige Medienquellen, dpa-Meldung vom 30.08.2026):**

| Aspekt | Befund | Konf. |
|---|---|---|
| Art | Whitepaper/Meta-Analyse, Titel laut cleanthinking.de: **„Defossilisierung statt Dekarbonisierung"** (in einem Treffer „Defossilisation statt Dekarbonisation") | B |
| Datenbasis | Systematische Auswertung von **19 Studien / 47 Szenarien** | A (mehrfach) |
| Kernergebnis | BEV reduzieren Lebenszyklus-CO₂ vs. Verbrenner **im Mittel um 41 %** — nicht um 100 %, wie die „Auspuff-Logik" der EU-Flottenregulierung unterstellt | A (mehrfach) |
| Kernkritik | EU misst CO₂ nur am Auspuff („Tailpipe"), ignoriert Rohstoffe, Produktion, Strommix, Recycling → BEV wird regulatorisch als „klimaneutral" gezählt | A |
| Initiator | **TUM-Präsident Thomas Hofmann**; er drängt darauf, die Ergebnisse vor den Beratungen in EP und Rat in die Brüsseler Debatte einzubringen | B |
| Timing/Kontext | Vorstellung laut Berichten „am Dienstag" in München (Medienberichte ab 30.08.2026 → vermutlich **01.09.2026**; ein Aggregator nennt abweichend den 27.08.). Im **November 2026** stimmen EU-Parlament und Rat über das **„Automobil-Paket"** ab | B/C |
| Weiterer Befund | Auch 2030 („in vier Jahren") besteht die Gesamtflotte noch zu ~78 % aus Verbrennern → Bestandsflotte als Argument für Defossilisierung (E-Fuels/Kraftstoffpfad) | B |

**Nicht belegbar (→ `gaps`):**

- **Autorennamen:** Keine Quelle nennt die verantwortlichen Professoren namentlich.
  TUM-Professuren Lienkamp (Fahrzeugtechnik) und Wachtmeister (Verbrennungsmotoren, emeritiert)
  liegen thematisch nahe, eine Beteiligung ist aber **nicht belegt**.
- **Spannbreite der 47 Szenarien (min/max Reduktion):** In keiner zugänglichen
  Quelle beziffert. Nur der Mittelwert (−41 %) ist öffentlich.
- **Welche Annahmen die Szenarien unterscheiden:** Qualitativ berichtet
  (Strommix Kohle vs. Wind, energieintensive Rohstoffe der Batteriezelle);
  quantitative Annahmen (Lebensfahrleistung, statischer vs. dynamischer Strommix)
  nicht zugänglich — das Whitepaper-PDF war zum Zugriffsdatum nicht auffindbar.

**Kritik AN der Studie (cleanthinking.de, „Klimaneutrales Elektroauto: Auto-Lüge, die keine ist"):**
Der Artikel argumentiert, ein **41-%-Vorteil, der mit jedem Jahr wächst** (sinkender
Strommix-Faktor, sauberere Batterieproduktion), sei keine „Auto-Lüge"; der Frame der
Bild-Berichterstattung („E-Auto-Lüge") verdrehe das Ergebnis der Studie, die den
Klimavorteil des BEV ja bestätigt. Volltext war per Egress-Block nicht abrufbar;
Wiedergabe aus Suchtreffern (Konf. B). Der Kontrast zur ICCT-Methodik (Abschnitt 2)
legt nahe, dass der TUM-Mittelwert stark von Studien mit **statischem Strommix und
kurzer Lebensfahrleistung** (~150.000 km) geprägt ist — das ist aber meine
**Interpretation, nicht belegt** (Konf. C).

---

## 2. ICCT-Studie Juli 2025 (Gegenpol)

Report: *„Life-cycle greenhouse gas emissions from passenger cars in the European
Union: A 2025 update and key factors to consider"* (ICCT, 09.07.2025, ID-392).

| Größe | Wert | Konf. |
|---|---|---|
| BEV Lebenszyklus (EU-Mix) | **63 g CO₂e/km** | A (Report + mehrere Medien) |
| Benziner Lebenszyklus | **235 g CO₂e/km** → BEV **−73 %** | A |
| Diesel Lebenszyklus | **234 g CO₂e/km** | B |
| Hybrid (HEV) | −20 % vs. Benziner | B |
| Plug-in-Hybrid (PHEV) | −30 % vs. Benziner | B |
| BEV mit 100 % EE-Strom | **52 g CO₂e/km** → **−78 %** | A |
| Produktionsemissionen BEV | **~+40 %** gegenüber Verbrenner (Batterie) | A |
| Break-even | nach **~17.000 km** (erste 1–2 Jahre) amortisiert | A |
| Nutzungsannahme | **20 Jahre / 240.000 km** Fahrzeuglebensdauer | A |
| Strommix-Annahme | **dynamischer, projizierter EU-Mix 2025–2044** (Fahrzeug-Zulassung 2025), nicht der heutige Mix | A |
| Verbräuche | Reale Nutzungsdaten statt WLTP-Normwerte | B |
| Systemgrenze | Fahrzeug- und Batterieproduktion inkl. Recycling, Kraftstoff-/Stromvorketten, Betrieb, Wartung | B |
| Vergleich zu ICCT 2021 | BEV-Lebenszyklusemissionen **24 % niedriger** als 2021 geschätzt („cleaner faster than expected") | B |

**Zentrale Erkenntnis für das Modell:** Der Unterschied TUM −41 % vs. ICCT −73 %
erklärt sich fast vollständig über drei Stellhebel: (1) **Lebensfahrleistung**
(150.000 vs. 240.000 km), (2) **statischer vs. dynamisch sinkender Strommix**,
(3) Batterieproduktions-Annahme (alte IVL-Werte vs. aktuelle ~55 kg/kWh).
Beide Ergebnisse können mit demselben Modell reproduziert werden — genau das
sollte das Modell zeigen.

---

## 3. Strommix-Emissionsfaktoren (g CO₂e/kWh)

### Deutschland (UBA, amtlich — Konf. A)

| Jahr | g CO₂/kWh | Anmerkung |
|---|---|---|
| 2022 | **434** (revidiert z. T. 433) | Anstieg wg. Gaskrise/Kohle |
| 2023 | **380** | |
| 2024 | **363** | UBA: „CO₂-Emissionen pro Kilowattstunde Strom 2024 gesunken" |
| 2025 | **344** | UBA: „2025 nur leicht gesunken" — **beide Vorgabewerte des Auftrags bestätigt** |

Hinweis: UBA-Werte sind CO₂ (Verbrennung, inländischer Verbrauchsmix), **keine
volle LCA** (ohne Anlagenbau-Vorketten). Für LCA-Konsistenz mit ICCT ggf.
+~10–15 % ansetzen (nicht belegt, → `gaps`).

### Projektion Deutschland (Konf. C)

- **2030: ~113 g CO₂/kWh** — Prognose auf NECP-Basis (80-%-EE-Ziel), Einzeltreffer.
- 2035: kein belastbarer Wert gefunden (→ `gaps`); qualitativ: bei Zielerreichung
  deutlich unter 100 g.

### EU und international

| Mix | Wert | Jahr | Quelle/Konf. |
|---|---|---|---|
| EU-27 Erzeugung | **213 g CO₂/kWh** | 2024 | Ember via Carbon Brief, Konf. B |
| EU-27 (EEA-Indikator) | −9 % ggü. 2023; IEA-Prognose 175 → 140 g (2025→2026) | 2024–2026 | Konf. B |
| China | **560 g CO₂/kWh** (−4,1 % ggü. 2023); IEA: 565 (2024) → 505 (2026) | 2024 | Ember/IEA, Konf. B |
| Welt | **473 g CO₂/kWh** | 2024 | Ember, Konf. B |

Achtung: Ein Suchtreffer nannte „EU-27 334 g/kWh (2024)" — inkonsistent mit
Ember/EEA/IEA (213/175 g); vermutlich veraltete oder anders abgegrenzte Zahl.
**Nicht verwenden.**

### LCA einzelner Erzeugungsarten (Konf. B)

| Technologie | g CO₂e/kWh (LCA) |
|---|---|
| Steinkohle | **~830** (Spanne 790–1.080) |
| Wind (onshore) | **8–16** |
| Photovoltaik | **20–55** (Fraunhofer ISE 2025: 40–55; ältere/globale Spannen 15–28) |
| „Ökostrom"-Mix fürs Modell | **~10–40** (abgeleitet aus Wind/PV-Mix, Konf. C) |

---

## 4. Batterieproduktion (kg CO₂e/kWh Kapazität)

| Wert | Kontext | Quelle | Konf. |
|---|---|---|---|
| **150–200** | Stand 2017 („Schwedenstudie I") | IVL 2017 | A (mehrfach, historisch) |
| **61–106** | Update 2019; mit intransparenten (chinesischen) Datenquellen bis **146** | IVL 2019 | A (mehrfach) |
| **~55** | „aktuell" (2025); **Quelle des electrive-Artikels vom 14.08.2025 ist ein Whitepaper der Beratung P3 Group** — nicht Fraunhofer | P3/electrive | B |
| **~20** | erreichbar bei optimierten Prozessen/sauberem Strom (P3: saubere Prozesskette −⅓; LFP −60 % Energiebedarf vs. NMC) | P3/electrive | C |

**Chemie- und Standort-Differenzierung (Konf. B):**

- Rangfolge Fußabdruck: **LFP < NMC811 < NMC622 < NMC111**.
- China, Zell-Ebene (datengetriebene Studie): **LFP ~49 kg**, **NMC811 ~63 kg CO₂e/kWh**.
- Regionalspannen (Nature Communications 2024, Zellproduktion):
  LFP: Norwegen 27–64, Deutschland 60–98, China 90–127 kg CO₂e/kWh;
  NMC811: Norwegen 27–111, Deutschland 51–134, China 71–155 kg CO₂e/kWh;
  globale Referenz-Mittelwerte: LFP 107, NMC811 94 kg CO₂e/kWh.
- Verlagerung der Produktion nach Frankreich: bis −60 %; Italien/Deutschland: ~−40 %.
- Material-Vorketten (Nickel, Lithium) dominieren die Varianz stärker als der
  Produktionsstandort.

**Modell-Empfehlung:** mid **55**, min **30** (EU/EE-Strom, LFP), max **105**
(China, ungünstige Kette). Historische Sensitivität (IVL 2017: 175) nur für die
„Warum ältere Studien schlechter aussehen"-Story verwenden.

---

## 5. Fahrzeugproduktion (t CO₂e)

**Belegt (VDI-Ökobilanz 2023 + Carwow-Aufbereitung, Konf. B):**

- VDI-Ökobilanz 2023 (Kompaktklasse, 200.000 km, DE):
  Lebenszyklus gesamt **BEV 24,2 t / Diesel 33 t / Benziner 37 t CO₂e**;
  Break-even BEV ab **~90.000 km** (mit deutschem Strommix von damals, ~2022/23).
- **Antriebsstrang-Produktion BEV: 8,1–10,1 t CO₂e** je nach Batteriegröße (VDI).
- Beispielrechnung (VW ID.3 Pro S, **82-kWh**-Batterie): Antriebsstrang-Produktion
  **10,12 t CO₂e**, davon Batterie **8,37 t (83 %)** — die Carwow/VDI-Zahlen aus dem
  Auftrag sind **bestätigt**, beziehen sich aber auf den **Antriebsstrang, nicht das
  Gesamtfahrzeug**. Impliziert ~102 kg CO₂e/kWh (IVL-2019-Niveau, konservativ vs. P3 ~55).
- Relation ICCT 2025: **BEV-Gesamtproduktion ≈ +40 %** vs. Verbrenner (Konf. A).

**Nicht direkt belegt (→ `gaps`):**

- **Verbrenner Kompaktklasse, Gesamtfahrzeug-Produktion (~5–8 t?)**: Die Spanne aus
  dem Auftrag konnte in dieser Session **nicht** an einer Primärquelle verifiziert
  werden. Absolute Gesamtfahrzeug-Produktionswerte (Glider + Antrieb) wurden in den
  zugänglichen Zusammenfassungen nicht beziffert.
- **BEV ohne Batterie**: ebenfalls kein direkter Beleg; näherungsweise
  „Verbrenner-Produktion minus Motor/Getriebe plus E-Motor/Leistungselektronik ≈
  ähnliche Größenordnung wie Verbrenner" (Konf. C, Ableitung).

**Pragmatischer Modellansatz:** Verbrenner-Produktion P als freien Parameter mit
Spanne 5–8 t (C, unverifiziert) ansetzen und BEV-Produktion als
`P + Batteriekapazität × Batteriefaktor` modellieren; Konsistenz-Check gegen die
ICCT-Relation ×1,4 und die VDI-Totale.

---

## 6. Reale Verbräuche

| Parameter | Wert | Quelle | Konf. |
|---|---|---|---|
| BEV, ADAC Ecotest (inkl. **Ladeverluste**, AC 22 kW, 23 °C) | Spanne aller Testwagen **15,5–29,7 kWh/100 km** (2025); Kompakt-/Mittelklasse typ. **16–20** | ADAC | B |
| Ladeverluste | im Ecotest enthalten; bis zu ~20 % möglich (Winter/AC); Beispiel BMW iX: 109,3 kWh geladen für 94,8 kWh netto (~15 %) | ADAC | B |
| Benziner real | **~7,9 l/100 km** (Spritmonitor-Flottenmittel); OBFCM/EU: real **+23,7 %** über WLTP | Spritmonitor/EU-OBFCM | B |
| Diesel real | **~6,3 l/100 km** | Spritmonitor | B |

Modellwert BEV Kompaktklasse: mid **18,5 kWh/100 km** (min 15,5 / max 24,5) — Mitte
der Ecotest-Kompaktspanne, Konf. C (Ableitung aus B-Daten).

---

## 7. Kraftstoff-Emissionsfaktoren (kg CO₂e/Liter)

| Faktor | Wert | Beleg | Konf. |
|---|---|---|---|
| Benzin (E10) **TTW** | **2,37** | Helmholtz + mehrere DE-Rechner | B |
| Benzin pur (E0) TTW | ~2,42 | Einzeltreffer | C |
| E5/E10-Differenzierung | **nicht separat belegbar** in dieser Session | — | Lücke |
| Diesel **TTW** | **2,65** | mehrere DE-Quellen | B |
| Diesel **WTW** (DIN EN 16258/GLEC) | **3,24** | mehrfach (carbon-connect, PTV, Verkehrsrundschau) | A |
| Benzin **WTW** | **~2,8–3,3** (TTW +15–25 % Vorkette); exakter Normwert EN 16258 nicht auffindbar | abgeleitet | C |

Konsistenz-Check: Diesel 3,24/2,65 = +22 % Vorkette → Benzin 2,37 × 1,22 ≈ **2,89**
als Modell-Mittelwert plausibel (Ableitung, Konf. C).

---

## 8. Fahrleistung und Nutzungsdauer (der zentrale Hebel)

| Parameter | Wert | Quelle | Konf. |
|---|---|---|---|
| Ø-Jahresfahrleistung Pkw DE 2023 | **12.320 km** (−1,2 % ggü. 2022) | KBA-Inländerfahrleistung | A |
| davon Benziner / Diesel / alternative Antriebe | 9.580 / 17.187 / 15.852 km | KBA 2023 | A |
| Ø-Nutzungsdauer in DE (bis Abmeldung/Export) | **~9,5 Jahre** | Statista/Sekundär | C |
| Ø-Lebensdauer Fahrzeug gesamt | **~12 Jahre** (DE-Sicht); ICCT setzt EU-weit **20 Jahre** an (inkl. Weiternutzung/Gebrauchtmarkt) | Sekundär / ICCT | C / A |
| Lebensfahrleistung: konservative Studien (TUM-artig) | **~150.000–180.000 km** — für die 19 TUM-Studien **nicht einzeln belegt**, typischer Wert älterer LCAs | Ableitung | C |
| Lebensfahrleistung: ICCT | **240.000 km** | ICCT 2025 | A |
| Ø-Alter bei Löschung DE | kein belastbarer amtlicher Wert gefunden | — | Lücke |

**Modellhinweis:** 12.320 km/Jahr × 20 Jahre ≈ 246.000 km — die ICCT-Annahme ist
mit der KBA-Statistik konsistent, wenn man das *gesamte* Fahrzeugleben (inkl.
Zweit-/Drittnutzung, auch im Ausland) zählt. Kürzere Annahmen (150.000 km) bilden
nur die Erstnutzung ab und verschlechtern die BEV-Bilanz mechanisch, weil die
Produktions-„Hypothek" auf weniger km verteilt wird. **Dieser eine Parameter erklärt
einen Großteil der Differenz −41 % vs. −73 %.**

---

## 9. End-of-Life / Recycling (hohe Unsicherheit — als solche ausweisen)

- **Duesenfeld-Verfahren: ~8,1 t CO₂-Ersparnis pro Tonne recycelter Batterien**
  vs. Primärgewinnung (Hersteller-Angabe, Konf. C).
  Grobe Ableitung: 82-kWh-Pack ≈ ~0,5 t → Gutschrift grob **~2–4 t CO₂e pro Pack**
  (Konf. C, nur Größenordnung; überschneidet sich definitorisch mit künftig
  sinkenden Produktionsfaktoren — Doppelzählungsgefahr!).
- **>90 % Rohstoff-Rückgewinnung** technisch möglich (Sekundärquellen, Konf. C).
- **Second Life vor Recycling** spart langfristig mehr THG als sofortiges Recycling
  (Studie zu Kalifornien: 55,8 vs. 48,3 Mt CO₂e bis 2050; electrive 30.07.2025, Konf. C);
  Second-Life verlängert Nutzung um ~10–12 Jahre.
- ICCT 2025 **enthält** Recycling bereits in der Systemgrenze; VDI 2023 ebenfalls
  (Ökobilanz „Produktion bis Recycling"). → Im Modell EOL nur als **Sensitivität
  ±1–3 t** auf die BEV-Produktionsemissionen ansetzen, nicht als eigener harter Term.
- Ein belastbarer konsolidierter Wert „t CO₂e Gutschrift pro Fahrzeug" existiert in
  den zugänglichen Quellen **nicht** → `gaps`.

---

## 10. Konsolidierte Modellparameter

```json
{
  "model_params": {
    "reduktion_bev_vs_benziner_lca": {"value": 57, "min": 41, "max": 78, "unit": "%", "source": "TUM 2026 (41) / ICCT 2025 (73; 78 bei 100% EE)", "confidence": "B", "note": "Spannweite der Kontroverse; Mid = arithm. Mitte, kein eigener Beleg. Haupthebel: Lebensfahrleistung + Strommix-Dynamik."},
    "lca_bev_eu_mix": {"value": 63, "min": 52, "max": 63, "unit": "g CO2e/km", "source": "ICCT 2025 [7]", "confidence": "A", "note": "Dynamischer EU-Mix 2025-2044; min = 100% EE-Szenario (52)."},
    "lca_benziner": {"value": 235, "min": 234, "max": 235, "unit": "g CO2e/km", "source": "ICCT 2025 [7]", "confidence": "A", "note": "Diesel 234 g/km; HEV -20%, PHEV -30% vs. Benziner."},
    "strommix_de_2025": {"value": 344, "min": 344, "max": 363, "unit": "g CO2/kWh", "source": "UBA [10][11]", "confidence": "A", "note": "2022: 434, 2023: 380, 2024: 363, 2025: 344. Verbrauchsmix, keine volle LCA-Vorkette."},
    "strommix_de_2030_projektion": {"value": 113, "min": 90, "max": 160, "unit": "g CO2/kWh", "source": "NECP-basierte Prognose [13]", "confidence": "C", "note": "Einzeltreffer; min/max eigene Unsicherheitsspanne. 2035 nicht belegt."},
    "strommix_eu27_2024": {"value": 213, "min": 175, "max": 213, "unit": "g CO2/kWh", "source": "Ember/Carbon Brief [14], IEA [15]", "confidence": "B", "note": "IEA-Prognose 2025: 175, 2026: 140. Abweichender Treffer '334' verworfen."},
    "strommix_china_2024": {"value": 560, "min": 505, "max": 565, "unit": "g CO2/kWh", "source": "Ember [16] / IEA [15]", "confidence": "B", "note": "min = IEA-Prognose 2026; Welt-Mittel 2024: 473."},
    "strom_kohle_lca": {"value": 830, "min": 790, "max": 1080, "unit": "g CO2e/kWh", "source": "Sekundärquellen LCA [17]", "confidence": "B", "note": "Steinkohle, Lebenszyklus."},
    "strom_wind_lca": {"value": 12, "min": 8, "max": 16, "unit": "g CO2e/kWh", "source": "FA Wind/Sekundär [17]", "confidence": "B", "note": "Onshore, Lebenszyklus."},
    "strom_pv_lca": {"value": 35, "min": 20, "max": 55, "unit": "g CO2e/kWh", "source": "Fraunhofer ISE via Sekundär [17]", "confidence": "B", "note": "Fraunhofer ISE 2025: 40-55; aeltere Quellen 15-28."},
    "batterie_prod_aktuell": {"value": 55, "min": 30, "max": 105, "unit": "kg CO2e/kWh", "source": "P3 Group via electrive 14.08.2025 [18]", "confidence": "B", "note": "min: EU/EE-Strom+LFP, max: China/ungünstig (Nature Comm. [21]: global LFP 107, NMC811 94). Studie ist von P3, NICHT Fraunhofer."},
    "batterie_prod_zukunft": {"value": 20, "min": 15, "max": 35, "unit": "kg CO2e/kWh", "source": "P3 via electrive [18]", "confidence": "C", "note": "Optimierte Prozesse + saubere Prozesskette; min/max eigene Spanne."},
    "batterie_prod_historisch_ivl2017": {"value": 175, "min": 150, "max": 200, "unit": "kg CO2e/kWh", "source": "IVL 2017 [19]", "confidence": "A", "note": "Nur für Sensitivität 'alte Studien'. IVL 2019: 61-106 (bis 146 inkl. intransparenter Quellen) [20]."},
    "batterie_kapazitaet_kompakt": {"value": 60, "min": 45, "max": 82, "unit": "kWh", "source": "Ableitung (max = VW ID.3 Pro S, VDI-Beispiel [23])", "confidence": "C", "note": "Freier Modellparameter."},
    "fzg_prod_verbrenner_gesamt": {"value": 6.5, "min": 5, "max": 8, "unit": "t CO2e", "source": "NICHT VERIFIZIERT (Auftrags-Vorannahme)", "confidence": "C", "note": "LÜCKE: kein Primärbeleg gefunden. Konsistenz-Check: ICCT-Relation BEV-Produktion = +40% [7]."},
    "antrieb_prod_bev_vdi": {"value": 9.1, "min": 8.1, "max": 10.1, "unit": "t CO2e", "source": "VDI-Ökobilanz 2023 [22][23]", "confidence": "B", "note": "NUR Antriebsstrang inkl. Batterie, nicht Gesamtfahrzeug. Beispiel 82 kWh: 10,12 t, davon Batterie 8,37 t (83%)."},
    "prod_mehremission_bev_faktor": {"value": 1.4, "min": 1.3, "max": 1.5, "unit": "Faktor", "source": "ICCT 2025 [7]", "confidence": "B", "note": "BEV-Gesamtproduktion ca. +40% vs. Verbrenner; min/max eigene Spanne."},
    "lca_gesamt_vdi_200tkm": {"value": 24.2, "min": 24.2, "max": 37, "unit": "t CO2e", "source": "VDI 2023 [22]", "confidence": "B", "note": "Kompaktklasse, 200.000 km: BEV 24,2 / Diesel 33 / Benziner 37 t. Break-even BEV ~90.000 km (DE-Mix ~2022)."},
    "verbrauch_bev": {"value": 18.5, "min": 15.5, "max": 24.5, "unit": "kWh/100km", "source": "ADAC Ecotest [24][25]", "confidence": "B", "note": "Inkl. Ladeverluste (AC 22 kW, 23 Grad C). Gesamtspanne aller Testwagen 15,5-29,7."},
    "ladeverluste": {"value": 15, "min": 10, "max": 20, "unit": "%", "source": "ADAC [25]", "confidence": "C", "note": "Bereits in verbrauch_bev enthalten - nicht doppelt ansetzen!"},
    "verbrauch_benziner": {"value": 7.9, "min": 7.0, "max": 8.5, "unit": "l/100km", "source": "Spritmonitor via [26]", "confidence": "B", "note": "Real ~+23,7% über WLTP (EU-OBFCM 2024)."},
    "verbrauch_diesel": {"value": 6.3, "min": 5.5, "max": 7.0, "unit": "l/100km", "source": "Spritmonitor via [26]", "confidence": "B", "note": ""},
    "ef_benzin_ttw": {"value": 2.37, "min": 2.33, "max": 2.42, "unit": "kg CO2/l", "source": "Helmholtz [27]", "confidence": "B", "note": "E10; E0 ~2,42. E5/E10-Differenzierung nicht belegt."},
    "ef_benzin_wtw": {"value": 2.89, "min": 2.8, "max": 3.3, "unit": "kg CO2e/l", "source": "Ableitung TTW +22% (analog Diesel EN 16258)", "confidence": "C", "note": "Exakter EN-16258-Normwert für Benzin nicht auffindbar (LÜCKE)."},
    "ef_diesel_ttw": {"value": 2.65, "min": 2.65, "max": 2.65, "unit": "kg CO2/l", "source": "mehrere DE-Quellen [27][28]", "confidence": "B", "note": ""},
    "ef_diesel_wtw": {"value": 3.24, "min": 3.1, "max": 3.4, "unit": "kg CO2e/l", "source": "DIN EN 16258/GLEC [28][29]", "confidence": "A", "note": "Mehrfach konsistent belegt. Impliziert +22% Vorkette."},
    "jahresfahrleistung_pkw_de": {"value": 12320, "min": 9580, "max": 17187, "unit": "km/a", "source": "KBA 2023 [30]", "confidence": "A", "note": "min = Benziner-Mittel, max = Diesel-Mittel; alternative Antriebe 15.852."},
    "lebensfahrleistung": {"value": 200000, "min": 150000, "max": 240000, "unit": "km", "source": "Spanne: ältere LCAs vs. ICCT [7] / VDI [22]", "confidence": "C", "note": "DER zentrale Hebel. ICCT: 240.000 km/20 Jahre (konsistent mit KBA 12.320 km/a x 20a = 246.000). VDI rechnet 200.000. 150.000 fuer TUM-Studien nicht einzeln belegt."},
    "nutzungsdauer": {"value": 15, "min": 9.5, "max": 20, "unit": "Jahre", "source": "Sekundär (DE-Erstnutzung ~9,5 a; Gesamtleben ~12 a) / ICCT 20 a [7]", "confidence": "C", "note": "min = Nutzung in DE bis Abmeldung/Export; max = ICCT-Gesamtlebensdauer EU."},
    "breakeven_km": {"value": 50000, "min": 17000, "max": 90000, "unit": "km", "source": "ICCT [7] (17.000, dyn. EU-Mix 2025ff) vs. VDI [22] (90.000, DE-Mix ~2022)", "confidence": "B", "note": "Modell-Output zum Gegenprüfen, kein Input. Mid ist keine Quelle, nur Platzhalter."},
    "eol_recycling_gutschrift": {"value": -2, "min": -4, "max": 0, "unit": "t CO2e", "source": "Ableitung aus Duesenfeld 8,1 t CO2/t Batterie [31]", "confidence": "C", "note": "HOHE UNSICHERHEIT, nur Sensitivität. In ICCT/VDI-Systemgrenzen bereits enthalten - Doppelzählungsgefahr."}
  },
  "gaps": [
    "TUM 2026: Autorennamen des Whitepapers nicht belegt (nur Initiator Hofmann); Whitepaper-PDF nicht öffentlich auffindbar (Stand 30.08.2026)",
    "TUM 2026: Spannbreite (min/max) der 47 Szenarien nirgends beziffert - nur Mittelwert -41 %",
    "TUM 2026: quantitative Annahmen der 19 Studien (Lebensfahrleistung, Strommix statisch/dynamisch) nicht zugänglich",
    "TUM 2026: exaktes Vorstellungsdatum widersprüchlich (Berichte 'Dienstag', vermutlich 01.09.2026; ein Aggregator: 27.08.)",
    "Verbrenner-Gesamtfahrzeug-Produktion (5-8 t CO2e) nicht an Primärquelle verifiziert; ebenso BEV-Produktion ohne Batterie",
    "Exakter Well-to-Wheel-Normwert Benzin nach DIN EN 16258 nicht auffindbar (nur Diesel 3,24 bestätigt); Benzin-WTW ist Ableitung",
    "E5- vs. E10-Emissionsfaktor separat nicht belegt",
    "DE-Strommix-Projektion 2035 nicht belegt; 2030er-Wert (113 g/kWh) nur Einzeltreffer",
    "LCA-Aufschlag auf UBA-Strommix-Werte (Vorkette Anlagenbau, ~+10-15 %) nicht quantifiziert belegt",
    "Amtliches Durchschnittsalter Pkw bei endgültiger Löschung (KBA) nicht gefunden - nur Sekundärwerte 9,5/12 Jahre",
    "Konsolidierte EOL-/Recycling-Gutschrift in t CO2e pro Fahrzeug: kein belastbarer Quellenwert, nur Ableitung aus Hersteller-Angabe (Duesenfeld)",
    "ADAC-Ecotest-Flottendurchschnitt BEV als einzelner Mittelwert nicht gefunden - nur Spannen (15,5-29,7 kWh/100km)",
    "Volltexte generell nicht abrufbar (Egress-Block u.a. cleanthinking.de, developer.myptv.com) - alle Werte aus Suchtreffer-Zusammenfassungen"
  ]
}
```

---

## 11. Quellenliste

Alle Zugriffe am **2026-08-30** über Suchmaschinen-Zusammenfassungen (Volltexte
per Egress-Policy geblockt, siehe Abschnitt 0). Konfidenz bezieht sich auf die
Quelle als Institution, nicht auf jede Einzelzahl.

| # | Quelle | URL | Konf. |
|---|---|---|---|
| 1 | cleanthinking.de: „Klimaneutrales Elektroauto: Auto-Lüge, die keine ist" (TUM-Studie, Kritik) | https://www.cleanthinking.de/klimaneutrales-elektroauto-tum-studie/ | B |
| 2 | dpa-Meldung (via klamm.de): „Studie: EU-Klimapolitik bei Autos basiert auf irrtümlichen Annahmen" | https://www.klamm.de/news/studie-eu-klimapolitik-bei-autos-basiert-auf-irrtuemlichen-annahmen-21N1788022630306.html | B |
| 3 | ad-hoc-news: „TUM-Studie kritisiert EU-Klimapolitik bei Autos als fehlgeleitet" | https://www.ad-hoc-news.de/politik/tum-studie-kritisiert-eu-klimapolitik-bei-autos-als-fehlgeleitet/70022094 | C |
| 4 | Tichys Einblick: „Brüssels Auspuff-Rechentrick …" (Sekundärbericht, politisch gefärbt) | https://www.tichyseinblick.de/daili-es-sentials/studie-elektroautos-nicht-klimaneutral/ | C |
| 5 | ICCT-Publikationsseite: „Life-cycle GHG emissions from passenger cars in the EU: A 2025 update" | https://theicct.org/publication/electric-cars-life-cycle-analysis-emissions-europe-jul25/ | A |
| 6 | ICCT-Pressemitteilung (DE, PDF, 09.07.2025) | https://theicct.org/wp-content/uploads/2025/07/ICCT-Press-Release-EV-LCA-study-de.pdf | A |
| 7 | ICCT-Report ID-392 (PDF, Juli 2025) | https://theicct.org/wp-content/uploads/2025/07/ID-392-%E2%80%93-Life-cycle-GHG_report_final.pdf | A |
| 8 | electrive: „ICCT-Studie: Klimavorteil von E-Autos wächst schneller als erwartet" (09.07.2025) | https://www.electrive.net/2025/07/09/icct-studie-klimavorteil-von-e-autos-waechst-schneller-als-erwartet/ | B |
| 9 | ecomento zur ICCT-Studie (09.07.2025) | https://ecomento.de/2025/07/09/icct-studie-elektroauto-am-saubersten-wird-schneller-klimafreundlich-als-gedacht/ | B |
| 10 | UBA: „CO₂-Emissionen pro Kilowattstunde Strom 2024 gesunken" (363 g) | https://www.umweltbundesamt.de/themen/co2-emissionen-pro-kilowattstunde-strom-2024 | A |
| 11 | UBA: „CO₂-Emissionen pro Kilowattstunde Strom 2025 nur leicht gesunken" (344 g) | https://www.umweltbundesamt.de/themen/co2-emissionen-pro-kilowattstunde-strom-2025-nur | A |
| 12 | UBA Climate Change 13/2025: „Entwicklung der spezifischen THG-Emissionen des deutschen Strommix 1990–2025" (PDF; 2022: 434, 2023: 380) | https://www.umweltbundesamt.de/sites/default/files/medien/11850/publikationen/13_2025_cc.pdf | A |
| 13 | stromauskunft.de: Strommix Deutschland, NECP-Prognose 2030 ~113 g/kWh | https://www.stromauskunft.de/strompreise/strommix-in-deutschland/ | C |
| 14 | Carbon Brief (Ember-Daten): EU-Stromemissionsintensität 213 g CO₂/kWh 2024 | https://www.carbonbrief.org/eus-solar-and-wind-growth-pushes-fossil-fuel-power-to-lowest-level-in-40-years/ | B |
| 15 | IEA Electricity 2025 – Emissions (EU 175→140 g; China 565→505 g) | https://www.iea.org/reports/electricity-2025/emissions | B |
| 16 | Ember Global Electricity Review 2025 (China 560 g, Welt 473 g, 2024) | https://ember-energy.org/latest-insights/global-electricity-review-2025/major-countries-and-regions/ | B |
| 17 | Wikipedia/FA Wind & Solar/Tech-for-Future: LCA-Emissionen Stromerzeugung (Steinkohle ~830, Wind 8–16, PV 20–55) | https://de.wikipedia.org/wiki/CO2-Emissionen_der_Stromerzeugung_nach_Art_der_Erzeugung | B |
| 18 | electrive (14.08.2025): „So viel CO2 stößt die Batterieproduktion wirklich aus" (P3-Whitepaper: ~55 → ~20 kg CO₂e/kWh) | https://www.electrive.net/2025/08/14/so-viel-co2-stoesst-die-batterieproduktion-wirklich-aus/ | B |
| 19 | IVL 2017 via Luzerner Zeitung / Tagesspiegel („Schwedenstudie", 150–200 kg) | https://www.tagesspiegel.de/wissen/elektroautos-sind-viel-umweltfreundlicher-als-angenommen-4124932.html | A |
| 20 | electrive (02.12.2019): „Schwedenstudie II" (IVL 2019: 61–106, bis 146 kg) | https://www.electrive.net/2019/12/02/schwedenstudie-ii-die-co2-emissionen-bei-der-batterieproduktion-sinken/ | A |
| 21 | Nature Communications (2024): „Carbon footprint distributions of lithium-ion batteries and their materials" (LFP/NMC811-Regionalspannen) | https://www.nature.com/articles/s41467-024-54634-y | B |
| 22 | VDI: „VDI-Ökobilanz für Pkw-Antriebe" (2023; BEV 24,2 t / Diesel 33 t / Benziner 37 t; Break-even 90.000 km; Antrieb 8,1–10,1 t) | https://www.vdi.de/themen/mobilitaet/vdi-oekobilanz-fuer-pkw-antriebe-1 | B |
| 23 | Carwow-Ratgeber: „CO2-Bilanz Elektroauto vs. Verbrenner" (ID.3 82 kWh: Antrieb 10,12 t, Batterie 8,37 t) | https://www.carwow.de/ratgeber/verkehr/co2-ausstoss-antriebsarten | B |
| 24 | ADAC: „Stromverbrauch Elektroautos im ADAC Test" (Spannen inkl. Ladeverluste) | https://www.adac.de/rund-ums-fahrzeug/elektromobilitaet/elektroauto/stromverbrauch-elektroautos-adac-test/ | B |
| 25 | autokostencheck/ecomento zu ADAC-Ecotest 2025/2026 (15,5–29,7 kWh; Ladeverluste bis 20 %; BMW iX 109,3/94,8 kWh) | https://ecomento.de/2026/01/27/adac-testet-elektroautos-so-hoch-sind-reichweite-und-verbrauch-wirklich/ | B |
| 26 | fahrzeugschein.de/Spritmonitor-Auswertung: Realverbrauch Benziner ~7,9, Diesel ~6,3 l/100 km; OBFCM +23,7 % vs. WLTP | https://www.fahrzeugschein.de/blog/artikel/spritverbrauch-berechnen | B |
| 27 | Helmholtz: „Wie viel CO2 steckt in einem Liter Benzin?" (2,37 kg/l) | https://www.helmholtz.de/newsroom/artikel/wie-viel-co2-steckt-in-einem-liter-benzin/ | B |
| 28 | carbon-connect: „DIN EN 16258: Treibhausgasemissionen Spedition und Logistik" (Diesel WTW 3,24 kg/l) | https://www.carbon-connect.ch/resources/blog/treibhausgasemissionen-spedition-und-logistik | B |
| 29 | PTV Logistics: EN-16258-Emissionsfaktoren (Routing-API-Doku) — **Volltext per Egress geblockt** | https://developer.myptv.com/en/documentation/routing-api/concepts/emissions/en-16258 | B |
| 30 | KBA-Pressemitteilung 21/2024: „Inländerfahrleistung in 2023" (Pkw Ø 12.320 km/a) | https://www.kba.de/DE/Presse/Pressemitteilungen/Allgemein/2024/pm21_2024_Entw_Fahrleistung.html | A |
| 31 | electrive (30.07.2025): „Alte E-Auto-Batterien: Ist Recycling oder Second Life besser?" + Duesenfeld-Angabe 8,1 t CO₂/t (via energyload.eu) | https://www.electrive.net/2025/07/30/alte-e-auto-batterien-ist-recycling-oder-second-life-besser/ | C |
