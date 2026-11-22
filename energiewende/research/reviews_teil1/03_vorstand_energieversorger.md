# Review Teil 1 · Rolle 03 · Vorstand eines Energieversorgers

Review-Auftrag: `energiewende/agents/briefs/P5_reviews_teil1.md`, Rolle 03 · Stand 22.11.2026
Gegenstand: `energiewende-1-story.html`, `energiewende-1-belege.html` (gerendert mit Playwright/Chromium bei 1280 px und 390 px, lokaler Server; keine Konsolenfehler, keine Anfragen an fremde Hosts, kein horizontaler Überlauf)
Grundlage: `docs/03_teil1_freigabe.md`, `data/teil1_data.json`, Originale unter `quellen/raw/`
Blickwinkel: Netze, Finanzierung, Genehmigungen, Kapitalkosten. Ich lese die Seite als jemand, der die Investitionen, über die sie spricht, finanzieren, genehmigen lassen und über Entgelte zurückverdienen muss.

## 1 · Urteil in fünf Zeilen

1. Den Befund zur Quelle (13,8 steht nicht in der Kurzinformation, Brutto ist nicht Mehrkosten) würde ich zitieren. Er ist sauber belegt und für die öffentliche Debatte nützlich.
2. Empfehlen würde ich die Seite nur mit Vorbehalt. Bei den Mehrkosten mischt sie Größen, die in einer Bilanz nie nebeneinander stünden: Investitionsauszahlungen im Baujahr und annualisierte Kapitalkosten. Ein Satz zu den BIP-Anteilen ist schlicht falsch.
3. Wer die Energiewende bauen muss, bekommt hier „Mehrkosten nur 0,4 bis 2,9 % des BIP“ zu lesen. Kapitalbedarf, Hochlaufkurve und Entgeltwirkung fehlen dagegen, obwohl die Seite die nötigen Quellen schon gelesen hat (DIHK „Plan B“, ef.Ruhr/EWI).
4. Angreifen würde ich zwei Stellen. Der Satz, R21 komme nicht darauf, dass „mit dem Geld auch etwas gebaut wird“, gibt das Papier falsch wieder. Die GP9-Aussage „Zinsen stehen nicht darin“ verallgemeinert zu stark.
5. Insgesamt ist die Seite redlicher als fast alles, was in dieser Debatte erscheint. Aus Sicht der Praxis ist sie aber eine Buchhalter-Seite: Sie klärt die Abgrenzung und lässt die Finanzierbarkeit offen.

## 2 · Befunde

### Kritisch

**K1 · Akt 5, Schritt 2: Der BIP-Satz stimmt nicht, und die Grafik mischt Mehrinvestitionen mit Mehrkosten**

- Fundstelle: Story, Akt 5 / Schritt 2: „KfW und Prognos rechnen netto 130 bis 153 Mrd. € pro Jahr gegen fossile Referenztechnik. Als Anteil am BIP sind das 0,4 bis 2,9 % pro Jahr.“ Darüber die Grafik „Mehrkosten als Anteil am BIP 2024 pro Jahr“ mit Agora 3,4 %, KfW/Prognos 2026 netto 3,0 bis 3,5 % und KfW 2021 1,6 %.
- Problem:
  1. 130 bis 153 Mrd. € geteilt durch das BIP 2024 (4.386,94 Mrd. €) ergeben 3,0 bis 3,5 %, nicht 0,4 bis 2,9 %. Die Spanne 0,4 bis 2,9 % gehört laut Freigabe G02 und G12 nur zu G3b, den Mehrkosten nach Abzug eingesparter Energie. Der Satz bezieht „das“ aber auf alle drei zuvor genannten Studien, die KfW eingeschlossen.
  2. Agora, KfW 2021 und KfW/Prognos 2026 netto sind G3a, also Mehr*investitionen*: Auszahlungen im Baujahr, ohne Abzug eingesparter Brennstoffe. Akt 4 trennt G3a und G3b noch sauber. Akt 5 setzt beide unter eine Überschrift „Mehrkosten“. Für einen Finanzvorstand sind das zwei verschiedene Kennzahlen: Capex-Zufluss auf der einen Seite, Ergebnisbelastung bzw. Annuität plus Betrieb abzüglich Einsparung auf der anderen.
