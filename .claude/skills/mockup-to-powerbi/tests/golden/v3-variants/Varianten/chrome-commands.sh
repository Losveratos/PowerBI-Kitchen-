#!/usr/bin/env bash
# Seitenhintergrund, Chrome-Texte, -Farben, Kachel-Container, Aktionen und z-Order.
# Fallback zu chrome-batch.json (ein Lauf statt vieler Aufrufe).
# Zuletzt ausfuehren: erst chrome-visuals.json, dann pbir-visuals.json einspielen.
set -euo pipefail

# Seitenhintergrund aus design.pageBackground
pbir pages background "Test.Report/Varianten.Page" --color "#F4F4F1" --transparency 0

# Kopfband — Flaeche
pbir set "Test.Report/Varianten.Page/chrome_header_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Varianten.Page/chrome_header_bg.Visual.fill.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_header_bg.Visual.fill.fillColor" --value "#FFFFFF"
pbir set "Test.Report/Varianten.Page/chrome_header_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Varianten.Page/chrome_header_bg.Visual" --z 0

# Kopfband-Unterkante (Linie #E3E1D8)
pbir set "Test.Report/Varianten.Page/chrome_header_rule.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Varianten.Page/chrome_header_rule.Visual.fill.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_header_rule.Visual.fill.fillColor" --value "#E3E1D8"
pbir set "Test.Report/Varianten.Page/chrome_header_rule.Visual.outline.show" --value false
pbir visuals position "Test.Report/Varianten.Page/chrome_header_rule.Visual" --z 1

# Logo-Platzhalter (Kitchen: gestrichelter Kasten 88 x 30 px; Power BI kennt keinen gestrichelten Umriss) — durch ein Bild ersetzen:
#   pbir rm "Test.Report/Varianten.Page/chrome_logo.Visual" -f
#   pbir add visual image "Test.Report/Varianten.Page" -n chrome_logo -x 16 -y 13 -w 88 -h 30 --image "<Pfad zum Logo>"
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.fill.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.outline.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.outline.lineColor" --value "#0F1E2E"
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.outline.transparency" --value 60
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.outline.weight" --value 1
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.shape.tileShape" --value rectangleRounded
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.shape.rectangleRoundedCurve" --value 4
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.text.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.text.default.text" --value LOGO
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.text.default.fontSize" --value 7.5
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.text.default.fontColor" --value "#6F7882"
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.text.default.horizontalAlignment" --value center
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.text.default.verticalAlignment" --value middle
pbir visuals position "Test.Report/Varianten.Page/chrome_logo.Visual" --z 4

# Kopfband-Titel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.fill.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.outline.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.default.text" --value "Vertrieb 2026"
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.default.fontSize" --value 13
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.default.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.default.bottomMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.default.bold" --value true
pbir visuals position "Test.Report/Varianten.Page/chrome_header_title.Visual" --z 4

# Kopfband-Untertitel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.fill.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.outline.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.default.text" --value "Umsatz und Kosten je Region"
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.default.fontSize" --value 8.5
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.default.fontColor" --value "#57626D"
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.default.bottomMargin" --value 0
pbir visuals position "Test.Report/Varianten.Page/chrome_header_subtitle.Visual" --z 4

# Filter-Panel — Flaeche
pbir set "Test.Report/Varianten.Page/chrome_filter_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Varianten.Page/chrome_filter_bg.Visual.fill.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_filter_bg.Visual.fill.fillColor" --value "#ECEBE5"
pbir set "Test.Report/Varianten.Page/chrome_filter_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Varianten.Page/chrome_filter_bg.Visual" --z 0

# Filter-Panel Kante (Linie #E3E1D8)
pbir set "Test.Report/Varianten.Page/chrome_filter_rule.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Varianten.Page/chrome_filter_rule.Visual.fill.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_filter_rule.Visual.fill.fillColor" --value "#E3E1D8"
pbir set "Test.Report/Varianten.Page/chrome_filter_rule.Visual.outline.show" --value false
pbir visuals position "Test.Report/Varianten.Page/chrome_filter_rule.Visual" --z 1

# Filter-Überschrift — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.fill.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.outline.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.default.text" --value FILTER
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.default.fontSize" --value 8.5
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.default.fontColor" --value "#6B7280"
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.default.bottomMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.default.bold" --value true
pbir visuals position "Test.Report/Varianten.Page/chrome_filter_title.Visual" --z 4

# Fußleiste — Flaeche
pbir set "Test.Report/Varianten.Page/chrome_footer_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Varianten.Page/chrome_footer_bg.Visual.fill.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_footer_bg.Visual.fill.fillColor" --value "#F4F4F1"
pbir set "Test.Report/Varianten.Page/chrome_footer_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Varianten.Page/chrome_footer_bg.Visual" --z 0

