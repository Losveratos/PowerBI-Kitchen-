# P&L Statement byDatenWG

IBCS-inspiriertes GuV-/P&L-Custom-Visual für Power BI — eigenständiges
Schwester-Visual von [ChartKitchen byDatenWG](../ibcsInspiredChartDeck/) und der
[IBCS KPI Card](../ibcsKpiCard/). **Version 1.4.0.0**:
Tabelle mit **Mega-Table** (IBCS-Templates T01–T04, 12A, 12G und 12H), Struktur-Bars,
Zeilen-Waterfall und **Werttreiberbaum (DuPont)** mit Kachel-Zoom; Selektion,
Drillthrough und natives Kontextmenü; **vier Sprachen** (de · en · es · ja),
**Start-Hub** (🚀 Loslegen-Checkliste, Tour, Template-Galerie nach Zweck, Demo, Feld-Intro aller Rollen, Schriftgrößen-Leiste und Doku-Link beim Hineinziehen) und **Dark Mode** (Auto · Hell ·
Dunkel) in der Handschrift von ChartKitchen.
**Sternschema (L1..Ln) ist der primäre Hierarchie-Modus** — Parent-Child
bleibt als Alternative voll unterstützt. Die Toolbar macht das Visual für
Report-Ersteller wie -Leser ohne Format-Pane bedienbar; alle
Toolbar-Zustände sind bookmark-fähig persistiert.

> **Schnellstart:** [`QUICKSTART.md`](QUICKSTART.md) — beide Wege in das Visual
> (normale Hierarchie in zwei Minuten · volle GuV mit Formelzeilen), Ragged-
> Regeln, Perioden-Formate, Drillthrough-Setup und die typischen Fehlerbilder.
> Web-Fassung: [`pnl-schnellstart.html`](../pnl-schnellstart.html) (DE) /
> [`pnl-schnellstart_en.html`](../pnl-schnellstart_en.html) (EN).
>
> **Für KI-Agenten:** [`AGENT-GUIDE.md`](AGENT-GUIDE.md) — Datenvertrag, alle
> Properties mit Typ und Default, persistierte Zustände, Fallen, PBIR-Beispiel.

## Was es kann

| Anf. | Feature |
|------|---------|
| F1 | Unbalancierte Parent-Child-Kontenhierarchie in beliebiger Tiefe, gesteuert aus einer Dimensionstabelle — Waisen-Konten landen sichtbar in „Nicht zugeordnet", nie stilles Verschlucken |
| F2 | Summen- und Formelzeilen per `RowType` + `FormulaDef` (z. B. `[EBITDA]/[Umsatz]`), inkl. Formel-auf-Formel, Zirkelbezug-Erkennung und Fehleranzeige an der Zeile |
| F3 | Vorzeichenlogik: `SignConvention` (±1 Rechenvorzeichen), `DisplayInvert` (Kosten positiv anzeigen), `VarianceInvert` (Kosten unter Plan = grün) |
| F4 | Szenarien AC / PY / PL / FC als Measure-Slots (Datenvertrag Variante A); Δ und Δ% gegen wählbare Referenz (Auto/PY/PL/FC), zweites Δ% parallel zuschaltbar |
| F7 | Expand/Collapse je Zeile + Ebenen-Buttons (1·2·3·alle); Zustand wird via `persistProperties` gehalten (bookmark-fähig) und übersteht Cross-Filter |
| F9 | Skalierung Auto/k/m/b, Dezimalstellen, 3-zeiliger IBCS-Titelblock mit Message-Zeile, Auto-Botschaft und Headline-Slot der 12er-Serie; Fußzeilen für Datenstand und Filter |
| F11 | Selektion & Cross-Filtering: Linksklick auf eine Wertspalte (bzw. den Kachel-Kopf) setzt die Power-BI-Selektion der Zeile — inkl. aller Quellzeilen eines Kontos; Subtotals und Formelzeilen selektieren die Blätter darunter |
| F12 | Natives Kontextmenü per Rechtsklick auf jede Zeile und jede Karte — Power BI hängt die **Drillthrough-Ziele** der Seite selbst ein; in der Kachel-Ansicht erledigt der Knopf „↗ Drill“ Selektion und Menü in einem Griff. Abschaltbar über Stil → „Selektion & Kontextmenü aktiv“ |
| Mega-Table | IBCS-Tabellen T01A/B, T02A–F, T03A/B, T04A–E, 12A, 12G und 12H als Zuschaltung der Tabellen-Ansicht (Spalten & Mega-Table → Template): Wert- und Δ-Spalten frei kombinierbar, Δ-Balken, Δ%-Pins, integrierter Δ-Wasserfall, Wert-Kaskaden (12G: YTD + Restjahr in einem Balken), Planrechnung mit getönten Δ (12H), Blöcke Monat \| YTD \| FY, Schwellen mit Fußzeile, ab 150 Zeilen virtualisiert — siehe [`SPEC-MEGATABLE.md`](SPEC-MEGATABLE.md) |
| Finance | Wie ChartKitchen: Tooltips, Σ-treue Rundung, Klammern statt Minus, Hausbegriffe (Ist/VJ/Budget), Wesentlichkeit, Zeilen hervorheben, Skalen-Sync über Visuals (`numbers.fixedMax`/`fixedVarMax`), Farb-Preset Blau/Orange |
| Sprachen | Deutsch, Englisch, Spanisch, Japanisch — Formatmenü, Feldrollen, Toolbar, Tooltips, Fußzeilen, Fehlermeldungen und Demo (`stringResources/<locale>/resources.resjson`) |
| Start-Hub | Ohne Felder zeigt das Visual im Bearbeitungsmodus (1.3, Standard) **vier große Knöpfe**: *Was kann das Visual?* (Tour mit Mini-Renderings), *Templates* (Galerie mit Vorschau, ein Klick wendet an), *Demo ansehen* (die Demo-GuV) und *Felder erklären*. Mit Daten öffnet **☰ Start** in der Toolbar denselben Hub als Overlay. Unter Leer-Zustand → Modus bleiben Demo (Smart Start), Feld-Intro und eigene Nachricht wählbar. Nie im Lesemodus oder Export |
| Ease of Use (1.2) | **Wertspalten frei kombinieren**: Preset „Eigene Auswahl" bzw. Toolbar-Gruppe „Wertspalten" mit AC · PY · PL · FC · Δ als einzelne Schalter (auch im Mega-Table). **Template-Auswahl in der Toolbar** im Bearbeitungsmodus, Template-Gruppe zuerst im Formatbereich. **Spalten-Kategorie**: Spaltensatz je Segment/Quartal wiederholt, Gesamt-Block danach. **Balken-Ansicht** wie ChartKitchen: Szenarien überlappt, Dreieck-Marker. Feldliste in gewohnter Reihenfolge |
| Dark Mode | Stil → Erscheinungsbild: Auto erkennt dunkle Berichtsthemen (wie ChartKitchen), Hell/Dunkel erzwingen |

