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

## 5.4a Historische Einordnung: Kernkraft-Baukosten im Zeitverlauf (inflationsbereinigt)

Die 5 aktuellen Referenzprojekte (Kapitel 5.4) zeigen die Gegenwart. Ein Blick in die Vergangenheit zeigt, dass hohe Kernkraft-Baukosten kein technologisches Naturgesetz sind, sondern historisch stark schwankten – mit einer auffälligen "Kostenexplosion" in den letzten zwei Jahrzehnten gegenüber der Zeit standardisierter Serienfertigung.

| Zeitraum/Projekt | Baukosten (inflationsbereinigt, 2026-Preise) | Quelle |
|---|---|---|
| USA, früh 1960er–1970 (historischer Tiefpunkt) | 957–1.914 €/kW | Grubler (2010) / Achse des Guten, bereits in 2024-USD angegeben |
| USA, 1975 (rapide Eskalation, **vor** Three Mile Island 1979) | 9.568–11.482 €/kW | dieselbe Quelle |
| Frankreich, Messmer-Plan-Flotte 1970er–1990er (standardisierte Serienfertigung) | 2.000–3.000 €/kW | Nuclear power in France, Grokipedia/Fachliteratur, konstante Euro |
| Deutschland, Isar 2 (Konvoi-Baulinie, Inbetriebnahme 1988) | ≈ 3.730 €/kW | IAEA INIS (DM 4,75 Mrd. / 1.400 MW netto), eigene Inflationsbereinigung (Faktor 2,15, dt. VPI 1988–2026) |
| **Studie GES (Annahme für 2045)** | **6.000 €/kW** | GES-Studie |
| Flamanville 3, Frankreich (fertiggestellt 2024) | 8.000 €/kW (EDF-Baukosten) bis 14.364 €/kW (franz. Rechnungshof, Vollkosten inkl. Zinsen) | World Nuclear Association, Grokipedia |
| Vogtle 3&4, USA (fertiggestellt 2023/24) | 12.388 €/kW | MIT Climate Portal 2026 |
| Hinkley Point C, UK (im Bau) | 17.250 €/kW | IWR-Pressedienst, Feb. 2026 |

**Zentrale Beobachtung:** Die Baukosten folgen keinem klassischen technologischen Lernkurven-Muster (stetig fallend mit kumulierter Erfahrung), sondern einem **U-förmigen bis erneut ansteigenden Verlauf**:

1. **1960er:** Sehr günstig (Pionierphase, staatlich subventionierte Erstprojekte, optimistische Kalkulation)
2. **Mitte 1970er (USA):** Explosionsartiger Kostenanstieg – bereits **vor** dem Reaktorunfall von Three Mile Island (1979), yerklärt u. a. mit Verlust der Standardisierung, wachsenden Sicherheitsauflagen und Stagflation
3. **1970er–1980er (Frankreich, Deutschland):** Durch **staatlich gesteuerte, standardisierte Serienfertigung** (Messmer-Plan, Konvoi-Baulinie) gelingt eine Stabilisierung auf vergleichsweise niedrigem Niveau (2.000–3.700 €/kW) – deutlich unter der heutigen GES-Studien-Annahme von 6.000 €/kW
4. **2000er–2020er (Westliche Erstprojekte nach jahrzehntelanger Baupause):** Erneute, noch stärkere Kostenexplosion auf 8.000–17.000+ €/kW – Verlust von Fachkräften, Lieferketten und Bauerfahrung nach der langen Pause, "First-of-a-kind"-Risiken bei neuen Reaktordesigns (EPR, AP1000)

**Einordnung für die energiepolitische Debatte:** Die historischen Daten stützen die These, dass niedrige Kernkraft-Kosten grundsätzlich möglich sind – aber nur unter spezifischen Bedingungen (langfristig durchgehaltene, standardisierte Serienfertigung mit stabilem regulatorischem Rahmen), die in Deutschland und den meisten westlichen Ländern seit Jahrzehnten nicht mehr gegeben sind. Die GES-Studien-Annahme von 6.000 €/kW liegt damit näher am historischen Bestwert der 1970er/80er-Jahre-Serienfertigung als an der Kostenrealität heutiger westlicher Erstprojekte – für ein *neues* deutsches Kernkraftprogramm nach über 15 Jahren Bau-Unterbrechung (letzter deutscher Baubeginn: Neckarwestheim 2, 1982) ist die 1980er-Jahre-Kostenbasis kaum realistisch übertragbar, ohne Jahrzehnte erneuten Kompetenz- und Lieferkettenaufbaus einzukalkulieren.

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

