---
id: "tool:dax"
name: "DAX"
typ: tool
stand: "2026-09-07"
build: "20260907-1056"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 57
kernaussagen: 40
mit_kernaussagen: 17
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/dax.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/dax.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/dax.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/dax.json"
aliase:
  - "Data Analysis Expressions"
---

# DAX

Der Input Slicer bietet automatisch einen Anti-Filter wie 'enthält nicht', für den früher DAX-Workarounds nötig waren. Die DAX-Funktion NAMEOF, die ursprünglich aus Field Parameters stammt, ist jetzt separat verfügbar und liefert den Namen eines Measures oder einer Spalte. Die neue DAX-Funktion TABLEOF liefert zu einem angegebenen Measure oder einer Spalte die zugehörige gesamte Tabelle zurück.

## Aliase

Data Analysis Expressions

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Field Parameters](field-parameters.md) | setzt-voraus | belegt | 5 |
| [Azure Maps](azure-maps.md) | setzt-voraus | belegt | 0 |
| [Qlik](qlik.md) | gegensatz | belegt | 0 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 52 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 50 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 38 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 32 |
| [Sternschema](sternschema.md) | ko-vorkommen | heuristik | 24 |
| [Power Query](power-query.md) | ko-vorkommen | heuristik | 22 |
| [Datenmodellierung](datenmodellierung.md) | ko-vorkommen | heuristik | 19 |
| [DAX Studio](dax-studio.md) | ko-vorkommen | heuristik | 19 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 17 |
| [KI](ki.md) | ko-vorkommen | heuristik | 16 |
| [Power BI Desktop](power-bi-desktop.md) | ko-vorkommen | heuristik | 14 |
| [Copilot](copilot.md) | ko-vorkommen | heuristik | 12 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk nr.76 | 25:29 | Bei HTML-Custom-Visuals in Power BI wird der HTML-Code in eine DAX-Formel geschrieben, die als Measure in das HTML-Visual gezogen wird. | [▶](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=1529s) |
| Fakt | Power BI Update April 2026 | 01:55 | Als Preview-Feature sollen DAX-berechnete Spalten künftig auch in Direct-Lake-Modellen anlegbar sein, aktuell ist die Option dort noch ausgeblendet. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=115s) |
| Fakt | Power BI Update April 2026 | 01:55 | Die neue Benutzer-Awareness bei Spalten funktioniert bislang nur für DAX-berechnete Spalten, nicht für alle Spaltentypen. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=115s) |
| Fakt | Power BI Update April 2026 | 02:58 | Mit der Benutzer-Awareness lässt sich die Darstellung einer Spalte an die Culture-Einstellung des jeweiligen Nutzers anpassen, etwa bei Zahlen- und Datumsformaten. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=178s) |
| Meinung | Power BI Update April 2026 | 02:58 | Der Autor hält das Culture-Awareness-Feature für DAX-Spalten für das Update mit dem größten praktischen Impact in diesem Release. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=178s) |
| Meinung | Power BI Update April 2026 | 02:58 | Die Culture-Awareness-Funktion könnte künftig auch für Anwendungsfälle wie Währungsumrechnung oder mehrsprachige Produktnamen in Tabellen genutzt werden. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=178s) |
| Fakt | BI Thinkers Talk nr.75 | 07:51 | Der Power BI Fixer bietet im Notebook eine alternative Oberfläche ähnlich Tabular Editor, um Measures und DAX-Ausdrücke direkt am Semantic Model zu bearbeiten und zu formatieren. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=471s) |
| Fakt | BI Thinkers Talk nr.75 | 12:37 | Die Funktion "Fix IBCS Variance Chart" des Fixers fügt automatisiert rund 175 Measures für Labels, Deltas und Arrow-Bars in das Semantic Model ein. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=757s) |
| Fakt | Power BI Update März 2026 | 02:28 | Mit den Custom Totals lässt sich die Gesamtsumme einer Kennzahl (Measure Totals) individuell anders berechnen als die Summe der Einzelzeilen. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=148s) |
| Warnung | Power BI Update März 2026 | 04:06 | Custom Totals sollten bei nicht-additiven Werten wie Prozenten oder Verhältnissen vorsichtig verwendet werden, weil eine einfache Summe hier oft nicht sinnvoll ist. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=246s) |
| Fakt | Power BI Update März 2026 | 04:06 | Hinter einem Custom Total steckt technisch eine visuelle Berechnung mit einem EXPAND ALL und einer Summe über die Zeilen, die sich öffnen und bearbeiten lässt. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=246s) |
| Fakt | Fabric Planning unboxing | 04:42 | Über die DAX Query View ließ sich die KI triviale Measures für das Semantic Model anlegen. | [▶](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=282s) |
| Fakt | Power BI Update März 2026 | 05:57 | Benutzerdefinierte DAX-Funktionen lassen sich jetzt auch über die grafische Oberfläche anlegen. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=357s) |
| Fakt | Power BI Update März 2026 | 05:57 | Vor der neuen GUI-Unterstützung konnten benutzerdefinierte DAX-Funktionen nur über die DAX Query View oder über TMDL angelegt werden. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=357s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 01:11 | Power BI erzeugt beim Anlegen eines Feldparameters automatisch eine per DAX erstellte Parametertabelle sowie einen passenden Slicer. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=71s) |
| Fakt | Power BI Update Februar 2026 | 01:21 | Der Input Slicer bietet automatisch einen Anti-Filter wie 'enthält nicht', für den früher DAX-Workarounds nötig waren. | [▶](https://www.youtube.com/watch?v=u-lgbDfIlLg&t=81s) |
| Fakt | Power BI Update Februar 2026 | 02:18 | Die DAX-Funktion NAMEOF, die ursprünglich aus Field Parameters stammt, ist jetzt separat verfügbar und liefert den Namen eines Measures oder einer Spalte. | [▶](https://www.youtube.com/watch?v=u-lgbDfIlLg&t=138s) |
| Meinung | Power BI Update Februar 2026 | 02:18 | NAMEOF wird laut dem Sprecher besonders in Calculation Groups bei verschachtelten Bedingungen nützlich. | [▶](https://www.youtube.com/watch?v=u-lgbDfIlLg&t=138s) |
| Fakt | Power BI Update Februar 2026 | 02:18 | Die neue DAX-Funktion TABLEOF liefert zu einem angegebenen Measure oder einer Spalte die zugehörige gesamte Tabelle zurück. | [▶](https://www.youtube.com/watch?v=u-lgbDfIlLg&t=138s) |
| Meinung | Power BI Update Februar 2026 | 02:18 | Der Sprecher erwartet, dass die neuen DAX-Funktionen NAMEOF und TABLEOF etliche bisherige Workarounds überflüssig machen werden. | [▶](https://www.youtube.com/watch?v=u-lgbDfIlLg&t=138s) |
| Warnung | BI Thinkers Talk n.73 | 21:09 | Bei zwei übereinandergelegten Visuals mit unterschiedlichen Zeiträumen muss beachtet werden, dass ein Measure für bestimmte Zeitpunkte einen Blankwert liefern kann, wodurch die Achsendarstellung zwischen den Visuals inkonsistent wird. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=1269s) |
| Empfehlung | BI Thinkers Talk n.73 | 24:12 | Field Parameters lassen sich um eine zusätzliche Spalte erweitern, die zusammengehörige Measures wie "Quantity" und "Amount" zu Kategorien gruppiert, sodass mehrere Measures gemeinsam über eine Filterauswahl gesteuert werden können. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=1452s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 09:01 | Für Power BI gibt es inzwischen einen offiziellen First-Party-MCP-Server, mit dem sich Measures direkt im Bericht ansehen und optimieren lassen. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=541s) |
| Empfehlung | Power BI: (Vertriebs-) Regionen in Azure Maps | 19:10 | Fehlt in den Quelldaten eine Länderspalte, kann eine berechnete DAX-Spalte sicherstellen, dass Azure Maps die Orte korrekt in Deutschland verortet. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=1150s) |
| Fakt | BI Thinkers Talk nr.71 | 20:48 | Mit der DAX-Funktion INFO.VIEW.RELATIONSHIPS lassen sich die Beziehungen eines Datenmodells als Tabelle ausgeben. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1248s) |
| Fakt | BI Thinkers Talk nr.71 | 24:01 | In Power BI Desktop lassen sich Berechnungen als berechnete Spalten, als Measures oder als Visual Calculations erstellen. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1441s) |
| Fakt | BI Thinkers Talk nr.71 | 36:30 | Die DAX-Funktion TOTALYTD liefert die laufende Summe seit Jahresanfang. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2190s) |
| Fakt | BI Thinkers Talk nr.71 | 43:24 | Die DAX-Funktion SUBSTITUTE ersetzt einen Text durch einen anderen, ohne dass dafür eine Zeichenlänge angegeben werden muss. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2604s) |
| Fakt | BI Thinkers Talk nr.71 | 1:33:53 | Es gibt insgesamt neun DAX-Funktionen, deren Name das Wort COUNT enthält. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=5633s) |
| Empfehlung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 11:08 | Es wird empfohlen, eine zentrale, separate Datumstabelle im Modell zu führen, um Zeitlogiken einheitlich abbilden zu können. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=668s) |
| Empfehlung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 12:42 | Explizite Measures werden gegenüber impliziten, automatisch generierten Summen empfohlen, damit Kennzahlen auch für externe Werkzeuge verfügbar und einheitlich formatiert sind. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=762s) |
| Warnung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 27:28 | Sobald ein Modell mehr als eine Faktentabelle mit unterschiedlichen Dimensionen oder Granularitäten enthält, werden die benötigten DAX-Formeln in einer One-Big-Table deutlich komplexer als im Sternschema. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1648s) |
| Warnung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 35:39 | Wird eine Datumsspalte nur zur Anzeige auf Monatsebene formatiert, bleiben im Hintergrund weiterhin die einzelnen Tageswerte bestehen, was bei DAX-Berechnungen zu unerwarteten Ergebnissen führen kann. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=2139s) |
| Meinung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 1:03:38 | Anwender mit wenig DAX-Erfahrung erhalten in einem One-Big-Table-Modell häufiger automatisch die von ihnen erwarteten Ergebnisse als in einem dimensionalen Modell. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=3818s) |
| Fakt | BI Thinkers Talk nr.67 | 1:02:12 | Neue wiederverwendbare DAX-Funktionen lassen sich derzeit nicht direkt in der Power-BI-Desktop-Oberfläche erstellen oder bearbeiten, sondern nur im DAX-Abfrageeditor oder über die TMDL-Ansicht, während Desktop sie nur lesend als vorhandene Funktionen mit Lösch- und Umbenennen-Option anzeigt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3732s) |
| Meinung | 10 Jahre Power BI | 18:22 | Mit DAX ließen sich Lagerbestände zu einem bestimmten Zeitpunkt (Point in Time) einfacher berechnen als mit Set Analysis in Qlik. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=1102s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-2 | 02:15 | Wiederverwertbare Berechnungslogik sollte dauerhaft ins Semantic Model statt in Visual Calculations gepackt werden, da Visual Calculations eher ein Shortcut sind. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=135s) |
| Fakt | Metadaten als Superkraft | 07:17 | Power BI kann über DAX-INFO-Funktionen bereits viele Metadaten direkt aus dem Modell auslesen. | [▶](https://www.youtube.com/watch?v=UUlPoJOhco8&t=437s) |
| Fakt | Metadaten als Superkraft | 13:30 | Fehlende Beschreibungen von Measures in Power BI führen dazu, dass verschiedene Personen dieselbe Kennzahl unterschiedlich benennen und berechnen. | [▶](https://www.youtube.com/watch?v=UUlPoJOhco8&t=810s) |
| Fakt | Was ist Self-Service und warum ist das so schwer? | 17:22 | Tom Martens investiert bewusst begrenzte Lernzeit in DAX, Power Query, Python und Fabric-Notebooks, weil ihm das langfristig mehr Zeit und bessere Analysen ermöglicht. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1042s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Expanded Tables in DAX verstehen – Beziehungen & Filter erklärt \| Power BI Tutorial](https://www.youtube.com/watch?v=LQQEn7IOb7w) | 2025-12-01 | nur-zeitstempel | [00:01](https://www.youtube.com/watch?v=LQQEn7IOb7w&t=1s) · [04:04](https://www.youtube.com/watch?v=LQQEn7IOb7w&t=244s) · [05:40](https://www.youtube.com/watch?v=LQQEn7IOb7w&t=340s) |
| [Power BI Update Februar 2026](https://www.youtube.com/watch?v=u-lgbDfIlLg) | 2026-02-01 | kernaussagen+zeitstempel | [01:21](https://www.youtube.com/watch?v=u-lgbDfIlLg&t=81s) · [02:18](https://www.youtube.com/watch?v=u-lgbDfIlLg&t=138s) |
| [Power BI Update September 2025](https://www.youtube.com/watch?v=6gQiIbyhWEc) | 2025-09-01 | nur-zeitstempel | [01:47](https://www.youtube.com/watch?v=6gQiIbyhWEc&t=107s) · [02:45](https://www.youtube.com/watch?v=6gQiIbyhWEc&t=165s) · [07:23](https://www.youtube.com/watch?v=6gQiIbyhWEc&t=443s) |
| [Power BI Update April 2026](https://www.youtube.com/watch?v=fbpu8zLG3cc) | 2026-04-01 | kernaussagen+zeitstempel | [01:55](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=115s) · [02:58](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=178s) |
| [Power BI Update April 2025](https://www.youtube.com/watch?v=lT-C7fPzxj4) | 2025-04-01 | nur-zeitstempel | [00:00](https://www.youtube.com/watch?v=lT-C7fPzxj4&t=0s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Context%20Transition) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Klassifizierungen%20ableiten) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=05%20%C2%B7%20DAX%20%2A%C2%B7%20Formelsprache%2A) |
| [Microsoft Power BI Einführung \| Florian Wiefel \| Hans-Ulrik Harnisch \| M365 Summit Mai 2022](https://www.youtube.com/watch?v=Z8vpSSOmG24) | 2022-06-01 | nur-zeitstempel | [18:05](https://www.youtube.com/watch?v=Z8vpSSOmG24&t=1085s) · [21:06](https://www.youtube.com/watch?v=Z8vpSSOmG24&t=1266s) · [24:07](https://www.youtube.com/watch?v=Z8vpSSOmG24&t=1447s) |
| [Visual Analytics with Power BI](https://www.youtube.com/watch?v=UxE0DPnLgIg) | 2021-09-01 | nur-zeitstempel | [09:44](https://www.youtube.com/watch?v=UxE0DPnLgIg&t=584s) · [21:54](https://www.youtube.com/watch?v=UxE0DPnLgIg&t=1314s) · [34:02](https://www.youtube.com/watch?v=UxE0DPnLgIg&t=2042s) |
| [ChartKitchen byDatenWG — Quick Start](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html#:~:text=For%20AI%20agents%3A%20the%20Agent%20Guide) |
| [ChartKitchen byDatenWG — Schnellstart](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html#:~:text=F%C3%BCr%20KI-Agenten%3A%20der%20Agent-Guide) |
| [Power BI Update Juni 2025](https://www.youtube.com/watch?v=LnNoXBIG7Lc) | 2025-06-01 | nur-zeitstempel | [02:30](https://www.youtube.com/watch?v=LnNoXBIG7Lc&t=150s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [19:17](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1157s) · [39:38](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2378s) · [41:40](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2500s) |
| [Power BI Update März 2026](https://www.youtube.com/watch?v=ASwcPvbMRZc) | 2026-03-01 | kernaussagen+zeitstempel | [05:57](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=357s) · [06:21](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=381s) |
| [Data Binning and Lorenz Curve in DAX \| Alberto Ferrari & Michael Tenner, Berlin Power BI User Group](https://www.youtube.com/watch?v=183uLZ3GYDo) | 2023-01-01 | nur-zeitstempel | [11:33](https://www.youtube.com/watch?v=183uLZ3GYDo&t=693s) · [13:05](https://www.youtube.com/watch?v=183uLZ3GYDo&t=785s) · [1:11:45](https://www.youtube.com/watch?v=183uLZ3GYDo&t=4305s) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [18:22](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=1102s) · [56:52](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3412s) · [1:05:00](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3900s) |
| [Realtalk zu Self Service mit Power BI](https://www.youtube.com/watch?v=27rC2zefFOU) | 2024-02-01 | nur-zeitstempel | [20:05](https://www.youtube.com/watch?v=27rC2zefFOU&t=1205s) · [29:05](https://www.youtube.com/watch?v=27rC2zefFOU&t=1745s) |
| [Unboxing MCP Server for Power BI Modelling](https://www.youtube.com/watch?v=iinfiHxznOU) | 2025-12-01 | nur-zeitstempel | [04:39](https://www.youtube.com/watch?v=iinfiHxznOU&t=279s) · [44:39](https://www.youtube.com/watch?v=iinfiHxznOU&t=2679s) · [57:52](https://www.youtube.com/watch?v=iinfiHxznOU&t=3472s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [33:31](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2011s) · [38:13](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2293s) · [51:06](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=3066s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | nur-zeitstempel | [39:22](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2362s) · [43:00](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2580s) · [46:12](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2772s) |
| [BI Thinkers Talk - Data Modelling - Fabric Data Days Edition](https://www.youtube.com/watch?v=mUALlPmGcEk) | 2025-11-01 | kernaussagen+zeitstempel | [00:00](https://www.youtube.com/watch?v=mUALlPmGcEk&t=0s) · [27:28](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1648s) · [1:17:07](https://www.youtube.com/watch?v=mUALlPmGcEk&t=4627s) |
| [Power BI Update Juli 2025](https://www.youtube.com/watch?v=TkxwcAyBGUM) | 2025-07-01 | nur-zeitstempel | [03:39](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=219s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [20:00](https://www.youtube.com/watch?v=r416vanitYw&t=1200s) · [38:05](https://www.youtube.com/watch?v=r416vanitYw&t=2285s) · [44:27](https://www.youtube.com/watch?v=r416vanitYw&t=2667s) |
| [BI Thinkers Talk - Data Modeling - Fabric Data Days Edition [EN]](https://www.youtube.com/watch?v=uxYFqwe_Wiw) | 2025-12-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) · [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) · [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) |
| [Power BI Update Juni 2026](https://www.youtube.com/watch?v=5xB_oKdvAwQ) | 2026-06-01 | nur-zeitstempel | [04:28](https://www.youtube.com/watch?v=5xB_oKdvAwQ&t=268s) |
| [Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“](https://www.youtube.com/watch?v=v8dvnqqa7f8) | 2026-02-01 | kernaussagen+zeitstempel | [01:11](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=71s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [06:09](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=369s) · [08:05](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=485s) · [09:46](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=586s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [30:19](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1819s) · [32:00](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1920s) · [33:36](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=2016s) |
| [Die Schweiz faehrt Europa davon — Bahnnutzung 2024](https://datenwgknowledgekitchen.com/zugfahrten-infografik.html) | 2026-06-05 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/zugfahrten-infografik.html#:~:text=Br%C3%BCcke%20zu%20Power%20BI%3A%20%2Aals%20DAX-HTML-Visual%2A) |
| [BI Thinkers Talk nr.76](https://www.youtube.com/watch?v=mlkP-6i5Kq8) | 2026-05-01 | kernaussagen+zeitstempel | [01:34](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=94s) · [25:29](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=1529s) · [45:45](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=2745s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [04:30](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=270s) · [06:04](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=364s) · [07:40](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=460s) |
| [BI Thinkers Talk nr.63](https://www.youtube.com/watch?v=9VX4-lLa0EI) | 2025-06-01 | nur-zeitstempel | [08:31](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=511s) · [13:33](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=813s) · [38:54](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=2334s) |
| [Daten-WG Special: Power BI vs. Qlik -part3](https://www.youtube.com/watch?v=iTK3xUd8V5I) | 2025-11-01 | nur-zeitstempel | [16:22](https://www.youtube.com/watch?v=iTK3xUd8V5I&t=982s) · [19:25](https://www.youtube.com/watch?v=iTK3xUd8V5I&t=1165s) · [30:40](https://www.youtube.com/watch?v=iTK3xUd8V5I&t=1840s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [15:33](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=933s) · [18:55](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1135s) |
| [BI Thinkers Talk nr.75](https://www.youtube.com/watch?v=BQdSo6ZnmKY) | 2026-04-01 | kernaussagen+zeitstempel | [07:51](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=471s) · [09:22](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=562s) · [25:18](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1518s) |
| [Wie war die Daten-WG? · Im Gespräch mit Artur König](https://www.youtube.com/watch?v=z4ZeHPzIeeU) | 2025-03-01 | nur-zeitstempel | [25:27](https://www.youtube.com/watch?v=z4ZeHPzIeeU&t=1527s) |
| [Metadaten als Superkraft](https://www.youtube.com/watch?v=UUlPoJOhco8) | — | kernaussagen+zeitstempel | [11:57](https://www.youtube.com/watch?v=UUlPoJOhco8&t=717s) |
| [Was ist Self-Service und warum ist das so schwer?](https://www.youtube.com/watch?v=EVsJ6zyGUWc) | — | kernaussagen+zeitstempel | [05:13](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=313s) · [17:22](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1042s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [36:36](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=2196s) · [55:29](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=3329s) |
| [Fabric Workload Demo mit Alexander Korn und Lukasz Obst](https://www.youtube.com/watch?v=e50qKdVn-24) | 2026-08-01 | nur-zeitstempel | [07:02](https://www.youtube.com/watch?v=e50qKdVn-24&t=422s) |
| [Power BI vs. Qlik](https://www.youtube.com/watch?v=vd1r02bj9Qk) | 2026-01-01 | kernaussagen+zeitstempel | [30:45](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=1845s) |

40 von 57 angezeigt, vollständige Liste in der JSON-Datei (https://datenwgknowledgekitchen.com/wissensgraph/library/dax.json).

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Adax
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Adax&f=tool%3Adax
