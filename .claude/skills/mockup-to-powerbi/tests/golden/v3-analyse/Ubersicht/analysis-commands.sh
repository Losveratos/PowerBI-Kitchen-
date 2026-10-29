#!/usr/bin/env bash
# Alles, was `pbir batch` nicht kann: Button-Aktionen, Sortierung, Top-N,
# Anzeigeeinheiten, Untertitel, Slicer-Vorauswahl, Annotationen.
# Bewusst OHNE set -e: einzelne Visualtypen kennen manche Eigenschaft nicht,
# das darf den Rest nicht abbrechen.

# Nav-Button 'Detail Produktlinie' -> Seite 'Detail Produktlinie'
pbir visuals action "Test.Report/Übersicht.Page/chrome_nav_2.Visual" --type PageNavigation --target "Detail Produktlinie"

# Sortierung: value desc
pbir visuals sort "Test.Report/Übersicht.Page/mk_bars01.Visual" --field _Measures.Umsatz --direction Descending
# Top 5 nach _Measures.Umsatz
pbir add filter DimRegion Region -v "Test.Report/Übersicht.Page/mk_bars01.Visual" --type TopN --n 5 --by-table _Measures --by-field Umsatz --direction Top
# Anzeigeeinheiten fuer mk_bars01
pbir visuals labels "Test.Report/Übersicht.Page/mk_bars01.Visual" --labelDisplayUnits Thousands
pbir visuals labels "Test.Report/Übersicht.Page/mk_bars01.Visual" --labelPrecision 1
# Einheit als Untertitel
pbir set "Test.Report/Übersicht.Page/mk_bars01.Visual.subTitle.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_bars01.Visual.subTitle.text" --value "T€"
# Notiz/Workshop-Status als Annotation im Bericht ablegen
pbir add annotation "Test.Report/Übersicht.Page/mk_bars01.Visual" --text "Absteigend nach AC sortieren. · Prioritaet: must · Status: agreed · OFFENE FRAGE" --author mockup-to-powerbi --category Documentation
# Vorauswahl im Slicer „Year" = 2026
pbir add filter DimDate Year -v "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual" --values 2026
