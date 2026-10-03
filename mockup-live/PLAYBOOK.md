> Stand 03.10.2026 · Beta · Kitchen 0.6 live, Live-Helfer `mk-live` 0.1.2 mit Runner 0.3.2 (`agent/live_runner.py`), pbir 0.9.32, Bridge-CLI `powerbi-desktop` 0.1.1 (so installiert und getestet). Neustart, losgelöster Start aus Desktop und Store-Desktop sind bisher nur mit Attrappen getestet, nicht an einem echten Desktop.

# Playbook: MockupKitchen live am Power-BI-Projekt

Für Mensch oder Agent, der eine Live-Sitzung fährt: Kitchen im Browser, PBIP auf der Platte, Power BI Desktop offen, Live-Helfer dazwischen. Einstieg für Testerinnen und Tester: [BETA.md](BETA.md). Dateivertrag: [CONTRACT.md](CONTRACT.md) (mit Abschnitt „Beta-Ergänzungen (02.10.2026)"). Oberfläche: [UX-KONZEPT.md](UX-KONZEPT.md). Agenten nutzen den Skill `mockup-live` (`.claude/skills/mockup-live/SKILL.md`).

**Grundsätze:** Das PBIP ist die Wahrheit. Der Deploy ist führend. Der Helfer löscht nie und beendet Desktop nie ohne Bestätigung. Bericht nur über `pbir`, Modell nur über `te`.

**Befehl:** `mk-live` gibt es nach `setup`. Bis dahin (oder wenn `setup` keinen Ordner im PATH fand) aus dem Repo-Ordner `mockup-live\bin\mk-live.cmd <Befehl>`, gleichwertig `python mockup-live\mk_live.py <Befehl>`.

## 1 · Voraussetzungen

1. **Windows, eigener Rechner, Chrome oder Edge** (File System Access API). Bildschirmsperre während der Sitzung aus.
2. **Power BI Desktop ab August 2026**, angemeldet. **Desktop Bridge** einschalten unter Datei → Optionen und Einstellungen → Optionen → **Sicherheit** (englisch *Enable external tool access to Power BI Desktop through secure local APIs*). Früher stand der Schalter unter Vorschaufeatures. Instanzen, die vor dem Einschalten gestartet wurden, neu starten.
3. **Projekt als PBIP mit PBIR-Bericht und TMDL-Modell**, `compatibilityLevel` mindestens 1600. Eine `.pbix` geht nicht.
4. **Python 3.11 oder neuer**, `pbir` **0.9.32** (gepinnt, nur nicht-kommerziell lizenziert), Bridge-CLI `powerbi-desktop` **0.1.1** (`npm install -g @microsoft/powerbi-desktop-bridge-cli@0.1.1`), optional `te` (Preview mit Ablaufdatum). Installation: [BETA.md](BETA.md), Abschnitt Voraussetzungen.
5. **Einrichten und prüfen:**
   ```powershell
   mockup-live\bin\mk-live.cmd setup          # einmal; danach heißt der Befehl mk-live
   mk-live doctor "C:\Users\<du>\Desktop\MockupLive-Test"
   ```
   `doctor` zeigt eine Ampel und schreibt `mockup\doctor.json`. Geprüft werden Python und Pakete (Pillow, psutil), `pbir`, Bridge-CLI, `te` mit Ablaufdatum aus `te --version`, Projekt (PBIP mit PBIR), `compatibilityLevel` (neuere als getestet nur als Hinweis), Visual-Schemas, die `pbir` nur über ein Rückfall-Schema kennt (Hinweis), `unappliedChanges.json`, `mockup\.gitignore`, Bridge je Desktop-Fenster, ob Desktop das Projekt offen hat (doppelt geöffnet = rot), Desktop-Programm (Store oder Installer), Kitchen-Visuals und Theme im Bericht, laufender Helfer (Herzschlag) und ob er losgelöst gestartet wurde, Richtlinien (Info, auch „keine gefunden"). Die Vorschau „Detect and reload external PBIP changes" kann `doctor` nicht lesen, er nennt sie nur als Hinweis. Jede gelbe und rote Zeile sagt, was zu tun ist. Rot zuerst beheben.

## 2 · Sitzung starten

1. **Arbeitskopie oder Commit.** Nie am Original. Kundenordner bleiben lokal.
   ```powershell
   robocopy "C:\…\Original" "C:\Users\<du>\Desktop\MockupLive-Test" /E
   ```
   Zum Ausprobieren gibt es das Beispielprojekt `mockup-live\sample\MockupLive-Sample`.
2. **Kopie in Desktop genau einmal öffnen** und warten, bis die Seiten sichtbar sind.
3. **Live-Helfer starten**, auf einem von zwei Wegen:
   - in Desktop: **Externe Tools → MockupKitchen live** (nach `mk-live register-tool`, einmal als Administrator);
   - in der Konsole: `mk-live start "C:\Users\<du>\Desktop\MockupLive-Test"`.

   `start` prüft wie `doctor` (ein blockierender roter Punkt hält an, `--force` übergeht das), startet den Runner losgelöst vom Desktop-Prozess, schreibt `mockup\desktop-session.json` (`sessionId`, `projectPath`, `pid`, `exe`, `startedAt`, `runnerPid`) und öffnet das Kitchen mit `?live=1&project=<Name>` (andere Adresse: `--open-kitchen <URL>` oder `MK_KITCHEN_URL`). Läuft für den Ordner schon ein Helfer (Herzschlag jünger als 15 s), startet es keinen zweiten; kommt der Start aus einer anderen Desktop-Instanz, ersetzt es den alten Helfer. Protokoll: `mockup\.state\runner.log`, Konsole des losgelösten Runners: `mockup\.state\runner.console.log`. Beenden: `mk-live stop`.
4. **Verbinden.** Im Kitchen **PBIP verbinden**, Ordner mit der `.pbip` wählen (nicht `*.Report`), Lesen und Schreiben erlauben. Das Kitchen gleicht drei Pfade ab (Kitchen-Ordner, `runner.projectPath`, `desktop-session.json`). Weichen sie ab, zeigt das Sitzungsband eine rote Zeile und Deploy ist gesperrt.
5. **Layout übernehmen.** Hat der Bericht schon Seiten, fragt das Kitchen „Layout aus dem Projekt übernehmen?". Übernehmen schreibt `mockup\baseline-spec.json`; der erste Deploy schreibt dann nur, was danach geändert wird. Das Kitchen übernimmt dabei auch die Gestaltung des Berichts (Seitenhintergrund, Kachelstil, Kopfband). Seitenhintergrund, Kachelstil, Theme und Rahmen eingelesener Seiten fasst der Helfer erst nach einer bewussten Designänderung im Kitchen an (Stolperstein 18).
6. **Sitzung vorbereiten.** Einmal am Anfang: Sitzungsband **Sitzung vorbereiten …**, Dialog **Jetzt vorbereiten**. Installiert die Kitchen-Visuals (ChartKitchen, KPI-Karte, dazu Gantt und GuV, wenn die Skizze sie braucht) und registriert das Theme `MockupKitchen`. Dafür startet Desktop einmal neu, nach Bestätigung (Abschnitt 4). Danach in Desktop in der gelben Leiste die Visuals erlauben. Technisch ein `deploy-request.json` mit `"prepare": true`, ohne Seiten zu schreiben.
7. **Sitzungsband prüfen:** Projektname und voller Pfad, Desktop-Stand, „n von m Kacheln bereit". „Die Küche ist kalt" heißt: kein Herzschlag vom Helfer seit 15 s.

**Für Profis, Runner direkt** (z. B. eigenes Terminal mit Protokoll):
```powershell
$env:PYTHONIOENCODING = "utf-8"
python mockup-live\agent\live_runner.py watch "C:\Users\<du>\Desktop\MockupLive-Test"
```
| Option | Wann |
|---|---|
| `--desktop-timeout 300` | Desktop startet langsam (Vorgabe 180 s) |
| `--no-desktop-restart` | Desktop darf gar nicht neu starten, Visuals bleiben To-do |
| `--te <Pfad>` | `te` liegt nicht im PATH (alternativ `$env:MK_TE`) |
| `--compare-wait 60`, `--shot-wait 30` | Kitchen-Bilder bzw. Desktop-Zeichnen brauchen länger |
| `--desktop-cli bridge` | `pbir desktop` streikt, Bridge-CLI direkt |
| `--confirm-timeout 600` | so lange auf `deploy-confirm.json` warten, danach `blocked` „Neustart nicht bestätigt" |
| `--pin-pid <PID>` | nur diese Desktop-Instanz ansprechen (setzen `mk-live start` und Externe Tools) |
| `--session-id <ID>` | Sitzungs-ID, sonst aus `desktop-session.json` |
| `--idle-poll 30` | Desktop-Zustand im Leerlauf lesen (`desktopLive`), `0` = aus |
| `--busy-backoff 1` | Wartezeit, wenn Desktop „busy" meldet (bis zu drei Wiederholungen) |
| `--keep-visual-versions` | schon installierte, ältere Kitchen-Visuals nie aktualisieren (je Deploy auch `"keepVersions": true` in `deploy-request.json`) |
| `--auto-restart` | **nur für unbeaufsichtigte Tests an Attrappen:** Neustart ohne Bestätigung |

`--respect-unsaved` (blockiert sofort bei jeder ungespeicherten Änderung) und `--restart-for-theme` gibt es weiter; im Normalfall ersetzen Bestätigung (Abschnitt 4) und „Sitzung vorbereiten" beide. `once` endet mit 0 (angewendet, Vorschau, nichts zu tun), 1 (fehlgeschlagen), 2 (blockiert) oder 3 (abgebrochen bzw. zurückgezogen).

## 3 · Ablauf eines Deploys

1. **Vorschau** (Strg+Enter): Das Kitchen schreibt `deploy-request.json` mit `"dryRun": true`. Der Helfer antwortet mit `state: "planned"` und `plan`: Änderungen je Seite (neu, geändert, verschoben, nur im Bericht), Modell-Ops mit Freigabestand, Neustart ja/nein mit Grund, geschätzte Dauer, zu installierende Visuals. Nichts wird geschrieben.
2. **Deploy** (Enter in der Vorschau, Strg+Umschalt+Enter direkt): `mockup-spec.json`, `AGENT-BRIEF.md`, `deploy-request.json` (neue `seq`, `sessionId`, optional `scope` `all`|`layout`|`theme`|`model`), danach die Vergleichsbilder nach `mockup\kitchen\<seq>\` und `tiles.json`. Esc zieht einen noch nicht gestarteten Deploy zurück (`deploy-cancel.json`).
3. **Stationen im Sitzungsband** und die Schritte im Status (`steps[].id`, mit `startedAt` und `ms`):

   | Station | Schritte | Was passiert |
   |---|---|---|
   | Prüfen | `bridge`, `spec`, `build`, `model` (Vorprüfung) | richtige Instanz, Ungespeichertes, `unappliedChanges.json`, Spec gegen `specHash`, Konverter nach `mockup\out\` |
   | Sichern | `plan`, `backup` | Delta gegen den letzten Deploy bzw. die Grundlinie, Kopie nach `mockup\backup\<seq>\`. Werden Kitchen-Visuals installiert oder das Theme registriert, entsteht die Kopie schon davor, damit eine Rücknahme auch `report.json`, `CustomVisuals\` und `RegisteredResources\` zurückbringt |
   | Schreiben | `visuals`, `desktop`, `theme`, `model`, `write`, `validate` | Seiten und Visuals per `pbir`, Modell-Ops per `te`, `pbir validate --fields`; neue Befunde spielen die Sicherung zurück |
   | Desktop lädt neu | `reload` bzw. `desktop` | `pbir desktop reload` (mit Modell `--model`), nach Neustart Öffnen der `.pbip` |
   | Vergleichen | `shots`, `compare` | Screenshot je geschriebener Seite, zugeschnitten auf die Berichtsseite (`shots\<seq>\<Seite>.page.png`), Bildvergleich je Kachel |
4. **Wartet der Helfer auf dich**, steht `runner.state: "awaiting"` und `awaiting` im Status. Das Kitchen zeigt den Rückfrage-Dialog und dazu eine Bandzeile (Abschnitt 4). Der Herzschlag läuft weiter.
5. **Während eines Deploys nicht in Desktop arbeiten.** Direkt vor dem Neuladen liest der Helfer Desktop noch einmal. Hat Desktop seit dem Start des Deploys ungespeicherte Änderungen bekommen oder ist ein zweites Fenster mit dem Projekt aufgetaucht, setzt er Bericht und `.state` zurück, lädt nicht neu und meldet `blocked`. In Desktop speichern oder verwerfen, dann erneut deployen.
6. **Ergebnis:** `state` `applied`, `planned` (Vorschau), `blocked` (Voraussetzung fehlt, in der Regel nichts geschrieben), `failed` (Sicherung zurückgespielt) oder `cancelled` (abgebrochen). `history` hält die letzten 20 Deploys für die Zeitleiste.

**Modell:** Format, Beschreibung und Anzeigeordner laufen ohne Freigabe, sobald `te` gültig ist. Neue Kennzahl, DAX-Änderung und Umbenennung brauchen eine Freigabe im Tab **Freigaben** (DAX bearbeitbar; „Mit echten Daten testen" aus dem UX-Konzept ist noch nicht gebaut). Freigaben sind an den Inhalt gebunden: `model-approvals.json` → `{"approvals": [{"id", "hash", "by", "at", "overrides"}]}`. Den Hash nennt der Helfer je Op in `plan.modelOps[]` und in `todos[]` (`kind: "model"`, Feld `hash`): sha256 über `kind`, `target` und Inhalt (`after` als sortiertes JSON bzw. neuer Name), durch Zeilenumbrüche getrennt. Ändert sich der Vorschlag, passt der Hash nicht mehr und die Op wartet erneut (`staleApproval`). Ohne Freigabe läuft der Deploy nur für den Bericht; die Freigabe hält ihn nicht an. Nach jeder Modelländerung `te validate --errors-only`, neue Fehler setzen das Modell zurück.

## 4 · Bestätigungen: Neustart und Ungespeichertes

Der Helfer beendet Desktop **nie** ohne eine passende Antwort für genau diese `seq` (Ausnahme `--auto-restart`, nur an Attrappen). Jeder Bridge-Reload setzt in Desktop „ungespeichert". Der Helfer merkt sich seinen eigenen Reload in `mockup\.state\desktop-reload.json` (`pid`, `at`, `seq`, `digest`; `digest` ist ein Fingerabdruck der `definition`-Ordner von Bericht und Modell) und meldet in `awaiting.unsavedByUs`, ob die Markierung nur von ihm stammt. Hat Desktop seitdem gespeichert, gilt eine neue Markierung als Arbeit des Nutzers.

**Grenze:** Änderungen, die jemand nach dem letzten Reload in Desktop macht, **ohne zu speichern**, sieht der Helfer nicht (der Fingerabdruck ändert sich erst beim Speichern). Beim **Neustart** zählt deshalb jede Markierung „ungespeichert" als Fall B: kein Countdown, kein direktes „Jetzt neu starten", nur Speichern, Ohne Neustart, Verwerfen oder Abbrechen; stammt die Markierung vom letzten Deploy, sagt der Text das ehrlich. **Ohne Neustart** lädt der Helfer bei einer Markierung, die nur vom eigenen Reload stammt, ohne Rückfrage neu (sonst fragte jeder zweite Deploy); was nach dem letzten Deploy in Desktop geändert und nicht gespeichert wurde, verwirft dieser Reload. Was bleiben soll, vor dem nächsten Deploy in Desktop speichern (Strg+S): dann fragt der Helfer. Weder `pbir` noch die Bridge-CLI können Desktop speichern lassen. Das Kitchen warnt deshalb vorher: Solange der Leerlauf-Status `desktopLive.unsavedByUs` meldet, steht im Sitzungsband beim Desktop „ungespeichert seit #n“ und darunter die schließbare Zeile „Ungespeichertes in Desktop seit Deploy #n wird beim nächsten Deploy verworfen“ (`n` aus `desktopLive.reloadSeq`).

Antwort des Kitchens (oder des Agenten nach OK im Chat): `mockup\deploy-confirm.json` = `{"seq": n, "action": "…", "at": "<ISO>"}`. Erlaubt ist nur, was in `awaiting.options` steht; jede Antwort zählt einmal und nur, wenn `at` nicht älter als die Frage (`awaiting.since`) ist. Ohne Antwort nach `--confirm-timeout` (Vorgabe 600 s): `blocked`, nichts geschrieben.

| Lage (`awaiting`) | Kitchen zeigt | Knöpfe → `action` |
|---|---|---|
| `kind: "restart"`, Desktop ohne Ungespeichertes (Fall A) | Dialog mit 10-s-Countdown (hält bei jeder Bewegung im Kitchen an) | **Jetzt neu starten** → `restart` · Ohne Neustart deployen → `skipRestart` · Abbrechen → `cancel` |
| `kind: "restart"`, Ungespeichertes nur vom letzten Deploy (`unsavedByUs: true`, Fall B) | Dialog ohne Countdown, Text „Ungespeichert ist, was der letzte Deploy geladen hat, und alles, was du seitdem in Desktop geändert hast" | **In Desktop speichern, ich warte** → `saveFirst` · Ohne Neustart deployen → `skipRestart` · Verwerfen und neu starten → `discard` · Abbrechen → `cancel` |
| `kind: "restart"`, echte Arbeit (`unsavedByUs: false`, Fall B) | Dialog ohne Countdown | wie die Zeile darüber; `discard` ist Gefahr und nie vorausgewählt |
| Neustart nur für ein Update eines schon installierten Kitchen-Visuals (`updateOnly: true`, `updates`) | wie Fall A bzw. B, dazu „Update im Bericht: ChartKitchen 1.42 → 1.43" | `skipRestart` heißt hier **Vorhandene Version behalten**: Deploy ohne Neustart mit der Version im Bericht |
| Sitzung vorbereiten (`prepare`) | wie oben | wie oben, ohne `skipRestart` |
| `kind: "unsaved"` (kein Neustart, aber der Reload würde echte Arbeit überschreiben) | Dialog ohne Countdown und Bandzeile | **In Desktop speichern, ich warte** → `saveFirst` · Schreiben, nicht neu laden → `skipRestart` · Verwerfen und neu laden → `discard` · Abbrechen → `cancel` |

- `restart`: nur diese Desktop-Instanz schließen, installieren, neu öffnen. Direkt davor liest der Helfer den Status noch einmal, gebunden an die gefragte pid; ist inzwischen ungespeicherte Arbeit da, ein zweites Fenster oder eine andere pid, blockiert er. Meldet sich die Instanz nicht mehr über die Bridge, läuft aber noch, gilt das als „nicht lesbar" (blockiert), nicht als geschlossen.
- `saveFirst`: Der Helfer liest Desktop alle 3 s und macht weiter, sobald gespeichert ist; beim Neustart folgt dann der Neustart ohne weitere Frage.
- `skipRestart`: Deploy ohne Neustart. Fehlende Kitchen-Visuals bleiben Skizze bzw. To-do, schon installierte ältere bleiben in ihrer Version und gelten als nutzbar. Bei `unsaved`: Bericht schreiben, Desktop nicht neu laden (Speichern in Desktop überschreibt dann den Deploy).
- `cancel`: Deploy endet ohne Schreiben (`cancelled`).
- `kind: "approval"` ist reserviert: Modell-Ops ohne Freigabe warten nicht, sie bleiben To-dos mit `hash`.
- Während des Neustarts zeigt das Kitchen eine Pausenkarte, weiter skizzieren ist möglich.

## 5 · Abnahme

1. **Ergebnis** öffnen (ganzseitig): je Seite Skizze und Desktop nebeneinander, Schieber, Überblenden oder Differenz; Leertaste halten blinkt.
2. Je Kachel ein Urteil in Worten: `Aufbau stimmt` · `Andere Datenmenge, Aufbau stimmt` · `Aufbau weicht ab: …` · `Desktop zeigt nichts: Feld fehlt oder Visuals nicht erlaubt`. Der Bildvergleich prüft den Aufbau, nicht die Zahlen.
3. Aktionen je Kachel: `Passt` · `Nacharbeiten …` · `In der Skizze zeigen`. **Seite abnehmen** setzt das Siegel am Seitentab.
4. **Neu messen ohne Deploy** (Deploy-Menü): frische Desktop-Bilder und Vergleich, nichts wird geschrieben.
5. Im Terminal dieselbe Kurzfassung: `python mockup-live\agent\live_runner.py status "<Projekt>"`.
6. Abgenommen ist eine Seite, wenn keine Kachel ohne Daten-Grund abweicht und alle Aufgaben erledigt oder bewusst zurückgestellt sind. Danach in Desktop speichern.

## 6 · Stolpersteine

1. **Bridge aus oder gesperrt.** `doctor` rot bei „Bridge", Status „Power BI Desktop nicht erreichbar". Schalter unter Optionen → **Sicherheit** (nicht mehr Vorschaufeatures). Per Richtlinie abschaltbar: dann IT fragen. Danach Desktop neu starten, alte Instanzen haben die Bridge nicht.
2. **Vorschau „Detect and reload external PBIP changes" und das Banner-Rennen.** Ist diese getrennte Vorschau an, bemerkt Desktop die Dateien schon während `Schreiben` und zeigt das Banner „Externe Änderungen übernehmen" oder lädt halbfertig neu. Während eines Deploys das Banner nicht anklicken, der Helfer lädt nach `validate` selbst neu. Für Live-Sitzungen die Vorschau ausschalten *(Empfehlung, nicht an jeder Desktop-Version geprüft; `doctor` kann sie nicht lesen)*.
3. **Desktop-exe nicht gefunden** (Store-Version). Der Helfer sucht: `PBI_DESKTOP_PATH`, exe der gerade geschlossenen Instanz, laufender Prozess, `C:\Program Files\WindowsApps\Microsoft.MicrosoftPowerBIDesktop_*\bin\pbidesktop.exe`, `Get-AppxPackage Microsoft.MicrosoftPowerBIDesktop`, klassische Installation, App-Alias `%LOCALAPPDATA%\Microsoft\WindowsApps\PBIDesktopStore.exe`. Scheitert alles: `$env:PBI_DESKTOP_PATH = (Get-AppxPackage Microsoft.MicrosoftPowerBIDesktop).InstallLocation + "\bin\PBIDesktop.exe"` und Helfer neu starten.
4. **Desktop verlangt ein Modell-Upgrade.** `compatibilityLevel` unter 1600. Bei geschlossenem Desktop über `te` anheben (`te set --help` zeigt die aktuelle Form), danach `te validate --errors-only`.
5. **Nach dem Neustart sind Kitchen-Visuals leer, gelbe Leiste oben.** In der Leiste freigeben. Der Vergleich dieses Deploys meldet „Desktop zeigt nichts" und gilt nicht. Neu messen.
6. **Zwei Desktop-Fenster mit demselben Projekt.** Der Helfer blockiert (`doctor` rot). Alle bis auf eines ohne Speichern schließen.
7. **„Ungespeichert" nach jedem Deploy.** Normal, der Reload setzt die Marke. Beim Neustart zeigt der Dialog das ehrlich (Fall B ohne Countdown, „Ungespeichert ist, was der letzte Deploy geladen hat …"). Wer in Desktop etwas behalten will, speichert dort vor dem nächsten Deploy und liest es ins Kitchen ein.
8. **`failed`: „geschützte Datei(en) verändert: …report.json".** `report.json`, `definition.pbir`, `mobileState.json`, `semanticModelDiagramLayout.json` nie bei offenem Desktop ändern. Während eines Deploys nicht in Desktop speichern.
9. **ChartKitchen zeigt „Beispieldaten · füge … hinzu".** Pflichtrolle leer, Feld fehlt im Modell oder Platzhalter-Bezug („PL ?"). Im Kitchen binden bzw. Kennzahl freigeben, erneut deployen.
10. **Δ rechnet gegen das falsche Szenario.** Bezüge werden nach dem Feldnamen zugeordnet (PY, VJ, LY → Vorjahr; PL, Plan, BU, Budget → Plan; FC, Forecast → Forecast). Kennzahlen eindeutig benennen.
11. **Desktop startet nach dem Neustart nicht** („bitte Desktop öffnen und anmelden"). Kontodialog oder gesperrter Bildschirm. Entsperren, Konto wählen, warten, erneut deployen; Dateien sind schon geschrieben. Dialoge nie automatisch wegklicken.
12. **„Wieder verbinden: <Name>" im Band.** Der Browser hat die Ordnerfreigabe entzogen (Tab neu geladen). Klicken und erlauben.
13. **`te` abgelaufen.** Der Helfer liest das Ablaufdatum aus `te --version` („expired on …" bzw. „expires …"), `doctor` zeigt es. Neue Preview ablegen oder `MK_TE` setzen, **Helfer neu starten** (er merkt sich die Befehlsform je Prozess). Bis dahin laufen Deploys ohne Modelländerungen, Freigaben heißen „Vormerken".
14. **Umlaute kaputt** („FuÃŸleiste") oder `UnicodeEncodeError`. `pbir add visual --from-json` und `pbir batch` lesen unter Windows cp1252. Eigene JSON für `pbir` mit `ensure_ascii=True` und ohne BOM schreiben; im Terminal `$env:PYTHONIOENCODING = "utf-8"`.
15. **„Die Küche ist kalt" trotz gestartetem Helfer.** Kein Herzschlag seit 15 s: beendet, abgestürzt oder auf einem anderen Ordner gestartet (Pfad im Band vergleichen). Neu starten. Ein unterbrochener Deploy endet dabei als `failed`; im Kitchen erneut deployen.
16. **`blocked`: „unappliedChanges.json liegt im Modellordner".** In Desktop „Änderungen übernehmen", speichern, erneut deployen.
17. **Theme oder Visual kommt nicht an, To-do „Neustart nötig".** „Sitzung vorbereiten" wurde übersprungen. Nachholen oder im Neustart-Dialog bestätigen.

**Aus dem ersten Praxistest** (23 Seiten, `compatibilityLevel` 1702, Kitchen-Visuals schon im Bericht; Befunde in [FINDINGS-DEMO-2026-10-02.md](FINDINGS-DEMO-2026-10-02.md), Korrekturen im Beta-Sprint):

18. **Erster Deploy stylt den ganzen Bericht um** (Plan: „24 Stil-Abgleiche gegen den Bericht, Seitenhintergrund auf 23 Seiten"), danach werden alle Seiten neu aufgenommen. **Behoben (Runner 0.3.1, Kitchen 0.6):** Das Kitchen übernimmt beim Einlesen die Gestaltung des Berichts in `design` (Grundlinie `baseline-spec.json`). Der Helfer vergleicht `design` mit der Grundlinie und schreibt Seitenhintergrund, Kachelstil und Theme auf eingelesene Seiten nur nach einer bewussten Designänderung im Kitchen, den Kitchen-Rahmen nie (To-do `frame`). Ein Bericht ohne eigenes Theme behält sein Theme, auch beim Vorbereiten (Runner 0.3.2); nach einer Designänderung kündigt die Rückfrage an, dass das Theme des Berichts ersetzt wird. Das Konverter-Flag `design.sourceReport` gilt nur ohne Live-Helfer. Zeigt die Vorschau trotzdem Stil-Abgleiche, wurde die Gestaltung im Kitchen geändert.
19. **`pbir batch move: {}` bzw. `pbir batch set: {}` mit Status `error`.** **Behoben (Runner 0.3.1):** `pbir` 0.9.32 kann Custom Visuals (ChartKitchen, KPI-Karte, Gantt, GuV) weder verschieben noch formatieren; der Helfer schreibt ihre Lage und ihren Container direkt in `visual.json` (Status `directWrites`), gescheiterte Batches nennen pbirs echte Meldung. Steht noch „{}" im Status, läuft ein alter Helfer: neu starten.
20. **Visualtyp gewechselt, altes Visual bleibt stehen.** **Behoben (Runner 0.3.1):** Ein vom Helfer angelegtes Visual ersetzt er („Typ gewechselt …, eigenes Visual ersetzt"), fremde nie (To-do). Dauerfehler wiederholt er nach zwei Versuchen nicht mehr.
21. **KPI-Karte winzig in der Kachel.** Desktop gibt dem Visual die Kachel in Seiten-px, die Karte wächst nur mit ihrem Inhalt. Der Konverter wählt Preset und Titelgröße jetzt aus der Kachelgröße (Formel in `.claude/skills/mockup-to-powerbi/references/spec-format.md`, in Desktop zu prüfen). Verlaufslinie nur mit gebundenem Zeitfeld.
22. **Neues natives Visual „übersprungen".** **Behoben (Runner 0.3.1):** Fehlt ein neues Visual nach dem Anlegen, legt der Helfer es im selben Deploy noch einmal an; klappt das nicht, steht der Grund im Status (`msg`). Die Ursache der Teil-Ablehnung aus dem Praxistest ist nicht gefunden.
23. **Seitenaufnahme dauert lange oder „Seitenverhältnis passt nicht".** Aufgenommen werden nur geänderte Seiten, dazu Seiten ohne Bild im Zeitbudget (`--shot-budget`, Vorgabe 30 s), je Seite höchstens `--shot-wait` (8 s). Findet die Suche die Seite nicht, nimmt der Helfer das Rechteck derselben Desktop-Sitzung und markiert den Vergleich als unsicher. Der Deploy gilt immer.
24. **Kitchen mit neuem Ordner verbunden, Helfer läuft auf einem anderen:** „Agent nicht aktiv" bzw. rote Pfadzeile. Helfer für den Ordner des Kitchens starten (`mk-live start "<Ordner>"`).
25. **Desktop geschlossen für ein Visual-Update** (z. B. ChartKitchen 1.42 → 1.43). Passiert nur nach Bestätigung. Im Dialog **Vorhandene Version behalten** (`skipRestart` bei `updateOnly`) deployt ohne Neustart mit der Version im Bericht; dauerhaft mit `--keep-visual-versions` bzw. `"keepVersions": true` in der Anfrage. Ist Desktop beim Deploy zu, aktualisiert der Helfer ohne Frage, außer mit diesen Schaltern.
26. **`compatibilityLevel` 1702 und `visualContainer` 2.10.0** liefen durch; `pbir` meldet „schema not available locally, fallback". Kein Blocker, `doctor` nennt es als Hinweis.

## 7 · Rückgängig

1. **Im Kitchen:** Verlauf → **Zu diesem Stand zurück …**. Das Kitchen schreibt `deploy-request.json` mit `"restore": {"fromBackup": n}`; der Helfer bringt den Bericht auf den Stand nach Deploy n, als neuer Deploy. Spätere Deploys bleiben im Verlauf. Das Kitchen lädt danach den Skizzenstand von Deploy n (`mockup\.state\specs\<n>.json`), sonst brächte der nächste Deploy die späteren Änderungen zurück.
2. **Bericht von Hand:** `mockup\backup\<seq>\<Name>.Report` ist der Stand vor Deploy `seq` (die letzten 10 bleiben, `--keep-backups`). Desktop schließen, aktuellen `<Name>.Report` umbenennen, Sicherung an seine Stelle kopieren, Desktop öffnen.
3. **Modell:** vor jeder `te`-Änderung liegt `definition` unter `mockup\.state\model-backups\definition-<Zeit>\`. Zurück wie beim Bericht, bei geschlossenem Desktop.
4. **Kitchen-Visuals und Theme:** Scheitert ein Deploy oder nimmt der Helfer ihn vor dem Neuladen zurück, kommen auch `report.json`, `CustomVisuals\` und `RegisteredResources\` auf den Stand davor (die Sicherung entsteht vor der Installation). „Zurück zu Deploy n" spielt nur Seiten zurück, Kitchen-Visuals und Theme bleiben dabei. Entfernen in Desktop.
5. **Ganz zurück:** Arbeitskopie verwerfen bzw. auf den Commit vor der Sitzung.

## 8 · Grenzen (Stand Beta)

Details in [FIDELITY.md](FIDELITY.md).

1. **Navigation:** Drill-through, Lesezeichen-Zustand, Burger- und Filterbereich-Zustand bleiben To-do (`mockup\out\navigation.md`).
2. **Seitenebene:** Reihenfolge, Umbenennen, Interaktionen zwischen Visuals, `tabOrder`.
3. **Deneb-Typen** (`marimekko`, `boxplot`, `deneb`) bleiben Platzhalter oder natives Visual.
4. **Gantt und GuV** ohne eigene Formatwerte; **`sparktable`** ohne Sparkline je Zeile; **Δ-Basis FC** wird `auto`.
5. **Modell:** keine neuen Spalten (Power Query), keine Feldparameter; ohne gültiges `te` nur Vormerken.
6. **Gestaltung:** Geist im Kitchen gegen Segoe UI in Desktop; Theme-Schriftgrößen in ganzen pt.
7. **Ohne Aufsicht** läuft nichts mit Neustart. Desktop muss angemeldet, der Bildschirm entsperrt sein.
8. **Stufe 2** (Service) gibt es noch nicht; `target: "desktop+service"` wird `blocked`. Zielbild in [KONZEPT.md](KONZEPT.md).
