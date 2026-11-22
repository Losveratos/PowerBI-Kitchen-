# Review 01 · Energie-Professorin (Energiewirtschaft, Systemanalyse)

Gegenstand: `energiewende-1-story.html` und `energiewende-1-belege.html`, gerendert
gelesen am 22.11.2026 (lokaler Server, Playwright/Chromium, 1280 px und 390 px; keine
Konsolenfehler, keine Anfragen an fremde Hosts, kein horizontales Scrollen).
Abgeglichen mit `docs/03_teil1_freigabe.md`, `data/teil1_data.json`, den Dossiers 05 und 09,
Prüfbericht 02, `data/p1_10_industrieproduktion.csv` und `strommix/research/modell_v02c_ergebnis.md`.
Rolle: Gutachterin, die das Stück fachlich abnehmen müsste. Kein Auftrag, keine Bindung an
eine der zitierten Institutionen.

## 1. Urteil in fünf Zeilen

Der Kernbefund ist sauber und für mich zitierfähig: Die 13,8 Billionen stehen nicht in der
zitierten Kurzinformation, die 13,3 Billionen sind aggregierte Gesamtkosten mit Energiekosten,
und eine Bruttosumme ist keine Mehrkostenzahl. Die Unterscheidung G1/G2/G3 ist der richtige
Zugriff — aber die Seite hält ihre eigene Begriffsordnung in Akt 5 nicht durch, und ihre
Konfidenzstufe A bedeutet auf der Seite etwas anderes als in der eigenen Legende. Beides würde
ein Gutachter sofort angreifen. Mit diesen Korrekturen würde ich die Seite in der Lehre
empfehlen; in der jetzigen Fassung würde ich sie mit zwei Randnotizen „unsauber“ zitieren.

## 2. Befunde

### Kritisch

**K1 · Akt 5 nennt Mehrinvestitionen und einen zeitlichen Zuwachs „Mehrkosten“ — gegen die eigene Taxonomie, und Text und Grafik widersprechen sich.**
- Fundstelle: Story, Akt 5, Grafik „Mehrkosten als Anteil am BIP 2024 pro Jahr“ und Schritt 2:
  „KfW und Prognos rechnen netto 130 bis 153 Mrd. € pro Jahr […] Als Anteil am BIP sind das
  0,4 bis 2,9 %“; ebenda „Am oberen Rand steht die Studie mit der fossilsten Referenz“.
- Problem: Die Grafik mischt G3b (Mehrkosten nach Abzug eingesparter Energie: ISE 2021,
  ISE 2024, Ariadne) mit G3a (Mehrinvestitionen ohne Abzug eingesparter Energie: Agora 3,4 %,
  KfW/Prognos netto 3,0–3,5 %, KfW 2021 1,6 %) und mit „KfW/Prognos 2026, Zuwachs · heutiges
  Niveau“ (1,5 %), also einer Veränderung über die Zeit, gar keiner Differenz zweier Pfade.
  Akt 4 hat genau diese Unterscheidung eingeführt; Akt 5 hebt sie wieder auf. Zudem: Der Satz
  „das sind 0,4 bis 2,9 %“ folgt unmittelbar auf die KfW/Prognos-Zahl, die selbst bei 3,0–3,5 %
  liegt, und der obere Rand der Grafik ist nicht ISE 2021 (2,9 %), sondern Agora und
  KfW/Prognos mit 3,4–3,5 %. Ein Leser, der Grafik und Text vergleicht, findet den Widerspruch
  in zehn Sekunden.
- Beleg: Freigabeliste Abschn. 8.1 (G3a/G3b je Zeile, „Zuwachs gegenüber heutigem
  Netto-Niveau“); gerenderte Grafikwerte Akt 5 (3,4 % · 3,0 bis 3,5 % · 1,6 % · 1,5 %).
- Vorschlag: Grafik in Akt 5 entweder auf G3b beschränken (dann stimmt „0,4 bis 2,9 %“) oder in
  zwei beschriftete Gruppen „Mehrinvestitionen (G3a)“ und „Mehrkosten (G3b)“ teilen und den
  Text auf „Mehrinvestitionen 1,5 bis 3,5 %, Mehrkosten nach Abzug eingesparter Energie 0,4
  bis 2,9 %“ ändern. Die Prognos-„Zuwachs“-Zeile aus der Mehrkosten-Grafik nehmen oder als
  „Zuwachs gegenüber heute, kein Vergleichspfad“ kennzeichnen. Überschrift entsprechend.

