---
id: "tool:directquery"
name: "DirectQuery"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 18
kernaussagen: 11
mit_kernaussagen: 8
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/directquery.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/directquery.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/directquery.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/directquery.json"
aliase:
  - "Direct Query"
---

# DirectQuery

Für eine Fabric-SQL-Datenbank ist Direct Lake nicht nutzbar, weshalb im Berichtsmodell Import oder DirectQuery verwendet werden muss. (Stand 2025-05) In diesem Projekt wird bewusst weder DirectQuery noch Direct Lake genutzt, um die Fabric-Kapazitaet durch das mit Power-BI-Pro-Lizenzen ausgerollte Frontend nicht zu belasten. (Stand 2026-08) Wird das Zeitfenster einer DirectQuery-Abfrage auf eine Kusto-/Eventhouse-Datenbank deutlich verkleinert, hält die Fabric-Kapazität im Langzeittest spürbar länger durch. (Stand 2025-07)

## Aliase

Direct Query

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Mirroring](mirroring.md) | Mirroring gegensatz DirectQuery | automatisch extrahiert, Quellenstelle vorhanden | „wenn Daten erstmal in Fabric sind gespiegelt, das ist schon besser als jetzt direct query auf irgendwelche großen Lake Systeme zu machen, die dann pro Computer halt berechnen und dann entsprechend teu“ (Fabric & Power BI Quarterly · 2026-1, 2026-01) | 8 |
| [Sternschema](sternschema.md) | DirectQuery gegensatz Sternschema | automatisch extrahiert, Quellenstelle vorhanden | „dass äh Direct Query eigentlich kein Starschema [verträgt] (Segment 5)“ (BI Thinkers Talk nr.71, 2025-12) | 9 |
| [Direct Lake](direct-lake.md) | Direct Lake gegensatz DirectQuery | automatisch extrahiert, Quellenstelle vorhanden | „glaube ich ja, dass wir da Direct Lake nicht hinbekommen, aber für so ein kleinen Use Case wird's ja Direct Query wahrscheinlich auch tun“ (BI Thinkers Talk Nr.62, 2025-05) | 34 |
| [Power BI](power-bi.md) | DirectQuery und Power BI im selben Segment | Heuristik, gezählt |  | 32 |
| [Performance](performance.md) | DirectQuery und Performance im selben Segment | Heuristik, gezählt |  | 31 |
| [Microsoft Fabric](microsoft-fabric.md) | DirectQuery und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 25 |
| [OneLake](onelake.md) | DirectQuery und OneLake im selben Segment | Heuristik, gezählt |  | 22 |
| [Refresh](refresh.md) | DirectQuery und Refresh im selben Segment | Heuristik, gezählt |  | 21 |
| [Snowflake](snowflake.md) | DirectQuery und Snowflake im selben Segment | Heuristik, gezählt |  | 16 |
| [SQL](sql.md) | DirectQuery und SQL im selben Segment | Heuristik, gezählt |  | 16 |
| [Reporting](reporting.md) | DirectQuery und Reporting im selben Segment | Heuristik, gezählt |  | 15 |
| [Power BI Desktop](power-bi-desktop.md) | DirectQuery und Power BI Desktop im selben Segment | Heuristik, gezählt |  | 13 |
| [Visualisierung](visualisierung.md) | DirectQuery und Visualisierung im selben Segment | Heuristik, gezählt |  | 12 |
| [Delta Lake](delta-lake.md) | DirectQuery und Delta Lake im selben Segment | Heuristik, gezählt |  | 12 |
| [Fabric Capacity](fabric-capacity.md) | DirectQuery und Fabric Capacity im selben Segment | Heuristik, gezählt |  | 11 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 07:50 | auf die Sekunde | In diesem Projekt wird bewusst weder DirectQuery noch Direct Lake genutzt, um die Fabric-Kapazitaet durch das mit Power-BI-Pro-Lizenzen ausgerollte Frontend nicht zu belasten. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=470s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 25:32 | auf die Sekunde | Gespiegelte Daten in Fabric zu nutzen ist günstiger, als DirectQuery direkt gegen große Lake-Systeme wie Snowflake oder Databricks zu fahren, weil dort pro Abfrage Rechenkosten anfallen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1532s) |
| Meinung | BI Thinkers Talk nr.71 | 2025-12 | 08:04 | Abschnittsanfang | DirectQuery unterstützt laut den Sprechern bei Quellen wie Snowflake oder Databricks kein Sternschema. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=484s) |
| Warnung | BI Thinkers Talk nr.71 | 2025-12 | 10:20 | auf die Sekunde | Bei DirectQuery-Abfragen über mehrere Fakttabellen hinweg entstehen laut den Sprechern schnell zusätzliche Overhead-Queries für jeden Join, was die Performance deutlich verschlechtert. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=620s) |
| Empfehlung | BI Thinkers Talk nr.64 | 2025-07 | 35:32 | auf die Sekunde | Wird das Zeitfenster einer DirectQuery-Abfrage auf eine Kusto-/Eventhouse-Datenbank deutlich verkleinert, hält die Fabric-Kapazität im Langzeittest spürbar länger durch. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2132s) |
| Meinung | BI Thinkers Talk nr.64 | 2025-07 | 38:17 | auf die Sekunde | DirectQuery gilt als sehr teuer im Kapazitätsverbrauch, was sich auch bei Translytical Task Flows gezeigt hat. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2297s) |
| Meinung | Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup | 2025-06 | 25:24 | auf die Sekunde | Die Kombination aus DirectQuery und KQL ueber Kusto im Hintergrund funktioniert gut und macht bei schneller Interaktion mit den Live-Daten Spass. | [▶](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1524s) |
| Warnung | Daten-WG Deep Dive Financial Reporting | 2025-05 | 31:34 | auf die Sekunde | Direct Query gegen ein Produktivsystem kann bei hoher Last reale Performanceprobleme im ERP-System verursachen, wie ein Vorfall in einer Power-BI-Schulung zeigte. | [▶](https://www.youtube.com/watch?v=TYmKrreMO3I&t=1894s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 33:13 | auf die Sekunde | Für eine Fabric-SQL-Datenbank ist Direct Lake nicht nutzbar, weshalb im Berichtsmodell Import oder DirectQuery verwendet werden muss. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1993s) |
| Meinung | BI Thinkers Talk Nr.62 | 2025-05 | 48:53 | auf die Sekunde | Mit Direct Lake wäre das Zurückschreiben asynchron und dadurch deutlich schneller als mit DirectQuery. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2933s) |
| Meinung | Daten-WG Thinkers Talk n61 | 2025-04 | 36:02 | auf die Sekunde | Eine eigene Datumstabelle aus der Quelle ist vor allem bei DirectQuery relevant, damit Jahresfilter direkt an die Quelle weitergereicht werden können, statt alle passenden Einzeltage aufzuzählen; im Import Mode ist das wegen der Persistierung der Daten weniger entscheidend. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2162s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20zwei%20Dinge%2C%20die%20man%20wissen%20muss) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=03%20%C2%B7%20Semantische%20Modelle%20%26%20%2ADirect%20Lake%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Zwei%20Varianten%20%E2%80%94%20wichtig%20seit%202025) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [35:10](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2110s) · [36:44](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2204s) · [1:00:53](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3653s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | kernaussagen+zeitstempel | [32:06](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1926s) · [33:57](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2037s) · [37:15](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2235s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [11:21](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=681s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [44:27](https://www.youtube.com/watch?v=r416vanitYw&t=2667s) · [46:04](https://www.youtube.com/watch?v=r416vanitYw&t=2764s) · [50:55](https://www.youtube.com/watch?v=r416vanitYw&t=3055s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Dataflow%20Gen2%20%28Fabric%29) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Direct%20Lake%20%28Fabric%29) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [07:50](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=470s) · [25:07](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1507s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [08:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=508s) · [39:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2368s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [08:04](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=484s) · [09:41](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=581s) · [51:29](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=3089s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | kernaussagen+zeitstempel | [24:33](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1473s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | kernaussagen+zeitstempel | [21:22](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1282s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [28:04](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1684s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | kernaussagen+zeitstempel | [36:51](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2211s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [25:03](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1503s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | kernaussagen+zeitstempel | [30:38](https://www.youtube.com/watch?v=TYmKrreMO3I&t=1838s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | kernaussagen+zeitstempel | [35:04](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2104s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | kernaussagen+zeitstempel | [14:57](https://www.youtube.com/watch?v=bt81POE-9Ig&t=897s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [1:10:03](https://www.youtube.com/watch?v=G8s96sHUHac&t=4203s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Adirectquery
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Adirectquery&f=tool%3Adirectquery
