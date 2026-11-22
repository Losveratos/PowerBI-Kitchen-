# Review 02 · Wirtschaftsjournalist einer überregionalen Zeitung

Teil 1 „Die 13,8 Billionen“ · Scroll-Story und Belegseite · Stand des Entwurfs 22.11.2026
Auftrag: `energiewende/agents/briefs/P5_reviews_teil1.md`, Rolle 02 · Regeln: `agents/REGELN.md`
Gelesen wie ein Leser: beide Seiten per Playwright (Chromium) bei 1280 px und 390 px gerendert, Text
nach dem Einsetzen der Zahlen ausgelesen (Story rund 6.700 Wörter einschließlich Grafiktext, Belegseite
rund 11.600). Keine Konsolenfehler, keine Abrufe von fremden Servern, keine waagerechte Rollleiste bei
390 px. Drei Kernstellen selbst am Original nachgeschlagen: R21-Erklärung (Text Z. 76–86, 588–600,
1062–1072, 1386–1390), WD 5 – 3000 – 135/24 (S. 2 mit Fn. 4–6), WD 5 – 3000 – 151/24 (Z. 633–639,
Fn. 48). Alle drei Zitate der Seite stimmen wörtlich.

## 1. Urteil in fünf Zeilen

Die Recherche hält: 13,8 steht nicht in der zitierten Quelle, und die 13,3 enthalten laut Bundestag selbst Energiekosten. Das habe ich am Original nachgeprüft, es ist zitierfähig.
Aus der Seite würde ich zitieren, aus Akt 5 so nicht. Dort widerspricht ein Satz der Grafik direkt daneben, und ein Fachredakteur sieht das in einer Minute.
Die eigentliche Geschichte steht in Konfidenz C versteckt: Laut DIW sind die 13,3 Billionen die Kosten des Szenarios *ohne* beschleunigten Klimaschutz. Zur Prüfung fehlt eine Registrierung bei PwC.
Die Seite ist zu lang für das, was sie trägt. Die „zehn Minuten“ stimmen nicht, und zwölf Gegenpositionskästen verwässern den Befund.
Empfehlen: ja, als Recherchequelle und wegen der Offenlegung. Veröffentlichen erst, wenn R21 geantwortet hat und Akt 5 korrigiert ist.

## 2. Befunde nach Gewicht

### Kritisch

**K1 · Akt 5 nennt eine Prozentspanne, die nicht zu den genannten Studien passt, und sagt „oberer Rand“, wo die Grafik etwas anderes zeigt**

- Fundstelle: Story, Akt 5 / Schritt 2. „KfW und Prognos rechnen netto 130 bis 153 Mrd. € pro Jahr gegen fossile Referenztechnik. Als Anteil am BIP sind das 0,4 bis 2,9 % pro Jahr. Am oberen Rand steht die Studie mit der fossilsten Referenz.“ Fast gleich in GP7: „Die Studie mit der fossilsten Referenz (Fraunhofer ISE 2021) liefert die höchsten Werte: 2,2 bis 2,9 %“. Auf der Belegseite steht das ebenso im Kasten GP7.
- Problem: „Das“ meint grammatisch die drei Studien davor. KfW/Prognos netto liegt aber bei 3,0 bis 3,5 % des BIP 2024. So steht es in der Grafik von Akt 5 direkt daneben, in der Studientabelle und in der Freigabeliste Abschn. 8.1. Agora steht in derselben Grafik mit 3,4 %. ISE 2021 (bis 2,9 %) ist also nicht am oberen Rand, sondern liegt darunter. Die Spanne 0,4 bis 2,9 % gilt nur für G3b (Mehrkosten nach Abzug eingesparter Energie). Akt 4 trennt G3a und G3b sauber, Akt 5 wirft beides wieder zusammen. Ein Leser, der den Satz zitiert („Mehrkosten 0,4 bis 2,9 % – auch bei der KfW“), zitiert etwas Falsches. Ein Gegner der Seite wird genau diese Stelle nehmen, um die ganze Seite unglaubwürdig zu machen.
- Beleg: Gerenderter Text Akt 5, Grafikbeschriftungen „Agora · fossile Referenztechnik 3,4 %“ und „KfW/Prognos 2026, netto · fossile Referenztechnik 3,0 bis 3,5 %“. Freigabeliste Abschn. 8.1, Zeilen Agora G3a und Prognos G3a. HTML `energiewende-1-story.html` Z. 679–680 und 719.
- Vorschlag: Den Satz trennen. „Als Mehrkosten nach Abzug eingesparter Energie sind das 0,4 bis 2,9 % des BIP pro Jahr; rechnet man nur die zusätzlichen Investitionen gegen fossile Technik (Agora, KfW/Prognos), sind es 3,0 bis 3,5 %.“ „Am oberen Rand …“ nur für die G3b-Gruppe sagen, mit dieser Einschränkung im Satz. GP7 genauso ändern („unter den Mehrkosten-Studien die höchsten Werte“). Die Grafik von Akt 5 sollte G3a und G3b sichtbar trennen, wie in Akt 4.

