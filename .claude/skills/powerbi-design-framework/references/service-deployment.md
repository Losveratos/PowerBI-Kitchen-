# Service-Deployment — Ausbaustufe (nicht in v1)

> **Status:** Dokumentierte Ausbaustufe, **bewusst nicht implementiert**. Kein
> Skript in diesem Skill spricht die Fabric-/Power-BI-REST-API oder ruft
> `semantic-link-labs` auf. Dieses Dokument beschreibt den Weg für später —
> konsistent mit dem „Spätere Ausbaustufe"-Hinweis in
> `../../chartkitchen-report/SKILL.md`. Erst den Datei-Weg (siehe
> `pbir-integration.md`) auf echten PBIPs härten, dann hierher ausbauen.

## 1 · Wann Service-Ebene statt Datei-Weg

Der Datei-Weg dieses Skills (Theme importieren, `bulk_restyle.py` auf lokalen
PBIP-Dateien) setzt voraus: ein Mensch mit Power BI Desktop im Loop, ein
Report zur Zeit, Datei liegt lokal vor. Service-Ebene wird relevant, sobald
eine dieser Bedingungen kippt:

- **Viele Reports auf einmal** (Rollout eines Themes über 20+ Reports im
  Workspace) — Desktop-Klicken pro Report skaliert nicht.
- **Kein Desktop im Loop** — CI/CD-Runner, Fabric-Notebook, geplanter Job.
- **CI/CD-Pipeline gewünscht**: Theme-/Layout-Änderung soll bei jedem Merge
  automatisch in einen Dev-Workspace deployt werden, ohne manuellen Schritt.
- **Reports liegen bereits im Fabric-Workspace** (nicht mehr als lokale
  PBIP-Kopie) — z. B. nach Git-Sync, wo der Workspace die Quelle der
  Wahrheit ist.

Wenn keine dieser Bedingungen zutrifft: beim Datei-Weg bleiben. Er ist
einfacher, hat kein Auth-Setup und der Mensch sieht das Ergebnis sofort in
Desktop.

## 2 · Die drei Wege

### A. Fabric REST Items API (`getDefinition` / `updateDefinition`)

**Einsatzfall:** Programmatischer Einzel- oder Batch-Deploy einer
Report-Definition in einen Fabric-Workspace, z. B. aus einer Pipeline heraus.

**Verifizierte Fakten:**

- Generische Items API: `POST /v1/workspaces/{workspaceId}/items/{itemId}/getDefinition`
  liefert die Definition zurück, `POST .../items/{itemId}/updateDefinition`
  schreibt sie. Für Report-Items existiert zusätzlich eine typ-spezifische
  Variante (`.../reports/{reportId}/getDefinition` bzw. `updateDefinition`).
  Beide Formen transportieren dieselbe Payload-Hülle.
- Payload-Format ist bei beiden Operationen identisch: ein `definition`-
  Objekt mit `parts`-Array; jedes Part hat `path`, `payload` (Base64-String)
  und `payloadType: "InlineBase64"`. Für Reports sind das u. a.
  `definition/report.json`, `definition/pages/pages.json`,
  `definition/pages/<page>/page.json`,
  `definition/pages/<page>/visuals/<visual>/visual.json` — dieselbe
  Dateikarte wie in `pbir-integration.md`, nur Base64-kodiert statt als
  Dateien auf Platte.
- `updateDefinition` **ersetzt die komplette Definition** — alle Parts
  (geänderte wie unveränderte) müssen mitgeschickt werden, sonst gehen
  Teile verloren. Kein Patch-/Partial-Update-Modus.
- **Verifizierte Einschränkung, die für dieses Skill besonders relevant
  ist:** Referenziert der Report sein Semantikmodell per `byPath` (Standard,
  wenn Report + Modell im selben Workspace über Git-Sync exportiert wurden),
  lehnt die REST API das ab — für den Deploy per API muss die Referenz auf
  `byConnection` umgeschrieben werden (Connection-String mit Modell-ID statt
  relativem Pfad). Bestätigt u. a. über offene Issues im
  `microsoft/fabric-cicd`-Repo, die genau dieses Binding-Problem adressieren.
- Der `.platform`-Metadata-Part wird nur übernommen, wenn der Query-Parameter
  `updateMetadata=true` gesetzt ist.

**UNGEPRÜFT:** Die exakte v1/v2-Versionierung der Endpunkt-URL, das genaue
Verhalten bei Long-Running-Operations (Polling-Intervall, 202-Response-
Header), und ob `getDefinition`/`updateDefinition` auch Custom-Visuals
(inkl. ChartKitchen) unverändert durchreichen — konnte mangels Zugriff auf
`learn.microsoft.com` (vom Proxy blockiert) nicht am Original-Dokument
verifiziert werden; die obigen Fakten stammen aus Web-Search-Snippets dieser
Seiten plus einer unabhängigen Bestätigung über
`microsoft/skills-for-fabric` (`common/ITEM-DEFINITIONS-CORE.md`,
raw.githubusercontent.com) und Community-Diskussionen. Vor Produktiv-Einsatz
gegen einen echten Test-Workspace verifizieren.

