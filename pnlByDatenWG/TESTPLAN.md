# P&L Statement byDatenWG · Aufbau- & Testplan (v0.3.0.0)

Für dein bereits angelegtes Power-BI-Projekt. Ziel: Visual mit dem
Pharma-Demodatensatz zum Laufen bringen, alle v0.3-Funktionen einmal
durchtesten — und am Ende das Projekt so speichern, dass Claude daraus
Seiten automatisch generieren kann (Referenz-Instanz).

Dauer: ca. 20–30 Minuten.

---

## 0 · Voraussetzungen

- Power BI Desktop (aktuelle Version)
- Einmalig unter **Datei → Optionen → Vorschaufeatures** aktivieren + Neustart:
  - ☑ *Store semantic model using TMDL format*
  - ☑ *Store reports using enhanced metadata format (PBIR)*
  - (Beides nötig, damit das Projekt als Text-Dateien gespeichert wird —
    nur so kann Claude später hineinschreiben.)
- Dateien aus dem Repo (Branch `claude/visual-chartkitchen-git-link-rvi81z`):
  - `pnlByDatenWG/dist/pnlByDatenWG…0.3.0.0.pbiviz`
  - `pnlByDatenWG/demoData/pharma/pharma-dim-konten.csv`
  - `pnlByDatenWG/demoData/pharma/pharma-fact-guv.csv`

---

## 1 · Daten laden

1. **Daten abrufen → Text/CSV** → `pharma-dim-konten.csv` (Semikolon wird
   automatisch erkannt; Vorschau prüfen: 10 Spalten inkl. L1/L2/L3).
