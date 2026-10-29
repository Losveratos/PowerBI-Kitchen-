---
review: "R2 · 02 · Journalismus / Redigat vor Veröffentlichung — Runde 2"
persona: "Erfahrene:r Wissenschafts- und Wirtschaftsjournalist:in (Print + Online, überregionales Qualitätsmedium). Rolle: Redakteur:in, die den Text vor Freigabe redigiert. Blattmacher-Blick, nicht Peer-Review."
datum: "2026-08-19"
runde: 2
vorgutachten: "strommix/research/persona_reviews/02_journalist.md (7 KRITISCH · 16 MITTEL · 9 KLEIN)"
pruefobjekt: "/strommix-story.html (v0.2, Modell v0.2b) · /whitepaper-strommix.html (v0.11)"
verfahren: |
  Beide Seiten unter python3 -m http.server gerendert, Chromium 1194
  (executable_path=/opt/pw-browsers/chromium), 1440×900 und 390×844,
  vollständig durchgescrollt (Story 42,6 bzw. 65,5 Bildschirmhöhen;
  White Paper 52,6). Volltext beider Seiten aus dem DOM extrahiert und
  gelesen. Alle Akt-4-Schritte einzeln in beiden Viewports gescreenshottet.
  Jede Zahl im Fließtext gegen strommix/data/story_data.json gegengeprüft
  (monte_carlo.rank_probabilities, presets.*.configs, co2_sensitivity,
  ccs_narrative, ges_absender). Konsolenfehler: einer (Google-Fonts-Abruf
  durch Egress blockiert), keine JS-Fehler.
schwerpunkt: "Verständlichkeit für Nicht-Experten (Wunsch des Auftraggebers)"
---

# Redigat Runde 2 · „Ein Stromsystem, zwei Preisschilder"

## Gesamturteil vorweg

Die Fassung v0.2 hat die zwei Befunde repariert, die in Runde 1 die ganze Anlage
gefährdet haben: Der Phantom-Gegner ist aufgelöst und in eine Selbstkorrektur
verwandelt — **„Der Erste, den wir korrigieren mussten, waren wir selbst"** ist
die beste Zwischenüberschrift, die diese Seite je hatte. Und der falsche
Kernsatz von Akt 4 ist nicht nur umformuliert, sondern durch ein besseres
Verfahren ersetzt: gepaarte Ziehungen und ausgezählte Rangwahrscheinlichkeiten
statt Bänder-Augenmaß. Das White Paper benennt den alten Fehlschluss sogar
ausdrücklich als Fehlschluss. Das ist journalistisch mustergültig.

Genau deshalb fällt umso mehr auf, was **nicht** angefasst wurde. Der
Schwerpunkt dieser Runde — Verständlichkeit — ist die schwächste Seite von
v0.2, und zwar *strukturell*: Der Akt, der am meisten Neues bringt, ist auch der
am wenigsten übersetzte. Akt 4 hat jetzt **751 Wörter und 76 Zahlwerte** in
sechs Karten — eine Zahl alle zehn Wörter. Akt 1, die didaktisch beste Passage
der Seite, hat 243 Wörter. Der Leser bekommt sein Handwerkszeug in Akt 1 und
wird in Akt 4 damit alleingelassen.

Dazu kommen drei harte Befunde: Der „Faktor 9" aus Runde 1 (K5) steht
unverändert in der Story **und ist zusätzlich in die Executive Summary des
White Papers gewandert** — er widerspricht dort wie hier dem eigenen
Beipackzettel und dem eigenen Glossar. Die neue 90-Prozent-Pointe wird von der
Entscheidungsregel des eigenen White Papers als **„offen"** geführt. Und
zwischen Akt-4-Grafik, Akt-4-Text und dem unmittelbar folgenden Zwischenruf
stehen **zwei verschiedene Zahlenpaare für denselben Vergleich, mit umgekehrter
Reihenfolge**, ohne ein Wort der Erklärung.

**Empfehlung: nach Redigat publizieren.** Kein Neuschreiben. Aber ein Redigat an
vier Stellen, an denen die Aussage korrigiert werden muss, und ein
Übersetzungsdurchgang durch Akt 4 und die Executive Summary.

**Befunde Runde 2: 4 KRITISCH · 11 MITTEL · 7 KLEIN**
(davon aus Runde 1 unerledigt: 1 KRITISCH, 6 MITTEL)

**Fix-Quote Runde 1:** KRITISCH 5 von 7 vollständig behoben, 1 teilweise,
1 offen (**79 % gewichtet**). MITTEL 4 von 16 vollständig, 6 teilweise, 6 offen
(**44 %**). Gesamt KRITISCH+MITTEL: **rund 54 %**.

---

# 1 · Fix-Verifikation Runde 1

## KRITISCH