**K2 · Die Stellungnahme von R21 fehlt**

- Fundstelle: Story, „Was Teil 1 nicht zeigt“, letzter Punkt: „Wir fragen R21 vor der Veröffentlichung“. Belegseite oben: „Stellungnahme von R21: steht aus.“
- Problem: Die Seite wirft einer namentlich genannten Organisation vor, eine Zahl stehe so nicht in ihrer Quelle (13,8 gegen 13,3; 2.100 Mrd. Netzkosten gegen 1,2 Bio.). Keine Redaktion druckt das ohne Konfrontation, mit angemessener Frist und dem Ergebnis im Text. Die Entscheidung dafür ist schon gefallen (README, „Teil 1 · Anfrage an R21“), deshalb steht das hier als Erinnerung und nicht als Vorwurf. Es bleibt aber eine harte Bedingung.
- Vorschlag: Drei konkrete Fragen mit Frist, etwa fünf Werktage: (1) Woher stammt 13,8? (2) Wie ist die Untergrenze 10 hergeleitet? (3) Welche DIHK-Veröffentlichung nennt 2.100 Mrd. für Netze? Die Antwort steht wörtlich und gekürzt in Akt 2, nicht nur auf der Belegseite. Bleibt die Antwort aus, steht das mit Datum der Anfrage in Akt 2.2.

### Mittel

**M1 · Die stärkste Pointe hängt an einer Quelle, die eine Registrierung entfernt liegt**

- Fundstelle: Akt 3 / Schritt 3, „Nach der Darstellung des DIW … ‚Weiter wie bisher‘ … Laut DIW kommt in derselben Studie der beschleunigte Klimaschutzpfad auf 13,2 Billionen“, mit Badge „C · nicht gelesen“.
- Problem: Wenn das DIW richtig referiert, nennt R21 als „Kosten der Energiewende“ die Kosten des Pfads, der die Energiewende *nicht* beschleunigt. Das wäre die Schlagzeile. Die Seite formuliert das korrekt vorsichtig. Der Leser aber merkt sich die Grafik mit zwei fast gleich hohen Balken, und Konfidenz C ist eine schwache Grundlage für das Bild, das hängen bleibt. Die Lücke lässt sich schließen: Die PwC-Studie ist laut WD-Fußnote „abrufbar nach Registrierung“, kostenlos. Das ist keine Bezahlschranke. Entscheidung D2 der Freigabeliste empfiehlt das bereits.
- Beleg: WD 135/24, Fn. 6 (selbst gelesen); Freigabeliste Abschn. 9, D2.
- Vorschlag: Der Mensch registriert sich und liest PwC S. 4 vor der Veröffentlichung. Bestätigt sich das DIW, wird Akt 3.3 auf A/B gehoben, und der Befund rückt in den Vorspann. Bestätigt es sich nicht, fällt die Grafik weg. Beides ist besser als der jetzige Zustand.

