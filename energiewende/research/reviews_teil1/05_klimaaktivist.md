# Review 05 · Klimaaktivist · Teil 1 „Die 13,8 Billionen“

Rolle: Klimaaktivist (Auftrag P5, Nr. 05). Geprüft am 22.11.2026: `energiewende-1-story.html`
und `energiewende-1-belege.html`, gerendert mit Playwright (Chromium) bei 1280 px und 390 px
über `python3 -m http.server`; gelesen wurde der zur Laufzeit eingesetzte Text. Keine
Konsolenfehler, keine Anfragen an fremde Server. Grundlage: `docs/03_teil1_freigabe.md`,
`data/teil1_data.json`; nachgeschlagen in den Dossiers 01, 02, 04, im Prüfbericht 02 und in
den Originalen unter `quellen/raw/` (Fundstellen in der Belegtabelle am Ende).

## 1. Urteil in fünf Zeilen

Ich würde die Seite empfehlen, weil sie die Billionen-Zahl sauber auseinandernimmt und dabei
nicht selbst zuspitzt — instrumentalisiert wird das Klima hier nirgends. Aber sie ist zu zahm,
und zwar nicht aus Vorsicht, sondern aus Schieflage: Sie zitiert die Kostenseite von
Fraunhofer ISE 2021 und Ariadne, verschweigt aber, dass genau diese Studien vermiedene
Klimaschäden gegenrechnen und dann deutlich niedriger (ISE) oder mit überwiegendem Nutzen
(Ariadne) herauskommen. Elf Kästen ziehen die Mehrkosten nach oben, kein einziger nach unten,
und der Klimakasten sagt sogar, Schäden ließen sich gar nicht aufrechnen. Zitieren würde ich
die Akte 1 bis 4; Akt 5 und den Klimakasten würde ich öffentlich angreifen.

## 2. Befunde

### Kritisch (falsch, unfair oder irreführend — muss vor Veröffentlichung weg)

**K1 · Die Nutzenseite derselben Studien fehlt.**
Fundstelle: Story, Akt 5 Schritt 2 („Wo Studien gegen ein System ohne weiteren Klimaschutz
rechnen, liegen die Mehrkosten bis 2045 bei 1,0 bis 3,3 Billionen Euro (Fraunhofer ISE 2021)“)
und GP7 („Die Studie mit der fossilsten Referenz (Fraunhofer ISE 2021) liefert die höchsten
Werte: 2,2 bis 2,9 % des BIP“); Belegseite V07, V08, Studientabelle.
Problem: Fraunhofer ISE 2021 nennt die 1.000 bis 3.300 Mrd. € ausdrücklich „ohne eine
Einbeziehung von Umweltkosten“ und schreibt im selben Absatz, mit vermiedenen Umweltkosten
von etwa 2.000 Mrd. € sänken die Netto-Mehraufwendungen auf 340 bis 1.300 Mrd. €, im
Suffizienz-Szenario würden bis zu 1.000 Mrd. € eingespart; jährlich 0,3 bis 1,4 % des BIP 2020.
Ariadne schreibt in derselben Zusammenfassung, aus der die 16 bis 26 Mrd. € stammen: „Die
Mehrkosten für die Erreichung der Klimaneutralität sind deutlich geringer als die vermiedenen
Klimaschäden“, der Nutzen überwiege „deutlich“. Die Seite übernimmt von beiden Studien nur
die Kostenzahl. Das verletzt die eigene Quellentreue-Regel (`TRANSPARENZ.md` Abschnitt 3:
„gleiche Abgrenzung“): Die Abgrenzung „ohne Umweltkosten“ steht sogar im Freigabe-Datensatz
(`ise2021_mehraufwand`, Feld `abgrenzung`), auf der gerenderten Seite aber nirgends. Gerade
die Studie, die GP7 als die mit den „höchsten Werten“ vorführt, ist die, deren eigenes
Ergebnis nach Gegenrechnung am stärksten fällt.
Beleg: ISE 2021, Kernaussage 10 (PDF-S. 5) und Abschn. 5.3 (PDF-S. 40–42), selbst gelesen;
Ariadne-Zusammenfassung, Abschnitt 7 mit Abb. Z.4c (PDF-S. 8–9), selbst gelesen; der
ISE-Wert ist im Prüfbericht 02, Nr. 22 bestätigt (B, primär gelesen) und liegt als
`d02.ise2021_vermiedene_umweltkosten_bio_eur` in `data/model_params.json`, wurde aber nicht
in die Freigabeliste übernommen.
Änderung: (a) Bei jeder G3-Zahl die Abgrenzung „ohne vermiedene Klimaschäden“ sichtbar
machen (Akt 4 Schritt 3, Akt 5 Schritt 2, Studientabelle, Spaltenkopf G3b). (b) Einen
Gegen-Kasten aufnehmen, gleichrangig mit GP7 bis GP11, etwa „Warum die Mehrkosten zu hoch
gemessen sein können“, mit ISE 2021 (340 bis 1.300 Mrd. € nach Gegenrechnung, Kostensätze
UBA 199 bis 255 €₂₀₂₁/t) und dem Ariadne-Satz, Konfidenz B, mit der Einschränkung, dass beide
mit UBA-Sätzen rechnen, deren Höhe an der Zeitpräferenz hängt. Dafür braucht es neue
Freigabe-Einträge; die Werte sind geprüft.

