# Review Teil 1 · Rolle 11 · Volkswirt (Makroökonomie, öffentliche Finanzen)

Auftrag P5 (`agents/briefs/P5_reviews_teil1.md`) · Stand 22.11.2026 · geschrieben von einem Agenten (Opus),
der an Recherche, Freigabe und Bau nicht beteiligt war · Regeln: `agents/REGELN.md`, `TRANSPARENZ.md`.

**Gegenstand und Methode.** `energiewende-1-story.html` und `energiewende-1-belege.html`, gerendert über
`python3 -m http.server` und Playwright (Chromium, Node-Paket, weil das Python-Paket in dieser Umgebung
fehlt), je bei 1280 px und 390 px, ganz durchgescrollt, `<details>` geöffnet, Text aus `innerText`
gelesen. Keine Konsolenfehler und keine Anfrage an fremde Server bei allen vier Läufen. Der Text bei 390 px
ist inhaltlich gleich wie bei 1280 px. Gegengelesen wurde an `docs/03_teil1_freigabe.md`,
`data/teil1_data.json` und an den Originalen unter `quellen/raw/`: R21-Erklärung (Text), ISE 2021, ZEW
Rausch 2026 (mit `pdftotext` gelesen), KfW/Prognos 2026, Prüfbericht 02. Ich habe nichts neu abgerufen,
deshalb gibt es kein Manifest. Zeilenangaben „Story-HTML Z.“ beziehen sich auf den Quelltext, „R21 Z.“
auf `quellen/raw/P0/Erklaerung_Expertenrat_R21_2026-11.txt`.

## 1. Urteil in fünf Zeilen

1. Das Kernstück ist ökonomisch richtig und für Laien gut gemacht: brutto, Investition und Mehrkosten
   werden getrennt, und die Seite zeigt, dass R21 eine Bruttosumme als Verlust liest.
2. Die Kritik an R21s „Entzug von Wertschöpfung“ trifft aber eine verkürzte Fassung des Arguments. R21
   argumentiert mit Kapitalstock, Verdrängung und höheren Preisen (R21 Z. 258–331). Davon steht auf
   keiner der beiden Seiten ein Wort. Ein Gegner würde das sofort zeigen.
3. Bei Diskontierung, BIP-Nenner, Zinsen und Transfers ist die Ökonomik zu grob. Alle Fehler gehen in
   dieselbe Richtung: Sie lassen die Billionen-Zahlen eher größer aussehen. Das ist nicht unfair gegen
   R21, aber es ist ungenau.
4. Zwei Sätze widersprechen den eigenen Quellen der Seite. Akt 5.2 fasst Mehrinvestitionen als
   „Mehrkosten 0,4–2,9 %“ zusammen. Der Grenzen-Abschnitt sagt, keine Studie beziffere die
   Wohlfahrtswirkung, obwohl die zitierte ZEW-Studie genau das tut.
5. Ich würde die Seite nach Korrektur der drei kritischen Befunde empfehlen und die Studientabelle
   zitieren. Den Akt-1-Satz zur Wertschöpfung würde ich in der jetzigen Form öffentlich angreifen.

## 2. Befunde

### Kritisch (falsch, unfair oder irreführend; muss vor Veröffentlichung weg)

**K1 · R21s Wertschöpfungs-Argument ist als Strohmann wiedergegeben**

- *Fundstelle:* Story, Akt 1, Schritt 3: „Aber R21 nennt die Summe einen ‚Entzug von Wertschöpfung‘,
  also reinen Verlust. Dass mit dem Geld auch etwas gebaut wird, kommt nicht vor.“ (Story-HTML Z. 387).
  Ebenso Belege S08 („nicht als Investition mit Gegenwert“).
