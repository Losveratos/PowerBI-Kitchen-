# Review Teil 1 · Rolle 12 · Freigabe-Prüfer

Stand 22.11.2026 · Auftrag P5 (`agents/briefs/P5_reviews_teil1.md`) · Regeln `agents/REGELN.md` ·
Prüfgegenstand `energiewende-1-story.html` und `energiewende-1-belege.html` gegen
`docs/03_teil1_freigabe.md` und `data/teil1_data.json`. Keine Persona. Ich war an Recherche,
Freigabe und Bau nicht beteiligt. Kein Netzabruf, deshalb kein Manifest.

**Methode.** `python3 -m http.server` im Repo-Wurzelverzeichnis; beide Seiten mit Playwright
(Node, `chromium.launch()` ohne Optionen) bei 1280 px und 390 px geöffnet, ganz durchgescrollt,
alle `<details>` geöffnet, `document.body.innerText` und alle SVG-Texte abgegriffen,
Netzwerkanfragen und Konsole mitgeschrieben. Die gerenderten Texte und das Skript liegen im
Scratch-Ordner der Sitzung (`…/scratchpad/r12/`: `energiewende-1-story_1280.txt`,
`…_390.txt`, `energiewende-1-belege_1280.txt`, `…_390.txt`, `render_meta.json`, `render.js`).
Danach: Datensatz gegen den JSON-Block der Freigabeliste verglichen (Python, Schlüssel für
Schlüssel), jede gerenderte Zahl gegen die Werte im Datensatz abgeglichen, Suche nach jeder
verworfenen Zahl und verbotenen Formulierung, Ziffernsuche im HTML-Quelltext außerhalb und
innerhalb der Skripte, jeder Satz mit Status „nicht prüfbar“ gegen Abschnitt 3 der
Freigabeliste.

## Ergebnis in Zahlen

| Prüfpunkt | Ergebnis |
|---|---|
| Datensatz = Freigabeblock (`teil1_data`) | **identisch**, alle zehn Schlüssel, 65 Zahlen, 87 Claims |
| Leere Platzhalter, „undefined“, „NaN“ | 0 (beide Seiten, beide Breiten) |
| Konsolen- und Seitenfehler | 0 |
| Waagerechtes Scrollen bei 390 px | keins (`scrollWidth` = 390) |
| Anfragen an fremde Hosts | **0** (Story 9, Belege 8 Anfragen, alle `localhost`; nur Links nach GitHub, YouTube usw., nichts wird geladen) |
| Verworfene Zahl außerhalb der Quarantäne-Tabelle | **0** |
| Verbotene Formulierung (X01–X14) im Text | **0** |
| Pflichtsätze aus Abschnitt 3 | alle wörtlich vorhanden (Tabelle E) |
| Zwölf Pflicht-Gegenpositionen sichtbar | **12 / 12** auf beiden Seiten, je mit Einschränkung (Tabelle F) |
| Entscheidungen D1–D8 umgesetzt | 7 ja, D4 grenzwertig (Tabelle G) |
| Zahlen von Hand im Quelltext | ja, siehe Tabelle H |
| **Befunde** | **2 kritisch · 9 mittel · 17 klein** |

Die Seiten halten sich in den heiklen Punkten (13,3 gegen 13,8, PwC, FAZ, Netzzahl 2.100,
Tonfall) eng an die Freigabe. Die Fehler liegen fast alle an einer Stelle: wo Zahlen
**verschiedener Größen** (G3a Mehrinvestitionen, G3b Mehrkosten) oder **verschiedener
Hebel** (ZEW) in einem Satz oder einer Grafik zusammengezogen werden, und dort, wo ein
Kernsatz aus `schritte[].kern` ohne seinen Vorbehalt auf der Belegseite steht.

## Befunde nach Gewicht

### Kritisch (muss vor Veröffentlichung weg)

**K1 · Story, Akt 5, Schritt 2: „KfW und Prognos rechnen netto 130 bis 153 Mrd. € pro Jahr
gegen fossile Referenztechnik. Als Anteil am BIP sind das 0,4 bis 2,9 % pro Jahr.“**
Der zweite Satz ist für die KfW-Zahl falsch. 130–153 Mrd. € sind 3,0–3,5 % des BIP 2024
(Freigabe Abschn. 8.1, Datensatz `studien_tabelle`, `mehrinvestitionen_anteil_bip_pa`
1,5–3,5). Außerdem misst die KfW-Zahl G3a (Mehrinvestitionen, ohne Abzug eingesparter
Energie), die 0,4–2,9 % sind G3b (`mehrkosten_anteil_bip_pa`, Abgrenzung „G3b“). Die Grafik
direkt daneben zeigt KfW/Prognos netto mit 3,0–3,5 % und widerspricht dem Text sichtbar. Das
ist genau die Verwechslung, vor der Akt 4 warnt.
*Änderung:* „Mehrkosten nach Abzug eingesparter Energie (ISE 2021, ISE 2024, Ariadne) liegen bei
0,4 bis 2,9 % des BIP pro Jahr. Mehrinvestitionen ohne diesen Abzug (KfW/Prognos netto,
Agora) liegen bei bis zu 3,5 %.“ Beide Spannen gibt der Datensatz her.

