---
id: "tool:azure-maps"
name: "Azure Maps"
typ: tool
stand: "2026-09-07"
build: "20260907-1922"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 5
kernaussagen: 17
mit_kernaussagen: 2
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/azure-maps.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/azure-maps.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/azure-maps.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/azure-maps.json"
aliase:
  - "Azure Map"
---

# Azure Maps

In diesem Tutorial wird gezeigt, wie eine Von-bis-Postleitzahlenregion aus einer Excel-Tabelle in ein Flächenkartogramm mit Azure Maps in Power BI umgewandelt wird. Die von GitHub geladenen Shapefiles liegen als Brotli-komprimierte .br-Dateien vor und müssen vor der Weiterverarbeitung mit einem Online-Tool entpackt werden. Die reparierten Shapefile-Geometrien werden in QGIS über einen Join mit der CSV-Datei der Gebietsaufteilung anhand der Postleitzahl verknüpft.

## Aliase

Azure Map

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [DAX](dax.md) | setzt-voraus | belegt | 0 |
| [Azure](azure.md) | ko-vorkommen | heuristik | 9 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 5 |
| [Visualisierung](visualisierung.md) | ko-vorkommen | heuristik | 3 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 00:03 | auf die Sekunde | In diesem Tutorial wird gezeigt, wie eine Von-bis-Postleitzahlenregion aus einer Excel-Tabelle in ein Flächenkartogramm mit Azure Maps in Power BI umgewandelt wird. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=3s) |
| Empfehlung | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 00:16 | auf die Sekunde | Für Azure Maps sollte das GeoJSON-Format genutzt werden, während TopoJSON für das Flächenkartogramm gedacht ist. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=16s) |
| Empfehlung | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 00:43 | Abschnittsanfang | Für eigene Kartenregionen in Azure Maps werden das kostenlose Tool QGIS und Shapefiles von GitHub benötigt. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=43s) |
| Fakt | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 02:05 | Abschnittsanfang | Die von GitHub geladenen Shapefiles liegen als Brotli-komprimierte .br-Dateien vor und müssen vor der Weiterverarbeitung mit einem Online-Tool entpackt werden. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=125s) |
| Fakt | Power BI Update Januar 2026 | 2026-01 | 03:19 | auf die Sekunde | Power BI erlaubt jetzt das Platzieren individueller Marker auf Azure-Maps-Visualisierungen. | [▶](https://www.youtube.com/watch?v=TAM5AAZqh7k&t=199s) |
| Meinung | Power BI Update Januar 2026 | 2026-01 | 03:19 | Abschnittsanfang | Der Sprecher findet die individuellen Azure-Maps-Marker unterhaltsam, aber für seine eigene Arbeit wenig relevant. | [▶](https://www.youtube.com/watch?v=TAM5AAZqh7k&t=199s) |
| Empfehlung | Power BI Update Januar 2026 | 2026-01 | 03:19 | Abschnittsanfang | Der Sprecher empfiehlt Zuschauern, bei Interesse an den individuellen Azure-Maps-Markern einen Kommentar zu hinterlassen. | [▶](https://www.youtube.com/watch?v=TAM5AAZqh7k&t=199s) |
| Warnung | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 08:24 | auf die Sekunde | Vor der Weiterverarbeitung müssen die importierten Shapefile-Geometrien in QGIS repariert werden, da nicht geschlossene Flächen oder Schleifen sonst beim Rendern in Power BI zu Problemen führen. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=504s) |
| Fakt | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 12:29 | auf die Sekunde | Die reparierten Shapefile-Geometrien werden in QGIS über einen Join mit der CSV-Datei der Gebietsaufteilung anhand der Postleitzahl verknüpft. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=749s) |
| Fakt | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 12:30 | Abschnittsanfang | Mit der QGIS-Funktion Auflösen (Dissolve) werden die einzelnen Postleitzahlflächen anhand des Gebietsnamens zu zusammenhängenden Vertriebsregionen zusammengefasst. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=750s) |
| Empfehlung | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 14:27 | Abschnittsanfang | Die fertige Vertriebsregionenkarte muss aus QGIS im GeoJSON-Format exportiert werden, damit sie in Power BI verwendet werden kann. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=867s) |
| Warnung | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 18:26 | Abschnittsanfang | Vor dem Import in Power BI sollte die aus QGIS exportierte GeoJSON-Datei mit einem Online-Tool standardisiert werden, da Power BI mit unbearbeiteten QGIS-GeoJSON-Dateien mitunter Schwierigkeiten hat. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=1106s) |
| Fakt | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 19:10 | Abschnittsanfang | Im Azure-Maps-Visual von Power BI wird die eigene GeoJSON-Datei als Referenzebene entweder per URL oder per Datei-Upload eingebunden. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=1150s) |
| Empfehlung | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 19:10 | Abschnittsanfang | Fehlt in den Quelldaten eine Länderspalte, kann eine berechnete DAX-Spalte sicherstellen, dass Azure Maps die Orte korrekt in Deutschland verortet. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=1150s) |
| Empfehlung | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 20:42 | Abschnittsanfang | Damit die geladene Referenzebene sichtbar wird, muss die standardmäßig aktive Blasenebene im Azure-Maps-Visual deaktiviert werden. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=1242s) |
| Empfehlung | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 22:08 | auf die Sekunde | Über die bedingte Formatierung der Polygone lässt sich die Referenzebene als Farbverlauf (Heatmap) nach einer Kennzahl wie dem Umsatz einfärben. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=1328s) |
| Meinung | Power BI: (Vertriebs-) Regionen in Azure Maps | 2026-01 | 28:08 | Abschnittsanfang | Gegenüber dem Flächenkartogramm bietet Azure Maps den Vorteil einer echten Kartenbasis mit Straßen, Flüssen und Städten, die zusätzlichen räumlichen Kontext liefert. | [▶](https://www.youtube.com/watch?v=CvaOkO37HMU&t=1688s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [The Power of User Groups](https://www.youtube.com/watch?v=SSUpe1JON9Y) | 2025-10-01 | nur-zeitstempel | [26:45](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=1605s) · [28:45](https://www.youtube.com/watch?v=SSUpe1JON9Y&t=1725s) |
| [Power BI: (Vertriebs-) Regionen in Azure Maps](https://www.youtube.com/watch?v=CvaOkO37HMU) | 2026-01-01 | kernaussagen+zeitstempel | [00:02](https://www.youtube.com/watch?v=CvaOkO37HMU&t=2s) · [24:49](https://www.youtube.com/watch?v=CvaOkO37HMU&t=1489s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [48:46](https://www.youtube.com/watch?v=lZvpCBMKASM&t=2926s) · [50:35](https://www.youtube.com/watch?v=lZvpCBMKASM&t=3035s) · [52:08](https://www.youtube.com/watch?v=lZvpCBMKASM&t=3128s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [49:58](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=2998s) |
| [Daten-WG Thinkers Talk n61](https://www.youtube.com/watch?v=KMk1k5uCLZU) | 2025-04-01 | nur-zeitstempel | [1:02:10](https://www.youtube.com/watch?v=KMk1k5uCLZU&t=3730s) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=tool%3Aazure-maps
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=tool%3Aazure-maps&f=tool%3Aazure-maps
