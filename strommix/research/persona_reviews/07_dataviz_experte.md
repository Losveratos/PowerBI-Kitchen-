# Persona-Review 07 · Datenvisualisierungs-Expert:in

**Persona:** Datenvisualisierung / Informationsdesign — Tufte/Few/Cairo-Schule, Praxis im
Scrollytelling (NYT Upshot, ZEIT Online Datenteam, Pudding.cool).
**Datum:** 2026-08-19
**Prüfobjekt:** `/home/user/PowerBI-Kitchen-/strommix-story.html` (124 KB, Datenblob extern über
`strommix/data/story_data.json`), Stand v 0.1 (Entwurf)
**Vergleichsmaßstab:** `rhein-story.html` (Original-Scrollytelling) und
`strommix/docs/04_story_format_analyse.md`
**Bewertungsrahmen:** Skill `dataviz` (Form-Heuristik, Farbformel + Validator,
Mark-Specs, Anti-Pattern-Katalog) sowie eigene Handwerksprüfung

**Methode:** Seite real gerendert (`python3 -m http.server`, Playwright/Chromium
`/opt/pw-browsers/chromium`). Alle 20 Steps (5 Akte × 4 Schritte) plus Hero und Schlussteil
einzeln angescrollt und geschossen, in **1280 px** und **390 px** (DPR 2), zusätzlich
Kontrollmessungen bei 1920/1440/1200/1150/1100/1060/1024/800 px. Screenshots liegen in
`…/scratchpad/viz_d_NN_*.png` (Desktop), `viz_m_NN_*.png` (Mobil), `viz_zw_1024_a2s3.png`
und `viz_zw_800_a2s3.png` (Zwischenbreiten). Farbpalette maschinell geprüft
(`dataviz/scripts/validate_palette.js`), Schriftgrößen, Trefferflächen und
Label-Overlaps im DOM gemessen (nicht geschätzt).

---

## Gesamturteil

Handwerklich ist die Strommix-Story im **Kern ehrlicher als die meisten Energie-Grafiken, die
man in deutschen Medien sieht**: alle Größenachsen stehen auf Null, Unsicherheit wird als
Band und nicht als Punkt gezeigt, jeder Akt hat einen ausklappbaren Tabellen-Zwilling,
Konfidenzstufen und Kostenabgrenzungen werden benannt statt weggelassen — Akt 4
(Monte-Carlo mit Überlappungsfeld) ist ein Chart, das ich sofort veröffentlichen würde.
Das **Rendering** hält dieser inhaltlichen Sorgfalt aber nicht stand: die Chart-Typografie
liegt bei 10,1 px (1280 px), 7,5 px (390 px) und 7,0 px (1024 px) und ist damit auf allen
Geräten außer großen Desktops schlicht zu klein; zwischen 1020 und 1240 px legt sich der
HTML-Chart-Titel über die oberste Datenzeile; in Akt 3 kollidieren Annotationen mit
Datenmarken, und Akt 5/Schritt 1 kodiert Längen, die zwischen den Zeilen nicht vergleichbar
sind. Dazu trägt das Zwei-Farben-System vier verschiedene Bedeutungen gleichzeitig und
widerspricht sich in Akt 1/Schritt 4 sogar zwischen Text und Chart.
**Empfehlung: überarbeiten vor Veröffentlichung.** Die vier kritischen Befunde sind alle
Layout-/Encoding-Fragen und ohne neue Datenarbeit lösbar; die inhaltliche Substanz muss
dafür nicht angefasst werden. Mit Fix von Top-3 ist die Story publikationsreif, mit den
Mittel-Befunden erreicht sie das Niveau des Rhein-Originals.

**Befundzahlen: 4 KRITISCH · 10 MITTEL · 8 KLEIN (22 gesamt)**

---

## KRITISCH — Chart täuscht oder ist unlesbar

### K1 · Chart-Typografie ist auf fast allen Geräten zu klein
**Fundstelle:** `strommix-story.html:114` (`svg text{...font-size:13px}`), `:281`
(`@media (max-width:760px){ svg text{font-size:25px} svg text.sm{font-size:21px} }`),
`.fig{width:min(1100px,99vw)}` `:83`
**Screenshots:** `viz_m_08_a2s3_ds3.png`, `viz_zw_1024_a2s3.png`, `viz_d_07_a2s2_ds2.png`

