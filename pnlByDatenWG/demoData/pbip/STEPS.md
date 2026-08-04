# GuV-Demo.pbip — in 3 Schritten zum fertigen Demo-Report

Fertiges Power-BI-Projekt: Sternschema-Datenmodell (DimKonten + FactGuV),
Beziehung, Measures AC/PY/PL/FC und die Demo-Daten **inline im Modell** —
kein CSV-Import, keine Pfade, keine Measure-Formeln nötig.

## 1 · Projekt öffnen

`GuV-Demo.pbip` in Power BI Desktop öffnen (Doppelklick).

Falls Desktop das Format bemängelt, einmalig unter **Datei → Optionen →
Vorschaufeatures** aktivieren und neu starten:
- *Store semantic model using TMDL format*
- *Store reports using enhanced metadata format (PBIR)*

Beim ersten Öffnen einmal **Aktualisieren**, damit die Inline-Daten ins
Modell geladen werden (keine Anmeldedaten nötig — die Daten stecken in der
Abfrage selbst).

## 2 · Visual importieren

**Visualisierungen → ⋯ → Visual aus einer Datei importieren** →
`pnlByDatenWG…pbiviz` aus `pnlByDatenWG/dist/` wählen.

## 3 · Felder zuweisen

Visual auf die Seite ziehen, dann aus dem Datenbereich:

| Field Well | Feld |
|---|---|
| Ebenen-Spalten (L1..Ln) | `DimKonten[L1]`, dann `[L2]`, dann `[L3]` (Reihenfolge!) |
| Konto-ID (Key) | `DimKonten[AccountID]` |
| Zeilentyp | `DimKonten[RowType]` |
| Formeldefinition | `DimKonten[FormulaDef]` |
| Sortierung | `DimKonten[SortOrder]` |
| Rechenvorzeichen (±1) | `DimKonten[SignConvention]` |
| Anzeige invertieren | `DimKonten[DisplayInvert]` |
| Abweichungsfarbe drehen | `DimKonten[VarianceInvert]` |
| AC / PY / PL / FC | Measures `AC`, `PY`, `PL`, `FC` aus FactGuV |

Optional: Slicer auf `FactGuV[Monat]` — die GuV inkl. EBITDA/EBIT rechnet
live auf den gefilterten Monaten.

## Abnahme-Check (alle 6 Monate ausgewählt)

- EBITDA AC = **3.400** · EBIT = **3.020** · Jahresüberschuss = **2.615**
- EBITDA-Marge = **30,1 %**
- Kostenzeilen positiv, „Marketing" ΔPL grün (unter Plan)
- „Sonst. betr. Erträge" ohne Aufklapp-Pfeil (L1=L2=L3 → Ebene 1)
