# Nachprüfung Teil 1 · Rolle 21 · Freigabe-Prüfer mit Prüfskript

Stand 23.11.2026 · Auftrag P6-E (`agents/briefs/P6-E_nachpruefung.md`) · Regeln `agents/REGELN.md`,
`TRANSPARENZ.md` v0.2 · Gegenstand `energiewende-1-story.html` (sha256 `dc0d33b7c023…`) und
`energiewende-1-belege.html` (`0d3c84b1f660…`), gebaut aus `data/teil1_data.json` (`2f0b17874180…`,
Freigabeliste v2). An Freigabe v2 und Neubau war ich nicht beteiligt. Kein Netzabruf, deshalb kein Manifest.

## Urteil in fünf Zeilen

1. Die Story besteht alle maschinellen Prüfungen: Jede Zahl stammt aus dem Datensatz, trägt beide Abzeichen und ist richtig formatiert. Es gibt keine verbotene Formulierung, alle 13 Gegenpositionen sind da, und jeder Sprung zur Langfassung kommt an.
2. Die Belegseite besteht (a) bis (c) und (e) bis (g). An (d) scheitert sie: Der eigene Zahlenformatierer weicht von Formatregel 7 ab, zum Beispiel „1“ statt „1,0“, „2.032“ als Jahreszahl und Minuszeichen neben „fielen“ oder „verloren“.
3. Auf beiden Seiten stehen Zahlen in Freitext-Feldern ohne Zahl-ID und ohne Abzeichen: in der Korrekturen-Tabelle und in der Spalte „Angabe der Studie“. Die Belegseite nennt dazu die BIP-Angabe von ISE 2021 fälschlich „kein BIP-Anteil“.
4. Von den 20 kritischen Punkten der Synthese sind 17 behoben und 2 teilweise behoben (P010 Nutzenseite in der Story, P011 „109 Tage“ in der Story-Korrekturtabelle). P013, die Stellungnahme von R21, ist offen; der Mensch hat sie bewusst zurückgestellt.
5. Stand: **freigabereif als Entwurf**. Vor der Veröffentlichung und vor dem Satz „keine Zahl von Hand“ (P05) muss das Prüfskript ohne Befund durchlaufen. Dafür reichen M1 bis M3 unten, eine weitere Review-Runde braucht es dafür nicht.

## Methode

