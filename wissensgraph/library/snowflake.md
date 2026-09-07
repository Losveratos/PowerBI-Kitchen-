---
id: "tool:snowflake"
name: "Snowflake"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 21
kernaussagen: 9
mit_kernaussagen: 9
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/snowflake.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/snowflake.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/snowflake.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/snowflake.json"
aliase: []
---

# Snowflake

Mit Snowflake Mirroring lassen sich Snowflake-Datenbanken als Kopie in Fabric einziehen, während eine Databricks-Verbindung per Link wie ein Shortcut funktioniert, ohne die Daten zu kopieren. Die OneLake Table API erlaubt den nativen Zugriff auf Delta- oder Iceberg-Tabellen und ermöglicht die bidirektionale Nutzung mit Snowflake. Fabric Mirroring unterstützt offiziell Snowflake und Databricks über deren eigene Delta-/Job-Mechanismen, lässt sich über Open Mirroring aber auch für eigene Datenquellen erweitern, wenn Inserts, Updates und Deletes entsprechend gekennzeichnet werden. (Stand 2025-07)

## Aliase

Keine weiteren Schreibweisen hinterlegt.

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Mirroring](mirroring.md) | Snowflake teil-von Mirroring | automatisch extrahiert, Quellenstelle vorhanden | „für Snowflake komplett bidirektionale Geschichte“ (Fabric & Power BI Quarterly · 2026-1, 2026-01) | 25 |
| [Microsoft Fabric](microsoft-fabric.md) | Snowflake und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 45 |
| [Power BI](power-bi.md) | Snowflake und Power BI im selben Segment | Heuristik, gezählt |  | 29 |
| [OneLake](onelake.md) | Snowflake und OneLake im selben Segment | Heuristik, gezählt |  | 18 |
| [DirectQuery](directquery.md) | Snowflake und DirectQuery im selben Segment | Heuristik, gezählt |  | 16 |
| [Warehouse](warehouse.md) | Snowflake und Warehouse im selben Segment | Heuristik, gezählt |  | 14 |
| [Performance](performance.md) | Snowflake und Performance im selben Segment | Heuristik, gezählt |  | 14 |
| [Reporting](reporting.md) | Snowflake und Reporting im selben Segment | Heuristik, gezählt |  | 14 |
| [Lakehouse](lakehouse.md) | Snowflake und Lakehouse im selben Segment | Heuristik, gezählt |  | 13 |
| [SQL](sql.md) | Snowflake und SQL im selben Segment | Heuristik, gezählt |  | 13 |
| [Direct Lake](direct-lake.md) | Snowflake und Direct Lake im selben Segment | Heuristik, gezählt |  | 13 |
| [Governance](governance.md) | Snowflake und Governance im selben Segment | Heuristik, gezählt |  | 12 |
| [Delta Lake](delta-lake.md) | Snowflake und Delta Lake im selben Segment | Heuristik, gezählt |  | 10 |
| [SAP](sap.md) | Snowflake und SAP im selben Segment | Heuristik, gezählt |  | 9 |
| [Excel](excel.md) | Snowflake und Excel im selben Segment | Heuristik, gezählt |  | 9 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Warnung | Fabric Planning unboxing | 2026-03 | 51:00 | auf die Sekunde | Das Zurückschreiben ist derzeit auf SQL-Datenbanken beschränkt, während Inforiver zusätzlich nach Snowflake oder SAP schreiben konnte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3060s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 25:32 | auf die Sekunde | Gespiegelte Daten in Fabric zu nutzen ist günstiger, als DirectQuery direkt gegen große Lake-Systeme wie Snowflake oder Databricks zu fahren, weil dort pro Abfrage Rechenkosten anfallen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1532s) |
| Meinung | BI Thinkers Talk nr.71 | 2025-12 | 08:04 | Abschnittsanfang | DirectQuery unterstützt laut den Sprechern bei Quellen wie Snowflake oder Databricks kein Sternschema. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=484s) |
| Meinung | Unboxing MCP Server for Power BI Modelling | 2025-12 | 15:52 | auf die Sekunde | Es wird als zukünftige Möglichkeit gesehen, dass MCP-Server von Snowflake, Databricks oder SAP miteinander reden und Daten direkt nach Fabric schieben könnten. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=952s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 15:24 | auf die Sekunde | Fabric Mirroring unterstützt offiziell Snowflake und Databricks über deren eigene Delta-/Job-Mechanismen, lässt sich über Open Mirroring aber auch für eigene Datenquellen erweitern, wenn Inserts, Updates und Deletes entsprechend gekennzeichnet werden. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=924s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? |  | 17:30 | auf die Sekunde | Fabric ist laut Martin für Business-User mit Excel- und Power-BI-Hintergrund zugänglicher als Snowflake. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1050s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 |  | 24:59 | auf die Sekunde | Fabric bietet jetzt bidirektionale Shortcut-Integrationen mit Snowflake und Databricks. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1499s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 26:04 | auf die Sekunde | Die OneLake Table API erlaubt den nativen Zugriff auf Delta- oder Iceberg-Tabellen und ermöglicht die bidirektionale Nutzung mit Snowflake. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1564s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 28:30 | auf die Sekunde | Mit Snowflake Mirroring lassen sich Snowflake-Datenbanken als Kopie in Fabric einziehen, während eine Databricks-Verbindung per Link wie ein Shortcut funktioniert, ohne die Daten zu kopieren. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1710s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [26:39](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1599s) · [28:04](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1684s) · [29:36](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1776s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20drei%20Integrationswege%20im%20%C3%9Cberblick) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Voraussetzungen%20%26%20Trade-offs) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Der%20Vergleich) |
| [27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite](https://www.youtube.com/watch?v=dKA-38gRD8Q) | 2026-05-01 | kernaussagen+zeitstempel | [06:29](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=389s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | kernaussagen+zeitstempel | [28:00](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1680s) · [28:51](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1731s) · [30:51](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1851s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [22:30](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1350s) · [25:03](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1503s) · [26:42](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1602s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | kernaussagen+zeitstempel | [22:42](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1362s) · [24:00](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1440s) · [25:36](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1536s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [08:08](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=488s) · [09:42](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=582s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [13:25](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=805s) · [15:05](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=905s) |
| [10 Jahre BI für alle? Was Power BI wirklich verändert hat](https://www.youtube.com/watch?v=9wl_PLvgvyc) | 2025-08-01 | nur-zeitstempel | [17:08](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1028s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | kernaussagen+zeitstempel | [06:12](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=372s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [37:19](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2239s) · [50:19](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3019s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Snowflake-Variante%20%28nicht%20empfohlen%29) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Star%20vor%20Snowflake) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [24:38](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1478s) |
| [Unboxing MCP Server for Power BI Modelling](https://www.youtube.com/watch?v=iinfiHxznOU) | 2025-12-01 | kernaussagen+zeitstempel | [15:51](https://www.youtube.com/watch?v=iinfiHxznOU&t=951s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [29:09](https://www.youtube.com/watch?v=VD1N68Fhoco&t=1749s) |
| [Daten-WG 2026 Lineup](https://www.youtube.com/watch?v=AX7b8_aNekw) | 2026-05-01 | nur-zeitstempel | [11:28](https://www.youtube.com/watch?v=AX7b8_aNekw&t=688s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [38:17](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2297s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [24:50](https://www.youtube.com/watch?v=G8s96sHUHac&t=1490s) |
| [BI Thinkers Talk - Data Modelling - Fabric Data Days Edition](https://www.youtube.com/watch?v=mUALlPmGcEk) | 2025-11-01 | kernaussagen+zeitstempel | [22:42](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1362s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [08:04](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=484s) |
| [BI Thinkers Talk - Data Modeling - Fabric Data Days Edition [EN]](https://www.youtube.com/watch?v=uxYFqwe_Wiw) | 2025-12-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Asnowflake
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Asnowflake&f=tool%3Asnowflake
