# Spike A · Kitchen-Visuals automatisch installieren

Stand 01.10.2026. Modul: `mockup-live/agent/visuals_install.py`. Testkopie:
`%TEMP%\claude\…\scratchpad\cv-spike\` (Testbed, compatibilityLevel auf 1600 gehoben).

## Ergebnis in einem Satz

Die Dateiseite ist gelöst und byte-genau gegen Desktop geprüft. Der Nachweis in Desktop
(Rendern, Reload, Neustart) steht noch aus: beide Starts der Testkopie hingen vor dem Laden
der Datei in einem Microsoft-Anmeldedialog („Konto auswählen“), danach war der Bildschirm
gesperrt. Es gibt deshalb noch keine Screenshots.

## Struktur, die Desktop schreibt (verifiziert)

```
<Name>.Report/
  CustomVisuals/<guid>/package.json
  CustomVisuals/<guid>/resources/<guid>.pbiviz.json
  definition/report.json   → resourcePackages[]
```

`report.json`, Eintrag je Visual (Zuordnung von `name` und `path` genau wie bei Desktop, auch wenn sie vertauscht wirkt):

```json
{ "name": "<guid>", "type": "CustomVisual",
  "items": [ { "name": "resources/<guid>.pbiviz.json",
               "path": "<guid>.pbiviz.json",
               "type": "CustomVisualMetadata" } ] }
