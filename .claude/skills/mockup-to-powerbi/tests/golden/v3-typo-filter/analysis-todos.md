# Analyse-To-dos

Was der Analyse-Block der Spec (v3) verlangt und `pbir` **nicht** direkt setzen kann. Alles andere steht bereits in den `<Seitenslug>/analysis-commands.sh`.

| Seite | Kachel | Code | Was zu tun ist |
|---|---|---|---|
| Übersicht | Kosten je Region (`mk_bar1`) | `POLARITY` | Polaritaet „kleiner = besser": natives Visual faerbt nicht automatisch um. ChartKitchen: `chart.invert = true`; nativ: bedingte Formatierung oder Farbe pruefen. (aus dem Kennzahlnamen abgeleitet) |
| Übersicht | Year (`mk_slicer_Year_p1`) | `SLICER_DEFAULT` | Vorauswahl DimDate.Year = 2026: `pbir add filter` legt einen kategorialen Visual-Filter an. In Desktop pruefen, ob die Auswahl im Slicer sichtbar ist — sonst dort einmal klicken und speichern. |
| Detail | Year (`mk_slicer_Year_p2`) | `SLICER_DEFAULT` | Vorauswahl DimDate.Year = 2026: `pbir add filter` legt einen kategorialen Visual-Filter an. In Desktop pruefen, ob die Auswahl im Slicer sichtbar ist — sonst dort einmal klicken und speichern. |
