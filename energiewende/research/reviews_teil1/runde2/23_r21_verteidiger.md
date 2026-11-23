# Nachprüfung Teil 1 · Rolle 23 · R21-Verteidiger, zweite Lesung

Stand 23.11.2026 · Auftrag `agents/briefs/P6-E_nachpruefung.md` · Rolle 23 (argumentiert für
die Erklärung des Expertenrats) · Modell Opus · an Freigabe v2 und Neubau nicht beteiligt.
Aus der ersten Runde gelesen: nur `08_r21_verteidiger.md`.

Gegenstand: `energiewende-1-story.html` und `energiewende-1-belege.html` in der Fassung aus
`data/teil1_data.json` (Freigabeliste v2). Gerendert über `python3 -m http.server` mit
Playwright (Node, `chromium.launch()` ohne Optionen) bei 1280 px und 390 px, beide Seiten, alle
`details` geöffnet. Ergebnis des Laufs: keine Konsolenfehler, keine Anfrage an fremde Hosts,
bei beiden Breiten derselbe Text (die Belegseite lief diesmal auch bei 390 px durch).
Einzelne Grafiken habe ich bei 1280 px fotografiert und angesehen (Akt 1/2, 2/2, 2/4, 4/3,
5/1, 5/2). Gegengelesen am R21-Original (`quellen/raw/P0/Erklaerung_Expertenrat_R21_2026-11.txt`),
an Wendlands Diskussionspapier (`quellen/raw/P1-01/Diskussionspapier_Kernenergie-2.pdf`),
an `strommix/research/kosten_kernkraft.md` und am Datensatz. „Druckseite“ meint die
R21-Erklärung, „Z.“ die Zeile der Textfassung.

## 1. Urteil in fünf Zeilen

Die Überarbeitung hat fast alles abgearbeitet, was ich in der ersten Runde kritisch fand: Das
Kapitalstock-Argument steht jetzt richtig da, die unscharfe Bezeichnung wird der Kurzinformation
zugeordnet, R21s Systempreis ist drin, R21s Hauptargumente werden als ungeprüft benannt. Neu sind
aber zwei Sätze, die R21 wieder etwas unterstellen: R21 wolle die Energiewende „abbrechen“ (V14),
und R21s eigene Bauzeit widerlege R21s eigenes Ziel (V04). Die Tabelle der eigenen Fehler sagt
mit „17 zulasten R21“ das Gegenteil dessen, was sie meint, und der Vorspann stellt R21s Zahl nur
neben die Mehrkosten. Eine Stelle ist zu weich geraten (S09). Stand: noch eine Runde nötig, aber eine kleine.

## 2. Befunde

### Kritisch (falsch, unfair oder irreführend; muss vor Freigabe als Entwurf weg)

**K1 · „Das Geld liegt im Wie der Energiewende, nicht in ihrem Abbruch.“ (V14, neu in v2)**
Fundstelle: Story, Akt 5, Schritt 2, letzter Absatz; Belegseite, Aussage V14 (Status „bestätigt“,
Quellen DIHK/Frontier und ZEW).
Problem: Der zweite Satz ist durch keine der genannten Quellen gedeckt und stellt R21 als
Befürworter eines „Abbruchs“ hin. Das stimmt aus zwei Gründen nicht.
(a) Die ZEW-Rechnung, die hier als Beleg gegen den „Abbruch“ dient, ist R21s eigener Vorschlag. R21
zitiert sie als Beleg für den eigenen Kurs: Fielen die nationalen Zusatzmaßnahmen neben dem
Emissionshandel weg, könnten die Politikkosten „bis 2048 um 824 Mrd. Euro sinken. Dieses
Ergebnis zeigt, welches enorme Potential in einem Politikwechsel liegt“ (Druckseite 20,
Z. 1385–1393). Die Seite schreibt das selbst in GP5 und R12.
(b) R21s Kurs ist kein Abbruch der Dekarbonisierung. Das Reform-Stromsystem in Factsheet B hat
54 % Erneuerbare, 43 % Kernenergie und 17 g CO₂-Äq./kWh (Factsheet B-2, Z. 450–459). R21 nennt
das „Kehrtwende“ (Druckseite 5, Z. 163), nicht Ausstieg. Den Satz „Ziel ist nicht weniger
Klimaschutz“ zitiert die Seite im Klimakasten selbst.
Keine gelesene Studie rechnet einen Pfad „Abbruch der Energiewende“. Der Satz ist also eine
Wertung ohne Beleg und widerspricht dem Klimakasten auf derselben Seite.
Beleg: R21 Druckseite 5 und 20, Factsheet B-2 (primär gelesen); Datensatz R12, GP5, KK.
Vorschlag: Den zweiten Satz streichen und ersetzen durch: „Die ZEW-Rechnung ist dabei R21s
eigener Vorschlag: Emissionshandel statt nationaler Zusatzmaßnahmen. DIHK und Frontier rechnen
einen anderen, ebenfalls klimaneutralen Pfad. Ob R21s Kurs insgesamt billiger ist, prüft Teil 6.“
Dazu „Zwei Studien … (DIHK und Frontier, ZEW)“ als „(DIHK/Frontier „Plan B“; ZEW)“ schreiben.
Das liest sich sonst wie drei Studien.

