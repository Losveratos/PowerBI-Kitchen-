---
id: "tool:tmdl"
name: "TMDL"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 10
kernaussagen: 30
mit_kernaussagen: 11
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/tmdl.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/tmdl.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/tmdl.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/tmdl.json"
aliase:
  - "Tabular Model Definition Language"
---

# TMDL

Der MCP Modeling Server für Power BI kann momentan alles bearbeiten, was über TMDL abgebildet ist, also Power Query, Datenmodell, Beziehungen und DAX-Measures. (Stand 2025-12) Das Frontend bzw. die Report-Seiten von Power BI lassen sich mit dem MCP Modeling Server momentan noch nicht bearbeiten. (Stand 2025-12) Bevor Microsoft einen offiziellen MCP Modeling Server bereitstellte, hatte sich Code Buller mit verschiedensten Hilfsmitteln eine eigene Schnittstelle zum Power-BI-Modell selbst gebaut. (Stand 2025-12)

## Aliase

Tabular Model Definition Language

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Semantic Model](semantic-model.md) | TMDL teil-von Semantic Model | automatisch extrahiert, Quellenstelle vorhanden | „um die äh Anprogrammierbarkeit von semantischen Modellen an der Stelle zu verbessern“ (Fabric & Power BI Quarterly · 2025 Q3) | 0 |
| [Power Query](power-query.md) | TMDL gegensatz Power Query | automatisch extrahiert, Quellenstelle vorhanden | „weil du ja in Tindel keine Power Query laden kannst“ (Daten-WG Thinkers Talk n61, 2025-04) | 3 |
| [Copilot](copilot.md) | Copilot setzt-voraus TMDL | automatisch extrahiert, Quellenstelle vorhanden | „Du kannst halt alles nur verändern, was irgendwo im TMDL Model steht (Segment 30)“ (BI Thinkers Talk nr.71, 2025-12) | 0 |
| [Power Query](power-query.md) | Power Query teil-von TMDL | automatisch extrahiert, Quellenstelle vorhanden | „alles im was Power Query, Datenmodell, Beziehung, DAX Measures, alles das, was darin embettet ist“ (Unboxing MCP Server for Power BI Modelling, 2025-12) | 3 |
| [DAX](dax.md) | DAX teil-von TMDL | automatisch extrahiert, Quellenstelle vorhanden | „alles im was Power Query, Datenmodell, Beziehung, DAX Measures, alles das, was darin embettet ist“ (Unboxing MCP Server for Power BI Modelling, 2025-12) | 6 |
| [Power BI](power-bi.md) | TMDL und Power BI im selben Segment | Heuristik, gezählt |  | 9 |
| [Performance](performance.md) | TMDL und Performance im selben Segment | Heuristik, gezählt |  | 6 |
| [Direct Lake](direct-lake.md) | TMDL und Direct Lake im selben Segment | Heuristik, gezählt |  | 4 |
| [Reporting](reporting.md) | TMDL und Reporting im selben Segment | Heuristik, gezählt |  | 4 |
| [Microsoft Fabric](microsoft-fabric.md) | TMDL und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 3 |
| [Sicherheit](sicherheit.md) | TMDL und Sicherheit im selben Segment | Heuristik, gezählt |  | 3 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Fabric Workload Demo mit Alexander Korn und Lukasz Obst | 2026-08 | 07:46 | auf die Sekunde | Fuer Berichtsdesign gibt es in Power BI Desktop bislang keine TMDL-artige Ansicht; im Developer Hub wurde deshalb eine neue Report View analog zur TMDL-View gebaut. | [▶](https://www.youtube.com/watch?v=e50qKdVn-24&t=466s) |
| Fakt | Power BI Update März 2026 | 2026-03 | 05:57 | Abschnittsanfang | Vor der neuen GUI-Unterstützung konnten benutzerdefinierte DAX-Funktionen nur über die DAX Query View oder über TMDL angelegt werden. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=357s) |
| Fakt | Power BI Update März 2026 | 2026-03 | 06:21 | Abschnittsanfang | TMDL ist jetzt auch im Web-Modeling von Power BI verfügbar. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=381s) |
| Fakt | Unboxing MCP Server for Power BI Modelling | 2025-12 | 04:45 | auf die Sekunde | Der MCP Modeling Server für Power BI kann momentan alles bearbeiten, was über TMDL abgebildet ist, also Power Query, Datenmodell, Beziehungen und DAX-Measures. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=285s) |
| Fakt | Unboxing MCP Server for Power BI Modelling | 2025-12 | 04:53 | auf die Sekunde | Das Frontend bzw. die Report-Seiten von Power BI lassen sich mit dem MCP Modeling Server momentan noch nicht bearbeiten. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=293s) |
| Fakt | Unboxing MCP Server for Power BI Modelling | 2025-12 | 06:53 | auf die Sekunde | Bevor Microsoft einen offiziellen MCP Modeling Server bereitstellte, hatte sich Code Buller mit verschiedensten Hilfsmitteln eine eigene Schnittstelle zum Power-BI-Modell selbst gebaut. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=413s) |
| Fakt | Unboxing MCP Server for Power BI Modelling | 2025-12 | 11:06 | auf die Sekunde | Der MCP Server muss angewiesen werden, die lokale Power-BI-Datei zu nutzen, und fragt danach vor jeder Aktion um Erlaubnis. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=666s) |
| Fakt | Unboxing MCP Server for Power BI Modelling | 2025-12 | 24:19 | auf die Sekunde | Bei Änderungen am Modell fragt der MCP Server jedes Mal nach einer expliziten Bestätigung, bevor die Operation ausgeführt wird. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=1459s) |
| Meinung | Unboxing MCP Server for Power BI Modelling | 2025-12 | 29:04 | auf die Sekunde | Bei komplexeren Aufgaben wie dem Aufbau eines Sternschemas wird vermutet, dass mehr Instructions dem MCP-Assistenten helfen würden, das gewünschte Ergebnis zuverlässiger zu erzielen. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=1744s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 31:56 | Abschnittsanfang | Spaltenbeschreibungen lassen sich in Power BI sowohl in der Modellansicht als auch in der TMDL-Ansicht hinterlegen. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1916s) |
| Fakt | Unboxing MCP Server for Power BI Modelling | 2025-12 | 41:03 | auf die Sekunde | Bei einem Kundenprojekt ließ sich ein komplett großgeschriebenes Snake-Case-Datenbankschema mithilfe von KI und TMDL sehr schnell in lesbare Namen übersetzen. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=2463s) |
| Warnung | Unboxing MCP Server for Power BI Modelling | 2025-12 | 41:44 | auf die Sekunde | TMDL reagiert sehr unverzeihend, wenn die Einrückung nicht korrekt gesetzt wird. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=2504s) |
| Warnung | BI Thinkers Talk nr.71 | 2025-12 | 48:16 | Abschnittsanfang | Ein per MCP an ein Power-BI-Modell angebundener KI-Assistent kann laut den Sprechern nur Elemente verändern, die im TMDL-Modell abgebildet sind, nicht jedoch Inhalte im Report-Frontend. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2896s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 59:05 | auf die Sekunde | TMDL steht für "Tabular Model Definition Language". | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=3545s) |
| Warnung | Unboxing MCP Server for Power BI Modelling | 2025-12 | 1:05:37 | auf die Sekunde | Im Laufe der Demo wurde die Power-BI-Datei durch die Interaktion mit dem MCP Server korrupt, sodass sie sich nicht mehr öffnen ließ. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=3937s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 13:12 | auf die Sekunde | Power BI Desktop wurde so gehärtet, dass es Codesegmente von Drittanbieter-Tools, die es selbst nicht versteht, ignoriert, statt wie früher etwa bei manuellen Partitionsdefinitionen mit einem Fehler abzubrechen. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=792s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 1:02:12 | Abschnittsanfang | Neue wiederverwendbare DAX-Funktionen lassen sich derzeit nicht direkt in der Power-BI-Desktop-Oberfläche erstellen oder bearbeiten, sondern nur im DAX-Abfrageeditor oder über die TMDL-Ansicht, während Desktop sie nur lesend als vorhandene Funktionen mit Lösch- und Umbenennen-Option anzeigt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3732s) |
| Fakt | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 20:54 | auf die Sekunde | Ein Kalender lässt sich per Power Query aufbauen und zusätzlich über TMDL mit Formaten, Sortierungen und Hierarchien anreichern. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1254s) |
| Meinung | 10 Jahre Power BI | 2025-07 | 46:50 | auf die Sekunde | Der Power BI Project Mode mit TMDL und PBIR erlaubt es, Berichte programmatisch über Textdateien zu ändern, was laut einem Sprecher die Bearbeitung durch KI erheblich erleichtert. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=2810s) |
| Fakt | Daten-WG Thinkers Talk n61 | 2025-04 | 31:15 | auf die Sekunde | Auf der Community-Plattform FabSnippets veröffentlichen Leute fertige TMDL-Snippets zum Copypasten, etwa Martin Bubenheimers Calculation-Group-Measure für gleitende Durchschnitte. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=1875s) |
| Fakt | Daten-WG Thinkers Talk n61 | 2025-04 | 32:51 | auf die Sekunde | Die TMDL-View verfügt nun über ein neues Vorschau-Feature, das eine Änderung anzeigt, bevor sie tatsächlich übernommen und am bestehenden Modell verändert wird. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=1971s) |
| Fakt | Daten-WG Thinkers Talk n61 | 2025-04 | 33:02 | auf die Sekunde | Die TMDL-Vorschau meldet einen Fehler, wenn eine semantisch ungültige Änderung eingefügt wird, etwa eine nicht existierende Data Category. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=1982s) |
| Meinung | Daten-WG Thinkers Talk n61 | 2025-04 | 38:49 | auf die Sekunde | Auch mit den neuen TMDL-Kalendermöglichkeiten wird es weiterhin als einfacher angesehen, einen Feiertag schnell in Power Query zu ergänzen statt in DAX. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2329s) |
| Empfehlung | Daten-WG Thinkers Talk n61 | 2025-04 | 43:00 | auf die Sekunde | Feiertagslogik sollte nicht Teil des TMDL-/Kalenderthemas sein, sondern eher als eine Art Offset separat behandelt werden. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2580s) |
| Fakt | Daten-WG Thinkers Talk n61 | 2025-04 | 50:41 | auf die Sekunde | Über den XML-Endpoint lässt sich in TMDL kein Power Query laden, weshalb ein in Power Query gebauter Arbeitstage-Offset wie der von Lars Schreiber nicht einfach eins zu eins in TMDL nachgebaut werden kann. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=3041s) |
| Empfehlung | Daten-WG Thinkers Talk n61 | 2025-04 | 51:35 | auf die Sekunde | Vordefinierte Hilfsdaten wie eine Feiertagstabelle gehören ins Backend, also nach Power Query oder woanders, statt nur deshalb in TMDL eingefügt zu werden, weil sich das dort einfach per Copy-Paste einfügen lässt. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=3095s) |
| Meinung | Fabric & Power BI Quarterly · 2026-2 |  | 07:00 | auf die Sekunde | Strukturierter, klar lesbarer Code wie TMDL ist notwendig, damit KI-Tools und Copilot Power-BI-Modelle gut nutzen und automatisiert bearbeiten können. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=420s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 09:55 | auf die Sekunde | DAX User Defined Functions lassen sich aktuell nur über die DAX Query View oder über TMDL definieren, nicht über die GUI. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=595s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 13:35 | auf die Sekunde | TMDL ist als Community-Projekt von Matthias Terbach entstanden und hat in Rekordzeit den Weg zu einem offiziell unterstuetzten Bestandteil des Produkts inklusive TMDL View geschafft. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=815s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 36:54 | auf die Sekunde | Mit dem Tabular Editor bzw. im TMDL-Code lassen sich schon inoffiziell Composite Models aus Import- und Direct-Lake-Tabellen bauen, bevor das offiziell in Power BI Desktop verfuegbar ist. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2214s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [25:07](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1507s) · [43:40](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=2620s) · [45:13](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=2713s) |
| [Unboxing MCP Server for Power BI Modelling](https://www.youtube.com/watch?v=iinfiHxznOU) | 2025-12-01 | kernaussagen+zeitstempel | [04:39](https://www.youtube.com/watch?v=iinfiHxznOU&t=279s) · [28:36](https://www.youtube.com/watch?v=iinfiHxznOU&t=1716s) · [41:19](https://www.youtube.com/watch?v=iinfiHxznOU&t=2479s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [31:56](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1916s) · [48:16](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2896s) · [57:54](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=3474s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | kernaussagen+zeitstempel | [41:32](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2492s) · [43:13](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2593s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [09:01](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=541s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Einstellungen%20pr%C3%BCfen) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=XMLA%20%E2%80%94%20der%20Enterprise-Zugang) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Aus%20dem%20Kanal%20%C2%B7%20DAX-Konzepte%20am%20Beispiel) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Field%20Parameters%20f%C3%BCr%20Dimensionen) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Aus%20dem%20Kanal%20%C2%B7%20Interaktivit%C3%A4t%20konkret) |
| [Power BI Update Juli 2026](https://www.youtube.com/watch?v=7xYgX6lWhuQ) | 2026-07-01 | nur-zeitstempel | — |
| [TMDL Magie: Multi Parameter Tabelle - Feldparameter Next Level! \| Power BI Tutorial](https://www.youtube.com/watch?v=sShNdgnHjr4) | 2025-10-01 | nur-zeitstempel | — |
| [Power BI Deep Dive: DAX UDF + TMDL](https://www.youtube.com/watch?v=0FPA1k5YiTs) | 2025-10-01 | nur-zeitstempel | — |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Atmdl
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Atmdl&f=tool%3Atmdl
