# No free lunch: 100.000 Firmen, vier Wege, kein Sieger

> Post · Visual-Standards-Rechner · Simulation · Von Michael Tenner · Stand November 2026
> HTML-Fassung: https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html
> Daten: https://datenwgknowledgekitchen.com/assets/posts/no-free-lunch/ergebnis.json

Paid-Visual, Open Source, Deneb oder Core Visuals mit SVG: Welcher Weg zum visuellen Standard in Power BI ist der günstigste? Wir haben 100.000 synthetische Organisationen durch den unveränderten Rechenkern des Visual-Standards-Rechners (v0.23) geschickt. Ergebnis: Jeder Weg gewinnt irgendwo, keiner überall, und jeder kostet etwas, nur an einer anderen Stelle.

## Methode

1. **Population:** drei unabhängige Blindschätzungen durch KI-Agents (1× Claude Opus, 2× Claude Sonnet) für sechs Segmente (klein, Mittelstand, gehobener Mittelstand, Konzern, Bank/Versicherung/Klinik, öffentliche Hand): Größe, Betriebsmodell, Horizont, Bestand, Tenant-Regeln, Must-Kriterien. Median übernommen. Keine Erhebung.
2. **Simulation:** 100.000 Profile, je Organisation Erwartungswert (Empfehlung des Rechners) und eine gepaarte Zufallsziehung (eine mögliche Zukunft). Gewichtet nach Anzahl Organisationen.
3. **Drei Linsen:** nur Kosten · plus harte Rahmenbedingungen (nur zertifizierte Visuals, kein Lizenzbudget, Report Server, Custom Visuals gesperrt) · plus Must-Kriterien als K.O.

## Ergebnis 1: Kein Weg gewinnt immer

Anteil der Organisationen, bei denen der Weg über den Horizont am wenigsten kostet:

| Linse | Paid | Open Source | Deneb | Core + SVG | kein Weg |
|:--|--:|--:|--:|--:|--:|
| Nur Kosten | 68 % | 12 % | 10 % | 10 % | 0 % |
| + harte Regeln | 45 % | 17 % | 17 % | 19 % | 1 % |
| + Must-Listen | 28 % | 15 % | 15 % | 30 % | 11 % |

Robust über die drei Einzelschätzungen (mit Must-Listen): Paid 27–31 %, Core 20–34 %, Open Source 12–24 %, Deneb 14–17 %.

## Ergebnis 2: Was die Rangfolge kippt

- **Größe:** Paid vorn bei < 25 Lesern in 90 %, bei 1.000–3.000 Lesern in 28 %; ab 3.000 Lesern mit Site-Lizenz 60 %, mit Staffel 30 %.
- **Horizont:** Paid vorn über 3 Jahre 74 %, über 10 Jahre 53 %.
- **Lizenzpreis:** Paid vorn auf Inforiver-Niveau (33 €) 80 %, auf Zebra-Niveau (170 €, abgeleitet) 40 %.
- **Bestand** (stärkster Einzelfaktor): Deneb gewinnt mit Bestand 76 %, auf der grünen Wiese 9 %; Open Source 66 % gegen 14 %; Core + SVG 28 % gegen 0 %.
- **Rahmenbedingungen:** 47 % dürfen ihren günstigsten Weg nicht nehmen; der zulässige Ersatz kostet im Median +60 % (P75 +122 %). K.O.-Quote: Paid 65 %, Open Source 53 %, Deneb 43 %, Core 20 %.

## Ergebnis 3: Jeder zahlt, nur woanders

| Weg | Lizenz & Support | Aufbau & Migration | Rollout & Schulung | Wartung & Updates | Governance, Support, Risiko | eigene Zeit | Ausstieg |
|:--|--:|--:|--:|--:|--:|--:|--:|
| 3rd-Party paid | 25 % | 25 % | 26 % | 9 % | 14 % | 57 % | 54 % |
| Open Source | 1 % | 32 % | 24 % | 26 % | 18 % | 75 % | 44 % |
| Deneb / Vega | 2 % | 29 % | 36 % | 20 % | 13 % | 65 % | 28 % |
| Core + SVG | 0 % | 20 % | 31 % | 40 % | 9 % | 69 % | 34 % |

Anteil an den Gesamtkosten (Mittel). Eigene Zeit = intern bewertete Stunden. Ausstieg = Kosten eines Wechsels nach dem Horizont im Verhältnis zur Summe (Median, nicht in der Summe).

## Ergebnis 4: Was ein Dogma kostet

| Regel | zulässig | am günstigsten | Mehrkosten, wo zulässig |
|:--|--:|--:|--:|
| Immer 3rd-Party paid | 35 % | 28 % | +15 % |
| Immer Open Source | 47 % | 15 % | +60 % |
| Immer Deneb / Vega | 57 % | 15 % | +34 % |
| Immer Core + SVG | 80 % | 30 % | +36 % |

Open Source als Dogma: mit fertigem Visual +20 %, mit KI-gestützter Eigenentwicklung +48 %, mit klassischer Eigenentwicklung +175 %.

## Ergebnis 5: Auch die richtige Rechnung irrt

Je Organisation ist die Rangfolge meist klar (Abstand Platz 1 zu 2 im Median 34 %, nur 13 % unter 10 %). Aber in 20 % der simulierten Welten wäre im Nachhinein ein anderer Weg billiger gewesen, im Median um 26 %.

## Sechs Fragen vor der Toolfrage

1. Wie viele lesen in fünf Jahren mit?
2. Über welchen Horizont rechnet ihr?
3. Was ist heute schon im Haus?
4. Welche Regeln sind wirklich hart (certified-only, Lizenzbudget, Report Server)?
5. Welche Musts sind wirklich Must?
6. Wer pflegt es in drei Jahren?

## Ehrlich eingeordnet

- Population aus KI-Schätzungen, keine Erhebung; am unsichersten: Segmentanteile, Verbreitung von „nur zertifizierte Visuals", Must-Wahrscheinlichkeiten (diese treiben die dritte Linse, v. a. „Paginated Reports" und „kein Vendor-Lock-in" als Must).
- Kostenannahmen = Visual-Standards-Rechner v0.23 (simuliertes Expertenpanel, Herstellerpreise, Autoren-Schätzungen). Ranking nur nach Kosten (Erwartungswert), ohne Anforderungs-Score.
- Offenlegung: ChartKitchen byDatenWG ist das eigene Open-Source-Projekt der Autoren.

## Dateien

- Ergebnisse: `assets/posts/no-free-lunch/ergebnis.json`; Population: `assets/posts/no-free-lunch/population.json`; Rohschätzungen: `sessions/visual-standards-population-100k/`
- Skripte: `tools/rechner-population-100k.js`, `tools/rechner-population-merge.py`, `tools/rechner-population-analyse.py`
- Infografik: `assets/posts/no-free-lunch/no-free-lunch-carousel.pdf`
