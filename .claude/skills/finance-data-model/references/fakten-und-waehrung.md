# FaktFinanz, Perioden, Measures und Währung

Zwei ausgearbeitete Varianten, zwischen denen die Bedarfs-Befragung verzweigt:

| | **Variante A · Nur Euro** (Standard) | **Variante B · Fremdwährung (LC/CC)** |
|---|---|---|
| Wann | alle Werte liegen in EUR vor (auch EUR-Export) | mindestens eine Gesellschaft oder ein Konto bucht in Fremdwährung |
| Fakten | `AccountID · Datum · AC · PY · PL · FC` (+ `PL_FY · FC_FY`) | wie A **plus** `Currency`, Werte in Local Currency |
| Kurstabelle | keine | `DimKurs`: Periode × Währung × Kursart |
| Measures | dünne Wrapper (`SUM`, `CALCULATE`) | Umrechnung je Monat × Währung, Kursart je Szenario |
| Demo | `assets/demo-euro/` | `assets/demo-fx/` |

**Einfacher ist besser:** Ergibt die Befragung keine Fremdwährung, ist
Variante A die Empfehlung — auch wenn „vielleicht irgendwann" Fremdwährung
kommt. Die Kontendimension ist in beiden Varianten identisch; der Umstieg A → B
betrifft nur die Faktentabelle, eine neue Kurstabelle und die Measures.

## Inhalt
1. Gemeinsame Regeln: Grain, Perioden, breit oder schmal
2. Measure-Schicht: Rollen-Measures, kein YTD im Modell
3. Variante A · Nur Euro
4. Variante B · Fremdwährung (LC/CC)
5. Kursarten je Vergleich — fachlich übliche Kombinationen
6. Mengen- und FTE-Zeilen
7. Brücke zu ChartKitchen
8. Abnahme-Werte der Demos

## 1 · Gemeinsame Regeln

### Grain und Perioden
- **Ein Wert je Konto × Monat** (in Variante B zusätzlich je Währung bzw.
  Gesellschaft). Tages- oder Belegdaten vorher auf den Monat verdichten.
- **Datum = Monatsende** (`2026-01-31`, `2026-02-28` …) mit Beziehung zu einer
  Datumstabelle. Das P&L-Visual bekommt eine **Monatsspalte**, am robustesten
  Text `JJJJ-MM` (`Datum[Monat] = FORMAT ( Datum[Datum], "YYYY-MM" )`), weil
  ein Datumsfeld im Feldbereich sonst als Datumshierarchie landet. Gelesen
  werden auch Datum, `JJJJ/MM`, Monatsnamen DE/EN und `1..12`.
- **Fiskaljahr** (z. B. Oktober–September): Monatsspalte mit „Sortieren nach"
  einer Fiskal-Periodennummer, im P&L-Visual `columns.periodSort = data`, in
  ChartKitchen `chart.fiscalStart`.

Wie die Visuals aus den Monaten ihre Blöcke ableiten:

| Block | P&L Statement | ChartKitchen |
|---|---|---|
| Monat | letzter Monat **mit AC-Daten** (nicht der letzte der Achse) | Kategorie = Monat |
| YTD | periodengleiches Fenster bis dorthin; PY/PL/FC werden auf dasselbe Fenster gekürzt | `chart.cumulative` / YTD-Knopf (`cumulativeKind`, `fiscalStart`) |
| FY | `fcFy` (AC&FC) gegen `plFy`; PY = Σ aller PY-Monate | — |

Daraus folgen drei Modellregeln:
1. **AC ist für offene Monate leer, nie 0.** Eine 0 im Oktober macht den
   Oktober zum Ist-Monat.
2. **PY, PL und FC über alle 12 Monate liefern**, damit der FY-Block und die
   PY-Summe vollständig sind.
3. **Im Bericht ein Berichtsjahr filtern**, nicht einzelne Monate — die
   Visuals bestimmen Monat und YTD selbst. Wer einen früheren Stichtag zeigen
   will, kappt AC im Measure (siehe §2).

