---
review: "Persona-Review 04 · RUNDE 2 — Erneuerbare Energien / Marktdaten"
persona: "Expert:in erneuerbare Energien (Fraunhofer-/Agora-/BWE-Profil), Schwerpunkt Marktdaten PV, Wind on/offshore, Batteriespeicher, H2-Kette, Systemkostenzuordnung"
runde: 2
vorgaenger: "strommix/research/persona_reviews/04_ee_experte.md"
datum: "2026-08-19"
pruefobjekt:
  - "strommix-story.html — Akt 4 (Schwerpunkt), Limits-Sektion, Akt 2/Schritt 2"
  - "whitepaper-strommix.html + whitepaper-strommix.js — Kap. 5/6, Kap. 9 (Limitationen), Fazit"
  - "strommix/research/modell_v02_ergebnis.md — Abschnitt 4b"
  - "strommix/data/monte_carlo_reference.json, model_params.json, story_data.json"
  - "strommix/scripts/model.py (Netzblock, Zeile 975–1056), monte_carlo.py"
fix_quote: "5 von 7 fachlich behoben, 1 teilweise, 1 offen — alle Fixes sind Modell-/Datenfixes, keine Textkosmetik"
befunde_r2: { kritisch: 1, hoch: 4, mittel: 5, niedrig: 3 }
---

# Persona-Review 04 · Runde 2 · Erneuerbare Energien

## Gesamturteil vorweg

