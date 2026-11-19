# Übergabe fabscan 0.4.0 und 0.5.0 · fetch und Notebook ohne Admin-Rechte, neues Workspace Monitoring

Für den Agenten, der fabscan weiterbaut. Stand 19.11.2026, Branch `feat/fabscan-nonadmin-fallback`, PR #56.
Der Abschnitt zu 0.5.0 steht zuerst, darunter unverändert die Übergabe zu 0.4.0.

## 0.5.0 · Was sich geändert hat

**Monitoring-Suche (`fetch.find_monitoring`)**
- Neues Workspace Monitoring legt ein Item vom Typ **`Monitoring`** an (in der Fabric-REST-Doku als ItemType gelistet,
  im Tenant bestätigt: `items?type=Monitoring` antwortet 200, ein erfundener Typ 400 `InvalidItemType`).
- Suche je Workspace über `GET /v1/workspaces/{id}/monitoringItems` (liefert `properties.dataCollectionState`),
  Rückweg `GET /v1/workspaces/{id}/items?type=Monitoring`. Ist die Datensammlung nicht `Enabled`, steht das als
  Hinweis im Bericht.
- Die KQL-Datenbank heißt laut Doku `<Workspace>_<Item>_Database`, Sonderzeichen werden zu `_`, Leerzeichen
  bleiben. Verglichen wird über einen Schlüssel aus Buchstaben und Ziffern (`_kql_key`), damit Leerzeichen und
  Unterstriche egal sind. Erst im eigenen Workspace, dann (Modus „Linked“: Daten gehen an das Eventhouse eines
  anderen Monitoring-Items, je Quell-Workspace eine eigene Datenbank) in allen übrigen Workspaces mit Zugriff.
- Ohne Monitoring-Item greift das alte Muster (KQL-Datenbank mit „monitoring“ im Namen).
- `db_ids` merkt sich die Item-ID der Datenbank. Kusto nimmt die Item-ID als Datenbanknamen an (gegen ein echtes
  Eventhouse geprüft), `logs()` versucht sie, wenn der Anzeigename scheitert.

**Log-Abfrage (`querylog.kql`, `fetch.logs`)**
- Pflicht sind nur `Timestamp`, `OperationName`, `EventText`, `ItemId` (`REQUIRED_COLUMNS`). Alle anderen Spalten
  holt `column_ifexists`. Die KQL lief gegen eine echte Kusto-Engine (per `datatable` als Ersatz-Tabelle), mit
  voller Spaltenliste und mit nur den vier Pflichtspalten.
- Fehlt die Tabelle (Kusto meldet „Failed to resolve table“), sucht `fetch` sie per `.show tables` über
  `/v1/rest/mgmt` (nur lesend) und fragt die gefundene Tabelle ab; der Name kommt als Hinweis in den Bericht.
- Bei 401/403 bricht `logs()` nach den zwei Token-Versuchen ab, statt weitere Datenbanknamen zu probieren.

**Nur Leserecht (`fetch._dataset_from_info`)**
- getDefinition scheitert (403 oder anderer Fehler): `executeQueries` mit `INFO.VIEW.TABLES/COLUMNS/MEASURES`
  (braucht Build-Recht). Gegen echte Modelle geprüft: Namen, Tabellen, Ausgeblendet, Formate kommen, **die
  Spalte `Expression` ist leer, auch als Workspace-Admin**. `INFO.ROLES()` und `INFO.TABLEPERMISSIONS()` lehnt
  executeQueries ab (400 DatasetExecuteQueriesError).
- Solche Modelle tragen `rolesUnknown`. Folgen: `SEC-NO-RLS` entfällt, Modell-Übersicht zeigt RLS „?“,
  `QRY-SHADOW` schreibt „Ausdruck nicht lesbar“ statt eines leeren Ausdrucks und meldet nie „gleicher Ausdruck“.
- Neuer Hinweis, wenn ein Direct-Lake-Modell an der Kapazität scheitert (siehe Tenant-Befund unten).