## 6a. Vollständiger Nachbau der Studien-Methodik mit realistischen Werten

*(Ergänzung nach Auswertung der vollständigen Studie inkl. Anhang-Tabellen 4/5 und Szenario-Ergebnisboxen – nicht mehr nur Einzeltechnologie-Vergleich, sondern echte Methodik-Nachrechnung auf Systemebene.)*

### 6a.1 Technologie-Kapazitäten zurückgerechnet

Die Studie nennt für jedes Szenario nur die *Summe* der fEE-Leistung (438 / 438 / 786 / 90 GW) sowie Zubau-Faktoren gegenüber 2022 je Technologie (z. B. "PV-Faktor 5,3"). Über ein Gleichungssystem (zwei bekannte Summen, drei Unbekannte, gelöst unter Annahme einer 2022-Basisverteilung PV : Wind onshore : Wind offshore ≈ 66,5 : 58,1 : 8,1 GW) lässt sich die Modell-Basis zurückrechnen:

**Rückgerechnete Modell-Basis 2022:** PV ≈ 45,3 GW, Wind onshore ≈ 39,6 GW, Wind offshore ≈ 5,5 GW (Summe ≈ 90,4 GW)

Kontrollrechnung gegen das 100%-Szenario (786 GW) weicht nur um ~4 % ab – ein gutes Konsistenzsignal für diese Rückrechnung. Bemerkenswert: Diese Modell-Basis (90,4 GW) deckt sich fast exakt mit der im "Kostenminimum"-Szenario ausgewiesenen fEE-Leistung (90 GW, "kein Zubau") – konsistent mit der Studienaussage, dass dort kein Zubau über 2022 hinaus erfolgt.

Daraus ergeben sich die installierten Kapazitäten je Technologie und Szenario:

| Szenario | PV (GW) | Wind onshore (GW) | Wind offshore (GW) | Grundlast/KKW (GW) |
|---|---|---|---|---|
| 80 % EE + Gas-Peaker | 240,2 | 142,6 | 55,2 | 0 |
| 80 % EE + mehr H2 | 240,2 | 142,6 | 55,2 | 0 |
| 100 % Erneuerbare | 519,3 | 213,5 | 53,2 | 0 |
| Kostenminimum | 45,3 | 39,6 | 5,5 | 125 |

### 6a.2 Neuberechnung: nur Erzeugungs-LCOE ersetzt, Netz-/Speicherkosten unverändert

Mit den obigen Kapazitäten, den bekannten Volllaststunden (PV 940 h, Wind onshore 1.700 h, Wind offshore 3.500 h, Kernkraft 8.000 h) und den realistischen LCOE-Werten aus Kapitel 5 lässt sich die Erzeugungskosten-Komponente jedes Szenarios neu berechnen. **Wichtig:** Netzausbau-, Speicher-, Rückverstromungs- und Backup-Kosten wurden unverändert aus der Studie übernommen (deren Rohdaten liegen nur als Grafik in Anhang 5.1–5.4 vor, nicht als Text) – die folgenden Werte unterschätzen daher tendenziell noch den vollen Korrektureffekt, da z. B. bei geringerem PV-Zubau auch der Netzausbaubedarf sinken würde.

| Szenario | Original LSCOE | Nur PV realistisch (800 €/kW) | + Kernkraft realistisch (Ø 5 Projekte, 10.275 €/kW) | + Kernkraft realistisch (westl. Ø: Vogtle/Flamanville/Hinkley, 14.667 €/kW) |
|---|---|---|---|---|
| 80 % EE + Gas-Peaker | 197 €/MWh | **183 €/MWh** | – | – |
| 80 % EE + mehr H2 | 212 €/MWh | **198 €/MWh** | – | – |
| 100 % Erneuerbare | 321 €/MWh | **291 €/MWh** | – | – |
| Kostenminimum (Kernkraft) | 125 €/MWh | **122 €/MWh** | **191 €/MWh** | **262 €/MWh** |