**K2 · „Das Ziel von 50 Gigawatt bis 2045 ist auch nach R21s eigener Bauzeit nicht erreichbar.“ (V04)**
Fundstelle: Story, Akt 5, Schritt 1; Grafik Akt 5 „Erster Neubau am Netz … R21 (Bauzeit nach
R21) 2042“; Belegseite V04.
Problem: Die Seite liest R21s „Planungs- und Bauzeit ca. 15 Jahre“ als Zeit bis zum ersten
Block und zieht daraus einen inneren Widerspruch bei R21. Im Factsheet steht die Angabe aber in
derselben Aufzählung wie das ganze Programm: „50 GW für Szenario aus Punkt 2 · = 31
1600-MW-Blöcke Typ EPR · = 310 Mrd. €, Planungs- und Bauzeit ca. 15 Jahre“ (Factsheet B-3,
Z. 507–509). Die naheliegende Lesart ist: das ganze Programm in rund 15 Jahren. Bei einer
Entscheidung 2027 wäre es dann etwa 2042 fertig, also vor 2045. Nach R21s eigenen Angaben gibt
es keinen Widerspruch. Es gibt einen Widerspruch zwischen R21s Angabe und der Erfahrung mit
vergleichbaren Projekten. Das ist der berechtigte Einwand, und der beruht auf unserer Setzung.
Außerdem nennt R21 „bis 2045“ nicht ausdrücklich. Das Jahr ergibt sich aus der
Quantified-Carbon-Simulation „für einen Stromverbrauch von 1000 TWh 2045“ (Factsheet B-2,
Fn. 3, Z. 483). In der Grafik steht „R21 (Bauzeit nach R21) 2042“ in der Liste „Erster Neubau
am Netz“. Damit schreibt die Grafik R21 eine Aussage über den ersten Block zu, die R21 so nicht
macht.
Beleg: R21 Factsheet B-2 und B-3 (primär gelesen).
Vorschlag: „R21 nennt für das Neubauprogramm rund 15 Jahre Planungs- und Bauzeit; das
Reform-Stromsystem bezieht R21 auf das Jahr 2045. Nach Vorlauf und Bauzeit vergleichbarer
Projekte ginge schon der erste Block frühestens 2040 ans Netz, im mittleren Fall 2047. 31 Blöcke
bis 2045 halten wir deshalb für nicht erreichbar (Setzung M).“ In der Grafik die Zeile „R21“ aus
der Liste „Erster Neubau am Netz“ nehmen oder mit „R21: ganzes Programm, ca. 2042“ beschriften.

