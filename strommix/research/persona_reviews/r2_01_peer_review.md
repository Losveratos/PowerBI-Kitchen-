# Fachgutachten Runde 2 · „Ein Stromsystem, zwei Preisschilder" (Story v0.2 · White Paper v0.11 · Modell v0.2b)

**Persona:** Professorin für Energiesysteme und Energiewirtschaft (wie Runde 1).
**Prüfdatum:** 2026-08-19
**Prüfobjekte:** `strommix-story.html` (Stand v0.2), `whitepaper-strommix.html` / `whitepaper-strommix.js`
(v0.11), `strommix/scripts/model.py` + `monte_carlo.py` (Modell 0.2b), `strommix/data/*.json`,
`strommix/research/modell_v02_ergebnis.md`.
**Prüftiefe:** Vollständiger Nachvollzug der Umsetzungen im Code (nicht nur der Änderungsdokumentation);
eigene Gegenrechnungen mit dem Repository-Code: alle sieben deterministischen Preset-Werte, der
CO₂-Kipppunkt per eigener Bisektion, dessen Sensitivität auf Gaspreis und Kernkraft-CAPEX, der
Monte-Carlo-Median-Kipppunkt über gepaarte Ziehungen, die CCS-Massenbilanz und die impliziten
Vermeidungskosten. Zusätzlich Doppellauf von `export_test_vectors.py` (byteidentisch — die
Reproduzierbarkeitszusage hält).

---

## Gesamteindruck vorab

Die Runde-1-Kernkritik ist nicht kosmetisch beantwortet, sondern substanziell: Alle fünf
KRITISCH-Befunde sind behoben, und zwar in der Sache korrekt — die IDC-Logik folgt jetzt der
Kostenabgrenzung der Anker, der Gaspreis ist bepreist und im Ziehungsplan, die Rangfrage läuft über
gepaarte Ziehungen und Differenzverteilungen, die Emissionen stehen an jeder Zahl, der Ist-Anker ist
vervollständigt und ehrlich als nicht ranking-fähig deklariert. Die Überarbeitung von Akt 4 und White
Paper Kapitel 3/6 ist methodisch jetzt **besser als der Durchschnitt begutachteter Studien** — die
Passage, die dem Leser am Beispiel zeigt, warum überlappende Randverteilungen bei entschiedener
Differenzverteilung nichts bedeuten, würde ich in der Lehre verwenden.

Alle publizierten Zahlen, die ich nachgerechnet habe, reproduzieren exakt: 152,3 / 154,6 / 163,3 /
184,4 / 198,4 / 245,2 / 180,8 €/MWh; Kipppunkt 47,55 €/t; Vermeidungskosten 531 bzw. 378 €/t;
P(Kernkraft < Gas) = 44,9 %.

Was bleibt, sind (a) mehrere in Runde 1 als MITTEL/KLEIN markierte Punkte, die liegen geblieben sind,
und (b) vier **neue** Befunde mittlerer Schwere, die alle dieselbe Signatur haben: Die *Rechnung* ist
richtig, die *Formulierung* verspricht mehr Robustheit, als die Rechnung hergibt. Keiner davon kippt
ein Ergebnis.

---

## 1 · Fix-Verifikation Runde-1-Befunde

### 1.1 KRITISCH — 5/5 behoben

