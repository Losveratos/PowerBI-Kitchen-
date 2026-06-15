---
name: deploy-to-powerbi
description: >
  Fügt IBCS-Chart-Builder-Templates (Deneb) als Visuals in eine bestehende
  Power-BI-Projektdatei (PBIP/PBIR) ein – sicherer „vorbereiten + Plan"-Modus:
  liest das Semantikmodell, schlägt das Feld-Mapping vor, markiert offene
  Entscheidungen und legt fertige Template-Dateien + exakte Einfüge-Schritte ab.
  Auslösen, wenn der Nutzer sinngemäß sagt „füge mir Chart X in meinen Power-BI-
  Report ein", „bau mir aus den Templates eine Power-BI-Seite", „Deneb-Visual
  in meine PBIP deployen".
---

# Deploy to Power BI — IBCS-Chart-Builder → PBIP

Bringt Templates aus dem Business-Chart-Builder
(https://datenwgknowledgekitchen.com/business-chart-builder.html) in eine
**bestehende Power-BI-Projektdatei**. Arbeitet **lokal** auf den Dateien des
Nutzers; kein Server, kein Hosting.

> **Sicherheitsprinzip:** Dieser Skill arbeitet im Modus **„vorbereiten + Plan"**.
> Er schreibt **nicht ungefragt** ins Report-Format. Er erstellt einen
> Mapping-Plan, markiert offene Entscheidungen und legt einsatzfertige Dateien
> + Schritte ab. Das tatsächliche Einsetzen bestätigt der Nutzer.

## Voraussetzungen prüfen (zuerst)
1. **Report im PBIP-Format?** Es muss einen Ordner `*.Report/` und
   `*.SemanticModel/` geben (Power BI Desktop → Datei → Als Power-BI-Projekt
   speichern). Wenn nicht: Nutzer bitten, als PBIP zu speichern. Ohne PBIP
   (nur `.pbix`) geht es nicht – `.pbix` ist binär.
2. **Deneb-Custom-Visual** muss in Power BI installiert sein (AppSource →
   „Deneb"). Darauf hinweisen.

## Ablauf

### 1 · Template wählen (Quelle = der Builder)
Der Builder ist die einzige Quelle der Wahrheit für Templates (kein API-Server).
Frage den Nutzer, welches Template er will, und nenne den Katalog aus
[`catalog.json`](catalog.json). Das eigentliche Template-JSON beschafft der Nutzer
per **1-Klick-Export im Builder**:
- Builder öffnen → Diagrammtyp/Preset wählen → Export-Dialog → **„Power BI ·
  Deneb-Template"** → Datei speichern (z. B. `business-chart.deneb.json`).
- Pfad der Datei nennen (oder Inhalt einfügen).

Lies dann das Template und seinen `usermeta.dataset` (die Platzhalter
`__0__ …` mit `name`, `type`, `kind`).

### 2 · Semantikmodell lesen → reale Felder
Lies aus `*.SemanticModel/definition/tables/*.tmdl` die verfügbaren
**Tabellen, Spalten und Measures** (TMDL ist Text). Sammle je Tabelle:
- Spalten (`column <Name>`) mit `dataType`
- Measures (`measure <Name>`)

### 3 · Mapping-Plan + offene Entscheidungen (Kern)
Erzeuge eine Tabelle: **Platzhalter → vorgeschlagenes Modellfeld**. Heuristik:
- `Kategorie` (text/column) → eine Dimensionsspalte (Datum/Monat/Produkt …)
- `AC`/`PL`/`PY` (numeric/measure) → gleichnamige bzw. passende Measures
  (`AC`→`[AC]`/`[Value]`, `PL`→`[PL]`, `PY`→`[PY]`)
- `FC` (numeric/column) → das Forecast-Flag (**Zahl 1/0**, nicht Boolean)
- `Typ` (text/column, nur Wasserfall) → Spalte mit Werten `sum`/`delta`

Markiere als **OFFENE ENTSCHEIDUNG (musst du bestätigen)**, was nicht eindeutig
ist: mehrere passende Felder, fehlendes Feld (z. B. kein FC-Flag im Modell),
unklare Dimension, Zielseite des Reports, Position/Größe des Visuals. Liste sie
nummeriert und frage gezielt nach – rate nicht.

Wichtige fachliche Checks (häufige Fehlerquellen, aktiv ansprechen):
- **Jahres-/Szenario-Filter:** Das Visual braucht meist einen Filter auf **ein
  Berichtsjahr**, sonst summieren sich AC/PL/PY/FC über mehrere Jahre. Frage,
  welcher Filter gesetzt werden soll.
- **FC-Flag = Zahl (1/0):** Ist im Modell ein numerisches Flag vorhanden? Wenn
  nicht, als offene Entscheidung anlegen (anlegen lassen oder weglassen).

### 4 · Vorbereiten (nicht ungefragt schreiben)
Lege unter `chart-builder-out/` im Projekt ab:
- `<name>.deneb.json` – das Template mit **aufgelösten Platzhaltern** (jeder
  `__n__` durch den gemappten Feldnamen ersetzt, inkl. `usermeta`).
- `MAPPING.md` – Mapping-Tabelle, die offenen Entscheidungen, der empfohlene
  Filter und die **exakten Einfüge-Schritte** in Power BI:
  1. Auf der Zielseite ein **Deneb-Visual** einfügen.
  2. Die gelisteten Felder in den Daten-Bereich (Values) ziehen – genau in der
     dokumentierten Reihenfolge/Zuordnung.
  3. In Deneb **„Edit" → Spec** durch den Inhalt von `<name>.deneb.json`
     ersetzen (oder „Aus Vorlage erstellen → Importieren").
  4. Den empfohlenen **Berichtsfilter** setzen.

### 5 · Direktes Schreiben ins PBIR (nur auf ausdrücklichen Wunsch)
Standardmäßig **nicht** automatisch ins `*.Report/definition/pages/…/visuals/`
schreiben. Das PBIR-Visual-Format für Deneb ist versionsabhängig und nicht
offiziell dokumentiert – fehlerhaftes Schreiben kann den Report beschädigen.
Wenn der Nutzer es ausdrücklich will: vorher ein **Backup/Commit** anlegen, nur
in eine **Kopie** der Seite schreiben, und das Ergebnis in Power BI verifizieren
lassen. Im Zweifel beim Modus aus Schritt 4 bleiben.

## Leitplanken
- Niemals raten, wenn ein Mapping mehrdeutig ist – als offene Entscheidung
  vorlegen.
- Keine `.pbix` (binär) anfassen; nur PBIP/PBIR (Text).
- Vor jedem Schreibvorgang im Report: Backup/Commit empfehlen.
- Der Builder bleibt Template-Quelle; dieser Skill erfindet keine Specs.
