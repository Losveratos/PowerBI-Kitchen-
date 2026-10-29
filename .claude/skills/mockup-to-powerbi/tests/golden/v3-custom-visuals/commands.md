# Befehlsfolge · Custom-Visual-Testfall

1 Seite(n), Canvas 1280×720, Spec-Hash `customvis`. Reihenfolge einhalten. Vor dem ersten schreibenden Befehl: Power BI Desktop schließen, `pbir backup` oder Git-Commit.

```bash
# 0 · Ausgangslage sichern
pbir backup "Test.Report"

# 1 · Modell zuerst (siehe model-todos.md), dann prüfen
te validate -m "Test.SemanticModel" --errors-only
```

## 1 · Seite „Projekt & GuV"

```bash
# Seite anlegen (legt automatisch eine Textbox 'Title' an — entfernen)
pbir add page "Test.Report/Projekt_GuV.Page" -n "Projekt & GuV" -w 1280 -h 720
pbir rm "Test.Report/Projekt & GuV.Page/Title.Visual" -f
#   Bestehende Seite stattdessen nur umskalieren:
# pbir pages resize "Test.Report/Projekt & GuV.Page" -w 1280 -h 720

# Chrome-Geometrie (Flächen, Textrahmen, Buttons)
pbir add visual "Test.Report/Projekt & GuV.Page" --from-json "<out>/Projekt_GuV/chrome-visuals.json"

# Native Visuals + Slicer
pbir add visual "Test.Report/Projekt & GuV.Page" --from-json "<out>/Projekt_GuV/pbir-visuals.json"

# Seitenhintergrund (kann `pbir batch` nicht — nur als CLI-Aufruf)
pbir pages background "Test.Report/Projekt & GuV.Page" --color "#F7F4EF" --transparency 0

# Hauptweg: alle uebrigen Setzungen in EINEM Lauf (Texte, Farben,
#           Kachel-Container, Anzeigeeinheiten, z-Order)
pbir batch validate "<out>/Projekt_GuV/chrome-batch.json"
pbir batch plan "<out>/Projekt_GuV/chrome-batch.json" --root "Test.Report"
pbir batch run "<out>/Projekt_GuV/chrome-batch.json" --root "Test.Report"

# Fallback, wenn batch streikt (~1,5 s je Aufruf, läuft ein paar Minuten)
# bash "<out>/Projekt_GuV/chrome-commands.sh"   # PowerShell: chrome-commands.ps1

# Analyse: Sortierung, Top-N, Slicer-Vorauswahl, Annotationen
bash "<out>/Projekt_GuV/analysis-commands.sh"

# Custom Visuals ZULETZT (Platzhalter + visual.json kopieren);
# die .pbiviz muss vorher im Bericht importiert sein
bash "<out>/Projekt_GuV/custom-commands.sh"
```

## Zweiter Lauf (Delta)

Visualnamen sind stabil (`id` aus der Spec). Läuft der Bau ein zweites Mal, **nicht neu anlegen**: `pbir add visual --from-json` würde an den vorhandenen Namen scheitern. Stattdessen je Seite:

```bash
pbir batch run "<out>/Projekt_GuV/delta-batch.json" --root "Test.Report"
```

Das aktualisiert Position, Größe und Feldbindung der vorhandenen Visuals. Was im Bericht steht, aber nicht mehr im Mockup: wird **nur gemeldet** (`mockup_verify.py`), nie gelöscht.

## Theme statt Overrides

`theme-fragment.json` enthält dieselbe Kachel-Optik als `visualStyles`-`*`-Eintrag. Wer ein Theme pflegt, merged das Fragment dorthin (Skill `reports:modifying-theme-json`) und lässt die `background`/`border`/`dropShadow`-Schritte aus der Batch-Spec weg — dann steht die Gestaltung an einer Stelle statt an jedem Visual.

## Navigation, Drill-through, Lesezeichen

Erst wenn **alle** Seiten stehen — Ziele müssen existieren. Befehle in [`navigation.md`](navigation.md).

## Custom Visuals (dataKitchenGantt, pnlByDatenWG …)

