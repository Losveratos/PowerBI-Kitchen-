> Konzept vom 28.09.2026. Stufe 1 arbeitet auf einem lokalen Power-BI-Projekt (PBIP) mit Power BI Desktop, Stufe 2 schreibt live in den Service.
>
> **Stand 01.10.2026:** Stufe 1 ist umgesetzt (Kitchen 0.5.5, Runner 0.2.0, Agent-Modus v2 nach [PLAN-V2.md](PLAN-V2.md)); offen ist der echte Durchlauf an der Testkopie (Paket E). Stufe 2 ist nicht begonnen. Seit diesem Konzept geändert: Der Deploy ist führend (Ungespeichertes in Desktop wird überschrieben, kein Stopp mehr); der Runner darf die Desktop-Instanz des Projekts schließen und neu öffnen, um Kitchen-Visuals und Theme zu registrieren; das Modell ändert der Runner über `te` (`agent/model_ops.py`), nicht über den Modeling MCP; Desktop steuert er über `pbir desktop`. Bedienung: [PLAYBOOK.md](PLAYBOOK.md), Agent-Skill `mockup-live`, Dateivertrag [CONTRACT.md](CONTRACT.md).
>
> **Stand 02.10.2026 (Beta):** Erster echter Desktop-Durchlauf erledigt, Expertenreview in [REVIEW-LIVE-2026-10-02.md](REVIEW-LIVE-2026-10-02.md). Der Runner beendet Desktop nur noch nach Bestätigung im Kitchen, Visuals und Theme kommen einmal über „Sitzung vorbereiten", gestartet wird über `mk-live` (einmal `mockup-live\bin\mk-live.cmd setup`, dann `mk-live start "<Projektordner>"`) oder Externe Tools. Stufe 2 ist nach dem Review korrigiert (unten). Erster Praxistest mit einem fertigen 23-seitigen Bericht: [FINDINGS-DEMO-2026-10-02.md](FINDINGS-DEMO-2026-10-02.md) (unter anderem: Gestaltung und Theme eingelesener Seiten bleiben unberührt, bis die Gestaltung im Kitchen bewusst geändert wird; der Runner vergleicht dafür `design` mit der Grundlinie). Für Tester: [BETA.md](BETA.md).

# MockupKitchen live am Bericht

## Arbeitsweise (entschieden am 28.09.2026)
- **Das PBIP ist die Wahrheit.** Das Kitchen liest vor jeder Sitzung und vor jedem Deploy den Stand aus dem Projekt. Was jemand in Desktop verschoben und gespeichert hat, geht nie verloren.
- **Alles wird übertragen, Modell und Layout.** Auslöser ist der Knopf **„Deploy"** im Kitchen, sichtbar im Agent-Modus. Danach lädt Desktop den Bericht über die Desktop Bridge neu, ohne Neustart.
- **Beide bedienen das Kitchen.** Der Mensch zieht Kacheln und kommentiert im Steckbrief. Der Agent setzt Anweisungen aus dem Chat direkt im Kitchen um. Beides erscheint auf derselben Tafel.

## Der Kreislauf

```
Kitchen (Tafel)  ──Deploy──▶  Agent  ──pbir / Modeling MCP──▶  PBIP-Dateien
      ▲                                                            │
      │                                               powerbi-desktop reload
      │                                                            ▼
      └────── Status + Screenshot je Seite ◀── Bridge ◀──  Power BI Desktop
```

1. **Start:** „Projekt X, live". Der Agent prüft mit `powerbi-desktop status`, welches Projekt offen ist. Das Kitchen verbindet sich mit dem Projektordner und liest Modell und Layout.
2. **Ändern:** im Kitchen oder per Chat. Das Kitchen schreibt laufend `mockup/mockup-spec.json`.
3. **Deploy:** Das Kitchen schreibt `mockup/deploy-request.json`: laufende Nummer, Zeitpunkt, Hash der Spec.
4. **Agent:**
   - prüft zuerst `application.state`: Hat Desktop ungespeicherte Änderungen, stoppt er und bittet ums Speichern, weil das PBIP die Wahrheit ist;
   - liest den PBIP-Stand, bildet das Delta zur Spec, schreibt mit `pbir` und `te` oder dem Modeling MCP;
   - prüft mit `pbir validate --fields` und `te validate --errors-only`;
   - ruft `powerbi-desktop reload` auf, danach `screenshot-all`.
5. **Rückmeldung:** Der Agent schreibt `mockup/agent-status.json` und die Seitenbilder nach `mockup/shots/`. Das Kitchen zeigt je Kachel angewendet, übersprungen oder Fehler und legt das Desktop-Bild neben die Skizze.

## Bausteine

**Kitchen**
- **„PBIP verbinden":** Projektordner wählen (File System Access API, Chrome und Edge). Andere Browser nutzen den bisherigen Weg: Ordner hochladen, Export herunterladen.
- **Modell aus TMDL lesen**, samt DAX im Steckbrief (gibt es schon, 0.5.3).
- **Layout aus PBIR lesen:** Positionen der Visuals werden zu Raster und Baum (`treeToGrid`, Port aus dem Pixelraster-Playbook). Das ist Pflicht, weil das PBIP die Wahrheit ist.
- **Spec laufend schreiben** nach `<Projekt>/mockup/`. In `*.Report` und `*.SemanticModel` schreibt das Kitchen nie selbst.
- **Knopf „Deploy"**, Statuszeile („verbunden mit X · Deploy 7 angewendet 12:04"), Kachelmarken und Vergleich Skizze gegen Desktop-Bild.

