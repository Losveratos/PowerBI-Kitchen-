# PBIR-Einfügung — ChartKitchen im Report-Format (Referenz-Instanz-Trick)

Wie das Custom Visual im PBIR steht und wie der Agent es **repliziert statt rät**.
PBIR-Grundstruktur verifiziert über Microsoft-Learn (Power BI Desktop project
report folder / enhanced report format, PBIR — Stand Preview). Für die
**Custom-Visual-Spezifika** (Datenrollen-Projektionen, `objects`) ist die vom
Menschen platzierte **Referenz-Instanz die maßgebliche Vorlage**, nicht
geratenes JSON — das PBIR-Schema ist versionsabhängig.

## PBIR-Ordnerstruktur (relevant)
```
<Name>.Report/
├── definition.pbir                 ← Bindung an das SemanticModel
├── definition/
│   ├── report.json                 ← Report-Metadaten, Report-Filter
│   ├── version.json                ← PBIR-Version (bestimmt Ladeanforderungen)
│   ├── pages/
│   │   ├── pages.json              ← Seiten-Reihenfolge, aktive Seite
│   │   └── <pageName>/
│   │       ├── page.json           ← Seiten-Metadaten, Seiten-Filter
│   │       └── visuals/
│   │           └── <visualName>/
│   │               ├── visual.json ← Visual: Position, Query, Format  ◀ hier steht ChartKitchen
│   │               └── mobile.json (opt.)
│   └── bookmarks/                  ← für Szenario-/Reset-Umschalter
├── StaticResources/                ← Themes, Bilder (Logo), Registered Resources
└── CustomVisuals/                  ← das ChartKitchen-Bundle, falls projekt-lokal
```
Jede PBIR-JSON trägt oben eine `$schema`-URL (github.com/microsoft/json-schemas
/…/report/definition/visualContainer für visual.json) — die Version steckt in
der URL. **Diese URL aus der Referenz-Instanz 1:1 übernehmen.**

## Der Referenz-Instanz-Trick (Kern)
Der Mensch hat ChartKitchen **einmal platziert** und 2–3 Felder zugewiesen. Die
daraus entstandene `visual.json` ist eine **valide, versionsrichtige** Vorlage.

1. **Finden:** In `*.Report/definition/pages/*/visuals/*/visual.json` die Datei
   mit der GUID `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D` suchen
   (Feld `visual.visualType` bzw. `visualType`).
2. **Struktur verstehen** (in der echten Datei, nicht raten):
   - Container/Position (`position`: x/y/z/width/height/tabOrder).
   - `visual.visualType` = die GUID.
   - **Datenrollen-Projektionen** unter `visual.query.queryState` bzw.
     `projections` — je Rolle (`category`, `actual`, `previousYear`, …) ein
     Eintrag, der auf `queryRef` einer Table.Column bzw. eines Measures zeigt.
     Genau **hier** sieht man, wie die Rolle aus `capabilities.json` im PBIR
     benannt und an ein Feld gebunden wird.
   - `objects` (bzw. `visual.objects`) für Format-Properties (z. B.
     `chart.orientation`) im Selector-/Property-Schema dieser PBIR-Version.
3. **Replizieren/Adaptieren** pro geplantem Visual:
   - Datei kopieren, neuen eindeutigen `<visualName>` (GUID/Name) vergeben.
   - `position` an das Seitenlayout anpassen.
   - **Projektionen tauschen:** dieselbe Struktur, aber die `queryRef`/Feld-
     Bindungen durch die gemappten Felder ersetzen; zusätzliche Rollen nach
     demselben Muster ergänzen (Rollennamen exakt aus dem Feld-Vertrag).
   - **Properties setzen:** `chart.orientation` = Modus der Seite, weitere
     `chart.*`/`labels.*`/`ibcsTitle.*` nach dem Muster, das die Referenz-Instanz
     für ein gesetztes Property zeigt (Selector + Wertform übernehmen — Enums als
     `value`-String, Fills als `{ solid: { color } }`).
   - `$schema`-URL und Versions-Konventionen aus der Referenz beibehalten.

**Nie** Felder/Selektoren erfinden, die in der Referenz nicht vorkommen. Zeigt
die Referenz eine Property-Form nicht (weil der Mensch sie nicht gesetzt hat) und
sie ist unklar → als **offene Entscheidung** vermerken und lieber im Plan die
Desktop-Klickschritte beschreiben (Property im Format-Bereich setzen), statt
riskantes JSON zu schreiben.

## Ablageziel des Agenten
Standardmäßig **nicht** in eine bestehende Seite schreiben. Replizierte Dateien
nach `chartkitchen-out/` legen (als `*.visual.json`) plus `STEPS.md`, wie der
Mensch sie einspielt (Datei an den richtigen `visuals/<name>/`-Pfad kopieren
oder Visual in Desktop einfügen + Felder/Properties setzen). Direktes Schreiben
ins `*.Report/` nur auf ausdrücklichen Wunsch, mit Backup/Commit vorab, in eine
Kopie der Seite, und in Desktop verifizieren lassen.

## Caveats
- **Automatische Filter** werden erst in `visual.json` persistiert, nachdem der
  Filterbereich beim Editieren einmal aufgeklappt wurde — beim Verifizieren beachten.
- PBIR ist **Preview**, versionsabhängig; einmal auf PBIR konvertiert kein
  automatischer Rückweg. Deshalb Referenz-Instanz + Backup.
- Custom-Visual muss geladen sein (`.pbiviz` importiert), solange ChartKitchen
  nicht im AppSource ist; sonst lädt die replizierte `visual.json` nicht.
- Aktuelle PBIR-Schema-Details bei Bedarf über Microsoft-Learn verifizieren
  (`microsoft_docs_search`/`microsoft_docs_fetch`), aber die platzierte
  Referenz-Instanz bleibt die verbindliche Vorlage.

## Spätere Ausbaustufe (nicht v1)
Programmatisches Einfügen via Fabric-/Power-BI-MCP oder `semantic-link-labs`
statt Dateiablage. In v1 bewusst weggelassen.
