# Die Treppe und die Wolke

> Scrollytelling in sieben Akten: wie eng Schulbildung, Intelligenz und Einkommen in Deutschland zusammenhängen, was Mittelwerte gegenüber dem Median verdecken, wer in der Verdienststatistik fehlt und warum Erfolgsgeschichten von Abbrechern nichts über Abbrecher sagen. Mit Quellen, Belegstufen und offenem Modell.

- **Quelle:** https://datenwgknowledgekitchen.com/schlau-gebildet-reich-story.html
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Extrahiert aus:** `schlau-gebildet-reich-story.html` (Text aus `schlau-gebildet-reich/story_template.html`) · Stand 24.11.2026
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/schlau-gebildet-reich-story.html — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwünscht.
- **Hinweis für Agenten:** Diese Markdown-Fassung enthält den Text der Story. Die Diagramme gibt es nur in der HTML-Fassung. Kennzeichnung der Belege: [A] amtliche Statistik, [B] Metaanalyse oder Studie mit deutschen Daten, [C] Studie aus einem anderen Land, [M] eigene Modellrechnung.
- **Reproduzierbarkeit:** `schlau-gebildet-reich/scripts/build_story.py` rechnet das Modell mit festem Startwert und setzt die Kennzahlen als Platzhalter in den Text. Veröffentlichte Werte stehen in `schlau-gebildet-reich/data/quellen.json`.

Wer einen höheren Abschluss hat, verdient im Schnitt mehr. Wer in Intelligenztests besser abschneidet, auch. Diese Story zeigt für Deutschland, wie eng die Zusammenhänge sind, was ein Mittelwert neben dem Median verdeckt und wen weder die Statistik noch die Erfolgsgeschichte zeigt.

Aus einer Treppe wird beim Hinsehen eine Wolke. Die Treppe sind die Durchschnitte je Abschluss, die jedes Jahr in den Nachrichten stehen. Die Wolke sind die einzelnen Menschen dahinter.

**Was gemessen ist:** Verdienste, Vermögen, Arbeitslosigkeit und Armutsgefährdung stammen aus der amtlichen Statistik. Die Zusammenhänge mit Intelligenz stammen aus Metaanalysen und Einzelstudien. Jede Zahl trägt eine Belegstufe: [A] amtliche Statistik, [B] Metaanalyse oder Studie mit deutschen Daten, [C] Studie aus einem anderen Land, kleine oder nicht zufällige Stichprobe, Arbeitspapier.

**Was gerechnet ist:** Einen frei verfügbaren deutschen Datensatz mit Testleistung, Abschluss und Verdienst je Person gibt es nicht. Wo einzelne Menschen zu sehen sind, ist es eine Modellbevölkerung [M]. Sie trifft die amtliche Verdienstverteilung und die Mediane der Abschlussgruppen. Die Stärke der Zusammenhänge ist aus den Studien übernommen und damit eine Annahme. Das Modell steht am Ende offen.

**Was „Intelligenz“ hier heißt:** die Leistung in einem Test, auf der IQ-Skala mit Mittel 100. Sie hängt von Schule, Elternhaus und Tagesform mit ab und ist kein Maß für den Wert eines Menschen.

**Wer schreibt:** Michael Tenner, Power-BI-Berater (Daten-WG). Recherche und Umsetzung mit einem KI-Agenten; jede Zahl wurde an der genannten Quelle abgerufen. Die Story fasst veröffentlichte Zahlen zusammen und rechnet nach, was aus ihnen folgt. Sie ersetzt keine Fachveröffentlichung.

## Auf einen Blick

- **× 2,8** Verdienst mit Promotion gegenüber ohne Berufsabschluss, Mittelwerte, Vollzeit [A]
- **0,2 bis 0,3** Korrelation von Testleistung und Einkommen. Das sind rechnerisch 4 bis 9 % der Unterschiede [B]
- **40 %** der überdurchschnittlich Getesteten verdienen im Modell weniger als den Median [M]
- **64 von 100** Vollzeitbeschäftigten verdienen weniger als den Mittelwert [A] [M]
- **× 3,1** Mittelwert geteilt durch Median beim Nettovermögen der Haushalte [A]
- **21,3 %** Arbeitslosenquote ohne Berufsausbildung, mit akademischer Ausbildung 3,3 % [A]

*Akt 1*

## Die Treppe

**1 · Sechs Stufen.** Im April 2025 verdienten Vollzeitbeschäftigte ohne beruflichen Abschluss im Schnitt **3.432 Euro** brutto im Monat, mit Berufsausbildung 4.125 Euro, mit Promotion **9.476 Euro**. Der Meisterbrief (5.405 Euro) liegt knapp vor dem Bachelor (5.289 Euro). [A]

**2 · Faktor 2,8.** Zwischen der untersten und der obersten Stufe liegt das 2,8-Fache. So steht die Treppe jedes Jahr in den Nachrichten, und so weit stimmt sie. Über ein Erwerbsleben gerechnet kam das Institut für Arbeitsmarkt- und Berufsforschung auf rund 1,1 Millionen Euro ohne Ausbildung und 2,3 Millionen Euro mit Hochschulabschluss (Entgelte von 2008 bis 2010). [B]

**3 · Was die Treppe zeigt und was nicht.** Jede Stufe ist ein **Mittelwert**. Gezählt ist nur, wer in Vollzeit angestellt ist. Sonderzahlungen fehlen. Wer arbeitslos ist, in Teilzeit arbeitet oder selbstständig ist, steht auf keiner Stufe. Und ein Mittelwert sagt nicht, wie weit die Menschen auf einer Stufe auseinanderliegen. Beides kommt in den Akten 4, 5 und 7.

