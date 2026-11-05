---
name: finance-data-model
description: >
  Entwirft bzw. prüft das Finance-Datenmodell (Kontendimension DimKonto +
  Faktentabelle FaktFinanz + Rollen-Measures) so, dass es ohne Umwege auf die
  hauseigenen Visuals „P&L Statement byDatenWG" und „ChartKitchen byDatenWG"
  passt: Ebenen-Spalten oder Parent-Child, RowType, FormulaDef, Vorzeichen-Trio,
  Monatsgrain, Szenarien AC/PY/PL/FC mit FY-Ausblick — als schlanke Euro-Variante
  oder mit Fremdwährung (LC/CC, Kurstabelle, aktueller und Budget-Kurs).
  Sicherer „vorbereiten + Plan"-Modus: liest das vorhandene Semantikmodell
  (TMDL/PBIP, CSV-Exporte oder Beschreibung) oder plant auf der grünen Wiese,
  führt eine kurze Bedarfs-Befragung, legt Ist→Soll-Mapping, Spaltenvertrag,
  DAX und Validierung ab — baut nie ungefragt um. Auslösen, wenn der Nutzer
  sinngemäß sagt „modellier mir die Kontendimension", „Datenmodell fürs
  PnL-Visual", „Fakten/Konten für ChartKitchen aufbauen", „GuV-Datenmodell",
  „Finance-Sternschema", „Kontenrahmen für den P&L-Report", „wie muss meine
  Faktentabelle aussehen", „Fremdwährung im GuV-Modell", „prüf mein
  Finanzmodell".
---

# Finance-Datenmodell für P&L Statement + ChartKitchen

Liefert das Modell **unter** den Report: eine Kontendimension, eine
Faktentabelle und dünne Rollen-Measures, die beide Visuals direkt lesen.
Die Report-Seiten bauen danach die Schwester-Skills `pnl-report` und
`chartkitchen-report`. Arbeitet **lokal** auf Dateien; kein Server, kein MCP.

> **Sicherheitsprinzip — „vorbereiten + Plan":** Dieser Skill ändert **kein**
> bestehendes Semantikmodell von sich aus. Er liest, vergleicht, schlägt vor
> und legt einsatzfertige Dateien ab (Spaltenvertrag, Entwurfs-CSV, DAX,
> Validierungslauf). Umbauen erst nach ausdrücklicher Freigabe — und dann in
> einer Kopie bzw. nach Commit/Backup. Im Zweifel beim Plan bleiben.

**Wahrheitsquellen** (Rollen und Regeln nur von dort, nichts aus dem
Gedächtnis): `pnlByDatenWG/AGENT-GUIDE.md` (Datenvertrag),
`pnlByDatenWG/TEMPLATE-GUIDE.md` §2, `pnlByDatenWG/src/engine.ts` (wie die
Spalten gelesen werden), `.claude/skills/chartkitchen-report/references/field-contract.md`.
Der Vertrag gilt ab P&L Statement 1.4.1 und ChartKitchen 1.51.1 und ist gegen
den Repo-Stand 1.5.2.0 / 1.52.3.0 geprüft (seitdem keine neuen Datenrollen).
Bei Versionssprüngen zuerst die CHANGELOGs lesen.

Referenzen dieses Skills:
- [`references/konten-dimension.md`](references/konten-dimension.md) — Spaltenvertrag DimKonto, RowType, FormulaDef-Syntax, Vorzeichen-Trio, Fallen
- [`references/fakten-und-waehrung.md`](references/fakten-und-waehrung.md) — Faktendesign, Perioden, Measures, **Variante A Euro / B Fremdwährung**, Mengenzeilen, ChartKitchen-Brücke, Abnahme-Werte
- `assets/demo-euro/` — Brauerei, nur EUR (DimKonto + FaktFinanz)
- `assets/demo-fx/` — dieselbe Brauerei mit Export in GBP/CHF/USD (+ `demo-kurse.csv`)
- `scripts/validate_model.py` — Prüfung gegen den Datenvertrag (nur Standardbibliothek)

## Schritt 1 · Bestandsaufnahme

Ausgangslage klären, dann lesen — nichts schreiben:

| Ausgangslage | Lesen |
|---|---|
| PBIP / TMDL | `*.SemanticModel/definition/tables/*.tmdl`: Spalten (`column`, `dataType`, `summarizeBy`), Measures (`measure … =`), Partition-Quelle; `relationships.tmdl` |
| CSV-/Excel-Exporte | Kopfzeilen, 20 Beispielzeilen, Trennzeichen, Dezimalformat |
| Nur Beschreibung | Kontenplan (Liste/Screenshot), Quellsystem, Szenarien |
| Grüne Wiese | Branche, GuV-Schema (Gesamt- oder Umsatzkostenverfahren), Konzernwährung |

Festhalten: Wo steckt die Kontenhierarchie (Ebenen-Spalten, Parent-Child,
nur Kontonummern-Bereiche)? Welche Szenarien gibt es als Spalten, Zeilen
oder Measures? Granularität (Beleg, Tag, Monat)? Gibt es eine Datumstabelle?
Vorzeichen in den Fakten (Kosten positiv oder negativ)? Mehrere Währungen
oder Gesellschaften? Mengen-/FTE-Werte?