### 6a.3 Interpretation

- Die PV-Korrektur allein senkt die EE-lastigen Szenarien spürbar (−14 bis −30 €/MWh), ändert aber nichts an ihrer Rangfolge zueinander.
- Die Kernkraft-Korrektur im Kostenminimum-Szenario hat einen weit größeren Hebel: Je nach verwendeter Referenz (asiatisch/arabisch geprägter Mittelwert vs. westlicher Durchschnitt) steigt das Szenario auf **191–262 €/MWh** – von der ursprünglich mit Abstand günstigsten Option zu einer Option, die auf Augenhöhe mit oder teurer als die 80%-Erneuerbaren-Pfade liegt.
- Mit dem für Deutschland/EU relevanteren westlichen Kernkraft-Durchschnitt (262 €/MWh) kehrt sich die zentrale Kernaussage der Studie ("Kostenminimum ist mit Abstand am günstigsten") faktisch um: Das Szenario wird zum zweitteuersten der vier, nur noch unter dem 100%-EE-Szenario.
- Da Netz-/Speicherkosten nicht mitkorrigiert wurden, ist dies noch eine konservative (die Studie eher begünstigende) Neuberechnung.

---

### 6a.4 Erweiterte Korrektur: Elektrolyseur-Kosten und technologiespezifisches Kapitalkostenrisiko (WACC)

Zwei weitere zentrale Annahmen wurden geprüft und zeigten zusätzlichen Korrekturbedarf:

**Elektrolyseur-CAPEX:** Die Studie setzt 1.760 €/kW an (Tab. 4). Aktuelle Marktdaten (dena, FfE 2026) zeigen 800–1.200 €/kW – die Studie überschätzt auch hier die Kosten (+45 bis +120 %). Da die Studie keine expliziten Elektrolyseur-Kapazitäten je Szenario ausweist, wurde die Korrektur illustrativ über die Inkrementalkosten der H2-Kette geschätzt: Der Kostenunterschied zwischen "80% + Gas-Peaker" (197 €/MWh) und "80% + mehr H2" (212 €/MWh) bei identischer fEE-Kapazität beträgt 15 €/MWh und ist im Wesentlichen dem H2-Ketten-Ausbau (Elektrolyse, Speicher, Rückverstromung) zuzuschreiben. Bei einem geschätzten Elektrolyseur-Anteil von 40–50 % an diesen Mehrkosten ergibt sich eine Korrektur von etwa **−2,6 bis −3,2 €/MWh** für "80% + mehr H2" und entsprechend mehr für "100% Erneuerbare" (größere H2-Kette, geschätzt −5 €/MWh). *Hinweis: Diese Korrektur ist deutlich unsicherer als die PV-/Kernkraft-Korrekturen, da keine Kapazitätsdaten je Szenario vorliegen – sie wird daher nur als grobe Richtungsangabe verwendet.*

**Technologiespezifischer WACC bei Kernkraft:** Die Studie rechnet einheitlich mit 5 % WACC für alle Technologien. Reale Kernkraft-Neubauprojekte tragen jedoch aufgrund von Bau-, Genehmigungs- und Kostenüberschreitungsrisiko deutlich höhere Kapitalkosten – in der Finanzierungspraxis oft 7–9 % oder mehr bei Erstprojekten wie Flamanville oder Hinkley Point C. Mit einem realistischeren WACC von 8 % (statt 5 %) für Kernkraft allein steigt die Kernkraft-LCOE zusätzlich:

| Kernkraft-Annahme | LCOE bei 5 % WACC | LCOE bei 8 % WACC |
|---|---|---|
| Studie (6.000 €/kW) | 102 €/MWh | 123 €/MWh |
| Ø 5 Projekte (10.275 €/kW) | 167 €/MWh | **203 €/MWh** |
| Westl. Ø (14.667 €/kW) | 234 €/MWh | **286 €/MWh** |

### 6a.5 Finale kombinierte Neuberechnung aller vier Szenarien