- Prüfskript `energiewende/scripts/check_teil1_seiten.mjs` (Node, Playwright `chromium.launch()` ohne Optionen). Es startet einen eigenen Webserver auf 127.0.0.1 und rendert beide Seiten bei 1280 px und 390 px. Die Story wird einmal ganz durchgescrollt. Danach öffnet das Skript alle `<details>`, greift alle Texteinheiten einschließlich SVG-Text ab und prüft (a) bis (g). Lauf: `node energiewende/scripts/check_teil1_seiten.mjs [--verbose] [--prosa] [--json=…] [--root=…]`, etwa 50 s. Exit-Code 1 bei jedem Befund, 2 bei Abbruch.
- (a) ist als Skelett-Abgleich gebaut: Zahlen und Platzhalter werden zu `#`, Spannen zu einem `#`. Jedes Satz- oder Feldstück der Seite mit Ziffer, %, €, „Euro“, „Prozent“ oder einem Studiennamen muss als Teilfolge in einem Datensatz-Text stehen. Jede Ziffernfolge muss als Wert, als Zählung oder wörtlich im Datensatz vorkommen. (d) rechnet die erwartete Darstellung jeder Zahl selbst nach Formatregel 7 aus. Dafür liest das Skript die Nachkommastellen aus dem JSON-Quelltext, so wie die Story. Danach vergleicht es Wert, Zitat-Abzeichen, Wert-Abzeichen und, auf der Belegseite, die Liste „Zahlen und Herkunft“. In der Story prüft es zusätzlich die 44 Zeilen der Wertetabellen zu den Grafiken über `FIGS`.
- Ausnahmenliste im Skript: A1 bis A18 und Zone Z1, je mit Begründung. Sie betreffen Zählungen, die zur Laufzeit aus dem Datensatz entstehen und gegen diese Zählungen geprüft werden, außerdem Achsenstriche, Achsentitel, Gliederung, Kopf- und Fußzeilen. Feldbezeichnungen wie „Quelle:“ und „Abgrenzung:“ werden vor dem Abgleich abgeschnitten.
- **Gegenprobe:** Mit `--root` habe ich veränderte Kopien beider Seiten geprüft, im Scratch-Ordner und mit Symlinks auf `assets/` und `energiewende/`. Sieben eingebaute Fehler: ein handgeschriebener Satz mit „999 Milliarden“, alle B-Abzeichen als „A“, ein fehlender Vorbehalt bei S01, ein Google-Fonts-Abruf, ein falscher GP3-Link, „gefälscht“ im Kopf der Belegseite und B01 (Ort `story`) auf der Belegseite. Alle sieben wurden erkannt: (a), (a2), (b), (c), (d) mit 194 Befunden, (e), (f) und (g).
- Von Hand geprüft: die 20 kritischen Punkte am gerenderten Text beider Seiten, an Datensatz, Freigabeliste und README. P015 bis P018 habe ich zusätzlich bei 390 px vermessen (Text außerhalb der viewBox, Überlappung von SVG-Texten, Sticky-Elemente, Karte über Grafik) und drei Szenen fotografiert (2.4, 5.1, 5.2) und angesehen.
- Prozessnotiz: Zu Beginn lieferte ein fremder Server auf Port 8765 kurz die alte Story mit „A · gelesen“-Abzeichen aus. Ich habe deshalb nur mit eigenem Server geprüft und die Hashes oben festgehalten. Während meines Laufs blieben beide Seiten und der Datensatz unverändert.

## Befunde nach Gewicht

### Kritisch

Keine.

### Mittel

**M1 · Belegseite nennt die BIP-Angabe von ISE 2021 „kein BIP-Anteil, nicht gezeichnet“.**
Fundstelle: Belegseite, Studien-Vergleich, Wertetabelle zur Grafik (`#twin`) und Grafik (`drawChart`).
Beleg: `studien[ise2021_g3b].bip_studie_text` lautet „1 bis 3,0–3,5 % des BIP 2020 (BIP der Studie größer als laut Eurostat)“, und das ist ein BIP-Anteil (ISE 2021, `quellen/raw/P1-02/ise_wege_update2045_2021.txt` Z. 298–300: „Bezogen auf das Bruttoinlandsprodukt … von 1 % … bis zu rund 3,0 - 3,5 %“). Der reguläre Ausdruck in `studyVals()` erkennt die Form „1 bis 3,0–3,5“ nicht. Dadurch hängt der Seitencode den Zusatz „(kein BIP-Anteil, nicht gezeichnet)“ an und zeichnet den Vergleichskreis nicht. Ausgerechnet bei der Studie mit den höchsten G3b-Werten fehlt so der Abgleich zwischen unserer Rechnung und der Angabe der Studie. Der Zusatz ist ein Tatsachensatz von Hand und falsch.
Vorschlag: Die Angabe der Studie als Zahl mit `min`/`max` in den Datensatz aufnehmen, zum Beispiel `ise2021_bip_studie` mit {min 1, max 3,5}, so wie `ise2024_bip_studie`. Den Zusatz „kein BIP-Anteil“ nur aus einem Datensatz-Feld setzen, nie aus einem gescheiterten Parse.

