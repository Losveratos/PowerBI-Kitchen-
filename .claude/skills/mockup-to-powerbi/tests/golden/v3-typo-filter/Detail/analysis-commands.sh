#!/usr/bin/env bash
# Alles, was `pbir batch` nicht kann: Button-Aktionen, Sortierung, Top-N,
# Anzeigeeinheiten, Untertitel, Slicer-Vorauswahl, Annotationen.
# Bewusst OHNE set -e: einzelne Visualtypen kennen manche Eigenschaft nicht,
# das darf den Rest nicht abbrechen.

# Nav-Button 'Übersicht' -> Seite 'Übersicht'
pbir visuals action "Test.Report/Detail.Page/chrome_nav_1.Visual" --type PageNavigation --target "Übersicht"

# Vorauswahl im Slicer „Year" = 2026
pbir add filter DimDate Year -v "Test.Report/Detail.Page/mk_slicer_Year_p2.Visual" --values 2026
