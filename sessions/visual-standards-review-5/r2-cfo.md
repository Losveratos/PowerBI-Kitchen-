# Review r2-cfo: CFO-Berater und IBCS-Praktiker

**Gesamturteil: 3 von 5.** Die Rechnungen sind sauber, die Kernbotschaft trägt, für eine CFO-Entscheidung fehlen aber Cash-Sicht, Null-Option und Nutzenseite. Zwei Aussagen (C10, C12) halte ich in der jetzigen Form für nicht veröffentlichbar.

## Was ich nachgerechnet habe
Die Kennzahlen aus ergebnis.json, mc-ergebnis.json, report-10k.json und oss-1fte.json stimmen mit den Posts überein (68/45/28 %, 47 %, +60 %, 25 sichere Firmen, 38 %/26 % im OSS-Szenario, 3.680 €). Die Rechenfehler sind klein: Core steht im Dossier bei 15 %, ist nach Nutzern aber 14,5 % (Summe sonst 101). Der Streit geht also nicht um die Arithmetik, sondern um Annahmen und Lesart.

## Was ein CFO mit den Aussagen anfangen kann
Gut nutzbar ist der Satz: Rahmenbedingungen und Musts zuerst klären, jedes Must hat einen Preis (im Median +60 %). Das ist die Frage, die ich im Controlling bei jeder Werkzeugentscheidung stelle. Nicht nutzbar ist die Rangliste als Empfehlung. Dafür fehlen drei Dinge.

1. **Keine Null-Option, kein Betrag.** Für Firmen unter 250 MA liegt der günstigste Weg bei 247–332 € je Viewer und Jahr, also in der Größenordnung einer Pro-Lizenz, und der weit überwiegende Teil sind interne Stunden. Ob sich ein Standard für diese Firmen überhaupt lohnt, beantwortet keiner der drei Posts, obwohl der Rechner Null-Option und Amortisation kennt.
2. **Interne Zeit zählt wie Geld.** Bei Paid sind 57 %, bei OSS 75 % der Kosten "Eigene Zeit" (hard_share Paid 43 %, OSS 25 %). Ein Controlling-Team von zwei Personen hat keine freie Kapazität, die sich in Euro auszahlt. Der Wert ist als Konvention fest auf 100 % gesetzt und wird nicht variiert.
3. **"Gewinner" ist ein Kostenrang.** Der Anforderungs-Score (30 % im Rechner) wird weggelassen. Core + SVG erfüllt IBCS-Notation, Interaktion und Wartbarkeit nur per Workaround; im Mittel sind es ca. 2,2 Musts je Firma, aber nur cap ≤ 1 ist K.O. "Core 30 %" liest jeder als "Core ist der beste Weg". Das steht nur im Kleingedruckten.

## Must-Listen und IBCS-Zertifikat
Das IBCS-Zertifikat wird als zwei unabhängige Größen gezogen: als Flag "Zertifikat Pflicht" und als Must "IBCS-zertifiziertes Visual". Das ist dieselbe Tatsache. Gewichtet über die Segmente ergibt sich ein K.O.-Anteil von 8,7 % statt 5,2 % (Faktor 1,68); die Posts führen beide als getrennte Treiber. Gleiches Muster bei Report Server (Flag und Must) und Copilot/Core-only. Außerdem sind die Musts voneinander unabhängige Münzwürfe; echte Anforderungslisten sind Pakete. Dass "kein Weg" bei 11 % liegt, ist teilweise Artefakt.

Dass "kein Vendor-Lock-in" Paid in 25 % der Organisationen ausschließt (häufigster K.O.-Grund), halte ich für überzogen. In der Beschaffung wird Lock-in über Laufzeit, Ausstiegsklausel und Escrow behandelt, und der Rechner bepreist den Ausstieg ohnehin separat (54 % der Summe). Ähnlich beim SLA, das man einkaufen kann. Das wirkt gegen Paid.

Umgekehrt ist der Zebra-Anker (170 €) etwa doppelt so hoch wie die aktuelle Preisseite (Starter 816 $/10 Nutzer, Business 316 $/Monat/50 Nutzer, also ca. 76–82 $ je Nutzer); der Rechner vermerkt selbst, dass der Anker aus alten Snippets stammt. Auch das wirkt gegen Paid, und der Lizenzhebel im Kontrafaktum (33 → 170 €) ist damit überzeichnet.

## Kontrafaktum
Methodisch richtig, aber die 17 Hebel enthalten keinen Stundentreiber, den der Rechner selbst als wichtigste Stellschraube nennt (Stundenanker −26 % bis +59 % auf die Summe). Und ein Must von nein auf ja für alle Firmen ist ein größerer Eingriff als ein Preis von 33 auf 170 €. "Musts 51–91 %, Kosten 7–33 %" ist daher eine Untergrenze für die Kostenseite.

## Persona- und FTE-Aussagen
**C4:** "Münzwurf" misst Gewinnerhäufigkeit. Bei den 42 Münzwurf-Firmen mit mindestens zwei zulässigen Wegen liegt Platz 2 im Median nur 16 % über Platz 1, bei 16 unter 10 %. Das ist oft kein Münzwurf, sondern "egal". Ein Regret-Maß gehört hinein.

**C7:** Nach Nutzern entscheiden wenige Konzerne. Für eine Firma ist das die falsche Einheit; nach Firmen führt Paid mit 38 % vor Deneb mit 29 %.

**C10 halte ich für falsch gefolgert.** Der "Vorsprung" ist die Differenz zum Zweitbesten, keine Einsparung durch die FTE (schon "heute" liegt er bei 5.238 € für die 867 OSS-Firmen), und er besteht zu drei Vierteln aus internen Stunden (3.680 € ≈ 45 Stunden). Daraus wird kein Budget für 840 € Beitrag. Die Marktgröße von 4.400 Organisationen pro Jahr ist eine Setzung, und das Free-Rider-Problem ist der eigentliche Punkt, nicht ein Nachsatz. Dazu kommt: Ein Maintainer ist Bus-Faktor 1, das Modell setzt aber Abkündigungsrisiko 2 % wie ein Hersteller.

## Interessenkonflikt (C12)
Genannt wird nur ChartKitchen. Die Deneb-Vorlagen und die Bibliotheksannahme sind ebenfalls Eigenprodukte, und der Rechner schreibt selbst, dass vier von sechs offenen Lücken zugunsten der eigenen Ansätze wirken ("bekannte Schlagseite"). Dieser Satz fehlt in allen drei Posts. Der OSS-1-FTE-Abschnitt ist faktisch ein Finanzierungs-Pitch für das eigene Projekt. Das gehört klar benannt.

## Was ich vor Veröffentlichung ändern würde
1. Offenlegung vervollständigen (beide Eigenprodukte, Schlagseite, FTE-Abschnitt als eigener Fall).
2. C10 auf Cash-Einsparung stützen oder auf "rechnerisch denkbar" zurücknehmen.
3. "Gewinner" in "günstigster zulässiger Weg" umbenennen und Workaround-Anteil zeigen.
4. IBCS-Zertifikat und verwandte Paare als ein Merkmal ziehen, Exit und SLA als Zuschlag rechnen und beide Fassungen zeigen.
5. Null-Option, absolute Euro und Cash-Anteil je Größenklasse ergänzen, Regret statt Münzwurf, Stundenhebel ins Kontrafaktum, Zebra-Anker korrigieren.

Mit diesen Änderungen halte ich eine 4 für erreichbar.
