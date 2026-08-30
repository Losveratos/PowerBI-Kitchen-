# Persona-Review 04 · Datenjournalist / DataViz-Experte

**Persona:** Datenjournalismus & Informationsdesign (Tufte/Few-Schule) — schreibt für ein
Publikum ohne Vorwissen; Prüffrage: Stehen die Grafiken für sich, und versteht ein Laie in
30 Sekunden, worum es geht?
**Datum:** 2026-08-30
**Prüfobjekt:** `/home/user/PowerBI-Kitchen-/eauto-klimabilanz.html`
**Geprüfter Stand:** Commit `3477e8b` **plus uncommittete Änderungen** (Stand 17:44 UTC —
inkl. neuem Tornado-Chart, 10.000 MC-Ziehungen, Flottenverbrauchs-Ziehung). Achtung: Die
Seite wurde während des Reviews parallel weiterbearbeitet; alle Befunde wurden nach
Stabilisierung der Datei am finalen Stand nachgemessen. Der Selbsttest-Badge zeigt auf
diesem Stand grün: „Modell verifiziert ✓ 11/11 Testvektoren + 46/46 Monte-Carlo-Kennzahlen".

**Methode:** Seite real gerendert (`python3 -m http.server 8123`, Playwright/Chromium aus
`/opt/pw-browsers`), Desktop **1280 px** und Mobil **390 px** (DPR 2). Alle 10 Charts einzeln
geschossen und angeschaut; alle 6 Presets, beide Kraftstoff-Chips, alle 6 Strommix-Chips,
Pfad-Toggle und Regler-Extreme (z. B. `batt_co2` = max) durchgeklickt; SVG-Schriftgrößen im
DOM gemessen (effektive CSS-Pixel nach viewBox-Skalierung, nicht geschätzt); Konsole auf
JS-Fehler geprüft (keine — einzig der Google-Fonts-Request scheitert in dieser Sandbox an
der Egress-Sperre, das ist umgebungsbedingt). Screenshots im Session-Scratchpad
(`d_*.png` Desktop, `m_*.png` Mobil).

---

## Kurzfazit

