---
id: "tool:onelake"
name: "OneLake"
typ: tool
stand: "2026-09-07"
build: "20260907-1056"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 14
kernaussagen: 22
mit_kernaussagen: 7
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/onelake.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/onelake.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/onelake.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/onelake.json"
aliase:
  - "One Lake"
---

# OneLake

Microsoft Fabric besteht im Kern aus zwei wesentlichen Komponenten: der Kapazität, die man in Azure bucht, und dem OneLake, in dem die Daten liegen und verwaltet werden. Ein Arbeitsbereich wird einer Kapazität zugeordnet, und innerhalb dieses Arbeitsbereichs werden Artefakte und Daten entsprechend im OneLake abgelegt. Die Rechenleistung, die innerhalb eines Arbeitsbereichs zum Arbeiten mit den Daten im OneLake genutzt wird, stammt aus der zugeordneten Fabric-Kapazität.

## Aliase

One Lake

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Mirroring](mirroring.md) | setzt-voraus | belegt | 16 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 57 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 42 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 34 |
| [Delta Lake](delta-lake.md) | ko-vorkommen | heuristik | 31 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 29 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 25 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 25 |
| [DirectQuery](directquery.md) | ko-vorkommen | heuristik | 22 |
| [Fabric Capacity](fabric-capacity.md) | ko-vorkommen | heuristik | 21 |
| [Data Pipeline](data-pipeline.md) | ko-vorkommen | heuristik | 18 |
| [Snowflake](snowflake.md) | ko-vorkommen | heuristik | 18 |
| [Workspace](workspace.md) | ko-vorkommen | heuristik | 15 |
| [Notebook](notebook.md) | ko-vorkommen | heuristik | 15 |
| [Echtzeit](echtzeit.md) | ko-vorkommen | heuristik | 14 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Empfehlung | LogiMAT Arena Atrium 2026 \| Expert Forum - Supply Chain Risiko Management | 16:01 | Statt sofort eine komplexe Architektur mit Machine Learning aufzubauen, empfiehlt es sich, zunächst nur die ERP-Daten täglich in ein Warehouse oder OneLake zu laden. | [▶](https://www.youtube.com/watch?v=DFw664hd1IE&t=961s) |
| Meinung | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 00:02 | Die im gehörten Podcast getroffene Aussage, dass Fabric-Daten im OneLake stets in der Home-Region des Tenants liegen, ist nur teilweise richtig. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=2s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 00:26 | Microsoft Fabric besteht im Kern aus zwei wesentlichen Komponenten: der Kapazität, die man in Azure bucht, und dem OneLake, in dem die Daten liegen und verwaltet werden. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=26s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 00:26 | Ein Arbeitsbereich wird einer Kapazität zugeordnet, und innerhalb dieses Arbeitsbereichs werden Artefakte und Daten entsprechend im OneLake abgelegt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=26s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 00:26 | Die Rechenleistung, die innerhalb eines Arbeitsbereichs zum Arbeiten mit den Daten im OneLake genutzt wird, stammt aus der zugeordneten Fabric-Kapazität. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=26s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 01:19 | Verschiebt man die Rechenleistung einer Kapazität in eine andere Region, verschiebt sich dadurch auch der Ablageort der zugehörigen Daten im OneLake. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=79s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 01:19 | Bestimmte Szenarien erfordern, dass Daten aus rechtlichen oder regulatorischen Gründen in einem bestimmten Land oder einer bestimmten Region abgelegt und verarbeitet werden. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=79s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 01:57 | Laut einem Microsoft-Blogartikel zum OneLake gibt es pro Tenant nur ein OneLake, das aber lediglich den zentralen Zugangspunkt darstellt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=117s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 01:57 | Die tatsächlichen Daten werden laut dem Microsoft-Blogartikel in der Region gespeichert, in der die zugeordnete Kapazität liegt, und nicht zwingend in der Region des Tenants. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=117s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 02:34 | Workspaces können in unterschiedlichen Regionen liegen, etwa manche im US-Bereich und andere in Europa, wobei die Daten jeweils in der Region gespeichert sind, in der der Workspace angelegt wurde. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=154s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 03:16 | Ordnet man einen Arbeitsbereich einer Kapazität zu, werden die zugehörigen Daten im OneLake tatsächlich in der Region gespeichert, in der die Kapazität liegt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=196s) |
| Warnung | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 03:16 | Verschiebt man einen Arbeitsbereich zwischen Kapazitäten in unterschiedlichen Regionen, müssen die zugrunde liegenden Daten tatsächlich in die neue Region überführt werden, es ist also kein reiner Wechsel der Rechenleistung. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=196s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 03:57 | OneLake existiert pro Tenant nur einmal und beschreibt die Gesamtumgebung, während der tatsächliche Ablageort der Daten durch die Region der jeweils gehosteten Kapazität gesteuert wird. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=237s) |
| Fakt | Power BI Update März 2026 | 06:21 | Direct Lake auf OneLake ist jetzt allgemein verfügbar und damit der neue Standard für Direct Lake. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=381s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 01:54 | Beim Open-Mirroring-Datenfluss wird der Datensatz mit Row-Marker-Event zunächst nach OneLake geschrieben, von wo Fabric eine identische Replik-Tabelle aufbaut. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=114s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 06:45 | Der Sync-Prozess schreibt die replizierten Daten in Paketdateien und lädt sie in Batches mit Wartezeit zwischen den Schritten nach Fabric hoch. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=405s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 05:15 | Ein direktes Schreiben aus SSIS in den OneLake-Speicher ist aktuell nicht möglich, weil der mitgelieferte Connector diese Einstellung noch nicht unterstützt. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=315s) |
| Fakt | BI Thinkers Talk nr.67 | 55:58 | Mirroring in Microsoft Fabric enthält kostenlosen Speicherplatz proportional zur gebuchten Kapazität, etwa 64 TB bei einer F64-Kapazität, inklusive der automatischen Transformation in Tabellenformat. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |
| Fakt | BI Thinkers Talk nr.67 | 55:58 | Beim Mirroring von Databricks-Daten werden nur die Metadaten gespiegelt, weil Fabric direkt auf denselben zugrunde liegenden Speicher wie OneLake oder ADLS Gen2 zugreift, den Databricks bereits nutzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 | 26:53 | Fabric bietet jetzt bidirektionale Shortcut-Integrationen mit Snowflake und Databricks. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1613s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 | 28:37 | OneLake Security stellt dieselben Zugriffsinformationen sowohl nativen Fabric-Workloads als auch Third-Party-Workloads zur Verfügung. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1717s) |
| Warnung | Fabric & Power BI Quarterly · 2026-2 | 31:59 | Komplexere Sicherheitsszenarien wie dynamische Row-Level Security und Dynamic Data Masking fehlen in OneLake Security noch und stehen auf der Roadmap. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1919s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=02%20%C2%B7%20Architektur%20%26%20%2Azentrale%20Komponenten%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Das%20%E2%80%9EOne%20Copy%22-Prinzip) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20drei%20Plattform-Schichten%20unter%20den%20Workloads) |
| [Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake?](https://www.youtube.com/watch?v=ZVVSPQj9dlc) | 2026-03-01 | kernaussagen+zeitstempel | [00:26](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=26s) |
| [Power BI Update Juli 2025](https://www.youtube.com/watch?v=TkxwcAyBGUM) | 2025-07-01 | nur-zeitstempel | [06:09](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=369s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [54:26](https://www.youtube.com/watch?v=G8s96sHUHac&t=3266s) · [55:58](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) · [57:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=3448s) |
| [Power BI Update August 2026](https://www.youtube.com/watch?v=GWCHNmLs72M) | 2026-08-01 | nur-zeitstempel | [05:57](https://www.youtube.com/watch?v=GWCHNmLs72M&t=357s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [08:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=508s) · [32:41](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1961s) |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [05:15](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=315s) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [01:10](https://www.youtube.com/watch?v=YzfcMurbWNc&t=70s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | nur-zeitstempel | [26:46](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1606s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Was%20Power-BI-Nutzer%20wissen%20m%C3%BCssen) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Fabric%20vs.%20klassisches%20Power%20BI) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Direct%20Lake%20%28Fabric%29) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [53:23](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=3203s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | nur-zeitstempel | [23:47](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1427s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [30:48](https://www.youtube.com/watch?v=iymmxuXHh44&t=1848s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [42:49](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2569s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Aonelake
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Aonelake&f=tool%3Aonelake
