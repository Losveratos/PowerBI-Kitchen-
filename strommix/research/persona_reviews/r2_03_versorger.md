# Persona-Review 03 · RUNDE 2 — Senior-Manager:in Energiewirtschaft (Großversorger)

| | |
| --- | --- |
| **Persona** | Senior-Manager:in bei einem großen deutschen Versorger (Netze + Vertrieb + Erzeugungserfahrung), ~20 Jahre Branchenpraxis |
| **Runde** | 2 · Nachprüfung des Runde-1-Gutachtens `03_versorger_manager.md` |
| **Datum** | 2026-08-19 |
| **Prüfobjekte** | `whitepaper-strommix.html` + `whitepaper-strommix.js` (Schwerpunkt) · `strommix-story.html` · `strommix/scripts/model.py`, `monte_carlo.py`, `validate_model.py` · `data/model_params.json`, `page_data.json`, `story_data.json` |
| **Referenz** | `strommix/research/modell_v02_ergebnis.md` (v0.2b) |
| **Blickwinkel** | „Sind die Fixes echt — und würde ich das jetzt einem Vorstand vorlegen?" |

---

## Kurzurteil

**Die Qualität der umgesetzten Fixes ist hoch, die Abdeckung ist etwa die Hälfte.** Nichts von dem, was angefasst wurde, ist kosmetisch: Der Gaspreis ist ein echter Parameter im Ziehungsplan und nicht ein Textbaustein; die Netzaufteilung ist gerechnet und die Treiberzuordnung ausdrücklich als Setzung badge-markiert; der Marktdesign-Abschnitt trägt die richtigen Fakten und zieht sie aus dem Datensatz statt aus dem Markup; die falsche Redispatch-Notiz ist nicht nur korrigiert, sondern mit der richtigen Begründung korrigiert. Das ist saubere Arbeit, und sie ist an mehreren Stellen ehrlicher, als sie sein müsste.

