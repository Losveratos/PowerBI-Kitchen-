---
id: "tool:onelake"
name: "OneLake"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 14
kernaussagen: 36
mit_kernaussagen: 15
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/onelake.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/onelake.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/onelake.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/onelake.json"
aliase:
  - "One Lake"
---

# OneLake

Microsoft Fabric besteht im Kern aus zwei wesentlichen Komponenten: der Kapazität, die man in Azure bucht, und dem OneLake, in dem die Daten liegen und verwaltet werden. (Stand 2026-03) Ein Arbeitsbereich wird einer Kapazität zugeordnet, und innerhalb dieses Arbeitsbereichs werden Artefakte und Daten entsprechend im OneLake abgelegt. (Stand 2026-03) Die Rechenleistung, die innerhalb eines Arbeitsbereichs zum Arbeiten mit den Daten im OneLake genutzt wird, stammt aus der zugeordneten Fabric-Kapazität. (Stand 2026-03)

## Aliase

One Lake

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Direct Lake](direct-lake.md) | Direct Lake setzt-voraus OneLake | automatisch extrahiert, Quellenstelle vorhanden | „Direct Lake on Oneel Lake, um noch mal kurz das Thema zurückzuspannen“ (Fabric & Power BI Quarterly · 2025 Q4) | 29 |
| [Composite Models](composite-models.md) | Composite Models setzt-voraus OneLake | automatisch extrahiert, Quellenstelle vorhanden | „Composite Model wird das erst, wenn dann quasi diese große Änderung, die ja auch angekündigt wurde mit Oneelake Security“ (Fabric & Power BI Quarterly \| 2025 Q2, 2025-04) | 0 |
| [Mirroring](mirroring.md) | Mirroring setzt-voraus OneLake | automatisch extrahiert, Quellenstelle vorhanden | „geben ihn mit dem entsprechenden Event als Row Marker in Oneel Lake und Fabric baut daraus auf der Fabricseite eine identische Tabelle“ (Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial, 2026-01) | 16 |
| [Gateway](gateway.md) | OneLake ersetzt Gateway | automatisch extrahiert, Quellenstelle vorhanden | „ich musste auch lokal keine ähm kein Data Gateway installieren“ (Daten-WG Thinkers Talk nr.65, 2025-07) | 0 |
| [Lakehouse](lakehouse.md) | Lakehouse setzt-voraus OneLake | automatisch extrahiert, Quellenstelle vorhanden | „könnte ich sie in OneLake auslagern und in Lakehouse verwenden, um darauf aufbauend ein semantisches Modell zu erstellen“ (Why Passion Beats Niche, 2025-09) | 34 |
| [Microsoft Fabric](microsoft-fabric.md) | OneLake teil-von Microsoft Fabric | automatisch extrahiert, Quellenstelle vorhanden | „Wir bringen erstmal nur die EP Daten von mir aus auch täglich in ein Warehouse oder in ein Oneel, wie es hier“ (LogiMAT Arena Atrium 2026 \| Expert Forum - Supply Chain Risiko Management, 2026-04) | 57 |
| [Power BI](power-bi.md) | OneLake und Power BI im selben Segment | Heuristik, gezählt |  | 42 |
| [Delta Lake](delta-lake.md) | OneLake und Delta Lake im selben Segment | Heuristik, gezählt |  | 31 |
| [Reporting](reporting.md) | OneLake und Reporting im selben Segment | Heuristik, gezählt |  | 25 |
| [SQL](sql.md) | OneLake und SQL im selben Segment | Heuristik, gezählt |  | 25 |
| [Warehouse](warehouse.md) | OneLake und Warehouse im selben Segment | Heuristik, gezählt |  | 25 |
| [DirectQuery](directquery.md) | OneLake und DirectQuery im selben Segment | Heuristik, gezählt |  | 22 |
| [Fabric Capacity](fabric-capacity.md) | OneLake und Fabric Capacity im selben Segment | Heuristik, gezählt |  | 21 |
| [Data Pipeline](data-pipeline.md) | OneLake und Data Pipeline im selben Segment | Heuristik, gezählt |  | 18 |
| [Snowflake](snowflake.md) | OneLake und Snowflake im selben Segment | Heuristik, gezählt |  | 18 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 01:38 | auf die Sekunde | Beim SAP-Datasphere-Projekt lagen die Delta-Dateien zunaechst in einem Azure Data Lake Gen 2 statt im OneLake, liessen sich aber gut anbinden. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=98s) |
| Empfehlung | LogiMAT Arena Atrium 2026 \| Expert Forum - Supply Chain Risiko Management | 2026-04 | 16:01 | Abschnittsanfang | Statt sofort eine komplexe Architektur mit Machine Learning aufzubauen, empfiehlt es sich, zunächst nur die ERP-Daten täglich in ein Warehouse oder OneLake zu laden. | [▶](https://www.youtube.com/watch?v=DFw664hd1IE&t=961s) |
| Meinung | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 00:04 | auf die Sekunde | Die im gehörten Podcast getroffene Aussage, dass Fabric-Daten im OneLake stets in der Home-Region des Tenants liegen, ist nur teilweise richtig. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=4s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 00:28 | auf die Sekunde | Microsoft Fabric besteht im Kern aus zwei wesentlichen Komponenten: der Kapazität, die man in Azure bucht, und dem OneLake, in dem die Daten liegen und verwaltet werden. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=28s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 00:54 | auf die Sekunde | Ein Arbeitsbereich wird einer Kapazität zugeordnet, und innerhalb dieses Arbeitsbereichs werden Artefakte und Daten entsprechend im OneLake abgelegt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=54s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 01:01 | auf die Sekunde | Die Rechenleistung, die innerhalb eines Arbeitsbereichs zum Arbeiten mit den Daten im OneLake genutzt wird, stammt aus der zugeordneten Fabric-Kapazität. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=61s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 01:14 | auf die Sekunde | Verschiebt man die Rechenleistung einer Kapazität in eine andere Region, verschiebt sich dadurch auch der Ablageort der zugehörigen Daten im OneLake. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=74s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 01:29 | auf die Sekunde | Bestimmte Szenarien erfordern, dass Daten aus rechtlichen oder regulatorischen Gründen in einem bestimmten Land oder einer bestimmten Region abgelegt und verarbeitet werden. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=89s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 01:57 | Abschnittsanfang | Laut einem Microsoft-Blogartikel zum OneLake gibt es pro Tenant nur ein OneLake, das aber lediglich den zentralen Zugangspunkt darstellt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=117s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 02:31 | auf die Sekunde | Workspaces können in unterschiedlichen Regionen liegen, etwa manche im US-Bereich und andere in Europa, wobei die Daten jeweils in der Region gespeichert sind, in der der Workspace angelegt wurde. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=151s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 03:12 | auf die Sekunde | Die tatsächlichen Daten werden laut dem Microsoft-Blogartikel in der Region gespeichert, in der die zugeordnete Kapazität liegt, und nicht zwingend in der Region des Tenants. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=192s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 03:12 | auf die Sekunde | Ordnet man einen Arbeitsbereich einer Kapazität zu, werden die zugehörigen Daten im OneLake tatsächlich in der Region gespeichert, in der die Kapazität liegt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=192s) |
| Warnung | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 03:15 | auf die Sekunde | Verschiebt man einen Arbeitsbereich zwischen Kapazitäten in unterschiedlichen Regionen, müssen die zugrunde liegenden Daten tatsächlich in die neue Region überführt werden, es ist also kein reiner Wechsel der Rechenleistung. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=195s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 04:02 | auf die Sekunde | OneLake existiert pro Tenant nur einmal und beschreibt die Gesamtumgebung, während der tatsächliche Ablageort der Daten durch die Region der jeweils gehosteten Kapazität gesteuert wird. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=242s) |
| Fakt | Power BI Update März 2026 | 2026-03 | 06:54 | auf die Sekunde | Direct Lake auf OneLake ist jetzt allgemein verfügbar und damit der neue Standard für Direct Lake. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=414s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 01:58 | auf die Sekunde | Beim Open-Mirroring-Datenfluss wird der Datensatz mit Row-Marker-Event zunächst nach OneLake geschrieben, von wo Fabric eine identische Replik-Tabelle aufbaut. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=118s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 06:45 | Abschnittsanfang | Der Sync-Prozess schreibt die replizierten Daten in Paketdateien und lädt sie in Batches mit Wartezeit zwischen den Schritten nach Fabric hoch. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=405s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 05:22 | auf die Sekunde | Ein direktes Schreiben aus SSIS in den OneLake-Speicher ist aktuell nicht möglich, weil der mitgelieferte Connector diese Einstellung noch nicht unterstützt. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=322s) |
| Empfehlung | Why Passion Beats Niche | 2025-09 | 26:57 | auf die Sekunde | Brian Bønk empfiehlt, in einem Echtzeitsystem nur die für die Fachabteilung tatsächlich relevante Zeitspanne an Daten in der Echtzeitdatenbank vorzuhalten. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1617s) |
| Empfehlung | Why Passion Beats Niche | 2025-09 | 27:38 | auf die Sekunde | Für Echtzeitanalysen nicht mehr relevante ältere Daten können laut Brian Bønk nach OneLake ausgelagert und im Lakehouse als Basis für ein semantisches Modell genutzt werden. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1658s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 55:58 | Abschnittsanfang | Mirroring in Microsoft Fabric enthält kostenlosen Speicherplatz proportional zur gebuchten Kapazität, etwa 64 TB bei einer F64-Kapazität, inklusive der automatischen Transformation in Tabellenformat. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 55:58 | Abschnittsanfang | Beim Mirroring von Databricks-Daten werden nur die Metadaten gespiegelt, weil Fabric direkt auf denselben zugrunde liegenden Speicher wie OneLake oder ADLS Gen2 zugreift, den Databricks bereits nutzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 24:02 | auf die Sekunde | Ein selbstgeschriebenes Python-Skript exportiert SQL-Server-Tabellen als Delta-Parquet-Dateien direkt in den OneLake-Speicher, wo sie sofort als Tabelle über den SQL-Endpunkt verfügbar sind. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1442s) |
| Fakt | BI Thinkers Talk nr.64 | 2025-07 | 24:15 | auf die Sekunde | Die Fabric-Kapazität wird einer bestimmten Region zugeordnet, wodurch auch die zugehörigen OneLake-Daten an diese Region gekoppelt sind. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1455s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 26:14 | auf die Sekunde | Beim Push von Daten per Python-Skript in den OneLake werden im Gegensatz zum Zugriff über ein Data Gateway keine Fabric-CUs für das Abholen der Daten belastet. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1574s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 28:22 | auf die Sekunde | Die Authentifizierung des Python-Skripts gegenüber OneLake erfolgt über ein Service Principal mit Client ID und Client Secret in einer Konfigurationsdatei. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1702s) |
| Fakt | Daten-WG Deep Dive Financial Reporting | 2025-05 | 08:59 | auf die Sekunde | Die Erweiterung BC ADLS ermöglicht es, Business-Central-Tabellen aus der Cloud-Variante ähnlich wie bei einem Synapse Link direkt in ein Data Lake bzw. nach Fabric zu spiegeln. | [▶](https://www.youtube.com/watch?v=TYmKrreMO3I&t=539s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 09:29 | auf die Sekunde | Die neue Direct-Lake-Variante verbindet sich nicht mehr über den SQL-Endpoint des Lakehouses, sondern direkt mit den Delta-Tabellen im OneLake. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=569s) |
| Meinung | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 12:05 | auf die Sekunde | Echte Composite Models werden erst mit der angekündigten OneLake Security möglich, weil dann Berechtigungen aus verschiedenen Quellen mitgezogen werden können. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=725s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 18:44 | auf die Sekunde | OneLake Security soll als zentrale Policy Engine Spalten-, Row-Level- und dynamische Tabellenebenen-Sicherheit über Lakehouse, Warehouse und Power BI hinweg abdecken. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1124s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 33:44 | auf die Sekunde | Der OneLake-Katalog ist ausdrücklich nicht als Catalog-of-Catalogs gedacht, der Werkzeuge wie Purview oder Informatica ersetzen soll, sondern als zentraler Discovery-Einstiegspunkt für Fabric-Nutzer. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2024s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 22:53 | Abschnittsanfang | Nach dem letzten Kenntnisstand des Gasts funktioniert OneLake-Security nur auf Ordner-, nicht auf Tabellenebene. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1373s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 |  | 24:59 | auf die Sekunde | Fabric bietet jetzt bidirektionale Shortcut-Integrationen mit Snowflake und Databricks. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1499s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 26:04 | auf die Sekunde | Die OneLake Table API erlaubt den nativen Zugriff auf Delta- oder Iceberg-Tabellen und ermöglicht die bidirektionale Nutzung mit Snowflake. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1564s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 |  | 28:40 | auf die Sekunde | OneLake Security stellt dieselben Zugriffsinformationen sowohl nativen Fabric-Workloads als auch Third-Party-Workloads zur Verfügung. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1720s) |
| Warnung | Fabric & Power BI Quarterly · 2026-2 |  | 32:14 | auf die Sekunde | Komplexere Sicherheitsszenarien wie dynamische Row-Level Security und Dynamic Data Masking fehlen in OneLake Security noch und stehen auf der Roadmap. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1934s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=02%20%C2%B7%20Architektur%20%26%20%2Azentrale%20Komponenten%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Das%20%E2%80%9EOne%20Copy%22-Prinzip) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20drei%20Plattform-Schichten%20unter%20den%20Workloads) |
| [Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake?](https://www.youtube.com/watch?v=ZVVSPQj9dlc) | 2026-03-01 | kernaussagen+zeitstempel | [00:26](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=26s) |
| [Power BI Update Juli 2025](https://www.youtube.com/watch?v=TkxwcAyBGUM) | 2025-07-01 | nur-zeitstempel | [06:09](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=369s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [54:26](https://www.youtube.com/watch?v=G8s96sHUHac&t=3266s) · [55:58](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) · [57:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=3448s) |
| [Power BI Update August 2026](https://www.youtube.com/watch?v=GWCHNmLs72M) | 2026-08-01 | nur-zeitstempel | [05:57](https://www.youtube.com/watch?v=GWCHNmLs72M&t=357s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [08:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=508s) · [32:41](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1961s) |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [05:15](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=315s) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [01:10](https://www.youtube.com/watch?v=YzfcMurbWNc&t=70s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | kernaussagen+zeitstempel | [26:46](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1606s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Was%20Power-BI-Nutzer%20wissen%20m%C3%BCssen) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Fabric%20vs.%20klassisches%20Power%20BI) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Direct%20Lake%20%28Fabric%29) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [53:23](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=3203s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | kernaussagen+zeitstempel | [23:47](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1427s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [30:48](https://www.youtube.com/watch?v=iymmxuXHh44&t=1848s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [42:49](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2569s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Aonelake
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Aonelake&f=tool%3Aonelake
