---
name: mockup-to-powerbi
description: >
  Überträgt einen mit MockupKitchen byDatenWG skizzierten Bericht
  (`mockup-spec.json` + `AGENT-BRIEF.md` + `WORKSHOP-DOKU.md` +
  `pbir-visuals.<Seite>.json`) in ein bestehendes PBIP-Projekt: Felder gegen das
  Semantikmodell abgleichen, neue Kennzahlen mit `te` anlegen, **jede Seite**
  anlegen, Chrome-Zonen (Kopfband, Nav-Leiste, Filter-Panel, Fußleiste) bauen,
  native Visuals und Slicer per `pbir add visual --from-json` platzieren,
  Gestaltung aus `design` in die Container-Formatierung übernehmen, Nav-Buttons,
  Drill-through und Filter-Lesezeichen einrichten, ChartKitchen- und Deneb-Slots
  vorbereiten, am Ende `pbir validate --fields`, `te validate --errors-only`,
  Design-Linter und Wireframe. Erzeugt auf Wunsch auch die **Workshop-Doku als
  Markdown und PowerPoint** aus demselben Mockup. Auslösen, wenn der Nutzer
  sinngemäß sagt „setz mein Mockup in Power BI um", „mockup-spec.json in mein
  PBIP übertragen", „die Workshop-Skizze bauen", „MockupKitchen-Export
  umsetzen", „aus dem AGENT-BRIEF eine Report-Seite machen", „mach mir aus dem
  Mockup eine Workshop-Doku / PowerPoint / Präsentation" — auch ohne das Wort
  „Mockup", wenn die Exportdateien im Projektordner liegen.
---

# MockupKitchen → Power BI (PBIP/PBIR)

Gegenstück zu **MockupKitchen byDatenWG** (`mockup-kitchen.html`): dort skizziert
ein Mensch im Workshop einen Bericht, hier wird er gebaut. Arbeitet
ausschließlich lokal über die CLIs `pbir` und `te` — kein Server, kein MCP.

Zwei Ausgänge: der **Bericht** (Schritte 0–7) und die **Workshop-Doku** samt
PowerPoint (Schritt 8). Beides kommt aus derselben `mockup-spec.json`; die Doku
geht auch allein, ohne PBIP.

> **Sicherheitsprinzip — „vorbereiten + Plan":** Dieser Skill schreibt **nicht
> ungefragt** in `*.Report/` oder `*.SemanticModel/`. Er liest die Spec, gleicht
> sie gegen das Modell ab, erzeugt alle Bausteine in `mockup-out/`, zeigt einen
> Plan und wartet auf Freigabe. Erst danach: Backup/Commit, dann schreiben.

## Werkzeugregeln (nicht verhandelbar)
- Bericht nur über `pbir`, Modell nur über `te`. **Kein Handeditieren** von
  `visual.json`/`page.json`/TMDL, solange eine CLI es kann.
- **Keine selbstgebauten Regex-Prüfungen** für TMDL oder PBIR. Feldabgleich über
  `te list` / `te get`, Strukturprüfung über `pbir validate`.
- Nach jedem Modelleingriff `te validate -m "<Name>.SemanticModel" --errors-only`,
  nach jedem Berichtseingriff `pbir validate "<Name>.Report" --fields`.
- Absolute Pfade verwenden; bei mehreren gleichnamigen Reports im Baum erwischt
  `pbir` sonst den falschen.
- Power BI Desktop muss **geschlossen** sein. Läuft es mit, überschreibt ein
  Speichern aus Desktop alles, was hier entsteht.

---

## Schritt 0 · Voraussetzungen prüfen

1. **PBIP vorhanden?** `*.Report/definition/` **und** `*.SemanticModel/definition/`.
   Nur `.pbix` → Nutzer bitten, als Power-BI-Projekt zu speichern. `.pbix` ist
   binär und wird hier nicht angefasst.
   (Nur Doku gewünscht? Dann reicht die Spec — direkt zu Schritt 8.)
