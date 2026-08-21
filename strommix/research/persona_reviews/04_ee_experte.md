---
review: "Persona-Review 04 — Erneuerbare Energien / Marktdaten"
persona: "Expert:in erneuerbare Energien (Fraunhofer-/Agora-/BWE-Profil), Schwerpunkt Marktdaten PV, Wind on/offshore, Batteriespeicher, H2-Kette"
datum: "2026-08-19"
pruefobjekt:
  - "strommix-story.html (Hauptfokus)"
  - "whitepaper-strommix.html (Kap. 4/5/6 Stichproben, Kap. 7/9 mitgeprüft)"
faktenbasis:
  - "strommix/research/kosten_ee_speicher.md"
  - "strommix/research/story_claims_check.md"
  - "strommix/data/model_params.json"
  - "strommix/data/story_data.json"
  - "strommix/data/page_data.json"
  - "strommix/scripts/model.py, scripts/monte_carlo.py (eigene Nachrechnung)"
befunde: { kritisch: 3, hoch: 4, mittel: 7, niedrig: 6 }
---

# Persona-Review 04 · Erneuerbare Energien

## Gesamturteil

Die EE-Kostenbasis dieser Arbeit ist **fachlich auf der Höhe** — die Wind-onshore-CAPEX aus der
WindGuard-Erhebung, der Befund „Zelle ≠ System" bei Batterien, die Zurückweisung der
Offshore-Ausschreibungen als LCOE-Signal, die Elektrolyseur-Systemkosten von 2.100 €/kW (EU-Ist)
bis 3.120 €/kW (FfE-Vollkosten) und der H2-Round-Trip von 30–40 % sind korrekt, aktuell und in
beide Richtungen ehrlich gerechnet; die Startwert-Korrekturen im 30-Jahres-Plan (PV 126,6 statt
110 GW, Batterie 31 statt 15 GWh) sind Befunde zugunsten der EE, die das Papier selbst gefunden
hat. **Das Problem liegt nicht bei den Technologie-Zahlen, sondern eine Ebene darüber: bei der
Systemkosten-Zuordnung.** Die lineare Skalierung der 651 Mrd. € Netzkosten mit dem fEE-Anteil legt
dem Kernkraft-Szenario 7,5 €/MWh Netzkosten auf und dem 100-%-EE-Szenario 77,2 €/MWh — ein
undiskutierter Hebel von bis zu 70 €/MWh, der größer ist als jeder Befund, den die Story explizit
erzählt, und der die gesamte Rangfolge trägt.

**Empfehlung: Überarbeiten vor Veröffentlichung.** Drei Punkte müssen vor v1.0 fallen (Netzkosten-
Zuordnung offenlegen und aufsplitten, die falsche Aussage „trifft alle Szenarien gleichermaßen"
korrigieren, den Wind-Volllaststunden-Befund auf das Konfidenzniveau zurückstufen, das die eigene
Faktenbasis verlangt). Die übrigen Befunde sind Nachschärfungen, keine Blocker — die Story ist
gegenüber den EE **nicht schöngerechnet**, sondern an mehreren Stellen unnötig streng, ohne dass
das dem Leser gesagt wird.

---

## Befunde nach Schwere

### KRITISCH

---

#### K1 · Netzkosten werden vollständig dem EE-Anteil zugeschlagen — der größte einzelne Hebel der ganzen Rechnung, und er wird nirgends beziffert

**Fundstelle:** `strommix/scripts/model.py` 712–720; `strommix/data/model_params.json`
→ `system.grid.reference_fee_share`; Auswirkung sichtbar in Akt 4 (`strommix-story.html` 647–680)
und Akt 5 (Kostenkomponente `netz` = 38,6 €/MWh); Limitationstext
`whitepaper-strommix.js` 2349–2356.

**Ist:** Die Netzkosten werden als
`651 Mrd. € × CRF(WACC, 40 a) × fEE-Anteil` angesetzt, wobei der fEE-Anteil die Summe der
VRE-Energieanteile ist. Eigene Nachrechnung über `monte_carlo.build_presets` + `model.mix_system`
(Szenarioset „mittel", grid_variant „mid", CO₂ 75 €/t):

| Preset | fEE-Anteil | Netzkosten | Anteil am LSCOE |
|---|---|---|---|
| Kostenminimum (Kernkraft) | 0,189 | **7,5 €/MWh** | 4,0 % |
| Ist 2025 | 0,438 | 31,9 €/MWh | 23,3 % |
| 80 % EE + Gas | 0,919 | 36,7 €/MWh | 21,3 % |
| 80 % EE + H₂ | 0,919 | 51,5 €/MWh | 19,9 % |
| 100 % Erneuerbare | 1,649 | **77,2 €/MWh** | 24,2 % |

**Beanstandung:** Zwei Fehler in einem.

