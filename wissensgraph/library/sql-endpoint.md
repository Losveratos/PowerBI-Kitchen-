---
id: "tool:sql-endpoint"
name: "SQL Endpoint"
typ: tool
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 4
kernaussagen: 5
mit_kernaussagen: 4
aliase:
  - "SQL Analytics Endpoint"
  - "SQL-Endpunkt"
---

# SQL Endpoint

Für Direct Lake gab es weiterhin Probleme, während der Import-Modus über den SQL-Endpoint funktionierte. Über die Fabric-Service-Status-Seite lässt sich nachvollziehen, wenn Dienste wie SQL-Endpunkte oder Dataflows gestört sind, auch wenn der Status dort nicht immer eindeutig kommuniziert wird. Direct Lake existiert in zwei Varianten, verbunden über den SQL-Endpoint oder direkt mit dem Lake, was zusätzliche Komplexität für Citizen Developer schafft.

## Aliase

SQL Analytics Endpoint, SQL-Endpunkt

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Direct Lake](direct-lake.md) | setzt-voraus | belegt | 10 |
| [Notebook](notebook.md) | ersetzt | belegt | 4 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 13 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 11 |
| [Delta Lake](delta-lake.md) | ko-vorkommen | heuristik | 10 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 7 |
| [OneLake](onelake.md) | ko-vorkommen | heuristik | 7 |
| [SQL Server](sql-server.md) | ko-vorkommen | heuristik | 5 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 5 |
| [Semantic Model](semantic-model.md) | ko-vorkommen | heuristik | 4 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 4 |
| [Data Pipeline](data-pipeline.md) | ko-vorkommen | heuristik | 4 |
| [DirectQuery](directquery.md) | ko-vorkommen | heuristik | 4 |
| [Daten-WG](daten-wg.md) | ko-vorkommen | heuristik | 3 |
| [Row-Level Security](row-level-security.md) | ko-vorkommen | heuristik | 3 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | Fabric Planning unboxing | 03:06 | Für Direct Lake gab es weiterhin Probleme, während der Import-Modus über den SQL-Endpoint funktionierte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=186s) |
| Warnung | BI Thinkers Talk n.73 | 55:34 | Beim Deployment eines Lakehouse über eine Deployment Pipeline werden Views, die im SQL-Endpunkt des Lakehouse angelegt wurden, nicht mit übertragen. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3334s) |
| Fakt | BI Thinkers Talk n.72 | 32:17 | Über die Fabric-Service-Status-Seite lässt sich nachvollziehen, wenn Dienste wie SQL-Endpunkte oder Dataflows gestört sind, auch wenn der Status dort nicht immer eindeutig kommuniziert wird. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1937s) |
| Warnung | Microsoft Fabric — braucht das wirklich jemand? | 19:45 | Werden zwei Dataflows über ein Lakehouse verkettet, stehen am Folgetag keine neuen Daten bereit, weil der SQL-Endpoint des Lakehouse nicht sofort aktualisiert wird. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1185s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? | 28:04 | Direct Lake existiert in zwei Varianten, verbunden über den SQL-Endpoint oder direkt mit dem Lake, was zusätzliche Komplexität für Citizen Developer schafft. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1684s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20das%20Warehouse%20exklusiv%20kann) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20zwei%20Dinge%2C%20die%20man%20wissen%20muss) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Zwei%20Varianten%20%E2%80%94%20wichtig%20seit%202025) |
| [SharePoint direkt in Microsoft Fabric nutzen \| Lakehouse, Direct Lake & Power BI](https://www.youtube.com/watch?v=c-LWoo-O5PQ) | 2026-07-01 | nur-zeitstempel | [09:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=560s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [01:39](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=99s) · [33:34](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2014s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Direct%20Lake%20%28Fabric%29) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Asql-endpoint
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Asql-endpoint&f=tool%3Asql-endpoint
