#!/usr/bin/env bash
# Alles, was `pbir batch` nicht kann: Button-Aktionen, Sortierung, Top-N,
# Anzeigeeinheiten, Untertitel, Slicer-Vorauswahl, Annotationen.
# Bewusst OHNE set -e: einzelne Visualtypen kennen manche Eigenschaft nicht,
# das darf den Rest nicht abbrechen.

# Nav-Button 'Übersicht' -> Seite 'Übersicht'
pbir visuals action "Test.Report/Detail Produktlinie.Page/chrome_nav_1.Visual" --type PageNavigation --target "Übersicht"

# Notiz/Workshop-Status als Annotation im Bericht ablegen
pbir add annotation "Test.Report/Detail Produktlinie.Page/p2_v01_Detail_gewahlte_Produktlinie.Visual" --text "Drill-through-Ziel. Titel zeigt den gefilterten Wert (SELECTEDVALUE)." --author mockup-to-powerbi --category Documentation
