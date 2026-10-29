# Persona-Review 07 · Datenvisualisierungs-Expert:in — RUNDE 2

**Persona:** Datenvisualisierung / Informationsdesign — Tufte/Few/Cairo-Schule, Praxis im
Scrollytelling (NYT Upshot, ZEIT Online Datenteam, Pudding.cool).
**Datum:** 2026-08-19
**Prüfobjekte:** `strommix-story.html` v0.2 (161 KB, Daten aus `strommix/data/story_data.json`)
und `whitepaper-strommix.html` v0.11 (+ `whitepaper-strommix.js`, 244 KB)
**Bezug:** Runde-1-Gutachten `07_dataviz_experte.md` (4 KRITISCH · 10 MITTEL · 8 KLEIN)
**Bewertungsrahmen:** Skill `dataviz` (Form-Heuristik, Mark-Specs, Anti-Pattern-Katalog)

**Methode:** Beide Seiten real gerendert (`python3 -m http.server`, Playwright/Chromium
`/opt/pw-browsers/chromium`). Story in **1280×800, 1024×768, 390×844** (DPR 2), Kontrollmessungen
bei 1440 und 768 px; alle 22 Steps angescrollt, 32 Screenshots unter
`…/scratchpad/r2viz_d_*.png` (Desktop), `r2viz_m_*.png` (390 px), `r2viz_t_*.png` (1024 px).
Whitepaper in 1280 und 390 px (`r2viz_wpd_*` / `r2viz_wpm_*`), Monte-Carlo-Lauf abgewartet
(„56.000 Ziehungen in 966 ms“), Konfigurations-Schalter interaktiv getestet.
**Schriftgrößen, Overlaps und Trefferflächen im DOM gemessen, nicht geschätzt.**

---

## Gesamturteil Runde 2

Die drei teuersten Befunde aus Runde 1 sind **sauber und strukturell** behoben — nicht kosmetisch:
Die Chart-Schrift wird jetzt gegen den gemessenen viewBox-Skalierungsfaktor invertiert
(CSS-Variable `--k` + ResizeObserver-Äquivalent) und liegt **auf jeder geprüften Breite bei
exakt 12,0 px effektiv** (sm) bzw. 13,5 px (Standard) — inklusive der früheren Totzone
761–1019 px. Der Chart-Titel ist auf allen Breiten statisch über dem SVG (`order:-1`),
Overlap überall 0,0 px. Akt 5/Schritt 1 ist als Abweichungs-Balkendiagramm mit gemeinsamer
Nullachse neu gebaut — das Skalierungsartefakt ist weg, +108 % ist jetzt sichtbar sechsmal so
lang wie +18 %. Dazu Glyphen-Legende in Akt 4, sichtbarer Achsenbeginn-Hinweis, Pfeilspitzen
bei geklemmten Whiskern, Band vor dem Balken in Akt 5/3+4.

**Nicht behoben** ist ausgerechnet der billigste Fix des Katalogs: Der Farbwiderspruch
Text↔Chart in Akt 1/Schritt 4 (M1, zwei Zeilen CSS/HTML) steht unverändert auf dem Schirm.
Und die neuen Elemente bringen eigene, kleinere Probleme mit: die Nullachse in Akt 5/1 wird
durch ein unglückliches Tick-Raster **nie gezeichnet**, die Akt-4-Choreografie macht im
Übergang Schritt 4→5 drei Dinge gleichzeitig (eines davon unerzählt), und die
Rangwahrscheinlichkeits-Matrix im Whitepaper ist für Laien in ihrer 6×6-Vollform eher eine
Hürde als eine Hilfe — während die kuratierte Paar-Tabelle direkt darunter genau das richtige
Format ist und nur nach vorne gehört.

**Fix-Quote (KRITISCH + MITTEL, 14 Befunde): 7 voll behoben · 5 teilweise · 2 offen.**
Alle 4 KRITISCHEN sind mindestens im Kern behoben. Von den 8 KLEIN-Befunden ist keiner
adressiert (war als Politur auch nachrangig). **Die Story ist damit aus meiner Sicht
publikationsreif nach Behebung von M1 (Zweizeiler) und dem neuen Nullachsen-Befund R2-M1.**

---

# Teil A · Fix-Verifikation und neue Befunde

## A.1 Fix-Tabelle Runde-1-Befunde (KRITISCH + MITTEL)

