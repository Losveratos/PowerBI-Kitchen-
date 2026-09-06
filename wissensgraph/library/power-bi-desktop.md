---
id: "tool:power-bi-desktop"
name: "Power BI Desktop"
typ: tool
stand: "2026-09-06"
build: "20260906-2313"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 38
kernaussagen: 36
mit_kernaussagen: 12
aliase:
  - "Desktop"
---

# Power BI Desktop

Die Visual-Studio-Code-Erweiterung für Microsoft Fabric erlaubt es, aus einer Power-BI-Projektdatei einzelne Teile wie nur den Bericht oder nur das semantische Modell hochzuladen, statt immer die gesamte PBIX hochzuladen. Microsoft plant eine Funktion, mit der Power BI Desktop Codeänderungen im Hintergrund automatisch erkennt und die Berichtsdefinition neu lädt, ohne dass die Anwendung komplett neu gestartet werden muss. Power BI Desktop wurde so gehärtet, dass es Codesegmente von Drittanbieter-Tools, die es selbst nicht versteht, ignoriert, statt wie früher etwa bei manuellen Partitionsdefinitionen mit einem Fehler abzubrechen.

## Aliase

Desktop

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 108 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 47 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 25 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 22 |
| [Direct Lake](direct-lake.md) | ko-vorkommen | heuristik | 20 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 20 |
| [Power Query](power-query.md) | ko-vorkommen | heuristik | 19 |
| [Semantic Model](semantic-model.md) | ko-vorkommen | heuristik | 18 |
| [Refresh](refresh.md) | ko-vorkommen | heuristik | 17 |
| [Datenmodellierung](datenmodellierung.md) | ko-vorkommen | heuristik | 15 |
| [DAX](dax.md) | ko-vorkommen | heuristik | 14 |
| [DirectQuery](directquery.md) | ko-vorkommen | heuristik | 13 |
| [Premium](premium.md) | ko-vorkommen | heuristik | 12 |
| [Excel](excel.md) | ko-vorkommen | heuristik | 12 |
| [Sicherheit](sicherheit.md) | ko-vorkommen | heuristik | 10 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Fakt | BI Thinkers Talk nr.76 | 03:09 | In Power BI Desktop können wegen fehlender Python-Installation aus Sicherheitsgründen keine Python-basierten Visuals wie Matplotlib, Plotly oder Seaborn genutzt werden. | [▶](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=189s) |
| Fakt | Power BI Update April 2026 | 00:00 | In den Canvas-Einstellungen von Power BI Desktop lässt sich jetzt Full HD als fertige Auflösungsoption auswählen. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=0s) |
| Fakt | Power BI Update April 2026 | 00:25 | Die neue Full-HD-Option ersetzt das bisher nötige manuelle Eintippen der Auflösung 1920x1080 in den Canvas-Einstellungen. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=25s) |
| Meinung | Power BI Update April 2026 | 00:25 | Der Autor sieht die feste Full-HD-Auflösung als Fortschritt, auch wenn andere Auflösungen für Browser-Bildschirme unter Umständen besser passen könnten. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=25s) |
| Fakt | Power BI Update April 2026 | 02:58 | Preview-Visuals werden in Power BI Desktop jetzt unten angepinnt angezeigt, damit sie leichter als Preview erkennbar sind. | [▶](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=178s) |
| Fakt | BI Thinkers Talk nr.75 | 36:20 | Ein Perspective Editor und ein Translation Editor stehen in Power BI Desktop nativ nicht zur Verfügung und erfordern sonst Drittanbieter-Tools wie Tabular Editor. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2180s) |
| Fakt | BI Thinkers Talk nr.75 | 47:52 | Über die in der PBIR-Datei gespeicherten Seitenverbindungen lässt sich die mehrstufige Navigationsstruktur eines Berichts sichtbar machen, was in Power BI Desktop selbst nicht einsehbar ist. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2872s) |
| Fakt | Power BI Update März 2026 | 00:42 | Die visuelle Oberfläche von Power BI Desktop wurde mit neuen Standardeinstellungen modernisiert. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=42s) |
| Meinung | Power BI Update März 2026 | 00:42 | Der neue graue Standardhintergrund der visuellen Oberfläche gefällt dem Sprecher nicht. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=42s) |
| Fakt | Power BI Update März 2026 | 01:36 | Für neu angelegte Seiten ist HD die neue Standardauflösung, bestehende Seiten sind davon nicht betroffen. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=96s) |
| Warnung | Power BI Update März 2026 | 01:36 | Neue Standardeinstellungen sollten in bestehenden Produktionsberichten nur vorsichtig übernommen werden, da dort oft schon individuelle Anpassungen bestehen. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=96s) |
| Fakt | Power BI Update März 2026 | 02:28 | Mit den Custom Totals lässt sich die Gesamtsumme einer Kennzahl (Measure Totals) individuell anders berechnen als die Summe der Einzelzeilen. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=148s) |
| Fakt | BI Thinkers Talk n.74 | 05:02 | Die neue Karten-Visual-Kachel in Power BI Desktop unterstützt Kreuzfilterung nur, wenn die Kategorienkopfzeile horizontal oben statt seitlich links angeordnet ist. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=302s) |
| Fakt | Power BI Update März 2026 | 05:37 | Für Zeilenbeschriftungen lassen sich jetzt Führungslinien aktivieren, die bei engem Platz die Zuordnung zu den Werten erleichtern. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=337s) |
| Fakt | Power BI Update März 2026 | 05:57 | Benutzerdefinierte DAX-Funktionen lassen sich jetzt auch über die grafische Oberfläche anlegen. | [▶](https://www.youtube.com/watch?v=ASwcPvbMRZc&t=357s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 00:30 | Ein Feldparameter lässt sich in Power BI Desktop über Modeling und "Neuer Feldparameter" anlegen. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=30s) |
| Fakt | Field Parameter (Feldparameter) in Power BI richtig nutzen - „Werte des ausgewählten Felds anzeigen“ | 01:11 | Power BI erzeugt beim Anlegen eines Feldparameters automatisch eine per DAX erstellte Parametertabelle sowie einen passenden Slicer. | [▶](https://www.youtube.com/watch?v=v8dvnqqa7f8&t=71s) |
| Fakt | BI Thinkers Talk n.73 | 03:18 | Field Parameters lassen sich aus einer Datumstabelle mit verschiedenen Ebenen (z. B. Jahr, Monatsname) aufbauen und über die Option "Single Selection" als klassischer Werte-Slicer statt als Auswahl-Schalter nutzen. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=198s) |
| Warnung | BI Thinkers Talk n.73 | 11:29 | Bei einem reinen Flächendiagramm zeigt Power BI im Tooltip vor jedem Feld korrekt einen farbigen Punkt an, während dieselbe Darstellung bei einem kombinierten Line-and-Column-Chart mit zwei Achsen fehlerhaft wird. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=689s) |
| Meinung | BI Thinkers Talk n.73 | 13:09 | Nach Einschätzung des Sprechers besteht der Tooltip-Fehler bei kombinierten Line-and-Column-Charts mit zwei Achsen bereits seit 2023. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=789s) |
| Fakt | BI Thinkers Talk n.73 | 16:14 | Zieht man zusätzliche Measures in das Tooltip-Feld eines Visuals, werden weitere Werte im Tooltip angezeigt, das ursprünglich gebundene Measure lässt sich dabei aber nicht aus dem Tooltip entfernen. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=974s) |
| Empfehlung | BI Thinkers Talk n.73 | 16:14 | Bei komplexen Diagrammen mit unzuverlässigen Standard-Tooltips empfiehlt der Sprecher eine dedizierte Tooltip-Seite, weil generische Lösungen wegen der visual-spezifischen Filterauswahl nicht funktionieren. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=974s) |
| Warnung | BI Thinkers Talk n.73 | 30:47 | Bei zwei redundanten Balken- und Liniendiagrammen mit demselben zugrunde liegenden Feld zeigt Power BI die X-Achsenbeschriftung je nach Diagrammtyp unterschiedlich fett formatiert an, ohne dass dafür ein nachvollziehbarer Grund erkennbar ist. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=1847s) |
| Fakt | BI Thinkers Talk n.73 | 40:39 | Eine Monitoring-Analyse zeigte, dass über zwei Drittel der Last auf einem produktiven Direct-Lake-Semantic-Model von Entwicklern in Power BI Desktop stammten und nicht von den eigentlichen Report-Nutzern. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2439s) |
| Fakt | BI Thinkers Talk n.73 | 48:33 | In der Power BI Service Web-Oberfläche gibt es aktuell keine Möglichkeit, die Datenquelle eines Reports direkt umzuhängen; das lässt sich nur nach dem Download im Power BI Desktop ändern. | [▶](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2913s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 03:46 | Power BI im Web unterstützt jetzt die Themes-Auswahl und den Performance Analyzer und ist damit fast gleichwertig zu Power BI Desktop. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=226s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 05:30 | Ab der Februar-Version von Power BI Desktop wird PBIP zur neuen Standardeinstellung beim Speichern von Berichten. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=330s) |
| Fakt | BI Thinkers Talk nr.71 | 27:12 | In Power BI Desktop eingefügte Hyperlinks in Textfeldern lassen sich erst nach der Veröffentlichung des Berichts anklicken, nicht direkt im Desktop. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1632s) |
| Fakt | BI Thinkers Talk nr.67 | 04:56 | Die Visual-Studio-Code-Erweiterung für Microsoft Fabric erlaubt es, aus einer Power-BI-Projektdatei einzelne Teile wie nur den Bericht oder nur das semantische Modell hochzuladen, statt immer die gesamte PBIX hochzuladen. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=296s) |
| Fakt | BI Thinkers Talk nr.67 | 11:35 | Microsoft plant eine Funktion, mit der Power BI Desktop Codeänderungen im Hintergrund automatisch erkennt und die Berichtsdefinition neu lädt, ohne dass die Anwendung komplett neu gestartet werden muss. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=695s) |
| Fakt | BI Thinkers Talk nr.67 | 13:11 | Power BI Desktop wurde so gehärtet, dass es Codesegmente von Drittanbieter-Tools, die es selbst nicht versteht, ignoriert, statt wie früher etwa bei manuellen Partitionsdefinitionen mit einem Fehler abzubrechen. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=791s) |
| Warnung | BI Thinkers Talk nr.67 | 14:42 | Berichte mit Writeback-Visuals wie InfoRiver sollten nach Möglichkeit nicht mehr in Power BI Desktop bearbeitet werden, weil ein erneutes Laden dort bereits von Nutzern eingegebene Daten überschreiben könnte. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=882s) |
| Empfehlung | BI Thinkers Talk nr.67 | 21:03 | Ein bestehender Bericht wurde im Live-Connection-Modus aus dem Power-BI-Service heruntergeladen und anschließend über die Datenverbindung von seinem ursprünglichen Importmodell auf ein neu aufgebautes Direct-Lake-Modell mit identischen Measure-Namen umgestellt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=1263s) |
| Fakt | BI Thinkers Talk nr.67 | 1:02:12 | Neue wiederverwendbare DAX-Funktionen lassen sich derzeit nicht direkt in der Power-BI-Desktop-Oberfläche erstellen oder bearbeiten, sondern nur im DAX-Abfrageeditor oder über die TMDL-Ansicht, während Desktop sie nur lesend als vorhandene Funktionen mit Lösch- und Umbenennen-Option anzeigt. | [▶](https://www.youtube.com/watch?v=G8s96sHUHac&t=3732s) |
| Fakt | 10 Jahre Power BI | 06:46 | Eine im Jahr 2016 erstellte Power-BI-Datei ließ sich auch mit einer neueren Programmversion noch öffnen, während der umgekehrte Weg nicht funktioniert. | [▶](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=406s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 | 03:07 | Das März-Update von Power BI Desktop führt ein neues UI-Standarddesign mit grauem Hintergrund ein. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=187s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Power BI Update April 2025](https://www.youtube.com/watch?v=lT-C7fPzxj4) | 2025-04-01 | nur-zeitstempel | [00:00](https://www.youtube.com/watch?v=lT-C7fPzxj4&t=0s) · [01:36](https://www.youtube.com/watch?v=lT-C7fPzxj4&t=96s) |
| [ChartKitchen byDatenWG — Schnellstart](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html#:~:text=Visual%20herunterladen) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html#:~:text=01%20%C2%B7%20In%20drei%20Schritten%20loslegen) |
| [ChartKitchen byDatenWG — Quick Start](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html#:~:text=Download%20the%20visual) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-schnellstart_en.html#:~:text=01%20%C2%B7%20Get%20going%20in%20three%20steps) |
| [Power BI Update Juni 2025](https://www.youtube.com/watch?v=LnNoXBIG7Lc) | 2025-06-01 | nur-zeitstempel | [00:00](https://www.youtube.com/watch?v=LnNoXBIG7Lc&t=0s) · [01:45](https://www.youtube.com/watch?v=LnNoXBIG7Lc&t=105s) |
| [So rettest du deine kaputte Power BI Theme Datei in 5 Minuten! \| Power BI Tutorial](https://www.youtube.com/watch?v=gspmWlVrNdA) | 2025-10-01 | nur-zeitstempel | [00:01](https://www.youtube.com/watch?v=gspmWlVrNdA&t=1s) · [01:31](https://www.youtube.com/watch?v=gspmWlVrNdA&t=91s) · [07:00](https://www.youtube.com/watch?v=gspmWlVrNdA&t=420s) |
| [Report-Design als Framework — ein Skill für Power BI](https://datenwgknowledgekitchen.com/powerbi-design-skill.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/powerbi-design-skill.html#:~:text=4%20%C2%B7%20Warten%20statt%20neu%20bauen%20%E2%80%94%20Bulk%20%C2%B7%20Linter%20%C2%B7%20Wireframes) · [Abschnitt](https://datenwgknowledgekitchen.com/powerbi-design-skill.html#:~:text=Der%20Praxistest%3A%20%2Adiese%20Webseite%20als%20Branding-Quelle%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/powerbi-design-skill.html#:~:text=F%C3%BCr%20wen%3A%20%2AMenschen%20und%20Agenten%2A) |
| [Power BI Update August 2025](https://www.youtube.com/watch?v=jTXo4aEr07o) | 2025-08-01 | nur-zeitstempel | [00:00](https://www.youtube.com/watch?v=jTXo4aEr07o&t=0s) · [02:46](https://www.youtube.com/watch?v=jTXo4aEr07o&t=166s) |
| [BI Thinkers Talk nr.67](https://www.youtube.com/watch?v=G8s96sHUHac) | 2025-09-01 | kernaussagen+zeitstempel | [11:35](https://www.youtube.com/watch?v=G8s96sHUHac&t=695s) · [19:28](https://www.youtube.com/watch?v=G8s96sHUHac&t=1168s) · [21:03](https://www.youtube.com/watch?v=G8s96sHUHac&t=1263s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [15:12](https://www.youtube.com/watch?v=r416vanitYw&t=912s) · [18:27](https://www.youtube.com/watch?v=r416vanitYw&t=1107s) · [52:27](https://www.youtube.com/watch?v=r416vanitYw&t=3147s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [16:11](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=971s) · [24:01](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1441s) · [1:07:32](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=4052s) |
| [Dein erstes Dashboard — Power-BI-Praxis-Pfad](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html) · [Abschnitt](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html#:~:text=Modul%200%20%C2%B7%20Power%20BI%20installieren) · [Abschnitt](https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html#:~:text=So%20geht%27s) |
| [Power BI Update April 2026](https://www.youtube.com/watch?v=fbpu8zLG3cc) | 2026-04-01 | kernaussagen+zeitstempel | [02:58](https://www.youtube.com/watch?v=fbpu8zLG3cc&t=178s) |
| [10 Jahre Power BI](https://www.youtube.com/watch?v=ZaDd1uxeLbI) | 2025-07-01 | kernaussagen+zeitstempel | [25:02](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=1502s) · [31:16](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=1876s) · [55:20](https://www.youtube.com/watch?v=ZaDd1uxeLbI&t=3320s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [07:46](https://www.youtube.com/watch?v=lZvpCBMKASM&t=466s) · [26:33](https://www.youtube.com/watch?v=lZvpCBMKASM&t=1593s) · [40:30](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2430s) |
| [Daten-WG Special: Power BI vs. Qlik](https://www.youtube.com/watch?v=aYHk_V8n_CE) | 2025-10-01 | nur-zeitstempel | [08:02](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=482s) · [09:43](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=583s) · [46:51](https://www.youtube.com/watch?v=aYHk_V8n_CE&t=2811s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=3.%20Bidirektional%20sparsam) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=01%20%C2%B7%20Architektur%20%26%20%2AKomponenten%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Externe%20Tools%20aktivieren) |
| [BI Thinkers Talk n.73](https://www.youtube.com/watch?v=pOJpXxsfUt0) | 2026-02-01 | kernaussagen+zeitstempel | [40:39](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2439s) · [47:01](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2821s) · [48:33](https://www.youtube.com/watch?v=pOJpXxsfUt0&t=2913s) |
| [Power BI Seiten per URL steuern - Sprechende URLs mit PBIP & VS Code \| Power BI Tutorial](https://www.youtube.com/watch?v=DcEfNIupEHM) | 2025-12-01 | nur-zeitstempel | [06:49](https://www.youtube.com/watch?v=DcEfNIupEHM&t=409s) |
| [TMDL Magie: Multi Parameter Tabelle - Feldparameter Next Level! \| Power BI Tutorial](https://www.youtube.com/watch?v=sShNdgnHjr4) | 2025-10-01 | nur-zeitstempel | [00:01](https://www.youtube.com/watch?v=sShNdgnHjr4&t=1s) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [08:27](https://www.youtube.com/watch?v=mTVeZzshLzE&t=507s) · [13:17](https://www.youtube.com/watch?v=mTVeZzshLzE&t=797s) · [26:39](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1599s) |
| [BI Thinkers Talk nr.76](https://www.youtube.com/watch?v=mlkP-6i5Kq8) | 2026-05-01 | kernaussagen+zeitstempel | [03:09](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=189s) · [06:27](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=387s) · [27:00](https://www.youtube.com/watch?v=mlkP-6i5Kq8&t=1620s) |
| [10 Jahre BI für alle? Was Power BI wirklich verändert hat](https://www.youtube.com/watch?v=9wl_PLvgvyc) | 2025-08-01 | nur-zeitstempel | [11:07](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=667s) · [34:44](https://www.youtube.com/watch?v=9wl_PLvgvyc&t=2084s) |
| [BI Thinkers Talk nr.75](https://www.youtube.com/watch?v=BQdSo6ZnmKY) | 2026-04-01 | kernaussagen+zeitstempel | [36:20](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2180s) · [46:11](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2771s) · [47:52](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2872s) |
| [BI Thinkers Talk nr.68](https://www.youtube.com/watch?v=VD1N68Fhoco) | 2025-10-01 | nur-zeitstempel | [01:34](https://www.youtube.com/watch?v=VD1N68Fhoco&t=94s) · [16:06](https://www.youtube.com/watch?v=VD1N68Fhoco&t=966s) · [29:09](https://www.youtube.com/watch?v=VD1N68Fhoco&t=1749s) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [02:59](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=179s) · [04:32](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=272s) · [06:09](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=369s) |
| [BI Thinkers Talk n.74](https://www.youtube.com/watch?v=rWE0gMx7v7I) | 2026-03-01 | kernaussagen+zeitstempel | [05:02](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=302s) · [06:41](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=401s) · [11:17](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=677s) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=03%20%C2%B7%20Semantische%20Modelle%20%26%20%2ADirect%20Lake%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Measures%20schreiben) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20Konsum-Wege) |
| [Fabric Workload Demo mit Alexander Korn und Lukasz Obst](https://www.youtube.com/watch?v=e50qKdVn-24) | 2026-08-01 | nur-zeitstempel | [07:42](https://www.youtube.com/watch?v=e50qKdVn-24&t=462s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [03:46](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=226s) · [05:30](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=330s) |
| [Daten-WG Deep Dive Financial Reporting - part 7](https://www.youtube.com/watch?v=232JhS9vbQ0) | 2025-09-01 | nur-zeitstempel | [08:31](https://www.youtube.com/watch?v=232JhS9vbQ0&t=511s) · [20:17](https://www.youtube.com/watch?v=232JhS9vbQ0&t=1217s) |
| [Unboxing MCP Server for Power BI Modelling](https://www.youtube.com/watch?v=iinfiHxznOU) | 2025-12-01 | nur-zeitstempel | [28:36](https://www.youtube.com/watch?v=iinfiHxznOU&t=1716s) · [43:00](https://www.youtube.com/watch?v=iinfiHxznOU&t=2580s) |
| [BI Thinkers Talk Nr.62](https://www.youtube.com/watch?v=Wwvhv8WA2Qc) | 2025-05-01 | kernaussagen+zeitstempel | [33:23](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=2003s) · [1:02:29](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=3749s) |
| [ChartKitchen byDatenWG — Documentation](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html#:~:text=1%20%C2%B7%20Import%20the%20visual) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html#:~:text=04%20%C2%B7%20ChartKitchen%20in%20action) |
| [ChartKitchen byDatenWG — Dokumentation](https://datenwgknowledgekitchen.com/chartkitchen-doku.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku.html#:~:text=1%20%C2%B7%20Visual%20importieren) · [Abschnitt](https://datenwgknowledgekitchen.com/chartkitchen-doku.html#:~:text=04%20%C2%B7%20ChartKitchen%20im%20Einsatz) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [08:28](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=508s) |
| [BI Thinkers Talk nr.63](https://www.youtube.com/watch?v=9VX4-lLa0EI) | 2025-06-01 | nur-zeitstempel | [47:15](https://www.youtube.com/watch?v=9VX4-lLa0EI&t=2835s) |
| [BI Thinkers Talk nr.64](https://www.youtube.com/watch?v=4VVNDNusq4U) | 2025-07-01 | nur-zeitstempel | [33:57](https://www.youtube.com/watch?v=4VVNDNusq4U&t=2037s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [03:06](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=186s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Apower-bi-desktop
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Apower-bi-desktop&f=tool%3Apower-bi-desktop
