---
id: "tool:eventhouse"
name: "Eventhouse"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 10
kernaussagen: 7
mit_kernaussagen: 3
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/eventhouse.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/eventhouse.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/eventhouse.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/eventhouse.json"
aliase:
  - "KQL"
  - "Kusto"
  - "Real-Time Intelligence"
  - "Eventstream"
  - "Realtime Intelligence"
---

# Eventhouse

Aus einer Kusto-Abfrage im Eventhaus laesst sich mit wenigen Klicks direkt ein Power-BI-Report generieren, inklusive der dafuer noetigen Abfrage und Connection Strings. (Stand 2025-06) Die Kusto Query Language wird unter anderem von Azure Sentinel, Azure Data Explorer und dem Eventhouse in Microsoft Fabric genutzt. (Stand 2025-09) Die Real-Time-Intelligence-Suite in Microsoft Fabric umfasst unter anderem Eventstream, die KQL-Datenbank, Eventhouse, Activator, Echtzeit-Dashboards und KQL-Abfragesätze. (Stand 2025-09)

## Aliase

KQL, Kusto, Real-Time Intelligence, Eventstream, Realtime Intelligence

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Semantic Model](semantic-model.md) | Eventhouse gegensatz Semantic Model | automatisch extrahiert, Quellenstelle vorhanden | „die Abfrage wird dem Eventhaus zugerechnet und nicht dem Dataset“ (BI Thinkers Talk nr.64, 2025-07) | 0 |
| [Microsoft Fabric](microsoft-fabric.md) | Eventhouse teil-von Microsoft Fabric | automatisch extrahiert, Quellenstelle vorhanden | „das ist ein Eventhaus in Fabric“ (Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup, 2025-06) | 19 |
| [Echtzeit](echtzeit.md) | Eventhouse und Echtzeit im selben Segment | Heuristik, gezählt |  | 22 |
| [Dataflow](dataflow.md) | Eventhouse und Dataflow im selben Segment | Heuristik, gezählt |  | 14 |
| [Lakehouse](lakehouse.md) | Eventhouse und Lakehouse im selben Segment | Heuristik, gezählt |  | 14 |
| [Power BI](power-bi.md) | Eventhouse und Power BI im selben Segment | Heuristik, gezählt |  | 14 |
| [Warehouse](warehouse.md) | Eventhouse und Warehouse im selben Segment | Heuristik, gezählt |  | 14 |
| [SQL](sql.md) | Eventhouse und SQL im selben Segment | Heuristik, gezählt |  | 14 |
| [Spark](spark.md) | Eventhouse und Spark im selben Segment | Heuristik, gezählt |  | 11 |
| [Data Pipeline](data-pipeline.md) | Eventhouse und Data Pipeline im selben Segment | Heuristik, gezählt |  | 10 |
| [Fabric Capacity](fabric-capacity.md) | Eventhouse und Fabric Capacity im selben Segment | Heuristik, gezählt |  | 9 |
| [OneLake](onelake.md) | Eventhouse und OneLake im selben Segment | Heuristik, gezählt |  | 9 |
| [Notebook](notebook.md) | Eventhouse und Notebook im selben Segment | Heuristik, gezählt |  | 8 |
| [Azure](azure.md) | Eventhouse und Azure im selben Segment | Heuristik, gezählt |  | 8 |
| [Workspace](workspace.md) | Eventhouse und Workspace im selben Segment | Heuristik, gezählt |  | 8 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Why Passion Beats Niche | 2025-09 | 02:04 | auf die Sekunde | Die Kusto Query Language wird unter anderem von Azure Sentinel, Azure Data Explorer und dem Eventhouse in Microsoft Fabric genutzt. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=124s) |
| Fakt | Why Passion Beats Niche | 2025-09 | 15:53 | auf die Sekunde | Die Real-Time-Intelligence-Suite in Microsoft Fabric umfasst unter anderem Eventstream, die KQL-Datenbank, Eventhouse, Activator, Echtzeit-Dashboards und KQL-Abfragesätze. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=953s) |
| Fakt | Why Passion Beats Niche | 2025-09 | 22:46 | auf die Sekunde | Die Aufbewahrungsfrist im Event House beträgt laut Brian Bønk 7 Tage. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1366s) |
| Empfehlung | Why Passion Beats Niche | 2025-09 | 26:57 | auf die Sekunde | Brian Bønk empfiehlt, in einem Echtzeitsystem nur die für die Fachabteilung tatsächlich relevante Zeitspanne an Daten in der Echtzeitdatenbank vorzuhalten. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1617s) |
| Empfehlung | BI Thinkers Talk nr.64 | 2025-07 | 35:32 | auf die Sekunde | Wird das Zeitfenster einer DirectQuery-Abfrage auf eine Kusto-/Eventhouse-Datenbank deutlich verkleinert, hält die Fabric-Kapazität im Langzeittest spürbar länger durch. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2132s) |
| Meinung | Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup | 2025-06 | 16:55 | auf die Sekunde | Das Eventhaus (Eventhouse) in Fabric war fuer Arthur neu, da er den Vorgaenger HDX vorher nicht bewusst wahrgenommen hatte. | [▶](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1015s) |
| Fakt | Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup | 2025-06 | 21:25 | auf die Sekunde | Aus einer Kusto-Abfrage im Eventhaus laesst sich mit wenigen Klicks direkt ein Power-BI-Report generieren, inklusive der dafuer noetigen Abfrage und Connection Strings. | [▶](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1285s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup](https://www.youtube.com/watch?v=BDnwlOqRElY) | 2025-06-01 | kernaussagen+zeitstempel | [24:07](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1447s) · [25:58](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1558s) · [29:14](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1754s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | kernaussagen+zeitstempel | [15:02](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=902s) · [19:47](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1187s) · [29:29](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1769s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Wer%20geht%20wo%20auf%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Workload-Landkarte%20%28Stand%202026%29) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Real-Time-Kette) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | kernaussagen+zeitstempel | [32:06](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1926s) · [33:57](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2037s) · [37:15](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2235s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [37:56](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2276s) · [42:49](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2569s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [28:14](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1694s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | kernaussagen+zeitstempel | [04:40](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=280s) |
| [BI Thinkers Talk nr.77](https://www.youtube.com/watch?v=eWfTt93anl4) | — | nur-zeitstempel | [48:24](https://www.youtube.com/watch?v=eWfTt93anl4&t=2904s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | kernaussagen+zeitstempel | [26:22](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1582s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Fabric-Bausteine) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Aeventhouse
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Aeventhouse&f=tool%3Aeventhouse
