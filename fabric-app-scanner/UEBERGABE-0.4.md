# Übergabe fabscan 0.4.0 · fetch und Notebook ohne Admin-Rechte

Für den Agenten, der fabscan weiterbaut. Stand 01.11.2026, Branch `feat/fabscan-nonadmin-fallback`, PR #56.

## Anlass

Der erste echte Lauf von `fabscan fetch` gegen einen Tenant brach sofort ab:
`GET https://api.powerbi.com/v1.0/myorg/admin/groups → 401`. Das Konto ist Workspace-Admin, aber kein
Fabric-Administrator (im Token nur die Standardrolle in `wids`). Das ist der Normalfall bei Beratern und
Fachbereichen. Ohne Fallback war `fetch` für sie unbenutzbar.

## Was sich geändert hat

**CLI (`fetch.py`, `cli.py`)**
- `Fetcher(admin=None|True|False)`: `None` versucht die Admin-API und wechselt bei 401/403 in den Workspace-Modus,
  `True` nur Admin (alter Abbruch), `False` gleich Workspace-Modus (`--ohne-admin` / `--no-admin`).
- Neue Ausnahme `AdminDenied(FetchError)` für 401/403 auf `/admin/`.
- Workspace-Modus:
  - `GET /v1/workspaces` mit `continuationToken`, nur `type == "Workspace"` (persönlicher Arbeitsbereich raus).
  - je Workspace `GET /v1/workspaces/{id}/semanticModels`, je Modell
    `POST .../semanticModels/{id}/getDefinition?format=TMDL`.
  - 202 → Polling über `GET /v1/operations/{id}` bis `Succeeded`, dann `GET /v1/operations/{id}/result`.
  - TMDL-Teile werden in ein Temp-Verzeichnis geschrieben, mit `tmdl.load_model` gelesen und in das Format der
    Scanner-API umgebaut (`_dataset_from_parts`). Alles danach (scanapi, tenant, report) bleibt unverändert.
  - Modelle ohne Zugriff (getDefinition 403) landen mit `schemaRetrievalError` in der Übersicht, kein Abbruch.
- Bericht und `befunde.json`: Scope `Workspaces` statt `Tenant`, Titel „Prüfbericht Fabric Apps (Workspaces mit
  eigenem Zugriff)“, Hinweis in der Ausgabe.

**Notebook (`notebook.py`)**
- Neuer Parameter `ADMIN_API = None`. Schlägt `sempy.fabric.admin` mit 401/403/„admin“ fehl, nutzt das Notebook
  den Fetcher aus dem eingebetteten Paket mit `notebookutils.credentials.getToken("pbi")`.
- Ist `MONITORING` leer, sucht es die Monitoring-Eventhouses in den geprüften Workspaces selbst.
- `SCOPE` und `REPORT_TITLE` folgen dem Modus, auch in `fabscan_findings`.
- Test-Haken: `FABSCAN_HTTP` im Notebook-Namensraum ersetzt die HTTP-Funktion (nur für Tests).

**Tests**: 46 grün. Neu: Fallback, 202-Polling, erzwungener Modus, Modell ohne Zugriff, unbekannter Workspace,
202 mit Body `null`, gleiche Befunde Admin vs. Workspace-Modus, Notebook ohne Admin. Der alte rote Notebook-Test
(`__file__.startswith("/tmp/fabscan_pkg")` unter Windows) ist plattformfest gemacht.

## Was der echte Tenant gezeigt hat

- `getDefinition` antwortet **202 mit Body `null`** (nicht leer). Die Operations-ID steht nur im Header
  `x-ms-operation-id` bzw. `Location`. `http()` behandelt das jetzt; vorher `AttributeError`.
- Lauf mit 2 Workspaces: 10 Modelle, 293 Measures, alle per getDefinition lesbar (Rolle Admin im Workspace).
- In beiden Workspaces war das Workspace Monitoring aus, daher keine Abfrage-Logs.

## Offen, bitte prüfen

1. **Neues Workspace Monitoring („Monitoring Item“).** Microsoft hat Monitoring umgebaut: Statt eines Eventhouse
   entsteht ein Monitoring Item mit Eventhouse, KQL-Datenbank (Name `<Workspace> <Item>_Database`), Eventstream und
   Activator. Es gibt **keine öffentliche REST-API** zum Einschalten, nur Workspace-Einstellungen → Monitoring.
   - `find_monitoring` sucht KQL-Datenbanken mit „monitoring“ im Namen. Heißt das Item anders, greift das nicht.
     Robuster: über `GET /v1/workspaces/{id}/items` nach dem Typ des Monitoring Items suchen (Typname im echten
     Tenant prüfen) und dessen KQL-Datenbank nehmen.
   - Prüfen, ob die Tabelle im neuen Modell weiter `SemanticModelLogs` heißt und dieselben Spalten hat
     (`querylog.kql`).
   - Monitoring sammelt erst ab dem Einschalten. Nach dem Einschalten eine App öffnen, bis zu eine Stunde warten.
2. **Notebook in echtem Fabric testen.** Bisher nur mit Attrappen. Unklar:
   - ob `notebookutils.credentials.getToken("pbi")` für `api.fabric.microsoft.com` akzeptiert wird (in der Praxis
     ja, nicht dokumentiert); sonst `getToken("https://api.fabric.microsoft.com")`.
   - wie die Ausnahme von `sempy.fabric.admin` bei fehlenden Rechten genau aussieht (`_admin_denied` prüft Text auf
     401/403/unauthorized/forbidden/admin).
3. **Drosselung**: getDefinition je Modell ist ein POST plus ggf. Polling. Bei hunderten Modellen an die Grenzen der
   Fabric-API denken (429 mit Retry-After wird in `http()` schon wiederholt).
4. **Rollen**: getDefinition braucht mindestens Mitwirkender. Nur-Leser-Workspaces liefern 403 je Modell. Eine
   Alternative für Leser wäre `executeQueries` mit `INFO.VIEW.MEASURES()` und `INFO.VIEW.TABLES()`
   (braucht Build-Recht), dann ohne Ausdrücke von Spalten.

## Prüfen lokal

```bash
cd fabric-app-scanner
python -m unittest discover -s tests          # 46 Tests
python -m fabscan fetch --ohne-admin -w "<Workspace>" --days 14 -o fabscan-tenant
python -m fabscan notebook -o ../downloads/fabscan_tenant.ipynb
python -m fabscan skill --ziel ../.claude/skills/fabscan && python -m fabscan skill --zip ../downloads/fabscan-skill.zip
```
