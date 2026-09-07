---
id: "tool:workspace"
name: "Workspace"
typ: tool
stand: "2026-09-07"
build: "20260907-1012"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 45
kernaussagen: 14
mit_kernaussagen: 6
aliase:
  - "Arbeitsbereich"
  - "Workspaces"
  - "Arbeitsbereiche"
---

# Workspace

Ein Arbeitsbereich wird einer Kapazität zugeordnet, und innerhalb dieses Arbeitsbereichs werden Artefakte und Daten entsprechend im OneLake abgelegt. Die Rechenleistung, die innerhalb eines Arbeitsbereichs zum Arbeiten mit den Daten im OneLake genutzt wird, stammt aus der zugeordneten Fabric-Kapazität. Workspaces können in unterschiedlichen Regionen liegen, etwa manche im US-Bereich und andere in Europa, wobei die Daten jeweils in der Region gespeichert sind, in der der Workspace angelegt wurde.

## Aliase

Arbeitsbereich, Workspaces, Arbeitsbereiche

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Fabric Capacity](fabric-capacity.md) | setzt-voraus | belegt | 28 |
| [Notebook](notebook.md) | teil-von | belegt | 32 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 74 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 58 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 36 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 33 |
| [Dataflow](dataflow.md) | ko-vorkommen | heuristik | 26 |
| [Data Pipeline](data-pipeline.md) | ko-vorkommen | heuristik | 21 |
| [Semantic Model](semantic-model.md) | ko-vorkommen | heuristik | 20 |
| [Sicherheit](sicherheit.md) | ko-vorkommen | heuristik | 17 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 17 |
| [Premium](premium.md) | ko-vorkommen | heuristik | 16 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 16 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 15 |
| [OneLake](onelake.md) | ko-vorkommen | heuristik | 15 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 00:26 | Ein Arbeitsbereich wird einer Kapazität zugeordnet, und innerhalb dieses Arbeitsbereichs werden Artefakte und Daten entsprechend im OneLake abgelegt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=26s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 00:26 | Die Rechenleistung, die innerhalb eines Arbeitsbereichs zum Arbeiten mit den Daten im OneLake genutzt wird, stammt aus der zugeordneten Fabric-Kapazität. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=26s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 02:34 | Workspaces können in unterschiedlichen Regionen liegen, etwa manche im US-Bereich und andere in Europa, wobei die Daten jeweils in der Region gespeichert sind, in der der Workspace angelegt wurde. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=154s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 03:16 | Ordnet man einen Arbeitsbereich einer Kapazität zu, werden die zugehörigen Daten im OneLake tatsächlich in der Region gespeichert, in der die Kapazität liegt. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=196s) |
| Warnung | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 03:16 | Verschiebt man einen Arbeitsbereich zwischen Kapazitäten in unterschiedlichen Regionen, müssen die zugrunde liegenden Daten tatsächlich in die neue Region überführt werden, es ist also kein reiner Wechsel der Rechenleistung. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=196s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 02:19 | Dem Service Principal müssen im Fabric-Arbeitsbereich (Workspace) explizit Berechtigungen zugewiesen werden. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=139s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 02:32 | Um das Notebook über die REST API anzusprechen, werden die Workspace-ID und die Notebook-ID benötigt. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=152s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 03:52 | Die Paketvariablen im SSIS-Paket speichern Workspace-ID und Notebook-ID für den REST-API-Aufruf. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=232s) |
| Fakt | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 05:20 | Über die Kommandozeile lassen sich in Fabric Workspaces auflisten, auswählen und darin per New Item eine Mirror Database anlegen. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=320s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 16:46 | Die Search Protection auf Workspace-Ebene kann einen Workspace automatisch pausieren, wenn er eine festgelegte Prozentzahl der Gesamtkapazität überschreitet. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1006s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 16:46 | Einzelne Workspaces lassen sich als Mission Critical markieren, damit sie von der automatischen Pausierung durch die Search Protection ausgenommen bleiben. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1006s) |
| Fakt | BI Thinkers Talk n.72 | 40:35 | Beim Ausführen eines Notebooks über die Pipeline mit einem Service Principal wurden deutlich weniger Workspaces zurückgegeben, weil der Service Principal nicht Mitglied in allen Workspaces ist. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2435s) |
| Fakt | BI Thinkers Talk nr.67 | 06:28 | Die Microsoft-eigene Fabric-Erweiterung für Visual Studio Code zeigt alle Workspaces inklusive Pro-Workspaces an, während eine alternative Community-Erweiterung nur Fabric-Workspaces anzeigt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=388s) |
| Fakt | BI Thinkers Talk nr.67 | 09:54 | In einer Power-BI-Projektdatei können mehrere Report-Verzeichnisse auf dasselbe semantische Modell zeigen, und Berichte lassen sich auch in einem anderen Workspace deployen als das zugehörige Modell. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=594s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Power BI Update April 2025](https://www.youtube.com/watch?v=lT-C7fPzxj4) | 2025-04-01 | nur-zeitstempel | [03:08](https://www.youtube.com/watch?v=lT-C7fPzxj4&t=188s) · [04:42](https://www.youtube.com/watch?v=lT-C7fPzxj4&t=282s) |
| [Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake?](https://www.youtube.com/watch?v=ZVVSPQj9dlc) | 2026-03-01 | kernaussagen+zeitstempel | [00:26](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=26s) · [02:34](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=154s) · [03:16](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=196s) |
| [SSIS Integration Services: Microsoft Fabric Notebook per REST API starten](https://www.youtube.com/watch?v=NvtZ-ehiTrg) | 2026-02-01 | kernaussagen+zeitstempel | [01:56](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=116s) · [02:19](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=139s) · [02:32](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=152s) |
| [Fabric Workload Demo mit Alexander Korn und Lukasz Obst](https://www.youtube.com/watch?v=e50qKdVn-24) | 2026-08-01 | nur-zeitstempel | [14:36](https://www.youtube.com/watch?v=e50qKdVn-24&t=876s) · [16:22](https://www.youtube.com/watch?v=e50qKdVn-24&t=982s) · [20:43](https://www.youtube.com/watch?v=e50qKdVn-24&t=1243s) |
| [Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial](https://www.youtube.com/watch?v=7j34Ndng0Os) | 2026-01-01 | kernaussagen+zeitstempel | [04:01](https://www.youtube.com/watch?v=7j34Ndng0Os&t=241s) · [05:20](https://www.youtube.com/watch?v=7j34Ndng0Os&t=320s) · [08:39](https://www.youtube.com/watch?v=7j34Ndng0Os&t=519s) |
| [So hackst du einen Power BI Bericht \| Power BI Tutorial](https://www.youtube.com/watch?v=GKLxM3317Xk) | 2025-09-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=GKLxM3317Xk) · [Abschnitt](https://www.youtube.com/watch?v=GKLxM3317Xk) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [08:08](https://www.youtube.com/watch?v=YzfcMurbWNc&t=488s) · [09:45](https://www.youtube.com/watch?v=YzfcMurbWNc&t=585s) · [13:41](https://www.youtube.com/watch?v=YzfcMurbWNc&t=821s) |
| [So rettest du deine kaputte Power BI Theme Datei in 5 Minuten! \| Power BI Tutorial](https://www.youtube.com/watch?v=gspmWlVrNdA) | 2025-10-01 | nur-zeitstempel | [02:52](https://www.youtube.com/watch?v=gspmWlVrNdA&t=172s) · [03:46](https://www.youtube.com/watch?v=gspmWlVrNdA&t=226s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [38:43](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=2323s) · [51:21](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=3081s) · [53:13](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=3193s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20das%20konkret%20hei%C3%9Ft) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=XMLA%20%E2%80%94%20der%20Enterprise-Zugang) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=04%20%C2%B7%20End-to-End%3A%20%2Avon%20Daten%20zum%20Bericht%2A) |
| [SharePoint direkt in Microsoft Fabric nutzen \| Lakehouse, Direct Lake & Power BI](https://www.youtube.com/watch?v=c-LWoo-O5PQ) | 2026-07-01 | nur-zeitstempel | [03:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=200s) · [11:20](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=680s) · [13:40](https://www.youtube.com/watch?v=c-LWoo-O5PQ&t=820s) |
| [Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup](https://www.youtube.com/watch?v=BDnwlOqRElY) | 2025-06-01 | nur-zeitstempel | [12:52](https://www.youtube.com/watch?v=BDnwlOqRElY&t=772s) · [17:35](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1055s) · [20:57](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1257s) |
| [Power BI Update Oktober 2025](https://www.youtube.com/watch?v=LVSttJlhrqM) | 2025-10-01 | nur-zeitstempel | [04:21](https://www.youtube.com/watch?v=LVSttJlhrqM&t=261s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [42:10](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2530s) · [45:23](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2723s) · [47:01](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2821s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | nur-zeitstempel | [14:38](https://www.youtube.com/watch?v=DQENmzAkNqw&t=878s) · [44:23](https://www.youtube.com/watch?v=DQENmzAkNqw&t=2663s) · [53:48](https://www.youtube.com/watch?v=DQENmzAkNqw&t=3228s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | nur-zeitstempel | [22:16](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1336s) · [25:29](https://www.youtube.com/watch?v=4VVNDNusq4U&t=1529s) · [37:15](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2235s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [16:46](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1006s) · [18:20](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1100s) · [20:02](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1202s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [11:50](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=710s) · [18:22](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1102s) · [19:55](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1195s) |
| [Power BI Update Juli 2025](https://www.youtube.com/watch?v=TkxwcAyBGUM) | 2025-07-01 | nur-zeitstempel | [00:32](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=32s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [04:56](https://www.youtube.com/watch?v=G8s96sHUHac&t=296s) · [06:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=388s) · [09:54](https://www.youtube.com/watch?v=G8s96sHUHac&t=594s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=08%20%C2%B7%20Service%20%26%20%2ASharing%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=DEV%2FTEST%2FPROD-Workspaces) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Sicherheitsgruppen%20statt%20Einzelpersonen) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [37:07](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2227s) · [38:43](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2323s) · [40:35](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2435s) |
| [Power BI Seiten per URL steuern - Sprechende URLs mit PBIP & VS Code \| Power BI Tutorial](https://www.youtube.com/watch?v=DcEfNIupEHM) | 2025-12-01 | nur-zeitstempel | [00:27](https://www.youtube.com/watch?v=DcEfNIupEHM&t=27s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [00:02](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2s) · [20:47](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1247s) · [43:26](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2606s) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [12:49](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=769s) · [14:34](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=874s) · [44:26](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2666s) |
| [Daten-WG Special: Power BI vs. Qlik](https://www.youtube.com/watch?v=aYHk_V8n_CE) | 2025-10-01 | nur-zeitstempel | [09:43](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=583s) · [14:29](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=869s) · [27:12](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=1632s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | nur-zeitstempel | [47:22](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2842s) · [49:02](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2942s) · [50:39](https://www.youtube.com/watch?v=TYmKrreMO3I&t=3039s) |
| [BI Thinkers Talk nr.77](https://www.youtube.com/watch?v=eWfTt93anl4) | — | nur-zeitstempel | [08:02](https://www.youtube.com/watch?v=eWfTt93anl4&t=482s) · [50:00](https://www.youtube.com/watch?v=eWfTt93anl4&t=3000s) · [53:05](https://www.youtube.com/watch?v=eWfTt93anl4&t=3185s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | nur-zeitstempel | [34:32](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2072s) · [37:40](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2260s) · [44:36](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2676s) |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) · [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) · [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |
| [Power BI Update August 2026](https://www.youtube.com/watch?v=GWCHNmLs72M) | 2026-08-01 | nur-zeitstempel | [06:57](https://www.youtube.com/watch?v=GWCHNmLs72M&t=417s) |
| [Microsoft Power BI Einführung \| Florian Wiefel \| Hans-Ulrik Harnisch \| M365 Summit Mai 2022](https://www.youtube.com/watch?v=Z8vpSSOmG24) | 2022-06-01 | nur-zeitstempel | [30:08](https://www.youtube.com/watch?v=Z8vpSSOmG24&t=1808s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [06:05](https://www.youtube.com/watch?v=mTVeZzshLzE&t=365s) · [43:10](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2590s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [29:17](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1757s) · [42:49](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2569s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [09:22](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=562s) · [17:15](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1035s) · [1:24:16](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=5056s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [35:07](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2107s) · [55:02](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=3302s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [33:23](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2003s) · [1:10:37](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=4237s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [35:27](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=2127s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [20:34](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1234s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [08:03](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=483s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Aworkspace
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Aworkspace&f=tool%3Aworkspace
