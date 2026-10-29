#!/usr/bin/env bash
# Alles, was `pbir batch` nicht kann: Button-Aktionen, Sortierung, Top-N,
# Anzeigeeinheiten, Untertitel, Slicer-Vorauswahl, Annotationen.
# Bewusst OHNE set -e: einzelne Visualtypen kennen manche Eigenschaft nicht,
# das darf den Rest nicht abbrechen.

# Nav-Button 'Detail' -> Seite 'Detail'
pbir visuals action "Test.Report/Übersicht.Page/chrome_nav_2.Visual" --type PageNavigation --target Detail

# Untertitel aus der Spec
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.subTitle.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.subTitle.text" --value "Tsd. EUR"
# Untertitel aus der Spec
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.subTitle.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.subTitle.text" --value "Ist, Tsd. EUR"
# Notiz/Workshop-Status als Annotation im Bericht ablegen
pbir add annotation "Test.Report/Übersicht.Page/mk_col1.Visual" --text "Größere Schrift: Hauptkachel der Seite." --author mockup-to-powerbi --category Documentation
# Vorauswahl im Slicer „Year" = 2026
pbir add filter DimDate Year -v "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual" --values 2026