**K2 · Konfidenz A wird für „Wortlaut korrekt zitiert“ vergeben, die Legende definiert A aber als „mehrere unabhängige Quellen stimmen überein“.**
- Fundstelle: Story, Einleitung: „10 bis 13,8 Billionen Euro Q2 A · gelesen“; Akt 2/2: „Die
  13,8 Q2 A · gelesen kommt in der Kurzinformation nicht vor“; Akt 2/1 und Akt 3/4: „500 Mrd. €
  pro Jahr Q3 A · gelesen“ — im selben Absatz „Ob dort 500 Milliarden pro Jahr stehen, wissen
  wir deshalb nicht“. Legende „So lesen Sie die Zahlen“: „A mehrere unabhängige Quellen stimmen
  überein“.
- Problem: In `teil1_data.json` tragen elf Werte Stufe A, darunter `r21_kosten_zitat`,
  `r21_netz_dihk_zitat` (2.100), `wd_kosten_pro_jahr` (500), `wendland_kkw_neubau` (350) und
  `brh_netzausbau` (460) — jeweils mit genau einer Quelle. Gemeint ist offenbar: „Die Zahl steht
  so im gelesenen Dokument.“ Die Seite selbst argumentiert aber, dass 13,8 und 2.100 *nicht*
  belegt sind und die 500 Mrd. € ungeprüft referiert werden. Ein A-Abzeichen neben der
  umstrittenen Zahl in der ersten Zeile der Story liest jeder Laie als „gut belegter Wert“.
  Das verstößt gegen `TRANSPARENZ.md` Abschn. 2 (A = mehrere unabhängige Quellen) und ist
  methodisch der Punkt, an dem eine Gegenseite die ganze Belegsystematik angreifen kann.
- Beleg: `data/teil1_data.json`, Feld `confidence` (elf A-Werte, Auszug oben);
  `TRANSPARENZ.md` Abschn. 2; Freigabeliste Abschn. 1 („Konfidenz A/B/C wie in TRANSPARENZ.md“).
- Vorschlag: Zwei getrennte Angaben: (a) „Zitat geprüft“ (Wortlaut steht so im Dokument, am
  Original gelesen) und (b) Konfidenz des *Werts*. Für R21-Zitate, WD-Referate und
  Einzelquellen höchstens B; für 13,8 und 2.100 als Sachaussage ausdrücklich „nicht belegt“.
  Alternativ die A-Werte auf B herabstufen und in der Legende ein eigenes Abzeichen „wörtlich
  zitiert“ einführen.

### Mittel

**M1 · Der BIP-Bezug verzerrt mehr als „einige Zehntel Prozentpunkte“, und zwar nicht neutral.**
- Fundstelle: Story, „Was Teil 1 nicht zeigt“: „Die Anteile sind Näherungen, je nach Studie um
  einige Zehntel Prozentpunkte“; Akt 4/3 „R21s Spanne entspricht 11,4 bis 15,7 % pro Jahr“.
- Problem: Die eigene Studientabelle (Freigabeliste 8.1) zeigt Abweichungen zur Selbstangabe
  der Studien von bis zu 1,3 Prozentpunkten: Agora 12,3 % gegen „11 %“, KfW 2021 4,4 % gegen
  „5,2 %“, Ariadne G2 2,6–3,0 % gegen „etwa 3,5 %“, ISE 2024 9,3 % gegen „7–10 %“. Dazu ein
  systematischer Fehler: Kumulierte Summen in laufenden Preisen (R21, vermutlich PwC) durch
  das feste nominale BIP 2024 zu teilen, überzeichnet den Jahresanteil, weil das nominale BIP
  über 2025–2045 wächst. Überschlag (Setzung M, 3 % nominales Wachstum p. a.): Das mittlere
  nominale BIP der Periode liegt rund 35–40 % über dem von 2024; R21s Spanne läge dann eher
  bei rund 8 bis 11 % statt 11,4 bis 15,7 %. Für Studien in realen Preisen (€2023, €2024) ist
  der Effekt kleiner (reales Wachstum). Die Verzerrung trifft also gerade die Zahl, die die
  Seite kritisiert — zu R21s Ungunsten.