**M2 · Zahlen ohne Zahl-ID und ohne Abzeichen in Freitext-Feldern (beide Seiten, je 18 Zellen).**
Fundstelle: Story, „Eigene Fehler“, Tabelle „Was jetzt gilt“ (`korrekturen_eigene[].neu`) und Wertetabelle der Studiengrafik 4.3, Spalte „Angabe der Studie“ (`studien[].bip_studie_text`). Belegseite: Korrekturen, Spalte „Jetzt“, und `#twin`.
Beleg: Prüfskript (d), Abschnitt „Freitext-Feld“, zum Beispiel »dazu 109 Tage für Deutschland allein, mit Einschränkungen (R09c)«, »grob 90–150 Mrd. € ohne Elektrolyseure (E01)«, »+3 / +10 / +22 % (E03)«, »2,7 GW als Setzung des Prüfers (E04)«, »7–10 % (jährliche Ausgaben)«. Diese Ziffern prüft `build_teil1_data.py` nicht: Regel 6 dort gilt nur für claims, schritte, gegenpositionen und glossar. Die 109 Tage stehen in der Story damit ohne C-Abzeichen, ohne „rund ein Drittel“ und ohne den Hinweis auf das Podcast-Transkript (Rest von P011).
Vorschlag: In `neu` und `bip_studie_text` Platzhalter verwenden und die Prüfregel 6 des Build-Skripts auf `korrekturen_eigene` und `studien` ausdehnen. Alternativ in der Spalte nur den Verweis auf die Aussage zeigen, zum Beispiel „siehe R09c“, ohne Zahl.

**M3 · Zahlenformat der Belegseite verletzt Formatregel 7 (64 Befunde je Breite, eine Ursache).**
Fundstelle: Belegseite, `fmtNum()` und `resolve()` (Z. 418–461). Betroffen sind Aussagen, Kurzfassung und Gegenpositionen in voller Länge.
Beleg (Prüfskript d):
- Nachkommastellen „wie gespeichert“ fehlen: `String(n)` macht aus 1.0 „1“. Das betrifft V07, K04 und KK („1 bis 3,3 Billionen“), R02 und GP1 („8“ statt „8,0“), R03 und GP2 („15“ statt „15,0“), N13 und GP9 („7“, „18“ statt „7,0“, „18,0“), G07 und R08. Die Story zeigt dieselben Zahlen mit Komma: „15,0 Prozent“ gegen „15 Prozent“ auf der Belegseite.
- Eine Jahreszahl mit Tausenderpunkt: V04a „bis 2.032“. `fmtNum` erkennt Jahre nur an der Einheit „Jahr“, nicht am Schlüssel `jahr`.
- Minuszeichen, obwohl ein Wort im Satz die Richtung schon trägt: R03 und GP2 „verloren gegenüber 2019: Chemie -17,9, Glas und Keramik -20 …“, R05 „In der EU fielen Chemie um -16 und Metall um -12,2 Prozent“, R10 und GP5 „R21 nennt … rund 51 Prozent Minderung seit 2005, die Kommission -50 Prozent“. Der letzte Satz liest sich, als widerspreche die Kommission R21, obwohl dort die Übereinstimmung belegt werden soll. Die Story zeigt in allen Fällen den Betrag und ist damit richtig.
- Ein Abzeichen mitten in der Spanne: S06 „2,2Wert: eigene Rechnung- bis 3,0Wert: eigene Rechnung-mal“. Die Regel `same` in `resolve()` kennt den Bindestrich vor „bis“ nicht.

Vorschlag: Beide Seiten nutzen dieselbe Formatfunktion, so wie es Freigabe Regel 7 verlangt („eine Formatfunktion je Einheit“). Die Story hat sie mit `parseData`, `decFor`, `nf` und `isYear` samt Schlüssel `jahr`. Die Belegseite sollte diese Funktion übernehmen. Die Vorzeichenregel richtet sich nach dem ganzen Satz, nicht nur nach den 30 Zeichen danach. Für R03, R05 und R10 reicht der Betrag.

### Klein

