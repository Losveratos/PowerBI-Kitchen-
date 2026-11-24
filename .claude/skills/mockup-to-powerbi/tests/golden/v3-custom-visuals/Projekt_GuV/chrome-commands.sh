#!/usr/bin/env bash
# Seitenhintergrund, Chrome-Texte, -Farben, Kachel-Container, Aktionen und z-Order.
# Fallback zu chrome-batch.json (ein Lauf statt vieler Aufrufe).
# Zuletzt ausfuehren: erst chrome-visuals.json, dann pbir-visuals.json einspielen.
set -euo pipefail

# Seitenhintergrund aus design.pageBackground
pbir pages background "Test.Report/Projekt & GuV.Page" --color "#F7F4EF" --transparency 0

# Kopfband — Flaeche
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_bg.Visual.fill.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_bg.Visual.fill.fillColor" --value "#123B4F"
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Projekt & GuV.Page/chrome_header_bg.Visual" --z 0

# Achtung: pbir schreibt --target 1:1 in navigationSection.
# Springt der Button in Desktop nicht, den INTERNEN Seitennamen
# (page.json -> name, z. B. c98a70696fe77757) als --target setzen.

# Nav-Button 'Projekt & GuV' — aktive Seite, ohne Aktion
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.fill.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.fill.fillColor" --value "#E07B39"
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.outline.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.outline.lineColor" --value "#E07B39"
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.outline.weight" --value 1
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.text.default.fontColor" --value "#FFFFFF"
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.shape.default.tileShape" --value rectangleRounded
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.shape.default.rectangleRoundedCurve" --value 4
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.text.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.text.default.text" --value "Projekt & GuV"
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.text.default.fontSize" --value 8.5
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.text.default.horizontalAlignment" --value center
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.text.default.verticalAlignment" --value middle
pbir visuals position "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual" --z 5

# Kopfband-Titel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.fill.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.outline.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.default.text" --value "Rollout 2026"
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.default.fontSize" --value 13
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.default.fontColor" --value "#F7FAFC"
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.default.bottomMargin" --value 0
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.default.bold" --value true
pbir visuals position "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual" --z 4

# Kopfband-Untertitel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.fill.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.outline.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.default.text" --value "Projekt und Ergebnis"
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.default.fontSize" --value 8.5
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.default.fontColor" --value "#B2C1C8"
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.default.bottomMargin" --value 0
pbir visuals position "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual" --z 4

# Fußleiste — Flaeche
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_bg.Visual.fill.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_bg.Visual.fill.fillColor" --value "#F7F4EF"
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Projekt & GuV.Page/chrome_footer_bg.Visual" --z 0

# Fußleiste Oberkante (Linie #E3E1D8)
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_rule.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_rule.Visual.fill.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_rule.Visual.fill.fillColor" --value "#E3E1D8"
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_rule.Visual.outline.show" --value false
pbir visuals position "Test.Report/Projekt & GuV.Page/chrome_footer_rule.Visual" --z 1

# Fußleisten-Text — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.fill.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.outline.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.default.text" --value "Stand: 5. Werktag · Quelle: DWH"
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.default.fontSize" --value 7.5
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.default.fontColor" --value "#6B7280"
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.default.horizontalAlignment" --value left
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.default.verticalAlignment" --value middle
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.default.leftMargin" --value 0
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.default.rightMargin" --value 0
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.default.topMargin" --value 0
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.default.bottomMargin" --value 0
pbir visuals position "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual" --z 4

# Kachel-Container aus design: tileStyle 'border', Ecken 8 px, Hintergrund #FFFFFF — dasselbe steht als Theme-Fragment in theme-fragment.json (Theme schlaegt Overrides)
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.background.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.background.transparency" --value 0
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.border.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.border.color" --value "#E1DFD6"
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.border.width" --value 1
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.border.radius" --value 8

# Inhalt ueber die Chrome-Flaechen legen (--from-json vergibt immer z=0)
pbir visuals position "Test.Report/Projekt & GuV.Page/mk_card1.Visual" --z 10