**K3 · „17 zulasten R21 · 1 zugunsten R21“: Die Richtungsangabe der eigenen Fehler sagt das Gegenteil dessen, was gemeint ist.**
Fundstelle: Story, Abschnitt „Eigene Fehler“, Zählstreifen „Richtung der Korrekturen“ und
Tabelle (Spalten „Wo · Was jetzt gilt · Richtung · Beleg“); Belegseite, Tabelle der eigenen
Fehler mit Filter „Richtung“.
Problem: Im Datensatz bezeichnet `richtung` die Wirkung des alten Fehlers. KE10 („Dass mit dem
Geld auch etwas gebaut wird, kommt nicht vor“ → Kapitalstock richtig wiedergegeben), KE11
(Systempreis aufgenommen), KE18 (Bezeichnung beginnt in der Kurzinformation) und KE28
(Asien-Gegenposition, 310 im Referenzpapier) sind Korrekturen zugunsten von R21. Alle tragen das
Etikett „zulasten R21“. Umgekehrt steht KE08 (Reaktivierung von 4,1 auf 2,7 GW gesenkt, also
eine Korrektur gegen R21s Kurs) als „zugunsten R21“ da. Die Story zeigt nur die Spalte „Was jetzt
gilt“, nicht den alten Wortlaut, und erklärt „Richtung“ nirgends. Wer liest, schließt: Die
Prüfung ging 17-mal gegen R21 aus. Gerade der Abschnitt, der die Fairness der Seite belegen
soll, verkehrt sie damit ins Gegenteil. Der Transparenzabschnitt („22 zulasten von R21
gewirkt … hätte der Punkt unkorrigiert gestanden“) erklärt seine Zählung. Die Korrekturtabelle
erklärt ihre nicht.
Beleg: Datensatz `korrekturen_eigene` KE08, KE10, KE11, KE18, KE28; Story Z. 915–967 der
Textfassung.
Vorschlag: Die Spalte umbenennen in „Der alte Fehler wirkte“ und die Werte entsprechend fassen
(„gegen R21“, „für R21“, „gegen die Energiewende“, „für die Energiewende“). Dazu ein Satz über
dem Zählstreifen: „Gezählt ist, wem der alte Fehler geschadet hat; die Korrektur wirkt jeweils
in die Gegenrichtung.“ In der Story auch die Spalte „Vorher“ zeigen.

**K4 · Der Vorspann stellt R21s Spanne nur neben Mehrkosten und Mehrinvestitionen (B02).**
Fundstelle: Story, Vorspann, zweiter Absatz: „Was die Studien als zusätzliche Kosten … ausweisen,
liegt bei 0,4 bis 2,9 Prozent …; als zusätzliche Investitionen … bei 1,6 bis 3,5 Prozent. R21s
Spanne entspräche 11,4 bis 15,7 Prozent.“
Problem: In Akt 4 ist das fair gelöst: R21 steht neben den Brutto-Studien (4,4 bis 12,3 %),
„nahe bei Agoras Brutto-Investitionen“. In Akt 5 ist R21 in der Mehrkosten-Grafik nur noch eine
gestrichelte Linie „R21: Brutto-Zahl, keine Mehrkosten“. Der Vorspann ist der meistgelesene
Absatz, und dort fehlt das Brutto-Band. Er legt genau den Vergleich nahe, den die Seite in X07
verwirft („als Mehrkosten um den Faktor 5 bis 30 zu hoch“). Mein Befund M3 aus der ersten Runde
ist damit in der Grafik behoben, im Vorspann aber neu entstanden. Dazu kommt: Die 11,4 bis 15,7 %
rechnen mit dem BIP 2024. Die Lesehilfe verspricht, R21 dort, wo es selbst umrechnet, am BIP 2025
zu messen. Mit dem BIP 2025 sind es 11,0 bis 15,2 % (Setzung M, eigene Division).
Beleg: Datensatz B02, G12, X07; Story Lesehilfe („Wo R21 selbst umrechnet, zeigen wir das BIP 2025“).
Vorschlag: „Brutto, also in derselben Größe wie R21s Quelle, liegen die gelesenen Studien bei 4,4
bis 12,3 Prozent der Wirtschaftsleistung im Jahr; R21s Spanne entspräche 11,4 bis 15,7 Prozent,
am oberen Rand oder darüber. Was die Studien als zusätzliche Kosten gegenüber einem Vergleichspfad
ausweisen, liegt bei 0,4 bis 2,9 Prozent, als zusätzliche Investitionen bei 1,6 bis 3,5 Prozent.“

### Mittel (schwächt die Seite deutlich)

