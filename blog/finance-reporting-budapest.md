# Eine GuV-Seite, sechs Sprossen

> Post · Konferenzvortrag · Budapest BI Forum 2026 · Von Michael Tenner · Stand November 2026 (work in progress bis zum Vortrag)
> HTML-Fassung: https://datenwgknowledgekitchen.com/finance-reporting-budapest-post.html
> Material: https://github.com/Losveratos/BI-Forum-Budapest-2026

Am 17. November 2026 spreche ich in Budapest über Finance Reporting in Power BI: ein Modell, dieselbe GuV-Seite in sechs Varianten gebaut, und eine ehrliche Antwort auf die Frage, was jede davon kostet. Hier die inhaltliche Vorschau.

## Worum es im Vortrag geht

Titel: „Finance Reporting in Power BI: One Model, Three Visual Stacks Compared", 17. November 2026, Danubius Hotel Helia, auf Englisch. Programmseite: https://budapestbi.hu/bi26/sessions/finance-reporting-in-power-bi-one-model-three-visual-stacks-compared/

Finance-Reporting stellt immer dieselben Fragen: Ist gegen Vorjahr, Plan und Forecast, Monat, YTD und Gesamtjahr, Lokal- gegen Konzernwährung. Ich zeige ein schlankes Modell, das all das beantwortet, und darauf dieselbe GuV-Seite in mehreren Bauweisen. Die drei Stacks aus dem Titel sind Core-Visuals mit SVG, Deneb und ein Custom Visual. Im Vortrag teile ich sie in sechs Sprossen auf. Das Deck wird bis zum Vortrag noch überarbeitet.

## Was wir sehen wollen: Ist, und dann ein Vergleich

Der Ist-Wert (AC) ist voll und dunkel, der Plan (PL) ein Umriss, der Vorjahreswert (PY) hellgrau, der Forecast (FC) schraffiert. Die Vergleiche laufen in der Zeit (Monate als Spalten) und in der Struktur (Gesellschaften als Balken): dasselbe Visual, einmal gedreht, mit Abweichung absolut und in Prozent daneben.

## Eine GuV ist eine Rechnung, keine Rangliste

Vier Dinge muss jeder Ansatz irgendwo lösen:

- **Hierarchie und Zwischensummen.** Der Umsatz ist die Summe seiner Kinder mit Vorzeichen.
- **Formeln.** Rohergebnis, EBITDA, Margen, Formel auf Formel.
- **Das Vorzeichen.** Eine Kostenzeile rechnet mit minus eins, zeigt positiv, und „weniger" ist günstig.
- **Zeitfenster.** Monat, YTD und Gesamtjahr aus denselben Monatszeilen, Forecast schraffiert ab dem letzten Ist-Monat.

Wo diese vier gelöst werden (DAX, Spezifikation oder Visual), entscheidet über Kosten, Wartbarkeit und darüber, wer es in zwei Jahren noch ändern kann.

## Ein Modell, vier Regeln

Das Modell beantwortet die Fragen, die Visuals zeichnen nur. Kontendimension, Faktentabelle auf Monatsebene, Datumstabelle, Kurstabelle, dünne Kennzahlen je Rolle.

1. **Monatsebene, leer statt null.** Eine 0 im November macht den November zum Ist-Monat.
2. **Das Gesamtjahr ist ein Skalar.** Je Konto, Gesellschaft und Jahr mit MAX holen, dann summieren. Ein SUM wäre zwölfmal zu groß.
3. **Das Vorzeichen-Trio in der Dimension.** Rechnen, anzeigen, bewerten.
4. **Währung und Periodenstatus ins Modell.** Umrechnung vor dem Modell; ein Flag „Actual" in der Datumstabelle, sonst treffen zehn Ist-Monate auf zwölf Planmonate.

Weil die Regeln im Modell liegen, ist der spätere Wechsel des Visuals ein Neubau der Berichtsseite und keine Migration.

## Die sechs Sprossen

Jede funktioniert. Jede bezahlt anders.