**K2 · Belegseite, Kurzfassung, Akt 4.4: „Dasselbe Muster beim Netz: 2.100 Milliarden sind bei
der DIHK die Systemkosten von zehn Jahren.“**
Der Satz stellt als Tatsache hin, was N03 als „nicht prüfbar“ führt: dass R21 diese
DIHK-Studie meint. Abschnitt 0 der Freigabe verlangt für „nicht prüfbar“ den Vorbehalt
„im selben Satz“, und Abschnitt 7 nennt genau diesen Satz als einen der drei heikelsten.
Außerdem steht in der Studie 2,1 bis 2,3 Bio. €, nicht „2.100“. Der Satz stammt wörtlich
aus `schritte[4.4].kern` der Freigabeliste, ist dort also schon zu knapp; die Story (Akt 4,
Schritt 4) macht es richtig („In der DIHK-Studie, die wir gefunden haben … Ob R21 eine
andere Veröffentlichung meint, sagt das Papier nicht.“).
*Änderung:* zuerst in der Freigabeliste und im Datensatz `kern` ersetzen, etwa: „Dasselbe
Muster beim Netz: Die 2.100 Milliarden, die R21 einer DIHK-Studie zuschreibt, entsprechen in
der DIHK-Studie, die wir gefunden haben, den Systemkosten von zehn Jahren; welche Studie R21
meint, sagt das Papier nicht.“

### Mittel (schwächt die Seite deutlich)

**M1 · Story, Grafik Akt 5: Titel „Mehrkosten als Anteil am BIP 2024 pro Jahr“.** Die Grafik
enthält Agora (3,4 %), KfW/Prognos netto (3,0–3,5 %), KfW 2021 (1,6 %) und KfW-Zuwachs
(1,5 %), alle G3a, also Mehrinvestitionen. Akt 4 trennt G3a und G3b sauber, Akt 5 wirft sie
unter einem Etikett zusammen. *Änderung:* Titel „Mehrinvestitionen und Mehrkosten …“, Zeilen
nach G3a/G3b gruppieren wie in Akt 4.

**M2 · ZEW-Zahl (R12) auf beiden Seiten.** Belegseite, Aussage R12: „Der Gesamteffekt liegt
eher bei 824 bis 1.071 Mrd. € …, also höher als bei R21“; Gegenposition GP5: „Der
ZEW-Gesamteffekt liegt eher bei 824 bis 1.071 Mrd. € … als bei der von R21 genannten Zahl“.
824 ist R21s eigene Zahl; der Satz widerspricht sich. Die Freigabe (R12) sagt: „Die 824 Mrd. €
sind ein Barwert … Hebel ‚nationale nicht-marktliche Maßnahmen entfallen‘; der Gesamteffekt
liegt eher bei rund 1.071 Mrd. €“. Ursache ist der Datensatz, der beide Werte als
`{min: 824, max: 1071}` einer Zahl speichert. Die Story (GP5) schreibt dadurch beiden Werten
denselben Hebel zu („beziffert den Effekt, wenn nationale Zusatzmaßnahmen entfallen, auf 824
bis 1.071 Mrd. €“). *Änderung:* im Datensatz zwei Felder (`hebel_national` 824,
`gesamteffekt` 1.071) und in beiden Seiten je einen eigenen Satzteil.

**M3 · Story, Widerspruch zwischen Akt 5/2 und GP7.** Akt 5/2: „KfW und Prognos rechnen netto
… gegen fossile Referenztechnik.“ GP7: „KfW und Prognos verzichten 2026 deshalb ganz auf eine
Referenz.“ Beides steht in der Freigabe (V09, O01), meint aber Verschiedenes:
Referenz*technik* je Investition gegen Referenz*szenario*. Ein Leser sieht einen Widerspruch.
*Änderung:* in GP7 „… verzichten 2026 deshalb auf ein Referenzszenario und vergleichen nur je
Anlage mit fossiler Referenztechnik.“

**M4 · Story, Akt 4/4: „Die 740 [A · gelesen · korrigiert], die R21 an anderer Stelle nennt,
passen in diese Größenordnung.“** Die Lesehilfe der Story sagt: „Steht ‚korrigiert‘ dabei, war
ein früher Wert falsch; hier steht nur der neue.“ Hier steht mit diesem Abzeichen der *alte*
Wert. Die Korrektur selbst (N05: nächste Fundstelle ef.Ruhr mit EWI im Unterauftrag, 732 Mrd. €,
Auftraggeber Netze-Gesellschaft Südwest) fehlt in der Story ganz; die Belegseite hat sie.
*Änderung:* Halbsatz „… die nächste Fundstelle dafür, eine Studie von ef.Ruhr mit dem EWI im
Unterauftrag, nennt 732 Mrd. €“; und für R21-Zitate mit Status „korrigiert“ ein eigenes
Abzeichen („R21-Wortlaut, korrigiert siehe …“) statt der allgemeinen Marke.