**M1 · „Für die Mehrkosten trifft R21s Argument dagegen zu.“ (S09): zu weich.**
Fundstelle: Story, Akt 1, Schritt 3; Belegseite S09.
Problem: Hier ist die Überarbeitung über das hinausgegangen, was die Belege tragen. R21s Argument
lautet, die Investitionen brächten nichts, was man vorher nicht schon hatte (Druckseite 9 und
10). Für die Mehrkosten stimmt das nur, soweit es um Marktprodukte geht. Gekauft werden mit ihnen
Emissionsminderung und weniger Importabhängigkeit. Die Bundesregierung nennt beides ausdrücklich
als nicht gegengerechnet (Drucksache 21/903 S. 2; die Seite zitiert das in Akt 4, Schritt 1). R21
selbst fragt, „wie viel Klimaschutz man bekommt“ (S10). Als Verteidiger nehme ich das Zugeständnis
gern an. Es ist aber unbedingt formuliert, die Belege tragen es nur bedingt.
Vorschlag: „Für die Mehrkosten trifft R21s Argument zum Teil zu: Sie bringen keine zusätzliche
Produktion. Ihr Gegenwert sind weniger Emissionen und weniger Importe; den weisen die Studien
nicht in Euro aus.“

**M2 · „Eine Spanne steht dort auch nicht“ (F03), unverändert seit v1.**
Fundstelle: Story, Akt 2, Schritt 2; Belegseite F03.
Problem: Zwei Absätze vorher zitiert die Seite die Kurzinformation wörtlich: „Beträge **zwischen**
500 Milliarden Euro pro Jahr oder 13,3 Billionen Euro“. „Zwischen“ legt selbst eine Spanne nahe.
Dass die zwei Werte nicht zusammenpassen (pro Jahr gegen insgesamt), stimmt. Den Satz
„Eine Spanne steht dort auch nicht“ widerlegt aber das eigene Zitat. Die zweite Hälfte meines
Befunds M1 aus der ersten Runde ist nicht aufgenommen.
Beleg: WD 5 – 3000 – 135/24, S. 2 (Wortlaut auf der Seite selbst).
Vorschlag: „Die Kurzinformation schreibt ‚zwischen … oder‘, nennt aber zwei Einzelwerte aus zwei
Quellen mit verschiedenem Zeitbezug, pro Jahr und insgesamt. Eine Spanne daraus zu lesen, liegt
nahe; rechnerisch passt sie nicht.“

**M3 · Die Waage in Akt 5 setzt R21s Kurs mit „ohne Energiewende“ gleich.**
Fundstelle: Story, Grafik Akt 5, Schritt 1 „Was R21 für den eigenen Kurs beziffert“. Über den
Balken für R21s Kernkraft-Neubau steht eine leere Waage mit den Schalen „mit Energiewende“ und
„ohne Energiewende“ (Foto bei 1280 px angesehen).
Problem: In Akt 2, Schritt 4 passt die Waage, weil sie den Vergleich aus dem Monitoring-Bericht
zeigt. In Akt 5 steht sie über „Was R21 für den eigenen Kurs beziffert“. Dort liest man R21s Kurs
als rechte Schale, also „ohne Energiewende“. Das ist dieselbe Gleichsetzung, die die Überarbeitung
im Text beseitigt hat (Klimakasten, X17). R21s Reform-System ist ein dekarbonisiertes
Stromsystem (Factsheet B-2).
Vorschlag: Die Waage in Akt 5 weglassen oder die Schalen dort mit „bisheriger Kurs“ und
„R21-Kurs“ beschriften.

**M4 · Die Größenordnung der Mehrkosten in R21s Maßstab fehlt in der Story weiterhin.**
Fundstelle: Story, Akt 5, Schritt 2; Datensatz G16 (`ort: belege`); offene Entscheidung O-3.
Problem: „Nicht bei zehn und mehr“ ist zu Recht weg. Das R21-Argument in seiner stärksten Form
fehlt aber in der Story noch: Auch 0,4 bis 2,9 % des BIP pro Jahr sind am oberen Rand ein
Mehrfaches des erwarteten Potenzialwachstums von rund 0,6 % pro Jahr (Factsheet C, C-2;
16,8 % kumuliert 2025 bis 2050). G16 („Auch die Mehrinvestitionen sind kein Kleingeld“) steht nur
auf der Belegseite. Ohne diesen Satz wirkt die Story so, als seien die Mehrkosten klein.
Beleg: R21 Factsheet C-2; Datensatz G16; O-3. Eigene Rechnung im Anhang.
Vorschlag: Die Entscheidung O-3 treffen und G16 in Akt 5, Schritt 2 aufnehmen. Einen Halbsatz
ergänzen: „am oberen Rand ein Mehrfaches des jährlichen Wachstums, das R21 erwartet“.

