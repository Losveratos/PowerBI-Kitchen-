# Befehlsfolge · Management Report · Beispiel

1 Seite(n), Canvas 1280×720, Spec-Hash `7e7618d2`. Reihenfolge einhalten. Vor dem ersten schreibenden Befehl: Power BI Desktop schließen, `pbir backup` oder Git-Commit.

```bash
# 0 · Ausgangslage sichern
pbir backup "Test.Report"

# 1 · Modell zuerst (siehe model-todos.md), dann prüfen
te validate -m "PBI-IBCS-Testbed.SemanticModel" --errors-only
```

## 1 · Seite „Übersicht"

```bash
# Seite anlegen (legt automatisch eine Textbox 'Title' an — entfernen)
pbir add page "Test.Report/Ubersicht.Page" -n "Übersicht" -w 1280 -h 720
pbir rm "Test.Report/Übersicht.Page/Title.Visual" -f
#   Bestehende Seite stattdessen nur umskalieren:
# pbir pages resize "Test.Report/Übersicht.Page" -w 1280 -h 720

# Chrome-Geometrie (Flächen, Textrahmen, Buttons)
pbir add visual "Test.Report/Übersicht.Page" --from-json "<out>/Ubersicht/chrome-visuals.json"

# Native Visuals + Slicer
pbir add visual "Test.Report/Übersicht.Page" --from-json "<out>/Ubersicht/pbir-visuals.json"

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

## Zweiter Lauf (Delta)

Visualnamen sind stabil (`id` aus der Spec). Läuft der Bau ein zweites Mal, **nicht neu anlegen**: `pbir add visual --from-json` würde an den vorhandenen Namen scheitern. Stattdessen je Seite:

```bash
pbir batch run "<out>/Ubersicht/delta-batch.json" --root "Test.Report"
```

Das aktualisiert Position, Größe und Feldbindung der vorhandenen Visuals. Was im Bericht steht, aber nicht mehr im Mockup: wird **nur gemeldet** (`mockup_verify.py`), nie gelöscht.

## Theme statt Overrides

`theme-fragment.json` enthält dieselbe Kachel-Optik als `visualStyles`-`*`-Eintrag. Wer ein Theme pflegt, merged das Fragment dorthin (Skill `reports:modifying-theme-json`) und lässt die `background`/`border`/`dropShadow`-Schritte aus der Batch-Spec weg — dann steht die Gestaltung an einer Stelle statt an jedem Visual.

## Navigation, Drill-through, Lesezeichen

Erst wenn **alle** Seiten stehen — Ziele müssen existieren. Befehle in [`navigation.md`](navigation.md).

## ChartKitchen-Slots (nicht per from-json)

Nur über eine vorhandene Referenz-Instanz replizieren — Vorgehen in `.claude/skills/chartkitchen-report/references/pbir-insertion.md`. Solange keine Instanz im Report liegt: Platzhalter setzen.

```bash
# Übersicht · Umsatz (kpi → orientation cards)
pbir add visual shape "Test.Report/Übersicht.Page" -n "v01_Umsatz_slot" -x 16 -y 72 -w 253 -h 119 -t "ChartKitchen: kpi"
pbir set "Test.Report/Übersicht.Page/v01_Umsatz_slot.Visual.text.text" --value "ChartKitchen: kpi · Umsatz"
# Übersicht · Marge (kpi → orientation cards)
pbir add visual shape "Test.Report/Übersicht.Page" -n "v02_Marge_slot" -x 281 -y 72 -w 253 -h 119 -t "ChartKitchen: kpi"
pbir set "Test.Report/Übersicht.Page/v02_Marge_slot.Visual.text.text" --value "ChartKitchen: kpi · Marge"
# Übersicht · Deckungsbeitrag (kpi → orientation cards)
pbir add visual shape "Test.Report/Übersicht.Page" -n "v04_Deckungsbeitrag_slot" -x 811 -y 72 -w 253 -h 119 -t "ChartKitchen: kpi"
pbir set "Test.Report/Übersicht.Page/v04_Deckungsbeitrag_slot.Visual.text.text" --value "ChartKitchen: kpi · Deckungsbeitrag"
# Übersicht · Umsatz AC/FC vs PL je Monat (varint → orientation intwaterfall)
pbir add visual shape "Test.Report/Übersicht.Page" -n "v05_Umsatz_AC_FC_vs_PL_je_Monat_slot" -x 16 -y 203 -w 691 -h 477 -t "ChartKitchen: varint"
pbir set "Test.Report/Übersicht.Page/v05_Umsatz_AC_FC_vs_PL_je_Monat_slot.Visual.text.text" --value "ChartKitchen: varint · Umsatz AC/FC vs PL je Monat"
```

## Verifizieren

```bash
pbir validate "Test.Report" --fields
te validate -m "PBI-IBCS-Testbed.SemanticModel" --errors-only

# Abnahme gegen das Sollbild aus der Spec (Rechtecke ±1 px, Bindungen, Slicer)
python .claude/skills/mockup-to-powerbi/scripts/mockup_verify.py "Test.Report" "<out>/acceptance.json"

export PYTHONIOENCODING=utf-8   # sonst brechen beide Skripte an Umlauten ab
python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py "Test.Report" \
  --check --zones "<out>/Ubersicht/zones.json" --grid 0 \
  --skip-types shape,textbox,actionButton,image,slicer --pages "Übersicht"
python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py "Test.Report" \
  --zones "<out>/Ubersicht/zones.json" --pages "Übersicht" --html
```

Alle Seiten teilen dieselbe Inhaltszone, deshalb reicht eine `zones.json`. `--grid 0` weil MockupKitchen-Splits selten auf dem 8-px-Raster landen; `--skip-types` weil Chrome-Elemente absichtlich außerhalb der Content-Zone liegen. **`--pages` erwartet eine kommagetrennte Liste**, keine einzelnen Argumente.
