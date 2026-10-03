#!/usr/bin/env bash
# Seitenhintergrund, Chrome-Texte, -Farben, Kachel-Container, Aktionen und z-Order.
# Fallback zu chrome-batch.json (ein Lauf statt vieler Aufrufe).
# Zuletzt ausfuehren: erst chrome-visuals.json, dann pbir-visuals.json einspielen.
set -euo pipefail

# Seitenhintergrund aus design.pageBackground
pbir pages background "Test.Report/Übersicht.Page" --color "#F4F4F1" --transparency 0

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

# Nav-Button 'Detail Produktlinie' -> Seite 'Detail Produktlinie'
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.outline.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.outline.lineColor" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.outline.transparency" --value 70
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.outline.weight" --value 1
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.text.default.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.shape.default.tileShape" --value rectangleRounded
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.shape.default.rectangleRoundedCurve" --value 4
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.text.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.text.default.text" --value "Detail Produktlinie"
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.text.default.fontSize" --value 8.5
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.text.default.horizontalAlignment" --value center
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.text.default.verticalAlignment" --value middle
pbir visuals action "Test.Report/Übersicht.Page/chrome_nav_2.Visual" --type PageNavigation --target "Detail Produktlinie"
pbir visuals position "Test.Report/Übersicht.Page/chrome_nav_2.Visual" --z 5

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
pbir set "Test.Report/Übersicht.Page/chrome_filter_bg.Visual.shape.rectangleRoundedCurve" --value 8
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
pbir visuals hide "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual"
pbir visuals hide "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual"

# Fußleiste — Flaeche
pbir set "Test.Report/Übersicht.Page/chrome_footer_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Übersicht.Page/chrome_footer_bg.Visual.fill.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_footer_bg.Visual.fill.fillColor" --value "#F4F4F1"
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

# Text-Kachel „Kommentar" — Text als shape (eine Textbox bliebe per CLI leer)
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.text.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.text.default.text" --value Kommentar
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.text.default.fontSize" --value 11
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.text.default.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.text.default.verticalAlignment" --value top
pbir visuals position "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual" --z 10

# Kachel-Container aus design: tileStyle 'border', Ecken 8 px, Hintergrund #FFFFFF — dasselbe steht als Theme-Fragment in theme-fragment.json (Theme schlaegt Overrides)
pbir set "Test.Report/Übersicht.Page/p1_v02_Kosten.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_v02_Kosten.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/p1_v02_Kosten.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/p1_v02_Kosten.Visual.border.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_v02_Kosten.Visual.border.color" --value "#E1DFD6"
pbir set "Test.Report/Übersicht.Page/p1_v02_Kosten.Visual.border.width" --value 1
pbir set "Test.Report/Übersicht.Page/p1_v02_Kosten.Visual.dropShadow.show" --value false
pbir set "Test.Report/Übersicht.Page/p1_v02_Kosten.Visual.border.radius" --value 8
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.border.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.border.color" --value "#E1DFD6"
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.border.width" --value 1
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.dropShadow.show" --value false
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.border.radius" --value 8
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.border.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.border.color" --value "#E1DFD6"
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.border.width" --value 1
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.dropShadow.show" --value false
pbir set "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual.border.radius" --value 8

# Optik aus dem Kitchen: IBCS-Skizzen ohne Legende, Wertachse und Gitter, mit Werten und Szenariofarben (AC #404040, PY #B3B3B3, PL Umriss); Power-BI-Klassiker mit gepunktetem Gitter
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.legend.show" --value false
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.valueAxis.show" --value false
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.valueAxis.gridlineShow" --value false
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.labels.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.labels.color" --value "#404040"
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.dataPoint.field(_Measures.AC).fill" --value "#404040"
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.dataPoint.field(_Measures.PL).fill" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.dataPoint.field(_Measures.PL).borderShow" --value true
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.dataPoint.field(_Measures.PL).borderColor" --value "#404040"
pbir set "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual.dataPoint.field(_Measures.PL).borderSize" --value 1

# Slicer im Kitchen-Kasten: Rahmen #D9D6CC, Kopf an, Container-Titel aus
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.title.show" --value false
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.border.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.border.color" --value "#D9D6CC"
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.border.width" --value 1
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.border.radius" --value 4
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.dropShadow.show" --value false
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.header.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.header.textSize" --value 8
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.header.fontColor" --value "#374151"
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.header.bold" --value false
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.items.textSize" --value 8
pbir set "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual.items.fontColor" --value "#374151"
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.title.show" --value false
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.border.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.border.color" --value "#D9D6CC"
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.border.width" --value 1
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.border.radius" --value 4
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.dropShadow.show" --value false
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.header.show" --value true
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.header.textSize" --value 8
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.header.fontColor" --value "#374151"
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.header.bold" --value false
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.items.textSize" --value 8
pbir set "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual.items.fontColor" --value "#374151"

# Inhalt ueber die Chrome-Flaechen legen (--from-json vergibt immer z=0)
pbir visuals position "Test.Report/Übersicht.Page/p1_v02_Kosten.Visual" --z 10
pbir visuals position "Test.Report/Übersicht.Page/p1_v05_PL_je_Produktlinie.Visual" --z 10
pbir visuals position "Test.Report/Übersicht.Page/p1_v07_Kommentar.Visual" --z 10

# Slicer (Overlay-Panel)
pbir visuals position "Test.Report/Übersicht.Page/p1_slicer1_Year.Visual" --z 24
pbir visuals position "Test.Report/Übersicht.Page/p1_slicer2_Region.Visual" --z 24

