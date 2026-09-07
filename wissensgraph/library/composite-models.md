---
id: "tool:composite-models"
name: "Composite Models"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 5
kernaussagen: 7
mit_kernaussagen: 4
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/composite-models.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/composite-models.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/composite-models.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/composite-models.json"
aliase:
  - "Composite Model"
  - "zusammengesetzte Modelle"
---

# Composite Models

Mit dem Tabular Editor bzw. im TMDL-Code lassen sich schon inoffiziell Composite Models aus Import- und Direct-Lake-Tabellen bauen, bevor das offiziell in Power BI Desktop verfuegbar ist. Composite Models sollen kuenftig die Moeglichkeit bieten, Direct-Lake-Tabellen aus mehreren Lakehouses zu kombinieren, ohne mehr zwingend ueber den einen zentralen SQL-Endpunkt konsumieren zu muessen. Ein Composite Model, das Kennzahlen aus einem zentralen Modell in ein zweites Direct-Lake-Modell uebernehmen soll, laesst sich nicht einfach als ein Direct-Lake-Modell mit zusaetzlichen Importtabellen bauen, sondern erfordert ein Composite Model ueber beide semantischen Modelle. (Stand 2026-08)

## Aliase

Composite Model, zusammengesetzte Modelle

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Tabular Editor](tabular-editor.md) | Composite Models setzt-voraus Tabular Editor | automatisch extrahiert, Quellenstelle vorhanden | „Mit dem Tabula Editor können wir quasi ... die Next Generation Composite Models mehr oder weniger bauen aus Import und Direct Lake“ (Fabric & Power BI Quarterly · 2025 Q3) | 0 |
| [SQL Endpoint](sql-endpoint.md) | Composite Models ersetzt SQL Endpoint | automatisch extrahiert, Quellenstelle vorhanden | „die Möglichkeit bietet Direct Lake Tabellen aus nicht mehr über den Sequel Endpunkt konsumieren zu müssen“ (Fabric & Power BI Quarterly · 2025 Q3) | 0 |
| [OneLake](onelake.md) | Composite Models setzt-voraus OneLake | automatisch extrahiert, Quellenstelle vorhanden | „Composite Model wird das erst, wenn dann quasi diese große Änderung, die ja auch angekündigt wurde mit Oneelake Security“ (Fabric & Power BI Quarterly \| 2025 Q2, 2025-04) | 0 |
| [Semantic Model](semantic-model.md) | Composite Models setzt-voraus Semantic Model | automatisch extrahiert, Quellenstelle vorhanden | „ich glaube, du kannst es über zwei Composite oder kannst ein Composite Modelle auf beide semantische Modelle setzen“ (Daten-WG Life-Update \| Fabric Architekturen, 2026-08) | 0 |
| [Direct Lake](direct-lake.md) | Direct Lake teil-von Composite Models | automatisch extrahiert, Quellenstelle vorhanden | „Direct Lake plus Import, dann eine Art stabiles Composite Modell“ (BI Thinkers Talk nr.67, 2025-09) | 5 |
| [Performance](performance.md) | Composite Models und Performance im selben Segment | Heuristik, gezählt |  | 5 |
| [DirectQuery](directquery.md) | Composite Models und DirectQuery im selben Segment | Heuristik, gezählt |  | 4 |
| [Power BI Desktop](power-bi-desktop.md) | Composite Models und Power BI Desktop im selben Segment | Heuristik, gezählt |  | 4 |
| [Refresh](refresh.md) | Composite Models und Refresh im selben Segment | Heuristik, gezählt |  | 4 |
| [Datenmodellierung](datenmodellierung.md) | Composite Models und Datenmodellierung im selben Segment | Heuristik, gezählt |  | 3 |
| [Import Mode](import-mode.md) | Composite Models und Import Mode im selben Segment | Heuristik, gezählt |  | 3 |
| [Power BI](power-bi.md) | Composite Models und Power BI im selben Segment | Heuristik, gezählt |  | 3 |
| [Lakehouse](lakehouse.md) | Composite Models und Lakehouse im selben Segment | Heuristik, gezählt |  | 3 |
| [Row-Level Security](row-level-security.md) | Composite Models und Row-Level Security im selben Segment | Heuristik, gezählt |  | 3 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Warnung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 24:00 | auf die Sekunde | Werden zentral verwaltete Daten ueber Composite Models durch laenderspezifische Excel-Mappings angereichert, kann daraus ein sehr performance-schwaches Konstrukt entstehen. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1440s) |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 25:45 | auf die Sekunde | Ein Composite Model, das Kennzahlen aus einem zentralen Modell in ein zweites Direct-Lake-Modell uebernehmen soll, laesst sich nicht einfach als ein Direct-Lake-Modell mit zusaetzlichen Importtabellen bauen, sondern erfordert ein Composite Model ueber beide semantischen Modelle. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1545s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 1:04:52 | auf die Sekunde | Die Kombination aus Direct Lake und Import Mode ist mittlerweile GA verfügbar und ermöglicht damit ein stabileres Composite-Modell. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3892s) |
| Meinung | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 11:02 | auf die Sekunde | Der aktuelle Preview-Stand der Composite Models über mehrere Lakehäuser verhält sich eher wie ein Import Mode ohne lange Ladezeiten, weil eigene Measures, Beziehungen und Row-Level Security noch fehlen. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=662s) |
| Meinung | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 12:05 | auf die Sekunde | Echte Composite Models werden erst mit der angekündigten OneLake Security möglich, weil dann Berechtigungen aus verschiedenen Quellen mitgezogen werden können. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=725s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 36:54 | auf die Sekunde | Mit dem Tabular Editor bzw. im TMDL-Code lassen sich schon inoffiziell Composite Models aus Import- und Direct-Lake-Tabellen bauen, bevor das offiziell in Power BI Desktop verfuegbar ist. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2214s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 39:13 | auf die Sekunde | Composite Models sollen kuenftig die Moeglichkeit bieten, Direct-Lake-Tabellen aus mehreren Lakehouses zu kombinieren, ohne mehr zwingend ueber den einen zentralen SQL-Endpunkt konsumieren zu muessen. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2353s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [10:33](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=633s) · [12:06](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=726s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | kernaussagen+zeitstempel | [36:51](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2211s) · [38:58](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2338s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [08:40](https://www.youtube.com/watch?v=r416vanitYw&t=520s) · [42:48](https://www.youtube.com/watch?v=r416vanitYw&t=2568s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [22:06](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1326s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Dataflow%20Gen2%20%28Fabric%29) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Test) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=DirectQuery) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Acomposite-models
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Acomposite-models&f=tool%3Acomposite-models
