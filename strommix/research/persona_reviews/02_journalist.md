---
review: "02 · Journalismus / Redigat vor Veröffentlichung"
persona: "Erfahrene:r Wissenschafts- und Wirtschaftsjournalist:in (Print + Online, überregionales Qualitätsmedium). Rolle: Redakteur:in, die den Text vor Freigabe redigiert und auf Angreifbarkeit prüft — Blattmacher-Blick, nicht Peer-Review."
datum: "2026-08-19"
pruefobjekt: "/strommix-story.html (v 0.1)"
kontext: "/whitepaper-strommix.html · strommix/research/story_claims_check.md · strommix/docs/03_grundlage_erweitert_v2.md"
verfahren: "Volltext gelesen; Seite unter localhost gerendert (Chromium 1194, 1440×900 und 390×844), komplett durchgescrollt (33 bzw. 47,5 Bildschirmhöhen); alle Zahlen im Fließtext gegen story_data.json und story_claims_check.md gegengeprüft."
---

# Redigat · „Ein Stromsystem, zwei Preisschilder"

## Gesamturteil

Handwerklich ist das eine der saubersten Datengeschichten, die mir dieses Jahr auf den Tisch gekommen sind — Bandbreiten statt Punktwerte, Gegenpositionen im Text statt im Fußnotenkeller, ein eigenes Limitationen-Kapitel, und jede Zahl kommt aus einer Datei statt aus dem Bauch. Genau deshalb wiegen die Befunde schwer, die ich unten aufliste: Die Story schlägt sich mit einem Gegner herum, den sie nie benennt (und der bei näherem Hinsehen ihr eigenes Vorpapier ist), sie verschweigt bis Scrolltiefe 90 %, dass die geprüfte Studie nie im Volltext vorlag, und ihr zentraler Satz in Akt 4 wird von den eigenen Perzentilen widerlegt — ausgerechnet in die Richtung, die die Studie schont. Der Stoff trägt, die Dramaturgie trägt in weiten Teilen, aber in dieser Fassung würde ich sie nicht ins Blatt lassen.

**Empfehlung: nach Redigat publizieren.** Kein Neuschreiben — aber ein substanzielles Redigat an sechs Stellen, davon drei, an denen die Aussage selbst korrigiert werden muss, nicht nur die Formulierung.

**Befunde: 7 KRITISCH · 16 MITTEL · 9 KLEIN**

---

## Vorbemerkung · Was jemand mitnimmt, der nach 2 Minuten abbricht

Zwei Minuten sind: Hero, Prolog, Akt 1 / Schritt 1–2. Was dabei hängen bleibt:

> „Eine Studie sagt, ein Kernkraft-System kostet 125 €/MWh und 100 % Erneuerbare 321 €/MWh. Jemand rechnet das gerade nach."