| # | Befund R1 | Status | Verifikation (inhaltlich, nicht nur formal) |
|---|---|---|---|
| **K1** | Bauzinsen bei Kernkraft doppelt gezählt | **behoben** | `model_params.json → nuclear.idc_applicable_share` = 1,0/0,0/0,0 entlang der Stützstellen (min = OCC/EPC, mid/max = Gesamtprojekt), Belegkette im Feld dokumentiert (EPR2 7 583 × 1,37 ≈ 10 417). `model.scope_share_for_capex` interpoliert linear zwischen den Stützstellen und klemmt außerhalb — korrekt implementiert (geprüft inkl. Randfälle), die MC-Ziehung erhält damit keinen Sprung. Testvektoren: `lcoe_nuclear_mid_noidc` = `lcoe_nuclear_mid_idc` = 122,53 €/MWh — der Aufschlag ist am Gesamtprojekt-Anker nachweislich null. PV/Wind/Gas behalten ihren kleinen, sachgerechten IDC (Anker `capex_scope: overnight`, jetzt je Technologie dokumentiert) — das erklärt sauber die Differenz −23,3 statt meiner −24,3. Effekt auf das Kostenminimum-Szenario wie dokumentiert. |
| **K2** | Erdgas kostet nichts, nur sein CO₂ | **behoben** | `gas_ccgt.fuel_eur_mwh_th` = 20/35/60 €/MWh_th mit Quelle (TTF-Marktnotierung 08/2026), Konfidenz ehrlich B/C gesplittet, Umrechnung über η in `model._fuel_eur_mwh_el` (direkter elektrischer Wert für Kernbrennstoff hat Vorrang — richtig). Der Parameter ist im Ziehungsplan (`DRAW_FIELDS`). Die Asymmetrie 264 vs. 69 TWh steht wörtlich in der Limitationskarte der Story. Die Übertragbarkeit auf 2045 ist als eigene Limitation (`gas_price_transfer`) geführt. Einzige Anmerkung: η wird nicht mitgezogen (dokumentiert unter „nicht variiert" — akzeptabel). |
| **K3** | Überlappungsargument statt gepaarter Differenzrechnung | **behoben, vorbildlich** | `monte_carlo.py`: `seed = BASE_SEED + config_index`, EIN Ziehungsstrom je Konfiguration, jede Ziehung auf alle 7 Presets (`run_config_paired`); `pairwise_ranks` liefert P(A<B), Median-Δ, P5/P95 der Differenz, `decided`-Flag (≥ 95 %). Paritätsprüfung deterministisch ↔ Kostenfunktion eingebaut (Abbruch bei > 1e−9). Der JS-Port zieht identisch (`scopeShareForCapex`, gleiche Feldreihenfolge). Story Akt 4 / Schritt 2–3 erklärt CRN und zeigt P-Werte; WP Kap 6 ersetzt den beanstandeten Satz ausdrücklich („war ein Fehlschluss und ist ersetzt") und zeigt didaktisch die Paare, bei denen die Bänder *trotzdem* überlappen, obwohl die Rangfolge entschieden ist. Glossar `#gl-mc` nimmt den Punkt auf. Meine unabhängige Nachstellung des Basisstroms reproduziert P = 44,9 % exakt. |
| **K4** | Szenarien nicht emissionsäquivalent, „klimaneutral" trifft nicht zu | **behoben** (mit neuen Folgebefunden, s. N2–N4) | `mix_system` liefert `emissions` (Gas/Kohle getrennt, g/kWh, captured); Mt-Werte stehen im Akt-4-Chart an jeder Zeile, in der Datentabelle, im Hero-Schritt 1 und im Zwischenruf. „Klimaneutral" ist im Prolog auf die Studie bezogen („das die Studie als klimaneutral bezeichnet"); Hero-Sub ohne das Wort. CCS ist als eigene Technologie `gas_ccs` implementiert (NETL/IEAGHG-Aufschlag, η-Verlust, Abscheiderate, Vollkette, Restemission auf CO₂-Preis) und als Varianten-Presets gerechnet — die Varianten unterscheiden sich nur in der Backup-Technologie bei identischem Dispatch, das ist die saubere Konstruktion. Rest: der `<title>` der Story heißt weiterhin „Was kostet ein klimaneutrales Stromsystem?" (N9). |
| **K5** | „Ist 2025" ist kein heutiges System | **behoben** | Bänder Kohle 101,7 / Biomasse 42,7 / Wasser 21,0 TWh ergänzt (`legacy_bands`, nur CO₂-Kosten, als Untergrenze gewarnt); Netzbasis `ist_netzentgelt` 93 €/MWh statt 2045-Annuität; Preset umbenannt („Referenzsystem"), `comparable_to_target_scenarios: false`, Fußnote ¹ in der Datentabelle, Haushalts-Netzentgelt-Vorbehalt (Konfidenz C) explizit. Neuer Validierungstest (d) macht den Anker erstmals falsifizierbar (Restdeckung +4,8 % gegen Ist — das ist ein starker Beleg für die Dispatch-Kette). WP-Kap-5-Preset ist nachgezogen und identisch zum Kap-6-Anker (R12 sauber erledigt, inkl. Rückstellungslogik `future()` gegen verschleppte Preset-Zustände). |

### 1.2 MITTEL — 2 behoben, 8 teilbehoben, 2 nicht behoben

| # | Befund R1 | Status | Fundstelle / Begründung |
|---|---|---|---|
| **M1** | Netzkosten linear mit fEE-Anteil | **behoben** (Kern) | Split 328 (Übertragung) / 323 (Verteilung) korrekt aus `ist_zustand_de.md` 5.1 übernommen; Übertragung skaliert mit der **genutzten** fEE-Energie (Abregelung anteilig zwischen fEE und Band aufgeteilt — Formel in `model.py` Z. 984–989 geprüft, korrekt), Verteilnetz als bedarfsgetriebener Sockel, beide auf 1,0 gedeckelt mit Warnung und ausgewiesenem Rohfaktor; v0.1-Regel als `legacy_fee_linear` weiter rechenbar; Netz-Opex als Gap + Limitation. **Offen:** die geforderte Drei-Varianten-Sensitivität (u. a. proportional zur Arbeit) fehlt; die Treiberzuordnung ist als Modellannahme markiert (`grid_allocation_assumption`) — das genügt mir. Anmerkung: die Deckelung bei 1,0 begünstigt den 100-%-Pfad (Rohfaktor 1,17 wird gekappt und nur ausgewiesen) — dokumentiert, aber die Richtung sollte einmal dabeistehen. |
| **M2** | LSCOE-Definition verspricht mehr, als sie enthält | **teilbehoben** | WP Kap 3 zitiert jetzt Joskow (2011) und Ueckerdt et al. (2013) und ordnet die Kennzahl ein. Das Story-Glossar `#gl-lscoe` (Z. 1051 ff.) sagt aber weiterhin „Die Kosten des *gesamten* Systems" und „der einzige faire Vergleichsmaßstab" — ohne Ausschlussliste (Bestandsnetz, Netz-Opex, Redispatch, Steuern/Umlagen …) und ohne die Bedingung, unter der der Satz gilt. |
| **M3** | Kein Optimierungsschritt — verglichen werden Setzungen | **nicht behoben** | In `modell_v02_ergebnis.md` 5.3 ausdrücklich als offen geführt. Die von mir geforderte *explizite Benennung im Limitationskapitel* fehlt weiterhin (Story-Limitationskarten und WP Kap 9 enthalten keine Karte „Auslegung ist gesetzt, kein Szenario liegt in seinem Kostenoptimum"); die 1D-Auslegungssensitivität fehlt ebenfalls. Nur eine Nebenbemerkung in WP Kap 6 („Speicherauslegung … außerhalb dieser Bänder"). Die Deferral-Entscheidung ist legitim — die Nicht-Benennung nicht. |
| **M4** | 80-%-H₂-Pfad physisch nicht darstellbar + subventioniert | **teilbehoben** | Die Gratis-Anfangsfüllung ist jetzt maschinenlesbare Limitation (`h2_initial_fill_free`) mit Richtungsangabe, in der Story als Karte; die Speicherbepreisung über `max(erzeugt, entnommen)` verhindert einen kostenlosen vorgefüllten Speicher; das WP zeigt das 30-TWh-Umwidmungspotenzial an mehreren Stellen inkl. Simulator-Hinweis. Aber: das Preset rechnet weiter mit 300 TWh Kaverne (Faktor 10 über dem belegten Potenzial), Füllstand 1,0, ungedeckte Last 4,58 TWh/a — und Akt 4 zeigt den Wert weiterhin als gleichwertige Vergleichszahl ohne den Vorbehalt „bis zum Volljahresprofil keine Vergleichszahl". |
| **M5** | Ungedeckte Last bleibt kostenlos | **teilbehoben** | `unserved_twh_a` ist jetzt je Preset publiziert (story_data/monte_carlo_reference) und im WP-Dispatch-Chart sichtbar. Kein VoLL, keine Bepreisung, und in Akt-4-Text und -Datentabelle taucht die Größe nicht auf — der Nenner belohnt Lastabwurf weiterhin unkommentiert. |
| **M6** | MC variiert nur die Kostenseite | **teilbehoben** | WP Kap 3 (`#meth-mc`) benennt die eingefrorene Dispatch-Rechnung jetzt ausdrücklich als „zentrale Vereinfachung" inkl. der VLh-Inkonsistenz — genau wie gefordert. In der Story fehlt der Halbsatz weiterhin: Schritt 2 sagt nur „Gezogen werden die Kostengrößen", die Limitationskarten enthalten keine eigene Karte dazu. |
| **M7** | Dreieck mit harten Grenzen für rechtsschiefe Risiken | **teilbehoben** | WP Kap 3/6 markiert Modus-auf-mid und harte Grenzen jetzt als unbelegte Konvention (Konfidenz M); der Overrun-Lauf dient faktisch als Tail-Stress. Keine Lognormal-Sensitivität gerechnet; der Widerspruch „17 500 = harte Obergrenze" vs. Datensatznotiz „eher Erwartungs- als Extremwert" besteht fort. |
| **M8** | Grubler ohne Gegenliteratur | **behoben** | Gegenpositions-Kachel `cp-grubler` mit Escobar Rangel & Lévêque (2015) und Berthélemy & Escobar Rangel (2015), beide als Quellen mit Details angelegt, auch im WP (Kap 4). Formulierung („Wer Grubler zitiert, sollte die Erwiderungen mitzitieren — und umgekehrt") ist genau richtig. |
| **M9** | Zentrale Fachliteratur fehlt | **teilbehoben** | Methodisch: Joskow 2011 + Ueckerdt 2013 im WP zitiert (Hirth/Ueckerdt/Edenhofer 2015 fehlt, verschmerzbar). Empirisch: weiterhin **keine** deutsche Kostenreferenz (LFS3/Ariadne/Agora) als Vergleichslinie am Akt-4-/Kap-6-Ergebnis; Mehrjahres-Wetterliteratur (Ruhnau & Qvist) fehlt in der Wetterjahr-Limitation. Der Leser kann 152–245 €/MWh weiter nicht extern einordnen. |
| **M10** | Halbjahr trägt die Speicheraussagen nicht | **teilbehoben** | Die Trennung ist über die Karten „Ein halbes Jahr Wetter" + `h2_initial_fill_free` + `half_year_profile` (Modell) im Wesentlichen da, inkl. Richtung („Gegenrichtung zur Gas-Asymmetrie"). Die Story-Karte behauptet aber weiterhin pauschal „Backup-Mengen eher über- als unterschätzt" ohne die Saisonspeicher-Ausnahme, und die H₂-Kostenwerte stehen ohne den Vergleichszahl-Vorbehalt in Akt 4. |
| **M11** | Akt 2 / Schritt 4 verletzt die eigene Abgrenzungsregel | **nicht behoben** | Der Vergleich „liegt unter jedem einzelnen westlichen Erstprojekt" (Studienwert `scope: unklar` gegen Cluster `total_project`) steht unverändert, inklusive der Zuspitzung „nimmt implizit an, dass Deutschland … besser baut". Die faire Lesart steht davor (stand sie in v0.1 auch schon). Weder Scope-Klärung noch Umstellung auf gleiche Abgrenzung. |
| **M12** | Kernkraft als starres Band; ~103 GW implizit | **teilbehoben** | Die Band-Vereinfachung steht jetzt in WP Kap 9 („Kernkraft läuft als Band", mit Richtungsdiskussion). Die implizierte Kernkraftkapazität (~102,7 GW ≈ 60 EPR2-Blöcke, gegen historisches Maximum ~22 GW) wird weder in Akt 4 noch in der Datentabelle ausgewiesen — der Doppelmaßstab gegenüber Akt 5 (Skalenargument) besteht fort. |

### 1.3 KLEIN — 2 teilbehoben, 6 nicht behoben

| # | Befund R1 | Status | Nachweis |
|---|---|---|---|
| S1 | Zwei „eigene" Kernkraft-LCOE (Opex 240 vs. 165) | **nicht behoben** | `story_data.json → shared.wacc_sensitivity.worked_example.assumptions.opex_eur_kw_a` = 240 (außerhalb der eigenen Spanne 130–200); Epilog rendert daraus weiterhin 105,8 / 208,5. `lcoe_recomputed` rechnet mit 165. |
| S2 | Hero zeichnet die verbotene Trendlinie | **nicht behoben** | `buildHero()` verbindet weiterhin alle 15 Punkte quer über alle Kostenabgrenzungen mit einer animierten Linie (plus Parallel-Linie); die Punktwolke kam nur dazu. Drei Bildschirme später steht unverändert das Verbot. |
| S3 | Erzählzahlen hart im HTML / Footer-Behauptung | **nicht behoben, leicht verschärft** | „2,8-mal"/„2,2-mal" (Z. 605 f.), „3,2 … über 600 Gigawatt" (Z. 927) unverändert; Footer behauptet weiter „Alle Zahlen dieser Seite stammen aus story_data.json"; **neu** hartkodiert: „8 gegen 32 Mt CO₂/a statt 28 gegen 107" im Akt-4-Untertitel (Z. 2131). |
| S4 | Lebenszyklus-EF für ETS-Bepreisung | **teilbehoben** | Nicht umgestellt, aber jetzt konsequent als Proxy markiert (Feld-`status`, Limitation `emission_factor_proxy`, WP Kap 9 mit Quantifizierung 10–20 % und Gap `emissionsfaktor_direkt`). Bewusste, dokumentierte Lücke — akzeptabel, Zwei-Felder-Lösung steht aus (siehe auch N2). |
| S5 | Konfidenzstufen unterschiedlich definiert | **nicht behoben** | Story Z. 1173: „B — einfach belegt, plausibel, nicht gegengeprüft" vs. WP Z. 446: „B — einzelner Treffer, institutionelle Quelle". Weiterhin zwei Definitionen, keine gemeinsame Quelle (`meta.confidence_scale` existiert, wird aber nicht in beide gerendert). |
| S6 | Dubletten im Quellenverzeichnis | **nicht behoben** | `ges-studie-2026`/`ges-study`, `irena-2024`/`irena-rpgc-2024`, `lazard-2026`/`lazard-lcoe-19` — alle sechs IDs weiterhin vorhanden (54 Einträge, Titel-Dublettencheck schlägt an); Hero weist 54 Quellen aus. |
| S7 | Offshore-Ersatzprofil ohne Wirkungsrichtung | **teilbehoben** | „Das glättet die Offshore-Einspeisung zu wenig" — die Profilrichtung steht jetzt da, die Kostenkonsequenz (EE-lastige Szenarien erscheinen tendenziell zu teuer) weiterhin nicht. |
| S8 | Wind-Neuanlagen-VLh 2 400 h ohne Quelle/Konfidenz | **nicht behoben** | `sensitivity_flh[1]` trägt nur `note: "Neuanlagen-Mittel"` — weder Quelle noch Konfidenzstufe, weiterhin der Hebel des Wind-Arguments (93,0 → 65,9 €/MWh). |

**Fix-Quote:** KRITISCH **5/5 behoben** · MITTEL **2 behoben, 8 teilbehoben, 2 nicht behoben** ·
KLEIN **2 teilbehoben, 6 nicht behoben**. Über KRITISCH+MITTEL: **7/17 vollständig, 15/17 mindestens
teilweise** adressiert.

---

## 2 · Neue Befunde (durch v0.2b / Story v0.2 / WP v0.11 entstanden)

### MITTEL

**N1 · Der CO₂-Kipppunkt 47,5 €/t ist korrekt gerechnet — aber als deterministischer
Mittelwerte-Punkt kommuniziert er zu viel Schärfe.**
*Fundstelle:* Story Akt 4 / Schritt 3 („Ab rund 48 € je Tonne liegt das Kernkraft-Szenario vorn"),
Epilog („Ab rund 48 € je Tonne dreht er die Rangfolge … unser Modellwert von 75 liegt bereits
darüber"), `story_data.co2_sensitivity`.
*Nachrechnung:* Bisektion mit dem Repository-Code reproduziert **47,55 €/t** exakt; die vier
Stützwerte der Tabelle (0/75/350/990 €/t) stimmen. Der Wert gilt **ceteris paribus**: Szenariensatz
`mittel`, WACC 5 %, Gaspreis 35 €/MWh_th, Kernkraft-CAPEX 12 000 €/kW, Netzvariante mid — variiert
wird ausschließlich der CO₂-Preis (so steht es auch im `method`-Feld und in der Gegenprobe-Kachel;
der Chart-Untertitel `crossover_note` sagt korrekt „im deterministischen Lauf").
*Beanstandung, dreiteilig:*
(a) **Der Kipppunkt selbst ist hochgradig parameterabhängig** — innerhalb der eigenen dokumentierten
Spannen: Gaspreis 20 €/MWh_th → Kipppunkt **110 €/t**; Gaspreis 60 → **kein Kipppunkt** (Kernkraft
führt schon bei 0 €/t); Kernkraft-CAPEX 10 000 → kein Kipppunkt; 14 000 → **186 €/t**. Der Punkt
wandert also zwischen „existiert nicht" und ~186 €/t. Ein Punktwert ohne diese Spanne suggeriert eine
Konstante, wo eine Funktion der übrigen Setzungen ist.
(b) **Deterministisch und probabilistisch widersprechen sich an genau dieser Stelle**, und die Story
löst das nicht auf: Über die eigenen gepaarten Ziehungen liegt der Median-Kipppunkt (Median-Δ = 0)
bei rund **90–92 €/t** (nachgerechnet: Median-Δ +3,7 bei 47,5 €/t; +1,4 bei 75; +0,2 bei 90; −0,7 bei
100). Bei 47,5 €/t ist das Kernkraft-Szenario nur in **35,5 %** der Ziehungen vorn, bei 75 in 44,9 %.
Der Epilog-Satz „Ab rund 48 dreht er die Rangfolge … 75 liegt bereits darüber" kollidiert damit
direkt mit Schritt 3 derselben Seite (Median 158 vs. 157 — im Median führt bei 75 €/t der *Gas*-Pfad).
Der Grund ist die Rechtsschiefe der Kernkraft-CAPEX-Verteilung samt IDC-Interpolation: Median ≠
deterministischer Mittelwertlauf. Ein aufmerksamer Leser findet diesen Widerspruch.
(c) Im Fließtext von Schritt 3 und im Epilog fehlt der Qualifikator „deterministisch / alle übrigen
Parameter auf dem Zentralwert" — er steht nur in der aufklappbaren Kachel.
*Korrektur (klein):* „Kipppunkt" durchgängig als „deterministischer Kipppunkt" führen, im Epilog den
Halbsatz ergänzen, dass er über die gepaarten Ziehungen im Median erst bei rund 90 €/t liegt und mit
dem Gaspreis zwischen „nie" und > 100 €/t wandert. Die Zahl selbst kann bleiben.

**N2 · CCS-Massenbilanz: abgeschiedene und emittierte Tonnen summieren sich auf mehr CO₂, als das
Modell selbst kennt.**
*Fundstelle:* `model.ccs_chain` + `gas_ccs`-Parameter (`emission_factor_t_mwh_th` = 0,2418,
`emission_factor_t_mwh` = 0,120, η = 0,52, Abscheiderate 0,90).
*Nachrechnung:* captured = 0,2418 / 0,52 × 0,90 = **0,4185 t/MWh_el**; Restemission **0,120**;
Summe **0,539 t/MWh_el**. Der eigene Lebenszyklus-Gesamtwert bei η = 0,52 beträgt aber
0,403 × 0,60/0,52 = **0,465 t/MWh_el**. Es werden also ~0,074 t/MWh_el bepreist, die es im eigenen
Datensatz nicht gibt (≈ 5,9 €/MWh_el CCS-Kosten auf die Gasarbeit). Hinzu kommt die physikalische
Inkonsistenz: Der brennstoffbezogene Faktor 0,2418 t/MWh_th ist aus dem *Lebenszyklus*-Wert
abgeleitet — eine Post-Combustion-Wäsche kann die Vorkette (Methanschlupf) aber nicht abscheiden.
Verbrennungsbasiert (~0,202 t/MWh_th) wäre captured ≈ 0,349 t/MWh_el; die eingelagerten Mengen
(29,0 / 110,6 Mt/a) sind damit um rund **20 % überzeichnet**, die CCS-Kette um ~5,6 €/MWh_el zu teuer.
*Wirkung:* gegen beide CCS-Varianten, den Gas-Pfad (264 TWh) 3,8-mal stärker als das
Kernkraft-Szenario — d. h. P(Kernkraft+CCS < Gas+CCS) = 90,3 % ist insoweit leicht *über*zeichnet
(Größenordnung: ~1,6 €/MWh System beim Gas-Pfad, ~0,4 beim Kernkraft-Pfad; kippt nichts). Die
Limitation `ccs_residual_is_lifecycle` deckt nur die Restemissions-Hälfte ab, nicht die
Abscheide-Tonnage.
*Korrektur:* `emission_factor_t_mwh_th` auf den Verbrennungswert stellen (~0,202) und die
Restemission konsistent zerlegen (Verbrennungsrest + Vorkette), oder mindestens die Doppelbepreisung
als Limitation ausweisen und die „eingelagert"-Mengen als Obergrenze markieren.

**N3 · „Auf gleichem Emissionsniveau" ist eine Übertreibung — 8 gegen 32 Mt ist derselbe Faktor 3,8
wie 28 gegen 107.**
*Fundstelle:* Story Akt 4 / Schritt 5 (Titel „Auf gleichem Emissionsniveau"),
`monte_carlo_headline.honest_statement` („Auf gleichem Emissionsniveau … führt das Kernkraft-Szenario
mit 90 Prozent"), `modell_v02_ergebnis.md` 4b.1 („Auf vergleichbarem Emissionsniveau").
*Beanstandung:* Die CCS-Nachrüstung senkt beide Pfade proportional (27,9→8,3 bzw. 106,5→31,7 Mt/a);
die *Gleichheit* wird nicht hergestellt, das Verhältnis bleibt 3,8. Die Zahlen selbst stehen ehrlich
daneben (28 vs. 107, 8 vs. 32) — nur die Überschrift und der Kernsatz behaupten mehr. Zweitens erbt
das 90,3-%-Ergebnis die selbst diagnostizierte Obergrenzen-Verzerrung `ccs_on_full_backup_fleet`
**asymmetrisch**: CCS auf dem gesamten, niedrig ausgelasteten Backup-Park trifft den Gas-Pfad
(1 930 h, 264 TWh) viel härter als das Kernkraft-Szenario (1 282 h, 69 TWh). Ein real optimierter
Gas+CCS-Pfad wäre billiger, die 90,3 % entsprechend niedriger. Headline-Zahl und Limitation stehen an
getrennten Orten und werden nicht verknüpft. (Der Emissions-Rabatt-Befund selbst ist korrekt und
wichtig — die Richtung bestätigt auch die deterministische Gegenprobe über den CO₂-Preis: bei
350 €/t führt das Kernkraft-Szenario ohne CCS mit 25 €/MWh Abstand.)
*Korrektur:* Überschrift z. B. „Auf abgesenktem — aber weiter ungleichem — Emissionsniveau"; an die
90,3 % den Halbsatz, dass die CCS-Auslegung auf dem ganzen Backup-Park den Gas-Pfad überproportional
belastet und die Zahl insoweit eine Obergrenze ist.

**N4 · Die Vermeidungskosten 378–531 €/t sind nur in *einer* Dimension eine Obergrenze — zwei eigene
Limitationen zeigen nach oben.**
*Fundstelle:* Story Akt 4 / Schritt 5 („Das ist eine Obergrenze, kein Preisschild"),
`ccs_narrative.implied_abatement_cost_eur_t`, `modell_v02_ergebnis.md` 4b.1.
*Nachrechnung:* Beide Werte reproduzieren exakt (Δ-Kosten/Δ-Emissionen: 10,40 Mrd. €/a / 19,6 Mt =
531 €/t; 28,28 / 74,8 = 378 €/t). Das Obergrenzen-Argument (CCS auf dem gesamten Park statt nur auf
hochausgelasteten Blöcken) ist korrekt. **Aber:** Das eigene Limitationenset sagt zugleich, dass der
CCS-Vollkettensatz 50/80/100 €/t „am unteren Rand der Literatur" liegt (70–250 €/t) und die
Speicher-/Transportkette gar nicht modelliert ist — beides würde die Vermeidungskosten *erhöhen*.
Bezüglich des Kostensatzes sind 378–531 €/t also eher eine Untergrenze; N2 wirkt zusätzlich nach
unten. Das pauschale „Obergrenze" ist damit in derselben Weise einseitig, die der Beitrag anderen
vorwirft.
*Korrektur:* Ein Halbsatz: „Obergrenze bezüglich der Auslegung — bezüglich des Kostensatzes (unteres
Literaturband, keine Speicherkette) eher eine Untergrenze."

### KLEIN

**N5 · Asien/Golf-Dreieck (1 870 / 3 150 / 4 950, Modus Barakah-EPC):** Konstruktion insgesamt
sauber und bemerkenswert konservativ dokumentiert (voller IDC mangels `total_incl_idc`-Scope, kein
Overrun auf realisierte Kosten, keine Kombination mit dem Overrun-Lauf, Bauzeit 8 a des Clusters,
Begründung und Gegenposition wörtlich im Output). Drei Anmerkungen: (a) Das Dreieck mischt
Kostenabgrenzungen (min `overnight_only`, Modus `epc_only`, max `total_incl_owners`) — genau die
Scope-Mischung, die die Basisspanne mit M1 gerade losgeworden ist; für einen Kontrast vertretbar,
sollte aber benannt sein. (b) Barakah selbst zeigt EPC→Gesamt = Faktor 1,57; für die Frage „was
kostete ein Export" ist der EPC-Modus das untere plausible Ende, nicht die Mitte — der einzige
Übertragbarkeits-Datenpunkt ist eben der *Vertrags*-, nicht der *Käuferkosten*-Punkt. (c) Die untere
Verteilungshälfte ruht auf Korea-domestic-Werten, denen der eigene Datensatz die Übertragbarkeit
abspricht. Da die Konfiguration konsequent als „Kontrast, kein Deutschland-Szenario" gerahmt und nie
in die Basisspanne gemischt wird: kein Korrekturbedarf, ein Hinweissatz genügt.

**N6 · Veraltetes Metadatum in v0.2b-Läufen:** `model.mix_system` schreibt in *jedes* Ergebnis
`emissions.ccs = "NICHT MODELLIERT …"` — auch in die CCS-Presets. In
`monte_carlo_reference.json → presets.kostenminimum_ccs.emissions_detail.ccs` steht damit die
faktisch falsche Aussage „dieses Modell tut das nicht". In `story_data.json` herausgefiltert, in der
Referenzdatei nicht. String konditionieren.

**N7 · Netz-Overrun auf den Verteilnetz-Sockel:** Im Overrun-Lauf wird der Faktor der Klasse
`netz_uebertragung` auf den *gesamten* Netzblock einschließlich Verteilnetz-Sockel gelegt
(`monte_carlo.system_cost`: `overrun['netz'] × (trans·scale_t + dist·scale_d)`). Übertragungsnetz-
Empirie auf Verteilnetz übertragen; wirkt in den Overrun-Konfigurationen relativ am stärksten gegen
die EE-Pfade (größter Netzblock).

**N8 · Abscheiderate wird gezogen, Restemission nicht:** Die MC zieht `capture_rate` (0,85–0,95);
`emission_factor_t_mwh` (Restemission 0,120) bleibt fix. Eine Ziehung mit hoher Rate bezahlt mehr
CCS-Kette, emittiert aber gleich viel — die beiden Größen sind physisch gekoppelt und sollten es auch
in der Ziehung sein (oder eine von beiden aus der anderen abgeleitet werden).

**N9 · Rest-„klimaneutral":** Der `<title>` der Story („Was kostet ein klimaneutrales
Stromsystem?") und die Meta-Description des WP transportieren die Rahmung weiter, die der Text
selbst korrigiert hat.

**N10 · Neue Hartkodierung:** „8 gegen 32 Mt CO₂/a statt 28 gegen 107" (Akt-4-Untertitel, Z. 2131)
ist hartkodiert, während der Footer weiter „alle Zahlen aus story_data.json" verspricht (verschärft
S3).

**N11 · Ziehungsplan-Aufzählung unvollständig:** Story Schritt 2 nennt „Baukosten, Betriebskosten,
Volllaststunden und der Erdgaspreis … insgesamt 30 Größen" — die 30 enthalten auch CCS-Kostensatz
und Abscheiderate.

---

## 3 · Was ich in Runde 2 ausdrücklich anerkenne

1. **Die Fixes sind inhaltlich richtig, nicht nur formal abgehakt.** Insbesondere die
   Scope-Interpolation (M1/M7-Logik in einem Mechanismus), die Trennung „IDC nur auf Overnight-Anker /
   Overrun nur auf Schätzungs-Anker" und die konservative Gegenrichtung beim Asien-Kontrast (voller
   IDC) zeigen, dass das Prinzip verstanden wurde, nicht nur die Beanstandung.
2. **Das unbequeme Ergebnis wurde publiziert.** v0.2b hat den Beinahe-Gleichstand als teilweisen
   Emissions-Rabatt entlarvt (44,9 % → 90,3 % mit CCS) und die Nebenbotschaft „heute ist am
   billigsten" zerstört — beides gegen die bisherige Dramaturgie. Das ist die Sorte intellektueller
   Redlichkeit, die ich in Runde 1 gelobt habe, unter Beweis gestellt.
3. **Reproduzierbarkeit hält unter Last.** Jede von mir nachgerechnete publizierte Zahl reproduziert
   exakt; der Doppellauf der Testvektoren ist byteidentisch; der deterministisch↔MC-Paritätscheck im
   Code verhindert stilles Auseinanderlaufen der Kostenfunktionen.
4. **Der Ist-Anker-Validierungstest (d)** (Restdeckung +4,8 % gegen die faire Ist-Vergleichsgröße)
   ist ein echter Falsifikationsversuch und der stärkste neue Einzelbeleg für die Dispatch-Kette.

---

## 4 · Publikationsurteil

### Story (`strommix-story.html`, v0.2): **freigeben nach kleinen Korrekturen.**

Akt 4 ist jetzt tragfähig: gepaarte Ziehungen, Differenzverteilung, Emissionsausweis,
CCS-Gegenprobe, Asien-Kontrast — die Pointe („die Rangfolge hängt an drei Setzungen, nicht an der
Technologie") ist erstmals gerechnet statt behauptet. Vor Freigabe zwingend, alles zusammen wenige
Stunden Arbeit:

1. **N1** — Kipppunkt in Schritt 3 und Epilog als deterministischen Wert kennzeichnen und den
   MC-Median-Kipppunkt (~90 €/t) bzw. die Gaspreis-Abhängigkeit in einem Halbsatz nennen; den
   Widerspruch Epilog ↔ Schritt-3-Mediane auflösen.
2. **N3/N4** — Überschrift Schritt 5 und die beiden Pauschalsätze („gleiches Emissionsniveau",
   „Obergrenze") präzisieren.
3. **N2** — Parameterkorrektur oder ausgewiesene Limitation zur CCS-Massenbilanz (betrifft 90,3 %,
   Vermeidungskosten und „eingelagert"-Mengen).
4. Aufräumliste aus Runde 1: S1 (Opex 240 → 165 im worked_example), S2 (Hero-Linie), S5
   (Konfidenz-Definitionen vereinheitlichen), S6 (Quellen-Dubletten, Hero-Zählung), N9 (`<title>`);
   dazu je eine Limitationskarte für M3 (Auslegung gesetzt) und den H₂-Vergleichszahl-Vorbehalt (M4/M10).

Keiner dieser Punkte erfordert eine neue Modellrunde; eine Stichprobenprüfung der Umsetzung genügt.

### White Paper (`whitepaper-strommix.html`/`.js`, v0.11): **freigeben nach kleinen Korrekturen.**

Kapitel 3 und 6 sind methodisch die stärksten Teile des Gesamtwerks geworden (CRN-Erklärung,
Differenzverteilung, Spurious-Overlap-Demonstration, eingefrorener Dispatch als benannte zentrale
Vereinfachung, Kap-5-Preset-Angleichung an den Kap-6-Anker). Vor Freigabe: N2 (gleiche
Parameterfrage), N4-Halbsatz an den Vermeidungskosten, N6 (falsches CCS-Metadatum in der
Referenzdatei), S5 (Konfidenz-Definition mit der Story vereinheitlichen), M2-Rest (die
LSCOE-Ausschlussliste gehört auch in die Story-Glossar-Definition), und — einziger inhaltlicher
Wunsch mit etwas Aufwand — mindestens eine deutsche Kostenreferenz als externe Vergleichslinie in
Kapitel 6 (M9), damit der Leser 152–245 €/MWh einordnen kann.

**Keine weitere volle Begutachtungsrunde nötig.** Die Runde-1-Substanzkritik ist ausgeräumt; die
verbleibenden Befunde sind Formulierungs- und Parametrierungsfragen mit Effekten im einstelligen
€/MWh-Bereich, die keine Schlussfolgerung kippen.

---

*Nachbemerkung.* Runde 1 endete mit dem Satz, der Beitrag müsse den Maßstab, den er an andere anlegt,
auch für sich gelten lassen. Das ist in v0.2b in einem Umfang geschehen, den ich bei eingereichten
Manuskripten selten sehe — einschließlich der Bereitschaft, die eigene Pointe zu opfern. Die neuen
Befunde dieser Runde sind fast alle vom selben Typ: eine korrekte Rechnung, deren Formulierung eine
Präzision verspricht, die die Parameterlage nicht hergibt. Das ist der letzte verbliebene Abstand
zwischen diesem Beitrag und dem Anspruch, den er sich selbst gesetzt hat — und er ist klein.