**M2 · Der Kasten zum Emissionshandel (GP5) ist ohne Vorwissen nicht zu verstehen und lässt R21s eigene Zahl weg**

- Fundstelle: Story, GP5: „Die ZEW-Studie … beziffert den Effekt, wenn nationale Zusatzmaßnahmen entfallen, auf 824 bis 1.071 Mrd. € als Barwert. Der Gesamteffekt liegt eher am oberen Ende, also höher als bei R21.“
- Problem: Der Leser erfährt nicht, *welcher* Effekt gemeint ist (eine Kostenersparnis), *welche* Zahl R21 nennt und wofür R21 sie verwendet. R21 nennt die Zahl zweimal verschieden: 824 Mrd. (Text Z. 1389) und „bis zu 850 Mrd. Euro Kostenersparnis“ (Z. 1072). Die 850 stehen laut Freigabe R12 nicht in der Studie, das fehlt auf der Story. Der Kasten ist dadurch weder für R21 stark noch gegen R21 präzise. Die Überschrift „Beim Emissionshandel stimmt R21s Zahl“ bezieht sich nur auf die −50 %, der Absatz handelt aber vom ZEW.
- Beleg: R21-Text Z. 1066–1072 und 1386–1390 (selbst gelesen); Freigabe R12.
- Vorschlag: Ein Satz Klartext: „R21 stützt sich auf ein ZEW-Gutachten: Würden die EU-Staaten ihre nationalen Zusatzregeln neben dem Emissionshandel aufgeben, sänken die Kosten des Klimaschutzes in der EU bis 2048 um 824 Mrd. € (Barwert, EU-27). Das ZEW nennt als Gesamteffekt sogar rund 1.071 Mrd. €. R21s zweite Angabe, 850 Mrd., steht so nicht in der Studie.“ Die Überschrift so fassen, dass sie beide Teile deckt: „Beim Emissionshandel hat R21 einen Punkt, eher einen stärkeren“.

**M3 · Akt 5 heißt „Mehrkosten“ und zeigt Mehrinvestitionen**

- Fundstelle: Story, Akt 5, Grafik „Mehrkosten als Anteil am BIP 2024 pro Jahr“. Darin stehen „Agora · fossile Referenztechnik“ und „KfW/Prognos 2026, netto“ (G3a, Mehr*investitionen*) neben ISE und Ariadne (G3b, Mehr*kosten*). Der Untertitel „Mehrkosten als Anteil am BIP“ steht schon über Schritt 1, obwohl dort Kernkraft-Milliarden gezeigt werden (Bildschirmfoto `…/scratchpad/r02/akt5_0.1280.png`).
- Problem: Die Seite erklärt in Akt 4 genau diesen Unterschied als Kern ihres Arguments und vermischt ihn dann eine Grafik später selbst. Das ist der Fehler, den sie R21 vorhält. Ursache von K1.
- Vorschlag: In der Grafik von Akt 5 zwei Gruppen mit Zwischenüberschrift (G3a / G3b). Den Grafiktitel je Schritt setzen (Schritt 1: „Kernkraft-Neubau, Mrd. €“).

**M4 · „Quellen“, die Arbeitsdateien sind, und ein Verweis ins Leere**