- Beleg: Freigabe G01, G02, G12 (Abgrenzung G3a/G3b). Agora 2024, PDF-S. 11–12: 147 Mrd. €/a „Klimaschutz-Mehrinvestitionen“ (G09). Prognos für KfW 2026, S. 1: 130 bis 153 Mrd. €/a netto „gegen fossile Referenztechnik“ (V09). Eigene Division: 130/4.386,94 = 3,0 %, 153/4.386,94 = 3,5 %.
- Vorschlag: Den Satz so fassen: „Als Anteil am BIP sind das 0,4 bis 2,9 % pro Jahr, wo die eingesparte Energie abgezogen ist (ISE, Ariadne), und 1,5 bis 3,5 %, wo nur zusätzliche Investitionen gezählt sind (Agora, KfW).“ Die Akt-5-Grafik nach G3a und G3b gliedern, wie in Akt 4, und mit „Mehrinvestitionen und Mehrkosten“ überschreiben.

**K2 · Akt 1, Schritt 3: R21 wird ein Argument abgesprochen, das im Papier steht**

- Fundstelle: Story, Akt 1 / Schritt 3: „Aber R21 nennt die Summe einen ‚Entzug von Wertschöpfung‘, also reinen Verlust. Dass mit dem Geld auch etwas gebaut wird, kommt nicht vor.“ Ebenso Freigabe S08.
- Problem: R21 setzt sich ausdrücklich damit auseinander, dass gebaut wird. Das Papier bestreitet nur, dass der neue Kapitalstock mehr produziert. Kapitel 3 „Baustelle Deutschland“, Druckseite 8–10: „Die hierfür nötigen Investitionen bauen den Kapitalstock um, nicht auf … Im besten Fall hat man nach der Investition genau das, was man davor auch hatte. Die gleiche Menge Strom …“ und „mit dem neuen Kapitalstock [kann] zwar im Prinzip das Gleiche produziert werden … wie mit dem alten, dies aber notwendigerweise mit höheren Kosten“. Ein Versorger kennt dieses Argument aus dem eigenen Geschäft: Eine Ersatzinvestition, die dieselbe Kilowattstunde liefert, erhöht nicht den Absatz, sondern die Kostenbasis. Die Seite stellt hier einen Strohmann auf. Das stärkere Gegenargument fehlt: Der neue Kapitalstock ersetzt laufende Brennstoffimporte. Genau deshalb unterscheiden sich G2 und G3b.
- Beleg: R21-Erklärung, Kapitel 3, Druckseite 8–10 (`quellen/raw/P0/Erklaerung_Expertenrat_R21_2026-11.pdf`, Textauszug Z. 260–335). Dossier 01, Behauptungen 33 und 36.
- Vorschlag: „R21 räumt ein, dass gebaut wird, bestreitet aber einen Ertrag: Der neue Kapitalstock liefere dieselbe Menge Strom, nur teurer. Was dabei fehlt: Er ersetzt auch Brennstoffe, die jedes Jahr neu gekauft werden müssten. Erst wenn man die abzieht, sieht man die Mehrkosten (Akt 4).“

### Mittel

**M1 · GP9 „Finanzierungskosten fehlen in den Summen“: zu pauschal, und die „Lücke“ ist zum Teil selbst gemacht**

- Fundstelle: Story, GP9: „Die Studien zählen Investitionen im Jahr, in dem gebaut wird. Zinsen stehen nicht darin.“ Einschränkung: „Wir haben keine Studie gefunden, die eine Gesamtzahl für die Kapitalkosten nennt.“ Belegseite GP9 gleichlautend.
- Problem:
  1. Für die Investitionsstudien (DIHK, Agora, KfW) stimmt der Satz. Für Ariadne, deren Mehrkosten die Untergrenze der Seite bilden, stimmt er nicht. Ariadne rechnet die Mehrkosten „als Summe aus annualisierten Kapitalkosten und Betriebskosten“. Das ISE-Modell REMod minimiert laut eigener Beschreibung „diskontierte Investitions-, Betriebs- und Verbrauchskosten“. Die Seite stellt also Werte mit und ohne Kapitalkosten nebeneinander (vgl. K1) und erklärt dann pauschal, Zinsen fehlten überall.
  2. Die angebliche Lücke ist kleiner als behauptet. Die gelesene ef.Ruhr/EWI-Studie rechnet die Netzausbaukosten mit 5,5 % WACC, 40 % Eigenkapital und 40 Jahren Abschreibung in Vollkosten und Netzentgelte um: im Basisszenario bis 2045 gegenüber 2023 +14,0 ct/kWh im gewichteten Mittel, +18,0 ct/kWh für Haushalte, +15,2 für Gewerbe und +7,0 für Industrie. Das ist keine Gesamtzahl für die Kapitalkosten der Energiewende. Es ist aber die Zahl, die beim Kunden ankommt, und sie liegt schon vor.
