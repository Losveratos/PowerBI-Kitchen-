# Bedienbarkeit und Barrierefreiheit — visual-standards-rechner.html (v0.19)

Prüfung am 16.09.2026, gemessen mit Playwright/Chromium (headless, `/opt/pw-browsers`),
Datei `file:///home/user/PowerBI-Kitchen-/visual-standards-rechner.html`.
Alle Zahlen in diesem Bericht sind **gemessen**, nicht geschätzt. Skripte und Rohdaten liegen
neben diesem Bericht (`s1.js`…`s9.js`, `contrast2.js`, `nontext.js`, `zoom.js`, `hc.js`,
`taborder.txt`, `contrast2.json`).

Messumgebung: Viewport 1440×900 (sofern nicht anders angegeben), nach `goto` jeweils
`#wiz-skip` geklickt, dann Ebene 3, dann alle `<details>` geöffnet.
Kontrastwerte nach WCAG 2.1 (relative Luminanz), Hintergrund durch die Elternkette
aufgelöst, Verläufe (`.result-headline`) und `opacity`-Ketten eingerechnet.

**Gesamtbild:** Der Rechner ist deutlich sorgfältiger gebaut als der Durchschnitt solcher
Seiten — Eingabe-Kappung wird sichtbar korrigiert *und* vorgelesen, das Popup am Wirkungsgraph
hat eine korrekte Fokusfalle mit Escape und Fokusrückgabe, die Erfüllungsgrad-Punkte haben
echte ARIA-Rollen, die Seite funktioniert vollständig ohne Netz. Die Schwächen liegen genau
dort, wo eigene Bedienelemente gebaut wurden: Zustände sind nur als CSS-Klasse vorhanden,
Sprungmarken bewegen den Fokus nicht, und eine Tabelle erzeugt 368 Tabulator-Halte.

---

## A · Was die Seite für jemanden unbenutzbar macht

### A1 · Anforderungs-Matrix: 368 Tabulator-Halte, Pfeiltasten tot
**Fundstelle:** `#req-table .cap` (Erzeugung Zeile 1500), CSS Zeile 140–144.

Gemessen (`taborder.txt`, vollständiger Tab-Durchlauf auf Ebene 3):
**568 Tabulator-Halte insgesamt, davon 368 (65 %) die fünf Erfüllungsgrad-Punkte je
Anforderung × Ansatz** (27 Anforderungen × 4 Ansätze × 5 Punkte), dazu 76 Halte für die
MoSCoW-Knöpfe. Um von der Anforderungstabelle zum Ergebnis zu kommen, sind über
440 Tabulatordrücke nötig.

Der Container hat korrekt `role="radiogroup"`, die Knöpfe `role="radio"` und `aria-checked`.
Damit gilt aber das ARIA-Radiogruppen-Muster, und das ist nicht umgesetzt:
alle fünf Radios sind einzeln `tabbable` (statt einem *roving tabindex*), und
**Pfeiltasten tun nichts** — gemessen: Fokus auf dem ersten Punkt, `ArrowRight` und
`ArrowDown` → Fokus bleibt auf demselben Knopf, `.cap-lbl` bleibt bei „5".

*Warum Problem:* Für Tastaturnutzer:innen ist die Tabelle damit praktisch eine Sperre. Für
Screenreader ist sie zusätzlich falsch versprochen: die Rolle kündigt Pfeiltastenbedienung an,
die es nicht gibt.

*Vorschlag:* Roving tabindex (`tabindex="0"` nur auf dem aktiven Radio, sonst `-1`) plus ein
`keydown`-Handler auf `.cap` für `ArrowLeft/Right/Up/Down`, `Home`, `End`, der den Wert setzt
und den Fokus mitzieht. Senkt die Halte in der Tabelle von 368 auf 108.
**Aufwand: ca. 45–60 min**, einmalig in `renderReqs()` plus ein delegierter Handler.

---

### A2 · Keine Sprungmarke bewegt den Fokus
**Fundstelle:** `gotoTarget()` Zeile 2692–2699; Aufrufer: `.toc-a` (Inhaltsverzeichnis),
`.rg-row` (Lesehilfe), `#btn-graph`, `#toc-open-all`.

Gemessen, jeweils mit echter Tastaturaktivierung (Fokus setzen, `Enter`):

| Aktion | `scrollY` danach | `document.activeElement` danach |
|---|---|---|
| ToC-Eintrag „Ergebnis und Einschätzung" | 11397 | `button.toc-a` „Ergebnis und Einschätzung", y=390 |
| danach ein `Tab` | 11397 | `button.toc-a.tsub` „Lesehilfe" — **der nächste ToC-Eintrag** |
| Lesehilfe-Zeile 1 „Entscheidungspfad" | — | `button.rg-row`, **y = −479 (außerhalb des Bildes)** |
| `#btn-graph` „Modell als Karte" | — | `#btn-graph`, **y = −1281 (außerhalb des Bildes)** |

`gotoTarget` ruft nur `el.scrollIntoView()`. Der Fokus bleibt auf dem Knopf.

*Warum Problem:* Das Inhaltsverzeichnis ist für Tastaturbedienung wirkungslos — man springt
optisch, aber die Tastatur bleibt stehen, und der nächste `Tab` führt zum nächsten
Verzeichniseintrag statt in den Abschnitt. Bei der Lesehilfe und bei „Modell als Karte" ist der
Fokus danach zusätzlich **nicht mehr sichtbar**, weil er über dem oberen Bildrand liegt
(WCAG 2.4.7 / 2.4.3).

