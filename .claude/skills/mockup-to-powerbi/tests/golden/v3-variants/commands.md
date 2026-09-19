# Befehlsfolge · Darstellungsvarianten-Testfall

1 Seite(n), Canvas 1280×720, Spec-Hash `variants1`. Reihenfolge einhalten. Vor dem ersten schreibenden Befehl: Power BI Desktop schließen, `pbir backup` oder Git-Commit.

```bash
# 0 · Ausgangslage sichern
pbir backup "Test.Report"

# 1 · Modell zuerst (siehe model-todos.md), dann prüfen
te validate -m "Vertrieb.SemanticModel" --errors-only
```

## 1 · Seite „Varianten"

```bash
# Seite anlegen (legt automatisch eine Textbox 'Title' an — entfernen)
pbir add page "Test.Report/Varianten.Page" -n "Varianten" -w 1280 -h 720
pbir rm "Test.Report/Varianten.Page/Title.Visual" -f
#   Bestehende Seite stattdessen nur umskalieren:
# pbir pages resize "Test.Report/Varianten.Page" -w 1280 -h 720

# Chrome-Geometrie (Flächen, Textrahmen, Buttons)
pbir add visual "Test.Report/Varianten.Page" --from-json "<out>/Varianten/chrome-visuals.json"

# Native Visuals + Slicer
pbir add visual "Test.Report/Varianten.Page" --from-json "<out>/Varianten/pbir-visuals.json"

# Seitenhintergrund (kann `pbir batch` nicht — nur als CLI-Aufruf)
pbir pages background "Test.Report/Varianten.Page" --color "#F4F4F1" --transparency 0

# Hauptweg: alle uebrigen Setzungen in EINEM Lauf (Texte, Farben,
#           Kachel-Container, Anzeigeeinheiten, z-Order)
pbir batch validate "<out>/Varianten/chrome-batch.json"
pbir batch plan "<out>/Varianten/chrome-batch.json" --root "Test.Report"
pbir batch run "<out>/Varianten/chrome-batch.json" --root "Test.Report"

# Fallback, wenn batch streikt (~1,5 s je Aufruf, läuft ein paar Minuten)
# bash "<out>/Varianten/chrome-commands.sh"   # PowerShell: chrome-commands.ps1

# Analyse: Sortierung, Top-N, Slicer-Vorauswahl, Annotationen
bash "<out>/Varianten/analysis-commands.sh"
```

> Kopfband ohne Seitennavigation (`zones.header.navOn: false`) — es werden keine `chrome_nav_*`-Buttons angelegt. Seitenwechsel laeuft ueber die Registerkarten.

## Zweiter Lauf (Delta)

Visualnamen sind stabil (`id` aus der Spec). Läuft der Bau ein zweites Mal, **nicht neu anlegen**: `pbir add visual --from-json` würde an den vorhandenen Namen scheitern. Stattdessen je Seite:

```bash
pbir batch run "<out>/Varianten/delta-batch.json" --root "Test.Report"
```

Das aktualisiert Position, Größe und Feldbindung der vorhandenen Visuals. Was im Bericht steht, aber nicht mehr im Mockup: wird **nur gemeldet** (`mockup_verify.py`), nie gelöscht.

## Theme statt Overrides

`theme-fragment.json` enthält dieselbe Kachel-Optik als `visualStyles`-`*`-Eintrag. Wer ein Theme pflegt, merged das Fragment dorthin (Skill `reports:modifying-theme-json`) und lässt die `background`/`border`/`dropShadow`-Schritte aus der Batch-Spec weg — dann steht die Gestaltung an einer Stelle statt an jedem Visual.

## Navigation, Drill-through, Lesezeichen

Erst wenn **alle** Seiten stehen — Ziele müssen existieren. Befehle in [`navigation.md`](navigation.md).

## ChartKitchen-Slots (nicht per from-json)

Nur über eine vorhandene Referenz-Instanz replizieren — Vorgehen in `.claude/skills/chartkitchen-report/references/pbir-insertion.md`. Solange keine Instanz im Report liegt: Platzhalter setzen.

```bash
# Varianten · AC/PL je Monat (kombi → orientation columns)
pbir add visual shape "Test.Report/Varianten.Page" -n "mk_ck1_slot" -x 808 -y 384 -w 240 -h 296 -t "ChartKitchen: kombi"
pbir set "Test.Report/Varianten.Page/mk_ck1_slot.Visual.text.text" --value "ChartKitchen: kombi · AC/PL je Monat"
```

## Verifizieren

```bash
pbir validate "Test.Report" --fields
te validate -m "Vertrieb.SemanticModel" --errors-only

# Abnahme gegen das Sollbild aus der Spec (Rechtecke ±1 px, Bindungen, Slicer)
python .claude/skills/mockup-to-powerbi/scripts/mockup_verify.py "Test.Report" "<out>/acceptance.json"

export PYTHONIOENCODING=utf-8   # sonst brechen beide Skripte an Umlauten ab
python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py "Test.Report" \
  --check --zones "<out>/Varianten/zones.json" --grid 0 \
  --skip-types shape,textbox,actionButton,image,slicer --pages "Varianten"
python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py "Test.Report" \
  --zones "<out>/Varianten/zones.json" --pages "Varianten" --html
```

Alle Seiten teilen dieselbe Inhaltszone, deshalb reicht eine `zones.json`. `--grid 0` weil MockupKitchen-Splits selten auf dem 8-px-Raster landen; `--skip-types` weil Chrome-Elemente absichtlich außerhalb der Content-Zone liegen. **`--pages` erwartet eine kommagetrennte Liste**, keine einzelnen Argumente.
