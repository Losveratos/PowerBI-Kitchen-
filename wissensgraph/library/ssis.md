---
id: "tool:ssis"
name: "SSIS"
typ: tool
stand: "2026-09-07"
build: "20260907-1922"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 6
kernaussagen: 18
mit_kernaussagen: 2
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/ssis.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/ssis.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/ssis.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/ssis.json"
aliase:
  - "Integration Services"
---

# SSIS

SQL Server Integration Services wird genutzt, um Daten in das Fabric Warehouse zu bringen. Deshalb erfolgt das Bewegen der Daten dateibasiert statt über einzelne SQL-Inserts. In der Zielarchitektur schreiben die Integration Services die Daten aus der On-Premises-Umgebung zunächst in ein Azure Storage, von wo sie ins Warehouse oder Lakehouse geladen werden können.

## Aliase

Integration Services

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Azure](azure.md) | setzt-voraus | belegt | 5 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 7 |
| [Notebook](notebook.md) | ko-vorkommen | heuristik | 5 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 5 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 3 |
| [Gateway](gateway.md) | ko-vorkommen | heuristik | 3 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 3 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 00:01 | Abschnittsanfang | Aus einem Integration-Services-Paket (SSIS) lässt sich per REST API ein Microsoft-Fabric-Notebook starten. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=1s) |
| Empfehlung | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 00:08 | auf die Sekunde | Der Notebook-Aufruf eignet sich, um nach dem Hochladen von On-Premises-Daten Richtung Fabric direkt eine Weiterverarbeitung anzustoßen. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=8s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 00:33 | auf die Sekunde | Im SSIS-Paket wird der Notebook-Aufruf über eine Script Task in Visual Studio umgesetzt. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=33s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 03:10 | auf die Sekunde | Im SSIS-Paket wird für den Notebook-Aufruf ein eigener Script Task angelegt, dem Variablen bzw. Parameter übergeben werden. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=190s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 03:14 | auf die Sekunde | Für die HTTP-Kommunikation mit der REST API müssen im Script Task Verweise auf HTTP- und Web-Bibliotheken ergänzt werden. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=194s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 03:23 | auf die Sekunde | Die Projektparameter im SSIS-Paket enthalten Client ID, Tenant und Client Secret des Service Principals. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=203s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 03:52 | Abschnittsanfang | Die Paketvariablen im SSIS-Paket speichern Workspace-ID und Notebook-ID für den REST-API-Aufruf. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=232s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 04:05 | auf die Sekunde | Die definierten Variablen werden vor der Skriptausführung an den Script Task übergeben. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=245s) |
| Empfehlung | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 06:23 | auf die Sekunde | Die vorgestellte Lösung ermöglicht es, Daten per SSIS von einer lokalen Umgebung nach Fabric zu bringen und anschließend automatisiert per Notebook zu importieren. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=383s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 00:39 | auf die Sekunde | SQL Server Integration Services wird genutzt, um Daten in das Fabric Warehouse zu bringen. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=39s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 01:00 | auf die Sekunde | Deshalb erfolgt das Bewegen der Daten dateibasiert statt über einzelne SQL-Inserts. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=60s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 01:20 | auf die Sekunde | In der Zielarchitektur schreiben die Integration Services die Daten aus der On-Premises-Umgebung zunächst in ein Azure Storage, von wo sie ins Warehouse oder Lakehouse geladen werden können. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=80s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 01:45 | auf die Sekunde | Für die Zusammenarbeit von Integration Services mit Azure-Komponenten wird das Azure Feature Pack für SSIS benötigt. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=105s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 03:25 | auf die Sekunde | Für das empfohlene Paketformat in SSIS-Projekten wird zusätzlich eine Java-Installation über Zulu OpenJDK oder die Oracle Java Runtime benötigt. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=205s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 04:56 | auf die Sekunde | Im SSIS-Datenfluss wird über eine Quelle eine SQL-Datenbank verbunden und darüber ausgewählt, welche Tabelle und Spalten geladen werden. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=296s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 05:22 | auf die Sekunde | Ein direktes Schreiben aus SSIS in den OneLake-Speicher ist aktuell nicht möglich, weil der mitgelieferte Connector diese Einstellung noch nicht unterstützt. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=322s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 05:40 | auf die Sekunde | Stattdessen müssen die Daten aus SSIS in einen Azure Blob Storage bzw. ein Storage Account mit entsprechendem Container geschrieben werden. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=340s) |
| Empfehlung | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 11:13 | auf die Sekunde | Der Push-Schritt lässt sich als zusätzlicher Arbeitsschritt in bereits bestehende lokale SSIS-Pakete integrieren, die am Ende Ergebnisdateien nach Fabric hochladen. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=673s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [01:15](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=75s) · [01:46](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=106s) · [03:26](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=206s) |
| [SSIS Integration Services: Microsoft Fabric Notebook per REST API starten](https://www.youtube.com/watch?v=NvtZ-ehiTrg) | 2026-02-01 | kernaussagen+zeitstempel | [00:01](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=1s) · [00:30](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=30s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [07:50](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=470s) |
| [Daten-WG Life-Update \| State of Power BI, Fabric & AI-Tools](https://www.youtube.com/watch?v=d3HdhRe_nK8) | 2026-06-01 | nur-zeitstempel | [00:44](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=44s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | nur-zeitstempel | [45:48](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2748s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Bausteine) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Bausteine) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Assis
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Assis&f=tool%3Assis
