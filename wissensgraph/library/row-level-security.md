---
id: "topic:row-level-security"
name: "Row-Level Security"
typ: thema
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 12
kernaussagen: 6
mit_kernaussagen: 5
aliase:
  - "RLS"
  - "Zeilenebene"
  - "Row Level Security"
  - "Berechtigungen"
---

# Row-Level Security

Row-Level Security wird sowohl von Copilot als auch vom Explore-Feature respektiert, im Unterschied zu einer reinen Security-by-Obscurity durch versteckte Tabellen. Row-Level Security und Column-Level Security funktionieren inzwischen auch für gespiegelte (mirrored) Objekte. Row-Level Security für Planning-Objekte greift über das zugrunde liegende Semantic Model, das für den Zugriff genutzt wird.

## Aliase

RLS, Zeilenebene, Row Level Security, Berechtigungen

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Sicherheit](sicherheit.md) | ko-vorkommen | heuristik | 28 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 27 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 25 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 20 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 17 |
| [OneLake](onelake.md) | ko-vorkommen | heuristik | 14 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 13 |
| [Workspace](workspace.md) | ko-vorkommen | heuristik | 12 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 11 |
| [Refresh](refresh.md) | ko-vorkommen | heuristik | 11 |
| [DirectQuery](directquery.md) | ko-vorkommen | heuristik | 11 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 10 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 9 |
| [Data Pipeline](data-pipeline.md) | ko-vorkommen | heuristik | 9 |
| [Governance](governance.md) | ko-vorkommen | heuristik | 9 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Warnung | BI Thinkers Talk nr.75 | 41:21 | Perspektiven in Analysis Services und Power BI bilden keine echte Sicherheitsgrenze ab, sodass Nutzer trotz eingeschränkter Perspektive weiterhin das komplette zugrunde liegende Modell nutzen können. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2481s) |
| Fakt | BI Thinkers Talk n.74 | 25:56 | Row-Level Security wird sowohl von Copilot als auch vom Explore-Feature respektiert, im Unterschied zu einer reinen Security-by-Obscurity durch versteckte Tabellen. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1556s) |
| Warnung | BI Thinkers Talk n.74 | 27:27 | Das Explore-Feature ist nicht an die Build-Permission gekoppelt, sodass darüber Inhalte aus dem semantischen Modell zugänglich sein können, die im Bericht selbst nicht sichtbar sind. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1647s) |
| Fakt | Fabric Planning unboxing | 1:18:48 | Row-Level Security für Planning-Objekte greift über das zugrunde liegende Semantic Model, das für den Zugriff genutzt wird. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=4728s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 20:50 | Row-Level Security und Column-Level Security funktionieren inzwischen auch für gespiegelte (mirrored) Objekte. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1250s) |
| Warnung | Fabric & Power BI Quarterly · 2026-2 | 31:59 | Komplexere Sicherheitsszenarien wie dynamische Row-Level Security und Dynamic Data Masking fehlen in OneLake Security noch und stehen auf der Roadmap. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1919s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20drei%20Plattform-Schichten%20unter%20den%20Workloads) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Der%20Vergleich) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Governance-Perspektive) |
| [So hackst du einen Power BI Bericht \| Power BI Tutorial](https://www.youtube.com/watch?v=GKLxM3317Xk) | 2025-09-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=GKLxM3317Xk) |
| [Power BI Update Juli 2025](https://www.youtube.com/watch?v=TkxwcAyBGUM) | 2025-07-01 | nur-zeitstempel | [02:07](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=127s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=09%20%C2%B7%20Row-Level%20Security%20%2A%C2%B7%20RLS%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=3.%20Bidirektional%20sparsam) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Risiken) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [10:33](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=633s) · [12:06](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=726s) · [15:50](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=950s) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [24:19](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1459s) · [25:56](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1556s) · [27:27](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1647s) |
| [BI Thinkers Talk nr.63](https://www.youtube.com/watch?v=9VX4-lLa0EI) | 2025-06-01 | nur-zeitstempel | [42:15](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=2535s) · [50:27](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=3027s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | nur-zeitstempel | [17:48](https://www.youtube.com/watch?v=DQENmzAkNqw&t=1068s) · [30:50](https://www.youtube.com/watch?v=DQENmzAkNqw&t=1850s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [21:17](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1277s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [20:50](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1250s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [18:53](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=1133s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [1:18:48](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=4728s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Arow-level-security
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Arow-level-security&f=topic%3Arow-level-security
