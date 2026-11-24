#!/usr/bin/env bash
# Seitenhintergrund, Chrome-Texte, -Farben, Kachel-Container, Aktionen und z-Order.
# Fallback zu chrome-batch.json (ein Lauf statt vieler Aufrufe).
# Zuletzt ausfuehren: erst chrome-visuals.json, dann pbir-visuals.json einspielen.
set -euo pipefail

# Seitenhintergrund aus design.pageBackground
pbir pages background "Test.Report/Übersicht.Page" --color "#EEF1F5" --transparency 0

# Kopfband — Flaeche
pbir set "Test.Report/Übersicht.Page/chrome_header_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Übersicht.Page/chrome_header_bg.Visual.fill.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_header_bg.Visual.fill.fillColor" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/chrome_header_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Übersicht.Page/chrome_header_bg.Visual" --z 0

# Kopfband-Unterkante (Linie #E3E1D8)
pbir set "Test.Report/Übersicht.Page/chrome_header_rule.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Übersicht.Page/chrome_header_rule.Visual.fill.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_header_rule.Visual.fill.fillColor" --value "#E3E1D8"
pbir set "Test.Report/Übersicht.Page/chrome_header_rule.Visual.outline.show" --value false
pbir visuals position "Test.Report/Übersicht.Page/chrome_header_rule.Visual" --z 1

# Burger-Button — oeffnet das Filter-Overlay ueber ein Lesezeichen
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.outline.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.outline.lineColor" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.outline.transparency" --value 70
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.outline.weight" --value 1
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.shape.default.tileShape" --value rectangleRounded
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.shape.default.rectangleRoundedCurve" --value 4
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.text.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.text.default.text" --value "☰"
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.text.default.fontSize" --value 12
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.text.default.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.text.default.horizontalAlignment" --value center
pbir set "Test.Report/Übersicht.Page/chrome_burger.Visual.text.default.verticalAlignment" --value middle
pbir visuals position "Test.Report/Übersicht.Page/chrome_burger.Visual" --z 5

# Logo-Platzhalter (Kitchen: gestrichelter Kasten 88 x 30 px; Power BI kennt keinen gestrichelten Umriss) — durch ein Bild ersetzen:
#   pbir rm "Test.Report/Übersicht.Page/chrome_logo.Visual" -f
#   pbir add visual image "Test.Report/Übersicht.Page" -n chrome_logo -x 1176 -y 13 -w 88 -h 30 --image "<Pfad zum Logo>"
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.outline.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.outline.lineColor" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.outline.transparency" --value 60
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.outline.weight" --value 1
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.shape.tileShape" --value rectangleRounded
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.shape.rectangleRoundedCurve" --value 4
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.text.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.text.default.text" --value LOGO
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.text.default.fontSize" --value 7.5
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.text.default.fontColor" --value "#6F7882"
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.text.default.horizontalAlignment" --value center
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.text.default.verticalAlignment" --value middle
pbir visuals position "Test.Report/Übersicht.Page/chrome_logo.Visual" --z 4

# Achtung: pbir schreibt --target 1:1 in navigationSection.
# Springt der Button in Desktop nicht, den INTERNEN Seitennamen
# (page.json -> name, z. B. c98a70696fe77757) als --target setzen.

# Nav-Button 'Übersicht' — aktive Seite, ohne Aktion
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.fill.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.fill.fillColor" --value "#C25A2D"
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.outline.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.outline.lineColor" --value "#C25A2D"
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.outline.weight" --value 1
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.text.default.fontColor" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.shape.default.tileShape" --value rectangleRounded
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.shape.default.rectangleRoundedCurve" --value 4
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.text.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.text.default.text" --value "Übersicht"
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.text.default.fontSize" --value 8.5
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.text.default.horizontalAlignment" --value center
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.text.default.verticalAlignment" --value middle
pbir visuals position "Test.Report/Übersicht.Page/chrome_nav_1.Visual" --z 5

# Kopfband-Titel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.default.text" --value "Management Report"
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.default.fontSize" --value 13
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.default.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.default.bottomMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.default.bold" --value true
pbir visuals position "Test.Report/Übersicht.Page/chrome_header_title.Visual" --z 4

# Kopfband-Untertitel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.default.text" --value "in T€ · YTD 2026"
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.default.fontSize" --value 8.5
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.default.fontColor" --value "#57626D"
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.default.bottomMargin" --value 0
pbir visuals position "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual" --z 4

# Filter-Panel — Flaeche
pbir set "Test.Report/Übersicht.Page/chrome_filter_bg.Visual.shape.tileShape" --value rectangleRounded
pbir set "Test.Report/Übersicht.Page/chrome_filter_bg.Visual.shape.rectangleRoundedCurve" --value 12
pbir set "Test.Report/Übersicht.Page/chrome_filter_bg.Visual.fill.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_filter_bg.Visual.fill.fillColor" --value "#ECEBE5"
pbir set "Test.Report/Übersicht.Page/chrome_filter_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Übersicht.Page/chrome_filter_bg.Visual" --z 20

# Filter-Überschrift — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.default.text" --value FILTER
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.default.fontSize" --value 8.5
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.default.fontColor" --value "#6B7280"
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.default.bottomMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.default.bold" --value true
pbir visuals position "Test.Report/Übersicht.Page/chrome_filter_title.Visual" --z 22