2. Ebenso `pharma-fact-guv.csv` laden (AccountID, Monat, AC, PY, PL, FC_FY, PL_FY).
3. **Wichtig in Power Query (Transformieren):**
   - `pharma-dim-konten`: Spalten `SortOrder`, `SignConvention` als *Ganze Zahl*;
     alle anderen als *Text* belassen (auch `DisplayInvert`/`VarianceInvert` —
     das Visual parst „true/false" selbst).
   - `pharma-fact-guv`: `AC`, `PY`, `PL`, `FC_FY`, `PL_FY` als *Dezimalzahl*,
     `Monat` als *Text* (Format `2026-01`), `AccountID` als *Text*.
4. Schließen & anwenden.

## 2 · Modell

1. **Modellansicht**: Beziehung `pharma-dim-konten[AccountID]` (1) → (*)
   `pharma-fact-guv[AccountID]`, Kreuzfilterrichtung „Einzeln".
2. **Measures** anlegen (auf `pharma-fact-guv`):

   ```dax
   AC =  SUM ( 'pharma-fact-guv'[AC] )
   PY =  SUM ( 'pharma-fact-guv'[PY] )
   PL =  SUM ( 'pharma-fact-guv'[PL] )
   FC FY = MAX ( 'pharma-fact-guv'[FC_FY] )   // FY-Skalar: MAX statt SUM!
   PL FY = MAX ( 'pharma-fact-guv'[PL_FY] )
   ```

   > Die FY-Werte stehen auf jeder Monatszeile identisch — `MAX` (oder
   > `AVERAGE`) liefert den Skalar; `SUM` wäre 6-fach zu groß. Das Visual
   > sichert das zusätzlich ab (first-wins), aber sauber im Modell ist besser.
3. Optional: die 5 Wertspalten der Faktentabelle ausblenden (nur Measures nutzen).

## 3 · Visual importieren & platzieren

1. **Visualisierungen → ⋯ → Visual aus einer Datei importieren** →
   `pnlByDatenWG…0.3.0.0.pbiviz`.
2. Visual auf die Seite ziehen, groß aufziehen (mind. ~1200×800 px —
   Toolbar + zwei Spaltenblöcke brauchen Breite).
3. Felder zuweisen (Reihenfolge bei den Ebenen-Spalten beachten!):

   | Field Well | Feld |
   |---|---|
   | Ebenen-Spalten (L1..Ln) | `L1`, dann `L2`, dann `L3` (aus dim-konten) |
   | Konto-ID (Key) | `AccountID` (dim) |
   | Sortierung | `SortOrder` |
   | Zeilentyp | `RowType` |
   | Formeldefinition | `FormulaDef` |
   | Rechenvorzeichen (±1) | `SignConvention` |
   | Anzeige invertieren | `DisplayInvert` |
   | Abweichungsfarbe drehen | `VarianceInvert` |
   | Kommentar | `Kommentar` |
   | Periode (Monat) | `pharma-fact-guv[Monat]` |
   | AC / PY / PL | Measures `AC`, `PY`, `PL` |
   | FC Gesamtjahr / PL Gesamtjahr | Measures `FC FY`, `PL FY` |

   Alle Grouping-Felder: **„Nicht zusammenfassen"**.
4. Format-Pane → **Titelblock**: Zeile 1 `Daten-WG Knowledgekitchen Group ·
   Consolidated`, Zeile 2 `Income statement (P&L) in mEUR`, Message-Zeile
   nach Geschmack.

## 4 · Abnahme-Checks (Reconciliation)

Alle Monate ausgewählt (kein Filter):

- [ ] **EBITDA** YTD AC = **571,2** (PY 499,6 · PL 532,0)
- [ ] **EBIT** = 475,6 · **EBT** = 458,8 · **Jahresüberschuss** = 339,5
- [ ] EBITDA-Marge ≈ 33,9 % (kursiv, pp-Delta statt Balken)
- [ ] FY-Block rechts zeigt FC/PL Gesamtjahr mit **schraffierten** Δ-Balken
- [ ] Kostenzeilen (COGS, Opex …) positiv angezeigt; „unter Plan" = Teal
- [ ] Kommentar-Marker ① ② an License-/FX-Zeilen + Fußnoten-Sektion unten
- [ ] Konten-IDs (402010, 750110 …) klein vor den Namen

## 5 · Funktionstests (Toolbar)

- [ ] **Presets** durchschalten: AC·PY·PL·FC → AC·PL·ΔPL → ΔPY%·ΔPL% —
  Spalten wechseln, Δ-Skala bleibt je Ansicht einheitlich (Hinweiszeile oben rechts)
- [ ] **Δ-Referenz** PY↔PL: Balkenfarben und Achsen wechseln
  (PY = graue Achse, PL = Doppellinie)
- [ ] **kEUR ↔ mEUR**: Werte skalieren um, Titel-Einheit folgt
- [ ] **Compact**: Zeilenhöhe/Schrift verkleinern
- [ ] **Ebenen 1/2/3/Alle** + einzelne Chevrons ▸▾
- [ ] **% of revenue** an/aus · **Hide zero rows** an/aus
- [ ] **Waterfall**: Ansicht wechselt — Anker (Net revenue, Gross profit,
  EBITDA, EBIT, EBT, Net income) stehen auf der Nulllinie, Kostenblöcke floaten
- [ ] **12M**-Chip an einer Zeile: Sparkline klappt auf (AC solide, PY dünn)
- [ ] **Monats-Slicer** auf `Monat` (z. B. nur Jan–Mrz): alle Zahlen inkl.
  Formelzeilen rechnen live neu
- [ ] **Bookmark-Test**: Zustand A (Ebene 1, Waterfall) und Zustand B
  (Alle auf, Tabelle) als Lesezeichen speichern → Umschalten stellt beides her
- [ ] Datei schließen & neu öffnen: letzter Toolbar-Zustand bleibt erhalten

## 6 · Format-Pane-Tests

- [ ] **Stil → Abweichungsfarben** auf „IBCS classic green" → Grün statt Teal,
  Deviation-Hinweis verschwindet aus Legende/Footer
- [ ] **Toolbar → anzeigen** aus → Leser-UI weg, Einstellungen wirken weiter
- [ ] **Spalten → Umsatz-Basiszeile**: leer = „Net revenue" automatisch;
  Test: `EBITDA` eintragen → %Rev-Spalte rechnet auf EBITDA-Basis

## 7 · Speichern für die Automatisierung (wichtig!)

1. **Datei → Speichern unter → Power BI Projekt (.pbip)** in deinen
   Projektordner (falls noch nicht als PBIP gespeichert).
2. Prüfen: Im Ordner liegt `…Report/definition/pages/<seite>/visuals/<id>/visual.json`
   und darin die GUID `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358`.
3. **Diesen Projektordner an Claude geben** (ins Repo committen oder als
   Upload). Die gespeicherte `visual.json` ist die Referenz-Instanz — damit
   kann Claude ab dann Visual-Instanzen inkl. Feld-Zuweisung vollautomatisch
   in Seiten einsetzen (z. B. die 5.000-Zeilen-Demo).

## 8 · Bekannte Grenzen v0.3 (erwartetes Verhalten, keine Bugs)

- DataView-Limit 30.000 Zeilen → sichtbare Warnung statt stillem Kappen
  (5.000 Konten × 6 Monate = genau am Limit; `fetchMoreData` ist Roadmap)
- Kein Virtual Scrolling: > ~1.000 sichtbare Zeilen aufgeklappt wird träge —
  Ebenen-Buttons nutzen
- Waterfall nutzt die Wurzelebene der Hierarchie (kein Drill im Waterfall)

## Fehlerbilder-Referenz

| Symptom | Ursache |
|---|---|
| „Not assigned"-Zeile rot mit ⚠ | ParentAccountID/Level-Pfad zeigt ins Leere — gewollt sichtbares Datenqualitäts-Signal |
| Zeile zeigt `⚠ cycle` | Zirkelbezug in FormulaDef oder Parent-Child |
| Formelzeile zeigt `·` | Referenzname nicht eindeutig oder Szenario ohne Daten |
| FY-Spalten 6-fach zu groß | FY-Measure als SUM statt MAX angelegt (→ Schritt 2) |
| Alle Werte leer | Grouping-Felder als „Zusammenfassen" statt „Nicht zusammenfassen" |