*Akt 2*

## Die Wolke

**1 · Kein Zusammenhang.** 1.500 simulierte Vollzeitbeschäftigte. Links-rechts die Testleistung, unten-oben der Bruttojahresverdienst. Die Verteilung der Verdienste entspricht der amtlichen von 2025: Median 54.066 Euro, ein Prozent über 219.110 Euro. [A] In diesem ersten Bild haben Testleistung und Verdienst nichts miteinander zu tun. Die Linie zeigt den mittleren Verdienst je Testleistung, sie liegt flach. [M]

**2 · r = 0,2: die Metaanalyse.** Die größte Zusammenfassung von Längsschnittstudien kommt für Intelligenz und Einkommen auf eine Korrelation von **0,20** (31 Studien, 58.758 Personen, überwiegend USA). In den Studien mit der saubersten Anlage sind es 0,23. [B] Die Linie steigt. Die Wolke bleibt eine Wolke.

**3 · r = 0,3: deutsche Daten.** Eine deutsche Längsschnittstudie hat Intelligenz mit zwölf Jahren gemessen und das Einkommen bis 2018 verfolgt: Korrelation 0,28 beim Berufseinstieg, 0,26 mit 30, 0,19 mit 40 Jahren. [B] Ein US-Längsschnitt kommt auf 0,30. [C] Mit 0,3 rechnet diese Story weiter. Das ist der obere Rand der deutschen Werte.

**4 · r = 0,4: schwedische Register.** Für 59.387 schwedische Männer mit Musterungstest und Lohndaten aus dem Register liegt die Rangkorrelation bei **0,40**. [C] Das ist der höchste Wert unter den hier ausgewerteten Studien. Für Deutschland gibt es eine verwandte Zahl: Eine Standardabweichung mehr Rechenkompetenz geht mit 23,5 % mehr Stundenlohn einher. [B]

**5 · Was r = 0,3 für Einzelne heißt.** Bei r = 0,3 hängen rechnerisch 9 % der Unterschiede im Verdienstrang mit der Testleistung zusammen, 91 % nicht. **40 %** der Personen mit überdurchschnittlicher Testleistung verdienen weniger als den Median, und ebenso viele mit unterdurchschnittlicher verdienen mehr. Von den Personen mit einem Wert über 130 liegen 23 % unter dem Median. [M]

*Akt 3*

## Das Dreieck

**1 · Intelligenz und Bildung.** Der engste der drei Zusammenhänge: Intelligenz und erreichter Bildungsstand korrelieren mit **0,56** (59 Studien, 84.828 Personen). [B] Mit Schulnoten sind es 0,54 (240 Stichproben, 105.185 Schülerinnen und Schüler). [B] Beide Werte sind um Messfehler korrigiert, die Rohwerte liegen bei 0,48 und 0,44.

**2 · Bildung und Einkommen.** Damit die Mediane der drei Abschlussgruppen so weit auseinanderliegen, wie die Bundesagentur für Arbeit sie misst, braucht das Modell eine Korrelation von **0,53** zwischen Bildungsneigung und Verdienstrang. [M] Gemessen ist: Ein Bildungsjahr mehr geht in Deutschland mit 9,5 % mehr Stundenlohn einher. [B]

**3 · Der direkte Weg ist schmal.** Intelligenz und Einkommen: 0,2 bis 0,3. Rechnet man im Modell den Abschluss heraus, bleibt für die Testleistung eine Korrelation von 0,01 mit dem Verdienst. [M] Die deutsche Längsschnittstudie kommt zu einem ähnlichen Ergebnis: Bildung vermittelt praktisch den gesamten Effekt der Intelligenz im Kindesalter. [B] Im Sozio-oekonomischen Panel bringt eine Standardabweichung mehr im Test bei Männern rund 4 % mehr Lohn, bei gleicher Tätigkeit 2 %. [B]

**4 · Der Pfeil zeigt in beide Richtungen.** Wer besser abschneidet, bleibt länger in der Schule. Aber die Schule hebt auch die Testleistung: um etwa **3,4 IQ-Punkte je Bildungsjahr**, je nach Studienanlage 1 bis 5 (42 Datensätze, 615.812 Personen). [B] Ein Teil der Korrelation von 0,56 ist also Folge der Bildung und nicht ihre Ursache.

**5 · Die vierte Größe.** Von 100 Kindern aus Akademikerfamilien beginnen **79** ein Studium, von 100 aus Familien ohne Hochschulabschluss **27**. [B] Bei gleicher Lesekompetenz und gleichen kognitiven Grundfähigkeiten hat ein Kind aus einer Facharbeiterfamilie eine 2,5-mal geringere Chance auf eine Gymnasialempfehlung der Lehrkraft. [B] Die Herkunft wirkt auf alle drei Ecken, auch auf das Einkommen (Korrelation mit 40 Jahren: 0,22). [B]

### Der Bildungstrichter in Zahlen