1. **Pure Power BI.** Core-Visuals, Matrix mit vorzeichenrichtigen Kennzahlen und Datenbalken. Notation nur angenähert; Copilot kann damit arbeiten.
2. **DAX only.** Abweichungsbalken als Unicode-Zeichen aus Kennzahlen. Prüfbar im Modell, aber fragile Ausrichtung und kein Skalenband.
3. **SVG-Measures und UDF.** Kennzahlen liefern SVG-Bilder für die Matrix. Handgeschrieben neben dem Paket PowerofBI.IBCS von daxlib.org (https://daxlib.org/package/PowerofBI.IBCS/). Braucht Kompatibilitätslevel 1702 und Modellkultur en-US. Grenzen: Größe, Tooltips, Export.
4. **Deneb und Vega-Lite.** Das Diagramm ist eine Spezifikation, Text in Git. Vorlagen aus dem Business Chart Builder (https://datenwgknowledgekitchen.com/business-chart-builder.html). Deneb ist von Microsoft zertifiziert; nicht jeder liest Vega.
5. **Custom Visual.** Offen: ChartKitchen und P&L Statement byDatenWG, kostenlos, selbst gepflegt; nicht über AppSource zertifiziert, daher im Service kein PDF- und PowerPoint-Export und keine Abos. Bezahlt: Zebra BI, Inforiver, graphomate, IBCS-zertifiziert, Lizenz je Leser.
6. **Fabric Apps.** Dieselben Diagramme als React-Ports. Preview, nicht in allen Regionen, Build-Berechtigung auf dem Modell nötig, noch keine Git-Synchronisierung. Gefahr: Die Logik wandert aus dem Modell in den App-Code.

Bilder zu den Sprossen 1 bis 4 und zur Seite „Plan gap" stehen in der HTML-Fassung.

## Nichts gewinnt immer, alles kostet

Kostenvergleich im Visual-Standards-Rechner (https://datenwgknowledgekitchen.com/visual-standards-rechner.html), Dreipunkt-Schätzungen, Bandbreiten statt Punktwerten. Finance-Preset (5 Autoren, 150 Leser, Lizenzanker 80 EUR, 5 Jahre, 125 EUR je Stunde): bezahltes und offenes Custom Visual gleichauf bei rund 144 EUR je Leser und Jahr, Deneb etwa das 1,2-fache, Core mit SVG das 1,8-fache. Ab etwa 176 Lesern kostet die Lizenz je Kopf im Preset mehr als der günstigste Stundenansatz.

Nur 3 von 58 Annahmen sind belegt. Lies die Bandbreite P10 bis P90, nicht den Mittelwert. Pro-, PPU- oder Fabric-Kapazität ist nicht eingerechnet.

## Die Entscheidung in vier Zahlen

- **Leser je Autor.** Hier tippt die Lizenz gegen die Stunden.
- **Lizenzpreis.** Verhandlungsgrenze im Preset: etwa 92 EUR je Nutzer und Jahr.
- **Stundensatz.** Bewertet Bau und Pflege.
- **PDF-Pflicht.** Vorstandsmappe als PDF aus dem Service oder Abos: das offene Custom Visual scheidet heute aus.

Davor: die Regeln für Vorzeichen, Gesamtjahr, Periodenstatus und Währung ins semantische Modell.

## Was im Repo liegt

https://github.com/Losveratos/BI-Forum-Budapest-2026

- das Deck,
- der Demo-Bericht als Power-BI-Projekt (PBIP) mit Modell und synthetischen Daten,
- die Reviews zum Deck,
- eine Anleitung für IBCS-UDFs in Matrix, neuer Karte und Button-Slicer.

## Ehrlich eingeordnet

Die Demo-Daten sind synthetisch (fiktiver Konzern DWG Industries, aus einem Generator mit festem Startwert). ChartKitchen byDatenWG und P&L Statement byDatenWG sind mein eigenes Projekt; meine Bewertung der Sprosse 5 ist mit Abschlag zu lesen. Die Kostenzahlen sind eine Indikation, kein Angebot. Das Material ist ein Arbeitsstand bis zum Vortrag.

IBCS® ist eine eingetragene Marke des IBCS Institute. Die Inhalte sind nicht von IBCS produziert oder zertifiziert, die Darstellung ist von IBCS inspiriert.

Fragen und Feedback: Michael Tenner, michael.tenner84@gmail.com
