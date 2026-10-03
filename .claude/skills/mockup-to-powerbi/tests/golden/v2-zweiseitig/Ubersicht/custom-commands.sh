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
PAGE="Übersicht"
OUT="<out>/Ubersicht"
P="$REPORT/$PAGE.Page"

# Umsatz — ibcsKpiCard (ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682)
pbir add visual shape "$P" -n "p1_v01_Umsatz" -x 16 -y 72 -w 317 -h 119 -t "Umsatz"
D=$(find "$REPORT/definition/pages" -type d -name "p1_v01_Umsatz" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/p1_v01_Umsatz.visual.json" "$D/visual.json"; else echo "p1_v01_Umsatz: Visualordner nicht gefunden"; fi

# Deckungsbeitrag — ibcsKpiCard (ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682)
pbir add visual shape "$P" -n "p1_v03_Deckungsbeitrag" -x 669 -y 72 -w 330 -h 119 -t "Deckungsbeitrag"
D=$(find "$REPORT/definition/pages" -type d -name "p1_v03_Deckungsbeitrag" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/p1_v03_Deckungsbeitrag.visual.json" "$D/visual.json"; else echo "p1_v03_Deckungsbeitrag: Visualordner nicht gefunden"; fi

# Marge — ibcsKpiCard (ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682)
pbir add visual shape "$P" -n "p1_v04_Marge" -x 1011 -y 72 -w 253 -h 119 -t "Marge"
D=$(find "$REPORT/definition/pages" -type d -name "p1_v04_Marge" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/p1_v04_Marge.visual.json" "$D/visual.json"; else echo "p1_v04_Marge: Visualordner nicht gefunden"; fi

pbir validate "$REPORT" --fields