**Ist (gemessen, nicht geschätzt — effektive CSS-Pixel nach viewBox-Skalierung):**

| Viewport | SVG-Breite | Skalierungsfaktor | Effektive Labelgröße (`text.sm`) | Anteil Chart an Viewporthöhe |
|---|---|---|---|---|
| 1920 px | 1400 px | 1,321 | **17,2 px** | 73 % |
| 1440 px | 984 px | 0,928 | **12,1 px** | 62 % |
| 1280 px | 824 px | 0,777 | **10,1 px** | 54 % |
| 1024 px | 568 px | 0,536 | **7,0 px** | 42 % |
| 768 px | 760 px | 0,717 | **9,3 px** | 42 % |
| 390 px | 378 px | 0,357 | **7,5 px** | 25 % |

Der CSS-Kommentar bei `:278` behauptet, der Mobil-Bump verhindere Schrift „unter 6 px" —
er landet bei 7,5 px. Das ist kein Grenzfall, das ist unter jeder Lesbarkeitsschwelle
(Untergrenze für Chart-Beschriftung: 11–12 px). Die Format-Analyse hat bei 1440×900
gemessen — genau der einzige Bereich, in dem es gerade noch funktioniert. Besonders bitter:
im Bereich **761–1019 px** greift der Mobil-Bump nicht mehr, das Desktop-Grid noch nicht,
und die Schrift fällt auf 7–9 px.

**Vorschlag:** Die Schriftgröße nicht mehr über feste viewBox-Einheiten steuern, sondern
den Skalierungsfaktor invertieren: SVG-Textgröße per CSS-Variable aus
`clamp()`/Container-Query so setzen, dass **effektiv nie unter 12 px** herauskommt
(`--svg-fs: calc(12px / var(--k))`, `k` aus der gemessenen SVG-Breite per
`ResizeObserver` einmalig gesetzt). Alternativ, deutlich einfacher: pro Akt zwei viewBox-
Varianten (breit 1060×600 für ≥1200 px, kompakt ~640×760 mit weniger Zeilen/kürzeren Labels
darunter). Ohne diesen Fix ist die Story auf Laptops und Telefonen — also für die Mehrheit
der Leser — nicht benutzbar.

---

### K2 · Chart-Titel überdeckt zwischen 1020 und 1240 px die oberste Datenzeile
**Fundstelle:** `strommix-story.html:85` (`.fig-title{position:absolute;top:22px;…}`),
Media Query für die statische Alternative erst bei `:285` (`max-width:760px`)
**Screenshot:** `viz_zw_1024_a2s3.png` (1024×768, Akt 2 / Schritt 4)

**Ist (gemessen, Abstand Titel-Unterkante → oberstes Chart-Label):**

| Viewport | Overlap |
|---|---|
| 1020 px | **+22 px** (Cluster-Zeile 1 komplett überdruckt) |
| 1060 px | +19 px |
| 1100 px | +15 px |
| 1150 px | +11 px |
| 1200 px | +6 px |
| 1280 px | −2 px (knapp frei) |
| 1366 px | −10 px |

Im Screenshot läuft der Untertitel „Asien/Golf · EU-Serie · westliches Erstprojekt" quer
durch die Cluster-Zeilen „Asien / Golf (Serienbau)" und „Westliches Erstprojekt (FOAK)" —
beide Textebenen sind an dieser Stelle unlesbar. Betroffen ist genau iPad-Landscape
(1024×768) und das schmale Laptop-Fenster, also zwei sehr reale Lesesituationen. Die
Ursache ist strukturell: Der Titelblock ist ein HTML-Overlay mit fester Pixelhöhe, der
Chart-Inhalt beginnt bei viewBox-y = 108 und schrumpft mit `k`; unterhalb `k ≈ 0,68` reicht
der Platz nicht mehr.

**Vorschlag:** Den `.fig-title`-Block **immer** als statisches Element über dem SVG
rendern (die Regel aus `:285` von `max-width:760px` auf „alle Breiten" ziehen und
`M.t` von 82 auf ~40 senken — dann gewinnen alle Charts zusätzlich 42 viewBox-Einheiten
Zeichenfläche, was gleichzeitig M7 entschärft). Zweitbeste Lösung: Overlay behalten, aber
`M.t` dynamisch aus der gemessenen Titelhöhe/`k` berechnen.

---

