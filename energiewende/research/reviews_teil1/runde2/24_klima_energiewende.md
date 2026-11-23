# Nachprüfung Teil 1 · Rolle 24 · Klima- und Energiewende-Sicht, zweite Lesung

Auftrag: `energiewende/agents/briefs/P6-E_nachpruefung.md` · Regeln: `energiewende/agents/REGELN.md`,
`energiewende/TRANSPARENZ.md` v0.2 · Stand 23.11.2026 · geschrieben von einem Agenten (Opus), der an
Recherche, Freigabe v1/v2 und Bau nicht beteiligt war. Aus der ersten Runde gelesen: nur
`04_erneuerbaren_expertin.md` und `05_klimaaktivist.md`.

**Gelesen:** `energiewende-1-story.html` und `energiewende-1-belege.html` (Stand Commit a84d50f),
gerendert mit Playwright/Chromium über `python3 -m http.server` bei 1280 px und 390 px, Text nach
vollständigem Durchscrollen und mit allen `<details>` geöffnet. Keine Anfrage an fremde Hosts, kein
horizontales Scrollen. Dazu `docs/03_teil1_freigabe.md` (v2), `data/teil1_data.json` und zum
Nachschlagen die Originale unter `quellen/raw/` (R21-Erklärung, ZEW, ISE 2021). Kein neuer Abruf,
deshalb kein Manifest.

## 1. Urteil in fünf Zeilen

1. Die Überarbeitung hat fast alle Befunde der Rollen 04 und 05 sauber umgesetzt: Unsicherheit zeigt jetzt in beide Richtungen, die Nutzenseite von ISE 2021 und Ariadne steht auf der Belegseite, der falsche „aufrechnen“-Satz ist weg, die 109 Tage und R21s 1,4-Billionen-Batterierechnung stehen mit ihren Einschränkungen da.
2. Dafür ist an drei Stellen etwas zugunsten von R21 hinzugekommen oder weggefallen, das die Belege nicht tragen: Die Prämissen der Reihe (Klimawandel real, CO₂ soll sinken) stehen nicht mehr auf der Seite; R21 wird beim Klimaschutz nur mit dem beruhigenden Satz zitiert, nicht mit der im selben Papier erwogenen „Pause bei der Klimapolitik“; und Akt 1 räumt R21 ohne Einschränkung ein, die Mehrkosten schüfen „nichts Neues“.
3. Strukturell bleibt eine Schieflage: elf nummerierte Kästen („R21 hat recht“, „Mehrkosten können zu niedrig sein“), keiner „können zu hoch sein“; die Gegenrichtung steckt in Akt 5.3 und im unnummerierten Klimakasten, in der Story ohne Zahl.
4. Instrumentalisiert wird das Klima nirgends; Dringlichkeit (Klimaziele, Emissionslücke, Emissionen bis zum ersten Kernkraftblock) kommt weiterhin nicht vor und ist als offene Entscheidung ausgewiesen.
5. Zitieren würde ich die Seite; als freigabereifen Entwurf würde ich sie erst nach den drei kritischen Punkten ansehen, die alle mit je einem Satz zu beheben sind.

## 2. Befunde nach Gewicht

### Kritisch

**K1 · Die Prämissen stehen nicht mehr auf der Seite**

- *Fundstelle:* Story, Ende der Lesehilfe: „Die Prämissen der Reihe stehen im README des Repositorys.“ (`energiewende-1-story.html` Z. 369). Belegseite: keine Prämissen. Suche nach „voraussetzen“, „Klimawandel ist“, „menschengemacht“, „IPCC“ im gerenderten Text beider Seiten und in `teil1_data.json`: kein Treffer.
- *Problem:* Die erste Fassung hatte einen Kasten „Was wir voraussetzen: Der Klimawandel ist real und menschengemacht; der Ausstoß von CO₂ soll sinken. Energie ist eine …“ (`git show 6b316fe:energiewende-1-story.html`, Z. 325–326); Rolle 05 hat ihn ausdrücklich gelobt. Beim Neubau aus dem Datensatz ist er verschwunden, vermutlich weil er keine Aussage im Datensatz hatte. `TRANSPARENZ.md` Abschn. 1 verlangt: „Jedes Stück nennt am Anfang, was es als gegeben setzt … Wer die Prämissen nicht teilt, soll das vor der ersten Zahl wissen.“ Ein Verweis auf eine Datei im Repository erfüllt das nicht. Folge für meine Rolle: Die Seite enthält jetzt keinen einzigen Satz mehr, dass CO₂ sinken soll — eine Seite, die R21 sechsmal recht gibt und den Klimaschutz nur in einem unnummerierten Kasten nennt, verliert damit ihren Bezugsrahmen. Die Richtung des Fehlers: zugunsten von R21 (unbeabsichtigt).
- *Beleg:* README, Prämissen 1–4; `TRANSPARENZ.md` Abschn. 1; Commit 6b316fe gegen a84d50f.
- *Vorschlag:* Die vier Prämissen aus dem README als Aussagen in die Freigabeliste und den Datensatz aufnehmen (Ort: beide) und im Vorspann vor der ersten Zahl rendern, wörtlich wie im README: „Der Klimawandel ist real und menschengemacht; CO₂ soll reduziert werden (IPCC AR6). Energie ist eine Hauptressource … Bezahlbarkeit und Versorgungssicherheit sind gleichrangige Ziele … Hauptpfad Erneuerbare + Speicher, mit Gegenrechnung; das Ergebnis darf gegen den Hauptpfad ausfallen.“ Das Prüfskript (Rolle 21) sollte das Vorhandensein prüfen.