| # | Befund (Kurzform) | Status | Mess-Beleg (Runde 2) |
|---|---|---|---|
| **K1** | Chart-Typografie 7,0–10,1 px auf Laptop/Tablet/Phone | ✅ **behoben** | Effektive `text.sm`-Größe gemessen (computed font-size × viewBox-Skalierung): **12,0 px bei 1440/1280/1024/768/390 px**, Standard-Text 13,5 px. Mechanik: `--k` = SVG-Breite/1060, `font-size: calc(12px / var(--k))` (`strommix-story.html:41–43, 128–130, 1286–1292`); Ränder/Zeilenhöhen ziehen über `SC` mit. Genau der in R1 vorgeschlagene Weg. Screenshots: `r2viz_m_a2s3.png` (13 Zeilen auf 390 px sauber lesbar), `r2viz_t_a2s4.png` |
| **K2** | `.fig-title`-Overlay überdeckt 1020–1240 px die oberste Datenzeile (+22 px) | ✅ **behoben** | `.fig-title{order:-1}` — statisch über dem SVG auf **allen** Breiten. DOM-Messung Titel-Unterkante→SVG-Oberkante: **0,0 px Overlap bei 1440/1280/1024/768/390**. `M.t` von 82 auf 40 gesenkt (`:1280`) → gewonnene Zeichenfläche wie empfohlen |
| **K3** | Akt 3: Annotationen in Datenmarken, Fußnote auf Nulllinie, 15 Punkte ohne Identität, Bänder ohne Fuge | 🟡 **teilweise** | Behoben: Frankreich-Annotation im Randstreifen oben links (`:1832–1846`), Fußnote unter der Achse rechts (`:1856–1860`), TMI-Marke sauber. **Offen:** weiterhin **kein einziges Projekt direkt beschriftet** (Hinkley/Vogtle/Flamanville nur per Hover), **keine Legende** für Punkt/Band/Mittelband; C-Badge und Annotationspfeil berühren sich noch knapp (`r2viz_d_a3s4.png`); Bänder ohne Surface-Fuge (nur Eigen-Stroke) |
| **K4** | Akt 5/1: jede Zeile eigener Maßstab, 89-%-Artefakt | ✅ **behoben** | Abweichungs-Balken in Prozent mit gemeinsamer Nullachse (`:2161–2215`), Absolutwerte „110,0 → 126,6 GW“ als Zweitzeile unterm Zeilenlabel, Vorzeichen-Lesehilfe am Fuß. +108 % ist visuell ~6× so lang wie +18 % (`r2viz_d_a5s1.png`). **Aber:** neuer Folge-Befund R2-M1 (Nullachse wird nie gezeichnet, s. u.) |
| **M1** | Text färbt 125 blau/321 rot, Chart umgekehrt | ❌ **offen** | Unverändert: `class="big pos"` auf 125, `class="big neg"` auf 321 (`:441–442`), `.step-card .pos{color:var(--blue-soft)}` (`:117`), Chart akzentuiert 125 weiterhin terrakotta (`barScene("sc-3", …, 0)`). Screenshot-Beleg: `r2viz_d_a1s4.png` — der Widerspruch steht wörtlich nebeneinander |
| **M2** | Zwei Farben tragen vier Bedeutungen; Kostenabgrenzung unkodiert | 🟡 **teilweise** | Die Abgrenzung steht jetzt **im Zeilenlabel**, wo mehrdeutig („EPR2-Programm · OCC“ vs. „· +Fin.“, `:1687–1692`) und als Kurzform-Suffix — gut. Farbe kodiert in Akt 2/3 aber weiter „günstig/teuer“ über die harte 6.000er-Schwelle (`:1701`) bzw. die handgepflegte `cool`-Liste (`:1803`) — also weiterhin die x-Position doppelt; Akt 5/1 fügt mit „Plan zu niedrig (rot) / zu hoch (blau)“ faktisch eine vierte Lesart hinzu. Keine Legendenzeile, die die jeweilige Farb-Bedeutung pro Akt benennt |
| **M3** | Akt 5/3+4: Band verschwindet hinter opakem Balken | ✅ **behoben** | Band liegt **vor** dem Balken (Kommentar `:2288–2290`), Balken auf 45 % Deckkraft, sichtbare Endkappen + Wertlabels bei 107 und 290 (`r2viz_d_a5s3.png`). Streuung liest sich jetzt beidseitig |
| **M4** | Akt 4 ohne Glyphen-Legende | ✅ **behoben** | Einzeilige Legende `◆ deterministisch · ▭ P25–P75 · │ Median · ├─┤ P5–P95 · gestrichelt = CCS` unter der Achse, auf allen 6 Schritten eingeblendet, NARROW-Kurzform (`:2086–2092`). Sichtbar in allen `r2viz_d_a4s*.png` |
| **M5** | Akt-4-Achse ab 80 ohne Hinweis; Whisker stillschweigend geklemmt | ✅ **behoben** | Achsennotiz „€/MWh Systemkosten · Achse beginnt bei 80“ (`:1958`); `band()` zeichnet bei geklemmtem p5/p95 eine **Pfeilspitze** statt Endkappe (`:1973–1981`) — die tickende Bombe ist entschärft |
| **M6** | Tooltip einzige Quelle für Abgrenzung; kein Touch/Fokus | 🟡 **teilweise** | Untertitel verweist jetzt korrekt auf „Abgrenzung in der Datentabelle unten“; Abgrenzung zusätzlich im Zeilenlabel (s. M2). `hover()` bindet aber weiterhin **nur** `mousemove`/`mouseleave` — kein `pointerdown`, kein `focus`, kein `tabindex` an Marken (`:1263–1267`). Auf Touch bleibt der Tooltip unerreichbar, die Sackgassen-Beschriftung ist aber weg |
| **M7** | Datentinte: Chart nutzt 25–54 % der sticky-Fläche | 🟡 **weitgehend behoben** | Gemessener Chart-Anteil an Viewporthöhe (Akt 4): **68 % @1280, 71 % @1024, 56 % @390** (vorher 54/42/25). viewBox-Höhe wächst mit `SC` (`H = 600·min(1,9, …)`), Labelspalten adaptiv. Akt 3/Schritt 1 (fast leerer Plot als Reveal) weiterhin ohne „Maßstab bleibt gleich“-Notiz |
| **M8** | Akt 5/2: „Mrd. €“ kollidiert mit Untertitel/Legende | ✅ **behoben** | Achsentitel ersatzlos gestrichen, Legende oben links zweiteilig sauber („Erzeugung/Speicher/H₂ · Mrd. €“ / „Netz · Setzung (M)“), keine Kollision (`r2viz_d_a5s2.png`) |
| **M9** | Akt 2/4: Wertlabels kollidieren mit Referenzlinie; Fallback-Label an falscher Stelle | 🟡 **teilweise** | Fallback landet jetzt bewusst am freien linken Zeilenrand statt auf der Annotation (`:1737–1745`) — akzeptabel, aber die Zahl „13.500–17.264“ steht weiter ~600 px von ihrem Band entfernt. Die 6.000er-Linie schneidet **immer noch** durch „5.208 C“ (Paks II) — kein `paint-order:stroke`-Halo gesetzt (Crop: `crop_a2s4_paks.png`) |
| **M10** | Stapel/Bänder ohne Trennfuge | ❌ **offen** | Akt 5/2: Stapelsegmente stoßen weiter hart aneinander (kein `stroke:var(--surface)`); Akt 3: überlappende Bänder nur durch Eigen-Stroke unterschieden. Mildernd: Der 1,4-px-Eigenrand macht Kanten erkennbar; die Mark-Spec-Fuge fehlt trotzdem |

