# Demo-Daten für die GuV- und Brücken-Modi

Drei CSVs (Semikolon-getrennt, deutsches Dezimalkomma, Werte in T€) zum
Testen der Brücken-Charts. In Power BI Desktop: **Daten abrufen →
Text/CSV**, Trennzeichen Semikolon, Gebietsschema Deutsch.

## guv_wasserfall_demo.csv — GuV-Wasserfall & Tabelle

Konsistente Mini-GuV (Zwischensummen rechnen auf): Umsatz → EBT mit
Margen-Zeilen. Feld-Mapping im Visual:

| Feld im Visual   | Spalte     |
| ---------------- | ---------- |
| Category         | `Position` |
| Actual (AC)      | `AC`       |
| Previous Year    | `PY`       |
| Plan / Budget    | `PL`       |
| Waterfall Type   | `Typ`      |

- `Typ`: `sum` = Zwischensumme (Anker), `delta` = Bewegung,
  `pct` = Margen-Zeile (Wert in %, Δ in Prozentpunkten, keine €-Grafik)
- Kosten-Zeilen sind **negativ** — so erwartet es der Wasserfall
- Sortierung: Spalte `Position` in Power BI **nach `Nr` sortieren**
  (Spalte auswählen → Nach Spalte sortieren), sonst alphabetisch
- Modi zum Testen: Orientation **Waterfall** (GuV-Kaskade) und
  **Table** (AC·PY-Balken + Varianz-Spalten + Margen-Zeilen)

## kategorie_bruecke_demo.csv — Kategorie-Brücke (Struktur)

Umsatz nach 10 Segmenten, AC + PY + PL. Mapping: Category = `Segment`,
Rest wie oben (kein Waterfall Type nötig). Orientation
**Kategorie-Brücke** wählen. Enthaltene Test-Szenarien:

- UK & Irland = größter negativer Treiber (Treiber-Notiz)
- Mix aus Verbesserungen/Verschlechterungen für ΔPY%/ΔPL%-Pins
- ΔPY|ΔPL-Button im Chart umschaltbar (beide Basen gebunden)
- „PY als Dreieck" zeigt die Vorjahres-Dreiecke an den Balken

## integrierte_bruecke_demo.csv — Integrierte Brücke (Zeit)

12 Monate, AC Jan–Aug, FC Sep–Dez, PY + PL durchgehend. Mapping:
Category = `Monat` (nach `MonatNr` sortieren), Forecast (FC) = `FC`.
Orientation **Integrierte Brücke** wählen. Zeigt: zwei Totalsäulen
links (PY + PL), versetzte PL-Umriss-Minisäulen, PY-Dreiecke,
AC|FC-Trennlinie, schraffierte FC-Stufen, Netto-Callout.
