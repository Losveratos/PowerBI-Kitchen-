---
id: "topic:row-level-security"
name: "Row-Level Security"
typ: thema
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 12
kernaussagen: 13
mit_kernaussagen: 8
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/row-level-security.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/row-level-security.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/row-level-security.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/row-level-security.json"
aliase:
  - "RLS"
  - "Zeilenebene"
  - "Row Level Security"
  - "Berechtigungen"
---

# Row-Level Security

OneLake Security soll als zentrale Policy Engine Spalten-, Row-Level- und dynamische Tabellenebenen-Sicherheit über Lakehouse, Warehouse und Power BI hinweg abdecken. (Stand 2025-04) Row-Level Security wird sowohl von Copilot als auch vom Explore-Feature respektiert, im Unterschied zu einer reinen Security-by-Obscurity durch versteckte Tabellen. (Stand 2026-03) Die Manipulation über die Berichtsdatei betrifft nur das Frontend und kann nur sichtbar machen, was im Modell bereits vorhanden, aber schlecht verborgen ist. (Stand 2025-08)

## Aliase

RLS, Zeilenebene, Row Level Security, Berechtigungen

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Direct Lake](direct-lake.md) | Row-Level Security gegensatz Direct Lake | automatisch extrahiert, Quellenstelle vorhanden | „dann sag mal tschüss zu Direct Lake. Das ist gerade aus dem Fenster“ (600 SQL-Tabellen in Fabric) | 13 |
| [Field Parameters](field-parameters.md) | Row-Level Security setzt-voraus Field Parameters | automatisch extrahiert, Quellenstelle vorhanden | „nutzt dann hier die Field Parameter, um das ganze Thema zu umgehen“ (BI Thinkers Talk nr.64, 2025-07) | 0 |
| [Sicherheit](sicherheit.md) | Row-Level Security und Sicherheit im selben Segment | Heuristik, gezählt |  | 28 |
| [Reporting](reporting.md) | Row-Level Security und Reporting im selben Segment | Heuristik, gezählt |  | 27 |
| [Power BI](power-bi.md) | Row-Level Security und Power BI im selben Segment | Heuristik, gezählt |  | 25 |
| [Microsoft Fabric](microsoft-fabric.md) | Row-Level Security und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 20 |
| [Performance](performance.md) | Row-Level Security und Performance im selben Segment | Heuristik, gezählt |  | 17 |
| [OneLake](onelake.md) | Row-Level Security und OneLake im selben Segment | Heuristik, gezählt |  | 14 |
| [Workspace](workspace.md) | Row-Level Security und Workspace im selben Segment | Heuristik, gezählt |  | 12 |
| [Lakehouse](lakehouse.md) | Row-Level Security und Lakehouse im selben Segment | Heuristik, gezählt |  | 11 |
| [Refresh](refresh.md) | Row-Level Security und Refresh im selben Segment | Heuristik, gezählt |  | 11 |
| [DirectQuery](directquery.md) | Row-Level Security und DirectQuery im selben Segment | Heuristik, gezählt |  | 11 |
| [Warehouse](warehouse.md) | Row-Level Security und Warehouse im selben Segment | Heuristik, gezählt |  | 10 |
| [Visualisierung](visualisierung.md) | Row-Level Security und Visualisierung im selben Segment | Heuristik, gezählt |  | 9 |
| [Data Pipeline](data-pipeline.md) | Row-Level Security und Data Pipeline im selben Segment | Heuristik, gezählt |  | 9 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Warnung | BI Thinkers Talk nr.75 | 2026-04 | 42:46 | auf die Sekunde | Perspektiven in Analysis Services und Power BI bilden keine echte Sicherheitsgrenze ab, sodass Nutzer trotz eingeschränkter Perspektive weiterhin das komplette zugrunde liegende Modell nutzen können. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2566s) |
| Fakt | Fabric Planning unboxing | 2026-03 | 21:51 | auf die Sekunde | Row-Level Security für Planning-Objekte greift über das zugrunde liegende Semantic Model, das für den Zugriff genutzt wird. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1311s) |
| Warnung | BI Thinkers Talk n.74 | 2026-03 | 25:38 | auf die Sekunde | Das Explore-Feature ist nicht an die Build-Permission gekoppelt, sodass darüber Inhalte aus dem semantischen Modell zugänglich sein können, die im Bericht selbst nicht sichtbar sind. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1538s) |
| Fakt | BI Thinkers Talk n.74 | 2026-03 | 26:43 | auf die Sekunde | Row-Level Security wird sowohl von Copilot als auch vom Explore-Feature respektiert, im Unterschied zu einer reinen Security-by-Obscurity durch versteckte Tabellen. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1603s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 21:50 | auf die Sekunde | Row-Level Security und Column-Level Security funktionieren inzwischen auch für gespiegelte (mirrored) Objekte. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1310s) |
| Warnung | Daten-WG BI Thinkers Talk nr.66 | 2025-08 | 19:07 | auf die Sekunde | Werden Platzhalternamen im Referenzmodell nicht sorgfältig gewählt, besteht das Risiko einer Art Power-BI-Code-Injection über eingeschleuste JSON- oder RLS-Inhalte. | [▶](https://www.youtube.com/watch?v=DQENmzAkNqw&t=1147s) |
| Fakt | Daten-WG BI Thinkers Talk nr.66 | 2025-08 | 19:28 | auf die Sekunde | Die Manipulation über die Berichtsdatei betrifft nur das Frontend und kann nur sichtbar machen, was im Modell bereits vorhanden, aber schlecht verborgen ist. | [▶](https://www.youtube.com/watch?v=DQENmzAkNqw&t=1168s) |
| Meinung | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 11:02 | auf die Sekunde | Der aktuelle Preview-Stand der Composite Models über mehrere Lakehäuser verhält sich eher wie ein Import Mode ohne lange Ladezeiten, weil eigene Measures, Beziehungen und Row-Level Security noch fehlen. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=662s) |
| Meinung | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 12:05 | auf die Sekunde | Echte Composite Models werden erst mit der angekündigten OneLake Security möglich, weil dann Berechtigungen aus verschiedenen Quellen mitgezogen werden können. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=725s) |
| Fakt | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 18:44 | auf die Sekunde | OneLake Security soll als zentrale Policy Engine Spalten-, Row-Level- und dynamische Tabellenebenen-Sicherheit über Lakehouse, Warehouse und Power BI hinweg abdecken. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1124s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 22:42 | auf die Sekunde | Für Row-Level-Security-Anforderungen im Import Mode wurden Warehouse-Views statt vollem Lake-House-Zugriff verwendet, was sich als performanter erwies als eine Notebook-Kopie. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1362s) |
| Warnung | 600 SQL-Tabellen in Fabric |  | 24:57 | auf die Sekunde | Wenn Views im Warehouse oder Predicate Functions für Security genutzt werden, ist Direct Lake danach nicht mehr nutzbar. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1497s) |
| Warnung | Fabric & Power BI Quarterly · 2026-2 |  | 32:14 | auf die Sekunde | Komplexere Sicherheitsszenarien wie dynamische Row-Level Security und Dynamic Data Masking fehlen in OneLake Security noch und stehen auf der Roadmap. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1934s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20drei%20Plattform-Schichten%20unter%20den%20Workloads) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Der%20Vergleich) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Governance-Perspektive) |
| [So hackst du einen Power BI Bericht \| Power BI Tutorial](https://www.youtube.com/watch?v=GKLxM3317Xk) | 2025-09-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=GKLxM3317Xk) |
| [Power BI Update Juli 2025](https://www.youtube.com/watch?v=TkxwcAyBGUM) | 2025-07-01 | nur-zeitstempel | [02:07](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=127s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=09%20%C2%B7%20Row-Level%20Security%20%2A%C2%B7%20RLS%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=3.%20Bidirektional%20sparsam) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Risiken) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [10:33](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=633s) · [12:06](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=726s) · [15:50](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=950s) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [24:19](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1459s) · [25:56](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1556s) · [27:27](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1647s) |
| [BI Thinkers Talk nr.63](https://www.youtube.com/watch?v=9VX4-lLa0EI) | 2025-06-01 | nur-zeitstempel | [42:15](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=2535s) · [50:27](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=3027s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | kernaussagen+zeitstempel | [17:48](https://www.youtube.com/watch?v=DQENmzAkNqw&t=1068s) · [30:50](https://www.youtube.com/watch?v=DQENmzAkNqw&t=1850s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | kernaussagen+zeitstempel | [21:17](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1277s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [20:50](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1250s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | kernaussagen+zeitstempel | [18:53](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=1133s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [1:18:48](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=4728s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Arow-level-security
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Arow-level-security&f=topic%3Arow-level-security