Das ist zu wenig — und es ist die falsche Hälfte. Der Abbrecher nimmt **die Zahl der Studie mit, aber nicht den Befund**. Wer nach zwei Minuten aussteigt, hat als einzige Botschaft die These der Gegenseite im Kopf, verstärkt durch eine Fraunces-Headline in 70 Pixel. Das ist die schlechteste aller möglichen Wirkungen, und sie ist reparabel: Die Kernbotschaft der Story („Korrigiert man die Annahmen, verschwindet der Faktor 2,6 fast vollständig — aus 125 gegen 321 werden 161 gegen 142 gegen 197 gegen 270") muss in den Hero-Teaser, nicht erst in Akt 4.

Zum Vergleich: Wer die ganze Story liest, nimmt mit „Systemkostenzahlen sind Annahmenketten, und der Zinssatz ist der stärkste Hebel". Das ist die *richtige* Botschaft und sie ist gut gebaut. Sie kommt nur 25 Minuten zu spät.

---

# KRITISCH
*falsch, irreführend oder tödlich für die Glaubwürdigkeit*

## K1 · Der Gegner ist ein Phantom — und es ist das eigene Vorpapier

**Fundstelle:** Zeile 465 („In den Annahmen-Audits, die zu dieser Studie kursieren"), Zeile 728 („Ein kursierender 30-Jahres-Plan"), Zeile 395–396 („Der Satz ‚das Studienergebnis kehrt sich um', den man in der Debatte findet"), Zeile 431 ff. (kompletter Akt 5).

**Ist:** Drei Mal baut die Story einen namenlosen Widerpart auf, der „kursiert" bzw. „in der Debatte" zu finden sei. Ein Blick ins Freigabe-Dossier zeigt: Gemeint ist durchgehend `docs/03_grundlage_erweitert_v2.md` — im Dossier durchgängig „das MD" —, also das **eigene, frühere Grundlagendokument dieses Projekts**. Der komplette Akt 5, inklusive des schärfsten Vorwurfs der ganzen Story („dabei einen Fehler gefunden", Zeile 758), richtet sich gegen ein Papier, das nie erschienen ist, das der Leser nirgends nachschlagen kann — und das aus derselben Feder stammt wie die Story.

**Warum das der schlimmste Befund ist:** Es gibt genau zwei Lesarten, und beide sind schlecht. Entweder der Leser glaubt die Formulierung — dann glaubt er an eine öffentliche Debatte, die es so nicht gibt, und die Story hat sich einen Strohmann gebaut. Oder jemand recherchiert nach (das Repository ist öffentlich) — dann steht da eine Geschichte, die ihr eigenes Arbeitspapier als anonyme Gegenpartei inszeniert. Ein Leserbrief mit dieser Beobachtung wäre nicht zu beantworten. Bei aller Sorgfalt in den Zahlen: Das hier ist das eine Ding, das die gesamte Anlage kippen kann.

**Vorschlag:** Entweder radikal offenlegen oder radikal streichen. Ich empfehle offenlegen — ehrlich erzählt ist das sogar der bessere Text, weil Selbstkorrektur die stärkste verfügbare Glaubwürdigkeitswährung ist. Konkret:

- Zeile 728 → **„Aus dieser Analyse ist im Sommer 2026 ein eigener 30-Jahres-Plan bis 2056 hervorgegangen — ein Arbeitspapier, das wir hier gegen unsere eigene Datenbasis prüfen. Fünf seiner sechs Startwerte für 2026 liegen unter den belegten Ist-Werten."**
- Zeile 465 → **„Wir haben diesen Hebel in unserem eigenen ersten Annahmen-Check zunächst übersehen: Dort galten die 1.700 Stunden als ‚plausibel'."**
- Zeile 395 → **„Der Satz ‚das Studienergebnis kehrt sich um' stand in unserem eigenen ersten Entwurf. Wir haben ihn geprüft und verworfen."**
- Und dann eine Zwischenüberschrift, die daraus Dramaturgie macht statt Peinlichkeit: **„Der erste, den wir korrigieren mussten, waren wir selbst."**

## K2 · Der zentrale Satz von Akt 4 wird von den eigenen Zahlen widerlegt

**Fundstelle:** Zeile 656–658, Überschrift Zeile 652 („Die Rangfolge ist nicht entschieden"), Wiederaufnahme Zeile 396–398.

**Ist:** „Die Bänder überlappen **vollständig** im unteren Bereich. ‚Das eine ist teurer als das andere' ist bei dieser Streuung **keine trennscharfe Aussage**."

**Gegenprüfung an `story_data.json` → `monte_carlo.presets.*.configs.base`:**

| | P5 | P25 | P50 | P75 | P95 |
|---|---|---|---|---|---|
| Kostenminimum (Kernkraft) | 133,1 | **149,1** | **161,2** | 173,2 | 189,7 |
| 80 % EE + Gas | 131,7 | 137,4 | **141,8** | **146,2** | 152,1 |

Die beiden mittleren Hälften (P25–P75) — also genau die dunklen Felder, die die Story dem Leser in Zeile 647 als „das mittlere Viertel bis Dreiviertel" erklärt — **überlappen überhaupt nicht**. 149,1 beginnt oberhalb von 146,2. Und der **Median des Kernkraft-Szenarios (161) liegt über dem 95-Prozent-Perzentil des Gas-Pfads (152)**. Die Überlappung, die die eigene Grafik korrekt mit „133–152 €/MWh" beziffert, betrifft rund das untere Viertel der Kernkraft-Verteilung gegen die gesamte Gas-Verteilung.

**Warum das kritisch ist:** Das ist kein Formulierungs-, sondern ein Aussagefehler, und er geht in die Richtung, die die geprüfte Studie schont. Eine Redaktion, die sich Neutralität auf die Fahne schreibt, darf sich in *keine* Richtung irren — auch nicht in die vorsichtige. Und ein Fachleser rechnet das in zwanzig Sekunden nach, weil die Datentabelle direkt darunter steht (Zeile 437–443 im Render). Der Vorwurf lautet dann nicht „Rechenfehler", sondern „Beschönigung" — und das ist der teurere Vorwurf.

**Vorschlag Zeile 656–659:**

> **„Die Verteilungen berühren sich — aber sie decken sich nicht. Der Überlappungsbereich liegt zwischen 133 und 152 €/MWh; dort trifft das untere Viertel der Kernkraft-Ziehungen auf die gesamte Bandbreite des Gas-Pfads. Oberhalb davon, also in drei von vier Ziehungen, liegt das Kernkraft-Szenario teurer: Sein Median von 161 €/MWh liegt sogar über dem 95-Prozent-Perzentil des Gas-Pfads. Das ist kein Patt — es ist ein Vorsprung, der die Bandbreite überlebt. Was die Streuung dagegen wirklich offenlässt: die Frage, ob es 20 Euro Unterschied sind oder 50. Gegenüber beiden wasserstofflastigen Pfaden bleibt das Kernkraft-Szenario klar günstiger — die Studie hat in diesem Punkt recht behalten."**

Die Zwischenruf-Passage in Zeile 396–398 („ein Rangwechsel um einen Platz bei überlappenden Bändern") und die Kastenzeile `mc-honest` müssen entsprechend nachgezogen werden. Und die Akt-4-Überschrift „Die Rangfolge ist nicht entschieden" ist nach dieser Korrektur schlicht falsch — Vorschlag: **„Der Vorsprung überlebt die Unsicherheit — der Faktor 2,6 nicht."**

## K3 · Wer die Studie geschrieben hat und wofür ihre Zahlen gelten, steht nirgends

**Fundstelle:** Prolog, Zeile 335–340; Hero, Zeile 310–314; durchgehend.

**Ist:** Die Story nennt „eine Szenarioanalyse von Global Energy Solutions" und dann 44 Mal Zahlen daraus. Sie sagt nie:
- **wer Global Energy Solutions e.V. ist.** Das eigene Grundlagendokument hat dafür ein ganzes Kapitel („2. Wer steht hinter der Studie?"): 2020 im Ulmer Rathaus gegründet, initiiert vom FAW/n, ursprünglicher Vereinsfokus grüner Wasserstoff, Methanol und Power-to-X-Importe. Dass ein wasserstoffnaher Verein eine Studie vorlegt, in der die wasserstofflastigen Pfade am teuersten abschneiden, ist eine der bemerkenswertesten und fairsten Beobachtungen im ganzen Material — und sie fehlt.
- **für welches Zieljahr und welchen Systemumfang** die 125 und die 321 gelten. Laut Grundlagendokument: **Zieljahr 2045, 950 TWh Jahresbedarf.** Steht nirgends auf der Seite. Ohne das sind beide Schlagzeilenzahlen bedeutungslos — sie könnten für 2030, 2045 oder 2060 gelten.
- **wann die Studie erschienen ist** (Juli 2026, also vier Wochen alt). Aktualität ist Nachrichtenwert und gehört in den Prolog.

**Warum kritisch:** „Sie haben eine Studie zerlegt, ohne Ihren Lesern zu sagen, wer sie geschrieben hat" ist der erste Satz jedes ernsthaften Leserbriefs. Und der Vorwurf „Sie verschweigen die Interessenlage" trifft hier doppelt unangenehm, weil die Interessenlage **entlastend** für die Studie wäre.

**Vorschlag, neuer Absatz nach Zeile 340:**

> **„Global Energy Solutions e.V. ist ein 2020 in Ulm gegründeter Verein aus dem Umfeld des Forschungsinstituts FAW/n. Sein ursprüngliches Thema war grüner Wasserstoff und dessen Import aus sonnenreichen Regionen. Dass ausgerechnet dieser Verein die wasserstofflastigen Pfade als die teuersten ausweist, spricht eher für als gegen die Unbefangenheit der Rechnung. Die Studie erschien im Juli 2026 und rechnet auf das Zieljahr 2045 mit einem Jahresbedarf von 950 Terawattstunden — alle Zahlen dieser Geschichte beziehen sich auf dieses System."**

## K4 · Die geprüfte Studie wurde nie gelesen — und das steht bei Scrolltiefe 90 %

**Fundstelle:** Zeile 814–822 (Selbstkritik), Zeile 600–602 im Render (Limits-Kachel „Kein Volltext geprüft"), Disclaimer Zeile 999–1007.

**Ist:** Die Offenlegung ist vorbildlich formuliert („Alle Aussagen über die Methodik der Studie beruhen auf einer Sekundärwiedergabe und konnten nicht am Original gegengeprüft werden") — aber sie steht bei rund 90 % Scrolltiefe, hinter fünf Akten, in denen der Leser die Studie längst für auseinandergenommen hält. Das ist die klassische Konstruktion „Enthüllung vorne, Einschränkung hinten", und Redaktionen bekommen dafür zu Recht Ärger.

Zweiter Punkt, der schwerer wiegt als die Position: Das Wort „**Sekundärwiedergabe**" wird nirgends aufgelöst. Der Leser erfährt nicht, *welche* Sekundärwiedergabe. Die Antwort ist wieder dieselbe wie bei K1 — das eigene MD. Damit steht: Wir prüfen eine Studie, die wir nicht gelesen haben, anhand einer Wiedergabe, die wir selbst geschrieben haben, und sagen dem Leser weder das eine noch das andere an der Stelle, an der er es bräuchte.

**Vorschlag:** Die Einschränkung wandert in den Prolog, als eigener Absatz vor dem Fairness-Kasten (Zeile 348), und wird konkret:

> **„Eine Einschränkung, die an den Anfang gehört und nicht ans Ende: Wir haben das Studien-PDF selbst nie zu Gesicht bekommen — der Abruf war in unserer Arbeitsumgebung technisch blockiert. Was Sie hier über die Methodik der Studie lesen, stützt sich auf unsere eigene, vor Wochen angefertigte Wiedergabe ihrer Annahmetabellen. Jede einzelne Zahl daraus haben wir gegen unabhängige Quellen gehalten — aber die Studie im Original haben wir nicht gelesen, und das gehört genannt, bevor Sie weiterlesen."**

Die Passage hinten bleibt stehen (als Zusammenfassung), verliert aber die Rolle des Erstbekenntnisses.

## K5 · „Faktor 9" ist genau der Vergleich, den der eigene Beipackzettel als bedeutungslos brandmarkt

**Fundstelle:** Zeile 481–482 („Zwischen diesen Polen liegt eine Spanne von mehr als Faktor 9"), Widerspruch in Zeile 490–496 des Renders (Beipackzettel).

**Ist:** Die 9 entsteht aus 17.264 €/kW (Hinkley Point C, **Gesamtprojekt, laufende Preise**) geteilt durch 1.867 €/kW (APR1400 Inland, **Overnight**). Zwei Sätze weiter unten erklärt die Story selbst, dass OCC keine Bauzinsen und keine Eigentümerkosten enthält, dass Hinkley real in Preisen von 2015 bei 12.408 statt 17.264 liegt, und lehnt „den in der Debatte beliebten ‚Mittelwert über fünf Projekte'" ab, weil „ein ungewichtetes Mittel über Vertragspreise, Gesamtprojektkosten und verschiedene Preisbasen keine ökonomische Bedeutung hat".

Der Faktor 9 ist derselbe Fehler in der Divisionsform. Und er steht in einer `.big`-Auszeichnung, also in genau der Typografie, mit der die Story ihre belastbaren Zahlen markiert. Ein Fachchecker zitiert diese zwei Passagen nebeneinander, und die Sorgfalts-Aura der Seite ist weg.

**Vorschlag Zeile 480–482:**

> **„Hinkley Point C kostet 17.264 €/kW — allerdings als Gesamtprojekt in laufenden Preisen, also inklusive Bauzinsen und Eigentümerkosten, die in der koreanischen Zahl gar nicht enthalten sind. Die beiden Werte sind nicht teilbar; genau darum geht es. Bleibt man innerhalb einer Abgrenzung, liegen die Overnight-Kosten zwischen 1.867 (Korea) und 7.583 €/kW (EPR2) — Faktor 4. Bleibt man bei Gesamtprojekten, zwischen 4.945 (Barakah) und 17.264 €/kW — Faktor 3,5. Der eine große Sprung liegt nicht innerhalb der Kategorien, sondern zwischen den Kontinenten."**

(Zahlen aus der eigenen Tabelle Akt 2 — bitte gegenrechnen, falls die Abgrenzungsspalte anders gelesen wird.)

## K6 · Das Kostenüberschreitungs-Szenario zählt vermutlich doppelt — und ist der letzte Eindruck von Akt 4

**Fundstelle:** Zeile 663–679 (Akt 4 / Schritt 4), Chart-Endzustand von Akt 4.

**Ist:** Auf die Kernkraft-Baukosten wird ein empirischer Überschreitungsfaktor von 2,03 bzw. 2,20 gelegt; das Szenario rutscht auf 255 €/MWh. Die Story nennt als offene Flanke nur, dass die Faktoren „überwiegend aus westlichen Einzelprojekten der Vergangenheit" stammen.

**Die eigentliche Flanke steht nicht im Text.** In `model_params.json` definiert das Projekt den Faktor selbst als *„Faktor auf die ursprüngliche Kostenschätzung (decision-to-build)"* — und vermerkt zur Obergrenze ausdrücklich: *„Obergrenze westliche Erstbauten (Flamanville, Vogtle, HPC)"*. Die CAPEX-Anker des Modells sind aber genau diese Projekte: `eu_mittel` 12.000 €/kW (Anker Polen / Sizewell C), `erstprojekt` 17.500 €/kW (Anker Flamanville / Vogtle / HPC). Das sind bereits **realisierte, also bereits überschrittene** Kosten. Sie noch einmal mit 2,2 zu multiplizieren heißt, dieselbe Kostenüberschreitung zweimal zu berechnen.

Verschärfend: Dieselbe Datei hält fest, der Faktor sei *„bewusst NICHT im Basisfall aktiv, damit der Modellkern nicht mit Risikoannahmen vermischt wird"*. In der Grafik ist der Überschreitungsfall aber der **Endzustand von Akt 4** — die Bildunterschrift lautet beim Herausscrollen „Akt 4 · Mit empirischer Kostenüberschreitung". Der letzte visuelle Eindruck des längsten Akts ist also ein 255-Euro-Balken aus einem Szenario, das das eigene Modell als abgeschaltete Risikoannahme führt.

**Vorschlag:** (a) Die Doppelzählung offenlegen — ein Satz genügt und macht die Story stärker, nicht schwächer:

> **„Ein Einwand, der uns selbst am meisten zu schaffen macht: Unsere Baukosten sind an realisierten westlichen Projekten geeicht — an Flamanville, Vogtle, Hinkley Point. Diese Projekte *haben* ihre Kostenüberschreitung bereits hinter sich. Wer darauf noch einmal einen Überschreitungsfaktor legt, rechnet dieselbe Eskalation womöglich zweimal. Deshalb steht dieses Szenario hier als Obergrenze, nicht als Erwartungswert — und deshalb ist der Balken darüber, ohne Aufschlag, der ehrlichere."**

(b) Den Endzustand der Grafik auf den Basisfall zurückstellen und den Überschreitungsfall als Zwischenschritt zeigen.

## K7 · „Jeder unsichere Parameter" ist nicht wahr — und der wichtigste fehlt

**Fundstelle:** Zeile 640–643 (Akt 4 / Schritt 2), im Widerspruch zum Epilog Zeile 826–830.

**Ist:** „**Jeder** unsichere Parameter — Baukosten, Betriebskosten, Volllaststunden, insgesamt 23 Größen — wird als Dreiecksverteilung … gezogen."

**Gegenprüfung an `monte_carlo.meta.assumptions`:** Nicht gezogen werden Wetterjahr, Lastprofil, Lebensdauern, Wirkungsgrade, Brennstoff- und Entsorgungskosten, CO₂-Preis, Netzinvestitionsvolumen und die H₂-Speicherkosten. Der Dispatch wird pro Szenario **einmal** mit Mittelwerten gerechnet und zwischengespeichert; die 1.000 Ziehungen wirken „nur auf die Kostenseite". Und der WACC ist im Basislauf **fest auf 5 %** — die Chart-Unterzeile sagt das sogar, der Fließtext nicht.

**Warum das kritisch und nicht nur ungenau ist:** Der Epilog erklärt den Kapitalkostensatz zum „stärksten Glied dieser Kette" und zur eigentlichen Kernbotschaft. Ausgerechnet dieser Parameter ist aus dem Unsicherheitsband herausgehalten. Die Story zeigt also eine Bandbreite, die ihre eigene Hauptthese nicht enthält — und der Leser erfährt das nur, wenn er die Chart-Unterzeile in 11 Pixel Mono liest. Dabei liegen die Daten vor: Die `wacc`-Konfiguration ergibt für das Kernkraft-Szenario P5 127 bis P95 **256** €/MWh statt 133–190. Das ist die eindrucksvollste Zahl im ganzen Datensatz und sie wird nicht erzählt.

**Vorschlag Zeile 640–643:**

> **„Gezogen werden die Kostengrößen: Baukosten, Betriebskosten und Volllaststunden je Technologie, 23 Größen insgesamt, je 1.000-mal aus einer Dreiecksverteilung zwischen unserem dokumentierten Minimum und Maximum. Bewusst festgehalten haben wir dabei zweierlei: das Wetterjahr — und den Zinssatz, den wir hier auf 5 Prozent fixieren. Was passiert, wenn man auch ihn variieren lässt, steht im Epilog; es ist die größte Zahl dieser Geschichte."**

Und dann im Epilog den Bogen schließen: **„Lässt man in derselben Rechnung auch den Kapitalkostensatz zwischen 3 und 9 Prozent laufen, spreizt sich das Kernkraft-Szenario von 133 bis 190 auf 127 bis 256 €/MWh. Kein anderer Parameter dieser Geschichte kann das."**

---

# MITTEL
*man versteht es falsch, oder man verliert den Leser*

## M1 · Zwei verschiedene Zahlen für dieselbe Sache — direkt neben „auf ±0,04 % genau"

**Fundstelle:** Datentabelle Akt 1 (Wind an Land, LCOE **90,8**) gegen Akt-2-Grafik und Zeile 456–458 („Studie · 1.700 h" → **93,0**), im Widerspruch zu Zeile 469–472 („reproduzieren die Studien-LCOE auf ±0,04 % genau").

**Ist:** Der Leser sieht im selben Scroll-Verlauf zwei Werte für „Wind an Land bei 1.700 Stunden nach Studienannahme", 90,8 und 93,0, Abweichung 2,4 %. Zwei Bildschirme vorher hat die Story behauptet, die Studienformel auf 0,04 % genau nachzubauen. Der Grund (93,0 rechnet bereits mit eigenen Opex-/Laufzeitannahmen) ist plausibel, steht aber nirgends — und das Label „Studie · 1.700 h" behauptet ausdrücklich das Gegenteil.

**Vorschlag:** Grafiklabel ändern zu **„1.700 h · unsere Rechnung"**, und in Zeile 458 ergänzen: **„— wir rechnen hier schon mit unseren eigenen Betriebskosten, deshalb 93,0 statt der 90,8 aus der Studientabelle."**

## M2 · Headline und Teaser tragen den Befund nicht

**Fundstelle:** Zeile 309–314.

**Ist:** „Ein Stromsystem, zwei Preisschilder" ist ein hübscher Titel und eine leere Aussage — er beschreibt den Anlass, nicht den Ertrag. Der Teaser wiederholt die Zahlen der Studie und endet mit einer rhetorischen Frage („woher kommen sie?"). Auf einer Homepage-Kachel oder in einem Social-Preview steht damit ausschließlich die These der Gegenseite.

**Vorschlag Headline:** **„Ein Stromsystem, zwei Preisschilder — und ein Faktor, der beim Nachrechnen schrumpft"**, alternativ knapper: **„Die 125 und die 321"** mit Dachzeile „Was von einem Kostenvergleich übrig bleibt, wenn man ihn nachrechnet".

**Vorschlag Teaser (ersetzt Zeile 310–314):**

> **„Dieselbe Studie nennt für ein klimaneutrales deutsches Stromsystem 125 und 321 Euro je Megawattstunde — Kernkraft gegen hundert Prozent Erneuerbare, ein Faktor von 2,6. Wir haben die Annahmen dahinter Zahl für Zahl gegen Marktdaten gehalten. Der Faktor überlebt das nicht: Aus 125 gegen 321 werden 161 gegen 142 — und selbst dieser Abstand ist kleiner als die Unsicherheit, die in beiden Zahlen steckt."**

## M3 · Die Hero-Kennzahlen sprechen Projektsprache, nicht Lesersprache

**Fundstelle:** Zeile 315–320 — „11 korrigierte Claims · 4 verworfene · 6 Setzungen · 44 Quellen".

**Ist:** „Claim", „verworfen", „Setzung" sind Vokabeln aus dem internen Prüfprozess. Ein interessierter Laie weiß nicht, was eine „Setzung" ist (die Erklärung steht 30 Bildschirme später im Quellenanhang), und „4 verworfene" liest sich ohne Kontext eher beunruhigend als vertrauensbildend.

**Vorschlag:** **„44 Quellen · 11 Zahlen korrigiert · 4 Behauptungen verworfen · 6 offen gekennzeichnete Annahmen"**. Vier Wörter mehr, aber jeder Begriff selbsterklärend.

## M4 · „PFLICHT-ELEMENT" macht aus Fairness eine Pflichtübung

**Fundstelle:** Kicker der Kästen (`cp_*`), gerendert als „FAIRNESS · PFLICHT-ELEMENT" und „GEGENPOSITION · PFLICHT-ELEMENT", sechs Vorkommen; dazu „PFLICHT-BEIPACKZETTEL" in Zeile 596.

**Ist:** Das ist Redaktionsprozess im Endprodukt. Und die Wirkung ist paradox: Ein Kasten, der als „Pflicht" etikettiert ist, liest sich wie widerwillig eingerückt — er entwertet genau die Fairness, die er beweisen soll.

**Vorschlag:** Durchgängig auf „**GEGENPOSITION**" bzw. „**WAS DAGEGEN SPRICHT**" kürzen, „PFLICHT-BEIPACKZETTEL" auf „**EINSCHRÄNKUNG**".

## M5 · „◐ H2-2024-basiert (Teilzeitraum)" mitten im Fließtext

**Fundstelle:** fünf Vorkommen (`<span class="simlabel">`), jeweils am Absatzende in Akt 4 und Akt 5.

**Ist:** Ein Halbkreis-Symbol plus ein Kürzel, das nirgends im Sichtfeld aufgelöst wird. Der Leser wird mitten im Lesefluss von einer Maschinenmarkierung gestoppt und weiß nicht, ob er etwas verpasst hat.

**Vorschlag:** Symbol behalten, Text ausschreiben: **„◐ gerechnet auf einem halben Wetterjahr (Juli–Dez. 2024)"** — mit Tooltip für den Rest. Idealerweise nur **einmal** pro Akt, nicht pro Schritt.

## M6 · Akt 5 bricht das Versprechen des Prologs

**Fundstelle:** Zeile 342–345 („Sie nimmt **die Studie** auseinander wie eine Uhr") gegen Akt 5 ab Zeile 728.

**Ist:** Der Prolog verspricht fünf Akte über *eine* Studie. Akt 4 liefert das Ergebnis dieser Prüfung. Akt 5 wechselt dann das Prüfobjekt komplett — anderes Dokument, anderer Zeithorizont (2056 statt 2045), andere Fragestellung (Ausbaupfad statt Kostenvergleich). Der Leser, der 25 Minuten investiert hat, muss an dieser Stelle neu justieren und fragt sich zu Recht, warum.

**Vorschlag:** Akt 5 braucht eine Brücke, die ihn als eigene Frage einführt statt als Fortsetzung. Ein Zwischenruf vor Akt 5:

> **„Bis hier ging es um eine Frage: Was kostet ein Zielsystem? Der zweite Streit dreht sich um eine andere: Was kostet der Weg dorthin? Dafür kursieren keine Studien, sondern Ausbaupläne — und einen davon haben wir selbst geschrieben. Er hält der Prüfung an einer entscheidenden Stelle nicht stand."**

(Formulierung setzt K1 voraus.)

## M7 · Der Epilog beantwortet die Eingangsfrage nicht — und führt neues Material ein

**Fundstelle:** Zeile 825–855.

**Ist:** Die Story startet mit „125 gegen 321 — woher kommen die Zahlen?" und endet mit „der Kapitalkostensatz ist politisch". Beides ist richtig, aber es ist nicht dieselbe Frage. Dazwischen führt der Epilog **neues Material** ein: CO₂-Preis, ETS 1 gegen ETS 2, Gas-mit-CCS-Lücke, Marktpreis Mai 2026. Das sind drei zusätzliche Fakten in den letzten 300 Wörtern — nach 25 Minuten Konzentration die schlechteste Stelle dafür.

**Vorschlag:** (a) Den ETS-Absatz (Zeile 843–851) aus dem Epilog heraus und als Kasten in Akt 4 verschieben, wo der CO₂-Preis ohnehin Modellparameter ist. (b) Vor dem WACC-Schluss die Hook-Frage explizit schließen:

> **„Zur Ausgangsfrage: Die 125 und die 321 sind beide echt gerechnet. Was sie nicht sind, ist vergleichbar präzise. Nach unseren Annahmen bleiben von einem Faktor 2,6 noch 161 gegen 270 — und zwischen den beiden mittleren Pfaden ein Abstand, den man mit einer einzigen Zinsentscheidung in beide Richtungen kippen kann. Das ist die eigentliche Antwort, und sie führt zu der Größe, um die es in Wahrheit geht."**

Dann erst der WACC-Absatz. So wird aus zwei Botschaften eine.

## M8 · „Belegter Ist-Wert" vergleicht 2026-Plan gegen 2024-Ist

**Fundstelle:** Akt 5 / Schritt 1, Grafiklabel „◉ belegter Ist-Wert", Zeile 733–738; Datentabelle Akt 5.

**Ist:** Der Strombedarf wird mit „560 (Plan 2026) gegen 518 TWh, −7 %" ausgewiesen. Laut Dossier ist 518 der **Bruttostromverbrauch 2024** (NEP-Basisjahr); für 2025 nennt dasselbe Dossier eine Spanne von 512–526 TWh. Ein Planwert für 2026 gegen einen Ist-Wert von 2024 zu halten und das Ergebnis „belegter Ist-Wert" zu nennen, ist angreifbar — zumal in einem Text, der zwei Bildschirme vorher erklärt, wie leicht man Preisbasen und Bezugsjahre durcheinanderbringt.

**Vorschlag:** Jahreszahl ins Label (**„Ist 2024/25"**) und im Text: **„Der Strombedarf ist dagegen zu hoch angesetzt: 560 Terawattstunden für 2026, während der Bruttostromverbrauch 2024 bei 518 lag und für 2025 zwischen 512 und 526 geschätzt wird."**

## M9 · Studienannahmen für 2045 werden gegen Auktionsergebnisse von 2026 gehalten

**Fundstelle:** Akt 2 / Schritt 1 und 2, Zeile 440–466.

**Ist:** Die Überschrift „Photovoltaik: zu teuer angesetzt" stützt sich auf ISE-2024-Werte und BNetzA-Zuschläge von März 2026. Die Studienannahme gilt laut eigener Akt-3-Tabelle für **2045**. Die Grafik zeigt die ISE-Projektion 2045 (31–50 €/MWh) korrekt mit an — der Text erwähnt sie mit keinem Wort. Damit steht der stärkere, saubere Vergleich (Studienannahme 2045 gegen Projektion 2045) nur im Bild, und der angreifbarere (2045 gegen heute) im Text.

**Vorschlag:** Den Zeitbezug in den Text ziehen — er macht das Argument *stärker*: **„Und die Studie rechnet damit nicht für heute, sondern für 2045. Das Fraunhofer ISE projiziert für dieses Jahr 31 bis 50 Euro je Megawattstunde. Die Studienannahme liegt also nicht knapp, sondern um den Faktor drei über dem, was für ihr eigenes Zieljahr erwartet wird."**

## M10 · Attributionslücken im Fließtext

**Fundstelle:** mehrere. Belastbare Zahlen ohne Quellenchip im laufenden Text:

| Zeile | Aussage | fehlt |
|---|---|---|
| 556–557 | „Zwischen 1970 und 1978 stiegen die Kosten um 50 bis 200 Prozent" | Beleg (Lovering [33]) |
| 558–561 | „im Median 2,8-mal so teuer … 2,2-mal so lange" | Beleg — die schärfste historische Zahl der Story steht völlig unattribuiert |
| 851–854 | ETS-1-Marktpreis Mai 2026 = 74 €/t | Beleg; das danebenstehende [11] belegt ausdrücklich **ETS 2** |
| 408–410 (Render 461) | „europäische Ist-Anlagen 2.075 bis 2.196 €/kW" | Beleg (vermutlich [20]) |
| Glossar OCC/EPC | „EDF nennt … rund 73 Mrd. € ohne und rund 100 Mrd. mit Finanzierung" | Beleg ([8] liegt vor) |
| Glossar FOAK / Fairness-Kasten | „minus 32 Prozent vom ersten Block zum Schnitt über vier" (OPG Darlington) | Beleg |
| 566–568 | „Die verbreitete Erzählung lautet …" | wer erzählt das? |

**Vorschlag:** Chips nachziehen. Die Story hat sich das Versprechen „jede Zahl mit Herkunft" selbst auf die Fahne geschrieben (Überschrift des Quellenanhangs) — dann muss es auch für die Zahlen gelten, die im Fließtext den größten Eindruck machen.

## M11 · Die Farbsemantik bricht in Akt 4

**Fundstelle:** CSS-Kommentar Zeile 24–26 („Blau = die genannte Zahl / die einfache Erzählung; Terrakotta = Nachrechnung, Korrektur, Bandbreite") gegen Akt-4-Grafik.

**Ist:** Das Zwei-Farben-System ist konsequent durchdacht und trägt drei Akte lang. In Akt 4 ist dann ausgerechnet „Kostenminimum" blau und alle anderen vier Szenarien terrakotta — obwohl alle fünf **eigene Nachrechnungen** sind. Der Leser, der die Farbe gelernt hat, liest „das ist die Zahl der Studie" oder „das ist die gute Option". In Akt 2 markiert Blau zusätzlich „unter der Studienannahme" bei den Kernkraftprojekten — eine dritte Bedeutung.

**Vorschlag:** In Akt 4 alle fünf Szenarien in derselben Farbe, das Kernkraft-Szenario allenfalls durch Strichstärke oder Label hervorheben. Und im Beipackzettel zu Akt 2 einen Satz zur Farbcodierung der 13 Punkte ergänzen.

## M12 · Mobil verdeckt die Textkarte das Diagramm fast vollständig

**Fundstelle:** Render bei 390×844.

**Ist:** Auf dem Telefon liegt die Step-Card über nahezu der gesamten Grafikfläche; hinter ihr ist das Diagramm nur als Schemen erkennbar. Damit funktioniert das Kernprinzip der Form — Text erklärt, was sich im Bild gerade ändert — auf dem Gerät nicht, auf dem die meisten Leser ankommen. Gesamtlänge mobil: **47,5 Bildschirmhöhen**.

**Vorschlag:** Mobil auf ein gestapeltes Layout wechseln (Grafik sticky oben, halbe Höhe; Karte scrollt darunter durch), oder die Karte auf ~55 % Viewporthöhe deckeln. Das ist eine Entwicklungsaufgabe, aber ohne sie ist die mobile Fassung eine andere, schlechtere Geschichte.

## M13 · „Die Studie … sagt das Gegenteil" überzieht Grubler

**Fundstelle:** Zeile 569–572.

**Ist:** „Die verbreitete Erzählung lautet, genau das habe die Kosten stabilisiert. Die Studie, die dafür zitiert wird, sagt das Gegenteil." Grubler zeigt, dass die Kosten im französischen Programm real um Faktor 3,5 stiegen. Das widerlegt „stabilisiert" — es ist aber nicht dasselbe wie „Standardisierung half nicht"; Grubler diskutiert selbst Skalierung, Designwachstum und Standortfaktoren als Treiber. „Sagt das Gegenteil" ist eine Zuspitzung, die der Leser als „Grubler hält Serienbau für wirkungslos" liest.

**Vorschlag:** **„Die Arbeit, die dafür am häufigsten zitiert wird, stützt diese Erzählung nicht. Grubler misst über die gesamte Programmlaufzeit einen realen Kostenanstieg um den Faktor 3,5 — trotz Standardisierung, nicht wegen fehlender."**

## M14 · „Wir" wird nie eingeführt, und der Prolog widerspricht der Story

**Fundstelle:** Zeile 342 („Diese Story macht keine Gegenstudie") gegen Akt 4 („Wir haben die vier Szenarien mit unseren eigenen, dokumentierten Parametern nachgerechnet") und Akt 5 („Unsere eigene Dispatch-Rechnung landet bei 162,8 €/MWh").

**Ist:** Erstens: Wer ist „wir"? Der Fußzeile nach eine Person. Das erfährt der Leser nach 30 Bildschirmen. Zweitens: Ein eigenes stündliches Dispatch-Modell, eine eigene Monte-Carlo-Rechnung und eigene Szenarienwerte **sind** eine Gegenrechnung. Die Bescheidenheitsformel im Prolog ist gut gemeint, aber sie stimmt nicht, und sie verkauft die eigene Arbeit unter Wert.

**Vorschlag Zeile 342:** **„Diese Geschichte ist keine Gegenstudie — aber sie bleibt auch nicht beim Lesen. Wir haben die vier Szenarien mit eigenen, offengelegten Annahmen noch einmal durchgerechnet, Stunde für Stunde, und zeigen beide Ergebnisse nebeneinander."** Dazu eine Autorenzeile unter der Headline statt nur im Footer.

## M15 · Fünfmal exakt vier Schritte — die Form wird zum Metronom

**Fundstelle:** Struktur.

**Ist:** Jeder Akt hat genau vier `.step`-Karten, jede Karte hat ein bis drei Absätze, jeder Akt endet mit einer Prosa-Insel plus Datentabelle plus Deeplink. Ab Akt 3 weiß der Leser exakt, was kommt, und das Wissen kostet Spannung. In Akt 3 ist der Rhythmus zudem inhaltlich am dünnsten: Schritt 1 („Es war einmal billig") und Schritt 4 („Und heute") tragen zusammen eine Aussage, die auch in einem Schritt Platz hätte.

**Vorschlag:** Wenn irgendwo gekürzt werden muss — und das muss es (siehe Länge unten) —, dann hier: **Akt 3 auf drei Schritte**, Schritt 1 und 4 zusammenlegen. Und mindestens einen Akt bewusst aus dem Muster brechen lassen, z. B. Akt 4 mit fünf Schritten, damit die Form nicht vorhersagbar bleibt.

## M16 · Quelle [17] und [18] sind dasselbe PDF — mit unterschiedlicher Konfidenzstufe

**Fundstelle:** Quellenanhang.

**Ist:** Identischer Titel, identische URL, einmal Stufe **A**, einmal Stufe **C** mit der Notiz „PDF in dieser Session blockiert". Für den Leser sieht das aus wie ein Fehler im Apparat — und im Kern ist es die Offenlegung aus K4, nur an der Stelle, wo sie niemand sucht.

**Vorschlag:** Zu einem Eintrag zusammenführen, Stufe **C**, mit der ehrlichen Notiz. Eine Studie, die man nicht öffnen konnte, kann nicht Stufe A haben — auch nicht als Quelle für sich selbst.

---

# KLEIN
*Stil, Handwerk, Politur*

## S1 · „v 0.1 (Entwurf)" steht in der Dachzeile
Zeile 308 und im Disclaimer. Man veröffentlicht keine Seite, die sich selbst als Entwurf ausweist — das lädt den Leser ein, sie nicht ernst zu nehmen. Versionierung gehört in den Footer, nicht in die Dachzeile. **Vorschlag Dachzeile:** „Systemkosten · Eine Studie, zwei Zahlen · Stand August 2026".

## S2 · „MD" steht in den öffentlichen Quellennotizen
Quellen [6], [11], [34]: „Die Zuordnung im MD ist eine Fehlzuordnung", „Im MD fälschlich als Strom-CO2-Preis verwendet", „im MD als IAEA INIS angegeben". Internes Kürzel, für Leser bedeutungslos — und nach K1 ausgerechnet das Kürzel, das die Phantom-Quelle benennt. **Vorschlag:** durchgängig „in unserem Grundlagenpapier".

## S3 · Hero und Prolog sagen zweimal dasselbe
„weniger als die Hälfte" (Zeile 313) und „ein Faktor von rund 2,6" (Zeile 340) sind dieselbe Information in 40 Wörtern Abstand. Eines streichen — ich würde die Hälfte im Hero opfern und den Faktor behalten, weil er präziser ist.

## S4 · Etiketteninflation bei den Kickern
„Prolog", „Zwischenruf" (2×), „Beipackzettel", „Pflicht-Beipackzettel", „Fairness" (2×), „Gegenposition" (6×), „Gegenprobe", „Epilog", „Anhang". Elf verschiedene Labels für im Grunde drei Sorten Einschub. Ich würde auf drei reduzieren: **Zwischenruf** (eigene Einordnung), **Gegenposition** (was dagegen spricht), **Einschränkung** (was wir nicht wissen).

## S5 · Ghosting beim Grafikwechsel
Beim Übergang zwischen Akt-2-Schritt-2 und -3 bleiben die Beschriftungen der vorherigen Grafik (93,0 / 65,9 / 60,8 / 50,6) sichtbar hinter der neuen liegen und kollidieren mit den neuen Punkten. Fade-out-Dauer kürzen oder alte Labels vor dem Neuaufbau hart entfernen.

## S6 · Das Uhr-Bild wird nie eingelöst
„Sie nimmt die Studie auseinander wie eine Uhr" (Zeile 343) ist ein gutes Bild, das genau einmal vorkommt und dann nie wieder. Entweder es trägt durch (Akt-Überschriften als Uhrwerkteile: Feder, Räderwerk, Hemmung, Zeiger) oder es fliegt raus. Ein einzelnes, unbedientes Bild wirkt wie eine liegengelassene Requisite.

## S7 · Anlaufmuster in den ersten Sätzen
Akt 1/1 „Ein Kraftwerk kostet…", Akt 2/1 „Die Studie rechnet…", Akt 2/3 „Die Studie setzt…", Akt 3/4 „Die westlichen Projekte…", Akt 5/2 „Die Investitionsrechnung des Plans…". Fünf Szenen beginnen mit Artikel + Substantiv + Verb im gleichen Takt. Zwei davon auf einen Satz mit Bewegung umstellen — z. B. Akt 2/3: **„Dreizehn Kernkraftprojekte, drei Kontinente, und dazwischen passt eine ganze Ideologie."**

## S8 · „Sieben Begriffe, die alles tragen"
Zahl in der Überschrift = Wartungsrisiko; beim achten Eintrag stimmt sie nicht mehr. **Vorschlag:** „Die Begriffe, die alles tragen". (Bei „13 Projekte, drei Welten" dagegen unbedingt behalten — dort ist die Zahl die Pointe.)

## S9 · Lücken im Quellenapparat
[34] „Isar 2 Baukosten" hat keinen Publisher, nur „im MD als IAEA INIS angegeben"; [5], [7], [9], [10], [35], [36], [38], [39], [41] tragen keine Konfidenzstufe, obwohl die Legende darüber vier Stufen ankündigt. Wenn eine Stufe fehlt, sollte dort „–" mit Erklärung stehen, sonst wirkt der Apparat unfertig.

---

## Länge und Rhythmus · gesondert

**Messung:** 3.384 Wörter Erzähltext im Markup (ohne eingespeiste Zahlen), plus acht Gegenpositions-Kästen, plus acht Limitationen-Kacheln, plus 703 Wörter Glossar, plus 44 Quellen. Gerendert **6.350 Wörter** und **33 Bildschirmhöhen** am Desktop, **47,5** auf dem Telefon. Reine Lesezeit des Erzähltextes ~14 Minuten; realistische Verweildauer mit Grafiken, Tabellen und Tooltips eher 25–30.

**Urteil:** Für ein Wochenendstück oder ein Web-Spezial ist das vertretbar — aber nur, wenn jeder Akt seinen Platz verdient. Nach meiner Lesung:

- **Akt 1** (wie aus €/kW €/MWh werden): unbedingt behalten. Die didaktisch stärkste Passage der ganzen Seite, und die einzige, nach der ein Laie die Kennzahl wirklich versteht.
- **Akt 2** (Realitäts-Check): das Herzstück. Behalten, an zwei Stellen korrigieren (K5, M1, M9).
- **Akt 3** (Geschichte): der Kandidat zum Kürzen. Trägt eine einzige, allerdings wichtige Botschaft („Kernkraft hat keine Lernkurve nach unten") in vier Schritten. Auf drei zusammenziehen (M15).
- **Akt 4** (Monte Carlo): der Payoff-Akt. Behalten und *erweitern* — die WACC-Variante gehört hier hinein (K7).
- **Akt 5** (30-Jahres-Plan): inhaltlich stark, dramaturgisch der Fremdkörper. Braucht die Brücke aus M6 und die Offenlegung aus K1, sonst wäre ich für Auslagerung ins White Paper.

**Was ich zusätzlich strichen hätte:** Das Glossar mit sieben Einträgen à 100 Wörtern ist gründlich, aber am Ende einer 30-Minuten-Lektüre liest es niemand mehr. Die vier tragenden Begriffe (LCOE, LSCOE, WACC, Kostenabgrenzung) sind bereits als Inline-Links eingebunden — das genügt. CRF, Dunkelflaute und Monte Carlo würde ich in die Tooltips verschieben und das Glossar auf vier Einträge kürzen. Spart 300 Wörter und drei Bildschirme.

---

## Was ausdrücklich gut ist
*(damit im Redigat nichts davon versehentlich mit weggeräumt wird)*

1. **Der Fairness-Kasten steht vor dem ersten Akt**, nicht danach. Dass die Story der geprüften Studie ihre Transparenz zugutehält, bevor sie sie auseinandernimmt, ist genau die richtige Reihenfolge und journalistisch selten.
2. **Akt 1 ist echte Erklärarbeit.** Vier Schritte von der Investition zur Systemkennzahl, ohne eine einzige Formel im Fließtext — nach dieser Passage weiß ein Laie, warum Volllaststunden alles entscheiden. Das ist der beste Teil der Seite.
3. **„Beide Richtungen zeigen" (Akt 2 / Schritt 4)** ist handwerklich mustergültig: dieselbe Zahl, zwei Lesarten, beide belegt, keine davon versteckt. Der Satz „Wer 6.000 €/kW annimmt, nimmt implizit an, dass Deutschland beim ersten Anlauf besser baut als Frankreich, die USA und Großbritannien" ist der stärkste Satz der Story.
4. **„Die Explosion kam vor dem Unfall"** — beste Zwischenüberschrift der Seite; erzählt eine Pointe, statt einen Inhalt anzukündigen.
5. **Das Limitationen-Kapitel als eigener, gestalteter Block** statt als Kleingedrucktes. Acht konkrete, nachprüfbare Einschränkungen, jede mit Richtung des Fehlers („eher über- als unterschätzt"). Das ist mehr, als die meisten Fachpublikationen leisten.
6. **Keine Zahl steht hart im HTML.** Alles kommt aus `story_data.json`, erzeugt aus dem Freigabe-Dossier. Für ein Datenstück ist das die eigentliche Qualitätsgarantie — und es sollte im Footer selbstbewusster stehen, als es das tut.
7. **Das Zwei-Farben-System** (blau = behauptet, terrakotta = nachgerechnet) ist eine kluge Entscheidung und trägt drei Akte lang. Umso ärgerlicher der Bruch in M11.

---

# Top-3-Must-Fix

**1 · Den Phantom-Gegner auflösen (K1).**
„Ein kursierender 30-Jahres-Plan", „die Annahmen-Audits, die zu dieser Studie kursieren" und „der Satz, den man in der Debatte findet" bezeichnen alle dasselbe: das eigene Vorpapier `docs/03_grundlage_erweitert_v2.md`. In dieser Form baut die Story einen anonymen Widerpart auf, den es öffentlich nicht gibt — und der bei einer Recherche als eigenes Dokument auffliegt. Offenlegen und daraus Dramaturgie machen: *„Der erste, den wir korrigieren mussten, waren wir selbst."* Das ist die einzige Änderung, ohne die ich die Seite nicht freigeben würde.

**2 · Den zentralen Satz von Akt 4 an die eigenen Zahlen anpassen (K2).**
„Die Bänder überlappen vollständig" ist durch `story_data.json` widerlegt: Die mittleren Hälften überlappen gar nicht, und der Median des Kernkraft-Szenarios (161) liegt über dem 95-Prozent-Perzentil des Gas-Pfads (152). Der Fehler geht zugunsten der geprüften Studie — was ihn nicht besser, sondern erklärungsbedürftiger macht. Neuformulierung samt Akt-Überschrift und Zwischenruf-Nachzug wie oben; die korrigierte Aussage ist obendrein die stärkere Geschichte.

**3 · Absender, Bezugsjahr und Verifikationsgrenze nach vorne (K3 + K4).**
Vor den ersten Akt gehören drei Sätze, die heute fehlen oder ganz hinten stehen: *wer* Global Energy Solutions ist (Ulmer Verein aus dem Wasserstoff-Umfeld — eine Information, die die Studie entlastet), *wofür* die 125 und die 321 gelten (Zieljahr 2045, 950 TWh), und *dass die Studie im Original nie vorlag*. Alle drei stehen im eigenen Material bereit. Ohne sie ist der erste Leserbrief unbeantwortbar; mit ihnen ist die Story angreifbar nur noch da, wo sie es sein darf — an den Annahmen.
