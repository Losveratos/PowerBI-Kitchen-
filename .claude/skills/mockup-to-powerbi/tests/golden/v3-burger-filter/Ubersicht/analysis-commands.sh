#!/usr/bin/env bash
# Alles, was `pbir batch` nicht kann: Button-Aktionen, Sortierung, Top-N,
# Anzeigeeinheiten, Untertitel, Slicer-Vorauswahl, Annotationen.
# Bewusst OHNE set -e: einzelne Visualtypen kennen manche Eigenschaft nicht,
# das darf den Rest nicht abbrechen.

# Nav-Button 'Detail Produktlinie' -> Seite 'Detail Produktlinie'
pbir visuals action "Test.Report/Übersicht.Page/chrome_nav_2.Visual" --type PageNavigation --target "Detail Produktlinie"

# Vorauswahl im Slicer „Year" = 2026
pbir add filter DimDate Year -v "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual" --values 2026
