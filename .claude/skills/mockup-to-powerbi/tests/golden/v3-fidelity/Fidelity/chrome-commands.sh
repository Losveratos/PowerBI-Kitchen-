#!/usr/bin/env bash
# Seitenhintergrund, Chrome-Texte, -Farben, Kachel-Container, Aktionen und z-Order.
# Fallback zu chrome-batch.json (ein Lauf statt vieler Aufrufe).
# Zuletzt ausfuehren: erst chrome-visuals.json, dann pbir-visuals.json einspielen.
set -euo pipefail

# Seitenhintergrund aus design.pageBackground
pbir pages background "Test.Report/Fidelity.Page" --color "#F4F4F1" --transparency 0

# Kopfband — Flaeche
pbir set "Test.Report/Fidelity.Page/chrome_header_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Fidelity.Page/chrome_header_bg.Visual.fill.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_header_bg.Visual.fill.fillColor" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/chrome_header_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Fidelity.Page/chrome_header_bg.Visual" --z 0

# Kopfband-Unterkante (Linie #E3E1D8)
pbir set "Test.Report/Fidelity.Page/chrome_header_rule.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Fidelity.Page/chrome_header_rule.Visual.fill.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_header_rule.Visual.fill.fillColor" --value "#E3E1D8"
pbir set "Test.Report/Fidelity.Page/chrome_header_rule.Visual.outline.show" --value false
pbir visuals position "Test.Report/Fidelity.Page/chrome_header_rule.Visual" --z 1

# Burger-Button — oeffnet das Filter-Overlay ueber ein Lesezeichen
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.fill.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.outline.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.outline.lineColor" --value "#0F1E2E"
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.outline.transparency" --value 70
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.outline.weight" --value 1
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.shape.default.tileShape" --value rectangleRounded
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.shape.default.rectangleRoundedCurve" --value 6
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.text.default.text" --value "☰"
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.text.default.fontSize" --value 18
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.text.default.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.text.default.horizontalAlignment" --value center
pbir set "Test.Report/Fidelity.Page/chrome_burger.Visual.text.default.verticalAlignment" --value middle
pbir visuals position "Test.Report/Fidelity.Page/chrome_burger.Visual" --z 5

# Logo-Platzhalter (Kitchen: gestrichelter Kasten 88 x 30 px; Power BI kennt keinen gestrichelten Umriss) — durch ein Bild ersetzen:
#   pbir rm "Test.Report/Fidelity.Page/chrome_logo.Visual" -f
#   pbir add visual image "Test.Report/Fidelity.Page" -n chrome_logo -x 93 -y 19 -w 132 -h 45 --image "<Pfad zum Logo>"
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.fill.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.outline.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.outline.lineColor" --value "#0F1E2E"
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.outline.transparency" --value 60
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.outline.weight" --value 1
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.shape.tileShape" --value rectangleRounded
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.shape.rectangleRoundedCurve" --value 6
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.text.default.text" --value LOGO
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.text.default.fontSize" --value 11.5
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.text.default.fontColor" --value "#6F7882"
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.text.default.horizontalAlignment" --value center
pbir set "Test.Report/Fidelity.Page/chrome_logo.Visual.text.default.verticalAlignment" --value middle
pbir visuals position "Test.Report/Fidelity.Page/chrome_logo.Visual" --z 4

# Kopfband-Titel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.fill.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.outline.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.text.default.text" --value Treue-Test
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.text.default.fontSize" --value 19
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.text.default.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.text.default.bottomMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_header_title.Visual.text.default.bold" --value true
pbir visuals position "Test.Report/Fidelity.Page/chrome_header_title.Visual" --z 4

# Kopfband-Untertitel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.fill.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.outline.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.text.default.text" --value "Werte 2026"
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.text.default.fontSize" --value 12.5
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.text.default.fontColor" --value "#57626D"
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual.text.default.bottomMargin" --value 0
pbir visuals position "Test.Report/Fidelity.Page/chrome_header_subtitle.Visual" --z 4