## Schritt 2 · Bedarfs-Befragung (kurz, eine Runde)

1. **Reine Hierarchie oder volle GuV?** Nur aufklappbare Kontenstruktur
   (Weg 1: `AccountID`, `L1..Ln`, `SortOrder`) oder GuV mit Formel-, Margen-
   und Kostenzeilen (Weg 2: kompletter Vertrag mit `RowType`, `FormulaDef`,
   Vorzeichen-Trio)?
2. **Szenarien:** AC (Pflicht) · PY · PL · FC — und der FY-Ausblick
   (PL Gesamtjahr, AC&FC Gesamtjahr)? Gibt es mehrere FC-Versionen?
3. **Fremdwährung?** Bucht irgendeine Gesellschaft oder irgendein Konto in
   einer anderen Währung als EUR?
   - **Nein → Variante A · Nur Euro.** Ausdrücklich empfehlen: einfacher ist
     besser — keine Währungsspalte, keine Kurstabelle, Measures = dünne
     Wrapper. Auch „vielleicht später" ist kein Grund für B; der Umstieg
     ändert nur Fakten und Measures, nicht die Kontendimension.
   - **Ja → Variante B · Fremdwährung.** Nachfragen: Konzernwährung (CC)?
     Welche Währungen? Kursquelle und Notierung (Fremdwährung je EUR oder
     umgekehrt)? Budgetkurs je Planjahr vorhanden? Vorjahreskurse für „PY wie
     berichtet" oder PY zu konstanten Kursen? Welche Sicht steuert das
     Management — berichtet oder FX-bereinigt?
4. **Perioden:** Monat oder feiner? Kalender- oder Fiskaljahr (Startmonat)?
   Datenstand / Stichtag?
5. **Mengen-, FTE- und Bilanzzeilen:** Ausstoß, Absatz, Headcount, Bilanz,
   Kasse? Flussgröße (additiv) oder Bestand (Ultimo)? Bestände bekommen im
   P&L-Visual ab 1.7 das RowType-Token `stock` (Anfangsbestand `opening`,
   `konten-dimension.md` §4a).

## Schritt 3 · Ziel-Schema vorschlagen

Vorschlag in vier Teilen, jeweils mit Verweis auf die Referenz:

**(a) DimKonto** — Spaltenvertrag aus `konten-dimension.md` §2.
Ebenen-Spalten `L1..Ln` bevorzugen (primärer Modus des P&L-Visuals,
ChartKitchen-Kategorie-Hierarchie, keine Subtotal-Pflege); Parent-Child nur,
wenn die Quelle es erzwingt, dann Ebenen per `PATH` ableiten. `RowType`
kanonisch (`Account · Subtotal · Formula · KPI · Separator`), Formeln per
eindeutigem Zeilennamen (§5), Vorzeichen-Trio nach der Matrix (§6) —
**Kostenzeile = `-1 · true · false`; -1 nie mit `VarianceInvert = true`**
(Ausnahme Bestände: Passiva `-1 · false · true`, `konten-dimension.md` §6).
Spalte `Einheit`, sobald Mengenzeilen dazukommen.

**(b) FaktFinanz** — Konto × Monat, `Datum` = Monatsende, Kosten positiv,
AC für offene Monate leer, PY/PL/FC über 12 Monate, FC als Version n+m.
Breit (je Szenario eine Spalte, FY-Skalare `PL_FY`/`FC_FY` mit `MAX`) oder
schmal (`Szenario` + `Wert`, Measures per `CALCULATE`, PY per
Zeitintelligenz): Empfehlung und Entscheidungskriterien in
`fakten-und-waehrung.md` §1.

**(c) Währung — nur Variante B.** `Currency` in den Fakten (eine Währung je
Konto bzw. Konto × Gesellschaft), `DimKurs` (Periode × Währung × Kursart
AKT/BUD/optional VJ), Umrechnung je Monat × Währung; PL konsequent zum
Budgetkurs, „AC @BUD" für die FX-bereinigte Sicht, Kursart innerhalb eines
Vergleichs konsistent (`fakten-und-waehrung.md` §4–5).

**(d) Measure-Schicht** — je Rolle ein dünnes Measure (`AC`, `PY`, `PL`,
`FC`, `PL FY`, `AC&FC FY`). **Kein YTD/MTD im Modell:** die Visuals
kumulieren selbst (P&L: letzter AC-Monat + periodengleiches Fenster;
ChartKitchen: `cumulative`/YTD-Knopf). Ein gebundenes YTD-Measure würde doppelt
kumuliert und bräche die Fensterlogik (§2). Für ChartKitchen-GuV-Wasserfälle
zusätzlich `AC ±` und die Staffel-Measures (§7). Das frühere `CK_RowType`-Measure
entfällt ab ChartKitchen 1.53: dieselbe `DimKonto[RowType]`-Spalte speist beide
Visuals (Rolle `rowType`).