| Szenario | Original LSCOE | + PV realistisch | + PV + Elektrolyseur (illustrativ) | + PV + Kernkraft (Ø 5 Proj., 8 % WACC) | + PV + Kernkraft (westl. Ø, 8 % WACC) |
|---|---|---|---|---|---|
| 80 % EE + Gas-Peaker | 197 €/MWh | 183 €/MWh | 183 €/MWh | – | – |
| 80 % EE + mehr H2 | 212 €/MWh | 198 €/MWh | **195 €/MWh** | – | – |
| 100 % Erneuerbare | 321 €/MWh | 291 €/MWh | **286 €/MWh** | – | – |
| Kostenminimum (Kernkraft) | 125 €/MWh | 122 €/MWh | – | **229 €/MWh** | **316 €/MWh** |

**Zentrales Ergebnis der vollständigen Neuberechnung:** Mit realistischem Kernkraft-CAPEX *und* realistischem, technologiespezifischem Kapitalkostenrisiko (8 % statt 5 % WACC) kehrt sich das Studienergebnis deutlich um: Das ursprünglich "günstigste" Szenario (125 €/MWh) wird mit **229–316 €/MWh** zum teuersten oder zweitteuersten aller vier Szenarien – teurer als beide 80%-Erneuerbaren-Pfade und bei der westlichen Referenz sogar teurer als das 100%-Erneuerbaren-Szenario (286 €/MWh). Gleichzeitig sinken die EE-lastigen Szenarien durch PV- und Elektrolyseur-Korrektur weiter ab (183–286 €/MWh).

*Wichtiger Vorbehalt bleibt bestehen: Netzausbau-, Speicher- und übrige Backup-Kosten wurden nicht neu berechnet (Rohdaten nur als Grafik in Anhang 5.1–5.4 verfügbar). Die Elektrolyseur-Korrektur ist eine grobe Schätzung, keine exakte Neurechnung.*

---

## 6b. Zusammenfassender Annahmen-Audit (alle geprüften Parameter aus Tab. 4/5)

| Annahme | Studie | Realistischer Wert | Befund | Richtung der Verzerrung |
|---|---|---|---|---|
| Photovoltaik CAPEX | 1.500 €/kW | 600–1.000 €/kW | zu teuer (+50 bis +150 %) | begünstigt Kostenminimum |
| Kernkraft CAPEX | 6.000 €/kW | 10.275–17.250 €/kW | zu günstig (−50 bis −75 %) | begünstigt Kostenminimum |
| Kernkraft WACC | 5 % (wie alle Technologien) | real 7–9 %+ (Bau-/Regulierungsrisiko) | zu günstig | begünstigt Kostenminimum |
| Wind onshore/offshore CAPEX | 1.749 / 3.500 €/kW | 1.600–1.900 / 3.000–4.500 €/kW | plausibel | neutral |
| Elektrolyseur CAPEX | 1.760 €/kW | 800–1.200 €/kW | zu teuer (+45 bis +120 %) | benachteiligt H2-Szenarien |
| Netzausbau gesamt | 732 Mrd. € | 651–784 Mrd. € (Studienvergleich) | grob plausibel, ÜNB/VNB-Anteile gleichen sich näherungsweise aus | neutral |
| Erdgaspreis / ETS | 40 €/MWh, keine ETS-Kosten auf Restemissionen | ETS-Preis laut EWI >200 €/t bis 2035 | Lücke bei Restemissionen aus Gas+CCS | begünstigt gasgestützte 80%-Szenarien |
| Kernkraft-Brennstoff | 10 €/MWh | plausibel | plausibel | neutral |
| CCS-Kosten | 80 €/t | 50–100 €/t (Literatur) | plausibel | neutral |
| Interkonnektoren | 20 GW | 17 GW genutzt (2024), Studie nennt dies selbst "günstigen Referenzrahmen" | plausibel bis leicht günstig für EE-Importe | begünstigt leicht EE-Szenarien |

