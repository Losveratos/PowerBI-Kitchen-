---
id: "tool:semantic-model"
name: "Semantic Model"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 30
kernaussagen: 55
mit_kernaussagen: 24
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

Über die DAX Query View ließ sich die KI triviale Measures für das Semantic Model anlegen. (Stand 2026-03) Row-Level Security für Planning-Objekte greift über das zugrunde liegende Semantic Model, das für den Zugriff genutzt wird. (Stand 2026-03) Zurückgeschriebene Planungswerte müssen erst wieder in das Semantic Model integriert werden, um sie im Modell nahezu in Echtzeit nutzen zu können. (Stand 2026-03)

## Aliase

Semantikmodell, Semantic Models, Dataset, Datasets, semantisches Modell

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Data Agent](data-agent.md) | Data Agent setzt-voraus Semantic Model | automatisch extrahiert, Quellenstelle vorhanden | „Data Agents klassische Fabric Data Agents ... basierend auf den bereits bestehenden Möglichkeiten wie semantischen Modellen z.B. an der Stelle als Kernfeature zu arbeiten“ (Fabric & Power BI Quarterly · 2026-1, 2026-01) | 0 |
| [TMDL](tmdl.md) | TMDL teil-von Semantic Model | automatisch extrahiert, Quellenstelle vorhanden | „um die äh Anprogrammierbarkeit von semantischen Modellen an der Stelle zu verbessern“ (Fabric & Power BI Quarterly · 2025 Q3) | 0 |
| [Composite Models](composite-models.md) | Composite Models setzt-voraus Semantic Model | automatisch extrahiert, Quellenstelle vorhanden | „ich glaube, du kannst es über zwei Composite oder kannst ein Composite Modelle auf beide semantische Modelle setzen“ (Daten-WG Life-Update \| Fabric Architekturen, 2026-08) | 0 |
| [Planung](planung.md) | Planung setzt-voraus Semantic Model | automatisch extrahiert, Quellenstelle vorhanden | „muss ich ja schon die Zieltabellen einbinden und Bedarf auch ein bisschen mehr, also Datenmodellierung“ (Fabric Planning unboxing, 2026-03) | 9 |
| [IBCS](ibcs.md) | IBCS setzt-voraus Semantic Model | automatisch extrahiert, Quellenstelle vorhanden | „wir wollen eigentlich eine Berichtsänderung, aber dazu braucht Modeländerung“ (BI Thinkers Talk nr.75, 2026-04) | 0 |
| [Copilot](copilot.md) | Copilot setzt-voraus Semantic Model | automatisch extrahiert, Quellenstelle vorhanden | „es gibt aber diese Einstellung für den Copilot nur an dem Dataset und von da aus wird's weiter vererbt“ (BI Thinkers Talk n.74, 2026-03) | 4 |
| [Eventhouse](eventhouse.md) | Eventhouse gegensatz Semantic Model | automatisch extrahiert, Quellenstelle vorhanden | „die Abfrage wird dem Eventhaus zugerechnet und nicht dem Dataset“ (BI Thinkers Talk nr.64, 2025-07) | 0 |
| [Power BI](power-bi.md) | Semantic Model und Power BI im selben Segment | Heuristik, gezählt |  | 46 |
| [Microsoft Fabric](microsoft-fabric.md) | Semantic Model und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 34 |
| [Reporting](reporting.md) | Semantic Model und Reporting im selben Segment | Heuristik, gezählt |  | 27 |
| [Direct Lake](direct-lake.md) | Semantic Model und Direct Lake im selben Segment | Heuristik, gezählt |  | 21 |
| [Workspace](workspace.md) | Semantic Model und Workspace im selben Segment | Heuristik, gezählt |  | 20 |
| [Lakehouse](lakehouse.md) | Semantic Model und Lakehouse im selben Segment | Heuristik, gezählt |  | 20 |
| [Power BI Desktop](power-bi-desktop.md) | Semantic Model und Power BI Desktop im selben Segment | Heuristik, gezählt |  | 18 |
| [Performance](performance.md) | Semantic Model und Performance im selben Segment | Heuristik, gezählt |  | 18 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Fabric Workload Demo mit Alexander Korn und Lukasz Obst | 2026-08 | 06:49 | auf die Sekunde | Der Model Explorer aus dem Power BI Fixer ist auch im Developer Hub enthalten und zeigt die geladenen semantischen Modelle in einer Ordnerstruktur. | [▶](https://www.youtube.com/watch?v=e50qKdVn-24&t=409s) |
| Fakt | Fabric Workload Demo mit Alexander Korn und Lukasz Obst | 2026-08 | 19:06 | auf die Sekunde | Aus einem unspezifischen Prompt hat der Agent Hub eigenstaendig ein Notebook, ein Lakehouse, ein Semantic Model und einen Report erstellt, inklusive eines selbst geschriebenen Fabric Clients fuer die Fabric-APIs. | [▶](https://www.youtube.com/watch?v=e50qKdVn-24&t=1146s) |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 25:45 | auf die Sekunde | Ein Composite Model, das Kennzahlen aus einem zentralen Modell in ein zweites Direct-Lake-Modell uebernehmen soll, laesst sich nicht einfach als ein Direct-Lake-Modell mit zusaetzlichen Importtabellen bauen, sondern erfordert ein Composite Model ueber beide semantischen Modelle. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1545s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 03:12 | auf die Sekunde | Alex hat den "Power BI Fixer" entwickelt, ein Notebook-basiertes Tool zum Analysieren und Reparieren von Power-BI-Semantikmodellen und -Berichten. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=192s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 06:48 | auf die Sekunde | Der Power BI Fixer basiert auf einem Fork und übernimmt Komponenten wie Best Practice Analyser, Memory Analyser und Perspective Editor von Michael Kowalskis Semantic-Link-Labs-Arbeit. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=408s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 08:56 | auf die Sekunde | Der Power BI Fixer bietet im Notebook eine alternative Oberfläche ähnlich Tabular Editor, um Measures und DAX-Ausdrücke direkt am Semantic Model zu bearbeiten und zu formatieren. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=536s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 10:57 | auf die Sekunde | Der Fixer erkennt beim Hinzufügen einer Kalendertabelle automatisch, ob im Modell bereits eine vorhanden ist, und verhindert dadurch Duplikate. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=657s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 28:35 | auf die Sekunde | Die Funktion "Fix IBCS Variance Chart" des Fixers fügt automatisiert rund 175 Measures für Labels, Deltas und Arrow-Bars in das Semantic Model ein. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1715s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 37:06 | auf die Sekunde | Der Power BI Fixer kann den Best Practice Analyser auf dem Semantic Model ausführen und gefundene Verstöße direkt automatisiert fixen lassen. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2226s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 37:32 | auf die Sekunde | Ein Perspective Editor und ein Translation Editor stehen in Power BI Desktop nativ nicht zur Verfügung und erfordern sonst Drittanbieter-Tools wie Tabular Editor. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2252s) |
| Warnung | BI Thinkers Talk nr.75 | 2026-04 | 42:46 | auf die Sekunde | Perspektiven in Analysis Services und Power BI bilden keine echte Sicherheitsgrenze ab, sodass Nutzer trotz eingeschränkter Perspektive weiterhin das komplette zugrunde liegende Modell nutzen können. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2566s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 45:13 | auf die Sekunde | Der Fixer erlaubt es, einzelne Tabellen oder Partitionen eines Semantic Models gezielt zu aktualisieren, statt das gesamte Modell neu zu laden. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2713s) |
| Warnung | Fabric Planning unboxing | 2026-03 | 04:39 | auf die Sekunde | Die von der KI erstellten Tabellenbeziehungen waren automatisch bidirektional und mussten manuell korrigiert werden. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=279s) |
| Fakt | Fabric Planning unboxing | 2026-03 | 04:47 | auf die Sekunde | Über die DAX Query View ließ sich die KI triviale Measures für das Semantic Model anlegen. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=287s) |
| Fakt | BI Thinkers Talk n.74 | 2026-03 | 16:05 | Abschnittsanfang | Nach einer Änderung der Copilot-Freigabeeinstellungen für ein Modell kann es einige Zeit dauern, bis die neuen Berechtigungen greifen, weil zunächst der Cache geleert werden muss. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=965s) |
| Fakt | Fabric Planning unboxing | 2026-03 | 21:51 | auf die Sekunde | Row-Level Security für Planning-Objekte greift über das zugrunde liegende Semantic Model, das für den Zugriff genutzt wird. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1311s) |
| Warnung | BI Thinkers Talk n.74 | 2026-03 | 25:38 | auf die Sekunde | Das Explore-Feature ist nicht an die Build-Permission gekoppelt, sodass darüber Inhalte aus dem semantischen Modell zugänglich sein können, die im Bericht selbst nicht sichtbar sind. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1538s) |
| Fakt | BI Thinkers Talk n.74 | 2026-03 | 27:50 | auf die Sekunde | Die Berechtigung für den Zugriff von Copilot wird zentral am semantischen Modell gesetzt und von dort automatisch an Berichte und Apps vererbt. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1670s) |
| Fakt | Fabric Planning unboxing | 2026-03 | 55:22 | auf die Sekunde | Zurückgeschriebene Planungswerte müssen erst wieder in das Semantic Model integriert werden, um sie im Modell nahezu in Echtzeit nutzen zu können. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3322s) |
| Fakt | BI Thinkers Talk n.73 | 2026-02 | 35:44 | Abschnittsanfang | Bei einem Direct-Lake-Modell bleibt das Semantic Model nach einem Deployment über eine Deployment Pipeline weiterhin mit dem Lakehouse der Testumgebung verbunden, die Datenquelle wird also nicht automatisch auf die Zielumgebung umgehängt. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2144s) |
| Fakt | BI Thinkers Talk n.73 | 2026-02 | 41:16 | auf die Sekunde | Eine Monitoring-Analyse zeigte, dass über zwei Drittel der Last auf einem produktiven Direct-Lake-Semantic-Model von Entwicklern in Power BI Desktop stammten und nicht von den eigentlichen Report-Nutzern. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2476s) |
| Fakt | BI Thinkers Talk n.73 | 2026-02 | 47:49 | auf die Sekunde | In der Power BI Service Web-Oberfläche gibt es aktuell keine Möglichkeit, die Datenquelle eines Reports direkt umzuhängen; das lässt sich nur nach dem Download im Power BI Desktop ändern. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2869s) |
| Empfehlung | BI Thinkers Talk n.73 | 2026-02 | 51:29 | auf die Sekunde | Als Alternative zum manuellen Umbinden über Power BI Desktop wird im Gespräch erwähnt, dass sich Reports auch automatisiert per Notebook mit Semantic Link umbinden lassen könnten. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3089s) |
| Warnung | BI Thinkers Talk n.73 | 2026-02 | 52:04 | Abschnittsanfang | Ein im Power BI Service umgebundenes Semantic Model eines Reports wird bei einem erneuten Deployment über die Deployment Pipeline wieder auf die ursprüngliche Testquelle zurückgesetzt, sodass die Umbindung nach jedem Deployment wiederholt werden muss. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3124s) |
| Fakt | Power BI vs. Qlik | 2026-01 | 09:17 | auf die Sekunde | Beide Tools besitzen eine semantische Schicht mit Kennzahlen (KPIs bzw. Measures), die sie von reinen Tabellen- oder Skript-Analysen wie Excel, Python oder R unterscheidet. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=557s) |
| Meinung | Power BI vs. Qlik | 2026-01 | 14:39 | auf die Sekunde | Arthur sieht die Stärke von Power BI in der flexiblen semantischen Modellierung und dem einfachen Wechsel zwischen Frontend und Backend. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=879s) |
| Empfehlung | Power BI vs. Qlik | 2026-01 | 16:34 | auf die Sekunde | Für Self-Service empfiehlt Oliver ein vorbereitetes Sandkasten-Modell mit fertigen Measures und Dimensionen, das rund 80 bis 90 Prozent der Nutzeranfragen abdeckt. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=994s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 35:39 | auf die Sekunde | Fabric Data Agents nutzen bereits bestehende semantische Modelle als Kernfeature für ihre Funktionsweise. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=2139s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 47:28 | auf die Sekunde | Ontologien lassen sich direkt aus bestehenden semantischen Modellen erstellen, um vorhandenes Modellwissen wiederzuverwenden. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=2848s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 47:28 | auf die Sekunde | Für den Einstieg in Fabric IQ empfiehlt Gabi, zunächst aus einem bereits gut designten und bekannten semantischen Modell testweise eine Ontologie zu erstellen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=2848s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 31:56 | Abschnittsanfang | Spaltenbeschreibungen lassen sich in Power BI sowohl in der Modellansicht als auch in der TMDL-Ansicht hinterlegen. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1916s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 33:34 | auf die Sekunde | Ein KI-Coding-Assistent kann direkt in einem Power-BI-Semantikmodell Measures schreiben und eine neue Tabellenstruktur anlegen. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2014s) |
| Warnung | BI Thinkers Talk nr.71 | 2025-12 | 48:16 | Abschnittsanfang | Ein per MCP an ein Power-BI-Modell angebundener KI-Assistent kann laut den Sprechern nur Elemente verändern, die im TMDL-Modell abgebildet sind, nicht jedoch Inhalte im Report-Frontend. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2896s) |
| Fakt | Daten-WG Special: Power BI vs. Qlik | 2025-10 | 33:57 | auf die Sekunde | In Power BI existieren semantisches Modell und Bericht als zwei getrennte Objekte, waehrend beides in Qlik in einer gemeinsamen App zusammengefasst ist. | [▶](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=2037s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 05:09 | auf die Sekunde | Beim separaten Hochladen des semantischen Modells über die Fabric-Erweiterung werden die Daten nicht mitübertragen, sodass der Refresh anschließend im Power-BI-Service erfolgen muss. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=309s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 10:54 | auf die Sekunde | In einer Power-BI-Projektdatei können mehrere Report-Verzeichnisse auf dasselbe semantische Modell zeigen, und Berichte lassen sich auch in einem anderen Workspace deployen als das zugehörige Modell. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=654s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 13:12 | auf die Sekunde | Power BI Desktop wurde so gehärtet, dass es Codesegmente von Drittanbieter-Tools, die es selbst nicht versteht, ignoriert, statt wie früher etwa bei manuellen Partitionsdefinitionen mit einem Fehler abzubrechen. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=792s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 18:43 | auf die Sekunde | Bei der Migration eines Importmodells zu Direct Lake wurde eine bisher per Power-Query-Abfrage angelegte Measure-Tabelle durch eine Calculated Table mit einer leeren Hilfsspalte ersetzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1123s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 22:55 | auf die Sekunde | Rui Romano zeigte auf der FabCon, wie ein MCP-Server zusammen mit selbst geschriebenen Instruktions-Dokumenten genutzt wird, um per KI-Agent automatisch ein semantisches Modell samt Bericht generieren zu lassen. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1375s) |
| Empfehlung | Why Passion Beats Niche | 2025-09 | 27:38 | auf die Sekunde | Für Echtzeitanalysen nicht mehr relevante ältere Daten können laut Brian Bønk nach OneLake ausgelagert und im Lakehouse als Basis für ein semantisches Modell genutzt werden. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1658s) |
| Fakt | Daten-WG BI Thinkers Talk nr.66 | 2025-08 | 14:39 | auf die Sekunde | Im Notebook muss man angeben, mit welchem Ziel-Dataset im Workspace der übertragene Bericht verbunden werden soll. | [▶](https://www.youtube.com/watch?v=DQENmzAkNqw&t=879s) |
| Meinung | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 41:30 | auf die Sekunde | Das automatische Standarddatenmodell in Fabric wird demnächst abgeschafft, was im Video begrüßt wird, da es selten brauchbar gewesen sei. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2490s) |
| Warnung | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 1:03:25 | auf die Sekunde | Von impliziten Measures wird für den Dauereinsatz abgeraten, auch wenn sie für schnelle Tests praktisch sind. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=3805s) |
| Meinung | Daten-WG Thinkers Talk nr.65 | 2025-07 | 33:18 | auf die Sekunde | MCP-Server machen es möglich, semantische Modelle per Code über LLMs zu nutzen, was in der Community bereits als Mainstream gilt. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1998s) |
| Empfehlung | 10 Jahre Power BI | 2025-07 | 1:06:48 | Abschnittsanfang | Ein Teilnehmer empfiehlt, die per INFO-Funktionen abrufbaren Metadaten eines Semantic Models an eine KI zu übergeben, um datenschutzkonform bessere Measure-Vorschläge zu erhalten. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=4008s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 1:01:23 | auf die Sekunde | Beim Auslösen der Datenfunktion liest das semantische Modell offenbar alle Tabellen neu, nicht nur die betroffene, unabhängig vom Speichermodus. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3683s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 09:29 | auf die Sekunde | Die neue Direct-Lake-Variante verbindet sich nicht mehr über den SQL-Endpoint des Lakehouses, sondern direkt mit den Delta-Tabellen im OneLake. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=569s) |
| Meinung | Buttons, Drilling, Navigation und Dynamisches Filtern in einem Power BI Report | 2022-02 | 14:16 | auf die Sekunde | Eine sinnvolle Strukturierung der Daten im Datenmodell wird als Grundvoraussetzung dafür beschrieben, die Daten sinnvoll auswerten zu können. | [▶](https://www.youtube.com/watch?v=K27nB68nR1M&t=856s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-2 |  | 02:46 | auf die Sekunde | Wiederverwertbare Berechnungslogik sollte dauerhaft ins Semantic Model statt in Visual Calculations gepackt werden, da Visual Calculations eher ein Shortcut sind. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=166s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 03:51 | auf die Sekunde | Live-Editing von Direct-Lake-Semantikmodellen ist sowohl im Power BI Service als auch in Power BI Desktop GA. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=231s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 04:46 | auf die Sekunde | Das Editieren von Semantikmodellen im Web soll mit dem September-Release auch in Power BI Desktop funktionieren. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=286s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 13:35 | auf die Sekunde | TMDL ist als Community-Projekt von Matthias Terbach entstanden und hat in Rekordzeit den Weg zu einem offiziell unterstuetzten Bestandteil des Produkts inklusive TMDL View geschafft. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=815s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 20:02 | auf die Sekunde | Im Projekt waren die Semantic Models keine Direct-Lake-, sondern klassische Import-Modelle. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1202s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? |  | 27:11 | auf die Sekunde | Fabric schafft laut Artur unternehmensweite Transparenz, weil zentrale Experten dadurch mehrfach duplizierte semantische Modelle erkennen können. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1631s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 41:50 | auf die Sekunde | Durch das Desktop-Hardening von Microsoft koennen jetzt auch semantische Modelle in Power BI Desktop geoeffnet werden, die zuvor im Service oder mit Third-Party-Tools veraendert wurden und sich dadurch nicht mehr oeffnen liessen. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2510s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [So hackst du einen Power BI Bericht \| Power BI Tutorial](https://www.youtube.com/watch?v=GKLxM3317Xk) | 2025-09-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=GKLxM3317Xk) · [Abschnitt](https://www.youtube.com/watch?v=GKLxM3317Xk) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [10:52](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=652s) · [20:19](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1219s) · [34:04](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2044s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | kernaussagen+zeitstempel | [13:37](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=817s) · [18:22](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1102s) · [19:55](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1195s) |
| [Daten-WG Life-Update \| State of Power BI, Fabric & AI-Tools](https://www.youtube.com/watch?v=d3HdhRe_nK8) | 2026-06-01 | nur-zeitstempel | [18:34](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1114s) · [21:35](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1295s) · [22:14](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1334s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [04:56](https://www.youtube.com/watch?v=G8s96sHUHac&t=296s) · [19:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=1168s) · [21:03](https://www.youtube.com/watch?v=G8s96sHUHac&t=1263s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=03%20%C2%B7%20Semantische%20Modelle%20%26%20%2ADirect%20Lake%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Einstellungen%20pr%C3%BCfen) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Delta-Hygiene%20f%C3%BCr%20Direct%20Lake) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [05:02](https://www.youtube.com/watch?v=YzfcMurbWNc&t=302s) · [22:11](https://www.youtube.com/watch?v=YzfcMurbWNc&t=1331s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [51:02](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3062s) · [1:00:53](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3653s) · [1:02:29](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3749s) |
| [Daten-WG Special: Power BI vs. Qlik](https://www.youtube.com/watch?v=aYHk_V8n_CE) | 2025-10-01 | kernaussagen+zeitstempel | [27:12](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=1632s) · [32:07](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=1927s) · [33:59](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=2039s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | kernaussagen+zeitstempel | [02:59](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=179s) · [40:16](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=2416s) · [43:30](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=2610s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [07:46](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=466s) |
| [Power BI Update August 2026](https://www.youtube.com/watch?v=GWCHNmLs72M) | 2026-08-01 | nur-zeitstempel | [03:51](https://www.youtube.com/watch?v=GWCHNmLs72M&t=231s) |
| [SharePoint direkt in Microsoft Fabric nutzen \| Lakehouse, Direct Lake & Power BI](https://www.youtube.com/watch?v=c-LWoo-O5PQ) | 2026-07-01 | nur-zeitstempel | [09:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=560s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Auto-Binding) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Wann%20lohnt%20sich%20ein%20Dataflow%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Was%20nur%20im%20Service%20geht) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [36:48](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2208s) · [38:43](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2323s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [08:27](https://www.youtube.com/watch?v=mTVeZzshLzE&t=507s) · [26:39](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1599s) |
| [Fabric Workload Demo mit Alexander Korn und Lukasz Obst](https://www.youtube.com/watch?v=e50qKdVn-24) | 2026-08-01 | kernaussagen+zeitstempel | [18:59](https://www.youtube.com/watch?v=e50qKdVn-24&t=1139s) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [15:17](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=917s) · [1:20:19](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=4819s) · [1:23:32](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=5012s) |
| [BI Thinkers Talk nr.75](https://www.youtube.com/watch?v=BQdSo6ZnmKY) | 2026-04-01 | kernaussagen+zeitstempel | [07:51](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=471s) · [51:19](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=3079s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [1:00:55](https://www.youtube.com/watch?v=iymmxuXHh44&t=3655s) · [1:02:29](https://www.youtube.com/watch?v=iymmxuXHh44&t=3749s) |
| [BI Thinkers Talk nr.77](https://www.youtube.com/watch?v=eWfTt93anl4) | — | nur-zeitstempel | [46:51](https://www.youtube.com/watch?v=eWfTt93anl4&t=2811s) · [53:05](https://www.youtube.com/watch?v=eWfTt93anl4&t=3185s) |
| [Daten-WG Special: Power BI vs. Qlik -part2](https://www.youtube.com/watch?v=_Vh5fDfHWz4) | 2025-10-01 | nur-zeitstempel | [05:18](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=318s) · [1:05:36](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=3936s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [03:18](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=198s) · [49:14](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2954s) |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) · [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | kernaussagen+zeitstempel | [26:46](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1606s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [08:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=508s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [48:33](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2913s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [47:15](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=2835s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [30:27](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1827s) |
| [Mensch bleiben, wenn Power BI geht](https://www.youtube.com/watch?v=iB4vHRvaErE) | 2025-11-01 | nur-zeitstempel | [15:11](https://www.youtube.com/watch?v=iB4vHRvaErE&t=911s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Asemantic-model
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Asemantic-model&f=tool%3Asemantic-model
