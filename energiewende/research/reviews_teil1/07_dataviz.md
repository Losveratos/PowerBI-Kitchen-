Review Teil 1 · Rolle 07 · Dataviz-Experte

Gegenstand: `energiewende-1-story.html` (fünf Scroll-Grafiken mit je vier Szenen, also 20 Bilder) und `energiewende-1-belege.html` (ein Diagramm „Alle Studien nach den drei Größen“, dazu Tabellen).
Methode: lokaler Server (`python3 -m http.server`), Playwright/Chromium. Gerendert bei 1280 × 800 und 390 × 844 Pixeln, jeweils hell und dunkel, mit Gerätefaktor 2. Jede Szene habe ich in ihren Lesezustand gescrollt (Schrittkarte in der Bildmitte) und dann einzeln fotografiert. Gemessen wurden viewBox, gerenderte Größe, Skalierungsfaktor, effektive Schriftgröße, Textkästen außerhalb der viewBox, sich überlappende Textkästen, die Überdeckung der Schrittkarte durch die Grafik und Farbkontraste nach WCAG 2.1.
Stand: 22.11.2026.

Bildschirmfotos (Scratch-Ordner, nicht im Repo):
`/tmp/claude-0/-home-user-PowerBI-Kitchen-/1fbaed4c-7d52-5720-8332-772815f12ca6/scratchpad/r07/shots/`
- Story je Szene: `story_<1280|390>_<light|dark>_akt<N>_s<M>.png` (80 Dateien)
- Story Mobil, ganzer Bildschirm: `story_390_viewport_akt<N>_s<M>.png` (20 Dateien)
- Belegseite: `belege_<1280|390>_<light|dark>_chart.png`, `belege_<1280|390>_full.png`
- Messwerte: `.../scratchpad/r07/story_report.json`, `.../scratchpad/r07/belege_report.json`

Keine Konsolenfehler. Keine Anfragen an fremde Server, auf beiden Seiten, bei allen vier Ansichten.

## 1. Urteil in fünf Zeilen

Am Desktop sind die Grafiken handwerklich überdurchschnittlich. Die Achsen beginnen bei null, Spannen sind als Spannen gezeichnet, jede Zahl steht beschriftet am Balken, und „nicht gelesen“ hat eine eigene Optik (gestrichelt, grau).
Am Handy (390 px) zerfällt die Story: Beschriftungen fehlen, werden abgeschnitten oder überlagern sich, die Schrift schrumpft auf 9 px, und die Grafik verdeckt mehr als die Hälfte der Schrittkarte.
Der Farbcode, den die Seite selbst ausruft (Blau = was R21 sagt, Terrakotta = was wir nachgeschlagen haben), wird in mehreren Grafiken gebrochen. Auf der Belegseite gilt er umgekehrt: Dort ist Terrakotta R21.
Ich würde den Akt 4/Schritt 3 (Studien auf BIP-Basis) als Beispiel für ehrliche Vergleichsgrafik zitieren. Die Seite würde ich erst empfehlen, wenn die mobilen Fehler behoben sind.
Einen Angriff auf Datenmanipulation gibt es nicht. Angreifbar sind Lesbarkeit, Konsistenz und Barrierefreiheit.

## 2. Befunde

### Kritisch (vor Veröffentlichung beheben)

**K1 · Story, Akt 5, Schritt 3, mobil: ein Balken ohne Beschriftung.**
Bei 390 px hat die Zeile „KfW 2021 · beschlossene Politik · 1,6 %“ keinen Text. Der Balken mit Pfeil steht unbeschriftet zwischen „3,0 bis 3,5 % · KfW/Prognos 2026, netto“ und „1,5 % · KfW/Prognos 2026, Zuwachs“ (Foto `story_390_light_akt5_s3.png`). Die Messung zeigt den Text außerhalb der viewBox (x < 0).
Ursache: In `forest()` prüft der Inline-Zweig (`fits`), ob der Text neben den Balken passt. Den 40-px-Platz für den Pfeil (`r.open`) rechnet er dabei nicht ein. Der spätere Fallback setzt den Text deshalb rechtsbündig an `x(hi) - 5`, also links aus dem Bild.
Vorschlag: `fits` um `(r.open ? 40 : 0)` erweitern. Als zweite Absicherung bei jeder Szene prüfen, ob ein Text außerhalb der viewBox liegt, und den Bau dann mit Fehlermeldung abbrechen, wie es die Seite für leere Platzhalter schon tut.