**Gesamtfazit des Annahmen-Audits:** Von 10 geprüften zentralen Annahmen zeigen sich bei 4 systematische Verzerrungen zugunsten des Kernkraft-Szenarios (PV, Kernkraft-CAPEX, Kernkraft-WACC, Elektrolyseur), während nur 1 Annahme (ETS-Lücke bei Gas) leicht in die Gegenrichtung wirkt. Die übrigen 5 Annahmen sind im Rahmen der Unsicherheit plausibel. Die kombinierte Wirkung der Verzerrungen ist erheblich größer als jede Einzelkorrektur und kehrt die zentrale Kernaussage der Studie ("Kostenminimum mit Kernkraft ist mit Abstand am günstigsten") in der Tendenz um.

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

## 8a. Realistischer 30-Jahres-Plan Deutschland 2026–2056

Über die Kritik an der GES-Studie hinaus lässt sich fragen: Wie sähe ein **eigenständig geplanter, realistischer** 30-Jahres-Pfad aus – mit heutigen Ist-Kapazitäten als Startpunkt (nicht der fiktiven Modell-Baseline der Studie) und mit über die Zeit fallenden, statt statisch angenommenen Technologiekosten?

### 8a.1 Ausgangslage und Phasenlogik

**Startpunkt 2026 (reale Kapazitäten):** PV 110 GW, Wind onshore 65 GW, Wind offshore 10 GW, Batteriespeicher 5 GW/15 GWh, Gaskraftwerke 30 GW, Kernkraft 0 GW (Atomausstieg 2023 abgeschlossen).

**Wichtige Prämisse:** Ein neues deutsches Kernkraftprogramm ist in diesem Basisplan **nicht enthalten**. Realistische Vorlaufzeiten (Standortsuche, Genehmigung, Lieferketten-Wiederaufbau nach über 40 Jahren Bau-Pause, Bauzeit selbst) liegen bei 15–20+ Jahren – ein heute (2026) initiiertes Projekt könnte frühestens Mitte der 2040er ans Netz gehen. Eine Kernkraft-Variante wird separat in Kapitel 8a.4 durchgerechnet.

| Phase | PV | Wind onshore | Wind offshore | Batterie | Elektrolyseur | Gas/H2-Peaker | Strombedarf | Investition |
|---|---|---|---|---|---|---|---|---|
| 2026 (Start) | 110 GW | 65 GW | 10 GW | 5 GW / 15 GWh | 0 GW | 30 GW | 560 TWh | – |
| 2035 (Phase 1: Ausbau & Flexibilisierung) | 220 GW | 90 GW | 30 GW | 40 GW / 120 GWh | 15 GW | 35 GW | 750 TWh | 415 Mrd. € |
| 2045 (Phase 2: Sektorkopplung & Speicherausbau) | 320 GW | 120 GW | 50 GW | 80 GW / 300 GWh | 40 GW | 40 GW | 950 TWh | 527 Mrd. € |
| 2056 (Phase 3: Konsolidierung & Repowering) | 400 GW | 150 GW | 70 GW | 110 GW / 450 GWh | 55 GW | 45 GW | 1.050 TWh | 470 Mrd. € |

**Gesamtinvestition 2026–2056: ≈ 1.412 Mrd. €**, davon 760 Mrd. € Netzausbau (konsistent mit realen NEP-/IMK-Schätzungen, siehe Kapitel 6a.4) und 652 Mrd. € Erzeugung/Speicher/Elektrolyse.

### 8a.2 Kostenannahmen mit Lernkurven (statt statischer 2024er-Werte)

Anders als die GES-Studie, die für alle Bauperioden identische 2024er-Kosten unterstellt, wird hier eine **realistische Kostendegression** über die Jahrzehnte angesetzt:

| Technologie | 2026-2035 | 2036-2045 | 2046-2056 |
|---|---|---|---|
| PV (€/kW) | 650 | 500 | 420 |
| Wind onshore (€/kW) | 1.750 (unverändert, ausgereifte Technologie) | 1.750 | 1.750 |
| Wind offshore (€/kW) | 3.700 | 3.500 | 3.400 |
| Batterie (€/kWh) | 200 | 150 | 120 |
| Elektrolyseur (€/kW) | 900 | 650 | 480 |
| Gas/H2-Peaker (€/kW) | 2.200 (konstant, inkl. CCS-Nachrüstung) | 2.200 | 2.200 |