IBCS-Notation: AC solide `#404040`, PY grau, PL weiß mit Rahmen, FC schraffiert;
Abweichungen Teal `#0E8585` / Rot `#E02B1D` (dokumentierte Abweichung für
Farbfehlsicht, IBCS-Grün `#8CB400` / `#FF2600` und Blau/Orange `#2C7BB6` / `#E66101`
umschaltbar), Labels außerhalb mit explizitem `+`;
eine identische Skala je Δ-Spalte über alle Zeilen; %-Zeilen (Margen) ohne
Δ-Balken-Skalenbruch (Δ in Prozentpunkten); heller Hintergrund (im Dark Mode dunkel), keine Gridlines.

## Datenvertrag

Zwei Eingabemodi für die Hierarchie — beide voll unterstützt:

**A · Parent-Child** (klassische Kontendimension): `AccountID` + `ParentAccountID`.

**B · Sternschema / Level-Spalten** (`L1..Ln` ins Field Well „Ebenen-Spalten",
Reihenfolge = Ziehreihenfolge, max. 8): Das Visual baut den Baum selbst.
Ragged-Hierarchien nach beiden üblichen Konventionen:
leere tiefere Level → letzte gefüllte Ebene ist das Blatt; wiederholt ein Level
den Inhalt des vorherigen (L2 = L1) → die Hierarchie endet dort.
Zeilen mit gleichem Pfad werden aggregiert; Aggregat-Zeilen (z. B. PY nur auf
L1) wirken als Szenario-Fallback. Formelzeilen referenzieren per eindeutigem
Zeilennamen (`[Umsatzerlöse]`); synthetische Zwischensummen erben
`DisplayInvert`/`VarianceInvert`, wenn alle Kinder einheitlich sind.
Ist zusätzlich Parent-ID gebunden, gewinnt Parent-Child.

Kontendimension (eine Zeile pro Konto/Zeile der GuV):