| # | Runde-1-Befund | Status | Fundstelle / Beleg |
|---|---|---|---|
| **K1** | Phantom-Gegner = eigenes Vorpapier | **behoben, mit Rückfall** | Zwischenruf „Der Erste, den wir korrigieren mussten, waren wir selbst" (HTML 841–850); Akt 2/2 „Unser eigener erster Annahmen-Check … galten die 1.700 Stunden schlicht als ‚plausibel'" (509–512); Zwischenruf nach Akt 4 „stand in unserem *eigenen* ersten Entwurf" (815–816); Akt 5/1 „ein eigener 30-Jahres-Plan … ein Arbeitspapier, das wir hier gegen unsere eigene Datenbasis prüfen" (868–872). Alle drei Fundstellen aus K1 sind aufgelöst und die Formulierung ist besser als mein Vorschlag. **Rückfall:** zwei neue namenlose Vorgänger in Akt 4 — „die *frühere Rechnung* zog für jedes Szenario eigene Zufallszahlen" (703–705) und „deutlicher, als die *frühere Formulierung* nahelegte" (753–754). Beides ist wieder das eigene v0.1, wird aber nicht als solches benannt. Siehe M-R2-4. |
| **K2** | „Die Bänder überlappen vollständig" durch eigene Perzentile widerlegt | **behoben — bester Fix der Runde** | Akt 4/3 (710–729) argumentiert jetzt nicht mehr über Bänder, sondern über die Differenz je Ziehung: „Nicht die Bänder entscheiden das, sondern die Differenz je Ziehung: In 45 % der Fälle …". White Paper Kap. 6 sagt es explizit: „Die frühere Begründung dafür (‚die Bänder überlappen sich') war ein Fehlschluss und ist ersetzt". Gegengeprüft an `rank_probabilities.base`: `kostenminimum` vs. `ee80_gas` = 0,449. Trägt. |
| **K3** | Absender, Zieljahr, Systemumfang fehlen | **behoben, mit Satzbaufehler** | Neuer Prolog-Absatz „Wer das rechnet, und wofür" (368–380): Verein 2020 Ulm/FAW/n, Wasserstoff-Herkunft, Fairness-Hinweis, Erscheinen Juli 2026, Zieljahr 2045, 950 TWh. Alles drin, inklusive der entlastenden Beobachtung. **Aber:** Das Feld `ges_absender.gegruendet` enthält „2020 in Ulm, initiiert aus dem Umfeld des Forschungsinstituts FAW/n" und wird in die Konstruktion „ist ein … gegründeter Verein" eingesetzt. Gerendert steht da: *„ist ein 2020 in Ulm, initiiert aus dem Umfeld des Forschungsinstituts FAW/n gegründeter Verein"* — ein kaputter Satz an der prominentesten Stelle des Prologs. Siehe K-R2-4. |
| **K4** | Volltext nie gelesen, Offenlegung bei 90 % Scrolltiefe | **behoben** | Eigener Prolog-Absatz (381–382) mit `ges_absender.volltext_status`: „Das Studien-PDF war in dieser Arbeitsumgebung nicht abrufbar … die Studie im Original haben wir nicht gelesen." „Sekundärwiedergabe" ist damit aufgelöst. Die Passage hinten (959–964) bleibt als Zusammenfassung. Genau richtig gelöst. |
| **K5** | „Faktor 9" widerspricht dem eigenen Beipackzettel | **OFFEN — und eskaliert** | Story Akt 2/3 unverändert: „Zwischen diesen Polen liegt eine Spanne von mehr als Faktor 9" (527–528, `#nuc-spread` = 17.264/1.867). Zwei Bildschirme später der Beipackzettel: „Ein ungewichtetes Mittel über Vertragspreise, Gesamtprojektkosten und verschiedene Preisbasen hat keine ökonomische Bedeutung" (566–568). Das Glossar setzt noch einen drauf: „deshalb ist ein Mittelwert über Punkte mit verschiedenen Abgrenzungen bedeutungslos" (1110–1112). Ein Quotient über verschiedene Abgrenzungen ist derselbe Fehler in der Divisionsform. **Neu:** dieselbe Rechnung steht jetzt als Aussage 2 in der **Executive Summary des White Papers** („mehr als das 9-Fache", whitepaper-strommix.js 3145–3149) — also an der Stelle, die „wer nur zwei Minuten hat" liest. Siehe K-R2-1. |
| **K6** | Kostenüberschreitung zählt doppelt; Überschreitungsbalken ist Endzustand von Akt 4 | **behoben — neue Asymmetrie entstanden** | Modellseitig gelöst (`overrun_applicable_share`, `idc_applicable_share`), und im Text offengelegt: „Der Faktor liegt außerdem nur noch auf den Ankern, die tatsächlich Schätzungen sind; auf bereits realisierte Kosten wie Hinkley Point C wird er nicht mehr gestapelt" (749–752). Der Überschreitungslauf ist nicht mehr Endzustand. **Aber:** Der neue Endzustand ist der Asien/Golf-Kontrast — Kernkraft bei 109 €/MWh, „jede Rangfolge ist mit 100 % entschieden". Der Überschreitungslauf (222 €/MWh) verschwindet bei Schritt 5 aus dem Bild und kommt nicht wieder. Siehe M-R2-3. |
| **K7** | „Jeder unsichere Parameter" ist falsch, WACC fehlt im Band | **behoben, Teilaufgabe offen** | Akt 4/2 sagt jetzt präzise: „Gezogen werden die Kostengrößen … Zinssatz und CO₂-Preis bleiben im Basislauf fest und laufen dafür in eigenen Konfigurationen mit" (696–708). Sauber. **Offen:** Meine Empfehlung, die WACC-Variante zu *erzählen*, ist nicht umgesetzt. `presets.kostenminimum.configs.wacc` = 135–221 €/MWh gegen 147–180 im Basislauf — die eindrucksvollste Zahl des Datensatzes steht weiterhin nur in der Datei. Der Epilog bringt stattdessen nur das Ein-Reaktor-Beispiel (105,8 → 208,5 €/MWh). |

## MITTEL

| # | Runde-1-Befund | Status | Beleg |
|---|---|---|---|
| **M1** | 90,8 vs. 93,0 für dieselbe Sache, daneben „±0,04 % genau" | **offen** | Akt-1-Grafik: „Wind an Land 90,8 / 1.700 h". Akt-2-Grafik: „Studie · 1.700 h → 93,0" (JS 1644, `sensitivity_flh[0]`). Dazwischen Akt 1/4: „reproduzieren die Studien-LCOE auf ±0,04 % genau". Unverändert. |
| **M2** | Headline und Teaser tragen den Befund nicht | **offen** | Zeile 334–339. Einzige Änderung: „im Zieljahr 2045" eingefügt. Siehe Abschnitt 4. |
| **M3** | Hero-Kennzahlen in Projektsprache | **offen** | „11 korrigierte Claims · 4 verworfene · 6 Setzungen · 54 Quellen" (340–345). Unverändert. |
| **M4** | „PFLICHT-ELEMENT" | **behoben** | Kein einziges „PFLICHT" mehr im Dokument. Kicker jetzt: Beipackzettel, Einschränkung, Gegenposition, Gegenprobe, Einordnung, Prämisse, Fairness. |
| **M5** | „◐ H2-2024-basiert (Teilzeitraum)" unaufgelöst im Fließtext | **teilweise / verschlechtert** | Kürzel unverändert, jetzt **sieben** statt fünf Vorkommen (691, 728, 756, 779, 802, 911, 928) — allein fünf davon in Akt 4, also einmal pro Schritt. Genau das hatte ich abgeraten. |
| **M6** | Akt 5 ohne Brücke | **behoben** | Der Zwischenruf 841–850 ist wörtlich die vorgeschlagene Brücke, nur besser: „Bis hierher ging es um eine Frage: Was kostet ein Zielsystem? Der zweite Streit dreht sich um eine andere: Was kostet der Weg dorthin?" |
| **M7** | Epilog beantwortet die Eingangsfrage nicht, führt neues Material ein | **offen / verschlechtert** | Der ETS-Absatz sollte in Akt 4 wandern. Er steht jetzt in **beiden**: als CO₂-Gegenprobe-Kasten nach Akt 4 *und* unverändert im Epilog (985–1000). Zusätzlich sind UBA 350 €/t und 990 €/t als neues Material in den Epilog gekommen. Die explizite Rückbindung an die Eingangsfrage („Zur Ausgangsfrage: …") fehlt weiterhin. |
| **M8** | „belegter Ist-Wert" vergleicht Plan 2026 gegen Ist 2024 | **offen** | Akt-5-Grafik unverändert: „Strombedarf 560 → 518 TWh, −7 %", Achsenlabel „Abweichung des belegten Ist-Werts vom Planwert 2026". Kein Jahr am 518er-Wert. |
| **M9** | 2045er Studienannahme gegen 2026er Auktionen | **teilweise** | Die Grafik zeigt jetzt „ISE-Projektion 2045 · 31–50" — der Text (Akt 2/1, 480–493) erwähnt sie weiterhin mit keinem Wort. Das stärkere Argument steht also weiter nur im Bild. |
| **M10** | Attributionslücken im Fließtext | **offen** | Stichprobe im Render: „Zwischen 1970 und 1978 stiegen die Kosten um 50 bis 200 Prozent" — kein Chip. „im Median 2,8-mal so teuer … 2,2-mal so lange" — kein Chip. „europäische Ist-Anlagen liegen bei 2.075 bis 2.196 €/kW" — kein Chip. „ETS 1, dessen Marktpreis im Mai 2026 bei 74 € je Tonne lag" — kein Chip; die danebenstehende [15] belegt ETS 2. Alle vier unverändert. |
| **M11** | Farbsemantik bricht in Akt 4 | **offen / verschlechtert** | CSS-Kommentar unverändert (Zeile 24–26): „Blau = die genannte Zahl / die einfache Erzählung; Terrakotta = Nachrechnung, Korrektur, Bandbreite". In Akt 4 ist Blau jetzt **Kostenminimum *und* Kostenminimum+CCS**, alles andere Terrakotta, der Asien-Kontrast grau. In Akt 2 markiert Blau die *billigen* asiatischen Projekte. Der Leser, der die Farbe gelernt hat, liest die Kernkraftzeilen als „die Zahl der Studie". |
| **M12** | Mobil verdeckt die Karte das Diagramm | **teilweise** | Gemessen bei 390×844: Grafik 519 px hoch, Karte 510 px — rund 40 % der Grafik bleibt sichtbar (Titel, Untertitel, erste zwei Zeilen). **Aber:** In Akt 4 liegen genau die zwei diskutierten Zeilen (Kostenminimum, 80 % EE + Gas) hinter der Karte. Gesamtlänge mobil jetzt **65,5** Bildschirmhöhen (v0.1: 47,5). |
| **M13** | „Die Studie … sagt das Gegenteil" überzieht Grubler | **teilweise** | Der Satz steht unverändert im Scrolly (Akt 3/3). Neu ist der Gegenpositions-Kasten „Grubler ist belegt — und bestritten" (Escobar Rangel/Lévêque, Berthelemy) *nach* dem Akt. Die Korrektur kommt also, aber erst nachdem der Leser die Zuspitzung mitgenommen hat. |
| **M14** | „Wir" wird nie eingeführt; Prolog widerspricht der Story | **behoben (bis auf Byline)** | Zeile 383–388 wörtlich wie vorgeschlagen: „Diese Geschichte ist keine Gegenstudie — aber sie bleibt auch nicht beim Lesen. Wir haben die vier Szenarien … noch einmal durchgerechnet, Stunde für Stunde". Autorenzeile steht weiterhin nur im Footer; das White Paper hat sie im Kopf („Michael Tenner · Daten-WG"). |
| **M15** | Fünfmal exakt vier Schritte | **teilweise** | Akt 4 hat jetzt sechs Schritte, das Metronom ist gebrochen. Akt 3 ist aber nicht gekürzt (weiter vier Schritte, Schritt 1 und 4 tragen weiter eine Aussage). Netto ist die Seite **länger** geworden: 42,6 statt 33 Bildschirmhöhen am Desktop (+29 %), 7.915 statt ~6.350 Wörter gerendert. |
| **M16** | [17] und [18] sind dasselbe PDF | **behoben** | 54 Quellen, kein Titel-/URL-Duplikat mehr (geprüft über `story_data.json → sources`). |

## KLEIN (Stichprobe)

| # | Befund | Status |
|---|---|---|
| S1 | „v 0.1 (Entwurf)" in der Dachzeile | **offen** — jetzt „V0.2 (ENTWURF)", gerendert in der Hero-Eyebrow und im Disclaimer. Man veröffentlicht keine Seite, die sich selbst als Entwurf ausweist. |
| S2 | „MD" in den öffentlichen Quellennotizen | **offen** — drei Vorkommen im Render: „Die Zuordnung im MD ist eine Fehlzuordnung", „beruhen auf der MD-Wiedergabe", „im MD als IAEA INIS angegeben". Dazu eine Quelle mit der öffentlichen ID `md-isar2-unverified`. |
| S3 | Hero und Prolog sagen zweimal dasselbe | **offen** — „weniger als die Hälfte" (Hero) und „Faktor von rund 2,6" (Prolog). |
| S4 | Etiketteninflation | **teilweise** — „PFLICHT" weg, aber weiterhin 11 verschiedene Labels. |
| S5 | Ghosting beim Grafikwechsel | **offen** — im Übergang Akt 2 / Schritt 2→3 bleiben 93,0 / 65,9 / 60,8 / 50,6 sichtbar hinter dem neuen Projektdiagramm liegen und kollidieren mit den neuen Labels (Screenshot bei +250 ms). Unverändert. |
| S6 | Das Uhr-Bild wird nie eingelöst | **behoben** — das Bild ist ersatzlos gestrichen. |
| S8 | „Sieben Begriffe, die alles tragen" | **offen**, aber weiterhin korrekt (sieben Einträge). |

---

# 2 · Der neue Akt 4 als Lese-Erlebnis

## Trägt die Dramaturgie?

**Der Bogen ja, die Dosierung nein.** Die Sechs-Schritte-Kurve ist als Bauplan
klug: Punktwerte → Verfahren → Beinahe-Gleichstand → Was wenn es teurer wird →
Was wenn beide gleich sauber sind → Was wenn woanders gebaut wird. Das ist eine
echte Steigerung, und die Dreifach-Pointe (Emissionsgleichheit / Überschreitung
/ Institutionenrahmen) ist inhaltlich der stärkste Gedanke der ganzen Seite:
*Die Rangfolge entscheidet nicht die Technologie, sondern drei Setzungen.*
Der Schlusssatz von Schritt 6 formuliert das so gut, dass er in den Teaser
gehört (siehe Abschnitt 4).

Überfrachtet ist der Akt trotzdem, und das lässt sich messen:

| | Wörter (Step-Cards) | Zahlwerte im Text |
|---|---|---|
| Akt 1 | 243 | 12 |
| Akt 3 | 265 | 14 |
| **Akt 4** | **751** | **76** |

Eine Zahl alle zehn Wörter, sechs Karten am Stück, und unmittelbar danach ein
Zwischenruf-Block von weiteren **639 Wörtern** mit einer vierspaltigen
CO₂-Tabelle, einem Marktdesign-Kasten, zwei Gegenpositionen und dem
Elektrolyseur-Absatz. Zwischen dem Ende von Akt 3 und dem Beginn von Akt 5
liegen rund 1.400 Wörter ohne Atempause. Das ist die Stelle, an der Leser
aussteigen — nicht weil es zu schwer wäre, sondern weil nichts mehr
zusammenfassend gesagt wird.

**Konkreter Kürzungsvorschlag, ohne Substanzverlust:**
Schritt 4 (Überschreitung) und Schritt 6 (Asien/Golf) beantworten dieselbe
Frage — „was, wenn die Baukosten anders liegen als angenommen?" — einmal nach
oben und einmal nach unten. Sie gehören zusammen in **einen** Schritt mit zwei
Absätzen. Das spart rund 250 Wörter, macht die Symmetrie sichtbar (beide
Richtungen, wie in Akt 2/4) und löst nebenbei den Befund M-R2-3 (asymmetrischer
Schlusseindruck). Akt 4 hätte dann fünf Schritte statt sechs und wäre
dramaturgisch strenger, nicht ärmer.

## Versteht ein Laie „P = 45 %"?

**Im Fließtext: ja. In Grafik, Untertitel und White Paper: nein.**

Der Fließtext ist gut: *„In 45 % der Fälle ist das Kernkraft-Szenario das
günstigere."* Das versteht jeder. Aber genau daneben steht dieselbe Aussage
dreimal in Formelnotation:

- Chart-Annotation: `P(Kernkraft < Gas) = 45 %` (mobil) bzw.
  `P(Kernkraft günstiger als Gas-Pfad) = 45 % · Median-Abstand 1,4 €/MWh`
- Fig-Untertitel darüber, nochmal dasselbe: `P(Kernkraft günstiger als
  Gas-Pfad) = 45 % · mit CO₂-Unsicherheit 64 % · mit Überschreitungs-Empirie 0 %`
- White Paper, Executive Summary: `P = 44,9 % bei einem Median-Δ von
  +1,4 €/MWh`

Ein „P(…) =" ist für den Zielleser kein Text, sondern eine Formel — und sie
steht doppelt, weil Untertitel und Annotation dasselbe sagen.

**Alternativtext Chart-Annotation:**
> **„45 von 100 durchgerechneten Zukünften gehen an die Kernkraft — ein
> Münzwurf. Im Mittel trennen die beiden 1,40 Euro je Megawattstunde."**

**Alternativtext Fig-Untertitel** (Annotation dann streichen):
> **„Mit heutigen Annahmen: 45 von 100 Zukünften für die Kernkraft · mit
> unsicherem CO₂-Preis: 64 · mit historischen Kostenüberschreitungen: keine
> einzige."**

## Wo braucht es Übersetzung — die dichtesten Stellen von Akt 4

### (a) Der Dreier 45 / 64 / 0 % — und der Selbstwiderspruch dahinter

**Ist (Zeile 719–724):** *„Nicht die Bänder entscheiden das, sondern die
Differenz je Ziehung: In 45 % der Fälle ist das Kernkraft-Szenario das
günstigere. Lässt man den CO₂-Preis mitlaufen, sind es 64 %; schaltet man die
Überschreitungs-Empirie zu, 0 %. **Die Rangfolge dieser beiden Pfade ist
offen** — und sie hängt an Setzungen, nicht an der Technologie."*

Zwei Probleme. Erstens liest sich das gerenderte **„0 %"** wie ein Fehler; es
ist aber die dramatischste Zahl des Akts (`rank_probabilities.overrun`: in
keiner einzigen von 1.000 Ziehungen ist das Kernkraft-Szenario günstiger).
Zweitens widerspricht der Absatz sich selbst: 0 % ist das Gegenteil von „offen".
Ein aufmerksamer Leser stolpert genau hier.

**Alternativtext:**
> **„Entscheidend ist nicht, wo die Bänder liegen, sondern wie oft welches
> Szenario in *derselben* Zukunft billiger ist. Von 1.000 durchgerechneten
> Zukünften gehen 450 an die Kernkraft und 550 an den Gas-Pfad — ein Münzwurf.
> Rechnet man auch den CO₂-Preis als unsicher mit, dreht es auf 640 zu 360 für
> die Kernkraft. Nimmt man dagegen an, dass Großprojekte sich so verteuern, wie
> sie es historisch getan haben, gewinnt der Gas-Pfad in *allen* 1.000
> Zukünften. Drei Annahmen, drei Ergebnisse — und keines davon ist eine Aussage
> über Technik."**

Das rettet die 0 als Pointe statt als Tippfehler und ersetzt das
widersprüchliche „offen" durch das, was tatsächlich gemeint ist.

### (b) „Gepaarte Ziehungen statt getrennter Würfe"

Die Überschrift ist Fachjargon; der Körper ist erfreulich gut („Der Solarpreis
ist in der Kernkraft-Welt derselbe wie in der Gas-Welt"). Nur die Verpackung
muss ausgetauscht werden.

**Alternativüberschrift:** **„Dieselbe Zufallswelt für alle Szenarien"**
alternativ **„Alle würfeln denselben Wurf"**

**Alternativ-Einstieg (ersetzt Absatz 1 von 696–701):**
> **„Wir haben tausendmal eine Zukunft ausgewürfelt: In Zukunft Nummer 312 ist
> Solar billig, Gas teuer und Beton knapp. 30 Größen werden dabei gezogen —
> Baukosten, Betriebskosten, Betriebsstunden und der Gaspreis je Technologie,
> jede zwischen dem Minimum und Maximum, das wir dokumentiert haben."**

Und der zweite Absatz, ohne die Phantom-Formulierung:
> **„Der Trick liegt darin, dass jede dieser tausend Zukünfte auf *alle*
> Szenarien gleichzeitig angewendet wird: derselbe Solarpreis in der
> Kernkraft-Welt wie in der Gas-Welt. Nur so treten sie unter genau denselben
> Bedingungen gegeneinander an, und nur so darf man auszählen, wer wie oft
> gewinnt. Unsere erste Fassung hat jedem Szenario eigene Würfel gegeben —
> damit war jede Aussage über Rangfolgen wertlos."**

### (c) „Emissions-Rabatt"

Die Wortprägung funktioniert, aber sie kommt zu schnell, und „28 Mt gegen
107 Mt CO₂/a" ist für einen Laien keine Größe, sondern eine Einheit.

**Ist (763–765):** *„Der Gleichstand aus Schritt 3 hat einen Haken: Er
vergleicht 28 Mt gegen 107 Mt CO₂/a. Das ist kein Technologievergleich, das ist
ein Emissions-Rabatt."*

**Alternativtext:**
> **„Der Gleichstand aus Schritt 3 hat einen Haken: Der Gas-Pfad ist nur deshalb
> so billig, weil er weiter fast viermal so viel CO₂ ausstoßen darf — 107
> Millionen Tonnen im Jahr gegen 28. Wir haben also gar nicht zwei Wege zum
> selben Ziel verglichen, sondern einen sauberen mit einem schmutzigeren. Der
> Preisvorteil ist zum Teil ein Rabatt fürs Weiter-Emittieren."**

### (d) Vermeidungskosten als Obergrenze — die härteste Stelle der Seite

**Ist (774–780):** *„… Daraus folgen Vermeidungskosten von 378 bis 531 € je
Tonne. Das ist eine **Obergrenze**, kein Preisschild."*

Drei Verständnishürden auf einmal: „Vermeidungskosten" wird nicht erklärt; die
Zuordnung der beiden Zahlen zu den beiden Pfaden fehlt; und die Zahlen wirken
**invertiert** — der Pfad mit dem *kleineren* Aufschlag (Kernkraft, 10,9 €/MWh)
hat die *höheren* Vermeidungskosten (531 €/t). Das ist rechnerisch korrekt
(der Aufschlag verteilt sich auf weniger vermiedene Tonnen: 19,6 gegen 74,8 Mt),
aber ohne diesen Satz liest es sich wie ein Fehler. Und „Obergrenze" bleibt eine
Behauptung, deren Begründung nur in der Limitationen-Kachel steht.

**Alternativtext (ersetzt die letzten zwei Sätze):**
> **„Rechnet man diesen Aufschlag auf die Tonnen um, die er tatsächlich
> einspart, kostet jede vermiedene Tonne CO₂ im Gas-Pfad rund 378 Euro, im
> Kernkraft-Szenario rund 531. Dass ausgerechnet das Kernkraft-Szenario teurer
> dasteht, obwohl sein Aufschlag der kleinere ist, hat einen einfachen Grund: Es
> hat viel weniger Emissionen zu vermeiden, der Aufschlag verteilt sich also auf
> weniger Tonnen. Beide Zahlen sind ein Vielfaches dessen, was eine Tonne heute
> im Emissionshandel kostet — aber sie sind bewusst pessimistisch gerechnet: Wir
> rüsten den kompletten Reservepark mit Abscheidung aus, auch die Kraftwerke,
> die nur ein paar hundert Stunden im Jahr laufen. Wer real baut, würde nur die
> vielgenutzten Blöcke ausrüsten. Die Zahl markiert die teure Grenze des
> Möglichen, nicht den zu erwartenden Preis."**

### (e) Der asymmetrische Überschreitungslauf (Schritt 4, Absatz 3)

**Ist (744–752):** *„Dieser Lauf ist asymmetrisch, und das muss dabeistehen:
Batterie, Elektrolyse, H₂-Speicher und H₂-Turbine haben in beiden Datenbanken
*keine* Projektklasse und bleiben bei Faktor 1,00 … Der Faktor liegt außerdem
nur noch auf den Ankern, die tatsächlich Schätzungen sind …"*

„asymmetrisch", „Projektklasse", „Faktor 1,00", „Anker", „Modellspanne" — fünf
Fachbegriffe in vier Sätzen. Und der wichtigste Punkt (dass hier ein eigener
Fehler behoben wurde) wird versteckt.

**Alternativtext:**
> **„Dieser Lauf ist unfair — zulasten der Kernkraft, und das muss dabeistehen.
> Für Batterien, Elektrolyseure und Wasserstoffspeicher enthält keine der beiden
> Datenbanken Zahlen; sie laufen deshalb ohne jeden Aufschlag mit. Das heißt
> nicht, dass sie im Plan bleiben — es heißt, dass es niemand gemessen hat. Und
> den Aufschlag legen wir nur noch auf Projekte, deren Kosten bislang bloß
> geschätzt sind. Auf Hinkley Point C, das seine Verteuerung längst hinter sich
> hat, legen wir ihn nicht ein zweites Mal drauf — diesen Fehler hatte unsere
> erste Fassung gemacht."**

## Ist die neue Pointe stärker als die alte?

**Inhaltlich deutlich stärker, in der Ausführung noch nicht.**

Die alte Pointe („die Rangfolge ist nicht entschieden, weil die Bänder
überlappen") war falsch begründet und endete im Achselzucken. Die neue —
*derselbe Vergleich fällt anders aus, je nachdem welche Emissionsnebenbedingung,
welchen Institutionenrahmen und welche Kostenerfahrung man ansetzt* — ist die
klügere Aussage, sie ist gerechnet statt behauptet, und sie hat den
journalistisch wertvollsten Effekt: Sie nimmt beiden Lagern das Argument, ohne
sich zu drücken.

Drei Dinge halten sie aber unter ihrem Wert:

1. **Sie steht nirgends in einem Satz.** Schritt 6 formuliert sie beiläufig als
   Nachsatz („… sondern drei Setzungen: welche Emissionsnebenbedingung gilt,
   welchem Institutionenrahmen man den Bau zutraut, und ob die
   Überschreitungs-Empirie eingeschaltet ist"). Das ist die Kernbotschaft der
   Fassung und verdient eine eigene Zeile — in der Akt-4-Überschrift, im
   Zwischenruf, im Teaser.
2. **Der Zwischenruf trägt sie nicht mit.** `mc-honest` endet weiterhin bei
   „führt das Kernkraft-Szenario mit 90 Prozent" und der Folgeabsatz bei
   „statistisch unentschieden" — die Dreifach-Pointe kommt dort nicht vor.
3. **Sie kollidiert mit der 90-Prozent-Zahl**, die das eigene White Paper als
   „offen" führt (K-R2-2). Wer beide Dokumente liest, findet zwei verschiedene
   Urteile über denselben Vergleich.

---

# 3 · Verständlichkeit für Nicht-Experten (Schwerpunkt)

## Die fünf dichtesten Stellen der Story

| Rang | Stelle | Warum |
|---|---|---|
| 1 | Akt 4/3, Absatz 2+3 (719–729) | 45/64/0 % + Kipppunkt + Modellwert 75 in acht Zeilen; Selbstwiderspruch „0 %" vs. „offen"; siehe (a) oben und K-R2-3 |
| 2 | Akt 4/5, Absatz 3 (773–780) | Vermeidungskosten, Zuordnung, Obergrenze, Kapazitäts-Argument in einem Satzblock; siehe (d) |
| 3 | Akt 4/4, Absatz 3 (744–752) | fünf Fachbegriffe in vier Sätzen; siehe (e) |
| 4 | Epilog, Absätze 3+4 (985–1000) | Kipppunkt 48 · Modellwert 75 · ETS 2 über 200 · ETS 1 74 · UBA 350 · UBA 990 · „Zeitpräferenzrate" — sechs CO₂-Preise und ein volkswirtschaftlicher Fachbegriff in 200 Wörtern, nach 40 Bildschirmen Lektüre |
| 5 | Akt-4-Chart-Legende (11 px Mono) | „◆ deterministisch ▭ P25–P75 │ Median ├─┤ P5–P95 ⌐¬ gestrichelt = CCS-Variante" — fünf Notationen, keine davon im Sichtfeld erklärt |

**Alternativtext Legende:**
> **„◆ unser Punktwert · ▭ die mittlere Hälfte aller 1.000 Zukünfte · │ die
> mittlere Zukunft · ├─┤ 90 von 100 Zukünften liegen in diesem Bereich ·
> gestrichelt = mit CO₂-Abscheidung"**

**Alternativtext Epilog (ersetzt Absatz 4, 992–1000):**
> **„Zur Einordnung, weil in dieser Debatte drei Zahlen durcheinandergehen: Der
> oft zitierte Preis von über 200 Euro je Tonne gilt für Gebäude und Verkehr,
> nicht für Kraftwerke. Für Strom gilt der europäische Emissionshandel, und der
> lag im Mai 2026 bei 74 Euro. Was eine Tonne die *Gesellschaft* kostet, ist
> davon noch einmal weit entfernt: Das Umweltbundesamt kommt je nach Rechenweise
> auf 350 oder 990 Euro. Der Unterschied zwischen diesen beiden Werten ist keine
> Rechenfrage — er hängt allein daran, ob man Schäden, die erst unsere
> Enkelkinder treffen, heute abwertet oder nicht."**

## Die fünf dichtesten Stellen des White Papers

| Rang | Stelle | Warum |
|---|---|---|
| 1 | Exec Summary, Aussage 7 | „P = 44,9 % bei einem Median-Δ von +1,4 €/MWh" · „Entschieden sind 11 von 15 Paaren" · „Randverteilungen" — in einem Kasten, über dem steht: „Wer nur zwei Minuten hat, liest bis hier" |
| 2 | Exec Summary, Aussage 8 | „führt mit 90,3 % statt der 44,9 % ohne CCS" · „111 Mt CO₂/a müssten dauerhaft eingelagert werden" — plus das fehlende „offen"-Urteil (K-R2-2) |
| 3 | Kap. 6, Vorspann zur Detailtabelle | „Δ ist die Differenz erstes minus zweites Szenario je gepaarter Ziehung; negativ heißt: das erste ist günstiger" — eine Legende, die selbst eine Legende bräuchte |
| 4 | Kap. 3, Methodikabsatz zu gepaarten Ziehungen | „ein eigener Zufallszahlengenerator — damit Python-Referenz und Browser bitgleich dieselbe Ziehungsfolge erzeugen … (in der Literatur: common random numbers)" |
| 5 | Kap. 6, Schlussabsatz | „Die breiteste Verteilung hat 80 % EE + Gas + CCS mit 39 €/MWh zwischen P5 und P95 (20 % des Medians)" |

**Alternativtexte:**

*Exec Summary 7, Schluss:*
> **„Offen bleibt vor allem Kernkraft-Szenario gegen gasgestützten 80-%-Pfad: In
> 449 von 1.000 durchgerechneten Zukünften ist das Kernkraft-Szenario das
> günstigere, im Mittel trennen die beiden 1,40 Euro je Megawattstunde — weniger
> als ein Prozent. Das ist ein Münzwurf, kein Ergebnis."**

*Exec Summary 8, Schluss:*
> **„… und das Kernkraft-Szenario ist dann in 903 von 1.000 Zukünften das
> günstigere statt in 449. Nach der Regel dieses Papiers — entschieden erst ab
> 950 von 1.000 — bleibt auch dieser Vergleich formal offen; die Richtung ist
> aber eindeutig und kehrt sich gegenüber der Rechnung ohne Abscheidung um."**

*Kap. 6, Tabellenvorspann:*
> **„In der Spalte ‚Median Δ' steht, um wie viel Euro je Megawattstunde das
> erste Szenario in einer typischen Zukunft über oder unter dem zweiten liegt.
> Ein Minuszeichen heißt: Das erste ist billiger."**

*Kap. 3, Methodik:*
> **„Man kann sich das als 1.000 durchgespielte Zukünfte vorstellen: In Zukunft
> Nummer 312 ist Solar billig, Gas teuer und der Stahlpreis hoch — und genau
> diese eine Zukunft wird auf alle sieben Szenarien angewandt, damit sie unter
> identischen Bedingungen gegeneinander antreten. (Der Fachbegriff dafür lautet
> *common random numbers*.)"**

*Kap. 6, Schlussabsatz:*
> **„Am unsichersten ist der Gas-Pfad mit Abscheidung: Zwischen seinem günstigen
> und seinem ungünstigen Rand liegen 39 Euro je Megawattstunde — ein Fünftel
> seines eigenen Werts."**

## Der Kipppunkt bei 47,5 €/t — die brisanteste Zahl bleibt stumm

**Das ist der gravierendste Verständlichkeitsbefund der Runde.** Gerendert steht
in Akt 4/3:

> *„Wie stark der CO₂-Preis wirkt, zeigt der Kipppunkt: Ab rund **48 € je Tonne**
> liegt das Kernkraft-Szenario vorn. Unser Modell rechnet mit 75 — der
> Beinahe-Gleichstand ist also selbst schon ein Ergebnis dieser Annahme."*

Was ein Laie daraus mitnimmt: fast nichts. Es fehlt jeder Anker.

1. **Er erfährt nicht, wo der reale Preis steht.** Der ETS-1-Marktpreis (74 €/t)
   kommt erst im Epilog vor — **rund zehn Bildschirme später** —, und die
   Verbindung wird dort nicht gezogen. Dabei ist genau sie die Nachricht: *Der
   Emissionshandel steht heute schon oberhalb der Kippmarke.* Der knappe
   Vorsprung des Kernkraft-Szenarios ist damit kein Technologiebefund, sondern
   ein Ergebnis heutiger CO₂-Preise — und er verschwindet, sobald der Preis
   fällt. Das ist eine hochpolitische Aussage, sie steht implizit vollständig in
   den Daten, und sie wird nicht ausgesprochen.
2. **Er erfährt nicht, warum es kippt.** Dass der Gas-Pfad viermal so viel
   emittiert und deshalb jeder Euro je Tonne ihn viermal so hart trifft, steht
   erst zwei Schritte später (Schritt 5).
3. **Er erfährt nicht, in welche Richtung es unterhalb kippt.** Bei 0 €/t liegt
   der Gas-Pfad vorn (146 gegen 150, siehe CO₂-Gegenprobe-Kasten) — das steht
   nur in der Tabelle, nicht im Satz.

**Alternativtext (ersetzt 725–729):**
> **„Der ganze Gleichstand hängt an einer einzigen Zahl: dem Preis für eine
> Tonne CO₂. Kostet sie nichts, gewinnt der Gas-Pfad — er darf dann gratis
> ausstoßen (146 gegen 150 Euro je Megawattstunde). Ab rund 48 Euro je Tonne
> kippt es, weil der Gas-Pfad fast viermal so viel emittiert und jeden Euro
> viermal bezahlt. Wir rechnen mit 75. Und hier liegt der eigentliche Befund:
> Der europäische Emissionshandel für Kraftwerke lag im Mai 2026 bei 74 Euro —
> also bereits deutlich oberhalb der Kippmarke. Der knappe Vorsprung des
> Kernkraft-Szenarios ist damit kein Ergebnis über Technik, sondern eines über
> die heutige Klimapolitik. Fällt der CO₂-Preis, dreht sich das Ergebnis; steigt
> er, wächst der Abstand."**

**Wichtiger Vorbehalt, der mit hineinmuss:** Der Kipppunkt ist am
*deterministischen* Lauf bestimmt (`co2_sensitivity.method`: Bisektion). Im
Monte-Carlo-Basislauf bei denselben 75 €/t gewinnt die Kernkraft nur in 45 von
100 Zukünften. Das ist kein Widerspruch (Punktwert vs. Median einer
rechtsschiefen Verteilung, siehe K-R2-3), aber der Leser sieht zwei Zahlen, die
in verschiedene Richtungen zeigen, und bekommt keine Auflösung. Ein Halbsatz
genügt: *„Im Punktwert liegt die Kernkraft damit vorn, in der Bandbreite bleibt
es ein Münzwurf — beides steht in derselben Rechnung."*

---

# 4 · Headline, Teaser, Executive Summary

## Story: Der Einstieg trägt die neue Geschichte **nicht**

Die Headline ist unverändert, der Teaser hat einen Nebensatz dazubekommen. Was
ein Abbrecher nach zwei Minuten mitnimmt, ist deshalb dasselbe wie in Runde 1 —
nur ist der Abstand zur eigentlichen Geschichte jetzt **größer** geworden, weil
die Story am Ende eine ganz andere Pointe hat als in v0.1:

> „Eine Studie sagt, ein Kernkraft-System kostet 125 €/MWh und 100 % Erneuerbare
> 321 €/MWh — mehr als das Doppelte. Jemand rechnet das gerade nach."

Der Hero verkauft weiterhin ausschließlich die These der geprüften Seite, in
70-Pixel-Fraunces. Und die Hero-Kennzahlen sprechen weiter Projektsprache
(„11 korrigierte Claims · 4 verworfene · 6 Setzungen"), obwohl die Story
inzwischen etwas viel Vorzeigbareres zu bieten hat: **1.000 durchgerechnete
Zukünfte.**

**Vorschlag Dachzeile:** „Systemkosten · Was von 125 gegen 321 übrig bleibt ·
Stand August 2026" (das „(Entwurf)" fliegt raus, S1)

**Vorschlag Headline**, drei Varianten:
- **„Ein Stromsystem, zwei Preisschilder — und drei Annahmen, die alles
  entscheiden"** (nah am Bestand, trägt die neue Pointe)
- **„Die 125 und die 321"**, Dachzeile *„Nachgerechnet: Von einem Faktor 2,6
  bleibt ein Münzwurf"*
- **„Es entscheidet nicht die Technologie"**, Dachzeile *„1.000-mal
  durchgerechnet: was ein Kernkraft- und ein Gassystem wirklich trennt"*

**Vorschlag Teaser (ersetzt 335–339):**
> **„Dieselbe Studie nennt für ein klimaneutrales deutsches Stromsystem im Jahr
> 2045 125 und 321 Euro je Megawattstunde — Kernkraft gegen hundert Prozent
> Erneuerbare, ein Faktor 2,6. Wir haben die Annahmen dahinter Zahl für Zahl
> gegen Marktdaten gehalten und das System tausendmal neu durchgerechnet. Der
> Faktor überlebt das nicht: Vorne liegen zwei Wege fast gleichauf. Welcher
> gewinnt, entscheidet keine Technologie, sondern drei Setzungen — wie viel CO₂
> noch ausgestoßen werden darf, was eine Tonne davon kostet, und wem man
> zutraut, ein Kernkraftwerk im Zeitplan zu bauen."**

**Vorschlag Hero-Kennzahlen:**
> **„54 Quellen · 11 Zahlen korrigiert · 4 Behauptungen verworfen · 6
> offengelegte Annahmen · 1.000 durchgerechnete Zukünfte"**

## White Paper: Executive Summary trägt die neue Geschichte — steht aber falsch sortiert

Die Summary ist inhaltlich auf Höhe: Aussage 7 (gepaarte Ziehungen, Münzwurf,
alter Fehlschluss ausdrücklich benannt) und Aussage 8 (Emissionsgleichheit
dreht das Ergebnis) sind genau die neue Geschichte, und dass der eigene frühere
Fehlschluss dort *benannt* wird, ist stark.

Drei Eingriffe:

1. **Reihenfolge.** Über dem Kasten steht „Wer nur zwei Minuten hat, liest bis
   hier". Die Nachricht dieses Papiers steht auf Position **7 und 8 von 9**.
   Die beiden gehören auf Platz 1 und 2 — der WACC-Befund (heute Nr. 1) ist
   wahr und wichtig, aber er war schon in v0.9 wahr.
2. **Aussage 2 muss weg oder umgeschrieben werden** (siehe K-R2-1). „mehr als
   das 9-Fache" ist genau der Quotient, den Kapitel 4 und das Glossar für
   bedeutungslos erklären.
   **Alternativtext:**
   > **„Ein Punktwert für Kernkraftkosten ist immer irreführend. Reale
   > Neubaukosten reichen von 1.867 €/kW (Korea, reine Baukosten) bis
   > 17.264 €/kW (Hinkley Point C, Gesamtprojekt in laufenden Preisen) — diese
   > beiden Zahlen darf man nicht durcheinander teilen, sie messen
   > Verschiedenes. Vergleichbar sind die drei Cluster: Asien/Golf 1.870–4.950,
   > EU-Serie und Vertragspreise 7.265–13.472, westliches Erstprojekt
   > 13.500–17.264 €/kW. Der große Sprung liegt nicht innerhalb einer Zählweise,
   > sondern zwischen den Kontinenten."**
3. **Aussage 8 muss das eigene „offen"-Urteil mitnehmen** (K-R2-2).

---

# 5 · Neue Befunde Runde 2

## KRITISCH

### K-R2-1 · „Faktor 9" — unerledigt aus Runde 1 und jetzt in der Executive Summary

**Fundstelle:** strommix-story.html 527–528 (`#nuc-spread`);
whitepaper-strommix.js 3145–3149 (Exec Summary, Aussage 2).

Der Quotient entsteht aus 17.264 €/kW (Hinkley Point C, **Gesamtprojekt,
laufende Preise**) geteilt durch 1.867 €/kW (APR1400 Inland, **Overnight**).
Die Story selbst erklärt in zwei eigenen Passagen, warum das unzulässig ist:
Beipackzettel („Ein ungewichtetes Mittel über Vertragspreise,
Gesamtprojektkosten und verschiedene Preisbasen hat keine ökonomische
Bedeutung") und Glossar („deshalb ist ein Mittelwert über Punkte mit
verschiedenen Abgrenzungen bedeutungslos"). Ein Fachchecker zitiert diese drei
Stellen nebeneinander, und die Sorgfalts-Aura der Seite ist weg.

**Alternativtext Story 525–528:**
> **„Koreas eigene Blöcke liegen bei 1.867 bis 2.720 €/kW; zusammen mit den
> Emiraten ergibt das den Cluster Asien und Golf mit 1.870–4.950 €/kW. Hinkley
> Point C kostet 17.264 €/kW — allerdings als Gesamtprojekt in laufenden
> Preisen, also einschließlich Bauzinsen und Bauherrenkosten, die in der
> koreanischen Zahl gar nicht enthalten sind. Diese beiden Zahlen darf man nicht
> durcheinander teilen; genau darum geht es in diesem Akt. Vergleichbar sind die
> drei Cluster — und zwischen dem asiatischen und dem westlichen Erstprojekt
> liegt trotzdem eine Welt."**

### K-R2-2 · Die 90-Prozent-Pointe wird vom eigenen White Paper als „offen" geführt

**Fundstelle:** Story 766–771 („Aus 45 Prozent werden 90 %"), `mc-honest`
(`monte_carlo_headline.honest_statement`: „führt das Kernkraft-Szenario mit
90 Prozent"); White Paper Kap. 6, Tabelle „Die entscheidungsrelevanten Paare im
Detail": *Kostenminimum + CCS vs. 80 % EE + Gas + CCS · 90,3 % · Median-Δ −18,2 ·
P5…P95 der Differenz −36 … +7 · **Urteil: offen***; und im Fließtext darunter:
„Offen bleiben: … Kostenminimum + CCS gegen 80 % EE + Gas + CCS (P = 90,3 %)".

Das White Paper definiert „entschieden" ausdrücklich als ≥ 95 % gleiches
Vorzeichen. 90,3 % liegt darunter, und die Differenzverteilung schneidet die
Null (−36 … +7). Die Story verkauft diesen Vergleich als **Pointe von Schritt 5
und als Schlusssatz des Zwischenrufs**, ohne das Urteil mitzuliefern — und das
ist ausgerechnet die Stelle, an der die Geschichte zugunsten des
Kernkraft-Szenarios zuspitzt. Dieselbe Lücke steht in der Executive Summary des
White Papers, die den Widerspruch zu ihrer eigenen Tabelle drei Kapitel später
nicht auflöst.

Das ist ein Aussagefehler, kein Formulierungsfehler, und er ist in zwanzig
Sekunden nachprüfbar, weil die Tabelle im verlinkten Dokument steht.

**Alternativtext Story 770–771:**
> **„Aus 45 von 100 Zukünften werden 90. Nach unserer eigenen Regel — entschieden
> erst ab 95 — bleibt auch das formal ein offener Vergleich. Die Richtung ist
> aber eindeutig, und sie kehrt sich gegenüber Schritt 3 um: Sobald beide Pfade
> gleich sauber sein müssen, ist der teurere Pfad der mit dem Gas."**

Und `monte_carlo_headline.honest_statement` (Datensatz, nicht Markup) muss
entsprechend nachgezogen werden: „führt das Kernkraft-Szenario mit 90 Prozent"
→ **„liegt das Kernkraft-Szenario in 90 von 100 Zukünften vorn — nach unserer
eigenen 95-Prozent-Schwelle immer noch kein entschiedener Vergleich, aber eine
klare Richtungsumkehr."**

### K-R2-3 · Zwei Zahlenpaare für denselben Vergleich, mit umgekehrter Reihenfolge — unerklärt

**Fundstelle:** Akt-4-Grafik (◆ 152 / Median 158 für Kostenminimum; ◆ 155 /
Median 157 für 80 % EE + Gas); Akt 4/3, Absatz 1 (Median 158 gegen 157);
Zwischenruf unmittelbar danach, `mc-honest` (152,3 gegen 154,6);
CO₂-Gegenprobe-Kasten (bei 0 €/t: 150 gegen 146; bei 75 €/t: 152 gegen 155).

Der Leser bekommt innerhalb von zwei Bildschirmen **vier Zahlenpaare** für
dieselben zwei Szenarien — und in zweien davon führt das Kernkraft-Szenario, in
zweien der Gas-Pfad. Der Grund ist harmlos (der deterministische Punktwert und
der Median aus 1.000 rechtsschiefen Ziehungen sind verschiedene Größen; die
Spannen reichen nach oben weiter als nach unten, deshalb liegt der Median über
dem Punktwert, und beim Kernkraft-Szenario stärker als beim Gas-Pfad: +6,0 gegen
+2,1 €/MWh). Erklärt wird er **nirgends**. Die Legende sagt nur „◆
deterministisch".

Journalistisch heikel ist die Verteilung der beiden Paare: Wo das
Kernkraft-Szenario gut aussehen soll (Zwischenruf-Lede, CCS-Schritt, Executive
Summary), stehen die deterministischen Werte; im nüchternen Median-Absatz steht
das Paar, in dem es hinten liegt. Das ist mit Sicherheit nicht beabsichtigt,
aber ein kritischer Leser kann es als Rosinenpickerei lesen — und das ist der
teurere Vorwurf.

**Alternativtext, einzufügen am Ende von Akt 4/1 (nach 691):**
> **„Ein Hinweis, bevor die Bandbreiten kommen: Sie werden gleich zwei Zahlen je
> Szenario sehen. Die Raute ist unser Punktwert mit den mittleren Annahmen — 152
> für das Kernkraft-Szenario, 155 für den Gas-Pfad. Der Strich in der Box ist
> die *mittlere* aller 1.000 durchgerechneten Zukünfte — 158 und 157. Dass der
> zweite Wert höher liegt, hat einen Grund: Nach oben sind die Spannen weiter
> als nach unten, teure Ausreißer ziehen stärker als billige. Und dass sich
> dabei die Reihenfolge dreht, ist bereits der erste Befund dieses Akts: Diese
> beiden Pfade liegen so eng, dass schon die Wahl der Kennzahl den Sieger
> wechselt."**

### K-R2-4 · Grammatikfehler an der prominentesten Prolog-Stelle

**Fundstelle:** 368–370, `ges_absender.gegruendet`.

Gerendert: *„Global Energy Solutions e. V. ist ein 2020 in Ulm, initiiert aus
dem Umfeld des Forschungsinstituts FAW/n gegründeter Verein"*. Das Datenfeld
enthält einen ganzen Nebensatz und wird in eine Partizipialkonstruktion
eingesetzt. Der Satz ist unlesbar — und er steht in dem Absatz, der aus Runde 1
neu dazugekommen ist, also an der Stelle, an der die Story ihre Sorgfalt
demonstrieren will.

**Fix (im Datensatz, nicht im Markup):** `gegruendet` auf „2020 in Ulm"
kürzen, den Rest in ein eigenes Feld; oder den Satz im HTML umbauen:
> **„Global Energy Solutions e. V. wurde 2020 in Ulm gegründet, initiiert aus
> dem Umfeld des Forschungsinstituts FAW/n; sein ursprüngliches Thema war …"**

## MITTEL (neu)

**M-R2-1 · „0 %" liest sich wie ein Fehler und widerspricht dem eigenen
Absatzfazit.** Akt 4/3, 722–724. Siehe Alternativtext in Abschnitt 2(a).

**M-R2-2 · Akt 4 ist der dichteste Block der Seite und hat keine Atempause.**
751 Wörter / 76 Zahlwerte in sechs Karten, danach 639 Wörter Zwischenruf mit
Tabelle und vier Kästen. Vorschlag: Schritt 4 und Schritt 6 zu einem Schritt
„Beide Richtungen: teurer und billiger" zusammenlegen (−250 Wörter, +Symmetrie).

**M-R2-3 · Der letzte Bildeindruck von Akt 4 ist der günstigste Kernkraft-Lauf.**
Bei Schritt 5 verschwindet der Überschreitungslauf (222 €/MWh) aus der Grafik
und kommt nicht zurück; sichtbar bleiben Basislauf, CCS und der Asien-Kontrast
(109 €/MWh, „100 % entschieden"). Der Fig-Untertitel warnt korrekt („Kontrast,
kein Deutschland-Szenario"), aber wer aus dem Akt herausscrollt, nimmt 109 mit,
nicht 222. Das ist die exakte Spiegelung des Runde-1-Befunds K6, nur in die
andere Richtung. **Fix:** beide Kontrastläufe im Endzustand nebeneinander
stehen lassen — das ist zugleich die bessere Illustration der Dreifach-Pointe.

**M-R2-4 · Neue namenlose Vorgänger in Akt 4.** „die *frühere Rechnung* zog für
jedes Szenario eigene Zufallszahlen" (703–705), „deutlicher, als die *frühere
Formulierung* nahelegte" (753–754). Gemeint ist beide Male das eigene v0.1.
Nach der vorbildlichen Auflösung von K1 fällt das doppelt auf. **Fix:** „unsere
erste Fassung" statt „die frühere Rechnung" — kostet zwei Wörter und ist genau
die Währung, mit der der Rest der Seite arbeitet.

**M-R2-5 · Zwei Zahlen für den ETS-1-Marktpreis in zwei Dokumenten desselben
Projekts.** Story: „im Mai 2026 bei 74 € je Tonne" (Konfidenz fehlt). White
Paper Kap. 4: „Der Marktpreis lag im Mai 2026 bei rund 75 €/t **C**". Dieselbe
Größe, zwei Werte, unterschiedliche Konfidenzangabe, keiner von beiden mit
Quellenchip.

**M-R2-6 · Der Kipppunkt rendert als 48, wird aber überall als 47,5 geführt.**
`data-d="0"` rundet. Das ist an sich in Ordnung („rund 48"), aber der
Gegenprobe-Kasten sagt dann zweimal hintereinander „rund 48": einmal aus dem
gerundeten Wert, einmal aus `crossover_note`. Doppelung im selben Absatz.

**M-R2-7 · „Vier saubere Punktwerte" über fünf Rauten.** Fig-Titel Akt 4 /
Schritt 1; im Chart stehen Ist 2025 plus vier Zukünfte. Kleinigkeit, aber sie
steht in 20 px Fraunces über der Grafik.

**M-R2-8 · Untertitel und Chart-Annotation sagen in Akt 4/3 dasselbe** — beide
in `P(…) = …`-Notation, übereinander. Eines streichen.

**M-R2-9 · Der Asien/Golf-Kontrast wird nicht als Gegenposition markiert.**
Schritt 6 ist die stärkste Entlastung für das Kernkraft-Szenario in der ganzen
Story, steht aber in derselben Typografie wie die eigenen Befunde. Er gehörte in
einen `kasten gegen` — genau die Auszeichnung, die die Seite sonst vorbildlich
für Gegenpositionen einsetzt. Die Gegenposition dazu (Persona-Review 06 K3,
„der Ausschluss ist Cherry-Picking") steht vollständig im Datensatz
(`nuclear_capex_contrast.counterposition`) und wird auf der Seite nicht gezeigt.

**M-R2-10 · Der Ist-2025-Anker steht in jeder Akt-4-Grafik an erster Stelle,
obwohl die Story sechsmal sagt, dass er nicht in die Reihe gehört.** Position
ganz oben = Leseposition „Platz 1". Der Warnhinweis steht im Text, das Layout
sagt das Gegenteil. **Fix:** abgesetzt darstellen (Trennlinie, Grauwert) oder
ans Ende der Zeilenordnung.

**M-R2-11 · Mobile Länge 65,5 Bildschirmhöhen.** +38 % gegenüber v0.1. Bei
gleichbleibender Kartenhöhe verdeckt die Step-Card in Akt 4 weiterhin genau die
zwei Zeilen, um die es im Text geht.

## KLEIN (neu)

- **S-R2-1 · „◐ H2-2024-basiert (Teilzeitraum)" jetzt fünfmal allein in Akt 4.**
  Vorschlag unverändert: einmal pro Akt, ausgeschrieben —
  „◐ gerechnet auf einem halben Wetterjahr (Juli–Dez. 2024)".
- **S-R2-2 · „Zwischen zwei belegten Datenclustern … liegen damit rund 50 €/MWh
  Systemkosten."** Grammatisch schief; besser: „liegen damit rund 50 Euro
  Unterschied je Megawattstunde".
- **S-R2-3 · „Aus 45 Prozent werden 90 %"** — ausgeschriebenes „Prozent" und
  Zeichen in einem Satz.
- **S-R2-4 · Der Konfidenz-Badge „C" steht im Prolog mitten im Fließtext**
  („… dieses System. **C** für die Angaben zum Verein: …"). Als Satzanfang
  gelesen ergibt das keinen Sinn; besser als Klammerzusatz am Satzende.
- **S-R2-5 · Achsenbeginn bei 80 €/MWh** in allen Akt-4-Grafiken. Korrekt
  beschriftet („Achse beginnt bei 80"), spreizt aber optisch den
  Beinahe-Gleichstand, den der Text als „1,4 Euro Abstand" beschreibt.
- **S-R2-6 · Ghosting (S5 aus Runde 1) unverändert.**
- **S-R2-7 · „v0.2 (Entwurf)" in der Dachzeile (S1 aus Runde 1) unverändert.**

---

# 6 · Was in diesem Redigat nicht mit weggeräumt werden darf

1. **„Der Erste, den wir korrigieren mussten, waren wir selbst."** Beste
   Zwischenüberschrift der Seite und die beste Antwort auf K1, die es gab. Der
   ganze Absatz (843–850) ist Vorbildmaterial — bis zum Schlusssatz
   „Selbstkorrektur ist die einzige Glaubwürdigkeitswährung, die man selbst
   drucken darf."
2. **Der neue Prolog-Block zum Absender.** Dass die entlastende Beobachtung
   („ein wasserstoffnaher Verein weist die Wasserstoffpfade als die teuersten
   aus") ungekürzt drinsteht, ist genau die Haltung, die die Seite trägt.
3. **Die Volltext-Einschränkung im Prolog statt im Anhang.** Selten, richtig,
   und gut formuliert.
4. **Der Wechsel von Bänder-Augenmaß zu gepaarten Ziehungen.** Methodisch der
   größte Fortschritt, und das White Paper benennt den alten Fehlschluss
   ausdrücklich als solchen. Das macht kaum jemand.
5. **Der Satz „Der Faktor liegt außerdem nur noch auf den Ankern, die
   tatsächlich Schätzungen sind; auf bereits realisierte Kosten wie Hinkley
   Point C wird er nicht mehr gestapelt."** Eine stillschweigend behobene
   Doppelzählung offen auszuweisen, ist die teuerste und wertvollste Form von
   Transparenz.
6. **Die Limitationen-Kacheln.** Jetzt 16 statt 8, jede mit Fehlerrichtung, drei
   davon ausdrücklich gegen die eigene Erzählrichtung („Die H₂-Anfangsfüllung
   ist gratis", „Das CCS-Kostenband ist optimistisch", „Import und Flexibilität
   fehlen — nicht symmetrisch"). Mehr, als die meisten Fachpublikationen
   leisten.
7. **Akt 1.** Weiterhin die didaktisch beste Passage der Seite — und der Maßstab,
   an dem Akt 4 gemessen werden muss.

---

# 7 · Urteil

**Nach Redigat publizieren.**

Kein Neuschreiben, kein Zurück auf Los. Die Fassung v0.2 ist substanziell besser
als v0.1: Die beiden Runde-1-Befunde, die die Seite unveröffentlichbar gemacht
hätten, sind erledigt, und einer davon ist in eine echte erzählerische Stärke
verwandelt worden. Die neue Pointe ist die klügere.

Freigabe hängt an vier Eingriffen, in dieser Reihenfolge:

1. **K-R2-1 · „Faktor 9" entfernen** — in Story *und* Executive Summary. Solange
   er dort steht, widerspricht die Seite an ihrer prominentesten Stelle ihrem
   eigenen Beipackzettel und ihrem eigenen Glossar. Das ist der einzige Befund,
   ohne dessen Behebung ich nicht freigeben würde.
2. **K-R2-2 · Die 90-Prozent-Pointe mit dem eigenen „offen"-Urteil versehen** —
   Story, `honest_statement` und Executive Summary. Eine Zuspitzung, die das
   eigene Fachdokument drei Klicks weiter zurücknimmt, ist teurer als jede
   vorsichtige Formulierung.
3. **K-R2-3 · Punktwert und Median einmal erklären** — vier Sätze, einzufügen am
   Ende von Akt 4/1. Ohne sie liest der Laie einen Widerspruch und der
   Fachleser eine Auswahl.
4. **K-R2-4 · Den kaputten Prolog-Satz reparieren** — Datenfeld, fünf Minuten.

Dazu der Übersetzungsdurchgang aus Abschnitt 3: Kipppunkt einordnen (die
brisanteste Zahl der Fassung ist derzeit die stummste), Vermeidungskosten
auflösen, Chart-Legende in Sprache übersetzen, „P(…) = …" aus dem Sichtfeld des
Lesers nehmen. Das sind rund 400 geänderte Wörter, keine neue Rechnung.

Was ich zusätzlich empfehle, aber nicht zur Freigabebedingung machen würde:
Akt 4 von sechs auf fünf Schritte ziehen (M-R2-2), den Endzustand der
Akt-4-Grafik symmetrisch machen (M-R2-3), die sechs offenen MITTEL-Befunde aus
Runde 1 abarbeiten — allen voran **M1** (90,8 gegen 93,0 direkt neben „±0,04 %
genau") und **M10** (die vier eindrucksvollsten Zahlen im Fließtext tragen
keinen Beleg, auf einer Seite, deren Quellenkapitel „Jede Zahl mit Herkunft"
heißt) — und **M2/M3** (Headline, Teaser, Hero-Kennzahlen), damit der Einstieg
endlich die Geschichte erzählt, die die Seite inzwischen hat.

---

## Anhang · Messwerte dieser Prüfung

| Kennzahl | v0.1 (Runde 1) | v0.2 (Runde 2) |
|---|---|---|
| Story, Bildschirmhöhen Desktop 1440×900 | 33 | **42,6** |
| Story, Bildschirmhöhen Mobil 390×844 | 47,5 | **65,5** |
| Story, gerenderte Wörter | ~6.350 | **7.915** |
| Quellen | 44 | **54** |
| Limitationen-Kacheln | 8 | **16** |
| Schritte je Akt | 4·4·4·4·4 | 4·4·4·**6**·4 |
| Akt-4-Step-Cards, Wörter / Zahlwerte | — | **751 / 76** |
| Akt-1-Step-Cards, Wörter | — | 243 |
| White Paper, Bildschirmhöhen Desktop | — | 52,6 |
| JS-Konsolenfehler | 0 | **0** (ein blockierter Google-Fonts-Abruf, Egress) |
