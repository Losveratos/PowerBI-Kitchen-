---
id: "tool:data-pipeline"
name: "Data Pipeline"
typ: tool
stand: "2026-09-07"
build: "20260907-1922"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 9
kernaussagen: 5
mit_kernaussagen: 4
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/data-pipeline.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/data-pipeline.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/data-pipeline.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/data-pipeline.json"
aliase:
  - "Pipelines"
  - "Data Factory"
  - "Pipeline"
---

# Data Pipeline

Copy Jobs in der Fabric Data Factory unterstützen jetzt in der Vorschau automatisch Slowly Changing Dimension Typ 2, wodurch manueller Notebook-Code für diesen Zweck überflüssig wird. Eine Connection für Notebooks lässt sich aktuell nicht direkt unter Connections anlegen, sondern nur über den Umweg einer Data Pipeline. Für Business Central existiert kein direkter Connector für Fabric-Pipelines, weshalb der Zugriff stattdessen über einen OData-basierten Dataflow mit Service Principal erfolgen muss.

## Aliase

Pipelines, Data Factory, Pipeline

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Dataflow](dataflow.md) | setzt-voraus | belegt | 28 |
| [Notebook](notebook.md) | setzt-voraus | belegt | 33 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 40 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 36 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 27 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 23 |
| [Workspace](workspace.md) | ko-vorkommen | heuristik | 21 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 19 |
| [OneLake](onelake.md) | ko-vorkommen | heuristik | 18 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 15 |
| [Fabric Capacity](fabric-capacity.md) | ko-vorkommen | heuristik | 15 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 13 |
| [Azure](azure.md) | ko-vorkommen | heuristik | 13 |
| [Spark](spark.md) | ko-vorkommen | heuristik | 13 |
| [Delta Lake](delta-lake.md) | ko-vorkommen | heuristik | 13 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk n.72 | 2026-01 | 37:35 | auf die Sekunde | Eine Connection für Notebooks lässt sich aktuell nicht direkt unter Connections anlegen, sondern nur über den Umweg einer Data Pipeline. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2255s) |
| Empfehlung | BI Thinkers Talk nr.67 | 2025-09 | 41:23 | auf die Sekunde | Bei neueren Dataflow-Generationen sind Datenverbindungen an die erstellende Person gebunden, weshalb empfohlen wird, Connections konsequent freizugeben und nach Möglichkeit einen Service Principal für die Verbindung zu nutzen. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=2483s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 43:22 | auf die Sekunde | Für Business Central existiert kein direkter Connector für Fabric-Pipelines, weshalb der Zugriff stattdessen über einen OData-basierten Dataflow mit Service Principal erfolgen muss. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=2602s) |
| Empfehlung | Microsoft Fabric — braucht das wirklich jemand? |  | 12:02 | auf die Sekunde | Der erste Quickwin beim Umstieg auf Fabric ist laut Artur, Daten überhaupt persistent abzulegen, statt sie bei jeder Aktualisierung neu zu laden. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=722s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 |  | 21:31 | auf die Sekunde | Copy Jobs in der Fabric Data Factory unterstützen jetzt in der Vorschau automatisch Slowly Changing Dimension Typ 2, wodurch manueller Notebook-Code für diesen Zweck überflüssig wird. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1291s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Wer%20geht%20wo%20auf%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Workload-Landkarte%20%28Stand%202026%29) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Bausteine) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [08:08](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=488s) · [16:07](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=967s) · [17:44](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1064s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [21:39](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1299s) · [28:42](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1722s) · [29:17](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1757s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | nur-zeitstempel | [44:08](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2648s) · [45:48](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2748s) · [52:11](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3131s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [27:23](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1643s) · [30:41](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1841s) · [49:49](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=2989s) |
| [Realtalk zu Self Service mit Power BI](https://www.youtube.com/watch?v=27rC2zefFOU) | 2024-02-01 | nur-zeitstempel | [20:05](https://www.youtube.com/watch?v=27rC2zefFOU&t=1205s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Wie%20es%20funktioniert) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Operationen%2C%20die%20NICHT%20foldet) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Hover%20f%C3%BCr%20Details) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [31:33](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1893s) · [50:46](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=3046s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [21:26](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1286s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Adata-pipeline
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Adata-pipeline&f=tool%3Adata-pipeline
