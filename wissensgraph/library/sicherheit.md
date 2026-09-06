---
id: "topic:sicherheit"
name: "Sicherheit"
typ: thema
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 53
kernaussagen: 26
mit_kernaussagen: 13
aliase:
  - "Security"
  - "Datenschutz"
  - "DSGVO"
  - "Sensitivity Label"
---

# Sicherheit

OneLake Security stellt dieselben Zugriffsinformationen sowohl nativen Fabric-Workloads als auch Third-Party-Workloads zur Verfügung. Kritische Produktionsschritte sind laut Layher durch mehrfache unabhängige Kontrollsysteme abgesichert, sodass das Hacken eines einzelnen Systems nicht ausreicht, um ein schädliches Produkt in den Markt zu bringen. Moderne Produktionsanlagen bestehen aus vielen vernetzten Computersystemen, und da Software statistisch etwa einen Fehler pro 1000 Codezeilen enthält, ist schnelles Beheben auftretender Fehler unverzichtbar.

## Aliase

Security, Datenschutz, DSGVO, Sensitivity Label

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 41 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 38 |
| [KI](ki.md) | ko-vorkommen | heuristik | 29 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 28 |
| [Row-Level Security](row-level-security.md) | ko-vorkommen | heuristik | 28 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 26 |
| [Workspace](workspace.md) | ko-vorkommen | heuristik | 17 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 15 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 15 |
| [Daten-WG](daten-wg.md) | ko-vorkommen | heuristik | 13 |
| [Governance](governance.md) | ko-vorkommen | heuristik | 13 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 13 |
| [Semantic Model](semantic-model.md) | ko-vorkommen | heuristik | 12 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 12 |
| [Community](community.md) | ko-vorkommen | heuristik | 12 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk nr.76 | 03:09 | In Power BI Desktop können wegen fehlender Python-Installation aus Sicherheitsgründen keine Python-basierten Visuals wie Matplotlib, Plotly oder Seaborn genutzt werden. | [▶](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=189s) |
| Fakt | LogiMAT Arena Atrium 2026 \| Expert Forum - Supply Chain Risiko Management | 07:58 | Naturkatastrophen, politische Entscheidungen und Cyberattacken zählen zu den zunehmenden Risiken für die Beschaffung. | [▶](https://www.youtube.com/watch?v=DFw664hd1IE&t=478s) |
| Warnung | BI Thinkers Talk n.74 | 21:03 | Das Explore-Feature (Antwort erkunden) kann von Nutzern ohne Build-Permission verwendet werden, was von den Sprechern als Sicherheitsrisiko eingeordnet wird. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1263s) |
| Fakt | BI Thinkers Talk n.74 | 25:56 | Row-Level Security wird sowohl von Copilot als auch vom Explore-Feature respektiert, im Unterschied zu einer reinen Security-by-Obscurity durch versteckte Tabellen. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1556s) |
| Warnung | BI Thinkers Talk n.74 | 27:27 | Das Explore-Feature ist nicht an die Build-Permission gekoppelt, sodass darüber Inhalte aus dem semantischen Modell zugänglich sein können, die im Bericht selbst nicht sichtbar sind. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1647s) |
| Empfehlung | BI Thinkers Talk n.74 | 44:26 | Für den Produktivbetrieb sollte statt einer persönlichen Anmeldung ein Service Principal verwendet werden. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2666s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 01:56 | Für die Authentifizierung wird im Tenant eine App-Registrierung mit zugehörigem Service Principal angelegt. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=116s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 01:56 | Der Service Principal erhält über ein Client Secret die Berechtigung, sich gegenüber der Fabric REST API auszuweisen. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=116s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 02:19 | Dem Service Principal müssen im Fabric-Arbeitsbereich (Workspace) explizit Berechtigungen zugewiesen werden. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=139s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 03:26 | Die Projektparameter im SSIS-Paket enthalten Client ID, Tenant und Client Secret des Service Principals. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=206s) |
| Fakt | SSIS Integration Services: Microsoft Fabric Notebook per REST API starten | 05:27 | Das Skript holt sich zunächst mit den hinterlegten Anmeldedaten einen Access Token. | [▶](https://www.youtube.com/watch?v=NvtZ-ehiTrg&t=327s) |
| Fakt | Digitalisierung seit 20 Jahren — wann sind wir endlich fertig? | 23:36 | Bei großflächig ausgerolltem Self-Service BI ist es nicht mehr Ziel der zentralen Abteilung, einen umfassenden Single Point of Truth zu etablieren, Security bleibt aber weiterhin zentral geregelt. | [▶](https://www.youtube.com/watch?v=jETxUNQSl-w&t=1416s) |
| Warnung | Prinzipien oder Paragrafen | 27:08 | Ein reales Sicherheitsrisiko in der pharmazeutischen Produktion besteht darin, dass Angreifer eine Rezeptur unbemerkt um kleinste Mengen verändern könnten. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=1628s) |
| Fakt | Prinzipien oder Paragrafen | 27:08 | Kritische Produktionsschritte sind laut Layher durch mehrfache unabhängige Kontrollsysteme abgesichert, sodass das Hacken eines einzelnen Systems nicht ausreicht, um ein schädliches Produkt in den Markt zu bringen. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=1628s) |
| Fakt | Prinzipien oder Paragrafen | 42:11 | Moderne Produktionsanlagen bestehen aus vielen vernetzten Computersystemen, und da Software statistisch etwa einen Fehler pro 1000 Codezeilen enthält, ist schnelles Beheben auftretender Fehler unverzichtbar. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=2531s) |
| Fakt | BI Thinkers Talk n.72 | 37:07 | Seit kurzem lassen sich Notebooks in Fabric über eine Connection mit einem Service Principal ausführen, wodurch Secrets nicht mehr hartcodiert oder in einer JSON-Datei im Lakehouse abgelegt werden müssen. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=2227s) |
| Empfehlung | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 01:46 | Für die Verbindung zu Azure-Komponenten muss die Verschlüsselung per Registry-Eintrag auf TLS 1.2 gesetzt werden. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=106s) |
| Warnung | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 02:17 | Fehlt der TLS-1.2-Registry-Eintrag, lässt sich die Verbindung zwar testen, die spätere Ausführung des Pakets schlägt aber mit einem Fehler fehl. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=137s) |
| Empfehlung | BI Thinkers Talk nr.67 | 41:02 | Bei neueren Dataflow-Generationen sind Datenverbindungen an die erstellende Person gebunden, weshalb empfohlen wird, Connections konsequent freizugeben und nach Möglichkeit einen Service Principal für die Verbindung zu nutzen. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=2462s) |
| Warnung | 10 Jahre Power BI | 10:21 | Ein Sprecher warnt davor, Berichte über 'Publish to Web' zu veröffentlichen, weil dabei der Datenschutz komplett verloren geht. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=621s) |
| Fakt | 10 Jahre Power BI | 1:29:51 | Ein Sprecher berichtet, dass ein lokal betriebenes LLM CSV-Daten verarbeiten kann, ohne dass die Daten den eigenen Rechner verlassen, was er aus Datenschutzsicht positiv bewertet. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=5391s) |
| Warnung | BI Thinkers Talk Nr.62 | 23:50 | Beim Aufbau der SQL-Query sollten Parameter beziehungsweise Platzhalter statt direkt eingefügter Werte verwendet werden, um SQL-Injection zu vermeiden. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1430s) |
| Warnung | Was ist Self-Service und warum ist das so schwer? | 27:56 | Tom Martens befürchtet, dass auf die frühere Spreadsheet Hell durch generative KI-Agenten künftig eine Agent Hell folgen könnte. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1676s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 | 28:37 | OneLake Security stellt dieselben Zugriffsinformationen sowohl nativen Fabric-Workloads als auch Third-Party-Workloads zur Verfügung. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1717s) |
| Empfehlung | Was ist Self-Service und warum ist das so schwer? | 29:34 | Eine sichere Self-Service-Plattform erfordert aus Sicht von Tom Martens permanentes Monitoring und kontinuierlichen Dialog mit den Anwendern statt eines einmalig abgeschlossenen Projekts. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1774s) |
| Warnung | Fabric & Power BI Quarterly · 2026-2 | 31:59 | Komplexere Sicherheitsszenarien wie dynamische Row-Level Security und Dynamic Data Masking fehlen in OneLake Security noch und stehen auf der Roadmap. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1919s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Microsoft Power BI Einführung \| Florian Wiefel \| Hans-Ulrik Harnisch \| M365 Summit Mai 2022](https://www.youtube.com/watch?v=Z8vpSSOmG24) | 2022-06-01 | nur-zeitstempel | [06:03](https://www.youtube.com/watch?v=Z8vpSSOmG24&t=363s) · [36:09](https://www.youtube.com/watch?v=Z8vpSSOmG24&t=2169s) · [39:09](https://www.youtube.com/watch?v=Z8vpSSOmG24&t=2349s) |
| [Realtalk zu Self Service mit Power BI](https://www.youtube.com/watch?v=27rC2zefFOU) | 2024-02-01 | nur-zeitstempel | [02:02](https://www.youtube.com/watch?v=27rC2zefFOU&t=122s) · [08:02](https://www.youtube.com/watch?v=27rC2zefFOU&t=482s) · [11:03](https://www.youtube.com/watch?v=27rC2zefFOU&t=663s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [13:35](https://www.youtube.com/watch?v=lZvpCBMKASM&t=815s) · [15:35](https://www.youtube.com/watch?v=lZvpCBMKASM&t=935s) · [55:18](https://www.youtube.com/watch?v=lZvpCBMKASM&t=3318s) |
| [So hackst du einen Power BI Bericht \| Power BI Tutorial](https://www.youtube.com/watch?v=GKLxM3317Xk) | 2025-09-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=GKLxM3317Xk) · [Abschnitt](https://www.youtube.com/watch?v=GKLxM3317Xk) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [13:57](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=837s) · [54:44](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=3284s) · [57:48](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=3468s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [09:01](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=541s) · [20:50](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1250s) · [22:30](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1350s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [26:53](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1613s) · [30:27](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1827s) · [31:59](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1919s) |
| [Prinzipien oder Paragrafen](https://www.youtube.com/watch?v=6WhWLcuFvZE) | 2026-02-01 | kernaussagen+zeitstempel | [09:56](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=596s) · [11:50](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=710s) · [14:37](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=877s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [15:50](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=950s) · [17:31](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1051s) · [30:50](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1850s) |
| [BI Thinkers Talk nr.63](https://www.youtube.com/watch?v=9VX4-lLa0EI) | 2025-06-01 | nur-zeitstempel | [40:40](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=2440s) · [42:15](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=2535s) · [43:55](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=2635s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [16:16](https://www.youtube.com/watch?v=G8s96sHUHac&t=976s) · [19:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=1168s) · [59:02](https://www.youtube.com/watch?v=G8s96sHUHac&t=3542s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [21:17](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1277s) · [22:53](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1373s) · [24:33](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1473s) |
| [Wie viel CO₂ steckt in einem Token? — KI-Energie-Simulator](https://datenwgknowledgekitchen.com/ki-co2-simulator.html) | 2026-07-03 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/ki-co2-simulator.html#:~:text=Anhang%3A%20Quellen%20%26%20Annahmen) |
| [Power BI vs. Qlik](https://www.youtube.com/watch?v=vd1r02bj9Qk) | 2026-01-01 | kernaussagen+zeitstempel | [07:12](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=432s) · [10:48](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=648s) |
| [The Day After Tomorrow – Nach der Einführung geht es erst richtig los \| Power BI Summit 2023](https://www.youtube.com/watch?v=KwySyTxW_EI) | 2023-03-01 | nur-zeitstempel | [21:05](https://www.youtube.com/watch?v=KwySyTxW_EI&t=1265s) · [51:11](https://www.youtube.com/watch?v=KwySyTxW_EI&t=3071s) |
| [LogiMAT Arena Atrium 2026 \| Expert Forum - Supply Chain Risiko Management](https://www.youtube.com/watch?v=DFw664hd1IE) | 2026-04-01 | kernaussagen+zeitstempel | [00:02](https://www.youtube.com/watch?v=DFw664hd1IE&t=2s) · [43:42](https://www.youtube.com/watch?v=DFw664hd1IE&t=2622s) · [46:48](https://www.youtube.com/watch?v=DFw664hd1IE&t=2808s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Community%20%C2%B7%20Deutschsprachig%20%26%20Video) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20ist%20das%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20drei%20Plattform-Schichten%20unter%20den%20Workloads) |
| [Mythos Data Vault und richtig große Modelle](https://www.youtube.com/watch?v=rrCi0lnGrCg) | 2025-07-01 | nur-zeitstempel | [20:50](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1250s) · [30:58](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1858s) |
| [Power BI Update März 2026](https://www.youtube.com/watch?v=ASwcPvbMRZc) | 2026-03-01 | kernaussagen+zeitstempel | [07:53](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=473s) |
| [KI hat mich abgelöst \| Daten-WG Podcast mit Burkhardt Gasber](https://www.youtube.com/watch?v=oh-3_65IQ2Q) | 2026-08-01 | nur-zeitstempel | [14:06](https://www.youtube.com/watch?v=oh-3_65IQ2Q&t=846s) · [15:43](https://www.youtube.com/watch?v=oh-3_65IQ2Q&t=943s) · [42:31](https://www.youtube.com/watch?v=oh-3_65IQ2Q&t=2551s) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [11:17](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=677s) · [21:03](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1263s) · [25:56](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1556s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | nur-zeitstempel | [17:48](https://www.youtube.com/watch?v=DQENmzAkNqw&t=1068s) · [49:02](https://www.youtube.com/watch?v=DQENmzAkNqw&t=2942s) · [57:09](https://www.youtube.com/watch?v=DQENmzAkNqw&t=3429s) |
| [Wie wahrscheinlich ist die KI-Apokalypse? — p(doom) im Ueberblick](https://datenwgknowledgekitchen.com/pdoom-ki-risiko.html) | 2026-06-08 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/pdoom-ki-risiko.html#:~:text=Wie%20man%20diese%20Zahlen%20%2Alesen%20sollte%2A) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [35:54](https://www.youtube.com/watch?v=VD1N68Fhoco&t=2154s) · [42:07](https://www.youtube.com/watch?v=VD1N68Fhoco&t=2527s) · [43:39](https://www.youtube.com/watch?v=VD1N68Fhoco&t=2619s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [11:21](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=681s) |
| [Wie war die Daten-WG? · Im Gespräch mit Artur König](https://www.youtube.com/watch?v=z4ZeHPzIeeU) | 2025-03-01 | nur-zeitstempel | [22:25](https://www.youtube.com/watch?v=z4ZeHPzIeeU&t=1345s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=3.%20Bidirektional%20sparsam) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Was%20im%20Modell%20%C3%A4ndern) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Microsoft%20Learn%20%C2%B7%20Service%20%C2%B7%20Sharing%20%C2%B7%20RLS) |
| [GxP Talk - KI im regulierten Umfeld?](https://www.youtube.com/watch?v=XtH4JqTwaqM) | 2026-05-01 | kernaussagen+zeitstempel | [01:36](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=96s) · [53:36](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=3216s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [01:33](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=93s) · [1:18:48](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=4728s) · [1:20:28](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=4828s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | nur-zeitstempel | [01:45](https://www.youtube.com/watch?v=4VVNDNusq4U&t=105s) · [03:20](https://www.youtube.com/watch?v=4VVNDNusq4U&t=200s) |
| [Von Patronen zu Prozessen](https://www.youtube.com/watch?v=0cHtxIm7fVw) | 2025-08-01 | nur-zeitstempel | [11:38](https://www.youtube.com/watch?v=0cHtxIm7fVw&t=698s) |
| [Von Patronen zu Prozessen (nur Ton)](https://www.youtube.com/watch?v=s3CveEVoDvo) | 2025-07-01 | nur-zeitstempel | [11:38](https://www.youtube.com/watch?v=s3CveEVoDvo&t=698s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [29:35](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=1775s) · [39:46](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2386s) |
| [Power BI-Teams werden Fabric-Datendienstleister](https://www.youtube.com/watch?v=YzfcMurbWNc) | — | nur-zeitstempel | [16:59](https://www.youtube.com/watch?v=YzfcMurbWNc&t=1019s) |
| [Mensch bleiben, wenn Power BI geht](https://www.youtube.com/watch?v=iB4vHRvaErE) | 2025-11-01 | nur-zeitstempel | [10:28](https://www.youtube.com/watch?v=iB4vHRvaErE&t=628s) · [44:51](https://www.youtube.com/watch?v=iB4vHRvaErE&t=2691s) |
| [Gaming + Real-Time-Analytics in Fabric = Fun-o-Meter @ Fabric Meetup](https://www.youtube.com/watch?v=BDnwlOqRElY) | 2025-06-01 | nur-zeitstempel | [17:35](https://www.youtube.com/watch?v=BDnwlOqRElY&t=1055s) |
| [Wie war die Daten-WG 2025? (Teil 1)](https://www.youtube.com/watch?v=aEXtFWW-pmo) | 2025-05-01 | nur-zeitstempel | [24:41](https://www.youtube.com/watch?v=aEXtFWW-pmo&t=1481s) |
| [Digitalisierung seit 20 Jahren — wann sind wir endlich fertig?](https://www.youtube.com/watch?v=jETxUNQSl-w) | 2026-02-01 | kernaussagen+zeitstempel | [23:36](https://www.youtube.com/watch?v=jETxUNQSl-w&t=1416s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [23:12](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=1392s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [45:23](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2723s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Asicherheit
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Asicherheit&f=topic%3Asicherheit
