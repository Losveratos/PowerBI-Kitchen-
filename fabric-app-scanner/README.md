# fabscan · Governance-Prüfung für Fabric Apps

Rechnet deine Fabric App mit den Kennzahlen des Semantikmodells oder mit eigener Logik? Ist der Datenweg
nachvollziehbar, und sieht jeder nur, was er sehen darf? fabscan beantwortet fünf Fragen und schreibt das Ergebnis
als Bericht in Klartext:

| Bereich | Frage |
| --- | --- |
| **Berechnungen in der App** | Rechnet die App selbst, statt Measures des Modells abzufragen? |
| **Lineage-Brüche** | Ist der Weg App → Abfrage → Modell → Quelle vollständig? |
| **Sicherheitsrisiken** | App-Identität statt Nutzer, fehlende RLS, ausgeblendete Felder, fremde Server, Geheimnisse? |
| **Veränderte Abfragen** | Feste Filter, aufgehobene Filter, überschriebene Measures? |
| **Abweichungen zum Modell** | Gerundete oder bereinigte Werte, nachgerechnete Kennzahlen? |

fabscan liest nur, führt nichts aus und braucht keine Verbindung zu Fabric. Es läuft mit Python ab 3.10 und hat
keine weiteren Abhängigkeiten.

**Stand 0.6.1** (23.11.2026): Abruf auch ohne Admin-Rechte, Workspace Monitoring über das Monitoring-Item, Lauf über
den ganzen Tenant, Ausnahmen mit Begründung, Abdeckung im Bericht und weniger Fehlalarme. Was sich je Version
geändert hat, steht in [UEBERGABE-0.4.md](UEBERGABE-0.4.md); Recherche und Roadmap liegen unter
[recherche/](recherche/00-ueberblick.md).

## Drei Wege, es zu nutzen

### 1 · In Claude (am einfachsten)

- **claude.ai:** [`fabscan-skill.zip`](../downloads/fabscan-skill.zip) herunterladen und unter *Einstellungen →
  Skills* hochladen (Code-Ausführung muss an sein). Dann das App-Repo als ZIP in den Chat legen und fragen:
  *„Prüf meine Fabric Apps“*.
- **Claude Code im Kitchen-Repo:** Der Skill liegt schon unter `.claude/skills/fabscan/`.
- **Claude Code in deinem eigenen Repo:** einmal `fabscan skill` ausführen (siehe Weg 2), oder den Ordner
  `.claude/skills/fabscan/` in dein Repo kopieren. Dann *„Prüf meine Fabric Apps“* oder `/fabscan`.

Der Skill bringt fabscan mit, installieren musst du dafür nichts. Er fasst die Befunde in Klartext zusammen und
behebt sie auf Wunsch im App-Code, etwa Abfragen auf Measures umstellen oder Schriften lokal ausliefern.
Danach prüft er erneut.

Andere Agenten (Copilot, Cursor, Codex …): `SKILL.md` als Anleitung geben, fabscan selbst läuft überall mit Python.

### 2 · Kommandozeile

```bash
pip install "git+https://github.com/Losveratos/PowerBI-Kitchen-.git#subdirectory=fabric-app-scanner"
cd mein-app-repo
fabscan
```

`fabscan` prüft alle Apps (Ordner mit `rayfin/rayfin.yml`) und die Semantikmodelle als TMDL im selben Repo.
Weitere Befehle:

| Befehl | Was er tut |
| --- | --- |
| `fabscan [ordner] -o ausgabe` | Apps prüfen, Bericht nach `ausgabe/` (Standard: `fabscan-bericht/`) |
| `fabscan --app NAME` | nur eine App |
| `fabscan --models ../modelle` | Modelle aus einem anderen Ordner |
| `fabscan --fail-on fail` | Exit-Code 1 bei kritischen Befunden (für CI) |
| `fabscan fetch -w WORKSPACE` | Tenant direkt prüfen (Admin-Scanner-API + Workspace Monitoring), ohne Admin-Rechte die eigenen Workspaces |
| `fabscan fetch --ohne-admin` | gleich im Workspace-Modus prüfen (normale Fabric-API, Modelle per getDefinition) |
| `fabscan notebook` | Fabric-Notebook für den Tenant-Scan schreiben |
| `fabscan skill` | Skill nach `~/.claude/skills/fabscan` installieren, `--zip datei.zip` für claude.ai |

