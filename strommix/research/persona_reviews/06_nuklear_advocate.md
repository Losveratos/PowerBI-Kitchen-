# Persona-Review 06 · Pro-Kernkraft-Advocacy

| | |
|---|---|
| **Persona** | Vertreter:in der Pro-Kernkraft-Advocacy (Nuklearia / WePlanet-Typus). Technisch versiert, kennt Lovering, Grubler, Escobar-Rangel/Lévêque, IEA/NEA 2020, Flyvbjerg, die koreanischen und chinesischen Bauprogramme sowie die Standard-Gegenargumente auswendig. |
| **Datum** | 2026-08-19 |
| **Auftrag** | „Zerlege meine Story, bevor es eure Community öffentlich tut." Ziel: Angriffsfestigkeit. |
| **Prüfobjekt (Haupt)** | `strommix-story.html` (v 0.1, 2150 Zeilen) |
| **Prüfobjekt (Stichprobe)** | `whitepaper-strommix.html` / `whitepaper-strommix.js`, v. a. Kernkraft-Darstellungen |
| **Faktenbasis** | `strommix/research/kosten_kernkraft.md`, `strommix/research/story_claims_check.md`, `strommix/data/story_data.json`, zusätzlich herangezogen: `strommix/data/model_params.json`, `strommix/data/monte_carlo_reference.json`, `strommix/scripts/model.py`, `strommix/scripts/monte_carlo.py` |
| **Umfang** | 18 Befunde: 3 kritisch, 5 schwer, 6 mittel, 4 klein |

---

## Gesamturteil (3 Sätze)