- Fundstelle: Story, Quellenliste Q33–Q40 und die Badges im Text. Tragende Zahlen verweisen auf interne Dateien: „4,4 bis 12,3 %“, „+16 bis +235 %“ und „14,5 %“ auf Q36 = `research/pruefung/02_pruefung.md`; „1,5 bis 3,5 %“ und „11,4 bis 15,7 %“ auf Q40 = „dieses Dokument, Abschnitt 8“. „Dieses Dokument“ meint die Freigabeliste, auf der Story liest es sich aber als Verweis auf die Story selbst, und es gibt keinen Link. Die Belegseite kennzeichnet eigene Prüfberichte mit „✓ am Original gelesen“ (z. B. E01 „90 bis 150 Mrd. € [36] B ✓ am Original gelesen“).
- Problem: Ein Leser, der die Zahl nachprüfen will, landet bei einem Agentenbericht statt bei der Studie. „Am Original gelesen“ heißt auf der Seite „im Originaldokument selbst gelesen“. Für eine eigene Nachrechnung ist das irreführend, weil es ein Primärdokument suggeriert, das es nicht gibt.
- Vorschlag: Für jede Prozentzahl die Studienquelle(n) plus „eigene Rechnung, BIP 2024 (Q20)“ angeben. Q40 umbenennen in „Freigabeliste Teil 1, Abschn. 8 (eigene Rechnung)“ mit Repo-Link. Für eigene Rechnungen statt „✓ am Original gelesen“ das Badge „eigene Rechnung, nachgeprüft“ verwenden.

**M5 · Zu lang, und der Befund steht nicht oben**

- Fundstelle: Vorspann „SCROLLEN · ETWA ZEHN MINUTEN“. Gerendert hat die Story rund 4.400 Wörter Fließtext (Absätze, Listen, Überschriften, ohne Grafiken) und 6.700 mit Grafiktext. Bei üblichen 200–230 Wörtern pro Minute sind das 20 Minuten und mehr.
- Problem: Die Leseangabe ist falsch. Wichtiger: Der Vorspann sagt nur „Wir sind dieser Zahl … gefolgt“. Der Befund steht erst in Akt 2.2, nach Prolog, Prämissen, Lesehilfe, vier Schritten, Steckbrief und GP6. In einer Zeitung stünde er im ersten Absatz. Dazu kommen zwölf Gegenpositionskästen, Klimakosten-Kasten, Korrekturkasten, acht Grenzen und Glossar. Das ist redlich, aber der Leser verliert den Faden. Teile wiederholen sich wörtlich: GP7–GP11 nach Akt 5.3, GP1–GP6 nach Akt 5.4, und die Belegseite bringt alle zwölf noch einmal „in voller Länge“.
- Vorschlag: (a) Ein Vorspann mit drei Sätzen Befund: 13,8 steht nicht in der Quelle; die 13,3 sind laut Bundestag keine reinen Investitionen; Mehrkosten-Studien landen bei 0,4–3,5 % des BIP pro Jahr, und R21 beziffert seinen eigenen Pfad nicht. (b) Leseangabe ehrlich machen („rund 20 Minuten“) oder kürzen. (c) Auf der Story die Gegenpositionen als je zwei Sätze mit Zahl und Einschränkung, die volle Fassung nur auf der Belegseite. Die Pflicht „sichtbar“ ist damit weiter erfüllt.

**M6 · R21s Effizienzargument wird abgewehrt statt aufgenommen**

- Fundstelle: Akt 5 / Schritt 2: „Selbst die DIHK-Studie ‚Plan B‘ ist ein Klimaneutralitätspfad: Ein anders gesteuerter Klimapfad spart dort … mindestens 530 bis 910 Mrd. € bis 2050. Ausgestiegen wird auch dort nicht.“
- Problem: Die Zahl wird als Argument *gegen* R21 eingesetzt („auch dort kein Ausstieg“). Sie ist aber zugleich ein Beleg *für* R21s Kernkritik, dass die heutige Steuerung teurer ist als nötig. Zusammen mit dem ZEW (Ersparnis 824–1.071 Mrd. €, GP5) hat R21 hier zwei seriöse Quellen auf seiner Seite. Die Seite erwähnt beide, verbindet sie aber nirgends. Ein Leser von R21 wird das als Auslassung lesen.
- Beleg: Freigabe V10, R12; R21-Text Z. 1069–1078.
- Vorschlag: Ein Satz in Akt 5.4 oder ein eigener Kasten „Hier hat R21 recht“: „Zwei Studien von außerhalb der Klimaschutz-Lobby (DIHK/Frontier, ZEW) sehen Einsparpotenzial im Bereich von mehreren hundert Milliarden Euro, wenn anders gesteuert wird. Das Geld liegt im *Wie* der Energiewende, nicht in ihrem Abbruch.“

