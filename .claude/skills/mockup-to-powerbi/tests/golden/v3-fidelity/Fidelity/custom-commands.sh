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
PAGE="Fidelity"
OUT="<out>/Fidelity"
P="$REPORT/$PAGE.Page"

# Umsatz — ibcsKpiCard (ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682)
pbir add visual shape "$P" -n "mk_kpi1" -x 965 -y 414 -w 460 -h 300 -t "Umsatz"
D=$(find "$REPORT/definition/pages" -type d -name "mk_kpi1" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/mk_kpi1.visual.json" "$D/visual.json"; else echo "mk_kpi1: Visualordner nicht gefunden"; fi

pbir validate "$REPORT" --fields
