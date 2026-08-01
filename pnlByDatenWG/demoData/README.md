# Demo-Daten — P&L Statement byDatenWG

`guv-demo.csv` ist eine vollständige Beispiel-GuV (Contoso GmbH, Werte in kEUR)
mit allen Feldern des Datenvertrags: unbalancierte Hierarchie (2–3 Ebenen),
Subtotals, Formelzeilen (EBITDA/EBIT/EBT/Jahresüberschuss), %-KPI-Zeilen
(EBITDA-Marge, Umsatzrendite), Kosten mit Vorzeichenlogik und ein
VarianceInvert-Fall (Steuern).

Semikolon-getrennt, UTF-8 — direkt in Power BI Desktop importierbar
(**Daten abrufen → Text/CSV**).

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
