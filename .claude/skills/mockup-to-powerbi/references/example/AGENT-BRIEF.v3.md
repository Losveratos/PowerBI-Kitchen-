# AGENT-BRIEF · Management Report · Beispiel

Erzeugt von MockupKitchen byDatenWG 0.3 am 2026-09-18 · Spec v3 · Hash `4d42e99d` · Sprache de. Maschinenlesbare Fassung: `mockup-spec.json`. Umsetzung mit dem Skill `mockup-to-powerbi`.

## Berichtskopf

- **Zielgruppe:** GF
- **Ziel:** Monatliche Steuerung Umsatz und Marge
- **Entscheidung:** Maßnahmen bei Planabweichung > 5 %
- **Version:** 0.1 · **Datenstand:** [offen]

## Canvas und Gestaltung

- 2 Seite(n), alle 1280 × 720 px. Skalierung ×1 gegenüber HD.
- Rand 16 px · Zwischenraum 12 px · Kachel-Innenabstand 8 px.
- Kacheln: Ecken 12 px, Stil „weiß mit weichem Schatten", Kachelhintergrund #FFFFFF, Seitenhintergrund #EEF1F5.
- Kopfband-Stil „light", Akzentfarbe #C25A2D. Schriften proportional zur Skalierung (Visual-Titel ≈ 12 pt).
- Gestaltung bevorzugt als Theme-Fragment umsetzen (visualStyles), Overrides je Visual nur für Ausnahmen.

## Zonen (Chrome, auf jeder Seite identisch)

| Zone | x | y | w | h | Inhalt |
|---|---|---|---|---|---|
| Kopfband (light) | 0 | 0 | 1280 | 56 | weiße Fläche mit Unterkante, dunkle Schrift, Logo rechts (Höhe 32), Titel „Management Report" · Untertitel „in T€ · YTD 2026", Nav-Buttons: Übersicht · Detail Produktlinie (Seitennavigation, aktive Seite als deaktivierter Akzent-Button), Burger-Button links (öffnet Filter-Bookmark) |
| Filter (Overlay per Burger-Menü, per Bookmark ein-/ausblendbar) | 1080 | 56 | 200 | 640 | Slicer gestapelt: `DimDate.Year` = 2026, `DimRegion.Region`; Bookmarks: „Filter öffnen" / „Filter schließen" |
| Fußleiste | 0 | 696 | 1280 | 24 | Textfeld 9 pt grau: „Stand: 18.09.2026 · Quelle: DWH · Kontakt: Controlling" |
| Inhaltsbereich | 16 | 72 | 1248 | 608 | alle Visuals liegen exakt hier drin |

## Seite 1 · Übersicht

**Fragestellung:** Liegen wir im Plan?

### 1.1 Umsatz `mk_5z33e3b`

- **Typ:** KPI-Kachel (IBCS) (`kpi`) · **Engine:** ChartKitchen · ChartKitchen-Modus `cards` · natives Visual `card`
- **Position:** x=16, y=72, w=317, h=119 · **stabile ID:** `5z33e3b`
- **Datenrollen:**
  - Kennzahl: `_Measures.Kosten`
  - Ziel / Referenz: `_Measures.PL`
- **pbir-Buckets (card):** Values ← _Measures.Kosten
- **Analyse:** Polarität kleiner = besser · Δ-Basis PL (auto), Δ abs + rel

### 1.2 Kosten `mk_9rdsrnj`

- **Typ:** Karte (nativ) (`card`) · **Engine:** Nativ · natives Visual `card`
- **Position:** x=345, y=72, w=312, h=119 · **stabile ID:** `9rdsrnj`
- **Datenrollen:**
  - Kennzahl: `_Measures.Kosten`
- **pbir-Buckets (card):** Values ← _Measures.Kosten
- **Analyse:** Polarität kleiner = besser (auto) · Δ-Basis PL (auto), Δ abs + rel

### 1.3 Deckungsbeitrag `mk_7ixiebk`

- **Typ:** KPI-Kachel (IBCS) (`kpi`) · **Engine:** ChartKitchen · ChartKitchen-Modus `cards` · natives Visual `card`
- **Position:** x=669, y=72, w=330, h=119 · **stabile ID:** `7ixiebk`
- **Datenrollen:**
  - Ziel / Referenz: `_Measures.PL`
- **Analyse:** Polarität größer = besser (auto) · Δ-Basis PL (auto), Δ abs + rel
- ⚠ Pflichtrolle „Kennzahl" ist leer

### 1.4 Marge `mk_ldc3xxy`

- **Typ:** KPI-Kachel (IBCS) (`kpi`) · **Engine:** ChartKitchen · ChartKitchen-Modus `cards` · natives Visual `card`
- **Position:** x=1011, y=72, w=253, h=119 · **stabile ID:** `ldc3xxy`
- **Datenrollen:**
  - Kennzahl: `_Measures.Marge`
  - Ziel / Referenz: `_Measures.PL`
