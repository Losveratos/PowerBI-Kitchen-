# Format-Analyse · Scrollytelling-Referenz `rhein-story.html`

> Analysiert für den Bau der **Strommix-Story** im selben Stil.
> Quelle: `origin/main:rhein-story.html` (952 KB), live unter
> `https://datenwgknowledgekitchen.com/rhein-story.html`.
> Analysiert via Code-Lektüre (Kapitel-für-Kapitel, CSS-Block, JS-Architektur)
> und Playwright-Screenshots bei 0/25/50/75/100 % Scroll-Tiefe (1440×900).
>
> Ziel dieses Dokuments: einem zweiten Agenten die Story-Mechanik so präzise
> zu geben, dass er die Strommix-Story bauen kann, ohne `rhein-story.html`
> selbst nochmal komplett lesen zu müssen.

---

## 1 · Dramaturgie

Die Story ist ein **Sechs-Akte-Essay mit Scrollytelling-Kern**, gerahmt von
klassischer Prosa vorn (Hook) und hinten (Ehrlichkeits-Sektion, Grenzen,
Glossar). Gesamtlänge: ~24.000 px Scroll-Höhe bei 1440×900 (grob 27
Bildschirmhöhen).

**Ablauf (in Erzähl-Reihenfolge, nicht in Code-Reihenfolge):**

1. **Hero** — Vollbild, zentriert, ruhige SVG-Hintergrundwelle. Titel als
   These/Antithese-Paar ("209 Jahre, ein Fluss, zwei Wahrheiten"), ein
   Subtext, der die Spannung explizit benennt ("Beides stimmt."), 4
   Meta-Zahlen als Eyebrow-Leiste (Monospace), scroll-Indikator unten.
2. **Prolog** (Prosa-Block) — Formuliert den Streit zweier Lager in 3
   Sätzen, kündigt "sechs Akte" an. Kein Chart.
3. **Akt 1–6** — je ein `<section class="scrolly">` mit sticky Chart links/
   rechts und 3–4 gestaffelten Text-"Steps" darunter/daneben. Jeder Akt hat
   ein klares Ein-Satz-Learning pro Step, das sich beim Scrollen mit dem
   Chart-Zustand synchron verändert (Chart-Elemente faden ein/aus, Balken
   wachsen, Linien zeichnen sich).
   - Akt 1 "Das Rauschen" → Rohdaten wirken chaotisch, Jahresmittel zeigt
     keinen Trend (Setup: "die Skeptiker haben recht? Moment.")
   - Akt 2 "Die Ordnung" → Verteilung der Tageswerte (Histogramm), Mittel ≠
     Median (Zwischenschritt zur Methodik)
   - Akt 3–6 (Monatstrends, Verschiebung, Multiplikation an den Rändern) →
     das eigentliche Signal wird sukzenzive freigelegt, jeder Akt baut auf
     dem vorigen "Moment, aber..." auf
   - Zwischen den Akten: kurze Prosa-"Zwischenrufe" (1 `<h2>` + 1–2 Sätze)
     und `<aside class="kasten">`-Boxen mit konkreten Fallbeispielen/Fotos
     (siehe Abschnitt 3).
4. **Epilog "Rekord-Watch"** — ein Bild-loses, `record-fig`-Chart als
   ruhiger Ausklang der Kernthese (pulsierender Marker auf dem Extremwert).
5. **Gegenprobe "Was diese Daten *nicht* sagen"** — bewusste Selbstkritik,
   5 `.limit-card`s mit Einschränkungen der Methode. Erzeugt Vertrauen durch
   Transparenz, nicht durch Behauptung.
6. **Appendix "Methoden & Glossar"** — 8 `<details class="gloss">`-Blöcke,
   referenziert von Inline-Links (`a.gl` → `#gl-xxx`) im Fließtext. Jeder
   Fachbegriff im Haupttext ist verlinkt, mit funktionierendem Hin-und-
   Zurück-Sprung (siehe Abschnitt 2).
