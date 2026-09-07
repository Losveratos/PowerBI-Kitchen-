---
id: "tool:mirroring"
name: "Mirroring"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 17
kernaussagen: 34
mit_kernaussagen: 11
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

Fabric bietet verschiedene Mirrored Items, mit denen sich bereits vorhandene Datenbanken in Fabric spiegeln lassen. (Stand 2026-01) Auch eigene Datenquellen wie Excel-Dateien lassen sich per Open Mirroring nach Fabric spiegeln. (Stand 2026-01) Open Mirroring ermöglicht es, Tabellen in Fabric unabhängig von der Datenquelle darzustellen, solange der Datenprovider die Datensätze in die Quelle einliefert. (Stand 2026-01)

## Aliase

Mirrored Database, Spiegelung, gespiegelt

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [DirectQuery](directquery.md) | Mirroring gegensatz DirectQuery | automatisch extrahiert, Quellenstelle vorhanden | „wenn Daten erstmal in Fabric sind gespiegelt, das ist schon besser als jetzt direct query auf irgendwelche großen Lake Systeme zu machen, die dann pro Computer halt berechnen und dann entsprechend teu“ (Fabric & Power BI Quarterly · 2026-1, 2026-01) | 8 |
| [SAP](sap.md) | SAP teil-von Mirroring | automatisch extrahiert, Quellenstelle vorhanden | „es gibt SAP Mirroring, hat wirklich auf der Febru sehr große Augen für sehr große Augen gesorgt und ist inzwischen ja da Preview“ (Fabric & Power BI Quarterly · 2026-1, 2026-01) | 7 |
| [Snowflake](snowflake.md) | Snowflake teil-von Mirroring | automatisch extrahiert, Quellenstelle vorhanden | „für Snowflake komplett bidirektionale Geschichte“ (Fabric & Power BI Quarterly · 2026-1, 2026-01) | 25 |
| [OneLake](onelake.md) | Mirroring setzt-voraus OneLake | automatisch extrahiert, Quellenstelle vorhanden | „geben ihn mit dem entsprechenden Event als Row Marker in Oneel Lake und Fabric baut daraus auf der Fabricseite eine identische Tabelle“ (Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial, 2026-01) | 16 |
| [Fabric Capacity](fabric-capacity.md) | Mirroring teil-von Fabric Capacity | automatisch extrahiert, Quellenstelle vorhanden | „die Speicherkosten ... sind ja die Speicherkosten je nach äh Kapazität im Terabyte Bereich äh mit drin (Segment 8)“ (BI Thinkers Talk nr.71, 2025-12) | 10 |
| [Fabric Capacity](fabric-capacity.md) | Mirroring setzt-voraus Fabric Capacity | automatisch extrahiert, Quellenstelle vorhanden | „hast du je nachdem, was für eine Kapazität du bei Fabric gekauft hast, kostenlosen Mirror Speicher dabei“ (Daten-WG Thinkers Talk nr.65, 2025-07) | 10 |
| [Microsoft Fabric](microsoft-fabric.md) | Mirroring und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 33 |
| [Power BI](power-bi.md) | Mirroring und Power BI im selben Segment | Heuristik, gezählt |  | 16 |
| [SQL](sql.md) | Mirroring und SQL im selben Segment | Heuristik, gezählt |  | 13 |
| [Lizenzen](lizenzen.md) | Mirroring und Lizenzen im selben Segment | Heuristik, gezählt |  | 10 |
| [Governance](governance.md) | Mirroring und Governance im selben Segment | Heuristik, gezählt |  | 9 |
| [Delta Lake](delta-lake.md) | Mirroring und Delta Lake im selben Segment | Heuristik, gezählt |  | 9 |
| [Direct Lake](direct-lake.md) | Mirroring und Direct Lake im selben Segment | Heuristik, gezählt |  | 8 |
| [Lakehouse](lakehouse.md) | Mirroring und Lakehouse im selben Segment | Heuristik, gezählt |  | 8 |
| [Performance](performance.md) | Mirroring und Performance im selben Segment | Heuristik, gezählt |  | 8 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 01:53 | auf die Sekunde | Mirroring in Fabric wuerde es heute ermoeglichen, SAP-Datasphere-Daten automatisch in ein per SQL-Endpunkt lesbares Format zu ueberfuehren, war zum Projektzeitpunkt aber noch nicht verfuegbar. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=113s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 00:05 | auf die Sekunde | Fabric bietet verschiedene Mirrored Items, mit denen sich bereits vorhandene Datenbanken in Fabric spiegeln lassen. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=5s) |
| Meinung | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 00:07 | auf die Sekunde | Einer der Sprecher findet Open Mirroring interessanter als klassisches Mirroring, weil es unabhängig von vorgegebenen Datenquellen funktioniert. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=7s) |
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
| Meinung | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 09:18 | auf die Sekunde | Einer der Sprecher bewertet die gezeigte Open-Mirroring-Demo als eindrucksvoll und fragt die Zuschauer, ob das Thema für sie hilfreich wäre. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=558s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 21:50 | auf die Sekunde | Row-Level Security und Column-Level Security funktionieren inzwischen auch für gespiegelte (mirrored) Objekte. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1310s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 25:19 | auf die Sekunde | SAP-Mirroring befindet sich inzwischen in der Preview-Phase und funktioniert wie das bestehende Azure-Data-Lake-Mirroring. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1519s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 25:32 | auf die Sekunde | Gespiegelte Daten in Fabric zu nutzen ist günstiger, als DirectQuery direkt gegen große Lake-Systeme wie Snowflake oder Databricks zu fahren, weil dort pro Abfrage Rechenkosten anfallen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1532s) |
| Fakt | BI Thinkers Talk n.72 | 2026-01 | 51:03 | auf die Sekunde | SharePoint-Listen lassen sich derzeit nicht direkt aus einem Notebook heraus anbinden, weshalb stattdessen Mirroring oder ein Umweg über Power Automate nötig ist. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3063s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 13:07 | auf die Sekunde | Für Fabric Mirroring existiert bereits ein Prototyp, mit dem Daten aus einer lokalen PostgreSQL-Datenbank in eine Mirror-Datenbank übertragen werden können. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=787s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 13:15 | auf die Sekunde | Beim Fabric Mirroring sind die Speicherkosten für gespiegelte Daten je nach Kapazität im Terabyte-Bereich bereits enthalten, sodass zusätzlich nur noch das Auslesen der Daten aus der Mirror-Datenbank bezahlt wird. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=795s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 55:58 | Abschnittsanfang | Mirroring in Microsoft Fabric enthält kostenlosen Speicherplatz proportional zur gebuchten Kapazität, etwa 64 TB bei einer F64-Kapazität, inklusive der automatischen Transformation in Tabellenformat. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 55:58 | Abschnittsanfang | Beim Mirroring von Databricks-Daten werden nur die Metadaten gespiegelt, weil Fabric direkt auf denselben zugrunde liegenden Speicher wie OneLake oder ADLS Gen2 zugreift, den Databricks bereits nutzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 11:33 | auf die Sekunde | Je nach gekaufter Fabric-Kapazität ist bei Open Mirroring kostenloser Mirror-Speicher enthalten, und das Processing wird nicht als Leistung angerechnet. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=693s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 15:24 | auf die Sekunde | Fabric Mirroring unterstützt offiziell Snowflake und Databricks über deren eigene Delta-/Job-Mechanismen, lässt sich über Open Mirroring aber auch für eigene Datenquellen erweitern, wenn Inserts, Updates und Deletes entsprechend gekennzeichnet werden. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=924s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 16:35 | auf die Sekunde | Mit einer F2-Kapazität sind laut Beispiel bis zu 2 TB kostenloser Mirroring-Speicher enthalten. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=995s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 16:45 | auf die Sekunde | Der kostenlose Mirroring-Speicher in Fabric darf ausschließlich zum Speichern von Spiegelungsreplikaten verwendet werden, nicht für andere Daten. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1005s) |
| Fakt | Daten-WG Deep Dive Financial Reporting | 2025-05 | 08:59 | auf die Sekunde | Die Erweiterung BC ADLS ermöglicht es, Business-Central-Tabellen aus der Cloud-Variante ähnlich wie bei einem Synapse Link direkt in ein Data Lake bzw. nach Fabric zu spiegeln. | [▶](https://www.youtube.com/watch?v=TYmKrreMO3I&t=539s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 32:06 | auf die Sekunde | Im Bereich Data Integration wurde Support für Mirroring in Kombination mit On-Premises- und Virtual-Network-Data-Gateways ergänzt, um gesicherten Zugriff auf firewallgeschützte Quellen zu ermöglichen. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1926s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 23:40 | auf die Sekunde | Mirroring für Oracle ist zum Zeitpunkt der Aufnahme offizieller angekündigt als für SAP, das bisher nur in Sessions gezeigt wurde. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1420s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 28:30 | auf die Sekunde | Mit Snowflake Mirroring lassen sich Snowflake-Datenbanken als Kopie in Fabric einziehen, während eine Databricks-Verbindung per Link wie ein Shortcut funktioniert, ohne die Daten zu kopieren. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1710s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial](https://www.youtube.com/watch?v=7j34Ndng0Os) | 2026-01-01 | kernaussagen+zeitstempel | [00:02](https://www.youtube.com/watch?v=7j34Ndng0Os&t=2s) · [01:54](https://www.youtube.com/watch?v=7j34Ndng0Os&t=114s) · [02:40](https://www.youtube.com/watch?v=7j34Ndng0Os&t=160s) |
| [Copilot + Power Automate = Gamechanger](https://www.youtube.com/watch?v=_MfM3rhJx58) | 2025-08-01 | nur-zeitstempel | [03:16](https://www.youtube.com/watch?v=_MfM3rhJx58&t=196s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Microsoft%20Learn%20%C2%B7%20Snowflake%20%26%20Mirroring) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Konditionen%20%28Stand%20Juli%202026%29) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Grenzen%2C%20die%20man%20kennen%20muss) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [13:25](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=805s) · [15:05](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=905s) · [18:20](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1100s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [22:30](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1350s) · [25:03](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1503s) · [26:42](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1602s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | kernaussagen+zeitstempel | [22:42](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1362s) · [24:00](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1440s) · [25:36](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1536s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [54:26](https://www.youtube.com/watch?v=G8s96sHUHac&t=3266s) · [55:58](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) · [57:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=3448s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [00:01](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1s) · [50:30](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3030s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | kernaussagen+zeitstempel | [28:00](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1680s) |
| [Datenmodellierung ist Governance](https://www.youtube.com/watch?v=lH_-A8NAQ-k) | 2025-11-01 | kernaussagen+zeitstempel | [23:28](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=1408s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [22:07](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1327s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [11:31](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=691s) · [13:03](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=783s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [09:27](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=567s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [30:50](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1850s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [1:02:40](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3760s) |
| [Daten-WG Special: Power BI vs. Qlik -part2](https://www.youtube.com/watch?v=_Vh5fDfHWz4) | 2025-10-01 | nur-zeitstempel | [1:05:36](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=3936s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Soll%20man%20von%20Power%20BI%20Premium%20auf%20Fabric%20umstellen%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Aus%20dem%20Kanal%20%C2%B7%20Fabric%20%26%20Tooling%20in%20der%20Praxis) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Joins%20%28Merges%29%20%C2%B7%20Tabellen%20verkn%C3%BCpfen) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Amirroring
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Amirroring&f=tool%3Amirroring