- **K1 · Belegseite: „Zitat geprüft“ steht nicht am Fließtext.** Im Text trägt jede Zahl nur das Wert-Abzeichen (430 Zahlen bei zwei Breiten). Beide Angaben stehen erst in der aufklappbaren Liste „Zahlen und Herkunft“ darunter, und zwar vollständig und richtig; das hat das Skript geprüft. Die Lesehilfe erklärt das zwar, aber TRANSPARENZ Abschn. 2 sagt „jede Zahl trägt zwei Abzeichen“, und die Story zeigt beide im Text. Vorschlag: ein kurzes Zitat-Zeichen inline oder ein Satz in TRANSPARENZ, der die Belegseiten-Form ausdrücklich erlaubt.
- **K2 · Interne Arbeits-ID im Leserbild.** Story, Grafik 2.4, Untertitel „noch leer; Akt 5 nimmt die Waage wieder auf (P120)“ (Foto `shot_390_s-2-4.png` im Scratch-Ordner). Quelle ist `schritte[2.4].grafik.untertitel`. Vorschlag: „(P120)“ im Datensatz streichen.
- **K3 · Story-Kasten GP4 stützt sich auf R09c (nicht prüfbar, C) ohne Vorbehalt in der Kurzfassung.** Gemeint ist „fünf Tage sind nicht der schwerste Fall“. Der Vorbehalt steht nur in der Langfassung. KK macht es richtig („laut einer Studie, die wir nur aus einer Meldung kennen“). Vorschlag: GP4.kurz um „(laut DIW-Podcast)“ ergänzen.
- **K4 · Handgeschriebene Sätze mit Sachgehalt ohne Ziffer** (außerhalb von Prüfung (a), gefunden mit `--prosa`). Auf der Belegseite steht in der Messlatte „Die Messlatte misst Nachprüfbarkeit, nicht Richtigkeit. Verglichen wird nur innerhalb eines Dokumenttyps. Die Quellentreue (K3) ist nur für das eigene Stück bewertbar …“. Die Lesehilfe der Story definiert C anders als TRANSPARENZ und die Belegseite: „Original nicht gelesen oder nur aus zweiter Hand“ statt „Primärquelle nicht auffindbar oder nicht prüfbar“. Vorschlag: Beides als Text in den Datensatz aufnehmen, zum Beispiel in `meta` oder `glossar`, und auf beiden Seiten gleich ausgeben.
- **K5 · Zone „Vorher (falsch)“.** Die Korrekturen-Tabelle der Belegseite zeigt 13 verworfene oder verbotene Wortlaute als alten Text: 0,4–1,9 %, 30–100 %, 4,1 GW, 7,1 TWh, 130–153, 824–1.071, „Ausreißer“, „gebaute westliche Projekte“, „auch etwas gebaut wird“, „aufrechnen“, „Keine Zahl auf dieser Seite …“ und andere. Der Auftrag nennt als erlaubte Orte nur „Verworfen“ und „verwenden wir nicht“. Das Skript behandelt die Spalte als dritte Zone (Z1) und meldet jeden Treffer als Hinweis. **Der Mensch muss entscheiden**, ob diese Spalte als dokumentierte Ausnahme gilt; ich halte sie für sinnvoll.
- **K6 · Zahlen von Hand im Seitencode, die P05 berühren.** Die Story-Leseangabe rechnet mit `WPM = 200` („gerechnet mit 200 Wörtern je Minute“), einer Setzung, die nicht im Datensatz steht. Achsenstriche und Achsentitel entstehen im Code. Fachlich ist das unbedenklich, aber der Satz „keine Zahl von Hand“ (P05) wäre damit nicht wörtlich wahr. Vorschlag: `WPM` in `meta` aufnehmen und P05 auf „keine Zahl im Text“ eingrenzen.
- **K7 · Grafik 5.1 bei 390 px:** Die Gitterlinie bei 500 läuft durch die Beschriftung „Kostenansätze westlicher Neubau|projekte“ (Foto `shot_390_s-5-1.png`). Das ist kein Text außerhalb der viewBox und keine Überlappung zweier Texte, also ein Fall für Rolle 22.

## Ausgabe des Prüfskripts

Aufruf `node energiewende/scripts/check_teil1_seiten.mjs`, gekürzt auf die ersten Befunde je Prüfung. Die vollständige Liste kommt mit `--verbose`. Exit-Code 1.

