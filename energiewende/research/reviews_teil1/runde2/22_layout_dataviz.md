Nachprüfung Teil 1 · Runde 2 · Rolle 22 · Layout- und Dataviz-Prüfer

Gegenstand: `energiewende-1-story.html` (18 Szenen in fünf Akten, davon 16 SVG- und 2 HTML-Grafiken) und `energiewende-1-belege.html` (12 Abschnitte, ein Studien-Diagramm), Stand des Commits a84d50f, gebaut aus `energiewende/data/teil1_data.json`.
Gelesen aus der ersten Runde: nur `07_dataviz.md`.
Methode: eigener lokaler Server (`python3 -m http.server`), Playwright/Chromium über Node, `chromium.launch()` ohne Optionen. Ansichten: 1280 × 800 und 390 × 844 Pixel, je hell und dunkel, Gerätefaktor 2. Jede Szene habe ich in ihren Lesezustand gescrollt (Schritt mittig), die Grafik einzeln fotografiert, die Fotos angesehen und vermessen. Gemessen: viewBox gegen Darstellungsgröße, Skalierungsfaktor, effektive Schriftgröße, Textkästen außerhalb der viewBox oder des Bildschirms, überlappende Textkästen, Text auf Datenmarken, Überdeckung der Schrittkarte, Kontraste nach WCAG 2.1. Zusätzlich: Desktop bei 1280 × 720, 1366 × 768 und 1024 × 700 sowie die Druckansicht.
Stand: 23.11.2026.

Fotos und Messwerte (Scratch-Ordner, nicht im Repo):
`/tmp/claude-0/-home-user-PowerBI-Kitchen-/1fbaed4c-7d52-5720-8332-772815f12ca6/scratchpad/r22/`
- Story je Szene: `shots/story_<1280|390>_<light|dark>_s<Akt>-<Schritt>.png` (72 Dateien), dazu `shots/story_<1280|390>_<light|dark>_s4-3_wachsend.png`
- Story ganzer Bildschirm: `shots/story_<1280|390>_viewport_s<Akt>-<Schritt>.png`, `shots/story_1024x700_viewport_s4-3.png`, `shots/story_1280x720_viewport_s4-3.png`, `shots/story_1366x768_viewport_s4-3.png`
- Story übrige Abschnitte: `shots/story_<vw>_<scheme>_<lesehilfe|r21-recht|gegenpositionen|korrekturen>.png`
- Belegseite je Abschnitt: `shots/belege_<1280|390>_<light|dark>_<abschnitt>.png` (48 Dateien), Diagramm: `shots/belege_<vw>_<scheme>_chart.png`, ganze Seite: `shots/belege_<vw>_full.png`
- Messwerte: `story_report.json`, `belege_report.json`; Skripte: `story.js`, `belege.js`, `lowvh.js`, `print.js`

Keine Konsolenfehler, keine Abrufe an fremde Hosts, keine Datenfehler-Meldung (`#loadnote` leer, `__storyErrors` leer), auf beiden Seiten in allen vier Ansichten.

## 1. Urteil in fünf Zeilen

Die Überarbeitung hat die vier kritischen Befunde der ersten Runde bei 390 und 1280 px behoben: kein Text außerhalb einer viewBox, keine überlappenden Beschriftungen, keine Schrift unter 12 px in Grafiken, keine verdeckte Schrittkarte am Handy.
Beide Seiten teilen jetzt einen Farbcode (`--c-r21` Blau, G1 bis G3b, `--c-eigen`), und R21 hat auf beiden Seiten dieselbe Farbe. Mehrinvestitionen und Mehrkosten stehen in jeder Grafik getrennt.
Neu und kritisch: Zwischen 1020 und 1279 px Breite (Tablet quer, kleine Laptops) ist die Grafik am Rand festgeheftet, aber höher als der Bildschirm. In Akt 4/Schritt 3 sind dann die Mehrkosten-Zeilen und R21 nie sichtbar. Und im Druck erscheint keine einzige Grafik.
In Akt 5/Schritt 2 steht R21s Brutto-Spanne als zwei blaue Linien quer durch das Mehrkosten-Bild. Das ist beschriftet und ehrlich gemeint, dominiert aber das Bild und staucht die Mehrkosten auf ein Achtel der Achse.
Mein Wort: **noch eine Runde nötig**. Sie ist kurz: Panel-Höhe, Druck, Akt 5/Schritt 2 und die Unterscheidung „nicht gelesen“ auf beiden Seiten.