**K2 · R21 wird beim Klimaschutz einseitig zitiert: die „Pause bei der Klimapolitik“ fehlt**

- *Fundstelle:* Klimakasten, Aussage K05, Story (kurz) und Belegseite (lang): „Das ist keine Aussage über den R21-Pfad. R21 will Klimaschutz über einen EU-weiten Emissionshandel erreichen („Ziel ist nicht weniger Klimaschutz“); wie viel Minderung dieser Pfad bringt, prüft Teil 6.“
- *Problem:* Das Zitat stammt aus dem Factsheet zur ETS-Reform (R21, PDF-S. 39, Z. 1450). Im Haupttext, zwei Seiten davor, schreibt R21: Die EU solle glaubwürdig androhen, „dass die EU ihren CO2-Reduktionspfad nur dann weiterverfolgt, wenn sich andere Länder ebenfalls zu klimapolitischen Aktivitäten durchringen“, und: „Angesichts der bereits erbrachten Minderungsleistungen der EU stellt sich die Frage, ob eine Pause bei der Klimapolitik moralisch zu rechtfertigen ist, nicht wirklich. Wenn dadurch erreicht werden kann, dass andere Länder ihre strategische Ausrichtung überdenken, ist sie allemal gerechtfertigt.“ Die Freigabeliste kennt die Stelle — sie steht in der Fundstelle von K05 („Druckseite 21 (Z. 1425–1433: Erwägung einer „Pause“)“) —, der Text gibt aber nur den beruhigenden Satz wieder. Auf der Belegseite erscheint das Wort „Pause“ nur in dieser Fundstellen-Zeile. Das ist genau die Quellentreue-Frage (`TRANSPARENZ.md` Abschn. 3), nur zugunsten von R21: Ein Leser schließt aus K05, R21 stehe für gleich viel Klimaschutz mit anderem Instrument. Das Papier sagt beides.
- *Beleg:* `quellen/raw/P0/Erklaerung_Expertenrat_R21_2026-11.txt`, Z. 1422–1433 (Druckseite 21) und Z. 1449–1450 (Factsheet „Reziproke Reform des EU-ETS I“), selbst gelesen. Konfidenz B, primaer_gelesen true.
- *Vorschlag:* K05 ergänzen: „R21 will Klimaschutz über einen EU-weiten Emissionshandel erreichen („Ziel ist nicht weniger Klimaschutz“). Im Haupttext schlägt R21 zugleich vor, die EU solle ihren Minderungspfad nur weiterverfolgen, wenn andere Länder mitziehen, und hält eine „Pause bei der Klimapolitik“ in diesem Fall für „allemal gerechtfertigt“ (Druckseite 21). Wie viel Minderung dieser Pfad bringt, prüft Teil 6.“ Fair gegenüber R21 bleibt das, weil die Pause als Druckmittel gemeint ist; das sollte der Satz so lassen.

**K3 · Akt 1: „Für die Mehrkosten trifft R21s Argument dagegen zu.“ geht über die Belege hinaus**

