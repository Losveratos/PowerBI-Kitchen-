# Dateivertrag Kitchen ↔ Agent (Version 1)

Kitchen und Agent sprechen nur über Dateien im Projektordner. Keiner ruft den anderen direkt auf. So funktioniert es ohne Server, offline und mit jedem Agenten, der Dateien lesen kann.

```
<Projekt>/                         Ordner mit <Name>.pbip, <Name>.Report, <Name>.SemanticModel
└── mockup/
    ├── .gitignore                 legt der Runner (oder das Kitchen) an: `*` plus Allowlist, siehe „Ablage in mockup/"
    ├── mockup-spec.json           Kitchen, laufend (1 s nach der letzten Änderung)
    ├── AGENT-BRIEF.md             Kitchen, zusammen mit der Spec
    ├── deploy-request.json        Kitchen, nur beim Klick auf „Deploy"
    ├── model-approvals.json       Kitchen oder Agent: Freigaben für Modelländerungen (siehe unten)
    ├── agent-status.json          Runner, bei jedem Zustandswechsel und alle 5 s (Herzschlag)
    ├── shots/<seq>/<pageName>.png Runner, Screenshots aus Desktop nach dem Reload
    ├── kitchen/<seq>/<pageName>.png  Kitchen, beim Deploy: die Seite, wie das Kitchen sie zeigt (Bildvergleich)
    ├── kitchen/<seq>/tiles.json   Kitchen, beim Deploy: Rechteck je Kachel in Seiten-px
    ├── out/                       Runner, Ausgabe von mockup_to_pbir.py
    ├── backup/<seq>/              Runner, Kopie von <Name>.Report vor dem Schreiben
    ├── .state/last-applied-spec.json   Runner, Spec des letzten erfolgreichen Deploys
    └── .state/model-applied.json       Runner, schon bearbeitete Modell-Freigaben (Op-ID, DAX-Signatur)
```

