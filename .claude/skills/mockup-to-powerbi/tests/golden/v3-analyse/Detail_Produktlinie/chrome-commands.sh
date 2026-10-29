#!/usr/bin/env bash
# Seitenhintergrund, Chrome-Texte, -Farben, Kachel-Container, Aktionen und z-Order.
# Fallback zu chrome-batch.json (ein Lauf statt vieler Aufrufe).
# Zuletzt ausfuehren: erst chrome-visuals.json, dann pbir-visuals.json einspielen.
set -euo pipefail

# Seitenhintergrund aus design.pageBackground
pbir pages background "Test.Report/Detail Produktlinie.Page" --color "#EEF1F5" --transparency 0

# Kopfband — Flaeche
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_bg.Visual.fill.show" --value true
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_bg.Visual.fill.fillColor" --value "#FFFFFF"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Detail Produktlinie.Page/chrome_header_bg.Visual" --z 0

# Kopfband-Unterkante (heller Kopfband-Stil braucht eine Trennlinie)
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_rule.Visual.fill.show" --value true
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_rule.Visual.fill.fillColor" --value "#E5E7EB"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_rule.Visual.outline.show" --value false
pbir visuals position "Test.Report/Detail Produktlinie.Page/chrome_header_rule.Visual" --z 1

# Logo-Platzhalter — durch ein Bild ersetzen:
#   pbir rm "Test.Report/Detail Produktlinie.Page/chrome_logo.Visual" -f
#   pbir add visual image "Test.Report/Detail Produktlinie.Page" -n chrome_logo -x 1144 -y 12 -w 120 -h 32 --image "<Pfad zum Logo>"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_logo.Visual.fill.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_logo.Visual.outline.show" --value true
pbir set "Test.Report/Detail Produktlinie.Page/chrome_logo.Visual.outline.lineColor" --value "#0F1E2E"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_logo.Visual.text.text" --value LOGO
pbir set "Test.Report/Detail Produktlinie.Page/chrome_logo.Visual.text.fontSize" --value 8
pbir set "Test.Report/Detail Produktlinie.Page/chrome_logo.Visual.text.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_logo.Visual.text.horizontalAlignment" --value center
pbir visuals position "Test.Report/Detail Produktlinie.Page/chrome_logo.Visual" --z 4

# Achtung: pbir schreibt --target 1:1 in navigationSection.
# Springt der Button in Desktop nicht, den INTERNEN Seitennamen
# (page.json -> name, z. B. c98a70696fe77757) als --target setzen.

# Nav-Button 'Übersicht' -> Seite 'Übersicht'
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_1.Visual.fill.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_1.Visual.text.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_1.Visual.outline.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_1.Visual.text.text" --value "Übersicht"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_1.Visual.text.fontSize" --value 10
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_1.Visual.text.horizontalAlignment" --value center
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_1.Visual.text.verticalAlignment" --value middle
pbir visuals action "Test.Report/Detail Produktlinie.Page/chrome_nav_1.Visual" --type PageNavigation --target "Übersicht"
pbir visuals position "Test.Report/Detail Produktlinie.Page/chrome_nav_1.Visual" --z 5

# Nav-Button 'Detail Produktlinie' — aktive Seite, ohne Aktion
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_2.Visual.fill.show" --value true
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_2.Visual.fill.fillColor" --value "#C25A2D"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_2.Visual.text.fontColor" --value "#FFFFFF"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_2.Visual.outline.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_2.Visual.text.text" --value "Detail Produktlinie"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_2.Visual.text.fontSize" --value 10
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_2.Visual.text.horizontalAlignment" --value center
pbir set "Test.Report/Detail Produktlinie.Page/chrome_nav_2.Visual.text.verticalAlignment" --value middle
pbir visuals position "Test.Report/Detail Produktlinie.Page/chrome_nav_2.Visual" --z 5

# Kopfband-Titel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_title.Visual.fill.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_title.Visual.outline.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_title.Visual.text.text" --value "Management Report"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_title.Visual.text.fontSize" --value 16
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_title.Visual.text.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_title.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_title.Visual.text.verticalAlignment" --value middle
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_title.Visual.text.bold" --value true
pbir visuals position "Test.Report/Detail Produktlinie.Page/chrome_header_title.Visual" --z 4

