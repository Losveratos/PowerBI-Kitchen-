---
id: "tool:power-query"
name: "Power Query"
typ: tool
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 45
kernaussagen: 33
mit_kernaussagen: 15
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/power-query.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/power-query.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/power-query.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/power-query.json"
aliase:
  - "M-Code"
  - "Power Query M"
  - "Query Editor"
  - "Abfrage-Editor"
---

# Power Query

Qlik bietet eine eingebaute Funktion, um automatisch eine eindeutige laufende Nummer je unterschiedlicher Feldauspraegung zu erzeugen, ohne dafuer manuell eine separate Join-Tabelle aufbauen zu muessen. (Stand 2025-10) Über den XML-Endpoint lässt sich in TMDL kein Power Query laden, weshalb ein in Power Query gebauter Arbeitstage-Offset wie der von Lars Schreiber nicht einfach eins zu eins in TMDL nachgebaut werden kann. (Stand 2025-04) Viele Fachanwender kennen Power Query nicht und bleiben deshalb bei breiten Tabellen, obwohl Power Query die Ein-Millionen-Zeilen-Grenze von Power Pivot umgeht. (Stand 2026-01)

## Aliase

M-Code, Power Query M, Query Editor, Abfrage-Editor

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [TMDL](tmdl.md) | TMDL gegensatz Power Query | automatisch extrahiert, Quellenstelle vorhanden | „weil du ja in Tindel keine Power Query laden kannst“ (Daten-WG Thinkers Talk n61, 2025-04) | 3 |
| [DAX](dax.md) | Power Query gegensatz DAX | automatisch extrahiert, Quellenstelle vorhanden | „sagen hier zu viel DAX Magic vorne rum. Macht das dann nur intransparent“ (Daten-WG Thinkers Talk n61, 2025-04) | 22 |
| [Excel](excel.md) | Power Query teil-von Excel | automatisch extrahiert, Quellenstelle vorhanden | „dann unterstützt ja Excel mittlerweile Power Query“ (Denken in Tabellen, 2026-01) | 23 |
| [Power BI](power-bi.md) | Power Query teil-von Power BI | automatisch extrahiert, Quellenstelle vorhanden | „Bei Power BI ist das Power Query, was dann dabei ist und dann das Datenmodell.“ (Power BI vs. Qlik, 2026-01) | 53 |
| [TMDL](tmdl.md) | Power Query teil-von TMDL | automatisch extrahiert, Quellenstelle vorhanden | „alles im was Power Query, Datenmodell, Beziehung, DAX Measures, alles das, was darin embettet ist“ (Unboxing MCP Server for Power BI Modelling, 2025-12) | 3 |
| [Qlik](qlik.md) | Qlik gegensatz Power Query | automatisch extrahiert, Quellenstelle vorhanden | „Das fand ich tatsächlich cool, dass du so eine Art explorative Suche in Klick hast“ (Daten-WG Special: Power BI vs. Qlik, 2025-10) | 0 |
| [Performance](performance.md) | Power Query und Performance im selben Segment | Heuristik, gezählt |  | 36 |
| [Dataflow](dataflow.md) | Power Query und Dataflow im selben Segment | Heuristik, gezählt |  | 28 |
| [Sternschema](sternschema.md) | Power Query und Sternschema im selben Segment | Heuristik, gezählt |  | 26 |
| [Datenmodellierung](datenmodellierung.md) | Power Query und Datenmodellierung im selben Segment | Heuristik, gezählt |  | 22 |
| [Refresh](refresh.md) | Power Query und Refresh im selben Segment | Heuristik, gezählt |  | 21 |
| [Microsoft Fabric](microsoft-fabric.md) | Power Query und Microsoft Fabric im selben Segment | Heuristik, gezählt |  | 19 |
| [Power BI Desktop](power-bi-desktop.md) | Power Query und Power BI Desktop im selben Segment | Heuristik, gezählt |  | 19 |
| [Reporting](reporting.md) | Power Query und Reporting im selben Segment | Heuristik, gezählt |  | 18 |
| [SQL](sql.md) | Power Query und SQL im selben Segment | Heuristik, gezählt |  | 17 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk n.74 | 2026-03 | 39:26 | auf die Sekunde | Aus einem Fabric-Notebook lässt sich per API ein Dataflow ansteuern und darüber Power-Query-Code (M-Code) ausführen. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2366s) |
| Empfehlung | BI Thinkers Talk n.74 | 2026-03 | 41:51 | auf die Sekunde | Für kleinere Datenmengen und einfache Transformationen wie Entpivotieren eignet sich ein Dataflow, während stark verschachteltes JSON, etwa aus der Scanner API, eher in einem Notebook verarbeitet werden sollte. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2511s) |
| Fakt | BI Thinkers Talk n.74 | 2026-03 | 1:13:05 | Abschnittsanfang | Beim Versuch, verschachtelte Power-Query-Objekte wie Record oder List aus einem Notebook heraus in ein Lakehouse zu schreiben, werden diese aktuell nur als Text gespeichert statt strukturiert aufgelöst. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=4385s) |
| Fakt | Power BI vs. Qlik | 2026-01 | 05:33 | auf die Sekunde | Sowohl Qlik als auch Power BI lassen sich von der Quelle bis zum Modell als vollständige Datenplattform nutzen, Qlik über Skripte und Power BI über Power Query und das Datenmodell. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=333s) |
| Warnung | Denken in Tabellen | 2026-01 | 07:40 | auf die Sekunde | Breite, lange Tabellen sind in Power BI und Power Query aus Performance- und Speicherplatzgründen ungünstig. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=460s) |
| Fakt | Denken in Tabellen | 2026-01 | 10:36 | auf die Sekunde | Viele Fachanwender kennen Power Query nicht und bleiben deshalb bei breiten Tabellen, obwohl Power Query die Ein-Millionen-Zeilen-Grenze von Power Pivot umgeht. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=636s) |
| Fakt | Unboxing MCP Server for Power BI Modelling | 2025-12 | 04:45 | auf die Sekunde | Der MCP Modeling Server für Power BI kann momentan alles bearbeiten, was über TMDL abgebildet ist, also Power Query, Datenmodell, Beziehungen und DAX-Measures. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=285s) |
| Warnung | Unboxing MCP Server for Power BI Modelling | 2025-12 | 15:31 | auf die Sekunde | Der MCP Modeling Server kann Daten momentan nicht automatisch aus einem CSV-Repository per Link anbinden, das Laden muss manuell über den Power-Query-Webconnector erfolgen. | [▶](https://www.youtube.com/watch?v=iinfiHxznOU&t=931s) |
| Fakt | BI Thinkers Talk nr.71 | 2025-12 | 24:03 | auf die Sekunde | Die Schaltfläche "Zeilen behalten" im Power Query Editor bietet fünf Optionen: erste Zeilen behalten, letzte Zeilen behalten, einen Bereich von Zeilen behalten, Duplikate behalten und Fehler behalten. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1443s) |
| Warnung | Datenmodellierung ist Governance | 2025-11 | 09:48 | auf die Sekunde | Die häufigste Fehlerquelle in Datenmodellen liegt beim Verjoinen mehrerer Tabellen in Power Query, etwa durch verdoppelte oder inkonsistente Datensätze. | [▶](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=588s) |
| Empfehlung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 2025-11 | 09:58 | auf die Sekunde | Transformationsschritte sollen möglichst weit Richtung Quelle beziehungsweise in die dazwischenliegende Datenplattform verlagert werden, damit das Power-BI-Modell die Daten bereits aufbereitet erhält. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=598s) |
| Meinung | Daten-WG Special: Power BI vs. Qlik | 2025-10 | 36:20 | auf die Sekunde | Qlik bietet eine explorative Suche direkt im Aufbereitungs-Editor, die im Vergleich mit Power Query in Power BI als bisher nicht gefundenes Feature positiv auffiel. | [▶](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=2180s) |
| Fakt | Daten-WG Special: Power BI vs. Qlik | 2025-10 | 49:21 | auf die Sekunde | Qlik bietet eine eingebaute Funktion, um automatisch eine eindeutige laufende Nummer je unterschiedlicher Feldauspraegung zu erzeugen, ohne dafuer manuell eine separate Join-Tabelle aufbauen zu muessen. | [▶](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=2961s) |
| Fakt | BI Thinkers Talk nr.67 | 2025-09 | 18:43 | auf die Sekunde | Bei der Migration eines Importmodells zu Direct Lake wurde eine bisher per Power-Query-Abfrage angelegte Measure-Tabelle durch eine Calculated Table mit einer leeren Hilfsspalte ersetzt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1123s) |
| Fakt | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 20:54 | auf die Sekunde | Ein Kalender lässt sich per Power Query aufbauen und zusätzlich über TMDL mit Formaten, Sortierungen und Hierarchien anreichern. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1254s) |
| Fakt | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 29:42 | auf die Sekunde | Datumsangaben im ISO-Format mit Bindestrichen sind bei der Interpretation in Power Query in der Regel unkritisch. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1782s) |
| Empfehlung | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 29:59 | auf die Sekunde | Bei mehrdeutigen Datumsformaten wird empfohlen, im Power-Query-Transformationsschritt explizit die Culture (z.B. en-US) anzugeben, damit das Ergebnis nicht von der Spracheinstellung abhängt. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1799s) |
| Warnung | Daten-WG Deep Dive Financial Reporting - part 6 | 2025-08 | 31:29 | auf die Sekunde | Die Culture-Einstellung in Power Query gilt für den gesamten Transformationsschritt und nicht pro Spalte, weshalb gemischte Formate zwei getrennte Schritte erfordern. | [▶](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1889s) |
| Fakt | Daten-WG Thinkers Talk nr.65 | 2025-07 | 46:51 | auf die Sekunde | Power Query enthält seit Jahren einfache, auf Cognitive Services basierende KI-Funktionen wie Sentimentanalyse unter dem Namen KI Insights. | [▶](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2811s) |
| Fakt | Daten-WG Deep Dive Financial Reporting | 2025-05 | 13:02 | auf die Sekunde | Für deutschsprachige Power-BI-Modelle wird häufig die Datumstabelle von Lars Schreiber als Power-Query-Vorlage verwendet. | [▶](https://www.youtube.com/watch?v=TYmKrreMO3I&t=782s) |
| Empfehlung | Daten-WG Deep Dive Financial Reporting | 2025-05 | 37:36 | auf die Sekunde | Für das Auflösen der rekursiven Zeilen- und Kontenverweise in der Mapping-Tabelle wird ein Python-Notebook gegenüber Power Query bevorzugt, weil Power Query keine regulären Ausdrücke bietet. | [▶](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2256s) |
| Fakt | Daten-WG Deep Dive Financial Reporting | 2025-05 | 38:52 | auf die Sekunde | Beim Auflösen von Kontenbereichen in der Mapping-Tabelle muss ein Join mit der Sachkontentabelle erfolgen, da nicht jedes Konto in einem angegebenen Bereich tatsächlich existiert. | [▶](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2332s) |
| Meinung | Daten-WG Thinkers Talk n61 | 2025-04 | 15:25 | auf die Sekunde | In einer idealen Modellierung würde man für das Event-Dashboard Dimensionen anlegen und mindestens eine Kalendertabelle verwenden, statt nur Rohdaten aus der API zu übernehmen. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=925s) |
| Empfehlung | Daten-WG Thinkers Talk n61 | 2025-04 | 19:10 | auf die Sekunde | Ob ein Event als "closed" gilt, sollte als zeilenbezogene, unveränderliche Logik in Power Query berechnet werden statt an anderer Stelle im Bericht. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=1150s) |
| Meinung | Daten-WG Thinkers Talk n61 | 2025-04 | 38:49 | auf die Sekunde | Auch mit den neuen TMDL-Kalendermöglichkeiten wird es weiterhin als einfacher angesehen, einen Feiertag schnell in Power Query zu ergänzen statt in DAX. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2329s) |
| Empfehlung | Daten-WG Thinkers Talk n61 | 2025-04 | 43:00 | auf die Sekunde | Feiertagslogik sollte nicht Teil des TMDL-/Kalenderthemas sein, sondern eher als eine Art Offset separat behandelt werden. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2580s) |
| Empfehlung | Daten-WG Thinkers Talk n61 | 2025-04 | 43:44 | auf die Sekunde | Die Berechnung des x-ten Arbeitstags nach einem Datum wird für Power Query statt für aufwendige DAX-Window-Functions empfohlen, weil komplexe DAX-Lösungen für andere schwer nachvollziehbar und zu debuggen sind. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2624s) |
| Fakt | Daten-WG Thinkers Talk n61 | 2025-04 | 50:41 | auf die Sekunde | Über den XML-Endpoint lässt sich in TMDL kein Power Query laden, weshalb ein in Power Query gebauter Arbeitstage-Offset wie der von Lars Schreiber nicht einfach eins zu eins in TMDL nachgebaut werden kann. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=3041s) |
| Empfehlung | Daten-WG Thinkers Talk n61 | 2025-04 | 51:35 | auf die Sekunde | Vordefinierte Hilfsdaten wie eine Feiertagstabelle gehören ins Backend, also nach Power Query oder woanders, statt nur deshalb in TMDL eingefügt zu werden, weil sich das dort einfach per Copy-Paste einfügen lässt. | [▶](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=3095s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? |  | 11:19 | auf die Sekunde | Ein zentrales, datenhaltendes Objekt wie ein Lakehouse macht Power-BI-Modelle laut Artur deutlich stabiler und beschleunigt Aktualisierungen von zwei Stunden auf zwei Minuten. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=679s) |
| Warnung | Microsoft Fabric — braucht das wirklich jemand? |  | 15:19 | auf die Sekunde | Eine Datei über den direkten Cloud-Link statt über die lokal synchronisierte SharePoint-Kopie einzubinden gilt laut Martin als schlecht gelöst und ist eine häufige Fehlerquelle. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=919s) |
| Fakt | Was ist Self-Service und warum ist das so schwer? |  | 17:56 | auf die Sekunde | Tom Martens investiert bewusst begrenzte Lernzeit in DAX, Power Query, Python und Fabric-Notebooks, weil ihm das langfristig mehr Zeit und bessere Analysen ermöglicht. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1076s) |
| Fakt | Microsoft Fabric — braucht das wirklich jemand? |  | 40:06 | auf die Sekunde | Copilot kann Fachanwendern helfen, bestehende Power-Query-Dataflows automatisiert in schnelleren Code zu übersetzen. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2406s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Power BI Update Juni 2025](https://www.youtube.com/watch?v=LnNoXBIG7Lc) | 2025-06-01 | nur-zeitstempel | [00:00](https://www.youtube.com/watch?v=LnNoXBIG7Lc&t=0s) · [05:45](https://www.youtube.com/watch?v=LnNoXBIG7Lc&t=345s) |
| [Power BI Update August 2025](https://www.youtube.com/watch?v=jTXo4aEr07o) | 2025-08-01 | nur-zeitstempel | [00:34](https://www.youtube.com/watch?v=jTXo4aEr07o&t=34s) · [03:53](https://www.youtube.com/watch?v=jTXo4aEr07o&t=233s) |
| [Projektcontrolling mit dynamischen Arbeitstagen in Power BI](https://www.youtube.com/watch?v=cD-5z_Bq0N4) | 2025-05-01 | nur-zeitstempel | [08:34](https://www.youtube.com/watch?v=cD-5z_Bq0N4&t=514s) · [12:04](https://www.youtube.com/watch?v=cD-5z_Bq0N4&t=724s) · [13:39](https://www.youtube.com/watch?v=cD-5z_Bq0N4&t=819s) |
| [Daten-WG Special: Power BI vs. Qlik](https://www.youtube.com/watch?v=aYHk_V8n_CE) | 2025-10-01 | kernaussagen+zeitstempel | [22:22](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=1342s) · [35:40](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=2140s) · [38:52](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=2332s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Datei-Quellen%20%C2%B7%20CSV%20%C2%B7%20Excel%20%C2%B7%20JSON%20%C2%B7%20Parquet) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Web-%20%26%20API-Quellen) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Klassifizierungen%20ableiten) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | kernaussagen+zeitstempel | [27:07](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=1627s) · [49:35](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=2975s) · [57:26](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=3446s) |
| [Starting with Microsft Fabric the Skills you need](https://www.youtube.com/watch?v=m3xNYfVih0Q) | 2024-08-01 | nur-zeitstempel | [06:28](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=388s) · [22:19](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1339s) · [25:34](https://www.youtube.com/watch?v=m3xNYfVih0Q&t=1534s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [06:50](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=410s) · [08:37](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=517s) · [10:21](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=621s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [08:27](https://www.youtube.com/watch?v=mTVeZzshLzE&t=507s) · [10:01](https://www.youtube.com/watch?v=mTVeZzshLzE&t=601s) · [40:00](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2400s) |
| [Power BI Update Oktober 2025](https://www.youtube.com/watch?v=LVSttJlhrqM) | 2025-10-01 | nur-zeitstempel | [04:21](https://www.youtube.com/watch?v=LVSttJlhrqM&t=261s) |
| [Daten-WG Deep Dive Financial Reporting](https://www.youtube.com/watch?v=TYmKrreMO3I) | 2025-05-01 | kernaussagen+zeitstempel | [13:02](https://www.youtube.com/watch?v=TYmKrreMO3I&t=782s) · [35:49](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2149s) · [37:24](https://www.youtube.com/watch?v=TYmKrreMO3I&t=2244s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [20:48](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1248s) · [22:26](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1346s) · [48:16](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=2896s) |
| [Power BI Update Mai 2026](https://www.youtube.com/watch?v=psLPsI32sAs) | 2026-05-01 | nur-zeitstempel | [03:15](https://www.youtube.com/watch?v=psLPsI32sAs&t=195s) |
| [Power BI vs. Qlik](https://www.youtube.com/watch?v=vd1r02bj9Qk) | 2026-01-01 | kernaussagen+zeitstempel | [05:10](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=310s) · [30:45](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=1845s) |
| [Power BI Update September 2025](https://www.youtube.com/watch?v=6gQiIbyhWEc) | 2025-09-01 | nur-zeitstempel | [08:56](https://www.youtube.com/watch?v=6gQiIbyhWEc&t=536s) |
| [Daten-WG Deep Dive Financial Reporting - part 7](https://www.youtube.com/watch?v=232JhS9vbQ0) | 2025-09-01 | nur-zeitstempel | [03:25](https://www.youtube.com/watch?v=232JhS9vbQ0&t=205s) · [23:26](https://www.youtube.com/watch?v=232JhS9vbQ0&t=1406s) · [47:23](https://www.youtube.com/watch?v=232JhS9vbQ0&t=2843s) |
| [Unboxing MCP Server for Power BI Modelling](https://www.youtube.com/watch?v=iinfiHxznOU) | 2025-12-01 | kernaussagen+zeitstempel | [04:39](https://www.youtube.com/watch?v=iinfiHxznOU&t=279s) · [25:52](https://www.youtube.com/watch?v=iinfiHxznOU&t=1552s) · [30:11](https://www.youtube.com/watch?v=iinfiHxznOU&t=1811s) |
| [Daten-WG Deep Dive Financial Reporting - part 5](https://www.youtube.com/watch?v=iymmxuXHh44) | 2025-07-01 | nur-zeitstempel | [49:26](https://www.youtube.com/watch?v=iymmxuXHh44&t=2966s) · [50:56](https://www.youtube.com/watch?v=iymmxuXHh44&t=3056s) · [1:05:42](https://www.youtube.com/watch?v=iymmxuXHh44&t=3942s) |
| [Daten-WG Deep Dive Financial Reporting - part 6](https://www.youtube.com/watch?v=bt81POE-9Ig) | 2025-08-01 | kernaussagen+zeitstempel | [18:15](https://www.youtube.com/watch?v=bt81POE-9Ig&t=1095s) · [41:19](https://www.youtube.com/watch?v=bt81POE-9Ig&t=2479s) · [56:24](https://www.youtube.com/watch?v=bt81POE-9Ig&t=3384s) |
| [Visual Analytics with Power BI](https://www.youtube.com/watch?v=UxE0DPnLgIg) | 2021-09-01 | nur-zeitstempel | [21:54](https://www.youtube.com/watch?v=UxE0DPnLgIg&t=1314s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [17:48](https://www.youtube.com/watch?v=G8s96sHUHac&t=1068s) · [42:46](https://www.youtube.com/watch?v=G8s96sHUHac&t=2566s) · [1:08:31](https://www.youtube.com/watch?v=G8s96sHUHac&t=4111s) |
| [BI Thinkers Talk - Data Modelling - Fabric Data Days Edition](https://www.youtube.com/watch?v=mUALlPmGcEk) | 2025-11-01 | kernaussagen+zeitstempel | [22:42](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1362s) · [27:28](https://www.youtube.com/watch?v=mUALlPmGcEk&t=1648s) · [50:29](https://www.youtube.com/watch?v=mUALlPmGcEk&t=3029s) |
| [Dein erstes Dashboard — Power-BI-Praxis-Pfad](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html#:~:text=So%20geht%27s) · [Abschnitt](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html#:~:text=Die%20Schrittliste%20ist%20dein%20Rezept) |
| [Daten-WG Life-Update \| State of Power BI, Fabric & AI-Tools](https://www.youtube.com/watch?v=d3HdhRe_nK8) | 2026-06-01 | nur-zeitstempel | [17:00](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1020s) · [26:17](https://www.youtube.com/watch?v=d3HdhRe_nK8&t=1577s) |
| [Daten-WG Deep Dive Financial Reporting pt.4](https://www.youtube.com/watch?v=UnW4wHhw_IY) | 2025-05-01 | nur-zeitstempel | [49:13](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=2953s) · [57:15](https://www.youtube.com/watch?v=UnW4wHhw_IY&t=3435s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | kernaussagen+zeitstempel | [35:19](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2119s) · [40:30](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2430s) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [08:30](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=510s) · [10:21](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=621s) · [12:04](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=724s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [46:52](https://www.youtube.com/watch?v=VD1N68Fhoco&t=2812s) · [59:31](https://www.youtube.com/watch?v=VD1N68Fhoco&t=3571s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | kernaussagen+zeitstempel | [06:09](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=369s) · [29:00](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=1740s) |
| [Daten-WG Special: Power BI vs. Qlik -part2](https://www.youtube.com/watch?v=_Vh5fDfHWz4) | 2025-10-01 | nur-zeitstempel | [12:08](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=728s) · [1:07:18](https://www.youtube.com/watch?v=_Vh5fDfHWz4&t=4038s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [55:41](https://www.youtube.com/watch?v=r416vanitYw&t=3341s) · [1:00:24](https://www.youtube.com/watch?v=r416vanitYw&t=3624s) |
| [Daten-WG Thinkers Talk nr.65](https://www.youtube.com/watch?v=Fqt4gP1xB5w) | 2025-07-01 | kernaussagen+zeitstempel | [45:50](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=2750s) · [1:08:50](https://www.youtube.com/watch?v=Fqt4gP1xB5w&t=4130s) |
| [BI Thinkers Talk - Data Modeling - Fabric Data Days Edition [EN]](https://www.youtube.com/watch?v=uxYFqwe_Wiw) | 2025-12-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) · [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) · [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [37:26](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2246s) · [41:00](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2460s) |
| [10 Jahre BI für alle? Was Power BI wirklich verändert hat](https://www.youtube.com/watch?v=9wl_PLvgvyc) | 2025-08-01 | nur-zeitstempel | [28:06](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=1686s) |
| [Datenmodellierung ist Governance](https://www.youtube.com/watch?v=lH_-A8NAQ-k) | 2025-11-01 | kernaussagen+zeitstempel | [09:13](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=553s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | kernaussagen+zeitstempel | [15:53](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=953s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Dataflow%20Gen2) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Weg%20C%20%C2%B7%20Shortcut%2C%20wenn%20Daten%20schon%20existieren) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Dataflow-Weg%20%28Low-Code%29) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | kernaussagen+zeitstempel | [19:44](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1184s) |
| [Was ist Self-Service und warum ist das so schwer?](https://www.youtube.com/watch?v=EVsJ6zyGUWc) | — | kernaussagen+zeitstempel | [12:51](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=771s) |

40 von 45 angezeigt, vollständige Liste in der JSON-Datei (https://datenwgknowledgekitchen.com/wissensgraph/library/power-query.json).

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Apower-query
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Apower-query&f=tool%3Apower-query
