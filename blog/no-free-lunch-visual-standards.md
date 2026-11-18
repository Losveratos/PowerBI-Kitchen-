# No free lunch: 100.000 Firmen, vier Wege, kein Sieger

> Post · Visual-Standards-Rechner · Simulation · Von Michael Tenner · Stand 18. November 2026 (Rechner v0.25, nach Experten-Review, Zertifizierung als Option)
> HTML-Fassung: https://datenwgknowledgekitchen.com/no-free-lunch-visual-standards-post.html
> Daten: https://datenwgknowledgekitchen.com/assets/posts/no-free-lunch/ergebnis.json
> Review: https://datenwgknowledgekitchen.com/visual-standards-review.html

Paid-Visual, Open Source, Deneb oder Core Visuals mit SVG: Welcher Weg zum visuellen Standard in Power BI ist der günstigste? 100.000 synthetische Organisationen durch den Rechenkern des Visual-Standards-Rechners (v0.25). Ergebnis: Jeder Weg gewinnt irgendwo, keiner überall, und jeder kostet etwas, nur an einer anderen Stelle.

## Methode

1. **Population:** drei unabhängige Blindschätzungen durch KI-Agents (1× Claude Opus, 2× Claude Sonnet) für sechs Segmente; Median übernommen. Keine Erhebung.
2. **Simulation:** 100.000 Profile, je Organisation Erwartungswert (Empfehlung des Rechners) und eine gepaarte Zufallsziehung (eine mögliche Zukunft). Gewichtet nach Anzahl Organisationen.
3. **Vier Linsen:** nur Kosten · plus harte Rahmenbedingungen · plus Must-Kriterien als K.O. · Must-Liste verhandelbar, wenn sonst nichts übrig bleibt.

## Ergebnis 1: Kein Weg gewinnt immer

| Linse | Paid | Open Source | Deneb | Core + SVG | kein Weg |
|:--|--:|--:|--:|--:|--:|
| Nur Kosten | 69 % | 12 % | 10 % | 10 % | 0 % |
| + harte Regeln (Tenant-Regeln, Lizenzbudget, gesperrte Custom Visuals) | 49 % | 18 % | 14 % | 18 % | 1 % |
| + Must-Listen aus der Anforderung | 49 % | 13 % | 8 % | 25 % | 5 % |
| + Must-Listen, verhandelbar wenn nichts übrig bleibt | 50 % | 14 % | 9 % | 27 % | 1 % |

Robust über die drei Einzelschätzungen (mit Must-Listen): Paid 47 %–52 %, Core 18 %–28 %, Deneb 7 %–9 %, Open Source 10 %–19 %. Open Source kommt auf 13 %. Ohne Zertifikat kann ein Open-Source-Visual im Service weder PDF/PPT exportieren noch abonniert werden. Seit Rechner v0.25 darf es zertifiziert werden, und das kostet: beim fertigen Visual einen Beitrag an den Maintainer, beim Eigenbau Stunden für Erst- und Rezertifizierung. 29 % der Organisationen rechnen Open Source zertifiziert, 65 % der Open-Source-Gewinner brauchen das Zertifikat. Ohne diese Option käme Open Source auf 5 % (Deneb 13 % statt 8 %, Paid 50 % statt 49 %). Die Zertifizierung ist für Open Source der entscheidende Hebel, und sie geht vor allem zulasten von Deneb, dem anderen günstigen Weg mit Zertifikat.

## Ergebnis 2: Was die Rangfolge kippt

- **Größe:** Paid vorn bei < 25 Lesern in 90 %, bei 1.000–3.000 Lesern in 28 % (nur Kosten).
- **Horizont:** Paid vorn über 3 Jahre 74 %, über 10 Jahre 53 %.
- **Lizenzpreis:** Paid vorn auf Inforiver-Niveau (33 €) 80 %, auf Zebra-Niveau (170 €, abgeleitet) 40 %.
- **Bestand:** Deneb gewinnt mit Bestand 76 %, auf der grünen Wiese 9 %; Open Source 65 % gegen 14 %.
- **Rahmenbedingungen:** 39 % dürfen ihren günstigsten Weg nicht nehmen (davon 5 % keinen); der zulässige Ersatz kostet im Median +59 %. K.O.-Quote: Paid 37 %, Open Source 49 %, Deneb 44 %, Core 17 %.

## Ergebnis 3: Jeder zahlt, nur woanders

| Weg | Lizenz & Support | Aufbau & Migration | Rollout & Schulung | Wartung & Updates | Governance, Support, Risiko | eigene Zeit | FTE intern | € je Viewer/Jahr | Ausstieg |
|:--|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 3rd-Party paid | 25 % | 25 % | 26 % | 9 % | 14 % | 57 % | 0,10 | 293 € | 54 % |
| Open Source | 2 % | 32 % | 23 % | 26 % | 18 % | 74 % | 0,21 | 486 € | 44 % |
| Deneb / Vega | 2 % | 29 % | 36 % | 20 % | 13 % | 65 % | 0,16 | 443 € | 28 % |
| Core + SVG | 0 % | 20 % | 31 % | 40 % | 9 % | 69 % | 0,22 | 567 € | 34 % |

## Ergebnis 4: Was ein Dogma kostet

| Regel | zulässig | am günstigsten | Mehrkosten, wo zulässig |
|:--|--:|--:|--:|
| Immer 3rd-Party paid | 63 % | 49 % | +16 % |
| Immer Open Source | 51 % | 13 % | +62 % |
| Immer Deneb / Vega | 56 % | 8 % | +49 % |
| Immer Core + SVG | 83 % | 25 % | +52 % |

## Ergebnis 5: Auch die richtige Rechnung irrt

Je Organisation ist die Rangfolge meist klar (Abstand Platz 1 zu 2 im Median 37 %). Unter Organisationen mit echter Wahl wäre in 28 % der simulierten Welten im Nachhinein ein anderer Weg billiger gewesen, im Median um 25 %.

## Ehrlich eingeordnet

- Population aus KI-Schätzungen, keine Erhebung; Musts unabhängig gezogen (deshalb die Linse „verhandelbar").
- Kostenannahmen = Visual-Standards-Rechner v0.25; K.O.-Matrix nach Experten-Review angeglichen, Zertifizierung für Open Source als Option mit Kosten. Ranking nur nach Kosten, ohne Anforderungs-Score.
- Offenlegung: ChartKitchen byDatenWG (Open Source) und die Deneb-Vorlagen des Business Chart Builders sind eigene Projekte der Autoren; der Rechner nennt selbst eine Schlagseite zugunsten dieser Ansätze.