- Beleg: Ariadne-Zusammenfassung 2025, Abschn. Z.3, PDF-S. 5–6 (Textauszug Z. 345–415: „annualisierten Kapitalkosten und Betriebskosten“). ISE 2024, S. 11, Abschn. 2.1. ef.Ruhr/EWI 2024, Kurzfassung (Textauszug Z. 118–135), Abb. 6 mit Text (Z. 585–620) und Abschn. 4.3 (Z. 950–975) (WACC 5,5 %, EK 40 %, 40 Jahre); Auftraggeber: Netze-Gesellschaft Südwest, also selbst Netzbetreiber.
- Vorschlag: GP9 präzisieren: „Investitionsstudien zählen Auszahlungen im Baujahr, ohne Zinsen. Systemkostenstudien wie Ariadne rechnen Kapitalkosten annualisiert ein. Was beim Kunden ankommt, zeigt eine Netzstudie: Netzentgelte bis 2045 im Mittel rund 14 ct/kWh höher als 2023, mit 5,5 % Kapitalverzinsung gerechnet (eine Studie, Auftraggeber Netzbetreiber, Konfidenz B).“ Die Einschränkung umformulieren: Es fehlt eine *gesamtwirtschaftliche* Kapitalkostenzahl, nicht jede.

**M2 · Durchschnitt pro Jahr verdeckt die Hochlaufkurve. Für die Finanzierung zählt der Gipfel**

- Fundstelle: Story, Akt 4 / Schritt 3 und Akt 5 („pro Jahr“, „Mitte“) sowie die Studientabelle („pro Jahr“).
- Problem: Alle Werte sind Summe durch Jahre. Kein Finanzvorstand plant mit dem Mittel über 20 Jahre, denn Eigenkapital, Kreditlinien, Lieferkapazität und Personal müssen den Gipfel tragen. Die gelesene DIHK-Studie zeigt: Die Neuinvestitionen in Erzeugung und Netze steigen von 26 Mrd. €/a in der jüngeren Vergangenheit in den Jahren 2030 bis 2039 auf das Vierfache. Die Systemkosten liegen in dieser Dekade bei 212 bis 229 Mrd. €/a, bei ungünstigen Lernkurven bis 257 Mrd. €/a. Danach bleibt die Preisbelastung über die Abschreibungen „bis weit in die Zukunft auf einem hohen Niveau“. ef.Ruhr/EWI: Im Verteilnetz entsprechen die Ausbaukosten etwa 20 Mrd. €/a, „nahezu eine Vervierfachung der Investitionen in das Verteilnetz im Jahr 2022“. Die Story nennt keine dieser Zahlen.
- Beleg: DIHK „Plan B“, S. 30–31 mit Fn. 27. ef.Ruhr/EWI 2024, Ergebnisteil (Textauszug Z. 305–314).
- Vorschlag: In Akt 4 einen Satz mit Kurve ergänzen: „Ein Mittelwert verdeckt den Gipfel: In den 2030er Jahren verdoppeln bis vervierfachen sich die jährlichen Investitionen in Netze und Erzeugung gegenüber heute (DIHK, ef.Ruhr/EWI).“ Die volle Kurve gehört nach Teil 6, aber Teil 1 sollte nicht so tun, als sei die Last gleichmäßig verteilt.

**M3 · Der BIP-Maßstab ist für Investitionen der falsche Nenner, oder zumindest nicht der einzige**

