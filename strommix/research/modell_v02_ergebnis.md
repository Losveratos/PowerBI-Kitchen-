# Modell-Upgrade v0.2 · Ergebnisdokument

**Datum:** 2026-08-19 · **Auftrag:** Umsetzung der sieben Konsens-Pflicht-Fixes M1–M7 aus
`research/persona_synthese.md` · **Betroffener Code:** `scripts/model.py`,
`scripts/monte_carlo.py`, `scripts/consolidate_params.py`, `scripts/validate_model.py`,
`scripts/export_test_vectors.py`, `scripts/build_story_data.py`, JS-Port in
`whitepaper-strommix.js` · **Erzeugte Daten:** `data/model_params.json`, `data/test_vectors.json`,
`data/monte_carlo_reference.json`, `data/page_data.json`, `data/story_data.json`,
`research/validierung_modell.md`

> **Kurzfassung in vier Sätzen.** Nach den sieben Fixes liegt das Kernkraft-Szenario mit
> **152,3 €/MWh** wieder knapp *vor* dem gasgestützten 80-%-EE-Pfad (**154,6 €/MWh**) — aber der
> Abstand ist mit 2,3 €/MWh kleiner als jeder einzelne Fix, und über gepaarte Ziehungen ist die
> Rangfolge zwischen diesen beiden mit **P = 46,1 %** genau so unentschieden, wie Akt 4 behauptet
> hat. Die Behauptung stimmt also weiterhin — **die bisherige Begründung (überlappende
> Randverteilungen) ist damit trotzdem nicht gerettet**, sie war und bleibt unzulässig. Alle
> übrigen Rangfolgen sind dagegen mit ≥ 99 % entschieden, und die Nebenbotschaft „das heutige
> System ist am billigsten" ist gekippt: der korrigierte Ist-Anker liegt bei **180,8 €/MWh** und
> emittiert dabei **136 Mt CO₂/a**. Der Preis dieser Ehrlichkeit: der Ist-Anker ist jetzt
> ausdrücklich **nicht mehr ranking-fähig** (andere Systemgrenze).

---

## 1 · Was jeder Fix bewirkt hat

Alle Werte deterministisch, Szenariensatz `mittel`, WACC 5 %, CO₂ 75 €/t, Netzvariante `mid`,
Profil H2-2024 (4 416 h, hochgerechnet). „Δ" ist der Effekt des Fixes auf das jeweilige Szenario
(v0.2 minus derselbe Lauf mit zurückgedrehtem Fix), reproduzierbar über die Schalter
`idc_applicable_share`, `fuel_eur_mwh_th`, `grid_cost_basis` und `bands_twh`.

| Fix | Was geändert wurde | Ist 2025 | Kostenmin. | 80 % EE + Gas | 80 % EE + H₂ | 100 % EE |
|---|---|---:|---:|---:|---:|---:|
| **M1 · IDC** | Bauzins nur noch auf Overnight-Anker | ±0,0 | **−23,3** | ±0,0 | ±0,0 | ±0,0 |
| **M2 · Gaspreis** | 35 €/MWh_th über den Wirkungsgrad | +16,6 | +4,2 | **+16,2** | +0,7 | +0,2 |
| **M3 · Netzkosten** | 328 (Übertragung, genutzte fEE) + 323 (Verteilnetz, Sockel), gedeckelt | — | **+15,6** | −2,3 | +0,4 | **−26,0** |
| **M6 · Bänder** | Kohle/Biomasse/Wasser im Ist-Anker | **−21,7** | — | — | — | — |
| **M6 · Netzbasis** | Ist-Anker mit heutigem Netzentgelt statt 2045-Investition | **+61,1** | — | — | — | — |
| **Summe v0.1 → v0.2** | | **+73,7** | **−3,4** | **+13,9** | **+1,2** | **−25,8** |
| **v0.1 (alt)** | | 107,1 | 155,8 | 140,7 | 197,2 | 270,9 |
| **v0.2 (neu)** | | **180,8** | **152,3** | **154,6** | **198,4** | **245,2** |

M4, M5 und M7 verändern den deterministischen Punktwert nicht (M4 und M7 wirken nur in der
Monte-Carlo-Rechnung, M5 ist ein zusätzlicher Ausweis) — siehe Abschnitte 1.4, 1.5, 1.7.

### 1.1 M1 · IDC-Doppelzählung Kernkraft — behoben

`technologies.nuclear.params` hat drei neue Felder: `capex_scope`, `idc_applicable_share`,
`overrun_applicable_share`. Sie folgen der CAPEX-Stützstelle (`_SCENARIO_FIELD_MAP` → `capex`)
und werden in der Monte-Carlo-Rechnung zwischen den Stützstellen linear interpoliert
(`model.scope_share_for_capex`), damit die Ziehung keinen Sprung bekommt.

| Stützstelle | Anker | `cost_scope` im Dossier | IDC-Anteil |
|---|---|---|---:|
| min 7 500 €/kW | EPR2-Programm 7 583 (OCC), Dukovany II 7 906 (EPC) | `overnight_only` / `epc_only` | **1,00** |
| mid 12 000 €/kW | Lubiatowo 11 968, Sizewell C 13 472, EPR2 inkl. Fin. 10 417 | `total_project` / `total_incl_idc` | **0,00** |
| max 17 500 €/kW | Hinkley Point C 17 264 | `total_project_nominal` | **0,00** |

Belegkette: `kosten_kernkraft.md` 7.3 schreibt wörtlich „ohne IDC-Aufschlag, da im CAPEX-Anker
teilweise enthalten"; der Datensatz belegt die Identität selbst (EPR2 7 583 × 1,37 ≈ 10 389 ≈
10 417 €/kW inkl. Finanzierung).

