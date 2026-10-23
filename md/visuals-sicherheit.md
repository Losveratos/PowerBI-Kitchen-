# Sicherheit & Betrieb der byDatenWG-Visuals

> Markdown-Fassung von [visuals-sicherheit.html](../visuals-sicherheit.html) · https://datenwgknowledgekitchen.com/visuals-sicherheit.html · generiert mit scripts/build_md.py — bei Abweichungen gilt die HTML-Fassung.

Power-BI-Visuals · für Admins, IT-Security, Datenschutz

Eine Seite für alle, die ein Custom Visual freigeben müssen: was die Visuals tun, was sie nicht tun, was im Bericht gespeichert wird, wie die Freigabe im Organisations-Store läuft und wo die Grenzen liegen. Sachlich und prüfbar — jede Aussage ist am Quellcode oder an der Microsoft-Dokumentation nachvollziehbar, die Checkliste in Abschnitt 07 führt Sie durch die Prüfung.

Stand 23.10.2026 · privileges: [] in allen drei Visuals · Quellcode offen · nicht von Microsoft zertifiziert

## 00 · Kurzfassung

> - **Kein Netzwerkzugriff:** In `capabilities.json` aller drei Visuals steht `"privileges": []` — keine Web-Access-, Download- oder Local-Storage-Berechtigung. Im Quellcode gibt es 0 Treffer für `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `eval(`, `new Function`, `localStorage`, `sessionStorage`, `document.cookie`, `indexedDB`.
> - **Keine Telemetrie, keine externen Schriften oder Skripte:** `externalJS` ist leer, das Stylesheet enthält kein `url()` und kein `@import`.
> - **Gespeichert wird nur Darstellung:** Format-Einstellungen und Ansichtszustand per `persistProperties` in der Berichtsdatei, dazu vom Autor eingetragene Texte (Titel, Kommentare).
> - **Eine Ausnahme beim Öffnen von Links:** ChartKitchen und P&L haben einen „Doku öffnen“-Knopf (`host.launchUrl`); er öffnet auf Klick unsere Dokumentation in einem neuen Tab. Es werden keine Daten angehängt.
> - **Nicht zertifiziert:** Die Visuals sind (Stand heute) nicht im AppSource gelistet und nicht zertifiziert. Folge laut Microsoft: Export nach PDF und PowerPoint sowie Abo-Mails zeigen unzertifizierte Visuals nicht an (Abschnitt 04).

## 01 · Was die Visuals sind

Drei Power-BI-Custom-Visuals von Michael Tenner (Daten-WG), gemeinsam in einem öffentlichen Repository entwickelt. Sie sind *IBCS-inspiriert* (Notation nach den IBCS-Prinzipien) und **nicht IBCS-zertifiziert**; IBCS® ist eine eingetragene Marke der IBCS Association.

### ChartKitchen byDatenWG

- **Version:** `1.52.4.0`
- **API:** `5.11.0`
- **GUID:** `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D`
- **Lizenz:** Apache-2.0 (`LICENSE` + `NOTICE`)
- **Ordner:** [ibcsInspiredChartDeck/](https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/ibcsInspiredChartDeck)

### P&L Statement byDatenWG

- **Version:** `1.5.3.0`
- **API:** `5.11.0`
- **GUID:** `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358`
- **Lizenz:** MIT (`LICENSE` im Repo-Wurzelverzeichnis)
- **Ordner:** [pnlByDatenWG/](https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/pnlByDatenWG)

### dataKitchenGantt

- **Version:** `1.15.0.0`
- **API:** `5.3.0`
- **GUID:** `dataKitchenGanttD7C41F0A93E24B6BA1F3C5E8A20D9B44`
- **Lizenz:** MIT (`LICENSE` im Repo-Wurzelverzeichnis)
- **Ordner:** [dataKitchenGantt/](https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/dataKitchenGantt)

Quelle der Angaben: `pbiviz.json` (Version, API, GUID) im jeweiligen Ordner des Repositories [Losveratos/PowerBI-Kitchen-](https://github.com/Losveratos/PowerBI-Kitchen-). Maßgeblich ist immer die `pbiviz.json` der Datei, die Sie prüfen — spätere Releases tragen eine höhere Version, behalten aber die GUID. Bei der Lizenz zählt die `LICENSE`-Datei im jeweiligen Geltungsbereich: ChartKitchen liefert eine eigene Apache-2.0-Lizenz mit; die Namen und das Logo „ChartKitchen“, „byDatenWG“, „Daten-WG“ sind davon ausgenommen (`NOTICE`).

## 02 · Datenfluss & Netzwerk

Die Visuals erhalten ihre Daten ausschließlich über die Power-BI-Host-Schnittstelle (`update()` mit dem DataView) und zeichnen sie in den eigenen Container. Der Code enthält keinen Weg, Daten nach außen zu senden. Microsoft führt Custom-Visual-Code nach eigener Aussage in einer Sandbox aus; ob ein Visual vertrauenswürdig ist, zu beurteilen liegt laut Whitepaper beim Kunden ([Power BI security white paper](https://learn.microsoft.com/power-bi/guidance/white-paper-powerbi-security)). Deshalb hier die Belege zum Nachprüfen.

### Berechtigungen (capabilities.json)

| Eigenschaft | ChartKitchen | P&L Statement | dataKitchenGantt |
| --- | --- | --- | --- |
| `privileges` | [] | [] | [] |
| `externalJS` (pbiviz.json) | null | null | null |
| `dependencies` (pbiviz.json) | null | null | null |

Ein leeres `privileges`-Array bedeutet: kein `WebAccess` (keine erlaubten URLs), kein `ExportContent` (kein Datei-Download aus dem Visual), kein `LocalStorage`. Seit API 4.6.0 müssen Berechtigungen ausdrücklich deklariert werden ([Microsoft: Capabilities](https://learn.microsoft.com/power-bi/developer/visuals/capabilities#privileges-define-the-special-permissions-that-your-visual-requires)); alle drei Visuals nutzen API 5.x.

### Trefferzahlen im Quellcode (`src/`)

| Suchmuster | ChartKitchen | P&L Statement | dataKitchenGantt |
| --- | --- | --- | --- |
| fetch( | 0 | 0 | 0 |
| XMLHttpRequest | 0 | 0 | 0 |
| WebSocket | 0 | 0 | 0 |
| navigator.sendBeacon | 0 | 0 | 0 |
| <script src | 0 | 0 | 0 |
| eval( | 0 | 0 | 0 |
| new Function | 0 | 0 | 0 |
| innerHTML | 0 | 0 | 1 * |
| localStorage | 0 | 0 | 0 |
| sessionStorage | 0 | 0 | 0 |
| document.cookie | 0 | 0 | 0 |
| indexedDB | 0 | 0 | 0 |
| Quelldateien in `src/` | 2 | 8 | 3 |

* Der eine Treffer in dataKitchenGantt ist ein Kommentar (`gantt.ts`, Zeile 20: „Rendering per DOM-Knoten (textContent, kein innerHTML)“), kein Aufruf. Weitere Muster ohne Treffer in allen drei Quellbäumen: `importScripts`, `window.open`, `postMessage`, `createObjectURL`, `new Worker`, `iframe`, `DOMParser`, `document.write`, `insertAdjacentHTML`, `outerHTML`, `navigator.`, `FontFace`. Dieselben zwölf Muster (bei `<script` ohne das Attribut „src“) ergeben auch im **gebauten Paket** (`.pbiviz`, Stand der drei Dateien im Repository vom 23.10.2026) 0 Treffer; die einzigen URLs im Bundle sind der SVG-Namensraum `http://www.w3.org/2000/svg`, die Dokumentations-Adressen unserer Website (ChartKitchen, P&L) und die Support-Links in den Metadaten.

### Die eine Ausnahme: „Doku öffnen“

ChartKitchen (`visual.ts`, Start-Hub) und P&L Statement (`visual.ts`/`hub.ts`, nur im Bearbeitungsmodus) rufen auf einen Klick auf „Doku öffnen“ `host.launchUrl(…)` auf. Die Adresse ist eine feste Konstante (`datenwgknowledgekitchen.com/chartkitchen-doku.html` bzw. `pnl-doku.html`, je nach Locale mit `_en`); Daten werden nicht angehängt. Power BI öffnet die Seite in einem neuen Browser-Tab — das Visual selbst sendet nichts. `launchUrl` benötigt keine Berechtigung in `privileges` ([Microsoft: Launch URL](https://learn.microsoft.com/power-bi/developer/visuals/launch-url)). dataKitchenGantt hat keinen solchen Knopf.

### Schriften, Telemetrie, Fremdcode

- **Schriften:** Das gebündelte Stylesheet enthält weder `@font-face` noch `url()` noch `@import`; die Visuals nutzen Systemschriften bzw. die Schrift des Berichts. Es werden keine Web-Fonts geladen.
- **Telemetrie:** Es gibt keinen Code-Pfad, der Nutzungs- oder Fehlerdaten übermittelt (siehe Trefferzahlen: keine Netzwerk-API). Kein Konto, kein Lizenzserver, kein Tracking.
- **Fremdcode im Paket:** nur die Microsoft-Hilfspakete `powerbi-visuals-api` und `powerbi-visuals-utils-formattingmodel` (ChartKitchen zusätzlich `powerbi-visuals-utils-formattingutils`); keine Diagramm- oder UI-Bibliothek von Dritten (`dependencies` in der jeweiligen `package.json`).

> **Grenzen dieser Prüfung:** Ein Suchlauf belegt das Fehlen der genannten Muster, nicht das Fehlen jeder denkbaren Umgehung (etwa dynamisch zusammengesetzter Funktionsnamen). Deshalb bildet die Kombination aus leerem `privileges` (vom Host durchgesetzt), Quellcode-Prüfung und eigener Netzwerkbeobachtung (Abschnitt 07, Punkt 6) die belastbare Aussage. Die Visuals sind nicht von Microsoft auditiert.

## 03 · Was gespeichert wird

Alles, was die Visuals festhalten, geht über die Host-Schnittstelle `persistProperties` in die Berichtsdatei (.pbix / PBIR) — dorthin, wo auch die übrigen Formateinstellungen des Berichts liegen. Außerhalb der Berichtsdatei speichern die Visuals nichts (kein Browser-Speicher, keine Cookies, kein Server).

| Visual | Persistierte Objekte (`capabilities.json`) | Inhalt |
| --- | --- | --- |
| ChartKitchen | `ibcsTitle`, `chart`, `colors`, `labels`, `emptyState`, `commentsPanel`, `scale`, `categoryAxis` | Formatierung und Ansichtszustand (Sortierung, aufgeklappte Zeilen, Spaltenbreiten, zuletzt angewandte Vorlage); vom Autor eingetragene Texte: Titelzeilen, Szenario-Beschriftungen, Leer-Zustand-Text und **Kommentare** (`commentsPanel.userComments`, JSON). |
| P&L Statement | `toolbar`, `columns`, `numbers`, `style`, `titleBlock`, `labels`, `emptyState`, `hierarchy`, `state` | Formatierung; Ansichtszustand als JSON (`state.uiState`, z. B. zugeklappte Zeilen, Treiberbaum-Wurzel); Titelblock und Leer-Zustand-Text vom Autor. |
| dataKitchenGantt | `darstellung`, `spalten`, `meilensteine`, `basisplan`, `schrift`, `dataPoint` | Formatierung, Farben, Tabellenbreite (per Trenner gezogen). |

> **Hinweis für den Datenschutz:** Es werden keine Messwerte oder Datenzeilen persistiert. Der Ansichtszustand kann aber *Bezeichnungen* aus Ihren Daten enthalten — etwa die Schlüssel aufgeklappter oder ausgeblendeter Zeilen, oder die Kategorie, an der ein Kommentar hängt. Kommentare und Titel sind Freitext des Berichtsautors; geben Sie dort keine Daten ein, die nicht in die Berichtsdatei gehören. Die Aussage zur Art der Properties folgt aus den deklarierten Typen in `capabilities.json` (Text, Zahl, Bool); wir haben nicht jede einzelne Schreibstelle im Code ausgewertet.

**Lesezeichen:** ChartKitchen und P&L Statement registrieren einen Selektions-Callback (`registerOnSelectCallback`) und übernehmen eine vom Host wiederhergestellte Auswahl, wenn ein Lesezeichen angewendet wird. Für dataKitchenGantt gibt es keine eigene Lesezeichen-Logik — Auswahl und Format verhalten sich wie bei den Standard-Mechanismen des Hosts (nicht gesondert getestet).

## 04 · Freigabe & Deployment

Die folgenden Angaben zu Power BI stammen aus der Microsoft-Dokumentation (abgerufen am 23.10.2026; Links unten). Bezeichnungen der Einstellungen stehen im englischen Originaltext, die deutsche Oberfläche kann abweichen.

### Drei Wege ins Berichtswesen

| Weg | So geht es | Was dazu gehört |
| --- | --- | --- |
| Import je Bericht | Visualisierungen → „…“ → *Visual aus einer Datei importieren* (`.pbiviz`). Das Visual steckt dann in der Berichtsdatei. | Im Service greift das Tenant-Setting *Allow visuals created using the Power BI SDK* (laut Microsoft standardmäßig deaktiviert) und ggf. *Add and use certified visuals only*. In Desktop steuern das Gruppenrichtlinien (`EnableCustomVisuals`, `EnableUncertifiedVisuals`). |
| Organisationsvisual | Admin-Portal → *Organizational visuals* → *Add visual* → *From a file*; Name, Icon, Beschreibung, Zugriff festlegen. Optional *Enable for Visualization Pane*, damit das Visual allen Autoren direkt angeboten wird; sonst finden Autoren es unter *Get more visuals → My organization*. | Von den beiden obigen Tenant-Settings **nicht betroffen**: Organisationsvisuals gelten auch, wenn Dateiimport und unzertifizierte Visuals gesperrt sind. Zentrale Versionierung, Aktivieren/Deaktivieren, Löschen. Von Microsoft dokumentierte Warnung: Eine hochgeladene Datei kann Code mit Sicherheitsrisiken enthalten — Quelle prüfen (Abschnitt 07). |
| AppSource (zertifiziert) | Visual aus dem Marketplace importieren oder per *Add visual → From AppSource* in den Org-Store. | **Für unsere Visuals noch nicht verfügbar** (Abschnitt 05). |

### Update-Weg

- **Organisationsvisual:** Visual auswählen → *Settings* → *Browse* → neue `.pbiviz` wählen → *Update*. Laut Microsoft erhalten danach alle Berichte, die dieses Visual verwenden, automatisch die neue Version — es gibt eine zentral kontrollierte Version, die Sie vorher testen können.
- **Gleiche GUID:** Die GUID (Abschnitt 01) ist die Identität des Visuals; wir ändern sie zwischen Releases nicht. Prüfen Sie vor dem Austausch, dass die GUID der neuen Datei der bisherigen entspricht (Checkliste, Punkt 5). Eine ausdrückliche GUID-Regel nennt die Microsoft-Seite zum Update nicht.
- **Import je Bericht:** Die Datei muss pro Bericht erneut importiert werden; ältere Berichte behalten bis dahin ihre eingebettete Version.
- **Deaktivieren/Löschen:** Deaktiviert rendert das Visual in bestehenden Berichten nicht mehr („This custom visual is no longer available“); Löschen ist unumkehrbar. Power BI Report Server unterstützt Organisationsvisuals nicht.

### Export nach PDF, PowerPoint und Abo-Mails

> **Rendering-Events sind umgesetzt — das genügt aber nicht für den Export.** Alle drei Visuals rufen in `update()` `renderingStarted` auf und beenden mit `renderingFinished` bzw. `renderingFailed` (`visual.ts`). Das ist die technische Voraussetzung für Export und für die Zertifizierung. Microsoft dokumentiert jedoch: Custom Visuals werden für *Export to PDF*, *Export to PowerPoint* und Abonnement-Mails **nur unterstützt, wenn sie zertifiziert sind**; Organisationsvisuals (aus Datei) ausdrücklich nicht. Bei unzertifizierten Visuals ist die Export-Option ausgegraut oder fehlt; in Abo-Mails erscheint ein Fehlersymbol. Planen Sie bis zu einer Zertifizierung also ohne PDF-/PPT-Export und ohne diese Visuals in Abo-Mails — für Exportseiten bieten sich native Visuals oder ein Screenshot an.

Microsoft-Quellen: [Manage Power BI visuals admin settings](https://learn.microsoft.com/fabric/admin/organizational-visuals) · [Power BI organizational visuals](https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-organization) · [Certified Power BI visuals](https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified) · [Export to PDF](https://learn.microsoft.com/power-bi/collaborate-share/end-user-pdf) · [Export to PowerPoint](https://learn.microsoft.com/power-bi/collaborate-share/end-user-powerpoint) · [Rendering events](https://learn.microsoft.com/power-bi/developer/visuals/event-service) · [Import a visual](https://learn.microsoft.com/power-bi/developer/visuals/import-visual)

## 05 · Status der Zertifizierung

- **Heute:** Keines der drei Visuals ist im Microsoft AppSource gelistet oder von Microsoft zertifiziert.
- **ChartKitchen:** technisch auf die AppSource-Einreichung vorbereitet — der Ordner [cert-export/](https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/cert-export) enthält den buildbaren Quellstand, Listing-Texte, Datenschutztext und eine Einreichungs-Checkliste. Die Einreichung ist **in Vorbereitung** und noch nicht erfolgt; ein Zeitpunkt oder Ergebnis lässt sich nicht zusagen. Eine Zertifizierung ist freiwillig und wird von Microsoft entschieden.
- **P&L Statement und dataKitchenGantt:** Für diese beiden Visuals liegt kein Einreichungspaket vor.
- **Was „vorbereitet“ nicht heißt:** Die oben belegten Eigenschaften (leeres `privileges`, kein `fetch`/`XMLHttpRequest`/`eval`, Rendering-Events) entsprechen Anforderungen aus Microsofts Zertifizierungsliste. Ob ein Visual alle Punkte erfüllt, entscheidet Microsoft im Prüfverfahren — wir behaupten das nicht.

## 06 · Barrierefreiheit (kurz)

| Merkmal | ChartKitchen | P&L Statement | dataKitchenGantt |
| --- | --- | --- | --- |
| `supportsKeyboardFocus` | true | true | nicht gesetzt |
| `supportsHighlight` | false | false | nicht gesetzt |
| Hochkontrast (`colorPalette.isHighContrast` im Code) | ja | ja | nein |
| Tastatur-Handler im Code (`keydown`/`tabindex`) | ja | ja | nein |

ChartKitchen und P&L Statement werten die Hochkontrast-Palette des Hosts aus; dort tragen Muster statt Farben die Aussage (Szenario-Notation AC/PY/PL/FC). Bedienelemente im Start-Hub sind per Tab erreichbar. `supportsHighlight: false` heißt: Hervorhebung durch andere Visuals läuft nicht über die Highlight-Schnittstelle (Kreuzfilterung per Auswahl ist unabhängig davon). dataKitchenGantt hat **keine** Hochkontrast-Auswertung und keine Tastatursteuerung — für Berichte mit Barrierefreiheits-Anforderung ist es derzeit nicht geeignet. Eine formale Barrierefreiheits-Prüfung (z. B. mit Screenreader) liegt für keines der Visuals vor.

## 07 · Prüf-Checkliste für Admins

Sieben Schritte, die Sie ohne uns durchführen können. Beispiel: ChartKitchen; für die anderen Visuals Dateinamen und GUID tauschen. Die Befehle sind PowerShell (Windows); unter macOS/Linux funktionieren `unzip` und `grep` entsprechend.

1. **Datei sichern und Hash festhalten.** Laden Sie die `.pbiviz` (ChartKitchen: `downloads/chartkitchen-byDatenWG-latest.pbiviz` auf dieser Website) und notieren Sie den SHA-256 im Freigabe-Protokoll. Nach jedem Update neu bilden.

```
Get-FileHash .\chartkitchen-byDatenWG-latest.pbiviz -Algorithm SHA256
```

2. **Paket entpacken.** Eine `.pbiviz` ist ein ZIP-Archiv mit `package.json` und `resources/<GUID>.pbiviz.json`.

```
Copy-Item .\chartkitchen-byDatenWG-latest.pbiviz .\ck.zip
Expand-Archive .\ck.zip -DestinationPath .\ck
```

3. **Berechtigungen lesen.** In der entpackten JSON-Datei müssen `capabilities.privileges` leer und `externalJS` leer sein; `apiVersion` und `visual.version` stehen im selben Dokument.

```
$j = Get-Content .\ck\resources\*.pbiviz.json -Raw | ConvertFrom-Json
$j.capabilities.privileges   # leere Ausgabe = leer
$j.externalJS                # leere Ausgabe = leer
$j.apiVersion; $j.visual.version
```

4. **Im Code suchen.** Der folgende Befehl muss ohne Ausgabe enden. Die Adressen-Liste zeigt alle URLs im Paket (erwartet: SVG-Namensraum, Dokumentations- und Support-Links).

```
Select-String -Path .\ck\resources\*.pbiviz.json -Pattern 'fetch\(|XMLHttpRequest|WebSocket|sendBeacon|eval\(|new Function|\.innerHTML|localStorage|sessionStorage|document\.cookie|indexedDB' -AllMatches
Select-String -Path .\ck\resources\*.pbiviz.json -Pattern 'https?://[^"'' )\\]+' -AllMatches | % { $_.Matches.Value } | Sort-Object -Unique
```

5. **GUID vergleichen.** Die GUID im Dateinamen der JSON-Datei, im Feld `visual.guid` und in `pbiviz.json` des Repositories (Abschnitt 01) muss übereinstimmen; beim Austausch im Org-Store muss sie der bereits installierten entsprechen.

6. **Laufzeit beobachten.** Visual in einem Testbericht mit Testdaten einsetzen, im Browser die Entwicklerwerkzeuge öffnen (F12 → Netzwerk) und mit dem Visual arbeiten (filtern, sortieren, Kommentar anlegen). Erwartung: keine Anfragen, die vom Visual ausgehen; nur der Klick auf „Doku öffnen“ öffnet einen neuen Tab zu `datenwgknowledgekitchen.com`.

7. **Quelle gegenprüfen.** Den Quellstand aus dem Repository holen (Commit, in dem die Version in `pbiviz.json` gesetzt wurde), selbst bauen und Quelltext und Bundle vergleichen. Ein bitgleicher Hash ist nicht zugesichert (Build-Metadaten), ein inhaltlicher Vergleich ist möglich.

```
git clone https://github.com/Losveratos/PowerBI-Kitchen-
cd PowerBI-Kitchen-\ibcsInspiredChartDeck
npm ci
npx pbiviz package
```

Danach: in einer Testumgebung als Organisationsvisual hochladen, mit den Tenant-Einstellungen Ihrer Organisation testen und erst dann für das Visualisierungsfenster freigeben (Abschnitt 04).

## 08 · Kontakt & Stand

- **Kontakt:** Michael Tenner, Daten-WG · [michael.tenner84@gmail.com](mailto:michael.tenner84@gmail.com?subject=Sicherheitsfrage%20byDatenWG-Visuals). Auch für Sicherheitsfunde und für Fragen des Datenschutzbeauftragten.
- **Fehler und Wünsche:** Issues im [Repository](https://github.com/Losveratos/PowerBI-Kitchen-/issues).
- **Stand dieser Seite:** 23.10.2026 · ChartKitchen 1.52.4.0 · P&L Statement 1.5.3.0 · dataKitchenGantt 1.15.0.0. Neuere Releases tragen höhere Versionsnummern; prüfen Sie jede Datei nach Abschnitt 07.
- **Gewährleistung:** Die Visuals werden ohne Gewähr bereitgestellt (Lizenztexte im Repository). Diese Seite ist keine Zusicherung im Rechtssinn, sondern eine Prüfhilfe.

**Sicherheit & Betrieb · byDatenWG-Visuals** · Stand 23.10.2026

Dokumentation: [ChartKitchen](../chartkitchen-doku.html) · [P&L Statement](../pnl-doku.html) · Schnellstart: [ChartKitchen](../chartkitchen-schnellstart.html) · [P&L](../pnl-schnellstart.html)

Kontakt: Michael Tenner · [michael.tenner84@gmail.com](mailto:michael.tenner84@gmail.com)

> IBCS® ist eine eingetragene Marke der IBCS Association. Die Visuals sind von den IBCS-Prinzipien inspiriert und stehen in keiner Verbindung zur IBCS Association; sie sind nicht IBCS-zertifiziert.
