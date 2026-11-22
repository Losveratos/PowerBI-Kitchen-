# Review Teil 1 · Rolle 06 · Kernkraft-Befürworterin (Ingenieurin, pro Kernenergie)

Stand: 22.11.2026 · Reviewer-Agent (Opus), nicht an Recherche, Freigabe oder Bau beteiligt.
Gegenstand: `energiewende-1-story.html`, `energiewende-1-belege.html` (gerendert mit Playwright/Chromium bei 1280 px und 390 px über `python3 -m http.server`; keine Konsolenfehler, keine Anfragen an fremde Server). Grundlage: `docs/03_teil1_freigabe.md`, `data/teil1_data.json`, Dossiers 01 und 09, Prüfberichte 01 und 09, `strommix/research/kosten_kernkraft.md`, Originale R21-Erklärung (`quellen/raw/P0/Erklaerung_Expertenrat_R21_2026-11.pdf`) und Wendland-Diskussionspapier (`quellen/raw/P1-01/Diskussionspapier_Kernenergie-2.pdf`).

Blick der Rolle: Wird Kernkraft fair behandelt? Stimmen die Aussagen zu Reaktivierung und Neubau? Was ist ein Strohmann?

## 1. Urteil in fünf Zeilen

1. Den Hauptteil der Seite (Herkunft der 13,8 Billionen, Brutto gegen Mehrkosten) würde ich empfehlen und zitieren. Er ist sauber gearbeitet und lässt R21 an sechs Stellen recht.
2. Die wenigen Sätze zur Kernkraft sind der schwächste Teil. Sie sind kurz, aber jeder davon geht zulasten der Kernkraft, und zwei Etiketten stimmen nicht.
3. „Gebaute westliche Projekte“ ist für die Spanne 7.500 bis 17.500 €/kW falsch: Keiner der drei Ankerwerte stammt aus einem fertigen Projekt. Olkiluoto-3, auf das sich R21 stützt, fehlt.
4. „R21 beziffert den eigenen Kurs nicht“ ist nur als Summe richtig. Das Faktenblatt B beziffert den Pfad als Systempreis (8,2 ct/kWh, nach Quantified Carbon). Diesen Wert und seinen Vergleichswert (10,5 ct für ein reines EE-System) verschweigt die Seite, obwohl er im Dossier steht.
5. Diese Punkte würde ich öffentlich angreifen. Mit vier kleinen Textänderungen wären sie behoben, ohne dass die Seite ihre Linie ändern muss.

## 2. Befunde

### Kritisch

**K1 · „Gebaute westliche Projekte“: falsches Etikett, und die Abgrenzung fehlt**

- *Fundstelle:* Story, Akt 5 / Schritt 1: „Zu den Kosten gebauter westlicher Projekte wären es 372, 595 oder 868 Mrd. €“; Grafik Akt 5: Balken „gebaute Projekte (Setzung M)“. Belegseite V03: „Dieselben Gigawatt zur Spanne gebauter westlicher Projekte“; Kasten unter der Studientabelle: „Mit Kosten gebauter westlicher Projekte“.
- *Problem:* Die Spanne kommt aus `strommix/research/kosten_kernkraft.md`, Abschn. 7.1. Dort sind die Anker:
  - Low 7.500: EPR2-Programm (Overnight-Kosten, ohne Finanzierung, Baubeginn frühestens 2027) und Dukovany-II-EPC (Baubeginn 2029). Beide sind **nicht gebaut**.
  - Mid 12.000: Lubiatowo (Polen, Beton 2028) und Sizewell C (Fertigstellung 2039), also ebenfalls **nicht gebaut**.
  - High 17.500: Hinkley Point C in laufenden Preisen. Das Projekt ist **noch im Bau**, Block 1 laut Dossier 09 erst 2030.

  Fertig sind von den genannten Referenzen nur Vogtle 3/4 (14.258 €/kW) und Flamanville 3 (14.364 €/kW). Beide sind FOAK-Projekte, und beide stecken nicht in den Ankern der Spanne. Olkiluoto-3 ist das einzige fertige westliche EPR-Projekt, auf das sich R21 beruft. Es steht in `kosten_kernkraft.md`, Z. 1381, ausdrücklich als „NICHT recherchiert“.
