#!/usr/bin/env bash
# Alles, was `pbir batch` nicht kann: Button-Aktionen, Sortierung, Top-N,
# Anzeigeeinheiten, Untertitel, Slicer-Vorauswahl, Annotationen.
# Bewusst OHNE set -e: einzelne Visualtypen kennen manche Eigenschaft nicht,
# das darf den Rest nicht abbrechen.

# Nav-Button 'Umsatz' -> Seite 'Umsatz'
pbir visuals action "Test.Report/Übersicht.Page/chrome_nav_2.Visual" --type PageNavigation --target Umsatz

# Nav-Button 'Kosten' -> Seite 'Kosten'
pbir visuals action "Test.Report/Übersicht.Page/chrome_nav_3.Visual" --type PageNavigation --target Kosten

# Notiz/Workshop-Status als Annotation im Bericht ablegen
pbir add annotation "Test.Report/Übersicht.Page/v06_PL_je_Produktlinie.Visual" --text "Absteigend nach AC sortieren." --author mockup-to-powerbi --category Documentation
