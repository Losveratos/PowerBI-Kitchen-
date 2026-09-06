# P&L Statement byDatenWG

IBCS-inspiriertes GuV-/P&L-Custom-Visual für Power BI — eigenständiges
Schwester-Visual von [ChartKitchen byDatenWG](../ibcsInspiredChartDeck/) und der
[IBCS KPI Card](../ibcsKpiCard/). Umsetzung des Anforderungsdokuments
„Best-in-Class P&L Standalone Visual" — Stand v0.3: volle Parität zum
Konzept-Demo (In-Visual-Toolbar, YTD- + FY-Outlook-Block, Waterfall-Ansicht,
Monats-Sparklines, Kommentar-Fußnoten, %-vom-Umsatz, Teal-Deviation);
seit v0.6 zusätzlich der **Werttreiberbaum (DuPont)** aus dem Formel-Graphen.
**Sternschema (L1..Ln) ist der primäre Hierarchie-Modus** — Parent-Child
bleibt als Alternative voll unterstützt. Die Toolbar macht das Visual für
Report-Ersteller wie -Leser ohne Format-Pane bedienbar; alle
Toolbar-Zustände sind bookmark-fähig persistiert.

> **Schnellstart:** [`QUICKSTART.md`](QUICKSTART.md) — beide Wege in das Visual
> (normale Hierarchie in zwei Minuten · volle GuV mit Formelzeilen), Ragged-
> Regeln, Perioden-Formate, Drillthrough-Setup und die typischen Fehlerbilder.
> Web-Fassung: [`pnl-schnellstart.html`](../pnl-schnellstart.html) (DE) /
> [`pnl-schnellstart_en.html`](../pnl-schnellstart_en.html) (EN).

## Was es kann (MVP)

| Anf. | Feature |
|------|---------|
| F1 | Unbalancierte Parent-Child-Kontenhierarchie in beliebiger Tiefe, gesteuert aus einer Dimensionstabelle — Waisen-Konten landen sichtbar in „Nicht zugeordnet", nie stilles Verschlucken |
| F2 | Summen- und Formelzeilen per `RowType` + `FormulaDef` (z. B. `[EBITDA]/[Umsatz]`), inkl. Formel-auf-Formel, Zirkelbezug-Erkennung und Fehleranzeige an der Zeile |
| F3 | Vorzeichenlogik: `SignConvention` (±1 Rechenvorzeichen), `DisplayInvert` (Kosten positiv anzeigen), `VarianceInvert` (Kosten unter Plan = grün) |
| F4 | Szenarien AC / PY / PL / FC als Measure-Slots (Datenvertrag Variante A); Δ und Δ% gegen wählbare Referenz (Auto/PY/PL/FC), zweites Δ% parallel zuschaltbar |
| F7 | Expand/Collapse je Zeile + Ebenen-Buttons (1·2·3·alle); Zustand wird via `persistProperties` gehalten (bookmark-fähig) und übersteht Cross-Filter |
| F9 | Skalierung Auto/k/m, Dezimalstellen, 3-zeiliger IBCS-Titelblock mit optionaler Message-Zeile |
| F11 | Selektion & Cross-Filtering: Linksklick auf eine Wertspalte (bzw. den Kachel-Kopf) setzt die Power-BI-Selektion der Zeile — inkl. aller Quellzeilen eines Kontos; Subtotals und Formelzeilen selektieren die Blätter darunter |
| F12 | Natives Kontextmenü per Rechtsklick auf jede Zeile und jede Karte — Power BI hängt die **Drillthrough-Ziele** der Seite selbst ein; in der Kachel-Ansicht erledigt der Knopf „↗ Drill“ Selektion und Menü in einem Griff. Abschaltbar über Stil → „Selektion & Kontextmenü aktiv“ |

IBCS-Notation: AC solide `#404040`, PY grau, PL weiß mit Rahmen, FC schraffiert;
Abweichungen grün `#8CB400` / rot `#FF2600`, Labels außerhalb mit explizitem `+`;
eine identische Skala je Δ-Spalte über alle Zeilen; %-Zeilen (Margen) ohne
Δ-Balken-Skalenbruch (Δ in Prozentpunkten); weißer Hintergrund, keine Gridlines.

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

Measures: **AC** (Pflicht), PY, PL, FC — Zeitintelligenz, FX und RLS bleiben im
Modell (das Visual verrechnet ausschließlich die gelieferten, ggf.
RLS-beschnittenen Daten).

## Entwicklung

```bash
npm install
npm run test:engine   # Unit-Tests des Rechenkerns (Hierarchie, Formeln, Vorzeichen)
npm run test:render   # Headless-Render aller Testfälle -> test/render.png
npm run test:tree     # Interaktionstest: Baum (Chevrons, Drill, ⌖) + Selektion/Kontextmenü
npm run lint
npm run package       # baut dist/*.pbiviz
```

Der Rechenkern (`src/engine.ts`) ist bewusst frei von Power-BI-Abhängigkeiten
und isoliert getestet (`test/engine-test.js`) — Reconciliation-Fehler wären
Vertrauens-Killer (Anforderungsdok. Kap. 10).

## Roadmap (aus dem Anforderungsdokument)

- v1.0: Spalten-Presets (F6), mehrere Referenzen parallel voll (F5), gemischte
  Einheiten (F8), Nullzeilen-Unterdrückung (F10), A11y, Zertifizierung
- v1.x: Common-Size-Spalte, Top-N (Wasserfall, Kommentare und Drillthrough sind seit 0.14 / 0.17 drin)
- Offen: `fetchMoreData`-Strategie für Kontenpläne > 30 k Datenpunkte,
  Virtual Scrolling für > 2 000 Zeilen, eigenes Icon (aktuell Platzhalter)

> „IBCS" ist eine eingetragene Marke der IBCS Association / HICHERT+FAISST GmbH.
> Dieses Visual ist nicht von der IBCS Association zertifiziert und nutzt den
> Begriff beschreibend. IBCS-Standards 1.2 unter CC BY-SA (ibcs.com).
