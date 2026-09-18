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
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.text.fontColor" --value "#FFFFFF"
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.outline.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.text.text" --value "Projekt & GuV"
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.text.fontSize" --value 10
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.text.horizontalAlignment" --value center
pbir set "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual.text.verticalAlignment" --value middle
pbir visuals position "Test.Report/Projekt & GuV.Page/chrome_nav_1.Visual" --z 5

# Kopfband-Titel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.fill.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.outline.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.text" --value "Rollout 2026"
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.fontSize" --value 16
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.fontColor" --value "#F7FAFC"
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.verticalAlignment" --value middle
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual.text.bold" --value true
pbir visuals position "Test.Report/Projekt & GuV.Page/chrome_header_title.Visual" --z 4

# Kopfband-Untertitel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.fill.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.outline.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.text" --value "Projekt und Ergebnis"
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.fontSize" --value 10
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.fontColor" --value "#C8CDD4"
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual.text.verticalAlignment" --value middle
pbir visuals position "Test.Report/Projekt & GuV.Page/chrome_header_subtitle.Visual" --z 4

# Fußleiste — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.fill.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.outline.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.text" --value "Stand: 5. Werktag · Quelle: DWH"
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.fontSize" --value 9
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.fontColor" --value "#6B7280"
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual.text.verticalAlignment" --value middle
pbir visuals position "Test.Report/Projekt & GuV.Page/chrome_footer_text.Visual" --z 4

# Kachel-Container aus design: tileStyle 'border', Ecken 8 px, Hintergrund #FFFFFF — dasselbe steht als Theme-Fragment in theme-fragment.json (Theme schlaegt Overrides)
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.background.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.background.transparency" --value 0
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.border.show" --value true
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.border.color" --value "#E5E7EB"
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.border.width" --value 1
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Projekt & GuV.Page/mk_card1.Visual.border.radius" --value 8

# Inhalt ueber die Chrome-Flaechen legen (--from-json vergibt immer z=0)
pbir visuals position "Test.Report/Projekt & GuV.Page/mk_card1.Visual" --z 10

