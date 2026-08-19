---
title: "Was kostet ein klimaneutrales Stromsystem wirklich? Ein Faktencheck für Deutschland und die EU"
subtitle: "Eine kritische Prüfung der GES-Studie 'Der klimaneutrale Strommix der Zukunft' mit eigener Neuberechnung der Kostenannahmen"
author: ""
date: "2026-08-01"
status: "Grundlage für HTML-Simulation / interaktiven Blogpost"
scope: "Deutschland / EU"
language: "de"
tags: [energiewende, stromsystemkosten, lcoe, kernkraft, photovoltaik, wind, eu-energiepolitik]
---

# Was kostet ein klimaneutrales Stromsystem wirklich?

> **Hinweis für die spätere Umsetzung:** Dieses Dokument ist die inhaltliche und daten­technische Grundlage für eine interaktive HTML-Simulation. Alle Zahlen sind mit Quellen und Berechnungsmethodik versehen. Am Ende befindet sich ein maschinenlesbarer Datenblock (JSON), der direkt als Datengrundlage für Sliders/Charts in der Simulation dienen kann. Textabschnitte sind so geschrieben, dass sie größtenteils 1:1 als Blog-Copy übernommen werden können.

---

## 1. Ausgangslage

Im Juli 2026 veröffentlichte der Ulmer Verein **Global Energy Solutions e.V. (GES)** die Studie *"Der klimaneutrale Strommix der Zukunft"*. Sie vergleicht vier Szenarien für ein klimaneutrales deutsches Stromsystem im Zieljahr 2045 (950 TWh Jahresbedarf) und kommt zu einem auf den ersten Blick eindeutigen Ergebnis: Ein technologieoffenes System mit Kernkraft ("Kostenminimum") sei mit 125 €/MWh mehr als doppelt so günstig wie ein vollständig erneuerbares System (321 €/MWh).

Diese Studie eignet sich hervorragend als Fallbeispiel dafür, wie stark das Ergebnis eines "neutralen" Kostenvergleichs von den zugrunde gelegten Annahmen abhängt – und wie wichtig es ist, diese Annahmen mit realen Marktdaten zu prüfen, bevor man sie für energiepolitische Schlussfolgerungen heranzieht. Genau das ist Ziel dieses Beitrags: keine pauschale Verurteilung der Studie, sondern ein nachvollziehbarer, quellenbasierter Annahmen-Check mit Fokus auf Deutschland und die EU.

