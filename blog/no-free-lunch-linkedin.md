# LinkedIn-Posts · No free lunch (Visual-Standards-Rechner, 100.000 Firmen)

> **Fassungen zum Kopieren**, deutsch und englisch, jeweils als eigener Post gedacht.
> Stand: 18.11.2026, Rechner v0.25 (nach Experten-Review neu gerechnet, Zertifizierung für Open Source als Option mit Kosten).
>
> **Publish-Checkliste:**
> 1. Prüfen, dass live ist: `https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html` und `…/visual-standards-review.html`.
> 2. Als Dokument (Karussell) anhängen: `assets/posts/no-free-lunch/no-free-lunch-carousel.pdf` (2 Folien, 4:5). Alternativ die beiden PNGs `no-free-lunch-1.png` und `no-free-lunch-2.png`.
> 3. Nach dem Posten den Kommentar-Baustein als ersten eigenen Kommentar setzen.

---

## DE · Hauptfassung

„Welcher Weg zum Visual-Standard in Power BI ist der richtige?"

Die ehrliche Antwort lautet „kommt drauf an". Das klingt nach Ausweichen. Also haben wir es durchgerechnet.

100.000 simulierte Organisationen, vier Wege: gekauftes Visual, Open Source, Deneb, Core + SVG. Jede Firma läuft durch denselben Rechenkern wie unser Visual-Standards-Rechner. Wie die Firmen aussehen (Größe, Bestand, Tenant-Regeln, Must-Listen), haben drei KI-Agents unabhängig geschätzt, einmal Claude Opus, zweimal Claude Sonnet.

Dann haben wir das Ergebnis von fünf Experten-Agents zerlegen lassen: Konzern-CoE, CFO-Berater, Statistiker, Einkäufer als Anwalt von Paid, Open-Source-Maintainer. Urteil: fünfmal 3 von 5. Die Rechnung stimmte, aber unsere K.O.-Regeln waren schief, gegen Paid und für unsere eigene Kategorie. Wir haben den Rechner korrigiert und alles neu gerechnet. Und weil ein Open-Source-Visual ohne Microsoft-Zertifizierung an Export und Abos scheitert, darf es jetzt zertifiziert werden, gegen Kosten: Beitrag an den Maintainer oder Stunden für Erst- und Rezertifizierung.

Ergebnis: No free lunch.

→ Nur auf Kosten gerechnet liegt Paid in 69 % der Fälle vorn. Mit Tenant-Regeln, Budget und Must-Listen sind es 49 %, dahinter Core + SVG mit 25 %, Open Source 13 %, Deneb 8 %.
→ 39 % dürfen ihren günstigsten Weg nicht nehmen. Der zulässige Ersatz kostet im Median 59 % mehr.
→ Die Rangfolge kippt mit Größe, Horizont, Lizenzpreis und Bestand. Bei unter 25 Lesern gewinnt Paid in 90 % der Fälle, bei 1.000 bis 3.000 Lesern in 28 % (nur Kosten).
→ Jeder zahlt, nur woanders. Paid zahlt Lizenz und hat den teuersten Ausstieg, braucht aber absolut die wenigsten eigenen Stunden. Open Source zahlt in Wartung und Freigabe. Deneb beim Lernen. Core in der Wartung.
→ Open Source steht und fällt mit der Microsoft-Zertifizierung: Ohne die Option käme es auf 5 %, mit ihr auf 13 %. Fast zwei Drittel der Open-Source-Siege gibt es nur mit Zertifikat. Die Punkte gehen vor allem Deneb verloren, dem anderen günstigen Weg mit Zertifikat.
→ Ein Dogma kostet. „Immer Paid" ist in 63 % der Firmen erlaubt und kostet dort 16 % mehr als nötig. „Immer Core" geht fast überall und kostet 52 % mehr.

Die Toolfrage ist die letzte Frage. Davor: Wie viele lesen in fünf Jahren mit? Über welchen Horizont rechnet ihr? Was ist schon im Haus? Welche Regeln sind wirklich hart? Welche Musts sind wirklich Must? Wer pflegt es in drei Jahren?

Methode, alle Zahlen, Rohdaten, Skripte:
https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html

Was die fünf Reviewer gefunden haben und was wir geändert haben:
https://datenwgknowledgekitchen.com/visual-standards-review.html

Für eure eigene Organisation:
https://datenwgknowledgekitchen.com/visual-standards-rechner.html

#PowerBI #IBCS #Controlling #Reporting #Deneb #DatenWG

**Kommentar-Baustein:**
Ehrlich dazu: Die Population ist keine Erhebung, sondern eine KI-Schätzung (Median aus drei Agents). Am wackligsten sind die Must-Wahrscheinlichkeiten. ChartKitchen (Open Source) und die Deneb-Vorlagen des Business Chart Builders sind unsere eigenen Projekte. Genau deshalb haben wir das Review veröffentlicht, inklusive der Fehler, die auf uns gingen.

---

## DE · Kurzfassung

Paid, Open Source, Deneb oder Core + SVG? Wir haben 100.000 Firmen simuliert und das Ergebnis von fünf Experten-Agents zerlegen lassen.

Nur Kosten: Paid gewinnt 69 %.
Mit echten Rahmenbedingungen: Paid 49 %, Core 25 %, Open Source 13 %, Deneb 8 %.

Keiner gewinnt immer. Jeder zahlt, nur woanders: Lizenz, Wartung, Lernkurve oder Workarounds. Und Open Source braucht vor allem eins: eine Zertifizierung. Die kostet, bringt Open Source aber von 5 auf 13 %.

https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html

#PowerBI #Controlling #DatenWG

---

## EN · Main version

"Which path to a visual standard in Power BI is the right one?"

The honest answer is "it depends". That sounds like dodging. So we ran the numbers.

100,000 simulated organisations, four paths: a paid custom visual, open source, Deneb, core visuals with SVG. Every organisation runs through the same cost engine as our Visual Standards Calculator. What the organisations look like was estimated independently by three AI agents, one on Claude Opus and two on Claude Sonnet.

Then we had five expert agents tear the result apart: an enterprise BI CoE lead, a CFO advisor, a statistician, a procurement manager arguing for paid visuals, and an open-source maintainer. Verdict: five times 3 out of 5. The maths held, but our knockout rules were skewed, against paid and in favour of our own category. We fixed the calculator and re-ran everything. And because an open-source visual without Microsoft certification fails on export and subscriptions, it can now be certified, at a cost: a contribution to the maintainer or hours for initial and repeat certification.

Result: no free lunch.

→ On cost alone, paid wins in 69% of cases. With tenant rules, budget and must-haves it is 49%, followed by core + SVG at 25%, open source 13%, Deneb 8%.
→ 39% cannot use their cheapest path. The permitted alternative costs a median 59% more.
→ The ranking flips with size, horizon, license price and what is already in place.
→ Everyone pays, just somewhere else. Paid has the license and the most expensive exit, but needs the fewest internal hours in absolute terms.
→ Open source lives or dies with Microsoft certification: without the option it would reach 5%, with it 13%. Almost two thirds of open-source wins only happen with a certificate, mostly at the expense of Deneb.

Method, numbers, raw data and scripts (German):
https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html

What the five reviewers found and what we changed:
https://datenwgknowledgekitchen.com/visual-standards-review.html

#PowerBI #IBCS #FinancialReporting #Deneb #DataViz
