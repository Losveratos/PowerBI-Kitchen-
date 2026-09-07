---
id: "tool:dataflow"
name: "Dataflow"
typ: tool
stand: "2026-09-07"
build: "20260907-1012"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 30
kernaussagen: 15
mit_kernaussagen: 6
aliase:
  - "Dataflows"
  - "Dataflow Gen2"
  - "Gen2"
  - "Datenfluss"
---

# Dataflow

Aus einem Fabric-Notebook lässt sich per API ein Dataflow ansteuern und darüber Power-Query-Code (M-Code) ausführen. Für Business Central existiert kein direkter Connector für Fabric-Pipelines, weshalb der Zugriff stattdessen über einen OData-basierten Dataflow mit Service Principal erfolgen muss. Copilot kann Fachanwendern helfen, bestehende Power-Query-Dataflows automatisiert in schnelleren Code zu übersetzen.

## Aliase

Dataflows, Dataflow Gen2, Gen2, Datenfluss

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Data Pipeline](data-pipeline.md) | setzt-voraus | belegt | 28 |
| [Notebook](notebook.md) | empfiehlt | belegt | 54 |
| [Notebook](notebook.md) | gegensatz | belegt | 54 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 54 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 48 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 44 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 30 |
| [Power Query](power-query.md) | ko-vorkommen | heuristik | 28 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 26 |
| [Workspace](workspace.md) | ko-vorkommen | heuristik | 26 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 18 |
| [KI](ki.md) | ko-vorkommen | heuristik | 17 |
| [Spark](spark.md) | ko-vorkommen | heuristik | 16 |
| [Eventhouse](eventhouse.md) | ko-vorkommen | heuristik | 14 |
| [Python](python.md) | ko-vorkommen | heuristik | 14 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk n.74 | 37:26 | Aus einem Fabric-Notebook lässt sich per API ein Dataflow ansteuern und darüber Power-Query-Code (M-Code) ausführen. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2246s) |
| Empfehlung | BI Thinkers Talk n.74 | 41:00 | Ein Dataflow lässt sich als Wrapper nutzen, um über dessen Connections APIs wie die Power BI Scanner API anzusprechen, ohne im Notebook einen Service Principal hinterlegen zu müssen. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2460s) |
| Empfehlung | BI Thinkers Talk n.74 | 41:00 | Für kleinere Datenmengen und einfache Transformationen wie Entpivotieren eignet sich ein Dataflow, während stark verschachteltes JSON, etwa aus der Scanner API, eher in einem Notebook verarbeitet werden sollte. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2460s) |
| Fakt | BI Thinkers Talk n.72 | 32:17 | Über die Fabric-Service-Status-Seite lässt sich nachvollziehen, wenn Dienste wie SQL-Endpunkte oder Dataflows gestört sind, auch wenn der Status dort nicht immer eindeutig kommuniziert wird. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1937s) |
| Fakt | BI Thinkers Talk n.72 | 53:54 | Deployment Pipelines unterstützen Dataflows, Lakehouses und Direct Lake nicht zuverlässig, sodass danach oft manuell mit VS Code nachgearbeitet werden muss. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3234s) |
| Empfehlung | BI Thinkers Talk nr.67 | 41:02 | Bei neueren Dataflow-Generationen sind Datenverbindungen an die erstellende Person gebunden, weshalb empfohlen wird, Connections konsequent freizugeben und nach Möglichkeit einen Service Principal für die Verbindung zu nutzen. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=2462s) |
| Fakt | BI Thinkers Talk nr.67 | 42:46 | Für Business Central existiert kein direkter Connector für Fabric-Pipelines, weshalb der Zugriff stattdessen über einen OData-basierten Dataflow mit Service Principal erfolgen muss. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=2566s) |
| Meinung | 10 Jahre Power BI | 50:29 | Dataflows werden als der Beginn davon beschrieben, dass Power BI von einem reinen Datei- bzw. Modellformat zu einer echten Datenplattform wurde. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3029s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? | 08:27 | Dataflows lassen sich laut Martin nicht gut orchestrieren. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=507s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 | 12:50 | Dataflow Gen 1 wechselt in einen Legacy- beziehungsweise Wartungsstatus ohne neue Features. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=770s) |
| Meinung | Fabric & Power BI Quarterly · 2026-2 | 14:21 | In Dataflow Gen 2 sind deutlich mehr Investitionen und Integrationsmöglichkeiten geflossen, als für Dataflow Gen 1 je möglich waren. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=861s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 | 17:22 | Der Migration Accelerator in der Fabric Toolbox macht Abhängigkeiten von Dataflow Gen 1 sichtbar, migriert sie aber nicht automatisch. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1042s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-2 | 17:22 | Es wird empfohlen, keine neuen Dataflows Gen 1 mehr anzulegen. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1042s) |
| Warnung | Microsoft Fabric — braucht das wirklich jemand? | 19:45 | Werden zwei Dataflows über ein Lakehouse verkettet, stehen am Folgetag keine neuen Daten bereit, weil der SQL-Endpoint des Lakehouse nicht sofort aktualisiert wird. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1185s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? | 41:34 | Copilot kann Fachanwendern helfen, bestehende Power-Query-Dataflows automatisiert in schnelleren Code zu übersetzen. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2494s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric Dataflow Gen2 Kosten verstehen - CU-Verbrauch einfach erklärt](https://www.youtube.com/watch?v=z51gWRc0zVc) | 2026-07-01 | nur-zeitstempel | [01:34](https://www.youtube.com/watch?v=z51gWRc0zVc&t=94s) · [03:05](https://www.youtube.com/watch?v=z51gWRc0zVc&t=185s) · [04:37](https://www.youtube.com/watch?v=z51gWRc0zVc&t=277s) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [02:40](https://www.youtube.com/watch?v=YzfcMurbWNc&t=160s) · [06:35](https://www.youtube.com/watch?v=YzfcMurbWNc&t=395s) · [25:00](https://www.youtube.com/watch?v=YzfcMurbWNc&t=1500s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [32:28](https://www.youtube.com/watch?v=iymmxuXHh44&t=1948s) · [35:47](https://www.youtube.com/watch?v=iymmxuXHh44&t=2147s) · [50:56](https://www.youtube.com/watch?v=iymmxuXHh44&t=3056s) |
| [Power BI Update August 2025](https://www.youtube.com/watch?v=jTXo4aEr07o) | 2025-08-01 | nur-zeitstempel | [01:21](https://www.youtube.com/watch?v=jTXo4aEr07o&t=81s) · [03:53](https://www.youtube.com/watch?v=jTXo4aEr07o&t=233s) |
| [Power BI Update April 2025](https://www.youtube.com/watch?v=lT-C7fPzxj4) | 2025-04-01 | nur-zeitstempel | [03:08](https://www.youtube.com/watch?v=lT-C7fPzxj4&t=188s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Schnell-Heuristik) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Gen2%20vs.%20Gen1%20%28Power-BI-Dataflows%29) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Weg%20C%20%C2%B7%20Shortcut%2C%20wenn%20Daten%20schon%20existieren) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [12:15](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=735s) · [13:57](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=837s) · [33:36](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=2016s) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [35:51](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2151s) · [39:06](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2346s) · [41:00](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2460s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [29:33](https://www.youtube.com/watch?v=G8s96sHUHac&t=1773s) · [31:14](https://www.youtube.com/watch?v=G8s96sHUHac&t=1874s) · [47:47](https://www.youtube.com/watch?v=G8s96sHUHac&t=2867s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [07:26](https://www.youtube.com/watch?v=mTVeZzshLzE&t=446s) · [19:45](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1185s) · [21:24](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1284s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [27:23](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1643s) · [29:00](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1740s) · [34:05](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=2045s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [13:37](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=817s) · [16:07](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=967s) · [18:22](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1102s) |
| [Power BI Update Oktober 2025](https://www.youtube.com/watch?v=LVSttJlhrqM) | 2025-10-01 | nur-zeitstempel | [04:21](https://www.youtube.com/watch?v=LVSttJlhrqM&t=261s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [06:28](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=388s) · [17:44](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1064s) · [19:15](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1155s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [04:49](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=289s) · [47:42](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2862s) · [1:00:37](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3637s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [01:38](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=98s) · [04:48](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=288s) · [44:27](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=2667s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [11:00](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=660s) · [12:50](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=770s) · [14:21](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=861s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | nur-zeitstempel | [06:51](https://www.youtube.com/watch?v=bt81POE-9Ig&t=411s) · [21:19](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1279s) · [26:22](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1582s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [02:30](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=150s) · [29:17](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1757s) · [30:50](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1850s) |
| [BI Thinkers Talk nr.77](https://www.youtube.com/watch?v=eWfTt93anl4) | — | nur-zeitstempel | [50:00](https://www.youtube.com/watch?v=eWfTt93anl4&t=3000s) · [56:49](https://www.youtube.com/watch?v=eWfTt93anl4&t=3409s) · [1:04:41](https://www.youtube.com/watch?v=eWfTt93anl4&t=3881s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [03:02](https://www.youtube.com/watch?v=lZvpCBMKASM&t=182s) · [32:02](https://www.youtube.com/watch?v=lZvpCBMKASM&t=1922s) |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [07:20](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=440s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [28:14](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1694s) · [31:33](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1893s) |
| [Daten-WG Deep Dive Financial Reporting - part 7](https://www.youtube.com/watch?v=232JhS9vbQ0) | 2025-09-01 | nur-zeitstempel | [23:26](https://www.youtube.com/watch?v=232JhS9vbQ0&t=1406s) · [25:30](https://www.youtube.com/watch?v=232JhS9vbQ0&t=1530s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [32:17](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1937s) · [47:00](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2820s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | nur-zeitstempel | [57:04](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3424s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Wann%20lohnt%20sich%20ein%20Dataflow%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Dataflow%20Gen2%20%28Fabric%29) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Fabric-Bausteine) |
| [Daten-WG 2026 Lineup](https://www.youtube.com/watch?v=AX7b8_aNekw) | 2026-05-01 | nur-zeitstempel | [02:51](https://www.youtube.com/watch?v=AX7b8_aNekw&t=171s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [49:35](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2975s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [54:04](https://www.youtube.com/watch?v=r416vanitYw&t=3244s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Adataflow
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Adataflow&f=tool%3Adataflow
