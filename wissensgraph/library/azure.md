---
id: "tool:azure"
name: "Azure"
typ: tool
stand: "2026-09-07"
build: "20260907-1922"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 19
kernaussagen: 15
mit_kernaussagen: 6
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/azure.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/azure.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/azure.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/azure.json"
aliase:
  - "Microsoft Azure"
---

# Azure

In der Zielarchitektur schreiben die Integration Services die Daten aus der On-Premises-Umgebung zunächst in ein Azure Storage, von wo sie ins Warehouse oder Lakehouse geladen werden können. Für die Zusammenarbeit von Integration Services mit Azure-Komponenten wird das Azure Feature Pack für SSIS benötigt. Stattdessen müssen die Daten aus SSIS in einen Azure Blob Storage bzw. ein Storage Account mit entsprechendem Container geschrieben werden.

## Aliase

Microsoft Azure

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [SSIS](ssis.md) | setzt-voraus | belegt | 5 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 33 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 19 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 15 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 14 |
| [Data Pipeline](data-pipeline.md) | ko-vorkommen | heuristik | 13 |
| [SQL Server](sql-server.md) | ko-vorkommen | heuristik | 12 |
| [OneLake](onelake.md) | ko-vorkommen | heuristik | 12 |
| [Workspace](workspace.md) | ko-vorkommen | heuristik | 10 |
| [Dataflow](dataflow.md) | ko-vorkommen | heuristik | 10 |
| [Azure Maps](azure-maps.md) | ko-vorkommen | heuristik | 9 |
| [Fabric Capacity](fabric-capacity.md) | ko-vorkommen | heuristik | 9 |
| [Synapse](synapse.md) | ko-vorkommen | heuristik | 9 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 8 |
| [Eventhouse](eventhouse.md) | ko-vorkommen | heuristik | 8 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 00:28 | auf die Sekunde | Microsoft Fabric besteht im Kern aus zwei wesentlichen Komponenten: der Kapazität, die man in Azure bucht, und dem OneLake, in dem die Daten liegen und verwaltet werden. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=28s) |
| Empfehlung | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 01:14 | auf die Sekunde | Im Azure-Portal kann die Region für die Kapazität auch manuell anders gewählt werden, wenn Daten und Rechenleistung woanders verortet werden sollen. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=74s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 01:19 | Abschnittsanfang | Eine Fabric-Kapazität kann in unterschiedlichen Azure-Regionen angelegt werden. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=79s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 02:58 | auf die Sekunde | Beim Buchen einer Kapazität im Azure-Portal ist die Region standardmäßig auf die Region des Tenants voreingestellt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=178s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 01:53 | auf die Sekunde | Für die Authentifizierung wird im Tenant eine App-Registrierung mit zugehörigem Service Principal angelegt. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=113s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 03:23 | auf die Sekunde | Die Projektparameter im SSIS-Paket enthalten Client ID, Tenant und Client Secret des Service Principals. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=203s) |
| Fakt | Prinzipien oder Paragrafen | 2026-02 | 05:28 | auf die Sekunde | Der Produktionsstandort ist Bestandteil der pharmazeutischen Zulassung, weshalb eine digitale Freigabe in einem Cloud-Rechenzentrum in einem anderen Land formal nicht dem zugelassenen Standort entspricht. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=328s) |
| Fakt | BI Thinkers Talk n.72 | 2026-01 | 34:23 | auf die Sekunde | Ein aktueller Fabric-Ausfall betraf offenbar nur bestimmte Azure-Regionen, da Kunden in West Europe Probleme hatten, während der eigene Tenant in North Europe nicht betroffen war. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2063s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 01:20 | auf die Sekunde | In der Zielarchitektur schreiben die Integration Services die Daten aus der On-Premises-Umgebung zunächst in ein Azure Storage, von wo sie ins Warehouse oder Lakehouse geladen werden können. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=80s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 01:45 | auf die Sekunde | Für die Zusammenarbeit von Integration Services mit Azure-Komponenten wird das Azure Feature Pack für SSIS benötigt. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=105s) |
| Empfehlung | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 02:54 | auf die Sekunde | Für die Verbindung zu Azure-Komponenten muss die Verschlüsselung per Registry-Eintrag auf TLS 1.2 gesetzt werden. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=174s) |
| Warnung | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 03:15 | auf die Sekunde | Fehlt der TLS-1.2-Registry-Eintrag, lässt sich die Verbindung zwar testen, die spätere Ausführung des Pakets schlägt aber mit einem Fehler fehl. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=195s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 05:40 | auf die Sekunde | Stattdessen müssen die Daten aus SSIS in einen Azure Blob Storage bzw. ein Storage Account mit entsprechendem Container geschrieben werden. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=340s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 06:58 | auf die Sekunde | Bei der Azure-Verbindung in SSIS gibt es bislang keine eigene Umgebungsoption für Fabric, sondern nur Azure Default sowie die Sonderbereiche China und US Government. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=418s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 09:27 | auf die Sekunde | Datenfunktionen in Fabric funktionieren im Prinzip wie Azure Functions innerhalb von Fabric. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=567s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [01:15](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=75s) · [01:46](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=106s) · [05:15](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=315s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20Fabric%20nicht%20ersetzt) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=01%20%C2%B7%20Einordnung%20von%20%2AMicrosoft%20Fabric%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Das%20Problem%20davor) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | nur-zeitstempel | [02:04](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=124s) · [06:12](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=372s) · [15:02](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=902s) |
| [The Power of User Groups](https://www.youtube.com/watch?v=SSUpe1JON9Y) | 2025-10-01 | nur-zeitstempel | [26:45](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=1605s) · [28:45](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=1725s) |
| [Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial](https://www.youtube.com/watch?v=7j34Ndng0Os) | 2026-01-01 | kernaussagen+zeitstempel | [05:20](https://www.youtube.com/watch?v=7j34Ndng0Os&t=320s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [01:35](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=95s) · [21:31](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1291s) · [38:01](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2281s) |
| [Power BI: (Vertriebs-) Regionen in Azure Maps](https://www.youtube.com/watch?v=CvaOkO37HMU) | 2026-01-01 | kernaussagen+zeitstempel | [00:02](https://www.youtube.com/watch?v=CvaOkO37HMU&t=2s) · [24:49](https://www.youtube.com/watch?v=CvaOkO37HMU&t=1489s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [48:46](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2926s) · [50:35](https://www.youtube.com/watch?v=lZvpCBMKASM&t=3035s) · [52:08](https://www.youtube.com/watch?v=lZvpCBMKASM&t=3128s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [08:08](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=488s) · [14:29](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=869s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [23:11](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1391s) · [37:56](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2276s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Wann%20brauche%20ich%20ein%20Gateway%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datenbank-Quellen%20%C2%B7%20der%20Folding-Hebel) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=03%20%C2%B7%20Deep%20Dive%3A%20%2AQuery%20Folding%2A) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [00:34](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=34s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [28:07](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=1687s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [25:03](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1503s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [49:58](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2998s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [48:35](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2915s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [1:02:10](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=3730s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [54:44](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=3284s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [08:16](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=496s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Aazure
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Aazure&f=tool%3Aazure