- **pbir-Buckets (card):** Values ← _Measures.Marge
- **Analyse:** Polarität größer = besser (auto) · Δ-Basis PL (auto), Δ abs + rel

### 1.5 Δ PL je Produktlinie `mk_7rbkjp5`

- **Typ:** Wasserfall horizontal + Varianz (`wfint`) · **Engine:** ChartKitchen · ChartKitchen-Modus `intwaterfall`
- **Position:** x=16, y=203, w=782, h=477 · **stabile ID:** `7rbkjp5`
- **Szenario:** AC/PL
- **Datenrollen:**
  - Kategorie / Achse: `DimProduct.Category`
  - AC · Ist-Wert: `_Measures.AC`
  - Referenz (PL / PY / BU): `_Measures.PL`
- **Analyse:** Polarität größer = besser (auto) · Δ-Basis PL (auto), Δ abs + rel
- **Springt zu:** Seite „Detail Produktlinie" (Drill-through; Zielseite mit Drill-through-Feld aus der Kategorie dieses Visuals)
- **Notizen:** Klick auf eine Kategorie springt in die Detailseite. Offen: Sortierung nach Δ oder AC?

### 1.6 Umsatz AC/FC vs PL je Monat `mk_kv12rex`

- **Typ:** Integrierte Varianzanalyse (`varint`) · **Engine:** ChartKitchen · ChartKitchen-Modus `intwaterfall`
- **Position:** x=810, y=203, w=454, h=233 · **stabile ID:** `kv12rex`
- **Untertitel / Einheit:** in T€
- **Szenario:** AC/PL/FC
- **Datenrollen:**
  - Zeit / Periode: `DimDate.Month`
  - AC · Ist-Wert: `_Measures.AC`
  - Referenz (PL / PY / BU): `_Measures.PL`
  - FC-Flag (1/0): `DimDate.IsForecast`
- **Analyse:** Polarität größer = besser (auto) · Δ-Basis PL (auto), Δ abs + rel

### 1.7 Kommentar `mk_98ziklb`

- **Typ:** Textfeld (`text`) · **Engine:** Nativ · natives Visual `textbox`
- **Position:** x=810, y=448, w=454, h=232 · **stabile ID:** `98ziklb`
- **Text:** Umsatz 8 % über Plan, Süd unter Plan wegen Lieferverzug.
- **Datenrollen:** keine gebunden


## Seite 2 · Detail Produktlinie

### 2.1 Detail: gewählte Produktlinie `mk_p6km182`

- **Typ:** Textfeld (`text`) · **Engine:** Nativ · natives Visual `textbox`
- **Position:** x=16, y=72, w=612, h=149 · **stabile ID:** `p6km182`
- **Datenrollen:** keine gebunden
- **Notizen:** Drill-through-Ziel. Titel zeigt den gefilterten Wert (SELECTEDVALUE).

### 2.2 Umsatz `mk_nav2msq`

- **Typ:** KPI-Kachel (IBCS) (`kpi`) · **Engine:** ChartKitchen · ChartKitchen-Modus `cards` · natives Visual `card`
- **Position:** x=640, y=72, w=306, h=149 · **stabile ID:** `nav2msq`
- **Datenrollen:**
  - Kennzahl: `_Measures.Umsatz`
  - Ziel / Referenz: `_Measures.PL`
- **pbir-Buckets (card):** Values ← _Measures.Umsatz
- **Analyse:** Polarität größer = besser (auto) · Δ-Basis PL (auto), Δ abs + rel

### 2.3 Marge % `mk_ap1p6su`

- **Typ:** KPI-Kachel (IBCS) (`kpi`) · **Engine:** ChartKitchen · ChartKitchen-Modus `cards` · natives Visual `card`
- **Position:** x=958, y=72, w=306, h=149 · **stabile ID:** `ap1p6su`
- **Datenrollen:**
  - Kennzahl: `_Measures.Marge%`
  - Ziel / Referenz: `_Measures.PL`
- **pbir-Buckets (card):** Values ← _Measures.Marge%
- **Analyse:** Polarität größer = besser (auto) · Δ-Basis PL (auto), Δ abs + rel

### 2.4 Einzelpositionen `mk_hw8ifcv`

- **Typ:** IBCS-Tabelle (`table`) · **Engine:** ChartKitchen · ChartKitchen-Modus `table` · natives Visual `tableEx`
- **Position:** x=16, y=233, w=742, h=447 · **stabile ID:** `hw8ifcv`
- **Szenario:** AC/PL
- **Datenrollen:**
  - Zeilen: `DimProduct.Product`
  - AC · Ist-Wert: `_Measures.AC`
  - Referenz (PL / PY / BU): `_Measures.PL`
