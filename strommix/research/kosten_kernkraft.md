---
title: "Kosten von Kernkraft-Neubauprojekten — Referenzrecherche für ein hypothetisches deutsches/europäisches Neubauprogramm"
project: "strommix"
type: "research"
status: "recherchiert und verifiziert, soweit im Rahmen der technischen Möglichkeiten machbar"
date: "2026-08-15"
zugriffsdatum_alle_quellen: "2026-08-15"
language: "de"
scope: "Referenzprojekte weltweit + EU-Neubau + SMR + Betriebskosten + Bauzeiten + WACC-Sensitivität"
---

# Kosten von Kernkraft-Neubauprojekten

> **Zweck:** Belastbare, quellenbasierte Referenzwerte für die CAPEX-/OPEX-Parametrisierung
> des Strommix-Kostenmodells. Prüft und korrigiert die Werte aus
> `docs/01_grundlage_ges_faktencheck.md`, Abschnitt 5.4.

---

## 0. Methodische Vorbemerkungen — bitte zuerst lesen

### 0.1 Verifikationstiefe und Einschränkung dieser Recherche

**Wichtige Transparenz-Angabe:** In dieser Recherche-Session war der direkte Abruf von
Webseiten (Volltext-Fetch) durch den Netzwerk-Proxy der Arbeitsumgebung **blockiert**.
Insbesondere `world-nuclear.org`, `world-nuclear-news.org`, `iea.org`, `en.wikipedia.org`,
`pej.pl` und `ans.org` waren nicht direkt lesbar. Die Verifikation erfolgte daher über
**Suchmaschinen-Ergebnisse mit Textauszügen** aus den jeweiligen Quellen.

Konsequenz für die Belastbarkeit:

| Stufe | Bedeutung | Kennzeichnung |
|---|---|---|
| **A** | Zahl aus mehreren unabhängigen Quellen übereinstimmend belegt | ✅ |
| **B** | Zahl aus einer Quelle belegt, plausibel, aber nicht gegengeprüft | ⚠️ |
| **C** | Zahl kursiert, Primärquelle in dieser Session nicht auffindbar/prüfbar | ❓ |

Vor Veröffentlichung des White Papers sollten die mit **B** und **C** markierten Werte
noch einmal gegen die Primärdokumente (EDF-Geschäftsbericht, Cour des Comptes-Bericht,
EU-Kommissionsentscheidung, IAEA PRIS) geprüft werden.

### 0.2 Wechselkurs-Basis (dokumentiert und einheitlich)

Alle €/kW-Werte sind mit **einem einzigen, dokumentierten Kurssatz** umgerechnet, damit
die Projekte untereinander vergleichbar bleiben. Verwendet: **EZB-Referenzkurse
vom 09.03.2026** (veröffentlicht u. a. im Amtsblatt der EU):

| Währung | 1 EUR = | 1 Einheit = ... EUR |
|---|---|---|
| USD | 1,1555 | 0,86543 |
| GBP | 0,86530 | 1,15567 |
| CZK | 24,399 | 0,040986 |
| PLN | 4,2785 | 0,233727 |
| CAD | 1,6089 (Jahresdurchschnitt 2026) | 0,621543 |

**Methodische Ehrlichkeit dazu:** Diese Umrechnung ist *ökonomisch nicht korrekt* für
historische Projekte. Barakah wurde 2009–2024 gebaut, Vogtle 2013–2024 — die Ausgaben
fielen zu ganz anderen Kursen an (EUR/USD schwankte in diesem Zeitraum zwischen ~1,04
und ~1,45). Eine kaufkraftparitäts- oder ausgabenzeitpunktgewichtete Umrechnung wäre
sauberer, ist aber ohne Zahlungsstromdaten nicht möglich. **Sensitivität:** Ein
EUR/USD-Kurs von 1,05 statt 1,1555 erhöht alle USD-Projekte um rund **10 %**.
Diese Unsicherheit ist kleiner als die Bandbreite der Kostenangaben selbst.

### 0.3 Warum €/kW-Angaben grundsätzlich schlecht vergleichbar sind

Die größte Fehlerquelle ist **nicht** der Wechselkurs, sondern die Frage, *was* in einer
Kostenzahl enthalten ist. Vier Abgrenzungen unterscheiden sich systematisch:

1. **Overnight Cost (OCC)** — reine Bau-/Ausrüstungskosten, so als würde das Kraftwerk
   "über Nacht" entstehen. Keine Bauzinsen.
2. **Bauzinsen / Interest During Construction (IDC)** — bei 10–17 Jahren Bauzeit
   **der** entscheidende Posten. Faustformel: bei 5 % WACC und 10 Jahren Bauzeit
   ~+25–30 % auf OCC, bei 9 % WACC ~+50–60 %. Bei PV (1 Jahr Bau) ist der Posten
   vernachlässigbar. **Das ist der Hauptgrund, warum ein einheitlicher WACC im Modell
   Kernkraft strukturell begünstigt, wenn IDC nicht separat modelliert wird.**
