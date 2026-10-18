# Spec · „Mega-Table" — Ausbau des P&L Statement byDatenWG zum IBCS-Table-Visual

Ziel: Das PnL-Visual wird zum spezialisierten IBCS-Statement-/Tabellen-Visual
(Vorbilder: offizielle IBCS-Templates T01–T04 sowie Report-Varianten 12A/12G/12H).
Referenzbilder liegen in `prototype/refs/` (siehe unten).

**Unverhandelbar:**

1. **Der Werttreiberbaum (Tree/DuPont-Ansicht) bleibt unverändert erhalten** —
   er ist ein Alleinstellungsmerkmal. Der Mega-Table ist ein Ausbau der
   Tabellen-Ansicht, kein Ersatz irgendeiner bestehenden Ansicht.
2. **Teal statt IBCS-Grün** (`#0E8585` gut / `#E02B1D` schlecht) bleibt der
   Default — dokumentierte Abweichung für Farbfehlsicht-Tauglichkeit. Der
   vorhandene Farbmodus-Schalter (ibcs/teal) gilt auch für alle neuen Elemente.
3. **Vorgehen: HTML-Prototyp zuerst** (`prototype/megatable.html`), daraus wird
   die Visual-Implementierung abgeleitet. Der Prototyp ist die Design-Quelle
   (Geometrie, Abstände, Notation), nicht Wegwerf-Code: er bleibt im Repo.
4. Rechenkern (`engine.ts`), Vorzeichen-Dreierlogik (SignConvention ·
   DisplayInvert · VarianceInvert), Formelzeilen und Hierarchie werden
   wiederverwendet, nicht dupliziert.

## Notations-Engine (eine Regel, keine Einzelfälle)

Alle Varianz-Elemente folgen zwei orthogonalen Regeln:

- **Minuend (analysiertes Szenario) → Füllung:** AC = voll (ink), FC = schraffiert.
- **Subtrahend (Referenz) → Achse/Kennung:** PY = graue Achse / graue
  Kopf-Unterstreichung, PL = Doppellinien-Achse / doppelte Unterstreichung.

Szenario-Kennung an Spaltenköpfen als Unterstreichung: AC voll dunkel, PY grau,
PL doppelt, FC schraffiert (siehe T01/T03-Köpfe und Summen-Unterstreichungen).

## Phasen

### Phase 1 — Varianz-Spalten-Engine (T03A/B; Basis T01A/B)

- Frei kombinierbarer Spaltensatz: PY | PL | AC oder FC | ΔPY | ΔPY% | ΔPL | ΔPL%.
- %‑Zeilen (Margen, `rowType`): Varianzen als **%p** (Prozentpunkte), kursiv.
- „Δ in red if"-Schwellenwert je Spalte (absolut/%) mit Fußnoten-Zeile wie T01A
  (`Δ in red if: <-20 · <10%`); Werte unterhalb → rote Zahl.
- Kosten-Invertierung über vorhandenes `varianceInvert`.
- Strukturmodus: statt Konten eine Regionen-/Struktur-Hierarchie mit
  Zwischensummen-Blöcken und Leerzeile davor (T01B).

### Phase 2 — Integrierte Zell-Charts (T02A–F)

- Δ-Spalte als Balken, Δ%-Spalte als Pins — beide mit gemeinsamer Nulllinie
  je Block, Achsen-Notation nach Subtrahend (grau = PY, doppelt = PL).
- Balkenfüllung nach Minuend (AC voll / FC schraffiert), gut/schlecht in
  teal/rot; Zahlen außen am Balken (Wachstumsrichtung), `+` immer explizit.