# Filter-Panel — Flaeche
pbir set "Test.Report/Fidelity.Page/chrome_filter_bg.Visual.shape.tileShape" --value rectangleRounded
pbir set "Test.Report/Fidelity.Page/chrome_filter_bg.Visual.shape.rectangleRoundedCurve" --value 12
pbir set "Test.Report/Fidelity.Page/chrome_filter_bg.Visual.fill.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_filter_bg.Visual.fill.fillColor" --value "#E9E6DC"
pbir set "Test.Report/Fidelity.Page/chrome_filter_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Fidelity.Page/chrome_filter_bg.Visual" --z 20

# Filter-Überschrift — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.fill.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.outline.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.text.default.text" --value FILTER
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.text.default.fontSize" --value 12.5
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.text.default.fontColor" --value "#6B7280"
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.text.default.bottomMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_filter_title.Visual.text.default.bold" --value true
pbir visuals position "Test.Report/Fidelity.Page/chrome_filter_title.Visual" --z 22

# Filter-Hinweistext — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.fill.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.outline.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.text.default.text" --value "Werte in Tsd. EUR"
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.text.default.fontSize" --value 10.5
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.text.default.fontColor" --value "#6B7280"
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.text.default.verticalAlignment" --value top
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_filter_text.Visual.text.default.bottomMargin" --value 0
pbir visuals position "Test.Report/Fidelity.Page/chrome_filter_text.Visual" --z 22

# Schliessen-Button des Panels — Ziel ist das Lesezeichen 'Filter schliessen' (siehe navigation.md)
pbir set "Test.Report/Fidelity.Page/chrome_filter_close.Visual.fill.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_filter_close.Visual.outline.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_filter_close.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_filter_close.Visual.text.default.text" --value "✕"
pbir set "Test.Report/Fidelity.Page/chrome_filter_close.Visual.text.default.fontSize" --value 16
pbir set "Test.Report/Fidelity.Page/chrome_filter_close.Visual.text.default.fontColor" --value "#6B7280"
pbir set "Test.Report/Fidelity.Page/chrome_filter_close.Visual.text.default.horizontalAlignment" --value center
pbir set "Test.Report/Fidelity.Page/chrome_filter_close.Visual.text.default.verticalAlignment" --value middle
pbir visuals position "Test.Report/Fidelity.Page/chrome_filter_close.Visual" --z 24

# Filter-Overlay: Grundzustand ausgeblendet
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_bg.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_title.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_text.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_close.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual"

# Fußleiste — Flaeche
pbir set "Test.Report/Fidelity.Page/chrome_footer_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Fidelity.Page/chrome_footer_bg.Visual.fill.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_footer_bg.Visual.fill.fillColor" --value "#F4F4F1"
pbir set "Test.Report/Fidelity.Page/chrome_footer_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Fidelity.Page/chrome_footer_bg.Visual" --z 0

# Fußleiste Oberkante (Linie #E3E1D8)
pbir set "Test.Report/Fidelity.Page/chrome_footer_rule.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Fidelity.Page/chrome_footer_rule.Visual.fill.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_footer_rule.Visual.fill.fillColor" --value "#E3E1D8"
pbir set "Test.Report/Fidelity.Page/chrome_footer_rule.Visual.outline.show" --value false
pbir visuals position "Test.Report/Fidelity.Page/chrome_footer_rule.Visual" --z 1

# Fußleisten-Text — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.fill.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.outline.show" --value false
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.text.show" --value true
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.text.default.text" --value "Fußleiste: Quelle DWH"
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.text.default.fontSize" --value 11.5
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.text.default.fontColor" --value "#6B7280"
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Fidelity.Page/chrome_footer_text.Visual.text.default.bottomMargin" --value 0
pbir visuals position "Test.Report/Fidelity.Page/chrome_footer_text.Visual" --z 4