### Klein

- **Doppelte Verneinung.** GP2: „lag 2025 −15,0 % unter 2018 und −12,2 % unter 2019“. Ebenso „die Wertschöpfung der Industrie um rund −4,4 % dämpfen“. „Minus“ und „unter“ bzw. „dämpfen“ heben sich sprachlich auf. Vorschlag: Werte ohne Vorzeichen ausgeben, wenn das Verb die Richtung trägt („15,0 % unter 2018“), oder umgekehrt „−15,0 % gegenüber 2018“.
- **Hero-Zahlen ergeben keine 87.** „87 Aussagen einzeln geprüft · 57 bestätigt · 17 korrigiert · 6 nicht prüfbar“ sind 80. Es fehlen 4 verworfen und 3 Setzung. Ein Leser rechnet nach. Vorschlag: alle fünf Kategorien nennen.
- **„Teil 1 rechnet nicht selbst. Er liest.“** (Prolog). Später heißt es in GP4: „Wir haben die Messdaten der Wetterjahre 2015 bis 2025 durchgerechnet“. Dazu kommen BIP-Umrechnungen und die Kernkraft-Spanne als Setzung. Vorschlag: „Teil 1 rechnet kein eigenes Kostenmodell.“
- **Badge-Verwirrung.** Unter „Zwei Originale fehlen“ steht: „Die PwC-Studie (Quelle der 13,3 Billionen Q3 · A · gelesen)“. Ein grünes „gelesen“ direkt neben einer nicht gelesenen Studie. Ähnlich steht im Vorspann „6 · Q1 · eigene Zählung“ mitten in der Zahlenzeile. Vorschlag: In Sätzen, die vom Nichtlesen handeln, das Badge weglassen oder an „Kurzinformation“ hängen.
- **Uneinheitlicher Titel.** Die Seite heißt „Die 13,8 Billionen“. Fußnavigation, Quelle Q1 und die Belegseite sagen „Die Billionen-Zahl“. Vorschlag: einen Titel festlegen.
- **BILD-Teaser.** „Überschrift und Vorspann berufen sich auf ein Papier der Denkfabrik R21“ steht ohne Vorbehalt. Laut Freigabe S01 hat den Teaser der Nutzer übermittelt, er wurde nicht abgerufen (C). Vorschlag: „Laut frei lesbarem Vorspann …“ und das C-Badge setzen.
- **Klimafolgekosten im Indikativ.** „Allein Extremwetter in Deutschland verursacht von 2022 bis 2050 Schäden von 280 bis 900 Mrd. €“ ist eine Projektion aus einer nicht gelesenen Studie. Vorschlag: „könnte … verursachen, schätzt eine Studie von IÖW, Prognos und GWS“.
- **Akt 4.3.** „Brutto-Größen liegen bei 4,4 bis 12,3 %“. Die Grafik daneben zeigt Ariadne G2 mit 2,6–3,0 %. Laut Freigabe G04 gilt die Spanne für „ganzes System oder alle Sektoren; mit Teilabgrenzungen ab 2,6 %“. Der Halbsatz fehlt auf der Seite.
- **„In der Größenordnung der Brutto-Studien“** (Akt 4.3) ist großzügig. 11,4–15,7 % liegen über allen gelesenen G1-Studien (4,4–9,3 %). Nur Agora G2 (12,3 %) und PwC (C) reichen heran. Vorschlag: „am oberen Rand oder darüber“.
- **R21s eigenes Zugeständnis fehlt.** R21 schreibt direkt vor der Billionen-Stelle: „Man mag einwenden, dass Klimaschutz nun einmal etwas kostet. Das ist korrekt.“ (Text Z. 588–589). Die Seite stellt R21 so dar, als sähe das Papier nur Verlust (S08). Ein Halbsatz macht die Darstellung fairer, ohne den Befund zu schwächen.

