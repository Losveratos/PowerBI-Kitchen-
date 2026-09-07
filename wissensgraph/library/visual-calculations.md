---
id: "tool:visual-calculations"
name: "Visual Calculations"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 16
kernaussagen: 13
mit_kernaussagen: 5
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/visual-calculations.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/visual-calculations.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/visual-calculations.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/visual-calculations.json"
aliase:
  - "visuelle Berechnungen"
  - "Visual Calculation"
---

# Visual Calculations

Mit Visual Calculations lässt sich Farblogik direkt im Visual als Berechnung einbauen, statt sie im Datenmodell zu pflegen. (Stand 2025-08) Bedingte Formatierung mit einem Feldwert funktioniert nur, wenn zuvor die konkrete Datenreihe statt der Option "alle Datenreihen" ausgewählt wird. (Stand 2025-08) Zebra BI erzeugt bei einer Abweichungsberechnung standardmäßig ebenfalls einen automatisch generierten Spaltennamen wie "Vorjahr", den man teilweise anpassen muss. (Stand 2025-08)

## Aliase

visuelle Berechnungen, Visual Calculation

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [DAX](dax.md) | DAX gegensatz Visual Calculations | automatisch extrahiert, Quellenstelle vorhanden | „Measure sind eigentlich ja besser zu kontrollieren als jetzt diese Visual Calculations“ (Daten-WG BI Thinkers Talk nr.66, 2025-08) | 8 |
| [Visualisierung](visualisierung.md) | Visual Calculations und Visualisierung im selben Segment | Heuristik, gezählt |  | 27 |
| [Power BI](power-bi.md) | Visual Calculations und Power BI im selben Segment | Heuristik, gezählt |  | 10 |
| [Excel](excel.md) | Visual Calculations und Excel im selben Segment | Heuristik, gezählt |  | 5 |
| [Schulung](schulung.md) | Visual Calculations und Schulung im selben Segment | Heuristik, gezählt |  | 3 |
| [Datenmodellierung](datenmodellierung.md) | Visual Calculations und Datenmodellierung im selben Segment | Heuristik, gezählt |  | 3 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Power BI Update März 2026 | 2026-03 | 02:33 | auf die Sekunde | Mit den Custom Totals lässt sich die Gesamtsumme einer Kennzahl (Measure Totals) individuell anders berechnen als die Summe der Einzelzeilen. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=153s) |
| Warnung | Power BI Update März 2026 | 2026-03 | 03:27 | auf die Sekunde | Custom Totals sollten bei nicht-additiven Werten wie Prozenten oder Verhältnissen vorsichtig verwendet werden, weil eine einfache Summe hier oft nicht sinnvoll ist. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=207s) |
| Fakt | Power BI Update März 2026 | 2026-03 | 05:10 | auf die Sekunde | Hinter einem Custom Total steckt technisch eine visuelle Berechnung mit einem EXPAND ALL und einer Summe über die Zeilen, die sich öffnen und bearbeiten lässt. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=310s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 25:16 | auf die Sekunde | In Power BI Desktop lassen sich Berechnungen als berechnete Spalten, als Measures oder als Visual Calculations erstellen. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1516s) |
| Warnung | Daten-WG BI Thinkers Talk nr.66 | 2025-08 | 07:18 | auf die Sekunde | Reference Labels sind in der neuen KPI-Karte fragil, weil sie beim Entfernen der zugrunde liegenden Measure verschwinden und danach neu gesetzt werden müssen. | [▶](https://www.youtube.com/watch?v=DQENmzAkNqw&t=438s) |
| Fakt | Daten-WG BI Thinkers Talk nr.66 | 2025-08 | 08:37 | auf die Sekunde | Mit Visual Calculations lässt sich Farblogik direkt im Visual als Berechnung einbauen, statt sie im Datenmodell zu pflegen. | [▶](https://www.youtube.com/watch?v=DQENmzAkNqw&t=517s) |
| Fakt | Daten-WG BI Thinkers Talk nr.66 | 2025-08 | 28:02 | auf die Sekunde | Bedingte Formatierung mit einem Feldwert funktioniert nur, wenn zuvor die konkrete Datenreihe statt der Option "alle Datenreihen" ausgewählt wird. | [▶](https://www.youtube.com/watch?v=DQENmzAkNqw&t=1682s) |
| Warnung | Daten-WG BI Thinkers Talk nr.66 | 2025-08 | 29:00 | auf die Sekunde | Ein als Feldwert genutzter berechneter Wert lässt sich in der bedingten Formatierung erst auswählen, wenn das Datenformat auf Text statt Integer umgestellt wurde. | [▶](https://www.youtube.com/watch?v=DQENmzAkNqw&t=1740s) |
| Meinung | Daten-WG BI Thinkers Talk nr.66 | 2025-08 | 36:28 | auf die Sekunde | Werden dekorative Visual Calculations wie dynamische Titel im Visual selbst gepflegt, wandert beim Kopieren des Visuals die zugehörige Logik automatisch mit, ohne dass Measures im Zielmodell gesucht werden müssen. | [▶](https://www.youtube.com/watch?v=DQENmzAkNqw&t=2188s) |
| Fakt | Daten-WG BI Thinkers Talk nr.66 | 2025-08 | 37:25 | auf die Sekunde | Zebra BI erzeugt bei einer Abweichungsberechnung standardmäßig ebenfalls einen automatisch generierten Spaltennamen wie "Vorjahr", den man teilweise anpassen muss. | [▶](https://www.youtube.com/watch?v=DQENmzAkNqw&t=2245s) |
| Meinung | Daten-WG BI Thinkers Talk nr.66 | 2025-08 | 42:15 | auf die Sekunde | Zebra BI bietet mit Verweisbezeichnungen nach Position bereits eine ähnliche Funktion wie die neue Visual-Calculations-Option, allerdings in einem Untermenü verschachtelt. | [▶](https://www.youtube.com/watch?v=DQENmzAkNqw&t=2535s) |
| Meinung | Fabric & Power BI Quarterly \| 2025 Q2 | 2025-04 | 05:39 | auf die Sekunde | Visual Calculations werden bisher vor allem von wenigen LinkedIn-Influencern intensiv genutzt und wirken auf DAX-versierte wie auf DAX-fremde Business User eher unüblich. | [▶](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=339s) |
| Empfehlung | Fabric & Power BI Quarterly · 2026-2 |  | 02:46 | auf die Sekunde | Wiederverwertbare Berechnungslogik sollte dauerhaft ins Semantic Model statt in Visual Calculations gepackt werden, da Visual Calculations eher ein Shortcut sind. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=166s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Power BI Update Juni 2025](https://www.youtube.com/watch?v=LnNoXBIG7Lc) | 2025-06-01 | nur-zeitstempel | [02:30](https://www.youtube.com/watch?v=LnNoXBIG7Lc&t=150s) · [04:12](https://www.youtube.com/watch?v=LnNoXBIG7Lc&t=252s) |
| [Power BI Update Juli 2025](https://www.youtube.com/watch?v=TkxwcAyBGUM) | 2025-07-01 | nur-zeitstempel | [02:07](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=127s) · [03:39](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=219s) · [04:27](https://www.youtube.com/watch?v=TkxwcAyBGUM&t=267s) |
| [Daten-WG Special: Power BI vs. Qlik -part3](https://www.youtube.com/watch?v=iTK3xUd8V5I) | 2025-11-01 | nur-zeitstempel | [19:25](https://www.youtube.com/watch?v=iTK3xUd8V5I&t=1165s) · [52:32](https://www.youtube.com/watch?v=iTK3xUd8V5I&t=3152s) · [55:46](https://www.youtube.com/watch?v=iTK3xUd8V5I&t=3346s) |
| [Daten-WG BI Thinkers Talk nr.66](https://www.youtube.com/watch?v=DQENmzAkNqw) | 2025-08-01 | kernaussagen+zeitstempel | [08:07](https://www.youtube.com/watch?v=DQENmzAkNqw&t=487s) · [25:49](https://www.youtube.com/watch?v=DQENmzAkNqw&t=1549s) · [35:42](https://www.youtube.com/watch?v=DQENmzAkNqw&t=2142s) |
| [Power BI Update Mai 2026](https://www.youtube.com/watch?v=psLPsI32sAs) | 2026-05-01 | nur-zeitstempel | [01:05](https://www.youtube.com/watch?v=psLPsI32sAs&t=65s) |
| [Power BI Update Mai 2025](https://www.youtube.com/watch?v=zkfdfc5fo-E) | 2025-05-01 | nur-zeitstempel | [00:23](https://www.youtube.com/watch?v=zkfdfc5fo-E&t=23s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [23:06](https://www.youtube.com/watch?v=r416vanitYw&t=1386s) · [38:05](https://www.youtube.com/watch?v=r416vanitYw&t=2285s) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [40:41](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=2441s) · [1:00:05](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3605s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [04:30](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=270s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | kernaussagen+zeitstempel | [47:01](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2821s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [02:15](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=135s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | kernaussagen+zeitstempel | [09:46](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=586s) |
| [Fabric Planning unboxing](https://www.youtube.com/watch?v=xCzKEIB4W5I) | 2026-03-01 | kernaussagen+zeitstempel | [47:00](https://www.youtube.com/watch?v=xCzKEIB4W5I&t=2820s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [24:01](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1441s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Gesch%C3%A4ftsjahr%20abweichend%20von%20Kalenderjahr) |
| [Visual Calculations erklärt – Prozent vom übergeordneten Wert einfach berechnen! \| Power BI Tutorial](https://www.youtube.com/watch?v=GsLfiuPlsQE) | 2025-10-01 | nur-zeitstempel | — |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Avisual-calculations
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Avisual-calculations&f=tool%3Avisual-calculations
