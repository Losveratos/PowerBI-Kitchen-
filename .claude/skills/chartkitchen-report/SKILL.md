---
name: chartkitchen-report
description: >
  Baut mit dem Power-BI-Custom-Visual „ChartKitchen byDatenWG" einen kompletten
  IBCS-Report auf einem Datensatz auf — nach Shneidermans Mantra (Overview →
  Zoom/Filter → Details on demand). Sicherer „vorbereiten + Plan"-Modus: liest
  das Semantikmodell, führt eine kurze Bedarfs-Befragung, wählt eine Blaupause
  (Monitoring · Monatsreport · Sales-Analyse), schlägt Feld-Mapping + Seiten-
  layout vor, repliziert die vom Menschen platzierte Referenz-Visual-Instanz und
  legt fertige Definitionen + exakte Desktop-Schritte ab. Auslösen, wenn der
  Nutzer sinngemäß sagt „bau mir mit ChartKitchen einen Report", „ChartKitchen-
  Report aus meinen Daten", „Report-Seite mit dem Visual aufbauen", „IBCS-
  Dashboard mit dem DatenWG-Visual", „mach mir ein Management-Reporting mit
  ChartKitchen".
---

# ChartKitchen Report Builder — IBCS-Report → PBIP

Baut aus einem Power-BI-Semantikmodell einen mehrseitigen IBCS-Report, dessen
Visuals durchgängig das Custom-Visual **ChartKitchen byDatenWG** sind
(v1.38.0.0, GUID `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D`).
Arbeitet **lokal** auf den PBIP-Dateien; kein Server, kein MCP nötig.

> **Sicherheitsprinzip — „vorbereiten + Plan":** Dieser Skill schreibt **nicht
> ungefragt** ins Report-Format. Er liest Modell + Referenz-Instanz, erstellt
> einen Seiten-/Mapping-Plan, markiert offene Entscheidungen und legt einsatz-
> fertige Dateien + Schritte ab. Der Mensch bestätigt/finalisiert in Power BI
> Desktop. Nie destruktiv in eine bestehende Seite schreiben.

## Warum eine Referenz-Instanz (der Kern der Robustheit)
Das PBIR-Visual-Format ist versionsabhängig und für Custom-Visual-Datenrollen
nicht vollständig hartkodierbar. Deshalb ist die **Voraussetzung**, dass der
Mensch das Visual **einmal in Desktop platziert und 2–3 Felder zuweist**. Diese
eine `visual.json` ist eine **valide, versionsrichtige Vorlage** — der Agent
liest sie und **repliziert/adaptiert** sie, statt PBIR-JSON zu raten. Details:
[`references/pbir-insertion.md`](references/pbir-insertion.md).

## Voraussetzungen prüfen (zuerst)
1. **Report im PBIP-Format?** Es muss `*.Report/` (mit `definition/`) und
   `*.SemanticModel/` geben. Wenn nur `.pbix`: Nutzer bitten, als Power-BI-
   Projekt zu speichern (`.pbix` ist binär, geht nicht).
2. **ChartKitchen geladen + einmal platziert?** In `*.Report/definition/pages/
   */visuals/*/visual.json` muss mindestens **eine** Instanz mit der GUID oben
   existieren, mit 2–3 zugewiesenen Feldern. Wenn nicht: Menschen bitten, das
   Visual (solange nicht im AppSource: aus der `.pbiviz` importiert) einmal aufs
   Canvas zu ziehen und z. B. Kategorie + AC + PY zuzuweisen, dann als PBIP
   speichern. Ohne Referenz-Instanz **nicht raten** — hier stoppen und nachfragen.
3. **Pfad zum PBIP-Ordner** vom Nutzer erfragen, falls nicht gegeben.

## Schritt 1 · Eingangs-Befragung (kurz, gezielt)
Stelle diese 7 Fragen (kompakt, gern in einem Rutsch). Die Antworten wählen die
Blaupause und formen das „Chrome" (Navigation/Buttons/Filter/Logo):

