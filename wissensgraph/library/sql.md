---
id: "tool:sql"
name: "SQL"
typ: tool
stand: "2026-09-07"
build: "20260907-1012"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 2
kernaussagen: 15
mit_kernaussagen: 7
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

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk nr.75 | 51:19 | Intelligence Sheets von Lumel sind in Fabric aktuell auf SQL-Datenbank-Verbindungen beschränkt. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=3079s) |
| Fakt | Fabric Planning unboxing | 09:22 | Beim Anlegen eines Planning-Objekts wird automatisch eine Fabric SQL-Datenbank erstellt. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=562s) |
| Warnung | Fabric Planning unboxing | 09:22 | Eine einzelne SQL-Datenbank kann bereits eine F2-Kapazität stark auslasten, wie ein interner Vorfall zeigte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=562s) |
| Empfehlung | Fabric Planning unboxing | 17:15 | Für Rückschreibungen mit Power Table wird empfohlen, eine eigene Datenbank anzulegen statt die automatisch erstellte Metadaten-Datenbank zu verwenden. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1035s) |
| Fakt | Fabric Planning unboxing | 34:04 | Als Datenquelle für Planning-Objekte ist aktuell nur eine SQL-Datenbank wählbar, während Inforiver zusätzlich Lakehouse und Warehouse unterstützte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2044s) |
| Warnung | Fabric Planning unboxing | 50:19 | Das Zurückschreiben ist derzeit auf SQL-Datenbanken beschränkt, während Inforiver zusätzlich nach Snowflake oder SAP schreiben konnte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3019s) |
| Empfehlung | BI Thinkers Talk n.73 | 55:34 | Als Workaround definiert der Sprecher View-Definitionen stattdessen in TSQL-Notebooks, damit sie über die Deployment Pipeline mit transportiert werden. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3334s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 02:40 | Die Replikation der Tabelle selbst erzeugt keine zusätzlichen Fabric-Kapazitätskosten, erst der Datenzugriff über SQL, Power BI oder Spark wird nach den regulären Tarifen berechnet. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=160s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 08:39 | Nach Abschluss der Replikation lassen sich die gespiegelten Daten direkt per SQL-Abfrage in Fabric auslesen. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=519s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 00:41 | Die SQL-Schnittstellen in Fabric sind auf Massendaten ausgelegt und nicht dafür gedacht, einzelne Datensätze zu schreiben. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=41s) |
| Fakt | BI Thinkers Talk nr.67 | 19:28 | Weil eine zu restriktive Firewall-Security den SQL-Zugriff auf Lakehouse-Tabellen blockierte, baute der Kunde stattdessen ein semantisches Direct-Lake-Modell direkt im Web auf. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1168s) |
| Empfehlung | BI Thinkers Talk Nr.62 | 12:58 | Für das Zurückschreiben aus Power BI wird eine SQL-Datenbank in Fabric statt eines Lakehouse verwendet. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=778s) |
| Fakt | BI Thinkers Talk Nr.62 | 20:39 | Die Writeback-Funktion wird als User Defined Function in der Fabric-SQL-Datenbank mit einer SQL-Update-Query umgesetzt. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1239s) |
| Warnung | BI Thinkers Talk Nr.62 | 23:50 | Beim Aufbau der SQL-Query sollten Parameter beziehungsweise Platzhalter statt direkt eingefügter Werte verwendet werden, um SQL-Injection zu vermeiden. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1430s) |
| Fakt | BI Thinkers Talk Nr.62 | 25:22 | In der Update-Query muss der Tabellenname mit dem Schema-Präfix SalesLT angegeben werden, sonst schlägt die Ausführung mit einem Invalid-Object-Name-Fehler fehl. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1522s) |

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
