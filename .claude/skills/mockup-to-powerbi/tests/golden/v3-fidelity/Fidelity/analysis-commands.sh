#!/usr/bin/env bash
# Alles, was `pbir batch` nicht kann: Button-Aktionen, Sortierung, Top-N,
# Anzeigeeinheiten, Untertitel, Slicer-Vorauswahl, Annotationen.
# Bewusst OHNE set -e: einzelne Visualtypen kennen manche Eigenschaft nicht,
# das darf den Rest nicht abbrechen.

# Filter-Overlay: Grundzustand ausgeblendet
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_bg.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_title.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_text.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_close.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual"

# Anzeigeeinheiten fuer mk_bars1
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.labels.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.labels.labelDisplayUnits" --value 1000000
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.labels.labelPrecision" --value 1
