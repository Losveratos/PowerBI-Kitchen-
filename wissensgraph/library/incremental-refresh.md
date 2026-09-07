---
id: "tool:incremental-refresh"
name: "Incremental Refresh"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 6
kernaussagen: 4
mit_kernaussagen: 4
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/incremental-refresh.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/incremental-refresh.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/incremental-refresh.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/incremental-refresh.json"
aliase:
  - "inkrementelle Aktualisierung"
  - "Incremental"
---

# Incremental Refresh

Bisher konnte ein Modell mit aktiviertem Incremental Refresh in Power BI Desktop nicht heruntergeladen werden, das ist inzwischen behoben. Die Incremental-Refresh-Option für Materialized Lake Views war eines der meistgefragten Kundenfeedbacks und wurde entsprechend veröffentlicht. Für das inkrementelle Laden der Buchungsdaten wird ein Dataflow gegenüber der Pipeline bevorzugt, weil inkrementelles Laden dort garantiert funktioniert. (Stand 2025-05)

## Aliase

inkrementelle Aktualisierung, Incremental

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Refresh](refresh.md) | Incremental Refresh und Refresh im selben Segment | Heuristik, gezählt |  | 17 |
| [Power Query](power-query.md) | Incremental Refresh und Power Query im selben Segment | Heuristik, gezählt |  | 7 |
| [Performance](performance.md) | Incremental Refresh und Performance im selben Segment | Heuristik, gezählt |  | 6 |
| [Dataflow](dataflow.md) | Incremental Refresh und Dataflow im selben Segment | Heuristik, gezählt |  | 5 |
| [Power BI](power-bi.md) | Incremental Refresh und Power BI im selben Segment | Heuristik, gezählt |  | 5 |
| [Sternschema](sternschema.md) | Incremental Refresh und Sternschema im selben Segment | Heuristik, gezählt |  | 4 |
| [Power BI Desktop](power-bi-desktop.md) | Incremental Refresh und Power BI Desktop im selben Segment | Heuristik, gezählt |  | 3 |
| [Microsoft Fabric](microsoft-fabric.md) | Incremental Refresh und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 3 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Warnung | Daten-WG Thinkers Talk nr.65 | 2025-07 | 59:31 | auf die Sekunde | Bei Dataflow Gen2 ist die Change-Detection-Einstellung für Incremental Refresh anders als bei Gen1 nicht optional, sondern muss zwingend angegeben werden. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3571s) |
| Empfehlung | Daten-WG Deep Dive Financial Reporting | 2025-05 | 57:26 | auf die Sekunde | Für das inkrementelle Laden der Buchungsdaten wird ein Dataflow gegenüber der Pipeline bevorzugt, weil inkrementelles Laden dort garantiert funktioniert. | [▶](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3446s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 18:25 | auf die Sekunde | Die Incremental-Refresh-Option für Materialized Lake Views war eines der meistgefragten Kundenfeedbacks und wurde entsprechend veröffentlicht. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1105s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 40:26 | auf die Sekunde | Bisher konnte ein Modell mit aktiviertem Incremental Refresh in Power BI Desktop nicht heruntergeladen werden, das ist inzwischen behoben. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2426s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [49:14](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2954s) · [52:31](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3151s) · [1:02:14](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3734s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | kernaussagen+zeitstempel | [52:11](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3131s) · [55:24](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3324s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Die%20wichtigsten%20Regeln) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Refresh-Performance%20verbessern) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Surrogate%20Keys%20vor%20Business%20Keys) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | kernaussagen+zeitstempel | [40:30](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2430s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | kernaussagen+zeitstempel | [29:00](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1740s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [49:24](https://www.youtube.com/watch?v=G8s96sHUHac&t=2964s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Aincremental-refresh
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Aincremental-refresh&f=tool%3Aincremental-refresh
