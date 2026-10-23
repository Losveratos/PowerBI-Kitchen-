# DimKonto — Spaltenvertrag der Kontendimension

Abgeleitet aus `pnlByDatenWG/src/engine.ts` (`parseRowType`, `parseBool`,
`parseSign`, `rowsFromLevels`, `buildModel`, `parseFormula`), dem Datenvertrag
in `pnlByDatenWG/AGENT-GUIDE.md` und `pnl-doku.html` (Kapitel „Datenmodell &
Rollen"). Wo Doku und Engine auseinanderliegen, gilt die Engine. Beispiel ist
durchgehend die fiktive **Daten-WG Brauerei** aus `assets/demo-euro/` und
`assets/demo-fx/`.

## Inhalt
1. Hierarchie: Ebenen-Spalten oder Parent-Child
2. Spaltenvertrag
3. Beispielzeilen (Brauerei)
4. RowType
5. FormulaDef — Syntax und Auflösung
6. Vorzeichen-Trio
7. Wahrheitswerte und Vorzeichen: was die Engine liest
8. SortOrder, Comment, Einheit
9. Formelzeilen im DataView
10. Fallen

## 1 · Hierarchie: Ebenen-Spalten oder Parent-Child

| | Ebenen-Spalten `L1..Ln` (Sternschema) | Parent-Child `AccountID` + `ParentID` |
|---|---|---|
| Visual-Rolle | `levels` (max. 8, Ziehreihenfolge = Hierarchie) | `account` + `parent` |
| Zwischensummen | entstehen **synthetisch** aus den Pfaden, keine eigene Dim-Zeile | eigene Zeilen mit `RowType = Subtotal` |
| Ragged | leere tiefere Ebene oder Wiederholung der vorigen beendet den Pfad | beliebig tief, unbalanciert |
| Fehlerbild | Ebenen-Lücke (L3 gefüllt, L2 leer) → L3 wird ignoriert | Waise → rot unter „Nicht zugeordnet" |
| Gewinnt | — | wenn beide gebunden sind |

**Empfehlung: Ebenen-Spalten.** Gründe:
- Es ist der primäre Modus des P&L-Visuals; Zwischensummen, Vererbung von
  `DisplayInvert`/`VarianceInvert` und Sortierung der Blöcke laufen dort
  automatisch.
- ChartKitchen kennt kein Parent-Child: die Rolle `category` nimmt mehrere
  Spalten als Drill-/Tabellen-Hierarchie. Dieselben `L1..Ln` bedienen beide
  Visuals, Slicer und native Matrix.
- Keine Pflege von Subtotal-Zeilen und deren Vorzeichen; ein neues Konto ist
  eine Zeile mit seinem Pfad.
- Controlling pflegt eine flache Tabelle (Excel/SharePoint) ohne Schlüssel-
  verweise, die brechen können.

Parent-Child nur, wenn die Quelle es zwingend liefert (z. B. tiefe, häufig
umgehängte Konzernhierarchien mit mehr als 8 Ebenen). Dann zusätzlich
Ebenen-Spalten per DAX ableiten, damit ChartKitchen und Slicer sie nutzen
können:

```DAX
Pfad = PATH ( DimKonto[AccountID], DimKonto[ParentID] )
L1   = LOOKUPVALUE ( DimKonto[AccountName], DimKonto[AccountID], PATHITEM ( DimKonto[Pfad], 1 ) )
L2   = LOOKUPVALUE ( DimKonto[AccountName], DimKonto[AccountID], PATHITEM ( DimKonto[Pfad], 2 ) )
```

## 2 · Spaltenvertrag

Eine Zeile je GuV-Zeile (Konto, Formel, Marge). Grouping-Spalten im Visual
immer **„Nicht zusammenfassen"** (`summarizeBy: none`).

| Spalte | Typ | Pflicht | P&L-Rolle | ChartKitchen | Regel |
|---|---|---|---|---|---|
| `AccountID` | Text | ja | `account` | — (Schlüssel der Beziehung) | eindeutig, stabil, nie leer. Mnemonisch für Rechenzeilen (`F_EBITDA`, `K_…`) |
| `AccountName` | Text | empfohlen | `accountName` | `category` (Blatt-Ebene) | im Ebenen-Modus heißt jede **Konto**-Zeile so, sobald gebunden (siehe §5) |
| `L1` … `Ln` | Text | Modus A | `levels` | `category` (Hierarchie) | max. 8; keine Lücken; Rechenzeilen füllen nur `L1` |
| `ParentID` | Text | Modus B | `parent` | — | muss existieren, keine Zyklen |
| `SortOrder` | Ganzzahl | empfohlen | `sortOrder` | „Nach Spalte sortieren" | Reihenfolge **innerhalb** des Elternknotens; 10er-Schritte je Block |
| `RowType` | Text | für volle GuV | `rowType` | Basis für `CK_RowType` | §4 |
| `FormulaDef` | Text | für Formula/KPI | `formulaDef` | (`formulaRows` von Hand) | §5 |
| `SignConvention` | Ganzzahl ±1 | für volle GuV | `signConvention` | Basis für das signierte Measure | §6 |
| `DisplayInvert` | Text/Bool | für volle GuV | `displayInvert` | — | §6, §7 |
| `VarianceInvert` | Text/Bool | für volle GuV | `varianceInvert` | `invertList` / `chart.invert` | §6, §7 |
| `Einheit` | Text | wenn Mengenzeilen | — (Visualfilter) | `rowFormats` | `EUR` für Geld, `hl`/`Stk`/`FTE` für Mengen (§8) |
| `Comment` | Text | optional | `comment` | Text-Measure für `comments` | Marker ①② + Fußnote |

„Reine Hierarchie" (Weg 1 im Skill `pnl-report`) braucht nur `AccountID`,
`L1..Ln` und `SortOrder`. Die volle GuV (Weg 2) braucht den ganzen Vertrag.

## 3 · Beispielzeilen (Brauerei, Ebenen-Modus)

Auszug aus `assets/demo-euro/demo-dim-konto.csv` (Semikolon, UTF-8):

| AccountID | AccountName | L1 | L2 | SortOrder | RowType | FormulaDef | Sign | DispInv | VarInv | Einheit |
|---|---|---|---|---:|---|---|---:|---|---|---|
| 4000 | Fassbier Gastronomie | Umsatzerlöse | Fassbier Gastronomie | 11 | Account | | 1 | false | false | EUR |
| 4100 | Flaschenbier Handel | Umsatzerlöse | Flaschenbier Handel | 12 | Account | | 1 | false | false | EUR |
| 5000 | Malz | Materialaufwand | Malz | 21 | Account | | -1 | true | false | EUR |
| 5030 | Verpackung | Materialaufwand | Verpackung | 24 | Account | | -1 | true | false | EUR |
| F_ROHERTRAG | Rohertrag | Rohertrag | | 25 | Formula | `[Umsatzerlöse]+[Materialaufwand]` | 1 | false | false | EUR |
| K_ROHERTRAGSMARGE | Rohertragsmarge | Rohertragsmarge | | 26 | KPI | `[Rohertrag]/[Umsatzerlöse]` | 1 | false | false | EUR |
| 6000 | Energie | Betriebsaufwand | Energie | 31 | Account | | -1 | true | false | EUR |
| F_EBITDA | EBITDA | EBITDA | | 40 | Formula | `[Rohertrag]+[Betriebsaufwand]` | 1 | false | false | EUR |
| 7000 | Abschreibungen Sudhaus | Abschreibungen | Abschreibungen Sudhaus | 51 | Account | | -1 | true | false | EUR |
| F_BETRIEBSERGEBNIS | Betriebsergebnis | Betriebsergebnis | | 55 | Formula | `[EBITDA]+[Abschreibungen]` | 1 | false | false | EUR |
| 7500 | Zinsaufwand | Finanzergebnis | Zinsaufwand | 61 | Account | | -1 | true | false | EUR |
| 7600 | Ertragsteuern | Ertragsteuern | | 70 | Account | | -1 | true | false | EUR |
| F_JUEBERSCHUSS | Jahresüberschuss | Jahresüberschuss | | 80 | Formula | `[Betriebsergebnis]+[Finanzergebnis]+[Ertragsteuern]` | 1 | false | false | EUR |
| 9000 | Ausstoß gesamt (hl) | Ausstoß gesamt (hl) | | 90 | Account | | 1 | false | false | hl |

Was daraus im Visual wird:

```
Umsatzerlöse            (synthetisch, Sortierung 11 = kleinstes Kind)
├─ Fassbier Gastronomie  4000
├─ Flaschenbier Handel   4100  …
Materialaufwand         (synthetisch, erbt DisplayInvert: alle Kinder true → positiv angezeigt)
= Rohertrag              Formel
  Rohertragsmarge        KPI, %-Anzeige, Δ in pp
Betriebsaufwand         (synthetisch)
= EBITDA                 Formel auf Formel
…
Ertragsteuern            7600, ragged: endet auf L1
= Jahresüberschuss
Ausstoß gesamt (hl)      eigene Wurzel, Einheit hl (im P&L-Visual ausfiltern)
```

Die FX-Variante (`assets/demo-fx/`) hängt eine dritte Ebene an
(`Umsatzerlöse › Export › Export UK`, `Betriebsaufwand › Logistik Export ›
Logistik USA`) — ragged neben den zweistufigen Inlandskonten.

Dieselben Zeilen im Parent-Child-Modus (Zwischensummen werden echte Zeilen):

| AccountID | ParentID | AccountName | SortOrder | RowType | FormulaDef | Sign | DispInv | VarInv |
|---|---|---|---:|---|---|---:|---|---|
| S_UMSATZ | | Umsatzerlöse | 10 | Subtotal | | 1 | false | false |
| 4000 | S_UMSATZ | Fassbier Gastronomie | 11 | Account | | 1 | false | false |
| S_MATERIAL | | Materialaufwand | 20 | Subtotal | | 1 | true | false |
| 5000 | S_MATERIAL | Malz | 21 | Account | | -1 | true | false |
| F_ROHERTRAG | | Rohertrag | 25 | Formula | `[S_UMSATZ]+[S_MATERIAL]` | 1 | false | false |

Die Subtotal-Zeile `S_MATERIAL` hat Vorzeichen **+1**: ihre Kinder sind schon
mit -1 gerechnet. -1 auf der Zwischensumme **und** den Kindern negiert doppelt
(der Validator warnt). Im Parent-Child-Modus darf `DisplayInvert` der
Zwischensumme von Hand gesetzt werden; vererbt wird nur im Ebenen-Modus.

## 4 · RowType

Die Engine liest den Text ohne Groß-/Kleinschreibung:

| Gelesen als | Akzeptierte Werte | Rechnet |
|---|---|---|
| `account` | `Account` und **jeder unbekannte Wert**, auch `+`, `-`, `−`, leer | eigener Wert × Vorzeichen (+ Kinder, falls vorhanden) |
| `subtotal` | beginnt mit `sub` oder `zwischen`; `sum`, `summe` | Vorzeichen × Σ Kinder; eigener Wert nur Fallback, wenn kein Kind einen Wert hat |
| `formula` | beginnt mit `form` | `FormulaDef`; geht in **keine** Summe ein |
| `kpi` | `kpi`, `ratio`, `margin`, `kennzahl`, `marge`, `quote` | `FormulaDef`; Anzeige in %, Δ in Prozentpunkten |
| `separator` | beginnt mit `sep`, `trenn`, `leer` | nichts; als Formelreferenz immer leer |

Kanonisch schreiben: `Account` · `Subtotal` · `Formula` · `KPI` · `Separator`.
Die Kurzform aus der Template-Kurzanleitung (`+`/`−`/`sum`/`formula`/`margin`)
funktioniert, hat aber eine Falle: **`-` ist nur ein Etikett für Account. Das
Vorzeichen kommt ausschließlich aus `SignConvention`.** Eine Kostenzeile mit
RowType `-` und Vorzeichen +1 rechnet positiv.

Im Ebenen-Modus keine eigenen `Subtotal`-Zeilen für Ebenen-Knoten anlegen.
Mit gebundener `AccountID` entsteht sonst neben der synthetischen
Zwischensumme eine zweite, gleichnamige Zeile — Formelreferenzen auf diesen
Namen werden mehrdeutig.

## 5 · FormulaDef — Syntax und Auflösung

Grammatik (rekursiver Abstieg in `parseFormula`):

```
Ausdruck  := Term   { ("+" | "-") Term }
Term      := Faktor { ("*" | "/") Faktor }
Faktor    := "(" Ausdruck ")" | "[" Referenz "]" | "-" Faktor | Zahl
Zahl      := Ziffern [ ("." | ",") Ziffern ]
```

- Punkt vor Strich, Klammern, unäres Minus (`-[Steuern]`), Zahlen mit Punkt
  **oder** Komma (`0,3` = `0.3`). Leerzeichen sind egal.
- Division durch 0 ergibt leer, nicht Fehler.
- **Auflösung einer `[Referenz]`:** zuerst als Zeilen-ID, dann als
  **eindeutiger Zeilenname**. Im Ebenen-Modus haben Zwischensummen nur
  synthetische IDs — sie sind ausschließlich per Name erreichbar
  (`[Materialaufwand]`). Zeilen mit `AccountID` (Formeln, Konten) gehen auch
  per ID (`[F_EBITDA]`), solange die Konto-ID-Rolle gebunden ist.
- **Name einer Konto-Zeile im Ebenen-Modus:** `AccountName`, wenn die Rolle
  `accountName` gebunden ist, sonst die letzte gefüllte Ebene. Steht ein
  einstufiges Konto als `L1 = Steuern`, `AccountName = Ertragsteuern`, dann ist
  `[Steuern]` unbekannt. Den Namen gleich halten oder per ID referenzieren.
- **Formel auf Formel** ist erlaubt (`[EBITDA]+[Abschreibungen]`), die
  Reihenfolge der Auswertung ist egal.
- **Zirkelbezug** (`EBITDA → Betriebsergebnis → EBITDA`) → Zeile zeigt
  `⚠ cycle`. Jeder Fehler in einer referenzierten Zeile vergiftet sichtbar die
  verweisende Zeile, nichts wird still zu 0.
- Doppelte Namen machen eine Referenz mehrdeutig → Fehler an der Zeile.
- Formeln rechnen auf den **gerechneten** (vorzeichenbehafteten) Werten. Weil
  Kosten mit -1 gerechnet werden, ist der Rohertrag `[Umsatzerlöse]+[Materialaufwand]`
  — Plus, nicht Minus.

Beispiele (Brauerei):

| Zeile | RowType | FormulaDef | Bemerkung |
|---|---|---|---|
| Rohertrag | Formula | `[Umsatzerlöse]+[Materialaufwand]` | Block-Namen der synthetischen Zwischensummen |
| EBITDA | Formula | `[Rohertrag]+[Betriebsaufwand]` | Formel auf Formel |
| Betriebsergebnis | Formula | `[EBITDA]+[Abschreibungen]` | |
| Jahresüberschuss | Formula | `[Betriebsergebnis]+[Finanzergebnis]+[Ertragsteuern]` | drei Operanden |
| Rohertragsmarge | KPI | `[Rohertrag]/[Umsatzerlöse]` | %-Zeile |
| EBITDA-Marge | KPI | `[EBITDA]/[Umsatzerlöse]` | |
| Personalquote | KPI | `-[Personal]/[Umsatzerlöse]` | Personal ist mit -1 gerechnet → `-` macht die Quote positiv; `VarianceInvert = true` (mehr ist schlecht) |
| Materialquote | KPI | `-[Materialaufwand]/[Umsatzerlöse]` | `VarianceInvert = true` |
| Deckungsbeitragsquote | KPI | `([Rohertrag]+[Energie]+[Logistik])/[Umsatzerlöse]` | Klammern; `+`, weil Kosten mit -1 gerechnet sind |
| Steuerquote | KPI | `-[Ertragsteuern]/([Betriebsergebnis]+[Finanzergebnis])` | |

Der Werttreiberbaum des Visuals liest dieselben Formeln: `*`/`/` werden zu
×/÷-Verzweigungen, `+`/`-` zu additiven Kanten.

## 6 · Vorzeichen-Trio

Drei unabhängige Fragen je Zeile:

| Spalte | Frage | Wirkung |
|---|---|---|
| `SignConvention` | Wie geht die Zeile in Summen und Formeln ein? | gebuchter Wert × ±1 |
| `DisplayInvert` | Wie wird sie gezeigt? | dreht nur die Anzeige (−50 gerechnet, 50 gezeigt); Δ folgt den gezeigten Werten |
| `VarianceInvert` | Ist „mehr" schlecht? | dreht die Bewertung günstig/ungünstig des **gerechneten** Δ |

Bewertet wird immer das Δ des gerechneten Werts: Plus ist günstig. Mit -1
gerechnete Kosten sind damit schon richtig bewertet — weniger Kosten ergeben
ein gerechnetes Plus.

| # | Sign | DisplayInvert | VarianceInvert | Wann | Brauerei-Beispiel |
|---|---:|---|---|---|---|
| 1 | +1 | false | false | Erlöse, Erträge, Ergebniszeilen | Fassbier Gastronomie, Formeln |
| 2 | -1 | true | false | **Standard-Kostenzeile**: Kosten positiv gebucht | Malz, Energie, Personal, Ertragsteuern |
| 3 | +1 | true | false | Kosten schon **negativ** in den Fakten (Vorzeichen kommt aus dem Quellsystem) | Malz, wenn die Buchhaltung −312.000 liefert |
| 4 | +1 | false | true | Kosten positiv **ohne** Rechenvorzeichen und erst per Formel abgezogen; Quoten, bei denen mehr schlecht ist | Personalquote (KPI) |
| ✗ | -1 | beliebig | **true** | **verboten** | — |

**Die verbotene Kombination:** -1 zusammen mit `VarianceInvert = true` dreht
die Bewertung doppelt. Beispiel Malz, AC 560 gegen PL 520 (Überschreitung):
gerechnet −560 gegen −520, Δ = −40 → ungünstig (rot) — richtig. Mit
`VarianceInvert = true` würde dieselbe Überschreitung günstig gefärbt. Ebenso
falsch ist Variante 3 mit `VarianceInvert = true`. Der Validator warnt bei
beiden.

> Die älteren Demo-Dateien im Visual-Repo (`pnlByDatenWG/demoData/pharma/`,
> `demoData/pbip/`) tragen bei der Steuerzeile noch `-1 · true · true`. Nicht
> als Vorlage übernehmen.

Variante „-1 · false · false" (Kosten mit Minus zeigen) ist erlaubt, wenn das
Haus Kosten negativ druckt; der Validator weist darauf hin.

Vererbung im Ebenen-Modus: eine synthetische Zwischensumme erbt
`DisplayInvert` bzw. `VarianceInvert`, wenn **alle** beitragenden Kinder es
gesetzt haben. „Materialaufwand" erscheint so positiv. Ein gemischter Block
(Zinsaufwand -1/true + Zinserträge +1/false) erbt nichts und zeigt das
gerechnete Netto.

Bei Formel- und KPI-Zeilen wirkt `SignConvention` nicht (die Formel bestimmt
das Vorzeichen). `VarianceInvert` wirkt dort wie überall.

## 7 · Wahrheitswerte und Vorzeichen: was die Engine liest

`parseBool` (DisplayInvert, VarianceInvert):

| Wert | Ergebnis |
|---|---|
| Boolean-Spalte `TRUE`/`FALSE` | wie geliefert |
| Zahlenspalte | ≠ 0 → true |
| Text `true`, `1`, `yes`, `ja`, `j`, `x`, `wahr` (Groß/klein egal) | true |
| **jeder andere Text** — `false`, `0`, `nein`, `falsch`, leer, aber auch `Y`, `y`, `T`, `on` | false |

Tippfehler wie `Y` werden still zu false; der Validator listet sie.

`parseSign` (SignConvention): Zahl < 0 → -1, sonst +1 (auch `2`, `0`, leer
→ +1). Text mit Minuszeichen oder Beginn `neg` → -1. Empfehlung: Ganzzahl-
spalte mit genau `1` / `-1`.

## 8 · SortOrder, Comment, Einheit

- **SortOrder** gilt innerhalb des Elternknotens; Gleichstand entscheidet der
  Name. Synthetische Zwischensummen übernehmen die kleinste SortOrder ihrer
  Kinder, deshalb fortlaufend über die ganze GuV nummerieren (Block 10er,
  Konto 11, 12 …). Für ChartKitchen-Achsen „Nach Spalte sortieren" braucht
  jede Ebene eine eigene Sortierspalte mit **einem** Wert je Name:

  ```DAX
  L1Sort = CALCULATE ( MIN ( DimKonto[SortOrder] ), ALLEXCEPT ( DimKonto, DimKonto[L1] ) )
  ```

  Voraussetzung: Namen je Ebene eindeutig (der Validator prüft doppelte Namen).
- **Comment** → P&L-Rolle `comment`. Für ChartKitchen ein Text-Measure auf die
  Rolle `comments`: `Kommentar = SELECTEDVALUE ( DimKonto[Comment] )`.
  Kein Semikolon im Text, wenn die Tabelle als Semikolon-CSV gepflegt wird
  (oder Text in Anführungszeichen).
- **Einheit** trennt Geld (`EUR`) von Mengen (`hl`, `Stk`, `FTE`). Mengenzeilen
  sind eigene Wurzeln oder eigene Blöcke — nie Kinder eines Geld-Blocks, nie
  Operand einer Geld-Formel. Das P&L-Visual kennt keine Zeilenformate: alle
  Zeilen teilen Skala und Einheit. Deshalb dort per Visualfilter
  `DimKonto[Einheit] = "EUR"` ausblenden und Mengen in ChartKitchen mit
  `rowFormats` zeigen (Details: `fakten-und-waehrung.md` §6).

## 9 · Formelzeilen im DataView

Formel- und KPI-Zeilen haben keine Fakten. Power BI verwirft Zeilen, deren
Measures alle leer sind — dann fehlen EBITDA & Co. Zwei Wege:

1. **Elemente ohne Daten anzeigen** am Feld `AccountID` (bzw. `L1`) im Visual
   aktivieren — sicherer Weg.
2. Wie in den Demo-Daten je Rechenzeile eine **Leer-Faktzeile** anlegen.

In der Abnahme prüfen, dass alle Rechenzeilen erscheinen. Measures dürfen für
fehlende Kombinationen **nicht** 0 liefern (`COALESCE(x, 0)`, `+ 0`): das
erzeugt Geisterzeilen und Kreuzprodukte. Wächter-Muster:
`IF ( COUNTROWS ( FaktFinanz ) > 0, … )`.

## 10 · Fallen

| Fehlerbild im Visual | Ursache in der Dimension |
|---|---|
| Alle Werte leer | Grouping-Spalten nicht auf „Nicht zusammenfassen" |
| Formelzeile zeigt `·` | Referenzname unbekannt oder mehrdeutig, oder Szenario ohne Daten |
| `⚠ cycle` | Zirkelbezug in FormulaDef |
| Kostenüberschreitung grün/teal | -1 + `VarianceInvert = true` |
| Kostenblock plötzlich negativ | ein Kind ohne `DisplayInvert` → keine Vererbung auf die Zwischensumme |
| Zeile doppelt | Subtotal-Zeile auf dem Pfad eines Ebenen-Knotens |
| Tiefere Ebene fehlt | Ebenen-Lücke (L2 leer, L3 gefüllt) |
| Rote Zeilen unter „Nicht zugeordnet" | Parent-Child-Waise |
| Block-Reihenfolge springt | SortOrder fehlt oder nicht fortlaufend |
| hl-Werte als „Tsd. EUR" | Mengenzeile nicht ausgefiltert |