**Quelle Originalstudie:** Global Energy Solutions e.V., "Der klimaneutrale Strommix der Zukunft: Eine Szenarioanalyse zu den Kosten des zukünftigen deutschen Stromsystems", Juli 2026. [global-energy-solutions.org](https://global-energy-solutions.org/wp-content/uploads/2026/05/DER-KLIMANEUTRALE-STROMMIX-DER-ZUKUNFT-veroeffentlicht-V1.1.pdf)

---

## 2. Wer steht hinter der Studie?

Global Energy Solutions e.V. wurde am 27.08.2020 im Ulmer Rathaus gegründet, initiiert vom FAW/n (Forschungsinstitut für anwendungsorientierte Wissensverarbeitung). Ursprünglicher Fokus des Vereins: grüner Wasserstoff, Methanol und Power-to-X-Importe aus sonnenreichen Weltregionen (ähnlich der Desertec-Idee), in Partnerschaft mit BMZ und GIZ.

Bemerkenswert: Die vorliegende Studie rechnet mit **bewusst konservativen/pessimistischen Annahmen zu Wasserstoffimporten** – ein gewisser Bruch mit der ursprünglichen Vereinsmission. Das Selbstverständnis des Vereins hat sich seither erkennbar Richtung "Plan B der Energiewende" verschoben (so die eigene Positionierung auf der Website), mit stärkerer Offenheit für Kernkraft und CCS.

- Vorstand: Christof von Branconi (Hintergrund: Kraftwerksbau/Energieanlagenindustrie, u. a. Tognum/Rolls-Royce Power Systems, Lurgi), Franz Josef Radermacher (FAW/n), Hans-Peter Sollinger
- Eine explizite Auftraggeber- oder Industriefinanzierung ist in der Studie **nicht ausgewiesen** – hier ist Zurückhaltung geboten, es gibt keinen Beleg für eine konkrete Industrie-Auftragsarbeit.
- Ein zentraler Literaturverweis der Studie stammt von **"WePlanet"** (weplanet-dach.org), einer explizit pro-nuklearen Umwelt-Lobbyorganisation – ein Hinweis auf die inhaltliche Ausrichtung, kein Beweis für Einflussnahme.

---

## 3. Die vier Szenarien im Original

| Szenario | LSCOE (€/MWh) | Installierte Leistung | Charakteristik |
|---|---|---|---|
| 80 % Erneuerbare (Osterpaket) + Erdgas-Peaker | **197** | 542 GW (438 GW fEE) | Kostenoptimaler Osterpaket-Pfad, starker Gas-/Import-Einsatz |
| 80 % Erneuerbare (Osterpaket) + mehr Wasserstoff | **212** | 618 GW (438 GW fEE) | Stärkere H2-Speicherung statt Gas |
| 100 % Erneuerbare | **321** | 1.162 GW (786 GW fEE) | Vollständig erneuerbar, sehr hohe Überkapazität + Wasserstoff |
| Kostenminimum (technologieoffen, inkl. Kernkraft) | **125** | 215 GW (90 GW fEE) | Grundlastfähige CO2-arme Erzeugung dominiert, kaum EE-Zubau |

**LSCOE** = Levelized *System* Cost of Electricity: volkswirtschaftliche Vollkosten inkl. Netzausbau, Speicher, Rückverstromung, Backup-Kapazität – nicht nur reine Erzeugungskosten (LCOE).

Zentrale These der Studie: Nicht die Erzeugungskosten von Wind/PV treiben die Systemkosten, sondern deren Folgekosten (Netzausbau, saisonale Speicherung, Reserveleistung). Empfehlung: "Zwei-Säulen-System" aus fEE plus gesicherter, CO2-armer Grundlast inkl. Kernkraft.

---

## 4. Methodik-Transparenz der Studie (positiv zu werten)

Die Studie legt ihre Annahmen ungewöhnlich offen (Kapitel 2.2 "Nutzen und Grenzen"):

- Basisjahr Last-/Erzeugungsprofile: 2022, skaliert auf 950 TWh
- Energy-Only-Marktmodell, keine Förderlogiken
- Interkonnektor-Kapazität: 20 GW (Deckelung)
- Keine Batteriespeicher, kein Demand Side Management modelliert
- Wasserstoffimporte bewusst nicht als Standardlösung unterstellt
- Netzausbaukosten: linear skaliert nach fEE-Ausbaugrad (top-down, keine räumliche Netzsimulation)
- WACC: 5 %

Diese Transparenz ist positiv zu bewerten – sie macht den folgenden Annahmen-Check erst möglich.

---

## 5. Annahmen-Check: Kostendaten der Studie vs. reale Marktdaten (2025/26)

### 5.1 Berechnungsmethodik

Alle nachfolgenden LCOE-Werte wurden mit derselben Annuitätenmethode berechnet, die die Studie selbst verwendet:

```
CRF (Kapitalwiedergewinnungsfaktor) = r × (1+r)^n / ((1+r)^n − 1)
LCOE = (CAPEX × CRF + CAPEX × Opex%) / (Volllaststunden/1000) + Brennstoffkosten
```

mit r = 5 % (WACC, wie in der Studie), n = technische Nutzungsdauer, Volllaststunden und Opex-% wie in Tabelle 4 der Studie.

### 5.2 Photovoltaik

| Annahme | CAPEX (€/kW) | LCOE (€/MWh) | Quelle |
|---|---|---|---|
| **Studie GES** | 1.500 | **125** | GES-Studie, Tab. 4 (Basis NREL 2024) |
| Freifläche – untere Marktspanne | 600 | 50 | Logic Energy, PV-Marktbericht 2026 |
| Freifläche – obere Marktspanne | 1.000 | 83 | Logic Energy, PV-Marktbericht 2026 |
| Realer Solar-PPA-Preis Q4/2025 (Referenz) | – | ~50 | pv magazine, zitiert nach Logic Energy 2026 |

**Befund: Die Studie überschätzt PV-Kosten um 50–150 %.** Der reale Solar-PPA-Preis deckt sich fast exakt mit der unteren realistischen LCOE-Grenze – ein starkes Validierungssignal.

### 5.3 Wind onshore / offshore

| Technologie | Annahme | CAPEX (€/kW) | LCOE (€/MWh) | Quelle |
|---|---|---|---|---|
| Onshore | Studie GES | 1.749 | 91 | GES-Studie |
| Onshore | Marktspanne unten | 1.600 | 83 | Deutsche WindGuard / BMWK-Bericht 2024 |
| Onshore | Marktspanne oben | 1.900 | 99 | Deutsche WindGuard / BMWK-Bericht 2024 |
| Offshore | Studie GES | 3.500 | 98 | GES-Studie |
| Offshore | Marktspanne unten | 3.000 | 84 | Branchendaten (WAB/BWE) |
| Offshore | Marktspanne oben | 4.500 | 126 | Branchendaten (WAB/BWE) |

**Befund: Wind-Annahmen der Studie sind plausibel** – sie liegen innerhalb der realen Marktspanne. Hier gibt es keinen systematischen Bias.

### 5.4 Kernkraft – 5 aktuelle Referenzprojekte + Mittelwert

| Projekt | Land | CAPEX (€/kW, umgerechnet) | LCOE (€/MWh) | Quelle |
|---|---|---|---|---|
| **Studie GES** | – | 6.000 | **102** | GES-Studie, Tab. 4 (Basis NREL 2024) |
| Korea APR1400 | Südkorea | 2.116 | 42 | Schlanj/Substack (2026), zitiert $2.300/kW |
| Barakah | VAE | 5.257 | 90 | World Nuclear Association / Wikipedia, $32 Mrd. / 5.600 MW |
| Vogtle 3&4 | USA | 12.388 | 199 | MIT Climate Portal (2026), ~$15.000/kW; Ontario Clean Air Alliance |
| Flamanville 3 | Frankreich | 14.364 | 229 | World Nuclear Association (Dez. 2025), 23,7 Mrd.€ / 1.650 MW |
| Hinkley Point C | UK | 17.250 | 274 | IWR-Pressedienst (Feb. 2026), 48 Mrd.£ / 3.200 MW |
| **Mittelwert (5 Projekte)** | – | **10.275** | **167** | eigene Berechnung |

**Wichtige Einordnung:** Der Mittelwert mischt zwei sehr unterschiedliche Erfahrungswelten:
- **Südkorea/VAE:** standardisierte Serienfertigung, staatlich gesteuerte Lieferketten, stabile Rahmenbedingungen → 2.100–5.300 €/kW
- **Westliche Demokratien (USA/Frankreich/UK):** Erstprojekte nach Jahrzehnten Pause, komplexe Regulatorik, Verzögerungen von 7–13+ Jahren → 12.400–17.300 €/kW

Für Deutschland und die EU ist die **westliche Gruppe der relevantere Vergleichsmaßstab** (ähnliche Regulierungskultur, Genehmigungsverfahren, Arbeitskosten, keine bestehende Lieferkette/Erfahrung mehr seit dem Atomausstieg). Das würde die Studien-Annahme (6.000 €/kW) nicht nur verdoppeln, sondern **um das 2- bis 3-fache unterschreiten**.

**Befund: Die Studie unterschätzt Kernkraft-Kosten um 100–170 % (Mittelwert) bzw. bis zu 190 % (Westprojekte).**

### 5.5 Zusammenfassender Bias-Check

| Technologie | Richtung der Verzerrung | Ausmaß | Effekt auf Studienergebnis |
|---|---|---|---|
| Photovoltaik | Kosten überschätzt | +50 bis +150 % | verteuert EE-Szenarien künstlich |
| Wind on-/offshore | keine systematische Verzerrung | – | neutral |
| Kernkraft | Kosten unterschätzt | −50 bis −75 % (je nach Referenz) | verbilligt "Kostenminimum"-Szenario künstlich |

**Beide Verzerrungen wirken in dieselbe Richtung** – zugunsten des kernkraftlastigen "Kostenminimum"-Szenarios. Das ist der zentrale methodische Befund dieses Beitrags.

---

## 6. Illustrative Neuberechnung auf Systemebene

*(Hinweis: Diese Neuberechnung ist eine überschlägige Annäherung, keine exakte Neurechnung des GES-Modells – die vollständige Kostenaufschlüsselung nach Technologie liegt in der Originalstudie nur als Grafik vor, nicht als Rohdaten.)*

Im "Kostenminimum"-Szenario liefert die Grundlast (~125 GW von 215 GW installierter Leistung, bei 8.000 Volllaststunden) den weit überwiegenden Teil der Energie (geschätzt ~80 % der erzeugten Strommenge). Ersetzt man die Studien-Annahme für Kernkraft-CAPEX durch realistische Werte, ergibt sich überschlägig:

| Kernkraft-Annahme | Geschätztes LSCOE "Kostenminimum" | Vergleich |
|---|---|---|
| Studie (6.000 €/kW) | 125 €/MWh | Ausgangswert |
| Westlicher Mittelwert (~13.000 €/kW, Flamanville/Vogtle-Niveau) | **~210–215 €/MWh** | auf Niveau der 80%-EE-Szenarien |
| Hinkley-Point-C-Niveau (17.250 €/kW) | **~260–265 €/MWh** | nähert sich dem 100%-EE-Szenario |

Mit realistischen Baukosten verliert das "Kostenminimum"-Szenario seinen entscheidenden Kostenvorteil gegenüber den Erneuerbaren-Pfaden **fast vollständig**.

---

## 7. Ewigkeitskosten: der nicht vollständig eingepreiste Risikofaktor

Die Studie kalkuliert bereits 5 % CAPEX/Jahr für "Rückbau und Endlagerung" – das skaliert automatisch mit höherem CAPEX mit. Trotzdem bleibt ein Restrisiko, das in keinem Modell exakt bezifferbar ist:

- Der deutsche **Entsorgungsfonds (KENFO)** wurde mit rund 24 Mrd. € kapitalisiert (18 Mrd. € Kommissionsschätzung + Risikoaufschlag).
- Kritiker (u. a. BUND) halten diese Summe für **potenziell unzureichend**, insbesondere bei den offenen Fragen der Endlagersuche.
- **Kein Land der Welt** hat bislang ein Endlager für hochradioaktive Abfälle in Betrieb genommen. Das gesetzlich geforderte Sicherheitsniveau: Schutz von Mensch und Umwelt über einen Zeitraum von **einer Million Jahren**.
- Tiefengeologische Endlager sollen laut Gesetz nach Verschluss "passiv und wartungsfrei" sein (keine Ewigkeitskosten im bergbaulichen Sinne) – das ist aber ein regulatorisches Ziel, kein empirisch belegtes Faktum, da noch kein Endlager weltweit diesen Zustand erreicht hat.

**Einordnung:** Dieses Risiko ist eher als zusätzlicher Aufschlag nach oben zu verstehen, nicht als bereits vollständig eingepreist – weder in der GES-Studie noch in den hier verwendeten realen Baukosten-Referenzen (die primär reine Baukosten, nicht Entsorgungsrisiken abbilden).

---

## 8. Fazit

Die GES-Studie ist methodisch transparent dokumentiert – das ist positiv hervorzuheben. Der zentrale Kritikpunkt liegt nicht in der Modellstruktur, sondern in den **Kosten-Inputs**: Bei Photovoltaik wird deutlich zu teuer, bei Kernkraft deutlich zu günstig gerechnet. Beide Fehler wirken in dieselbe Richtung und verzerren das Gesamtergebnis systematisch zugunsten des kernkraftlastigen "Kostenminimum"-Szenarios.

Für die energiepolitische Debatte in Deutschland und der EU heißt das nicht, dass Kernkraft grundsätzlich unwirtschaftlich ist (Korea/VAE zeigen andere Wege) – aber die für Deutschland realistischen Referenzprojekte (Frankreich, UK, USA) deuten auf erheblich höhere Kosten hin, als die Studie unterstellt. Ein seriöser Vergleich sollte diese Bandbreite transparent machen, statt mit einem einzelnen, unrealistisch günstigen Wert zu rechnen.

---

## 9. Für die HTML-Simulation: Ideen für interaktive Elemente

- **CAPEX-Slider** pro Technologie (PV, Wind on-/offshore, Kernkraft) → live-berechnetes LCOE und geschätztes System-LSCOE
- **Szenario-Vergleich** als dynamisches Balkendiagramm (4 Szenarien), das sich bei Slider-Bewegung neu berechnet
- **"Was-wäre-wenn"-Modus**: Nutzer wählt zwischen "Studie", "Westlicher Mittelwert", "Asien/Golf-Niveau", "Eigene Eingabe"
- **Quellen-Tooltip** bei jedem Datenpunkt (Popover mit Quellenangabe + Link)
- **Sensitivitätsanalyse**: Balken zeigen Range (min/max) statt Einzelwert
- Karten-/Flaggen-Icons für Länder-Referenzprojekte (Korea, VAE, USA, Frankreich, UK) zur schnellen visuellen Einordnung

---

## 10. Maschinenlesbarer Datenblock (für die Simulation)

```json
{
  "methodology": {
    "wacc": 0.05,
    "formula": "LCOE = (CAPEX*CRF + CAPEX*opex_pct) / (fullLoadHours/1000) + fuelCost",
    "crf_formula": "r*(1+r)^n / ((1+r)^n - 1)"
  },
  "scenarios_original": [
    {"name": "80% EE + Gas-Peaker", "lscoe": 197, "installed_gw": 542, "fee_gw": 438},
    {"name": "80% EE + mehr H2", "lscoe": 212, "installed_gw": 618, "fee_gw": 438},
    {"name": "100% Erneuerbare", "lscoe": 321, "installed_gw": 1162, "fee_gw": 786},
    {"name": "Kostenminimum (inkl. Kernkraft)", "lscoe": 125, "installed_gw": 215, "fee_gw": 90}
  ],
  "technologies": {
    "pv": {
      "study": {"capex_eur_kw": 1500, "opex_pct": 0.01, "full_load_hours": 940, "lifetime_years": 27, "lcoe": 124.9, "source": "GES-Studie, Tab. 4 (NREL 2024)"},
      "references": [
        {"label": "Freifläche unten", "capex_eur_kw": 600, "lcoe": 50.0, "source": "Logic Energy 2026"},
        {"label": "Freifläche oben", "capex_eur_kw": 1000, "lcoe": 83.3, "source": "Logic Energy 2026"},
        {"label": "Solar-PPA-Preis Q4/2025 (Referenz)", "lcoe": 50, "source": "pv magazine / Logic Energy 2026"}
      ]
    },
    "wind_onshore": {
      "study": {"capex_eur_kw": 1749, "opex_pct": 0.02, "full_load_hours": 1700, "lifetime_years": 27, "lcoe": 90.8, "source": "GES-Studie, Tab. 4"},
      "references": [
        {"label": "Markt unten", "capex_eur_kw": 1600, "lcoe": 83.1, "source": "Deutsche WindGuard/BMWK 2024"},
        {"label": "Markt oben", "capex_eur_kw": 1900, "lcoe": 98.7, "source": "Deutsche WindGuard/BMWK 2024"}
      ]
    },
    "wind_offshore": {
      "study": {"capex_eur_kw": 3500, "opex_pct": 0.03, "full_load_hours": 3500, "lifetime_years": 27, "lcoe": 98.3, "source": "GES-Studie, Tab. 4"},
      "references": [
        {"label": "Markt unten", "capex_eur_kw": 3000, "lcoe": 84.3, "source": "Branchendaten WAB/BWE"},
        {"label": "Markt oben", "capex_eur_kw": 4500, "lcoe": 126.4, "source": "Branchendaten WAB/BWE"}
      ]
    },
    "nuclear": {
      "study": {"capex_eur_kw": 6000, "opex_pct": 0.07, "full_load_hours": 8000, "lifetime_years": 65, "fuel_cost_eur_mwh": 10, "lcoe": 101.6, "source": "GES-Studie, Tab. 4 (NREL 2024)"},
      "references": [
        {"label": "Korea APR1400", "country": "Südkorea", "capex_eur_kw": 2116, "lcoe": 42.3, "source": "Schlanj/Substack 2026, World Nuclear Assoc."},
        {"label": "Barakah", "country": "VAE", "capex_eur_kw": 5257, "lcoe": 90.3, "source": "World Nuclear Association / Wikipedia"},
        {"label": "Vogtle 3&4", "country": "USA", "capex_eur_kw": 12388, "lcoe": 199.2, "source": "MIT Climate Portal 2026, Ontario Clean Air Alliance"},
        {"label": "Flamanville 3", "country": "Frankreich", "capex_eur_kw": 14364, "lcoe": 229.4, "source": "World Nuclear Association, Dez. 2025"},
        {"label": "Hinkley Point C", "country": "UK", "capex_eur_kw": 17250, "lcoe": 273.5, "source": "IWR-Pressedienst, Feb. 2026"}
      ],
      "mean_of_5": {"capex_eur_kw": 10275, "lcoe": 166.9},
      "western_subset_note": "Für Deutschland/EU relevanter: Vogtle, Flamanville, Hinkley Point C (12.400-17.300 EUR/kW) statt Gesamtmittelwert."
    }
  },
  "system_level_estimate": {
    "note": "Illustrative Näherung, keine exakte Modell-Neurechnung",
    "kostenminimum_scenario": [
      {"nuclear_capex_assumption": "Studie (6000)", "lscoe_estimate": 125},
      {"nuclear_capex_assumption": "Westlicher Mittelwert (~13000)", "lscoe_estimate_range": [210, 215]},
      {"nuclear_capex_assumption": "Hinkley Point C (17250)", "lscoe_estimate_range": [260, 265]}
    ]
  },
  "organization_background": {
    "name": "Global Energy Solutions e.V.",
    "founded": "2020-08-27",
    "location": "Ulm, Deutschland",
    "original_focus": "grüner Wasserstoff, Methanol, Power-to-X-Importe",
    "study_stance": "technologieoffen, pro-Kernkraft, 'Plan B der Energiewende'",
    "funding_disclosed_in_study": false,
    "notable_reference": "WePlanet (weplanet-dach.org) - pro-nukleare Lobbyorganisation, als Quelle zitiert"
  },
  "sources": [
    {"id": "ges-study", "title": "Der klimaneutrale Strommix der Zukunft", "publisher": "Global Energy Solutions e.V.", "date": "2026-07", "url": "https://global-energy-solutions.org/wp-content/uploads/2026/05/DER-KLIMANEUTRALE-STROMMIX-DER-ZUKUNFT-veroeffentlicht-V1.1.pdf"},
    {"id": "logic-energy-pv", "title": "Photovoltaik Zubau 2026", "publisher": "Logic Energy", "url": "https://www.logicenergy.de/neuigkeiten/photovoltaik-zubau-deutschland"},
    {"id": "windguard-bmwk", "title": "Kostensituation der Windenergie an Land, Stand 2024", "publisher": "Deutsche WindGuard / BMWK", "date": "2024-10"},
    {"id": "mit-climate", "title": "Are nuclear power plants too expensive to build?", "publisher": "MIT Climate Portal", "date": "2026-03"},
    {"id": "world-nuclear-econ", "title": "Economics of Nuclear Power", "publisher": "World Nuclear Association"},
    {"id": "iwr-hinkley", "title": "Britisches Atomkraftwerk Hinkley Point C verzögert sich weiter und wird teurer", "publisher": "IWR-Pressedienst", "date": "2026-02-23"},
    {"id": "schlanj-nuclear", "title": "Choosing the Most Cost-Effective Option for Nuclear Power", "publisher": "Schlanj/Substack", "date": "2026-04-06"},
    {"id": "kenfo-bund", "title": "Wer zahlt die Ewigkeitskosten der Atomenergie?", "publisher": "BUND"},
    {"id": "tech-for-future", "title": "Wohin mit dem Atommüll? Deutschlands 42 Endlager", "publisher": "Tech for Future", "date": "2025-06"}
  ]
}
```

---

## 11. Offene Punkte / To-Do für die weitere Recherche

- [ ] Exakte Kostenaufschlüsselung des GES-Modells je Szenario beschaffen (Anhang 5.1–5.4 der Studie liegt nur als Bild vor) – ggf. Autoren direkt kontaktieren
- [ ] Aktuelle EU-weite Vergleichszahlen ergänzen (z. B. Polen, Tschechien als weitere EU-Neubau-Referenzen)
- [ ] Fraunhofer ISE "Stromgestehungskosten" (Juli 2024) als zusätzliche Primärquelle einarbeiten
- [ ] Ariadne-Projekt (PIK/FhG/TUM/ETH) "Klimaneutralität 2045" als Vergleichsstudie gegenlesen
- [ ] Wechselkurs-Annahmen (USD/EUR, GBP/EUR) explizit im Methodikteil dokumentieren und Sensitivität testen
- [ ] Rechtlicher Hinweis/Disclaimer für die Veröffentlichung ergänzen (kein Anlage-/Rechtsrat, eigene Berechnung, keine Übernahme von Gewähr)
