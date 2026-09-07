---
id: "tool:databricks"
name: "Databricks"
typ: tool
stand: "2026-09-07"
build: "20260907-1012"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 6
kernaussagen: 5
mit_kernaussagen: 4
aliase: []
---

# Databricks

Eine aus Databricks stammende Flat Table führte in Power BI zu Problemen mit einer unsauberen Zeitachse und zu wenig flexiblen Darstellungen, die zunächst mit Field Parameters adressiert wurden. Databricks-Entwickler ohne Analysis-Services-Datenbank lösen den Bedarf an mehrtabelligem Fachanwender-Zugriff häufig über eine gejointe View statt über ein relationales Modell. Beim Mirroring von Databricks-Daten werden nur die Metadaten gespiegelt, weil Fabric direkt auf denselben zugrunde liegenden Speicher wie OneLake oder ADLS Gen2 zugreift, den Databricks bereits nutzt.

## Aliase

Keine weiteren Schreibweisen hinterlegt.

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 3 |
| [Azure](azure.md) | ko-vorkommen | heuristik | 3 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | Denken in Tabellen | 00:27 | Eine aus Databricks stammende Flat Table führte in Power BI zu Problemen mit einer unsauberen Zeitachse und zu wenig flexiblen Darstellungen, die zunächst mit Field Parameters adressiert wurden. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=27s) |
| Fakt | Denken in Tabellen | 04:19 | Databricks-Entwickler ohne Analysis-Services-Datenbank lösen den Bedarf an mehrtabelligem Fachanwender-Zugriff häufig über eine gejointe View statt über ein relationales Modell. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=259s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-1 | 25:03 | Gespiegelte Daten in Fabric zu nutzen ist günstiger, als DirectQuery direkt gegen große Lake-Systeme wie Snowflake oder Databricks zu fahren, weil dort pro Abfrage Rechenkosten anfallen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1503s) |
| Fakt | BI Thinkers Talk nr.67 | 55:58 | Beim Mirroring von Databricks-Daten werden nur die Metadaten gespiegelt, weil Fabric direkt auf denselben zugrunde liegenden Speicher wie OneLake oder ADLS Gen2 zugreift, den Databricks bereits nutzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 | 26:53 | Fabric bietet jetzt bidirektionale Shortcut-Integrationen mit Snowflake und Databricks. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1613s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [The Power of User Groups](https://www.youtube.com/watch?v=SSUpe1JON9Y) | 2025-10-01 | nur-zeitstempel | [03:47](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=227s) · [30:25](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=1825s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [04:19](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=259s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | nur-zeitstempel | [06:12](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=372s) |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20ist%20das%3F) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Adatabricks
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Adatabricks&f=tool%3Adatabricks