**KLEIN-Befunde (S1–S8):** durchgehend offen — Zeilenlabels tragen weiter Serienfarben (S1,
verstärkt M2), doppelte Einheitenangaben in Akt 5/3+4 (S2), `aria-label` weiterhin statisch,
kein `aria-live` (S3), Hero-Dekor unverändert `preserveAspectRatio="slice"` auf echten Daten
(S4), Epilog weiterhin ohne Abschlussgrafik (S5), keine Orientierungsmarke in der langen Seite
(S7), zwei `console.log` im Auslieferungszustand (S8). S6 (Zahlenwand Akt 2) hat sich durch die
größere Schrift verschärft, bleibt aber durch Sortierung + Tabellen-Zwilling vertretbar.

## A.2 Neue Befunde Runde 2

### R2-K — kritisch

**Keine.** Kein neues Element täuscht oder ist unlesbar. Das ist bei diesem Umbauumfang
bemerkenswert.

### R2-M — erschwert das Verständnis

**R2-M1 · Akt 5/Schritt 1: Das Tick-Raster verfehlt die Null — die Nullachse wird nie gezeichnet**
**Fundstelle:** `strommix-story.html:2179–2185` — `lim` wird auf 140 gerundet
(`ceil(108/20)·20+20`), `tickStep = lim > 100 ? 50 : 20`, Schleife `v = −140, −90, −40, +10,
+60, +110`. Die Bedingung `v === 0` für die hervorgehobene Nullachse (`stroke:var(--axis)`,
1,5 px) **trifft nie zu**; gezeichnet werden stattdessen krumme Ticks (−90, −40, +10 …).
**Screenshot:** `r2viz_d_a5s1.png` — die Balken wachsen aus einer unmarkierten Stelle zwischen
den Gridlinien „−40“ und „+10“; die Fußnote behauptet „gemeinsame Nullachse“, sichtbar ist keine.
Für ein divergierendes Balkendiagramm ist die Nulllinie die wichtigste Linie im Bild.
**Vorschlag:** Ticks von 0 aus in beide Richtungen laufen lassen (`for v=0; v<=lim; v+=step`
plus Spiegel), `lim` auf Vielfaches von `step` runden — dann sind die Ticks rund (0, ±50, ±100)
und die Null-Bedingung greift. Fünf Minuten Arbeit.

**R2-M2 · Akt 4, Übergang Schritt 4→5: drei gleichzeitige Änderungen, eine davon unerzählt**
**Fundstelle:** `:167–180` (Step-Sichtbarkeitsmatrix): Schritt 4 zeigt `l-det + l-over`,
Schritt 5 `l-det + l-base + l-ccs + .ccs-row`. Beim Weiterscrollen passiert simultan:
(1) Überschreitungs-Bänder blenden aus, (2) Basis-Bänder blenden wieder ein — Kostenminimum
springt kommentarlos von 222 zurück auf 158 —, (3) zwei CCS-Zeilen erscheinen. Die Step-Karte
erzählt nur (3). Wer den Rücksprung bemerkt, hält ihn für einen CCS-Effekt; wer ihn nicht
bemerkt, hat den Overrun-Anker verloren. Die übrige Choreografie ist vorbildlich — S1→S2→S3
und S5→S6 ändern je genau eine Sache, und die für die CCS-Zeilen **reservierten Leerzeilen**
verhindern Layout-Sprünge (bewusster, guter Trade-off gegen die leicht unruhige vertikale
Rhythmik in S1–S4).
**Vorschlag:** Im Untertitel von Schritt 5 den Zustandswechsel benennen („zurück im Basislauf,
ohne Überschreitungs-Empirie · beide Pfade mit CCS“) — oder die Overrun-Bänder in S5/S6 als
blasse Geister stehen lassen, dann ist der Vergleich sogar reicher.

