# P&L Statement byDatenWG · Schnellstart (Beta)

Zwei Wege in das Visual: **Weg 1** bindet nur die Ebenen einer vorhandenen
Hierarchie plus die Kennzahlen (zwei Minuten). **Weg 2** ergänzt die Felder,
die daraus eine echte GuV machen — Zeilentypen, Formelzeilen, Vorzeichen,
Kommentare.

Version **0.17.0.0**, Beta · GUID `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358`
Web-Fassung dieser Anleitung: [`pnl-schnellstart.html`](../pnl-schnellstart.html)
(DE) · [`pnl-schnellstart_en.html`](../pnl-schnellstart_en.html) (EN).

> **Beta:** Funktionsumfang, Feldrollen und Formateinstellungen können sich noch
> ändern, ebenso das Format des gespeicherten Zustands. Nicht im AppSource, also
> nicht von Microsoft zertifiziert. Erst im Testbericht ausprobieren.
> Feedback: <https://github.com/losveratos/powerbi-kitchen-/issues>

## 0 · Installieren

Die jeweils neueste Datei liegt in [`dist/`](dist/):
`pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358.<version>.pbiviz`.
In Power BI Desktop: **Visualisierungen → ⋯ → Visual aus einer Datei
importieren**. Das Visual großzügig aufziehen (mind. ~1200×800 px — Toolbar und
zwei Spaltenblöcke brauchen Breite).

## 1 · Weg 1 — normale Hierarchie in 2 Minuten

Für jede Dimensions-Hierarchie, die es schon gibt (z. B. `Kategorie` →
`Produktlinie`). Kein Zeilentyp, keine Formeln.

| Field Well | Feld |
|---|---|
| Ebenen-Spalten (L1..Ln) | die Ebenen **in Ziehreihenfolge**, max. 8 |
| Konto-ID (Key) | eindeutiger Schlüssel der Zeile (trägt den Drillthrough) |
| Sortierung | Ganzzahl-Spalte für die Reihenfolge |
| Periode (Monat) | Monatsspalte der Faktentabelle |
| AC (Ist) | Pflicht-Measure |
| PY · PL · FC | optional — jedes gebundene Szenario schaltet Δ-Spalten frei |

**Alle Grouping-Felder auf „Nicht zusammenfassen"** stellen.

Was dabei herauskommt: Tabelle mit automatischen Zwischensummen je Ebene,
Struktur-Bars, Zeilen-Waterfall — und ein Werttreiberbaum, der ohne Formelzeile
direkt aus der Hierarchie wächst (bei mehreren Wurzeln trägt eine virtuelle
**Gesamt-Wurzel** sie als Kinder). Klick auf ein Karten-Diagramm öffnet den
**Kachel-Zoom**, der Knopf **„↗ Drill"** setzt Selektion und öffnet das
Kontextmenü in einem Griff.

## 2 · Weg 2 — die volle GuV

Alles aus Weg 1, plus die Struktur-Spalten der Kontendimension:

| Field Well | Feld / Inhalt |
|---|---|
| Zeilentyp | `Account` · `Subtotal` · `Formula` · `KPI` · `Separator` |
| Formeldefinition | z. B. `[Gross profit]+[Operating expenses]`, `[EBITDA]/[Net revenue]` — Referenz **per Zeilenname**, Formel auf Formel erlaubt |
| Rechenvorzeichen (±1) | `1` Erlöse, `-1` Kosten |
| Anzeige invertieren | `true` bei Kostenzeilen (rechnen negativ, werden positiv angezeigt) |
| Abweichungsfarbe drehen | `true`, wo „unter Plan" gut ist (Kosten, Steuern) |
| Kommentar | Freitext je Konto → nummerierter Marker + Fußnote |
| FC Gesamtjahr · PL Gesamtjahr | Jahres-Skalare für den FY-Ausblicksblock |

Beispiel-Kontendimension (Ausschnitt aus `demoData/pharma/pharma-dim-konten.csv`,
Semikolon-getrennt):

```
AccountID;L1;L2;SortOrder;RowType;FormulaDef;SignConvention;DisplayInvert
401010;Net revenue;Pharmaceuticals (Rx);11;Account;;1;false
402000;Net revenue;Consumer Health;12;Account;;1;false
550010;Cost of goods sold;Materials;21;Account;;-1;true
F_GROSSPROFIT;Gross profit;;25;Formula;[Net revenue]+[Cost of goods sold];1;false
K_GROSSMARGIN;Gross margin;;26;KPI;[Gross profit]/[Net revenue];1;false
```

`Net revenue` und `Cost of goods sold` sind **keine** eigenen Zeilen — die
Zwischensummen entstehen synthetisch aus den L1-Pfaden, und die Formelzeilen
referenzieren sie über ihren Namen.

Demo-Daten: [`demoData/pharma/`](demoData/pharma/) (27 Dim-Zeilen, Monatsfakten,
YTD 2026-01…2026-06 in mEUR) — Setup und Abnahmewerte in
[`demoData/pharma/README.md`](demoData/pharma/README.md).
Measures: `AC = SUM(...[AC])`, analog PY/PL;
`FC FY = MAX(...[FC_FY])`, `PL FY = MAX(...[PL_FY])` — **FY-Skalare nie
summieren**. Gegenrechnen: EBITDA YTD AC = 571,2 · PY 499,6 · PL 532,0 mEUR.