- *Fundstelle:* Story Akt 1 · Schritt 3 und Belegseite, Aussage S09 (neu in v2, Freigabe Abschn. 7.1: „für die Mehrkosten trifft das Argument zu“).
- *Problem:* R21s Argument lautet: Die Investitionen ließen „per Saldo nichts Neues entstehen“, man habe „im besten Fall … genau das, was man davor auch hatte. Die gleiche Menge Strom, die gleiche Menge Stahl“ (R21 Z. 262–268, 315–331). Für die Mehrkosten stimmt das nur im engen Sinn der Marktgüter. Was die Mehrkosten kaufen, ist ein anderes Energiesystem: weniger Ausstoß, weniger Brennstoffimporte. Genau diese Posten nennt die Bundesregierung in derselben Quelle, auf die sich S09 stützt, als „nicht gegengerechnet“ (Drs. 21/903 S. 2, auf der Seite als G10). Der Satz räumt R21 also einen Punkt ohne Einschränkung ein, den die zitierte Quelle selbst einschränkt, und widerspricht der ersten Prämisse der Reihe (K1). Er steht prominent in Akt 1, wo der Leser sein Bild der Zahl bildet.
- *Beleg:* R21 Z. 262–268, 315–331 (selbst gelesen); Drs. 21/903 S. 2 (Aussage G10 der Seite).
- *Vorschlag:* „Für die Mehrkosten trifft R21s Argument im engen Sinn zu: Sie erzeugen nicht mehr Strom oder Stahl. Was sie kaufen, sind geringerer Ausstoß und weniger Brennstoffimporte; das zählt R21 nicht, und die meisten Studien rechnen es nicht gegen (Akt 4, Klimakasten).“ Als Freigabe-Änderung von S09, mit Richtung „zulasten R21“ ins Fehlerverzeichnis, weil v2 hier zu weit gegangen ist.

### Mittel

**M1 · Die Kästen zeigen weiterhin nur zwei Richtungen**

- *Fundstelle:* Story, Abschnitt „Gegenpositionen“ und Akt-5-Schluss; Belegseite Abschn. 5: GP1–GP6 „R21 hat recht“, GP7–GP11 „Mehrkosten können zu niedrig sein“, GP12 „Eigene Fehler“, dann der Klimakasten „KK“ ohne Nummer und ohne Platz unter den Gegenpositionen (Freigabe Abschn. 6, Hinweis P085).
- *Problem:* Rolle 05 (K1, „Was fehlt“) hatte einen gleichrangigen Kasten „Mehrkosten können zu hoch gemessen sein“ verlangt. Umgesetzt ist die Gegenrichtung als Absatz in Akt 5.3 (O08) und im Klimakasten. Das ist inhaltlich gut, aber in der Gliederung bleiben 11 : 0. In der Story tragen alle fünf „zu niedrig“-Kästen eine Zahl (2,9 %, 16–235 %, 18,0 ct, 460 Mrd., 440 Mrd.); der Klimakasten nennt in der Kurzfassung nur die 280 Mrd. € Schäden, nicht die Gegenrechnung von ISE 2021 (340 bis 1.300 statt 1.000 bis 3.300 Mrd. €), die die stärkste Gegenposition zu „Mehrkosten 0,4 bis 2,9 % des BIP“ ist (`TRANSPARENZ.md` Abschn. 6: die stärkste Gegenposition je Kernaussage).
- *Vorschlag:* Entweder (a) eine Gruppe „Mehrkosten können zu hoch sein“ mit einem Kasten aus O08 und K04 (Lernkurven, ISE-2024-Effizienz, Gegenrechnung ISE 2021/Ariadne), oder (b) wenigstens die Kurzfassung des Klimakastens um die ISE-Zahl ergänzen: „Fraunhofer ISE 2021 kommt mit vermiedenen Klimaschäden auf 340 bis 1.300 statt 1.000 bis 3.300 Mrd. € Mehraufwand.“ Variante (a) braucht eine Entscheidung des Menschen, weil die Freigabe „kein 13. Kasten“ festgelegt hat (dort für R21-Treffer).

**M2 · GP7 führt ISE 2021 als „höchste Mehrkosten“ vor, ohne die Gegenrechnung derselben Studie**