3. **Eigentümerkosten (Owner's Costs)** — Grundstück, Netzanbindung, Erstkernladung,
   Genehmigungsverfahren, Projektentwicklung, Personalaufbau.
4. **Preisbasis** — €2015 vs. €2023 vs. laufende Preise. Bei 15 Jahren Projektlaufzeit
   sind das 30–50 % Unterschied.

**In diesem Dokument wird bei jedem Projekt angegeben, welche Abgrenzung gilt.**
Ohne diese Angabe ist eine €/kW-Zahl praktisch wertlos.

### 0.4 Brutto- vs. Netto-Leistung

€/kW ändert sich um 4–8 %, je nachdem ob Brutto- (Generatorklemme) oder
Nettoleistung (Netzeinspeisung, nach Eigenbedarf) im Nenner steht. Für ein Kostenmodell
ist die **Nettoleistung** richtig, weil nur sie Strom liefert. In der Literatur wird
überwiegend brutto gerechnet. Wo beide bekannt sind, sind hier beide ausgewiesen.

---

## 1. Referenzprojekte weltweit

### 1.1 Übersichtstabelle

Alle Werte: Gesamtprojektkosten der jeweils genannten Abgrenzung, geteilt durch die
jeweils genannte Leistung, umgerechnet mit den Kursen aus 0.2.

| Projekt | Land | Typ / Leistung | Kosten (Originalwährung) | Abgrenzung | **€/kW** | Bauzeit | Verzögerung | Stufe |
|---|---|---|---|---|---|---|---|---|
| **Shin Hanul 3&4** | Südkorea | 2× APR1400, 2.800 MW | 8,8 Mrd. USD | OCC, Festpreisrahmen | **2.720** | 2023/24 → früh 2030er | im Plan (noch im Bau) | ⚠️ B |
| **APR1400 Inland (Referenzwert)** | Südkorea | 1.400 MW/Block | 2.157 USD/kW | OCC, ohne IDC | **1.867** | ~6–9 J. | Shin Kori 3/4: 3 bzw. 5 J. | ⚠️ B |
| **Barakah (EPC-Vertrag 2009)** | VAE | 4× APR1400, 5.600 MW brutto | 20,4 Mrd. USD (Preise 2009) | EPC-Turnkey | **3.153** | 2012–2024 | U1 ~3–4 J. | ✅ A |
| **Barakah (Gesamtkosten)** | VAE | 4× APR1400, 5.600 MW brutto | 32 Mrd. USD | inkl. Eigentümerkosten | **4.945** | 2012–2024 | U1 ~3–4 J. | ⚠️ B |
| **Dukovany II** | Tschechien | 2× APR1000, 2.110 MW | 407 Mrd. CZK (= 18,6 Mrd. USD) | **nur EPC-Vertrag** | **7.906** | Baustart 2029, U1 2036 | (noch nicht begonnen) | ✅ A |
| **EPR2-Programm** | Frankreich | 6× EPR2, ~9,6–10,0 GW | 72,8 Mrd. € (€2020) | OCC, **ohne** Finanzierung | **7.265–7.583** | Baustart 2027?, U1 2038 | +3 J. ggü. Planung 2035 | ✅ A |
| **EPR2-Programm (€2025)** | Frankreich | dito | 83 Mrd. € (€2025) | OCC, ohne Finanzierung | **8.283–8.646** | dito | dito | ⚠️ B |
| **EPR2-Programm (inkl. Fin.)** | Frankreich | dito | ~100 Mrd. € | inkl. Finanzierungskosten | **~9.980–10.400** | dito | dito | ⚠️ B |
| **Lubiatowo-Kopalino** | Polen | 3× AP1000, 3.750 MW brutto | 192 Mrd. PLN | Gesamtprojekt | **11.968** | Beton 2028, Betrieb 2. Hälfte 2030er | (noch nicht begonnen) | ✅ A |
| **Sizewell C** | UK | 2× EPR, 3.260 MW | 38 Mrd. GBP (FID 07/2025) | Gesamtprojekt | **13.472** | ~10 Jahre ab 2025 | (Erstschätzung 2020: 20 Mrd. £) | ✅ A |
| **Vogtle 3&4** | USA | 2× AP1000, 2.234 MW netto | 36,8 Mrd. USD | Gesamt, alle Eigentümer | **14.258** | 2013–2023/24 | **7 Jahre** | ✅ A |
| **Flamanville 3** | Frankreich | 1× EPR, 1.650 MW brutto / 1.630 netto | 23,7 Mrd. € (€2023) | Gesamt inkl. Finanzierung | **14.364** (brutto) / **14.540** (netto) | 2007–2024/25 | **12 Jahre** | ✅ A |
| **Hinkley Point C** | UK | 2× EPR, 3.260 MW | ~48,7 Mrd. GBP (laufende Preise) | Gesamt, laufende Preise | **17.264** | 2016/18 – 2030(31) | **5–6 Jahre** (laufend) | ✅ A |
| *Hinkley Point C (Preisbasis 2015)* | UK | dito | 35 Mrd. GBP (£2015) | Gesamt, reale Preise 2015 | *12.408* | dito | dito | ✅ A |
| **Paks II** | Ungarn | 2× VVER-1200, 2.400 MW | 12,5 Mrd. € (Stand 2014) | Gesamtbudget 2014 | *5.208* — **veraltet** | Beton 11/2025 | **~10 Jahre** | ❓ C |

### 1.2 Projekt-Steckbriefe

#### Barakah (Vereinigte Arabische Emirate) — der Referenzfall für „es geht auch anders"

- **Technik:** 4 × APR1400 (koreanisch), Gesamt-Nennleistung 5.600 MW.
- **Vertrag:** Im Dezember 2009 vergab ENEC einen Auftrag über **20,4 Mrd. USD** an ein
  von KEPCO geführtes Konsortium (KHNP, Hyundai, Samsung, Doosan, KEPCO E&C, KPS) für
  Planung, Bau und Betrieb.
- **Finanzierungspaket:** 24,4 Mrd. USD über die Zweckgesellschaft Barakah One
  (davon ~19,6 Mrd. USD Direktdarlehen, Rest Eigenkapital).
- **Verbreitet zitierte Gesamt-Baukosten:** 32 Mrd. USD.
- **Termine:** Block 1 Netzanschluss 08/2020, kommerzieller Betrieb 2021; Block 4
  kommerziell 03/2024. Ursprüngliches Ziel für Block 1 war 2017 → **~3–4 Jahre Verzug**,
  nach westlichen Maßstäben moderat.
- **Warum so günstig?** Serienbau (4 identische Blöcke direkt hintereinander),
  eingespielter koreanischer Lieferkette, Turnkey-Festpreis mit Risikoübernahme durch
  den Lieferanten, staatlicher Auftraggeber mit schneller Entscheidungsfindung, niedrige
  Bau-Lohnkosten (überwiegend Wanderarbeit), keine Klagemöglichkeiten Dritter gegen den
  Bau. **Faire Einordnung:** Diese Bedingungen sind in Deutschland/der EU aus rechts-
  und arbeitsmarktpolitischen Gründen nicht reproduzierbar. Zudem gilt der
  KEPCO-Festpreis in der Branche als aggressiv kalkuliert (Markteintrittspreis).
- **€/kW-Spanne: 3.150 (EPC-Vertrag) bis 4.945 (Gesamtkosten).**

**Korrektur zum bestehenden Dokument:** Dort steht 5.257 €/kW. Mit dem hier
dokumentierten Kurs ergibt 32 Mrd. USD / 5.600 MW = 5.714 USD/kW = **4.945 €/kW**.
Der im Dokument verwendete Wert impliziert einen Kurs von ~1,087 USD/EUR, der nicht
ausgewiesen ist. **Empfehlung: auf Spanne 3.150–4.950 €/kW umstellen.**

#### Vogtle 3&4 (USA)

- **Technik:** 2 × Westinghouse AP1000, je ~1.117 MW netto = 2.234 MW.
- **Kosten:** Ursprünglich 14 Mrd. USD veranschlagt; bei Inbetriebnahme **über
  36,8 Mrd. USD** (alle Eigentümer). Häufig auch „rund 35 Mrd. USD" zitiert.
- **MIT Climate Portal:** „cost around **$15,000 for every kilowatt** of generating
  capacity" — das entspricht **12.981 €/kW** und liegt am unteren Rand.
- **Termine:** Erster Beton 03/2013; Block 3 kommerziell 07/2023, Block 4 04/2024.
  Ursprüngliche Ziele 2016/2017 → **7 Jahre Verzug**, Bauzeit 10–11 Jahre.
- **Kontext:** Der Bau löste die Insolvenz von Westinghouse (2017) aus; das Projekt
  wurde nur durch DOE-Kreditbürgschaften und Überwälzung auf die Tarifkunden in Georgia
  fortgeführt. FOAK-Projekt: der erste AP1000-Bau in den USA nach über 30 Jahren
  Neubau-Pause.
- **€/kW-Spanne: 12.980 (MIT-Angabe) bis 14.260 (36,8 Mrd. USD).**

**Korrektur zum bestehenden Dokument:** Dort steht 12.388 €/kW. Das ist zu niedrig —
es entspricht 15.000 USD/kW bei einem Kurs von ~1,21 USD/EUR. Bei einheitlicher
Umrechnung liegt der Wert bei **12.980–14.260 €/kW**. **Empfehlung: 13.500 €/kW als
Punktwert, Spanne 13.000–14.300 €/kW.**

#### Flamanville 3 (Frankreich)

- **Technik:** 1 × EPR, 1.650 MW brutto / 1.630 MW netto — leistungsstärkster Block
  der französischen Flotte.
- **Kosten:** Ursprünglich 3,3 Mrd. € (2007). Der **Cour des Comptes** rechnete im
  Bericht vom **14.01.2025** die Gesamtkosten bis Fertigstellung auf **20,4 Mrd. €
  (€2015) bzw. 23,7 Mrd. € (€2023)** hoch. EDF selbst nennt 19,3 Mrd. € (€2015) bzw.
  22,6 Mrd. € (€2023) inkl. Finanzierungskosten.
- **Termine:** Erster Beton 12/2007; Netzanschluss **21.12.2024**; volle Leistung erst
  **12/2025** nach ASN-Freigabe. Geplant war die Inbetriebnahme 2012 → **12 Jahre
  Verzug**, Bauzeit 17–18 Jahre.
- **€/kW: 13.700 (EDF-Zahl) bis 14.540 (Cour des Comptes, netto).**

**Prüfergebnis zum bestehenden Dokument:** Der Wert **14.364 €/kW ist korrekt**
(23,7 Mrd. € / 1.650 MW brutto). Anzupassen ist nur die Quellenangabe: Primärquelle
ist der **Cour des Comptes-Bericht vom 14.01.2025**, nicht die World Nuclear
Association. Die WNA referiert diese Zahl lediglich.

#### Hinkley Point C (UK) — der teuerste dokumentierte Referenzfall

- **Technik:** 2 × EPR, je 1.630 MW = 3.260 MW.
- **Kostenentwicklung:** 18 Mrd. £ bei Vertragsschluss 2016 → EDF nennt am
  **20.02.2026** nunmehr **35 Mrd. £ in Preisen von 2015** (Worst Case 36 Mrd. £),
  was **rund 48–49 Mrd. £ in laufenden Preisen** entspricht.
- **Termine:** Ursprünglich 2025 → 2027 → 2029 → jetzt **2030** (Worst Case 2031).
  EDF nennt als Grund geringere Produktivität bei elektromechanischen Arbeiten
  (Rohrleitungen, Verkabelung). Die 12-Monats-Verschiebung kostet EDF eine
  Wertberichtigung von ~2,5 Mrd. €.
- **Finanzierungsmodell: CfD.** Basispreis 92,50 £/MWh in Preisen von 2012, indexiert,
  über **35 Jahre**. Der indexierte Wert lag am **17.01.2026 bei 127 £/MWh** —
  entspricht rund **15 ct/kWh** bzw. **~147 €/MWh**. Das ist der einzige Referenzfall,
  bei dem ein realer, vertraglich zugesicherter Strompreis für Neubau-Kernkraft
  öffentlich dokumentiert ist.
- **€/kW: 17.264 (laufende Preise) bzw. 12.408 (Preisbasis 2015).**

**Prüfergebnis zum bestehenden Dokument:** Der Wert **17.250 €/kW ist bestätigt**
(48,7 Mrd. £ / 3.260 MW × 1,15567). **Aber:** Er beruht auf laufenden Preisen, während
die Vergleichswerte anderer Projekte teils auf älteren Preisbasen stehen. Für einen
sauberen Vergleich sollte im White Paper **beides** ausgewiesen werden:
17.264 €/kW (nominal) und 12.408 €/kW (real, £2015). Sonst wird HPC im Vergleich
systematisch zu teuer dargestellt.

#### Südkorea / APR1400-Flotte — der günstigste Referenzfall

- **Inlandskosten:** In der Fachliteratur werden für in Korea gebaute APR1400
  **2.157 USD/kWe** genannt; verbreitet ist auch die Aussage, Korea baue APR1400
  „für weniger als 2.500 USD/kW Overnight-CAPEX". Das entspricht **1.867–2.163 €/kW**.
- **Aktuellster belastbarer Wert — Shin Hanul 3&4:** Projektvolumen **8,8 Mrd. USD**
  für 2 × 1.400 MW = **3.143 USD/kW = 2.720 €/kW**. Fertigstellung Anfang der 2030er.
  Dies ist der neueste koreanische Neubaupreis und damit die relevantere Referenz als
  historische Inlandswerte.
- **Export-Aufschlag:** Dieselbe Bauart kostete in den VAE laut Fachquellen
  **~5.800 USD/kWe**, also rund das **2,7-fache** des Inlandspreises.
- **Auch Korea hat Verzögerungen:** Die ersten kommerziellen APR1400 (Shin Kori 3 und 4)
  wurden 3 bzw. 5 Jahre später fertig als geplant, die Kosten stiegen um etwa **30 %**.
  Shin Hanul 1 brauchte neun Jahre Bauzeit. **Die häufige Darstellung „Korea baut
  pünktlich und im Budget" ist also zu vereinfacht.**
- **Warum so günstig?** Standardisierte Baureihe ohne Designänderungen zwischen den
  Blöcken, durchgehende Lieferkette ohne Unterbrechung seit den 1970ern, staatlich
  gesteuerte Finanzierung mit niedrigem WACC, ein einziger Betreiber (KHNP) mit
  eingespielten Bauteams, ein zentraler Regulator, deutlich niedrigere Bau- und
  Ingenieurskosten als in Westeuropa, und ein Rechtsrahmen mit geringerer
  Drittanfechtungsmöglichkeit.

**Prüfergebnis zum bestehenden Dokument:** Die dort genannten **2.116 €/kW** liegen in
der richtigen Größenordnung, die Quellenangabe („Schlanj/Substack") ist für ein
wissenschaftlich-neutrales Papier aber **zu schwach** — ein persönlicher Substack-Blog
ist keine zitierfähige Primärquelle. **Empfehlung:** Ersetzen durch eine Spanne
**1.870–2.720 €/kW** mit Verweis auf Fachliteratur (Pulaski-Foundation-Studie,
ScienceDirect-Paper zu internationalen Neubaukosten) und den Shin-Hanul-3&4-Vertragswert.

---

## 2. EU-Neubauprojekte — die eigentlich relevanten Referenzen

Das bestehende Dokument enthält **kein einziges EU-Neubauprojekt** außer Flamanville.
Das ist die größte inhaltliche Lücke, denn Polen, Tschechien und das französische
EPR2-Programm sind die *direktesten* Analogien zu einem hypothetischen deutschen
Programm: EU-Regulatorik, EU-Arbeitsmarkt, EU-Beihilferecht, EU-Zinsumfeld.

Und sie ändern das Bild: Sie liegen **deutlich unter** Hinkley Point C.

### 2.1 Polen — Lubiatowo-Kopalino (Westinghouse AP1000)

| Merkmal | Wert |
|---|---|
| Technik | 3 × AP1000, je 1.250 MWe brutto = **3,75 GW** |
| Standort | Gemeinde Choczewo, Pommern |
| Gesamtkosten | **192 Mrd. PLN ≈ 44,9 Mrd. €** |
| **€/kW (brutto)** | **11.968** |
| €/kW (bei ~3,35 GW netto) | ~13.400 |
| Baubeginn (erster Beton) | 2028 geplant |
| Inbetriebnahme | 2. Hälfte der 2030er (PEJ nannte zeitweise 2033) |

**Finanzierungsmodell (EU-Kommission, Beihilfeentscheidung 09.12.2025, IP/25/2963):**
Ein Paket aus drei Elementen —
1. **Kapitalzuführung ~14 Mrd. €** (PLN 60 Mrd.), das sind **30 % der Projektkosten**;
2. **Staatsgarantien für 100 % des Fremdkapitals** der Projektgesellschaft;
3. **Zweiseitiger Differenzvertrag (two-way CfD)** — ursprünglich über 60 Jahre
   beantragt, im Beihilfeverfahren auf **40 Jahre verkürzt**.

Zusätzlich: Kreditzusage der US-Exportkreditagentur **EXIM** (Februar 2026).

**Einordnung:** Das ist eine bemerkenswert ehrliche Zahl, weil sie **vor** Baubeginn
öffentlich gemacht und beihilferechtlich geprüft wurde — anders als bei Hinkley oder
Flamanville, wo die realistischen Zahlen erst nachträglich entstanden. Sie ist damit
allerdings auch eine **Planzahl**, die dem historischen Muster nach eher steigen wird.
Für Polen ist AP1000 ein FOAK-Projekt (erstes KKW des Landes überhaupt), aber auf
einer nicht-nuklearen Industriebasis mit hoher Bauwirtschaftskompetenz und niedrigeren
Lohnkosten als Westeuropa.

### 2.2 Tschechien — Dukovany II (KHNP APR1000)

| Merkmal | Wert |
|---|---|
| Technik | 2 × APR1000, je 1.055 MWe = **2.110 MW** |
| EPC-Vertrag | **407 Mrd. CZK = 18,6 Mrd. USD ≈ 16,7 Mrd. €** (unterzeichnet 06/2025) |
| **€/kW (nur EPC)** | **7.906** |
| Eigentümer | Elektrárna Dukovany II (80 % Staat, 20 % ČEZ) |
| Baubeginn | 2029 |
| Fertigstellung Block 1 | 2036 |

**Finanzierungsmodell:** Staatliches Darlehen (der Staat bot an, ~70 % der Blockkosten
zinsgünstig zu finanzieren), staatliche Mehrheitsbeteiligung an der Projektgesellschaft
und ein Abnahmemechanismus mit Preisabsicherung. Ein EDF-Rechtsstreit gegen die Vergabe
verzögerte die Vertragsunterzeichnung um rund 16 Monate; er wurde durch das Oberste
Verwaltungsgericht beendet.

**Kritische Einordnung — sehr wichtig:** Die 407 Mrd. CZK sind der **EPC-Vertragspreis**,
nicht die Gesamtprojektkosten. Nicht enthalten sind Eigentümerkosten, Standort-
erschließung, Netzanbindung, Genehmigungsverfahren und vor allem **Bauzinsen über
7+ Jahre**. Realistisch dürfte das Gesamtprojekt bei **9.000–11.000 €/kW** landen.
Trotzdem: Das ist ein **koreanischer Vertragspreis innerhalb der EU** und damit der
wichtigste Datenpunkt der ganzen Recherche. Er liegt bei rund dem **Dreifachen** des
koreanischen Inlandspreises, aber nur bei rund der **Hälfte** von Hinkley Point C.

### 2.3 Frankreich — EPR2-Programm (die beste verfügbare Analogie)

| Merkmal | Wert |
|---|---|
| Technik | 6 × EPR2 an drei Standorten (Penly, Gravelines, Bugey), ~9,6–10,0 GW |
| Schätzung 2022 | 51,7 Mrd. € |
| Schätzung 2023 (Cour des Comptes zitiert) | 67,4 Mrd. € |
| **Schätzung EDF, 18.12.2025** | **72,8 Mrd. € in Preisen von 2020**, entspricht **83 Mrd. € in Preisen 2025** — **ohne Finanzierungskosten** |
| Mit Finanzierungskosten | Presseangaben: **bis ~100 Mrd. €** |
| **€/kW (OCC, €2020)** | **7.265–7.583** |
| €/kW (OCC, €2025) | 8.283–8.646 |
| €/kW (inkl. Finanzierung) | ~9.980–10.400 |
| Investitionsentscheidung | Ende 2026 erwartet |
| Inbetriebnahme Block 1 (Penly) | **2038** (ursprünglich 2035) |

**Warum das die relevanteste Referenz ist:** Frankreich ist das einzige westeuropäische
Land mit durchgehender nuklearer Lieferkette, eigenem Reaktorhersteller, eingespieltem
Regulator und einem *seriellen* Programm (6 Blöcke, 3 Standortpaare). Wenn irgendwo in
Westeuropa Kernkraft günstig zu bauen ist, dann dort. **Ergebnis: 7.300 €/kW Overnight
im günstigsten Fall, ~10.000 €/kW inklusive Finanzierung — und das ist eine
Vorab-Schätzung, die sich seit 2022 bereits um 40 % erhöht hat, ohne dass ein einziger
Kubikmeter Beton gegossen wurde.**

Das ist zugleich der **fairste Einwand gegen die pessimistische Lesart**: Die
GES-Studien-Annahme von 6.000 €/kW ist keine willkürliche Zahl — sie liegt nur
knapp unter dem, was EDF selbst für ein serielles Programm ohne Finanzierungskosten
ansetzt. Sie ist aber definitiv **kein realistischer Wert für ein deutsches
Erstprojekt** und sie ignoriert die Finanzierungskosten.

### 2.4 UK — Sizewell C (RAB-Modell)

| Merkmal | Wert |
|---|---|
| Technik | 2 × EPR, **3,2 GW** (3.260 MW) |
| Kosten bei FID (22.07.2025) | **38 Mrd. £ ≈ 43,9 Mrd. €** (Erstschätzung 05/2020: 20 Mrd. £) |
| **€/kW** | **13.472** |
| Bauzeit | ~10 Jahre |
| Eigenkapital | UK-Regierung 44,9 %, La Caisse 20 %, Centrica 15 %, EDF 12,5 %, Amber Infrastructure 7,6 % |
| Fremdkapital | 5 Mrd. £ exportkreditgedeckt, Investment-Grade-Rating |

**Finanzierungsmodell: RAB (Regulated Asset Base)** — der zweite große Kontrast zu
Hinkley. Statt eines CfD, der erst nach Inbetriebnahme greift, zahlen die Stromkunden
**während der Bauzeit** über eine Umlage. Vorteil: Der Bauherr erhält schon während
des Baus regulierte Erlöse, was den Kapitalkostensatz massiv senkt (Hinkley wurde mit
einem WACC im hohen einstelligen Bereich kalkuliert). Nachteil: Das **Bau- und
Kostensteigerungsrisiko liegt bei den Verbrauchern**, nicht beim Investor.
Die RAB-Umlage wirkt seit **Dezember 2025** auf britische Stromrechnungen mit
zunächst **0,3 Pence/kWh**.

**Für das Modell relevant:** RAB ist genau der Mechanismus, mit dem man den in
Abschnitt 5 diskutierten WACC-Effekt umgeht — aber nicht, indem das Risiko verschwindet,
sondern indem es umverteilt wird. Ein Kostenmodell, das RAB-Finanzierung unterstellt,
muss den Verbraucherbeitrag während der Bauzeit explizit ausweisen, sonst rechnet es
Kosten weg statt sie zu senken.

### 2.5 Ungarn — Paks II (nicht als Referenz verwendbar)

- **Technik:** 2 × VVER-1200 (Rosatom), 2.400 MW.
- **Budget:** **12,5 Mrd. €** — Stand **2014**, davon 10 Mrd. € russisches Staatsdarlehen.
- **Status:** Erste Betonarbeiten für Block 5 ab **November 2025** genehmigt, Baugrube
  Block 6 ab 2026. Ursprünglich sollten beide Blöcke **bis spätestens 2026 kommerziell
  laufen** → rund **10 Jahre Verzug**, bevor der Bau überhaupt richtig begonnen hat.
- **Kosten heute:** **Unbekannt.** Analysen (u. a. Heinrich-Böll-Stiftung Prag, 06/2026)
  weisen darauf hin, dass die Kosten deutlich gestiegen sind, die tatsächliche
  Investitionssumme aber nicht veröffentlicht wird.

**Bewertung: Paks II ist als Kostenreferenz unbrauchbar** — der Preis von 5.208 €/kW
ist ein politisch ausgehandelter Paketpreis von 2014 mit intransparenter russischer
Staatsfinanzierung und wird von keiner unabhängigen Stelle bestätigt. Er sollte
**nicht** in das Modell einfließen, kann aber als Beispiel für Intransparenz und
geopolitische Abhängigkeitsrisiken erwähnt werden.

---

## 3. SMR — nüchterner Statusbericht

### 3.1 Die Kernaussage

**Stand Mitte 2026 ist weltweit kein SMR-Design westlicher Bauart im kommerziellen
Betrieb.** Es gibt kein einziges fertiggestelltes Referenzprojekt, aus dem man reale
€/kW ableiten könnte. Alle kursierenden SMR-Kostenzahlen sind entweder Herstellerangaben,
Projektschätzungen vor Baubeginn oder — im einzigen Fall mit belastbarer Datenreihe —
die Zahlen eines **gescheiterten** Projekts.

### 3.2 NuScale / Carbon Free Power Project (USA) — der dokumentierte Fehlschlag

| Zeitpunkt | Zielpreis | Investitionskosten | Bemerkung |
|---|---|---|---|
| Mitte 2021 | 58 USD/MWh | 5,3 Mrd. USD | 462 MW (6 Module à 77 MWe) |
| Januar 2023 | **89 USD/MWh** (+53 %) | **9,3 Mrd. USD** (+75 %) | = **20.130 USD/kW ≈ 17.421 €/kW** |
| 08.11.2023 | — | — | **Projekt einvernehmlich beendet** |

Grund der Beendigung: Die Kostensteigerung führte dazu, dass zu wenige
UAMPS-Mitgliedsversorger Abnahmeverpflichtungen zeichneten; die für den Weiterbau nötige
Zeichnungsquote wurde nicht erreicht.

**Einordnung:** 17.400 €/kW ist der höchste €/kW-Wert dieser gesamten Recherche —
höher als Hinkley Point C. Das ist die empirische Widerlegung der zentralen
SMR-These („kleiner = billiger durch Serienfertigung"), zumindest für das erste Modul.
Fairerweise: Es war ein FOAK-Projekt, und Serieneffekte können sich definitionsgemäß
erst ab dem 5.–20. Exemplar zeigen. Nur ist dieser Beweis bis heute nicht angetreten.

### 3.3 Weitere ernstzunehmende Projekte

**OPG Darlington (Kanada, GE Vernova Hitachi BWRX-300)** — das derzeit am weitesten
fortgeschrittene westliche SMR-Projekt:

| Merkmal | Wert |
|---|---|
| Genehmigung | Bau-Lizenz der CNSC, April 2025 |
| Status | Erstes Basemat-Modul 2026 installiert — **einziger SMR-Bau im Westen** |
| Erster Block | 300 MWe, **6,1 Mrd. CAD** + **1,6 Mrd. CAD** gemeinsame Infrastruktur |
| **€/kW erster Block (inkl. gemeinsamer Infra)** | **~15.950** |
| Gesamtprogramm | 4 Blöcke, 1.200 MW, **20,9 Mrd. CAD** (CAD 2024, **inkl. Zinsen und Reserven**) |
| **€/kW Gesamtprogramm** | **~10.825** |
| Fertigstellung | Block 1 2029/2030, alle vier bis 2035 |

Das Verhältnis 15.950 → 10.825 €/kW ist die bislang **beste öffentlich dokumentierte
Quantifizierung des Serieneffekts bei SMR**: rund **−32 %** vom ersten zum
Durchschnitt über vier Blöcke. Immer noch teurer pro kW als Sizewell C.

**RoPower Doicești (Rumänien, NuScale, 6 Module, 462 MW)** — Umwandlung eines
Kohlestandorts. Die Aktionäre von Nuclearelectrica haben Anfang 2026 den Übergang in
die nächste Phase gebilligt (in mehreren Quellen als „FID" bezeichnet). **Die Kosten
sind nicht öffentlich.** Der rumänische Energieminister erklärte Anfang März 2026, man
befinde sich in der Detailstudienphase und werde die finale Investitionsentscheidung
frühestens Ende 2026 oder im Folgejahr treffen können. Fertigstellung **nach 2030**.
→ ❓ **Als Kostenreferenz derzeit nicht verwendbar.**

### 3.4 Realistische Zeithorizonte

Auf Basis des Vorstehenden, konservativ und ohne Herstellerversprechen:

| Meilenstein | Realistischer Zeitpunkt |
|---|---|
| Erster netzgekoppelter SMR im Westen | ~2030 (Darlington) |
| Belastbare Ist-Kostendaten aus dem Betrieb | ~2031–2032 |
| Nachweis von Serieneffekten (Block 3–4 einer Reihe) | ~2034–2036 |
| Frühestmöglicher Beitrag in Deutschland in nennenswertem Umfang | **2040er** |

**Für das Strommix-Modell folgt daraus:** SMR sollten für ein Zieljahr 2045 allenfalls
als Sensitivitäts-Szenario mit sehr breiter Spanne (**8.000–18.000 €/kW**) auftauchen,
nicht als Basisannahme. Wer heute mit „SMR machen Kernkraft billig" rechnet, extrapoliert
aus null Betriebserfahrung.

---

## 4. Betriebskosten, Brennstoff, Rückbau, Endlagerung, Versicherung

### 4.1 Betriebskosten und Brennstoff — die belastbaren Zahlen

**USA (bestehende Flotte, NEI/EUCG-Erhebung):**

| Position | 2023 | Umgerechnet |
|---|---|---|
| Brennstoff | 5,32 USD/MWh | **4,60 €/MWh** |
| Betrieb (O&M) | 19,38 USD/MWh | **16,77 €/MWh** |
| Kapital (laufende Investitionen im Bestand) | 7,06 USD/MWh | 6,11 €/MWh |
| **Gesamt-Erzeugungskosten** | **~32 USD/MWh** | **~27,7 €/MWh** |

2024er Werte: Merchant-Anlagen 30,11 USD/MWh, regulierte Anlagen 36,51 USD/MWh.

**Frankreich:** Brennstoffkosten der Flotte **~8 €/MWh** (2025), leicht steigend wegen
höherer Uran-, Konversions- und Anreicherungspreise. Die französische Regulierungs-
behörde CRE beziffert die Kosten der **bestehenden** Flotte mit **~60 €/MWh** — das ist
allerdings eine abgeschriebene Flotte inklusive Laufzeitverlängerungsinvestitionen
(Grand Carénage), **kein Neubauwert**.

**Uranpreis-Sensitivität:** Eine Verdopplung des Uranpreises von 25 auf 50 USD/lb U₃O₈
erhöht die Brennstoffkosten nur von 0,50 auf 0,62 ¢/kWh (5,0 → 6,2 USD/MWh). Der
Brennstoff macht rund **17 %** der Erzeugungskosten aus; davon ist etwa die Hälfte
Verarbeitung, Anreicherung und Fertigung, nicht der Rohstoff. **Kernkraft ist gegenüber
Brennstoffpreisen also strukturell unempfindlich** — das ist ein realer, oft zu Recht
angeführter Vorteil gegenüber Gas.

### 4.2 ⚠️ Ein methodischer Befund zum bestehenden Faktencheck-Dokument

Die GES-Studie rechnet mit **7 % des CAPEX pro Jahr** als Opex (inkl. Rückbau und
Endlagerung). Bei 6.000 €/kW sind das **420 €/kW/a**, bei 8.000 Volllaststunden also
**52,5 €/MWh**.

Bottom-up gegengerechnet: US-Betriebskosten 16,8 €/MWh + Brennstoff 4,6 €/MWh +
großzügig 10 €/MWh für Rückbau/Entsorgung = **~31 €/MWh = ~250 €/kW/a = ~4,2 % von
6.000 €/kW**. Die Studien-Annahme von 7 % ist also eher **großzügig** — sie
kompensiert einen Teil des zu niedrigen CAPEX-Ansatzes.

**Das muss im White Paper fairerweise erwähnt werden.** Es schwächt die Aussage
„die Studie unterschätzt Kernkraft um 100–170 %" ab — die Verzerrung besteht, ist aber
kleiner als eine reine CAPEX-Betrachtung nahelegt.

**Und es hat eine gravierende Konsequenz für den geplanten CAPEX-Slider:**
Wenn Opex als **Prozentsatz des CAPEX** modelliert wird und der Nutzer den CAPEX von
6.000 auf 17.000 €/kW schiebt, verdreifachen sich automatisch auch die Betriebskosten
auf 1.190 €/kW/a = **149 €/MWh** — was physikalisch unsinnig ist. Der Betrieb eines
Kraftwerks wird nicht dreimal so teuer, nur weil der Bau teurer war.

> **Empfehlung für das Modell:** Opex **absolut** in €/kW/a modellieren
> (Empfehlung 130–200 €/kW/a) statt als CAPEX-Prozentsatz. Alternativ: opex_pct an
> einen festen Referenz-CAPEX koppeln, nicht an den Slider-Wert. Andernfalls
> überzeichnet der Slider den Kernkraft-Kostenanstieg erheblich — was das White Paper
> angreifbar machen würde.

### 4.3 Rückbau und Endlagerung — die deutsche Datenlage

| Position | Betrag | Quelle |
|---|---|---|
| Rückbau je Leistungsreaktorblock | **1,0–1,5 Mrd. €**, Dauer 15–20 Jahre | BMWE |
| Rückstellungen der Betreiber (EnBW, RWE, E.ON, Vattenfall) | **38,3 Mrd. €**, basierend auf geschätzten Kosten von **47,5 Mrd. €** zu heutigen Preisen | BMWE / BAFA |
| Einzahlung in den KENFO (01.07.2017) | **24,1 Mrd. €** | BMUV / KENFO |
| KENFO-Stiftungsvermögen Ende 2025 | **~25,6 Mrd. €** (~30,9 Mrd. € inkl. bisheriger Auszahlungen) | KENFO-Jahresbericht 2025 |
| KENFO-Wertentwicklung 2025 | **+6,2 %** nach Kosten (Zielrendite ~4,0 %) | KENFO |
| Bisher erwirtschaftet / ausgezahlt | 8,8 Mrd. € erwirtschaftet, 5,3 Mrd. € ausgezahlt | KENFO |
| Auszahlung an den Bund 2025 | ~823 Mio. € | KENFO |
| Ausgaben Bund 2024 für Zwischen-/Endlagerung | 1,144 Mrd. € | Bundeshaushalt |

**Wie die Risikoteilung funktioniert:** Die Betreiber tragen den **Rückbau** ihrer
Anlagen selbst (Rückstellungen, unbegrenzte Nachschusspflicht). Für **Zwischenlagerung
und Endlagerung** haben sie sich mit der Einmalzahlung von 24,1 Mrd. € plus Risiko-
aufschlag **vollständig freigekauft** — jedes darüber hinausgehende Risiko trägt seit
2017 der Steuerzahler.

Die Zielrendite von ~4 % p. a. muss über rund 80 Jahre erreicht werden, um die
Entsorgung bis 2100 zu finanzieren. 2025 wurde sie mit 6,2 % übertroffen; ob das über
acht Jahrzehnte durchhält, ist eine offene Frage — der Fonds selbst formuliert die
Zielrendite als Voraussetzung, nicht als Gewissheit.

❓ **Nicht verifizierbar:** Eine in Sekundärquellen kursierende Angabe, der Bund schätze
die Gesamtkosten der nuklearen Entsorgung bis 2100 auf **~170 Mrd. €**, konnte in
dieser Recherche **nicht gegen eine Primärquelle geprüft** werden. Der offizielle
„Bericht über Kosten und Finanzierung der Entsorgung, Deutschland 2025" (BMUV,
Dezember 2025) existiert als PDF, war hier aber nicht abrufbar. **Diese Zahl sollte
ohne Primärprüfung nicht ins White Paper.**

**Der eigentliche Punkt, der auch im bestehenden Dokument richtig steht:** Kein Land
der Welt betreibt bislang ein Endlager für hochradioaktive Abfälle. Die Kostenschätzung
bezieht sich auf ein Vorhaben ohne jede Referenzerfahrung. Die Unsicherheit ist damit
struktureller Natur — sie lässt sich nicht durch bessere Schätzverfahren beseitigen.

### 4.4 Die Versicherungsfrage

| Merkmal | Deutschland |
|---|---|
| Haftung dem Grunde nach | **Unbegrenzt** (§ 31 AtG, seit 01.08.1985) |
| Vorgeschriebene Deckungsvorsorge | **2,5 Mrd. €** je Anlage (AtDeckV) |
| Davon durch echte Versicherung gedeckt | **256 Mio. €** |
| Rest (2,244 Mrd. €) | **Solidarvereinbarung der Betreiber** untereinander, keine Versicherung |
| Freistellungsverpflichtung des Bundes (§ 34 AtG) | bis maximal **2,5 Mrd. €** |

**Das ist der ökonomisch entscheidende Punkt:** Die Haftung ist formal unbegrenzt, die
tatsächlich vorhandene Deckungsmasse aber auf 2,5 Mrd. € begrenzt. Zum Vergleich: Die
Schäden von Fukushima werden auf eine Größenordnung von mehreren hundert Milliarden Euro
geschätzt. Die Differenz ist eine **implizite Staatsgarantie**, die in keinem LCOE-Wert
auftaucht — auch in keinem der Referenzprojekte in Abschnitt 1.

⚠️ **Vorsicht bei einer verbreiteten Zahl:** Es kursiert die Aussage, eine
vollständige Haftpflichtversicherung würde den Strompreis „um den Faktor 40" erhöhen.
Diese Zahl geht auf eine im Auftrag des Bundesverbands Erneuerbare Energie erstellte
Studie (Versicherungsforen Leipzig, 2011) zurück und ist **stark annahmeabhängig und
umstritten** (Ergebnisspanne je nach Ansparzeitraum um Größenordnungen). Sie sollte im
White Paper **nur als Hinweis auf die Nicht-Versicherbarkeit** verwendet werden, nicht
als quantitative Aussage. **Die belastbare, unstrittige Aussage lautet:** Es existiert
kein privater Versicherungsmarkt, der das Maximalschadenspotenzial eines KKW abdeckt;
das Restrisiko trägt die Allgemeinheit.

---

## 5. Bauzeiten und die WACC-Sensitivität

### 5.1 Bauzeiten-Verteilung — die faire Darstellung

Auf Basis der IAEA-PRIS-Datenbank (weltweit, alle jemals gebauten Reaktoren, gemessen
vom ersten Beton bis zum kommerziellen Betrieb; Auswertung Hannah Ritchie / Our World
in Data):

| Kennzahl | Wert |
|---|---|
| **Median** | **6,3 Jahre** |
| Mittelwert | 7,5 Jahre |
| Anteil < 5 Jahre | 21 % |
| Anteil < 8 Jahre | 68 % |
| Anteil < 10 Jahre | 83 % |
| Verteilungsform | Rechtsschief mit **langem Ausläufer** — einzelne Reaktoren brauchten Jahrzehnte |

Schnellste Länder: Japan, Südkorea, China.

**Und nun die westlichen Aktualprojekte im selben Maßstab:**

| Projekt | Bauzeit |
|---|---|
| Flamanville 3 | **17 Jahre** (2007 → 2024/25) |
| Vogtle 3 | 10,3 Jahre |
| Vogtle 4 | ~11 Jahre |
| Hinkley Point C | **12+ Jahre** (2018 → 2030/31, noch nicht fertig) |
| Barakah (Block 1) | ~8 Jahre |
| Shin Hanul 1 | ~9 Jahre |

**Die ehrliche Doppelaussage:** Der globale Median von 6,3 Jahren ist real und wird oft
zu Unrecht ignoriert. Er wird aber dominiert von historischen Bauten der 1970er/80er und
von asiatischen Serienprogrammen. **Jedes einzelne westliche Neubauprojekt der letzten
20 Jahre lag deutlich über dem Median** — zwischen 10 und 18 Jahren. Für eine
Deutschland-Prognose ist der Median die falsche Kennzahl; der relevante Vergleich ist
das obere Quartil bzw. der westliche Ausläufer.

**Zusatzzeit, die in keiner Bauzeitstatistik steht:** Vor dem ersten Beton liegen
Standortauswahl, Genehmigungsverfahren, Ausschreibung und Investitionsentscheidung. In
Polen: Technologieentscheidung 11/2022 → Baubeginn 2028 = **6 Jahre**. In Tschechien:
Vergabe 07/2024 → Baubeginn 2029 = **5 Jahre**. In Deutschland käme hinzu, dass Neubau
nach geltendem Atomgesetz **verboten** ist, keine Genehmigungsbehörde mehr über die
nötigen Kapazitäten verfügt und kein Lieferketten- oder Fachkräftebestand existiert.
Ein realistischer Gesamtpfad von der politischen Entscheidung bis zum ersten
kommerziellen Block liegt bei **18–25 Jahren** — womit ein Beitrag zum Zieljahr 2045
weitgehend ausscheidet, selbst bei sofortiger Entscheidung.

### 5.2 WACC — der stärkste einzelne Hebel

Kernkraft ist die **kapitalkostensensitivste** aller Erzeugungstechnologien: Die
Investition fällt vollständig 10–15 Jahre vor der ersten Kilowattstunde an, und die
Rückzahlung streckt sich über 40–60 Jahre. Beides maximiert den Zinseszinseffekt.

**Empirischer Beleg (IEA/NEA, „Projected Costs of Generating Electricity", Ausgabe
2020, 243 Anlagen aus 24 Ländern, 85 % Auslastungsgrad unterstellt):**

| Diskontsatz | Nuklear-LCOE (Länderspanne) |
|---|---|
| **3 %** | 27 USD/MWh (Russland) – 61 USD/MWh (Japan) |
| **7 %** | 42 USD/MWh (Russland) – 102 USD/MWh (Slowakei) |
| **10 %** | 57 USD/MWh (Russland) – **146 USD/MWh (Slowakei)** |

Bei 3 % ist Kernkraft in **allen** untersuchten Ländern die günstigste Option. Bei 10 %
ist sie es in praktisch keinem. **Dieselbe Technologie, dieselben Baukosten — nur eine
andere Finanzierungsannahme.**

### 5.3 Eigene Sensitivitätsrechnung (Annuitätenmethode wie im Faktencheck-Dokument)

Kapitalwiedergewinnungsfaktor CRF = r·(1+r)ⁿ / ((1+r)ⁿ − 1)

**Effekt der Nutzungsdauer (bei r = 5 %):**

| n | CRF | Relativ zu n = 60 |
|---|---|---|
| 40 Jahre | 0,05828 | +10,3 % |
| **60 Jahre** | **0,05283** | Referenz |
| 65 Jahre | 0,05219 | −1,2 % |
| 80 Jahre | 0,05103 | −3,4 % |

→ **Die Nutzungsdauer ist ein schwacher Hebel.** Ob 60 oder 80 Jahre gerechnet wird,
ändert die LCOE um 3 %. Wer Laufzeitverlängerung als Kostenargument anführt, überschätzt
den Effekt erheblich — Abzinsung entwertet späte Jahre fast vollständig.

**Effekt des WACC (bei n = 60 Jahren):**

| r | CRF | Faktor ggü. 3 % |
|---|---|---|
| 3 % | 0,03613 | 1,00 |
| **5 %** | **0,05283** | 1,46 |
| 7 % | 0,07124 | 1,97 |
| 9 % | 0,09051 | 2,51 |
| 10 % | 0,10033 | **2,78** |

→ **Der WACC ist der mit Abstand stärkste Hebel — stärker als jede plausible
CAPEX-Variation.**

**Durchgerechnetes Beispiel** (CAPEX 12.000 €/kW, 7.500 Volllaststunden, n = 60,
Opex 240 €/kW/a, Brennstoff 8 €/MWh, Entsorgung 8 €/MWh):

| WACC | Kapitalanteil €/MWh | **LCOE gesamt €/MWh** |
|---|---|---|
| 3 % | 57,8 | **105,8** |
| 5 % | 84,5 | **132,5** |
| 7 % | 114,0 | **162,0** |
| 9 % | 144,8 | **192,8** |
| 10 % | 160,5 | **208,5** |

### 5.4 Warum ein einheitlicher WACC im Modell nicht neutral ist

Das ist der methodisch wichtigste Punkt dieses Abschnitts.

Die GES-Studie rechnet mit **5 % WACC für alle Technologien** — das wirkt neutral, ist
es aber nicht, aus zwei Gründen:

1. **Bauzinsen (IDC).** 5 % über eine 1-jährige PV-Bauzeit ist praktisch null.
   5 % über eine 10-jährige Kernkraft-Bauzeit sind **+25–30 % auf die Baukosten**;
   bei 12 Jahren und 7 % sind es **+45–50 %**. Wenn das Modell nur CAPEX × CRF rechnet
   und die Bauzeit nicht abbildet, **verschenkt es diesen Aufschlag zugunsten der
   Technologie mit der längsten Bauzeit.** Genau das erklärt, warum EDF für EPR2
   72,8 Mrd. € ohne, aber ~100 Mrd. € mit Finanzierungskosten nennt — ein Aufschlag
   von rund **37 %**.

2. **Risikoprofil.** 5 % ist ein sozialer Diskontsatz, kein Marktzins. Real finanzierte
   westliche Kernkraftprojekte kalkulieren mit deutlich höheren Sätzen — genau deshalb
   wurden CfD (Hinkley), RAB (Sizewell C), Staatsgarantien für 100 % des Fremdkapitals
   (Polen) und zinsgünstige Staatsdarlehen (Tschechien) überhaupt erst notwendig.
   **Jedes einzelne europäische Neubauprojekt braucht ein staatliches Instrument, um
   den Kapitalkostensatz künstlich zu senken.** Das ist ein Faktum, kein Werturteil —
   aber es zeigt, dass 5 % nicht der Marktpreis für dieses Risiko ist.

> **Empfehlung für das White Paper:** Den WACC als eigenen Slider führen (3–10 %),
> die Bauzeit und den daraus resultierenden IDC-Aufschlag **explizit** modellieren, und
> beide Effekte für alle Technologien gleichzeitig anwenden. Dann sieht der Leser
> selbst, dass die Kernkraftfrage in Europa im Kern eine **Finanzierungsfrage** ist —
> und dass die 5 %-Annahme eine wohlwollende Annahme *zugunsten* der Kernkraft ist,
> nicht gegen sie.

---

## 6. Prüfergebnis: die Werte im bestehenden Faktencheck-Dokument

| Wert im Dokument | Prüfergebnis | Empfohlene Korrektur |
|---|---|---|
| Hinkley Point C **17.250 €/kW** | ✅ **Bestätigt** (48,7 Mrd. £ laufende Preise / 3.260 MW). Quelle IWR korrekt, Primärquelle ist die EDF-Ergebnismeldung vom 20.02.2026. | Beibehalten, aber **Preisbasis ausweisen** und den Realwert (£2015: 12.408 €/kW) daneben stellen. |
| Vogtle 3&4 **12.388 €/kW** | ⚠️ **Zu niedrig.** Entspricht 15.000 USD/kW bei ~1,21 USD/EUR — Kurs nicht ausgewiesen. Gesamtkosten 36,8 Mrd. USD. | Auf **13.500 €/kW** (Spanne 12.980–14.260) korrigieren, Kurs dokumentieren. |
| Flamanville 3 **14.364 €/kW** | ✅ **Bestätigt** (23,7 Mrd. € €2023 / 1.650 MW). | Beibehalten. Quelle ändern auf **Cour des Comptes, 14.01.2025** statt WNA. |
| Korea APR1400 **2.116 €/kW** | ⚠️ Größenordnung plausibel, **Quelle unzureichend** (Substack-Blog). | Auf **Spanne 1.870–2.720 €/kW** umstellen, Shin Hanul 3&4 (8,8 Mrd. USD / 2.800 MW) als aktuellste Referenz, Fachliteratur zitieren. |
| Barakah **5.257 €/kW** | ⚠️ Bei einheitlichem Kurs **4.945 €/kW**; zudem existiert der niedrigere EPC-Vertragswert. | Auf **Spanne 3.150–4.950 €/kW** umstellen. |
| **Mittelwert der 5 Projekte: 10.275 €/kW** | ❌ **Methodisch nicht haltbar.** Ungewichtetes arithmetisches Mittel über fünf Projekte mit völlig unterschiedlichen Abgrenzungen, Preisbasen, Baujahren und Blockzahlen. Der Wert hat keine ökonomische Bedeutung. | **Streichen.** Ersetzen durch getrennte Cluster (Asien/Golf · EU-Serie · West-FOAK) mit Bandbreiten. |
| Befund „Studie unterschätzt Kernkraft um 100–170 %" | ⚠️ **Zu stark.** Gilt gegen West-FOAK, nicht gegen ein serielles EU-Programm. Zudem kompensiert die großzügige Opex-Annahme der Studie (7 %/a) einen Teil des Effekts. | Differenzieren: **~25–45 % Unterschätzung** ggü. seriellem EU-Programm (EPR2/Dukovany), **~100–190 %** ggü. westlichem Erstprojekt. |
| **Fehlend: EU-Neubauprojekte** | ❌ Größte Lücke. Polen, Tschechien, EPR2 und Sizewell C fehlen — obwohl sie die direktesten Analogien sind. | Abschnitt 2 dieses Dokuments einarbeiten. |
| **Fehlend: WACC/IDC-Diskussion** | ❌ Der stärkste Kostentreiber wird nicht behandelt. | Abschnitt 5 einarbeiten. |
| Quelle „MIT Climate Portal (2026)" | ✅ Seite existiert, Zahl (~15.000 USD/kW) bestätigt. Publikationsdatum in dieser Session nicht verifizierbar. | Datum als „o. D." kennzeichnen oder nachprüfen. |
| Quelle „Ontario Clean Air Alliance" (Vogtle) | ❓ In dieser Recherche **nicht auffindbar**. | Ersetzen durch EIA / Columbia CGEP / POWER Magazine. |
| Quelle „Schlanj/Substack (2026-04-06)" | ⚠️ Beitrag existiert (schlanj.substack.com), aber **Blog ohne Peer Review**. | Für ein wissenschaftliches Papier ersetzen. |
| Quelle „World Nuclear Association (Dez. 2025)" (Flamanville) | ⚠️ Domain in dieser Session nicht abrufbar; die Zahl stammt ohnehin vom Cour des Comptes. | Auf Primärquelle umstellen. |

---

## 7. Ableitung: empfohlene Modellparameter für ein EU-Neubauszenario

### 7.1 CAPEX — drei begründete Szenarien

| Szenario | CAPEX €/kW | Begründung / Ankerprojekt |
|---|---|---|
| **Low** | **7.500** | Serielles Programm, staatlich derisked, erfahrener Lieferant. Anker: EPR2-Overnight (7.265–7.583 €/kW, €2020) und Dukovany-EPC (7.906 €/kW). **Nur erreichbar bei ≥ 6 Blöcken identischer Bauart und Turnkey-Festpreis.** Für Deutschland unrealistisch optimistisch. |
| **Mid** | **12.000** | Westliches Neubauprojekt mit starker staatlicher Absicherung. Anker: Polen (11.968 €/kW), Sizewell C (13.472 €/kW), EPR2 inkl. Finanzierung (~10.000 €/kW). **Das ist der plausibelste Zentralwert für ein deutsches Programm mit Serienabsicht.** |
| **High** | **17.500** | Echtes FOAK in einem Land ohne Lieferkette, Genehmigungspraxis und Fachkräftebestand. Anker: Hinkley Point C (17.264 €/kW). **Für ein deutsches Erstprojekt ist dies eher der Erwartungs- als der Extremwert**, da Deutschland zusätzlich zu allen HPC-Nachteilen noch ein gesetzliches Neubauverbot, eine abgewickelte Regulierungsbehörde und keinerlei Bauerfahrung seit 1989 hat. |

**Was diese Spanne ehrlich macht:** Sie enthält kein einziges asiatisches oder
Golf-Projekt. Nicht weil diese Werte falsch wären — sie sind real und belegt — sondern
weil ihre Voraussetzungen (Serienbau ohne Unterbrechung, staatliche Lieferketten-
steuerung, niedrige Bau- und Ingenieurlöhne, eingeschränkte Drittanfechtung) in
Deutschland rechtlich und ökonomisch nicht herstellbar sind. Sie gehören als
**Kontrastwerte** ins White Paper — mit genau dieser Erklärung — aber nicht in die
Modell-Basisspanne.

### 7.2 Übrige Parameter

| Parameter | Low | Mid | High | Begründung |
|---|---|---|---|---|
| **Opex** (absolut) | 130 €/kW/a | 165 €/kW/a | 200 €/kW/a | Abgeleitet aus US-Ist-Betriebskosten 19,38 USD/MWh × 8.000 h ≈ 134 €/kW/a; Aufschlag für europäische Lohn- und Sicherheitsstandards. **Absolut modellieren, nicht als CAPEX-%!** |
| *Opex als % (falls Modell es erfordert)* | *1,4 %* | *1,4 %* | *1,1 %* | Bezogen auf den jeweiligen Szenario-CAPEX. **Muss beim Verschieben des CAPEX-Sliders neu berechnet werden, sonst falsch.** |
| **Brennstoff** €/MWh | 6 | 8 | 11 | Frankreich 2025: ~8 €/MWh. USA: 4,6 €/MWh (günstigerer Beschaffungsmarkt). Aufschlag oben für Diversifizierung weg von russischer Anreicherung. |
| **Entsorgung/Rückbau** €/MWh | 5 | 8 | 14 | Separater Posten (im GES-Modell in den 7 % Opex versteckt). Ankerpunkte: KENFO 24,1 Mrd. €, Rückbau 1,0–1,5 Mrd. €/Block, Rückstellungen 47,5 Mrd. €. Oberer Wert wegen Endlager-Restrisiko. |
| **Volllaststunden** | 6.500 | 7.500 | 8.000 | 8.000 h = 91 % Verfügbarkeit — nur von Bestflotten erreicht. **Wichtig:** In einem System mit hohem PV-/Windanteil muss Kernkraft lastfolgen, was die Auslastung strukturell senkt. Wer 8.000 h *und* hohen EE-Anteil unterstellt, rechnet inkonsistent. *(Modellannahme, nicht quellenbelegt.)* |
| **Nutzungsdauer** | 60 J. | 60 J. | 60 J. | Regulatorischer Standard (Polen-CfD war auf 60 J. Lebensdauer bezogen). Hebel ohnehin schwach (siehe 5.3): 40 vs. 80 Jahre = 14 % CRF-Differenz. |
| **WACC** | 3 % | 5 % | 9 % | Low = sozialer Diskontsatz / RAB-Modell; Mid = GES-Annahme; High = marktnahe Projektfinanzierung ohne Staatsgarantie (HPC-Niveau). **Der wichtigste Slider.** |
| **Bauzeit** | 8 J. | 12 J. | 17 J. | Low = bestes westliches Ergebnis (Barakah/Korea-Niveau); Mid = Vogtle/HPC; High = Flamanville. Globaler Median 6,3 J. gilt für die Modellierung **nicht**. |
| **Vorlaufzeit vor erstem Beton** | 5 J. | 8 J. | 12 J. | Polen: 6 J. (Technologiewahl → Beton). Deutschland zusätzlich: Aufhebung des Neubauverbots, Behördenaufbau, Standortverfahren. *(Modellannahme.)* |
| **IDC-Aufschlag auf CAPEX** | +20 % | +33 % | +55 % | Aus WACC × Bauzeit. Belegt durch EPR2: 72,8 Mrd. € ohne → ~100 Mrd. € mit Finanzierung = **+37 %**. |

### 7.3 Resultierende LCOE-Spanne

Mit den obigen Parametern (ohne IDC-Aufschlag, da im CAPEX-Anker teilweise enthalten):

| Szenario | CAPEX | WACC | VLS | **LCOE €/MWh** |
|---|---|---|---|---|
| Optimistisch | 7.500 | 3 % | 8.000 | **~59** |
| GES-nah | 6.000 | 5 % | 8.000 | **~62** *(vs. 102 in der Studie — Differenz kommt allein aus der Opex-Annahme)* |
| Realistisch EU | 12.000 | 5 % | 7.500 | **~133** |
| Realistisch DE | 12.000 | 7 % | 7.500 | **~162** |
| Pessimistisch | 17.500 | 9 % | 6.500 | **~275** |

**Plausibilitätsprüfung gegen unabhängige Dritte:**

| Quelle | Nuklear-LCOE Neubau |
|---|---|
| **Fraunhofer ISE**, Stromgestehungskosten, Juli 2024 | **13,6–49,0 ct/kWh = 136–490 €/MWh** |
| **Lazard LCOE+ v18**, Juni 2025 (unsubventioniert, USA) | 141–220 USD/MWh = **122–190 €/MWh** |
| **Hinkley Point C CfD**, indexierter Wert 17.01.2026 | 127 £/MWh = **~147 €/MWh** |
| **IEA/NEA 2020** bei 7 % Diskontsatz | 42–102 USD/MWh = **36–88 €/MWh** *(niedrigere Baukostenannahmen, überwiegend nicht-westliche Länder)* |

→ Die hier abgeleitete Spanne von **~130–275 €/MWh** für ein realistisches
deutsches/europäisches Neubauszenario liegt im unteren bis mittleren Bereich der
Fraunhofer-ISE-Spanne, deckt sich mit Lazard und wird vom einzigen real
vertraglich fixierten Wert (Hinkley-CfD, 147 €/MWh) mittig getroffen. **Das ist ein
gutes Validierungssignal.**

→ Die IEA/NEA-Werte liegen deutlich darunter, weil sie überwiegend nicht-westliche
Länder mit niedrigeren Baukosten abbilden und weil sie eine Vorab-Kostenschätzung
(2020) sind, keine Ist-Kosten realisierter westlicher Projekte.

---

## 8. Fazit in fünf Sätzen

1. **Die Spannbreite realer Neubaukosten beträgt mehr als das Neunfache** — von
   ~1.900 €/kW (Korea Inland) bis ~17.300 €/kW (Hinkley Point C). Ein einzelner
   Punktwert ist in dieser Debatte immer manipulativ, egal in welche Richtung.
2. **Die Ursachen der Differenz sind gut verstanden und nicht ideologisch:** Serienbau
   vs. Erstprojekt, ununterbrochene vs. abgerissene Lieferkette, ein Regulator vs.
   viele, Turnkey-Festpreis vs. Kostenerstattung, niedrige vs. hohe Bau- und
   Ingenieurlöhne, staatlich gesenkter vs. marktüblicher Kapitalkostensatz.
3. **Die EU-Referenzen (7.900–13.500 €/kW) liegen systematisch zwischen den Extremen** —
   und sie fehlten im bisherigen Faktencheck-Dokument komplett, obwohl sie die
   relevanteste Vergleichsgruppe sind.
4. **Der WACC ist der stärkste Einzelhebel** (Faktor 2,78 zwischen 3 % und 10 %),
   stärker als jede plausible CAPEX-Variation und viel stärker als die Nutzungsdauer;
   dass jedes europäische Neubauprojekt ein staatliches Finanzierungsinstrument
   benötigt, ist die praktische Bestätigung dieses Befunds.
5. **Bei den Betriebskosten hat die GES-Studie eher zu hoch als zu niedrig gerechnet** —
   dieser Punkt gehört fairerweise ins White Paper und relativiert die Aussage,
   die Studie unterschätze Kernkraft „um 100–170 %".

---

## 9. Maschinenlesbarer Datenblock

```json
{
  "meta": {
    "document": "kosten_kernkraft.md",
    "created": "2026-08-15",
    "zugriffsdatum_alle_quellen": "2026-08-15",
    "verification_note": "Direkter Seitenabruf (WebFetch) war in dieser Session durch den Netzwerk-Proxy blockiert (u.a. world-nuclear.org, world-nuclear-news.org, iea.org, wikipedia.org, pej.pl). Verifikation erfolgte ueber Suchmaschinen-Ergebnisse mit Quellenauszuegen. Werte mit confidence 'B' oder 'C' vor Veroeffentlichung gegen Primaerdokumente pruefen.",
    "confidence_scale": {
      "A": "mehrfach unabhaengig belegt",
      "B": "einfach belegt, plausibel, nicht gegengeprueft",
      "C": "kursiert, Primaerquelle nicht pruefbar"
    }
  },

  "fx": {
    "basis": "EZB-Referenzkurse 2026-03-09 (CAD: Jahresdurchschnitt 2026)",
    "source_id": "ecb-fx",
    "eur_per_unit": {
      "USD": 0.86543,
      "GBP": 1.15567,
      "CZK": 0.040986,
      "PLN": 0.233727,
      "CAD": 0.621543
    },
    "units_per_eur": {"USD": 1.1555, "GBP": 0.86530, "CZK": 24.399, "PLN": 4.2785, "CAD": 1.6089},
    "caveat": "Einheitlicher Stichtagskurs fuer alle Projekte, damit sie untereinander vergleichbar bleiben. Oekonomisch nicht exakt fuer historische Ausgabenstroeme. Sensitivitaet: EUR/USD 1.05 statt 1.1555 erhoeht alle USD-Projekte um rund 10 Prozent."
  },

  "reference_projects": [
    {
      "id": "korea-apr1400-domestic",
      "label": "APR1400 Inland (Referenzwert)",
      "country": "KR",
      "capacity_mw": 1400,
      "units": 1,
      "cost_original": {"value": 2157, "currency": "USD", "unit": "per_kW", "basis": "overnight, ohne IDC"},
      "capex_eur_kw": 1867,
      "construction_years": null,
      "delay_years": null,
      "cost_scope": "overnight_only",
      "confidence": "B",
      "source_ids": ["pulaski-2021", "sciencedirect-intl-costs"],
      "note": "Historischer Inlandswert. Shin Kori 3/4 hatten 3 bzw. 5 Jahre Verzug und rund 30 Prozent Kostensteigerung."
    },
    {
      "id": "shin-hanul-34",
      "label": "Shin Hanul 3&4",
      "country": "KR",
      "capacity_mw": 2800,
      "units": 2,
      "cost_original": {"value": 8.8, "currency": "USD", "unit": "billion", "basis": "Projektvolumen"},
      "capex_eur_kw": 2720,
      "construction_start": 2023,
      "commissioning_target": "frueh 2030er",
      "delay_years": 0,
      "cost_scope": "overnight_likely",
      "confidence": "B",
      "source_ids": ["nei-shinhanul34", "neutronbytes-shinhanul"],
      "note": "Aktuellster koreanischer Neubaupreis. Beste Korea-Referenz."
    },
    {
      "id": "barakah-epc",
      "label": "Barakah (EPC-Vertrag 2009)",
      "country": "AE",
      "capacity_mw": 5600,
      "units": 4,
      "cost_original": {"value": 20.4, "currency": "USD", "unit": "billion", "basis": "Preise 2009, Turnkey-EPC"},
      "capex_eur_kw": 3153,
      "construction_years": 8,
      "delay_years": 3.5,
      "cost_scope": "epc_only",
      "confidence": "A",
      "source_ids": ["power-technology-barakah", "nsenergy-barakah", "crs-korea-us"]
    },
    {
      "id": "barakah-total",
      "label": "Barakah (Gesamtkosten)",
      "country": "AE",
      "capacity_mw": 5600,
      "units": 4,
      "cost_original": {"value": 32, "currency": "USD", "unit": "billion", "basis": "Baukosten gesamt"},
      "capex_eur_kw": 4945,
      "construction_years": 8,
      "delay_years": 3.5,
      "cost_scope": "total_incl_owners",
      "confidence": "B",
      "source_ids": ["wikipedia-barakah", "wna-uae"],
      "note": "Faktencheck-Dokument nennt 5257 EUR/kW; korrekter Wert bei einheitlichem Kurs ist 4945.",
      "corrects": "faktencheck-barakah-5257"
    },
    {
      "id": "dukovany-ii",
      "label": "Dukovany II",
      "country": "CZ",
      "capacity_mw": 2110,
      "units": 2,
      "reactor_type": "APR1000",
      "cost_original": {"value": 407, "currency": "CZK", "unit": "billion", "basis": "EPC-Vertrag 06/2025"},
      "capex_eur_kw": 7906,
      "construction_start": 2029,
      "commissioning_target": 2036,
      "cost_scope": "epc_only",
      "confidence": "A",
      "source_ids": ["enerdata-dukovany", "wnn-dukovany-186", "neutronbytes-dukovany"],
      "financing_model": "Staatsdarlehen (~70 Prozent der Blockkosten), Staat haelt 80 Prozent an EDU II, Preisabsicherung",
      "note": "Nur EPC. Ohne Eigentuemerkosten, Netzanbindung, Bauzinsen. Gesamtprojekt realistisch 9000-11000 EUR/kW. Wichtigster Datenpunkt: koreanischer Vertragspreis innerhalb der EU."
    },
    {
      "id": "epr2-programme-2020eur",
      "label": "EPR2-Programm (OCC, Preise 2020)",
      "country": "FR",
      "capacity_mw": 9600,
      "capacity_mw_gross": 10020,
      "units": 6,
      "cost_original": {"value": 72.8, "currency": "EUR", "unit": "billion", "basis": "Preise 2020, ohne Finanzierungskosten"},
      "capex_eur_kw": 7583,
      "capex_eur_kw_gross_basis": 7265,
      "commissioning_target_unit1": 2038,
      "cost_scope": "overnight_only",
      "confidence": "A",
      "source_ids": ["edf-epr2-2025", "sfen-epr2", "wnn-epr2"],
      "note": "Beste Analogie fuer ein serielles westeuropaeisches Programm. Seit 2022 (51,7 Mrd.) bereits +40 Prozent, vor Baubeginn."
    },
    {
      "id": "epr2-programme-incl-financing",
      "label": "EPR2-Programm (inkl. Finanzierung)",
      "country": "FR",
      "capacity_mw": 9600,
      "units": 6,
      "cost_original": {"value": 100, "currency": "EUR", "unit": "billion", "basis": "inkl. Finanzierungskosten, Presseangabe"},
      "capex_eur_kw": 10417,
      "cost_scope": "total_incl_idc",
      "confidence": "B",
      "source_ids": ["boursorama-epr2", "newstank-epr2"],
      "note": "Implizierter IDC-Aufschlag rund +37 Prozent gegenueber Overnight."
    },
    {
      "id": "lubiatowo-kopalino",
      "label": "Lubiatowo-Kopalino",
      "country": "PL",
      "capacity_mw": 3750,
      "capacity_mw_note": "brutto; netto ca. 3350 MW -> ca. 13400 EUR/kW",
      "units": 3,
      "reactor_type": "AP1000",
      "cost_original": {"value": 192, "currency": "PLN", "unit": "billion", "basis": "Gesamtprojektkosten"},
      "capex_eur_kw": 11968,
      "construction_start": 2028,
      "commissioning_target": "2. Haelfte 2030er",
      "cost_scope": "total_project",
      "confidence": "A",
      "source_ids": ["ec-ip-25-2963", "notesfrompoland-nuclear", "nucnet-poland-aid", "westinghouse-exim"],
      "financing_model": "Kapitalzufuehrung 14 Mrd. EUR (30 Prozent der Kosten) + Staatsgarantien fuer 100 Prozent des Fremdkapitals + zweiseitiger CfD ueber 40 Jahre (von 60 gekuerzt) + EXIM-Kredit",
      "note": "Planzahl vor Baubeginn, beihilferechtlich geprueft. Historisches Muster: eher steigend."
    },
    {
      "id": "sizewell-c",
      "label": "Sizewell C",
      "country": "GB",
      "capacity_mw": 3260,
      "units": 2,
      "reactor_type": "EPR",
      "cost_original": {"value": 38, "currency": "GBP", "unit": "billion", "basis": "FID 22.07.2025"},
      "capex_eur_kw": 13472,
      "construction_years_planned": 10,
      "cost_scope": "total_project",
      "confidence": "A",
      "source_ids": ["nucnet-sizewell-fid", "geplus-sizewell", "sizewellc-fid", "consumerscotland-rab"],
      "financing_model": "RAB (Regulated Asset Base) - Verbraucherumlage waehrend der Bauzeit, seit 12/2025 mit 0,3 p/kWh. EK: UK-Regierung 44,9 / La Caisse 20 / Centrica 15 / EDF 12,5 / Amber 7,6 Prozent. 5 Mrd. GBP exportkreditgedecktes FK.",
      "note": "Erstschaetzung 2020: 20 Mrd. GBP -> +90 Prozent bis FID. RAB senkt WACC, verlagert aber Baurisiko auf Verbraucher."
    },
    {
      "id": "vogtle-34",
      "label": "Vogtle 3&4",
      "country": "US",
      "capacity_mw": 2234,
      "units": 2,
      "reactor_type": "AP1000",
      "cost_original": {"value": 36.8, "currency": "USD", "unit": "billion", "basis": "Gesamtkosten alle Eigentuemer"},
      "cost_original_alt": {"value": 15000, "currency": "USD", "unit": "per_kW", "source": "MIT Climate Portal"},
      "capex_eur_kw": 14258,
      "capex_eur_kw_mit_basis": 12981,
      "capex_eur_kw_recommended": 13500,
      "original_estimate": {"value": 14, "currency": "USD", "unit": "billion"},
      "construction_years": 10.5,
      "delay_years": 7,
      "commissioning": {"unit3": "2023-07", "unit4": "2024-04"},
      "cost_scope": "total_project",
      "confidence": "A",
      "source_ids": ["eia-vogtle4", "mit-climate-nuclear-cost", "energytransition-vogtle", "powermag-vogtle"],
      "note": "Faktencheck-Dokument nennt 12388 EUR/kW (impliziert ~1,21 USD/EUR). Empfohlener Wert 13500, Spanne 12980-14260.",
      "corrects": "faktencheck-vogtle-12388"
    },
    {
      "id": "flamanville-3",
      "label": "Flamanville 3",
      "country": "FR",
      "capacity_mw": 1650,
      "capacity_mw_net": 1630,
      "units": 1,
      "reactor_type": "EPR",
      "cost_original": {"value": 23.7, "currency": "EUR", "unit": "billion", "basis": "Preise 2023, Cour des Comptes, inkl. Finanzierung"},
      "cost_original_alt": {"value": 22.6, "currency": "EUR", "unit": "billion", "basis": "Preise 2023, EDF-eigene Angabe"},
      "capex_eur_kw": 14364,
      "capex_eur_kw_net_basis": 14540,
      "original_estimate": {"value": 3.3, "currency": "EUR", "unit": "billion", "year": 2007},
      "construction_years": 17,
      "delay_years": 12,
      "grid_connection": "2024-12-21",
      "full_power": "2025-12",
      "cost_scope": "total_incl_financing",
      "confidence": "A",
      "source_ids": ["cour-des-comptes-2025", "connaissance-energies-cdc", "powermag-flamanville"],
      "note": "Wert im Faktencheck-Dokument bestaetigt. Quellenangabe sollte von WNA auf Cour des Comptes (14.01.2025) geaendert werden.",
      "confirms": "faktencheck-flamanville-14364"
    },
    {
      "id": "hinkley-point-c",
      "label": "Hinkley Point C",
      "country": "GB",
      "capacity_mw": 3260,
      "units": 2,
      "reactor_type": "EPR",
      "cost_original": {"value": 48.7, "currency": "GBP", "unit": "billion", "basis": "laufende Preise 2026"},
      "cost_original_real": {"value": 35, "currency": "GBP", "unit": "billion", "basis": "Preise 2015 (Worst Case 36)"},
      "capex_eur_kw": 17264,
      "capex_eur_kw_real_2015basis": 12408,
      "original_estimate": {"value": 18, "currency": "GBP", "unit": "billion", "year": 2016},
      "construction_start": 2018,
      "commissioning_target": 2030,
      "commissioning_worst_case": 2031,
      "delay_years": 5.5,
      "cost_scope": "total_project_nominal",
      "confidence": "A",
      "source_ids": ["newcivilengineer-hpc", "iwr-hinkley-2026", "energytribune-hpc", "constructionwave-hpc"],
      "financing_model": "CfD, Basispreis 92,50 GBP/MWh in Preisen 2012, indexiert, 35 Jahre. Indexierter Wert 17.01.2026: 127 GBP/MWh = rund 147 EUR/MWh = rund 15 ct/kWh.",
      "note": "Wert im Faktencheck-Dokument bestaetigt. ABER: nominale Preisbasis. Real (GBP 2015) sind es 12408 EUR/kW. Beide Werte ausweisen.",
      "confirms": "faktencheck-hinkley-17250"
    },
    {
      "id": "paks-ii",
      "label": "Paks II",
      "country": "HU",
      "capacity_mw": 2400,
      "units": 2,
      "reactor_type": "VVER-1200",
      "cost_original": {"value": 12.5, "currency": "EUR", "unit": "billion", "basis": "Budget Stand 2014"},
      "capex_eur_kw": 5208,
      "delay_years": 10,
      "first_concrete": "2025-11",
      "cost_scope": "unclear",
      "confidence": "C",
      "usable_as_reference": false,
      "source_ids": ["balkangreen-paks", "boell-paks-2026", "nucnet-paks", "balkaninsight-paks"],
      "financing_model": "Russisches Staatsdarlehen ueber 10 Mrd. EUR (2014)",
      "note": "NICHT als Kostenreferenz verwenden. Politisch ausgehandelter Paketpreis von 2014, aktuelle Kosten unveroeffentlicht, rund 10 Jahre Verzug. Nur als Beispiel fuer Intransparenz und geopolitische Abhaengigkeit zitieren."
    }
  ],

  "smr_projects": [
    {
      "id": "nuscale-cfpp",
      "label": "NuScale Carbon Free Power Project (UAMPS)",
      "country": "US",
      "capacity_mw": 462,
      "modules": 6,
      "status": "abgebrochen 2023-11-08",
      "cost_initial": {"value": 5.3, "currency": "USD", "unit": "billion", "year": 2021},
      "cost_final_estimate": {"value": 9.3, "currency": "USD", "unit": "billion", "year": 2023},
      "capex_usd_kw": 20130,
      "capex_eur_kw": 17421,
      "target_ppa_usd_mwh": {"2021": 58, "2023": 89},
      "confidence": "A",
      "source_ids": ["ieefa-nuscale", "nuscale-uamps-8k", "eenews-nuscale", "nreca-advisory"],
      "note": "Hoechster EUR/kW-Wert dieser Recherche, hoeher als Hinkley Point C. Empirische Gegenevidenz zur SMR-Kostenthese - allerdings FOAK."
    },
    {
      "id": "opg-darlington-bwrx300",
      "label": "OPG Darlington BWRX-300",
      "country": "CA",
      "status": "im Bau (einziger SMR-Bau im Westen, Stand Mitte 2026)",
      "licence_to_construct": "2025-04",
      "unit1": {"capacity_mw": 300, "cost_cad_billion": 6.1, "shared_infra_cad_billion": 1.6, "capex_eur_kw": 15953},
      "programme": {"units": 4, "capacity_mw": 1200, "cost_cad_billion": 20.9, "basis": "CAD 2024, inkl. Zinsen und Reserven", "capex_eur_kw": 10825},
      "commissioning_unit1": "2029-2030",
      "commissioning_all": 2035,
      "confidence": "A",
      "source_ids": ["wnn-darlington-budget", "worldnuclearreport-darlington", "neimagazine-darlington", "nucnet-darlington"],
      "note": "Beste oeffentliche Quantifizierung des SMR-Serieneffekts: -32 Prozent vom ersten Block zum Vierblock-Durchschnitt. Trotzdem teurer pro kW als Sizewell C."
    },
    {
      "id": "ropower-doicesti",
      "label": "RoPower Doicesti (NuScale)",
      "country": "RO",
      "capacity_mw": 462,
      "modules": 6,
      "status": "Phase-Freigabe 02/2026, FID fruehestens Ende 2026",
      "cost": null,
      "capex_eur_kw": null,
      "commissioning_target": "nach 2030",
      "confidence": "C",
      "usable_as_reference": false,
      "source_ids": ["neutronbytes-ropower", "powermag-ropower"],
      "note": "Kosten nicht oeffentlich. Als Kostenreferenz derzeit nicht verwendbar."
    }
  ],

  "smr_summary": {
    "commercial_smr_operating_west_mid2026": 0,
    "first_grid_connection_west_realistic": 2030,
    "reliable_operating_cost_data_realistic": "2031-2032",
    "serial_effect_demonstrable_realistic": "2034-2036",
    "meaningful_contribution_germany_realistic": "2040er",
    "recommended_model_treatment": "Nur als Sensitivitaets-Szenario mit Spanne 8000-18000 EUR/kW, nicht als Basisannahme fuer Zieljahr 2045."
  },

  "operating_costs": {
    "us_fleet_2023": {
      "fuel_usd_mwh": 5.32, "fuel_eur_mwh": 4.60,
      "operations_usd_mwh": 19.38, "operations_eur_mwh": 16.77,
      "capital_usd_mwh": 7.06, "capital_eur_mwh": 6.11,
      "total_usd_mwh": 32, "total_eur_mwh": 27.7,
      "source_id": "nei-costs-in-context", "confidence": "A"
    },
    "us_fleet_2024": {"merchant_usd_mwh": 30.11, "regulated_usd_mwh": 36.51, "source_id": "nei-costs-in-context", "confidence": "B"},
    "france_fleet_2025": {"fuel_eur_mwh": 8, "existing_fleet_total_eur_mwh": 60, "source_id": "sfen-cre-60", "confidence": "B",
      "note": "60 EUR/MWh gilt fuer die abgeschriebene Bestandsflotte inkl. Grand Carenage, NICHT fuer Neubau."},
    "fuel_share_of_generating_cost_pct": 17,
    "uranium_price_sensitivity": {
      "note": "Verdopplung 25 -> 50 USD/lb U3O8 erhoeht Brennstoffkosten nur von 0,50 auf 0,62 ct/kWh",
      "source_id": "wna-economics", "confidence": "B"
    }
  },

  "decommissioning_and_waste_germany": {
    "decommissioning_per_reactor_block_eur_billion": [1.0, 1.5],
    "decommissioning_duration_years": [15, 20],
    "operator_provisions_eur_billion": 38.3,
    "estimated_costs_current_prices_eur_billion": 47.5,
    "kenfo_paid_in_2017_eur_billion": 24.1,
    "kenfo_foundation_assets_end_2025_eur_billion": 25.6,
    "kenfo_incl_payouts_eur_billion": 30.9,
    "kenfo_return_2025_pct": 6.2,
    "kenfo_target_return_pct": 4.0,
    "kenfo_earned_since_inception_eur_billion": 8.8,
    "kenfo_paid_out_since_inception_eur_billion": 5.3,
    "kenfo_payout_2025_eur_million": 823,
    "federal_spending_2024_interim_final_storage_eur_billion": 1.144,
    "risk_allocation": "Betreiber tragen Rueckbau selbst (unbegrenzte Nachschusspflicht). Zwischen- und Endlagerung wurden 2017 mit 24,1 Mrd. EUR plus Risikoaufschlag vollstaendig abgeloest - jedes darueber hinausgehende Risiko traegt der Steuerzahler.",
    "unverified_claim": {
      "value": "~170 Mrd. EUR Gesamtkosten nukleare Entsorgung bis 2100",
      "status": "NICHT VERIFIZIERT - Primaerquelle (BMUV Kostenbericht 2025) in dieser Session nicht abrufbar. Ohne Primaerpruefung nicht verwenden."
    },
    "source_ids": ["bmwe-rueckbau", "kenfo-2025", "efundresearch-kenfo", "bmuv-kostenbericht-2025"],
    "confidence": "A"
  },

  "liability_insurance_germany": {
    "liability_in_principle": "unbegrenzt (AtG, seit 1985-08-01)",
    "required_coverage_eur_billion": 2.5,
    "actual_insurance_cover_eur_million": 256,
    "remainder_mechanism": "Solidarvereinbarung der Betreiber untereinander (keine Versicherung)",
    "federal_indemnity_cap_eur_billion": 2.5,
    "core_finding": "Kein privater Versicherungsmarkt deckt das Maximalschadenspotenzial. Die Differenz zwischen formal unbegrenzter Haftung und 2,5 Mrd. EUR Deckungsmasse ist eine implizite Staatsgarantie, die in keinem LCOE-Wert auftaucht.",
    "contested_claim": {
      "value": "Vollversicherung wuerde Strompreis um Faktor 40 erhoehen",
      "origin": "Versicherungsforen Leipzig 2011, im Auftrag des BEE",
      "status": "STARK ANNAHMEABHAENGIG UND UMSTRITTEN - nur qualitativ als Hinweis auf Nicht-Versicherbarkeit verwenden, nicht als Zahl."
    },
    "source_ids": ["bundestag-wd-3-330-10", "atomkraftwerkeplag-haftung", "atommuellreport-haftung", "atdeckv"],
    "confidence": "A"
  },

  "construction_time": {
    "global_iaea_pris": {
      "median_years": 6.3, "mean_years": 7.5,
      "share_under_5y_pct": 21, "share_under_8y_pct": 68, "share_under_10y_pct": 83,
      "distribution": "rechtsschief mit langem Auslaeufer",
      "fastest_countries": ["JP", "KR", "CN"],
      "source_id": "ritchie-construction-time", "confidence": "A"
    },
    "western_recent_projects_years": {
      "flamanville_3": 17, "vogtle_3": 10.3, "vogtle_4": 11,
      "hinkley_point_c": "12+ (laufend)", "barakah_unit1": 8, "shin_hanul_1": 9
    },
    "finding": "Jedes westliche Neubauprojekt der letzten 20 Jahre lag deutlich ueber dem globalen Median. Fuer eine Deutschland-Prognose ist der Median die falsche Kennzahl.",
    "pre_concrete_lead_time_years": {"poland": 6, "czechia": 5, "germany_estimate": "8-12 (Modellannahme; Neubauverbot, Behoerdenaufbau, Standortverfahren)"},
    "total_path_decision_to_first_kwh_germany_years": [18, 25]
  },

  "wacc_sensitivity": {
    "crf_formula": "r*(1+r)^n / ((1+r)^n - 1)",
    "lifetime_effect_at_5pct": {"40": 0.05828, "60": 0.05283, "65": 0.05219, "80": 0.05103,
      "finding": "Schwacher Hebel: 60 vs. 80 Jahre aendern die LCOE um rund 3 Prozent."},
    "wacc_effect_at_60y": {"0.03": 0.03613, "0.05": 0.05283, "0.07": 0.07124, "0.09": 0.09051, "0.10": 0.10033,
      "factor_3pct_to_10pct": 2.78,
      "finding": "Staerkster Einzelhebel, staerker als jede plausible CAPEX-Variation."},
    "worked_example": {
      "assumptions": {"capex_eur_kw": 12000, "full_load_hours": 7500, "lifetime_years": 60,
        "opex_eur_kw_a": 240, "fuel_eur_mwh": 8, "waste_eur_mwh": 8},
      "lcoe_eur_mwh": {"0.03": 105.8, "0.05": 132.5, "0.07": 162.0, "0.09": 192.8, "0.10": 208.5}
    },
    "iea_nea_2020": {
      "capacity_factor_pct": 85,
      "lcoe_usd_mwh": {"0.03": [27, 61], "0.07": [42, 102], "0.10": [57, 146]},
      "note": "Bei 3 Prozent ist Nuklear in allen untersuchten Laendern die guenstigste Option, bei 10 Prozent in praktisch keinem.",
      "source_id": "iea-nea-2020", "confidence": "A"
    },
    "idc_note": "Ein einheitlicher WACC ohne explizite Bauzeit-/IDC-Modellierung beguenstigt strukturell die Technologie mit der laengsten Bauzeit. Belegt durch EPR2: 72,8 Mrd. EUR ohne vs. rund 100 Mrd. EUR mit Finanzierungskosten = +37 Prozent.",
    "policy_observation": "Jedes europaeische Neubauprojekt benoetigt ein staatliches Instrument zur WACC-Senkung: CfD (Hinkley), RAB (Sizewell C), Staatsgarantien fuer 100 Prozent des Fremdkapitals plus CfD (Polen), zinsguenstiges Staatsdarlehen (Tschechien)."
  },

  "eu_new_build_model_parameters": {
    "note": "Empfohlene Modell-Spannen fuer ein hypothetisches deutsches/europaeisches Neubauprogramm. Bewusst OHNE asiatische und Golf-Referenzen in der Basisspanne, da deren Voraussetzungen in Deutschland rechtlich und oekonomisch nicht herstellbar sind. Diese gehoeren als Kontrastwerte ins Papier, nicht in die Modellbasis.",
    "capex_eur_kw": {
      "low": 7500, "mid": 12000, "high": 17500,
      "anchors": {
        "low": ["epr2-programme-2020eur", "dukovany-ii"],
        "mid": ["lubiatowo-kopalino", "sizewell-c", "epr2-programme-incl-financing"],
        "high": ["hinkley-point-c"]
      },
      "rationale_high": "Fuer ein deutsches Erstprojekt eher Erwartungs- als Extremwert: zusaetzlich zu allen HPC-Nachteilen gesetzliches Neubauverbot, abgewickelte Genehmigungsbehoerde, keine Bauerfahrung seit 1989."
    },
    "opex": {
      "recommended_unit": "eur_kw_a",
      "low": 130, "mid": 165, "high": 200,
      "opex_pct_equivalent": {"low": 0.014, "mid": 0.014, "high": 0.011},
      "WARNUNG": "Opex NICHT als Prozentsatz eines variablen CAPEX-Sliders modellieren. Bei CAPEX 6000 -> 17000 EUR/kW verdreifachen sich sonst automatisch die Betriebskosten auf rund 149 EUR/MWh, was physikalisch unsinnig ist. Absolut in EUR/kW/a rechnen oder an einen festen Referenz-CAPEX koppeln.",
      "ges_study_assumption_pct": 0.07,
      "ges_study_assessment": "Bei 6000 EUR/kW entspricht das 420 EUR/kW/a = 52,5 EUR/MWh bei 8000 h. Bottom-up gegengerechnet (US-Betrieb 16,8 + Brennstoff 4,6 + Entsorgung 10 = rund 31 EUR/MWh = rund 250 EUR/kW/a = 4,2 Prozent) ist die Studien-Annahme eher GROSSZUEGIG. Das schwaecht den Befund 'Studie unterschaetzt Kernkraft um 100-170 Prozent' ab und gehoert fairerweise ins White Paper."
    },
    "fuel_eur_mwh": {"low": 6, "mid": 8, "high": 11},
    "waste_decommissioning_eur_mwh": {"low": 5, "mid": 8, "high": 14,
      "note": "Separater Posten. Im GES-Modell in den 7 Prozent Opex versteckt."},
    "full_load_hours": {"low": 6500, "mid": 7500, "high": 8000,
      "status": "MODELLANNAHME, nicht quellenbelegt",
      "note": "8000 h = 91 Prozent Verfuegbarkeit, nur von Bestflotten erreicht. In einem System mit hohem PV-/Windanteil muss Kernkraft lastfolgen, was die Auslastung strukturell senkt. Wer 8000 h UND hohen EE-Anteil unterstellt, rechnet inkonsistent."},
    "lifetime_years": {"low": 60, "mid": 60, "high": 60,
      "note": "Regulatorischer Standard. Hebel ohnehin schwach (40 vs. 80 Jahre = 14 Prozent CRF-Differenz)."},
    "wacc": {"low": 0.03, "mid": 0.05, "high": 0.09,
      "note": "Low = sozialer Diskontsatz / RAB-Modell; Mid = GES-Annahme; High = marktnahe Projektfinanzierung ohne Staatsgarantie."},
    "construction_years": {"low": 8, "mid": 12, "high": 17,
      "note": "Globaler Median 6,3 Jahre gilt fuer die Modellierung westlicher Neubauten NICHT."},
    "pre_construction_lead_years": {"low": 5, "mid": 8, "high": 12, "status": "MODELLANNAHME"},
    "idc_surcharge_on_capex": {"low": 0.20, "mid": 0.33, "high": 0.55,
      "empirical_anchor": "EPR2: 72,8 Mrd. EUR ohne -> rund 100 Mrd. EUR mit Finanzierung = +37 Prozent"},
    "resulting_lcoe_eur_mwh": {
      "optimistisch": {"capex": 7500, "wacc": 0.03, "flh": 8000, "lcoe": 59},
      "ges_nah": {"capex": 6000, "wacc": 0.05, "flh": 8000, "lcoe": 62},
      "realistisch_eu": {"capex": 12000, "wacc": 0.05, "flh": 7500, "lcoe": 133},
      "realistisch_de": {"capex": 12000, "wacc": 0.07, "flh": 7500, "lcoe": 162},
      "pessimistisch": {"capex": 17500, "wacc": 0.09, "flh": 6500, "lcoe": 275}
    }
  },

  "third_party_lcoe_crosscheck": [
    {"source_id": "fraunhofer-ise-2024", "label": "Fraunhofer ISE, Juli 2024", "scope": "Neubau Kernenergie",
     "lcoe_ct_kwh": [13.6, 49.0], "lcoe_eur_mwh": [136, 490], "confidence": "A"},
    {"source_id": "lazard-lcoe-18", "label": "Lazard LCOE+ v18, Juni 2025", "scope": "unsubventioniert, USA",
     "lcoe_usd_mwh": [141, 220], "lcoe_eur_mwh": [122, 190], "confidence": "B"},
    {"source_id": "iwr-hinkley-2026", "label": "Hinkley Point C CfD, indexiert 17.01.2026", "scope": "real vertraglich fixiert",
     "lcoe_gbp_mwh": 127, "lcoe_eur_mwh": 147, "confidence": "A"},
    {"source_id": "iea-nea-2020", "label": "IEA/NEA 2020 bei 7 Prozent", "scope": "24 Laender, ueberwiegend nicht-westlich",
     "lcoe_usd_mwh": [42, 102], "lcoe_eur_mwh": [36, 88], "confidence": "A"}
  ],

  "corrections_to_faktencheck_document": [
    {"item": "Hinkley Point C 17250 EUR/kW", "verdict": "BESTAETIGT", "action": "Beibehalten, aber Preisbasis ausweisen und Realwert (GBP 2015: 12408 EUR/kW) danebenstellen."},
    {"item": "Vogtle 3&4 12388 EUR/kW", "verdict": "ZU NIEDRIG", "action": "Auf 13500 EUR/kW korrigieren (Spanne 12980-14260), Wechselkurs dokumentieren."},
    {"item": "Flamanville 3 14364 EUR/kW", "verdict": "BESTAETIGT", "action": "Quelle von WNA auf Cour des Comptes (14.01.2025) aendern."},
    {"item": "Korea APR1400 2116 EUR/kW", "verdict": "GROESSENORDNUNG OK, QUELLE ZU SCHWACH", "action": "Auf Spanne 1870-2720 EUR/kW umstellen, Substack-Blog durch Fachliteratur ersetzen."},
    {"item": "Barakah 5257 EUR/kW", "verdict": "ZU HOCH BEI EINHEITLICHEM KURS", "action": "Auf Spanne 3150-4950 EUR/kW umstellen."},
    {"item": "Mittelwert der 5 Projekte 10275 EUR/kW", "verdict": "METHODISCH NICHT HALTBAR", "action": "STREICHEN. Ungewichtetes Mittel ueber heterogene Abgrenzungen, Preisbasen und Baujahre. Ersetzen durch Cluster Asien/Golf, EU-Serie, West-FOAK mit Bandbreiten."},
    {"item": "Befund 'unterschaetzt um 100-170 Prozent'", "verdict": "ZU STARK", "action": "Differenzieren: rund 25-45 Prozent ggue. seriellem EU-Programm, rund 100-190 Prozent ggue. westlichem Erstprojekt. Zusaetzlich erwaehnen, dass die Opex-Annahme der Studie eher grosszuegig ist."},
    {"item": "Fehlende EU-Neubaureferenzen", "verdict": "GROESSTE LUECKE", "action": "Polen, Tschechien, EPR2, Sizewell C ergaenzen (Abschnitt 2)."},
    {"item": "Fehlende WACC-/IDC-Diskussion", "verdict": "STAERKSTER KOSTENTREIBER FEHLT", "action": "Abschnitt 5 einarbeiten."},
    {"item": "Quelle Ontario Clean Air Alliance (Vogtle)", "verdict": "NICHT AUFFINDBAR", "action": "Durch EIA / Columbia CGEP / POWER Magazine ersetzen."},
    {"item": "Quelle Schlanj/Substack", "verdict": "BLOG OHNE PEER REVIEW", "action": "Fuer ein wissenschaftliches Papier ersetzen."},
    {"item": "Quelle MIT Climate Portal (2026)", "verdict": "SEITE UND ZAHL BESTAETIGT, DATUM NICHT", "action": "Datum als o.D. kennzeichnen oder nachpruefen."}
  ],

  "sources": [
    {"id": "ecb-fx", "title": "Euro foreign exchange reference rates", "publisher": "Europaeische Zentralbank", "date": "2026-03-09 / laufend", "url": "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html", "accessed": "2026-08-15"},
    {"id": "newcivilengineer-hpc", "title": "Hinkley Point C's cost climbs to GBP35bn with confirmation Unit 1 will power up in 2030", "publisher": "New Civil Engineer", "date": "2026-02-20", "url": "https://www.newcivilengineer.com/latest/hinkley-point-cs-cost-climbs-to-35bn-with-confirmation-unit-1-will-power-up-in-2030-20-02-2026/", "accessed": "2026-08-15"},
    {"id": "iwr-hinkley-2026", "title": "Britisches Atomkraftwerk Hinkley Point C verzoegert sich weiter und wird teurer - Atomstrom kostet mindestens 15 Cent pro Kilowattstunde", "publisher": "IWR-Pressedienst", "date": "2026-02-23", "url": "https://www.iwr.de/news/britisches-atomkraftwerk-hinkley-point-c-verzoegert-sich-weiter-und-wird-teurer-atomstrom-kostet-mindestens-15-cent-pro-kilowattstunde-news39541", "accessed": "2026-08-15"},
    {"id": "constructionwave-hpc", "title": "Hinkley Point C costs approach GBP49bn as project faces M&E delays", "publisher": "Construction Wave", "date": "2026-02-23", "url": "https://constructionwave.co.uk/2026/02/23/hinkley-point-c-costs-approach-49bn-as-project-faces-me-delays/", "accessed": "2026-08-15"},
    {"id": "energytribune-hpc", "title": "EDF raises UK Hinkley Point C nuclear plant cost estimate to GBP35bn", "publisher": "Energy Tribune", "date": "2026-02-20", "url": "https://www.theenergytribune.com/energy-power/2026/02/20/252626", "accessed": "2026-08-15"},
    {"id": "nao-hpc", "title": "Hinkley Point C (Report by the Comptroller and Auditor General)", "publisher": "UK National Audit Office", "date": "2017-06", "url": "https://www.nao.org.uk/wp-content/uploads/2017/06/Hinkley-Point-C.pdf", "accessed": "2026-08-15", "note": "Quelle fuer CfD-Basispreis 92,50 GBP/MWh (Preise 2012), 35 Jahre"},
    {"id": "cour-des-comptes-2025", "title": "Programme d'EPR: la Cour des Comptes publie un rapport critique et recalcule le cout de Flamanville 3", "publisher": "Cour des Comptes / Connaissance des Energies (AFP)", "date": "2025-01-14", "url": "https://www.connaissancedesenergies.org/afp/programme-depr-la-cour-des-comptes-publie-un-rapport-critique-et-recalcule-le-cout-de-flamanville-3-250114", "accessed": "2026-08-15"},
    {"id": "connaissance-energies-cdc", "title": "EPR Flamanville: le reacteur a 23,7 milliards au lieu de 3,2", "publisher": "ArgentPublic.fr", "date": "2025", "url": "https://argentpublic.fr/epr-flamanville-23-7-milliards", "accessed": "2026-08-15"},
    {"id": "powermag-flamanville", "title": "Flamanville 3: Europe's Hard-Won Nuclear Milestone", "publisher": "POWER Magazine", "date": "2025", "url": "https://www.powermag.com/flamanville-3-europes-hard-won-nuclear-milestone/", "accessed": "2026-08-15"},
    {"id": "eia-vogtle4", "title": "Plant Vogtle Unit 4 begins commercial operation", "publisher": "U.S. Energy Information Administration", "date": "2024", "url": "https://www.eia.gov/todayinenergy/detail.php?id=61963", "accessed": "2026-08-15"},
    {"id": "mit-climate-nuclear-cost", "title": "Are nuclear power plants too expensive to build?", "publisher": "MIT Climate Portal", "date": "o.D.", "url": "https://climate.mit.edu/ask-mit/are-nuclear-power-plants-too-expensive-build", "accessed": "2026-08-15"},
    {"id": "energytransition-vogtle", "title": "The billion-dollar boondoggle: how Vogtle became the US's monument to nuclear folly", "publisher": "EnergyTransition.org", "date": "2026-04", "url": "https://energytransition.org/2026/04/the-billion-dollar-boondoggle-how-vogtle-became-the-uss-monument-to-nuclear-folly/", "accessed": "2026-08-15"},
    {"id": "powermag-vogtle", "title": "How the Vogtle Nuclear Expansion's Costs Escalated", "publisher": "POWER Magazine", "date": "o.D.", "url": "https://www.powermag.com/how-the-vogtle-nuclear-expansions-costs-escalated/", "accessed": "2026-08-15"},
    {"id": "columbia-cgep-vogtle", "title": "Vogtle Unit 3 Has Started Commercial Operations. What's Next for the AP1000?", "publisher": "Columbia University SIPA, Center on Global Energy Policy", "date": "2023", "url": "https://www.energypolicy.columbia.edu/vogtle-unit-3-has-started-commercial-operations-whats-next-for-the-ap1000/", "accessed": "2026-08-15"},
    {"id": "power-technology-barakah", "title": "Barakah Nuclear Power Plant, UAE", "publisher": "Power Technology", "date": "o.D.", "url": "https://www.power-technology.com/projects/barakah-nuclear-power-plant-abu-dhabi/", "accessed": "2026-08-15"},
    {"id": "nsenergy-barakah", "title": "Barakah Nuclear Power Plant, Abu Dhabi: UAE's first nuclear power plant", "publisher": "NS Energy", "date": "o.D.", "url": "https://www.nsenergybusiness.com/projects/barakah-nuclear-power-plant-abu-dhabi/", "accessed": "2026-08-15"},
    {"id": "constructionweek-barakah", "title": "Barakah power plant secures $24.4bn in financing", "publisher": "Construction Week Online", "date": "o.D.", "url": "https://www.constructionweekonline.com/projects-tenders/article-41424-barakah-power-plant-secures-244bn-in-financing", "accessed": "2026-08-15"},
    {"id": "wna-uae", "title": "Nuclear Power in the United Arab Emirates", "publisher": "World Nuclear Association", "date": "laufend", "url": "https://world-nuclear.org/information-library/country-profiles/countries-t-z/united-arab-emirates", "accessed": "2026-08-15", "note": "Domain in dieser Session durch Netzwerk-Proxy blockiert; Inhalte nur ueber Suchauszuege verifiziert"},
    {"id": "crs-korea-us", "title": "U.S. and South Korean Cooperation in the World Nuclear Energy Market", "publisher": "Congressional Research Service", "date": "o.D.", "url": "https://www.congress.gov/crs-product/R41032", "accessed": "2026-08-15"},
    {"id": "wikipedia-barakah", "title": "Barakah nuclear power plant", "publisher": "Wikipedia", "date": "laufend", "url": "https://en.wikipedia.org/wiki/Barakah_nuclear_power_plant", "accessed": "2026-08-15", "note": "Sekundaerquelle; Domain in dieser Session blockiert"},
    {"id": "pulaski-2021", "title": "Costs and timeframes of construction of nuclear power plants carried out by potential nuclear technology suppliers for Poland", "publisher": "Casimir Pulaski Foundation, Policy Paper No. 6/2021", "date": "2021-06", "url": "https://pulaski.pl/wp-content/uploads/2021/06/Pulaski_Policy_Paper_No_6_2021_EN-1.pdf", "accessed": "2026-08-15"},
    {"id": "sciencedirect-intl-costs", "title": "Projected Electricity Costs in International Nuclear Power Markets", "publisher": "Energy Policy (Elsevier)", "date": "2022", "url": "https://www.sciencedirect.com/science/article/am/pii/S0301421522001306", "accessed": "2026-08-15"},
    {"id": "nei-shinhanul34", "title": "Korea to resume construction of Shin Hanul 3&4", "publisher": "Nuclear Engineering International", "date": "o.D.", "url": "https://www.neimagazine.com/news/korea-to-resume-construction-of-shin-hanul-34-10946507/", "accessed": "2026-08-15"},
    {"id": "neutronbytes-shinhanul", "title": "South Korea to Complete Two Reactors at Shin-Hanul", "publisher": "Neutron Bytes", "date": "2024-09-14", "url": "https://neutronbytes.com/2024/09/14/south-korea-to-complete-two-reactors-at-shin-hanul/", "accessed": "2026-08-15"},
    {"id": "powermag-shinhanul", "title": "Latest APR-1400 Reactor Now Online at South Korea's Shin Hanul Nuclear Plant", "publisher": "POWER Magazine", "date": "o.D.", "url": "https://www.powermag.com/latest-apr-1400-reactor-now-online-at-south-koreas-shin-hanul-nuclear-plant/", "accessed": "2026-08-15"},
    {"id": "ec-ip-25-2963", "title": "Commission approves State aid for the construction and operation of Poland's first nuclear power plant", "publisher": "Europaeische Kommission", "date": "2025-12-09", "url": "https://ec.europa.eu/commission/presscorner/detail/en/ip_25_2963", "accessed": "2026-08-15"},
    {"id": "notesfrompoland-nuclear", "title": "Poland to launch construction of first nuclear plant after EU approves EUR14bn in state aid", "publisher": "Notes From Poland", "date": "2025-12-09", "url": "https://notesfrompoland.com/2025/12/09/poland-to-launch-construction-of-first-nuclear-plant-after-eu-approves-e14bn-in-state-aid/", "accessed": "2026-08-15"},
    {"id": "nucnet-poland-aid", "title": "Europe Approves State Aid For Poland Nuclear Station, First Concrete Planned For 2028", "publisher": "NucNet", "date": "2025-12-12", "url": "https://www.nucnet.org/news/europe-approves-state-aid-for-poland-nuclear-station-first-concrete-planned-for-2028-12-2-2025", "accessed": "2026-08-15"},
    {"id": "westinghouse-exim", "title": "Westinghouse Welcomes U.S. Financing for Poland's First Nuclear Power Plant", "publisher": "Westinghouse / BusinessWire", "date": "2026-02-17", "url": "https://www.businesswire.com/news/home/20260217328373/en/Westinghouse-Welcomes-U.S.-Financing-for-Polands-First-Nuclear-Power-Plant", "accessed": "2026-08-15"},
    {"id": "pej-key-info", "title": "Key information - the project", "publisher": "Polskie Elektrownie Jadrowe (PEJ)", "date": "laufend", "url": "https://pej.pl/en/the-project/key-information/", "accessed": "2026-08-15", "note": "Domain in dieser Session durch Netzwerk-Proxy blockiert"},
    {"id": "enerdata-dukovany", "title": "KHNP signs final contract to build two nuclear reactors at Dukovany (Czechia)", "publisher": "Enerdata", "date": "2025-06", "url": "https://www.enerdata.net/publications/daily-energy-news/khnp-signs-final-contract-build-two-nuclear-reactors-dukovany-czechia.html", "accessed": "2026-08-15"},
    {"id": "wnn-dukovany-186", "title": "KHNP sets out plans for USD18.6bn Czech nuclear project", "publisher": "World Nuclear News", "date": "o.D.", "url": "https://www.world-nuclear-news.org/articles/khnp-sets-out-plans-for-usd186bn-czech-nuclear-project", "accessed": "2026-08-15", "note": "Domain in dieser Session blockiert; ueber Spiegel world-energy.org verifiziert"},
    {"id": "neutronbytes-dukovany", "title": "KHNP Wins Contract to Build Reactors at Dukovany", "publisher": "Neutron Bytes", "date": "2024-07-19", "url": "https://neutronbytes.com/2024/07/19/khnp-wins-contract-to-build-reactors-at-dukovany/", "accessed": "2026-08-15"},
    {"id": "edf-epr2-2025", "title": "EDF shares its forecasted cost estimate of the EPR2 programme for EUR72.8bn", "publisher": "EDF Groupe (Pressemitteilung)", "date": "2025-12-18", "url": "https://www.edf.fr/en/the-edf-group/dedicated-sections/journalists/all-press-releases/edf-shares-its-forecasted-cost-estimate-of-the-epr2-programme-for-eu728bn", "accessed": "2026-08-15"},
    {"id": "sfen-epr2", "title": "Programme EPR2: un plafond a 72,8 milliards d'euros pour les six premiers reacteurs", "publisher": "SFEN (Societe Francaise d'Energie Nucleaire)", "date": "2025-12", "url": "https://www.sfen.org/rgn/programme-epr2-un-plafond-a-728-milliards-deuros-pour-les-six-premiers-reacteurs/", "accessed": "2026-08-15"},
    {"id": "boursorama-epr2", "title": "Construction de six reacteurs nucleaires EPR2: EDF reevalue le cout du programme a 72,8 milliards d'euros, en hausse de 40% par rapport a 2022", "publisher": "Boursorama / AFP", "date": "2025-12-18", "url": "https://www.boursorama.com/actualite-economique/actualites/construction-de-six-reacteurs-nucleaires-epr2-edf-reevalue-le-cout-du-programme-a-72-8-milliards-d-euros-en-hausse-de-40-par-rapport-a-2022-7d90ca361c29a65acd4633ce8317fb59", "accessed": "2026-08-15"},
    {"id": "newstank-epr2", "title": "EPR2: un devis previsionnel a 72,8 Md EUR; decision finale d'investissement fin 2026", "publisher": "News Tank Energies", "date": "2025-12", "url": "https://energies.newstank.fr/article/view/423960/epr2-devis-previsionnel-72-8-md-decision-finale-investissement-fin-2026.html", "accessed": "2026-08-15"},
    {"id": "wnn-epr2", "title": "EDF estimates EPR2 programme cost at EUR72.8 billion", "publisher": "World Nuclear News", "date": "2025-12", "url": "https://www.world-nuclear-news.org/articles/edf-estimates-epr2-programme-costs-at-eur728-billion", "accessed": "2026-08-15", "note": "Domain in dieser Session blockiert"},
    {"id": "nucnet-sizewell-fid", "title": "UK Announces Final Investment Decision For GBP38 Billion Sizewell C Nuclear Power Station", "publisher": "NucNet", "date": "2025-07", "url": "https://www.nucnet.org/news/uk-announces-final-investment-decision-for-gbp38-billion-sizewell-c-nuclear-power-station-7-2-2025", "accessed": "2026-08-15"},
    {"id": "geplus-sizewell", "title": "Government signs final investment decision for GBP38bn nuclear plant", "publisher": "Ground Engineering", "date": "2025-07-24", "url": "https://www.geplus.co.uk/news/government-signs-final-investment-decision-to-build-38bn-sizewell-c-24-07-2025/", "accessed": "2026-08-15"},
    {"id": "sizewellc-fid", "title": "Final Investment Decision reached for Sizewell C", "publisher": "Sizewell C", "date": "2025-07-22", "url": "https://www.sizewellc.com/news-views/final-investment-decision-reached-for-sizewell-c-the-biggest-british-clean-energy-project-in-a-generation/", "accessed": "2026-08-15"},
    {"id": "consumerscotland-rab", "title": "Public information note on nuclear RAB and Sizewell C", "publisher": "Consumer Scotland", "date": "o.D.", "url": "https://consumer.scot/publications/public-information-note-on-nuclear-rab-and-sizewell-c-html/", "accessed": "2026-08-15"},
    {"id": "balkangreen-paks", "title": "Hungary's Paks 2 nuclear power plant officially under construction", "publisher": "Balkan Green Energy News", "date": "2026-02", "url": "https://balkangreenenergynews.com/hungarys-paks-2-nuclear-power-plant-officially-under-construction/", "accessed": "2026-08-15"},
    {"id": "boell-paks-2026", "title": "Hungary's Paks II Nuclear Power Plant Project - Can It Be Completed, and at What Cost?", "publisher": "Heinrich-Boell-Stiftung, Prag", "date": "2026-06-12", "url": "https://cz.boell.org/en/2026/06/12/paks-ii-project-can-it-be-completed-and-what-cost", "accessed": "2026-08-15"},
    {"id": "balkaninsight-paks", "title": "Hungary Shows Limits to Central-Southeast Europe's 'Nuclear Renaissance'", "publisher": "Balkan Insight", "date": "2026-06-02", "url": "https://balkaninsight.com/2026/06/02/hungary-shows-limits-to-central-southeast-europes-nuclear-renaissance/rd/", "accessed": "2026-08-15"},
    {"id": "nucnet-paks", "title": "Construction Of Hungary's Delayed Paks 2 Project To Begin Early 2026, Says Foreign Minister", "publisher": "NucNet", "date": "2025-10-05", "url": "https://www.nucnet.org/news/construction-of-hungary-s-delayed-paks-2-project-to-begin-early-2026-says-foreign-minister-10-5-2025", "accessed": "2026-08-15"},
    {"id": "ieefa-nuscale", "title": "Eye-popping new cost estimates released for NuScale small modular reactor", "publisher": "IEEFA", "date": "2023-01", "url": "https://ieefa.org/resources/eye-popping-new-cost-estimates-released-nuscale-small-modular-reactor", "accessed": "2026-08-15"},
    {"id": "nuscale-uamps-8k", "title": "NuScale Power Corp - Form 8-K (UAMPS/NuScale joint press release on CFPP termination)", "publisher": "U.S. SEC EDGAR", "date": "2023-11-08", "url": "https://www.sec.gov/Archives/edgar/data/1822966/000182296623000256/uampsnuscalejointpressre.htm", "accessed": "2026-08-15"},
    {"id": "eenews-nuscale", "title": "NuScale cancels first-of-a-kind nuclear project as costs surge", "publisher": "E&E News by POLITICO", "date": "2023-11", "url": "https://www.eenews.net/articles/nuscale-cancels-first-of-a-kind-nuclear-project-as-costs-surge/", "accessed": "2026-08-15"},
    {"id": "nreca-advisory", "title": "NuScale and UAMPS end SMR project CFPP", "publisher": "NRECA (America's Electric Cooperatives)", "date": "2023-12", "url": "https://www.cooperative.com/programs-services/bts/documents/advisories/advisory-nuscale-and-uamps-end-smr-project-cfpp-dec-2023.pdf", "accessed": "2026-08-15"},
    {"id": "wnn-darlington-budget", "title": "Canada's first SMR project: How is CAD20.9 billion cost calculated?", "publisher": "World Nuclear News", "date": "2025", "url": "https://world-nuclear-news.org/articles/what-is-the-budget-for-canadas-first-smr-project", "accessed": "2026-08-15", "note": "Domain in dieser Session blockiert"},
    {"id": "worldnuclearreport-darlington", "title": "Ontario's Darlington SMR project to cost nearly $21-billion, significantly higher than expected", "publisher": "World Nuclear Industry Status Report", "date": "2025", "url": "https://www.worldnuclearreport.org/Ontario-s-Darlington-SMR-project-to-cost-nearly-21-billion-significantly-higher", "accessed": "2026-08-15"},
    {"id": "neimagazine-darlington", "title": "Ontario approves Darlington BWRX-300 SMR", "publisher": "Nuclear Engineering International", "date": "2025", "url": "https://www.neimagazine.com/news/ontario-approves-darlington-bwrx-300-smr/", "accessed": "2026-08-15"},
    {"id": "nucnet-darlington", "title": "Go-Ahead For Project To Build Canada's First Small Modular Reactor", "publisher": "NucNet", "date": "2025-04-05", "url": "https://www.nucnet.org/news/go-ahead-for-project-to-build-canada-s-first-small-modular-reactors-5-4-2025", "accessed": "2026-08-15"},
    {"id": "neutronbytes-ropower", "title": "Final Investment Decision Approved for Six NuScale SMRs in Romania", "publisher": "Neutron Bytes", "date": "2026-02-13", "url": "https://neutronbytes.com/2026/02/13/final-investment-decision-approved-for-six-nuscale-smrs-in-romania/", "accessed": "2026-08-15"},
    {"id": "powermag-ropower", "title": "Romania's Coal-to-NuScale SMR Conversion Secures FID, Moves Into Implementation with Caveats", "publisher": "POWER Magazine", "date": "2026", "url": "https://www.powermag.com/romanias-coal-to-nuscale-smr-conversion-secures-fid-moves-into-implementation-with-caveats/", "accessed": "2026-08-15"},
    {"id": "nei-costs-in-context", "title": "Nuclear Costs in Context", "publisher": "Nuclear Energy Institute (NEI) / EUCG", "date": "2026-03 (Ausgabe mit Daten 2024)", "url": "https://www.nei.org/getContentAsset/47fa8caa-9b0d-4029-932c-07f902e82f4f/8d8ff8d6-b2ae-401b-a63c-f6b108e809d2/2024-Costs-in-Context-final.pdf?language=en-US", "accessed": "2026-08-15", "note": "Branchenverband - Interessenlage beachten, Daten stammen aber aus der EUCG-Betreibererhebung"},
    {"id": "powermag-om", "title": "How Nuclear O&M Is Evolving for the Emerging Power Paradigm", "publisher": "POWER Magazine", "date": "o.D.", "url": "https://www.powermag.com/how-nuclear-om-is-evolving-for-the-emerging-power-paradigm/", "accessed": "2026-08-15"},
    {"id": "sfen-cre-60", "title": "Decoding: What do the EUR60/MWh of existing nuclear power calculated by the CRE really represent?", "publisher": "SFEN in English", "date": "2025", "url": "https://sfeninenglish.org/nuclear-cost-60-euros-mwh-cre-analysis/", "accessed": "2026-08-15"},
    {"id": "wna-economics", "title": "Economics of Nuclear Power", "publisher": "World Nuclear Association", "date": "laufend", "url": "https://world-nuclear.org/information-library/economic-aspects/economics-of-nuclear-power", "accessed": "2026-08-15", "note": "Branchenverband - Interessenlage beachten. Domain in dieser Session blockiert."},
    {"id": "bmwe-rueckbau", "title": "Finanzierung des Kernenergieausstiegs", "publisher": "Bundesministerium fuer Wirtschaft und Energie (BMWE)", "date": "laufend", "url": "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Artikel/Energie/kernenergie-stilllegung-rueckbau-kernkraftwerke.html", "accessed": "2026-08-15"},
    {"id": "bafa-rueckstellungen", "title": "Rueckbau-Rueckstellungen Kernkraftwerke", "publisher": "BAFA", "date": "laufend", "url": "https://www.bafa.de/DE/Wirtschaft/Handwerk_Industrie/Rueckbau_Rueckstellungen_Kernkraftwerke/rueckbau_rueckstellungen_kernkraftwerke_node.html", "accessed": "2026-08-15"},
    {"id": "kenfo-2025", "title": "Ueber den KENFO / Jahresbericht 2025", "publisher": "KENFO - Fonds zur Finanzierung der kerntechnischen Entsorgung", "date": "2026", "url": "https://www.kenfo.de/der-fonds/ueber-den-kenfo", "accessed": "2026-08-15"},
    {"id": "efundresearch-kenfo", "title": "KENFO mit +6,2 % in 2025: Wie die Rendite von Deutschlands groesstem Staatsfonds zustande kam", "publisher": "e-fundresearch.com", "date": "2026", "url": "https://e-fundresearch.com/markets/artikel/59991-kenfo-mit-62-in-2025-wie-die-rendite-von-deutschlands-groesstem-staatsfonds-zustande-kam", "accessed": "2026-08-15"},
    {"id": "bmuv-kostenbericht-2025", "title": "Bericht ueber Kosten und Finanzierung der Entsorgung, Deutschland 2025", "publisher": "Bundesministerium fuer Umwelt (BMUV)", "date": "2025-12", "url": "https://www.bundesumweltministerium.de/fileadmin/Daten_BMU/Download_PDF/Nukleare_Sicherheit/kostenbericht_nukleare_entsorgung_deutschland_2025_de.pdf", "accessed": "2026-08-15", "note": "PDF in dieser Session nicht abrufbar - fuer die 170-Mrd.-Angabe zwingend primaer zu pruefen"},
    {"id": "bundestag-wd-3-330-10", "title": "Die Versicherungspflicht von Atomkraftwerken (Ausarbeitung WD 3 - 330/10)", "publisher": "Deutscher Bundestag, Wissenschaftliche Dienste", "date": "2010", "url": "https://www.bundestag.de/resource/blob/412752/5782d652a8e25945c65d84744d314b88/WD-3-330-10-pdf.pdf", "accessed": "2026-08-15"},
    {"id": "atdeckv", "title": "AtDeckV - Verordnung ueber die Deckungsvorsorge nach dem Atomgesetz", "publisher": "Bundesministerium der Justiz, gesetze-im-internet.de", "date": "laufend", "url": "https://www.gesetze-im-internet.de/atdeckv_1977/BJNR002200977.html", "accessed": "2026-08-15"},
    {"id": "atommuellreport-haftung", "title": "Haftung und Deckungsvorsorge", "publisher": "atommuellreport.de", "date": "laufend", "url": "https://www.atommuellreport.de/themen/detail/haftung-und-deckungsvorsorge.html", "accessed": "2026-08-15"},
    {"id": "atomkraftwerkeplag-haftung", "title": "Haftung und Deckungsvorsorge", "publisher": "AtomkraftwerkePlag Wiki", "date": "laufend", "url": "https://atomkraftwerkeplag.fandom.com/de/wiki/Haftung_und_Deckungsvorsorge", "accessed": "2026-08-15", "note": "Atomkritische Quelle - Interessenlage beachten, dient hier nur als Fundstelle fuer die 256-Mio.-Angabe"},
    {"id": "ritchie-construction-time", "title": "How long does it take to build a nuclear reactor?", "publisher": "Hannah Ritchie (Sustainability by Numbers), auf Basis IAEA PRIS", "date": "2023", "url": "https://hannahritchie.substack.com/p/nuclear-construction-time", "accessed": "2026-08-15"},
    {"id": "iaea-rds2-2025", "title": "Nuclear Power Reactors in the World, Reference Data Series No. 2, 2025 Edition", "publisher": "IAEA", "date": "2025", "url": "https://www-pub.iaea.org/MTCD/publications/PDF/RDS-2-45_web.pdf", "accessed": "2026-08-15", "note": "Tabelle 8: Median Construction Time in Months"},
    {"id": "iea-nea-2020", "title": "Projected Costs of Generating Electricity - 2020 Edition", "publisher": "IEA / OECD NEA", "date": "2020-12", "url": "https://www.iea.org/reports/projected-costs-of-generating-electricity-2020", "accessed": "2026-08-15", "note": "Domain in dieser Session blockiert; LCOE-Calculator unter https://www.oecd-nea.org/lcoe/"},
    {"id": "fraunhofer-ise-2024", "title": "Stromgestehungskosten Erneuerbare Energien", "publisher": "Fraunhofer-Institut fuer Solare Energiesysteme ISE", "date": "2024-07", "url": "https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/DE2024_ISE_Studie_Stromgestehungskosten_Erneuerbare_Energien.pdf", "accessed": "2026-08-15"},
    {"id": "lazard-lcoe-18", "title": "Levelized Cost of Energy+ (LCOE+), Version 18.0", "publisher": "Lazard", "date": "2025-06-16", "url": "https://www.lazard.com/media/uounhon4/lazards-lcoeplus-june-2025.pdf", "accessed": "2026-08-15"}
  ],

  "open_items": [
    "Cour des Comptes-Bericht vom 14.01.2025 im Volltext beschaffen und die 23,7-Mrd.-Zahl sowie ihre Abgrenzung (inkl./exkl. Finanzierung) primaer bestaetigen",
    "EDF-Ergebnisveroeffentlichung vom 20.02.2026 (Jahresabschluss 2025) im Original pruefen: Hinkley-Zahlen 35 vs. 48,7 Mrd. GBP und deren Preisbasen",
    "BMUV Kostenbericht 2025 beschaffen - insbesondere zur nicht verifizierten 170-Mrd.-Angabe",
    "EU-Beihilfeentscheidung Polen (SA-Nummer, Volltext) beschaffen - Details zur CfD-Ausgestaltung und zur Kostenbasis der 192 Mrd. PLN",
    "IAEA RDS-2 (2025 Edition), Tabelle 8, fuer eine belastbarere Bauzeit-Verteilung nach Jahrzehnt und Region auswerten",
    "Lazard LCOE+ v18 PDF im Volltext pruefen (Spanne 141-220 USD/MWh und deren Annahmen)",
    "Olkiluoto 3 (Finnland) als sechste westliche Referenz ergaenzen - in dieser Session NICHT recherchiert",
    "Volllaststunden-Annahmen mit Ist-Daten belegen (IAEA PRIS Load Factors nach Land), aktuell reine Modellannahme",
    "Pruefen, ob die 192 Mrd. PLN Polens nominal inkl. Bauzinsen sind oder Overnight - aendert den EUR/kW-Wert erheblich"
  ]
}
```
