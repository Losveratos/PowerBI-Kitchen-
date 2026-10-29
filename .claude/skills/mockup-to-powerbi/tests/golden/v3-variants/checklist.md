# Checkliste vor dem Schreiben

Mockup: **Darstellungsvarianten-Testfall** · specVersion 3 (gelesen als v3) · Hash `variants1` · 1 Seite(n) · Canvas 1280×720 (uiScale ×1.0)

## Berichtskopf

| | |
|---|---|
| Zielgruppe | Vertriebsleitung |
| Ziel | Umsatz je Region vergleichbar zeigen, Achse umschaltbar |
| Entscheidung | Welche Region bekommt das zusaetzliche Budget? |
| Teilnehmende | Vertrieb, Controlling |
| Version / Datenstand | 0.4.1 / taeglich, 6 Uhr |

## Gestaltung (aus `design`, geht in die Container-Formatierung bzw. das Theme-Fragment)

- Kacheln: Stil `flat`, Ecken 4 px, Hintergrund #FFFFFF
- Seitenhintergrund #F4F4F1 · Akzent #C25A2D
- Kopfband-Stil `light` (Fläche #FFFFFF, Text #0F1E2E) · Schriftfaktor ×1.0 (Visual-Titel ≈ 12 pt)
- Varianz-Palette `teal`: gut #1E8F9E · schlecht #D64541 · Ink #0F1E2E · dunkler Modus nein

## Umfang

- Visuals gesamt: 6 (ChartKitchen 1 · nativ 5 · Deneb 0)
- Slicer je Seite: 1 (Filter-Modus `right`)
- Verknüpfungen: 0 (0 Drill-through, 0 Seitenwechsel)

| Seite | Ordner | Fragestellung | native Visuals + Slicer | Text/Button | Chrome | CK | Deneb | Custom |
|---|---|---|---|---|---|---|---|---|
| Varianten | `Varianten/` | Wo steht der Umsatz je Region und wie entwickelt er sich? | 6 | 0 | 8 | 1 | 0 | 0 |

## Offene Punkte aus der Spec (`issues`)

| Schwere | Code | Seite | Kachel | Text |
|---|---|---|---|---|
| warn | `SM_NO_FIELD` | Varianten | mk_line1 | „Verlauf je Monat": Small Multiples aktiv, aber kein Aufteilungsfeld gebunden |
| info | `FIELDPARAM_FEW` | Varianten | mk_ck1 | „AC/PL je Monat": Feldparameter „CK-Achse" hat nur 1 Feld(er); mindestens zwei sind sinnvoll |

## Darstellungsvarianten (Small Multiples, Feldparameter)

Small Multiples gehen in PBIR in den Bucket `Rows` der kartesischen Visuals (verifiziert mit `pbir schema roles`); `donutChart`, `pieChart`, `card`, `treemap`, `map` und `waterfallChart` haben ihn nicht. ChartKitchen und Deneb haben ihn ebenfalls nicht — dort entweder nativ bauen oder ein Raster aus Einzelkacheln. Der Feldparameter ist eine **berechnete Tabelle im Modell** und muss vor dem Bauen existieren (siehe [`model-todos.md`](model-todos.md)); dazu gehört ein Slicer, sonst schaltet niemand um.

| Seite | Kachel | natives Visual | Small Multiples | Feldparameter |
|---|---|---|---|---|
| Varianten | Umsatz je Produktlinie (`mk_col1`) | clusteredColumnChart | `DimRegion.Region` → Bucket `Rows` | – |
| Varianten | Umsatz und Kosten (`mk_bar1`) | clusteredBarChart | – | `Achse.Achse` ← `DimRegion.Region`, `DimProduct.Category`, `DimCustomer.Segment` |
| Varianten | Verlauf je Monat (`mk_line1`) | lineChart | **Feld fehlt** (`SM_NO_FIELD`) | – |
| Varianten | Ergebnisbruecke (`mk_wf1`) | waterfallChart | `DimRegion.Region` — `waterfallChart` hat keinen Bucket | – |
| Varianten | AC/PL je Monat (`mk_ck1`) | clusteredColumnChart | `DimRegion.Region` — ck kann es nicht | `CK-Achse.CK-Achse` ← `DimDate.Month` |

## Hinweise aus dem Chrome-Aufbau

- [ ] Kopfband ohne Seitennavigation (`zones.header.navOn: false`) — es werden keine `chrome_nav_*`-Buttons angelegt. Seitenwechsel laeuft ueber die Registerkarten.

## ChartKitchen-Rollen-Mapping

- keine Auffälligkeiten

## Analyse-Angaben ohne direkten pbir-Befehl

Vollständig in [`analysis-todos.md`](analysis-todos.md) — hier nur die Zahl je Code:

- `FIELDPARAM`: 1
- `FIELDPARAM_FEW`: 1
- `FIELDPARAM_SLICER`: 2
- `FIELDPARAM_SLOT`: 1
- `SM_NOT_NATIVE`: 1
- `SM_NO_BUCKET`: 1
- `SM_NO_FIELD`: 1
- `TIME_GRAIN`: 1

## Kennzahlen-Steckbrief (`fields`) — gegen das Modell prüfen (`te list`, nicht per Regex)

| Feld | Art | Alias (Fachbereich) | Definition laut Modell | Format | Einheit | Owner | Quelle | Ziel | bestätigt | neu |
|---|---|---|---|---|---|---|---|---|---|---|
| `DimAccount.Account` | column | – | GuV-Position | – | – | – | – | – | ☐ | nein |
| `DimCustomer.Segment` | column | – | Kundensegment | – | – | – | – | – | ☐ | nein |
| `DimDate.Month` | column | – | Monat | – | – | – | – | – | ☑ | nein |
| `DimDate.Year` | column | – | Jahr | 0 | – | – | – | – | ☑ | nein |
| `DimProduct.Brand` | column | – | Marke | – | – | – | – | – | ☐ | nein |
| `DimProduct.Category` | column | Produktlinie | Produktlinie | – | – | Vertrieb | DWH | – | ☑ | nein |
| `DimRegion.Region` | column | – | Vertriebsregion | – | – | Vertrieb | DWH | – | ☑ | nein |
| `_Measures.AC` | measure | – | Ist-Wert | #,##0 | – | Controlling | DWH | – | ☑ | nein |
| `_Measures.Kosten` | measure | – | Variable Kosten | #,##0 | EUR | Controlling | DWH | – | ☐ | nein |
| `_Measures.PL` | measure | – | Plan | #,##0 | – | Controlling | DWH | – | ☑ | nein |
| `_Measures.Umsatz` | measure | – | Nettoumsatz | #,##0 | EUR | Controlling | DWH | – | ☑ | nein |

> Ein einziges fehlendes Feld lässt `pbir add visual --from-json` die komplette Datei ablehnen ('no visuals were created'). Erst Modell, dann Report. Nicht bestätigte Definitionen (☐) im Workshop klären — sie sind der häufigste Grund für „die Zahl stimmt nicht".