- *Gemischte Abgrenzung:* Die Anker mischen Overnight-Kosten (EPR2, €2020), reine EPC-Preise (Dukovany), Werte mit Finanzierung (Flamanville) und laufende Preise (Hinkley). Dieselbe Quelle schreibt in Abschn. 0.3: „Ohne diese Angabe ist eine €/kW-Zahl praktisch wertlos.“ Die Seite stellt die Spanne trotzdem neben R21s 6.250 €/kW, bei denen laut Datensatz „Preisbasis und Finanzierung nicht angegeben“ sind (`r21_kkw_neubau.abgrenzung`).
- *Asymmetrie:* In GP9 schreibt dieselbe Seite über die Energiewende-Studien: „Zinsen stehen nicht darin.“ Für die Kernkraft nimmt sie Werte mit Bauzinsen und Inflation (HPC nominal, Flamanville mit Finanzierung). Die Energiewende wird also ohne Zinsen gezeigt, die Kernkraft mit.
- *Änderungsvorschlag:* Das Etikett ändern in „zur Spanne westlicher Neubauprojekte (geplant, im Bau und fertig; gemischte Kostenabgrenzung)“. Einen Halbsatz zur Abgrenzung ergänzen, etwa: „unterer Wert ohne Finanzierung, oberer Wert in laufenden Preisen mit Bauzinsen“. Die Spanne bleibt Setzung (M). In Teil 6 Olkiluoto-3 nachrecherchieren und die Werte auf eine einheitliche Abgrenzung bringen.

**K2 · „R21 beziffert den eigenen Kurs nicht“: Die Seite verschweigt den Wert, mit dem R21 seinen Pfad tatsächlich beziffert**

- *Fundstelle:* Story, Grafik Akt 5: „R21-Pfad · Summe: nicht beziffert. Die eigenen Zahlen decken nur Kraftwerke ab.“ Story, Schritt 5.1: „Eine Summe nennt das Papier nicht. Seine eigenen Kostenzahlen decken nur Kraftwerke ab“. In der Grenzen-Box: „Nur, dass R21 es nicht beziffert.“
- *Problem:* Das R21-Faktenblatt B (S. B-2, PDF gelesen) nennt für sein „Reform-Stromsystem“ einen Systempreis von „8,2 ct/kWh, Durchschnittlicher Strompreis“. Das System hat 43 % Kernenergie aus 57 GW. Quelle ist Fußnote 3, Quantified Carbon 2024, mit URL. Wendland (PDF S. 16) gibt aus derselben Studie den Vergleichswert an: 82 €/MWh im Mischsystem gegen 105 €/MWh im reinen EE-System, also rund 22 % weniger. Dossier 01 (Nr. 107, Q4) und Prüfbericht 01 (K4) haben das erfasst und am Referat bestätigt. Dossier 01 kritisiert dabei zu Recht, dass das Faktenblatt den Modellwert dem Endkundenpreis von 38 ct gegenüberstellt.

  Auf der Seite kommt der Wert nicht vor. Der Leser muss also glauben, R21 behaupte „weit unter den Kosten“ ohne jede Zahl. Tatsächlich stützt sich das Papier auf eine Systemkostenstudie. Das ist R21s stärkstes Kostenargument, und die Seite lässt es weg. Wer nur die schwächere Fassung eines Arguments zeigt, baut einen Strohmann.
- *Beleg:* R21-Erklärung, Factsheet B, S. B-2 mit Fn. 3; Wendland 2026, PDF S. 16; Dossier 01, Tab. Nr. 106–107 und Q4; Prüfbericht 01, K4.
- *Änderungsvorschlag:* In Schritt 5.1 einen Satz ergänzen: „Statt einer Summe nennt R21 einen Systempreis: 8,2 ct/kWh im Mischsystem mit 43 % Kernkraft, nach einer Studie von Quantified Carbon. Dieselbe Studie kommt laut R21-Referenzpapier für ein reines EE-System auf 10,5 ct. Das Faktenblatt stellt den Modellwert dem heutigen Haushaltspreis von 38 ct gegenüber, und das ist ein schiefer Vergleich. Die Studie selbst konnten wir nicht lesen. Teil 6 rechnet nach.“ Im Grafik-Etikett „Summe: nicht beziffert“ ergänzen um „· Systempreis 8,2 ct/kWh (Modellwert, s. Text)“. Die Zahlen dafür müssen zuerst in die Freigabeliste (Konfidenz B für das Zitat, C für den QC-Inhalt).

### Mittel

**M1 · Reaktivierung: eine Setzung, die als „B · gelesen“ erscheint, und R21s eigene Behauptung fehlt**