**K2 · „keine lässt sich gegen die Kosten der Energiewende aufrechnen“ ist falsch und nicht
freigegeben.**
Fundstelle: Story, Kasten „Kosten des Nicht-Handelns · Untergrenze, nicht addierbar“,
Vorbehalt: „Sie dürfen nicht addiert werden, und keine lässt sich gegen die Kosten der
Energiewende aufrechnen.“
Problem: Freigegeben ist nur V13: die 280 bis 900 Mrd. € und die UBA-Sätze „dürfen nicht
addiert werden“. Der zweite Halbsatz steht weder in der Freigabeliste noch im Datensatz
(nur im HTML-Quelltext, Zeile 759), und er stimmt für die UBA-Sätze nicht: Kostensätze je
Tonne sind genau dafür gemacht, vermiedene Emissionen zu bewerten; ISE 2021 und Ariadne
rechnen so (K1). Die Bundesregierung nennt es in Drs. 21/903, S. 2 ausdrücklich als Lücke der
Kostenstudien, dass „vermiedene Klima- und Umweltschäden“ „nicht gegengerechnet“ werden. Für
die 280 bis 900 Mrd. € (Inlandsschäden) trifft die Aussage dagegen zu, weil sie kaum von
deutschen Emissionen allein abhängen.
Änderung: „Die Schäden in Deutschland lassen sich nicht gegen deutsche Kosten aufrechnen,
weil sie von den weltweiten Emissionen abhängen. Die UBA-Sätze sind dagegen dafür gedacht,
vermiedene Emissionen zu bewerten; zwei der gelesenen Studien tun das (siehe Kasten …).“

**K3 · Akt 5 zeigt nur eine Fehlerrichtung und überzieht die Freigabe.**
Fundstelle: Story, Akt 5 Schritt 3: „Darum zeigen die Pfeile nach rechts: Die gelesenen
Mehrkosten sind eher eine untere Linie als ein fester Wert.“ Grafik Schritt 3: „Pfeile: Werte
können höher liegen“; Legende „Was fehlt oder zu niedrig sein kann: …“.
Problem: Die Freigabe (Abschnitt 4, Schritt 5.3) erlaubt „können zu niedrig sein“, nicht „eher
eine untere Linie“. Der Satz widerspricht zudem der eigenen Einleitung der Gegenpositionen
wenige Absätze später: „Die Studien in Akt 5 sind keine Untergrenze im strengen Sinn.“ Und er
ist einseitig: Mindestens ein ausgelassener Posten zieht nach unten (vermiedene Klimaschäden,
K1), ein weiterer laut Bundesregierung ebenfalls (vermiedene geopolitische Abhängigkeit, nur
qualitativ). Wer nur die nach rechts offenen Pfeile sieht, liest: Die Energiewende wird teurer
als die Studien sagen. Das ist nicht gedeckt.
Änderung: Satz auf die Freigabe zurückführen („können zu niedrig sein“) und in der Grafik je
Studie, wo belegt, auch den Pfeil nach links zeigen (ISE 2021: 0,3 bis 1,4 % des BIP 2020 mit
Umweltkosten, Studienangabe); Legende zweiseitig: „was fehlt und höher treibt“ · „was fehlt und
senkt“.

### Mittel (schwächt die Seite deutlich)

