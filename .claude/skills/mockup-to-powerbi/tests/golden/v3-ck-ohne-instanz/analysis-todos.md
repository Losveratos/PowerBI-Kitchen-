# Analyse-To-dos

Was der Analyse-Block der Spec (v3) verlangt und `pbir` **nicht** direkt setzen kann. Alles andere steht bereits in den `<Seitenslug>/analysis-commands.sh`.

| Seite | Kachel | Code | Was zu tun ist |
|---|---|---|---|
| Übersicht | Umsatz (`mk_5z33e3b`) | `CK_INVERT` | ChartKitchen-Slot: `chart.invert = true` setzen (kleiner = besser). |
| Übersicht | Year (`mk_slicer_Year_p1`) | `SLICER_DEFAULT` | Vorauswahl DimDate.Year = 2026: `pbir add filter` legt einen kategorialen Visual-Filter an. In Desktop pruefen, ob die Auswahl im Slicer sichtbar ist — sonst dort einmal klicken und speichern. |