**Agent (Skill `mockup-to-powerbi`, neuer Abschnitt „Live-Modus")** *(Stand 01.10.2026: eigener Skill `mockup-live`, Runner `agent/live_runner.py`)*
- Beobachtet `mockup/deploy-request.json` (Monitor) und arbeitet jeden Deploy genau einmal ab.
- Schreibt Bericht mit `pbir`, Modell mit dem Power BI Modeling MCP. `te` nur zur Prüfung, solange es läuft.
- Desktop über die Bridge-CLI `powerbi-desktop`: `status`, `reload`, `screenshot-all`.
- Löscht nie. Was im Bericht steht und im Mockup fehlt, wird gemeldet.

## Regeln aus der Bridge-Preview
- Desktop lädt immer den ganzen Bericht neu, nicht einzelne Visuals. Filter und Teile der Oberfläche werden dabei zurückgesetzt.
- Während der Preview dürfen `definition.pbir`, `report.json`, `mobileState.json` und `semanticModelDiagramLayout.json` nicht extern geändert werden. Theme und berichtsweite Einstellungen gehen deshalb nicht per Deploy. Der Agent meldet sie als Aufgabe für Desktop.
- Liegt `unappliedChanges.json` im Projekt, zuerst in Desktop übernehmen, sonst verwirft Desktop externe Änderungen an Ausdrücken.
- Bridge und Reload gibt es nur für PBIP, nicht für `.pbix`.

## Freigaben
- Einmal pro Sitzung: Agent-Modus für dieses Projekt einschalten.
- Der Knopf „Deploy" ist die Freigabe für Layout und Formate.
- Neue oder geänderte DAX-Formeln zeigt der Agent vor dem Schreiben im Chat, sie brauchen ein eigenes OK.
- Vor dem ersten Deploy einer Sitzung: Git-Commit oder Sicherungskopie des Projekts.

## Stufe 2 · live im Service
> **Korrigiert am 02.10.2026** nach [REVIEW-LIVE-2026-10-02.md](REVIEW-LIVE-2026-10-02.md), Abschnitt F. Die erste Fassung (XMLA-Schreiben, `byConnection` im Projekt, Produktion über Deployment Pipeline) ist ersetzt. Noch nicht begonnen; Annahmen zu Fabric vor dem Bau gegen die aktuelle Doku prüfen.

- **Das PBIP bleibt die Wahrheit, lokal bleibt alles wie in Stufe 1.** `definition.pbir` bleibt `byPath`. Nur eine Exportkopie für den Push wird auf `byConnection` umgestellt; das Projekt selbst wird nie umgebaut.
- **Kein XMLA-Schreiben.** Ein Modell, das per XMLA im Service geändert wird, ist eine zweite Wahrheit neben dem TMDL. Modell und Bericht gehen als Definition in den Service: `fab import` beider Ordner oder `fabric-cicd`, **Modell zuerst**, dann der Bericht.
- **Keine Deployment Pipelines für PBIR-Berichte**, sie unterstützen das Format nicht (Stand Review). Zielbild für Produktion: **Git-Branch je Workspace** (dev, test, prod) mit Pull Request, oder `fabric-cicd` aus dem Repo.
- **Voraussetzungen:** Entwicklungs- oder Test-Workspace auf Fabric-Kapazität oder PPU, `fab` angemeldet, Workspace in einer **Erlaubnisliste** des Projekts.
- **Sicherheit:**
  - Vor dem ersten Push pro Sitzung Sicherung per `fab export`, dieser erste Push braucht ein ausdrückliches OK.
  - **Dry-Run-Diff** vor jedem Push: was ändert sich im Service an Modell und Bericht.
  - Push blockieren, wenn Kitchen-Visuals im Tenant nicht erlaubt sind (Organisations-Visuals bzw. Einstellung „nur zertifizierte Visuals").
  - Nie gegen Produktion, Produktion nur über Git und Pull Request.
- **Im Kitchen:** Der Deploy-Knopf bekommt Ziele: „Desktop", „Desktop + Service (dev)", „Commit + PR". Der Runner antwortet auf `target: "desktop+service"` bis dahin mit `blocked`.

## Grenzen und Risiken
- **`te`** ist eine Preview und läuft am 30.09.2026 aus. Der Modellweg setzt auf den Power BI Modeling MCP. *(Stand 01.10.2026: Modellweg über `te`, neue Preview gültig bis 31.10.2026.)*
- **`pbir`** ist nur für nicht-kommerzielle Nutzung lizenziert und scheitert an neueren `mobile.json`-Schemata. Für eine Weitergabe braucht die Schreibschicht eine Alternative oder eine Lizenzklärung. Die Bridge-CLI ist MIT-lizenziert.
- **Bridge und Reload** sind Preview. Die Methoden prüft der Agent jedes Mal per `manifest`.
- **File System Access API** gibt es nur in Chromium-Browsern.

## Reihenfolge
1. Kitchen: PBIP verbinden, Spec laufend schreiben, Knopf „Deploy" mit `deploy-request.json` *(erledigt)*
2. Agent: Live-Modus im Skill, Deploy abarbeiten, `reload` und Screenshots, `agent-status.json` *(erledigt, Runner 0.2.0, Skill `mockup-live`)*
3. Kitchen: Status und Desktop-Bild anzeigen *(erledigt, dazu Bildvergleich je Kachel)*
4. Kitchen: Layout aus PBIR lesen, damit das PBIP die Wahrheit sein kann *(erledigt)*
5. Stufe 2: Exportkopie mit `byConnection`, `fab import` bzw. `fabric-cicd` (Modell zuerst), Dry-Run-Diff, Ziele „Desktop + Service (dev)" und „Commit + PR" *(offen, Konzept korrigiert am 02.10.2026)*
6. Danach: MCP-Server für das Kitchen, damit andere Programme es ohne Claude Code nutzen *(offen)*