**M5 · Beide Studientabellen: die Studienangaben in Klammern fehlen.** Freigabe Abschn. 8.1
nennt dort, wo unsere Division abweicht, die Angabe der Studie: ISE 2024 9,3 % (Studie 7–10 %),
Agora G2 12,3 % (Studie 11 %), Agora G3a 3,4 % (Studie 3 %), KfW 2021 4,4 % (Studie 5,2 % des
damaligen BIP), Ariadne G2 2,6–3,0 % (Studie „etwa 3,5 %“). Der Datensatz `studien_tabelle`
hat dafür kein Feld; beide Seiten zeigen nur unsere Werte. Wer die Studie aufschlägt, findet
eine andere Prozentzahl ohne Erklärung. *Änderung:* Feld `bip_pct_studie` im Datensatz,
Spalte „laut Studie“ in beiden Tabellen.

**M6 · Story, Akt 4/3: „Brutto-Größen liegen bei 4,4 bis 12,3 %“.** Die Abgrenzung aus G04
fehlt: „für ganzes System oder alle Sektoren; mit Teilabgrenzungen ab 2,6 %“. Die Grafik
daneben zeigt Ariadne G2 bei 2,6–3,0 %, also unter der genannten Spanne. *Änderung:* „…
bei 4,4 bis 12,3 % für das ganze System; Studien, die nur einen Teil zählen, ab 2,6 %.“

**M7 · Story, Akt 4/2: „Die gesamte Energieversorgung 2025 bis 2045 kostet dort rund 8,6 Bio. €.“**
Freigabe-Schritt 4.2 führt G06 als zugehörige Aussage: Die Jahreswerte derselben Seite ergeben
nur 6,7–8,4 Bio. €. Die Story lässt den Vorbehalt weg (die Belegseite hat ihn in G06).
*Änderung:* Nebensatz „(aus den Jahreswerten derselben Seite ergeben sich 6,7 bis 8,4)“ —
Werte stehen in der Abgrenzung von `ise2024_gesamtaufwand`; besser als eigenes Feld.

**M8 · „Keine Zahl auf dieser Seite ist von Hand eingetippt“ (Story, Kasten „So lesen Sie die
Zahlen“) und „im Seitentext steht keine Zahl von Hand“ (Belegseite, Lesehilfe).** Beides stimmt
nicht. Von Hand stehen im Quelltext (Tabelle H): die Token- und Werkzeugzahlen des Protokolls
(Story und Belege), 456 / 428 / 352 / 46 / 27 (Belege), „59 Seiten“ (Belege S02), die
R21-Untergrenze als Wort „zehn“ („Auch keine Spanne von zehn bis 13,8“; „nicht bei zehn und
mehr“), der Multiplikator „zwanzig Jahre“ der Setzung F07, „Fünf weitere Punkte“, „Drei Gründe“.
Die Belegseite sagt im Kasten „Entstehung“ selbst, dass die Protokollzahlen nicht aus dem
Datensatz kommen, widerspricht damit aber ihrer Lesehilfe. *Änderung:* „zehn“ durch den
Platzhalter `r21_kosten_zitat.min` ersetzen; Protokollzahlen in einen eigenen kleinen
Datenblock oder die Aussage eingrenzen („Keine Zahl aus Studien oder Dokumenten ist von Hand
eingetippt; die Protokollzahlen stammen aus `agents/PROTOKOLL.md`.“).

**M9 · Story, GP5, Einschränkung: Wie stark nationale Maßnahmen wirken, ist „teilweise,
zeitabhängig und politisch“.** Die Anführungszeichen lassen ein Zitat aus der ZEW-Studie oder
von der Kommission vermuten. Es ist die Formulierung unseres eigenen Dossiers 09 (Z. 61). Die
Freigabe (GP5) und die Belegseite nennen die Herkunft „(Dossier 09, KA 6)“, die Story nicht.
*Änderung:* Anführungszeichen weg oder „… ist nach unserer Recherche (Dossier 09) …“.

### Klein