7. **Footer** — Datenquelle, Lizenzhinweis, Methodik-Kurzfassung, Kontakt.

**Wie Zahlen erzählt werden:**
- Immer im Fließtext eingebettet, nie als reine Statistik-Tabelle im
  Haupttext (Tabellen existieren, aber hinter `<details>` versteckt als
  A11y-/Nachprüf-Zwilling).
- Große Zahlen fett + Monospace-Zwischenwerte inline im Prosa-Satz
  (`<span class="big">p = 0,83</span>`), nicht als separate Stat-Kacheln.
- p-Werte, Signifikanz und Grenzen der Aussage werden *immer* mitgeliefert
  ("statistisch nicht von Null zu unterscheiden") — die Story argumentiert
  wissenschaftlich ehrlich, nicht reißerisch.
- Jeder Akt endet mit einem Cliffhanger-Satz, der zum nächsten Akt überleitet
  ("Aber nur im Jahresmittel." / "Genau deshalb ist der Jahresmittelwert das
  falsche Suchbild — dazu gleich mehr.").

**Textblock-Länge:**
- Step-Card: 1 `<h3>` (3–6 Wörter) + 1–2 `<p>` à 2–3 Sätze (~40–70 Wörter
  gesamt). Nie länger — die Karte ist bewusst knapp, das Chart trägt die
  Hauptlast.
- Prosa-Sections (`.prose`): 2–4 Absätze, `.lede` (erster Absatz, größere
  Schrift) fasst die Kernaussage zusammen.
- Kasten-Boxen: 1 Kicker-Zeile + 1–2 Absätze + optional Bild + Quelle.

**Ende der Story:** Kein "Fazit"-Abschnitt im klassischen Sinn — die
Ehrlichkeits-Sektion ("Was diese Daten nicht sagen") *ist* der Schluss vor
dem Appendix. Die Story endet nicht mit einer Behauptung, sondern mit ihren
eigenen Grenzen. Footer trägt die Attribution.

---

## 2 · Scroll-Mechanik

**Sticky-Layout (Kernmuster jedes Akts):**
```
<section class="scrolly" data-act="N">
  <div class="graphic">          <!-- sticky, volle Höhe -->
    <div class="fig" id="gN" data-step="-1">
      <svg id="svgN" ...></svg>
      <div class="fig-title">…</div>
    </div>
  </div>
  <div class="steps">            <!-- scrollt normal durch -->
    <div class="step" data-idx="0"><div class="step-card">…</div></div>
    <div class="step" data-idx="1"><div class="step-card">…</div></div>
    <div class="step" data-idx="2"><div class="step-card">…</div></div>
  </div>
</section>
```
- Mobil (< 1020 px): Grafik oben `position:sticky; top:0; height:100svh`,
  Text-Karten scrollen darunter durch (kein Grid, einfacher Block-Flow).
- Desktop (≥ 1020 px): CSS-Grid mit 2 Spalten, `.graphic` in Spalte 2
  (`grid-area:1/2`), `.steps` in Spalte 1 (`grid-area:1/1`) — Text links,
  Chart rechts, beide im selben Grid-Track übereinandergelegt, damit die
  Grafik beim Scrollen der Steps stehen bleibt.

**State-Maschine pro Akt:** `data-step` auf dem `.fig`-Container (`-1` =
noch nicht gestartet, `0..n` = aktueller Step-Index). CSS-Selektoren wie
`#g1[data-step="1"] .noise{opacity:.14}` schalten Chart-Elemente je nach
Step um — **die gesamte Animation läuft über CSS-Transitions, getriggert
durch einen einzigen Attribut-Wechsel**, nicht durch JS-Animationsschleifen.

**IntersectionObserver-Logik (zentral, ein Observer für alle Akte):**
```js
const ACTS = {1:act1, 2:act2, 3:act3, 4:act4, 5:act5, 7:act7};
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const step = e.target;
    const act = step.closest(".scrolly").dataset.act;
    const idx = +step.dataset.idx;
    step.parentElement.querySelectorAll(".step")
      .forEach(s=>s.classList.toggle("is-active", s===step));
    ACTS[act].step(idx);          // ruft die Chart-Update-Funktion des Akts
  });
}, {rootMargin:"-42% 0px -42% 0px"});
document.querySelectorAll(".step").forEach(s=>io.observe(s));
```
- `rootMargin:"-42% 0px -42% 0px"` erzeugt ein schmales Aktivierungsband
  in der vertikalen Bildschirmmitte — ein Step gilt erst als "aktiv", wenn
  er nah an der Mitte des Viewports ist. Das ist der Trick für sauberes
  Scrollytelling-Timing ohne `scroll`-Event-Polling.
- Jeder Akt exportiert ein Objekt `{ step(i) {…} }` — `step(i)` setzt nur
  `dataset.step = i` auf dem Grafik-Container plus ggf. einmalige
  Reveal-Trigger (z. B. Pfad-Zeichnen beim ersten Erreichen).
- Zweiter, separater IntersectionObserver pro `.scrolly`-Section sorgt
  dafür, dass die erste Szene auch sichtbar wird, wenn der Nutzer direkt
  in den Akt hineinspringt (Anchor-Link, schnelles Scrollen), statt leer
  zu bleiben, bis Step 0 "offiziell" erreicht wird.

**Animationen (rein CSS, per Klassen-/Attribut-Toggle):**
- **Linien zeichnen sich**: `path.draw{transition:stroke-dashoffset 2.4s …}`
  + JS setzt `stroke-dasharray`/`-dashoffset` = Pfadlänge beim Setup
  (`prepDraw()`), dann `stroke-dashoffset:0` beim Reveal.
- **Balken wachsen**: `transform:scaleY(0)→scaleY(1)` mit
  `transform-origin:bottom` (positive Werte) bzw. `top` (negative Werte),
  `transform-box:fill-box`.
- **Fade-ins**: einfache `opacity`-Transitions, gesteuert über
  `[data-step="n"]`-Attribut-Selektoren in CSS (kein JS-Animate).
- **Punkte poppen ein**: `transform:scale(.2)→scale(1)` mit
  `cubic-bezier(.2,.9,.3,1.4)` (leichtes Überschwingen) beim
  Klassen-Toggle `.on`.
- **Pulsierender Marker** (Epilog): `@keyframes pulse` (opacity + scale),
  endlos, für den einen hervorgehobenen Rekord-Punkt.
- **Kein echtes Parallax** — nur das sticky-Chart-Muster erzeugt den
  Eindruck von Tiefe (Text zieht über stehendes Chart hinweg).
- `@media (prefers-reduced-motion:reduce)` schaltet global alle
  Animationen/Transitions aus und setzt Pfade sofort auf Endzustand.

**Progress-Anzeige:** Es gibt **keine explizite Fortschrittsleiste/Prozent-
anzeige**. "Progress" wird ausschließlich implizit über die Step-Card-
Nummerierung (`Akt 1 / Schritt 2`) und den aktiven Zustand (`.is-active`,
Kartenopazität) vermittelt.

**Hover/Tooltip:** Ein einziges globales `#tip`-Element (`position:fixed`),
von jedem Chart per `mousemove`/`mouseleave` befüllt und positioniert
(`showTip(html, x, y)` / `hideTip()`). Kein Tooltip-Div pro Chart.

**Glossar-Sprungnavigation:** Klick auf `a.gl` merkt sich die Quell-Anker-ID
(`lastRef`), öffnet das Ziel-`<details>` (`target.open = true`) und springt
mit `scrollIntoView`. Ab einer Distanz von 3 Viewport-Höhen wird `behavior:
"instant"` statt `"smooth"` verwendet (sonst dauert das globale
`html{scroll-behavior:smooth}` bei so langen Seiten mehrere Sekunden). Ein
`a.gl-back`-Link am Glossareintrag springt zur zuletzt referenzierenden
Textstelle zurück (oder zum Seitenanfang, falls noch nichts geklickt wurde
— dafür `.is-idle`-Klasse als visueller Hinweis).

---

## 3 · Visuelle Sprache

**Farbwelt (Dark-Mode-only, kein Light-Theme):**
```css
--bg:#0d0d0d;          /* Seiten-Hintergrund, fast schwarz */
--surface:#1a1a19;     /* Chart-Flächen-Hintergrund */
--ink:#ffffff;         /* Haupttext, Überschriften */
--ink-2:#c3c2b7;       /* Fließtext (warmes Off-White) */
--muted:#898781;       /* sekundär/Meta */
--muted-chart:#a3a19a; /* Chart-Achsenbeschriftung */
--grid:#2c2c2a;        /* Gitterlinien */
--axis:#383835;        /* Achsenlinien */
--blue:#3987e5;        /* Haupt-Akzent: "positiv"/aktuell/nass */
--blue-soft:#86b6ef;   /* Akzent hell: Eyebrows, Kicker, Links */
--red:#e66767;         /* Kontrast-Akzent: "negativ"/Defizit/Warnung */
--card:rgba(20,21,23,.82); /* Step-Card-Hintergrund, mit backdrop-blur */
--ring:rgba(255,255,255,.14); /* dünne Rahmen überall */
```
Prinzip: **eine** Akzentfarbe (Blau) für die Hauptaussage, **eine**
Kontrastfarbe (Rot) für die Gegenthese/den Bruch — nie mehr als diese zwei
Akzente gleichzeitig in einem Chart. `.kicker.dry` / `.kasten.dry` sind die
Rot-Varianten der Standard-Blau-Elemente (semantisches Klassen-Suffix
`.dry` = "die andere Wahrheit").

**Typografie:**
- Sans (Fließtext, Überschriften): `"Segoe UI", system-ui, -apple-system,
  Arial, sans-serif` — **kein Google-Font**, nur System-Font-Stack.
- Mono (Kicker, Eyebrows, Zahlen, Chart-Text, Tags): `"JetBrains Mono"`
  (einziger via Google Fonts geladener Font: `wght@400;600`).
- Größenskala: H1 `clamp(34px,6.5vw,74px)` fett (750) · H2
  `clamp(26px,3.4vw,36px)` (700) · Step-H3 `21px` (700) · Fließtext `16px`
  Body / `14.5px` in Step-Cards · Kicker/Eyebrow `11–12px` Mono, Uppercase,
  `letter-spacing:.2–.26em`.
- Durchgängig `letter-spacing:-.015em` auf großen fetten Headlines (enger,
  "gedrucktes Magazin"-Gefühl), Mono-Text dagegen extra weit getrackt
  (Kicker) — bewusster Kontrast eng/weit.

**Chart-Typen** (alle als handgebautes inline-SVG via `document.createElementNS`,
keine Chart-Library):
- Liniendiagramm mit Rausch-Overlay + geglätteter Trendlinie + Trendgerade
  (Akt 1)
- Histogramm mit Median-/Mittel-Markierungen (Akt 2)
- Vorher/Nachher-Liniendiagramm mit Differenzband (Akt 3)
- Divergierendes Balkendiagramm (positiv/negativ vom Nullpunkt, Akt 4)
- Verteilungskurven-Vergleich zwei Epochen + Schwellenwert-Linie (Akt 5)
- Scatter/Matrix-Kombination mit Schwellen-Überschreitungs-Dots, die
  „einrasten" (Akt 6)
- Bullet-artiges Erwartet-vs-Gezählt-Diagramm mit Kreisen (Gegenprobe)
- Alles einheitlich im 1060×600-Koordinatenraum (`viewBox`), Margins
  `{t:70,r:40,b:52,l:78}` als globale Konstante `M`.

**Bild-/Illustrationseinsatz:** Sehr sparsam und gezielt — nur 3 Fotos in
der ganzen Story, jeweils in einer `<aside class="kasten">`-Box als
konkretes historisches Beispiel (Hochwasser 1993/95, Niedrigwasser 2018,
Südbrücken-Pfeiler 2026), nie als Dekoration. Jedes Bild hat `alt`-Text,
`loading="lazy"`, eine `<figcaption>` mit Bildquelle/Lizenz und einen
separaten `.kasten-quelle`-Datenquellenhinweis. **Alle Charts sind SVG,
keine Bilder.**

**Dark/Light:** Ausschließlich Dark. Keine `prefers-color-scheme`-Behandlung,
keine Theme-Umschaltung — bewusste Stilentscheidung für diese Story
(passt zur "seriöses Datenmagazin bei Nacht"-Anmutung).

**Formsprache:** Durchgehend **eckig** (`border-radius:0` auf Karten,
Kästen, Charts) — die einzige bewusste Ausnahme ist die pillenförmige
"Zurück"-Navigation (`border-radius:999px`), damit sie sich klar als
Navigations-Element vom Inhalt abhebt (im CSS explizit kommentiert).

---

## 4 · Technik-Gerüst

### Kopierbares HTML-Muster für eine Akt-Section
```html
<section class="scrolly" data-act="2">
  <div class="graphic">
    <div class="fig" id="g2" data-step="-1">
      <svg id="svg2" viewBox="0 0 1060 600" role="img"
           aria-label="Kurzbeschreibung des Charts für Screenreader"></svg>
      <div class="fig-title">
        <div class="t">Akt 2 · Kurztitel</div>
        <div class="s">Datenbasis · Einheit · Zusatzinfo</div>
      </div>
    </div>
  </div>
  <div class="steps">
    <div class="step" data-idx="0"><div class="step-card">
      <span class="n">Akt 2 / Schritt 1</span>
      <h3>Kurze Kern-Aussage</h3>
      <p>1–2 Sätze, die die Kern-Aussage belegen.
      <span class="big">Zahl mit Einheit</span> als Blickfang.</p>
    </div></div>
    <div class="step" data-idx="1">…</div>
  </div>
</section>
```

### Kopierbares JS-Muster für einen Akt (IIFE, gibt `{step(i)}` zurück)
```js
const actN = (function(){
  const svg = document.getElementById("svgN");
  const g = el("g", {}, svg);
  const x = lin(xMin, xMax, M.l, W-M.r);   // Skalen via lin()-Helper
  const y = lin(yMin, yMax, H-M.b, M.t+30);

  yAxis(g, y, [0, 2000, 4000], "Einheit");
  // … Achsen, statische Elemente, Pfade aus DATA.xyz bauen …

  const line = el("path", {d: pathFrom(pts), class:"annual"}, g);
  prepDraw(line);                          // Stroke-Dash für Zeichen-Animation vorbereiten

  return {
    step(i){
      document.getElementById("gN").dataset.step = i;   // triggert alle CSS-Regeln #gN[data-step="i"]
      if (i>=0 && !started){ started = true; reveal(line); }
    }
  };
})();
```
Anschließend in `ACTS = {…, N: actN}` eintragen. Der zentrale
IntersectionObserver braucht keine Änderung.

### CSS-Klassen-System (wiederverwendbare Bausteine, 1:1 übernehmbar)
| Klasse | Zweck |
|---|---|
| `.hero`, `.hero-inner`, `.hero-eyebrow`, `.hero-meta` | Vollbild-Intro |
| `.prose`, `.kicker`, `.lede` | Reiner Textabschnitt zwischen Akten |
| `.scrolly`, `.graphic`, `.fig`, `.fig-title`, `.steps`, `.step`, `.step-card` | Scrollytelling-Grundgerüst |
| `.step-card .n/.big/.pos/.neg` | Step-Meta, hervorgehobene Zahl, Positiv/Negativ-Einfärbung |
| `.kasten`, `.kasten.dry`, `.kasten-kicker`, `.kasten-quelle` | Lokale Fallbeispiel-Box mit optionalem Foto |
| `.record-wrap`, `.record-fig`, `.pulse` | Ruhiger Epilog-Chart mit pulsierendem Marker |
| `.limits`, `.limit-card` | Grenzen-Karten-Grid am Schluss |
| `details.tbl` | A11y-Tabellen-Zwilling zu jedem Chart (versteckt, aufklappbar) |
| `details.gloss`, `.gloss-body`, `.gloss-formula`, `a.gl`, `a.gl-back` | Appendix-Glossar mit Hin-/Rückverlinkung |
| `#tip` | Ein globales Tooltip-Element für alle Charts |
| `.home-pill` | Zurück-Link zur Startseite |

### JS-Architektur (Gesamtbild)
1. **Helpers** (`el`, `txt`, `pathFrom`, `prepDraw`/`reveal`/`unreveal`,
   `lin`, `fmt`, `showTip`/`hideTip`, `yAxis`) — generische SVG-Bau- und
   Skalierungs-Werkzeuge, unabhängig von den Story-Inhalten.
2. **`const DATA = {…}`** — ein einziges großes, zur Build-Zeit
   vorberechnetes JSON-Objekt (siehe Abschnitt 5) direkt im `<script>`.
   Keine Fetch-Requests, keine externen Datendateien — alles inline.
3. **Pro Akt eine IIFE** (`const actN = (function(){ … return {step(i){}} })()`),
   die beim Laden der Seite einmalig das SVG aufbaut (Achsen, Pfade,
   Hover-Handler) und ein `step(i)`-Interface für den Observer bereitstellt.
4. **Tabellen-Befüllung** — eine weitere IIFE befüllt die versteckten
   `<details class="tbl">`-Tabellen aus `DATA`.
5. **Scroll-Steuerung** — der zentrale `IntersectionObserver` (Abschnitt 2)
   ganz am Ende, verknüpft `.step`-Elemente mit den Akt-Objekten.
6. **Glossar-Navigation** — letzte IIFE, unabhängig vom Rest.

Keine Frameworks, kein Build-Step zur Laufzeit, keine externen JS-Libraries
— eine einzige `.html`-Datei, vollständig self-contained bis auf den
Google-Fonts-Link.

### Mobile-Verhalten
- Breakpoint bei `1020px` (Grid → Block-Flow, siehe Abschnitt 2).
- Zweiter Breakpoint bei `760px`: SVG-Text wird pauschal vergrößert
  (`font-size`-Bump für Lesbarkeit auf kleinen Screens, mit gezielten
  Ausnahmen pro Chart, wo der Bump zu Kollisionen führen würde — im CSS
  dokumentiert).
- `.fig-title` wechselt von `position:absolute` (Desktop, über dem Chart)
  zu einem normalen Block-Element *vor* dem SVG (`order:-1` via Flex),
  weil die absolute Position auf schmalen Viewports mit Chart-Inhalten
  kollidiert.
- `.home-pill` wird kompakter (kleinere Schrift/Padding).

---

## 5 · Was die Dateigröße treibt

Analyse von `rhein-story.html` (951.057 Bytes):

| Anteil | Bytes | % | Quelle |
|---|---|---|---|
| 3 inline Base64-JPEGs | 772.809 | **81,3 %** | `<img src="data:image/jpeg;base64,…">` in den `.kasten`-Boxen |
| `const DATA = {…}`-Blob | 84.647 | 8,9 % | vorberechnete Kennzahlen + fertige SVG-Pfad-Strings (`paths.noise`, `paths.hero`, …) |
| Rest (HTML/CSS/JS-Logik) | 93.601 | 9,8 % | Markup, Styles, Chart-Aufbau-Code |

**Wichtigste Erkenntnis: Nicht die Daten sind das Problem, sondern die
eingebetteten Fotos.** Die 76.397 Tageswerte werden *nicht* roh eingebettet
— `DATA` enthält ausschließlich bereits aggregierte Jahres-/Monatswerte
(209 Einträge `annual`, Histogramm-Bins, Top-50-Listen) plus fertig
gerenderte SVG-Pfad-Strings für das Rausch-Overlay. Das ist bereits die
richtige Strategie (Build-Zeit-Aggregation statt Rohdaten im Client) — nur
die 3 Fotos wurden unkomprimiert/hochauflösend als Base64 eingebettet und
dominieren die Dateigröße um den Faktor 8.

**Empfehlungen für die Strommix-Story:**
1. **Keine Fotos einbetten**, oder wenn doch (z. B. ein Kraftwerksbild in
   einem `.kasten`), dann vorab hart auf ~600–800 px Breite und
   JPEG-Qualität ~60–70 komprimieren (jedes Bild sollte < 40 KB Base64
   bleiben — bei 3 Bildern wie im Original macht das den Unterschied
   zwischen 950 KB und ~150 KB Gesamtgröße).
2. **DATA-Blob nach demselben Muster aufbauen**: Aggregation (Jahres-/
   Monats-/Szenario-Kennzahlen, ggf. SMARD-Stundenprofile für einen
   Reference-Tag oder Boxplot-Quantile statt 8.760 Rohstunden) zur
   Build-Zeit in Python/JS vorberechnen, nicht im Browser aus Rohdaten
   neu rechnen. Ziel: DATA-Blob deutlich unter 100 KB, wie im Original.
3. Falls Diagramme mit sehr vielen Punkten nötig sind (z. B. 8.760-Stunden-
   Dispatch-Kurve), lieber **downsamplen** (z. B. Tagesmittel + Min/Max-Band
   statt Stundenwerte) oder als vorgerenderten SVG-Pfad-String einbetten
   (wie `DATA.paths.noise` im Original) statt als Punktarray, das der
   Client erst zu einem Pfad zusammenbauen muss.
4. Realistisches Zielbudget für die Strommix-Story: **150–300 KB** total,
   solange auf Fotos verzichtet oder stark komprimiert wird — das
   Original zeigt, dass das Story-Gerüst selbst (HTML+CSS+JS) nur ~94 KB
   braucht.

---

## 6 · Übertragbarkeits-Empfehlung

**1:1 kopierbar (technisches Skelett, inhaltsunabhängig):**
- Alle Helper-Funktionen (`el`, `txt`, `pathFrom`, `prepDraw`/`reveal`/
  `unreveal`, `lin`, `fmt`, `showTip`/`hideTip`, `yAxis`, die `M`/`W`/`H`-
  Konstanten).
- Der zentrale `IntersectionObserver`-Block samt `rootMargin:"-42% 0px
  -42% 0px"`-Trick und dem zweiten "erste Szene sichtbar machen"-Observer.
- Das komplette CSS-Grundgerüst: `.hero*`, `.prose`, `.scrolly/.graphic/
  .fig/.steps/.step/.step-card` inkl. der beiden Breakpoints (1020px,
  760px), `.kasten*`, `.limits/.limit-card`, `details.tbl`, `details.gloss*`
  + `a.gl/a.gl-back`, `#tip`, `.home-pill`, `@media (prefers-reduced-motion)`.
- Die Glossar-Navigation-IIFE (Hin-/Rücksprung-Logik) unverändert.
- Das Farbsystem als *Struktur* (bg/surface/ink/ink-2/muted/grid/axis/card/
  ring + genau 2 Akzentfarben) — nur die konkreten Hex-Werte für den
  Strommix-Kontext anpassen (z. B. Grün/Gelb für erneuerbar vs. fossil
  statt Blau/Rot für nass/trocken — CLAUDE.md-Bucket-Konventionen dieses
  Repos beachten, falls die Story später in `daten_wg_learn_buckets.html`
  verlinkt wird).
- Fonts: Segoe-UI-Systemstack + JetBrains Mono unverändert übernehmen,
  passt zum bestehenden Daten-WG-Corporate-Design.

**Neu bauen (inhaltsabhängig):**
- Alle 6 (oder N) Akt-IIFEs selbst — jede zeichnet ein anderes
  Chart-Layout (Histogramm, divergierende Balken, Vergleichskurven …).
  Das *Muster* (IIFE → `{step(i)}`, `data-step`-CSS-Kopplung) wird
  übernommen, der SVG-Bau-Code pro Akt ist komplett neu.
- Der `DATA`-Blob: eigene Struktur passend zum Strommix-Modell (LCOE-Werte,
  Mix-Szenarien, Dispatch-Kennzahlen — siehe `docs/02_modellkonzept.md`
  dieses Repos). Empfehlung: Python-Skript, das die Recherche-/Modell-
  Ergebnisse zu genau den Aggregaten vorrechnet, die die Charts brauchen,
  und als kompaktes JSON in die HTML schreibt (gleiches Prinzip wie
  `DATA.annual`/`DATA.paths` hier).
- Die Dramaturgie/Story-Bögen (Akt-Titel, Cliffhanger-Sätze, Kasten-
  Fallbeispiele) — inhaltlich komplett neu, aber im **gleichen
  Erzählmuster**: These → Rauschen/Komplexität zeigen → Ordnung
  herstellen → Signal isolieren → Gegenprobe/Ehrlichkeit → Grenzen
  offenlegen → Glossar zum Nachprüfen.
- Bildmaterial (falls gewünscht: Kraftwerk/Netz-Fotos) — neu beschaffen,
  aber Abschnitt 5 der Größen-Empfehlung beachten (klein & komprimiert).
- `data-act`-IDs sauber sequentiell vergeben (im Original historisch
  gewachsen: `id="g5"` gehört zu "Akt 6", `id="g7"` zu "Akt 5" — das war
  vermutlich eine spätere Umsortierung der Akt-Reihenfolge ohne
  Id-Refactoring. Für die Strommix-Story von Anfang an `id="actN"` /
  `data-act="N"` synchron halten, um diese Verwirrung zu vermeiden).

**Offene Entscheidung für den bauenden Agenten:** Wie viele Akte die
Strommix-Story braucht, hängt vom Modellkonzept aus
`docs/02_modellkonzept.md` ab (LCOE → Mix-Kosten → Dispatch als
natürliche Drei-Ebenen-Struktur, ggf. auf 5–6 Akte im Rhein-Stil
aufgefächert). Sollte mit dem Menschen kurz abgestimmt werden, bevor die
Akt-Gliederung festgelegt wird — analog zur bestehenden CLAUDE.md-Regel
"bei Unklarheit fragen, statt zu raten".

---

## Referenzen

- Analysierte Datei: `rhein-story.html` (Kopie in
  `/tmp/.../scratchpad/rhein-story.html`, identisch zu
  `origin/main:rhein-story.html`)
- Screenshots (0/25/50/75/100 % Scroll, 1440×900, Chromium via Playwright):
  `rhein_00.png` … `rhein_100.png` im selben Scratchpad-Verzeichnis
  (temporär, nicht Teil des Repos)
- Bezug im Modellkonzept dieses Projekts: `strommix/docs/02_modellkonzept.md`
  (Drei-Ebenen-Modell LCOE/Mix/Dispatch als möglicher Akt-Bauplan)
