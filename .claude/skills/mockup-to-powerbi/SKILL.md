---
name: mockup-to-powerbi
description: >
  Überträgt einen mit MockupKitchen byDatenWG skizzierten Bericht
  (`mockup-spec.json` + `AGENT-BRIEF.md` + `WORKSHOP-DOKU.md` +
  `pbir-visuals.<Seite>.json` + optional `page-<n>-<Seite>.png`) in ein
  bestehendes PBIP-Projekt: Spec prüfen, Plan zeigen, nach Freigabe bauen und
  am Ende gegen ein Sollbild abnehmen. Felder gegen das Semantikmodell
  abgleichen, neue Kennzahlen mit `te` anlegen, **jede Seite** anlegen,
  Chrome-Zonen (Kopfband, Nav-Leiste, Filter-Panel, Fußleiste) bauen, native
  Visuals und Slicer per `pbir add visual --from-json` platzieren, Text-Kacheln
  mit ihrem Inhalt setzen, Gestaltung aus `design` als Theme-Fragment oder
  Container-Formatierung übernehmen, Analyse-Angaben (Polarität, Sortierung,
  Top-N, Einheiten) umsetzen, Nav-Buttons, Drill-through und Filter-Lesezeichen
  einrichten, ChartKitchen- und Deneb-Slots vorbereiten, **Custom Visuals**
  (`dataKitchenGantt` für Gantt-Kacheln, `pnlByDatenWG` für GuV-Kacheln) als
  fertige `visual.json` einspielen, dann `pbir validate
  --fields`, `te validate --errors-only`, Abnahme-Check, Design-Linter und
  Wireframe. Erzeugt auf Wunsch auch die **Workshop-Doku als Markdown und
  PowerPoint** (deutsch oder englisch, mit den PNG-Seitenbildern) aus demselben
  Mockup. Auslösen, wenn der Nutzer sinngemäß sagt „setz mein Mockup in Power BI
  um", „mockup-spec.json in mein PBIP übertragen", „die Workshop-Skizze bauen",
  „MockupKitchen-Export umsetzen", „aus dem AGENT-BRIEF eine Report-Seite
  machen", „mach mir aus dem Mockup eine Workshop-Doku / PowerPoint /
  Präsentation", „build my mockup", „mockup to Power BI", „turn my report sketch
  into a PBIP", „apply mockup-spec.json" — auch ohne das Wort „Mockup", wenn die
  Exportdateien im Projektordner liegen.
---

# MockupKitchen → Power BI (PBIP/PBIR)

Gegenstück zu **MockupKitchen byDatenWG** (`mockup-kitchen.html`): dort skizziert
ein Mensch im Workshop einen Bericht, hier wird er gebaut. Arbeitet
ausschließlich lokal über die CLIs `pbir` und `te` — kein Server, kein MCP.

**Was dieser Skill ist:** ein Anforderungswerkzeug mit deterministischem Ausgang
— dieselbe Spec ergibt denselben Bericht, jeder Lauf ist prüfbar, und ein
zweiter Lauf ist ein Delta, kein Neubau.

Zwei Ausgänge: der **Bericht** (Schritte 0–7) und die **Workshop-Doku** samt
PowerPoint (Schritt 8). Beides kommt aus derselben `mockup-spec.json`; die Doku
geht auch allein, ohne PBIP.

> **Sicherheitsprinzip — „vorbereiten + Plan":** Dieser Skill schreibt **nicht
> ungefragt** in `*.Report/` oder `*.SemanticModel/`. Er prüft die Spec, gleicht
> sie gegen das Modell ab, erzeugt alle Bausteine in `mockup-out/`, zeigt einen
> Plan und wartet auf Freigabe. Erst danach: Backup/Commit, dann schreiben.

**Ablauf in einer Zeile:** `validate` → `plan` → **Freigabe** → `apply` →
`verify`.

## Werkzeugregeln (nicht verhandelbar)
- Bericht nur über `pbir`, Modell nur über `te`. **Kein Handeditieren** von
  `visual.json`/`page.json`/TMDL, solange eine CLI es kann.
- **Keine selbstgebauten Regex-Prüfungen** für TMDL oder PBIR. Feldabgleich über
  `te list` / `te get`, Strukturprüfung über `pbir validate`, Abnahme über
  `pbir ls --json` / `pbir cat` (macht `scripts/mockup_verify.py`).
- Nach jedem Modelleingriff `te validate -m "<Name>.SemanticModel" --errors-only`,
  nach jedem Berichtseingriff `pbir validate "<Name>.Report" --fields`.
- Absolute Pfade verwenden; bei mehreren gleichnamigen Reports im Baum erwischt
  `pbir` sonst den falschen.
- Power BI Desktop muss **geschlossen** sein. Läuft es mit, überschreibt ein
  Speichern aus Desktop alles, was hier entsteht.
- **Nie löschen.** Was im Bericht steht, aber nicht mehr im Mockup, wird
  aufgelistet — entfernt es der Mensch.

---

## Schritt 0 · Voraussetzungen prüfen

1. **PBIP vorhanden?** `*.Report/definition/` **und** `*.SemanticModel/definition/`.
   Nur `.pbix` → Nutzer bitten, als Power-BI-Projekt zu speichern. `.pbix` ist
   binär und wird hier nicht angefasst.
   (Nur Doku gewünscht? Dann reicht die Spec — direkt zu Schritt 8.)
