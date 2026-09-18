---
name: mockup-to-powerbi
description: >
  Überträgt eine mit MockupKitchen byDatenWG skizzierte Berichtsseite
  (`mockup-spec.json` + `AGENT-BRIEF.md` + `pbir-visuals.json`) in ein
  bestehendes PBIP-Projekt: Felder gegen das Semantikmodell abgleichen, neue
  Kennzahlen mit `te` anlegen, Seite und Canvas setzen, Chrome-Zonen (Kopfband,
  Nav-Leiste, Filter-Panel, Fußleiste) als Shapes/Buttons bauen, native Visuals
  und Slicer per `pbir add visual --from-json` platzieren, ChartKitchen- und
  Deneb-Slots vorbereiten, am Ende `pbir validate --fields`, `te validate
  --errors-only`, Design-Linter und Wireframe. Auslösen, wenn der Nutzer
  sinngemäß sagt „setz mein Mockup in Power BI um", „mockup-spec.json in mein
  PBIP übertragen", „die Workshop-Skizze bauen", „MockupKitchen-Export
  umsetzen", „aus dem AGENT-BRIEF eine Report-Seite machen" — auch ohne das
  Wort „Mockup", wenn die drei Exportdateien im Projektordner liegen.
---

# MockupKitchen → Power BI (PBIP/PBIR)

Gegenstück zu **MockupKitchen byDatenWG** (`mockup-kitchen.html`): dort skizziert
ein Mensch im Workshop eine Berichtsseite, hier wird sie gebaut. Arbeitet
ausschließlich lokal über die CLIs `pbir` und `te` — kein Server, kein MCP.

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
2. **Exportdateien da?** `mockup-spec.json` ist die Pflichtdatei.
   `AGENT-BRIEF.md` ist die menschenlesbare Fassung derselben Daten (lesen, aber
   nicht als zweite Wahrheit behandeln), `pbir-visuals.json` ist optional — das
   Skript erzeugt sie identisch neu.
3. **CLIs da?** `pbir --version`, `te --help`. Beide sind Preview; `te` läuft bis
   30.09.2026.
4. **ChartKitchen in der Spec?** Wenn `visuals[].engine == "ck"` vorkommt: gibt es
   im Report bereits eine **Referenz-Instanz** des Custom Visuals
   (GUID `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D`)?
   - ja → replizieren nach
     [`chartkitchen-report/references/pbir-insertion.md`](../chartkitchen-report/references/pbir-insertion.md)
   - nein → **nicht raten.** Platzhalter-Strategie: pro Slot ein `shape` an der
     Slot-Position mit Text „ChartKitchen: \<Typ\>" (Befehle stehen in
     `mockup-out/commands.md`) und den Menschen bitten, das Visual **einmal** in
     Desktop zu platzieren und 2–3 Felder zuzuweisen. Danach kann der Skill
     replizieren.
5. **Desktop geschlossen?** Kurz nachfragen, bevor geschrieben wird.

## Schritt 1 · Spec lesen und Felder gegen das Modell abgleichen

Bausteine erzeugen (schreibt nur nach `--out`, fasst den Report nicht an):