2. **Exportdateien da?** `mockup-spec.json` ist die Pflichtdatei.
   `AGENT-BRIEF.md` und `WORKSHOP-DOKU.md` sind die menschenlesbaren Fassungen
   derselben Daten (lesen, aber nicht als zweite Wahrheit behandeln), die
   `pbir-visuals.<Seite>.json` sind optional — das Skript erzeugt sie identisch neu.
3. **Welche Spec-Version?** `meta.specVersion`. 2 = mehrseitig mit `design`,
   `links`, Filter-Modi. 1 = alte einseitige Fassung; beides wird unterstützt,
   Unterschiede in [`references/spec-format.md`](references/spec-format.md).
4. **CLIs da?** `pbir --version`, `te --help`. Beide sind Preview; `te` läuft bis
   30.09.2026.
5. **ChartKitchen in der Spec?** Wenn `engine == "ck"` vorkommt: gibt es
   im Report bereits eine **Referenz-Instanz** des Custom Visuals
   (GUID `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D`)?
   - ja → replizieren nach
     [`chartkitchen-report/references/pbir-insertion.md`](../chartkitchen-report/references/pbir-insertion.md)
   - nein → **nicht raten.** Platzhalter-Strategie: pro Slot ein `shape` an der
     Slot-Position mit Text „ChartKitchen: \<Typ\>" (Befehle stehen in
     `mockup-out/commands.md`) und den Menschen bitten, das Visual **einmal** in
     Desktop zu platzieren und 2–3 Felder zuzuweisen. Danach kann der Skill
     replizieren.
6. **Desktop geschlossen?** Kurz nachfragen, bevor geschrieben wird.

## Schritt 1 · Spec lesen und Felder gegen das Modell abgleichen

Bausteine erzeugen (schreibt nur nach `--out`, fasst den Report nicht an):

```bash
python .claude/skills/mockup-to-powerbi/scripts/mockup_to_pbir.py \
  "<Projekt>/mockup-spec.json" --out "<Projekt>/mockup-out" \
  --report "<Name>.Report"
```

Ergebnis — **je Seite ein Unterordner**, dazu vier Dateien für den ganzen Bericht:

```
mockup-out/
├── <Seitenslug>/  pbir-visuals.json · chrome-visuals.json
│                  chrome-commands.sh · chrome-commands.ps1
│                  zones.json · chartkitchen-slots.json · deneb-slots.json
├── model-todos.md   neue Felder mit DAX-Vorschlag und te-Befehl
├── checklist.md     Umfang, Warnungen, Feldliste zum Abgleich
├── navigation.md    Nav-Buttons, Drill-through, Filter-Lesezeichen
└── commands.md      komplette Befehlsfolge über alle Seiten (nur mit --report)
```

Dann **jede** `ref` aus `mockup-out/checklist.md` gegen das Modell prüfen:

```bash
te list -m "<Name>.SemanticModel" --paths-only          # Tabellen
te list -m "<Name>.SemanticModel" Measures --paths-only # Measures
te list -m "<Name>.SemanticModel" <Tabelle> --paths-only
te get "<Tabelle>/<Feld>" -m "<Name>.SemanticModel"     # Detail
```

`Table.Field` aus der Spec entspricht `Tabelle/Feld` im te-Pfad.

Fehlende Felder sind von zweierlei Art:
- **Im Mockup als neu markiert** (`newFields`, `isNew: true`) → `mockup-out/model-todos.md`
  enthält Beschreibung, offene Frage aus dem Workshop und einen DAX-**Vorschlag**
  samt fertigem `te add`-Befehl. DAX vom Menschen bestätigen lassen, **dann** anlegen:
  ```bash
  te add "_Measures/Deckungsbeitrag" -m "<Name>.SemanticModel" -t Measure \
    -i "[Umsatz] - [Kosten]" \
    -q description -i "Umsatz minus variable Kosten" \
    -q formatString -i "#,##0" --if-not-exists --save
  te validate -m "<Name>.SemanticModel" --errors-only
  ```