Quellen: `raw.githubusercontent.com/microsoft/skills-for-fabric/main/common/ITEM-DEFINITIONS-CORE.md`;
Web-Search-Ergebnisse zu „Items - Update Report Definition" / „Items - Get
Item Definition" (learn.microsoft.com, nicht direkt abrufbar); GitHub-Issues
`microsoft/fabric-cicd` #637, #436 (byConnection/byPath).

### B. `semantic-link-labs` (Python, Fabric-Notebook)

**Einsatzfall:** Deploy/Änderung aus einem Fabric-Notebook heraus — höhere
Abstraktionsebene als rohe REST-Calls, läuft mit der Notebook-Identität
(kein separates Auth-Setup nötig, wenn im Fabric-Workspace ausgeführt).

**Verifizierte Fakten:**

- Installation als Einzeiler in einem Fabric-Notebook: `%pip install semantic-link-labs`.
- Modul `sempy_labs.report` (Alias `from sempy_labs import report as rep`)
  bietet u. a.:
  - `connect_report(report=…, workspace=…, readonly=False)` als Context-
    Manager, der ein `ReportWrapper`-Objekt liefert.
  - **`rpt.set_theme(theme_file_path=…)`** auf diesem Wrapper — setzt das
    Report-Theme aus einer JSON-Datei. Das ist der direkte Service-seitige
    Gegenpart zum Desktop-Theme-Import, den dieser Skill in v1 nutzt: das
    hier erzeugte `theme.json` ließe sich unverändert per
    `set_theme(theme_file_path="theme.json")` in einen Service-Report
    einspielen.
  - `rpt.migrate_report_level_measures(...)` — verschiebt Report-Measures
    ins Semantikmodell.
  - `rep.report_rebind(report=…, dataset=…, report_workspace=…, dataset_workspace=…)` — bindet einen Report an ein anderes Semantikmodell um.
  - `rep.save_report_as_pbip(report=…, workspace=…, …)` — lädt einen
    Service-Report als PBIP-Ordner herunter (Rückweg Service → Datei).
  - `rep.run_report_bpa(report=…, workspace=…)` — Best-Practice-Analyzer
    für Reports.
- Die Funktionen `create_report_from_reportjson` /
  `update_report_from_reportjson` werden in der Paket-Dokumentation als
  Teil des Moduls gelistet (Erzeugen/Aktualisieren eines Reports aus einer
  `report.json`) — **UNGEPRÜFT im Detail:** exakte Signatur, ob damit auch
  einzelne `visual.json`-Dateien statt nur `report.json` geschrieben werden
  können, war über die erreichbaren Quellen nicht einsehbar
  (readthedocs.io ist vom Proxy blockiert; nur Metadaten aus Suchergebnissen
  verfügbar).

Quellen: `raw.githubusercontent.com/microsoft/semantic-link-labs/main/README.md`;
`raw.githubusercontent.com/wiki/microsoft/semantic-link-labs/Code-Examples.md`
(Code-Beispiele mit exakten Funktionsaufrufen, oben zitiert).

### C. Deployment Pipelines / Git-Integration (PBIP im Git → Workspace-Sync)

**Einsatzfall:** Kein Ad-hoc-Skripting, sondern dauerhafter Dev → Test →
Prod-Fluss: PBIP-Ordner liegt in Git, Fabric-Workspace ist an einen Branch
gekoppelt, Deployment Pipelines befördern Inhalte zwischen Workspace-Stufen.

**Verifizierte Fakten:**

- Fabric-Git-Integration koppelt einen Workspace an einen Branch (Azure
  DevOps oder — seit 2025 — GitHub). Änderungen im Workspace erscheinen als
  Commits im Repo, Commits ins Repo werden in den Workspace übernommen.
  Funktioniert nur mit Fabric-Workspaces, nicht mit klassischen
  Premium-Workspaces.
- Deployment Pipelines fördern Inhalte zwischen Workspace-Stufen (Dev → Test
  → Prod); die übliche 2025/2026-Architektur: Git-Integration hält den
  Dev-Workspace synchron mit `main`, Deployment Pipelines übernehmen den
  Sprung nach Test/Prod.
- **`microsoft/fabric-cicd`** (separates Microsoft-Python-Paket, nicht Teil
  von `semantic-link-labs`) deployt PBIP-Quellordner direkt per Fabric-REST-
  API in Workspaces — Alternative/Ergänzung zu nativer Git-Integration für
  Szenarien, in denen die Pipeline PBIP-Dateien statt eines gekoppelten
  Workspace-Branches als Quelle nimmt. Installation: `pip install fabric-cicd`.
- **Wenn Report + Semantikmodell im selben Workspace liegen, exportiert die
  Git-Integration die Modell-Referenz standardmäßig als `byPath`** — das ist
  genau die Form, die (siehe Weg A) die reine REST-API ablehnt. Für den
  Git/Deployment-Pipeline-Weg ist das kein Problem, weil dort der
  Workspace-Sync-Mechanismus greift statt eines rohen `updateDefinition`-
  Calls.