- *Problem:* Dass etwas gebaut wird, kommt bei R21 sehr wohl vor. R21 bestreitet nur, dass das Gebaute
  einen *zusätzlichen* Wert hat: „Die hierfür nötigen Investitionen bauen den Kapitalstock um, nicht
  auf … Im besten Fall hat man nach der Investition genau das, was man davor auch hatte“ (R21 Z. 262–266).
  Daraus leitet R21 zwei Wirkungen ab:
  1. Finanzierung aus laufender Wertschöpfung, die dann für „Konsum und für innovative Investitionen“
     fehlt (Z. 315–325).
  2. Ein teurerer Kapitalstock für dasselbe Produkt führt zu höheren Preisen (Z. 327–331).

  Das ist im Kern das Argument der Opportunitätskosten und der Verdrängung. Ökonomisch ist es ernst zu
  nehmen. Die Seite widerlegt eine Fassung, die R21 nicht vertritt. Auf beiden Seiten kommen
  „Kapitalstock“, „laufende Wertschöpfung“ und „Konsum“ null Mal vor. Der Satz „Dass mit dem Geld auch
  etwas gebaut wird“ lädt außerdem zum Gegenvorwurf ein: Ein Gegenwert allein macht Ausgaben nicht
  kostenlos. Wer ein funktionierendes System durch ein teureres ersetzt, trägt echte Kosten.
- *Beleg:* R21 Z. 258–331 (Druckseite 8 und Factsheet A-1), Z. 587–593 („reduzieren das in
  Deutschland verfügbare Einkommen unmittelbar“, „Wohlfahrtsverlusten“). Dossier 01, Zeilen 33 und 36
  der Behauptungstabelle, führt beide Aussagen.
- *Änderungsvorschlag:* Das Argument in R21s eigenen Worten kurz wiedergeben (Zitat Z. 262–266) und dann
  an den richtigen Stellen kritisieren:
  - Die Verdrängung betrifft nur die *Mehr*kosten. Ersatz, der ohnehin fällig wäre (Agora: 72,8 % der
    Investitionen, G09), und die laufenden Energiekosten fallen in jedem Pfad an.
  - „Genau das, was man davor hatte“ übersieht, dass der neue Kapitalstock laufende Brennstoffkäufe
    ersetzt. Eine Investition tritt an die Stelle von Betriebskosten. Genau das zieht G3b ab.
  - Das Produkt der Investition ist die Emissionsminderung (Prämisse 1). Im Brutto-Inlandsprodukt sind
    Investitionen eine Verwendung, kein Abzug. Ein Wohlfahrtsverlust ist nur der Teil, der über das
    billigste Vergleichssystem hinausgeht.

  Vorschlag für den Satz: „R21 argumentiert, der neue Kapitalstock erzeuge dasselbe wie der alte, nur
  teurer, und fehle deshalb beim Konsum. Das trifft auf die Mehrkosten zu, nicht auf die ganze Summe,
  und es übersieht, dass die Anlagen Brennstoff ersetzen.“ (neue Freigabe-ID nötig, da S08 die
  R21-Argumentation nicht vollständig abbildet).

**K2 · Akt 5 vermischt Mehrinvestitionen und Mehrkosten, und der Zusammenfassungssatz widerspricht den
eigenen Zahlen**

- *Fundstelle:* Story, Akt 5, Schritt 2: „KfW und Prognos rechnen netto 130 bis 153 Mrd. € pro Jahr
  gegen fossile Referenztechnik. Als Anteil am BIP sind das 0,4 bis 2,9 % pro Jahr.“ (Story-HTML
  Z. 679). Die Grafik dazu heißt „Mehrkosten als Anteil am BIP 2024 pro Jahr“ und zeigt Agora 3,4 %,
  KfW/Prognos netto 3,0–3,5 %, KfW 2021 1,6 % und KfW-Zuwachs 1,5 % (Story-HTML Z. 1814–1829,
  `g3rows`).
- *Problem:* Diese vier Zeilen sind G3a, also Mehr*investitionen* ohne Abzug eingesparter Energie. Akt 4
  hat genau diesen Unterschied sauber erklärt; Akt 5 hebt ihn wieder auf. Der Satz ist zudem rechnerisch
  falsch: 130–153 Mrd. € sind nach der eigenen Studientabelle 3,0–3,5 % des BIP, nicht 0,4–2,9 %. Der
  Leser nimmt mit, die Mehrkosten lägen bei höchstens 2,9 %, obwohl eine genannte Zahl darüber liegt. Das
  schönt in Richtung Energiewende. Fachlich gilt umgekehrt: G3a überzeichnet die Kosten, weil die
  Brennstoffeinsparung fehlt. Gerade deshalb dürfen G3a und G3b nicht unter einem Titel stehen.
