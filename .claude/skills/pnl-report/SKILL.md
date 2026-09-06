---
name: pnl-report
description: >
  Baut mit dem Power-BI-Custom-Visual „P&L Statement byDatenWG" (Beta) eine
  GuV-/P&L-Seite in einem bestehenden Power-BI-Projekt auf: liest das
  Semantikmodell, klärt kurz, ob eine reine Hierarchie oder die volle GuV
  gebaut wird, schlägt das Feld-Mapping für alle Datenrollen vor, repliziert
  die vom Menschen platzierte Referenz-Visual-Instanz und legt fertige
  Definitionen + exakte Desktop-Schritte ab (sicherer „vorbereiten +
  Plan"-Modus). Auslösen, wenn der Nutzer sinngemäß sagt „bau mir mit dem
  P&L-Visual eine GuV-Seite", „mach mir einen P&L-Report aus meinen Daten",
  „GuV-Statement mit dem DatenWG-Visual", „Treiberbaum-Seite bauen",
  „Ergebnisrechnung als Report-Seite", „Werttreiberbaum aus meinem Modell".
---

# P&L Report Builder — GuV-Seite mit dem P&L-Visual → PBIP

Baut aus einem Power-BI-Semantikmodell eine GuV-/Treiberbaum-Seite, deren
Kern-Visual das Custom-Visual **P&L Statement byDatenWG** ist
(v0.17.0.0 **Beta**, GUID `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358`).
Arbeitet **lokal** auf den PBIP-Dateien; kein Server, kein MCP nötig.

> **Sicherheitsprinzip — „vorbereiten + Plan":** Dieser Skill schreibt **nicht
> ungefragt** ins Report-Format. Er liest Modell + Referenz-Instanz, erstellt
> Mapping + Seitenplan, markiert offene Entscheidungen und legt einsatzfertige
> Dateien + Schritte ab. Der Mensch bestätigt/finalisiert in Power BI Desktop.
> Nie destruktiv in eine bestehende Seite schreiben.

> **Beta-Ehrlichkeit:** Das Visual steht bei 0.x, ist nicht im AppSource und
> nicht zertifiziert. Feldrollen und Format-Properties können sich ändern —
> deshalb gilt: Rollen-/Property-Namen **nur** aus
> [`references/field-contract.md`](references/field-contract.md) bzw. direkt aus
> `pnlByDatenWG/capabilities.json` und `pnlByDatenWG/src/settings.ts`. Nichts
> aus dem Gedächtnis, nichts erfinden.

## Warum eine Referenz-Instanz (der Kern der Robustheit)
Das PBIR-Visual-Format ist versionsabhängig und für Custom-Visual-Datenrollen
nicht vollständig hartkodierbar. **Voraussetzung** ist deshalb, dass der Mensch
das Visual **einmal in Desktop platziert und ein paar Felder zuweist** — genau
das beschreibt `pnlByDatenWG/TESTPLAN.md`, **Abschnitt 7 „Speichern für die
Automatisierung"**. Diese eine `visual.json` ist eine valide, versionsrichtige
Vorlage; der Agent repliziert/adaptiert sie, statt PBIR-JSON zu raten. Das
Vorgehen (Struktur `visualContainer`, `projections` je Datenrolle, `objects`
fürs Format, `$schema` 1:1 übernehmen) steht ausführlich in
`.claude/skills/chartkitchen-report/references/pbir-insertion.md` — es gilt
unverändert, nur mit der P&L-GUID und den P&L-Rollen.

## Voraussetzungen prüfen (zuerst)
1. **Report im PBIP-Format?** Es muss `*.Report/` (mit `definition/`) und
   `*.SemanticModel/` geben. Nur `.pbix` (binär) → Nutzer bitten, als Power-BI-
   Projekt zu speichern (Vorschaufeatures TMDL + PBIR, siehe TESTPLAN §0).
2. **Visual geladen + einmal platziert?** In
   `*.Report/definition/pages/*/visuals/*/visual.json` muss mindestens **eine**
   Instanz mit der GUID oben existieren, mit ein paar zugewiesenen Feldern.
   Wenn nicht: Menschen bitten, die `.pbiviz` aus `pnlByDatenWG/dist/` zu
   importieren, das Visual einmal aufs Canvas zu ziehen, Ebenen-Spalten +
   AC (+PY/PL) zuzuweisen und als PBIP zu speichern. Ohne Referenz-Instanz
   **nicht raten** — hier stoppen und nachfragen.
3. **Pfad zum PBIP-Ordner** erfragen, falls nicht gegeben.

## Schritt 1 · Kurz-Befragung (5 Fragen)
1. **Welcher Bindemodus?** Reine Hierarchie („Weg 1") oder volle GuV mit
   Zeilentyp/Formeln („Weg 2")? → entscheidet das Mapping (siehe unten).
2. **Welche Kontendimension / welche Ebenen** (Reihenfolge L1..Ln!) bzw.
   welche `AccountID`/`ParentAccountID`?
3. **Welche Szenarien** liegen als Measures vor: AC (Pflicht), PY, PL, FC,
   dazu FC/PL **Gesamtjahr** (FY-Skalare)?
4. **Periode**: welche Spalte, welches Format (JJJJ-MM · Datum · Monatsnamen)
   und ist es ein **Fiskaljahr**?
5. **Drillthrough gewünscht?** Wenn ja: Zielseite + Detail-Visuals (Feld ist
   die im Visual gebundene Konto-ID, sonst die erste Ebenen-Spalte).

## Schritt 2 · Semantikmodell lesen → reale Felder
Aus `*.SemanticModel/definition/tables/*.tmdl` (Text) je Tabelle die Spalten
(`column <Name>` mit `dataType`) und Measures (`measure <Name>`) sammeln.
Kandidaten suchen für: Kontendimension (Spalten wie `AccountID`, `L1..Ln`,
`RowType`, `FormulaDef`, `SortOrder`, `SignConvention`), Periode (Monat/Datum)
und die Szenario-Measures.

## Schritt 3 · Bindemodus + Feld-Mapping
Der vollständige Rollen-Katalog steht in
[`references/field-contract.md`](references/field-contract.md). Zwei Modi:

**A · Level-Spalten (Sternschema, der primäre Modus)** — `levels` mit L1..Ln
in **Ziehreihenfolge** (max. 8). Das Visual baut Baum und Zwischensummen selbst
(ragged: leere tiefere Level = Blatt; L2 = L1 = Ende der Hierarchie).

**B · Parent-Child** — `account` + `parent`. Unbalanciert erlaubt; Waisen landen
sichtbar in „Nicht zugeordnet". Sind beide Modi gebunden, **gewinnt
Parent-Child**.

Mapping-Checkliste (Rolle → Modellfeld), je Zeile bestätigen oder als offene
Entscheidung markieren:

| Rolle | Pflicht | Mapping-Regel |
|---|---|---|
| `levels` (Ebenen-Spalten) | Modus A | Hierarchie-Spalten in Reihenfolge, max. 8 |
| `account` (Konto-ID Key) | empfohlen | eindeutiger, stabiler Schlüssel; trägt die Selektion und damit den Drillthrough |
| `parent` (Parent-Konto-ID) | Modus B | nur setzen, wenn Parent-Child gewollt ist |
| `accountName` | optional | Anzeigename, wenn er nicht in den Levels steckt |
| `sortOrder` | empfohlen | Ganzzahl, Reihenfolge innerhalb des Parents |
| `rowType` | Weg 2 | `Account` · `Subtotal` · `Formula` · `KPI` · `Separator` |
| `formulaDef` | Weg 2 | z. B. `[Gross profit]+[Operating expenses]`; Referenz **per Zeilenname** |
| `signConvention` | Weg 2 | `+1` Erlös, `-1` Kosten |
| `displayInvert` | Weg 2 | Kosten positiv anzeigen |
| `varianceInvert` | Weg 2 | Kosten/Steuern unter Plan = günstig |
| `comment` | optional | Freitext je Konto → Marker + Fußnote |
| `period` | empfohlen | Monatsspalte; ohne sie keine Monatssäulen/Sparklines |
| `ac` | **Pflicht** | Ist-Measure |
| `py` · `pl` · `fc` | optional | Vorjahr · Plan · Forecast |
| `fcFy` · `plFy` | optional | Ganzjahres-Skalare für den FY-Block (**MAX/AVERAGE**, nie SUM) |

Was **nicht eindeutig** ist (mehrere Kandidaten, fehlendes Feld, unklare
Dimension): als **OFFENE ENTSCHEIDUNG** nummeriert vorlegen und nachfragen.

## Schritt 4 · Typische Fallstricke (vorab prüfen, nicht hinterher debuggen)
- **„Nicht zusammenfassen"** für *alle* Grouping-Felder (Levels, Konto-ID,
  Sortierung, Zeilentyp, Formeldefinition, Vorzeichen, Periode). Sonst: alle
  Werte leer.
- **FY-Measures mit `MAX` (oder `AVERAGE`), nie `SUM`** — die FY-Skalare stehen
  auf jeder Monatszeile identisch; `SUM` macht sie um die Monatszahl zu groß.
- **Ein Berichtsjahr filtern**, sonst summieren AC/PY/PL/FC über Jahre.
- **Perioden-Format**: „JJJJ-MM", Datum, Monatsnamen (DE/EN) werden geparst;
  Fiskal-Labels („P07", „KW 12") nicht → dann `columns.periodSort` auf `data`
  (Datenreihenfolge) stellen.
- **Formelzeilen referenzieren Namen, keine IDs** — der Zeilenname muss
  eindeutig sein, sonst zeigt die Zeile `·`.
- **`columns.treeRoot`** setzt die Wurzel des Treiberbaums (ID, Name oder
  Kategorie). Ohne Formelzeile wächst der Baum aus der Hierarchie; bei mehreren
  Wurzeln entsteht eine virtuelle Gesamt-Wurzel.
- **Zirkelbezug** in `formulaDef` → Zeile zeigt `⚠ cycle`.
- **Grenzen**: DataView-Limit 30.000 Zeilen (sichtbare Warnung), kein Virtual
  Scrolling, Waterfall auf der Wurzelebene.

Fehlerbilder → Ursachen: `pnlByDatenWG/TESTPLAN.md`, Abschnitt
„Fehlerbilder-Referenz".

## Schritt 5 · Seitenplan + Referenz-Visual replizieren
Typische Seite: **ein** großes P&L-Visual (mind. ~1200×800 px — Toolbar und
zwei Spaltenblöcke brauchen Breite), ein Perioden-Slicer auf der Periode-Spalte,
optional eine Drillthrough-Zielseite „Konto-Detail". Mehr braucht es nicht: die
vier Ansichten (Tabelle · Struktur-Bars · Waterfall · Treiberbaum) und der
Kachel-Zoom stecken im Visual selbst und sind bookmark-fähig persistiert.

Ablegen unter `pnl-out/` im Projekt (**nicht** in eine bestehende Seite
schreiben):
- `PNL-PLAN.md` — Bindemodus, Mapping-Tabelle, Seitenlayout, Slicer, Drillthrough,
  offene Entscheidungen.
- pro geplantem Visual eine `*.visual.json`, aus der Referenz-Instanz repliziert
  (Felder gemappt, `objects` gesetzt) — **oder**, wenn eine Property unklar
  bleibt, Mapping-Tabelle + exakte Desktop-Klickschritte.
- `STEPS.md` — Seiten anlegen, Visual einfügen, Felder **in der dokumentierten
  Reihenfolge** zuweisen (Ebenen-Spalten zuerst!), Format-Properties setzen,
  Slicer und Drillthrough-Button bauen.

## Schritt 6 · Abnahme durch den Menschen
Plan + offene Entscheidungen zusammenfassen und bestätigen lassen. Zum
Gegenrechnen eignet sich die Pharma-Demo (`pnlByDatenWG/demoData/pharma/`,
zwei CSVs, Sternschema L1–L3, Monatsgrain): EBITDA YTD AC = 571,2 · PY 499,6 ·
PL 532,0 mEUR; EBIT 475,6; EBT 458,8; Jahresüberschuss 339,5. Die vollständige
Abnahme-Checkliste inklusive Drillthrough steht in `pnlByDatenWG/TESTPLAN.md`
(§4 Reconciliation, §5 Toolbar, §6 Format-Pane, §6a Drillthrough).

**Vor** jedem direkten Schreiben ins `*.Report/`: Backup/Commit empfehlen, nur
in eine **Kopie** der Seite schreiben, in Desktop verifizieren lassen. Im
Zweifel beim vorbereiten+plan-Modus bleiben.

## Leitplanken
- Niemals raten bei mehrdeutigem Mapping oder unbekannter Property → offene
  Entscheidung.
- Keine `.pbix` (binär) anfassen; nur PBIP/PBIR (Text).
- **`pnlByDatenWG/src`, `dist`, `capabilities.json` nicht ändern** — dieser
  Skill baut Reports, nicht das Visual.
- Rollen-/Property-Namen nur aus dem Feld-Vertrag bzw. den Quelldateien.
- Absolute Pfade verwenden.