### 3 · Den ganzen Tenant prüfen

Welche Anwendungen fragen die Semantikmodelle außerhalb von Power-BI-Berichten ab, und wie?

**Direkt vom eigenen Rechner:**

```bash
az login                                  # oder Service Principal: AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET
fabscan fetch -w "Mein Workspace" --days 14
```

`fabscan fetch` liest die Modelle über die Admin-Scanner-API und die tatsächlich ausgeführten Abfragen aus dem
Workspace Monitoring. Die Monitoring-Datenbank findet es selbst, alternativ `--monitoring <Abfrage-URI>=<Datenbank>`.
Ohne `-w` prüft es alle aktiven Workspaces. Ergebnis wie immer in `fabscan-tenant/`, dazu die Rohdaten unter
`rohdaten/`. Nur Lesezugriffe.

**Ohne Fabric-Admin-Rechte** antwortet die Admin-API mit 401 oder 403. `fetch` wechselt dann von selbst in den
Workspace-Modus (oder gleich mit `--ohne-admin`):

- Workspaces aus der normalen Fabric-API, also nur die, in denen das eigene Konto Mitglied ist.
- Modelle per `getDefinition` als TMDL. Dafür braucht es mindestens die Rolle *Mitwirkender*.
- Mit nur Leserecht (getDefinition 403) liest `fetch` Tabellen, Spalten und Measures über `executeQueries` mit
  `INFO.VIEW.TABLES/COLUMNS/MEASURES` (braucht das Build-Recht). Dann fehlen die DAX-Ausdrücke und die Rollen: Die
  Spalte RLS zeigt „?“, „Modell hat keine RLS“ wird nicht gemeldet. Modelle ganz ohne Zugriff stehen mit Fehler in
  der Modell-Übersicht.
- Abfragen wie gehabt aus dem Workspace Monitoring. Keine Tenant-Einstellungen für Admin-APIs nötig.
- Der Bericht heißt dann „Prüfbericht Fabric Apps (Workspaces mit eigenem Zugriff)“ und zeigt den Hinweis, dass es
  ein Teilscan ist.

**Oder als Fabric-Notebook,** falls lokal kein Zugang zu den Admin-APIs besteht:
[`fabscan_tenant.ipynb`](../downloads/fabscan_tenant.ipynb) herunterladen (oder `fabscan notebook`),
in einen Workspace importieren, ein Lakehouse anhängen, Parameter ausfüllen, alle ausführen. fabscan ist darin
eingebettet.

- **Grundlagen:** die Modelle aus der Admin-Scanner-API und die tatsächlich ausgeführten DAX-Abfragen aus dem
  Workspace Monitoring.
- **Voraussetzungen für den ganzen Tenant (für beide Wege):** Fabric-Admin oder ein für Admin-APIs freigegebener Service Principal, die zwei
  Tenant-Einstellungen *Enhance admin APIs responses with detailed metadata* und *… with DAX and mashup expressions*,
  Workspace Monitoring in den Workspaces mit den Modellen.

**Wo fabscan das Workspace Monitoring findet:** Neues Monitoring legt ein Item vom Typ `Monitoring` an. fabscan
fragt `GET /v1/workspaces/{id}/monitoringItems` (Rückweg `items?type=Monitoring`), meldet ausgeschaltete
Datensammlung und nimmt die KQL-Datenbank `<Workspace>_<Item>_Database`. Liegt sie im zentralen Eventhouse eines
anderen Monitoring-Items, sucht fabscan in den übrigen Workspaces mit eigenem Zugriff. Ohne Monitoring-Item greift
das alte Muster (KQL-Datenbank mit „Monitoring“ im Namen). Die Log-Abfrage braucht nur `Timestamp`,
`OperationName`, `EventText` und `ItemId`; heißt die Tabelle nicht `SemanticModelLogs`, sucht fabscan sie per
`.show tables`.

**Für den ganzen Tenant einrichten**

