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
pbir add visual shape "$P" -n "mk_5z33e3b" -x 16 -y 72 -w 317 -h 119 -t "Umsatz"
D=$(find "$REPORT/definition/pages" -type d -name "mk_5z33e3b" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/mk_5z33e3b.visual.json" "$D/visual.json"; else echo "mk_5z33e3b: Visualordner nicht gefunden"; fi

# Deckungsbeitrag — ibcsKpiCard (ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682)
#   ! Pflichtrolle `ac` ist leer — IBCS KPI Card 2.3 zeichnet ohne sie nichts. Feld im Mockup nachtragen oder im Bericht nachbinden.
pbir add visual shape "$P" -n "mk_7ixiebk" -x 669 -y 72 -w 330 -h 119 -t "Deckungsbeitrag"
D=$(find "$REPORT/definition/pages" -type d -name "mk_7ixiebk" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/mk_7ixiebk.visual.json" "$D/visual.json"; else echo "mk_7ixiebk: Visualordner nicht gefunden"; fi

# Marge — ibcsKpiCard (ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682)
pbir add visual shape "$P" -n "mk_ldc3xxy" -x 1011 -y 72 -w 253 -h 119 -t "Marge"
D=$(find "$REPORT/definition/pages" -type d -name "mk_ldc3xxy" | head -1)
if [ -n "$D" ]; then cp "$OUT/custom-visuals/mk_ldc3xxy.visual.json" "$D/visual.json"; else echo "mk_ldc3xxy: Visualordner nicht gefunden"; fi

pbir validate "$REPORT" --fields
