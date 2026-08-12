# Service-Deployment — Ausbaustufe (nicht in v1)

> **Status:** Dokumentierte Ausbaustufe, **bewusst nicht implementiert**.
> Kein Skript hier spricht die Fabric-REST-API oder ruft
> `semantic-link-labs` auf — konsistent mit dem „Spätere Ausbaustufe"-Hinweis
> in `../../chartkitchen-report/SKILL.md`. Erst den Datei-Weg
> (`pbir-integration.md`) auf echten PBIPs härten, dann hier ausbauen.

## 1 · Wann Service- statt Datei-Weg

Der Datei-Weg setzt Desktop + einen Report zur Zeit voraus. Service-Ebene
wird relevant, sobald: **viele Reports auf einmal** deployt werden sollen
(Theme-Rollout über 20+ Reports), **kein Desktop im Loop** ist (CI-Runner,
Fabric-Notebook), eine **CI/CD-Pipeline** Theme-Änderungen automatisch nach
Merge deployen soll, oder Reports **schon im Workspace** liegen (nicht mehr
lokal). Sonst: beim Datei-Weg bleiben — einfacher, kein Auth-Setup.

## 2 · Die drei Wege

### A. Fabric REST Items API (`getDefinition` / `updateDefinition`)

**Einsatzfall:** programmatischer Deploy einer Report-Definition aus einer
Pipeline heraus.

