# Demo-Daten — "Pharma-Story" (Daten-WG Knowledgekitchen Group)

Fiktive Pharma-Gruppe, Sternschema (Level-Spalten L1–L3), Monats-Grain,
Werte in **mEUR**. YTD-Zeitraum: **2026-01 … 2026-06**. Zwei Dateien:

| Datei | Inhalt |
|---|---|
| `pharma-dim-konten.csv` | Kontendimension (27 Zeilen: 18 Konten + 5 Formeln + 4 KPIs) |
| `pharma-fact-guv.csv` | Faktentabelle (Monatszeilen; Formel-/KPI-Konten mit einer Leer-Faktzeile) |

Browser-Pendant (identischer Datensatz, kein CSV-Import nötig):
`../../test/demo-data.js` → `window.PNL_DEMO`.

## Sternschema-Setup

1. Beide CSVs importieren (Text/CSV, Semikolon, UTF-8).
2. **Beziehung**: `pharma-dim-konten[AccountID]` 1:* `pharma-fact-guv[AccountID]`.
3. Measures anlegen: `AC = SUM('pharma-fact-guv'[AC])` — analog `PY`, `PL`,
   `FC_FY` (**Durchschnitt**, nicht Summe — FY-Skalare sind pro Konto auf
   jeder Monatszeile identisch wiederholt), `PL_FY` (ebenfalls Durchschnitt).
4. Ins Visual ziehen: aus der **Dimension** `L1`, `L2`, `L3` (in dieser
   Reihenfolge) ins Well „Ebenen-Spalten", dazu `AccountID`, `RowType`,
   `FormulaDef`, `SignConvention`, `DisplayInvert`, `VarianceInvert`;
   aus den **Measures** `AC` → AC-Well, `PY` → PY-Well, `PL` → PL-Well,
   `FC_FY` → FC(FY)-Well, `PL_FY` → PL(FY)-Well.
5. Monats-Slicer auf `pharma-fact-guv[Monat]`.

## Feld-Zuweisung

| CSV-Spalte | Field Well | Bemerkung |
|---|---|---|
| `L1` / `L2` / `L3` | Ebenen-Spalten (in dieser Reihenfolge) | Konto-Hierarchie; Formel-/KPI-Zeilen füllen nur `L1` |
| `AccountID` | Konto-ID (Key) | numerisch für Konten (`401010` …), mnemonisch für Formel/KPI (`F_EBITDA`, `K_GROSSMARGIN` …) |
| `RowType` | Zeilentyp | `Account` \| `Formula` \| `KPI` (Subtotals sind synthetisch — kein eigener RowType nötig, siehe unten) |
| `FormulaDef` | Formeldefinition | `[Name]`-Referenzen auf andere Zeilen, aufgelöst per Zeilenname (Level-Modus hat keine stabilen Parent-IDs) |
| `SortOrder` | Sortierung | steuert Reihenfolge der GuV (10er-Schritte je Block) |
| `SignConvention` | Rechenvorzeichen (±1) | `-1` für alle Kostenzeilen |
| `DisplayInvert` | Anzeige invertieren | `true` bei Kostenzeilen — Werte werden positiv angezeigt, rechnen aber negativ |
| `VarianceInvert` | Abweichungsfarbe drehen | nur bei `Income taxes` (Steuern unter Plan = gut → grün) |
| `Kommentar` | (kein eigenes Well — Kommentar-Feature liest Free-Text je Konto) | 3 Konten kommentiert, siehe unten |
| `AC` / `PY` / `PL` | AC / PY / PL (als Summe) | monatlich, Summe über gefilterte Monate = YTD |
| `FC_FY` / `PL_FY` | FC(FY) / PL(FY) (als **Durchschnitt**) | Jahres-Skalare, pro Konto auf jeder Monatszeile identisch — **nicht** summieren |

Es gibt bewusst **keine monatliche FC-Spalte** — im dargestellten
YTD-Zeitraum existiert nur ein AC-Forecast-Stand, die einzige belastbare
Vorschau ist der Jahres-Forecast `FC_FY`.

## Kontenbaum (Sternschema-Blöcke; alle Zwischensummen sind synthetisch,
d. h. sie entstehen automatisch aus den L1/L2-Pfaden und tauchen **nicht**
als eigene Dim-Zeile auf — genau wie `Umsatzerlöse` im Contoso-Demo)

