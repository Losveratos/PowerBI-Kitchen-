---
id: "tool:direct-lake"
name: "Direct Lake"
typ: tool
stand: "2026-09-07"
build: "20260907-1056"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 32
kernaussagen: 20
mit_kernaussagen: 10
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/direct-lake.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/direct-lake.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/direct-lake.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/direct-lake.json"
aliase:
  - "DirectLake"
  - "Direct-Lake"
---

# Direct Lake

Als Preview-Feature sollen DAX-berechnete Spalten künftig auch in Direct-Lake-Modellen anlegbar sein, aktuell ist die Option dort noch ausgeblendet. Für eine Fabric-SQL-Datenbank ist Direct Lake nicht nutzbar, weshalb im Berichtsmodell Import oder DirectQuery verwendet werden muss. Bei einem Direct-Lake-Modell bleibt das Semantic Model nach einem Deployment über eine Deployment Pipeline weiterhin mit dem Lakehouse der Testumgebung verbunden, die Datenquelle wird also nicht automatisch auf die Zielumgebung umgehängt.

## Aliase

DirectLake, Direct-Lake

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [SQL Endpoint](sql-endpoint.md) | setzt-voraus | belegt | 10 |
| [Notebook](notebook.md) | setzt-voraus | belegt | 18 |
| [Lakehouse](lakehouse.md) | setzt-voraus | belegt | 40 |
| [Import Mode](import-mode.md) | gegensatz | belegt | 6 |
| [Import Mode](import-mode.md) | ersetzt | belegt | 6 |
| [Composite Models](composite-models.md) | teil-von | belegt | 5 |
| [DirectQuery](directquery.md) | gegensatz | belegt | 34 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 46 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 45 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 31 |
| [OneLake](onelake.md) | ko-vorkommen | heuristik | 29 |
| [Refresh](refresh.md) | ko-vorkommen | heuristik | 28 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 28 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 24 |
| [Semantic Model](semantic-model.md) | ko-vorkommen | heuristik | 21 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | Power BI Update April 2026 | 01:55 | Als Preview-Feature sollen DAX-berechnete Spalten künftig auch in Direct-Lake-Modellen anlegbar sein, aktuell ist die Option dort noch ausgeblendet. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=115s) |
| Fakt | BI Thinkers Talk nr.75 | 42:55 | Bei Direct Lake führt der erste Nutzer, der morgens einen Bericht öffnet, wegen des noch kalten Caches häufig zu langen Wartezeiten. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2575s) |
| Empfehlung | BI Thinkers Talk nr.75 | 42:55 | Der Power BI Fixer kann automatisch ein geplantes Notebook anlegen, das die Direct-Lake-Perspektive täglich zu einer festen Uhrzeit aktualisiert, um den Cache vorzuwärmen. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2575s) |
| Fakt | Fabric Planning unboxing | 03:06 | Für Direct Lake gab es weiterhin Probleme, während der Import-Modus über den SQL-Endpoint funktionierte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=186s) |
| Fakt | Power BI Update März 2026 | 06:21 | Direct Lake auf OneLake ist jetzt allgemein verfügbar und damit der neue Standard für Direct Lake. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=381s) |
| Empfehlung | Power BI Update März 2026 | 06:21 | Wer Fabric nutzt, sollte sich Direct Lake auf OneLake auf jeden Fall anschauen. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=381s) |
| Fakt | BI Thinkers Talk n.73 | 35:44 | Bei einem Direct-Lake-Modell bleibt das Semantic Model nach einem Deployment über eine Deployment Pipeline weiterhin mit dem Lakehouse der Testumgebung verbunden, die Datenquelle wird also nicht automatisch auf die Zielumgebung umgehängt. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2144s) |
| Meinung | BI Thinkers Talk n.73 | 38:59 | Der Sprecher hält doppelte Datenhaltung in einem zweiten Lakehouse für unnötig, wenn ohnehin schon ein Direct-Lake-Modell mit großen Datenmengen im Einsatz ist. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2339s) |
| Fakt | BI Thinkers Talk n.73 | 40:39 | Eine Monitoring-Analyse zeigte, dass über zwei Drittel der Last auf einem produktiven Direct-Lake-Semantic-Model von Entwicklern in Power BI Desktop stammten und nicht von den eigentlichen Report-Nutzern. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2439s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 09:01 | Mit der VS-Code-Erweiterung für Fabric lässt sich ein Direct-Lake-Modell innerhalb weniger Minuten von einer SQL-Datenbank auf ein Warehouse umziehen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=541s) |
| Fakt | BI Thinkers Talk n.72 | 53:54 | Deployment Pipelines unterstützen Dataflows, Lakehouses und Direct Lake nicht zuverlässig, sodass danach oft manuell mit VS Code nachgearbeitet werden muss. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3234s) |
| Fakt | BI Thinkers Talk n.72 | 53:54 | Für Import-Modelle gibt es in Deployment Pipelines eigene Deployment Rules, für Direct Lake dagegen nicht. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3234s) |
| Fakt | BI Thinkers Talk nr.67 | 17:48 | Bei der Migration eines Importmodells zu Direct Lake wurde eine bisher per Power-Query-Abfrage angelegte Measure-Tabelle durch eine Calculated Table mit einer leeren Hilfsspalte ersetzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1068s) |
| Fakt | BI Thinkers Talk nr.67 | 19:28 | Weil eine zu restriktive Firewall-Security den SQL-Zugriff auf Lakehouse-Tabellen blockierte, baute der Kunde stattdessen ein semantisches Direct-Lake-Modell direkt im Web auf. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1168s) |
| Empfehlung | BI Thinkers Talk nr.67 | 21:03 | Ein bestehender Bericht wurde im Live-Connection-Modus aus dem Power-BI-Service heruntergeladen und anschließend über die Datenverbindung von seinem ursprünglichen Importmodell auf ein neu aufgebautes Direct-Lake-Modell mit identischen Measure-Namen umgestellt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1263s) |
| Fakt | BI Thinkers Talk nr.67 | 1:03:47 | Die Kombination aus Direct Lake und Import Mode ist mittlerweile GA verfügbar und ermöglicht damit ein stabileres Composite-Modell. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3827s) |
| Fakt | BI Thinkers Talk Nr.62 | 31:47 | Für eine Fabric-SQL-Datenbank ist Direct Lake nicht nutzbar, weshalb im Berichtsmodell Import oder DirectQuery verwendet werden muss. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1907s) |
| Meinung | BI Thinkers Talk Nr.62 | 47:40 | Mit Direct Lake wäre das Zurückschreiben asynchron und dadurch deutlich schneller als mit DirectQuery. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2860s) |
| Meinung | BI Thinkers Talk Nr.62 | 1:02:29 | Bei Direct Lake fällt die Aktualisierung des semantischen Modells nach dem Schreiben kaum auf, weil kein spürbarer Refresh-Vorgang nötig ist. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3749s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? | 28:04 | Direct Lake existiert in zwei Varianten, verbunden über den SQL-Endpoint oder direkt mit dem Lake, was zusätzliche Komplexität für Citizen Developer schafft. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1684s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Wann%20Import%20%28noch%29%20gewinnt) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Community%20%C2%B7%20Blogs%2C%20Benchmarks%20%26%20B%C3%BCcher) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Zwei%20Varianten%20%E2%80%94%20wichtig%20seit%202025) |
| [Power BI Update April 2026](https://www.youtube.com/watch?v=fbpu8zLG3cc) | 2026-04-01 | kernaussagen+zeitstempel | [01:55](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=115s) · [02:58](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=178s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [07:46](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=466s) · [09:19](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=559s) · [11:21](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=681s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [31:47](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1907s) · [33:23](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2003s) · [47:40](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2860s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [35:44](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2144s) · [37:17](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2237s) · [38:59](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2339s) |
| [Power BI Update August 2025](https://www.youtube.com/watch?v=jTXo4aEr07o) | 2025-08-01 | nur-zeitstempel | [01:21](https://www.youtube.com/watch?v=jTXo4aEr07o&t=81s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | nur-zeitstempel | [41:19](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2479s) · [46:12](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2772s) · [47:44](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2864s) |
| [SharePoint direkt in Microsoft Fabric nutzen \| Lakehouse, Direct Lake & Power BI](https://www.youtube.com/watch?v=c-LWoo-O5PQ) | 2026-07-01 | nur-zeitstempel | [09:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=560s) · [16:12](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=972s) |
| [Power BI Update Juli 2025](https://www.youtube.com/watch?v=TkxwcAyBGUM) | 2025-07-01 | nur-zeitstempel | [06:09](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=369s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [08:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=508s) · [10:33](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=633s) · [12:06](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=726s) |
| [Power BI Update März 2026](https://www.youtube.com/watch?v=ASwcPvbMRZc) | 2026-03-01 | kernaussagen+zeitstempel | [06:21](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=381s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [17:48](https://www.youtube.com/watch?v=G8s96sHUHac&t=1068s) · [21:03](https://www.youtube.com/watch?v=G8s96sHUHac&t=1263s) · [1:03:47](https://www.youtube.com/watch?v=G8s96sHUHac&t=3827s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [19:55](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1195s) · [24:33](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1473s) |
| [Power BI Update September 2025](https://www.youtube.com/watch?v=6gQiIbyhWEc) | 2025-09-01 | nur-zeitstempel | [08:56](https://www.youtube.com/watch?v=6gQiIbyhWEc&t=536s) |
| [Daten-WG Deep Dive Financial Reporting - part 7](https://www.youtube.com/watch?v=232JhS9vbQ0) | 2025-09-01 | nur-zeitstempel | [05:24](https://www.youtube.com/watch?v=232JhS9vbQ0&t=324s) · [08:31](https://www.youtube.com/watch?v=232JhS9vbQ0&t=511s) · [20:17](https://www.youtube.com/watch?v=232JhS9vbQ0&t=1217s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [42:48](https://www.youtube.com/watch?v=r416vanitYw&t=2568s) · [44:27](https://www.youtube.com/watch?v=r416vanitYw&t=2667s) · [58:52](https://www.youtube.com/watch?v=r416vanitYw&t=3532s) |
| [Power BI Update August 2026](https://www.youtube.com/watch?v=GWCHNmLs72M) | 2026-08-01 | nur-zeitstempel | [07:35](https://www.youtube.com/watch?v=GWCHNmLs72M&t=455s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [07:50](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=470s) · [25:07](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1507s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [36:51](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2211s) · [38:58](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2338s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [02:59](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=179s) · [25:36](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1536s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [03:06](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=186s) · [55:27](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3327s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Fabric%20vs.%20klassisches%20Power%20BI) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Soll%20man%20von%20Power%20BI%20Premium%20auf%20Fabric%20umstellen%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Direct%20Lake%20%28Fabric%29) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [28:04](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1684s) |
| [BI Thinkers Talk nr.63](https://www.youtube.com/watch?v=9VX4-lLa0EI) | 2025-06-01 | nur-zeitstempel | [52:09](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=3129s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [34:28](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=2068s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [09:01](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=541s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [53:54](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3234s) |
| [BI Thinkers Talk nr.75](https://www.youtube.com/watch?v=BQdSo6ZnmKY) | 2026-04-01 | kernaussagen+zeitstempel | [42:55](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2575s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [57:54](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3474s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [1:04:03](https://www.youtube.com/watch?v=iymmxuXHh44&t=3843s) |
| [BI Thinkers Talk nr.77](https://www.youtube.com/watch?v=eWfTt93anl4) | — | nur-zeitstempel | [53:05](https://www.youtube.com/watch?v=eWfTt93anl4&t=3185s) |
| [BI Thinkers Talk nr.76](https://www.youtube.com/watch?v=mlkP-6i5Kq8) | 2026-05-01 | kernaussagen+zeitstempel | [45:45](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=2745s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Adirect-lake
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Adirect-lake&f=tool%3Adirect-lake