**Aber:** Von acht Runde-1-Befunden sind drei geschlossen, drei halb und zwei gar nicht — und die zwei offenen (S2 WACC, S4 Auktionswerte) waren als „Redaktion, < 1 h" bzw. „Modell, ½ Tag" eingestuft, also die billigsten der Liste. Wichtiger: **Der Netz-Fix ist auf halbem Weg stehengeblieben.** Das Verteilnetz hat den mixunabhängigen Sockel bekommen, das Übertragungsnetz nicht. Genau daraus entsteht der größte verbliebene mechanische Vorteil des Kernkraft-Szenarios — und er ist mit **11,2 €/MWh** rund **62 %** des Vorsprungs, auf dem jetzt die neue Kernaussage („mit CCS auf beiden Seiten führt Kernkraft mit 90,3 %") ruht.

**Fix-Quote: 4,25 von 8 ≈ 53 %.** Empfehlung unverändert: **überarbeiten vor Veröffentlichung**, aber der Abstand zur Vorlagefähigkeit ist jetzt klein — es sind im Wesentlichen zwei Modelländerungen und drei Redaktionen.

---

# 1 · Fix-Verifikation Runde 1

| # | Befund R1 | Status | Bewertung |
| --- | --- | --- | --- |
| **K1** | Gaspreis = 0 trägt Akt 4 | ✅ **geschlossen** | Fachlich sauber, nicht kosmetisch. Vier Restpunkte (→ N4). |
| **K2** | Netzblock größter Posten / schwächste Modellierung | 🟡 **2 von 4 Teilpunkten** | (c) und (d) erledigt, (a) und (b) offen — (d) nur zur Hälfte (→ N1). |
| **K3** | Ist-2025-Anker nicht gegen Realität geprüft | 🟡 **Substanz ja, Prüfung nein** | Anker vervollständigt und richtig abgegrenzt; der Validierungstest ist aber zirkulär (→ N3). |
| **S1** | „Wer baut das?" fehlt | ✅ **geschlossen** | Faktisch korrekt, datengebunden. Ein Namensfehler in der Story (→ N9). |
| **S2** | Ein globaler WACC für alle Asset-Klassen | ❌ **nicht umgesetzt** | Ausdrücklich als offen geführt. Durch Kap. 7 jetzt *sichtbarer* inkonsistent als vorher. |
| **S3** | 8.000 h Kernkraft unkommentiert | 🟡 **halb** | Inkonsistenz-Satz steht jetzt in Kap. 9. Eigene Setzung 7.500 h und Negativpreis-Argument fehlen weiter. |
| **S4** | Auktionswerte als Ober- statt Untergrenze | ❌ **nicht umgesetzt** | Der beanstandete Satz steht wörtlich unverändert in Kap. 4. |
| **S5** | Keine Umsetzbarkeitsschranke | 🟡 **halb** | Zubauraten-Tabelle ist da und gut. Lieferketten/Personal/Netzanschluss: 0 Treffer. |

## 1.1 K1 · Gaspreis — geschlossen, und der TTF-Beleg trägt

**Verifiziert.** `technologies.gas_ccgt.params.fuel_eur_mwh_th` = 20 / **35** / 60 €/MWh_th, Konfidenz B, im Ziehungsplan (`monte_carlo.py` `DRAW_FIELDS`), in `model.lcoe()` über `fuel_eur_mwh_th / η` verrechnet. Der Whitepaper-Text (Kap. 4, `#lcoe-note`) ist neu geschrieben und sagt selbst, was vorher falsch war: *„Bis v0.1 hatte das Modell keinen Erdgas-Brennstoffpreis; die Gaswerte waren ausgewiesene Untergrenzen und der Abstand zu den FÖS-Linien war keine Aussage, sondern eine Lücke."* Das ist die Art Selbstkorrektur, die ein Fachpublikum überzeugt. R9 damit erledigt.

**Ist der TTF-Beleg sauber?** Inhaltlich ja, formal nein.

- Inhaltlich: Die Stützpunkte sind nachvollziehbar hergeleitet (Juli 2026 Ø 53,5, Spanne 43,0–63,1; Stand 19.08.2026 rund 62–64; 2024/25 30–45), die Konfidenz ist ehrlich gestuft (**B** für die Spanne, **C** für die Übertragbarkeit auf 2045), und die Gegenprobe gegen `gas_fuel_implied` (FÖS-Rückrechnung) steht dabei. Die Asymmetrie ist ausgerechnet und benannt: Gas-Pfad +16,2, Kernkraft-Pfad +4,2 €/MWh, Faktor 3,9. Sehr gut.
- Formal: **Es gibt keinen Quelleneintrag.** Jede andere Zahl in Kapitel 4 trägt ein `cite(...)` mit Zugriffsdatum; der Gaspreis trägt nur den Fließtext „TTF-Frontmonat, Recherche 19.08.2026". Damit ist ausgerechnet der Parameter ohne klickbare Quelle, der eine ganze Modellversion begründet. Handelsplatz (ICE Endex), Kontrakt und Abrufdatum gehören in das Quellenregister — sonst ist es die einzige Zahl im Papier, die man nicht nachschlagen kann.
- Zweiter Punkt, den ich als Praktiker anmerken muss: Der Zentralwert 35 liegt **unter** dem eigenen belegten 2024/25-Band (30–45) und **weit** unter dem aktuellen Spot (62–64). Die Begründung („sinkende Gasnachfrage bis 2045") ist eine Setzung ohne Quelle und wirkt genau in die Richtung, die den Gas-Pfad begünstigt. Der Fix korrigiert also in die richtige Richtung, aber tendenziell zu schwach. Das gehört als Halbsatz dazu.

## 1.2 K2 · Netzblock — der wichtigste halbe Fix

| Teilpunkt R1 | Status | Beleg |
| --- | --- | --- |
| (a) Regulierungslogik, differenzierte Nutzungsdauern | ❌ offen | `system.grid.lifetime_years` = 40 für **beide** Blöcke, `status: MODELLANNAHME`, im Text mit Badge **M** ausgewiesen. Keine ARegV, keine getrennten Nutzungsdauern für Sekundärtechnik/Konverter, kein eigener Netz-WACC. |
| (b) Kein Betrieb / Verluste | ❌ offen, aber sauber deklariert | Neu: `gaps.netz_opex`, `system.grid.opex_note`, Limitation `grid_opex_missing` (severity **hoch**). Netzblock der Zukunftsszenarien ausdrücklich als Untergrenze gekennzeichnet. |
| (c) Redispatch-Notiz sachlich falsch | ✅ erledigt | `redispatch_2024_bn_eur.note` sagt jetzt: *„KORREKTUR v0.2 (Persona-Review 03, K2c): Dieser Betriebskostenblock ist in einer reinen Investitionsannuität gerade NICHT enthalten. Er wird im Modell weiterhin nicht angesetzt — nicht weil er doppelt wäre, sondern weil für das Zielsystem 2045 kein belegter Wert vorliegt."* Vorbildlich: korrigiert **und** die neue Begründung offengelegt. |
| (d) lineare fEE-Skalierung begünstigt Kernkraft | 🟡 **halb** | Verteilnetz hat den Sockel bekommen, Übertragungsnetz nicht. → **N1, kritisch.** |

**Ist die 328/323-Treiberzuordnung als Setzung gekennzeichnet? Ja, zweifach und explizit.** `gridRuleText()` schreibt wörtlich: *„Die **Zuordnung** der Treiber (Transport → Übertragung, Elektrifizierung → Verteilung) ist dabei eine Setzung [M], auch wenn die beiden Volumina belegt sind."* Zusätzlich maschinenlesbar als Limitation `grid_allocation_assumption` (severity mittel). Auch der methodische Preis der Korrektur ist benannt — dass die Begründung „dieselbe Vereinfachung wie GES, also vergleichbar" für den Netzblock nicht mehr trägt. Das ist genau die Ehrlichkeit, die ich verlangt hatte, und mehr als üblich.

**Nachrechnung der neuen Regel** (WACC 5 %, 40 a → CRF 0,05828; Bedarf 950 TWh):

| Preset | Übertragung | Verteilung | Netz gesamt | Dokumentiert |
| --- | ---: | ---: | ---: | ---: |
| Kostenminimum (Faktor 0,167) | **3,4** | 19,8 | 23,2 | 23,2 ✓ |
| 80 % EE + Gas (0,725) | **14,6** | 19,8 | 34,4 | 34,4 ✓ |
| 100 % EE (1,170 → 1,00) | **20,1** | 19,8 | 39,9 | 40,0 ✓ |

Die Rechnung ist exakt reproduzierbar. Genau deshalb ist die Lücke so gut sichtbar (→ N1).

## 1.3 K3 · Ist-2025-Anker — richtig gebaut, falsch geprüft

**Umgesetzt:** Bestandsbänder Kohle 101,7 / Biomasse 42,7 / Wasser 21,0 TWh ergänzt (nur CO₂-Kosten, als Untergrenze deklariert), Netzbasis auf `ist_netzentgelt` = 93 €/MWh umgestellt, Anker mit `comparable_to_target_scenarios: false` und eigener Limitation `ist_anchor_not_comparable` versehen, im Whitepaper-Preset **und** in der Executive Summary erklärt. Die Begründung, warum beides gleichzeitig (Netzentgelt **und** Nichtvergleichbarkeit) — unterschiedliche Systemgrenzen — ist richtig und gut formuliert. Das war meine Forderung, und sie ist erfüllt.

**Nicht umgesetzt ist die eigentliche Pointe:** Der Test prüft nichts. → **N3.**

## 1.4 S1 · Marktdesign — trägt der Kasten die richtigen Fakten?

**Gegengeprüft gegen `page_data.kraftwerksstrategie`, alles korrekt:**

| Fakt | Datensatz | Im Artefakt |
| --- | --- | --- |
| 1. Ausschreibung **4,5 GW am 01.09.2026** | `ausschreibung_1: {datum: "2026-09-01", volumen_gw: 4.5}` | ✓ Whitepaper Kap. 7 + Story, beide datengebunden |
| 2. Runde 4,5 GW am 08.12.2026 | ✓ | ✓ |
| Gesamt zunächst 11 GW, weitere Runden 2027/2029 | ✓ | ✓ |
| Inbetriebnahme Runde 1 spätestens 2031 | ✓ | ✓ |
| Koalitionsvertrag bis 20 GW bis 2030, Widerspruch offen | ✓ | ✓, wörtlich als „offener Widerspruch" zitiert |
| Kapazitätsmechanismus ab 2031 nicht final ausgestaltet | `ausgestaltung: null` | ✓, wird als „noch nicht entschieden" gerendert |
| Grundsatzeinigung EU 15.01.2026 / Kabinett 13.05.2026 | ✓ | ✓ |

Keine Zahl steht im Markup — alles zieht aus dem Datensatz. Der Schlusssatz ist der beste Absatz des Kapitels: *„Wer 20 bis 137 GW Reserve rechnet, rechnet implizit einen Kapazitätsmechanismus mit, dessen Ausgestaltung heute offen ist und dessen Kosten in keiner LSCOE-Zahl dieses Papiers auftauchen. Das ist keine Modellungenauigkeit, sondern eine Systemgrenze."* Dazu die Spiegelbildlichkeit EEG-Marktprämie ≈ De-facto-CfD. Genau das hatte ich verlangt, und es ist besser umgesetzt als vorgeschlagen: **11 GW ausgeschrieben gegen 20–137 GW modelliert** ist ein Faktor 5 bis 12 und die stärkste Realitätsprüfung im ganzen Papier.

Zwei Mängel: ein Gesetzesname in der Story ist falsch, und die PPA-/Merchant-Seite fehlt weiter (→ N9, N6).

## 1.5 S2 · WACC — nicht umgesetzt, und jetzt exponierter

`global.wacc` bleibt 3/5/9 % für reguliertes Netz, geförderte EE, Merchant-Batterie, Peaker ohne Kapazitätsvertrag und Kernkraft-FOAK. In `modell_v02_ergebnis.md` 5.3 als offen geführt.

Das ist nach dem Netzbefund der zweitwichtigste offene Punkt — und er ist durch den neuen Kap.-7-Text **schlechter** geworden, nicht besser: Das Papier argumentiert dort jetzt ausdrücklich, dass Marktprämie und Kapazitätsmechanismus beide den Kapitalkostensatz senken und dass der WACC eine politische Größe ist. Wer das schreibt und dann alle Assets mit demselben Satz rechnet, liefert die Frage im Investment Committee frei Haus. Der Minimalfix bleibt derselbe wie in Runde 1: **eine Sensitivitätszeile** (Netz 4 % / EE 5 % / Speicher und Peaker 8 % / Kernkraft 9 %) gegen den Basisfall. Ein halber Tag.

## 1.6 S3 · 8.000 h — halb

Der entscheidende Satz steht jetzt in Kap. 9: *„Kernkraft läuft als Band. Ein lastfolgender Betrieb würde die Abregelung senken, aber auch die Volllaststunden — und damit die LCOE-Basis. Wer 8.000 h und hohen EE-Anteil unterstellt, rechnet inkonsistent."* Gut.

Weiter offen: die eigene Setzung **7.500 h (6.500–8.000)** wird nirgends neben die sehr prominent gezeigten Wind- und PV-Volllaststunden gestellt — die Asymmetrie in der Prüftiefe bleibt also sichtbar. Und die 575 Negativpreisstunden 2025 werden nirgends als *Betriebs*argument gegen ein preisnehmendes Grundlastband verwendet, obwohl sie im Dossier stehen und im Papier an anderer Stelle zitiert werden.

## 1.7 S4 · Auktionswerte — nicht umgesetzt

Wörtlich unverändert in `whitepaper-strommix.js` Kap. 4:

> „… das ist ein Marktpreis, kein Modellwert, und **eher eine Obergrenze der Betreiber-Vollkosten** über 20 Jahre."

Die Deutungsrichtung ist weiterhin falsch herum. Der anzulegende Wert unter der gleitenden Marktprämie ist eine **einseitige** Absicherung nach unten; Bieter können rational unter ihren Vollkosten bieten, weil die Erlösoberseite bei ihnen bleibt. Dazu die Blöcke, die der Betreiber gerade *nicht* trägt und die im Zuschlagswert deshalb fehlen, für ein Systemkostenmodell aber anfallen: sozialisierter Netzanschluss/Netzausbau jenseits des Baukostenzuschusses, Entschädigung bei Abregelung nach § 13a EnWG, Systemdienstleistungen und Ausgleichsenergie. Offshore-Nullcent und negative Gebote: **0 Treffer** in beiden Artefakten, obwohl der Datensatz sie führt (TotalEnergies 180 Mio. € für 1.000 MW).

Das war in meiner Aufwandstabelle **„Redaktion, < 1 h"**. Zwei Sätze umdrehen. Dass das nicht passiert ist, während der Netzblock umgebaut wurde, ist die auffälligste Priorisierungslücke der Runde.

## 1.8 S5 · Umsetzbarkeit — halb, und die vorhandene Hälfte ist gut

Kapitel 2 hat jetzt die Zubauraten-Gegenprobe: erforderliche GW/a gegen Ist-Zubau 2025 je Technologie, mit Faktor, mit dem Hinweis *„Genehmigungen laufen dem realisierten Zubau 2–3 Jahre voraus"* und der ehrlichen Feststellung, dass sich bei Offshore kein Faktor bilden lässt, weil der Zubau null war. Das ist genau der Kasten, den ich verlangt hatte, und er ist gut gemacht.

Was fehlt, ist die Lieferketten- und Personalseite — **0 Treffer** für „Lieferzeit", „Transformator", „Fachkr", und kein Wort zu Netzanschlusswarteschlangen, HGÜ-Konverterslots, Gasturbinen-Vorlaufzeiten oder Kabelverlegekapazität. Das eigene Faktendossier nennt Komponentenknappheit ausdrücklich als IMK-Aufwärtsrisiko; übernommen wurde die Investitionssumme, nicht das Risiko. Fünf Sätze im Marktdesign-Kapitel, und der Punkt wäre zu.

---

# 2 · Neue Befunde aus Runde 2

## KRITISCH

### N1 · Das Übertragungsnetz hat keinen Sockel bekommen — und darin steckt 62 % des neuen Kernkraft-Vorsprungs

**Fundstelle** — `model.py` Z. 1024–1046; `model_params.json` → `system.grid.scaling_rule`.

```
raw_t = fee_share_used / ref_share      # Übertragung: rein fEE-getrieben, kein Sockel
raw_d = demand_twh / ref_demand         # Verteilung: mixunabhängiger Sockel
```

**Ist.** Der Verteilnetzblock skaliert mit dem Bedarf und fällt bei fEE → 0 nicht weg. Der Übertragungsnetzblock skaliert weiterhin **linear von null** mit der genutzten fEE-Arbeit. Folge (nachgerechnet, exakt reproduziert):

| Preset | Übertragungsnetz €/MWh | Verteilnetz €/MWh |
| --- | ---: | ---: |
| Kostenminimum (Kernkraft) | **3,4** | 19,8 |
| 80 % EE + Gas | **14,6** | 19,8 |
| 100 % Erneuerbare | **20,1** | 19,8 |

**Beanstandung.** Das Modell unterstellt damit, dass ein Deutschland mit 16,7 % fluktuierender Erzeugung bis 2045 **3,4 €/MWh** an Übertragungsnetz braucht — in Summe rund 55 Mrd. € über zwanzig Jahre für das gesamte deutsche Höchstspannungsnetz. Das ist aus Netzsicht nicht haltbar. Übertragungsnetze werden gebaut und ersetzt für: Altersersatz (große Teile stammen aus den 1960er/70er Jahren und erreichen bis 2045 planmäßig ihr Nutzungsdauerende), n-1-Redundanz, Lastzuwachs durch Elektrifizierung und Rechenzentren, Anschluss neuer Großkraftwerke (auch Kernkraftblöcke brauchen Höchstspannungsanbindung und Abfuhrkapazität), Systemdienstleistungen und Blindleistungskompensation. Die exakt selben Argumente, mit denen das Verteilnetz zu Recht einen Sockel bekommen hat, gelten eine Spannungsebene höher weiter — nur die HGÜ-Korridore sind wirklich fEE-spezifisch.

Der eigene Datensatz sagt es sogar: `distribution…note` nennt „Altersersatz" ausdrücklich als Treiber des Verteilnetzsockels. Für das Übertragungsnetz wird derselbe Treiber nicht angesetzt.

**Warum das rangentscheidend ist.** Die Differenz Kostenminimum ↔ 80 % EE + Gas beträgt allein im Übertragungsnetz **11,2 €/MWh**. Der neue Headline-Befund lautet: *„Mit CCS auf beiden Seiten führt das Kernkraft-Szenario mit 90,3 %, Median-Vorsprung 18,2 €/MWh."* **11,2 von 18,2 €/MWh — 62 % — sind die Netzregel, nicht die Technologie.**

Sensitivität (gerechnet mit derselben CRF):

| Übertragungs-Sockelanteil | Differenz KKW ↔ Gas | verbleibender CCS-Vorsprung |
| ---: | ---: | ---: |
| 0 % (heutiges Modell) | 11,2 | 18,2 |
| 40 % | 6,7 | ~13,7 |
| 60 % | 4,5 | ~11,5 |

Die Aussage kippt nicht — aber die 90,3 % würden spürbar fallen, und die Zahl steht in der Executive Summary.

**Vorschlag.** Entweder einen ausgewiesenen Übertragungs-Sockel einführen (`min(1,0; a + (1−a)·fEE_used/ref)` mit a als Setzung, z. B. 30–50 %, Badge **M**), oder — Minimalvariante — mindestens einen Sensitivitätslauf ausweisen und **im Text neben die 90,3 % schreiben**, wie viel davon aus der Netzregel stammt. Solange das nicht dasteht, ist der Kernbefund nicht prüfbar, obwohl die Rechnung offen liegt.

---

## SCHWER

### N2 · Gaspreis und CCS-CAPEX werden für dieselbe Größe zweimal unabhängig gezogen

**Fundstelle** — `monte_carlo.py` Z. 128–152, `draw_plan()`:

```python
DRAW_TECHS = [..., "gas_ccgt", "gas_ccs", ...]
DRAW_FIELDS = [..., "fuel_eur_mwh_th", "ccs_cost_eur_t", "capture_rate"]
# → je (tech, field) ein eigener Ziehungseintrag
```

`gas_ccgt.fuel_eur_mwh_th` und `gas_ccs.fuel_eur_mwh_th` sind **beide** Dreieck(20/35/60) und werden als **zwei unabhängige Ziehungen** geführt. Das ist derselbe physische Rohstoff am selben Handelsplatz. In einer Ziehung kann das GuD 20 €/MWh_th zahlen und die CCS-Anlage 60.

Dasselbe gilt für `capex_eur_kw`: `gas_ccs` ist im Datensatz **definitorisch** als Faktor 1,9/2,0/2,2 auf den GuD-CAPEX beschrieben, wird aber als eigenständige Verteilung 1.900/3.200/4.840 unabhängig gezogen. Die Kopplung geht dabei verloren.

**Warum das ernst ist.** Kapitel 6 verkauft als *die* methodische Korrektur der Version 0.2, dass gepaarte Ziehungen („common random numbers", „dieselben Parameter in jeder Welt") den Überlappungs-Fehlschluss ersetzen. Genau diese Garantie ist hier gebrochen — und zwar an der Stelle, an der v0.2b seine neue Kernaussage aufhängt.

**Reichweite, ehrlich abgegrenzt.**
- Die beiden **entscheidungsrelevanten Paare** sind *nicht* betroffen: `kostenminimum` vs. `ee80_gas` nutzen beide `gas_ccgt`, `kostenminimum_ccs` vs. `ee80_gas_ccs` beide `gas_ccs` — innerhalb eines Paars ist die Ziehung identisch.
- Betroffen ist **jedes Paar, das die CCS-Grenze überschreitet** — insbesondere die publizierte Zeile *„CCS-Variante teurer als ihr Basis-Preset: 99,9 / 99,6 %"*. Die Streuung der Differenz zweier unabhängiger Dreieck(20/35/60)-Ziehungen liegt bei rund **12 €/MWh_th ≈ 22 €/MWh_el** — in derselben Größenordnung wie der gesamte CCS-Aufschlag von 29,8 €/MWh. Dass diese Zeile nicht 100 % zeigt, ist mit hoher Wahrscheinlichkeit ein Artefakt dieser Doppelziehung, kein Befund.

**Vorschlag.** Gaspreis als **eine** Ziehung auf Systemebene führen (wie WACC und CO₂-Preis) und auf beide Gas-Technologien anwenden; CCS-CAPEX als gezogenen **Faktor** auf den gezogenen GuD-CAPEX statt als eigene Absolutverteilung. Beides ist ein Eingriff von wenigen Zeilen, ändert aber den Ziehungsplan und damit alle MC-Zahlen — also vor dem Redigat machen, nicht danach.

---

### N3 · Die Ist-2025-Validierung ist zirkulär — und 51 % des Ankers sind ein Haushalts-Netzentgelt

**Fundstelle** — `validate_model.py` Z. 467–469:

```python
band_lo = (boerse or 0) + (netz or 0)     # 86,5 + 93 = 179,5
in_band = band_lo <= res["lscoe_eur_mwh"] <= band_hi
```

`netz` ist **dieselbe** Zahl, die das Modell als Input verwendet (`system.grid.ist_2025_eur_mwh` = 93 €/MWh).

**Beanstandung (a) — der Test prüft nur die Hälfte.** Der Netzterm steht auf beiden Seiten der Ungleichung und kürzt sich heraus. Was tatsächlich geprüft wird, ist: *„sind die Nicht-Netz-Kosten des Modells (87,8 €/MWh) mindestens so groß wie der Börsenstrompreis 2025 (86,5)?"* Das ist eine legitime, aber sehr schwache Prüfung — und keinesfalls die Rückrechnung gegen belegte Ist-Kostenblöcke, die K3 verlangt hatte. Dass das Ergebnis 180,8 nur 1,3 €/MWh über der Untergrenze liegt, wird in `modell_v02_ergebnis.md` korrekt als „Zufall" bezeichnet — es ist aber kein Zufall, sondern strukturell: der Abstand *ist* per Konstruktion 87,8 − 86,5. Der Bericht sagt „Größenordnungsprüfung, kein Nachweis"; er sollte **Zirkularität** sagen.

**Beanstandung (b) — 93 €/MWh ist ein Haushaltstarif und steht als solcher nirgends im Artefakt.** Der Wert macht **93 von 180,8 €/MWh = 51,4 %** des Ist-Ankers aus. Er stammt aus `netzentgelt_haushalt_ct_kwh` (9,3 ct/kWh, Konfidenz ★★ im Dossier) und wird auf den gesamten Bruttostromverbrauch angewandt. Industrie- und Sonderkunden zahlen deutlich weniger (§ 19 StromNEV, atypische Netznutzung, Bandlastprivilegien) — der systemweite Durchschnitt liegt substanziell darunter. `modell_v02_ergebnis.md` notiert das ehrlich („Konfidenz C"), **das veröffentlichte Papier tut es nicht**: dort steht nur „das heutige Netzentgelt von 93 €/MWh [C]". Eine Konfidenzstufe ist kein Vorbehalt.

**Beanstandung (c) — zwei Fehler heben sich zufällig auf.** 9,3 ct/kWh ist der Tarif **nach** dem 6,5-Mrd.-Bundeszuschuss; das eigene Dossier verlangt ausdrücklich, für Gesamtkostenbetrachtungen zu **addieren, nicht zu saldieren** (ohne Zuschuss: 131 €/MWh, im Datensatz als `max` hinterlegt, aber nicht verwendet). Die Haushaltsgewichtung zieht nach oben, die fehlende Zuschuss-Rückrechnung nach unten. Dass 93 am Ende ungefähr passt, ist ein Zufall aus zwei gegenläufigen Fehlern — kein Ergebnis. Für die Zahl, die über die Hälfte des einzigen falsifizierbaren Ankers trägt, ist das zu wenig.

**Vorschlag.** (1) Im Whitepaper einen Satz: *„93 €/MWh ist ein Haushalts-Netzentgelt nach Bundeszuschuss; der systemweite Durchschnitt liegt darunter, die Vollkosten ohne Zuschuss darüber (131 €/MWh). Beide Ränder sind im Datensatz hinterlegt; der Anker reagiert auf diese Wahl mit ± 38 €/MWh."* (2) Den Validierungsbericht umformulieren: die Untergrenze des Korridors enthält den Modell-Input und ist deshalb keine unabhängige Prüfung. (3) Den Anker zusätzlich gegen die **zweite, wirklich unabhängige** Größe halten, die Runde 1 genannt hat und die weiterhin ungenutzt ist: modellierte Abregelung 6,2 TWh gegen Ist 9,4 TWh (−34 %). Das steht im Validierungsbericht, aber in keinem Artefakt.

---

### N4 · Der Peaker kauft Gas zum Jahresdurchschnitt — in genau den teuersten Stunden

**Fundstelle** — `model._fuel_eur_mwh_el`; `fuel_eur_mwh_th` als einzelner Jahreswert.

**Beanstandung.** Der Backup-Park läuft mit **1.282 h** (Kostenminimum) bzw. **1.930 h** (80 % EE + Gas) — und zwar nicht irgendwann, sondern in Kälteperioden und Dunkelflauten, also genau dann, wenn auch der Gasmarkt eng ist. Er bezahlt im Modell aber einen flachen Jahres-Commodity-Preis (TTF-Frontmonat-Durchschnitt). In der Beschaffungsrealität eines Kraftwerksbetreibers fehlen damit:

- **Saisonalität und Knappheitsaufschlag.** Q1-/Winterkontrakte notieren strukturell über dem Jahresmittel; kurzfristig abgerufene Mengen zusätzlich.
- **Gasnetzentgelte für das Kraftwerk.** Entry-/Exit-Entgelte, gebuchte feste Kapazität — ein Backup-Kraftwerk muss Kapazität ganzjährig buchen und nur wenige hundert Stunden nutzen. Das ist genau die Missing-Money-Logik eine Stufe tiefer und schlägt bei niedrigen Volllaststunden voll auf die €/MWh_el durch.
- **Bilanzierungs- und Regelenergiekosten Gas**, Umlagen.

**Richtung.** Alle Punkte verteuern die gasgestützten Pfade, also **gegen** das aktuelle Ergebnis. Zusammen mit dem zu niedrigen Zentralwert (35 gegen Spot 62–64, siehe 1.1) ist der Gas-Pfad nach dem Fix immer noch tendenziell zu billig gerechnet — was den 46,1-%-Münzwurf und den 90,3-%-Vorsprung beide in dieselbe Richtung verschiebt.

**Vorschlag.** Kein neuer Parameter nötig: Ein ausgewiesener Aufschlag „Winter-/Flexibilitätsprämie + Gasnetzentgelt" als Setzung (**M**) auf `fuel_eur_mwh_th` für den Backup-Betrieb, oder mindestens ein Satz in Kap. 4, dass der Brennstoffpreis ein Jahresmittel ist und ein Backup-Kraftwerk nicht zum Jahresmittel einkauft.

---

### N5 · CCS auf einem 1.282-Stunden-Backup-Park ist kein Produkt, das jemand anbietet

**Fundstelle** — `modell_v02_ergebnis.md` 4b.1/4b.5, Limitation `ccs_on_full_backup_fleet` (severity hoch).

Das Papier führt die Auslegung als **Kosten**-Obergrenze („ein real optimiertes System würde CCS nur an den hoch ausgelasteten Blöcken bauen"). Das ist richtig, aber unvollständig — es ist auch eine **Machbarkeits**frage, und aus Betreibersicht die härtere:

- Post-Combustion-Aminwäsche ist dampfintegriert; die Solvent-Regeneration entnimmt Niederdruckdampf aus der Dampfturbine. Ein Block, der aus dem Stillstand in Minuten hochfahren soll, hat diesen Dampf nicht — die Abscheidung ist beim Anfahren typischerweise außer Betrieb.
- Amine degradieren unter Lastwechseln und Sauerstoffeintrag; ein Zyklierbetrieb mit hunderten Starts pro Jahr ist kein ausgelegter Betriebsfall.
- Es gibt weltweit keine Referenz für eine zyklisch gefahrene CCS-Spitzenlastanlage. Die vorhandenen NGCC-CCS-Auslegungen sind Grundlastfälle — genau die Basis, aus der die NETL/IEAGHG-CAPEX-Faktoren stammen, die hier auf einen Peaker übertragen werden.

**Konsequenz für die Erzählung.** Die neue Kernaussage („auf vergleichbarem Emissionsniveau führt Kernkraft mit 90,3 %") beruht vollständig auf einer Konfiguration, die so niemand bauen würde — auf **beiden** Seiten. Das entwertet den Befund nicht: Er zeigt korrekt, dass der Kostenvergleich ohne Emissionsgleichheit schief ist. Aber „so, wie die geprüfte Studie ihren Gas-Pfad meint" ist zu freundlich formuliert: Die Studie meint einen ausgelasteten CCS-Block, das Modell rechnet einen abgeschiedenen Peaker.

**Vorschlag.** Einen Satz ergänzen — *„Beide CCS-Varianten sind Rechengrößen zur Herstellung von Emissionsgleichheit, keine Auslegungsvorschläge; eine zyklisch gefahrene Abscheidung ist technisch nicht demonstriert"* — und die impliziten Vermeidungskosten (531 bzw. 378 €/t) nicht nur im Ergebnisdokument, sondern **im Papier** zeigen. Sie sind der ehrlichste Satz des ganzen CCS-Kapitels.

---

### N6 · Die Finanzierungsseite der erneuerbaren Flotte fehlt weiterhin vollständig

**Fundstelle** — Volltextsuche „PPA", „Merchant", „Kannibalisierung", „Marktwert": **0 Treffer** in beiden Artefakten.

Kapitel 7 argumentiert jetzt richtig, dass die EEG-Marktprämie als De-facto-CfD wirkt und den WACC senkt. Was daraus folgt und nicht dasteht: Deutsche PV- und Onshore-Projekte werden real über einen Mix aus Marktprämie, Corporate PPA und Merchant-Tail finanziert; bei über 575 Negativpreisstunden (2025) verlangen Banken zunehmend Abschläge auf die Erlösprognose. Für die Realisierbarkeit eines 400-GW-PV-Pfads ist die Bonität verfügbarer Offtaker oft die bindende Restriktion, nicht die LCOE. Das ist die exakte Spiegelung des „Wer baut die Reserve?"-Kastens für die andere Hälfte des Systems — und der Kasten steht bereits, es fehlt ein Absatz darin.

Zusammen mit S2 (technologiespezifischer WACC) wäre das ein einziger, geschlossener Redaktions- und Rechenschritt.

---

## MITTEL

### N7 · Die CCS-Massenbilanz geht nicht auf: 116 % des eingesetzten Kohlenstoffs werden verbucht

**Fundstelle** — `model.py` Z. 166: `captured = ef_th / eta * rate`; `gas_ccs.emission_factor_t_mwh` = 0,120.

| Position | t CO₂/MWh_el bei η = 0,52 |
| --- | ---: |
| Brennstoffeintrag (`0,2418 / 0,52`) | 0,465 |
| davon abgeschieden (× 0,90), bepreist mit 80 €/t | 0,419 |
| Restemission, bepreist mit 75 €/t | 0,120 |
| **Summe verbucht** | **0,539 = 116 % des Eintrags** |

Ursache: Die abgeschiedene Menge wird aus einem **Lebenszyklus**-Faktor abgeleitet (0,403 t/MWh_el × η), enthält also die Vorkette — die eine Abscheidung am Schornstein nicht erfasst. Die Restemission ist zusätzlich ein Lebenszykluswert. Beide Größen sind je für sich begründet, aber gemeinsam nicht konsistent: entweder wird auf den Verbrennungsfaktor abgeschieden, oder die Restemission ist `(1 − Rate) × Eintrag + Vorkette`. Zurzeit ist es weder das eine noch das andere, und kein Testvektor prüft die Bilanz.

**Größenordnung, ehrlich.** Beide Über­buchungen zusammen belasten den CCS-Pfad mit rund 11 €/MWh_el Gasarbeit. Auf Systemebene sind das ~2,3 €/MWh Differenz zwischen den beiden CCS-Presets — der 18,2-€/MWh-Vorsprung würde auf ~16 fallen. **Nicht rangentscheidend**, aber es ist ein handwerklicher Fehler in einem Papier, dessen Alleinstellungsmerkmal Nachrechenbarkeit ist. Ein Testvektor „captured + residual ≤ input" gehört in `export_test_vectors.py`.

### N8 · Die CO₂-Transportinfrastruktur für 110,6 Mt/a taucht in keiner Kostenzeile auf

`gas_ccs.ccs_cost_eur_t` (50/80/**100** €/t) ist ein Vollkettensatz je Tonne. Das Papier weist die Speicherverfügbarkeit korrekt als Lücke aus (`ccs_storage_availability`, Konfidenz C) und nennt selbst, dass das größte europäische Projekt derzeit einen niedrigen einstelligen Mt-Bereich transportiert. Was daraus nicht gezogen wird: **110,6 Mt/a im Gas-CCS-Pfad** wären ein CO₂-Sammelnetz in der Größenordnung eines neuen nationalen Gasnetzes, mit Verdichterstationen, Offshore-Anbindung, Genehmigungsverfahren und Akzeptanzfragen. Ein €/t-Satz aus Anlagenstudien deckt so einen Netzaufbau nicht ab, und das Papier räumt selbst ein, dass europäische Schätzungen bei 70–250 €/t liegen. Die CCS-Zahlen sind damit doppelt am unteren Rand — der Datensatz sagt es, das Artefakt bündelt es nicht.

**Vorschlag.** Ein Satz im CCS-Kasten: *„Der Kostensatz ist ein Anlagensatz. Die Transport- und Speicherinfrastruktur für 111 Mt/a ist weder modelliert noch in Deutschland vorhanden; die eigene Literaturrecherche nennt 70–250 €/t."*

### N9 · Faktenfehler und ein sprödes Datenband im Marktdesign-Abschnitt

1. **`strommix-story.html` Z. 2576 nennt StromVKG „Kraftwerkssicherungsgesetz".** Falsch in beide Richtungen: StromVKG steht laut eigenem Datensatz für *„Gesetz zur Sicherung der Versorgungssicherheit Strom und zur Bereitstellung neuer Kapazitäten"*, der frühere Arbeitstitel war *Kraftwerkssicherheitsgesetz (KWSG)*. Die Story mischt beides zu einem dritten, nicht existierenden Namen. Für einen Branchenleser ist das die Art Fehler, die den Rest des Absatzes mit entwertet — und der Datensatz enthält den korrekten Namen, er wird nur nicht verwendet.
2. **`whitepaper-strommix.js` Z. 2792** rendert *„Kapazitätsmechanismus ab `k.inbetriebnahme_spaetestens`"* — dasselbe Feld, das eine Zeile darüber die Inbetriebnahme aus Runde 1 datiert. Zwei verschiedene Sachverhalte an einem Feld. Aktuell stimmt es zufällig (beides 2031); verschiebt sich die Inbetriebnahme, verschiebt sich der Kapazitätsmechanismus im Text mit. Eigenes Feld anlegen.

### N10 · Rangwahrscheinlichkeiten mit einer Nachkommastelle bei 1.000 Ziehungen

Bei N = 1.000 liegt der Standardfehler einer Wahrscheinlichkeit nahe 50 % bei rund **1,6 Prozentpunkten**, bei 90 % bei rund 0,9. „46,1 %" und „90,3 %" suggerieren eine Auflösung, die die Stichprobe nicht hat. Der Beleg steht im eigenen Ergebnisdokument: Dieselbe Konfiguration `base` zeigt in Abschnitt 3 **46,1 %** und in Abschnitt 4b.4 **44,9 %** — 1,2 Prozentpunkte Unterschied, entstanden allein dadurch, dass der Ziehungsplan von 24 auf 30 Größen gewachsen ist und die Zufallsfolge anders läuft. Das ist Rauschen, das wie ein Ergebnis aussieht.

**Vorschlag.** Entweder N auf 10.000 erhöhen (die Rechnung ist billig und läuft ohnehin im Browser) oder Wahrscheinlichkeiten ganzzahlig ausgeben mit einem Satz zum Simulationsfehler: *„± 2 Prozentpunkte aus der endlichen Ziehungszahl."* Letzteres kostet nichts und schützt vor genau der Rückfrage, die im Gremium kommt.

---

## KLEIN

- **KL-a · Der stärkste Redispatch-Fakt bleibt ungenutzt.** Dass 2025 der größte Engpassmanagement-Block *konventioneller* Redispatch (> 1,2 Mrd. €) und Reservekraftwerke (~1,4 Mrd. €) waren und nicht die EE-Abregelung, steht wörtlich im Dossier samt Schlussfolgerung („die verbreitete Gleichsetzung ist quellenmäßig nicht gedeckt"). Das Papier ist für solche Richtigstellungen gebaut und lässt sie weiter aus. Drei Sätze. Unverändert aus Runde 1 (KL3).
- **KL-b · Regionale Netzentgeltspreizung** (Brandenburg/MV gegen Hamburg/NRW) und die 6,5-Mrd.-Transferleistung („Netzkosten sinken nicht, sie werden verlagert") sind weiterhin nicht im Artefakt. Das ist die anschaulichste Illustration der Kernthese des Papiers im ganzen Datensatz.
- **KL-c · Emissionsfaktor-Proxy** (KL2 aus Runde 1) ist unverändert, aber jetzt zweifach maschinenlesbar deklariert (`emission_factor_proxy`, `gaps.emissionsfaktor_direkt`) und im Limitationskapitel ausformuliert. Für eine Veröffentlichung reicht das; ersetzen bleibt trotzdem richtig, weil er über N7 in die CCS-Rechnung durchschlägt.

---

# 3 · Verständlichkeit für ein Vorstandsgremium

Kurze Antwort: **Executive Summary nein, Rangwahrscheinlichkeits-Tabelle nein.** Beides ist fachlich gut und für ein Fachpublikum sehr stark. Für ein Gremium mit 15 Minuten sind es Rückfragen-Generatoren.

## 3.1 Executive Summary — neun Punkte, drei konkurrierende Kernbotschaften

**Was schiefgeht.**

1. **Neun Aussagen.** Eine Vorstandsvorlage trägt drei bis fünf. Ab dem sechsten Punkt liest niemand mehr, und die drei wichtigsten (MC-Ergebnis, Emissionsgleichheit, Ist-Anker) stehen ganz hinten — sie werden nachgeladen, wenn die Monte-Carlo-Rechnung durch ist.
2. **Drei „das Entscheidende ist X"-Sätze nebeneinander.** Punkt 1: der Kapitalkostensatz entscheidet mehr als die Technologiewahl. Punkt 4: die Systemkosten entscheiden sich an der Speicherfrage. Punkt 8: Emissionsgleichheit dreht das Ergebnis. Jeder für sich stimmt; zusammen bleibt die Frage offen, was denn nun. Das Ergebnisdokument hat die Antwort bereits („drei Setzungen: Emissionsnebenbedingung, Institutionenrahmen, Überschreitungs-Empirie") — sie steht nur nicht in der Summary.
3. **Eine Tabelle im Fließtext.** Punkt 7 zählt sechs Szenarien mit `P50 [P5–P95]` in einem Komma-Satz auf. Das ist nicht lesbar, das ist eine Tabelle in Prosa.
4. **Unerklärte Fachbegriffe im Einstiegstext:** LSCOE, P50, P5–P95, „gepaarte Ziehungen", „Median-Δ", „entschieden sind 8 von 15 Paaren", Konfidenz-Badges A/B/C/M. WACC und CAPEX sind für einen Vorstand in Ordnung — der Rest nicht.
5. **Keine Handlungsrelevanz.** Es steht nirgends, was aus alldem robust folgt, unabhängig davon, welche Setzung man wählt. Genau danach fragt das Gremium.

**Konkreter Vorschlag: fünf Punkte, jeder maximal drei Zeilen.**

> **1 · Kein Pfad ist billig.** Alle geprüften Zukünfte kosten zwischen 152 und 245 €/MWh Systemkosten. Das heutige System liegt in derselben Größenordnung — bei 136 Mt CO₂ im Jahr.
>
> **2 · Über die Rangfolge entscheidet nicht die Technologie, sondern drei Setzungen:** ob beide Seiten dieselbe Emissionsauflage tragen, welchem Institutionenrahmen man einen Kernkraftbau zutraut, und ob man die empirischen Kostenüberschreitungen einrechnet. **Jede einzelne bewegt das Ergebnis stärker als der Abstand zwischen den Szenarien.**
>
> **3 · Auf gleichem Emissionsniveau liegt das Kernkraft-Szenario vorn — in etwa 9 von 10 Rechenläufen.** Ohne Abscheidung ist es ein Münzwurf; dann vergleicht man aber ein System mit 28 gegen eines mit 107 Mt CO₂.
>
> **4 · Der Kapitalkostensatz ist der stärkste Einzelhebel — und er ist politisch.** Marktprämie, Kapazitätsmechanismus und CfD senken ihn alle. Wer über Technologiekosten streitet, streitet meist über Finanzierungsbedingungen.
>
> **5 · Was dieses Papier nicht beantwortet: wer es baut.** Der modellierte Reservepark umfasst 20 bis 137 GW. Ausgeschrieben sind derzeit 11 GW; die erste Runde über 4,5 GW läuft am 1. September 2026.

Die neun Fachaussagen bleiben — als Kapitel 8 („die belastbaren Aussagen im Detail"), das es bereits gibt. Die „Unsicherheit:"-Zeile je Punkt ist gut und sollte bleiben; sie ist das Beste an der jetzigen Summary.

## 3.2 Rangwahrscheinlichkeits-Tabelle — richtig gerechnet, falsch herum aufgebaut

**Was gut ist:** Die zweite Tabelle („Die entscheidungsrelevanten Paare im Detail") ist genau das, was ein Gremium braucht — fünf Zeilen, jede mit einem erklärenden Untertitel („mit CCS auf beiden Seiten — die faire Ebene"). Der Hinweis, „entschieden" heiße nicht, dass die Frage sachlich geklärt sei, ist die richtige Warnung an der richtigen Stelle.

**Was schiefgeht:**

1. **Die 6×6-Matrix steht zuerst.** 30 Zellen, davon 15 redundant (P(A<B) = 1 − P(B<A)) und keine Leserichtung. Der Vorstand liest zuerst das, was er nicht braucht.
2. **Die Kopfzeile lautet „P(Zeile < Spalte)".** Das „<" bedeutet hier „günstiger", nicht „kleiner als" — der Leser muss zweimal übersetzen. Bei einer Kostengröße ist beides zufällig dasselbe, was die Verwechslungsgefahr eher erhöht.
3. **Das Szenario heißt „Kostenminimum".** Das ist das GES-Label — aber ein Vorstand liest „Kostenminimum" als *Ergebnis* („das ist die billigste Variante"), während die Kostenminimalität genau die offene Frage der Tabelle ist. Das ist die gefährlichste einzelne Verständlichkeitsfalle im ganzen Papier.
4. **„Median Δ €/MWh" und „P5 … P95 der Differenz"** sind Statistikvokabular ohne Übersetzung.
5. **Acht Schalter über der Tabelle.** Wer eine Konfiguration umstellt und weglegt, hat andere Zahlen im Kopf als die zitierten. Es fehlt ein fixer Basisfall-Satz über dem Regler.
6. **Eine Nachkommastelle** bei 1.000 Ziehungen (→ N10).
7. **Summary und Tabelle widersprechen sich optisch.** Der Datensatz führt das Paar `kostenminimum_ccs` vs. `ee80_gas_ccs` mit `decided: false` — die Tabelle zeigt in der Urteilsspalte also **„offen"**, weil 90,3 % unter der 95-%-Schwelle liegen. Die Executive Summary formuliert dieselbe Zahl als *„das Kernkraft-Szenario führt mit 90,3 %"*, was wie ein Ergebnis klingt. Beides ist für sich korrekt, nebeneinander wirkt es wie ein Widerspruch — und ein Gremium findet solche Stellen zuverlässig. Entweder in der Summary „führt deutlich, aber nach unserem eigenen Kriterium noch nicht entschieden" ergänzen, oder die Schwelle in der Summary mitnennen.

**Konkrete Vereinfachungen — alle rein redaktionell:**

| Jetzt | Vorschlag |
| --- | --- |
| Matrix zuerst, Paartabelle darunter | **Paartabelle zuerst**, Matrix darunter oder in ein `<details>`-Element („alle Paare im Überblick") |
| „Kostenminimum" | **„Kernkraft-Pfad (GES: ‚Kostenminimum')"** — einmal ausgeschrieben, danach „Kernkraft-Pfad" |
| Spaltenkopf „P(Zeile < Spalte)" | **„In wie vielen von 100 Rechenläufen ist die Zeile günstiger als die Spalte?"** |
| „P(erstes günstiger) 90,3 %" | **„günstiger in 90 von 100 Läufen (± 2)"** |
| „Median Δ €/MWh: −18,2" | **„typischer Unterschied: 18 €/MWh günstiger"** |
| „P5 … P95 der Differenz: −35,8 … +7,0" | **„in 9 von 10 Läufen zwischen 36 €/MWh günstiger und 7 €/MWh teurer"** |
| Spalte „Urteil: entschieden / offen" | **„eindeutig innerhalb der Spannen" / „offen"** — „entschieden" klingt nach Sachentscheidung |
| — | **Ein fixer Satz über dem Regler:** „Basisfall: WACC 5 %, CO₂ 75 €/t, ohne Kostenüberschreitung. Alle im Text zitierten Zahlen beziehen sich darauf." |
| — | **Eine Fußzeile unter der Tabelle:** „11 von 18 €/MWh des Vorsprungs im Paar 2 stammen aus der Netzregel (Kap. 5), nicht aus der Technologie." (nach N1) |

Mit diesen acht Änderungen — keine davon kostet mehr als zehn Minuten — würde ich die Tabelle einem Vorstand vorlegen.

---

# 4 · Urteil

**Fix-Quote 53 % (4,25 von 8) — bei durchgehend hoher Qualität der tatsächlich umgesetzten Fixes.** Nichts ist kosmetisch. Der Gaspreis ist ein echter Parameter mit ehrlicher Konfidenzstufe und benannter Asymmetrie. Der Netz-Split ist gerechnet, exakt reproduzierbar und die Treiberzuordnung ist zweifach als Setzung markiert. Der Marktdesign-Abschnitt trägt die richtigen Fakten — 4,5 GW am 01.09.2026 verifiziert gegen den Datensatz — und zieht sie datengebunden statt hartkodiert. Die falsche Redispatch-Notiz ist mit der richtigen neuen Begründung korrigiert. Das ist besseres Handwerk als in den meisten Auftragsstudien.

**Vor Veröffentlichung müssen aus meiner Sicht drei Dinge passieren:**

1. **N1 — der Übertragungsnetz-Sockel.** Solange 11,2 der 18,2 €/MWh des neuen Kernbefunds aus einer halb umgesetzten Netzregel stammen, ist die Aussage „mit CCS auf beiden Seiten führt Kernkraft mit 90,3 %" nicht vorlagefähig. Entweder Sockel einführen oder die Herkunft neben die Zahl schreiben.
2. **N2 — die doppelte Gaspreis-Ziehung.** Kapitel 6 verkauft gepaarte Ziehungen als die methodische Korrektur der Version. Die Garantie darf nicht ausgerechnet dort brechen, wo v0.2b seine neue Kernaussage aufhängt.
3. **S4 — die Auktions-Deutungsrichtung.** Zwei Sätze, seit Runde 1 offen, und der einzige Punkt in diesem Papier, an dem ein Marktteilnehmer sagen wird: *Das stimmt einfach nicht.*

**Danach, aber vor der Verbreitung an ein Nicht-Fachpublikum:** N3 (Zirkularität und Haushaltstarif benennen), die fünf-Punkte-Summary und die acht Redaktionen an der Rangtabelle.

**S2 (technologiespezifischer WACC) bleibt der größte offene Modellpunkt.** Er ist keine Voraussetzung für die Veröffentlichung, aber er wird die erste Frage in jedem Investment Committee sein — und das Papier hat sich diese Frage mit dem neuen Kapitel 7 selbst gestellt, ohne sie zu beantworten.

**Was ich in Runde 1 nicht erwartet hätte und ausdrücklich anerkenne:** Dass die Ehrlichkeit über den Netzblock nach der Korrektur *zugenommen* hat statt abzunehmen. Ein Papier, das den eigenen Vergleichbarkeits-Grund („dieselbe Vereinfachung wie GES") ausdrücklich für ungültig erklärt, nachdem es die Vereinfachung repariert hat, und das eine Nebenbotschaft („heute ist am billigsten") aktiv zerstört, weil die neue Rechnung sie nicht mehr trägt — so etwas sieht man selten. Das ist die Grundlage, auf der die drei verbliebenen Punkte schnell zu schließen sind.

---

*Review erstellt am 2026-08-19. Keine Änderungen an Prüfobjekten, Daten oder Skripten vorgenommen; kein Commit. Alle Nachrechnungen (CRF, Netzkomponenten, CCS-Massenbilanz, Ziehungsplan) gegen `model.py`, `monte_carlo.py`, `validate_model.py` und `model_params.json` verifiziert.*
