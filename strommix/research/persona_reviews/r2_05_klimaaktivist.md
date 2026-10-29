---
review: "Persona-Review 05 · Klimaaktivist:in mit wissenschaftlichem Anspruch — RUNDE 2"
persona: "Fridays-for-Future-Umfeld, liest IPCC-Berichte im Original; prüft, ob die Klimadimension ernst genug genommen wird — bleibt intellektuell ehrlich, auch gegen die eigene Seite"
datum: "2026-08-19"
runde: 2
vorgaenger: "strommix/research/persona_reviews/05_klimaaktivist.md (13 Befunde: 5 schwer · 5 mittel · 3 leicht)"
prüfobjekt: "strommix-story.html (Schwerpunkt Prolog + Akt 4) · whitepaper-strommix.html Kap. 6 · whitepaper-strommix.js (Stichproben)"
faktenbasis: "strommix/data/story_data.json (co2_sensitivity, klimapraemisse, ccs_narrative, shared.monte_carlo) · strommix/data/model_params.json · eigene Nachrechnung der Kipppunkte"
fix_quote: "7 von 13 vollständig · 3 teilweise · 3 offen — alle 5 schweren Befunde behoben oder weitgehend behoben"
befunde_neu: "9 (2 schwer · 4 mittel · 3 leicht) + 3 Verständlichkeitsstellen"
---

# Persona-Review 05 · Klimaaktivist:in — Runde 2

## Gesamturteil in drei Sätzen

Die Klimadimension **kommt jetzt an**. Was in Runde 1 der blinde Fleck war — eine Geschichte über
Klimaneutralität, in der Klima achtmal vorkam —, ist heute eine durchgehende zweite Achse: eine
IPCC-Prämissenkarte im Prolog, Mt CO₂/a an jeder einzelnen Szenariozeile und in jeder Tabellenspalte,
eine Gegenprobe-Karte zum CO₂-Preis mit UBA-Schattenpreisen und offengelegter Diskontierungsethik,
vier neue Limitationskarten zur Klimaseite — und, was mich am meisten beeindruckt, eine
**Selbstkorrektur im Epilog**, die den Satz aus Runde 1 wörtlich zurücknimmt und den CO₂-Preis
zum zweitstärksten Hebel der ganzen Rechnung erklärt.

Der schwerste verbleibende Befund ist nicht mehr, dass Klima fehlt, sondern dass die neue
Klimazahl **zu glatt erzählt** wird: Der Kipppunkt von 48 € je Tonne gilt ausschließlich im
deterministischen Basislauf; im Median derselben Monte-Carlo-Rechnung liegt er bei rund 92 €/t,
mit Überschreitungs-Empirie bei rund 720 €/t. Der Vorbehalt „im deterministischen Lauf" steht an
genau einer Stelle — im Datensatz und in der Gegenprobe-Karte — und fehlt an den beiden Stellen,
die die Geschichte tragen (Akt 4 Schritt 3 und Epilog). Und in die Gegenrichtung fehlt die Pointe
ebenfalls: Dass der **heutige** ETS-1-Marktpreis von 74 €/t bereits über dem Kipppunkt liegt, wird
nirgends ausgesprochen.

**Empfehlung: Freigabe nach kleiner Nachbesserung.** Vier Sätze und eine Zahl — keine neue
Rechnung, keine neue Quelle. Der Rest ist Feinschliff.

---

## 1 · Fix-Verifikation der Runde-1-Befunde