| von 100 Grundschulkindern erreichen | Eltern ohne Hochschulabschluss | Eltern mit Hochschulabschluss |
|---|---|---|
| eine Schule, die zur Hochschulreife führt | 46 | 83 |
| den Studienanfang | 27 | 79 |
| den Bachelor | 20 | 64 |
| den Master | 11 | 43 |
| die Promotion | 2 | 6 |
Quelle: Stifterverband und McKinsey mit Daten des DZHW. [B] Der ifo-Chancenmonitor kommt mit dem Mikrozensus 2022 auf ein ähnliches Bild: 25,3 % Gymnasialbesuch, wenn kein Elternteil Abitur hat, 72,6 %, wenn beide es haben. [B] In der Lesestudie IGLU 2021 brauchte ein Kind aus der oberen Dienstklasse 510 Punkte für eine Gymnasialempfehlung mit 50 % Wahrscheinlichkeit, ein Kind aus einer Facharbeiterfamilie 559 und ein Kind un- und angelernter Arbeiter 575. [B]

Wer die Treppe als „Intelligenz zahlt sich aus“ liest, überspringt deshalb zwei Schritte: Der Abschluss hängt nicht nur an der Testleistung, und die Testleistung hängt nicht nur am Kind.

*Akt 4*

## In den Stufen

**1 · Dieselben Personen, nach Abschluss.** Die 1.500 Modellpersonen aus Akt 2, jetzt in den drei Gruppen der Entgeltstatistik: 9 % ohne beruflichen Abschluss, 66 % mit anerkanntem Berufsabschluss, 25 % mit akademischem Abschluss. [A] Jede Stufe der Treppe ist in Wahrheit ein breites Band. [M]

**2 · Die Mediane.** Die Bundesagentur für Arbeit misst für Vollzeitbeschäftigte Medianentgelte von **3.133 Euro** ohne Abschluss, 4.069 Euro mit Berufsabschluss und **6.146 Euro** mit akademischem Abschluss im Monat (Ende 2025, mit Sonderzahlungen). [A] Auf diese Abstände ist das Modell eingestellt. Der Faktor zwischen unten und oben beträgt hier 2,0. Die Treppe aus Akt 1 kam auf 2,8, weil sie Bachelor, Master und Promotion trennt und Mittelwerte statt Mediane zeigt.

**3 · Die Stufen überlappen.** Gemessen, nicht modelliert: **14,1 %** der Beschäftigten mit Berufsabschluss verdienen über 6.000 Euro im Monat, also etwa so viel wie die mittlere Person mit akademischem Abschluss oder mehr. 15,7 % der Akademikerinnen und Akademiker liegen bei höchstens 4.000 Euro und damit unter dem Median der Gruppe mit Berufsabschluss. Von den Beschäftigten ohne Abschluss verdienen 23,9 % über 4.000 Euro. [A] Das Modell kommt an denselben Stellen auf 17,2, 18,1 und 18,7 %. [M]

*Akt 5*

## Median gegen Mittelwert

**1 · Die Person in der Mitte.** Hundert Vollzeitbeschäftigte, nach Verdienst aufgestellt. Die Person in der Mitte verdiente 2025 **54.066 Euro** brutto im Jahr, Sonderzahlungen eingerechnet. Das ist der Median: Die Hälfte hat mehr, die Hälfte weniger. Die unteren zehn liegen bei höchstens 33.828 Euro, die oberen zehn bei mindestens 100.719 Euro. [A]

**2 · Der Mittelwert liegt höher.** Der Mittelwert beträgt **64.441 Euro**, das 1,19-Fache des Medians. [A] Zwischen den veröffentlichten Perzentilen interpoliert, verdienen rund **64 von 100** weniger als diesen Durchschnitt. [M] Der Mittelwert ist die Zahl, die sich ergibt, wenn man alles gleich verteilt. Für die typische Person steht der Median.

**3 · Person 100.** Dasselbe Bild mit einer Achse, auf die auch die letzte Säule passt. Ins oberste Prozent gehört, wer mindestens **219.110 Euro** verdient, das 4,1-Fache des Medians. [A] Im Modell verdient dieses eine Prozent im Schnitt rund 285.000 Euro und erhält 4,4 % der gesamten Verdienstsumme. Nur so kommt der amtliche Mittelwert heraus. [M] Die letzte Säule zieht den Durchschnitt aller hundert nach oben, die 99 davor bemerken sie nicht.

**4 · Beim Vermögen ist der Abstand größer.** Beim Verdienst liegt der Mittelwert 1,19-mal über dem Median. Beim Nettovermögen der Haushalte ist es das **3,1-Fache**: Mittelwert 324.800 Euro, Median 103.200 Euro. Den vermögendsten zehn Prozent gehören 54 % des Nettovermögens. [A]

**5 · Vermögen nach Abschluss.** Haushalte, deren Hauptperson keinen beruflichen Abschluss hat, besitzen im Mittel 69.600 Euro. Der Median dieser Gruppe liegt bei **6.000 Euro**. Wenige vermögende Haushalte ohne Abschluss heben den Durchschnitt auf das 12-Fache dessen, was der typische Haushalt der Gruppe hat. [A] Wer mit diesem Mittelwert argumentiert, beschreibt die Ausreißer.

*Akt 6*

## Ganz oben

**1 · Die Frage.** Wenn Testleistung und Verdienst zusammenhängen: Stehen dann ganz oben die mit den höchsten Werten? Die graue Fläche zeigt die Testleistung aller Modellpersonen. [M]

**2 · Das oberste Prozent bei r = 0,3.** Bei r = 0,3 liegt das oberste Prozent der Verdienste im Mittel bei **112**. 20 % dieser Personen haben eine Testleistung unter 100, 10 % eine über 130. [M] Das oberste Prozent ist klüger als der Durchschnitt, aber es ist keine Auswahl der Klügsten.

**3 · Bei r = 0,4.** Mit dem schwedischen Wert aus Akt 2 rückt das oberste Prozent auf **116**, und 12 % liegen unter 100. [M] Das wäre die Erwartung, wenn der Zusammenhang über die ganze Verdienstskala gleich stark wäre.

