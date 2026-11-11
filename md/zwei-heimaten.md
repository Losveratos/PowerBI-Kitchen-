# Zwei Heimaten. Eine Welt.

> Köln und der Oberspreewald-Lausitz-Kreis liegen in Deutschland weit auseinander: Rang 28 und Rang 307 von 400 Kreisen (Eurostat 2023; nach dem neueren Rechenstand der Statistischen Ämter Rang 27 und 300). In der Welt stehen beide weit oben: Rund 86 % bzw. rund 98 % der Menschheit leben in Regionen mit niedrigerem BIP pro Kopf, und selbst der letzte deutsche Kreis (Südwestpfalz) liegt bei rund 73 %. Deutschland steht heute so weit oben wie 2000 (92 % → 93 % der Menschheit in Ländern mit niedrigerem BIP pro Kopf), sein Vorsprung vor dem Weltdurchschnitt ist aber vom knapp 4-Fachen auf das knapp 3-Fache geschrumpft.

- **Quelle:** https://datenwgknowledgekitchen.com/zwei-heimaten.html
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Extrahiert aus:** `zwei-heimaten.html` (Text aus `wohlstand-story/story_template.html`) · Stand 2026-11-11
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/zwei-heimaten.html — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwünscht.
- **Hinweis für Agenten:** Diese Markdown-Fassung enthält den Text der Story. Grafiken (Deutschlandkarte, Kurve der Menschheit, Quadrate, Balken), die Schätzfrage und der Vergleich eigener Orte („Wo steht deine Heimat?“, teilbar als `zwei-heimaten.html#vs=<ID>,<ID>` mit den IDs aus der CSV des Atlas) gibt es nur in der HTML-Fassung; die wichtigsten Zahlen stehen unten als Tabelle.
- **Datengrundlage:** [Wohlstandsatlas](https://datenwgknowledgekitchen.com/md/wohlstandsatlas.md): Weltbank WDI 2024, IWF WEO, Eurostat (NUTS-3 2023), Regionaler Preisindex 2022 (BBSR/IW). Regionen = Anteil laut Statistikamt × Landeswert 2024 (hochgerechnet).
- **Reproduzierbarkeit:** `wohlstand-story/scripts/build_story_data.py` rechnet alle Zahlen aus den Atlasdaten, `check_numbers.py` prüft jede Zahl im Text.

## Kennzahlen

Genaue Rechenwerte. Im Text der Story stehen sie gerundet (ganze Prozent, Int.$ mit drei geltenden Stellen), weil sich kleine Kreise nicht auf den Zehntelpunkt messen lassen.

| Kennzahl | Köln | Oberspreewald-Lausitz |
|---|---|---|
| BIP pro Kopf (KKP, Int.$) | 114.620 | 51.305 |
| zu regionalen Preisen (Int.$) | 104.770 | 55.645 |
| Konsum der Haushalte pro Kopf, verteilt nach verfügbarem Einkommen (Int.$, RB Köln / Brandenburg) | 38.688 | 35.925 |

Anteil der Menschheit in Regionen mit niedrigerem BIP pro Kopf, je Ebene des Atlas:

| Ebene | OSL | Köln |
|---|---|---|
| Länder | 85,5 % | 99,3 % |
| Bundesländer | 85,1 % | 98,8 % |
| Kreise (feinste Ebene) | 85,6 % | 98,3 % |
| Metropolregionen | 85,8 % | 98,5 % |

Weltdurchschnitt 24.505 Int.$, mittlerer Mensch 15.265 Int.$ (Kerala); zwischen OSL und Köln liegen Regionen mit 12,7 % der Menschheit.

Wie eng es ist: 113 andere Kreise liegen höchstens 10 % von OSL entfernt (Rang 248 bis 361 bei ±10 %); verfügbares Einkommen je Einwohner 2023 (VGR der Länder): Köln 28.764 Euro, OSL 25.139 Euro, Faktor 1,14; umgerechnet 39.391 und 34.427 Int.$, in der Welt 86,4 % und 83,5 %; 179 Kreise liegen beim Einkommen höchstens 10 % von OSL entfernt.

Abgleich mit den Originalquellen: BIP pro Kopf aller 400 Kreise aus Eurostat 2023 und Weltbank nachgerechnet, größte Abweichung zum Atlas 0,004 %, alle Ränge gleich (Bericht: `wohlstand-story/data/sources/ABGLEICH.md`).

Deutschland unter den 187 Ländern mit durchgehender Reihe (reales BIP pro Kopf, Int.$ von 2021; Anteile und Durchschnitt mit der Bevölkerung des jeweiligen Jahres gewichtet; Taiwan fehlt): Platz 22 im Jahr 2000, Platz 21 im Jahr 2024; das 3,9-Fache des Weltdurchschnitts 2000, das 2,9-Fache 2024; reales BIP pro Kopf seit 2019 −0,5 %, USA +9,5 %, Polen +18,3 %.


## Zwei Orte, aus denen ich komme

Ich komme aus Köln und aus dem Oberspreewald-Lausitz-Kreis, kurz OSL, im Süden Brandenburgs. In jeder deutschen Statistik liegen die beiden weit auseinander.

Köln ist Domstadt, Medienstadt, Versicherungsstadt. OSL liegt mitten im Lausitzer Braunkohle-Revier, das gerade aus der Kohle aussteigt, und im Vergleich der deutschen Kreise steht der Kreis weit unten. Für diese Story habe ich beide Orte in den [Wohlstandsatlas](wohlstandsatlas.html) gelegt: Wirtschaftsleistung für 217 Länder und rund 6.000 Regionen weltweit, alle auf dieselbe Kaufkraft umgerechnet. Und dann gefragt, was von „weit auseinander“ übrig bleibt, wenn man nicht mehr nur auf Deutschland schaut.

Vorweg zur Währung: **Int.$** sind internationale Dollar. Ein Int.$ kauft in jedem Land so viel, wie ein US-Dollar in den USA kauft. So lassen sich Köln, Kerala und Chicago auf einer Skala vergleichen. Gemessen wird das **BIP pro Kopf**, also die Wirtschaftsleistung einer Region geteilt durch ihre Einwohner. Das ist kein Einkommen, und es hat einen Haken, zu dem ich in Akt 4 komme. Wenn ich „reicher“ oder „ärmer“ schreibe, meine ich immer genau das: mehr oder weniger BIP pro Kopf.

## Akt 1 · In Deutschland weit auseinander

### Zwei Punkte, 495 km

Köln im Westen, der Oberspreewald-Lausitz-Kreis (OSL) im Osten, zwischen Cottbus und Dresden. Auf der Karte ist jeder Kreis nach seiner Wirtschaftsleistung pro Kopf eingefärbt.

Das Muster kennt man: hell im Süden und Westen, dunkler im Osten, hell in den großen Städten.

### Rang 28 und Rang 307

Alle 400 Kreise der Größe nach: Köln kommt auf 115.000 Int.$ pro Kopf, Rang 28. OSL auf 51.300 Int.$, Rang 307. [B]

Das ist ein Faktor von 2,2. Der Durchschnitt Deutschlands liegt bei 74.000 Int.$, dazwischen.

### Die Rangliste ist enger, als sie aussieht

Vier von fünf Menschen in Deutschland (81 %) wohnen in einem Kreis mit höherem BIP pro Kopf als OSL. So sieht Deutschland in fast jedem Ranking aus: hier der reiche Westen, dort der Osten, der als abgehängt gilt.

Aber Rang 307 klingt weiter hinten, als es ist. In diesem Teil der Rangliste liegen die Kreise dicht beieinander: 113 andere Kreise, mehr als jeder vierte, liegen höchstens 10 % über oder unter OSL. Mit 10 % mehr stünde OSL auf Rang 248, mit 10 % weniger auf Rang 361.

Auf dem letzten Platz der 400 Kreise steht die **Südwestpfalz** mit 30.300 Int.$ pro Kopf, ein Landkreis rund um die Stadt Pirmasens. Was schätzt du: Wie viel Prozent der Menschheit leben in Regionen mit einem noch niedrigeren Wert?

## Akt 2 · Die Welt dazunehmen

### Die Mitte der Welt liegt bei 15.000 Int.$

Die Kurve stellt die ganze Menschheit in eine Reihe, vom ärmsten Ort links bis zum reichsten rechts. Jeder Mensch zählt dabei mit dem Durchschnitt seiner Region, nicht mit seinem eigenen Einkommen. Genau in der Mitte, bei 50 %, steht der mittlere Mensch: Seine Region kommt auf rund 15.000 Int.$. Das ist etwa das Niveau des indischen Bundesstaats [Kerala](wohlstandsatlas.html#IN-KL--m0--l2--z1) oder der indonesischen Provinz Ost-Java.

Der Weltdurchschnitt liegt mit 24.500 Int.$ höher, weil wenige reiche Regionen ihn nach oben ziehen. Auf die Hälfte der Menschheit, die in den ärmeren Regionen lebt, entfallen nur 16 % der Weltwirtschaft.

### OSL steht bei rund 86 %

Jetzt die Linie auf Höhe von OSL, 51.300 Int.$. Sie trifft die Kurve weit rechts: Rund 86 % der Menschheit leben in Regionen mit niedrigerem BIP pro Kopf. [B] Der Kreis, der in Deutschland auf Rang 307 steht, gehört in der Welt zum obersten Siebtel.

„Rund“, weil sich ein kleiner Kreis nicht auf den Punkt messen lässt: Mit 10 % mehr oder weniger beim Wert liegt der Anteil zwischen 83 und 88 %. Die Gegenprobe steht unter „Zum Nachprüfen“.

### Köln bei rund 98 %, dazwischen ein schmaler Streifen

Köln liegt bei rund 98 %. [B] Zwischen meinen beiden Herkunftsorten, also zwischen 51.300 und 115.000 Int.$, liegen Regionen, in denen zusammen nur knapp 13 % der Menschheit wohnen.

Was in Deutschland wie ein Graben aussieht, ist im Weltmaßstab ein schmaler Streifen ganz oben.

### Und der letzte Platz in Deutschland?

Die Südwestpfalz steht in Deutschland auf Rang 400. In der Welt liegt sie bei rund 73 %. Ganz vorn steht Wolfsburg, der Sitz von Volkswagen, bei über 99 %.

Alle 400 Kreise zusammen spannen auf der Kurve also nur gut ein Viertel auf, ganz rechts. Worüber wir in Deutschland streiten, ist die Reihenfolge am oberen Ende der Welt.

## Akt 3 · Wer reicher ist, und wer auf derselben Stufe steht

### Die Welt in 1.624 Quadraten

Jedes Quadrat steht für 5 Millionen Menschen, sortiert nach dem BIP pro Kopf ihrer Region. Markiert sind Indien, China und Afrika. Das untere Drittel sind vor allem Indien, Pakistan, Nigeria, Äthiopien und der Kongo. In der Mitte: China, Indien, Indonesien, Bangladesch. Oben China, die USA, Russland, Japan und Europa.

Deutschlands 84 Mio. Menschen wären knapp 17 Quadrate.

### Reicher als OSL: 1,1 Mrd. Menschen

In Blau alle Menschen, deren Region ein höheres BIP pro Kopf hat als OSL: 1.134 Mio., ein Siebtel der Menschheit. Am meisten in den USA (283 Mio.), dann China (120 Mio.), Deutschland, Japan, Frankreich.

Hell hervorgehoben ist China, darunter [**Shanghai**](wohlstandsatlas.html#CN-SH--m0--l2--z1) (61.900) und [**Peking**](wohlstandsatlas.html#CN-BJ--m0--l2--z1) (65.000). [B] Mit einem Vorbehalt: Der Atlas rechnet ganz China mit denselben Preisen. Rechnet man beide zu Preisen vor Ort (OSL dann 55.600 Int.$), reichen rund 11 % höhere Preise in Shanghai, und der Vorsprung ist weg. Indien hat keinen Bundesstaat über OSL.

### Auf derselben Stufe: Japan, Portugal, Polen

Hervorgehoben sind die Menschen, deren Region höchstens 10 % über oder unter OSL liegt: 379 Mio.

Auf dieser Stufe liegt der Landesdurchschnitt von [**Japan**](wohlstandsatlas.html#JPN--m0--l2--z1) (54.200), [**Portugal**](wohlstandsatlas.html#PRT--m0--l2--z1) (52.500), [**Polen**](wohlstandsatlas.html#POL--m0--l2--z1) (51.300) und [**Estland**](wohlstandsatlas.html#EST--m0--l2--z1) (50.400), dazu der US-Bundesstaat [**Mississippi**](wohlstandsatlas.html#USA-MS--m0--l2--z1) (53.000).

### Reicher als Köln: rund 100 Mio.

In Gelb, ganz oben rechts: Menschen in Regionen mit höherem BIP pro Kopf als Köln, zusammen rund 100 Mio., gut 1 % der Menschheit: Singapur, Mailand, Paris, Warschau, Hamburg, viele US-Großstädte und die russischen Öl- und Gasbezirke.

Köln steht auf der Stufe von [**Moskau**](wohlstandsatlas.html#RU-MOS--m0--l2--z1) (115.000) und zwischen [**Norwegen**](wohlstandsatlas.html#NOR--m0--l2--z1) und [**Katar**](wohlstandsatlas.html#QAT--m0--l2--z1). Moskau liegt hauchdünn davor, seine 13 Mio. Einwohner zählen deshalb zu den rund 100 Mio.

## Akt 4 · Der Haken: Was der Abstand wirklich misst

### Faktor 2,2

Der Ausgangspunkt: 115.000 gegen 51.300 Int.$ BIP pro Kopf. Aber das BIP zählt dort, wo gearbeitet wird. Die Einwohner zählen dort, wo geschlafen wird.

Das wirkt in beide Richtungen: Köln holt sich die Wirtschaftsleistung seiner Einpendler, OSL verliert die seiner Auspendler nach Cottbus, Dresden und Berlin.

### Pendler und Preise machen den Abstand kleiner

Jeden Morgen pendeln Hunderttausende nach Köln, ihre Wirtschaftsleistung zählt in der Stadt, sie selbst wohnen im Umland. Nimmt man den **Großraum Köln** als Ganzes (Köln mit Leverkusen, Rhein-Erft- und Rheinisch-Bergischem Kreis), sinkt der Wert auf 89.100 Int.$, etwa das Niveau der USA.

Dazu kommen die Preise: In Köln liegt das Preisniveau bei 109, in OSL bei 92 (Deutschland = 100). Rechnet man das heraus, wird aus Faktor 2,2 ein Faktor 1,9: 105.000 gegen 55.600 Int.$.

### Beim Einkommen rücken sie zusammen

Was bei den Haushalten ankommt, zeigt das verfügbare Einkommen je Einwohner: in Köln 28.800, in OSL 25.100 Euro im Jahr. Das ist Faktor 1,14 statt 2,2. 179 Kreise, knapp die Hälfte, liegen beim Einkommen höchstens 10 % von OSL entfernt.

Umgerechnet auf den Konsum pro Kopf, damit es zu den anderen Balken passt, sind das 39.400 gegen 34.400 Int.$. In der Welt stehen beide damit bei rund 86 und 84 %, knapp 3 Punkte auseinander. [B] Dahinter steckt auch Umverteilung: Steuern, Renten, der Finanzausgleich zwischen Bund und Ländern.

### Und die einzelnen Menschen?

Alle Zahlen bisher sind Durchschnitte von Regionen. In jeder Region gibt es Ärmere und Reichere. Ein Überschlag: Verteilt man den Konsum in jeder Region der Welt so ungleich, wie es die Statistik für ihr Land ausweist, dann steht der mittlere Mensch in OSL bei 89 %, der in Köln bei 91 % der Menschheit. In allen 20 gerechneten Varianten sind es mehr als 80 %. [C]

Auch das ärmste Zehntel in OSL hat noch mehr als 60 % der Menschheit hinter sich. Zwischen den mittleren Menschen beider Orte liegen höchstens 12 Punkte, zwischen dem ärmsten und dem reichsten Zehntel in OSL mindestens 18.

## Seit 2000 gleich weit oben, mit schrumpfendem Vorsprung

Bisher ging es um ein einziges Jahr. Für ganze Länder reicht der Atlas bis 2000 zurück, in festen Preisen. Deutschland steht heute so weit oben wie damals: Rund 93 % der Menschheit leben in Ländern mit niedrigerem BIP pro Kopf, im Jahr 2000 waren es 92 %. Unter den 187 Ländern der Reihe stand Deutschland damals auf Platz 22, heute auf Platz 21. Taiwan fehlt in der Reihe und läge heute davor.

Geschrumpft ist der Vorsprung. Im Jahr 2000 war Deutschlands BIP pro Kopf knapp 4-mal so hoch wie der Weltdurchschnitt, heute ist es knapp 3-mal so hoch. Gemessen am Land des mittleren Menschen, im Jahr 2000 war das China, ist der Abstand noch stärker gefallen. Und seit 2019 ist das reale BIP pro Kopf in Deutschland nicht mehr gewachsen, während es in den USA um knapp 10 % und in Polen um 18 % gestiegen ist.

„Immer noch oben“ stimmt also. „Mit so großem Vorsprung wie früher“ stimmt nicht.

Reales BIP pro Kopf in Int.$ von 2021 · 187 Länder mit durchgehender Reihe (98 % der Weltbevölkerung) · Weltdurchschnitt und Anteile mit der Bevölkerung des jeweiligen Jahres gewichtet (Weltbank) · logarithmische Achse

## Wir meckern auf hohem Niveau

In Deutschland trennen Köln und OSL 279 Plätze. In der Welt stehen beide ganz oben, und zwischen ihnen ist es enger, als die Rangliste aussieht.

Eng ist es an mehreren Stellen: 113 Kreise liegen höchstens 10 % von OSL entfernt, beim verfügbaren Einkommen trennt Köln und OSL Faktor 1,14 statt 2,2, und selbst im letzten der 400 Kreise ist das BIP pro Kopf höher als in den Regionen, in denen rund 73 % der Menschheit leben. Der Kreis, den Rankings „abgehängt“ nennen, steht auf dem Niveau Japans, Polens und Estlands.

Den Abstand gibt es trotzdem. Die Lausitz steckt mitten im Ausstieg aus der Braunkohle, Faktor 2,2 bleibt Faktor 2,2, und wer über den Stillstand seit 2019 klagt, hat die Zahlen auf seiner Seite. Mein Schluss ist ein anderer Maßstab: Wer in Deutschland über seinen Platz in der Rangliste klagt, klagt über einen Platz am oberen Ende der Welt. Das gilt auch für mich.

## Wo steht deine Heimat?

Tipp einen Ort ein: einen Kreis, eine Stadt, ein Bundesland, einen Bundesstaat oder ein Land. Gezeigt wird, wie viele Menschen weltweit in Regionen mit niedrigerem BIP pro Kopf leben. Mit einem zweiten Ort wird daraus dein eigener Vergleich, und den kannst du als Link weitergeben.

Zum Ausprobieren:

[Im Wohlstandsatlas weiterschauen →](wohlstandsatlas.html)

## Was diese Zahlen nicht sagen

**Regionen, keine Menschen.** Jede Prozentzahl hier ordnet Menschen nach dem Durchschnitt ihrer Region ein. In jeder Region gibt es Ärmere und Reichere, in Köln wie in Kerala. Wie viele einzelne Menschen weniger haben als jemand in OSL, sagt die Zahl nicht.

**Durchschnitt, kein Einkommen.** BIP pro Kopf ist die Wirtschaftsleistung einer Region geteilt durch ihre Einwohner. Dazu gehören Gewinne von Unternehmen und Abschreibungen, die bei keinem Haushalt ankommen.

**Arbeitsort gegen Wohnort.** Das BIP entsteht, wo gearbeitet wird. Das prägt beide Enden der deutschen Rangliste: Wolfsburg ist der Sitz von Volkswagen. Die Südwestpfalz liegt rund um Pirmasens und neben Zweibrücken, zwei kreisfreien Städten, deren Wirtschaftsleistung getrennt gezählt wird.

**Ein Preisniveau je Land.** Außer in Deutschland und den USA rechnet der Atlas jedes Land mit einem einzigen Preisniveau. Teure Städte wie Shanghai oder Moskau wirken dadurch reicher, als sie zu Preisen vor Ort wären.

**Hochgerechnet und gerundet.** Regionalwerte liegen meist bis 2023 vor und sind auf den Landeswert der Weltbank 2024 übertragen. Kennzeichen [B]. Kleine Kreise lassen sich so nicht auf den Zehntelpunkt messen, deshalb stehen im Text ganze Prozent und Werte mit drei Stellen.

**Ungleich feine Welt.** Deutschland ist in 400 Kreise zerlegt, Indien nur in 34 Bundesstaaten und Territorien, 157 Länder gar nicht. Die Gegenprobe unter „Zum Nachprüfen“ prüft deshalb nur die Länder, die der Atlas zerlegt.

**Einkommen, umgerechnet.** Der letzte Balken in Akt 4 ist das verfügbare Einkommen der beiden Kreise aus den Statistiken der Länder, über den Konsum der Haushalte in Deutschland in Int.$ umgerechnet. Der Atlas selbst kennt Haushaltswerte nur für Regierungsbezirke und Länder, die übrige Welt geht deshalb mit gröberen Werten in den Vergleich ein.

## Zum Nachprüfen

### Woher die Zahlen kommen

Alle Werte stammen aus dem [Wohlstandsatlas](wohlstandsatlas.html) der Knowledge Kitchen. Länder: Weltbank, World Development Indicators (2024), für einzelne Länder der IWF. Regionen in Europa: Eurostat (NUTS-3, meist 2023). Regionale Preisniveaus in Deutschland: Regionaler Preisindex 2022 von BBSR und IW. Weitere Länder: nationale Statistikämter, Quelle und Jahr stehen im Atlas bei jeder Region.

Gegen die Originalquellen nachgerechnet (Abruf 11.11.2026): Der Atlas gibt Eurostat richtig wieder. Das BIP pro Kopf aller 400 deutschen Kreise, aus den Tabellen nama_10r_3gdp und nama_10r_3popgdp (2023) und dem Landeswert der Weltbank neu gerechnet, weicht um höchstens 0,004 % ab, alle Ränge sind gleich. Zwölf geprüfte Länderwerte weichen ebenfalls um höchstens 0,004 % ab.

Das prüft die Rechnung, nicht die Daten: Eurostat führt für 2023 vorläufige Werte. Nach dem neueren Rechenstand der Statistischen Ämter (August 2025) weichen 25 Kreise um mehr als 5 % ab, am stärksten um 34,9 %. Köln und OSL stünden auf Rang 27 und 300, ihre Werte ändern sich um 0,0 und 1,3 %. An den Anteilen in der Welt ändert das nichts. Auch deshalb rechnet diese Story überall mit einer Toleranz von 10 %. Der Prüfbericht liegt unter wohlstand-story/data/sources/ABGLEICH.md.

Lizenzen: Eurostat und Weltbank (World Development Indicators) stellen ihre Daten unter CC BY 4.0 bereit. Die Ergebnisse der Volkswirtschaftlichen Gesamtrechnungen der Länder dürfen mit Quellenangabe weiterverwendet werden.

Die ganze Tabelle gibt es als [CSV](wohlstandsatlas/wohlstandsatlas-einheiten.csv). Jede Zahl dieser Seite entsteht per Skript aus diesen Daten (wohlstand-story/scripts/) und wird vor jeder Veröffentlichung gegen den Text geprüft.

### Wie die Prozentwerte gerechnet sind

„Rund 86 % der Menschheit leben in Regionen mit niedrigerem BIP pro Kopf“ heißt: Summe der Einwohner aller Regionen weltweit mit niedrigerem BIP pro Kopf als OSL, geteilt durch die Weltbevölkerung (8,12 Mrd.). Genau gerechnet sind es 85,6 % für OSL und 98,3 % für Köln, dazwischen 12,7 %. Regionen ohne Daten (39 Mio. Menschen) zählen im Nenner mit, nicht im Zähler.

Die Quadrate in Akt 3 sind gerundet: Jedes steht an der Stelle der Skala, an der seine Bevölkerungsmitte liegt, und jedes Land bekommt so viele Quadrate, wie es Menschen hat (auf ein Quadrat genau). Kleine Länder unter 5 Mio. Einwohnern können fehlen. Die Zahlen im Text sind exakt über alle Regionen summiert.

Gezählt wird auf der feinsten Ebene des Atlas: Kreise in Europa, Counties in den USA, Präfekturen in China, Bundesstaaten in Indien, sonst das ganze Land. Die Gegenprobe unten rechnet dasselbe auf allen vier Ebenen.

Werte in Int.$ sind wie im Atlas auf drei Stellen gerundet (Köln genau 114.620, OSL 51.305).

### Gegenprobe: Wie fest steht die Zahl?

Solche Prozentwerte hängen davon ab, wie fein man die Welt zerlegt. Auf den vier Ebenen des Atlas schwankt der Wert für OSL um weniger als einen Punkt:

Ein Beweis ist das nicht. 157 der 217 Länder gibt es im Atlas nur als Ganzes, sie sehen auf allen vier Ebenen gleich aus. Größer ist die Unsicherheit beim Wert selbst: Mit 10 % mehr oder weniger für OSL liegt der Anteil zwischen 83 und 88 %. Deshalb steht im Text „rund 86 %“ und keine Nachkommastelle.

### Der Überschlag für einzelne Menschen

Akt 4 endet mit einer Modellrechnung, keiner Messung. Für jede der 5.929 Regionen nehme ich an, dass der Konsum der Haushalte pro Kopf um den Wert der Region streut, und zwar so stark, dass alle Regionen eines Landes zusammen dessen Ungleichheit (Gini-Index aus dem Atlas, für Deutschland der jüngste Wert der Weltbank: 33,7) ergeben. Daraus entsteht eine Verteilung über alle Menschen der Welt, in die sich die Einwohner von OSL, Köln und Deutschland einordnen lassen.

Gerechnet sind 20 Varianten: mit dem BIP statt dem Konsum, mit 5 Punkten mehr oder weniger Ungleichheit, mit einer zweiten Verteilungsform. Im Text stehen nur Aussagen, die in allen 20 gleich ausgehen, jeweils mit der vorsichtigeren Grenze. Nicht dazu gehört, wie stark sich beide Orte überlappen: Mit dem BIP gerechnet liegen 5 bis 13 % der Kölner unter dem mittleren Menschen in OSL, mit dem Konsum 38 bis 49 %.

Das Modell ist eher zu gleichmäßig: Auf die ärmere Hälfte der Menschen entfallen darin 9 bis 14 % des Gesamten, Studien zur weltweiten Einkommensverteilung nennen 8 bis 9 %. Für die deutschen Kreise rechnet das Modell mit dem verfügbaren Einkommen des Kreises, für den Rest der Welt mit den gröberen Haushaltswerten des Atlas. Das Skript liegt unter wohlstand-story/scripts/person_model.py.

### Die Kennzeichen B und C

- [B] hochgerechnet: regionale Verteilung aus der Statistik eines früheren Jahres, auf den Landeswert 2024 übertragen.
- [C] grob: Der Wert gilt für eine größere Region als die genannte, oder er stammt aus einer Modellrechnung.
- Ohne Kennzeichen: Werte, die direkt aus amtlichen Landeszahlen folgen, oder einfache Rechnungen daraus.