- Ausreißer-Pfeile bei Überlauf (Pfeilspitze + Wert, wie 12A „+983 →").
- Sortierung je Block: Kategorie-Reihenfolge, AC↓ oder Δ↓; Indikator `(↓)` im
  Spaltenkopf (T02B/C).
- EIN gemeinsamer Δ-Maßstab je Block (alle Zeilen), getrennte Maßstäbe je Block.

### Phase 3 — Integrierter Wasserfall (T04A–E)

- Kaskadierende Δ-Spalte: jeder Balken beginnt am Ende des vorigen;
  `=`‑Zeilen (rowType sum/formula) setzen den Anker neu und zeichnen bis zur
  Nulllinie; dünne Verbindungslinien.
- Kombinierbar mit Δ%-Pin-Spalte (Phase 2) daneben.
- Alle vier Szenario-Kombinationen (AC/FC × PY/PL) aus der Notations-Engine.

### Phase 4 — Zwei Perioden-Blöcke (T01/T02-Layout)

- Monat links, YTD rechts (`_November`-Konvention mit Unterstrich-Präfix);
  derselbe Spaltensatz zweimal, getrennte Maßstäbe und eigene Sortierung.
- Spaltenkopf-Zeile über jedem Block („November" / „_November").

### Phase 5 — Volle Wert-Wasserfälle (12A/12G/12H) — Kür

- PY- und AC-Kaskade als eigene Chart-Spalten nebeneinander (12A):
  Wert-Wasserfall je Szenario, Kostenzeilen hell abgesetzt.
- YTD+Restjahr-Stapelung mit Schraffur im selben Balken (12G: `637 ▓ 1 698`).
- Plan-Tönung der Varianzbalken (12H: blasses teal/rot bei PL-Minuend).
- Nachrichten-Headline-Slot oben (12er-Serie) — prüfen, ob `titleBlock` reicht.

## Prototyp (`prototype/megatable.html`)

- Eigenständige HTML-Datei, kein Build; Demo-GuV (T03-Kontenrahmen) +
  Struktur-Demo (T01-Regionen) als eingebettete Daten.
- Umschalter für: Template (T01/T02/T03/T04/12A), Minuend (AC/FC),
  Subtrahend (PY/PL), Sortierung, ein/zwei Blöcke, Farbmodus (teal/ibcs).
- Typografie/Grau-Töne aus dem Visual übernehmen (Segoe UI, #404040-Tinte,
  vorhandene Grau-Palette), damit die Ableitung 1:1 möglich ist.
- Aus dem Prototyp abzuleiten und hier zu dokumentieren: Spaltenbreiten-Logik,
  Balken-Maßstab, Pin-Geometrie, Schwellen-Fußzeile, Kopf-Unterstreichungen.

## Nicht-Ziele

- Keine Änderungen an Tree-, Kachel-, Mikro-Karten-Ansicht.
- Kein zweites Visual; keine Verschmelzung mit ChartKitchen (Abgrenzung siehe
  `../ibcsInspiredChartDeck/BACKLOG.md`).
- ChartKitchens Ad-hoc-Tabelle bleibt unberührt.

## Abgeleitete Maße (aus dem Prototyp)

Quelle: `prototype/megatable.html` (eine Datei, kein Build). Abgeglichen gegen
alle 17 Referenzbilder; die Presets `#ref=T01A` … `#ref=12A` (URL-Hash) stellen
jede Referenz 1:1 nach, inkl. des jeweiligen Datenstands.

### Render-Modell

- **Ein SVG pro Tabelle** (Kopf, Zeilen, Zell-Charts, Fuß). Grund: Kaskaden-
  Verbindungslinien, eine durchgehende Nulllinie je Block-Spalte, Szenario-
  Unterstreichungen und Summenlinien laufen über Zeilengrenzen — als Einzel-SVG
  je HTML-Zelle (Bestand `deltaBarCell`/`deltaPinCell`) müssten sie zerstückelt
  werden. Stil 1:1 wie `waterfall.ts` (`svgEl(tag, attrs)`, kein D3).
- Code dreigeteilt: **Rechenkern** (`computeAll`, `delta`, `cascade` — im Visual
  durch `engine.ts` ersetzt) → **Layout** (`layout()`: nur Zahlen, Spalten x/w,
  Zeilen y, Maßstab k, Achse x0, Kappung) → **Painter** (`paint()`). Für
  Virtualisierung langer Statements bleibt das Layout gleich, der Painter
  zeichnet dann je Chart-Spalte einen hohen SVG-Streifen neben HTML-Zahlen.
- **Keine Template-Sonderfälle im Renderer.** Die Spaltenliste entsteht nur aus
  Schaltern; T01–T04/12A sind Presets dieser Schalter.

### Geometrie (alles aus der Schriftgröße `fs` abgeleitet; Werte bei fs = 13)

| Größe | Formel | fs 13 |
|---|---|---|
| Zeilenhöhe `rowH` | `round(1.7·fs)` | 22 px |
| Leerzeile vor Zwischensummen-Block (T01B, GuV-Gruppen) | `round(0.5·rowH)` | 11 px |
| Kleinschrift (Margen-Zeile, Fußzeile) | `0.85·fs` | 11.1 px |
| Spaltenlücke innerhalb Gruppe | `round(0.5·fs)` | 7 px |
| Gruppenlücke (Werte \| ΔPY \| ΔPL) | `round(1.1·fs)` | 14 px |
| Blocklücke (Monat \| Kategorie \| _YTD) | `round(1.6·fs)` | 21 px |
| Zellen-Innenabstand | `round(0.35·fs)` | 5 px |
| Vorzeichen-Spalte `+ − =` | `round(1.2·fs)` | 16 px |
| Einrückung je Ebene | `fs` | 13 px |
| Balkenhöhe (Δ-Balken, Wasserfall, Wert-Kaskade) | `round(0.62·rowH)` | 14 px |
| Pin-Stiel | fest | 3 px |
| Pin-Kopf (Quadrat, Kante) | `round(0.62·fs)` | 8 px |
| Abstand Balkenende/Pin-Kopf → Zahl | fest | 3 px |
| Ausreißer-Pfeilspitze (Länge) | `round(0.7·fs)`; Höhe = Balkenhöhe + 4 bzw. Pin-Kopf + 2 | 9 px |
| PY-Achse | graue Linie `#B3B3B3` | 3 px |
| PL-Achse | 2 × 1 px Tinte `#404040`, Abstand | 3 px |
| Wert-Kaskade-Nulllinie (12A) | 1 px Tinte | 1 px |
| Kaskaden-Verbindungslinie | 1 px `#8A8886` | 1 px |
| Zeilen-Trennlinie | 1 px `#D9D9D9` je Spalte (Lücken bleiben frei) | 1 px |
| Summenlinie (über `sum`/`formula`-Zeilen) | 1 px Tinte je Spalte; bei Wert-Kaskade durchgehend | 1 px |

**Kopf/Fuß:** Titelblock `3 × round(1.45·fs) + round(1.2·fs)` = 73 px (im Visual:
vorhandener `titleBlock`). Block-Titelzeile („November"/„_November", nur bei
Struktur-/Regionendaten) = `rowH` mit 1-px-Tintenlinie über die Blockbreite.
Spaltenkopf = `rowH`, darunter Szenario-Unterstreichung `markH = 4 px`, dann
`round(0.5·fs)` = 7 px Luft bis zur ersten Zeile → Kopf ohne Blocktitel 33 px,
mit Blocktitel 55 px. Schluss-Unterstreichung (T03) `markH + 4` = 8 px.
Schwellen-Fußzeile = `rowH`, Kleinschrift kursiv `#8A8886`, rechtsbündig unter
den Δ-Zahlenspalten; „Δ in red if:" rechtsbündig in der Spalte davor.

**Kopf-Unterstreichungen (Szenario-Kennung):** AC 4-px-Balken Tinte · PY 4-px-
Balken `#B3B3B3` · PL zwei 1-px-Linien im Abstand 3 px · FC 4-px-Rechteck
schraffiert mit 0.75-px-Kontur. Δ-Spalten, Chart-Spalten und Kategorie-Spalte:
1-px-Tintenlinie auf halber Markenhöhe. GuV-Daten: ΔPY+ΔPY% teilen sich einen
Kopf (rechtsbündig über Δ%, T03); Regionen: getrennte Köpfe (T01).

**Schraffur:** `pattern` 4 × 4 px, `userSpaceOnUse`, `rotate(45)`, weißer Grund,
1.8-px-Strich in der Elementfarbe (identisch zu `hatchPattern()` im Visual);
schraffierte Flächen tragen zusätzlich 1-px-Kontur in derselben Farbe.

### Spaltenbreiten-Logik

1. **Zahlenspalten** (Werte, ΔAbs, Δ%): `max(Kopftext, breiteste formatierte
   Zelle (fett für Summen, kursiv/klein für Margen)) + 2·pad`, mindestens
   `3.2·fs` (42 px). Gemessen mit Canvas `measureText` in der Visual-Schrift.
2. **Kategorie-Spalte:** breitestes Label inkl. Vorzeichen-Spalte und Einrückung
   `+ 2·pad`, mindestens `6·fs`. Bei zwei Blöcken steht sie zwischen den Blöcken.
3. **Chart-Spalten** teilen den Restplatz `frei = Viewport − Σ fest − Σ Lücken`
   nach Gewicht: Balken/Pins 1 · Δ-Wasserfall 1.2 · Wert-Kaskade 1.5; Klemme
   `7·fs … 22·fs` (Wert-Kaskade bis `28·fs`).
4. **Mindest-Datenfläche:** Würde der Maßstab die Datenfläche einer Chart-Spalte
   (ohne Beschriftung) unter `3·fs` = 39 px drücken, wächst die Spalte auf genau
   diese Breite + Beschriftungsbedarf; die Tabelle scrollt dann horizontal statt
   Balken auf 0 zu kollabieren. Ausgeschaltete Spalten hinterlassen keine Lücke —
   die Breiten werden bei jeder Schalter-Kombination neu verteilt.
   **Geteilter Maßstab (1.1):** Die Garantie gilt auch beim Familien-k (unten):
   drückt ein Familien-Partner mit viel größeren Werten (ΔPL-Balken neben
   kleinen ΔPY-Balken, Wasserfall neben Balken) das gemeinsame k unter die
   Mindestfläche einer Spalte, wird k so weit angehoben, wie jede Spalte der
   Familie bis zu ihrer Breitengrenze (`22·fs`, Wert-Kaskade `28·fs`; schon
   breitere behalten ihre Breite) wachsen kann; die bindenden Spalten wachsen.
   Darüber hinaus gewinnt der eine Maßstab — winzige Werte neben 200× größeren
   bleiben kurz (vergleichbare Längen sind der Zweck des gemeinsamen k).

### Balken-/Pin-Maßstab

- **Je Block × Familie EIN Maßstab k** (px pro Einheit): Familien `delta`
  (Δ-Balken + Δ-Wasserfall, ΔPY und ΔPL gemeinsam), `pct` (alle Δ%-Pins),
  `value` (alle Wert-Kaskaden). Monat und _YTD haben getrennte Maßstäbe.
- **Löser:** Jedes Element liefert eine Spanne `[p, q]` in Einheiten plus
  Beschriftungsbedarf links `a` / rechts `c` in px. Gesucht ist das größte k mit
  `max(a − p·k) + max(q·k + c) ≤ Spaltenbreite − 2·pad` (konvex → Bisektion,
  50 Schritte). k der Familie = Minimum der Spalten; nicht bindende Spalten
  zentrieren ihren Überschuss, die Achse liegt bei `x0 = links + Bedarf_links`.
  Die Achsenposition ergibt sich so aus den Daten (überwiegend negativ → Achse
  rechts, wie T02A Monat).
- Gemessene k bei 1320 px Viewport: T02A Monat 1.14 px/kEUR, _YTD 0.45 px/kEUR,
  Pins 3.75 / 5.05 px/%-Pkt.; T04B Wasserfall 9.52 px/kEUR; 12A Wert-Kaskade
  0.25 px/kEUR. (Die Statuszeile im Prototyp zeigt k und Kappung live.)
- **Überlauf-Grenze / Ausreißer:** Tukey-Zaun auf |Werte| der Familie im Block:
  `Zaun = Q3 + 4·(Q3 − Q1)`, ab 8 Werten; Kappung = größter |Wert| ≤ Zaun.
  Gekappte Elemente laufen bis `x0 ± Kappung·k`, dann Pfeilspitze (9 px), keine
  Kopf-Marke; die Zahl steht mit 3-px-Weißhalo auf dem Stiel/Balken vor der
  Spitze (12A „+983 →"). Default: an für Pins, aus für Δ-Balken (Schalter).
  Trifft 12A (+983/+391 gekappt, +95 passt), T02A (+16.5 passt), T04 (+25.6
  passt). T02F kappt im Referenzbild schon bei Sprung 1.35× — bewusst nicht
  nachgebaut (jede Regel, die das trifft, kappt T02A fälschlich).
- **Zahlen außen** in Wachstumsrichtung, `+` immer explizit (Null ohne Vorzeichen),
  Summenzeilen fett, Textfarbe `#1A1A1A` (nicht die Ampelfarbe — wie Referenzen).
  Zahl nie über der Achse: Abstand ab `max(Balkenende, Achse ± Achsenhalbbreite)`.

### Pin-Geometrie

Stiel 3 px in Gut/Schlecht-Farbe von der Achse bis zur Kopfmitte; Kopf 8 × 8 px
Quadrat in Tinte (AC voll, FC schraffiert + 1-px-Kontur); Zahl 3 px hinter der
Kopfkante, ohne „%"-Zeichen (Spaltenkopf trägt „Δ…%"). Wert 0 → Kopf auf der
Achse, Zahl rechts (T02F „0.0").

### Kaskaden (Δ-Wasserfall T04, Wert-Kaskade 12A) — eine Funktion

`cascade(rows, val)`: Schritt-Zeilen beginnen am Lauf-Ende (`val = Wert × eff`,
eff = Wirkungsvorzeichen aufs Ergebnis aus SignConvention entlang des Pfads);
`anchor`-Zeilen (`=`) zeichnen ab 0 und setzen den Lauf neu; Summen ohne Anker
(`− Operating expenses`, im Strukturmodus `Europe` …) spannen vom Lauf-Stand vor
ihrem ersten Kind bis zum aktuellen Stand. Verbindungslinien senkrecht am
gemeinsamen Wert vom Unterrand des vorigen Segments zum Oberrand des nächsten;
Spannen erhalten zusätzlich die Linie von ihrem Startpunkt (lange Linie durch die
Kinderzeilen, T04B). Margen-/Leerzeilen werden übersprungen, die Linie läuft
durch. Beschriftung: Δ-Wasserfall = rohes Δ der Zeile (Kosten +11.12 rot, Balken
nach links), Wert-Kaskade = Anzeigewert. Wert-Kaskade-Füllung je Szenario aus
der Notations-Tabelle, Kostenzeilen hell (PY `#D9D9D9`, AC `#8A8886`).

### Zahlenformat

Tausender-Trenner U+202F (wie `NBSP_GROUP`), Minus als „-". Dezimalen `d` gelten
für Werte/ΔAbs/Margen; Δ%-Zahlen: Regionen `max(1,d)`, GuV `d ≥ 2 ? 1 : 0`;
Pins: GuV mit `d = 0` → 0, sonst `max(1,d)`. Margen-Zeile: Wert `36.7%`,
ΔAbs `+8.6%p`, Δ% als relative Änderung mit Zeichen `+23%` (wie T03A; bis
1.0.1 ohne Zeichen), kursiv/klein — `%p` steht nur an der Punktdifferenz.
Schwellen: rot, wenn `Δ × (Kosten ? −1 : 1) < Schwelle` (Default Monat −20 /
−10 %, _YTD −220 / −10 %; GuV −20 / −10 %). Die Fußzeile druckt die Schwelle
mit den Dezimalen, die sie trägt (`<-20.5`, `<-10.5%`; 1.0 rundete auf 0), der
Rot-Test vergleicht exakt.

### Schalter-Liste → künftige Formatmenü-Toggles (Karte `columns`)

Jeder Schalter ist einzeln wirksam; Templates setzen nur Defaults. Die bestehenden
Einträge `columns.preset` und `columns.reference` werden zur Preset-Auswahl
(T01–T04/12A), danach sind alle Toggles frei. Bereits vorhanden und
wiederverwendet: `numbers.decimals`, `numbers.pctDecimals`, `style.colorMode`.

| Toggle (Prototyp-Key) | Formatmenü-Name (Vorschlag) | Bedeutung |
|---|---|---|
| `min` AC/FC | `columns.minuend` | analysiertes Szenario (Füllung voll/schraffiert) |
| `showPY` | `columns.showPY` | Wertspalte PY |
| `showPL` | `columns.showPL` | Wertspalte PL |
| `showMin` | `columns.showMinuend` | Wertspalte AC bzw. FC |
| `valueWf` | `columns.valueCascade` | Wertspalten als Wert-Kaskade (12A) |
| `dPYnum` / `dPLnum` | `columns.dPyAbs` / `columns.dPlAbs` | Δ als Zahl |
| `dPYbar` / `dPLbar` | `columns.dPyBar` / `columns.dPlBar` | Δ als Balken |
| `dPYwf` / `dPLwf` | `columns.dPyWaterfall` / `columns.dPlWaterfall` | integrierter Δ-Wasserfall (unabhängig vom Balken) |
| `dPYpct` / `dPLpct` | `columns.dPyPct` / `columns.dPlPct` | Δ% als Zahl |
| `dPYpin` / `dPLpin` | `columns.dPyPin` / `columns.dPlPin` | Δ% als Pins |
| `ytd` | `columns.secondBlock` | zweiter Perioden-Block (_YTD) |
| `subtotals` | `columns.structureSubtotals` | Zwischensummen-Blöcke im Strukturmodus (T01B) |
| `margins` | `columns.showPctRows` | Margen-/%-Zeilen |
| `thresholds` | `columns.thresholds` (+ 4 NumUpDown: abs/pct je Block) | rote Δ-Zahlen + Fußzeile „Δ in red if" |
| `marks` | `columns.scenarioMarks` | Szenario-Unterstreichungen in Kopf/Schluss |
| `barLabels` | `columns.chartLabels` | Zahlen an Balken/Pins/Kaskaden |
| `barCap` | `columns.capBars` | Ausreißer-Kappung auch für Δ-Balken (Pins immer) |
| `sort` | `columns.sort` (category / minuend↓ / Δ↓) | Sortierung je Struktur-Gruppe, „Other" bleibt unten |
| `sortBlock` | `columns.sortBlock` (period / ytd) | welcher Block die Reihenfolge bestimmt (Kategorie-Spalte ist geteilt) |
| – (1.1) | `columns.blockKind` / `columns.leftBlockKind` (month / ytd / fy) | Art des Perioden-Blocks bzw. des zweiten Blocks links |
| – (1.1) | `columns.pctOfRevenue` | „% vom Umsatz"-Spalte im Mega-Modus |
| – (1.1) | `columns.exportExpandAll` (Gruppe Tabelle, Default an) | Export rendert alle Zeilen aufgeklappt |
| – (1.1 C) | `columns.minuend` += `pl` | Planrechnung (12H): PL umrandet, Δ-Elemente blass getönt |
| – (1.1 C) | `numbers.fixedMax` / `numbers.fixedVarMax` (Text, k/m/b) | Skalen-Sync: Mindest-Maximum der Familien `valueCascade` / `delta` |
| – (1.1 C) | `titleBlock.headline` | Headline-Slot der 12er-Serie |

Defaults je Preset (✓ = an; nicht genannte Toggles aus; `marks`, `barLabels`
überall an, `barCap` überall aus):

| Preset | min | PY | PL | Min | ValueWf | ΔPY | ΔPL | ytd | subtot. | margins | thresh. | sort | dec |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T01A | AC | ✓ | ✓ | ✓ | – | num+pct | num+pct | ✓ | – | ✓ | ✓ | cat | 0 |
| T01B | AC | ✓ | ✓ | ✓ | – | num+pct | num+pct | ✓ | ✓ | ✓ | ✓ | cat | 0 |
| T02A | AC | – | ✓ | ✓ | – | – | bar+pin | ✓ | ✓ | ✓ | – | cat | 0 |
| T02B | AC | – | ✓ | ✓ | – | – | bar+pin | ✓ | ✓ | ✓ | – | AC↓ (_YTD) | 0 |
| T02C | AC | – | ✓ | ✓ | – | – | bar+pin | ✓ | ✓ | ✓ | – | Δ↓ (Monat) | 0 |
| T02E | FC | ✓ | – | ✓ | – | bar+pin | – | ✓ | ✓ | ✓ | – | Δ↓ (_YTD) | 0 |
| T02F | FC | – | ✓ | ✓ | – | – | bar+pin | ✓ | ✓ | ✓ | – | Δ↓ (_YTD) | 0 |
| T03A | AC | ✓ | ✓ | ✓ | – | num+pct | num+pct | – | – | ✓ | – | – | 1 |
| T03B | FC | ✓ | ✓ | ✓ | – | num+pct | num+pct | – | – | ✓ | – | – | 1 |
| T04A | AC | – | ✓ | ✓ | – | – | bar+pin | – | – | ✓ | – | – | 1 |
| T04B | AC | – | ✓ | ✓ | – | – | wf+pin | – | – | ✓ | – | – | 2 |
| T04C | AC | ✓ | – | ✓ | – | wf+pin | – | – | – | ✓ | – | – | 2 |
| T04D | FC | – | ✓ | ✓ | – | – | wf+pin | – | – | ✓ | – | – | 2 |
| T04E | FC | ✓ | – | ✓ | – | wf+pin | – | – | – | ✓ | – | – | 2 |
| 12A | AC | ✓ | – | ✓ | ✓ | bar+pin | – | – | – | – | – | – | 0 |
| 12G | AC (Block FY → AC&FC) | ✓ | – | ✓ | ✓ | bar+pin | – | – | – | ✓ | – | – | 0 |
| 12H | PL | ✓ | – | ✓ (= PL) | ✓ | bar+pin | – | – | – | – | – | – | 0 |

12G setzt zusätzlich `blockKind = fy`, 12G/12H setzen `titleBlock.headline = an`
(alle anderen Templates: `blockKind = ytd`, Headline unangetastet).

Aus den Daten abgeleitete Stil-Flags (kein Schalter): Vorzeichen-Spalte und
gepaarter Δ-Kopf nur bei GuV-Daten; Block-Titelzeile nur bei Struktur-Daten;
Schluss-Unterstreichung nur GuV ohne Chart-Spalten (T03); bei Wert-Kaskade keine
grauen Zeilenlinien, durchgehende Summenlinien, keine Kopf-Linien (12A).

### Bewusst offen / Abweichungen

- **12G/12H** (YTD+Restjahr-Stapel, Plan-Tönung) nicht im Prototyp; seit 1.1
  Paket C im Visual (Abschnitt unten). Der Headline-Slot (`titleBlock.headline`)
  nimmt die eigene Botschaft oder den autoMessage-Generator aus Paket B.
- GuV hat keinen _YTD-Block (Demo-Daten nur Jahr); der Block-Schalter wirkt nur
  bei Strukturdaten.
- Referenz-Inkonsistenzen werden nicht nachgebaut: Summen rechnet der Kern
  (T03A AC-Ergebnis 422.2 statt 422.3; ΔPY Group result +186.2 statt der im Bild
  doppelt gedruckten +162.5; 12H-PL-Operating-result 346 statt 329).
- **T01A/T01B _YTD-ΔPY-Dezimale:** Die Referenzen drucken die ΔPY-Zahlen des
  _November-Blocks mit einer Dezimale (`+431.0`, `-274.0`, `+7.0`; T01B `+80.0`,
  `-127.0`), die ΔPL-Spalte desselben Blocks und der Monatsblock ganzzahlig.
  Das Visual hat EINE Dezimalregel je Tabelle (`numbers.decimals`, T01-Preset 0)
  und druckt `+431` — in sich inkonsistente Mischdezimalen werden nicht
  nachgebaut (keine Dezimalen je Block/Spalte).
- **T02F-Früh-Kappung:** Das Referenzbild kappt zwei Δ%-Pins (Japan −27.3 im
  Monat, Other +26.1 im _November) schon beim Sprung 1.35×. Der Tukey-Zaun
  (Q3 + 4·IQR, ab 8 Werten; siehe „Balken-/Pin-Maßstab") schlägt dort nicht an,
  beide Pins werden voll gezeichnet — jede Regel, die T02F kappt, kappte T02A
  `+16.5` fälschlich. Ein manueller Kappungswert je Block ist nicht vorgesehen.
- **T04C/T04E Financial-income-Pin:** Die Referenzblätter drucken für
  „Financial income, net" (Δ −7.00 = −9.59 %) einen grünen Pin nach rechts mit
  `+9.59` — im Widerspruch zum roten Δ-Balken derselben Zeile. Das Visual
  zeichnet vorzeichenrichtig `-9.59` als roten Pin nach links.
- **12A-Mehrfach-Pfeilspitzen:** Die Referenz staffelt die Pfeilspitzen gekappter
  Werte nach Überlauf (`+983` mit drei Spitzen, `+391` mit einer; 12G `+1 633`
  mit zwei). Prototyp und Visual zeichnen immer genau eine Spitze (9 px) — der
  Wert steht ohnehin als Zahl am Element.
- Sortierung „je Block" ist bei geteilter Kategorie-Spalte nur über einen Block
  möglich (`sortBlock`); Indikator `(↓)` steht am sortierenden Spaltenkopf. Ist
  diese Spalte ausgeschaltet (sort = min ohne Wertspalte AC/FC, sort = Δ ohne
  Δ-Zahl/-Balken/-Wasserfall der Referenz), bleibt die Sortierung wie gewählt
  und der Indikator wandert an den Kopf der Kategorie-Spalte mit Schlüssel und
  Block: `(↓) ΔPL November` (1.1; bis 1.0.1 fehlte er dann ganz). Bewusst kein
  stilles Umschalten auf eine sichtbare Spalte: Δ% ordnet anders als Δ, die
  Reihenfolge wäre eine, die niemand eingestellt hat.

### Empfehlungen für die Visual-Ableitung

1. **Rechenkern:** `computeAll`/`delta` → `buildModel` + `variance()` aus
   `engine.ts`; die %p-Logik der Margen-Zeilen (rowType `kpi`) und das
   Wirkungsvorzeichen `eff` (Produkt von SignConvention entlang des Pfads) als
   kleine Ergänzungen in `engine.ts`, nicht im Painter. Gut/schlecht weiter über
   `varianceInvert`, Anzeige über `displayInvert`.
2. **Kaskade:** `cascade()` entspricht `cascadeSegments()` im Visual /
   `waterfall.ts` (Anker bei Formelzeilen, Kinder kaskadieren im Elternsegment) —
   eine gemeinsame Funktion in `waterfall.ts` exportieren, die Δ- und
   Wert-Kaskade (Zeile statt Säule) bedient.
3. **Notation:** `notation(minuend, subtrahend)` ersetzt die verstreuten
   `drawAxis`/`hatchPattern`/`treeScenFill`-Sonderfälle; `hatchPattern()` und die
   Farbkonstanten `C` bleiben.
4. **Layout-Löser** (`solveK`, Tukey-Kappung, Breitenverteilung) als reines Modul
   (`megatable-layout.ts`) ohne DOM außer Textmessung — unit-testbar gegen die
   im Prototyp gemessenen k-Werte.
5. Tree-, Kachel- und Mikro-Karten-Ansicht bleiben unberührt; der Mega-Table ist
   ein Modus der Tabellen-Ansicht.

## Umsetzungsstand im Visual (Phase 1 + 2 + 3)

Code: `src/megatable.ts` (Layout + Painter, kein Power-BI-Import), Datenseite in
`src/visual.ts` (`buildMega`, `megaRows`, `megaToggles`, `syncMegaTemplate`),
Rechenkern-Ergänzung in `src/engine.ts` (`varianceOf`, `displayVariance`).

- **Aktivierung:** Der Mega-Table ist ein Modus der Tabellen-Ansicht. Er ist an,
  sobald mindestens ein Spalten-Schalter (`showPY/showPL/showMinuend`,
  `dPy*/dPl*`) an ist; alle stehen per Default aus → die klassische Tabelle
  rendert unverändert (Pixel-Regression byte-identisch). In Balken-, Waterfall-
  und Baum-Ansicht ändert sich nichts (seit 1.0.1 auch mit gewähltem Template:
  der Mega-Modus gilt nur in der Tabellen-Ansicht, `megaInView()`). Im Mega-Modus blendet die Toolbar
  Spalten-Preset, Δ-Referenz, Perioden und Fit aus (Spalten kommen aus dem
  Formatbereich); Ansicht, Einheit, Dichte, Ebenen und „Nullzeilen aus" bleiben.
- **Formatbereich:** `columns` ist jetzt eine Composite-Karte mit den Gruppen
  „Allgemein" (alle bisherigen Schalter, Namen unverändert) und „Mega-Table".
  Abweichend vom Vorschlag oben werden `columns.preset`/`reference` NICHT
  umgewidmet (sie bleiben die Presets der klassischen Tabelle); die
  Template-Wahl ist das neue Dropdown `columns.template` (off · T01A · T01B ·
  T02A · T02B · T02C · T02E · T02F · T03A · T03B · T04A · T04B · T04C · T04D ·
  T04E · 12A). Phase 3 ergänzt die Schalter `dPyWaterfall`/`dPlWaterfall`
  (integrierter Δ-Wasserfall) und `valueCascade` (Wert-Kaskaden, 12A).
- **Template-Persistenz:** Wählt der Autor ein Template, schreibt das Visual
  alle Schalter des Presets plus `numbers.decimals/pctDecimals` und das
  versteckte `columns.templateApplied` in EINEM `persistProperties`-Merge und
  setzt die Slices sofort lokal. Echo-Guard mit TTL 5 (Muster aus ChartKitchen):
  veraltete Updates halten die geschriebenen Werte, nach Ablauf gewinnt der
  Pane wieder; ein Session-Guard verhindert ein Re-Apply in Schleife, wenn das
  Echo verloren geht. Danach sind alle Schalter frei. „off" schaltet alle
  Spalten aus und lässt das Zahlenformat unangetastet.
- **Perioden-Blöcke:** aus der vorhandenen Perioden-Logik abgeleitet (keine
  neue YTD-Logik nötig): Monat = letzter Monat mit AC-Daten (`mtdIndex`), YTD =
  periodengleiches Fenster bis dorthin (`ytdRawSum`, bei vollständigen Ist-Daten
  der Engine-Wert). Ein Block → YTD-Fenster; `secondBlock` → Monat | _YTD
  (Titel „November" / „_November", lange Monatsnamen der Locale). Ohne
  Perioden-Rolle gibt es nur den einen Block.
- **Daten-Art:** GuV-Daten (Formel-/KPI-Zeilen, Vorzeichen −1 oder
  DisplayInvert vorhanden) bekommen Vorzeichen-Spalte und gepaarten Δ-Kopf;
  sonst Strukturdaten (Block-Titelzeile, Sortierung, `structureSubtotals`).
- **Zeilenfolge:** Kinder zuerst, Summe darunter (IBCS). Vorzeichen-Spalte:
  Formelzeilen und der Kettenstart (erste Top-Level-Summe) „=", deren Summanden
  „+"/„−" nach DisplayInvert auf Ebene 0, tiefere Blöcke eingerückt ohne
  Zeichen (T03 „− Operating expenses"). Leerzeile vor einem neuen Block nach
  einer fetten Summe und vor der Gesamtsumme nach Zwischensummen-Blöcken.
  Ohne `structureSubtotals` werden doppelte Blattnamen um den Elternnamen
  ergänzt („Other Europe", T01A).
- **Anzeige-Orientierung:** Δ/Δ% folgen den angezeigten Werten (Kosten
  +37.4 = rot), gut/schlecht weiter aus Vorzeichen + VarianceInvert; Schwellen
  vergleichen das Δ in Gut-Richtung (`impact`) in Anzeige-Einheiten (nach
  k/m-Skalierung). Prozent-Schwellen im Pane als ganze Prozent (−10).
- **Kopf fixiert:** Kopf (Blocktitel, Spaltenköpfe, Marken) und Körper sind ein
  Koordinatensystem, am Achsenbeginn in zwei SVGs geschnitten; der Kopf klebt
  unter dem Titelblock (Style → Kopfbereich fixieren). Alle zeilenübergreifenden
  Linien liegen im Körper.
- **Interaktion:** Klick auf das Label einer Summe klappt den Block (▸ am
  gefalteten Label), Klick auf die Zeile setzt die Power-BI-Selektion,
  Rechtsklick öffnet das Kontextmenü; Kommentar-Marker ① und Fußnoten wie bisher.
- **Zahl auf dem Achsenband (1.0.1):** Kaskaden-Beschriftungen, deren Box das
  Achsenband schneidet (T04B „+5.79"), bekommen denselben Papier-Kasten — die Achse
  pausiert hinter der Zahl; alle anderen Beschriftungen bleiben unverändert.
- **Ausreißer-Zahl:** zusätzlich zum Weißhalo ein schmaler Papier-Kasten hinter
  der Zahl auf dem Stiel (sonst schneidet der 3-px-Stiel die Ziffern).
- **Schrift:** fs 13 (Dichte normal) bzw. 11 (kompakt) × Schriftgrößen-Preset.

### Phase 3 — integrierter Δ-Wasserfall (T04B–E) + Wert-Kaskaden (12A)

- **Eine Kaskaden-Funktion:** `cascade(roots, container)` in `src/waterfall.ts`
  rechnet die Segmente `{s, e, type: anchor | step | span}` für alle drei
  Verbraucher: die Säulen-Brücke `renderWaterfall` und die Zeilen-Waterfall-
  Ansicht des Visuals (`cascadeSegments`, Modus `"value"`: Eltern zuerst,
  Kinder kaskadieren im Elternsegment, verschachtelte Formeln ohne Segment) und
  den Mega-Table (`megaCascade`, Modus `"span"`: IBCS-Reihenfolge Kinder →
  Summe, die Summe spannt vom Lauf vor ihrem ersten Kind bis nach dem letzten;
  eine gefaltete Summe ohne sichtbares Kind ist ein normaler Schritt).
  Parität: Zufallsbaum-Test gegen die alte `cascadeSegments`-Implementierung
  (5 000 Bäume, bitgleiche s/e) + Pixel-Regression p2 und `test:waterfall`.
- **Wirkungsvorzeichen:** `MegaRow.eff` = DisplayInvert × SignConvention der
  Zwischensummen darüber (`megaParentSign`, wie `aggregateSubtotal` rollt) — ein
  als +600 angezeigter Kostenblock läuft −600. `MegaRow.anchor`: Formelzeilen,
  „="-Kettenstart, die einzige Gesamtsumme einer Strukturhierarchie (World).
- **Δ-Wasserfall** (`wf`, je Referenz): Segment = Δ × eff, Beschriftung =
  angezeigtes Δ (Kosten +11.12 rot, Balken nach links), Füllung/Achse aus
  `notation()` (AC voll · FC schraffiert × PY grau · PL doppelt), Familie
  `delta` (gemeinsamer Maßstab mit Δ-Balken desselben Blocks), Breitengewicht
  1.2. Verbindungslinien 1 px `#8A8886` am gemeinsamen Wert, Spannen zusätzlich
  ab ihrem Startpunkt. Frei kombinierbar mit Δ-Balken/-Zahl/-Pins.
- **Wert-Kaskade** (`vwf`, je angezeigtem Szenario eine Spalte in eigener
  Gruppe): Füllung `notation().value(scen, Kosten)` (PY `#B3B3B3`/hell
  `#D9D9D9`, AC Tinte/hell `#8A8886`, FC schraffiert, PL Kontur), Achse 1 px
  Tinte, Familie `valueCascade` (ein Maßstab für alle Szenarien eines Blocks),
  Gewicht 1.5, Klemme bis `28·fs`. Stil 12A: keine grauen Zeilenlinien,
  durchgehende Summenlinien, keine Kopf-Linien.
- **Presets:** T04B (ΔPL wf+pin), T04C (ΔPY wf+pin, PY statt PL), T04D/E (FC),
  je Dezimalen 2 / Δ% 2; 12A (PY+AC Wert-Kaskaden, ΔPY bar+pin, ohne
  Margen-Zeilen, Dezimalen 0 / 0). Template-Echo-Guard unverändert.

Tests: `npm run test:mega` (Layout-Unit-Tests ohne DOM inkl. Kaskaden-Parität,
Render-Fälle m1–m16 gegen die Referenzwerte, Template-/Echo-Guard-/
Interaktions-Test inkl. T04B/12A); `npm run test:waterfall`; Engine-Tests für
`varianceOf`/`displayVariance`.

Offen (Stand 1.0): Phase 4 ist mit dem Monat | _YTD-Block weitgehend vorweggenommen;
Phase 5 (12G YTD+Restjahr-Stapel, 12H Plan-Tönung, Headline-Slot) und die
Virtualisierung sehr langer Statements kamen mit 1.1 Paket C (siehe unten).
Wasserfall-Beschriftungen links eines Schritts dürfen wie
in den Referenzen (T04B „+5.79") die Nulllinie kreuzen.

### Stand 1.1 · Paket A (Konformitäts-Fixes)

- **Margen-Zeilen:** relative Δ% mit `%` (`+23%`, T03A/B), `%p` nur an der
  Punktdifferenz (siehe „Zahlenformat").
- **Kopf-Schriftgröße:** `style.headerFontSize` wirkt jetzt auch auf Spaltenköpfe
  und Block-Titel des Mega-Tables (Faktor `v / 9` auf `fs`; 0 bzw. außerhalb
  7…20 = `fs`, unverändert). Kopfzeilen wachsen mit (`round(1.7·headFs)`),
  Spaltenbreiten messen den Kopf in seiner Schrift; der Körper bleibt gleich.
- **Legende:** zeigt im Mega-Modus nur die Szenarien, die die Spalten zeigen
  (Wertspalten, Minuend jedes Δ-Elements, aktive Δ-Referenzen — T02F: PL + FC);
  die Achsen-Notiz nennt nur Referenzen mit echter Δ-Achse („grau = PY",
  „Doppellinie = PL"; FC ist im Mega-Table nie Achse) und entfällt ohne
  Chart-Spalte. Klassische Ansichten unverändert.
- **Sortier-Indikator / Mindest-Datenfläche / Schwellen-Fußzeile:** siehe oben.
- **Hochkontrast** (`colorPalette.isHighContrast`, nur solange der Mega-Table
  sichtbar ist — klassische Tabelle, Balken, Wasserfall und Baum unverändert):
  `MEGA_C` und `C` auf `foreground` / `background`, Auswahl-Linie
  `foregroundSelected` (ohne Wash). Muster statt Farbe (ChartKitchen-HC-Pfad):
  gut = Minuend-Füllung (voll / schraffiert), schlecht = hohl (Hintergrund +
  1.4-px-Kontur) für Δ-Balken, Wasserfall-Schritte, Pin-Köpfe und Pfeile; rote
  Schwellenzahlen unterstrichen; PY-Kopfmarke als gestricheltes Band, PY-Wert-
  Kaskade gestrichelt hohl; Legenden-Chips entsprechend; Teal-Hinweis entfällt.
- **Export** (`allowInteractions = false`, PDF/PowerPoint/Abo): keine Toolbar
  (die Legende bleibt — sie erklärt die Notation); mit `columns.exportExpandAll`
  (Gruppe „Tabelle", Default an) rendern Mega- und klassische Tabelle alle
  Zeilen aufgeklappt, ohne den gespeicherten Klapp-Zustand zu ändern. Der
  Werttreiberbaum behält seinen eigenen Klapp-Zustand.
- **Perioden-Blöcke:** `columns.blockKind` (Perioden-Block: Monat · YTD · FY,
  Default YTD) und `columns.leftBlockKind` (zweiter Block links, nur mit
  `secondBlock`, Default Monat). Defaults = bisher (YTD bzw. Monat | _YTD).
  FY-Ausblick: Minuend = AC&FC (`fcFy`, Kopf „AC&FC"), PL = `plFy`, kein PY
  (ΔPY-Spalten bleiben dort leer); Titel „FY 2026". Ein einzelner Monats- oder
  FY-Block zeigt seinen Titel auch bei GuV-Daten. Nicht verfügbare Arten (ohne
  Perioden-Feld / FY-Maße) fallen auf YTD bzw. Monat zurück. Templates setzen
  beide zurück (YTD / Monat).
- **% vom Umsatz:** `columns.pctOfRevenue` (Mega-Gruppe, Default aus): Spalte
  „% Rev" direkt rechts der Wertspalten je Block (bei Wert-Kaskaden eigene
  Gruppe), Anteil des Minuenden an der Umsatz-Basiszeile (`columns.revenueBase`)
  desselben Blocks, `numbers.pctDecimals`, rechtsbündig, kursiv, klein, grau;
  keine Werte in Margen-Zeilen.

Tests: `test/megatable-test.js` (Layout: Kopf-Schrift, Indikator-Fallback,
Familien-Mindestspanne inkl. Grenze, % Rev, FY-Alias, HC-Palette/Unterstreichung,
Schwellen-Dezimalen), `test/mega-shot.js` m17–m26 (Export, HC, Kopf-Schrift,
FY/Monat-Blöcke, % Rev, Indikator, Fußzeile) + Legenden-Checks an m1/m7/m15,
`test/start-dark-test.js` (Pane-Gates der neuen Schalter).

### Stand 1.1 · Paket B (Finance-Features, ChartKitchen-Familie)

Property-Namen wie im ChartKitchen, wo es ein Pendant gibt. Alles Neue steht per
Default aus bzw. verhaltensgleich — Pixel-Regression aller 40 Fälle von
`test/test.html` (p1–p14, m1–m26) gegen 1.0.1 + Paket A byte-identisch.

- **Tooltips** (`capabilities.tooltips` default + canvas): Zeilen, Zellen,
  Balken, Pins und Kaskaden der klassischen Tabelle (auch Balken-/Wasserfall-
  Ansicht) und des Mega-Tables zeigen über `host.tooltipService` Zeilenname,
  die gebundenen Szenarien des Blocks (mit Einheit), Δ je Referenz absolut + %
  (Mega-Table: dessen Minuend und Referenzen in Anzeige-Orientierung, %p für
  Margen; klassisch: Δ zur Toolbar-Referenz wie die Balken), den Wesentlichkeits-
  Hinweis, den Kommentar (mit ①) und die Selektions-Kappung. Die `title`-
  Attribute der Datenzeilen (Kommentar-Marker, Selektions-Hinweis, SVG-`<title>`
  im Mega-Table) entfallen. Dark Mode: eigener Kasten nach ChartKitchen
  `showDarkTip` (#2B2B2B, Kantenerkennung, folgt dem Scroll der Wurzel), hell
  bleibt nativ. Der Werttreiberbaum behält seine SVG-Titel (Struktur unangetastet).
- **Σ-treue Rundung** `numbers.sumSafeRounding` (Default **aus** wie im
  ChartKitchen): Restwertverfahren entlang der Hierarchie (`engine.sumSafeRound`,
  top-down): Wurzeln runden normal, die beitragenden Kinder (Konten/Zwischen-
  summen) teilen die gedruckte Summe nach größtem Rest — SignConvention des
  Elternknotens inklusive — und geben ihren gedruckten Wert an ihre Kinder
  weiter. Wirkt auf die Wertspalten der klassischen Tabelle und des Mega-Tables
  (auch Wert-Kaskaden-Beschriftungen) je Block; die Δ-Zahl ist dann die
  Differenz der gedruckten Werte (Δ% bleibt exakt). **Formel-, Margen- und
  Trennzeilen sind ausgenommen** (exakte Rundung; eine Formelzeile ist keine
  Summe ihrer Hierarchie-Kinder) und beginnen unter sich eine neue Verteilung.
  Ist ein Elternwert nicht die Summe seiner Kinder (Eigenwert-Fallback), wird
  nicht verteilt.
- **Klammern-Negativ** `numbers.financeFormat` (Default aus): −1 234 → (1 234),
  Einheit in der Klammer ((12.5%), (8.6%p)); exakte Null „–“, eine gerundete
  Null bleibt „0.0“. **Δ behält die Vorzeichenlogik wie im ChartKitchen**
  (`fmtSigned`): positive Δ tragen „+“, negative stehen in Klammern ohne Minus.
  Gilt für alle Zahlenspalten, Balken-/Pin-/Kaskaden-Beschriftungen, Tooltips
  und den Baum. Die Schwellen-Fußzeile („<-20“) ist eine Regel, keine Zahl, und
  bleibt unverändert.
- **Mrd.** `numbers.scaling` += `b` (÷ 10⁹, Suffix „b“); Auto wählt b ab
  50 Mrd. (k/m-Schwellen unverändert). Toolbar-Knopf „bEUR“ nur, wenn Auto b
  wählen würde oder der Pane b gesetzt hat.
- **Hausbegriffe** — Karte `labels` (`labelAc/labelPy/labelPl/labelFc`, leer =
  Kürzel): ersetzen ganze Szenario-Kürzel (nicht in PLAN, EBITDA …) in Toolbar
  (Presets, Referenz, Szenario-Gruppe), Legende (der ganze Eintrag „AC actual“ →
  „Ist“) inkl. Achsen-Notiz, klassischen Spalten- und Blockköpfen, Mega-Köpfen
  inkl. Sortier-Indikator und `AC&FC`, Tooltips, generierter Titelzeile, Auto-
  Botschaft und Filter-Fußzeile. Autorentexte (Titelzeilen, Fußzeile) bleiben.
- **Titelblock:** `titleBlock.autoMessage` (aus): ohne eigene Botschaft eine
  generierte Zeile „<Ergebniszeile> Δ<Ref> +x EUR (+y%) · stärkster Treiber: …
  · schwächster: …“ — Ergebniszeile = letzte Formelzeile der obersten Ebene,
  sonst die einzige Wurzel, sonst die Gesamtsumme; Treiber = Blatt-Konten nach
  Wirkung (günstig ↑ / ungünstig ↓), YTD-Fenster; Mega-Table: dessen Minuend +
  erste Referenz in Anzeige-Orientierung. `titleBlock.footer` (Freitext) und
  `titleBlock.filterFooter` + neue optionale Textrolle **`filterInfo`** (max 1,
  Measure): zweite Fußzeile „Filter: <filterInfo> · Nullzeilen ausgeblendet ·
  <Szenario-Sicht des Lesers>“ über dem IBCS-Hinweis, in allen Ansichten und im
  Export; leere Zeilen entfallen; beide Felder nur bei `titleBlock.show`.
- **Hervorheben** `columns.highlight` (Kommaliste von Zeilennamen oder IDs,
  ohne Groß-/Kleinschreibung): ChartKitchen-`emphBand` — Tinte zu 7 % über alle
  Zellen der Zeile (klassisch) bzw. über die volle Tabellenbreite (Mega-Table);
  Dark = dunkle Tinte, Hochkontrast = 1-px-Rahmen in `foreground` ohne Fläche.
  Die Selektions-Wäsche liegt darüber.
- **Wesentlichkeit** `columns.materialityAbs` (Dateneinheiten **vor** k/m-
  Skalierung, wie ChartKitchen) / `materialityPct` (ganze %), 0 = aus; sind
  beide gesetzt, muss ein Δ beide überschreiten. Unterhalb: Δ-Balken, Pins,
  Wasserfall-Stufen und Δ-Zahlen in `soft` (#8A8886, dunkel #A6A6A6); eine rote
  „Δ in red if“-Zahl bleibt rot (explizite Regel gewinnt); Margenzeilen (%p)
  sind ausgenommen; im Hochkontrast keine hohle „schlecht“-Form. Keine Zeilen-
  Faltung. **`exceptionOnly` bewusst nicht umgesetzt:** eine Sammelzeile müsste
  in Kaskaden, Sortierung, Kommentar-Nummerierung, Selektions-IDs und Σ-treuer
  Rundung als synthetische Zeile mitlaufen — das ist ohne Risiko für die
  Baum-/Hierarchie-Logik nicht machbar (Backlog).
- **Toolbar-Gruppe „Szenario“** (`toolbar.showScenario`, Default aus, nur
  Mega-Modus): „Szenario“ AC / FC (nur mit gebundenem FC) und „Referenz-Sicht“
  ΔPY · ΔPL · beide. Die Referenz-Sicht verschiebt die vom Autor gewählten
  Δ-Elemente (Vereinigung über PY und PL: Zahl, Balken, Wasserfall, Δ%, Pins)
  und eine PY/PL-Wertspalte auf die gewählte(n) Referenz(en). Zustand in
  `UiState.megaMin/megaRef` (Echo-Guard des Toolbar-Zustands); ein Knopf ohne
  Wirkung ist gesperrt + gedimmt (Paket-A-Muster). Ändert der Autor Minuend
  bzw. die Δ-/Wertschalter im Pane, endet die Leser-Sicht (zurück auf „“).
- **emptyState** (Karte `emptyState`, `title`/`body`, leer = Standard): ersetzt
  „Keine Daten für die aktuelle Auswahl.“ und — nur im Lesemodus — die
  Feld-Anleitung der Landing-Page; der Bearbeitungsmodus behält Smart Start /
  Anleitung.
- **Tastatur** (`supportsKeyboardFocus: true`): Toolbar-Knöpfe sind native
  `<button>` mit `aria-pressed`; Aufklapp-Zeilen (Namenszelle klassisch,
  Label-Trefferfläche im Mega-Table) tragen `tabindex=0`, `role=button`,
  `aria-expanded`, `aria-label` und klappen mit Enter / Leertaste. Fokus-Ring
  nur bei Tastatur-Fokus (`:focus-visible`): 2 px Akzent als Outline (HTML)
  bzw. Kontur (SVG), Hochkontrast `foregroundSelected`.

Tests: `test/engine-test.js` (`largestRemainder`, `sumSafeRound` inkl.
Zufallsbäume), `test/megatable-test.js` (Finance-Format, Hausbegriffe in Köpfen,
Wesentlichkeit vs. Schwelle), `test/finance-test.js` (F1–F11 im Browser +
Capabilities, Screenshots `test/finance-*.png`), `test/start-dark-test.js`
(Kartenreihenfolge, Pane-Gates der neuen Felder).

### Stand 1.0.0.0

Phase 1–4 sind Teil von 1.0. Dazu im 1.0-Paket: alle Schalter und Template-Namen
in vier Sprachen, Sichtbarkeits-Gates im Formatmenü (Mega-Gruppe nur in der
Tabellen-Ansicht, ΔPY/ΔPL nur mit gebundenem PY/PL, Schwellen-Felder nur bei
`thresholds`, YTD-Schwellen nur mit `secondBlock` …) und die Dunkel-Palette
(`MEGA_C` ist live, `setMegaPalette()`; die Tonwerte der Wert-Kaskade sind
Paletten-Keys statt Literale). **Auf 1.1 verschoben:** Phase 5 (12G, 12H,
Headline-Slot) und die Virtualisierung sehr langer Mega-Tabellen.

### Stand 1.1 · Paket C (12G · 12H · Headline · Skalen-Sync · Blau/Orange · Virtualisierung)

Alles Neue per Default aus bzw. verhaltensgleich — Pixel-Regression der 40 Fälle
p1–p14 / m1–m26 gegen 1.1 Paket A+B byte-identisch (PNG und innerHTML je Stage).

- **Notations-Engine erweitert, keine Sonderfälle:** `SCENARIO_NOTATION` trägt je
  Szenario zusätzlich `area` — die Füllung der Δ-Elemente, wenn es Minuend ist:
  AC `solid`, FC `hatch`, **PL `tint`** (Gut/Schlecht-Farbe zu 72 % mit dem
  Papier gemischt, `megaTint`, 1-px-Tintenkontur; auf dunklem Papier ergibt
  dieselbe Mischung das Dark-Pendant; Hochkontrast: voll, keine Mitteltöne).
  `notation(minuend, subtrahend, hc)` liefert sie über `area()`; Δ-Balken und
  Wasserfall-Stufen lesen nur noch `area()`. Pin-Köpfe folgen weiter der
  Szenario-Füllung (`fill`: PL umrandet). Kostenzeilen einer umrandeten
  PL-Wert-Kaskade liegen auf blassem Grund (`outlineLight` #F2F2F2 / dunkel
  #2A2A2A, 12H).
- **Minuend PL (12H):** `MegaMin = AC | FC | PL`; `activeRefs()` und
  `buildColumns()` lassen die Referenz = Minuend weg (kein ΔPL gegen sich selbst),
  `showPL` + `showMinuend` ergeben EINE PL-Spalte. Pane: `columns.minuend` += `pl`
  (sichtbar mit FC- oder PL-Feld).
- **Notation je Block:** `MegaBlock.minFill` ersetzt den Minuenden nur für die
  Δ-Füllung eines Blocks (`MegaLayout.NB[block]`). Der FY-Ausblock setzt bei
  Minuend AC `minFill = FC`: AC&FC ist überwiegend Forecast → Δ-Balken, Pins und
  Wasserfall-Stufen schraffiert (12G). Kopf-Marken bleiben beim Szenario.
- **12G-Stapel:** `MegaBlock.ytd(r)` (Anzeigewert AC YTD) setzt der FY-Block bei
  Minuend AC. Die Minuend-Wert-Kaskade dieses Blocks wird `stack`: ab dem
  Segment-Start YTD voll (`value("AC")`), danach bis zum Segment-Ende das Restjahr
  schraffiert (`value("FC")`), Kostenzeilen hell wie bisher; die YTD-Zahl steht
  zentriert im vollen Teil in Papierfarbe, wenn sie mit 3 px Rand passt, die
  Jahreszahl außen wie jede Kaskade. Zwei Köpfe: „YTD" links, Alias „AC&FC" rechts
  (Spalte mindestens so breit wie beide). PY im FY-Block = ganzes Vorjahr
  (`computed.py`, wie der klassische FY-Block) → ΔPY bezieht sich aufs Jahr. Die
  Legende nennt FC, sobald im FY-Block schraffiert wird.
- **Headline-Slot** `titleBlock.headline` (Default aus): Titelblock als Zeile —
  drei Titelzeilen links, Botschaft 17 px (× Schriftfaktor) normal daneben, 1-px-
  Linie darunter (12er-Layout, umbricht bei schmalen Visuals). Text = eigene
  `message`, sonst der autoMessage-Generator (auch ohne `autoMessage`); die fette
  Botschaftszeile über dem Titel entfällt dann. Der Generator spricht bei
  FY-Layout über das Jahr (Minuend/Referenz des Blocks). Templates 12G/12H
  schalten ihn im selben Persist-Merge an (Echo-Guard deckt `titleBlock` ab).
- **Skalen-Sync** `numbers.fixedMax` / `fixedVarMax` (Text, `parseAmount`: k/m/b,
  Komma; leer/ungültig/≤ 0 = automatisch; Dateneinheiten): Phantom-Elemente im
  Löser — Wert-Kaskaden `[0, max]`, Δ-Balken und Δ-Wasserfälle `±max`, jeweils mit
  Beschriftungsbedarf der fetten max-Zahl. ChartKitchen-Semantik „Mindest-
  Maximum": größere Daten weiten die Skala weiter; Pins bleiben aus dem Sync.
  Klassisch: einheitlicher Δ-Maßstab = max(Daten, fixedVarMax) (Skalennotiz folgt),
  Wert-/Kaskadenbalken der Balken- und Waterfall-Ansicht mit fixedMax. Fußnote
  „Skala fixiert: Werte ≥ … · Δ ≥ ±…" nur im Bearbeitungsmodus, nie im Export.
- **Blau/Orange** `style.variancePreset` (auto · teal · ibcs · blueOrange,
  Default auto = folgt `style.colorMode`; ein gesetzter Wert übersteuert ihn und
  blendet colorMode im Pane aus). ColorBrewer #2C7BB6 / #E66101, dunkel
  #5BA3DC / #F0821E (wie ChartKitchen). Legenden- und Fußzeilen-Hinweis nennen
  Blau/Orange statt Teal; Picker `goodColor`/`badColor` übersteuern weiterhin.
- **Virtualisierung:** Ab `MEGA_VIRT_MIN_ROWS = 150` Zeilen (nicht im Export)
  zeichnet `paintMega(…, {window})` nur die Zeilen `[from, to)` um den Viewport
  (+30 Puffer); das Layout bleibt vollständig, Körper-SVG behält seine Höhe,
  Achsen laufen durch, Kaskaden folgen dem Lauf über alle Zeilen und zeichnen
  Verbindungslinien, die das Fenster kreuzen. Scroll → `syncMegaWindow()` zeichnet
  den Körper neu, sobald die sichtbaren Zeilen das gemalte Fenster verlassen, und
  bindet Selektion, Falten, Tastatur und Tooltips neu. Unterhalb der Schwelle
  wird kein Fenster übergeben — Ausgabe exakt wie 1.0 (Beweis: Pixel-Regression +
  `test/mega-perf.js`: Fenster über alle Zeilen = byte-identisch zum Malen ohne
  Fenster).

Tests: `test/megatable-test.js` (Presets 12G/12H, PL-Minuend, Tönung inkl. Dark/HC,
Stapel + zwei Köpfe, `parseAmount`, Skalen-Sync), `test/mega-shot.js` m27–m31
(12G, 12H, 12H dunkel + Blau/Orange, Skalen-Sync inkl. klassisch, Virtualisierung),
`test/mega-interact.js` Schritt 11 (12G/12H-Persistenz + Echo-Guard + Headline),
`test/start-dark-test.js` (Pane-Gates), `test/mega-perf.js` (2 000 Konten:
Erstzeichnung, Scroll-Neuzeichnung, Selektion/Falten/Tooltip nach Scroll,
Identität).

### Stand 1.2 · Ease of Use (was den Mega-Table berührt)

- **Template-Auswahl in der Toolbar** (`toolbar.showTemplate`, Default an, nur
  wenn der Host `viewMode` ≥ 1 meldet, nur Ansicht Tabelle): ein `<select>` mit
  den lokalisierten Einträgen von `columns.template`. Die Auswahl läuft über
  `applyMegaTemplate(tpl, picked = true)`: `template` reist im selben Merge wie
  `templateApplied` und die Schalter. Er steht auch in `megaPending.cols`, damit
  ein veraltetes Update weder das Dropdown noch die Schalter zurückspringen
  lässt.
- **Leser-Wertspalten** (`toolbar.showValues`, Default aus): Die Gruppe
  „Wertspalten" setzt `uiState.megaVals = { min, py, pl }`. `megaReaderView`
  legt das als letzte Schicht auf die Pane-Schalter und die Referenz-Sicht
  (`showMin`/`showPY`/`showPL`; ungebundenes PY/PL bleibt aus). Gesperrt ist,
  was die Spalten nicht ändert oder `megaActive` auf false setzen würde. Der
  Mega-Table fällt also nie per Klick in die klassische Tabelle zurück. Eine
  Pane-Änderung von `showPY`/`showPL`/`showMinuend` setzt `megaVals` zurück
  (`syncPaneDefaults`, Schlüssel `megaVals`). FC als eigene Wertspalte gibt es
  im Mega-Table weiterhin nur als Minuend (Bewusst offen).
- **Spalten-Kategorie** (`colCategory`, neue Rolle): Der Mega-Table ignoriert
  sie. Im Bearbeitungsmodus steht ein Hinweis unter der Tabelle
  (`data-pnl="cat-note"`). Eine Kategorie-Achse im Mega-Layout (Block je
  Kategorie) wäre der nächste Ausbau.
- Pane: Die Gruppe `columnsMega` (Template zuerst) ist jetzt die erste Gruppe
  der Karte `columns`. Reine Reihenfolge, keine Property ändert sich.

Tests: `test/toolbar-interact.js` I (Template-Auswahl) und J
(Mega-Wertspalten), `test/ease-interact.js` P (Pane) und C (Mega ignoriert die
Kategorie). Pixel-Regression: m1–m31 byte-identisch zu 1.1.

### Stand 1.3 · Start-Hub und Template-Bedienung (was den Mega-Table berührt)

- **Schalter-Satz eines Templates** liegt in `src/hub.ts` (`templateSwitches`),
  `applyMegaTemplate` liest ihn; Pane-Dropdown, Toolbar-Dropdown, Galerie und
  „↺ Zum Template zurück" schreiben also dieselben Werte (Test: `hub-test.js`).
- **Galerie** (`columns.template` pro Kachel): jede Kachel ist eine nicht-
  interaktive, verkleinerte Visual-Instanz mit den Schaltern des Presets über der
  Demo (`renderMini`, FC-Templates mit simuliertem FC = AC × 1,02). Mini-Größe
  1100 × 640 px natürlich, per CSS-Transform skaliert.
- **Wiederanwenden:** unbedingter Write; ein bereits gewähltes Template wird über
  Galerie-Klick oder „↺" erneut geschrieben (Echo-Guard `megaPending` wie bei
  jeder Auswahl). Abweichung = ein Schalter der Spalten-Karte oder die Headline
  weicht vom Preset ab; Dezimalstellen zählen nicht.
- Pixel-Regression: m1–m31 byte-identisch zu 1.2.
