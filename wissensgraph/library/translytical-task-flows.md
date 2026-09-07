---
id: "tool:translytical-task-flows"
name: "Translytical Task Flows"
typ: tool
stand: "2026-09-07"
build: "20260907-1922"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 9
kernaussagen: 15
mit_kernaussagen: 6
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/translytical-task-flows.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/translytical-task-flows.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/translytical-task-flows.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/translytical-task-flows.json"
aliase:
  - "Writeback"
  - "Write-back"
  - "Task Flows"
  - "Rückschreiben"
---

# Translytical Task Flows

Translytical Task Flows sind jetzt allgemein verfügbar (Generally Available) und nicht mehr nur als Vorschau. Translytical Task Flows sind jetzt allgemein verfügbar (GA) und bauen auf den vorherigen GA-Schritten von SQL in Fabric, User Data Functions und Input Slicer auf. Die Writeback-Funktion wird als User Defined Function in der Fabric-SQL-Datenbank mit einer SQL-Update-Query umgesetzt.

## Aliase

Writeback, Write-back, Task Flows, Rückschreiben

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [SQL](sql.md) | setzt-voraus | belegt | 0 |
| [Planung](planung.md) | gegensatz | belegt | 0 |
| [Power Automate](power-automate.md) | ersetzt | belegt | 0 |
| [Fabric Capacity](fabric-capacity.md) | setzt-voraus | belegt | 0 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 4 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Power BI Update März 2026 | 2026-03 | 00:15 | auf die Sekunde | Translytical Task Flows sind jetzt allgemein verfügbar (Generally Available) und nicht mehr nur als Vorschau. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=15s) |
| Warnung | BI Thinkers Talk n.74 | 2026-03 | 50:07 | auf die Sekunde | Das Einbinden der Variable Library als Connection und das Auslesen ihrer Werte kann die Ausführung eines Translytical-Task-Flow-Prozesses stark verlangsamen. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=3007s) |
| Fakt | Power BI Update Februar 2026 | 2026-02 | 01:52 | auf die Sekunde | Der Input Slicer kann weiterhin als Parameter innerhalb von Translytical Task Flows genutzt werden. | [▶](https://www.youtube.com/watch?v=u-lgbDfIlLg&t=112s) |
| Meinung | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 49:12 | Abschnittsanfang | Arthur wünscht sich für Translytical Task Flows eine bessere Eingabemöglichkeit als den aktuellen Text-Slicer, etwa mit Zeilenumbrüchen und Kommentarfunktion. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=2952s) |
| Meinung | BI Thinkers Talk Nr.62 | 2025-05 | 06:30 | Abschnittsanfang | Das persönliche Highlight der auf der Microsoft Build vorgestellten Neuerungen war für den Sprecher das native Writeback in Power BI. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=390s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 16:47 | auf die Sekunde | Die Writeback-Funktion wird als User Defined Function in der Fabric-SQL-Datenbank mit einer SQL-Update-Query umgesetzt. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1007s) |
| Meinung | BI Thinkers Talk Nr.62 | 2025-05 | 29:34 | auf die Sekunde | Aus Sicht des Sprechers sind Datenfunktionen zum Zurückschreiben noch nicht vollständig self-service-tauglich, weil Modell, Datenhaltung und Funktion aktuell nicht an Fachbereiche übergeben werden sollten. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1774s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 40:55 | auf die Sekunde | Aktuell können nur bestimmte neue Slicer-Visuals als Eingabe für eine per Button ausgelöste Datenfunktion dienen. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2455s) |
| Warnung | BI Thinkers Talk Nr.62 | 2025-05 | 41:23 | Abschnittsanfang | Kreuzfilterung wird derzeit nicht als Eingabemethode für Datenfunktionen unterstützt. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2483s) |
| Empfehlung | BI Thinkers Talk Nr.62 | 2025-05 | 43:08 | auf die Sekunde | Microsoft empfiehlt den Textdatenschnitt als Workaround, um Freitext für eine Datenfunktion einzugeben. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2588s) |
| Warnung | BI Thinkers Talk Nr.62 | 2025-05 | 48:55 | auf die Sekunde | Direkt in ein Fabric-Warehouse zu schreiben gilt laut dem Sprecher nicht als Best Practice. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2935s) |
| Meinung | BI Thinkers Talk Nr.62 | 2025-05 | 50:14 | auf die Sekunde | Aus Anwendersicht ist der Power-BI-Teil der Writeback-Lösung self-service-tauglich, weil Business User nur vordefinierte Funktionen auswählen, ohne Modell oder Zielort zu kennen. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3014s) |
| Warnung | BI Thinkers Talk Nr.62 | 2025-05 | 56:29 | auf die Sekunde | Die neuen Slicer unterstützen aktuell keine Hierarchien als Auswahlbedingung für eine Datenfunktion, auch nicht der Hierarchy Slicer. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3389s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 1:01:23 | auf die Sekunde | Beim Auslösen der Datenfunktion liest das semantische Modell offenbar alle Tabellen neu, nicht nur die betroffene, unabhängig vom Speichermodus. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3683s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 |  | 08:36 | auf die Sekunde | Translytical Task Flows sind jetzt allgemein verfügbar (GA) und bauen auf den vorherigen GA-Schritten von SQL in Fabric, User Data Functions und Input Slicer auf. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=516s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Power BI Update März 2026](https://www.youtube.com/watch?v=ASwcPvbMRZc) | 2026-03-01 | kernaussagen+zeitstempel | [00:00](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=0s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [05:56](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=356s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [21:39](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1299s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [53:23](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=3203s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [12:58](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=778s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [17:15](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1035s) |
| [Power BI Update Mai 2026](https://www.youtube.com/watch?v=psLPsI32sAs) | 2026-05-01 | nur-zeitstempel | — |
| [How to Write Back](https://www.youtube.com/watch?v=HQaLWjA-E2E) | 2025-12-01 | nur-metadaten | — |
| [Introducing Fabric Workloads and PowerTable for Fabric Data Apps with Live Writeback](https://www.youtube.com/watch?v=BIKk_8H_Pqw) | 2025-07-01 | nur-metadaten | — |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Atranslytical-task-flows
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Atranslytical-task-flows&f=tool%3Atranslytical-task-flows
