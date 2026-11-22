# Review Teil 1 · Rolle 13 · Messlatten-Prüfer

Stand 22.11.2026 · Phase 5 · Auftrag `agents/briefs/P5_reviews_teil1.md`, Rolle 13 ·
geschrieben von einem Prüf-Agenten (Opus), der an Recherche, Freigabe und Seitenbau nicht
beteiligt war · Maßstab: `docs/01_messlatte.md` v1.0, unverändert angewendet ·
Regeln: `agents/REGELN.md`, `TRANSPARENZ.md`.

Bewertet werden vier Dokumente: (a) Teil 1 dieser Reihe (Scroll-Story, Belegseite und das
Repository dahinter), (b) die R21-Erklärung vom November 2026, (c) DIHK/Frontier „Plan B“
(September 2025), (d) KfW/Prognos „Investitionen für Klimaschutz“ (Endbericht Juni 2026).
Die Ergebnisse des Freigabe-Prüfers (Rolle 12) habe ich nicht gelesen und nicht übernommen.

## 1. Ergebnis auf einen Blick

| Dokument | Typ (Messlatte) | K1 | K2 | K3 | K4 | K5 | K6 | K7 | K8 | K9 | K10 | Summe ohne K3 (max. 18) | K3 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| (a) Teil 1, Story + Belegseite | Gutachten (Quellenprüfung, ohne eigenes Kostenmodell) | 2 | 2 | 1 | 1 | 1 | 2 | 1 | 2 | 2 | 2 | **15** | 1 (11 von 12 prüfbar) |
| (b) R21-Erklärung | Erklärung / Positionspapier | 1 | 0 | n. b. | 1 | 0 | 0 | 1 | 1 | 1 | 1 | **6** | n. b. (3 von 12 prüfbar; Tendenz 0) |
| (c) DIHK/Frontier „Plan B“ | Studie mit Modell | 2 | 1 | n. b. | 2 | 1 | 1 | 1 | 1 | 1 | 1 | **11** | n. b. (1 von 11 prüfbar) |
| (d) KfW/Prognos 2026 | Studie (Auswertung von Szenarien mit eigener Rechnung) | 2 | 1 | n. b. | 2 | 2 | 1 | 1 | 1 | 2 | 1 | **13** | n. b. (3 von 12 prüfbar; Tendenz 2) |

„n. b.“ = nicht bewertbar. Ich vergebe K3-Punkte nur, wenn mindestens fünf der gezogenen
Zahlen am zitierten Original unter `quellen/raw/` nachschlagbar sind (Begründung in
Abschnitt 2). Nur Teil 1 erreicht diese Schwelle. Die Summen sind deshalb ohne K3
angegeben, damit sie vergleichbar bleiben; Teil 1 hat mit K3 16 von 20.

**Was die Zahlen sagen:** Teil 1 schneidet am besten ab, weil es fast alles offenlegt, was
die Messlatte abfragt. Das ist keine Aussage darüber, ob Teil 1 inhaltlich recht hat. Die
Messlatte misst Nachprüfbarkeit, nicht Richtigkeit. Teil 1 verliert Punkte dort, wo es
selbst nicht rechnet (K4), wo die Studientabelle Preisbasis und Diskontierung nicht je
Studie zeigt (K5), bei Sensitivitäten (K7) und bei drei kleinen Abweichungen von den
Quellen (K3). Die Messlatte vergleicht nur innerhalb eines Typs. Gleichen Typ haben hier nur
(c) und (d), mit Einschränkung: KfW/Prognos wertet fremde Szenarien aus, Frontier rechnet
mit einem eigenen Modell.

## 2. Verfahren und wo ich von der Messlatte abweiche

- **Gelesen wie ein Leser.** Beide Seiten habe ich mit `python3 -m http.server` und
  Playwright (Chromium) bei 1280 px und 390 px geöffnet, einmal komplett durchgescrollt und den
  gerenderten Text gelesen. Bei allen vier Läufen gab es keine Konsolenfehler und keine
  Anfrage an fremde Hosts. Die Seiten scrollen nicht waagerecht (Breite gleich Viewport). Der
  Text bei 390 px entspricht dem bei 1280 px; inhaltlich fehlt mobil nichts.
- **Mehr Material als vorgesehen.** Laut Messlatte erhält der Prüfer „nur das Dokument,
  diese Messlatte und Quellenzugriff“. Ich hatte das ganze Repository vor mir, also auch
  die Dossiers und Prüfberichte. Für (b) habe ich das Behauptungs-Inventar aus Dossier 01 als
  Stichprobenrahmen genutzt (die Zählung hat Prüfbericht 01 unabhängig bestätigt). Die
  Fundstellen der gezogenen Zahlen habe ich selbst am Original nachgeschlagen.
- **Keine neuen Abrufe.** Der P5-Auftrag erlaubt nur den Bericht als neue Datei, und K3
  gilt laut Auftrag „soweit die Originale unter `quellen/raw/` liegen“. Ich habe deshalb
  nichts heruntergeladen. Daraus folgt kein Manifest.
- **K3-Stichprobe.** Startwert 13 (Nummer der Rolle), Python `random.Random(13).sample`.
  Die Rahmen waren:
  (a) alle Zahlen in `data/teil1_data.json` ohne eigene Setzungen (62 von 65), 12 gezogen;
  (b) alle Zahlen im R21-Inventar (Dossier 01, Abschn. 2) mit genannter Quelle, ohne
  „keine“, „eigene Rechnung“ und Verweise auf eigene Factsheets (52), 12 gezogen;
  (c) Sätze aus „Plan B“ mit Zahl und externer Quellenangabe (im Text oder in der Fußnote),
  maschinell gezogen; Fehltreffer (Seitenzahlen, Jahreszahlen als Fußnotenzeichen) und
  Zahlen aus dem eigenen Modell habe ich von Hand aussortiert, übrig blieben 11;
  (d) Sätze mit Zahl in Abschnitt 3 der Prognos-Studie, der die fremden Szenarien beschreibt
  (21), 12 gezogen. Die Prognos-Studie zitiert im Fließtext kaum Einzelquellen, ihre
  Zahlen laufen fast alle unter „Quelle: Eigene Berechnungen“.
  Die Skripte liegen im Scratch-Ordner (`…/scratchpad/r13/bin/frame.py`, `frame2.py`).