**R2-M3 · Akt 4/Schritt 6: Die Asien/Golf-Kontrastbänder widersprechen der eigenen Legende**
**Fundstelle:** `:2063–2069` — die Kontrastbänder werden mit `dash=true` gezeichnet, die
Glyphen-Legende sagt aber „gestrichelt = CCS-Variante“. In Schritt 6 stehen damit **drei**
gestrichelte Bänder im Bild, von denen zwei CCS sind und eines der Asien-Kontrast
(`r2viz_d_a4s6.png`, Bänder „109“ und „121“). Die Kontrastbänder tragen außerdem keine eigene
Beschriftung am Band — ihre Identität hängt allein an der Kopfzeile. Wer die überliest, liest
zwei zusätzliche Szenarien.
**Vorschlag:** Kontrastbänder anders differenzieren (z. B. nur Outline ohne Füllung oder
hellerer Ton **ohne** Strichelung) und ein Mini-Label „Asien/Golf“ direkt ans Band; die
Legende um diesen dritten Marker ergänzen.

**R2-M4 · Whitepaper Kap. 6: Die 6×6-Rangwahrscheinlichkeits-Matrix ist für Laien das falsche
Vorderbühnen-Format** (Antwort auf die Prüffrage: *bedingt* lesbar, aber unnötig schwer)
**Fundstelle:** `whitepaper-strommix.js:3893–3917` (Matrix), `:3918–3951` (Paar-Tabelle);
Screenshot `r2viz_wpd_wp_mc_ranks.png`.
Vier Hürden für Nicht-Experten: (1) Der Kopf „P(Zeile < Spalte)“ ist Formelnotation; dass „<“
hier „günstiger als“ heißt, muss man übersetzen. (2) Die Matrix ist **vollständig redundant** —
30 gefüllte Zellen, von denen 15 nur das Komplement der anderen sind (0,1 % ↔ 99,9 %); ein Laie
erkennt diese Spiegelung nicht und liest 30 unabhängige Zahlen. (3) Die Farblogik ist
doppeldeutig: Teal (≥95 %) **und** Orange (≤5 %) bedeuten beide „entschieden“, nur in
verschiedene Richtung — Orange liest sich aber als Warnfarbe/schlecht. Eine „Entschiedenheit“
ist ein divergierendes Konzept mit neutraler Mitte, keine Gut/Schlecht-Skala. (4) Die Matrix
mischt nicht-emissionsäquivalente Paare (Kostenminimum vs. 80 % EE+Gas, 44,9 %) kommentarlos
mit den fairen CCS-Paaren — die Einordnung steht erst in der Paar-Tabelle darunter.
**Die Paar-Tabelle selbst ist ausgezeichnet** (kuratierte 5 Paare, Warum-Zeile, Δ-Verteilung,
Urteil „entschieden/offen“ mit ehrlicher Definition). Sie gehört nach **oben**, die Matrix als
Experten-Anhang in ein `<details>`. Siehe auch Idee B2.

**R2-M5 · Whitepaper mobil: Die Urteils-Spalte der Rangfolge-Tabellen liegt außerhalb des Schirms**
**Messung:** 390 px — Matrix-Tabelle 728 px breit im 304-px-Container (`scrollable: true`), die
Paar-Tabelle schneidet nach „Median Δ“ ab; **die Spalten „P5…P95“ und „Urteil“ (entschieden/
offen) sind ohne horizontales Scrollen unsichtbar**, und es gibt keinerlei Scroll-Affordance
(kein Schatten, kein „→“-Hinweis). Screenshot `r2viz_wpm_wp_mc_ranks.png`. Ausgerechnet die
Antwort-Spalte fehlt mobil.
**Vorschlag:** Auf <640 px die Paar-Tabelle als gestapelte Karten rendern (Paar-Titel, ein
Satz, P-Wert + Urteil als Badge) oder mindestens Urteil+P als erste Spalten anordnen und dem
`scrollx`-Container einen Kanten-Schatten geben.

**R2-M6 · Story mobil: Step-Karte verdeckt das Chart weiterhin bis vollständig**
*(bekannt: Journalist M12, bewusst offen — hier nur der Runde-2-Messstand)*
**Messung 390×844:** vertikale Überdeckung Karte↔SVG in Kartenmitte: Akt 4/S6 **406 von
407 px (100 %)**, Akt 4/S2 393 px, Akt 5/S1 204 px — dort verschwindet genau die
Batteriespeicher-Zeile (+108 %), über die die Karte gerade spricht (`r2viz_m_a5s1.png`);
in Akt 3/S3 liegt der ×3,5-Pfeil, der Twist des Akts, komplett hinter der Karte
(`r2viz_m_a3s3.png`). Positiv: Titel + Kopfzeile (z. B. „P(Kernkraft < Gas) = 45 %“) bleiben
über der Karte sichtbar — die wichtigste Zahl überlebt. Konkreter Lösungsvorschlag in Idee B4.