```
Prüfskript Teil 1 · Datensatz v2 Stand 2026-11-23 · sha256 2f0b17874180
Seiten: energiewende-1-story.html (dc0d33b7c023), energiewende-1-belege.html (0d3c84b1f660) · Breiten 1280, 390 px
Korpus: claims, gegenpositionen, schritte, glossar, quellen, studien, prozess_protokoll, korrekturen_eigene; zusätzlich zahlen, meta, verworfen, verbotene_formulierungen, offene_entscheidungen, arbeitsliste_nachweis · 7406 Texte · 1535 Zahlformen
  story 1280 px: 1308 Texteinheiten, 184 Zahlen im Text, 112 Elemente mit data-claim, 44 Tabellenzeilen zu Grafiken
  story 390 px: 1303 Texteinheiten, 184 Zahlen im Text, 112 Elemente mit data-claim, 44 Tabellenzeilen zu Grafiken
  belege 1280 px: 3088 Texteinheiten, 602 Zahlen im Text, 223 Elemente mit data-claim
  belege 390 px: 3077 Texteinheiten, 602 Zahlen im Text, 223 Elemente mit data-claim

OK     (a) Sätze mit Zahl, Prozent, Euro oder Studienname stammen aus dem Datensatz · 10099 Prüfschritte
OK     (a2) Zahlen auf der Seite stehen im Datensatz · 14872 Prüfschritte
OK     (b) Aussagen nur auf der erlaubten Seite; Verworfenes nur in „Verworfen“ · 862 Prüfschritte
OK     (c) keine verbotene Formulierung außerhalb „verwenden wir nicht“ · 120 Prüfschritte
FEHLER (d) jede Zahl mit beiden Abzeichen, passend zum Datensatz; Wert richtig dargestellt · 1732 Prüfschritte · 116 Befunde
         - story: Zahl ohne Zahl-ID und ohne Abzeichen in Freitext-Feld: »7–10 % (jährliche Ausgaben)« (table>tbody>tr>td)
         - story: Zahl ohne Zahl-ID und ohne Abzeichen in Freitext-Feld: »dazu 109 Tage für Deutschland allein, mit Einschränkungen (R09c)« (table>tbody>tr>td)
         - story: Zahl ohne Zahl-ID und ohne Abzeichen in Freitext-Feld: »grob 90–150 Mrd. € ohne Elektrolyseure (E01)« (table>tbody>tr>td)
         - belege 1280px: S06: r21_bip_vielfaches: Abzeichen mitten in der Spanne
         - belege 1280px: V07: ise2021_mehraufwand|min zeigt »1«, Datensatz nach Formatregel »1,0«
         - belege 1280px: V04a: r21_kkw_reaktivierung|jahr zeigt »2.032«, Datensatz nach Formatregel »2032«
         - belege 1280px: R03: energieintensiv_de_2025_ggue_2019|chemie steht als »-17,9« mit Minus, obwohl der Satz die Richtung schon trägt (Formatregel 7): »Die energieintensiven Zweige verloren gegenüber 2019: Chemie #, Glas und Keramik #, Metall #, Papier # Prozent«
         - belege 1280px: R10: ets_minderung_seit_2005 steht als »-50« mit Minus, obwohl der Satz die Richtung schon trägt (Formatregel 7): »Beim Emissionshandel stimmt R21s Zahl: R21 nennt eine Minderung um rund # Prozent seit 2005, die Kommission # Prozent bis 2024«
         … (116 insgesamt: 40 Vorzeichen, 36 Freitext, 36 Nachkommastellen, 2 Jahreszahl, 2 Spanne; die Story hat nur die 18 Freitext-Befunde)
OK     (e) Vorbehalt steht bei jeder Aussage, die einen hat · 230 Prüfschritte
OK     (f) Gegenpositionen sichtbar; Sprung Story → Langfassung funktioniert · 52 Prüfschritte
OK     (g) keine fremden Hosts, keine Konsolenfehler, kein leerer Platzhalter · 16 Prüfschritte

Hinweise (kein Abbruchgrund):
  - story: 35 Aussagen mit passendem Ort ohne data-claim auf der Seite: N09, N10, N12, N13, O11, R01 … R16, K01, K02, K03, K05, E01 … E04, P05
  - story: Wertetabelle der Studiengrafik (Schritt 4.3) trägt ein Abzeichen je Zeile für zwei Werte (fest, wachsend); beide sind eigene Rechnungen mit gleichem Abzeichen
  - story: Kasten GP4 stützt sich auf R09c (nicht prüfbar); der Vorbehalt steht nur in der Langfassung auf der Belegseite
  - story: Kasten KK stützt sich auf K01 (nicht prüfbar); der Vorbehalt steht nur in der Langfassung auf der Belegseite
  - belege: 13 verworfene oder verbotene Wortlaute stehen als alter Wortlaut in der Spalte „Vorher (falsch)“ der Korrekturen-Tabelle (…); vom Skript als dritte erlaubte Zone behandelt (Ausnahme Z1)
  - belege: 1 Aussagen mit passendem Ort ohne data-claim auf der Seite: P05
  - belege: 430 Zahlen (je Breite gezählt) tragen im Fließtext nur das Wert-Abzeichen; „Zitat geprüft“ steht erst in der aufklappbaren Liste „Zahlen und Herkunft“ darunter (Story: beide im Text)

Genutzte Ausnahmen: A7×2, A8×2, A9×48, A6×500, A11×102, A16×2, A18×4, A13×6, A15×4, A14×10, A5×2, A4×14, A1×336, A3×4, A17×8, A10×12, A12×2

Ergebnis: 1 von 8 Prüfungen gescheitert
```