1. **Zweck/Report-Typ:** Monitoring · Monatsreport · Sales-Analyse · frei?
   → wählt die Blaupause (A/B/C, siehe unten).
2. **Anzahl Seiten?**
3. **Maximale Detailtiefe:** Stufe 1 flach (nur KPI) · 2 (+Kategorie) · 3
   (+Positions-/Kontoebene) · 4 (+Einzelposten/Transaktionsnähe)?
4. **Navigation:** native Power BI (Reiter/Drill-through/Bookmarks) vs.
   zusätzliche Custom-Leiste?
5. **Buttons:** Home · Zurück · Filter-Reset · Szenario-Umschalter (AC/FC) ·
   Zeitraum (Monat/YTD) — welche?
6. **Filter:** welche Dimensionen (Zeit/Region/Produkt/Kunde), Position
   (Kopf-Leiste/seitlich/ausklappbar)?
7. **Logo/Branding:** Logo, Farben, Kopfband mit Titel+Zeitraum? (dazu die
   Filter-Fußzeilen-Rolle `filterInfo` des Visuals).

## Schritt 2 · Semantikmodell lesen → reale Felder
Lies aus `*.SemanticModel/definition/tables/*.tmdl` (TMDL ist Text): je Tabelle
die Spalten (`column <Name>` mit `dataType`) und Measures (`measure <Name>`).
Sammle Kandidaten für Kategorie-Dimensionen (Datum/Monat/Produkt/Region) und
für die Szenario-Kennzahlen (AC/PY/PL/FC).

## Schritt 3 · Blaupause wählen
Ordne die Antwort aus Frage 1 einer der drei Blaupausen zu und lies die
passende Sektion in [`references/blueprints.md`](references/blueprints.md):

- **A · Monitoring (Ampel-Cockpit)** — 1–2 Seiten, Overview-first.
- **B · Monatsreport (Management-Report)** — 4–6 Seiten, klassisch IBCS.
- **C · Sales-Analyse (exploratives Dashboard)** — 3–4 Seiten, zoom&filter.

„Frei" → nächstliegende Blaupause als Basis nehmen und mit den 7 Antworten
dehnen/stauchen. Jede Blaupause nennt Seitenfolge, den **Modus je Seite** und
die Kern-Felder. Für „welcher Modus für welche Datenfrage" siehe
[`references/mode-selection.md`](references/mode-selection.md).

## Schritt 4 · Feld-Mapping vorschlagen
Erzeuge je geplantem Visual eine Tabelle **Datenrolle → Modellfeld**. Die echten
Rollen + zulässigen Property-Werte stehen in
[`references/field-contract.md`](references/field-contract.md) (verifiziert aus
`capabilities.json`/`settings.ts` — **nicht erfinden**). Heuristik:
- `category` (Grouping) → Zeit- oder Struktur-Dimension je nach Seiten-Modus
- `actual`/`plan`/`previousYear`/`forecast` (Measures) → gleichnamige/passende
  Measures (`[AC]`/`[Umsatz]`, `[PL]`/`[Budget]`, `[PY]`, `[FC]`)
- `benchmark` → Ziel-/Schwellen-Measure (Monitoring)
- `rowType` (sum/delta) bzw. `fcFlag` (1/0) → Struktur-/Flag-Spalten (Waterfall/GuV)
- `colgroup` → Spaltengruppen-Dimension (nur Tabelle, max. 2 Ebenen)
- `filterInfo` (Text-Measure) → Filterkontext für die Fußzeile

Was **nicht eindeutig** ist (mehrere Kandidaten, fehlendes Feld, unklare
Dimension, Zielseite/Position): als **OFFENE ENTSCHEIDUNG** nummeriert vorlegen
und nachfragen — **nicht raten**. Fachliche Pflicht-Checks:
- **Jahres-/Szenario-Filter:** Das Visual braucht meist einen Filter auf **ein
  Berichtsjahr**, sonst summieren AC/PY/PL/FC über Jahre. Welcher Filter?