| Was | Wozu |
| --- | --- |
| Rolle Fabric-Administrator oder ein Service Principal, der für Admin-APIs freigegeben ist | Workspaces, Scanner-API und die Item-Listen `GET /v1/admin/items?type=Monitoring` bzw. `?type=KQLDatabase` |
| Tenant-Einstellungen *Enhance admin APIs responses with detailed metadata* und *… with DAX and mashup expressions* | Tabellen und Measures im Scan |
| Workspace Monitoring in jedem Workspace mit Modellen, am besten als Monitoring-Item mit Weiterleitung an **ein zentrales Eventhouse** (Microsoft empfiehlt dafür einen eigenen Workspace auf eigener Kapazität) | Abfrage-Logs |
| Das prüfende Konto mindestens **Mitwirkender im zentralen Monitoring-Workspace** | Fabric-Admin gibt keinen Datenzugriff; ohne die Rolle bleiben die Datenbanken unlesbar |

Im Admin-Modus holt fabscan die Monitoring-Items und KQL-Datenbanken des ganzen Tenants mit zwei Aufrufen der
Admin-API (statt mehrerer Aufrufe je Workspace) und fragt Datenbanken auf demselben Eventhouse per
`union isfuzzy=true` ab, 25 je Abfrage. Der Bericht nennt Workspaces ohne Monitoring und Datenbanken ohne
Lesezugriff. Eine unlesbare Datenbank bricht den Lauf nicht ab. Ohne Admin-Liste (kein Admin) sucht fabscan je
Workspace wie im Workspace-Modus.

Mit exportierten Dateien geht es auch lokal: `fabscan --scan-result scan.json --query-log logs.csv`.

## Was herauskommt

Jeder Lauf schreibt einen Ordner:

| Datei | Für wen |
| --- | --- |
| `bericht.html` | Menschen: Gesamtbild, Ampel, je App Steckbrief, Datenweg als Bild und „Das Wichtigste“. Fundstellen im Code sind eingeklappt. Eine Datei, ohne externe Ressourcen. |
| `zusammenfassung.md` | Chat, Pull Request, Ticket |
| `befunde.json`, `befunde.csv` | Weiterverarbeitung: Power BI, Fabric App, Verlauf über die Zeit |

**Datenvertrag** (`schema_version` 2): eine Zeile je Befund mit den Spalten `run_id, run_date, source, scope,
client, client_path, workspace, model, category, category_label, severity, rule, title, headline, why, todo,
occurrences, runs, users, scanner_version, finding_id, status, exception_reason, exception_owner, exception_until`.
`finding_id` bleibt über Läufe gleich, `status` ist `offen`, `akzeptiert` oder `abgelaufen`. Das Notebook schreibt
dieselben Spalten in die Tabelle `fabscan_findings` (neue Spalten per `mergeSchema`). So kann ein Bericht oder eine
Fabric App alle Läufe zeigen und „behoben“ von „akzeptiert“ unterscheiden.

**Abdeckung:** Im Tenant-Modus steht vor den Befunden, was der Lauf gesehen hat und was nicht: Workspaces mit und
ohne Workspace Monitoring, Modelle (lesbar, nur mit Namen, nicht lesbar), Abfragen und Clients im Zeitraum, dazu
ungeprüfte MDX-Abfragen, abgeschnittene Abfragen (mehr als 400 verschiedene je Client) und die ausgenommenen
Berichtsabfragen.

## Ausnahmen: Befunde bewusst akzeptieren

Ein Befund, der geprüft und gewollt ist, kommt mit Begründung in `fabscan-ausnahmen.json` (im Repo bzw. im
aktuellen Ordner, oder `--ausnahmen DATEI`, im Notebook Parameter `AUSNAHMEN`):

```json
{"ausnahmen": [
  {"id": "3f2a9c1b7d4e", "begruendung": "Demo-Daten, alle dürfen alles sehen",
   "verantwortlich": "Team Finance", "bis": "2027-03-31"},
  {"regel": "SEC-AUTH", "client": "Pipeline*", "modell": "Finanzmodell",
   "begruendung": "Nächtlicher Export, nur für das Data-Team", "verantwortlich": "Data Platform"}
]}
```

