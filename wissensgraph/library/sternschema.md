---
id: "topic:sternschema"
name: "Sternschema"
typ: thema
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 30
kernaussagen: 22
mit_kernaussagen: 7
aliase:
  - "Star Schema"
  - "Faktentabelle"
  - "Dimensionstabelle"
  - "Fakten und Dimensionen"
  - "Star-Schema"
---

# Sternschema

Ein Sternschema erlaubt unabhängiges Filtern über mehrere Dimensionen, ohne dass sich die Filter gegenseitig stören. Bei geringer Datenmenge und einfachen Measures zeigte sich in eigenen Tests kein signifikanter Performance-Unterschied zwischen Flat Table und Sternschema. Das 1988 entwickelte Modell mit separaten Tabellen für Kunden, Lieferanten und Artikel sowie einer zentralen Tabelle mit Schlüsseln und Kennzahlen wie Rechnungssumme und Provision entsprach im Nachhinein einem Sternschema.

## Aliase

Star Schema, Faktentabelle, Dimensionstabelle, Fakten und Dimensionen, Star-Schema

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Data Vault](data-vault.md) | gegensatz | belegt | 0 |
| [DirectQuery](directquery.md) | gegensatz | belegt | 9 |
| [Performance](performance.md) | setzt-voraus | belegt | 43 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 43 |
| [Datenmodellierung](datenmodellierung.md) | ko-vorkommen | heuristik | 31 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 29 |
| [Power Query](power-query.md) | ko-vorkommen | heuristik | 26 |
| [DAX](dax.md) | ko-vorkommen | heuristik | 24 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 19 |
| [Excel](excel.md) | ko-vorkommen | heuristik | 19 |
| [Lakehouse](lakehouse.md) | ko-vorkommen | heuristik | 14 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 12 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 10 |
| [Planung](planung.md) | ko-vorkommen | heuristik | 10 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 9 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 01:39 | Das 1988 entwickelte Modell mit separaten Tabellen für Kunden, Lieferanten und Artikel sowie einer zentralen Tabelle mit Schlüsseln und Kennzahlen wie Rechnungssumme und Provision entsprach im Nachhinein einem Sternschema. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=99s) |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 04:54 | Die ersten Veröffentlichungen zum Sternschema stammen aus der Mitte der 1990er-Jahre. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=294s) |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 06:29 | Ralph Kimball veröffentlichte Mitte der 1990er-Jahre ein Buch, in dem er forderte, Data Warehouses stets mit einem Sternschema beziehungsweise dimensionaler Modellierung aufzubauen. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=389s) |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 06:29 | Zwischen Ralph Kimball und Bill Inmon entstand ein langjähriger Grundsatzstreit darüber, ob Data Warehouses dimensional per Sternschema oder relational in dritter Normalform modelliert werden sollten. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=389s) |
| Meinung | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 06:29 | Peter Gluchowski schätzt, dass sich das Sternschema in größeren Unternehmen eher auf der Data-Mart-Ebene findet als auf der Ebene des Kern-Data-Warehouse. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=389s) |
| Meinung | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 08:12 | Im Mittelstand wird die Aufteilung zwischen Sternschema und relationaler Modellierung nach Einschätzung von Peter Gluchowski anders gehandhabt als in Großunternehmen. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=492s) |
| Fakt | Fabric Planning unboxing | 03:06 | Eine KI hat aus einer hochgeladenen CSV-Datei automatisch ein Sternschema samt Notebook erstellt. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=186s) |
| Meinung | Denken in Tabellen | 01:01 | Ein Meeting-Teilnehmer empfand die vorherige Flat Table als einfacher als das neu eingeführte Sternschema. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=61s) |
| Meinung | Denken in Tabellen | 03:20 | Power BI ist technisch eng mit Analysis Services verbunden, weshalb aus dieser Perspektive ein Sternschema die passende Modellierung ist. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=200s) |
| Fakt | Denken in Tabellen | 08:37 | Ein Sternschema erlaubt unabhängiges Filtern über mehrere Dimensionen, ohne dass sich die Filter gegenseitig stören. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=517s) |
| Empfehlung | Power BI vs. Qlik | 10:48 | Ab einem gewissen Datenvolumen sollte in Power BI ein Sternschema verwendet werden, um Performance-Probleme zu vermeiden. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=648s) |
| Warnung | Denken in Tabellen | 17:12 | Bei Benchmark-Tests mit künstlich generierten Testdaten wie der Kontoso-Datenbank komprimiert ein Sternschema teils schlechter als erwartet, weil reale Kundenverteilungen von Testdaten abweichen. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1032s) |
| Fakt | Denken in Tabellen | 18:55 | Bei geringer Datenmenge und einfachen Measures zeigte sich in eigenen Tests kein signifikanter Performance-Unterschied zwischen Flat Table und Sternschema. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1135s) |
| Meinung | Denken in Tabellen | 23:40 | Bei einem Ist-Budget-Vergleich mit unterschiedlicher Granularität von Kunde und Produkt sowie täglicher und monatlicher Frequenz wird eine flache Tabelle mit Field Parameters schnell unübersichtlich, während ein Sternschema die Zusammenführung vereinfacht. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1420s) |
| Empfehlung | Denken in Tabellen | 37:00 | Jasmin empfiehlt, für einmalige und eng begrenzte Auswertungen im Fachbereich eine Flat Table in Excel zu nutzen, für wiederkehrende Analysen aber ein Datenmodell zu bauen, weil Datenfehler darin schneller auffallen. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=2220s) |
| Meinung | BI Thinkers Talk nr.71 | 08:04 | DirectQuery unterstützt laut den Sprechern bei Quellen wie Snowflake oder Databricks kein Sternschema. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=484s) |
| Meinung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 09:34 | Das Sternschema mit einer zentralen Faktentabelle und umgebenden Dimensionen wird von den Sprechern als bevorzugter Modellierungsansatz in Power BI favorisiert. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=574s) |
| Empfehlung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 12:42 | Über Role-Playing-Dimensionen lässt sich ein einmal modelliertes Objekt wie Kunde in mehreren Rollen, etwa als Liefer-, Rechnungs- und Auftragskunde, wiederverwenden, ohne die Kundendaten mehrfach zu pflegen. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=762s) |
| Warnung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 17:32 | Wird eine One-Big-Table per Inner Join aus einem dimensionalen Modell erzeugt, fallen Kunden ohne zugehörige Transaktionen aus der Analyse heraus, während sie im Sternschema in der Dimension erhalten bleiben. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1052s) |
| Warnung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 27:28 | Sobald ein Modell mehr als eine Faktentabelle mit unterschiedlichen Dimensionen oder Granularitäten enthält, werden die benötigten DAX-Formeln in einer One-Big-Table deutlich komplexer als im Sternschema. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1648s) |
| Empfehlung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 1:20:42 | Sobald mehrere Faktentabellen für einen Drill-Across kombiniert werden sollen oder unternehmensweit standardisierte Dimensionen benötigt werden, ist ein dimensionales Modell mit Sternschema vorzuziehen. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=4842s) |
| Fakt | BI Thinkers Talk nr.67 | 24:50 | Dem KI-Agenten wurden bei der Modellgenerierung explizite Vorgaben mitgegeben, darunter das Vermeiden von Snowflake-Dimensionen, Beziehungen möglichst in eine Richtung und geschäftsfreundliche statt technische Tabellennamen. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1490s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [BI Thinkers Talk - Data Modeling - Fabric Data Days Edition [EN]](https://www.youtube.com/watch?v=uxYFqwe_Wiw) | 2025-12-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) · [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) · [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) |
| [BI Thinkers Talk - Data Modelling - Fabric Data Days Edition](https://www.youtube.com/watch?v=mUALlPmGcEk) | 2025-11-01 | kernaussagen+zeitstempel | [22:42](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1362s) · [45:29](https://www.youtube.com/watch?v=mUALlPmGcEk&t=2729s) · [54:01](https://www.youtube.com/watch?v=mUALlPmGcEk&t=3241s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [01:01](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=61s) · [04:19](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=259s) · [33:37](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=2017s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Dimensionen%20extrahieren) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Beziehungen%201%3An) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Eine%20Granularit%C3%A4t%20pro%20Faktentabelle) |
| [27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite](https://www.youtube.com/watch?v=dKA-38gRD8Q) | 2026-05-01 | kernaussagen+zeitstempel | [06:29](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=389s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [11:22](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=682s) · [35:12](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2112s) · [48:09](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=2889s) |
| [Datenmodellierung ist Governance](https://www.youtube.com/watch?v=lH_-A8NAQ-k) | 2025-11-01 | nur-zeitstempel | [01:10](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=70s) · [05:02](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=302s) · [07:04](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=424s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [13:00](https://www.youtube.com/watch?v=iymmxuXHh44&t=780s) · [47:43](https://www.youtube.com/watch?v=iymmxuXHh44&t=2863s) · [52:40](https://www.youtube.com/watch?v=iymmxuXHh44&t=3160s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [03:06](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=186s) · [06:14](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=374s) · [20:19](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=1219s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | nur-zeitstempel | [10:09](https://www.youtube.com/watch?v=bt81POE-9Ig&t=609s) · [11:42](https://www.youtube.com/watch?v=bt81POE-9Ig&t=702s) · [46:12](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2772s) |
| [Power BI vs. Qlik](https://www.youtube.com/watch?v=vd1r02bj9Qk) | 2026-01-01 | kernaussagen+zeitstempel | [10:48](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=648s) · [15:57](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=957s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [51:31](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3091s) · [53:20](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3200s) · [57:54](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3474s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | nur-zeitstempel | [01:40](https://www.youtube.com/watch?v=TYmKrreMO3I&t=100s) · [03:13](https://www.youtube.com/watch?v=TYmKrreMO3I&t=193s) · [16:11](https://www.youtube.com/watch?v=TYmKrreMO3I&t=971s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20ins%20Modell%20geh%C3%B6rt) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Beziehungen%20definieren) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Das%20Ziel-Schema) |
| [Realtalk zu Self Service mit Power BI](https://www.youtube.com/watch?v=27rC2zefFOU) | 2024-02-01 | nur-zeitstempel | [17:04](https://www.youtube.com/watch?v=27rC2zefFOU&t=1024s) |
| [Daten-WG Deep Dive Financial Reporting - part 7](https://www.youtube.com/watch?v=232JhS9vbQ0) | 2025-09-01 | nur-zeitstempel | [00:00](https://www.youtube.com/watch?v=232JhS9vbQ0&t=0s) · [03:25](https://www.youtube.com/watch?v=232JhS9vbQ0&t=205s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | nur-zeitstempel | [06:35](https://www.youtube.com/watch?v=DQENmzAkNqw&t=395s) · [09:45](https://www.youtube.com/watch?v=DQENmzAkNqw&t=585s) |
| [BI Thinkers Talk nr.75](https://www.youtube.com/watch?v=BQdSo6ZnmKY) | 2026-04-01 | kernaussagen+zeitstempel | [14:14](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=854s) · [22:02](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1322s) |
| [Mythos Data Vault und richtig große Modelle](https://www.youtube.com/watch?v=rrCi0lnGrCg) | 2025-07-01 | nur-zeitstempel | [01:47](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=107s) |
| [Data Binning and Lorenz Curve in DAX \| Alberto Ferrari & Michael Tenner, Berlin Power BI User Group](https://www.youtube.com/watch?v=183uLZ3GYDo) | 2023-01-01 | nur-zeitstempel | [44:32](https://www.youtube.com/watch?v=183uLZ3GYDo&t=2672s) · [1:18:16](https://www.youtube.com/watch?v=183uLZ3GYDo&t=4696s) |
| [Why Passion Beats Niche](https://www.youtube.com/watch?v=ihi7UiJ_TtQ) | 2025-09-01 | nur-zeitstempel | [25:05](https://www.youtube.com/watch?v=ihi7UiJ_TtQ&t=1505s) |
| [Prinzipien oder Paragrafen](https://www.youtube.com/watch?v=6WhWLcuFvZE) | 2026-02-01 | kernaussagen+zeitstempel | [20:43](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=1243s) |
| [Dein erstes Dashboard — Power-BI-Praxis-Pfad](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html#:~:text=Wenn%20du%20weitermachen%20willst) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [49:13](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=2953s) |
| [Daten-WG Special: Power BI vs. Qlik](https://www.youtube.com/watch?v=aYHk_V8n_CE) | 2025-10-01 | nur-zeitstempel | [43:36](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=2616s) |
| [Unboxing MCP Server for Power BI Modelling](https://www.youtube.com/watch?v=iinfiHxznOU) | 2025-12-01 | nur-zeitstempel | [28:36](https://www.youtube.com/watch?v=iinfiHxznOU&t=1716s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [41:32](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2492s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [01:34](https://www.youtube.com/watch?v=r416vanitYw&t=94s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [26:22](https://www.youtube.com/watch?v=G8s96sHUHac&t=1582s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [09:41](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=581s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Asternschema
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Asternschema&f=topic%3Asternschema
