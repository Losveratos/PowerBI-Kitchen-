---
id: "tool:fabric-capacity"
name: "Fabric Capacity"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 26
kernaussagen: 53
mit_kernaussagen: 18
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/fabric-capacity.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/fabric-capacity.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/fabric-capacity.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/fabric-capacity.json"
aliase:
  - "Capacity"
  - "Kapazität"
  - "F-SKU"
  - "F2"
  - "F64"
  - "Capacities"
  - "Kapazitäten"
---

# Fabric Capacity

Bei Fabric Capacity sind Ausführung (Consumption) und Bezahlung (Payment) der Last zeitlich voneinander getrennt, wodurch Bursting über die Kapazitätsgrenze hinaus möglich ist. (Stand 2025-07) Wird eine überlastete Fabric-Kapazität heruntergefahren, müssen die aufgelaufenen Schulden beim Wiederhochfahren auf einen Schlag zurückgezahlt werden. (Stand 2025-07) Teilt man eine F64-Reservation auf zwei kleinere Kapazitäten auf und pausiert eine davon, verschenkt man den Rabattanteil der pausierten Kapazität. (Stand 2025-07)

## Aliase

Capacity, Kapazität, F-SKU, F2, F64, Capacities, Kapazitäten

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Copilot](copilot.md) | Copilot setzt-voraus Fabric Capacity | automatisch extrahiert, Quellenstelle vorhanden | „die Copilot Unterstützung nur ab F64 plus QIZE an der Stelle zur Verfügung gestellt war“ (Fabric & Power BI Quarterly \| 2025 Q2, 2025-04) | 12 |
| [Direct Lake](direct-lake.md) | Direct Lake setzt-voraus Fabric Capacity | automatisch extrahiert, Quellenstelle vorhanden | „Also wir nutzen kein Direct Direct Query oder Direct Lake, also Direct Query ganz böse“ (Daten-WG Life-Update \| Fabric Architekturen, 2026-08) | 20 |
| [Planung](planung.md) | Planung setzt-voraus Fabric Capacity | automatisch extrahiert, Quellenstelle vorhanden | „es aber braucht einfach Kapazität, aber es gibt für mich, es gibt keine extra Lizenzen“ (Fabric Planning unboxing, 2026-03) | 8 |
| [Microsoft Fabric](microsoft-fabric.md) | Fabric Capacity teil-von Microsoft Fabric | automatisch extrahiert, Quellenstelle vorhanden | „wenn wir uns Fabric anschauen, haben wir zwei wesentliche Komponenten. Zum einen gibt es die Kapazität, das ist das, was wir in Asure buchen und wo die Rechenleistung stattfindet.“ (Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake?, 2026-03) | 66 |
| [Workspace](workspace.md) | Workspace setzt-voraus Fabric Capacity | automatisch extrahiert, Quellenstelle vorhanden | „ich habe einen Arbeitsbereich, den ordne ich einer Kapazität zu und innerhalb des Arbeitsbereichs werden dann meine Artefakte und die Daten dazu entsprechend auf den Onelake abgelegt.“ (Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake?, 2026-03) | 28 |
| [Mirroring](mirroring.md) | Mirroring teil-von Fabric Capacity | automatisch extrahiert, Quellenstelle vorhanden | „die Speicherkosten ... sind ja die Speicherkosten je nach äh Kapazität im Terabyte Bereich äh mit drin (Segment 8)“ (BI Thinkers Talk nr.71, 2025-12) | 10 |
| [Copilot](copilot.md) | Copilot teil-von Fabric Capacity | automatisch extrahiert, Quellenstelle vorhanden | „Z.B. Copilot ist Backend.“ (BI Thinkers Talk nr.64, 2025-07) | 12 |
| [Translytical Task Flows](translytical-task-flows.md) | Translytical Task Flows setzt-voraus Fabric Capacity | automatisch extrahiert, Quellenstelle vorhanden | „seit wir da am Bauen sind, quasi seit 4:20 Uhr, dass das so hochgeschossen ist, das ist jetzt kein Zufall“ (BI Thinkers Talk Nr.62, 2025-05) | 0 |
| [Mirroring](mirroring.md) | Mirroring setzt-voraus Fabric Capacity | automatisch extrahiert, Quellenstelle vorhanden | „hast du je nachdem, was für eine Kapazität du bei Fabric gekauft hast, kostenlosen Mirror Speicher dabei“ (Daten-WG Thinkers Talk nr.65, 2025-07) | 10 |
| [Power BI](power-bi.md) | Fabric Capacity und Power BI im selben Segment | Heuristik, gezählt |  | 52 |
| [Premium](premium.md) | Fabric Capacity und Premium im selben Segment | Heuristik, gezählt |  | 29 |
| [Lizenzen](lizenzen.md) | Fabric Capacity und Lizenzen im selben Segment | Heuristik, gezählt |  | 28 |
| [Reporting](reporting.md) | Fabric Capacity und Reporting im selben Segment | Heuristik, gezählt |  | 22 |
| [SQL](sql.md) | Fabric Capacity und SQL im selben Segment | Heuristik, gezählt |  | 21 |
| [Performance](performance.md) | Fabric Capacity und Performance im selben Segment | Heuristik, gezählt |  | 21 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 07:50 | auf die Sekunde | In diesem Projekt wird bewusst weder DirectQuery noch Direct Lake genutzt, um die Fabric-Kapazitaet durch das mit Power-BI-Pro-Lizenzen ausgerollte Frontend nicht zu belasten. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=470s) |
| Empfehlung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 08:27 | auf die Sekunde | Es wird empfohlen, fuer Produktivbetrieb und Deployment beziehungsweise Tests getrennte Fabric-Kapazitaeten einzuplanen, damit ein fehlgeschlagenes Deployment nicht das operative System stoert. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=507s) |
| Meinung | Daten-WG Life-Update \| Fabric Architekturen | 2026-08 | 11:57 | auf die Sekunde | Bei einem Warehouse sind viele Optimierungen, die man sonst in Notebooks oder im Lake selbst umsetzen muesste, bereits managed abgenommen, was weniger Freiheit, aber auch weniger Risiko fuer die Kapazitaet bedeutet. | [▶](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=717s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 00:28 | auf die Sekunde | Microsoft Fabric besteht im Kern aus zwei wesentlichen Komponenten: der Kapazität, die man in Azure bucht, und dem OneLake, in dem die Daten liegen und verwaltet werden. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=28s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 00:54 | auf die Sekunde | Ein Arbeitsbereich wird einer Kapazität zugeordnet, und innerhalb dieses Arbeitsbereichs werden Artefakte und Daten entsprechend im OneLake abgelegt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=54s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 01:01 | auf die Sekunde | Die Rechenleistung, die innerhalb eines Arbeitsbereichs zum Arbeiten mit den Daten im OneLake genutzt wird, stammt aus der zugeordneten Fabric-Kapazität. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=61s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 01:14 | auf die Sekunde | Verschiebt man die Rechenleistung einer Kapazität in eine andere Region, verschiebt sich dadurch auch der Ablageort der zugehörigen Daten im OneLake. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=74s) |
| Empfehlung | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 01:14 | auf die Sekunde | Im Azure-Portal kann die Region für die Kapazität auch manuell anders gewählt werden, wenn Daten und Rechenleistung woanders verortet werden sollen. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=74s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 01:19 | Abschnittsanfang | Eine Fabric-Kapazität kann in unterschiedlichen Azure-Regionen angelegt werden. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=79s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 01:29 | auf die Sekunde | Bestimmte Szenarien erfordern, dass Daten aus rechtlichen oder regulatorischen Gründen in einem bestimmten Land oder einer bestimmten Region abgelegt und verarbeitet werden. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=89s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 02:58 | auf die Sekunde | Beim Buchen einer Kapazität im Azure-Portal ist die Region standardmäßig auf die Region des Tenants voreingestellt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=178s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 03:12 | auf die Sekunde | Die tatsächlichen Daten werden laut dem Microsoft-Blogartikel in der Region gespeichert, in der die zugeordnete Kapazität liegt, und nicht zwingend in der Region des Tenants. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=192s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 03:12 | auf die Sekunde | Ordnet man einen Arbeitsbereich einer Kapazität zu, werden die zugehörigen Daten im OneLake tatsächlich in der Region gespeichert, in der die Kapazität liegt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=192s) |
| Warnung | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 03:15 | auf die Sekunde | Verschiebt man einen Arbeitsbereich zwischen Kapazitäten in unterschiedlichen Regionen, müssen die zugrunde liegenden Daten tatsächlich in die neue Region überführt werden, es ist also kein reiner Wechsel der Rechenleistung. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=195s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 2026-03 | 04:02 | auf die Sekunde | OneLake existiert pro Tenant nur einmal und beschreibt die Gesamtumgebung, während der tatsächliche Ablageort der Daten durch die Region der jeweils gehosteten Kapazität gesteuert wird. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=242s) |
| Fakt | Fabric Planning unboxing | 2026-03 | 07:48 | auf die Sekunde | Das neue Planning-Feature, ehemals Lumel bzw. Inforiver, ist jetzt direkt in Microsoft Fabric integriert und benötigt keine zusätzliche Lizenz, sondern nur Fabric-Kapazität. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=468s) |
| Warnung | Fabric Planning unboxing | 2026-03 | 09:22 | Abschnittsanfang | Eine einzelne SQL-Datenbank kann bereits eine F2-Kapazität stark auslasten, wie ein interner Vorfall zeigte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=562s) |
| Warnung | Fabric Planning unboxing | 2026-03 | 1:09:28 | Abschnittsanfang | Der Gantt-Objekttyp benötigt eine passende Datenstruktur mit eindeutigem Event sowie Start- und Enddatum und zeigte auf der genutzten Trial-Kapazität deutliche Ladezeit-Probleme. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=4168s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 02:47 | auf die Sekunde | Für eine F64-Kapazität stellt Microsoft im Rahmen von Open Mirroring 64 TB Speicherplatz kostenlos zur Verfügung. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=167s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 03:05 | auf die Sekunde | Der kostenlose Speicherplatz bei Open Mirroring soll die doppelte Datenhaltung aus Quelle und Replikat in Fabric kompensieren. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=185s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 03:39 | auf die Sekunde | Die Replikation der Tabelle selbst erzeugt keine zusätzlichen Fabric-Kapazitätskosten, erst der Datenzugriff über SQL, Power BI oder Spark wird nach den regulären Tarifen berechnet. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=219s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 17:13 | auf die Sekunde | Die Search Protection auf Workspace-Ebene kann einen Workspace automatisch pausieren, wenn er eine festgelegte Prozentzahl der Gesamtkapazität überschreitet. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1033s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 17:17 | auf die Sekunde | Einzelne Workspaces lassen sich als Mission Critical markieren, damit sie von der automatischen Pausierung durch die Search Protection ausgenommen bleiben. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1037s) |
| Meinung | BI Thinkers Talk n.72 | 2026-01 | 42:42 | auf die Sekunde | Die Capacity Metrics App wird als unzuverlässig beschrieben, weil sie nach einem Update manuell vorgenommene Codeänderungen überschrieben hat und danach nicht mehr lädt. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2562s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 10:41 | auf die Sekunde | In einem Projekt mit 14 Werken und 27 Tabellen pro Werk im Viertelstundentakt kostete ein Aktualisierungsdurchlauf pro Werk rund 28 Cent, was hochgerechnet auf sechs Werke eine F64-Kapazität auslastete und jährlich über 5000 Euro allein für den Datentransport verursachte. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=641s) |
| Meinung | BI Thinkers Talk nr.71 | 2025-12 | 11:56 | auf die Sekunde | Beim Fabric-Kapazitätsmodell (Flat Rate) ist der tatsächliche Ressourcenverbrauch laut den Sprechern weniger transparent als bei nutzungsbasierter Abrechnung wie bei Synapse. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=716s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 13:15 | auf die Sekunde | Beim Fabric Mirroring sind die Speicherkosten für gespiegelte Daten je nach Kapazität im Terabyte-Bereich bereits enthalten, sodass zusätzlich nur noch das Auslesen der Daten aus der Mirror-Datenbank bezahlt wird. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=795s) |
| Fakt | Why Passion Beats Niche | 2025-09 | 21:34 | auf die Sekunde | Für Echtzeit-Dashboards ist laut Brian Bønk keine Power-BI-Pro-Lizenz nötig, es genügt mindestens eine F2-Fabric-Instanz. | [▶](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1294s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 55:58 | Abschnittsanfang | Mirroring in Microsoft Fabric enthält kostenlosen Speicherplatz proportional zur gebuchten Kapazität, etwa 64 TB bei einer F64-Kapazität, inklusive der automatischen Transformation in Tabellenformat. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |
| Fakt | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 27:10 | auf die Sekunde | Mit einer Fabric-F2-Kapazität lassen sich Realtime Intelligence, Translytical Task Flows und Copilot bereits gut nutzen, solange die traditionellen Batch-Workloads nicht zu intensiv sind. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1630s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 11:33 | auf die Sekunde | Je nach gekaufter Fabric-Kapazität ist bei Open Mirroring kostenloser Mirror-Speicher enthalten, und das Processing wird nicht als Leistung angerechnet. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=693s) |
| Meinung | BI Thinkers Talk nr.64 | 2025-07 | 14:16 | auf die Sekunde | Seit die Capacity Metrics App auch Logging-Aktivitäten und Kapazitätsmetriken kombiniert, ist das für das Monitoring sehr wertvoll. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=856s) |
| Fakt | BI Thinkers Talk nr.64 | 2025-07 | 16:09 | auf die Sekunde | Bei Fabric Capacity sind Ausführung (Consumption) und Bezahlung (Payment) der Last zeitlich voneinander getrennt, wodurch Bursting über die Kapazitätsgrenze hinaus möglich ist. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=969s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 16:35 | auf die Sekunde | Mit einer F2-Kapazität sind laut Beispiel bis zu 2 TB kostenloser Mirroring-Speicher enthalten. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=995s) |
| Fakt | BI Thinkers Talk nr.64 | 2025-07 | 17:32 | auf die Sekunde | Wird eine überlastete Fabric-Kapazität heruntergefahren, müssen die aufgelaufenen Schulden beim Wiederhochfahren auf einen Schlag zurückgezahlt werden. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1052s) |
| Fakt | BI Thinkers Talk nr.64 | 2025-07 | 19:39 | auf die Sekunde | Teilt man eine F64-Reservation auf zwei kleinere Kapazitäten auf und pausiert eine davon, verschenkt man den Rabattanteil der pausierten Kapazität. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1179s) |
| Fakt | BI Thinkers Talk nr.64 | 2025-07 | 24:15 | auf die Sekunde | Die Fabric-Kapazität wird einer bestimmten Region zugeordnet, wodurch auch die zugehörigen OneLake-Daten an diese Region gekoppelt sind. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1455s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 26:14 | auf die Sekunde | Beim Push von Daten per Python-Skript in den OneLake werden im Gegensatz zum Zugriff über ein Data Gateway keine Fabric-CUs für das Abholen der Daten belastet. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1574s) |
| Fakt | BI Thinkers Talk nr.64 | 2025-07 | 29:00 | auf die Sekunde | Eine Fabric-Kapazität in der Region Deutschland West kostet rund 40 Euro mehr als dieselbe Kapazität in der US-Standardregion. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1740s) |
| Empfehlung | BI Thinkers Talk nr.64 | 2025-07 | 35:32 | auf die Sekunde | Wird das Zeitfenster einer DirectQuery-Abfrage auf eine Kusto-/Eventhouse-Datenbank deutlich verkleinert, hält die Fabric-Kapazität im Langzeittest spürbar länger durch. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2132s) |
| Meinung | BI Thinkers Talk nr.64 | 2025-07 | 38:17 | auf die Sekunde | DirectQuery gilt als sehr teuer im Kapazitätsverbrauch, was sich auch bei Translytical Task Flows gezeigt hat. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2297s) |
| Fakt | BI Thinkers Talk nr.64 | 2025-07 | 41:07 | auf die Sekunde | Beim Fabric-Capacity-Smoothing wird ein Frontend-Peak nur über einen sehr kurzen Zeitraum abgerechnet, während ein Backend-Peak über bis zu 24 Stunden verteilt wird. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2467s) |
| Fakt | BI Thinkers Talk nr.64 | 2025-07 | 43:55 | auf die Sekunde | Copilot-Nutzung zählt als Backend-Workload und kann die Kapazität über 24 Stunden belasten, steigt dabei aber vergleichsweise langsam an. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2635s) |
| Empfehlung | BI Thinkers Talk nr.64 | 2025-07 | 49:27 | auf die Sekunde | Für kleinere und mittelständische Unternehmen wird empfohlen, eine Fabric-F2-Kapazität zu kaufen, da sie besser sei als eine reine Excel- oder SharePoint-Lösung. | [▶](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2967s) |
| Warnung | Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup | 2025-06 | 37:06 | auf die Sekunde | Bei einem Lasttest in einer kleineren F2-Fabric-Kapazitaet war nicht der Datenstrom selbst das Problem, sondern die durch Auto-Refresh ausgeloesten haeufigen Abfragen, die viele Ressourcen kosteten. | [▶](https://www.youtube.com/watch?v=BDnwlOqRElY&t=2226s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 1:10:37 | Abschnittsanfang | Nach den Tests der Writeback-Funktion stieg die CU-Auslastung der F2-Kapazität in der Capacity-Metrics-App auf über 100 Prozent. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=4237s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 35:44 | auf die Sekunde | FUAM hat sich als offizielle State-of-the-Art-Monitoring-Lösung inklusive Capacity Matrix etabliert und löst damit die frühere Community-Lösung von Rui Romano ab. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2144s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 44:45 | auf die Sekunde | Mit den neuen AI-/Copilot-Capacities werden die früheren Skills als Agents bezeichnet, und Copilot-Unterstützung wird künftig für alle verfügbar sein. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2685s) |
| Empfehlung | Fabric & Power BI Quarterly · 2025 Q3 |  | 05:31 | auf die Sekunde | Fuer kleinere Kunden, die DataMarts bisher ohne Premium Per User genutzt haben, lohnt sich beim Umstieg schon eine kleine F2-Kapazitaet. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=331s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-2 |  | 17:29 | auf die Sekunde | Fabric-Kapazität F2 lohnt sich aus Sicht eines der Sprecher fast immer, unabhängig von der Unternehmensgröße. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1049s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q4 |  | 28:33 | auf die Sekunde | Dataflows Gen2 wurden überarbeitet und bringen vor allem bei Dataflows, die länger als 10 Minuten laufen, eine deutliche Verbesserung bei Performance und CU-Verbrauch. | [▶](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1713s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 |  | 33:38 | auf die Sekunde | Microsoft Fabric bietet jetzt einen Papierkorb für gelöschte Items sowie Autoscaling beziehungsweise Overage Billing für Kapazitätsspitzen. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2018s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 |  | 41:28 | auf die Sekunde | Fabric Planning mit Lumel erfordert keine separate Lizenz und wird ausschließlich über Capacity-Unit-Verbrauch abgerechnet. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2488s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | kernaussagen+zeitstempel | [15:34](https://www.youtube.com/watch?v=4VVNDNusq4U&t=934s) · [17:20](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1040s) · [19:02](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1142s) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [12:04](https://www.youtube.com/watch?v=YzfcMurbWNc&t=724s) · [13:41](https://www.youtube.com/watch?v=YzfcMurbWNc&t=821s) · [15:23](https://www.youtube.com/watch?v=YzfcMurbWNc&t=923s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20das%20konkret%20hei%C3%9Ft) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Workload-Landkarte%20%28Stand%202026%29) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20wichtigsten%20Regeln) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [04:16](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=256s) · [07:50](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=470s) · [39:00](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=2340s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [44:26](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2666s) · [45:20](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2720s) · [46:54](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2814s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [22:25](https://www.youtube.com/watch?v=iymmxuXHh44&t=1345s) · [24:14](https://www.youtube.com/watch?v=iymmxuXHh44&t=1454s) · [32:28](https://www.youtube.com/watch?v=iymmxuXHh44&t=1948s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [17:22](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1042s) · [33:31](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2011s) · [43:34](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2614s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | kernaussagen+zeitstempel | [19:47](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1187s) · [21:22](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1282s) · [22:52](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1372s) |
| [Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial](https://www.youtube.com/watch?v=7j34Ndng0Os) | 2026-01-01 | kernaussagen+zeitstempel | [02:40](https://www.youtube.com/watch?v=7j34Ndng0Os&t=160s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [11:27](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=687s) · [1:09:02](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=4142s) · [1:12:10](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=4330s) |
| [10 Jahre BI für alle? Was Power BI wirklich verändert hat](https://www.youtube.com/watch?v=9wl_PLvgvyc) | 2025-08-01 | nur-zeitstempel | [12:47](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=767s) · [17:08](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1028s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Die%20vier%20Lizenz-Stufen) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Sicherheitsgruppen%20statt%20Einzelpersonen) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Die%20wichtigsten%20Regeln) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [07:46](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=466s) · [09:22](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=562s) · [18:46](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1126s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [14:21](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=861s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [09:41](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=581s) · [13:03](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=783s) · [14:39](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=879s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | kernaussagen+zeitstempel | [26:22](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1582s) · [1:09:07](https://www.youtube.com/watch?v=bt81POE-9Ig&t=4147s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [11:32](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=692s) · [15:05](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=905s) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [11:17](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=677s) · [12:49](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=769s) |
| [Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup](https://www.youtube.com/watch?v=BDnwlOqRElY) | 2025-06-01 | kernaussagen+zeitstempel | [35:52](https://www.youtube.com/watch?v=BDnwlOqRElY&t=2152s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [03:11](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=191s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | kernaussagen+zeitstempel | [04:43](https://www.youtube.com/watch?v=lZvpCBMKASM&t=283s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [16:46](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1006s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | kernaussagen+zeitstempel | [49:02](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2942s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [57:54](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3474s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [55:58](https://www.youtube.com/watch?v=G8s96sHUHac&t=3358s) |
| [More than PBIX](https://www.youtube.com/watch?v=c90oD4zR1Aw) | 2025-12-01 | nur-metadaten | — |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Afabric-capacity
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Afabric-capacity&f=tool%3Afabric-capacity