**M5 · Die Basis von R21s „konservativen“ 350 Mrd. € bleibt ungenannt: Olkiluoto-3.**
Fundstelle: Story, Akt 5, Schritt 1 (V02: „Die 350 Milliarden stützen sich auf eine Studie von
Quantified Carbon“); Grafik Akt 5.
Problem: Wendland rechnet die 350 Mrd. € ausdrücklich mit 7.000 €/kW, „wie sie im Falle des
finnischen 1600-MW-Blocks Olkiluoto-3 auftraten“ (PDF S. 3, Z. 83–84, und S. 16, Z. 622–629 der
Textfassung). Olkiluoto-3 ist ein gebauter westlicher EPR. Die Seite verschweigt das und setzt
dagegen eine Spanne, die „geplant oder im Bau“ heißt und bei 7.500 €/kW beginnt. Für die Fairness
in beide Richtungen gehört dazu: Die anderen gebauten westlichen Projekte kosteten etwa das
Doppelte, Flamanville 3 14.364 €/kW und Vogtle 3/4 14.258 €/kW (`kosten_kernkraft.md`,
Tab. 1.1). Beides zusammen ist fair. Nur „eine Studie von QC“ ist es nicht.
Vorschlag: „Die 350 Milliarden rechnen mit den Baukosten von Olkiluoto-3 (7.000 €/kW laut
Quantified Carbon), einem gebauten europäischen EPR; die anderen gebauten westlichen Projekte,
Flamanville 3 und Vogtle 3/4, kosteten rund das Doppelte.“

**M6 · Die Anfrage an R21 ist bis zum Ende der Reihe zurückgestellt.**
Fundstelle: Story, „Was Teil 1 nicht zeigt“ und „Offene Entscheidungen“ (O-1).
Problem: Der Titel von Teil 1 ist R21s Zahl. Zweimal steht „Woher … wissen wir nicht“ (13,8,
die Untergrenze 10, die 2.100 Mrd. €). Diese Fragen kann nur R21 beantworten. Erscheint Teil 1,
bevor R21 gefragt wurde, und kommt die Antwort erst nach Teil 6, dann wird R21 dort, wo es am
meisten zählt, ohne Stellungnahme dargestellt. Die Seite legt das offen, und das rechne ich ihr
an. Fair im Sinn von „Gegenseite hören“ ist es nicht.
Vorschlag: Die Anfrage vor der Veröffentlichung von Teil 1 stellen, mit Frist. Die Antwort
oder das Ausbleiben einer Antwort im Wortlaut auf der Belegseite. **Braucht eine Entscheidung
des Menschen** (die Zurückstellung vom 23.11.2026 ist seine Entscheidung).

### Klein

**k1 · R21s Untergrenze trägt das falsche Abzeichen.** Story Akt 2, Schritt 2 (Text und Tabelle
„R21, untere Angabe · 10 Bio. € · Wert: Setzung (M)“). Die 10 ist R21s Zahl („Behauptung“, so
auch in Akt 1, Schritt 3). Setzung ist nur unsere Herleitung 500 × 20. Vorschlag: Die Zahl als
`r21_kosten_zitat|min` führen und das Abzeichen „Setzung (M)“ an den Satz „Das ist unsere
Vermutung“ hängen.

**k2 · Die Abzeichen im Reform-Mix sind uneinheitlich.** Akt 5, Schritt 1: „8,2 · Wert: C“, aber
„43 Prozent Kernkraft · Wert: Behauptung“. Beide Werte stehen in derselben Zeile von Factsheet B-2
(Z. 450–459) und stammen aus derselben Simulation. Vorschlag: Beide C, Studie nicht gelesen.

**k3 · Ein Vorbehalt steht sechsmal da.** „Die 13,3 Billionen übernimmt die Kurzinformation aus
einer PwC-Studie, die wir nicht gelesen haben (Akt 3).“ steht sechsmal in der Story, darunter
zweimal innerhalb von Akt 3 und einmal unter „Grenzen“. Der Text wirkt so mechanisch und schwächt
den Vorbehalt eher. Vorschlag: einmal je Akt, in Akt 3 gar nicht.

