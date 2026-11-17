# LinkedIn-Posts · No free lunch (Visual-Standards-Rechner, 100.000 Firmen)

> **Fassungen zum Kopieren**, deutsch und englisch, jeweils als eigener Post gedacht.
>
> **Publish-Checkliste:**
> 1. Prüfen, dass live ist: `https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html`.
> 2. Als Dokument (Karussell) anhängen: `assets/posts/no-free-lunch/no-free-lunch-carousel.pdf` (2 Folien, 4:5). Alternativ die beiden PNGs `no-free-lunch-1.png` und `no-free-lunch-2.png`.
> 3. Nach dem Posten den Kommentar-Baustein als ersten eigenen Kommentar setzen.

---

## DE · Hauptfassung

„Welcher Weg zum Visual-Standard in Power BI ist der richtige?"

Die ehrliche Antwort lautet „kommt drauf an". Das klingt nach Ausweichen. Also haben wir es durchgerechnet.

100.000 simulierte Organisationen, vier Wege: gekauftes Visual, Open Source, Deneb, Core + SVG. Jede Firma läuft durch denselben Rechenkern wie unser Visual-Standards-Rechner. Wie die Firmen aussehen (Größe, Bestand, Tenant-Regeln, Must-Listen), haben drei KI-Agents unabhängig geschätzt, einmal Claude Opus, zweimal Claude Sonnet. Wir haben den Median genommen.

Ergebnis: No free lunch.

→ Nur auf Kosten gerechnet liegt Paid in 68 % der Fälle vorn. Mit den Rahmenbedingungen (certified-only, kein Lizenzbudget, Report Server, Must-Kriterien) sind es nur noch 28 %. Dann liegt Core + SVG mit 30 % gleichauf.
→ 47 % dürfen ihren günstigsten Weg gar nicht nehmen. Der zulässige Ersatz kostet im Median 60 % mehr.
→ Die Rangfolge kippt mit der Größe, dem Horizont, dem Lizenzpreis und vor allem damit, was schon im Haus ist. Bei unter 25 Lesern gewinnt Paid in 90 % der Fälle, bei 1.000 bis 3.000 Lesern in 28 %.
→ Jeder zahlt, nur woanders. Paid zahlt Lizenz und hat den teuersten Ausstieg. Open Source zahlt in Wartung und Freigabe. Deneb zahlt beim Lernen. Core zahlt in der Wartung: 40 % der Kosten gehen ins Nachziehen von Workarounds.
→ Ein Dogma kostet. „Immer Paid" ist nur in 35 % der Firmen überhaupt erlaubt. „Immer Core" geht fast überall und kostet dort rund ein Drittel mehr als nötig.

Die Toolfrage ist die letzte Frage. Davor stehen sechs andere: Wie viele lesen in fünf Jahren mit? Über welchen Horizont rechnet ihr? Was ist schon im Haus? Welche Regeln sind wirklich hart? Welche Musts sind wirklich Must? Und wer pflegt es in drei Jahren?

Methode, alle Zahlen, Rohdaten und Skripte:
https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html

Für eure eigene Organisation statt 100.000:
https://datenwgknowledgekitchen.com/visual-standards-rechner.html

#PowerBI #IBCS #Controlling #Reporting #Deneb #DatenWG

**Kommentar-Baustein:**
Ehrlich dazu: Die Population ist keine Erhebung, sondern eine KI-Schätzung (Median aus drei Agents). Am wackligsten sind die Must-Wahrscheinlichkeiten, die treiben die dritte Linse. Die Kostenannahmen sind die des Rechners, mit Quelle an jedem Wert. Und ja: ChartKitchen ist unser eigenes Open-Source-Visual und fällt in die Kategorie Open Source. Rohschätzungen und Skripte liegen im Repo.

---

## DE · Kurzfassung

Paid, Open Source, Deneb oder Core + SVG? Wir haben 100.000 Firmen simuliert.

Nur Kosten: Paid gewinnt 68 %.
Mit echten Rahmenbedingungen: Paid 28 %, Core 30 %, Open Source 15 %, Deneb 15 %, und 11 % haben gar keinen zulässigen Weg.

Keiner gewinnt immer. Jeder zahlt, nur woanders: Lizenz, Wartung, Lernkurve oder Workarounds.

Die Entscheidung fällt vor der Toolfrage: Größe, Horizont, Bestand, harte Regeln, echte Musts.

https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html

#PowerBI #Controlling #DatenWG

---

## EN · Main version

"Which path to a visual standard in Power BI is the right one?"

The honest answer is "it depends". That sounds like dodging. So we ran the numbers.

100,000 simulated organisations, four paths: a paid custom visual, open source, Deneb, core visuals with SVG. Every organisation runs through the same cost engine as our Visual Standards Calculator. What the organisations look like (size, existing stack, tenant rules, must-have lists) was estimated independently by three AI agents, one on Claude Opus and two on Claude Sonnet. We took the median.

Result: no free lunch.

→ On cost alone, paid wins in 68% of cases. Add the real constraints (certified-only tenants, no license budget, Report Server, must-haves) and it drops to 28%. Core + SVG ties at 30%.
→ 47% cannot use their cheapest path at all. The permitted alternative costs a median 60% more.
→ The ranking flips with size, horizon, license price and, most of all, with what is already in place. Under 25 readers paid wins 90% of the time, at 1,000 to 3,000 readers 28%.
→ Everyone pays, just somewhere else. Paid pays license and has the most expensive exit. Open source pays in maintenance and approval. Deneb pays in learning. Core pays in maintenance: 40% of its cost goes into keeping workarounds alive.
→ Dogma has a price. "Always paid" is only allowed in 35% of organisations. "Always core" works almost everywhere and costs about a third more than necessary.

The tool question comes last. Six questions come first: how many people will read this in five years, what horizon you calculate with, what is already in place, which rules are truly hard, which must-haves are truly must, and who maintains it in three years.

Method, all numbers, raw data and scripts (German page):
https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html

#PowerBI #IBCS #FinancialReporting #Deneb #DataViz