# Kachel-Container aus design: tileStyle 'border', Ecken 12 px, Hintergrund #FFFFFF — dasselbe steht als Theme-Fragment in theme-fragment.json (Theme schlaegt Overrides)
pbir set "Test.Report/Fidelity.Page/mk_heat1.Visual.background.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_heat1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_heat1.Visual.background.transparency" --value 0
pbir set "Test.Report/Fidelity.Page/mk_heat1.Visual.border.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_heat1.Visual.border.color" --value "#E1DFD6"
pbir set "Test.Report/Fidelity.Page/mk_heat1.Visual.border.width" --value 1
pbir set "Test.Report/Fidelity.Page/mk_heat1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_heat1.Visual.border.radius" --value 12
pbir set "Test.Report/Fidelity.Page/mk_spark1.Visual.background.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_spark1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_spark1.Visual.background.transparency" --value 0
pbir set "Test.Report/Fidelity.Page/mk_spark1.Visual.border.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_spark1.Visual.border.color" --value "#E1DFD6"
pbir set "Test.Report/Fidelity.Page/mk_spark1.Visual.border.width" --value 1
pbir set "Test.Report/Fidelity.Page/mk_spark1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_spark1.Visual.border.radius" --value 12
pbir set "Test.Report/Fidelity.Page/mk_tree1.Visual.background.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_tree1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_tree1.Visual.background.transparency" --value 0
pbir set "Test.Report/Fidelity.Page/mk_tree1.Visual.border.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_tree1.Visual.border.color" --value "#E1DFD6"
pbir set "Test.Report/Fidelity.Page/mk_tree1.Visual.border.width" --value 1
pbir set "Test.Report/Fidelity.Page/mk_tree1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_tree1.Visual.border.radius" --value 12
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.background.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.background.transparency" --value 0
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.border.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.border.color" --value "#E1DFD6"
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.border.width" --value 1
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.border.radius" --value 12
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.background.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.background.transparency" --value 0
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.border.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.border.color" --value "#E1DFD6"
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.border.width" --value 1
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.border.radius" --value 12
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.background.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.background.transparency" --value 0
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.border.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.border.color" --value "#E1DFD6"
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.border.width" --value 1
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.border.radius" --value 12
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.background.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.background.transparency" --value 0
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.border.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.border.color" --value "#E1DFD6"
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.border.width" --value 1
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.border.radius" --value 12

# Typografie aus design.typography: Titel 13.5 pt, Untertitel 10.5 pt (Kacheln mit eigener Skalierung weichen ab)
pbir set "Test.Report/Fidelity.Page/mk_heat1.Visual.title.fontSize" --value 13.5
pbir set "Test.Report/Fidelity.Page/mk_heat1.Visual.subTitle.fontSize" --value 10.5
pbir set "Test.Report/Fidelity.Page/mk_spark1.Visual.title.fontSize" --value 13.5
pbir set "Test.Report/Fidelity.Page/mk_spark1.Visual.subTitle.fontSize" --value 10.5
pbir set "Test.Report/Fidelity.Page/mk_tree1.Visual.title.fontSize" --value 13.5
pbir set "Test.Report/Fidelity.Page/mk_tree1.Visual.subTitle.fontSize" --value 10.5
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.title.fontSize" --value 13.5
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.subTitle.fontSize" --value 10.5
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.title.fontSize" --value 13.5
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.subTitle.fontSize" --value 10.5
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.title.fontSize" --value 13.5
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.subTitle.fontSize" --value 10.5
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.title.fontSize" --value 13.5
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.subTitle.fontSize" --value 10.5