**Effekt.** Kernkraft-LCOE (Zentralwerte, WACC 5 %, 7 500 h): **151,3 → 122,5 €/MWh**. Der
effektive CAPEX fällt von 16 081 auf 12 000 €/kW. Auf das Kostenminimum-Szenario: **−23,3 €/MWh**.
Das ist praktisch der vom Gutachten genannte Wert (−24,3); die kleine Differenz stammt daher, dass
das Gutachten `apply_idc=False` global setzte, hier aber PV/Wind/Gas ihren (kleinen, sachlich
richtigen) Aufschlag behalten. Für PV (1 a Bauzeit, +2,5 %), Wind onshore (2 a, +5,0 %), Wind
offshore (3 a, +7,6 %) und Gas (3 a) bleibt der Aufschlag unverändert — ihre Anker sind
schlüsselfertige Investitionskosten, also Overnight; das ist jetzt je Technologie in
`capex_scope` dokumentiert statt implizit.

### 1.2 M2 · Erdgas-Brennstoffpreis — eingeführt

Neuer Pflichtparameter `technologies.gas_*.params.fuel_eur_mwh_th`:

| | min | mid | max |
|---|---:|---:|---:|
| €/MWh_th | 20 | **35** | 60 |
| €/MWh_el bei η = 0,60 | 33,3 | **58,3** | 100,0 |

`model.lcoe()` rechnet `fuel_eur_mwh_th / η`; ein direkt gesetzter elektrischer Wert (Kernbrennstoff)
hat weiterhin Vorrang. Der Parameter ist im Ziehungsplan (jetzt **24** statt 23 gezogene Größen).

**Beleg und Konfidenz — ehrlich.** Die Dossiers führen keinen Gaspreis; das war eine Lücke der
Recherche, nicht der Welt. Belegte Stützpunkte aus einer WebSearch am 19.08.2026: TTF-Frontmonat
Juli 2026 im Mittel **53,5 €/MWh_th** (Min 43,0 / Max 63,1), Stand 19.08.2026 rund
**62–64 €/MWh_th**, 2024/25 überwiegend 30–45 €/MWh_th. Das sind Marktnotierungen, keine
institutionelle Primärquelle → **Konfidenz B für die Spanne, C für die Übertragbarkeit auf ein
Zieljahr 2045**. Der Modell-Mid von 35 €/MWh_th liegt bewusst *unter* dem aktuellen Spot (Annahme
sinkender Gasnachfrage bis 2045); die Krisenspitze 2022 (> 200 €/MWh_th) ist nicht in der
Basisspanne. Gegenprobe im eigenen Datensatz: `gas_ccgt.gas_fuel_implied` rechnet aus der
FÖS-Gesamt-LCOE einen variablen Block von 100–200 €/MWh_el zurück; die Modellspanne liefert
33–100 €/MWh_el Brennstoff plus 30 €/MWh_el CO₂ — dieselbe Größenordnung.

**Effekt.** Der Gewinner-Pfad verliert am meisten: **80 % EE + Gas +16,2 €/MWh** (264,4 TWh
Gas-Arbeit), Kernkraft-Szenario nur **+4,2 €/MWh** (69,2 TWh) — Faktor 3,9. Der Ist-Anker
+16,6 €/MWh (148,1 TWh).

**H₂-Gegenprobe (Asymmetrie).** Die H₂-Kette war schon vorher vollständig bepreist: Elektrolyse
(24,4 €/MWh im H₂-Preset), H₂-Kavernenspeicher über den Durchsatz (47,5) und H₂-Turbine (11,8) —
zusammen 83,7 von 198,4 €/MWh. Mit M2 zahlt jetzt auch der Gas-Pfad seinen Brennstoff; die
Asymmetrie „Gas gratis vs. H₂ bezahlt" ist damit weg. **Eine Restasymmetrie bleibt und ist neu als
maschinenlesbare Limitation geführt** (`limitations.h2_initial_fill_free`): Der Saisonspeicher
startet in `ee80_h2` und `ee100` gefüllt, die Stromkosten dieser Anfangsfüllung liegen außerhalb
des Halbjahresprofils. Diese Asymmetrie zeigt in die *Gegenrichtung* (sie verbilligt die H₂-Pfade)
und ist mit einem Halbjahresprofil nicht auflösbar.

### 1.3 M3 · Netzkosten — aufgeteilt statt linear

Alte Regel (v0.1): `651 Mrd. € × CRF × (erzeugter fEE-Anteil / 1,0)`, ungedeckelt.
Neue Regel (v0.2), beide Blöcke aus `ist_zustand_de.md` 5.1
(`netzkosten.gesamtnetz_imk_boeckler_2024`):

| Block | Volumen | Treiber | Skalierung |
|---|---:|---|---|
| Übertragungsnetz | **328 Mrd. €** (max 392, NEP) | EE-/Transportgetrieben (HGÜ-Korridore) | `min(1,0; genutzte fEE-Energie / Bedarf)` |
| Verteilnetz | **323 Mrd. €** | Elektrifizierung: Wärmepumpen, Ladeinfrastruktur, Industrieanschlüsse, Altersersatz | `min(1,0; Bedarf / 950 TWh)` — mixunabhängiger Sockel |

Zwei Punkte, die das EE-Gutachten (K1) verlangt hat, sind damit erledigt: Der Sockel fällt bei
fEE → 0 **nicht** mehr weg, und **abgeregelte Energie skaliert nicht mehr mit** — die
Abregelung wird zwischen fEE und Must-run-Band anteilig aufgeteilt, gezählt wird nur die genutzte
fEE-Arbeit. Der Skalierungsfaktor ist auf 1,0 gedeckelt; die ungedeckelten Werte stehen als
`grid_scaling_raw` im Ergebnis und lösen eine Warnung aus.

