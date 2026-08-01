# Demo-Daten — P&L Statement byDatenWG

Beide Eingabemodi des Visuals als Beispiel-GuV (Contoso GmbH, Werte in kEUR),
Semikolon-getrennt, UTF-8 — direkt in Power BI Desktop importierbar
(**Daten abrufen → Text/CSV**):

| Datei | Modus |
|---|---|
| `guv-demo.csv` | **Parent-Child** (AccountID + ParentAccountID), flach — eine Datei |
| `guv-demo-levels.csv` | **Level-Spalten** (L1–L3), flach — eine Datei |
| `star-dim-konten.csv` + `star-fact-guv.csv` | **Echtes Sternschema**: Dimension + Faktentabelle (Monatsebene), Beziehung über `AccountID` |

## Sternschema-Setup (star-dim + star-fact)

1. Beide CSVs importieren (Text/CSV, Semikolon).
2. **Beziehung**: `star-dim-konten[AccountID]` 1:* `star-fact-guv[AccountID]`.
3. Measures anlegen (im Modell, nicht im Visual):
   `AC = SUM('star-fact-guv'[AC])` — analog PY, PL, FC.
4. Ins Visual ziehen: aus der **Dimension** `L1`, `L2`, `L3` (in dieser
   Reihenfolge) ins Well „Ebenen-Spalten", dazu `AccountID`, `RowType`,
   `FormulaDef`, `SignConvention`, `DisplayInvert`, `VarianceInvert`;
   aus den **Measures** AC/PY/PL/FC.
5. Monats-Slicer auf `star-fact-guv[Monat]` — die GuV aggregiert live über
   die gefilterten Monate; die Formelzeilen (EBITDA …) rechnen immer auf dem
   gefilterten Stand (RLS-/Filter-Transparenz).

Hinweise:

- Die Faktentabelle enthält je Formel-/KPI-Konto eine **Leer-Faktzeile**,
  damit diese Zeilen den Dimension-Fakt-Join überleben. Alternative ohne
  Leerzeilen: im Visual-Feld `L1` „**Elemente ohne Daten anzeigen**" aktivieren.
- Alle 6 Monate zusammen ergeben exakt die Jahreswerte der flachen Demos
  (Reconciliation: EBITDA AC = 3.400, Jahresüberschuss = 2.615).

Beide enthalten: unbalancierte Hierarchie, Formelzeilen
(EBITDA/EBIT/EBT/Jahresüberschuss), %-KPI-Zeilen (EBITDA-Marge, Umsatzrendite),
Kosten mit Vorzeichenlogik und einen VarianceInvert-Fall (Steuern).

Ragged-Regeln im Level-Modus (beide in `guv-demo-levels.csv` enthalten):

- **Leere tiefere Level** → die letzte gefüllte Ebene ist das Blatt
  (z. B. `Betriebsaufwand;Marketing;;`)
- **Wiederholter Inhalt** → Hierarchie endet dort
  (z. B. `Sonst. betr. Erträge` in L1=L2=L3 → Ebene 1)
- Formelzeilen referenzieren per **Zeilennamen** (`[Umsatzerlöse]`), da es im
  Sternschema keine Konten-IDs gibt — Namen müssen dafür eindeutig sein.
- Synthetische Zwischensummen erben `DisplayInvert`/`VarianceInvert`, wenn
  alle Kinder sie einheitlich gesetzt haben (Kostenblock bleibt positiv).

## Feld-Zuweisung im Visual

| CSV-Spalte | Field Well |
|---|---|
| AccountID | Konto-ID (Key) |
| ParentAccountID | Parent-Konto-ID |
| AccountName | Kontoname |
| SortOrder | Sortierung |
| RowType | Zeilentyp |
| FormulaDef | Formeldefinition |
| SignConvention | Rechenvorzeichen (±1) |
| DisplayInvert | Anzeige invertieren |
| VarianceInvert | Abweichungsfarbe drehen |
| AC / PY / PL / FC | AC / PY / PL / FC (als Summe) |

Hinweise:

- Die Grouping-Spalten (AccountID … VarianceInvert) als **„Nicht
  zusammenfassen"** belassen; AC/PY/PL/FC als Summe ist korrekt.
- Subtotal-/Formel-/KPI-Zeilen haben bewusst **leere** Wertespalten — das
  Visual berechnet sie selbst (Reconciliation: EBITDA AC = 3.400, EBIT = 3.020,
  Jahresüberschuss = 2.615).
- Zum Testen des Waisen-Buckets: bei einer Zeile die ParentAccountID auf einen
  nicht existierenden Wert ändern → Zeile erscheint rot unter „Nicht
  zugeordnet".
- In echten Modellen ersetzt eine Kontendimension + Fact-Tabelle mit Measures
  diese flache CSV; die CSV bildet nur den Datenvertrag 1:1 ab.
