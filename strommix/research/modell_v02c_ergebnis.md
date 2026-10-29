# Modell-Patch v0.2c · Ergebnisdokument

**Stand:** Modellversion **0.2c** · **Datum:** 2026-08-19
**Auftrag:** die fünf Zahlenkern-Fixes aus `research/persona_synthese_r2.md`
(Abschnitt „Was noch kaputt ist")
**Detailherleitungen:** `persona_reviews/r2_03_versorger.md` (N1, N2, N7),
`persona_reviews/r2_06_nuklear.md` (N1, N2, N5),
`persona_reviews/r2_01_peer_review.md` (N2)
**Betroffener Code:** `scripts/consolidate_params.py`, `scripts/model.py`,
`scripts/monte_carlo.py`, `scripts/validate_model.py`,
`scripts/export_test_vectors.py`, `scripts/build_story_data.py`, JS-Port in
`whitepaper-strommix.js`
**Erzeugte Daten:** `data/model_params.json`, `data/test_vectors.json`,
`data/monte_carlo_reference.json`, `data/page_data.json`, `data/story_data.json`,
`research/validierung_modell.md`
**Story-HTML und White-Paper-HTML wurden NICHT angefasst** — die Liste der
betroffenen Textstellen steht in Abschnitt 6 und ist die Arbeitsliste für das
Redigat.

---

> **Kurzfassung in fünf Sätzen.** Die vier Modell-Fixes wirken alle in dieselbe
> Richtung — **gegen** das Kernkraft-Szenario im offenen Vergleich und **für** es
> im Überschreitungs-Lauf. Deterministisch liegt das Kernkraft-Szenario nach dem
> Patch mit **159,0 €/MWh** erstmals *hinter* dem gasgestützten 80-%-Pfad
> (**156,8 €/MWh**), und über gepaarte Ziehungen fällt P(Kernkraft < Gas) von
> **44,9 % auf 25,7 %**. Auf dem emissionsgleicheren CCS-Niveau bleibt der
> Kernkraft-Vorsprung bestehen, wird aber kleiner: **82,2 % statt 90,3 %**,
> Median-Vorsprung **11,7 statt 18,2 €/MWh** — und davon stammen jetzt nur noch
> 4,5 statt 11,2 €/MWh aus der Netzregel. Der deterministische CO₂-Kipppunkt
> wandert von **47,5 auf 101,8 €/t** und liegt damit **über** dem heutigen
> ETS-Preis von 74 €/t: die im Panel geplante Redigat-Pointe („der reale
> ETS-Preis liegt schon über der Kippmarke") **gilt nach diesem Patch nicht mehr
> und darf nicht geschrieben werden.** Der Überschreitungs-Lauf ist der größte
> Einzeleffekt: Der effektive Kernkraft-CAPEX fällt im Median von 22.770 auf
> **15.941 €/kW**, das Kernkraft-Szenario von P50 222 auf **189 €/MWh**, aus
> „0 %" werden **3,2 %**, und auf CCS-Niveau wird aus 4,3 % ein **Münzwurf
> (56,5 %)**.

---

## 1 · Was jeder Fix bewirkt

Zerlegung durch **einzelnes Zurückdrehen**: Der ausgewiesene Effekt ist
(v0.2c) minus (v0.2c ohne genau diesen Fix). Reproduziert mit
`scripts/model.py` und `scripts/monte_carlo.py`; die Rekonstruktion des vollen
v0.2b-Zustands (alle vier Modell-Fixes zurückgedreht, Ziehungsplan wieder auf
30 Größen) trifft die publizierten v0.2b-Zahlen **exakt** — P50 base
158/170/157/188/198/244/183 und P(Kernkraft < Gas) = 44,9 %, Median-Δ +1,4.
Das ist die Kontrolle dafür, dass die Zerlegung sauber ist.

### 1.1 Deterministisch (Szenariensatz `mittel`, WACC 5 %, CO₂ 75 €/t)

| Preset | v0.2b | **v0.2c** | Fix 1 Netz-Sockel | Fix 2 Ziehungen | Fix 3 Overrun | Fix 4 Massenbilanz |
|---|---:|---:|---:|---:|---:|---:|
| *Ist 2025 (Referenz)* | *180,81* | *180,81* | ±0,00 | ±0,00 | ±0,00 | ±0,00 |
| GES · Kostenminimum | 152,34 | **159,05** | **+6,70** | ±0,00 | ±0,00 | ±0,00 |
| GES · Kostenminimum + CCS | 163,29 | **169,56** | **+6,70** | ±0,00 | ±0,00 | **−0,43** |
| GES · 80 % EE + Gas | 154,62 | **156,83** | **+2,21** | ±0,00 | ±0,00 | ±0,00 |
| GES · 80 % EE + Gas + CCS | 184,38 | **184,96** | **+2,21** | ±0,00 | ±0,00 | **−1,64** |
| GES · 80 % EE + H₂ | 198,36 | **199,49** | **+1,13** | ±0,00 | ±0,00 | ±0,00 |
| GES · 100 % Erneuerbare | 245,16 | **245,16** | ±0,00¹ | ±0,00 | ±0,00 | ±0,00 |

¹ Der 100-%-Pfad liegt mit einem rohen Übertragungsfaktor von 1,17 ohnehin über
der Deckelung bei 1,0 — ein Sockel kann dort nichts mehr hinzufügen. Genau
deshalb wirkt der Sockel **regressiv**: Er trifft die Pfade mit *wenig*
fluktuierender Erzeugung am stärksten.

**Fix 2 und Fix 3 verändern den deterministischen Punktwert nicht.** Fix 2 wirkt
ausschließlich in der Ziehungsfolge; Fix 3 wirkt nur, wenn der
Überschreitungsfaktor eingeschaltet ist (im Basislauf ist er 1,00).

### 1.2 Monte Carlo, Konfiguration `base` (P50, 1.000 gepaarte Ziehungen)

| Preset | v0.2b | **v0.2c** | Fix 1 | Fix 2 | Fix 3 | Fix 4 |
|---|---:|---:|---:|---:|---:|---:|
| *Ist 2025* | *182,51* | *182,60* | ±0,00 | +0,10 | ±0,00 | ±0,00 |
| Kostenminimum | 158,34 | **164,93** | +6,70 | −0,11 | ±0,00 | ±0,00 |
| Kostenminimum + CCS | 170,06 | **175,87** | +6,70 | −0,55 | ±0,00 | −0,45 |
| 80 % EE + Gas | 156,72 | **158,93** | +2,21 | −0,00 | ±0,00 | ±0,00 |
| 80 % EE + Gas + CCS | 188,24 | **188,56** | +2,21 | −0,47 | ±0,00 | −1,65 |
| 80 % EE + H₂ | 198,11 | **199,55** | +1,13 | +0,30 | ±0,00 | ±0,00 |
| 100 % Erneuerbare | 244,24 | **244,69** | ±0,00 | +0,45 | ±0,00 | ±0,00 |

### 1.3 Monte Carlo, Konfiguration `overrun` (P50)

| Preset | v0.2b | **v0.2c** | Fix 1 | Fix 2 | **Fix 3** | Fix 4 |
|---|---:|---:|---:|---:|---:|---:|
| *Ist 2025* | *186,86* | *186,41* | ±0,00 | −0,45 | ±0,00 | ±0,00 |
| Kostenminimum | 221,56 | **189,00** | +7,28 | −0,08 | **−39,22** | ±0,00 |
| Kostenminimum + CCS | 234,70 | **200,87** | +7,38 | −0,26 | **−39,98** | −0,42 |
| 80 % EE + Gas | 168,24 | **170,20** | +2,42 | −0,49 | ±0,00 | ±0,00 |
| 80 % EE + Gas + CCS | 201,76 | **202,16** | +2,42 | −0,67 | ±0,00 | −1,70 |
| 80 % EE + H₂ | 207,49 | **208,21** | +1,23 | −0,51 | ±0,00 | ±0,00 |
| 100 % Erneuerbare | 258,50 | **257,63** | ±0,00 | −0,88 | ±0,00 | ±0,00 |

**Fix 3 ist mit −39 €/MWh der mit Abstand größte Einzeleffekt des Patches** —
aber nur in den beiden Überschreitungs-Konfigurationen, und ausschließlich beim
Kernkraft-Szenario.

---

## 2 · Fix 1 · Der Übertragungsnetz-Sockel

**Befund** (Versorger-Review R2, N1): Das Verteilnetz hat in v0.2 einen
mixunabhängigen Sockel bekommen, das Übertragungsnetz nicht. Der 328-Mrd.-Block
skalierte weiterhin **linear von null** mit der genutzten fEE-Arbeit. Folge: Ein
Deutschland mit 16,7 % fluktuierender Erzeugung hätte 3,4 €/MWh Übertragungsnetz
gebraucht — rund 55 Mrd. € über zwanzig Jahre für das gesamte deutsche
Höchstspannungsnetz. Aus dieser einen Regel stammten **11,2 der 18,2 €/MWh
(62 %)** des CCS-Vorsprungs, auf dem die Kernaussage von v0.2b ruhte.

### 2.1 Gibt es eine belastbare Quote? Nein — und das ist dokumentiert

Geprüft wurden `ist_zustand_de.md` 5.1 und die dort referenzierten Quellen:

- **NEP 2037/2045 V2025** nennt Gesamtinvestitionen (≈ 365–392 Mrd. €),
  Szenario-Zwischenstände (A bis 2037 ≈ 283 Mrd., 2037–2045 ≈ 80 Mrd.,
  Szenario-B-Aufschläge +17 und +24 Mrd.) und Jahresvolumina — **keine
  Aufteilung nach Treibern.**
- **IMK/Böckler** nennt 328 Mrd. € Übertragungsnetz gegen 323 Mrd. € Verteilnetz
  — ebenfalls **ohne Treiberaufteilung**.
- Die einzige treibernahe Größe ist die Differenz Szenario A → B (+41 Mrd. ≈
  10 %). Sie misst aber die **Klimaziel-Ambition**, nicht den mixunabhängigen
  Anteil, und taugt deshalb nicht als Sockelquote.

**Ergebnis: keine belastbare Quote.** Deshalb — wie beauftragt — eine
**dokumentierte Setzung (M) mit Sensitivität**, und die Differenz zum
sockellosen Lauf wird im Output ausgewiesen.

### 2.2 Die Setzung und ihre Begründung

`system.grid.transmission_socket_share` = **0,20 / 0,40 / 0,60**, Status
`MODELLANNAHME (nicht quellenbelegt, dokumentierte Setzung)`.

Neue Regel (`system.grid.scaling_rule`, Version v0.2c):

```
Übertragung  = min(1,0;  a · min(1,0; Bedarf/950 TWh)
                       + (1−a) · genutzte fEE-Arbeit / Bedarf)
Verteilung   = min(1,0;  Bedarf/950 TWh)                    (unverändert)
```

Der Sockelanteil skaliert mit dem **Bedarf** — genau wie der Verteilnetz-Sockel
und aus denselben Gründen. Bei `a = 0` reproduziert die Formel exakt die
v0.2b-Regel (als Testvektor `mix_grid_no_socket` festgeschrieben).

**Warum 0,40 und keine andere Zahl?** Dieselben Treiber, mit denen der
Verteilnetz-Sockel belegt ist, gelten eine Spannungsebene höher weiter:
Altersersatz (große Teile des Höchstspannungsnetzes stammen aus den 1960er/70er
Jahren und erreichen bis 2045 ihr Nutzungsdauerende), Lastzuwachs aus
Elektrifizierung und Rechenzentren, n-1-Redundanz, Systemdienstleistungen und
Blindleistung, Anschluss neuer Großkraftwerke — **auch Kernkraftblöcke brauchen
Höchstspannungsanbindung und Abfuhrkapazität.** Der eigene Datensatz nennt
„Altersersatz" ausdrücklich als Treiber des Verteilnetz-Sockels. Wirklich
fEE-spezifisch sind die HGÜ-Nord-Süd-Korridore und die Offshore-Anbindung —
zusammen die Mehrheit des Budgets, aber nicht das Ganze. Der Mittelwert liegt
deshalb **unter der Hälfte**; 0,20/0,60 sind die ausgewiesene Sensitivität.

### 2.3 Sensitivität (deterministisch, €/MWh)

| Sockelquote a | Kostenmin. | 80 % EE + Gas | **Abstand** | Kostenmin. + CCS | Gas + CCS | **Abstand** | Netz Kostenmin. |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0,00 (= v0.2b) | 152,34 | 154,62 | **−2,27** | 162,86 | 182,75 | **−19,89** | 23,18 |
| 0,20 | 155,69 | 155,72 | −0,03 | 166,21 | 183,85 | −17,64 | 26,53 |
| **0,40 (Modell)** | **159,05** | **156,83** | **+2,22** | **169,56** | **184,96** | **−15,40** | **29,88** |
| 0,60 | 162,40 | 157,94 | +4,46 | 172,91 | 186,07 | −13,15 | 33,23 |
| 1,00 (voll mixunabhängig) | 169,10 | 160,15 | +8,95 | 179,62 | 188,28 | −8,66 | 39,94 |

**Der Vorwurf ist damit beantwortet, aber nicht verschwunden — und das gehört
klar gesagt.** Die Netzregel trägt jetzt **6,7 statt 11,2 €/MWh** zum
Kernkraft-Vorsprung bei (Übertragungsnetz 10,07 gegen 16,80 €/MWh). Weil der
Vorsprung selbst gleichzeitig schrumpft, sinkt der *Anteil* aber nur von 62 %
auf **58 %** des Median-Vorsprungs (6,7 von 11,7 €/MWh) bzw. auf **44 %** des
deterministischen Abstands (6,7 von 15,4). Der Sockel selbst kostet das
CCS-Paar 4,5 €/MWh Vorsprung (19,9 → 15,4 deterministisch). **Die Aussage
„ein erheblicher Teil des Vorsprungs ist die Netzregel, nicht die Technologie"
bleibt also richtig und muss weiter neben der Zahl stehen** — nur mit
6,7 statt 11,2.

Die Setzung bewegt den offenen Vergleich über die ganze Breite von
−2,3 bis +4,5 €/MWh und ist damit der einzige Parameter des Modells, der die
Rangfolge Kernkraft ↔ Gas allein durch seine Wahl dreht — genau das steht
jetzt in `limitations.grid_transmission_socket_assumption` (severity **hoch**)
sowie je Preset als `detail.netz.socket_effect_eur_mwh` im Ergebnis:

| Preset | Sockel-Effekt €/MWh |
|---|---:|
| Kostenminimum (± CCS) | **+6,70** |
| 80 % EE + Gas (± CCS) | +2,21 |
| 80 % EE + H₂ | +1,13 |
| 100 % Erneuerbare | 0,00 (gedeckelt) |

---

## 3 · Fix 2 · Gemeinsame Rohstoff- und Definitionsziehungen

**Befund** (Versorger-Review R2, N2): `gas_ccgt.fuel_eur_mwh_th` und
`gas_ccs.fuel_eur_mwh_th` waren beide Dreieck(20/35/60) und wurden als **zwei
unabhängige Ziehungen** geführt — derselbe physische Rohstoff am selben
Handelsplatz. In einer Ziehung konnte das GuD 20 €/MWh_th zahlen und die
CCS-Anlage 60. Dasselbe beim CAPEX: `gas_ccs` ist im Datensatz *definitorisch*
Faktor 1,9/2,0/2,2 auf den GuD-CAPEX, wurde aber als eigenständige
Absolutverteilung gezogen.

**Umsetzung.** Neuer Datensatz-Parameter
`technologies.gas_ccs.params.capex_factor_on_ccgt` (1,9/2,0/2,2) und eine
maschinenlesbare Kopplungsliste `SHARED_LINKS` in `monte_carlo.py`, die auch im
Output steht (`monte_carlo_reference.json → shared_links`,
`story_data.shared.monte_carlo.meta.shared_links`):

| Ziel | Quelle | Modus |
|---|---|---|
| `gas_ccs.fuel_eur_mwh_th` | `gas_ccgt.fuel_eur_mwh_th` | **copy** — eine Ziehung, beide Technologien |
| `gas_ccs.capex_eur_kw` | `gas_ccgt.capex_eur_kw` × `capex_factor_on_ccgt` | **factor** — der Faktor wird gezogen, nicht der Absolutwert |

Der Ziehungsplan schrumpft dadurch von **30 auf 29** Größen (zwei Einträge
fallen weg, der Faktor kommt hinzu). Die verlinkten Felder verbrauchen keine
Zufallszahl.

**Der `draw_plan` wurde auf weitere solche Paare geprüft** — Ergebnis im Code
dokumentiert:

- **Wirkungsgrade werden überhaupt nicht gezogen** (weder `efficiency` noch
  `efficiency_lhv` stehen in `DRAW_FIELDS`; `meta.assumptions` führt sie
  ausdrücklich unter „nicht variiert"). Es gibt hier also nichts zu koppeln —
  der Wirkungsgradverlust der Abscheidung ist deterministisch 8 pp. *Das ist
  zugleich eine offene Flanke: Würden Wirkungsgrade gezogen, müssten
  `gas_ccgt.efficiency` und `gas_ccs.efficiency` zwingend gekoppelt sein
  (η_ccs = η_ccgt − Penalty). Der Kopplungsmechanismus liegt jetzt bereit.*
- `opex_pct` und `lifetime_years` von `gas_ccgt`/`gas_ccs` stammen aus derselben
  Dossier-Zeile. `opex_pct` wird gezogen und bleibt bewusst **unabhängig**: Der
  Betriebsaufwand einer Abscheidungsinsel (Solvent, Kompression, Wartung) ist ein
  anderer Kostenblock als der eines GuD, keine geteilte Rohstoff- oder
  Definitionsgröße. `lifetime_years` wird nicht gezogen.
- PV, Wind und Kernkraft teilen keine im Datensatz belegte gemeinsame
  Rohstoffgröße. Eine Korrelation wäre dort eine Setzung und bleibt deshalb aus
  — so steht es auch unverändert in `meta.assumptions`.

**Wirkung.** Klein im Median (−0,5 bis +0,9 €/MWh, siehe 1.2/1.3), aber genau
dort spürbar, wo v0.2b es versprochen hatte: Die publizierte Zeile
**„CCS-Variante teurer als ihr Basis-Preset: 99,9 / 99,6 %"** steht jetzt bei
**100,0 / 100,0 %** in `base` — die fehlenden Zehntel waren tatsächlich ein
Artefakt der Doppelziehung, wie der Gutachter vermutet hatte, kein Befund. Nur
in den beiden CO₂-Läufen bleibt der Gas-Wert mit 99,8 bzw. 99,9 % knapp darunter,
und das ist dort sachlich richtig: Ein sehr hoher gezogener CO₂-Preis kann die
gesparten CO₂-Kosten der Abscheidung über den CCS-Aufschlag heben.

---

## 4 · Fix 3 · Überschreitungs-Konsistenz und Monotonie

**Befund** (Nuklear-Review R2, N1 + N2): Die Interpolation des
`overrun_applicable_share` zwischen 1,0 (7.500) / 1,0 (12.000) / 0,0 (17.500)
erzeugte im Überschreitungs-Lauf ein **Zelt mit Spitze auf dem Modus**:

```
 7.500 →  22.112        14.000 →  24.691
 9.750 →  25.098        15.500 →  22.264
12.000 →  26.400  ←max  17.500 →  17.500
```

55 % aller Ziehungen lagen auf dem fallenden Ast; der Szenariensatz `guenstig`
war unter Überschreitung 26 % teurer als `teuer`. Dazu die Restdoppelzählung: Die
unteren Anker tragen laut ihren *eigenen* Datensatz-Notizen bereits realisierte
Eskalation (EPR2 +40 %, Sizewell C +90 %), bekamen aber den vollen Faktor obendrauf.

### 4.1 Die neue Regel: eine Schätzbasis, ein absoluter Aufschlag

```
capex_eff = CAPEX · (1 + IDC_brutto · idc_share(CAPEX))
          + (f − 1) · overrun_estimate_base · overrun_share(CAPEX)
```

mit `overrun_estimate_base_eur_kw` = **7.500 €/kW** (der einzige saubere
Vor-Eskalations-Schätzanker: EPR2-Programm 7.583 OCC, Dukovany II 7.906 EPC).
Der Aufschlag ist damit ein **absoluter Betrag auf genau einer Schätzbasis**,
nicht mehr ein Faktor auf den jeweils gezogenen CAPEX. Der Bauzins wird auf den
Überschreitungsbetrag **nicht** zusätzlich gelegt — die zugrunde liegenden
Eskalationsangaben (Sizewell C +90 % bis FID, HPC 48,7 Mrd. GBP laufende Preise)
sind Gesamtprojektwerte inklusive Finanzierung.

### 4.2 Die Rest-Overrun-Anteile — hergeleitet, nicht gesetzt

Enthält ein Anker bereits die Eskalation *e* gegenüber seiner Erstschätzung,
bleibt vom Faktor *f* nur *f/e*; als Anteil am vollen Aufschlag:
**s = (f/e − 1) / (f − 1)** mit f = 2,20 (Flyvbjerg).

| Stützstelle | Anker (Datensatz-Notizen) | realisierte Eskalation e | s (gerechnet) | **angesetzt** |
|---|---|---:|---:|---:|
| min 7.500 | EPR2-Programm-OCC („seit 2022 bereits +40 %, vor Baubeginn") | 1,40 | 0,476 | **0,48** |
| | Dukovany II (unterschriebener **Festpreis**-EPC) | — | ≈ 0 | *nicht angesetzt* |
| mid 12.000 | Lubiatowo (reine Planzahl, keine realisierte Eskalation) | 1,00 | 1,000 | |
| | Sizewell C („Erstschätzung 2020 20 Mrd. GBP → +90 % bis FID") | 1,90 | 0,132 | |
| | EPR2 inkl. Finanzierung | 1,40 | 0,476 | |
| | *Mittel der drei* | | *0,536* | **0,50** |
| max 17.500 | Hinkley Point C, laufende Preise = realisiertes Ist | — | 0,000 | **0,00** |

Zwei bewusste Abweichungen, beide **zulasten** der Kernkraft bzw.
ergebnisneutral und beide dokumentiert:

1. Dukovany II ist ein Turnkey-Festpreis — der Faktor hat dort konzeptionell
   nichts verloren, der Vertrag *ist* die Risikoallokation. Das würde den
   min-Anteil unter 0,48 drücken. **Nicht angesetzt** (konservative Richtung).
2. Der mid-Anteil wird von 0,536 auf **0,50 abgerundet**, damit die Abbildung
   über den **gesamten** Faktor-Support (bis 2,40) monoton bleibt. Preis der
   Rundung: 0,036 × 1,2 × 7.500 = **324 €/kW** weniger effektiver CAPEX am
   mid-Anker (rund 2 % — entlastet die Kernkraft geringfügig, ist als Rundung
   im Parameter-`note` benannt).

### 4.3 Monotonie — verifiziert mit Testvektor und Assertion

Neue Abbildung bei WACC 5 % (Werte aus `data/test_vectors.json`,
`capex_eff_monotonic_nuclear_*`):

| gezogener CAPEX | f = 1,00 (Basis) | f = 2,20 (Modus) | f = 2,40 (Obergrenze) |
|---:|---:|---:|---:|
| 7.500 | 10.051 | **14.371** *(v0.2b: 22.112)* | 15.091 |
| 9.750 | 11.408 | 15.818 *(25.098)* | 16.553 |
| 12.000 | 12.000 | 16.500 *(26.400)* | 17.250 |
| 14.000 | 14.000 | 16.864 *(24.691)* | 17.341 |
| 15.500 | 15.500 | 17.136 *(22.264)* | 17.409 |
| 17.500 | 17.500 | 17.500 *(17.500)* | 17.500 |

**Monoton steigend in jeder Spalte.** Verifiziert auf drei Wegen:

1. **Testvektor** `capex_eff_monotonic_nuclear_base` /
   `_overrun` / `_overrun_max` in `data/test_vectors.json` — je 10 Stützpunkte
   mit Anteilen und Effektivwert, plus das Flag `monotonic: true`. Der JS-Port
   rechnet sie nach **und** prüft die Monotonie-Eigenschaft eigenständig.
2. **Assertion** in `export_test_vectors.py`: bricht den Export ab, wenn die
   Abbildung fällt.
3. **Test (e1)** in `validate_model.py` über **221 Stützpunkte × 4 Faktoren
   × 3 WACC-Stützstellen** (Bericht: `research/validierung_modell.md`).

**Ein Altbefund wird dabei sichtbar und ist ausdrücklich benannt.** Bei WACC 9 %
ist die Abbildung schon **ohne jede Überschreitung** (Faktor 1,00) nicht monoton
— kleinster Schritt −36,31 €/kW gegen −34,19 mit Faktor 2,40. Ursache ist nicht
die Überschreitung, sondern die Kostenabgrenzung der CAPEX-Anker selbst: Der
Overnight-Anker 7.500 trägt bei 9 % WACC und 12 a Bauzeit +67,7 % Bauzins und
landet bei 12.578 €/kW — **oberhalb** des Gesamtprojekt-Ankers 12.000, dessen
Finanzierungsanteil bei rund 5 % gebildet wurde. Die Anker sind WACC-abhängig,
das Modell behandelt sie als fest. Betroffen sind die Konfigurationen `wacc`,
`wacc_co2`, `wacc_overrun` und `asia_wacc` in dem Teil der Ziehungen mit WACC
über rund 8,2 % (bei Dreieck 3/5/9 % etwa **2,7 %** der Ziehungen). Die
Validierung führt deshalb zwei getrennte Kriterien: (i) beim Basis-WACC volle
Monotonie über den ganzen Faktor-Support — **erfüllt**; (ii) bei jedem WACC darf
die Überschreitung die Monotonie nicht verschlechtern — **erfüllt**. Die saubere
Lösung (alle drei Anker auf eine gemeinsame Overnight-Abgrenzung, Bauzins
einheitlich; bei 5 % WACC ergebnisneutral) ist Nuklear-N1 Vorschlag 1a und
**nicht Teil dieses Auftrags** — sie steht in Abschnitt 7 als offener Punkt.

### 4.4 Wirkung

Effektive CAPEX-Verteilung im Überschreitungs-Lauf (200.000 Ziehungen,
Dreieck 7.500/12.000/17.500 × Dreieck 1,30/2,20/2,40, WACC 5 %):

| | p5 | **p50** | p95 | Mittel | Max |
|---|---:|---:|---:|---:|---:|
| gezogener CAPEX | 8.991 | 12.260 | 15.849 | 12.336 | — |
| **eff. v0.2c** | **13.836** | **15.941** | **17.133** | 15.771 | 17.496 |
| eff. v0.2b | 18.060 | 22.770 | 26.729 | 22.614 | 28.716 |

Der Median-Effektiv-CAPEX fällt um **30 %** (22.770 → 15.941 €/kW); der
effektive Faktor auf den gezogenen CAPEX sinkt von 1,86 auf **1,30**. Die
absurde Eigenschaft, dass der Median 32 % *über* dem teuersten je gebauten
Reaktor lag (HPC 17.264 €/kW nominal), ist weg: Die Verteilung liegt jetzt
vollständig **unterhalb** des realisierten westlichen Ist-Maximums. Das ist die
inhaltliche Aussage des Fixes — mehr gibt die Empirie nicht her, wenn man sie
nur **einmal** anwendet.

---

## 5 · Fix 4 · Die CCS-Massenbilanz

**Befund** (Versorger R2 N7, Peer-Review R2 N2): Abgeschiedene Menge und
Restemission wurden aus zwei getrennten Größen gebildet und summierten sich auf
**116 % des Brennstoffeintrags**:

| Position | v0.2b, t CO₂/MWh_el bei η = 0,52 |
|---|---:|
| Brennstoffeintrag (0,2418 / 0,52) | 0,4650 |
| davon abgeschieden (× 0,90), bepreist mit 80 €/t | 0,4185 |
| Restemission (unabhängiger Datensatzwert), bepreist mit 75 €/t | 0,1200 |
| **Summe verbucht** | **0,5385 = 116 %** |

### 5.1 Eine Bilanz statt zweier Größen

`model.ccs_balance()` (JS: `ccsBalance()`) zerlegt den Eintrag in den
abscheidbaren Verbrennungsteil und die nicht abscheidbare Vorkette:

```
input     = emission_factor_t_mwh_th / η
vorkette  = input · upstream_share_of_lifecycle
captured  = (input − vorkette) · capture_rate
residual  = (input − vorkette) · (1 − capture_rate) + vorkette
⇒ captured + residual = input                       (exakt, für jede Ziehung)
```

**Der Vorkettenanteil ist kalibriert, nicht erfunden.** Er ist genau so gewählt,
dass die belegte Restemission von 0,120 t/MWh_el (49/120/220 g/kWh aus
`risiken_co2.md` 1.2) bei den Zentralwerten **exakt** herauskommt:

```
v = (0,1200 / 0,4650 − (1 − 0,90)) / 0,90 = 0,175627
```

Rund **17,6 %** Vorkettenanteil liegt im üblichen Bereich für
Erdgas-Lebenszyklusfaktoren. Damit ist die Kopplung hergestellt, die der Auftrag
verlangt: **Die `capture_rate`-Ziehung bewegt beide Seiten.** Steigt die
Abscheiderate, steigt die eingelagerte Menge *und* sinkt die Restemission —
konsistent, nicht unabhängig.

### 5.2 Wirkung

| Größe | v0.2b | **v0.2c** | Δ |
|---|---:|---:|---:|
| abgeschieden t/MWh_el (Zentralwerte) | 0,4185 | **0,3450** | −17,6 % |
| Restemission t/MWh_el | 0,1200 | **0,1200** | ±0 (Kalibrierung) |
| Summe / Eintrag | **116 %** | **100,0 %** | Bilanz geschlossen |
| CCS-Kette €/MWh_el | 33,48 | **27,60** | −5,88 |
| eingelagert Kostenminimum + CCS, Mt/a | 29,0 | **23,9** | −5,1 |
| eingelagert 80 % EE + Gas + CCS, Mt/a | **110,6** | **91,2** | **−19,4** |
| Systemkosten Kostenminimum + CCS | — | — | **−0,43 €/MWh** |
| Systemkosten 80 % EE + Gas + CCS | — | — | **−1,64 €/MWh** |

Der Effekt auf das entscheidende CCS-Paar beträgt **1,21 €/MWh** zulasten des
Kernkraft-Vorsprungs (der Gas-Pfad trägt 264,4 TWh Gasarbeit gegen 69,2 TWh).
Das ist die vom Auftrag erwartete Größenordnung („~2 €/MWh").

**Testvektoren** (neu, `data/test_vectors.json → ccs_balance`): vier Fälle über
die Spannen von Wirkungsgrad und Abscheiderate, jeweils mit Eintrag, Vorkette,
abgeschiedener Menge und Restemission; der JS-Port prüft zusätzlich die
Bilanzlücke gegen 1e-10. Test (e2) in `validate_model.py` prüft alle 9
η × Rate-Kombinationen (maximale Bilanzlücke **5,6 · 10⁻¹⁷** t/MWh_el) plus die
Kalibrierung gegen den Dossier-Wert (Abweichung **0,0001 %**).

Spanne der Restemission, die die Bilanz erzeugt: **0,087–0,157** t/MWh_el gegen
die dokumentierte Bandbreite 0,049–0,220. Die Bilanz ist also enger als das
Dossier-Band — das ist der Preis der Konsistenz und im Parameter-`note` benannt.
Die Limitation `ccs_residual_is_lifecycle` ist entsprechend neu formuliert: Der
Eintrag bleibt ein Lebenszyklus-Faktor, die Bilanz ist geschlossen, der
Vorkettenanteil ist kalibriert und nicht eigenständig belegt.

---

## 5b · Fix 5 · Der White-Paper-LCOE-Regler

**Befund** (Nuklear-Review R2, N5): `computeLcoeRows()` multiplizierte den CAPEX
**nach** `resolveTech` mit dem Reglerfaktor. `idc_applicable_share` und
`overrun_applicable_share` waren zu diesem Zeitpunkt bereits aus der
**Szenario**-Stützstelle aufgelöst und folgten dem Regler nicht. Damit lebten
beide Fehler aus K1 im interaktiven Teil weiter, nur mit vertauschten Vorzeichen.

**Umsetzung** (nur dieser Rechenpfad, keine Texte): Nach dem Skalieren wird der
Zeilen-CAPEX durch `scopeShareForCapex()` geschickt und beide Anteile im `flat`
überschrieben — identisch zur Monte-Carlo-Rechnung und zu
`model.scope_share_for_capex`.

**Gegenprobe im Node-Harness** (Fokus-Technologie Kernkraft, WACC 5 %):

| Reglerwert | Zeile | idc_share | overrun_share | capex_eff | LCOE €/MWh |
|---:|---|---:|---:|---:|---:|
| 7.500 | günstig | 1,00 | 0,48 | 6.282 | 68,7 |
| | **mittel** | **1,00** *(v0.2b: 0,00)* | 0,48 | **10.051** *(7.500)* | **108,8** |
| | teuer | 0,236 | 0,495 | 11.816 | 134,9 |
| 12.000 | günstig | 1,00 | 0,48 | 10.051 | 93,6 |
| | mittel | 0,00 | 0,50 | 12.000 | 122,5 |
| | teuer | 0,00 | 0,00 | 17.500 | 174,9 |
| 17.500 | **günstig** | **0,236** *(v0.2b: 1,00)* | 0,495 | **11.816** | **105,3** |
| | mittel | 0,00 | 0,00 | 17.500 | 161,3 |
| | teuer | 0,00 | 0,00 | 25.521 | 231,4 |

Die beiden von N5 benannten Fehlerfälle sind geschlossen: Ein Overnight-Wert von
7.500 €/kW bekommt in der Zeile „mittel" jetzt seine Bauzinsen (+34 %), und ein
auf 17.500 gezogener Wert bekommt in der Zeile „günstig" nicht mehr die vollen
+34 % obendrauf. **Anzeige und Rechnung stimmen jetzt überein.** Der Hinweistext
`#lc-idc-hint` meldet weiterhin den **Brutto**-Aufschlag ohne Anteil und
widerspricht damit der Rechnung darunter — das ist eine Textstelle und steht in
Abschnitt 6 auf der Redigat-Liste (N5 Vorschlag 2).

---

## 6 · Neue Szenario-Tabelle und Rangwahrscheinlichkeiten

### 6.1 Deterministische Punktwerte und freie Dispatch-Größen

| Szenario | Punktwert €/MWh (v0.2b → **v0.2c**) | Mt CO₂/a | eingelagert Mt/a (v0.2b → **v0.2c**) | Gas TWh/a | Abregelung TWh/a | ungedeckt TWh/a |
|---|---:|---:|---:|---:|---:|---:|
| GES · Kostenminimum | 152,3 → **159,0** | 27,9 | – | 69,2 | 64,7 | 0,00 |
| GES · Kostenminimum + CCS | 163,3 → **169,6** | 8,3 | 29,0 → **23,9** | 69,2 | 64,7 | 0,00 |
| GES · 80 % EE + Gas | 154,6 → **156,8** | 106,5 | – | 264,4 | 140,9 | 0,00 |
| GES · 80 % EE + Gas + CCS | 184,4 → **185,0** | 31,7 | 110,6 → **91,2** | 264,4 | 140,9 | 0,00 |
| GES · 80 % EE + H₂ | 198,4 → **199,5** | 4,8 | – | 11,9 | 12,1 | 4,58 |
| GES · 100 % Erneuerbare | 245,2 → **245,2** | 1,3 | – | 3,2 | 377,6 | 1,29 |
| *Ist 2025 (Referenzsystem)*¹ | *180,8 → **180,8*** | *136,0* | – | *148,1* | *6,2* | *0,00* |

¹ Weiterhin **nicht ranking-fähig** (andere Netz-Systemgrenze).

**Kostenkomponenten v0.2c (€/MWh, deterministisch):**

| Szenario | PV | Wind on | Wind off | Kernkraft | Gas-Backup | Batterie | Elektrolyse | H₂-Speicher | H₂-Turbine | **Netz** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Kostenminimum | 2,6 | 6,6 | 5,0 | 99,5 | 15,5 | 0,0 | 0,0 | 0,0 | 0,0 | **29,9** |
| Kostenminimum + CCS | 2,6 | 6,6 | 5,0 | 99,5 | 26,1 | 0,0 | 0,0 | 0,0 | 0,0 | **29,9** |
| 80 % EE + Gas | 12,7 | 31,9 | 24,3 | 0,0 | 47,7 | 3,5 | 0,0 | 0,0 | 0,0 | **36,6** |
| 80 % EE + Gas + CCS | 12,7 | 31,9 | 24,3 | 0,0 | 75,8 | 3,5 | 0,0 | 0,0 | 0,0 | **36,6** |
| 80 % EE + H₂ | 12,8 | 32,1 | 24,4 | 0,0 | 4,5 | 3,6 | 24,4 | 47,5 | 11,8 | **38,4** |
| 100 % Erneuerbare | 22,8 | 57,4 | 43,7 | 0,0 | 3,7 | 5,3 | 38,9 | 20,1 | 13,3 | **40,0** |
| *Ist 2025* | *10,2* | *15,3* | *5,0* | *0,0* | *43,1* | *3,2* | – | – | – | ***93,0*** (+ Kohle-CO₂ 11,0) |

### 6.2 P50 [P5–P95] über alle acht Konfigurationen — alt gegen neu

**v0.2b (zum Vergleich):**

| Preset | base | wacc | co2 | wacc_co2 | overrun | wacc_overrun | asia | asia_wacc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| *Ist 2025* | *183 [174–192]* | *186 [174–200]* | *202 [173–247]* | *207 [173–253]* | *187 [177–196]* | *189 [177–206]* | *183 [174–191]* | *185 [173–200]* |
| Kostenminimum | 158 [147–180] | 170 [135–221] | 161 [148–183] | 172 [139–226] | 222 [193–248] | 237 [179–320] | 108 [100–118] | 114 [95–143] |
| Kostenminimum + CCS | 170 [157–191] | 183 [147–236] | 171 [157–192] | 183 [148–237] | 235 [204–262] | 250 [191–336] | 121 [111–131] | 126 [105–158] |
| 80 % EE + Gas | 157 [145–169] | 165 [139–200] | 166 [149–188] | 174 [143–217] | 168 [155–181] | 175 [147–215] | 157 [145–169] | 164 [140–200] |
| 80 % EE + Gas + CCS | 188 [171–210] | 198 [166–241] | 192 [173–210] | 201 [168–245] | 202 [182–223] | 212 [176–262] | 189 [171–209] | 196 [165–242] |
| 80 % EE + H₂ | 198 [188–209] | 207 [179–246] | 199 [188–209] | 207 [178–247] | 207 [196–219] | 215 [186–257] | 198 [188–209] | 206 [180–245] |
| 100 % Erneuerbare | 244 [228–262] | 258 [217–313] | 244 [227–262] | 256 [214–316] | 259 [240–277] | 269 [226–331] | 245 [227–263] | 256 [217–312] |

**v0.2c (neu):**

| Preset | base | wacc | co2 | wacc_co2 | overrun | wacc_overrun | asia | asia_wacc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| *Ist 2025*¹ | *183 [174–192]* | *186 [173–200]* | *201 [171–246]* | *203 [171–249]* | *186 [177–195]* | *190 [178–206]* | *183 [174–192]* | *185 [173–200]* |
| Kostenminimum | **165 [154–186]** | **177 [139–229]** | **167 [154–189]** | **180 [142–231]** | **189 [175–202]** | **201 [160–261]** | **115 [106–125]** | **122 [100–154]** |
| Kostenminimum + CCS | **176 [164–197]** | **188 [150–244]** | **176 [163–198]** | **189 [151–243]** | **201 [186–215]** | **214 [170–275]** | **126 [116–137]** | **133 [110–168]** |
| 80 % EE + Gas | **159 [148–171]** | **167 [141–204]** | **168 [150–190]** | **176 [145–214]** | **170 [156–183]** | **180 [152–218]** | 160 [147–172] | 168 [140–205] |
| 80 % EE + Gas + CCS | **189 [172–206]** | **199 [165–244]** | 192 [174–210] | 200 [167–244] | 202 [184–221] | 213 [179–260] | 189 [171–206] | 198 [165–241] |
| 80 % EE + H₂ | **200 [189–210]** | 208 [179–247] | 200 [190–211] | 209 [181–246] | 208 [197–220] | 218 [189–259] | 199 [189–211] | 207 [180–247] |
| 100 % Erneuerbare | 245 [228–263] | 257 [215–314] | 244 [228–264] | 258 [216–311] | 258 [239–277] | 272 [229–331] | 245 [227–263] | 256 [216–313] |

¹ weiterhin nicht ranking-fähig.

**Die Spreizung der Zukünfte schrumpft:** von 152–245 auf **157–245 €/MWh**
deterministisch. Die vier Zukünfte liegen enger beieinander als vorher, weil der
Netz-Sockel die niedrig-fEE-Pfade anhebt und den 100-%-Pfad nicht berührt.

### 6.3 Rangwahrscheinlichkeiten P(A < B) — alt gegen neu

| Paar | | base | wacc | co2 | wacc_co2 | overrun | wacc_overrun | asia | asia_wacc |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **Kernkraft < Gas** (ohne CCS) | v0.2b | 44,9 | 34,8 | 64,3 | 55,5 | 0,0 | 0,2 | 100 | 100 |
| | **v0.2c** | **25,7** | **22,2** | **50,9** | **40,1** | **3,2** | **5,1** | **100** | **100** |
| **Kernkraft+CCS < Gas+CCS** | v0.2b | 90,3 | 84,7 | 93,3 | 87,3 | 4,3 | 4,6 | 100 | 100 |
| | **v0.2c** | **82,2** | **75,7** | **86,3** | **78,1** | **56,5** | **45,6** | **100** | **100** |
| Kernkraft+CCS < 80 % EE + H₂ | v0.2b | 98,1 | 93,2 | 97,0 | 93,9 | 9,9 | 7,7 | 100 | 100 |
| | **v0.2c** | **95,8** | **88,4** | **94,3** | **88,9** | **77,9** | **59,6** | 100 | 100 |
| Gas+CCS < 80 % EE + H₂ | v0.2b | 78,2 | 78,1 | 71,0 | 69,5 | 68,5 | 60,4 | 79,2 | 75,5 |
| | **v0.2c** | **87,4** | **82,5** | **79,5** | **76,1** | **73,4** | **68,6** | **86,3** | **84,4** |
| Kernkraft+CCS < 100 % EE | v0.2b | 100 | 100 | 100 | 100 | 87,0 | 76,8 | 100 | 100 |
| | **v0.2c** | 100 | 100 | 100 | 100 | **100** | **100** | 100 | 100 |
| Gas+CCS < 100 % EE | beide | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 |
| CCS-Variante teurer als ihr Basis-Preset (Kernkraft / Gas) | v0.2b | 99,9 / 99,6 | 100 / 100 | 98,1 / 96,6 | 98,8 / 97,2 | 100 / 99,9 | 100 / 100 | 100 / 100 | 100 / 99,8 |
| | **v0.2c** | **100 / 100** | **100 / 100** | **100 / 99,8** | **100 / 99,9** | **100 / 100** | **100 / 100** | **100 / 100** | **100 / 100** |

**Median-Δ der beiden Kernpaare (A − B, €/MWh):**

| Paar | | base | wacc | co2 | wacc_co2 | overrun | wacc_overrun | asia | asia_wacc |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Kernkraft − Gas | v0.2b | +1,4 | +5,2 | −4,5 | −2,6 | +53,3 | +60,5 | −48,4 | −50,0 |
| | **v0.2c** | **+6,4** | **+10,0** | **−0,6** | **+3,9** | **+18,2** | **+22,3** | **−44,4** | **−44,9** |
| Kernkraft+CCS − Gas+CCS | v0.2b | −18,2 | −15,6 | −19,8 | −17,8 | +32,1 | +37,8 | −68,5 | −70,8 |
| | **v0.2c** | **−11,7** | **−9,3** | **−14,5** | **−11,2** | **−1,6** | **+1,7** | **−62,9** | **−64,2** |

**`decided`-Status (≥ 95 % in eine Richtung) der beiden Kernpaare:**

| Konfiguration | Kernkraft < Gas | P5 … P95 der Differenz | Kernkraft+CCS < Gas+CCS | P5 … P95 |
|---|---|---|---|---|
| base | 25,7 % — **offen** | −8,5 … +27,7 | 82,2 % — **offen** | −28,3 … +10,4 |
| wacc | 22,2 % — offen | −8,0 … +38,3 | 75,7 % — offen | −27,8 … +18,2 |
| co2 | 50,9 % — offen | −20,0 … +23,8 | 86,3 % — offen | −31,8 … +8,7 |
| wacc_co2 | 40,1 % — offen | −19,5 … +31,4 | 78,1 % — offen | −30,8 … +15,3 |
| overrun | 3,2 % — **entschieden gegen Kernkraft** | +2,2 … +33,8 | 56,5 % — **offen (Münzwurf)** | −19,3 … +16,3 |
| wacc_overrun | 5,1 % — offen (knapp) | −0,1 … +51,1 | 45,6 % — offen (Münzwurf) | −20,3 … +30,0 |
| asia | 100 % — entschieden | −55,8 … −31,5 | 100 % — entschieden | −75,6 … −47,9 |
| asia_wacc | 100 % — entschieden | −59,8 … −31,9 | 100 % — entschieden | −83,0 … −48,5 |

### 6.4 CO₂-Sensitivität und Kipppunkt — die größte einzelne Verschiebung

| CO₂ €/t | Ist 2025 | Kostenmin. | Kostenmin.+CCS | 80 % EE + Gas | Gas + CCS | 80 % EE + H₂ | 100 % EE |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 161,2 | **156,8** *(v0.2b 150,1)* | **168,9** *(162,6)* | **148,4** *(146,2)* | **182,5** *(181,9)* | **199,1** *(198,0)* | 245,1 |
| 75 | 180,8 | **159,0** *(152,3)* | **169,6** *(163,3)* | **156,8** *(154,6)* | **185,0** *(184,4)* | **199,5** *(198,4)* | 245,2 |
| 350 | 252,8 | **167,1** *(160,4)* | **172,0** *(165,7)* | **187,7** *(185,5)* | **194,1** *(193,6)* | **200,9** *(199,8)* | 245,5 |
| 990 | 420,2 | **185,9** *(179,2)* | **177,6** *(171,3)* | **259,4** *(257,2)* | **215,5** *(214,9)* | **204,1** *(203,0)* | 246,4 |

| Kipppunkt | v0.2b | **v0.2c** |
|---|---:|---:|
| deterministisch, Kernkraft vs. Gas (ohne CCS) | 47,5 €/t | **101,8 €/t** |
| über gepaarte Ziehungen (Median-Δ = 0), `base` | ≈ 90 €/t | **≈ 152 €/t** |
| Kernkraft+CCS vs. Gas+CCS | existiert nicht (Kernkraft führt ab 0 €/t) | **existiert nicht** (Δ = −13,6 bei 0 €/t, −62,9 bei 2.000) |

**Das ist die folgenschwerste Zahl des Patches.** Der ETS-1-Marktpreis von
74 €/t und der Modellwert 75 €/t liegen jetzt **unter** dem deterministischen
Kipppunkt. Die in `persona_synthese_r2.md` für das Redigat vorgesehene Pointe
(„der reale ETS-Preis liegt heute schon über der Basis-Kippmarke") **trägt nicht
mehr.** Die neue, ebenso erzählbare Aussage lautet: *Ohne Abscheidung braucht es
gut 100 € je Tonne, damit sich die Rangfolge dreht — mit Abscheidung auf beiden
Seiten führt der Kernkraft-Pfad bei jedem CO₂-Preis.*

### 6.5 CCS-Kennzahlen

| Größe | v0.2b | **v0.2c** |
|---|---:|---:|
| Δ durch CCS, Kostenminimum | +10,9 | **+10,5** |
| Δ durch CCS, 80 % EE + Gas | +29,8 | **+28,1** |
| implizite Vermeidungskosten Kostenminimum | 531 €/t | **510 €/t** |
| implizite Vermeidungskosten 80 % EE + Gas | 378 €/t | **357 €/t** |
| einzulagernde Menge Kostenminimum + CCS | 29,0 Mt/a | **23,9 Mt/a** |
| einzulagernde Menge 80 % EE + Gas + CCS | **110,6 Mt/a** | **91,2 Mt/a** |
| Backup-Volllaststunden (unverändert) | 1.282 / 1.930 | 1.282 / 1.930 |

---

## 7 · Validierung, Reproduzierbarkeit, JS-Parität

| Test | Kriterium | Ergebnis |
|---|---|---|
| (a) **GES-LCOE-Reproduktion** | ± 2 % auf 4 Werte | **BESTANDEN**, max. Abweichung **0,04 %** — **unverändert gegenüber v0.1/v0.2/v0.2b** (PV 124,9 · Wind on 90,8 · Wind off 98,3 · Kernkraft 101,6) |
| (a2) Eigene Spannen vs. Fraunhofer ISE / Lazard | Überlappung | BESTANDEN |
| (b) Ist-2024-Check gegen die Profile | ± 5 % | BESTANDEN (max. 0,06 %) |
| (c) GES-Szenario-Test | Größenordnung | kostenminimum +14,7 %, ee80_gas −21,0 %, ee80_h2 −1,4 %, ee100 −10,3 % (bewegt sich mit Fix 1, siehe unten) |
| (d) Ist-2025-Plausibilisierung | Mix ± 10 %, Kostenniveau im Ist-Korridor | BESTANDEN (Anker 180,8 €/MWh, unverändert) |
| (e) **Strukturzusagen v0.2c** (neu) | capex_eff monoton, CCS-Bilanz geschlossen, Netz-Sockel wirksam | **BESTANDEN** |

**Zu (a) — das Hauptrisiko, ausdrücklich geprüft.** Die GES-Reproduktion rechnet
mit GES-Annahmen, `apply_idc=False` und explizit gesetzten Brennstoffkosten. Sie
ist von allen fünf Fixes **nicht** berührt: Fix 1 wirkt nur im Netzblock (in der
Reproduktion nicht enthalten), Fix 2 und 3 nur bei gezogenen bzw.
überschreitungs-behafteten Werten, Fix 4 nur bei Technologien mit
Abscheidung. Die vier Werte und die maximale Abweichung von **0,04 %** sind
bitidentisch zu v0.2b. **Vorgabe ±0,04 % eingehalten.**

**Zu (c) — bewegt sich, und das ist beabsichtigt.** Test (c) ist kein
Reproduktionstest, sondern ein Modelltest mit eigenem Netzblock; er zieht mit
dem Netz-Sockel nach (kostenminimum +9 % → +14,7 %).

**Reproduzierbarkeit.** Doppellauf der kompletten Kette in der Auftragsreihenfolge
(`consolidate_params → validate_model → export_test_vectors → monte_carlo →
build_page_data → build_story_data`) liefert **byteidentische** Dateien
(md5 über `model_params.json`, `page_data.json`, `test_vectors.json`,
`monte_carlo_reference.json`, `story_data.json`, `validierung_modell.md`).
Gegengeprüft wurde zusätzlich die Reihenfolge mit `build_page_data` vor
`monte_carlo` — identische Ausgaben.

**JS-Port.** `whitepaper-strommix.js` ist 1:1 nachgezogen: `ccsBalance`,
`ccsChain`, `emissionFactorEff`, `socketShare`, der additive
Überschreitungspfad in `lcoe`, der Netz-Sockel in `mixSystem` **und** in
`systemCostFromDispatch`, `MC_SHARED_LINKS` + `mcApplySharedLinks`,
`capex_factor_on_ccgt` in `MC_DRAW_FIELDS` und die Scope-Interpolation im
LCOE-Regler.

Selbsttest-Ergebnis im Browser:
**44 Testvektoren · 63 Monte-Carlo-Perzentile · 168 Rangwahrscheinlichkeiten —
0 Abweichungen** (Toleranz 0,5 %). Neu hinzugekommen sind 5 LCOE-Vektoren
(`lcoe_nuclear_overrun_mid`, `lcoe_nuclear_overrun_interp`,
`lcoe_gas_ccs_capture_max`, `lcoe_gas_ccs_capture_min`), 3 Monotonie-Vektoren
(`capex_eff`), 4 Massenbilanz-Vektoren (`ccs_balance`) und ein Mix-Vektor
(`mix_grid_no_socket`). Die **Rangwahrscheinlichkeits-Parität ist neu** — sie
hängt unmittelbar an der Ziehungsfolge und ist damit der eigentliche Prüfstein
für Fix 2 und Fix 3.

**Node-DOM-Harness** (echtes Chromium über playwright-core, lokaler
HTTP-Server): Beide Seiten booten **fehlerfrei** — keine Konsolenfehler, keine
Page-Errors, kein horizontaler Overflow bei 1280 px. (Die einzigen Meldungen
sind zwei blockierte Google-Fonts-Requests je Seite — Egress-Policy der Sandbox,
kein Codebefund.) Zusätzlich durchgeklickt: alle 7 Mix-Presets, alle 8
LCOE-Technologien, alle 8 Monte-Carlo-Konfigurationen — keine Fehler. Die
Mix-Presets im Browser reproduzieren die Python-Punktwerte exakt
(180,8 / 159,0 / 169,6 / 156,8 / 185,0 / 199,5 / 245,2).

---

## 8 · Was an Story und White Paper jetzt nicht mehr stimmt (Redigat-Liste)

**Nicht angefasst — das ist die Arbeitsliste für den nächsten Schritt.** Zahlen,
die per `data-v` bzw. aus `monte_carlo_reference.json` gebunden sind, ziehen
automatisch nach; die Prosa nicht. Vorrangig sind V1–V4.

### 8.1 Muss korrigiert werden — Aussage ist jetzt falsch

| # | Fundstelle | Was jetzt falsch ist | Neue Sachlage |
|---|---|---|---|
| **V1** | `research/story_claims_check.md` → `co2_sensitivity` (fließt über `build_story_data.py` in `story_data.json`) · Story Akt 4 / Schritt 3 · Story-Epilog · WP-Kap. 6 | `crossover_kernkraft_vs_gas_eur_t` = **47,5** und der Satz *„Der Modellwert von 75 Euro liegt bereits darüber"*. Beide Aussagen sind nach Fix 1 unzutreffend. Auch alle vier `levels`-Zeilen (0/75/350/990 €/t) sind veraltet. | Kipppunkt **101,8 €/t** deterministisch, **≈ 152 €/t** über gepaarte Ziehungen. Der ETS-Preis 74 €/t liegt jetzt **darunter**. Neue `levels` siehe 6.4. **Die in der Synthese geplante Pointe („realer ETS-Preis liegt schon über der Kippmarke") ist zu streichen, nicht umzuformulieren.** |
| **V2** | `story_claims_check.md` → `monte_carlo_headline.honest_statement` · Story Akt 4 / Schritt 3 + Zwischenruf · WP Executive Summary | *„152,3 … 154,6 … in 45 von 100 Fällen das günstigere"* und *„Auf gleichem Emissionsniveau … führt das Kernkraft-Szenario mit 90 Prozent"*. Beide Zahlenpaare veraltet; zusätzlich führt jetzt **der Gas-Pfad** im deterministischen Lauf. | **159,0 gegen 156,8 €/MWh**; **26 von 100** (25,7 %) ohne CCS; **82 von 100** (82,2 %) mit CCS auf beiden Seiten, Median-Vorsprung **11,7 €/MWh**. Der Beinahe-Gleichstand ist enger und liegt jetzt auf der anderen Seite. |
| **V3** | Story Akt 4 / Schritt 3 („0 %") · Story Akt 4 / Schritt 4 · WP-Kap. 6 Überschreitungs-Text | *„0 %"* für P(Kernkraft < Gas) im Überschreitungs-Lauf und *„4 %"* für das CCS-Paar. Beide Zahlen stammen aus der nicht-monotonen Abbildung mit Doppelzählung. | **3,2 %** ohne CCS; das CCS-Paar wird zum **Münzwurf: 56,5 %** (Median-Δ −1,6 €/MWh). Gegenüber dem H₂-Pfad kippt es von 9,9 % auf **77,9 %**. Die härteste Zahl der Story gegen die Kernkraft ist damit deutlich weicher — und belastbarer. |
| **V4** | Story Akt 4 / Schritt 5 · WP-Kap. 6 · `ccs_narrative` in `story_claims_check.md` | **110,6 Mt CO₂/a** Einlagerungsmenge (an mehreren Stellen als die anschaulichste Zahl des Kapitels geführt), **29,0 Mt/a**, Vermeidungskosten **531 / 378 €/t**, CCS-Aufschlag **+10,9 / +29,8 €/MWh**. | **91,2** bzw. **23,9 Mt/a**; Vermeidungskosten **510 / 357 €/t**; Aufschlag **+10,5 / +28,1 €/MWh**. Die Zerlegung des Aufschlags (Kapazität/Mehrbrennstoff/CCS-Kette/gesparte CO₂-Kosten) ist neu zu rechnen. |
| **V5** | WP-Kap. 3/5 und Story: Beschreibung der Netzregel („Übertragungsnetz skaliert mit der genutzten fEE-Energie", Sockel nur beim Verteilnetz) | Die Regel gilt nicht mehr in dieser Form. | Neue Regel beschreiben: **Übertragungsnetz = mixunabhängiger Sockel (Anteil 0,40, SETZUNG **M**, Sensitivität 0,20–0,60) mit dem Bedarf + fEE-getriebener Rest mit der genutzten fEE-Arbeit.** Die Quote ist die einzige Größe, die die Rangfolge Kernkraft ↔ Gas allein dreht (−2,3 bis +4,5 €/MWh, Tabelle 2.3). |
| **V6** | Versorger-Vorschlag: Fußzeile unter der Rangtabelle *„11 von 18 €/MWh des Vorsprungs stammen aus der Netzregel"* | Die Zahlen sind überholt, bevor der Satz geschrieben wurde. | **6,7 von 11,7 €/MWh (58 %)** des Median-Vorsprungs bzw. 6,7 von 15,4 (44 %) des deterministischen Abstands stammen aus der Netzregel. Der Satz bleibt richtig und nötig — nur mit den neuen Zahlen, und der Anteil ist nur wenig kleiner als vorher. |
| **V7** | Story Akt 4 / Schritt 2 („insgesamt **N** Größen", per `drawn_parameters` gebunden) und WP-Kap. 3/6 | Zieht automatisch von 30 auf **29** nach — der Fließtext erklärt aber nicht, warum die Zahl *sinkt*, obwohl ein Parameter hinzugekommen ist. | Kopplung erklären: Gaspreis einmal für beide Gas-Technologien, CCS-CAPEX als Faktor. **Das ist der didaktisch wertvollste neue Absatz** — er macht „gepaarte Ziehungen" an einem greifbaren Beispiel plausibel und beantwortet Versorger-N2 sichtbar. `shared_links` liegt maschinenlesbar bereit. |
| **V8** | Story-Limitationskarte „Parameter ziehen unabhängig" (bereits als R6 offen) | Jetzt zusätzlich unvollständig: es gibt zwei ausdrückliche Ausnahmen. | Umformulieren: unabhängig zwischen Parametern, **gepaart zwischen Szenarien**, und **gekoppelt bei Gaspreis und CCS-CAPEX**. |
| **V9** | WP `#lc-idc-hint`: *„Beim aktuellen WACC ergibt das für die Fokus-Technologie +34 % auf den CAPEX"* | Der Hinweis nennt den **Brutto**-Aufschlag ohne Anteil und widerspricht seit Fix 5 sichtbar der Rechnung darunter (bei CAPEX ≥ 12.000 werden 0 % angewendet). | Auf den **effektiven** Aufschlag umstellen und den Anteil ausweisen (Nuklear-N5 Vorschlag 2). Der Rechenpfad ist bereits korrigiert — nur der Text fehlt. |
| **V10** | Story Akt 4 / Schritt 4 und WP-Kap. 6: Beschreibung des Überschreitungsfaktors („Faktor 2,2 auf den CAPEX") | Die Anwendungsregel hat sich strukturell geändert. | Neu: Der Faktor wirkt **absolut auf einer Schätzbasis (7.500 €/kW)** und nur auf den **Rest-Anteil** der Eskalation (0,48/0,50/0,00), weil EPR2 bereits +40 % und Sizewell C +90 % realisiert haben. Effektiver Median-CAPEX **15.941 €/kW** statt 22.770; effektiver Faktor **1,30** statt 1,86. Nuklear-N9 („der effektive CAPEX wird berechnet und nirgends angezeigt") lässt sich hier in einem Halbsatz miterledigen. |

### 8.2 Wird jetzt erst erzählbar (neue Felder im Datensatz)

- **Sockel-Effekt je Szenario** — `monte_carlo.presets.*.grid_socket_effect_eur_mwh`
  (6,70 / 2,21 / 1,13 / 0,00 €/MWh) und
  `netzkosten_referenzen.uebertragung_sockelquote` samt vollem Begründungstext.
  Damit lässt sich die Setzung erzählen, **statt sie zu verstecken** — genau das,
  was N1 verlangt hat.
- **Kopplungsliste der Ziehungen** — `monte_carlo.meta.shared_links`.
- **Massenbilanz der Abscheidung** — `ccs_parameter.upstream_share_of_lifecycle`
  + `mass_balance_note`; im Modelloutput je Lauf
  `emissions.ccs_balance_t_mwh_el`, `emissions.gas_carbon_input_mt_co2_a` und
  `emissions.mass_balance_gap_mt_co2_a` (muss 0 sein).
- **Effektiver CAPEX und Überschreitungsaufschlag** —
  `lcoe().capex_effective_eur_kw`, `overrun_surcharge_eur_kw`, `overrun_mode`.
- **Drei neue maschinenlesbare Limitationen** —
  `grid_transmission_socket_assumption` (hoch),
  `overrun_estimate_base_assumption` (mittel), neu gefasste
  `ccs_residual_is_lifecycle`.

### 8.3 Aus der R2-Synthese unverändert offen (Redigat, nicht Zahlenkern)

Die Textpunkte der Synthese bleiben wie beschlossen bestehen — mit **einer**
Ausnahme: Der Punkt *„Kipppunkt 48 €/t … UND die unerzählte Pointe aussprechen:
der reale ETS-Preis (74 €/t) liegt heute schon über der Basis-Kippmarke"* ist
durch V1 **gegenstandslos** und muss aus der Redigat-Liste gestrichen werden.
Alle übrigen Punkte (natürliche Häufigkeiten, „auf gleichem Emissionsniveau"
durch das echte Paar ersetzen, Akt 4 entfrachten, 107 Mt gegen KSG 2045, K5
„Faktor 9", StromVKG-Name, M-Badge an 7.500 VLh, Auktions-Satz S4, …) sind vom
Patch nicht berührt — nur die konkreten Zahlen darin.

---

## 9 · Was v0.2c nicht leistet (offene Punkte)

| Punkt | Status |
|---|---|
| **WACC-Abhängigkeit der CAPEX-Anker** | Neu **sichtbar** gemacht (Test e1): Bei WACC über ~8,2 % überholt der bauzins-belastete Overnight-Anker den Gesamtprojekt-Anker; die Abbildung ist dort auch ohne Überschreitung nicht monoton. Betrifft ~2,7 % der Ziehungen in den WACC-Konfigurationen. Saubere Lösung: alle Anker auf eine gemeinsame Overnight-Abgrenzung (Nuklear-N1 Vorschlag 1a), bei 5 % WACC ergebnisneutral. **Nicht im Auftrag.** |
| **Sockelquote ist eine Setzung** | Bewusst so, mit Sensitivität und ausgewiesener Differenz. Eine belastbare Aufteilung existiert in keiner der geprüften Quellen. |
| **Vorkettenanteil ist kalibriert** | Er reproduziert die belegte Restemission exakt, ist aber keine eigenständige Quelle. Ein direkter Verbrennungs-Emissionsfaktor bleibt die bessere Lösung (`gaps.emissionsfaktor_direkt`). |
| **Wirkungsgrade werden nicht gezogen** | Deshalb war hier keine Kopplung nötig. Würden sie gezogen, müssten `gas_ccgt.efficiency` und `gas_ccs.efficiency` zwingend gekoppelt werden — der Mechanismus (`SHARED_LINKS`) liegt bereit. |
| **Netz-Investitionsvolumen wird nicht gezogen** | Nuklear-N4 unverändert offen: 328/328/392 Mrd. dokumentiert, gezogen wird nur der Überschreitungsfaktor. |
| **N = 1.000 Ziehungen** | Versorger-N10 unverändert offen: ±1,6 Prozentpunkte Standardfehler nahe 50 %. Die neuen Zahlen (25,7 % / 82,2 % / 56,5 %) sind davon genauso betroffen wie die alten. |
| **Technologiespezifischer WACC, Netz-Opex, VoLL, Optimierungsschritt, Volljahresprofil** | Alle unverändert offen (siehe `modell_v02_ergebnis.md` 5.3). |

---

## 10 · Ehrliches Fazit

Die vier Modell-Fixes wirken **nicht** in verschiedene Richtungen, sondern
überwiegend in dieselbe: Fix 1 verteuert das Kernkraft-Szenario um 6,7 €/MWh und
den Gas-Pfad nur um 2,2; Fix 4 verbilligt den Gas-CCS-Pfad um 1,6 und den
Kernkraft-CCS-Pfad nur um 0,4. Beide zusammen kosten das Kernkraft-Szenario den
knappen deterministischen Vorsprung und **6,5 Prozentpunkte** im entscheidenden
CCS-Paar. Fix 3 wirkt in die Gegenrichtung, aber nur in den
Überschreitungs-Konfigurationen — dort allerdings drastisch (−39 €/MWh).

**Die belastbare Aussage des Projekts ändert sich dadurch nicht, aber sie wird
präziser.** Sie lautete: Die Rangfolge dieser Szenarien wird nicht von der
Technologie entschieden, sondern von drei Setzungen — Emissionsnebenbedingung,
Institutionenrahmen, Überschreitungs-Empirie. Nach v0.2c kommt eine **vierte**
hinzu, und sie ist die unangenehmste, weil sie eine reine Modellsetzung ist: die
**Sockelquote des Übertragungsnetzes**. Sie bewegt den offenen Vergleich über
knapp 7 €/MWh — mehr als der gesamte Abstand zwischen den beiden führenden
Pfaden. Das steht jetzt im Datensatz, im Ergebnis je Szenario und in den
Limitationen, statt als unsichtbare Regel im Code.

**Was der Patch nebenbei zerstört hat:** die eleganteste geplante
Redigat-Pointe. Der CO₂-Kipppunkt liegt nicht mehr unter dem realen ETS-Preis,
sondern mit 102 €/t deutlich darüber. Das ist unbequem und muss trotzdem so
geschrieben werden — es ist dieselbe Sorte Selbstkorrektur, mit der v0.2 den
Gaspreis eingeführt und v0.2b den Emissions-Rabatt aufgedeckt hat.

**Und was er repariert hat, war echt:** Eine Abbildung, bei der ein teurerer
Reaktor billiger wurde. Eine Bilanz, die 116 % des eingesetzten Kohlenstoffs
verbuchte. Ein Ziehungsplan, der denselben Rohstoff zweimal würfelte. Ein
Regler, der dem Leser die Zahl zeigte, die er nicht rechnete. Und eine
Netzregel, die einem halben Land sein Höchstspannungsnetz erließ. Keiner dieser
fünf Punkte war eine Meinungsfrage.