**Notebook**
- `_NotebookAuth`: `getToken("pbi")` nur für die Power-BI- und Fabric-API, für andere Ressourcen (Kusto)
  `getToken(<resource>)`.
- `_admin_denied` liest zuerst den HTTP-Status (`e.status_code` oder `e.response.status_code`, auch über
  `__cause__`/`__context__`), so wie `sempy.fabric.exceptions.FabricHTTPException(response)` ihn trägt. Nur ohne
  Status zählt der Text („ 401“, „ 403“, unauthorized, forbidden). Das Wort „admin“ reicht nicht mehr (ein 429 auf
  einer Admin-URL fiel vorher fälschlich in den Workspace-Modus). `ImportError` (sempy ohne Admin-Modul) wechselt
  in den Workspace-Modus.

**Sonstiges**: `fabric-app-scanner/.gitignore` schließt `fabscan-tenant/` aus. Tests: 62 statt 46
(neu `tests/test_monitoring.py`, Leser-Weg in `test_fetch.py`, Notebook-Helfer in `test_notebook.py`).

## 0.5.0 · Was der echte Tenant gezeigt hat

- **Kein Monitoring-Item im ganzen Tenant** (57 Workspaces durchsucht, zuletzt am 19.11.2026). Die Suche ist daher
  nur gegen Attrappen und die dokumentierte API getestet, nicht gegen ein echtes Monitoring-Item.
- **„AfterCon DatenWG“ hängt an keiner Kapazität mehr** (`capacityId: null`). Die Trial-Kapazität wurde am
  12.11.2026 neu angelegt (`Trial-20261112…`, FTL64), der Workspace ist nicht wieder zugeordnet. Folgen: Lakehouses,
  App, Notebooks sind über die API nicht mehr sichtbar (9 statt 40 Items), alle 4 Modelle sind Direct Lake und
  scheitern bei getDefinition („capacity does not support Direct Lake mode“) und bei executeQueries. Workspace
  Monitoring geht ohne Kapazität nicht. Erst den Workspace wieder an eine Fabric-Kapazität hängen, dann Monitoring
  einschalten, Datensammlung an, App „Rhein Köln“ benutzen, bis zu eine Stunde warten.
- Ein Token mit Power-BI-Audience (`analysis.windows.net/powerbi/api`, über `az`) nimmt `api.fabric.microsoft.com`
  an (200 auf workspaces, items, semanticModels). Das stützt `getToken("pbi")` im Notebook; im Notebook selbst ist
  es noch nicht gelaufen.

## 0.5.0 · Offen

1. **Echtes Monitoring-Item prüfen**, sobald eins existiert: Typname in `monitoringItems`, Name der KQL-Datenbank
   (Trenner zwischen Workspace und Item), Tabellenname `SemanticModelLogs` und Spalten. Befehl:
   `python -m fabscan fetch --ohne-admin -w "<Workspace>" --days 1 -o fabscan-tenant`. Spalten prüfen mit
   `SemanticModelLogs | getschema` in der Monitoring-Datenbank.
2. **Notebook in Fabric ausführen.** Braucht ein neues Notebook-Item (Import von `downloads/fabscan_tenant.ipynb`)
   und ein Lakehouse; nicht gemacht, weil die Regel nur Lesezugriffe erlaubt. Zu prüfen: `getToken("pbi")` gegen
   die Fabric-API, Gestalt der sempy-Ausnahme bei 401/403, Kusto-Spark-Connector mit `column_ifexists`-KQL.
3. **Monitoring im Admin-Modus des Notebooks**: Die automatische Suche läuft nur im Workspace-Modus. Im Admin-Modus
   müsste `MONITORING` gefüllt werden.
4. Drosselung bei vielen Modellen (siehe 0.4.0, Punkt 3) gilt jetzt auch für die drei executeQueries je
   Leser-Modell.

---

# Übergabe fabscan 0.4.0 · fetch und Notebook ohne Admin-Rechte

Stand 01.11.2026.

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
