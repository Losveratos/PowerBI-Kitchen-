# Desktop-Testplan · IBCS Inspired Chart Deck

**Vorbereitung (5 Min):**
1. `demo/demo-daten.csv` in Power BI Desktop importieren (Semikolon-getrennt).
2. Visual importieren: Visualisierungen → ⋯ → Visual aus Datei importieren →
   `dist/ibcsInspiredChartDeck….pbiviz`.
3. Measures anlegen (Modellansicht → Neues Measure):
   ```dax
   AC = SUM(Daten[AC])
   PY = SUM(Daten[PY])
   PL = SUM(Daten[PL])
   FC = SUM(Daten[FC])
   Kommentar M = MAX(Daten[Kommentar])
   ```
4. Visual aufziehen, Felder: Category=`Monat` (nach `MonatNr` sortieren!),
   Actual=`AC`, Previous Year=`PY`, Plan=`PL`, Forecast=`FC`, Comments=`Kommentar M`.

**Checkliste (je ~1 Min):**
- [ ] Grundbild: 3 Panels, FC-Monate schraffiert, Trennlinie, Σ-Header, Auto-Titel + Auto-Message
- [ ] Tooltip auf Säule: AC/PY/PL/ΔPL/ΔPL % korrekt formatiert
- [ ] Klick auf Monat filtert andere Visuals (Cross-Filtering); Strg = Mehrfachauswahl
- [ ] Rechtsklick: Kontextmenü mit Drillthrough-Einträgen (falls Detailseite existiert)
- [ ] Formatbereich (deutsch beschriftet): Orientation → Bars, Line, Waterfall durchschalten
- [ ] Chart → Dual variance an: 5 Panels (Visual höher ziehen)
- [ ] Chart → Cumulative (YTD) an: kumulierte Sicht, Σ bleibt 12,7M/… konsistent
- [ ] Chart → Highlight: "Jul" eintragen → Band + fettes Label
- [ ] Scale sync → Reference line: 1200000 / "Ziel"
- [ ] Comments: Marker ①–③ + Fußnotenspalte rechts; Visual schmal ziehen → Spalte verschwindet
- [ ] Small Multiples: `Region` ins Multiples-Feld → 2 Kacheln, gleiche Skala
- [ ] Forecast-Variante B: FC-Measure entfernen, stattdessen `FC_Flag` (Spalte!) in Forecast Flag
- [ ] Kachel klein ziehen (<190px hoch): Kompakt-Modus mit farbigen Δ-Labels
- [ ] Datum-Hierarchie testen: Category durch echtes Datum ersetzen → Drill-Pfeile
- [ ] Als PDF exportieren: Kommentar-Fußnoten und alle Panels sichtbar
- [ ] Leeres Visual (Felder entfernen): Live-Demo mit Hinweis-Pill

**Bekanntes Verhalten (kein Bug):**
- Relative Varianz bei Vorzeichenwechsel (z. B. Wert −30 vs. Basis +20) zeigt
  rechnerisch korrekte, aber große Prozentwerte (−250 %) — IBCS-typisch mit Vorsicht lesen.
- Wasserfall rendert immer vertikal.
- GUID-Wechsel: ältere importierte Versionen parallel entfernen.