- **Regel für unprüfbare Quellen (Setzung des Prüfers).** Die Messlatte sagt nicht, was
  gilt, wenn das zitierte Original nicht vorliegt. Wer dafür 0 Punkte gibt, bestraft
  fehlenden Zugang statt fehlender Quellentreue. Ich vergebe K3 deshalb nur ab fünf
  prüfbaren Zahlen und berichte darunter die Tendenz.
- **Typregel K6.** Die Messlatte gibt einem Positionspapier bei K6 keine Punkte. Ich halte
  mich daran, obwohl zwei R21-Factsheets (A und H) ihren kleinen Rechenweg offenlegen. Ohne
  die Typregel bekäme R21 bei K6 einen Punkt.

## 3. (a) Teil 1 dieser Reihe

Story `energiewende-1-story.html`, Belegseite `energiewende-1-belege.html`, Datensatz
`data/teil1_data.json`, Freigabeliste `docs/03_teil1_freigabe.md`, Skript
`scripts/build_teil1_data.py`. Typ: Gutachten (Quellenprüfung). Teil 1 rechnet nach
eigener Aussage nicht selbst („Teil 1 rechnet nicht selbst. Er liest.“, Story, Prolog).

| K | Punkte | Fundstelle | Begründung |
|---|---|---|---|
| K1 | 2 | Story, Offenlegung „So ist diese Seite entstanden“ („Interessen: Es gibt keinen Auftraggeber und keine Finanzierung durch Dritte“); Belegseite Abschn. 10 „Wer hier schreibt“ (gesteuert von Michael Tenner, Daten-WG, KI-Agenten); `agents/PROTOKOLL.md` | Auftraggeber (keiner), Geldgeber (keine) und Rolle der Autoren (KI-Agenten, Mensch entscheidet; Rollen und Modelle im Protokoll) sind klar |
| K2 | 2 | Jede Zahl der Story trägt ein Kürzel Q1–Q40 mit Konfidenz und dem Vermerk „gelesen/nicht gelesen“; Belegseite Abschn. 2 (Spalte „Fundstelle“ je Aussage) und Abschn. 9 | Quelle mit Fundstelle bei den tragenden Zahlen. Abzüge stehen unter „Schwächen“ |
| K3 | 1 | Stichprobe unten | 10 von 12 bestätigt, 1 kleine Abweichung, 1 nicht prüfbar (auf der Seite korrekt als C markiert); dazu zwei Abweichungen außerhalb der Stichprobe |
| K4 | 1 | Story Akt 5, Grafik „Mehrkosten … Studie · gerechnet gegen …“; „Was Teil 1 nicht zeigt“: „Teil 1 kann nicht sagen, ob der R21-Pfad billiger oder teurer ist“ | Die Referenz jeder Studie ist genannt und beziffert. Teil 1 setzt aber selbst keinen Vergleichspfad und begründet keinen, die Rechnung ist auf Teil 6 vertagt. Mit Wohlwollen wären es 2 Punkte; ich bewerte streng |
| K5 | 1 | Story Akt 4 (G1/G2/G3, Tabelle „Investitionen/Betrieb/Brennstoffe …“); Belegseite Abschn. 3 (Spalten „Was sie misst“, „Zeitraum“); Abschn. 8 („nominale Euro, €2023 oder €2024“) | Brutto oder Mehrkosten, Zeitraum und Sektor sind je Studie ausgewiesen. **Preisbasis und Diskontierung je Studie fehlen in der Tabelle.** Beträge in verschiedenen Preisbasen werden durch dasselbe nominale BIP 2024 geteilt; die Seite nennt das nur pauschal als Grenze („einige Zehntel Prozentpunkte“) |
| K6 | 2 | `scripts/build_teil1_data.py`; Freigabeliste Abschn. 8 (Nachrechnung) und 10 (Datenblock); BIP aus Eurostat `nama_10_gdp` | Daten, Setzungen (BIP-Bezug, Summe ÷ Jahre) und Rechenweg sind offen und nachrechenbar. Die fremden PDFs liegen nicht im Repository, sie sind nur per URL und Prüfsumme wiederherstellbar |
| K7 | 1 | Bandbreiten durchgehend (min / max); PwC mit 21 und 26 Jahren; GP7–GP11 („können zu niedrig sein“) | Bandbreiten ja. Eine Sensitivität je tragender Annahme fehlt, vor allem für die eigene Setzung BIP 2024 statt BIP des jeweiligen Basisjahrs |
| K8 | 2 | Zwölf Kästen „Gegenposition GP1–GP12“, davon sechs „Hier hat R21 recht“; Kapitel „Was Teil 1 nicht zeigt“ (acht Punkte) | Stärkste Gegenpositionen sind behandelt, die Grenzen sind benannt |
| K9 | 2 | Prolog „Was wir voraussetzen“; Schluss: „Diese Seite endet nicht mit einem Urteil, sondern mit ihren Grenzen“ | Prämissen stehen vorn, Forderungen gibt es keine; die Befunde stehen für sich |
| K10 | 2 | Kopfzeile „Entwurf · Reviews stehen aus“; Belegseite „Stand des Datensatzes: 22. November 2026“; GP12 und Belegseite Abschn. 7 (Korrekturen mit Richtung); `README.md` Prozess-Log; Git-Historie | Änderungen sind dokumentiert, der Korrekturweg ist offen |

**K3-Stichprobe (a)** · Startwert 13 · Rahmen: 62 Zahlen