- Fundstelle: Akt 4 / Schritt 3, Grafik „Anteil am BIP 2024 pro Jahr“ sowie die Studientabelle.
- Problem: BIP-Anteile lassen Investitionssummen klein erscheinen. Ob ein Land das finanziert, entscheidet sich an der Investitionsquote. Die Bruttoanlageinvestitionen Deutschlands lagen 2024 bei 898,3 Mrd. € (Eurostat `nama_10_gdp`, P51G, vorläufig). Daran gemessen: Agora 540 Mrd. €/a ≈ 60 %, KfW/Prognos 2026 brutto 270 bis 300 Mrd. €/a ≈ 30 bis 33 %, Mehrinvestitionen 130 bis 153 Mrd. €/a (KfW netto) und 147 Mrd. €/a (Agora) ≈ 14 bis 17 %, R21s 500 bis 690 Mrd. €/a ≈ 56 bis 77 % der gesamten Anlageinvestitionen der Volkswirtschaft. Die Abgrenzung ist nicht deckungsgleich: Studien können Güter enthalten, die in der VGR als Konsum zählen. Es ist also ein Größenordnungsvergleich (Setzung M, eigene Division). Er zeigt trotzdem, warum Praktiker 1,5 % des BIP nicht für beruhigend halten. Auch die Mehrinvestitionen allein beanspruchen etwa jeden sechsten Euro, der heute überhaupt investiert wird.
- Beleg: Eurostat `nama_10_gdp`, DE, CP_MEUR, P51G 2024 = 898.273 Mio. € (Status „p“), abgerufen 22.11.2026 über `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nama_10_gdp?geo=DE&unit=CP_MEUR&na_item=P51G&na_item=B1GQ&sinceTimePeriod=2022`, sha256 `aaaba77ec4f1beebcf55d71a262ec685293a1da84b531f7f748b1eb61a10d842`. Die Datei liegt nur im Scratch-Ordner des Reviews, weil die Rolle laut Auftrag keine Repo-Dateien anlegt. Für eine Übernahme muss sie regulär nach `quellen/raw/` und ins Manifest.
- Vorschlag: Neben dem BIP-Anteil eine zweite Spalte oder einen Satz „Anteil an den Bruttoanlageinvestitionen 2024“ aufnehmen. Den Wert vorher über die Freigabe holen.

**M4 · GP11: Die Senkung im NEP 2025 kommt aus weniger Ausbau, nicht aus billigeren Netzen**

- Fundstelle: Story, GP11, Einschränkung: „Der Entwurf des Netzentwicklungsplans 2025 senkt die Übertragungsnetzkosten wieder auf 364 bis 392 Mrd. €.“
- Problem: So gelesen hebt die Einschränkung den Kostenanstieg auf. Laut NEP-Kompaktfassung kommt die Senkung aber vor allem aus einem kleineren Umfang. Es wird nach prognostizierter Erzeugung statt installierter Leistung geplant, in Szenario A mit 60 GW statt mindestens 70 GW Offshore-Wind und vier bis sieben Offshore-Netzanbindungen weniger. Als Ursache des Anstiegs auf 440 Mrd. € nennt derselbe Text ausdrücklich „Preissteigerungen und Marktverknappung“. Die Stückkosten bleiben also hoch, es wird nur weniger gebaut. Außerdem ist der NEP 2025 ein zweiter Entwurf und von der Bundesnetzagentur noch nicht bestätigt.
- Beleg: NEP 2037/2045 (2025), 2. Entwurf, kompakt, S. 11–12 (Textauszug Z. 629–650, 710–721).
- Vorschlag: „Der Entwurf des NEP 2025 senkt die Summe auf 364 bis 392 Mrd. €, vor allem weil weniger Offshore-Anbindungen geplant werden. Als Ursache des Anstiegs nennt er Preissteigerungen und Marktverknappung. Der Entwurf ist noch nicht bestätigt.“

**M5 · Der deutlichste Praxisfehler im R21-Papier fehlt: 8,2 ct gegen 38 ct**

- Fundstelle: fehlt auf beiden Seiten. Die Suche nach „8,2 ct“ im gerenderten Text ergibt keinen Treffer.
- Problem: Factsheet B stellt für das eigene Reform-System „8,2 ct/kWh, durchschnittlicher Strompreis“ neben „38 ct/kWh, durchschnittlicher Preis für Privatverbraucher (2025)“. Damit werden Erzeugungs- bzw. Systemkosten mit einem Endkundenpreis verglichen, der Netzentgelte, Steuern, Abgaben und Vertrieb enthält. Laut Dossier 01 nennt die zugrunde liegende Studie (Quantified Carbon, über Wendland) für das reine EE-System derselben Rechnung 10,5 ct. Dieser Vergleichswert fehlt im Factsheet. Für jeden Versorger ist das der Satz im Papier, der am schnellsten fällt. Die Seite widmet zwei Schritte der Frage „Kosten oder Investitionskosten“ und lässt diesen Vergleich ungeprüft stehen.
- Beleg: R21-Erklärung, Factsheet B (PDF B-1/B-2). Dossier 01, Q4 und Behauptung 107 (Wendland 2026, S. 16: 82 €/MWh gegen 105 €/MWh). Die Quantified-Carbon-Studie selbst ist laut Dossier 01 nicht gelesen.
- Vorschlag: In Akt 5 / Schritt 1 einen Satz mit dem festgelegten Vorbehalt: „Die einzige Preiszahl des eigenen Kurses (8,2 ct/kWh) ist ein Erzeugungswert; das Papier stellt ihn dem Endkundenpreis von 38 ct gegenüber. Dieselbe Studie nennt für ein reines EE-System 10,5 ct.“ Die Zahl muss vorher in die Freigabe, die Einstufung steht noch aus.

