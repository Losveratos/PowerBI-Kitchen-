---
id: "tool:directquery"
name: "DirectQuery"
typ: tool
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 18
kernaussagen: 5
mit_kernaussagen: 3
aliase:
  - "Direct Query"
---

# DirectQuery

Für eine Fabric-SQL-Datenbank ist Direct Lake nicht nutzbar, weshalb im Berichtsmodell Import oder DirectQuery verwendet werden muss. Gespiegelte Daten in Fabric zu nutzen ist günstiger, als DirectQuery direkt gegen große Lake-Systeme wie Snowflake oder Databricks zu fahren, weil dort pro Abfrage Rechenkosten anfallen. Bei DirectQuery-Abfragen über mehrere Fakttabellen hinweg entstehen laut den Sprechern schnell zusätzliche Overhead-Queries für jeden Join, was die Performance deutlich verschlechtert.

## Aliase

Direct Query

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Mirroring](mirroring.md) | gegensatz | belegt | 8 |
| [Sternschema](sternschema.md) | gegensatz | belegt | 9 |
| [Direct Lake](direct-lake.md) | gegensatz | belegt | 34 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 32 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 31 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 25 |
| [OneLake](onelake.md) | ko-vorkommen | heuristik | 22 |
| [Refresh](refresh.md) | ko-vorkommen | heuristik | 21 |
| [Snowflake](snowflake.md) | ko-vorkommen | heuristik | 16 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 15 |
| [Power BI Desktop](power-bi-desktop.md) | ko-vorkommen | heuristik | 13 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 12 |
| [Delta Lake](delta-lake.md) | ko-vorkommen | heuristik | 12 |
| [Fabric Capacity](fabric-capacity.md) | ko-vorkommen | heuristik | 11 |
| [Row-Level Security](row-level-security.md) | ko-vorkommen | heuristik | 11 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Empfehlung | Fabric & Power BI Quarterly · 2026-1 | 25:03 | Gespiegelte Daten in Fabric zu nutzen ist günstiger, als DirectQuery direkt gegen große Lake-Systeme wie Snowflake oder Databricks zu fahren, weil dort pro Abfrage Rechenkosten anfallen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1503s) |
| Meinung | BI Thinkers Talk nr.71 | 08:04 | DirectQuery unterstützt laut den Sprechern bei Quellen wie Snowflake oder Databricks kein Sternschema. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=484s) |
| Warnung | BI Thinkers Talk nr.71 | 09:41 | Bei DirectQuery-Abfragen über mehrere Fakttabellen hinweg entstehen laut den Sprechern schnell zusätzliche Overhead-Queries für jeden Join, was die Performance deutlich verschlechtert. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=581s) |
| Fakt | BI Thinkers Talk Nr.62 | 31:47 | Für eine Fabric-SQL-Datenbank ist Direct Lake nicht nutzbar, weshalb im Berichtsmodell Import oder DirectQuery verwendet werden muss. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1907s) |
| Meinung | BI Thinkers Talk Nr.62 | 47:40 | Mit Direct Lake wäre das Zurückschreiben asynchron und dadurch deutlich schneller als mit DirectQuery. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2860s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20zwei%20Dinge%2C%20die%20man%20wissen%20muss) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=03%20%C2%B7%20Semantische%20Modelle%20%26%20%2ADirect%20Lake%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Zwei%20Varianten%20%E2%80%94%20wichtig%20seit%202025) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [35:10](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2110s) · [36:44](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2204s) · [1:00:53](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3653s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | nur-zeitstempel | [32:06](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1926s) · [33:57](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2037s) · [37:15](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2235s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [11:21](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=681s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [44:27](https://www.youtube.com/watch?v=r416vanitYw&t=2667s) · [46:04](https://www.youtube.com/watch?v=r416vanitYw&t=2764s) · [50:55](https://www.youtube.com/watch?v=r416vanitYw&t=3055s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Dataflow%20Gen2%20%28Fabric%29) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Direct%20Lake%20%28Fabric%29) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [07:50](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=470s) · [25:07](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1507s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [08:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=508s) · [39:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2368s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [08:04](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=484s) · [09:41](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=581s) · [51:29](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=3089s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [24:33](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1473s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | nur-zeitstempel | [21:22](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1282s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [28:04](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1684s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [36:51](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2211s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [25:03](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1503s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | nur-zeitstempel | [30:38](https://www.youtube.com/watch?v=TYmKrreMO3I&t=1838s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [35:04](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2104s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | nur-zeitstempel | [14:57](https://www.youtube.com/watch?v=bt81POE-9Ig&t=897s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [1:10:03](https://www.youtube.com/watch?v=G8s96sHUHac&t=4203s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Adirectquery
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Adirectquery&f=tool%3Adirectquery