## 2. Messwerte

### Story, je Szene (hell und dunkel identisch vermessen)

| Szene | 1280: Grafik oben–unten (px) | 1280: viewBox | 390: Höhe der Grafik | 390: viewBox | kleinste Schrift | außerhalb viewBox | Überlappung | Tabellen-Zwilling (Zeilen) |
|---|---|---|---|---|---|---|---|---|
| 1.1 Zitatkarten | 88–277 | 788 × 117 | 305 | 356 × 233 | 12 px | 0 | 0 | 1 |
| 1.2 Wortlaut | 56–231 | 788 × 103 | 294 | 356 × 202 | 12 | 0 | 0 | 1 |
| 1.3 Jahres-BIP | 56–409 | 788 × 281 | 370 | 356 × 298 | 12 | 0 | 0 | 3 |
| 1.4 Zählstreifen | 24–276 | 788 × 180 | 316 | 356 × 202 | 13 | 0 | 0 | 6 |
| 2.1 Textvergleich | 88–260 | 788 × 101 | 273 | 356 × 179 | 12 | 0 | 0 | 3 |
| 2.2 Suchfeld | 56–331 | 788 × 203 | 293 | 356 × 221 | 12 | 0 | 0 | 2 |
| 2.3 Schema | 56–307 | 788 × 179 | 289 | 356 × 197 | 12 | 0 | 0 | – (keine Zahl) |
| 2.4 Waage | 24–230 | 788 × 134 | 226 | 356 × 134 | 13 | 0 | 0 | – (keine Zahl) |
| 3.1 Quellenkette | 88–240 | 788 × 80 | 412 | 356 × 320 | 12 | 0 | 0 | – (keine Zahl) |
| 3.2 PwC gestapelt | 56–378 | 788 × 250 | 322 | 356 × 250 | 12 | 0 | 0 | 6 |
| 3.3 Gastbeitrag | 24–253 | 788 × 157 | 250 | 356 × 178 | 13 | 0 | 0 | 1 |
| 4.1 Größen (HTML) | 88–404 | – | 572 | – | 14 | – | – | – (keine Zahl) |
| 4.2 ISE zwei Größen | 56–423 | 788 × 295 | 385 | 356 × 313 | 12 | 0 | 0 | 4 |
| 4.3 Punktdiagramm | 56–759 | 788 × 594 | 987 | 356 × 878 | 12 | 0 | 0 | 14 |
| 4.4 Netze | 56–520 | 788 × 392 | 484 | 356 × 392 | 12 | 0 | 0 | 7 |
| 5.1 Waage + Kernkraft | 56–637 | 788 × 509 | 750 | 356 × 658 | 12 | 0 | 0 | 10 |
| 5.2 zwei Gruppen | 56–500 | 788 × 372 | 641 | 356 × 569 | 12 | 0 | 0 | **0** |
| 5.3 höher/niedriger (HTML) | 24–628 | – | 1213 | – | 11 (Abzeichen) | – | – | – |

- Skalierungsfaktor überall 1,00: viewBox-Breite = Darstellungsbreite, die Grafiken werden nie verkleinert.
- 390 px: Überdeckung der Schrittkarte durch die Grafik 0 px in allen 18 Szenen (Grafik steht im Fluss über der Karte, kein Sticky). Kein horizontales Scrollen der Seite (`scrollWidth − innerWidth = 0`).
- 1280 × 800: Jede Grafik passt in den Bildschirm (größte: 4.3, Unterkante 759 px), die richtige Szene ist jeweils aktiv.
- Text auf Datenmarken: nur die Abzeichen-Pillen in 3.2 und 5.1, die auf ihrem eigenen Rahmen stehen (beabsichtigt).