**M6 · Kernkraft-Hinweis: Kostenbasis der Vergleichsspanne nicht angegeben**

- Fundstelle: Story, Akt 5 / Schritt 1: „Zu den Kosten gebauter westlicher Projekte wären es 372, 595 oder 868 Mrd. €“ (Setzung M), neben R21s 310 Mrd. € (6.250 €/kW).
- Problem: Die Spanne 7.500 bis 17.500 €/kW stammt aus Strommix und enthält Projektkosten *einschließlich Finanzierung* bzw. in laufenden Preisen (Flamanville 3 „inkl. Finanzierungskosten“, Hinkley Point C in laufenden Preisen). Bei R21 und Wendland steht „Baukosten“, ohne Angabe, ob Bauzinsen enthalten sind. Bei 10 bis 15 Jahren Bauzeit sind Bauzinsen kein Rundungsfehler. Wer Overnight-Kosten mit All-in-Kosten vergleicht, rechnet R21 zu teuer. Hier wird die Seite in die andere Richtung unfair, als die Leser erwarten.
- Beleg: `strommix/research/kosten_kernkraft.md`, Z. 69–71 (Overnight vs. Bauzinsen) und Tabelle Z. 109–115. R21 Factsheet B. Wendland 2026, PDF-S. 3 und 16 („Baukosten“).
- Vorschlag: Im Hinweis „Kostenbasis: Projektkosten einschließlich Finanzierung, R21 ohne Angabe“ ergänzen. In Teil 6 beide Reihen auf dieselbe Basis bringen, Overnight plus Bauzinsen mit festem WACC.

### Klein

**k1 · GP4: Die Alternative zu Batterien ist selbst unfinanziert.** Die Story schreibt „daneben Wasserstoffkraftwerke“. Laut Freigabe R09 sind das im NEP 60,6 bis 81,3 GW. Für einen Versorger ist das die eigentliche Frage der Versorgungssicherheit: Wer baut 60 bis 80 GW Kraftwerke mit wenigen Volllaststunden, und über welchen Mechanismus? Vorschlag: die GW-Zahl nennen und „Finanzierung und Brennstoff offen, vertieft in Teil 2“ anfügen.

**k2 · GP10 / O06: Die Verschiebung in den Haushalt ist nur mit dem EEG-Konto belegt.** Dass Netzkosten künftig auch über Bundeszuschüsse gedämpft werden, ist im Teil-1-Korpus nicht belegt. Sollte es in Teil 6 vorkommen, gehört es in dieselbe Rubrik. Für Teil 1 genügt der Hinweis, dass das EEG-Konto ein Beispiel ist und keine vollständige Liste.

**k3 · Netzgrafik Akt 4 / Schritt 4: Es fehlt der Hinweis auf Nominalwerte und Preisbasis.** 675, 732 und 792 Mrd. € stammen aus Studien von 2024 und 2025. Der NEP selbst zeigt, dass Kosten binnen zwei Jahren um ein Drittel steigen können (323 → 440). Vorschlag: In der Grafik „Preisbasis je Studie verschieden“ vermerken.

**k4 · Akt 4 / Schritt 2: Bei ISE ist offen, ob die „Investitionen“ in den 54 Mrd. €/a Zahlungen oder Annuitäten sind.** ISE 2024, Abb. 38 trennt „Investitionen“ und „Betriebs- und Wartungskosten“, die Modellbeschreibung spricht von diskontierten Kosten. Unsere Hochrechnung auf 1,1 bis 1,35 Bio. € (Setzung M) setzt Zahlungen voraus. Vorschlag: In der Abgrenzungsspalte „Kostenbegriff der Studie nicht eindeutig (Annuität oder Auszahlung)“ vermerken.

## 3 · Was fehlt aus Sicht der Rolle

