> Stand 02.10.2026. Ergebnis eines Designpanels mit drei Blickwinkeln (Workshop-Fluss, Tempo für Profis, Freude und Feinschliff), zusammengeführt. Leitgedanken von Michael: Ease of use und Mehrwert zuerst, dann UX/UI, die Spaß macht.

# MockupKitchen live · UX-Konzept

## Prinzipien
1. **Der Raum schaut zu.** Was auf dem Beamer steht, verstehen Fachanwender. Technik nur im Werkstattmodus.
2. **Vor dem Klick sichtbar, was passiert.** Anzahl Änderungen, Neustart ja/nein, Dauer. Nichts passiert unangekündigt.
3. **Nie warten ohne Information.** Jede Sekunde hat einen Schrittnamen, eine Zeit und einen Ausweg.
4. **Die Arbeit in Desktop ist heilig.** Eigene Reload-Markierung und echte ungespeicherte Arbeit werden unterschieden. Kein stilles Beenden.
5. **Jede Kachel weiß, wo sie steht.** Bereitschaft, Ergebnis und Abnahme gelten je Kachel.
6. **Weiterarbeiten während des Deploys.** Kein modales Fenster für Status und Ergebnis. Einziges Modal: Desktop-Neustart bestätigen.
7. **Alles umkehrbar, alles mitgeschrieben.** „Zurück" ist ein neuer Deploy nach vorn, das Protokoll füllt sich selbst.