- *Beleg:* Freigabeliste Abschn. 8.1 (G3a-Zeilen für Agora, KfW 2026 netto, KfW 2021); Belege-Tabelle
  „Alle Studien nach den drei Größen“; `data/teil1_data.json`, `mehrkosten_anteil_bip_pa`
  (Abgrenzung „G3b“) gegenüber `mehrinvestitionen_anteil_bip_pa` (1,5–3,5).
- *Änderungsvorschlag:* Die Grafik in zwei Gruppen teilen: „Mehrinvestitionen (ohne eingesparte
  Energie)“ und „Mehrkosten nach Abzug eingesparter Energie“. Den Satz ersetzen durch: „Als Anteil am BIP
  sind das 1,5 bis 3,5 % als Mehrinvestitionen und 0,4 bis 2,9 % als Mehrkosten nach Abzug eingesparter
  Energie.“

**K3 · Belegseite O07 ist in sich verdreht**

- *Fundstelle:* Belege, Freigabe-Tabelle, O07: „ISE 2021 rechnet mit einem niedrigeren BIP 2020 als
  Eurostat. Die BIP-Anteile der Studie fallen dadurch zu niedrig aus“. Der Satz ist im HTML von Hand
  geschrieben (Belege-HTML Z. 593) und kommt nicht aus dem Datensatz.
- *Problem:* Ein *niedrigeres* BIP im Nenner ergäbe zu *hohe* Anteile. Tatsächlich rechnet ISE mit dem
  *höheren* Wert: „BIP von Deutschland aus dem Jahr 2020 von etwa 3,806 Billionen €“. Eurostat nennt
  3.477,67 Mrd. €. Die Folgerung „zu niedrig“ stimmt also, aber die Begründung ist falsch herum
  geschrieben. Die Zeile trägt den Status „bestätigt“.
- *Beleg:* ISE 2021, PDF-S. 40 (`ise_wege_update2045_2021.txt` Z. 1729–1730); Prüfbericht 02, Z. 93
  und Korrektur `ise2021_bip_bezug`; Freigabeliste O07.
- *Änderungsvorschlag:* „ISE 2021 rechnet mit einem höheren BIP 2020 (3,806 Bio. €) als Eurostat
  (3.477,67 Mrd. €). Die BIP-Anteile der Studie fallen dadurch rund 9 % zu niedrig aus.“ Den Satz aus
  dem Datensatz speisen, nicht von Hand.

### Mittel (schwächt die Seite deutlich)

**M1 · Dass die Summen nicht abgezinst sind, steht nirgends, und daneben stehen abgezinste Werte**

- *Fundstelle:* Alle Billionen-Summen (10–13,8; 13,3; 8,6; 1,0–3,3 Bio. €). Daneben GP5 („824 bis
  1.071 Mrd. € als Barwert“) und der Kasten Klimafolgen (UBA 345 / 990 €/t). Das Glossar erklärt
  „Barwert“ nur für den ZEW-Wert.
- *Problem:* Fast alle Kostenzahlen sind einfache Summen über 20 bis 25 Jahre. Sie entsprechen einem
  Diskontsatz von null. ZEW zinst mit 1,5 % ab, UBA mit 1 % bzw. 0 % reiner Zeitpräferenz. Auf einer
  Seite stehen damit drei Konventionen, und der Leser erfährt nicht, welche wo gilt. Gerade die
  „Billionen“ wirken groß, weil sie nicht abgezinst sind.
  Zur Veranschaulichung, als Setzung (M) und eigene Rechnung: 690 Mrd. € pro Jahr über 20 Jahre (R21s
  Obergrenze) ergeben als Barwert bei 1,5 % rund 11,9 Bio. €, bei 3 % rund 10,3 Bio. €, nicht 13,8.
  Das ist kein Argument für oder gegen R21. Es zeigt aber, dass die Zahl von einer Konvention abhängt.
