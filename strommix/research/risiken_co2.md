---
title: "Risiken & CO₂-Bepreisung — Rechercheergebnis für das Strommix-White-Paper"
scope: "Deutschland / EU"
language: "de"
status: "Recherche Phase 1 · Rohmaterial für Teil B (CO₂-Preis-Slider) und Teil D (Risiken)"
recherche_datum: "2026-08-15"
zugriffsdatum_alle_quellen: "2026-08-15"
---

# Risiken & CO₂-Bepreisung

Rechercheergebnis für das White Paper *„Was braucht ein gesunder Strommix — und was
kostet er?"*. Zweck: belastbare Zahlenbasis mit Bandbreiten für (a) den CO₂-Preis
als Modellvariable und (b) den Risikoteil (Teil D).

---

## 0. Methodik, Verifikationsstatus und wichtige Einschränkung

**Bitte vor der Verwendung lesen.**

Die Recherche fand in einer Umgebung statt, in der der direkte Abruf von Webseiten
und PDFs (`WebFetch`) durch einen Netzwerk-Proxy **vollständig blockiert** war.
Betroffen waren unter anderem `ipcc.ch`, `unece.org`, `umweltbundesamt.de`,
`energy-charts.info` und `carbonbrief.org`. Alle nachfolgenden Zahlen stammen
daher aus **Websuche-Ergebnissen (Trefferlisten und deren Zusammenfassungen)**,
nicht aus dem geöffneten Primärdokument.

Konsequenz für die Weiterverarbeitung:

| Verifikationsstufe | Bedeutung | Kennzeichnung unten |
|---|---|---|
| **A** | Zahl mehrfach unabhängig in der Suche bestätigt, Primärquelle eindeutig benannt | `[A]` |
| **B** | Zahl einmal belegt, Primärquelle benannt, aber nicht gegengeprüft | `[B]` |
| **C** | Zahl plausibel, Quelle sekundär (Presse/Aggregator), Primärbeleg fehlt | `[C]` |

> **Regel für die Übernahme ins White Paper:** Jede Zahl der Stufen **B** und **C**
> muss vor der Veröffentlichung am Primärdokument gegengeprüft werden. Für Stufe A
> genügt eine Stichprobe. Kein Wert aus diesem Dokument darf ohne Quellenangabe
> ins HTML wandern (Projektregel aus `strommix/README.md`).

Zweite Einschränkung: Zitate aus dem IPCC-Bericht konnten nicht am Originaldokument
verifiziert werden. Die Wortlaute unten sind aus Suchergebnissen rekonstruiert; sie
entsprechen mit hoher Wahrscheinlichkeit dem Original, sind aber **vor der
Verwendung als wörtliches Zitat zwingend am PDF zu prüfen**.

**Neutralitätshinweis:** Der Abschnitt 6 (Kernkraft) und der Abschnitt 3
(Dunkelflaute) sind politisch umkämpft. Beide Seiten sind unten mit ihren jeweils
stärksten Argumenten und den zugehörigen Quellen abgebildet; wo eine Quelle ein
Eigeninteresse hat (Uniper als Kraftwerksbetreiber, Nuklearia als
Pro-Kernkraft-Verein, BUND als Anti-Atom-Verband), ist das ausgewiesen.

---

## 1. Klimaprämisse: Der wissenschaftliche Ausgangspunkt

Das White Paper verhandelt diese Prämisse nicht neu (siehe `README.md`, Prämisse 1),
sondern belegt sie. Vier zitierfähige Kernaussagen:

### 1.1 Vier Kernaussagen des IPCC AR6

**(K1) Menschgemachte Erwärmung — eindeutig, mit Zahl**

> „Human activities, principally through emissions of greenhouse gases, have
> unequivocally caused global warming, with global surface temperature reaching
> 1.1 °C above 1850–1900 in 2011–2020."

- Fundstelle: IPCC AR6 **Synthesis Report, Summary for Policymakers, Abschnitt A.1** `[A]`
- Quelle: IPCC (2023): *Climate Change 2023: Synthesis Report. Summary for
  Policymakers*, Intergovernmental Panel on Climate Change, März 2023.
  https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/ · Zugriff 2026-08-15
- Spiegel-Fundstelle (frei zugänglich): UN Digital Library,
  https://digitallibrary.un.org/record/4008082/files/IPCC_AR6_SYR_SPM.pdf · Zugriff 2026-08-15

**(K2) Die Erwärmung ist eindeutig menschlich verursacht — WG1-Formulierung**

> „It is unequivocal that human influence has warmed the atmosphere, ocean and land.
> Widespread and rapid changes in the atmosphere, ocean, cryosphere and biosphere
> have occurred."

- Fundstelle: IPCC AR6 **WG1, Summary for Policymakers, Abschnitt A.1** `[A]`
- Bedeutung für die Einordnung: Das ist eine Verschärfung gegenüber AR5 (2013), wo
  es noch hieß, es sei „extremely likely" (95–100 % Wahrscheinlichkeit), dass
  menschlicher Einfluss die dominante Ursache sei. AR6 verzichtet auf die
  Wahrscheinlichkeitsangabe und wählt „unequivocal". `[B]`
- Quelle: IPCC (2021): *Climate Change 2021: The Physical Science Basis. Summary
  for Policymakers*, WG1-Beitrag zum AR6, August 2021.
  https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/ · Zugriff 2026-08-15

**(K3) CO₂-Konzentration auf Zwei-Millionen-Jahres-Hoch**

> „In 2019, atmospheric CO₂ concentrations were higher than at any time in at least
> 2 million years (high confidence), and concentrations of CH₄ and N₂O were higher
> than at any time in at least 800,000 years (very high confidence)."

- Fundstelle: IPCC AR6 **WG1 SPM, Abschnitt A.2.1** `[B]`
- Absolutwert 2019: **410 ppm CO₂** `[B]`
- Quelle: wie K2.

**(K4) CO₂ ist der Treiber, und zwar quasi-linear — die für ein Kostenmodell
entscheidende Aussage**

> Zwischen **kumulativen** CO₂-Emissionen und dem Anstieg der globalen
> Oberflächentemperatur besteht ein **nahezu linearer Zusammenhang** (*high
> confidence*). Deshalb sind kumulative CO₂-Emissionen die relevante Größe, um den
> Einfluss vergangener und künftiger Emissionen auf die Erwärmung zu verstehen.

- Fundstelle: IPCC AR6 **WG1 SPM, Abschnitt D.1.1 sowie Abbildung SPM.10** `[A]`
- Daraus abgeleitetes Restbudget (Stand Anfang 2020):
  **500 Gt CO₂** für 50 % Wahrscheinlichkeit, die Erwärmung auf 1,5 °C zu begrenzen;
  **1.150 Gt CO₂** für 67 % Wahrscheinlichkeit für 2 °C.
  Fundstelle: **AR6 Synthesis Report SPM, Abschnitt B.5.2** `[A]`
- Quellen: wie K1 und K2.

**Warum K4 für dieses White Paper zentral ist:** Die Quasi-Linearität ist die
physikalische Rechtfertigung dafür, überhaupt einen *einheitlichen Preis pro Tonne
CO₂* anzusetzen — unabhängig davon, wo und wann emittiert wird. Ohne sie wäre ein
skalarer CO₂-Preis im Modell nicht sauber begründbar. Das gehört als
Methodik-Fußnote ins HTML.

### 1.2 CO₂-Intensität von Stromerzeugung über den Lebenszyklus

