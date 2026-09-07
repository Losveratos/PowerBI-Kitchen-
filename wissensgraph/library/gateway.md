---
id: "tool:gateway"
name: "Gateway"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 11
kernaussagen: 7
mit_kernaussagen: 5
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/gateway.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/gateway.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/gateway.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/gateway.json"
aliase:
  - "Data Gateway"
  - "On-Premises Data Gateway"
---

# Gateway

Für den Zugriff auf eine On-Premises-Datenquelle wird für Fabric derselbe Gateway-Typ genutzt wie für Power BI. (Stand 2025-05) Bei Azure Data Factory heißt das Gateway-Äquivalent Integration Runtime, eine andere Software als der Gateway für Power BI und Fabric. (Stand 2025-05) Die Anbindung einer On-Premises-Datenbank an Fabric über ein Gateway soll als offener Punkt in einer Folgesession gezeigt werden. (Stand 2025-05)

## Aliase

Data Gateway, On-Premises Data Gateway

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Microsoft Fabric](microsoft-fabric.md) | Microsoft Fabric setzt-voraus Gateway | automatisch extrahiert, Quellenstelle vorhanden | „Wie kriegen wir eine Onprem Datenbank äh über ein Gateway nach Fabric?“ (Daten-WG Deep Dive Financial Reporting, 2025-05) | 13 |
| [Azure Data Factory](azure-data-factory.md) | Azure Data Factory gegensatz Gateway | automatisch extrahiert, Quellenstelle vorhanden | „Ich glaube bei der bei der Data Factory heiß das Ding Integration Runtime.“ (Daten-WG Deep Dive Financial Reporting, 2025-05) | 0 |
| [OneLake](onelake.md) | OneLake ersetzt Gateway | automatisch extrahiert, Quellenstelle vorhanden | „ich musste auch lokal keine ähm kein Data Gateway installieren“ (Daten-WG Thinkers Talk nr.65, 2025-07) | 0 |
| [Power BI](power-bi.md) | Gateway und Power BI im selben Segment | Heuristik, gezählt |  | 12 |
| [SQL](sql.md) | Gateway und SQL im selben Segment | Heuristik, gezählt |  | 6 |
| [Reporting](reporting.md) | Gateway und Reporting im selben Segment | Heuristik, gezählt |  | 6 |
| [Premium](premium.md) | Gateway und Premium im selben Segment | Heuristik, gezählt |  | 6 |
| [Data Pipeline](data-pipeline.md) | Gateway und Data Pipeline im selben Segment | Heuristik, gezählt |  | 5 |
| [Refresh](refresh.md) | Gateway und Refresh im selben Segment | Heuristik, gezählt |  | 5 |
| [Performance](performance.md) | Gateway und Performance im selben Segment | Heuristik, gezählt |  | 4 |
| [Dataflow](dataflow.md) | Gateway und Dataflow im selben Segment | Heuristik, gezählt |  | 4 |
| [Lakehouse](lakehouse.md) | Gateway und Lakehouse im selben Segment | Heuristik, gezählt |  | 4 |
| [Warehouse](warehouse.md) | Gateway und Warehouse im selben Segment | Heuristik, gezählt |  | 4 |
| [Workspace](workspace.md) | Gateway und Workspace im selben Segment | Heuristik, gezählt |  | 4 |
| [Azure](azure.md) | Gateway und Azure im selben Segment | Heuristik, gezählt |  | 4 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 06:45 | auf die Sekunde | Beim Navision-Projekt wird ein Data Gateway benoetigt, weil das On-Premises-System nicht direkt mit Power BI beziehungsweise Fabric verbunden werden kann. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=405s) |
| Meinung | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 10:58 | auf die Sekunde | Ein Vorteil des Push-Prinzips ist, dass kein Eingriff aus der Cloud in das lokale Netzwerk über ein Data Gateway nötig ist. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=658s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 26:14 | auf die Sekunde | Beim Push von Daten per Python-Skript in den OneLake werden im Gegensatz zum Zugriff über ein Data Gateway keine Fabric-CUs für das Abholen der Daten belastet. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1574s) |
| Fakt | Daten-WG Deep Dive Financial Reporting | 2025-05 | 43:52 | auf die Sekunde | Für den Zugriff auf eine On-Premises-Datenquelle wird für Fabric derselbe Gateway-Typ genutzt wie für Power BI. | [▶](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2632s) |
| Fakt | Daten-WG Deep Dive Financial Reporting | 2025-05 | 45:06 | auf die Sekunde | Bei Azure Data Factory heißt das Gateway-Äquivalent Integration Runtime, eine andere Software als der Gateway für Power BI und Fabric. | [▶](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2706s) |
| Fakt | Daten-WG Deep Dive Financial Reporting | 2025-05 | 59:05 | auf die Sekunde | Die Anbindung einer On-Premises-Datenbank an Fabric über ein Gateway soll als offener Punkt in einer Folgesession gezeigt werden. | [▶](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3545s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 32:06 | auf die Sekunde | Im Bereich Data Integration wurde Support für Mirroring in Kombination mit On-Premises- und Virtual-Network-Data-Gateways ergänzt, um gesicherten Zugriff auf firewallgeschützte Quellen zu ermöglichen. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1926s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | kernaussagen+zeitstempel | [42:34](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2554s) · [44:08](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2648s) · [58:36](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3516s) |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [11:02](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=662s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [24:40](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1480s) · [26:13](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1573s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Embedded) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Zwei%20Gateway-Modi) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Updates%20einplanen) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [06:11](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=371s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [30:50](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1850s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [15:02](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=902s) |
| [Daten-WG Special: Power BI vs. Qlik](https://www.youtube.com/watch?v=aYHk_V8n_CE) | 2025-10-01 | kernaussagen+zeitstempel | [16:01](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=961s) |
| [Daten-WG Special: Power BI vs. Qlik -part2](https://www.youtube.com/watch?v=_Vh5fDfHWz4) | 2025-10-01 | nur-zeitstempel | [22:02](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=1322s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Wohin%20Shortcuts%20zeigen%20k%C3%B6nnen) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Bausteine) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20er%20kann) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [18:22](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=1102s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Agateway
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Agateway&f=tool%3Agateway