- *Beleg:* ZEW Rausch 2026, Tab. 1, Fußnote a („discount rate 1.5% p.a.“); UBA-Tabelle (Q29);
  Freigabeliste Abschn. 8 (Summen als Studienwerte ohne Abzinsung).
- *Änderungsvorschlag:* Einen Satz in „So lesen Sie die Zahlen“ und im Glossar ergänzen: „Die
  Billionen-Summen sind einfache Summen über 20 bis 25 Jahre, nicht abgezinst. Ein Barwert wäre kleiner.
  Nur der ZEW-Wert ist ein Barwert.“ Beim UBA-Satz die Zeitpräferenz nennen (1 % / 0 %).

**M2 · Der BIP-Nenner ohne Wachstum überzeichnet alle Anteile, um mehr als „einige Zehntel“**

- *Fundstelle:* Story, Grenzen, „Der BIP-Bezug ist eine Setzung“: „Die Anteile sind Näherungen, je
  nach Studie um einige Zehntel Prozentpunkte.“ Gleich in der Belegseite.
- *Problem:* Der Jahresdurchschnitt 2025–2045 wird durch das BIP 2024 geteilt. Das BIP dieser Jahre ist
  aber im Mittel größer.
  - Mit 1 % realem Wachstum (Setzung M, eigene Rechnung) liegt das mittlere BIP 2025–2045 rund 11,8 %
    über 2024. Agora sinkt dann von 12,3 auf 11,0 % und R21 von 15,7 auf 14,1 %.
  - Ist R21s Summe nominal gemeint (unbekannt) und wächst das nominale BIP um 3 %, liegt R21 bei rund
    11,2 % statt 15,7 %.

  Bei den großen Anteilen beträgt die Abweichung also über einen Prozentpunkt. Die Rangfolge bleibt
  gleich, weil sich alle Anteile im selben Verhältnis verkleinern. Der Abstand R21 gegenüber G3b
  schrumpft absolut, bleibt aber eine Größenordnung.
- *Beleg:* eigene Rechnung, BIP 2024 = 4.386,94 Mrd. € aus `teil1_data.json`; die Wachstumsraten sind
  Annahmen und als solche zu kennzeichnen.
- *Änderungsvorschlag:* „Der Bezug auf das BIP 2024 überzeichnet alle Anteile, weil die Wirtschaft bis
  2045 wächst; bei 1 % Wachstum um rund ein Zehntel ihres Werts. Die Reihenfolge der Studien ändert sich
  dadurch nicht.“

**M3 · „Das beziffert keine der Studien“ stimmt nicht: Die ZEW-Studie misst genau R21s
„Wohlfahrtsverlust“**

- *Fundstelle:* Story, Grenzen, „Mehrkosten sind nicht gleich Belastung“: „Ob eine Volkswirtschaft eine
  Summe trägt, hängt auch an Finanzierung, Gegenwert und Wachstum. Das beziffert keine der Studien.“
  (Story-HTML Z. 894)