Inhaltlich ist das eine der ehrlichsten Seiten, die man zu diesem Reizthema finden wird:
Der Einstieg besteht den 30-Sekunden-Test (zwei Studien, zwei Zahlen, „dreh selbst"), jede
Zahl trägt Quelle + Konfidenzstufe, Unsicherheit wird als Band statt als Punkt gezeigt, und
die Limitationen sagen offen, was das Modell *nicht* kann — das ist Tufte'sche Datenintegrität,
wie man sie in Redaktionen selten sieht. Die Interaktionen (Presets → Regler → Live-Charts)
funktionieren intuitiv und sind didaktisch klug gebaut: Presets erzählen die Geschichte,
Regler erlauben den Zweifel.

Das Rendering hält da nicht überall mit: **Auf dem Smartphone (390 px) sind alle neun
SVG-Charts mit 4,4–5,7 px effektiver Schriftgröße schlicht unlesbar** — für eine Seite, die
mutmaßlich überwiegend mobil aus Social-Feeds geöffnet wird, ist das der eine Blocker. Dazu
kommt eine Farb-Doppelbelegung im neuen Tornado-Chart (Teal/Orange bedeutet auf der ganzen
Seite „E-Auto/Verbrenner", nur dort plötzlich „mehr/weniger Ersparnis"), eine
gewöhnungsbedürftige Vorzeichen-Achse im Sensitivitäts-Chart und ein Median/P50/P5/P95-
Vokabular, das nirgends für Laien übersetzt wird. Alles lösbar ohne neue Datenarbeit.

**Empfehlung: Mobile-Fix vor Veröffentlichung, Rest zeitnah nachziehen.**

**Befundzahlen: 2 KRITISCH · 8 MITTEL · 8 KLEIN (18 gesamt)**

---

## KRITISCH

### K1 · Mobile: Chart-Typografie 4,4–5,7 px — alle neun Charts unlesbar
**Fundstelle:** `eauto-klimabilanz.html` CSS `.chart-box svg{…min-width:300px}` (~Z. 112)
und die festen `viewBox`-Breiten `W = 720` in allen Chart-Funktionen; Screenshots
`m_chart_be.png`, `m_chart_sens.png`, `m_chart_tornado.png`.

**Ist (gemessen bei 390 px Viewport):** Die SVGs rendern mit 300–304 px Breite bei
viewBox-Breite 720 → Skalierungsfaktor 0,42. Effektive Schriftgrößen:

| Chart | min | max |
|---|---|---|
| chart-reg | 5,3 px | 5,5 px |
| chart-be | 4,9 px | 5,3 px |
| chart-sens | 4,4 px | 5,1 px |
| chart-mc-fan | 4,6 px | 5,7 px |
| chart-scale | 4,4 px | 5,6 px |

Zum Vergleich: Als absolute Untergrenze für Chart-Labels gelten ~9–10 px; der Fließtext der
Seite liegt mobil bei 15,5 px. Achsen, Break-even-Beschriftung, Marker-Labels
(„Wind/PV (LCA)"), P5/P95-Werte — nichts davon ist auf einem echten Telefon entzifferbar.
Die Charts degradieren zu Deko, und genau die Zielgruppe ohne Vorwissen liest die Seite
mobil.

**Vorschlag (zwei Wege, kombinierbar):**
1. `min-width` der SVGs auf ~560–640 px anheben — `.chart-box` hat bereits
   `overflow-x:auto`, die Charts würden dann mit Faktor ≥ 0,78 (≥ 10 px Text) rendern und
   horizontal scrollen (das Muster nutzt die Hochrechnungs-Tabelle schon erfolgreich).
2. Besser zusätzlich: eine Mobile-Media-Query, die die SVG-Textgrößen hochsetzt
   (`@media (max-width:760px){ .chart-box svg text{font-size:…}}` funktioniert nicht bei
   Inline-`font-size`-Attributen — also entweder Schriftgrößen als CSS-Klassen setzen oder
   beim Rendern einen Skalierungsfaktor aus der Containerbreite einrechnen und die Charts
   bei `resize` neu zeichnen; die Render-Funktionen sind ohnehin alle parametrisiert).

### K2 · Tornado-Chart: Farb-Doppelbelegung widerspricht dem Farbsystem der Seite + Label-Kollisionen
**Fundstelle:** `chartTornado()` (`posC = CSSV('--c-bev'), negC = CSSV('--c-ice')`), Legende
„mehr Ersparnis / weniger Ersparnis"; Screenshots `d_chart_tornado.png`, `m_chart_tornado.png`.

**Ist:** Auf der gesamten Seite sind Teal = E-Auto und Orange = Verbrenner etabliert (Balken
in Kapitel 1, Linien im Break-even-Chart, Histogramme, Legenden). Im Tornado bedeuten
dieselben zwei Farben plötzlich „mehr Ersparnis" (Teal) und „weniger Ersparnis" (Orange).
Konkrete Fehllesart: Die Zeile **„Verbrenner-Verbrauch" hat einen langen Teal-Balken** — wer
das seitenweite Farbschema im Kopf hat (und das ist der Zweck eines Farbschemas), liest
„E-Auto-Effekt", gemeint ist „hoher Verbrenner-Verbrauch → mehr Ersparnis". Nach Few ist
das die klassische Ein-Encoding-zwei-Bedeutungen-Falle; die kleine Legende fängt das beim
Scannen nicht ein.

Dazu kollidieren die Extremwert-Labels zwischen den Zeilen: „+1,03 kg/l"
(Kraftstoff-Vorkette, unterhalb) und „30 kWh/100 km" (BEV-Verbrauch, oberhalb) stehen
horizontal überlappend direkt übereinander; bei „Strommix-Pfad DE" erscheint nur *ein*
Label („434→280 g/kWh") und man kann nicht erkennen, zu welchem Balkenende es gehört.

**Vorschlag:** Richtungsfarben von den Antriebsfarben entkoppeln — z. B. ein einzelner
Farbton in zwei Helligkeiten (dunkles/helles Grau-Blau) oder die Konvention
„grün = mehr Ersparnis / grau = weniger". Extremwert-Labels als rechtsbündige Spalte neben
dem Chart (wie die „Mt/a"-Spalte im Hochrechnungs-Chart) statt frei über/unter den Balken —
das beseitigt alle Kollisionen deterministisch.

---

## MITTEL

### M1 · Sensitivitäts-Chart: vorzeichen-invertierte y-Achse verwirrt genau die Laien, für die die Seite gebaut ist
**Fundstelle:** `chartSens()` — Tick-Beschriftung `${pct>0?'−':pct<0?'+':''}` (interne
+80 % Reduktion wird als „−80 %" angezeigt), Achsentitel nur als Anhängsel der x-Beschriftung
(„… — y-Achse: CO₂-Ersparnis des BEV").

**Ist:** Die y-Achse liest sich von oben nach unten „−100 % … −20 %, 0 %, +20 %, +40 %" —
numerisch aufsteigend nach *unten*, mit geflipptem Vorzeichen gegenüber dem internen Wert.
Das ist konsistent mit der Headline-Konvention („−41 %" = Ersparnis), aber ein Laie, der
Achsen von unten nach oben liest, sieht „oben ist minus". Dass die Erklärung der y-Achse
im x-Achsentitel versteckt ist, macht es nicht besser.

**Vorschlag:** Achse positiv als „CO₂-Ersparnis des E-Autos in %" beschriften (0–100 % nach
oben, Kurve fällt weiter nach rechts), den Bereich unter der Nulllinie schraffieren/tönen
und direkt beschriften „hier wäre das E-Auto schlechter". Die Marker (Wind/PV bis
Steinkohle) tragen die Geschichte dann allein — sie sind jetzt schon das Beste am Chart.

### M2 · Median vs. P50, P5/P95 — Terminologie gemischt und nie für Laien übersetzt
**Fundstelle:** Kacheln Kapitel 4 („Median [P5–P95]"), Tabellen-Header Kapitel 5
(„P50 [P5–P95]"), Histogramm-Marker („P5 16 / P50 38 / P95 71"), Bildunterschriften
(„Strich = Median").

**Ist:** Dieselbe Größe heißt mal „Median", mal „P50" — und was „P5–P95" bedeutet
(„in 90 % der Fälle liegt der Wert dazwischen"), wird nirgends in einem Satz erklärt.
Für ein Publikum ohne Vorwissen sind das drei unerklärte Fachwörter im Kernkapitel.

**Vorschlag:** Durchgängig „Median" schreiben (auch im Tabellen-Header), und beim ersten
Auftreten ein Klammersatz-Glossar: „Median = der mittlere Fall; die Spanne [P5–P95] heißt:
9 von 10 Ziehungen liegen dazwischen." Die Histogramm-Marker können „P50" behalten, wenn
die Bildunterschrift die Übersetzung liefert.

### M3 · Keine Tooltips/Hover auf den Charts — Details nur für den Durchschnittsfall
**Fundstelle:** alle SVG-Charts; DOM-Prüfung: 0 `<title>`-Elemente, keine Pointer-Handler.

**Ist:** Die Charts sind statisch generiertes Inline-SVG. Beim Break-even-Chart kann man
nicht ablesen, wie groß der Abstand bei z. B. 100.000 km ist; im MC-Histogramm nicht, wie
viele Ziehungen ein Balken enthält; im Tornado fehlen die exakten ±t-Werte der Balken.
Auf einer Seite, deren ganzes Argument „dreh selbst, prüf selbst" ist, ist das ein Bruch.

**Vorschlag:** Minimal-invasiv: SVG-`<title>`-Elemente je Balken/Punkt (native
Browser-Tooltips, ~10 Zeilen pro Chart, auch ein Screenreader-Gewinn). Schöner: eine
gemeinsame kleine Hover-Funktion mit Fadenkreuz + Wertlabel für die beiden Linien-Charts.
Mobile bleibt davon unberührt (dort zählt K1).

### M4 · Seitenlänge und fehlende Kapitel-Navigation
**Ist:** Desktop ~24.000 px, mobil ~40.000 px Seitenhöhe (≈ 47 Telefon-Bildschirme). Die
`<h2>` haben Anker-IDs (`#auspuff` … `#quellen`), aber es gibt kein sichtbares
Inhaltsverzeichnis und keine Sprungleiste — wer nur „das Modell" oder „die Hochrechnung"
sucht, muss scrollen. Verwandte Kitchen-Seiten (Strommix-Story) lösen das mit Akt-Navigation.

**Vorschlag:** Kompakte Kapitelleiste unter dem Hero (8 Chips: Anlass · Auspuff-Logik ·
Modell · Strommix · Monte Carlo · Hochrechnung · Einordnung · Quellen), mobil horizontal
scrollbar. Kostet 20 Zeilen, spart Tausende Pixel Frust.

### M5 · Kapitel 4 beginnt mit Methoden-Jargon statt mit dem Ergebnis
**Fundstelle:** Einleitungsabsatz Kapitel 4 („Dreiecksverteilungen: Modus = Mittelwert,
Grenzen = min/max der Regler …") und die Karte „Drei Korrelationen, damit die Kombinationen
konsistent sind" samt Tank-to-Wheel-Fußnote.

**Ist:** Bevor der Laie das erste Ergebnis sieht, muss er einen Absatz Simulations-Methodik
und eine dreipunktige Korrelations-Karte passieren. Das ist redlich — aber es ist
Methodenteil, kein Erzähltext. Ein Redakteur würde hier zuerst die Zahl zeigen
(„38 t Ersparnis im mittleren Fall, 9 von 10 Fällen zwischen 16 und 71 t") und die Methode
dahinter klappen.

**Vorschlag:** Die Korrelations-Karte und die Verteilungs-Details in ein
`<details>`-Element „Wie die Simulation zieht (Methodik)" falten; der Befund-Satz
(`#mc-finding`) kann nach oben vor die Charts.

### M6 · Fan-Chart: Median-Wertlabel klebt am Ende des P95-Bandes
**Fundstelle:** `chartMcFan()` — `s += <text x="${x(e.delta_t.p95)+10}" …>${fmt(e.delta_t.p50,0)} t`;
Screenshot `d_chart_mc_fan.png`.

**Ist:** Rechts neben jeder Zeile steht „38 t / 42 t / 30 t" — das ist der *Median*, steht
aber exakt am Ende des hellen P5–P95-Bandes (bei ~72/79/59 t). Wer Position statt Legende
liest — und das tun Laien —, ordnet die Zahl dem Bandende zu.

**Vorschlag:** Label direkt an den Median-Strich setzen (über die Zeile, wie im
Rucksack-Chart) oder als rechtsbündige Wertspalte mit Kopfzeile „Median" absetzen.

### M7 · Krumme Achsen-Ticks im Break-even-Chart
**Fundstelle:** `chartBreakEven()` — y-Ticks als `maxT*i/5` („0 · 10 · 21 · 31 · 42 · 52 t"),
x-Ticks als `totalKm*i/6` („0 · 31 · 63 · 94 · 125 · 156 · 188").

**Ist:** Die Ticks entstehen durch Teilung des Wertebereichs statt durch runde Schritte.
„31 · 63 · 94" liest sich wie ein Versehen und macht Kopfrechnen („wo liegen 100.000 km?")
unnötig schwer — bei jedem Regler-Zug ändern sich die krummen Werte erneut.

**Vorschlag:** Nice-Number-Ticks (1/2/5×10ⁿ-Raster, ~8 Zeilen Hilfsfunktion) für beide
Achsen; gleiche Funktion kann chart-sens und die MC-Charts mitversorgen.

### M8 · Kapitel 6: zwei Text-Wände im Einordnungs-Teil
**Fundstelle:** Note-Box „Was im Modell robust ist — und was kippt" (~10 Zeilen ein Absatz)
und der Transparenz-/Anlass-Block; ähnlich die neue Doppel-Begründung „Warum hier über
100 % stehen kann — zwei Gründe".

**Ist:** Inhaltlich stark (die Robust-vs-kippt-Passage ist das beste Argument der Seite!),
aber als monolithischer Absatz gesetzt. Auf mobil sind das drei Bildschirme Fließtext ohne
Anker fürs Auge.

**Vorschlag:** Die Robust-Box in drei Mini-Absätze mit Fettzeilen gliedern („Robust: …",
„Kippt erst, wenn: …", „Offen bleibt: …"). Kein Kürzen des Inhalts nötig — nur Gliederung.

---

## KLEIN

1. **Minus-Zeichen inkonsistent:** Slider-Wert „-0,5 t CO₂e" (Hyphen aus
   `toLocaleString`) und Tornado-Achse „-20" vs. typografisches „−" überall sonst
   (Kacheln, Hero, Ticks in chart-sens). Ein `fmt`-Wrapper, der `-` → `−` ersetzt, macht es
   de-DE-konsistent. (Ansonsten sind die Zahlenformate vorbildlich einheitlich de-DE:
   „12.500 km", „2.070 Mt", „14,9 %".)
2. **Gestapelte Balken: gerundete Teil-Labels summieren sich nicht zum Σ:**
   „6,5 + 4,5 + 13 − 0,5" ergibt 23,5, angeschrieben ist „Σ 23,1 t" (das 13er-Segment ist
   real 12,6). Entweder alle Segmente mit einer Nachkommastelle oder eine Fußnote
   „Segmente gerundet".
3. **Strommix-Chips ohne Einheit:** „DE 2024 · 363" — die Einheit g CO₂e/kWh steht erst im
   Slider darunter. Ein `title`-Attribut haben die Chips schon (Konfidenz), „363 g/kWh" im
   Chip-Text wäre selbsterklärend.
4. **MC-Histogramm: verirrtes „0"-Label** sitzt als Oval direkt auf dem oberen Ende der
   Null-Linie (`chartMcHist`, `y="${T+2}"`) und kollidiert fast mit „P5"-Label-Zeile.
5. **Rucksack-Histogramm: Verbrenner-Verteilung als 4-Balken-Spike.** Die gemeinsame
   x-Achse (richtig!) plus gemeinsame Bin-Breite lässt die enge ICE-Verteilung als Kamm
   erscheinen. Alternative: gleiche Achse, aber Dichte-Kurve statt Bins, oder Bin-Breite
   pro Reihe mit Hinweis.
6. **Live-Kopplung nicht überall erkennbar:** Das Kapitel-1-Chart und das
   Sensitivitäts-Chart hängen an den Reglern aus Kapitel 2 — die Bildunterschriften sagen
   es, aber erst nach dem Chart. Ein kleines „⟲ live"-Badge in der Chart-Ecke (wie ein
   Recording-Punkt) würde den Zusammenhang beim Scannen klären.
7. **Farbenblind-Check Zerlegungs-Chart:** Blau (#2a78d6, Ladestrom) und Violett (#8a7cd8,
   Batterie) liegen für Deuteranopie nah beieinander; da alle Segmente Wertlabels tragen,
   ist es verschmerzbar — ein Muster/Outline auf einem der beiden wäre robuster.
8. **Fail-Zustand des Selbsttest-Badge ist Entwickler-Sprache:** „…MC-Kennzahlen
   abweichend — Konsole prüfen" hilft einem Laien nicht (während des Reviews war der
   Zustand durch die Parallel-Bearbeitung kurz sichtbar). Vorschlag: „Interne Prüfung
   fehlgeschlagen — den Zahlen dieser Seite bitte nicht trauen, wir reparieren das" plus
   dezente Entwickler-Details im `title`.

---

## Was gut ist

- **Der 30-Sekunden-Test gelingt.** Hero: zwei Studien, zwei Zahlen, „beide können sauber
  sein — entscheidend sind die Annahmen", dann sofort der Anlass mit Datum und Quelle.
  Ein Laie weiß nach einem Bildschirm, worum es geht und was er hier tun kann.
- **Die Dramaturgie trägt:** Anlass → Auspuff-Logik (das Regulierungs-Paradox als erstes
  Chart!) → Modell zum Selberdrehen → stärkster Hebel isoliert → ehrliche Bandbreite →
  Hochrechnung → Einordnung → Limitationen → Quellen. Das ist ein sauberer
  journalistischer Spannungsbogen, kein Daten-Dump.
- **Presets als Erzählinstrument:** „≈ TUM" und „≈ ICCT" sind als *nachgestellte*
  Annahmen-Sets gekennzeichnet (Transparenz-Box!), und wer klickt, sieht −41,2 % bzw.
  −72,9 % — die Kernthese der Seite („beide Zahlen stimmen, die Annahmen entscheiden")
  ist damit in zwei Klicks selbst überprüfbar. Das Kohlestrom-Preset als Stresstest ist
  klug gewählt.
- **Interaktionen funktionieren durchweg intuitiv** (alle geprüft): Presets setzen Regler
  und beschreiben sich; jeder Regler-Zug schaltet sauber auf „Eigene Einstellung" um;
  Chips synchronisieren mit den Slidern; der Pfad-Toggle graut den Ende-Regler
  nachvollziehbar aus; die abgeleitete Lebensfahrleistung wird angezeigt.
- **Unsicherheits-Kommunikation auf hohem Niveau:** Konfidenz-Badges A/B/C an jedem
  Regler samt Quelle, P5–P95-Bänder statt Punktwerte, der Befundtext benennt sogar den
  Anteil der Ziehungen, in denen der Verbrenner vorn lag, und warum Extremkombinationen
  außerhalb des Ziehungsraums liegen.
- **Der Selbsttest-Badge ist eine großartige Idee:** Die Seite verifiziert ihren
  JS-Port beim Laden gegen die Python-Referenz und zeigt das an — mehr
  Reproduzierbarkeits-Ethos geht in einer statischen HTML-Seite kaum.
- **Direkte Beschriftung statt Legenden-Raterei** in den Balken-Charts, Nulllinien überall
  markiert, Größenachsen der Balken beginnen bei 0, die „über 100 %"-Falle der
  Hochrechnung wird proaktiv erklärt statt versteckt.
- **Zahlenformate:** durchgängig de-DE (Punkt-Tausender, Komma-Dezimal), Einheiten fast
  überall direkt an der Zahl.

## Wo ein Redakteur kürzen würde

In dieser Reihenfolge: (1) Korrelations-/Methodik-Karte in Kapitel 4 einklappen (M5),
(2) die beiden Notes in Kapitel 6 gliedern statt kürzen (M8), (3) das DE-Histogramm
(chart-mc-hist) ist als drittes Chart derselben Botschaft verzichtbar, wenn der Fan-Chart
die P-Marker bekommt — eine Grafik weniger, kein Informationsverlust, (4) die
Transparenz-Box und Limitation 8 sagen zweimal fast dasselbe über die fehlende TUM-Studie
— einmal reicht mit Verweis.
