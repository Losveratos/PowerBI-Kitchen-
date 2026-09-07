---
id: "tool:sql"
name: "SQL"
typ: tool
stand: "2026-09-07"
build: "20260907-1922"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 2
kernaussagen: 15
mit_kernaussagen: 7
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/sql.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/sql.json"
aliase:
  - "SQL-Abfrage"
  - "SQL-Abfragen"
---

# SQL

Intelligence Sheets von Lumel sind in Fabric aktuell auf SQL-Datenbank-Verbindungen beschränkt. Beim Anlegen eines Planning-Objekts wird automatisch eine Fabric SQL-Datenbank erstellt. Als Datenquelle für Planning-Objekte ist aktuell nur eine SQL-Datenbank wählbar, während Inforiver zusätzlich Lakehouse und Warehouse unterstützte.

## Aliase

SQL-Abfrage, SQL-Abfragen

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Translytical Task Flows](translytical-task-flows.md) | setzt-voraus | belegt | 0 |
| [KI](ki.md) | ko-vorkommen | heuristik | 11 |
| [Strategie](strategie.md) | ko-vorkommen | heuristik | 6 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 4 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 3 |
| [Lizenzen](lizenzen.md) | ko-vorkommen | heuristik | 3 |

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
| Empfehlung | BI Thinkers Talk n.73 | 2026-02 | 54:58 | auf die Sekunde | Als Workaround definiert der Sprecher View-Definitionen stattdessen in TSQL-Notebooks, damit sie über die Deployment Pipeline mit transportiert werden. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3298s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 03:39 | auf die Sekunde | Die Replikation der Tabelle selbst erzeugt keine zusätzlichen Fabric-Kapazitätskosten, erst der Datenzugriff über SQL, Power BI oder Spark wird nach den regulären Tarifen berechnet. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=219s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 08:39 | Abschnittsanfang | Nach Abschluss der Replikation lassen sich die gespiegelten Daten direkt per SQL-Abfrage in Fabric auslesen. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=519s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 00:48 | auf die Sekunde | Die SQL-Schnittstellen in Fabric sind auf Massendaten ausgelegt und nicht dafür gedacht, einzelne Datensätze zu schreiben. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=48s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 20:36 | auf die Sekunde | Weil eine zu restriktive Firewall-Security den SQL-Zugriff auf Lakehouse-Tabellen blockierte, baute der Kunde stattdessen ein semantisches Direct-Lake-Modell direkt im Web auf. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1236s) |
| Empfehlung | BI Thinkers Talk Nr.62 | 2025-05 | 16:35 | auf die Sekunde | Für das Zurückschreiben aus Power BI wird eine SQL-Datenbank in Fabric statt eines Lakehouse verwendet. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=995s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 16:47 | auf die Sekunde | Die Writeback-Funktion wird als User Defined Function in der Fabric-SQL-Datenbank mit einer SQL-Update-Query umgesetzt. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1007s) |
| Warnung | BI Thinkers Talk Nr.62 | 2025-05 | 23:50 | Abschnittsanfang | Beim Aufbau der SQL-Query sollten Parameter beziehungsweise Platzhalter statt direkt eingefügter Werte verwendet werden, um SQL-Injection zu vermeiden. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1430s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 25:22 | Abschnittsanfang | In der Update-Query muss der Tabellenname mit dem Schema-Präfix SalesLT angegeben werden, sonst schlägt die Ausführung mit einem Invalid-Object-Name-Fehler fehl. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1522s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) · [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) · [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |
| [SharePoint direkt in Microsoft Fabric nutzen \| Lakehouse, Direct Lake & Power BI](https://www.youtube.com/watch?v=c-LWoo-O5PQ) | 2026-07-01 | nur-zeitstempel | [08:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=500s) · [09:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=560s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Asql
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Asql&f=tool%3Asql