**K2 · Story, Akt 5, Schritt 1, mobil: Jahreszahlen überdrucken sich.**
Auf der Zeitachse „Erster neuer Block am Netz“ stehen „2047“ und „2056 ungünstig“ übereinander und ergeben „20456 ungünstig“ (Foto `story_390_light_akt5_s1.png`). Gerade diese Zahl (Status „korrigiert“, alt 2038–2047) muss eindeutig lesbar sein.
Vorschlag: „ungünstig“ in eine zweite Zeile unter die Achse setzen oder die Beschriftung der Mitte über der Achse anbringen. Die drei Jahre sollten außerdem als kleine Legende stehen: „2040 früh · 2047 mittel · 2056 ungünstig“.

**K3 · Story, Akt 2, Schritt 4, mobil: Waage abgeschnitten.**
Beide Schalen ragen über den Bildrand. Die Beschriftungen lauten nur noch „…t Energiewende“ und „ohne Energiewen…“ (Foto `story_390_light_akt2_s4.png`, Messung: beide Texte außerhalb der viewBox). Ausgerechnet die Unterscheidung „mit / ohne“, um die der Akt kreist, ist am Handy nicht lesbar.
Ursache: `span = Math.min(w*0.42, 260)` plus 52 px Schalenradius ist breiter als die halbe Fläche.
Vorschlag: `span = Math.min(w/2 - 60, 260)`, Beschriftungen mit `text-anchor` „start“ bzw. „end“ am Rand ausrichten.

**K4 · Story, alle Akte, mobil: Die Grafik verdeckt die Erzählung.**
Unter 1020 px ist die Grafik `position:sticky` mit `z-index:6`, die Schrittkarten liegen mit `z-index:1` darunter. Gemessen nimmt die Grafik 502–540 px von 844 px Bildschirmhöhe ein. Für den Text bleiben rund 300 px.
Die Schrittkarten sind 345–643 px hoch (Akt 3/Schritt 3: 643 px, Akt 5/Schritt 2: 561 px). Keine einzige Karte ist vollständig sichtbar, während ihre Szene aktiv ist. Gemessene Überdeckung bei mittig gescrollter Karte: 342–402 px (`story_390_viewport_*.png`).
Ein Leser am Handy liest also stets entweder die Grafik oder den halben Text. Die Szene wechselt außerdem erst, wenn die Karte im Band 62–78 % der Höhe liegt (`rootMargin`). Das liegt bereits unterhalb der Grafik.
Vorschlag: mobil kein Sticky-Overlay. Stattdessen Grafik und Karte untereinander, je Schritt ein statisches Bild der Szene (die Szenen sind schon getrennte `g.sc-N`, man kann sie je Schritt klonen). Mindestens die Grafik auf höchstens 45svh begrenzen und die Karten kürzen.

### Mittel (schwächt die Seite deutlich)