| # | Zahl auf der Seite | Zitierte Quelle | Am Original | Ergebnis |
|---|---|---|---|---|
| 1 | Plan B spart „mindestens 530 bis 910 Mrd. €“ bis 2050 | DIHK „Plan B“ S. 12 | S. 12 (Z. 461–465), S. 73, S. 82: „530 bis 910 Mrd. €“, „11 bis 17 %“, „bei identischen Treibhausgasemissionen“ | bestätigt. Die Seite schreibt „bei gleichem Energieverbrauch“, die Studie „derselbe Endenergiemix“ (S. 71); zulässig |
| 2 | KfW/Prognos brutto 270–300 Mrd. € pro Jahr | Prognos S. 1 | Zusammenfassung S. 1 | bestätigt |
| 3 | Extremwetter 2022–2050: 280–900 Mrd. €, Untergrenze | hib 411/2024; DIW 38+39/2025 | hib-Text: „auf 280 bis 900 Milliarden Euro summieren“; DIW S. 1 „(Untergrenze)“ | bestätigt (die Seite vermerkt, dass die Studie selbst nicht gelesen ist) |
| 4 | Wasserstoff-Absicherung „eher 90 bis 150 Mrd. € Investition“ | Prüfbericht 05, Abschn. 3.1 | Prüfbericht 05, Z. 89: „grob ≈ 90–150 Mrd. €. Hinzu kommen die nicht enthaltenen Elektrolyseure“ | Wert bestätigt. **Abgrenzung verkürzt:** Die Story (GP12) schreibt „die Absicherung kostet“, ohne „ohne Elektrolyseure“ |
| 5 | Dunkelflaute Deutschland allein: 109 Tage, Winter 1995/96 | DIW-Podcast fossilfrei 44 | Transkript 00:45:27–00:46:38 | bestätigt, auch „ein Drittel der … Verfügbarkeit“ |
| 6 | Industriestrom 13,1 / 10,5 (2019-S1), 17,4 / 15,6 ct (2026-S1) | Eurostat `nrg_pc_205` | `quellen/raw/P1-10/nrg_pc_205_ind_el.json`, MWH2000-19999, X_VAT: 0,131 / 0,1045 / 0,1742 / 0,1559 €/kWh | bestätigt |
| 7 | Lücke 4,8–7,0 TWh bzw. 6,3–7,5 TWh; „R21 rechnet mit 7,1 TWh“ | Dossier 05; Prüfbericht 05 Abschn. 4 | Prüfbericht 05, Z. 24, 70, 151 bestätigt die Spannen. R21 Factsheet A (Text Z. 289): „520/73 ≈ 7 TWh = 7.000 GWh“ | Spannen bestätigt. **Kleine Abweichung:** Die 7,1 stehen nicht bei R21. Dort steht „≈ 7 TWh“, die 7,1 sind unsere Division |
| 8 | ISE 2024: rund 54 Mrd. € pro Jahr, Szenarien 28 bis 85 | ISE 2024 PDF-S. 6, 80–81 | Text Z. 213, 4580–4584 | bestätigt |
| 9 | Wendland: „ca. 350 Milliarden Euro“ | Diskussionspapier Kernenergie, PDF-S. 3, 16 | Text Z. 83–84, 629 | bestätigt |
| 10 | DIHK: 2,1–2,3 Bio. € in den nächsten zehn Jahren, Gesamtsystem inkl. Importe | DIHK S. 8, 27 | S. 27 (Z. 1250–1260) und Abb. 8 | bestätigt |
| 11 | Erster neuer Block bei Entscheidung 2027: 2040 bis 2047, ungünstig 2056 | Dossier 09 Abschn. 2.4; Prüfbericht 09 Nr. 3 | Prüfbericht 09, Z. 26, 201 | bestätigt (abgeleitete Rechnung; die Bauzeitquellen der Rechnung habe ich nicht neu geöffnet) |
| 12 | Pittel: 500 bis über 3.000 Mrd. € bis 2050 | ifo-Teaser, Suchtreffer | Original nicht lesbar (Browser-Prüfung) | nicht prüfbar. Die Seite sagt das selbst („Konfidenz C“, „ungeprüft“) |

**Außerhalb der Stichprobe gefunden (nicht gewertet):**
- „KfW und Prognos rechnen netto 130 bis 153 Mrd. € pro Jahr“ (Story Akt 5 Schritt 2, Q9):
  Die Studie nennt 135–153 (S. 1 und S. 55), der KfW-Focus 561 nennt 130–150 (S. 3). Die
  Spanne 130–153 steht in keinem der beiden Dokumente. Im Datensatz ist das vermerkt
  (`kfw2026_ksi_netto_pa`, Feld `abgrenzung`), auf der Seite nicht.
- Die Story sagt: „Keine Zahl auf dieser Seite ist von Hand eingetippt“ (Abschnitt „So lesen
  Sie die Zahlen“). Die Token-Zahlen im Kasten „So ist diese Seite entstanden“
  (3.247.322 / 2.542.472 / 376.633) stehen aber von Hand im HTML und nicht in
  `teil1_data.json`. Die Belegseite sagt das offen („stammen aus agents/PROTOKOLL.md, nicht
  aus dem Zahlen-Datensatz“), die Story nicht. Das widerspricht `TRANSPARENZ.md` Nr. 4.

**Weitere Schwächen, die Punkte kosten oder kosten könnten:**
- K2: Das Kürzel Q40 heißt in der Story „dieses Dokument, Abschnitt 8“. Gemeint ist die
  Freigabeliste, nicht die Story. Wer es anklickt, landet bei einer falschen Angabe.
- K2: Story und Belegseite nummerieren die Quellen verschieden (R21 = Q2 in der Story,
  [1] auf der Belegseite). Das erschwert das Gegenprüfen zwischen den Seiten.
- K2: Mehrere tragende Zahlen verweisen auf eigene Arbeitsdokumente (Q33–Q40: Dossiers,
  Prüfberichte). Das ist offen, aber keine Primärquelle. Bei 0,4–2,9 % (Q36) und
  11,4–15,7 % (Q40) muss man über die Freigabeliste zur Studie zurückgehen.

**Was die Punktzahl für (a) aussagt und was nicht.** 15 von 18 Punkten (16 von 20 mit K3)
heißen: Wer Teil 1 nachprüfen will, kann das fast lückenlos. Jede Zahl hat eine Herkunft,
Setzungen sind markiert, Gegenpositionen und Grenzen stehen sichtbar da, Korrekturen sind
dokumentiert. Die Zahl sagt nicht, dass die Erzählung fair gewichtet ist oder dass die
Auswahl der Studien vollständig ist. Teil 1 hat es bei der Messlatte leichter als eine
Modellstudie: Wer nichts selbst rechnet, verliert bei K6 und K7 wenig. Die Messlatte ist
gegen das eigene Stück so streng wie gegen die anderen angewendet worden. Gerade deshalb
fallen die drei kleinen Quellenabweichungen und der falsche Satz „keine Zahl von Hand“ ins
Gewicht: Ein Stück, das anderen Quellenuntreue nachweist, muss hier fehlerfrei sein.