## 3 · Ragged-Hierarchien

- **Leere tiefere Level** → die letzte gefüllte Ebene ist das Blatt.
- **Wiederholtes Level** (`L2` = `L1`) → die Hierarchie endet dort.
- Zeilen mit gleichem Pfad werden aggregiert; Aggregat-Zeilen (z. B. PY nur auf
  L1) wirken als Szenario-Fallback.
- Alternativ **Parent-Child** über *Konto-ID* + *Parent-Konto-ID*: beliebig tief,
  Waisen landen sichtbar in „Nicht zugeordnet". Sind beide Modi gebunden,
  gewinnt Parent-Child.

## 4 · Perioden-Formate

Gelesen werden `JJJJ-MM`, `JJJJ-MM-TT`, ISO-Zeitstempel, `JJJJ/MM`, echte
Datumsspalten, deutsche und englische Monatsnamen (lang/kurz, mit/ohne Punkt,
optional mit Jahr) sowie Zahlen 1–12. Nicht Lesbares wird gemeldet, nicht
geraten.

Fiskaljahr oder eigene Sortierspalte → Format-Pane **Spalten →
Perioden-Sortierung** auf **„Datenreihenfolge (Fiskaljahr)"**. `Automatisch`
sortiert kalendarisch, sobald alle Labels lesbar sind; `Kalenderjahr` erzwingt
Jan..Dez.

## 5 · Die vier Ansichten (Toolbar)

| Ansicht | Was sie zeigt |
|---|---|
| Tabelle | das Statement mit Perioden-Blöcken MTD · YTD · FY-Ausblick, Δ-Balken und Δ%-Pins; eine identische Δ-Skala je Spalte |
| Struktur-Bars | dieselben Zeilen mit Größenbalken — die Struktur des Ergebnisses |
| Zeilen-Waterfall | die GuV als Kaskade; Ergebnisanker auf der Nulllinie, Kostenblöcke floaten (Wurzelebene der Hierarchie) |
| Werttreiberbaum | aus dem Formel-Graphen (DuPont) oder aus der reinen Hierarchie; Tidy-Layout, Operator-Kreise, ⌖-Re-Root, Breadcrumb |

**Kachel-Zoom:** Klick auf ein Karten-Diagramm zoomt den Knoten auf die ganze
Fläche — Kombi-Chart mit Monaten und Brücke, Szenario-Grid, „Zahlt ein auf" und
„Getrieben von". Alle Toolbar-Zustände sind persistiert und lesezeichenfähig.

## 6 · Drillthrough einrichten (3 Schritte)

1. Zielseite anlegen (z. B. `Konto-Detail`) und unter **Visualisierungen →
   Seite auf Detailsuche filtern** genau die Spalte einziehen, die im Visual als
   **Konto-ID (Key)** gebunden ist — ohne gebundene Konto-ID die erste
   **Ebenen-Spalte** (`L1`).
2. Auf der Quellseite **Einfügen → Schaltflächen → Leer**, dann **Aktion → Ein**,
   **Typ = Detailsuche**, **Ziel = Konto-Detail**.
3. Im Visual eine Wertspalte anklicken → Schaltfläche wird aktiv. Alternativ
   Rechtsklick (natives Kontextmenü) oder im Kachel-Zoom „↗ Drill".

Abschaltbar über **Stil → „Selektion & Kontextmenü aktiv"**. Ausführliche
Abnahme-Checks: [`TESTPLAN.md`](TESTPLAN.md) §6a.

## 7 · Typische Fehlerbilder

| Symptom | Ursache |
|---|---|
| Alle Werte leer | Grouping-Felder auf „Zusammenfassen" statt „Nicht zusammenfassen" |
| FY-Spalten vielfach zu groß | FY-Measure als `SUM` statt `MAX`/`AVERAGE` |
| Monate in falscher Reihenfolge | Perioden-Label nicht lesbar → Perioden-Sortierung auf „Datenreihenfolge" |
| Zeile zeigt `·` | Referenzname der Formel nicht eindeutig oder Szenario ohne Daten |
| Zeile zeigt `⚠ cycle` | Zirkelbezug in der Formeldefinition oder in Parent-Child |
| „Nicht zugeordnet" rot mit ⚠ | Parent-/Level-Pfad zeigt ins Leere — gewolltes Datenqualitäts-Signal |

Vollständiger Aufbau- und Testplan inklusive Reconciliation-Werten:
[`TESTPLAN.md`](TESTPLAN.md). Feature-Historie: [`CHANGELOG.md`](CHANGELOG.md).

---

Notation nach den IBCS®-Standards 1.2 der IBCS Association (CC BY-SA 4.0,
ibcs.com). Dokumentierte Abweichung: Teal ersetzt das IBCS-Varianz-Grün, um bei
Rot-Grün-Sehschwäche lesbar zu bleiben. IBCS® ist eine eingetragene Marke der
HICHERT+FAISST GmbH. Dieses Visual ist nicht von der IBCS Association
zertifiziert und steht in keiner Verbindung zu ihr.