**M1 · Story: Der eigene Farbcode wird gebrochen.**
Der Kopfkommentar und der Kasten „So lesen Sie die Zahlen“ sagen: Blau = Schlagzeile und Papier, Terrakotta = von uns nachgeschlagen oder gerechnet, Grau = nicht gelesen. In den Grafiken gilt das nicht durchgehend:
- **Akt 1/Schritt 4:** Terrakotta = „mit Fundstelle“, Blau = „nur Urheber genannt“. Beides sind Kategorien von R21-Zahlen.
- **Akt 4/Schritt 2:** Das große blaue Quadrat ist Fraunhofer ISE G1, nicht R21.
- **Akt 4/Schritt 3:** G1 und G2 sind dunkles Schiefergrau (`--ink-2` #334155), R21 ist Blau (#2E5E8E). Die beiden Töne haben untereinander nur 1,53 : 1 Kontrast und sind am Desktop leicht zu verwechseln. Die blassblauen Hintergrundbänder von G1/G2 nutzen `--said-soft`, die Farbe von R21.
- **Akt 4/Schritt 4 (Netze):** BET/EWI usw. sind Terrakotta, NEP 2025 und DIHK-System dunkel. Eine Legende fehlt, die Regel ist nicht erkennbar.

Vorschlag: Die Farbe trägt in der ganzen Story eine einzige Bedeutung. R21 = Blau. Studien = eine neutrale Familie, G1/G2 dunkel und G3 Terrakotta, wie in Akt 4/Schritt 3. Kategorien ohne R21-Bezug in Akt 1/Schritt 4 neutral abstufen, zum Beispiel Fundstelle dunkel, Urheber mittel, ohne Quelle hell gerahmt. Den Kopfkommentar entsprechend umschreiben. Jede Forest-Grafik bekommt eine Zeile Legende.

**M2 · Belegseite: R21 und G3 tragen dieselbe Farbe.**
Im Diagramm „Alle Studien nach den drei Größen“ ist R21 `--r21` #C25A2D und G3 (Mehrkosten) `--g3` #A8481E. Der Kontrast untereinander beträgt 1,33 : 1 hell und 1,25 : 1 dunkel, also praktisch eine Farbe.
Die Grafik verknüpft damit optisch die R21-Zahl mit den Mehrkosten. Genau diese Verwechslung will Teil 1 auflösen. Gleichzeitig gilt Terrakotta in der Story als „unser Befund“ und Blau als R21: Wer von der Story auf die Belegseite wechselt, findet die Farben vertauscht.
Vorschlag: Die Belegseite übernimmt die Story-Palette (R21 Blau `--said`, G3 Terrakotta, G1/G2 neutral), oder beide Seiten bekommen eine gemeinsame Palette.

**M3 · Story, mobil: Schrift wird auf 9 px verkleinert.**
Wenn eine Szene höher ist als `calc(64svh - 70px)`, skaliert `preserveAspectRatio meet` die ganze Grafik herunter. Gemessene effektive Mindestschrift: Akt 4/Schritt 3 9,4 px (Faktor 0,78), Akt 5/Schritt 3 9,1 px, Akt 5/Schritt 4 9,0 px, Akt 5/Schritt 2 10,9 px, Akt 3/Schritt 1 10,7 px. Die Grafik ist dann zudem schmaler als der Bildschirm (Foto `story_390_light_akt5_s4.png`, breiter Rand links).
Die Schriftgröße springt dadurch von Schritt zu Schritt (12 → 9 → 12 px). Gleiches erscheint verschieden groß.
Vorschlag: mobil nicht herunterskalieren, sondern die Szene scrollen lassen oder kürzen (weniger Zeilen, Gruppenköpfe weglassen). Untergrenze 12 px.

**M4 · Story, Akt 4, Schritt 1, mobil: Matrix-Text überlappt.**
„Brutto-Gesamtkosten“ läuft in die G2-Spalte, „Investitione…“ ist abgeschnitten. Die Zeilenköpfe „Ersatz, der ohnehin anfiele“ und „eingesparte Energie abgezogen“ werden in der dritten Zeile von der Rasterlinie durchgestrichen (Foto `story_390_light_akt4_s1.png`).
Ursache: Die Kopfzeilen werden schmal nicht umgebrochen, die Zeilenhöhe ist fest (`rh = 50`), und `para()` liefert eine Höhe, die nicht verwendet wird.
Vorschlag: Zeilenhöhe = max(Höhe der umgebrochenen Texte) + Rand; Kopfzeilen mit `para()` umbrechen.

**M5 · Story, Akt 5, Schritt 4, mobil: Einleitung überlappt die Kacheln.**
„Einschränkungen je Punkt in den Kästen unter der Grafik“ bricht in zwei Zeilen um. Die zweite Zeile liegt unter dem Rahmen der ersten Kachelreihe, weil die Kacheln fest bei `P + 24` beginnen (Foto `story_390_light_akt5_s4.png`).
Vorschlag: Kacheln bei `P + 12 + para(...)` beginnen lassen.

**M6 · Story, Akt 5, Schritt 3: Die Pfeile sehen nach Daten aus.**
„Darum zeigen die Pfeile nach rechts: Die gelesenen Mehrkosten sind eher eine untere Linie.“ Die Pfeile haben eine feste Länge von 30 px. Auf einer metrischen Achse liest man Länge aber als Betrag:
- Desktop: 30 px ≈ 0,8 Prozentpunkte
- Handy: 30 px ≈ 1,9 Prozentpunkte

Derselbe Vorbehalt sieht also je nach Bildschirm verschieden groß aus und für alle Studien gleich groß, obwohl die Gründe (Beharrung +16 bis +235 %, Zinsen, Referenz) die Studien sehr unterschiedlich treffen. Beim Ariadne-Balken überdeckt der Pfeil zudem den Kreis „Beharrung 1,2 %“.
Vorschlag: Statt Pfeil ein kurzes „≥“-Zeichen oder ein ausblendender Verlauf ohne Längenbedeutung, mit dem Satz „Richtung, kein Betrag“. Wo es Zahlen gibt (Ariadne Beharrung), stattdessen den belegten Wert als zweite Marke zeigen, wie mit dem Kreis schon begonnen.

**M7 · Story, Akt 5, Schritte 2–3: Brutto-R21 auf einer Mehrkosten-Grafik.**
Der Grafiktitel lautet „Mehrkosten als Anteil am BIP 2024 pro Jahr“. Darunter steht R21 mit 11,4–15,7 % als einzige blaue Zeile neben den G3-Studien (0,4–3,5 %). Die Zeile ist ehrlich beschriftet („ohne Abgrenzung“). Das Bild suggeriert trotzdem den Vergleich Mehrkosten gegen Mehrkosten, mit Faktor 5–30.
Die faire Gegenüberstellung steht bereits in Akt 4/Schritt 3: R21 neben G1/G2 bei 4,4–12,3 %. Ein R21-Verteidiger wird Akt 5 als Strohmann-Bild bezeichnen (siehe Rolle 08).
Vorschlag: In Akt 5 das Brutto-Band der Studien (4,4–12,3 %) als graues Hintergrundband „Brutto-Studien zum Vergleich“ ergänzen. Oder die R21-Zeile weglassen und auf Akt 4 verweisen.

**M8 · Story, Akt 4, Schritt 3: Unerklärte Bänder, Punkt und Spanne gleich gezeichnet.**
- Die getönten Hintergrundbänder je Gruppe (`brutto_anteil_bip_pa`, `mehrinvestitionen_…`, `mehrkosten_…`) sind nicht erklärt. Die Bildunterschrift nennt nur „Balken = Spanne · Strich = Mittelwert“. Das G1-Band reicht bis 12,3 %, obwohl kein G1-Wert darüber liegt (der Wert stammt von Agora G2), weil G1 und G2 dasselbe Band teilen.
- Einzelwerte werden als 6-px-Rechteck gezeichnet, schmale Spannen (Ariadne 2,6–3,0, DIHK 4,4–4,9) ebenfalls als kurzes Rechteck. Beides ist nicht zu unterscheiden. Die Belegseite nutzt dafür Rauten.
- „Strich = Mittelwert“: In den Daten heißt der Wert `mid` und ist bei ISE 2024 das Szenario „Technologieoffen“, kein Mittelwert (Abgrenzung in `teil1_data.json`: „mid Technologieoffen, min Effizienz, max Beharrung/Robust“).

Vorschlag: Rauten für Einzelwerte wie auf der Belegseite. Eine Legendenzeile „Band = Spanne der Gruppe laut Freigabe“. „Mittelwert“ durch „mittleres Szenario“ ersetzen.

**M9 · Story, Akt 4, Schritt 2: Die Quadrate zeigen etwas anderes als der Text.**
Die Flächen sind korrekt maßstäblich nachgemessen: Seitenverhältnis 0,397 → Fläche 0,158 = 1,35/8,6; 0,358 → 0,128 = 1,1/8,6. Neben dem Bild stehen aber „Szenarien 28 bis 85 Mrd. €“. Die beiden kleinen Quadrate (1,1 und 1,35 Bio. €) sind nicht die Szenarienspanne. Sie sind der Mittelwert 54 Mrd. € mal 21 oder 25 Jahre (Abgrenzung: „über die nächsten 25 Jahre“). Das Szenario 85 Mrd. € ergäbe rund 1,8–2,1 Bio. € und ein deutlich größeres Quadrat.
Auch der Unterschied gestrichelt/gefüllt ist nicht erklärt. Dazu kommt: Flächen werden systematisch unterschätzt. Das kleine Quadrat wirkt wie „ein Viertel“, ist aber ein Achtel bis ein Sechstel.
Vorschlag: gestrichelt/gefüllt beschriften („21 Jahre“ / „25 Jahre“), die Szenarienspanne ehrlich als drittes Quadrat zeigen oder aus dem Satz nehmen. Oder statt Flächen zwei Balken auf einer Achse verwenden; der Größenunterschied bleibt trotzdem eindrucksvoll.

**M10 · Story, Akt 1, Schritt 4: Die Zählung zeigt eine Lücke im Datensatz.**
39 Kästchen, davon 4 + 6 + 27 = 37 kategorisiert. Zwei gestrichelte Kästchen heißen „im Datensatz nicht zugeordnet“. Das ist interner Jargon, und der Leser erfährt nicht, was diese zwei Zahlen sind. Die Freigabeliste (S07, Zeile 73) und `r21_haupttext_zahlen` enthalten dieselbe Lücke.
Außerdem: „4 · mit Fundstelle“ steht neben dem Satz „Fußnote 5 ist die einzige externe Fundstelle“. Was die drei anderen Fundstellen sind (intern? Faktenblätter?), sagt die Grafik nicht. Ein Leser wird das als Widerspruch lesen.
Vorschlag: Die zwei Zahlen in der Zählung klären (Dossier 01, Abschn. 3.1) oder ehrlich als „nicht eindeutig einzuordnen“ beschriften. Die Kategorie in „mit Fundstelle (davon 1 extern: Fn. 5)“ umbenennen.

**M11 · Barrierefreiheit: Die Grafiken haben keine Textalternative mit Daten.**
Jede Story-Grafik ist `<svg role="img">` mit einem `<title>`, der die vier Szenen nur nennt. Die Werte (Netzkosten, KKW-Spannen, Zeitachse, Waffel-Zählung) sind für Screenreader unsichtbar, weil `role="img"` alle Kindelemente verbirgt. Die Schrittkarten wiederholen nur einen Teil davon: Akt 4/Schritt 4 nennt NEP und BRH nicht, Akt 5/Schritt 2 nennt nicht alle sieben Studien.
Einen Tabellen-Zwilling gibt es nur für Akt 4 (`#studientabelle`). Bei den Szenenwechseln gibt es kein `aria-live`. Wer nur per Tastatur oder Vergrößerung arbeitet, bekommt die mobile Fassung mit K1–K4.
Die Belegseite ist besser (`<title>` + `<desc>`, `<title>` je Zeile), aber auch dort ist `<desc>` nur eine Beschreibung ohne Werte.
Vorschlag: je Akt ein `<details class="tbl">` mit den Werten jeder Szene (der Datensatz ist da, `renderTables()` zeigt, wie es geht). Den `<title>` je Szene aktualisieren.

**M12 · Kontrast von Grafikelementen (WCAG 1.4.11, 3 : 1).**
Gemessen:
- Der größte Block in Akt 1/Schritt 4, „27 · ohne Quelle“ (`--grid` #E4E2DA auf Weiß), hat 1,30 : 1, dunkel 1,24 : 1. Im Dunkelmodus sind die 27 Kästchen fast unsichtbar (Foto `story_1280_dark_akt1_s4.png`).
- Der BIP-Maßstabsbalken in Akt 1/Schritt 3 hat 1,30 : 1.
- „Nicht gelesen“-Flächen (`--unread-soft`) liegen bei 1,19 : 1 bzw. 1,13 : 1, nur der gestrichelte Rand trägt (3,77 : 1).
- Gitterlinien und Bänder liegen bei 1,24–1,30. Das ist für Hilfslinien vertretbar, für Datenträger nicht.
- Die Beschriftung „Fn.5“ auf Terrakotta hat 3,85 : 1 hell und 2,61 : 1 dunkel, bei 12 px fett. Das verfehlt 4,5 : 1.

Vorschlag: Kategorie „ohne Quelle“ mit Rand in `--axis`/`--muted` oder einem mittleren Grau (≥ 3 : 1). „Fn.5“ in Weiß (4,38 : 1) oder außerhalb des Kästchens setzen.

**M13 · Belegseite: Wert und Marke stehen weit auseinander, und die Wertespalte liegt im R21-Band.**
Die Werte stehen rechtsbündig am Ende der Plotfläche (x ≈ 16 %), die Marken der G3-Zeilen bei 0,4–3,5 %. Am Desktop liegen also bis zu 1.300 Bildpunkte zwischen „0,4–0,6 %“ und seinem Balken.
Die rechtsbündige Wertespalte liegt vollständig im getönten R21-Band (11,4–15,7 %). Jede Zahl der Liste sieht aus, als stünde sie im R21-Bereich (Foto `belege_1280_light_chart.png`).
Die Marke liegt außerdem 22 px unter dem Namen. Bei Rauten ist nicht sofort klar, ob sie zur Zeile darüber oder darunter gehören.
Vorschlag: Wert direkt hinter die Marke setzen (wie in der Story) oder die Wertespalte außerhalb der Plotfläche halten. Das R21-Band auf die Plotfläche beschränken.

**M14 · Belegseite: Zwei Zeiträume als „Spanne“ gezeichnet.**
„PwC (2024) · Weiter wie bisher · 26 Jahre: 11,7 %; 21 Jahre: 14,4 %“ erscheint als Spannen-Balken 11,7–14,4. Laut Legende ist das eine „Spanne“ der Studie, tatsächlich sind es zwei Rechenannahmen von uns (Zeitraum). Der Balken liegt fast vollständig im R21-Band und wirkt wie eine Bestätigung von R21 durch eine Studie, die wir nicht gelesen haben.
Vorschlag: zwei Rauten mit Beschriftung „21 J.“ / „26 J.“, Abzeichen „Setzung (M)“.

### Klein

- **k1 · BIP-Basis wechselt.** Akt 1 rechnet mit dem BIP 2025, Akt 3 mit 2018, Akt 4/5 mit 2024. Alle sind beschriftet, aber ein Satz „warum welches Jahr“ fehlt. Vorschlag: eine Zeile im Kasten „So lesen Sie die Zahlen“.
- **k2 · Untertitel passen nicht zu jeder Szene.** Die Grafik-Untertitel gelten für alle vier Szenen. Akt 4: „Anteile am BIP 2024 sind unsere Rechnung“ steht auch über den Quadraten (Bio. €) und den Netzen (Mrd. €). Akt 5: „Mehrkosten als Anteil am BIP“ steht auch über Kernkraft (Mrd. €, Jahre) und den Kacheln. Vorschlag: Untertitel je Szene.
- **k3 · Gemischte Einheiten auf einer Achse.** In Akt 4/Schritt 4 (Netze) mischen sich „2.100 Mrd. €“, „2,1 bis 2,3 Bio. €“ und „1,2 Bio. €“ auf einer Mrd.-Achse. Vorschlag: alles in Mrd. €. Zeiträume (10 Jahre, 2025–2049, bis 2045) zusätzlich als kleine Abzeichen an die Zeilen setzen, nicht nur in die Bezeichnungen.
- **k4 · Unterstreichung je Wort.** Die `mark`-Unterstreichung ist je Wort unterbrochen („Nachgerechnet␣mit␣dem…“), weil jedes Wort ein eigenes `tspan` ist. Rein kosmetisch.
- **k5 · Achsenticks am Handy.** In Akt 4/Schritt 3 und Akt 5/Schritt 2–3 stehen mobil nur die Ticks „0“ und „10“ auf einer Achse bis 17. `ticks(xmax, 3)` ergibt Schritte von 10. Vorschlag: mobil Schritt 5.
- **k6 · Gleiche Graustufen.** Akt 3/Schritt 3: Die beiden Teile des gestapelten Balkens (Investitionen / Energiekosten) haben dieselbe Füllung und unterscheiden sich nur durch `opacity:.7`, also kaum sichtbar. Vorschlag: zweiter Teil schraffiert.
- **k7 · Viel Leerraum am Desktop.** Die viewBox-Höhe ist mindestens H (574 px), viele Szenen brauchen nur 300–400 px. Am Desktop bleibt deshalb unten viel leere weiße Fläche (z. B. Akt 1/Schritt 3).
- **k8 · Inaktive Schrittkarten.** Sie haben `opacity:.45`, der Text fällt damit unter 4,5 : 1. Für nicht aktive Karten tolerierbar, aber wer per Tastatur scrollt, liest sie.
- **k9 · Symbol „○“ doppelt belegt.** Auf der Belegseite bedeutet „○“ hinter dem Namen „nicht gelesen“, ein hohler Kreis im Plot aber „Beharrung“ (Ariadne). „Beharrung“ fehlt in der Legende. Nicht gelesene Einzelwerte (gestrichelte Raute, z. B. Aurora 3,7 %) sind sehr schwach.
- **k10 · Gekürzter Studienname.** Belegseite mobil: „KfW-Fokus 350 (2021) · Prognos/Nextra/NKI · …“ ist abgeschnitten, und damit fehlt die Gruppenangabe G2.
- **k11 · Story und Belegseite gruppieren G3 verschieden.** Die Story trennt G3a/G3b, die Belegseite mischt sie unter „G3“ in einer Farbe, sortiert nur nach Wert. Außerdem zeigt die Belegseite ungelesene Studien (PwC, Aurora, BDI/BCG) im selben Diagramm, die Story nicht. Ein Leser vergleicht zwei verschiedene Bilder mit gleichem Titel.
- **k12 · Waage ohne Abschluss.** Die Waage aus Akt 2 („bleibt bis Akt 5 leer“) taucht in Akt 5 nicht wieder auf. Das erzählerische Versprechen wird nicht grafisch eingelöst.

## 3. Was fehlt aus Dataviz-Sicht

- Eine durchgehende Legende je Forest-Grafik (Farbe, Band, Strich, Pfeil, Punkt gegen Spanne).
- Tabellen-Zwillinge für Akt 1, 3, 5 und Akt 4/Schritt 4, als Textalternative und zum Nachrechnen.
- Ein automatischer Layouttest bei 390 px (Text außerhalb der viewBox, Überlappungen). Die Messung dafür liegt im Scratch-Ordner (`story.js`) und fand alle K-Befunde in Sekunden.
- Eine statische, nicht scrollgesteuerte Fassung (Druck, PDF, Reader-Modus). Mit Druck oder ohne IntersectionObserver ist nur Szene 0 bzw. keine Szene sichtbar (`.sc{opacity:0}`).

## 4. Was gut ist und bleiben soll

- Alle Werteachsen beginnen bei null. Keine abgeschnittene Achse, kein Doppelachsen-Trick.
- Direkte Beschriftung an den Marken statt Legendensuche (Story). Zahlen kommen aus dem Datensatz, nicht aus dem HTML.
- „Nicht gelesen“ ist doppelt kodiert (gestrichelt + Text). Farbe ist dort nie alleiniger Träger, wie im Kopfkommentar versprochen.
- Akt 4/Schritt 3 ist eine ehrliche, gut lesbare Vergleichsgrafik: drei Größen getrennt, R21 abgesetzt.
- Akt 1/Schritt 3 („2,2-fach“, „3,0-fach“ mit Jahres-BIP-Einteilung) ist sauber und nachprüfbar.
- Die Quadrate in Akt 4/Schritt 2 sind exakt flächentreu (nachgemessen).
- Dunkelmodus mit eigener, durchdachter Palette. `prefers-reduced-motion` wird respektiert. Keine externen Ressourcen.

## 5. Der härteste Einwand

„Diese Seite predigt Abgrenzung und erklärt dem Leser, Farbe sei ‚nie der einzige Träger‘. Dann malt sie R21 auf der Belegseite in der Farbe der Mehrkosten und auf der Story-Seite in der Farbe, die dort für ‚nachgeschlagen‘ steht. Am Handy, wo die meisten Leser sie sehen werden, fehlt einem Balken die Zahl, die Kernkraft-Jahre verschmelzen zu ‚20456‘, und die Waage, um die sich der zweite Akt dreht, ist am Rand abgeschnitten. Wer anderen ungenaue Zahlen vorwirft, muss seine eigenen Grafiken auf dem kleinsten Bildschirm prüfen, auf dem sie erscheinen. Das ist hier sichtbar nicht geschehen.“