Zum Hinweis über KK: Die KK-Kurzfassung sagt „laut einer Studie, die wir nur aus einer Meldung kennen“ und trägt den Vorbehalt damit sinngemäß. Das Skript prüft hier nur den Wortlaut. Bei GP4 gilt der Hinweis (K3).

## Die 20 kritischen Punkte der Synthese

| Punkt | Kurz | Stand | Beleg (gerendert, Datensatz) |
|---|---|---|---|
| P001 | G3a und G3b in Akt 5 vermischt | **behoben** | Schritt 5.2 „Mehrinvestitionen und Mehrkosten“ mit drei beschrifteten Gruppen, der Zuwachs ist eine eigene Zeile. G03 nennt 1,6–3,5 % (G3a) und 0,4–2,9 % (G3b) getrennt. Akt 4.1 zeigt vier Größen G1, G2, G3a, G3b. „Oberer Rand“ steht nur noch in G12 für die Brutto-Studien. |
| P002 | „gebaute westliche Projekte“ | **behoben** | V03 und die Legende 5.1 sagen „Kostenansätze westlicher Neubauprojekte (geplant und im Bau)“, dazu die Abgrenzung (unten ohne Finanzierung, oben mit Bauzinsen) und „R21 sagt nicht, welche Preisbasis“. README Z. 49 ist am 23.11. korrigiert. X15 kommt nur in „verwenden wir nicht“ und „Vorher (falsch)“ vor. |
| P003 | Strohmann „kommt nicht vor“ | **behoben** | S08 „R21 bestreitet nicht, dass gebaut wird … ‚um, nicht auf‘“, S09 mit „Für die Mehrkosten trifft R21s Argument dagegen zu“. X18 kommt im Text nicht vor. |
| P004 | Systempreis verschwiegen | **behoben** | V05a (beide Seiten): 8,2 ct/kWh, 105 und 82 €/MWh, mit Vorbehalt. V05 ist auf „Summen“ eingegrenzt. V05b (38-ct-Vergleich, nicht vergleichbar) steht nur auf der Belegseite. |
| P005 | Batterierechnung 1,4 Bio. € fehlt | **behoben** | Story GP4: „R21s Batterierechnung über 1.400 Milliarden Euro passt aber nicht zur Technik der Netzplanung“. Belegseite R09a (12,5-fache Kapazität offengelegt), R09b und E01 „ohne Elektrolyseure, weiter weit unter R21s Batterierechnung“. |
| P006 | Unsicherheit nur nach oben | **behoben** | 5.3 zeigt beide Seiten mit „≥ höher“ und „≤ niedriger“ und der Legende „ohne Längenbedeutung“. O09 sagt „können zu niedrig oder zu hoch sein … rechnet Teil 6“. Die Gruppenüberschrift „Mehrkosten können zu niedrig sein“ für GP7–GP11 bleibt, sie ist deren Art. |
| P007 | „aufrechnen“ im Klimakasten | **behoben** | K03 „dürfen nicht addiert werden. Eine eigene Kosten-Nutzen-Rechnung macht Teil 1 nicht.“ X22 kommt im Text nicht vor. |
| P008 | GP3 bandabhängig | **behoben** | R06a (Belegseite) nennt die Bänder: ohne Steuern 2019 4 % darunter, 2026 6 % darüber, 20–70 GWh gewachsen von 7 auf 9 %, gegen Frankreich von 26 auf 50 %. Story GP3: „hängt am Verbrauchsband und an den Steuern“. |
| P009 | NEP „senkt“ | **behoben** | N09 und GP11: „zu heutigen Preisen … 440 statt 323“, der Entwurf mit weniger Offshore-Anbindungen und Freileitung, „nicht bestätigt“. X20 kommt im Text nicht vor. Den Erdkabel-Halbsatz hat die Freigabe begründet weggelassen. |
| P010 | Nutzenseite fehlt | **teilweise** | Belegseite K04 und KK: ISE 2021 mit UBA-Sätzen 340 bis 1.300 Mrd. €, Ariadne „deutlich“. In der Story stehen nur qualitative Sätze: V07 „ausdrücklich ohne Umweltkosten“, O08 „keine der Mehrkosten-Zahlen enthält vermiedene Klimaschäden“, KK „Einzelne Kostenstudien rechnen vermiedene Schäden selbst gegen“. Die Zahl steht in der Story nicht; Option (2) der Synthese ist nur auf der Belegseite umgesetzt. |
| P011 | „109 Tage“ ohne Einschränkung | **teilweise** | Belegseite R09c vollständig: Deutschland allein, rund ein Drittel, C, Vorbehalt. In der Story steht die Zahl nur in der Korrekturen-Tabelle: „dazu 109 Tage für Deutschland allein, mit Einschränkungen (R09c)“, ohne Abzeichen und ohne „Drittel“ (M2). |
| P012 | DIHK-2.100 in der Kurzfassung ohne Vorbehalt | **behoben** | Die Kurzfassung entsteht aus claims. N03 trägt den Vorbehalt „Welche DIHK-Veröffentlichung R21 meint …“; Prüfung (e) ist ohne Befund. |
| P013 | Stellungnahme R21 fehlt | **offen** (Entscheidung des Menschen) | Story „Was Teil 1 nicht zeigt“ und Belegseite L10: „Eine Anfrage an R21 ist entworfen und bis zum Abschluss der Reihe zurückgestellt“, `offene_entscheidungen` mit Entscheidung vom 23.11.2026. Für einen Entwurf ist das tragbar. Vor der Veröffentlichung eines Vorwurfs an R21 bleibt es ein Hindernis. |
| P014 | O07 falsch herum | **behoben** | O07: „BIP 2020 von 3.806 Milliarden Euro, Eurostat nennt 3.477,67 Milliarden; … rund 9 Prozent zu niedrig“. Der Satz kommt aus dem Datensatz. |
| P015 | KfW 2021 ohne Beschriftung (390 px) | **behoben** | Vermessung bei 390 und 1280 px: 0 SVG-Texte außerhalb der viewBox, Foto 5.2 angesehen. |
| P016 | „20456 ungünstig“ | **behoben** | 5.1 zeigt die Jahre als Liste untereinander (2040, 2047, 2056, R21 2042), Foto angesehen, 0 Überlappungen. |
| P017 | Waage abgeschnitten (390 px) | **behoben** | 2.4 und 5.1: Waage und Beschriftungen ganz in der viewBox, Fotos angesehen. |
| P018 | Sticky-Grafik verdeckt Karten | **behoben** | Bei 390 px gibt es kein sticky- oder fixed-Element unter Panel, Slot und Grafik, und keine Schrittkarte überlappt ihre Grafik (alle 18 Schritte gescrollt und gemessen). Sticky bleibt nur am Desktop (`.panel`). |
| P019 | „A“ für korrekt zitierte Zahl | **behoben** | Zwei Abzeichen je Zahl, keine Zahl auf A. R21-Zahlen tragen „Zitat geprüft · Wert: Behauptung“ (13,8, 2.100, 850). Das Skript prüft Abzeichen gegen den Datensatz: Story ohne Befund. |
| P020 | Unscharfe Bezeichnung allein R21 angelastet | **behoben** | F11 in Akt 2: „Die unscharfe Bezeichnung beginnt schon in der Kurzinformation … R21 übernimmt das ungeprüft“. |