**Verifiziert:** generische Items API `POST /v1/workspaces/{wsId}/items/{itemId}/getDefinition`
bzw. `.../updateDefinition`; für Reports existiert zusätzlich eine
typ-spezifische Variante (`.../reports/{reportId}/...`) mit derselben
Payload-Hülle. Payload: `definition.parts[]` mit `path`, `payload`
(Base64) und `payloadType: "InlineBase64"` — dieselbe Dateikarte wie in
`pbir-integration.md` (`report.json`, `pages.json`, `page.json`,
`visual.json`), nur Base64-kodiert statt Dateien auf Platte.
`updateDefinition` **ersetzt die komplette Definition** — alle Parts
(geändert wie unverändert) müssen mit, sonst gehen Teile verloren; kein
Partial-Update. `.platform`-Metadata nur mit `?updateMetadata=true`.
**Wichtige Einschränkung:** referenziert der Report sein Semantikmodell per
`byPath` (Standard bei Git-Export im selben Workspace), lehnt die REST API
das ab — für den API-Deploy muss auf `byConnection` (Connection-String mit
Modell-ID) umgeschrieben werden. Bestätigt über offene Issues im
`microsoft/fabric-cicd`-Repo (#637, #436).

**UNGEPRÜFT:** exakte API-Version/LRO-Polling-Verhalten; ob Custom-Visuals
(ChartKitchen) unverändert durchgereicht werden — `learn.microsoft.com` ist
vom Proxy blockiert, obige Fakten stammen aus Suchergebnis-Snippets dieser
Seiten plus unabhängiger Bestätigung über
`raw.githubusercontent.com/microsoft/skills-for-fabric/main/common/ITEM-DEFINITIONS-CORE.md`.
Vor Produktiv-Einsatz gegen einen Test-Workspace verifizieren.

### B. `semantic-link-labs` (Python, Fabric-Notebook)

**Einsatzfall:** Deploy aus einem Fabric-Notebook, läuft mit
Notebook-Identität, kein separates Auth-Setup.

**Verifiziert** (aus README + Wiki-Code-Examples auf
raw.githubusercontent.com/microsoft/semantic-link-labs): Installation
`%pip install semantic-link-labs`. Modul `sempy_labs.report`
(`from sempy_labs import report as rep`) bietet u. a.:

- `connect_report(report=…, workspace=…, readonly=False)` als
  Context-Manager → `ReportWrapper`. Darauf **`rpt.set_theme(theme_file_path=…)`**
  — der direkte Service-Gegenpart zum Desktop-Theme-Import: das hier
  erzeugte `theme.json` ließe sich unverändert damit einspielen.
- `rpt.migrate_report_level_measures(...)` — Report-Measures ins Modell.
- `rep.report_rebind(report=…, dataset=…, report_workspace=…, dataset_workspace=…)`.
- `rep.save_report_as_pbip(report=…, workspace=…, …)` — Service → PBIP-Rückweg.
- `rep.run_report_bpa(report=…, workspace=…)` — Best-Practice-Analyzer.

**UNGEPRÜFT:** `create_report_from_reportjson` /
`update_report_from_reportjson` werden in der Paket-Doku als Teil des
Moduls gelistet, aber Signatur und ob damit auch einzelne `visual.json`
statt nur `report.json` geschrieben werden können, war nicht einsehbar
(readthedocs.io ist blockiert).

### C. Deployment Pipelines / Git-Integration

**Einsatzfall:** dauerhafter Dev → Test → Prod-Fluss statt Ad-hoc-Skripting:
PBIP im Git, Workspace an Branch gekoppelt, Deployment Pipelines befördern
zwischen Stufen.

**Verifiziert:** Git-Integration koppelt einen Fabric-Workspace an einen
Branch (Azure DevOps, seit 2025 auch GitHub); Commits im Workspace ↔ Repo
synchron. Nur mit Fabric-Workspaces, nicht klassischen Premium-Workspaces.
Übliche Architektur: Git-Integration hält Dev synchron mit `main`,
Deployment Pipelines übernehmen Test/Prod. Separates Microsoft-Paket
`microsoft/fabric-cicd` (`pip install fabric-cicd`) deployt PBIP-Ordner
direkt per REST API — Alternative zur nativen Git-Kopplung. **Wenn Report +
Modell im selben Workspace liegen, exportiert Git-Integration die
Modell-Referenz standardmäßig als `byPath`** — genau die Form, die Weg A
ablehnt; hier kein Problem, weil der Workspace-Sync statt eines rohen
`updateDefinition`-Calls greift.

**UNGEPRÜFT:** ob Deployment Pipelines PBIR inkl. Custom-Visuals 1:1
durchreichen; Detailtiefe der „nur teilweise unterstützt"-Aussage zu
Direct-Lake-Modellen aus Sekundärquellen (powerbiconsulting.com, draftbi.com)
— nicht am Original (learn.microsoft.com, blockiert) verifiziert.

## 3 · Wie die Skill-Artefakte einfließen würden

Die vorhandenen Skripte ändern sich nicht — nur der letzte Schritt
(Desktop öffnen) würde durch einen Upload ersetzt:

1. `theme.json` bleibt Quelle der Wahrheit für Farben/Typo/Defaults,
   unabhängig vom Zielweg.
2. `scripts/bulk_restyle.py` arbeitet bereits **rein dateibasiert** gegen
   PBIR-`visual.json`s — kein GUI-Zugriff im Skript, also pipeline-tauglich
   ohne Umschreiben: Definition per `getDefinition` (A) oder Git-Checkout
   (C) als PBIP-Ordner bereitstellen → Base64 dekodieren → `bulk_restyle.py
   --preset … --apply` unverändert laufen lassen → Ergebnis wieder
   Base64-kodieren und per `updateDefinition` hochladen (A) bzw. committen
   + Sync (C).
3. Für reine Theme-Rollouts ohne Struktur-Änderung ist Weg B der direkteste
   Pfad: `theme.json` unverändert an `set_theme(theme_file_path=…)`, kein
   Base64-Umweg.
4. Der Linter (`bulk_restyle.py --check`) bleibt das Qualitäts-Gate vor
   jedem Upload/Commit — als Pipeline-Schritt statt manuellem Aufruf.

## 4 · Leitplanken

- **Nie direkt in einen Prod-Workspace deployen.** Erst Dev/Kopie, dort
  verifizieren (Report öffnet, Visuals laden, Bindings intakt), erst dann
  über Deployment Pipeline nach Test/Prod.
- Gleiche Backup-Disziplin wie beim Datei-Weg: vor jedem `updateDefinition`
  die aktuelle Definition per `getDefinition` ziehen und als Backup ablegen
  (Äquivalent zu Risiko-Leiter Stufe 4 in `pbir-integration.md`).
- `updateDefinition` ersetzt die ganze Definition — immer den vollen Parts-
  Satz aus `getDefinition` als Basis nehmen, nur betroffene Teile patchen.
- `byPath`-vs.-`byConnection`-Falle (Weg A) vor dem ersten produktiven Lauf
  prüfen, nicht erst beim Fehlschlag entdecken.
- Auth/Credentials gehören nicht in dieses Skill-Verzeichnis — separates,
  vom jeweiligen Team verwaltetes Setup.
- Bei unklarem API-/Paket-Verhalten nicht raten — an einem Test-Workspace
  verifizieren, bevor es in eine Pipeline eingebaut wird.

## 5 · Status

Dokumentation einer möglichen Ausbaustufe, **kein lauffähiger Code**. In v1
(wie in `chartkitchen-report` und `deploy-to-powerbi`) bewusst nicht
implementiert — der Datei-Weg wird zuerst an echten PBIPs gehärtet. Einstieg
bei Bedarf: Weg B (`semantic-link-labs`, geringste Hürde, läuft im
Notebook ohne separates Auth-Setup), erst danach Weg A oder C.