- Beleg: Freigabeliste Abschn. 8.1, Spalte „% BIP 2024“ mit Klammerwerten; Abschn. 0
  (Preisbasen nominal, €2023, €2024).
- Vorschlag: Den Satz „einige Zehntel“ durch die tatsächliche Spanne ersetzen („bis gut einen
  Prozentpunkt; bei Summen in laufenden Preisen wird der Anteil überzeichnet“). Für R21 und
  PwC zusätzlich einen Anteil am kumulierten (projizierten) BIP der Periode zeigen, oder den
  Vorbehalt direkt an die 11,4–15,7 % schreiben. Die Selbstangaben der Studien in der
  Story-Tabelle mit anzeigen.

**M2 · „Brutto-Gesamtkosten“ trennt nicht zwischen Ausgaben (mit Steuern, Umlagen, CO₂-Preis) und volkswirtschaftlichen Ressourcenkosten — und nicht nach Systemgrenze.**
- Fundstelle: Story, Akt 4/1 und Tabelle G1/G2/G3; Akt 3/3 („PwC zähle zu den Energiekosten
  auch Netzentgelte, Umlagen und den CO₂-Preis“).
- Problem: G1 fasst sehr verschiedene Größen zusammen. PwC (laut DIW) summiert Endkundenausgaben
  einschließlich Umlagen und CO₂-Preis — volkswirtschaftlich zum Teil Transfers, keine
  Ressourcenkosten; die DIHK-Studie rechnet nur die Angebotsseite (ohne Gebäude, Verkehr,
  Industrie), ISE 2024 die gesamte Energieversorgung. Agora G2 (12,3 %) liegt über ISE G1
  (9,3 %), was nur über unterschiedliche Systemgrenzen erklärbar ist. Die Seite hat eine Achse
  (brutto / Mehrinvestition / Mehrkosten), braucht aber drei: Größe, Systemgrenze
  (Stromsektor · Energieangebot · inkl. Nachfrageseite) und Kostenbegriff (Ausgaben inkl.
  Transfers · Ressourcenkosten). Erst dann ist die Aussage „R21 liegt in der Größenordnung der
  Brutto-Studien“ prüfbar.
- Beleg: `teil1_data.json` `dihk_systemkosten_2025_2049` („nur Angebotsseite … ohne Gebäude,
  Verkehr, Industrie“), `pwc_wwb_gesamt` („inkl. Netzentgelte, Umlagen, CO2-Preis“);
  Belegseite, Studientabelle Spalte „Was sie misst“.
- Vorschlag: In der Studientabelle eine Spalte „Systemgrenze“ und eine Spalte „Kostenbegriff“
  ergänzen; im Glossar „Ausgaben vs. volkswirtschaftliche Kosten“ und „Systemgrenze“ aufnehmen.
  Den Satz in Akt 4/3 präzisieren: „Als Brutto-Gesamtkosten liegt sie am oberen Rand bzw. über
  den gelesenen G1-Studien (4,4 bis 9,3 %) und nahe bei Agoras Brutto-Investitionen (12,3 %)“.

**M3 · „Brutto-Größen liegen bei 4,4 bis 12,3 %“ — die eigene Grafik zeigt Ariadne G2 bei 2,6–3,0 %.**
- Fundstelle: Story, Akt 4/3.
- Problem: Die Freigabe (G04) schränkt ein: „für das ganze System oder alle Sektoren; mit
  Teilabgrenzungen liegen sie tiefer“. Der Halbsatz fehlt in der Story, die Grafik direkt
  daneben widerspricht.
- Beleg: Freigabeliste G04; Akt-4-Grafik, Zeile „Ariadne · G2 · 2,6 bis 3,0 %“.
- Vorschlag: Einschränkung aus G04 wörtlich übernehmen.

**M4 · Kernkraft: „Kosten gebauter westlicher Projekte“ stimmt für die Stützstellen nicht.**
- Fundstelle: Story, Akt 5/1: „Zu den Kosten gebauter westlicher Projekte wären es 372, 595 oder
  868 Mrd. €“; Grafiklegende „gebaute Projekte (Setzung M)“.