### R2-S — Politur

- **R2-S1 · Akt 4: zwei unbeschriftete Zahlen pro Zeile.** Über der Raute steht der
  deterministische Wert, rechts am Whisker der Median (z. B. „152“ und „158“) — ohne
  Positions-Konvention gelernt zu haben, kann man sie verwechseln. Die Glyphen-Legende löst es
  implizit; ein einmaliges „det.“/„P50“-Miniaturlabel in der ersten Zeile würde es explizit lösen.
- **R2-S2 · Akt 4/Schritt 3: Untertitel dupliziert die In-Chart-Kopfzeile** (beide nennen
  P = 45 %) — eine der beiden Zeilen kann Information tragen statt wiederholen.
- **R2-S3 · WP: KPI-Kachel mit 10-Zeilen-Warntext.** Die CO₂-Restemissions-Kachel
  (`r2viz_wpd_wp_tiles_mix.png`) enthält einen ganzen Methodik-Absatz und sprengt den
  Scan-Rhythmus des Kachelrasters; die Nachbarkachel hat 2 Zeilen. Caveat in eine Fußnote unter
  dem Raster, Kachel auf Kennzahl + einen Satz.
- **R2-S4 · WP: Legenden-Swatches unter dem MC-Chart sind formlose Punkte**, obwohl sie
  Formen erklären („Raute = …“, „Balken = …“). Mini-SVGs der echten Glyphen wären
  selbsterklärend (vgl. Idee B5b).
- **R2-S5 · WP: Der Hint unter dem Overrun-Schalter ist ~170 Wörter** Fließtext innerhalb
  eines Formular-Controls — inhaltlich exzellent (die Asymmetrie-Ehrlichkeit!), ergonomisch ein
  Klotz. Kernsatz stehen lassen, Rest in `<details>` „warum asymmetrisch?“.
- **R2-S6 · Story Akt 2 mobil:** Die Studien-Annotation „Annahme der Studie 6.000 €/kW“ läuft
  bis exakt an die rechte SVG-Kante (`r2viz_m_a2s3.png`) — clampTxt greift, aber ohne
  Sicherheitsabstand.
- **R2-S7 · Fortbestand S8:** `console.log` weiterhin 2× im Auslieferungszustand.

### Positiv-Protokoll Runde 2 (verdient Erwähnung)

1. **Die Skalierungslösung ist besser als mein Vorschlag:** Ränder, Zeilenabstände,
   Beschriftungsspalten und viewBox-Höhe wachsen mit (`SC`, `NARROW`), inklusive kürzerer
   NARROW-Textvarianten je Label — das ist responsives SVG-Chart-Design, wie man es selten sieht.
2. **Akt 4 argumentiert jetzt statistisch korrekt** über P(A<B) aus gepaarten Ziehungen statt
   über Band-Überlappung — und das Whitepaper dokumentiert die eigene frühere Fehlargumentation
   offen (`mc-paired-note`). Die 8 vorgerechneten Konfigurationen mit gesperrten unmöglichen
   Kombinationen („Die dann gesperrten Schalter zeigen das an, statt still etwas anderes zu
   rechnen“) sind ein Interaktionsmuster auf Lehrbuchniveau.
3. **Der 7-Preset-MC-Chart im Whitepaper trägt die Dichte** (Prüffrage): 7 Violin-Zeilen mit
   Box/Median/Raute bleiben lesbar, weil Farbe der Entität folgt (CCS-Variante erbt den Ton
   ihres Basis-Presets, ↳-Einrückung), „Ist 2025 \*“ ausgegraut und als nicht ranking-fähig
   markiert ist und die Achse bei 0 beginnt. Keine Beanstandung.
4. **CCS-Kacheln/-Noten:** Die CCS-Zeilen sind konsequent als *Varianten* gekennzeichnet
   (↳, gestrichelt, „keine eigenen Zukünfte“) — genau die richtige semantische Hierarchie.

---

# Teil B · „Was geht noch cooler und verständlicher?“

Leitplanke für alles Folgende: **kein Chart-Junk, keine Verniedlichung** — jede Idee muss
Tufte/IBCS-konform bleiben (Daten-Tinte, semantische statt dekorativer Bildsprache) und darf
die Ehrlichkeits-DNA der Seiten (Konfidenzen, Systemgrenzen, Setzungen) nicht verwässern.

## B.1 Ideen-Katalog