### K3 · Akt 3 — Annotationen kollidieren mit Datenmarken, und 15 Datenpunkte haben keine Identität
**Fundstelle:** `strommix-story.html:1600–1613` (Frankreich-Pfeil + Annotation),
`:1624–1626` (Fußnote „Abgrenzungen nicht einheitlich"), `:1586–1593` (C-Badge)
**Screenshots:** `viz_m_12_a3s3_ds3.png` (390 px), `viz_d_11_a3s2_ds2.png`,
`viz_d_12_a3s3_ds3.png` (1280 px)

**Ist:**
1. Auf 390 px läuft die Annotation **„Frankreichs Serienbau · real ×3,5"** mitten in den
   blauen Datenblock bei 2030 hinein — „×3,5" steht buchstäblich auf einer fremden
   Datenmarke. Der Leser kann nicht entscheiden, ob die Zahl zur Annotation oder zum Block
   gehört.
2. Die Fußnote **„Abgrenzungen nicht einheitlich — Bandbreite, keine Trendlinie"** — die
   wichtigste methodische Warnung des ganzen Akts — liegt auf 390 px über der
   Frankreich-Fläche und auf der Nulllinie.
3. Das Badge **„C · Abgrenzung unbekannt"** überschneidet den gestrichelten Annotationspfeil.
4. **Kein einziger Datenpunkt trägt eine Beschriftung.** Auf Desktop wie Mobil sind 15
   Marken (Hinkley, Vogtle, Flamanville, Sizewell, EPR2, Dukovany, Lubiatowo,
   GES-Annahme …) nur über Hover unterscheidbar. Es gibt **keine Legende**. Der Akt behauptet
   „Die westlichen Projekte liegen zwischen 13.500–17.264 €/kW" — welcher Punkt welches
   Projekt ist, bleibt offen.
5. Die halbtransparenten Bänder der US-Kohorte und Frankreichs liegen deckungsgleich
   übereinander, **in derselben Farbe, ohne Trennfuge** — man sieht ein Rechteck, wo zwei
   Serien liegen.

Zum Vergleich: Die Rhein-Story beschriftet ihre Monatsbalken direkt mit Wert **und**
p-Wert am Balken (`rhein_50.png`) und legt jeder Gegenprobe eine explizite Legende bei
(`rhein_75.png`, „erwartet, falls sich nichts geändert hätte" / „tatsächlich gezählt").

**Vorschlag:** (a) Direktbeschriftung der 4–6 erzählrelevanten Punkte (Hinkley, Flamanville,
Vogtle, GES-Annahme, CP0/CP1, N4) mit einem simplen Kollisions-Layout (y-Versatz, wenn zwei
Labels sich schneiden) — die restlichen bleiben unbeschriftet im Hintergrund. (b) Legende
für die drei Markentypen (Punkt = Einzelprojekt, helles Band = Spanne, dunkles Innenband =
Mittelband). (c) Annotationen aus dem Datenbereich in einen festen Randstreifen legen und
den Ankerpfeil dorthin führen. (d) Zwischen überlappenden Bändern eine 2 px
Surface-Fuge (`stroke:var(--surface)`), wie in den Mark-Specs.

---

### K4 · Akt 5 / Schritt 1 — jede Zeile hat ihren eigenen Maßstab, die Längen erzählen ein Muster, das nicht in den Daten steckt
**Fundstelle:** `strommix-story.html:1778` (`const maxV = Math.max(r.md, r.real) * 1.12;`
je Zeile), Hinweistext `:1801`
**Screenshots:** `viz_d_17_a5s0_ds0.png`, `viz_m_17_a5s0_ds0.png`

**Ist:** Sechs Dumbbell-Zeilen (Plan vs. Ist) für GW, GWh und TWh, jede mit einer eigenen
Skala `0 … max*1,12`. Zwei Folgen:
1. **Die Längen sind zwischen den Zeilen nicht vergleichbar** — die visuell längste Strecke
   (Batteriespeicher, +108 %) und die zweitlängste (Gaskraftwerke, +18 %) unterscheiden sich
   im Prozentwert um Faktor 6, in der Balkenlänge um Faktor ~2,7.
2. **Ein Skalierungsartefakt sieht wie ein Befund aus:** Weil jede Zeile auf `max*1,12`
   normiert wird, landet der jeweils größere der beiden Punkte in *jeder* Zeile bei ~89 % der
   Zeilenbreite. Im Mobil-Screenshot stehen deshalb alle roten Ist-Punkte fast exakt
   untereinander — als gäbe es eine gemeinsame Obergrenze. Die gibt es nicht.
3. Die Größe, die tatsächlich vergleichbar wäre — die Abweichung in Prozent — steht nur als
   **Text in der linken Spalte** und bekommt keinerlei visuelle Länge.

Der Hinweis „Jede Zeile mit eigenem Maßstab · Abweichung links" ist ehrlich, steht aber in
7,5 px muted-grau am unteren Rand. Ehrlichkeit im Kleingedruckten heilt eine irreführende
Kodierung nicht — das ist genau der Fall, den Cairo „truthful but not functional" nennt.

**Vorschlag:** Die Kodierung umdrehen. Ein zeilenweises **Abweichungs-Balkendiagramm in
Prozent** mit gemeinsamer Nullachse (divergierend: Ist über Plan nach rechts, darunter nach
links), Plan- und Ist-Absolutwert als Text am Zeilenende. Dann ist die Länge das, worum es
geht (+108 % ist sechsmal so lang wie +18 %), die Einheiten mischen sich nicht mehr, und der
Fußnotenhinweis wird überflüssig. Alternativ als Small Multiples mit sichtbarer
Einzelachse je Zeile.

---

## MITTEL — erschwert das Verständnis

### M1 · Text und Chart färben dieselben zwei Zahlen gegensätzlich
**Fundstelle:** `strommix-story.html:399–400` (`class="big pos"` auf 125 €/MWh,
`class="big neg"` auf 321 €/MWh), CSS `:103`
(`.pos{color:var(--blue-soft)} .neg{color:var(--red-soft)}`), Chart `:1314`
(`barScene("sc-3", …, accentIdx = 0)` → `scenario_order[0] = kostenminimum` = 125 wird **rot**)
**Screenshot:** `viz_d_04_a1s3_ds3.png`

**Ist:** Auf demselben Bildschirm steht links „**125 €/MWh** (blau) bis **321 €/MWh**
(rot)", rechts im Chart ist der 125er-Balken rot und der 321er blau. Der Leser hat keine
Chance, die Farbe als Bedeutungsträger zu lernen.
**Vorschlag:** `.pos`/`.neg` in diesem Absatz durch `.big` ohne Farbe ersetzen (oder die
Klassen so vergeben, dass sie der Chart-Logik „Kernkraft-Szenario = Terrakotta" folgen).

### M2 · Farbe ist überladen und kodiert stellenweise nur die Position noch einmal
**Fundstelle:** `:1459` (`const low = p.capex_eur_kw < 6000;`), `:1558`
(hartkodierte `cool`-Liste), `:1314`, `:1799`
**Screenshots:** `viz_d_07_a2s2_ds2.png`, `viz_d_12_a3s3_ds3.png`, `viz_d_17_a5s0_ds0.png`

**Ist:** Blau/Terrakotta bedeutet über die Story hinweg vier Dinge:
Kernkraft vs. Erneuerbare (Akt 1), Studienannahme vs. Nachrechnung (Akt 2 Zeilen 1–2),
**günstig vs. teuer** (Akt 2 Schritt 3/4 mit fester Schwelle 6.000 €/kW; Akt 3 mit einer
handgepflegten `cool`-Liste), Plan vs. Ist (Akt 5). In Akt 2/3 kodiert die Farbe damit
exakt dieselbe Information wie die x-Position — der einzige freie Kanal wird für etwas
verbrannt, das die Grafik schon zeigt (Anti-Pattern „value-ramp auf nominalen Kategorien").
Gleichzeitig bleibt die Variable, um die es im Text geht — die **Kostenabgrenzung**
(OCC / EPC / Gesamtprojekt / inkl. Finanzierung) — vollkommen unkodiert.
**Vorschlag:** In Akt 2/Schritt 3 und Akt 3 die Farbe auf die Abgrenzung umstellen (zwei
Töne reichen: „Overnight/EPC" vs. „Gesamtprojekt/inkl. Finanzierung", Rest neutral) oder
Farbe ganz weglassen und nur die GES-Referenzlinie akzentuieren. Und die Doppelbedeutung
in einer Legendenzeile pro Akt benennen.

### M3 · Akt 5 / Schritt 3+4 — das Unsicherheitsband verschwindet hinter dem Balken
**Fundstelle:** `:1873` (Band-Rect wird **vor** dem opaken Balken gezeichnet, `opacity:.16`)
**Screenshots:** `viz_d_19_a5s2_ds2.png`, `viz_d_20_a5s3_ds3.png`

**Ist:** Für „unser Modell" (162,8 €/MWh) ist die Spanne 107–290 als Rechteck hinterlegt.
Weil der Balken von 0 bis 162,8 opak darüberliegt, ist vom Band nur der Teil **oberhalb**
162,8 sichtbar. Optisch wirkt die Unsicherheit einseitig nach oben; die Zahl „107" schwebt
rechts unten ohne sichtbaren Bezug. Genau die Streuung, die die Story sonst vorbildlich
zeigt, wird hier halbiert.
**Vorschlag:** Balken durch **Punkt + Whisker** (wie in Akt 4) ersetzen, oder den Balken
auf 40 % Deckkraft nehmen und das Band mit sichtbaren Endkappen bei 107 und 290 zeichnen.

### M4 · Akt 4 hat keine Legende für seine Box-Whisker-Glyphe
**Fundstelle:** `:1678–1695` (`band()`), keine Legendenausgabe im Akt
**Screenshots:** `viz_d_15_a4s2_ds2.png`, `viz_m_15_a4s2_ds2.png`

**Ist:** Der beste Chart der Story trägt fünf Bedeutungsebenen — Raute
(deterministisch), Box (P25–P75), weiße Linie (Median), Whisker (P5–P95), graues Feld
(Überlappung) — und erklärt keine davon in der Grafik. In der Zeile „Ist 2025" stehen
„107" (Raute) und „108" (Median) nebeneinander, ohne dass erkennbar wäre, welche Zahl was
ist. Der Rhein-Original-Chart legt seinen Doppelmarken dagegen eine ausformulierte Legende bei.
**Vorschlag:** Eine einzeilige Glyphen-Legende unter dem Chart, aufgebaut aus denselben
Elementen (`◆ deterministisch · ▭ P25–P75 · | Median · ├─┤ P5–P95`). Kostet ~25 viewBox-
Einheiten und schließt die größte Verständnislücke.

### M5 · Akt 4 — x-Achse beginnt bei 80, ohne Bruchmarkierung; Whisker werden hart geklemmt
**Fundstelle:** `:1662` (`const xmin = 80, xmax = 360;`), `:1679`
(`Math.max(xmin, cfg.p5)`, `Math.min(xmax, cfg.p95)`)

**Ist:** Für einen Verteilungsvergleich ist ein abgeschnittener Bereich vertretbar — aber es
gibt keinen Hinweis darauf, und die Story argumentiert an anderer Stelle mit Faktoren
(„×2,6 zwischen 125 und 321"), die auf dieser Achse optisch zu ×3,5 werden. Zusätzlich
klemmt `band()` p5/p95 stillschweigend auf den sichtbaren Bereich: Ein Perzentil unterhalb
80 oder oberhalb 360 würde als **echter Endpunkt** gezeichnet, ohne Kennzeichnung. Bei den
aktuellen Daten (min 100,7 / max 331,2) beißt das nicht — es ist eine tickende Bombe für die
nächste Datenversion.
**Vorschlag:** Achsenbruch sichtbar machen (Zickzack-Marke oder Notiz „Achse ab 80 €/MWh")
und im Klemmfall eine Pfeilspitze statt einer Endkappe zeichnen.

### M6 · Tooltip ist die einzige Quelle für die Kostenabgrenzung — auf Touch und Tastatur unerreichbar
**Fundstelle:** `:1082–1086` (`hover()` bindet nur `mousemove`/`mouseleave`; kein
`touchstart`, kein `focus`, kein `tabindex`), Untertitel `:1518`
(„Investitionskosten je Kilowatt · **sortiert, Abgrenzung im Tooltip**")
**Messung:** Trefferfläche der Projektpunkte 9,3 px (Desktop) / **4,3 px** (390 px),
Zeilenabstand 20,2 px / **9,2 px** — gegenüber ~24 px Mindestgröße für Touch.

**Ist:** Der Untertitel schickt den Leser in eine Sackgasse: Auf dem Telefon gibt es keinen
Hover, und die Marken wären mit 4,3 px ohnehin nicht treffbar. Die Abgrenzung — der
methodische Kern des Akts — ist dort nur noch über die eingeklappte Datentabelle erreichbar
(die es immerhin gibt: fünf `details.tbl` für fünf Akte, das ist vorbildlich).
**Vorschlag:** `hover()` um `pointerdown` (Tap hält den Tooltip, Tap daneben schließt) und
`focus`/`blur` mit `tabindex="0"` erweitern; unsichtbare Trefferrechtecke über die
Zeilenhöhe legen. Und den Untertitel auf „Abgrenzung in der Datentabelle unten" ändern,
solange der Tooltip nicht touchfähig ist.

### M7 · Datentinte: das Chart nutzt einen Bruchteil der sticky-Fläche
**Messung:** Anteil der Chart-Höhe an der Viewporthöhe: 54 % (1280), 42 % (1024/768),
**25 %** (390). Innerhalb der viewBox zusätzlich große Leerräume.
**Screenshots:** `viz_d_03_a1s2_ds2.png` (vier Balken in der halben Fläche),
`viz_d_09_a3s0_ds0.png` (zwei Marken, ~95 % des Plots leer),
`viz_d_05_a2s0_ds0.png` (vier Zeilen über 500 px, Labelspalte 29 % der Breite)

**Ist:** Der sticky-Bereich ist `100svh` hoch; das Chart hängt mit 1060×600-Seitenverhältnis
mittig darin, oben und unten bleibt je ein Viertel Bildschirm schwarz. Auf 390 px belegt das
Chart nur ein Viertel der Höhe und der Balken zwischen Chart und Textkarte ist ~500 px leer.
Bei Akt 3/Schritt 1 ist zusätzlich der Plot selbst fast leer — das ist als Reveal-Dramaturgie
gedacht (die Achse bleibt über alle vier Schritte konstant, was **richtig** ist), wird aber
nirgends erklärt und liest sich als „Chart lädt noch".
**Vorschlag:** viewBox pro Akt auf das tatsächliche Layout zuschneiden (Akt 2/3/4/5 sind
Zeilen-Charts, die vertikal wachsen sollten statt in ein 16:9-Fenster gezwängt zu werden);
`M.t` nach Fix von K2 auf 40 senken; auf Mobil das Chart auf mindestens 45 svh bringen und
die Step-Höhe von `88svh` auf ~70 svh reduzieren. Bei Akt 3/Schritt 1 eine kleine
Achsen-Notiz ergänzen („Maßstab bleibt über alle vier Schritte gleich").

### M8 · Akt 5 / Schritt 2 — Achsentitel kollidiert mit Untertitel bzw. Legende
**Fundstelle:** `:1812` (`txt(g1, M.l-10, M.t+10, "Mrd. €", …)`)
**Screenshots:** `viz_d_18_a5s1_ds1.png` (Desktop: „Mrd. €" überdruckt „Mrd. € je Phase ·
Netzanteil ist eine Setzung (M)"), `viz_m_18_a5s1_ds1.png` (Mobil: „Mrd. €" klebt am
Legenden-Swatch)
**Vorschlag:** Achsentitel um ~20 viewBox-Einheiten nach unten (unter den Titelblock) oder
ersatzlos streichen — der Untertitel nennt die Einheit bereits.

### M9 · Akt 2 / Schritt 4 — Wertlabels kollidieren mit der Referenzlinie, ein Label landet an der falschen Stelle
**Fundstelle:** `:1493–1499` (Fallback-Zweig: Label springt bei Platzmangel nach `LX + 18`)
**Screenshots:** `viz_d_08_a2s3_ds3.png`, `viz_m_08_a2s3_ds3.png`

**Ist:** (a) Die gestrichelte Studienlinie bei 6.000 €/kW läuft mitten durch die Zahl
„1.870–4.950" (Cluster 1) und durch „5.208 C" (Paks II) — beide Zahlen sind an der
Schnittstelle nicht mehr eindeutig lesbar. (b) Das Label „13.500–17.264" des FOAK-Clusters
wird per Fallback ganz nach links neben die Zeilenbeschriftung geschoben und wirkt dort wie
ein Bestandteil des Labels, während das zugehörige Band ohne Zahl am rechten Rand liegt.
**Vorschlag:** Labels mit `paint-order:stroke` und 3 px Surface-Kontur setzen (dann darf die
Linie darunter durchlaufen); den Fallback so ändern, dass das Label **innerhalb** des Bandes
rechtsbündig landet statt am Zeilenanfang.

### M10 · Überlappende Flächen und Stapelsegmente ohne Trennfuge
**Fundstelle:** Akt 3 `:1571–1578` (Bänder ohne Surface-Ring), Akt 5 `:1819–1824`
(gestapelte Rechtecke stoßen direkt aneinander)
**Screenshots:** `viz_d_11_a3s2_ds2.png`, `viz_d_18_a5s1_ds1.png`
**Ist:** Zwei halbtransparente Bänder derselben Farbe verschmelzen zu einem Rechteck; die
Stapelsegmente in Akt 5 bilden eine durchgehende Fläche mit einer harten Farbkante statt einer
lesbaren Fuge.
**Vorschlag:** 2 px `stroke: var(--surface)` an Stapelsegmenten, 2 px Fuge zwischen
überlappenden Bändern (Mark-Specs des `dataviz`-Skills).

---

## KLEIN — Politur

- **S1 · Text trägt Serienfarben.** Zeilen- und Achsenbeschriftungen sind in `--blue-soft`
  bzw. `--red-soft` eingefärbt (`:1373`, `:1462`, `:1699`). Konvention: Text bleibt in
  Text-Tokens, die Farbe trägt die Marke daneben. Verstärkt zusätzlich M2.
- **S2 · Doppelte Einheitenangaben.** Akt 2: Untertitel „… · €/MWh" plus Achsentitel
  „€/MWh". Akt 5/Schritt 3+4: zwei Zeilen, die beide mit „€/MWh ·" beginnen, unterschiedlich
  eingerückt (`viz_d_19`, `viz_d_20`).
- **S3 · `aria-label` ist statisch.** Fünf Charts haben je eine gute Beschreibung
  (`:355`, `:429`, `:533`, `:619`, `:717`), aber sie ändert sich nicht mit `data-step` —
  Screenreader hören für vier verschiedene Chart-Zustände denselben Satz. `aria-live` auf
  den Titel/Untertitel legen wäre ein Zweizeiler.
- **S4 · Hero-Hintergrund ist echte Datenform als Dekor.** `buildHero()` (`:1929–1945`) zeichnet
  die Kernkraft-Capex-Zeitreihe ohne Achsen, mit `preserveAspectRatio="slice"` — je nach
  Viewport ein anderer Ausschnitt und eine andere Steigung derselben Daten. Als Textur
  wirkungsvoll, aber ein Leser, der die Kurve „liest", liest etwas Falsches. Entweder
  glätten/abstrahieren oder mit einer Mini-Bildunterschrift erden.
- **S5 · Der Schluss hat keine Grafik.** Nach Akt 5 folgen nur noch Prosa, Grenzen-Karten,
  Glossar und Quellen. Das Rhein-Original setzt an dieser Stelle den ruhigen
  „Rekord-Watch"-Epilog und eine grafische Gegenprobe. Ein einzelnes, sehr einfaches
  Abschlussbild (z. B. die vier MC-Mediane mit ihren Bändern als Ein-Zeilen-Zusammenfassung)
  würde die Kernbotschaft visuell verankern.
- **S6 · Zahlenwand in Akt 2.** 13 Zeilen mit Zeilenlabel + Wertlabel + Achsenticks +
  C-Marker; grenzwertig, aber vertretbar, weil sortiert. Sobald die Schrift nach K1 größer
  wird, sollte jedes zweite Wertlabel in den Tooltip/die Tabelle wandern.
- **S7 · Keine Orientierung in einer 29.000-px-Seite** (Desktop; 40.100 px auf 390 px).
  Der Rhein-Original verzichtet ebenfalls bewusst auf eine Fortschrittsleiste — bei fünf
  Akten mit je vier Schritten wäre eine dezente Akt-Marke am Rand hier aber hilfreicher als
  dort.
- **S8 · `console.log` im Auslieferungszustand** (`:1265` LCOE-Rekonstruktion, `:2146`
  Ready-Meldung). Für einen Entwurf mit Selbstprüfungscharakter legitim, vor Veröffentlichung
  hinter ein Debug-Flag.

---

## Was besser ist als im Rhein-Original

Damit die Kritik nicht den Blick verstellt — an vier Stellen **übertrifft** die Strommix-Story
den Maßstab:

1. **Unsicherheit als Erstbürger.** Akt 4 zeigt Verteilungen statt Punkte, benennt die
   Überlappung explizit als Feld und wechselt in Schritt 4 auf die Kostenüberschreitungs-
   Variante, während die deterministische Raute **stehen bleibt** — die Lücke zwischen
   „saubere Zahl" und „ehrlicher Bandbreite" wird zur Bildaussage. Das Rhein-Original
   arbeitet mit p-Werten im Text, aber nirgends so konsequent mit Verteilungsgrafik.
2. **Provenienz am Datenpunkt.** Konfidenzstufen (A/B/C) sind farbig **und** als Buchstabe
   kodiert, C-Punkte tragen zusätzlich ein gestricheltes Marken-Outline und ein sichtbares
   Badge — bewusst nicht nur im Tooltip (Kommentar `:1586`). 44 Quellen mit Zugriffsdatum
   und Popover-Zitaten, die per Tastatur bedienbar sind (`:1211`). Das ist Standard, den ich
   in Redaktionen selten sehe.
3. **Fünf Tabellen-Zwillinge für fünf Charts**, plus `aria-label` und `role="img"` an jedem
   SVG. Der Rhein-Original hat das Muster; die Strommix-Story zieht es lückenlos durch.
4. **Der Datenblob ist ausgelagert und die Bindung wird zur Laufzeit geprüft**
   (`assertBindings()`, `:2006–2035`) — verschiebt sich `story_data.json`, erscheint ein sichtbarer
   Warnkasten statt falsch zugeordneter Zahlen. Das ist Datenjournalismus-Handwerk auf einem
   Niveau, das die reine Grafikqualität aktuell übersteigt.

Zusätzlich sauber: **alle Größenachsen stehen auf Null** (Akt 1 alle vier Szenen, Akt 3, Akt 5
Schritt 2/3/4) — die einzige Ausnahme ist M5. Die Palette ist maschinell geprüft:
`#3987e5` ↔ `#e2694f` erreichen ΔE 22,3 (Protanopie) / 31,0 (Tritanopie) / 30,0
(Normalsicht) gegen den Surface `#191918` und bestehen alle sechs Checks des
`dataviz`-Validators. Gitter (1,26:1) und Achsen (1,54:1) sind korrekt zurückgenommen,
Beschriftungsfarben liegen bei 5,0–10,4:1. **Farbenblind-Tauglichkeit ist kein Problem
dieser Story — die Schriftgröße ist es.**

---

## Top-3-Must-Fix

1. **K1 · Chart-Typografie auf effektiv ≥ 12 px bringen** (aktuell 10,1 px @1280,
   7,5 px @390, 7,0 px @1024). Ohne diesen Fix sind alle anderen Verbesserungen auf Laptop
   und Telefon nicht wahrnehmbar. Weg: SVG-Schriftgröße gegen den gemessenen
   viewBox-Skalierungsfaktor kompensieren, nicht über feste Media-Query-Sprünge.
2. **K2 · `.fig-title` auf allen Breiten statisch über das SVG legen** und `M.t` von 82
   auf ~40 senken. Beseitigt die 22-px-Überdeckung im Bereich 1020–1240 px (iPad-Landscape!)
   und schenkt jedem Chart gleichzeitig 42 viewBox-Einheiten Zeichenfläche — der billigste
   Doppelgewinn im ganzen Befundkatalog.
3. **K4 · Akt 5 / Schritt 1 auf ein Abweichungs-Balkendiagramm in Prozent mit gemeinsamer
   Nullachse umbauen.** Das ist der einzige Chart der Story, dessen Kodierung ein Muster
   erzeugt, das nicht in den Daten steckt (alle Ist-Punkte landen bauartbedingt bei ~89 %
   der Zeilenbreite). Eine Story, die ihren ganzen Aufwand in Ehrlichkeit steckt, darf sich
   diesen einen Chart nicht leisten.

*Knapp dahinter, mit gleichem Aufwand zu erledigen: **M4** (Box-Whisker-Legende in Akt 4 —
25 viewBox-Einheiten für die größte Verständnislücke) und **M1** (`.pos`/`.neg` in
`:399–400` entfernen — ein Zweizeilen-Fix gegen einen offenen Farbwiderspruch).*