- **FC als Flag = Zahl (1/0)**, nicht Boolean, wenn `fcFlag` genutzt wird.

## Schritt 5 · Referenz-Visual replizieren + Plan ablegen
Lies die vom Menschen platzierte `visual.json` (Referenz-Instanz) und leite die
neuen Visuals daraus ab — Vorgehen, Struktur (`visualContainer`, `projections`
je Datenrolle, `objects` fürs Format) und die Adaptions-Regeln stehen in
[`references/pbir-insertion.md`](references/pbir-insertion.md).

Lege unter `chartkitchen-out/` im Projekt ab (**nicht** in eine bestehende
Report-Seite schreiben):
- `REPORT-PLAN.md` — gewählte Blaupause, Seiten-Liste mit Modus + Titel-Botschaft
  je Seite, Navigation/Buttons/Filter/Logo, die offenen Entscheidungen.
- pro geplantem Visual eine `*.visual.json` (aus der Referenz-Instanz repliziert,
  mit gemappten Feldern + gesetzten `chart.*`-Properties) **oder**, wenn eine
  Property unklar bleibt, eine Mapping-Tabelle + exakte Desktop-Klickschritte.
- `STEPS.md` — die exakten Schritte in Desktop: Seiten anlegen, je Visual
  ChartKitchen einfügen, Felder in der dokumentierten Reihenfolge zuweisen,
  Modus + Format-Properties setzen, Report-Filter setzen, Nav/Buttons/Logo bauen.

## Schritt 6 · Bestätigen lassen (Desktop finalisiert)
Fasse Plan + offene Entscheidungen zusammen und bitte um Bestätigung. Der Mensch
setzt in Desktop um bzw. bestätigt, dass die replizierten `visual.json` korrekt
laden. **Vor** jedem direkten Schreiben ins `*.Report/` ein Backup/Commit
empfehlen und nur in eine **Kopie** der Seite schreiben, in Desktop verifizieren
lassen. Im Zweifel beim vorbereiten+plan-Modus bleiben.

## Ehrliche v1-Caveats
- v1 ist gegen echte PBIPs **noch nicht end-to-end getestet** (hier steht kein
  Power BI Desktop / kein Beispiel-PBIP bereit) — Korrektheit ruht auf dem
  verifizierten Feld-Vertrag und der Referenz-Instanz-Vorlage; der erste echte
  Lauf validiert. Entsprechend transparent kommunizieren.
- **PBIR-Format ist versionsabhängig** (Preview) → deshalb Referenz-Instanz statt
  hartkodiertem Schema. Beim Adaptieren die Struktur der echten `visual.json`
  1:1 übernehmen, nur Felder/Properties tauschen.
- **Custom Visual muss geladen sein** (solange ChartKitchen nicht im AppSource
  ist): per `.pbiviz` importiert und einmal platziert.
- **Automatische Filter** landen erst in `visual.json`, wenn der Filterbereich
  beim Editieren einmal aufgeklappt wurde — beim Verifizieren beachten.

## Leitplanken
- Niemals raten bei mehrdeutigem Mapping oder unbekannter Property → offene
  Entscheidung.
- Keine `.pbix` (binär) anfassen; nur PBIP/PBIR (Text).
- `ibcsInspiredChartDeck/src` und Zertifikats-Export nicht ändern.
- Property-Namen/-Werte nur aus dem Feld-Vertrag, nicht aus dem Gedächtnis.
- Absolute Pfade verwenden.

## Spätere Ausbaustufe (nicht in v1)
Statt Dateiablage könnten ein Fabric-/Power-BI-**MCP** oder Skripte
(`semantic-link-labs`) die Visuals programmatisch einfügen. In v1 bewusst
weggelassen — erst den prepare+plan-Pfad auf echten PBIPs härten.