## 4. (b) R21-Erklärung (November 2026)

Datei `quellen/raw/P0/Erklaerung_Expertenrat_R21_2026-11.pdf` (Text: `.txt`, Zeilenangaben
„Z.“). Typ: Erklärung mit Factsheets, kein Rechenmodell.

| K | Punkte | Fundstelle | Begründung |
|---|---|---|---|
| K1 | 1 | Letzte Seite „HERAUSGEBER REPUBLIK21 E.V.“ (Z. 2215 ff.); Fußzeile der Factsheets „Gefördert durch das Presse- und Informationsamt der Bundesregierung …“ (u. a. Z. 309) | Herausgeber und eine Förderung sind genannt. Die Mitglieder des Expertenrats nennt das Dokument nicht. Nur zwei Factsheets haben einen Autor (A Breyer, B Wendland). Weitere Geldgeber, Rollen und Interessen fehlen |
| K2 | 0 | Haupttext: einzige externe Fundstelle ist Fn. 5 (Z. 626–628); „nach einer Studie der DIHK 2.100 Milliarden“ ohne Fundstelle (Z. 78–79); Factsheet B „1200 Mrd. € bis 2034 (Bothe et al. 2025)“ ohne Seite (Z. 412–413) | Haupttext: 39 Zahlen, 4 mit Fundstelle, 27 ohne Quelle. Gesamt haben 58 von 103 Zahlen keine Literaturangabe (Zählung Dossier 01, Abschn. 2; von Prüfbericht 01 unabhängig nachgezählt). Zahlen also überwiegend ohne Quelle |
| K3 | n. b. | Stichprobe unten | Nur 3 von 12 gezogenen Zahlen am Original prüfbar; davon 2 mit Abweichung. Tendenz: 0 |
| K4 | 1 | Druckseite 5 und 27 (Z. 162–166 und Schlussabsatz): „Der Mittelbedarf liegt aber weit unter den Kosten“ | Vergleich genannt, nicht beziffert. Factsheet B beziffert nur Kraftwerke (310 + 22 + 8,5 Mrd. €), nicht den Pfad |
| K5 | 0 | Druckseite 3 (Z. 83–86) „Kosten der Energiewende“ gegen Druckseite 12 (Z. 595–600) „Investitionskosten“, dieselbe Spanne | Unklar, was gezählt wird: kein Hinweis auf brutto oder Mehrkosten, Preisbasis, Diskontierung oder Sektoren |
| K6 | 0 | Typregel der Messlatte | Positionspapier, kein Modell. Factsheet A (Z. 282–296) und H legen kleine Rechnungen offen; ohne Typregel wäre das 1 Punkt |
| K7 | 1 | Factsheet A, Anmerkungen (Z. 298–303): „Bei einer Verdopplung des Verbrauchs … verdoppeln“; Spanne 10 bis 13,8 | Einzelne Spannen und eine Hochrechnung. Sonst Punktwerte, keine Sensitivität je Annahme |
| K8 | 1 | Wasserbett und MSR (Z. 1003–1008: „Zwar ist der Wasserbetteffekt dadurch abgemildert worden …“); Dezentralität (Z. 251); Vorbildargument (Z. 1065) | Gegenargumente sind erwähnt und erwidert. Die stärkste Gegenposition zur Kernzahl (brutto gegen Mehrkosten, Vergleichspfad) fehlt; Grenzen benennt das Papier nicht |
| K9 | 1 | Forderungen gebündelt auf Druckseite 4–5; Begründungen in Kap. 3 ff. und den Factsheets | Forderungen und Befunde stehen teilweise getrennt. Viele Forderungen stützen sich auf unbelegte Zahlen (K2) oder auf Wertungen („historischer Fehler“) |
| K10 | 1 | „November 2026“ (Titel); „Stand: September 2026“ (Z. 384), „Oktober 2026“ (Z. 651, 1211, 1804), „März 2026“ (Z. 1439) | Versionsstand genannt. Kein Änderungsvermerk, kein Korrekturweg |

**K3-Stichprobe (b)** · Startwert 13 · Rahmen: 52 Zahlen mit genannter Quelle

| # | Inventar-Nr. · Stelle | R21 sagt | Zitierte Quelle | Ergebnis |
|---|---|---|---|---|
| 1 | 102 · B-1 | Redispatch „3,1 Mrd. € pro Jahr (Korb 2026)“ | ZfK-Artikel | nicht prüfbar (nicht unter `quellen/raw/`) |
| 2 | 104 · B-1 | Subventionen „30 Mrd. € pro Jahr“ | Stratmann 2025 (Handelsblatt) | nicht prüfbar (Bezahlschranke). Wendland nennt 29,5 Mrd. (sekundär) |
| 3 | 159 · I-1 | Gas „860 Mrd. kWh“, LNG „105 Mrd. kWh“, „rund 95 %“ USA | BNetzA 2026 | `P1-01/bnetza_rueckblick_gas_2025.html`: 864 TWh, 106 TWh, „rund 96 Prozent“ (laut BDEW). **Quellentreu gerundet** |
| 4 | 166 · I-3 | „ein bis zwei Schwimmbadfüllungen“ | Kümpel 2026b; Faktenfinder 2024 | nicht prüfbar |
| 5 | 94 · A-1 | „je MWh = 200.000 Euro“ | Bischof 2026 (RBID) | nicht prüfbar |
| 6 | 155 · H-2 | Indiens Pro-Kopf-Ertrag 223,2 € „entspricht ziemlich genau dem durchschnittlichen pro Kopf Monatseinkommen“ | Weltbank (URL) | `P1-01/wb_gdp_pc_ind_gdp_deu.json`: BIP je Kopf Indien 2024 = 2.592 US-$, also 216 US-$ oder rund 200 € im Monat. **Abweichung:** R21 liegt rund 10–15 % darüber, und BIP je Kopf ist kein Einkommen |
| 7 | 100 · B-1 | „mindestens 430 TWh … aus Kernenergie“ | Quantified Carbon | nicht prüfbar am Original. Wendland (sekundär) nennt 43 % von 1.000 TWh, das passt |
| 8 | 158 · I-1 | Schiefergas „3.200 – 20.300 Mrd. kWh“ | BGR | nicht prüfbar (BGR nicht unter `quellen/raw/`) |
| 9 | 89 · S. 25–26 | Fracking „gefahrenfrei“ nach „Leopoldina und BGR“ | ohne Fundstelle | nicht prüfbar |
| 10 | 161 · I-1 | „mindestens ein Viertel an CO₂-Emissionen“ | Kümpel 2026a (Substack) | nicht prüfbar |
| 11 | 163 · I-2 | LNG-Kette kostet „rund ein Fünftel“ der Gasmenge | Kümpel 2026a | nicht prüfbar |
| 12 | 164 · I-3 | „Faktor der Klimaschädlichkeit … 6 (UBA 2019)“ | UBA Climate Change 21/2019 | `P1-01/uba_2019_lng_vorketten.pdf`: 23.600 gegen 3.805 g CO₂eq/GJ (Faktor 6,2), **aber nur für die Vorkette**. **Abweichung in der Abgrenzung:** „Klimaschädlichkeit“ insgesamt steht so nicht in der Quelle |

