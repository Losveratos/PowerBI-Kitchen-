---
id: "topic:performance"
name: "Performance"
typ: thema
stand: "2026-09-07"
build: "20260907-1922"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 38
kernaussagen: 27
mit_kernaussagen: 15
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/performance.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/performance.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/performance.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/performance.json"
aliase:
  - "Performanz"
  - "Optimierung"
  - "Ladezeit"
  - "langsam"
  - "schnell"
---

# Performance

Bei geringer Datenmenge und einfachen Measures zeigte sich in eigenen Tests kein signifikanter Performance-Unterschied zwischen Flat Table und Sternschema. Power BI im Web unterstützt jetzt die Themes-Auswahl und den Performance Analyzer und ist damit fast gleichwertig zu Power BI Desktop. Nach den Tests der Writeback-Funktion stieg die CU-Auslastung der F2-Kapazität in der Capacity-Metrics-App auf über 100 Prozent.

## Aliase

Performanz, Optimierung, Ladezeit, langsam, schnell

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Sternschema](sternschema.md) | setzt-voraus | belegt | 43 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 90 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 58 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 41 |
| [DAX](dax.md) | ko-vorkommen | heuristik | 38 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 37 |
| [Refresh](refresh.md) | ko-vorkommen | heuristik | 36 |
| [KI](ki.md) | ko-vorkommen | heuristik | 36 |
| [Power Query](power-query.md) | ko-vorkommen | heuristik | 36 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 31 |
| [Datenmodellierung](datenmodellierung.md) | ko-vorkommen | heuristik | 31 |
| [DirectQuery](directquery.md) | ko-vorkommen | heuristik | 31 |
| [Sicherheit](sicherheit.md) | ko-vorkommen | heuristik | 26 |
| [Dataflow](dataflow.md) | ko-vorkommen | heuristik | 26 |
| [Power BI Desktop](power-bi-desktop.md) | ko-vorkommen | heuristik | 22 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Empfehlung | GxP Talk - KI im regulierten Umfeld? | 2026-05 | 27:32 | auf die Sekunde | Martin empfiehlt, bei zeitkritisch und in großer Menge anfallenden Daten zusätzlich lokalen Speicher vorzuhalten, um Risiken durch unterbrochene Datenübertragung zu reduzieren. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=1652s) |
| Meinung | LogiMAT Arena Atrium 2026 \| Expert Forum - Supply Chain Risiko Management | 2026-04 | 32:21 | auf die Sekunde | Nicht die Länge, sondern die Varianz der Durchlaufzeit zwischen Prozessschritten verursacht die größten Probleme in der Supply Chain. | [▶](https://www.youtube.com/watch?v=DFw664hd1IE&t=1941s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 37:06 | auf die Sekunde | Der Power BI Fixer kann den Best Practice Analyser auf dem Semantic Model ausführen und gefundene Verstöße direkt automatisiert fixen lassen. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2226s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 43:16 | auf die Sekunde | Bei Direct Lake führt der erste Nutzer, der morgens einen Bericht öffnet, wegen des noch kalten Caches häufig zu langen Wartezeiten. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2596s) |
| Empfehlung | BI Thinkers Talk nr.75 | 2026-04 | 44:06 | auf die Sekunde | Der Power BI Fixer kann automatisch ein geplantes Notebook anlegen, das die Direct-Lake-Perspektive täglich zu einer festen Uhrzeit aktualisiert, um den Cache vorzuwärmen. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2646s) |
| Fakt | BI Thinkers Talk nr.75 | 2026-04 | 45:13 | auf die Sekunde | Der Fixer erlaubt es, einzelne Tabellen oder Partitionen eines Semantic Models gezielt zu aktualisieren, statt das gesamte Modell neu zu laden. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2713s) |
| Warnung | Fabric Planning unboxing | 2026-03 | 09:22 | Abschnittsanfang | Eine einzelne SQL-Datenbank kann bereits eine F2-Kapazität stark auslasten, wie ein interner Vorfall zeigte. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=562s) |
| Warnung | Fabric Planning unboxing | 2026-03 | 31:23 | auf die Sekunde | Das Planning-Feature befindet sich noch in der Preview-Phase und lieferte beim Verbinden einer größeren Faktentabelle einen Internal Server Error. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1883s) |
| Warnung | BI Thinkers Talk n.74 | 2026-03 | 50:07 | auf die Sekunde | Das Einbinden der Variable Library als Connection und das Auslesen ihrer Werte kann die Ausführung eines Translytical-Task-Flow-Prozesses stark verlangsamen. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=3007s) |
| Warnung | Fabric Planning unboxing | 2026-03 | 1:09:28 | Abschnittsanfang | Der Gantt-Objekttyp benötigt eine passende Datenstruktur mit eindeutigem Event sowie Start- und Enddatum und zeigte auf der genutzten Trial-Kapazität deutliche Ladezeit-Probleme. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=4168s) |
| Fakt | BI Thinkers Talk n.73 | 2026-02 | 41:16 | auf die Sekunde | Eine Monitoring-Analyse zeigte, dass über zwei Drittel der Last auf einem produktiven Direct-Lake-Semantic-Model von Entwicklern in Power BI Desktop stammten und nicht von den eigentlichen Report-Nutzern. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2476s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 2026-01 | 03:45 | auf die Sekunde | Power BI im Web unterstützt jetzt die Themes-Auswahl und den Performance Analyzer und ist damit fast gleichwertig zu Power BI Desktop. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=225s) |
| Fakt | Power BI vs. Qlik | 2026-01 | 03:46 | auf die Sekunde | In Qlik ist ein Streudiagramm bei großen, komplexen Datenmengen schwer zu konfigurieren. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=226s) |
| Empfehlung | Open Mirroring in Microsoft Fabric – Daten replizieren ohne ETL \| Fabric Tutorial | 2026-01 | 06:47 | auf die Sekunde | Man sollte für den Sync eher größere Batches von rund 1000 bis 2000 Zeilen pro Datei verwenden statt der in der Demo genutzten 13 Zeilen. | [▶](https://www.youtube.com/watch?v=7j34Ndng0Os&t=407s) |
| Warnung | Denken in Tabellen | 2026-01 | 07:40 | auf die Sekunde | Breite, lange Tabellen sind in Power BI und Power Query aus Performance- und Speicherplatzgründen ungünstig. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=460s) |
| Empfehlung | Power BI vs. Qlik | 2026-01 | 12:13 | auf die Sekunde | Ab einem gewissen Datenvolumen sollte in Power BI ein Sternschema verwendet werden, um Performance-Probleme zu vermeiden. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=733s) |
| Warnung | Denken in Tabellen | 2026-01 | 17:12 | Abschnittsanfang | Bei Benchmark-Tests mit künstlich generierten Testdaten wie der Kontoso-Datenbank komprimiert ein Sternschema teils schlechter als erwartet, weil reale Kundenverteilungen von Testdaten abweichen. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1032s) |
| Fakt | Denken in Tabellen | 2026-01 | 19:11 | auf die Sekunde | Bei geringer Datenmenge und einfachen Measures zeigte sich in eigenen Tests kein signifikanter Performance-Unterschied zwischen Flat Table und Sternschema. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1151s) |
| Fakt | Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial | 2025-12 | 00:48 | auf die Sekunde | Die SQL-Schnittstellen in Fabric sind auf Massendaten ausgelegt und nicht dafür gedacht, einzelne Datensätze zu schreiben. | [▶](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=48s) |
| Warnung | BI Thinkers Talk nr.71 | 2025-12 | 10:20 | auf die Sekunde | Bei DirectQuery-Abfragen über mehrere Fakttabellen hinweg entstehen laut den Sprechern schnell zusätzliche Overhead-Queries für jeden Join, was die Performance deutlich verschlechtert. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=620s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 10:41 | auf die Sekunde | In einem Projekt mit 14 Werken und 27 Tabellen pro Werk im Viertelstundentakt kostete ein Aktualisierungsdurchlauf pro Werk rund 28 Cent, was hochgerechnet auf sechs Werke eine F64-Kapazität auslastete und jährlich über 5000 Euro allein für den Datentransport verursachte. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=641s) |
| Empfehlung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 2025-11 | 11:08 | Abschnittsanfang | Beim Datenmodell gilt das Prinzip weniger ist mehr: Es sollen nur die für die Anforderung nötigen Daten geladen werden, um spätere Performance-Probleme und hohe Speicherkosten zu vermeiden. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=668s) |
| Fakt | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 2025-11 | 19:54 | auf die Sekunde | Ob ein Sternschema oder eine One-Big-Table weniger Speicherplatz benötigt, hängt stark von der konkreten Modellierung der Daten ab und lässt sich nicht pauschal beantworten. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1194s) |
| Meinung | BI Thinkers Talk Nr.62 | 2025-05 | 48:53 | auf die Sekunde | Mit Direct Lake wäre das Zurückschreiben asynchron und dadurch deutlich schneller als mit DirectQuery. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2933s) |
| Meinung | BI Thinkers Talk Nr.62 | 2025-05 | 1:02:31 | auf die Sekunde | Bei Direct Lake fällt die Aktualisierung des semantischen Modells nach dem Schreiben kaum auf, weil kein spürbarer Refresh-Vorgang nötig ist. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3751s) |
| Fakt | BI Thinkers Talk Nr.62 | 2025-05 | 1:10:37 | Abschnittsanfang | Nach den Tests der Writeback-Funktion stieg die CU-Auslastung der F2-Kapazität in der Capacity-Metrics-App auf über 100 Prozent. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=4237s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? |  | 11:19 | auf die Sekunde | Ein zentrales, datenhaltendes Objekt wie ein Lakehouse macht Power-BI-Modelle laut Artur deutlich stabiler und beschleunigt Aktualisierungen von zwei Stunden auf zwei Minuten. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=679s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Realtalk zu Self Service mit Power BI](https://www.youtube.com/watch?v=27rC2zefFOU) | 2024-02-01 | nur-zeitstempel | [05:02](https://www.youtube.com/watch?v=27rC2zefFOU&t=302s) · [08:02](https://www.youtube.com/watch?v=27rC2zefFOU&t=482s) · [11:03](https://www.youtube.com/watch?v=27rC2zefFOU&t=663s) |
| [Mythos Data Vault und richtig große Modelle](https://www.youtube.com/watch?v=rrCi0lnGrCg) | 2025-07-01 | nur-zeitstempel | [01:47](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=107s) · [04:01](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=241s) · [13:42](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=822s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [00:01](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1s) · [10:46](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=646s) · [18:58](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1138s) |
| [Power BI Update Oktober 2025](https://www.youtube.com/watch?v=LVSttJlhrqM) | 2025-10-01 | nur-zeitstempel | [03:54](https://www.youtube.com/watch?v=LVSttJlhrqM&t=234s) · [04:21](https://www.youtube.com/watch?v=LVSttJlhrqM&t=261s) |
| [LogiMAT Arena Atrium 2026 \| Expert Forum - Supply Chain Risiko Management](https://www.youtube.com/watch?v=DFw664hd1IE) | 2026-04-01 | kernaussagen+zeitstempel | [06:24](https://www.youtube.com/watch?v=DFw664hd1IE&t=384s) · [20:57](https://www.youtube.com/watch?v=DFw664hd1IE&t=1257s) · [25:48](https://www.youtube.com/watch?v=DFw664hd1IE&t=1548s) |
| [Data Binning and Lorenz Curve in DAX \| Alberto Ferrari & Michael Tenner, Berlin Power BI User Group](https://www.youtube.com/watch?v=183uLZ3GYDo) | 2023-01-01 | nur-zeitstempel | [08:29](https://www.youtube.com/watch?v=183uLZ3GYDo&t=509s) · [10:02](https://www.youtube.com/watch?v=183uLZ3GYDo&t=602s) · [25:32](https://www.youtube.com/watch?v=183uLZ3GYDo&t=1532s) |
| [600 SQL-Tabellen in Fabric](https://www.youtube.com/watch?v=RtUiF1J5XEg) | — | nur-zeitstempel | [13:37](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=817s) · [16:07](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=967s) · [24:33](https://www.youtube.com/watch?v=RtUiF1J5XEg&t=1473s) |
| [Digitalisierung seit 20 Jahren — wann sind wir endlich fertig?](https://www.youtube.com/watch?v=jETxUNQSl-w) | 2026-02-01 | kernaussagen+zeitstempel | [03:27](https://www.youtube.com/watch?v=jETxUNQSl-w&t=207s) · [21:16](https://www.youtube.com/watch?v=jETxUNQSl-w&t=1276s) · [32:38](https://www.youtube.com/watch?v=jETxUNQSl-w&t=1958s) |
| [Daten-WG Special: Power BI vs. Qlik -part2](https://www.youtube.com/watch?v=_Vh5fDfHWz4) | 2025-10-01 | nur-zeitstempel | [03:46](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=226s) · [18:47](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=1127s) · [1:05:36](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=3936s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [00:00](https://www.youtube.com/watch?v=G8s96sHUHac&t=0s) · [1:08:31](https://www.youtube.com/watch?v=G8s96sHUHac&t=4111s) · [1:14:54](https://www.youtube.com/watch?v=G8s96sHUHac&t=4494s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [15:33](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=933s) · [18:55](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1135s) · [31:45](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1905s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [01:44](https://www.youtube.com/watch?v=iymmxuXHh44&t=104s) · [04:51](https://www.youtube.com/watch?v=iymmxuXHh44&t=291s) · [09:40](https://www.youtube.com/watch?v=iymmxuXHh44&t=580s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [27:23](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1643s) · [34:05](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=2045s) · [54:44](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=3284s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=6.%20SUMX%20%C3%BCber%20die%20ganze%20Tabelle) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Storage%20Engine%20vs.%20Formula%20Engine) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Optimierungs-Checkliste) |
| [BI Thinkers Talk nr.76](https://www.youtube.com/watch?v=mlkP-6i5Kq8) | 2026-05-01 | kernaussagen+zeitstempel | [45:45](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=2745s) · [49:05](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=2945s) · [55:18](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=3318s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | nur-zeitstempel | [00:03](https://www.youtube.com/watch?v=4VVNDNusq4U&t=3s) · [01:45](https://www.youtube.com/watch?v=4VVNDNusq4U&t=105s) · [56:27](https://www.youtube.com/watch?v=4VVNDNusq4U&t=3387s) |
| [Projektcontrolling mit dynamischen Arbeitstagen in Power BI](https://www.youtube.com/watch?v=cD-5z_Bq0N4) | 2025-05-01 | nur-zeitstempel | [08:34](https://www.youtube.com/watch?v=cD-5z_Bq0N4&t=514s) · [15:18](https://www.youtube.com/watch?v=cD-5z_Bq0N4&t=918s) · [38:00](https://www.youtube.com/watch?v=cD-5z_Bq0N4&t=2280s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [03:46](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=226s) · [10:57](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=657s) · [13:30](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=810s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [02:09](https://www.youtube.com/watch?v=mTVeZzshLzE&t=129s) · [05:02](https://www.youtube.com/watch?v=mTVeZzshLzE&t=302s) · [40:00](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2400s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [04:42](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=282s) · [58:32](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=3512s) · [1:09:28](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=4168s) |
| [Unboxing MCP Server for Power BI Modelling](https://www.youtube.com/watch?v=iinfiHxznOU) | 2025-12-01 | nur-zeitstempel | [01:34](https://www.youtube.com/watch?v=iinfiHxznOU&t=94s) · [12:37](https://www.youtube.com/watch?v=iinfiHxznOU&t=757s) · [21:08](https://www.youtube.com/watch?v=iinfiHxznOU&t=1268s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [00:00](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=0s) · [01:35](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=95s) · [1:07:25](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=4045s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [06:24](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=384s) · [16:25](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=985s) · [55:29](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=3329s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [04:43](https://www.youtube.com/watch?v=lZvpCBMKASM&t=283s) · [17:44](https://www.youtube.com/watch?v=lZvpCBMKASM&t=1064s) · [36:51](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2211s) |
| [Power BI Update September 2025](https://www.youtube.com/watch?v=6gQiIbyhWEc) | 2025-09-01 | nur-zeitstempel | [00:00](https://www.youtube.com/watch?v=6gQiIbyhWEc&t=0s) · [08:56](https://www.youtube.com/watch?v=6gQiIbyhWEc&t=536s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | nur-zeitstempel | [11:42](https://www.youtube.com/watch?v=bt81POE-9Ig&t=702s) · [14:57](https://www.youtube.com/watch?v=bt81POE-9Ig&t=897s) · [16:43](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1003s) |
| [Daten-WG Deep Dive Financial Reporting - part 7](https://www.youtube.com/watch?v=232JhS9vbQ0) | 2025-09-01 | nur-zeitstempel | [01:36](https://www.youtube.com/watch?v=232JhS9vbQ0&t=96s) · [05:24](https://www.youtube.com/watch?v=232JhS9vbQ0&t=324s) · [25:30](https://www.youtube.com/watch?v=232JhS9vbQ0&t=1530s) |
| [Power BI vs. Qlik](https://www.youtube.com/watch?v=vd1r02bj9Qk) | 2026-01-01 | kernaussagen+zeitstempel | [10:48](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=648s) · [12:25](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=745s) · [15:57](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=957s) |
| [BI Thinkers Talk - Data Modelling - Fabric Data Days Edition](https://www.youtube.com/watch?v=mUALlPmGcEk) | 2025-11-01 | kernaussagen+zeitstempel | [09:34](https://www.youtube.com/watch?v=mUALlPmGcEk&t=574s) · [17:32](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1052s) · [35:39](https://www.youtube.com/watch?v=mUALlPmGcEk&t=2139s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [05:01](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=301s) · [09:41](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=581s) · [51:29](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=3089s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [02:30](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=150s) · [13:39](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=819s) · [39:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=2368s) |
| [Visual Analytics with Power BI](https://www.youtube.com/watch?v=UxE0DPnLgIg) | 2021-09-01 | nur-zeitstempel | [15:50](https://www.youtube.com/watch?v=UxE0DPnLgIg&t=950s) · [31:00](https://www.youtube.com/watch?v=UxE0DPnLgIg&t=1860s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=03%20%C2%B7%20Semantische%20Modelle%20%26%20%2ADirect%20Lake%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Zwei%20Varianten%20%E2%80%94%20wichtig%20seit%202025) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Der%20Vergleich) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | nur-zeitstempel | [04:49](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=289s) · [08:08](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=488s) · [11:32](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=692s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [43:39](https://www.youtube.com/watch?v=VD1N68Fhoco&t=2619s) · [53:20](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3200s) · [1:01:04](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3664s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [30:17](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=1817s) · [38:13](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2293s) · [47:59](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2879s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [01:34](https://www.youtube.com/watch?v=r416vanitYw&t=94s) · [05:28](https://www.youtube.com/watch?v=r416vanitYw&t=328s) · [58:52](https://www.youtube.com/watch?v=r416vanitYw&t=3532s) |
| [Daten-WG Deep Dive: AI on top of BI](https://www.youtube.com/watch?v=HXAP16trRc8) | 2025-07-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) · [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) · [Abschnitt](https://www.youtube.com/watch?v=HXAP16trRc8) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Aperformance
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Aperformance&f=topic%3Aperformance
