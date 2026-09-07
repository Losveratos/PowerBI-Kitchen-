---
id: "topic:refresh"
name: "Refresh"
typ: thema
stand: "2026-09-07"
build: "20260907-1922"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 38
kernaussagen: 5
mit_kernaussagen: 4
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/refresh.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/refresh.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/refresh.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/refresh.json"
aliase:
  - "Aktualisierung"
  - "Scheduled Refresh"
  - "aktualisieren"
---

# Refresh

Beim Auslösen der Datenfunktion liest das semantische Modell offenbar alle Tabellen neu, nicht nur die betroffene, unabhängig vom Speichermodus. Der Fixer erlaubt es, einzelne Tabellen oder Partitionen eines Semantic Models gezielt zu aktualisieren, statt das gesamte Modell neu zu laden. Beim separaten Hochladen des semantischen Modells über die Fabric-Erweiterung werden die Daten nicht mitübertragen, sodass der Refresh anschließend im Power-BI-Service erfolgen muss.

## Aliase

Aktualisierung, Scheduled Refresh, aktualisieren

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 44 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 43 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 36 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 28 |
| [Power Query](power-query.md) | ko-vorkommen | heuristik | 21 |
| [DirectQuery](directquery.md) | ko-vorkommen | heuristik | 21 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 21 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 20 |
| [Fabric Capacity](fabric-capacity.md) | ko-vorkommen | heuristik | 19 |
| [Incremental Refresh](incremental-refresh.md) | ko-vorkommen | heuristik | 17 |
| [Power BI Desktop](power-bi-desktop.md) | ko-vorkommen | heuristik | 17 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 17 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 15 |
| [Semantic Model](semantic-model.md) | ko-vorkommen | heuristik | 15 |
| [Workspace](workspace.md) | ko-vorkommen | heuristik | 14 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Warnung | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 2026-05 | 02:32 | auf die Sekunde | Executive Information Systems der späten 1980er-Jahre boten zwar bunte, innovative Oberflächen, hatten aber keinen Mechanismus zur laufenden Datenaktualisierung, wodurch die Daten nach drei bis fünf Wochen veraltet waren. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=152s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 45:13 | auf die Sekunde | Der Fixer erlaubt es, einzelne Tabellen oder Partitionen eines Semantic Models gezielt zu aktualisieren, statt das gesamte Modell neu zu laden. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2713s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 05:09 | auf die Sekunde | Beim separaten Hochladen des semantischen Modells über die Fabric-Erweiterung werden die Daten nicht mitübertragen, sodass der Refresh anschließend im Power-BI-Service erfolgen muss. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=309s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 1:01:23 | auf die Sekunde | Beim Auslösen der Datenfunktion liest das semantische Modell offenbar alle Tabellen neu, nicht nur die betroffene, unabhängig vom Speichermodus. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3683s) |
| Meinung | BI Thinkers Talk Nr.62 | 2025-05 | 1:02:31 | auf die Sekunde | Bei Direct Lake fällt die Aktualisierung des semantischen Modells nach dem Schreiben kaum auf, weil kein spürbarer Refresh-Vorgang nötig ist. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3751s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Fabric Shortcut Transformation erklärt: Updates im Praxistest](https://www.youtube.com/watch?v=Z6RZjkn_6lY) | 2026-07-01 | nur-zeitstempel | [03:04](https://www.youtube.com/watch?v=Z6RZjkn_6lY&t=184s) · [04:09](https://www.youtube.com/watch?v=Z6RZjkn_6lY&t=249s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [23:04](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1384s) · [49:14](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2954s) · [57:10](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3430s) |
| [Power BI Update Juni 2025](https://www.youtube.com/watch?v=LnNoXBIG7Lc) | 2025-06-01 | nur-zeitstempel | [01:45](https://www.youtube.com/watch?v=LnNoXBIG7Lc&t=105s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [46:07](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2767s) · [1:00:53](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3653s) · [1:02:29](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3749s) |
| [Power BI Update September 2025](https://www.youtube.com/watch?v=6gQiIbyhWEc) | 2025-09-01 | nur-zeitstempel | [03:49](https://www.youtube.com/watch?v=6gQiIbyhWEc&t=229s) · [04:48](https://www.youtube.com/watch?v=6gQiIbyhWEc&t=288s) |
| [Power BI Update August 2025](https://www.youtube.com/watch?v=jTXo4aEr07o) | 2025-08-01 | nur-zeitstempel | [03:53](https://www.youtube.com/watch?v=jTXo4aEr07o&t=233s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Auto-Binding) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Publish%20und%20ersten%20Refresh%20abwarten) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Was%20nur%20im%20Service%20geht) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=03%20%C2%B7%20Semantische%20Modelle%20%26%20%2ADirect%20Lake%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20den%20Fallback%20ausl%C3%B6st%20%28Direct%20Lake%20on%20SQL%29) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Der%20Vergleich) |
| [SharePoint direkt in Microsoft Fabric nutzen \| Lakehouse, Direct Lake & Power BI](https://www.youtube.com/watch?v=c-LWoo-O5PQ) | 2026-07-01 | nur-zeitstempel | [08:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=500s) · [16:12](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=972s) |
| [Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup](https://www.youtube.com/watch?v=BDnwlOqRElY) | 2025-06-01 | nur-zeitstempel | [22:30](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1350s) · [24:07](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1447s) · [35:52](https://www.youtube.com/watch?v=BDnwlOqRElY&t=2152s) |
| [BI Thinkers Talk nr.75](https://www.youtube.com/watch?v=BQdSo6ZnmKY) | 2026-04-01 | kernaussagen+zeitstempel | [25:18](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1518s) · [26:50](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1610s) · [44:31](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2671s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [10:01](https://www.youtube.com/watch?v=mTVeZzshLzE&t=601s) · [13:17](https://www.youtube.com/watch?v=mTVeZzshLzE&t=797s) · [21:24](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1284s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [10:33](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=633s) · [12:06](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=726s) · [19:44](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1184s) |
| [Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial](https://www.youtube.com/watch?v=7j34Ndng0Os) | 2026-01-01 | kernaussagen+zeitstempel | [00:51](https://www.youtube.com/watch?v=7j34Ndng0Os&t=51s) |
| [TMDL Magie: Multi Parameter Tabelle - Feldparameter Next Level! \| Power BI Tutorial](https://www.youtube.com/watch?v=sShNdgnHjr4) | 2025-10-01 | nur-zeitstempel | [06:42](https://www.youtube.com/watch?v=sShNdgnHjr4&t=402s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [12:22](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=742s) · [17:15](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1035s) · [29:00](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1740s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [47:43](https://www.youtube.com/watch?v=r416vanitYw&t=2863s) · [50:55](https://www.youtube.com/watch?v=r416vanitYw&t=3055s) · [52:27](https://www.youtube.com/watch?v=r416vanitYw&t=3147s) |
| [Power BI Update März 2026](https://www.youtube.com/watch?v=ASwcPvbMRZc) | 2026-03-01 | kernaussagen+zeitstempel | [00:42](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=42s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | nur-zeitstempel | [30:38](https://www.youtube.com/watch?v=TYmKrreMO3I&t=1838s) · [52:11](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3131s) · [55:24](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3324s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | nur-zeitstempel | [52:17](https://www.youtube.com/watch?v=DQENmzAkNqw&t=3137s) · [53:48](https://www.youtube.com/watch?v=DQENmzAkNqw&t=3228s) · [55:34](https://www.youtube.com/watch?v=DQENmzAkNqw&t=3334s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [09:19](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=559s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [36:51](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2211s) · [40:30](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2430s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [18:20](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1100s) · [22:30](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1350s) |
| [The Day After Tomorrow – Nach der Einführung geht es erst richtig los \| Power BI Summit 2023](https://www.youtube.com/watch?v=KwySyTxW_EI) | 2023-03-01 | nur-zeitstempel | [42:08](https://www.youtube.com/watch?v=KwySyTxW_EI&t=2528s) |
| [Daten-WG Special: Power BI vs. Qlik -part2](https://www.youtube.com/watch?v=_Vh5fDfHWz4) | 2025-10-01 | nur-zeitstempel | [13:48](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=828s) · [54:26](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=3266s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [04:56](https://www.youtube.com/watch?v=G8s96sHUHac&t=296s) · [49:24](https://www.youtube.com/watch?v=G8s96sHUHac&t=2964s) |
| [Data Binning and Lorenz Curve in DAX \| Alberto Ferrari & Michael Tenner, Berlin Power BI User Group](https://www.youtube.com/watch?v=183uLZ3GYDo) | 2023-01-01 | nur-zeitstempel | [10:02](https://www.youtube.com/watch?v=183uLZ3GYDo&t=602s) · [11:33](https://www.youtube.com/watch?v=183uLZ3GYDo&t=693s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [10:21](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=621s) |
| [BI Thinkers Talk nr.76](https://www.youtube.com/watch?v=mlkP-6i5Kq8) | 2026-05-01 | kernaussagen+zeitstempel | [36:19](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=2179s) · [1:01:42](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=3702s) |
| [Power BI Deep Dive: DAX UDF + TMDL](https://www.youtube.com/watch?v=0FPA1k5YiTs) | 2025-10-01 | nur-zeitstempel | [24:51](https://www.youtube.com/watch?v=0FPA1k5YiTs&t=1491s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [27:09](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1629s) |
| [BI Thinkers Talk nr.63](https://www.youtube.com/watch?v=9VX4-lLa0EI) | 2025-06-01 | nur-zeitstempel | [48:51](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=2931s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [16:25](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=985s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [55:34](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3334s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | nur-zeitstempel | [14:03](https://www.youtube.com/watch?v=4VVNDNusq4U&t=843s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [32:28](https://www.youtube.com/watch?v=iymmxuXHh44&t=1948s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [33:31](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2011s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | nur-zeitstempel | [01:33](https://www.youtube.com/watch?v=bt81POE-9Ig&t=93s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Arefresh
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Arefresh&f=topic%3Arefresh