### Desktop bei geringerer Höhe oder Breite (Unterkante der Grafik / Bildschirmhöhe, px)

| Ansicht | 4.3 | 5.1 | 5.3 | 5.2 | 4.4 |
|---|---|---|---|---|---|
| 1280 × 720 | **753 / 720** | 631 | 646 | 494 | 514 |
| 1366 × 768 | 739 / 768 | 635 | 627 | 498 | 518 |
| 1024 × 700 | **1036 / 700** | **761 / 700** | **889 / 700** | 655 | 513 |

### Kontraste der bedeutungstragenden Farben gegen die Grafikfläche (WCAG 1.4.11, Soll ≥ 3 : 1)

| Element | hell | dunkel |
|---|---|---|
| R21 `--c-r21` | 7,64 | 7,60 |
| G1 | 8,27 | 8,03 |
| G2 | 4,09 | 4,97 |
| G3a (hohl, Rand) | 4,96 | 5,69 |
| G3b | 11,85 | 11,32 |
| eigene Rechnung `--c-eigen` | 6,12 | 7,65 |
| „nicht gelesen“, Rand `--unread` | 4,59 | 6,38 |
| „nicht gelesen“, Fläche `--unread-soft` | 1,17 | 1,13 (trägt nur der Rand) |
| Band „Spanne der Gruppe“ `--band-soft` | 1,19 | 1,15 |
| Strich „mittleres Szenario“ auf G3b-Balken (4.2) | **1,14** | **1,09** |
| Strich „mittlerer Ansatz“ auf `--c-eigen` (5.1) | **1,69** | **1,36** |

Untereinander: G1 gegen G2 2,02 / 1,61; G3a gegen G3b 2,39 / 1,99; G1 gegen G3b 1,43 / 1,41; R21 gegen G1 1,08 / 1,06 (getrennt durch Farbton und Streifen, nicht durch Helligkeit).
Belegseite: dieselben `--c-*`-Werte; gemessen auf `--bg-card` gleiche Größenordnung (R21 dunkel 7,62).

### Belegseite

- Diagramm: 17 Zeilen-SVGs, jede mit `aria-label` samt Werten; kleinste Schrift 12,0 px; keine Überlappung; kein Text außerhalb der Grafikfläche; Wertetabelle mit 16 Zeilen. Kein horizontales Scrollen bei 390 px.
- Tabellen: 8 Tabellen, keine mit `<caption>`, keine mit `th scope`.
- Gruppen im Diagramm: G1 (4 Zeilen, davon 2 PwC nicht gelesen), G2 (4), G3a (3), Zuwachs (1), G3b (3), R21 (1).

## 3. Befunde

### Kritisch

**K1 · Story, 1020 bis 1279 px Breite: Grafik höher als der Bildschirm, unterer Teil nie sichtbar.**
Ab 1020 px gilt das Desktop-Layout: Das Panel ist `position:sticky; height:100vh`, die Grafik beginnt bei 7vh. Bei 1024 px ist die Panelbreite unter 640 px, das Punktdiagramm schaltet in die gestapelte Form und wird 987 px hoch. Gemessen bei 1024 × 700: Unterkante 4.3 bei 1036 px, 5.1 bei 761 px, 5.3 bei 889 px. Im Foto `story_1024x700_viewport_s4-3.png` endet die Grafik bei „Zuwachs gegenüber heute“. Die Zeilen **G3b Mehrkosten** und **R21** sind, solange der Text dazu läuft, nicht zu sehen. Genau diese Zeilen trägt der Akt. Bei 1280 × 720 fehlt in 4.3 die Achse (Unterkante 753 px).
Vorschlag: Desktop-Layout erst ab einer Panelbreite, in der die breite Form passt, oder das Panel scrollbar machen (`overflow:auto`, `max-height:100vh`) und die Szene beim Wechsel oben ausrichten. Als Absicherung im Bau: Ist die Grafik höher als `innerHeight − 7vh`, wird für diese Szene das mobile Muster (Grafik im Fluss über der Karte) verwendet.