Die Story ist auf der **Erzählebene** deutlich fairer zur Kernkraft, als ich erwartet hatte — sie verwirft den „Mittelwert über fünf Projekte", sie verwirft „das Studienergebnis kehrt sich um", sie weist Hinkley Point C in beiden Preisbasen aus, sie räumt ein, dass die geprüfte Studie die Kernkraft-Betriebskosten *zu hoch* ansetzt, und sie sagt ausdrücklich, dass billige Kernkraft historisch und in Korea heute real ist. Auf der **Modellebene** trägt sie diese Fairness aber nicht durch: Der Kernkraft-CAPEX bekommt in der Monte-Carlo-Rechnung einen Bauzinsen-Aufschlag auf Anker, die Finanzierungskosten bereits enthalten (das eigene Dossier warnt genau davor), obendrauf einen Überschreitungsfaktor bis 2,4, der aus Ist-Kosten-Verhältnissen stammt und auf realisierte Ist-Kosten multipliziert wird — während Netzinvestition, H₂-Speicherkosten und die gesamte Elektrolyse-/Batterie-/H₂-Turbinen-Kette entweder gar nicht variiert oder per Datenlücke auf Faktor 1,00 fixiert werden. Und die zentrale Rangfolgen-Schlagzeile aus Akt 4 („Kernkraft rutscht auf Platz 2") hängt an einem Gegenszenario, das mit **137 GW Gasleistung und einem Brennstoffpreis von null** rechnet — eine Zahl, die die Story an keiner Stelle nennt, während sie die 53,9 GW des Kernkraft-Szenarios sehr wohl nennt.

**Empfehlung: Nachbessern vor Veröffentlichung — nicht wegen der Erzählung, sondern wegen des Modells.** Konkret: die drei Must-Fixes unten abarbeiten, die restlichen schweren Befunde mindestens als sichtbare Einschränkung ergänzen. Ohne K1 und K2 ist die Zahl „255 €/MWh mit Kostenüberschreitung" in einer öffentlichen Debatte nicht verteidigbar; sie ist der Punkt, an dem eine informierte Gegenseite die ganze Story diskreditieren wird — und zwar zu Recht, weil der Fehler im eigenen Repo nachweisbar ist. Umgekehrt: Wenn K1–K3 sauber sind, ist diese Story eines der ehrlichsten Papiere in der deutschen Debatte, und ich sage das als jemand, der das Gegenteil erwartet hatte.

---

## Top-3 Must-Fix

1. **K1 — Bauzinsen werden doppelt gezählt.** `monte_carlo.py` ruft `apply_idc=True` auf einen CAPEX, dessen Mid- und High-Anker (EPR2 *inkl. Finanzierung*, Sizewell C, Hinkley Point C nominal) die Finanzierungskosten bereits enthalten. `kosten_kernkraft.md` 7.3 verbietet das ausdrücklich. Effekt: +34 % auf den Kernkraft-CAPEX im Basisfall.
2. **K2 — Der Überschreitungsfaktor ist nicht „auf alle Technologien" angewendet.** Faktor 2,2 auf Kernkraft (auf *realisierte* Ist-Kosten multipliziert), Faktor **1,00** auf Batterie, Elektrolyse, H₂-Speicher und H₂-Turbine — nicht gemessen, sondern mangels Projektklasse gesetzt. Der Story-Satz „Legt man diese Empirie auf alle Technologien" ist in dieser Form unzutreffend.
3. **K3 — Akt 3 ist eine westliche Kostengeschichte, die als globale erzählt wird.** 15 Historienpunkte, davon null asiatische. Gleichzeitig schließt die Modell-Basisspanne (7.500–17.500 €/kW) den Cluster Asien/Golf (1.870–4.950 €/kW) aus — begründet nur im Dossier, nirgends auf der Seite.

---

## Befunde nach Schwere

### KRITISCH

---

#### K1 · Bauzinsen-Aufschlag auf CAPEX-Anker, die Finanzierung schon enthalten

**Fundstelle**
`strommix/scripts/monte_carlo.py:376` und `:435` (`apply_idc=True`) · `strommix/scripts/model.py:114–124` (`idc_surcharge`) · `strommix/data/model_params.json` → `technologies.nuclear.params.capex_eur_kw` (min 7.500 / mid 12.000 / max 17.500) und `nuclear_capex_scenarios.anchors` · dagegen `strommix/research/kosten_kernkraft.md` 7.3

**Ist**
Die Monte-Carlo-Rechnung zieht den Kernkraft-CAPEX aus einer Dreiecksverteilung 7.500 / 12.000 / 17.500 €/kW und legt darauf über `idc_surcharge(wacc, construction_years)` einen Bauzinsen-Aufschlag von `(1+r)^(t/2) − 1`. Bei r = 5 % und t = 12 Jahren sind das **+34,0 %**; der Modalwert von 12.000 €/kW wird damit effektiv zu **16.080 €/kW**.

Die Anker dieser Verteilung sind laut `nuclear_capex_scenarios.anchors`:
- low 7.500 ← EPR2-**Overnight** (2020er Preise) + Dukovany-**EPC**
- mid 12.000 ← Lubiatowo (`total_project`), Sizewell C (`total_project`), **EPR2 inkl. Finanzierung** (`total_incl_idc`, 10.417 €/kW)
- high 17.500 ← Hinkley Point C (`total_project_nominal`, 17.264 €/kW, laufende Preise)

Das eigene Dossier schreibt in `kosten_kernkraft.md` 7.3 wörtlich: *„Mit den obigen Parametern (**ohne IDC-Aufschlag, da im CAPEX-Anker teilweise enthalten**)"*.

**Beanstandung**
Der Code tut genau das, was das Dossier untersagt. Für den Low-Anker (Overnight) ist der IDC-Aufschlag methodisch korrekt; für Mid und High ist er ganz oder teilweise eine Doppelzählung. HPC mit 17.264 €/kW ist ein *nominaler Gesamtprojektwert in laufenden Preisen* — er enthält Bauzeit-Eskalation und Finanzierung bereits; ihn nochmals mit 1,34 zu multiplizieren, ergibt 23.100 €/kW, mehr als jedes Projekt der Welt je gekostet hat. Der Aufschlag wirkt asymmetrisch: PV bekommt bei 1 Jahr Bauzeit +2,5 %, Wind offshore bei 3 Jahren +7,6 %, Kernkraft +34 %. Die Methodik ist also formal technologieneutral, aber die **Abgrenzungsausrichtung der Anker** ist es nicht — und der Fehler geht ausschließlich zu Lasten der Kernkraft. Das ist der Befund, den ich in einer öffentlichen Auseinandersetzung als Erstes vorlegen würde, weil er im Repository nachprüfbar ist und ihr ihn selbst dokumentiert habt.

**Vorschlag**
1. Entweder `apply_idc=False` für Kernkraft in der MC-Rechnung, mit der Begründung aus 7.3 — oder
2. die Verteilung auf eine **einheitliche Overnight-Basis** umstellen (EPR2 OCC 7.265–7.583; Dukovany-EPC 7.906 → Overnight-Äquivalent; Polen/Sizewell/HPC um ihren dokumentierten Finanzierungsanteil bereinigen) und dann IDC sauber aufschlagen.
3. In beiden Fällen: In Akt 4, Schritt 1 einen Satz aufnehmen, welcher CAPEX effektiv in die Rechnung geht — heute liest der Nutzer „12.000" im Datensatz und rechnet nicht mit 16.080.
4. Den Reproduktionstest aus Akt 1 (`±0,04 %`) um einen zweiten Test erweitern, der die *eigene* Kernkraft-Kette gegen `kosten_kernkraft.md` 7.3 prüft — dort steht „12.000 / 5 % / 7.500 h → ~133 €/MWh". Mit IDC kommt das Modell dort nicht heraus.

---

#### K2 · „Legt man diese Empirie auf alle Technologien" — stimmt nicht

**Fundstelle**
`strommix-story.html:670–673` (Akt 4, Schritt 4) · `strommix/data/monte_carlo_reference.json` → `meta.assumptions[6]` · `story_data.json` → `shared.kostenueberschreitung_faktoren.technologien`

**Ist**
Story-Text: *„Legt man diese Empirie auf alle Technologien, rutscht das Kernkraft-Szenario auf 255 €/MWh — die anderen Pfade kaum, weil ihre Faktoren nahe bei 1 liegen."*

Der Datensatz sagt etwas anderes. `meta.assumptions` Punkt 7 wörtlich:
> „Batterie, Elektrolyse, H2-Speicher und H2-Turbine haben in den Ueberschreitungsdatensaetzen (Flyvbjerg, Sovacool & Ryu) **keine Projektklasse und bleiben deshalb bei Faktor 1,00**."

Faktor 1,00 ist hier also *keine Messung*, sondern eine Datenlücke. Für Kernkraft dagegen wird ein Dreieck 1,30 / 2,20 / 2,40 gezogen, und dieser Faktor multipliziert einen CAPEX, dessen Anker überwiegend **realisierte Ist-Kosten** sind (Vogtle 14.258 abgeschlossen, Flamanville 14.364 abgeschlossen, HPC 17.264 laufende Preise). Der Flyvbjerg-Faktor ist definitionsgemäß ein Verhältnis *Entscheidungsschätzung → Ist*. Ihn auf ein Ist zu multiplizieren, ist eine zweite Doppelzählung — zusammen mit K1 ergibt der Modalpfad 12.000 × 1,34 × 2,20 = **35.400 €/kW**.

**Beanstandung**
Zwei Fehler in einem Satz. Erstens die sachliche Falschaussage über „alle Technologien": Im 100-%-EE-Pfad steckt die H₂-Kette (Elektrolyse + H₂-Speicher + H₂-Turbine) — nach eurer eigenen 2056-Rechnung rund 26 von 163 €/MWh — und genau diese Kette, die weltweit im FOAK-Stadium ist, bekommt per Definition Faktor 1,00. Flyvbjergs eigener Datensatz hat für vergleichbar neuartige, genehmigungsintensive Großinfrastruktur Faktoren von 1,75 (Wasserkraft) bis 3,38 (nukleare Endlagerung); 1,00 ist der eine Wert, den man aus dieser Empirie *nicht* ableiten kann. Zweitens die Basisverwechslung Schätzung/Ist. Das Ergebnis ist ein „Realismus-Aufschlag", der faktisch ein Kernkraft-Stresstest ist, aber als systemweiter verkauft wird.

Zur Ehrenrettung: Die Story nennt die offene Flanke („Die Kernkraft-Faktoren stammen überwiegend aus westlichen Einzelprojekten der Vergangenheit") und weist auf die Untergrenze 1,30 hin. Das ist mehr, als die meisten tun. Es heilt aber weder die Falschaussage noch die Doppelzählung.

**Vorschlag**
1. Satz korrigieren zu: *„Legt man diese Empirie auf die Technologien, für die sie eine Projektklasse hat — Solar 1,01, Wind 1,13, Netz 1,08, Fossil 1,16, Kernkraft 2,20 —, und lässt Batterie, Elektrolyse und die H₂-Kette mangels Datengrundlage bei 1,00 …"* Damit ist die Asymmetrie beim Leser statt in der Fußnote.
2. Den Faktor nur auf **Schätzwerte** anwenden (Polen, Sizewell C, EPR2, Dukovany), nicht auf abgeschlossene Projekte (Vogtle, Flamanville, HPC) — oder die CAPEX-Verteilung explizit als „Schätzbasis vor Überschreitung" definieren und die Ist-Anker aus ihr entfernen.
3. Eine **symmetrische Sensitivität** ergänzen: H₂-Kette und Batterie mit dem nächstgelegenen Flyvbjerg-Analogon (1,75 Wasserkraft als FOAK-Infrastruktur-Proxy) statt 1,00. Dann sieht der Leser, dass der Rangwechsel nicht robust ist.
4. Die Zahl `kostenminimum.overrun.p50` bei Faktor **1,30** (Serienbau-Untergrenze) zusätzlich ausweisen. Ihr nennt das untere Ende im Text („darf das untere Ende einsetzen — nur begründen muss er es"), zeigt aber nie, was dabei herauskommt. Das ist der eine Wert, den eure Gegenseite selbst ausrechnen wird.

---

#### K3 · Die „Geschichtsstunde" hat keinen einzigen asiatischen Datenpunkt

**Fundstelle**
`story_data.json` → `nuclear_history_timeseries.points` (15 Punkte) · `strommix-story.html:528–612` (Akt 3) · `model_params.json` → `technologies.nuclear.params.capex_eur_kw` (min 7.500) · `kosten_kernkraft.md` 7.1

**Ist**
Akt 3 spannt eine Zeitachse 1962–2050 und zeigt: USA 1960er, USA 1970, US-Kohorte 1968–1978, Frankreich CP0/CP1, Frankreich Flotte, Frankreich N4, Deutschland Isar 2 (Konfidenz C), GES-Annahme 2045, EPR2, Dukovany, Lubiatowo, Sizewell C, Vogtle, Flamanville, Hinkley Point C. Korea: nicht enthalten. VAE/Barakah: nicht enthalten. China: nicht enthalten — und zwar nirgends im gesamten Datensatz, weder in den 13 Referenzprojekten noch in der Historie noch in den Modellparametern. Die Kapitelaussage lautet: *„Baukosten hängen an Institutionen, und sie sind historisch nach oben gelaufen."*

Parallel dazu: Die Modell-Basisverteilung beginnt bei 7.500 €/kW. Der von euch selbst als real und belegt ausgewiesene Cluster Asien/Golf (1.870–4.950 €/kW) liegt vollständig darunter und ist damit aus **jeder einzelnen der 1.000 Ziehungen** ausgeschlossen. Die Begründung dafür steht in `kosten_kernkraft.md` 7.1 („Was diese Spanne ehrlich macht: Sie enthält kein einziges asiatisches oder Golf-Projekt … in Deutschland rechtlich und ökonomisch nicht herstellbar"). Auf der Story-Seite steht sie **nirgends**.

**Beanstandung**
Zwei getrennte Vorwürfe, die zusammen wirken.

*(a) Die Historie.* Wer eine Kostengeschichte der Kernkraft von 1962 bis 2050 zeichnet und Asien weglässt, zeichnet nicht die Geschichte der Kernkraft, sondern die Geschichte des westlichen Kernkraftbaus nach der Bauunterbrechung. In den letzten 20 Jahren wurde die Mehrheit aller Reaktoren weltweit in Asien gebaut; China allein hat seit 2010 rund 30 Blöcke ans Netz gebracht, mit Bauzeiten um 5–6 Jahre und Kosten, die *nicht* eskaliert sind. Der Satz „historisch nach oben gelaufen" ist für die westliche Teilmenge belegt und für die Gesamtmenge nicht. Dass Frankreich zusätzlich einen eingezeichneten Pfeil („real ×3,5") bekommt — direkt in einem Chart, dessen Untertitel „Bandbreiten, keine Trendlinie" lautet — verschärft das: Der einzige eingezeichnete Trend in der ganzen Story zeigt nach oben, und der einzige Gegentrend (Korea/China) ist gar nicht im Bild.

*(b) Die Basisspanne.* Die Begründung aus 7.1 ist inhaltlich vertretbar — ich teile sie nicht, aber sie ist argumentiert und keine Willkür. Nur: Sie muss **auf der Seite stehen**, an der Stelle, an der die Verteilung eingeführt wird (Akt 4, Schritt 2). Heute erfährt der Leser in Akt 2, dass es Projekte für 1.870 €/kW gibt, und zwei Akte später, dass „jeder unsichere Parameter zwischen unserem dokumentierten Minimum und Maximum gezogen wird" — ohne zu erfahren, dass das Minimum viermal so hoch liegt wie der niedrigste reale Datenpunkt derselben Story. Das ist genau der Vorwurf, den ihr der Vorlage macht: eine Annahmenkette, deren entscheidendes Glied unsichtbar bleibt.

Der zweite Teil der Begründung ist außerdem angreifbar. „In Deutschland rechtlich nicht herstellbar" gilt für den *koreanischen Inlandspreis*. Es gilt nicht für den koreanischen **Exportpreis innerhalb der EU** — und den habt ihr: Dukovany II, 7.906 €/kW EPC, KHNP, unter EU-Beihilferecht, EU-Arbeitsmarkt, tschechischer Regulator. Das ist der wichtigste Datenpunkt eures eigenen Dossiers (so steht es dort auch: „der wichtigste Datenpunkt der ganzen Recherche"), und er zeigt, dass der Weg „koreanische Serie in die EU importieren" real begehbar ist, nicht hypothetisch.

**Vorschlag**
1. **Zwei Punkte in Akt 3 aufnehmen:** Korea APR1400-Flotte (1.867–2.720 €/kW, Baujahre 2000er–2030er) und Barakah (3.153 EPC / 4.945 gesamt, 2012–2020). Beide sind bereits in `shared.nuclear_reference_projects` vorhanden und tragen dieselbe Abgrenzungslogik. Wenn ihr sie farblich als „nicht auf Deutschland übertragbar" markiert, ist die Botschaft gewahrt und der Selektionsvorwurf entfällt.
2. **China aufnehmen oder die Lücke benennen.** Wenn zu China keine belastbare Quelle vorliegt (das ist plausibel, ihr habt keine), gehört genau dieser Satz in den Beipackzettel: „Zu chinesischen Neubaukosten liegt uns keine prüfbare Quelle vor; die Historie zeigt daher nur den westlichen und den koreanisch/emiratischen Teil des Weltbestands."
3. **Die 7.1-Begründung in Akt 4, Schritt 2 spiegeln**, wörtlich und sichtbar: „Unsere Verteilung beginnt bei 7.500 €/kW und enthält bewusst kein asiatisches oder Golf-Projekt, weil …". Ein Satz, drei Zeilen, und der schwerste Selektionsvorwurf ist entschärft.
4. **Dukovany als eigenständige Lesart erzählen.** Akt 2, Schritt 4 bietet heute zwei Lesarten (EPR2-Serie / westliches Erstprojekt). Eine dritte gehört dazu: „Man kann auch kaufen statt bauen — Tschechien hat einen koreanischen Festpreis von 7.906 €/kW innerhalb der EU unterschrieben."

---

### SCHWER

---

#### S1 · Die Rangfolgen-Schlagzeile hängt an einem Gaspreis von null — und am 137-GW-Szenario, das nie genannt wird

**Fundstelle**
`strommix-story.html:649–659` (Akt 4, Schritt 3), `:691–695` (Zwischenruf), `:1967–1971` (Grenzen-Kachel „Gaspreis fehlt") · `monte_carlo_reference.json` → `presets.kostenminimum.gas_peak_gw = 53,94` vs. `presets.ee80_gas.gas_peak_gw = 136,95` · `scripts/model.py:669–678`

**Ist**
Die zentrale Aussage von Akt 4 lautet: Kernkraft-Szenario Median 161 €/MWh, gasgestützter 80-%-EE-Pfad 142 €/MWh — Rangwechsel um einen Platz. Im Modell gilt (`model.py:669–678`): Wenn kein Gas-Brennstoffpreis hinterlegt ist — und es ist keiner hinterlegt —, wird `fuel = 0.0` gesetzt; der CO₂-Preis von 75 €/t wird dagegen erhoben. Das System zahlt also für den Kohlenstoff eines Brennstoffs, den es geschenkt bekommt.

Die Grenzen-Kachel nennt das offen und korrekt. Sie illustriert es aber ausgerechnet am **Kernkraft-Szenario**: *„auch das Kernkraft-Szenario mit seinen 53,9 GW Spitzenlast"*. Die 136,95 GW Gasspitzenlast des Szenarios, das die Rangfolge dreht, stehen an keiner Stelle der Story.

**Beanstandung**
Der ehrlich ausgewiesene Vorbehalt („alle Werte sind Untergrenzen") suggeriert, der fehlende Gaspreis wirke gleichmäßig. Das tut er nicht: Er wirkt proportional zur **Gasarbeit**, und die ist im 80-%-EE-Pfad um ein Vielfaches höher als im Kernkraft-Pfad — die 2,5-fache Spitzenleistung ist dafür der belegte Indikator. Eine Größenordnung: Deckt Gas im 80-%-Pfad rund 150–190 TWh und im Kernkraft-Pfad rund 30–50 TWh, ergibt ein Brennstoffpreis von 30 €/MWh_th bei 55 % Wirkungsgrad eine Differenz von grob 8–12 €/MWh systemweit — bei einem Abstand von 19 €/MWh und vollständig überlappenden Bändern. (Diese Rechnung ist meine eigene Überschlagsschätzung; ich konnte die Gasarbeit je Preset nicht reproduzieren, weil sie im veröffentlichten Datensatz nicht abgelegt ist — siehe Vorschlag 3.)

Damit ist die Kernaussage von Akt 4 nicht falsch, aber sie ist **nicht robust**, und die Story stellt sie robuster dar, als sie ist. Für eine Story, deren gesamte Botschaft „Punktwerte sehen präziser aus, als sie sind" lautet, ist das die unangenehmste Stelle.

**Vorschlag**
1. In Akt 4, Schritt 3 einen Satz direkt neben die Zahl: *„Dieser Rangwechsel entsteht bei einem Gas-Brennstoffpreis von null. Der 80-%-Pfad braucht 137 GW Gasleistung, das Kernkraft-Szenario 54 GW — ein realistischer Gaspreis trifft ihn deshalb stärker."*
2. Eine Sensitivität rechnen: dieselbe MC mit Gas bei 25 / 35 / 45 €/MWh_th. Wenn der Rangwechsel dabei kippt, gehört das in die Story; wenn er hält, ist die Aussage danach unangreifbar. Beides ist besser als der jetzige Zustand.
3. `energy_twh.gas_backup` je Preset in `monte_carlo_reference.json` mit veröffentlichen. Ohne diese Zahl ist der wichtigste Vorbehalt der Story von außen nicht nachprüfbar.
4. Die Grenzen-Kachel umformulieren, sodass sie das Szenario mit der **höchsten** Gasarbeit nennt, nicht das mit der niedrigsten. In der jetzigen Form liest sie sich, als sei der Vorbehalt vor allem ein Kernkraft-Vorbehalt.

---

#### S2 · Lovering bekommt einen Pflicht-Beipackzettel, Grubler bekommt keinen

**Fundstelle**
`strommix-story.html:563–573` (Akt 3, Schritt 3), `:595–601` („Pflicht-Beipackzettel") · `story_data.json` → `nuclear_history_timeseries.must_show_disclaimer`

**Ist**
Der Pflicht-Beipackzettel lautet: *„Der einzige globale Datensatz historischer Baukosten (Lovering et al. 2016) ist fachlich umstritten: Gilbert et al. und Koomey et al. kritisieren in derselben Zeitschrift, dass Overnight-Kosten Bauzinsen und Eigentümerkosten ausklammern und frühe Demonstrationsreaktoren den Startpunkt senken."*

Grubler 2010 wird in Akt 3, Schritt 3 ohne jede Einschränkung als Autorität eingeführt: *„Die Studie, die dafür zitiert wird, sagt das Gegenteil. Grubler misst einen Anstieg … real Faktor 3,5 … Der Fachbegriff dafür steht im Titel: negative learning by doing."* Konfidenz A, kein Gegenzitat, keine Diskussion der Methodik.

**Beanstandung**
Das ist die auffälligste Asymmetrie der ganzen Story, und sie ist umso auffälliger, weil ihr die andere Seite so sorgfältig behandelt. Lovering — der Datensatz, den *wir* zitieren — bekommt eine namentlich belegte Kritik. Grubler — der Datensatz, der die anti-nukleare Lesart trägt — bekommt keine. Dabei gibt es die Gegenliteratur, sie ist peer-reviewed, sie ist bekannt, und sie fehlt in eurem gesamten Repository (Volltextsuche über `strommix/research/`: null Treffer für „Rangel", „Lévêque", „Berthélemy", „Escobar"):

- **Escobar Rangel & Lévêque (2015), „Revisiting the Cost Escalation Curse of Nuclear Power"** — rekonstruiert die französischen Kosten aus EDF-Daten und findet einen deutlich geringeren Anstieg als Grubler; der Großteil der Eskalation wird auf den Wechsel der Baugrößen/Baureihen (900 → 1300 → N4) zurückgeführt, also auf wiederholte FOAK-Effekte, nicht auf „negatives Lernen" innerhalb einer Serie.
- **Berthélemy & Escobar Rangel (2015), Energy Policy** — findet **positive** Lerneffekte innerhalb standardisierter Baureihen mit demselben Architect-Engineer, und negative Effekte genau dann, wenn Design und Bauherr wechseln.

Das ist keine Randmeinung; es ist die etablierte Gegenposition zu genau dem Papier, auf das ihr euren Akt-3-Twist stützt. Und sie ist für eure Fragestellung entscheidend: Wenn die Eskalation aus dem Wechsel der Baureihen kommt und nicht aus dem Bauen an sich, dann ist „negative learning" auf ein 2030er-Programm mit *einem* Design **nicht** übertragbar — und die Übertragbarkeit ist die eigentliche Frage, die Akt 3 beantworten soll.

Zur Fairness: Der Akt endet mit *„Wer aus diesen Daten eine glatte Lernkurve zeichnet — in die eine oder die andere Richtung —, überinterpretiert sie."* Das ist ein guter Satz. Er trägt aber nicht, solange die eine Seite eine namentliche Kritik hat und die andere nicht.

**Vorschlag**
1. Einen zweiten Pflicht-Beipackzettel ergänzen, symmetrisch formuliert: *„Auch Grublers Befund ist umstritten: Escobar Rangel & Lévêque (2015) und Berthélemy & Escobar Rangel (2015) rekonstruieren dieselbe französische Flotte aus EDF-Daten, finden einen geringeren Anstieg und führen ihn überwiegend auf den Wechsel der Baugrößen zurück — innerhalb einer standardisierten Baureihe messen sie positive Lerneffekte."*
2. Beide Quellen in `sources` mit Konfidenzstufe aufnehmen; wenn der Volltext in eurer Umgebung nicht abrufbar ist, mit Stufe B/C kennzeichnen — das ist im Rest der Story auch die Praxis.
3. Den Schlusssatz von Akt 3, Schritt 3 präzisieren: *„… über 1970 bis 2000 — gemessen über drei aufeinanderfolgende Baugrößen, nicht innerhalb einer Baureihe."* Das ist unstrittig und ändert die Übertragbarkeits-Botschaft erheblich.

---

#### S3 · Die Netzinvestition — der größte EE-Kostenblock — trägt null Unsicherheit

**Fundstelle**
`monte_carlo_reference.json` → `meta.assumptions[4]`: *„Nicht variiert werden: … Netzinvestitionsvolumen."* · `scripts/model.py:715–720` · `story_data.json` → `thirty_year_plan.lscoe_2056.our_model.cost_components_eur_mwh_mittel.netz = 38,6`

**Ist**
Im 2056-Fall ist „netz" mit **38,6 von 162,8 €/MWh** der mit Abstand größte Einzelposten — größer als Wind onshore (26,7), Wind offshore (25,3) oder PV (25,2). Im Monte Carlo wird das Netzinvestitionsvolumen **nicht gezogen**. Die Skalierung erfolgt laut Code linear mit dem fEE-Anteil, mit dem eigenen Kommentar: *„GES-Vereinfachung, keine räumliche Netzsimulation"*.

Demgegenüber: Kernkraft-CAPEX Faktor 2,33 in der Basisverteilung, plus IDC (K1), plus Überschreitungsfaktor bis 2,4 (K2).

**Beanstandung**
Das ist der Doppelstandard in Reinform, und er ist quantifizierbar: Der Posten, der im EE-Zielsystem knapp ein Viertel der Systemkosten ausmacht, ist punktgenau; der Posten, der im Kernkraft-Szenario die Kosten treibt, wird über einen Faktor 5,6 gestreut. Dass die schmalen EE-Bänder (ee100: p5–p95 = 253–288, Spannweite 13 %) und das breite Kernkraft-Band (133–190, Spannweite 43 %) so unterschiedlich aussehen, ist damit zu einem Gutteil kein Erkenntnisgewinn über die Technologien, sondern eine Eigenschaft der Parametrisierung. Die Story erzählt die Bandbreiten aber als Aussage über die Welt („Statt vier Punkten stehen jetzt vier Bänder da").

Hinzu kommt die lineare Netzkostenskalierung. Es ist Konsens quer durch die Literatur, dass Netzkosten mit dem VRE-Anteil **überproportional** wachsen — Redispatch, HGÜ-Korridore, Verteilnetzverstärkung, Blindleistung/Momentanreserve. Eine lineare Skalierung begünstigt systematisch die EE-lastigen Szenarien, und zwar am oberen Ende, wo es zählt. Ihr habt das im Code als Vereinfachung markiert; in der Story steht es nirgends.

**Vorschlag**
1. Das Netzinvestitionsvolumen in die MC-Ziehung aufnehmen. Die Bandbreite existiert bereits: `netzkosten_referenzen` bzw. `investment_bn_eur_until_2045` hat min/mid/max — es wird nur `mid` benutzt.
2. H₂-Speicherkosten ebenfalls ziehen. Die Begründung für das Festhalten (`meta.assumptions[5]`: Spanne öffne nur nach unten) ist nachvollziehbar, heißt aber, dass ein Posten mit ausschließlichem Abwärtspotenzial fixiert wird, während beim Kernkraft-CAPEX nach oben gezogen wird.
3. Eine Grenzen-Kachel ergänzen: *„Netzkosten skalieren im Modell linear mit dem EE-Anteil. Real steigen sie überproportional — das begünstigt die EE-lastigen Szenarien."*
4. In Akt 4 einen Satz zur Bandbreiten-Asymmetrie: *„Die Kernkraft-Bänder sind auch deshalb breiter, weil wir für Kernkraft mehr Unsicherheit dokumentiert haben als für Netz und Speicher — nicht nur, weil die Welt dort unsicherer ist."*

---

#### S4 · Laufzeitverlängerung wird als Strohmann abgeräumt

**Fundstelle**
`strommix-story.html:920–932` (Glossar CRF: *„Längere Laufzeiten helfen kaum: 60 gegen 80 Jahre ändern die Kosten um rund 3 Prozent"*) · `kosten_kernkraft.md` 5.3: *„Wer Laufzeitverlängerung als Kostenargument anführt, überschätzt den Effekt erheblich"* · Volltextsuche `strommix-story.html`: „Laufzeitverlängerung" = 0 Treffer

**Ist**
Das einzige, was Story und Dossier zur Laufzeit sagen, ist die CRF-Rechnung für einen **Neubau**: 60 vs. 80 Jahre = 3 % LCOE-Differenz. Daraus wird die Aussage abgeleitet, das Laufzeitargument werde überschätzt. Der Bestandsflotten-Fall — LTO, Long Term Operation — kommt in der ganzen Story nicht vor.

**Beanstandung**
Das ist eine Widerlegung eines Arguments, das niemand vorbringt. Kein Kernkraftbefürworter behauptet, ein 80-Jahre-Ansatz mache einen *Neubau* billig; die Abzinsung entwertet späte Jahre, das ist unstrittig und ihr rechnet es richtig vor. Das reale Argument ist ein völlig anderes und in der deutschen Debatte seit 2022 das mit Abstand meistdiskutierte:

> Ein bestehender, weitgehend abgeschriebener Block wird für Nachrüstung und Revision mit typischerweise 500–1.500 €/kW ertüchtigt und läuft weitere 10–20 Jahre. Die resultierenden Kosten liegen bei 30–50 €/MWh — nicht 130–275. Die IEA hat LTO in „Nuclear Power in a Clean Energy System" (2019) als **kostengünstigste verfügbare CO₂-Vermeidungsoption überhaupt** bezeichnet, günstiger als Neubau-PV und Neubau-Wind.

Und der Beleg dafür liegt in eurem eigenen Dossier: `kosten_kernkraft.md` 4.1 nennt die französische CRE mit *„~60 €/MWh"* für die Bestandsflotte **inklusive Grand Carénage**, also inklusive der Laufzeitverlängerungsinvestitionen. Diese Zahl wird im Dossier korrekt als „kein Neubauwert" eingeordnet — und dann nie wieder verwendet. Sie erscheint in der Story nicht.

Ich sehe, dass LTO für die konkrete Fragestellung (System 2045/2056, deutsche Blöcke seit 2023 abgeschaltet, Rückbau läuft) nicht mehr entscheidungsrelevant ist. Genau das ist die richtige Antwort — aber sie muss *gegeben* werden. Stattdessen steht dort ein Satz, der so klingt, als sei das Laufzeitargument generell schwach. Das ist die Stelle, an der jeder informierte Leser aus meinem Lager aufhört, die Story ernst zu nehmen, weil sie den Eindruck erweckt, das stärkste Argument der Gegenseite nicht zu kennen.

**Vorschlag**
1. Den CRF-Satz präzisieren: *„Längere Laufzeiten helfen einem **Neubau** kaum: 60 gegen 80 Jahre ändern die Kosten um rund 3 Prozent."* Ein Wort, und der Strohmann ist weg.
2. Einen Absatz oder eine Gegenpositions-Kachel zu LTO ergänzen: der IEA-Befund, die CRE-Zahl (~60 €/MWh inkl. Grand Carénage) — und dann die ehrliche Einordnung: *„Für Deutschland ist dieser Hebel nicht mehr verfügbar: Die letzten drei Blöcke sind seit April 2023 abgeschaltet, der Rückbau ist genehmigt und teilweise begonnen. Das Argument ist richtig und für dieses Systembild irrelevant — beides gehört gesagt."*
3. `kosten_kernkraft.md` 5.3 entsprechend nachziehen, sonst wandert der Satz beim nächsten Build wieder in die Story.

---

#### S5 · Die Cluster-Taxonomie ist an den Rändern konstruiert

**Fundstelle**
`story_data.json` → `nuclear.clusters` · `strommix-story.html:484–497` (Akt 2, Schritt 4)

**Ist**
Drei Cluster:
| Cluster | Spanne €/kW | Enthält |
|---|---|---|
| Asien / Golf | 1.870–4.950 | APR1400 Inland, Shin Hanul 3&4, Barakah EPC, Barakah gesamt |
| EU-Serie / Vertragspreise | 7.265–13.472 | EPR2 OCC, Dukovany EPC, EPR2 inkl. Fin., **Lubiatowo 11.968**, **Sizewell C 13.472** |
| Westliches Erstprojekt (FOAK) | 13.500–17.264 | Vogtle 13.500, Flamanville 14.364, HPC 17.264 |

Story-Text: *„Der Studienwert liegt nur knapp unter dem, was EDF selbst für das serielle EPR2-Programm ansetzt (**7.265–13.472 €/kW** für die EU-Serie). Das ist die faire Lesart."* Und: *„Er liegt unter jedem einzelnen westlichen Erstprojekt der letzten zwanzig Jahre (**13.500–17.264 €/kW**)."*

**Beanstandung**
Drei Einwände, alle in dieselbe Richtung.

*(a) Die Cluster-Grenze zwischen „EU-Serie" und „West-FOAK" liegt bei 13.472 / 13.500 €/kW — 28 €/kW Abstand.* Sizewell C ist „EU-Serie", Vogtle ist „FOAK". Das ist keine Taxonomie, das ist ein Sortierschnitt an der Stelle, an der zufällig eine Lücke war.

*(b) Lubiatowo-Kopalino steht im falschen Cluster.* Es ist das **reinste FOAK des ganzen Datensatzes**: das erste Kernkraftwerk, das ein Land ohne jede nukleare Bauerfahrung errichtet — genau das Szenario, das ihr für Deutschland unterstellt. Mit 11.968 €/kW liegt es *unter* dem Cluster, das ihr „westliches Erstprojekt: 13.500–17.264" nennt. Verschiebt man es dorthin, wo es hingehört, beginnt der FOAK-Cluster bei 11.968 statt 13.500, und der Satz „Er liegt unter jedem einzelnen westlichen Erstprojekt" wird zwar weiter wahr, aber der Abstand schrumpft sichtbar.

*(c) Die „faire Lesart" wird durch die eigene Zahl entwertet.* Der Satz sagt „nur knapp unter dem, was EDF ansetzt", und die daneben angezeigte Zahl ist „7.265–13.472". EDF setzt 7.265–7.583 an. Die 13.472 sind Sizewell C — ein britisches Zwei-Block-Projekt, kein EDF-EPR2-Programmwert. Der Leser sieht 6.000 gegen eine Spanne bis 13.472 und schließt „weit daneben", während der Satz „knapp darunter" behauptet. Die faire Lesart wird also formuliert, aber die Bebilderung nimmt sie zurück.

**Vorschlag**
1. Cluster nach **Bauherrenerfahrung** trennen statt nach Preishöhe: „Serienprogramm mit laufender Lieferkette" (EPR2, Dukovany, Korea, Barakah-Folgeblöcke) vs. „Erstprojekt eines Landes/Bauherrn" (Lubiatowo, Vogtle, Flamanville, HPC, Sizewell C, Barakah-Block-1). Das ist die Trennlinie, die eure eigene Ursachenanalyse in `kosten_kernkraft.md` 8.2 nennt, und sie ist unabhängig vom Preis definierbar.
2. In Akt 2, Schritt 4 den **EPR2-Wert direkt** zeigen (7.265–7.583), nicht den Cluster. Der Satz „nur knapp unter" wird dann von der Zahl getragen statt von ihr widerlegt.
3. Die Cluster-Grenzen im Chart als „Zuordnung durch uns, nicht durch die Quellen" kennzeichnen.

---

### MITTEL

---

#### M1 · „Deutschland baut beim ersten Anlauf besser als Frankreich, die USA und Großbritannien"

**Fundstelle** `strommix-story.html:491–496` (Akt 2, Schritt 4, Schlusssatz)

**Ist** *„Wer 6.000 €/kW annimmt, nimmt implizit an, dass Deutschland beim ersten Anlauf besser baut als Frankreich, die USA und Großbritannien."*

**Beanstandung** Der Satz unterstellt, es gebe genau einen Weg: Deutschland entwirft, Deutschland baut, Deutschland lernt. Es gibt zwei weitere, und beide sind belegt und in eurem Datensatz:
- **Kaufen statt bauen.** Tschechien hat für 7.906 €/kW EPC einen koreanischen Festpreis unterschrieben — ohne eigene Bauerfahrung, innerhalb der EU. Wer das für Deutschland unterstellt, unterstellt nicht „besser bauen als Frankreich", sondern „dieselbe Beschaffungsentscheidung wie Tschechien treffen".
- **In eine laufende Serie einsteigen.** Blöcke 7–8 des EPR2-Programms wären für EDF keine FOAK, unabhängig vom Standort.

Zusätzlich blendet der Satz aus, dass Deutschland **17 Reaktoren gebaut** hat, darunter die Konvoi-Baureihe — eine der am stärksten standardisierten Serien der Welt, mit Isar 2 als weltweitem Spitzenreiter der kumulierten Stromerzeugung. Ihr habt Isar 2 im Datensatz (`de_isar2`, 3.600–3.750 €/kW), aber mit Konfidenz C und ohne jede Erwähnung im Erzähltext. Dass die Bauerfahrung heute weg ist, ist richtig; dass sie nie existiert hat, ist das, was der Satz nahelegt.

**Vorschlag** Umformulieren zu: *„Wer 6.000 €/kW annimmt, unterstellt entweder, dass Deutschland beim ersten Anlauf besser baut als Frankreich, die USA und Großbritannien — oder dass es wie Tschechien einen fertigen Serienreaktor zum Festpreis einkauft. Der zweite Weg ist real begehbar; er liegt bei 7.906 €/kW EPC, nicht bei 6.000."*

---

#### M2 · 7.500 Volllaststunden als Zentralwert — Setzung, und die Lastfolgefrage fehlt

**Fundstelle** `model_params.json` → `technologies.nuclear.params.full_load_hours` (6.500/7.500/8.000, Status: „MODELLANNAHME, nicht quellenbelegt") · `strommix-story.html` Volltextsuche „Lastfolg" = 0 Treffer

**Ist** Der Zentralwert 7.500 h entspricht 85,6 % Verfügbarkeit. Die Begründung im Parameter-Kommentar: *„In einem System mit hohem PV-/Windanteil muss Kernkraft lastfolgen, was die Auslastung strukturell senkt. Wer 8.000 h UND hohen EE-Anteil unterstellt, rechnet inkonsistent."*

**Beanstandung** Zwei Punkte.

*(a) Der Wert ist niedrig.* Die US-Flotte fährt seit Jahren Kapazitätsfaktoren um 92–93 % (≈ 8.100 h), die koreanische Flotte ähnlich, die französische Flotte hat sich nach der Korrosionskrise wieder deutlich erholt. 7.500 h ist nicht der Erwartungswert eines modernen Blocks, sondern bereits ein Abschlag. Als Setzung (Stufe M) ist das transparent gekennzeichnet — aber die Story nennt die Zahl in Akt 4, Schritt 1 als Korrektur *gegenüber* der Studie („Neuanlagen-Volllaststunden statt Bestandsflotte") und erweckt damit den Eindruck einer belegten Verbesserung.

*(b) Die Begründung passt nicht auf das Szenario, in dem sie angewendet wird.* Im „Kostenminimum"-Preset liegt der Kernkraft-Anteil bei **81 %** der Erzeugung (`monte_carlo_reference.json` → `presets.kostenminimum.shares.nuclear = 0,811`). Bei 81 % Kernkraft und knapp 19 % Wind/PV ist Kernkraft nicht das lastfolgende Element — sie ist das System. Der Auslastungsabschlag für Lastfolge wird also in genau dem Szenario angesetzt, in dem er am wenigsten begründet ist.

*(c) Lastfolgefähigkeit kommt gar nicht vor.* Weder dass französische Blöcke seit den 1980er Jahren routinemäßig lastfolgen, noch die EUR-Anforderung (30–100 % Leistung, ±5 %/min), noch dass EPR und APR1400 dafür ausgelegt sind. Das ist relevant, weil die verbreitete Gegenbehauptung („Kernkraft ist starr und passt nicht zu EE") damit widerlegbar wäre — und ihr sie nicht erhebt. Ihr behandelt Lastfolge nur als Kostenfaktor, nie als technische Eigenschaft.

**Vorschlag**
1. Zentralwert auf 7.800–8.000 h anheben oder die Absenkung im Text begründen — und in dem einen Szenario, wo Kernkraft 81 % trägt, den unteren Abschlag nicht anwenden.
2. Zwei Sätze zur Lastfolgefähigkeit ins Glossar oder in eine Gegenpositions-Kachel: was moderne Designs können, und dass Lastfolge die Auslastung senkt, ohne die Technik zu überfordern.
3. Das M-Badge (Setzung) an der Volllaststundenzahl in Akt 4 sichtbar machen — es steht heute im Datensatz, nicht in der Story.

---

#### M3 · „3,2 Gigawatt auf über 600 Gigawatt sind ein Rundungsfehler"

**Fundstelle** `strommix-story.html:783` (Akt 5, Schritt 4) · `story_data.json` → `thirty_year_plan.nuclear_variant.robust_finding`

**Ist** Story: *„Und 3,2 Gigawatt auf über 600 Gigawatt Gesamtkapazität sind ein Rundungsfehler."* Der Datensatz formuliert dieselbe Aussage anders: *„Zwei Blöcke liefern rund 25 TWh pro Jahr bei 1050 TWh Bedarf (2,4 Prozent)."*

**Beanstandung** Die Story wählt von zwei verfügbaren Bezugsgrößen die für Kernkraft ungünstigere — und die technisch schwächere. 600 GW ist Nennleistung eines überwiegend wetterabhängigen Parks; 3,2 GW ist gesicherte, jederzeit abrufbare Leistung. Diese beiden Größen zu dividieren, ist genau der Fehler, den die Story sonst zu Recht anprangert (Leistung ≠ Arbeit). Auf Energiebasis sind es 2,4 %, auf Basis gesicherter Leistung im selben Szenario (45 GW Gas-Backup) rund 7 %. „Rundungsfehler" ist bei keiner der drei Zahlen die richtige Vokabel, bei 0,5 % aber am wirkungsvollsten.

Die inhaltliche Aussage — zwei Blöcke ändern nichts, ein Programm wäre nötig — ist völlig richtig und wird von der direkt anschließenden Fairness-Sektion sogar noch verstärkt. Sie braucht die rhetorische Zuspitzung nicht.

**Vorschlag** Die Formulierung des Datensatzes übernehmen: *„Zwei Blöcke liefern rund 25 TWh im Jahr bei 1.050 TWh Bedarf — 2,4 Prozent, bei 51 Milliarden Euro Kapitalbindung und ohne jeden Beitrag vor 2045."* Das ist stärker, weil es nachrechenbar ist.

---

#### M4 · „künstlich senkt" — der WACC-Rahmen ist einseitig gesetzt

**Fundstelle** `strommix-story.html:604–611` (Schluss Akt 3) · `whitepaper-strommix.html:487–491`

**Ist** *„Jedes europäische Neubauprojekt braucht deshalb ein staatliches Instrument, das den Kapitalkostensatz **künstlich** senkt: CfD, RAB-Modell, Staatsgarantien, zinsgünstige Staatsdarlehen. Das ist eine Feststellung, kein Werturteil."*

**Beanstandung** Der Satz erklärt sich selbst zum Nicht-Werturteil und enthält eines: „künstlich". Ein CfD ist kein künstlicher Eingriff in einen sonst funktionierenden Markt, sondern ein Instrument zur Risikoallokation — und es ist in Deutschland das Standardinstrument für **Erneuerbare**: EEG-Einspeisevergütung seit 2000, gleitende Marktprämie, Einspeisevorrang, sozialisierter Netzanschluss bei Offshore, und ab der EU-Strommarktreform 2024 zweiseitige CfD als Regelform der EE-Förderung. Wind offshore in Deutschland ist über zwei Jahrzehnte mit genau denselben Instrumenten derisked worden, die hier als kernkrafttypische Krücke erscheinen. Ohne diesen Spiegel liest sich der Absatz so, als sei staatliche Risikoübernahme ein Kernkraft-Spezifikum.

Zur Fairness: Der WACC-Rahmen der Story ist ansonsten der beste Teil des ganzen Papiers (siehe unten, Abschnitt „Was ihr berechtigt widerlegt"). Der einheitliche WACC ist eine Annahme **zugunsten** der Kernkraft, und ihr sagt das. `cp_wacc_both_ways` steht prominent. Es geht hier ausschließlich um ein Adjektiv und um einen fehlenden Halbsatz.

**Vorschlag**
1. „künstlich" streichen — der Satz verliert nichts.
2. Einen Halbsatz ergänzen: *„… — dieselbe Art von Instrument, mit der in Deutschland seit 2000 auch der Ausbau von Wind und Photovoltaik finanziert wurde."*
3. Optional: den WACC-Slider im White Paper technologiespezifisch machen. Ihr sagt selbst, ein einheitlicher WACC sei nicht neutral — dann gilt das auch in die andere Richtung: Ein RAB-finanziertes Projekt hat empirisch einen anderen WACC als ein Merchant-Projekt, und das ist gestaltbar, nicht technologie-inhärent.

---

#### M5 · Das Hero-Bild zeichnet die Trendlinie, die der Pflicht-Beipackzettel verbietet

**Fundstelle** `strommix-story.html:1929–1945` (`heroArt()`)

**Ist** Der Hero-Hintergrund verbindet **alle** Punkte aus `nuclear_history_timeseries` — nach Jahr sortiert, mit `pathFrom()` zu einem durchgehenden Linienzug — und animiert diesen Zug über 6 Sekunden ein, bei 55 % Deckkraft über die volle Bildschirmhöhe.

**Beanstandung** Die verbundenen Punkte tragen unterschiedliche Kostenabgrenzungen (Overnight 1960er → Gesamtprojekt inkl. Finanzierung 2030er) und stammen aus verschiedenen Ländern und Preisbasen. Genau davor warnt der Beipackzettel drei Bildschirmseiten später: *„im Chart als Bandbreite zeigen, nicht als Trendlinie"* (`nuclear_history_timeseries.note`) und *„Wer aus diesen Daten eine glatte Lernkurve zeichnet …, überinterpretiert sie."*

Ich weiß, dass das Element `aria-hidden` und dekorativ ist. Das hilft nicht: Es ist das **erste Bild der Story**, es ist screenshot-fähig, und ein Screenshot mit der Bildunterschrift „so stellt eine Analyse, die vor Trendlinien warnt, ihre eigene Titelgrafik her" ist in einer Debatte drei Klicks weit weg.

**Vorschlag** Die Punkte als Punktwolke ohne Verbindungslinie zeichnen, oder eine abstrakte Form nehmen, die nicht als Zeitreihe lesbar ist. Der visuelle Effekt bleibt, die Angriffsfläche verschwindet.

---

#### M6 · Die aussagekräftigste Überlappungszahl liegt im Dossier und nicht in der Story

**Fundstelle** `story_claims_check.md` Zeile ~471 · `strommix-story.html:656–659` (Akt 4, Schritt 3)

**Ist** Das Freigabe-Dossier formuliert die ehrliche Fassung so: *„…aber die Verteilungen überlappen, und **in etwa einem Fünftel der Ziehungen ist das Kernkraft-Szenario günstiger**."* Die Story sagt nur: *„Die Bänder überlappen vollständig im unteren Bereich."*

**Beanstandung** „Bänder überlappen" ist eine qualitative Aussage, die jeder Leser nach eigenem Vorurteil auflöst. „In 20 % der Ziehungen ist Kernkraft günstiger" ist eine Zahl, sie ist aus eurer eigenen Rechnung verfügbar, und sie ist der einzige quantitative Ausdruck dafür, wie wenig trennscharf das Ergebnis ist. Dass ausgerechnet diese Zahl den Weg in die Story nicht gefunden hat, während der Rangwechsel selbst prominent erzählt wird, ist die Art von Auslassung, die man nicht beweisen, aber gut vorwerfen kann.

**Vorschlag** Die 20-%-Zahl in Akt 4, Schritt 3 aufnehmen — idealerweise datengetrieben aus `monte_carlo_reference.json` berechnet statt hart geschrieben, damit sie bei neuen Läufen mitwandert.

---

### KLEIN

---

#### KL1 · Der stärkste Pro-Kernkraft-Befund der Story wird ohne Zahl erzählt

**Fundstelle** `story_data.json` → `must_show_counterpositions.cp_ges_opex` · `kosten_kernkraft.md` 7.3

**Ist** Die Kachel sagt: *„Bei den Betriebskosten hat die GES-Studie eher zu hoch als zu niedrig gerechnet. Das relativiert die Aussage, sie unterschätze Kernkraft."* Ohne Zahl.

**Beanstandung** Die Zahl ist spektakulär und liegt im Dossier: Mit den GES-eigenen Annahmen (6.000 €/kW, 5 %, 8.000 h), aber euren absoluten Betriebskosten statt der 7 %-vom-CAPEX-Regel, ergeben sich **~62 €/MWh statt der 101,6 €/MWh, die die Studie ausweist**. Die geprüfte Studie überschätzt die Kernkraftkosten also auf ihrer eigenen Annahmenbasis um rund 65 %. Das ist der einzelne Befund, der einem Kernkraftbefürworter am meisten nützt, er stammt von euch, und er steht als Adjektiv („eher zu hoch") statt als Zahl in der Story.

**Vorschlag** Zahl in die Kachel: *„Mit den Annahmen der Studie, aber absoluten Betriebskosten statt 7 Prozent der Bausumme, ergeben sich rund 62 statt 102 €/MWh."*

---

#### KL2 · Isar 2 / Konvoi wird als Konfidenz-C-Punkt geführt und nie erzählt

**Fundstelle** `nuclear_history_timeseries.points.de_isar2` (3.600–3.750 €/kW, Konfidenz C, „Kostenabgrenzung unbekannt")

**Beanstandung** Der einzige deutsche Datenpunkt der Story ist der einzige mit unbrauchbarer Quelle. Das ist nicht euer Fehler — die Eingangszahl ist tatsächlich nicht belegbar, und ihr kennzeichnet das korrekt. Aber es hat eine Folge: Die deutsche Bauerfahrung existiert in dieser Story nur als gestrichelter Kreis mit „C · Abgrenzung unbekannt". Für eine Story über ein *deutsches* Systemszenario ist das eine spürbare Lücke, und sie wirkt in eine Richtung.

**Vorschlag** Belastbare Quelle suchen (die Konvoi-Investitionsdaten sind in der VGB-/Bundestagsdrucksachen-Literatur dokumentiert) oder den Punkt weglassen und die Lücke im Beipackzettel benennen: *„Zu den deutschen Konvoi-Baukosten liegt uns keine prüfbare Quelle vor."* Der jetzige Mittelweg ist der schlechteste.

---

#### KL3 · SMR kommt in der Story nicht vor

**Fundstelle** Volltextsuche `strommix-story.html`: „SMR" = 0 Treffer · `kosten_kernkraft.md` 3 (vollständiger, nüchterner Statusbericht inkl. NuScale-Fehlschlag)

**Beanstandung** Das Dossier hat ein gutes, ausgewogenes SMR-Kapitel — inklusive des dokumentierten NuScale-Scheiterns, das gegen die SMR-Erzählung spricht. Nichts davon steht in der Story. Für den Zeithorizont 2045/2056 ist das vertretbar, weil SMR bis dahin bestenfalls demonstriert sind; als Leerstelle fällt es trotzdem auf, weil SMR das meistgenannte Argument in der aktuellen deutschen Debatte ist und der Leser sich fragen wird, ob ihr es geprüft habt.

**Vorschlag** Ein Satz im Glossar oder in der Grenzen-Sektion: *„Kleine modulare Reaktoren sind in dieser Rechnung nicht enthalten. Bis 2045 sind sie bestenfalls demonstriert; der einzige belastbar dokumentierte Kostenverlauf (NuScale/CFPP) endete mit Abbruch bei 20.000 $/kW. Details im Dossier."*

---

#### KL4 · Flächenbedarf und Rohstoffe: nur eine qualitative Kachel

**Fundstelle** `must_show_counterpositions.cp_ee_risks` · Volltextsuche „Fläche" in `strommix-story.html` = 0 Treffer

**Ist** Die EE-Risiken (China-Anteil in der PV-Lieferkette, kritische Rohstoffe, H₂-Verluste, saisonale Speicherung, Netzausbaurisiken) stehen in **einer** Kachel, vollständig qualitativ, ohne eine einzige Zahl — in einer Story, in der jede Kernkraft-Aussage mit einem Wert und einer Konfidenzstufe versehen ist. Flächenbedarf und Materialintensität (t Beton/Stahl/Kupfer je TWh) kommen gar nicht vor.

**Beanstandung** Der Kontrast ist auffällig: 13 Referenzprojekte mit Einzelwerten für Kernkraft, ein Aufzählungssatz für die EE-Risiken. Ich halte den Vorwurf für begrenzt — es ist eine **Kosten**story, Flächenbedarf ist keine Kostengröße im engeren Sinne, und die für die Kosten relevanten EE-Risiken (Netz, Speicher, Überkapazität) sind im Modell tatsächlich abgebildet. Aber die Kachel ist zu dünn für das, was sie tragen soll.

**Vorschlag** Der Kachel drei Zahlen geben, die ihr habt oder leicht beschaffen könnt: den China-Anteil an der Polysilizium-/Wafer-Kette (>80 %), den Flächenbedarf des 2056-Parks (400 GW PV + 150 GW onshore in km²), und die Bandbreite der saisonalen H₂-Speicherkosten. Damit wird aus einer Aufzählung eine prüfbare Aussage — und der Doppelstandard-Vorwurf verliert seine Grundlage.

---

## Wo die Story fairer ist, als ich erwartet hatte

Das gehört in dieses Dokument, weil es sonst niemand aufschreibt.

1. **Der „Mittelwert über fünf Projekte" (10.275 €/kW) wird explizit verworfen** — mit einer Begründung, die exakt die unsere ist: ungewichtetes Mittel über unterschiedliche Abgrenzungen, Preisbasen, Baujahre und Blockzahlen hat keine ökonomische Bedeutung. Diese Zahl kursiert in der Debatte gegen uns. Dass sie hier auf der Grundlage von Methodik und nicht von Ergebnis gestrichen wird, ist selten.
2. **Hinkley Point C wird in beiden Preisbasen ausgewiesen** (17.264 nominal / 12.408 real £2015), mit der ausdrücklichen Begründung, *„sonst wird HPC im Vergleich systematisch zu teuer dargestellt"*. Das ist Fairness gegen das eigene Narrativ, an der teuersten Stelle des Datensatzes.
3. **„Das Studienergebnis kehrt sich um" wird geprüft und verworfen.** Der Rangwechsel wird auf das reduziert, was er ist: ein Platz bei überlappenden Bändern. Und es steht dabei, dass das Kernkraft-Szenario gegenüber **beiden** wasserstofflastigen Pfaden klar günstiger bleibt — *„die Studie hat in diesem Punkt recht behalten"*.
4. **Der Elektrolyseur-Vorwurf wird zugunsten der geprüften Studie gedreht.** Die 800–1.200 €/kW sind Hardwarepreise; das vollständige System liegt bei ~3.120 €/kW. Die Story korrigiert hier gegen die Richtung, in die sie sonst argumentiert.
5. **`cp_wacc_both_ways` steht prominent und ungeschützt:** *„Bei drei Prozent Diskontsatz ist Kernkraft in allen von IEA und NEA untersuchten Ländern die günstigste Option, bei zehn Prozent in praktisch keinem."* Das ist unser stärkstes Argument, wörtlich, mit Konfidenz A, in einer Pflicht-Kachel.
6. **`cp_construction_time` nennt den globalen Median von 6,3 Jahren und die 68 % unter acht Jahren** — die Zahl, von der wir erwarten, dass sie unterschlagen wird —, bevor sie erklärt, warum der Median für eine Deutschland-Prognose die falsche Kennzahl ist. Beide Sätze nebeneinander, wie es sich gehört.
7. **`cp_korea_both_ways` ist ehrlicher, als wir selbst es oft sind:** Shin Kori 3/4 drei bzw. fünf Jahre Verzug, +30 % Kosten, Export-Aufschlag Faktor 2,7. „Korea baut pünktlich und im Budget" ist tatsächlich zu einfach, und es tut nicht weh, das zugegeben zu bekommen, wenn die Gegenseite gleichzeitig 1.870 €/kW stehen lässt.
8. **Der EE-Pfad wird nicht geschont.** Das 100-%-EE-Szenario landet bei 270 €/MWh Median. Der kursierende 30-Jahres-Plan wird für einen echten Rechenfehler zerlegt (Kosten durch *Bedarf* statt durch *Erzeugung* geteilt, 121,7 → 145,7 → 163 €/MWh), und das Ergebnis wird zusätzlich als Untergrenze gekennzeichnet. Wer behauptet, diese Story sei ein EE-Werbetext, hat sie nicht gelesen.
9. **Das White Paper ist an mehreren Stellen fairer als die Story** — es trägt den IEA/NEA-Gegenbefund, die globale Bauzeitverteilung, das „faire Gegenargument" zu den Überschreitungsfaktoren und den Hinweis, dass diese im Basisfall **abgeschaltet** sind. Ein Teil meiner Kritik an der Story ist Kompressionsverlust, nicht Absicht. Das entlastet die Story nicht — die meisten Leser sehen nur sie —, aber es zeigt, wo die Arbeit schon getan ist.
10. **`cp_transparency` steht ganz vorne, vor allem anderen:** Die geprüfte Studie wird für ihre Offenheit gelobt, bevor sie auseinandergenommen wird. Das ist der Ton, in dem diese Debatte geführt werden sollte.

---

## Was diese Story von unseren Standard-Argumenten berechtigt widerlegt

Auch das gehört hierher.

- **„Nutzungsdauer 60–80 Jahre macht Kernkraft billig."** Falsch, und die Story rechnet es sauber vor: CRF(5 %, 60 J.) = 0,05283, CRF(5 %, 80 J.) = 0,05103 — 3,4 % Unterschied. Die Abzinsung entwertet späte Jahre fast vollständig. Wir sollten aufhören, mit 80-Jahre-Laufzeiten für **Neubauten** zu argumentieren. (Für LTO an Bestandsanlagen gilt das nicht — siehe S4; das ist ein anderes Argument, und wir müssen die beiden auseinanderhalten.)
- **„Betriebskosten sind vernachlässigbar."** Die Story zeigt, dass die Modellierung als Prozentsatz der Bausumme ein Artefakt erzeugt, und dass die korrekte absolute Modellierung 130–200 €/kW/a ergibt. Bei 7.500 h sind das 17–27 €/MWh — nicht nichts, aber auch nicht der Treiber. Die Zahl ist belastbar und wir sollten sie übernehmen.
- **„Der globale Bauzeit-Median von 6,3 Jahren zeigt, dass es schnell geht."** Die Story nimmt uns die Zahl nicht weg, sie ordnet sie ein: Der Median wird von historischen Bauten der 1970er/80er und von asiatischen Serienprogrammen dominiert; **jedes** westliche Neubauprojekt der letzten 20 Jahre lag zwischen 10 und 18 Jahren. Für eine Deutschland-Prognose ist das obere Quartil die richtige Kennzahl. Dagegen ist argumentativ nichts zu machen — außer, den Serienbau tatsächlich zu organisieren.
- **„Zwei Blöcke wären ein Anfang."** Nein. Die Story hat hier recht, und sie sagt es sogar freundlicher, als sie müsste: Zwei Blöcke sind *„die denkbar ungünstigste Konstruktion — genau die Konstellation ohne Serieneffekte"*. Wenn wir Kernkraft für Deutschland fordern, müssen wir ein Programm fordern (≥ 6 Blöcke, identische Bauart, Turnkey-Festpreis) — sonst rechnen wir uns selbst den schlechtesten Fall ein.
- **„Kernkraft ist an sich teuer / an sich billig."** Beides falsch. Der Faktor 9 zwischen 1.870 und 17.264 €/kW ist real, und die Ursachen sind gut verstanden und nicht ideologisch. Ein Punktwert ist in dieser Debatte immer manipulativ, egal in welche Richtung — das ist der Kernsatz der Story, und er ist richtig.

---

## Prüfprotokoll

**Geprüft:** vollständiger Text und JavaScript von `strommix-story.html`; `story_data.json` (`nuclear`, `nuclear_history_timeseries`, `must_show_counterpositions`, `rejected_do_not_use`, `shared.nuclear_reference_projects`, `shared.nuclear_capex_scenarios`, `shared.kostenueberschreitung_faktoren`, `shared.monte_carlo`, `thirty_year_plan`); `kosten_kernkraft.md` Abschnitte 1, 2, 4, 5, 6, 7, 8; `story_claims_check.md` (Kernkraft-Claims, MC-Headline); `model_params.json` (`technologies.nuclear`, `construction_years` aller Technologien); `monte_carlo_reference.json` (Presets, Configs, Meta-Annahmen); `model.py` (`idc_surcharge`, `resolve_tech`, `mix_system` Kosten- und Netzblock); `monte_carlo.py` (Aufrufparameter); Stichproben in `whitepaper-strommix.html` / `.js` (WACC-Kapitel, Überschreitungs-Kapitel, GES-Fallstudie, Endlager-Pro/Contra).

**Nicht geprüft:** die stündliche Dispatch-Rechnung auf Plausibilität (ich habe versucht, `mix_system` gegen die Preset-Werte zu reproduzieren, komme auf 186 statt 156 €/MWh für `kostenminimum` — vermutlich falscher Einstiegspunkt oder abweichende Profilbehandlung meinerseits, nicht als Befund gewertet); die Profil-Hochrechnung von 4.416 auf 8.784 Stunden; die EE-seitigen Kostenparameter im Detail; die Quellenliste auf Existenz und Zugriffsdatum.

**Nicht verändert:** Es wurde keine Datei außer diesem Review angelegt oder bearbeitet, kein Commit ausgeführt.