**4 · Gemessen: oben wird es flach.** In den schwedischen Registerdaten steigt die Testleistung mit dem Lohn nur bis etwa **60.000 Euro** im Jahr. Darüber bleibt sie bei rund einer Standardabweichung über dem Mittel stehen. Das oberste Prozent liegt bei +0,86 Standardabweichungen, auf der IQ-Skala etwa 113, und schneidet etwas schlechter ab als die Gruppe direkt darunter. [C] Das ist weniger, als das Modell bei r = 0,4 erwartet. Nur Männer, nur Schweden.

### Was oben stattdessen zählt

Für Deutschland gibt es keine Daten zur Testleistung von Spitzenverdienern. Es gibt aber Daten dazu, woher große Vermögen kommen. Unter den Millionärinnen und Millionären sind nach Stellung im Beruf 73 % selbstständig. 31 % sind Frauen, 6 % leben in Ostdeutschland. [B] In einer Befragung von 130 Hochvermögenden nannten 40 % Unternehmertum als wichtigsten Grund ihres Vermögens, 35 % Erbschaft oder Schenkung und 10 % ein Gehalt. [C] Die Hälfte aller Erbschafts- und Schenkungssummen geht an die reichsten zehn Prozent der Begünstigten. [B]

In den USA korreliert der IQ mit dem Einkommen mit 0,30, mit dem Nettovermögen nur mit 0,16. [C] Je weiter man nach oben schaut, desto weniger erklären Testleistung und Abschluss, und desto mehr erklären Eigentum, Selbstständigkeit und Familie.

*Akt 7*

## Die Unsichtbaren

Survivorship Bias heißt: Man zieht Schlüsse aus denen, die übrig geblieben sind, und übersieht die anderen. In diesem Thema passiert das zweimal. Die Verdienststatistik zählt nur, wer eine Vollzeitstelle hat. Und die Erfolgsgeschichte erzählt nur, wer es nach oben geschafft hat.

**1 · Wer auf der Treppe fehlt.** Von 100 Menschen zwischen 25 und 64 Jahren mit niedrigem Bildungsstand sind **37,5** nicht erwerbstätig, mit mittlerem 16,7, mit hohem 11,6. [A] Die Treppe aus Akt 1 vergleicht also unten eine Auswahl von gut sechs Zehnteln der Gruppe mit oben fast neun Zehnteln. Der wahre Abstand zwischen den Gruppen ist größer als der Abstand zwischen den Stufen.

**2 · Arbeitslosigkeit.** Ohne abgeschlossene Berufsausbildung lag die Arbeitslosenquote 2025 bei **21,3 %**, mit betrieblicher oder schulischer Ausbildung bei 3,6 %, mit akademischer bei 3,3 %. [A] Beim Verdienst trennt der Abschluss um den Faktor 2,8, bei der Arbeitslosigkeit um den Faktor 6,5.

**3 · Armutsgefährdung.** Armutsgefährdet waren 2025 **29,1 %** der Menschen mit niedrigem Bildungsstand, 15,2 % mit mittlerem und 9 % mit hohem. [A] Im Abschlussjahr 2025 verließen 64.900 Jugendliche die Schule ohne Ersten Schulabschluss, 8,4 % aller Abgänge. [A] Über diese Menschen wird selten eine Geschichte erzählt.

## Die Geschichte, die erzählt wird

Erzählt wird gern vom Schul- oder Studienabbrecher, der ein Unternehmen aufgebaut hat. Solche Menschen gibt es. Aber eine Geschichte entsteht aus dem Ausgang, und zum Ausgang „ist gescheitert“ gibt es selten ein Porträt. Wer aus den erzählten Fällen auf alle Abbrecher schließt, rechnet mit einer Stichprobe, in der die übrigen fehlen. Ein Blick auf die, die oben angekommen sind:

- **85,5 %** der Start-up-Gründerinnen und -Gründer haben einen Hochschulabschluss, 18,8 % eine Promotion [C]
- **93 + 6 %** der DAX-Vorstände haben einen Universitäts- oder Fachhochschulabschluss, 28 % sind promoviert [C]
- **54 %** der Millionärinnen und Millionäre haben die Hochschulreife, in der unteren Vermögenshälfte 19 % [C]
- **91,1 %** von 11.745 US-Führungskräften, Richtern und Milliardären haben ein College besucht [C]
Unter den Millionärinnen und Millionären der DIW-Stichprobe hat niemand die Schule ohne Abschluss verlassen. In der unteren Vermögenshälfte sind es 5,7 %. [C]

Die Ausreißer nach oben gibt es trotzdem, und sie lassen sich zählen: **91.451** Vollzeitbeschäftigte ohne beruflichen Abschluss verdienen mehr als 6.000 Euro im Monat. Das sind 4,8 % ihrer Gruppe. 44,7 % derselben Gruppe verdienen höchstens 3.000 Euro. Mit akademischem Abschluss liegen 52,3 % über 6.000 Euro. [A] Jede einzelne dieser 91.451 Geschichten ist wahr. Als Aussage über die Gruppe taugt der Median: 3.133 Euro.

Gegründet wird auch ohne Abschluss, und zwar häufig: 28 % aller Existenzgründungen des Jahres 2025 kamen von Menschen ohne Berufsabschluss, 34 % von Menschen mit Hochschulabschluss. [B] Die Abbrecher-Geschichte handelt aber nicht von diesen Gründungen, sondern von den wenigen, die sehr groß wurden. Sie ist wahr für die Person, von der sie handelt, und sagt nichts über die Gruppe, aus der die Person kommt.

