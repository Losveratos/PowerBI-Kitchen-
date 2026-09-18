#!/usr/bin/env bash
# Custom Visuals dieser Seite. `pbir add visual` kennt die GUIDs nicht
# ("Unknown visual type"), und `--from-json` lehnt dann die GANZE Datei ab.
# Deshalb: Platzhalter-Shape mit pbir anlegen (Ordner, Visualname und
# Seiteneintrag entstehen korrekt), dann die visual.json ersetzen.
# ZULETZT ausfuehren — nach chrome-batch.json, sonst ueberschreibt die Kopie
# die Formatierung wieder (sie steckt bereits in der erzeugten Datei).
# Voraussetzung: die .pbiviz ist im Bericht importiert (Desktop-Schritt).
set -uo pipefail

REPORT="Test.Report"
PAGE="Projekt & GuV"
OUT="<out>/Projekt_GuV"
P="$REPORT/$PAGE.Page"

# Projektplan — dataKitchenGantt (dataKitchenGanttD7C41F0A93E24B6BA1F3C5E8A20D9B44)
pbir add visual shape "$P" -n "mk_gantt1" -x 16 -y 72 -w 616 -h 296 -t "Projektplan"
D=$(find "$REPORT/definition/pages" -type d -name "mk_gantt1" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/mk_gantt1.visual.json" "$D/visual.json"; else echo "mk_gantt1: Visualordner nicht gefunden"; fi

# GuV nach Ebenen — pnlByDatenWG (pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358)
pbir add visual shape "$P" -n "mk_pnl1" -x 648 -y 72 -w 616 -h 296 -t "GuV nach Ebenen"
D=$(find "$REPORT/definition/pages" -type d -name "mk_pnl1" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/mk_pnl1.visual.json" "$D/visual.json"; else echo "mk_pnl1: Visualordner nicht gefunden"; fi

# Meilensteine — dataKitchenGantt (dataKitchenGanttD7C41F0A93E24B6BA1F3C5E8A20D9B44)
#   ! Pflichtrolle `start` ist leer — dataKitchenGantt byDatenWG zeichnet ohne sie nichts. Feld im Mockup nachtragen oder im Bericht nachbinden.
pbir add visual shape "$P" -n "mk_gantt2" -x 16 -y 384 -w 616 -h 296 -t "Meilensteine"
D=$(find "$REPORT/definition/pages" -type d -name "mk_gantt2" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/mk_gantt2.visual.json" "$D/visual.json"; else echo "mk_gantt2: Visualordner nicht gefunden"; fi

pbir validate "$REPORT" --fields
