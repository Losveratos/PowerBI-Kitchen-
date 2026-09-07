---
id: "tool:semantic-model"
name: "Semantic Model"
typ: tool
stand: "2026-09-07"
build: "20260907-1056"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 30
kernaussagen: 39
mit_kernaussagen: 12
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/semantic-model.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/semantic-model.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/semantic-model.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/semantic-model.json"
aliase:
  - "Semantikmodell"
  - "Semantic Models"
  - "Dataset"
  - "Datasets"
  - "semantisches Modell"
---

# Semantic Model

Über die DAX Query View ließ sich die KI triviale Measures für das Semantic Model anlegen. Zurückgeschriebene Planungswerte müssen erst wieder in das Semantic Model integriert werden, um sie im Modell nahezu in Echtzeit nutzen zu können. Row-Level Security für Planning-Objekte greift über das zugrunde liegende Semantic Model, das für den Zugriff genutzt wird.

## Aliase

Semantikmodell, Semantic Models, Dataset, Datasets, semantisches Modell

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Data Agent](data-agent.md) | setzt-voraus | belegt | 0 |
| [Planung](planung.md) | setzt-voraus | belegt | 9 |
| [IBCS](ibcs.md) | setzt-voraus | belegt | 0 |
| [Copilot](copilot.md) | setzt-voraus | belegt | 4 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 46 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 34 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 27 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 21 |
| [Workspace](workspace.md) | ko-vorkommen | heuristik | 20 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 20 |
| [Power BI Desktop](power-bi-desktop.md) | ko-vorkommen | heuristik | 18 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 18 |
| [Refresh](refresh.md) | ko-vorkommen | heuristik | 15 |
| [Sicherheit](sicherheit.md) | ko-vorkommen | heuristik | 12 |
| [Datenmodellierung](datenmodellierung.md) | ko-vorkommen | heuristik | 12 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk nr.75 | 03:08 | Alex hat den "Power BI Fixer" entwickelt, ein Notebook-basiertes Tool zum Analysieren und Reparieren von Power-BI-Semantikmodellen und -Berichten. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=188s) |
| Fakt | BI Thinkers Talk nr.75 | 06:19 | Der Power BI Fixer basiert auf einem Fork und übernimmt Komponenten wie Best Practice Analyser, Memory Analyser und Perspective Editor von Michael Kowalskis Semantic-Link-Labs-Arbeit. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=379s) |
| Fakt | BI Thinkers Talk nr.75 | 07:51 | Der Power BI Fixer bietet im Notebook eine alternative Oberfläche ähnlich Tabular Editor, um Measures und DAX-Ausdrücke direkt am Semantic Model zu bearbeiten und zu formatieren. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=471s) |
| Fakt | BI Thinkers Talk nr.75 | 10:58 | Der Fixer erkennt beim Hinzufügen einer Kalendertabelle automatisch, ob im Modell bereits eine vorhanden ist, und verhindert dadurch Duplikate. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=658s) |
| Fakt | BI Thinkers Talk nr.75 | 12:37 | Die Funktion "Fix IBCS Variance Chart" des Fixers fügt automatisiert rund 175 Measures für Labels, Deltas und Arrow-Bars in das Semantic Model ein. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=757s) |
| Fakt | BI Thinkers Talk nr.75 | 36:20 | Der Power BI Fixer kann den Best Practice Analyser auf dem Semantic Model ausführen und gefundene Verstöße direkt automatisiert fixen lassen. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2180s) |
| Fakt | BI Thinkers Talk nr.75 | 36:20 | Ein Perspective Editor und ein Translation Editor stehen in Power BI Desktop nativ nicht zur Verfügung und erfordern sonst Drittanbieter-Tools wie Tabular Editor. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2180s) |
| Warnung | BI Thinkers Talk nr.75 | 41:21 | Perspektiven in Analysis Services und Power BI bilden keine echte Sicherheitsgrenze ab, sodass Nutzer trotz eingeschränkter Perspektive weiterhin das komplette zugrunde liegende Modell nutzen können. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2481s) |
| Fakt | BI Thinkers Talk nr.75 | 44:31 | Der Fixer erlaubt es, einzelne Tabellen oder Partitionen eines Semantic Models gezielt zu aktualisieren, statt das gesamte Modell neu zu laden. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2671s) |
| Warnung | Fabric Planning unboxing | 03:06 | Die von der KI erstellten Tabellenbeziehungen waren automatisch bidirektional und mussten manuell korrigiert werden. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=186s) |
| Fakt | Fabric Planning unboxing | 04:42 | Über die DAX Query View ließ sich die KI triviale Measures für das Semantic Model anlegen. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=282s) |
| Fakt | BI Thinkers Talk n.74 | 16:05 | Nach einer Änderung der Copilot-Freigabeeinstellungen für ein Modell kann es einige Zeit dauern, bis die neuen Berechtigungen greifen, weil zunächst der Cache geleert werden muss. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=965s) |
| Fakt | BI Thinkers Talk n.74 | 24:19 | Die Berechtigung für den Zugriff von Copilot wird zentral am semantischen Modell gesetzt und von dort automatisch an Berichte und Apps vererbt. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1459s) |
| Warnung | BI Thinkers Talk n.74 | 27:27 | Das Explore-Feature ist nicht an die Build-Permission gekoppelt, sodass darüber Inhalte aus dem semantischen Modell zugänglich sein können, die im Bericht selbst nicht sichtbar sind. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1647s) |
| Fakt | Fabric Planning unboxing | 53:42 | Zurückgeschriebene Planungswerte müssen erst wieder in das Semantic Model integriert werden, um sie im Modell nahezu in Echtzeit nutzen zu können. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3222s) |
| Fakt | Fabric Planning unboxing | 1:18:48 | Row-Level Security für Planning-Objekte greift über das zugrunde liegende Semantic Model, das für den Zugriff genutzt wird. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=4728s) |
| Fakt | BI Thinkers Talk n.73 | 35:44 | Bei einem Direct-Lake-Modell bleibt das Semantic Model nach einem Deployment über eine Deployment Pipeline weiterhin mit dem Lakehouse der Testumgebung verbunden, die Datenquelle wird also nicht automatisch auf die Zielumgebung umgehängt. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2144s) |
| Fakt | BI Thinkers Talk n.73 | 40:39 | Eine Monitoring-Analyse zeigte, dass über zwei Drittel der Last auf einem produktiven Direct-Lake-Semantic-Model von Entwicklern in Power BI Desktop stammten und nicht von den eigentlichen Report-Nutzern. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2439s) |
| Fakt | BI Thinkers Talk n.73 | 48:33 | In der Power BI Service Web-Oberfläche gibt es aktuell keine Möglichkeit, die Datenquelle eines Reports direkt umzuhängen; das lässt sich nur nach dem Download im Power BI Desktop ändern. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2913s) |
| Empfehlung | BI Thinkers Talk n.73 | 50:24 | Als Alternative zum manuellen Umbinden über Power BI Desktop wird im Gespräch erwähnt, dass sich Reports auch automatisiert per Notebook mit Semantic Link umbinden lassen könnten. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3024s) |
| Warnung | BI Thinkers Talk n.73 | 52:04 | Ein im Power BI Service umgebundenes Semantic Model eines Reports wird bei einem erneuten Deployment über die Deployment Pipeline wieder auf die ursprüngliche Testquelle zurückgesetzt, sodass die Umbindung nach jedem Deployment wiederholt werden muss. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3124s) |
| Fakt | Power BI vs. Qlik | 08:52 | Beide Tools besitzen eine semantische Schicht mit Kennzahlen (KPIs bzw. Measures), die sie von reinen Tabellen- oder Skript-Analysen wie Excel, Python oder R unterscheidet. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=532s) |
| Meinung | Power BI vs. Qlik | 14:24 | Arthur sieht die Stärke von Power BI in der flexiblen semantischen Modellierung und dem einfachen Wechsel zwischen Frontend und Backend. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=864s) |
| Empfehlung | Power BI vs. Qlik | 18:01 | Für Self-Service empfiehlt Oliver ein vorbereitetes Sandkasten-Modell mit fertigen Measures und Dimensionen, das rund 80 bis 90 Prozent der Nutzeranfragen abdeckt. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=1081s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 35:19 | Fabric Data Agents nutzen bereits bestehende semantische Modelle als Kernfeature für ihre Funktionsweise. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=2119s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 45:42 | Ontologien lassen sich direkt aus bestehenden semantischen Modellen erstellen, um vorhandenes Modellwissen wiederzuverwenden. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=2742s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-1 | 47:15 | Für den Einstieg in Fabric IQ empfiehlt Gabi, zunächst aus einem bereits gut designten und bekannten semantischen Modell testweise eine Ontologie zu erstellen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=2835s) |
| Fakt | BI Thinkers Talk nr.71 | 31:56 | Spaltenbeschreibungen lassen sich in Power BI sowohl in der Modellansicht als auch in der TMDL-Ansicht hinterlegen. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1916s) |
| Fakt | BI Thinkers Talk nr.71 | 33:27 | Ein KI-Coding-Assistent kann direkt in einem Power-BI-Semantikmodell Measures schreiben und eine neue Tabellenstruktur anlegen. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2007s) |
| Warnung | BI Thinkers Talk nr.71 | 48:16 | Ein per MCP an ein Power-BI-Modell angebundener KI-Assistent kann laut den Sprechern nur Elemente verändern, die im TMDL-Modell abgebildet sind, nicht jedoch Inhalte im Report-Frontend. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2896s) |
| Fakt | BI Thinkers Talk nr.67 | 04:56 | Beim separaten Hochladen des semantischen Modells über die Fabric-Erweiterung werden die Daten nicht mitübertragen, sodass der Refresh anschließend im Power-BI-Service erfolgen muss. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=296s) |
| Fakt | BI Thinkers Talk nr.67 | 09:54 | In einer Power-BI-Projektdatei können mehrere Report-Verzeichnisse auf dasselbe semantische Modell zeigen, und Berichte lassen sich auch in einem anderen Workspace deployen als das zugehörige Modell. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=594s) |
| Fakt | BI Thinkers Talk nr.67 | 13:11 | Power BI Desktop wurde so gehärtet, dass es Codesegmente von Drittanbieter-Tools, die es selbst nicht versteht, ignoriert, statt wie früher etwa bei manuellen Partitionsdefinitionen mit einem Fehler abzubrechen. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=791s) |
| Fakt | BI Thinkers Talk nr.67 | 17:48 | Bei der Migration eines Importmodells zu Direct Lake wurde eine bisher per Power-Query-Abfrage angelegte Measure-Tabelle durch eine Calculated Table mit einer leeren Hilfsspalte ersetzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1068s) |
| Fakt | BI Thinkers Talk nr.67 | 22:57 | Rui Romano zeigte auf der FabCon, wie ein MCP-Server zusammen mit selbst geschriebenen Instruktions-Dokumenten genutzt wird, um per KI-Agent automatisch ein semantisches Modell samt Bericht generieren zu lassen. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1377s) |
| Empfehlung | 10 Jahre Power BI | 1:06:48 | Ein Teilnehmer empfiehlt, die per INFO-Funktionen abrufbaren Metadaten eines Semantic Models an eine KI zu übergeben, um datenschutzkonform bessere Measure-Vorschläge zu erhalten. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=4008s) |
| Fakt | BI Thinkers Talk Nr.62 | 1:00:53 | Beim Auslösen der Datenfunktion liest das semantische Modell offenbar alle Tabellen neu, nicht nur die betroffene, unabhängig vom Speichermodus. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3653s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-2 | 02:15 | Wiederverwertbare Berechnungslogik sollte dauerhaft ins Semantic Model statt in Visual Calculations gepackt werden, da Visual Calculations eher ein Shortcut sind. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=135s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? | 26:39 | Fabric schafft laut Artur unternehmensweite Transparenz, weil zentrale Experten dadurch mehrfach duplizierte semantische Modelle erkennen können. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1599s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [So hackst du einen Power BI Bericht \| Power BI Tutorial](https://www.youtube.com/watch?v=GKLxM3317Xk) | 2025-09-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=GKLxM3317Xk) · [Abschnitt](https://www.youtube.com/watch?v=GKLxM3317Xk) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [10:52](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=652s) · [20:19](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1219s) · [34:04](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2044s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [13:37](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=817s) · [18:22](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1102s) · [19:55](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1195s) |
| [Daten-WG Life-Update \| State of Power BI, Fabric & AI-Tools](https://www.youtube.com/watch?v=d3HdhRe_nK8) | 2026-06-01 | nur-zeitstempel | [18:34](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1114s) · [21:35](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1295s) · [22:14](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1334s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [04:56](https://www.youtube.com/watch?v=G8s96sHUHac&t=296s) · [19:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=1168s) · [21:03](https://www.youtube.com/watch?v=G8s96sHUHac&t=1263s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=03%20%C2%B7%20Semantische%20Modelle%20%26%20%2ADirect%20Lake%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Einstellungen%20pr%C3%BCfen) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Delta-Hygiene%20f%C3%BCr%20Direct%20Lake) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [05:02](https://www.youtube.com/watch?v=YzfcMurbWNc&t=302s) · [22:11](https://www.youtube.com/watch?v=YzfcMurbWNc&t=1331s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [51:02](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3062s) · [1:00:53](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3653s) · [1:02:29](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3749s) |
| [Daten-WG Special: Power BI vs. Qlik](https://www.youtube.com/watch?v=aYHk_V8n_CE) | 2025-10-01 | nur-zeitstempel | [27:12](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=1632s) · [32:07](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=1927s) · [33:59](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=2039s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [02:59](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=179s) · [40:16](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=2416s) · [43:30](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=2610s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [07:46](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=466s) |
| [Power BI Update August 2026](https://www.youtube.com/watch?v=GWCHNmLs72M) | 2026-08-01 | nur-zeitstempel | [03:51](https://www.youtube.com/watch?v=GWCHNmLs72M&t=231s) |
| [SharePoint direkt in Microsoft Fabric nutzen \| Lakehouse, Direct Lake & Power BI](https://www.youtube.com/watch?v=c-LWoo-O5PQ) | 2026-07-01 | nur-zeitstempel | [09:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=560s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Auto-Binding) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Wann%20lohnt%20sich%20ein%20Dataflow%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Was%20nur%20im%20Service%20geht) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [36:48](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2208s) · [38:43](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2323s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [08:27](https://www.youtube.com/watch?v=mTVeZzshLzE&t=507s) · [26:39](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1599s) |
| [Fabric Workload Demo mit Alexander Korn und Lukasz Obst](https://www.youtube.com/watch?v=e50qKdVn-24) | 2026-08-01 | nur-zeitstempel | [18:59](https://www.youtube.com/watch?v=e50qKdVn-24&t=1139s) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [15:17](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=917s) · [1:20:19](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=4819s) · [1:23:32](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=5012s) |
| [BI Thinkers Talk nr.75](https://www.youtube.com/watch?v=BQdSo6ZnmKY) | 2026-04-01 | kernaussagen+zeitstempel | [07:51](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=471s) · [51:19](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=3079s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [1:00:55](https://www.youtube.com/watch?v=iymmxuXHh44&t=3655s) · [1:02:29](https://www.youtube.com/watch?v=iymmxuXHh44&t=3749s) |
| [BI Thinkers Talk nr.77](https://www.youtube.com/watch?v=eWfTt93anl4) | — | nur-zeitstempel | [46:51](https://www.youtube.com/watch?v=eWfTt93anl4&t=2811s) · [53:05](https://www.youtube.com/watch?v=eWfTt93anl4&t=3185s) |
| [Daten-WG Special: Power BI vs. Qlik -part2](https://www.youtube.com/watch?v=_Vh5fDfHWz4) | 2025-10-01 | nur-zeitstempel | [05:18](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=318s) · [1:05:36](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=3936s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [03:18](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=198s) · [49:14](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2954s) |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) · [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | nur-zeitstempel | [26:46](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1606s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [08:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=508s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [48:33](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2913s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [47:15](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=2835s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [30:27](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1827s) |
| [Mensch bleiben, wenn Power BI geht](https://www.youtube.com/watch?v=iB4vHRvaErE) | 2025-11-01 | nur-zeitstempel | [15:11](https://www.youtube.com/watch?v=iB4vHRvaErE&t=911s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Asemantic-model
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Asemantic-model&f=tool%3Asemantic-model
