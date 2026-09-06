---
id: "tool:deployment-pipelines"
name: "Deployment Pipelines"
typ: tool
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 13
kernaussagen: 8
mit_kernaussagen: 3
aliase:
  - "Bereitstellungspipelines"
  - "Deployment Pipeline"
---

# Deployment Pipelines

Bei einem Direct-Lake-Modell bleibt das Semantic Model nach einem Deployment über eine Deployment Pipeline weiterhin mit dem Lakehouse der Testumgebung verbunden, die Datenquelle wird also nicht automatisch auf die Zielumgebung umgehängt. Deployment Pipelines unterstützen Dataflows, Lakehouses und Direct Lake nicht zuverlässig, sodass danach oft manuell mit VS Code nachgearbeitet werden muss. Für Import-Modelle gibt es in Deployment Pipelines eigene Deployment Rules, für Direct Lake dagegen nicht.

## Aliase

Bereitstellungspipelines, Deployment Pipeline

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Workspace](workspace.md) | ko-vorkommen | heuristik | 12 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 9 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 9 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 9 |
| [Data Pipeline](data-pipeline.md) | ko-vorkommen | heuristik | 8 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 8 |
| [Dataflow](dataflow.md) | ko-vorkommen | heuristik | 7 |
| [Notebook](notebook.md) | ko-vorkommen | heuristik | 6 |
| [Semantic Model](semantic-model.md) | ko-vorkommen | heuristik | 4 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 3 |
| [Premium](premium.md) | ko-vorkommen | heuristik | 3 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 3 |
| [Refresh](refresh.md) | ko-vorkommen | heuristik | 3 |
| [Row-Level Security](row-level-security.md) | ko-vorkommen | heuristik | 3 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk n.73 | 35:44 | Bei einem Direct-Lake-Modell bleibt das Semantic Model nach einem Deployment über eine Deployment Pipeline weiterhin mit dem Lakehouse der Testumgebung verbunden, die Datenquelle wird also nicht automatisch auf die Zielumgebung umgehängt. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2144s) |
| Warnung | BI Thinkers Talk n.73 | 52:04 | Ein im Power BI Service umgebundenes Semantic Model eines Reports wird bei einem erneuten Deployment über die Deployment Pipeline wieder auf die ursprüngliche Testquelle zurückgesetzt, sodass die Umbindung nach jedem Deployment wiederholt werden muss. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3124s) |
| Warnung | BI Thinkers Talk n.73 | 55:34 | Beim Deployment eines Lakehouse über eine Deployment Pipeline werden Views, die im SQL-Endpunkt des Lakehouse angelegt wurden, nicht mit übertragen. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3334s) |
| Empfehlung | BI Thinkers Talk n.73 | 55:34 | Als Workaround definiert der Sprecher View-Definitionen stattdessen in TSQL-Notebooks, damit sie über die Deployment Pipeline mit transportiert werden. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3334s) |
| Fakt | BI Thinkers Talk n.72 | 53:54 | Deployment Pipelines unterstützen Dataflows, Lakehouses und Direct Lake nicht zuverlässig, sodass danach oft manuell mit VS Code nachgearbeitet werden muss. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3234s) |
| Fakt | BI Thinkers Talk n.72 | 53:54 | Für Import-Modelle gibt es in Deployment Pipelines eigene Deployment Rules, für Direct Lake dagegen nicht. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3234s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? | 06:05 | Bei Fabric-Deployment-Pipelines werden Verbindungen zwischen Artefakten je nach Asset-Typ unterschiedlich und inkonsistent gehandhabt. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=365s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? | 06:05 | Ein Lakehouse wird beim Deployment in einen neuen Workspace leer angelegt, ohne die enthaltenen Daten mitzukopieren. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=365s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [11:50](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=710s) · [18:22](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1102s) · [19:55](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1195s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [34:07](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2047s) · [35:44](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2144s) · [53:40](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3220s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [45:26](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2726s) · [47:00](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2820s) · [53:54](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3234s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [02:11](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=131s) · [12:15](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=735s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | nur-zeitstempel | [53:48](https://www.youtube.com/watch?v=DQENmzAkNqw&t=3228s) · [55:34](https://www.youtube.com/watch?v=DQENmzAkNqw&t=3334s) |
| [The Day After Tomorrow – Nach der Einführung geht es erst richtig los \| Power BI Summit 2023](https://www.youtube.com/watch?v=KwySyTxW_EI) | 2023-03-01 | nur-zeitstempel | [45:10](https://www.youtube.com/watch?v=KwySyTxW_EI&t=2710s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [29:17](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1757s) |
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
