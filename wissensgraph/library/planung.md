---
id: "topic:planung"
name: "Planung"
typ: thema
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 36
kernaussagen: 23
mit_kernaussagen: 6
aliase:
  - "Planning"
  - "Forecast"
  - "Budget"
  - "Plan"
  - "Planwerte"
---

# Planung

Das neue Planning-Feature, ehemals Lumel bzw. Inforiver, ist jetzt direkt in Microsoft Fabric integriert und benötigt keine zusätzliche Lizenz, sondern nur Fabric-Kapazität. Beim Anlegen eines Planning-Objekts wird automatisch eine Fabric SQL-Datenbank erstellt. Für Tabellen in Power Table ist ein Primärschlüssel zwingend erforderlich, auch wenn er zusammengesetzt sein kann.

## Aliase

Planning, Forecast, Budget, Plan, Planwerte

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Translytical Task Flows](translytical-task-flows.md) | gegensatz | belegt | 0 |
| [Paginated Reports](paginated-reports.md) | gegensatz | belegt | 0 |
| [Fabric Capacity](fabric-capacity.md) | setzt-voraus | belegt | 8 |
| [Semantic Model](semantic-model.md) | setzt-voraus | belegt | 9 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 31 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 29 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 29 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 25 |
| [Excel](excel.md) | ko-vorkommen | heuristik | 19 |
| [IBCS](ibcs.md) | ko-vorkommen | heuristik | 19 |
| [Daten-WG](daten-wg.md) | ko-vorkommen | heuristik | 12 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 12 |
| [KI](ki.md) | ko-vorkommen | heuristik | 11 |
| [Sternschema](sternschema.md) | ko-vorkommen | heuristik | 10 |
| [Sicherheit](sicherheit.md) | ko-vorkommen | heuristik | 9 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Meinung | GxP Talk - KI im regulierten Umfeld? | 16:48 | Martin unterscheidet Anwendungsfälle danach, ob eine KI-Aufgabe überhaupt GXP-reguliert ist, etwa ist Predictive Forecasting für die Budgetplanung nicht GXP-reguliert. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=1008s) |
| Fakt | Gurkenkrise in Island und der Bullwhip-Effekt - Christian Schneider beim Daten-WG Offsite | 00:00 | Seit rund 30 Jahren gibt es KI-Algorithmen und maschinelles Lernen, mit denen aus historischen Daten Muster für das klassische Forecasting abgeleitet werden können. | [▶](https://www.youtube.com/watch?v=sq8AWk_yNWM&t=0s) |
| Fakt | Gurkenkrise in Island und der Bullwhip-Effekt - Christian Schneider beim Daten-WG Offsite | 00:00 | Gutes Forecasting auf Basis historischer Daten ermöglicht es, weniger totes Kapital in Lagern zu binden und die Supply Chain zu optimieren. | [▶](https://www.youtube.com/watch?v=sq8AWk_yNWM&t=0s) |
| Fakt | Power BI Update März 2026 | 07:05 | In Microsoft Fabric gibt es jetzt neue Planning Items, mit denen sich Pläne direkt in Fabric anlegen lassen. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=425s) |
| Fakt | Power BI Update März 2026 | 07:05 | Die neuen Planning Items in Fabric gehen auf die zuvor als Lumel bzw. Info River bekannte Planungslösung zurück. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=425s) |
| Fakt | Power BI Update März 2026 | 07:05 | Mit Power Table lässt sich aus Fabric heraus nach Excel zurückschreiben. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=425s) |
| Empfehlung | Power BI Update März 2026 | 07:05 | Die neuen Planning Items in Fabric sollte eigentlich jeder einmal ausprobieren. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=425s) |
| Fakt | Fabric Planning unboxing | 07:46 | Das neue Planning-Feature, ehemals Lumel bzw. Inforiver, ist jetzt direkt in Microsoft Fabric integriert und benötigt keine zusätzliche Lizenz, sondern nur Fabric-Kapazität. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=466s) |
| Fakt | Fabric Planning unboxing | 09:22 | Beim Anlegen eines Planning-Objekts wird automatisch eine Fabric SQL-Datenbank erstellt. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=562s) |
| Empfehlung | Fabric Planning unboxing | 17:15 | Für Rückschreibungen mit Power Table wird empfohlen, eine eigene Datenbank anzulegen statt die automatisch erstellte Metadaten-Datenbank zu verwenden. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1035s) |
| Fakt | Fabric Planning unboxing | 21:58 | Für Tabellen in Power Table ist ein Primärschlüssel zwingend erforderlich, auch wenn er zusammengesetzt sein kann. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1318s) |
| Meinung | Fabric Planning unboxing | 23:30 | Power Table eignet sich nach Einschätzung des Testers vor allem für Master Data Management mit Excel-ähnlicher Bearbeitung. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1410s) |
| Warnung | Fabric Planning unboxing | 30:53 | Das Planning-Feature befindet sich noch in der Preview-Phase und lieferte beim Verbinden einer größeren Faktentabelle einen Internal Server Error. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1853s) |
| Fakt | Fabric Planning unboxing | 34:04 | Als Datenquelle für Planning-Objekte ist aktuell nur eine SQL-Datenbank wählbar, während Inforiver zusätzlich Lakehouse und Warehouse unterstützte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2044s) |
| Fakt | Fabric Planning unboxing | 42:10 | Das Planning Sheet bietet aus Inforiver bekannte Verteilfunktionen wie das anteilige Verteilen von Werten von Eltern- auf Kind-Zeilen und eine gewichtete Verteilung. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2530s) |
| Warnung | Fabric Planning unboxing | 50:19 | Das Zurückschreiben ist derzeit auf SQL-Datenbanken beschränkt, während Inforiver zusätzlich nach Snowflake oder SAP schreiben konnte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3019s) |
| Fakt | Fabric Planning unboxing | 53:42 | Zurückgeschriebene Planungswerte müssen erst wieder in das Semantic Model integriert werden, um sie im Modell nahezu in Echtzeit nutzen zu können. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3222s) |
| Fakt | Fabric Planning unboxing | 56:59 | Einzelne Datenpunkte lassen sich im Planning-Objekt per Rechtsklick kommentieren, und die Kommentare werden mit zurückgeschrieben. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3419s) |
| Warnung | Fabric Planning unboxing | 1:09:28 | Der Gantt-Objekttyp benötigt eine passende Datenstruktur mit eindeutigem Event sowie Start- und Enddatum und zeigte auf der genutzten Trial-Kapazität deutliche Ladezeit-Probleme. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=4168s) |
| Fakt | Fabric Planning unboxing | 1:18:48 | Row-Level Security für Planning-Objekte greift über das zugrunde liegende Semantic Model, das für den Zugriff genutzt wird. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=4728s) |
| Meinung | Fabric Planning unboxing | 1:24:16 | Das Planning-Feature wird funktional positiv bewertet, gilt wegen Optik, UX und Performance aber noch nicht als reif für einen breiten Rollout an Endnutzer in großen Unternehmen. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=5056s) |
| Meinung | Denken in Tabellen | 23:40 | Bei einem Ist-Budget-Vergleich mit unterschiedlicher Granularität von Kunde und Produkt sowie täglicher und monatlicher Frequenz wird eine flache Tabelle mit Field Parameters schnell unübersichtlich, während ein Sternschema die Zusammenführung vereinfacht. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1420s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 | 48:27 | Fabric Planning mit Lumel erfordert keine separate Lizenz und wird ausschließlich über Capacity-Unit-Verbrauch abgerechnet. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2907s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [07:46](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=466s) · [32:27](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1947s) · [48:35](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2915s) |
| [Was wir von Iron Man für Datenprojekte lernen können (data:unplugged Vortrag)](https://www.youtube.com/watch?v=qVZhboahaDE) | 2025-04-01 | nur-zeitstempel | [01:33](https://www.youtube.com/watch?v=qVZhboahaDE&t=93s) · [05:00](https://www.youtube.com/watch?v=qVZhboahaDE&t=300s) · [08:13](https://www.youtube.com/watch?v=qVZhboahaDE&t=493s) |
| [Business Chart Builder — Anleitung](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html#:~:text=Abweichungen%20%26%20Szenarien%20%E2%80%94%20das%20Herzst%C3%BCck) · [Abschnitt](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html#:~:text=Neu%20%E2%80%94%20inspiriert%20von%20der%20FT%20Visual%20Vocabulary) · [Abschnitt](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html#:~:text=Export%20%E2%80%94%20der%20eigentliche%20Trick) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [42:00](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2520s) · [43:34](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2614s) · [53:23](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=3203s) |
| [Power BI Update März 2026](https://www.youtube.com/watch?v=ASwcPvbMRZc) | 2026-03-01 | kernaussagen+zeitstempel | [07:05](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=425s) · [07:53](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=473s) |
| [GxP Talk - Testing im GxP-Umfeld](https://www.youtube.com/watch?v=B0_sSJQVG8w) | 2026-04-01 | kernaussagen+zeitstempel | [08:14](https://www.youtube.com/watch?v=B0_sSJQVG8w&t=494s) · [09:51](https://www.youtube.com/watch?v=B0_sSJQVG8w&t=591s) · [24:13](https://www.youtube.com/watch?v=B0_sSJQVG8w&t=1453s) |
| [Wie war die Daten-WG? · Im Gespräch mit Artur König](https://www.youtube.com/watch?v=z4ZeHPzIeeU) | 2025-03-01 | nur-zeitstempel | [22:25](https://www.youtube.com/watch?v=z4ZeHPzIeeU&t=1345s) · [33:02](https://www.youtube.com/watch?v=z4ZeHPzIeeU&t=1982s) |
| [ChartKitchen byDatenWG — Documentation](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html#:~:text=01%20%C2%B7%20What%20is%20ChartKitchen%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html#:~:text=Field%20roles) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html#:~:text=3%20%C2%B7%20First%20comparison%20with%20PY) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [03:46](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=226s) · [05:30](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=330s) · [09:01](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=541s) |
| [ChartKitchen byDatenWG — Dokumentation](https://datenwgknowledgekitchen.com/chartkitchen-doku.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku.html#:~:text=01%20%C2%B7%20Was%20ist%20ChartKitchen%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku.html#:~:text=Feldrollen) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku.html#:~:text=3%20%C2%B7%20Erster%20Vergleich%20mit%20PY) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=SAY%20%E2%80%94%20Convey%20a%20message) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=UNIFY%20%E2%80%94%20Apply%20semantic%20notation) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=DBA%20einbinden) |
| [The Day After Tomorrow – Nach der Einführung geht es erst richtig los \| Power BI Summit 2023](https://www.youtube.com/watch?v=KwySyTxW_EI) | 2023-03-01 | nur-zeitstempel | [24:06](https://www.youtube.com/watch?v=KwySyTxW_EI&t=1446s) · [36:07](https://www.youtube.com/watch?v=KwySyTxW_EI&t=2167s) |
| [BI Thinkers Talk - Data Modelling - Fabric Data Days Edition](https://www.youtube.com/watch?v=mUALlPmGcEk) | 2025-11-01 | kernaussagen+zeitstempel | [12:42](https://www.youtube.com/watch?v=mUALlPmGcEk&t=762s) · [24:18](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1458s) · [32:15](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1935s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [24:03](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1443s) · [35:07](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=2107s) · [39:00](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=2340s) |
| [Wie war die Daten-WG 2025? (Teil 1)](https://www.youtube.com/watch?v=aEXtFWW-pmo) | 2025-05-01 | nur-zeitstempel | [24:41](https://www.youtube.com/watch?v=aEXtFWW-pmo&t=1481s) · [32:39](https://www.youtube.com/watch?v=aEXtFWW-pmo&t=1959s) |
| [Power BI Update September 2025](https://www.youtube.com/watch?v=6gQiIbyhWEc) | 2025-09-01 | nur-zeitstempel | [11:14](https://www.youtube.com/watch?v=6gQiIbyhWEc&t=674s) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [03:07](https://www.youtube.com/watch?v=luk4S4ukKmg&t=187s) · [32:17](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1937s) · [1:00:08](https://www.youtube.com/watch?v=luk4S4ukKmg&t=3608s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [22:07](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1327s) · [23:40](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1420s) |
| [Microsoft Power BI Einführung \| Florian Wiefel \| Hans-Ulrik Harnisch \| M365 Summit Mai 2022](https://www.youtube.com/watch?v=Z8vpSSOmG24) | 2022-06-01 | nur-zeitstempel | [06:03](https://www.youtube.com/watch?v=Z8vpSSOmG24&t=363s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [34:14](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2054s) · [36:01](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2161s) |
| [KI hat mich abgelöst \| Daten-WG Podcast mit Burkhardt Gasber](https://www.youtube.com/watch?v=oh-3_65IQ2Q) | 2026-08-01 | nur-zeitstempel | [01:36](https://www.youtube.com/watch?v=oh-3_65IQ2Q&t=96s) · [46:02](https://www.youtube.com/watch?v=oh-3_65IQ2Q&t=2762s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [09:26](https://www.youtube.com/watch?v=lZvpCBMKASM&t=566s) · [30:11](https://www.youtube.com/watch?v=lZvpCBMKASM&t=1811s) |
| [GxP Talk - Validierung vs. Agilität](https://www.youtube.com/watch?v=KO_qFge77o8) | 2026-03-01 | kernaussagen+zeitstempel | [33:45](https://www.youtube.com/watch?v=KO_qFge77o8&t=2025s) · [35:19](https://www.youtube.com/watch?v=KO_qFge77o8&t=2119s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | nur-zeitstempel | [06:35](https://www.youtube.com/watch?v=DQENmzAkNqw&t=395s) · [42:07](https://www.youtube.com/watch?v=DQENmzAkNqw&t=2527s) |
| [Daten-WG 2026 Lineup](https://www.youtube.com/watch?v=AX7b8_aNekw) | 2026-05-01 | nur-zeitstempel | [00:00](https://www.youtube.com/watch?v=AX7b8_aNekw&t=0s) · [01:43](https://www.youtube.com/watch?v=AX7b8_aNekw&t=103s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [22:11](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=1331s) · [23:47](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=1427s) |
| [Von Patronen zu Prozessen](https://www.youtube.com/watch?v=0cHtxIm7fVw) | 2025-08-01 | nur-zeitstempel | [12:35](https://www.youtube.com/watch?v=0cHtxIm7fVw&t=755s) |
| [Von Patronen zu Prozessen (nur Ton)](https://www.youtube.com/watch?v=s3CveEVoDvo) | 2025-07-01 | nur-zeitstempel | [12:35](https://www.youtube.com/watch?v=s3CveEVoDvo&t=755s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [47:43](https://www.youtube.com/watch?v=r416vanitYw&t=2863s) · [50:55](https://www.youtube.com/watch?v=r416vanitYw&t=3055s) |
| [BI Thinkers Talk - Data Modeling - Fabric Data Days Edition [EN]](https://www.youtube.com/watch?v=uxYFqwe_Wiw) | 2025-12-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) · [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) · [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) |
| [Was ist Self-Service und warum ist das so schwer?](https://www.youtube.com/watch?v=EVsJ6zyGUWc) | — | kernaussagen+zeitstempel | [38:20](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=2300s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Betriebs-Frage) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Lakehouse%20erstellen) |
| [Fabric Planning Hands-On (2)](https://www.youtube.com/watch?v=mIQU6gtnwoA) | 2026-05-01 | nur-metadaten | — |
| [Fabric Planning Hands-On (3)](https://www.youtube.com/watch?v=MmPs7IH0nBE) | 2026-05-01 | nur-metadaten | — |
| [Fabric Planning Hands-On](https://www.youtube.com/watch?v=YRoJ_6t3VrE) | 2026-04-01 | nur-metadaten | — |
| [How to Write Back](https://www.youtube.com/watch?v=HQaLWjA-E2E) | 2025-12-01 | nur-metadaten | — |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Aplanung
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Aplanung&f=topic%3Aplanung