- *Fundstelle:* Story, Kasten GP12: „Zu freundlich zum R21-Pfad: Die Reaktivierung stillgelegter Kernkraftwerke hatten wir im Mittel zu günstig angesetzt; jetzt 2,7 GW“ mit Abzeichen „B · gelesen · korrigiert“. Belegseite E04: „0 bis 12 (Mitte: 2,7) GW B ✓ am Original gelesen“.
- *Problem 1, Etikett:* Prüfbericht 09, Abschn. 3 Nr. 1, nennt die 2,7 GW ausdrücklich „eine Setzung (M) des Prüfers“. Die Obergrenze von 12 GW (Radiant) ist laut Datensatz nur Parteiwiedergabe (C). Die Seite zeigt den Wert trotzdem mit B und „am Original gelesen“. Gelesen wurden die Quellen zum Rückbaustand, nicht eine Quelle, die „2,7 GW“ sagt.
- *Problem 2, Kontext:* Die Zahl kommt auf der Story-Seite nur in der Korrekturbox vor. Der Leser erfährt nicht, was R21 selbst behauptet: 7 GW für rund 8,5 Mrd. €, „2032 am Netz“ (Factsheet B, S. B-3). Er erfährt auch nicht, warum Neckarwestheim II herausfällt (Abbau des Primärkreislaufs, EnBW: „praktisch irreversibel“, Drs. LT BW 18/292). Eine einzelne GW-Zahl unter der Überschrift „zu freundlich“ wirkt wie ein Urteil über die Kernkraft. Gemeint ist eine Korrektur unseres eigenen Dossiers.
- *Problem 3, Einheitlichkeit:* Bei den anderen Korrekturen steht die alte Zahl dabei. Hier steht sie nur auf der Belegseite („mid 4,1“).
- *Änderungsvorschlag:* Das Abzeichen auf „Setzung (M) · Prüfer“ ändern, die 12 GW als C markieren. Einen Halbsatz ergänzen: „R21 nennt 7 GW für 8,5 Mrd. €; nach dem Rückbaustand halten wir zwei Anlagen mit zusammen 2,7 GW für den mittleren Fall; ein Befürworter-Gutachten (Radiant) nennt bis zu 12 GW, im Original nicht gelesen.“

**M2 · Erster Neubau-Block: als belegt markiert, obwohl es eine Setzung ist; die Story verschiebt den Mittelwert an den Rand**

- *Fundstelle:* Story 5.1: „ginge bei einer Entscheidung 2027 zwischen 2040 und 2047 ans Netz, im ungünstigen Fall 2056“ mit „B · gelesen · korrigiert“. Belegseite V04: „frühestens 2040, eher 2047, im ungünstigen Fall 2056“.
- *Problem:* Dossier 09 (Parameter `neubau_de_erster_block_jahr`, Note) nennt den Wert „Setzung (M) bei Entscheidung 2027“. Er ist die Summe aus Vorlaufzeit (selbst Setzung M) und Bauzeit. Das Abzeichen „B · gelesen“ überzeichnet also die Beleglage. Dazu kommt, dass die Story-Seite und die Belegseite dasselbe Tripel verschieden lesen. Auf der Story-Seite wird der Mittelwert zum Ende einer „Normalspanne“, auf der Belegseite ist er der wahrscheinliche Fall. Für einen fairen Vergleich fehlt außerdem R21s eigene Zahl: „Planungs- und Bauzeit ca. 15 Jahre“, also 2042. Sie liegt innerhalb unserer Spanne. Das sollte der Leser erfahren, denn hier hat R21 nicht übertrieben. Übertrieben ist nur das Ziel von 50 GW bis 2045.
- *Änderungsvorschlag:* Den Wert als Setzung (M) kennzeichnen und beide Seiten auf eine Lesart bringen: „frühestens 2040, im mittleren Fall 2047, im ungünstigen Fall 2056 (unsere Setzung); R21 selbst rechnet mit 15 Jahren, also etwa 2042. Nicht erreichbar ist R21s Ziel von 50 GW bis 2045.“ Dazu den Hinweis, dass der Fall 2040 nur mit einem Turnkey-Festpreis eines Serienlieferanten funktioniert (Dossier 09, Abschn. 2.4).

**M3 · 310 gegen 350 Mrd. €: Die Seite unterschlägt, dass das Referenzpapier beide Zahlen nennt**