| Nr. | Fundstelle (gerendert) | Problem | Vorschlag |
|---|---|---|---|
| k1 | Story, GP10: entstehe „ein falsches Bild der tatsächlichen Kosten der Transformation“; Belege GP10: das BMWK erzeuge ein „falsches Bild der tatsächlichen Kosten“ | Zitat gekürzt um „außerhalb der Fachöffentlichkeit“; das weitet die Aussage. GP6 und Belege N08 zitieren vollständig | vollständig zitieren wie in GP6 |
| k2 | Story, GP6: „R21 greift also auf die einzige amtliche Fundstelle zurück, die es gibt.“ | nicht freigegebener Satz; das Glossar der Story sagt, eine Kurzinformation sei „keine Position des Bundestags“; BRH-Bericht und Drs. 21/903 sind ebenfalls amtlich | „… auf die einzige Kostenzahl aus dem Bundestag zurück, die es gibt“ oder streichen |
| k3 | Belege, Kurzfassung 3.2: „Es sind Investitionen plus Energiekosten, sagt der Bundestag selbst.“ | Widerspricht dem Glossar (keine Position des Bundestags); stammt aus `schritte[3.2].kern` | „… schreibt der Wissenschaftliche Dienst des Bundestags“ |
| k4 | Story, Akt 1/4 und Grafik: „4 eine Fundstelle, 6 nur Urheber, 27 keine Quelle“; Grafik „2 · im Datensatz nicht zugeordnet“ | 4 + 6 + 27 = 37 von 39. Dossier 01 (Tab. Z. 271) und Prüfbericht 01 K1 ordnen die zwei zu: 1 Verweis auf eigenes Factsheet, 1 eigene Rechnung. Außerdem liest sich „4 mit Fundstelle“ neben „die einzige externe Fundstelle“ als Widerspruch | beide Kategorien in den Datensatz; ein Satz, warum nur eine der vier Fundstellen extern ist |
| k5 | Story, „Anmerkung zu Akt 3“ mit dem ifo-Auszug (500 bis über 3.000 Milliarden) | Entscheidung D4 / Abschnitt 3: „nur in der Fußnote oder im White Paper, nicht im Story-Text“. Die Anmerkung steht als eigener Absatz im Lesefluss | als echte Fußnote am Seitenende oder nur auf der Belegseite (dort ist sie Fußnote 1) |
| k6 | Story, Prolog: „Teil 1 rechnet nicht selbst. Er liest.“ | Die Seite rechnet: BIP-Anteile, drei Setzungen, GP4 „Wir haben die Messdaten … durchgerechnet“ | „Teil 1 hat kein eigenes Kostenmodell“ (Freigabe Abschn. 6.1) |
| k7 | Story, GP2: „lag 2025 −15,0 % unter 2018“; „dämpfen … um rund −4,4 %“ | doppelte Verneinung, wörtlich ein Plus | Betrag ohne Vorzeichen oder „lag … um 15,0 % unter“ (Formatoption) |
| k8 | Story, Kasten Klimafolgen: „Die Studie nennt das ausdrücklich eine Untergrenze.“ | Die Studie ist nicht gelesen (V11, `primaer_gelesen: false`); der Satz schreibt ihr eine Aussage direkt zu | „Laut Bundestagsmeldung nennt die Studie …“ |
| k9 | Story, Abschnitt „Warum niedrige Mehrkosten zu optimistisch sein können“ | Der Klimafolgen-Kasten steht unter dieser Überschrift, argumentiert aber in die Gegenrichtung | eigener Zwischentitel oder hinter GP12 |
| k10 | Story, GP12 und Kasten „Entstehung“: „Zahl für Zahl am Original nachgeschlagen“, „schlugen jede Zahl … am Original nach“ | Protokoll Z. 63: 428 Werte geprüft, 27 davon nicht prüfbar; für Dossier 05/07/09/10 teils Nachrechnung statt Nachschlagen (Freigabe Kopf) | „… haben die Zahlen der Dossiers am Original nachgeschlagen oder nachgerechnet“ |
| k11 | Belege, Entstehung: „428 Werte …: 352 bestätigt, 46 abweichend, 27 nicht prüfbar“ | Summe 425; das Protokoll erklärt die drei Werte ohne Zuordnung, die Seite nicht | Halbsatz aus dem Protokoll übernehmen |
| k12 | Story, Grenzen-Karte: „Die PwC-Studie (Quelle der 13,3 Billionen [Q3 · A · gelesen])“ | Abzeichen „gelesen“ im Satz über eine ungelesene Studie | Abzeichen hier unterdrücken (`data-c="0"`) |
| k13 | Story, Akt 4/3: „Mehrkosten … bei 0,4 bis 2,9 %“ ohne Chip | Die Chip-Zusammenfassung je Absatz verschluckt das Abzeichen „korrigiert“ dieser korrigierten Spanne | Chips je Zahl-ID statt je Quelle zusammenfassen |
| k14 | Belege, Korrekturen-Tabelle E04: „0 bis 12 (Mitte: 2,7) GW [B ✓ am Original gelesen]“ | Das obere Ende 12 GW ist laut E04 nur Parteiwiedergabe (Radiant); der Vorbehalt fehlt in dieser Tabelle (in der Aussagen-Tabelle steht er) | „oberes Ende nur als Parteiwiedergabe gelesen“ ergänzen |
| k15 | Belege, N06 und Netztabelle: „675 bis 792 (Mitte: 732) Mrd. €“ | 732 ist kein Mittelwert, sondern der ef.Ruhr/EWI-Wert; Freigabe: „675 / 732 / 792“ | drei Werte mit Quelle nennen |
| k16 | Belege, Tabelle 3b, dena: „0,35 Bio. €“; Story: „0,345 Bio. €“ | Rundung weicht ab; Freigabe 345 Mrd. € | „345 Mrd. €“ |
| k17 | Belege: Formatierung | O02/GP8/GP12 „kosten 16 bis 235 % Mehrkosten gegenüber Basisszenario“ (Einheitentext in den Satz gekippt); R04 „gegenüber 2018 %: −15 %“; Kurzfassung mit geraden Anführungszeichen ('nicht überleben'); innerText „2.213,8“ (Schrittnummer und Zahl ohne Trenner, für Screenreader ein Wert); Grafik zweimal „Prognos für KfW (2026) · G3a“ ohne Unterschied (Zuwachs / netto), Gruppe „G3 · Mehrkosten“ enthält G3a; die 27 Quell-URLs stehen als `URLMAP` im Quelltext statt im Datensatz (alle stimmen mit den Manifesten überein) | Formatfunktion je Einheit; Label „Zuwachs“ / „netto“; URLs in `sources` des Datensatzes |

