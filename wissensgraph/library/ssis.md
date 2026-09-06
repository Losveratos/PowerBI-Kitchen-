---
id: "tool:ssis"
name: "SSIS"
typ: tool
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 6
kernaussagen: 18
mit_kernaussagen: 2
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

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 00:01 | Aus einem Integration-Services-Paket (SSIS) lässt sich per REST API ein Microsoft-Fabric-Notebook starten. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=1s) |
| Empfehlung | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 00:01 | Der Notebook-Aufruf eignet sich, um nach dem Hochladen von On-Premises-Daten Richtung Fabric direkt eine Weiterverarbeitung anzustoßen. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=1s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 00:30 | Im SSIS-Paket wird der Notebook-Aufruf über eine Script Task in Visual Studio umgesetzt. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=30s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 03:07 | Im SSIS-Paket wird für den Notebook-Aufruf ein eigener Script Task angelegt, dem Variablen bzw. Parameter übergeben werden. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=187s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 03:26 | Die Projektparameter im SSIS-Paket enthalten Client ID, Tenant und Client Secret des Service Principals. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=206s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 03:52 | Die Paketvariablen im SSIS-Paket speichern Workspace-ID und Notebook-ID für den REST-API-Aufruf. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=232s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 04:12 | Die definierten Variablen werden vor der Skriptausführung an den Script Task übergeben. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=252s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 04:49 | Für die HTTP-Kommunikation mit der REST API müssen im Script Task Verweise auf HTTP- und Web-Bibliotheken ergänzt werden. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=289s) |
| Empfehlung | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 06:11 | Die vorgestellte Lösung ermöglicht es, Daten per SSIS von einer lokalen Umgebung nach Fabric zu bringen und anschließend automatisiert per Notebook zu importieren. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=371s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 00:41 | SQL Server Integration Services wird genutzt, um Daten in das Fabric Warehouse zu bringen. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=41s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 01:06 | Deshalb erfolgt das Bewegen der Daten dateibasiert statt über einzelne SQL-Inserts. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=66s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 01:15 | In der Zielarchitektur schreiben die Integration Services die Daten aus der On-Premises-Umgebung zunächst in ein Azure Storage, von wo sie ins Warehouse oder Lakehouse geladen werden können. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=75s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 01:46 | Für die Zusammenarbeit von Integration Services mit Azure-Komponenten wird das Azure Feature Pack für SSIS benötigt. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=106s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 03:26 | Für das empfohlene Paketformat in SSIS-Projekten wird zusätzlich eine Java-Installation über Zulu OpenJDK oder die Oracle Java Runtime benötigt. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=206s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 04:13 | Im SSIS-Datenfluss wird über eine Quelle eine SQL-Datenbank verbunden und darüber ausgewählt, welche Tabelle und Spalten geladen werden. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=253s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 05:15 | Ein direktes Schreiben aus SSIS in den OneLake-Speicher ist aktuell nicht möglich, weil der mitgelieferte Connector diese Einstellung noch nicht unterstützt. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=315s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 05:15 | Stattdessen müssen die Daten aus SSIS in einen Azure Blob Storage bzw. ein Storage Account mit entsprechendem Container geschrieben werden. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=315s) |
| Empfehlung | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 11:02 | Der Push-Schritt lässt sich als zusätzlicher Arbeitsschritt in bereits bestehende lokale SSIS-Pakete integrieren, die am Ende Ergebnisdateien nach Fabric hochladen. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=662s) |

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