- *Problem:* Die Seite zitiert selbst ZEW Rausch 2026 (Q28). Diese Studie misst die Wohlfahrtskosten der
  EU-Klimapolitik als Konsumverlust (Hicks'sche äquivalente Variation): 5.257 Mrd. € Barwert 2028–2048
  für die EU-27, das sind 2,74 % des Konsums. Klimanutzen ist darin nicht enthalten, Bezug ist „keine
  Klimapolitik“. Genau diese Größe verlangt R21 selbst („Zu den Kosten und den Wohlfahrtsverlusten …
  findet man dort nichts“, R21 Z. 591–593). Auch die Bundesbank-Rechnung (R07, −2,1 % Wertschöpfung)
  ist eine gesamtwirtschaftliche Wirkung. Der Satz gilt nur für die Bottom-up-Studien der Tabelle;
  KfW/Prognos schließt solche Aussagen ausdrücklich aus (Studie Z. 545–550).
- *Beleg:* ZEW, Executive Summary (PDF-S. 3) und Tab. 1 mit Fußnote (S. 15); R21 Z. 591–593;
  `kfw_prognos_2026_studie.txt` Z. 545–550.
- *Änderungsvorschlag:*
  - Den Satz auf „keine der Kostenstudien in der Tabelle“ eingrenzen.
  - Die ZEW-Zahl als neue Aussage in die Freigabeliste aufnehmen, mit Abgrenzung (EU-27, Barwert 1,5 %,
    gegen „keine Klimapolitik“, ohne Klimanutzen, nicht auf Deutschland umrechenbar).
  - Sie auf der Seite als einzige gelesene Wohlfahrtsgröße zeigen: Sie liegt in der Größenordnung von
    G3, weit unter 11–16 % des BIP. Gleichzeitig bestätigt sie R21 darin, dass Klimapolitik echten
    Konsum kostet.

**M4 · Das stärkste ökonomische Argument für R21, vermeidbare Kosten durch Instrumentenwahl, wird
verschenkt**

- *Fundstelle:* Story GP5: „beziffert den Effekt, wenn nationale Zusatzmaßnahmen entfallen, auf 824 bis
  1.071 Mrd. € als Barwert“. Akt 5.2: „Selbst die DIHK-Studie ‚Plan B‘ ist ein Klimaneutralitätspfad …
  spart dort … 530 bis 910 Mrd. € bis 2050. Ausgestiegen wird auch dort nicht.“
- *Problem:* Der Leser erfährt nicht, *was* die 824 Mrd. € sind. Es ist die Einsparung an Wohlfahrts-
  bzw. Konsumkosten, wenn der CO₂-Preis nicht durch nationale Vorschriften und Förderprogramme
  überlagert wird. Das ist der Lehrbuchbefund zu überlappenden Instrumenten unter einer Mengenobergrenze.
  Er stützt R21s Richtung, nämlich dass die heutige Politik teurer als nötig ist. Die DIHK-Einsparung
  von 11–17 % zeigt dasselbe für Deutschland. Die Seite nutzt sie nur als Beleg, dass auch die DIHK
  nicht aussteigen will. Damit trennt sie nicht sauber zwischen zwei Fragen: Ob Klimaneutralität zu
  teuer ist, verneinen die Studien. Ob der *gewählte Weg* unnötig teuer ist, bejahen sie teilweise.
- *Beleg:* ZEW S. 3, Tab. 1 S. 15, S. 15–16 („cumulative policy costs decrease by 20.4%“); DIHK „Plan B“ S. 12 (V10).
- *Änderungsvorschlag:* GP5 ergänzen: „Die ZEW-Zahl ist eine Einsparung an Konsumkosten für die EU,
  wenn der CO₂-Preis nicht durch nationale Vorschriften überlagert wird. Sie stützt R21s Kritik an der
  Instrumentenwahl.“ In Akt 5.2: „Die DIHK-Studie zeigt zugleich, dass 11 bis 17 % der Kosten durch eine
  andere Steuerung vermeidbar wären. Hier hat R21 einen Punkt.“ Eventuell als eigene Gegenposition.

**M5 · Klimafolgen-Kasten: „keine lässt sich gegen die Kosten der Energiewende aufrechnen“ ist
methodisch falsch**

- *Fundstelle:* Story, Kasten „Auch Nichtstun kostet“, Vorbehalt (Story-HTML Z. 759); dazu GP7: „Die
  Studie mit der fossilsten Referenz (Fraunhofer ISE 2021) liefert die höchsten Werte: 2,2 bis 2,9 %“.
- *Problem:* Der UBA-Kostensatz je Tonne ist genau dafür gemacht, vermiedene Schäden gegen
  Vermeidungskosten zu rechnen (Methodenkonvention). Die Studie, die die Seite als „höchste Werte“
  führt, tut das selbst. ISE 2021 zieht die vermiedenen Umweltkosten nach UBA (1 % Zeitpräferenz) ab.
  Die Mehraufwendungen sinken dann von 1.000–3.300 auf 340–1.300 Mrd. €, nach Studienangabe 0,3–1,4 %
  des BIP pro Jahr. Richtig ist nur:
  - Die 280–900 Mrd. € und die UBA-Sätze dürfen nicht addiert werden (V13).
  - Weltweite Schäden gegen nationale Kosten zu rechnen, ist eine Frage der Perspektive.

  Die Seite verschweigt so ein Ergebnis aus einer bereits gelesenen und zitierten Quelle (Q13), und
  zwar das, das gegen die R21-Lesart spricht. Fair wäre beides zu nennen.
- *Beleg:* `ise_wege_update2045_2021.txt` Z. 287–300 und Z. 1700–1745 (PDF-S. 8 und 40, Abb. 22,
  Fn. 1 „1% reine Zeitpräferenzrate“).
- *Änderungsvorschlag:* Den Vorbehalt ersetzen durch: „Die beiden Zahlen dürfen nicht addiert werden.
  Wer die weltweiten Schäden je Tonne gegenrechnet, wie Fraunhofer ISE 2021, kommt auf deutlich
  niedrigere Netto-Mehrkosten; das ist eine Wahl der Perspektive, keine Gewissheit.“ Die ISE-Werte vorher
  in die Freigabeliste aufnehmen. In GP7 einen Halbsatz zum selben Ergebnis ergänzen.

**M6 · GP9 „Finanzierungskosten fehlen“ argumentiert nur in eine Richtung**

- *Fundstelle:* Story GP9: „Die Studien zählen Investitionen im Jahr, in dem gebaut wird. Zinsen stehen
  nicht darin.“ Der Kasten steht unter „Warum niedrige Mehrkosten zu optimistisch sein können“.
- *Problem:* Die Studien buchen die volle Investition im Baujahr. Dadurch fehlen einerseits die Zinsen,
  das spricht für zu niedrige Kosten. Andererseits wird der ganze Anschaffungswert dem Zeitraum bis 2045
  zugerechnet, obwohl Netze, Windräder und Gebäudedämmung weit darüber hinaus nutzen. Ein Restwert wird
  nicht abgezogen, das spricht für zu hohe Kosten. ISE 2021 schreibt selbst, nach 2045 sänken die
  Investitionen deutlich, weil nur noch Ersatz anfalle (Z. 309–311). Die richtige Größe sind jährliche
  Kapitalkosten (Annuität mit Kapitalkostensatz). Welche Richtung überwiegt, hängt von Zins und
  Lebensdauer ab. Als einseitiges „zu optimistisch“ ist der Kasten nicht gedeckt.
- *Beleg:* `ise_wege_update2045_2021.txt` Z. 309–311; DIHK Fn. 27 (O03); ef.Ruhr/EWI S. 4 (N10, dort
  Vollkosten mit Abschreibung und Zins).
- *Änderungsvorschlag:* Die Einschränkung erweitern: „Umgekehrt rechnen die Summen die vollen
  Anschaffungskosten dem Zeitraum bis 2045 zu, obwohl die Anlagen länger laufen. Beides zusammen kann
  die Summe in beide Richtungen verschieben.“ Für die Freigabe ist eine neue Aussage nötig.

**M7 · GP10: Das EEG-Konto ist eine Frage der Lastverteilung, keine Unterschätzung der Mehrkosten**

- *Fundstelle:* Story GP10 (Rubrik „Warum niedrige Mehrkosten zu optimistisch sein können“): „Kosten
  wandern außerdem vom Strompreis in den Bundeshaushalt: Der Bund zahlte 2024 18,49 Mrd. € … Diese Summe
  sieht man auf keiner Stromrechnung.“
- *Problem:* Ob die Förderung über eine Umlage oder aus dem Haushalt bezahlt wird, ändert, *wer* zahlt
  und *wie sichtbar* es ist. Die volkswirtschaftlichen Kosten ändert es nicht. Die Systemstudien zählen
  die Anlagen unabhängig von der Finanzierung. Unter der Überschrift „Mehrkosten zu optimistisch“ legt
  die Zahl nahe, sie komme zu den Studienwerten hinzu. Das wäre eine Doppelzählung.
- *Beleg:* Freigabeliste O06 (Aussage nur „verschoben“), Abschn. 6 Nr. 5 („Mehrkosten sind nicht gleich
  Belastung“).
- *Änderungsvorschlag:* Den EEG-Teil unter „Wer zahlt?“ oder in den Grenzen-Abschnitt verschieben, mit
  dem Satz: „Das verschiebt, wer die Kosten trägt; es kommt nicht zu den Studienwerten hinzu.“

### Klein

**k1 · Das R21-Zitat in Akt 1.3 ist um die Zeitangabe gekürzt.** R21 schreibt: „Das entspricht dem Zwei-
bis Dreifachen der jährlichen Wirtschaftsleistung für einen Zeitraum von zwanzig Jahren“ (Z. 597–598).
Die Seite zitiert ohne „für einen Zeitraum von zwanzig Jahren“. R21 hat den Zeitraum also selbst
genannt; das sollte fairerweise im Zitat stehen. Die Grafik setzt eine 20-Jahres-Summe gegen ein
Jahres-BIP. Der Satz „Die Umrechnung stimmt“ kann wie eine Bestätigung des Vergleichs wirken.
*Vorschlag:* Zitat vollständig, und gleich in Akt 1.3 ein Halbsatz: „pro Jahr sind das 11 bis 16 % der
Wirtschaftsleistung, mehr dazu in Akt 4.“

**k2 · Doppelte Verneinung in GP2.** „… die Wertschöpfung der Industrie um rund −4,4 % dämpfen“: Wer
um minus dämpft, erhöht. *Vorschlag:* „um rund 4,4 % dämpfen“ (Belegseite R07 formuliert richtig mit
„verändern … um −4,4 %“).

**k3 · Transfers in den PwC-Energiekosten.** Akt 3.3 nennt, dass PwC laut DIW CO₂-Preis und Umlagen zu
den Energiekosten zählt, sagt aber nicht, was das bedeutet. Volkswirtschaftlich sind das zum großen Teil
Umverteilungen innerhalb des Landes, keine verbrauchten Ressourcen. Ein „Entzug“ der Gesamtwirtschaft
sind sie nicht. Die Freigabeliste nennt den Punkt nur als Grund für X05. *Vorschlag:* ein Halbsatz in
Akt 3.3: „CO₂-Preis und Umlagen fließen großteils im Land zurück; sie sind Kosten für den Zahler, aber
kein Verlust für die Volkswirtschaft.“

**k4 · „Die einzige amtliche Fundstelle“ (GP6).** Das Glossar sagt selbst, eine Kurzinformation sei
„keine Position des Bundestags“. *Vorschlag:* „die einzige Fundstelle aus dem Parlament“.

## 3. Was fehlt aus Sicht des Volkswirts

1. **Investition gegen Konsumverzicht, offen gerechnet.** Ob zusätzliche Investitionen Konsum verdrängen,
   hängt an Auslastung, Zinsen und an der Frage, ob sie aus dem Inland oder über geringere Kapitalexporte
   finanziert werden. Deutschland hat seit Jahren einen Leistungsbilanzüberschuss; ein Teil der
   Finanzierung kann daher aus weniger Kapitalexport statt aus weniger Konsum kommen. R21 (Z. 315–318)
   unterstellt eine geschlossene Volkswirtschaft. Teil 1 nennt das nicht. Eine Zahl habe ich nicht
   geprüft: Lücke, für Teil 6 bei Eurostat oder Destatis zu holen.
2. **Energieimporte als der eigentliche Abfluss.** Von den Bruttokosten verlässt nur der Importanteil
   das Land (DIHK „Plan B“: 2,0–2,3 Bio. € Energieimporte 2025–2049, G07). Ein fossiler Pfad hätte
   vermutlich höhere Importe (X13, nur mit dieser Einschränkung). Das wäre die sachliche Antwort auf
   „Wertschöpfungsentzug“ und fehlt.
3. **Vorzeitige Stilllegung als Kostenart.** R21 nennt den Abriss der Kernkraftwerke „sinnlose Zerstörung
   erheblicher Vermögenswerte“ (Z. 79–80). Entwertetes Kapital ist ein echter volkswirtschaftlicher
   Kostenposten, und die Studien behandeln ihn unterschiedlich. Teil 1 schweigt dazu. Ein Hinweis auf
   Teil 6 genügt.
4. **Gesamtwirtschaftliche Modelle.** Außer ZEW und Bundesbank fehlen Top-down-Studien zu BIP- und
   Beschäftigungswirkungen. Das gehört als Lücke in „Was Teil 1 nicht zeigt“, nicht als „keine Studie“.
5. **Kapitalkosten.** Die Seite nennt die Lücke (GP9) ehrlich. Für Teil 6 braucht es einen
   Kapitalkostensatz je Akteur (Staat, Netzbetreiber, Haushalte), weil er die Rangfolge
   kapitalintensiver gegenüber brennstoffintensiven Pfaden entscheidet.
6. **Eine Größenordnung für den Leser.** 0,4–2,9 % des BIP pro Jahr sind viel oder wenig, je nach
   Vergleich. Ein Anker, zum Beispiel der Anteil der Anlageinvestitionen am BIP oder das jährliche
   Wachstum, aus Eurostat `nama_10_gdp`, würde helfen. Nicht geprüft, deshalb hier ohne Zahl.

## 4. Was gut ist und so bleiben soll

- Die Dreiteilung G1 / G2 / G3 mit der Tabelle „was ist enthalten“ und das maßstabsgerechte Quadrat im
  Quadrat (ISE 2024: 8,6 Bio. € gegen 1,1–1,35 Bio. €). Das ist die beste Laien-Erklärung von brutto
  gegen netto, die ich kenne.
- BIP-Bezug, Division und Summenbildung sind durchgehend als Setzung (M) markiert. Auftraggeber und
  Geldgeber stehen bei jeder Studie.
- GP7 (Referenz enthält schon Klimaschutz) und GP8 (Beharrung) sind ökonomisch richtig und zeigen, dass
  niedrige Mehrkosten keine Untergrenze sind.
- „Ob eine Volkswirtschaft eine Summe ‚überlebt‘, ist keine prüfbare Aussage. Prüfbar ist, was die Summe
  misst.“ Der Satz ist richtig und zurückhaltend.
- Der Verzicht auf den falschen „Faktor 5 bis 30“ (G13) zugunsten nebeneinander gestellter Bänder.

## 5. Der härteste Einwand

„Die Seite erklärt zu Recht, dass R21 eine Bruttosumme mit Energiekosten für einen Verlust hält. Dann
macht sie es sich aber selbst zu leicht. Sie behauptet, bei R21 komme nicht vor, dass mit dem Geld etwas
gebaut wird. R21 schreibt das Gegenteil: Der neue Kapitalstock produziere dasselbe wie der alte, nur
teurer, und das Geld fehle beim Konsum. Dieses Argument ist ernst zu nehmen, und es trifft auf die
Mehrkosten zu. Die Mehrkosten verwischt die Seite im entscheidenden Akt: Sie fasst Mehrinvestitionen von
bis zu 3,5 % als ‚Mehrkosten bis 2,9 %‘ zusammen. Sie sagt, keine Studie beziffere die
Wohlfahrtswirkung, und zitiert im selben Text die ZEW-Studie, die genau das tut: 2,7 % des Konsums für
die EU, ein Fünftel davon durch bessere Instrumente vermeidbar. Das ist die ökonomische Antwort auf R21.
Sie fällt deutlich unter R21s Größenordnung, gibt R21 aber in einem Punkt recht: Der gewählte Weg ist
teurer als nötig. Wer R21 Quellentreue abverlangt, muss diese Zahl zeigen, auch wenn sie R21 teilweise
recht gibt.“