**K2 · Story, Druck: keine einzige Grafik.**
`@media print` blendet das Panel aus und zeigt `.mslot`. `buildAll()` leert am Desktop aber jeden `.mslot` (`other.innerHTML = ""`). Gemessen mit `emulateMedia({media:"print"})` bei 1280 px: 0 sichtbare Grafiken, 0 gefüllte `.mslot` (`print.js`). Wer die Seite druckt oder als PDF ablegt, bekommt den Text ohne ein Bild und ohne Hinweis darauf.
Vorschlag: Bei `beforeprint` alle Szenen in `.mslot` bauen (oder beide Slots füllen und per CSS umschalten), bei `afterprint` zurück.

### Mittel

**M1 · Akt 5/Schritt 2: R21s Brutto-Spanne quer durch das Mehrkosten-Bild.**
Die Frage des Auftrags „Steht R21s Brutto-Summe irgendwo in einem Mehrkosten-Bild?“ beantworte ich mit Ja, an dieser einen Stelle. Zwei blau gestrichelte Linien bei 11,4 und 15,7 % laufen über die volle Höhe, durch alle G3a-, Zuwachs- und G3b-Zeilen (Fotos `story_390_light_s5-2.png`, `story_1280_light_s5-2.png`). Die Legende sagt „R21: Brutto-Zahl, keine Mehrkosten“, das Brutto-Band „Brutto-Studien zum Vergleich: 4,4–12,3 %“ steht daneben. Das ist die faire Form, die die erste Runde vorgeschlagen hatte.
Zwei Folgen der Umsetzung schwächen sie aber:
- Die Achse reicht wegen R21 bis 20 %. Alle Werte, um die es geht (0,4 bis 3,5 %), liegen im linken Sechstel; Ariadne 0,4–0,6 % ist am Handy ein 4 px breiter Strich.
- Das schraffierte Brutto-Band (50 % Deckkraft) und die R21-Linien sind die stärksten Elemente im Bild. Am Handy liegen Gruppenköpfe, Studiennamen und Werte („3,4 %“, „0,9–2,9 %“) auf der Schraffur; die R21-Linie schneidet „ohne Abzug“, „Differenzkosten“ und „Mehrkosten nach Abzug“.

Vorschlag: Brutto-Band und R21 als eigene, abgesetzte Zeile „Zum Vergleich, andere Größe“ unter den Gruppen, mit Achsenbruch oder eigener Kurzachse; die Gruppenzeilen auf eine Achse bis 4 % setzen. Dann ist der Abstand sichtbar, ohne dass die Brutto-Zahl über den Mehrkosten liegt.

**M2 · Akt 5/Schritt 2: kein Tabellen-Zwilling, und die Textalternative verspricht einen.**
Der Baustein `zwei_gruppen` füllt keine `rows`; der Zwilling fehlt (0 Zeilen). Die `<desc>` jeder SVG lautet aber „Die Werte stehen in der Tabelle unter dem Text dieses Schritts.“ Für Screenreader sind die zehn Werte dieser Szene damit nicht erreichbar. Der Szenenwechsel wird nur am Desktop über `aria-live` angesagt.
Vorschlag: `twinStudien()` auch für `zwei_gruppen` verwenden, plus Zeilen für Brutto-Band und R21. Die `<desc>` nur setzen, wo es eine Tabelle gibt.