*Vorschlag:* In `gotoTarget` im `go()`-Zweig ergänzen:
`if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','-1'); el.focus({preventScroll:true});`
Der bereits vorhandene `.goto-flash` und `scroll-margin-top` bleiben unverändert.
**Aufwand: ca. 15 min.**

---

### A3 · „Geführter Einstieg" verliert den Fokus vollständig
**Fundstelle:** `#btn-wizard` → `wizStart()` (Bindung Zeile ~2650), `wizRender()` Zeile 2491.

Gemessen: Fokus auf `#btn-wizard`, `Enter` → `body.className` wechselt auf `lv1 lv0`,
**`document.activeElement === document.body`**. Der Knopf selbst wird durch
`body.lv0 .toolbar{display:none}` ausgeblendet, sein Fokus fällt damit auf `<body>`.
Ein `Shift+Tab` landet auf `a.back-link` — also ganz am Dokumentanfang.

*Warum Problem:* Tastatur- und Screenreader-Nutzende sind nach dem Klick orientierungslos und
müssen die Seite von vorne durchtabben, um den Einstieg zu erreichen, den sie gerade geöffnet
haben (WCAG 2.4.3).

*Vorschlag:* Am Ende von `wizStart()` den Fokus setzen — am saubersten auf die Frage:
`const q=document.querySelector('.wiz-q'); if(q){q.tabIndex=-1;q.focus();}`.
Dasselbe gilt beim Verlassen (`#wiz-skip` / „Einstieg beenden"): dort auf `#s0` oder auf die
Stepper-Leiste fokussieren. **Aufwand: ca. 10 min.**

---

### A4 · Segment-Schalter: ausgewählter Zustand existiert nur als CSS-Klasse — und verschwindet im Windows-Kontrastmodus
**Fundstelle:** CSS Zeile 117–118 (`.seg button` / `.seg button.active`); Vorkommen:
`#horizon-seg` (Z. 534), `#riskq-seg` (Z. 686), `#ov-mode-seg` (Z. 473), `#ov-lic-seg` (Z. 474),
`#mode-seg` (Z. 547), `#munc-seg` (Z. 563), `#dist-seg` (Z. 608), `#view-seg`/`#per-seg` (Z. 683),
sowie `#mc-w-seg`/`#mc-a-seg`/`#mc-n-seg`. Gleiches Muster: `.step-chip.active` (Z. 53),
`.tab.active` (Z. 155), `.preset-btn.active` (Z. 105).

Gemessen aus dem Chromium-Barrierefreiheitsbaum (CDP `Accessibility.getFullAXTree`):
```
{"role":"button","name":"3 Jahre","props":["invalid=\"false\"","focusable=true"]}
{"role":"button","name":"5 Jahre","props":["invalid=\"false\"","focusable=true"]}   ← ist aktiv
{"role":"button","name":"10 Jahre","props":["invalid=\"false\"","focusable=true"]}
```
Kein `pressed`, kein `checked`, kein Gruppenname. Ein Screenreader liest drei gleichwertige
Knöpfe vor; welcher Horizont eingestellt ist, ist nicht erfahrbar.

Gemessen mit `forcedColors: 'active'` (Windows-Kontrastmodus):
alle drei Knöpfe `background-color: rgb(255,255,255)`, `color: rgb(0,0,0)`, `border-width: 0px`,
`outline: 0px none` — **optisch identisch**. Dasselbe für `.step-chip.active` und
`.cert-bar i` (alle drei Segmente weiß, ohne Rahmen).

*Warum Problem:* Die Zielgruppe arbeitet überwiegend auf Windows; der Kontrastmodus ist dort
die verbreitetste Sehhilfe. In diesem Modus ist nicht mehr erkennbar, ob mit 3, 5 oder 10
Jahren und mit P50, P75 oder P90 gerechnet wird — also mit welcher Zahl man gerade in einer
Beschaffungsdiskussion sitzt. Auch ohne Kontrastmodus fehlt der Zustand für Screenreader.

*Vorschlag:* zweiteilig.
1. `.seg` → `role="radiogroup"` + `aria-labelledby` auf die vorhandene Beschriftung,
   Knöpfe → `role="radio"` + `aria-checked` (das Muster ist in `.cap` schon vorhanden und kann
   kopiert werden); `.step-chip` → `aria-current="page"`; `.preset-btn`/`.tab` → `aria-pressed`.
2. Der nötige optische Ersatz steht bereits in der Druck-CSS (Zeile 3102):
   `.prio button.active,.seg button.active,.tab.active,.preset-btn.active{outline:2px solid #23261F;font-weight:700}`
   — dieselbe Regel zusätzlich in `@media (forced-colors: active)` aufnehmen.
**Aufwand: ca. 45 min** (davon 5 min für Punkt 2).

---

### A5 · Ansatz-Farben in der Entscheidungsmatrix: bis 2,17:1
**Fundstelle:** CSS Zeile 147 `.req-table th.opt{color:var(--capc)}`; `--capc` wird inline aus
`o.color` gesetzt (Zeile 1500). Dieselben Rohfarben aus `:root` Zeile 23
(`--o-paid/--o-oss/--o-deneb/--o-core`).

Gemessen auf `#fff`, Schriftgröße 10,5 px (Anforderung: 4,5:1):

| Spaltenkopf | Farbe | gemessen | Soll |
|---|---|---|---|
| „MacGyver / Core Visuals + SVG" | `#eda100` | **2,17:1** | 4,5:1 |
| „Flexibel · fertig / Open Source" | `#1baf7a` | **2,82:1** | 4,5:1 |
| „Paid / 3rd-Party paid" | `#eb6834` | **3,20:1** | 4,5:1 |
| „Flexibel · Code / Deneb / Vega" | `#2a78d6` | **4,42:1** | 4,5:1 |

*Warum Problem:* Das sind die vier Spaltenköpfe der zentralen Entscheidungsmatrix. Wer die
Spalte nicht lesen kann, kann die Tabelle nicht lesen — und 2,17:1 ist auf einem Beamer auch
für normalsichtige Betrachter im Saal nicht mehr sicher lesbar.

*Vorschlag:* Die Datei enthält bereits geprüfte Textvarianten derselben Farben
(`tcolor`, Zeile 783), die in `.kpi .eyebrow` schon verwendet werden. Gemessen:
`#8A5E00` = 5,70:1 · `#0E6B4A` = 6,52:1 · `#1B4F91` = 8,16:1 · `#A63A16` = 6,49:1.
Also eine zweite Variable `--capct` mit `o.tcolor` mitgeben und in `.req-table th.opt`
verwenden. Die Flächenfarbe der `.cap`-Punkte bleibt wie sie ist.
**Aufwand: ca. 10 min.**

---

## B · Ärgernisse

### B1 · Das Ergebnis ändert sich, ohne dass ein Screenreader es merkt
**Fundstelle:** `#headline` und `#kpi-allowed` (Ausgabe in `update()`, Zeile 1666–1798);
Toast-Mechanik Zeile 1797 und 2250.

Gemessen: `#headline` hat weder `aria-live` noch `role`; `#kpi-allowed` hat keinen Vorfahren
mit `aria-live` (geprüft bis `<body>`). Die Seite hat fünf Live-Regionen
(`#toast`, `#toc-where`, `#wiz-count`, `#wiz-live`, `#graph-explain`) — keine davon liegt am
Ergebnis.

Der Toast fängt das an 38 Stellen ab (`pendingToast`) und ist gut gemacht: er hängt an jede
Meldung „→ Platz 1: Paid 68.000 €" an. **Gemessen still bleiben aber:**

| Bedienelement | Headline ändert sich | Toast |
|---|---|---|
| `#horizon-seg` → 10 Jahre | ja | **leer** |
| `#riskq-seg` → P90 | ja | „Entscheidungsgröße P90 → Platz 1: Paid 140.000 €" |
| Regler `#viewers` → 5000 | ja | **leer** |
| Regler `#weight` (Gewichtung) | ja | **leer** |
| Red-Flag-Schalter | ja | vorhanden |
| MoSCoW M→W | ja | vorhanden |
| Erfüllungsgrad 1 von 5 | nein | vorhanden |
| Annahme in `.a-row` | ja | vorhanden |

*Warum Problem:* Der Horizont und die Viewer-Zahl sind die beiden Stellschrauben, die das
Ergebnis am stärksten drehen — genau bei ihnen bleibt es still.

*Vorschlag:* Entweder in den drei Handlern `pendingToast` setzen (Zeilen ~2594, ~2599, ~2659
und `#horizon-seg`), oder — robuster — `#headline` auf `role="status" aria-live="polite"
aria-atomic="false"` setzen. Bei Reglern dabei auf das `change`-Ereignis beschränken, nicht auf
`input`, sonst redet die Seite beim Ziehen durchgehend.
**Aufwand: ca. 20 min.**

### B2 · Schieberegler sind 4 px hoch
**Fundstelle:** CSS Zeile 109 `input[type=range]{width:100%;accent-color:var(--accent);height:4px}`.
Betroffen: `#creators`, `#viewers`, `#reports`, `#types`, `#existing`, `#ss`, `#weight`, `#cpr`.

Gemessen `#viewers`: **359 × 4 px** (`getBoundingClientRect`), CSS-Höhe `4px`.
WCAG 2.5.8 (AA) verlangt 24 × 24 px.

*Warum Problem:* Mit der Maus muss man einen 4 px hohen Streifen treffen; auf einem
Touch-Notebook oder mit Zittern praktisch unmöglich. Es gibt jeweils ein Zahlenfeld daneben,
das rettet die Funktion — aber der Regler ist als Bedienelement faktisch tot.

*Vorschlag:* `height:24px; background:transparent;` und die 4-px-Optik über
`::-webkit-slider-runnable-track` / `::-moz-range-track` erzeugen; der Daumen bleibt über
`accent-color`. **Aufwand: ca. 30 min** (inkl. Sichtprüfung in Chrome und Firefox).

### B3 · Fokusring im Inhaltsverzeichnis unter der Kontrastgrenze
**Fundstelle:** CSS Zeile 331 `.toc-a:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}`.

Gemessen: `#3E9C8F` gegen `#fff` = **3,30:1**, gegen `#F1EEE5` = **2,85:1** (Soll 3:1).
Zusätzlich: `outline-offset:-2px` legt den Ring genau auf die vorhandene 2-px-Linkskante, so
dass er vom `.on`-Zustand kaum zu unterscheiden ist.
Der globale Ring (Zeile 36, `3px solid var(--accent-text)` = `#276559`) misst dagegen
**6,79:1** auf Weiß und **5,85:1** auf Papier — der ist in Ordnung.

*Vorschlag:* Zeile 331 ersatzlos streichen; die globale `:focus-visible`-Regel greift dann.
**Aufwand: 2 min.**

### B4 · Eingabefelder haben keinen erkennbaren Rand
**Fundstelle:** `--line:#D8D2C0` (Zeile 21), `--paper-2:#E7E2D4` (Zeile 20); angewandt auf
`input[type=number]`, `input[type=text]`, `select` (Zeile 110–111), `.btn` (Z. 46),
`.card` (Z. 87), `.seg` (Z. 116), `.check-item` (Z. 121), `.prio` (Z. 134).

Gemessen (WCAG 1.4.11, Soll 3:1 für Bedienelement-Grenzen):

| | gemessen |
|---|---|
| Rahmen `#D8D2C0` auf Weiß | **1,51:1** |
| Rahmen `#D8D2C0` auf Papier `#F1EEE5` | **1,30:1** |
| Feldfüllung `#E7E2D4` auf Weiß | **1,29:1** |

*Warum Problem:* Ein Zahlenfeld unterscheidet sich vom Kartenhintergrund um Faktor 1,3 — es
ist nicht als Feld erkennbar, sondern nur als etwas hellere Fläche. Auf einem Beamer im
hellen Saal fällt das ganz weg.

*Vorschlag:* Ein eigener Token nur für Bedienelement-Grenzen, z. B. `--line-field:#AFA893`
(≥ 3:1 auf Weiß), verwendet in `input`, `select`, `.seg`, `.prio`, `.btn`, `.check-item`.
Die dekorativen Rahmen (`.card`, `.appendix-table`) dürfen bei `--line` bleiben.
**Aufwand: ca. 15 min Code + Sichtprüfung.**

### B5 · Sicherheits-Leiste: Text auf Farbfläche, Erklärung nur beim Überfahren
**Fundstelle:** CSS Zeile 244–246 (`.cert-bar i.b/.f/.e`).

Gemessen bei 10 px Schrift:
`#fff` auf `#3E9C8F` (belegt) = **3,30:1** · `#fff` auf `#7B8BC4` (Meinung) = **3,32:1** ·
`#23261F` auf `#B4B2A2` (Faustregel) = 7,18:1 (in Ordnung).
Im Windows-Kontrastmodus: alle drei Segmente `rgb(255,255,255)`, `border-width: 0px` — die
Farbzuordnung belegt/Faustregel/Meinung geht vollständig verloren, übrig bleiben die
Prozentwerte in Reihenfolge.
Außerdem gemessen: die Segmente tragen ihre Erklärung ausschließlich in `title`
(z. B. `title="Faustregel: 4 % ≈ 2.800 €"`), sind keine Knöpfe und nicht fokussierbar.

*Vorschlag:* Füllfarben abdunkeln (`#2F7A6F` ergibt 4,7:1, `#5A6BA8` ergibt 5,0:1);
`aria-label` mit demselben Text wie `title` ergänzen; für `forced-colors` je Segment ein
unterschiedliches Muster oder einen Rahmen setzen. **Aufwand: ca. 30 min.**

### B6 · Beschriftungen im Wirkungsgraph bis 2,14:1
**Fundstelle:** Erzeugung Zeile 1969–1976, Füllfarben als SVG-Attribute.

Gemessen (SVG `<text>`, `font-size="10"`, auf Weiß):
„Faustregel · 3 Annahmen" `#B4B2A2` = **2,14:1** ·
„belegt · 5 Annahmen" `#3E9C8F` = **3,30:1** ·
„Meinung · 8 Annahmen" `#7B8BC4` = **3,32:1**.
Die übrigen 13 SVG-Textknoten der Seite liegen zwischen 5,70:1 und 15,35:1 und sind in Ordnung.

*Vorschlag:* dieselben drei Farben durch die abgedunkelten Varianten aus B5 ersetzen und
`#B4B2A2` durch `#6E6C5E` (5,0:1). **Aufwand: ca. 10 min.**

### B7 · Der aktive Eintrag im Inhaltsverzeichnis ist der am schlechtesten lesbare
**Fundstellen und Messwerte** (alle unter 4,5:1):

| Stelle | CSS-Zeile | Farbe / Hintergrund | gemessen |
|---|---|---|---|
| `.toc-a.on` (aktiver Eintrag) | 330 | `#3E9C8F` auf `#F1EEE5` | **2,85:1** |
| `.step-chip .n` bei aktiver Ebene | 72 + 54 | `#F1EEE5` auf `#3E9C8F` | **2,85:1** |
| `.toc-a .lvc` (Ebenen-Vermerk, `opacity:.75`) | 337 | effektiv `#818177` auf `#F1EEE5`, 9 px | **3,39:1** |
| `.toc-list li.toc-h` (Kopfzeile, `opacity:.72`) | 325 | effektiv `#85867B` auf `#F1EEE5`, 9,5 px | **3,18:1** |
| `.prio button.active.m` („Must") | 136 | `#F1EEE5` auf `#C4573A` | **3,79:1** |
| `.opt-card h5` („Versteckte Kosten") | 216 | `#C4573A` auf `#fff` | **4,40:1** |

`--ink-soft` selbst ist unauffällig: `#5B5D52` misst 5,78:1 auf Papier und 6,70:1 auf Weiß.
Die Verstöße entstehen ausschließlich durch die zwei `opacity`-Abschwächungen und durch
`--accent` (`#3E9C8F`), das als *Textfarbe* verwendet wird, obwohl es als Flächenfarbe gedacht
ist.

*Vorschlag:* In allen sechs Fällen auf `--accent-text` `#276559` (5,85:1 auf Papier) bzw.
`--ink-soft` umstellen und die beiden `opacity`-Werte streichen (die Abstufung entsteht
ohnehin schon über Schriftgröße und Laufweite). Die 9-px- und 9,5-px-Größen dabei auf
mindestens 11 px anheben. **Aufwand: ca. 15 min.**

### B8 · Kein `<main>`, 20 verwaiste `<label>`
Gemessen: `document.querySelector('main,[role=main]')` → **null**. Landmarken insgesamt:
`nav[Ebenen]`, `nav#toc[Inhaltsverzeichnis]`, `footer#footer`. Der gesamte Inhalt liegt in
`div.wrap`.

Gemessen: **20 `<label>`-Elemente ohne `control` und ohne `for`** — es sind genau die
Gruppenbeschriftungen der selbstgebauten Segment-Schalter: „Betriebsmodell",
„Lizenz-Anker für Paid", „Betrachtungshorizont", „Entscheidungsgröße", „Verteilweg des Visuals",
„Perspektive der Charts und Kennzahlen", „Nutzungsdauer", „Was schwankt", „Ziehungen" u. a.
Beispiel Zeile 473: `<label><span>Betriebsmodell</span></label><div class="seg" id="ov-mode-seg">…`.
Im Barrierefreiheitsbaum bleiben sie als loser `StaticText` stehen und sind mit den Knöpfen
nicht verknüpft.

*Vorschlag:* `div.wrap` → `<main>` (oder ein `<main>` um alles außer `#toc`), und die 20
`<label>` in `<span class="field-lbl" id="lbl-…">` umbauen, auf die der zugehörige
`role="radiogroup"`-Container per `aria-labelledby` zeigt (fällt mit A4 zusammen).
**Aufwand: ca. 30 min, gemeinsam mit A4.**

### B9 · Zwei Charts ohne Zahlen-Äquivalent
Gemessen (alle sichtbaren SVG):

| SVG | `aria-label` | `aria-describedby` | Textäquivalent vorhanden? |
|---|---|---|---|
| `#ov-chart` | „Kosten je Viewer und Jahr je Ansatz" | – | **ja** — `.ov-sentence` nennt alle Werte im Fließtext (gemessen: „…rund 278 € je Viewer und Jahr (P50); Deneb kostet das 1,3-fache…") |
| `#chart-stack` | „Kostenstruktur je Ansatz" | `res-table` | **ja**, Tabelle mit 22 Zeilen |
| `#chart-cum` | „Kumulierte Kosten" | – | **ja**, „Cash-out je Jahr"-Tabelle (8 Zeilen) |
| `#chart-be` | „Break-even über die Viewer-Zahl" | – | **nein** |
| `#chart-tornado` | „Sensitivität" | – | **nein** |
| `#tree-svg` | langer beschreibender Text | – | teilweise (der Text nennt nur die Knotennamen, nicht die Aussagen) |
| `#graph-svg` | „Wirkungsgraph: …" | – | **ja** — jeder Knoten hat `<title>`, dazu die Live-Region `#graph-explain` (gemessen 662 Zeichen Erklärtext nach Auswahl) |

*Anmerkung:* Ein Sankey-Diagramm gibt es auf der Seite nicht; der Wirkungsgraph ist ein
Bänderdiagramm und über `<title>` je Knoten plus `#graph-explain` erschlossen.

*Vorschlag:* Für Break-even und Tornado je eine kleine `<table class="res">` in einem
`<details>` darunter (dieselben Zahlen, die die Zeichenfunktionen ohnehin haben) und per
`aria-describedby` verknüpfen. **Aufwand: ca. 45 min.**

### B10 · Im geführten Einstieg wird die Frage nie vorgelesen
**Fundstelle:** `#wiz-pane` (Zeile 452, `role="group" aria-labelledby="wiz-title"`),
`wizRender()` Zeile 2491.

Gemessen über alle sieben Schritte: nach `Enter` auf `#wiz-next` bleibt
`document.activeElement === #wiz-next`; der Bereich `#wiz-pane` wird per `innerHTML` neu
gefüllt (`<h3 class="wiz-q">…`), ist aber **keine** Live-Region.
`aria-labelledby="wiz-title"` zeigt auf die *statische* Abschnittsüberschrift
„Sieben kurze Fragen zu eurer ersten Indikation" — für alle sieben Schritte dieselbe.
Angesagt wird nur `#wiz-count` („Schritt 2 von 7") und `#wiz-live` (das Zwischenergebnis).
Die Frage selbst („Wer baut die Vorlagen?") wird nie ausgegeben.

*Positiv gemessen:* Die Antwortmöglichkeiten `.wiz-choice` tragen `aria-pressed="true|false"`
**und** ein sichtbares ○/●-Zeichen — also keine reine Farbcodierung. `#wiz-back` ist auf
Schritt 1 korrekt `disabled`.

*Vorschlag:* In `wizRender()` nach dem `innerHTML` die neue Überschrift fokussieren
(`h3.wiz-q` mit `tabindex="-1"`) und `aria-labelledby` des Panes auf eine ID der jeweiligen
Frage umhängen. **Aufwand: ca. 15 min.**

### B11 · Tabellen ohne `caption` und ohne `scope`
Gemessen: 6 `<table>`, **0 `<caption>`**, **0 von 42 `<th>` mit `scope`**.
Bei `#req-table` steht der Zeilenkopf (der Anforderungsname) zudem in
`<td class="name">`, nicht in `<th scope="row">` (Zeile 1498 ff.).

*Warum Problem:* Beim Navigieren durch die 27×4-Matrix mit Screenreader-Tabellenbefehlen fehlt
die Zeilenzuordnung — man hört „4 von 5: gut" ohne zu wissen, zu welcher Anforderung.
Die `aria-label` der einzelnen Punkte fangen das teilweise ab
(`.cap` hat `aria-label="<Anforderung>, <Ansatz>"`), aber nicht beim Zellen-für-Zelle-Lesen.

*Vorschlag:* `<caption class="sr-only">` je Tabelle, `scope="col"` auf alle `<th>`,
`td.name` → `th scope="row" class="name"`. **Aufwand: ca. 20 min.**

### B12 · Quellen-Badges nur beim Überfahren lesbar
**Fundstelle:** `.badge` (CSS Zeile 170, `cursor:help`), erzeugt in `paramRow()`;
zusätzlich `.srcbar i` (Zeile 152).

Gemessen, 8 Elemente mit ausschließlich `title` und ohne Textinhalt/`aria-label`, u. a.
`<i title="V: 3">`, `<i title="S: 9">`, `<i class="f" title="Faustregel: 4 % ≈ 2.800 €">`.
Die `.badge`-Spans haben zwar einen Buchstaben als Text („S", „F", „A"), die Begründung steht
aber nur im `title`:
`<span class="badge S" title="Such-Snippet: Robert Half Gehälter 2026 (Befragung 06–07/2025, rund 1.500 Befragte): Controller 55.000–89.250 €…">S</span>`.
Spans sind nicht fokussierbar → per Tastatur unerreichbar, auf Touch ebenfalls.

*Warum Problem:* Die Herkunft je Annahme ist im Rechner ein inhaltliches Kernversprechen
(„Alle Annahmen … mit ihrer Quellenlage markiert"). Wer nicht mit der Maus hovern kann,
bekommt nur den Buchstaben.

*Vorschlag:* `.badge` als `<button type="button">` mit `aria-describedby` auf einen
sr-only-Absatz, oder ein kleines Popover analog zum bereits funktionierenden `.gpop`.
Die `.badge-legend` darunter bleibt. **Aufwand: ca. 30 min.**

---

## C · Zoom, Textgröße, Reflow

**Gemessen** (Ebene 3, alle `<details>` geöffnet, `documentElement.scrollWidth` vs. `clientWidth`):

| Bedingung | Viewport | Seiten-Überlauf |
|---|---|---|
| 1280 px @ 100 % | 1280×800 | **0 px** |
| 1280 px @ 150 % | 853×533 | **0 px** |
| **1280 px @ 200 %** | **640×400** | **0 px** |
| 320 CSS px (≈ 1280 @ 400 %) | 320×600 | **54 px** |

**Bei 200 % Zoom bricht nichts.** Alle breiten Elemente liegen in scrollbaren Behältern —
gemessen `#req-scroll` 546/865 px (`overflow-x:auto`), `#graph-svg` 546/660,
`#tree-svg` 508/600, `.tbl-scroll` um die `table.res`. Das Inhaltsverzeichnis wechselt unter
1100 px korrekt von der Seitenleiste auf den Aufklapp-Knopf (gemessen `position: static`,
Höhe 34 px). Das Graph-Popup wird unter 700 px per Media-Query statisch unter den Graph
gesetzt — auch das greift bei 640 px.

Der **Überlauf bei 320 px** (WCAG 1.4.10) kommt von zwei Stellen:
`.rcm-row`-Felder `#rcmix-0-2`, `#rcmix-1-2`, `#rcmix-2-2` (je 52 px in einem
vierspaltigen Raster, rechte Kante bei 374 px) und dem zweispaltigen `.gloss dl`
(`dd` 180 px breit ab left=178). *Vorschlag:* eine Media-Query unter 400 px, die
`.rcm-row` und `.gloss dl` einspaltig setzt. **Aufwand: ca. 20 min.**

**Textvergrößerung ohne Zoom funktioniert nicht.** Gemessen: **128 `font-size`-Deklarationen
in `px`, 3 relative.** Die Browser-Einstellung „Schriftgröße" (Chrome/Edge → Darstellung)
ändert an der Seite nichts; nur Seitenzoom hilft. Kombiniert mit der Größenverteilung ist das
der schwerste ergonomische Punkt jenseits der Norm:

| Schriftgröße | Textknoten |
|---|---|
| 12,5 px | 564 |
| **11 px** | **471** |
| **10 px** | **257** |
| **10,5 px** | **148** |
| 12 px | 282 |
| **11,5 px** | **69** |
| **9,5 / 9 / 10,4 px** | **11 / 9 / 2** |
| ≥ 13 px | 146 |

**967 von 1959 sichtbaren Textknoten (49 %) sind 11,5 px oder kleiner.** Für Beamer,
Ausdruck und Bildschirmteilung ist das die Hauptursache dafür, dass die Seite „klein" wirkt.
*Vorschlag:* Mindestgröße auf 11 px anheben (betrifft nur die 22 Knoten unter 10,5 px) und
mittelfristig alle `font-size` auf `rem` umstellen, damit die Browser-Einstellung wirkt.
**Aufwand: 15 min für die Mindestgröße, ca. 2 h für die rem-Umstellung inkl. Sichtprüfung.**

---

## D · Bedienbarkeit jenseits der Norm

### D1 · Klickflächen (WCAG 2.5.8 AA: 24 × 24 px)
Gemessen aus dem Tab-Durchlauf:

| Element | Größe | Bewertung |
|---|---|---|
| `#creators`, `#viewers`, `#reports`, `#types`, `#ss`, `#existing`, `#weight` (Regler) | 359 × **4** | siehe B2 |
| `#toc-open-all` „Alles aufklappen" | 96 × **11** | zu klein |
| `#toc-close-all` „zuklappen" | 54 × **11** | zu klein |
| Sticky-Bar-Link „↓ Ergebnis" | 72 × **14** | zu klein |
| `.lnk` „Landkarte des Modells öffnen →" | 191 × **18** | zu klein |
| Link „Kernaussagen zur Diskussion" | 182 × **15** | zu klein |
| `#ov-lib`, `#ibcs-all` u. a. Checkboxen | **15 × 15** | zu klein |
| `.valin` Zahlenfelder | 96 × **23** | knapp darunter |
| `.toc-a.tsub` Unterpunkte | 210 × **23** | knapp darunter |
| `.cap` Erfüllungsgrad-Punkte | **24 × 24** (Abstand 2 px) | erfüllt |
| `.prio` M/S/C/W | **28 × 28** | erfüllt |
| `.btn`, `.step-chip`, `.seg button` | 34 / 57 / 30 px hoch | erfüllt bzw. knapp |

*Vorschlag:* `padding` auf den Textknöpfen (`.toc-foot button`, `.lnk`) und
`width/height:18px` + `padding:3px` auf den Checkboxen. **Aufwand: ca. 20 min.**

### D2 · Eingaben werden nicht still verworfen — das ist gut gelöst
Gemessen, jeweils Wert eintragen und `Tab`:

| Eingabe in `#n-viewers` | Feld danach | Toast (`aria-live="polite"`) |
|---|---|---|
| `99999999999` | `10000000` | „Viewer: 10.000.000 → Platz 1: Open Source 490 Mio. €" |
| `-5` | `0` | „Viewer: 0 → Platz 1: Paid 49.000 €" |
| leer | `0` | „Viewer: 0 → Platz 1: Paid 49.000 €" |

Report-Klassen 90/90/90 % → `#rc-sum` zeigt **„270 % (wird auf 100 normiert)"**, Toast
„Report-Klassen 90 / 90 / 90 % → Platz 1: Paid 68.000 €".
Dreipunkt-Schätzungen: eine Änderung, die min > wahrsch. erzeugt, wird korrigiert *und*
begründet — Toast „„Stundensatz intern" = 120 · 120 · 120 (Nachbarwerte angepasst, damit
min ≤ wahrsch. ≤ max)" (Zeile 1544). Die Kappung ist also **sichtbar und hörbar**.
Einziger Rest: `.a-row input.bad` (Zeile 165) markiert einen ungültigen Zustand nur über
Rahmenfarbe — er tritt aber praktisch nicht auf, weil sofort korrigiert wird.

### D3 · Schnelle Eingaben
Gemessen: 12 aufeinanderfolgende Änderungen an `#n-creators` ohne Pause (3…14), danach 2,5 s
warten → Feld zeigt `14`, Ergebnis konsistent, **keine JS-Fehler**. Die Entprellung über
`scheduleUpdate()` hält; die 1.500er-Simulation läuft nicht mehrfach parallel.

### D4 · Ohne Netz
Gemessen mit `offline: true` und zusätzlich geblockten Routen auf `fonts.googleapis.com`,
`fonts.gstatic.com`, `cdnjs.cloudflare.com`:
- **keine JS-Fehler**, kein Layoutbruch (`scrollWidth` = `clientWidth` = 1280),
- Schriften fallen sauber zurück (`"Space Grotesk", Inter, sans-serif` → System-Sans;
  `"IBM Plex Mono", ui-monospace, Menlo, monospace`), die H1-Breite bleibt im Rahmen,
- **Excel-Export funktioniert**: `window.XLSX === true`, Toast
  „Excel-Modell exportiert: Blatt „Annahmen" ändern, „Modell" rechnet nach."
  Grund: `loadScript('assets/js/xlsx.full.min.js')` zuerst (Zeile 2105), die Datei liegt
  lokal vor (`assets/js/xlsx.full.min.js`, 881 KB), CDN nur als Rückfallebene, danach noch ein
  CSV-Rückfall.

Das ist für eine Konferenz genau richtig gebaut. Eine Einschränkung: der Pfad ist relativ —
wenn die Datei einzeln (ohne `assets/`) weitergegeben wird, greift nur noch das CDN.

### D5 · Druck
Gemessen mit `emulateMedia({media:'print'})` auf Ebene 3, 1280 px:
kein horizontaler Überlauf, nur `#wizard` ausgeblendet — aber **nur 2 von 13 `<details>` offen**.
Wer ohne vorheriges „Alles aufklappen" druckt, bekommt einen PDF-Handout, in dem 11 Blöcke
der Ebene 3 fehlen, ohne dass es auffällt.
*Vorschlag:* In der Druck-CSS (Zeile 3071 ff.) analog zu `.opt-card details` ergänzen:
`details.lvl3>.section,details.lvl3>*{display:block!important}` und das `>summary::after`
auf „−" fixieren. **Aufwand: ca. 10 min.**

### D6 · Weiches Scrollen macht die Tabulator-Fahrt zäh
Gemessen über 60 Tabulatordrücke:
- ohne `prefers-reduced-motion`: **4 von 60** Halte lagen unmittelbar nach `Tab` außerhalb des
  sichtbaren Bereichs, **0 von 60** nach 500 ms,
- mit `prefers-reduced-motion: reduce`: **0 von 60** sofort.

Also kein Verstoß, aber eine spürbare Verzögerung bis zu einer halben Sekunde bei jedem
größeren Sprung. Auf einer Seite mit 568 Tabulator-Halten summiert sich das.
`prefers-reduced-motion` wird korrekt beachtet (Zeile 37/38).

---

## E · Was gut ist (gemessen, nicht angenommen)

- **Popup am Wirkungsgraph** (`#graph-pop`, Zeile 499 / 2980–3040): Beim Aktivieren eines
  Knotens mit `Enter` **und** mit `Leertaste` öffnet es, der Fokus springt hinein
  (`INPUT.valin`), 30 aufeinanderfolgende `Tab` bleiben **alle** im Popup (Falle korrekt und
  gewollt), `Escape` schließt und gibt den Fokus an den Graphknoten zurück
  (gemessen: `g.gr-node "Eingabe Ersteller: 3…"`). Das ist vorbildlich umgesetzt.
  Einziger Rest: `role="dialog"` ohne `aria-modal="true"`, Hintergrund nicht `inert` —
  zwei Attribute, 5 min.
- **Erfüllungsgrad-Punkte** haben `role="radio"`, `aria-checked`, sprechende `aria-label`
  („3 von 5: eingeschränkt") **und** eine sichtbare Zahl in `.cap-lbl` — keine reine
  Farbcodierung, und im Windows-Kontrastmodus bleibt die Zahl lesbar, auch wenn die Punkte
  gleich aussehen.
- **Inhaltsverzeichnis**: `aria-current="true"` am aktiven Eintrag, dazu die sr-only-Live-Region
  `#toc-where` („Gerade sichtbar: Annahmen mit Bandbreiten"). Sauber gedacht.
- **Sticky-Leiste**: 14,11:1 / 10,84:1 / 10,22:1 — einwandfrei.
- **`--ink-soft`** ist unauffällig (5,78:1 auf Papier, 6,70:1 auf Weiß); die Verstöße kommen
  von `opacity` und von `--accent` als Textfarbe, nicht von `--ink-soft` selbst.
- **Ebene 1 ist für Screenreader vollständig**: der `.ov-sentence` trägt jede Zahl, die auch
  im Chart steht (gemessen: „…rund 278 € je Viewer und Jahr (P50); Deneb kostet das
  1,3-fache, Core + SVG kostet das 1,7-fache. Ab etwa 82 Viewern…"). 29 Tabulator-Halte,
  keine Sackgasse.
- Genau **eine `<h1>`**, `lang="de"`, exakt **ein** Überschriftensprung auf 53 Überschriften
  (h2 → h4 bei `.opt-card h4` „3rd-Party paid" im Abschnitt „Vorteile, Nachteile und
  versteckte Kosten"; 5 min Aufwand).
- Nur **2 von ~200 Formularfeldern ohne Beschriftung**: `<select id="baseline">`
  („Heutiger Ansatz (Bestand)") und `<select id="tornado-opt">` — beide haben ein verwaistes
  `<label>` darüber, es fehlt nur `for`/`id`. 5 min.
- **Kein einziger JS-Fehler** in allen Durchläufen (Ebenenwechsel, Reset, Share, alle
  P50/P75/P90, alle Details geöffnet, Offline-Betrieb, Druckansicht).

---

## F · Was ich prüfen wollte und nicht konnte

- **Echte Screenreader-Ausgabe.** Ich habe den Chromium-Barrierefreiheitsbaum über CDP
  (`Accessibility.getFullAXTree`) gelesen, nicht NVDA, JAWS oder VoiceOver gehört. Alle Aussagen
  zu „ein Screenreader hört X" sind Schlussfolgerungen aus dem Baum, nicht aus einer Ausgabe.
  Ein Punkt hängt daran: die `<svg role="img">` des Wirkungsgraphen (Zeile 1956) enthält
  27 fokussierbare `role="button"`-Knoten. **In Chromium werden sie trotzdem exponiert**
  (gemessen: `ignored: false`, `ignoredReasons: []`) — `role="img"` auf einem Container mit
  interaktivem Inhalt ist aber ein ARIA-Widerspruch, und NVDA/JAWS fassen `role=img` im
  Lesemodus üblicherweise zu *einer* Grafik zusammen. Das konnte ich hier nicht verifizieren.
  Empfehlung unabhängig davon: am Graph-SVG `role="img"` durch
  `role="group" aria-label="…"` ersetzen (bei den vier statischen Charts darf `role="img"`
  bleiben). **Aufwand: 5 min, Nutzen unsicher bis zum Test mit NVDA.**
- **Echter Windows-Kontrastmodus.** Gemessen mit Chromiums `forcedColors: 'active'`-Emulation.
  Die Emulation entspricht dem Verhalten, ersetzt aber keinen Test auf einem Windows-Gerät.
- **Tatsächlicher Ausdruck.** Gemessen mit `emulateMedia('print')`, nicht mit einem gerenderten
  PDF oder auf Papier. Seitenumbrüche (`break-inside:avoid`) habe ich nicht geprüft.
- **Sprachsteuerung und Schaltersteuerung** (Dragon, Windows Spracherkennung, Switch Access) —
  nicht geprüft.
- **Touch auf echtem Gerät** — die Größen sind gemessen, das Trefferverhalten nicht.
- **Firefox und Safari.** Alles oben ist Chromium. Besonders B2 (Regler-Höhe) und der
  `:focus-visible`-Umgang können sich dort anders verhalten.

---

## G · Reihenfolge fürs Aufräumen

**Vor Version 1.0 (zusammen ca. 3 h):**
A5 (10 min) · B3 (2 min) · B7 (15 min) · B6 (10 min) · A2 (15 min) · A3 (10 min) ·
B1 (20 min) · A4 Punkt 2, die `forced-colors`-Regel (5 min) · D5 (10 min) ·
`<select>`-Labels und h2→h4 (10 min) · Mindestschriftgröße 11 px (15 min) ·
B4 (15 min) · A4 Punkt 1 (40 min).

**Kurz danach (zusammen ca. 3 h):**
A1 (60 min) · B2 (30 min) · B5 (30 min) · B8 (30 min) · B10 (15 min) · B11 (20 min) ·
D1 (20 min).

**Wenn Zeit ist:**
B9 (45 min) · B12 (30 min) · Reflow bei 320 px (20 min) · Umstellung auf `rem` (2 h) ·
Test mit NVDA auf Windows.