| Preset | Netzkosten v0.1 | Netzkosten v0.2 | roher Übertragungsfaktor |
|---|---:|---:|---:|
| GES · Kostenminimum | 7,6 | **23,2** | 0,167 |
| GES · 80 % EE + Gas | 36,7 | **34,4** | 0,725 |
| GES · 80 % EE + H₂ | 36,9 | **37,3** | 0,861 |
| GES · 100 % Erneuerbare | 66,0 | **40,0** | **1,170 → auf 1,00 gedeckelt** |

Die Spreizung zwischen Kernkraft- und 100-%-Szenario schrumpft von **58,4 auf 16,8 €/MWh**. Das
100-%-Szenario trägt nicht mehr 165 % des nationalen Budgets; die Überschreitung wird ausgewiesen
statt bezahlt.

**Netz-Opex: ausdrücklich als Lücke dokumentiert, nicht ergänzt.** Für das Zielsystem 2045 gibt es
in keinem Dossier einen Netzbetriebs-, Verlust- oder Redispatch-Kostensatz. Belegt ist nur das Ist
(Engpassmanagement 2,776 Mrd. € 2024, 2,7–3,1 Mrd. € 2025). Neuer Eintrag `gaps.netz_opex` +
`system.grid.opex_note`; der Netzblock der Zukunftsszenarien ist damit eine **ausgewiesene
Untergrenze**. Außerdem korrigiert: die Notiz zu `redispatch_2024_bn_eur` behauptete, der Betrag
sei „in den Netzkosten enthalten" — das ist in einer reinen Investitionsannuität falsch
(Versorger-Review K2c) und steht jetzt richtig da.

### 1.4 M4 · Monte Carlo — gepaarte Ziehungen und Rangwahrscheinlichkeiten

Vorher: `seed = BASE_SEED + preset_index*1000 + config_index` — jedes Preset zog **eigene**
Zufallszahlen. Jetzt: `seed = BASE_SEED + config_index`, **ein** Ziehungsstrom je Konfiguration,
jede Ziehung wird auf **alle fünf Presets** angewandt (common random numbers). Damit ist der
PV-CAPEX in der Kernkraft-Welt derselbe wie in der Gas-Welt.

Neue Auswertung `rank_probabilities` je Konfiguration: für jedes Szenariopaar die
Differenzverteilung A−B mit **P(A günstiger als B)**, Median, P5/P95 und einem Flag `decided`
(≥ 95 % in eine Richtung). Das ersetzt das Überlappungsargument.

Neue Konfigurationen: zusätzlich zu `base`, `wacc`, `overrun`, `wacc_overrun` jetzt **`co2`**
(CO₂-Preis als Dreieck 0/75/400 €/t aus `risiken_co2.md` 2.5) und **`wacc_co2`**. Damit 6
Konfigurationen × 5 Presets × 1 000 Ziehungen. Seed-Disziplin bleibt: Doppellauf byteidentisch,
JS-Port bitgleich (35 MC-Perzentile geprüft, 0 Abweichungen).

### 1.5 M5 · Emissionen je Szenario — neu im Output

`mix_system` liefert jetzt `emissions` mit `gas_mt_co2_a`, `coal_mt_co2_a`, `total_mt_co2_a`,
`g_co2_per_kwh_delivered` und den verwendeten Faktoren; `dispatch` liefert die Bandkomponenten
(`nuclear_band`, `hydro_band`, `biomass_band`, `coal_band`) getrennt. Die Werte gehen in
`monte_carlo_reference.json` und über `build_story_data.py` in `story_data.json`.

**Der Emissionsfaktor bleibt der Proxy und ist als solcher markiert:** 0,403 t/MWh_el für Gas und
0,751 t/MWh_el für Kohle sind die UNECE-**Lebenszyklus-Untergrenzen** aus `risiken_co2.md` 1.2,
nicht direkte Verbrennungsfaktoren (Feld `status: "PROXY …"`, Limitation
`emission_factor_proxy`). Für die ETS-Bepreisung überschätzt das die CO₂-Kosten um rund 10–20 %.

**Kein CCS-Modul** (offene Entscheidung Michael). Stattdessen ist die Limitation jetzt
maschinenlesbar: `gaps.ccs_nicht_modelliert` und `limitations.ccs_not_modelled` mit dem Satz, dass
die geprüfte Studie ihren Gas-Pfad mit CCS rechnet und die verglichenen Szenarien deshalb **nicht
emissionsäquivalent** sind.

### 1.6 M6 · Ist-2025-Anker — vervollständigt und als nicht vergleichbar gekennzeichnet

Zwei Änderungen:

1. **Bänder ergänzt** (`system.legacy_bands`, Quelle `ist_zustand_de.md` 1.1): Kohle 101,7 TWh
   (Braunkohle 75,2 + Steinkohle 26,5), Biomasse 42,7 TWh, Wasserkraft 21,0 TWh. Der Anker deckt
   seine Residuallast nicht mehr zu 59 % aus Gas. Kostenansatz: **nur CO₂** — Kapital- und
   Betriebskosten der Bestandsflotte sind in keinem Dossier belegt (`gaps.hydro_biomasse_band`),
   die Anlagen sind Bestand und weitgehend abgeschrieben. Das ist eine ausgewiesene Untergrenze und
   erzeugt eine Warnung im Ergebnis. Effekt: **−21,7 €/MWh** (billige Bänder verdrängen teures
   Gas-Backup).