- **pbir-Buckets (tableEx):** Values ← DimProduct.Product, _Measures.AC, _Measures.PL
- **Analyse:** Polarität größer = besser (auto) · Δ-Basis PL (auto), Δ abs + rel

### 2.5 Verlauf 24 Monate `mk_6g7nfw6`

- **Typ:** Linie (AC vs Referenz) (`line`) · **Engine:** ChartKitchen · ChartKitchen-Modus `line` · natives Visual `lineChart`
- **Position:** x=770, y=233, w=494, h=447 · **stabile ID:** `6g7nfw6`
- **Szenario:** AC/PY
- **Datenrollen:**
  - AC · Ist-Wert: `_Measures.AC`
  - Referenz (PL / PY / BU): `_Measures.PY`
- **pbir-Buckets (lineChart):** Y ← _Measures.AC, _Measures.PY
- **Analyse:** Polarität größer = besser (auto) · Δ-Basis PY (auto), Δ abs + rel
- ⚠ Pflichtrolle „Zeit / Periode" ist leer

## Navigation und Drill

| Von (Visual) | Seite | Nach Seite | Art | Drill-Feld |
|---|---|---|---|---|
| `mk_7rbkjp5` | Übersicht | Detail Produktlinie | drillthrough | `DimProduct.Category` |

## Kennzahlen-Steckbrief (gebundene Felder)

| Feld | Alias (Fachbereich) | Definition laut Modell | Format | Einheit | Owner | Quelle | Ziel | bestätigt |
|---|---|---|---|---|---|---|---|---|
| `_Measures.Kosten` | – | – | #,##0 | – | – | – | – | nein |
| `_Measures.PL` | – | Plan | #,##0 | – | – | – | – | nein |
| `_Measures.Marge` | – | Umsatz − Kosten | #,##0 | – | – | – | – | nein |
| `DimProduct.Category` | – | Produktlinie | – | – | – | – | – | nein |
| `_Measures.AC` | – | Ist | #,##0 | – | – | – | – | nein |
| `DimDate.Month` | – | Monatsname, sortiert nach MonthKey | – | – | – | – | – | nein |
| `DimDate.IsForecast` | – | 1 = Forecast-Monat, 0 = Ist | – | – | – | – | – | nein |
| `_Measures.Umsatz` | Nettoerlös | – | #,##0 | – | – | – | – | ja |
| `_Measures.Marge%` | – | – | 0.0% | – | – | – | – | nein |
| `DimProduct.Product` | – | – | – | – | – | – | – | nein |
| `_Measures.PY` | – | Vorjahr | #,##0 | – | – | – | – | nein |
| `DimDate.Year` | – | – | – | – | – | – | – | nein |
| `DimRegion.Region` | – | – | – | – | – | – | – | nein |

## Regeln für die Umsetzung

- Positionen und Größen exakt übernehmen; nichts „optisch nachjustieren". Rundungen ±1 px sind ok.
- Visual-Namen im PBIR = `id` aus der Spec (stabil über Läufe hinweg); ein zweiter Lauf ist ein Delta, kein Neubau.
- Chrome-Zonen auf jeder Seite identisch anlegen; Nav-Buttons auf allen Seiten, aktive Seite als deaktivierter Akzent-Button.
- Kein Visual außerhalb des Inhaltsbereichs, keine Überlappung; Chrome-Zonen bleiben visualfrei.
- Text-Kacheln mit `content` als Shape mit Text bauen (Textbox per CLI bleibt leer).
- Analyse-Angaben je Kachel umsetzen: Polarität (invert), Δ-Basis, Sortierung, Top-N, Einheit/Dezimalen, Granularität; `auto`-Werte sind Vorschläge, keine Entscheidungen.
- ChartKitchen-Visuals nur über eine vorhandene Referenz-Instanz replizieren, nie visual.json raten. Fehlt die Instanz: Platzhalter und Hinweis.
- Native Visuals je Seite mit `pbir add visual "<Report>.Report/<Seite>.Page" --from-json pbir-visuals.<Seite>.json` anlegen; Visuals mit leeren Pflichtrollen sind dort nicht enthalten.
- Neue Felder zuerst im Semantikmodell anlegen (`te`), dann `te validate --errors-only`, erst danach binden. Umbenennungswünsche (Alias) nur nach Freigabe umsetzen.
- Farben/Schrift kommen aus dem Theme; dieser Brief regelt Struktur, Bindung und Design-Entscheidungen.

## Offene Punkte aus dem Mockup

- [warn] Seite „Übersicht" · `mk_7ixiebk`: Pflichtrolle „Kennzahl" leer
- [warn] Seite „Detail Produktlinie" · `mk_p6km182`: „Detail: gewählte Produktlinie" hat keinen Text; Kachel käme leer im Bericht an
- [warn] Seite „Detail Produktlinie" · `mk_6g7nfw6`: Pflichtrolle „Zeit / Periode" leer