# Schliessen-Button des Panels — Ziel ist das Lesezeichen 'Filter schliessen' (siehe navigation.md)
pbir set "Test.Report/Übersicht.Page/chrome_filter_close.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_filter_close.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_filter_close.Visual.text.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_filter_close.Visual.text.default.text" --value "✕"
pbir set "Test.Report/Übersicht.Page/chrome_filter_close.Visual.text.default.fontSize" --value 10.5
pbir set "Test.Report/Übersicht.Page/chrome_filter_close.Visual.text.default.fontColor" --value "#6B7280"
pbir set "Test.Report/Übersicht.Page/chrome_filter_close.Visual.text.default.horizontalAlignment" --value center
pbir set "Test.Report/Übersicht.Page/chrome_filter_close.Visual.text.default.verticalAlignment" --value middle
pbir visuals position "Test.Report/Übersicht.Page/chrome_filter_close.Visual" --z 24

# Filter-Overlay: Grundzustand ausgeblendet
pbir visuals hide "Test.Report/Übersicht.Page/chrome_filter_bg.Visual"
pbir visuals hide "Test.Report/Übersicht.Page/chrome_filter_title.Visual"
pbir visuals hide "Test.Report/Übersicht.Page/chrome_filter_close.Visual"
pbir visuals hide "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual"
pbir visuals hide "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual"

# Fußleiste — Flaeche
pbir set "Test.Report/Übersicht.Page/chrome_footer_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Übersicht.Page/chrome_footer_bg.Visual.fill.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_footer_bg.Visual.fill.fillColor" --value "#EEF1F5"
pbir set "Test.Report/Übersicht.Page/chrome_footer_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Übersicht.Page/chrome_footer_bg.Visual" --z 0

# Fußleiste Oberkante (Linie #E3E1D8)
pbir set "Test.Report/Übersicht.Page/chrome_footer_rule.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Übersicht.Page/chrome_footer_rule.Visual.fill.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_footer_rule.Visual.fill.fillColor" --value "#E3E1D8"
pbir set "Test.Report/Übersicht.Page/chrome_footer_rule.Visual.outline.show" --value false
pbir visuals position "Test.Report/Übersicht.Page/chrome_footer_rule.Visual" --z 1

# Fußleisten-Text — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.default.text" --value "Stand: <datum> · Quelle: DWH · Kontakt: Controlling"
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.default.fontSize" --value 7.5
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.default.fontColor" --value "#6B7280"
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.default.bottomMargin" --value 0
pbir visuals position "Test.Report/Übersicht.Page/chrome_footer_text.Visual" --z 4

# Kachel-Container aus design: tileStyle 'shadow', Ecken 12 px, Hintergrund #FFFFFF — dasselbe steht als Theme-Fragment in theme-fragment.json (Theme schlaegt Overrides)
pbir set "Test.Report/Übersicht.Page/mk_5z33e3b.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_5z33e3b.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/mk_5z33e3b.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/mk_5z33e3b.Visual.border.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_5z33e3b.Visual.dropShadow.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_5z33e3b.Visual.dropShadow.preset" --value BottomRight
pbir set "Test.Report/Übersicht.Page/mk_5z33e3b.Visual.dropShadow.color" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/mk_5z33e3b.Visual.dropShadow.transparency" --value 85
pbir set "Test.Report/Übersicht.Page/mk_5z33e3b.Visual.border.radius" --value 12
pbir set "Test.Report/Übersicht.Page/mk_ldc3xxy.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_ldc3xxy.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/mk_ldc3xxy.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/mk_ldc3xxy.Visual.border.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_ldc3xxy.Visual.dropShadow.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_ldc3xxy.Visual.dropShadow.preset" --value BottomRight
pbir set "Test.Report/Übersicht.Page/mk_ldc3xxy.Visual.dropShadow.color" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/mk_ldc3xxy.Visual.dropShadow.transparency" --value 85
pbir set "Test.Report/Übersicht.Page/mk_ldc3xxy.Visual.border.radius" --value 12

# Slicer im Kitchen-Kasten: Rahmen #D9D6CC, Kopf an, Container-Titel aus
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.title.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.border.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.border.color" --value "#D9D6CC"
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.border.width" --value 1
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.border.radius" --value 4
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.header.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.header.textSize" --value 8
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.header.fontColor" --value "#374151"
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.header.bold" --value false
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.items.textSize" --value 8
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.items.fontColor" --value "#374151"
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.title.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.border.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.border.color" --value "#D9D6CC"
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.border.width" --value 1
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.border.radius" --value 4
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.header.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.header.textSize" --value 8
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.header.fontColor" --value "#374151"
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.header.bold" --value false
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.items.textSize" --value 8
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.items.fontColor" --value "#374151"

# Inhalt ueber die Chrome-Flaechen legen (--from-json vergibt immer z=0)
pbir visuals position "Test.Report/Übersicht.Page/mk_5z33e3b.Visual" --z 10
pbir visuals position "Test.Report/Übersicht.Page/mk_ldc3xxy.Visual" --z 10

# Slicer (Overlay-Panel)
pbir visuals position "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual" --z 24
pbir visuals position "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual" --z 24

