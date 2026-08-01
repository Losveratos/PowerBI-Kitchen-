# P&L Statement byDatenWG

IBCS-inspiriertes GuV-/P&L-Custom-Visual für Power BI — eigenständiges
Schwester-Visual von [ChartKitchen byDatenWG](../ibcsInspiredChartDeck/) und der
[IBCS KPI Card](../ibcsKpiCard/). Umsetzung des Anforderungsdokuments
„Best-in-Class P&L Standalone Visual" (MVP / Phase 1).

## Was es kann (MVP)

| Anf. | Feature |
|------|---------|
| F1 | Unbalancierte Parent-Child-Kontenhierarchie in beliebiger Tiefe, gesteuert aus einer Dimensionstabelle — Waisen-Konten landen sichtbar in „Nicht zugeordnet", nie stilles Verschlucken |
| F2 | Summen- und Formelzeilen per `RowType` + `FormulaDef` (z. B. `[EBITDA]/[Umsatz]`), inkl. Formel-auf-Formel, Zirkelbezug-Erkennung und Fehleranzeige an der Zeile |
| F3 | Vorzeichenlogik: `SignConvention` (±1 Rechenvorzeichen), `DisplayInvert` (Kosten positiv anzeigen), `VarianceInvert` (Kosten unter Plan = grün) |
| F4 | Szenarien AC / PY / PL / FC als Measure-Slots (Datenvertrag Variante A); Δ und Δ% gegen wählbare Referenz (Auto/PY/PL/FC), zweites Δ% parallel zuschaltbar |
| F7 | Expand/Collapse je Zeile + Ebenen-Buttons (1·2·3·alle); Zustand wird via `persistProperties` gehalten (bookmark-fähig) und übersteht Cross-Filter |
| F9 | Skalierung Auto/k/m, Dezimalstellen, 3-zeiliger IBCS-Titelblock mit optionaler Message-Zeile |

IBCS-Notation: AC solide `#404040`, PY grau, PL weiß mit Rahmen, FC schraffiert;
Abweichungen grün `#8CB400` / rot `#FF2600`, Labels außerhalb mit explizitem `+`;
eine identische Skala je Δ-Spalte über alle Zeilen; %-Zeilen (Margen) ohne
Δ-Balken-Skalenbruch (Δ in Prozentpunkten); weißer Hintergrund, keine Gridlines.

## Datenvertrag

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
npm run lint
npm run package       # baut dist/*.pbiviz
```

Der Rechenkern (`src/engine.ts`) ist bewusst frei von Power-BI-Abhängigkeiten
und isoliert getestet (`test/engine-test.js`) — Reconciliation-Fehler wären
Vertrauens-Killer (Anforderungsdok. Kap. 10).

## Roadmap (aus dem Anforderungsdokument)

- v1.0: Spalten-Presets (F6), mehrere Referenzen parallel voll (F5), gemischte
  Einheiten (F8), Nullzeilen-Unterdrückung (F10), A11y, Zertifizierung
- v1.x: GuV-Wasserfall, Common-Size-Spalte, Kommentare, Drillthrough, Top-N
- Offen: `fetchMoreData`-Strategie für Kontenpläne > 30 k Datenpunkte,
  Virtual Scrolling für > 2 000 Zeilen, eigenes Icon (aktuell Platzhalter)

> „IBCS" ist eine eingetragene Marke der IBCS Association / HICHERT+FAISST GmbH.
> Dieses Visual ist nicht von der IBCS Association zertifiziert und nutzt den
> Begriff beschreibend. IBCS-Standards 1.2 unter CC BY-SA (ibcs.com).
