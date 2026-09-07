---
id: "tool:delta-lake"
name: "Delta Lake"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 4
kernaussagen: 9
mit_kernaussagen: 5
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/delta-lake.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/delta-lake.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/delta-lake.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/delta-lake.json"
aliase:
  - "Delta"
  - "Parquet"
  - "Delta Parquet"
---

# Delta Lake

Instant Shortcuts, die automatisch in das Delta-Format umwandeln, funktionierten zum Zeitpunkt der Aufnahme noch nicht für Parquet-Dateien. (Stand 2025-07) Ein selbstgeschriebenes Python-Skript exportiert SQL-Server-Tabellen als Delta-Parquet-Dateien direkt in den OneLake-Speicher, wo sie sofort als Tabelle über den SQL-Endpunkt verfügbar sind. (Stand 2025-07) Aktuell werden Quellsysteme häufig tabellenweise per CDC oder als Delta Lake direkt in den Data Lake geschrieben, was ohne Ordnungsstruktur schnell zu einem sogenannten Data Swamp wird. (Stand 2025-07)

## Aliase

Delta, Parquet, Delta Parquet

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Microsoft Fabric](microsoft-fabric.md) | Delta Lake und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 35 |
| [OneLake](onelake.md) | Delta Lake und OneLake im selben Segment | Heuristik, gezählt |  | 31 |
| [Lakehouse](lakehouse.md) | Delta Lake und Lakehouse im selben Segment | Heuristik, gezählt |  | 28 |
| [SQL](sql.md) | Delta Lake und SQL im selben Segment | Heuristik, gezählt |  | 26 |
| [Direct Lake](direct-lake.md) | Delta Lake und Direct Lake im selben Segment | Heuristik, gezählt |  | 21 |
| [Warehouse](warehouse.md) | Delta Lake und Warehouse im selben Segment | Heuristik, gezählt |  | 18 |
| [Power BI](power-bi.md) | Delta Lake und Power BI im selben Segment | Heuristik, gezählt |  | 15 |
| [Notebook](notebook.md) | Delta Lake und Notebook im selben Segment | Heuristik, gezählt |  | 14 |
| [Dataflow](dataflow.md) | Delta Lake und Dataflow im selben Segment | Heuristik, gezählt |  | 13 |
| [Refresh](refresh.md) | Delta Lake und Refresh im selben Segment | Heuristik, gezählt |  | 13 |
| [Data Pipeline](data-pipeline.md) | Delta Lake und Data Pipeline im selben Segment | Heuristik, gezählt |  | 13 |
| [Performance](performance.md) | Delta Lake und Performance im selben Segment | Heuristik, gezählt |  | 12 |
| [Spark](spark.md) | Delta Lake und Spark im selben Segment | Heuristik, gezählt |  | 12 |
| [DirectQuery](directquery.md) | Delta Lake und DirectQuery im selben Segment | Heuristik, gezählt |  | 12 |
| [Fabric Capacity](fabric-capacity.md) | Delta Lake und Fabric Capacity im selben Segment | Heuristik, gezählt |  | 11 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 04:35 | auf die Sekunde | Instant Shortcuts, die automatisch in das Delta-Format umwandeln, funktionierten zum Zeitpunkt der Aufnahme noch nicht für Parquet-Dateien. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=275s) |
| Warnung | Daten-WG Thinkers Talk nr.65 | 2025-07 | 04:56 | auf die Sekunde | Die wenige Tage zuvor angekündigte automatische CSV-zu-Delta-Umwandlung im Shortcut ist als Preview-Feature noch instabil und bricht bei Delta-inkompatiblen Spaltennamen ohne aussagekräftige Fehlermeldung ab. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=296s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 17:11 | auf die Sekunde | Aktuell werden Quellsysteme häufig tabellenweise per CDC oder als Delta Lake direkt in den Data Lake geschrieben, was ohne Ordnungsstruktur schnell zu einem sogenannten Data Swamp wird. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1031s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 24:02 | auf die Sekunde | Ein selbstgeschriebenes Python-Skript exportiert SQL-Server-Tabellen als Delta-Parquet-Dateien direkt in den OneLake-Speicher, wo sie sofort als Tabelle über den SQL-Endpunkt verfügbar sind. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1442s) |
| Warnung | Daten-WG Deep Dive Financial Reporting | 2025-05 | 29:05 | auf die Sekunde | Business-Central-Spaltennamen mit Sonderzeichen lassen sich nicht direkt in Parquet-Dateien laden, weil Parquet dafür keine kompatiblen Spaltennamen zulässt. | [▶](https://www.youtube.com/watch?v=TYmKrreMO3I&t=1745s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 21:00 | auf die Sekunde | Shortcut Transformations wandeln CSV-, JSON- oder Parquet-Dateien direkt im Shortcut in Delta-Tabellen um, ohne separate ETL-Strecke. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1260s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 26:04 | auf die Sekunde | Die OneLake Table API erlaubt den nativen Zugriff auf Delta- oder Iceberg-Tabellen und ermöglicht die bidirektionale Nutzung mit Snowflake. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1564s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 42:25 | auf die Sekunde | Mit der Shortcut-Transformation wird eine per Shortcut verlinkte CSV-Datei automatisch in eine Delta-Tabelle umgewandelt, ohne dass dafuer ein Notebook laufen muss. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2545s) |
| Warnung | Fabric & Power BI Quarterly · 2025 Q3 |  | 44:12 | auf die Sekunde | Das Delta-Format hat strengere Restriktionen bei erlaubten Zeichen in Tabellennamen als CSV, was bei der Shortcut-Transformation zu Verwirrung durch Fehlermeldungen fuehren kann. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2652s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=02%20%C2%B7%20Architektur%20%26%20%2Azentrale%20Komponenten%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=03%20%C2%B7%20Semantische%20Modelle%20%26%20%2ADirect%20Lake%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Fabric-Antwort) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [11:32](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=692s) · [23:04](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1384s) · [24:40](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1480s) |
| [Mythos Data Vault und richtig große Modelle](https://www.youtube.com/watch?v=rrCi0lnGrCg) | 2025-07-01 | kernaussagen+zeitstempel | [16:10](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=970s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Microsoft%20Fabric%20%26%20OneLake) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Fabric-Bausteine) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datei-Quellen%20%C2%B7%20CSV%20%C2%B7%20Excel%20%C2%B7%20JSON%20%C2%B7%20Parquet) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Adelta-lake
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Adelta-lake&f=tool%3Adelta-lake