**M3 · „Spanne der Gruppe“ umfasst nicht die ganze Gruppe (Akt 4/Schritt 3 und Belegseite).**
In 4.3 liegt Ariadne (2,6–3,0 %, wachsend 1,8–2,8 %) in der Gruppe „G1 und G2 brutto“, aber links außerhalb des Bandes 4,4–12,3 % (wachsend 3,1–11,6 %). Laut Datensatz ist das gewollt: `spanne_brutto_fest` zählt Ariadne nicht mit, Aussage G02 sagt „Studien, die nur einen Teil zählen, ab 2,6 Prozent“. Die Grafik sagt das nicht. Die Legende heißt „Spanne der Gruppe“, und ein Gruppenmitglied steht sichtbar außerhalb.
Vorschlag: Ariadne-Zeile mit „zählt nur einen Teil, nicht im Band“ beschriften oder die Legende in „Band = Spanne der vollständigen Brutto-Studien“ ändern.

**M4 · „Nicht gelesen“ hat auf den beiden Seiten keine gemeinsame Form.**
- Story: Grau, gestrichelter Rand = nicht am Original gelesen (Lesehilfe, 1.1, 3.1, 3.2, 3.3). Dieselbe Form (grau, gestrichelte hohle Raute, Klasse `f-zuw`) trägt aber auch die gelesene KfW-Zuwachs-Zahl in 4.3 und 5.2. Ein Leser, der die Lesehilfe ernst nimmt, hält „Zuwachs 1,5 %“ für ungelesen.
- Belegseite: Die zwei PwC-Zeilen (Original nicht gelesen) stehen in der G1-Gruppe mit voller G1-Raute und G1-Schraffur, gleich wie Fraunhofer ISE. Nur die Unterzeile „Original nicht gelesen“ unterscheidet sie. Der Zuwachs ist dort `--c-zu`, ein Schiefergrau, nicht gestrichelt.

Vorschlag: Gestrichelter grauer Rand nur für „nicht gelesen“, auf beiden Seiten, auch im Belege-Diagramm für PwC. Zuwachs bekommt eine eigene, nicht gestrichelte Form (z. B. hohl mit durchgezogenem `--c-zu`-Rand), auf beiden Seiten gleich.