# Kopfband-Untertitel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_subtitle.Visual.fill.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_subtitle.Visual.outline.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_subtitle.Visual.text.text" --value "in T€ · YTD 2026"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_subtitle.Visual.text.fontSize" --value 10
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_subtitle.Visual.text.fontColor" --value "#6B7280"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_subtitle.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Detail Produktlinie.Page/chrome_header_subtitle.Visual.text.verticalAlignment" --value middle
pbir visuals position "Test.Report/Detail Produktlinie.Page/chrome_header_subtitle.Visual" --z 4

# Filter-Panel — Flaeche
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_bg.Visual.fill.show" --value true
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_bg.Visual.fill.fillColor" --value "#F1F3F5"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Detail Produktlinie.Page/chrome_filter_bg.Visual" --z 0

# Filter-Überschrift — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_title.Visual.fill.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_title.Visual.outline.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_title.Visual.text.text" --value Filter
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_title.Visual.text.fontSize" --value 11
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_title.Visual.text.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_title.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_title.Visual.text.verticalAlignment" --value middle
pbir set "Test.Report/Detail Produktlinie.Page/chrome_filter_title.Visual.text.bold" --value true
pbir visuals position "Test.Report/Detail Produktlinie.Page/chrome_filter_title.Visual" --z 4

# Fußleiste — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Detail Produktlinie.Page/chrome_footer_text.Visual.fill.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_footer_text.Visual.outline.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/chrome_footer_text.Visual.text.text" --value "Stand: <datum> · Quelle: DWH · Kontakt: Controlling"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_footer_text.Visual.text.fontSize" --value 9
pbir set "Test.Report/Detail Produktlinie.Page/chrome_footer_text.Visual.text.fontColor" --value "#6B7280"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_footer_text.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Detail Produktlinie.Page/chrome_footer_text.Visual.text.verticalAlignment" --value middle
pbir visuals position "Test.Report/Detail Produktlinie.Page/chrome_footer_text.Visual" --z 4

# Text-Kachel „Detail: gewählte Produktlinie" — Text als shape (eine Textbox bliebe per CLI leer)
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.fill.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.outline.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.text.text" --value "Detail: gewählte Produktlinie"
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.text.fontSize" --value 11
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.text.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.text.verticalAlignment" --value top
pbir visuals position "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual" --z 10

# Button-Kachel „Zur Übersicht" — Text als actionButton (eine Textbox bliebe per CLI leer)
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.fill.show" --value true
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.fill.fillColor" --value "#C25A2D"
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.outline.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.text.text" --value "← Übersicht"
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.text.fontSize" --value 10
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.text.fontColor" --value "#FFFFFF"
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.text.horizontalAlignment" --value center
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.text.verticalAlignment" --value middle
pbir visuals position "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual" --z 10

# Button-Kachel „Zur Übersicht" -> Seite „Übersicht"
pbir visuals action "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual" --type PageNavigation --target "Übersicht"

# Kachel-Container aus design: tileStyle 'shadow', Ecken 12 px, Hintergrund #FFFFFF — dasselbe steht als Theme-Fragment in theme-fragment.json (Theme schlaegt Overrides)
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.background.show" --value true
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.background.transparency" --value 0
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.border.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.dropShadow.show" --value true
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.dropShadow.preset" --value BottomRight
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.dropShadow.color" --value "#0F1E2E"
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.dropShadow.transparency" --value 85
pbir set "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual.border.radius" --value 12
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.background.show" --value true
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.background.transparency" --value 0
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.border.show" --value false
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.dropShadow.show" --value true
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.dropShadow.preset" --value BottomRight
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.dropShadow.color" --value "#0F1E2E"
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.dropShadow.transparency" --value 85
pbir set "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual.border.radius" --value 12

# Inhalt ueber die Chrome-Flaechen legen (--from-json vergibt immer z=0)
pbir visuals position "Test.Report/Detail Produktlinie.Page/mk_p6km182.Visual" --z 10
pbir visuals position "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual" --z 10

# Slicer
pbir visuals position "Test.Report/Detail Produktlinie.Page/mk_slicer_Year_p2.Visual" --z 10
pbir visuals position "Test.Report/Detail Produktlinie.Page/mk_slicer_Region_p2.Visual" --z 10