**k4 · „R21 übernimmt das ungeprüft“ (F11) unterstellt etwas.** Ob R21 geprüft hat, wissen wir
nicht. R21 hat die Zahl auch nicht unverändert übernommen (13,8 statt 13,3, dazu eine
Untergrenze). Vorschlag: „R21 übernimmt die Bezeichnung, ohne die Abgrenzung zu nennen, und deutet
die Summe als ‚Entzug von Wertschöpfung‘.“

**k5 · R21s eigenes Factsheet stützt die Zuordnung der 2.100 Mrd. €, aber nur auf der Belegseite.**
Factsheet B-1 nennt für den Netzausbau „1200 Mrd. € … (Bothe et al. 2025)“, also dieselbe
Studie mit 1,2 Bio. € (N04, nur Belegseite). In der Story heißt es: „die Zuordnung ist unser
Schluss aus der Zahl“. Vorschlag: In Akt 4, Schritt 4 einen Halbsatz ergänzen: „R21s eigenes
Factsheet nennt für die Netze 1.200 Milliarden aus derselben Studie.“ Das ist ein sachlicher
Beleg statt eines Schlusses und belastet R21 nicht mehr als nötig.

**k6 · Was R21 auf Druckseite 5 vergleicht.** Laut DIW sind die 13,3 Bio. € die Gesamtkosten des
Pfads „Weiter wie bisher“. R21 vergleicht seinen Kurs mit den Kosten einer „Fortsetzung der
bisherigen Energiewende“ (Druckseite 5, Z. 165–166). Als Brutto-Kosten genau dieses Pfads ist R21s
Wortwahl an dieser Stelle vertretbar. Der Fehler liegt darin, dass für den eigenen Pfad keine
Brutto-Summe dagegensteht. Vorschlag: In Akt 3, Schritt 2 einen Satz ergänzen, mit dem Vorbehalt
„laut DIW, PwC nicht gelesen“.

**k7 · Eine Jahreszahl ist als Tausenderzahl formatiert.** Belegseite V04a: „8,5 Milliarden Euro
bis 2.032“. Das sollte „2032“ heißen.

## 3. Was gegenüber der ersten Fassung besser ist

Abgleich mit meinen Befunden aus der ersten Runde (`08_r21_verteidiger.md`):

| Nr. (Runde 1) | Kurz | Stand | Fundstelle jetzt |
|---|---|---|---|
| K1 | „Dass mit dem Geld etwas gebaut wird, kommt nicht vor“ | **behoben**; die Formulierung ist als X18 verboten | S08, S09 (Rest: M1 oben) |
| K2 | Abgrenzung fehlt schon in der Kurzinformation | **behoben** | F11, Akt 1/2 neutral („Zwei Stellen im Papier“), Akt 2/3 („Die Bezeichnung stammt also aus der Kurzinformation“); Rest: k4 |
| K3 | Systempreis 82 gegen 105 €/MWh verschwiegen | **behoben** | V05a, V05b (Gegenkritik Endkundenpreis), X19 |
| M1 | Dramaturgie hängt an 13,3 gegen 13,8 | **teilweise** | F12 („ändert sich R21s Größenordnung kaum“), Untertitel; offen: „zwischen … oder“ (M2 oben) |
| M2 | „einzige externe Fundstelle“ | **behoben** | S07 mit allen fünf Kategorien und dem Hinweis auf die Factsheets |
| M3 | R21 im Mehrkosten-Diagramm | **behoben in der Grafik** | Akt 5/2: gestrichelte Linie „R21: Brutto-Zahl, keine Mehrkosten“; neu im Vorspann (K4 oben) |
| M4 | Mehrkosten in R21s Maßstab | **offen** | G16 nur auf der Belegseite, O-3 nicht entschieden |
| M5 | Kernkraft-Hinweis einseitig | **weitgehend behoben** | Beschriftung „geplant oder im Bau“ (X15), Barakah (V03a), Serienbau, 310 im Referenzpapier; offen: Olkiluoto-3 (M5 oben) |
| M6 | „Auch Nichtstun kostet“ | **im Text behoben** | Klimakasten „Auch der Klimawandel kostet“, „keine Aussage über den R21-Pfad“, X17; offen: Waage in Akt 5 (M3 oben) |
| M7 | Hauptargumente nicht als ungeprüft benannt | **behoben** | R17 unter „Was Teil 1 nicht zeigt“ |
| k1 | Förderhinweis nur bei R21 hervorgehoben | **behoben** | nur noch in der Quellenliste und der Studientabelle, gleichrangig mit den Auftraggebern der Studien |
| k2 | Dunkelflaute: R21s Offenlegung | **behoben** | GP4 („legt selbst offen, dass es die 12,5-fache Kapazität … ansetzt“) |
| k3 | „Weiter wie bisher“ ≠ ohne Energiewende | **behoben** | Akt 3/2, dritter Absatz |
| k4 | Strompreis-Abstand | **behoben** (anders gelöst) | GP3/R06a nach Band und Steuern getrennt |
| k5 | „Der WD kommt auf“ | **behoben** | F06 „referiert“, F11 |