Bilanz: 17 behoben, 2 teilweise (P010, P011), 1 offen durch Entscheidung (P013).

## Was gegenüber der ersten Fassung besser ist

- Beide Seiten setzen jeden Satz mit Tatsachengehalt aus dem Datensatz zusammen. Die erste Fassung hatte Sätze von Hand im HTML, zum Beispiel P014 und den Klimakasten-Halbsatz. Jetzt lässt sich das maschinell nachweisen: (a) und (a2) laufen auf beiden Seiten ohne Befund, und die Gegenprobe zeigt, dass sie einen eingeschmuggelten Satz finden.
- Die zwei Abzeichen ersetzen die irreführenden „A · gelesen“-Plaketten. Behauptungen von R21 tragen jetzt „Wert: Behauptung“, und eigene Rechnungen und Setzungen sind als solche markiert.
- Die Story zeigt jede Zahl nach einer einzigen Formatregel. Dabei bleiben die gespeicherten Nachkommastellen erhalten, und bei Rückgängen steht der Betrag ohne Vorzeichen.
- Verworfenes und Verbotenes steht nur noch in den Quarantäne-Listen. Jede nicht prüfbare Aussage trägt ihren Vorbehalt im selben Absatz.
- Alle 13 Gegenpositionen stehen in der Story als Kurzfassung, und jeder Sprung landet sichtbar und aufgeklappt auf der Langfassung, auch bei 390 px mit zugeklappten Abschnitten.
- Mobil gibt es kein Sticky-Overlay mehr, keinen Text außerhalb der viewBox und keine überlappenden Beschriftungen.
- Es gibt keine fremden Abrufe, keine Konsolenfehler und keine leeren Platzhalter.