| Feld | Rolle | Inhalt |
|------|-------|--------|
| AccountID | Konto-ID (Key) | eindeutig, stabil |
| ParentAccountID | Parent-Konto-ID | Parent-Child, unbalanciert erlaubt |
| AccountName | Kontoname | Anzeige |
| SortOrder | Sortierung | Reihenfolge innerhalb des Parents |
| RowType | Zeilentyp | `Account` · `Subtotal` · `Formula` · `KPI` · `Separator` |
| FormulaDef | Formeldefinition | für Formula/KPI: `[EBITDA]/[Umsatz]`, `+ - * /`, Klammern |
| SignConvention | Rechenvorzeichen | Erlös `+1`, Kosten `-1` |
| DisplayInvert | Anzeige invertieren | Kosten positiv anzeigen trotz negativem Rechenwert |
| VarianceInvert | Abweichungsfarbe drehen | Kosten unter Plan = grün |

Optional (1.2): **Spalten-Kategorie** — ein Feld wie Segment oder Quartal; die
klassische Tabelle wiederholt ihren Spaltensatz je Wert (max. 24) und zeigt den
Gesamt-Block danach. Mega-Table, Balken und Waterfall ignorieren das Feld.

Measures: **AC** (Pflicht), PY, PL, FC, optional FC Gesamtjahr / PL Gesamtjahr
(FY-Ausblick, 12G) und der Text „Filter-Info" für die Fußzeile — Zeitintelligenz, FX und RLS bleiben im
Modell (das Visual verrechnet ausschließlich die gelieferten, ggf.
RLS-beschnittenen Daten).

## Entwicklung

```bash
npm install
npm test              # alles: Sprachdateien, Engine, Mega-Table, Wasserfall, Render, Baum, Start/Dark, Performance
npm run test:i18n     # Sprachdatei-Parität (4 Locales, Keys aus Code + Formatmenü + capabilities)
npm run test:engine   # Unit-Tests des Rechenkerns (Hierarchie, Formeln, Vorzeichen)
npm run test:mega     # Mega-Table: Layout-Unit-Tests, Render m1–m31, Template-/Echo-Guard
npm run test:render   # Headless-Render aller Testfälle -> test/render.png
npm run test:tree     # Interaktionstest: Baum (Chevrons, Drill, ⌖) + Selektion/Kontextmenü
npm run test:toolbar  # Toolbar-Knöpfe in allen Ansichten, Echo-Guard, Wertspalten-Sweep, Template-Auswahl
npm run test:ease     # 1.2: Pane-/Rollen-Reihenfolge, Leer-Zustand-Modi, Balken-Notation, Spalten-Kategorie
npm run test:hub      # 1.3: Start-Hub, Tour, Template-Galerie, Overlay, ↺ Zum Template zurück
npm run test:start    # Smart Start, Dark Mode, Formatmenü-Gates, Sprachen im Bild (test/i18n-*.png)
npm run test:finance  # Finance-Features F1–F11 (Tooltips, Σ-treue Rundung, Klammern, Hausbegriffe …)
npm run test:perf     # 5 000 Konten klassisch (Fensterung, Budgets)
npm run test:megaperf # 2 000 Konten im Mega-Table (Virtualisierung, Scroll, Selektion nach Scroll)
npm run lint
npm run package       # baut dist/*.pbiviz (Paket nicht einchecken)
```

Der Rechenkern (`src/engine.ts`) ist bewusst frei von Power-BI-Abhängigkeiten
und isoliert getestet (`test/engine-test.js`) — Reconciliation-Fehler wären
Vertrauens-Killer (Anforderungsdok. Kap. 10).

Sprachen: neue oder geänderte Texte immer in **allen vier**
`stringResources/<locale>/resources.resjson` pflegen; In-Visual-Texte zusätzlich
in der englischen Rückfall-Tabelle `src/i18n.ts` — `npm run test:i18n` meldet
jede Abweichung. Die Demo-GuV (`src/demo.ts`) wird aus `test/demo-data.js`
erzeugt: `node test/gen-demo.js`.

## Roadmap

- 1.1 (erledigt): Mega-Table Phase 5 (12G, 12H, Headline-Slot), Virtualisierung,
  Finance-Features aus ChartKitchen, dunkler Hover-Tooltip, Tastatur
- 1.2 (erledigt): Ease of Use — freie Wertspalten, Template in der Toolbar,
  Feld-Intro im Leerzustand, Rollen-Reihenfolge, Balken-Notation wie
  ChartKitchen, Spalten-Kategorie (klassische Tabelle)
- Später: Spalten-Kategorie im Mega-Table, gemischte Einheiten (F8), Exception-Reporting mit Sammelzeile,
  AppSource-Zertifizierung, Top-N

> „IBCS" ist eine eingetragene Marke der IBCS Association / HICHERT+FAISST GmbH.
> Dieses Visual ist nicht von der IBCS Association zertifiziert und nutzt den
> Begriff beschreibend. IBCS-Standards 1.2 unter CC BY-SA (ibcs.com).
