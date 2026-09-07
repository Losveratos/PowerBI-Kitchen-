---
id: "tool:deployment-pipelines"
name: "Deployment Pipelines"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 13
kernaussagen: 19
mit_kernaussagen: 9
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/deployment-pipelines.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/deployment-pipelines.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/deployment-pipelines.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/deployment-pipelines.json"
aliase:
  - "Bereitstellungspipelines"
  - "Deployment Pipeline"
---

# Deployment Pipelines

Ein manuelles Fabric-Deployment-Release hat einmal insgesamt 14 Stunden gedauert. Im Juni 2024 wurden die Fabric Deployment Pipelines Git-kompatibel, was als Durchbruch für DevOps mit Fabric beschrieben wird. Für die Warehouses wurden im Projekt klassische DACPAC-Deployments über ein SQL-Deployment-Tool eingesetzt, weil die Fabric Deployment Pipelines dafür nicht funktionierten.

## Aliase

Bereitstellungspipelines, Deployment Pipeline

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Lakehouse](lakehouse.md) | Lakehouse gegensatz Deployment Pipelines | automatisch extrahiert, Quellenstelle vorhanden | „der Analytic Endpunkt vom Lake House wird nicht die Objekte da drin werden nicht übertragen“ (Daten-WG Life-Update \| Fabric Architekturen, 2026-08) | 9 |
| [Workspace](workspace.md) | Deployment Pipelines und Workspace im selben Segment | Heuristik, gezählt |  | 12 |
| [Power BI](power-bi.md) | Deployment Pipelines und Power BI im selben Segment | Heuristik, gezählt |  | 9 |
| [Microsoft Fabric](microsoft-fabric.md) | Deployment Pipelines und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 9 |
| [Data Pipeline](data-pipeline.md) | Deployment Pipelines und Data Pipeline im selben Segment | Heuristik, gezählt |  | 8 |
| [Reporting](reporting.md) | Deployment Pipelines und Reporting im selben Segment | Heuristik, gezählt |  | 8 |
| [Dataflow](dataflow.md) | Deployment Pipelines und Dataflow im selben Segment | Heuristik, gezählt |  | 7 |
| [Notebook](notebook.md) | Deployment Pipelines und Notebook im selben Segment | Heuristik, gezählt |  | 6 |
| [SQL](sql.md) | Deployment Pipelines und SQL im selben Segment | Heuristik, gezählt |  | 4 |
| [Semantic Model](semantic-model.md) | Deployment Pipelines und Semantic Model im selben Segment | Heuristik, gezählt |  | 4 |
| [Warehouse](warehouse.md) | Deployment Pipelines und Warehouse im selben Segment | Heuristik, gezählt |  | 3 |
| [Premium](premium.md) | Deployment Pipelines und Premium im selben Segment | Heuristik, gezählt |  | 3 |
| [Direct Lake](direct-lake.md) | Deployment Pipelines und Direct Lake im selben Segment | Heuristik, gezählt |  | 3 |
| [Refresh](refresh.md) | Deployment Pipelines und Refresh im selben Segment | Heuristik, gezählt |  | 3 |
| [Row-Level Security](row-level-security.md) | Deployment Pipelines und Row-Level Security im selben Segment | Heuristik, gezählt |  | 3 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 03:29 | auf die Sekunde | In diesem Projekt wurden Views im Lakehouse ueber Notebooks per Create-and-Replace angelegt, damit sie sich ueber Deployment Pipelines mitversenden lassen und je Umgebung automatisch das passende Lakehouse zugewiesen wird. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=209s) |
| Empfehlung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 08:27 | auf die Sekunde | Es wird empfohlen, fuer Produktivbetrieb und Deployment beziehungsweise Tests getrennte Fabric-Kapazitaeten einzuplanen, damit ein fehlgeschlagenes Deployment nicht das operative System stoert. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=507s) |
| Warnung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 13:44 | auf die Sekunde | Bei Fabric Deployment Pipelines werden Objekte des SQL-Analytics-Endpunkts eines Lakehouse wie Views nicht mit uebertragen, waehrend das beim Warehouse funktioniert. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=824s) |
| Fakt | BI Thinkers Talk n.73 | 2026-02 | 35:44 | Abschnittsanfang | Bei einem Direct-Lake-Modell bleibt das Semantic Model nach einem Deployment über eine Deployment Pipeline weiterhin mit dem Lakehouse der Testumgebung verbunden, die Datenquelle wird also nicht automatisch auf die Zielumgebung umgehängt. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2144s) |
| Warnung | BI Thinkers Talk n.73 | 2026-02 | 52:04 | Abschnittsanfang | Ein im Power BI Service umgebundenes Semantic Model eines Reports wird bei einem erneuten Deployment über die Deployment Pipeline wieder auf die ursprüngliche Testquelle zurückgesetzt, sodass die Umbindung nach jedem Deployment wiederholt werden muss. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3124s) |
| Warnung | BI Thinkers Talk n.73 | 2026-02 | 54:58 | auf die Sekunde | Beim Deployment eines Lakehouse über eine Deployment Pipeline werden Views, die im SQL-Endpunkt des Lakehouse angelegt wurden, nicht mit übertragen. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3298s) |
| Empfehlung | BI Thinkers Talk n.73 | 2026-02 | 54:58 | auf die Sekunde | Als Workaround definiert einer der Sprecher View-Definitionen stattdessen in TSQL-Notebooks, damit sie über die Deployment Pipeline mit transportiert werden. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3298s) |
| Fakt | BI Thinkers Talk n.72 | 2026-01 | 54:25 | auf die Sekunde | Deployment Pipelines unterstützen Dataflows, Lakehouses und Direct Lake nicht zuverlässig, sodass danach oft manuell mit VS Code nachgearbeitet werden muss. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3265s) |
| Fakt | BI Thinkers Talk n.72 | 2026-01 | 54:25 | auf die Sekunde | Für Import-Modelle gibt es in Deployment Pipelines eigene Deployment Rules, für Direct Lake dagegen nicht. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3265s) |
| Empfehlung | Daten-WG Thinkers Talk nr.65 | 2025-07 | 51:32 | auf die Sekunde | Dataflow Gen2 mit Git-Integration wird gegenüber Gen1 grundsätzlich empfohlen, weil er inzwischen aus Pipelines nutzbar ist und neue Features bekommt. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3092s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 30:09 | auf die Sekunde | Die neue Variable Library kann sowohl in Dataflows bzw. Data Pipelines als auch im CI/CD-Kontext genutzt werden, um workspace-spezifische Zielwerte für Variablen abzulegen. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1809s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? |  | 06:05 | Abschnittsanfang | Bei Fabric-Deployment-Pipelines werden Verbindungen zwischen Artefakten je nach Asset-Typ unterschiedlich und inkonsistent gehandhabt. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=365s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 12:59 | auf die Sekunde | Ein manuelles Fabric-Deployment-Release hat einmal insgesamt 14 Stunden gedauert. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=779s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 13:54 | auf die Sekunde | Im Juni 2024 wurden die Fabric Deployment Pipelines Git-kompatibel, was als Durchbruch für DevOps mit Fabric beschrieben wird. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=834s) |
| Warnung | 600 SQL-Tabellen in Fabric |  | 21:06 | auf die Sekunde | Fabric Deployment Pipelines kamen im Projekt nicht damit klar, dass eine Abhängigkeit wie ein bestehendes Warehouse schon existieren musste. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1266s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 21:10 | auf die Sekunde | Für die Warehouses wurden im Projekt klassische DACPAC-Deployments über ein SQL-Deployment-Tool eingesetzt, weil die Fabric Deployment Pipelines dafür nicht funktionierten. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1270s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? |  | 22:41 | auf die Sekunde | Ein Lakehouse wird beim Deployment in einen neuen Workspace leer angelegt, ohne die enthaltenen Daten mitzukopieren. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1361s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 32:02 | auf die Sekunde | Dataflows sind mittlerweile vollwertig in Pipelines nutzbar und ihre Ziele lassen sich parametrisieren, sodass Parameter und Variablen aus Pipelines an Dataflows uebergeben werden koennen. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=1922s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 32:18 | auf die Sekunde | Variable Libraries sind jetzt GA und ermöglichen parametrisierte, dynamische Designansätze über verschiedene Fabric-Objekte hinweg, unter anderem in Dataflows. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1938s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | kernaussagen+zeitstempel | [11:50](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=710s) · [18:22](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1102s) · [19:55](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1195s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [34:07](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2047s) · [35:44](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2144s) · [53:40](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3220s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [45:26](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2726s) · [47:00](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2820s) · [53:54](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3234s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [02:11](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=131s) · [12:15](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=735s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | kernaussagen+zeitstempel | [53:48](https://www.youtube.com/watch?v=DQENmzAkNqw&t=3228s) · [55:34](https://www.youtube.com/watch?v=DQENmzAkNqw&t=3334s) |
| [The Day After Tomorrow – Nach der Einführung geht es erst richtig los \| Power BI Summit 2023](https://www.youtube.com/watch?v=KwySyTxW_EI) | 2023-03-01 | nur-zeitstempel | [45:10](https://www.youtube.com/watch?v=KwySyTxW_EI&t=2710s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [29:17](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1757s) |
| [Was ist Self-Service und warum ist das so schwer?](https://www.youtube.com/watch?v=EVsJ6zyGUWc) | — | kernaussagen+zeitstempel | [43:05](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=2585s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [50:46](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=3046s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Sicherheitsgruppen%20statt%20Einzelpersonen) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Wie%20es%20funktioniert) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Was%20nur%20im%20Service%20geht) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [1:16:34](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=4594s) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [1:05:00](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3900s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Workspace-Schnitt) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Adeployment-pipelines
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Adeployment-pipelines&f=tool%3Adeployment-pipelines