## Was bleibt

- **Die Treppe stimmt, aber sie beschreibt Durchschnitte.** Zwischen den Stufen liegt der Faktor 2,8. Innerhalb jeder Stufe liegen die Verdienste weit auseinander, und die Stufen überlappen.
- **Intelligenz und Einkommen hängen schwach zusammen.** Bei 0,2 bis 0,3 bleibt für Einzelne fast alles offen. Der Weg läuft weitgehend über den Abschluss.
- **Der Abschluss hängt nicht nur an der Testleistung.** Bei gleicher Leistung entscheidet die Herkunft mit, und Schule hebt die Testleistung selbst.
- **Der Median beschreibt die typische Person, der Mittelwert die Summe.** Beim Verdienst liegen sie 1,19-fach auseinander, beim Vermögen 3,1-fach, bei Haushalten ohne Abschluss 12-fach.
- **Ganz oben erklärt Testleistung wenig.** In Schweden hört der Anstieg bei etwa 60.000 Euro auf. Große Vermögen kommen aus Unternehmen und Erbschaften.
- **Zwei Gruppen fehlen im Bild.** Unten die, die keine Vollzeitstelle haben. Oben die, die keine Befragung erreicht. Und in den Erfolgsgeschichten alle, bei denen es nicht geklappt hat.

## Was diese Daten nicht sagen

- Sie sagen nichts über einzelne Menschen und nichts über den Wert von Menschen. Alle Zusammenhänge gelten für große Gruppen.
- Sie belegen keine Ursache. Korrelationen zwischen Testleistung, Abschluss und Einkommen entstehen auch durch Elternhaus, Gesundheit, Wohnort, Beruf und Zufall.
- Die Werte für Intelligenz und Einkommen stammen überwiegend aus den USA und aus Schweden. Für Deutschland gibt es eine Längsschnittstudie und Kompetenzmessungen bei Erwachsenen, aber keine Registerdaten.
- Die Metaanalysen berichten um Messfehler korrigierte Werte. Die Rohwerte sind kleiner (Intelligenz und Bildung 0,48, Intelligenz und Einkommen 0,16).
- Verdienst ist nicht Einkommen. Die amtlichen Zahlen sind Bruttoverdienste von Angestellten. Selbstständige, Kapitalerträge, Renten und Transfers fehlen.
- Die Quellen grenzen Bildung verschieden ab: beruflicher Abschluss (Verdienste, Arbeitslosigkeit) oder Bildungsstand nach internationaler Einteilung (Erwerbstätigkeit, Armut). Dort zählen Meister und Techniker zum hohen Bildungsstand.
- Die Stichjahre unterscheiden sich: Verdienste 2025, Vermögen 2023, Millionärsstudie 2019, Bildungstrichter mit Geburtsjahrgängen 1992 bis 1998.

## Transparenz: Messung und Modell

| Was die Story zeigt | Herkunft |
|---|---|
| Treppe (Akt 1), Mediane und Überlappung der Gruppen (Akt 4), Median, Mittelwert und Perzentile (Akt 5), Vermögen, Erwerbstätigkeit, Arbeitslosigkeit, Armut (Akt 7) | [A] amtlich, unverändert übernommen |
| Korrelationen und Effektgrößen im Text | [B] [C] aus den genannten Studien |
| Punkte in Akt 2 und 4, Linie in Akt 2, Anteile über und unter dem Median, Testleistung im obersten Prozent (Akt 6) | [M] Modellbevölkerung |
| Säulen zwischen den veröffentlichten Perzentilen, Verdienst von Person 100 (Akt 5) | [M] Interpolation und Annahme über den oberen Rand |

### Das Modell

**Verdienstverteilung.** Bruttojahresverdienst von Vollzeitbeschäftigten 2025. Stützstellen sind die veröffentlichten Perzentile 10, 30, 50, 90 und 99. Dazwischen ist der Logarithmus des Verdienstes linear im Normalwert des Rangs interpoliert. Unter dem 10. Perzentil gilt die Steigung des ersten Abschnitts, mindestens aber 20.000 Euro (Mindestlohn 2025 bei 30 Wochenstunden). Über dem 99. Perzentil folgt ein Pareto-Ausläufer mit dem Exponenten 4,34. Er ist so gewählt, dass der Mittelwert der ganzen Verteilung dem amtlichen Mittelwert entspricht. Zur Probe: Für das 80. Perzentil nennt das Statistische Bundesamt „rund 80.000 Euro“, das Modell ergibt 81.400 Euro.

**Drei Größen je Person.** Testleistung, Bildungsneigung und Verdienstrang sind gemeinsam normalverteilt (Gauß-Kopula). Korrelation Testleistung und Bildungsneigung: 0,56 (Metaanalyse). Korrelation Testleistung und Verdienstrang: 0,2, 0,3 oder 0,4 (Annahme, begründet in Akt 2), sonst 0,3. Korrelation Bildungsneigung und Verdienstrang: 0,53. Dieser Wert ist nicht übernommen, sondern so bestimmt, dass die Mediane der drei Abschlussgruppen im Verhältnis zum Gesamtmedian möglichst gut zu den Medianentgelten der Bundesagentur passen.

**Gruppen.** Die Bildungsneigung wird nach den Anteilen der Vollzeitbeschäftigten mit bekanntem Abschluss geschnitten: 9 % ohne beruflichen Abschluss, 66 % mit anerkanntem Berufsabschluss, 25 % mit akademischem Abschluss.

