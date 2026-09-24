# Befehlsfolge · Typografie- und Filter-Testfall

2 Seite(n), Canvas 1920×1080, Spec-Hash `typofilter1`. Reihenfolge einhalten. Vor dem ersten schreibenden Befehl: Power BI Desktop schließen, `pbir backup` oder Git-Commit.

```bash
# 0 · Ausgangslage sichern
pbir backup "Test.Report"

# 1 · Modell zuerst (siehe model-todos.md), dann prüfen
te validate -m "Demo-Modell" --errors-only
```

## 1 · Seite „Übersicht"

```bash
# Seite anlegen (legt automatisch eine Textbox 'Title' an — entfernen)
pbir add page "Test.Report/Ubersicht.Page" -n "Übersicht" -w 1920 -h 1080
pbir rm "Test.Report/Übersicht.Page/Title.Visual" -f
#   Bestehende Seite stattdessen nur umskalieren:
# pbir pages resize "Test.Report/Übersicht.Page" -w 1920 -h 1080

# Chrome-Geometrie (Flächen, Textrahmen, Buttons)
pbir add visual "Test.Report/Übersicht.Page" --from-json "<out>/Ubersicht/chrome-visuals.json"

# Native Visuals + Slicer
pbir add visual "Test.Report/Übersicht.Page" --from-json "<out>/Ubersicht/pbir-visuals.json"

# Text-/Button-Kacheln (als shape/actionButton, nicht als textbox)
pbir add visual "Test.Report/Übersicht.Page" --from-json "<out>/Ubersicht/text-visuals.json"

# Seitenhintergrund (kann `pbir batch` nicht — nur als CLI-Aufruf)
pbir pages background "Test.Report/Übersicht.Page" --color "#F4F4F1" --transparency 0

# Hauptweg: alle uebrigen Setzungen in EINEM Lauf (Texte, Farben,
#           Kachel-Container, Anzeigeeinheiten, z-Order)
pbir batch validate "<out>/Ubersicht/chrome-batch.json"
pbir batch plan "<out>/Ubersicht/chrome-batch.json" --root "Test.Report"
pbir batch run "<out>/Ubersicht/chrome-batch.json" --root "Test.Report"

# Fallback, wenn batch streikt (~1,5 s je Aufruf, läuft ein paar Minuten)
# bash "<out>/Ubersicht/chrome-commands.sh"   # PowerShell: chrome-commands.ps1

# Analyse: Sortierung, Top-N, Slicer-Vorauswahl, Annotationen
bash "<out>/Ubersicht/analysis-commands.sh"
```

> Seitennavigation in der Fußleiste (`navPosition: "footer"`): 2 Buttons `chrome_nav_*` rechtsbündig, Schrift 14.5 pt; das Kopfband bleibt ohne Nav.
> Slicer „Date" ist ein Datumsbereich: `DimDate.Date` muss vom Typ Date/DateTime sein, sonst zeigt Power BI keinen Kalender (`te get`).

## 2 · Seite „Detail"

```bash
# Seite anlegen (legt automatisch eine Textbox 'Title' an — entfernen)
pbir add page "Test.Report/Detail.Page" -n "Detail" -w 1920 -h 1080
pbir rm "Test.Report/Detail.Page/Title.Visual" -f
#   Bestehende Seite stattdessen nur umskalieren:
# pbir pages resize "Test.Report/Detail.Page" -w 1920 -h 1080

# Chrome-Geometrie (Flächen, Textrahmen, Buttons)
pbir add visual "Test.Report/Detail.Page" --from-json "<out>/Detail/chrome-visuals.json"

# Native Visuals + Slicer
pbir add visual "Test.Report/Detail.Page" --from-json "<out>/Detail/pbir-visuals.json"

# Seitenhintergrund (kann `pbir batch` nicht — nur als CLI-Aufruf)
pbir pages background "Test.Report/Detail.Page" --color "#F4F4F1" --transparency 0

# Hauptweg: alle uebrigen Setzungen in EINEM Lauf (Texte, Farben,
#           Kachel-Container, Anzeigeeinheiten, z-Order)
pbir batch validate "<out>/Detail/chrome-batch.json"
pbir batch plan "<out>/Detail/chrome-batch.json" --root "Test.Report"
pbir batch run "<out>/Detail/chrome-batch.json" --root "Test.Report"

# Fallback, wenn batch streikt (~1,5 s je Aufruf, läuft ein paar Minuten)
# bash "<out>/Detail/chrome-commands.sh"   # PowerShell: chrome-commands.ps1

# Analyse: Sortierung, Top-N, Slicer-Vorauswahl, Annotationen
bash "<out>/Detail/analysis-commands.sh"
```