Die drei kritischen Befunde aus Runde 1 sind **im Modell** behoben, nicht im Text. Der Netz-Split ist
sauber implementiert (`model.py` 1024–1056), die falsche Symmetrie-Behauptung ist gestrichen und
durch die richtige Asymmetrie-Aussage ersetzt, und der Wind-Volllaststunden-Befund steht jetzt
wörtlich als offene Frage da — inklusive des Zusatzes, dass 1.700 h und 2.400 h dann nicht dieselbe
Größe wären. Das ist ehrliche Arbeit, und die Selbstkorrektur beim Annahmen-Audit („Unser eigener
erster Annahmen-Check hat diesen Hebel gar nicht erst gefunden") ist besser als das, was ich
vorgeschlagen hatte.

**Die neue Emissionsgleichheits-Argumentation ist der stärkste inhaltliche Zugewinn dieser Runde —
und gleichzeitig die Stelle, an der die Story ihr eigenes methodisches Niveau unterschreitet.**
Die Argumentation ist im Kern richtig: Ein 152-gegen-155-Euro-Gleichstand zwischen 28 und 107 Mt
CO₂/a ist tatsächlich kein Technologievergleich. Die Umsetzung hat aber vier Probleme, von denen
eines sachlich falsch ist:

1. Der Schritt heißt „**Auf gleichem Emissionsniveau**" — und vergleicht 8,3 gegen 31,7 Mt CO₂/a.
   Das ist Faktor 3,8. Der Titel behauptet etwas, das die eigenen Daten nicht hergeben.
2. Die Story hat mit **kostenminimum (27,9 Mt) gegen ee80_gas_ccs (31,7 Mt)** ein Paar im Datensatz,
   das *wirklich* emissionsgleich ist, mit größerem Abstand (152,3 gegen 184,4 €/MWh) und das nach
   dem eigenen 95-%-Kriterium **entschieden** ist (P = 95,9 %). Sie erzählt stattdessen das schwächere,
   nicht-emissionsgleiche Paar, das **nicht entschieden** ist (P = 90,3 %, `decided: false`).
3. Für das Nicht-CCS-Paar erzählt die Story alle drei Konfigurationen (45 % / 64 % / 0 % mit
   Überschreitungs-Empirie). Für das CCS-Paar erzählt sie nur die Basiskonfiguration (90 %). Die
   Überschreitungs-Empirie dreht das CCS-Paar auf **4,3 %** — diese Zahl steht in der Datentabelle
   und in keinem Satz.
4. Rund **11 der 21 €/MWh Vorsprung** des Kernkraft-Szenarios im CCS-Vergleich stammen weiterhin
   aus der Netzkostenregel — der Setzung, die Runde 1 als größten Einzelhebel identifiziert hat.
   Die Story nennt diese Zahl nirgends.

Die Richtung der Aussage überlebt jede dieser Korrekturen. Die Größe „90 Prozent" überlebt keine.

**Empfehlung: Akt 4 / Schritt 5 überarbeiten, sonst freigeben.** Der Rest ist Nachschärfung.

---

## 1 · Fix-Verifikation Runde 1

| ID | Befund R1 | Status | fachlich oder kosmetisch? |
|---|---|---|---|
| **K1** | Netzkosten linear mit fEE, 7,5 vs. 77,2 €/MWh | **fachlich behoben, Rest offen** | Modellfix (`model.py` 1024–1056): Verteilnetz 323 Mrd. € als mixunabhängiger Sockel mit `min(1; Bedarf/950)`, Übertragungsnetz 328 Mrd. € mit der **genutzten** fEE-Arbeit, beide gedeckelt, `grid_scaling_raw` im Ergebnis ausgewiesen, Alt-Regel als `legacy_fee_linear` erhalten. Nachgerechnet: 23,2 / 34,4 / 40,0 €/MWh statt 7,5 / 36,7 / 77,2. **Kein Alibi.** Offen: Die Zahlen erscheinen in der Story nirgends, und es fehlt die Gegen-Sensitivität (siehe E4). |
| **K2** | „trifft alle Szenarien gleichermaßen" ist falsch | **behoben** | Satz gestrichen, durch die Substitutions-Begründung ersetzt, mit Selbstkorrektur-Hinweis („Das war falsch."), in beiden Artefakten und als `import_dsm_asymmetry` im Datensatz. Der 20-GW-Interkonnektor-Vergleich mit GES steht drin. Offen: die zugesagte Überschlags-Sensitivität ist weiterhin nicht gerechnet — nirgends eine Zahl. |
| **K3** | Wind-Volllaststunden als erwiesener Fehler erzählt | **vollständig behoben** | Story Akt 2/Schritt 2 trägt jetzt „**Das bleibt eine offene Frage, kein erwiesener Fehler**", die Flottenwert-Lesart und den Volltext-Vorbehalt. `wind_flh_open_question` mit Konfidenz B im Datensatz, inkl. des Punkts, dass 1.700 h und 2.400 h dann keine gleichen Größen sind. Der unbelegte Vorwurf gegen „kursierende Annahmen-Audits" ist durch die Selbstnennung ersetzt — besser als mein Vorschlag. |
| **H1** | Dunkelflaute hängt an Uniper, Definitionsmischung, 48/72-h-Inkonsistenz | **teilweise** | `dunkelflaute_definition.interessenlage` benennt Uniper als Betreiber konventioneller Kapazität und die Wirkung der 10-h-Schwelle — und dreht den Spieß fair um („Umgekehrt blendet die DWD-Definition Erzeugungslücken von 10 bis 24 Stunden aus"). Die 48/72-h-Inkonsistenz ist aufgelöst (72-h-Zeile ist raus). **Nicht behoben:** Quelle `uniper-dunkelflaute-2026` trägt weiter **Konfidenz A**, und es ist keine unabhängige Gegenreferenz (DWD, Energy-Charts, ENTSO-E ERAA, Agora) hinzugekommen. Der doppelte Standard gegenüber der Kernkraft-Datenbasis besteht formal fort. |
| **H2** | Batterie: US-Trend auf DE übertragen, Untergrenze über dem eigenen Vergleichswert | **offen** | `technologies.battery.params.capex_eur_kwh` unverändert 180/210/260 €/kWh — die Untergrenze liegt weiter **über** dem im selben Projekt zitierten BNEF-Wert (~177 €/kWh, Quelle 3, Konfidenz A). Keine geografische Abgrenzung des Lazard-Trends. Wirkung klein (Batterie 3,5–5,3 €/MWh in den EE-Presets), aber es ist der einzige R1-Befund ohne jede Bewegung. |
| **H3** | Halbjahresprofil trifft die Saisonspeicher-Pfade härter | **teilweise** | Whitepaper vollständig behoben (Kap. 9: „Für Wasserstoff-Saisonspeicher ist ein Halbjahresprofil grundsätzlich zu kurz … Beide Varianten sind falsch"). Limitation `half_year_profile` ist im Datensatz und nennt den Sommerüberschuss. **Aber:** `renderLimits()` in der Story rendert sie nicht — die Story-Karte „Ein halbes Jahr Wetter" ist handgeschrieben und sagt weiterhin nur „die Backup-Mengen werden eher über- als unterschätzt". Der Story-Leser erfährt die Asymmetrie nicht. |
| **H4** | Kavernen-Mengenrestriktion fehlt | **behoben im Whitepaper, fehlt in der Story** | Whitepaper: Simulator-Warnung „**Physische Mengenrestriktion, keine Kostenfrage**" (30 TWh Umwidmungspotenzial gegen 130 TWh Bedarf 2045), plus eigene Fazit-Kernaussage, plus Regler-Hinweis. Sauber gemacht — inklusive des entscheidenden Satzes, dass das Modell Durchsatz und nicht Volumen bepreist. Story: **null Treffer auf „Kavern"**. Sie zeigt den H₂-Pfad mit 198,4 €/MWh, ohne zu sagen, dass er einen 300-TWh-Speicher unterstellt (siehe N1). |

**Fix-Quote: 5 von 7 fachlich behoben (K1, K2, K3, H3, H4), 1 teilweise (H1), 1 offen (H2).**
Entscheidend für die Bewertung: Es gibt **keinen kosmetischen Fix**. Wo etwas geändert wurde, wurde
das Modell oder der Datensatz geändert und das Ergebnis neu gerechnet. Das ist der Unterschied
zwischen einem Review, das ernst genommen wurde, und einem, das abgehakt wurde.

**Mittlere Befunde aus R1 nebenbei:** M5 behoben (die „nahe bei eins"-Formulierung ist raus, der
Text nennt jetzt korrekt die Technologieliste, für die überhaupt Faktoren existieren).
M6 halb behoben — GES-Dublette jetzt konsistent (beide C), IRENA konsistent (beide B), aber
**Lazard LCOE+ v19.0 steht weiterhin zweimal im Verzeichnis mit B (Nr. 36) und A (Nr. 38)**.
M1, M2, M3, M4, M7 unverändert offen; N1 („dreieinhalb" statt „gut drei") unverändert.

---

## 2 · Die Emissionsgleichheits-Argumentation

Das ist die Stelle, an der ein EE-Verband jetzt ansetzt. Ich prüfe sie so hart wie möglich — und
sage vorweg: **die Argumentation trägt.** Sie trägt nur nicht in der Form, in der die Story sie
erzählt.

### E1 · KRITISCH — „Auf gleichem Emissionsniveau" ist der falsche Titel für diesen Vergleich

**Fundstelle:** `strommix-story.html` 760 (Überschrift Akt 4 / Schritt 5), 2123 (Figurentitel);
`monte_carlo_headline.honest_statement` („Auf gleichem Emissionsniveau … führt das
Kernkraft-Szenario mit 90 Prozent"), gerendert im Zwischenruf nach Akt 4 (`#mc-honest`).

**Ist:** Verglichen werden `kostenminimum_ccs` (163,3 €/MWh, **8,3 Mt CO₂/a**) und `ee80_gas_ccs`
(184,4 €/MWh, **31,7 Mt CO₂/a**).

**Beanstandung:** Das ist kein gleiches Emissionsniveau, das ist Faktor 3,8. Die Ursache ist
trivial und unstrittig: Beide Pfade tragen denselben Abscheidungsgrad, aber der Gas-Pfad verbrennt
264,4 TWh Erdgas und das Kernkraft-Szenario 69,2 TWh. Wer beide mit derselben Technologie ausrüstet,
erzeugt **gleiche Technologie-Nebenbedingungen**, nicht gleiche Emissionen.

Das ist keine Wortklauberei, sondern der Kern der Kritik, die die Story selbst formuliert: „Das ist
kein Technologievergleich, das ist ein Emissions-Rabatt." Genau dieser Vorwurf trifft den
Nachfolge-Vergleich in abgeschwächter Form weiter. Ein Rest-Rabatt von 23,4 Mt CO₂/a zugunsten des
Gas-Pfads bleibt bestehen — bei einem CO₂-Preis von 75 €/t sind das 1,85 Mrd. €/a oder rund
**1,9 €/MWh**, die der Gas-Pfad in dieser Rechnung nicht zahlt, weil er sie nach dem
Modell-Emissionsfaktor nicht emittiert, sondern weil er mehr Restemission hat.

Bemerkenswert: `modell_v02_ergebnis.md` 4b.1 schreibt korrekt „**Auf vergleichbarem
Emissionsniveau** (8,3 vs. 31,7 Mt)". Zwischen Modellbericht und Story ist aus „vergleichbar"
„gleich" geworden. Das ist genau der Verstärkungsmechanismus, den die Story sonst kritisiert.

Die Figurenunterzeile sagt es übrigens richtig — „beide Pfade mit CO₂-Abscheidung · 8 gegen 32 Mt
CO₂/a statt 28 gegen 107". Der Titel darüber widerspricht ihr.

**Vorschlag (und er macht die Aussage der Story *stärker*, nicht schwächer):**
Der Datensatz enthält ein Paar, das **wirklich** emissionsgleich ist:

| Paar | Kosten | Emissionen | P(Kernkraft günstiger) | Urteil nach eigenem Kriterium |
|---|---|---|---|---|
| `kostenminimum_ccs` vs. `ee80_gas_ccs` (erzählt) | 163,3 : 184,4 | 8,3 : 31,7 Mt | 90,3 % | **offen** (`decided: false`) |
| **`kostenminimum` vs. `ee80_gas_ccs`** (nicht erzählt) | **152,3 : 184,4** | **27,9 : 31,7 Mt** | **95,9 %** | **entschieden** |

Das zweite Paar ist auf 14 % emissionsgleich, hat 32 statt 21 €/MWh Abstand und ist nach dem
95-%-Kriterium des Papiers entschieden. Es ist in jeder Hinsicht der bessere Beleg für dieselbe
These. Empfehlung: Schritt 5 auf dieses Paar umstellen und das CCS-CCS-Paar als zweite Zeile
danebenstellen, mit dem Hinweis, dass es weiter 8 gegen 32 Mt vergleicht.

Überschrift dann z. B.: „Bei gleicher Emissionsmenge" statt „Auf gleichem Emissionsniveau".

---

### E2 · HOCH — Zwei Maßstäbe für dieselbe Kennzahl: 45 % heißt „offen", 90 % heißt „führt"

**Fundstelle:** `strommix-story.html` 723 („**Die Rangfolge dieser beiden Pfade ist offen**", bei
P = 44,9 %) gegen 770 und `honest_statement` („führt das Kernkraft-Szenario mit 90 Prozent").
Kriterium: `monte_carlo.py` 577 — `decided = max(wins, n-wins)/n >= 0.95`.

**Beanstandung:** Nach dem eigenen, im Whitepaper offengelegten Maßstab ist P = 90,3 % **nicht
entschieden**; `monte_carlo_reference.json` führt das Paar mit `"decided": false` und einem
P95-Differenzwert von **+7,0 €/MWh** — in den oberen 5 % der Ziehungen ist der Gas-Pfad mit CCS
günstiger. Das Whitepaper zeigt das korrekt: die Paar-Tabelle in Kap. 6 kennzeichnet das Paar als
„offen" und labelt es „mit CCS auf beiden Seiten — die faire Ebene".

Die Story kennt das 95-%-Kriterium überhaupt nicht — es kommt in `strommix-story.html` nicht vor.
Der Leser bekommt „offen" bei 45 % und „führt" bei 90 % und hat keine Möglichkeit zu erkennen, dass
beide Werte nach demselben Maßstab in dieselbe Kategorie fallen. Für ein Papier, dessen
Alleinstellungsmerkmal die Offenlegung von Entscheidungsregeln ist, ist das die teuerste
Auslassung in Akt 4.

**Vorschlag:** Einen Halbsatz an das Ende des CCS-Absatzes: „Auch das ist nach unserem eigenen
Maßstab — mindestens 95 Prozent gleiches Vorzeichen — noch nicht entschieden; in den obersten fünf
Prozent der Ziehungen liegt der Gas-Pfad vorn." Kostet eine Zeile und rettet die Konsistenz des
Konfidenzsystems. Alternativ: auf das entschiedene Paar aus E1 umstellen, dann löst sich der
Widerspruch von selbst.

---

### E3 · HOCH — Die Überschreitungs-Empirie wird für das CCS-Paar verschwiegen (4,3 %)

**Fundstelle:** `strommix-story.html` 2038 (`if (!isCcs) band(lOver, …)` — das Überschreitungsband
wird für die CCS-Presets bewusst **nicht gezeichnet**), 2513 (`p-ccs` liest ausschließlich die
Konfiguration `base`). Gegenwert: `modell_v02_ergebnis.md` 4b.4, Zeile „Kernkraft+CCS < Gas+CCS":
base **90,3 %** · wacc 84,7 % · co2 93,3 % · **overrun 4,3 %** · wacc_overrun 4,6 %.

**Beanstandung:** Für das Nicht-CCS-Paar erzählt die Story alle drei Zustände in einem einzigen
Absatz — 45 %, mit CO₂-Unsicherheit 64 %, „schaltet man die Überschreitungs-Empirie zu, 0 %".
Das ist vorbildlich. Zwei Absätze später, beim CCS-Paar, wird nur noch die Basiskonfiguration
gezeigt. Dass dieselbe Empirie, die einen Absatz vorher die Rangfolge drehen durfte, das CCS-Ergebnis
von 90 % auf 4 % dreht, steht nirgends im Fließtext — nur in der Datentabelle unter dem Akt (die
das immerhin für alle vier Konfigurationen ausweist, das ist korrekt gebaut).

Ich nehme ausdrücklich an, dass das nicht Absicht war: Der Überschreitungslauf ist im eigenen
Datensatz als asymmetrisch gekennzeichnet (`overrun_asymmetry`, severity hoch — für Batterie,
Elektrolyse und H₂-Kette existiert kein gemessener Faktor), und man kann gute Gründe haben, ihn
beim CCS-Vergleich nicht als gleichrangig zu zeigen. Aber dann muss dieser Grund dastehen. So wie
es jetzt ist, entsteht der Eindruck einer Auswahl — und das ist der eine Vorwurf, den dieses Papier
sich nicht leisten kann.

**Vorschlag:** Einen Satz analog zum Schritt-4-Nebenbefund: „Auch hier gilt die Einschränkung aus
Schritt 4: Unter der Überschreitungs-Empirie dreht sich das Bild auf 4 Prozent — dieser Lauf ist
aber asymmetrisch, weil für die Speicher- und Wasserstoffseite kein gemessener Faktor existiert.
Er stresst die Kraftwerks- und Netzseite, also beide CCS-Pfade, überproportional."

---

### E4 · HOCH — Elf der 21 €/MWh Vorsprung im CCS-Vergleich sind weiterhin die Netzkostenregel

**Fundstelle:** eigene Nachrechnung aus `monte_carlo_reference.json`
(`deterministic_components_eur_mwh.netz`, `grid_scaling_raw`), CRF = 0,05828 (WACC 5 %, 40 a).

**Ist nach dem K1-Fix:**

| Preset | Skalierung Übertragung (roh) | Netz €/MWh |
|---|---:|---:|
| Kostenminimum (± CCS) | 0,17 | **23,2** |
| 80 % EE + Gas (± CCS) | 0,72 | **34,4** |
| 80 % EE + H₂ | 0,86 | 37,3 |
| 100 % Erneuerbare | 1,17 → gedeckelt 1,00 | 40,0 |

**Beanstandung:** Der Fix hat den Hebel halbiert — die Differenz zwischen den beiden Frontläufern
ist von 29,2 auf **11,2 €/MWh** gefallen, und die 165-%-Budgetüberschreitung im 100-%-Pfad ist weg.
Das ist der wichtigste Einzelfortschritt dieser Runde. Aber:

- Der **deterministische Abstand** der beiden Frontläufer beträgt 2,3 €/MWh (152,3 : 154,6). Die
  Netzregel erzeugt zwischen ihnen 11,2 €/MWh. Der „Beinahe-Gleichstand" aus Schritt 3 ist damit
  weiterhin **vollständig** ein Produkt dieser Zuordnungsregel: Ohne sie läge der Gas-Pfad vorn.
- Im **CCS-Vergleich** (163,3 : 184,4, Abstand 21,1) sind 11,2 €/MWh — mehr als die Hälfte — dieselbe
  Regel. Der Netzblock ist zwischen einem Preset und seiner CCS-Variante identisch, er geht also
  ungekürzt in die neue Kernaussage ein.

Gegenrechnung, weil sie die Größenordnung zeigt (nicht als Empfehlung, sondern als Sensitivität):
Legte man **beide** Netzblöcke als mixunabhängigen Sockel an — 651 Mrd. € × CRF / 950 TWh =
39,9 €/MWh für jedes Szenario, das andere Extrem zur GES-Konvention —, ergäbe sich:

| Preset | Ist | Netz als voller Sockel |
|---|---:|---:|
| Kostenminimum | 152,3 | 169,1 |
| Kostenminimum + CCS | 163,3 | 180,0 |
| 80 % EE + Gas | 154,6 | **160,1** |
| 80 % EE + Gas + CCS | 184,4 | 189,9 |
| 80 % EE + H₂ | 198,4 | 201,0 |
| 100 % Erneuerbare | 245,2 | 245,1 |

Zwei Lesarten, beide relevant:
1. Der **Beinahe-Gleichstand kippt** — der Gas-Pfad läge 9,0 €/MWh vorn statt 2,3 hinten. Schritt 3
   von Akt 4 ist eine reine Funktion der Netzzuordnung.
2. Die **Emissionsgleichheits-Aussage überlebt** — 180,0 gegen 189,9, das Kernkraft-Szenario bleibt
   auch unter der EE-freundlichsten denkbaren Netzregel vorn. Das ist ein Befund *für* die
   Robustheit der neuen Kernaussage, und die Story verschenkt ihn.

**Beanstandung im engeren Sinn — die Sensitivitäts-Auswahl ist asymmetrisch:** Das Modell hält mit
`legacy_fee_linear` ausdrücklich die **EE-ungünstigste** Alternative als Vergleichslauf vor
(651 Mrd. € linear mit dem erzeugten fEE-Anteil, ungedeckelt). Ein Gegenstück in die andere
Richtung — voller Sockel, keine fEE-Skalierung — existiert nicht. Wer nur in eine Richtung
sensitiviert, hat keine Sensitivität, sondern eine Untergrenze.

**Vorschlag:**
- `grid_cost_basis = "flat_socket"` als dritte Option ergänzen (drei Zeilen in `model.py`). Kostet
  nichts und schließt die Flanke.
- In Akt 4 / Schritt 3 einen Satz: „Elf der Euro Abstand zwischen diesen beiden Pfaden stammen aus
  einer einzigen Zuordnungsregel für den Netzausbau — legt man das Netz beiden Szenarien gleich
  auf, führt der Gas-Pfad. Auf gleicher Emissionsmenge bleibt die Reihenfolge dagegen auch dann
  bestehen."
- Die drei Zahlen 23,2 / 34,4 / 40,0 €/MWh in die Limits-Karte
  `grid_allocation_assumption` aufnehmen. Sie stehen im Datensatz
  (`deterministic_components_eur_mwh`) und werden in der Story nirgends gerendert.

---

### E5 · HOCH — Die fehlenden Alternativen: „mehr EE statt CCS", H₂ statt CCS, DSM/Import

Der Auftrag fragt, ob der Vergleich „beide mit CCS" fair konstruiert ist und welche Alternativen
fehlen. Befund je Alternative:

**(a) H₂ statt CCS — vorhanden, aber nur im Whitepaper.**
`ee80_h2` ist exakt diese Alternative: gleiches fEE-Gerüst, gleiche 80 %, Rückverstromung statt
Gas. Das Whitepaper führt das Paar sogar explizit als Schlüsselpaar
(`['ee80_gas_ccs','ee80_h2','zwei Wege, dasselbe fEE-Gerüst zu sichern']`, P = 78,2 %, offen). Die
Story erwähnt es in Schritt 5 nicht. Rechnet man die marginalen Vermeidungskosten der beiden Wege
aus dem Gas-Pfad heraus, sind sie fast identisch:

| Weg aus `ee80_gas` (154,6 €/MWh, 106,5 Mt) | Zielkosten | Restemission | implizite Vermeidung |
|---|---:|---:|---:|
| + CCS auf dem Backup-Park | 184,4 | 31,7 Mt | ≈ 378 €/t |
| → H₂-Rückverstromung statt Gas | 198,4 | 4,8 Mt | ≈ 409 €/t |

Das ist ein für die EE-Seite **unbequemer, aber sauberer** Befund: Der eigene Dekarbonisierungsweg
ist je vermiedener Tonne nicht billiger als CCS, er geht nur weiter. Er gehört in Schritt 5, weil
er den Einwand „ihr habt uns die falsche Alternative untergeschoben" vorwegnimmt.

**(b) „Mit mehr EE statt mit CCS dekarbonisieren" — fehlt, und die Lücke ist strukturell.**
Es gibt keinen Preset zwischen `ee80_gas` (92 % fEE-Erzeugungsanteil, 106,5 Mt) und `ee80_h2`
(gleiches Gerüst plus 100 GW Elektrolyse + 80 GW Rückverstromung). Ein Pfad „85–90 % EE + Gas +
mehr Batterie" — die in der Praxis naheliegendste Zwischenstufe — existiert nicht. Der
Kernkraft-Pfad wurde dagegen von GES als *Kostenminimum* optimiert. Verglichen werden also eine
optimierte Kernkraft-Konfiguration und zwei nicht optimierte EE-Stützstellen. Das ist ein
**Punktevergleich, kein Frontier-Vergleich**, und ein EE-Verband wird ihn genau so angreifen.

Zur Fairness: Der Simulator in Whitepaper-Kapitel 5 kann die Zwischenstufen rechnen — Anteilsregler
plus Backup-Technologie-Umschalter `gas_ccgt` / `gas_ccs` sind da. Die Möglichkeit ist also gebaut,
sie wird nur nicht erzählt. Ein Satz in Schritt 5 mit Verweis („Wer die Zwischenstufen sehen will:
im Whitepaper-Simulator sind sie einstellbar") würde reichen.

**(c) DSM / Import — die Lücke trifft genau den dominanten Kostenposten der CCS-Rechnung.**
Der CCS-Aufschlag im Gas-Pfad ist zu **80 % Kapazitätskosten** (23,9 von 29,8 €/MWh) — der doppelte
Kapitalblock auf 137 GW Gasleistung bei 1.930 Volllaststunden. Genau diese 137 GW sind die Größe,
die Interkonnektoren und verschiebbare Last senken. Die Story sagt (richtig, nach K2), dass die
Auslassung die EE-Pfade härter trifft, quantifiziert es aber nach wie vor nicht.
Grobe Größenordnung: Die von GES selbst angesetzten 20 GW Interkonnektoren würden die Gas-Spitze
um bis zu 15 % senken → rund **3,5 €/MWh** weniger CCS-Kapazitätskosten im Gas-Pfad gegenüber rund
1,5–2 €/MWh im Kernkraft-Pfad (53,9 GW Spitze, flachere Defizite). Nettoverschiebung: **≈ 2 €/MWh**
zugunsten des Gas-Pfads, bei 21 €/MWh Abstand. Ehrlicher Befund: **Import und DSM kippen die
Emissionsgleichheits-Aussage nicht.** Das sollte dastehen — es ist die stärkste Entlastung, die
das Papier für seine eigene neue Kernaussage bekommen kann.

**(d) Der wirklich große offene Hebel ist nicht (a)–(c), sondern `ccs_on_full_backup_fleet`.**
Die Limitation ist im Datensatz mit severity „hoch" korrekt geführt: CCS wird auf den **gesamten**
Backup-Park gelegt, auch auf die Blöcke mit sehr wenigen Betriebsstunden. Ein real optimiertes
System rüstet nur die hoch ausgelasteten Blöcke aus. Überschlag: Würde CCS nur auf dem
Kapazitätsanteil gebaut, der den Großteil der Gasarbeit liefert (Größenordnung 40–50 % der
137 GW), fiele der Kapazitätsposten von 23,9 auf 10–12 €/MWh, der Aufschlag von 29,8 auf
rund 18–20 €/MWh — und die Restemission stiege von 31,7 auf grob 50 Mt. Ergebnis:
`ee80_gas_ccs` läge bei etwa 173–175 statt 184,4 €/MWh, der Abstand schrumpfte von 21 auf
10–12 €/MWh, und die Emissionsdifferenz zum Kernkraft-Pfad würde *größer*, nicht kleiner.

Die Story kennzeichnet diese Modellwahl als **Obergrenze** — aber der Vorbehalt hängt im Text
ausschließlich an den *Vermeidungskosten* („Das ist eine Obergrenze, kein Preisschild"), obwohl
dieselbe Modellwahl auch den LSCOE-Aufschlag und damit die 90 % trägt. Der Vorbehalt ist im
Geltungsbereich zu eng formuliert.

**Vorschlag:** Den Obergrenzen-Satz auf beides beziehen: „Das gilt für die Vermeidungskosten **und
für den Aufschlag selbst**: Ein optimiertes System würde nur die hoch ausgelasteten Blöcke
ausrüsten und die Spitzenlast unabgeschieden fahren — dann fällt der Aufschlag deutlich kleiner
aus, dafür steigt die Restemission."

---

### E6 · MITTEL — Ist „106 Mt CO₂/a" ein fairer Dauerzustand des Gas-Pfads?

Der Auftrag fragt danach explizit. Antwort in drei Teilen.

**(1) Als Modellergebnis ist die Zahl korrekt hergeleitet.** 264,4 TWh Gas × 0,403 t/MWh_el =
106,5 Mt. Nachgerechnet, stimmt.

**(2) Als Eigenschaft *des Pfads* ist sie in vier bekannten Richtungen nach oben verzerrt** — alle
vier sind im Projekt dokumentiert, aber keine davon steht an der Zahl dran, wenn sie in Akt 4 als
Begründung für den „Emissions-Rabatt" auftritt:

| Effekt | Wirkung auf die 106 Mt | Status im Projekt |
|---|---|---|
| Halbjahresprofil Jul–Dez, hochgerechnet über den Lastanteil (50,1 %), enthält aber nur ~45 % der PV-Arbeit | zu hoch | `half_year_profile`, severity hoch — **in der Story nicht gerendert** (H3) |
| Kein Import, kein Lastmanagement; GES selbst rechnet mit 20 GW Interkonnektoren | zu hoch | `import_dsm_asymmetry` — qualitativ benannt, nicht beziffert (K2) |
| Offshore läuft auf dem Onshore-Profil, also zu wenig geglättet → mehr Residuallastspitzen | zu hoch | Limits-Karte, nicht beziffert (N4 aus R1) |
| Speicher-Dispatch greedy statt vorausschauend | leicht zu hoch | Whitepaper Kap. 9 |

Überschlag allein für den Profil-Effekt: Bei rund 5 Prozentpunkten Unterrepräsentation der
VRE-Arbeit im abgedeckten Halbjahr liegt die annualisierte Gasmenge grob 15–25 % zu hoch — ein
Volljahresprofil dürfte eher bei **80–90 Mt** landen. Die Aussage „Emissions-Rabatt" bleibt
dann unverändert richtig (80 Mt gegen 28 Mt ist immer noch Faktor 3), aber die publizierte Zahl
ist keine Pfad-Eigenschaft, sondern eine Modellstand-Eigenschaft.

**(3) Der wichtigste Punkt: 106 Mt ist eine Aussage über ein Szenario ohne CCS, das die Studie so
nicht meint.** Das ist die eigentliche Pointe, und die Story trifft sie — „so, wie die geprüfte
Studie ihren Gas-Pfad meint". Diese Zuschreibung ist im Projekt allerdings nur mittelbar belegt
(die eigene Annahmen-Rekonstruktion führt CCS-Kosten von 80 €/t und eine CCS-Nachrüstung im
Peaker-CAPEX; die Studien-PDF selbst konnte nicht im Volltext geprüft werden — das ist die
prominenteste Einschränkung des ganzen Papiers). In dem Satz, der Akt 4 trägt, steht dafür **keine
Konfidenzstufe**. Bei einem Papier, das sonst jede Zahl badgt, fällt das auf.

**Zum „Übergangspfad":** Nach der eigenen Rekonstruktion (`docs/01_grundlage_ges_faktencheck.md`
Abschnitt 3) führt GES alle vier Wege als **Zielszenarien für 2045** — inklusive des
Gas-Peaker-Pfads, den sie als „kostenoptimalen Osterpaket-Pfad" beschreibt, nicht als Brücke. Die
Story stellt ihn also nicht fälschlich als Dauerzustand dar; sie folgt der Studie. **Aber:** Genau
deshalb ist die Frage berechtigt, ob ein 2045er-Zielszenario mit 264 TWh Erdgasverstromung
überhaupt noch als „klimaneutral" firmieren darf — und das ist der Punkt, an dem die EE-Seite dem
Papier zustimmen würde. Die Story sollte das ausdrücklich sagen, statt es dem Leser zu überlassen:
Der Gas-Pfad ist im Original ein Zielbild, und als Zielbild ist er ohne Abscheidung nicht
klimaneutral. Damit wäre auch begründet, warum die CCS-Variante überhaupt gerechnet wird.

**Vorschlag:** In Schritt 5 zwei Ergänzungen — eine Konfidenzstufe (C) an die Zuschreibung „so, wie
die Studie ihren Gas-Pfad meint" mit Verweis auf den fehlenden Volltextzugriff, und ein Halbsatz:
„Die 107 Millionen Tonnen sind dabei selbst ein Modellwert am oberen Rand: Sie stammen aus einem
Winterhalbjahr, ohne Import und ohne Lastmanagement."

---

## 3 · Weitere neue Befunde aus dieser Runde

**M-neu-1 · MITTEL — Der H₂-Pfad bekommt einen 300-TWh-Speicher geschenkt, und die Story sagt es nicht.**
`ee80_h2` unterstellt `h2_storage_gwh = 300.000` (= 300 TWh_H₂), `ee100` 120 TWh. Das deutsche
Kavernen-Umwidmungspotenzial beträgt nach der eigenen Datenbasis 30 TWh, der geschätzte Bedarf 2045
130 TWh. Weil das Modell H₂-Speicherung über den **Durchsatz** bepreist, kostet die Speichergröße
nichts. Das Whitepaper legt beides offen (Simulator-Warnung + Fazit-Kernaussage, H4); die Story
zeigt den H₂-Pfad mit 198,4 €/MWh ohne jeden Hinweis. Diese Auslassung wirkt **zugunsten** der
EE-Pfade — und gehört deshalb genauso benannt wie die Auslassungen, die zu ihren Lasten gehen. Ein
Beipackzettel `cp_h2_storage` neben `cp_h2_physics` ist weiterhin der richtige Ort (Vorschlag aus
R1/H4, Wortlaut dort).

**M-neu-2 · MITTEL — Die impliziten Vermeidungskosten sind als Spanne dargestellt, die Zuordnung fehlt.**
`strommix-story.html` 776–779 zeigt „Vermeidungskosten von 378 bis 531 € je Tonne". Die 378 gehören
zum **Gas-Pfad**, die 531 zum **Kernkraft-Pfad**. Je vermiedener Tonne ist die Abscheidung im
Gas-Pfad also der **günstigere** der beiden Wege — was die Störung des Absatzes davor („der
Aufschlag ist beim Gas-Pfad fast dreimal so groß") relativiert. Als Spanne ohne Zuordnung dargestellt,
geht diese Information verloren, und zwar in die für die EE-Seite ungünstige Richtung. Zwei Wörter
Fix: „378 € je Tonne im Gas-Pfad, 531 € im Kernkraft-Szenario".

**M-neu-3 · MITTEL — Die Story rendert fünf vorhandene Limitationen nicht.**
`renderLimits()` bindet `ccs_storage_availability`, `ccs_cost_band_optimistic`,
`ccs_on_full_backup_fleet`, `grid_allocation_assumption`, `grid_opex_missing`,
`overrun_asymmetry`, `emission_factor_proxy`, `h2_initial_fill_free` ein — aber **nicht**
`half_year_profile`, `scenarios_not_emission_equivalent`, `ccs_residual_is_lifecycle`,
`gas_price_transfer`, `nuclear_base_range_is_western`. Die ersten beiden sind für Akt 4 die
relevantesten überhaupt. Da der Mechanismus (`fromData(id, headline)`) schon existiert, sind das
fünf Zeilen. Empfehlung: mindestens `half_year_profile` und `scenarios_not_emission_equivalent`
nachtragen; letztere sagt wörtlich, was E1 einfordert.

**M-neu-4 · MITTEL — Lazard-Dublette mit widersprüchlicher Konfidenz besteht fort.**
Quelle 36 `lazard-2026` = B, Quelle 38 `lazard-lcoe-19` = A, identisches Dokument (LCOE+ v19.0).
GES- und IRENA-Dubletten sind konsistent gemacht worden, die Lazard-Dublette nicht — und
ausgerechnet sie trägt die Batterie-LCOS und den EE-kritischen Kostentrend „+27 % seit 2020".
Assertion in `assertBindings()` auf doppelte Quellentitel wäre billig.

**M-neu-5 · MITTEL — Der Beipackzettel-Apparat ist unverändert einseitig, und Akt 4 hat jetzt einen
Anlass mehr.** Acht Gegenpositionen, keine argumentiert für die Erneuerbaren; `cp_ee_risks` listet
ausschließlich EE-Risiken. Nach Akt 4/Schritt 5 steht die härteste Aussage des ganzen Papiers gegen
die EE-Seite — und daneben kein Kasten. Material für `cp_ee_chancen` liegt komplett im Projekt
(Repowering als Ertragshebel, Hybrid-Parks/Co-Location, der eigene `flh_finding` im 30-Jahres-Plan,
europäische Elektrolyseur-Fertigungskapazität 13,1 GW/a). Unverändert aus R1/M4.

**N-neu-1 · NIEDRIG — Der 100-%-Pfad läuft in den Deckel und niemand erfährt es.**
`ee100` hat `grid_scaling_raw.transmission = 1,17`, wird auf 1,00 gedeckelt, und `model.py` 1048
erzeugt dazu korrekt eine Warnung. Der Deckel entlastet das Szenario um rund 5,8 €/MWh — eine
Setzung zugunsten der EE. Sie ist im Whitepaper über `gridRuleText()` erwähnt („Beide Faktoren sind
auf 1,00 gedeckelt"), aber ohne die Information, dass ein Szenario ihn tatsächlich erreicht. Ein
halber Satz.

**N-neu-2 · NIEDRIG — Die CO₂-Preis-Sensitivität stützt die CCS-Aussage und wird nicht genutzt.**
`co2_sensitivity` enthält für den CCS-Vergleich: bei 0 €/t 162,6 : 181,9, bei 75 €/t 163,3 : 184,4,
bei 350 €/t 165,7 : 193,6, bei 990 €/t 171,3 : 214,9. Die Emissionsgleichheits-Aussage ist also über
den gesamten CO₂-Preisbereich stabil und wird mit steigendem Preis **stärker**. Das ist die beste
Robustheitsaussage, die für diese These verfügbar ist, und sie steht in keinem Satz.

**N-neu-3 · NIEDRIG — `cp_h2_physics` rundet weiter um 6 % zulasten der EE.**
„zweieinhalb bis dreieinhalb Kilowattstunden"; 1/0,30 = 3,33. Unverändert aus R1/N1.

---

## 4 · Verständlichkeit: die drei dichtesten Stellen aus EE-Sicht

### (1) Akt 4 / Schritt 5, dritter Absatz — der CCS-Aufschlag

**Ist (`strommix-story.html` 772–780):**
> „Der Aufschlag ist beim Gas-Pfad mit 29,8 €/MWh fast dreimal so groß wie beim Kernkraft-Szenario
> (10,9 €/MWh) — und der dominante Posten ist nicht die Abscheidung, sondern die verdoppelte
> Kraftwerkskapazität, die sich auf wenige Betriebsstunden verteilt. Daraus folgen Vermeidungskosten
> von 378 bis 531 € je Tonne. Das ist eine Obergrenze, kein Preisschild."

Vier Kennzahlen, zwei Kausalketten und ein Vorbehalt in drei Sätzen. „Verdoppelte
Kraftwerkskapazität" ist außerdem missverständlich — verdoppelt wird nicht die Kapazität, sondern
die Investition je Kilowatt.

**Vorschlag:**
> „Warum kostet die Abscheidung den Gas-Pfad fast dreimal so viel wie das Kernkraft-Szenario
> (29,8 gegen 10,9 € je MWh)? Nicht wegen der Abscheidung selbst. Ein Gaskraftwerk mit
> CO₂-Abscheidung kostet in der Anschaffung ungefähr das Doppelte — und der Gas-Pfad hat mit
> 137 Gigawatt zweieinhalbmal so viel Gasleistung stehen wie das Kernkraft-Szenario. Diese Anlagen
> laufen nur rund 1.900 Stunden im Jahr. Ein doppelt so teures Kraftwerk, das selten läuft, ist
> teuer je Kilowattstunde.
> Je vermiedener Tonne CO₂ kostet die Abscheidung im Gas-Pfad 378 €, im Kernkraft-Szenario 531 €.
> Beide Zahlen sind **Obergrenzen**: Wir rüsten in dieser Rechnung den kompletten Kraftwerkspark
> aus. Ein real geplantes System würde nur die Kraftwerke ausrüsten, die viel laufen, und die
> Spitzenlast ohne Abscheidung fahren — dann wird es billiger, aber es bleibt mehr CO₂ übrig."

### (2) Die Netzkostenregel im Whitepaper (`gridRuleText()`, `whitepaper-strommix.js` 1283 ff.)

**Ist:** Ein Absatz aus vier ineinandergeschachtelten Sätzen mit zwei Konfidenz-Badges, einer
Zitatmarke, einem Codebezeichner und dem Nebensatz „Der Preis dieser Korrektur". Fachlich
vollständig, aber der Leser muss vier Zuordnungsregeln gleichzeitig im Kopf halten. Und weil der
Text an zwei Stellen wiederverwendet wird (Kap. 3 und Kap. 9), trifft ihn jeder Leser zweimal.

**Vorschlag — zuerst das Bild, dann die Regel:**
> „Der Netzausbau bis 2045 kostet nach IMK/Böckler 651 Mrd. €. Er zerfällt in zwei ungefähr gleich
> große Hälften mit völlig verschiedenen Ursachen.
> **Das Verteilnetz (323 Mrd. €)** wird gebraucht, weil die *Nachfrage* elektrisch wird:
> Wärmepumpen, Ladepunkte, Industrieanschlüsse. Diese Kosten fallen an, egal woher der Strom kommt.
> Sie gehen deshalb in jedes Szenario gleich ein.
> **Das Übertragungsnetz (328 Mrd. €)** wird gebraucht, weil Windstrom von der Küste nach Süden
> muss. Diese Kosten hängen am Anteil wetterabhängiger Erzeugung — und zwar an dem Teil, der
> tatsächlich transportiert wird; abgeregelter Strom belastet keine Leitung.
> Bis Modellversion 0.2 hing der komplette Betrag am EE-Anteil, so wie in der geprüften Studie.
> Was uns die Korrektur kostet: Beim Netzblock sind unsere Zahlen jetzt nicht mehr direkt mit der
> Studie vergleichbar. Wer den alten Vergleich braucht, kann ihn weiter rechnen."

Die Aufteilung 328/323 ist belegt; welcher Treiber welchem Block zuzuordnen ist, ist unsere
Setzung — dieser eine Satz sollte als eigener Absatz stehenbleiben, nicht als Nebensatz.

### (3) Der Zwischenruf nach Akt 4 (`honest_statement`)

**Ist:** Ein Block aus sechs Sätzen mit sieben Zahlen, der mit „Nur vergleicht dieser
Beinahe-Gleichstand 28 gegen 107 Millionen Tonnen CO₂ im Jahr" nach fünf Sätzen die Richtung
wechselt und im letzten Satz die schärfste Aussage des Papiers unterbringt.

**Vorschlag — die Pointe an den Anfang, die Zahlen dahinter:**
> „Der Beinahe-Gleichstand ist echt — aber er vergleicht zwei verschieden saubere Systeme.
> Das kernkraftgestützte Kostenminimum kommt auf 152 € je Megawattstunde bei 28 Millionen Tonnen
> CO₂ im Jahr, der gasgestützte 80-Prozent-Pfad auf 155 € bei 107 Millionen Tonnen. Über 1.000
> gepaarte Ziehungen ist keiner von beiden verlässlich der günstigere: 45 zu 55.
> Verlangt man von beiden dieselbe Emissionsmenge, dreht sich das Bild. Der Gas-Pfad muss dafür
> seinen Kraftwerkspark mit CO₂-Abscheidung ausrüsten und kostet dann 184 € — bei 32 Millionen
> Tonnen, also ungefähr so viel wie das Kernkraft-Szenario ohne Abscheidung. In 96 von 100
> Ziehungen ist das Kernkraft-Szenario dann günstiger. Das ist die härteste Aussage dieser Arbeit,
> und sie hängt an drei Setzungen: der Netzkostenzuordnung, dem unterstellten Institutionenrahmen
> und der Frage, ob die Kostenüberschreitungs-Empirie mitläuft. Schaltet man die letzte zu, dreht
> sich auch dieses Ergebnis um."

Das ist kürzer, nennt die Emissionen an jeder Zahl, benutzt das **entschiedene** Paar aus E1 und
schließt die Lücke aus E3 in einem Halbsatz.

---

## 5 · Top-Fixes vor v1.0

1. **E1 — Schritt 5 auf das emissionsgleiche Paar umstellen.** `kostenminimum` (27,9 Mt) gegen
   `ee80_gas_ccs` (31,7 Mt): 152,3 : 184,4 €/MWh, P = 95,9 %, **entschieden**. Ersetzt einen
   falschen Titel durch eine stärkere Aussage. Die CCS-CCS-Zeile daneben behalten, mit „8 gegen
   32 Mt" dabei.
2. **E3 — die 4,3 % aus dem Überschreitungslauf in den Fließtext.** Ein Satz, mit derselben
   Asymmetrie-Einschränkung wie in Schritt 4. Ohne ihn ist die Auswahl angreifbar.
3. **E4 — die Netzkostenzahlen sichtbar machen und die Gegen-Sensitivität ergänzen.**
   23,2 / 34,4 / 40,0 €/MWh in die Limits-Karte; `grid_cost_basis = "flat_socket"` als Gegenstück
   zu `legacy_fee_linear`; ein Satz in Schritt 3, dass die Regel 11 der 2,3 €/MWh Abstand erzeugt.
   Und der Befund, der dabei herausfällt, gehört gleich mit erzählt: Die
   Emissionsgleichheits-Aussage **überlebt auch die EE-freundlichste Netzregel**.
4. **E5(d) — den Obergrenzen-Vorbehalt auf den Aufschlag ausweiten**, nicht nur auf die
   Vermeidungskosten. Und E5(a): den H₂-Pfad als die EE-eigene Alternative zu CCS in Schritt 5
   nennen — mit dem unbequemen Ergebnis, dass er je Tonne nicht billiger ist.
5. **H3/M-neu-3 — `half_year_profile` und `scenarios_not_emission_equivalent` in
   `renderLimits()` nachtragen.** Fünf Zeilen, schließt die letzte offene Flanke aus Runde 1.

*Knapp dahinter:* H2 (Batterie-Untergrenze unter den eigenen BNEF-Wert öffnen, Lazard-Trend
geografisch abgrenzen), H1 (Uniper von A auf B/C, eine unabhängige Gegenreferenz), M-neu-1
(Kavernen-Beipackzettel in die Story), M-neu-4 (Lazard-Dublette).

---

## 6 · Was ausdrücklich stehen bleiben soll

- **Der Netz-Split ist richtig gebaut.** Verteilnetz als Sockel, Übertragungsnetz mit der
  *genutzten* fEE-Arbeit, beides gedeckelt, Rohfaktoren im Ergebnis, Alt-Regel als Vergleichslauf
  erhalten, und der Preis der Korrektur („der Netzvergleich mit der Studie ist jetzt ein Vergleich
  zweier Regeln") ausdrücklich benannt. Das ist mehr, als ich verlangt habe.
- **Die Import/DSM-Korrektur mit Selbstkorrektur-Vermerk.** Dass die frühere Falschaussage im Text
  benannt und nicht stillschweigend ersetzt wurde, ist der Grund, warum dieses Papier
  Konfidenzstufen überhaupt glaubhaft führen kann.
- **Die Wind-Volllaststunden als offene Frage**, inklusive des Punkts, dass 1.700 h und 2.400 h dann
  keine gleichen Größen wären. Und die Selbstnennung des eigenen Annahmen-Audits statt des
  unbelegten Vorwurfs gegen Dritte.
- **Die Kavernen-Restriktion im Whitepaper** — als Mengen-, nicht als Kostenfrage, mit dem
  entscheidenden Zusatz, dass das Modell Durchsatz und nicht Volumen bepreist und die Restriktion
  deshalb aus jeder €/MWh-Betrachtung verschwindet. Genau die richtige Konstruktion.
- **Die CCS-Limitationen als Block.** `ccs_storage_availability`, `ccs_cost_band_optimistic`
  (Modellband am unteren Rand der Literatur — ein Vorbehalt *gegen* das eigene Ergebnis),
  `ccs_residual_is_lifecycle` und `ccs_on_full_backup_fleet` sind vollständig, in beide Richtungen
  und mit Schweregrad geführt. Dass die 110,6 Mt/a Einlagerungsbedarf des Gas-Pfads gegen ein Land
  ohne CO₂-Speicherstätte gestellt werden, ist der stärkste Realitätscheck des Kapitels.
- **Die Emissionsgleichheits-Argumentation selbst.** Sie ist der richtige Einwand, sie ist gegen die
  eigene, EE-freundlichere Vorgängerfassung durchgesetzt worden, und sie hält jeder Sensitivität
  stand, die ich rechnen konnte: Netz als voller Sockel (180,0 : 189,9), CO₂-Preis von 0 bis 990 €/t,
  Import/DSM-Überschlag. Nur die **Zahl 90 Prozent** hält nicht — und sie muss auch nicht, weil das
  saubere Paar 96 Prozent hergibt.

---

## 7 · Wo greift wer an?

**Ein EE-Verband greift jetzt an bei:**
- E1 — „Sie überschreiben einen Vergleich von 8 gegen 32 Millionen Tonnen mit ‚auf gleichem
  Emissionsniveau'." Das ist der Ein-Satz-Angriff, und er sitzt.
- E2 — „Bei 45 Prozent nennen Sie die Rangfolge offen, bei 90 Prozent sagen Sie ‚führt' — und Ihr
  eigenes Kriterium ist 95."
- E3 — „Ihre Überschreitungs-Empirie dreht das CCS-Ergebnis auf 4 Prozent. Warum steht das nur in
  der Tabelle?"
- E4 — „Elf Ihrer einundzwanzig Euro Vorsprung sind eine Zuordnungsregel für Netzkosten, die Sie
  selbst als Setzung führen."
- E5(b) — „Sie vergleichen ein optimiertes Kernkraft-Szenario gegen zwei nicht optimierte
  EE-Stützstellen und nennen das Ergebnis einen Technologievergleich."

**Ein EE-Skeptiker greift an bei:**
- M-neu-1 — „Ihr H₂-Pfad bekommt einen 300-TWh-Speicher geschenkt, bei 30 TWh Umwidmungspotenzial."
- Der gedeckelten Netzskalierung im 100-%-Pfad (N-neu-1): „1,17 auf 1,00 gedeckelt — Sie schenken
  dem teuersten Szenario knapp sechs Euro."
- `h2_initial_fill_free`: „Ihr Saisonspeicher startet gratis gefüllt."

**Beide würden zustimmen:** Die Technologiekosten sind belastbar, der Netz-Split ist ein echter
Fortschritt, und die entscheidende Frage ist inzwischen nicht mehr, ob richtig gerechnet wurde,
sondern **welches Szenariopaar erzählt wird**. Genau das ist eine Erzähl-, keine Modellfrage — und
sie ist in einem Nachmittag zu beheben.