# Optik aus dem Kitchen: IBCS-Skizzen ohne Legende, Wertachse und Gitter, mit Werten und Szenariofarben (AC #404040, PY #B3B3B3, PL Umriss); Power-BI-Klassiker mit gepunktetem Gitter
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.legend.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.valueAxis.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.valueAxis.gridlineShow" --value false
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.labels.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.labels.color" --value "#404040"
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.labels.fontSize" --value 10
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.dataPoint.field(_Measures.AC).fill" --value "#404040"
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.dataPoint.field(_Measures.PL).fill" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.dataPoint.field(_Measures.PL).borderShow" --value true
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.dataPoint.field(_Measures.PL).borderColor" --value "#404040"
pbir set "Test.Report/Fidelity.Page/mk_bars1.Visual.dataPoint.field(_Measures.PL).borderSize" --value 1
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.title.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.legend.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.valueAxis.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.valueAxis.gridlineShow" --value false
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.labels.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.labels.color" --value "#404040"
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.labels.fontSize" --value 10
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.dataPoint.field(_Measures.Kosten).fill" --value "#404040"
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.dataPoint.field(_Measures.PY).fill" --value "#B3B3B3"
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.dataPoint.field(_Measures.PL).fill" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.dataPoint.field(_Measures.PL).borderShow" --value true
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.dataPoint.field(_Measures.PL).borderColor" --value "#404040"
pbir set "Test.Report/Fidelity.Page/mk_col1.Visual.dataPoint.field(_Measures.PL).borderSize" --value 1
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.valueAxis.gridlineStyle" --value dotted
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.dataPoint.field(_Measures.Umsatz).fill" --value "#1E8F9E"
pbir set "Test.Report/Fidelity.Page/mk_ncol1.Visual.dataPoint.field(_Measures.Kosten).fill" --value "#0F5560"
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.title.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.legend.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.valueAxis.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.valueAxis.gridlineShow" --value false
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.labels.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.labels.color" --value "#404040"
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.labels.fontSize" --value 10
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.dataPoint.field(_Measures.AC).fill" --value "#404040"
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.dataPoint.field(_Measures.PY).fill" --value "#B3B3B3"
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.dataPoint.field(_Measures.PL).fill" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.dataPoint.field(_Measures.PL).borderShow" --value true
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.dataPoint.field(_Measures.PL).borderColor" --value "#404040"
pbir set "Test.Report/Fidelity.Page/mk_kombi1.Visual.dataPoint.field(_Measures.PL).borderSize" --value 1

# Slicer im Kitchen-Kasten: Rahmen #D9D6CC, Kopf an, Container-Titel aus
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.title.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.background.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.background.transparency" --value 0
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.border.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.border.color" --value "#D9D6CC"
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.border.width" --value 1
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.border.radius" --value 6
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.header.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.header.textSize" --value 12
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.header.fontColor" --value "#374151"
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.header.bold" --value false
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.items.textSize" --value 12
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.items.fontColor" --value "#374151"
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.title.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.background.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.background.transparency" --value 0
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.border.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.border.color" --value "#D9D6CC"
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.border.width" --value 1
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.border.radius" --value 6
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.header.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.header.textSize" --value 12
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.header.fontColor" --value "#374151"
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.header.bold" --value false
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.items.textSize" --value 12
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.items.fontColor" --value "#374151"
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.title.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.background.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.background.transparency" --value 0
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.border.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.border.color" --value "#D9D6CC"
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.border.width" --value 1
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.border.radius" --value 6
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.header.show" --value true
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.header.textSize" --value 12
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.header.fontColor" --value "#374151"
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.header.bold" --value false
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.items.textSize" --value 12
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.items.fontColor" --value "#374151"

# Slicer „Region" als Dropdown (zones.filter.slicers[0].type = dropdown)
pbir set "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual.data.mode" --value Dropdown

# Slicer „Category" als Liste (zones.filter.slicers[1].type = list)
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.data.mode" --value Basic
pbir set "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual.general.orientation" --value 0

# Slicer „Year" als Dropdown (zones.filter.slicers[2].type = dropdown)
pbir set "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual.data.mode" --value Dropdown

# Inhalt ueber die Chrome-Flaechen legen (--from-json vergibt immer z=0)
pbir visuals position "Test.Report/Fidelity.Page/mk_heat1.Visual" --z 10
pbir visuals position "Test.Report/Fidelity.Page/mk_spark1.Visual" --z 10
pbir visuals position "Test.Report/Fidelity.Page/mk_tree1.Visual" --z 10
pbir visuals position "Test.Report/Fidelity.Page/mk_bars1.Visual" --z 10
pbir visuals position "Test.Report/Fidelity.Page/mk_col1.Visual" --z 10
pbir visuals position "Test.Report/Fidelity.Page/mk_ncol1.Visual" --z 10
pbir visuals position "Test.Report/Fidelity.Page/mk_kombi1.Visual" --z 10

# Slicer (Overlay-Panel)
pbir visuals position "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual" --z 24
pbir visuals position "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual" --z 24
pbir visuals position "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual" --z 24