# Fußleiste Oberkante (Linie #E3E1D8)
pbir set "Test.Report/Varianten.Page/chrome_footer_rule.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Varianten.Page/chrome_footer_rule.Visual.fill.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_footer_rule.Visual.fill.fillColor" --value "#E3E1D8"
pbir set "Test.Report/Varianten.Page/chrome_footer_rule.Visual.outline.show" --value false
pbir visuals position "Test.Report/Varianten.Page/chrome_footer_rule.Visual" --z 1

# Fußleisten-Text — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.fill.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.outline.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.default.text" --value "Stand: taeglich 6 Uhr · Quelle: DWH"
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.default.fontSize" --value 7.5
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.default.fontColor" --value "#6B7280"
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.default.bottomMargin" --value 0
pbir visuals position "Test.Report/Varianten.Page/chrome_footer_text.Visual" --z 4

# Kachel-Container aus design: tileStyle 'flat', Ecken 4 px, Hintergrund #FFFFFF — dasselbe steht als Theme-Fragment in theme-fragment.json (Theme schlaegt Overrides)
pbir set "Test.Report/Varianten.Page/mk_col1.Visual.background.show" --value true
pbir set "Test.Report/Varianten.Page/mk_col1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Varianten.Page/mk_col1.Visual.background.transparency" --value 0
pbir set "Test.Report/Varianten.Page/mk_col1.Visual.border.show" --value false
pbir set "Test.Report/Varianten.Page/mk_col1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Varianten.Page/mk_col1.Visual.border.radius" --value 4
pbir set "Test.Report/Varianten.Page/mk_bar1.Visual.background.show" --value true
pbir set "Test.Report/Varianten.Page/mk_bar1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Varianten.Page/mk_bar1.Visual.background.transparency" --value 0
pbir set "Test.Report/Varianten.Page/mk_bar1.Visual.border.show" --value false
pbir set "Test.Report/Varianten.Page/mk_bar1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Varianten.Page/mk_bar1.Visual.border.radius" --value 4
pbir set "Test.Report/Varianten.Page/mk_line1.Visual.background.show" --value true
pbir set "Test.Report/Varianten.Page/mk_line1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Varianten.Page/mk_line1.Visual.background.transparency" --value 0
pbir set "Test.Report/Varianten.Page/mk_line1.Visual.border.show" --value false
pbir set "Test.Report/Varianten.Page/mk_line1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Varianten.Page/mk_line1.Visual.border.radius" --value 4
pbir set "Test.Report/Varianten.Page/mk_donut1.Visual.background.show" --value true
pbir set "Test.Report/Varianten.Page/mk_donut1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Varianten.Page/mk_donut1.Visual.background.transparency" --value 0
pbir set "Test.Report/Varianten.Page/mk_donut1.Visual.border.show" --value false
pbir set "Test.Report/Varianten.Page/mk_donut1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Varianten.Page/mk_donut1.Visual.border.radius" --value 4
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.background.show" --value true
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.background.transparency" --value 0
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.border.show" --value false
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.border.radius" --value 4

# Optik aus dem Kitchen: IBCS-Skizzen ohne Legende, Wertachse und Gitter, mit Werten und Szenariofarben (AC #404040, PY #B3B3B3, PL Umriss); Power-BI-Klassiker mit gepunktetem Gitter
pbir set "Test.Report/Varianten.Page/mk_col1.Visual.valueAxis.gridlineStyle" --value dotted
pbir set "Test.Report/Varianten.Page/mk_bar1.Visual.valueAxis.gridlineStyle" --value dotted
pbir set "Test.Report/Varianten.Page/mk_line1.Visual.valueAxis.gridlineStyle" --value dotted
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.legend.show" --value false
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.valueAxis.show" --value false
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.valueAxis.gridlineShow" --value false
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.labels.show" --value true
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.labels.color" --value "#404040"
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.sentimentColors.increaseFill" --value "#1E8F9E"
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.sentimentColors.decreaseFill" --value "#D64541"
pbir set "Test.Report/Varianten.Page/mk_wf1.Visual.sentimentColors.totalFill" --value "#404040"

# Slicer im Kitchen-Kasten: Rahmen #D9D6CC, Kopf an, Container-Titel aus
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.title.show" --value false
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.background.show" --value true
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.background.transparency" --value 0
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.border.show" --value true
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.border.color" --value "#D9D6CC"
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.border.width" --value 1
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.border.radius" --value 4
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.header.show" --value true
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.header.textSize" --value 8
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.header.fontColor" --value "#374151"
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.header.bold" --value false
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.items.textSize" --value 8
pbir set "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual.items.fontColor" --value "#374151"

# Inhalt ueber die Chrome-Flaechen legen (--from-json vergibt immer z=0)
pbir visuals position "Test.Report/Varianten.Page/mk_col1.Visual" --z 10
pbir visuals position "Test.Report/Varianten.Page/mk_bar1.Visual" --z 10
pbir visuals position "Test.Report/Varianten.Page/mk_line1.Visual" --z 10
pbir visuals position "Test.Report/Varianten.Page/mk_donut1.Visual" --z 10
pbir visuals position "Test.Report/Varianten.Page/mk_wf1.Visual" --z 10

# Slicer
pbir visuals position "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual" --z 10