- Problem: Die Spanne 7.500 / 12.000 / 17.500 €/kW stammt aus dem Strommix-Datensatz. Ihre Anker
  sind laut dortiger Dokumentation das EPR2-Programm (Plan-OCC), Lubiatowo (reine Planzahl),
  Sizewell C (Schätzung bis FID), EPR2 inkl. Finanzierung und Hinkley Point C „laufende Preise“
  — überwiegend geplante oder im Bau befindliche Projekte, gemischt aus Overnight-Kosten und
  Kosten mit Finanzierung, gemischt real und nominal. R21s 6.250 €/kW sind laut Datensatz ohne
  Angabe zu Preisbasis und Finanzierung. Ein Kernkraft-Gutachter würde hier „Äpfel mit
  Birnen“ sagen — und hätte recht.
- Beleg: `strommix/research/modell_v02c_ergebnis.md` (Tabelle der Stützstellen, Z. 285–297);
  `teil1_data.json` `r21_kkw_neubau` („Preisbasis und Finanzierung nicht angegeben“).
- Vorschlag: „zu den Kostenansätzen aktueller westlicher Projekte (geplant und im Bau, teils mit
  Finanzierungskosten)“; Kostenbasis je Stützstelle auf der Belegseite nennen. In Teil 6
  Overnight-Kosten und Finanzierungskosten getrennt rechnen.

**M5 · Dunkelflaute: Übereinstimmung im Ergebnis, nicht in der Methode — und die Annahmen fehlen auf der Seite.**
- Fundstelle: Story, GP4: „Die Energiemenge einer Dunkelflaute hat R21 ungefähr richtig … Lücke
  von 4,8 bis 7,0 TWh … R21 rechnet mit 7,1 TWh“; „im Winter 1995/96 ein Ereignis von 109 Tagen“.
- Problem: (a) R21 setzt 5/365 des Jahresverbrauchs (520 TWh / 73) an, also null Erneuerbare und
  mittlere Last; die eigene Rechnung nimmt Resterzeugung und höhere Winterlast. Dass beides
  ähnlich ausfällt, ist eine Kompensation zweier Fehler, keine Bestätigung der Methode. (b) Die
  Spanne 4,8–7,0 ist die Streuung über elf Wetterjahre, „vor Abzug“ von Biomasse, Wasser,
  Importen und Speichern, bei 520 TWh Last — für 2030 mit Elektrifizierung eher niedrig
  angesetzt. Nichts davon steht in der Story. (c) Die 109 Tage stehen ohne den Zusatz „rund ein
  Drittel der üblichen Wind- und PV-Verfügbarkeit“ und ohne Hinweis, dass die Quelle ein
  Podcast-Transkript ist. Leser stellen sich 109 Tage ohne Wind und Sonne vor.
- Beleg: Dossier 05, Z. 18–20, 114–116, 156, 167–168; `teil1_data.json`
  `dunkelflaute_luecke_5tage`, `dunkelflaute_insel_de_tage` (Abgrenzung „rund ein Drittel“).
- Vorschlag: „R21 kommt mit einer zu einfachen Rechnung auf eine ähnliche Energiemenge“; die
  Annahmen (520 TWh, elf Wetterjahre, vor Abzug steuerbarer Erzeugung und Importe) in einem
  Satz nennen; bei den 109 Tagen die Verfügbarkeit von rund einem Drittel und die Art der Quelle
  dazuschreiben. Für Teil 2 die Primärarbeit (Kittel/Schill) lesen, nicht den Podcast.

**M6 · Emissionshandel: Die Zahl ist gedeckt, die Kausalität nicht; die ZEW-Zahl ohne ihren wichtigsten Vorbehalt.**
- Fundstelle: Story, GP5: „Beim Emissionshandel stimmt R21s Zahl … habe den Ausstoß seit 2005
  etwa halbiert … Die ZEW-Studie … beziffert den Effekt, wenn nationale Zusatzmaßnahmen
  entfallen, auf 824 bis 1.071 Mrd. € als Barwert. Der Gesamteffekt liegt eher am oberen Ende,
  also höher als bei R21.“
