# Runde 2 · Prüfung der seit v0.7 neuen Mechaniken (Chart-Mix, Lernkurve, Vorlagenbibliothek, Varianten-Anfälligkeit, Null-Option, demandCreator)

**Stand:** 11.09.2026 · **Objekt:** `visual-standards-rechner.html` v0.10, Funktionen `calc()` (Zeilen 677–768) und `calcSQ()` (773–781), Annahmen `GLOBAL` (528–547) und `OPTP` (549–578) · **Prüfer:** Fable (Subagent) · **Netz:** WebSearch verfügbar; direkt blockiert waren ibcs.com, powerofbi.org, gwern.net (Studien- und Artikeltexte daher nur über Suchtreffer).

Alle Angaben sind entweder *Beleg* (mit URL) oder *Meinung/Rechnung* (gekennzeichnet). Nachrechnungen stammen aus einem Node-Skript mit der 1:1 kopierten `learnF`-Formel (`scratchpad/learn.js`), die Preset-Faktoren decken sich mit dem README-Nachtrag v0.8 (Pilot 1,03; Großkonzern Core 0,80).

## Kurzfazit

1. Die neuen Mechaniken sind formal sauber gebaut (Normierung des Chart-Mix ergibt bei 50/35/15 exakt 1, Wright-Mittelwert per Integral korrekt, Lernkurve nur auf den Rollout, nicht auf den Erstbau). Der Rechenkern hat keinen groben Fehler.
2. Zwei **verdeckte Annahmen** wirken stärker als alle sichtbaren neuen Werte: (a) die Normierungsmischung `cx0 = 50/35/15`, für die die Panelstunden gelten sollen, ohne dass das Panel je eine Mischung genannt bekam, und (b) der Anker „Panelwert = 10. Chart“ in der Lernkurve. Jede der beiden verschiebt die Stunden der Code-Ansätze um 15–25 %, beide stehen in keiner Annahmen-Tabelle.
3. Eine **Doppelzählung** zwischen Lernkurve und Vorlagenbibliothek ist angelegt: Die Begründung der höheren Lernrate für Deneb und Core lautet wörtlich „Vorlagenbibliothek reift“, und `libF` multipliziert zusätzlich. Bei aktivem Schalter und Maximalwerten fällt Deneb-Wiederverwendung unter Paid.
4. Die **Null-Option** ist asymmetrisch gebaut: Sie ignoriert den Chart-Mix, trägt eine dreifach höhere Wartungslast als die Standards und begründet ihre Leserzeit mit einer falsch zugeschriebenen Studie. Die Studie (TU München / blueforte 2019) existiert, ist nicht von Zebra, und ist ein Laborexperiment mit 90 Studierenden.

## Evidenz, die ich gefunden habe

