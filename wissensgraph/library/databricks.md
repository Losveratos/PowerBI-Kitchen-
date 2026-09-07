---
id: "tool:databricks"
name: "Databricks"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 6
kernaussagen: 8
mit_kernaussagen: 7
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/databricks.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/databricks.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/databricks.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/databricks.json"
aliase: []
---

# Databricks

Eine aus Databricks stammende Flat Table führte in Power BI zu Problemen mit einer unsauberen Zeitachse und zu wenig flexiblen Darstellungen, die zunächst mit Field Parameters adressiert wurden. (Stand 2026-01) Databricks-Entwickler ohne Analysis-Services-Datenbank lösen den Bedarf an mehrtabelligem Fachanwender-Zugriff häufig über eine gejointe View statt über ein relationales Modell. (Stand 2026-01) Beim Mirroring von Databricks-Daten werden nur die Metadaten gespiegelt, weil Fabric direkt auf denselben zugrunde liegenden Speicher wie OneLake oder ADLS Gen2 zugreift, den Databricks bereits nutzt. (Stand 2025-09)

## Aliase

Keine weiteren Schreibweisen hinterlegt.

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Power BI](power-bi.md) | Databricks und Power BI im selben Segment | Heuristik, gezählt |  | 3 |
| [Azure](azure.md) | Databricks und Azure im selben Segment | Heuristik, gezählt |  | 3 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Denken in Tabellen | 2026-01 | 00:30 | auf die Sekunde | Eine aus Databricks stammende Flat Table führte in Power BI zu Problemen mit einer unsauberen Zeitachse und zu wenig flexiblen Darstellungen, die zunächst mit Field Parameters adressiert wurden. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=30s) |
| Fakt | Denken in Tabellen | 2026-01 | 04:19 | Abschnittsanfang | Databricks-Entwickler ohne Analysis-Services-Datenbank lösen den Bedarf an mehrtabelligem Fachanwender-Zugriff häufig über eine gejointe View statt über ein relationales Modell. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=259s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 25:32 | auf die Sekunde | Gespiegelte Daten in Fabric zu nutzen ist günstiger, als DirectQuery direkt gegen große Lake-Systeme wie Snowflake oder Databricks zu fahren, weil dort pro Abfrage Rechenkosten anfallen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1532s) |
| Meinung | Unboxing MCP Server for Power BI Modelling | 2025-12 | 15:52 | auf die Sekunde | Es wird als zukünftige Möglichkeit gesehen, dass MCP-Server von Snowflake, Databricks oder SAP miteinander reden und Daten direkt nach Fabric schieben könnten. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=952s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 55:58 | Abschnittsanfang | Beim Mirroring von Databricks-Daten werden nur die Metadaten gespiegelt, weil Fabric direkt auf denselben zugrunde liegenden Speicher wie OneLake oder ADLS Gen2 zugreift, den Databricks bereits nutzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 15:24 | auf die Sekunde | Fabric Mirroring unterstützt offiziell Snowflake und Databricks über deren eigene Delta-/Job-Mechanismen, lässt sich über Open Mirroring aber auch für eigene Datenquellen erweitern, wenn Inserts, Updates und Deletes entsprechend gekennzeichnet werden. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=924s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 |  | 24:59 | auf die Sekunde | Fabric bietet jetzt bidirektionale Shortcut-Integrationen mit Snowflake und Databricks. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1499s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 28:30 | auf die Sekunde | Mit Snowflake Mirroring lassen sich Snowflake-Datenbanken als Kopie in Fabric einziehen, während eine Databricks-Verbindung per Link wie ein Shortcut funktioniert, ohne die Daten zu kopieren. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1710s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [The Power of User Groups](https://www.youtube.com/watch?v=SSUpe1JON9Y) | 2025-10-01 | nur-zeitstempel | [03:47](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=227s) · [30:25](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=1825s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [04:19](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=259s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | kernaussagen+zeitstempel | [06:12](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=372s) |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20ist%20das%3F) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Adatabricks
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Adatabricks&f=tool%3Adatabricks
