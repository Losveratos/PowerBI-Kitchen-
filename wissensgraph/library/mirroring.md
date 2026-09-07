---
id: "tool:mirroring"
name: "Mirroring"
typ: tool
stand: "2026-09-07"
build: "20260907-1922"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 17
kernaussagen: 25
mit_kernaussagen: 5
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/mirroring.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/mirroring.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/mirroring.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/mirroring.json"
aliase:
  - "Mirrored Database"
  - "Spiegelung"
  - "gespiegelt"
---

# Mirroring

Fabric bietet verschiedene Mirrored Items, mit denen sich bereits vorhandene Datenbanken in Fabric spiegeln lassen. Auch eigene Datenquellen wie Excel-Dateien lassen sich per Open Mirroring nach Fabric spiegeln. Open Mirroring ermöglicht es, Tabellen in Fabric unabhängig von der Datenquelle darzustellen, solange der Datenprovider die Datensätze in die Quelle einliefert.

## Aliase

Mirrored Database, Spiegelung, gespiegelt

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [DirectQuery](directquery.md) | gegensatz | belegt | 8 |
| [SAP](sap.md) | teil-von | belegt | 7 |
| [Snowflake](snowflake.md) | teil-von | belegt | 25 |
| [OneLake](onelake.md) | setzt-voraus | belegt | 16 |
| [Fabric Capacity](fabric-capacity.md) | teil-von | belegt | 10 |
| [Fabric Capacity](fabric-capacity.md) | setzt-voraus | belegt | 10 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 33 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 16 |
| [Lizenzen](lizenzen.md) | ko-vorkommen | heuristik | 10 |
| [Governance](governance.md) | ko-vorkommen | heuristik | 9 |
| [Delta Lake](delta-lake.md) | ko-vorkommen | heuristik | 9 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 8 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 8 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 8 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 8 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 00:05 | auf die Sekunde | Fabric bietet verschiedene Mirrored Items, mit denen sich bereits vorhandene Datenbanken in Fabric spiegeln lassen. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=5s) |
| Meinung | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 00:07 | auf die Sekunde | Der Sprecher findet Open Mirroring interessanter als klassisches Mirroring, weil es unabhängig von vorgegebenen Datenquellen funktioniert. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=7s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 00:07 | auf die Sekunde | Auch eigene Datenquellen wie Excel-Dateien lassen sich per Open Mirroring nach Fabric spiegeln. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=7s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 00:27 | auf die Sekunde | Open Mirroring ermöglicht es, Tabellen in Fabric unabhängig von der Datenquelle darzustellen, solange der Datenprovider die Datensätze in die Quelle einliefert. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=27s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 01:07 | auf die Sekunde | Open Mirroring benötigt keinen eigenen ETL-Lauf, solange die Quelle liefern kann, was sich in ihr geändert hat. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=67s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 01:34 | auf die Sekunde | Bei Open Mirroring fügt die Datenquelle jedem Datensatz einen Row Marker bei, über den Fabric erkennt, ob ein Insert, Update oder Delete durchzuführen ist. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=94s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 01:58 | auf die Sekunde | Beim Open-Mirroring-Datenfluss wird der Datensatz mit Row-Marker-Event zunächst nach OneLake geschrieben, von wo Fabric eine identische Replik-Tabelle aufbaut. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=118s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 02:47 | auf die Sekunde | Für eine F64-Kapazität stellt Microsoft im Rahmen von Open Mirroring 64 TB Speicherplatz kostenlos zur Verfügung. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=167s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 03:05 | auf die Sekunde | Der kostenlose Speicherplatz bei Open Mirroring soll die doppelte Datenhaltung aus Quelle und Replikat in Fabric kompensieren. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=185s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 03:59 | auf die Sekunde | Kollege Stefan hat als Prototyp ein Open-Mirroring-Beispiel mit einer lokalen PostgreSQL-Datenbank gebaut, die nach Fabric repliziert wird. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=239s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 04:52 | auf die Sekunde | Im gezeigten Sync-Tool ist von drei konfigurierten Tabellen nur eine aktiviert, und die Abfrage arbeitet ID-basiert statt per Timestamp. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=292s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 05:40 | auf die Sekunde | Über die Kommandozeile lassen sich in Fabric Workspaces auflisten, auswählen und darin per New Item eine Mirror Database anlegen. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=340s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 06:45 | Abschnittsanfang | Der Sync-Prozess schreibt die replizierten Daten in Paketdateien und lädt sie in Batches mit Wartezeit zwischen den Schritten nach Fabric hoch. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=405s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 06:45 | Abschnittsanfang | Bei Timeouts während des Sync-Vorgangs greift im gezeigten Tool eine Retry-Logik, die den Upload erneut versucht. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=405s) |
| Empfehlung | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 06:47 | auf die Sekunde | Man sollte für den Sync eher größere Batches von rund 1000 bis 2000 Zeilen pro Datei verwenden statt der in der Demo genutzten 13 Zeilen. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=407s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 08:39 | Abschnittsanfang | Nach Abschluss der Replikation lassen sich die gespiegelten Daten direkt per SQL-Abfrage in Fabric auslesen. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=519s) |
| Meinung | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 09:18 | auf die Sekunde | Der Sprecher bewertet die gezeigte Open-Mirroring-Demo als eindrucksvoll und fragt die Zuschauer, ob das Thema für sie hilfreich wäre. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=558s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 21:50 | auf die Sekunde | Row-Level Security und Column-Level Security funktionieren inzwischen auch für gespiegelte (mirrored) Objekte. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1310s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 25:19 | auf die Sekunde | SAP-Mirroring befindet sich inzwischen in der Preview-Phase und funktioniert wie das bestehende Azure-Data-Lake-Mirroring. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1519s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 25:32 | auf die Sekunde | Gespiegelte Daten in Fabric zu nutzen ist günstiger, als DirectQuery direkt gegen große Lake-Systeme wie Snowflake oder Databricks zu fahren, weil dort pro Abfrage Rechenkosten anfallen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1532s) |
| Fakt | BI Thinkers Talk n.72 | 2026-01 | 51:03 | auf die Sekunde | SharePoint-Listen lassen sich derzeit nicht direkt aus einem Notebook heraus anbinden, weshalb stattdessen Mirroring oder ein Umweg über Power Automate nötig ist. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3063s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 13:07 | auf die Sekunde | Für Fabric Mirroring existiert bereits ein Prototyp, mit dem Daten aus einer lokalen PostgreSQL-Datenbank in eine Mirror-Datenbank übertragen werden können. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=787s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 13:15 | auf die Sekunde | Beim Fabric Mirroring sind die Speicherkosten für gespiegelte Daten je nach Kapazität im Terabyte-Bereich bereits enthalten, sodass zusätzlich nur noch das Auslesen der Daten aus der Mirror-Datenbank bezahlt wird. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=795s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 55:58 | Abschnittsanfang | Mirroring in Microsoft Fabric enthält kostenlosen Speicherplatz proportional zur gebuchten Kapazität, etwa 64 TB bei einer F64-Kapazität, inklusive der automatischen Transformation in Tabellenformat. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 55:58 | Abschnittsanfang | Beim Mirroring von Databricks-Daten werden nur die Metadaten gespiegelt, weil Fabric direkt auf denselben zugrunde liegenden Speicher wie OneLake oder ADLS Gen2 zugreift, den Databricks bereits nutzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial](https://www.youtube.com/watch?v=7j34Ndng0Os) | 2026-01-01 | kernaussagen+zeitstempel | [00:02](https://www.youtube.com/watch?v=7j34Ndng0Os&t=2s) · [01:54](https://www.youtube.com/watch?v=7j34Ndng0Os&t=114s) · [02:40](https://www.youtube.com/watch?v=7j34Ndng0Os&t=160s) |
| [Copilot + Power Automate = Gamechanger](https://www.youtube.com/watch?v=_MfM3rhJx58) | 2025-08-01 | nur-zeitstempel | [03:16](https://www.youtube.com/watch?v=_MfM3rhJx58&t=196s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Microsoft%20Learn%20%C2%B7%20Snowflake%20%26%20Mirroring) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Konditionen%20%28Stand%20Juli%202026%29) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Grenzen%2C%20die%20man%20kennen%20muss) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [13:25](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=805s) · [15:05](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=905s) · [18:20](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1100s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [22:30](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1350s) · [25:03](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1503s) · [26:42](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1602s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [22:42](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1362s) · [24:00](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1440s) · [25:36](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1536s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [54:26](https://www.youtube.com/watch?v=G8s96sHUHac&t=3266s) · [55:58](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) · [57:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=3448s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [00:01](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1s) · [50:30](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3030s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [28:00](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1680s) |
| [Datenmodellierung ist Governance](https://www.youtube.com/watch?v=lH_-A8NAQ-k) | 2025-11-01 | nur-zeitstempel | [23:28](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=1408s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [22:07](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1327s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [11:31](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=691s) · [13:03](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=783s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [09:27](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=567s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [30:50](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1850s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [1:02:40](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3760s) |
| [Daten-WG Special: Power BI vs. Qlik -part2](https://www.youtube.com/watch?v=_Vh5fDfHWz4) | 2025-10-01 | nur-zeitstempel | [1:05:36](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=3936s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Soll%20man%20von%20Power%20BI%20Premium%20auf%20Fabric%20umstellen%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Aus%20dem%20Kanal%20%C2%B7%20Fabric%20%26%20Tooling%20in%20der%20Praxis) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Joins%20%28Merges%29%20%C2%B7%20Tabellen%20verkn%C3%BCpfen) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Amirroring
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Amirroring&f=tool%3Amirroring
