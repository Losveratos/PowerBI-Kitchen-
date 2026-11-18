# No free lunch: 100.000 Firmen, vier Wege, kein Sieger

> Post · Visual-Standards-Rechner · Simulation · Von Michael Tenner · Stand 18. November 2026 (Rechner v0.24, nach Experten-Review)
> HTML-Fassung: https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html
> Daten: https://datenwgknowledgekitchen.com/assets/posts/no-free-lunch/ergebnis.json
> Review: https://datenwgknowledgekitchen.com/visual-standards-review.html

Paid-Visual, Open Source, Deneb oder Core Visuals mit SVG: Welcher Weg zum visuellen Standard in Power BI ist der günstigste? 100.000 synthetische Organisationen durch den Rechenkern des Visual-Standards-Rechners (v0.24). Ergebnis: Jeder Weg gewinnt irgendwo, keiner überall, und jeder kostet etwas, nur an einer anderen Stelle.

## Methode

1. **Population:** drei unabhängige Blindschätzungen durch KI-Agents (1× Claude Opus, 2× Claude Sonnet) für sechs Segmente; Median übernommen. Keine Erhebung.
2. **Simulation:** 100.000 Profile, je Organisation Erwartungswert (Empfehlung des Rechners) und eine gepaarte Zufallsziehung (eine mögliche Zukunft). Gewichtet nach Anzahl Organisationen.
3. **Vier Linsen:** nur Kosten · plus harte Rahmenbedingungen · plus Must-Kriterien als K.O. · Must-Liste verhandelbar, wenn sonst nichts übrig bleibt.

## Ergebnis 1: Kein Weg gewinnt immer

| Linse | Paid | Open Source | Deneb | Core + SVG | kein Weg |
|:--|--:|--:|--:|--:|--:|
| Nur Kosten | 68 % | 12 % | 10 % | 10 % | 0 % |
| + harte Regeln (Tenant-Regeln, Lizenzbudget, gesperrte Custom Visuals) | 49 % | 16 % | 15 % | 18 % | 1 % |
| + Must-Listen aus der Anforderung | 50 % | 5 % | 13 % | 26 % | 6 % |
| + Must-Listen, verhandelbar wenn nichts übrig bleibt | 51 % | 6 % | 14 % | 27 % | 1 % |

Robust über die drei Einzelschätzungen (mit Must-Listen): Paid 48 %–54 %, Core 19 %–28 %, Deneb 13 %–14 %, Open Source 4 %–9 %. Open Source scheitert meist an der Must „PDF/PPT-Export & Abos", die ein unzertifiziertes Visual nicht erfüllt.

## Ergebnis 2: Was die Rangfolge kippt

- **Größe:** Paid vorn bei < 25 Lesern in 90 %, bei 1.000–3.000 Lesern in 28 % (nur Kosten).
- **Horizont:** Paid vorn über 3 Jahre 74 %, über 10 Jahre 53 %.
- **Lizenzpreis:** Paid vorn auf Inforiver-Niveau (33 €) 80 %, auf Zebra-Niveau (170 €, abgeleitet) 40 %.
- **Bestand:** Deneb gewinnt mit Bestand 76 %, auf der grünen Wiese 9 %; Open Source 66 % gegen 14 %.
- **Rahmenbedingungen:** 43 % dürfen ihren günstigsten Weg nicht nehmen (davon 6 % keinen); der zulässige Ersatz kostet im Median +59 %. K.O.-Quote: Paid 37 %, Open Source 78 %, Deneb 44 %, Core 17 %.

## Ergebnis 3: Jeder zahlt, nur woanders

| Weg | Lizenz & Support | Aufbau & Migration | Rollout & Schulung | Wartung & Updates | Governance, Support, Risiko | eigene Zeit | FTE intern | € je Viewer/Jahr | Ausstieg |
|:--|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 3rd-Party paid | 25 % | 25 % | 26 % | 9 % | 14 % | 57 % | 0,10 | 293 € | 54 % |
| Open Source | 1 % | 32 % | 24 % | 26 % | 18 % | 75 % | 0,21 | 480 € | 44 % |
| Deneb / Vega | 2 % | 29 % | 36 % | 20 % | 13 % | 65 % | 0,16 | 443 € | 28 % |
| Core + SVG | 0 % | 20 % | 31 % | 40 % | 9 % | 69 % | 0,22 | 567 € | 34 % |

## Ergebnis 4: Was ein Dogma kostet

| Regel | zulässig | am günstigsten | Mehrkosten, wo zulässig |
|:--|--:|--:|--:|
| Immer 3rd-Party paid | 63 % | 50 % | +14 % |
| Immer Open Source | 22 % | 5 % | +82 % |
| Immer Deneb / Vega | 56 % | 13 % | +45 % |
| Immer Core + SVG | 83 % | 26 % | +50 % |

## Ergebnis 5: Auch die richtige Rechnung irrt

Je Organisation ist die Rangfolge meist klar (Abstand Platz 1 zu 2 im Median 44 %). Unter Organisationen mit echter Wahl wäre in 24 % der simulierten Welten im Nachhinein ein anderer Weg billiger gewesen, im Median um 25 %.

## Ehrlich eingeordnet

- Population aus KI-Schätzungen, keine Erhebung; Musts unabhängig gezogen (deshalb die Linse „verhandelbar").
- Kostenannahmen = Visual-Standards-Rechner v0.24; K.O.-Matrix nach Experten-Review angeglichen. Ranking nur nach Kosten, ohne Anforderungs-Score.
- Offenlegung: ChartKitchen byDatenWG (Open Source) und die Deneb-Vorlagen des Business Chart Builders sind eigene Projekte der Autoren; der Rechner nennt selbst eine Schlagseite zugunsten dieser Ansätze.