```

`package.json` ist gegenüber dem Zip gekürzt: nur `resources`, `visual: {guid}`, `metadata`
(ohne `version` und `author`).

Serialisierung durch Desktop unter `CustomVisuals/`: 2 Leerzeichen Einrückung, CRLF, kein BOM.
**Desktop ersetzt dabei jedes Nicht-ASCII-Zeichen durch `?`** (je UTF-16-Einheit, Emoji also `??`).
Das ist verlustbehaftet: Gedankenstriche, Pfeile und Symbole im Visual-JS werden zu `?`.
`report.json` schreibt Desktop dagegen mit LF und ohne Zeilenumbruch am Dateiende.

Gegenprobe: ChartKitchen 1.42 (`.pbiviz` 1.42 aus einem lokalen Demo-Bericht) mit `encoding="desktop"`
installiert ergibt `package.json` und `<guid>.pbiviz.json` **byte-identisch** zur
Desktop-Installation in `MockupLive-Test`. `report.json` weicht nur im fehlenden
Schlusszeilenumbruch ab.

## Modul `visuals_install.py`

| Funktion | Zweck |
|---|---|
| `catalog()` | Kitchen-Name → neueste `.pbiviz` (GUID und Version aus `package.json` im Zip). Sucht im Repo und, bei Worktrees, im Haupt-Checkout (dort liegen `ibcsPnLWaterfall`, `zugKpi` ungetrackt). Namen: `chartkitchen`, `gantt`, `pnl`, `kpicard`, `pnlwaterfall`, `zugkpi`. |
| `resolve(name\|pfad\|guid)` | Pfad zur `.pbiviz` |
| `install(report_dir, pbiviz, encoding="escape", dry_run=False)` | Entpackt nach `CustomVisuals/<guid>/` (neu aufgebaut, keine Altdateien), ergänzt oder ersetzt den `resourcePackages`-Eintrag. Rückgabe: `action` (`installed`/`upgraded`/`downgraded`/`repaired`/`unchanged`), `files_changed`, `report_json_changed`. |
| `installed(report_dir)` | GUID, Version, Anzeigename, `registered`, `folder` |

Standard-Encoding `escape`: gleiche Form wie Desktop, aber Nicht-ASCII als `\uXXXX`. Die Datei
bleibt reines ASCII und verlustfrei. `encoding="desktop"` nur für Vergleiche.

Geprüft: Neuinstallation, zweiter Lauf `unchanged`, Upgrade 1.42 → 1.43 tauscht nur die
`pbiviz.json` und lässt `report.json` unverändert, `pbir validate --all` gültig.
`report.json` wird nur geschrieben, wenn sich der Eintrag ändert. Ein unveränderter Roundtrip
der Testbed-`report.json` ist byte-identisch, die Änderung bleibt also minimal.

CLI: `python visuals_install.py catalog | installed <Report> | install <Report> <name|pfad> [--dry-run]`

## pbir und Custom Visuals

- `pbir add visual <guid> …` → „Unknown visual type“.
- `pbir visuals bind` → „Data roles … not found“, auch mit `--rawdog`.
- `pbir set <visual>.chart.orientation` → „Unknown component: chart“, auch mit `--rawdog`.
- `pbir validate --all` akzeptiert ein von Hand geschriebenes `visual.json` mit Feldbindung
  (Felder gegen das Modell geprüft). Es kommen nur zwei Warnungen: `UNKNOWN_VISUAL_TYPE`
  (erwartet) und `SCHEMA_DEGRADED` (visualContainer 2.12.0 lokal nicht vorhanden).
- Ein fehlender `resourcePackages`-Eintrag fällt `pbir validate` nicht auf. Das muss
  `installed()` prüfen.

Folge: Kitchen-Visuals (Anlegen, Binden, Objekte) muss der Runner selbst als JSON schreiben,
wie bisher. pbir dient nur zur Prüfung.

## Desktop-Test (offen)

| Schritt | Stand |
|---|---|
| a · ChartKitchen bei geschlossenem Desktop installieren, `ck_spike` (DimDate.MonthName + _Measures.AC, `orientation 'columns'`) anlegen | Dateien fertig, `pbir validate` gültig |
| a · öffnen und rendern | **blockiert**: 19:52 Start, Dialog „Konto auswählen“ (AAD-Broker), dann „Wir arbeiten daran“ ohne CPU-Last. Fenster blieb „Unbenannt“, Bridge meldete „Host is not ready“. Zweiter Start 20:15 genauso, 38 Min. ohne Fortschritt bei gesperrtem Bildschirm. |
| b · zweites Visual bei offenem Desktop plus `reload` | nicht ausgeführt (Generator liegt bereit: `scratchpad\add_kpi.py` für ibcsKpiCard, Rollen `ac`/`py`/`trend`) |
| c · schließen, neu öffnen | nicht ausgeführt |

Desktop hat in der Testkopie nichts geschrieben, sie ist im Zustand „nach Installation“.
Die eigenen Instanzen (PID 32628, 43628) sind beendet. Fremde Instanzen 5672
(MockupLive-Test) und 45408 (ein anderer Demo-Bericht, ungespeichert) laufen seit 29.09. weiter und wurden
nicht angefasst. 45408 antwortet der Bridge zeitweise nicht.

Zum Fortsetzen (Bildschirm entsperrt, Anmeldedialog von Hand schließen oder Konto wählen):

```
pbidesktop.exe "<scratch>\cv-spike\PBI-IBCS-Testbed.pbip"
pbir desktop list                       # bis die PID mit Datei erscheint
pbir desktop screenshot "<abs>\PBI-IBCS-Testbed.Report" --pid <PID> -o a_ck.png
python visuals_install.py install "<abs>\PBI-IBCS-Testbed.Report" kpicard
python <scratch>\add_kpi.py "<abs>\PBI-IBCS-Testbed.Report"
pbir desktop reload "<abs>\PBI-IBCS-Testbed.Report" --pid <PID>; screenshot → b_kpi_reload.png
Desktop schließen, öffnen, screenshot → c_reopen.png
```

## Empfohlener Runner-Ablauf (vorläufig)

1. `catalog()` gegen `installed()` abgleichen. Fehlt nichts und ist alles aktuell, Desktop nicht anfassen.
2. Sonst: `pbir desktop list`. Hat die Zielinstanz ungespeicherte Änderungen, abbrechen oder
   nachfragen. Dann nur diese PID schließen und warten, bis der Prozess weg ist.
3. `install()` je fehlendem oder veraltetem Visual, danach `pbir validate --all`.
4. Desktop mit der `.pbip` starten und warten, bis die Bridge die PID **mit Dateipfad** meldet.
   „Host is not ready“ heißt: weiter warten. Dauert es länger als etwa 3 Minuten, im Status
   „Anmeldung in Desktop prüfen“ melden. Den Dialog nicht wegklicken (Nutzeraktion).
5. Erst danach Visual-JSON schreiben und `pbir desktop reload`. Ob ein neu registriertes
   Visual per Reload erkannt wird, klärt Schritt b. Bis dahin gilt: neue Registrierung heißt
   Neustart.

## Risiken

- **Anmeldedialog beim Start** blockiert das Laden und damit die ganze Kette. Ohne
  angemeldete Sitzung und ohne entsperrten Bildschirm läuft kein unbeaufsichtigter Deploy.
  Das ist der größte offene Punkt.
- Desktop speichert über externe Änderungen. Öffnet jemand den Bericht in einer alten Instanz
  und speichert, ist die Registrierung weg. Deshalb prüft `installed()` vor jedem Deploy.
- Nach jedem Speichern durch Desktop steht `?` statt Unicode in der `pbiviz.json`. Kosmetisch
  für Glyphen im Visual. Ein erneutes `install()` repariert das (`action: repaired`).
- Die GUID ist der Schlüssel. Ein Visual mit neuer GUID (Fork) zählt als anderes Visual, die
  alten `visualType`-Verweise bleiben bestehen.
- Organisations- oder AppSource-Version desselben Visuals im Tenant hat Vorrang (nicht getestet).
- `compatibilityLevel`: Die Testbed-Quelle hat 1567, Desktop braucht mindestens 1600.
  MockupLive-Test hat 1606.