**Außerhalb der Stichprobe (nicht gewertet, am Original nachgesehen):** Die einzige
externe Fundstelle des Haupttexts (Fn. 5) trägt die Billionen-Zahl. Die Zahl 13,8 kommt in
WD 5 – 3000 – 135/24 nicht vor (0 Treffer); dort stehen 13,3 Bio. € (Z. 144). Factsheet B
datiert „1200 Mrd. € bis 2034“; DIHK „Plan B“ nennt dafür 2025–2049 (S. 27, Abb. 8).

**Was die Punktzahl für (b) aussagt und was nicht.** 6 von 18 heißen: Wer die Zahlen der
Erklärung nachprüfen will, findet meist keinen Weg dorthin. Die Kernzahl ist nicht
abgegrenzt, der eigene Pfad nicht beziffert. Ein Positionspapier will überzeugen und nicht
nachrechenbar sein; die Messlatte bewertet es trotzdem, weil es mit Zahlen argumentiert
und als Beleg zitiert wird. Bei K6 verliert R21 nur wegen des Typs, nicht wegen Fehlern.
Die Zahl sagt nicht, dass die Forderungen falsch sind. Mehrere R21-Befunde halten der
Prüfung stand (Industrieproduktion, Strompreisabstand, Energiemenge einer Dunkelflaute,
ETS-Minderung, fehlendes Kosten-Monitoring). Die Messlatte misst nur, ob ein Leser das
selbst feststellen könnte. Bei R21 kann er es kaum.

## 5. (c) DIHK/Frontier „Plan B“ (September 2025)

Datei `quellen/raw/P1-02/dihk_planb_studie.pdf` (Text: `.txt`). Seitenangaben = Druckseiten
der Studie. Typ: Studie mit Modell (COMET).

| K | Punkte | Fundstelle | Begründung |
|---|---|---|---|
| K1 | 2 | S. 2 („Auftraggeberin DIHK“, Ansprechpartner; „Auftragnehmer Frontier Economics“, Autoren, Unterauftrag an Global Energy Solutions e. V.); S. 3 Vorwort („Auf Wunsch unserer Mitgliedschaft … Den Auftrag … erhielt im Februar Frontier Economics“) | Auftraggeberin, Autoren und ihre Rollen sind klar. Die Geldgeberin wird nicht wörtlich genannt, ist bei einer Auftragsstudie aber die Auftraggeberin |
| K2 | 1 | Fußnoten mit Seite nur vier Mal (Fn. 15, 16: BMWK 2022 S. 3–4; Fn. 24: WindGuard S. 17, DEA S. 5); Abbildungen „Quelle: Frontier Economics“ (u. a. S. 27, Abb. 8); Referenzen Kap. 7 | Quellen genannt, Fundstellen fehlen fast immer. Die tragenden Zahlen stammen aus dem eigenen Modell |
| K3 | n. b. | Stichprobe unten | 1 von 11 prüfbar, ohne Abweichung |
| K4 | 2 | Kap. 4.2, S. 71–73: „den gleichen Analyserahmen“; Status quo gegen Plan B: −530 bis −910 Mrd. € (S. 73, Abb. 25) | Referenz (Status quo) beziffert und begründet. Einschränkung: Eine Referenz *ohne* Energiewende fehlt. Die 4,8–5,4 Bio. € sind deshalb keine Kosten „durch“ die Energiewende (siehe K5) |
| K5 | 1 | S. 22: „real in 2024er € … keine zukünftige Inflation“; S. 27, Hinweis zu Abb. 8: CAPEX, OPEX, Netze, Importe, Nachfrageseite „nicht berücksichtigt“; S. 84, Abb. 31: „undiskontiert“ | Zeitraum, Preisbasis, Diskontierung und Sektoren sind ausgewiesen. Aber die Brutto-Systemkosten heißen „Gesamtkosten des Energiesystems **durch die Energiewende**“ (Abb. 8, S. 27; ebenso Abb. 18, S. 45). Brutto und Mehrkosten werden damit vermischt |
| K6 | 1 | Fn. 21 und 22 (S. 26): COMET, Eingangsdaten O45-Strom, TYNDP, IEA 2024; Fn. 26 (S. 28): Lernkurve „nur um 20 % der von der IEA … angenommenen Reduktion“ | Annahmen teilweise offen, das Modell nicht. Daten und Rechenweg sind nicht veröffentlicht |
| K7 | 1 | Abb. 8 Hinweis (S. 27: Spannen aus Lernkurven); Abb. 18 (S. 45) mit Fn. 45 (Wachstum 2 % statt 1,4 %, halbierte Sanierungsrate) | Szenarien und zwei Sensitivitäten. Keine Sensitivität für Energieimportpreise, Kapitalkosten oder Netzkosten, obwohl Importe mit 2,0–2,3 Bio. € der größte Block sind |
| K8 | 1 | S. 71: „prinzipielle Einschränkungen der Aussagekraft der quantitativen Ergebnisse“; S. 73: „restriktiv gewählte Modellansatz“; Validierung gegen zehn Studien (S. 26–27) | Grenzen benannt. Die stärkste Gegenposition (Status quo ist selbst ein Klimapfad; Kosten ohne Energiewende) behandelt die Studie nicht |
| K9 | 1 | Vorwort S. 3: „Die Ergebnisse sind eindeutig: Die Energiewende verursacht enorme Kosten, die nur mit einem neuen politischen Kurs beherrschbar sind“; Kap. 3 („Grundsätze“) | Befund (Kap. 2) und Konzept (Kap. 3–5) sind gegliedert. Die Grundsätze sind normativ gesetzt und folgen nicht aus dem Modell; das Vorwort der Auftraggeberin wertet stärker, als die Befunde tragen |
| K10 | 1 | Titelblatt „September 2025“ | Versionsstand genannt. Keine Änderungshistorie, kein Korrekturweg |