- Problem: (a) −50 % in den ETS-Sektoren ist ein Befund über Emissionen, keine Wirkungsanalyse
  des ETS. Ein erheblicher Teil der Minderung im deutschen ETS-Sektor geht auf den
  EEG-geförderten Ausbau der Erneuerbaren, Brennstoffpreise und Konjunktur zurück; ökonometrische
  Studien schreiben dem ETS selbst deutlich kleinere Effekte zu (z. B. Bayer/Aklin 2020,
  PNAS — in diesem Review nicht abgerufen, daher nur als Hinweis). Die Überschrift „stimmt
  R21s Zahl“ ist korrekt; der Fließtext übernimmt aber R21s Kausalformulierung. (b) Welcher
  „Effekt“ 824–1.071 Mrd. € beträgt, erfährt der Leser nicht (Wohlfahrtsgewinn bei Wegfall
  nationaler Maßnahmen, EU-27, 1,5 % Diskont), und vor allem nicht, dass er **ohne vermiedene
  Klimaschäden** gerechnet ist. Für eine Wohlfahrtszahl ist das der zentrale Vorbehalt.
- Beleg: `teil1_data.json` `zew_effekt_ohne_nationale_massnahmen` („EU-27, 1,5 % Diskont,
  Wohlfahrt ohne vermiedene Klimaschäden“).
- Vorschlag: „Die Emissionen in den ETS-Sektoren sind laut Kommission um 50 % gesunken; welchen
  Anteil der Emissionshandel selbst daran hat, ist in der Forschung umstritten.“ Bei ZEW:
  „Wohlfahrtsgewinn für die EU-27, Barwert bei 1,5 % Diskont, ohne vermiedene Klimaschäden“.

### Klein

**k1 · „Wo Studien gegen ein System ohne weiteren Klimaschutz rechnen … 1,0 bis 3,3 Billionen“** —
das ist genau eine Studie (ISE 2021). Vorschlag: „Die einzige gelesene Studie, die gegen ein
System ohne weiteren Klimaschutz rechnet (Fraunhofer ISE 2021), …“ (Story, Akt 5/2).

**k2 · Industrieproduktion ist B–D, nicht „Industrie“.** GP2 nennt „Industrieproduktion −15,0 %
gegenüber 2018“; der Index umfasst Bergbau und Energieversorgung (D), die durch Kohle- und
Kernkraftausstieg mechanisch sinken. Verarbeitendes Gewerbe (C) allein: 93,3 / 108,4 = −13,9 %
gegenüber 2018, −11,3 % gegenüber 2019 (eigene Rechnung aus `data/p1_10_industrieproduktion.csv`).
Zudem ist 2018 ein Konjunkturhoch. Vorschlag: Abgrenzung B–D nennen, Wert für C daneben, Hinweis
auf das Basisjahr.

**k3 · Industriestrompreis ohne Abnahmeband.** GP3 „Industriestrom … 17,4 gegen 15,6 ct/kWh“ gilt
laut Datensatz für das Band 2.000–19.999 MWh/a. Energieintensive Großabnehmer zahlen wegen
Entlastungen deutlich anders. Vorschlag: Band in den Satz; Hinweis, dass Großabnehmer nicht
abgebildet sind.

**k4 · „Die Umrechnung stimmt“ (Akt 1/3)** bestätigt die Arithmetik, aber nicht den Vergleich einer
zwanzigjährigen, nicht diskontierten Summe mit *einem* Jahres-BIP. Vorschlag: ein Halbsatz,
dass die Summe über denselben Zeitraum einer Wirtschaftsleistung von rund zwanzig Jahres-BIP
gegenübersteht (Verweis auf Akt 4).

**k5 · Tabelle in Akt 4, Zeilen „Betrieb“ und „Brennstoffe, Importe“:** Für G3 steht „Differenz“,
das gilt nur für G3b; G3a (Mehrinvestitionen) enthält Betrieb und Brennstoffe gar nicht.
Vorschlag: G3 in zwei Spalten G3a/G3b aufteilen.

**k6 · Kopfzähler der Story:** „87 Aussagen · 57 bestätigt · 17 korrigiert · 6 nicht prüfbar“ ergibt
80; 3 Setzungen und 4 verworfene fehlen. Vorschlag: alle fünf Kategorien nennen wie auf der
Belegseite.