- *Fundstelle:* Story 5.1: „Das Papier rechnet den Neubau mit 310 Mrd. €, das eigene Referenzpapier mit 350 Mrd. €“. Belegseite V02.
- *Problem:* Dossier 01 (Q3) hält selbst fest, dass Wendlands Papier „ebenfalls 310 Mrd.“ in seiner Tabelle zeigt (PDF S. 4, Z. 127 der Textfassung) und im Fließtext 350 Mrd. nennt. Den Widerspruch gibt es also innerhalb des Referenzpapiers, nicht nur zwischen Erklärung und Referenzpapier. Außerdem nennt Wendland die 7.000 €/kW ausdrücklich „konservativ, d.h. teure Schätzung“, angelehnt an Olkiluoto-3, und gibt für asiatische Projekte rund 4.000 €/kW an (PDF S. 16–17). Ohne diesen Zusammenhang liest sich die Gegenüberstellung so, als habe R21 seine Kosten gegenüber dem eigenen Gutachten heruntergerechnet.
- *Änderungsvorschlag:* „Das Referenzpapier nennt in seiner Tabelle ebenfalls 310 Mrd. €, im Text ‚konservativ‘ 350 Mrd. € (7.000 €/kW nach Olkiluoto-3).“

**M4 · Die Gegenposition zur Kernkraft fehlt, obwohl sie im Dossier steht**

- *Fundstelle:* Die zwölf Pflicht-Gegenpositionen (GP1–GP12) enthalten keine zur Kernkraft. In Akt 5 steht der R21-Pfad als einzige bezifferte Größe mit den teuersten Werten der Seite (bis 868 Mrd. €) neben dem Hinweis „nicht beziffert“.
- *Problem:* Dossier 09 führt unter „Gegenpositionen“ selbst an: „Korea baut im Inland für unter 3.000 €/kW; Dukovany-EPC 7.900 €/kW in der EU; R21 setzt auf Standardisierung“. Es nennt außerdem eine „stärkste Form des R21-Pfads“ mit KHNP-Serien-Festpreis. Kosten_kernkraft.md belegt Barakah mit 3.153 €/kW (EPC) bis 4.945 €/kW (gesamt, Konfidenz A/B). Davon steht auf der Seite nichts. Die Messlatte der Reihe verlangt zu jeder Kernaussage die stärkste Gegenposition (TRANSPARENZ.md Nr. 6). Die Neubau-Spanne ist eine Kernaussage in Akt 5.
- *Änderungsvorschlag:* Einen Satz in 5.1 oder einen kurzen Kasten: „Asiatische Serienprojekte kosten deutlich weniger (Barakah rund 3.200 bis 4.900 €/kW). Ob ihre Voraussetzungen in Deutschland herstellbar sind, prüft Teil 6.“

### Klein

**S1 · Was 310 bis 868 Mrd. € kaufen, steht nirgends.** Die Grafik zeigt nur Kapitalkosten. Laut Faktenblatt B sollen damit rund 430 TWh pro Jahr erzeugt werden, bei einer Lebensdauer von 60 Jahren und mehr. Investitionssummen von Techniken mit sehr verschiedener Lebensdauer und Auslastung nebeneinanderzustellen, verzerrt, und zwar gegen die kapitalintensive Technik. *Vorschlag:* eine Zeile in der Grafik: „für rund 430 TWh pro Jahr laut R21 (Factsheet B-1)“.

**S2 · Die Grafik in Akt 5 vermischt Maßstäbe.** Der Kernkraft-Balken in Mrd. € (gesamt) steht unter der Überschrift „Mehrkosten als Anteil am BIP 2024 pro Jahr“. Wer flüchtig liest, hält 868 Mrd. € für Mehrkosten des R21-Pfads. *Vorschlag:* eine eigene Zwischenüberschrift „Kernkraft-Neubau: Investition, nicht Mehrkosten“.

**S3 · Datenstand der Reaktivierungs-Präzedenz für Teil 6.** Prüfbericht 09 zitiert die Bundesregierung, es gebe kein Kraftwerk, das nach Beginn der Stilllegung wieder in den Leistungsbetrieb ging (Drs. 21/7609, S. 9). Das steht nicht auf der Seite, wohl aber im Dossier, das Teil 6 tragen soll. Palisades (USA) wechselte laut World Nuclear News und Michigan Public im August 2025 als erstes US-Kraftwerk vom Rückbau- zurück in den Betriebsstatus. Netzsynchronisierung bis Ende 2026 nicht bestätigt, Konfidenz C, Suchtreffer, nicht primär gelesen. Ein Gegenbeispiel für Anlagen mit zerlegtem Primärkreislauf ist Palisades nicht. Als Präzedenz für den Rechtsweg „Stilllegung → Betrieb“ gehört es in Teil 6.

## 3. Was fehlt aus Sicht der Rolle

