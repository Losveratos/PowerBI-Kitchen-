#!/usr/bin/env bash
# Alles, was `pbir batch` nicht kann: Button-Aktionen, Sortierung, Top-N,
# Anzeigeeinheiten, Untertitel, Slicer-Vorauswahl, Annotationen.
# Bewusst OHNE set -e: einzelne Visualtypen kennen manche Eigenschaft nicht,
# das darf den Rest nicht abbrechen.

# Nav-Button 'Detail Produktlinie' -> Seite 'Detail Produktlinie'
pbir visuals action "Test.Report/Übersicht.Page/chrome_nav_2.Visual" --type PageNavigation --target "Detail Produktlinie"

# Notiz/Workshop-Status als Annotation im Bericht ablegen
pbir add annotation "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual" --text "Klick auf einen Balken springt in die Detailseite (Drill-through auf Category). Offen: Sortierung nach Δ oder AC?" --author mockup-to-powerbi --category Documentation
# Notiz/Workshop-Status als Annotation im Bericht ablegen
pbir add annotation "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual" --text "Kernbotschaft des Monats, Controller pflegt den Text." --author mockup-to-powerbi --category Documentation