**UNGEPRÜFT:** Ob Deployment Pipelines das PBIR-Format für Reports
vollständig 1:1 durchreichen (inkl. Custom-Visuals wie ChartKitchen) oder ob
es Format-/Feature-Lücken gibt (Direct-Lake-Semantikmodelle werden in
Blog-Quellen als „nur teilweise unterstützt" genannt, aber ohne Detail, was
genau fehlt) — nicht am Original verifiziert, da `learn.microsoft.com`
blockiert ist.

Quellen: Web-Search-Ergebnisse zu „Fabric environment Git integration and
deployment pipeline" (learn.microsoft.com, nicht direkt abrufbar);
`github.com/microsoft/fabric-cicd` (PyPI-Paket-Metadaten, README nicht
vollständig abrufbar — Kernaussagen aus Suchergebnis-Snippets); PBIP-GA-
Status und Deployment-Pipeline-Unterstützung aus Community-Blogs
(powerbiconsulting.com, draftbi.com) — Sekundärquellen, nicht Microsoft
selbst, entsprechend mit Vorsicht zu behandeln.

## 3 · Wie die Skill-Artefakte einfließen würden

Der Punkt dieser Ausbaustufe: **die vorhandenen Skripte ändern sich nicht**,
nur der letzte Schritt (Desktop öffnen) würde durch einen Upload ersetzt.

1. `theme.json` (aus diesem Skill) bleibt die Quelle der Wahrheit für
   Farben/Typo/Defaults — unabhängig vom Zielweg.
2. `scripts/bulk_restyle.py` arbeitet bereits **rein dateibasiert** gegen
   die PBIR-`visual.json`-Dateien (siehe `pbir-integration.md`, Abschnitt
   „Bulk-Änderungen") — kein GUI, kein Desktop-Zugriff im Skript selbst.
   Das macht es pipeline-tauglich, ohne es umzuschreiben:
   ```
   1. Report per getDefinition (Weg A) oder Git-Checkout (Weg C) als
      PBIP-Ordner lokal bereitstellen (Base64-Parts → Dateien dekodieren).
   2. python scripts/bulk_restyle.py <ordner> --preset … --apply   ← unverändert
   3. Geänderte Dateien wieder Base64-kodieren und per updateDefinition
      hochladen (Weg A) oder committen + Git-Sync/Deployment Pipeline (Weg C).
   ```
3. Für reine Theme-Rollouts ohne Struktur-Änderung ist Weg B
   (`sempy_labs.report` `set_theme`) der direkteste Pfad: `theme.json`
   unverändert an `rpt.set_theme(theme_file_path=…)` übergeben, kein
   Base64-Umweg nötig.
4. Der Linter (`bulk_restyle.py --check`) bliebe das Qualitäts-Gate **vor**
   jedem Upload/Commit — dieselbe Rolle wie heute lokal, nur als Pipeline-
   Schritt statt manuellem Aufruf.

## 4 · Leitplanken

- **Nie direkt in einen Prod-Workspace deployen.** Erst Dev-Workspace (oder
  eine Kopie), dort verifizieren (Report öffnet, Visuals laden, keine
  kaputten Bindings), erst danach über Deployment Pipeline nach Test/Prod
  befördern.
- **Gleiche Backup-/Verifikations-Disziplin wie beim Datei-Weg:** vor jedem
  `updateDefinition`-Call die aktuelle Definition per `getDefinition` ziehen
  und als Backup ablegen (Äquivalent zum Git-Commit/`design-out/backup-…/`
  aus `pbir-integration.md`, Risiko-Leiter Stufe 4).
- **`updateDefinition` ersetzt die ganze Definition** — ein unvollständiger
  Parts-Satz kann Seiten/Visuals stillschweigend löschen. Immer den vollen
  Satz aus `getDefinition` als Basis nehmen, nur die betroffenen Teile
  patchen.
- **`byPath`-vs.-`byConnection`-Falle** (Weg A) vor dem ersten produktiven
  Lauf explizit prüfen, nicht erst beim Fehlschlag entdecken.
- Auth/Credentials (Service Principal, Notebook-Identität) gehören nicht in
  dieses Skill-Verzeichnis — separates, vom jeweiligen Team verwaltetes
  Setup.
- Wie beim Datei-Weg: bei unklarem Verhalten der API/des Pakets **nicht
  raten** — am Original bzw. an einem Test-Workspace verifizieren, bevor es
  in eine Pipeline eingebaut wird.

## 5 · Status

Dies ist **Dokumentation einer möglichen Ausbaustufe, kein lauffähiger
Code**. In v1 dieses Skills (wie in `chartkitchen-report` und
`deploy-to-powerbi`) bewusst nicht implementiert — der Datei-Weg wird zuerst
an echten PBIPs gehärtet. Wer diesen Weg umsetzen will: mit einem
Test-Workspace und Weg B (`semantic-link-labs`, geringste Einstiegshürde,
läuft direkt im Fabric-Notebook ohne separates Auth-Setup) anfangen, dann
erst bei Bedarf auf rohe REST-Calls (Weg A) oder eine Pipeline (Weg C)
ausbauen.
