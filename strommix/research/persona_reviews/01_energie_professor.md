# Fachgutachten · Scrollytelling „Ein Stromsystem, zwei Preisschilder" (v 0.1)

**Persona:** Professorin für Energiesysteme und Energiewirtschaft an einer deutschen
Technischen Universität; Arbeitsschwerpunkte Systemkostenmodellierung, Kapazitäts­ausbau­planung
und Unsicherheitsanalyse. Gebeten, den Beitrag vor Veröffentlichung fachlich zu begutachten.

**Prüfdatum:** 2026-08-19
**Prüfobjekte:** `strommix-story.html` (Hauptfokus) · `whitepaper-strommix.html` (Stichproben,
Kap. 3/4/5/6) · Referenz-Unterbau: `strommix/research/*.md`, `strommix/data/*.json`,
`strommix/scripts/model.py`, `strommix/scripts/monte_carlo.py`
**Prüftiefe:** Volltext der Story, Stichproben im White Paper, vollständiger Nachvollzug der
Rechenkette (Modell nachgerechnet, Monte Carlo mit gepaarten Ziehungen nachgestellt,
Sensitivitäten selbst gerechnet). Alle in diesem Gutachten genannten Gegenrechnungen sind
mit dem im Repository liegenden Code erzeugt.

---

## Gesamturteil

Dieser Beitrag ist handwerklich und didaktisch außergewöhnlich gut gemacht — die Kette
CAPEX → Annuität → Volllaststunden → Systemkosten, die konsequente Kennzeichnung von
Kostenabgrenzungen (OCC/EPC/FOAK/Gesamtprojekt), die Konfidenzstufen an jeder Zahl und das
Selbstkritik-Kapitel liegen über dem Standard vieler begutachteter Studien, und die Autorenschaft
weist eigene Zuspitzungen mehrfach selbst zurück. Genau deshalb wiegt schwer, dass die
Pointe des Beitrags — Akt 4, „die Rangfolge ist nicht entschieden", Kernkraft rutscht hinter
den gasgestützten Pfad — auf drei methodischen Fehlern beruht, die einzeln jeweils größer sind
als der behauptete Rangabstand: doppelt gezählte Bauzinsen bei der Kernkraft (+24,3 €/MWh),
ein Erdgas-Brennstoffpreis von null bei gleichzeitiger CO₂-Bepreisung (−14 €/MWh beim Gewinner)
und ein statistisch unzulässiges Überlappungs­argument statt einer gepaarten Differenzrechnung.
Hinzu kommt, dass die verglichenen Szenarien nicht emissions­äquivalent sind: das im Modell
billigste „klimaneutrale" System emittiert nach den eigenen Faktoren rund 107 Mt CO₂ pro Jahr.

**Publikationsempfehlung: überarbeiten** (major revision).

Akt 1, 2, 3 und 5 können nach kleineren Korrekturen nahezu unverändert erscheinen; Akt 4 und
die daran hängenden Aussagen im Zwischenruf, im Epilog und im White-Paper-Kapitel 6 müssen
neu gerechnet und neu formuliert werden. Ich begutachte gerne erneut — der Beitrag ist es wert.

**Befunde:** 5 KRITISCH · 12 MITTEL · 8 KLEIN

---

# KRITISCH

## K1 · Bauzinsen werden bei der Kernkraft doppelt gezählt

**Fundstelle:** Akt 4 (alle vier Schritte), Datentabelle Akt 4, White Paper Kap. 5 und 6;
Ursache in `scripts/model.py` (`idc_surcharge`, `lcoe`, `resolve_tech(apply_idc=True)`) in
Verbindung mit `data/model_params.json → technologies.nuclear.capex_eur_kw`.

**Ist.** Das Modell setzt für Kernkraft CAPEX min/mid/max = 7 500 / 12 000 / 17 500 €/kW an und
schlägt auf jeden dieser Werte zusätzlich Bauzinsen auf: `idc = (1+WACC)^(t/2) − 1`, bei
WACC 5 % und 12 Jahren Bauzeit **+34,0 %**. Aus 12 000 €/kW werden effektiv 16 081 €/kW.
Die Kernkraft-LCOE steigen dadurch von 122,5 auf 151,3 €/MWh.

