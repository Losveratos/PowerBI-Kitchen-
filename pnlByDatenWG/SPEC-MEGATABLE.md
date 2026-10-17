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
ΔAbs `+8.6%p`, Δ% als relative Änderung ohne Zeichen `+23`, kursiv/klein.
Schwellen: rot, wenn `Δ × (Kosten ? −1 : 1) < Schwelle` (Default Monat −20 /
−10 %, _YTD −220 / −10 %; GuV −20 / −10 %).

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

Aus den Daten abgeleitete Stil-Flags (kein Schalter): Vorzeichen-Spalte und
gepaarter Δ-Kopf nur bei GuV-Daten; Block-Titelzeile nur bei Struktur-Daten;
Schluss-Unterstreichung nur GuV ohne Chart-Spalten (T03); bei Wert-Kaskade keine
grauen Zeilenlinien, durchgehende Summenlinien, keine Kopf-Linien (12A).

### Bewusst offen / Abweichungen

- **12G/12H** (YTD+Restjahr-Stapel, Plan-Tönung) nicht im Prototyp; 12A ist
  umgesetzt, der Headline-Slot wird aus den Daten generiert.
- GuV hat keinen _YTD-Block (Demo-Daten nur Jahr); der Block-Schalter wirkt nur
  bei Strukturdaten.
- Referenz-Inkonsistenzen werden nicht nachgebaut: Summen rechnet der Kern
  (T03A AC-Ergebnis 422.2 statt 422.3; ΔPY Group result +186.2 statt der im Bild
  doppelt gedruckten +162.5; 12H-PL-Operating-result 346 statt 329).
- Sortierung „je Block" ist bei geteilter Kategorie-Spalte nur über einen Block
  möglich (`sortBlock`); Indikator `(↓)` steht am sortierenden Spaltenkopf.

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
  und Baum-Ansicht ändert sich nichts. Im Mega-Modus blendet die Toolbar
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

Offen: Phase 4 ist mit dem Monat | _YTD-Block weitgehend vorweggenommen;
Phase 5 (12G YTD+Restjahr-Stapel, 12H Plan-Tönung, Headline-Slot) ist nicht
umgesetzt; Virtualisierung sehr langer Statements (heute ein SVG für alle
sichtbaren Zeilen). Wasserfall-Beschriftungen links eines Schritts dürfen wie
in den Referenzen (T04B „+5.79") die Nulllinie kreuzen.

### Stand 1.0.0.0

Phase 1–4 sind Teil von 1.0. Dazu im 1.0-Paket: alle Schalter und Template-Namen
in vier Sprachen, Sichtbarkeits-Gates im Formatmenü (Mega-Gruppe nur in der
Tabellen-Ansicht, ΔPY/ΔPL nur mit gebundenem PY/PL, Schwellen-Felder nur bei
`thresholds`, YTD-Schwellen nur mit `secondBlock` …) und die Dunkel-Palette
(`MEGA_C` ist live, `setMegaPalette()`; die Tonwerte der Wert-Kaskade sind
Paletten-Keys statt Literale). **Auf 1.1 verschoben:** Phase 5 (12G, 12H,
Headline-Slot) und die Virtualisierung sehr langer Mega-Tabellen.
