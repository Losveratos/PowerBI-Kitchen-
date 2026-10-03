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
PAGE="Detail Produktlinie"
OUT="<out>/Detail_Produktlinie"
P="$REPORT/$PAGE.Page"

# Umsatz — ibcsKpiCard (ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682)
pbir add visual shape "$P" -n "p2_v02_Umsatz" -x 640 -y 72 -w 306 -h 149 -t "Umsatz"
D=$(find "$REPORT/definition/pages" -type d -name "p2_v02_Umsatz" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/p2_v02_Umsatz.visual.json" "$D/visual.json"; else echo "p2_v02_Umsatz: Visualordner nicht gefunden"; fi

# Marge % — ibcsKpiCard (ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682)
pbir add visual shape "$P" -n "p2_v03_Marge" -x 958 -y 72 -w 306 -h 149 -t "Marge %"
D=$(find "$REPORT/definition/pages" -type d -name "p2_v03_Marge" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/p2_v03_Marge.visual.json" "$D/visual.json"; else echo "p2_v03_Marge: Visualordner nicht gefunden"; fi

pbir validate "$REPORT" --fields