**K3-Stichprobe (c)** · Startwert 13 · Rahmen nach Bereinigung: 11 Zahlen mit externer
Quelle

| # | Stelle (Druckseite) | Plan B sagt | Zitierte Quelle | Ergebnis |
|---|---|---|---|---|
| 1 | S. 22 | EE-Anteil am Bruttostromverbrauch 2030 „mindestens 80 %“, 2035 „nahezu 100 %“ | BMWK (2022), S. 3–4 | nicht prüfbar |
| 2 | S. 23, Fn. 16 | Ausbaupfade 2030: 115 / 30 / 215 GW | BMWK (2022), S. 3 | nicht prüfbar am Original (Prüfbericht 05 nennt dieselben Werte, aber ebenfalls nicht primär) |
| 3 | Kap. 2.5 | laufender Erfüllungsaufwand „rund 10,5 Mrd. € im Jahr“ | Statistisches Bundesamt / Seeliger | nicht prüfbar |
| 4 | Kap. 4 | DAC „bis zu mehr als 1.000 €/t CO₂“ | Fraunhofer ISI (2023) | nicht prüfbar |
| 5 | S. 22 | Endenergieverbrauch 2025 in den Szenarien 2.400 TWh | Fraunhofer ISI (2025) | nicht prüfbar |
| 6 | Kap. 2.5 | 135 Normen, 1.500 Vorgaben, 1,6 Mrd. € pro Jahr | Seeliger (2024) | nicht prüfbar |
| 7 | S. 22 | Stromanteil an der Endenergie von 20 auf über 50 % | O45-Strom | nicht prüfbar |
| 8 | Kap. 1 | EE-Anteil am Endenergieverbrauch „nur 22,4 %“ | Umweltbundesamt (2025c) | `P1-03_stromdaten/uba_ee_zahlen.html` (Stand 19.10.2026): 2025 = 23,9 %, „gegenüber dem Vorjahr … um 1,4 Prozentpunkte“, also 2024 = 22,5 %. **Bestätigt** (0,1 Punkte Abweichung durch spätere Revision) |
| 9 | Kap. 2.3 | BEV-Bestand 2024 rund 1,4 Mio. | KBA (2025) | nicht prüfbar |
| 10 | Kap. 4 | Wirtschaftlichkeitsschwelle Grundlast 9.250 €/kW | Fraunhofer ISI (2024) | nicht prüfbar |
| 11 | Kap. 1 | EEG-Einspeisevergütungen 2000–2023: 220 Mrd. € | Statista (2025) | nicht prüfbar |

Zusatz, nicht gezogen: „Endenergieverbrauch … 2.300 TWh im Jahr 2023“ (S. 22, Fn. 4,
UBA 2025b). AG Energiebilanzen (`P2-04/ageb_auswertungstabellen_EBD25p2.txt`, Tab. 2.2):
8.123 PJ = 2.256 TWh. Das ist auf Hunderter gerundet (+1,9 %), also vertretbar.

**Was die Punktzahl für (c) aussagt und was nicht.** 11 von 18: eine ordentlich
dokumentierte Auftragsstudie. Zeitraum, Preisbasis, „undiskontiert“, Lernkurven und eine
Wachstumssensitivität sind offen. Gerechnet wird aber mit einem Modell, das niemand
nachrechnen kann. Die Kernzahl ist ein Brutto-Wert und wird als Kosten „durch die
Energiewende“ etikettiert. Die Messlatte bestraft das einmal (K5). Inhaltlich wiegt es
schwerer, weil genau diese Etikettierung die Netzzahl in R21 vorbereitet hat. Bei K3 ist
die Studie nicht bewertbar, die eine prüfbare Zahl stimmt. Die Zahl sagt nichts darüber,
ob „Plan B“ die 530–910 Mrd. € wirklich spart; die Studie nennt ihre Einsparung selbst
„exemplarisch“.

## 6. (d) KfW/Prognos 2026

Datei `quellen/raw/P1-02/kfw_prognos_2026_studie.pdf` (Text: `.txt`). Seitenangaben =
„Seite“ der Studie. Typ: Studie, die fremde Szenarien auswertet und daraus Investitionen
rechnet.