## Was weiterhin fehlt

- Die Belegseite braucht die gemeinsame Formatfunktion (M3). Dann besteht sie (d), bis auf die Freitext-Zahlen.
- Freitext-Felder mit Zahlen (`korrekturen_eigene.neu`, `studien.bip_studie_text`) laufen weder durch die Ziffernprüfung des Builds noch bekommen sie Abzeichen (M2). Dazu kommt der falsche Zusatz „kein BIP-Anteil“ bei ISE 2021 (M1).
- Die Nutzenseite mit Zahl fehlt in der Story (P010). Der Mensch sollte entscheiden, ob K04 mit den 340 bis 1.300 Mrd. € in die Story gehört oder ob der Verweis im Klimakasten genügt.
- Die Stellungnahme von R21 fehlt (P013). Die Anfrage ist zurückgestellt; vor einer Veröffentlichung ist das wieder zu entscheiden.
- Entscheidung des Menschen: ob die Spalte „Vorher (falsch)“ als dritte Zone für verworfene und verbotene Wortlaute gilt (K5). Erst danach darf P05 („keine Zahl von Hand“) erscheinen, und auch dann nur, wenn das Prüfskript mit Exit 0 endet. Dafür `WPM` in den Datensatz aufnehmen oder P05 eingrenzen (K6).

Dateien: Prüfskript `energiewende/scripts/check_teil1_seiten.mjs`. Gerenderte Texte, Gegenprobe (`gegenprobe/`, `mut.py`) und Fotos liegen im Scratch-Ordner dieser Sitzung und werden nicht übernommen.
