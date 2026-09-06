---
id: "tool:field-parameters"
name: "Field Parameters"
typ: tool
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 12
kernaussagen: 24
mit_kernaussagen: 6
aliase:
  - "Feldparameter"
  - "Field Parameter"
---

# Field Parameters

Field Parameters behalten jetzt eine aufgeklappte zweite Ebene bei, wenn zwischen Parametern gewechselt wird. Vor dem Update klappte eine aufgeklappte zusätzliche Ebene bei Field Parameters beim Wechsel automatisch wieder zu. Die DAX-Funktion NAMEOF, die ursprünglich aus Field Parameters stammt, ist jetzt separat verfügbar und liefert den Namen eines Measures oder einer Spalte.

## Aliase

Feldparameter, Field Parameter

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [DAX](dax.md) | setzt-voraus | belegt | 5 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 10 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 9 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 8 |
| [Power BI Desktop](power-bi-desktop.md) | ko-vorkommen | heuristik | 4 |
| [Drillthrough](drillthrough.md) | ko-vorkommen | heuristik | 4 |
| [Bookmarks](bookmarks.md) | ko-vorkommen | heuristik | 4 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 00:30 | Ein Feldparameter lässt sich in Power BI Desktop über Modeling und "Neuer Feldparameter" anlegen. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=30s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 00:30 | Beim Anlegen eines Feldparameters aus einer Datumstabelle lassen sich Aufteilungen wie Jahr und Monat als Optionen auswählen. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=30s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 01:11 | Power BI erzeugt beim Anlegen eines Feldparameters automatisch eine per DAX erstellte Parametertabelle sowie einen passenden Slicer. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=71s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 01:37 | Eine Feldparameter-Tabelle kann mehrere Kombinationen gleichzeitig enthalten, zum Beispiel nur das Jahr, Monat und Jahr kombiniert, sowie nur den Monat. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=97s) |
| Empfehlung | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 02:05 | Der Slicer eines Feldparameters lässt sich auf Single Selection einstellen, damit jeweils nur eine Option gewählt werden kann. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=125s) |
| Fakt | Power BI Update Februar 2026 | 02:18 | Die DAX-Funktion NAMEOF, die ursprünglich aus Field Parameters stammt, ist jetzt separat verfügbar und liefert den Namen eines Measures oder einer Spalte. | [▶](https://www.youtube.com/watch?v=u-lgbDfIlLg&t=138s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 02:32 | Wird ein Feldparameter als Tabelle eingefügt, zeigt sie den berechneten Wert; wird derselbe Parameter in einem Slicer verwendet, zeigt dieser stattdessen die Auswahlmöglichkeiten. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=152s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 02:32 | Wenn eine Feldparameter-Liste in einen Slicer umgewandelt wird, bleiben die zuvor angezeigten Werte als Auswahlmöglichkeiten im Slicer erhalten. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=152s) |
| Empfehlung | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 02:32 | Für einen Feldparameter-Slicer sollte eine vertikale Listendarstellung statt eines Between-Slicers verwendet werden. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=152s) |
| Fakt | BI Thinkers Talk n.73 | 03:18 | Field Parameters lassen sich aus einer Datumstabelle mit verschiedenen Ebenen (z. B. Jahr, Monatsname) aufbauen und über die Option "Single Selection" als klassischer Werte-Slicer statt als Auswahl-Schalter nutzen. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=198s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 03:23 | Ein Feldparameter kann als interaktiver Filter genutzt werden, der je nach gewählter Kombination unterschiedliche Filterwerte anzeigt, etwa nur Jahre oder Monate mit Jahreszahl. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=203s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 03:23 | Die Idee, einen Feldparameter als dynamischen, von der Auswahl abhängigen Filter einzusetzen, stammt aus einem Kundenprojekt und wurde in einem BI-Sinker-Talk vorgestellt. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=203s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 03:58 | Über die Option "Show Selected Field" im Feldbereich eines Feldparameters lässt sich der Name des aktuell ausgewählten Parameterfelds anzeigen. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=238s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 04:26 | Über die Option "Show Values of Selected Field" lassen sich stattdessen die Werte des aktuell ausgewählten Feldparameter-Felds anzeigen. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=266s) |
| Empfehlung | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 04:26 | Die Optionen "Show Selected Field" und "Show Values of Selected Field" bei Feldparametern sind wenig bekannt, lohnen sich aber für den Einsatz in Projekten. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=266s) |
| Fakt | BI Thinkers Talk n.73 | 06:32 | Für Field-Parameter-Slicer gibt es eine wenig bekannte Option "Show values instead of parameter", mit der statt der Parameterbezeichnung die tatsächlichen Werte angezeigt werden. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=392s) |
| Fakt | BI Thinkers Talk n.73 | 08:06 | Seit einem Update im Januar merken sich Field Parameters in einer Matrix den zuletzt gewählten Hierarchie-Stand, wenn zwischen unterschiedlichen Gruppierungen umgeschaltet wird. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=486s) |
| Empfehlung | BI Thinkers Talk n.73 | 24:12 | Field Parameters lassen sich um eine zusätzliche Spalte erweitern, die zusammengehörige Measures wie "Quantity" und "Amount" zu Kategorien gruppiert, sodass mehrere Measures gemeinsam über eine Filterauswahl gesteuert werden können. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=1452s) |
| Fakt | Denken in Tabellen | 00:27 | Eine aus Databricks stammende Flat Table führte in Power BI zu Problemen mit einer unsauberen Zeitachse und zu wenig flexiblen Darstellungen, die zunächst mit Field Parameters adressiert wurden. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=27s) |
| Fakt | Power BI Update Januar 2026 | 02:02 | Field Parameters behalten jetzt eine aufgeklappte zweite Ebene bei, wenn zwischen Parametern gewechselt wird. | [▶](https://www.youtube.com/watch?v=TAM5AAZqh7k&t=122s) |
| Fakt | Power BI Update Januar 2026 | 02:02 | Vor dem Update klappte eine aufgeklappte zusätzliche Ebene bei Field Parameters beim Wechsel automatisch wieder zu. | [▶](https://www.youtube.com/watch?v=TAM5AAZqh7k&t=122s) |
| Meinung | Power BI Update Januar 2026 | 03:19 | Der Sprecher hält die Field-Parameter- und Quicktipp-Updates für die produktivsten Neuerungen dieses Monats. | [▶](https://www.youtube.com/watch?v=TAM5AAZqh7k&t=199s) |
| Meinung | Denken in Tabellen | 23:40 | Bei einem Ist-Budget-Vergleich mit unterschiedlicher Granularität von Kunde und Produkt sowie täglicher und monatlicher Frequenz wird eine flache Tabelle mit Field Parameters schnell unübersichtlich, während ein Sternschema die Zusammenführung vereinfacht. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1420s) |
| Meinung | 10 Jahre Power BI | 42:37 | Mehrere Teilnehmer nennen Field Parameters als eines der wirkungsvollsten neuen Power-BI-Features, weil sie ein einzelnes Visual für verschiedene Kennzahlen und Achsen mehrfach nutzbar machen. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=2557s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Power BI Update Januar 2026](https://www.youtube.com/watch?v=TAM5AAZqh7k) | 2026-01-01 | kernaussagen+zeitstempel | [02:02](https://www.youtube.com/watch?v=TAM5AAZqh7k&t=122s) · [03:19](https://www.youtube.com/watch?v=TAM5AAZqh7k&t=199s) |
| [Power BI Update Februar 2026](https://www.youtube.com/watch?v=u-lgbDfIlLg) | 2026-02-01 | kernaussagen+zeitstempel | [02:18](https://www.youtube.com/watch?v=u-lgbDfIlLg&t=138s) |
| [Power BI Update Juli 2025](https://www.youtube.com/watch?v=TkxwcAyBGUM) | 2025-07-01 | nur-zeitstempel | [04:27](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=267s) |
| [Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“](https://www.youtube.com/watch?v=v8dvnqqa7f8) | 2026-02-01 | kernaussagen+zeitstempel | [00:30](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=30s) |
| [TMDL Magie: Multi Parameter Tabelle - Feldparameter Next Level! \| Power BI Tutorial](https://www.youtube.com/watch?v=sShNdgnHjr4) | 2025-10-01 | nur-zeitstempel | [00:01](https://www.youtube.com/watch?v=sShNdgnHjr4&t=1s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [24:03](https://www.youtube.com/watch?v=VD1N68Fhoco&t=1443s) · [27:20](https://www.youtube.com/watch?v=VD1N68Fhoco&t=1640s) · [29:09](https://www.youtube.com/watch?v=VD1N68Fhoco&t=1749s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [24:12](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=1452s) · [59:01](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=3541s) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [42:37](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=2557s) · [47:19](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=2839s) · [1:11:57](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=4317s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | nur-zeitstempel | [01:45](https://www.youtube.com/watch?v=4VVNDNusq4U&t=105s) · [03:20](https://www.youtube.com/watch?v=4VVNDNusq4U&t=200s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=07%20%C2%B7%20Interaktivit%C3%A4t%20%2A%C2%B7%20UX%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Bookmark%20Navigator) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Field%20Parameters%20f%C3%BCr%20Dimensionen) |
| [Power BI Deep Dive: DAX UDF + TMDL](https://www.youtube.com/watch?v=0FPA1k5YiTs) | 2025-10-01 | nur-zeitstempel | [42:41](https://www.youtube.com/watch?v=0FPA1k5YiTs&t=2561s) |
| [BI Thinkers Talk nr.63](https://www.youtube.com/watch?v=9VX4-lLa0EI) | 2025-06-01 | nur-zeitstempel | [29:33](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=1773s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Afield-parameters
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Afield-parameters&f=tool%3Afield-parameters
