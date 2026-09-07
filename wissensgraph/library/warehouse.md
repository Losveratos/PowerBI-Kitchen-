---
id: "tool:warehouse"
name: "Warehouse"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 42
kernaussagen: 33
mit_kernaussagen: 15
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/warehouse.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/warehouse.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/warehouse.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/warehouse.json"
aliase:
  - "Data Warehouse"
  - "DWH"
  - "Datawarehouse"
  - "Data Warehousing"
---

# Warehouse

Volker Nürnberg arbeitet seit 2005 ausschließlich mit Data Warehouses und kam in den frühen 2010er-Jahren zu Data Vault. (Stand 2025-07) Das neu gebaute Warehouse hatte am Ende über 150 SQL-Tabellen im Gold-Layer. Da ein Warehouse keine eigenen Shortcuts anlegen kann, mussten im Projekt Lake Houses repliziert werden, um darüber per Shortcut auf Bronze- und Gold-Layer zuzugreifen.

## Aliase

Data Warehouse, DWH, Datawarehouse, Data Warehousing

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Translytical Task Flows](translytical-task-flows.md) | Translytical Task Flows setzt-voraus Warehouse | automatisch extrahiert, Quellenstelle vorhanden | „Wobei ich schreib z.B. in Warehouse, weil das G ist“ (Fabric & Power BI Quarterly · 2025 Q4) | 0 |
| [Lakehouse](lakehouse.md) | Warehouse ersetzt Lakehouse | automatisch extrahiert, Quellenstelle vorhanden | „wir müssen jetzt zu WHäusern... das neue Warehouse war halt leer, ist in wenigen Klicks angelegt“ (Microsoft Fabric — braucht das wirklich jemand?) | 71 |
| [Lakehouse](lakehouse.md) | Warehouse gegensatz Lakehouse | automatisch extrahiert, Quellenstelle vorhanden | „Beim Warehouse hat man nur append und kann das auch nicht zurück umstellen. Beim Lake House habe ich nur replaced“ (Daten-WG Deep Dive Financial Reporting - part 6, 2025-08) | 71 |
| [Lakehouse](lakehouse.md) | Warehouse setzt-voraus Lakehouse | automatisch extrahiert, Quellenstelle vorhanden | „mussten wir effektiv die Lake Houses replizieren, Shortcuts in diesen Lake Houses reinsetzen und dann vom Warehouse über fully qualified Links dieser Lakees anziehen“ (600 SQL-Tabellen in Fabric) | 71 |
| [Data Vault](data-vault.md) | Data Vault teil-von Warehouse | automatisch extrahiert, Quellenstelle vorhanden | „Data Volt ist das Data Warehouse, wo wirklich Warehousing und Delivery komplett werden“ (Mythos Data Vault und richtig große Modelle, 2025-07) | 4 |
| [Microsoft Fabric](microsoft-fabric.md) | Warehouse und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 76 |
| [Power BI](power-bi.md) | Warehouse und Power BI im selben Segment | Heuristik, gezählt |  | 59 |
| [SQL](sql.md) | Warehouse und SQL im selben Segment | Heuristik, gezählt |  | 46 |
| [Dataflow](dataflow.md) | Warehouse und Dataflow im selben Segment | Heuristik, gezählt |  | 30 |
| [Reporting](reporting.md) | Warehouse und Reporting im selben Segment | Heuristik, gezählt |  | 29 |
| [Notebook](notebook.md) | Warehouse und Notebook im selben Segment | Heuristik, gezählt |  | 26 |
| [OneLake](onelake.md) | Warehouse und OneLake im selben Segment | Heuristik, gezählt |  | 25 |
| [Direct Lake](direct-lake.md) | Warehouse und Direct Lake im selben Segment | Heuristik, gezählt |  | 24 |
| [Data Pipeline](data-pipeline.md) | Warehouse und Data Pipeline im selben Segment | Heuristik, gezählt |  | 23 |
| [Performance](performance.md) | Warehouse und Performance im selben Segment | Heuristik, gezählt |  | 20 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 06:59 | auf die Sekunde | In diesem Kundenprojekt wurde die Bronze-Schicht bewusst als Lakehouse aufgebaut, ab Silber und Gold aber mit Warehouses gearbeitet, weil sich der Kunde mit Stored Procedures und Views sicherer fuehlt. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=419s) |
| Meinung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 11:57 | auf die Sekunde | Bei einem Warehouse sind viele Optimierungen, die man sonst in Notebooks oder im Lake selbst umsetzen muesste, bereits managed abgenommen, was weniger Freiheit, aber auch weniger Risiko fuer die Kapazitaet bedeutet. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=717s) |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 12:40 | auf die Sekunde | Bei einem groesseren SAP-Konzernprojekt wurden Bronze und Silber als Warehouse aufgebaut, weil das Pipeline-Feature zum Refresh der SQL-Endpunkt-Metadaten damals noch nicht existierte. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=760s) |
| Warnung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 13:44 | auf die Sekunde | Bei Fabric Deployment Pipelines werden Objekte des SQL-Analytics-Endpunkts eines Lakehouse wie Views nicht mit uebertragen, waehrend das beim Warehouse funktioniert. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=824s) |
| Meinung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 18:12 | auf die Sekunde | Nach dieser Auffassung braucht eine Medaillon-Architektur zwingend drei Schichten, weil Bronze allein dem Ablegen der Rohdaten dient. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1092s) |
| Empfehlung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 18:36 | auf die Sekunde | Der Gold-Layer muss nicht immer dieselbe Technologie sein, sondern sollte je nach Use Case und Empfaenger gewaehlt werden, etwa Lakehouse fuer ein Data-Analytics-Team oder Warehouse fuer Reporting. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1116s) |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 2026-05 | 03:23 | auf die Sekunde | Bill Inmons Buch von 1993 gilt als Auslöser der Data-Warehouse-Diskussion. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=203s) |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 2026-05 | 07:19 | auf die Sekunde | Ralph Kimball veröffentlichte Mitte der 1990er-Jahre ein Buch, in dem er forderte, Data Warehouses stets mit einem Sternschema beziehungsweise dimensionaler Modellierung aufzubauen. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=439s) |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 2026-05 | 07:33 | auf die Sekunde | Zwischen Ralph Kimball und Bill Inmon entstand ein langjähriger Grundsatzstreit darüber, ob Data Warehouses dimensional per Sternschema oder relational in dritter Normalform modelliert werden sollten. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=453s) |
| Meinung | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 2026-05 | 08:04 | auf die Sekunde | Peter Gluchowski schätzt, dass sich das Sternschema in größeren Unternehmen eher auf der Data-Mart-Ebene findet als auf der Ebene des Kern-Data-Warehouse. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=484s) |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 2026-05 | 08:08 | auf die Sekunde | Größere Unternehmen setzen auf der Ebene des Kern-Data-Warehouse heute häufig entweder auf normalisierte Datenhaltung oder auf Data Vault. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=488s) |
| Empfehlung | LogiMAT Arena Atrium 2026 \| Expert Forum - Supply Chain Risiko Management | 2026-04 | 16:01 | Abschnittsanfang | Statt sofort eine komplexe Architektur mit Machine Learning aufzubauen, empfiehlt es sich, zunächst nur die ERP-Daten täglich in ein Warehouse oder OneLake zu laden. | [▶](https://www.youtube.com/watch?v=DFw664hd1IE&t=961s) |
| Fakt | Fabric Planning unboxing | 2026-03 | 34:04 | Abschnittsanfang | Als Datenquelle für Planning-Objekte ist aktuell nur eine SQL-Datenbank wählbar, während Inforiver zusätzlich Lakehouse und Warehouse unterstützte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2044s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 09:06 | auf die Sekunde | Mit der VS-Code-Erweiterung für Fabric lässt sich ein Direct-Lake-Modell innerhalb weniger Minuten von einer SQL-Datenbank auf ein Warehouse umziehen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=546s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 00:34 | auf die Sekunde | Der Push-Ansatz mit SSIS ist in der offiziellen Microsoft-Dokumentation im Bereich Warehousing beschrieben. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=34s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 00:39 | auf die Sekunde | SQL Server Integration Services wird genutzt, um Daten in das Fabric Warehouse zu bringen. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=39s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 01:20 | auf die Sekunde | In der Zielarchitektur schreiben die Integration Services die Daten aus der On-Premises-Umgebung zunächst in ein Azure Storage, von wo sie ins Warehouse oder Lakehouse geladen werden können. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=80s) |
| Empfehlung | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 10:09 | Abschnittsanfang | Die im Lakehouse als Rohdaten liegenden Dateien lassen sich per COPY-INTO-Befehl in eine Warehouse-Tabelle laden oder mit einem Notebook, etwa in Python, weiterverarbeiten. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=609s) |
| Fakt | Why Passion Beats Niche | 2025-09 | 26:10 | auf die Sekunde | Die Verarbeitung pro Gigabyte ist in der Custom-Datenbank laut Brian Bønk etwas teurer als bei Lakehouse und Warehouse in Microsoft Fabric. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1570s) |
| Warnung | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 35:36 | auf die Sekunde | Im Warehouse ist beim Dataflow-Ziel nur der Modus Append wählbar und nicht mehr umkehrbar, während im Lakehouse nur Replace zur Verfügung steht. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2136s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 30:59 | auf die Sekunde | Volker Nürnberg arbeitet seit 2005 ausschließlich mit Data Warehouses und kam in den frühen 2010er-Jahren zu Data Vault. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1859s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 1:04:43 | auf die Sekunde | Bei Dataflow Gen1 lag die komplette Speicherschicht in der Hand des Dataflows selbst, während man bei Gen2 sein eigenes Ziel wie Warehouse oder Lakehouse selbst verwalten muss. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3883s) |
| Warnung | BI Thinkers Talk Nr.62 | 2025-05 | 48:55 | auf die Sekunde | Direkt in ein Fabric-Warehouse zu schreiben gilt laut einem der Sprecher nicht als Best Practice. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2935s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 18:44 | auf die Sekunde | OneLake Security soll als zentrale Policy Engine Spalten-, Row-Level- und dynamische Tabellenebenen-Sicherheit über Lakehouse, Warehouse und Power BI hinweg abdecken. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1124s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 21:47 | auf die Sekunde | User Data Functions ermöglichen es, Business Logic zu implementieren und zu kapseln und sie anschließend in einem Lakehouse, einer Data Pipeline und einem Warehouse wiederzuverwenden. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1307s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 03:33 | auf die Sekunde | Microsoft hat sich entschieden, DataMarts abzuloesen, weil deren Mehrwert gegenueber Fabric mit Warehouse und Dataflows Gen 2 in der Community zunehmend infrage gestellt wurde. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=213s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 09:13 | auf die Sekunde | Das neu gebaute Warehouse hatte am Ende über 150 SQL-Tabellen im Gold-Layer. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=553s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 20:33 | auf die Sekunde | Da ein Warehouse keine eigenen Shortcuts anlegen kann, mussten im Projekt Lake Houses repliziert werden, um darüber per Shortcut auf Bronze- und Gold-Layer zuzugreifen. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1233s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 21:10 | auf die Sekunde | Für die Warehouses wurden im Projekt klassische DACPAC-Deployments über ein SQL-Deployment-Tool eingesetzt, weil die Fabric Deployment Pipelines dafür nicht funktionierten. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1270s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? |  | 22:38 | auf die Sekunde | Der Wechsel von einem Lakehouse zu einem Warehouse lässt sich in der Praxis in wenigen Minuten umsetzen, da ein neues Warehouse leer und schnell angelegt ist. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1358s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 22:42 | auf die Sekunde | Für Row-Level-Security-Anforderungen im Import Mode wurden Warehouse-Views statt vollem Lake-House-Zugriff verwendet, was sich als performanter erwies als eine Notebook-Kopie. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1362s) |
| Warnung | 600 SQL-Tabellen in Fabric |  | 24:57 | auf die Sekunde | Wenn Views im Warehouse oder Predicate Functions für Security genutzt werden, ist Direct Lake danach nicht mehr nutzbar. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1497s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 34:48 | auf die Sekunde | Tabellen aus einem Lakehouse oder Warehouse lassen sich jetzt direkt in Excel einbinden, aehnlich wie vorher ueber Power BI. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2088s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Mythos Data Vault und richtig große Modelle](https://www.youtube.com/watch?v=rrCi0lnGrCg) | 2025-07-01 | kernaussagen+zeitstempel | [01:47](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=107s) · [13:42](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=822s) · [24:37](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1477s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=06%20%C2%B7%20Zusammenfassung%20%26%20%2Atypische%20Architekturen%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Workload-Landkarte%20%28Stand%202026%29) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20das%20Warehouse%20exklusiv%20kann) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | kernaussagen+zeitstempel | [19:55](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1195s) · [21:17](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1277s) · [22:53](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1373s) |
| [10 Jahre BI für alle? Was Power BI wirklich verändert hat](https://www.youtube.com/watch?v=9wl_PLvgvyc) | 2025-08-01 | nur-zeitstempel | [01:37](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=97s) · [18:41](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1121s) · [20:24](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1224s) |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [00:41](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=41s) · [01:15](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=75s) · [10:09](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=609s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [12:15](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=735s) · [17:21](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1041s) · [22:06](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1326s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [10:33](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=633s) · [15:50](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=950s) · [37:56](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2276s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | kernaussagen+zeitstempel | [03:02](https://www.youtube.com/watch?v=lZvpCBMKASM&t=182s) · [04:43](https://www.youtube.com/watch?v=lZvpCBMKASM&t=283s) · [33:41](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2021s) |
| [Power BI vs. Qlik](https://www.youtube.com/watch?v=vd1r02bj9Qk) | 2026-01-01 | kernaussagen+zeitstempel | [05:10](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=310s) · [07:12](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=432s) · [23:07](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=1387s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [10:01](https://www.youtube.com/watch?v=mTVeZzshLzE&t=601s) · [21:24](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1284s) · [36:01](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2161s) |
| [Power BI Update August 2025](https://www.youtube.com/watch?v=jTXo4aEr07o) | 2025-08-01 | nur-zeitstempel | [01:21](https://www.youtube.com/watch?v=jTXo4aEr07o&t=81s) |
| [Was wir von Iron Man für Datenprojekte lernen können (data:unplugged Vortrag)](https://www.youtube.com/watch?v=qVZhboahaDE) | 2025-04-01 | nur-zeitstempel | [06:36](https://www.youtube.com/watch?v=qVZhboahaDE&t=396s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [03:18](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=198s) · [32:03](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1923s) · [46:32](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2792s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | kernaussagen+zeitstempel | [09:00](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=540s) · [23:53](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1433s) · [25:05](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1505s) |
| [The Day After Tomorrow – Nach der Einführung geht es erst richtig los \| Power BI Summit 2023](https://www.youtube.com/watch?v=KwySyTxW_EI) | 2023-03-01 | nur-zeitstempel | [33:07](https://www.youtube.com/watch?v=KwySyTxW_EI&t=1987s) · [54:13](https://www.youtube.com/watch?v=KwySyTxW_EI&t=3253s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | kernaussagen+zeitstempel | [11:25](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=685s) · [17:15](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1035s) · [19:29](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1169s) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [02:40](https://www.youtube.com/watch?v=YzfcMurbWNc&t=160s) · [28:09](https://www.youtube.com/watch?v=YzfcMurbWNc&t=1689s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [36:23](https://www.youtube.com/watch?v=G8s96sHUHac&t=2183s) · [39:25](https://www.youtube.com/watch?v=G8s96sHUHac&t=2365s) · [41:02](https://www.youtube.com/watch?v=G8s96sHUHac&t=2462s) |
| [Datenmodellierung ist Governance](https://www.youtube.com/watch?v=lH_-A8NAQ-k) | 2025-11-01 | kernaussagen+zeitstempel | [28:53](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=1733s) · [32:23](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=1943s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [01:44](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=104s) · [13:46](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=826s) |
| [Realtalk zu Self Service mit Power BI](https://www.youtube.com/watch?v=27rC2zefFOU) | 2024-02-01 | nur-zeitstempel | [29:05](https://www.youtube.com/watch?v=27rC2zefFOU&t=1745s) |
| [Microsoft Power BI Einführung \| Florian Wiefel \| Hans-Ulrik Harnisch \| M365 Summit Mai 2022](https://www.youtube.com/watch?v=Z8vpSSOmG24) | 2022-06-01 | kernaussagen+zeitstempel | [00:02](https://www.youtube.com/watch?v=Z8vpSSOmG24&t=2s) |
| [LogiMAT Arena Atrium 2026 \| Expert Forum - Supply Chain Risiko Management](https://www.youtube.com/watch?v=DFw664hd1IE) | 2026-04-01 | kernaussagen+zeitstempel | [16:01](https://www.youtube.com/watch?v=DFw664hd1IE&t=961s) · [27:23](https://www.youtube.com/watch?v=DFw664hd1IE&t=1643s) |
| [Daten-WG Life-Update \| State of Power BI, Fabric & AI-Tools](https://www.youtube.com/watch?v=d3HdhRe_nK8) | 2026-06-01 | nur-zeitstempel | [00:44](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=44s) · [29:43](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1783s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [55:34](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3334s) · [57:27](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3447s) |
| [BI Thinkers Talk nr.77](https://www.youtube.com/watch?v=eWfTt93anl4) | — | nur-zeitstempel | [1:01:32](https://www.youtube.com/watch?v=eWfTt93anl4&t=3692s) · [1:03:02](https://www.youtube.com/watch?v=eWfTt93anl4&t=3782s) |
| [Von Patronen zu Prozessen](https://www.youtube.com/watch?v=0cHtxIm7fVw) | 2025-08-01 | nur-zeitstempel | [05:26](https://www.youtube.com/watch?v=0cHtxIm7fVw&t=326s) |
| [Von Patronen zu Prozessen (nur Ton)](https://www.youtube.com/watch?v=s3CveEVoDvo) | 2025-07-01 | nur-zeitstempel | [05:26](https://www.youtube.com/watch?v=s3CveEVoDvo&t=326s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | kernaussagen+zeitstempel | [19:48](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1188s) · [34:32](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2072s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [1:00:37](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3637s) · [1:02:14](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3734s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [34:04](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2044s) · [35:39](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2139s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [14:54](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=894s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [22:30](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1350s) |
| [Daten-WG Deep Dive Financial Reporting - part 7](https://www.youtube.com/watch?v=232JhS9vbQ0) | 2025-09-01 | nur-zeitstempel | [03:25](https://www.youtube.com/watch?v=232JhS9vbQ0&t=205s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | kernaussagen+zeitstempel | [53:44](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3224s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Microsoft%20Fabric%20%26%20OneLake) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Fabric%20vs.%20klassisches%20Power%20BI) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Fabric-Bausteine) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [33:52](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2032s) |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |
| [BI Thinkers Talk - Data Modelling - Fabric Data Days Edition](https://www.youtube.com/watch?v=mUALlPmGcEk) | 2025-11-01 | kernaussagen+zeitstempel | [22:42](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1362s) |
| [BI Thinkers Talk - Data Modeling - Fabric Data Days Edition [EN]](https://www.youtube.com/watch?v=uxYFqwe_Wiw) | 2025-12-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) |

40 von 42 angezeigt, vollständige Liste in der JSON-Datei (https://datenwgknowledgekitchen.com/wissensgraph/library/warehouse.json).

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Awarehouse
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Awarehouse&f=tool%3Awarehouse
