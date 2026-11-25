#!/usr/bin/env bash
# Alles, was `pbir batch` nicht kann: Button-Aktionen, Sortierung, Top-N,
# Anzeigeeinheiten, Untertitel, Slicer-Vorauswahl, Annotationen.
# Bewusst OHNE set -e: einzelne Visualtypen kennen manche Eigenschaft nicht,
# das darf den Rest nicht abbrechen.

# Sortierung: value desc
pbir visuals sort "Test.Report/Varianten.Page/mk_col1.Visual" --field _Measures.Umsatz --direction Descending
# Anzeigeeinheiten fuer mk_col1
pbir set "Test.Report/Varianten.Page/mk_col1.Visual.labels.show" --value true
pbir set "Test.Report/Varianten.Page/mk_col1.Visual.labels.labelDisplayUnits" --value 1000
pbir set "Test.Report/Varianten.Page/mk_col1.Visual.labels.labelPrecision" --value 0
# Notiz/Workshop-Status als Annotation im Bericht ablegen
pbir add annotation "Test.Report/Varianten.Page/mk_col1.Visual" --text "Ein Mini-Chart je Region. · Prioritaet: must · Status: agreed" --author mockup-to-powerbi --category Documentation
# Slicer auf den Feldparameter „Achse" — Vorschlag, nicht ausgefuehrt: das Mockup sieht diese Kachel nicht vor.
#   pbir add visual slicer "Test.Report/Varianten.Page" -n mk_param_Achse_p1 -x 1074 -y 175 -w 180 -h 76 -t "Achse" && pbir visuals bind "Test.Report/Varianten.Page/mk_param_Achse_p1.Visual" -a "Values:Achse.Achse"

# Untertitel aus der Spec
pbir set "Test.Report/Varianten.Page/mk_bar1.Visual.subTitle.show" --value true
pbir set "Test.Report/Varianten.Page/mk_bar1.Visual.subTitle.text" --value "Achse umschaltbar"
# Notiz/Workshop-Status als Annotation im Bericht ablegen
pbir add annotation "Test.Report/Varianten.Page/mk_bar1.Visual" --text "Slicer auf den Parameter nicht vergessen. · Prioritaet: should" --author mockup-to-powerbi --category Documentation
# Notiz/Workshop-Status als Annotation im Bericht ablegen
pbir add annotation "Test.Report/Varianten.Page/mk_line1.Visual" --text "Aufteilungsfeld fehlt noch. · OFFENE FRAGE" --author mockup-to-powerbi --category Documentation
# Notiz/Workshop-Status als Annotation im Bericht ablegen
pbir add annotation "Test.Report/Varianten.Page/mk_donut1.Visual" --text "Prioritaet: could" --author mockup-to-powerbi --category Documentation
# Notiz/Workshop-Status als Annotation im Bericht ablegen
pbir add annotation "Test.Report/Varianten.Page/mk_wf1.Visual" --text "waterfallChart hat keinen Small-Multiples-Bucket." --author mockup-to-powerbi --category Documentation
# Slicer auf den Feldparameter „CK-Achse" — Vorschlag, nicht ausgefuehrt: das Mockup sieht diese Kachel nicht vor.
#   pbir add visual slicer "Test.Report/Varianten.Page" -n mk_param_CK_Achse_p1 -x 1074 -y 258 -w 180 -h 76 -t "CK-Achse" && pbir visuals bind "Test.Report/Varianten.Page/mk_param_CK_Achse_p1.Visual" -a "Values:CK-Achse.CK-Achse"

