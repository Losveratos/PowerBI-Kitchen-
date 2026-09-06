---
id: "topic:visualisierung"
name: "Visualisierung"
typ: thema
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 83
kernaussagen: 30
mit_kernaussagen: 11
aliase:
  - "Visuals"
  - "Charts"
  - "Diagramme"
  - "Diagramm"
  - "Visualisierungen"
  - "Visual"
---

# Visualisierung

Zieht man zusätzliche Measures in das Tooltip-Feld eines Visuals, werden weitere Werte im Tooltip angezeigt, das ursprünglich gebundene Measure lässt sich dabei aber nicht aus dem Tooltip entfernen. Für die gewünschte Wasserfall-Darstellung wurden zwei Eigenbau-Varianten entwickelt: eine Kombination aus gestapeltem Balkendiagramm und Liniendiagramm sowie eine Lösung mit Deneb. Bei der Balkendiagramm-Variante wird ein unsichtbarer, weiß eingefärbter Spacer-Bereich verwendet, um die Balken an der richtigen Position im Diagramm schweben zu lassen.

## Aliase

Visuals, Charts, Diagramme, Diagramm, Visualisierungen, Visual

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 185 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 92 |
| [Custom Visuals](custom-visuals.md) | ko-vorkommen | heuristik | 63 |
| [KI](ki.md) | ko-vorkommen | heuristik | 59 |
| [IBCS](ibcs.md) | ko-vorkommen | heuristik | 56 |
| [DAX](dax.md) | ko-vorkommen | heuristik | 50 |
| [Power BI Desktop](power-bi-desktop.md) | ko-vorkommen | heuristik | 47 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 37 |
| [Datenmodellierung](datenmodellierung.md) | ko-vorkommen | heuristik | 35 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 33 |
| [Excel](excel.md) | ko-vorkommen | heuristik | 32 |
| [Visual Calculations](visual-calculations.md) | ko-vorkommen | heuristik | 27 |
| [Planung](planung.md) | ko-vorkommen | heuristik | 25 |
| [Daten-WG](daten-wg.md) | ko-vorkommen | heuristik | 22 |
| [Copilot](copilot.md) | ko-vorkommen | heuristik | 20 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Meinung | BI Thinkers Talk nr.76 | 03:09 | Nach Einschätzung des Gasts decken die Standard-Visuals in Power BI etwa 99 Prozent der Anwendungsfälle ab. | [▶](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=189s) |
| Fakt | Power BI Update April 2026 | 00:49 | Bei Kacheln mit mehreren Karten kann jetzt eine feste Breite in Pixel eingestellt werden, was den Bau von Kachelwänden erleichtert. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=49s) |
| Fakt | Power BI Update April 2026 | 01:15 | Der Kreuzfilter bei Kacheln funktioniert jetzt auch, wenn die Kategorie als Kopfzeile nach oben angeordnet ist, nicht nur seitlich. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=75s) |
| Fakt | BI Thinkers Talk nr.75 | 20:30 | Das automatisiert erzeugte Balkendiagramm kam IBCS bereits nahe, weil es eine sortierte Y-Achse statt einer Kategorien-X-Achse nutzte, Gridlines entfernte und Data Labels beibehielt. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1230s) |
| Fakt | BI Thinkers Talk nr.75 | 22:02 | Für IBCS-konforme Inline-Variance-Charts verwendet der Fixer keine Custom Visuals, sondern die Error Bars der Power-BI-Core-Visuals. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1322s) |
| Fakt | BI Thinkers Talk nr.75 | 44:31 | Der im Fixer enthaltene Prototyper kann Berichtsseiten als Screenshot, Excalidraw-Datei oder SVG exportieren. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2671s) |
| Fakt | Power BI Update März 2026 | 00:42 | Die visuelle Oberfläche von Power BI Desktop wurde mit neuen Standardeinstellungen modernisiert. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=42s) |
| Meinung | Power BI Update März 2026 | 00:42 | Der neue graue Standardhintergrund der visuellen Oberfläche gefällt dem Sprecher nicht. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=42s) |
| Fakt | Power BI Update März 2026 | 05:37 | Für Zeilenbeschriftungen lassen sich jetzt Führungslinien aktivieren, die bei engem Platz die Zuordnung zu den Werten erleichtern. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=337s) |
| Warnung | BI Thinkers Talk n.74 | 32:23 | Bei Week-to-Date-Kennzahlen kann eine noch nicht abgeschlossene aktuelle Woche fälschlich wie ein plötzlicher Einbruch der Werte wirken, wenn dies in der Darstellung nicht berücksichtigt wird. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1943s) |
| Warnung | BI Thinkers Talk n.73 | 11:29 | Bei einem reinen Flächendiagramm zeigt Power BI im Tooltip vor jedem Feld korrekt einen farbigen Punkt an, während dieselbe Darstellung bei einem kombinierten Line-and-Column-Chart mit zwei Achsen fehlerhaft wird. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=689s) |
| Meinung | BI Thinkers Talk n.73 | 13:09 | Nach Einschätzung des Sprechers besteht der Tooltip-Fehler bei kombinierten Line-and-Column-Charts mit zwei Achsen bereits seit 2023. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=789s) |
| Fakt | BI Thinkers Talk n.73 | 16:14 | Zieht man zusätzliche Measures in das Tooltip-Feld eines Visuals, werden weitere Werte im Tooltip angezeigt, das ursprünglich gebundene Measure lässt sich dabei aber nicht aus dem Tooltip entfernen. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=974s) |
| Empfehlung | BI Thinkers Talk n.73 | 16:14 | Bei komplexen Diagrammen mit unzuverlässigen Standard-Tooltips empfiehlt der Sprecher eine dedizierte Tooltip-Seite, weil generische Lösungen wegen der visual-spezifischen Filterauswahl nicht funktionieren. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=974s) |
| Warnung | BI Thinkers Talk n.73 | 21:09 | Bei zwei übereinandergelegten Visuals mit unterschiedlichen Zeiträumen muss beachtet werden, dass ein Measure für bestimmte Zeitpunkte einen Blankwert liefern kann, wodurch die Achsendarstellung zwischen den Visuals inkonsistent wird. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=1269s) |
| Warnung | BI Thinkers Talk n.73 | 30:47 | Bei zwei redundanten Balken- und Liniendiagrammen mit demselben zugrunde liegenden Feld zeigt Power BI die X-Achsenbeschriftung je nach Diagrammtyp unterschiedlich fett formatiert an, ohne dass dafür ein nachvollziehbarer Grund erkennbar ist. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=1847s) |
| Fakt | Power BI vs. Qlik | 01:38 | Arthur und Oliver haben eine dreiteilige Challenge mit identischen Aufgaben in Qlik und Power BI durchgeführt: Basics, Modellierung und Visualisierung. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=98s) |
| Fakt | Power BI vs. Qlik | 03:37 | In Qlik ist ein Streudiagramm bei großen, komplexen Datenmengen schwer zu konfigurieren. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=217s) |
| Meinung | Power BI vs. Qlik | 03:37 | Oliver hält es für schlechtes Design, riesige Datenmengen komplett auf einmal visualisieren zu wollen, unabhängig vom verwendeten Tool. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=217s) |
| Fakt | Power BI vs. Qlik | 03:37 | In Power BI ist das gezielte farbliche Hervorheben einer einzelnen Linie in einem Liniendiagramm aufwendiger als in Excel. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=217s) |
| Meinung | BI Thinkers Talk n.72 | 09:15 | Das Standard-Wasserfall-Visual in Power BI lässt sich bei komplexeren Anforderungen wie mehrfachen Zwischensummen und Aufbrüchen nur sehr schwer steuern. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=555s) |
| Fakt | BI Thinkers Talk n.72 | 10:52 | Für die gewünschte Wasserfall-Darstellung wurden zwei Eigenbau-Varianten entwickelt: eine Kombination aus gestapeltem Balkendiagramm und Liniendiagramm sowie eine Lösung mit Deneb. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=652s) |
| Fakt | BI Thinkers Talk n.72 | 12:30 | Bei der Balkendiagramm-Variante wird ein unsichtbarer, weiß eingefärbter Spacer-Bereich verwendet, um die Balken an der richtigen Position im Diagramm schweben zu lassen. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=750s) |
| Empfehlung | Power BI: (Vertriebs-) Regionen in Azure Maps | 21:55 | Über die bedingte Formatierung der Polygone lässt sich die Referenzebene als Farbverlauf (Heatmap) nach einer Kennzahl wie dem Umsatz einfärben. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=1315s) |
| Fakt | BI Thinkers Talk n.72 | 27:19 | Fachlich wird zwischen Wasserfall als Darstellung einer Zusammensetzung und Brücke als Darstellung einer Veränderung unterschieden, auch wenn zum Beispiel Wikipedia beide Begriffe synonym verwendet. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1639s) |
| Meinung | Power BI: (Vertriebs-) Regionen in Azure Maps | 28:08 | Gegenüber dem Flächenkartogramm bietet Azure Maps den Vorteil einer echten Kartenbasis mit Straßen, Flüssen und Städten, die zusätzlichen räumlichen Kontext liefert. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=1688s) |
| Meinung | BI Thinkers Talk n.72 | 29:12 | Das Standard-Wasserfall-Visual in Power BI gilt als funktional limitiert, unter anderem weil sich damit keine matrixbasierte Darstellung umsetzen lässt. | [▶](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1752s) |
| Fakt | BI Thinkers Talk nr.71 | 46:28 | Der maximale Wert für die Breite eines visuellen Rahmens um ein Visual in Power BI beträgt 99. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2788s) |
| Fakt | BI Thinkers Talk nr.71 | 1:04:13 | In Power BI gibt es vier Standardvisualisierungen mit horizontalen Balken: gestapelte, gruppierte und 100%-gestapelte Balkendiagramme sowie das Trichterdiagramm. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=3853s) |
| Warnung | 10 Jahre Power BI | 52:08 | Ein Sprecher kritisiert, dass Power BI bis heute keinen nativen Boxplot als Standardvisual anbietet, obwohl es sich um einen gängigen Diagrammtyp handelt. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3128s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [175 Jahre Klimageschichte zum Anfassen — Waermestreifen 3D](https://datenwgknowledgekitchen.com/waermestreifen-3d.html) | 2026-08-04 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/waermestreifen-3d.html) · [Abschnitt](https://datenwgknowledgekitchen.com/waermestreifen-3d.html) · [Abschnitt](https://datenwgknowledgekitchen.com/waermestreifen-3d.html#:~:text=Interaktion%3A%20ein%20Visual%2C%20kein%20Film) |
| [ChartKitchen byDatenWG — Schnellstart](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html#:~:text=F%C3%BCr%20KI-Agenten%3A%20der%20Agent-Guide) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html#:~:text=01%20%C2%B7%20In%20drei%20Schritten%20loslegen) |
| [ChartKitchen byDatenWG — Quick Start](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html#:~:text=For%20AI%20agents%3A%20the%20Agent%20Guide) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html#:~:text=01%20%C2%B7%20Get%20going%20in%20three%20steps) |
| [Power BI Update November 2025](https://www.youtube.com/watch?v=XJZxYNIeEVc) | 2025-11-01 | nur-zeitstempel | [00:16](https://www.youtube.com/watch?v=XJZxYNIeEVc&t=16s) · [01:17](https://www.youtube.com/watch?v=XJZxYNIeEVc&t=77s) · [03:31](https://www.youtube.com/watch?v=XJZxYNIeEVc&t=211s) |
| [Visual Calculations erklärt – Prozent vom übergeordneten Wert einfach berechnen! \| Power BI Tutorial](https://www.youtube.com/watch?v=GsLfiuPlsQE) | 2025-10-01 | nur-zeitstempel | [00:41](https://www.youtube.com/watch?v=GsLfiuPlsQE&t=41s) · [03:00](https://www.youtube.com/watch?v=GsLfiuPlsQE&t=180s) · [04:30](https://www.youtube.com/watch?v=GsLfiuPlsQE&t=270s) |
| [Power BI Update Oktober 2025](https://www.youtube.com/watch?v=LVSttJlhrqM) | 2025-10-01 | nur-zeitstempel | [00:00](https://www.youtube.com/watch?v=LVSttJlhrqM&t=0s) · [01:01](https://www.youtube.com/watch?v=LVSttJlhrqM&t=61s) · [02:52](https://www.youtube.com/watch?v=LVSttJlhrqM&t=172s) |
| [Power BI Update Juli 2025](https://www.youtube.com/watch?v=TkxwcAyBGUM) | 2025-07-01 | nur-zeitstempel | [00:32](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=32s) · [02:07](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=127s) · [04:27](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=267s) |
| [The Power of User Groups](https://www.youtube.com/watch?v=SSUpe1JON9Y) | 2025-10-01 | nur-zeitstempel | [10:04](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=604s) · [15:02](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=902s) · [23:32](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=1412s) |
| [BI Thinkers Talk nr.76](https://www.youtube.com/watch?v=mlkP-6i5Kq8) | 2026-05-01 | kernaussagen+zeitstempel | [03:09](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=189s) · [08:04](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=484s) · [30:01](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=1801s) |
| [Business Chart Builder — Anleitung](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html) · [Abschnitt](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html#:~:text=Abweichungen%20%26%20Szenarien%20%E2%80%94%20das%20Herzst%C3%BCck) · [Abschnitt](https://datenwgknowledgekitchen.com/business-chart-builder-anleitung.html#:~:text=Export%20%E2%80%94%20der%20eigentliche%20Trick) |
| [Objektive Daten gibt es nicht](https://www.youtube.com/watch?v=-_4bfrjRCVo) | 2026-06-01 | nur-zeitstempel | [09:08](https://www.youtube.com/watch?v=-_4bfrjRCVo&t=548s) · [11:39](https://www.youtube.com/watch?v=-_4bfrjRCVo&t=699s) · [20:01](https://www.youtube.com/watch?v=-_4bfrjRCVo&t=1201s) |
| [Power BI Update August 2026](https://www.youtube.com/watch?v=GWCHNmLs72M) | 2026-08-01 | nur-zeitstempel | [00:19](https://www.youtube.com/watch?v=GWCHNmLs72M&t=19s) · [00:49](https://www.youtube.com/watch?v=GWCHNmLs72M&t=49s) · [04:23](https://www.youtube.com/watch?v=GWCHNmLs72M&t=263s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | nur-zeitstempel | [08:07](https://www.youtube.com/watch?v=DQENmzAkNqw&t=487s) · [29:07](https://www.youtube.com/watch?v=DQENmzAkNqw&t=1747s) · [35:42](https://www.youtube.com/watch?v=DQENmzAkNqw&t=2142s) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [32:48](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=1968s) · [52:08](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3128s) · [1:01:40](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3700s) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [19:33](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=1173s) · [21:09](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=1269s) · [26:06](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=1566s) |
| [TMDL Magie: Multi Parameter Tabelle - Feldparameter Next Level! \| Power BI Tutorial](https://www.youtube.com/watch?v=sShNdgnHjr4) | 2025-10-01 | nur-zeitstempel | [02:06](https://www.youtube.com/watch?v=sShNdgnHjr4&t=126s) · [03:11](https://www.youtube.com/watch?v=sShNdgnHjr4&t=191s) · [03:36](https://www.youtube.com/watch?v=sShNdgnHjr4&t=216s) |
| [Boring Charts, Better Insights](https://www.youtube.com/watch?v=inko8wG9jlY) | 2025-10-01 | nur-zeitstempel | [05:44](https://www.youtube.com/watch?v=inko8wG9jlY&t=344s) · [17:36](https://www.youtube.com/watch?v=inko8wG9jlY&t=1056s) · [23:28](https://www.youtube.com/watch?v=inko8wG9jlY&t=1408s) |
| [Zehn Tage bis zum marktfähigen Stand](https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage.html) · [Abschnitt](https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage.html#:~:text=Die%20eigentliche%20Erkenntnis%3A%20%2Anicht%20die%20KI%2A) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [09:44](https://www.youtube.com/watch?v=VD1N68Fhoco&t=584s) · [14:28](https://www.youtube.com/watch?v=VD1N68Fhoco&t=868s) · [27:20](https://www.youtube.com/watch?v=VD1N68Fhoco&t=1640s) |
| [Dein erstes Dashboard — Power-BI-Praxis-Pfad](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html#:~:text=Bild%202%20%E2%80%94%20die%20Balken%3A%20Wer%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html#:~:text=So%20geht%27s) · [Abschnitt](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html#:~:text=Dein%20Glossar) |
| [BI Thinkers Talk n.72](https://www.youtube.com/watch?v=luk4S4ukKmg) | 2026-01-01 | kernaussagen+zeitstempel | [15:46](https://www.youtube.com/watch?v=luk4S4ukKmg&t=946s) · [19:12](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1152s) · [24:02](https://www.youtube.com/watch?v=luk4S4ukKmg&t=1442s) |
| [Power BI Update Juni 2026](https://www.youtube.com/watch?v=5xB_oKdvAwQ) | 2026-06-01 | nur-zeitstempel | [00:20](https://www.youtube.com/watch?v=5xB_oKdvAwQ&t=20s) · [01:44](https://www.youtube.com/watch?v=5xB_oKdvAwQ&t=104s) · [04:28](https://www.youtube.com/watch?v=5xB_oKdvAwQ&t=268s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [00:23](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=23s) · [05:56](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=356s) · [13:04](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=784s) |
| [Ten Days to a Market-Ready State](https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage_en.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage_en.html) · [Abschnitt](https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage_en.html#:~:text=The%20actual%20insight%3A%20%2Anot%20the%20AI%2A) |
| [Die Schweiz faehrt Europa davon — Bahnnutzung 2024](https://datenwgknowledgekitchen.com/zugfahrten-infografik.html) | 2026-06-05 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/zugfahrten-infografik.html) · [Abschnitt](https://datenwgknowledgekitchen.com/zugfahrten-infografik.html) · [Abschnitt](https://datenwgknowledgekitchen.com/zugfahrten-infografik.html#:~:text=Br%C3%BCcke%20zu%20Power%20BI%3A%20%2Aals%20DAX-HTML-Visual%2A) |
| [ChartKitchen byDatenWG — Dokumentation](https://datenwgknowledgekitchen.com/chartkitchen-doku.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku.html) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku.html#:~:text=01%20%C2%B7%20Was%20ist%20ChartKitchen%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku.html#:~:text=IBCS-Titel) |
| [ChartKitchen byDatenWG — Documentation](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html#:~:text=IBCS%20Title) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html#:~:text=Numbers%20appear%20in%20k%E2%82%AC%20instead%20of%20thousands%20as%20expected.) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [01:35](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=95s) · [08:16](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=496s) · [09:50](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=590s) |
| [Daten-WG Special: Power BI vs. Qlik -part3](https://www.youtube.com/watch?v=iTK3xUd8V5I) | 2025-11-01 | nur-zeitstempel | [19:25](https://www.youtube.com/watch?v=iTK3xUd8V5I&t=1165s) · [55:46](https://www.youtube.com/watch?v=iTK3xUd8V5I&t=3346s) · [57:21](https://www.youtube.com/watch?v=iTK3xUd8V5I&t=3441s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=SAY%20%E2%80%94%20Convey%20a%20message) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Outlined%20%C2%B7%20Plan%20%2F%20Budget%20%28PL%2C%20BU%29) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Noise%20eliminieren) |
| [BI Thinkers Talk nr.75](https://www.youtube.com/watch?v=BQdSo6ZnmKY) | 2026-04-01 | kernaussagen+zeitstempel | [22:02](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1322s) · [33:08](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=1988s) · [38:02](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2282s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [00:37](https://www.youtube.com/watch?v=lZvpCBMKASM&t=37s) · [47:01](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2821s) · [50:35](https://www.youtube.com/watch?v=lZvpCBMKASM&t=3035s) |
| [Country Indicator Explorer — Lebenszufriedenheit und ihre Korrelate](https://datenwgknowledgekitchen.com/laender-indikatoren-explorer.html) | 2026-08-14 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/laender-indikatoren-explorer.html) |
| [Power BI Update April 2025](https://www.youtube.com/watch?v=lT-C7fPzxj4) | 2025-04-01 | nur-zeitstempel | [01:36](https://www.youtube.com/watch?v=lT-C7fPzxj4&t=96s) |
| [Realtalk zu Self Service mit Power BI](https://www.youtube.com/watch?v=27rC2zefFOU) | 2024-02-01 | nur-zeitstempel | [08:02](https://www.youtube.com/watch?v=27rC2zefFOU&t=482s) · [14:04](https://www.youtube.com/watch?v=27rC2zefFOU&t=844s) · [32:05](https://www.youtube.com/watch?v=27rC2zefFOU&t=1925s) |
| [Was ist Self-Service und warum ist das so schwer?](https://www.youtube.com/watch?v=EVsJ6zyGUWc) | — | kernaussagen+zeitstempel | [07:02](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=422s) · [10:23](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=623s) · [11:16](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=676s) |
| [Fabric Workload Demo mit Alexander Korn und Lukasz Obst](https://www.youtube.com/watch?v=e50qKdVn-24) | 2026-08-01 | nur-zeitstempel | [02:15](https://www.youtube.com/watch?v=e50qKdVn-24&t=135s) · [07:42](https://www.youtube.com/watch?v=e50qKdVn-24&t=462s) · [10:50](https://www.youtube.com/watch?v=e50qKdVn-24&t=650s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [24:40](https://www.youtube.com/watch?v=r416vanitYw&t=1480s) · [28:05](https://www.youtube.com/watch?v=r416vanitYw&t=1685s) · [41:10](https://www.youtube.com/watch?v=r416vanitYw&t=2470s) |
| [KI hat mich abgelöst \| Daten-WG Podcast mit Burkhardt Gasber](https://www.youtube.com/watch?v=oh-3_65IQ2Q) | 2026-08-01 | nur-zeitstempel | [01:36](https://www.youtube.com/watch?v=oh-3_65IQ2Q&t=96s) · [03:12](https://www.youtube.com/watch?v=oh-3_65IQ2Q&t=192s) · [10:39](https://www.youtube.com/watch?v=oh-3_65IQ2Q&t=639s) |
| [The Day After Tomorrow – Nach der Einführung geht es erst richtig los \| Power BI Summit 2023](https://www.youtube.com/watch?v=KwySyTxW_EI) | 2023-03-01 | nur-zeitstempel | [09:02](https://www.youtube.com/watch?v=KwySyTxW_EI&t=542s) · [30:07](https://www.youtube.com/watch?v=KwySyTxW_EI&t=1807s) · [48:10](https://www.youtube.com/watch?v=KwySyTxW_EI&t=2890s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Avisualisierung
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Avisualisierung&f=topic%3Avisualisierung