**M1 · Das Zitat der Bundesregierung ist halbiert.**
Fundstelle: Story, GP6, Einschränkung: „…, weil Ersatzinvestitionen enthalten und eingesparte
fossile Energie nicht abgezogen ist.“
Problem: Im selben Absatz von Drs. 21/903, S. 2 stehen zwei weitere Posten, die nicht
gegengerechnet sind: „vermiedene Klima- und Umweltschäden“ und „die Verminderung von
geopolitischen Abhängigkeiten bei importierten Energieträgern“. Die Seite nimmt aus dieser
Quelle das, was die Zahl verkleinert, aber nicht das, was nach Klima klingt. Prüfbericht 02
hat genau diese Auslassung schon im Dossier als „zulasten der Energiewende“ markiert.
Änderung: Satz vervollständigen; die Quelle ist am Original gelesen (A).

**M2 · Emissionshandel: Der ZEW-Wert ohne seine wichtigste Abgrenzung.**
Fundstelle: Story, GP5: „Die ZEW-Studie … beziffert den Effekt, wenn nationale
Zusatzmaßnahmen entfallen, auf 824 bis 1.071 Mrd. € als Barwert. Der Gesamteffekt liegt eher
am oberen Ende, also höher als bei R21.“
Problem: Der Leser erfährt nicht, was „der Effekt“ ist, und nicht, dass es eine
Wohlfahrtsrechnung „ohne vermiedene Klimaschäden“ ist. So steht es im Datensatz
(`zew_effekt_ohne_nationale_massnahmen`, `abgrenzung`), gerendert wird es nicht. Ohne diese
Angabe stärkt der Kasten R21s Argument, nationale Maßnahmen seien teurer Ballast, über das
hinaus, was die Studie trägt. Und R21s eigenes Faktenblatt F-1 schreibt, bei linearer
Fortführung würden „ab 2039 keine neuen Zertifikate mehr ausgegeben“ (Druckseite F-1); das
wäre die nötige Einordnung, dass der ETS selbst einen schnellen Ausstieg verlangt.
Änderung: „… ein Wohlfahrtsgewinn für die EU-27, gerechnet ohne vermiedene Klimaschäden“; dazu
R21s eigenen Satz zu 2039 als Einschränkung.

**M3 · Die Dringlichkeit kommt nicht vor.**
Fundstelle: Story, Prolog „Was wir voraussetzen“: „der Ausstoß von CO₂ soll sinken“; sonst
keine Emissionszahl auf beiden Seiten.
Problem: „soll sinken“ ist schwächer als die Rechtslage (Netto-Treibhausgasneutralität 2045,
−65 % bis 2030, −88 % bis 2040) und schwächer als die eigene Reihe: Laut README ist das
CO₂-Budget eines von vier gleichrangigen Kriterien für „tragfähig“; Teil 1 nennt es nicht. Die
Lage ist belegt und liegt im Repo: UBA, 14.03.2026: 648,9 Mio. t CO₂-Äq. 2025, Projektion 2030
−62,6 % statt −65 % (Lücke 30 Mio. t), Einhaltung der kumulierten Mengen 2021–2030 „nicht
richtungssicher“, ESR-Zielverfehlung 255 Mio. t, mit den umgesetzten Maßnahmen 2045 noch
212,5 Mio. t brutto. Dazu der Zeitpunkt aus der Seite selbst: Ein erster neuer Kernkraftblock
käme 2040 bis 2047 ans Netz — nach dem Jahr, ab dem laut R21 keine neuen ETS-Zertifikate mehr
ausgegeben würden. Was in der Zwischenzeit ausgestoßen wird, sagt die Seite nicht.
Änderung: Im Prolog die gesetzlichen Ziele nennen und das Kriterium „CO₂-Budget“ als Teil von
„tragfähig“ ausweisen; im Kernkraft-Hinweis einen Satz: „Bis dahin muss der Strom aus anderen
Quellen kommen; was das für den Ausstoß heißt, rechnet Teil 6.“ Die UBA-Werte brauchen einen
Freigabe-Eintrag (Dossier 04, B, primär gelesen; von mir am Original nachgelesen).

