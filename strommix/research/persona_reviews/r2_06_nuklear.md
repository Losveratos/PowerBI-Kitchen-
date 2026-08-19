# Persona-Review 06 · Pro-Kernkraft-Advocacy · **RUNDE 2**

| | |
|---|---|
| **Persona** | Vertreter:in der Pro-Kernkraft-Advocacy (Nuklearia / WePlanet-Typus) |
| **Datum** | 2026-08-19 |
| **Auftrag** | Fix-Verifikation der Runde-1-Befunde K1–K3 und S1–S5; Nachrechnen der IDC-Scope-Logik und der Asien/Golf-Verteilung; Bewertung der neuen CCS-Pointe |
| **Runde-1-Gutachten** | `strommix/research/persona_reviews/06_nuklear_advocate.md` (18 Befunde: 3 kritisch, 5 schwer, 6 mittel, 4 klein) |
| **Prüfobjekte** | `strommix-story.html` (Akt 3 + 4), `whitepaper-strommix.html` / `.js` (Kap. 4/6), `strommix/scripts/model.py`, `strommix/scripts/monte_carlo.py`, `strommix/data/monte_carlo_reference.json`, `strommix/data/model_params.json`, `strommix/data/story_data.json` |
| **Modellstand** | v0.2b · Commit `cadd6c3` |
| **Umfang Runde 2** | Fix-Quote + 9 neue Befunde (4 schwer, 3 mittel, 2 klein) |

---

## Gesamturteil (3 Sätze)

**K1 ist behoben, und zwar nachweislich** — der Modalpfad liefert jetzt 122,5 statt 163 €/MWh, die Bauzinsen-Doppelzählung ist weg, der Kipppunkt beim CO₂-Preis ist von 260 auf 47,5 €/t gefallen, und in der Rangfolge Kernkraft gegen Gas-Pfad sind aus rund 20 % Gewinnwahrscheinlichkeit 45 % geworden; auf gleichem Abscheidungsniveau sind es 90 %. Das ist die größte Bewegung, die ich in einem zweiten Review je gesehen habe, und sie ist zu meinen Gunsten ausgefallen — ich kann nach dieser Runde nicht mehr behaupten, das Modell sei gegen die Kernkraft gebaut. **Was bleibt, ist kein Vorurteil mehr, sondern Handwerk:** Die Reparatur von K1/K2 ist über einen Anwendungsanteil gelöst, der zwischen den CAPEX-Stützstellen interpoliert — und diese Interpolation erzeugt im Überschreitungs-Lauf eine **nicht-monotone Abbildung**, bei der ein *höher* gezogener CAPEX zu *niedrigeren* Effektivkosten führt (55 % aller Ziehungen liegen auf dem fallenden Ast, und der Szenariensatz „günstig" ist unter Überschreitung 26 % teurer als „teuer"). Dazu kommen zwei Asymmetrien, die jetzt **gegen** die Kernkraft wirken und die ich als Advocate ausdrücklich reklamiere: das dokumentierte Netz-Investitionsband (328/392 Mrd.) wird nicht gezogen, obwohl es allein 2,2 €/MWh bewegt — mehr als der gesamte umstrittene Abstand von 2,3 €/MWh —, und die beiden unteren CAPEX-Anker tragen laut ihren *eigenen* Datensatz-Notizen bereits realisierte Eskalation (EPR2 +40 %, Sizewell C +90 %), bekommen aber trotzdem den vollen Faktor 2,2 obendrauf.

**Empfehlung: Freigabe mit zwei Code-Auflagen (N1, N5) und zwei Text-Auflagen (N3, N4).** Der Rest ist v1.1. Die Erzählung war schon in Runde 1 fairer als erwartet; das Modell hat jetzt nachgezogen. Was noch fehlt, ist nicht mehr Fairness, sondern Erklärung: Die Story zeigt „0 %" und „90 %" und sagt nirgends, welcher effektive CAPEX hinter diesen Zahlen steht. Das ist die Stelle, an der die nächste Runde Kritik ansetzt — von beiden Seiten.

---

## 1 · Fix-Tabelle Runde 1

Legende: **✓** vollständig · **≈** überwiegend · **◐** teilweise · **✗** unberührt