```
Net revenue                              (synthetisch, Formel referenziert per Name)
├─ Pharmaceuticals (Rx)              401010
├─ Consumer Health                   402000
└─ Contract manufacturing            402010   ← siehe Hinweis unten
Cost of goods sold                       (synthetisch)
├─ Materials                         550010
├─ Production                        550020
└─ Other cost of sales               550030
Gross profit                         F_GROSSPROFIT   = [Net revenue]+[Cost of goods sold]
Gross margin                         K_GROSSMARGIN    = [Gross profit]/[Net revenue]
Operating expenses                       (synthetisch)
├─ Research & development           650010
├─ Selling & marketing               650020
└─ General & administration          650030
Other operating result                   (synthetisch)
├─ License & milestone income        750110   ← kommentiert
├─ FX result                         750120   ← kommentiert
└─ Other operating expenses          750130
EBITDA                                F_EBITDA        = [Gross profit]+[Operating expenses]+[Other operating result]
EBITDA margin                         K_EBITDAMARGIN   = [EBITDA]/[Net revenue]
Depreciation & amortization              (synthetisch)
├─ Depreciation sites & equipment    800110
└─ Amortization intangibles          800120
EBIT                                   F_EBIT          = [EBITDA]+[Depreciation & amortization]
EBIT margin                            K_EBITMARGIN     = [EBIT]/[Net revenue]
Financial result                         (synthetisch)
├─ Interest expense                  850110
└─ Interest & investment income      850120
EBT                                    F_EBT           = [EBIT]+[Financial result]
Income taxes                        900110              (VarianceInvert = true)
Net income                            F_NETINCOME      = [EBT]+[Income taxes]
Net margin                            K_NETMARGIN       = [Net income]/[Net revenue]

FX revaluation clearing              999900   ← eigene Wurzel, Datenqualitäts-Demo (siehe unten)
```

### Abweichung vom Screenshot: Contract manufacturing als eigenes L2-Konto

Der Ziel-Screenshot deutet „Contract manufacturing" durch Einrückung als
L3-Zeile **unter** „Consumer Health" an. Rechnerisch geht das nicht auf:
`Rx (1474.9) + Consumer Health (144.7) + Contract manufacturing (65.6)
= 1685.2 ≈ 1685.3` (Net revenue YTD AC) — d. h. Contract manufacturing wird
**additiv neben** Consumer Health gezählt, nicht als dessen Unterposition.
Zusätzlich verbietet die Engine-Semantik des Level-Modus eine echte L3-
Verschachtelung hier: Sobald ein Blatt-Konto (`Consumer Health`, eigener
Wert) selbst als Parent-Pfad eines Kindes benutzt wird, wird es automatisch
zum `subtotal` befördert — und ein `subtotal` verwirft dann seinen **eigenen**
eingetragenen Wert zugunsten der Kindersumme (`rowsFromLevels`/`computeValues`
in `src/engine.ts`), sonst würde derselbe Betrag doppelt gezählt. Mit nur
einem Kind (Contract manufacturing) würde „Consumer Health" dann 65.6 statt
144.7 anzeigen. Um beide Zielwerte exakt zu treffen, ist Contract
manufacturing hier als eigenständiges **L2-Konto direkt unter Net revenue**
modelliert (Geschwister von Pharmaceuticals (Rx) und Consumer Health) —
inhaltlich identisch, nur ohne die (rechnerisch widersprüchliche)
Verschachtelung.

### Datenqualitäts-Demo: FX revaluation clearing (999900)

Im Screenshot ist dieses Konto ein Waise (`ParentAccountID = "TREAS.FX"`,
existiert nicht in der Kontendimension) — im **Parent-Child-Modus**
(`guv-demo.csv`) würde das automatisch in den „Nicht zugeordnet"-Waisen-
Bucket wandern (`buildModel` in `src/engine.ts`). Der **Level-Modus**
(L1–L3-Spalten, dieser Datensatz) hat kein Parent-Child-Feld — es gibt also
keinen Waisen-Bucket, in den eine Zeile "hineinfallen" könnte. Um die
Zeile trotzdem sichtbar zu halten (statt sie stillschweigend zu verlieren),
ist sie hier als **eigene Wurzel** (`L1 = "FX revaluation clearing"`, kein
Parent) modelliert, ganz unten in der Sortierung (`SortOrder 90`). Der
eigentliche Waisen-Bucket-Testfall steckt im Parent-Child-Demo
(`../guv-demo.csv`): dort eine `ParentAccountID` auf einen nicht
existierenden Wert ändern → Zeile erscheint rot unter „Nicht zugeordnet".

