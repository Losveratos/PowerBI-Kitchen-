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