> Seitennavigation in der Fußleiste (`navPosition: "footer"`): 2 Buttons `chrome_nav_*` rechtsbündig, Schrift 14.5 pt; das Kopfband bleibt ohne Nav.
> Slicer „Date" ist ein Datumsbereich: `DimDate.Date` muss vom Typ Date/DateTime sein, sonst zeigt Power BI keinen Kalender (`te get`).

## Zweiter Lauf (Delta)

Visualnamen sind stabil (`id` aus der Spec). Läuft der Bau ein zweites Mal, **nicht neu anlegen**: `pbir add visual --from-json` würde an den vorhandenen Namen scheitern. Stattdessen je Seite:

```bash
pbir batch run "<out>/Ubersicht/delta-batch.json" --root "Test.Report"
pbir batch run "<out>/Detail/delta-batch.json" --root "Test.Report"
```

Das aktualisiert Position, Größe und Feldbindung der vorhandenen Visuals. Was im Bericht steht, aber nicht mehr im Mockup: wird **nur gemeldet** (`mockup_verify.py`), nie gelöscht.

## Theme statt Overrides

`theme-fragment.json` enthält dieselbe Kachel-Optik als `visualStyles`-`*`-Eintrag. Wer ein Theme pflegt, merged das Fragment dorthin (Skill `reports:modifying-theme-json`) und lässt die `background`/`border`/`dropShadow`-Schritte aus der Batch-Spec weg — dann steht die Gestaltung an einer Stelle statt an jedem Visual.

## Navigation, Drill-through, Lesezeichen

Erst wenn **alle** Seiten stehen — Ziele müssen existieren. Befehle in [`navigation.md`](navigation.md).

## ChartKitchen-Slots (nicht per from-json)

Nur über eine vorhandene Referenz-Instanz replizieren — Vorgehen in `.claude/skills/chartkitchen-report/references/pbir-insertion.md`. Solange keine Instanz im Report liegt: Platzhalter setzen.

```bash
# Detail · AC vs. PL je Monat (columns → orientation columns)
pbir add visual shape "Test.Report/Detail.Page" -n "mk_ck1_slot" -x 24 -y 108 -w 1572 -h 450 -t "ChartKitchen: columns"
pbir set "Test.Report/Detail.Page/mk_ck1_slot.Visual.text.text" --value "ChartKitchen: columns · AC vs. PL je Monat"
```

## Verifizieren

```bash
pbir validate "Test.Report" --fields
te validate -m "Demo-Modell" --errors-only

# Abnahme gegen das Sollbild aus der Spec (Rechtecke ±1 px, Bindungen, Slicer)
python .claude/skills/mockup-to-powerbi/scripts/mockup_verify.py "Test.Report" "<out>/acceptance.json"

export PYTHONIOENCODING=utf-8   # sonst brechen beide Skripte an Umlauten ab
python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py "Test.Report" \
  --check --zones "<out>/Ubersicht/zones.json" --grid 0 \
  --skip-types shape,textbox,actionButton,image,slicer --pages "Übersicht,Detail"
python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py "Test.Report" \
  --zones "<out>/Ubersicht/zones.json" --pages "Übersicht,Detail" --html
```

Alle Seiten teilen dieselbe Inhaltszone, deshalb reicht eine `zones.json`. `--grid 0` weil MockupKitchen-Splits selten auf dem 8-px-Raster landen; `--skip-types` weil Chrome-Elemente absichtlich außerhalb der Content-Zone liegen. **`--pages` erwartet eine kommagetrennte Liste**, keine einzelnen Argumente.
