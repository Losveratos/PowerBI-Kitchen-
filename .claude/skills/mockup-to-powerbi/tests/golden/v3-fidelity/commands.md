# Befehlsfolge · Treue-Testfall B1

1 Seite(n), Canvas 1920×1080, Spec-Hash `fidelityb1`. Reihenfolge einhalten. Vor dem ersten schreibenden Befehl: Power BI Desktop schließen, `pbir backup` oder Git-Commit.

```bash
# 0 · Ausgangslage sichern
pbir backup "Test.Report"

# 1 · Modell zuerst (siehe model-todos.md), dann prüfen
te validate -m "PBI-IBCS-Testbed" --errors-only
```

## 1 · Seite „Fidelity"

```bash
# Seite anlegen (legt automatisch eine Textbox 'Title' an — entfernen)
pbir add page "Test.Report/Fidelity.Page" -n "Fidelity" -w 1920 -h 1080
pbir rm "Test.Report/Fidelity.Page/Title.Visual" -f
#   Bestehende Seite stattdessen nur umskalieren:
# pbir pages resize "Test.Report/Fidelity.Page" -w 1920 -h 1080

# Chrome-Geometrie (Flächen, Textrahmen, Buttons)
pbir add visual "Test.Report/Fidelity.Page" --from-json "<out>/Fidelity/chrome-visuals.json"

# Native Visuals + Slicer
pbir add visual "Test.Report/Fidelity.Page" --from-json "<out>/Fidelity/pbir-visuals.json"

# Seitenhintergrund (kann `pbir batch` nicht — nur als CLI-Aufruf)
pbir pages background "Test.Report/Fidelity.Page" --color "#F4F4F1" --transparency 0

# Hauptweg: alle uebrigen Setzungen in EINEM Lauf (Texte, Farben,
#           Kachel-Container, Anzeigeeinheiten, z-Order)
pbir batch validate "<out>/Fidelity/chrome-batch.json"
pbir batch plan "<out>/Fidelity/chrome-batch.json" --root "Test.Report"
pbir batch run "<out>/Fidelity/chrome-batch.json" --root "Test.Report"

# Fallback, wenn batch streikt (~1,5 s je Aufruf, läuft ein paar Minuten)
# bash "<out>/Fidelity/chrome-commands.sh"   # PowerShell: chrome-commands.ps1

# Analyse: Sortierung, Top-N, Slicer-Vorauswahl, Annotationen
bash "<out>/Fidelity/analysis-commands.sh"

# Custom Visuals ZULETZT (Platzhalter + visual.json kopieren);
# die .pbiviz muss vorher im Bericht importiert sein
bash "<out>/Fidelity/custom-commands.sh"
```

> Kopfband ohne Seitennavigation (`navPosition: "off"`) — es werden keine `chrome_nav_*`-Buttons angelegt. Seitenwechsel laeuft ueber die Registerkarten.
> Filter-Overlay: Panel, Ueberschrift, Schliessen-Button und Slicer liegen ueber dem Inhalt und werden ausgeblendet angelegt (`pbir visuals hide` in analysis-commands.sh). Lesezeichen und Button-Aktionen stehen in navigation.md.

## Zweiter Lauf (Delta)

Visualnamen sind stabil (`id` aus der Spec). Läuft der Bau ein zweites Mal, **nicht neu anlegen**: `pbir add visual --from-json` würde an den vorhandenen Namen scheitern. Stattdessen je Seite:

```bash
pbir batch run "<out>/Fidelity/delta-batch.json" --root "Test.Report"
```

Das aktualisiert Position, Größe und Feldbindung der vorhandenen Visuals. Was im Bericht steht, aber nicht mehr im Mockup: wird **nur gemeldet** (`mockup_verify.py`), nie gelöscht.

## Theme statt Overrides

`theme-fragment.json` enthält dieselbe Kachel-Optik als `visualStyles`-`*`-Eintrag. Wer ein Theme pflegt, merged das Fragment dorthin (Skill `reports:modifying-theme-json`) und lässt die `background`/`border`/`dropShadow`-Schritte aus der Batch-Spec weg — dann steht die Gestaltung an einer Stelle statt an jedem Visual.

## Navigation, Drill-through, Lesezeichen

Erst wenn **alle** Seiten stehen — Ziele müssen existieren. Befehle in [`navigation.md`](navigation.md).

## Custom Visuals (dataKitchenGantt, pnlByDatenWG …)

`pbir add visual` kennt die GUIDs dieser Visuals **nicht** (`Unknown visual type '<GUID>'`), und in `--from-json` würde ein solcher Eintrag die **ganze Datei** ablehnen. Deshalb stehen die Kacheln nicht in `pbir-visuals.json`, sondern als fertige `visual.json` unter `<Seitenslug>/custom-visuals/`.

**Schritt 1 — `.pbiviz` in den Bericht importieren** (Power BI Desktop: Visualisierungen → … → *Visual aus Datei importieren*). Ohne Import bleibt die Kachel leer, auch wenn die JSON stimmt:

- `ibcsKpiCard/dist/ibcsKpiCard*.2.3.0.0.pbiviz`

**Schritt 2 — Platzhalter anlegen und Datei ersetzen** (erledigt `custom-commands.sh` je Seite):

```bash
# Fidelity · Umsatz — ibcsKpiCard
pbir add visual shape "Test.Report/Fidelity.Page" -n "mk_kpi1" -x 965 -y 414 -w 460 -h 300 -t "Umsatz"
D=$(find "Test.Report/definition/pages" -type d -name "mk_kpi1" | head -1)
cp "<out>/Fidelity/custom-visuals/mk_kpi1.visual.json" "$D/visual.json"
```