**k7 · Glossar:** Überschrift „Fünf Begriffe“, darunter sechs. Es fehlen „Annuität /
Systemkosten“, „nominal und real“ und „Systemgrenze“ — die drei Begriffe, an denen die
Vergleichbarkeit der Studien tatsächlich hängt.

**k8 · GP10, Überschrift „Der Bundesrechnungshof widerspricht dem Bild billiger Erneuerbarer“** ist
stärker als die zitierte Stelle (Kritik an Stromgestehungskosten ohne Netzkosten als Maß der
Transformationskosten). Vorschlag: „… widerspricht einem Kostenbild ohne Netze“.

## 3. Was fehlt aus meiner Sicht

- **Sensitivität der Mehrkosten auf Brennstoff- und CO₂-Preise der Referenz.** G3b-Werte
  hängen stark davon ab; ISE 2021 rechnet mit Vorkrisenpreisen, Ariadne mit einer Referenz,
  die schon CO₂-Preise trägt. Ein Satz dazu macht die Spanne 0,4–2,9 % erst lesbar.
- **Annualisierung statt Investitionsflüsse.** Die Systemanalyse vergleicht annualisierte
  Kapitalkosten plus Betrieb plus Brennstoff; die Seite stellt Investitionsflüsse im Baujahr
  neben Kostensummen. GP9 („Finanzierungskosten fehlen“) berührt das, ohne den
  Systemkostenbegriff zu nennen.
- **Gegenläufige Effekte der G1-Größen:** Ein Teil der „Brutto-Gesamtkosten“ ist im fossilen
  Pfad Energieimport (Abfluss ins Ausland), im EE-Pfad heimische Investition. Für R21s
  Begriff „Entzug von Wertschöpfung“ ist genau diese Unterscheidung relevant; sie fehlt.
- **Selbstangaben der Studien** in der Story-Grafik, damit der Leser sieht, wie stark unsere
  Umrechnung von ihren eigenen Anteilen abweicht (siehe M1).

## 4. Was gut ist und bleiben soll

- Die Quellenkette R21 → WD 135/24 → PwC/FAZ, mit „gelesen / nicht gelesen“ je Glied, und die
  Nutzung von WD 151/24 als Beleg für den Begriff „aggregierte Gesamtkosten“.
- Die Waage „mit / ohne Energiewende“ bis Akt 5 leer zu lassen — didaktisch gut und fachlich
  genau der Punkt.
- Auftraggeber und Geldgeber in jeder Tabellenzeile, ohne daraus ein Urteil abzuleiten.
- „Hier hat R21 recht“ mit Zahl und Einschränkung; GP12 (eigene Fehler in beide Richtungen).
- „Was Teil 1 nicht zeigt“, insbesondere „Mehrkosten sind nicht gleich Belastung“.
- Die Netz-Gegenüberstellung (2.100 vs. 1,2 Bio. € DIHK vs. 675–792 Mrd. €) mit offen
  ausgewiesener Unsicherheit der Zuordnung (N03).

## 5. Der härteste Einwand

„Die Seite wirft R21 zu Recht vor, Brutto und Mehrkosten zu verwechseln — und tut es zwei
Akte später selbst: In der Grafik ‚Mehrkosten‘ stehen Mehrinvestitionen ohne Abzug eingesparter
Energie und ein bloßer Zuwachs gegenüber heute, und der Text nennt eine Obergrenze, die die
eigene Grafik überschreitet. Dazu klebt sie an die Zahl, die sie widerlegt, das Gütesiegel A,
das laut eigener Legende ‚mehrere unabhängige Quellen stimmen überein‘ bedeutet. Und die
Umrechnung auf ein festes BIP 2024 bläht gerade R21s nominale Summe auf, während die Seite
den Effekt als ‚einige Zehntel Prozentpunkte‘ abtut. Wer anderen Begriffsunschärfe nachweist,
muss die eigene Begriffsordnung bis zur letzten Grafik durchhalten. Der Befund zur Fußnote
steht; die Vergleichsrechnung in der jetzigen Form hält einem Gutachten nicht stand.“