- *Fundstelle:* GP7 lang: „Die Studie mit der fossilsten Referenz, Fraunhofer ISE 2021, liefert die höchsten Mehrkosten: 0,9 bis 2,9 Prozent des BIP pro Jahr.“
- *Problem:* Rolle 05, K1: „Gerade die Studie, die GP7 als die mit den ‚höchsten Werten‘ vorführt, ist die, deren eigenes Ergebnis nach Gegenrechnung am stärksten fällt.“ Die Gegenrechnung steht jetzt im Klimakasten (K04), aber nicht dort, wo die hohe Zahl steht. ISE nennt selbst 0,3 bis 1,4 % des BIP 2020 pro Jahr (ISE 2021, PDF-S. 5 und 42, im Datensatz als Abgrenzung von K04).
- *Vorschlag:* Ein Satz in GP7: „Mit vermiedenen Umweltkosten nennt dieselbe Studie 340 bis 1.300 Mrd. € (siehe Klimakasten).“

**M3 · Der Vorspann endet mit R21s Punkt, die Nutzenseite fehlt dort ganz**

- *Fundstelle:* Story, Vorspann, dritter Absatz: „Teurer als nötig kann der eingeschlagene Weg trotzdem sein: Zwei der gelesenen Studien sehen Einsparungen von mehreren hundert Milliarden Euro, wenn anders gesteuert wird …“
- *Problem:* Der Satz ist belegt (DIHK S. 12; ZEW bei „identical target achievement“, ZEW Executive Summary und Modellteil). Aber der Vorspann, den laut Entscheidung „Länge von Teil 1“ viele nur lesen werden, enthält damit einen Satz zugunsten von R21 und keinen zur Gegenrichtung. Zudem fehlt, dass die ZEW-Zahl für die EU-27 gilt (die Belegseite sagt es in R12).
- *Vorschlag:* Ergänzen: „Keine der Mehrkosten-Zahlen enthält vermiedene Klimaschäden; zwei Studien, die sie gegenrechnen, kommen deutlich niedriger heraus (Klimakasten).“ Und „ZEW, für die ganze EU“.

**M4 · Story-Kachel Dunkelflaute: R21s 1.400 Mrd. € ohne unsere Größenordnung**

- *Fundstelle:* Story, Akt-5-Schluss, Kachel „Die Energiemenge einer Dunkelflaute hat R21 ungefähr richtig“: „R21s Batterierechnung über 1.400 Milliarden Euro passt aber nicht zur Technik der Netzplanung, und fünf Tage sind nicht der schwerste Fall“.
- *Problem:* Rolle 04, K2 ist auf der Belegseite vollständig behoben (R09a, R09b mit 90–150 Mrd. €, R09c mit Drittel und Inselbetrieb). In der Story steht aber nur die große Zahl; der Leser erfährt nicht, wie weit sie danebenliegt, und „fünf Tage sind nicht der schwerste Fall“ ohne Zusatz klingt nach „noch mehr Batterien“.
- *Vorschlag:* Kurzfassung: „… passt nicht zur Technik der Netzplanung; mit Wasserstoffturbinen und Kavernen liegt die Absicherung grob bei 90 bis 150 Mrd. € (Setzung, Teil 2 rechnet nach).“

**M5 · Dringlichkeit fehlt weiterhin**

- *Fundstelle:* beide Seiten; offene Entscheidung O-5 („Gesetzliche Klimaziele und CO₂-Budget im Prolog (P052, Klasse C): nicht entschieden; keine Aussage in v2“).
- *Problem:* Wie Rolle 05, M3. Nach dem Wegfall der Prämissen (K1) ist es schärfer: Die Seite nennt weder das Ziel (Netto-Null 2045) noch die Lücke (UBA, Projektion 2030 −62,6 % statt −65 %), noch dass ein erster Kernkraftblock frühestens 2040, im mittleren Fall 2047 käme und bis dahin der Strom anders erzeugt werden muss. Das CO₂-Budget ist laut README eines von vier Kriterien für „tragfähig“. Zugleich steht die Kernkraft-Zeitachse auf der Seite, die Zeitachse der Emissionen nicht.
- *Vorschlag:* Entscheidung O-5 treffen. Minimal: ein Satz in der Prämisse („Gesetzlich gilt Netto-Treibhausgasneutralität bis 2045“) und einer im Kernkraft-Absatz: „Bis dahin muss der Strom aus anderen Quellen kommen; was das für den Ausstoß heißt, rechnet Teil 6.“ Die UBA-Werte liegen geprüft im Repo (Dossier 04; von Rolle 05 am Original nachgelesen).

**M6 · R17: „Sie tragen das Papier auch ohne die Billionen-Zahl.“ ist eine unbelegte Wertung zugunsten von R21**

