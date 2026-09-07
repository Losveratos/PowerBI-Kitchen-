---
id: "tool:lakehouse"
name: "Lakehouse"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 39
kernaussagen: 45
mit_kernaussagen: 19
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/lakehouse.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/lakehouse.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/lakehouse.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/lakehouse.json"
aliase:
  - "Lake House"
---

# Lakehouse

In diesem Projekt wurden Views im Lakehouse ueber Notebooks per Create-and-Replace angelegt, damit sie sich ueber Deployment Pipelines mitversenden lassen und je Umgebung automatisch das passende Lakehouse zugewiesen wird. (Stand 2026-08) In diesem Kundenprojekt wurde die Bronze-Schicht bewusst als Lakehouse aufgebaut, ab Silber und Gold aber mit Warehouses gearbeitet, weil sich der Kunde mit Stored Procedures und Views sicherer fuehlt. (Stand 2026-08) Bei einem strikten Layering-Ansatz wird Self-Service-Nutzern meist nur per Shortcut Zugriff auf den Gold-Layer gewaehrt, waehrend Bronze und Silber den Data Engineers vorbehalten bleiben. (Stand 2026-08)

## Aliase

Lake House

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Deployment Pipelines](deployment-pipelines.md) | Lakehouse gegensatz Deployment Pipelines | automatisch extrahiert, Quellenstelle vorhanden | „der Analytic Endpunkt vom Lake House wird nicht die Objekte da drin werden nicht übertragen“ (Daten-WG Life-Update \| Fabric Architekturen, 2026-08) | 9 |
| [Warehouse](warehouse.md) | Warehouse ersetzt Lakehouse | automatisch extrahiert, Quellenstelle vorhanden | „wir müssen jetzt zu WHäusern... das neue Warehouse war halt leer, ist in wenigen Klicks angelegt“ (Microsoft Fabric — braucht das wirklich jemand?) | 71 |
| [Warehouse](warehouse.md) | Warehouse gegensatz Lakehouse | automatisch extrahiert, Quellenstelle vorhanden | „Beim Warehouse hat man nur append und kann das auch nicht zurück umstellen. Beim Lake House habe ich nur replaced“ (Daten-WG Deep Dive Financial Reporting - part 6, 2025-08) | 71 |
| [Warehouse](warehouse.md) | Warehouse setzt-voraus Lakehouse | automatisch extrahiert, Quellenstelle vorhanden | „mussten wir effektiv die Lake Houses replizieren, Shortcuts in diesen Lake Houses reinsetzen und dann vom Warehouse über fully qualified Links dieser Lakees anziehen“ (600 SQL-Tabellen in Fabric) | 71 |
| [Direct Lake](direct-lake.md) | Direct Lake setzt-voraus Lakehouse | automatisch extrahiert, Quellenstelle vorhanden | „der Kunde hat einfach ein Direct Lake Modell letztendlich ... hier quasi ein Modell, was nach dem Deployment immer noch auf dem Lake House im Test hängt“ (BI Thinkers Talk n.73, 2026-02) | 40 |
| [OneLake](onelake.md) | Lakehouse setzt-voraus OneLake | automatisch extrahiert, Quellenstelle vorhanden | „könnte ich sie in OneLake auslagern und in Lakehouse verwenden, um darauf aufbauend ein semantisches Modell zu erstellen“ (Why Passion Beats Niche, 2025-09) | 34 |
| [Microsoft Fabric](microsoft-fabric.md) | Lakehouse und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 91 |
| [Power BI](power-bi.md) | Lakehouse und Power BI im selben Segment | Heuristik, gezählt |  | 59 |
| [Notebook](notebook.md) | Lakehouse und Notebook im selben Segment | Heuristik, gezählt |  | 51 |
| [SQL](sql.md) | Lakehouse und SQL im selben Segment | Heuristik, gezählt |  | 49 |
| [Dataflow](dataflow.md) | Lakehouse und Dataflow im selben Segment | Heuristik, gezählt |  | 48 |
| [Workspace](workspace.md) | Lakehouse und Workspace im selben Segment | Heuristik, gezählt |  | 36 |
| [Delta Lake](delta-lake.md) | Lakehouse und Delta Lake im selben Segment | Heuristik, gezählt |  | 28 |
| [Data Pipeline](data-pipeline.md) | Lakehouse und Data Pipeline im selben Segment | Heuristik, gezählt |  | 27 |
| [Spark](spark.md) | Lakehouse und Spark im selben Segment | Heuristik, gezählt |  | 23 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 03:29 | auf die Sekunde | In diesem Projekt wurden Views im Lakehouse ueber Notebooks per Create-and-Replace angelegt, damit sie sich ueber Deployment Pipelines mitversenden lassen und je Umgebung automatisch das passende Lakehouse zugewiesen wird. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=209s) |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 06:59 | auf die Sekunde | In diesem Kundenprojekt wurde die Bronze-Schicht bewusst als Lakehouse aufgebaut, ab Silber und Gold aber mit Warehouses gearbeitet, weil sich der Kunde mit Stored Procedures und Views sicherer fuehlt. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=419s) |
| Warnung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 07:26 | auf die Sekunde | Beim Import von Navision-Daten muss die Zeitstempel-Datentyp-Korrektur bereits im Bronze-Layer erfolgen, weil reine Zeitwerte sonst zu Fehlern fuehren. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=446s) |
| Warnung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 13:44 | auf die Sekunde | Bei Fabric Deployment Pipelines werden Objekte des SQL-Analytics-Endpunkts eines Lakehouse wie Views nicht mit uebertragen, waehrend das beim Warehouse funktioniert. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=824s) |
| Meinung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 18:12 | auf die Sekunde | Nach dieser Auffassung braucht eine Medaillon-Architektur zwingend drei Schichten, weil Bronze allein dem Ablegen der Rohdaten dient. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1092s) |
| Empfehlung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 18:36 | auf die Sekunde | Der Gold-Layer muss nicht immer dieselbe Technologie sein, sondern sollte je nach Use Case und Empfaenger gewaehlt werden, etwa Lakehouse fuer ein Data-Analytics-Team oder Warehouse fuer Reporting. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1116s) |
| Fakt | Fabric Workload Demo mit Alexander Korn und Lukasz Obst | 2026-08 | 19:06 | auf die Sekunde | Aus einem unspezifischen Prompt hat der Agent Hub eigenstaendig ein Notebook, ein Lakehouse, ein Semantic Model und einen Report erstellt, inklusive eines selbst geschriebenen Fabric Clients fuer die Fabric-APIs. | [▶](https://www.youtube.com/watch?v=e50qKdVn-24&t=1146s) |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 19:42 | auf die Sekunde | Bei einem strikten Layering-Ansatz wird Self-Service-Nutzern meist nur per Shortcut Zugriff auf den Gold-Layer gewaehrt, waehrend Bronze und Silber den Data Engineers vorbehalten bleiben. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1182s) |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 21:16 | auf die Sekunde | Bei einem Self-Service-Lakehouse-Ansatz werden fertige Daten aus dem Gold-Layer per Shortcut bereitgestellt, damit Fachbereichs-Excel-Mappings nicht mehr zentral in Bronze verwaltet werden muessen. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1276s) |
| Fakt | GxP Talk - KI im regulierten Umfeld? | 2026-05 | 24:25 | auf die Sekunde | Laut Christoph betreiben mittlerweile die meisten großen Pharmakonzerne hybride Cloud-Umgebungen mit mehreren Anbietern und bauen darin Lakehouses für die Datenaufbereitung auf. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=1465s) |
| Fakt | Fabric Planning unboxing | 2026-03 | 34:04 | Abschnittsanfang | Als Datenquelle für Planning-Objekte ist aktuell nur eine SQL-Datenbank wählbar, während Inforiver zusätzlich Lakehouse und Warehouse unterstützte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2044s) |
| Fakt | BI Thinkers Talk n.74 | 2026-03 | 1:13:05 | Abschnittsanfang | Beim Versuch, verschachtelte Power-Query-Objekte wie Record oder List aus einem Notebook heraus in ein Lakehouse zu schreiben, werden diese aktuell nur als Text gespeichert statt strukturiert aufgelöst. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=4385s) |
| Fakt | BI Thinkers Talk n.73 | 2026-02 | 35:44 | Abschnittsanfang | Bei einem Direct-Lake-Modell bleibt das Semantic Model nach einem Deployment über eine Deployment Pipeline weiterhin mit dem Lakehouse der Testumgebung verbunden, die Datenquelle wird also nicht automatisch auf die Zielumgebung umgehängt. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2144s) |
| Meinung | BI Thinkers Talk n.73 | 2026-02 | 40:08 | auf die Sekunde | Einer der Sprecher hält doppelte Datenhaltung in einem zweiten Lakehouse für unnötig, wenn ohnehin schon ein Direct-Lake-Modell mit großen Datenmengen im Einsatz ist. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2408s) |
| Warnung | BI Thinkers Talk n.73 | 2026-02 | 54:58 | auf die Sekunde | Beim Deployment eines Lakehouse über eine Deployment Pipeline werden Views, die im SQL-Endpunkt des Lakehouse angelegt wurden, nicht mit übertragen. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3298s) |
| Empfehlung | BI Thinkers Talk n.73 | 2026-02 | 54:58 | auf die Sekunde | Als Workaround definiert einer der Sprecher View-Definitionen stattdessen in TSQL-Notebooks, damit sie über die Deployment Pipeline mit transportiert werden. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3298s) |
| Fakt | BI Thinkers Talk n.72 | 2026-01 | 36:37 | auf die Sekunde | Seit kurzem lassen sich Notebooks in Fabric über eine Connection mit einem Service Principal ausführen, wodurch Secrets nicht mehr hartcodiert oder in einer JSON-Datei im Lakehouse abgelegt werden müssen. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2197s) |
| Fakt | BI Thinkers Talk n.72 | 2026-01 | 54:25 | auf die Sekunde | Deployment Pipelines unterstützen Dataflows, Lakehouses und Direct Lake nicht zuverlässig, sodass danach oft manuell mit VS Code nachgearbeitet werden muss. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3265s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 01:20 | auf die Sekunde | In der Zielarchitektur schreiben die Integration Services die Daten aus der On-Premises-Umgebung zunächst in ein Azure Storage, von wo sie ins Warehouse oder Lakehouse geladen werden können. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=80s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 08:49 | auf die Sekunde | Über einen Shortcut im Fabric-Lakehouse lässt sich der Azure Data Lake Storage Gen2 einbinden, sodass die per SSIS abgelegten Paketdateien im Lakehouse sichtbar und in der Vorschau prüfbar werden. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=529s) |
| Empfehlung | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 10:09 | Abschnittsanfang | Die im Lakehouse als Rohdaten liegenden Dateien lassen sich per COPY-INTO-Befehl in eine Warehouse-Tabelle laden oder mit einem Notebook, etwa in Python, weiterverarbeiten. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=609s) |
| Fakt | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 2025-11 | 07:44 | auf die Sekunde | Die Medaillon-Architektur mit Bronze-, Silber- und Gold-Schichten entspricht inhaltlich einem klassischen Aufbau aus Staging, Core und Datamarts. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=464s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 20:36 | auf die Sekunde | Weil eine zu restriktive Firewall-Security den SQL-Zugriff auf Lakehouse-Tabellen blockierte, baute der Kunde stattdessen ein semantisches Direct-Lake-Modell direkt im Web auf. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1236s) |
| Fakt | Why Passion Beats Niche | 2025-09 | 26:10 | auf die Sekunde | Die Verarbeitung pro Gigabyte ist in der Custom-Datenbank laut Brian Bønk etwas teurer als bei Lakehouse und Warehouse in Microsoft Fabric. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1570s) |
| Empfehlung | Why Passion Beats Niche | 2025-09 | 27:38 | auf die Sekunde | Für Echtzeitanalysen nicht mehr relevante ältere Daten können laut Brian Bønk nach OneLake ausgelagert und im Lakehouse als Basis für ein semantisches Modell genutzt werden. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1658s) |
| Fakt | Why Passion Beats Niche | 2025-09 | 29:29 | auf die Sekunde | In einem Hybrid-Setup in Fabric lassen sich laut Brian Bønk nach OneLake ausgelagerte Daten per Verknüpfung weiterhin zusammen mit nahezu in Echtzeit verfügbaren Live-Daten abfragen. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1769s) |
| Warnung | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 35:36 | auf die Sekunde | Im Warehouse ist beim Dataflow-Ziel nur der Modus Append wählbar und nicht mehr umkehrbar, während im Lakehouse nur Replace zur Verfügung steht. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2136s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 06:00 | auf die Sekunde | Um aus einem Shortcut wirklich eine nutzbare Tabelle zu machen, muss man weiterhin ein Notebook oder einen Dataflow orchestrieren, da der Shortcut selbst nicht so echtzeitfähig ist, wie er sein könnte. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=360s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 1:04:43 | auf die Sekunde | Bei Dataflow Gen1 lag die komplette Speicherschicht in der Hand des Dataflows selbst, während man bei Gen2 sein eigenes Ziel wie Warehouse oder Lakehouse selbst verwalten muss. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3883s) |
| Empfehlung | BI Thinkers Talk Nr.62 | 2025-05 | 16:35 | auf die Sekunde | Für das Zurückschreiben aus Power BI wird eine SQL-Datenbank in Fabric statt eines Lakehouse verwendet. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=995s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 09:29 | auf die Sekunde | Die neue Direct-Lake-Variante verbindet sich nicht mehr über den SQL-Endpoint des Lakehouses, sondern direkt mit den Delta-Tabellen im OneLake. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=569s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 18:44 | auf die Sekunde | OneLake Security soll als zentrale Policy Engine Spalten-, Row-Level- und dynamische Tabellenebenen-Sicherheit über Lakehouse, Warehouse und Power BI hinweg abdecken. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1124s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 21:47 | auf die Sekunde | User Data Functions ermöglichen es, Business Logic zu implementieren und zu kapseln und sie anschließend in einem Lakehouse, einer Data Pipeline und einem Warehouse wiederzuverwenden. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1307s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? |  | 11:19 | auf die Sekunde | Ein zentrales, datenhaltendes Objekt wie ein Lakehouse macht Power-BI-Modelle laut Artur deutlich stabiler und beschleunigt Aktualisierungen von zwei Stunden auf zwei Minuten. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=679s) |
| Empfehlung | Microsoft Fabric — braucht das wirklich jemand? |  | 12:02 | auf die Sekunde | Der erste Quickwin beim Umstieg auf Fabric ist laut Artur, Daten überhaupt persistent abzulegen, statt sie bei jeder Aktualisierung neu zu laden. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=722s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 18:25 | auf die Sekunde | Die Incremental-Refresh-Option für Materialized Lake Views war eines der meistgefragten Kundenfeedbacks und wurde entsprechend veröffentlicht. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1105s) |
| Warnung | Microsoft Fabric — braucht das wirklich jemand? |  | 19:51 | auf die Sekunde | Werden zwei Dataflows über ein Lakehouse verkettet, stehen am Folgetag keine neuen Daten bereit, weil der SQL-Endpoint des Lakehouse nicht sofort aktualisiert wird. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1191s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 20:33 | auf die Sekunde | Da ein Warehouse keine eigenen Shortcuts anlegen kann, mussten im Projekt Lake Houses repliziert werden, um darüber per Shortcut auf Bronze- und Gold-Layer zuzugreifen. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1233s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? |  | 22:38 | auf die Sekunde | Der Wechsel von einem Lakehouse zu einem Warehouse lässt sich in der Praxis in wenigen Minuten umsetzen, da ein neues Warehouse leer und schnell angelegt ist. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1358s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? |  | 22:41 | auf die Sekunde | Ein Lakehouse wird beim Deployment in einen neuen Workspace leer angelegt, ohne die enthaltenen Daten mitzukopieren. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1361s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 22:53 | Abschnittsanfang | Nach dem letzten Kenntnisstand des Gasts funktioniert OneLake-Security nur auf Ordner-, nicht auf Tabellenebene. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1373s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? |  | 25:06 | Abschnittsanfang | Shortcuts gelten laut Martin als das Killer-Feature des Lakehouse. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1506s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 34:48 | auf die Sekunde | Tabellen aus einem Lakehouse oder Warehouse lassen sich jetzt direkt in Excel einbinden, aehnlich wie vorher ueber Power BI. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2088s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 39:13 | auf die Sekunde | Composite Models sollen kuenftig die Moeglichkeit bieten, Direct-Lake-Tabellen aus mehreren Lakehouses zu kombinieren, ohne mehr zwingend ueber den einen zentralen SQL-Endpunkt konsumieren zu muessen. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2353s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 42:25 | auf die Sekunde | Mit der Shortcut-Transformation wird eine per Shortcut verlinkte CSV-Datei automatisch in eine Delta-Tabelle umgewandelt, ohne dass dafuer ein Notebook laufen muss. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2545s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [09:42](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=582s) · [27:09](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1629s) · [32:03](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1923s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Wie%20die%20Komponenten%20die%20Schichten%20bedienen) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Typische%20Nutzung) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20das%20Warehouse%20exklusiv%20kann) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [02:11](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=131s) · [12:15](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=735s) · [17:21](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1041s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | kernaussagen+zeitstempel | [19:55](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1195s) · [21:17](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1277s) · [22:53](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1373s) |
| [Microsoft Fabric Shortcut Transformation erklärt: Updates im Praxistest](https://www.youtube.com/watch?v=Z6RZjkn_6lY) | 2026-07-01 | nur-zeitstempel | [00:28](https://www.youtube.com/watch?v=Z6RZjkn_6lY&t=28s) · [03:04](https://www.youtube.com/watch?v=Z6RZjkn_6lY&t=184s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [07:26](https://www.youtube.com/watch?v=mTVeZzshLzE&t=446s) · [23:00](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1380s) · [25:06](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1506s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [08:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=508s) · [10:33](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=633s) · [15:50](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=950s) |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [01:15](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=75s) · [08:20](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=500s) · [09:45](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=585s) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [02:40](https://www.youtube.com/watch?v=YzfcMurbWNc&t=160s) · [25:00](https://www.youtube.com/watch?v=YzfcMurbWNc&t=1500s) · [28:09](https://www.youtube.com/watch?v=YzfcMurbWNc&t=1689s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [35:44](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2144s) · [37:17](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2237s) · [38:59](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2339s) |
| [Power BI Update August 2026](https://www.youtube.com/watch?v=GWCHNmLs72M) | 2026-08-01 | nur-zeitstempel | [05:57](https://www.youtube.com/watch?v=GWCHNmLs72M&t=357s) · [06:57](https://www.youtube.com/watch?v=GWCHNmLs72M&t=417s) |
| [SharePoint direkt in Microsoft Fabric nutzen \| Lakehouse, Direct Lake & Power BI](https://www.youtube.com/watch?v=c-LWoo-O5PQ) | 2026-07-01 | nur-zeitstempel | [08:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=500s) · [16:12](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=972s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | kernaussagen+zeitstempel | [13:57](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=837s) · [29:00](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1740s) · [49:49](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=2989s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [01:38](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=98s) · [06:24](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=384s) · [11:34](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=694s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | kernaussagen+zeitstempel | [32:02](https://www.youtube.com/watch?v=lZvpCBMKASM&t=1922s) · [33:41](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2021s) · [35:19](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2119s) |
| [Microsoft Fabric Dataflow Gen2 Kosten verstehen - CU-Verbrauch einfach erklärt](https://www.youtube.com/watch?v=z51gWRc0zVc) | 2026-07-01 | nur-zeitstempel | [01:34](https://www.youtube.com/watch?v=z51gWRc0zVc&t=94s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [06:31](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=391s) · [24:40](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1480s) · [1:00:37](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3637s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | kernaussagen+zeitstempel | [25:05](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1505s) · [26:46](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1606s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [17:41](https://www.youtube.com/watch?v=iymmxuXHh44&t=1061s) · [54:13](https://www.youtube.com/watch?v=iymmxuXHh44&t=3253s) · [57:38](https://www.youtube.com/watch?v=iymmxuXHh44&t=3458s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [11:21](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=681s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [19:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=1168s) · [32:47](https://www.youtube.com/watch?v=G8s96sHUHac&t=1967s) · [41:02](https://www.youtube.com/watch?v=G8s96sHUHac&t=2462s) |
| [Fabric Workload Demo mit Alexander Korn und Lukasz Obst](https://www.youtube.com/watch?v=e50qKdVn-24) | 2026-08-01 | kernaussagen+zeitstempel | [18:59](https://www.youtube.com/watch?v=e50qKdVn-24&t=1139s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [20:19](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1219s) · [28:51](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1731s) · [34:04](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2044s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [37:07](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2227s) · [53:54](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3234s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | kernaussagen+zeitstempel | [53:48](https://www.youtube.com/watch?v=DQENmzAkNqw&t=3228s) · [55:34](https://www.youtube.com/watch?v=DQENmzAkNqw&t=3334s) |
| [BI Thinkers Talk nr.75](https://www.youtube.com/watch?v=BQdSo6ZnmKY) | 2026-04-01 | kernaussagen+zeitstempel | [44:31](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2671s) · [47:52](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2872s) |
| [BI Thinkers Talk nr.77](https://www.youtube.com/watch?v=eWfTt93anl4) | — | nur-zeitstempel | [53:05](https://www.youtube.com/watch?v=eWfTt93anl4&t=3185s) · [1:01:32](https://www.youtube.com/watch?v=eWfTt93anl4&t=3692s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | kernaussagen+zeitstempel | [34:32](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2072s) · [36:04](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2164s) |
| [Mythos Data Vault und richtig große Modelle](https://www.youtube.com/watch?v=rrCi0lnGrCg) | 2025-07-01 | kernaussagen+zeitstempel | [15:21](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=921s) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [58:58](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=3538s) · [1:11:30](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=4290s) |
| [Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup](https://www.youtube.com/watch?v=BDnwlOqRElY) | 2025-06-01 | kernaussagen+zeitstempel | [20:57](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1257s) |
| [GxP Talk - KI im regulierten Umfeld?](https://www.youtube.com/watch?v=XtH4JqTwaqM) | 2026-05-01 | kernaussagen+zeitstempel | [23:24](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=1404s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [28:14](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1694s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | kernaussagen+zeitstempel | [50:39](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3039s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [24:38](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1478s) |
| [Daten-WG Special: Power BI vs. Qlik -part2](https://www.youtube.com/watch?v=_Vh5fDfHWz4) | 2025-10-01 | nur-zeitstempel | [1:05:36](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=3936s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Fabric%20vs.%20klassisches%20Power%20BI) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Was%20ist%20f%C3%BCr%20Power-BI-Nutzer%20relevant%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Soll%20man%20von%20Power%20BI%20Premium%20auf%20Fabric%20umstellen%3F) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [12:58](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=778s) |
| [Excel mit Microsoft Fabric Shortcut Transformation nutzen (inkl. Schema-Mismatch erklärt)](https://www.youtube.com/watch?v=lp8xNX81R2w) | 2026-07-01 | nur-metadaten | — |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Alakehouse
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Alakehouse&f=tool%3Alakehouse
