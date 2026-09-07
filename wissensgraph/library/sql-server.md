---
id: "tool:sql-server"
name: "SQL Server"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 13
kernaussagen: 7
mit_kernaussagen: 5
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql-server.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql-server.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql-server.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql-server.json"
aliase:
  - "T-SQL"
  - "MSSQL"
---

# SQL Server

Im SSIS-Datenfluss wird über eine Quelle eine SQL-Datenbank verbunden und darüber ausgewählt, welche Tabelle und Spalten geladen werden. (Stand 2025-12) Brian Bønk beschäftigt sich seit vier oder fünf Jahren mit Echtzeitanalysen, seine Datenkarriere begann jedoch vor 25 Jahren mit seinem ersten SQL Server. (Stand 2025-09) Ein Tabular-Modell im SQL Server der Standard Edition ist auf 16 GB Arbeitsspeicher begrenzt, was bei Überschreitung ein Enterprise-Lizenzthema auslöst. (Stand 2026-01)

## Aliase

T-SQL, MSSQL

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [SQL](sql.md) | SQL Server und SQL im selben Segment | Heuristik, gezählt |  | 38 |
| [Microsoft Fabric](microsoft-fabric.md) | SQL Server und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 17 |
| [Warehouse](warehouse.md) | SQL Server und Warehouse im selben Segment | Heuristik, gezählt |  | 15 |
| [Lakehouse](lakehouse.md) | SQL Server und Lakehouse im selben Segment | Heuristik, gezählt |  | 13 |
| [Azure](azure.md) | SQL Server und Azure im selben Segment | Heuristik, gezählt |  | 12 |
| [Power BI](power-bi.md) | SQL Server und Power BI im selben Segment | Heuristik, gezählt |  | 12 |
| [OneLake](onelake.md) | SQL Server und OneLake im selben Segment | Heuristik, gezählt |  | 10 |
| [Echtzeit](echtzeit.md) | SQL Server und Echtzeit im selben Segment | Heuristik, gezählt |  | 9 |
| [Delta Lake](delta-lake.md) | SQL Server und Delta Lake im selben Segment | Heuristik, gezählt |  | 7 |
| [Data Pipeline](data-pipeline.md) | SQL Server und Data Pipeline im selben Segment | Heuristik, gezählt |  | 7 |
| [Spark](spark.md) | SQL Server und Spark im selben Segment | Heuristik, gezählt |  | 7 |
| [Lizenzen](lizenzen.md) | SQL Server und Lizenzen im selben Segment | Heuristik, gezählt |  | 6 |
| [SQL Endpoint](sql-endpoint.md) | SQL Server und SQL Endpoint im selben Segment | Heuristik, gezählt |  | 5 |
| [Performance](performance.md) | SQL Server und Performance im selben Segment | Heuristik, gezählt |  | 5 |
| [Power Query](power-query.md) | SQL Server und Power Query im selben Segment | Heuristik, gezählt |  | 5 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Denken in Tabellen | 2026-01 | 32:44 | auf die Sekunde | Ein Tabular-Modell im SQL Server der Standard Edition ist auf 16 GB Arbeitsspeicher begrenzt, was bei Überschreitung ein Enterprise-Lizenzthema auslöst. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1964s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 04:56 | auf die Sekunde | Im SSIS-Datenfluss wird über eine Quelle eine SQL-Datenbank verbunden und darüber ausgewählt, welche Tabelle und Spalten geladen werden. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=296s) |
| Fakt | Why Passion Beats Niche | 2025-09 | 00:44 | auf die Sekunde | Brian Bønk beschäftigt sich seit vier oder fünf Jahren mit Echtzeitanalysen, seine Datenkarriere begann jedoch vor 25 Jahren mit seinem ersten SQL Server. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=44s) |
| Empfehlung | Why Passion Beats Niche | 2025-09 | 32:27 | auf die Sekunde | Brian Bønk wünscht sich für Real Time Intelligence eine KQL-Funktion mit Streaming-Unterstützung, vergleichbar mit einer gespeicherten Prozedur in SQL Server. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1947s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 24:02 | auf die Sekunde | Ein selbstgeschriebenes Python-Skript exportiert SQL-Server-Tabellen als Delta-Parquet-Dateien direkt in den OneLake-Speicher, wo sie sofort als Tabelle über den SQL-Endpunkt verfügbar sind. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1442s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 09:12 | auf die Sekunde | Das Source-System der Migration hatte über 600 SQL-Tabellen. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=552s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 21:10 | auf die Sekunde | Für die Warehouses wurden im Projekt klassische DACPAC-Deployments über ein SQL-Deployment-Tool eingesetzt, weil die Fabric Deployment Pipelines dafür nicht funktionierten. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1270s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [00:41](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=41s) · [01:15](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=75s) · [07:20](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=440s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | kernaussagen+zeitstempel | [00:00](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=0s) · [04:38](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=278s) · [25:05](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1505s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Das%20%E2%80%9EOne%20Copy%22-Prinzip) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Warehouse) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20das%20Warehouse%20exklusiv%20kann) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [13:46](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=826s) · [31:45](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1905s) |
| [Metadaten als Superkraft](https://www.youtube.com/watch?v=UUlPoJOhco8) | — | kernaussagen+zeitstempel | [01:34](https://www.youtube.com/watch?v=UUlPoJOhco8&t=94s) |
| [10 Jahre BI für alle? Was Power BI wirklich verändert hat](https://www.youtube.com/watch?v=9wl_PLvgvyc) | 2025-08-01 | nur-zeitstempel | [33:13](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1993s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Wann%20brauche%20ich%20ein%20Gateway%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Externe%20Tools%20aktivieren) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [33:34](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2014s) |
| [Daten-WG Life-Update \| State of Power BI, Fabric & AI-Tools](https://www.youtube.com/watch?v=d3HdhRe_nK8) | 2026-06-01 | nur-zeitstempel | [02:10](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=130s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [09:44](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=584s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [1:00:24](https://www.youtube.com/watch?v=r416vanitYw&t=3624s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [21:31](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1291s) |
| [BI Thinkers Talk nr.76](https://www.youtube.com/watch?v=mlkP-6i5Kq8) | 2026-05-01 | kernaussagen+zeitstempel | [49:05](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=2945s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Asql-server
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Asql-server&f=tool%3Asql-server