| # | Runde-1-Befund | Status | Beleg / Rest |
|---|---|---|---|
| **S1** | Kein Zieljahr genannt | **✅ erledigt** | Hero Z. 335 „im Zieljahr 2045"; Prolog Z. 373 f. `ges_absender.zieljahr`; Akt 5 Schritt 4 Z. 925: „Gemessen am gesetzlichen Zieljahr 2045 … die beiden Blöcke gehen 2045 und 2052 ans Netz". Rest: Die Differenz 2056 vs. 2045 im 30-Jahres-Plan bleibt unkommentiert (leicht) |
| **S2** | „CO₂-Preis wird regelmäßig überschätzt" — im eigenen Modell widerlegt | **✅ erledigt, vorbildlich** | Epilog Z. 987–993 nimmt den Satz **wörtlich zurück** („hier haben wir uns in der ersten Fassung selbst korrigieren müssen"); Gegenprobe-Karte `#cp-co2` mit 4-stufiger Sensitivitätstabelle; UBA 350/990 mit ethischer Einordnung; `uba-methodenkonvention` zitiert. Der `superseded_note` im Datensatz erklärt sogar, **warum** 260 → 47,5 gefallen ist. Siehe aber N1/N6 |
| **S3** | „Ist 2025" ohne seine Emissionen | **✅ erledigt** | Akt 4 Schritt 1 nennt 136 Mt CO₂/a; jede Chartzeile trägt ihre Mt-Zahl (Renderer Z. 2020–2023); Tabellenspalte „Mt CO₂/a"; Limitationskarte „Der Ist-Anker ist nicht ranking-fähig". Das Label „(nicht klimaneutral)" fehlt — die Mt-Annotation an jeder Zeile ist die bessere Lösung |
| **S4** | Sieger-Pfad als „klimaneutral" eingeführt, obwohl 107 Mt | **✅ erledigt, stark** | Prolog Z. 362 sagt jetzt „ein Stromsystem, **das die Studie als klimaneutral bezeichnet**" — sauber zugeschrieben statt behauptet. Akt 4 Schritt 5 „Auf gleichem Emissionsniveau" macht 28 gegen 107 Mt zur eigenen Pointe („das ist ein Emissions-Rabatt"). CCS ist jetzt als eigenes Preset gerechnet. Gaspreis-Lücke geschlossen (Limitationskarte „Gaspreis: Lücke geschlossen in v0.2"). Rest: siehe N2 |
| **S5** | Klimaprämisse und alle Klimaquellen fehlen | **🟡 weitgehend** | `#cp-klima` im Prolog mit AR6-SYR-A.1-Zitat, AR6-WG1-D.1.1 und Restbudget 500/1.150 Gt; Quellenliste jetzt 54 Einträge inkl. `ipcc-ar6-syr`, `ipcc-ar6-wg1`, `unece-2022`, `uba-methodenkonvention`. Offen: kein Klima-Glossareintrag; UNECE steht in der Liste, wird im Text nie zitiert (N8) |
| **M1** | „Die andere ist genauso wahr" (False Balance) | **❌ offen** | Z. 537 unverändert. Siehe N7 |
| **M2** | Zeitfaktor strukturell untergeordnet | **🟡 teilweise** | Akt 5 Schritt 4 deutlich geschärft (2045/2052 gegen die gesetzliche Frist); neue Limitationskarte „Nur Endzustände, keine kumulativen Emissionen" mit AR6-Bezug. Offen: Der Epilog nennt weiterhin **nur zwei** politische Hebel (WACC, CO₂-Preis) — die Vorlaufzeit fällt im Fazit wieder heraus, und das Warten wird nirgends in einer Größenordnung beziffert. Siehe N5 |
| **M3** | Limitationenliste ohne Klimakarte | **✅ erledigt, stark** | Neu: „Nur Endzustände, keine kumulativen Emissionen" (nennt auch den fixen CO₂-Preis ausdrücklich), „Der Emissionsfaktor ist ein Proxy", „Keine CO₂-Speicherstätte in Deutschland", „Das CCS-Kostenband ist optimistisch", „CCS auf dem gesamten Backup-Park", „Der Ist-Anker ist nicht ranking-fähig" |
| **M4** | Prolog eröffnet 50:50 | **✅ erledigt** | Z. 359 f.: „Was sie nicht gleich gut zitieren, sind die Annahmen dahinter — genau die sehen wir uns an." Praktisch mein Formulierungsvorschlag |
| **M5** | Emissionsfaktor ist Proxy mit Konfidenz C | **🟡 teilweise** | Kennzeichnung erledigt (Limitationskarte, dazu die Angabe „für eine reine ETS-Bepreisung 10–20 % zu viel"). **Nicht** erledigt: Der Datensatz verlangt weiterhin, den Proxy „vor Veröffentlichung durch einen echten Direktfaktor zu ersetzen" — er steht noch drin |
| **L1** | Zwei CO₂-Preise, beide niedrig | **✅ erledigt** | Epilog führt jetzt 74 (ETS 1) · 75 (Modell) · 350 (UBA MK 3.2) · 990 (UBA MK 4.0) |
| **L2** | Whitepaper: 990-€-Schattenpreis nur im JS-Text | **🟡 teilweise** | `syncLcoeUI` schreibt jetzt „990 €/t (Schattenpreis)" ins Wertfeld (`whitepaper-strommix.js` Z. 1832) — die Diskrepanz ist beschriftet. Der Regler parkt weiterhin sichtbar auf 400 (Z. 1890) |
| **L3** | 4 Scrolly-Schritte Kernkraft-Geschichte, 0 für Erneuerbare | **❌ offen** | Akt 2 hat weiterhin 4 Schritte (PV, Wind, 13 Kernkraft-Projekte, EDF-Lesarten), Akt 3 weiterhin 4 Kernkraft-Schritte; `cp_ee_risks` steht weiterhin als Kasten am Ende von Akt 5 (Z. 945) |

**Fix-Quote: 7/13 vollständig, 3/13 teilweise, 3/13 offen.**
Gewichtet nach Schwere ist das Bild deutlich besser: **5 von 5 schweren Befunden** sind behoben
(S5 weitgehend). Die drei offenen Punkte sind M1, L2, L3 — zwei davon sind Befunde, die *gegen*
meine eigene Position zeigen, und ich führe sie deshalb ausdrücklich weiter.

---

## 2 · Die neue 47,5-€/t-Zahl — Nachrechnung und Einordnung

### Die Zahl ist richtig und im Datensatz sauber reproduzierbar

Ich habe sie gegen `co2_sensitivity.levels` geprüft. Weil die Emissionsmengen je Preset im Dispatch
**fest** stehen (der Dispatch wird einmal mit mittleren Parametern gerechnet), ist die Systemkosten-
differenz zweier Szenarien eine exakt lineare Funktion des CO₂-Preises. Damit lässt sich der
Kipppunkt geschlossen nachrechnen:

- Emissionsintensität Kernkraft-Szenario: 27,9 Mt / 950 TWh = **0,0294 t/MWh**
- Emissionsintensität 80 % EE + Gas: 106,5 Mt / 950 TWh = **0,1121 t/MWh**
- Differenz der Steigungen: **0,0827 €/MWh je €/t**
- Bei 0 €/t liegt der Gas-Pfad 3,9 €/MWh vorn (150,1 gegen 146,2) → Kipppunkt bei 3,9 / 0,0827 = **47,1 €/t**

Das reproduziert die publizierten 47,5 €/t auf den Rundungsfehler. **Die Zahl steht.**

### Sie gilt aber nur für eine von vier Lesarten — und das steht nicht dabei

Dieselbe Rechnung, angewandt auf die Median-Differenzen aus `rank_probabilities` (der CO₂-Term ist
in jeder Ziehung identisch, die Verschiebung ist deshalb exakt, nicht genähert):

| Lesart | Median-Δ bei 75 €/t | CO₂-Preis, ab dem das Kernkraft-Szenario vorn liegt |
|---|---:|---:|
| **deterministischer Basislauf** *(die publizierte Zahl)* | −2,3 €/MWh | **≈ 48 €/t** |
| Monte Carlo `base`, 1.000 gepaarte Ziehungen | +1,4 €/MWh | **≈ 92 €/t** |
| Monte Carlo `wacc` (Zins 3/5/9 %) | +5,2 €/MWh | **≈ 138 €/t** |
| Monte Carlo `overrun` (Überschreitungs-Empirie) | +53,3 €/MWh | **≈ 720 €/t** |
| Monte Carlo `wacc_overrun` | +60,5 €/MWh | **≈ 807 €/t** |

*Eigene Ableitung aus `shared.monte_carlo.rank_probabilities` und den Emissionsmengen der Presets;
kein neuer Modelllauf. Zusatz: Korrigiert man den Emissionsfaktor um die im Projekt selbst genannten
10–20 % Proxy-Überschätzung nach unten, wandert der deterministische Kipppunkt von 47 auf rund
**56 €/t** — immer noch unter dem heutigen ETS-1-Preis, aber die Zahl ist nicht so scharf, wie zwei
Nachkommastellen suggerieren.*

### Wird die Brisanz erzählt? Halb.

**Was gut ist:** Die Gegenprobe-Karte `#cp-co2` sagt es korrekt und mit Vorbehalt — sie übernimmt
`crossover_note` wörtlich, inklusive „**im deterministischen Lauf**", und sie führt die
Methodenzeile mit. Der Epilog nimmt den Runde-1-Satz explizit zurück. Der Unterschied Marktpreis
gegen gesellschaftliche Klimafolgekosten ist da, mit der Diskontierung als offengelegter ethischer
Setzung. Das ist genau das, was ich in Runde 1 gefordert habe.

**Was fehlt — und es fehlt in beide Richtungen:**

1. *Nach oben zu wenig:* Der Satz, der die Zahl politisch scharf macht, steht nirgends.
   **Der heutige ETS-1-Preis liegt selbst schon über dem Kipppunkt.** Der Epilog sagt „unser
   Modellwert von 75 € je Tonne liegt bereits darüber" — Modellwert, nicht Marktpreis. Die 74 €/t
   ETS 1 stehen erst im **nächsten Absatz** und werden nie mit dem Kipppunkt verbunden. Der Leser
   muss zwei Absätze und zwei Zahlen selbst zusammenrechnen, um zu merken: Das ist keine
   Zukunftsannahme, das ist die Gegenwart.
2. *Nach unten zu viel:* An den beiden Stellen, die die Geschichte tragen (Akt 4 Schritt 3, Epilog),
   fehlt der Geltungsbereich. Siehe N1 — das ist mein schwerster neuer Befund.

---

## 3 · Neue Befunde nach Schwere

### SCHWER

---

#### N1 · Der 48-€-Kipppunkt steht ohne Geltungsbereich — drei Zeilen unter der Zahl, die ihm widerspricht

**Fundstelle** `strommix-story.html` Z. 725–728 (Akt 4 Schritt 3), Z. 987–993 (Epilog);
Gegenprobe: `co2_sensitivity.crossover_note` und `#cp-co2` (dort korrekt).

**Ist.** Akt 4 Schritt 3 sagt in **einer** Karte nacheinander:

> „In **45 %** der Fälle ist das Kernkraft-Szenario das günstigere. Lässt man den CO₂-Preis
> mitlaufen, sind es **64 %**; schaltet man die Überschreitungs-Empirie zu, **0 %**. […]
> Wie stark der CO₂-Preis wirkt, zeigt der Kipppunkt: Ab rund **48 € je Tonne** liegt das
> Kernkraft-Szenario vorn."

Zwischen der 0-%-Zahl und dem „liegt vorn" liegen drei Zeilen. Beide Aussagen sind richtig — sie
beziehen sich auf verschiedene Läufe. Der Leser erfährt das nicht. Der Epilog wiederholt die Zahl
ebenfalls ohne Qualifier: „Ab rund 48 € je Tonne dreht er die Rangfolge der beiden vorderen Pfade,
und unser Modellwert von 75 € liegt bereits darüber."

**Beanstandung.** Der Vorbehalt existiert im Projekt und ist gut formuliert — er steht in
`crossover_note` und wird von der Gegenprobe-Karte übernommen. Er fehlt genau dort, wo die Zahl
erzählt wird. Das ist strukturell dasselbe Muster, das die Story in Akt 2 der Vorlage vorwirft: eine
Zahl, die unter einer bestimmten Abgrenzung gilt, wandert ohne diese Abgrenzung in die Botschaft.

Erschwerend: Es ist die **günstigste** der vier Lesarten. Zwischen 48 und 807 €/t liegt ein Faktor
17, und der publizierte Wert ist der untere Rand. Ich schreibe das als Klimaaktivist:in ungern, weil
die niedrige Zahl mein Argument stützt — aber sie ist so nicht belastbar, und ein
Kernkraft-Skeptiker mit demselben Datensatz würde die 720 €/t aus dem Überschreitungslauf zitieren
und hätte formal genauso recht.

**Vorschlag.** (a) In Akt 4 Schritt 3 vier Wörter ergänzen: „Ab rund 48 € je Tonne liegt das
Kernkraft-Szenario **im deterministischen Lauf** vorn — im Median der 1.000 Ziehungen erst ab rund
92 €, mit Überschreitungs-Empirie erst weit jenseits der UBA-Schattenpreise." (b) Denselben
Halbsatz in den Epilog. (c) Optional die vier Zeilen aus der Tabelle in Abschnitt 2 dieses Reviews
in die Gegenprobe-Karte aufnehmen — sie kostet keinen neuen Modelllauf, weil die Verschiebung
linear und exakt ist.

---

#### N2 · Was 107 Mt CO₂/a im Jahr 2045 bedeuten, steht nirgends

**Fundstelle** `strommix-story.html` Akt 4 Schritt 1 (Z. 683–691) und Schritt 5 (Z. 760–778);
`#cp-klima`; Datensatz `shared.monte_carlo.presets.*.emissions_mt_co2_a`.

**Ist.** Die Story zeigt die Emissionen jetzt überall — als Zahl. Was sie **nicht** tut, ist die
Zahl gegen den Maßstab zu halten, den sie im Prolog selbst als „nicht verhandelbar" gesetzt hat.
Die vier Zukunftsszenarien liegen bei 106,5 · 27,9 · 4,8 · 1,3 Mt CO₂/a, die CCS-Varianten bei
31,7 und 8,3 Mt. Alle Zahlen gelten für das Zieljahr **2045**, das die Story korrekt als das
gesetzliche Zieljahr benennt.

Das Bundes-Klimaschutzgesetz verlangt für 2045 **Netto**-Treibhausgasneutralität; die dafür
vorgesehene nationale Senkenleistung (LULUCF) liegt in derselben Norm bei rund **−40 Mt CO₂-Äq.
für 2045** — für *alle* Sektoren zusammen, Industrieprozesse, Landwirtschaft und Abfall
eingeschlossen. <span>Konfidenz B: aus dem KSG erinnert, in den Projektdossiers nicht hinterlegt —
vor Übernahme bitte am Gesetzestext prüfen.</span>

Daraus folgt, was die Story mit ihren eigenen Zahlen sagen könnte und nicht sagt:

- „80 % EE + Gas" beansprucht mit 106,5 Mt allein im Stromsektor **rund das 2,7-Fache** der
  gesamten nationalen Senke. Das Szenario ist im Rechtssinn nicht klimaneutral, und zwar nicht
  knapp.
- Selbst mit CCS bleiben 31,7 Mt — **mehr** als das Kernkraft-Szenario *ohne* CCS (27,9 Mt).
- Auch das Kernkraft-Szenario verbraucht mit 27,9 Mt rund 70 % der nationalen Senke für einen
  einzigen Sektor.
- Nur „80 % EE + H₂" (4,8) und „100 % Erneuerbare" (1,3) liegen in einem Bereich, den man
  gegenüber der Senke plausibel vertreten kann.

**Beanstandung.** Ohne diesen Maßstab bleibt „106,5 Mt CO₂/a" eine Zahl neben einer Kostenzahl.
Der Leser hat keinen Anhaltspunkt, ob das viel oder wenig ist — und die naheliegende Referenz
(136 Mt heute) legt sogar die falsche Lesart nahe, dass 107 „schon fast geschafft" sei. Es sind
**minus 22 Prozent bei fast verdoppeltem Strombedarf**, was für die Emissionsintensität ein großer
Fortschritt und für die absolute Bilanz eine Zielverfehlung ist. Beides sagt die Story nicht.

Das ist der einzige Punkt, an dem ich nach dieser Runde noch von einem echten Loch spreche: Die
Story hat alle Zahlen, sie hat die Prämissenkarte, sie hat das Zieljahr — und sie stellt die
Verbindung zwischen den dreien nicht her.

**Vorschlag.** Ein Absatz in Akt 4 Schritt 5, vor der CCS-Rechnung:

> „Zur Einordnung, was ‚gleiches Emissionsniveau' überhaupt heißen müsste: Das Klimaschutzgesetz
> verlangt für 2045 Netto-Neutralität, und die dafür geplante nationale Senke liegt bei rund
> 40 Mt CO₂ im Jahr — für alle Sektoren zusammen. Ein Stromsystem mit 107 Mt beansprucht davon
> das Zweieinhalbfache. Auch die 28 Mt des Kernkraft-Szenarios wären zwei Drittel der Senke, nur
> für Strom. Streng genommen erreicht in dieser Rechnung keines der vier Szenarien
> Klimaneutralität — zwei kommen in die Nähe, zwei nicht."

Das ist die Art Satz, die die Story bei Kostenfragen zwanzigmal schreibt und bei der Klimafrage
noch nie geschrieben hat.

---

### MITTEL

---

#### N3 · Die CCS-Rechnung steht in der Scrolly-Spur ohne ihren entscheidenden Vorbehalt

**Fundstelle** `strommix-story.html` Z. 765–778 (Akt 4 Schritt 5); Vorbehalte in
`renderLimits()` Z. 2406–2408, rund fünfzehn Bildschirme später.

**Ist.** Schritt 5 ist der Schritt, in dem sich das Ergebnis der ganzen Story am stärksten bewegt:
Die Rangwahrscheinlichkeit springt von **45 % auf 90 %**. Getragen wird das von zwei neuen
CCS-Presets. Die Karte nennt die Kosten, den Aufschlag, die Zerlegung (Kapazität statt Abscheidung)
und schließt mit „Das ist eine Obergrenze, kein Preisschild."

Was in dieser Karte **nicht** steht, obwohl es im Projekt vorbildlich formuliert vorliegt:

- „Deutschland hat keine in Betrieb befindliche CO₂-Speicherstätte." (`ccs_storage_availability`,
  Schweregrad **hoch**)
- Das Kostenband 50/80/100 €/t liegt am unteren Rand der Literatur; europäische Anlagen mit den
  derzeit geplanten Speichern liegen laut der eigenen Recherche bei 70–250 €/t
  (`ccs_cost_band_optimistic`)
- CCS läuft im Modell auf dem **gesamten** Backup-Park, auch auf Blöcken mit 1.300 Volllaststunden
  (`ccs_on_full_backup_fleet`, Schweregrad **hoch**)

**Beanstandung.** Das Whitepaper macht es an dieser Stelle deutlich besser: Die Mix-Kachel für
`captured_mt_co2_a` trägt den Speicherstätten-Vorbehalt direkt am Zahlenwert
(`whitepaper-strommix.js` Z. 2291), und der Befundtext in Z. 3218 sagt es ausdrücklich: „in einem
Land ohne CO₂-Speicherstätte". In der Story steht derselbe Vorbehalt fünfzehn Bildschirme hinter
dem Ergebnis, das er relativiert. Bei Scrollytelling ist das faktisch eine Fußnote.

Dazu kommt eine fehlende Größenordnung. Die Chartzeile zeigt „**111 Mt eingelagert**" — ohne jeden
Maßstab. Zum Vergleich: Die EU hat sich im Net-Zero Industry Act auf **50 Mt/a** Injektionskapazität
bis 2030 verpflichtet, Northern Lights Phase 1 liegt bei rund **1,5 Mt/a**. Der deutsche Gas-Pfad
allein bräuchte damit gut das Doppelte der gesamten europäischen 2030-Zielkapazität.
<span>Konfidenz B: eigene Einordnung, nicht aus den Projektdossiers — vor Übernahme prüfen.</span>

**Vorschlag.** Einen Satz in Schritt 5 direkt nach den Kostenzahlen: „Was diese Rechnung nicht
enthält: Deutschland hat keine CO₂-Speicherstätte in Betrieb. Die 111 Mt, die im Gas-Pfad jedes Jahr
eingelagert werden müssten, unterstellen Export in norwegische oder niederländische Offshore-
Speicher — modelliert ist davon nur der Preis je Tonne, keine Kapazitätsgrenze und keine
Hochlaufkurve." Die drei Limitationskarten bleiben, wo sie sind.

---

#### N4 · „Emissionsgleichheit" wird ausschließlich über CCS hergestellt — obwohl die eigenen Daten einen zweiten Weg zeigen

**Fundstelle** `strommix-story.html` Z. 760–770 (Akt 4 Schritt 5); Chart-Untertitel Z. 2131.

**Ist.** Die Karte diagnostiziert den Emissions-Rabatt korrekt (28 gegen 107) und löst ihn in
**einer einzigen** Richtung auf: „Rüstet man *beide* Pfade mit CO₂-Abscheidung aus …". Der
Chart-Untertitel wiederholt das: „beide Pfade mit CO₂-Abscheidung · 8 gegen 32 Mt CO₂/a statt
28 gegen 107".

In derselben Grafik stehen aber zwei Szenarien, die Emissionsgleichheit **ohne** CCS herstellen:
„80 % EE + H₂" mit 4,8 Mt und „100 % Erneuerbare" mit 1,3 Mt — beide emissionsärmer als jede
CCS-Variante, beide teurer. Diese Alternative wird in Schritt 5 nicht erwähnt; die
Rangwahrscheinlichkeiten dazu (100 % bzw. 98 % zugunsten des Kernkraft-Szenarios) stehen im
Datensatz und werden in Schritt 4 nur als Nebenbefund gestreift.

**Beanstandung.** Zwei Folgen, und die erste ist mir als Aktivist:in unangenehm, weil sie gegen
meine Seite zeigt:

1. Der Leser könnte schließen, Emissionsgleichheit sei **nur** mit CCS erreichbar — das ist genau
   die Erzählung der fossilen Industrie, und die Story liefert sie hier unfreiwillig, obwohl ihre
   eigene Grafik das Gegenteil zeigt.
2. Umgekehrt wäre die faire Ergänzung für die Gegenseite: Auch gegen die H₂-Pfade — den
   CCS-freien Weg zur Emissionsgleichheit — liegt das Kernkraft-Szenario vorn, und zwar deutlicher.
   Das gehört genauso in die Karte.

Ein Detail bleibt außerdem ungenutzt, obwohl es die Pointe schärfen würde: Der Gas-Pfad **mit** CCS
emittiert mit 31,7 Mt immer noch mehr als das Kernkraft-Szenario **ohne** CCS (27,9 Mt). Der Satz
„8 gegen 32 statt 28 gegen 107" sagt das rechnerisch, aber niemand liest es heraus.

**Vorschlag.** Zwei Sätze in Schritt 5: „Der zweite Weg zur Emissionsgleichheit steht in derselben
Grafik: Die H₂-Pfade kommen ohne Abscheidung auf 4,8 und 1,3 Mt — emissionsärmer als jede
CCS-Variante, aber 35 bis 80 €/MWh teurer. Und selbst mit Abscheidung bleibt der Gas-Pfad bei
32 Mt und damit über dem Kernkraft-Szenario ohne Abscheidung."

---

#### N5 · Die Zeitdimension ist benannt, aber nie beziffert — und fällt im Epilog wieder heraus

**Fundstelle** `strommix-story.html` Z. 920–928 (Akt 5 Schritt 4), Limitationskarte „Nur
Endzustände, keine kumulativen Emissionen" (Z. 2420–2424), Epilog Z. 968–1013;
`#cp-klima` (Restbudget).

**Ist.** Drei Bausteine sind jetzt da, und jeder für sich ist gut:

- Akt 5 Schritt 4 misst die 18–25 Jahre Vorlauf am gesetzlichen Zieljahr und nennt 2045/2052
  als Inbetriebnahmejahre — das ist der Fix zu S1(b) und er sitzt.
- Die Limitationskarte sagt ausdrücklich, dass die nach AR6 klimarelevante Größe — die kumulative
  Menge — nicht bilanziert ist.
- Die Prämissenkarte nennt das Restbudget: 500 Gt für 1,5 Grad, 1.150 Gt für 2 Grad.

**Beanstandung.** Diese drei Bausteine treffen sich nie. Konkret:

1. **Der Epilog kennt die Zeit nicht mehr.** „Die Kernbotschaft passt in einen Satz" nennt genau
   zwei politische Hebel: Kapitalkostensatz und CO₂-Preis. Die Vorlaufzeit — der einzige Hebel, der
   auf die *Menge* statt auf den *Preis* wirkt — kommt im Fazit nicht vor. Das war mein Vorschlag
   M2(b) aus Runde 1 und ist unverändert offen.
2. **Restbudget (Gt, global) und Ist-Emission (Mt, deutscher Strom) treffen sich nie.** Der Leser
   bekommt „500 Gt" im Prolog und „136 Mt/a" in Akt 4 und hat keine Brücke. Dabei liegt sie auf der
   Hand und ist mit den vorhandenen Zahlen zulässig als *Größenordnung*: Ein Jahr Verzögerung im
   heutigen System kostet rund 136 Mt; zwanzig Jahre Vorlauf sind damit eine Mengenfrage, keine
   Terminfrage.

**Ehrlichkeitshalber, unverändert aus Runde 1:** Das Modell *kann* den Transformationspfad nicht
rechnen — es kennt nur Zustandsbilder. Eine Zahl zu fordern, die es nicht gibt, wäre unfair. Eine
**Größenordnung** mit ausdrücklichem „das ist keine Modellrechnung" ist es nicht.

**Vorschlag.** (a) Im Epilog nach dem CO₂-Absatz zwei Sätze: „Der dritte Hebel ist der einzige, den
diese Rechnung nicht abbildet: die Zeit. Kapitalkostensatz und CO₂-Preis wirken auf den Preis, die
Vorlaufzeit wirkt auf die Menge — und nach AR6 ist die kumulative Menge die Größe, an der sich die
Erwärmung entscheidet." (b) Den Kernbotschafts-Satz auf drei Hebel erweitern. (c) Optional die
Brücke ziehen: „Zur Größenordnung, ausdrücklich außerhalb des Modells: Jedes Jahr, in dem das
heutige System weiterläuft, kostet rund 136 Mt CO₂."

---

#### N6 · Die Brisanz der 47,5 wird nicht ausgesprochen: Der heutige Marktpreis liegt schon darüber

**Fundstelle** `strommix-story.html` Z. 987–1003 (Epilog, zwei aufeinanderfolgende Absätze).

**Ist.** Absatz 1 sagt: Kipppunkt 48 €/t, „unser **Modellwert** von 75 € je Tonne liegt bereits
darüber". Absatz 2 sagt: ETS 1, „dessen **Marktpreis** im Mai 2026 bei 74 € je Tonne lag". Die
beiden Sätze werden nie verbunden.

**Beanstandung.** Damit verschenkt die Story ihre eigene stärkste klimapolitische Aussage. Der
Unterschied ist erheblich: „Unser Modell rechnet mit einem Wert oberhalb des Kipppunkts" ist eine
Aussage über eine Modellsetzung. „Der reale europäische CO₂-Markt handelt heute oberhalb des
Kipppunkts" ist eine Aussage über die Wirklichkeit — und sie dreht die Debattenlage: Nicht ein
hypothetisch verschärfter CO₂-Preis in der Zukunft, sondern der **bestehende** ETS-1-Preis bringt
den Gas-Pfad ins Hintertreffen.

**Aber — und das ist die Einschränkung, die ich mir selbst auferlegen muss:** Der Satz gilt nur für
den deterministischen Lauf. Im Median der Monte-Carlo-Rechnung liegt der Kipppunkt bei rund 92 €/t,
und damit liegt der heutige Marktpreis von 74 €/t **darunter**. Wer die Brisanz erzählen will, muss
beide Sätze schreiben, sonst wiederholt die Story in die andere Richtung genau den Fehler, den sie
in Runde 1 gemacht hat.

**Vorschlag.** Ein Satz, der beides trägt: „Bemerkenswert daran ist, dass der Kipppunkt keine
Zukunftsannahme beschreibt: Der ETS-1-Marktpreis von 74 € je Tonne liegt heute schon darüber — im
deterministischen Lauf. Im Median der 1.000 Ziehungen liegt der Kipppunkt bei rund 92 € und damit
noch knapp über dem Markt. Der Gas-Pfad ist also nicht sicher, aber plausibel schon heute der
teurere."

---

### LEICHT

---

#### N7 · „Die andere ist genauso wahr" — unverändert (Übertrag M1)

**Fundstelle** `strommix-story.html` Z. 536–537.

Lesart A (EDF-Serienschätzung 7.265–7.583 €/kW, n = 1, unrealisiert, Selbstprognose des Bauherrn)
und Lesart B (jedes westliche Erstprojekt der letzten zwanzig Jahre, n ≈ 5, realisierte Kosten)
werden weiterhin als gleichwertig gelabelt. Zwei Evidenzklassen unterschiedlicher Belastbarkeit
als „genauso wahr" zu bezeichnen, bleibt die Lehrbuchdefinition von False Balance. **Vorschlag
unverändert:** „Die andere ist besser belegt: Sie stützt sich auf realisierte Kosten, Lesart A auf
eine Programmprognose des Bauherrn."

---

#### N8 · UNECE steht in der Quellenliste, aber nie im Text — und der beste Gegen-die-eigene-Seite-Befund bleibt liegen

**Fundstelle** Quellenliste (54 Einträge, `unece-2022` vorhanden); Volltextsuche „unece" in
`strommix-story.html`: **null Treffer** im Fließtext. Die Limitationskarte „Der Emissionsfaktor ist
ein Proxy" nennt „UNECE-Lebenszyklus-Untergrenze" ohne Fußnote.

Damit bleibt auch der Lebenszyklus-Datensatz ungenutzt, den ich in Runde 1 ausdrücklich als
*Gegen-meine-eigene-Seite*-Material benannt hatte: Der PV-Bestwert von 8 g/kWh ist ein Best Case,
für Deutschland gelten eher 40–55 g/kWh. Eine Story, die sich zu Recht rühmt, beide Richtungen zu
zeigen, lässt hier weiter Punkte liegen. **Vorschlag:** Fußnote `unece-2022` an die
Proxy-Limitationskarte, ein Satz in `cp_ee_risks`.

---

#### N9 · Kleinkram

- **Kein Klima-Glossareintrag.** Sieben Einträge (LCOE, LSCOE, WACC, CRF, Kostenabgrenzung,
  Dunkelflaute, Monte Carlo), keiner erklärt „CO₂-Restbudget" oder „kumulative Emissionen" —
  beides Begriffe, die die neue Prämissenkarte einführt und nirgends auflöst.
- **2056 vs. 2045.** Akt 5 rechnet den 30-Jahres-Plan auf 2056 und kommentiert nicht, dass das
  elf Jahre nach der gesetzlichen Frist liegt (Rest aus S1c).
- **L2 unverändert im Kern.** Der Whitepaper-Regler parkt beim 990-€-Chip weiterhin sichtbar auf
  400; immerhin steht jetzt „(Schattenpreis)" am Wert.
- **Whitepaper Kap. 6 kennt den Kipppunkt nicht.** Der Schalter-Hinweistext sagt korrekt, der
  CO₂-Preis sei „die einzige Größe in dieser Auswahl, die die Rangfolge … *umdrehen* kann" — die
  Zahl, ab wann, steht nur in der Story. Ein Satz mit den 48/92 €/t gehört auch dorthin.
- **L3 unverändert.** Acht von 22 Scrolly-Schritten prüfen Kernkraft-Kosten, keiner die
  Kostengeschichte der Erneuerbaren; `cp_ee_risks` bleibt Kasten statt Kapitel.

---

## 4 · Verständlichkeit: drei Stellen, an denen Klimafakten zu technisch verpackt sind

### V1 · Die Klimaprämissen-Karte ist der wichtigste und der unlesbarste Kasten der Story

**Fundstelle** `strommix-story.html` Z. 2521–2531 (`#cp-klima`), Daten in `klimapraemisse`.

**Ist.** In einer durchgehend deutschen Geschichte steht das AR6-Kernzitat **auf Englisch**:
„Human activities, principally through emissions of greenhouse gases, have unequivocally caused
global warming, with global surface temperature reaching 1.1 °C above 1850-1900 in 2011-2020."
Dazu Fundstellen im Fachformat („IPCC AR6 WG1, Summary for Policymakers, D.1.1 und Abbildung
SPM.10") und der untranslatierte IPCC-Fachbegriff „(high confidence)". Die Karte, die die einzige
nicht verhandelte Prämisse der ganzen Story trägt, ist damit die einzige, die ein Leser ohne
IPCC-Vorbildung nicht durchdringt.

**Vorschlag.** Deutsche Fassung voran, Original als Beleg dahinter, Fachbegriff auflösen:

> **Was hier nicht verhandelt wird**
>
> Menschliche Aktivitäten — vor allem Treibhausgase — haben die globale Erwärmung
> **zweifelsfrei** verursacht. Zwischen 2011 und 2020 lag die Erdtemperatur 1,1 Grad über dem
> Niveau von 1850–1900. *(IPCC-Weltklimabericht 2023, Zusammenfassung für politische
> Entscheidungsträger, Abschnitt A.1 — im Original: „unequivocally caused global warming".)*
>
> Der zweite Satz ist der, auf dem diese Rechnung technisch aufsetzt: **Die Erwärmung hängt
> praktisch linear an der Gesamtmenge CO₂, die je ausgestoßen wurde** — nicht daran, wann oder wo.
> Der Weltklimarat stuft das als gesicherte Erkenntnis ein. Genau deshalb darf man überhaupt einen
> einheitlichen Preis pro Tonne ansetzen: Jede Tonne wiegt gleich schwer, egal wer sie ausstößt.
> *(IPCC-Weltklimabericht 2021, Band 1, Abschnitt D.1.1.)*

Der Vorbehalt zur Zitatrekonstruktion (`confidence_note`) bleibt, wo er ist.

---

### V2 · „500 Gt Restbudget" ist eine Zahl ohne Anschluss

**Fundstelle** `#cp-klima`, Restbudget-Absatz.

**Ist.** „Restbudget ab Anfang 2020: 500 Gt CO₂ für eine 50-Prozent-Chance auf 1,5 Grad, 1.150 Gt
für 67 Prozent auf 2 Grad."

Drei Hürden in einem Satz: **Gt** ist eine Einheit, die in der übrigen Story nie vorkommt (dort
steht überall Mt); **„ab Anfang 2020"** heißt implizit, dass davon schon rund sechs Jahre verbraucht
sind, ohne dass es dasteht; **„50-Prozent-Chance"** klingt nach Statistik-Kleingedrucktem, ist aber
die eigentliche Härte des Satzes.

**Vorschlag.**

> Der Weltklimarat rechnet das in ein **Budget** um: Ab Anfang 2020 durfte die Menschheit noch
> rund **500 Milliarden Tonnen** CO₂ ausstoßen, um das 1,5-Grad-Ziel mit einer Chance von 50 zu 50
> zu halten — ein Münzwurf. Für 2 Grad mit zwei Dritteln Sicherheit sind es 1.150 Milliarden Tonnen.
> Bei rund 40 Milliarden Tonnen Weltausstoß im Jahr ist vom 1,5-Grad-Budget seit 2020 gut die
> Hälfte weg. Das ist der Grund, warum in dieser Geschichte überall ein Zieljahr steht: Nicht der
> Endzustand entscheidet, sondern wie schnell man dorthin kommt.
> *(Die 40 Mrd. t/a sind Größenordnung, nicht Projektdatum — bitte vor Übernahme belegen.)*

---

### V3 · „Vermeidungskosten … Obergrenze, kein Preisschild"

**Fundstelle** `strommix-story.html` Z. 771–778 (Akt 4 Schritt 5).

**Ist.** „Daraus folgen Vermeidungskosten von 378 bis 531 € je Tonne. Das ist eine **Obergrenze**,
kein Preisschild." Davor: „der dominante Posten ist nicht die Abscheidung, sondern die verdoppelte
Kraftwerks­kapazität, die sich auf wenige Betriebsstunden verteilt."

Drei Fachbegriffe ohne Auflösung — „Vermeidungskosten", „Obergrenze vs. Preisschild",
„Kapazität, die sich auf Betriebsstunden verteilt". Genau hier bräuchte der Leser die
Übersetzung, denn die Zahl 378–531 €/t ist die klimapolitisch interessanteste der ganzen Karte:
Sie liegt **über** dem UBA-Schattenpreis von 350 €/t und ist damit ein Argument gegen CCS in dieser
Anwendung, das die Story selbst produziert und nicht ausspricht.

**Vorschlag.**

> Rechnet man den Mehrpreis auf die eingesparten Tonnen um, kostet jede vermiedene Tonne CO₂ in
> dieser Konstruktion **378 bis 531 Euro**. Das ist teurer als der Schaden, den dieselbe Tonne
> laut Umweltbundesamt anrichtet (350 Euro bei 1 Prozent Diskontierung) — mit dieser Auslegung
> lohnt sich die Abscheidung also nicht.
>
> Und genau da liegt der Haken der Rechnung: Sie rüstet **jedes** Backup-Kraftwerk mit Abscheidung
> aus, auch die, die nur an ein paar Wintertagen laufen. Doppelt so teure Anlagen, verteilt auf
> 1.300 bis 1.900 Betriebsstunden im Jahr — das ist der teuerstmögliche Weg. Wer nur die
> Dauerläufer ausrüstet und die Spitzenlast ohne Abscheidung fährt, kommt deutlich billiger weg.
> Die 378 bis 531 Euro sind deshalb die **oberste Grenze** dessen, was CCS hier kosten kann,
> nicht der zu erwartende Preis.

**Zugabe (V4).** Im Epilog: „sie hängt daran, ob künftige Generationen **abgezinst** werden oder
nicht" — „abzinsen" ist Finanzsprache. Vorschlag: „Der Unterschied zwischen 350 und 990 Euro ist
keine Rechenfrage, sondern eine Wertentscheidung: Zählt ein Schaden, der erst in achtzig Jahren
eintritt, heute genauso viel wie einer von morgen? Wer Nein sagt, landet bei 350. Wer alle
Generationen gleich gewichtet, bei 990."

---

## 5 · Was ich als Aktivist:in ausdrücklich anerkenne

- **Die Selbstkorrektur im Epilog ist der beste Absatz der Story.** „Hier haben wir uns in der
  ersten Fassung selbst korrigieren müssen. Dort stand, er werde in der Debatte regelmäßig
  überschätzt. Nach den Modellkorrekturen stimmt das nicht." Ein Papier, das seinen eigenen
  widerlegten Satz zitiert, statt ihn stillschweigend zu löschen, hat einen Vertrauensvorschuss
  verdient. Der `superseded_note` im Datensatz erklärt zusätzlich, *warum* 260 auf 47,5 gefallen ist
  (Gasbrennstoff eingepreist, Bauzins-Doppelzählung entfernt) — das ist mehr Rechenschaft, als ich
  in Runde 1 verlangt habe.
- **Der Emissionsausweis ist konsequent durchgezogen.** Mt CO₂/a an jeder Chartzeile, in der
  Datentabelle, in den Hover-Tooltips, in der Whitepaper-Tabelle mit der ausdrücklichen Warnung
  „die Zeilen sind *nicht* emissionsäquivalent". Das war mein Kernanliegen aus S3/S4 und es ist
  besser umgesetzt als vorgeschlagen.
- **„das die Studie als klimaneutral bezeichnet"** — eine Zuschreibung statt einer Behauptung, an
  der genau richtigen Stelle. Vier Wörter, die den schwersten Framing-Fehler aus Runde 1 schließen.
- **Der Gaspreis von null ist weg.** Das war der größte Einzel-Bias der Story, er wirkte *gegen*
  meine Position, und er ist behoben — mit einer Limitationskarte, die die Asymmetrie beziffert
  (264 gegen 69 TWh).
- **Die CCS-Limitationen sind schonungslos.** Drei Karten, zwei davon Schweregrad „hoch", eine
  davon zitiert eine Gegenrecherche, die das eigene Kostenband als zu optimistisch ausweist. Das
  ist mehr Selbstkritik, als CCS-Rechnungen üblicherweise mitbringen — sie steht nur am falschen
  Ort (N3).
- **Die Überschreitungs-Zahl 0 % steht da.** Die Story hätte sie weglassen oder weichzeichnen
  können; sie schreibt hin, dass das Kernkraft-Szenario in diesem Lauf in **keiner einzigen**
  Ziehung gewinnt.

---

## 6 · Wo Klimaskeptiker die Story weiterhin zu Recht angreifen würden

- **Der publizierte Kipppunkt ist der günstigste von vier möglichen** (N1). Mit demselben
  Datensatz lässt sich 720 €/t begründen. Solange der Geltungsbereich fehlt, ist das eine
  angreifbare Flanke — und zwar dort, wo die Story ihre klimapolitisch stärkste Aussage macht.
- **Prüfschärfe weiter asymmetrisch** (N7/L3): acht von 22 Scrolly-Schritten prüfen
  Kernkraft-Kosten, null die Kostengeschichte der Erneuerbaren.
- **„genauso wahr"** bleibt eine 50:50-Gewichtung asymmetrischer Evidenz — nur diesmal zulasten
  der Kernkraft-Seite, was den Befund nicht besser macht.

---

## 7 · Urteil

**Die Klimadimension kommt an.** Aus einer Kostengeschichte mit acht Klimatreffern ist eine
Geschichte mit zwei Achsen geworden — Euro je Megawattstunde und Tonnen je Jahr, an jeder Zeile,
in jeder Tabelle, mit Prämisse im Prolog und vier Limitationskarten im Anhang. Alle fünf schweren
Befunde aus Runde 1 sind behoben. Für eine einzige Überarbeitungsrunde ist das ein sehr gutes
Ergebnis, und die Selbstkorrektur im Epilog hebt das Papier über den üblichen Standard.

**Die Zeitdimension kommt halb an.** Das Zieljahr steht jetzt überall, die Vorlaufzeit wird am
gesetzlichen Termin gemessen, die fehlende kumulative Bilanz ist als Limitation benannt. Aber die
Bausteine treffen sich nicht: Das Restbudget im Prolog und die 136 Mt/a in Akt 4 bleiben zwei
unverbundene Zahlen, das Warten wird nie in einer Größenordnung fühlbar, und der Epilog kennt am
Ende wieder nur zwei Hebel — beide auf den Preis, keiner auf die Menge. Das ist kein Loch mehr,
aber eine unfertige Naht.

**Die neue 47,5-€/t-Zahl ist richtig, aber zu glatt erzählt** — in beide Richtungen. Ihr
Geltungsbereich fehlt an den zwei Stellen, die die Geschichte tragen, und ihre eigentliche Brisanz
(der heutige Markt liegt schon darüber) wird nicht ausgesprochen.

**CCS ist ehrlich gerechnet, aber unehrlich platziert.** Die Vorbehalte sind erstklassig
formuliert und stehen fünfzehn Bildschirme hinter dem Ergebnis, das sie relativieren.

**Der 106-Mt-Gas-Pfad bekommt nirgends fälschlich das Etikett „klimaneutral".** Das ist sauber
gelöst. Was fehlt, ist der umgekehrte Satz: dass 107 Mt im Jahr 2045 gegen das Klimaschutzgesetz
gerechnet nicht knapp danebenliegen, sondern um das Zweieinhalbfache der gesamten nationalen Senke.

### Top-3 Must-Fix vor Veröffentlichung

**1 · Geltungsbereich an den Kipppunkt** (N1, stützt N6). Vier Wörter in Akt 4 Schritt 3 und
dieselben vier im Epilog: „im deterministischen Lauf", plus die Median-Zahl 92 €/t. Ohne das steht
eine 48 drei Zeilen unter einer 0 % und niemand kann beide zugleich verstehen. Kein neuer
Modelllauf nötig — die Verschiebung ist linear und exakt.

**2 · Einen Absatz, der 107 Mt gegen 2045 hält** (N2). Die Story hat das Zieljahr, sie hat die
Emissionen, sie hat die Prämissenkarte — sie stellt die Verbindung nicht her. Ein Absatz in Akt 4
Schritt 5 schließt die letzte echte Lücke dieses Reviews. Die Senkenzahl (−40 Mt für 2045) bitte am
KSG-Text prüfen, sie stammt aus meinem Gedächtnis und nicht aus den Projektdossiers.

**3 · Den Speicherstätten-Vorbehalt in die CCS-Karte holen** (N3). Ein Satz, wörtlich vorhanden in
`ccs_storage_availability` und im Whitepaper bereits am Zahlenwert platziert. Der Schritt, der die
Rangwahrscheinlichkeit von 45 auf 90 Prozent hebt, darf seinen wichtigsten Vorbehalt nicht erst im
Anhang tragen.

*Danach ist die Story aus Klimasicht freigabefähig.*