| K | Punkte | Fundstelle | Begründung |
|---|---|---|---|
| K1 | 2 | Titelblatt: Autoren, „Im Auftrag der Kreditanstalt für Wiederaufbau (KfW)“, „Juni 2026“; Firmenseite (Rechtsform, Leitung) | Auftraggeberin und Autoren sind klar; die Geldgeberin ist bei einer Auftragsstudie die Auftraggeberin |
| K2 | 1 | Abbildungen fast durchgehend „Quelle: Eigene Berechnungen“ (z. B. S. 49); Szenarien in Kap. 3 auf Studienebene zitiert; Tabelle 9 (S. 82) mit Quellen für Anteile; keine Seitenangabe im ganzen Text | Quellen genannt, keine Fundstellen |
| K3 | n. b. | Stichprobe unten | 3 von 12 prüfbar, alle bestätigt. Tendenz: 2 |
| K4 | 2 | S. 6–7 (Abb. 1, 2: Investitionsaggregate, Mehrinvestitionen gegen Status quo); S. 16 (Definitionen); S. 49: „gegenüber dem Status Quo zusätzliche jährliche KSI … 160–220 Mrd.“; S. 55: netto „135–153 Mrd. Euro2024“ | Zwei Referenzen beziffert und begründet: Status quo 2018–2023 und fossile Referenztechnik |
| K5 | 2 | S. 16: brutto, Mehrinvestitionen, netto definiert; „Ausgeklammert sind … Landwirtschaft, Abfall und Landnutzung“; „einheitlich in Preisen des Jahres 2024“; Zeitraum 2025–2045; S. 16: eingesparte Energiekosten „in den Aggregaten nicht berücksichtigt“ | Sauber abgegrenzt. Dass die Summen nicht diskontiert sind, steht nicht wörtlich da, ergibt sich aber aus „kumuliert“ in festen Preisen |
| K6 | 1 | Kap. 2 Methodik (S. 4–7); Kap. 3 Szenarien (S. 8–15); S. 58: „Die in der Vorgängerstudie genutzten Quellen wurden aktualisiert“ | Methode und Szenariobasis offen, die eigene Rechnung nicht als Daten veröffentlicht |
| K7 | 1 | Szenarienvergleich, Abb. 25–27 (S. 49–51): Spannen über Roadmap, KNDE, LFS | Bandbreiten über Szenarien. Keine Sensitivität je Annahme (Technikkosten, Zuordnung „ohnehin“) |
| K8 | 1 | Kap. 4.1 „Methodische Anmerkungen und Einschränkungen“ (S. 16); S. 5: „Die KSI sind nicht mit den Kosten für Klimaschutz gleichzusetzen“ | Grenzen benannt. Alle Szenarien erreichen das Ziel; ein Pfad mit Verfehlung oder Beharrung als Gegenposition fehlt |
| K9 | 2 | Zusammenfassung S. 1–2; „müssen … wenn die Klimaschutzziele bis 2045 erreicht werden sollen“ (S. 5) | Beschreibend; die wenigen Sollsätze sind als Bedingung des Ziels formuliert und folgen aus den Befunden |
| K10 | 1 | „Endbericht“, „Juni 2026“ | Versionsstand genannt. Der spätere KfW-Focus 561 nennt netto 130–150 statt 135–153 Mrd. €; die Abweichung ist nirgends erklärt |

**K3-Stichprobe (d)** · Startwert 13 · Rahmen: 21 Zahlen in Kap. 3 (Beschreibung fremder
Szenarien)

| # | Seite | Prognos sagt | Quelle laut Studie | Ergebnis |
|---|---|---|---|---|
| 1 | 12 | strombasierte Energieträger 2045 „rund 300–350 TWh“ | drei Szenarien | nicht prüfbar (Roadmap, LFS nicht unter `quellen/raw/`) |
| 2 | 13 | LULUCF-Senke 2045: 35–42 Mt | drei Szenarien | nicht prüfbar als Spanne |
| 3 | 12 | LFS: 145 TWh Nettoimport | LFS O45 | nicht prüfbar |
| 4 | 12 | Stromnachfrage 2045 von rund 1.100 (Roadmap) bis rund 1.300 TWh (LFS) | Roadmap, LFS | nicht prüfbar |
| 5 | 12 | LFS: Bruttostromverbrauch „über 1.300 TWh“ | LFS O45 | nicht prüfbar |
| 6 | 15 | Bevölkerung im Zensus um rund 1,5 Mio. überschätzt | Zensus | nicht prüfbar |
| 7 | 13 | CCS 2045: 30–45 Mt | drei Szenarien | nicht prüfbar als Spanne |
| 8 | 14 | Tabelle: KNDE 2045 „ca. 1265 TWh“ | Agora 2024 | wie Nr. 9 |
| 9 | 10 | KNDE: Stromnachfrage „ca. 1.265 TWh“ | Agora Think Tanks et al. 2024 | `P1-04/agora_knde_szenariopfade.txt`, Kernindikatoren: Bruttostromverbrauch 2045 = 1.267 TWh. **Bestätigt** („ca.“) |
| 10 | 14 | Endenergie 2045 gegen 2025: −26 / −27 / −33 % | drei Szenarien | nicht prüfbar. Innerer Widerspruch: Die Tabelle nennt für KNDE −26 %, der Text auf S. 11 „rund 25 %“ |
| 11 | 10 | KNDE erreicht das Zwischenziel −65 % 2030 | Agora 2024 | Agora (Z. 551, 646): „Emissionsminderung von 65 Prozent“, „− 65 % ggü. 1990“. **Bestätigt** |
| 12 | 15, Fn. 6 | UBA-Rahmendaten: Bevölkerung 2045 = 83,2 Mio. | UBA Projektionen 2025 | `P1-09/uba_rahmendaten_projektionen_2025.txt`, Tab. 4: 2045 = 83,2. **Bestätigt** |

**Was die Punktzahl für (d) aussagt und was nicht.** 13 von 18: Die Studie sagt genau,
was sie misst. Sie trennt brutto, Mehrinvestition gegen den Status quo und netto gegen
fossile Technik und warnt selbst davor, Investitionen als Kosten zu lesen. Punkte verliert
sie bei den Fundstellen, bei der Veröffentlichung der Rechnung und bei Sensitivitäten. Die
drei prüfbaren Zahlen stimmen. Die Zahl sagt nicht, dass die Investitionen realistisch
oder vollständig sind: Alle ausgewerteten Szenarien sind Zielszenarien. Was es kostet, wenn
das Ziel verfehlt wird oder die Umstellung stockt, misst die Studie nicht. Investitionen
sind keine Kosten. Gegen R21s Zahl steht die Studie deshalb nicht als Gegenrechnung,
sondern als Abgrenzung.

## 7. Befunde zur Messlatte selbst

Diese Punkte fielen bei der Anwendung auf. Sie ändern meine Punkte nicht, sollten aber vor
der nächsten Runde entschieden werden. Die Messlatte verlangt, dass Änderungen mit Datum
und Grund am Ende der Datei stehen.

1. **K3 ohne Regel für unerreichbare Quellen.** Bei drei von vier Dokumenten lag der größte
   Teil der zitierten Originale nicht vor. Vorschlag: Mindestzahl prüfbarer Werte
   festlegen (hier fünf) und „nicht bewertbar“ als eigenes Ergebnis zulassen.
