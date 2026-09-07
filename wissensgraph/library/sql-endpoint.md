---
id: "tool:sql-endpoint"
name: "SQL Endpoint"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 4
kernaussagen: 10
mit_kernaussagen: 7
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql-endpoint.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql-endpoint.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql-endpoint.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql-endpoint.json"
aliase:
  - "SQL Analytics Endpoint"
  - "SQL-Endpunkt"
---

# SQL Endpoint

Mirroring in Fabric wuerde es heute ermoeglichen, SAP-Datasphere-Daten automatisch in ein per SQL-Endpunkt lesbares Format zu ueberfuehren, war zum Projektzeitpunkt aber noch nicht verfuegbar. (Stand 2026-08) Bei einem groesseren SAP-Konzernprojekt wurden Bronze und Silber als Warehouse aufgebaut, weil das Pipeline-Feature zum Refresh der SQL-Endpunkt-Metadaten damals noch nicht existierte. (Stand 2026-08) Für Direct Lake gab es weiterhin Probleme, während der Import-Modus über den SQL-Endpoint funktionierte. (Stand 2026-03)

## Aliase

SQL Analytics Endpoint, SQL-Endpunkt

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Composite Models](composite-models.md) | Composite Models ersetzt SQL Endpoint | automatisch extrahiert, Quellenstelle vorhanden | „die Möglichkeit bietet Direct Lake Tabellen aus nicht mehr über den Sequel Endpunkt konsumieren zu müssen“ (Fabric & Power BI Quarterly · 2025 Q3) | 0 |
| [Direct Lake](direct-lake.md) | Direct Lake setzt-voraus SQL Endpoint | automatisch extrahiert, Quellenstelle vorhanden | „dem Sequel Endpoint verbundenen Direct Lake und und dem Lake verbundenen Direct Lake“ (Microsoft Fabric — braucht das wirklich jemand?) | 10 |
| [Notebook](notebook.md) | Notebook ersetzt SQL Endpoint | automatisch extrahiert, Quellenstelle vorhanden | „Wenn du das Lake House über die Pipeline jagst, kriegst du die Daten aus dem SQLM Punkt nicht angezeigt ... die Definition der Views in TSQL Notebooks gepackt“ (BI Thinkers Talk n.73, 2026-02) | 4 |
| [SQL](sql.md) | SQL Endpoint und SQL im selben Segment | Heuristik, gezählt |  | 16 |
| [Lakehouse](lakehouse.md) | SQL Endpoint und Lakehouse im selben Segment | Heuristik, gezählt |  | 13 |
| [Microsoft Fabric](microsoft-fabric.md) | SQL Endpoint und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 11 |
| [Delta Lake](delta-lake.md) | SQL Endpoint und Delta Lake im selben Segment | Heuristik, gezählt |  | 10 |
| [Warehouse](warehouse.md) | SQL Endpoint und Warehouse im selben Segment | Heuristik, gezählt |  | 7 |
| [OneLake](onelake.md) | SQL Endpoint und OneLake im selben Segment | Heuristik, gezählt |  | 7 |
| [SQL Server](sql-server.md) | SQL Endpoint und SQL Server im selben Segment | Heuristik, gezählt |  | 5 |
| [Power BI](power-bi.md) | SQL Endpoint und Power BI im selben Segment | Heuristik, gezählt |  | 5 |
| [Semantic Model](semantic-model.md) | SQL Endpoint und Semantic Model im selben Segment | Heuristik, gezählt |  | 4 |
| [Reporting](reporting.md) | SQL Endpoint und Reporting im selben Segment | Heuristik, gezählt |  | 4 |
| [Data Pipeline](data-pipeline.md) | SQL Endpoint und Data Pipeline im selben Segment | Heuristik, gezählt |  | 4 |
| [DirectQuery](directquery.md) | SQL Endpoint und DirectQuery im selben Segment | Heuristik, gezählt |  | 4 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 01:53 | auf die Sekunde | Mirroring in Fabric wuerde es heute ermoeglichen, SAP-Datasphere-Daten automatisch in ein per SQL-Endpunkt lesbares Format zu ueberfuehren, war zum Projektzeitpunkt aber noch nicht verfuegbar. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=113s) |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 12:40 | auf die Sekunde | Bei einem groesseren SAP-Konzernprojekt wurden Bronze und Silber als Warehouse aufgebaut, weil das Pipeline-Feature zum Refresh der SQL-Endpunkt-Metadaten damals noch nicht existierte. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=760s) |
| Warnung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 13:44 | auf die Sekunde | Bei Fabric Deployment Pipelines werden Objekte des SQL-Analytics-Endpunkts eines Lakehouse wie Views nicht mit uebertragen, waehrend das beim Warehouse funktioniert. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=824s) |
| Fakt | Fabric Planning unboxing | 2026-03 | 04:11 | auf die Sekunde | Für Direct Lake gab es weiterhin Probleme, während der Import-Modus über den SQL-Endpoint funktionierte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=251s) |
| Warnung | BI Thinkers Talk n.73 | 2026-02 | 54:58 | auf die Sekunde | Beim Deployment eines Lakehouse über eine Deployment Pipeline werden Views, die im SQL-Endpunkt des Lakehouse angelegt wurden, nicht mit übertragen. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3298s) |
| Fakt | BI Thinkers Talk n.72 | 2026-01 | 32:17 | Abschnittsanfang | Über die Fabric-Service-Status-Seite lässt sich nachvollziehen, wenn Dienste wie SQL-Endpunkte oder Dataflows gestört sind, auch wenn der Status dort nicht immer eindeutig kommuniziert wird. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1937s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 24:02 | auf die Sekunde | Ein selbstgeschriebenes Python-Skript exportiert SQL-Server-Tabellen als Delta-Parquet-Dateien direkt in den OneLake-Speicher, wo sie sofort als Tabelle über den SQL-Endpunkt verfügbar sind. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1442s) |
| Warnung | Microsoft Fabric — braucht das wirklich jemand? |  | 19:51 | auf die Sekunde | Werden zwei Dataflows über ein Lakehouse verkettet, stehen am Folgetag keine neuen Daten bereit, weil der SQL-Endpoint des Lakehouse nicht sofort aktualisiert wird. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1191s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? |  | 28:28 | auf die Sekunde | Direct Lake existiert in zwei Varianten, verbunden über den SQL-Endpoint oder direkt mit dem Lake, was zusätzliche Komplexität für Citizen Developer schafft. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1708s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 39:13 | auf die Sekunde | Composite Models sollen kuenftig die Moeglichkeit bieten, Direct-Lake-Tabellen aus mehreren Lakehouses zu kombinieren, ohne mehr zwingend ueber den einen zentralen SQL-Endpunkt konsumieren zu muessen. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2353s) |

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