2. **Netzkosten-Basis gewechselt** (`grid_cost_basis = "ist_netzentgelt"`): Der Anker trägt nicht
   mehr anteilig die Netzinvestition **bis 2045**, sondern das dokumentierte **heutige Netzentgelt**
   von 9,3 ct/kWh = **93 €/MWh** (`ist_zustand_de.md` 5.1, Haushalt 2026, wie erhoben; ohne den
   6,5-Mrd.-Bundeszuschuss wären es 131 €/MWh — das Dossier nennt den Zuschuss selbst eine
   „Transferleistung, keine Kostensenkung"). Effekt: **+61,1 €/MWh**.

**Begründung der Wahl — beides, nicht eines von beidem.** Ich habe die Netzentgelt-Variante
gewählt *und* den Anker zusätzlich als nicht vergleichbar gekennzeichnet, weil die beiden
Netzblöcke unterschiedliche Systemgrenzen haben: 93 €/MWh ist das *Bestandsnetz inklusive Betrieb*,
die 328+323 Mrd. € sind *Zusatzinvestition ohne Betrieb*. Eine der beiden Zahlen in die andere
Reihe zu stellen wäre genau der Abgrenzungsfehler, den die Story anderen vorwirft. Der Anker führt
deshalb `comparable_to_target_scenarios: false` und eine eigene Limitation
(`ist_anchor_not_comparable`). Zusätzlicher Vorbehalt, ehrlich notiert: 93 €/MWh ist ein
**Haushalts**-Netzentgelt; der systemweite Durchschnitt liegt darunter, weil die Industrie weniger
zahlt (Konfidenz C).

### 1.7 M7 · Überschreitungsfaktoren — nur noch auf Schätzbasis-Anker

Der Flyvbjerg-Faktor ist definitionsgemäß ein Verhältnis *Entscheidungsschätzung → Ist*
(`risiken_co2.md` 7). Er wird deshalb über `overrun_applicable_share` nur noch auf Anker gelegt,
die eine Schätzung sind:

| Kernkraft-Stützstelle | Anker | Status | Faktor-Anteil |
|---|---|---|---:|
| 7 500 €/kW | EPR2-Programm, Dukovany-EPC (vor Baubeginn) | Schätzung | **1,00** |
| 12 000 €/kW | Lubiatowo, Sizewell C (vor bzw. bei FID) | Schätzung | **1,00** |
| 17 500 €/kW | Hinkley Point C, 48,7 Mrd. GBP laufende Preise | **realisiert** (Erstschätzung 18 Mrd. GBP) | **0,00** |

Wirkung im Testvektor: derselbe Faktor 2,2 ergibt auf dem Low-Anker 173,3 €/MWh (voll wirksam,
inkl. IDC), auf dem High-Anker 174,9 €/MWh (Faktor wirkungslos, kein IDC). Im
Überschreitungs-Lauf sinkt der Median des Kostenminimum-Szenarios gegenüber der naiven Anwendung
spürbar — der Modalpfad ist nicht mehr 12 000 × 1,34 × 2,20 = 35 400 €/kW.

**Die 1,00-Faktoren für Speicher und H₂ sind jetzt als ungemessen gekennzeichnet**
(`system.cost_overrun_factors.unmeasured_technologies`, `gaps.overrun_ungemessen_speicher_h2`,
`limitations.overrun_asymmetry`): Batterie, Elektrolyse, H₂-Speicher und H₂-Turbine haben in
Flyvbjerg und Sovacool & Ryu **keine Projektklasse** — 1,00 ist eine Datenlücke, keine Messung, und
der eine Wert, den man aus dieser Empirie für neuartige Großinfrastruktur nicht ableiten kann
(nächstgelegene Analoga: Wasserkraft 1,75, nukleare Endlagerung 3,38). Das Überschreitungs-Szenario
ist damit **ausdrücklich asymmetrisch** und stresst die Kernkraft- und Netzseite stärker als die
Speicher-/H₂-Seite.

---

## 2 · Neue Szenario-Tabelle

Deterministischer Punktwert, Monte-Carlo-Median mit P5–P95 (Konfiguration `base`, 1 000 gepaarte
Ziehungen), Restemissionen und die freien Dispatch-Größen.

| Szenario | Punktwert €/MWh | P50 [P5–P95] `base` | Mt CO₂/a | Gas TWh/a | Abregelung TWh/a | ungedeckt TWh/a |
|---|---:|---:|---:|---:|---:|---:|
| GES · Kostenminimum (Kernkraft) | **152,3** | 158 [147–177] | 27,9 | 69,2 | 64,7 | 0,00 |
| GES · 80 % EE + Gas | **154,6** | 157 [145–170] | **106,5** | 264,4 | 140,9 | 0,00 |
| GES · 80 % EE + H₂ | **198,4** | 198 [187–209] | 4,8 | 11,9 | 12,1 | 4,58 |
| GES · 100 % Erneuerbare | **245,2** | 244 [227–263] | 1,3 | 3,2 | 377,6 | 1,29 |
| *Ist 2025 (Referenzsystem)*¹ | *180,8* | *182 [174–192]* | *136,0* | *148,1* | *6,2* | *0,00* |

¹ **Nicht ranking-fähig.** Anderer Netzblock (heutiges Netzentgelt statt Zusatzinvestition),
Bestandsbänder ohne Kapital- und Betriebskosten. Als Größenordnungs-Bezug lesbar, nicht als fünfter
Platz in einer Reihe.

Median über die übrigen Konfigurationen (€/MWh, P50 [P5–P95]):

| Szenario | `wacc` | `co2` | `wacc_co2` | `overrun` | `wacc_overrun` |
|---|---:|---:|---:|---:|---:|
| Kostenminimum | 171 [136–222] | 161 [149–182] | 172 [136–221] | **221 [191–249]** | 238 [185–320] |
| 80 % EE + Gas | 165 [139–201] | 166 [148–188] | 175 [143–214] | 168 [155–181] | 176 [148–216] |
| 80 % EE + H₂ | 207 [179–246] | 199 [189–209] | 207 [179–244] | 207 [196–219] | 216 [187–257] |
| 100 % Erneuerbare | 257 [216–316] | 244 [229–262] | 256 [216–311] | 258 [240–277] | 271 [227–331] |
| *Ist 2025* | *186 [174–200]* | *201 [172–248]* | *205 [173–253]* | *186 [178–196]* | *189 [178–206]* |

**Kostenkomponenten v0.2 (€/MWh, deterministisch):**

| Szenario | Erzeugung PV/Wind | Kernkraft | Gas-Backup | Batterie | Elektrolyse | H₂-Speicher | H₂-Turbine | Netz |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Kostenminimum | 14,2 | 99,5 | 15,5 | 0,0 | 0,0 | 0,0 | 0,0 | 23,2 |
| 80 % EE + Gas | 68,9 | 0,0 | 47,7 | 3,5 | 0,0 | 0,0 | 0,0 | 34,4 |
| 80 % EE + H₂ | 69,3 | 0,0 | 4,5 | 3,6 | 24,4 | 47,5 | 11,8 | 37,3 |
| 100 % Erneuerbare | 123,9 | 0,0 | 3,7 | 5,3 | 38,9 | 20,1 | 13,3 | 40,0 |
| *Ist 2025* | *30,5* | *0,0* | *43,1* | *3,2* | *0,0* | *0,0* | *0,0* | *93,0* (+ Kohle-CO₂ 11,0) |

---

## 3 · Rangwahrscheinlichkeiten (gepaarte Ziehungen)

**P(A günstiger als B)** über 1 000 gepaarte Ziehungen. „entschieden" = ≥ 95 % in eine Richtung.
Die zwei entscheidungsrelevanten Paare:

| Konfiguration | P(Kernkraft < 80 % EE + Gas) | Median Δ (KKW − Gas) | P5 … P95 | Urteil |
|---|---:|---:|---:|---|
| `base` | **46,1 %** | +0,8 | −12,8 … +22,7 | **offen** |
| `wacc` | 32,8 % | +5,3 | −12,7 … +32,5 | offen |
| `co2` | **64,3 %** | −4,4 | −25,9 … +19,4 | offen |
| `wacc_co2` | 56,6 % | −2,5 | −24,9 … +25,3 | offen |
| `overrun` | **0,1 %** | +53,6 | +21,0 … +82,4 | entschieden gegen Kernkraft |
| `wacc_overrun` | 0,1 % | +61,1 | +25,7 … +115,3 | entschieden gegen Kernkraft |

| Konfiguration | P(Kernkraft < 80 % EE + H₂) | P(Kernkraft < 100 % EE) |
|---|---:|---:|
| `base` | 99,7 % (entschieden) | 100,0 % (entschieden) |
| `wacc` | 98,8 % | 100,0 % |
| `co2` | 99,7 % | 100,0 % |
| `wacc_co2` | 98,5 % | 100,0 % |
| `overrun` | **25,4 % (offen)** | 97,4 % |
| `wacc_overrun` | **17,0 % (offen)** | 89,7 % (offen) |

Weitere Paare, alle Konfigurationen: `P(80 % EE + Gas < 80 % EE + H₂)` ≥ 99,8 % und
`P(80 % EE + Gas < 100 % EE)` = 100,0 % — beide durchgängig entschieden.

**Lesart in drei Sätzen.** (a) Zwischen Kernkraft-Szenario und gasgestütztem 80-%-Pfad ist die
Rangfolge in allen vier Konfigurationen ohne Überschreitungs-Empirie **wirklich offen** — sie
kippt sogar die Richtung, je nachdem ob man den CO₂-Preis variiert (dann führt Kernkraft mit
64 %) oder nicht (dann führt Gas knapp mit 54 %). (b) Gegenüber beiden wasserstofflastigen Pfaden
ist das Kernkraft-Szenario im Basisfall mit ≥ 99,7 % günstiger — das ist deutlich stärker
entschieden, als die alte Formulierung „bleibt günstiger" nahelegte. (c) Sobald die
Überschreitungs-Empirie zugeschaltet wird, dreht sich das Bild vollständig: dann ist Kernkraft mit
99,9 % teurer als der Gas-Pfad und gegenüber dem H₂-Pfad offen — **diese Konfiguration ist aber die
asymmetrische** (siehe 1.7), und das muss beim Erzählen dabeistehen.

**Nicht-triviale Nebenbefunde.** Im `co2`-Lauf (CO₂ bis 400 €/t) wird der Ist-Anker gegenüber dem
H₂-Pfad zum Münzwurf (47,1 %) — der CO₂-Preis ist also tatsächlich rangentscheidend, wie der
Klimaaktivist behauptet hat. Und im `overrun`-Lauf ist der Ist-Anker mit 96,9 % günstiger als das
Kernkraft-Szenario; das ist ein Artefakt der Nichtvergleichbarkeit (anderer Netzblock) und darf
nicht erzählt werden.

---

## 4 · Validierung

`scripts/validate_model.py` — die drei alten Tests bestehen unverändert, ein vierter ist neu.

| Test | Kriterium | Ergebnis |
|---|---|---|
| (a) **GES-LCOE-Reproduktion** | ± 2 % auf 4 Werte | **BESTANDEN**, max. Abweichung **0,04 %** — **unverändert gegenüber v0.1** |
| (a2) Eigene Spannen vs. Fraunhofer ISE / Lazard | Überlappung | BESTANDEN |
| (b) Ist-2024-Check gegen die Profile | ± 5 % | BESTANDEN (max. 0,06 %) |
| (c) GES-Szenario-Test | Größenordnung | kostenminimum +9 %, ee80_gas −23 %, ee80_h2 −3 %, ee100 −10 % |
| (d) **Ist-2025-Plausibilisierung** (neu) | Mix ± 10 %, Kostenniveau im Ist-Korridor | **BESTANDEN** |

**Zu (a) — ausdrücklich geprüft.** Die GES-Reproduktion rechnet mit GES-Annahmen, `apply_idc=False`
und explizit gesetzten Brennstoffkosten. Sie ist von M1 und M2 **nicht** berührt: die vier Werte
(PV 124,9 · Wind on 90,8 · Wind off 98,3 · Kernkraft 101,6) und die maximale Abweichung von 0,04 %
sind bit-identisch zu v0.1. Das war das Hauptrisiko dieses Umbaus und ist erledigt.

**Zu (c) — ändert sich, und das ist beabsichtigt.** Test (c) ist kein Reproduktionstest, sondern
ein Modelltest: GES-Erzeugungsannahmen, aber eigener Backup-, Speicher- und Netzblock. Er bewegt
sich mit M2 und M3 (ee80_gas 128,6 → 152,7). Der Bericht sagt das jetzt explizit.

**Zu (d) — der neue Test.** Der Ist-2025-Anker ist die einzige falsifizierbare Größe des Modells.

| Größe | Modell TWh/a | Ist 2025 TWh | Abweichung |
|---|---:|---:|---:|
| Photovoltaik | 80,8 | 89,5 | −9,7 % |
| Wind onshore | 106,2 | 110,1 | −3,5 % |
| Wind offshore | 27,0 | 28,0 | −3,5 % |
| Kohle / Biomasse / Wasser (Bänder) | 101,7 / 42,7 / 21,0 | 101,7 / 42,7 / 21,0 | ±0,0 % |
| Erdgas allein (informativ) | 148,1 | 84,9 | +74,4 % |
| **Restdeckung gesamt**¹ | **148,1** | **141,3** | **+4,8 %** |
| Abregelung | 6,2 | 9,4 (Ist 2024) | −33,7 % |

¹ Das Modell kennt weder Import noch Pumpspeicher noch Mineralöl/Abfall — alles davon landet bei
ihm im Gas-Backup. Die faire Vergleichsgröße ist deshalb Erdgas 84,9 + Mineralöl/Sonstige/Abfall
28,9 + Pumpspeicher 7,1 + Nettoimport 20,5 = **141,3 TWh**. Dass die freie Modellgröße darauf auf
**+4,8 %** landet, ist der stärkste Einzelbeleg dafür, dass die Dispatch-Kette funktioniert.

Kostenseitig liegt der Anker mit **180,8 €/MWh** knapp innerhalb des Ist-Korridors
**179,5–370 €/MWh** (Börsenstrompreis 2025 86,5 + Netzentgelt 93 bis Endkundenpreis Haushalt 2026
370). Der Test ist eine **Größenordnungsprüfung, kein Nachweis** — die Blöcke haben
unterschiedliche Systemgrenzen (Börsenpreis = Grenzkosten ohne Kapitalkosten der EE-Flotte;
Endkundenpreis inkl. Steuern und Vertrieb). Dass 180,8 nur 1,3 €/MWh über der Untergrenze liegt,
ist Zufall und darf nicht als Punktlandung erzählt werden.

**Reproduzierbarkeit.** Doppellauf der kompletten Kette
(`consolidate_params → build_page_data → validate_model → export_test_vectors → monte_carlo →
build_story_data`) liefert **byteidentische** Dateien (md5 über alle sechs Ausgaben geprüft).

**JS-Port.** `whitepaper-strommix.js` wurde 1:1 nachgezogen (lcoe, dispatch, mixSystem, MC).
Ergebnis der Selbsttests: **29 Testvektoren, 0 Abweichungen** · **35 Monte-Carlo-Perzentile,
0 Abweichungen** · **10 Rangwahrscheinlichkeiten, 0 Abweichungen**. Vier neue Vektoren decken
gezielt die neuen Pfade ab (`lcoe_nuclear_overrun_high/low`, `lcoe_gas_fuel_from_thermal`,
`lcoe_gas_fuel_max`, `mix_ist_bands_grid`, `mix_grid_split_ee100`).

---

## 5 · Was an Story und White Paper jetzt nicht mehr stimmt (Liste für das Redigat)

Story-HTML und White-Paper-HTML wurden **nicht** angefasst. Die folgende Liste ist die Arbeitsliste
für Schritt 2. Die Zahlen, die per `data-v` gebunden sind, ziehen automatisch nach — die Prosa
nicht.

### 5.1 Muss korrigiert werden — Aussage ist jetzt falsch

| # | Fundstelle | Was jetzt falsch ist | Neue Sachlage |
|---|---|---|---|
| **R1** | `strommix-story.html` Akt 4 / Schritt 3 („Die Bänder überlappen vollständig … keine trennscharfe Aussage") | Die **Begründung** ist unzulässig (overlapping-CI-Fehlschluss) und war es auch vorher. | Ersetzen durch P(Kernkraft < Gas-Pfad) = 46,1 % aus gepaarten Ziehungen. Die *Schlussfolgerung* überlebt, das Argument nicht. |
| **R2** | `strommix-story.html` Zwischenruf: „Was bleibt, ist ein **Rangwechsel um einen Platz**" | Es gibt keinen Rangwechsel mehr. Kernkraft 152,3 vor Gas 154,6 (deterministisch), Median 158 vs. 157. | Neue Formulierung: die Rangfolge ist zwischen diesen beiden **statistisch unentschieden**, nicht „gewechselt". |
| **R3** | `strommix-story.html` Akt 4 / Schritt 3: „Gegenüber beiden wasserstofflastigen Pfaden bleibt das Kernkraft-Szenario **klar günstiger**" | Stimmt im Basisfall sogar deutlicher als behauptet (99,7 % / 100 %) — **aber nicht im Überschreitungs-Lauf** (25,4 % bzw. 17,0 % gegen den H₂-Pfad). | Konfiguration dazusagen. |
| **R4** | `strommix-story.html` Akt 4 / Schritt 4: „Legt man diese Empirie **auf alle Technologien**" | War schon vorher unzutreffend und ist es weiterhin: Batterie, Elektrolyse, H₂-Speicher und H₂-Turbine haben keinen gemessenen Faktor. | Aufzählung der tatsächlich belegten Klassen + Hinweis auf die Lücke (jetzt maschinenlesbar unter `shared.monte_carlo.limitations`). |
| **R5** | `strommix-story.html` Limit-Kachel **„Gaspreis fehlt"** (Z. 1967 ff.) | Der Gaspreis fehlt nicht mehr. Die Kachel behauptet eine Lücke, die geschlossen ist. | Ersetzen durch: Spanne 20/35/60 €/MWh_th, Konfidenz B/C, Marktnotierung statt Dossier. Asymmetrie 264 TWh vs. 69 TWh nennen. |
| **R6** | `strommix-story.html` Limit-Kachel „Parameter ziehen unabhängig" | Halb falsch: **innerhalb** einer Ziehung sind die Parameter jetzt über alle Szenarien identisch. | Umformulieren: unabhängig zwischen *Parametern*, gepaart zwischen *Szenarien*. |
| **R7** | `story_data.json → monte_carlo_headline` (Quelle: `research/story_claims_check.md`) | **Alle** Werte veraltet: 107,1 / 155,8 / 140,7 / 197,2 / 270,9 sowie sämtliche p50/p5/p95. Auch der `caveat` („Erdgas … mit 0 angesetzt — alle Werte sind UNTERGRENZEN"). | Der Block wird von der Story für `#mc-honest` und die Limit-Kachel gelesen und muss im Redigat neu geschrieben werden. Der Akt-4-Chart selbst liest `shared.monte_carlo` und ist bereits aktuell — **die Seite zeigt derzeit also Chart-Zahlen aus v0.2 neben Fließtext aus v0.1.** |
| **R8** | `monte_carlo_headline.honest_statement` („rutscht das Kernkraft-Szenario vom ersten auf den zweiten Platz … Die Unsicherheitsbänder überlappen") | Beide Halbsätze überholt (kein Platzwechsel; Überlappung ist kein Argument). | Neu schreiben. |
| **R9** | `whitepaper-strommix.js` Kap. 4, Gas-Vergleichslinien: „Für Erdgas fehlt in allen Dossiers ein Brennstoffpreis … enthalten deshalb **nur Kapital-, Fixbetriebs- und CO₂-Kosten** und sind ausgewiesene Untergrenzen" | Falsch — der Brennstoff ist jetzt drin. Auch der Folgesatz „der Abstand ist kein Modellbefund, sondern diese Lücke" trägt nicht mehr. | Neu formulieren, FÖS-Linie wird jetzt zum echten Vergleich. |
| **R10** | `whitepaper-strommix.js` Kap. 3/5: „Netzkosten gehen top-down mit 651 Mrd. € … **linear mit dem fEE-Anteil skaliert** — dieselbe Vereinfachung wie in der GES-Studie" (2 Fundstellen) | Die Regel gilt nicht mehr. | Neue Regel beschreiben (328/323, genutzte fEE-Energie, Sockel, Deckelung). Nebeneffekt: der Satz „dieselbe Vereinfachung wie GES" war die *Begründung für Vergleichbarkeit* — die fällt weg und muss ersetzt werden (die v0.1-Regel ist als `grid_cost_basis: "legacy_fee_linear"` weiter rechenbar). |
| **R11** | `whitepaper-strommix.js` Kap. 6, Textbaustein „Bei dieser Einstellung überlappen sich N von M benachbarten Szenario-Paaren … Für diese Paare ist die Reihenfolge **nicht entschieden**" | Genau der Satz, den das Professorengutachten als „folgenschwersten Satz des Beitrags" bezeichnet. Methodisch unzulässig. | Durch die Differenzverteilung ersetzen; `S.mcRef.rank_probabilities` liegt bereit. |
| **R12** | `whitepaper-strommix.js` Kap. 5, Mix-Simulator-Preset **„Ist 2025"** | Bildet den Anker weiterhin ohne Kohle-/Biomasse-/Wasserband und mit Ausbau-Netzkosten ab — weicht damit sichtbar vom Ist-Anker in Kap. 6 ab. | Entweder Preset nachziehen (Bänder + `grid_cost_basis`) oder im Hinweistext ausdrücklich abgrenzen. |
| **R13** | Story-Hero/Prolog: „für ein **klimaneutrales** deutsches Stromsystem" | Das Wort trifft auf die eigenen Modellergebnisse nicht zu: der zweitgünstigste Pfad emittiert 106,5 Mt CO₂/a. | Auf die *Studie* beziehen, und die Mt-Zahlen an den Akt-4-Chart legen (stehen jetzt in `shared.monte_carlo.presets.*.emissions_mt_co2_a`). |
| **R14** | Story Akt 4 / Schritt 1: „plus eine fünfte als Anker: **das heutige System von 2025**, mit demselben Modell gerechnet" | „mit demselben Modell" stimmt nicht mehr — der Anker hat jetzt bewusst eine andere Netz-Systemgrenze. | Umbenennen („Referenzsystem"), optisch absetzen, Nichtvergleichbarkeit nennen (`comparable_to_target_scenarios: false`). |
| **R15** | Story Akt 4 / Schritt 2: „insgesamt **23 Größen**" (per Datenbindung `drawn_parameters`) | Zieht automatisch auf **24** nach — aber der Text nennt WACC und CO₂ weiterhin als *nicht* variiert. | Text an die zwei neuen Konfigurationen `co2` / `wacc_co2` anpassen. |
| **R16** | `whitepaper-strommix.js` Kap. 3 (`#meth-mc`): „zieht N Parameter … **1 000-mal je Szenario**, mit festem Startwert" | Beschreibt das alte Verfahren. Es sind jetzt 1 000 Ziehungen **je Konfiguration**, gemeinsam für alle Szenarien. | Common random numbers erklären — didaktisch der wertvollste neue Absatz. |
| **R17** | `whitepaper-strommix.js` Kap. 6 Badge/Fließtext: „… Kombinationen" und die Ziehungszahl im Fortschritts-Badge | Zahlen ändern sich automatisch (6 statt 4 Konfigurationen → 30 statt 20 Kombinationen, 30 000 statt 20 000 Ziehungen), der begleitende Text nennt aber weiterhin nur vier Konfigurationen. | Toggle-Beschreibung um `co2` ergänzen; die UI hat bislang nur Schalter für WACC und Überschreitung, die beiden CO₂-Konfigurationen sind gerechnet, aber nicht bedienbar. |

### 5.2 Wird jetzt erst erzählbar (neue Belege im Datensatz)

- **Mt CO₂/a je Szenario** — `shared.monte_carlo.presets.*.emissions_mt_co2_a` (Klimaaktivist Top-2).
- **P(A < B) je Szenariopaar und Konfiguration** — `shared.monte_carlo.rank_probabilities`.
- **Gasarbeit je Szenario** — `gas_backup_twh_a` (264,4 vs. 69,2 TWh); der Nuklear-Advocate hat zu
  Recht bemängelt, dass diese Zahl nie veröffentlicht war (S1, Vorschlag 3).
- **Abregelung je Szenario** — `curtailed_twh_a` (100-%-Pfad: 377,6 TWh).
- **Ungedeckte Last** — `unserved_twh_a` (ee80_h2: 4,58 TWh/a).
- **Maschinenlesbare Limitationen** — `shared.monte_carlo.limitations` (8 Einträge mit `severity`),
  u. a. CCS, Proxy-Emissionsfaktor, Netz-Opex, Overrun-Asymmetrie, H₂-Anfangsfüllung.
- **Gaspreis mit Quelle und Konfidenz** — `shared.gaspreis_erdgas`.
- **Netzaufteilung 328/323** — war schon in `shared.netzkosten_referenzen`, wird jetzt auch benutzt.

### 5.3 Bleibt offen (nicht Teil dieses Auftrags)

| Punkt | Status |
|---|---|
| **CCS-Kostenpfad** | Bewusst nicht gebaut (offene Entscheidung Michael). Limitation ist maschinenlesbar. Solange sie besteht, sind die Szenarien nicht emissionsäquivalent. |
| **Direkter ETS-Emissionsfaktor** statt Lebenszyklus-Proxy | `gaps.emissionsfaktor_direkt` weiter offen; überschätzt die CO₂-Kosten des Gas-Pfads um 10–20 %. |
| **Netz-Opex, Redispatch, Verluste** | `gaps.netz_opex`. Netzblock der Zukunftsszenarien bleibt Untergrenze. |
| **Volljahres-Stundenprofil** | Weiter der größte Einzelhebel für die H₂-Pfade; die Gratis-Anfangsfüllung ist damit nicht auflösbar. |
| **Value of Lost Load** | Ungedeckte Last bleibt kostenlos; ee80_h2 senkt seine spezifischen Kosten weiterhin durch 4,58 TWh Lastabwurf. |
| **Technologiespezifischer WACC** | Ein WACC für reguliertes Netz, geförderte EE und Merchant-Peaker (Versorger S2). |
| **Kein Optimierungsschritt** | Speicher- und Backup-Auslegung bleibt gesetzt (Professor M3). |
| **Symmetrische Overrun-Sensitivität** | H₂-Kette/Batterie mit einem Analogon (z. B. 1,75) zu rechnen wäre der nächste Schritt; derzeit nur als Limitation benannt. |

---

## 6 · Ehrliches Fazit

Die vier Fehler zeigten, wie der Professor vorhergesagt hat, in verschiedene Richtungen und heben
sich **nicht** auf: M1 verbilligt die Kernkraft um 23,3 €/MWh, M2 verteuert den Gas-Pfad um
16,2 €/MWh, M3 verteuert die Kernkraft um 15,6 €/MWh und verbilligt den 100-%-Pfad um 26,0 €/MWh.
Netto rücken Kernkraft- und Gas-Pfad von 15,1 €/MWh Abstand auf **2,3 €/MWh** zusammen — und genau
deshalb ist die Kernaussage von Akt 4 („nicht trennscharf") jetzt zum ersten Mal *belegt* statt nur
behauptet. Sie steht aber auf einer anderen Grundlage als bisher: nicht auf überlappenden
Bändern, sondern auf einer Differenzverteilung, deren Median bei +0,8 €/MWh liegt.

Was der Umbau **nicht** geleistet hat: Er macht die Szenarien nicht emissionsäquivalent (106,5 vs.
27,9 Mt CO₂/a), er schließt die Netz-Opex-Lücke nicht, und er hebt die Overrun-Asymmetrie nicht auf
— er macht diese drei Punkte nur maschinenlesbar, statt sie in Fließtext zu verstecken. Und er hat
eine Nebenbotschaft der Story zerstört: „heute 107 €/MWh, jede Zukunft 141–271" wird zu „heute rund
181 €/MWh bei 136 Mt CO₂, die Zukünfte liegen zwischen 152 und 245 bei 1–107 Mt" — wobei die
heutige Zahl nach den eigenen neuen Regeln **nicht mehr in dieselbe Reihe gehört**.