2. **Exportdateien da?** `mockup-spec.json` ist die Pflichtdatei.
   `AGENT-BRIEF.md` und `WORKSHOP-DOKU.md` sind die menschenlesbaren Fassungen
   derselben Daten (lesen, aber nicht als zweite Wahrheit behandeln), die
   `pbir-visuals.<Seite>.json` sind optional — das Skript erzeugt sie neu.
   Liegen `page-<Index>-<Seitenslug>.png` daneben (Export „Alle Dateien"),
   wandern sie in Schritt 8 in die PowerPoint.
3. **Welche Spec-Version?** `meta.specVersion`. 3 = aktuell (stabile IDs, Hash,
   Berichtskopf, Analyse-Block, Issues; ab Tool 0.4.1 zusätzlich Small
   Multiples, Achse per Feldparameter, die nativen Klassiker `ncolumn`/`nbar`/
   `nline`/`ndonut` und `zones.header.navOn`; ab 0.4.3/0.4.4 Typografie,
   Fußleisten-Navigation, Filter-Überschrift/-Hinweis, Slicer-Art und
   `A11Y_*`-Befunde), 2 = mehrseitig mit
   `design`/`links`, 1 = alte einseitige Fassung. Alle drei werden gelesen; v1/v2 werden intern
   auf v3 gehoben. Eine **höhere** Hauptversion bricht ab — dann ist das Tool
   neuer als der Skill, und Raten wäre falsch. Unterschiede in
   [`references/spec-format.md`](references/spec-format.md).
4. **CLIs da?** `pbir --version`, `te --help`. Beide sind Preview; `te` läuft bis
   30.09.2026.
5. **ChartKitchen in der Spec?** Wenn `engine == "ck"` vorkommt: gibt es
   im Report bereits eine **Referenz-Instanz** des Custom Visuals
   (GUID `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D`)?
   - ja → replizieren nach
     [`chartkitchen-report/references/pbir-insertion.md`](../chartkitchen-report/references/pbir-insertion.md)
   - nein → **nicht raten.** Zwei Möglichkeiten, beide mit dem Menschen klären:
     - **Platzhalter** pro Slot (ein `shape` an der Slot-Position mit Text
       „ChartKitchen: \<Typ\>", Befehle stehen in `mockup-out/commands.md`) und
       den Menschen bitten, das Visual **einmal** in Desktop zu platzieren und
       2–3 Felder zuzuweisen. Danach kann der Skill replizieren.
     - **`--ck-fallback`** beim Konverter: dann kommen die ck-Kacheln als
       **natives Ersatzvisual** in `pbir-visuals.json` (nur wo die Spec ein
       natives Gegenstück kennt — `varint`, `wfint`, `marimekko`, `gantt` &c.
       haben keines). Gut für eine lauffähige erste Fassung, aber es ist nicht
       IBCS und muss später ersetzt werden.
6. **Custom Visuals in der Spec?** Wenn `engine == "custom"` vorkommt (Kachel-Typ
   `gantt` → `dataKitchenGantt`, `pnl` → `pnlByDatenWG`): Die `.pbiviz` muss
   **vor** dem Bauen in den Bericht importiert sein, sonst bleibt die Kachel leer.
   Builds im Repo: `dataKitchenGantt/dist/*.pbiviz` und `pnlByDatenWG/dist/*.pbiviz`
   — fehlt einer, im Visual-Ordner `pbiviz package` laufen lassen. `pbir` kann
   diese Visuals **nicht anlegen**; das Skript schreibt sie als fertige
   `visual.json` (Schritt 6a).
7. **Desktop geschlossen?** Kurz nachfragen, bevor geschrieben wird.

## Schritt 1 · Spec prüfen und Bausteine erzeugen

Erst prüfen — **ohne gültige Spec kein Plan**:

```bash
python .claude/skills/mockup-to-powerbi/scripts/mockup_to_pbir.py \
  "<Projekt>/mockup-spec.json" --validate
```

Fehler kommen mit Feldpfad (`pages[0].visuals[2].engine: 'zauberstab' ist nicht
erlaubt …`), nie als Traceback. Geprüft wird gegen
[`references/mockup-spec.schema.json`](references/mockup-spec.schema.json)
(Draft 2020-12; nutzt das Paket `jsonschema`, wenn installiert, sonst einen
eingebauten Validator) plus die Regeln, die ein Schema nicht kann: doppelte
Seitennamen, doppelte Visualnamen je Seite, Links ins Leere.

Dann bauen lassen:

```bash
python .claude/skills/mockup-to-powerbi/scripts/mockup_to_pbir.py \
  "<Projekt>/mockup-spec.json" --out "<Projekt>/mockup-out" \
  --report "<Name>.Report" --plan
```

Ergebnis — **je Seite ein Unterordner**, dazu acht Dateien für den ganzen Bericht:

```
mockup-out/
├── <Seitenslug>/  pbir-visuals.json · text-visuals.json · chrome-visuals.json
│                  chrome-batch.json · delta-batch.json
│                  chrome-commands.sh · chrome-commands.ps1
│                  analysis-commands.sh · analysis-commands.ps1
│                  zones.json · chartkitchen-slots.json · deneb-slots.json
│                  custom-visuals.json  (Index der Custom Visuals)
│                  custom-visuals/<id>.visual.json · custom-commands.sh/.ps1
│                                    (nur wenn die Seite Custom Visuals hat)
├── model-todos.md      neue Felder mit DAX-Vorschlag, Umbenennungswünsche
├── checklist.md        Berichtskopf, Umfang, Issues, Kennzahlen-Steckbrief
├── navigation.md       Nav-Buttons, Drill-through, Filter-Lesezeichen
├── analysis-todos.md   Analyse-Angaben ohne direkten pbir-Befehl
├── theme-fragment.json Kachel-Optik als visualStyles-Fragment
├── commands.md         komplette Befehlsfolge (nur mit --report)
├── plan.json           Operationsliste, idempotent formuliert (nur mit --plan)
└── acceptance.json     Sollbild für die Abnahme (nur mit --plan)
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
  enthält Beschreibung, Einheit, Zielwert, Owner, Quelle, die offene Frage aus dem
  Workshop und einen DAX-**Vorschlag** samt fertigem `te add`-Befehl. DAX vom
  Menschen bestätigen lassen, **dann** anlegen:
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

Der **Kennzahlen-Steckbrief** in `checklist.md` (aus `fields[]`) zeigt zusätzlich
Alias, Owner, Quelle, Zielwert und ob die Definition bestätigt ist (☑/☐). Nicht
bestätigte Definitionen im Workshop klären — sie sind der häufigste Grund für
„die Zahl stimmt nicht". `renameInModel` ist ein **Wunsch**, keine Anweisung:
umbenennen erst nach Freigabe, danach `pbir fields replace` und
`pbir validate --fields` (der Rename kaskadiert nur halb).

> Ein einziges fehlendes Feld lässt `pbir add visual --from-json` die **komplette
> Datei** ablehnen („no visuals were created"). Modell also immer zuerst.

## Schritt 2 · Plan zeigen und Freigabe holen

`mockup-out/plan.json` ist die Vorlage: je Schritt die konkreten Befehle, wie er
sich bei Wiederholung verhält (`idempotent`) und was beim zweiten Lauf gilt
(`delta`). Daraus kurz und konkret vortragen:

- Seiten: Namen, je neu oder bestehend, Canvas `canvas.width × canvas.height`,
  Fragestellung je Seite (`pages[].question`)
- Berichtskopf: Zielgruppe, Ziel, Entscheidung, Datenstand (`report`)
- Gestaltung aus `design`: Kachelstil, Ecken, Seitenhintergrund, Kopfband-Stil,
  Akzent, Schriftfaktor (`uiScale`) — und ob als **Theme-Fragment** oder als
  Formatierung je Visual
- Chrome: welche Zonen mit welchen Maßen, Filter-Modus, wie viele
  Shapes/Buttons/Slicer je Seite
- Native Visuals: Anzahl je Seite, Typen, Feldbindungen; Text-/Button-Kacheln
  mit ihrem Inhalt
- Analyse je Kachel: Polarität, Sortierung, Top-N, Einheiten — und was davon
  nur als To-do geht (`analysis-todos.md`)
- Navigation: Nav-Buttons, Drill-through-Ziele mit Drill-Feld, Lesezeichen
- ChartKitchen-Slots: Anzahl, Typ → `chartKitchenMode`, Referenz-Instanz ja/nein
- Deneb-Slots: Anzahl
- Custom Visuals: welche (`dataKitchenGantt`, `pnlByDatenWG`), welche `.pbiviz`
  importiert werden muss, und ob eine Pflichtrolle leer ist (`plan.json` →
  `issues`, `customVisuals`)
- Gestaltung zusätzlich: Varianz-Palette (`teal`/`ibcs`) mit gut/schlecht-Farbe,
  Farbsatz aus `design.colors` (Ink, Kopfband) — beides steht im Theme-Fragment
- Modelländerungen: jede neue Kennzahl mit DAX-Vorschlag, jeder Umbenennungswunsch
- Offene Punkte aus `mockup-out/checklist.md` (Issues nach `error`/`warn`/`info`)
- **Barrierefreiheit** (Tool 0.4.4, Issues `A11Y_*`): eigener Block in
  `checklist.md` und erster Plan-Schritt `accessibility`. `error` ist ein
  **Blocker** — im Mockup beheben oder vom Menschen ausdrücklich akzeptieren
  lassen, bevor gebaut wird (`plan.json → accessibility.acceptBeforeBuild`).
- Typografie (wirksame Titel-/Untertitel-/Diagrammgrößen in pt, Kacheln mit
  eigenem Faktor), Filterbereich (Überschrift, Hinweis, Slicer-Arten) und
  Position der Seitennavigation — stehen in `checklist.md` und `plan.json`

Dann **warten**. Nach Freigabe sichern:

```bash
pbir backup "<Name>.Report"     # oder: git add -A && git commit -m "vor Mockup-Umsetzung"
```

**Delta-Regel:** Läuft der Bau nicht zum ersten Mal, vorher prüfen, was schon da
ist:

```bash
python .claude/skills/mockup-to-powerbi/scripts/mockup_verify.py \
  "<Name>.Report" "<Projekt>/mockup-out/acceptance.json" --quiet
pbir annotations list "<Name>.Report" --json      # mockup-spec-hash des letzten Laufs
```

Gleicher `mockup-spec-hash` wie in `acceptance.json` → am Bericht hat sich
nichts zu ändern. Anderer Hash → Delta-Lauf: **nicht** neu anlegen, sondern
`<Seitenslug>/delta-batch.json` laufen lassen (aktualisiert Position, Größe und
Feldbindung der vorhandenen Visuals). Gelöschtes nur melden.

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

## Schritt 4 · Chrome, Visuals und Formatierung — je Seite in dieser Reihenfolge

Die Chrome-Zonen sind auf **allen** Seiten identisch; die Elemente heißen auf
jeder Seite gleich (`chrome_header_bg`, `chrome_nav_1` …), weil Visualnamen nur
innerhalb einer Seite eindeutig sein müssen. Details und Begründung der Bauweise:
[`references/chrome-build.md`](references/chrome-build.md).

```bash
P="<Name>.Report/<Seitenname>.Page"
O="<...>/mockup-out/<Seitenslug>"

pbir add visual "$P" --from-json "$O/chrome-visuals.json"   # 1 Geometrie Chrome
pbir add visual "$P" --from-json "$O/pbir-visuals.json"     # 2 Visuals + Slicer
pbir add visual "$P" --from-json "$O/text-visuals.json"     # 3 Text-/Button-Kacheln
pbir pages background "$P" --color "<design.pageBackground>" --transparency 0

pbir batch validate "$O/chrome-batch.json"                  # 4 alle Setzungen
pbir batch plan     "$O/chrome-batch.json" --root "<Name>.Report"
pbir batch run      "$O/chrome-batch.json" --root "<Name>.Report"

bash "$O/analysis-commands.sh"                              # 5 Rest (CLI-only)
bash "$O/custom-commands.sh"                                # 6 Custom Visuals
```

**`custom-commands.sh` läuft zuletzt.** Es legt je Custom Visual einen
Platzhalter an und kopiert dann die fertige `visual.json` darüber — die Kopie
würde vorher gesetzte Formatierung überschreiben (sie steckt bereits vollständig
in der Datei).

**`pbir batch` ist der Hauptweg** (Schritt 4): Texte, Farben, Kachel-Container,
Anzeigeeinheiten und z-Order in **einem** Prozess — gemessen ~1,8 s je Seite
gegenüber gut drei Minuten mit Einzelaufrufen. `chrome-commands.sh` / `.ps1`
enthalten dieselben Setzungen als Einzelbefehle und bleiben der **Fallback**,
wenn `batch` an einer Eigenschaft scheitert.

Zwei Dinge kann `batch` nicht, deshalb stehen sie daneben:
- **Seitenhintergrund** — `set` kennt auf Seitenebene nur `display_name`,
  `display_option`, `height`, `is_hidden`, `page_type`, `visibility`, `width`.
  Also `pbir pages background … --color`.
- **Button-Aktionen, Sortierung, Top-N, Slicer-Vorauswahl, Annotationen** —
  dafür gibt es keinen Batch-Op; sie stehen in `analysis-commands.sh`
  (bewusst **ohne** `set -e`: ein Visualtyp ohne Datenbeschriftung darf den Rest
  nicht abbrechen).

**Text- und Button-Kacheln** (`kind: text|button` mit `content`) baut der Skill
als `shape` bzw. `actionButton` mit echtem `text.text` — **nicht** als Textbox.
Eine Textbox bliebe über die CLI leer (siehe Stolpersteine). Die Tool-Datei
`pbir-visuals.<Seite>.json` enthält sie noch als `textbox`; nimm deshalb die
Dateien aus `mockup-out/`.

**Gestaltung: Theme vor Overrides.** `mockup-out/theme-fragment.json` enthält die
Kachel-Optik aus `design` als `visualStyles`-`*`-Eintrag (Hintergrund, Rahmen
oder Schatten, Eckenradius, Titelgröße) und dazu die Farbrollen des Themes:
`background` (Seitenhintergrund), `foreground` (Ink aus `design.colors`),
`tableAccent` (Akzent) sowie `good`/`bad` aus `design.varianceColors` — also die
Abweichungsfarben der gewählten Palette (`teal` = Petrol/Rot, `ibcs` = Grün/Rot).
Kopfband-Fläche und -Text kommen aus `design.colors` und landen direkt in den
Chrome-Shapes; `headerStyle: "custom"` heißt: die Farben stehen in der Spec und
werden **nicht** aus light/dark/accent hergeleitet. Wer ein Theme pflegt, merged das
Fragment dorthin — Skill `reports:modifying-theme-json` bzw.
[`powerbi-design-framework`](../powerbi-design-framework/SKILL.md) — und
lässt die `background`/`border`/`dropShadow`-Schritte aus `chrome-batch.json`
weg. Dann steht die Gestaltung an einer Stelle statt an jedem Visual; per Visual
nur noch Ausnahmen.

**Darstellungsvarianten** (Tool 0.4.1) stecken schon in den erzeugten Dateien:

- **Small Multiples** (`analysis.smallMultiples`) gehen in den PBIR-Bucket
  **`Rows`** — verifiziert mit `pbir schema roles clusteredColumnChart` und einer
  Probebindung; `donutChart` lehnt die Rolle ab, und `pivotTable` meint mit
  `Rows` etwas anderes. Bei ChartKitchen, Deneb und Typen ohne diesen Bucket
  (`waterfallChart`, `card`, `treemap`, `map` …) wird daraus ein To-do
  (`SM_NOT_NATIVE` / `SM_NO_BUCKET`): nativ bauen oder ein Raster aus
  Einzelkacheln. Fehlt das Aufteilungsfeld, steht `SM_NO_FIELD` in
  `checklist.md` und `analysis-todos.md`.
- **Achse per Feldparameter** (`analysis.fieldParam`) heißt: **zuerst das
  Modell.** `model-todos.md` liefert das `te script`-Skript für die berechnete
  Tabelle (`NAMEOF`-Muster, `ParameterMetadata` auf der versteckten Spalte) —
  **prüfen lassen, nicht ungefragt ausführen**. Danach bindet
  `pbir-visuals.json` die Achse auf `<Name>.<Name>`. Ohne die Tabelle lehnt
  `--from-json` die **ganze** Datei ab. Den Slicer auf den Parameter schlägt
  `analysis-commands.sh` auskommentiert vor — das Mockup sieht die Kachel nicht
  vor, also entscheidet der Mensch.
- **`zones.header.navOn: false`** — keine `chrome_nav_*`-Buttons im Kopfband.
  Steht als Hinweis in `checklist.md` und `navigation.md`.

**Tool 0.4.3/0.4.4** stecken ebenfalls schon in den erzeugten Dateien
(Details: [`spec-format.md` → Tool 0.4.4](references/spec-format.md#tool-044-typografie-filterbereich-slicer-art-barrierefreiheit)):

- **Typografie** (`design.typography`, `visuals[].typography.scale`): je natives
  Visual `title.fontSize`/`subTitle.fontSize` in pt (px × 0,75, auf 0,5) in
  `chrome-batch.json`, im Theme-Fragment dazu `textClasses` (`largeTitle`,
  `title`, `label`). Nicht in `pbir-visuals.json` — `--from-json` kennt keinen
  Schriftschlüssel.
- **Seitennavigation in der Fußleiste** (`navPosition: "footer"`): die
  `chrome_nav_*`-Buttons sitzen rechtsbündig in der Fußzone, Schrift 9,5 × k,
  das Kopfband bleibt ohne Nav.
- **Filterbereich**: `heading` (oder keine Überschrift) und `text` als Shapes
  `chrome_filter_title`/`chrome_filter_text`, die Slicer rücken darunter.
  **Slicer-Art** → `data.mode` (`Dropdown`, `Basic`, `Between`),
  `general.orientation` (0 Liste, 1 Kacheln), Suche über
  `general.selfFilterEnabled` — mit `pbir schema describe slicer` und einem
  Probe-Report verifiziert.

**Analyse-Angaben** aus `visuals[].analysis` setzt `analysis-commands.sh`, soweit
`pbir` das kann: `sort` → `pbir visuals sort --field … --direction`, `topN` →
`pbir add filter … --type TopN --n … --by-table/--by-field`, `displayUnits`/
`decimals` → `pbir visuals labels --labelDisplayUnits/--labelPrecision`, `unit` →
Untertitel, `notes`/`workshop` → Annotation. Alles andere (Polarität bei nativen
Visuals, `timeGrain`, `cumulative`, `scaleGroup`, `message`, Sortierung nach Δ)
steht mit Code und Begründung in `analysis-todos.md` — durchgehen und dem
Menschen vorlegen, nicht stillschweigend übergehen.

`notes` je Visual landet als Annotation im Bericht, damit die Absicht dort bleibt:

```bash
pbir add annotation "$P/<visualId>.Visual" \
  --text "Absteigend nach AC sortieren." --author mockup-to-powerbi --category Documentation
```

## Schritt 5 · Navigation, Drill-through, Filter-Lesezeichen

**Erst wenn alle Seiten stehen** — Sprungziele müssen existieren. Die fertigen
Befehle stehen in `mockup-out/navigation.md`.

**Nav-Buttons** erledigt bereits `analysis-commands.sh` (bzw. der Fallback
`chrome-commands.sh`). Wenn ein Button in Desktop nicht springt:
`pbir visuals action --target` schreibt den Text 1:1 in `navigationSection`,
ohne auf den internen Seitennamen aufzulösen. Dann den `name` aus
`definition/pages/<ordner>/page.json` als `--target` setzen.

**Drill-through** — Zielseite bekommt das Feld, die Quelle braucht nichts. Das
Drill-Feld steht in der Spec unter `links[].drillField` (v3); bei v1/v2 leitet
der Konverter es aus dem Kategorie-Feld der Quellkachel ab (`category`, sonst
`rows`, `subcategory`, `series`):

```bash
pbir pages drillthrough "<Name>.Report/<Zielseite>.Page" --table "DimProduct" --field "Category"
pbir pages drillthrough "<Name>.Report/<Zielseite>.Page" --show
```

Dazu auf jede Drill-Zielseite ein Zurück-Button:

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
  "chrome_filter_bg" "chrome_filter_title" "chrome_filter_close" "mk_slicer_Year_p1" …
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

**Slicer-Vorauswahl** (`zones.filter.slicers[].default`) setzt
`analysis-commands.sh` als kategorialen Visual-Filter
(`pbir add filter <Tabelle> <Feld> -v "<Slicer>" --values <Wert>`). In Desktop
gegenprüfen, ob die Auswahl im Slicer sichtbar ist.

## Schritt 6 · ChartKitchen- und Deneb-Slots

`mockup-out/<Seitenslug>/chartkitchen-slots.json` enthält je Slot: `rect`,
`chartKitchenType`, den `orientation`-Wert **aus der Spec**
(`visuals[].chartKitchenMode`), `chartProps` (z. B. `invert: true`, wenn die
Analyse „kleiner = besser" sagt), `chartKitchenRoles` (Mockup-Rollen auf den
ChartKitchen-Feld-Vertrag gemappt), `analysis`, `workshop` und — falls
vorhanden — einen `nativeFallback`.

Die `warnings` je Slot sind die Stellen, an denen das Mapping aufpassen muss:
- **`rowType` fehlt** bei `orientation: waterfall`/`pnl` — ohne die Spalte
  (`sum`/`delta`) bleibt die Brücke leer. Das Mockup kennt die Rolle nicht.
- **`colline`** — die zweite Kennzahl gehört in `lineMeasure` (nur bei
  `orientation: columns`), nicht in `plan`/`previousYear`.
- **FC im Szenario ohne `fcFlag`/`forecast`** — dann zeichnet ChartKitchen
  keinen Forecast. `fcFlag` muss die **Zahl** 1/0 liefern, kein Boolean.
- `colgroup` nur bei `orientation: table`, `lineMeasure` nur bei `columns`.

- **Mit Referenz-Instanz:** replizieren nach
  [`chartkitchen-report/references/pbir-insertion.md`](../chartkitchen-report/references/pbir-insertion.md),
  Position aus `rect`, Rollennamen ausschließlich aus
  [`chartkitchen-report/references/field-contract.md`](../chartkitchen-report/references/field-contract.md).
  Das Rollen-Mapping des Skripts ist ein **Vorschlag** — was die Referenz-Instanz
  zeigt, gewinnt.
- **Ohne Referenz-Instanz:** Platzhalter setzen (Befehle in `commands.md`) oder
  `--ck-fallback` (Schritt 0), und im Abschlussbericht auflisten. Nicht raten.
- **Deneb-Slots** (`deneb-slots.json`): über den Skill
  [`deploy-to-powerbi`](../deploy-to-powerbi/SKILL.md) bzw. `pbir visuals deneb`.

### Schritt 6a · Custom Visuals (`engine: "custom"`)

Kacheln vom Typ `gantt` (`dataKitchenGantt`) und `pnl` (`pnlByDatenWG`) sind
Custom Visuals aus diesem Repo. `pbir` kennt ihre GUIDs nicht
(`Unknown visual type '<GUID>'`), und in einer `--from-json`-Datei reißt so ein
Eintrag die **ganze Datei** mit. Deshalb stehen sie **nicht** in
`pbir-visuals.json`, sondern als fertige PBIR-`visual.json` in
`<Seitenslug>/custom-visuals/` — mit `visual.visualType` = GUID und
`visual.query.queryState` je Bucket aus `customVisual.buckets`.

1. **`.pbiviz` importieren** (Power BI Desktop → Visualisierungen → … → *Visual
   aus Datei importieren*). Ohne Import bleibt die Kachel leer, auch wenn die
   JSON stimmt:
   `dataKitchenGantt/dist/*.pbiviz`, `pnlByDatenWG/dist/*.pbiviz` — fehlt der
   Build, im Visual-Ordner `pbiviz package` laufen lassen.
2. **Platzhalter + Kopie** — erledigt `custom-commands.sh` je Seite:
   ```bash
   pbir add visual shape "$P" -n "<id>" -x .. -y .. -w .. -h .. -t "<Titel>"
   D=$(find "<Name>.Report/definition/pages" -type d -name "<id>" | head -1)
   cp "$O/custom-visuals/<id>.visual.json" "$D/visual.json"
   pbir validate "<Name>.Report" --fields
   ```
   Der Platzhalter sorgt dafür, dass pbir Ordner, Visualname und Seiteneintrag
   korrekt anlegt; die Kopie tauscht danach nur den Inhalt.
   (`pbir ls "<Seite>.Page" --json` nennt zu jedem Visual auch seinen `path` —
   Alternative zu `find`.)
3. **Pflichtrollen prüfen.** `checklist.md` und `plan.json → issues` melden leere
   Pflichtrollen: `dataKitchenGantt` braucht `task` und `start`, `pnlByDatenWG`
   braucht `levels` (oder `account`) und `ac`. Ohne sie zeichnet das Visual
   nichts — im Workshop nachtragen, nicht raten.
4. **Zweiter Lauf:** nur kopieren, der Platzhalter existiert schon.
   `delta-batch.json` fasst Custom Visuals bewusst nicht an — die neu erzeugte
   `visual.json` enthält Position, Größe, Bindung und Formatierung vollständig.

`pbir visuals bind` kann bei einem Custom Visual nur Rollen bedienen, die in der
`queryState` bereits stehen. Deshalb enthält die erzeugte Datei alle Rollen der
Spec von Anfang an; weitere Rollen aus der `capabilities.json` (z. B. `progress`,
`planStart`, `period`, `signConvention`) in Desktop nachbinden.

## Schritt 7 · Verifizieren

```bash
pbir validate "<Name>.Report" --fields
te validate -m "<Name>.SemanticModel" --errors-only

# Abnahme gegen das Sollbild aus der Spec
python .claude/skills/mockup-to-powerbi/scripts/mockup_verify.py \
  "<Name>.Report" "<...>/mockup-out/acceptance.json"

export PYTHONIOENCODING=utf-8   # sonst brechen die beiden Python-Skripte an Umlauten ab
python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py "<Name>.Report" \
  --check --zones "<...>/mockup-out/<Seitenslug>/zones.json" --grid 0 \
  --skip-types shape,textbox,actionButton,image,slicer --pages "<Seite1>,<Seite2>"
python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py "<Name>.Report" \
  --zones "<...>/mockup-out/<Seitenslug>/zones.json" --pages "<Seite1>,<Seite2>" --html
```

`mockup_verify.py` liest den gebauten Bericht über `pbir ls --json` und
`pbir cat` (keine Regex auf Rohdateien) und liefert eine Abnahme-Tabelle: je
Seite jedes erwartete Visual mit Name, Typ, Rechteck (±1 px) und Bucket-Bindung,
dazu Lesezeichen, Drill-through-Felder und den Spec-Hash. Exit-Code 0 =
abgenommen, 1 = Abweichungen. ChartKitchen- und Deneb-Slots gelten als „offen",
nicht als Fehler. Visuals, die im Bericht stehen, aber nicht im Mockup, werden
unter „nur im Bericht" **gemeldet, nie gelöscht**.

Den Spec-Hash nach dem Bau am Report ablegen, damit der nächste Lauf weiß, was
gebaut wurde:

```bash
pbir add annotation "<Name>.Report" --name mockup-spec-hash --value "<meta.specHash>"
```

- Alle Seiten teilen dieselbe Inhaltszone, deshalb reicht **eine** `zones.json`.
- `--pages` erwartet bei `bulk_restyle.py` und `render_wireframe.py` eine
  **kommagetrennte** Liste (`--pages "Übersicht,Detail"`), nicht mehrere
  Argumente.
- `--grid 0`, weil MockupKitchen-Splits selten auf dem 8-px-Raster landen. Wer
  das Raster will: `pbir visuals snap "<Seite>.Page/*.Visual" -g 8 -d` — das
  verschiebt aber gegenüber dem Mockup.
- `--skip-types …`, weil Chrome-Elemente absichtlich außerhalb der Content-Zone
  liegen; ohne den Filter meldet der Linter sie alle.
- Meldet der Linter „dropShadow aktiv (Spec: keine Schatten)", prüft er gegen
  **seine** Design-Spec, nicht gegen das Mockup. Sagt `design.tileStyle: shadow`,
  ist das kein Fehler — entweder die Design-Spec angleichen oder die Meldung
  begründet abhaken.
- Das Wireframe zeigt Proportionen und Lücken; Ergebnis dem Menschen zeigen.

## Schritt 8 · Doku und PowerPoint

**Wann:** wenn der Mensch ein Workshop-Protokoll, eine Zusammenfassung oder eine
Präsentation zum Mockup will — als Abschluss nach dem Bauen oder ganz ohne PBIP
direkt nach dem Workshop. Der Prompt aus dem Tool bittet am Ende ausdrücklich
darum.

```bash
python .claude/skills/mockup-to-powerbi/scripts/mockup_to_docs.py \
  "<Projekt>/mockup-spec.json" --out "<Projekt>" [--lang en]
```

Ausgabe:

- **`WORKSHOP-DOKU.md`** — nur wenn sie noch nicht neben der Spec liegt (das Tool
  exportiert sie selbst); `--force-md` überschreibt. Enthält Berichtskopf
  (Teilnehmende, Zielgruppe, Ziel, Entscheidung, Datenstand), je Seite die
  **Fragestellung** und eine Kachel-Tabelle mit Feldern, Analyse-Kurzform,
  Priorität und Status, dazu den **Kennzahlen-Steckbrief** (Alias, Definition,
  Einheit, Ziel, Owner, Quelle, bestätigt ☑/☐), neue Kennzahlen, offene Punkte
  (inkl. `workshop.openQuestion` und der `issues`) und Hinweise.
- **`WORKSHOP-DOKU.pptx`** — 16:9, nüchtern (Ink `#0F1E2E`, Akzent aus
  `design.accent`, helle Flächen). Folien: Titel · Berichtskopf ·
  Gestaltungsentscheidungen · **je Seite** ein Seitenbild und eine Kachel-Tabelle
  · Navigation und Drill · Kennzahlen-Steckbrief · neue Kennzahlen · offene
  Punkte · nächste Schritte.
- **`--lang en`** erzeugt `WORKSHOP-DOKU.en.md` und `WORKSHOP-DOKU.en.pptx`;
  ohne Angabe entscheidet `meta.lang` aus der Spec.

**Seitenbilder:** Liegen `page-<Index>-<Seitenslug>.png` neben der Spec (Export
„Alle Dateien" im Tool), werden sie maßstäblich in die Seitenfolie eingebettet.
Fehlen sie, zeichnet das Skript wie bisher ein Wireframe aus nativen Shapes —
das kann der Mensch im Workshop direkt verschieben und beschriften. Das Skript
sagt am Ende, welchen Weg es genommen hat.

Die PowerPoint braucht `python-pptx` (auf diesem Rechner vorhanden):

```bash
python -c "import pptx" && echo vorhanden || echo "fehlt: pip install python-pptx"
```

Fehlt das Paket, schreibt das Skript trotzdem die Markdown-Fassung, meldet den
fehlenden Import und endet mit Exit-Code 1. Dann entweder `pip install
python-pptx` (nach Rückfrage beim Menschen) oder die fertige `WORKSHOP-DOKU.md`
an den Skill `anthropic-skills:pptx` geben.

## Schritt 9 · Abschlussbericht

- **Was liegt wo:** Seiten, Anzahl Visuals je Engine und Seite, Dateien in
  `mockup-out/`, Doku-Dateien, Ergebnis der Abnahme (`mockup_verify.py`).
- **Offene Punkte:** leere Pflichtrollen (die Kacheln stehen **nicht** im
  Bericht), leere Pflichtrollen von Custom Visuals (`plan.json → issues`),
  nicht importierte `.pbiviz`, ChartKitchen-Slots ohne Referenz-Instanz,
  Analyse-To-dos, neu
  angelegte Kennzahlen (DAX bestätigt?), nicht aufgelöste Felder, nicht
  bestätigte Steckbriefe, Hinweise aus `checklist.md`.
- **Nächste Schritte in Desktop:** Projekt öffnen, Theme prüfen, ChartKitchen-
  Slots füllen, **Lesezeichen-Zustände einmal aktualisieren**, Button-Navigation
  und Drill-through testen, Schriftgrößen der Chrome-Texte gegenprüfen,
  Alt-Texte und `tabOrder` nachziehen.

---

## Tests

```bash
python .claude/skills/mockup-to-powerbi/tests/run_tests.py
```

Golden-Vergleich über acht Fixtures (specVersion 1, 2, 3, Burger-Filter,
ChartKitchen ohne Referenz-Instanz, voller Analyse-Block, Custom Visuals,
Darstellungsvarianten aus 0.4.1, Typografie/Filterbereich/Fußleisten-Nav/
Barrierefreiheit aus 0.4.4), Negativtests der
Validierung (kaputte Spec, unbekannte Hauptversion, doppelte Seitennamen — je
einmal mit dem Paket `jsonschema` und einmal mit dem eingebauten Validator) und
Einheitenprüfungen. Reine Standardbibliothek, kein Power BI nötig. Nach
**bewussten** Änderungen an den Skripten: `--update`, dann den Diff der Goldens
ansehen.

## Stolpersteine (alle real aufgelaufen, pbir 0.9.32)

| Fall | Was passiert | Umgang |
|---|---|---|
| `--from-json` mit Extra-Schlüssel | `unknown key(s): text` und **keine** Visuals werden angelegt | Nur `visual_type, name, title, x, y, width, height, fields` verwenden |
| Fehlendes Feld in `fields` | `Field '…' not found in model`, die **ganze** Datei wird abgelehnt | Modell zuerst (`te add --save`), danach erneut; pbir sieht neue Measures sofort |
| Kachel mit leerer Pflichtrolle | Würde als Visual ohne Bindung importiert oder die Datei killen | Steht **nicht** in `pbir-visuals.json` (wie im Tool) und taucht in `checklist.md` unter „Nicht gebaute Kacheln" auf |
| `shape.tileShape` = `roundedRectangle` | `Validation error: … not in [...]`, und mit `set -euo pipefail` bricht das ganze Chrome-Skript ab | Der Enum heißt **`rectangleRounded`**; Radius über `shape.rectangleRoundedCurve` |
| `title` bei einer Textbox | landet im Container-Titel, **nicht** im Textinhalt | Textzeilen und Text-Kacheln als `shape` bauen (siehe `chrome-build.md`) |
| `pbir set …general.paragraphs` | wird als String-Literal geschrieben statt als Array — die Textbox bleibt leer, `pbir validate` meckert **nicht** | Nicht benutzen. Text über `shape` + `text.text`, oder `pbir add title`/`add subtitle` (schreiben korrekte `paragraphs`, sind aber auf 24 pt/14 pt und (20, 20) fest und müssen per `pbir visuals position` verschoben werden) |
| Custom Visual per `pbir` anlegen | `pbir add visual <GUID>` und `--from-json` mit einer GUID melden beide `Unknown visual type '<GUID>'`; in `--from-json` fällt die **ganze Datei** aus (auch mit `--rawdog`) | Platzhalter-`shape` anlegen, dann die erzeugte `visual.json` daraufkopieren (`custom-commands.sh`). `pbir validate --fields` und `pbir ls --json` nehmen sie an |
| `pbir visuals bind` am Custom Visual | `Role 'rowType' not valid for <GUID>. Available: levels, ac` — es gehen nur Rollen, die in der `queryState` schon stehen | Alle Rollen von Anfang an in die `visual.json` schreiben (macht das Skript); Rest in Desktop binden |
| `visualContainerObjects` von Hand | `title: {...} is not of type 'array'` — `pbir batch`/`set` bricht daran ab | Container-Objekte sind **Arrays** von `{properties: …}`, Zahlen Literale mit D-Suffix (`"12D"`). Das Skript schreibt genau die Form, die `pbir add visual` selbst erzeugt |
| Custom Visual kopiert, aber leer | die `.pbiviz` ist nicht im Bericht importiert | `dataKitchenGantt/dist/*.pbiviz` bzw. `pnlByDatenWG/dist/*.pbiviz` in Desktop importieren; fehlt der Build: `pbiviz package` |
| `pbir add page --no-title` | Option existiert nicht, steht aber im Hilfetext | Seite anlegen, dann `pbir rm "<Seite>.Page/Title.Visual" -f` |
| `pbir rm visual <pfad>` | „Got unexpected extra argument(s)" | Richtig ist `pbir rm "<pfad>" -f` |
| z-Order | `--from-json` setzt immer `z = 0`; Chrome-Flächen und Inhalt liegen gleichauf | `pbir visuals position … --z`, im Batch `set` auf `position.z` (beides verifiziert) |
| `pbir batch` + Zusatzschlüssel | `$comment` o. Ä. lässt `pbir batch validate` die Datei ablehnen (`additionalProperties: false`) | Keine Kommentare in die Batch-Spec; Erklärungen gehören in `commands.md` |
| `pbir batch` + Seitenhintergrund | `Unknown page property 'background.color'` — und der Fehler killt den **ganzen** Lauf, auch mit `continue_on_error` | Seitenhintergrund per `pbir pages background … --color` **vor** dem Batch |
| `pbir batch` Exit-Code | Einzelne Schritte mit `continue_on_error: true` laufen weiter, der Gesamt-Exit ist trotzdem ≠ 0 | Die Ergebnistabelle lesen, nicht nur den Exit-Code |
| `zorder`-Op im Batch | `zorder.action must be 'front' or 'back'` — keine Zahl | Numerische Ebenen über `set` → `position.z` |
| Button-Navigation | `pbir visuals action --target` schreibt den Text 1:1 in `navigationSection`, ohne auf den internen Seitennamen aufzulösen | In Desktop testen; springt es nicht, den internen Namen aus `page.json` (`name`, z. B. `c98a70696fe77757`) als `--target` setzen |
| Lesezeichen ohne Zustand | `pbir add bookmark` legt nur die Hülle an; `bookmarks visuals` bestimmt die betroffenen Visuals, aber die Sichtbarkeits-Momentaufnahme entsteht erst in Desktop | Lesezeichen anlegen, Grundzustand per `pbir visuals hide` setzen, im Abschlussbericht „in Desktop einmal aktualisieren" nennen |
| Ein Lesezeichen für mehrere Seiten | funktioniert nicht — ein Lesezeichen hält den Zustand genau einer Seite | Je Seite ein Paar „Filter öffnen · \<Seite\>" / „Filter schließen · \<Seite\>" (erzeugt `navigation.md` automatisch) |
| Zweiter Lauf | `pbir add visual --from-json` scheitert an vorhandenen Namen (die IDs sind stabil) | `delta-batch.json` laufen lassen: `move`/`resize` plus `bind` mit `clear`+`add` (verifiziert idempotent, keine doppelten Projektionen) |
| Umlaute in der Konsole | Ausgabe zeigt `Î”`/`Ãœ`, die Dateien sind aber sauberes UTF-8 | Nicht „reparieren". Zum Prüfen die JSON lesen, nicht die Konsole |
| Python-Skripte des Design-Frameworks | `UnicodeEncodeError: 'charmap'` auf Windows-Konsolen | `export PYTHONIOENCODING=utf-8` (bzw. `$env:PYTHONIOENCODING='utf-8'`) |
| `--pages` bei `bulk_restyle.py` / `render_wireframe.py` | erwartet **eine** kommagetrennte Zeichenkette; mehrere Argumente werden nicht als Seitenliste gelesen | `--pages "Seite A,Seite B"` |
| Überlappende Visuals | `pbir add visual` kennt `--force` gegen Überlappung/Canvas-Rand; bei `--from-json` schlug das Anlegen überlappender Chrome-Elemente **nicht** fehl | Erst ohne `--force` versuchen |
| Laufzeit von `chrome-commands.sh` | ein `pbir`-Prozessstart je Property (gemessen ~1,5 s); mit Kachel-Formatierung sind es je Seite über 120 Aufrufe, also gut drei Minuten | `chrome-batch.json` nehmen (~1,8 s je Seite). Das Shell-Skript bleibt der Fallback |
| `python-pptx` fehlt | `mockup_to_docs.py` meldet es und endet mit 1, die Markdown-Datei steht trotzdem | `pip install python-pptx` (Rückfrage!) oder Markdown an `anthropic-skills:pptx` geben |

## Leitplanken
- Nie ungefragt in `*.Report/` oder `*.SemanticModel/` schreiben; `mockup-out/`
  ist der Übergabepunkt, Plan + Freigabe + Backup gehen voraus.
- Nie ein ChartKitchen-`visual.json` raten. Ohne Referenz-Instanz nur Platzhalter
  oder `--ck-fallback`.
- Custom Visuals nur über die erzeugte `visual.json` einspielen — nie eine GUID
  in `pbir-visuals.json` schreiben, das killt die ganze Datei. Rollennamen
  ausschließlich aus der `capabilities.json` des Visuals.
- Keine `.pbix` anfassen.
- Bei mehrdeutigem Feld-Mapping oder unklarer Property: **offene Entscheidung**
  vorlegen, nicht raten.
- Kein zehnter Bucket, kein erfundener Seitenname: Was nicht in der Spec steht,
  wird nachgefragt. `auto`-Werte im Analyse-Block sind Vorschläge, keine
  Entscheidungen.
- Farben, Schrift und Theme regelt der Skill
  [`powerbi-design-framework`](../powerbi-design-framework/SKILL.md); dieser hier
  regelt Struktur, Position, Bindung, Analyse und die Container-Formatierung aus
  `design`.

## Referenzen
- [`references/spec-format.md`](references/spec-format.md) — `mockup-spec.json`
  vollständig (specVersion 1, 2 und 3, dazu die Erweiterungen aus Tool 0.4 und
  0.4.1): Berichtskopf, Seiten, Design mit Varianz-Palette und Farbsatz, Zonen,
  Filter-Modi, `header.navOn`, Links, Analyse-Block, **Darstellungsvarianten**
  (0.4.1), **Typografie, Fußleisten-Navigation, Filterbereich mit Slicer-Art und
  Barrierefreiheit** (0.4.3/0.4.4)
  — Small Multiples → Bucket `Rows`, Achse per Feldparameter —, Steckbriefe,
  Issues, Rollen-Vokabular, Engines, Rollen → pbir-Buckets, Rollen →
  ChartKitchen, **Custom Visuals** (GUIDs, Datenrollen, Pflichtrollen,
  Einspielweg).
- [`references/mockup-spec.schema.json`](references/mockup-spec.schema.json) —
  Prüfschema (Draft 2020-12) für `--validate`.
- [`references/chrome-build.md`](references/chrome-build.md) — wie Kopfband,
  Nav-Leiste, Filter-Panel und Fußleiste als native Elemente entstehen, mit
  verifizierten Befehlen, dazu der Batch-Weg und die z-Ordnung.
- [`references/example/`](references/example/) — `mockup-spec.v3.json` (von Hand
  um die Seiten „Projekt & GuV" und „Varianten" sowie die 0.4.4-Schlüssel
  erweitert, siehe dortige README) mit `AGENT-BRIEF.v3.md` und `WORKSHOP-DOKU.v3.md` (Tool-Export, noch
  im 0.3-Stand),
  `mockup-spec.v2.json` (mehrseitig) und `mockup-spec.json` (v1) zum Trockenlauf,
  dazu die daraus erzeugte `pbir-visuals.json`.
- Skripte: `scripts/mockup_spec.py` (lesen, heben, prüfen — gemeinsamer
  Unterbau), `scripts/mockup_to_pbir.py` (Bericht), `scripts/mockup_verify.py`
  (Abnahme), `scripts/mockup_to_docs.py` (Workshop-Doku + PowerPoint). Alle
  brauchen nur die Standardbibliothek; `mockup_to_docs.py` zusätzlich
  `python-pptx` für die Folien, `--validate` nutzt `jsonschema`, wenn vorhanden.
- Tests: `tests/run_tests.py` mit `tests/fixtures/` und `tests/golden/`.