Danach `pbir validate "Test.Report" --fields` — die erzeugte `visual.json` ist in der Form geschrieben, die `pbir add visual` selbst verwendet (Schema 2.9.0, `visualContainerObjects` als Arrays) und wird angenommen. **Reihenfolge:** erst `chrome-batch.json`, dann kopieren — die Kopie überschreibt sonst die Formatierung (sie steckt bereits in der Datei).

Im **zweiten Lauf** entfällt der Platzhalter-Schritt: nur die neu erzeugte `visual.json` erneut kopieren. `delta-batch.json` fasst Custom Visuals bewusst nicht an.

## ChartKitchen-Slots (nicht per from-json)

Nur über eine vorhandene Referenz-Instanz replizieren — Vorgehen in `.claude/skills/chartkitchen-report/references/pbir-insertion.md`. Solange keine Instanz im Report liegt: Platzhalter setzen.

```bash
# Fidelity · Δ PY absolut (absvar → orientation columns)
pbir add visual shape "Test.Report/Fidelity.Page" -n "mk_absvar1_slot" -x 15 -y 99 -w 460 -h 300 -t "ChartKitchen: absvar"
pbir set "Test.Report/Fidelity.Page/mk_absvar1_slot.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_absvar1_slot.Visual.text.default.text" --value "ChartKitchen: absvar · Δ PY absolut"
# Fidelity · Δ PY % (relvar → orientation columns)
pbir add visual shape "Test.Report/Fidelity.Page" -n "mk_relvar1_slot" -x 490 -y 99 -w 460 -h 300 -t "ChartKitchen: relvar"
pbir set "Test.Report/Fidelity.Page/mk_relvar1_slot.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_relvar1_slot.Visual.text.default.text" --value "ChartKitchen: relvar · Δ PY %"
# Fidelity · PL → AC je Region (bridge → orientation waterfall)
pbir add visual shape "Test.Report/Fidelity.Page" -n "mk_bridge1_slot" -x 965 -y 99 -w 460 -h 300 -t "ChartKitchen: bridge"
pbir set "Test.Report/Fidelity.Page/mk_bridge1_slot.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_bridge1_slot.Visual.text.default.text" --value "ChartKitchen: bridge · PL → AC je Region"
# Fidelity · Produkte (sparktable → orientation table)
pbir add visual shape "Test.Report/Fidelity.Page" -n "mk_spark1_slot" -x 15 -y 414 -w 460 -h 300 -t "ChartKitchen: sparktable"
pbir set "Test.Report/Fidelity.Page/mk_spark1_slot.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_spark1_slot.Visual.text.default.text" --value "ChartKitchen: sparktable · Produkte"
# Fidelity · AC vs PL je Region (bars → orientation bars)
pbir add visual shape "Test.Report/Fidelity.Page" -n "mk_bars1_slot" -x 1440 -y 414 -w 460 -h 300 -t "ChartKitchen: bars"
pbir set "Test.Report/Fidelity.Page/mk_bars1_slot.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_bars1_slot.Visual.text.default.text" --value "ChartKitchen: bars · AC vs PL je Region"
# Fidelity ·  (columns → orientation columns)
pbir add visual shape "Test.Report/Fidelity.Page" -n "mk_col1_slot" -x 15 -y 729 -w 460 -h 300 -t "ChartKitchen: columns"
pbir set "Test.Report/Fidelity.Page/mk_col1_slot.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_col1_slot.Visual.text.default.text" --value "ChartKitchen: columns · "
# Fidelity · Beiträge je Kategorie (wfkombi → orientation waterfall)
pbir add visual shape "Test.Report/Fidelity.Page" -n "mk_wfk1_slot" -x 490 -y 729 -w 460 -h 300 -t "ChartKitchen: wfkombi"
pbir set "Test.Report/Fidelity.Page/mk_wfk1_slot.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_wfk1_slot.Visual.text.default.text" --value "ChartKitchen: wfkombi · Beiträge je Kategorie"
# Fidelity ·  (kombi → orientation columns)
pbir add visual shape "Test.Report/Fidelity.Page" -n "mk_kombi1_slot" -x 1440 -y 729 -w 460 -h 300 -t "ChartKitchen: kombi"
pbir set "Test.Report/Fidelity.Page/mk_kombi1_slot.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_kombi1_slot.Visual.text.default.text" --value "ChartKitchen: kombi · "
```

## Verifizieren

```bash
pbir validate "Test.Report" --fields
te validate -m "PBI-IBCS-Testbed" --errors-only

# Abnahme gegen das Sollbild aus der Spec (Rechtecke ±1 px, Bindungen, Slicer)
python .claude/skills/mockup-to-powerbi/scripts/mockup_verify.py "Test.Report" "<out>/acceptance.json"

export PYTHONIOENCODING=utf-8   # sonst brechen beide Skripte an Umlauten ab
python .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py "Test.Report" \
  --check --zones "<out>/Fidelity/zones.json" --grid 0 \
  --skip-types shape,textbox,actionButton,image,slicer --pages "Fidelity"
python .claude/skills/powerbi-design-framework/scripts/render_wireframe.py "Test.Report" \
  --zones "<out>/Fidelity/zones.json" --pages "Fidelity" --html
```

Alle Seiten teilen dieselbe Inhaltszone, deshalb reicht eine `zones.json`. `--grid 0` weil MockupKitchen-Splits selten auf dem 8-px-Raster landen; `--skip-types` weil Chrome-Elemente absichtlich außerhalb der Content-Zone liegen. **`--pages` erwartet eine kommagetrennte Liste**, keine einzelnen Argumente.
