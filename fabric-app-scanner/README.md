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
| `fabscan fetch -w WORKSPACE` | Tenant direkt prüfen (Admin-Scanner-API + Workspace Monitoring) |
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

**Oder als Fabric-Notebook,** falls lokal kein Zugang zu den Admin-APIs besteht:
[`fabscan_tenant.ipynb`](../downloads/fabscan_tenant.ipynb) herunterladen (oder `fabscan notebook`),
in einen Workspace importieren, ein Lakehouse anhängen, Parameter ausfüllen, alle ausführen. fabscan ist darin
eingebettet.

- **Grundlagen:** die Modelle aus der Admin-Scanner-API und die tatsächlich ausgeführten DAX-Abfragen aus dem
  Workspace Monitoring.
- **Voraussetzungen (für beide Wege):** Fabric-Admin oder ein für Admin-APIs freigegebener Service Principal, die zwei
  Tenant-Einstellungen *Enhance admin APIs responses with detailed metadata* und *… with DAX and mashup expressions*,
  Workspace Monitoring in den Workspaces mit den Modellen.

Mit exportierten Dateien geht es auch lokal: `fabscan --scan-result scan.json --query-log logs.csv`.

## Was herauskommt

Jeder Lauf schreibt einen Ordner:

| Datei | Für wen |
| --- | --- |
| `bericht.html` | Menschen: Gesamtbild, Ampel, je App Steckbrief, Datenweg als Bild und „Das Wichtigste“. Fundstellen im Code sind eingeklappt. Eine Datei, ohne externe Ressourcen. |
| `zusammenfassung.md` | Chat, Pull Request, Ticket |
| `befunde.json`, `befunde.csv` | Weiterverarbeitung: Power BI, Fabric App, Verlauf über die Zeit |

**Datenvertrag** (`schema_version` 1): eine Zeile je Befund mit den Spalten `run_id, run_date, source, scope,
client, client_path, workspace, model, category, category_label, severity, rule, title, headline, why, todo,
occurrences, runs, users, scanner_version`. Das Notebook schreibt dieselben Spalten in die Tabelle
`fabscan_findings`. So kann ein Bericht oder eine Fabric App alle Läufe zeigen, egal woher sie kommen.

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
| `SEC-AUTH` | ✗/⚠ | App-Identität oder Service Principal statt angemeldeter Nutzer |
| `SEC-SECRET`, `SEC-TRACKED` | ✗ | Geheimnis im Code, `.env` o. Ä. im Repo |
| `SEC-HIDDEN` | ⚠/ℹ | ausgeblendetes Feld abgefragt (⚠ bei vertraulich klingendem Namen) |
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