**M4 · Konfidenz bei Zweitquellen uneinheitlich.**
Fundstelle: Story, Klimakasten: „280 bis 900 Mrd. € · B · nicht gelesen“; Akt 3 Schritt 3:
PwC-Werte über DIW „C · nicht gelesen · nicht prüfbar“.
Problem: Beide Zahlen kennt die Seite nur aus einer Wiedergabe (hib bzw. DIW), beide Originale
sind ungelesen. Die Legende der Seite definiert C als „kursiert, Original nicht geprüft“. Dass
die Klimafolgezahl B bekommt und die PwC-Zahl C, ist nicht erklärt. Als Aktivist will ich die
280 bis 900 Mrd. € auf der Seite haben — aber nicht mit einem Etikett, das ein Gegner in einem
Satz als Doppelstandard vorführen kann.
Änderung: Regel festlegen und auf beide anwenden (etwa „B, wenn die Wiedergabe von einer
amtlichen Stelle stammt, sonst C“) und diese Regel in „So lesen Sie die Zahlen“ nennen. Q30 in
der Quellenliste um Datum und Ursprung ergänzen (Studie IÖW/Prognos/GWS im Auftrag des BMWK,
laut Dossier 02), nach `TRANSPARENZ.md` Abschnitt 3.

**M5 · GP8: Die „Einschränkung“ ist keine und hat keinen Beleg.**
Fundstelle: Story, GP8: „Einschränkung: Der bisherige Hochlauf von Wärmepumpen und E-Autos
gleicht eher dem Beharrungs-Szenario als dem Plan.“ Belegseite gleichlautend.
Problem: Der Satz schränkt die Gegenposition nicht ein, er verstärkt sie. Er hat auf der Seite
keine Zahl und keine Quelle; in der Freigabeliste steht er ohne Aussage-ID, im Prüfbericht 02
(Abschn. 2, Nr. 86) nur als Prosa. Inhaltlich halte ich ihn für plausibel — gerade deshalb
gehört er belegt und richtig eingeordnet: Er ist ein Befund über verfehlte Klimapolitik, nicht
nur über Kosten (vgl. UBA: Gebäude und Verkehr über ihren Jahresmengen).
Änderung: Mit Zahl und Quelle belegen oder streichen; als echte Einschränkung taugt z. B., dass
Beharrung auch höhere Emissionen bedeutet und damit höhere Schäden, die in den +16 bis +235 %
nicht stecken.

### Klein

**k1 · Der Klimakasten ist schwer zu finden.** Er steht in der Story ohne Nummer zwischen GP9
und „Wo R21 recht hat“ und zählt nicht zu den zwölf Pflicht-Gegenpositionen. In der Grafik von
Akt 5 kommen sechs Kacheln „Hier hat R21 recht“ vor, keine zu Klimafolgen. Vorschlag: im Akt-5-
Raster eine Kachel „Kosten des Nicht-Handelns“ mit Verweis auf den Kasten.

**k2 · Ungleiche Haltungsvermerke in der Quellenliste.** Q5 (DIW) trägt den Hinweis „Autorin
vertritt Klimaschutz als volkswirtschaftlichen Vorteil“. Für R21, die DIHK (Verband) oder
Agora gibt es keinen vergleichbaren Haltungsvermerk, nur Auftraggeber. Entweder für alle
nennen, wofür sie stehen, oder bei allen bei Auftraggeber und Geldgeber bleiben (Fairness-Check
der Freigabe: „kein Urteil aus dem Absender ableiten“).

**k3 · Der Flut-Vergleich aus derselben Quelle fehlt.** hib 411/2024 nennt neben den 280 bis
900 Mrd. €: Flutschäden 2021 „mindestens rund 40 Milliarden Euro“; ein solches Ausmaß „könnte
… bis zur Mitte des Jahrhunderts rein rechnerisch fast jedes Jahr eintreten“. Das ist die
anschaulichste Zahl zur Dringlichkeit und am Original gelesen. Vorschlag: in den Klimakasten.

**k4 · „Hier hat R21 recht“ beim Industrierückgang.** Die Kachel in Akt 5 zeigt „−15,0 %
gegenüber 2018“ unter „Hier hat R21 recht“; dass die Ursache nicht zerlegt ist, steht erst im
Kasten darunter. R21s Argument ist die Ursache, nicht die Zahl. Vorschlag: Kacheltitel „Die
Zahl stimmt“ oder die Einschränkung in die Kachel.

## 3. Was fehlt aus Sicht der Rolle

- **Eine symmetrische Gegenposition.** Die zwölf Pflicht-Kästen sind sechs „R21 hat recht“,
  fünf „zu optimistisch“, einer „in beide Richtungen“. „Zu pessimistisch“ gibt es nicht, obwohl
  die Belege dafür geprüft im Repo liegen (K1, M1). `TRANSPARENZ.md` Abschnitt 6 verlangt für jede
  Kernaussage die stärkste Gegenposition — für „Mehrkosten 0,4 bis 2,9 % des BIP“ ist die
  stärkste Gegenposition von unten die Gegenrechnung der Klimaschäden.