### FC als Version „n+m"
Der Forecast ist eine vollständige Jahresversion: Ist-Monate tragen die
Istwerte, offene Monate die Prognose (Datenstand September = „9+3"). So
- funktionieren die FC-Templates des P&L-Visuals (T02E/F, T03B, T04D/E) auch im
  Monats- und YTD-Block,
- zeigt ChartKitchen FC automatisch nur dort, wo AC fehlt (`acFcSplit = off`),
- ist `AC&FC FY = Σ FC` über das Jahr.

### Breit oder schmal

| | Breit: je Szenario eine Spalte | Schmal: `Szenario` + `Wert` |
|---|---|---|
| Spalten | `AC · PY · PL · FC (· PL_FY · FC_FY)` | `Szenario` (AC/PL/FC/…) · `Wert` |
| Measures | `SUM` je Spalte | `CALCULATE ( [Wert], Szenario = … )` |
| Neue Version (FC2, Budget-Revision) | Schemaänderung | neue Zeilen, kein Umbau |
| PY | eigene Spalte auf den Zeilen des Berichtsjahrs | aus AC per Zeitintelligenz (keine Doppelablage) |
| Passt für | Excel-/CSV-Lieferungen, kleine Modelle, Demos | ERP/Planungstool liefert Versionen, mehrere Jahre, mehrere Forecasts |

**Empfehlung:** schmal für produktive Modelle mit Planungssystem; breit, wenn
die Quelle breit liefert und die Szenarien fest sind. Die Demos sind breit
(direkt importierbar). Von breit nach schmal ist es ein Power-Query-Schritt:
`Table.UnpivotOtherColumns ( Quelle, {"AccountID", "Datum", "Periode"}, "Szenario", "Wert" )`.

### FY-Ausblick
- **Breit:** `PL_FY` / `FC_FY` als Skalare, auf **jeder** Monatszeile eines
  Kontos gleich. Das Visual nimmt den ersten Wert; das Measure aggregiert mit
  `MAX` (oder `AVERAGE`), **nie `SUM`** — sonst zwölffach.
- **Schmal / Variante B:** als Measure aus den Monatswerten (unten). In
  Fremdwährung immer so, denn ein LC-Jahresskalar lässt sich nicht mit einem
  einzigen Kurs umrechnen.

## 2 · Measure-Schicht

Die Visuals bekommen **je Rolle genau ein Measure**: `AC`, `PY`, `PL`, `FC`,
optional `PL FY` (→ `plFy`) und `AC&FC FY` (→ `fcFy`). Jedes ist ein dünner
Wrapper — keine Zeitlogik, keine Zwischensummen, keine Vorzeichen.

**YTD, MTD und Kumulation gehören nicht ins Modell**, sondern ins Visual:
- Das P&L-Visual summiert die gelieferten Monate selbst. Ein gebundenes
  YTD-Measure würde je Monat erneut kumuliert (YTD von YTD), Sparklines und
  Monatssäulen wären falsch.
- Die Fensterlogik („PY/PL bis zum letzten AC-Monat") rechnet das Visual
  konsistent für alle Szenarien. Ein DAX-YTD für PY kennt den AC-Stichtag nicht
  und schneidet anders.
- Formeln und Margen im Visual brauchen additive Monatswerte; Zwischensummen,
  Formeln und Δ entstehen dort aus genau den Zahlen, die auch die Zeilen zeigen.
- Kein Measure-Zoo (AC, AC YTD, AC MTD, … × 4 Szenarien × Währungssichten).

Native Visuals daneben (Karten, Tabellen) dürfen eigene YTD-Measures haben —
nur nicht an die Rollen dieser beiden Visuals binden.

Stichtag vor dem letzten gebuchten Monat (optional, z. B. vorläufiger Oktober):

```DAX
AC =
VAR _bis = [Datenstand]   -- z. B. MAX ( Abschluss[Monatsende] ) der freigegebenen Perioden
RETURN CALCULATE ( SUM ( FaktFinanz[AC] ), KEEPFILTERS ( 'Datum'[Datum] <= _bis ) )
```

DAX-Regel für alle Varianten: nie `COALESCE ( x, 0 )` oder `+ 0` in Rollen-
Measures — Geisterzeilen. Wächter: `IF ( COUNTROWS ( FaktFinanz ) > 0, … )`.

## 3 · Variante A · Nur Euro

### Schema

```
DimKonto 1 ──* FaktFinanz *── 1 Datum
(Spaltenvertrag    AccountID · Datum (Monatsende) · AC · PY · PL · FC · PL_FY · FC_FY
 konten-dimension)
```

| Spalte | Typ | Regel |
|---|---|---|
| `AccountID` | Text | existiert in DimKonto |
| `Datum` | Datum | Monatsende |
| `AC` | Dezimal | leer für offene Monate |
| `PY` · `PL` · `FC` | Dezimal | alle 12 Monate; FC = Version n+m |
| `PL_FY` · `FC_FY` | Dezimal | Jahresskalar, je Konto auf jeder Monatszeile gleich |

Werte in EUR, Kosten **positiv** gebucht (Vorzeichen aus `SignConvention`).

### Measures (breit)

```DAX
AC        = SUM ( FaktFinanz[AC] )
PY        = SUM ( FaktFinanz[PY] )
PL        = SUM ( FaktFinanz[PL] )
FC        = SUM ( FaktFinanz[FC] )
PL FY     = MAX ( FaktFinanz[PL_FY] )   -- nur Rolle plFy
AC&FC FY  = MAX ( FaktFinanz[FC_FY] )   -- nur Rolle fcFy
```

### Measures (schmal)

```DAX
Wert      = SUM ( FaktFinanz[Wert] )
AC        = CALCULATE ( [Wert], FaktFinanz[Szenario] = "AC" )
PL        = CALCULATE ( [Wert], FaktFinanz[Szenario] = "PL" )
FC        = CALCULATE ( [Wert], FaktFinanz[Szenario] = "FC" )
PY        = CALCULATE ( [AC], SAMEPERIODLASTYEAR ( 'Datum'[Datum] ) )
PL FY     = CALCULATE ( [PL], REMOVEFILTERS ( 'Datum' ), VALUES ( 'Datum'[Jahr] ) )
AC&FC FY  = CALCULATE ( [FC], REMOVEFILTERS ( 'Datum' ), VALUES ( 'Datum'[Jahr] ) )
```

`SAMEPERIODLASTYEAR` braucht eine lückenlose, als Datumstabelle markierte
Tagestabelle; die Fakten hängen mit ihrem Monatsende daran.

### Demo laden (`assets/demo-euro/`)
1. Beide CSVs importieren: Text/CSV, Trennzeichen Semikolon, UTF-8. Die Werte
   sind ganze Euro ohne Tausendertrennzeichen.
2. Tabellen umbenennen in `DimKonto` und `FaktFinanz`; Beziehung
   `DimKonto[AccountID]` 1:* `FaktFinanz[AccountID]`.
3. Measures von oben (breit) anlegen.
4. P&L-Visual: `L1`, `L2` (Reihenfolge) → Ebenen · `AccountID` → Konto-ID ·
   `AccountName` → Kontoname · `SortOrder`, `RowType`, `FormulaDef`,
   `SignConvention`, `DisplayInvert`, `VarianceInvert`, `Comment` → gleichnamige
   Rollen · `FaktFinanz[Periode]` → Periode · Measures → AC/PY/PL/FC,
   `PL FY` → PL Gesamtjahr, `AC&FC FY` → FC Gesamtjahr. Visualfilter
   `DimKonto[Einheit] = EUR`.
5. Gegenrechnen mit §8.

## 4 · Variante B · Fremdwährung (LC/CC)

### Schema

```
DimKonto 1 ──* FaktFinanz *── 1 Datum            DimKurs (ohne Beziehung, Lookup)
              AccountID · Datum · Currency       Periode · Currency · Kursart · Kurs
              · AC · PY · PL · FC  (in LC)
```

| Tabelle · Spalte | Regel |
|---|---|
| `FaktFinanz[Currency]` | ISO-Code der Local Currency (`EUR`, `GBP`, `CHF`, `USD`); **eine Währung je Konto** — bucht ein Konto in mehreren Währungen (mehrere Gesellschaften), braucht die Fakten eine Spalte `Gesellschaft` und es gilt: eine Währung je Konto × Gesellschaft. Mengenzeilen: leer |
| `FaktFinanz[AC…FC]` | Werte in LC, Kosten positiv |
| `DimKurs[Periode]` | Monatsende, gleiche Perioden wie die Fakten |
| `DimKurs[Currency]` | jede Fakten-Währung; die Konzernwährung EUR mit Kurs 1 (dann braucht das Measure keinen Sonderfall) |
| `DimKurs[Kursart]` | `AKT` aktueller Ist-Kurs (Monatsdurchschnitt; für offene Monate den letzten Ist-Kurs fortschreiben) · `BUD` Budgetkurs (fix je Planjahr) · optional `VJ` Ist-Kurs des Vorjahresmonats |
| `DimKurs[Kurs]` | **Fremdwährung je 1 EUR** (EZB-Notierung: 1 EUR = 1,17 USD) → CC = LC / Kurs. Liefert die Quelle CC je Fremdwährung, wird multipliziert (Validator: `--kurs-multiplizieren`) |

Pflicht: für jede Fakten-Währung und **jede** Periode ein `AKT`- und ein
`BUD`-Kurs. Fehlt einer, ergibt `DIVIDE` leer — der Wert verschwindet still.
Der Validator prüft die Vollständigkeit.

### Measures

Ein Muster, je Szenario nur Spalte und Kursart getauscht:

```DAX
AC =                                   -- AC in CC zum aktuellen Kurs
SUMX (
    SUMMARIZE ( FaktFinanz, FaktFinanz[Datum], FaktFinanz[Currency] ),
    VAR _kurs =
        IF (
            LEN ( FaktFinanz[Currency] ) = 0, 1,   -- Mengenzeilen: unverändert
            LOOKUPVALUE ( DimKurs[Kurs],
                DimKurs[Periode],  FaktFinanz[Datum],
                DimKurs[Currency], FaktFinanz[Currency],
                DimKurs[Kursart],  "AKT" )
        )
    RETURN DIVIDE ( CALCULATE ( SUM ( FaktFinanz[AC] ) ), _kurs )
)
```

| Measure | Spalte | Kursart | Zweck |
|---|---|---|---|
| `AC` | `AC` | `AKT` | berichtetes Ist |
| `FC` | `FC` | `AKT` | Forecast zum aktuellen (fortgeschriebenen) Kurs |
| `PL` | `PL` | `BUD` | Plan **immer** zum Budgetkurs |
| `PY` | `PY` | `VJ` | Vorjahr wie damals berichtet |
| `AC @BUD` | `AC` | `BUD` | FX-bereinigtes Ist |
| `FC @BUD` | `FC` | `BUD` | FX-bereinigter Forecast |
| `PY @AKT` | `PY` | `AKT` | Vorjahr zu konstanten (aktuellen) Kursen |
| `FX-Effekt` | — | — | `[AC] - [AC @BUD]` |
| `AC LC` | `AC` | — | `IF ( HASONEVALUE ( FaktFinanz[Currency] ), SUM ( FaktFinanz[AC] ) )` — nur mit einer Währung im Filter sinnvoll |

FY-Ausblick aus den umgerechneten Monaten:

```DAX
PL FY     = CALCULATE ( [PL], REMOVEFILTERS ( 'Datum' ), VALUES ( 'Datum'[Jahr] ) )
AC&FC FY  = CALCULATE ( [FC], REMOVEFILTERS ( 'Datum' ), VALUES ( 'Datum'[Jahr] ) )
```

(Im Demo ohne Datumstabelle: `REMOVEFILTERS ( FaktFinanz[Datum], FaktFinanz[Periode] )`.)

### Kurssicht für die Visuals
Jede Rolle nimmt **ein** Measure. Damit Leser zwischen „berichtet" und
„zum Budgetkurs" wechseln, eine getrennte Tabelle als Slicer:

```DAX
Kurssicht = DATATABLE ( "Sicht", STRING, { { "berichtet" }, { "zum Budgetkurs" } } )

AC (Sicht) = IF ( SELECTEDVALUE ( Kurssicht[Sicht], "berichtet" ) = "zum Budgetkurs", [AC @BUD], [AC] )
FC (Sicht) = IF ( SELECTEDVALUE ( Kurssicht[Sicht], "berichtet" ) = "zum Budgetkurs", [FC @BUD], [FC] )
```

`PL` bleibt in beiden Sichten beim Budgetkurs. An die Rollen `ac`/`fc` bindet
man dann `AC (Sicht)` / `FC (Sicht)`; den Titel per `titleBlock.periodLine`
oder `filterInfo` um die Sicht ergänzen.

### Demo laden (`assets/demo-fx/`)
1. Drei CSVs importieren (Semikolon, UTF-8), umbenennen in `DimKonto`,
   `FaktFinanz`, `DimKurs`. `Kurs` hat einen Dezimalpunkt: bei deutschem
   Gebietsschema „Typ ändern → Mit Gebietsschema → Englisch (USA)".
2. Beziehung `DimKonto[AccountID]` 1:* `FaktFinanz[AccountID]`; `DimKurs`
   bleibt ohne Beziehung.
3. Measures `AC`, `PY`, `PL`, `FC`, `AC @BUD`, `FC @BUD`, `PL FY`, `AC&FC FY`
   nach dem Muster oben.
4. Visual wie in Variante A belegen (`L1`, `L2`, `L3`); Kurssicht als Slicer.

## 5 · Kursarten je Vergleich

Grundregel: **Innerhalb eines Vergleichs rechnen beide Seiten mit derselben
Kursart.** Sonst misst Δ die Kursbewegung statt der Leistung. Ein Vergleich
mit gemischten Kursarten ist nur als „berichtet" zulässig — und dann gehört
der FX-Effekt daneben.

| Vergleich | Minuend | Referenz | Δ misst | Üblich für |
|---|---|---|---|---|
| ΔPL berichtet | AC @AKT | PL @BUD | Leistung **+** FX | Konzern-/Abschlussreporting |
| **ΔPL FX-bereinigt** | AC @BUD | PL @BUD | Leistung | operative Steuerung, Vertrieb, Zielerreichung |
| ΔPY berichtet | AC @AKT | PY @VJ | Wachstum **+** FX | Geschäftsbericht |
| **ΔPY konstante Kurse** | AC @AKT | PY @AKT | organisches Wachstum | „constant currency growth" |
| FC gegen PL | FC @AKT | PL @BUD | erwartete Abweichung inkl. FX | Prognosegespräch |
| FC gegen PL FX-bereinigt | FC @BUD | PL @BUD | erwartete Leistung | Maßnahmensteuerung |
| FX-Brücke | AC @BUD → AC @AKT | | FX-Effekt | Überleitung berichtet ↔ bereinigt |

Brauerei-Beispiel (`demo-fx`, YTD September): EBITDA berichtet 4 174,2 TEUR
gegen PL 3 682,2 → ΔPL +492,0; zum Budgetkurs 4 205,5 → ΔPL +523,3. Die
Kurse kosten netto 31,3 TEUR EBITDA, getrieben vom schwächeren US-Dollar
(der Franken gleicht einen Teil aus) — die Brauerei liegt operativ besser,
als der berichtete Wert zeigt.

## 6 · Mengen- und FTE-Zeilen

| Art | Beispiel | Additiv über Monate? | Modell |
|---|---|---|---|
| Fluss | Ausstoß hl, Absatz Stk | ja | in DimKonto mit `Einheit = hl` als eigene Wurzel (Demo `9000`, `9010`) |
| Bestand | FTE, Headcount, Lagerbestand hl | **nein** (Ultimo oder Ø) | eigene Faktentabelle, Measure mit `LASTNONBLANK`/`AVERAGEX`, nicht ans P&L-Visual |

- **P&L-Visual:** kennt keine Zeilenformate; alle Zeilen teilen Skala, Einheit
  und k/m-Skalierung, YTD wird summiert. Mengenzeilen per Visualfilter
  `DimKonto[Einheit] = "EUR"` ausblenden. Bestandsgrößen dort nie binden.
- **ChartKitchen:** Tabelle (`orientation = table`) mit
  `chart.rowFormats = "Ausstoß gesamt (hl)=#,0;davon Export (hl)=#,0"` —
  formatierte Zeilen fliegen aus den gemeinsamen €-Skalen. Kennzahlen wie
  Erlös je hl als eigenes DAX-Measure (`DIVIDE ( [Umsatz AC], [Ausstoß AC] )`),
  nicht als KPI-Zeile im P&L-Visual (die zeigt KPI immer in %).
- **Offen (Backlog, `ibcsInspiredChartDeck/BACKLOG.md`):** „Σ-Aggregation
  Summe / Ø / letzter Wert" je Zeile — in beiden Visuals noch nicht gebaut.
  Bis dahin Bestandsgrößen im Modell aggregieren und separat zeigen.

In Variante B tragen Mengenzeilen keine Währung (`Currency` leer); das
Umrechnungs-Measure lässt sie unverändert.

## 7 · Brücke zu ChartKitchen

Das P&L-Visual rechnet Zwischensummen, Formeln und Vorzeichen selbst.
ChartKitchen erwartet dagegen in GuV-Wasserfall/`pnl`-Modus **vorzeichen-
behaftete** Werte und Summenzeilen **mit** Wert (`rowType`: `sum` · `delta` ·
`pct`). Drei Ergänzungen genügen, ohne das Modell umzubauen:

```DAX
-- DimKonto, berechnete Spalte → Rolle rowType (Waterfall Type)
CK_RowType = SWITCH ( DimKonto[RowType], "Formula", "sum", "Subtotal", "sum", "KPI", "pct", "delta" )

-- vorzeichenbehaftet
AC ± = SUMX ( VALUES ( DimKonto[SignConvention] ), DimKonto[SignConvention] * [AC] )

-- Summenzeilen als laufende Summe (nur bei Staffelform, s. u.)
AC GuV =
VAR _typ = SELECTEDVALUE ( DimKonto[RowType] )
VAR _bis = MAX ( DimKonto[SortOrder] )
RETURN
    SWITCH ( TRUE (),
        _typ = "Formula",
            CALCULATE ( [AC ±], REMOVEFILTERS ( DimKonto ),
                DimKonto[SortOrder] < _bis, DimKonto[RowType] = "Account", DimKonto[Einheit] = "EUR" ),
        _typ = "KPI", BLANK (),
        [AC ±] )
```

Analog `PL GuV`, `PY GuV`. Kategorie = `DimKonto[L1]` (sortiert nach
`L1Sort`), Rolle `rowType` = `CK_RowType`, Visualfilter `Einheit = EUR`.
Margen in ChartKitchen per `chart.formulaRows`
(`Rohertragsmarge = Rohertrag / Umsatzerlöse`, Operatoren mit Leerzeichen).

**Staffelform** heißt: jede Formelzeile ist die laufende Summe aller Konten
davor (Rohertrag = Umsatz + Material, EBITDA = Rohertrag + Betriebsaufwand …).
Der Validator prüft das (Abschnitt [8]). Ohne Staffelform die Summenzeilen
als eigene Measures liefern oder per `formulaRows` im Visual rechnen.

Für Zeit- und Struktur-Charts reichen die Rollen-Measures mit Filter:
`Umsatz AC = CALCULATE ( [AC], DimKonto[L1] = "Umsatzerlöse" )`. Kosten-KPIs
bleiben positiv; ChartKitchen bewertet sie mit `chart.invert = true`
bzw. `chart.invertList`.

## 8 · Abnahme-Werte der Demos

`python3 -I scripts/validate_model.py <dim> <fakt>` rechnet wie das Visual
und druckt diese Tabelle. Werte in TEUR, YTD = Januar–September 2026 (letzter
Monat mit AC), wie angezeigt (Kosten positiv).

**Variante A** (`demo-euro`):

| Zeile | AC | PY | PL | AC&FC FY | PL FY |
|---|---:|---:|---:|---:|---:|
| Umsatzerlöse | 18 746,3 | 16 890,2 | 18 056,0 | 24 747,1 | 24 000,0 |
| Rohertrag | 12 529,8 | 11 289,4 | 12 137,8 | 16 583,1 | 16 200,0 |
| Rohertragsmarge | 66,8 % | 66,8 % | 67,2 % | 67,0 % | 67,5 % |
| EBITDA | 3 174,3 | 2 073,2 | 2 721,3 | 3 855,2 | 3 400,0 |
| Betriebsergebnis | 2 047,4 | 973,8 | 1 596,3 | 2 353,4 | 1 900,0 |
| Jahresüberschuss | 1 245,9 | 516,5 | 933,7 | 1 398,0 | 1 085,0 |
| Ausstoß gesamt (Tsd. hl) | 128,1 | 119,9 | 125,2 | 168,2 | 165,0 |

**Variante B** (`demo-fx`, CC = EUR; AC/FC @AKT, PL @BUD, PY @VJ):

| Zeile | AC | AC @BUD | PL | ΔPL berichtet | ΔPL FX-bereinigt |
|---|---:|---:|---:|---:|---:|
| Umsatzerlöse | 20 853,9 | 20 891,9 | 20 086,0 | +767,9 | +805,9 |
| EBITDA | 4 174,2 | 4 205,5 | 3 682,2 | +492,0 | +523,3 |
| Jahresüberschuss | 1 945,9 | 1 977,1 | 1 606,3 | +339,6 | +370,9 |

Die Geschichte dahinter: Hitzesommer (Fassbier Juni–August über Plan),
Alkoholfrei wächst, Malz und Verpackung teurer, Energie dank neuem
Gasvertrag günstiger als im Vorjahr; im Export kostet der schwache US-Dollar
Umsatz in EUR, nicht aber Absatz.