```bash
python .claude/skills/mockup-to-powerbi/scripts/mockup_to_pbir.py \
  "<Projekt>/mockup-spec.json" --out "<Projekt>/mockup-out" \
  --report "<Name>.Report"
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
  enthält Beschreibung und einen DAX-**Vorschlag** samt fertigem `te add`-Befehl.
  DAX vom Menschen bestätigen lassen, **dann** anlegen:
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
- Seite: Name, neu oder bestehend, Canvas `canvas.width × canvas.height`
- Chrome: welche Zonen mit welchen Maßen, wie viele Shapes/Buttons/Slicer
- Native Visuals: Anzahl, Typen, Feldbindungen
- ChartKitchen-Slots: Anzahl, Typ → `chart.orientation`, Referenz-Instanz ja/nein
- Deneb-Slots: Anzahl
- Modelländerungen: jede neue Kennzahl mit DAX-Vorschlag
- Offene Punkte aus `mockup-out/checklist.md`

Dann **warten**. Nach Freigabe sichern:

```bash
pbir backup "<Name>.Report"     # oder: git add -A && git commit -m "vor Mockup-Umsetzung"
```

## Schritt 3 · Seite anlegen und Canvas setzen

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

## Schritt 4 · Chrome bauen

Geometrie kommt aus `mockup-out/chrome-visuals.json`, Text/Farbe/Aktion aus
`mockup-out/chrome-commands.sh` (bzw. `.ps1`). Details und Begründung der
Bauweise: [`references/chrome-build.md`](references/chrome-build.md).

```bash
pbir add visual "<Name>.Report/<Seite>.Page" --from-json "<...>/mockup-out/chrome-visuals.json"
```

Koordinaten **exakt** aus den Zonen übernehmen; nichts „optisch nachjustieren".

## Schritt 5 · Native Visuals und Slicer

```bash
pbir add visual "<Name>.Report/<Seite>.Page" --from-json "<...>/mockup-out/pbir-visuals.json"
```

Die Datei ist inhaltlich identisch mit der Tool-Ausgabe `pbir-visuals.json` —
egal welche der beiden verwendet wird. Titel stehen bereits drin
(`title` → Container-Titel). Untertitel aus der Spec (`subtitle`) danach setzen:

```bash
pbir set "<Seite>.Page/<visualId>.Visual.subTitle.show" --value true
pbir set "<Seite>.Page/<visualId>.Visual.subTitle.text" --value "in T€"
```

`notes` je Visual als Annotation ablegen, damit die Absicht im Bericht bleibt:

```bash
pbir add annotation "<Seite>.Page/<visualId>.Visual" \
  --text "Absteigend nach AC sortieren." --author mockup-to-powerbi --category Documentation
```

**Zuletzt** `chrome-commands.sh` laufen lassen — es setzt Texte, Farben,
Button-Aktionen **und** hebt die Inhalts-Visuals per z-Order über die
Chrome-Flächen (`--from-json` vergibt immer `z = 0`).

```bash
bash "<...>/mockup-out/chrome-commands.sh"      # PowerShell: chrome-commands.ps1
```

## Schritt 6 · ChartKitchen- und Deneb-Slots

`mockup-out/chartkitchen-slots.json` enthält je Slot: `rect`, `chartKitchenType`,
den vorgeschlagenen `orientation`-Wert, `chartKitchenRoles` (Mockup-Rollen bereits
auf den ChartKitchen-Feld-Vertrag gemappt) und — falls vorhanden — einen
`nativeFallback`.

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
  --check --zones "<...>/mockup-out/zones.json" --grid 0 \
  --skip-types shape,textbox,actionButton,image,slicer --pages "<Seite>"
python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py "<Name>.Report" \
  --zones "<...>/mockup-out/zones.json" --pages "<Seite>" --html
```

- `--grid 0`, weil MockupKitchen-Splits selten auf dem 8-px-Raster landen. Wer
  das Raster will: `pbir visuals snap "<Seite>.Page/*.Visual" -g 8 -d` — das
  verschiebt aber gegenüber dem Mockup.
- `--skip-types …`, weil Chrome-Elemente absichtlich außerhalb der Content-Zone
  liegen; ohne den Filter meldet der Linter sie alle.
- Das Wireframe zeigt Proportionen und Lücken; Ergebnis dem Menschen zeigen.

## Schritt 8 · Abschlussbericht

- **Was liegt wo:** Seite, Anzahl Visuals je Engine, Dateien in `mockup-out/`.
- **Offene Punkte:** leere Pflichtrollen, ChartKitchen-Slots ohne Referenz-Instanz,
  neu angelegte Kennzahlen (DAX bestätigt?), nicht aufgelöste Felder, Hinweise
  aus `checklist.md`.
- **Nächste Schritte in Desktop:** Projekt öffnen, Theme prüfen, ChartKitchen-
  Slots füllen, Button-Navigation testen, ausklappbares Filter-Panel als Bookmark
  bauen (das kann `pbir` nicht), Schriftgrößen der Chrome-Texte gegenprüfen.

---

## Stolpersteine (alle real aufgelaufen, pbir 0.9.32)

