---
id: "tool:power-query"
name: "Power Query"
typ: tool
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 45
kernaussagen: 13
mit_kernaussagen: 8
aliase:
  - "M-Code"
  - "Power Query M"
  - "Query Editor"
  - "Abfrage-Editor"
---

# Power Query

Viele Fachanwender kennen Power Query nicht und bleiben deshalb bei breiten Tabellen, obwohl Power Query die Ein-Millionen-Zeilen-Grenze von Power Pivot umgeht. Copilot kann Fachanwendern helfen, bestehende Power-Query-Dataflows automatisiert in schnelleren Code zu übersetzen. Die Schaltfläche "Zeilen behalten" im Power Query Editor bietet fünf Optionen: erste Zeilen behalten, letzte Zeilen behalten, einen Bereich von Zeilen behalten, Duplikate behalten und Fehler behalten.

## Aliase

M-Code, Power Query M, Query Editor, Abfrage-Editor

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Excel](excel.md) | teil-von | belegt | 23 |
| [Power BI](power-bi.md) | teil-von | belegt | 53 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 36 |
| [Dataflow](dataflow.md) | ko-vorkommen | heuristik | 28 |
| [Sternschema](sternschema.md) | ko-vorkommen | heuristik | 26 |
| [DAX](dax.md) | ko-vorkommen | heuristik | 22 |
| [Datenmodellierung](datenmodellierung.md) | ko-vorkommen | heuristik | 22 |
| [Refresh](refresh.md) | ko-vorkommen | heuristik | 21 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 19 |
| [Power BI Desktop](power-bi-desktop.md) | ko-vorkommen | heuristik | 19 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 18 |
| [KI](ki.md) | ko-vorkommen | heuristik | 15 |
| [Notebook](notebook.md) | ko-vorkommen | heuristik | 15 |
| [Python](python.md) | ko-vorkommen | heuristik | 12 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 10 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk n.74 | 37:26 | Aus einem Fabric-Notebook lässt sich per API ein Dataflow ansteuern und darüber Power-Query-Code (M-Code) ausführen. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2246s) |
| Empfehlung | BI Thinkers Talk n.74 | 41:00 | Für kleinere Datenmengen und einfache Transformationen wie Entpivotieren eignet sich ein Dataflow, während stark verschachteltes JSON, etwa aus der Scanner API, eher in einem Notebook verarbeitet werden sollte. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2460s) |
| Fakt | BI Thinkers Talk n.74 | 1:13:05 | Beim Versuch, verschachtelte Power-Query-Objekte wie Record oder List aus einem Notebook heraus in ein Lakehouse zu schreiben, werden diese aktuell nur als Text gespeichert statt strukturiert aufgelöst. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=4385s) |
| Fakt | Power BI vs. Qlik | 05:10 | Sowohl Qlik als auch Power BI lassen sich von der Quelle bis zum Modell als vollständige Datenplattform nutzen, Qlik über Skripte und Power BI über Power Query und das Datenmodell. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=310s) |
| Warnung | Denken in Tabellen | 06:50 | Breite, lange Tabellen sind in Power BI und Power Query aus Performance- und Speicherplatzgründen ungünstig. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=410s) |
| Fakt | Denken in Tabellen | 10:21 | Viele Fachanwender kennen Power Query nicht und bleiben deshalb bei breiten Tabellen, obwohl Power Query die Ein-Millionen-Zeilen-Grenze von Power Pivot umgeht. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=621s) |
| Fakt | BI Thinkers Talk nr.71 | 24:01 | Die Schaltfläche "Zeilen behalten" im Power Query Editor bietet fünf Optionen: erste Zeilen behalten, letzte Zeilen behalten, einen Bereich von Zeilen behalten, Duplikate behalten und Fehler behalten. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1441s) |
| Empfehlung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 09:34 | Transformationsschritte sollen möglichst weit Richtung Quelle beziehungsweise in die dazwischenliegende Datenplattform verlagert werden, damit das Power-BI-Modell die Daten bereits aufbereitet erhält. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=574s) |
| Fakt | BI Thinkers Talk nr.67 | 17:48 | Bei der Migration eines Importmodells zu Direct Lake wurde eine bisher per Power-Query-Abfrage angelegte Measure-Tabelle durch eine Calculated Table mit einer leeren Hilfsspalte ersetzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1068s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? | 10:01 | Ein zentrales, datenhaltendes Objekt wie ein Lakehouse macht Power-BI-Modelle laut Artur deutlich stabiler und beschleunigt Aktualisierungen von zwei Stunden auf zwei Minuten. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=601s) |
| Warnung | Microsoft Fabric — braucht das wirklich jemand? | 15:08 | Eine Datei über den direkten Cloud-Link statt über die lokal synchronisierte SharePoint-Kopie einzubinden gilt laut Martin als schlecht gelöst und ist eine häufige Fehlerquelle. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=908s) |
| Fakt | Was ist Self-Service und warum ist das so schwer? | 17:22 | Tom Martens investiert bewusst begrenzte Lernzeit in DAX, Power Query, Python und Fabric-Notebooks, weil ihm das langfristig mehr Zeit und bessere Analysen ermöglicht. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1042s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? | 41:34 | Copilot kann Fachanwendern helfen, bestehende Power-Query-Dataflows automatisiert in schnelleren Code zu übersetzen. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2494s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Power BI Update Juni 2025](https://www.youtube.com/watch?v=LnNoXBIG7Lc) | 2025-06-01 | nur-zeitstempel | [00:00](https://www.youtube.com/watch?v=LnNoXBIG7Lc&t=0s) · [05:45](https://www.youtube.com/watch?v=LnNoXBIG7Lc&t=345s) |
| [Power BI Update August 2025](https://www.youtube.com/watch?v=jTXo4aEr07o) | 2025-08-01 | nur-zeitstempel | [00:34](https://www.youtube.com/watch?v=jTXo4aEr07o&t=34s) · [03:53](https://www.youtube.com/watch?v=jTXo4aEr07o&t=233s) |
| [Projektcontrolling mit dynamischen Arbeitstagen in Power BI](https://www.youtube.com/watch?v=cD-5z_Bq0N4) | 2025-05-01 | nur-zeitstempel | [08:34](https://www.youtube.com/watch?v=cD-5z_Bq0N4&t=514s) · [12:04](https://www.youtube.com/watch?v=cD-5z_Bq0N4&t=724s) · [13:39](https://www.youtube.com/watch?v=cD-5z_Bq0N4&t=819s) |
| [Daten-WG Special: Power BI vs. Qlik](https://www.youtube.com/watch?v=aYHk_V8n_CE) | 2025-10-01 | nur-zeitstempel | [22:22](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=1342s) · [35:40](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=2140s) · [38:52](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=2332s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datei-Quellen%20%C2%B7%20CSV%20%C2%B7%20Excel%20%C2%B7%20JSON%20%C2%B7%20Parquet) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Web-%20%26%20API-Quellen) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Klassifizierungen%20ableiten) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [27:07](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=1627s) · [49:35](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2975s) · [57:26](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=3446s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [06:28](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=388s) · [22:19](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1339s) · [25:34](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1534s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [06:50](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=410s) · [08:37](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=517s) · [10:21](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=621s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [08:27](https://www.youtube.com/watch?v=mTVeZzshLzE&t=507s) · [10:01](https://www.youtube.com/watch?v=mTVeZzshLzE&t=601s) · [40:00](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2400s) |
| [Power BI Update Oktober 2025](https://www.youtube.com/watch?v=LVSttJlhrqM) | 2025-10-01 | nur-zeitstempel | [04:21](https://www.youtube.com/watch?v=LVSttJlhrqM&t=261s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | nur-zeitstempel | [13:02](https://www.youtube.com/watch?v=TYmKrreMO3I&t=782s) · [35:49](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2149s) · [37:24](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2244s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [20:48](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1248s) · [22:26](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1346s) · [48:16](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2896s) |
| [Power BI Update Mai 2026](https://www.youtube.com/watch?v=psLPsI32sAs) | 2026-05-01 | nur-zeitstempel | [03:15](https://www.youtube.com/watch?v=psLPsI32sAs&t=195s) |
| [Power BI vs. Qlik](https://www.youtube.com/watch?v=vd1r02bj9Qk) | 2026-01-01 | kernaussagen+zeitstempel | [05:10](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=310s) · [30:45](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=1845s) |
| [Power BI Update September 2025](https://www.youtube.com/watch?v=6gQiIbyhWEc) | 2025-09-01 | nur-zeitstempel | [08:56](https://www.youtube.com/watch?v=6gQiIbyhWEc&t=536s) |
| [Daten-WG Deep Dive Financial Reporting - part 7](https://www.youtube.com/watch?v=232JhS9vbQ0) | 2025-09-01 | nur-zeitstempel | [03:25](https://www.youtube.com/watch?v=232JhS9vbQ0&t=205s) · [23:26](https://www.youtube.com/watch?v=232JhS9vbQ0&t=1406s) · [47:23](https://www.youtube.com/watch?v=232JhS9vbQ0&t=2843s) |
| [Unboxing MCP Server for Power BI Modelling](https://www.youtube.com/watch?v=iinfiHxznOU) | 2025-12-01 | nur-zeitstempel | [04:39](https://www.youtube.com/watch?v=iinfiHxznOU&t=279s) · [25:52](https://www.youtube.com/watch?v=iinfiHxznOU&t=1552s) · [30:11](https://www.youtube.com/watch?v=iinfiHxznOU&t=1811s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [49:26](https://www.youtube.com/watch?v=iymmxuXHh44&t=2966s) · [50:56](https://www.youtube.com/watch?v=iymmxuXHh44&t=3056s) · [1:05:42](https://www.youtube.com/watch?v=iymmxuXHh44&t=3942s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | nur-zeitstempel | [18:15](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1095s) · [41:19](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2479s) · [56:24](https://www.youtube.com/watch?v=bt81POE-9Ig&t=3384s) |
| [Visual Analytics with Power BI](https://www.youtube.com/watch?v=UxE0DPnLgIg) | 2021-09-01 | nur-zeitstempel | [21:54](https://www.youtube.com/watch?v=UxE0DPnLgIg&t=1314s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [17:48](https://www.youtube.com/watch?v=G8s96sHUHac&t=1068s) · [42:46](https://www.youtube.com/watch?v=G8s96sHUHac&t=2566s) · [1:08:31](https://www.youtube.com/watch?v=G8s96sHUHac&t=4111s) |
| [BI Thinkers Talk - Data Modelling - Fabric Data Days Edition](https://www.youtube.com/watch?v=mUALlPmGcEk) | 2025-11-01 | kernaussagen+zeitstempel | [22:42](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1362s) · [27:28](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1648s) · [50:29](https://www.youtube.com/watch?v=mUALlPmGcEk&t=3029s) |
| [Dein erstes Dashboard — Power-BI-Praxis-Pfad](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html#:~:text=So%20geht%27s) · [Abschnitt](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html#:~:text=Die%20Schrittliste%20ist%20dein%20Rezept) |
| [Daten-WG Life-Update \| State of Power BI, Fabric & AI-Tools](https://www.youtube.com/watch?v=d3HdhRe_nK8) | 2026-06-01 | nur-zeitstempel | [17:00](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1020s) · [26:17](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1577s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [49:13](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=2953s) · [57:15](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=3435s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [35:19](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2119s) · [40:30](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2430s) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [08:30](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=510s) · [10:21](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=621s) · [12:04](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=724s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [46:52](https://www.youtube.com/watch?v=VD1N68Fhoco&t=2812s) · [59:31](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3571s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [06:09](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=369s) · [29:00](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1740s) |
| [Daten-WG Special: Power BI vs. Qlik -part2](https://www.youtube.com/watch?v=_Vh5fDfHWz4) | 2025-10-01 | nur-zeitstempel | [12:08](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=728s) · [1:07:18](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=4038s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [55:41](https://www.youtube.com/watch?v=r416vanitYw&t=3341s) · [1:00:24](https://www.youtube.com/watch?v=r416vanitYw&t=3624s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [45:50](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2750s) · [1:08:50](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=4130s) |
| [BI Thinkers Talk - Data Modeling - Fabric Data Days Edition [EN]](https://www.youtube.com/watch?v=uxYFqwe_Wiw) | 2025-12-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) · [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) · [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [37:26](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2246s) · [41:00](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2460s) |
| [10 Jahre BI für alle? Was Power BI wirklich verändert hat](https://www.youtube.com/watch?v=9wl_PLvgvyc) | 2025-08-01 | nur-zeitstempel | [28:06](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1686s) |
| [Datenmodellierung ist Governance](https://www.youtube.com/watch?v=lH_-A8NAQ-k) | 2025-11-01 | nur-zeitstempel | [09:13](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=553s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [15:53](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=953s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Dataflow%20Gen2) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Weg%20C%20%C2%B7%20Shortcut%2C%20wenn%20Daten%20schon%20existieren) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Dataflow-Weg%20%28Low-Code%29) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [19:44](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1184s) |
| [Was ist Self-Service und warum ist das so schwer?](https://www.youtube.com/watch?v=EVsJ6zyGUWc) | — | kernaussagen+zeitstempel | [12:51](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=771s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Apower-query
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Apower-query&f=tool%3Apower-query
