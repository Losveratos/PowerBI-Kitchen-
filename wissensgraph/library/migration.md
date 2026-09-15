---
id: "topic:migration"
name: "Migration"
typ: thema
stand: "2026-09-15"
build: "20260915-2009"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 17
kernaussagen: 10
mit_kernaussagen: 5
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/migration.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/migration.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/migration.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/migration.json"
aliase:
  - "migrieren"
  - "Ablösung"
  - "migriert"
  - "Umstieg"
---

# Migration

Der Migration Accelerator in der Fabric Toolbox macht Abhängigkeiten von Dataflow Gen 1 sichtbar, migriert sie aber nicht automatisch. Das Source-System der Migration hatte über 600 SQL-Tabellen. Das neu gebaute Warehouse hatte am Ende über 150 SQL-Tabellen im Gold-Layer.

## Aliase

migrieren, Ablösung, migriert, Umstieg

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Microsoft Fabric](microsoft-fabric.md) | Migration und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 19 |
| [Power BI](power-bi.md) | Migration und Power BI im selben Segment | Heuristik, gezählt |  | 11 |
| [Warehouse](warehouse.md) | Migration und Warehouse im selben Segment | Heuristik, gezählt |  | 10 |
| [Lizenzen](lizenzen.md) | Migration und Lizenzen im selben Segment | Heuristik, gezählt |  | 8 |
| [Reporting](reporting.md) | Migration und Reporting im selben Segment | Heuristik, gezählt |  | 7 |
| [Premium](premium.md) | Migration und Premium im selben Segment | Heuristik, gezählt |  | 6 |
| [Fabric Capacity](fabric-capacity.md) | Migration und Fabric Capacity im selben Segment | Heuristik, gezählt |  | 6 |
| [Lakehouse](lakehouse.md) | Migration und Lakehouse im selben Segment | Heuristik, gezählt |  | 6 |
| [Dataflow](dataflow.md) | Migration und Dataflow im selben Segment | Heuristik, gezählt |  | 5 |
| [Visualisierung](visualisierung.md) | Migration und Visualisierung im selben Segment | Heuristik, gezählt |  | 5 |
| [SQL](sql.md) | Migration und SQL im selben Segment | Heuristik, gezählt |  | 5 |
| [Excel](excel.md) | Migration und Excel im selben Segment | Heuristik, gezählt |  | 5 |
| [Refresh](refresh.md) | Migration und Refresh im selben Segment | Heuristik, gezählt |  | 5 |
| [Data Pipeline](data-pipeline.md) | Migration und Data Pipeline im selben Segment | Heuristik, gezählt |  | 5 |
| [Projektmanagement](projektmanagement.md) | Migration und Projektmanagement im selben Segment | Heuristik, gezählt |  | 4 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Empfehlung | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 00:08 | auf die Sekunde | Der Notebook-Aufruf eignet sich, um nach dem Hochladen von On-Premises-Daten Richtung Fabric direkt eine Weiterverarbeitung anzustoßen. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=8s) |
| Empfehlung | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 2026-02 | 06:23 | auf die Sekunde | Die vorgestellte Lösung ermöglicht es, Daten per SSIS von einer lokalen Umgebung nach Fabric zu bringen und anschließend automatisiert per Notebook zu importieren. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=383s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 00:08 | auf die Sekunde | Statt Daten per Pull aus Fabric abzuholen, kann man vorhandene lokale Infrastruktur nutzen, um Daten per Push Richtung Fabric zu bringen. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=8s) |
| Fakt | Fabric & Power BI Quarterly · 2025 Q3 |  | 03:33 | auf die Sekunde | Microsoft hat sich entschieden, DataMarts abzuloesen, weil deren Mehrwert gegenueber Fabric mit Warehouse und Dataflows Gen 2 in der Community zunehmend infrage gestellt wurde. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=213s) |
| Empfehlung | Fabric & Power BI Quarterly · 2025 Q3 |  | 05:31 | auf die Sekunde | Fuer kleinere Kunden, die DataMarts bisher ohne Premium Per User genutzt haben, lohnt sich beim Umstieg schon eine kleine F2-Kapazitaet. | [▶](https://www.youtube.com/watch?v=lZvpCBMKASM&t=331s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 09:12 | auf die Sekunde | Das Source-System der Migration hatte über 600 SQL-Tabellen. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=552s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 09:13 | auf die Sekunde | Das neu gebaute Warehouse hatte am Ende über 150 SQL-Tabellen im Gold-Layer. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=553s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 |  | 15:37 | auf die Sekunde | Der Migration Accelerator in der Fabric Toolbox macht Abhängigkeiten von Dataflow Gen 1 sichtbar, migriert sie aber nicht automatisch. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=937s) |
| Fakt | 600 SQL-Tabellen in Fabric |  | 15:54 | auf die Sekunde | Der Kunde des Migrationsprojekts wollte möglichst wenig an der bestehenden ETL-Logik ändern, um alte und neue Lösung eins zu eins vergleichen zu können. | [▶](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=954s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-2 |  | 20:12 | auf die Sekunde | Es wird empfohlen, keine neuen Dataflows Gen 1 mehr anzulegen. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1212s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [06:02](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=362s) · [14:21](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=861s) · [15:38](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=938s) |
| [Automatisierung gewinnt \| Daten-WG Podcast mit Reinhard Mense](https://www.youtube.com/watch?v=3-hXnNLKnAw) | 2026-07-01 | nur-zeitstempel | [04:39](https://www.youtube.com/watch?v=3-hXnNLKnAw&t=279s) · [35:32](https://www.youtube.com/watch?v=3-hXnNLKnAw&t=2132s) · [37:30](https://www.youtube.com/watch?v=3-hXnNLKnAw&t=2250s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | kernaussagen+zeitstempel | [07:50](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=470s) · [09:31](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=571s) · [18:22](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1102s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [14:21](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=861s) |
| [Microsoft Power BI Einführung \| Florian Wiefel \| Hans-Ulrik Harnisch \| M365 Summit Mai 2022](https://www.youtube.com/watch?v=Z8vpSSOmG24) | 2022-06-01 | kernaussagen+zeitstempel | [36:09](https://www.youtube.com/watch?v=Z8vpSSOmG24&t=2169s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20Fabric%20nicht%20ersetzt) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20wichtigsten%20Regeln) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Sicherheit%20%26%20Kosten) |
| [Was machen die eigentlich? \| Daten-WG Podcast mit Alexander Korn und Lukasz Obst](https://www.youtube.com/watch?v=_C69B0i-QQA) | 2026-08-01 | nur-zeitstempel | [06:32](https://www.youtube.com/watch?v=_C69B0i-QQA&t=392s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | kernaussagen+zeitstempel | [03:02](https://www.youtube.com/watch?v=lZvpCBMKASM&t=182s) · [52:08](https://www.youtube.com/watch?v=lZvpCBMKASM&t=3128s) |
| [Power BI vs. Qlik](https://www.youtube.com/watch?v=vd1r02bj9Qk) | 2026-01-01 | kernaussagen+zeitstempel | [08:52](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=532s) |
| [The Power of User Groups](https://www.youtube.com/watch?v=SSUpe1JON9Y) | 2025-10-01 | nur-zeitstempel | [16:39](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=999s) |
| [The Day After Tomorrow – Nach der Einführung geht es erst richtig los \| Power BI Summit 2023](https://www.youtube.com/watch?v=KwySyTxW_EI) | 2023-03-01 | nur-zeitstempel | [42:08](https://www.youtube.com/watch?v=KwySyTxW_EI&t=2528s) |
| [Visual-Standards-Rechner: Paid, Flexibel oder MacGyver?](https://datenwgknowledgekitchen.com/visual-standards-rechner.html) | 2026-09-15 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/visual-standards-rechner.html#:~:text=v0.12%20%28Paket%20C1%29%3A%20der%20Rechenkern%20rechnet%20Jahr%20fuer%20Jahr) · [Abschnitt](https://datenwgknowledgekitchen.com/visual-standards-rechner.html#:~:text=Klickpfad%20im%20Detail) |
| [Prinzipien oder Paragrafen](https://www.youtube.com/watch?v=6WhWLcuFvZE) | 2026-02-01 | kernaussagen+zeitstempel | [03:56](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=236s) |
| [GxP Talk - Testing im GxP-Umfeld](https://www.youtube.com/watch?v=B0_sSJQVG8w) | 2026-04-01 | kernaussagen+zeitstempel | [29:01](https://www.youtube.com/watch?v=B0_sSJQVG8w&t=1741s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | kernaussagen+zeitstempel | [19:29](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1169s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Soll%20man%20von%20Power%20BI%20Premium%20auf%20Fabric%20umstellen%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Surrogate%20Keys%20vor%20Business%20Keys) |
| [Von Patronen zu Prozessen (nur Ton)](https://www.youtube.com/watch?v=s3CveEVoDvo) | 2025-07-01 | nur-zeitstempel | — |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Amigration
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Amigration&f=topic%3Amigration