- **Finanzierbarkeit statt Bezahlbarkeit.** Wie viel Eigenkapital Netzbetreiber und Stadtwerke für die Netzinvestitionen brauchen und woher es kommt, behandelt die Seite nicht. Für Teil 1 reicht ein Satz in „Was Teil 1 nicht zeigt“. In den gelesenen Quellen habe ich dazu keine belastbare Zahl gefunden (Lücke).
- **Regulierte Verzinsung als Kostentreiber und Hebel.** Die Kapitalverzinsung im Netz wird von der Bundesnetzagentur festgelegt, und die ef.Ruhr/EWI-Studie zeigt, dass sie die Entgelte bewegt. Wer über Kosten der Energiewende redet, sollte sagen, dass ein Teil davon eine regulatorische Stellschraube ist. In Teil 1 nicht belegt (Lücke). Der Host der Bundesnetzagentur ist freigegeben.
- **Genehmigungen, Lieferzeiten, Fachkräfte.** Kosten sind nur ein Engpass. Lieferzeiten für Transformatoren und Kabel, Genehmigungsdauern und Netzanschlussstau entscheiden, ob die Summen überhaupt in dem Tempo ausgegeben werden können, das die Studien unterstellen. Auch R21 spricht in den Faktenblättern von der „Beschleunigung von Genehmigungsverfahren“. Teil 1 muss das nicht klären, sollte es aber als Grenze nennen: „Ob die Investitionen in diesem Tempo umsetzbar sind, prüft Teil 1 nicht.“
- **Kapitalkosten als Treiber der EE-Kosten.** Die DIHK nennt „gestiegene Finanzierungskosten“ ausdrücklich als Grund dafür, dass Lernkurven nicht greifen (S. 8, Fn. 2). GP11 erwähnt nur den Anstieg der Investitionskosten je kW. Die Zinswende trifft kapitalintensive Erneuerbare und Netze stärker als brennstofflastige Systeme. Das ist ein Argument für R21, das die Seite nicht nutzt.
- **Was die Netzzahlen für die Entgelte bedeuten.** Siehe M1. Die Seite nennt Netzsummen in Milliarden, aber nie ct/kWh, obwohl das die Einheit ist, in der Kunden, Politik und Versorger tatsächlich streiten.

## 4 · Was gut ist und so bleiben soll

- Die Quellenkette (R21 → WD 135/24 → PwC/FAZ) samt sichtbarer Graustufe für Ungelesenes. So arbeitet eine Revision, und es ist überzeugend.
- Die Dreiteilung G1, G2 und G3 in Akt 4 mit der Matrix „was ist enthalten“. Fachlich richtig und verständlicher als in den meisten Studien selbst.
- Die Entflechtung der „2.100 Milliarden für Netze“ gegen DIHK „Plan B“ (1,2 Bio. € Netze 2025 bis 2049). Das ist exakt die Art Fehler, die in Vorstandsvorlagen teuer wird.
- GP6 (fehlendes Kosten-Monitoring) und GP10 (Bundesrechnungshof: LCOE ohne Netzkosten ergibt ein „falsches Bild“). Beides deckt sich mit der Praxis und wird nicht kleingeredet.
- Die Korrekturen in beide Richtungen (GP12) und die Grenzen-Sektion ohne Schlussurteil.

## 5 · Der härteste Einwand

„Diese Seite beantwortet die Frage, die Ökonomen gern stellen, und lässt die Frage liegen, die wir jeden Tag beantworten müssen. Ob 13 Billionen ‚Kosten‘ oder ‚Investitionen‘ heißen, ist für einen Netzbetreiber zweitrangig. Jeder Euro davon muss erst finanziert und dann über zwanzig bis vierzig Jahre mit Zinsen über die Entgelte zurückverdient werden. Ob er ‚ohnehin‘ angefallen wäre, ändert daran nichts. Wenn die Seite beruhigend ‚0,4 bis 2,9 Prozent des BIP‘ schreibt, stellt sie annualisierte Kapitalkosten neben Investitionsauszahlungen und verschweigt, dass sich das Investitionsvolumen im Netz in den 2030er Jahren vervierfacht. Die Studie, die sie selbst zitiert, rechnet daraus 14 Cent mehr Netzentgelt je Kilowattstunde. Und sie wirft R21 vor, nicht zu sehen, dass gebaut wird, obwohl R21 genau das sagt, nur mit dem Zusatz, dass danach nicht mehr Strom fließt als vorher. Wer R21 widerlegen will, muss zeigen, dass der neue Kapitalstock die Brennstoffrechnung dauerhaft senkt und dass wir den Gipfel finanzieren können. Die Abgrenzung von Begriffen genügt dafür nicht.“