| # | Idee | Wo genau | Aufwand | Erwarteter Effekt | Risiko / Guardrail |
|---|---|---|---|---|---|
| **B1** | **Haushalts-Anker für €/MWh.** 1 €/MWh = 0,1 ct/kWh. Unter jeder großen €/MWh-Zahl eine gedämpfte Zweitzeile: „≈ 16,3 ct je kWh · für einen 3.500-kWh-Haushalt ≈ 570 € Erzeugungskosten im Jahr“. Die stärkste Anwendung ist die **Differenz**: Der Beinahe-Gleichstand 158 vs. 157 wird zu „weniger als 4 € im Jahr“, der Abstand zum 100-%-EE-Pfad (86 €/MWh) zu „rund 300 € im Jahr“, der Asien-Kontrast (50 €/MWh) zu „~175 € im Jahr“ | Story: Akt 1/S4, Akt 4/S3+S6, Akt 5/S3; WP: Executive Summary + MC-Tabelle als Zusatzspalte oder Tooltip | **S** (eine Format-Hilfsfunktion + Datenfeld Haushaltsverbrauch mit Quelle) | Sehr hoch — €/MWh ist für Laien eine leere Einheit; ct/kWh und €/Jahr sind die Einheiten, in denen Menschen Strom denken. Differenzen werden fühlbar | **Hoch, aber beherrschbar:** Systemkosten ≠ Haushaltspreis (Netzentgelt-Systemgrenzen, Steuern, Vertrieb fehlen). Pflicht-Label „Größenordnung der Erzeugungs-/Systemkosten, kein Strompreis“ + Glossar-Link; sonst produziert man die nächste Schlagzeilen-Falsch­lesart |
| **B2** | **Natürliche Häufigkeiten statt Prozent-Matrix: „Von 1.000 gepaarten Ziehungen ist Kernkraft in 449 günstiger.“** Im WP die kuratierte Paar-Tabelle nach oben, je Paar ein **10×10-Waffle** (100 Punkte, gewonnene Ziehungen gefüllt — diskrete Einheiten, IBCS-sauber) oder ein 1.000-Punkte-Streifen; die 6×6-Matrix in `<details>` „vollständige Matrix (Experten)“. In der Story Akt 4/S3 denselben Satz als Kopfzeile | WP Kap. 6 (`renderMcRanks`), Story `:714–722` | **S** (Text) + **M** (Waffle-Renderer, ~60 Zeilen SVG) | Hoch — natürliche Häufigkeiten werden nachweislich besser verstanden als Wahrscheinlichkeiten (Gigerenzer); löst gleichzeitig R2-M4 (Redundanz, Notation, Farb-Doppeldeutung) | Gering. Waffle nicht als Deko-Emoji, sondern als quadratische Marken in den zwei Szenariofarben; Rundung ehrlich benennen (449/1.000, nicht 45/100, wenn 44,9 % gemeint sind) |
| **B3** | **Animierte Eine-Ziehung-Demo im MC-Rechner.** Button „eine Ziehung ansehen“: Es wird sichtbar EIN Parametersatz gezogen (PV-CAPEX 512 €/kW, Gaspreis 41 €/MWh, …, als kurze Liste), alle 7 Szenario-Marken springen auf ihren Wert dieser einen Ziehung, die Differenz Kernkraft−Gas wird mit Vorzeichen angeschrieben; ein Zähler akkumuliert „bisher 7 von 12 Ziehungen: Kernkraft vorn“. Die Rechnung läuft ohnehin schon live im Browser — die Infrastruktur existiert | WP Kap. 6, kleine Karte zwischen Rechner und Verteilungs-Chart | **M** (Draw-Funktion existiert; UI + Animation ~150 Zeilen) | Hoch — „gepaarte Ziehung“ ist DIE methodische Korrektur von v0.2 und aktuell nur als Abstraktum erklärt. Eine sichtbare Ziehung macht sie körperlich begreifbar: *derselbe* Solarpreis in allen Welten | Mittel: Spielzeug-Gefahr. Guardrails: deterministischer Seed (reproduzierbar), max. dezente Animation (keine Würfel-Metaphorik), Hinweis „Illustration einzelner Ziehungen — belastbar ist nur die Verteilung“ |
| **B4** | **Mobile: Chart oben fix, Karte darunter — plus Sticky-Kennzahlzeile.** Unter 760 px das Layout drehen: Chart als 45-svh-Sticky oben, Step-Karten scrollen **darunter** vorbei statt darüber; zusätzlich eine einzeilige Kennzahl-Leiste am unteren Chart-Rand, die je Step die eine Zahl des Steps zeigt („+108 % Batteriespeicher“, „P = 45 %“) | Story CSS `.scrolly`/`.graphic`/`.steps` Mobile-Query; Kennzahl je Step aus vorhandenen Titeln/Subs speisbar | **M** | Hoch — behebt die letzte strukturelle Schwäche (R2-M6/M12): aktuell ist auf dem Telefon in 3 von 4 gemessenen Steps genau das verdeckt, worüber der Text spricht | Gering: 45 svh Chart + 55 svh Karte ist ein erprobtes Muster (NYT/ZEIT mobil); Schrift bleibt dank `--k` bei 12 px |
| **B5a** | **Piktogramm-Anker je Szenario.** Vor den 7 Zeilenlabels (Akt 4 + WP-MC-Chart + Preset-Chips) je eine 12-px-Ein-Farb-Glyphe in Textfarbe: Atom-Orbit, Flamme, H₂, Sonne+Flügel, Stecker (Ist 2025). Keine Emojis, eigene 2-px-Stroke-SVGs | Story `SHORT`-Labels `:1930–1938`, WP `mcShort` + `#mix-presets` | **S–M** (5 Mini-SVGs + Einbau) | Mittel-hoch: 7 ähnlich lange Textzeilen werden auf einen Blick unterscheidbar; Wiedererkennung über Story ↔ WP hinweg; entlastet Leser, die „EE80+H₂“ vs. „EE80+Gas“ sonst dreimal nachlesen | Gering, wenn monochrom, klein und konsequent — das ist IBCS-Semantik (Zeichen mit fester Bedeutung), kein Dekor. Nicht zusätzlich einfärben (Farbe bleibt beim Szenario) |
| **B5b** | **Glyphen-Legende aus echten Mini-Glyphen** statt Unicode-Näherung: `◆ ▭ │ ├─┤ ⌐ ¬` durch kleine SVG-Kopien der tatsächlichen Marken ersetzen (gleicher Renderer wie `band()`), im WP die Punkt-Swatches der MC-Legende ebenso | Story `:2086–2092`, WP `legend('#legend-mc', …)` | **S** | Mittel: Die Legende erklärt dann durch Zeigen statt Beschreiben; „⌐ ¬“ ist aktuell kryptisch | Keins |
| **B6** | **Relationale CO₂-Anker statt nackter Mt.** Neben „107 Mt CO₂/a“ die Verhältnisse, die schon im Datensatz stecken: „das Vierfache des Kernkraft-Szenarios, das 80-fache des 100-%-EE-Pfads“; optional ein externer Anker („≈ ein Fünftel der heutigen deutschen Gesamtemissionen“) **nur** mit belegter Quelle + Konfidenz-Badge wie alle anderen Zahlen | Story Akt 4/S1+S5-Karten, WP MC-Tabelle (Tooltip der Mt-Spalte) | **S** | Mittel-hoch: Mt CO₂ ist so leer wie €/MWh; Verhältnisse tragen die Aussage („Emissions-Rabatt“) besser als Absolutwerte | „Millionen Autos“-Umrechnungen sind beliebt, aber methodisch wacklig (Flotten-Mix, Lebenszyklus) — deshalb bevorzugt intern-relational bleiben; extern nur mit Quelle |
| **B7** | **„Was heißt das für mich?“-Panel im Epilog** (Story): drei Karten im Stil der Grenzen-Karten — „Zahle ich das auf meiner Rechnung?“ (nein — Systemgrenze, siehe B1-Guardrail), „Wer entscheidet die Rangfolge?“ (drei Setzungen: Emissionsgrenze, Institutionen, Überschreitungs-Empirie), „Woran erkenne ich eine unseriöse Zahl?“ (LCOE-ohne-System-Checkliste aus Akt 1) | Story nach dem Epilog-Lede, vor den Grenzen-Karten | **S–M** (reiner Content, vorhandene Kastenkomponente) | Hoch für Laien: übersetzt die Analyse in die drei Fragen, die Nicht-Experten tatsächlich stellen; gibt der Story einen Take-away, der nicht Zahl, sondern Kompetenz ist | Gering; Ton trocken halten, keine Ratgeber-Rhetorik |
| **B8** | **Abschlussgrafik im Epilog** (löst zugleich S5): die vier Zukunfts-Mediane mit P5–P95 als Ein-Zeilen-Zusammenfassung, ergänzt um den Haushalts-Anker aus B1 als Sekundärachse — dieselbe `band()`-Glyphe, die der Leser jetzt lesen kann. Die Story endet dann mit dem Bild, das sie aufgebaut hat | Story Epilog, wiederverwendeter Akt-4-Renderer | **S** | Mittel: verankert die Kernbotschaft („Bandbreite statt Punktwert“) visuell als Schlussakkord; Scroll-Belohnung | Keins — keine neuen Daten, keine neue Kodierung |
| **B9** | **Sprach-Vereinfachung der 5 dichtesten Stellen** (je: Kernsatz nach vorn, Details in `<details>`/Fußnote): ① Akt 4/S4-Karte (Overrun-Asymmetrie — 4 Absätze, 3 Vorbehalte ineinander), ② WP-Overrun-Hint (R2-S5), ③ CO₂-Restemissions-Kachel (R2-S3), ④ `mc-rank-sub` (5 Zeilen Bedingungssätze unter der Matrix), ⑤ Akt 5/S3 „Lehrstück über Nenner“ → ein konkreter Satz zuerst: „Der Plan teilt durch Strom, der nie erzeugt wird — 1.050 statt 876 TWh. Allein das macht die Zahl um 24 €/MWh zu schön.“ | s. Fundstellen | **S** je Stelle | Hoch pro investierter Minute — die Charts sind inzwischen zugänglicher als die dichtesten Texte daneben | Gering; Ehrlichkeits-Vorbehalte nicht streichen, nur staffeln (Progressive Disclosure im Kleinen) |
| **B10** | **Einfach/Vertieft-Modus (Progressive Disclosure groß).** Schalter im Story-Kopf: „Kurzfassung“ zeigt pro Akt nur Auftakt- und Schluss-Step mit vereinfachten Karten (B9-Kernsätze), „Vertieft“ = heutiger Zustand. WP analog: „Nur Befunde“ klappt Methodik-Kästen zu | Story Step-Filter + Karten-Varianten; WP `<details>`-Disziplin | **L** | Hoch für die Reichweite (zwei Publika, eine Seite), aber… | …**höchstes Risiko im Katalog:** zwei Erzählungen müssen synchron gepflegt werden; die Kurzfassung kann die sorgfältigen Vorbehalte amputieren. Empfehlung: erst B1/B2/B9 (kleine Disclosure), B10 nur bei echtem Bedarf |
| **B11** | **Scroll-Orientierung: Akt-Punkte am Rand** (löst S7): fünf Punkte + Aktnummer, dezent mono/muted, rechts mittig; aktueller Akt gefüllt. Kein Fortschrittsbalken (falsche Lese-Erwartung bei 29.000 px), nur Standortanzeige | Story, fixes Element ~20 Zeilen | **S** | Mittel: bei 5 Akten × 4–6 Steps wissen Leser sonst nie, wie viel noch kommt | Gering; auf <760 px ausblenden (Platz) |
| **B12** | **Tap-fähige Tooltips** (Rest von M6): `hover()` um `pointerdown` (Tap toggelt, Tap daneben schließt) + `tabindex="0"`/`focus` erweitern; unsichtbare zeilenhohe Trefferflächen | Story `:1263`, ein zentraler Eingriff wirkt auf alle 5 Akte | **S–M** | Mittel: macht die vorbildliche Provenienz (Abgrenzung, Konfidenz je Punkt) endlich auf Touch erreichbar | Gering; iOS-Doppel-Tap-Zoom mit `touch-action:manipulation` abfangen |