- **Die Größenordnung der Klimakosten im selben Maßstab.** Akt 4 rechnet jede Kostenzahl in
  Prozent des BIP um, die Klimakosten nicht. Zur Einordnung, als Setzung (M) und nicht zur
  Verrechnung: 648,9 Mio. t (UBA 2025) × 345 €/t ≈ 224 Mrd. € pro Jahr, rund 5,1 % des BIP 2024;
  mit 990 €/t ≈ 642 Mrd. €, rund 14,6 %. Das sind weltweite Schäden je Jahresausstoß, nicht
  Schäden in Deutschland, und die Sätze gelten je Tonne CO₂, nicht je Tonne CO₂-Äquivalent.
  Mit diesem Vorbehalt zeigt die Rechnung, dass der Schaden eines einzigen deutschen
  Emissionsjahres in der Größenordnung von R21s Jahreswert (11,4 bis 15,7 %) liegen kann. Ob
  so eine Rechnung auf die Seite gehört, muss der Mensch entscheiden (D6 hat das bisher
  ausgeschlossen); in Teil 6 gehört sie hin.
- **Der Emissionspfad des R21-Kurses.** Teil 1 zeigt, dass R21 die Kosten seines Kurses nicht
  beziffert; dass er auch die Emissionen bis zum ersten neuen Block nicht beziffert, fehlt.
- **Vermiedene Importe und Gesundheitskosten.** Prüfbericht 02 nennt DIW 2025: 18 bis 25 Mrd. €
  jährlich vermiedene Importe, 8 bis 12 Mrd. € Gesundheitskosten, und sagt, das gehöre „neben
  die Klimafolgekosten“ — mit dem Hinweis, dass die Quelle eine Pro-Position ist. Nicht in der
  Freigabe, nicht auf der Seite. Von mir nicht am Original nachgelesen.
- **Die PwC-Lektüre (D2).** Wenn laut DIW die 13,3 Billionen die Kosten von „Weiter wie bisher“
  sind, dann ist die Zahl, auf die sich die Schlagzeile stützt, die Rechnung des fossilen
  Weiter-so. Das ist die eigentliche Geschichte, und sie hängt an Konfidenz C. Die Freigabe
  empfiehlt, die Studie vor Teil 1 lesen zu lassen (Registrierung durch den Menschen). Ich
  schließe mich an.

## 4. Was gut ist und so bleiben soll

- Die Prämissen stehen vorn, und die Seite verhandelt den Klimawandel nicht neu.
- Keine Instrumentalisierung: Kein Satz spielt Klimaschäden gegen Kosten aus, um die Zahl
  kleinzureden; der Verzicht auf „Die Energiewende lohnt sich“ (X05) ist richtig, solange PwC
  nicht gelesen ist.
- Die Kette BILD → R21 → WD → PwC mit „gelesen / nicht gelesen“ ist vorbildlich, ebenso der
  Kasten „Wo wir uns korrigieren mussten“ — auch dort, wo die Korrekturen gegen die
  Energiewende ausfallen.
- Die Unterscheidung G1 / G2 / G3 ist das Werkzeug, das in der öffentlichen Debatte fehlt.
- Der Satz „Auch Nichtstun kostet“ mit der Untergrenze und dem Verbot der Addition ist
  sauber — bis auf den Halbsatz aus K2.

## 5. Der härteste Einwand

„Diese Seite prüft R21 auf Quellentreue und begeht dabei selbst die Auslassung, die sie R21
vorwirft. R21 nennt eine Bruttozahl und zieht nichts ab — die Seite nennt Mehrkosten und
zieht die vermiedenen Klimaschäden nicht ab, obwohl die beiden Studien, die sie dafür
zitiert, diese Gegenrechnung selbst machen: Fraunhofer ISE 2021 kommt danach auf 340 bis
1.300 Milliarden Euro statt 1.000 bis 3.300, Ariadne schreibt, der Nutzen überwiege deutlich.
Stattdessen bekommt R21 sechs Kästen ‚Hier hat R21 recht‘, die niedrigen Mehrkosten fünf
Kästen ‚zu optimistisch‘, und das Klima einen einzigen Kasten mit dem Satz, Schäden ließen
sich ‚nicht aufrechnen‘ — was die eigenen Quellen widerlegen. Wer ‚gleiche Messlatte für
alle‘ verspricht, muss die Pfeile in beide Richtungen zeichnen.“

