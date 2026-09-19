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

# Kopfband-Unterkante (heller Kopfband-Stil braucht eine Trennlinie)
pbir set "Test.Report/Varianten.Page/chrome_header_rule.Visual.fill.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_header_rule.Visual.fill.fillColor" --value "#E5E7EB"
pbir set "Test.Report/Varianten.Page/chrome_header_rule.Visual.outline.show" --value false
pbir visuals position "Test.Report/Varianten.Page/chrome_header_rule.Visual" --z 1

# Logo-Platzhalter — durch ein Bild ersetzen:
#   pbir rm "Test.Report/Varianten.Page/chrome_logo.Visual" -f
#   pbir add visual image "Test.Report/Varianten.Page" -n chrome_logo -x 16 -y 12 -w 120 -h 32 --image "<Pfad zum Logo>"
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.fill.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.outline.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.outline.lineColor" --value "#0F1E2E"
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.text.text" --value LOGO
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.text.fontSize" --value 8
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.text.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Varianten.Page/chrome_logo.Visual.text.horizontalAlignment" --value center
pbir visuals position "Test.Report/Varianten.Page/chrome_logo.Visual" --z 4

# Kopfband-Titel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.fill.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.outline.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.text" --value "Vertrieb 2026"
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.fontSize" --value 16
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.verticalAlignment" --value middle
pbir set "Test.Report/Varianten.Page/chrome_header_title.Visual.text.bold" --value true
pbir visuals position "Test.Report/Varianten.Page/chrome_header_title.Visual" --z 4

# Kopfband-Untertitel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.fill.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.outline.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.text" --value "Umsatz und Kosten je Region"
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.fontSize" --value 10
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.fontColor" --value "#6B7280"
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Varianten.Page/chrome_header_subtitle.Visual.text.verticalAlignment" --value middle
pbir visuals position "Test.Report/Varianten.Page/chrome_header_subtitle.Visual" --z 4

# Filter-Panel — Flaeche
pbir set "Test.Report/Varianten.Page/chrome_filter_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Varianten.Page/chrome_filter_bg.Visual.fill.show" --value true
pbir set "Test.Report/Varianten.Page/chrome_filter_bg.Visual.fill.fillColor" --value "#F1F3F5"
pbir set "Test.Report/Varianten.Page/chrome_filter_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Varianten.Page/chrome_filter_bg.Visual" --z 0

# Filter-Überschrift — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.fill.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.outline.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.text" --value Filter
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.fontSize" --value 11
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.verticalAlignment" --value middle
pbir set "Test.Report/Varianten.Page/chrome_filter_title.Visual.text.bold" --value true
pbir visuals position "Test.Report/Varianten.Page/chrome_filter_title.Visual" --z 4

# Fußleiste — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.fill.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.outline.show" --value false
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.text" --value "Stand: taeglich 6 Uhr · Quelle: DWH"
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.fontSize" --value 9
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.fontColor" --value "#6B7280"
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Varianten.Page/chrome_footer_text.Visual.text.verticalAlignment" --value middle
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

# Inhalt ueber die Chrome-Flaechen legen (--from-json vergibt immer z=0)
pbir visuals position "Test.Report/Varianten.Page/mk_col1.Visual" --z 10
pbir visuals position "Test.Report/Varianten.Page/mk_bar1.Visual" --z 10
pbir visuals position "Test.Report/Varianten.Page/mk_line1.Visual" --z 10
pbir visuals position "Test.Report/Varianten.Page/mk_donut1.Visual" --z 10
pbir visuals position "Test.Report/Varianten.Page/mk_wf1.Visual" --z 10

# Slicer
pbir visuals position "Test.Report/Varianten.Page/mk_slicer_Year_p1.Visual" --z 10