**M5 · Abzeichen: verschiedener Farbcode und verschiedener Umfang auf beiden Seiten.**
Dieselbe Zahl (98 % Solarmodule, Kachel GP1 bzw. Kasten GP1) trägt in der Story „Zitat geprüft · Wert: B“ (Beige), auf der Belegseite im Fließtext nur „Wert: B“ (Türkis); „Zitat geprüft“ steht dort erst im aufgeklappten „Zahlen und Herkunft“ (Fotos `crop_kacheln.png`, `crop_gp.png`). Auch die Wert-Farben unterscheiden sich durchgehend (`--w-b-bg` #F1E7D2 gegen `--wk-b-bg` #DDEEF0; eigene Rechnung Violett gegen Lila-Blau). Der Grafik-Farbcode ist angeglichen, der Abzeichen-Farbcode nicht.
Vorschlag: Eine Abzeichen-Palette und dieselbe Abzeichen-Regel im Fließtext beider Seiten.

**M6 · Umschalter „wachsendes BIP“ wechselt die Achse.**
Fest: Achse 0–20 %; wachsend: 0–15 % (Foto `story_1280_light_s4-3_wachsend.png`). Beim Umschalten bewegen sich die Marken teils wegen der Daten, teils wegen des Maßstabs; R21 7,5–14,8 % sieht fast so lang aus wie 11,4–15,7 %. Der Vergleich beider Rechnungen, den der Umschalter anbietet, wird so verzerrt.
Vorschlag: gleiche Achse für beide Modi (Maximum über beide Datenreihen).

### Klein

- **k1 · Gitterlinien durch Beschriftungen.** In 1.3, 3.2, 4.2, 4.4 und 5.1 laufen die Gitterlinien durch Zeilenbeschriftungen ohne Halo (z. B. „Kostenansätze westlicher Neubauprojekte“, „Energiekosten 9,4 Bio. €“). Vorschlag: Klasse `halo` auch in `hbars` und `gestapelte_balken`.
- **k2 · Strich für das mittlere Szenario kaum sichtbar.** 4.2 (G3b-Balken) 1,14 : 1 bzw. 1,09 : 1, 5.1 (eigene Rechnung) 1,69 bzw. 1,36. Erkennbar ist nur der Überstand von 4 px. Vorschlag: Strich in `--surface` mit dunklem Rand oder als Kerbe über und unter dem Balken.
- **k3 · G1-Farbe als neutrale Farbe.** Der BIP-Balken in 1.3 und die Netzstudien in 4.4 tragen `f-g1` (Brutto-Gesamtkosten). Vorschlag: eine neutrale Farbe (`--muted`) für alles, was keine der Größen ist.
- **k4 · Schraffur mit drei Bedeutungen.** Dasselbe graue Schrägmuster heißt in 1.4 „Verweis auf ein eigenes Factsheet“, in 4.4 „abgesetzt“ und in 5.2 „Brutto-Studien zum Vergleich“. „Abgesetzt“ erklärt nicht, warum (anderer Zeitraum, Investition und Betrieb).
- **k5 · Gemischte Einheiten in direkter Gegenüberstellung.** 1.3: „4.529,71 Mrd. €“ neben „10 Bio. €“ auf einer Mrd.-Achse; 5.1 Systempreis: „8,2 ct/kWh“ neben „82 €/MWh“ und „105 €/MWh“. Vorschlag: eine Einheit je Grafik.
- **k6 · Schwebender Spannenbalken neben Null-Balken.** 4.2: „gesamte Energieversorgung 8,6“ beginnt bei 0, „Summe der Jahreswerte 6,7–8,4“ schwebt; 5.1 ebenso (310/350 ab 0, 372–868 schwebend). Länge und Lage werden in einem Bild verschieden gelesen. Vorschlag: Spannen als Linie mit Endmarken, Einzelwerte als Balken, und eine Legendenzeile.
- **k7 · Legende in 5.2 passt nicht zu den Marken.** Sie zeigt eine volle G3b-Raute und einen G3b-Balken; die G3a-Marken (hohl, orange) und Zuwachs (gestrichelt) fehlen in der Legende.
- **k8 · Unbeschriftete Kreise „Angabe der Studie“ in der Story.** Die Kreise in 4.3 tragen keine Zahl. Die Erklärung, warum die Angabe der Studie abweicht (anderes BIP-Jahr, KfW 2021 „des damaligen BIP“), steht nur in der Tabelle. Auf der Belegseite sind die Kreise beschriftet. Die Belegseite zeichnet bei ISE 2021 keinen Kreis, die Story schon (1–3,5 %): Der Ausdruck in `studyVals` erkennt „1 bis 3,0–3,5 %“ nicht.
- **k9 · Interne Kürzel und Bauanweisungen als Untertitel.** 2.4: „noch leer; Akt 5 nimmt die Waage wieder auf (P120)“. 5.3: „Zeichen größer gleich und kleiner gleich ohne Längenbedeutung; keine Pfeillänge als Betrag“. 4.1: Titel „Drei Größen“, Untertitel „Vier Größen“. 2.1 mobil: „Links R21, rechts die Kurzinformation“, die Karten stehen aber untereinander. 2.2 und 3.3 wiederholen den Untertitel wörtlich in der Grafik.
- **k10 · Waage in Akt 5 bleibt leer.** Sie kehrt in 5.1 zurück, aber ohne Inhalt in den Schalen. Das Versprechen aus 2.4 wird gezeichnet, nicht eingelöst.
- **k11 · Abzeichen trennen Zahl und Einheit.** „rund 99 [Zitat geprüft] [Wert: B] Prozent gefallen“, auf beiden Seiten. Die Abzeichen in 5.3 haben 11 px. Vorschlag: Abzeichen hinter die Einheit.
- **k12 · Zuordnung in 5.3.** Der dritte „höher“-Kasten sagt selbst „verschiebt die Summe in verschiedene Richtungen“; der letzte „niedriger“-Kasten („Einzelne Studien rechnen die vermiedenen Schäden selbst gegen“) ist eine Einschränkung, kein Grund für niedriger. Die Satztrennung erzeugt einen Kasten, der mit „Und“ beginnt.
- **k13 · Belegseite: Achse nur oben.** Bei 17 Zeilen und rund 1.900 px Höhe ist die Achse beim Lesen der unteren Gruppen nicht mehr im Bild. Vorschlag: Achse je Gruppe wiederholen oder sticky.
- **k14 · Belegseite Messlatte, 390 px:** Die Zahl „15“ von „15 von 18“ liegt auf dem violetten Balken (dunkle Schrift auf `--c-eigen`, etwa 2,4 : 1).
- **k15 · Tabellen ohne `<caption>` und ohne `th scope`** (alle 8 Tabellen der Belegseite).
- **k16 · Band „Spanne der Gruppe“ im Dunkelmodus fast unsichtbar** (1,15 : 1). Als Hintergrund vertretbar; das Legendenkästchen ist dann aber kaum zu erkennen.

## 4. Antworten auf die Prüffragen des Auftrags

| Frage | Antwort |
|---|---|
| Text außerhalb von viewBox oder Bildschirm | Nein, in keiner Szene, bei 390 und 1280 px, hell und dunkel. Aber: 1020–1279 px, Grafik unten abgeschnitten (K1). |
| Überlappende Beschriftungen | Keine Text-auf-Text-Überlappung. Text auf Schraffur und R21-Linie in 5.2 (M1), Gitterlinien durch Beschriftungen (k1). |
| Schrift unter 12 px in Grafiken | Nein (Minimum 12,0 px, Faktor 1,00). Nur die HTML-Abzeichen haben 11 px. |
| Verdeckte Schrittkarten am Handy | Nein, 0 px Überdeckung in allen 18 Szenen. |
| Kontrast ≥ 3 : 1 | Alle Datenfarben ja (kleinste: G2 hell 4,09). Ausnahmen: Strich „mittleres Szenario“ (k2); Bänder und „nicht gelesen“-Flächen tragen nur über den Rand. |
| Gleicher Farbcode auf beiden Seiten | Grafikfarben ja (identische `--c-*`). Nicht gleich: Form für „nicht gelesen“ und „Zuwachs“ (M4), Abzeichen (M5), R21-Muster (Story Streifen bzw. Linie, Belege Kreuzschraffur, beide beschriftet). |
| Wertetabellen für Screenreader | Story: für 12 Szenen mit Zahlen; fehlt in 5.2 (M2). Belegseite: Wertetabelle und `aria-label` je Zeile. |
| Mehrinvestitionen und Mehrkosten getrennt | Ja, in 4.1, 4.2 (eigene Achse für Differenzkosten), 4.3, 5.2 und im Belege-Diagramm (getrennte Gruppen, Farben und Formen). |
| R21s Brutto-Summe in einem Mehrkosten-Bild | Ja, einmal: 5.2, als beschriftete Linie neben dem Brutto-Band (M1). In 4.3 und auf der Belegseite steht R21 als eigene Gruppe neben allen Größen. |
| Unsicherheit in beide Richtungen | Spannen werden als Spannen gezeichnet, Einzelwerte als Rauten, beide Seiten. 5.3 zeigt Gründe für höher und niedriger mit je vier Kästen, ohne Längenbedeutung. Die Beträge (Beharrung +16 bis +235 %) stehen nur im Text, nicht im Bild. Kein Pfeil mehr mit scheinbarer Länge. |
| Zwei BIP-Rechnungen und Angabe der Studie unterscheidbar und erklärt | Belegseite: ja, gleichzeitig (voll = fest, schraffiert = wachsend, Kreis = Studie), im Untertitel erklärt. Story: nur abwechselnd über den Umschalter, mit wechselnder Achse (M6); Kreise ohne Zahl (k8). Die Erklärung steht in G04 und im Zwilling. |

## 5. Was gegenüber der ersten Fassung besser ist

| Befund Runde 1 | Stand |
|---|---|
| K1 Balken ohne Beschriftung (5.3 alt) | behoben: keine Pfeile mehr, kein Text außerhalb der viewBox |
| K2 Jahreszahlen „20456“ | behoben: Jahre als Liste untereinander (5.1) |
| K3 Waage abgeschnitten | behoben: Schalen und Beschriftungen innerhalb, 390 px |
| K4 Grafik verdeckt die Erzählung | behoben unter 1020 px (Grafik im Fluss); neu K1 zwischen 1020 und 1279 px |
| M1 Farbcode in der Story gebrochen | weitgehend behoben: R21 überall Blau, Größen mit eigener Farbe; Rest k3, M4 |
| M2 Belege: R21 und G3 gleiche Farbe | behoben |
| M3 Schrift 9 px | behoben: keine Skalierung, Minimum 12 px |
| M4 Matrix-Text überlappt | behoben (HTML-Kästen); Titel/Untertitel widersprechen sich (k9) |
| M6 Pfeile sehen nach Daten aus | behoben (5.3 ohne Längenbedeutung) |
| M7 Brutto-R21 auf Mehrkosten-Grafik | teilweise: beschriftet und mit Brutto-Band, aber dominant und mit gestauchter Achse (M1) |
| M8 Bänder, Punkt gegen Spanne, „Mittelwert“ | behoben: Legende, Rauten, „mittleres Szenario“; neu M3 |
| M9 Quadrate | behoben: Balken, keine Hochrechnung der Differenzkosten |
| M10 Zählstreifen mit Lücke | behoben: fünf Kategorien, Summe 39, Kontrast ≥ 3 : 1 |
| M11 keine Textalternative | weitgehend behoben: Zwillinge, `<title>`/`<desc>`, `aria-live`; Rest M2 |
| M12 Kontraste | behoben für Datenträger; Rest k2 |
| M13 Belege: Wert fern der Marke | behoben: Wert direkt an der Marke |
| M14 PwC als Spanne | behoben: zwei Zeilen mit Zeitraum |
| k2 Untertitel je Szene | behoben (eigene Grafik je Schritt) |
| k3 Netze gemischte Einheiten | behoben (alles Mrd. €); Rest k5 an anderer Stelle |
| k5 Achsenticks am Handy | behoben (mindestens drei Marken) |
| k6 gleiche Graustufen im Stapel | behoben (voll gegen gepunktet, mit Legende) |
| k7 Leerraum am Desktop | behoben (Höhe aus Inhalt) |
| k10 gekürzter Studienname | behoben (Umbruch statt „…“) |
| k11 G3 verschieden gruppiert | behoben (G3a/G3b auf beiden Seiten getrennt); PwC nur auf der Belegseite bleibt |
| k12 Waage ohne Abschluss | teilweise (k10) |
| Druckfassung | nicht behoben, jetzt ganz ohne Grafik (K2) |

## 6. Was weiterhin fehlt

- Ein automatischer Layouttest im Repo für 390, 1024 und 1280 px (Text außerhalb, Überlappung, Grafikhöhe gegen Bildschirmhöhe, Druck). Die Skripte im Scratch-Ordner (`story.js`, `lowvh.js`, `print.js`) finden K1, K2 und M2 in unter einer Minute; Rolle 21 kann sie in ihr Prüfskript übernehmen.
- Eine gemeinsame Legende für Formen, die auf beiden Seiten gilt: voll, schraffiert, hohl, gestrichelt (= nicht gelesen), gepunktet (= eigene Rechnung), Band.
- Die Beträge der Gründe für „höher“ und „niedriger“ als Marke im Bild, wo sie belegt sind (Ariadne Beharrung), statt nur im Text.