`pbir add visual` kennt die GUIDs dieser Visuals **nicht** (`Unknown visual type '<GUID>'`), und in `--from-json` würde ein solcher Eintrag die **ganze Datei** ablehnen. Deshalb stehen die Kacheln nicht in `pbir-visuals.json`, sondern als fertige `visual.json` unter `<Seitenslug>/custom-visuals/`.

**Schritt 1 — `.pbiviz` in den Bericht importieren** (Power BI Desktop: Visualisierungen → … → *Visual aus Datei importieren*). Ohne Import bleibt die Kachel leer, auch wenn die JSON stimmt:

- `dataKitchenGantt/dist/*.pbiviz`
- `pnlByDatenWG/dist/*.pbiviz`

**Schritt 2 — Platzhalter anlegen und Datei ersetzen** (erledigt `custom-commands.sh` je Seite):

```bash
# Projekt & GuV · Projektplan — dataKitchenGantt
pbir add visual shape "Test.Report/Projekt & GuV.Page" -n "mk_gantt1" -x 16 -y 72 -w 616 -h 296 -t "Projektplan"
D=$(find "Test.Report/definition/pages" -type d -name "mk_gantt1" | head -1)
cp "<out>/Projekt_GuV/custom-visuals/mk_gantt1.visual.json" "$D/visual.json"
# Projekt & GuV · GuV nach Ebenen — pnlByDatenWG
pbir add visual shape "Test.Report/Projekt & GuV.Page" -n "mk_pnl1" -x 648 -y 72 -w 616 -h 296 -t "GuV nach Ebenen"
D=$(find "Test.Report/definition/pages" -type d -name "mk_pnl1" | head -1)
cp "<out>/Projekt_GuV/custom-visuals/mk_pnl1.visual.json" "$D/visual.json"
# Projekt & GuV · Meilensteine — dataKitchenGantt
pbir add visual shape "Test.Report/Projekt & GuV.Page" -n "mk_gantt2" -x 16 -y 384 -w 616 -h 296 -t "Meilensteine"
D=$(find "Test.Report/definition/pages" -type d -name "mk_gantt2" | head -1)
cp "<out>/Projekt_GuV/custom-visuals/mk_gantt2.visual.json" "$D/visual.json"
```

Danach `pbir validate "Test.Report" --fields` — die erzeugte `visual.json` ist in der Form geschrieben, die `pbir add visual` selbst verwendet (Schema 2.9.0, `visualContainerObjects` als Arrays) und wird angenommen. **Reihenfolge:** erst `chrome-batch.json`, dann kopieren — die Kopie überschreibt sonst die Formatierung (sie steckt bereits in der Datei).

Im **zweiten Lauf** entfällt der Platzhalter-Schritt: nur die neu erzeugte `visual.json` erneut kopieren. `delta-batch.json` fasst Custom Visuals bewusst nicht an.

## Verifizieren

```bash
pbir validate "Test.Report" --fields
te validate -m "Test.SemanticModel" --errors-only

# Abnahme gegen das Sollbild aus der Spec (Rechtecke ±1 px, Bindungen, Slicer)
python .claude/skills/mockup-to-powerbi/scripts/mockup_verify.py "Test.Report" "<out>/acceptance.json"

export PYTHONIOENCODING=utf-8   # sonst brechen beide Skripte an Umlauten ab
python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py "Test.Report" \
  --check --zones "<out>/Projekt_GuV/zones.json" --grid 0 \
  --skip-types shape,textbox,actionButton,image,slicer --pages "Projekt & GuV"
python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py "Test.Report" \
  --zones "<out>/Projekt_GuV/zones.json" --pages "Projekt & GuV" --html
```

Alle Seiten teilen dieselbe Inhaltszone, deshalb reicht eine `zones.json`. `--grid 0` weil MockupKitchen-Splits selten auf dem 8-px-Raster landen; `--skip-types` weil Chrome-Elemente absichtlich außerhalb der Content-Zone liegen. **`--pages` erwartet eine kommagetrennte Liste**, keine einzelnen Argumente.