## B.2 Top-5-Priorisierung

1. **B1 · Haushalts-Anker (S):** Der größte Verständlichkeits-Hebel pro Zeile Code im ganzen
   Katalog — €/MWh wird zu ct/kWh und €/Jahr, und der „Beinahe-Gleichstand“ bekommt seine
   ehrlichste Pointe: *weniger als 4 € im Jahr Unterschied, aber 300 € zwischen den Extremen.*
   Mit Pflicht-Guardrail „Systemkosten, kein Strompreis“.
2. **B2 · „449 von 1.000 Ziehungen“ + Paar-Karten vor die Matrix (S/M):** Löst den größten
   neuen Befund (R2-M4) und macht das wichtigste Ergebnis beider Seiten — die offene
   Rangfolge — in der Sprache erzählbar, in der Menschen Unsicherheit tatsächlich verstehen;
   optional mit Waffle als diskreter, IBCS-sauberer Visualisierung.
3. **B4 · Mobile-Layout drehen: Chart oben, Karte darunter, Kennzahl-Sticky (M):** Beendet den
   Zustand, dass auf dem Telefon in den entscheidenden Steps genau das verdeckt ist, worüber
   der Text spricht (gemessen: bis 100 % Überdeckung) — die letzte strukturelle Schwäche der
   Story.