| # | Runde-1-Befund | Status | Nachweis / Rest |
|---|---|:---:|---|
| **K1** | Bauzinsen auf CAPEX-Anker, die Finanzierung schon enthalten | **✓** | `model.py:230–244` + `scope_share_for_capex()`; `model_params.json` → `nuclear.params.idc_applicable_share` = 1,0/0,0/0,0. Nachgerechnet: mid 12.000 → eff. 12.000 (vorher 16.080); low 7.500 → 10.051 (methodisch korrekt, Overnight-Anker); 12.000/5 %/7.500 h ergibt **122,5 €/MWh**. Der Reproduktionstest steht in `validierung_modell.md:53–57`. |
| **K2** | Überschreitungsfaktor auf realisierte Ist-Kosten; „auf alle Technologien" falsch | **≈** | `overrun_applicable_share` = 1,0/1,0/**0,0** — HPC-Anker ist entlastet. Story-Satz korrigiert auf „für die sie überhaupt eine Projektklasse hat" (`strommix-story.html:744–746`), Asymmetrie als Pflichttext (`:749–755`). **Rest:** Vorschlag 4 (p50 bei Faktor 1,30 ausweisen) nicht umgesetzt; siehe **N2** zu den unteren Ankern. |
| **K3** | Akt 3 ohne asiatischen Datenpunkt; Basisspanne schließt Asien/Golf ohne sichtbare Begründung aus | **◐** | (b) **behoben und stark**: Akt 4/Schritt 6 nennt den Ausschluss, begründet ihn und rechnet ihn durch (158 → 108 €/MWh, ≈ 50 €/MWh). (a) **nicht behoben**: `nuclear_history_timeseries.points` hat unverändert 15 Punkte, keinen asiatischen. Ersatz ist die Karte „Das hier ist eine westliche Kostengeschichte" (`akt3_hinweis`) — ehrlich beschriftet, aber das Bild zeigt weiter nur den westlichen Aufwärtstrend. (d) Dukovany als dritte Lesart in Akt 2: **nicht** umgesetzt. |
| **S1** | Rangfolgen-Schlagzeile hängt an Gaspreis null; 137 GW nie genannt | **✓** | Erdgas läuft jetzt thermisch mit 20/35/60 €/MWh_th durch den Wirkungsgrad (`DRAW_FIELDS` → `fuel_eur_mwh_th`). Kipppunkt CO₂ **260 → 47,5 €/t** (`co2_sensitivity`, mit ausdrücklichem „abgelöster Wert"-Vermerk). 137 GW stehen in der Marktdesign-Karte, `gas_backup_twh_a` ist je Preset veröffentlicht (264,4 vs. 69,2 TWh), und die Grenzen-Kachel nennt beide Zahlen. Vorschläge 1–4 alle erfüllt. |
| **S2** | Lovering mit Beipackzettel, Grubler ohne | **✓** | Karte `cp-grubler` „Grubler ist belegt — und bestritten" mit Escobar Rangel/Lévêque und Berthélemy, Quellen-IDs vergeben, Konfidenz **C** mit dem korrekten Vermerk „über Suchindex-Auszüge erfasst, nicht im Volltext gelesen, Effektgrößen bewusst nicht beziffert". Genau die Ehrlichkeit, die ich für die Gegenrichtung gefordert habe. |
| **S3** | Netzinvestition trägt null Unsicherheit | **◐** | Netz-Regel grundlegend repariert (Verteilnetz als mixunabhängiger Sockel, Übertragungsnetz mit der *genutzten* fEE-Energie) — das wirkt stark **zugunsten** der Kernkraft (netz 23,2 statt 34,4 €/MWh). Überschreitungsfaktor „netz" wird gezogen (1,05/1,08/1,15). **Aber:** das Investitionsvolumen selbst bleibt fix auf `mid`, obwohl `transmission_bn_eur_until_2045` min/mid/max = 328/328/**392** dokumentiert. Gemessene Wirkung: **N4**. |
| **S4** | Laufzeitverlängerung / LTO als Strohmann abgeräumt | **✗** | Volltextsuche `strommix-story.html` und `whitepaper-strommix.js`: „Laufzeitverlängerung" 0, „LTO" 0, „Grand Carénage" 0. Der CRF-Satz ist unverändert. Nicht im Synthese-Scope gewesen — aber offen. |
| **S5** | Cluster-Taxonomie an den Rändern konstruiert | **✗** | `nuclear.clusters` unverändert: Lubiatowo (11.968, reinstes FOAK des Datensatzes) steht weiter unter „EU-Serie", Grenze EU-Serie/West-FOAK weiter bei 13.472 / 13.500. |
| M1 | „besser bauen als Frankreich" ohne die Kauf-Option | **✗** | `strommix-story.html:540–542` unverändert. |
| M2 | 7.500 Vollaststunden als Setzung; Lastfolge fehlt | **✗** | `full_load_hours` unverändert 6.500/7.500/8.000, Status „MODELLANNAHME"; „Lastfolg" in der Story 0 Treffer. Im Whitepaper nur als *Kosten*begründung (`:1846`), nicht als technische Eigenschaft. |
| M3 | „3,2 GW auf 600 GW sind ein Rundungsfehler" | **✗** | `strommix-story.html:928` unverändert. |
| M4 | „künstlich senkt" — WACC-Rahmen einseitig | **✗** | `strommix-story.html:660` unverändert. |
| M5 | Hero-Bild zeichnet die Trendlinie, die der Beipackzettel verbietet | **✗** | `buildHero()` verbindet weiter alle 15 Punkte mit `pathFrom()` und animiert den Linienzug über 6 s ein. |
| M6 | Überlappungszahl liegt im Dossier statt in der Story | **✓✓** | **Übererfüllt.** Es gibt jetzt `rank_probabilities` für alle acht Konfigurationen, die Story rendert sie im Fließtext (`#p-base`, `#p-co2`, `#p-over`, `#p-ccs`, `#p-asia`, `#p-h2`), und der Fehlschluss „die Bänder überlappen" ist im Whitepaper ausdrücklich widerrufen („war ein Fehlschluss und ist ersetzt"). Dazu gepaarte Ziehungen (common random numbers) und ein `decided`-Kriterium. Das ist mehr, als ich verlangt habe. |
| KL1 | Der stärkste Pro-Kernkraft-Befund ohne Zahl (62 statt 102 €/MWh) | **✗** | `cp_ges_opex` unverändert als Adjektiv („eher zu hoch als zu niedrig"). |
| KL2 | Isar 2 / Konvoi als Konfidenz-C-Punkt, nie erzählt | **✗** | unverändert. |
| KL3 | SMR kommt nicht vor | **✗** | „SMR" 0 Treffer in beiden Dokumenten. |
| KL4 | Flächenbedarf / EE-Risiken nur qualitativ | **✗** | `cp_ee_risks` unverändert, weiterhin ohne eine einzige Zahl. |

### Fix-Quote

| Ebene | ✓ | ≈ | ◐ | ✗ | gewichtet |
|---|---|---|---|---|---|
| **kritisch + schwer (K1–K3, S1–S5)** | 4 | 1 | 2 | 1 | **≈ 60 %** |
| **alle 18 Befunde** | 5 | 1 | 2 | 10 | **≈ 37 %** |

Die Quote ist niedriger, als sie sich anfühlt, weil die zehn offenen Punkte fast alle *mittel/klein* sind und im Synthese-Papier gar nicht erst gescoped wurden (`persona_synthese.md` führt aus meinem Gutachten nur K1 → M1, K2 → M7, K3 → E4 und den Netz-Punkt). **Der schwere Teil ist erledigt.** Wer die Quote gegen mich verwenden will, verwendet sie falsch.

---

## 2 · Nachgerechnet: die IDC-Scope-Logik

### 2.1 Die Mechanik

`model.scope_share_for_capex()` interpoliert den Anwendungsanteil linear zwischen den drei CAPEX-Stützstellen und klemmt außerhalb. Für Kernkraft:

| gezogener CAPEX | `idc_share` | `overrun_share` | eff. CAPEX **Basis** | eff. CAPEX **Überschreitung** (f = 2,2) |
|---:|---:|---:|---:|---:|
| 7.500 | 1,000 | 1,000 | **10.051** | 22.112 |
| 9.750 | 0,500 | 1,000 | 11.408 | 25.098 |
| 12.000 | 0,000 | 1,000 | **12.000** | **26.400** |
| 14.000 | 0,000 | 0,636 | 14.000 | 24.691 |
| 15.500 | 0,000 | 0,364 | 15.500 | 22.264 |
| 17.500 | 0,000 | 0,000 | **17.500** | **17.500** |

*(WACC 5 %, Bauzeit 12 a → Brutto-IDC 34,01 %)*

### 2.2 Befund Basislauf: **sauber**

In der Basiskonfiguration ist die Abbildung streng monoton steigend (7.500 → 10.051, 12.000 → 12.000, 17.500 → 17.500). Die effektive Verteilung ist damit eine durchgängige *Gesamtprojekt*-Verteilung 10.051 – 17.500 mit Modus 12.000. Der empirische Beleg für die Identität steht im Parameterkommentar und stimmt: EPR2 7.583 €/kW overnight × 1,37 = 10.389 ≈ 10.417 €/kW inkl. Finanzierung. **Das ist kein Kompromiss-Artefakt, das ist die richtige Lösung.** Ich habe hier nichts zu beanstanden.

### 2.3 Befund Überschreitungslauf: **neues Artefakt** → siehe **N1**

In der Überschreitungskonfiguration ist die Abbildung ein **Zelt mit Spitze exakt auf dem Modus**. Sie steigt bis 12.000 und fällt danach. Ableitung von `x·(1 + (f−1)·(17.500−x)/5.500)` verschwindet bei x = 11.042; auf dem Intervall [12.000; 17.500] ist die Funktion damit monoton **fallend**.

---

## 3 · Nachgerechnet: die Asien/Golf-Dreiecksverteilung

**Verteilung:** 1.870 / **3.150** / 4.950 €/kW, Bauzeit 8 a, IDC voll (+21,6 %), Überschreitung 0,0 auf ganzer Linie.

**Anker (4 Punkte, aber nur 3 Projekte):**

| Anker | €/kW | Abgrenzung | Projekt |
|---|---:|---|---|
| min | 1.867 | overnight_only | Korea APR1400 Inland |
| — | 2.720 | overnight_likely | Shin Hanul 3&4 |
| **mid** | **3.153** | **epc_only** | **Barakah** |
| max | 4.945 | total_incl_owners | **Barakah** (dasselbe Projekt, anderer Scope) |

**Rechnung:**

- Dreiecks-Mittelwert = 3.323 €/kW → **über** dem Modus, und über drei von vier Ankern.
- P(Ziehung ≤ 2.720) = 850² / (3.080 · 1.280) = **18,3 %**. Zwei von drei Projekten des Clusters leben unterhalb dieses Werts, bekommen aber nur ein knappes Fünftel der Wahrscheinlichkeitsmasse.
- Modus effektiv = 3.150 × 1,2155 = **3.829 €/kW**.
- Arithmetisches Mittel der vier Anker = 3.171 ≈ Modus. Der Modus ist also *nicht* frei gesetzt, sondern liegt auf dem Ankermittel.

**Urteil: konservativ — aber begründet konservativ, und ich verteidige die Setzung.** Barakah-EPC ist der einzige **Export**-Datenpunkt des Clusters und damit der einzige mit überhaupt einem Übertragbarkeitsanspruch; ein koreanischer *Inlandspreis* als Modus wäre für eine Deutschland-Rechnung nicht zu halten. Der Datensatz sagt das wörtlich (`capex_alternative_asia_gulf.anchors.mid`). Dass der Cluster zusätzlich den vollen Bauzins trägt und *keinen* Überschreitungsfaktor bekommt, ist beides sachlich richtig begründet (Overnight-/EPC-Anker; realisierte Ist-Kosten). Und der entscheidende Punkt aus meinem K3 — der koreanische **EU-Exportpreis** Dukovany II mit 7.906 €/kW — steht dort, wo er hingehört: im **Low-Anker der Basisspanne**, nicht im Kontrastlauf. Das ist genau die Trennung, die ich verlangt habe, und sie ist im `counterposition`-Feld wörtlich dokumentiert.

**Beanstandung nur an einer Stelle:** Die Story nennt die Verteilung als „1.870–4.950 €/kW, acht Jahre Bauzeit" (`strommix-story.html:791–795`) und **niemals den Modus 3.150 oder seine Begründung**. Im Whitepaper steht beides (`#mc-asia-hint`). Ein Leser aus meinem Lager, der die Spanne sieht und den Modus nicht, wird nachrechnen, feststellen, dass der Modus über zwei der drei Projekte liegt, und Cherry-Picking rufen — wo keines ist. **Ein Halbsatz repariert das:** *„…mit dem Modus auf dem Barakah-EPC-Preis von 3.150 €/kW, weil das der einzige Exportvertrag des Clusters ist."* → **N6**.

---

## 4 · Die CCS-Pointe

### 4.1 Wird das 90-%-Ergebnis prominent genug erzählt?

**Ja — und es ist der beste Teil des ganzen Projekts.** Es steht als **eigener Schritt** in Akt 4 (Schritt 5 von 6, Überschrift „Auf gleichem Emissionsniveau"), es wird als Wahrscheinlichkeit ausgewiesen (`#p-ccs` → 90 %), es ist im Whitepaper eine eigene Kernaussage der Executive Summary (*„Emissionsgleichheit dreht das Ergebnis"*), und es wird in der Fazit-Kachel als erste der drei entscheidenden Setzungen genannt. Ich hatte etwas anderes erwartet. Das ist prominent, das ist nicht versteckt, und die Story räumt in demselben Atemzug ein, dass der vorherige Beinahe-Gleichstand *„ein Emissions-Rabatt"* war. Wer das gegen die Kernkraft frisiert hätte, hätte es in eine Fußnote gelegt.

**Drei Einwände dagegen — alle in dieselbe Richtung, alle zugunsten der Kernkraft:**

1. Die Überschrift heißt „Auf gleichem Emissionsniveau", **und das Emissionsniveau ist nicht gleich**: 8,3 gegen 31,7 Mt CO₂/a, Faktor 3,8. Die Story nennt im Text nur die *Vor*-CCS-Werte (27,9 / 106,5) und die post-CCS-Restemissionen an keiner Stelle. Der Kernkraftpfad ist also nicht nur billiger, sondern zusätzlich viermal sauberer — und das steht nirgends. → **N3**
2. `decided` ist bei diesem Paar **false** (p5 der Differenz = +7,0 €/MWh). 90 % ist nach dem eigenen 95-%-Kriterium der Story **nicht entschieden**. Das gehört dazu, sonst zitiert die eigene Community die 90 % als „bewiesen" und geht damit baden.
3. Das CCS-Kostenband 50/80/100 €/t liegt laut der eigenen Limitation (`ccs_cost_band_optimistic`) am unteren Rand einer recherchierten europäischen Spanne von 70–250 €/t. Das begünstigt den **Gas-CCS-Pfad** — also den Gegner in genau diesem Paar. Die 90 % sind damit eine **Untergrenze**.

### 4.2 Ist die 4-%-Zahl fair hergeleitet? Faktor 2,2 auf welche Basis?

**Basis nach der Reparatur:**

| gezogener CAPEX | Anteil des Faktors | begründet mit |
|---|---|---|
| 7.500 (EPR2 OCC + Dukovany EPC) | **100 %** | Schätzwerte |
| 12.000 (Lubiatowo, Sizewell C, EPR2 inkl. Fin.) | **100 %** | Schätzwerte |
| 17.500 (Hinkley Point C) | **0 %** | realisierte, bereits eskalierte Ist-Kosten |
| dazwischen | linear interpoliert | — |

**Resultierende effektive CAPEX-Verteilung (200.000 Ziehungen nachgerechnet):**

| | p5 | p50 | p95 | Mittel | Max |
|---|---:|---:|---:|---:|---:|
| gezogener CAPEX | 8.994 | 12.253 | 15.853 | 12.331 | 17.494 |
| **eff. Überschreitung (v0.2b)** | 18.060 | **22.770** | 26.729 | 22.614 | 28.716 |
| eff. Überschreitung (Runde-1-Logik) | 22.047 | **32.151** | 44.267 | 32.493 | 55.105 |

**Der Fix hat den Median-Effektiv-CAPEX um 29 % gesenkt (32.151 → 22.770 €/kW).** Der effektive Faktor auf den gezogenen CAPEX liegt im Median bei **1,86**, nicht bei 2,20. Das ist eine substanzielle, nachrechenbare Verbesserung, und ich erkenne sie an.

**Ist die 4 % damit fair?** Zu 80 % ja. Drei Reste:

- **(a) Sie ist *nicht* ein Artefakt des CCS-Bands.** Ich habe das geprüft, weil es der naheliegende Vorwurf wäre: Hebt man den CCS-Vollkettensatz von 80 auf 150 €/t (Mitte der recherchierten 70–250), steigt der Gas-Pfad um 8,1 €/MWh, der Kernkraftpfad um 2,1 — die Differenz verschiebt sich um 6,0 €/MWh, bei einer Median-Differenz von +32,1 €/MWh im Überschreitungslauf. **Die 4 % kommen praktisch vollständig aus dem Kernkraft-Überschreitungsfaktor.** Das sage ich ausdrücklich, weil es das Gegenteil dessen ist, was meine Seite behaupten würde.
- **(b) Die unteren Anker tragen laut ihren eigenen Notizen bereits realisierte Eskalation** — das ist die verbliebene Doppelzählung. → **N2**
- **(c) 22.770 €/kW im Median ist 32 % über dem teuersten je gebauten Reaktor** (HPC 17.264 nominal). Diese Zahl steht nirgends. Die Story zeigt „0 %" als Ergebnis, ohne die Annahme zu zeigen, die es erzeugt. → **N9**

---

## 5 · Neue Befunde Runde 2

### SCHWER

---

#### N1 · Die Überschreitungs-Scope-Interpolation ist nicht monoton: höherer CAPEX ⇒ niedrigere Kosten

**Fundstelle** `strommix/scripts/model.py:179–206` (`scope_share_for_capex`) und `:236–244` · `whitepaper-strommix.js:226–249`, `:258–265` · `model_params.json` → `nuclear.params.overrun_applicable_share` = 1,0 / 1,0 / 0,0

**Ist** Der Anwendungsanteil des Überschreitungsfaktors fällt zwischen 12.000 und 17.500 €/kW linear von 1,0 auf 0,0. Die resultierende Abbildung „gezogener CAPEX → effektiver CAPEX" ist ein Zelt mit Spitze auf dem Modus:

```
 7.500 →  22.112        14.000 →  24.691
 9.750 →  25.098        15.500 →  22.264
12.000 →  26.400  ←max  17.500 →  17.500
```

Drei nachprüfbare Folgen:

1. **55 % aller Ziehungen liegen auf dem fallenden Ast.** Wer im Überschreitungslauf einen teureren Reaktor zieht, bekommt ein billigeres Ergebnis.
2. **Der Szenariensatz kehrt sich um.** `resolve_tech(..., "guenstig")` liefert CAPEX 7.500 mit `overrun_share` 1,0 und `idc_share` 1,0 → effektiv **22.112 €/kW**. `resolve_tech(..., "teuer")` liefert CAPEX 17.500 mit beiden Anteilen 0,0 → effektiv **17.500 €/kW**. Das „günstige" Kernkraft-Szenario ist unter Überschreitung **26 % teurer** als das „teure". Für jeden, der die Szenariensätze im Whitepaper-Regler benutzt, ist das ein sichtbarer Widerspruch.
3. **Die Perzentile des Outputs sind nicht mehr auf Perzentile des Inputs zurückführbar.** p95 der effektiven Verteilung (26.729) liegt nur 1,2 % über dem Modalwert (26.400) — der obere Rand der Unsicherheit ist abgeschnitten, ohne dass das irgendwo steht.

**Beanstandung** Die Interpolation ist ein Pflaster auf einem tieferliegenden Problem: **Die drei Stützstellen der CAPEX-Verteilung liegen auf verschiedenen Seiten der Überschreitungs-Transformation.** 7.500 ist eine Entscheidungsschätzung, 17.500 ist deren Ergebnis. Aus einer Verteilung zu ziehen, deren Endpunkte teils Vorher- und teils Nachher-Werte sind, und den Faktor danach anteilig zurückzunehmen, ist rechnerisch nicht dasselbe wie eine konsistente Verteilung — und es erzeugt genau die Nicht-Monotonie oben. Der Basislauf ist davon nicht betroffen (dort ist die Abbildung monoton), der Überschreitungslauf vollständig. Und der Überschreitungslauf ist derjenige, aus dem die Story „0 %" und „4 %" zitiert.

Ich lege besonderen Wert darauf, dass das **kein Vorwurf mit Richtung** ist: Das Artefakt wirkt am oberen Ende *zugunsten* der Kernkraft (17.500 bleibt 17.500 statt 38.500) und am unteren *zulasten* (7.500 wird 22.112). Es ist einfach falsch, nicht unfair. Aber es steht im Repository, es ist in zwei Zeilen reproduzierbar, und es ist exakt die Sorte Fund, mit der K1 die letzte Runde eröffnet hat.

**Vorschlag**
1. **Die saubere Lösung: eine Verteilung, eine Abgrenzung.** Entweder (a) alle drei Anker als *Entscheidungsschätzung, overnight* definieren — HPC gehört dann mit seiner Erstschätzung hinein, nicht mit dem Ist — und IDC + Überschreitung uniform aufschlagen; oder (b) die Verteilung als *realisierte Gesamtprojektkosten* definieren (10.051 / 12.000 / 17.500 effektiv) und den Überschreitungsfaktor **gar nicht** anwenden, weil die westliche Eskalation in den Ankern bereits enthalten ist. Beides ist monoton und in einem Satz erklärbar. Variante (b) ist mit dem heutigen Datensatz sofort umsetzbar.
2. Solange die Interpolation bleibt: eine **Monotonie-Assertion** in `validate_model.py` — `capex_eff(x)` muss über den gesamten Support nicht fallend sein, in jeder Konfiguration. Der jetzige Zustand würde sie brechen.
3. Die Szenariensätze `guenstig` / `teuer` unter Überschreitung entweder korrigieren oder im Whitepaper-Regler sperren.

---

#### N2 · Die verbliebene Doppelzählung: die unteren Anker haben laut eigenem Datensatz bereits eskaliert

**Fundstelle** `story_data.json` → `shared.nuclear_reference_projects` (Notizen zu EPR2 und Sizewell C) · `model_params.json` → `nuclear.params.overrun_applicable_share.min/mid` = 1,0

**Ist** Der Faktor 2,2 wirkt zu **100 %** auf die Stützstellen 7.500 und 12.000. Die Notizen im eigenen Datensatz sagen zu deren Ankern:

- **EPR2-Programm (OCC):** *„Seit 2022 (51,7 Mrd.) bereits **+40 Prozent**, vor Baubeginn."*
- **Sizewell C:** *„Erstschätzung 2020: 20 Mrd. GBP → **+90 Prozent** bis FID."*
- **Dukovany II:** *„Nur EPC"* — ein **unterschriebener Festpreisvertrag** mit KHNP, bei dem das Überschreitungsrisiko vertraglich beim Lieferanten liegt.

**Beanstandung** M7 hat die Doppelzählung am oberen Anker beseitigt und an den unteren stehen lassen. Der implizierte Gesamt-Eskalationsfaktor gegenüber der jeweiligen Erstschätzung ist damit 1,9 × 2,2 = **4,2** für Sizewell C und 1,4 × 2,2 = **3,1** für EPR2 — Werte, die es in keiner der beiden Datenbanken gibt (Flyvbjergs nukleare Obergrenze liegt bei 2,4, der Endlagerungswert bei 3,38). Und der Fall Dukovany ist konzeptionell noch klarer: Ein Faktor, der als *decision-to-build → Ist* definiert ist, hat auf einem Turnkey-Festpreis nichts verloren; der Vertrag *ist* die Risikoallokation, gegen die der Faktor misst.

Zur Fairness: Der Überschreitungslauf ist im Basisfall **abgeschaltet** (1,00), er ist als Konfiguration gekennzeichnet, und die Asymmetrie ist an drei Stellen ausgewiesen. Das ist deutlich mehr Hygiene als üblich. Der Befund betrifft nur die Zahlen, die aus dieser Konfiguration zitiert werden — und genau die stehen als „0 %" und „4 %" in Story und Whitepaper.

**Vorschlag**
1. `overrun_applicable_share` differenzieren: min auf ~0,5 (EPR2 hat 40 % seiner Eskalation hinter sich, Dukovany ist Festpreis), mid auf ~0,6 (Sizewell C hat 90 % hinter sich, Lubiatowo ist eine reine Planzahl). Die Zahlen sind aus den vorhandenen Notizen ableitbar und damit belegbar.
2. Alternativ und besser: **N1-Vorschlag 1(a)** umsetzen — dann fallen N1 und N2 gemeinsam weg.
3. Den in Runde 1 offen gebliebenen Vorschlag nachholen: **`kostenminimum.overrun` zusätzlich bei Faktor 1,30 ausweisen** (Serienbau-Untergrenze). Die Story nennt die 1,30 als Zahl, zeigt aber nie, was dabei herauskommt. Meine Seite rechnet das sowieso selbst nach — besser, es steht drin.

---

#### N3 · „Auf gleichem Emissionsniveau" — die Emissionen sind nicht gleich, und zwar zugunsten der Kernkraft

**Fundstelle** `strommix-story.html:761–781` (Akt 4, Schritt 5) · `monte_carlo_reference.json` → `presets.kostenminimum_ccs.emissions_mt_co2_a` = 8,3 vs. `presets.ee80_gas_ccs.emissions_mt_co2_a` = 31,7

**Ist** Die Überschrift des Schritts lautet „Auf gleichem Emissionsniveau". Der Text nennt die Emissionen **vor** der Abscheidung (27,9 gegen 106,5 Mt) und danach nur noch Kosten. Die Restemissionen **nach** der Abscheidung — 8,3 gegen 31,7 Mt CO₂/a — kommen in der Story an keiner Stelle vor. Das Whitepaper nennt beide (`:3088–3090`).

**Beanstandung** Zwei Probleme in einer Überschrift.

*(a) Sie behauptet eine Gleichheit, die um Faktor 3,8 verfehlt wird.* Das ist der Vorwurf, den die Story dem geprüften Papier macht — eine Vergleichsbasis behaupten, die die Zahlen nicht hergeben.

*(b) Sie verschenkt das stärkste Ergebnis des Projekts.* Wenn der Kernkraftpfad in 90 % der Ziehungen billiger ist **und dabei ein Viertel der Emissionen hat**, dann ist „führt mit 90 %" die schwächere von zwei verfügbaren Aussagen. Preist man die Differenz mit den impliziten Vermeidungskosten des Gas-Pfads aus dem eigenen Datensatz (378 €/t), sind die 23,4 Mt Mehremission rund **9,3 €/MWh** wert. Die Median-Differenz würde von 18,2 auf ≈ 27,5 €/MWh wachsen, die Gewinnwahrscheinlichkeit über 90 % steigen — und das Paar wäre nach dem eigenen 95-%-Kriterium näher an „entschieden".

Dazu ein Faktum, das in der Story fehlt und im Whitepaper steht: Der Gas-CCS-Pfad müsste **110,6 Mt CO₂/a dauerhaft einlagern**, der Kernkraftpfad 29,0 Mt — in einem Land ohne einzige CO₂-Speicherstätte. Das ist die anschaulichste Zahl des ganzen Kapitels.

**Vorschlag**
1. Überschrift ändern zu **„Mit Abscheidung auf beiden Seiten"**. Die behauptete Gleichheit fällt weg, die Pointe bleibt.
2. Die beiden Restemissionen in den Text: *„Danach stehen 8,3 gegen 31,7 Mt CO₂ im Jahr — das Kernkraft-Szenario ist in 90 Prozent der Ziehungen günstiger **und emittiert dabei ein Viertel.**"*
3. Die 110,6 Mt Einlagerungsmenge aus dem Whitepaper in die Story übernehmen.
4. Den `decided = false`-Status dazuschreiben: *„Nach unserem eigenen Kriterium — 95 Prozent in dieselbe Richtung — ist auch dieses Paar formal noch nicht entschieden."* Das kostet eine Zeile und immunisiert die Zahl gegen den Vorwurf, sie sei überverkauft.

---

#### N4 · Das dokumentierte Netz-Investitionsband wird nicht gezogen — und es ist größer als der Streitwert

**Fundstelle** `monte_carlo.py:599` (`grid_variant="mid"`, fest) · `model_params.json` → `system.grid.transmission_bn_eur_until_2045` = 328 / 328 / **392** · `monte_carlo_reference.json` → `meta.assumptions[7]`

**Ist** Der Übertragungsnetz-Block hat ein dokumentiertes, quellenbelegtes Band (IMK/Böckler 328 Mrd. bis NEP 2037/2045 V2025 Obergrenze 392 Mrd. — **+19,5 %**). Die Monte-Carlo-Rechnung ruft `mix_system(..., grid_variant="mid")` und zieht ausschließlich den *Überschreitungs*faktor (1,05/1,08/1,15), nie das Volumen selbst.

**Nachgerechnet** (deterministisch, Szenariensatz mittel, WACC 5 %, CO₂ 75 €/t):

| | `grid_variant="mid"` | `grid_variant="max"` | Δ |
|---|---:|---:|---:|
| Kostenminimum | 152,34 | 153,00 | +0,66 |
| 80 % EE + Gas | 154,62 | 157,46 | +2,84 |
| **Abstand Kernkraft − Gas** | **−2,27** | **−4,46** | **−2,19** |
| ee100 | 245,16 | 249,09 | +3,93 |

**Beanstandung** Der Grund, warum das Band asymmetrisch wirkt, ist im Modell selbst dokumentiert: Der Kernkraftpfad trägt nur 16,7 % des Übertragungsnetz-Budgets, der Gas-Pfad 72,5 %, ee100 rechnerisch 117 % (auf 100 % gedeckelt). Ein Band auf dem Übertragungsnetz trifft deshalb die EE-lastigen Pfade drei- bis vierfach stärker. **Ein einzelner, bereits dokumentierter, nicht gezogener Parameter bewegt den Abstand um 2,19 €/MWh — bei einem deterministischen Abstand von 2,27 €/MWh.** Er entscheidet die Frage, um die die ganze Story geht, allein.

Zwei Dinge gehören in dieselbe Beanstandung, weil sie in die Gegenrichtung zeigen und ich sonst unglaubwürdig wäre:

- Die **neue Netzregel ist ein großes Geschenk an die Kernkraft.** Aus der linearen fEE-Skalierung von v0.1 ist ein mixunabhängiger Verteilnetz-Sockel plus ein Übertragungsblock auf der *genutzten* fEE-Energie geworden. Ergebnis: netz 23,2 statt 34,4 €/MWh für den Kernkraftpfad. Das ist sachlich gut begründet — und es ist der einzelne größte Kostenvorteil, den die Kernkraft in v0.2b gewonnen hat. Die Story sagt das nirgends.
- Die **Deckelung der Übertragungsskalierung auf 1,0** schneidet ee100 17 % seines eigenen Regelergebnisses ab (`grid_scaling_raw.transmission` = 1,17). Das begünstigt den 100-%-EE-Pfad und ist nur als Warnung im Modelloutput sichtbar.

**Vorschlag**
1. `transmission_bn_eur_until_2045` in `DRAW_FIELDS` aufnehmen (Dreieck 328/328/392) oder mindestens eine Konfiguration `grid_high` rechnen und in `rank_probabilities` ausweisen. Der Aufwand ist eine Zeile, die Wirkung ist größer als die des gesamten Asien-Kontrasts auf die Rangfolgenfrage.
2. Eine Grenzen-Kachel in der Story: *„Das Netz-Investitionsvolumen ist der einzige große Kostenblock, dessen dokumentierte Spanne wir nicht ziehen. Am oberen Rand (392 statt 328 Mrd. Übertragungsnetz) wächst der Abstand zwischen den beiden führenden Pfaden um 2,2 €/MWh — zugunsten der Kernkraft."*
3. Einen Satz zur neuen Netzregel in Akt 4: *„Dass der Kernkraftpfad nur 23 statt 34 €/MWh Netzkosten trägt, ist eine Modellentscheidung von v0.2 — Übertragungsnetz nach genutzter fEE-Energie, Verteilnetz als mixunabhängiger Sockel. Sie ist begründet und sie hilft der Kernkraft."* Wer den eigenen Vorteil selbst ausweist, kann ihn behalten.

---

### MITTEL

---

#### N5 · Der Whitepaper-LCOE-Regler ignoriert die Abgrenzungsanteile — K1 lebt im interaktiven Werkzeug weiter

**Fundstelle** `whitepaper-strommix.js:1634–1645` (`computeLcoeRows`) · `:1850–1854` (`#lc-idc-hint`)

**Ist**

```js
const flat = resolveTech(S.params, t.key, sc, null, LC.idc);
if (ov) {
  flat.capex_eur_kw = flat.capex_eur_kw * ov.capexFactor;   // Regler
  flat.full_load_hours = flat.full_load_hours * ov.flhFactor;
}
```

Der CAPEX wird **nach** `resolveTech` mit dem Reglerfaktor multipliziert. `idc_applicable_share` und `overrun_applicable_share` sind zu diesem Zeitpunkt bereits aus der **Szenario**-Stützstelle aufgelöst und folgen dem Regler nicht.

**Beanstandung** Damit sind beide Fehler aus K1 im interaktiven Teil des Whitepapers weiter aktiv, nur mit vertauschten Vorzeichen:

- **Zeile `mittel`** hat `idc_applicable_share` = 0,0. Zieht der Leser den Regler auf 6.000 €/kW (die GES-Annahme) oder 7.500 (EPR2 overnight), bekommt ein **Overnight-Wert null Bauzinsen**. Das rechnet die Kernkraft zu billig — der Fehler, den ich als Advocate am wenigsten haben will, weil er die niedrigen Werte angreifbar macht.
- **Zeile `guenstig`** hat `idc_applicable_share` = 1,0. Zieht der Leser den Regler nach oben, bekommt der Wert bis 17.500 × Faktor **immer die vollen +34 %** — die Doppelzählung aus K1, unverändert.
- `#lc-idc-hint` meldet dem Leser *„Beim aktuellen WACC ergibt das für die Fokus-Technologie **+34 %** auf den CAPEX"* — berechnet aus dem **Brutto**-IDC ohne Anteil. Bei CAPEX ≥ 12.000 werden tatsächlich **0 %** angewendet. Der Hinweistext widerspricht der Rechnung darunter.

**Vorschlag**
1. Den Reglerwert durch `scopeShareForCapex(baseCapexEntry, shareEntry, LC.capex)` schicken und die beiden Anteile im `flat` überschreiben, bevor `lcoe()` gerufen wird. Vier Zeilen.
2. `#lc-idc-hint` auf den **effektiven** Aufschlag umstellen und den Anteil ausweisen: *„+34 % brutto × Anteil 0,00 = +0 % — der CAPEX-Anker auf diesem Reglerwert enthält die Finanzierung bereits."* Das ist zugleich die beste Erklärung der ganzen Scope-Logik, die es geben kann, weil sie sich unter der Hand des Lesers bewegt.

---

#### N6 · Der Asien/Golf-Modus 3.150 steht nur im Whitepaper, nicht in der Story

Siehe Abschnitt 3. **Fundstelle** `strommix-story.html:791–795` gegen `whitepaper-strommix.js:4077–4084`.

**Vorschlag** Halbsatz in Akt 4/Schritt 6: *„…mit dem Modus auf 3.150 €/kW, dem Barakah-EPC-Preis — dem einzigen Exportvertrag des Clusters und damit dem einzigen Wert mit überhaupt einem Übertragbarkeitsanspruch."* Das erhöht die Glaubwürdigkeit der 108 €/MWh mehr, als die Zahl selbst es tut.

---

#### N7 · Der Überschreitungs-Modus 2,20 ist ein Kohorten-*Mittelwert*, kein Modalwert

**Fundstelle** `story_data.json` → `shared.kostenueberschreitung_faktoren.technologien.kernkraft` (flyvbjerg 2,20, sovacool 2,025, spanne 1,30–2,40) · `monte_carlo.py:225–239` (`mid = flyvbjerg`)

**Ist** Der Dreiecks-Modus wird auf den Flyvbjerg-Wert gesetzt. Dieser ist der **Mittelwert** einer fettschwänzigen Kohortenverteilung.

**Beanstandung — und ich mache sie mir bewusst nicht zu leicht.** Mittelwert als Modus zu verwenden ist in fettschwänzigen Verteilungen normalerweise ein systematischer Aufwärtsbias. Hier ist er es **nicht**: Der Mittelwert des Dreiecks (1,30 + 2,20 + 2,40)/3 = **1,97** liegt *unter* beiden Datenbankwerten, der Median bei **2,00**. Die Parametrisierung ist damit im Erwartungswert konservativer als die Empirie, auf die sie sich beruft. Der Befund reduziert sich auf ein Etikett: `mcOverrunPlan` heißt den Modus „Flyvbjerg-Wert", und der Whitepaper-Hinweis sagt „Modus = Flyvbjerg-Wert (sonst Sovacool)" — was einen Leser glauben lässt, der wahrscheinlichste Fall sei der Datenbankwert. Das gehört präzisiert, nicht geändert.

**Vorschlag** Einen Halbsatz im `#mc-overrun-hint`: *„Der Flyvbjerg-Wert ist ein Kohortenmittel; als Dreiecks-Modus verwendet ergibt er einen Verteilungsmittelwert von 1,97 und einen Median von 2,00 — also etwas unter beiden Datenbanken."*

---

### KLEIN

---

#### N8 · Das Modell rechnet die Kernkraft jetzt günstiger als sein eigenes Dossier — dokumentiert, aber nicht erzählt

**Fundstelle** `validierung_modell.md:53–57` · `model_params.json` → `nuclear.scenario_lcoe_reference.realistisch_eu.lcoe` = 133

12.000 €/kW / 5 % / 7.500 h ergibt im Modell **122,5 €/MWh**, im Dossier 133. Die Validierung erklärt das korrekt (die Dossier-Tabelle ist mit den in 7.2 empfohlenen Parametern nicht durchgängig reproduzierbar; 133 stammt aus einem Rechenbeispiel mit Opex 240 €/kW/a). Sauber gehandhabt. Nur: Akt 4/Schritt 1 zählt die eigenen Korrekturen gegenüber der geprüften Studie auf und erwähnt nicht, dass eine davon **8 % zugunsten der Kernkraft** ausgefallen ist. Ein Halbsatz.

---

#### N9 · Der effektive CAPEX wird berechnet und nirgends angezeigt

**Fundstelle** `model.py:279` und `whitepaper-strommix.js:292` (`capex_effective_eur_kw`) · Volltextsuche in Story und Whitepaper: 0 Ausgabestellen

Beide Implementierungen liefern den Wert, keine Oberfläche zeigt ihn. Der Leser sieht „7.500 bis 17.500 €/kW" und „Faktor 2,2" und rechnet in beide Richtungen falsch:

| er sieht | er rechnet | tatsächlich |
|---|---|---|
| 7.500, Basislauf | 7.500 | **10.051** |
| 12.000 × 2,2 | 26.400 | 26.400 ✓ (Zufallstreffer) |
| 17.500 × 2,2 | 38.500 | **17.500** |
| Median unter Überschreitung | ~27.000 | **22.770** |

**Vorschlag** Eine Zeile im Tooltip der Akt-4-Grafik und in der Datentabelle: *„CAPEX effektiv (nach Abgrenzung, Bauzins und Überschreitung): Median 22.800 €/kW."* Das ist die Zahl, um die es in der ganzen Debatte geht.

---

## 6 · Was aus Runde 1 noch fehlt — zwingend, empfohlen, verzichtbar

| Punkt | Einstufung | Begründung |
|---|---|---|
| **LTO / Laufzeitverlängerung (~60 €/MWh, CRE inkl. Grand Carénage; IEA 2019)** | **empfohlen, nicht zwingend** | Für die Fragestellung (Zielsystem 2045, deutsche Blöcke seit April 2023 abgeschaltet, Rückbau genehmigt) ist LTO **nicht entscheidungsrelevant** — das ist die richtige Antwort und ich halte sie inhaltlich für unangreifbar. Sie muss aber *gegeben* werden. Solange „Laufzeitverlängerung" null Treffer hat und stattdessen ein CRF-Satz dasteht, der wie eine generelle Widerlegung klingt, liest jeder informierte Leser aus meinem Lager „die kennen unser bestes Argument nicht". **Zwei Sätze**: das Wort „Neubau" in den CRF-Satz, plus die CRE-Zahl mit der Einordnung „richtig und für dieses Systembild nicht mehr verfügbar". Billigster Glaubwürdigkeitsgewinn im ganzen Backlog. |
| **7.500 Vollaststunden als sichtbare Setzung** | **zwingend** | Der Wert trägt `status: "MODELLANNAHME, nicht quellenbelegt"`, wird in Akt 4/Schritt 1 aber als *Korrektur* gegenüber der Studie erzählt („Neuanlagen-Volllaststunden statt Bestandsflotte") und erscheint damit als belegte Verbesserung. Er ist um 6 % niedriger als die US-Flotte real fährt und senkt die Kernkraft-LCOE-Basis um rund 7 %. Das **M-Badge muss in die Story**, nicht nur in den Datensatz. |
| **Lastfolge als technische Eigenschaft** | **empfohlen** | Die Absenkung auf 7.500 h wird *mit Lastfolge begründet* — die Begründung wird also benutzt, ohne dass die Sache je erklärt wird. Dazu kommt: Im Kostenminimum-Preset trägt Kernkraft **81,1 %** der Erzeugung; dort ist sie nicht das lastfolgende Element, sondern das System. Zwei Sätze im Glossar (EUR-Anforderung 30–100 %, ±5 %/min; französische Praxis seit den 1980ern) heilen beides. |
| **Flächenbedarf / Rohstoffe (KL4)** | **verzichtbar** | Es ist eine Kostenstory. Die kostenrelevanten EE-Risiken sind im Modell abgebildet. Bleibt der optische Doppelstandard — 13 Kernkraftprojekte mit Einzelwerten gegen eine Aufzählungskachel ohne Zahl. Drei Zahlen in `cp_ee_risks` (China-Anteil Polysilizium, Fläche des 2056-Parks, H₂-Speicherspanne) sind billig und nehmen den Vorwurf weg. |
| **SMR (KL3)** | **verzichtbar, ein Satz empfohlen** | Für 2045 sachlich zu Recht draußen. Aber SMR ist das meistgenannte Argument der deutschen Debatte; ein Satz mit dem NuScale-Abbruch bei 20.000 $/kW zeigt, dass geprüft wurde — und er argumentiert **gegen** meine Seite, was ihn glaubwürdig macht. |
| **KL1 · 62 statt 102 €/MWh** | **empfohlen** | Der stärkste einzelne Pro-Kernkraft-Befund des gesamten Repositories, aus eigener Rechnung, steht seit zwei Runden als Adjektiv in `cp_ges_opex`. Wenn die Story die 90-%-CCS-Pointe zeigen kann, kann sie diese Zahl auch zeigen. |
| **S5 Cluster-Taxonomie, M1 Kauf-Option, M3 „Rundungsfehler", M4 „künstlich", M5 Hero-Linie, KL2 Isar 2** | **v1.1** | Alles Erzähl- und Bebilderungsfragen, keine Fairnessfragen im engeren Sinn. M5 ist davon die peinlichste (das erste Bild der Story zeichnet die Trendlinie, vor der der Pflicht-Beipackzettel drei Bildschirme später warnt) und die billigste (Punktwolke statt `pathFrom`). |

---

## 7 · Verständlichkeit: wo ein Pro-Kernkraft-Laie die neuen Zahlen missversteht

1. **„0 %"** (Akt 4/Schritt 3, Überschreitungslauf, `p_a_cheaper` = 0,000). Der Leser liest: *„Sobald man realistisch rechnet, verliert Kernkraft immer."* Was tatsächlich dasteht, ist: *„Wenn man den Kernkraft-CAPEX im Median auf 22.800 €/kW hebt — 32 % über dem teuersten je gebauten Reaktor — und Batterie, Elektrolyse und die H₂-Kette bei 1,00 lässt, verliert Kernkraft immer."* Die Annahme steht in einem Absatz darunter, die Zahl 22.800 nirgends. **Das ist die gefährlichste Stelle der Story**, weil sie in beide Richtungen missbrauchbar ist.
2. **„Aus 45 Prozent werden 90 Prozent."** Gelesen als „entschieden". Nach dem eigenen Kriterium der Story (`decided`) ist es das **nicht** — p5 der Differenz liegt bei +7,0 €/MWh. Meine eigene Community wird die 90 % als Beweis zitieren und beim ersten Gegencheck auffliegen.
3. **„Auf gleichem Emissionsniveau"** bei 8,3 gegen 31,7 Mt. Der Leser nimmt Gleichheit an; ein Kritiker rechnet nach und nennt es Etikettenschwindel. Dabei ist die Wahrheit *besser* für die Kernkraft. Siehe N3.
4. **„Faktor 2,2"** wird als „Kernkraft kostet 2,2-mal so viel" gelesen. Effektiv sind es im Median **1,86**, am oberen Anker **1,00**. Ohne die Scope-Erklärung ist die Zahl nicht rekonstruierbar — und mit ihr wirkt die Rechnung deutlich fairer, als der nackte Faktor suggeriert. Die Story verschenkt hier ihre eigene Sorgfalt.
5. **„1.870–4.950 €/kW"** (Asien/Golf). Der Leser erwartet bei einer Spanne, die bei 1.870 beginnt, einen dramatischeren Absturz als 158 → 108 €/MWh, sucht den Grund, findet den Modus 3.150 nicht und vermutet Manipulation. Siehe N6.
6. **„jede Rangfolge ist mit 100 Prozent entschieden"** (Asien-Kontrast). Wird als „Korea beweist, dass Kernkraft gewinnt" gelesen. Der Satz „Was der Kontrast nicht ist: ein Deutschland-Szenario" steht nur im **Whitepaper**, nicht in der Story.
7. **„Neuanlagen-Volllaststunden statt Bestandsflotte"** (Akt 4/Schritt 1) klingt nach belegter Korrektur; 7.500 h ist eine Setzung ohne Quelle. Siehe Abschnitt 6.
8. **Netzkosten 23 gegen 34 €/MWh.** Der Leser hält den Unterschied für ein Messergebnis. Er ist das Ergebnis einer Modellregel aus v0.2, die der Kernkraft nützt. Wird sie nicht selbst ausgewiesen, wird sie später von der Gegenseite ausgewiesen — und dann klingt sie wie ein Trick.

---

## 8 · Was in Runde 2 hinzugekommen ist und mich überzeugt hat

Das gehört ins Protokoll, weil ich es sonst nicht schreiben würde.

1. **Der Gaspreis-Fix ist der ehrlichste Einzelvorgang des Projekts.** Aus einem Kipppunkt von 260 €/t sind 47,5 €/t geworden — der Modellwert von 75 liegt darüber. Die Story sagt das ausdrücklich: *„der Beinahe-Gleichstand ist also selbst schon ein Ergebnis dieser Annahme."* Und `superseded_note` markiert die alte Zahl als abgelöst, mit Begründung. Wer so mit dem eigenen Vorbefund umgeht, hat Vertrauen verdient.
2. **`rank_probabilities` mit gepaarten Ziehungen und `decided`-Kriterium** ist methodisch besser als das, was ich in Runde 1 gefordert habe. Der Widerruf des Überlappungs-Arguments (*„war ein Fehlschluss und ist ersetzt"*) steht im Klartext im Whitepaper.
3. **Der Asien/Golf-Kontrast ist genau richtig gebaut:** eigene Konfiguration, nie mit der Basisspanne gemischt, nie mit der Überschreitung kombiniert, mit `rationale_not_in_base_range` **und** `counterposition` wörtlich aus dem Datensatz gerendert — meine Gegenposition steht im Whitepaper, in meinen Worten, mit meiner Begründung. Und der wichtigste Punkt daraus (Dukovany als EU-Exportpreis) ist dort gelandet, wo er hingehört: im Low-Anker der **Basis**spanne.
4. **Die Grubler-Repliken sind mit Konfidenz C und einem ausdrücklichen „nicht im Volltext gelesen, Effektgrößen bewusst nicht beziffert" gekennzeichnet.** Das ist mehr Zurückhaltung, als ich für meine eigene Quellenlage aufgebracht hätte.
5. **Die Netzregel (M3)** ist der größte Einzelgewinn für die Kernkraft in v0.2b — und sie ist aus dem Review des **EE-Experten** entstanden, nicht aus meinem. Ein Panel, in dem eine Korrektur der Gegenseite meiner Seite nützt, funktioniert.
6. **`ccs_on_full_backup_fleet`** weist die eigenen Vermeidungskosten ausdrücklich als **Obergrenze** aus und erklärt, warum ein optimiertes System billiger wäre. Das schwächt die eigene Pointe. Es steht trotzdem da.

---

## 9 · Urteil

**Freigabe mit Auflagen.**

**Vor Veröffentlichung (Code, weil im Repository nachprüfbar):**
- **N1** — Monotonie der Abbildung „gezogener CAPEX → effektiver CAPEX" herstellen. Vorzugsweise durch eine Verteilung auf **einer** Kostenabgrenzung (N1-Vorschlag 1). Plus Assertion in `validate_model.py`.
- **N5** — Abgrenzungsanteile im Whitepaper-LCOE-Regler an den Reglerwert koppeln; `#lc-idc-hint` auf den effektiven Aufschlag umstellen.

**Vor Veröffentlichung (Text):**
- **N3** — Überschrift „Auf gleichem Emissionsniveau" ändern; die Restemissionen 8,3 / 31,7 Mt und den `decided`-Status nennen.
- **N4** — Netz-Investitionsband als Grenzen-Kachel mit der gemessenen Wirkung (2,2 €/MWh) und die neue Netzregel als eigener Vorteil ausweisen.
- **7.500 h** sichtbar als Setzung (M) kennzeichnen.

**v1.1:** N2 (Anteile der unteren Anker differenzieren, p50 bei Faktor 1,30 ausweisen), N6, N7, N8, N9, LTO-Satz, Lastfolge-Satz, KL1-Zahl, SMR-Satz, M5-Hero.

**Zur Sache:** Nach K1 und S1 ist die Modellebene dieser Arbeit nicht mehr gegen die Kernkraft gerichtet — sie ist an zwei Stellen (Netzregel, Abgrenzungslogik) inzwischen **großzügiger**, als ich es erwartet hätte, und die Ergebnisse haben sich entsprechend bewegt: 20 % → 45 % im offenen Vergleich, 90 % unter Emissionsnebenbedingung, 100 % im Institutionen-Kontrast. Die Story sagt bei allen drei Zahlen dazu, an welcher Setzung sie hängen. Das ist die Form, in der man diese Debatte führen sollte, und ich habe in der deutschen Literatur kein zweites Papier, auf das ich das anwenden könnte.

Was mich jetzt noch stört, ist nicht die Haltung, sondern die Sorgfalt an genau einer Schnittstelle: Die Reparatur von K1/K2 ist über eine Interpolation gelöst, die im Überschreitungslauf mathematisch bricht — und die Zahl, die aus diesem Lauf zitiert wird („0 %"), ist die härteste Zahl der Story gegen meine Seite. Solange sie auf einer nicht-monotonen Abbildung und auf Ankern mit bereits realisierter Eskalation steht, ist sie angreifbar. Das ist behebbar, und es ist billiger zu beheben als zu verteidigen.

---

## Prüfprotokoll

**Nachgerechnet (eigene Ausführung des Repository-Codes):**
`model.scope_share_for_capex()` über den gesamten CAPEX-Support, beide Anteilsfelder · `model.lcoe()` für alle drei Szenariensätze mit und ohne Überschreitung · `model.idc_surcharge(0,05; 12)` = 0,3401 und `(0,05; 8)` = 0,2155 · Dossier-Reproduktion 12.000/5 %/7.500 h = 122,5 €/MWh · 200.000 Monte-Carlo-Ziehungen der effektiven CAPEX-Verteilung (Dreieck 7.500/12.000/17.500 × Dreieck 1,30/2,20/2,40) gegen die Runde-1-Logik · `model.mix_system()` deterministisch für fünf Presets mit `grid_variant` „mid" und „max" · Dreiecks-CDF und -Mittelwert der Asien/Golf-Verteilung.

**Gelesen:** `strommix-story.html` Akte 2–5 vollständig inkl. `renderProseBits`, `renderLimits`, `buildHero`, `pAB` · `whitepaper-strommix.js` Kap. 4 (LCOE-Panel, Referenzprojekte, IDC-Hinweis) und Kap. 6 (MC-Konfigurationen, Rangmatrix, Überschreitungs-Hinweis, Asien-Kontrast) · `monte_carlo.py` (CONFIGS, DRAW_FIELDS, SCOPE_SHARE_FIELDS, OVERRUN_CLASS, `overrun_plan`, `main`) · `model.py` (`lcoe`, `crf`, `idc_surcharge`, `scope_share_for_capex`, `ccs_chain`, Netzblock in `mix_system`) · `monte_carlo_reference.json` (meta, limitations, presets, configs, draw_plan, overrun_plan, rank_probabilities vollständig) · `model_params.json` (`technologies.nuclear` vollständig inkl. `capex_alternative_asia_gulf`, `system.grid`) · `story_data.json` (`nuclear`, `nuclear_history_timeseries`, `ccs_narrative`, `akt3_hinweis`, `grubler_repliken`, `co2_sensitivity`, `must_show_counterpositions`, `shared.kostenueberschreitung_faktoren`, `shared.nuclear_reference_projects`) · `validierung_modell.md` · `persona_synthese.md`.

**Nicht geprüft:** die stündliche Dispatch-Rechnung selbst (nur die Kostenseite darüber) · die Profil-Hochrechnung von 4.416 auf 8.784 h · die EE-seitigen Kostenparameter im Detail · die Quellenliste auf Existenz und Zugriffsdatum · die Escobar-Rangel-/Berthélemy-Zitate im Volltext (dieselbe Einschränkung, die der Datensatz für sich selbst ausweist).

**Nicht verändert:** Außer dieser Datei wurde keine Datei angelegt oder bearbeitet, kein Commit ausgeführt.