2. **K3 ohne festgelegten Stichprobenrahmen.** „Zehn Zahlen je Dokument“ lässt offen, ob
   Modellergebnisse, eigene Rechnungen und Zahlen ohne Quelle zählen. Wer Zahlen ohne
   Quelle mitzieht, misst K2 doppelt. Vorschlag: Rahmen = Zahlen mit zitierter externer
   Quelle; Zahlen ohne Quelle gehen nur in K2 ein.
3. **K6 und Dokumenttyp.** Die Typregel nimmt einem Positionspapier K6 ganz, auch wenn es
   kleine Rechnungen offenlegt (R21, Factsheet A und H). Ein Gutachten ohne Modell wie Teil 1
   bekommt für seine offene Umrechnung dagegen volle Punkte. Vorschlag: K6 an den
   Rechenweg binden, nicht an den Typ, oder die Typregel für alle Dokumente ohne Modell
   gleich anwenden.
4. **K1 und Auftragsstudien.** „Geldgeber“ steht bei keiner der beiden Auftragsstudien
   wörtlich. Vorschlag: festhalten, dass bei Auftragsstudien die Auftraggeberin als
   Geldgeberin gilt, sofern nichts anderes genannt ist.
5. **K4 bei Prüfstücken.** Ein Stück, das fremde Studien liest, setzt selbst keine
   Referenz. Ob die bezifferten Referenzen der gelesenen Studien zählen, regelt die
   Messlatte nicht. Ich habe streng bewertet (1 Punkt für Teil 1).

## 8. Was Teil 1 vor der Veröffentlichung ändern sollte, um seine Punkte zu halten

| Kriterium | Stelle | Änderung |
|---|---|---|
| K3 | Story, GP4 „R21 rechnet mit 7,1 TWh“; ebenso Akt-5-Kachel „R21 7,1 TWh“ | „R21 rechnet mit rund 7 TWh (520 TWh ÷ 73)“ |
| K3 | Story, GP12: „die Absicherung kostet eher 90 bis 150 Mrd. € Investition“ | „… Wasserstoffturbinen und Kavernen, ohne Elektrolyseure, grob 90 bis 150 Mrd. €“ |
| K3 | Story Akt 5 Schritt 2 und Studientabelle: „netto 130 bis 153 Mrd. €“ | Studie 135–153 (S. 1, 55) und KfW-Focus 130–150 (S. 3) getrennt nennen oder die Mischung im Satz kenntlich machen |
| K2, TRANSPARENZ Nr. 4 | Story, „So lesen Sie die Zahlen“: „Keine Zahl auf dieser Seite ist von Hand eingetippt“ | Token-Zahlen in den Datensatz übernehmen oder den Satz einschränken, wie es die Belegseite tut |
| K2 | Story, Quellenliste Q40 „dieses Dokument, Abschnitt 8“ | „Freigabeliste Teil 1, Abschnitt 8“ |
| K2 | Story Q-Nummern gegen Belegseite [n]-Nummern | eine gemeinsame Nummerierung |
| K5 | Belegseite Abschn. 3, Story-Tabelle | Spalten „Preisbasis“ und „diskontiert ja/nein“ je Studie |
| K7 | Belegseite Abschn. 8 („einige Zehntel Prozentpunkte“) | je Studie den Anteil auch mit dem BIP ihres Basisjahrs zeigen; so wird aus der Behauptung eine Sensitivität |

## 9. Maschinenlesbare Fassung

```json
{
  "pruefer": "P5 Rolle 13, Messlatten-Prüfer",
  "messlatte": "docs/01_messlatte.md v1.0",
  "stand": "2026-11-22",
  "k3_verfahren": {"startwert": 13, "generator": "python random.Random(13).sample", "mindestens_pruefbar": 5, "nur_quellen_unter": "energiewende/quellen/raw/"},
  "dokumente": [
    {"id": "teil1", "titel": "Energiewende-Reihe Teil 1 (Story + Belegseite)", "typ": "Gutachten (Quellenprüfung, ohne Modell)",
     "punkte": {"K1": 2, "K2": 2, "K3": 1, "K4": 1, "K5": 1, "K6": 2, "K7": 1, "K8": 2, "K9": 2, "K10": 2},
     "summe_ohne_k3": 15, "summe_mit_k3": 16,
     "k3": {"gezogen": 12, "pruefbar": 11, "bestaetigt": 10, "abweichend": 1, "nicht_pruefbar": 1}},
    {"id": "r21_2026", "titel": "R21, Erklärung des Expertenrates Klima- und Energiepolitik, Nov. 2026", "typ": "Erklärung / Positionspapier",
     "punkte": {"K1": 1, "K2": 0, "K3": null, "K4": 1, "K5": 0, "K6": 0, "K7": 1, "K8": 1, "K9": 1, "K10": 1},
     "summe_ohne_k3": 6,
     "k3": {"gezogen": 12, "pruefbar": 3, "bestaetigt": 1, "abweichend": 2, "nicht_pruefbar": 9, "tendenz": 0}},
    {"id": "dihk_planb_2025", "titel": "Frontier Economics für DIHK, Neue Wege für die Energiewende (Plan B), Sept. 2025", "typ": "Studie mit Modell",
     "punkte": {"K1": 2, "K2": 1, "K3": null, "K4": 2, "K5": 1, "K6": 1, "K7": 1, "K8": 1, "K9": 1, "K10": 1},
     "summe_ohne_k3": 11,
     "k3": {"gezogen": 11, "pruefbar": 1, "bestaetigt": 1, "abweichend": 0, "nicht_pruefbar": 10, "tendenz": null}},
    {"id": "kfw_prognos_2026", "titel": "Prognos für KfW, Investitionen für Klimaschutz, Endbericht Juni 2026", "typ": "Studie (Szenarienauswertung mit eigener Rechnung)",
     "punkte": {"K1": 2, "K2": 1, "K3": null, "K4": 2, "K5": 2, "K6": 1, "K7": 1, "K8": 1, "K9": 2, "K10": 1},
     "summe_ohne_k3": 13,
     "k3": {"gezogen": 12, "pruefbar": 3, "bestaetigt": 3, "abweichend": 0, "nicht_pruefbar": 9, "tendenz": 2}}
  ]
}
```