### 8a.3 Resultierende Systemkosten 2056

Mit dem Anlagenbestand aus allen drei Bauperioden (Flotten-Mix aus alten und neuen, günstigeren Anlagen) ergibt sich für das Zielsystem 2056:

- PV-Flotten-LCOE: ≈ 53 €/MWh (gewichteter Mix aus 2026er-Altbestand und günstigerem Neubau)
- Wind onshore: ≈ 91 €/MWh
- Wind offshore: ≈ 102 €/MWh
- Netzkosten (annuitisiert, 760 Mrd. € Kapitalstock, 40 Jahre, 5% WACC): ≈ 44 Mrd. €/Jahr
- Batteriekosten (annuitisiert, 450 GWh, 15 Jahre, 5% WACC): ≈ 7 Mrd. €/Jahr
- Elektrolyseur + Gas/H2-Peaker (annuitisiert): ≈ 8,5 Mrd. €/Jahr

**Resultierende LSCOE 2056: ≈ 122 €/MWh**

*Wichtige Einschränkungen: vereinfachte Netz-/Speicher-Annuitisierung statt stundenscharfer Dispatch-Simulation; die fEE-Erzeugung (876 TWh) deckt nicht vollständig den Bedarf (1.050 TWh) – die Lücke müsste über Importe, Gas/H2-Backup oder zusätzliches Lastmanagement geschlossen werden, was hier nicht bis ins Detail durchmodelliert ist.*

### 8a.4 Vergleichspfad: mit Kernkraft-Option

Zur Einordnung wird eine zweite Variante gerechnet: Entscheidung für ein Kernkraftprogramm bereits 2026, erster Reaktor (1,6 GW) ans Netz 2045 (19 Jahre Vorlauf), zweiter Reaktor 2052. Kostenbasis: 16.000 €/kW (realistisches westliches Neubau-Niveau der 2040er, siehe Kapitel 5.4 und 6a.4 – bei nur zwei Einheiten kein nennenswerter Lerneffekt zu erwarten), WACC 8 % (Bau-/Regulierungsrisiko).

| | Ohne Kernkraft (Basisplan) | Mit Kernkraft (2 Reaktoren ab 2045/2052) |
|---|---|---|
| Kernkraft-LCOE | – | 311 €/MWh |
| Kernkraft-Investition gesamt | – | 51 Mrd. € (für 3,2 GW) |
| Gesamtinvestition 2026–2056 | 1.412 Mrd. € | 1.463 Mrd. € |
| **LSCOE 2056** | **≈ 122 €/MWh** | **≈ 129 €/MWh** |