| Gruppe | Median im Modell | Ziel aus der Statistik |
|---|---|---|
| ohne beruflichen Abschluss | 38.360 € | 40.168 € |
| mit anerkanntem Berufsabschluss | 51.693 € | 52.168 € |
| mit akademischem Abschluss | 74.798 € | 78.798 € |
**Probe.** Die Bundesagentur veröffentlicht je Abschlussgruppe, wie viele Beschäftigte in sechs Entgeltklassen liegen. Diese Werte gehen nicht in das Modell ein und eignen sich deshalb als Prüfung. Anteil der Gruppe bis zur genannten Grenze, gemessen und im Modell an derselben Stelle relativ zum Median:

| bis … Euro im Monat | 2.000 | 3.000 | 4.000 | 5.000 | 6.000 |
|---|---|---|---|---|---|
| ohne Abschluss, gemessen | 7 % | 45 % | 76 % | 90 % | 95 % |
| ohne Abschluss, Modell | 10 % | 50 % | 81 % | 93 % | 97 % |
| Berufsabschluss, gemessen | 3 % | 19 % | 48 % | 73 % | 86 % |
| Berufsabschluss, Modell | 2 % | 19 % | 49 % | 70 % | 83 % |
| Hochschulabschluss, gemessen | 1 % | 6 % | 16 % | 31 % | 48 % |
| Hochschulabschluss, Modell | 0 % | 4 % | 18 % | 36 % | 53 % |
**Umfang.** 400.000 Personen für die Kennzahlen, die ersten 1.500 davon in den Diagrammen. Fester Startwert 20261124, der Lauf ist wiederholbar. Der Code liegt im Repository unter schlau-gebildet-reich/scripts/ , die veröffentlichten Werte unter schlau-gebildet-reich/data/quellen.json .

### Was das Modell nicht kann

- Es kennt keine Herkunft, kein Geschlecht, kein Alter, keine Branche und keine Region. Alle diese Größen stecken im Rest.
- Es unterstellt, dass der Zusammenhang über die ganze Skala gleich stark ist. Die schwedischen Daten zeigen, dass das am oberen Rand nicht stimmt.
- Die Breite der Bänder in Akt 4 ist eine Folge der Annahmen. Die Probe oben zeigt, wie weit sie von den gemessenen Entgeltklassen abweicht.
- Die Gruppen entstehen durch harte Schnitte an einer einzigen angenommenen Größe. Aussagen über die Testleistung einzelner Abschlussgruppen lässt das Modell deshalb nicht zu, und die Story macht keine.
- Der Verdienst über dem 99. Perzentil ist eine Annahme über die Form. Gesichert ist nur, dass der Mittelwert stimmt.

### Sensitivität

| Annahme für Testleistung und Verdienstrang | 0,2 | 0,3 | 0,4 |
|---|---|---|---|
| überdurchschnittlich getestet, Verdienst unter dem Median | 44 % | 40 % | 37 % |
| Testleistung über 130, Verdienst unter dem Median | 32 % | 23 % | 15 % |
| Testleistung über 130, mittlerer Verdienst | 68.254 € | 76.737 € | 86.075 € |
| oberstes Verdienstprozent, mittlere Testleistung | 108 | 112 | 116 |
| oberstes Verdienstprozent, Testleistung unter 100 | 29 % | 20 % | 12 % |
| Korrelation Testleistung und Verdienstrang bei gleichem Abschluss | −0,13 | 0,01 | 0,15 |
Der negative Wert bei 0,2 zeigt, dass die drei Korrelationen nicht ganz zusammenpassen. Bei 0,56 zwischen Testleistung und Bildung und 0,53 zwischen Bildung und Verdienst müsste die Korrelation von Testleistung und Verdienst bei mindestens 0,29 liegen, damit eine höhere Testleistung bei gleichem Abschluss nicht mit weniger Verdienst einhergeht. Die Werte stammen aus verschiedenen Ländern, Jahrzehnten und Stichproben und sind unterschiedlich um Messfehler korrigiert. Auch deshalb rechnet die Story mit 0,3.

## Quellen

Alle Quellen wurden am 24.11.2026 abgerufen. Wo eine Zahl nicht am Original, sondern an einer Arbeitspapier-Fassung oder einer Handreichung geprüft ist, steht das dabei.