4. **B3 · Eine-Ziehung-Demo (M):** Die gepaarte Ziehung ist die methodische Seele von v0.2;
   eine einzige sichtbare Ziehung erklärt sie besser als jeder Absatz — und die
   Browser-Recheninfrastruktur dafür existiert bereits.
5. **B5a+b · Szenario-Piktogramme + gezeichnete Glyphen-Legende (S–M):** Kleinster Aufwand für
   dauerhafte Orientierung: 7 Szenarien werden über 5 Akte und zwei Dokumente hinweg auf einen
   Blick wiedererkennbar, und die Legende erklärt durch Zeigen statt durch Unicode-Annäherung.

*Flankierend, weil Zweizeiler mit Alt-Schulden: M1 endlich fixen (`:441–442`) und R2-M1
(Null-Tick in Akt 5/1) — beides zusammen unter einer Viertelstunde.*

---

## Screenshot-Verzeichnis (Auswahl)

`…/scratchpad/`: `r2viz_d_00_hero.png`, `r2viz_d_a1s4.png` (M1-Beleg), `r2viz_d_a2s3/4.png`
(+ `crop_a2s4_paks.png`), `r2viz_d_a3s1–s4.png`, `r2viz_d_a4s1–s6.png` (+ `crop_a4s5_ccs.png`),
`r2viz_d_a5s1–s4.png`, `r2viz_m_*.png` (390 px), `r2viz_t_*.png` (1024 px),
`r2viz_wpd_wp_mc_chart.png`, `r2viz_wpd_wp_mc_ranks.png` (+ `…_overrun.png`),
`r2viz_wpd_mc_card.png`, `r2viz_wpd_mc_confignote.png`, `r2viz_wpd_mc_legend.png`,
`r2viz_wpd_wp_tiles_mix.png`, `r2viz_wpd_wp_lcoe.png`, `r2viz_wpm_wp_mc_ranks.png`.
Messdaten: `story_meas.json` (Schriftgrößen, Overlaps, Chart-Anteile je Viewport).
