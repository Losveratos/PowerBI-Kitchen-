---
id: "topic:ibcs"
name: "IBCS"
typ: thema
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 21
kernaussagen: 7
mit_kernaussagen: 4
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/ibcs.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/ibcs.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/ibcs.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/ibcs.json"
aliase:
  - "Hichert"
  - "Semantic Notation"
  - "SUCCESS"
  - "Notation"
---

# IBCS

Für die Umsetzung von IBCS-konformen Charts in Power BI werden Custom Visuals als notwendig beschrieben, weil native Bordmittel dafür nicht ausreichen. (Stand 2025-07) Das automatisiert erzeugte Balkendiagramm kam IBCS bereits nahe, weil es eine sortierte Y-Achse statt einer Kategorien-X-Achse nutzte, Gridlines entfernte und Data Labels beibehielt. (Stand 2026-04) Für IBCS-konforme Inline-Variance-Charts verwendet der Fixer keine Custom Visuals, sondern die Error Bars der Power-BI-Core-Visuals. (Stand 2026-04)

## Aliase

Hichert, Semantic Notation, SUCCESS, Notation

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Semantic Model](semantic-model.md) | IBCS setzt-voraus Semantic Model | automatisch extrahiert, Quellenstelle vorhanden | „wir wollen eigentlich eine Berichtsänderung, aber dazu braucht Modeländerung“ (BI Thinkers Talk nr.75, 2026-04) | 0 |
| [Custom Visuals](custom-visuals.md) | IBCS setzt-voraus Custom Visuals | automatisch extrahiert, Quellenstelle vorhanden | „wer mal versucht hat irgendwas nachzubauen, was Richtung IBCS geht und kein Custom nutzt, der ist ein absoluter Masochist“ (10 Jahre Power BI, 2025-07) | 14 |
| [Visualisierung](visualisierung.md) | IBCS und Visualisierung im selben Segment | Heuristik, gezählt |  | 56 |
| [Reporting](reporting.md) | IBCS und Reporting im selben Segment | Heuristik, gezählt |  | 41 |
| [Power BI](power-bi.md) | IBCS und Power BI im selben Segment | Heuristik, gezählt |  | 38 |
| [Planung](planung.md) | IBCS und Planung im selben Segment | Heuristik, gezählt |  | 19 |
| [Zebra BI](zebra-bi.md) | IBCS und Zebra BI im selben Segment | Heuristik, gezählt |  | 9 |
| [DAX](dax.md) | IBCS und DAX im selben Segment | Heuristik, gezählt |  | 7 |
| [KI](ki.md) | IBCS und KI im selben Segment | Heuristik, gezählt |  | 6 |
| [Power BI Desktop](power-bi-desktop.md) | IBCS und Power BI Desktop im selben Segment | Heuristik, gezählt |  | 6 |
| [Daten-WG](daten-wg.md) | IBCS und Daten-WG im selben Segment | Heuristik, gezählt |  | 5 |
| [Power BI Service](power-bi-service.md) | IBCS und Power BI Service im selben Segment | Heuristik, gezählt |  | 4 |
| [Deneb](deneb.md) | IBCS und Deneb im selben Segment | Heuristik, gezählt |  | 4 |
| [SAP](sap.md) | IBCS und SAP im selben Segment | Heuristik, gezählt |  | 4 |
| [Performance](performance.md) | IBCS und Performance im selben Segment | Heuristik, gezählt |  | 3 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Meinung | BI Thinkers Talk nr.76 | 2026-05 | 55:18 | Abschnittsanfang | Einer der Gäste hält es für vorstellbar, mit KI-Vibecoding in überschaubarer Zeit eigene IBCS-Visuals zu bauen, die kommerzielle Tools wie Zebra BI ersetzen könnten. | [▶](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=3318s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 20:46 | auf die Sekunde | Das automatisiert erzeugte Balkendiagramm kam IBCS bereits nahe, weil es eine sortierte Y-Achse statt einer Kategorien-X-Achse nutzte, Gridlines entfernte und Data Labels beibehielt. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1246s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 22:53 | auf die Sekunde | Für IBCS-konforme Inline-Variance-Charts verwendet der Fixer keine Custom Visuals, sondern die Error Bars der Power-BI-Core-Visuals. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1373s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 28:35 | auf die Sekunde | Die Funktion "Fix IBCS Variance Chart" des Fixers fügt automatisiert rund 175 Measures für Labels, Deltas und Arrow-Bars in das Semantic Model ein. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1715s) |
| Fakt | 10 Jahre Power BI | 2025-07 | 52:20 | auf die Sekunde | Für die Umsetzung von IBCS-konformen Charts in Power BI werden Custom Visuals als notwendig beschrieben, weil native Bordmittel dafür nicht ausreichen. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3140s) |
| Warnung | 10 Jahre Power BI | 2025-07 | 1:25:12 | auf die Sekunde | Mit Copilot lassen sich IBCS-konforme Visualisierungen aktuell kaum umsetzen, weil kein nativer Zugriff auf spezialisierte Custom Visuals wie Integrated Variance Charts besteht. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=5112s) |
| Meinung | Fabric & Power BI Quarterly · 2026-2 |  | 51:30 | Abschnittsanfang | Die Intelligence Sheets von Lumel könnten in klassischem, tabellarisch geprägtem Finanz- und Controlling-Reporting Paginated Reports in einigen Fällen ersetzen. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=3090s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [ChartKitchen byDatenWG — Quick Start](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html#:~:text=01%20%C2%B7%20Get%20going%20in%20three%20steps) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html#:~:text=02%20%C2%B7%20Continue%20in%20the%20documentation) |
| [ChartKitchen byDatenWG — Schnellstart](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html#:~:text=01%20%C2%B7%20In%20drei%20Schritten%20loslegen) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html#:~:text=02%20%C2%B7%20Weiter%20in%20der%20Dokumentation) |
| [Business Chart Builder — Anleitung](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html#:~:text=Abweichungen%20%26%20Szenarien%20%E2%80%94%20das%20Herzst%C3%BCck) · [Abschnitt](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html#:~:text=IBCS-Check%20%28eingebauter%20Linter%29) · [Abschnitt](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html#:~:text=Auch%20ohne%20Power%20BI%3A%20schnell%20starten%2C%20annotieren%2C%20ausgeben%20%F0%9F%98%89) |
| [ChartKitchen byDatenWG — Documentation](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html#:~:text=01%20%C2%B7%20What%20is%20ChartKitchen%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html#:~:text=Layout) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html#:~:text=A%20rounding%20note%20appears%20below%20the%20%CE%A3%20row.) |
| [ChartKitchen byDatenWG — Dokumentation](https://datenwgknowledgekitchen.com/chartkitchen-doku.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku.html#:~:text=01%20%C2%B7%20Was%20ist%20ChartKitchen%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku.html#:~:text=Layout) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku.html#:~:text=Unter%20der%20%CE%A3-Zeile%20erscheint%20ein%20Rundungshinweis.) |
| [Report-Design als Framework — ein Skill für Power BI](https://datenwgknowledgekitchen.com/powerbi-design-skill.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/powerbi-design-skill.html#:~:text=F%C3%BCr%20wen%3A%20%2AMenschen%20und%20Agenten%2A) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=06%20%C2%B7%20Deep%20Dive%3A%20%2AIBCS%2A%20%26%20Visualisierung) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=UNIFY%20%E2%80%94%20Apply%20semantic%20notation) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Hatched%20%C2%B7%20Forecast%20%2F%20Vorjahr%20%28FC%2C%20PY%29) |
| [Objektive Daten gibt es nicht](https://www.youtube.com/watch?v=-_4bfrjRCVo) | 2026-06-01 | nur-zeitstempel | [16:30](https://www.youtube.com/watch?v=-_4bfrjRCVo&t=990s) · [44:22](https://www.youtube.com/watch?v=-_4bfrjRCVo&t=2662s) · [45:55](https://www.youtube.com/watch?v=-_4bfrjRCVo&t=2755s) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [37:28](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=2248s) · [52:08](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3128s) · [58:28](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3508s) |
| [BI Thinkers Talk nr.75](https://www.youtube.com/watch?v=BQdSo6ZnmKY) | 2026-04-01 | kernaussagen+zeitstempel | [17:24](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1044s) · [28:26](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1706s) · [31:33](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1893s) |
| [Fabric Workload Demo mit Alexander Korn und Lukasz Obst](https://www.youtube.com/watch?v=e50qKdVn-24) | 2026-08-01 | kernaussagen+zeitstempel | [20:43](https://www.youtube.com/watch?v=e50qKdVn-24&t=1243s) |
| [10 Jahre BI für alle? Was Power BI wirklich verändert hat](https://www.youtube.com/watch?v=9wl_PLvgvyc) | 2025-08-01 | nur-zeitstempel | [29:52](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1792s) |
| [Boring Charts, Better Insights](https://www.youtube.com/watch?v=inko8wG9jlY) | 2025-10-01 | nur-zeitstempel | [17:36](https://www.youtube.com/watch?v=inko8wG9jlY&t=1056s) |
| [Was ist Self-Service und warum ist das so schwer?](https://www.youtube.com/watch?v=EVsJ6zyGUWc) | — | kernaussagen+zeitstempel | [10:23](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=623s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [48:27](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2907s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [55:25](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3325s) |
| [Daten-WG 2026 Lineup](https://www.youtube.com/watch?v=AX7b8_aNekw) | 2026-05-01 | nur-zeitstempel | [12:18](https://www.youtube.com/watch?v=AX7b8_aNekw&t=738s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | kernaussagen+zeitstempel | [08:05](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=485s) |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |
| [BI Thinkers Talk nr.76](https://www.youtube.com/watch?v=mlkP-6i5Kq8) | 2026-05-01 | kernaussagen+zeitstempel | [55:18](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=3318s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Bericht%20anlegen) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Visuals%20bauen) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Aibcs
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Aibcs&f=topic%3Aibcs