| Fall | Was passiert | Umgang |
|---|---|---|
| `--from-json` mit Extra-Schlüssel | `unknown key(s): text` und **keine** Visuals werden angelegt | Nur `visual_type, name, title, x, y, width, height, fields` verwenden |
| Fehlendes Feld in `fields` | `Field '…' not found in model`, die **ganze** Datei wird abgelehnt | Modell zuerst (`te add --save`), danach erneut; pbir sieht neue Measures sofort |
| `title` bei einer Textbox | landet im Container-Titel, **nicht** im Textinhalt | Textzeilen als `shape` bauen (siehe unten) |
| `pbir set …general.paragraphs` | wird als String-Literal geschrieben statt als Array — die Textbox bleibt leer, `pbir validate` meckert **nicht** | Nicht benutzen. Text über `shape` + `text.text`, oder `pbir add title`/`add subtitle` (schreiben korrekte `paragraphs`, sind aber auf 24 pt/14 pt und (20, 20) fest und müssen per `pbir visuals position` verschoben werden) |
| `pbir add page --no-title` | Option existiert nicht, steht aber im Hilfetext | Seite anlegen, dann `pbir rm "<Seite>.Page/Title.Visual" -f` |
| `pbir rm visual <pfad>` | „Got unexpected extra argument(s)" | Richtig ist `pbir rm "<pfad>" -f` |
| z-Order | `--from-json` setzt immer `z = 0`; Chrome-Flächen und Inhalt liegen gleichauf | `pbir visuals position … --z` (macht `chrome-commands.sh` am Ende automatisch) |
| Button-Navigation | `pbir visuals action --target` schreibt den Text 1:1 in `navigationSection`, ohne auf den internen Seitennamen aufzulösen | In Desktop testen; springt es nicht, den internen Namen aus `page.json` (`name`, z. B. `c98a70696fe77757`) als `--target` setzen |
| Umlaute in der Konsole | Ausgabe zeigt `Î”`/`Ãœ`, die Dateien sind aber sauberes UTF-8 | Nicht „reparieren". Zum Prüfen die JSON lesen, nicht die Konsole |
| Python-Skripte des Design-Frameworks | `UnicodeEncodeError: 'charmap'` auf Windows-Konsolen | `export PYTHONIOENCODING=utf-8` (bzw. `$env:PYTHONIOENCODING='utf-8'`) |
| Überlappende Visuals | `pbir add visual` kennt `--force` gegen Überlappung/Canvas-Rand; bei `--from-json` schlug das Anlegen überlappender Chrome-Elemente **nicht** fehl | Erst ohne `--force` versuchen |
| Laufzeit von `chrome-commands.sh` | ein `pbir`-Prozessstart je Property, bei zehn Chrome-Elementen ~90 Aufrufe und über zwei Minuten | Im Hintergrund laufen lassen, nicht abbrechen. Wer es schneller braucht: dieselben Setzungen als `pbir batch`-Spec (`pbir batch schema --version 2`, `validate` → `plan` → `run`) |

## Leitplanken
- Nie ungefragt in `*.Report/` oder `*.SemanticModel/` schreiben; `mockup-out/`
  ist der Übergabepunkt, Plan + Freigabe + Backup gehen voraus.
- Nie ein ChartKitchen-`visual.json` raten. Ohne Referenz-Instanz nur Platzhalter.
- Keine `.pbix` anfassen.
- Bei mehrdeutigem Feld-Mapping oder unklarer Property: **offene Entscheidung**
  vorlegen, nicht raten.
- Farben, Schrift und Theme regelt der Skill
  [`powerbi-design-framework`](../powerbi-design-framework/SKILL.md); dieser hier
  regelt Struktur, Position und Bindung.

## Referenzen
- [`references/spec-format.md`](references/spec-format.md) — `mockup-spec.json`
  vollständig: Felder, Rollen-Vokabular, Engines, Rollen → pbir-Buckets,
  Rollen → ChartKitchen.
- [`references/chrome-build.md`](references/chrome-build.md) — wie Kopfband,
  Nav-Leiste, Filter-Panel und Fußleiste als native Elemente entstehen, mit
  verifizierten Befehlen.
- [`references/example/`](references/example/) — Beispiel-Spec und die daraus
  erzeugte `pbir-visuals.json` zum Trockenlauf.
