---
id: "tool:sql-endpoint"
name: "SQL Endpoint"
typ: tool
stand: "2026-09-07"
build: "20260907-1922"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 4
kernaussagen: 5
mit_kernaussagen: 4
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql-endpoint.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql-endpoint.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql-endpoint.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql-endpoint.json"
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

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Fabric Planning unboxing | 2026-03 | 04:11 | auf die Sekunde | Für Direct Lake gab es weiterhin Probleme, während der Import-Modus über den SQL-Endpoint funktionierte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=251s) |
| Warnung | BI Thinkers Talk n.73 | 2026-02 | 54:58 | auf die Sekunde | Beim Deployment eines Lakehouse über eine Deployment Pipeline werden Views, die im SQL-Endpunkt des Lakehouse angelegt wurden, nicht mit übertragen. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3298s) |
| Fakt | BI Thinkers Talk n.72 | 2026-01 | 32:17 | Abschnittsanfang | Über die Fabric-Service-Status-Seite lässt sich nachvollziehen, wenn Dienste wie SQL-Endpunkte oder Dataflows gestört sind, auch wenn der Status dort nicht immer eindeutig kommuniziert wird. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1937s) |
| Warnung | Microsoft Fabric — braucht das wirklich jemand? |  | 19:51 | auf die Sekunde | Werden zwei Dataflows über ein Lakehouse verkettet, stehen am Folgetag keine neuen Daten bereit, weil der SQL-Endpoint des Lakehouse nicht sofort aktualisiert wird. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1191s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? |  | 28:28 | auf die Sekunde | Direct Lake existiert in zwei Varianten, verbunden über den SQL-Endpoint oder direkt mit dem Lake, was zusätzliche Komplexität für Citizen Developer schafft. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1708s) |

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