- *Fundstelle:* „Was Teil 1 nicht zeigt“, beide Seiten, Aussage R17.
- *Problem:* Der Satz bewertet R21s übrige Argumente als tragfähig, im selben Absatz, der sagt, Teil 1 prüfe sie nicht. Belegt ist nur, dass R21 sie vorbringt.
- *Vorschlag:* „Das Papier stützt sich auch auf sie, nicht nur auf die Billionen-Zahl.“

### Klein

- **k1 · Zweitquellenregel bei R21s Batteriekostensatz.** Belegseite R09a: 200.000 €/MWh „Wert: B“, obwohl R21 ihn „aus einer Studie, die wir nicht gelesen haben“ übernimmt; nach `TRANSPARENZ.md` Abschn. 2 höchstens C. Die daraus gebildeten 1.400 Mrd. € tragen C. Vorschlag: Kostensatz auf C, oder die Regel für R21s eigene Rechnungen erklären.
- **k2 · Spalte „Richtung“ im Fehlerverzeichnis mehrdeutig.** Story, „Wo wir uns korrigieren mussten“: Die Richtung meint den alten Fehler (z. B. „beide Richtungen mit Belegen (O04, O08, O09) — zulasten der Energiewende“). Wer sie als Richtung der Korrektur liest, versteht das Gegenteil. Vorschlag: Spaltenkopf „Richtung des alten Fehlers“.
- **k3 · GP8 Beharrung ohne Emissionsfolge.** Beharrung heißt auch höherer Ausstoß und damit höhere Schäden, die in den +16 bis +235 % nicht stecken (Rolle 05, M5, zweiter Teil). Ein Halbsatz genügt.
- **k4 · Konsolenfehler.** Story bei 1280 px: 22 Meldungen „<rect> attribute width: A negative value is not valid“ (Werte −24 bis −75,1), bei 390 px keine. Gehört zu Rolle 21/22; hier nur vermerkt, weil das Prüfkriterium „keine Konsolenfehler“ damit verletzt ist.
- **k5 · Klimakasten, Kurzfassung.** „das ist keine Aussage über den R21-Pfad“ steht ohne den Folgesatz und liest sich in der Story wie eine Entwertung des Kastens. Mit K2 umformulieren.

## 3. Was gegenüber der ersten Fassung besser ist

| Befund erste Runde | Stand jetzt |
|---|---|
| 04 K1 · 109 Tage ohne Einordnung | behoben: R09c mit „rund einem Drittel“, „ohne Austausch mit den Nachbarn“, Transkript als Quelle, Konfidenz C |
| 04 K2 · R21s 1,4 Bio. € fehlte | auf der Belegseite behoben (R09a, R09b, E01 mit „weit unter R21s Batterierechnung“); Story nur teilweise (M4) |
| 04 M1, 05 K3 · Unsicherheit nur nach oben | behoben: O09 „zu niedrig oder zu hoch“, O08 mit Lernkurven (KfW 555, ISE PV-Report), ISE-2024-Effizienz und dem Satz zu vermiedenen Klimaschäden; Grafik zweiseitig, ohne Pfeillänge als Betrag |
| 04 M2 · Wind ohne Gegenbeleg | behoben: Gestehungskosten Wind an Land unter neuen Gaskraftwerken, mit Vorbehalt Netz/System |
| 04 M3 · BRH-Überschrift | behoben: „Gestehungskosten zeigen nicht die ganzen Kosten“ |
| 04 M4 · EEG-Konto | behoben: in „Was Teil 1 nicht zeigt“, mit KTF seit Juli 2022, Ansatz 10,6 Mrd., Abhängigkeit vom Großhandelspreis, „verschiebt, wer zahlt“ |
| 04 k1, 05 M5 · GP8-Einschränkung | behoben (O10 verworfen, echte Einschränkung zum Basiswert) |
| 04 k2 · Preisverfall bei Modulen | behoben (GP1: 22,3 → 8 Mrd. €) |
| 04 k3 · WindGuard | behoben (als nicht gelesen benannt) |
| 05 K1 · Nutzenseite fehlt | teilweise: „ausdrücklich ohne Umweltkosten“ in Akt 5.2, K04 mit 340–1.300 Mrd. € und Ariadne im Klimakasten; fehlt in GP7 und in der Story-Kurzfassung (M1, M2) |
| 05 K2 · „nicht aufrechnen“ | behoben: nur noch „dürfen nicht addiert werden“, plus Gegenrechnung der Studien |
| 05 M1 · Bundesregierung halbiert | behoben (G10 mit Klimaschäden und Importabhängigkeit) |
| 05 M2 · ZEW ohne Abgrenzung | behoben (EU, Konsumverlust, ohne vermiedene Klimaschäden; R21s 850 als nicht belegt); R21s eigener Satz zu 2039 fehlt weiter |
| 05 M4 · B gegen C bei Zweitquellen | behoben: 280–900 Mrd. € jetzt C, wie PwC |
| 05 k1 · Klimakasten schwer zu finden | teilweise: eigener Platz nach GP12, Verweis zur Langfassung; keine Kachel in Akt 5 |
| 05 k2 · Haltungsvermerk nur bei DIW | behoben |
| 05 k4 · „Hier hat R21 recht“ beim Industrierückgang | behoben: Kachel „Die Zahl stimmt“ |

