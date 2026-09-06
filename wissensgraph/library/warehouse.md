---
id: "tool:warehouse"
name: "Warehouse"
typ: tool
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 42
kernaussagen: 14
mit_kernaussagen: 7
aliase:
  - "Data Warehouse"
  - "DWH"
  - "Datawarehouse"
  - "Data Warehousing"
---

# Warehouse

Der Push-Ansatz mit SSIS ist in der offiziellen Microsoft-Dokumentation im Bereich Warehousing beschrieben. SQL Server Integration Services wird genutzt, um Daten in das Fabric Warehouse zu bringen. In der Zielarchitektur schreiben die Integration Services die Daten aus der On-Premises-Umgebung zunächst in ein Azure Storage, von wo sie ins Warehouse oder Lakehouse geladen werden können.

## Aliase

Data Warehouse, DWH, Datawarehouse, Data Warehousing

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Lakehouse](lakehouse.md) | ersetzt | belegt | 71 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 76 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 59 |
| [Dataflow](dataflow.md) | ko-vorkommen | heuristik | 30 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 29 |
| [Notebook](notebook.md) | ko-vorkommen | heuristik | 26 |
| [OneLake](onelake.md) | ko-vorkommen | heuristik | 25 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 24 |
| [Data Pipeline](data-pipeline.md) | ko-vorkommen | heuristik | 23 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 20 |
| [Spark](spark.md) | ko-vorkommen | heuristik | 18 |
| [Delta Lake](delta-lake.md) | ko-vorkommen | heuristik | 18 |
| [Workspace](workspace.md) | ko-vorkommen | heuristik | 17 |
| [Echtzeit](echtzeit.md) | ko-vorkommen | heuristik | 17 |
| [Refresh](refresh.md) | ko-vorkommen | heuristik | 15 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 03:19 | Bill Inmons Buch von 1993 gilt als Auslöser der Data-Warehouse-Diskussion. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=199s) |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 06:29 | Ralph Kimball veröffentlichte Mitte der 1990er-Jahre ein Buch, in dem er forderte, Data Warehouses stets mit einem Sternschema beziehungsweise dimensionaler Modellierung aufzubauen. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=389s) |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 06:29 | Zwischen Ralph Kimball und Bill Inmon entstand ein langjähriger Grundsatzstreit darüber, ob Data Warehouses dimensional per Sternschema oder relational in dritter Normalform modelliert werden sollten. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=389s) |
| Meinung | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 06:29 | Peter Gluchowski schätzt, dass sich das Sternschema in größeren Unternehmen eher auf der Data-Mart-Ebene findet als auf der Ebene des Kern-Data-Warehouse. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=389s) |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 08:12 | Größere Unternehmen setzen auf der Ebene des Kern-Data-Warehouse heute häufig entweder auf normalisierte Datenhaltung oder auf Data Vault. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=492s) |
| Empfehlung | LogiMAT Arena Atrium 2026 \| Expert Forum - Supply Chain Risiko Management | 16:01 | Statt sofort eine komplexe Architektur mit Machine Learning aufzubauen, empfiehlt es sich, zunächst nur die ERP-Daten täglich in ein Warehouse oder OneLake zu laden. | [▶](https://www.youtube.com/watch?v=DFw664hd1IE&t=961s) |
| Fakt | Fabric Planning unboxing | 34:04 | Als Datenquelle für Planning-Objekte ist aktuell nur eine SQL-Datenbank wählbar, während Inforiver zusätzlich Lakehouse und Warehouse unterstützte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2044s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 09:01 | Mit der VS-Code-Erweiterung für Fabric lässt sich ein Direct-Lake-Modell innerhalb weniger Minuten von einer SQL-Datenbank auf ein Warehouse umziehen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=541s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 00:28 | Der Push-Ansatz mit SSIS ist in der offiziellen Microsoft-Dokumentation im Bereich Warehousing beschrieben. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=28s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 00:41 | SQL Server Integration Services wird genutzt, um Daten in das Fabric Warehouse zu bringen. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=41s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 01:15 | In der Zielarchitektur schreiben die Integration Services die Daten aus der On-Premises-Umgebung zunächst in ein Azure Storage, von wo sie ins Warehouse oder Lakehouse geladen werden können. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=75s) |
| Empfehlung | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 10:09 | Die im Lakehouse als Rohdaten liegenden Dateien lassen sich per COPY-INTO-Befehl in eine Warehouse-Tabelle laden oder mit einem Notebook, etwa in Python, weiterverarbeiten. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=609s) |
| Warnung | BI Thinkers Talk Nr.62 | 47:40 | Direkt in ein Fabric-Warehouse zu schreiben gilt laut dem Sprecher nicht als Best Practice. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2860s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? | 21:24 | Der Wechsel von einem Lakehouse zu einem Warehouse lässt sich in der Praxis in wenigen Minuten umsetzen, da ein neues Warehouse leer und schnell angelegt ist. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1284s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Mythos Data Vault und richtig große Modelle](https://www.youtube.com/watch?v=rrCi0lnGrCg) | 2025-07-01 | nur-zeitstempel | [01:47](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=107s) · [13:42](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=822s) · [24:37](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1477s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=06%20%C2%B7%20Zusammenfassung%20%26%20%2Atypische%20Architekturen%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Workload-Landkarte%20%28Stand%202026%29) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20das%20Warehouse%20exklusiv%20kann) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [19:55](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1195s) · [21:17](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1277s) · [22:53](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1373s) |
| [10 Jahre BI für alle? Was Power BI wirklich verändert hat](https://www.youtube.com/watch?v=9wl_PLvgvyc) | 2025-08-01 | nur-zeitstempel | [01:37](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=97s) · [18:41](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1121s) · [20:24](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1224s) |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [00:41](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=41s) · [01:15](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=75s) · [10:09](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=609s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [12:15](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=735s) · [17:21](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1041s) · [22:06](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1326s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [10:33](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=633s) · [15:50](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=950s) · [37:56](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2276s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [03:02](https://www.youtube.com/watch?v=lZvpCBMKASM&t=182s) · [04:43](https://www.youtube.com/watch?v=lZvpCBMKASM&t=283s) · [33:41](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2021s) |
| [Power BI vs. Qlik](https://www.youtube.com/watch?v=vd1r02bj9Qk) | 2026-01-01 | kernaussagen+zeitstempel | [05:10](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=310s) · [07:12](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=432s) · [23:07](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=1387s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [10:01](https://www.youtube.com/watch?v=mTVeZzshLzE&t=601s) · [21:24](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1284s) · [36:01](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2161s) |
| [Power BI Update August 2025](https://www.youtube.com/watch?v=jTXo4aEr07o) | 2025-08-01 | nur-zeitstempel | [01:21](https://www.youtube.com/watch?v=jTXo4aEr07o&t=81s) |
| [Was wir von Iron Man für Datenprojekte lernen können (data:unplugged Vortrag)](https://www.youtube.com/watch?v=qVZhboahaDE) | 2025-04-01 | nur-zeitstempel | [06:36](https://www.youtube.com/watch?v=qVZhboahaDE&t=396s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [03:18](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=198s) · [32:03](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1923s) · [46:32](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2792s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | nur-zeitstempel | [09:00](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=540s) · [23:53](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1433s) · [25:05](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1505s) |
| [The Day After Tomorrow – Nach der Einführung geht es erst richtig los \| Power BI Summit 2023](https://www.youtube.com/watch?v=KwySyTxW_EI) | 2023-03-01 | nur-zeitstempel | [33:07](https://www.youtube.com/watch?v=KwySyTxW_EI&t=1987s) · [54:13](https://www.youtube.com/watch?v=KwySyTxW_EI&t=3253s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [11:25](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=685s) · [17:15](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1035s) · [19:29](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1169s) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [02:40](https://www.youtube.com/watch?v=YzfcMurbWNc&t=160s) · [28:09](https://www.youtube.com/watch?v=YzfcMurbWNc&t=1689s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [36:23](https://www.youtube.com/watch?v=G8s96sHUHac&t=2183s) · [39:25](https://www.youtube.com/watch?v=G8s96sHUHac&t=2365s) · [41:02](https://www.youtube.com/watch?v=G8s96sHUHac&t=2462s) |
| [Datenmodellierung ist Governance](https://www.youtube.com/watch?v=lH_-A8NAQ-k) | 2025-11-01 | nur-zeitstempel | [28:53](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=1733s) · [32:23](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=1943s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [01:44](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=104s) · [13:46](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=826s) |
| [Realtalk zu Self Service mit Power BI](https://www.youtube.com/watch?v=27rC2zefFOU) | 2024-02-01 | nur-zeitstempel | [29:05](https://www.youtube.com/watch?v=27rC2zefFOU&t=1745s) |
| [Microsoft Power BI Einführung \| Florian Wiefel \| Hans-Ulrik Harnisch \| M365 Summit Mai 2022](https://www.youtube.com/watch?v=Z8vpSSOmG24) | 2022-06-01 | nur-zeitstempel | [00:02](https://www.youtube.com/watch?v=Z8vpSSOmG24&t=2s) |
| [LogiMAT Arena Atrium 2026 \| Expert Forum - Supply Chain Risiko Management](https://www.youtube.com/watch?v=DFw664hd1IE) | 2026-04-01 | kernaussagen+zeitstempel | [16:01](https://www.youtube.com/watch?v=DFw664hd1IE&t=961s) · [27:23](https://www.youtube.com/watch?v=DFw664hd1IE&t=1643s) |
| [Daten-WG Life-Update \| State of Power BI, Fabric & AI-Tools](https://www.youtube.com/watch?v=d3HdhRe_nK8) | 2026-06-01 | nur-zeitstempel | [00:44](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=44s) · [29:43](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1783s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [55:34](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3334s) · [57:27](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3447s) |
| [BI Thinkers Talk nr.77](https://www.youtube.com/watch?v=eWfTt93anl4) | — | nur-zeitstempel | [1:01:32](https://www.youtube.com/watch?v=eWfTt93anl4&t=3692s) · [1:03:02](https://www.youtube.com/watch?v=eWfTt93anl4&t=3782s) |
| [Von Patronen zu Prozessen](https://www.youtube.com/watch?v=0cHtxIm7fVw) | 2025-08-01 | nur-zeitstempel | [05:26](https://www.youtube.com/watch?v=0cHtxIm7fVw&t=326s) |
| [Von Patronen zu Prozessen (nur Ton)](https://www.youtube.com/watch?v=s3CveEVoDvo) | 2025-07-01 | nur-zeitstempel | [05:26](https://www.youtube.com/watch?v=s3CveEVoDvo&t=326s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | nur-zeitstempel | [19:48](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1188s) · [34:32](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2072s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [1:00:37](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3637s) · [1:02:14](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=3734s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [34:04](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2044s) · [35:39](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2139s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [14:54](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=894s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [22:30](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1350s) |
| [Daten-WG Deep Dive Financial Reporting - part 7](https://www.youtube.com/watch?v=232JhS9vbQ0) | 2025-09-01 | nur-zeitstempel | [03:25](https://www.youtube.com/watch?v=232JhS9vbQ0&t=205s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | nur-zeitstempel | [53:44](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3224s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Microsoft%20Fabric%20%26%20OneLake) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Fabric%20vs.%20klassisches%20Power%20BI) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Fabric-Bausteine) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [33:52](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2032s) |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |
| [BI Thinkers Talk - Data Modelling - Fabric Data Days Edition](https://www.youtube.com/watch?v=mUALlPmGcEk) | 2025-11-01 | kernaussagen+zeitstempel | [22:42](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1362s) |
| [BI Thinkers Talk - Data Modeling - Fabric Data Days Edition [EN]](https://www.youtube.com/watch?v=uxYFqwe_Wiw) | 2025-12-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Awarehouse
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Awarehouse&f=tool%3Awarehouse