## Prüftabellen

### A · Datensatz gegen Freigabeliste

| Prüfung | Ergebnis |
|---|---|
| `data/teil1_data.json` gegen den ```json-Block in `docs/03_teil1_freigabe.md` | identisch (Python `==` je Schlüssel: meta, zahlen, claims, schritte, gegenpositionen, verworfen, verbotene_formulierungen, studien_tabelle, offene_entscheidungen, sources) |
| Status-Zählung | 57 / 17 / 4 / 3 / 6 = 87, auf beiden Seiten so angezeigt (Story-Hero, Belege-Lesehilfe und Filter „87 von 87“) |
| Lücke im Datensatz selbst | `studien_tabelle` ohne Studienangaben (M5); ZEW als eine Spanne (M2); `r21_haupttext_zahlen` ohne zwei Kategorien (k4); `schritte[4.4].kern` ohne Vorbehalt (K2) |

### B · Story: jede Zahl und jeder tragende Satz

✓ = Wert, Einheit, Abgrenzung und Vorbehalt wie freigegeben. Abweichungen mit Befund-Nr.

| Stelle | Gerendert (Kurzzitat) | Freigabe | Ergebnis |
|---|---|---|---|
| Hero | „Die 13,8 Billionen“; „10 bis 13,8 Billionen Euro [A · gelesen]“; 87 / 57 / 17 / 6 | S04, S05; counts | ✓ |
| 1/1 | BILD 20.11.2026, „Den Artikel selbst haben wir nicht gelesen“; Papier „vollständig gelesen“, „kein Rechenmodell“ | S01 (nicht prüfbar), S02 | ✓ (kein Autor, D7) |
| 1/2 | Druckseite 3 „Kosten“, Druckseite 12 „Investitionskosten“ | S04, S05 | ✓ |
| 1/3 | „2,2 bis 3,0 Jahres-BIP“, BIP 2025 | S06, D3 | ✓ |
| 1/3 | „Entzug von Wertschöpfung“ … „zieht nicht ab, was ein anderes Energiesystem … kosten würde“ | S08 | ✓ |
| 1/4 | 39; 4 / 6 / 27; „einzige externe Fundstelle“ | S07 | Werte ✓; Summe 37 → k4 |
| Steckbrief | Förderhinweis wörtlich, „wie wir bei jeder Studie Auftraggeber … nennen“ | S03, D8 | ✓ nur im Steckbrief |
| GP6 | „keine eigenen Abschätzungen“, BRH vollständig zitiert | F09, G10, N08 | ✓; Zusatzsatz „einzige amtliche Fundstelle“ → k2 |
| 2/1 | WD-Satz wörtlich, 500 Mrd. € / 13,3 Bio. €; „Das Wort bei R21 stammt also aus dem Titel“ | F01, F08, Fairness-Check | ✓ |
| 2/2 | „13,8 kommt … nicht vor“, „Woher die Abweichung kommt, wissen wir nicht“; „10 … Unsere Vermutung: 500 Milliarden pro Jahr mal zwanzig Jahre“ [Setzung (M)] | F02, F03, F07, X01/X02 | ✓; „zehn“ und „zwanzig“ von Hand → M8 |
| 2/3 | „Der Dienst referiert, er rechnet nicht“ | F04, Fairness-Check | ✓ ohne Vorwurf |
| 2/4 | „gibt … wieder“, Zitat S. 5 | F05, F06 („referiert“, nicht „verlangt“) | ✓ |
| 3/1 | PwC, Titel, „S. 4 (abrufbar nach Registrierung)“; „vier Glieder … zwei nicht“ | Q01, Q02 | ✓ |
| 3/2 | Pflichtsatz Q03 + Q04 | Abschnitt 3 | ✓ wörtlich |
| 3/3 | Pflichtsätze Q05, V06, Q06; Badge „C · nicht gelesen · nicht prüfbar“ | Abschnitt 3, X04, X05 | ✓ wörtlich |
| 3/4 | Pflichtsätze Q08, Q09 | Abschnitt 3 | ✓ wörtlich |
| Anm. Akt 3 | „500 Milliarden bis über 3.000 Milliarden Euro … ungeprüft (Konfidenz C)“ | Q08 Fußnote, D4 | Wortlaut ✓, Platz → k5 |
| 4/1 | G1 / G2 / G3; Bundesregierung „keine energiewendebedingten Zusatzkosten“ | G01, G10 | ✓ |
| 4/2 | 8,6 Bio. €; 54 Mrd. € (28 bis 85); „rund 1,1 bis 1,35 Bio. €“ [Setzung (M)] | G05, G06 | Werte ✓; G06 fehlt → M7 |
| 4/3 | BIP 2024 4.386,94 [Setzung (M)]; 4,4–12,3 %; 1,5–3,5 %; 0,4–2,9 %; R21 11,4–15,7 % | G02–G04, G12; X07 vermieden | Werte ✓; Abgrenzung G04 → M6; Chip → k13 |
| 4/4 | 2.100 „nach einer Studie der DIHK“; 1,2 Bio. € 2025–2049; 2,1–2,3 Bio. € zehn Jahre; „Ob R21 eine andere Veröffentlichung meint, sagt das Papier nicht“; 675 / 732 / 792; 740 | N01–N03, N05, N06; X10 vermieden | ✓ für N03; 740 → M4; „(Investition und Betrieb)“ fehlt (klein, in Belege vorhanden) |
| Studientabelle | alle Zeilen 8.1 und 8.2 mit Auftraggeber, (M)-Marken, grau „nicht am Original gelesen“ | Abschnitt 8 | Werte ✓; Studienangaben → M5; dena-Rundung → k16 |
| GP10, GP11 | >460 Mrd. €; 18,49 Mrd. €; 323 → 440, Einschränkung 364–392 | N08, O06, N09, O04 | ✓; Zitat gekürzt → k1 |
| 5/1 | Kehrtwende-Zitat; „nur Kraftwerke“; 310 / 350 Mrd. €; 372 / 595 / 868 [Setzung (M)]; 2040–2047, ungünstig 2056 | V01–V05, D5 | ✓ (2038 nicht genannt) |
| 5/2 | 1,0–3,3 Bio. € (ISE 2021); Ariadne 16–26; KfW netto 130–153; „Als Anteil am BIP sind das 0,4 bis 2,9 %“; DIHK 530–910 | V07–V10 | **K1**; Grafik → M1; Widerspruch → M3 |
| 5/3 | +16 bis +235 %; Zinsen fehlen; Netz- und Windkosten | O01–O06; X09 vermieden | ✓ |
| 5/4 | sechs Punkte „Hier hat R21 recht“ | R01–R12, F09; X14 vermieden | ✓ (R13 nicht genannt) |
| GP7–GP9 | 1,9 Bio. €; ISE 2021 2,2–2,9 %; Beharrung; Zinsen, „Lücke, kein Befund“ | O01, V07, O02, V08, O03, N10; X08 vermieden („fossilste Referenz“) | ✓; M3 |
| Klimafolgen | 280–900 Mrd. € [B · nicht gelesen]; 345 / 990 €/t; „nicht addiert“ | V11–V13, D6 | ✓ ein Kasten; k8, k9 |
| GP1–GP5 | 38 → 98 %, 29 → 90 %; −15,0 / −12,2; −17,9 / −20,0 / −15,6 / −18,2; 13,1 / 10,5 / 17,4 / 15,6; 36,2 / 28,3; 4,8–7,0 / 6,3–7,5 / 7,1 TWh; 231–390 GWh; 109 Tage; −50 %; 824–1.071 | R01–R12, E02 | Werte ✓; ZEW → M2; Zitat → M9; Vorzeichen → k7 |
| GP12 | +16 bis +235 %; 90–150 Mrd. €; 109 Tage; +3 / +10 / +22 %; 2,7 GW; „verlange“ → „referiert“ | E01–E04, O02, G03, R11, F10, R12, F06 | ✓ keine verworfene Altzahl genannt; k10 |
| Grenzen | acht Karten | Abschnitt 6 | ✓ |
| Entstehung | Token laut Protokoll; menschliche Entscheidungen; nicht Gelesenes | Protokoll, README | Zahlen stimmen mit `agents/PROTOKOLL.md` (Z. 33, 63, 72); von Hand → M8 |

### C · Belegseite

| Abschnitt | Ergebnis |
|---|---|
| Lesehilfe, Statuszählung | ✓; Satz „keine Zahl von Hand“ → M8 |
| Kurzfassung (21 Schritte aus `schritte[].kern`) | ✓ bis auf 4.4 (**K2**) und 3.2 (k3) |
| Steckbriefe | ✓ Förderhinweis nur als Faktenangabe (D8) |
| Aussagen-Tabelle, 87 Zeilen | Wortlaut je Claim nah an Abschnitt 2; nicht prüfbare Claims mit Vorbehalt im Satz; verworfene Claims (F10, G13, N07, R13) nur als „VERWORFEN … nur im Abschnitt ‚Verworfen‘“. Abweichungen: R12 (M2), N06 „Mitte“ (k15), O02/R04 Formatierung (k17) |
| Studien-Vergleich 3a / 3b, Grafik | Werte ✓, 3b grau mit C/○; M5, k16, k17 |
| Zitat und Quelle 4a / 4b | ✓; „Unser Schluss und seine Grenze“ setzt N03 richtig |
| Zwölf Gegenpositionen | ✓ alle mit Inhalt, Beleg, Einschränkung, Claim-Badges; GP5 → M2; GP10 → k1 |
| 6a Nicht gelesen | ✓ alle Pflichtsätze wörtlich, Fußnote 1 für den ifo-Auszug (D4 erfüllt) |
| 6b Verworfen | Tabelle mit allen elf verworfenen Werten und alle 14 verbotenen Formulierungen, klar markiert. Laut P4-Brief, Punkt 6, hier erlaubt (siehe Entscheidung E-2 unten) |
| 7 Korrekturen | ✓ Richtungen wie GP12; E04 → k14 |
| 8 Grenzen, 9 Quellen, 10 Entstehung | ✓; k11; URLs aus `URLMAP`, alle in den Manifesten vorhanden (k17) |

### D · Verworfene Zahlen und verbotene Formulierungen (gerenderter Text, beide Seiten)

Gesucht wurde nach: „Faktor“, 651, 0,4–1,9, 30–100, 172, 2038, 38/69/111, 7,5/27/57, „gefälscht“,
„erfunden“, „gelogen“, „manipul…“, „Fake“, „aufgerundet“, „aufgebläht“, „falsch referiert“,
„Referatsfehler“, „Weiter wie bisher“ ohne „laut DIW“, „kostet nichts“, „lohnt sich“, „nur 16“,
„Ausreißer“, „einziges Industrieland“, „auch ohne Energiewende“, 4,1.

| Fund | Wo | Urteil |
|---|---|---|
| alle verworfenen Werte, X01–X14 | Belege, Abschnitt 6b | zulässig (Quarantäne, markiert) |
| „Weiter wie bisher“ | Story 3/3 und Grafik Akt 3, beide Tabellen, Belege Q05/V06/3b | stets „laut DIW“ oder mit Badge „C · laut DIW · PwC-Original nicht gelesen“; in der Belege-Grafik nur mit ○ ohne „laut DIW“ (vertretbar, die Zeile ist als nicht gelesen markiert) |
| „lohnen sich“ | nur im PwC-Titel | zulässig (Q02) |
| „4,1“ | Belege, Korrekturen E04 „Alter Wert: mid 4,1“ | kein verworfener Wert (steht als `alt` im Datensatz), zulässig |
| sonst | – | **kein Fund** |

### E · Pflichtsätze aus Abschnitt 3

| ID | Story | Belege |
|---|---|---|
| Q05 | Akt 3/3, wörtlich | Q05-Zeile und 6a, wörtlich |
| Q06 | Akt 3/3, wörtlich | Q06-Zeile und 6a, wörtlich |
| V06 | Akt 3/3, wörtlich | V06-Zeile und 6a, wörtlich |
| Q03 + Q04 | Akt 3/2, wörtlich | Q03, Q04, 4a |
| Q08 | Akt 3/4, wörtlich | Q08-Zeile und 6a, wörtlich |
| Q08 Fußnote | Anmerkung im Lesefluss (k5) | Fußnote 1 ✓ |
| Q09 | Akt 3/4, wörtlich | Q09-Zeile mit „(Setzung (M))“ |

### F · Zwölf Pflicht-Gegenpositionen

| GP | Story (eigener Kasten) | Einschränkung laut Abschnitt 5 | Belege |
|---|---|---|---|
| GP1 | nach Akt 5 | R02, Anlagen laufen weiter (Teil 4) ✓ | ✓ |
| GP2 | nach Akt 5 | R05, Ursachen nicht zerlegt, Bundesbank als Modellrechnung ✓ | ✓ |
| GP3 | nach Akt 5 | älter als Krise, kleiner geworden, Gaspreis, C für Ursachen ✓ | ✓ |
| GP4 | nach Akt 5 | R09 Technik, E02 109 Tage ✓ | ✓ |
| GP5 | nach Akt 5 | EU-27, Barwert, „teilweise, zeitabhängig und politisch“ ✓ (Herkunft fehlt, M9) | ✓ mit Herkunft |
| GP6 | **vor Akt 2** wie im Fairness-Check verlangt | G10 ✓ | ✓ |
| GP7 | nach Akt 5 | letzter Schritt, fossilste Referenz 2,2–2,9 % ✓ | ✓ |
| GP8 | nach Akt 5 | Hochlauf gleicht Beharrung ✓ | ✓ |
| GP9 | nach Akt 5 | „Lücke“ ✓ | ✓ |
| GP10 | nach Akt 4 | keine Gesamtkostenzahl ✓ | ✓ |
| GP11 | nach Akt 4 | NEP 2025 senkt wieder ✓ | ✓ |
| GP12 | eigener Abschnitt „In eigener Sache“ | „fast keine falsch abgeschriebenen Zahlen“ ✓ | ✓ |

Keine Gegenposition ist versteckt, gebündelt oder nur in einer Grafik. Bei 390 px stehen alle
zwölf im Text (gleicher Wortbestand wie bei 1280 px; nur Achsenticks und Zeilenumbrüche in SVGs
unterscheiden sich).

### G · Entscheidungen D1–D8

| Nr. | Story | Belege |
|---|---|---|
| D1 Stellungnahme R21 | „Wir fragen R21 vor der Veröffentlichung“ ✓ | „steht aus“ ✓ |
| D2 PwC später | ✓ offen ausgewiesen | ✓ |
| D3 BIP 2024 / 2025 | ✓ | ✓ |
| D4 ifo-Auszug nur Fußnote | grenzwertig (k5) | ✓ |
| D5 Kernkraft nur Hinweis | ✓ „kurzer Hinweis … volle Rechnung in Teil 6“ | ✓ |
| D6 Klimafolgen ein Kasten | ✓ (Platzierung k9) | ✓ als Kasten unter 3 |
| D7 kein BILD-Autor | ✓ | ✓ |
| D8 Förderhinweis nur Steckbrief | ✓ (in der Studientabelle als Geldgeber-Spalte wie in Abschn. 8 der Freigabe) | ✓ |

### H · Zahlen im HTML-Quelltext statt im Datensatz

Ziffernsuche im Quelltext außerhalb der Skripte und in allen Text-Literalen der Skripte.
Ausgenommen sind laut P4-Brief Jahreszahlen, Seitenangaben und Aktenzeichen.

| Zahl | Seite | Herkunft | Urteil |
|---|---|---|---|
| 3.247.322 / 2.542.472 / 376.633 Token | Story und Belege | Protokoll Z. 33, 63, 72 — stimmen | von Hand; Belege legt das offen, Story nicht (M8) |
| 981 / 630 / 57 Werkzeugaufrufe, 6.166.427 Summe, 456 / 428 / 352 / 46 / 27 | Belege | Protokoll — stimmen (Summe 425, k11) | von Hand, offengelegt |
| „zehn“ (R21-Untergrenze) | Story 2/2, 5/2 | `r21_kosten_zitat.min` | von Hand als Wort (M8) |
| „zwanzig Jahre“ | Story 2/2 und Grafik, Belege F07, G12 | Abgrenzung von F07 / `r21_anteil_bip_pa` | Parameter der Setzung von Hand (M8) |
| „59 Seiten“ | Belege S02 | Freigabe S02 (nicht in `zahlen`) | von Hand, Wert stimmt |
| „Fünf weitere Punkte“, „Drei Gründe“, „sechs Seiten“, „achten Monitoring-Bericht“, „vier Glieder“ | Story | Struktur | unkritisch |
| 2027 (Entscheidungsjahr), 2028–2048, 2022–2050, 1995/96, 2015–2025, 2030 | Story und Belege | Abgrenzungen im Datensatz | Jahreszahlen, zulässig |
| 27 Quell-URLs (`URLMAP`) | Belege | Manifeste, alle gefunden | keine Zahl, aber Daten außerhalb des Datensatzes (k17) |
| Grafik-Achsenticks (0, 5, 10, 15; 0–2.000; 0–800) | Story | Skript | zulässig |

Alle übrigen gerenderten Zahlen kommen aus dem Datensatz (automatischer Abgleich jeder
gerenderten Zahl gegen alle Werte in `teil1_data.json`; Rest nur Jahre, Seiten, Aktenzeichen,
Quellnummern).

### I · Technik und fremde Server

| Prüfung | Story | Belege |
|---|---|---|
| Anfragen (1280 px) | 9, alle `localhost`: Seite, drei Schrift-CSS, drei woff2, `site-chrome.js`, `teil1_data.json` | 8, alle `localhost` |
| fremde Skripte, Fonts, iframes, Bilder | keine | keine |
| `noindex`, Entwurfsband | ✓ | ✓ |
| Konsole | leer | leer |

## Was eine Entscheidung des Menschen braucht

1. **E-1 · Kernsätze der Freigabe.** K2 und k3 stehen wörtlich in `schritte[].kern` der
   Freigabeliste. Die Belegseite gibt sie korrekt wieder. Korrigieren muss man zuerst die
   Freigabeliste und den Datensatz, dann baut die Seite sich richtig.
2. **E-2 · Verbotsliste auf der Belegseite.** Der P4-Brief erlaubt die verworfenen *Zahlen* in
   der Tabelle „Verworfen“. Die Belegseite zeigt dort zusätzlich alle 14 *verbotenen
   Formulierungen* im Wortlaut („gefälscht / erfunden / gelogen …“). Das ist transparent, aber
   die Freigabe sagt für „verworfen“: „weder als Zahl noch als Formulierung“. Wer die Seite
   zitiert, kann den Satz „Die Energiewende kostet nur 16 Milliarden im Jahr“ von ihr
   abschreiben. Vorschlag: behalten, aber jede Zeile mit dem Kennzeichen „nicht verwendet“
   vor dem Wortlaut.
3. **E-3 · ZEW im Datensatz (M2).** Zwei getrennte Felder statt einer Spanne; betrifft die
   Freigabeliste.
4. **E-4 · Studienangaben in der Tabelle (M5).** Ein neues Datensatz-Feld; betrifft die
   Freigabeliste.
