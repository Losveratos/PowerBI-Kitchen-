---
id: "tool:notebook"
name: "Notebook"
typ: tool
stand: "2026-09-07"
build: "20260907-1056"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 43
kernaussagen: 24
mit_kernaussagen: 9
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/notebook.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/notebook.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/notebook.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/notebook.json"
aliase:
  - "Notebooks"
  - "Spark Notebook"
---

# Notebook

Aus einem Integration-Services-Paket (SSIS) lässt sich per REST API ein Microsoft-Fabric-Notebook starten. Im SSIS-Paket wird der Notebook-Aufruf über eine Script Task in Visual Studio umgesetzt. Nach dem Ausführen des SSIS-Pakets lässt sich der erfolgreiche Notebook-Lauf in Fabric über die letzte Ausführung nachvollziehen.

## Aliase

Notebooks, Spark Notebook

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Workspace](workspace.md) | teil-von | belegt | 32 |
| [Tabular Editor](tabular-editor.md) | ersetzt | belegt | 0 |
| [Direct Lake](direct-lake.md) | setzt-voraus | belegt | 18 |
| [Dataflow](dataflow.md) | empfiehlt | belegt | 54 |
| [SQL Endpoint](sql-endpoint.md) | ersetzt | belegt | 4 |
| [Data Pipeline](data-pipeline.md) | setzt-voraus | belegt | 33 |
| [Dataflow](dataflow.md) | gegensatz | belegt | 54 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 70 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 51 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 42 |
| [KI](ki.md) | ko-vorkommen | heuristik | 28 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 26 |
| [Spark](spark.md) | ko-vorkommen | heuristik | 24 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 23 |
| [Python](python.md) | ko-vorkommen | heuristik | 21 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk nr.75 | 03:08 | Alex hat den "Power BI Fixer" entwickelt, ein Notebook-basiertes Tool zum Analysieren und Reparieren von Power-BI-Semantikmodellen und -Berichten. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=188s) |
| Fakt | BI Thinkers Talk nr.75 | 06:19 | Notebooks in Microsoft Fabric können vollständige interaktive Oberflächen inklusive HTML-Seiten darstellen. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=379s) |
| Fakt | BI Thinkers Talk nr.75 | 07:51 | Der Power BI Fixer bietet im Notebook eine alternative Oberfläche ähnlich Tabular Editor, um Measures und DAX-Ausdrücke direkt am Semantic Model zu bearbeiten und zu formatieren. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=471s) |
| Empfehlung | BI Thinkers Talk nr.75 | 42:55 | Der Power BI Fixer kann automatisch ein geplantes Notebook anlegen, das die Direct-Lake-Perspektive täglich zu einer festen Uhrzeit aktualisiert, um den Cache vorzuwärmen. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2575s) |
| Fakt | Fabric Planning unboxing | 03:06 | Eine KI hat aus einer hochgeladenen CSV-Datei automatisch ein Sternschema samt Notebook erstellt. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=186s) |
| Fakt | BI Thinkers Talk n.74 | 37:26 | Aus einem Fabric-Notebook lässt sich per API ein Dataflow ansteuern und darüber Power-Query-Code (M-Code) ausführen. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2246s) |
| Empfehlung | BI Thinkers Talk n.74 | 41:00 | Ein Dataflow lässt sich als Wrapper nutzen, um über dessen Connections APIs wie die Power BI Scanner API anzusprechen, ohne im Notebook einen Service Principal hinterlegen zu müssen. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2460s) |
| Empfehlung | BI Thinkers Talk n.74 | 41:00 | Für kleinere Datenmengen und einfache Transformationen wie Entpivotieren eignet sich ein Dataflow, während stark verschachteltes JSON, etwa aus der Scanner API, eher in einem Notebook verarbeitet werden sollte. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2460s) |
| Fakt | BI Thinkers Talk n.74 | 1:13:05 | Beim Versuch, verschachtelte Power-Query-Objekte wie Record oder List aus einem Notebook heraus in ein Lakehouse zu schreiben, werden diese aktuell nur als Text gespeichert statt strukturiert aufgelöst. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=4385s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 00:01 | Aus einem Integration-Services-Paket (SSIS) lässt sich per REST API ein Microsoft-Fabric-Notebook starten. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=1s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 00:30 | Im SSIS-Paket wird der Notebook-Aufruf über eine Script Task in Visual Studio umgesetzt. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=30s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 01:23 | Nach dem Ausführen des SSIS-Pakets lässt sich der erfolgreiche Notebook-Lauf in Fabric über die letzte Ausführung nachvollziehen. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=83s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 02:32 | Um das Notebook über die REST API anzusprechen, werden die Workspace-ID und die Notebook-ID benötigt. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=152s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 03:52 | Die Paketvariablen im SSIS-Paket speichern Workspace-ID und Notebook-ID für den REST-API-Aufruf. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=232s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 05:39 | Mit dem Access Token ruft das Skript die Fabric REST API auf und startet das Notebook anhand von Workspace-ID und Notebook-ID. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=339s) |
| Empfehlung | BI Thinkers Talk n.73 | 50:24 | Als Alternative zum manuellen Umbinden über Power BI Desktop wird im Gespräch erwähnt, dass sich Reports auch automatisiert per Notebook mit Semantic Link umbinden lassen könnten. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3024s) |
| Empfehlung | BI Thinkers Talk n.73 | 55:34 | Als Workaround definiert der Sprecher View-Definitionen stattdessen in TSQL-Notebooks, damit sie über die Deployment Pipeline mit transportiert werden. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3334s) |
| Fakt | BI Thinkers Talk n.72 | 37:07 | Seit kurzem lassen sich Notebooks in Fabric über eine Connection mit einem Service Principal ausführen, wodurch Secrets nicht mehr hartcodiert oder in einer JSON-Datei im Lakehouse abgelegt werden müssen. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2227s) |
| Fakt | BI Thinkers Talk n.72 | 37:07 | Eine Connection für Notebooks lässt sich aktuell nicht direkt unter Connections anlegen, sondern nur über den Umweg einer Data Pipeline. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2227s) |
| Fakt | BI Thinkers Talk n.72 | 40:35 | Beim Ausführen eines Notebooks über die Pipeline mit einem Service Principal wurden deutlich weniger Workspaces zurückgegeben, weil der Service Principal nicht Mitglied in allen Workspaces ist. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2435s) |
| Fakt | BI Thinkers Talk n.72 | 50:30 | SharePoint-Listen lassen sich derzeit nicht direkt aus einem Notebook heraus anbinden, weshalb stattdessen Mirroring oder ein Umweg über Power Automate nötig ist. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3030s) |
| Empfehlung | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 10:09 | Die im Lakehouse als Rohdaten liegenden Dateien lassen sich per COPY-INTO-Befehl in eine Warehouse-Tabelle laden oder mit einem Notebook, etwa in Python, weiterverarbeiten. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=609s) |
| Fakt | Was ist Self-Service und warum ist das so schwer? | 17:22 | Tom Martens investiert bewusst begrenzte Lernzeit in DAX, Power Query, Python und Fabric-Notebooks, weil ihm das langfristig mehr Zeit und bessere Analysen ermöglicht. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1042s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 | 23:03 | Copy Jobs in der Fabric Data Factory unterstützen jetzt in der Vorschau automatisch Slowly Changing Dimension Typ 2, wodurch manueller Notebook-Code für diesen Zweck überflüssig wird. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1383s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [SSIS Integration Services: Microsoft Fabric Notebook per REST API starten](https://www.youtube.com/watch?v=NvtZ-ehiTrg) | 2026-02-01 | kernaussagen+zeitstempel | [02:19](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=139s) · [05:39](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=339s) · [06:11](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=371s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | nur-zeitstempel | [01:48](https://www.youtube.com/watch?v=DQENmzAkNqw&t=108s) · [03:25](https://www.youtube.com/watch?v=DQENmzAkNqw&t=205s) · [04:56](https://www.youtube.com/watch?v=DQENmzAkNqw&t=296s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [37:07](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2227s) · [38:43](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2323s) · [43:49](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2629s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [16:07](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=967s) · [17:44](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1064s) · [25:34](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1534s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [01:38](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=98s) · [03:11](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=191s) · [23:12](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=1392s) |
| [Power BI Update April 2025](https://www.youtube.com/watch?v=lT-C7fPzxj4) | 2025-04-01 | nur-zeitstempel | [03:08](https://www.youtube.com/watch?v=lT-C7fPzxj4&t=188s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [08:01](https://www.youtube.com/watch?v=iymmxuXHh44&t=481s) · [17:41](https://www.youtube.com/watch?v=iymmxuXHh44&t=1061s) · [27:36](https://www.youtube.com/watch?v=iymmxuXHh44&t=1656s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Wer%20geht%20wo%20auf%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Typische%20Nutzung) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=NotebookUtils%20%E2%80%94%20der%20Werkzeugkasten) |
| [BI Thinkers Talk nr.75](https://www.youtube.com/watch?v=BQdSo6ZnmKY) | 2026-04-01 | kernaussagen+zeitstempel | [04:40](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=280s) · [06:19](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=379s) · [42:55](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2575s) |
| [Fabric Workload Demo mit Alexander Korn und Lukasz Obst](https://www.youtube.com/watch?v=e50qKdVn-24) | 2026-08-01 | nur-zeitstempel | [13:04](https://www.youtube.com/watch?v=e50qKdVn-24&t=784s) · [18:59](https://www.youtube.com/watch?v=e50qKdVn-24&t=1139s) · [24:39](https://www.youtube.com/watch?v=e50qKdVn-24&t=1479s) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [39:06](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2346s) · [41:00](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2460s) · [1:16:34](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=4594s) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [13:41](https://www.youtube.com/watch?v=YzfcMurbWNc&t=821s) · [28:09](https://www.youtube.com/watch?v=YzfcMurbWNc&t=1689s) · [29:52](https://www.youtube.com/watch?v=YzfcMurbWNc&t=1792s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [00:34](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=34s) · [02:11](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=131s) · [10:46](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=646s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [32:47](https://www.youtube.com/watch?v=G8s96sHUHac&t=1967s) · [34:48](https://www.youtube.com/watch?v=G8s96sHUHac&t=2088s) · [42:46](https://www.youtube.com/watch?v=G8s96sHUHac&t=2566s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [21:24](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1284s) · [23:00](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1380s) · [25:06](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1506s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [14:22](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=862s) · [35:32](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2132s) · [46:54](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2814s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [28:14](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1694s) · [30:01](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1801s) · [49:12](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=2952s) |
| [Daten-WG Deep Dive Financial Reporting - part 7](https://www.youtube.com/watch?v=232JhS9vbQ0) | 2025-09-01 | nur-zeitstempel | [20:17](https://www.youtube.com/watch?v=232JhS9vbQ0&t=1217s) · [23:26](https://www.youtube.com/watch?v=232JhS9vbQ0&t=1406s) · [25:30](https://www.youtube.com/watch?v=232JhS9vbQ0&t=1530s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | nur-zeitstempel | [35:49](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2149s) · [37:24](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2244s) · [49:02](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2942s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [17:15](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1035s) · [30:41](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1841s) · [32:17](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1937s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | nur-zeitstempel | [06:51](https://www.youtube.com/watch?v=bt81POE-9Ig&t=411s) · [08:28](https://www.youtube.com/watch?v=bt81POE-9Ig&t=508s) · [18:15](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1095s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [42:02](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2522s) · [43:39](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2619s) · [55:18](https://www.youtube.com/watch?v=lZvpCBMKASM&t=3318s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [13:37](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=817s) · [21:17](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1277s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [50:24](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3024s) · [55:34](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3334s) · [57:27](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3447s) |
| [Realtalk zu Self Service mit Power BI](https://www.youtube.com/watch?v=27rC2zefFOU) | 2024-02-01 | nur-zeitstempel | [20:05](https://www.youtube.com/watch?v=27rC2zefFOU&t=1205s) |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [10:09](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=609s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [03:06](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=186s) · [04:42](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=282s) · [20:19](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1219s) |
| [Daten-WG 2026 Lineup](https://www.youtube.com/watch?v=AX7b8_aNekw) | 2026-05-01 | nur-zeitstempel | [02:51](https://www.youtube.com/watch?v=AX7b8_aNekw&t=171s) · [17:05](https://www.youtube.com/watch?v=AX7b8_aNekw&t=1025s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [04:49](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=289s) · [06:31](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=391s) |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) · [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [22:07](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1327s) |
| [Prinzipien oder Paragrafen](https://www.youtube.com/watch?v=6WhWLcuFvZE) | 2026-02-01 | kernaussagen+zeitstempel | [14:37](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=877s) |
| [KI hat mich abgelöst \| Daten-WG Podcast mit Burkhardt Gasber](https://www.youtube.com/watch?v=oh-3_65IQ2Q) | 2026-08-01 | nur-zeitstempel | [37:12](https://www.youtube.com/watch?v=oh-3_65IQ2Q&t=2232s) |
| [Daten-WG Life-Update \| State of Power BI, Fabric & AI-Tools](https://www.youtube.com/watch?v=d3HdhRe_nK8) | 2026-06-01 | nur-zeitstempel | [00:44](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=44s) |
| [Was ist Self-Service und warum ist das so schwer?](https://www.youtube.com/watch?v=EVsJ6zyGUWc) | — | kernaussagen+zeitstempel | [17:22](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1042s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [21:26](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1286s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | nur-zeitstempel | [14:03](https://www.youtube.com/watch?v=4VVNDNusq4U&t=843s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [56:24](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3384s) |
| [Daten-WG Special: Power BI vs. Qlik -part2](https://www.youtube.com/watch?v=_Vh5fDfHWz4) | 2025-10-01 | nur-zeitstempel | [05:18](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=318s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [39:36](https://www.youtube.com/watch?v=r416vanitYw&t=2376s) |

40 von 43 angezeigt, vollständige Liste in der JSON-Datei (https://datenwgknowledgekitchen.com/wissensgraph/library/notebook.json).

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Anotebook
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Anotebook&f=tool%3Anotebook