**Grundregeln**
- Das Kitchen schreibt nur in `mockup/`, nie in `*.Report` oder `*.SemanticModel`.
- Der Runner schreibt den Bericht über `pbir`. Ausnahmen: die `visual.json` von ChartKitchen- und Custom-Visual-Kacheln (Hülle per `pbir`, dann Datei), Lage, Größe und Container-Stil von Custom Visuals (`pbir batch` kennt deren Typ nicht, siehe „Korrekturrunde"), das Entfernen eines eigenen Visuals beim Typwechsel, falls `pbir rm` es verweigert, und die Installation der Kitchen-Visuals (`visuals_install.py`: `CustomVisuals/` und `report.json`).
- Das Modell ändert der Runner nur über `te` (`model_ops.py`): Format, Beschreibung und Anzeigeordner automatisch, neue Kennzahlen, DAX und Umbenennungen erst nach Freigabe in `model-approvals.json`. Ohne `te` (fehlt oder abgelaufen) bleibt alles ein `model`-To-do.
- `report.json` und `definition.pbir` ändert der Runner nur, wenn Desktop das Projekt nicht offen hat. Dafür darf er die Desktop-Instanz genau dieses Projekts schließen und danach wieder öffnen (siehe „Kitchen-Visuals und Neustart").
- Alle Dateien sind UTF-8 ohne BOM. Zeitpunkte als ISO 8601 mit Zeitzone.
- Wer schreibt, schreibt erst in `<datei>.tmp` und benennt dann um, damit der andere nie eine halbe Datei liest. (Das Kitchen kann über die File System Access API nicht atomar umbenennen. Es schreibt direkt, der Runner verwirft deshalb JSON, das sich nicht parsen lässt, und liest 300 ms später erneut.)

## deploy-request.json (Kitchen → Runner)

```json
{
  "contract": 1,
  "seq": 7,
  "requestedAt": "2026-09-28T14:03:11.412+02:00",
  "specHash": "<meta.specHash der gleichzeitig geschriebenen mockup-spec.json>",
  "target": "desktop",
  "client": "MockupKitchen 0.6.0"
}
```

- `seq` steigt pro Klick um 1. Das Kitchen startet bei `max(eigener Zähler, agent-status.seq) + 1`.
- `target`: `"desktop"` (Stufe 1). `"desktop+service"` ist für Stufe 2 reserviert, der Runner antwortet darauf vorerst mit `blocked`.
- Der Runner bearbeitet jede `seq` genau einmal. Passt `specHash` nicht zur Spec auf der Platte, wartet er bis zu 3 s auf die neue Spec und meldet sonst `failed` mit `message`.

## agent-status.json (Runner → Kitchen)

```json
{
  "contract": 1,
  "runner": { "version": "0.1.0", "pid": 1234, "heartbeatAt": "2026-09-28T14:03:20+02:00" },
  "seq": 7,
  "state": "applied",
  "startedAt": "2026-09-28T14:03:11.900+02:00",
  "finishedAt": "2026-09-28T14:03:24.100+02:00",
  "message": "4 Visuals aktualisiert, 1 neu angelegt, Desktop neu geladen",
  "desktop": { "connected": true, "file": "C:\\...\\X.pbip", "hasUnsavedChanges": false, "reloaded": true },
  "steps": [
    { "id": "bridge",   "state": "ok",   "msg": "Desktop offen mit X.pbip, keine ungespeicherten Änderungen" },
    { "id": "backup",   "state": "ok",   "msg": "mockup/backup/7" },
    { "id": "build",    "state": "ok",   "msg": "mockup_to_pbir.py --plan" },
    { "id": "write",    "state": "ok",   "msg": "…" },
    { "id": "validate", "state": "ok",   "msg": "pbir validate --fields: 0 Fehler" },
    { "id": "reload",   "state": "ok",   "msg": "…" },
    { "id": "shots",    "state": "ok",   "msg": "3 Seiten" }
  ],
  "pages":   { "<Seitenname aus der Spec>": { "state": "applied", "shot": "shots/7/Übersicht.png" } },
  "visuals": { "<stableId, sonst id>": { "state": "applied", "msg": "" } },
  "todos":   [ { "kind": "model", "ref": "Sales.Marge %", "text": "Neue Kennzahl, DAX-Vorschlag wartet auf Freigabe" } ]
}
```

- `state`: Ergebnis der letzten `seq`: `applied`, `blocked` (Voraussetzung fehlt; in der Regel nichts geschrieben, Ausnahme siehe Neustart), `failed` (Fehler beim Schreiben, Backup zurückgespielt). `idle` nur, solange noch kein Deploy lief.
- `runner.state`: `idle`, `running` (ein Deploy läuft gerade) oder `stopped`. So geht kein Ergebnis verloren, wenn das Kitchen langsam liest.
- `steps[].state` und `visuals[].state`: `ok`/`applied`, `skipped`, `warn`, `error`.
- Schritte (Runner 0.2, in dieser Reihenfolge, nicht jeder kommt in jedem Lauf): `bridge` (Desktop-Status), `spec`, `build`, `visuals` (Kitchen-Visuals installieren), `desktop` (Desktop schließen bzw. öffnen), `theme`, `model` (te), `plan`, `backup`, `write`, `validate`, `reload`, `shots`, `compare` (Bildvergleich). Werden Kitchen-Visuals installiert oder das Theme registriert, kommt `backup` seit Runner 0.3.2 vor `visuals`. Jede Meldung endet mit der Dauer seit dem vorigen Schritt.
- `blocked` gibt es insbesondere, wenn
  - Desktop nicht läuft oder ein anderes Projekt offen hat und nichts zu installieren ist (sonst installiert der Runner und öffnet Desktop selbst),
  - Desktop ungespeicherte Änderungen hat und der Runner mit `--respect-unsaved` läuft. Ohne diese Option gilt seit der Beta die Tabelle „Rückfragen“ (Beta-Ergänzungen): bei echter Arbeit in Desktop und bei jedem Neustart fragt der Runner nach (`awaiting`, `kind: "unsaved"` bzw. `"restart"`); ohne Rückfrage überschreibt der Reload nur eine Markierung, die vom eigenen Reload stammt (Grenze siehe `unsavedByUsCertain`), und vermerkt das. Bleibt eine Rückfrage unbeantwortet, endet der Deploy nach `--confirm-timeout` als `blocked`,
  - `unappliedChanges.json` im Modellordner liegt,
  - Desktop nach dem Neustart nicht innerhalb der Wartezeit (Vorgabe 180 s) mit dem Projekt erscheint: „Desktop startet nicht, bitte Desktop öffnen und anmelden, dann erneut deployen". Bericht und Kitchen-Visuals sind dann schon geschrieben (harmlos); der nächste Deploy läuft normal weiter.
- `desktop`: `connected`, `file`, `pid`, `hasUnsavedChanges`, `reloaded`, dazu ab Runner 0.2 `cli` (`pbir` oder `bridge`), `closedForInstall`, `reopened`, `visualsInstalled` (`[{guid, name, version, action}]`), `modelReloaded` und `calls` (Desktop-Aufrufe mit Dauer, zur Messung pbir gegen Bridge-CLI).
- `visuals` kennt die Visuals, die dieser Deploy angefasst hat. Ab Runner 0.2 stehen dort zusätzlich nicht angefasste Kacheln, für die es einen Bildvergleich gibt: `state: "ok"`, `msg: "unverändert"`, dazu `diff`.
- `pages[name].compare`: `{score, ms}` Mittel der Kacheln dieser Seite.
- `todos.kind`: `model` (Feld fehlt, Modellwunsch, `te` fehlt), `theme` (berichtsweite Gestaltung, solange der Bericht kein Custom Theme hat), `manual` (alles, was ein Mensch in Desktop tun muss), `removed` (steht im Bericht, fehlt im Mockup, wird nie gelöscht).
- `model`-To-dos aus `model_ops` tragen zusätzlich `id` (Op-ID, z. B. `addMeasure:_Measures.Marge %`), `summary`, `commandLines` (te-Befehle zum Anzeigen) und `needsApproval`.
- Herzschlag: `runner.heartbeatAt` älter als 15 s heißt für das Kitchen „Agent nicht aktiv".

## Kitchen-Visuals und Neustart (Runner 0.2, Paket A)

- Vor dem Schreiben bestimmt der Runner, welche Kitchen-Visuals die Spec braucht: ChartKitchen für `engine: "ck"`-Kacheln mit gültigem Modus, dazu jedes Custom Visual aus `custom-visuals.json` des Konverters (Gantt, GuV, `ibcsKpiCard` für `kpi`). Abgleich: `visuals_install.catalog()` (neueste `.pbiviz` im Repo) gegen `installed()` (registriert in `report.json` und Ordner unter `CustomVisuals/`). Fehlt eines oder ist es älter, wird es installiert.
- Desktop hat das Projekt offen: Der Runner schließt **nur die Instanz, deren `currentFilePath` dieses Projekt ist** (PID aus dem Desktop-Status, Image `pbidesktop.exe` geprüft; ohne ungespeicherte Änderungen erst höflich, sonst hart), installiert, registriert bei Bedarf einmalig das Custom Theme, schreibt den Bericht und öffnet Desktop danach mit `powerbi-desktop open <pbip>` (`PBI_DESKTOP_PATH`: gesetzter Wert, sonst die exe der geschlossenen Instanz, sonst die neueste Store-Version). Nach dem frischen Öffnen gibt es keinen Reload. Andere Desktop-Instanzen werden nie angefasst.
- Desktop lief nicht: dasselbe ohne Schließen. Ist nichts zu installieren, bleibt es bei `blocked`.
- `--no-desktop-restart`: installiert trotzdem und meldet das To-do „Desktop neu starten" (nicht speichern, sonst überschreibt Desktop die Registrierung).
- Mit installiertem ChartKitchen baut der Runner die Kacheln ohne Referenz-Instanz aus dem Slot (`objects`, `container`, Projektionen). Eine Referenz-Instanz wird nur noch repliziert, wenn das Paket im Bericht fehlt (z. B. Organisations-Visual). Eine eigene ChartKitchen-`cards`-Kachel oder ein Ersatzvisual einer `kpi`-Kachel ersetzt der Runner durch `ibcsKpiCard`; fremde Visuals nie.
- Theme: Hat der Bericht kein Custom Theme, registriert der Runner im selben geschlossenen Fenster eines (`pbir theme apply-template … Custom`, umbenannt in `MockupKitchen`). In eingelesenen Projekten nur nach einer Designänderung (Runner 0.3.2, siehe „Abgleich mit dem Bericht"), sonst behält der Bericht sein Theme. Danach setzt jeder Deploy nur `pbir theme set-colors`/`set-fonts` aus `out/theme-fragment.json`, wo die Theme-Datei abweicht (`report.json` bleibt unberührt). Ohne geschlossenes Fenster bleibt es beim `theme`-To-do; `--restart-for-theme` erlaubt den Neustart auch nur dafür.

## Modell-Freigaben (model-approvals.json)

```json
{ "ids": ["addMeasure:_Measures.Marge %", "changeDax:_Measures.AC"],
  "overrides": { "changeDax:_Measures.AC": { "dax": "CALCULATE([Umsatz], …)" } } }
```

- Diese alte Form (ohne Hash) gilt seit Runner 0.3.1 als veraltet und wird nicht mehr ausgeführt; gültig ist die neue Form mit `hash` (Beta-Ergänzungen, „Modell-Freigaben, Hash").
- Schreiben dürfen das Kitchen oder der Agent (nach Freigabe im Chat). Der Runner liest die Datei bei jedem Deploy, ändert sie nie.
- Freigegebene Ops führt der nächste Deploy über `te` aus (eine neue Freigabe schaltet den Schnellweg „nichts geändert" ab). Bearbeitete Freigaben merkt sich der Runner in `.state/model-applied.json` mit der DAX-Signatur; eine geänderte `overrides`-DAX gilt als neue Freigabe.
- Nach einer Modelländerung lädt der Runner Desktop mit Modell neu (`pbir desktop reload --model`). Ist `te` abgelaufen, gibt es das To-do „te abgelaufen …, bitte aktualisieren" und der Deploy läuft ohne Modelländerung weiter.

## Delta-Regel (PBIP ist die Wahrheit)

Der Runner vergleicht die neue Spec mit `.state/last-applied-spec.json`, nicht mit dem Bericht. Er schreibt nur Visuals und Seiten, die sich im Kitchen geändert haben oder neu sind. Was jemand in Desktop verschoben und gespeichert hat, bleibt unberührt, solange die Kachel im Kitchen nicht angefasst wurde. Beim ersten Deploy ohne `last-applied-spec.json` gilt alles als neu. Seiten, die im Bericht schon existieren, werden dann nur per Delta aktualisiert, nicht neu angelegt.

**Abgleich mit dem Bericht (Runner 0.3.1, Demo B2 ersetzt Audit Deploy 4, Ursache 4).** Eingelesene Seiten (`pages[].pbir.page`) und Kacheln (`pbir.visual`) bleiben so gestaltet, wie sie im Bericht stehen. Kitchen-Gestaltung kommt dort nur nach einer **echten Designänderung**, also wenn `design` von dem der Vergleichsbasis (`baseline-spec.json` bzw. letzter Deploy) abweicht:
- **Seitenhintergrund:** eingelesene Seiten nur nach einer Designänderung. Neue Seiten wie bisher. Vom Runner angelegte Seiten (`.state/page-map.json`) bekommen ihn auch, wenn er im Bericht fehlt oder abweicht.
- **Kachelstil** eingelesener Kacheln (nicht `lossy`): nur nach einer Designänderung gleicht der Runner Kachelfläche, Rahmen und Schatten (`background.*`, `border.*`, `dropShadow.*`) und bei ChartKitchen den Modus (`chart.orientation`) gegen den Bericht ab und schreibt nur, was dort anders steht. Die Ebene (`z`) bleibt.
- **Rahmen** (Kopfband, Fußleiste, Filterbereich, Navigation aus `zones`): nie auf eingelesene Seiten, auch wenn sich `zones` im Kitchen ändert (die Zonen gelten im Kitchen für alle Seiten). Der Runner meldet dafür einmal das To-do `manual`/`frame`.
- **Theme** (Farben, Schriften, Arbeitsfläche aus `out/theme-fragment.json`): nur nach einer Designänderung, beim ersten Deploy eines nicht eingelesenen Projekts, direkt nach der Registrierung des Themes `MockupKitchen` oder mit `scope: "theme"`. Ein eigenes Theme des Berichts bleibt sonst unberührt. **Registriert** wird `MockupKitchen` in einem eingelesenen Projekt ohne Custom Theme ebenfalls nur nach einer Designänderung oder mit `scope: "theme"`, auch beim Vorbereiten (Runner 0.3.2, Safety-Review 2 (11)); sonst behält der Bericht sein Basis-Theme, `plan.themeRegister` ist `false` und das Kitchen zeigt im Vorbereiten-Dialog keine Theme-Pille. Wird doch registriert, nennt `restartReason` „Theme des Berichts wird ersetzt".
- Ein Deploy, der in einem eingelesenen Bericht nur eine Seite ergänzt, schreibt nur diese Seite (Ordner der Seite und `pages.json`), nimmt nur sie auf und lädt Desktop einmal neu.

Bei ChartKitchen-Kacheln mischt der Runner die `objects` des Konverter-Slots je Objekt in die vorhandene `visual.json` (Kitchen-Werte gewinnen, in Desktop gesetzte andere Eigenschaften bleiben), sobald sich die Kachel oder die Gestaltung geändert hat; bei reinen Lage- oder Titeländerungen nur Lage bzw. Titel (`ibcsTitle`, Container-Titel). `title: ""` bzw. `titleShown: false` schaltet den Titel aus.

## Zuordnung zu bestehenden PBIR-Objekten

Seiten und Visuals, die das Kitchen aus dem Projekt eingelesen hat, tragen ihre Herkunft in der Spec. Der Runner aktualisiert dann genau dieses Objekt und legt kein zweites an.

```json
"pages":   [ { "name": "Übersicht", "pbir": { "page": "<Ordnername der Seite>" }, "visuals": [
  { "id": "v12", "stableId": "…", "pbir": { "page": "<Ordnername der Seite>", "visual": "<Ordnername des Visuals>" }, "…": "…" }
] } ]
```

- Ohne `pbir` ist ein Visual neu und wird angelegt.
- Mit `pbir` wird es per Delta aktualisiert (Position, Größe, Bindung, Titel), nie neu angelegt.
- Fehlt das PBIR-Objekt inzwischen (in Desktop gelöscht), meldet der Runner `visuals[id].state = "skipped"` mit Hinweis und legt es nicht neu an.

## Grundlinie nach dem Einlesen (baseline-spec.json)

Übernimmt das Kitchen das Layout aus dem Projekt, schreibt es sofort danach `mockup/baseline-spec.json`: die Spec genau so, wie sie aus dem PBIR eingelesen wurde.

- Der Runner nimmt als Vergleichsbasis die jüngere der beiden Dateien `.state/last-applied-spec.json` und `baseline-spec.json` (nach `meta.exportedAt`, ersatzweise Änderungszeit der Datei).
- Damit gilt das eingelesene Layout als schon angewendet. Ein Deploy schreibt nur, was danach im Kitchen geändert wurde.

**Verlustbehaftete Zuordnung:** Visuals mit `pbir.lossy: true` konnte das Kitchen nicht vollständig abbilden, zum Beispiel Tooltip-Felder ohne Kitchen-Rolle. Bei ihnen schreibt der Runner nur Position und Größe, nie Bindungen oder Titel. Titel und Bindungen schreibt er bei eingelesenen Visuals ohnehin nur, wenn sie sich gegenüber der Basis geändert haben.

**Gruppen:** Eingelesene Visuals aus Gruppen tragen im Kitchen absolute Positionen. Beim Zurückschreiben rechnet der Runner sie in die Koordinaten der Gruppe um, falls PBIR dort relative Positionen erwartet.

## Kitchen-Bild für den Bildvergleich (ab Kitchen 0.5.5)

Beim Klick auf „Deploy" baut das Kitchen die Bilder aus genau dem Stand der Spec dieser `seq` und schreibt sie **direkt nach** `deploy-request.json` (Rastern dauert je Seite einige hundert Millisekunden, der Deploy soll dafür nicht warten). `tiles.json` kommt zuletzt: liegt sie da, sind alle Bilder vollständig. Der Runner vergleicht ohnehin erst nach Reload und Screenshot und wartet dort bis zu 30 s auf `kitchen/<seq>/tiles.json`.

```
mockup/kitchen/<seq>/<Seitenname>.png   je Seite, Breite × Höhe = canvas.width × canvas.height der Spec (= PBIR-Seitengröße, Maßstab 1)
mockup/kitchen/<seq>/tiles.json         Lage der Kacheln
```

- Das Bild kommt aus `render-png.js` im Vergleichsmodus: Seitenhintergrund, Zonen, Kacheln mit Kopf und Skizze wie auf dem Bildschirm, aber **ohne** Rollen-Chips, Engine-Badges und Notiz-Symbole (gibt es in Desktop nicht). Die Fußzeile der Chips bleibt als leere Fläche stehen, damit die Skizze genau so groß ist wie im Tool (gleiche Schwellen für Beschriftung und Δ-Ebenen).
- Dateiname: der Seitenname (NFC), die Zeichen `\ / : * ? " < > |` und Steuerzeichen durch `_` ersetzt, Punkte und Leerzeichen am Ende entfernt. Sind zwei Namen danach gleich, bekommt der zweite `_<Index>`. **Maßgeblich ist `pages[].file` in `tiles.json`**, nicht der erratene Name.
- Scheitert das Rendern, meldet das Kitchen es als Hinweis; der Deploy gilt trotzdem. Fehlt `tiles.json` zu einer `seq` auch nach der Wartezeit, vergleicht der Runner nicht und meldet das als Schritt `compare` mit `skipped`.
- Der Runner sollte `kitchen/` in `mockup/.gitignore` aufnehmen.

`tiles.json`:

```json
{
  "contract": 1, "seq": 7, "specHash": "<meta.specHash>", "createdAt": "2026-10-01T21:03:11.412+02:00",
  "client": "MockupKitchen 0.5.5", "scale": 1,
  "pages": [ { "id": "p1", "name": "Übersicht", "file": "Übersicht.png", "png": "kitchen/7/Übersicht.png",
               "width": 1920, "height": 1080, "pbir": { "page": "<Ordnername>" },
               "zones": { "header": { "x": 0, "y": 0, "w": 1920, "h": 84 }, "content": { "x": 0, "y": 84, "w": 1920, "h": 996 } } } ],
  "tiles": { "<stableId>": { "page": "Übersicht", "id": "mk_<stableId>", "kind": "kombi", "title": "", "displayName": "Kombi",
                             "rect": { "x": 15, "y": 99, "w": 838, "h": 457 },
                             "body": { "x": 32.5, "y": 136, "w": 803, "h": 367 }, "headH": 36, "footH": 27 } }
}
```

- `rect` = Kachel wie `pages[].visuals[].rect` der Spec, in Seiten-px. `body` = Fläche der Skizze in der Kachel (ohne Kopf und Chip-Fußzeile), für einen Vergleich nur des Diagramms. `headH`/`footH` = Höhe von Kopf bzw. Chip-Fußzeile (0, wenn keine).
- Leere Kacheln (ohne Visual) stehen nicht in `tiles`.
- `pages[].zones` = Rahmenzonen wie `spec.zones` (Kopfband, Fußleiste, Filterbereich, Navigation, Inhalt).

### Befunde des Runners: `agent-status.json` → `visuals[id].diff`

```json
"visuals": { "<stableId, sonst id>": { "state": "applied", "msg": "",
             "diff": { "score": 0.82, "notes": [ "Δ-Ebene fehlt in Desktop", "Beschriftung kleiner (9 pt statt 10,1 pt)" ] } } }
```

- `score`: 0 bis 1 (0 bis 100 erkennt das Kitchen auch). Ab 90 % grün, ab 70 % gelb, darunter rot.
- `notes`: kurze Sätze für Menschen, ein Befund je Eintrag.
- So rechnet der Runner (`agent/tile_compare.py`, Stand 02.10.2026): Zuerst wird die Berichtsseite im Desktop-Screenshot gefunden (`find_canvas`). Die Aufnahme zeigt je nach Desktop die Berichtsansicht oder das ganze Fenster mit Menüband und Filterbereich. Gesucht wird ein Rechteck im Seitenverhältnis der PBIR-Seite, umgeben von einer einheitlichen Umgebungsfarbe (dunkel oder hell), Kanten auf die stärkste Helligkeitsstufe eingerastet; eine unten abgeschnittene Seite zählt ab 40 % Sichtbarkeit, Kacheln darunter werden als verdeckt gemeldet. Wird keine Seite gefunden, wird nicht bewertet (`compare` = warn). Optional steht das Rechteck in `pages[name].compare.canvas`. Vorher wartet der Runner, bis Desktop fertig gezeichnet hat (`wait_for_render`: Aufnahmen im Abstand von 1,5 s, bis zwei Ausschnitte fast gleich sind und keine Visual-Kachel mehr leer ist, höchstens `--shot-wait` s, Standard 8; wird die Seite nicht gefunden, hilft ein gemerktes Rechteck derselben Desktop-Sitzung, siehe „Korrekturrunde"). Dann Kitchen-Bild und Ausschnitt auf die kleinere Auflösung gebracht und je Kachel mit Merkmalen statt Pixeln verglichen, weil die Skizze Beispieldaten zeigt: Tinte im 16er-Raster (25 %), Form der Füllflächen und ihre Ausrichtung, also Säulen gegen Balken (25 %), Tintenmenge (10 %), Kantendichte (10 %), Titelband (15 %, Band = `headH`), Kachelhintergrund (15 %). Mengenunterschiede bis Faktor 2 sind toleriert (12 echte gegen 6 Beispielmonate). Kalibriert an echten Aufnahmen: Treffer 0,96 bis 0,98, falsche Diagrammform 0,52 bis 0,70, leere Kachel 0,21. Zusätzlicher Befund: „andere Diagrammform: Kitchen Säulen, Desktop liegende Balken". Befunde: „Fläche leer: Desktop zeigt in der Kachel kein Diagramm" (Score höchstens 40 %), „Titel fehlt in Desktop", „Desktop zeigt einen Titel, das Kitchen nicht", „deutlich andere Struktur", „Desktop deutlich voller/leerer", „Kachelhintergrund weicht ab". Gemessen an einer Full-HD-Seite mit 8 Kacheln: mit Pillow 0,05 s, ohne Pillow (eigener PNG-Leser, nur Standardbibliothek) 0,9 s; RGBA-Bilder brauchen ohne Pillow etwas länger.
- Der Runner wartet nach den Screenshots bis zu 30 s (`--compare-wait`) auf `tiles.json`, aber nur, wenn `kitchen/<seq>/` schon existiert oder der Client MockupKitchen 0.5.5 oder neuer ist. Verglichen werden alle Seiten mit Desktop-Bild, auch Bilder vom letzten Deploy bei unveränderten Seiten.
- Das Kitchen zeigt im Statusdialog je Seite das Kitchen-Bild (`kitchen/<seq>/…`) neben dem Desktop-Bild (`pages[name].shot`) und darunter die Befunde je Kachel. Fehlt `diff`, steht dort, dass noch kein Bildvergleich gemeldet ist.

## Kachel-Anzeige in der Spec (ab Kitchen 0.5.5)

Messlatte ist das Kitchen-Bild. Die Spec beschreibt deshalb ausdrücklich, was eine Kachel **zeigt**, nicht nur, was im Szenario-Menü steht.

### Eine Regel für Szenario und Δ-Basis (Bindung vor Auswahl)

1. **Referenz gebunden:** gezeigt werden genau die gebundenen Szenarien. Das Kürzel kommt aus dem Feldnamen (PY/VJ, PL/Plan, BU/Budget, FC/Forecast). Ohne Kürzel im Namen gilt das nächste noch freie Kürzel der Szenario-Auswahl, sonst PL. Ein FC-Feld in der Referenzrolle ist der Forecast-Anteil, kein Bezug. Bei der Zielrolle (KPI, Tacho) bleibt FC ein Bezug.
2. **Keine Referenz, aber die Hauptkennzahl gebunden:** kein Bezug, keine Δ-Ebene (`refSource: "none"`), so wie Desktop es zeigt. Ist die Referenz eine Pflichtrolle (`absvar`, `relvar`, `bridge`, `wfint` …), gilt Regel 3.
3. **Sonst Platzhalter** (`refSource: "placeholder"`): die Szenario-Auswahl als Beispiel. Die Kachel trägt dafür einen gestrichelten Chip „PL ?". Der Konverter baut daraus **keinen** Bezug.

- **Forecast-Anteil** wird gezeigt, wenn die Forecast-Rolle gebunden ist, ein FC-Feld in der Referenz liegt oder (nur im Platzhalter) die Auswahl FC enthält.
- **Δ-Basis:** die gewählte, wenn sie gezeigt wird; sonst automatisch **PL > BU > PY** (wie ChartKitchen `comparisonMode: auto`: plan vor py). Eine gewählte, aber nicht gezeigte Basis steht in `deltaBasisRequested`, dazu meldet die Spec `SCENARIO_REF_MISMATCH`.
- Typen ohne Referenz- und Zielrolle (`pareto`, `waterfall`, `stackcol` …) und die nativen Klassiker haben nie eine Δ-Basis.

### Neue und geänderte Felder je Visual (`pages[].visuals[]`)

| Feld | Bedeutung |
|---|---|
| `title` | **geändert:** sichtbarer Kachelkopf, `""` wenn die Kachel keinen Kopf zeigt. Der Kopf erscheint, sobald Titel oder Untertitel gesetzt sind; ohne eigenen Titel steht dann das Katalog-Label dort. Ein Container-Titel gehört nur dann in den Bericht, wenn `title` nicht leer ist. |
| `titleShown` | **neu:** `true`, wenn die Kachel einen Kopf zeigt |
| `displayName` | **neu:** Name für Meldungen, Brief und Auswahlbereich (eigener Titel, sonst Katalog-Label). Früher stand er in `title`. |
| `label` | wie bisher: Katalog-Label des Typs |
| `scenario` | wie bisher: die Szenario-Auswahl im Kitchen (Absicht). Was gezeigt wird, steht in `display.scenarios`. |
| `analysis.deltaBasis` | **geändert:** die **wirksame** Basis (gegen die die Skizze rechnet), `null` ohne gezeigten Bezug. Früher konnte hier PY stehen, während die Skizze ΔPL zeigte. |
| `analysis.deltaBasisAuto` | `true`, wenn die Basis nicht ausdrücklich gewählt ist oder die Wahl nicht gezeigt wird |
| `analysis.deltaBasisSource` | **neu:** `"explicit"`, `"auto"` oder `null` |
| `analysis.deltaBasisRequested` | **neu:** gewählte Basis, die nicht gezeigt wird (sonst `null`) |
| `display.scenarios` | **neu:** gezeigte Szenarien in Zeichenreihenfolge: Hauptreihe, Bezug (= Δ-Basis), weitere Bezüge (Dreieck-Marke), FC. Beispiel `["AC","PL","PY"]` |
| `display.refSource` | **neu:** `"bound"`, `"none"`, `"placeholder"` oder `null` (Typ ohne Bezug) |
| `display.placeholders` | **neu:** vorgesehene, aber nicht gebundene Bezüge (Chips „PL ?") |
| `display.deltaBasis`, `display.deltaBasisSource` | **neu:** wie in `analysis`, hier zusammen mit dem Bild |
| `display.drawn` | **neu:** was die Skizze in dieser Kachelgröße tatsächlich zeichnet (`null`, wenn nicht ermittelbar) |
| `display.drawn.refs` | Bezüge als Fläche oder Linie, z. B. `["PL"]` |
| `display.drawn.marker` | Szenarien als Dreieck-Marke (▶/▼), z. B. `["PY"]` |
| `display.drawn.delta` | gezeigte Δ-Ebenen: `"abs"`, `"rel"` (leer = keine; hängt auch von der Kachelgröße ab) |
| `display.drawn.deltaBasis` | Basis der gezeichneten Δ-Ebenen |
| `display.drawn.labels` | Wertbeschriftung an oder aus (→ CK `labels.show`) |
| `display.drawn.total` | Σ-Summe sichtbar (→ CK `chart.showTotal`) |
| `display.drawn.forecast` | Forecast-Anteil schraffiert oder gestrichelt |
| `display.drawn.unit` | sichtbare Einheit an den Zahlen (z. B. `"M"`, `"Mio."`), sonst `null` |
| `display.drawn.reduced` | reduzierte Skizze (Kachel zu klein für Beschriftung) |
| `display.numbers` | **neu:** `{ displayUnits: "auto" \| "none" \| "K" \| "M", decimals: Zahl oder null, unitText: Text oder null }` |
| `display.fontPx`, `display.fontPt` | **neu:** `{ title, subtitle, label, axis }` in Seiten-px bzw. pt (px × 0,75), Faktoren schon eingerechnet (Typo-Skala × Kachel-Faktor × uiScale). `label` → CK `labels.fontSize` |

Das Schema der Skill-Spec pflegt der Konverter (`.claude/skills/mockup-to-powerbi`); dieser Abschnitt ist die Quelle für die Kitchen-Seite.

## Beta-Ergänzungen (02.10.2026)

Vertragsversion bleibt 1, alles ist abwärtskompatibel. Runner (`agent/live_runner.py` 0.3, Korrekturen in 0.3.1 und 0.3.2, Abschnitte am Ende) und Kitchen setzen genau diese Ergänzungen um. Zuerst die verbindliche Fassung, danach die Präzisierungen des Runners.

### Verbindliche Fassung

- `deploy-request.json`: optional `"scope": "all"|"layout"|"theme"|"model"` (Vorgabe `all`), `"dryRun": true` (Runner antwortet nur mit dem Plan, schreibt nichts, kein Reload), `"prepare": true` (Sitzung vorbereiten: benötigte Kitchen-Visuals installieren und Theme registrieren, mit Desktop-Neustart nach Bestätigung; keine Seiten schreiben), `"restore": {"fromBackup": n}` (Bericht auf den Stand nach Deploy n bringen, läuft als neuer Deploy), `"sessionId": "<ID aus desktop-session.json oder vom Kitchen erzeugt>"`.
- `deploy-confirm.json` (Kitchen → Runner): `{"seq": n, "action": "restart"|"saveFirst"|"discard"|"skipRestart"|"cancel", "at": iso}`. `deploy-cancel.json`: `{"seq": n, "at": iso}` zieht eine noch nicht gestartete Anfrage zurück.
- `agent-status.json` zusätzlich: `runner.sessionId`, `runner.projectPath` (absolut), `runner.current` (Schritt-ID), `runner.state` `idle|running|awaiting|stopped`; `steps[].ms` (Dauer) und `steps[].startedAt`; `"awaiting": {"kind": "restart"|"unsaved"|"approval", "reason": "<Deutsch>", "unsavedByUs": bool, "pid": n, "since": iso, "options": ["restart","saveFirst","discard","skipRestart","cancel"]}`, solange der Runner auf `deploy-confirm.json` wartet (state bleibt running/awaiting, Herzschlag läuft weiter); `"plan"` (bei dryRun und auch vor dem Schreiben echter Deploys gefüllt): `{"restart": bool, "restartReason": str, "modelOps": [{id, kind, summary, needsApproval, approved}], "pages": {name: {"new": n, "changed": n, "moved": n, "removed": n}}, "estMs": n, "visualsToInstall": [Namen]}`; `pages[name].shotPage` = Pfad des ZUGESCHNITTENEN Seitenbilds in PBIR-Seitengröße (der Runner schreibt `shots/<seq>/<Seite>.page.png` neben das Rohbild) und `pages[name].compare.canvas`; `"history"`: die letzten 20 Deploys `[{seq, at, state, ms, counts: {applied, warn, error}, kitchenPng, shotPage}]`, damit das Kitchen nach einem Neuladen eine Zeitleiste zeigen kann.
- `desktop-session.json` (vom Launcher oder vom Runner beim Start geschrieben): `{"sessionId", "projectPath", "pid", "exe", "startedAt", "runnerPid"}`.
- `model-approvals.json` neue Form: `{"approvals": [{"id", "hash", "by", "at", "overrides": {"dax": ...}?}]}`; der Runner wendet eine Op nur an, wenn `hash` dem aktuellen Inhalts-Hash der Op mit der Korrektur aus `overrides` entspricht (sha256 über kind + target + after/expression, Regel unten). Die alte Form `{ids, overrides}` liest er noch, behandelt sie seit Runner 0.3.1 aber als veraltet (erneut freigeben).
- Der Runner beendet Desktop NIE ohne passende `deploy-confirm.json` mit `restart` oder `discard` für diese seq (Ausnahme: Option `--auto-restart` für unbeaufsichtigte Tests). Er merkt sich über `.state/desktop-reload.json` `{pid, at, seq, digest}`, ob die Markierung „ungespeichert" von seinem eigenen Reload stammt (`unsavedByUs`), und meldet das in `awaiting`.

### Präzisierungen des Runners

**Ergebnis-Zustände.** Zu `applied`, `blocked`, `failed` kommen `planned` (Antwort auf `dryRun`) und `cancelled` (Antwort `cancel`, `deploy-cancel.json`, Stopp des Helfers). Exit-Code von `live_runner.py once`: 0 angewendet oder Vorschau, 2 blockiert, 1 fehlgeschlagen, 3 abgebrochen. Vorschau und Abbruch ohne Schreiben behalten `pages`, `visuals` und `todos` des letzten Deploys im Status und nennen ihn unter `previous` `{seq, state, message, finishedAt}`. Gesamtdauer eines Laufs: `ms` auf oberster Ebene.

**Rückfragen (`awaiting`).** Felder: `kind`, `reason`, `seq`, `unsavedByUs`, `unsavedByUsCertain`, `hasUnsavedChanges`, `pid`, `since`, `timeoutS`, `options`, `countdown`, dazu `restartReason` bei Neustart und `waitingForSave: true`, während der Runner nach `saveFirst` auf das Speichern wartet (dieselbe Rückfrage, `since` bleibt). Ab Runner 0.3.2 (Demo B7) bei Neustart zusätzlich `updates: [{name, from, to}]` für schon installierte, ältere Kitchen-Visuals und `updateOnly: true`, wenn der Neustart nur für diese Updates nötig ist; das Kitchen beschriftet `skipRestart` dann mit „Vorhandene Version behalten".

- `countdown: true` nur bei Fall A ohne Ungespeichertes (Safety-Review 2): nur dann darf das Kitchen nach 10 s selbst `restart` schreiben. Sonst wartet der Dialog auf einen Klick.
- `unsavedByUsCertain` ist immer `false`: Änderungen, die nach dem eigenen Reload in Desktop gemacht, aber nicht gespeichert wurden, sieht der Runner nicht (der Fingerabdruck ändert sich erst beim Speichern). Deshalb gilt jede Markierung „ungespeichert" bei einem Neustart als Fall B; `unsavedByUs: true` sagt nur, dass sie vom eigenen Reload stammen kann, und der Text nennt das ehrlich („Ungespeichert ist, was Deploy n geladen hat, und alles, was du seitdem in Desktop geändert hast.").

Angeboten wird je Lage (`options` in dieser Reihenfolge):

| Lage | `kind` | `options` | `countdown` |
|---|---|---|---|
| Neustart nötig, Desktop ohne Ungespeichertes (Fall A) | `restart` | `restart`, `skipRestart`, `cancel` | `true` |
| Neustart nötig, Ungespeichertes vom eigenen Reload oder nicht sicher zuzuordnen (Fall B, `unsavedByUs: true`) | `restart` | `saveFirst`, `skipRestart`, `discard`, `cancel` | `false` |
| Neustart nötig, echte Arbeit in Desktop (Fall B, `unsavedByUs: false`) | `restart` | `saveFirst`, `skipRestart`, `discard`, `cancel` | `false` |
| Sitzung vorbereiten (`prepare`) | `restart` | wie oben, ohne `skipRestart` | wie oben |
| kein Neustart, aber der Reload würde echte Arbeit verwerfen (`unsavedByUs: false`) | `unsaved` | `saveFirst`, `discard`, `skipRestart`, `cancel` | `false` |
| kein Neustart, Ungespeichertes nur vom eigenen Reload | keine Rückfrage: der Reload-Deploy ist führend (wie bisher dokumentiert). Grenze: was nach dem letzten Reload in Desktop geändert und nicht gespeichert wurde, verwirft dieser Reload (siehe `unsavedByUsCertain`). Weder pbir 0.9.32 noch Bridge-CLI 0.1.1 können Desktop speichern lassen; das Kitchen warnt deshalb vorher mit einer Bandzeile, solange `desktopLive.unsavedByUs` gilt | | |
| nach `saveFirst` | wie vorher, `waitingForSave: true` | `discard`, `cancel` (Neustart: auch `skipRestart`) | `false` |

Bedeutung der Antworten (`deploy-confirm.json` `{seq, action, at}`):

| `action` | bei `kind: "restart"` | bei `kind: "unsaved"` |
|---|---|---|
| `restart` | nur die gefragte Desktop-Instanz (`awaiting.pid`) schließen, installieren, neu öffnen | nicht angeboten |
| `saveFirst` | warten, bis Desktop „gespeichert" meldet (alle 3 s), dann ohne weitere Frage neu starten | warten, bis gespeichert, dann schreiben und neu laden |
| `discard` | schließen, Ungespeichertes geht verloren, installieren, neu öffnen | schreiben und neu laden, Ungespeichertes geht verloren |
| `skipRestart` | ohne Neustart weiter (fehlende Visuals bleiben Ersatz bzw. To-do; schon installierte, ältere Kitchen-Visuals bleiben in ihrer Version und gelten als nutzbar, `desktop.visualsKept`), Ungespeichertes wird danach noch geprüft | schreiben, Desktop nicht neu laden (To-do: Speichern in Desktop überschreibt den Deploy) |
| `cancel` | Ende ohne Schreiben (`cancelled`) | Ende ohne Schreiben (`cancelled`) |

- `restart`: nur diese Desktop-Instanz schließen, installieren, neu öffnen. Direkt vor dem Schließen liest der Runner den Status noch einmal, gebunden an die bestätigte pid (Safety-Review 3): hat sie inzwischen ungespeicherte Änderungen, ist eine andere pid mit dem Projekt da oder sind es mehrere Fenster, blockiert er und schließt nichts. Ist die Instanz inzwischen zu, installiert er und öffnet danach.
- `discard`: wie `restart` bzw. Reload, Ungespeichertes geht verloren.
- `saveFirst`: der Runner liest Desktop alle 3 s und macht weiter, sobald `hasUnsavedChanges` false ist; beim Neustart folgt dann der Neustart ohne weitere Frage.
- `skipRestart`: beim Neustart ohne Neustart weiter (fehlende Visuals bleiben Ersatz bzw. To-do, danach wird Ungespeichertes noch geprüft); bei `kind: "unsaved"` Bericht schreiben, Desktop aber nicht neu laden (To-do: Speichern in Desktop überschreibt den Deploy).
- `cancel`: Ende ohne Schreiben (`cancelled`).
- Speichert der Nutzer in Desktop, ohne zu antworten, erkennt der Runner das: `unsaved` läuft dann von selbst weiter, Fall B wird zu Fall A. Schließt er das Projekt, gilt Desktop als zu (Installation ohne Schließen, danach öffnen).
- Während der Rückfrage liest der Runner nur die gefragte Instanz (`awaiting.pid`, sonst die festgenagelte). Taucht ein zweites Fenster mit dem Projekt auf oder hat plötzlich eine andere pid das Projekt offen, endet der Deploy `blocked`, nichts geschrieben, keine Antwort zählt (Safety-Review 3). Nach einer Rückfrage prüft er vor dem Schreiben und bei jedem Deploy vor dem Neuladen noch einmal auf mehrere Fenster (Bridge-Liste und Kommandozeilen). Ein zweites Fenster erst vor dem Neuladen: Bericht aus `backup/<seq>` zurück, `.state` (Vergleichsbasis, `created.json`, `page-map.json`) wie vor dem Deploy, kein Reload, `blocked` mit „Der Bericht ist zurückgesetzt, nichts geändert". Seit Runner 0.3.2 gilt das auch für „Sitzung vorbereiten" (nach der Rückfrage) und „Zurück zu Deploy n" (nach der Rückfrage und vor dem Neuladen, Rücknahme wie beim Deploy), siehe „Folgerunde Runner 0.3.2".
- Jede Antwort zählt einmal (Schlüssel `seq`, `action`, `at`); Aktionen außerhalb von `options` und andere `seq` werden ignoriert. Seit Runner 0.3.2 zählt eine Antwort nur, wenn `at` nicht älter als `awaiting.since` ist (2 s Toleranz); ohne `at` zählt sie nicht. Zeitlimit `--confirm-timeout` (Vorgabe 600 s), danach `blocked` („Neustart nicht bestätigt …", nichts geschrieben).
- `unsavedByUs`: `.state/desktop-reload.json` = `{pid, at, seq, digest}` nach jedem erfolgreichen Reload; `digest` ist ein Fingerabdruck (Pfad, Größe, Änderungszeit) von `definition/` in Bericht und Modell. Hat Desktop seitdem gespeichert (Fingerabdruck anders) oder „gespeichert" gemeldet, stammt eine neue Markierung vom Nutzer. Frisch geöffnetes Desktop löscht die Markierung.
- `kind: "approval"` ist reserviert: Modell-Ops ohne Freigabe warten nicht, sie bleiben To-dos mit `hash` (der Deploy läuft für den Bericht).

**Vorschau (`plan`).** Felder zusätzlich zur verbindlichen Fassung: `scope`; `pages[name].page` (`new`|`update`), `.background`, `.chrome` (Rahmenelemente); `removedPages`; `theme` (Theme-Farben/-Schriften ändern sich), `themeRegister`; `reload`; `nothing` (seit dem letzten Deploy nichts zu tun, Kitchen: „Nur neu messen"); `desktop` `{open, pid, hasUnsavedChanges, unsavedByUs}`; `at`; je `modelOps[]` zusätzlich `target`, `hash` (diesen Wert in `model-approvals.json` übernehmen), `stale` (Freigabe passt nicht mehr), `executable`, `blockedReason`, `willRun`. Bei `dryRun` außerdem `dryRun: true`, `blockers` (was den Deploy blockieren würde, z. B. zwei Desktop-Fenster, `unappliedChanges.json`, specHash) und `todos`. Die Vorschau baut nach `.state/preview-out/`, `out/` des letzten Deploys bleibt. `estMs`: Median der letzten Deploys ohne bzw. mit Neustart, sonst 8 s + 3 s je Seite, Neustart 45 s dazu. `moved` = nur Lage oder Größe geändert; `removed` = Kacheln, die im Bericht stehen, im Mockup aber fehlen (der Runner löscht nie).

**`scope`.** `layout`: Seiten und Kacheln (Kitchen-Visuals bei Bedarf), kein Theme, kein Modell. `theme`: nur Theme-Datei und Seitenhintergründe bestehender Seiten (Theme-Registrierung mit Neustart möglich). `model`: nur Modell-Ops über `te`, Reload mit Modell. Nach einem Teilziel gibt es keinen Schnellweg „nichts geändert".

**`prepare`.** Optional `"visuals": ["chartkitchen", "kpicard", …]` (Namen aus `visuals_install.catalog()`); Vorgabe ChartKitchen und KPI-Karte plus alles, was die aktuelle Spec braucht. Ist schon alles da: `applied` mit „Sitzung bereit … kein Neustart nötig". Sonst Rückfrage `restart`, Sicherung `backup/<seq>`, Installation, Theme `MockupKitchen` registrieren und Farben aus dem Theme-Fragment setzen, `pbir validate --fields` (neue Befunde: Sicherung zurück, `failed`), Desktop öffnen. Verlaufseintrag mit `prepare: true`.

**`restore`.** Quelle ist die Sicherung des nächsten Deploys nach n, der geschrieben hat (`backup/<m>/`, Stand vor m = Stand nach n). Zurückgespielt wird nur `definition/pages/`; `report.json`, Kitchen-Visuals und Theme bleiben. Vorher kommt der aktuelle Stand nach `backup/<seq>`, Seiten aus späteren Deploys liegen dort. Danach `pbir validate --fields` (neue Befunde: zurück, `failed`), Vergleichsbasis = Spec-Stand von n, Reload, Bilder, Vergleich gegen `kitchen/<n>/`. Im Status `restored: {fromBackup, source, spec}`: **Das Kitchen lädt `mockup/<spec>` (= `.state/specs/<n>.json`) als aktuelle Skizze**, sonst bringt der nächste Deploy die späteren Änderungen zurück. Fehlt die Sicherung (nur die letzten `--keep-backups`, Vorgabe 10) oder war Deploy n nicht erfolgreich: `blocked`. Verlaufseintrag mit `restoredFrom: n`.

**Verlauf (`history`).** Je Eintrag zusätzlich `scope`, `restart` (Desktop neu gestartet bzw. geöffnet), `backup` (Sicherung `backup/<seq>` geschrieben), `message`, bei Bedarf `prepare`, `restoredFrom`. Gespeichert in `.state/history.json`, Vorschauen kommen nicht hinein, Abbrüche schon.

**Bilder.** `shotPage` schneidet `tile_compare.crop_page` aus dem Rohbild (Seitenfläche wie beim Vergleich gefunden, auf Breite × Höhe der PBIR-Seite gebracht): mit Pillow in Farbe, unten abgeschnittene Seiten mit durchsichtigem Rest und `pages[name].shotClipped` = sichtbarer Anteil; ohne Pillow Graustufen. Wird die Seite nicht gefunden, fehlt `shotPage`, der Schritt `shots` nennt es. `compare.canvas` steht nur, wenn die Seite aus einer Fensteraufnahme ausgeschnitten wurde.

**Modell-Freigaben, Hash (Regel für Kitchen und Agent).** `hash` = sha256 (hex, UTF-8) über `kind + "\n" + target + "\n" + inhalt` (`model_ops.op_hash`):
- `kind` = Art der Op (`addMeasure`, `changeDax`, `setFormat`, `rename` …), im To-do als `opKind`, außerdem der Teil vor dem Doppelpunkt der Op-ID.
- `target` = te-Pfad der Op (im To-do `target`, z. B. `_Measures/Marge %`). Der Runner nimmt auch die Referenz aus der Op-ID (`_Measures.Marge %`, im To-do `opRef`), so rechnet das Kitchen 0.6 (`targetOf(id)`); beide bezeichnen dieselbe Op.
- `inhalt` = `after` als kanonisches JSON (Schlüssel sortiert, Trenner `,` und `:` ohne Leerzeichen, Unicode unverändert, wie `json.dumps(sort_keys=True, ensure_ascii=False, separators=(",", ":"))` bzw. `canonJson` im Kitchen); bei Umbenennungen `newRef`; sonst leer.
- Für `changeDax` ist `after` = `{"expression": DAX}`, der Hash also sha256 über `"changeDax\n" + target + "\n" + {"expression":DAX}`. Für `addMeasure` gehört `formatString` dazu (`{"expression": DAX, "formatString": …}`); das Kitchen nimmt deshalb `after` aus dem To-do und ersetzt nur `expression`.
- **Mit Korrektur** (`overrides` in der Freigabe, Safety-Review 5): der Hash gilt für die Op so, wie sie mit der Korrektur läuft: `after.expression` = `overrides.dax` (addMeasure, changeDax), `formatString`/`description`/`displayFolder` aus `overrides`, bei `rename` `newRef` = Tabelle + `overrides.alias` (`model_ops.approval_hashes`). Eine Korrektur, deren Hash noch über den Vorschlag ohne Korrektur gerechnet ist, gilt als veraltet.

Beispiele (nachgerechnet mit `model_ops.op_hash`; `\n` ist ein Zeilenumbruch, der Inhalt steht genau so im Hash):

| Form | Text, über den sha256 läuft | Hash |
|---|---|---|
| addMeasure, Ziel als te-Pfad (Runner, To-do `target`) | `addMeasure\n_Measures/Marge %\n{"expression":"DIVIDE([Marge], [Umsatz])","formatString":"0.0 %"}` | `40f6d7929c14cb8938ab0cd695bde3adaf4b68aa24a32c34162e63a8ffc30680` |
| dieselbe Op, Ziel als Op-Referenz (Kitchen 0.6, To-do `opRef`, aus der ID `addMeasure:_Measures.Marge %`) | `addMeasure\n_Measures.Marge %\n{"expression":"DIVIDE([Marge], [Umsatz])","formatString":"0.0 %"}` | `ee1e3dbb50a183552f5add91a850505f8f05f8da2196f98caaf5c1ed546a9b8e` |
| dieselbe Op mit Korrektur `overrides.dax = "DIVIDE([Marge], [Umsatz], 0)"` (te-Pfad) | `addMeasure\n_Measures/Marge %\n{"expression":"DIVIDE([Marge], [Umsatz], 0)","formatString":"0.0 %"}` | `bcf1c8f4998d4265cbe66f07eb530199cde4fa32f89c60b661883da3e9a48da6` |
| changeDax (te-Pfad), `after` nur mit `expression` | `changeDax\n_Measures/AC\n{"expression":"SUM(FactActuals[Amount])"}` | `8b7881a571cb52e6a04abd57574c58e464818b7a6d9f59963326326f791ce46f` |
| rename (te-Pfad), Inhalt ist `newRef` als **Rohtext**, kein JSON, ohne Anführungszeichen | `rename\n_Measures/PY\n_Measures.Vorjahr` | `96ef373dfcfdac5c5657b17460185794b08bc31c591c824b9bcc3ad480761825` |

Der Runner nimmt beide Zielformen an (erste und zweite Zeile bezeichnen dieselbe Op). Häufige Fehler: Leerzeichen nach `,` oder `:` im JSON, unsortierte Schlüssel, `\u`-Escapes statt Umlauten, `formatString` bei addMeasure vergessen, bei rename `"_Measures.Vorjahr"` mit Anführungszeichen.

Der Runner liefert den Hash in `plan.modelOps[].hash` und in den `model`-To-dos, dazu `opKind`, `target`, `opRef`, `after` (bzw. `newRef`); bei veralteter Freigabe `staleApproval: true` und den Grund im Text. **Die alte Form `{ids, overrides}` ohne Hash gilt seit Runner 0.3.1 als veraltet** (`staleApproval`, „erneut freigeben"), weil sie DAX nicht bindet. Fehlgeschlagene oder von `te validate` zurückgenommene Ops tragen `retry: true` (auch in späteren Deploys, dann mit `failedSeq`), bis eine neue Freigabe kommt: eine Freigabe mit neuem `at` gilt als neue Freigabe, auch bei gleichem Hash. `.state/model-applied.json` merkt je Op `hash`, `by`, `approvedAt`, `status`.

**Sitzung und Instanz.** Weicht `deploy-request.sessionId` von der Sitzung des Runners ab, steht im Status `sessionMismatch: {request, runner}` (kein Abbruch, das Kitchen warnt). Mehrere Desktop-Fenster mit diesem Projekt (Bridge-Liste oder Kommandozeile mit der `.pbip`) → `blocked`. Mit `--pin-pid` (Start aus Desktop) spricht der Runner nur diese Instanz an. Nach einem Neustart durch den Runner zieht die Festnagelung auf die neue pid um, `desktop-session.json` wird ergänzt (`pid`, `repinnedFrom`, `repinnedAt`). Safety-Review 6: Ist die festgenagelte Desktop-Instanz beendet (kein Power BI Desktop unter dieser pid, nicht in der Bridge-Liste) und hat genau eine Instanz das Projekt offen, zieht die Festnagelung ebenfalls um (`desktop.repinned: {from, to}`, Meldung im Schritt `bridge`). Läuft die festgenagelte Instanz noch (anderes Projekt) und eine andere hat das Projekt → `blocked` mit „Externe Tools → MockupKitchen live (ersetzt den Helfer), oder mk-live stop und mk-live start". Meldet Desktop bzw. die Pipe „busy", wiederholt der Runner denselben Aufruf bis zu dreimal (1, 2, 4 s, `--busy-backoff`) ohne Wechsel auf die Bridge-CLI; die Zahl steht in `desktop.busyRetries`.

**Leerlauf.** Alle `--idle-poll` Sekunden (Vorgabe 30, 0 = aus) liest der Runner den Desktop-Status und schreibt `desktopLive: {at, ok, connected, pid, file, hasUnsavedChanges, unsavedByUs, reloadSeq?, instances, otherInstances, duplicates?}`; meldet Desktop „gespeichert", löscht er die Reload-Markierung. `reloadSeq` (Folgerunde 2, 03.10.2026) steht nur bei `unsavedByUs: true`: die `seq` aus `.state/desktop-reload.json`, also der Deploy, dessen Reload die Markierung „ungespeichert" gesetzt hat. Das Kitchen zeigt damit die Bandzeile „Ungespeichertes in Desktop seit Deploy n wird beim nächsten Deploy verworfen" (siehe Tabelle „Rückfragen", Zeile „kein Neustart, Ungespeichertes nur vom eigenen Reload").

**Ablage in `mockup/`.** `.gitignore` = `*` plus `!.gitignore`, `!mockup-spec.json`, `!AGENT-BRIEF.md`, `!model-approvals.json`, `!README.md` (eigene Zeilen einer vorhandenen Datei bleiben unten erhalten, die Form bis Runner 0.2 wird ersetzt). `README.md` erklärt den Ordner. Neu in `.state/`: `desktop-reload.json`, `history.json`, `specs/<seq>.json` und `specs/<seq>.applied.json` (siehe unten, die letzten max(20, `--keep-backups`)), `runner.log` (rotierend, 3 × 1 MB), `runner.console.log` (Ausgabe des losgelösten Runners), `stop-request.json` (`mk-live stop`), `preview-out/`, `diag/` (Diagnose-ZIPs), `failures.json` (Dauerfehler je Kachel), `canvas.json` (Seitenfläche im Desktop-Bild je Desktop-Sitzung). Daneben `mockup/doctor.json` und `mockup/desktop-session.json` (zusätzlich `spawn`: `{outerFlags, innerFlags, breakaway, note, at, packaged}`, wie `mk-live start` den Runner gestartet hat; `packaged` = voller Paketname, wenn der Start im MSIX-Paketkontext lief, etwa aus dem Store-Desktop über Externe Tools, sonst `null`).

**Spec je Deploy, für „Zurück zu Deploy n".** Jeder Deploy außer der Vorschau schreibt `.state/specs/<seq>.json`, sobald er die Spec gelesen hat: genau die Fassung, die er deployt (nicht eine spätere Kopie von `mockup-spec.json`, die das Kitchen laufend weiterschreibt), auch wenn er danach blockiert oder scheitert. „Sitzung vorbereiten" schreibt keine Seiten; es legt deshalb die Vergleichsbasis (Stand des Berichts danach) als `specs/<seq>.json` ab, ersatzweise die gelesene Spec, und nach Erfolg `specs/<seq>.applied.json` (Runner 0.3.2). Nur ein erfolgreicher Deploy schreibt zusätzlich `specs/<seq>.applied.json` (die Vergleichsbasis danach). Der Verlauf nennt die Datei (`history[].spec`). Nach `restore` lädt das Kitchen `mockup/` + `restored.spec` (= `.state/specs/<n>.json`) als aktuelle Skizze.

**`doctor.json`** (`mk-live doctor`, auch bei `start` und `diag`): `{contract, tool, at, project, projectPath, overall: "green"|"yellow"|"red", checks: [{id, label, state: "green"|"yellow"|"red"|"info", detail, fix?, blocking?, …}], versions: {python, pbir, powerbi-desktop-bridge-cli, te, teExpires, desktopExe, runner, mkLive, os}, pinned: {pbir: "0.9.32", powerbi-desktop-bridge-cli: "0.1.1"}, desktop: {instances, processes, pipes, pid?, backend}}`. Gepinnt und als getestet geführt ist nur, was tatsächlich lief (Bridge-CLI: `powerbi-desktop --version` = 0.1.1 am 02.10.2026). Prüfungen (`id`): `python`, `packages`, `pbir`, `bridgeCli`, `te` (Ablaufdatum aus `te --version`, `expires`), `project`, `compat`, `compatNew` (Info: neuer als getestet, z. B. 1702), `schemas` (Info: `visualContainer`-Schemas im Bericht neuer als die von pbir 0.9.32 mitgebrachten bis 2.9.0, pbir prüft sie über ein Rückfall-Schema, Demo B8), `unapplied`, `gitignore`, `bridge` (je Desktop-Fenster ohne Pipe `\\.\pipe\pbi-desktop-bridge-<pid>` bzw. ohne Antwort), `desktop` (Projekt offen, Duplikate rot), `desktopExe`, `pbipReload` (Info, siehe unten), `visuals`, `theme`, `helper` (Herzschlag jünger als 15 s), `spawn` (gelb, wenn der laufende Helfer laut `desktop-session.json` ohne `CREATE_BREAKAWAY_FROM_JOB` gestartet wurde: ein bestätigter Desktop-Neustart kann ihn mitbeenden; nur bei laufendem Helfer), `package` (Info, wenn `spawn.packaged` gesetzt ist: im Paketkontext kann Windows neue Dateien unter `%LOCALAPPDATA%\MockupKitchen` in den Paketordner umleiten; am Store-Desktop noch ungeprüft), `policy` (Richtlinien, nur Info; ohne Richtlinien eine Zeile „keine Power-BI-Desktop-Richtlinien gefunden", ab mk-live 0.1.2). Jede gelbe und rote Zeile hat einen Satz in `fix`. `blocking: true` verhindert `mk-live start` (ohne `--force`).

**Desktop-Vorschau „Detect and reload external PBIP changes": nicht prüfbar.** Desktop speichert Vorschaufunktionen in `User.zip` (`FeatureSwitches/FeatureSwitches.xml`) nur als Kennungen (GUID) ohne Namen; welche davon diese Vorschau ist, ist nicht dokumentiert. Der doctor liest die Datei nicht (sie liegt neben gespeicherten Anmeldedaten) und meldet nur eine Info-Zeile. Ob Desktop bei eingeschalteter Vorschau nach einem Deploy zusätzlich selbst neu lädt, ist an keiner Desktop-Version geprüft.

**Live-Helfer `mk-live`** (`agent/mk_live.py`, Wrapper `bin/mk-live.cmd`, aus dem Repo auch `python mockup-live/mk_live.py`): `setup`, `doctor <Projekt>`, `start <Projekt> [--open-kitchen URL] [--pin-pid PID] [--no-browser] [--replace-timeout S] [-- Runner-Optionen]`, `stop [<Projekt>] [--force]`, `diag <Projekt> [--with-images]`, `register-tool`. `start` startet keinen zweiten Runner, solange ein Herzschlag für den Ordner jünger als 15 s ist; Ausnahme (Safety-Review 6): `start --pin-pid P` mit einem laufenden Runner, der auf eine andere pid festgenagelt ist, beendet ihn über `stop-request.json` (wartet bis `--replace-timeout`, Vorgabe 60 s, nie hart) und startet neu. `diag` packt Status, doctor, Sitzung, Verlauf, Protokolle und `failures.json` ein, Benutzernamen in Pfaden auf `C:\Users\<du>` gekürzt, seit mk-live 0.1.2 zusätzlich der Projektordner samt übergeordneten Ordnern (etwa Kundenordner) als `<Projekt>` (auch in JSON-, Schrägstrich- und 8.3-Form) und der Benutzername als Teil anderer Ordnernamen (`c--Users-<Name>-…`, 8.3-Kurzname) als `<du>`; der Name des Berichts bleibt; Bilder (`shots/`, `kitchen/`) und Konverter-Ausgabe (`out/`) nur mit `--with-images` (Safety-Review 8/4). der Runner läuft über einen kurzlebigen Zwischenprozess losgelöst vom Prozessbaum (DETACHED_PROCESS, CREATE_NEW_PROCESS_GROUP, CREATE_BREAKAWAY_FROM_JOB), damit `taskkill /T` auf Desktop ihn nicht mitnimmt. Kitchen-URL: `--open-kitchen`, `MK_KITCHEN_URL`, `kitchenUrl` in `config.json`, sonst `https://datenwgknowledgekitchen.com/mockup-kitchen.html`; angehängt wird `?live=1&project=<Name>`. `stop` schreibt `.state/stop-request.json`, der Runner beendet sich nach dem laufenden Schritt bzw. bricht eine Rückfrage ab (`cancelled`). Eigene Dateien unter `%LOCALAPPDATA%\MockupKitchen\`: `config.json` (Python, Desktop-exe samt Quelle, Versionen, Kitchen-URL), `sessions.json` (gestartete Runner), `launch.log` (External Tools), Ersatzablage `MockupKitchen.pbitool.json`. `register-tool` schreibt `C:\Program Files (x86)\Common Files\Microsoft Shared\Power BI Desktop\External Tools\MockupKitchen.pbitool.json` (`pythonw.exe` + `agent/mk_launch.pyw --server "%server%" --database "%database%"`); ohne Administratorrechte legt es die Datei im eigenen Ordner ab und nennt den Kopierbefehl. `mk_launch.pyw` ermittelt die Desktop-pid über die Elternprozesse (Gegenprobe: `msmdsrv.exe` auf dem Port aus `%server%`), die Datei über `pbir desktop list --json --pid`, verlangt eine `.pbip` mit PBIR und ruft `mk-live start --pin-pid`.

**Runner-Optionen (neu).** `--auto-restart`, `--confirm-timeout S` (`MK_CONFIRM_TIMEOUT`), `--pin-pid PID`, `--session-id ID`, `--idle-poll S` (`MK_IDLE_POLL`), `--busy-backoff S`, `--shot-budget S` (`MK_SHOT_BUDGET`, siehe unten), `--keep-visual-versions` (Runner 0.3.2, Demo B7). `--shot-wait` hat jetzt die Vorgabe 8 s. `--respect-unsaved` blockiert weiterhin sofort bei jeder ungespeicherten Änderung.

## Korrekturrunde Runner 0.3.1 (Demo-Befunde 02.10.2026, Safety-Review Runde 1)

**Custom Visuals nie über `pbir batch` (Demo B1).** pbir 0.9.32 kennt nur native Visualtypen (`pbir schema types`). `pbir batch set` auf einem Custom Visual endet mit `status: "error"`, `result: {}` und der Meldung nur in `failures[].message` („Unknown component: title"); Lage-Fehler („Visual exceeds page height …") ebenso. Der Runner schickt deshalb nur Schritte für native Visuals, Shapes und Slicer an `pbir batch`. Für Visuals mit anderem Typ (jede GUID, die Kitchen-Visuals aus `visuals_install.catalog()`, jeder Typ, den `pbir schema types` nicht nennt) schreibt er `move`/`resize` (`position.x/y/width/height`, `z` und `tabOrder` bleiben) und `set` auf Container-Objekte (`title`, `subTitle`, `background`, `border`, `dropShadow`, `padding`, `divider`, `spacing`, `visualHeader` …, Werte in der Form, die pbir schreibt: Farben als `{"solid": {"color": Literal}}`) direkt in `visual.json`; die Seitengrenzen prüft er wie pbir. Andere Formatkarten gehören zum nativen Typ und werden bei Custom Visuals nur protokolliert. Neu angelegte Custom Visuals (KPI-Karte, Gantt, GuV) bekommen keine Formatschritte aus `chrome-batch.json`; ihre `visual.json` aus dem Konverter bringt Titel und Container-Stil mit. Scheitert ein Batch, steht die Rohausgabe (stdout, stderr) in `.state/runner.log` und pbirs echte Meldung in `visuals[id].msg` (nie „{}"). Status: `pbirCalls` (pbir-Aufrufe dieses Deploys, nicht mehr über alle Deploys gezählt), `directWrites` (seit Runner 0.3.2 immer, `0` ohne Direktschreiben), je Verlaufseintrag `pbirCalls`.

**Dauerfehler nicht in jedem Deploy wiederholen.** `.state/failures.json` merkt je Kachel mit Fehler `{sig, msg, seq, since, count, permanent}`; `sig` ist der Fingerabdruck der Kachel samt Typ des Ziel-Visuals. Ist der Fehler dauerhaft (Unknown component, unbekannter Typ, Name durch ein fremdes Visual belegt, Seite überschritten) und zweimal hintereinander bei unveränderter Kachel aufgetreten, versucht der Runner ihn nicht mehr: `visuals[id] = {state: "error", msg: "Nicht erneut versucht: seit Deploy n unverändert fehlgeschlagen (…)"}`, kein pbir-Aufruf. Ändert sich die Kachel im Kitchen oder das Visual im Bericht, gilt wieder der normale Weg.

**Typwechsel eigener Visuals (Demo B9).** Hat der Runner das Visual einer Kachel selbst angelegt (`.state/created.json`, ersatzweise der letzte Stand) und verlangt die Kachel jetzt einen anderen Typ (KPI-Karte → `card`, `card` → Säulen, ChartKitchen → nativ, nativ → Custom Visual), entfernt er es (`pbir rm`; verweigert pbir das, löscht er den eigenen Visual-Ordner direkt, nur ohne Kinder einer Gruppe) und legt es unter demselben Namen neu an: `visuals[id].msg` „Typ gewechselt (A → B), eigenes Visual ersetzt", `created.json` mit neuem Typ. Fremde Visuals bleiben: To-do „Visualtyp geändert … nicht vom Live-Helfer", bei fremden Custom Visuals nur noch Lage und Größe.

**Neue Visuals im selben Deploy nachziehen (Demo B4).** Nach `add visual --from-json` prüft der Runner, ob jedes neue Element im Bericht steht. Fehlt eines (pbir meldet Erfolg, legt es aber nicht an, oder Teil-Ablehnung), legt er es im selben Deploy einzeln noch einmal an (`msg`: „im zweiten Versuch angelegt (erster Versuch: …)"); klappt das nicht, ist es ein Fehler mit pbirs Ausgabe (`msg`: „nicht angelegt, auch nicht im zweiten Versuch: …"), Rohausgabe im Protokoll. Jede Kachel mit `skipped`, `error` oder `warn` trägt einen Grund in `msg`; `message` nennt bei übersprungenen Kacheln die Gründe.

**Bilder (Demo B5).** Aufgenommen werden die Seiten, die dieser Deploy geschrieben hat, dazu Seiten ganz ohne Desktop-Bild, solange `--shot-budget` (Vorgabe 30 s je Deploy, 0 = keine) reicht; der Rest kommt im nächsten Deploy dran („… ohne Bild auf den nächsten Deploy verschoben"). Je Seite wartet der Runner höchstens `--shot-wait` (Vorgabe 8 s) aufs Zeichnen. Gesamtdauer: `shotsMs` im Status (seit Runner 0.3.2 immer, `0` ohne Bilder, etwa mit `--no-bridge`), „Bilder: n Seite(n) in x s" im Protokoll.

**Seitenfläche im Desktop-Bild, Rückfall (Demo B5).** Jede sichere Erkennung (`how: "erkannt"`, reiner Ring) merkt sich der Runner in `.state/canvas.json` je Desktop-Instanz (pid), Bildgröße und Seitengröße. Unter mehreren Kandidaten gewinnt der mit der gemerkten Größe. Findet die Erkennung nichts oder nur einen unsicheren Kandidaten anderer Größe, nimmt der Runner das gemerkte Rechteck derselben Sitzung (`how: "gemerkt"`, `reliable: false`): `pages[name].compare.reliable: false` und `.canvasHow`, `pages[name].shotPageReliable: false`, je Kachel `diff.reliable: false` und der Befund „Seitenfläche nicht sicher erkannt, Rechteck aus einer früheren Aufnahme übernommen: Ergebnis unsicher"; der Schritt `compare` ist dann `warn`. Ein neues Desktop (andere pid) beginnt ohne gemerkte Fläche.

## Folgerunde Runner 0.3.2 und mk-live 0.1.2 (Verifikation am 23-Seiten-Bericht, Safety-Review Runde 2, 03.10.2026)

**Gestaltung aus dem Bericht: gewählte Regel (B2).** Im Live-Betrieb entscheidet der Runner über den Vergleich mit der Grundlinie: `design` der Spec gegen `baseline-spec.json` bzw. den letzten Deploy (siehe „Abgleich mit dem Bericht"). Das Kitchen übernimmt die Gestaltung beim Einlesen in `design` (siehe „Import und Design") und setzt `design.sourceReport` **nicht**; der Runner liest das Flag nicht. `design.sourceReport` ist ein reines Konverter-Flag für Agenten, die `mockup_to_pbir.py` ohne Live-Helfer auf eine eingelesene Spec anwenden (`spec-format.md`).

**Sicherung vor der Installation.** Installiert ein Deploy Kitchen-Visuals oder registriert er das Theme, entsteht `backup/<seq>` schon davor (wie beim Vorbereiten), nicht erst vor dem Schreiben der Seiten. Ein gescheiterter Deploy (`failed`) und die Rücknahme vor dem Neuladen bringen damit auch `report.json`, `CustomVisuals/` und `StaticResources/RegisteredResources/` auf den Stand vor dem Deploy. „Zurück zu Deploy n" bleibt bei `definition/pages/`.

**Neue ungespeicherte Arbeit während des Deploys.** Direkt vor dem Neuladen liest der Runner den Status der Instanz noch einmal. Meldet sie jetzt `hasUnsavedChanges`, die Prüfung vor dem Schreiben sah aber keine (bzw. Desktop wurde nach einer Rückfrage gespeichert), und war die Antwort nicht `discard`: Bericht und `.state` zurück wie bei einem zweiten Fenster, kein Reload, `blocked` mit „Desktop hat seit dem Start von Deploy n ungespeicherte Änderungen …". Gilt für Deploys und „Zurück zu Deploy n". Grenze: Stammt die Markierung schon beim Start nur vom eigenen Reload, kann der Runner neue Änderungen nicht erkennen (siehe `unsavedByUsCertain`); deshalb „Während eines Deploys nicht in Desktop arbeiten" in BETA und PLAYBOOK.

**„Geschlossen" nur, wenn wirklich zu.** Meldet die Bridge das Projekt nicht mehr, gilt die Instanz nur dann als geschlossen (`_gone` in der Rückfrage, „schon geschlossen" vor dem Neustart), wenn die gefragte pid nicht mehr als `pbidesktop.exe` läuft (oder sich in der Bridge-Liste mit einer anderen Datei meldet) und kein Desktop-Fenster ohne Bridge die `.pbip` in der Kommandozeile nennt. Sonst gilt der Status als nicht lesbar: in der Rückfrage weiter warten, vor dem Schließen `blocked`. Fenster, die sich in der Bridge-Liste melden, zählen bei der Kommandozeilen-Prüfung auf Duplikate nicht mit (ihre Kommandozeile kann eine früher geöffnete Datei nennen).

**Vorbereiten und Zurück zu Deploy n.** Nach einer Rückfrage prüfen beide auf ein zweites Fenster bzw. eine andere pid, bevor sie schreiben; „Zurück" verlangt nach einer Rückfrage, die mit `_gone` endete, wieder ein Desktop mit dem Projekt (sonst `blocked`) und prüft vor dem Neuladen wie der Deploy.

**Antworten nur nach der Frage.** `deploy-confirm.json` zählt nur, wenn `at` nicht älter als `awaiting.since` ist (2 s Toleranz). Während des Wartens auf das Speichern bleibt `since` gleich.

**Vorhandene Version behalten (Demo B7).** Ein schon installiertes, älteres Kitchen-Visual (`vis_state` „outdated") gilt als Update, nicht als Pflicht:
- Rückfrage mit `updates: [{name, from, to}]`, dazu `updateOnly: true`, wenn der Neustart nur dafür nötig ist. `skipRestart` behält dann die Version im Bericht; das Visual gilt als nutzbar (Kacheln werden nicht zu Ersatz oder Platzhalter).
- Ohne Rückfrage: `"keepVersions": true` in `deploy-request.json` oder die Runner-Option `--keep-visual-versions` (nicht beim Vorbereiten). Ist Desktop beim Deploy zu, aktualisiert der Runner sonst ohne Frage.
- Status: `desktop.visualsKept: [{guid, name, from, to}]`, Schritt `visuals` „vorhandene Version behalten: …", To-do `manual` „… bleibt im Bericht …, im Repo gibt es …".

**Statusfelder.** `directWrites` und `shotsMs` stehen immer im Status (`0`, wenn nichts direkt geschrieben bzw. nichts aufgenommen wurde).

**mk-live 0.1.2.** `doctor` schreibt die Zeile `policy` immer (ohne Richtlinien als Info „keine … gefunden"). `diag` ersetzt zusätzlich den Projektordner samt übergeordneten Ordnern durch `<Projekt>` und den Benutzernamen in anderen Ordnernamen durch `<du>` (siehe „Live-Helfer `mk-live`").

## Import und Design (Kitchen 0.6, Korrekturrunde 02.10.2026)

Kitchen-Notiz zu B2 und B3 aus `FINDINGS-DEMO-2026-10-02.md`; der Runner-Teil steht in den Abschnitten oben.

**Gestaltung des Berichts gilt nach dem Einlesen als unverändert (B2).** `MK_PBIR.readDir` liest neben Seiten und Visuals auch die Gestaltung und `applyTo` schreibt sie nach `S.design`, bevor die Grundlinie `baseline-spec.json` entsteht. Die Spec direkt nach dem Einlesen trägt damit dieselben Werte wie der Bericht, `design` ist gegen die Grundlinie unverändert, und der Runner schreibt weder Seitenhintergrund noch Kachelstil auf eingelesene Seiten, solange niemand die Gestaltung im Kitchen anfasst. Quellen, in dieser Reihenfolge:

| Feld in `design` | Quelle im Bericht |
|---|---|
| `colors.pageBackground` (`pageBackground`) | `page.json` → `objects.background[].properties.color` (häufigster Wert über die Seiten in Leinwandgröße, Transparenz 100 zählt nicht); sonst Theme (`visualStyles.page["*"].background`, dann `background`); sonst `#FFFFFF` |
| `tileStyle` | `visualContainerObjects` der eingelesenen Kacheln: `dropShadow.show` → `shadow`, sonst `border.show` → `border`, sonst `flat` (häufigster Wert; ohne Eintrag gilt das Theme `visualStyles["*"]["*"]`, sonst die Power-BI-Vorgabe) |
| `tileBackground`, `colors.tileBackground` | `background.color` der Kacheln (häufigster Wert), sonst Theme, sonst `#FFFFFF` |
| `cornerRadius` | `border.radius` der Kacheln (häufigster Wert), intern geteilt durch `uiScale`, beim Export wieder multipliziert |
| `headerStyle`, `colors.headerBackground`, `colors.headerInk` | Kopfband: Füllung der Form `chrome_header_bg` (Kitchen-Bericht) bzw. der größten gefüllten Form im Kopfband, Schriftfarbe des Titels (`text.fontColor` einer Form, `textStyle.color` einer Textbox). `#FFFFFF`/`#0F1E2E` → `light`, `#0F1E2E`/`#FFFFFF` → `dark`, Akzentfarbe → `accent`, sonst `custom` |
| `colors.ink` | Theme `foreground`, sonst unverändert |

Das Theme kommt aus `definition/report.json` → `themeCollection.customTheme.name` → `StaticResources/RegisteredResources/<name>.json`. Nicht bestimmbare Werte bleiben, wie sie im Kitchen waren. Nicht übernommen (das Kitchen hat dafür kein Design-Feld): Rahmenfarbe und Schattenfarbe der Kacheln, Farben der Fußleiste. Der Stil-Abgleich des Runners (`plan_sync`) läuft auf eingelesenen Kacheln erst nach einer Designänderung (Runner 0.3.1, „Abgleich mit dem Bericht"); weicht dann die Rahmenfarbe des Berichts von der des Konverters ab, meldet er genau diese Eigenschaft, alles andere steht gleich. Der Hinweis `DESIGN_MAPPED` in `warnings` nennt die übernommenen Werte. Nach dem Einlesen setzt das Kitchen die Fingerabdrücke neu, auch die Gestaltung zählt also nicht als Änderung.

**Skizze ehrlich zur Bindung, Verlaufslinie (B3).** Die `kpi`-Skizze zeichnet die Verlaufslinie nur, wenn das Zeitfeld (Rolle `category`, „Zeit (Sparkline)") gebunden ist; ist nur die Hauptkennzahl gebunden, gibt es keine Linie (so zeigt es Desktop). Ohne jede Bindung bleibt die Platzhalter-Skizze mit Linie. Ohne gebundene Referenz gibt es weiterhin keine Δ-Zeile (`refSource: "none"`), und die `gauge`-Skizze zeichnet die Zielnadel nur mit gebundenem Ziel. Neu in der Spec: `display.drawn.sparkline` (`true`/`false`), für `ibcsKpiCard` → `showSparkline`.

**Skizzen-Stand je Deploy.** Beim Deploy schreibt das Kitchen zusätzlich `mockup/kitchen/<seq>/state.json` (sein kompletter Stand, auch Modell und Steckbriefe). Nach „Zurück zu Deploy n" (`restored` im Status) lädt das Kitchen zuerst `kitchen/<n>/state.json` (verlustfrei), sonst `mockup/<restored.spec>` (= `.state/specs/<n>.json`, Rückweg aus der Spec: Seiten, Raster, Kacheln, Bindungen, Analyse, Rahmen, Gestaltung; Modell und Sprache bleiben die aktuellen) als neuen Stand mit einem Rückgängig-Schritt, setzt die Fingerabdrücke auf „aktuell" und meldet es in der Bandzeile. Fehlt beides, bleibt die Skizze und die Bandzeile sagt, dass der nächste Deploy ihre späteren Änderungen zurückbringt.

**Ergebnis-Zustände und Rückfragen (Kitchen-Seite).** `planned` und `cancelled` lassen Marken, Ergebnis und Bildvergleich des Deploys aus `previous` stehen; nach `cancelled`, `failed` und `blocked` gelten die Änderungen seit dem letzten angekommenen Deploy wieder als offen. Im Rückfrage-Dialog stehen genau die Antworten aus `awaiting.options` (unbekannte werden nicht angeboten; ohne Liste die Vorgabe der Tabelle oben), in fester Reihenfolge `saveFirst`, `restart`, `skipRestart`, `discard`, `cancel`; „Jetzt neu starten" in Tinte, nicht Orange. Seit der Folgerunde gilt jede ungespeicherte Änderung (`awaiting.hasUnsavedChanges`) als Fall B, auch mit `unsavedByUs: true` (dann Kopf „Desktop hat ungespeicherte Änderungen" und der ehrliche Text, dass auch Änderungen seit dem letzten Deploy verloren gehen); Fall A nur ohne Ungespeichertes, der 10-s-Countdown nur dort und nur, wenn `awaiting.countdown` nicht `false` ist. Bei `updateOnly` heißt `skipRestart` „Vorhandene Version behalten", `updates` steht als Zeile im Dialog. Bei `kind: "unsaved"` startet Desktop nicht neu: `discard` heißt dort „Verwerfen und neu laden", `skipRestart` „Schreiben, nicht neu laden" (Folgerunde 2). Solange `desktopLive` jünger als der letzte Deploy ist und `unsavedByUs: true` meldet, steht im Band beim Desktop „ungespeichert seit #n" und darunter die schließbare Zeile „Ungespeichertes in Desktop seit Deploy #n wird beim nächsten Deploy verworfen …" (`n` = `desktopLive.reloadSeq`, sonst der letzte angekommene Deploy). Im Vorbereiten-Dialog steht die Theme-Pille nur, wenn `plan.themeRegister` es ankündigt (ohne Plan: nicht bei eingelesenem Projekt), bei eingelesenem Projekt als „Theme (ersetzt das Theme des Berichts)". Freigaben: ein To-do mit `retry: true` zeigt „Erneut freigeben" und schreibt eine neue Freigabe mit neuem `at`; bearbeitetes DAX geht als `overrides.dax` mit, der Hash ist dann `sha256(kind + "\n" + target + "\n" + after-mit-Korrektur)` mit `after` aus dem To-do (bei `addMeasure` samt `formatString`), kanonisches JSON; fehlt `after`, bleibt es bei `{"expression": DAX}`. Die Altform `ids` gilt als „Geändert seit der Freigabe". Legt das Kitchen `mockup/` selbst an, schreibt es `.gitignore` (gleicher Text wie der Runner) und `README.md`, vorhandene Dateien bleiben. Das prüft es beim Verbinden und vor jedem eigenen Schreiben außer der laufend geschriebenen Spec (Deploy-Anfrage samt Vergleichsbildern, Antworten, Freigaben), damit ein während der Sitzung gelöschter Ordner ohne laufenden Runner nicht ungeschützt neu entsteht.

## Seitenreihenfolge und Seitenrolle (Kitchen 0.6.1/0.6.2, Runner 12.10.2026)

- **Spec:** `pages[]` steht in Kitchen-Reihenfolge, je Seite `role` (`nav` | `detail` | `drill`) und `hidden`.
  Im Spec-Hash zählt `role` nur, wenn sie von `nav` abweicht (Kitchen und Python gleich).
- **Kitchen:** Abdruck `__pages` (Seiten-id und Rolle in Reihenfolge) neben `__design`. Weicht er vom letzten Deploy
  ab, zählt das als eine Änderung („Seitenreihenfolge oder Seitenrolle geändert"). Ältere Abdrücke ohne `__pages`
  lösen nichts aus.
- **Runner, Sichtbarkeit:** je Seite `pbir set "<Bericht>/<Seite>.Page.visibility" --value HiddenInViewMode`
  (detail, drill) bzw. `AlwaysVisible` (nav), nur wenn `page.json` etwas anderes sagt; gilt auch für eingelesene
  Seiten (das PBIP bleibt sonst unangetastet). Das Drillthrough-Feld setzt niemand automatisch (pbir kann es nicht).
- **Runner, Reihenfolge:** nach dem Schreiben aller Seiten `pbir pages move "<Bericht>/<Seite>.Page" --to <n>` für
  die Kitchen-Seiten. Seiten, die das Kitchen nicht kennt (QuickInfo, übersprungene), behalten ihren Platz; nur die
  Plätze der Kitchen-Seiten werden neu belegt (`Deploy.page_order_moves`, Test `tests/test_page_order.py`).
  Schlägt ein Verschieben fehl, entsteht ein To-do, der Rest des Deploys läuft weiter.
- **Noch nicht an echtem Desktop geprüft:** ob der Bridge-Reload eine geänderte `pages.json` ohne Neustart übernimmt.