Sprache: Deutsch, keine Gedankenstriche (Punkt, Doppelpunkt, „·"). Schrift überall Geist, Mono nur für Pfade, IDs, DAX, Zeiten. Orange (`--accent`) nur für Deploy, Blau (`--sel`) „Leitung steht / läuft", Grün (`--ok`) „angekommen", Bernstein (`--warn`) „wartet auf dich", Rot (`--bad`) nur für echte Fehler. Bewegung kurz und gedämpft, `prefers-reduced-motion` respektiert.

## Bausteine

### 1 · Deploy-Knopf (Topbar rechts, ersetzt Chip + Knopf)
Split-Button: Hauptteil mit Zustand und Zähler, rechts ▾ mit Teilzielen.

| Zustand | Beschriftung | Tooltip / Zeile im Band |
|---|---|---|
| nicht verbunden | `PBIP verbinden` | „Projektordner mit .pbip wählen" |
| keine Änderungen | `✓ Aktuell` (kein Akzent) | „Seit Deploy 7 nichts geändert · R misst neu" |
| Änderungen | `Deploy · 3` (Akzent, Zähler rollt) | „3 Kacheln geändert, 1 neu · ca. 9 s · Strg+Enter" |
| mit Neustart | `Deploy · 3 ⟳` | „Braucht einen Desktop-Neustart (ChartKitchen fehlt) · ca. 50 s" |
| Freigabe offen | `Deploy · 3` + Pille `2 Freigaben` | „Ohne Freigaben läuft der Deploy nur für den Bericht" |
| läuft | `Schreiben · 3,2 s`, Knopf füllt sich | „Deploy 8 läuft seit 6,1 s · üblich 9 s" |
| angewendet | `✓ #08 · 11,4 s`, nach 4 s „Aktuell" | |
| blockiert | `Blockiert` (Bernstein, nicht rot) | Bandzeile mit Lösung bleibt stehen |
| Fehler | `Fehler · zurückgerollt` (rot) | „Bericht unverändert, Sicherung zurückgespielt" |

Menü ▾: Alles deployen (Strg+Enter) · Nur Layout · Nur Theme · Nur Modell · Neu messen ohne Deploy (R) · Vorschau anzeigen · Zurück zu Deploy n …

Deploy-Nummern als Bon im Küchenstil: `#08` (Mono). Beim Klick gleitet der Bon vom Knopf ins Sitzungsband.

### 2 · Sitzungsband (36 px unter der Topbar, nur live)
Links nach rechts: `● IBCS Testbed  …\Desktop\MockupLive-Demo` · `Desktop verbunden` · `5 von 6 Kacheln bereit` · Zeitleiste `○ ○ ○ ● #04` · Ghost-Knöpfe `Freigaben 1` · `Ergebnis` · `Protokoll`.
- **Statuszeilen leben hier, nicht im Toast:** z. B. „Deploy #05 wartet: Desktop hat ungespeicherte Änderungen von dir." mit `[In Desktop gespeichert, weiter]` `[Überschreiben …]`. Sie bleiben, bis gelöst. Toasts nur noch für Echos („Kopiert"), über den Bühnenwerkzeugen.
- **Während des Deploys** wird das Band zum Stepper mit fünf Klartext-Stationen: `Prüfen` → `Sichern` → `Schreiben` → `Desktop lädt neu` → `Vergleichen`, rechts `#05 · 0:18 von etwa 0:30`. Dazu eine 2-px-Leitung an der Unterkante der Topbar, die sich füllt. Neustart: Leitung gestrichelt und still, Text „Desktop startet neu · 0:12".
- **Live-Saum:** 2-px-Linie `--sel-soft` oben an der Bühne, solange verbunden.

### 3 · Kachelring und Marken
- Ring 2 px: `--sel` bereit · Bernstein braucht etwas (Feld, Freigabe, nur Skizze) · `--ok` angekommen · `--bad` Fehler. Tooltip in Klartext („Braucht ein Feld: Istwert").
- Marke links in `.badges`, 16 px: ✓ ! ✕ −. Geändert seit Deploy: hohler Ring, „Geändert seit #05".
- Ankunft: Marke springt auf (`scale .4→1.08→1`, 260 ms), grüner Innenrahmen verblasst (900 ms), Kaskade in Lesereihenfolge (70 ms Abstand, max 700 ms).

### 4 · Rechtes Panel, neuer Tab „Live"
Abschnitte: **Jetzt** (Schrittliste mit Zeiten und „üblich"), **Bereitschaft** (doctor-Ampel mit Aktion je Zeile, „Sitzung vorbereiten"), **Freigaben**, **Verlauf** (Zeitleiste mit Vorschaubild, „Vergleichen", „Zu diesem Stand zurück …"). Nie automatisch öffnen.

### 5 · Erster Start und Verbinden (ganzseitiger Dialog „Live-Sitzung starten")
Checkliste mit Live-Prüfung alle 2 s: Desktop mit Projekt offen · Live-Helfer läuft („In Desktop: Externe Tools → MockupKitchen live", sonst Befehl kopieren) · Projektordner freigeben `[Ordner wählen …]`. Hauptaktion **Weiter zur Sitzung** in voller Breite.
- Projektkarte: Name 16/600, voller Pfad Mono, Pillen `In Desktop offen` · `Helfer beobachtet diesen Ordner` · `Zuletzt: #08, heute 10:42`.
- Drei Pfade (Kitchen, Helfer, Desktop) abgleichen. Abweichung: rotes Banner „Achtung, zwei verschiedene Kopien …", Hauptaktion gesperrt.
- Layout übernehmen als Karte statt `confirm()`: „IBCS Testbed hat 2 Seiten. Als Ausgangspunkt übernehmen?" **Übernehmen und loslegen** · `Leer beginnen`.

### 6 · Sitzung vorbereiten
Bandhinweis „Sitzung vorbereiten · einmal Desktop neu starten (1 bis 2 Min.)". Dialog: Was installiert wird (Pillen ChartKitchen · KPI-Karte · Theme), Text „Danach gibt es heute keinen Neustart mehr.", Hinweis klein „Guter Moment für die Vorstellungsrunde." Hauptaktion **Jetzt vorbereiten**. Danach „Sitzung bereit. Ab jetzt ohne Neustart." und, falls nötig, „In Desktop oben in der gelben Leiste die Visuals erlauben." `[Erledigt]`.

### 7 · Deploy-Vorschau (Popover am Knopf, Enter bestätigt)
„Das kommt in Desktop an" · je Seite `＋ neu` `✎ geändert` `↔ verschoben` `⊘ nur im Bericht (bleibt)` · Modell `✓ freigegeben` `⏸ wartet` · Desktop `Kein Neustart · Seiten 1 von 2` · Ziel `[Alles ▾]` · **Übertragen** (Strg+Enter). Ohne Änderung: „Seit #04 nichts geändert." `[Nur neu messen]`.

### 8 · Neustart bestätigen (einziges Modal)
- **Fall A, nichts ungespeichert:** „Desktop neu starten? Für Deploy #08 muss ChartKitchen in den Bericht … ca. 40 s. In Desktop ist nichts ungespeichert." `[Abbrechen]` `[Jetzt neu starten (10)]`, Countdown stoppt bei jeder Bewegung. Nur hier gibt es einen Countdown (Runner `countdown: true`).
- **Fall B, jede ungespeicherte Änderung:** kein Countdown. `[In Desktop speichern, ich warte]` (erkennt Speichern und macht weiter) · `[Ohne Neustart deployen]` · `[Verwerfen und neu starten]` (Gefahr, nicht vorausgewählt). Stammt die Markierung vom eigenen Reload (`unsavedByUs`), sagt der Text das ehrlich: „Ungespeichert ist, was der letzte Deploy geladen hat, und alles, was du seitdem in Desktop geändert hast." Der Runner sieht ungespeicherte Änderungen nach seinem Reload nicht (CONTRACT `unsavedByUsCertain`), deshalb ist auch dieser Fall B.
- **Ohne Neustart, nur Neuladen (`kind: unsaved`):** gleiche Form wie Fall B, Knöpfe `[In Desktop speichern, ich warte]` · `[Schreiben, nicht neu laden]` · `[Verwerfen und neu laden]`. Stammt die Markierung nur vom eigenen Reload, fragt der Runner nicht; das Sitzungsband sagt es vorher: „Ungespeichertes in Desktop seit Deploy #07 wird beim nächsten Deploy verworfen."
- Während des Neustarts **Pausenkarte**: Zeitzähler, „Desktop kommt gleich zurück. Weiter skizzieren ist möglich."

### 9 · Ergebnis (ganzseitige Ansicht)
Kopf: `Deploy #05 · 10:42 · Übersicht 2026`, Seitentabs, Modi `Nebeneinander | Schieber | Überblenden | Differenz`, Leertaste halten = Blinken. Eckmarken „SKIZZE · #05" / „DESKTOP · 10:42".
Je Kachel eine Zeile: Ausschnitt Skizze | Ausschnitt Desktop, Anzeigename, Urteil in Worten (`Aufbau stimmt` · `Andere Datenmenge, Aufbau stimmt` · `Aufbau weicht ab: Δ-Ebene fehlt` · `Desktop zeigt nichts: Feld fehlt oder Visuals nicht erlaubt`), „Aufbau"-Balken statt roter Prozent-Pille, Zahl nur im Tooltip. Aktionen `Passt` · `Nacharbeiten …` · `In der Skizze zeigen`. Fuß **Seite abnehmen** → Siegel am Seitentab `✓ 10:58`. Fester Satz: „Der Bildvergleich prüft den Aufbau, nicht die Zahlen."
Röntgenblick: Alt halten über der Skizze zeigt eine runde Lupe mit dem Desktop-Bild darunter.

### 10 · Freigaben
Karte je Wunsch (Tab Freigaben und im Steckbrief): Kopf `Neue Kennzahl · Marge % · _Measures`, DAX-Diff (Mono, rot/grün), Platzhalter rot „Bitte ersetzen", `[Mit echten Daten testen]` → „Ergebnis: 23,4 % (gesamt)" oder Fehler in Klartext, Format und Ordner, „Wird gebraucht von: Umsatz je Region". `[Ablehnen]` `[Freigeben]` (Tinte, nicht Orange). Danach Zeile „Freigegeben 10:51" mit gezeichnetem ✓. Hash-gebunden: „Geändert seit der Freigabe, bitte erneut freigeben." te aus: „Modelländerungen sind heute aus. Wünsche werden gesammelt." `Freigeben` heißt dann `Vormerken`.

### 11 · Zurück zu Deploy n, Protokoll, Beamer
- Zeitleiste: Hover zeigt Vorschaubild, **Zu diesem Stand zurück** mit Bestätigung „Deploy #04 und #05 bleiben im Verlauf, nichts geht verloren." Läuft als neuer Deploy `↶3`.
- Protokoll (ganzseitig): Entscheidungen · Abgenommen · Nacharbeiten · Neue Kennzahlen · Offene Fragen · Verlauf, Bilder je abgenommener Seite. **Protokoll herunterladen (HTML)** · Markdown kopieren · Drucken. Hinweis „enthält Bilder mit echten Daten, nicht ins Repo".
- **Abschlussfolie:** „Heute: 7 Deploys · 3 Seiten abgenommen · 2 neue Kennzahlen · 4 offene Fragen" mit Galerie.
- **Vergleich präsentieren:** Vollbild, Tasten 1 Skizze · 2 Desktop · 3 Nebeneinander · 4 Schieber · ←→ Seiten · K Kachel-Spotlight.

### 12 · Moderation / Werkstatt
Schalter im Menü ⋯, live Standard „Moderation": keine Technikwörter (Agent, Runner, Spec, Bridge, Pfade von Skripten), keine Prozentwerte, keine internen Namen (MonthName, mk_…). Werkstatt zeigt alles.

### 13 · Kleine Freuden (ohne Kitsch)
Bon-Nummern · „ANGERICHTET"-Stempel beim ersten erfolgreichen Deploy der Sitzung (einmal) · Übergabe-Kaskade · Röntgenblick · „DECKUNGSGLEICH" ab 98 % Aufbau · leere Zustände mit Küchenstimme („Der Pass ist leer.", „Die Küche ist kalt: Live-Helfer starten") · Tab-Titel und Favicon-Punkt zeigen den Zustand, wenn der Tab im Hintergrund ist. Kein Ton.

## Tastenkürzel
Strg+Enter Vorschau/Deploy · Strg+Umschalt+Enter Deploy direkt · R neu messen · L Live-Tab · D Desktop-Bild · Umschalt+D Modus · [ ] Regler · F / Umschalt+F nächste/vorige Kachel mit Befund · Esc abgelegten Deploy zurückziehen · Leertaste halten Blinken (Ergebnis) · Alt halten Lupe.

## Vertragsergänzungen (für den Runner)
`steps[].ms`, `steps[].startedAt`, `runner.current` · `deploy-request.scope` (all|layout|theme|model) und `dryRun` → Vorschau mit `restart`, `modelOps`, `pages`, `estMs` · `agent-status.awaiting` {kind restart|unsaved|approval, reason, unsavedByUs, pid} plus `deploy-confirm.json` / `deploy-cancel.json` · `restore {fromBackup}` · `visuals{}` schrittweise während `write` · Desktop-Bild zugeschnitten oder `pages[].canvasRect` · Sitzungs-ID und absoluter Pfad für den Abgleich.
