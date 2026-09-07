---
id: "tool:sql"
name: "SQL"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 50
kernaussagen: 16
mit_kernaussagen: 8
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql.json"
aliase:
  - "SQL-Abfrage"
  - "SQL-Abfragen"
---

# SQL

Die Kusto Query Language ist deklarativ aufgebaut, weil man mit dem Tabellennamen beginnt, statt wie in SQL zuerst die gewünschten Spalten anzugeben. (Stand 2025-09) Die Replikation der Tabelle selbst erzeugt keine zusätzlichen Fabric-Kapazitätskosten, erst der Datenzugriff über SQL, Power BI oder Spark wird nach den regulären Tarifen berechnet. (Stand 2026-01) Nach Abschluss der Replikation lassen sich die gespiegelten Daten direkt per SQL-Abfrage in Fabric auslesen. (Stand 2026-01)

## Aliase

SQL-Abfrage, SQL-Abfragen

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Translytical Task Flows](translytical-task-flows.md) | Translytical Task Flows setzt-voraus SQL | automatisch extrahiert, Quellenstelle vorhanden | „auch da ein gewisser Vorlauf mit erst Sequel in Fabric GA, dann User Data Functions GA, dann Input Slicer GA und jetzt transitas, das auf all diesen Bausteinen aufbaut“ (Fabric & Power BI Quarterly · 2026-2) | 0 |
| [Microsoft Fabric](microsoft-fabric.md) | SQL und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 74 |
| [Power BI](power-bi.md) | SQL und Power BI im selben Segment | Heuristik, gezählt |  | 67 |
| [Lakehouse](lakehouse.md) | SQL und Lakehouse im selben Segment | Heuristik, gezählt |  | 49 |
| [Warehouse](warehouse.md) | SQL und Warehouse im selben Segment | Heuristik, gezählt |  | 46 |
| [SQL Server](sql-server.md) | SQL und SQL Server im selben Segment | Heuristik, gezählt |  | 38 |
| [Direct Lake](direct-lake.md) | SQL und Direct Lake im selben Segment | Heuristik, gezählt |  | 31 |
| [Performance](performance.md) | SQL und Performance im selben Segment | Heuristik, gezählt |  | 31 |
| [Reporting](reporting.md) | SQL und Reporting im selben Segment | Heuristik, gezählt |  | 28 |
| [Notebook](notebook.md) | SQL und Notebook im selben Segment | Heuristik, gezählt |  | 26 |
| [Delta Lake](delta-lake.md) | SQL und Delta Lake im selben Segment | Heuristik, gezählt |  | 26 |
| [Echtzeit](echtzeit.md) | SQL und Echtzeit im selben Segment | Heuristik, gezählt |  | 25 |
| [OneLake](onelake.md) | SQL und OneLake im selben Segment | Heuristik, gezählt |  | 25 |
| [Dataflow](dataflow.md) | SQL und Dataflow im selben Segment | Heuristik, gezählt |  | 25 |
| [KI](ki.md) | SQL und KI im selben Segment | Heuristik, gezählt |  | 24 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 50:25 | auf die Sekunde | Intelligence Sheets von Lumel sind in Fabric aktuell auf SQL-Datenbank-Verbindungen beschränkt. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=3025s) |
| Warnung | Fabric Planning unboxing | 2026-03 | 09:22 | Abschnittsanfang | Eine einzelne SQL-Datenbank kann bereits eine F2-Kapazität stark auslasten, wie ein interner Vorfall zeigte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=562s) |
| Fakt | Fabric Planning unboxing | 2026-03 | 09:46 | auf die Sekunde | Beim Anlegen eines Planning-Objekts wird automatisch eine Fabric SQL-Datenbank erstellt. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=586s) |
| Empfehlung | Fabric Planning unboxing | 2026-03 | 17:22 | auf die Sekunde | Für Rückschreibungen mit Power Table wird empfohlen, eine eigene Datenbank anzulegen statt die automatisch erstellte Metadaten-Datenbank zu verwenden. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1042s) |
| Fakt | Fabric Planning unboxing | 2026-03 | 34:04 | Abschnittsanfang | Als Datenquelle für Planning-Objekte ist aktuell nur eine SQL-Datenbank wählbar, während Inforiver zusätzlich Lakehouse und Warehouse unterstützte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2044s) |
| Warnung | Fabric Planning unboxing | 2026-03 | 51:00 | auf die Sekunde | Das Zurückschreiben ist derzeit auf SQL-Datenbanken beschränkt, während Inforiver zusätzlich nach Snowflake oder SAP schreiben konnte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3060s) |
| Empfehlung | BI Thinkers Talk n.73 | 2026-02 | 54:58 | auf die Sekunde | Als Workaround definiert einer der Sprecher View-Definitionen stattdessen in TSQL-Notebooks, damit sie über die Deployment Pipeline mit transportiert werden. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3298s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 03:39 | auf die Sekunde | Die Replikation der Tabelle selbst erzeugt keine zusätzlichen Fabric-Kapazitätskosten, erst der Datenzugriff über SQL, Power BI oder Spark wird nach den regulären Tarifen berechnet. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=219s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 08:39 | Abschnittsanfang | Nach Abschluss der Replikation lassen sich die gespiegelten Daten direkt per SQL-Abfrage in Fabric auslesen. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=519s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 00:48 | auf die Sekunde | Die SQL-Schnittstellen in Fabric sind auf Massendaten ausgelegt und nicht dafür gedacht, einzelne Datensätze zu schreiben. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=48s) |
| Fakt | Why Passion Beats Niche | 2025-09 | 02:17 | auf die Sekunde | Die Kusto Query Language ist deklarativ aufgebaut, weil man mit dem Tabellennamen beginnt, statt wie in SQL zuerst die gewünschten Spalten anzugeben. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=137s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 20:36 | auf die Sekunde | Weil eine zu restriktive Firewall-Security den SQL-Zugriff auf Lakehouse-Tabellen blockierte, baute der Kunde stattdessen ein semantisches Direct-Lake-Modell direkt im Web auf. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1236s) |
| Empfehlung | BI Thinkers Talk Nr.62 | 2025-05 | 16:35 | auf die Sekunde | Für das Zurückschreiben aus Power BI wird eine SQL-Datenbank in Fabric statt eines Lakehouse verwendet. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=995s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 16:47 | auf die Sekunde | Die Writeback-Funktion wird als User Defined Function in der Fabric-SQL-Datenbank mit einer SQL-Update-Query umgesetzt. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1007s) |
| Warnung | BI Thinkers Talk Nr.62 | 2025-05 | 23:50 | Abschnittsanfang | Beim Aufbau der SQL-Query sollten Parameter beziehungsweise Platzhalter statt direkt eingefügter Werte verwendet werden, um SQL-Injection zu vermeiden. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1430s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 25:22 | Abschnittsanfang | In der Update-Query muss der Tabellenname mit dem Schema-Präfix SalesLT angegeben werden, sonst schlägt die Ausführung mit einem Invalid-Object-Name-Fehler fehl. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1522s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Brian Bønks Rat an kleine Konferenzen – und warum wir ihn ernst nehmen](https://www.youtube.com/watch?v=QyhnWfGih_o) | 2026-05-01 | kernaussagen+zeitstempel | [00:00](https://www.youtube.com/watch?v=QyhnWfGih_o&t=0s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Typische%20Nutzung) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20das%20Warehouse%20exklusiv%20kann) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20zwei%20Dinge%2C%20die%20man%20wissen%20muss) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [00:34](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=34s) · [30:19](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1819s) · [33:36](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=2016s) |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) · [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) · [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | kernaussagen+zeitstempel | [00:00](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=0s) · [02:04](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=124s) · [25:05](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1505s) |
| [Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial](https://www.youtube.com/watch?v=7j34Ndng0Os) | 2026-01-01 | kernaussagen+zeitstempel | [02:40](https://www.youtube.com/watch?v=7j34Ndng0Os&t=160s) · [04:01](https://www.youtube.com/watch?v=7j34Ndng0Os&t=241s) · [08:39](https://www.youtube.com/watch?v=7j34Ndng0Os&t=519s) |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [00:41](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=41s) · [01:15](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=75s) · [04:13](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=253s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [12:58](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=778s) · [23:50](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1430s) · [31:47](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1907s) |
| [Metadaten als Superkraft](https://www.youtube.com/watch?v=UUlPoJOhco8) | — | kernaussagen+zeitstempel | [01:34](https://www.youtube.com/watch?v=UUlPoJOhco8&t=94s) · [03:41](https://www.youtube.com/watch?v=UUlPoJOhco8&t=221s) · [08:50](https://www.youtube.com/watch?v=UUlPoJOhco8&t=530s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [06:28](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=388s) · [32:03](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1923s) · [33:34](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2014s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | kernaussagen+zeitstempel | [07:50](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=470s) · [16:07](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=967s) · [19:55](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1195s) |
| [Realtalk zu Self Service mit Power BI](https://www.youtube.com/watch?v=27rC2zefFOU) | 2024-02-01 | nur-zeitstempel | [20:05](https://www.youtube.com/watch?v=27rC2zefFOU&t=1205s) · [29:05](https://www.youtube.com/watch?v=27rC2zefFOU&t=1745s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [11:32](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=692s) · [21:31](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1291s) · [23:04](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1384s) |
| [SharePoint direkt in Microsoft Fabric nutzen \| Lakehouse, Direct Lake & Power BI](https://www.youtube.com/watch?v=c-LWoo-O5PQ) | 2026-07-01 | nur-zeitstempel | [08:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=500s) · [09:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=560s) |
| [10 Jahre BI für alle? Was Power BI wirklich verändert hat](https://www.youtube.com/watch?v=9wl_PLvgvyc) | 2025-08-01 | nur-zeitstempel | [09:06](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=546s) · [11:07](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=667s) · [33:13](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1993s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [09:22](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=562s) · [17:15](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1035s) · [50:19](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3019s) |
| [Power BI Update Juli 2025](https://www.youtube.com/watch?v=TkxwcAyBGUM) | 2025-07-01 | nur-zeitstempel | [06:09](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=369s) |
| [Microsoft Fabric Shortcut Transformation erklärt: Updates im Praxistest](https://www.youtube.com/watch?v=Z6RZjkn_6lY) | 2026-07-01 | nur-zeitstempel | [00:28](https://www.youtube.com/watch?v=Z6RZjkn_6lY&t=28s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [09:01](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=541s) · [20:50](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1250s) · [22:30](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1350s) |
| [The Power of User Groups](https://www.youtube.com/watch?v=SSUpe1JON9Y) | 2025-10-01 | nur-zeitstempel | [08:10](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=490s) · [10:04](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=604s) |
| [BI Thinkers Talk nr.77](https://www.youtube.com/watch?v=eWfTt93anl4) | — | nur-zeitstempel | [17:34](https://www.youtube.com/watch?v=eWfTt93anl4&t=1054s) · [30:19](https://www.youtube.com/watch?v=eWfTt93anl4&t=1819s) · [41:47](https://www.youtube.com/watch?v=eWfTt93anl4&t=2507s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Strategie%204%3A%20Native%20Query%20als%20Ausweg) |
| [Daten-WG Life-Update \| State of Power BI, Fabric & AI-Tools](https://www.youtube.com/watch?v=d3HdhRe_nK8) | 2026-06-01 | nur-zeitstempel | [02:10](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=130s) · [13:36](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=816s) · [22:14](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1334s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [09:44](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=584s) · [53:40](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3220s) · [57:27](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3447s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [13:46](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=826s) · [31:45](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1905s) |
| [Daten-WG 2026 Lineup](https://www.youtube.com/watch?v=AX7b8_aNekw) | 2026-05-01 | nur-zeitstempel | [01:43](https://www.youtube.com/watch?v=AX7b8_aNekw&t=103s) · [15:33](https://www.youtube.com/watch?v=AX7b8_aNekw&t=933s) · [17:05](https://www.youtube.com/watch?v=AX7b8_aNekw&t=1025s) |
| [Power BI Update August 2026](https://www.youtube.com/watch?v=GWCHNmLs72M) | 2026-08-01 | nur-zeitstempel | [07:35](https://www.youtube.com/watch?v=GWCHNmLs72M&t=455s) |
| [Visual Analytics with Power BI](https://www.youtube.com/watch?v=UxE0DPnLgIg) | 2021-09-01 | nur-zeitstempel | [00:41](https://www.youtube.com/watch?v=UxE0DPnLgIg&t=41s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [39:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2368s) · [48:38](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2918s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | kernaussagen+zeitstempel | [22:34](https://www.youtube.com/watch?v=lZvpCBMKASM&t=1354s) · [24:05](https://www.youtube.com/watch?v=lZvpCBMKASM&t=1445s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [42:00](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2520s) · [43:34](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2614s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [32:17](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1937s) · [33:52](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2032s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | kernaussagen+zeitstempel | [08:35](https://www.youtube.com/watch?v=4VVNDNusq4U&t=515s) · [40:26](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2426s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [58:52](https://www.youtube.com/watch?v=r416vanitYw&t=3532s) · [1:00:24](https://www.youtube.com/watch?v=r416vanitYw&t=3624s) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [02:40](https://www.youtube.com/watch?v=YzfcMurbWNc&t=160s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [19:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=1168s) · [54:26](https://www.youtube.com/watch?v=G8s96sHUHac&t=3266s) |
| [Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup](https://www.youtube.com/watch?v=BDnwlOqRElY) | 2025-06-01 | kernaussagen+zeitstempel | [34:03](https://www.youtube.com/watch?v=BDnwlOqRElY&t=2043s) |
| [Prinzipien oder Paragrafen](https://www.youtube.com/watch?v=6WhWLcuFvZE) | 2026-02-01 | kernaussagen+zeitstempel | [20:43](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=1243s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [15:49](https://www.youtube.com/watch?v=mTVeZzshLzE&t=949s) |
| [BI Thinkers Talk nr.63](https://www.youtube.com/watch?v=9VX4-lLa0EI) | 2025-06-01 | nur-zeitstempel | [26:18](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=1578s) |

40 von 50 angezeigt, vollständige Liste in der JSON-Datei (https://datenwgknowledgekitchen.com/wissensgraph/library/sql.json).

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Asql
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Asql&f=tool%3Asql
