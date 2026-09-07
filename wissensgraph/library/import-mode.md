---
id: "tool:import-mode"
name: "Import Mode"
typ: tool
stand: "2026-09-07"
build: "20260907-1012"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 12
kernaussagen: 7
mit_kernaussagen: 5
aliase:
  - "Importmodus"
  - "Import-Modus"
---

# Import Mode

Bei der Migration eines Importmodells zu Direct Lake wurde eine bisher per Power-Query-Abfrage angelegte Measure-Tabelle durch eine Calculated Table mit einer leeren Hilfsspalte ersetzt. Die Kombination aus Direct Lake und Import Mode ist mittlerweile GA verfügbar und ermöglicht damit ein stabileres Composite-Modell. Für Direct Lake gab es weiterhin Probleme, während der Import-Modus über den SQL-Endpoint funktionierte.

## Aliase

Importmodus, Import-Modus

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Direct Lake](direct-lake.md) | gegensatz | belegt | 6 |
| [Direct Lake](direct-lake.md) | ersetzt | belegt | 6 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 8 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 6 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 6 |
| [Refresh](refresh.md) | ko-vorkommen | heuristik | 6 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 6 |
| [DirectQuery](directquery.md) | ko-vorkommen | heuristik | 6 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 5 |
| [Power BI Desktop](power-bi-desktop.md) | ko-vorkommen | heuristik | 4 |
| [Delta Lake](delta-lake.md) | ko-vorkommen | heuristik | 4 |
| [OneLake](onelake.md) | ko-vorkommen | heuristik | 4 |
| [Composite Models](composite-models.md) | ko-vorkommen | heuristik | 3 |
| [Row-Level Security](row-level-security.md) | ko-vorkommen | heuristik | 3 |
| [Sicherheit](sicherheit.md) | ko-vorkommen | heuristik | 3 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | Fabric Planning unboxing | 03:06 | Für Direct Lake gab es weiterhin Probleme, während der Import-Modus über den SQL-Endpoint funktionierte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=186s) |
| Fakt | Denken in Tabellen | 15:33 | Wer über eine reine Live-Connection auf vorbereitete Views hinaus mehr Flexibilität will, landet meist beim Import-Modus und beginnt selbst zu modellieren. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=933s) |
| Fakt | BI Thinkers Talk n.72 | 53:54 | Für Import-Modelle gibt es in Deployment Pipelines eigene Deployment Rules, für Direct Lake dagegen nicht. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3234s) |
| Fakt | BI Thinkers Talk nr.67 | 17:48 | Bei der Migration eines Importmodells zu Direct Lake wurde eine bisher per Power-Query-Abfrage angelegte Measure-Tabelle durch eine Calculated Table mit einer leeren Hilfsspalte ersetzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1068s) |
| Empfehlung | BI Thinkers Talk nr.67 | 21:03 | Ein bestehender Bericht wurde im Live-Connection-Modus aus dem Power-BI-Service heruntergeladen und anschließend über die Datenverbindung von seinem ursprünglichen Importmodell auf ein neu aufgebautes Direct-Lake-Modell mit identischen Measure-Namen umgestellt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1263s) |
| Fakt | BI Thinkers Talk nr.67 | 1:03:47 | Die Kombination aus Direct Lake und Import Mode ist mittlerweile GA verfügbar und ermöglicht damit ein stabileres Composite-Modell. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3827s) |
| Fakt | BI Thinkers Talk Nr.62 | 31:47 | Für eine Fabric-SQL-Datenbank ist Direct Lake nicht nutzbar, weshalb im Berichtsmodell Import oder DirectQuery verwendet werden muss. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1907s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Power BI Update Juli 2026](https://www.youtube.com/watch?v=7xYgX6lWhuQ) | 2026-07-01 | nur-zeitstempel | [02:42](https://www.youtube.com/watch?v=7xYgX6lWhuQ&t=162s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [08:20](https://www.youtube.com/watch?v=G8s96sHUHac&t=500s) · [19:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=1168s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [21:17](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1277s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [06:11](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=371s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [40:19](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2419s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [10:33](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=633s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [38:58](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2338s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [35:04](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2104s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [48:18](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=2898s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=03%20%C2%B7%20Semantische%20Modelle%20%26%20%2ADirect%20Lake%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Wie%20es%20funktioniert) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20den%20Fallback%20ausl%C3%B6st%20%28Direct%20Lake%20on%20SQL%29) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [46:04](https://www.youtube.com/watch?v=r416vanitYw&t=2764s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Dataflow%20Gen2%20%28Fabric%29) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Aimport-mode
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Aimport-mode&f=tool%3Aimport-mode