**Beanstandung.** Der Mittelwert 12 000 €/kW ist im eigenen Datensatz explizit auf
Gesamtprojekt-Anker gestützt, die die Finanzierung bereits enthalten
(`shared.nuclear_capex_scenarios.anchors.mid` = Lubiatowo-Kopalino 11 968 €/kW
`scope: total_project`, Sizewell C 13 472 €/kW `scope: total_project`, EPR2 **inkl. Finanzierung**
10 417 €/kW); der Höchstwert 17 500 €/kW ist auf Hinkley Point C
(17 264 €/kW, `scope: "total_project, laufende Preise"`) gestützt. Nur der Tiefwert 7 500 €/kW
ruht auf einer Overnight-/EPC-Abgrenzung (EPR2 OCC 7 583, Dukovany EPC 7 906). Der Datensatz
belegt die Identität sogar selbst: `nuclear.idc_surcharge_pct.empirical_anchor` = „EPR2
72,8 Mrd. € ohne → ca. 100 Mrd. € mit Finanzierung = +37 %", und 7 583 × 1,37 ≈ 10 389 ≈ 10 417.
Es wird also derselbe Aufschlag zweimal angewandt. Das ist genau der Fehler, den der eigene
Beipackzettel („OCC, EPC, FOAK") den anderen vorwirft — nur diesmal im eigenen Modell.

Effektgröße, mit dem Repository-Code nachgerechnet (`mix_system(..., apply_idc=False)`):

| Preset | mit IDC | ohne IDC | Δ |
|---|---:|---:|---:|
| GES · Kostenminimum | 155,8 | **131,5** | −24,3 |
| GES · 80 % EE + Gas | 140,7 | 137,0 | −3,7 |
| GES · 80 % EE + H₂ | 197,2 | 193,0 | −4,2 |
| GES · 100 % EE | 270,9 | 264,1 | −6,8 |

Der behauptete Rangabstand zwischen Kostenminimum und dem Gas-Pfad beträgt 15,1 €/MWh
(deterministisch) bzw. 19,4 €/MWh (MC-Median). **Der Doppelzählungs-Effekt ist größer als der
Befund.** Entfernt man ihn, kehrt sich die Reihenfolge um (131,5 gegen 137,0). Die gesamte
Dramaturgie von Akt 4 und der Zwischenruf „Rangwechsel um einen Platz" stehen damit auf einem
Rechenfehler.

**Korrekturvorschlag.**
1. `technologies.nuclear.capex_eur_kw` um ein Feld `scope` je Stützstelle ergänzen und die
   Spanne auf **eine** Abgrenzung vereinheitlichen. Empfehlung: durchgängig Overnight
   (z. B. OCC 5 600 / 9 000 / 13 000 €/kW, aus den vorhandenen Ankern durch Herausrechnen des
   dokumentierten 20/33/55-%-IDC gewonnen) und den IDC-Aufschlag wie bisher im Modell bilden.
2. Alternativ `apply_idc` für Kernkraft auf `False` setzen und im Methodenkapitel begründen,
   dass die CAPEX-Anker bereits all-in sind.
3. In beiden Fällen dieselbe Prüfung für PV, Wind und GuD durchführen — dort sind die
   Referenzen typischerweise schlüsselfertige Investitionskosten, der Aufschlag ist mit
   2,5–7,6 % klein, aber die Abgrenzung gehört ebenfalls dokumentiert.
4. Danach Akt 4, den Zwischenruf, die Datentabelle 4 und White Paper Kap. 6 neu rechnen.

---

## K2 · Erdgas kostet im Modell nichts — bepreist wird nur sein CO₂

**Fundstelle:** Akt 4 / Schritt 3 und 4, Zwischenruf „Was von der Schlagzeile bleibt",
Selbstkritik-Karte „Gaspreis fehlt", White Paper Kap. 5/6;
Ursache: `model_params.json → technologies.gas_ccgt.params.fuel_eur_mwh = null`
(„HARTE LUECKE"), im Code zu 0 gesetzt.

**Ist.** Der Brennstoffpreis für Erdgas ist mit 0 €/MWh angesetzt, der CO₂-Preis dagegen mit
75 €/t. Das Szenario, das im Modell gewinnt, deckt 264,4 TWh — **27,8 % der gelieferten
Arbeit** — aus Gas-Backup; das Kernkraft-Szenario 69,2 TWh. Die Limitationskarte nennt die
Lücke und stellt sie als für alle Szenarien geltend dar („auch das Kernkraft-Szenario mit
seinen 53,9 GW Spitzenlast").

**Beanstandung.** Die Lücke ist nicht symmetrisch, sondern trifft den Gewinner um den
Faktor 3,8 härter. Nachgerechnet (η = 0,60):

| Gaspreis (€/MWh_th) | Kostenminimum | 80 % EE + Gas | Rangabstand |
|---:|---:|---:|---:|
| 0 (Status quo des Modells) | 155,8 | 140,7 | 15,1 |
| 25 | 158,8 | 152,3 | 6,5 |
| 30 | 159,4 | 154,6 | 4,8 |
| 40 | 160,6 | 159,2 | 1,4 |
| 50 | 161,8 | 163,9 | **−2,1 (Umkehr)** |

Der zentrale Befund von Akt 4 ist damit vollständig innerhalb der Unschärfe eines Parameters,
der auf null gesetzt wurde. Hinzu kommt eine innere Inkonsistenz: Wer die Emissionen der
Gasverstromung bepreist, aber nicht den Brennstoff, rechnet ein physikalisch unmögliches
Kraftwerk. Dass in den Recherche-Dossiers kein Gaspreis steht, ist keine ausreichende
Begründung — TTF-Terminkurven und BAFA-Grenzübergangspreise sind öffentlich, institutionell und
in Sekunden belegbar; die Datenlücke ist eine Lücke der Recherche, nicht der Welt.

**Korrekturvorschlag.**
1. `gas_ccgt.fuel_eur_mwh` als Pflichtparameter mit Spanne einführen — Vorschlag
   min/mid/max = 20/32/60 €/MWh_th, umgerechnet über den gezogenen Wirkungsgrad, Quelle
   TTF-Forward-Kurve bzw. BAFA-Grenzübergangspreis mit Zugriffsdatum. Der Parameter gehört in
   den Monte-Carlo-Ziehungsplan (dann 24 statt 23 Größen).
2. Bis dahin: die Rangaussage in Akt 4 / Schritt 3 und im Zwischenruf **streichen** und durch
   die Aussage ersetzen, dass die Reihenfolge zwischen Kernkraft- und Gas-Pfad ohne Gaspreis
   nicht bestimmbar ist.
3. Die Limitationskarte „Gaspreis fehlt" um die Asymmetrie ergänzen: 264 TWh gegen 69 TWh.

---

## K3 · „Überlappende Bänder ⇒ Rangfolge nicht entschieden" ist statistisch nicht haltbar

**Fundstelle:** Akt 4 / Schritt 3 („Die Bänder überlappen vollständig im unteren Bereich.
‚Das eine ist teurer als das andere' ist bei dieser Streuung keine trennscharfe Aussage");
Diagrammuntertitel „Rangfolge zwischen Kostenminimum und 80 % EE + Gas nicht entschieden";
White Paper Kap. 6 („die interessante Frage ist nicht mehr ‚welches Szenario ist billiger',
sondern: Überlappen sich die Verteilungen? Wenn ja, ist die Rangfolge der Szenarien nicht
entschieden"); Ursache in `scripts/monte_carlo.py`, `seed = BASE_SEED + pi*1000 + ci`.

**Ist.** Je Preset wird mit einem **anderen** Startwert gezogen; verglichen werden anschließend
die Randverteilungen (P5–P95) der Szenarien. Aus deren Überlappung wird geschlossen, die
Rangfolge sei unentschieden. Diese Regel wird im White Paper sogar als methodisches Prinzip
formuliert.

**Beanstandung.** Zwei Punkte, beide gravierend.

*Erstens, konzeptionell:* Die gezogenen Größen sind **gemeinsame** Größen. Es gibt nicht einen
PV-CAPEX im Kernkraft-Szenario und einen anderen im Gas-Szenario; es gibt einen deutschen
PV-CAPEX, der in beiden Welten derselbe ist. Unabhängige Ziehungen je Szenario unterstellen
implizit das Gegenteil und zerstören genau die Korrelation, die hier per Konstruktion vorliegt.
Der Standard sind gemeinsame Zufallszahlen (common random numbers) und die Auswertung der
**Differenzverteilung**.

*Zweitens, statistisch:* Aus der Überlappung von Randintervallen folgt nichts über die
Rangfolge. Das ist der klassische „overlapping confidence intervals"-Fehlschluss. Hier
konkret — ich habe den Lauf mit identischem Seed je Preset nachgestellt, alles andere
unverändert:

| Konfiguration | P(Kernkraft-Szenario günstiger) | Median Δ (KKW − Gas) | P5 … P95 |
|---|---:|---:|---:|
| base | **13,4 %** | +19,5 €/MWh | −7,9 … +48,4 |
| WACC unsicher | 11,4 % | +24,6 €/MWh | −7,1 … +81,2 |
| mit Kostenüberschreitung | 0,1 % | +105,3 €/MWh | +41,2 … +173,1 |

Die Rangfolge ist unter den *eigenen* Annahmen also mit 87 % Wahrscheinlichkeit entschieden —
das Gegenteil der Aussage im Text. Die Überlappung der Randverteilungen verdeckt das, weil sie
die gemeinsame Parameterunsicherheit doppelt zählt.

Bemerkenswert: dieser Fehler und K1/K2 wirken in entgegengesetzte Richtungen. Korrigiert man
zusätzlich den Gaspreis, ergibt sich ein Bild, das die Textaussage tatsächlich stützt — aber
aus ganz anderen Gründen:

| Gaspreis (€/MWh_th) | P(Kernkraft günstiger), gepaart | Median Δ |
|---:|---:|---:|
| 0 | 13,4 % | +19,5 |
| 20 | 22,7 % | +12,6 |
| 30 | **31,2 %** | +9,2 |
| 40 | 38,1 % | +5,8 |

Die Schlussfolgerung „nicht trennscharf" kann also überleben. Die dafür angeführte Begründung
darf es nicht.

**Korrekturvorschlag.**
1. In `monte_carlo.py` denselben Seed für alle Presets verwenden (der Ziehungsplan ist bereits
   global und identisch geordnet — die Umstellung ist einzeilig) und je Ziehung alle fünf
   Presets rechnen.
2. Zusätzlich zu den Perzentilen die Differenzverteilung und **P(A < B)** je Szenariopaar
   ausgeben, in `story_data.json` aufnehmen und in Akt 4 zeigen.
3. Den Satz im White Paper Kap. 6 („Überlappen sich die Verteilungen? Wenn ja …") ersetzen:
   Maßgeblich ist die Verteilung der *Differenz*, nicht die Lage der Randintervalle.
4. Im Glossar `#gl-mc` denselben Punkt didaktisch aufnehmen — er ist lehrreich und passt zum
   Anspruch der Story.

---

## K4 · Die verglichenen Szenarien sind nicht emissionsäquivalent — „klimaneutral" trifft auf den Sieger nicht zu

**Fundstelle:** Hero („für ein klimaneutrales deutsches Stromsystem"), Prolog, Akt 4 gesamt;
Ursache: `model_params.json` kennt keine CCS-Technologie, `gas_ccgt.emission_factor_t_mwh = 0,403`.

**Ist.** Mit den Emissionsfaktoren des eigenen Datensatzes ergeben sich für die
Modell-Szenarien folgende Rest­emissionen der Stromerzeugung:

| Preset | Gas-Backup | CO₂ | Anteil an der Erzeugung |
|---|---:|---:|---:|
| „Ist 2025" | 306,2 TWh | 123,4 Mt/a | 58,9 % |
| GES · Kostenminimum | 69,2 TWh | 27,9 Mt/a | 7,3 % |
| **GES · 80 % EE + Gas** | **264,4 TWh** | **106,5 Mt/a** | **27,8 %** |
| GES · 80 % EE + H₂ | 11,9 TWh | 4,8 Mt/a | 1,3 % |
| GES · 100 % EE | 3,2 TWh | 1,3 Mt/a | 0,3 % |

**Beanstandung.** Ein Vergleich von Systemkosten in €/MWh ist nur dann eine Aussage über
Technologien, wenn alle verglichenen Systeme dieselbe Nebenbedingung erfüllen — bei einem
Klimaneutralitätsziel: dieselbe Emissionsobergrenze. Hier unterscheiden sich die Szenarien um
den Faktor 80 in den Rest­emissionen, und das billigste ist mit rund 107 Mt CO₂/a kein
klimaneutrales System, sondern ungefähr das heutige Emissionsniveau der deutschen
Stromerzeugung. Die Story spricht durchgehend von „einem klimaneutralen deutschen Stromsystem"
und nennt an keiner Stelle die Rest­emissionen ihrer eigenen Szenarien — das Wort „Mt" kommt im
gesamten Dokument nicht vor.

Verschärfend: Die geprüfte Studie rechnet ihren Gas-Pfad ausweislich des eigenen
ETS-Abschnitts mit **CCS** („Dass auf die Restemissionen von Gas mit CCS kein CO₂-Preis gelegt
wird …"). Das Modell kennt keine CCS-Kette — weder deren CAPEX/OPEX noch den
Wirkungsgradverlust noch die Transport- und Speicherkosten. Es rechnet also einen Gas-Pfad, den
die Studie nicht behauptet, und vergleicht ihn dann mit deren Kernkraft-Pfad. Ein 75-€/t-Preis
auf 107 Mt entspricht ~8 Mrd. €/a; die Vermeidung dieser Emissionen kostet ein Vielfaches
davon. Der Kostenvorsprung des Gas-Pfads ist damit im Wesentlichen der Preis dafür, das
Klimaziel nicht einzuhalten.

**Korrekturvorschlag.**
1. Rest­emissionen je Szenario in Akt 4 sichtbar machen — als zweite Achse, als Beschriftung
   am Balken oder mindestens in der Datentabelle. Das ist wenig Aufwand und behebt die
   Irreführung sofort.
2. Entweder eine harte Emissionsobergrenze je Szenario setzen (z. B. ≤ 5 Mt/a) und die
   Zusatzkapazität bepreisen, die zu ihrer Einhaltung nötig ist — oder eine CCS-Variante von
   `gas_ccgt` einführen (CAPEX-Aufschlag, η-Verlust, Abscheidegrad, Transport/Speicherung,
   Restemission gemäß `ets_gap_gas_ccs.gas_ccs_residual_g_co2_kwh`) und den Gas-Pfad damit
   rechnen.
3. Bis eines von beidem umgesetzt ist: das Wort „klimaneutral" im Hero und Prolog auf die
   *Studie* beziehen, nicht auf die eigenen Modellergebnisse, und in Akt 4 explizit
   festhalten, dass die eigenen Szenarien unterschiedliche Emissionsniveaus haben.

---

## K5 · Der Anker „das heutige System von 2025" ist kein heutiges System

**Fundstelle:** Akt 4 / Schritt 1 („plus eine fünfte als Anker: das heutige System von 2025,
mit demselben Modell gerechnet"), Diagramm Akt 4 (Label „Ist 2025"), Datentabelle Akt 4;
Ursache: `monte_carlo.build_presets`, Preset `ist2025`.

**Ist.** Das Preset besteht ausschließlich aus PV (89,5 TWh), Wind onshore (110,1 TWh) und
Wind offshore (28,0 TWh). Die gesamte Residuallast — 306,2 TWh, also 58,9 % der Erzeugung —
wird von Gas-Backup gedeckt. Braunkohle (75,2 TWh), Steinkohle (25–28 TWh), Biomasse
(42,7 TWh) und Wasserkraft (21,0 TWh) fehlen, obwohl sie in `page_data.ist_mix.2025` mit
Quelle vorliegen. Gleichzeitig werden dem Jahr 2025 anteilig 31,9 €/MWh Netzinvestition
**bis 2045** berechnet, der Gasbrennstoff mit null angesetzt und 75 €/t CO₂ erhoben.
Ergebnis: 107,1 €/MWh.

**Beanstandung.** Der Leser bekommt diesen Wert als Bezugspunkt für die eigene Lebenswirklichkeit
angeboten („das heutige System"). Er ist keiner. Er enthält vier zusammenwirkende
Verzerrungen, von denen zwei nach oben und zwei nach unten wirken. Korrigiert man nur drei
davon (Bauzinsen, Gaspreis 30 €/MWh_th, Netzannuität gleichmäßig auf die Arbeit verteilt),
ergibt sich:

| Preset | wie publiziert | mit allen drei Korrekturen |
|---|---:|---:|
| „Ist 2025" | 107,1 | **175,4** |
| Kostenminimum | 155,8 | 167,5 |
| 80 % EE + Gas | 140,7 | 154,1 |
| 80 % EE + H₂ | 197,2 | 196,9 |
| 100 % EE | 270,9 | 238,3 |

Die publizierte Fassung erzählt: „heute 107, jede Zukunft 141 bis 271 — die Transformation
verdoppelt bis verdreifacht die Kosten." Die korrigierte erzählt: „heute 175, die Zukünfte
liegen zwischen 154 und 238 — der gasgestützte Pfad ist billiger als heute." Das sind zwei
verschiedene Beiträge. Ein Anker, der so empfindlich auf Modellkonventionen reagiert, darf nicht
als „Ist" bezeichnet werden.

**Korrekturvorschlag.**
1. Preset umbenennen und umtexten: **„Referenzsystem: heutiger fEE-Bestand, Rest Gas"** — und
   im Diagramm optisch von den vier Zukunftsszenarien absetzen (andere Farbe, Trennlinie,
   eigener Block), damit kein Ranking-Eindruck entsteht.
2. Oder — besser — Kohle, Biomasse und Wasserkraft als Bandtechnologien aufnehmen
   (`hydro_band`, `biomass_band` sind im Dispatch bereits vorgesehen und werden nur nie
   belegt) und die Netzkosten für das Referenzjahr auf den heutigen Bestand beziehen statt auf
   den Ausbaupfad bis 2045.
3. In beiden Fällen im Text ausdrücklich sagen, dass die Zahl **kein** Strompreis und keine
   Netzentgeltrechnung ist.

---

# MITTEL

## M1 · Netzkosten skalieren linear mit dem fEE-Anteil — der stärkste unbelegte Ergebnistreiber

**Fundstelle:** `model.py → mix_system`, `cost["netz"] = invest_bn · CRF(wacc, 40) · fee_share / ref_share`;
sichtbar in Akt 4 und Akt 5, White Paper Kap. 5.

**Ist.** Die IMK-Netzinvestition von 651 Mrd. € (Annuität 37,9 Mrd. €/a) wird proportional zum
Energieanteil von PV und Wind verteilt. Ergebnis je Preset: Kostenminimum 7,5 €/MWh,
80 % EE + Gas 36,7, 80 % EE + H₂ 36,9, 100 % EE 66,0.

**Beanstandung.** Das Kernkraft-Szenario trägt damit **19 %** der deutschen Netzinvestition,
obwohl es 102,7 GW Kernkraft, 90 GW fEE und 53,9 GW Gas anschließen und 950 TWh verteilen muss.
Der IMK-Betrag ist überwiegend verteilnetzseitig (323 von 651 Mrd. €) und wird ganz wesentlich
von der Elektrifizierung der Nachfrage getrieben — Wärmepumpen, Ladeinfrastruktur, Netzanschlüsse
für Industrieprozesse —, nicht von der Erzeugungsstruktur. Ein rein fEE-proportionaler Ansatz
ist als Vereinfachung nachvollziehbar (die Studie macht es genauso, und das steht auch
korrekt in der Modellnotiz), aber er ist eben *kein neutraler* Modellbaustein: verteilt man die
Annuität gleichmäßig auf die gelieferte Arbeit, steigt das Kostenminimum auf 188,2 €/MWh und
100 % EE fällt auf 245,0 €/MWh — eine Verschiebung von über 30 €/MWh in beide Richtungen.
Damit ist der Netzansatz der stärkste einzelne Ergebnistreiber nach dem CAPEX und zugleich der
schwächst belegte (`reference_fee_share` trägt im Datensatz den Status
„MODELLANNAHME (nicht quellenbelegt)").

**Korrekturvorschlag.** Netzkosten in einen last-/elektrifizierungsgetriebenen Sockel und einen
fEE-getriebenen Anteil aufteilen (die NEP-Maßnahmenzuordnung erlaubt eine grobe Trennung
Übertragung/Verteilung) und die Aufteilung als Sensitivität mit mindestens drei Varianten
führen — proportional zu fEE, proportional zur Arbeit, hälftig. In der Story genügt ein Satz
im Beipackzettel plus die Zahl in der Datentabelle.

## M2 · Die LSCOE-Definition verspricht mehr, als sie enthält

**Fundstelle:** Glossar `#gl-lscoe` („Die Kosten des *gesamten* Systems je gelieferter
Megawattstunde … der einzige faire Vergleichsmaßstab"); White Paper Kap. 5 („alle Kosten des
Systems, geteilt durch die tatsächlich gedeckte Last").

**Ist/Beanstandung.** Nicht enthalten sind: das Bestandsnetz und dessen Betrieb, Redispatch und
Regelleistung, Verteilnetz-O&M, Wasserkraft und Biomasse, Import/Export, Lastmanagement,
Messwesen, Konzessionsabgaben, Steuern und Umlagen. Enthalten ist ausschließlich die Annuität
*zusätzlicher* Netzinvestitionen ohne Betriebskosten. Ein Leser, der 141–271 €/MWh sieht, wird
das mit seinem Arbeitspreis vergleichen — die Story lädt mit dem Wort „gesamt" dazu geradezu ein.
Zudem ist „der einzige faire Vergleichsmaßstab" eine Überdehnung: In der Fachliteratur ist
System-LCOE ein Maß, das nur unter fixierter Systemgrenze und fixierter Zuverlässigkeits- und
Emissionsrestriktion interpretierbar ist (Joskow 2011; Ueckerdt et al. 2013; Hirth/Ueckerdt/
Edenhofer 2015).

**Korrekturvorschlag.** Glossareintrag umformulieren zu „Zusatzkosten des Erzeugungs-, Speicher-
und Netzausbausystems je gelieferter Megawattstunde" und eine kurze Ausschlussliste anfügen.
Den Satz „der einzige faire Vergleichsmaßstab" ersetzen durch die Bedingung, unter der er gilt.

## M3 · Kein Optimierungsschritt — verglichen werden gesetzte Auslegungen, nicht Technologien

**Fundstelle:** `monte_carlo.build_presets` (Batterie 40/60 GW, Elektrolyse 100/160 GW,
H₂-Speicher 300/120 TWh, feste 20-GW-Gaskappe in zwei Presets); White Paper Kap. 5.

**Ist/Beanstandung.** Kein Szenario liegt in seinem eigenen Kostenoptimum. Die Speicher- und
Backup-Auslegung ist gesetzt, und sie dominiert das Ergebnis (im 80-%-H₂-Pfad machen
Elektrolyse + H₂-Speicher + H₂-Turbine 83,7 von 197,2 €/MWh aus, also 42 %). Ein Vergleich
willkürlich gesetzter Auslegungen misst die Setzung, nicht die Technologie. In der
Systemkostenliteratur wird deshalb jedes Szenario als kostenminimaler Ausbau unter
Nebenbedingungen gerechnet.

**Korrekturvorschlag.** Eine vollständige Kapazitätsexpansion ist für dieses Format zu viel;
angemessen wäre (a) diese Grenze im Limitationskapitel *explizit* zu benennen — sie fehlt dort
derzeit — und (b) eine einfache eindimensionale Auslegungs-Sensitivität zu zeigen (z. B.
Batterie ±50 %, Elektrolyse ±50 %), damit der Leser den Hebel sieht.

## M4 · Der 80-%-H₂-Pfad ist physisch nicht darstellbar und wird zugleich subventioniert

**Fundstelle:** Akt 4 (Preset `ee80_h2`), White Paper Kap. 5/6.

**Ist.** Der benötigte Saisonspeicherhub beträgt **172,7 TWh_H₂**; das im eigenen Datensatz
dokumentierte deutsche Kavernen-Umwidmungspotenzial liegt bei **30 TWh_H₂**
(`h2_storage.de_repurposing_potential_twh`) — Faktor 5,8. Der Speicher startet zu 100 % gefüllt
(`h2_initial_fill_share = 1.0`); 171,6 TWh_H₂, deren Erzeugung rund 260 TWh Strom erfordert
hätte, sind im Ergebnis unbezahlt. Zusätzlich bleiben 2,29 TWh Last ungedeckt, Spitze 37,0 GW.
Das Modell gibt zu all dem korrekte Warnungen aus — in der Story steht keine davon.

**Beanstandung.** Ein Szenario, das die eigene Ressourcengrenze um Faktor 5,8 überschreitet,
Gratis-Energie bezieht und dennoch die Last nicht deckt, kann nicht mit einem Punktwert in einem
Kostenvergleich stehen. Dass es dabei zu *teuer* erscheint, macht die Sache nicht besser — die
Fehler zeigen in unterschiedliche Richtungen und heben sich nicht nachvollziehbar auf.

**Korrekturvorschlag.** H₂-Speichergröße auf das belegte Potenzial deckeln, den Anfangsfüllstand
entweder auf 0 setzen (und die Einspeicherperiode aus einem Volljahresprofil holen) oder die
Erzeugungskosten der Anfangsfüllung explizit ansetzen. Bis dahin die Zahl in Akt 4 mit einem
sichtbaren Vorbehalt versehen, nicht nur mit dem Halbjahres-Marker.

## M5 · Ungedeckte Last bleibt kostenlos — der Nenner belohnt Versorgungslücken

**Fundstelle:** `model.py → mix_system`, `lscoe = total / served_twh_a`.

**Ist/Beanstandung.** Die Systemkosten werden durch die **gedeckte** Last geteilt. Ein Szenario,
das Last abwirft, senkt damit rechnerisch seine spezifischen Kosten. Im 80-%-H₂-Pfad sind das
0,48 % der Last (2,29 TWh, Spitze 37 GW), im 100-%-Pfad 0,14 %. Das ist ein Vorzeichenfehler in
der Anreizrichtung des Modells und zugleich eine Adäquanz-Frage, die in der Story gar nicht
auftaucht. Ironischerweise weist die Story ausgerechnet dem 30-Jahres-Plan (Akt 5 / Schritt 3)
denselben Fehler nach — „die Gesamtkosten werden durch den Bedarf geteilt, obwohl der
Anlagenpark nur X erzeugt" — und begeht in der Gegenrichtung eine verwandte Unsauberkeit im
eigenen Modell.

**Korrekturvorschlag.** Einen Value of Lost Load ansetzen (z. B. 3 000–15 000 €/MWh, Spanne als
Sensitivität) oder Adäquanz erzwingen und die dafür nötige Zusatzkapazität bepreisen. Mindestens:
ungedeckte Arbeit und Spitze je Szenario in der Datentabelle ausweisen.

## M6 · Der Monte Carlo variiert nur die Kostenseite — Akt 4 verspricht mehr

**Fundstelle:** Akt 4 Titel („Die ehrliche Antwort ist eine Bandbreite") und Schritt 2 („Jeder
unsichere Parameter … insgesamt 23 Größen"); Prolog („wie groß die Unsicherheit wirklich ist");
`monte_carlo.meta.assumptions[0]`.

**Ist/Beanstandung.** Der Dispatch wird je Preset **einmal** mit Mittelwerten gerechnet und
eingefroren; die 1 000 Ziehungen wirken ausschließlich auf die Kostenseite. Damit liegen die
dominanten Unsicherheiten außerhalb der Bänder: Wetterjahr, Lastniveau und Lastform,
Speicher- und Backup-Auslegung, Abregelung, Gaspreis, CO₂-Preis, Netzvolumen, Lebensdauern,
Wirkungsgrade. Die Volllaststunden-Ziehung ist sogar in sich inkonsistent: Sie verändert die
abgeleitete Kapazität und deren Kosten, aber nicht die Erzeugungsmenge, die dieselbe Anlage im
eingefrorenen Dispatch liefert. Das steht korrekt in der Metadatei — es steht nicht in Akt 4.
Ein Leser, der die Bänder als Gesamtunsicherheit liest, wird systematisch in Sicherheit gewiegt.

**Korrekturvorschlag.** Akt-4-Titel und -Text auf „Bandbreite der Kostenparameter" verengen; die
eingefrorene Dispatch-Annahme und die Inkonsistenz der VLh-Ziehung in Schritt 2 nennen (ein
Halbsatz genügt); im Limitationskapitel eine eigene Karte dafür anlegen.

## M7 · Dreiecksverteilung mit harten Grenzen ist für rechtsschiefe Kostenrisiken die falsche Familie

**Fundstelle:** `monte_carlo.triangular`, Glossar `#gl-mc`.

**Ist/Beanstandung.** Zwei Punkte. (a) Die Dreiecksverteilung setzt die Wahrscheinlichkeit
oberhalb von `max` exakt auf null. Für Kernkraft-CAPEX bedeutet das: 17 500 €/kW ist
ausgeschlossen und wird zugleich im eigenen Datensatz als „für ein deutsches Erstprojekt eher
Erwartungs- als Extremwert" bezeichnet — ein Widerspruch. Kostenüberschreitungen bei
Großprojekten sind empirisch stark rechtsschief mit fetten Rändern; Lognormal oder
Log-t sind die etablierte Wahl (das ist gerade der Kern der zitierten Flyvbjerg-Empirie).
(b) Der Modus wird auf `mid` gelegt. In den Dossiers ist `mid` aber überwiegend ein Median oder
ein Mittelwert aus Literaturangaben, kein Modus — bei schiefen Verteilungen sind das
verschiedene Dinge.

**Korrekturvorschlag.** Verteilungsfamilie je Parametertyp begründen und mindestens eine
Sensitivität mit lognormalen CAPEX-Verteilungen rechnen; im Glossar `#gl-mc` den Unterschied
Modus/Median beim Dreieck nennen (didaktisch wertvoll und passt zum Anspruch der Story).

## M8 · Grubler 2010 wird ohne die Gegenliteratur zitiert — anders als bei Lovering

**Fundstelle:** Akt 3 / Schritt 3 („Grubler misst … real Faktor 3,5 … *negative learning by
doing*"), Beipackzettel „Der einzige globale Datensatz ist umstritten".

**Ist/Beanstandung.** Für Lovering et al. 2016 liefert die Story vorbildlich die Repliken von
Gilbert et al. und Koomey et al. Für Grubler 2010 fehlt die entsprechende Gegenposition
vollständig. Zu Grublers Befund existiert eine substanzielle Replik-Literatur — insbesondere
die Nachrechnung des französischen Programms durch Escobar Rangel und Lévêque, die mit anderer
Kostenabgrenzung und Behandlung der Skalensprünge (900 → 1 300 MW) sowie der
Sicherheitsnachrüstungen zu einer deutlich moderateren Eskalation kommt und den Begriff
„negatives Lernen" ausdrücklich in Frage stellt. *(Bibliographische Angabe bitte am Original
verifizieren — der Gutachterin liegt sie hier nicht vor.)* Da Akt 3 ausdrücklich mit dem Motto
„Beides gehört erzählt — sonst wird daraus ein einseitiges Narrativ" arbeitet, ist die
Auslassung an dieser Stelle besonders auffällig. Hinzu kommt: Grublers Werte sind
Overnight-Kosten in FF1998 — die Story stellt sie im selben Diagramm neben Hinkley Point C in
laufenden Preisen. Der Beipackzettel erklärt das, das Diagramm zeigt es trotzdem gemeinsam.

**Korrekturvorschlag.** Eine Gegenpositions-Kachel `cp_grubler_both_ways` analog zu den
bestehenden acht ergänzen und im Akt-3-Beipackzettel zwei Sätze zur Replik-Literatur aufnehmen.

## M9 · Zentrale Fachliteratur fehlt — sowohl methodisch als auch für die deutsche Einordnung

**Fundstelle:** Quellenverzeichnis (44 Einträge), Akt 1, Akt 4.

**Ist/Beanstandung.** Zwei Lücken.

*Methodisch:* Die gesamte Dramaturgie von Akt 1 ist der Übergang von LCOE zu Systemkosten.
Genau das ist der Gegenstand einer etablierten Literatur — Joskow (2011) zur Unvergleichbarkeit
von LCOE bei intermittierender Erzeugung, Ueckerdt et al. (2013) „System LCOE: Why energy system
costs matter", Hirth/Ueckerdt/Edenhofer (2015) „Integration costs revisited". Keine davon ist
zitiert. Der Beitrag entwickelt eine Kennzahl neu, für die es einen benannten Standard gibt, und
verschenkt damit sowohl Autorität als auch die Möglichkeit, seine eigene Systemgrenze gegen die
Konvention abzugrenzen.

*Empirisch/deutsch:* Es fehlt jede externe Vergleichslinie für die eigenen Ergebnisse. Die
BMWK-Langfristszenarien (LFS3/T45) und der Ariadne-Szenarienreport tauchen in
`research/ist_zustand_de.md` ausschließlich für Bedarfspfade auf, nicht als Kostenreferenz;
Agora, dena und EWI fehlen ganz. Ein Leser hat damit keine Möglichkeit einzuordnen, ob
141–271 €/MWh plausibel sind. Für die Dunkelflauten- und Speicherdimensionierung fehlt zudem
die Mehrjahres-Literatur (z. B. Ruhnau & Qvist zur Speicherauslegung über mehrere Jahrzehnte
Wetterdaten), die genau die Limitation adressiert, die die Story selbst als größte benennt.

**Korrekturvorschlag.** Die drei methodischen Referenzen in Akt 1 / Glossar `#gl-lscoe`
aufnehmen; mindestens eine deutsche Referenzstudie als Vergleichslinie in das Akt-4-Diagramm
legen (analog zu den Fraunhofer-ISE-/Lazard-Bändern im LCOE-Rechner des White Papers); die
Mehrjahres-Literatur in der Limitationskarte „Ein einziges Wetterjahr" nennen.

## M10 · Ein halbes Jahr Wetter trägt die Speicheraussagen nicht — die Konsequenz wird nicht gezogen

**Fundstelle:** Limitationskarten „Ein halbes Jahr Wetter" / „Ein einziges Wetterjahr";
`profiles_2024.json` (4 416 von 8 784 h, Jul–Dez 2024; Offshore, Wasser, Biomasse fehlen ganz).

**Ist/Beanstandung.** Die Limitation ist offen und korrekt benannt — das ist gut. Die Konsequenz
ist es nicht. Für einen Saisonspeicher ist gerade das *fehlende* Halbjahr der entscheidende
Zeitraum: die Einspeicherphase liegt im Frühjahr/Sommer. Der Umgang damit ist ein Kunstgriff
(`h2_initial_fill_share = 1.0`), der die Lücke nicht schließt, sondern in eine Gratis-Annahme
verwandelt (siehe M4). Auch die Behauptung, das winterlastige Halbjahr überschätze den
Backup-Bedarf, ist nur für die Kurzfrist richtig; für den Saisonspeicher gilt das Gegenteil.
Solange nur ein Halbjahr vorliegt, sind H₂- und Speichermengen und alle daraus abgeleiteten
€/MWh-Werte nicht belastbar.

**Korrekturvorschlag.** Die Halbjahres-Limitation von der Speicher-Limitation trennen und für
die H₂-lastigen Szenarien explizit sagen, dass ihre Kostenwerte bis zum Volljahresprofil nicht
als Vergleichszahl taugen. Der Backlog-Punkt „Volljahres-Stundendaten 2024" ist damit nicht ein
Nice-to-have, sondern Voraussetzung für Akt 4 in seiner jetzigen Form.

## M11 · Akt 2 / Schritt 4 verletzt die eigene Abgrenzungsregel

**Fundstelle:** Akt 2 / Schritt 4 („Er liegt *unter jedem einzelnen* westlichen Erstprojekt der
letzten zwanzig Jahre"); Datensatz `nuclear_history_timeseries.points[7]` mit `scope: "unklar"`.

**Ist/Beanstandung.** Der Studienwert 6 000 €/kW wird gegen den Cluster „westliches Erstprojekt"
(13 500–17 264 €/kW, `scope: total_project` bzw. „total_project, laufende Preise") gestellt.
Der eigene Datensatz führt den Studienwert aber ausdrücklich mit `scope: "unklar"`. Der
unmittelbar folgende Beipackzettel erklärt dann drei Absätze lang, warum genau solche Vergleiche
unzulässig sind. Das ist innerhalb einer Bildschirmlänge ein Selbstwiderspruch — und es ist die
schärfste rhetorische Zuspitzung des ganzen Akts („nimmt implizit an, dass Deutschland beim
ersten Anlauf besser baut als Frankreich, die USA und Großbritannien").

**Korrekturvorschlag.** Entweder den Scope der Studienannahme klären und benennen, oder den
Vergleich auf gleiche Abgrenzung umstellen (6 000 gegen die Overnight-Werte: EPR2 OCC
7 265–7 583, US-Kohorte overnight). Der Befund bleibt dann bestehen, aber er ist dann sauber.
Die faire Lesart in Schritt 4 („liegt nur knapp unter dem, was EDF selbst ansetzt") ist bereits
genau die richtige — sie sollte nicht durch eine methodisch schwächere Zuspitzung überschrieben
werden.

## M12 · Kernkraft läuft als starres Band — und das Szenario impliziert ~103 GW Neubau

**Fundstelle:** `model.py → dispatch` (`availability = FLH/8760`, konstantes Band);
Akt 4 (Preset `kostenminimum`); Akt 5 / Schritt 4 (Skalenargument).

**Ist/Beanstandung.** Kernkraft speist als konstantes Band ein, kann nicht lastfolgen, hat keine
Mindestlast, keine Rampenrestriktion, keine Revisionsplanung und keinen Ausfall. Im
Kostenminimum-Szenario führt das zu 6,8 % Abregelung. Das ist als Vereinfachung vertretbar und
tendenziell konservativ gegenüber der Kernkraft — es sollte aber benannt werden, weil die
Parameternotiz im eigenen Datensatz ausdrücklich sagt: „In einem System mit hohem PV-/Windanteil
muss Kernkraft lastfolgen."

Gravierender: Das Preset impliziert **102,7 GW** installierte Kernkraftleistung — rund 60 Blöcke
der EPR2-Klasse, in einem Land mit gesetzlichem Neubauverbot und abgewickelter
Genehmigungsbehörde, bis 2045. Akt 5 argumentiert völlig zu Recht mit Vorlaufzeiten von 18–25
Jahren und mit Skalen („zwei Reaktoren sind ein Rundungsfehler"). Dieselbe Prüfung fehlt für
das eigene Akt-4-Szenario, das die Story ohne jeden Vorbehalt als Kostenkandidaten führt.
Ein Fachkollege wird das als Doppelmaßstab lesen.

**Korrekturvorschlag.** Die implizierte Kernkraftkapazität in Akt 4 / Datentabelle ausweisen
und in einem Satz einordnen (Bezug: Deutschlands historischer Höchstwert lag bei rund 22 GW).
Die Band-Vereinfachung in der Limitationsliste ergänzen.

---

# KLEIN

## S1 · Zwei verschiedene „eigene" Kernkraft-LCOE bei 5 % WACC

**Fundstelle:** Epilog („derselbe Reaktor, 12 000 €/kW, 7 500 Volllaststunden, 60 Jahre … bei
3 Prozent 105,8, bei 10 Prozent 208,5"); `shared.wacc_sensitivity.worked_example` gegen
`nuclear.lcoe_recomputed_eur_mwh`.

**Ist/Beanstandung.** Das Epilog-Beispiel rechnet mit Opex 240 €/kW/a. Der eigene Parametersatz
führt 130/165/200 €/kW/a und `kosten_kernkraft.md` empfiehlt ausdrücklich 130–200. Damit stehen
zwei eigene Werte für dieselbe Konfiguration nebeneinander: 122,5 €/MWh (`lcoe_recomputed`,
Opex 165) und 132,5 €/MWh (`worked_example`, Opex 240). Der Wert 240 liegt außerhalb der eigenen
dokumentierten Spanne.

**Korrekturvorschlag.** `worked_example` auf Opex 165 umstellen und die Epilog-Zahlen neu
erzeugen; die betroffenen Werte (105,8 / 208,5 / „fast auf das Doppelte") ziehen automatisch nach.

## S2 · Die Hero-Grafik zeichnet genau die Trendlinie, die der Text verbietet

**Fundstelle:** `buildHero()` in `strommix-story.html`; Beipackzettel Akt 3.

**Ist/Beanstandung.** Der Hero animiert über 6 Sekunden eine durchgezogene Kurve durch alle 15
historischen Kostenpunkte, sortiert nach Mittenjahr — quer über Overnight-, EPC-,
Gesamtprojekt- und „laufende Preise"-Punkte. Drei Bildschirme später steht: „Deshalb zeigen wir
oben Bandbreiten und keine Trendlinie … Wer aus diesen Daten eine glatte Lernkurve zeichnet —
in die eine oder die andere Richtung —, überinterpretiert sie." Dass die Grafik `aria-hidden`
und dekorativ ist, ändert nichts daran, dass sie das erste visuelle Argument des Beitrags ist.

**Korrekturvorschlag.** Punktwolke ohne Verbindungslinie animieren.

## S3 · Erzählzahlen stehen weiterhin hart im HTML

**Fundstelle:** Akt 3 / Schritt 2 („2,8-mal", „2,2-mal"), Akt 3 / Schritt 3 („Faktor 3,5"),
Akt 5 / Schritt 4 („3,2 Gigawatt auf über 600 Gigawatt").

**Ist/Beanstandung.** Der Footer behauptet: „Alle Zahlen dieser Seite stammen aus
`strommix/data/story_data.json`". Für die genannten Werte stimmt das nicht. Der Vorreview hat
das als M8 bereits erfasst und als „teilweise behoben" markiert; die Aussage im Footer ist
seitdem unverändert und damit unzutreffend.

**Korrekturvorschlag.** Entweder die Werte in `story_data.json` überführen oder den Footer-Satz
auf „alle Kennzahlen" präzisieren.

## S4 · Emissionsfaktor Gas: Lebenszyklus-Wert für eine ETS-Bepreisung

**Fundstelle:** `model_params.json → gas_ccgt.emission_factor_t_mwh = 0,403` („PROXY:
UNECE-Lebenszyklus-Untergrenze").

**Ist/Beanstandung.** Für die Bepreisung im ETS ist der direkte Verbrennungs-Emissionsfaktor
maßgeblich; bei η = 0,58–0,60 liegt er bei rund 0,33–0,37 t CO₂/MWh_el. Vorketten-Emissionen
(Methanschlupf) sind nicht ETS-pflichtig. Der Modellwert überschätzt die CO₂-Kosten des
Gas-Pfads also um etwa 10–20 % — eine Verzerrung, die für einmal *gegen* den Gas-Pfad wirkt,
aber trotzdem falsch zugeordnet ist.

**Korrekturvorschlag.** Zwei Felder führen: `emission_factor_combustion_t_mwh` für die
Bepreisung und `emission_factor_lifecycle_t_mwh` für die Klimabilanz-Aussagen in K4.

## S5 · Konfidenzstufen sind zwischen Story und White Paper unterschiedlich definiert

**Fundstelle:** Story, Quellenanhang („B — einfach belegt, plausibel, nicht gegengeprüft";
„C — kursiert, Primärquelle nicht prüfbar") gegen White Paper Kap. 3 („B — einzelner Treffer,
institutionelle Quelle"; „C — Branchen-/Marktquelle oder Modellannahme mit schwacher
Belegbasis").

**Korrekturvorschlag.** Eine Definition, an einer Stelle gepflegt, in beide Dokumente aus
`story_data.meta.confidence_scale` gerendert.

## S6 · Dubletten im Quellenverzeichnis

**Fundstelle:** `story_data.sources`: `ges-studie-2026` / `ges-study`; `irena-2024` /
`irena-rpgc-2024`; `lazard-2026` / `lazard-lcoe-19`.

**Ist/Beanstandung.** Drei Publikationen erscheinen doppelt unter verschiedenen IDs. Die im Hero
prominent ausgewiesene Quellenzahl ist dadurch um drei zu hoch. Bei einem Beitrag, dessen
Kernversprechen Quellenstrenge ist, fällt das auf.

**Korrekturvorschlag.** IDs zusammenführen, `build_story_data.py` um einen Dublettencheck
(Titel + Publisher + Datum) ergänzen.

## S7 · Offshore-Ersatzprofil: Richtung der Verzerrung nicht benannt

**Fundstelle:** Limitationskarte „Offshore nutzt ein Onshore-Profil".

**Ist/Beanstandung.** Die Limitation ist genannt, die Wirkungsrichtung nicht. Offshore hat
höhere und im Winter deutlich stetigere Volllaststunden; die Onshore-Form unterzeichnet gerade
die winterliche Grundlastqualität, die für Backup- und Speicherbedarf entscheidend ist. Die
EE-lastigen Szenarien erscheinen dadurch tendenziell teurer als sie wären.

**Korrekturvorschlag.** Einen Satz zur Richtung ergänzen — die Story tut das bei anderen
Limitationen (Halbjahr, Import) vorbildlich.

## S8 · Wind-Neuanlagen-Volllaststunden ohne Konfidenzstufe

**Fundstelle:** `shared.lcoe_benchmarks.wind_onshore.sensitivity_flh` (2 400 h,
„Neuanlagen-Mittel"), verwendet in Akt 2 / Schritt 2.

**Ist/Beanstandung.** Der Wert trägt keine Konfidenzstufe und keine Quelle, ist aber der
entscheidende Hebel des gesamten Wind-Arguments (LCOE 93,0 → 65,9 €/MWh). In einem Beitrag,
der ausdrücklich jede Zahl mit Herkunft und Konfidenzstufe versieht, ist das eine sichtbare
Ausnahme — ausgerechnet bei einem Ergebnistreiber.

**Korrekturvorschlag.** Quelle (WindGuard 2025, BNetzA-Referenzertragsmodell) und Konfidenzstufe
nachtragen; wenn die Zahl eine Setzung ist, als M kennzeichnen.

---

# Was ich für die Lehre ausdrücklich lobe

Ich schreibe das nicht als Höflichkeitsfloskel. Mehrere Elemente dieses Beitrags sind besser als
das, was ich in Lehrbüchern finde, und ich würde sie übernehmen.

1. **Akt 1 als LCOE-Didaktik.** Die Zerlegung in vier Schritte — Investition je kW → Verrentung
   über die Annuität → Division durch die Volllaststunden → Erweiterung zum System — ist die
   klarste Darstellung der Stromgestehungskosten, die ich kenne. Dass die achtfache
   „Arbeitszeit" der Kernkraft gegenüber PV als der eigentliche Hebel herausgearbeitet wird,
   ist genau der Punkt, an dem Studierende sonst hängenbleiben. Akt 1 ist unverändert
   vorlesungstauglich.

2. **Der Beipackzettel OCC / EPC / FOAK / Gesamtprojekt.** Die Unterscheidung der
   Kostenabgrenzungen ist die häufigste Fehlerquelle in der ganzen Debatte — auch unter
   Fachleuten, auch in begutachteten Papieren. Sie hier so knapp, so richtig und so gut
   motiviert zu finden, ist selten. Die Doppelnennung von Hinkley Point C in laufenden und in
   realen Preisen von 2015 ist mustergültig, ebenso die ausdrückliche Zurückweisung des
   „Mittelwerts über fünf Projekte" mit ökonomischer Begründung.

3. **WACC als politische, nicht technische Größe.** Das Rechenbeispiel „derselbe Reaktor bei
   3 % und bei 10 %" und die Unterscheidung zwischen dem Faktor auf den *Kapitalkostenanteil*
   (2,78) und dem Effekt auf die *fertigen Stromkosten* (knappe Verdopplung) sind exakt die
   Verwechslung, die in Zeitungsartikeln jede Woche passiert. Der Glossareintrag `#gl-wacc`
   benennt sie sogar explizit als häufigsten Fehler. Das gehört in jede Einführungsvorlesung.

4. **Der Pflicht-Disclaimer zu Lovering et al.** Einen Datensatz zu benutzen und im selben Atemzug
   die Repliken von Gilbert und Koomey zu zeigen, statt sie wegzulassen — das ist
   wissenschaftliche Praxis, wie man sie lehren will. (Dass dieselbe Sorgfalt bei Grubler fehlt,
   steht als M8 oben; die Praxis ist trotzdem vorbildlich.)

5. **Reproduzierbarkeit als Bauprinzip.** Parameter in versionierten JSON-Dateien, jede Zahl
   mit Quelle, Datum und Zugriffsdatum, deterministischer PRNG mit dokumentiertem Seed,
   Selbsttest gegen hinterlegte Testvektoren beim Seitenaufruf, Konfidenzstufen an jeder Zahl,
   Modellkonzept nachweislich *vor* den Rechercheergebnissen festgeschrieben. Das ist über dem
   Standard vieler begutachteter Studien und ist der Grund, warum ich dieses Gutachten überhaupt
   in dieser Tiefe schreiben konnte — ich konnte alles nachrechnen. Bitte behalten Sie das bei.

6. **Die Bereitschaft, eigene Zuspitzungen zu verwerfen.** Dass der Satz „das Studienergebnis
   kehrt sich um" geprüft und ausdrücklich verworfen wurde, dass der Elektrolyseur-Vorwurf gegen
   die Studie umgedreht wird, dass die Studie für ihre Transparenz gelobt und beim Opex-Ansatz
   sogar in Schutz genommen wird — das ist intellektuelle Redlichkeit, und sie ist in diesem
   Themenfeld selten. Die acht Gegenpositions-Kästen sind ein Format, das ich gerne kopieren
   würde.

7. **Das Selbstkritik-Kapitel als eigener Akt.** Limitationen nicht in eine Fußnote zu schieben,
   sondern als eigenes gestaltetes Kapitel vor dem Epilog zu setzen, ist dramaturgisch mutig
   und wissenschaftlich richtig. Die acht Karten sind ehrlich. Sie sind nur — siehe K1, K4, M3,
   M5, M6 — noch nicht vollständig.

---

# Top-3-Must-Fix

**1 · Bauzinsen-Doppelzählung bei der Kernkraft beseitigen (K1).**
Der CAPEX-Mittelwert von 12 000 €/kW ruht auf Gesamtprojekt-Ankern inklusive Finanzierung;
das Modell schlägt darauf noch einmal 34 % Bauzinsen. Effekt auf das Kernkraft-Szenario:
+24,3 €/MWh — mehr als der gesamte behauptete Rangabstand von 15,1 €/MWh. Ohne diese Korrektur
ist Akt 4 nicht publikationsfähig, weil sein zentraler Befund ein Rechenartefakt ist.

**2 · Erdgas bepreisen und die Emissionsäquivalenz herstellen (K2 + K4).**
Der im Modell billigste Pfad verbrennt 264 TWh Gas zum Preis null und emittiert dabei rund
107 Mt CO₂ pro Jahr — in einem Beitrag, der durchgehend von „einem klimaneutralen Stromsystem"
spricht und dessen Modell keine CCS-Kette kennt. Es braucht einen belegten Gaspreis mit Spanne
im Ziehungsplan **und** entweder eine gemeinsame Emissionsobergrenze oder eine gerechnete
CCS-Variante. Mindestens müssen die Rest­emissionen je Szenario in Akt 4 sichtbar sein.

**3 · Gepaarte Ziehungen statt Überlappungsargument (K3).**
Gemeinsame Zufallszahlen über alle Presets, Auswertung der Differenzverteilung, Ausweis von
P(A < B). Die Umstellung ist im vorhandenen Code minimal. Der Satz „Überlappen sich die
Verteilungen? Wenn ja, ist die Rangfolge nicht entschieden" muss aus dem White Paper
verschwinden — er ist als methodisches Prinzip formuliert und wäre in dieser Form der
folgenschwerste Satz, den der Beitrag seinen Leserinnen und Lesern beibringt.

---

*Nachbemerkung.* Ich habe dieses Gutachten so scharf geschrieben, wie ich es für ein
eingereichtes Manuskript schreiben würde — nicht, weil der Beitrag schlecht wäre, sondern weil
er den Anspruch erhebt, andere an ihren Annahmen zu messen. Dieser Anspruch ist berechtigt und
er ist überwiegend eingelöst. Genau deshalb muss er auch für das eigene Modell gelten. Nach
Bearbeitung der drei Must-Fix-Punkte und der zwölf MITTEL-Befunde halte ich den Beitrag für
publikationsreif und für eine der besseren öffentlichen Aufbereitungen dieses Themas im
deutschsprachigen Raum.