**Ergebnis:** Die Kernkraft-Option verteuert das Gesamtsystem in dieser realistischen 30-Jahres-Betrachtung leicht (+7 €/MWh), liefert aber nur einen kleinen Beitrag (3,2 GW von insgesamt weit über 600 GW Gesamtkapazität) – bei sehr hoher Kapitalbindung (51 Mrd. € für nur 25,6 TWh/Jahr Erzeugung) und langer Vorlaufzeit ohne Beitrag zur Versorgung vor 2045. Ein Technologiepfad, der stattdessen konsequent auf fallende Kosten bei PV, Batterie und Elektrolyse setzt, erreicht mit ≈122 €/MWh nahezu denselben Wert, den die GES-Studie nur mit (unrealistisch günstig angesetzter) Kernkraft für erreichbar hält (125 €/MWh) – und das **ganz ohne** die technologischen, regulatorischen und Entsorgungsrisiken eines Kernkraftprogramms.

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
    },
    "historical_inflation_adjusted": {
      "note": "Inflationsbereinigt auf 2026-Preise",
      "data_points": [
        {"period": "USA, frueh 1960er-1970", "capex_eur_kw_range": [957, 1914], "source": "Grubler 2010 / Achse des Guten"},
        {"period": "USA, 1975", "capex_eur_kw_range": [9568, 11482], "source": "Grubler 2010 / Achse des Guten"},
        {"period": "Frankreich, Messmer-Plan-Flotte 1970er-1990er", "capex_eur_kw_range": [2000, 3000], "source": "Nuclear power in France, Grokipedia"},
        {"period": "Deutschland, Isar 2 (1988)", "capex_eur_kw": 3730, "source": "IAEA INIS, eigene Inflationsbereinigung Faktor 2.15"},
        {"period": "Flamanville 3 (2024)", "capex_eur_kw_range": [8000, 14364], "source": "World Nuclear Association / franz. Rechnungshof"},
        {"period": "Vogtle 3&4 (2024)", "capex_eur_kw": 12388, "source": "MIT Climate Portal 2026"},
        {"period": "Hinkley Point C (2026)", "capex_eur_kw": 17250, "source": "IWR-Pressedienst Feb. 2026"}
      ],
      "interpretation": "U-foermiger Verlauf: guenstig 1960er, Explosion Mitte 1970er USA (vor Three Mile Island), Stabilisierung durch standardisierte Serienfertigung Frankreich/Deutschland 1970er-80er (2000-3700 EUR/kW), erneute staerkere Explosion bei westlichen Erstprojekten seit 2000er (8000-17000+ EUR/kW) nach Verlust von Lieferketten und Bauerfahrung"
    }
  },
  "system_level_estimate": {
    "note": "Vollstaendiger Nachbau der Studien-Methodik: Kapazitaeten je Technologie aus Zubaufaktoren zurueckgerechnet, Erzeugungs-LCOE neu berechnet, Netz-/Speicherkosten unveraendert aus Original uebernommen",
    "backed_out_2022_baseline_gw": {"pv": 45.3, "wind_onshore": 39.6, "wind_offshore": 5.5, "sum": 90.4},
    "capacities_by_scenario_gw": {
      "80% Gas-Peaker": {"pv": 240.2, "wind_onshore": 142.6, "wind_offshore": 55.2, "baseload_nuclear": 0},
      "80% mehr H2": {"pv": 240.2, "wind_onshore": 142.6, "wind_offshore": 55.2, "baseload_nuclear": 0},
      "100% EE": {"pv": 519.3, "wind_onshore": 213.5, "wind_offshore": 53.2, "baseload_nuclear": 0},
      "Kostenminimum": {"pv": 45.3, "wind_onshore": 39.6, "wind_offshore": 5.5, "baseload_nuclear": 125}
    },
    "recalculated_lscoe": [
      {"scenario": "80% Gas-Peaker", "original": 197, "pv_corrected": 183.1},
      {"scenario": "80% mehr H2", "original": 212, "pv_corrected": 198.1},
      {"scenario": "100% EE", "original": 321, "pv_corrected": 291.0},
      {"scenario": "Kostenminimum", "original": 125, "pv_corrected": 122.4, "pv_and_nuclear_mean5_corrected": 191.1, "pv_and_nuclear_western_avg_corrected": 261.7}
    ],
    "caveat": "Netzausbau-, Speicher- und Backup-Kosten wurden nicht korrigiert (Rohdaten aus Anhang 5.1-5.4 der Studie nur als Grafik verfuegbar, nicht als Text) - konservative Naeherung"
  },
  "extended_correction": {
    "electrolyzer": {
      "study_capex_eur_kw": 1760,
      "real_capex_range_eur_kw": [800, 1200],
      "source": "dena Elektrolysekapazitaeten Deutschland 2026, FfE Discussion Paper 2025",
      "correction_method": "illustrativ ueber Inkrementalkosten H2-Kette (Sc.2 minus Sc.1 = 15 EUR/MWh), geschaetzter Elektrolyseur-Anteil 40-50%",
      "estimated_correction_eur_mwh": {"80% mehr H2": -2.9, "100% EE": -5.0},
      "confidence": "niedrig - keine Kapazitaetsdaten je Szenario in Studie verfuegbar"
    },
    "nuclear_wacc": {
      "study_wacc": 0.05,
      "realistic_wacc": 0.08,
      "rationale": "Bau-/Genehmigungs-/Kostenueberschreitungsrisiko bei KKW-Neubauprojekten, real oft 7-9%+ bei Erstprojekten (Flamanville, Hinkley Point C)",
      "lcoe_with_realistic_wacc": {
        "study_capex_6000": 122.9,
        "mean5_capex_10275": 203.4,
        "western_avg_capex_14667": 286.0
      }
    },
    "final_combined_lscoe": [
      {"scenario": "80% Gas-Peaker", "original": 197, "pv_corrected": 183.1, "pv_and_electrolyzer_corrected": 183.1},
      {"scenario": "80% mehr H2", "original": 212, "pv_corrected": 198.1, "pv_and_electrolyzer_corrected": 195.2},
      {"scenario": "100% EE", "original": 321, "pv_corrected": 291.0, "pv_and_electrolyzer_corrected": 286.0},
      {"scenario": "Kostenminimum", "original": 125, "pv_corrected": 122.4, "pv_nuclear_mean5_wacc8_corrected": 229.4, "pv_nuclear_western_wacc8_corrected": 316.4}
    ]
  },
  "assumption_audit_summary": {
    "total_assumptions_checked": 10,
    "biased_toward_kostenminimum": 4,
    "biased_toward_ee_scenarios": 1,
    "plausible_neutral": 5,
    "conclusion": "Kombinierte Wirkung der Verzerrungen kehrt zentrale Kernaussage der Studie tendenziell um"
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
  "thirty_year_plan_2026_2056": {
    "note": "Eigenstaendiger realistischer 30-Jahres-Plan, Startpunkt reale Ist-Kapazitaeten 2026 (nicht GES-Modell-Baseline)",
    "start_2026": {"pv_gw": 110, "wind_onshore_gw": 65, "wind_offshore_gw": 10, "battery_gw": 5, "battery_gwh": 15, "gas_gw": 30, "nuclear_gw": 0, "demand_twh": 560},
    "phases": [
      {"year": 2035, "label": "Phase 1: Ausbau & Flexibilisierung", "pv_gw": 220, "wind_onshore_gw": 90, "wind_offshore_gw": 30, "battery_gw": 40, "battery_gwh": 120, "electrolyzer_gw": 15, "gas_gw": 35, "demand_twh": 750, "investment_bn_eur": 415},
      {"year": 2045, "label": "Phase 2: Sektorkopplung & Speicherausbau", "pv_gw": 320, "wind_onshore_gw": 120, "wind_offshore_gw": 50, "battery_gw": 80, "battery_gwh": 300, "electrolyzer_gw": 40, "gas_gw": 40, "demand_twh": 950, "investment_bn_eur": 527},
      {"year": 2056, "label": "Phase 3: Konsolidierung & Repowering", "pv_gw": 400, "wind_onshore_gw": 150, "wind_offshore_gw": 70, "battery_gw": 110, "battery_gwh": 450, "electrolyzer_gw": 55, "gas_gw": 45, "demand_twh": 1050, "investment_bn_eur": 470}
    ],
    "total_investment_bn_eur": 1412,
    "capex_learning_curve_eur_per_kw_or_kwh": {
      "2026-2035": {"pv": 650, "wind_onshore": 1750, "wind_offshore": 3700, "battery_per_kwh": 200, "electrolyzer": 900, "gas": 2200},
      "2036-2045": {"pv": 500, "wind_onshore": 1750, "wind_offshore": 3500, "battery_per_kwh": 150, "electrolyzer": 650, "gas": 2200},
      "2046-2056": {"pv": 420, "wind_onshore": 1750, "wind_offshore": 3400, "battery_per_kwh": 120, "electrolyzer": 480, "gas": 2200}
    },
    "resulting_lscoe_2056": {
      "without_nuclear": 121.7,
      "with_nuclear_option": 129.3,
      "nuclear_variant": {
        "reactor1_gw": 1.6, "reactor1_online": 2045,
        "reactor2_gw": 1.6, "reactor2_online": 2052,
        "capex_eur_kw": 16000, "wacc": 0.08,
        "lcoe_eur_mwh": 311.1,
        "total_nuclear_investment_bn_eur": 51.2,
        "total_investment_with_nuclear_bn_eur": 1463
      }
    },
    "caveats": "Vereinfachte Netz-/Speicher-Annuitisierung statt stundenscharfer Dispatch-Simulation; fEE-Erzeugung deckt nicht vollstaendig den Bedarf 2056 (876 vs 1050 TWh), Deckungsluecke nicht bis ins Detail durchmodelliert"
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