1. **Der Sockel fehlt.** Die 651 Mrd. € des IMK bestehen zu 323 Mrd. € aus **Verteilnetz**
   (`shared.netzkosten_referenzen`). Dieser Block ist ganz überwiegend
   *elektrifizierungsgetrieben* — Wärmepumpen, Ladeinfrastruktur, Industrieanschlüsse,
   Altersersatz — und fällt bei 950 TWh Jahresbedarf **unabhängig davon an, ob der Strom aus
   Reaktoren oder aus Windparks kommt**. Die lineare Formel lässt ihn bei fEE → 0 gegen null
   gehen. Ein Kernkraftsystem mit 950 TWh Bedarf bekommt so 7,5 €/MWh Netzkosten zugewiesen — das
   ist rund ein Viertel dessen, was das heutige deutsche System (Preset „Ist 2025": 31,9 €/MWh)
   bereits ausweist, bei fast doppeltem Bedarf. Das ist nicht konservativ, das ist falsch.
2. **Der Nenner ist die Überbauung, nicht die Last.** Im 100-%-Szenario liegt der Skalierungsfaktor
   bei 1,649 — das Szenario zahlt **165 % des gesamten nationalen Netzausbaubudgets**, weil
   abgeregelte Energie voll mitskaliert. Für Einspeisespitzen ist eine Kopplung an die installierte
   Leistung vertretbar; eine Kopplung an die *erzeugte, teilweise abgeregelte Energie* ist es nicht.

Der Effekt trägt die Kernaussage: Der Abstand Kostenminimum ↔ 80 % EE + Gas beträgt in den
publizierten Monte-Carlo-Medianen 19 €/MWh (161 vs. 142). Die Netzkostenregel allein erzeugt
zwischen diesen beiden Szenarien eine Differenz von **29,2 €/MWh zulasten der EE**. Der in Akt 4
erzählte „Rangwechsel um einen Platz" ist damit nicht das Ergebnis einer knappen Rechnung, sondern
ein Ergebnis, das *gegen* eine strukturell EE-feindliche Kostenzuordnung erzielt wurde. Das gehört
dem Leser gesagt — auch und gerade, weil es die eigene Schlussfolgerung stützt.

Dass die GES-Studie es genauso macht, ist als Argument für die Vergleichbarkeit gültig und als
Argument für die Richtigkeit nicht.

**Vorschlag:**
- Netzkosten in zwei Blöcke splitten: **mix-unabhängiger Sockel** (Verteilnetz 323 Mrd. €, IMK/
  Hans-Böckler 2025 — in `shared.netzkosten_referenzen` bereits getrennt vorhanden) und
  **fEE-getriebener Teil** (Übertragungsnetz 328 Mrd. € IMK bzw. 365–392 Mrd. € NEP 2037/2045
  V2025). Der Sockel geht in *jedes* Szenario, der zweite Block skaliert wie bisher.
- Als **Sensitivität** anbieten, nicht als stille Umstellung: Regler „Netzkosten-Zuordnung:
  linear mit fEE (GES-Konvention) ↔ Sockel + fEE-Anteil", damit der Vergleich mit GES erhalten
  bleibt.
- Skalierungsgröße von der Energie auf die **installierte VRE-Leistung** oder auf den fEE-Anteil
  *an der gedeckten Last* umstellen (abgeregelte Energie nicht doppelt bestrafen).
- Eine Limits-Karte in `strommix-story.html` (`renderLimits`, ab Z. 1950) ergänzen: „Netzkosten
  hängen vollständig am EE-Anteil" mit den drei Zahlen 7,5 / 36,7 / 77,2 €/MWh. Ein Satz in Akt 4
  Schritt 3 reicht: „Ein Viertel des Abstands zwischen den Szenarien stammt aus einer einzigen
  Zuordnungsregel für die Netzkosten."

*Quellen für die Korrektur:* IMK/Hans-Böckler-Stiftung, Netzinvestitionsbedarf bis 2045
(Übertragung 328 / Verteilung 323 Mrd. €), Quelle 23 im Story-Quellenverzeichnis; NEP Strom
2037/2045 V2025, 1. Entwurf (365–392 Mrd. €, nur Übertragungsnetz), Quelle 37.

---

#### K2 · „Kein Import/Export, kein Lastmanagement — und zwar alle gleichermaßen" ist sachlich falsch

**Fundstelle:** `whitepaper-strommix.js` 2344–2347 (Kap. 9, Liste „Bewusste Vereinfachungen");
mildere Variante in `strommix-story.html` 1972–1975 (Limits-Karte „Kein Import, kein
Lastmanagement"); Warntext in `model.py` 727–731.

**Ist (Whitepaper, wörtlich):** „Kein Import/Export, kein Lastmanagement. Beides existiert real und
würde das System entlasten. Die Vereinfachung ist damit *konservativ* — sie macht jedes Szenario
eher teurer, **und zwar alle gleichermaßen**."

**Beanstandung:** Der letzte Halbsatz ist der einzige Satz im ganzen Dokument, den ich als
inhaltlich unrichtig einstufe. Flexibilität und Interkonnektoren sind **Substitute für Speicher und
Backup**. Ihr Wert steigt mit der Residuallastvarianz — also überproportional mit dem VRE-Anteil.
Im Preset „Kostenminimum" (81 % Kernkraft-Bandlast) ersetzt verschiebbare Last fast nichts; im
Preset „100 % Erneuerbare" ersetzt sie Batterieleistung, Elektrolyseurleistung und
H₂-Rückverstromung — also genau die Posten, die dort zusammen 35,6 €/MWh der Kosten ausmachen. Die
Auslassung ist nicht neutral, sie ist ein Handicap für die EE-Pfade, und sie wird als Neutralität
verkauft.

Zweitens ist die Auslassung mengenmäßig groß: Die GES-Studie selbst setzt 20 GW Interkonnektoren
an — die Story zitiert das in ihrer eigenen Limits-Karte, ohne die Konsequenz zu ziehen, dass sie
selbst hinter der geprüften Studie zurückbleibt. Für die Nachfrageseite kommen Wärmepumpen,
Elektromobilität, Elektrolyse und Industrieprozesse hinzu, deren Verschiebepotenzial in deutschen
Systemstudien im zweistelligen GW-Bereich liegt.

Drittens ist die Formulierung in der Story („macht unsere Systemkosten eher zu hoch als zu
niedrig") zwar richtig, aber sie unterschlägt dieselbe Asymmetrie.

**Vorschlag:**
- Satz ersetzen durch: „Die Vereinfachung ist konservativ, aber **nicht symmetrisch**: Flexibilität
  und Import ersetzen Speicher und Backup und entlasten deshalb die EE-lastigen Szenarien deutlich
  stärker als das Kernkraft-Szenario. Der Vergleich fällt damit zulasten der Erneuerbaren aus."
- Mindestens eine grobe Sensitivität rechnen: 10–20 GW verschiebbare Last (oder eine
  Import-Obergrenze in Höhe der von GES angesetzten 20 GW) auf die drei EE-Presets, und das Delta
  als Zahl nennen — auch wenn es nur eine Überschlagsrechnung ist.
- In `strommix-story.html` denselben Halbsatz in die Limits-Karte übernehmen.

---

#### K3 · Der Wind-Volllaststunden-Befund wird als erwiesener Fehler erzählt, obwohl die eigene Faktenbasis ausdrücklich das Gegenteil verlangt

**Fundstelle:** `strommix-story.html` 452–467 (Akt 2 / Schritt 2). Faktenbasis:
`strommix/research/kosten_ee_speicher.md` Abschnitt 4, Absatz „Gegen-Einwand, der fairerweise
dazugehört".

**Ist (Story):** „Sie rechnet mit 1.700 h Volllaststunden — das ist der Schnitt der
*Bestandsflotte*, nicht der von Neuanlagen. […] In den Annahmen-Audits, die zu dieser Studie
kursieren, taucht dieser Hebel nicht auf — die Volllaststunden gelten dort als ‚plausibel'."

**Ist (Faktenbasis, wörtlich):** „**Gegen-Einwand, der fairerweise dazugehört:** Der Wert 1.700 h
könnte in der GES-Studie bewusst als *systemweiter Flottendurchschnitt 2045* gemeint sein (inkl.
Altanlagen, Abregelung, Einspeisemanagement). Ob das so ist, lässt sich ohne Volltext-Zugriff auf
Tabelle 4 der Studie **nicht entscheiden**. Der Punkt sollte im White Paper als offene Frage
formuliert werden, nicht als erwiesener Fehler."

**Beanstandung:** Das ist der stärkste Pro-EE-Befund der ganzen Story (er senkt Wind-LCOE um 29 %,
von 93,0 auf 65,9 €/MWh) — und er ist genau der Punkt, an dem er am angreifbarsten ist. Die Story
erzählt ihn ohne den Vorbehalt, den die eigene Recherche verpflichtend gemacht hat, und ohne
den Hinweis, dass die Studien-PDF nicht im Volltext geprüft werden konnte (was an anderer Stelle
sehr sauber offengelegt wird). Ein EE-Skeptiker braucht genau einen Satz, um die Passage zu
kippen: „In einem 2045er-Systemszenario ist ein Flottenwert inklusive Abregelung die richtige
Größe, nicht der Neuanlagen-Bestwert." Damit fällt nicht nur dieser Absatz, sondern die
Glaubwürdigkeit des Konfidenzsystems, das die Story als Alleinstellungsmerkmal führt.

Verschärfend: Wenn 1.700 h ein Flottenwert *inklusive Abregelung* ist, dann rechnet das eigene
Modell mit 2.400 h **ohne** expliziten Abregelungsabschlag auf der Erzeugungsseite — die Abregelung
entsteht im Dispatch, was methodisch richtig ist, aber der direkte Vergleich der beiden Zahlen
ist dann eben kein Vergleich gleicher Größen.

**Vorschlag:**
- Absatz umformulieren: „Wir lesen 1.700 h als Neuanlagenwert — dann ist es der Bestandsflottenwert
  und der Hebel ist groß. Es ist aber möglich, dass die Studie damit einen systemweiten
  Flottendurchschnitt 2045 inklusive Altanlagen und Abregelung meint. Ohne Volltextzugriff auf
  Tabelle 4 lässt sich das nicht entscheiden — deshalb steht der Befund hier als **offene Frage**,
  nicht als Fehler."
- Konfidenzstufe des Befunds in `story_data.json` von der impliziten Faktenlage auf **B/offen**
  setzen und im Datentabellen-Twin zu Akt 2 sichtbar machen.
- Den Satz über die „Annahmen-Audits, die zu dieser Studie kursieren" streichen oder belegen — er
  behauptet ein Versäumnis Dritter auf Basis einer nicht zitierten Quelle.

---

### HOCH

---

#### H1 · Die gesamte Dunkelflauten-Statistik hängt an einem Gaskraftwerksbetreiber — und mischt zwei unvereinbare Definitionen

**Fundstelle:** `strommix/data/page_data.json` → `dunkelflaute`; Darstellung
`whitepaper-strommix.html` 732–746 (Kap. 7, Tabelle Häufigkeit + Untertitel „Batterien überbrücken
zuverlässig bis etwa 10 Stunden"); Story-Glossar `strommix-story.html` 958–968.

**Ist:** Fünf von sechs Häufigkeitszeilen stammen aus „Uniper Kurzstudie 2026", die sechste aus
„LBBW 2025". Der Satz „Ereignisse über 10 h können von Batteriespeichern nicht zuverlässig
überbrückt werden" trägt Konfidenzstufe **A** und die Quelle Uniper. Die Definitionstabelle führt
DWD/LBBW (10 % der **Nennleistung**, Mindestdauer **48 h**) und Uniper (10 % der **installierten**
Leistung, 6-h-Glättung, Mindestdauer **10 h**) nebeneinander.

**Beanstandung:** Drei Probleme.
1. **Interessenlage.** Uniper ist Betreiber genau der Gas- und Backup-Kapazitäten, deren
   Notwendigkeit die Studie begründet. Das disqualifiziert die Zahlen nicht, aber eine Konfidenz „A"
   („institutionelle Primärquelle") ist für eine Betreiber-Kurzstudie die falsche Stufe — die Story
   selbst definiert C als „Branchen-/Markt-/Beratungsquelle". Für die Kernkraftseite wird diese
   Sorgfalt konsequent angewandt (Koomey/Gilbert als Gegenkritik zu Lovering, „Beipackzettel" zum
   umstrittenen Datensatz); auf der EE-kritischen Seite fehlt sie.
2. **Definitionsmischung.** Die Häufigkeitstabelle stellt Werte aus beiden Definitionen in **eine**
   Spalte. Das Kapitel erklärt vorbildlich, dass die Definition alles entscheidet — und verletzt die
   eigene Erkenntnis eine Tabelle später.
3. **Innere Inkonsistenz.** 48-h-Ereignisse: 2–3 pro Jahr. 72-h-Ereignisse: 2 pro Jahr. Eine
   Häufigkeitsverteilung, die von 48 h auf 72 h praktisch nicht abfällt, ist physikalisch
   unplausibel und deutet auf eine Vermischung von Quellen oder Definitionen hin.

**Vorschlag:**
- Konfidenz der Uniper-Werte auf **C** (bzw. B mit Interessenhinweis) zurückstufen und im Text eine
  Zeile ergänzen: „Uniper ist Betreiber konventioneller Backup-Kapazität — die Zahlen sind
  plausibel, aber nicht interessenneutral erhoben."
- Häufigkeitstabelle nach Definition **spalten** (DWD/LBBW-Definition | Uniper-Definition), nicht
  nach Dauer mischen. Die 48/72-h-Inkonsistenz auflösen oder als Widerspruch kennzeichnen.
- Eine unabhängige Gegenreferenz beschaffen (DWD-basierte Auswertungen, Fraunhofer ISE
  Energy-Charts, ENTSO-E ERAA, Agora Energiewende) — für ein Papier, das den einzigen globalen
  Kernkraft-Kostendatensatz zu Recht mit einem Pflicht-Beipackzettel versieht, ist eine
  einquellige EE-Kritik ein doppelter Standard.
- Den Satz „Batterien überbrücken zuverlässig Stunden, nicht Tage" (Story-Glossar) mit der
  eigenen Faktenbasis abgleichen: In `kosten_ee_speicher.md` 6 steht mit Klostermansfeld ein
  Projekt mit 1.000 MW / bis 5.700 MWh — das sind ~5,7 h Entladedauer, nicht 4 h und nicht 10 h.
  Die relevante Größe ist die **Energie**, nicht eine Dauerklasse.

---

#### H2 · Batteriekosten: ein US-Report bestimmt den deutschen Systemwert, und die Spanne ist nach unten zu eng

**Fundstelle:** `strommix/data/model_params.json` → `technologies.battery`;
`shared.lcoe_benchmarks.battery`; `thirty_year_plan.learning_curves.battery_eur_kwh.counter_evidence`;
`kosten_ee_speicher.md` Abschnitt 6.

**Ist:** CAPEX schlüsselfertig 4 h Europa: 180 / 210 / 260 €/kWh (Konfidenz B). LCOS-Referenz
193–269 €/MWh aus Lazard LCOE+ v19.0 (Konfidenz **A**). `cost_trend`: „+27 % seit 2020, steigend,
Quelle lazard-2026, Konfidenz A, Note: Trendumkehr — keine automatische Lernkurven-Extrapolation
nach unten annehmen."

**Beanstandung:** Der Befund „Zelle ≠ System, Faktor 2,5–3" ist **richtig und wichtig** — das ist
der Punkt, an dem die EE-Debatte regelmäßig schöngerechnet wird, und die Arbeit hält ihn korrekt
dagegen. Die Übertragung des *Trends* ist aber eine geographische Fehlanwendung: Lazards LCOE+ ist
ein **US-Marktreport**; die genannten Treiber der Verteuerung (Zölle, Lieferkettendruck,
Rechenzentrumsnachfrage, Zinsniveau) sind ganz überwiegend US-spezifisch — insbesondere die
Section-301-/IRA-Zollstruktur auf chinesische Zellen, die in der EU so nicht existiert. Die
europäischen Turnkey-Preise sind im selben Zeitraum von chinesischen LFP-Systempreisen getrieben
gefallen. Die eigene Faktenbasis zeigt das sogar: Sie nennt in derselben Tabelle „BNEF ~177 €/kWh
(2025)" — **unterhalb des eigenen Modellminimums von 180 €/kWh**. Eine min/mid/max-Spanne, deren
Minimum bereits von einem zitierten Marktwert unterschritten wird, ist keine Spanne, sondern eine
Untergrenzenverletzung.

Konsequenz im Modell: Die Batterie schlägt im 2056-Fall mit 9,7 €/MWh zu Buche, im
Monte-Carlo-Preset ee80_gas trägt sie 40 GW/160 GWh. Der Fehler ist einzeln klein; er addiert sich
aber zu K1 und H3 zu einer durchgängig EE-strengen Modellkalibrierung.

**Vorschlag:**
- `cost_trend` mit **geographischer Abgrenzung** versehen: „gilt für den US-Markt (Lazard v19);
  für Europa liegt keine vergleichbare institutionelle Zeitreihe vor." Konfidenz für die
  *Übertragbarkeit auf DE* auf C setzen.
- CAPEX-Spanne nach unten öffnen auf ca. **150 €/kWh** (mind. bis zum eigenen BNEF-Vergleichswert
  von 177 €/kWh) und die Herkunft der Untergrenze kennzeichnen — analog zur bereits vorbildlichen
  Behandlung der PV-CAPEX-Untergrenze („stammt aus einer kommerziellen Branchenquelle, nicht aus
  einer institutionellen Erhebung").
- Die LCOS-Referenz 193–269 €/MWh **nicht** als deutsche Speicherkosten führen. Sie enthält
  Ladestromkosten und ist damit nicht mit den CAPEX-basierten Systemkosten des eigenen Modells
  kompatibel — im Modell wird der Ladestrom über den Dispatch bereits bezahlt. In der aktuellen
  Fassung ist das sauber getrennt; die Trennung sollte aber explizit im Datensatz stehen, damit
  sie beim nächsten Umbau nicht verlorengeht (Doppelzählungsrisiko).
- Endwert der Lernkurve (120 €/kWh 2056) ist als Setzung markiert — das ist korrekt. Der Verdikt-
  Text „liegt unterhalb der heutigen Systemkosten-Untergrenze" wird allerdings falsch, sobald die
  Untergrenze auf 150 korrigiert ist. Mitziehen.

---

#### H3 · Das Halbjahresprofil Juli–Dezember ist der für EE ungünstigste denkbare Ausschnitt — die Richtung wird nur für „Backup-Mengen" benannt, nicht für die Rangfolge

**Fundstelle:** `shared.profiles_meta` (4.416 von 8.784 h, 01.07.–31.12.2024, `wind_offshore_mw`
und `hydro_ror_mw` komplett fehlend); Limits-Karte `strommix-story.html` 1951–1954;
`monte_carlo_headline.caveat`.

**Ist:** Der abgedeckte Zeitraum enthält 45,2 % der Jahres-PV-Energie und 48,4 % der
Wind-onshore-Energie, aber 50,1 % der Last. Die Limits-Karte sagt: „Der Zeitraum ist winterlastig —
die Backup-Mengen werden dadurch eher über- als unterschätzt."

**Beanstandung:** Die Aussage ist richtig, aber zu eng. Ein Winterhalbjahr enthält **den
Sommerüberschuss nicht, aus dem der Saisonspeicher befüllt wird**. Genau deshalb muss das Modell im
100-%- und im 80-%-H₂-Preset mit einem gesetzten Anfangsfüllstand (`h2_initial_fill_share = 1.0`)
arbeiten, dessen Erzeugungskosten außerhalb des Zeitraums liegen und deshalb fehlen — `model.py`
weist das korrekt als Untergrenze aus. Der Nettoeffekt auf die **Rangfolge** ist trotzdem nicht
neutral: Die Szenarien, deren Ökonomie von der saisonalen Umverteilung lebt, werden auf einem
Ausschnitt beurteilt, in dem diese Umverteilung nicht stattfindet. Für das Kernkraft-Preset
(Bandlast, 81 % Erzeugungsanteil) ist die Jahreszeit weitgehend irrelevant.

Der Story-Text präsentiert die Monte-Carlo-Rangfolge in Akt 4 dennoch als belastbares Ergebnis
(„Das Kernkraft-Szenario liegt im Median bei …, der gasgestützte 80-Prozent-Pfad bei …").

**Vorschlag:**
- Limits-Karte ergänzen: „Der Ausschnitt enthält den Sommerüberschuss nicht, aus dem saisonale
  Speicher befüllt werden. Das trifft die wasserstofflastigen Szenarien systematisch härter als
  das Kernkraft-Szenario — die Rangfolge in Akt 4 ist deshalb gegenüber den EE-Pfaden eher zu
  streng als zu freundlich."
- In Akt 4 Schritt 3 einen Halbsatz mit demselben Inhalt setzen; die Aussage stützt die eigene
  Schlussfolgerung („nicht trennscharf") und kostet nichts.
- Priorität für die Beschaffung eines Volljahresprofils hochziehen — die Architektur ist laut
  `profiles_meta.architecture_note` bereits darauf vorbereitet. Solange das fehlt, sind alle
  Aussagen zu Saisonspeicherbedarf und H₂-Kette Näherungen, keine Befunde.

---

#### H4 · Die Kavernen-Restriktion fehlt vollständig — obwohl sie in der Faktenbasis steht und der härtere Engpass ist als der Round-Trip

**Fundstelle:** Fehlt in `strommix-story.html` und `whitepaper-strommix.html` (Volltextsuche
„Kavern" ohne Treffer). Vorhanden in `kosten_ee_speicher.md` 7.2 und
`model_params.json` → `technologies.h2_storage`.

**Ist (Faktenbasis, ungenutzt):** Umwidmungspotenzial deutscher Erdgas-Kavernen ≈ **30 TWh_H2**
(EWI, Konfidenz B); Bedarf DE 2045 **> 100 TWh** (EWI, Konfidenz B); Kapazität je Kaverne 35–140 GWh;
Speicherkosten 0,66–1,75 €/kg, Hauptkostentreiber die Zyklenzahl (Faktor 7,8 zwischen hoher und
niedriger Auslastung); für den Saisonfall gilt konsequenterweise das teure Ende (105 €/MWh_H₂ im
Modell).

**Beanstandung:** Die Story erzählt die H₂-Kette ausschließlich über den Round-Trip-Wirkungsgrad
(`cp_h2_physics`). Das ist korrekt, aber es ist der **weichere** Engpass — Wirkungsgrad kostet
Überkapazität, also Geld. Das Speichervolumen ist eine **Mengenrestriktion**: 30 TWh
Umwidmungspotenzial gegen > 100 TWh Bedarf 2045 ist eine Lücke von Faktor 3, und die eigentliche
Bindung liegt in der Bau- und Genehmigungsrate von Neukavernen (Sole-Entsorgung, Standorte,
Vorlaufzeiten). Das gehört in eine Geschichte, die den 100-%-EE-Pfad ernsthaft prüft.

Zugleich — und das ist die Gegenrichtung, die genauso fehlt — sind **30 TWh nicht das geologische
Potenzial**, sondern nur das Umwidmungspotenzial des Bestands. Wer die Zahl ohne diese Abgrenzung
zitiert, produziert dasselbe Missverständnis, das die Story bei den Kernkraft-Kostenabgrenzungen
(OCC/EPC/FOAK) zu Recht so sorgfältig auseinandersortiert. Die Story hat für diesen Fehlertyp
bereits ein Format: den Beipackzettel.

**Vorschlag:**
- Neuen Beipackzettel `cp_h2_storage` neben `cp_h2_physics` (Story Z. 697) setzen, Wortlaut etwa:
  „Neben dem Wirkungsgrad steht eine Mengenfrage: Das Umwidmungspotenzial bestehender
  Erdgas-Kavernen liegt bei rund 30 TWh Wasserstoff, der Bedarf für 2045 wird auf über 100 TWh
  geschätzt. Die 30 TWh sind allerdings kein geologisches Limit, sondern der Bestand — neue
  Kavernen sind möglich, brauchen aber Standorte, Sole-Entsorgung und rund ein Jahrzehnt Vorlauf.
  Die Restriktion ist damit eine **Bau- und Genehmigungsrate**, keine Geologie."
- Die im Modell bereits korrekt umgesetzte Logik „Saisonspeicher = eine Zyklenzahl pro Jahr = teures
  Ende der Spanne" im Whitepaper Kap. 5 sichtbar machen. Das ist ein methodisch starkes Argument,
  das die Arbeit derzeit verschenkt.

*Quelle für die Korrektur:* EWI, Analyse untertägige Wasserstoffspeicher (2024) — bereits als
Faktenbasis in `kosten_ee_speicher.md` 7.2 vorhanden, aber nicht im Story-Quellenverzeichnis
geführt.

---

### MITTEL

---

#### M1 · PV-Vergleich nur gegen das billigste Segment

**Fundstelle:** `strommix-story.html` 437–451 (Akt 2 / Schritt 1);
`shared.lcoe_benchmarks.pv_freiflaeche`.

**Ist:** Studienwert 124,9 €/MWh wird gegen „Fraunhofer ISE für Freiflächenanlagen 41–69 €/MWh"
gestellt.

**Beanstandung:** Die eigene Faktenbasis (`kosten_ee_speicher.md` 3) führt daneben „LCOE PV gesamt,
alle Typen: 3,12–11,01 ct/kWh" aus derselben ISE-Ausgabe. Wenn die GES-Annahme (1.500 €/kW,
940 h) einen Portfoliowert inklusive Dachanlagen abbilden soll, ist die Freiflächenspanne der
falsche Maßstab. Der Befund hält auch gegen die volle Spanne — 124,9 liegt über 110,1 — aber die
selektive Gegenüberstellung liefert einem Kritiker die Cherry-Picking-Vorlage frei Haus, und zwar
ohne Not.

**Vorschlag:** Beide Bänder nennen: „ISE nennt für Freiflächenanlagen 41–69 €/MWh und für PV über
alle Anlagentypen 31–110 €/MWh. Selbst gegen die obere Grenze der breiten Spanne liegt der
Studienwert darüber."

---

#### M2 · „Zuschlagswerte sind eher Ober- als Untergrenze" — die Gegeneffekte fehlen

**Fundstelle:** `strommix-story.html` 444–450; `shared.lcoe_benchmarks.pv_freiflaeche.auction.note`.

**Ist:** „Das sind Zuschlagswerte, keine Vollkosten — aber sie sind eher eine Ober- als eine
Untergrenze dessen, was Betreiber brauchen."

**Beanstandung:** Die Faktenbasis begründet das mit dem 20-Jahres-Förderzeitraum bei 30+ Jahren
Anlagenlaufzeit — das ist stichhaltig. Ungenannt bleiben drei Effekte, die in die **andere**
Richtung wirken und die ein Marktakteur sofort einwendet:
(a) § 51 EEG — keine Förderzahlung in Stunden mit negativen Preisen; der Bieter muss diesen Ausfall
einpreisen, der anzulegende Wert steigt dadurch;
(b) sinkende Marktwertfaktoren durch Kannibalisierung — die erwarteten Zusatzerlöse nach Förderende
sind nicht die heutigen;
(c) Rückbaurückstellungen und Flächenpacht, die in Vollkostenrechnungen enthalten sind.
Eine einseitige Interpretationsrichtung ist bei einer Kennzahl, die als Kronzeuge der EE-Seite
auftritt, riskant.

**Vorschlag:** Halbsatz ergänzen: „In die Gegenrichtung wirken die Nullvergütung bei negativen
Preisen (§ 51 EEG) und die sinkenden Marktwertfaktoren — beides erhöht den Wert, den ein Bieter
braucht. Netto bleibt der Zuschlagswert ein Plausibilitätskorridor, keine LCOE-Substitution."

---

#### M3 · Marktwertfaktoren, Profilkosten und negative Preise kommen im gesamten Projekt nicht vor

**Fundstelle:** Volltextsuche „Marktwert", „Profilkost" über `strommix-story.html`,
`whitepaper-strommix.html`, `story_data.json`, `model_params.json`, `kosten_ee_speicher.md` —
**null Treffer**.

**Beanstandung:** Methodisch ist das vertretbar: Das LSCOE internalisiert die Profilproblematik über
Dispatch, Speicher, Abregelung und Backup — eine zusätzliche Profilkostenkorrektur wäre
Doppelzählung, und `model_params.json` warnt an anderer Stelle (`double_counting_warning`) korrekt
davor. Für die **Leserführung** ist die Lücke trotzdem ein Problem: Die Story macht die
Ausschreibungsergebnisse (49,4 €/MWh PV, 50,6 €/MWh Wind) zum Ankerwert, ohne zu erklären, dass
diese Erzeugung nicht zu diesem Wert am Markt platziert werden kann. Damit steht der zentrale
Einwand der Systemkosten-Debatte — „EE sind billig, EE-Strom zur richtigen Stunde ist es nicht" —
im Text nicht, obwohl die Story ihn im Modell beantwortet.

**Vorschlag:** Einen Glossareintrag `gl-marktwert` (Marktwertfaktor / Profilkosten / negative
Preise) ergänzen und in Akt 2 Schritt 1 einmal darauf verlinken. Kernsatz: „Ein Zuschlagswert von
49 €/MWh heißt nicht, dass diese Kilowattstunde am Markt 49 € wert ist. Genau diese Differenz ist
der Grund, warum diese Story mit LSCOE statt mit LCOE rechnet — sie ist dort bereits enthalten und
darf nicht zusätzlich aufgeschlagen werden."

---

#### M4 · Der Beipackzettel-Apparat ist einseitig gebaut

**Fundstelle:** `story_data.json` → `must_show_counterpositions` (8 Einträge); Einbindung in
`strommix-story.html` 347, 523–524, 602–603, 696–697, 801.

**Ist:** Von acht Gegenpositionen argumentieren fünf zugunsten der Kernkraft oder gegen die
EE-Erzählung (`cp_wacc_both_ways`, `cp_construction_time`, `cp_eu_references`, `cp_ges_opex`,
`cp_h2_physics`), zwei sind gemischt (`cp_korea_both_ways`, `cp_transparency`), und
**`cp_ee_risks` listet ausschließlich EE-Risiken**. Es gibt keine einzige Gegenposition, die
*zugunsten* der Erneuerbaren gegen die Studie oder gegen die eigene Rechnung argumentiert.

**Beanstandung:** Das ist umso auffälliger, als die Haupterzählung in Akt 2 klar zugunsten der EE
korrigiert. Die Beipackzettel sind das Format, mit dem die Story ihre Fairness demonstriert — und
in genau diesem Format kommt die EE-Seite nur als Risikoträger vor. Ein EE-Verband liest das als
strukturelle Schlagseite, und er hat formal recht.

**Vorschlag:** Einen Eintrag `cp_ee_chancen` ergänzen, mit Material, das komplett in der eigenen
Faktenbasis liegt:
- Repowering hebt den Ertrag bestehender Standorte deutlich, ohne neue Fläche (der 30-Jahres-Plan
  behandelt Repowering bisher nur als Kostenposten, nie als Ertragshebel);
- Hybrid-Parks / Co-Location (PV + Wind + Batterie an einem Netzanschluss) senken
  Netzanschlusskosten und Anschlussleistungsbedarf — im Modell und im Text gar nicht vorhanden;
- der eigene Befund `thirty_year_plan.lscoe_2056.flh_finding`: Mit Neuanlagen-Volllaststunden
  schrumpft die Deckungslücke von 17 % auf 1 % — ausdrücklich als „Befund ZUGUNSTEN des Plans, den
  das MD selbst verschenkt" markiert und in der Story nur beiläufig verwendet;
- europäische Fertigungskapazität für Elektrolyseure auf 13,1 GW/a gestiegen, Kosten 2025
  zweistellig gefallen (`kosten_ee_speicher.md` 7.1).

---

#### M5 · „Die anderen Pfade kaum, weil ihre Faktoren nahe bei 1 liegen" — stimmt so nicht

**Fundstelle:** `strommix-story.html` 670–673 (Akt 4 / Schritt 4);
`shared.kostenueberschreitung_faktoren.technologien`.

**Ist:** Text: „Legt man diese Empirie auf alle Technologien, rutscht das Kernkraft-Szenario auf …
— die anderen Pfade kaum, weil ihre Faktoren nahe bei 1 liegen."

**Beanstandung:** Solar 1,01 — ja. Wind aber **1,13**, Übertragungsnetz **1,08** (beide Flyvbjerg,
Konfidenzstufe A). In EE-lastigen Szenarien sind Wind und Netz zusammen der größte Kostenblock
(im 2056-Fall 90,6 von 162,8 €/MWh). Entsprechend steigt der Median des Presets ee80_gas im
Overrun-Lauf von 141,8 auf 152,5 €/MWh — **+7,5 %**, nicht „kaum". Die Formulierung schont die
EE-Seite; angesichts der Sorgfalt, mit der das Papier sonst Asymmetrien offenlegt, fällt sie auf.

**Vorschlag:** Ersetzen durch: „Die EE-Pfade steigen ebenfalls, aber deutlich schwächer — der
gasgestützte 80-Prozent-Pfad um 7,5 Prozent, weil Wind mit 1,13 und Netzausbau mit 1,08 in die
Rechnung gehen. Nur Solar liegt mit 1,01 wirklich bei eins."

---

#### M6 · Drei Dubletten im Quellenverzeichnis, zwei davon mit widersprüchlicher Konfidenzstufe — eine betrifft den Batterie-Anker

**Fundstelle:** `story_data.json` → `sources`, Einträge 17/18, 24/25, 30/32.

**Ist:**
| # | ID | Konfidenz |
|---|---|---|
| 17 | `ges-studie-2026` — „Der klimaneutrale Strommix der Zukunft", GES, 2026-07 | **A** |
| 18 | `ges-study` — „Der klimaneutrale Strommix der Zukunft", GES, 2026-07 | **C** |
| 24 | `irena-2024` — „Renewable Power Generation Costs in 2024", IRENA, 2025-07 | B |
| 25 | `irena-rpgc-2024` — identischer Titel, identisches Datum | B |
| 30 | `lazard-2026` — „LCOE+ v19.0", Lazard, 2026-07-13 | **B** |
| 32 | `lazard-lcoe-19` — „LCOE+ v19.0", Lazard, 2026-07 | **A** |

**Beanstandung:** Dieselbe Quelle trägt zwei verschiedene Konfidenzstufen. Bei Lazard v19.0 ist das
unmittelbar EE-relevant: Es ist die Quelle für die Batterie-LCOS **und** für die Aussage
„Speicherkosten seit 2020 um 27 % gestiegen" — also für den zentralen EE-kritischen Kostentrend.
Die Story macht ihr Konfidenzsystem im Hero („korrigierte Claims / verworfene / Setzungen") und in
einem eigenen Anhangskapitel zum Qualitätsversprechen. Ein Verzeichnis, das dasselbe Dokument
einmal als A und einmal als B führt, beschädigt genau dieses Versprechen.

**Vorschlag:** Dubletten in `build_story_data.py` zusammenführen, kanonische ID festlegen,
Konfidenz je Quelle **einmal** vergeben. Für Lazard v19.0 empfehle ich **B** mit Zusatz
„US-Marktreport, Übertragbarkeit auf DE nicht geprüft" (siehe H2). Eine Assertion in
`assertBindings()` (Story Z. 2006 ff.) auf „keine doppelten Quellen-IDs/Titel" wäre billig zu haben.

---

#### M7 · Keine einzige EE-Institutionsquelle im Verzeichnis

**Fundstelle:** `story_data.json` → `sources` (44 Einträge).

**Ist:** Für die Kernkraftseite: Lovering, Grubler, Koomey, Gilbert, IEA/NEA, Flyvbjerg,
Sovacool & Ryu, Cour des Comptes, EDF, NucNet, EIA, IAEA-PRIS-Ableitungen — ein dichtes,
teils gegenläufiges Quellennetz. Für die EE-Seite: Fraunhofer ISE (Ausgabe 07/2024), BNetzA
(Ausschreibungen), IRENA, BNEF, ITRPV, WindGuard, FfE, Lazard.

**Beanstandung:** Es fehlen **Agora Energiewende** (die Standardreferenz für deutsche
Systemstudien, Flexibilität, Marktwerte), **Fraunhofer IEE** (Netz- und Systemsimulation),
**BWE/BSW** (Branchenerhebungen), **ENTSO-E / Energy-Charts** (Erzeugungs- und Handelsdaten). Die
Systemkosten-Debatte wird damit weitgehend ohne die Institutionen geführt, die sie in Deutschland
führen. Für die Kernkraft ist der einzige globale Datensatz mit einem Pflicht-Beipackzettel und
zwei Gegenkritiken versehen — für die EE-Systemseite gibt es kein vergleichbares Korrektiv.
Zusätzlich: Die ISE-Ausgabe 07/2024 ist zum Publikationsstand (08/2026) rund zwei Jahre alt und
trägt trotzdem durchgängig Konfidenz A; ob eine neuere Ausgabe vorliegt, sollte vor v1.0 geprüft
werden.

**Vorschlag:** Mindestens eine unabhängige EE-Systemstudie als Gegenreferenz zu den eigenen
LSCOE-Ergebnissen aufnehmen und im Fazit einordnen („andere Systemstudien kommen für einen
EE-dominierten Pfad auf X–Y €/MWh; unser Wert liegt darüber, weil …"). Der Aktualitätsstand der
ISE-Quelle gehört in eine Fußnote.

---

### NIEDRIG

---

**N1 · Round-Trip-Umrechnung um 6 % zulasten EE gerundet.**
`must_show_counterpositions` → `cp_h2_physics`: „zweieinhalb bis dreieinhalb Kilowattstunden".
Faktenbasis (`kosten_ee_speicher.md` 7.3): „2,5–3,3 kWh". 1/0,30 = 3,33. → „dreieinhalb" auf
„gut drei" ändern.

**N2 · Die PV-Volllaststunden der Studie werden nicht geprüft, obwohl derselbe Hebel bei Wind der
Kern von Akt 2 ist.** GES setzt 940 h an; die eigene Modellspanne für Freiflächen-PV ist
950–1.150 h (`model_params.json`). Der Wert liegt also **unterhalb der eigenen Untergrenze** und
wird in Akt 1 Schritt 3 (Story Z. 390–392) nur als Kontrast zu 8.000 h Kernkraft gezeigt. Ein
Halbsatz in Akt 2 Schritt 1 stellt die Symmetrie her — und zwar zugunsten der EE.

**N3 · Wind-onshore-Volllaststunden für Neuanlagen (2.200/2.400/3.000 h) tragen Konfidenz B ohne
direkte Primärquelle.** Die Faktenbasis nennt „im Mittel über 2.400 h (normalisiert), Bandbreite
2.000–3.000" ohne Zitatstelle, während für die CAPEX derselben Technologie WindGuard 2025 sauber
mit Haupt- und Nebenkosten aufgeschlüsselt ist. Da dieser Parameter K3 trägt, sollte er die
belastbarste verfügbare Quelle bekommen; moderne Schwachwindanlagen erreichen an guten Standorten
Werte oberhalb der angesetzten Obergrenze.

**N4 · Offshore läuft auf dem Onshore-Profil.** Korrekt als Übergangslösung und als konservativ
gekennzeichnet (`model_params.json` → `wind_offshore.profile_note`, Limits-Karte Story
Z. 1981–1984). Nicht beziffert ist die Größenordnung: Offshore trägt im 2056-Fall 25,3 €/MWh, und
die fehlende Glättung erhöht Backup- und Speicherbedarf in allen EE-Presets. Eine Überschlagszahl
würde reichen.

**N5 · Batterie-Glossar zu grob.** „Batteriespeicher überbrücken zuverlässig Stunden, nicht Tage"
(Story Z. 964–965). Richtig als Größenordnung, aber die eigene Faktenbasis nennt mit
Klostermansfeld (1.000 MW / bis 5.700 MWh) ein Projekt mit ~5,7 h Entladedauer. Der Satz sollte auf
die Energiegröße abstellen: Ein 48-h-Winterereignis braucht laut eigener Faktenbasis 3,5–4,0 TWh —
das Zwei- bis Dreihundertfache des heutigen deutschen Speicherbestands von 31 GWh. Das ist das
stärkere und ehrlichere Argument.

**N6 · Hybrid-Parks / Co-Location fehlen komplett** (Volltextsuche „Hybrid" — null Treffer in allen
geprüften Dateien). Gemeinsame Netzanschlüsse für PV + Wind + Batterie sind in Deutschland
inzwischen Standardpraxis im Projektgeschäft und senken sowohl Anschluss-CAPEX als auch die
benötigte Anschlussleistung — also genau die Größe, an der in diesem Modell die Netzkosten hängen
(siehe K1). Gehört mindestens in die Limits.

---

## Was fachlich stimmt und ausdrücklich stehen bleiben soll

Damit die Kritik einzuordnen ist — diese Punkte sind aktueller Marktstand und korrekt dargestellt:

- **Elektrolyseur-Systemkosten.** GES 1.760 €/kW gegen EU-Ist 2.075 (Alkali) / 2.196 (PEM) €/kW und
  FfE-Vollkostenrechnung 3.120 €/kW. Die Zurückweisung des kursierenden Vorwurfs „der Markt liegt
  bei 800–1.500" als Verwechslung von Stack-/Hardwarepreis mit Systemkosten ist **richtig**, gut
  belegt und in der Debatte selten so sauber gemacht. Die Schlussfolgerung „die Studie rechnet hier
  eher zu günstig als zu teuer" ist ein Befund *gegen* das eigene Narrativ und steht trotzdem da —
  das ist genau die Fairness, die das Papier beansprucht.
- **H₂-Round-Trip 30–40 %** und die daraus folgende Überkapazität: physikalisch korrekt, richtig
  hergeleitet, nicht kleingeredet.
- **Saisonspeicher = eine Zyklenzahl pro Jahr = teures Ende der EWI-Spanne** (105 €/MWh_H₂ statt
  36). Methodisch stark und in EE-freundlichen Rechnungen häufig unterschlagen.
- **Zelle ≠ System, Faktor 2,5–3.** Das notwendige Gegengewicht gegen das
  „Batterien-kosten-nur-noch-70-Dollar"-Argument. Uneingeschränkt richtig.
- **Deutsche Offshore-Ausschreibungen taugen nicht als LCOE-Signal** (Null-Cent-Gebote mit
  dynamischem Bieterverfahren, Zahlungen *an* den Staat). Präzise, und von beiden Lagern regelmäßig
  falsch verwendet.
- **Wind-onshore-CAPEX 1.790 €/kW** aus WindGuard 2025 (1.240 Haupt- + 550 Nebeninvestition):
  saubere, aktuelle, institutionelle Quelle.
- **Ist-Stand-Korrekturen im 30-Jahres-Plan** (PV 126,6 statt 110 GW; Batterie 31,0–31,5 GWh statt
  15 GWh, mit ausdrücklicher Abgrenzung „alle Größenklassen inkl. Heimspeicher"; Bedarf 518 statt
  560 TWh): Korrekturen zugunsten der EE, mit MaStR-Grundlage und Abgrenzungshinweis.
- **Fehlende Ersatz-/Repowering-Investitionen (≈ 208 Mrd. €)** im 30-Jahres-Plan: berechtigter und
  wichtiger Befund. Dass eine Phase „Konsolidierung & Repowering" heißt und keinen Euro dafür
  enthält, ist ein echter Fund.
- **Der Nenner-Fehler im 2056-LSCOE** (Kosten geteilt durch Bedarf statt durch Erzeugung,
  121,5 → 145,7 €/MWh): sauber nachgerechnet und korrekt eingeordnet.

---

## Top-3 Must-Fix

1. **K1 — Netzkosten-Zuordnung offenlegen und aufsplitten.** Die lineare fEE-Skalierung erzeugt
   7,5 €/MWh Netzkosten im Kernkraft-Szenario gegen 36,7 im 80-%-EE-Pfad und 77,2 im
   100-%-Pfad — und damit den mit Abstand größten Einzelhebel der Rechnung. Verteilnetzsockel
   (323 Mrd. €, IMK) als mix-unabhängig herausnehmen, Sensitivität anbieten, Zahlen in Story und
   Limits sichtbar machen. Ohne diesen Fix ist die Rangfolge in Akt 4 nicht interpretierbar.
2. **K2 — Die Aussage „trifft alle Szenarien gleichermaßen" streichen.** Fehlende Flexibilität und
   fehlender Import treffen VRE-lastige Szenarien systematisch härter, weil sie dort Speicher und
   Backup ersetzen. Der Satz steht wörtlich in Kap. 9 des Whitepapers und ist der einzige
   sachlich unrichtige Satz, den ich gefunden habe. Ergänzend eine Überschlags-Sensitivität mit
   10–20 GW verschiebbarer Last.
3. **K3 — Den Wind-Volllaststunden-Befund auf „offene Frage" zurückstufen.** Die eigene
   Faktenbasis verlangt das ausdrücklich („nicht als erwiesener Fehler"), weil 1.700 h ein
   systemweiter Flottenwert 2045 inklusive Abregelung sein könnte und die Studien-PDF nicht im
   Volltext geprüft werden konnte. Das ist der stärkste Pro-EE-Befund der Story und zugleich ihr
   angreifbarster — er hält nur mit dem Vorbehalt.

*Knapp dahinter, falls Kapazität bleibt:* H1 (Uniper-Abhängigkeit und Definitionsmischung der
Dunkelflauten-Statistik) und H2 (US-Batterietrend auf ein deutsches System übertragen,
Modelluntergrenze über dem eigenen Vergleichswert).

---

## Wo greift wer an?

**Ein EE-Skeptiker greift an bei:**
- K3 — „Ihre 1.700-Stunden-Kritik ist eine Unterstellung; in einem 2045er-Systemszenario ist der
  Flottenwert inklusive Abregelung die richtige Größe." Ein Satz, und der zentrale Pro-EE-Befund
  von Akt 2 wackelt.
- M2 — „Ausschreibungswerte sind einseitige Marktprämien mit Nullvergütung bei negativen Preisen.
  Sie sind kein Vollkostennachweis."
- M5 — „Sie rechnen Kostenüberschreitungen bei der Kernkraft mit 2,2 und bei der Windkraft mit
  1,13 — und nennen 1,13 dann ‚nahe bei eins'."
- Dem Nullpreis für Erdgas-Brennstoff: Er begünstigt das 80-%-EE+Gas-Preset (137 GW
  Gas-Spitzenlast) ungleich stärker als das Kernkraft-Preset (53,9 GW). Die Limits-Karte nennt die
  Lücke korrekt, aber nicht die Asymmetrie — hier läuft die Unfairness ausnahmsweise **zugunsten**
  der EE, und das gehört genauso benannt wie K1 und K2.

**Ein EE-Verband greift an bei:**
- K1 — „Sie legen dem erneuerbaren System den gesamten Netzausbau auf und dem Kernkraftsystem
  vier Prozent davon. Auch ein Kernkraftsystem braucht Verteilnetze für Wärmepumpen und
  E-Mobilität."
- K2 — „Sie streichen Flexibilität und Import und behaupten, das treffe alle gleich."
- H1 — „Ihre Dunkelflauten-Statistik stammt von einem Gaskraftwerksbetreiber und trägt Konfidenz A,
  während Sie den Kernkraft-Datensatz mit einem Pflicht-Beipackzettel versehen."
- H2 — „Sie übertragen einen US-Kostentrend (Zölle, Rechenzentren) auf den europäischen
  Speichermarkt und setzen die Untergrenze über Ihren eigenen BNEF-Vergleichswert."
- M4 — „Acht Gegenpositionen, und keine einzige argumentiert für die Erneuerbaren."

**Beide würden zustimmen:** Die Technologie-Kostendaten selbst sind belastbar. Der Streit läuft
ausschließlich über die Systemgrenzen — und genau die sind die Stelle, an der dieses Papier
derzeit am wenigsten transparent ist.