- Das Systempreis-Argument von R21 (8,2 gegen 10,5 ct/kWh nach Quantified Carbon), mit dem ehrlichen Hinweis, dass die Studie nicht gelesen ist (K2).
- Olkiluoto-3 als fertige westliche Referenz (K1) und die asiatischen Serienprojekte als Kontrast (M4).
- Eine einheitliche Kostenabgrenzung (Overnight, mit Bauzinsen, Preisbasis) bei allen €/kW-Werten. Fehlt sie, braucht es mindestens den Hinweis, dass Kernkraft mit Zinsen und die EE-Studien ohne Zinsen gezeigt werden (K1, GP9).
- R21s eigene Reaktivierungs- und Zeitangaben (7 GW, 8,5 Mrd. €, 2032; 15 Jahre Neubau) neben unseren Setzungen (M1, M2).
- Was die Kernkraft im R21-Mix leisten soll: 430 TWh/a, 17 g CO₂/kWh laut R21 (S1). Der Vergleich Frankreich 32 gegen Deutschland 339 g/kWh ist R21s anschaulichster Punkt und gehört mindestens in Teil 6.

## 4. Was gut ist und bleiben soll

- Die Kernkraft-Rechnung wird nach der Entscheidung D5 auf Teil 6 vertagt und als „kurzer Hinweis“ ausgewiesen. Teil 1 tut nicht so, als habe er das Thema entschieden.
- Die Neubau-Spanne ist als Setzung (M) markiert. R21s eigene 310 Mrd. € sind korrekt zitiert (Factsheet B, nachgerechnet 6.250 €/kW).
- Die Reaktivierung wurde in der Prüfung zuerst zugunsten von R21 (4,1 GW) und dann wieder zurück korrigiert, und beides steht offen da. Diese Fehlerkultur ist vorbildlich.
- R21 bekommt an sechs Stellen sichtbar recht, auch bei der Dunkelflaute, wo es wehtut.
- Technische Sauberkeit: keine fremden Server, keine Konsolenfehler, alle Zahlen kommen aus dem Datensatz.

## 5. Der härteste Einwand

„Die Seite bescheinigt R21, den eigenen Kurs ‚nicht beziffert‘ zu haben, und verschweigt den einen Wert, mit dem das Papier ihn beziffert: 8,2 ct/kWh im System mit Kernkraft gegen 10,5 ct im reinen Erneuerbaren-System, aus einer zitierten Studie. Dann stellt sie R21s Neubaukosten neben eine Spanne, die sie ‚gebaute westliche Projekte‘ nennt. Keiner der drei Ankerwerte stammt aus einem fertigen Kraftwerk. Der obere Wert enthält Bauzinsen und Inflation, die dieselbe Seite bei den Erneuerbaren-Studien ausdrücklich herausrechnet. Das einzige fertige westliche EPR-Projekt, auf das sich R21 beruft, haben die Autoren nach eigener Notiz nicht recherchiert. Eine Seite, die von anderen Quellentreue und gleiche Abgrenzung verlangt, muss sie auch bei der Kernkraft einhalten. Sonst ist ‚volle Rechnung in Teil 6‘ nur der Hinweis, dass das Urteil schon gefallen ist.“

## Quellen dieses Reviews

| Quelle | Fundstelle | gelesen |
|---|---|---|
| R21, Erklärung des Expertenrates, Nov. 2026 (`quellen/raw/P0/Erklaerung_Expertenrat_R21_2026-11.pdf`) | Factsheet B, S. B-1 bis B-3, Fn. 3 | ja |
| Wendland, Diskussionspapier Kernenergie, R21, Okt. 2026 (`quellen/raw/P1-01/Diskussionspapier_Kernenergie-2.pdf`) | PDF S. 3, 4 (Tabelle), 16–17 | ja |
| `strommix/research/kosten_kernkraft.md` | Abschn. 0.3, 1.1, 7.1; Z. 1381 | ja |
| `energiewende/research/09_referenzpfade.md` | Abschn. 1.4–1.5, 2.2–2.4, Gegenpositionen | ja |
| `energiewende/research/pruefung/09_pruefung.md` | Abschn. 1, 3 Nr. 1–3, 5 | ja |
| `energiewende/research/01_r21_behauptungen.md`, `pruefung/01_pruefung.md` | Nr. 106–107, Q3, Q4; K4 | ja |
| World Nuclear News, „Palisades re-enters operational status“, https://world-nuclear-news.org/articles/palisades-re-enters-operational-status ; Michigan Public 26.08.2025, https://www.michiganpublic.org/environment-climate-change/2025-08-26/palisades-nuclear-power-plant-returns-to-operating-status-three-years-after-shutdown ; ANS 08.07.2026, https://www.ans.org/news/2026-07-08/article-8187/ | nur Suchtreffer, abgerufen 22.11.2026 | nein (C) |