Die ID steht im Bericht bei jedem Befund (Abschnitt für Entwickler) und in `befunde.csv`. Statt einer ID geht auch
eine Regel, eingeschränkt auf `client`, `modell` und `workspace` (Platzhalter `*`). Ohne Begründung gilt eine
Ausnahme nicht. Akzeptierte Befunde zählen nicht für Ampel, Gesamtbild und `--fail-on`, stehen aber im Abschnitt
„Bewusst akzeptiert“ und in den Daten. Nach dem Datum `bis` zählen sie wieder, mit Vermerk. Ausnahmen ohne Treffer
nennt der Bericht, damit veraltete auffallen.

## In CI

```yaml
- run: pip install "git+https://github.com/Losveratos/PowerBI-Kitchen-.git#subdirectory=fabric-app-scanner"
- run: fabscan . -o fabscan-bericht --fail-on fail
- uses: actions/upload-artifact@v4
  if: always()
  with: { name: fabscan-bericht, path: fabscan-bericht }
```

## Prüfregeln

| Regel | Stufe | Bedeutung |
| --- | --- | --- |
| `CALC-RAW` | ⚠ | Abfragen liefern nur Rohzeilen, kein Measure des Modells |
| `CALC-DEFINE`, `CALC-PROJ` | ⚠ | eigene Kennzahlen bzw. Ausdrücke in der Abfrage |
| `CALC-TS` | ⚠/ℹ | TypeScript rechnet mit Abfragefeldern |
| `LIN-MISSING-TABLE`, `LIN-MISSING-FIELD` | ✗ | Verweis existiert im Modell nicht |
| `LIN-NO-MODEL`, `LIN-OTHER-SOURCE` | ⚠ | Modell nicht im Repo, Datenweg am Modell vorbei |
| `SEC-AUTH` | ✗/⚠/ℹ | Repo: App-Identität statt angemeldeter Nutzer. Tenant: Service Principal, ⚠ nur auf einem Modell mit RLS (RLS filtert Service Principals nicht), sonst ℹ |
| `SEC-SECRET`, `SEC-TRACKED` | ✗ | Geheimnis im Code, `.env` o. Ä. im Repo |
| `SEC-HIDDEN` | ⚠/ℹ | ausgeblendetes Feld abgefragt (⚠ bei vertraulich klingendem Namen); Sortier- und Schlüsselspalten zählen nicht |
| `SEC-NO-RLS` | ℹ | Modell ohne Rollen |
| `SEC-CDN`, `SEC-EXTERNAL`, `SEC-STORAGE`, `SEC-HTML`, `SEC-CLIENT-RLS` | ⚠ | fremde Server, Browser-Speicher, HTML-Injektion, Nutzerfilter im Browser |
| `QRY-SHADOW` | ✗ | `DEFINE MEASURE` überschreibt ein Modell-Measure |
| `QRY-OVERRIDE`, `QRY-HARDCODED`, `QRY-REPLACE` | ⚠ | Filter aufgehoben, feste Filterwerte, Textersetzung in Abfragen |
| `DEV-TRANSFORM`, `DEV-NAME` | ⚠ | Runden/Bereinigen in der Abfrage, Modell-Kennzahl nachgerechnet |

## Grenzen

fabscan erkennt Muster und versteht DAX und TypeScript nicht vollständig. Befunde sind Hinweise zum Prüfen,
kein Urteil. Abfragen, die erst zur Laufzeit entstehen, sind nur teilweise sichtbar. Welche Anwendung hinter einem
Eintrag in den Tenant-Logs steckt, hängt davon ab, was der Client meldet.

## Entwicklung

```bash
cd fabric-app-scanner
python3 -m unittest discover -s tests
python3 -m fabscan skill --ziel ../.claude/skills/fabscan   # Skill im Repo aktualisieren
python3 -m fabscan skill --zip ../downloads/fabscan-skill.zip
python3 -m fabscan notebook -o ../downloads/fabscan_tenant.ipynb
```

Die Testdaten unter `tests/fixtures/` haben absichtlich kein `.platform`, damit eine Fabric-Git-Integration sie nicht
als Item übernimmt; die Tests legen eine Kopie mit den richtigen Namen an.

Lizenz: MIT · Daten-WG Knowledge Kitchen