Außerdem besser: R21s Zugeständnis „Klimaschutz kostet nun einmal etwas … Das ist korrekt“ (S10)
steht jetzt in Akt 1. Die Umrechnung „Die Division stimmt“ ist geblieben. GP6 nennt jetzt auch
das Engpassmanagement als Treffer. Die Unsicherheit wird in beide Richtungen gezeigt (Akt 5/3).
Die Studientabelle zeigt beide BIP-Rechnungen und die eigene Angabe der Studien nebeneinander.

## 4. Was weiterhin fehlt

- Das R21-Argument in seiner stärksten Form steht noch nicht in der Story: ersetzen statt
  erweitern, gemessen am erwarteten Wachstum (M4).
- Die Anfrage an R21 vor der Veröffentlichung (M6).
- Das Angebot, Altanlagen „auf eigene Kosten“ zu ertüchtigen (Druckseite 24, Z. 1945, ohne
  Quelle). Es steht auf keiner der beiden Seiten. V04a nennt nur R21s 8,5 Mrd. € für 7 GW. Für
  einen Kostenvergleich ist das Angebot erheblich, auch wenn es offen ist.
- Der Hinweis, dass die ZEW-Einsparung R21s eigene Gegenrechnung ist und nicht nur eine
  „stimmende Zahl“ (GP5). Teilweise steht das in R12. K1 oben würde es klarstellen.

## 5. Der härteste Einwand, zweite Lesung

„Ihr habt uns zugehört, und das merkt man. Dann aber schreibt ihr, wir wollten die Energiewende
abbrechen, und belegt das ausgerechnet mit dem ZEW-Gutachten, das unseren Vorschlag durchrechnet.
Ihr lest unsere 15 Jahre für das ganze Programm als Zeit bis zum ersten Block und nennt das dann
unseren eigenen Widerspruch. Und eure Korrekturtabelle meldet ‚17 zulasten R21‘ für Stellen, an
denen ihr uns Unrecht getan hattet.“ Einordnung: Alle drei Punkte sind berechtigt und mit wenigen
Sätzen zu beheben. Nicht halten würde weiterhin R21s Kernaussage, „10 bis 13,8 Billionen“ seien
ein belegter Wertschöpfungsentzug. Dafür trägt keine gelesene Mehrkosten-Studie.

## Anhang · Zahl der Befunde und eigene Rechnungen

| Gewicht | Anzahl | Kennungen |
|---|---|---|
| kritisch | 4 | K1 bis K4 |
| mittel | 6 | M1 bis M6 |
| klein | 7 | k1 bis k7 |

Eigene Rechnungen (Setzung M, Werte aus `teil1_data.json`):
- 10 / 20 / 4.386,94 Mrd. € = 11,4 %; 13,8 / 20 / 4.386,94 Mrd. € = 15,7 % (BIP 2024, wie auf der Seite).
- 10 / 20 / 4.529,71 Mrd. € = 11,0 %; 13,8 / 20 / 4.529,71 Mrd. € = 15,2 % (BIP 2025, R21s eigene Bezugsgröße).
- 13,3 / 4,52971 = 2,94 Jahres-BIP (bestätigt F12).
- 1,168^(1/25) − 1 = 0,62 % Potenzialwachstum pro Jahr; 2,9 / 0,62 ≈ 4,7.

Fotos (Scratch-Ordner, nicht im Repository): Akt 1/2, 1/3, 2/2, 2/4, 4/3, 5/1 und 5/2 bei
1280 px, hell.
