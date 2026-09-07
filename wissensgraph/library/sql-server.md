---
id: "tool:sql-server"
name: "SQL Server"
typ: tool
stand: "2026-09-07"
build: "20260907-1056"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 13
kernaussagen: 2
mit_kernaussagen: 2
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql-server.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql-server.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql-server.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql-server.json"
aliase:
  - "T-SQL"
  - "MSSQL"
---

# SQL Server

Im SSIS-Datenfluss wird über eine Quelle eine SQL-Datenbank verbunden und darüber ausgewählt, welche Tabelle und Spalten geladen werden. Ein Tabular-Modell im SQL Server der Standard Edition ist auf 16 GB Arbeitsspeicher begrenzt, was bei Überschreitung ein Enterprise-Lizenzthema auslöst.

## Aliase

T-SQL, MSSQL

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 17 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 15 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 13 |
| [Azure](azure.md) | ko-vorkommen | heuristik | 12 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 12 |
| [OneLake](onelake.md) | ko-vorkommen | heuristik | 10 |
| [Echtzeit](echtzeit.md) | ko-vorkommen | heuristik | 9 |
| [Delta Lake](delta-lake.md) | ko-vorkommen | heuristik | 7 |
| [Data Pipeline](data-pipeline.md) | ko-vorkommen | heuristik | 7 |
| [Spark](spark.md) | ko-vorkommen | heuristik | 7 |
| [Lizenzen](lizenzen.md) | ko-vorkommen | heuristik | 6 |
| [SQL Endpoint](sql-endpoint.md) | ko-vorkommen | heuristik | 5 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 5 |
| [Power Query](power-query.md) | ko-vorkommen | heuristik | 5 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 5 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | Denken in Tabellen | 31:45 | Ein Tabular-Modell im SQL Server der Standard Edition ist auf 16 GB Arbeitsspeicher begrenzt, was bei Überschreitung ein Enterprise-Lizenzthema auslöst. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1905s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 04:13 | Im SSIS-Datenfluss wird über eine Quelle eine SQL-Datenbank verbunden und darüber ausgewählt, welche Tabelle und Spalten geladen werden. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=253s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [00:41](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=41s) · [01:15](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=75s) · [07:20](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=440s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | nur-zeitstempel | [00:00](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=0s) · [04:38](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=278s) · [25:05](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1505s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Das%20%E2%80%9EOne%20Copy%22-Prinzip) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Warehouse) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20das%20Warehouse%20exklusiv%20kann) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [13:46](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=826s) · [31:45](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1905s) |
| [Metadaten als Superkraft](https://www.youtube.com/watch?v=UUlPoJOhco8) | — | kernaussagen+zeitstempel | [01:34](https://www.youtube.com/watch?v=UUlPoJOhco8&t=94s) |
| [10 Jahre BI für alle? Was Power BI wirklich verändert hat](https://www.youtube.com/watch?v=9wl_PLvgvyc) | 2025-08-01 | nur-zeitstempel | [33:13](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1993s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Wann%20brauche%20ich%20ein%20Gateway%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Externe%20Tools%20aktivieren) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [33:34](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2014s) |
| [Daten-WG Life-Update \| State of Power BI, Fabric & AI-Tools](https://www.youtube.com/watch?v=d3HdhRe_nK8) | 2026-06-01 | nur-zeitstempel | [02:10](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=130s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [09:44](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=584s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [1:00:24](https://www.youtube.com/watch?v=r416vanitYw&t=3624s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [21:31](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1291s) |
| [BI Thinkers Talk nr.76](https://www.youtube.com/watch?v=mlkP-6i5Kq8) | 2026-05-01 | kernaussagen+zeitstempel | [49:05](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=2945s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Asql-server
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Asql-server&f=tool%3Asql-server