Referenzwerk ist die UNECE-Studie 2022 (Lebenszyklusanalyse, 12 Weltregionen,
harmonisierte Methodik). Alle Werte in **g CO₂-Äq./kWh**, Lebenszyklus („cradle to
grave"), nicht nur Direktemissionen im Betrieb.

| Technologie | Min | Max | Stufe | Anmerkung |
|---|---:|---:|---|---|
| Kohle (ohne CCS) | 751 | 1.095 | `[A]` | Min = IGCC USA, Max = Staubfeuerung China |
| Kohle mit CCS | 147 | 469 | `[B]` | CCS eliminiert Emissionen nicht |
| Erdgas GuD (ohne CCS) | 403 | 513 | `[A]` | stark abhängig von Methanschlupf der Vorkette |
| Erdgas GuD mit CCS | 49 | 220 | `[B]` | |
| Kernkraft | 5,1 | 6,4 | `[A]` | Hauptbeitrag: Front-End (Bergbau, Anreicherung) |
| Wasserkraft | 6 | 147 | `[B]` | Max: Reservoirs in warmen Klimazonen (Methan) |
| Wind onshore | 7,8 | 16 | `[A]` | |
| Wind offshore | 12 | 23 | `[A]` | |
| Photovoltaik | 8,0 | 83 | `[A]` | Spannweite = Technologie + Standort + Fertigungsstrommix |
| CSP (solarthermisch) | 27 | 122 | `[B]` | |

- Quelle: UNECE (2022): *Carbon Neutrality in the UNECE Region: Integrated
  Life-cycle Assessment of Electricity Sources*, United Nations Economic Commission
  for Europe, März 2022.
  https://unece.org/sites/default/files/2022-04/LCA_3_FINAL%20March%202022.pdf ·
  Zugriff 2026-08-15
- Vorgängerfassung (September 2021, teils abweichende Werte):
  https://www.unece.org/sites/default/files/2021-09/202109_UNECE_LCA_1.2_clean.pdf

**Wichtige Relativierung zur PV-Untergrenze (fair gegenüber beiden Seiten):**
Der UNECE-Wert von 8 g/kWh für PV ist ein *Best-Case* (optimaler Standort,
sauberer Fertigungsstrommix). Für **deutsche Verhältnisse** liegen realistische
Werte deutlich höher: Fraunhofer ISE nennt für Solarstrom in Deutschland
Lebenszyklus-Emissionen von **40–55 g CO₂/kWh**, andere Quellen 50–56 g/kWh bei
25 Jahren Betriebsdauer. `[C]` — Grund: geringere Einstrahlung (weniger kWh pro
installiertem Modul) und Modulfertigung überwiegend im chinesischen Strommix
(siehe Abschnitt 5.1).

- Quelle: Fraunhofer-Institut für Solare Energiesysteme ISE: *Aktuelle Fakten zur
  Photovoltaik in Deutschland* bzw. *Photovoltaics Report* (laufend aktualisiert),
  https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/aktuelle-fakten-zur-photovoltaik-in-deutschland.pdf ·
  Zugriff 2026-08-15
- Ältere ISE-Presseinformation zum CO₂-Fußabdruck von PV-Modulen (23.09.2021):
  https://www.ise.fraunhofer.de/content/dam/ise/de/documents/presseinformationen/2021/2221_ISE_d_PI_CO2-Fussabdruck-von-PV-Modulen.pdf

**Empfehlung für das Simulationsmodell:** Für PV zwei Werte anbieten —
„international/Best-Case" (~ 8–45 g) und „Deutschland realistisch" (~ 40–55 g).
Sonst entsteht ein systematischer Bias zugunsten von PV, den Kritiker zu Recht
angreifen würden.

**Datenlücke:** Die UNECE-Studie ist von 2022 und bildet die seither erfolgte
Dekarbonisierung der chinesischen Modulfertigung sowie gestiegene
Modulwirkungsgrade nicht ab. Eine neuere, gleich breit harmonisierte LCA-Studie
wurde in dieser Recherche nicht gefunden. Ein Hinweis darauf gehört ins White Paper.

---

## 2. CO₂-Preis: Ist-Stand, Regulierung, Projektionen

### 2.1 EU-ETS 1 — Preisentwicklung 2020 bis 2026

| Zeitpunkt | Preis (€/t CO₂) | Stufe | Beleg |
|---|---:|---|---|
| 2012–2017 (Kontext) | < 5 | `[C]` | Wiener Stadtwerke, Preisverlauf |
| Februar 2023 (Allzeithoch) | 100,34 | `[A]` | mehrfach bestätigt |
| Ende Februar 2024 | ~ 56 | `[B]` | |
| Anfang November 2025 | ~ 81,9 | `[B]` | |
| Anfang 2026 | ~ 65–75 | `[C]` | |
| März 2026 | 60–80 (Konsolidierung) | `[C]` | |
| 7. April 2026 (Spot) | 69,99 | `[C]` | |
| Mai 2026 (Monatsmittel) | ~ 74 | `[C]` | |
| **August 2026 (Zeitpunkt der Recherche)** | **nicht ermittelbar** | — | siehe Datenlücke |

- Quellen:
  - Statista: *EU-ETS price 2025–2026*, https://www.statista.com/statistics/1322214/carbon-prices-european-union-emission-trading-scheme/ · Zugriff 2026-08-15
  - Statista (DE): *CO₂-Preise im Emissionshandelssystem der EU*, https://de.statista.com/statistik/daten/studie/1454492/umfrage/co2-preise-im-emissionshandelssystem-der-eu/ · Zugriff 2026-08-15
  - Wiener Stadtwerke: *EU-ETS Preisentwicklung — Preis für Zertifikate pro Tonne CO₂*, https://positionen.wienerstadtwerke.at/wissenshub/grafiken/eu-ets-preisentwicklung · Zugriff 2026-08-15
  - Sandbag: *Carbon Price Viewer*, https://sandbag.be/carbon-price-viewer/ · Zugriff 2026-08-15
  - Umweltbundesamt: *Der Europäische Emissionshandel*, https://www.umweltbundesamt.de/daten/klima/der-europaeische-emissionshandel · Zugriff 2026-08-15

> **Datenlücke 1 (kritisch, muss vor Veröffentlichung geschlossen werden):**
> Eine geschlossene Zeitreihe der **Jahresdurchschnittspreise 2020–2026** konnte
> nicht beschafft werden — nur Einzelpunkte. Für das White Paper sollte die
> EEX-Auktionsdatenbank oder Sandbag/EEA als Primärquelle gezogen und als CSV in
> `strommix/data/raw/` abgelegt werden. Auch der **aktuelle Preis am 2026-08-15**
> fehlt und muss aus einer Marktdatenquelle (ICE/EEX) ergänzt werden. Bis dahin:
> als Default für den Slider ~ 75 €/t ansetzen und als „Stand Mai 2026" ausweisen.

### 2.2 EU-ETS 2 — Start, Preiserwartung, Preisdeckel

**Regulatorischer Stand (wichtig — hat sich 2025 geändert):**

- Der ETS 2 (Gebäude, Straßenverkehr, kleine Industrie) startet **nicht 2027,
  sondern 2028**. Der EU-Rat beschloss die Verschiebung am **05.11.2025**, das
  Europäische Parlament stimmte am **13.11.2025** zu. `[A]`
- Der bestehende Preiskorrekturmechanismus wurde verschärft: Die Zahl der
  zusätzlich freigebbaren Zertifikate wurde von **40 Mio. auf 80 Mio. pro Jahr
  verdoppelt**; ausgelöst wird sie, wenn der Preis **45 €/t CO₂-Äq. (in Preisen
  von 2020, inflationsindexiert)** überschreitet. Das ist ein *weicher* Deckel —
  keine harte Preisobergrenze. `[A]`
- In Deutschland gilt 2027 weiterhin das BEHG; der Koalitionsausschuss will den
  nationalen Preiskorridor von **55–65 €/t** fortführen. `[C]`

- Quellen:
  - CLECAT: *EP and Council confirm ETS2 postponement to 2028*, https://www.clecat.org/news/newsletters/ep-and-council-confirm-ets2-postponement-to-2028 · Zugriff 2026-08-15
  - IRU: *ETS2: EU strengthens carbon price safeguards ahead of 2028 launch*, https://www.iru.org/news-resources/newsroom/ets2-eu-strengthens-carbon-price-safeguards-ahead-2028-launch · Zugriff 2026-08-15
  - Veyt: *EU ETS2 delay to 2028: EU ministers approve postponement*, https://veyt.com/eu-ets/eu-ets2-delay-to-2028/ · Zugriff 2026-08-15
  - Transport & Environment: *Making ETS2 work*, Briefing, Dezember 2025, https://uploads.transportenvironment.org/production/files/ETS2_briefing-FINAL_08_12.pdf · Zugriff 2026-08-15
  - Jacques Delors Institut: *Delivering the ETS2*, Policy Paper 317, November 2025, https://institutdelors.eu/content/uploads/2025/11/PP317_ETS2_Nguyen_EN.pdf · Zugriff 2026-08-15

**Preiserwartungen ETS 2 — sehr breite Streuung, das ist die Kernbotschaft:**

| Quelle | Aussage | Stufe |
|---|---|---|
| EWI (Uni Köln), Endbericht April 2025 | ~ 120 €/t (2027), ~ 160 €/t (Mittel bis 2035), ~ 205 €/t (2035) | `[B]` |
| Zukunft KlimaSozial (Think Tank), Jan. 2026 | Startpreis 50–90 €/t; bis 2030 auf 100–160 €/t steigend | `[C]` |
| Friedrich-Ebert-Stiftung (Modellvergleich) | **60–380 €/t** — die meisten Modelle > 100 €/t | `[C]` |
| REMIND-EU-Modell | ~ 220 €/t im Jahr 2027 | `[C]` |
| BloombergNEF | ETS 2 als „weltweit höchster CO₂-Preis 2030": **149 €/t**; in anderem Szenario 122 €/t | `[B]` |
| allgemeine Marktprognosen | 100–250 €/t bis 2030 | `[C]` |

- Quellen:
  - EWI Energiewirtschaftliches Institut an der Universität zu Köln: *Auswirkungen und Preispfade des EU ETS2*, Endbericht, April 2025, https://www.ewi.uni-koeln.de/cms/wp-content/uploads/2025/04/EU-ETS2_Endbericht.pdf · Zugriff 2026-08-15
  - Zukunft KlimaSozial gGmbH: *KlimaSozial kompakt — ETS2 und soziale Gestaltung*, Januar 2026, https://zukunft-klimasozial.de/wp-content/uploads/2026/01/KlimaSozial-kompakt_ETS2-und-soziale-Gestaltung.pdf · Zugriff 2026-08-15
  - BloombergNEF: *Europe's New Emissions Trading System Expected to Have World's Highest Carbon Price in 2030 at €149*, https://about.bnef.com/insights/commodities/europes-new-emissions-trading-system-expected-to-have-worlds-highest-carbon-price-in-2030-at-e149-bloombergnef-forecast-reveals/ · Zugriff 2026-08-15
  - klimareporter: *Welchen Preis hat der neue Emissionshandel?*, https://klimareporter.de/finanzen-wirtschaft/welchen-preis-hat-der-neue-emissionshandel · Zugriff 2026-08-15

> **Hinweis zur Relevanz für dieses White Paper:** Der ETS 2 betrifft **nicht** die
> Stromerzeugung (die liegt im ETS 1). Er ist für das Strommix-Modell nur indirekt
> relevant — über Sektorkopplung (Wärmepumpen, E-Mobilität werden gegenüber
> Gasheizung/Verbrenner relativ günstiger, Strombedarf steigt). Er sollte im White
> Paper erwähnt, aber **nicht** in den Strom-CO₂-Preis-Slider gemischt werden.

### 2.3 EU-ETS 1 — Preisprojektionen 2030 und 2040

| Horizont | Wert / Spanne | Quelle | Stufe |
|---|---|---|---|
| 2030 (Konsens-Median) | **126 €/t** | GMK Center, Median aus BloombergNEF, ABN Amro, Refinitiv, ICIS, S&P Global, Aurora Energy Research, PIK | `[B]` |
| 2030 (Analystenspanne) | **80–147 €/t** | ebd. | `[B]` |
| 2030 (BNEF Base Case) | 147 €/t | BloombergNEF | `[B]` |
| 2030 (EU-KOM „Fit for 55" Impact Assessment, zentrales Szenario) | ~ 50–85 €/t | Europäische Kommission | `[C]` |
| 2044 (ohne Reform der MSR) | **> 500 €/t** | Enerdata | `[C]` |
| 2040 | **keine belastbare Projektion** | — | siehe Datenlücke 2 |

- Quellen:
  - GMK Center: *Carbon price in the EU ETS to hit €126/t by 2030*, https://gmk.center/en/infographic/carbon-price-in-the-eu-ets-to-hit-e126-t-by-2030/ · Zugriff 2026-08-15
  - Enerdata: *Carbon Price Forecast 2030–2050: Assessing Market Stability & Future Challenges*, https://www.enerdata.net/publications/executive-briefing/carbon-price-projections-eu-ets.html · Zugriff 2026-08-15
  - ABN Amro: *ESG Economist — Scenarios shaping EU ETS prices*, https://www.abnamro.com/research/en/our-research/esg-economist-scenarios-shaping-eu-ets-prices · Zugriff 2026-08-15

> **Datenlücke 2:** Für **2040** existiert kein belastbarer Konsens, weil das
> EU-ETS-Ziel für 2040 zum Recherchezeitpunkt regulatorisch nicht abschließend
> festgelegt ist (u. a. Streit über die Anrechnung internationaler
> CO₂-Gutschriften). Alle 2040-Werte im White Paper sind entsprechend als
> **Szenario, nicht als Prognose** zu kennzeichnen. Die Spanne 100–500 €/t bildet
> den heutigen Erwartungsraum ab.

### 2.4 CO₂-Schattenpreise: Was eine Tonne CO₂ *gesellschaftlich* kostet

Das ist eine **andere Größe** als der Marktpreis: nicht was Emittenten zahlen,
sondern was die Emission an Klimafolgeschäden verursacht. Für ein neutrales White
Paper ist die Unterscheidung wichtig, weil beide Lager sie gerne vermischen.

**Aktueller Stand — UBA Handbuch Umweltkosten (Methodenkonvention 4.0), Februar 2026:**

| Ansatz | Kostensatz | Stufe |
|---|---:|---|
| Klimakostensatz (Zentralwert MK 4.0) | **990 €/t** THG | `[B]` |
| Vorversion (zum Vergleich) | 890 €/t | `[C]` |

- Quelle: Umweltbundesamt (2026): *Handbuch Umweltkosten — Methodenkonvention 4.0*,
  Hrsg. Umweltbundesamt, Dessau-Roßlau, Februar 2026 (Autor:innen u. a. Nadia Eser,
  Astrid Matthey, Björn Bünger; Modellbasis: Open-Source-Modell **GIVE**, Greenhouse
  Gas Impact Value Estimator; Mitwirkende: INFRAS, EIFER, IÖW, CE Delft, Intersus,
  David Anthoff/UC Berkeley).
  https://www.umweltbundesamt.de/system/files/medien/479/publikationen/2026-02/UBA_Handbuch%20Umweltkosten_Methodenkonvention%204.0.pdf ·
  Zugriff 2026-08-15
- Begleitend: INFRAS: *Berechnung von Umweltkosten: Methodenkonvention 4.0 zeigt
  aktuelle Kostensätze*, https://www.infras.ch/de/projekte/okonomische-folgen-umweltbelastungen-berechnung-umweltkosten-methodenkonvention-4-aktuell-kostensatze/ ·
  Zugriff 2026-08-15
- Übersichtsseite: Umweltbundesamt: *Gesellschaftliche Kosten von Umweltbelastungen*,
  https://www.umweltbundesamt.de/daten/umwelt-wirtschaft/gesellschaftliche-kosten-von-umweltbelastungen · Zugriff 2026-08-15

**Vorgängerwerte (weiterhin in vielen Studien zitiert — für Zeitreihen relevant):**

| Fassung | Kostensatz | Diskontierung | Emissionsjahr | Stufe |
|---|---:|---|---|---|
| MK 3.2 | **350 €₂₀₂₅/t** | 1 % Zeitpräferenzrate | 2026 | `[B]` |
| MK 3.2 | **1.000 €₂₀₂₅/t** | 0 % (Gleichgewichtung heutiger/künftiger Generationen) | 2026 | `[B]` |
| MK 3.0/3.1 | 195–205 €₂₀₁₆/t | 1 % | 2020 bzw. 2030 | `[C]` |
| MK 3.0/3.1 | 640 €₂₀₁₆/t | 0 % (Sensitivität) | 2030 | `[C]` |
| MK 3.x | 188 €/t | — | 2022 | `[C]` |

- Quellen:
  - Umweltbundesamt: *Methodological Convention 3.2 for the Assessment of
    Environmental Costs — Cost Rates*, https://www.umweltbundesamt.de/sites/default/files/medien/479/publikationen/methodological_convention_3_2_value_factors_bf.pdf · Zugriff 2026-08-15
  - Umweltbundesamt (2020): *Methodenkonvention 3.1 zur Ermittlung von Umweltkosten —
    Kostensätze*, Dezember 2020, https://www.umweltbundesamt.de/sites/default/files/medien/1410/publikationen/2020-12-21_methodenkonvention_3_1_kostensaetze.pdf · Zugriff 2026-08-15
  - Umweltbundesamt (2019): *Methodenkonvention 3.0*, Februar 2019, https://www.umweltbundesamt.de/sites/default/files/medien/1410/publikationen/2019-02-11_methodenkonvention-3-0_kostensaetze_korr.pdf · Zugriff 2026-08-15
  - Deutscher Bundestag, Wissenschaftliche Dienste: *CO₂-Emissionen: Preise und
    Kosten*, WD 5 – 104/24, https://www.bundestag.de/resource/blob/1021378/4edf15c87b75d74c51eb672f10703fcb/WD-5-104-24-pdf.pdf · Zugriff 2026-08-15

**Der eigentliche Streitpunkt, fair dargestellt:** Der Unterschied zwischen ~350 €/t
und ~1.000 €/t ist **kein Rechenfehler, sondern eine ethische Setzung** — nämlich
die Frage, ob Wohlfahrtsverluste künftiger Generationen abdiskontiert werden dürfen
(1 % reine Zeitpräferenz) oder gleich zu gewichten sind (0 %). Wer die 990/1.000 €/t
zitiert, argumentiert intergenerationell egalitär; wer die 350 €/t zitiert, folgt
der konventionellen ökonomischen Praxis. Beide Positionen sind in der
Umweltökonomie vertreten. Für das White Paper: **beide Werte zeigen, den
Diskontierungsparameter offenlegen und nicht als „den" Schattenpreis verkaufen.**

Zur Einordnung der Größenordnungen existiert außerdem eine laufend gepflegte
Meta-Datenbank der Social-Cost-of-Carbon-Literatur:
- Quelle: *Database for the meta-analysis of the social cost of carbon (v2026.1)*,
  arXiv, https://arxiv.org/pdf/2402.09125 · Zugriff 2026-08-15 `[C]`

### 2.5 Empfehlung: Slider-Design für die Simulation

| Marke | Wert (€/t) | Beschriftung im HTML |
|---:|---:|---|
| 0 | 0 | Kein CO₂-Preis (Referenzfall) |
| 25 | 25 | historisches Niveau ~2019/20 |
| **75** | **75** | **Default: EU-ETS-1-Marktpreis, Stand Mai 2026** |
| 100 | 100 | ETS-1-Allzeithoch (Feb. 2023: 100,34) |
| 126 | 126 | Analystenkonsens 2030 |
| 150 | 150 | oberes Ende der 2030-Analystenspanne |
| 205 | 205 | EWI-ETS-2-Pfad 2035 (Sektorkopplungs-Referenz) |
| 350 | 350 | UBA-Schattenpreis MK 3.2, 1 % Diskontierung |
| 400 | 400 | Slider-Maximum |

Der vom Auftrag genannte Bereich **0–400 €/t** ist gut gewählt: er deckt Marktpreis,
Konsensprojektion und den 1 %-Schattenpreis ab. Die Werte >400 €/t (UBA MK 4.0 mit
990 €/t, Enerdata >500 €/t für 2044) sollten **nicht** in den Slider, sondern als
separater Umschalter „Klimafolgekosten statt Marktpreis anzeigen" — sonst dominiert
ein einziger, methodisch strittiger Parameter das gesamte Kostenergebnis.

---

## 3. Dunkelflaute & Versorgungssicherheit

### 3.1 Definition — der Grund, warum sich die Studien scheinbar widersprechen

Es gibt **keine einheitliche Definition**. Das ist der Hauptgrund, warum die eine
Seite „Dunkelflauten sind selten" und die andere „Dunkelflauten sind Normalzustand"
sagen kann — beide mit korrekten Zahlen.

| Definition | Schwelle | Mindestdauer | Verwendet von |
|---|---|---|---|
| Deutscher Wetterdienst | < 10 % der Nennleistung | 48 h | DWD, LBBW `[B]` |
| Uniper-Kurzstudie 2026 | < 10 % der installierten Leistung (Wind+PV zusammen), gleitender 6-h-Mittelwert | 10 h | Uniper `[A]` |
| weitere Studien | 2 %, 5 % oder 10 % der installierten Leistung | variabel | diverse `[B]` |

**Für das White Paper zwingend:** Die verwendete Definition muss explizit genannt
werden, sonst ist die Simulation angreifbar.

### 3.2 Häufigkeit und Dauer — Datenbasis 2016–2025

| Ereignistyp | Häufigkeit | Quelle | Stufe |
|---|---|---|---|
| > 10 h (Uniper-Definition) | **1.435 Ereignisse** in 2016–2025, also im Mittel **öfter als alle 3 Tage**; mittlere Dauer **12,9 h** | Uniper 2026 | `[A]` |
| ~ 24 h | **etwa monatlich** | Uniper 2026 | `[B]` |
| > 48 h | **ca. 2×/Jahr** (LBBW) bzw. **ca. 3×/Jahr im Mittel 2016–2025** (andere Auswertung) | LBBW / Uniper | `[A]` |
| ~ 3 Tage | **ca. 2×/Jahr** | Uniper 2026 | `[B]` |
| > 5 Tage | statistisch **etwa alle 3,5 Jahre** | Uniper 2026 | `[B]` |
| > 1 Woche | **etwa alle 10 Jahre** | LBBW | `[B]` |
| längstes Ereignis 10 Jahre | **5,4 Tage** | LBBW | `[B]` |
| längste zusammenhängende Phase im Datensatz 2016–2025 | 20 Tage (bei loser Definition) | Sekundärquelle | `[C]` |

- Quellen:
  - Uniper SE (2026): *Kurzstudie Dunkelflauten*, veröffentlicht Anfang Juni 2026;
    Zeitreihenanalyse Wind- und Solarerzeugung 2016–2025.
    Berichterstattung: pv magazine, 01.06.2026, https://www.pv-magazine.de/2026/06/01/uniper-dunkelflauten-sind-regelmaessiger-bestandteil-des-deutschen-stromsystems/ ·
    Solarserver, 02.06.2026, https://www.solarserver.de/2026/06/02/uniper-deutschland-erlebt-regelmaessig-dunkelflauten/ ·
    Photon, https://www.photon.info/news/uniper-studie-dunkelflauten-sind-normalzustand-batteriespeicher/ · alle Zugriff 2026-08-15
  - LBBW Research (2025): *Analysen und Statistiken zu Dunkelflauten in Deutschland*,
    Landesbank Baden-Württemberg, https://www.lbbw.de/artikel/research-studien-2025/dunkelflaute_ake25jccd8_d.html · Zugriff 2026-08-15
  - Solarserver: *Analyse: Dunkelflauten bleiben selten — trotz Ausbau erneuerbarer
    Energien*, 19.12.2025, https://www.solarserver.de/2025/12/19/analyse-dunkelflauten-bleiben-selten-trotz-ausbau-erneuerbarer-energien/ · Zugriff 2026-08-15
  - klimareporter: *Dunkelflaute als Normalfall?*, https://klimareporter.de/strom/dunkelflaute-als-normalfall · Zugriff 2026-08-15

> **Interessenlage transparent machen:** Uniper ist Betreiber konventioneller
> Kraftwerke und hat ein wirtschaftliches Interesse an der Betonung des
> Backup-Bedarfs. Die Methodik (10-h-Schwelle statt DWD-48-h) ist deshalb
> gesondert zu kennzeichnen — sie ist nicht falsch, aber sie produziert
> naturgemäß viel höhere Ereigniszahlen als die DWD-Definition. Umgekehrt
> gilt: Wer nur die DWD-Definition verwendet, blendet 10–24-stündige
> Erzeugungslücken aus, die für den Speicherbedarf sehr wohl relevant sind.

### 3.3 Das Ereignis Dezember 2024 — Referenzfall für die Simulation

- **Zeitraum:** insbesondere 11./12. Dezember 2024 (zweites Ereignis: 6. November 2024).
- **Preisspitze Day-Ahead:** zeitweise über **300 €/MWh**, Spitzen über **900 €/MWh**;
  am 11.12.2024 kurzzeitig **über 1.000 €/MWh**. `[A]`
- **Intraday:** vom Nachmittag des 11.12. bis 20 Uhr durchgehend im Mittel
  **> 1.000 €/MWh** — Jahresrekord im Intraday-Markt. `[B]`
- **Verfügbare Reserven laut Behördenanalyse:** In den teuersten Stunden am
  06.11. und 12.12.2024 waren nach Schätzung von Bundesnetzagentur und
  Bundeskartellamt noch **ca. 3,4–4,5 GW marktverfügbare Kapazitäten** sowie
  **12–13 GW Reserven** vorhanden. `[A]`
- **Befund der Behörden:** **kein Marktmissbrauch** nachweisbar, aber ein
  **strukturelles Problem**. `[A]`
- **Kontext Winderzeugung:** Dezember 2024 lag der Windanteil bei 14,82 %
  (Dezember 2023: 18,42 %). `[C]`

- Quellen:
  - Bundesnetzagentur / Bundeskartellamt: *Bundesnetzagentur und Bundeskartellamt
    veröffentlichen Untersuchung zu Strompreisspitzen während Dunkelflauten 2024*,
    Pressemitteilung vom 21.10.2025,
    https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20251021_Preisspitzen.html · Zugriff 2026-08-15
  - Zeitung für kommunale Wirtschaft (zfk): *Strompreise in der Dunkelflaute:
    Behörden sehen Problem*, https://www.zfk.de/energie/strom/strompreise-in-der-dunkelflaute-kein-marktmissbrauch-aber-strukturelles-problem · Zugriff 2026-08-15
  - Next Kraftwerke: *Strommarkt Dezember 2024*, https://www.next-kraftwerke.de/energie-blog/strommarkt-dezember-2024 · Zugriff 2026-08-15

**Der springende Punkt für das Kostenmodell:** Der Dezember-2024-Fall zeigt, dass
das System die Dunkelflaute *technisch bewältigt* hat (keine Versorgungsunterbrechung,
Reserven vorhanden), aber zu *sehr hohen Marktpreisen*. Das ist ein
Preis-/Kostenproblem, kein Blackout-Problem. Beide Lager verkürzen das gerne — die
eine Seite zu „das System war am Rand des Kollaps", die andere zu „alles lief
problemlos". Beide Verkürzungen sind durch die Behördenanalyse nicht gedeckt.

### 3.4 Benötigte gesicherte Leistung

Amtliche Referenz ist das Versorgungssicherheitsmonitoring der Bundesnetzagentur
vom **03.09.2025**:

| Zielhorizont | Zusätzlich benötigte steuerbare Leistung | Szenario | Stufe |
|---|---:|---|---|
| 2030 | **17–21 GW** | — | `[B]` |
| 2035 | **bis 22,4 GW** | Zielszenario (Ausbauziele werden erreicht) | `[A]` |
| 2035 | **bis 35,5 GW** (teils als „bis 36 GW Gaskraftwerke" berichtet) | Szenario „verzögerte Energiewende" | `[A]` |
| (LBBW, unabhängig) | **23 GW** Back-up-Leistung nötig | — | `[C]` |

- Quellen:
  - Bundesnetzagentur (2025): *Bericht zur Versorgungssicherheit Strom 2025 /
    Versorgungssicherheitsmonitoring*, 03.09.2025,
    https://www.bundesnetzagentur.de/1072798 · Zugriff 2026-08-15
  - BMWE: *Bundesnetzagentur legt Bericht zur Versorgungssicherheit Strom vor*,
    Pressemitteilung 03.09.2025,
    https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2025/09/20250903-bundesnetzagentur-legt-bericht-zur-versorgungssicherheit-strom-vor.html · Zugriff 2026-08-15
  - Bericht (PDF): https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Publikationen/Energie/versorgungssicherheit-strom-bericht-2025.pdf · Zugriff 2026-08-15
  - pv magazine: *Versorgungssicherheitsmonitoring sieht Bedarf von bis zu 35,5
    Gigawatt an zusätzlichen steuerbaren Kapazitäten bis 2035*, 03.09.2025,
    https://www.pv-magazine.de/2025/09/03/versorgungssicherheitsmonitoring-sieht-bedarf-von-bis-zu-355-gigawatt-an-zusaetzlichen-steuerbaren-kapazitaeten-bis-2035/ · Zugriff 2026-08-15

**Bemerkenswert und für die Neutralität wichtig:** Der Bedarf ist keine
Naturkonstante, sondern hängt stark davon ab, wie schnell **Flexibilität** auf der
Nachfrageseite entsteht. Die Differenz 22,4 GW ↔ 35,5 GW ist im Wesentlichen die
Differenz zwischen „Flexibilisierung gelingt" und „Flexibilisierung gelingt nicht".
Das ist im Modell als eigener Parameter abzubilden.

### 3.5 Speicherbedarf für hohe EE-Anteile

| Größe | Wert | Quelle | Stufe |
|---|---:|---|---|
| Batteriespeicher 2045 (Kapazität) | **~ 380 GWh** | Fraunhofer ISE, Studie 2026 | `[C]` |
| Batteriespeicher 2045 (Kapazität) | **~ 180 GWh** | Fraunhofer ISE, Studie 2022 | `[C]` |
| Batteriespeicher 2045 (Kapazität) | **500–600 GWh** | CAV Partners AG, Analyse Feb. 2026 | `[C]` |
| Wasserstoff-Speicherkapazität | **mind. 130 TWh** | Fraunhofer ISE | `[C]` |
| Energiebedarf einer 48-h-Dunkelflaute an kalten Wintertagen | bis 2 TWh/Tag → **~ 4 TWh in 48 h** | LBBW | `[B]` |

- Quellen:
  - Fraunhofer ISE: *Klimaneutrales Deutschland / regionale Transformationspfade*,
    https://www.ise.fraunhofer.de/en/press-media/press-releases/2024/achieving-climate-neutrality-fraunhofer-ise-study-shows-regional-transformation-pathways-for-german-energy-system.html · Zugriff 2026-08-15
  - Fraunhofer ISE: *BAT4CPP — Batteriespeicher an ehemaligen Kraftwerksstandorten*,
    Positionspapier, https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/Fraunhofer-ISE-Batteriespeicher-an-ehemaligen-Kraftwerkstandorten.pdf · Zugriff 2026-08-15
  - CAV Partners AG: *Deutschland benötigt bis 2045 rund 600 GWh Batteriespeicher*,
    20./23.02.2026, https://cav-partners.de/2026/02/23/deutschland-benoetigt-bis-2045-rund-zu-600-gwh-batteriespeicher-cav-analyse-zeigt-ausbau-nur-mit-verstaerktem-privatem-kapital-realisierbar/ · Zugriff 2026-08-15
  - LBBW Research, s. o.

**Zentrale technische Aussage (von beiden Lagern akzeptiert):** Batteriespeicher
können **Dunkelflauten über 10 Stunden nicht zuverlässig überbrücken** — die
Speichertiefe reicht nicht. Batterien sind für Intraday-Flexibilität und
Preisspitzen-Pufferung sehr wertvoll, für die 48-h-plus-Lücke braucht es
Langzeitspeicher (H₂, Pumpspeicher), steuerbare Kraftwerke, Importe oder
Lastmanagement. `[A]` (Uniper 2026; unwidersprochen auch von PV-nahen Medien
berichtet.)

> **Datenlücke 3:** Die Speicherbedarfszahlen liegen um Faktor 3 auseinander
> (180 vs. 600 GWh). Die Ursache ist nicht aus den Sekundärquellen rekonstruierbar
> — vermutlich unterschiedliche Annahmen zu Netzausbau, Import/Export,
> Lastflexibilität und H₂-Verfügbarkeit. Für das White Paper: **Spanne 180–600 GWh
> ausweisen** und die Treiber der Spanne benennen, statt einen Punktwert zu wählen.

---

## 4. Netz- und Systemkosten

### 4.1 Redispatch und Netzengpassmanagement

| Jahr | Kosten Netzengpassmanagement | Volumen | Stufe |
|---|---:|---:|---|
| 2023 | **3,335 Mrd. €** | 34.297 GWh | `[A]` |
| 2024 | **2,776 Mrd. €** (−17 % ggü. 2023) | 30.304 GWh (−12 %) | `[A]` |
| 2025 | **~ 3,1 Mrd. €** (+ ~4 % ggü. 2024) | — | `[B]` |

- Quellen:
  - Bundesnetzagentur, veröffentlicht über SMARD (Quartals-/Jahresauswertungen
    Netzengpassmanagement), https://www.smard.de/page/home/topic-article/444/219200/volumen-und-kosten-gestiegen und
    https://www.smard.de/page/home/topic-article/444/216636/volumen-und-kosten-gesunken · Zugriff 2026-08-15
  - Energie & Management: *Netzengpasskosten 2024 um 500 Millionen Euro gesunken*,
    https://www.energie-und-management.de/nachrichten/energieerzeugung/detail/netzengpasskosten-2024-um-500-millionen-euro-gesunken-259018 · Zugriff 2026-08-15
  - Energie & Management: *Mehr Redispatchkosten trotz stabiler Eingriffe*,
    https://www.energie-und-management.de/nachrichten/recht/detail/mehr-redispatchkosten-trotz-stabiler-eingriffe-357846 · Zugriff 2026-08-15
  - Bundesverband WindEnergie: *Was kostet uns Redispatch?*, Faktencheck, April 2026,
    https://www.wind-energie.de/fileadmin/redaktion/dokumente/publikationen-oeffentlich/themen/04-politische-arbeit/01-gesetzgebung/20260421_Faktencheck_Redispatch.pdf · Zugriff 2026-08-15 *(Branchenverband — Interessenlage beachten)*
  - cleanthinking: *Redispatch-Kosten 2026: Stimmt Reiches Zahl? Faktencheck*,
    https://www.cleanthinking.de/faktencheck-redispatch-drei-milliarden/ · Zugriff 2026-08-15

**Trend:** Kein monotoner Anstieg. 2024 deutlich gesunken, 2025 wieder leicht
gestiegen. Die im politischen Raum gelegentlich genannte Größenordnung „drei
Milliarden" ist damit für 2023–2025 näherungsweise korrekt, aber die
Behauptung eines ungebremsten Kostenanstiegs ist durch die Daten **nicht** gedeckt.
Prognosen wurden zwischenzeitlich **um 4 Mrd. € nach unten korrigiert** `[C]`
(zfk: https://www.zfk.de/politik/deutschland/redispatch-kosten-kosten-vier-milliarden-euro).

### 4.2 Abregelung (Curtailment) erneuerbarer Energien

| Jahr | Abgeregelte Menge | Anteil an EE-Erzeugung | Stufe |
|---|---:|---:|---|
| 2024 | **~ 9,4 TWh** (9,4 Mrd. kWh) | **~ 3,5 %** | `[A]` |
| davon PV 2024 | **1.389 GWh** (+97 % ggü. 2023) | — | `[A]` |
| 2025 | — | **~ 3,5 %** | `[B]` |
| davon PV 2025 | **~ 2,7 TWh** (+ ~94 % ggü. 2024) | — | `[B]` |
| Wind Q1/2025 | 2.115 GWh (Q1/2024: 2.429 GWh, −13 %) | — | `[B]` |

- Quellen:
  - Bundesnetzagentur (über SMARD), s. o.
  - Agentur für Erneuerbare Energien: *Durch Abregelung verlorene Stromerzeugung
    aus Erneuerbaren Energien*, https://www.unendlich-viel-energie.de/mediathek/grafiken/durch-abregelung-verlorene-stromerzeugung · Zugriff 2026-08-15
  - pv magazine: *Abregelung von Photovoltaik-Anlagen stieg 2024 um 97 Prozent*,
    03.04.2025, https://www.pv-magazine.de/2025/04/03/abregelung-von-photovoltaik-anlagen-stieg-2024-um-97-prozent/ · Zugriff 2026-08-15
  - SMARD: *Uneinheitliche Entwicklungen*, https://www.smard.de/page/home/topic-article/444/217642/uneinheitliche-entwicklungen · Zugriff 2026-08-15

**Struktureller Trend:** Der Anteil der abgeregelten Erzeugung bleibt bei ~3,5 %,
aber die **Zusammensetzung verschiebt sich massiv von Wind zu PV** (PV-Abregelung
verdoppelt sich zwei Jahre in Folge). Das ist ein Sommer-/Mittagsproblem
(Erzeugungsspitzen), während die Windabregelung ein Nord-Süd-Netzproblem ist. Für
das Modell sind das **zwei verschiedene Effekte** mit verschiedenen Lösungen
(Speicher/Flexibilität vs. Netzausbau).

### 4.3 Negative Strompreise

| Jahr | Stunden mit negativem Day-Ahead-Preis | Stufe |
|---|---:|---|
| 2023 | **399** | `[B]` |
| 2024 | **457** (damaliger Rekord) | `[A]` |
| 2025 | **573** (neuer Rekord) | `[B]` |
| H1 2025 | 389 (H1 2024: 215 → **+80 %**) | `[A]` |
| Juni 2025 (Monatsrekord) | 141 | `[A]` |
| Mai 2025 | 130 | `[B]` |

- Quellen:
  - pv magazine: *Day-ahead-Strompreise in 389 Stunden negativ im ersten Halbjahr*,
    30.06.2025, https://www.pv-magazine.de/2025/06/30/day-ahead-strompreise-in-389-stunden-negativ-im-ersten-halbjahr/ · Zugriff 2026-08-15
  - pv magazine: *Rekord von 457 negativen Börsenstrompreisstunden aus Vorjahr
    eingestellt*, 25.08.2025, https://www.pv-magazine.de/2025/08/25/rekord-von-457-negativen-boersenstrompreisstunden-aus-vorjahr-eingestellt/ · Zugriff 2026-08-15
  - pv magazine: *Hoch- und Niedrigpreiszeiten nehmen 2025 zu*, 05.01.2026,
    https://www.pv-magazine.de/2026/01/05/hoch-und-niedrigpreiszeiten-nehmen-2025-zu/ · Zugriff 2026-08-15
  - Statista: *Anzahl der Stunden mit negativen Strompreisen in Deutschland*,
    https://de.statista.com/statistik/daten/studie/618751/umfrage/anzahl-der-stunden-mit-negativen-strompreisen-in-deutschland/ · Zugriff 2026-08-15
  - Solarserver: *Stunden mit negativen Strompreisen 2025 im Juni auf Allzeithoch*,
    01.07.2025, https://www.solarserver.de/2025/07/01/stunden-mit-negativen-strompreisen-2025-im-juni-auf-allzeithoch/ · Zugriff 2026-08-15

**Klarer, robuster Trend:** ~400 → ~460 → ~570 Stunden in drei Jahren. Das ist
ökonomisch die Kehrseite der Abregelung: Überschussstrom hat negativen Wert, weil
Flexibilität fehlt. Für das Kostenmodell relevant, weil es die **erzielbaren
Erlöse pro kWh PV** (Marktwertfaktor) senkt — ein Effekt, der in reinen
LCOE-Vergleichen systematisch untergeht und den Kritiker eines reinen
LCOE-Vergleichs zu Recht ins Feld führen.

### 4.4 Netzausbau-Investitionsbedarf

| Größe | Wert | Quelle | Stufe |
|---|---:|---|---|
| Übertragungsnetz bis 2045 (NEP-Maßnahmen) | **360–392 Mrd. €** (szenarienabhängig) | NEP 2037/2045 (2025) | `[B]` |
| Übertragungsnetz bis 2045 | ~ 328 Mrd. € | IMK-Studie | `[C]` |
| Verteilnetz bis 2045 | ~ 323 Mrd. € | IMK-Studie | `[C]` |
| **Gesamt (Übertragung + Verteilung) bis 2045** | **~ 650 Mrd. €** | IMK/Hans-Böckler-Stiftung | `[B]` |
| Jahresschnitt bis 2037 | ~ 19,8 Mrd. €/a | | `[C]` |

- Quellen:
  - Übertragungsnetzbetreiber: *Netzentwicklungsplan Strom 2037 mit Ausblick 2045,
    Version 2025*, 1. Entwurf, Dezember 2025,
    https://www.netzentwicklungsplan.de/sites/default/files/2025-12/NEP_2037_2045_V2025_1_Entwurf_0.pdf · Zugriff 2026-08-15
  - TransnetBW: *Übertragungsnetzbetreiber veröffentlichen zweiten Entwurf des
    Netzentwicklungsplans Strom 2037/2045 (2025)*, 01.03.2026,
    https://www.transnetbw.de/de/newsroom/pressemitteilungen/uebertragungsnetzbetreiber-veroeffentlichen-zweiten-entwurf-des-netzentwicklungsplans-strom · Zugriff 2026-08-15
  - Institut für Makroökonomie und Konjunkturforschung (IMK) der
    Hans-Böckler-Stiftung: *Gut 650 Milliarden Euro bis 2045: Studie berechnet
    Investitionsbedarf in deutsche Stromnetze*,
    https://www.imk-boeckler.de/de/pressemitteilungen-15992-studie-berechnet-investitionsbedarf-in-deutsche-stromnetze-65371.htm · Zugriff 2026-08-15

**Achtung, häufiger Fehler in der Debatte:** Netzkosten fallen **nicht nur bei
hohem EE-Anteil** an. Ein Teil ist Ersatzinvestition in ein alterndes Netz und
Folge der Elektrifizierung von Wärme und Verkehr — unabhängig vom Erzeugungsmix.
Die GES-Studie (siehe `docs/01_grundlage_ges_faktencheck.md`) skaliert Netzkosten
linear mit dem fEE-Ausbaugrad; das überschätzt den EE-spezifischen Anteil
tendenziell. Im eigenen Modell sollte zwischen **Sowieso-Kosten** und
**EE-induzierten Zusatzkosten** unterschieden werden.

---

## 5. Abhängigkeits- und Lieferkettenrisiken

### 5.1 Photovoltaik: China-Anteil in der Lieferkette

| Stufe | China-Anteil | Stufe |
|---|---:|---|
| alle Fertigungsstufen zusammen (Polysilizium, Ingots, Wafer, Zellen, Module) | **> 80 %** (2024) | `[A]` |
| Polysilizium und Wafer (Ausblick auf Basis im Bau befindlicher Kapazität) | **> 95 %** | `[A]` |
| Wafer (2023) | **98 %** der Weltproduktion (668,3 GW) | `[B]` |
| globale Fertigungskapazität 2023–2026 | **> 80 %** | `[B]` |

- Quellen:
  - IEA (2022): *Special Report on Solar PV Global Supply Chains*, International
    Energy Agency, https://www.iea.org/reports/solar-pv-global-supply-chains/executive-summary ·
    PDF: https://iea.blob.core.windows.net/assets/2d18437f-211d-4504-beeb-570c4d139e25/SpecialReportonSolarPVGlobalSupplyChains.pdf · Zugriff 2026-08-15
  - IEA: *China's share in global PV manufacturing capacity, 2024 and 2030*,
    https://www.iea.org/data-and-statistics/charts/china-s-share-in-global-pv-manufacturing-capacity-2024-and-2030 · Zugriff 2026-08-15
  - Wood Mackenzie: *China to hold over 80% of global solar manufacturing capacity
    from 2023–26*, https://www.woodmac.com/press-releases/china-dominance-on-global-solar-supply-chain/ · Zugriff 2026-08-15
  - Renewable Energy Institute: *Progress in Diversifying the Global Solar PV Supply
    Chain*, Dezember 2024, https://www.renewable-ei.org/pdfdownload/activities/REI_SolarPVsupplychain2024_en.pdf · Zugriff 2026-08-15

**Einordnung für beide Seiten:** Das ist die höchste Konzentration in der gesamten
Energielieferkette — höher als OPEC beim Öl je war. Gegenargument der EE-Seite: PV
ist ein *Investitionsgut*, kein Brennstoff. Ein Lieferstopp trifft den **Zubau**,
nicht den **Betrieb** bestehender Anlagen; die einmal installierte Anlage läuft
25+ Jahre ohne weitere Importe. Bei Gas oder Uran trifft ein Lieferstopp dagegen
den laufenden Betrieb. Beide Punkte gehören ins White Paper.

### 5.2 Uran und Anreicherung

**Natururan-Lieferländer in die EU (2024):**

| Land | Anteil an Bestellungen 2024 | Stufe |
|---|---:|---|
| Kanada | **33 %** | `[A]` |
| Kasachstan | **24 %** | `[A]` |
| Russland | **15 %** | `[A]` |
| Australien | **10 %** | `[A]` |
| *Summe Top 4* | *84 %* | `[A]` |
| Kanada + Russland + Kasachstan + Niger zusammen | **> 91 %** der gelieferten Menge | `[B]` |

**Anreicherung (der eigentliche Engpass):**

| Größe | Wert | Stufe |
|---|---:|---|
| EU-Abhängigkeit von russischer Anreicherung 2024 | **23 %** | `[A]` |
| dieselbe 2023 | **38 %** | `[A]` |
| EU-Eigenversorgung Anreicherung | **> 60 %** | `[B]` |
| Russlands Anteil an globaler Anreicherungskapazität (2022) | **44 %** | `[B]` |
| Rosatom/TENEX + CNNC zusammen an globaler SWU-Kapazität (2024) | **> 62 %** | `[B]` |

- Quellen:
  - Euratom Supply Agency (2025): *Annual Report 2024*, Europäische Kommission,
    https://euratom-supply.ec.europa.eu/document/download/4991f977-5fa7-415e-8b7f-04714f01c533_en?filename=202509773_PDFA2A_MJ0125120ENA_002.pdf ·
    Publications Office: https://op.europa.eu/en/publication-detail/-/publication/9f9b49e7-a7ec-11f0-a7c5-01aa75ed71a1/language-en · Zugriff 2026-08-15
  - World Nuclear News: *US, EU bodies report on nuclear fuel market situation*,
    https://www.world-nuclear-news.org/articles/us-eu-bodies-report-on-nuclear-fuel-market-situation · Zugriff 2026-08-15
  - Nuclear Engineering International: *ESA report highlights EU fuel challenges*,
    https://www.neimagazine.com/news/esa-report-highlights-eu-fuel-challenges/ · Zugriff 2026-08-15
  - RUSI (Darya Dolzikova): *Power Plays — Developments in Russian Enriched Uranium
    Trade*, https://static.rusi.org/SR-power-plays-web-final.pdf · Zugriff 2026-08-15
  - Schweizerische Energie-Stiftung (2024): *Rosatom und die Schweiz — Abhängigkeit
    von russischem Uran*, August 2024, https://energiestiftung.ch/files/energiestiftung/Studien/2024_Rosatom_und_die_Schweiz/Rosatom_und_die_Schweiz_Abh%C3%A4ngigkeit_SES_August_2024.pdf · Zugriff 2026-08-15 *(Anti-Atom-Stiftung — Interessenlage beachten)*
  - Umweltbundesamt Österreich: *Analyse der Rosatom-Aktivitäten*, Report 0814,
    https://www.umweltbundesamt.at/fileadmin/site/publikationen/rep0814.pdf · Zugriff 2026-08-15

**Fair gegen beide Seiten:** Die russische Abhängigkeit bei der Anreicherung ist
2024 deutlich gesunken (38 % → 23 %) — das Argument „Kernkraft macht abhängig von
Russland" verliert an Kraft, wenn Diversifizierung tatsächlich gelingt (Urenco,
Orano bauen aus). Umgekehrt bleibt: Russland kontrolliert weiterhin einen
erheblichen Teil der *globalen* Kapazität, und Kasachstan (24 % Natururan) liegt
logistisch teilweise in russischem Transitgebiet. Deutschland betreibt zudem keine
Kernkraftwerke mehr; für ein Wiedereinstiegsszenario wäre die Abhängigkeit neu
aufzubauen.

### 5.3 Gas-Importstruktur nach 2022

| Größe | Wert 2025 | Stufe |
|---|---:|---|
| Gesamtimporte | **1.031 TWh** (2024: 864 TWh, **+19 %**) | `[B]` |
| Norwegen | **44 %** | `[B]` |
| Niederlande | **24 %** | `[B]` |
| Belgien | **21 %** | `[B]` |
| direkte LNG-Terminals DE (Wilhelmshaven, Brunsbüttel, Lubmin, Mukran) | **106 TWh = 10,3 %** | `[B]` |
| Russland (Pipeline) | 0 seit Ende August 2022 (Nord Stream 1 gestoppt) | `[A]` |

- Quellen:
  - Bundesnetzagentur: *Bundesnetzagentur veröffentlicht Zahlen zur Gasversorgung
    2025*, Pressemitteilung 09.01.2026,
    https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2026/20260109_JahresRueckblickGAS.html · Zugriff 2026-08-15
  - SMARD: *Gasversorgung im Jahr 2025 / The gas market in 2025*,
    https://www.smard.de/page/en/topic-article/5892/219670/the-gas-market-in-2025 · Zugriff 2026-08-15
  - IWR: *Deutschland steigert Gasimporte 2025 um 19 Prozent*,
    https://www.iwr.de/news/deutschland-steigert-gasimporte-2025-um-19-prozent-gasspeicherstaende-deutlich-unter-vorjahresniveau-versorgungslage-stabil-news39482 · Zugriff 2026-08-15

**Wichtige Einschränkung, die oft fehlt:** Ein großer Teil der Importe aus den
Niederlanden und Belgien ist **regasifiziertes LNG**, das über die dortigen
Terminals kommt. Die scheinbare Diversifizierung nach Herkunftsland überzeichnet
also die tatsächliche Diversifizierung nach Herkunftsquelle. Der überwiegende Teil
des LNG stammt aus den USA. `[C]`

> **Datenlücke 4:** Der tatsächliche Anteil russischen LNG (über Drittländer bzw.
> direkt) an den deutschen Gasimporten 2025 konnte nicht ermittelt werden. Für
> ein Kapitel über Abhängigkeitsrisiken wäre das eine wichtige Zahl.

### 5.4 Kritische Rohstoffe für Batterien und Windkraft

| Rohstoff / Stufe | Konzentration | Stufe |
|---|---|---|
| Raffination Kupfer, Lithium, Nickel, Kobalt, Graphit, Seltene Erden — Anteil der Top-3-Länder | **86 % (2024)**, gegenüber ~82 % (2020) — **steigend** | `[A]` |
| Graphit-Raffination (China) | **> 90 %** | `[A]` |
| Seltene Erden Raffination (China) | **> 90 %** | `[A]` |
| Lithium-Verarbeitung (China) | **~ 60 %** | `[A]` |
| Kobalt-Verarbeitung (China) | **~ 60 %** | `[A]` |
| Ausblick 2035 (China) | > 60 % raffiniertes Lithium und Kobalt; ~ 80 % batteriefähiger Graphit und Seltene Erden | `[B]` |
| Nachfragewachstum 2024 | Lithium **+30 %**; Nickel, Kobalt, Graphit, Seltene Erden **+6 bis +8 %** | `[A]` |

- Quellen:
  - IEA (2025): *Global Critical Minerals Outlook 2025*, International Energy
    Agency, Mai 2025, https://www.iea.org/reports/global-critical-minerals-outlook-2025 ·
    Executive Summary: https://www.iea.org/reports/global-critical-minerals-outlook-2025/executive-summary · Zugriff 2026-08-15
  - IEA: *With new export controls on critical minerals, supply concentration risks
    become reality*, Kommentar, https://www.iea.org/commentaries/with-new-export-controls-on-critical-minerals-supply-concentration-risks-become-reality · Zugriff 2026-08-15
  - Mercom: *China's Dominance in Critical Minerals Supply and Refining Continues:
    IEA*, https://www.mercomindia.com/chinas-dominance-in-critical-minerals-supply-and-refining-continues-iea · Zugriff 2026-08-15

**Kernbefund und seine ehrliche Interpretation:** Die Konzentration steigt, sie
sinkt nicht. Der Engpass liegt fast überall bei der **Raffination**, nicht beim
Bergbau — das ist eine Kapital- und Umweltauflagen-Frage, keine geologische.
Deshalb ist die Abhängigkeit prinzipiell reversibel, aber nur auf einer Zeitskala
von 5–15 Jahren und mit erheblichen Zusatzkosten. Für Permanentmagnete in
Offshore-Windturbinen (Neodym, Dysprosium) und für LFP/NMC-Batterien ist das der
kritischste Punkt.

> **Datenlücke 5:** Belastbare Zahlen zum spezifischen Rohstoffbedarf pro GW
> Windkraft bzw. pro GWh Batteriespeicher (t Neodym/GW, t Lithium/GWh) wurden in
> dieser Recherche nicht ermittelt. Für eine quantitative Risikobewertung im Modell
> wären sie nötig — Quelle wäre die IEA *Role of Critical Minerals in Clean Energy
> Transitions* oder das JRC-Rohstoffmonitoring der EU.

---

## 6. Kernkraft-spezifische Restrisiken

Dieser Abschnitt ist bewusst nüchtern und beidseitig gehalten.

### 6.1 Endlagerung — weltweiter Status 2026

| Land | Projekt | Status (Stand 2026) | Stufe |
|---|---|---|---|
| **Finnland** | **Onkalo** (Olkiluoto), Posiva | Weltweit **erstes** geologisches Tiefenlager für abgebrannte Brennelemente. Anlage fertiggestellt; **Probebetrieb mit Testbehältern seit September 2024**; großer Systemtestlauf läuft über mehrere Monate. **Endgültige Betriebsgenehmigung der Aufsichtsbehörde STUK stand zum Recherchezeitpunkt noch aus.** Reguläre Inbetriebnahme für 2026 vorgesehen — möglich, dass Finnland Ende 2026 das erste Endlager in Betrieb nimmt. | `[A]` |
| **Schweden** | Forsmark, SKB | Konzept analog Finnland (Kupferkanister im Granit). Bau bzw. abschließende Genehmigungsschritte laufen. | `[B]` |
| **Frankreich** | **Cigéo**, Bure (Lothringen), Andra | Tonstein, ca. 500 m Tiefe. Öffentliches Stellungnahmeverfahren (*enquête publique*) lief **bis 16. Juli 2026**; danach Regierungsentscheid per Dekret. **Erste Einlagerungen voraussichtlich nicht vor 2050.** Projekt wird teurer und dauert länger als geplant. | `[A]` |
| **USA** | (Yucca Mountain gestoppt) | **Kein nationales Endlager.** Ziviler hochradioaktiver Abfall lagert dezentral in Zwischenlagern, überwiegend an den Kraftwerksstandorten. | `[A]` |
| **Deutschland** | Standortauswahlverfahren (StandAG), BGE/BASE | Kein Standort. Standortentscheidung nach aktuellen Schätzungen **2046 bis 2074**; BGE nennt in einem Szenario Mitte/Ende der 2060er. | `[B]` |

- Quellen:
  - Bundesamt für die Sicherheit der nuklearen Entsorgung (BASE): *Endlager in
    Finnland*, https://www.base.bund.de/de/endlager/endlager-ausland/finnland/finnland-endlager.html · Zugriff 2026-08-15
  - BASE: *Endlagersuche in Frankreich* und Meldung *Öffentliches
    Stellungnahmeverfahren läuft* (2026),
    https://www.base.bund.de/de/endlager/endlager-ausland/frankreich/frankreich-endlagersuche.html ·
    https://www.base.bund.de/shareddocs/kurzmeldungen/de/2026/endlagersuche-frankreich-2026.html · Zugriff 2026-08-15
  - BASE: *Endlagersuche* / *Finanzierung Endlagersuche*,
    https://www.base.bund.de/de/endlager/endlagersuche/endlagersuche_inhalt.html ·
    https://www.base.bund.de/de/endlager/endlagersuche/finanzierung/finanzierung-endlagersuche.html · Zugriff 2026-08-15
  - Nuklearforum Schweiz: *Finnland: Testlauf im Endlager für hochaktive Abfälle hat
    begonnen*, https://www.nuklearforum.ch/de/news/finnland-testlauf-im-endlager-fuer-hochaktive-abfaelle-hat-begonnen/ · Zugriff 2026-08-15 *(nuklearfreundlicher Verband — Interessenlage beachten)*
  - Euronews: *In Finland, the world's first facility to bury nuclear waste is set to
    begin operations*, 09.04.2026, https://www.euronews.com/2026/04/09/in-finland-the-worlds-first-facility-to-bury-nuclear-waste-is-set-to-begin-operations · Zugriff 2026-08-15
  - GRS: *Endlagerung hochradioaktiver Abfälle weltweit*, https://www.grs.de/en/news/knowledge-dossier/disposal-high-level-radioactive-waste-worldwide · Zugriff 2026-08-15
  - atommuellreport.de: *Bure: Französisches Endlagerprojekt wird teurer und dauert
    länger*, https://www.atommuellreport.de/themen/endlagerung-international/bure-franzoesisches-endlagerprojekt-wird-teurer-und-dauert-laenger.html · Zugriff 2026-08-15 *(kernkraftkritisches Portal — Interessenlage beachten)*

**Beide Seiten, sauber getrennt:**

- *Pro-Kernkraft-Position:* Onkalo beweist, dass geologische Endlagerung technisch
  und regulatorisch lösbar ist. Das jahrzehntelange Argument „es gibt weltweit kein
  Endlager" wird 2026 empirisch überholt.
- *Kernkraftkritische Position:* Ein einziges in Betrieb gehendes Endlager nach
  70 Jahren zivilem Kernkraftbetrieb, für ein Land mit fünf Reaktoren, in
  außergewöhnlich günstiger Geologie. Frankreich (57 Reaktoren) frühestens 2050,
  USA gar nicht, Deutschland Standortentscheidung frühestens 2046. Die
  Verallgemeinerbarkeit des finnischen Erfolgs ist nicht belegt.

Beide Aussagen sind faktisch korrekt. Das White Paper sollte beide zitieren.

### 6.2 KENFO — Fonds und Deckungsdiskussion

**Fakten zum Fonds:**

| Größe | Wert | Stufe |
|---|---:|---|
| Einzahlung der Betreiber (Juli 2017) | **24,1 Mrd. €** | `[A]` |
| Anlagevermögen (aktuell) | **~ 28 Mrd. €** | `[B]` |
| Wertentwicklung 2025 (nach Kosten) | **+6,2 %** | `[A]` |
| Zielrendite 2025 | 3,95 % (≈ 4,0 %) — um 2,2 Pp. übertroffen | `[A]` |
| Rendite seit Auflage (kapitalgewichtet, ROI) | 4,8 % p. a. | `[B]` |
| Rendite letzte 5 Jahre | 4,6 % p. a. | `[B]` |
| Erstattungen an den Bund seit 2017 | **5,3 Mrd. €** | `[B]` |
| Erstattung 2025 | 823 Mio. € | `[B]` |

- Quellen:
  - KENFO — Fonds zur Finanzierung der kerntechnischen Entsorgung, https://www.kenfo.de/ ·
    Pressebereich: https://www.kenfo.de/en/press-media/press-information-speeches · Zugriff 2026-08-15
  - e-fundresearch: *KENFO mit +6,2 % in 2025*, https://e-fundresearch.com/markets/artikel/59991-kenfo-mit-62-in-2025-wie-die-rendite-von-deutschlands-groesstem-staatsfonds-zustande-kam · Zugriff 2026-08-15
  - Börsen-Zeitung: *Kenfo liefert mehr Rendite als nötig*, https://www.boersen-zeitung.de/banken-finanzen/kenfo-liefert-mehr-rendite-als-noetig · Zugriff 2026-08-15
  - Wikipedia: *Fonds zur Finanzierung der kerntechnischen Entsorgung*, https://de.wikipedia.org/wiki/Fonds_zur_Finanzierung_der_kerntechnischen_Entsorgung · Zugriff 2026-08-15

**Die Deckungsdiskussion — beide Positionen:**

*Position „Deckung ausreichend / Fonds funktioniert":*
Die Zielrendite von ~4 % wurde 2025 deutlich übertroffen (+6,2 %), seit Auflage
4,8 % p. a. Der Fonds hat den Bundeshaushalt bereits um 5,3 Mrd. € entlastet. Die
Konstruktion (Einmalzahlung mit Haftungsfreistellung gegen Renditerisiko beim
Bund) war eine bewusste politische Abwägung. `[A/B]`

*Position „Deckungslücke wahrscheinlich":*
Mit der Einzahlung von 24,1 Mrd. € ging die **vollständige Enthaftung der
Betreiber** einher — reicht das Geld nicht, zahlt der Steuerzahler. Ob die Summe
ausreicht, ist **bereits heute unklar**, und die immer weiter nach hinten
rutschenden Zeitpläne (Standortentscheidung 2046–2074 statt ursprünglich 2031)
verschärfen das Problem, weil Betriebs-, Zwischenlager- und Verwaltungskosten über
einen viel längeren Zeitraum anfallen. `[B]`

- Quelle für die kritische Position: BASE, *Finanzierung Endlagersuche* (amtlich,
  benennt die Steuerzahler-Auffanghaftung explizit); BUND: *Atommüll-Endlager: So
  läuft die Suche*, https://www.bund.net/atomkraft/atommuell/atommuell-endlager-so-laeuft-die-suche/ ·
  Zugriff 2026-08-15 *(Umweltverband — Interessenlage beachten)*
- Bundesrechnungshof (2024): Bericht zur Öffentlichkeitsbeteiligung bei der
  Endlagersuche, https://www.bundesrechnungshof.de/SharedDocs/Downloads/DE/Berichte/2024/oeffentlichkeitsbeteiligung-endlager-volltext.pdf · Zugriff 2026-08-15

> **Datenlücke 6 (wichtig):** Eine **aktuelle amtliche Gesamtkostenschätzung** für
> Standortsuche, Bau und Betrieb des deutschen Endlagers (inkl. Zwischenlagerung
> bis zur Einlagerung) konnte nicht ermittelt werden. Ohne diese Zahl lässt sich
> die Frage „reichen die 24/28 Mrd. €?" nicht seriös quantifizieren. Das White
> Paper sollte das **so sagen** statt eine Zahl zu erfinden. Anfrage an BASE/BGE
> oder Auswertung der BGE-Kostenschätzungen wäre der nächste Schritt.

### 6.3 Ewigkeitskosten und Haftung

**Haftungsrahmen Deutschland:**

| Größe | Wert | Stufe |
|---|---:|---|
| Haftpflichtversicherung je Anlage | **255,645 Mio. €** | `[B]` |
| darüber hinaus: Solidarvereinbarung der Muttergesellschaften | bis **2,5 Mrd. €** | `[A]` |
| oberhalb 2,5 Mrd. € | Staat übernimmt Ersatzansprüche (§ 34 AtG) | `[B]` |
| Betreiberhaftung dem Grunde nach | in DE, CH, JP u. a. **unbegrenzt** — aber ohne Deckungsvorsorge faktisch begrenzt durch Insolvenzfähigkeit | `[B]` |
| Laufzeit der Solidarvereinbarung | verlängert bis längstens 31.12.2029 | `[C]` |

- Quellen:
  - Deutscher Bundestag, Wissenschaftliche Dienste: *Die Versicherungspflicht von
    Atomkraftwerken*, WD 3 – 330/10, https://www.bundestag.de/resource/blob/412752/5782d652a8e25945c65d84744d314b88/WD-3-330-10-pdf.pdf · Zugriff 2026-08-15
  - atommuellreport.de: *Haftung und Deckungsvorsorge*, https://www.atommuellreport.de/themen/detail/haftung-und-deckungsvorsorge.html · Zugriff 2026-08-15 *(kernkraftkritisch)*
  - Kerntechnische Gesellschaft e. V.: *Haftung und Versicherung von
    Kernkraftwerken*, https://ktg.org/en/haftung-und-versicherung-von-kernkraftwerken · Zugriff 2026-08-15 *(Fachverband der Nuklearbranche)*
  - Nuklearia e. V.: *Widerlegt: Deutschlands bekannteste Studie zur
    Versicherbarkeit von Kernkraftwerken*, 30.04.2022, https://nuklearia.de/2022/04/30/widerlegt-deutschlands-bekannteste-studie-zur-versicherbarkeit-von-kernkraftwerken/ · Zugriff 2026-08-15 *(Pro-Kernkraft-Verein)*

**Der Streit, fair dargestellt:**

*Kritische Position:* Bei einem auslegungsüberschreitenden Unfall wären Schäden in
der Größenordnung von **Hunderten Milliarden bis mehreren Billionen Euro** zu
erwarten — Größenordnungen, die die gesetzliche Deckungsvorsorge um den Faktor
1.000 übersteigen. Die Haftungsbegrenzung sei damit die größte implizite
Subvention der Kernkraft, weil ein voll versichertes KKW deutlich höhere
Stromgestehungskosten hätte. `[B]`

*Gegenposition:* Die zugrunde liegenden Schadensschätzungen (u. a. die vielzitierte
Versicherungsforen-Leipzig-Studie 2011) beruhen auf Annahmen zu Eintritts­wahr­
schein­lich­keit und Schadenshöhe, die von Kernkraftbefürwortern methodisch
bestritten werden; außerdem existiere in Deutschland formal **unbegrenzte
Betreiberhaftung**, sodass die 2,5 Mrd. € nur die *Deckungsvorsorge*, nicht die
Haftungsgrenze seien. `[B]`

**Neutrale Feststellung, die beide akzeptieren müssten:** Der ökonomische Effekt
der Haftungsbegrenzung ist real und quantitativ strittig. Er taucht in **keinem**
der gängigen LCOE-Vergleiche auf — auch nicht in der GES-Studie. Für das
Simulationsmodell heißt das: Als **optionaler Risikoaufschlag** modellieren, mit
weiter Spanne und explizitem Hinweis auf die Umstrittenheit, nicht als Fixwert.

> **Datenlücke 7:** Eine belastbare, methodisch anerkannte Quantifizierung des
> Versicherungs-Schattenpreises je MWh Kernkraftstrom wurde nicht gefunden. Die in
> der Literatur kursierenden Werte reichen um mehrere Größenordnungen auseinander
> (Cent- bis Euro-Bereich pro kWh) und hängen vollständig von der unterstellten
> Eintrittswahrscheinlichkeit ab. Diese Lücke ist im White Paper offen zu benennen.

**Zum Begriff „Ewigkeitskosten":** Der Begriff stammt aus dem Steinkohlenbergbau
(dauerhafte Grubenwasserhaltung, finanziert über die RAG-Stiftung) und wird auf die
Kernkraft übertragen. Analogie und Grenzen der Analogie sollten im White Paper
kurz erklärt werden: Bei der Kernkraft ist der **Nachsorgeaufwand nach
Endlagerverschluss** konzeptionell gerade **null** (passive Sicherheit über
geologische Barrieren) — das ist der ganze Sinn eines Tiefenlagers. Die realen
Kosten fallen davor an (Rückbau, Zwischenlagerung, Konditionierung, Bau des
Endlagers) und sind endlich, aber schlecht prognostizierbar. Wer „Ewigkeitskosten"
sagt, meint faktisch meist „sehr lange laufende, heute schlecht bezifferbare
Kosten" — das ist etwas anderes als unendliche Kosten.

---

## 7. Kostenüberschreitungsrisiko nach Technologie

Das ist der methodisch sauberste und für das Kostenmodell direkt verwertbare
Risikoblock — weil er auf großen empirischen Stichproben beruht, nicht auf
Szenarioannahmen.

### 7.1 Flyvbjerg-Datenbank (Oxford)

Mittlere Kostenüberschreitung gegenüber der Entscheidungsgrundlage
(*decision-to-build estimate*), nach Projekttyp:

| Projekttyp | Mittlere Kostenüberschreitung | Stufe |
|---|---:|---|
| **Nukleare Lagerung / Endlagerung** | **+238 %** | `[A]` |
| **Kernkraftwerke** | **+120 %** | `[A]` |
| Wasserkraft (Staudämme) | **+75 %** | `[A]` |
| Schienenprojekte | +39–45 % | `[B]` |
| Feste Querungen (Brücken/Tunnel) | +34 % | `[B]` |
| Straßen | +20–24 % | `[B]` |
| **Fossil-thermische Kraftwerke** | **+16 %** | `[A]` |
| **Windkraft** | **+13 %** | `[A]` |
| **Stromübertragungsleitungen** | **+8 %** | `[A]` |
| **Solarkraft** | **+1 %** | `[A]` |

- Datenbasis: **~16.000 Projekte in 136 Ländern** über mehrere Jahrzehnte;
  „Megaprojekt" = Budget ≥ 1 Mrd. USD. `[A]`
- Nur **0,5 %** der Projekte werden gleichzeitig im Budget, im Zeitplan und mit dem
  versprochenen Nutzen geliefert. `[B]`

- Quellen:
  - Bent Flyvbjerg / Dan Gardner (2023): *How Big Things Get Done*, Currency/Penguin.
  - Fast Company: *Why massive wind and solar projects will succeed where nuclear has
    failed* (Buchauszug/Tabelle), https://www.fastcompany.com/90844859/why-massive-wind-and-solar-projects-will-succeed-where-nuclear-has-failed · Zugriff 2026-08-15
  - BudgetOverrun.com: *Flyvbjerg Project Database: Only 0.5% of Projects Deliver in
    Full*, https://budgetoverrun.com/studies/flyvbjerg-megaproject-database · Zugriff 2026-08-15
  - Budzier, Flyvbjerg, Garavaglia, Leed: *Quantitative Cost and Schedule Risk
    Analysis of Nuclear Waste Storage*, SSRN, https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3303410 ·
    arXiv-Fassung: https://arxiv.org/pdf/1901.11123 · Zugriff 2026-08-15
  - Flyvbjerg: *Cost Overruns and Demand Shortfalls in Urban Rail and Other
    Infrastructure*, arXiv, https://arxiv.org/pdf/1303.7402 · Zugriff 2026-08-15

### 7.2 Sovacool & Ryu 2025 — unabhängige Bestätigung

| Technologie | Mittlere Kostenüberschreitung | Mittlere Zeitüberschreitung | Stufe |
|---|---:|---:|---|
| Kernkraft | **+102,5 %** | **+64 %** | `[A]` |
| Wasserkraft | +36,7 % | — | `[B]` |
| Geothermie | +20,7 % | +58,8 % | `[B]` |
| Fossil-thermisch | +9,7 % | — | `[B]` |
| Solar | nahe Baseline | nahe Baseline | `[B]` |

- Datenbasis: **662 Energieprojekte in 83 Ländern**, Baujahre **1936–2024**. `[A]`
- Zusätzlicher Befund: Strukturbrüche bei **1.280 MW** und **1.561 MW** Blockgröße
  — oberhalb 1.561 MW steigen die Kostenüberschreitungen überproportional
  („Diseconomies of Scale"). `[B]`

- Quellen:
  - Benjamin K. Sovacool, Hanee Ryu (2025): *Beyond economies of scale: Learning
    from construction cost overrun risks and time delays in global energy
    infrastructure projects*, **Energy Research & Social Science**, März 2025,
    https://www.sciencedirect.com/science/article/pii/S2214629625001380 · Zugriff 2026-08-15
  - Boston University, Institute for Global Sustainability: *Investment Risk for
    Energy Infrastructure Construction Is Highest for Nuclear Power Plants, Lowest
    for Solar*, 19.05.2025, https://www.bu.edu/igs/2025/05/19/investment-risk-for-energy-infrastructure-construction-is-highest-for-nuclear-power-plants-lowest-for-solar/ · Zugriff 2026-08-15
  - Sovacool et al.: *Construction Cost Overruns and Electricity Infrastructure: An
    Unavoidable Risk?*, The Electricity Journal, https://www.sciencedirect.com/science/article/abs/pii/S1040619014000761 · Zugriff 2026-08-15
  - *Sources of Cost Overrun in Nuclear Power Plant Construction Call for a New
    Approach to Engineering Design*, Joule, https://www.sciencedirect.com/science/article/pii/S254243512030458X · Zugriff 2026-08-15

### 7.3 Interpretation — beide Seiten

Zwei unabhängige Datensätze mit unterschiedlicher Methodik kommen zum gleichen
Ranking: **Kernkraft ganz oben (+100 bis +120 %), Solar ganz unten (+0 bis +1 %),
Wind niedrig (+13 %)**. Die erklärende Hypothese beider Autorengruppen ist
**Modularität**: PV- und Windprojekte bestehen aus tausenden identischen,
seriengefertigten Einheiten mit steiler Lernkurve; ein Kernkraftwerk ist ein
weitgehend einzigartiges Bauwerk mit hohem Anteil vor Ort gefertigter, individuell
genehmigter Komponenten.

*Faires Gegenargument der Kernkraftseite:* Die Datenbasis wird von westlichen
Projekten nach 1980 dominiert (Vogtle, Flamanville, Hinkley Point C — alle mit
Erstbau-Effekten neuer Reaktordesigns nach jahrzehntelanger Baupause). Serienbau
in Südkorea (APR1400) oder China zeigt deutlich geringere Überschreitungen. Die
GES-Faktencheck-Grundlage in `docs/01_grundlage_ges_faktencheck.md` zeigt diese
Spreizung sehr deutlich: 2.116 €/kW (Korea) bis 17.250 €/kW (Hinkley Point C).
Ob Serienbau in Europa reproduzierbar wäre, ist eine offene, nicht empirisch
entschiedene Frage. Das SMR-Argument („Modularität auch für Kernkraft") ist
plausibel, aber mangels gebauter Serie noch nicht empirisch belegt.

**Empfehlung für das Modell:** Kostenüberschreitungen als **eigenen Slider**
(„Realismus-Aufschlag") umsetzen, mit den empirischen Werten als Voreinstellung
und der Möglichkeit, sie auf null zu setzen. So kann der Nutzer selbst sehen, wie
stark das Ergebnis davon abhängt — genau das ist die didaktische Pointe des
gesamten White Papers.

---

## 8. Zusammenfassung der Datenlücken

| Nr. | Lücke | Kritikalität | Nächster Schritt |
|---|---|---|---|
| 1 | Geschlossene EUA-Preiszeitreihe 2020–2026 + Tagespreis 2026-08-15 | **hoch** | EEX/Sandbag/EEA als CSV nach `data/raw/` ziehen |
| 2 | Keine belastbare ETS-1-Projektion für 2040 (Ziel regulatorisch offen) | mittel | als Szenario deklarieren, nicht als Prognose |
| 3 | Speicherbedarf 2045: Spanne 180–600 GWh, Treiber der Spanne unklar | **hoch** | Fraunhofer-ISE-Studien im Original vergleichen |
| 4 | Anteil russischen LNG an dt. Gasimporten 2025 | mittel | BNetzA-Gasjahresrückblick / Bruegel-Tracker |
| 5 | Rohstoffbedarf pro GW Wind / GWh Batterie (t Nd, t Li) | mittel | IEA *Critical Minerals*, JRC-Rohstoffmonitoring |
| 6 | Amtliche Gesamtkostenschätzung deutsches Endlager | **hoch** | BASE/BGE-Kostenschätzungen |
| 7 | Versicherungs-Schattenpreis Kernkraft je MWh | mittel | offen benennen, Spanne zeigen |
| 8 | Aktuellere harmonisierte LCA als UNECE 2022 | niedrig | IPCC AR7 abwarten / Literaturreview |
| 9 | **Alle Werte nur aus Suchergebnissen, nicht aus Primärdokumenten** | **hoch** | Stufe-B/C-Werte am Original prüfen (siehe Abschnitt 0) |

---

## 9. Maschinenlesbarer Datenblock für das Simulationsmodell

```json
{
  "meta": {
    "titel": "Risiken & CO2-Bepreisung — Parameter fuer das Strommix-Simulationsmodell",
    "erstellt": "2026-08-15",
    "zugriffsdatum_quellen": "2026-08-15",
    "einheiten": {
      "co2_preis": "EUR/t CO2-Aeq",
      "co2_intensitaet": "g CO2-Aeq/kWh",
      "leistung": "GW",
      "energie": "TWh bzw. GWh",
      "kosten": "Mrd. EUR"
    },
    "verifikationshinweis": "Alle Werte stammen aus Websuche-Ergebnissen; direkter PDF-Abruf war durch Netzwerk-Proxy blockiert. Werte der Stufe B/C vor Veroeffentlichung am Primaerdokument pruefen.",
    "warnung": "Keine Anlage- oder Rechtsberatung. Bandbreiten sind Modellparameter, keine Prognosen."
  },

  "co2_preis_szenarien": {
    "slider": {
      "min": 0,
      "max": 400,
      "schritt": 5,
      "default": 75,
      "einheit": "EUR/t CO2",
      "label": "CO2-Preis im Stromsektor (EU-ETS 1)"
    },
    "stuetzpunkte": [
      { "wert": 0,   "label": "Kein CO2-Preis",                    "typ": "referenz",     "quelle": "Modellreferenzfall",                    "stufe": null },
      { "wert": 25,  "label": "Niveau ~2019/2020",                 "typ": "historisch",   "quelle": "EEX/Sandbag Preisverlauf",              "stufe": "C" },
      { "wert": 56,  "label": "Feb 2024",                          "typ": "historisch",   "quelle": "Statista EU-ETS",                       "stufe": "B" },
      { "wert": 75,  "label": "Marktpreis Stand Mai 2026 (Default)","typ": "ist",         "quelle": "Statista / Marktberichte 2026",         "stufe": "C" },
      { "wert": 82,  "label": "Nov 2025",                          "typ": "historisch",   "quelle": "Statista EU-ETS",                       "stufe": "B" },
      { "wert": 100, "label": "Allzeithoch Feb 2023 (100,34)",     "typ": "historisch",   "quelle": "mehrfach bestaetigt",                   "stufe": "A" },
      { "wert": 126, "label": "Analystenkonsens 2030 (Median)",    "typ": "projektion",   "quelle": "GMK Center, Median aus 7 Haeusern",     "stufe": "B" },
      { "wert": 147, "label": "BNEF Base Case 2030",               "typ": "projektion",   "quelle": "BloombergNEF",                          "stufe": "B" },
      { "wert": 205, "label": "EWI ETS2-Pfad 2035 (Sektorkopplung)","typ": "projektion",  "quelle": "EWI Endbericht 04/2025",                "stufe": "B" },
      { "wert": 350, "label": "UBA Klimafolgekosten (1 % Diskont)", "typ": "schattenpreis","quelle": "UBA Methodenkonvention 3.2",           "stufe": "B" },
      { "wert": 400, "label": "Slider-Maximum",                    "typ": "grenze",       "quelle": "Modellsetzung",                         "stufe": null }
    ],
    "ausserhalb_slider": [
      { "wert": 990,  "label": "UBA Klimakostensatz MK 4.0 (Zentralwert)", "quelle": "UBA Handbuch Umweltkosten, MK 4.0, 02/2026, Modell GIVE", "stufe": "B", "hinweis": "Separater Umschalter 'Klimafolgekosten statt Marktpreis'" },
      { "wert": 1000, "label": "UBA MK 3.2, 0 % Zeitpraeferenz",           "quelle": "UBA Methodological Convention 3.2",                       "stufe": "B", "hinweis": "Ethische Setzung: Gleichgewichtung der Generationen" },
      { "wert": 500,  "label": "Enerdata: EU-ETS 2044 ohne MSR-Reform",    "quelle": "Enerdata Carbon Price Forecast 2030-2050",                "stufe": "C", "hinweis": "Extremszenario" }
    ],
    "ets1_historie": [
      { "jahr": 2023, "monat": 2,  "wert": 100.34, "typ": "allzeithoch", "stufe": "A" },
      { "jahr": 2024, "monat": 2,  "wert": 56.0,   "typ": "monatsende",  "stufe": "B" },
      { "jahr": 2025, "monat": 11, "wert": 81.9,   "typ": "spot",        "stufe": "B" },
      { "jahr": 2026, "monat": 4,  "wert": 69.99,  "typ": "spot",        "stufe": "C" },
      { "jahr": 2026, "monat": 5,  "wert": 74.0,   "typ": "monatsmittel","stufe": "C" }
    ],
    "ets2": {
      "start": 2028,
      "start_urspruenglich": 2027,
      "verschiebung_beschlossen": "2025-11-05 (Rat), 2025-11-13 (EP)",
      "preiskorrektur_schwelle_eur_t": 45,
      "preiskorrektur_basisjahr": 2020,
      "preiskorrektur_inflationsindexiert": true,
      "zusatzzertifikate_max_mio": 80,
      "zusatzzertifikate_vorher_mio": 40,
      "harter_preisdeckel": false,
      "betrifft_stromsektor": false,
      "preisprognosen_2030": { "min": 60, "median": 126, "max": 380, "stufe": "C" },
      "quellen": ["CLECAT 2025", "IRU 2025", "EWI 04/2025", "FES-Modellvergleich", "BloombergNEF"]
    }
  },

  "co2_intensitaet_g_pro_kwh": {
    "quelle_primaer": "UNECE (2022): Carbon Neutrality in the UNECE Region — Integrated Life-cycle Assessment of Electricity Sources",
    "systemgrenze": "Lebenszyklus (cradle to grave)",
    "technologien": {
      "kohle":                 { "min": 751, "max": 1095, "default": 900, "stufe": "A" },
      "kohle_ccs":             { "min": 147, "max": 469,  "default": 300, "stufe": "B" },
      "erdgas_gud":            { "min": 403, "max": 513,  "default": 450, "stufe": "A" },
      "erdgas_gud_ccs":        { "min": 49,  "max": 220,  "default": 120, "stufe": "B" },
      "kernkraft":             { "min": 5.1, "max": 6.4,  "default": 5.8, "stufe": "A" },
      "wasserkraft":           { "min": 6,   "max": 147,  "default": 20,  "stufe": "B" },
      "wind_onshore":          { "min": 7.8, "max": 16,   "default": 12,  "stufe": "A" },
      "wind_offshore":         { "min": 12,  "max": 23,   "default": 17,  "stufe": "A" },
      "pv_international":      { "min": 8.0, "max": 83,   "default": 45,  "stufe": "A" },
      "pv_deutschland":        { "min": 40,  "max": 56,   "default": 48,  "stufe": "C",
                                 "quelle": "Fraunhofer ISE (2025/26), Sekundaerberichterstattung",
                                 "hinweis": "Fuer DE-Modell diesen Wert verwenden, nicht die internationale Untergrenze" },
      "csp":                   { "min": 27,  "max": 122,  "default": 70,  "stufe": "B" }
    },
    "offene_punkte": [
      "UNECE-Daten von 2022 — Dekarbonisierung der chinesischen Modulfertigung seither nicht abgebildet",
      "Methanschlupf der Gasvorkette ist der groesste Unsicherheitstreiber bei Erdgas"
    ]
  },

  "dunkelflaute": {
    "definitionen": [
      { "id": "dwd",    "schwelle_prozent_nennleistung": 10, "min_dauer_h": 48, "quelle": "Deutscher Wetterdienst / LBBW", "stufe": "B" },
      { "id": "uniper", "schwelle_prozent_installierte_leistung": 10, "min_dauer_h": 10, "glaettung": "gleitender 6-h-Mittelwert", "quelle": "Uniper Kurzstudie 2026", "stufe": "A" }
    ],
    "datenbasis": "Zeitreihen Wind- und Solarerzeugung Deutschland 2016-2025",
    "haeufigkeit": [
      { "dauer_h": 10,  "anzahl_10_jahre": 1435, "mittlere_dauer_h": 12.9, "haeufigkeit_text": "oefter als alle 3 Tage", "quelle": "Uniper 2026", "stufe": "A" },
      { "dauer_h": 24,  "haeufigkeit_pro_jahr_min": 10, "haeufigkeit_pro_jahr_max": 12, "haeufigkeit_text": "etwa monatlich", "quelle": "Uniper 2026", "stufe": "B" },
      { "dauer_h": 48,  "haeufigkeit_pro_jahr_min": 2, "haeufigkeit_pro_jahr_max": 3, "quelle": "LBBW 2025 / Uniper 2026", "stufe": "A" },
      { "dauer_h": 72,  "haeufigkeit_pro_jahr_min": 2, "haeufigkeit_pro_jahr_max": 2, "quelle": "Uniper 2026", "stufe": "B" },
      { "dauer_h": 120, "wiederkehrperiode_jahre": 3.5, "quelle": "Uniper 2026", "stufe": "B" },
      { "dauer_h": 168, "wiederkehrperiode_jahre": 10,  "quelle": "LBBW 2025", "stufe": "B" }
    ],
    "extremwerte": {
      "laengstes_ereignis_tage_10j": 5.4,
      "quelle": "LBBW 2025",
      "stufe": "B"
    },
    "referenzereignis_dez_2024": {
      "datum": "2024-12-11 bis 2024-12-12",
      "zweites_ereignis": "2024-11-06",
      "day_ahead_spitze_eur_mwh_min": 900,
      "day_ahead_spitze_eur_mwh_max": 1000,
      "intraday_mittel_eur_mwh": 1000,
      "marktverfuegbare_kapazitaet_gw": { "min": 3.4, "max": 4.5 },
      "reserven_gw": { "min": 12, "max": 13 },
      "marktmissbrauch_festgestellt": false,
      "strukturelles_problem_festgestellt": true,
      "quelle": "Bundesnetzagentur und Bundeskartellamt, PM 21.10.2025",
      "stufe": "A"
    },
    "energiebedarf_48h_winter_twh": { "min": 3.5, "max": 4.0, "quelle": "LBBW 2025", "stufe": "B" },
    "batteriespeicher_grenze": {
      "zuverlaessig_ueberbrueckbar_bis_h": 10,
      "hinweis": "Ereignisse ueber 10 h koennen von Batteriespeichern nicht zuverlaessig ueberbrueckt werden (Speichertiefe)",
      "quelle": "Uniper Kurzstudie 2026",
      "stufe": "A"
    }
  },

  "versorgungssicherheit": {
    "gesicherte_leistung_zusatzbedarf_gw": {
      "2030": { "min": 17,   "max": 21,   "stufe": "B" },
      "2035_zielszenario":       { "wert": 22.4, "stufe": "A" },
      "2035_verzoegerte_wende":  { "wert": 35.5, "stufe": "A" }
    },
    "quelle": "Bundesnetzagentur, Bericht zur Versorgungssicherheit Strom 2025, 03.09.2025",
    "treiber_der_spanne": "Erfolg der Nachfrageflexibilisierung und Tempo des EE-Ausbaus",
    "speicherbedarf_2045": {
      "batterie_gwh": { "min": 180, "max": 600, "median": 380, "stufe": "C",
                        "quellen": ["Fraunhofer ISE 2022 (180)", "Fraunhofer ISE 2026 (380)", "CAV Partners 2026 (500-600)"] },
      "wasserstoff_speicher_twh": { "min": 130, "stufe": "C", "quelle": "Fraunhofer ISE" },
      "hinweis": "Spanne Faktor 3 — Ursache nicht rekonstruierbar, als Datenluecke ausweisen"
    }
  },

  "netz_und_systemkosten": {
    "netzengpassmanagement_mrd_eur": [
      { "jahr": 2023, "kosten": 3.335, "volumen_gwh": 34297, "stufe": "A" },
      { "jahr": 2024, "kosten": 2.776, "volumen_gwh": 30304, "stufe": "A" },
      { "jahr": 2025, "kosten": 3.1,   "volumen_gwh": null,  "stufe": "B" }
    ],
    "abregelung": [
      { "jahr": 2024, "menge_twh": 9.4, "anteil_ee_prozent": 3.5, "davon_pv_gwh": 1389, "stufe": "A" },
      { "jahr": 2025, "menge_twh": null, "anteil_ee_prozent": 3.5, "davon_pv_gwh": 2700, "stufe": "B" }
    ],
    "negative_strompreise_stunden": [
      { "jahr": 2023, "stunden": 399, "stufe": "B" },
      { "jahr": 2024, "stunden": 457, "stufe": "A" },
      { "jahr": 2025, "stunden": 573, "stufe": "B" }
    ],
    "netzausbau_investitionen_mrd_eur_bis_2045": {
      "uebertragungsnetz_nep": { "min": 360, "max": 392, "stufe": "B", "quelle": "NEP 2037/2045 (2025)" },
      "uebertragungsnetz_imk": { "wert": 328, "stufe": "C" },
      "verteilnetz_imk":       { "wert": 323, "stufe": "C" },
      "gesamt":                { "wert": 651, "stufe": "B", "quelle": "IMK / Hans-Boeckler-Stiftung" },
      "hinweis": "Nicht alle Netzkosten sind EE-induziert — Ersatzinvestitionen und Elektrifizierung von Waerme/Verkehr trennen"
    }
  },

  "lieferketten_konzentration": {
    "pv": {
      "china_anteil_alle_fertigungsstufen_prozent": 80,
      "china_anteil_polysilizium_wafer_ausblick_prozent": 95,
      "china_anteil_wafer_2023_prozent": 98,
      "quelle": "IEA Special Report on Solar PV Global Supply Chains; Wood Mackenzie",
      "stufe": "A",
      "relativierung": "Investitionsgut, kein Brennstoff — Lieferstopp trifft Zubau, nicht Betrieb bestehender Anlagen"
    },
    "uran": {
      "eu_natururan_2024_prozent": { "kanada": 33, "kasachstan": 24, "russland": 15, "australien": 10 },
      "eu_anreicherung_russland_2024_prozent": 23,
      "eu_anreicherung_russland_2023_prozent": 38,
      "eu_anreicherung_eigen_prozent": 60,
      "russland_anteil_globale_anreicherungskapazitaet_2022_prozent": 44,
      "rosatom_plus_cnnc_globale_swu_2024_prozent": 62,
      "quelle": "Euratom Supply Agency Annual Report 2024; RUSI",
      "stufe": "A"
    },
    "gas": {
      "importe_2025_twh": 1031,
      "importe_2024_twh": 864,
      "veraenderung_prozent": 19,
      "anteile_2025_prozent": { "norwegen": 44, "niederlande": 24, "belgien": 21 },
      "lng_terminals_de_twh": 106,
      "lng_terminals_de_anteil_prozent": 10.3,
      "russland_pipeline": 0,
      "quelle": "Bundesnetzagentur, PM 09.01.2026; SMARD",
      "stufe": "B",
      "einschraenkung": "Ein grosser Teil der NL/BE-Importe ist regasifiziertes LNG — Diversifizierung nach Herkunftsland ueberzeichnet die Diversifizierung nach Quelle"
    },
    "kritische_rohstoffe": {
      "top3_raffination_anteil_2024_prozent": 86,
      "top3_raffination_anteil_2020_prozent": 82,
      "china_graphit_raffination_prozent": 90,
      "china_seltene_erden_raffination_prozent": 90,
      "china_lithium_verarbeitung_prozent": 60,
      "china_kobalt_verarbeitung_prozent": 60,
      "trend": "steigend",
      "quelle": "IEA Global Critical Minerals Outlook 2025",
      "stufe": "A"
    }
  },

  "kernkraft_restrisiken": {
    "endlager_status": [
      { "land": "Finnland",     "projekt": "Onkalo",  "status": "Probebetrieb seit 09/2024, Betriebsgenehmigung STUK ausstehend, Inbetriebnahme 2026 vorgesehen", "erste_einlagerung_jahr": 2026, "stufe": "A" },
      { "land": "Schweden",     "projekt": "Forsmark","status": "Bau/abschliessende Genehmigung",                       "erste_einlagerung_jahr": null, "stufe": "B" },
      { "land": "Frankreich",   "projekt": "Cigeo",   "status": "Enquete publique bis 16.07.2026, danach Dekret",       "erste_einlagerung_jahr": 2050, "stufe": "A" },
      { "land": "USA",          "projekt": null,      "status": "kein nationales Endlager, dezentrale Zwischenlager",   "erste_einlagerung_jahr": null, "stufe": "A" },
      { "land": "Deutschland",  "projekt": "StandAG", "status": "Standortentscheidung 2046-2074 erwartet",              "erste_einlagerung_jahr": null, "stufe": "B" }
    ],
    "kenfo": {
      "einzahlung_2017_mrd_eur": 24.1,
      "anlagevermoegen_mrd_eur": 28,
      "rendite_2025_prozent": 6.2,
      "zielrendite_2025_prozent": 3.95,
      "rendite_seit_auflage_prozent_pa": 4.8,
      "erstattungen_seit_2017_mrd_eur": 5.3,
      "erstattung_2025_mio_eur": 823,
      "betreiber_enthaftet": true,
      "auffanghaftung": "Bundeshaushalt / Steuerzahler",
      "deckungsluecke_quantifiziert": false,
      "stufe": "A/B"
    },
    "haftung": {
      "haftpflichtversicherung_mio_eur": 255.645,
      "solidarvereinbarung_mrd_eur": 2.5,
      "darueber": "Staat (Paragraph 34 AtG)",
      "betreiberhaftung_dem_grunde_nach": "unbegrenzt",
      "schattenpreis_je_mwh_quantifiziert": false,
      "stufe": "B",
      "hinweis": "Als optionaler Risikoaufschlag mit weiter Spanne modellieren, nicht als Fixwert — Groessenordnung ist methodisch umstritten"
    }
  },

  "kostenueberschreitung_faktoren": {
    "definition": "Faktor auf die urspruengliche Kostenschaetzung (decision-to-build). 1.00 = keine Ueberschreitung.",
    "verwendung": "Multiplikator auf CAPEX im LCOE-Modell; Slider 'Realismus-Aufschlag' mit Default aus Empirie, abschaltbar auf 1.00",
    "technologien": {
      "solar":              { "flyvbjerg": 1.01, "sovacool": 1.00, "spanne": [1.00, 1.05], "stufe": "A" },
      "wind":               { "flyvbjerg": 1.13, "sovacool": null, "spanne": [1.05, 1.20], "stufe": "A" },
      "netz_uebertragung":  { "flyvbjerg": 1.08, "sovacool": null, "spanne": [1.05, 1.15], "stufe": "A" },
      "fossil_thermisch":   { "flyvbjerg": 1.16, "sovacool": 1.097,"spanne": [1.10, 1.20], "stufe": "A" },
      "geothermie":         { "flyvbjerg": null, "sovacool": 1.207,"spanne": [1.15, 1.25], "stufe": "B" },
      "wasserkraft":        { "flyvbjerg": 1.75, "sovacool": 1.367,"spanne": [1.35, 1.80], "stufe": "A" },
      "kernkraft":          { "flyvbjerg": 2.20, "sovacool": 2.025,"spanne": [1.30, 2.40], "stufe": "A",
                              "hinweis": "Untergrenze 1.30 bildet Serienbau (Korea/China) ab; Obergrenze westliche Erstbauten (Flamanville, Vogtle, HPC)" },
      "nukleare_endlagerung":{ "flyvbjerg": 3.38, "sovacool": null, "spanne": [2.50, 3.50], "stufe": "A" }
    },
    "zeitueberschreitung_prozent": {
      "kernkraft": 64,
      "geothermie": 58.8,
      "solar": 0,
      "quelle": "Sovacool & Ryu 2025",
      "stufe": "B"
    },
    "datenbasis": {
      "flyvbjerg": { "projekte": 16000, "laender": 136, "definition_megaprojekt_usd": 1000000000 },
      "sovacool":  { "projekte": 662, "laender": 83, "zeitraum": "1936-2024" }
    },
    "skaleneffekt_bruchpunkte_mw": [1280, 1561],
    "gegenargument": "Datenbasis dominiert von westlichen Erstbauten nach langer Baupause; Serienbau (APR1400) zeigt deutlich geringere Ueberschreitungen. SMR-Modularitaetsargument plausibel, aber empirisch unbelegt."
  },

  "risiko_aufschlaege_zusammenfassung": {
    "hinweis": "Prozentuale Aufschlaege auf die Stromgestehungskosten der jeweiligen Technologie, als Spannen. Alle Werte sind Modellparameter zur Sensitivitaetsanalyse, KEINE gesicherten Kostenwerte.",
    "positionen": [
      { "id": "kostenueberschreitung", "gilt_fuer": "alle", "spanne_prozent": [0, 140], "quelle": "Flyvbjerg / Sovacool", "belastbarkeit": "hoch (grosse Empirie)" },
      { "id": "lieferketten_disruption", "gilt_fuer": "pv, batterie, wind_offshore", "spanne_prozent": [0, 30], "quelle": "eigene Setzung auf Basis IEA-Konzentrationsdaten", "belastbarkeit": "niedrig (keine direkte Empirie)" },
      { "id": "brennstoff_preisrisiko", "gilt_fuer": "erdgas", "spanne_prozent": [0, 200], "quelle": "Gaspreisspreizung 2021-2023", "belastbarkeit": "mittel" },
      { "id": "entsorgung_endlager", "gilt_fuer": "kernkraft", "spanne_prozent": [0, 40], "quelle": "Flyvbjerg nukleare Lagerung +238 % auf den Entsorgungskostenanteil", "belastbarkeit": "mittel" },
      { "id": "haftung_versicherung", "gilt_fuer": "kernkraft", "spanne_prozent": [0, 100], "quelle": "umstritten, siehe Datenluecke 7", "belastbarkeit": "sehr niedrig — als 'umstritten' kennzeichnen" },
      { "id": "abregelung_marktwertverlust", "gilt_fuer": "pv, wind", "spanne_prozent": [0, 25], "quelle": "Abregelung 3,5 % + 573 h negative Preise 2025", "belastbarkeit": "mittel" },
      { "id": "backup_und_speicher", "gilt_fuer": "pv, wind", "hinweis": "NICHT als Aufschlag modellieren — gehoert ins Systemkostenmodell (LSCOE), sonst Doppelzaehlung", "belastbarkeit": "n/a" }
    ]
  }
}
```

---

## 10. Quellenverzeichnis (kompakt, alle Zugriffe 2026-08-15)

**Klimawissenschaft**
1. IPCC (2023): *Climate Change 2023: Synthesis Report — Summary for Policymakers*. IPCC, März 2023. https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/
2. IPCC (2021): *Climate Change 2021: The Physical Science Basis — SPM* (AR6 WG1). IPCC, August 2021. https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/
3. IPCC: *WGI SPM Headline Statements*. https://www.ipcc.ch/report/ar6/wg1/resources/spm-headline-statements/
4. UN Digital Library: *IPCC AR6 SYR SPM (PDF)*. https://digitallibrary.un.org/record/4008082/files/IPCC_AR6_SYR_SPM.pdf
5. IPCC: *AR6 WG3 SPM (PDF)*. https://www.ipcc.ch/report/ar6/wg3/downloads/report/IPCC_AR6_WGIII_SPM.pdf

**Lebenszyklus-Emissionen**
6. UNECE (2022): *Carbon Neutrality in the UNECE Region: Integrated Life-cycle Assessment of Electricity Sources*. https://unece.org/sites/default/files/2022-04/LCA_3_FINAL%20March%202022.pdf
7. UNECE (2021): *Life cycle assessment of electricity generation options*. https://www.unece.org/sites/default/files/2021-09/202109_UNECE_LCA_1.2_clean.pdf
8. Fraunhofer ISE: *Aktuelle Fakten zur Photovoltaik in Deutschland*. https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/aktuelle-fakten-zur-photovoltaik-in-deutschland.pdf
9. Fraunhofer ISE (2021): *CO₂-Fußabdruck von PV-Modulen*, Presseinformation 23.09.2021. https://www.ise.fraunhofer.de/content/dam/ise/de/documents/presseinformationen/2021/2221_ISE_d_PI_CO2-Fussabdruck-von-PV-Modulen.pdf

**CO₂-Preis und Emissionshandel**
10. Umweltbundesamt (2026): *Handbuch Umweltkosten — Methodenkonvention 4.0*, Februar 2026. https://www.umweltbundesamt.de/system/files/medien/479/publikationen/2026-02/UBA_Handbuch%20Umweltkosten_Methodenkonvention%204.0.pdf
11. Umweltbundesamt: *Methodological Convention 3.2 — Value Factors*. https://www.umweltbundesamt.de/sites/default/files/medien/479/publikationen/methodological_convention_3_2_value_factors_bf.pdf
12. Umweltbundesamt (2020): *Methodenkonvention 3.1 — Kostensätze*. https://www.umweltbundesamt.de/sites/default/files/medien/1410/publikationen/2020-12-21_methodenkonvention_3_1_kostensaetze.pdf
13. Umweltbundesamt: *Gesellschaftliche Kosten von Umweltbelastungen*. https://www.umweltbundesamt.de/daten/umwelt-wirtschaft/gesellschaftliche-kosten-von-umweltbelastungen
14. Umweltbundesamt: *Der Europäische Emissionshandel*. https://www.umweltbundesamt.de/daten/klima/der-europaeische-emissionshandel
15. EWI (2025): *Auswirkungen und Preispfade des EU ETS2*, Endbericht April 2025. https://www.ewi.uni-koeln.de/cms/wp-content/uploads/2025/04/EU-ETS2_Endbericht.pdf
16. BloombergNEF: *Europe's New Emissions Trading System … €149*. https://about.bnef.com/insights/commodities/europes-new-emissions-trading-system-expected-to-have-worlds-highest-carbon-price-in-2030-at-e149-bloombergnef-forecast-reveals/
17. GMK Center: *Carbon price in the EU ETS to hit €126/t by 2030*. https://gmk.center/en/infographic/carbon-price-in-the-eu-ets-to-hit-e126-t-by-2030/
18. Enerdata: *Carbon Price Forecast 2030–2050*. https://www.enerdata.net/publications/executive-briefing/carbon-price-projections-eu-ets.html
19. CLECAT: *EP and Council confirm ETS2 postponement to 2028*. https://www.clecat.org/news/newsletters/ep-and-council-confirm-ets2-postponement-to-2028
20. IRU: *ETS2: EU strengthens carbon price safeguards ahead of 2028 launch*. https://www.iru.org/news-resources/newsroom/ets2-eu-strengthens-carbon-price-safeguards-ahead-2028-launch
21. Transport & Environment (2025): *Making ETS2 work*, Briefing Dezember 2025. https://uploads.transportenvironment.org/production/files/ETS2_briefing-FINAL_08_12.pdf
22. Jacques Delors Institut (2025): *Delivering the ETS2*, PP 317. https://institutdelors.eu/content/uploads/2025/11/PP317_ETS2_Nguyen_EN.pdf
23. Zukunft KlimaSozial (2026): *KlimaSozial kompakt — ETS2*. https://zukunft-klimasozial.de/wp-content/uploads/2026/01/KlimaSozial-kompakt_ETS2-und-soziale-Gestaltung.pdf
24. Sandbag: *Carbon Price Viewer*. https://sandbag.be/carbon-price-viewer/
25. Deutscher Bundestag WD: *CO₂-Emissionen: Preise und Kosten*, WD 5 – 104/24. https://www.bundestag.de/resource/blob/1021378/4edf15c87b75d74c51eb672f10703fcb/WD-5-104-24-pdf.pdf

**Dunkelflaute und Versorgungssicherheit**
26. Bundesnetzagentur / Bundeskartellamt (2025): *Untersuchung zu Strompreisspitzen während Dunkelflauten 2024*, PM 21.10.2025. https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20251021_Preisspitzen.html
27. Bundesnetzagentur (2025): *Bericht zur Versorgungssicherheit Strom 2025*, 03.09.2025. https://www.bundesnetzagentur.de/1072798 · PDF: https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Publikationen/Energie/versorgungssicherheit-strom-bericht-2025.pdf
28. LBBW Research (2025): *Analysen und Statistiken zu Dunkelflauten in Deutschland*. https://www.lbbw.de/artikel/research-studien-2025/dunkelflaute_ake25jccd8_d.html
29. Uniper (2026): *Kurzstudie Dunkelflauten* — Berichterstattung pv magazine 01.06.2026. https://www.pv-magazine.de/2026/06/01/uniper-dunkelflauten-sind-regelmaessiger-bestandteil-des-deutschen-stromsystems/
30. Fraunhofer ISE: *Klimaneutrales Deutschland — regionale Transformationspfade*. https://www.ise.fraunhofer.de/en/press-media/press-releases/2024/achieving-climate-neutrality-fraunhofer-ise-study-shows-regional-transformation-pathways-for-german-energy-system.html
31. Fraunhofer ISE: *BAT4CPP — Batteriespeicher an ehemaligen Kraftwerksstandorten*. https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/Fraunhofer-ISE-Batteriespeicher-an-ehemaligen-Kraftwerkstandorten.pdf

**Netz und Systemkosten**
32. SMARD / Bundesnetzagentur: *Netzengpassmanagement — Quartalsauswertungen*. https://www.smard.de/page/home/topic-article/444/219200/volumen-und-kosten-gestiegen
33. Agentur für Erneuerbare Energien: *Durch Abregelung verlorene Stromerzeugung*. https://www.unendlich-viel-energie.de/mediathek/grafiken/durch-abregelung-verlorene-stromerzeugung
34. pv magazine: *Abregelung von Photovoltaik-Anlagen stieg 2024 um 97 Prozent*, 03.04.2025. https://www.pv-magazine.de/2025/04/03/abregelung-von-photovoltaik-anlagen-stieg-2024-um-97-prozent/
35. pv magazine: *Hoch- und Niedrigpreiszeiten nehmen 2025 zu*, 05.01.2026. https://www.pv-magazine.de/2026/01/05/hoch-und-niedrigpreiszeiten-nehmen-2025-zu/
36. Übertragungsnetzbetreiber (2025): *Netzentwicklungsplan Strom 2037/2045, Version 2025*. https://www.netzentwicklungsplan.de/sites/default/files/2025-12/NEP_2037_2045_V2025_1_Entwurf_0.pdf
37. IMK / Hans-Böckler-Stiftung: *Gut 650 Milliarden Euro bis 2045*. https://www.imk-boeckler.de/de/pressemitteilungen-15992-studie-berechnet-investitionsbedarf-in-deutsche-stromnetze-65371.htm

**Lieferketten**
38. IEA (2022): *Special Report on Solar PV Global Supply Chains*. https://www.iea.org/reports/solar-pv-global-supply-chains/executive-summary
39. IEA (2025): *Global Critical Minerals Outlook 2025*. https://www.iea.org/reports/global-critical-minerals-outlook-2025
40. Euratom Supply Agency (2025): *Annual Report 2024*. https://euratom-supply.ec.europa.eu/document/download/4991f977-5fa7-415e-8b7f-04714f01c533_en?filename=202509773_PDFA2A_MJ0125120ENA_002.pdf
41. RUSI: *Power Plays — Developments in Russian Enriched Uranium Trade*. https://static.rusi.org/SR-power-plays-web-final.pdf
42. Bundesnetzagentur (2026): *Zahlen zur Gasversorgung 2025*, PM 09.01.2026. https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2026/20260109_JahresRueckblickGAS.html
43. SMARD: *The gas market in 2025*. https://www.smard.de/page/en/topic-article/5892/219670/the-gas-market-in-2025

**Kernkraft-Restrisiken**
44. BASE: *Endlager in Finnland*. https://www.base.bund.de/de/endlager/endlager-ausland/finnland/finnland-endlager.html
45. BASE: *Endlagersuche in Frankreich*. https://www.base.bund.de/de/endlager/endlager-ausland/frankreich/frankreich-endlagersuche.html
46. BASE: *Finanzierung Endlagersuche*. https://www.base.bund.de/de/endlager/endlagersuche/finanzierung/finanzierung-endlagersuche.html
47. GRS: *Endlagerung hochradioaktiver Abfälle weltweit*. https://www.grs.de/en/news/knowledge-dossier/disposal-high-level-radioactive-waste-worldwide
48. KENFO. https://www.kenfo.de/
49. Bundesrechnungshof (2024): *Öffentlichkeitsbeteiligung Endlager*. https://www.bundesrechnungshof.de/SharedDocs/Downloads/DE/Berichte/2024/oeffentlichkeitsbeteiligung-endlager-volltext.pdf
50. Deutscher Bundestag WD: *Die Versicherungspflicht von Atomkraftwerken*, WD 3 – 330/10. https://www.bundestag.de/resource/blob/412752/5782d652a8e25945c65d84744d314b88/WD-3-330-10-pdf.pdf

**Kostenüberschreitungen**
51. Flyvbjerg, B. / Gardner, D. (2023): *How Big Things Get Done*. Currency.
52. Budzier, A. / Flyvbjerg, B. et al.: *Quantitative Cost and Schedule Risk Analysis of Nuclear Waste Storage*. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3303410
53. Sovacool, B. K. / Ryu, H. (2025): *Beyond economies of scale …*, Energy Research & Social Science, März 2025. https://www.sciencedirect.com/science/article/pii/S2214629625001380
54. Boston University IGS (2025): *Investment Risk for Energy Infrastructure Construction Is Highest for Nuclear Power Plants, Lowest for Solar*, 19.05.2025. https://www.bu.edu/igs/2025/05/19/investment-risk-for-energy-infrastructure-construction-is-highest-for-nuclear-power-plants-lowest-for-solar/
55. Flyvbjerg, B.: *Cost Overruns and Demand Shortfalls in Urban Rail and Other Infrastructure*. https://arxiv.org/pdf/1303.7402