| Thema | Quelle | Was sie sagt | Einordnung |
|:--|:--|:--|:--|
| Lernraten nach Arbeitsart | Hirschmann, „Profit from the Learning Curve“, HBR 1964 (Volltext auf gwern.net blockiert, Inhalt über Suchtreffer): 80 % bei 75 % Handarbeit, 85 % bei 50/50, 90 % bei 25 % Handarbeit; DAU „Learning Curve Theory“ (https://www.waru.edu/sites/default/files/Migrated/CopDocuments/B5%20Application%20of%20Learning%20Curve%20Theory%20Feb%2011.pdf) | Handarbeit lernt steiler als maschinengetaktete Arbeit | Beleg (Fertigung), Übertragung auf Vorlagen-Befüllung ist Meinung |
| Inkompressibler Anteil | DeJong 1957, zitiert in Wong 2013 (https://www.hindawi.com/journals/aor/2013/584762/) und DTIC-Vergleichsstudie (https://apps.dtic.mil/sti/trecms/pdf/AD1054102.pdf): `y = C1·(M + (1−M)·n^−b)`, M ≈ 0,25 bei Montage bis 1 bei maschinengesteuerten Zeiten | Lernkurven flachen ab, ein fester Anteil lernt nicht | Beleg für die Modellform |
| Lernen in Wissensarbeit | Boh, Slaughter, Espinosa, „Learning from Experience in Software Development“, Management Science 53(8), 2007 (https://www.researchgate.net/publication/220535077_Learning_from_Experience_in_Software_Development_A_Multilevel_Analysis) | Lernkurven existieren auch in Softwarearbeit, spezialisierte Erfahrung im selben System wirkt am stärksten; Gruppen- und Organisationslernen zusätzlich | Beleg für Existenz, keine Rate für Chart-Bau |
| Lesezeit mit IBCS | „More than just a standard“, blueforte + TU München 2019, Management Summary (https://www.ibcs.com/wp-content/uploads/2020/01/blueforte_IBCS-study_Mgmt-Summary_2019_ENG.pdf, Domain blockiert, Inhalt über Suchtreffer): 90 Studierende (BWL/IT), Reports in zufälliger Reihenfolge einmal „typisch“, einmal IBCS; 140,9 s statt 261,7 s je Aufgabe (−120,8 s, „46 % schneller“), ~61 % weniger Fehler; Eye-Tracking nur bei 6 Personen | Laborwirkung der Notation groß | Auftraggeber blueforte ist IBCS-Beratungspartner (interessengeleitet, aber kein Visual-Hersteller); Studierende, unbekannte Reports, Einzelaufgaben: Obergrenze für die Praxis |
| Gestaltungselemente | Falschlunger, Eisl, Losbichler, Greil: „Improving Information Perception of Graphical Displays“ (Säulendiagramme, Eye-Tracking, https://www.semanticscholar.org/paper/985cb21ff4f47a7da2a05dad5bb744ca7178cd57) und G_WORD (FH OÖ, https://www.researchgate.net/publication/294872792) | Einzelne Designregeln (kein 3D, keine gebrochene Achse, Werte beschriften) wirken messbar | Unabhängig, aber keine Minuten je Woche |
| SVG-Wasserfall in Core | powerofbi.org, „Responsive SVG Charts in Power BI Core Visuals“ 11/2025 (blockiert; Suchtreffer: dreistufiger SVG-Chart mit Säulen, absoluter Abweichung als Wasserfall und relativer Abweichung, per DAX-Measure) | Machbar, aber Eigenbau je Chart-Typ | Kein Stundenwert |
| Report-Vermehrung | EPC Group, „Power BI Report Sprawl“ (https://www.epcgroup.net/blog/power-bi-report-sprawl-intelligence-governance): 300–2.000 Reports in auditierten Fortune-500-Umgebungen | Wachstum ist die Regel | Keine Rate je Ersteller |
| Panel-Erfahrungsstand | `sessions/visual-standards-rechner-reviews/p1.json`, E01: „Zebra-BI- und Core-Routine aus 30+ Reports drückt diese Zahlen“; p5: „Deneb-Routine und JSON-Vorwissen drücken Aufwand“ | Panelisten schätzten teils auf Routine-Niveau | Lokaler Beleg für die Anker-Frage |
| Panel-Chart-Mix | `06-blindschaetzung-sonnet.md` Zeile 41: firstH als „Ø über Abweichung/Wasserfall/Small Multiples/Szenario“; das Panel-Protokoll enthält keine Mischung | Implizit ein Wasserfall von vier Typen | Die 50/35/15-Normierung ist nirgends verankert |

## Funde (wichtigste zuerst)

### F1 · Die Normierungsmischung `cx0 = [0,5; 0,35; 0,15]` ist eine verdeckte Annahme mit −7 % bis −24 % Hebel

**Heute:** `calc()` Zeile 689–690: `compMult = (mix·cx)/(cx0·cx)` mit `cx0 = [.5,.35,.15]`. Text: „Die Panel-Stunden gelten für die Mischung 50 / 35 / 15.“
**Prüfung:** Das Panel wurde nie nach einer Mischung gefragt (Protokoll `expertenpanel-aufwand.md` nennt keine); die Blindschätzung beschreibt ihren Mittelwert als Durchschnitt über vier Typen inklusive Wasserfall, also eher 25 % komplex. Für welche Mischung die Panelstunden gelten, ist damit Autoren-Setzung, und sie steht in keiner Annahmen-Tabelle (nur im Hinweistext und im Code).
**Wirkung (Rechnung):** Wäre die Panel-Mischung 40/35/25, dann gilt bei Nutzer-Mischung 50/35/15: compMult core 0,76, deneb 0,83, oss 0,91, paid 0,93. Die Rangfolge Deneb/Core gegen Paid verschiebt sich um 10–17 Prozentpunkte, ohne dass jemand einen Regler angefasst hat.
**Vorschlag:** `cx0` als sichtbare globale Annahme „Mischung, für die die Panelstunden gelten“ führen (Badge E), Default vorerst 50/35/15 belassen, und die Frage in die Pre-Conference-Umfrage oder die geplante Messung aufnehmen. Alternativ die Panel-Rohdaten nachfragen (E01, E10, E11 haben implizit Typen genannt).
**Evidenz:** lokale Dateien (siehe Tabelle). **Konfidenz:** mittel (dass die Annahme verdeckt ist: hoch; welche Mischung richtig wäre: niedrig). **Wirkung:** hoch.

### F2 · Der Lernkurven-Anker „Panelwert = 10. Chart“ ist ein verdeckter ±20-%-Hebel auf den Rollout der Code-Ansätze

**Heute:** `learnF` Zeile 693: `avg · 10^b`, Anker 10 hart codiert, nur im Untertitel der Annahme `learn` erwähnt.
**Prüfung (Rechnung):** Charts je Ersteller in den Presets: Pilot 24, Mittelstand 41, Konzern 60, Report Server 54, Großkonzern 75. Faktor bei Lernrate 15 % (Deneb/Core): 1,03 / 0,91 / 0,84 / 0,86 / 0,80. Mit Anker 20: 1,21 / 1,08 / 0,99 / 1,01 / 0,94. Mit Anker 40: 1,42 / 1,27 / 1,17 / 1,19 / 1,11. Allgemein: Anker ×3 ⇒ Faktor ×1,29 bei 15 %. Paid (5 %) bewegt sich nur zwischen 0,93 und 1,11.
**Bewertung:** Die Panelisten haben teils ausdrücklich auf Routine-Niveau geschätzt („Routine aus 30+ Reports“), teils auf Unerfahrenheit („Deneb-Unerfahrenheit treibt Aufwand“). Der Median entspricht damit eher einem mittleren Erfahrungsstand als dem 10. Chart; 10 ist eine plausible, aber unbegründete Setzung. Dass die Lernkurve überhaupt nur auf `reuseH` wirkt und nicht auf `firstH`, ist richtig (Erstbau je Typ passiert genau einmal). Nicht konsistent: `switchCost` (Zeile 718) nutzt `reuseH` ohne `learnRoll`, obwohl Migrations-Charts dieselbe Übung sind.
**Vorschlag:** Anker als globale Annahme „Erfahrungsstand hinter dem Panelwert“ mit [10, 20, 40] Charts (Erwartungswert ≈ 21,7) sichtbar machen; Erwartungseffekt gegenüber heute: Deneb/Core im Mittelstand ≈ +18 %, im Konzern ≈ +17 %, Paid ≈ +5 %. Wer den Default nicht ändern will, sollte den Anker mindestens im Hinweistext der Annahme mit der Sensitivität nennen. `switchCost` mit `learnRoll` multiplizieren.
**Evidenz:** Panel-Notizen (lokal), Wright-Formel. **Konfidenz:** mittel. **Wirkung:** hoch.

### F3 · Lernkurve und Vorlagenbibliothek zählen dieselbe Ursache doppelt

**Heute:** Zeile 716: `rollout = … · reuseH · compMult · libF · learnRoll · …`. `learn`-Hinweis: „Code-Ansätze lernen mehr (Vorlagenbibliothek reift)“; `libF` deneb [0,4; 0,6; 0,8], core [0,5; 0,7; 0,9].
**Prüfung:** Die höhere Lernrate der Code-Ansätze wird mit der reifenden Vorlagenbibliothek begründet; der Schalter „Vorlagenbibliothek vorhanden“ bepreist dieselbe Reifung ein zweites Mal, multiplikativ. Zusätzlich setzt `reuseH` laut Panel-Definition („Vorlage übernehmen, Felder binden, Titel anpassen“) bereits eine eigene Vorlage voraus; eine fremde Bibliothek spart vor allem im Erstbau (`firstH`) und in der Schulung, weniger beim Binden.
**Wirkung (Rechnung):** Konzern-Preset, Deneb, Schalter an: 2,5 h × 0,6 × 0,84 = 1,26 h gegen Paid 1,0 × 0,94 = 0,94 h. Mit Maximalwerten (libF 0,4, Lernrate 25 %): 2,5 × 0,4 × 0,71 = 0,71 h, also unter Paid. Die Untergrenze 0,5 gilt nur für `learnRoll`, nicht für das Produkt.
**Vorschlag:** (a) `libF` voll auf `firstH` und `trainH`, auf `reuseH` nur gedämpft (`√libF`, deneb ≈ 0,77, core ≈ 0,84); (b) bei aktivem Schalter Lernrate für deneb/core auf den OSS-Wert [5, 10, 15] setzen, weil die Bibliothek den Reifungsgewinn vorwegnimmt; (c) Untergrenze auf das Produkt `libF · learnRoll ≥ 0,5` anwenden. Alternative mit nur einem Parameter: Bibliothek als Vorsprung auf der Lernkurve modellieren (`learnF(n + n0)`, n0 ≈ 30 Charts) und `libF` auf `reuseH` streichen; im Mittelstand ergibt das 0,69 statt 0,55.
**Evidenz:** keine externe; Begründungstext der Annahme selbst. **Konfidenz:** mittel-hoch (Doppelzählung), mittel (Höhe der Korrektur). **Wirkung:** mittel (nur bei Schalter an; dann bis 30 % auf den Deneb-Rollout).

### F4 · Lernraten: Werte vertretbar, Maximum 25 % zu steil, harte Untergrenze 0,5 durch DeJong-Form ersetzen

**Heute:** `learn` paid [0, 5, 10], oss [5, 10, 15], deneb/core [8, 15, 25]; `Math.max(.5, …)`.
**Prüfung:** Hirschmann/DAU: 90 % (10 %) bei überwiegend maschinengetakteter Arbeit, 85 % bei 50/50, 80 % bei überwiegend Handarbeit. Vorlage befüllen ist „werkzeuggetaktet“ (Klick-Wege, Rendering, Review), Spec-Editing eher Handarbeit; die Abstufung paid < oss < deneb = core ist damit in der Richtung belegt. 25 % (75 %-Kurve) entspricht komplexer Montage und ist für das Anpassen einer JSON-Spec zu steil; Boh et al. belegen für Softwarearbeit Lernen, aber flacher als in der Fertigung. Die Untergrenze 0,5 greift bei den Presets nie (Großkonzern bei 25 % erst 0,71; bindend ab ca. 400 Charts je Kopf), ist aber ein Knick statt einer Kurve. DeJong bietet die belegte Form: `M + (1−M)·n^−b`, M = inkompressibler Anteil (Felder binden, Test, Abnahme).
**Wirkung (Rechnung, M = 0,5, Anker 10):** Mittelstand deneb/core 0,97 statt 0,91; Konzern 0,94 statt 0,84; Großkonzern 0,93 statt 0,80. Die Lernkurve wird also etwa halb so stark.
**Vorschlag:** deneb/core [5, 12, 20]; Formel `learnF` auf DeJong mit M je Ansatz umstellen (paid 0,7, oss 0,6, deneb/core 0,5) oder, wenn kein neuer Parameter gewünscht ist, M = 0,5 für alle und die harte Untergrenze streichen. Zusätzlich: Fluktuation setzt Lernen zurück; bei 11 % je Jahr über 5 Jahre ist knapp die Hälfte der Ersteller ausgetauscht. Eine einfache Korrektur `n_eff = n / (1 + churn/100 · H/2)` hebt den Faktor um etwa 6 %; niedrige Priorität.
**Evidenz:** HBR 1964 / DAU (Lernraten), Wong 2013 / DTIC (DeJong), Boh et al. 2007 (Softwarearbeit). **Konfidenz:** mittel. **Wirkung:** mittel.

### F5 · Die Null-Option ignoriert den Chart-Mix und gewinnt dadurch bei komplexen Mischungen künstlich

**Heute:** `calcSQ()` Zeile 776: `build = reportsTotal · cpr · sqChartH · rateInt0`, kein `compMult`. Hinweistext: „Sie kann keine komplexen Charts liefern; dieser Nutzenverlust ist nicht bepreist.“
**Prüfung:** Bei Mischung 20/30/50 steigen die Standards um Faktor 1,26 (Paid) bis 2,1 (Core), der Status quo bleibt bei 2 h je Chart. Der Vergleich „lohnt sich ein Standard“ kippt damit genau dort zugunsten des Status quo, wo der Standard fachlich am nötigsten ist. Das ist ein Formelfehler, kein Wertproblem.
**Vorschlag:** `build` mit einem Null-Options-Komplexitätsfaktor multiplizieren, der die Core-Faktoren nutzt (`cxSimple`/`cxComplex` von core, weil die Null-Option per Definition Core Visuals ad hoc ist), oder mit eigenen Faktoren [0,5; 1; 2] und dem Hinweis, dass ein „komplexer“ Chart ad hoc als Ersatzdarstellung (Tabelle plus zwei Balken) entsteht. Zweite, ehrlichere Variante: den komplexen Anteil aus dem Status-quo-Bau streichen und im Text sagen, dass diese Charts nicht entstehen.
**Evidenz:** keine nötig (Code). **Konfidenz:** hoch. **Wirkung:** mittel (null bei Standardmischung, groß bei abweichender).

### F6 · Wartung der Null-Option: Quote und Bemessungsbasis beide höher als bei den Standards, das entscheidet den Business Case

**Heute:** `sqMaint` [20, 30, 45] % auf 100 % des Ad-hoc-Baus (Zeile 778); Standards: Quote [6–30] % auf `setup + dev + build + 0,3 · rollout`. Kein Breaking-Update-Term in der Null-Option.
**Prüfung (Rechnung, Mittelstand, Erwartungswerte):** Bau ≈ 23 k€, Wartung ≈ 30 k€, Leserzeit ≈ 45 k€, Rückfragen ≈ 3 k€; ohne Leserzeit ≈ 56 k€ gegen Paid 59 k€ (README: „Status quo 3.400 € günstiger“). Die Wartung ist über 5 Jahre das 1,3-fache des Baus: jedes Ad-hoc-Chart wird rechnerisch mehr als einmal neu gebaut. Die Standards tragen die Instanz-Wartung nur zu 30 % und mit niedrigerer Quote; die Aussage „Vorlagen senken die Instanz-Wartung um Faktor 3–10“ ist damit die tragende, unbelegte Prämisse des Vergleichs Standard gegen Status quo. Dass die Basis 1,0 statt 0,3 ist, ist die richtige Stelle für den Effekt (ohne Vorlage wird jeder Report einzeln angefasst); die zusätzlich höhere Quote zählt dieselbe Ursache ein zweites Mal. Da die Null-Option keinen Events-Term hat, gehört ein Teil der Plattformbrüche (Core-Regressionen 2025) allerdings in die Quote.
**Vorschlag:** `sqMaint` [12, 22, 35] (Niveau der OSS-Quote plus Anteil für Brüche, weil ad hoc gebaute Core Visuals keine SVG-Workarounds tragen), Basis 1,0 beibehalten, und im Null-Options-Text die Wartung als entscheidenden Posten ausweisen („Der Status quo verliert über die Wartung: x € gegen y €“), damit der Leser sieht, woran der Business Case hängt.
**Evidenz:** keine; Konvention gegen Konvention. **Konfidenz:** niedrig-mittel. **Wirkung:** mittel-hoch für die Aussage „lohnt sich ein Standard“, null für die Rangfolge der vier Ansätze.

### F7 · Leserzeit: Studie falsch zugeschrieben, 52-Wochen-Basis, Parametrisierung passt nicht zur Evidenz

**Heute:** `sqReadMin` [0,5; 2; 6] min je Viewer und Woche, `× 52/60 × H × rateInt`; Hinweis: „Herstellerstudien (Zebra BI: ‚46 % schneller lesen‘) sind interessengeleitet.“
**Prüfung:** Die 46 % stammen nicht von Zebra, sondern aus „More than just a standard“ (blueforte + TU München, 2019): 90 Studierende, randomisierte Reihenfolge, 140,9 s statt 261,7 s je Aufgabe, ~61 % weniger Fehler, Eye-Tracking bei 6 Personen. Zebra zitiert sie nur. Auftraggeber ist ein IBCS-Beratungspartner, also interessennah, aber kein Visual-Hersteller; das Setting (Studierende, unbekannte Reports, Einzelaufgaben) liefert eine Obergrenze für den Alltag, keine Minuten je Woche. Unabhängige Belege gibt es nur für einzelne Gestaltungsregeln (Falschlunger/Eisl/Losbichler), nicht für die Notation als Ganzes. Die Formel rechnet 52 Wochen (Urlaub, Feiertage: eher 45–46) und setzt voraus, dass jeder Viewer wöchentlich liest.
**Vorschlag:** Hinweistext korrigieren (TU München/blueforte 2019, 90 Studierende, Labor; Zebra als Zitierender). Parametrisierung an die Evidenzform anpassen: „Minuten je Viewer und Woche mit Reports“ [10, 30, 60] × „davon durch Notation eingespart“ [3, 8, 20] % ergibt im Erwartungswert ≈ 2,6 min und macht die Herleitung prüfbar; 52 → 46 Wochen. Wenn nur ein Parameter bleiben soll: [0,5; 2; 6] behalten, Quelle richtigstellen.
**Evidenz:** Management Summary (URL oben, Inhalt über Suchtreffer). **Konfidenz:** hoch (Text), niedrig (Wert). **Wirkung:** niedrig für die Zahl, hoch für die Glaubwürdigkeit vor Konferenzpublikum (die Zuschreibung ist nachprüfbar falsch).

### F8 · `variantG`: Open Source wieder doppelt so anfällig wie Paid, ohne Begründung; Vorlagenbibliothek wirkt nicht darauf

**Heute:** paid [0,1; 0,25; 0,4], oss [0,3; 0,5; 0,7], deneb [0,5; 0,75; 1], core [0,6; 0,85; 1]; `variantEff = 1 + (variantF − 1)·variantG` wirkt auf Wartung und Freigabe.
**Prüfung:** Die Definition („0 = Vorlagen erzwingen Einheitlichkeit, 1 = jeder baut anders“) hängt an der Formatierungsfreiheit des Visuals, nicht am Lizenzmodell. Ein fertiges OSS-Visual mit IBCS-Voreinstellungen bändigt Varianten wie ein gekauftes; das v0.7-Audit hat genau dieses Muster (OSS = 2 × Paid ohne Ursache) elfmal korrigiert. Umgekehrt ist bei Deneb/Core eine Vorlagenbibliothek per Definition der Mechanismus, der Varianten senkt; `S.lib` verändert `variantG` aber nicht. Managed-Preset: variantEff core 1,43, paid 1,13; Self-Service: 2,7 gegen 1,5.
**Vorschlag:** oss [0,15; 0,3; 0,5]; bei aktivem Schalter `variantG · (0,5 + 0,5 · libF)` für deneb/core (analog zur Schulung). Wer ChartKitchen konkret kennt: bewerten, wie viele Formatierungsfreiheiten das Visual gegenüber Zebra lässt, und den Wert daran festmachen.
**Evidenz:** keine; Konsistenzargument und v0.7-Audit. **Konfidenz:** mittel. **Wirkung:** niedrig-mittel (OSS-Wartung im Managed-Preset −8 %).

### F9 · Komplexitätsfaktoren: Werte plausibel, aber derselbe Faktor auf Erstbau und Wiederverwendung überzeichnet Paid und OSS

**Heute:** cxSimple/cxComplex paid 0,7/1,4, oss 0,7/1,6, deneb 0,5/2,5, core 0,4/4; `compMult` wirkt identisch auf `firstH` (je Typ) und `reuseH` (je Instanz).
**Prüfung:** Für Core ist die Spreizung 10:1 durch die Blindschätzung gestützt („einfacher SVG-Bullet 5 h, voll interaktiver Wasserfall mit Szenario-Logik 60+ h“, `06-blindschaetzung-sonnet.md` Z. 80) und durch den dokumentierten dreistufigen SVG-Chart (powerofbi.org 11/2025): ein Wasserfall mit Szenario ist Eigenbau je Typ. Für Paid und OSS gilt die Spreizung im Erstbau (Standard definieren), aber kaum in der Wiederverwendung: Ein Zebra-Wasserfall wird genauso gebunden wie ein Zebra-Balken. Bei Core und Deneb bleibt sie auch in der Wiederverwendung (Measures kopieren, Spec-Felder anpassen). Außerdem: Der Mix beschreibt Chart-Instanzen, `types` Chart-Typen; bei 5 Typen sind 15 % komplex = 0,75 Typen, das ist tolerierbar.
**Vorschlag:** Für die Wiederverwendung die Faktoren bei paid/oss dämpfen: `cxReuse = 1 + (cx − 1)·0,5` für Klick-Werkzeuge, voll für Code-Ansätze; oder einfacher paid cxComplex [1,0; 1,2; 1,5], oss [1,1; 1,3; 1,8], mit Hinweis, dass der Erstbau die Spreizung trägt. Wirkung nur bei abweichender Mischung.
**Evidenz:** lokale Blindschätzung, powerofbi.org (Suchtreffer). **Konfidenz:** mittel. **Wirkung:** niedrig.

### F10 · `demandCreator` [0,2; 0,5; 1]: keine Evidenz, Wert behalten, Nebenwirkung auf die Lernkurve kennen

**Heute:** neue Standard-Reports je Ersteller und Jahr, Badge E; in `calc()` und `calcSQ()` identisch verwendet (gut: die Null-Option wächst mit).
**Prüfung:** Report-Sprawl ist qualitativ belegt (EPC Group: 300–2.000 Reports in Fortune-500-Umgebungen), eine Rate je Ersteller gibt es nirgends. Der Wert bedeutet bei Managed Self-Service (4 Reports je Ersteller zu Beginn) plus 62 % Bestand über 5 Jahre, also rund 10 % je Jahr; das ist eher vorsichtig, aber „Standard-Reports“ sind eine Teilmenge aller Reports. Nebenwirkung: `demandCreator` erhöht `chartsPerCreator` und damit die Lernkurve; bei Code-Ansätzen kompensiert das einen Teil des Mehraufwands (im Konzern etwa ein Drittel), bei Paid fast nichts. Das ist modelllogisch richtig, sollte aber im Hinweistext stehen.
**Vorschlag:** Wert unverändert; Umfrage-Frage „Wie viele neue Standard-Reports je Ersteller und Jahr?“ in die Pre-Conference-Erhebung aufnehmen; Hinweis zur Lernkurven-Kopplung ergänzen.
**Evidenz:** EPC Group (qualitativ). **Konfidenz:** niedrig. **Wirkung:** niedrig.

## Was ich geprüft und für in Ordnung befunden habe

- `compMult`-Normierung: bei 50/35/15 exakt 1 für jede Ziehung, also kein Einfluss der PERT-Streuung der Faktoren auf die Presets (die Tornado-Zeilen für cxSimple/cxComplex zeigen deshalb 0; das ist korrekt, nicht ein Bug).
- Wright-Mittelwert: Integral von 0,5 bis n+0,5 ist die übliche Mittelpunktskorrektur, richtig implementiert; `learnRoll` fließt korrekt in `nextReportH`, nicht in `firstReportH`.
- Null-Option: `needMin = (bc − noRead50)/readRate` ergibt korrekt die Break-even-Minuten; `noRead` und `read` sind sauber getrennt; `intFactor` konstant wie bei den Ansätzen.
- Vorlagenbibliothek und Schulung: `0,5 + 0,5·libF` ist für Paid/OSS neutral (libF = 1), das ist gewollt.

## Reihenfolge der Umsetzung (Meinung)

1. F7 Text (10 Minuten, verhindert eine nachprüfbar falsche Aussage auf der Bühne).
2. F5 Formel (Null-Option × Komplexität).
3. F1 und F2 sichtbar machen (auch ohne Wertänderung: Anker und Normierungsmischung in die Annahmen-Tabelle, Badge E).
4. F3 Doppelzählung (Untergrenze auf das Produkt, Lernrate bei Schalter).
5. F6, F8, F4 Werte; F9, F10 optional.

Rechenskript: `/tmp/…/scratchpad/learn.js` (Kopie der `learnF`-Formel mit Anker-, Untergrenzen- und DeJong-Varianten; Preset-Mengen wie im Rechner inklusive Nachfrage).