- [A] Statistisches Bundesamt (2026): Verdienste in vielen Ausbildungsberufen im Handwerk unter dem Durchschnitt. Pressemitteilung Nr. 103, März 2026. Verdiensterhebung April 2025. [destatis.de](https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/03/PD26_103_62.html) · Mittelwerte, Vollzeit, ohne Sonderzahlungen. Durchschnitt aller Vollzeitbeschäftigten im April 2025 (4.784 Euro) aus der Destatis-Tabelle „Bruttomonatsverdienste im Stichmonat“.
- [A] Statistisches Bundesamt (2026): Mittlerer Bruttojahresverdienst lag 2025 bei 54 066 Euro. Pressemitteilung Nr. 113, April 2026. [destatis.de](https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_113_621.html) · Vollzeit, einschließlich Sonderzahlungen, Beschäftigungen mit mindestens sieben Arbeitsmonaten. Veröffentlicht sind das 10., 30., 50., 90. und 99. Perzentil sowie der Mittelwert.
- [A] Statistik der Bundesagentur für Arbeit (2026): Sozialversicherungspflichtige Bruttomonatsentgelte (Jahreszahlen), Stichtag 31.12.2025, Tabelle 3.1. [statistik.arbeitsagentur.de](https://statistik.arbeitsagentur.de/Statistikdaten/Detail/202512/iiia6/beschaeftigung-entgelt-entgelt/entgelt-dwolk-0-202512-xlsx.xlsx?__blob=publicationFile) · Sozialversicherungspflichtig Vollzeitbeschäftigte der Kerngruppe, ohne Auszubildende, Entgelt einschließlich Sonderzahlungen. Anteile an den Entgeltklassen sind aus den Fallzahlen der Tabelle gerechnet. Bei 7,5 Prozent ist der Abschluss unbekannt; sie sind in den Gruppenanteilen nicht enthalten.
- [A] Statistik der Bundesagentur für Arbeit (2026): Qualifikationsspezifische Arbeitslosenquoten, Jahreszahlen 2025. [statistik.arbeitsagentur.de](https://statistik.arbeitsagentur.de/DE/Statischer-Content/Statistiken/Themen-im-Fokus/Berufe/AkademikerInnen/Allgemeiner-Teil/1-7-Arbeitslosigkeit.html) · Arbeitslose bezogen auf alle zivilen Erwerbspersonen gleicher Qualifikation.
- [A] Statistische Ämter des Bundes und der Länder (2026): Internationale Bildungsindikatoren im Ländervergleich 2026, Tabellen A3.1a und A3.6a. [statistikportal.de](https://www.statistikportal.de/sites/default/files/2026-09/Internationale_Bildungsindikatoren_im_Laendervergleich_2026.pdf) · 25- bis 64-Jährige, 2025, Erstergebnis des Mikrozensus. Bildungsstand nach ISCED: Meister und Techniker zählen zum hohen Bildungsstand.
- [A] Statistische Ämter des Bundes und der Länder (2026): Gefährdung durch Armut, Tabelle AR3.0, Endergebnisse EU-SILC 2025. [statistikportal.de](https://www.statistikportal.de/de/sbe/ergebnisse/einkommen-armutsgefaehrdung-und-soziale-lebensbedingungen/gefaehrdung-durch-armut) · Personen ab 16 Jahren, Bildungsstand nach ISCED.
- [A] Statistisches Bundesamt (2026): Pressemitteilung Nr. 384, November 2026, Abgänge allgemeinbildender Schulen im Abschlussjahr 2025. Quote: Autor:innengruppe Bildungsberichterstattung (2026): Bildung in Deutschland 2026, Kapitel D8. [destatis.de](https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/11/PD26_384_213.html) · Der Anteil an allen Abgängen 2025 ist selbst gerechnet. Die Quote von 8 Prozent der gleichaltrigen Bevölkerung gilt für das Abgangsjahr 2024.
- [A] Deutsche Bundesbank (2025): Vermögen und Finanzen privater Haushalte in Deutschland: Ergebnisse der Vermögensbefragung 2023. Monatsbericht April 2025, mit Tabellenanhang. [bundesbank.de](https://publikationen.bundesbank.de/publikationen-de/berichte-studien/monatsberichte/monatsbericht-april-2025-954594?article=vermoegen-und-finanzen-privater-haushalte-in-deutschland-ergebnisse-der-vermoegensbefragung-2023--954598) · Befragung, Nettovermögen je Haushalt. Die Werte nach beruflicher Bildung beziehen sich auf die Referenzperson des Haushalts.
- [B] Strenze, T. (2007): Intelligence and socioeconomic success: A meta-analytic review of longitudinal research. Intelligence 35(5), 401–426. [doi.org](https://doi.org/10.1016/j.intell.2006.09.004) · Überwiegend Studien aus den USA. Die Werte 0,56, 0,43 und 0,20 sind um Messfehler korrigiert; unkorrigiert und nach Stichprobengröße gewichtet sind es 0,48, 0,36 und 0,16.
- [B] Deutschmann, Becker & Wu (2025): Occupational Success Across the Lifespan. Journal of Intelligence 13(3), 32. [doi.org](https://doi.org/10.3390/jintelligence13030032) · Deutsche Längsschnittstudie BIJU: Intelligenz mit etwa 12 Jahren (1991), Bruttomonatseinkommen bis 2018.
- [B] Hanushek, Schwerdt, Wiederhold & Woessmann (2015): Returns to skills around the world: Evidence from PIAAC. European Economic Review 73, 103–130. [doi.org](https://doi.org/10.1016/j.euroecorev.2014.10.006) · Geprüft an der Arbeitspapier-Fassung des ifo Instituts (2014). Vollzeitbeschäftigte von 35 bis 54 Jahren, Bruttostundenlohn, Erhebung 2011/12.
- [B] Heineck, G. & Anger, S. (2010): The returns to cognitive abilities and personality traits in Germany. Labour Economics 17(3), 535–546. [doi.org](https://doi.org/10.1016/j.labeco.2009.06.001) · Sozio-oekonomisches Panel 1991 bis 2006. Zahlen aus der Arbeitspapier-Fassung (SOEPpapers 124).
- [B] Roth, Becker, Romeyke, Schäfer, Domnick & Spinath (2015): Intelligence and school grades: A meta-analysis. Intelligence 53, 118–137. [doi.org](https://doi.org/10.1016/j.intell.2015.09.002) · Korrigierter Wert 0,54; unkorrigiert 0,44.
- [B] Ritchie, S. J. & Tucker-Drob, E. M. (2018): How Much Does Education Improve Intelligence? A Meta-Analysis. Psychological Science 29(8), 1358–1369. [doi.org](https://doi.org/10.1177/0956797618774253) · Je nach Studiendesign 1,2 bis 5,2 Punkte je Bildungsjahr.
- [B] Stifterverband & McKinsey (2021/2022): Vom Arbeiterkind zum Doktor; Hochschul-Bildungs-Report 2020, Abschlussbericht. [stifterverband.org](https://stifterverband.org/download/file/fid/10426) · Bis zum Studienanfang Geburtsjahrgänge 1992 bis 1998 (Daten des DZHW), danach Datenstand 2019, keine echte Kohorte.
- [B] McElvany u. a. (Hrsg.) (2023): IGLU 2021. Lesekompetenz von Grundschulkindern im internationalen Vergleich und im Trend über 20 Jahre. Waxmann, Kapitel 11. [tu-dortmund.de](https://ifs.ep.tu-dortmund.de/storages/ifs-ep/r/Downloads_allgemein/Handreichung_Presse_IGLU.pdf) · Geprüft an der Presse-Handreichung der Herausgeber (Tabelle 11.1), nicht am Berichtsband.
- [B] Wößmann, Freundl, Pfaehler, Schoner & Tsaberiaba (2026): Der ifo-Chancenmonitor. ifo Schnelldienst digital 5/2026. [dphv.de (Kopie)](https://www.dphv.de/wp-content/uploads/2026/04/chancenmonitor.pdf) · Mikrozensus 2022, Kinder von 10 bis 18 Jahren. Ohne Kontrolle der Leistung.
- [B] Schröder, Bartels, Göbler, Grabka & König (2020): MillionärInnen unter dem Mikroskop. DIW Wochenbericht 29/2020, 511–521. [diw.de](https://www.diw.de/documents/publikationen/73/diw_01.c.793783.de/20-29.pdf) · Individuelles Nettovermögen Erwachsener 2019. Befragung, ergänzt um eine Zusatzstichprobe Hochvermögender und eine Reichenliste.
- [C] Schröder u. a. (2020): Improving the coverage of the top-wealth population in the Socio-Economic Panel. SOEPpapers 1084. [diw.de](https://www.diw.de/documents/publikationen/73/diw_01.c.790677.de/diw_sp1084.pdf) · Arbeitspapier mit vorläufigen Gewichten. Erfasst ist der Schulabschluss, nicht der Hochschulabschluss.
- [C] Ströing, Grabka & Lauterbach (2016): Hochvermögende in Deutschland. DIW Wochenbericht 42/2016, 999–1006. [diw.de](https://www.diw.de/documents/publikationen/73/diw_01.c.545209.de/16-42-1.pdf) · 130 Interviews, nicht repräsentativ.
- [B] Baresel u. a. (2021): Hälfte aller Erbschaften und Schenkungen geht an die reichsten zehn Prozent aller Begünstigten. DIW Wochenbericht 5/2021, 63–71. [doi.org](https://doi.org/10.18723/diw_wb:2021-5-1)
- [B] KfW Research (2026): KfW-Gründungsmonitor 2026, mit Tabellenband. [kfw.de](https://www.kfw.de/PDF/Download-Center/Konzernthemen/Research/PDF-Dokumente-Gründungsmonitor/KfW-Gründungsmonitor-2026.pdf) · Bevölkerungsbefragung, alle Existenzgründungen des Jahres 2025.
- [C] Hirschfeld, Gilde & Walk (2026): Deutscher Startup Monitor 2026. Bundesverband Deutsche Startups. [startupverband.de](https://startupverband.de/media/file/rs-deutscherstartupmonitor2026) · Online-Befragung ohne Zufallsstichprobe, 1.803 Datensätze.
- [C] Odgers (2026): 13. DAX-Vorstandsreport 2026. [odgers.com](https://www.odgers.com/media/lkxofoqw/dax-vorstandsreport-2026.pdf) · Auszählung der 252 Vorstandsmitglieder zum Stichtag 27.03.2026 durch eine Personalberatung.
- [C] Keuschnigg, M., van de Rijt, A. & Bol, T. (2023): The plateauing of cognitive ability among top earners. European Sociological Review 39(5), 820–833. [doi.org](https://doi.org/10.1093/esr/jcac076) · Schwedische Registerdaten, nur Männer, Musterungstest mit 18 bis 19 Jahren, Lohn im Alter von 35 bis 45 Jahren. 0,40 ist eine Rangkorrelation.
- [C] Zagorsky, J. L. (2007): Do you have to be smart to be rich? The impact of IQ on wealth, income and financial distress. Intelligence 35(5), 489–501. [doi.org](https://doi.org/10.1016/j.intell.2007.02.003) · USA, Längsschnitt NLSY79, Befragte 2004 im Alter von 33 bis 41 Jahren.
- [C] Wai, J. & Rindermann, H. (2017): What goes into high educational and occupational achievement? Education, brains, hard work, networks, and other factors. High Ability Studies 28(1), 127–145. [doi.org](https://doi.org/10.1080/13598139.2017.1302874) · USA. Die Restgruppe mischt „kein College“ und „keine Angabe“; der Anteil ohne College liegt also höchstens bei knapp 9 Prozent.
- [B] Schmillen, A. & Stüber, H. (2014): Bildung lohnt sich ein Leben lang. IAB-Kurzbericht 1/2014. [iab.de](https://doku.iab.de/kurzber/2014/kb0114.pdf) · Entgelte 2008 bis 2010, nicht an die Preise von heute angepasst, Löhne nur bis zur Beitragsbemessungsgrenze.
