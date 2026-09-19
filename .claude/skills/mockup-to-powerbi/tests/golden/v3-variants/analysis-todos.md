# Analyse-To-dos

Was der Analyse-Block der Spec (v3) verlangt und `pbir` **nicht** direkt setzen kann. Alles andere steht bereits in den `<Seitenslug>/analysis-commands.sh`.

| Seite | Kachel | Code | Was zu tun ist |
|---|---|---|---|
| Varianten | Umsatz und Kosten (`mk_bar1`) | `FIELDPARAM` | Achse per Feldparameter „Achse" (`DimRegion.Region`, `DimProduct.Category`, `DimCustomer.Segment`): erst die berechnete Tabelle anlegen (model-todos.md), dann bindet die Achse auf `Achse.Achse`. Ohne die Tabelle lehnt `--from-json` die **ganze** Datei ab. |
| Varianten | Umsatz und Kosten (`mk_bar1`) | `FIELDPARAM_SLICER` | Slicer auf `Achse.Achse` einplanen — ohne ihn kann niemand die Achse umschalten. Vorschlag steht in analysis-commands.sh (auskommentiert). |
| Varianten | Verlauf je Monat (`mk_line1`) | `SM_NO_FIELD` | Small Multiples sind eingeschaltet, aber kein Aufteilungsfeld gebunden (Tool-Issue `SM_NO_FIELD`). Feld in die Rolle „Small Multiples nach" ziehen und neu exportieren — die Kachel bleibt sonst ein normales Visual. |
| Varianten | Verlauf je Monat (`mk_line1`) | `TIME_GRAIN` | Zeitgranularitaet „month": das Kategorie-Feld muss auf dieser Ebene gebunden sein (Datumshierarchie oder eigene Spalte). pbir bindet, was in der Spec steht. |
| Varianten | Ergebnisbruecke (`mk_wf1`) | `SM_NO_BUCKET` | Small Multiples nach `DimRegion.Region`: `waterfallChart` kennt die PBIR-Rolle `Rows` nicht. Anderen Visualtyp waehlen oder ein Raster aus Einzelkacheln bauen. |
| Varianten | AC/PL je Monat (`mk_ck1`) | `SM_NOT_NATIVE` | Small Multiples: Ein ChartKitchen-Visual hat keinen Small-Multiples-Bucket. Als natives Visual bauen oder als Raster aus einer Kachel je Auspraegung. |
| Varianten | AC/PL je Monat (`mk_ck1`) | `FIELDPARAM_SLOT` | Achse per Feldparameter „CK-Achse": die Kachel ist kein natives Visual. Der Feldparameter gehoert trotzdem ins Modell; die Achsenbindung im Slot nachziehen. |
| Varianten | AC/PL je Monat (`mk_ck1`) | `FIELDPARAM_FEW` | Feldparameter „CK-Achse" hat nur 1 Feld(er) (Tool-Issue `FIELDPARAM_FEW`). Zum Umschalten braucht es mindestens zwei — im Workshop nachtragen. |
| Varianten | AC/PL je Monat (`mk_ck1`) | `FIELDPARAM_SLICER` | Slicer auf `CK-Achse.CK-Achse` einplanen — ohne ihn kann niemand die Achse umschalten. Vorschlag steht in analysis-commands.sh (auskommentiert). |