## 3. Was fehlt

- **Eine Antwort auf „Und was kostet es denn nun?“** Der Leser verlässt die Seite mit vierzehn Prozentbalken und dem Satz, das rechne erst Teil 6. Das ist methodisch sauber. Trotzdem braucht es eine zitierfähige Zwischenzeile mit Vorbehalt, etwa: „Die gelesenen Studien sehen Mehrkosten von rund 0,4 bis 3,5 % der Wirtschaftsleistung pro Jahr. Bei Beharrung, ohne Zinsen und mit steigenden Netzkosten kann es deutlich mehr sein.“ Ohne diesen Satz holen sich Leser ihre Zahl woanders.
- **Wer zahlt.** Der Grenzen-Punkt „Mehrkosten sind nicht gleich Belastung“ ist richtig. Für Wirtschaftsleser ist das aber *die* Frage: Netzentgelte, Industriestrompreis, Bundeshaushalt (18,49 Mrd. EEG-Konto). Wenigstens ein Verweis, in welchem Teil das kommt.
- **Euro je Haushalt oder je Kopf.** Billionen und BIP-Prozente sind für Leser abstrakt. Eine Umrechnung als Setzung (M), etwa „1 % des BIP sind rund 44 Mrd. € oder gut 500 € je Einwohner und Jahr“, würde jede Spanne greifbar machen.
- **Die Konfrontation mit R21** (K2) und die **PwC-Lektüre** (M1).
- **Ein Datum der Anfrage an die anderen Urheber**, z. B. beim DIW, wie es PwC wiedergibt, oder bei der DIHK: Kennt sie eine Veröffentlichung mit 2.100 Mrd. für Netze? Die DIHK-Pressestelle könnte N03 in einem Tag klären.

## 4. Was gut ist und bleiben soll

- **Die Zitatarbeit.** R21-Wortlaut, WD-Satz und die Definition aus WD 151/24 stimmen wörtlich. Akt 2.1 zeigt beide Sätze nebeneinander, und Akt 2.2 sagt nur „Woher die Abweichung kommt, wissen wir nicht“. So geht man mit einer Abweichung um.
- **Der tragende Befund** steht auf einer Bundestagsquelle, nicht auf DIW oder PwC. Die Seite sagt das ausdrücklich (Akt 3.2), und das ist die richtige Absicherung.
- **GP6 vor den Korrekturen.** Dass R21 „auf die einzige amtliche Fundstelle“ zurückgreift, weil die Regierung keine Kostenzahl hat, ist fair und für Leser neu.
- **Der Korrekturkasten GP12** mit Fehlern in beide Richtungen. So etwas sieht man in Redaktionen selten.
- **Konfidenz und Lesestatus an jeder Zahl**, keine fremden Server, Offenlegung des KI-Einsatzes mit Tokenzahlen.

## 5. Der härteste Einwand

„Diese Seite weist einer Denkfabrik nach, dass sie Kosten, Investitionen und Mehrkosten durcheinanderwirft, und tut im fünften Akt dasselbe. Sie nennt Mehrkosten von ‚0,4 bis 2,9 Prozent‘, während die KfW-Zahl im selben Absatz bei 3 bis 3,5 Prozent liegt. Ihr stärkstes Argument, die 13,3 Billionen seien die Kosten des Nichtstuns, hat sie selbst nicht geprüft, obwohl die Studie eine kostenlose Registrierung entfernt liegt. Und den Urheber der kritisierten Zahl hat sie noch nicht gefragt. Die Recherche zur Fußnote ist gut, besser als das meiste, was dazu erschienen ist. Wer aber anderen Unschärfe vorwirft, muss in jedem Satz trennscharf sein. Bis dahin ist das ein sehr sorgfältiger Entwurf und noch kein Stück, das ich verlinken würde.“