## Schritt 4 · Mapping Ist → Soll und Plan

Ablage unter `finance-model-out/` im Projekt (nie in `*.SemanticModel/`):

- `MODELL-PLAN.md` mit
  - gewählter Variante (A/B) und Weg (1/2) samt Begründung,
  - **Mapping-Tabelle** Ist → Soll:

    | Soll (Vertrag) | Ist (Tabelle[Spalte] / Measure) | Status | Maßnahme |
    |---|---|---|---|
    | `DimKonto[AccountID]` | `Konten[Kontonr]` | ✓ vorhanden | umbenennen optional |
    | `DimKonto[RowType]` | — | fehlt | Spalte ergänzen (Entwurf in `dim-konto.entwurf.csv`) |
    | `FaktFinanz[AC]` | `Buchungen[Betrag]`, Tagesgrain | Umbau | in Power Query auf Monatsende verdichten |

  - **OFFENE ENTSCHEIDUNGEN**, nummeriert (z. B. „1. Kosten in der Quelle
    negativ → Trio-Variante 3 oder Vorzeichen in Power Query drehen?").
- `dim-konto.entwurf.csv` — die vorgeschlagene Kontendimension, wenn sie neu
  entsteht oder Spalten fehlen (Controlling pflegt sie weiter).
- `measures.dax` — Measures der gewählten Variante, kommentiert.
- `validierung.txt` — Ausgabe von Schritt 5.

Nie ungefragt Tabellen, Spalten oder Measures im Modell anlegen, umbenennen
oder löschen. Nach Freigabe: Desktop-Schritte beschreiben oder — wenn der
Mensch es will und die CLI vorhanden ist — wie im Skill `mockup-to-powerbi`
über `te` arbeiten, vorher Commit/Backup.

## Schritt 5 · Validieren

```bash
# Variante A
python3 -I .claude/skills/finance-data-model/scripts/validate_model.py <dim.csv> <fakt.csv>
# Bilanz ohne Token-Spalte (wie statement.stockMode = allStock im Visual):
python3 -I .claude/skills/finance-data-model/scripts/validate_model.py <dim.csv> <fakt.csv> --stock-mode allStock
# Variante B (Kurstabelle wird neben der Faktentabelle gesucht oder explizit übergeben)
python3 -I .claude/skills/finance-data-model/scripts/validate_model.py <dim.csv> <fakt.csv> --kurse <kurse.csv> --cc EUR
```

Das Skript erkennt die Variante an einer Währungsspalte und prüft: Spalten-
vertrag, eindeutige IDs, Ebenen/Parents (Lücken, Waisen, Zyklen, Konten auf
Ebenen-Knoten), Geld/Mengen-Trennung, FormulaDef (Syntax, Referenzen per ID
oder eindeutigem Namen, Zirkel), Vorzeichen-Trio (warnt bei -1 +
`VarianceInvert`), unbekannte Wahrheitswerte, Fakten ↔ Dimension, Perioden
(Monatsende, lückenlos je Szenario, AC = 0 statt leer, FY-Skalare), bei B
Kurse je Währung × Periode × AKT/BUD und Mischwährung — und rechnet eine
Summen-Stichprobe wie das Visual (Zwischensummen, Formeln, Staffelform für
ChartKitchen, YTD bis zum letzten AC-Monat). Ausgabe ✓/⚠/✗, Exit-Code 1 bei ✗.
Ohne CSV-Export: Dimension und eine Monatsauswahl der Fakten aus Power BI als
CSV exportieren (Tabellenansicht → Tabelle kopieren) und prüfen.

Beide Demos laufen grün; ihre Kennzahlen stehen in `fakten-und-waehrung.md`
§8 zum Gegenrechnen.

## Schritt 6 · Übergabe

Plan und offene Entscheidungen zusammenfassen und bestätigen lassen. Danach:
- GuV-Seite: Skill `pnl-report` (Felder in der Reihenfolge aus dem Vertrag
  binden, Grouping-Felder „Nicht zusammenfassen", Rechenzeilen mit „Elemente
  ohne Daten anzeigen", Visualfilter `Einheit = EUR`).
- Weitere Seiten: Skill `chartkitchen-report` (Kategorie `L1..Ln`, Measures
  mit Filter, GuV-Wasserfall über die Brücke aus §7).

## Leitplanken
- Nie raten: unklare Quelle, mehrdeutiges Vorzeichen, unbekannte Kursnotierung
  → offene Entscheidung.
- Rollen- und Spaltenregeln nur aus den Wahrheitsquellen; Visual-Repos
  (`pnlByDatenWG/`, `ibcsInspiredChartDeck/`) werden nur gelesen.
- Frühere Stände der Demo-Dateien im Visual-Repo trugen bei der Steuerzeile
  `-1 · true · true` (behoben, jetzt `-1 · true · false`) — ältere Kopien
  nicht als Vorlage übernehmen.
- Keine `.pbix` (binär) anfassen; nur PBIP/TMDL/CSV (Text).
- Absolute Pfade verwenden.