Werte: AC **-1.8**, PY **+1.8**, PL **0.0** mEUR — ein kleiner AC/PY-
„Swing" (Neubewertung ins Negative gedreht ggü. Vorjahr), passend zur
kommentierten Kontrolle im echten Datenqualitäts-Fall.

### Kommentierte Konten

| Konto | Kommentar |
|---|---|
| License & milestone income (750110) | „License & milestone income: 45.0 mEUR BioNova out-licensing milestone achieved and recognized in April; plan assumed 20.0 mEUR in September. Not yet reflected in the FC03 reference." |
| FX result (750120) | „API & raw materials: supplier price index +9% YoY, partially offset by volume mix; hedging review ongoing." |
| FX revaluation clearing (999900) | Erklärt den Datenqualitäts-Fall (Waise im Parent-Child-Modus, siehe oben) |

Im `demo-data.js`-Format steht der Kommentar nur auf der **ersten**
Monatszeile (`2026-01`) des jeweiligen Kontos; in der CSV-Kontendimension
(kontenweise, kein Monatsgrain) genügt eine Spalte.

## Werte-Anpassungen ggü. dem Screenshot (Rundungs-Cent)

Die im Screenshot genannten Eltern-Summen sind führend; wo die dort
angegebenen Kinderwerte nicht exakt aufsummieren (Rundung auf 1 Dezimale im
Screenshot selbst), wurde **ein** Kind je betroffenem Block um ±0.1 mEUR
angepasst, damit `Eltern = Σ signierter Kinder` exakt gilt:

| Block | Konto | Screenshot | Datensatz | Δ |
|---|---|---|---|---|
| Net revenue (AC) | Contract manufacturing | 65.6 | 65.7 | +0.1 |
| Net revenue (PL) | Contract manufacturing | 64.1 | 64.0 | −0.1 |
| Cost of goods sold (AC) | Other cost of sales | 58.9 | 59.0 | +0.1 |
| Cost of goods sold (PY) | Other cost of sales | 56.3 | 56.2 | −0.1 |
| Operating expenses (AC) | General & administration | 141.2 | 141.3 | +0.1 |
| Operating expenses (PY) | General & administration | 130.6 | 130.7 | +0.1 |

Alle anderen Kinderwerte entsprechen exakt der Vorgabe. Die
„Other operating expenses"-Werte (750130) wurden aus der Vorgabe
`Other operating result = License + FX − Other operating expenses`
**rückgerechnet** (nicht direkt vorgegeben, da der ursprüngliche Screenshot-
Wert ~14.1/13.0/14.2 rechnerisch nicht zum Eltern-Zielwert passte):
AC **28.3**, PY **22.0**, PL **26.3** mEUR.

## Abnahme-Werte (YTD 2026-01…2026-06, alle 6 Monate gefiltert)

Berechnet vom Engine-Formelbaum (`src/engine.ts`, `buildModel`), verifiziert
gegen ein via esbuild gebundeltes `engine.ts` (siehe Verifikationsskript):

| Kennzahl | AC | PY | PL |
|---|---:|---:|---:|
| Net revenue | 1685.3 | 1513.5 | 1665.5 |
| Gross profit | 1201.1 | 1068.7 | 1197.8 |
| Gross margin | 71.27 % | 70.61 % | 71.91 % |
| **EBITDA** | **571.2** | 499.6 | 532.0 |
| EBITDA margin | 33.89 % | 33.01 % | 31.94 % |
| **EBIT** | **475.6** | 409.1 | 436.2 |
| EBIT margin | 28.22 % | 27.03 % | 26.19 % |
| **EBT** | **458.8** | 391.7 | 419.0 |
| **Net income** | **339.5** | 289.9 | 310.0 |
| Net margin | 20.14 % | 19.15 % | 18.61 % |

(EBITDA AC 571.2 mEUR liegt innerhalb ±1 mEUR der im Auftrag genannten
Zielgröße "~571.3".)

## Monatsverteilung

Jede YTD-Zahl wird deterministisch mit den Gewichten
`[0.155, 0.160, 0.170, 0.175, 0.165, 0.175]` (Summe = 1.0) auf
2026-01…2026-06 verteilt, gerundet auf 1 Dezimale; der **letzte Monat trägt
den Rundungsrest**, damit die Monatssumme exakt den YTD-Wert trifft — pro
Konto und Szenario (AC/PY/PL) unabhängig. FY-Skalare (`FC_FY`/`PL_FY`)
werden **nicht** verteilt, sondern auf jeder Monatszeile identisch
wiederholt (`aggregateMonthly` in `src/engine.ts` nimmt bei FY-Szenarien den
ersten Wert, summiert nicht).
