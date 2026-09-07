---
id: "tool:import-mode"
name: "Import Mode"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 12
kernaussagen: 18
mit_kernaussagen: 12
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/import-mode.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/import-mode.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/import-mode.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/import-mode.json"
aliase:
  - "Importmodus"
  - "Import-Modus"
---

# Import Mode

Bei der Migration eines Importmodells zu Direct Lake wurde eine bisher per Power-Query-Abfrage angelegte Measure-Tabelle durch eine Calculated Table mit einer leeren Hilfsspalte ersetzt. (Stand 2025-09) Die Kombination aus Direct Lake und Import Mode ist mittlerweile GA verfügbar und ermöglicht damit ein stabileres Composite-Modell. (Stand 2025-09) Im Projekt waren die Semantic Models keine Direct-Lake-, sondern klassische Import-Modelle.

## Aliase

Importmodus, Import-Modus

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Direct Lake](direct-lake.md) | Direct Lake gegensatz Import Mode | automatisch extrahiert, Quellenstelle vorhanden | „Aggregation kommt vor dem Laden in den Speicher, was natürlich auch extrem gut ist“ (Daten-WG Deep Dive Financial Reporting - part 6, 2025-08) | 6 |
| [Direct Lake](direct-lake.md) | Import Mode gegensatz Direct Lake | automatisch extrahiert, Quellenstelle vorhanden | „für Importmodelle gibt's ja Deployment Rules, für Direct Lake nicht“ (BI Thinkers Talk n.72, 2026-01) | 6 |
| [Direct Lake](direct-lake.md) | Direct Lake ersetzt Import Mode | automatisch extrahiert, Quellenstelle vorhanden | „Verbindung für den Bericht von dem Importmodell auf den Direct Lake Modell umgestellt“ (BI Thinkers Talk nr.67, 2025-09) | 6 |
| [Power BI](power-bi.md) | Import Mode und Power BI im selben Segment | Heuristik, gezählt |  | 8 |
| [Microsoft Fabric](microsoft-fabric.md) | Import Mode und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 6 |
| [Performance](performance.md) | Import Mode und Performance im selben Segment | Heuristik, gezählt |  | 6 |
| [Refresh](refresh.md) | Import Mode und Refresh im selben Segment | Heuristik, gezählt |  | 6 |
| [Lakehouse](lakehouse.md) | Import Mode und Lakehouse im selben Segment | Heuristik, gezählt |  | 6 |
| [DirectQuery](directquery.md) | Import Mode und DirectQuery im selben Segment | Heuristik, gezählt |  | 6 |
| [Warehouse](warehouse.md) | Import Mode und Warehouse im selben Segment | Heuristik, gezählt |  | 5 |
| [Power BI Desktop](power-bi-desktop.md) | Import Mode und Power BI Desktop im selben Segment | Heuristik, gezählt |  | 4 |
| [SQL](sql.md) | Import Mode und SQL im selben Segment | Heuristik, gezählt |  | 4 |
| [Delta Lake](delta-lake.md) | Import Mode und Delta Lake im selben Segment | Heuristik, gezählt |  | 4 |
| [OneLake](onelake.md) | Import Mode und OneLake im selben Segment | Heuristik, gezählt |  | 4 |
| [Composite Models](composite-models.md) | Import Mode und Composite Models im selben Segment | Heuristik, gezählt |  | 3 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 25:45 | auf die Sekunde | Ein Composite Model, das Kennzahlen aus einem zentralen Modell in ein zweites Direct-Lake-Modell uebernehmen soll, laesst sich nicht einfach als ein Direct-Lake-Modell mit zusaetzlichen Importtabellen bauen, sondern erfordert ein Composite Model ueber beide semantischen Modelle. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1545s) |
| Fakt | Fabric Planning unboxing | 2026-03 | 04:11 | auf die Sekunde | Für Direct Lake gab es weiterhin Probleme, während der Import-Modus über den SQL-Endpoint funktionierte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=251s) |
| Fakt | Denken in Tabellen | 2026-01 | 16:04 | auf die Sekunde | Wer über eine reine Live-Connection auf vorbereitete Views hinaus mehr Flexibilität will, landet meist beim Import-Modus und beginnt selbst zu modellieren. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=964s) |
| Fakt | BI Thinkers Talk n.72 | 2026-01 | 54:25 | auf die Sekunde | Für Import-Modelle gibt es in Deployment Pipelines eigene Deployment Rules, für Direct Lake dagegen nicht. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3265s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 18:43 | auf die Sekunde | Bei der Migration eines Importmodells zu Direct Lake wurde eine bisher per Power-Query-Abfrage angelegte Measure-Tabelle durch eine Calculated Table mit einer leeren Hilfsspalte ersetzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1123s) |
| Empfehlung | BI Thinkers Talk nr.67 | 2025-09 | 21:25 | auf die Sekunde | Ein bestehender Bericht wurde im Live-Connection-Modus aus dem Power-BI-Service heruntergeladen und anschließend über die Datenverbindung von seinem ursprünglichen Importmodell auf ein neu aufgebautes Direct-Lake-Modell mit identischen Measure-Namen umgestellt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1285s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 1:04:52 | auf die Sekunde | Die Kombination aus Direct Lake und Import Mode ist mittlerweile GA verfügbar und ermöglicht damit ein stabileres Composite-Modell. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3892s) |
| Fakt | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 48:21 | auf die Sekunde | Anders als im Import-Modus zeigt Direct Lake keine Speicherstatistik im Datenmodell an, solange keine Abfrage die Daten tatsächlich geladen hat. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2901s) |
| Fakt | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 1:04:40 | auf die Sekunde | Bei Direct Lake erfolgt die Aggregation, bevor Daten überhaupt in den Speicher geladen werden, was den Speicherbedarf gegenüber dem Import-Modus deutlich reduzieren kann. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=3880s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 33:13 | auf die Sekunde | Für eine Fabric-SQL-Datenbank ist Direct Lake nicht nutzbar, weshalb im Berichtsmodell Import oder DirectQuery verwendet werden muss. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1993s) |
| Meinung | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 11:02 | auf die Sekunde | Der aktuelle Preview-Stand der Composite Models über mehrere Lakehäuser verhält sich eher wie ein Import Mode ohne lange Ladezeiten, weil eigene Measures, Beziehungen und Row-Level Security noch fehlen. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=662s) |
| Meinung | Daten-WG Thinkers Talk n61 | 2025-04 | 36:02 | auf die Sekunde | Eine eigene Datumstabelle aus der Quelle ist vor allem bei DirectQuery relevant, damit Jahresfilter direkt an die Quelle weitergereicht werden können, statt alle passenden Einzeltage aufzuzählen; im Import Mode ist das wegen der Persistierung der Daten weniger entscheidend. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2162s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 03:01 | auf die Sekunde | Import-Semantikmodelle lassen sich inzwischen vollständig im Web bearbeiten. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=181s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 20:02 | auf die Sekunde | Im Projekt waren die Semantic Models keine Direct-Lake-, sondern klassische Import-Modelle. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1202s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 22:42 | auf die Sekunde | Für Row-Level-Security-Anforderungen im Import Mode wurden Warehouse-Views statt vollem Lake-House-Zugriff verwendet, was sich als performanter erwies als eine Notebook-Kopie. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1362s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 36:54 | auf die Sekunde | Mit dem Tabular Editor bzw. im TMDL-Code lassen sich schon inoffiziell Composite Models aus Import- und Direct-Lake-Tabellen bauen, bevor das offiziell in Power BI Desktop verfuegbar ist. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2214s) |
| Warnung | Fabric & Power BI Quarterly · 2025 Q3 |  | 38:17 | auf die Sekunde | Bei Translytical-Writeback in ein grosses Import-Modell mit aktiviertem Haken fuer automatische Aktualisierung nach dem Schreiben kann der Refresh eine Viertelstunde dauern. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2297s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 40:26 | auf die Sekunde | Bisher konnte ein Modell mit aktiviertem Incremental Refresh in Power BI Desktop nicht heruntergeladen werden, das ist inzwischen behoben. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2426s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Power BI Update Juli 2026](https://www.youtube.com/watch?v=7xYgX6lWhuQ) | 2026-07-01 | nur-zeitstempel | [02:42](https://www.youtube.com/watch?v=7xYgX6lWhuQ&t=162s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [08:20](https://www.youtube.com/watch?v=G8s96sHUHac&t=500s) · [19:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=1168s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | kernaussagen+zeitstempel | [21:17](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1277s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [06:11](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=371s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [40:19](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2419s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [10:33](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=633s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | kernaussagen+zeitstempel | [38:58](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2338s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | kernaussagen+zeitstempel | [35:04](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2104s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | kernaussagen+zeitstempel | [48:18](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=2898s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=03%20%C2%B7%20Semantische%20Modelle%20%26%20%2ADirect%20Lake%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Wie%20es%20funktioniert) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20den%20Fallback%20ausl%C3%B6st%20%28Direct%20Lake%20on%20SQL%29) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [46:04](https://www.youtube.com/watch?v=r416vanitYw&t=2764s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Dataflow%20Gen2%20%28Fabric%29) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Aimport-mode
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Aimport-mode&f=tool%3Aimport-mode