Positiv eigens: Die Seite nennt R21s Zugeständnis „Das ist korrekt.“, gibt das Kapitalstock-Argument richtig wieder und setzt V14 „Das Geld liegt im Wie der Energiewende, nicht in ihrem Abbruch“ — fair gegenüber R21 und zugleich keine Einladung zum Abbruch. Keine Formulierung spielt Klimaschäden gegen Kosten aus.

## 4. Was weiterhin fehlt

- **Prämissen und Klimaziele auf der Seite** (K1, M5).
- **R21s vollständige Klimaposition** (K2) und R21s eigener Satz, dass bei linearer Fortführung „ab 2039 keine neuen Zertifikate mehr“ ausgegeben würden (Factsheet F-1; Rolle 05, M2) — die nötige Einordnung, dass der ETS-Pfad selbst schnelle Minderung verlangt.
- **Wo der Umbau heute steht:** Anteil der Erneuerbaren an der Bruttostromerzeugung (2024 rund 56 %, Eurostat, im Repo aufbereitet; Rolle 04). Kein Treffer auf beiden Seiten.
- **Weitere Nutzenposten:** vermiedene Importe und Gesundheitskosten (DIW 2025, laut Prüfbericht 02; Pro-Position, Original nicht von mir gelesen). Nicht in der Freigabe.
- **Die PwC-Pointe im Vorspann:** Laut DIW sind die 13,3 Bio. € die Kosten von „Weiter wie bisher“, der Klimaschutzpfad liegt mit 13,2 Bio. € fast gleich (Akt 3.2, C). Die Story sagt es, der Vorspann nicht; wegen Konfidenz C eine Entscheidung des Menschen, solange PwC ungelesen ist.
- **Flut-Vergleich** (offene Entscheidung O-6) und Größenordnung der Klimakosten im BIP-Maßstab (Rolle 05; für Teil 6).

## 5. Belege, die ich selbst nachgeschlagen habe

| Aussage | Quelle | Fundstelle | Konfidenz | primaer_gelesen |
|---|---|---|---|---|
| R21 erwägt Bedingung für den Minderungspfad und hält eine „Pause bei der Klimapolitik“ für „allemal gerechtfertigt“ | R21-Erklärung, Nov. 2026; `quellen/raw/P0/Erklaerung_Expertenrat_R21_2026-11.txt` | Druckseite 21, Z. 1422–1433 | B | true |
| „Ziel ist nicht weniger Klimaschutz“ | ebd. | Factsheet ETS I, Z. 1449–1450 | B | true |
| Kapitalstock „um, nicht auf“; „genau das, was man davor auch hatte“; „per Saldo nichts Neues“ | ebd. | Z. 262–268, 315–331 | B | true |
| ZEW: 824 Mrd. € zusätzliche Senkung, Wohlfahrt ohne vermiedene Klimaschäden, bei gleicher Zielerreichung, EU-27 | ZEW (Rausch) 2026; `quellen/raw/P0/zew_rausch_2026_carbon_pricing_ets2.pdf` | Executive Summary; Modellteil („identical target achievement“, Textfassung Z. 530) | B | true |
| ISE 2021: mit rund 2.000 Mrd. € vermiedenen Umweltkosten 340 Mrd. € bis 1.300 Mrd. € Netto-Mehraufwand | Fraunhofer ISE 2021; `quellen/raw/P1-02/ise_wege_update2045_2021.pdf` | PDF-S. 5, 41–42 | B | true |
| Prämissen-Kasten der ersten Fassung | `energiewende-1-story.html` in Commit 6b316fe | Z. 325–326 | – | – |
| Konsolenfehler negative `rect`-Breiten | eigener Playwright-Lauf, Story 1280 px | 22 Meldungen | – | – |