- **Nicht markiert, existiert aber trotzdem nicht** (der Mensch hat im Mockup
  einen Namen getippt, den es so nicht gibt — z. B. `DimDate.Month`, während das
  Modell `MonthName`/`MonthNo` hat) → als **offene Entscheidung** vorlegen:
  umbenennen, mappen oder neu anlegen. Nicht selbst umdeuten.

> Ein einziges fehlendes Feld lässt `pbir add visual --from-json` die **komplette
> Datei** ablehnen („no visuals were created"). Modell also immer zuerst.

## Schritt 2 · Plan zeigen und Freigabe holen

Kurz und konkret, in dieser Reihenfolge:
- Seiten: Namen, je neu oder bestehend, Canvas `canvas.width × canvas.height`
- Gestaltung aus `design`: Kachelstil, Ecken, Seitenhintergrund, Kopfband-Stil,
  Akzent, Schriftfaktor (`uiScale`)
- Chrome: welche Zonen mit welchen Maßen, Filter-Modus, wie viele
  Shapes/Buttons/Slicer je Seite
- Native Visuals: Anzahl je Seite, Typen, Feldbindungen
- Navigation: Nav-Buttons, Drill-through-Ziele mit Drill-Feld, Lesezeichen
- ChartKitchen-Slots: Anzahl, Typ → `chart.orientation`, Referenz-Instanz ja/nein
- Deneb-Slots: Anzahl
- Modelländerungen: jede neue Kennzahl mit DAX-Vorschlag
- Offene Punkte aus `mockup-out/checklist.md`

Dann **warten**. Nach Freigabe sichern:

```bash
pbir backup "<Name>.Report"     # oder: git add -A && git commit -m "vor Mockup-Umsetzung"
```

## Schritt 3 · Seiten anlegen

Die komplette Reihenfolge steht in `mockup-out/commands.md`. Je Seite:

```bash
pbir add page "<Name>.Report/<Slug>.Page" -n "<Seitenname>" -w 1280 -h 720
pbir rm "<Name>.Report/<Seitenname>.Page/Title.Visual" -f
```

Der Pfad wird über den **Anzeigenamen** aufgelöst (`<Name>.Report/<Seitenname>.Page`),
das Argument von `add page` ist nur ein Ordner-Seed. `pbir add page` legt
**immer** eine Textbox `Title` bei (20, 20) an — die Option `--no-title` steht
zwar in der Hilfe, existiert in 0.9.32 aber nicht. Also entfernen, sonst
kollidiert sie mit dem Kopfband.

Bestehende Seite stattdessen nur umskalieren:

```bash
pbir pages resize "<Name>.Report/<Seitenname>.Page" -w 1280 -h 720
```

Seitenreihenfolge zum Schluss prüfen (`pbir ls "<Name>.Report"`), Landing-Page
setzen: `pbir pages active-page "<Name>.Report" "<erste Seite>"`.

## Schritt 4 · Chrome und Visuals — je Seite in dieser Reihenfolge

Die Chrome-Zonen sind auf **allen** Seiten identisch; die Elemente heißen auf
jeder Seite gleich (`chrome_header_bg`, `chrome_nav_1` …), weil Visualnamen nur
innerhalb einer Seite eindeutig sein müssen. Details und Begründung der Bauweise:
[`references/chrome-build.md`](references/chrome-build.md).

```bash
P="<Name>.Report/<Seitenname>.Page"
O="<...>/mockup-out/<Seitenslug>"

pbir add visual "$P" --from-json "$O/chrome-visuals.json"   # 1 Geometrie Chrome
pbir add visual "$P" --from-json "$O/pbir-visuals.json"     # 2 Visuals + Slicer
bash "$O/chrome-commands.sh"                                # 3 Rest
```

`chrome-commands.sh` (PowerShell: `.ps1`) setzt in einem Rutsch:

1. **Seitenhintergrund** aus `design.pageBackground`
2. Texte, Farben und Ausrichtung des Chromes (Kopfband-Stil aus `design.headerStyle`)
3. **Kachel-Container** aus `design`: `background.show/color`, je nach
   `tileStyle` `border.show/color/width` oder `dropShadow.*`, `border.radius`
   aus `cornerRadius`
4. Nav-Button-Aktionen — der Button der **eigenen** Seite bekommt Akzentfüllung
   und **keine** Aktion
5. z-Order: Chrome-Flächen `0`, Texte `4`, Buttons `5`, Inhalt `10`,
   Overlay-Filter `20`–`24` (`--from-json` vergibt immer `z = 0`)

Koordinaten **exakt** aus den Zonen übernehmen; nichts „optisch nachjustieren".
Untertitel aus der Spec (`subtitle`) danach setzen:

```bash
pbir set "$P/<visualId>.Visual.subTitle.show" --value true
pbir set "$P/<visualId>.Visual.subTitle.text" --value "in T€"
```

`notes` je Visual als Annotation ablegen, damit die Absicht im Bericht bleibt:

```bash
pbir add annotation "$P/<visualId>.Visual" \
  --text "Absteigend nach AC sortieren." --author mockup-to-powerbi --category Documentation
```

## Schritt 5 · Navigation, Drill-through, Filter-Lesezeichen

**Erst wenn alle Seiten stehen** — Sprungziele müssen existieren. Die fertigen
Befehle stehen in `mockup-out/navigation.md`.

**Nav-Buttons** erledigt bereits `chrome-commands.sh`. Wenn ein Button in
Desktop nicht springt: `pbir visuals action --target` schreibt den Text 1:1 in
`navigationSection`, ohne auf den internen Seitennamen aufzulösen. Dann den
`name` aus `definition/pages/<ordner>/page.json` als `--target` setzen.

**Drill-through** — Zielseite bekommt das Feld, die Quelle braucht nichts:

```bash
pbir pages drillthrough "<Name>.Report/<Zielseite>.Page" --table "DimProduct" --field "Category"
pbir pages drillthrough "<Name>.Report/<Zielseite>.Page" --show
```

Das Drill-Feld ist das **Kategorie-Feld der Quellkachel** (`category`, sonst
`rows`, `subcategory`, `series`). Dazu auf jede Drill-Zielseite ein Zurück-Button:

```bash
pbir add visual actionButton "<Name>.Report/<Zielseite>.Page" -n chrome_back -x 16 -y 38 -w 90 -h 28
pbir set "<Name>.Report/<Zielseite>.Page/chrome_back.Visual.text.text" --value "← Zurück"
pbir visuals action "<Name>.Report/<Zielseite>.Page/chrome_back.Visual" --type Back
```

**Filter-Lesezeichen** — nötig bei `zones.filter.mode == "burger"` und bei
`collapsible: true`. Rezept (steht fertig in `navigation.md`, ein Paar **je
Seite**, weil ein Lesezeichen immer den Zustand genau einer Seite hält):

```bash
pbir add bookmark "<Name>.Report" "Filter öffnen · <Seite>" --no-data --no-current-page
pbir bookmarks visuals "<Name>.Report" "Filter öffnen · <Seite>" \
  "chrome_filter_bg" "chrome_filter_title" "chrome_filter_close" "p1_slicer1_Year" …
# dito "Filter schließen · <Seite>"
pbir visuals hide "<Name>.Report/<Seite>.Page/chrome_filter_bg.Visual"   # Grundzustand: zu
pbir visuals action "<Name>.Report/<Seite>.Page/chrome_burger.Visual" \
  --type Bookmark --target "Filter öffnen · <Seite>"
pbir visuals action "<Name>.Report/<Seite>.Page/chrome_filter_close.Visual" \
  --type Bookmark --target "Filter schließen · <Seite>"
pbir bookmarks list "<Name>.Report"
```

`--no-data` ist Pflicht: sonst friert das Lesezeichen die Slicer-Auswahl ein.
`pbir add bookmark` legt nur die Hülle an — den **Zustand** füllt Power BI erst,
wenn das Lesezeichen in Desktop einmal aktualisiert wird (Ansicht → Lesezeichen
→ … → Aktualisieren). Das im Abschlussbericht als Desktop-Schritt nennen.

## Schritt 6 · ChartKitchen- und Deneb-Slots

`mockup-out/<Seitenslug>/chartkitchen-slots.json` enthält je Slot: `rect`,
`chartKitchenType`, den vorgeschlagenen `orientation`-Wert, `chartKitchenRoles`
(Mockup-Rollen bereits auf den ChartKitchen-Feld-Vertrag gemappt) und — falls
vorhanden — einen `nativeFallback`.

- **Mit Referenz-Instanz:** replizieren nach
  [`chartkitchen-report/references/pbir-insertion.md`](../chartkitchen-report/references/pbir-insertion.md),
  Position aus `rect`, Rollennamen ausschließlich aus
  [`chartkitchen-report/references/field-contract.md`](../chartkitchen-report/references/field-contract.md).
  Das Rollen-Mapping des Skripts ist ein **Vorschlag** — was die Referenz-Instanz
  zeigt, gewinnt.
- **Ohne Referenz-Instanz:** Platzhalter setzen (Befehle in `commands.md`) und im
  Abschlussbericht auflisten. Nicht raten.
- **Deneb-Slots** (`deneb-slots.json`): über den Skill
  [`deploy-to-powerbi`](../deploy-to-powerbi/SKILL.md) bzw. `pbir visuals deneb`.

## Schritt 7 · Verifizieren

```bash
pbir validate "<Name>.Report" --fields
te validate -m "<Name>.SemanticModel" --errors-only

export PYTHONIOENCODING=utf-8   # sonst brechen die beiden Python-Skripte an Umlauten ab
python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py "<Name>.Report" \
  --check --zones "<...>/mockup-out/<Seitenslug>/zones.json" --grid 0 \
  --skip-types shape,textbox,actionButton,image,slicer --pages "<Seite1>" "<Seite2>"
python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py "<Name>.Report" \
  --zones "<...>/mockup-out/<Seitenslug>/zones.json" --pages "<Seite1>" --html
```

- Alle Seiten teilen dieselbe Inhaltszone, deshalb reicht **eine** `zones.json`.
- `--grid 0`, weil MockupKitchen-Splits selten auf dem 8-px-Raster landen. Wer
  das Raster will: `pbir visuals snap "<Seite>.Page/*.Visual" -g 8 -d` — das
  verschiebt aber gegenüber dem Mockup.
- `--skip-types …`, weil Chrome-Elemente absichtlich außerhalb der Content-Zone
  liegen; ohne den Filter meldet der Linter sie alle.
- Das Wireframe zeigt Proportionen und Lücken; Ergebnis dem Menschen zeigen.

## Schritt 8 · Doku und PowerPoint

**Wann:** wenn der Mensch ein Workshop-Protokoll, eine Zusammenfassung oder eine
Präsentation zum Mockup will — als Abschluss nach dem Bauen oder ganz ohne PBIP
direkt nach dem Workshop. Der Prompt aus dem Tool bittet am Ende ausdrücklich
darum.

```bash
python .claude/skills/mockup-to-powerbi/scripts/mockup_to_docs.py \
  "<Projekt>/mockup-spec.json" --out "<Projekt>"
```

Ausgabe:

- **`WORKSHOP-DOKU.md`** — nur wenn sie noch nicht neben der Spec liegt (das Tool
  exportiert sie selbst). Gleiche Struktur wie dort; `--force-md` überschreibt.
- **`WORKSHOP-DOKU.pptx`** — 16:9, nüchtern (Ink `#0F1E2E`, Akzent aus
  `design.accent`, helle Flächen), ohne Bilder. Folien: Titel · Entscheidungen
  zur Gestaltung · **je Seite** ein maßstäbliches Wireframe aus nativen Shapes
  (Kopfband, Filter, Fußleiste, Kacheln mit Titel und Typ) **und** eine Folie mit
  der Kachel-Tabelle (Titel, Typ, Felder, Notizen) · Navigation und Drill ·
  neue Kennzahlen mit Beschreibung und offener Frage · offene Punkte ·
  nächste Schritte. Zwei Seiten ergeben also 10 Folien.

Die PowerPoint braucht `python-pptx`. Vorher prüfen:

```bash
python -c "import pptx" && echo vorhanden || echo "fehlt: pip install python-pptx"
```

Fehlt das Paket, schreibt das Skript trotzdem die Markdown-Fassung, meldet den
fehlenden Import und endet mit Exit-Code 1. Dann entweder `pip install
python-pptx` (nach Rückfrage beim Menschen) oder die fertige `WORKSHOP-DOKU.md`
an den Skill `anthropic-skills:pptx` geben — der baut die Folien ohne
zusätzliche Installation.

Die Wireframe-Folien sind echte Shapes, keine Bilder: Der Mensch kann sie im
Workshop direkt verschieben und beschriften.

## Schritt 9 · Abschlussbericht

- **Was liegt wo:** Seiten, Anzahl Visuals je Engine und Seite, Dateien in
  `mockup-out/`, Doku-Dateien.
- **Offene Punkte:** leere Pflichtrollen, ChartKitchen-Slots ohne Referenz-Instanz,
  neu angelegte Kennzahlen (DAX bestätigt?), nicht aufgelöste Felder, Hinweise
  aus `checklist.md`.
- **Nächste Schritte in Desktop:** Projekt öffnen, Theme prüfen, ChartKitchen-
  Slots füllen, **Lesezeichen-Zustände einmal aktualisieren**, Button-Navigation
  und Drill-through testen, Schriftgrößen der Chrome-Texte gegenprüfen,
  Alt-Texte und `tabOrder` nachziehen.

---

## Stolpersteine (alle real aufgelaufen, pbir 0.9.32)

| Fall | Was passiert | Umgang |
|---|---|---|
| `--from-json` mit Extra-Schlüssel | `unknown key(s): text` und **keine** Visuals werden angelegt | Nur `visual_type, name, title, x, y, width, height, fields` verwenden |
| Fehlendes Feld in `fields` | `Field '…' not found in model`, die **ganze** Datei wird abgelehnt | Modell zuerst (`te add --save`), danach erneut; pbir sieht neue Measures sofort |
| `shape.tileShape` = `roundedRectangle` | `Validation error: … not in [...]`, und mit `set -euo pipefail` bricht das ganze Chrome-Skript ab | Der Enum heißt **`rectangleRounded`**; Radius über `shape.rectangleRoundedCurve` |
| `title` bei einer Textbox | landet im Container-Titel, **nicht** im Textinhalt | Textzeilen als `shape` bauen (siehe `chrome-build.md`) |
| `pbir set …general.paragraphs` | wird als String-Literal geschrieben statt als Array — die Textbox bleibt leer, `pbir validate` meckert **nicht** | Nicht benutzen. Text über `shape` + `text.text`, oder `pbir add title`/`add subtitle` (schreiben korrekte `paragraphs`, sind aber auf 24 pt/14 pt und (20, 20) fest und müssen per `pbir visuals position` verschoben werden) |
| `pbir add page --no-title` | Option existiert nicht, steht aber im Hilfetext | Seite anlegen, dann `pbir rm "<Seite>.Page/Title.Visual" -f` |
| `pbir rm visual <pfad>` | „Got unexpected extra argument(s)" | Richtig ist `pbir rm "<pfad>" -f` |
| z-Order | `--from-json` setzt immer `z = 0`; Chrome-Flächen und Inhalt liegen gleichauf | `pbir visuals position … --z` (macht `chrome-commands.sh` am Ende automatisch) |
| Button-Navigation | `pbir visuals action --target` schreibt den Text 1:1 in `navigationSection`, ohne auf den internen Seitennamen aufzulösen | In Desktop testen; springt es nicht, den internen Namen aus `page.json` (`name`, z. B. `c98a70696fe77757`) als `--target` setzen |
| Lesezeichen ohne Zustand | `pbir add bookmark` legt nur die Hülle an; `bookmarks visuals` bestimmt die betroffenen Visuals, aber die Sichtbarkeits-Momentaufnahme entsteht erst in Desktop | Lesezeichen anlegen, Grundzustand per `pbir visuals hide` setzen, im Abschlussbericht „in Desktop einmal aktualisieren" nennen |
| Ein Lesezeichen für mehrere Seiten | funktioniert nicht — ein Lesezeichen hält den Zustand genau einer Seite | Je Seite ein Paar „Filter öffnen · \<Seite\>" / „Filter schließen · \<Seite\>" (erzeugt `navigation.md` automatisch) |
| Umlaute in der Konsole | Ausgabe zeigt `Î”`/`Ãœ`, die Dateien sind aber sauberes UTF-8 | Nicht „reparieren". Zum Prüfen die JSON lesen, nicht die Konsole |
| Python-Skripte des Design-Frameworks | `UnicodeEncodeError: 'charmap'` auf Windows-Konsolen | `export PYTHONIOENCODING=utf-8` (bzw. `$env:PYTHONIOENCODING='utf-8'`) |
| Überlappende Visuals | `pbir add visual` kennt `--force` gegen Überlappung/Canvas-Rand; bei `--from-json` schlug das Anlegen überlappender Chrome-Elemente **nicht** fehl | Erst ohne `--force` versuchen |
| Laufzeit von `chrome-commands.sh` | ein `pbir`-Prozessstart je Property (gemessen ~1,5 s); mit Kachel-Formatierung sind es je Seite 121 Aufrufe, also gut drei Minuten | Im Hintergrund laufen lassen, nicht abbrechen. Wer es schneller braucht: dieselben Setzungen als `pbir batch`-Spec (`pbir batch schema --version 2`, `validate` → `plan` → `run`) |
| `python-pptx` fehlt | `mockup_to_docs.py` meldet es und endet mit 1, die Markdown-Datei steht trotzdem | `pip install python-pptx` (Rückfrage!) oder Markdown an `anthropic-skills:pptx` geben |

## Leitplanken
- Nie ungefragt in `*.Report/` oder `*.SemanticModel/` schreiben; `mockup-out/`
  ist der Übergabepunkt, Plan + Freigabe + Backup gehen voraus.
- Nie ein ChartKitchen-`visual.json` raten. Ohne Referenz-Instanz nur Platzhalter.
- Keine `.pbix` anfassen.
- Bei mehrdeutigem Feld-Mapping oder unklarer Property: **offene Entscheidung**
  vorlegen, nicht raten.
- Kein zehnter Bucket, kein erfundener Seitenname: Was nicht in der Spec steht,
  wird nachgefragt.
- Farben, Schrift und Theme regelt der Skill
  [`powerbi-design-framework`](../powerbi-design-framework/SKILL.md); dieser hier
  regelt Struktur, Position, Bindung und die Container-Formatierung aus `design`.

## Referenzen
- [`references/spec-format.md`](references/spec-format.md) — `mockup-spec.json`
  vollständig (specVersion 1 und 2): Seiten, Design, Zonen, Filter-Modi, Links,
  Rollen-Vokabular, Engines, Rollen → pbir-Buckets, Rollen → ChartKitchen.
- [`references/chrome-build.md`](references/chrome-build.md) — wie Kopfband,
  Nav-Leiste, Filter-Panel und Fußleiste als native Elemente entstehen, mit
  verifizierten Befehlen.
- [`references/example/`](references/example/) — `mockup-spec.v2.json`
  (mehrseitig) und `mockup-spec.json` (v1) zum Trockenlauf, dazu die daraus
  erzeugte `pbir-visuals.json`.
- Skripte: `scripts/mockup_to_pbir.py` (Bericht), `scripts/mockup_to_docs.py`
  (Workshop-Doku + PowerPoint). Beide brauchen nur die Standardbibliothek,
  `mockup_to_docs.py` zusätzlich `python-pptx` für die Folien.
