# Analyse-To-dos

Was der Analyse-Block der Spec (v3) verlangt und `pbir` **nicht** direkt setzen kann. Alles andere steht bereits in den `<Seitenslug>/analysis-commands.sh`.

| Seite | Kachel | Code | Was zu tun ist |
|---|---|---|---|
| Übersicht | Umsatz (`mk_5z33e3b`) | `CK_INVERT` | ChartKitchen-Slot: `chart.invert = true` setzen (kleiner = besser). |
| Übersicht | Kosten (`mk_9rdsrnj`) | `POLARITY` | Polaritaet „kleiner = besser": natives Visual faerbt nicht automatisch um. ChartKitchen: `chart.invert = true`; nativ: bedingte Formatierung oder Farbe pruefen. (aus dem Kennzahlnamen abgeleitet) |
| Übersicht | Umsatz je Region (`mk_bars01`) | `UNIT` | Einheit „T€" als Untertitel gesetzt — im Bericht gegenlesen. |
| Übersicht | Umsatz je Region (`mk_bars01`) | `SCALE_GROUP` | Gemeinsame Skala „A": Wertachse auf allen Kacheln der Gruppe auf denselben Bereich setzen (`pbir visuals axis <Visual> value --min <a> --max <b>`). |
| Übersicht | Umsatz je Region (`mk_bars01`) | `MESSAGE` | Kernaussage „Süd liegt 8 % unter Plan." als Titelzeile pruefen (Titel steht derzeit auf „Umsatz je Region"). |
| Übersicht | Brücke AC vs PL (`mk_wf01`) | `SORT_NOT_NATIVE` | Sortierung delta desc: Kachel ist kein natives Visual im Bericht (ChartKitchen/Deneb regeln das selbst). |
| Übersicht | Brücke AC vs PL (`mk_wf01`) | `DISPLAY_UNITS_SLOT` | Anzeigeeinheit M / 0 Dezimalstellen im ChartKitchen- bzw. Deneb-Slot setzen. |
| Übersicht | Brücke AC vs PL (`mk_wf01`) | `TIME_GRAIN` | Zeitgranularitaet „quarter": das Kategorie-Feld muss auf dieser Ebene gebunden sein (Datumshierarchie oder eigene Spalte). pbir bindet, was in der Spec steht. |
| Übersicht | Brücke AC vs PL (`mk_wf01`) | `CUMULATIVE` | Kumulierte Darstellung (YTD) braucht eine YTD-Kennzahl im Modell (TOTALYTD/DATESYTD) — nicht im Bericht loesbar. |
| Übersicht | Brücke AC vs PL (`mk_wf01`) | `SCALE_GROUP` | Gemeinsame Skala „A": Wertachse auf allen Kacheln der Gruppe auf denselben Bereich setzen (`pbir visuals axis <Visual> value --min <a> --max <b>`). |
| Übersicht | Brücke AC vs PL (`mk_wf01`) | `DELTA_BASIS` | Δ-Basis FC -> ChartKitchen-Rolle `forecast` belegen. |
| Übersicht | Year (`mk_slicer_Year_p1`) | `SLICER_DEFAULT` | Vorauswahl DimDate.Year = 2026: `pbir add filter` legt einen kategorialen Visual-Filter an. In Desktop pruefen, ob die Auswahl im Slicer sichtbar ist — sonst dort einmal klicken und speichern. |
| Detail Produktlinie | Umsatz und Marge (`mk_cl01`) | `SORT_NOT_NATIVE` | Sortierung category asc: Kachel ist kein natives Visual im Bericht (ChartKitchen/Deneb regeln das selbst). |
| Detail Produktlinie | Umsatz und Marge (`mk_cl01`) | `TIME_GRAIN` | Zeitgranularitaet „month": das Kategorie-Feld muss auf dieser Ebene gebunden sein (Datumshierarchie oder eigene Spalte). pbir bindet, was in der Spec steht. |
| Detail Produktlinie | Umsatz und Marge (`mk_cl01`) | `DELTA_BASIS` | Δ-Basis PY -> ChartKitchen-Rolle `previousYear` belegen. |
| Detail Produktlinie | Year (`mk_slicer_Year_p2`) | `SLICER_DEFAULT` | Vorauswahl DimDate.Year = 2026: `pbir add filter` legt einen kategorialen Visual-Filter an. In Desktop pruefen, ob die Auswahl im Slicer sichtbar ist — sonst dort einmal klicken und speichern. |
