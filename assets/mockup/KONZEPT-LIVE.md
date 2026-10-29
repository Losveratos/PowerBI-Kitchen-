> Stand 28.09.2026. Konzept, noch nicht umgesetzt. Stufe 1 arbeitet auf einem lokalen Power-BI-Projekt (PBIP), Stufe 2 schreibt live in den Service.

# MockupKitchen live am Bericht

## Ziel
Ein Agent (Claude Code, später jedes Programm mit MCP) setzt Änderungen aus dem Kitchen sofort im Bericht um. Der Mensch skizziert, kommentiert und entscheidet im Kitchen, der Agent schreibt mit den richtigen Werkzeugen und prüft jedes Ergebnis.

Arbeitsstand ist immer ein **Power-BI-Projekt (PBIP)**. Der Service kommt in Stufe 2 als zweites Ziel dazu, nicht als Ersatz.

## Was wo live sein kann

| Änderung | Lokal in Desktop | Im Service (Stufe 2) |
|---|---|---|
| Measure, DAX, Formatstring, Beschreibung | **live**: Power BI Modeling MCP ändert das Modell im laufenden Desktop | **live**: XMLA-Endpunkt, sofort wirksam, ohne Datenaktualisierung |
| Spalten, Tabellen, Beziehungen | über TMDL, danach „Apply external changes" | über XMLA, danach Aktualisierung des Modells nötig |
| Layout, Visuals, Seiten, Navigation | **nicht live**: Desktop schließen, mit `pbir` schreiben, neu öffnen (etwa 20 bis 40 s) | nach dem Schreiben mit `fab import` sichtbar, sobald der Browser neu lädt; der Agent lädt die Seite selbst neu |

Die Live-Ansicht für das Layout ist in Stufe 1 das Kitchen selbst. Desktop ist die Abnahme.

## Stufe 1 · lokales PBIP

**1a · Projekt verbinden (Kitchen)**
- Knopf „PBIP verbinden": Projektordner wählen (File System Access API, Chrome und Edge). Andere Browser bekommen den bisherigen Weg: Ordner hochladen, Export herunterladen.
- Beim Verbinden liest das Kitchen `*.SemanticModel/definition/tables/*.tmdl` ein, samt DAX im Steckbrief.
- Jede Änderung schreibt das Kitchen verzögert (etwa 1 s nach der letzten Eingabe) nach `<Projekt>/mockup/mockup-spec.json`, dazu `AGENT-BRIEF.md`. In `*.Report` und `*.SemanticModel` schreibt das Kitchen nie selbst.
- Statuszeile: „verbunden mit <Projekt> · zuletzt geschrieben 12:04". Die Ordnerfreigabe bleibt im Browser gespeichert, nach einem Neuladen reicht ein Klick.

**1b · Rückkanal (Agent → Kitchen)**
- Der Agent schreibt `<Projekt>/mockup/agent-status.json`: was angewendet ist, was wartet, was fehlgeschlagen ist, mit Kachel-IDs.
- Das Kitchen liest die Datei alle 2 s und markiert Kacheln: angewendet, wartet auf Freigabe, Fehler.

**1c · Live-Modus im Skill `mockup-to-powerbi`**
- Der Agent beobachtet `mockup/mockup-spec.json` (Monitor). Bei jeder Änderung erzeugt er einen Delta-Plan gegen den zuletzt angewendeten Stand. Die Spec hat stabile IDs und einen Hash, ein zweiter Lauf ist schon heute ein Delta.
- **Modelländerungen** (DAX-Korrektur aus dem Steckbrief-Kommentar, Formatwunsch, neue Kennzahl): einzeln vorschlagen, nach OK über den Modeling MCP in den laufenden Desktop, danach `te validate --errors-only` bzw. die Prüfung des MCP.
- **Layoutänderungen**: sammeln. Auf „anwenden" hin: Sicherung (Git-Commit oder Kopie), Desktop-Schließen nur nach Rückfrage, `pbir` schreiben, `pbir validate --fields`, Projekt mit `Start-Process <Name>.pbip` neu öffnen.

**1d · Bestehendes Layout einlesen**
- PBIR-Seiten ins Kitchen übernehmen: Positionen der Visuals zu Raster und Baum (Port aus dem Pixelraster-Playbook, `treeToGrid`). Damit lässt sich ein bestehender Bericht im Kitchen weiterbearbeiten und nicht nur ein neuer bauen.

**Freigaben in Stufe 1**
- Einmal pro Sitzung: Live-Modus für dieses Projekt einschalten.
- Jede Modelländerung einzeln.
- Layout gesammelt auf Stichwort.
- Nie löschen: Was im Bericht steht und im Mockup fehlt, wird gemeldet, nicht entfernt.

## Stufe 2 · live im Service

**Voraussetzungen**
- Eigener Entwicklungs- oder Test-Workspace auf Fabric-Kapazität oder PPU, XMLA-Endpunkt mit Schreibzugriff.
- Bericht im PBIP per `byConnection` an das Service-Modell gebunden. Ein `byPath`-Bericht wird beim ersten Hochladen umgestellt.
- `fab` angemeldet (`fab auth status`).

**Ablauf**
- Modell: Änderungen über XMLA, sofort live. Desktop-Berichte, die per Live-Verbindung am Service-Modell hängen, sehen neue Measures nach „Aktualisieren".
- Bericht: nach dem lokalen Schreiben `fab import "<Workspace>/<Name>.Report" -i <Pfad> -f`. Der Agent lädt die offene Berichtsseite im Browser neu.
- Das lokale PBIP bleibt die Wahrheit. Service-Stand und PBIP laufen nie auseinander, weil jeder Push aus dem PBIP kommt.

**Sicherheit**
- Nur Entwicklungs- oder Test-Workspaces. Produktion nur über Deployment-Pipeline oder Git, nie per Live-Push.
- Vor dem ersten Überschreiben pro Sitzung `fab export` als Sicherung, weil `-f` ohne Versionsverlauf überschreibt.
- Der erste Push pro Sitzung und Workspace braucht ein ausdrückliches OK.

**Alternative für Teams:** Workspace mit Git verbinden, der Agent committet und stößt „Update from Git" an. Langsamer, dafür versioniert und mit Review.

## Grenzen und Risiken
- `te` ist eine Preview und läuft am 30.09.2026 aus. Der Modellweg setzt deshalb auf den Power BI Modeling MCP. `te` bleibt für Prüfung, solange es läuft.
- `pbir` ist nur für nicht-kommerzielle Nutzung lizenziert und scheitert an neueren `mobile.json`-Schemata (Hybrid-Weg aus dem Pixelraster-Test). Für eine Weitergabe braucht die Schreibschicht eine Alternative oder eine Lizenzklärung.
- Desktop überschreibt beim Speichern alles, was extern ins Layout geschrieben wurde. Deshalb Layout nie bei offenem Desktop schreiben.
- File System Access API gibt es nur in Chromium-Browsern.

## Reihenfolge
1. 1a Projekt verbinden und Spec schreiben
2. 1c Live-Modus im Skill, Modelländerungen über den Modeling MCP
3. 1b Rückkanal mit Kachelstatus
4. 1d bestehendes Layout einlesen
5. Stufe 2: XMLA für das Modell, `fab import` für den Bericht, Neuladen im Browser
6. Danach: MCP-Server für das Kitchen, damit andere Programme es ohne Claude Code nutzen