## Belege, die ich selbst nachgeschlagen habe

| Aussage | Quelle | Fundstelle | Konfidenz | primaer_gelesen |
|---|---|---|---|---|
| ISE 2021: 1.000–3.300 Mrd. € „ohne Einbeziehung von Umweltkosten“; mit rund 2.000 Mrd. € vermiedenen Umweltkosten 340–1.300 Mrd. €, Suffizienz bis −1.000 Mrd. €; 0,3–1,4 % BIP 2020 p. a. | Fraunhofer ISE, Wege zu einem klimaneutralen Energiesystem – Update Klimaneutralität 2045, 2021; `quellen/raw/P1-02/ise_wege_update2045_2021.pdf` | PDF-S. 5 (Kernaussage 10), Abschn. 5.3, PDF-S. 40–42 | B (eine Quelle; Prüfbericht 02 Nr. 22 bestätigt) | true |
| Ariadne: Mehrkosten „deutlich geringer als die vermiedenen Klimaschäden“, Klimaschäden „mehr als halbiert“, Nutzen überwiegt „deutlich“ (3 % diskontiert, UBA 2024) | Kopernikus-Projekt Ariadne, Zusammenfassung 2025; `quellen/raw/P1-02/ariadne_szenarien2025_zusammenfassung.pdf` | Abschn. 7, Abb. Z.4c (PDF-S. 8–9) | B | true |
| Bundesregierung: vermiedene Klima- und Umweltschäden und geringere geopolitische Abhängigkeit „werden nicht gegengerechnet“ | BT-Drs. 21/903, 15.07.2025; `quellen/raw/P2-02/btd_21_903.pdf` | S. 2 | A (amtlich, am Original) | true |
| 280–900 Mrd. € 2022–2050, Untergrenze; Flut 2021 ≥ rund 40 Mrd. €, „fast jedes Jahr“ bis Mitte des Jahrhunderts | hib 411/2024; `quellen/raw/P1-02/hib_411_2024_klimafolgen.html` | Meldungstext | B (Studie selbst nicht gelesen) | true (hib), false (Studie) |
| UBA-Klimakosten 2025: 345 €/t (1 %), 990 €/t (0 %), €2025 | UBA, Tabelle Methodenkonvention 4.0, 06.07.2026; `quellen/raw/P2-02/uba_klimakosten_2026-07-06.pdf` | S. 1 | B | true |
| THG 2025 648,9 Mio. t CO₂-Äq.; Projektion 2030 −62,6 % (Lücke 30 Mio. t); 2021–2030 „nicht richtungssicher“; ESR-Lücke 255 Mio. t; 2045 212,5 Mio. t brutto | UBA, Emissionsdaten 2025 & Projektionsdaten 2026, Stand 14.03.2026; `quellen/raw/P1-04/uba_emi2025.txt` | Abschn. 2 „Zentrale Ergebnisse“ | B | true |
| R21: „ab 2039 keine neuen Zertifikate mehr“ (bei linearer Fortführung, bisherige Planung) | R21-Erklärung, Nov. 2026; `quellen/raw/P0/Erklaerung_Expertenrat_R21_2026-11.pdf` | Faktenblatt F-1 | B (R21-Angabe, nicht an der ETS-Richtlinie geprüft) | true |
| ZEW-Wert „ohne vermiedene Klimaschäden“ | Freigabe-Datensatz `zew_effekt_ohne_nationale_massnahmen`; Prüfbericht 01 | Feld `abgrenzung` | B | false (ZEW-Original nicht selbst gelesen) |
| 224 bzw. 642 Mrd. € pro Jahr, 5,1 bzw. 14,6 % des BIP 2024 | eigene Rechnung: 648,9 Mio. t × 345 bzw. 990 €/t; BIP 2024 4.386,94 Mrd. € | – | Setzung (M) | – |
| GP8-„Einschränkung“ ohne Beleg | `docs/03_teil1_freigabe.md` Abschn. 5, Zeile GP8; `research/pruefung/02_pruefung.md` | – | – | – |
| „aufrechnen“-Satz nicht freigegeben | Suche in `docs/03_teil1_freigabe.md`, `data/teil1_data.json`: kein Treffer; nur `energiewende-1-story.html` Z. 759 | – | – | – |
