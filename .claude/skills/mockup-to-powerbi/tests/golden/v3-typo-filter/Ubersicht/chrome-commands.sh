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
pbir set "Test.Report/Übersicht.Page/chrome_header_bg.Visual.fill.fillColor" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/chrome_header_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Übersicht.Page/chrome_header_bg.Visual" --z 0

# Logo-Platzhalter — durch ein Bild ersetzen:
#   pbir rm "Test.Report/Übersicht.Page/chrome_logo.Visual" -f
#   pbir add visual image "Test.Report/Übersicht.Page" -n chrome_logo -x 24 -y 18 -w 180 -h 48 --image "<Pfad zum Logo>"
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.outline.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.outline.lineColor" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.text.text" --value LOGO
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.text.fontSize" --value 12
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.text.fontColor" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/chrome_logo.Visual.text.horizontalAlignment" --value center
pbir visuals position "Test.Report/Übersicht.Page/chrome_logo.Visual" --z 4

# Kopfband-Titel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.text" --value "Vertrieb 2026"
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.fontSize" --value 24
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.fontColor" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.verticalAlignment" --value middle
pbir set "Test.Report/Übersicht.Page/chrome_header_title.Visual.text.bold" --value true
pbir visuals position "Test.Report/Übersicht.Page/chrome_header_title.Visual" --z 4

# Kopfband-Untertitel — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.text" --value "Umsatz und Kosten je Region"
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.fontSize" --value 15
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.fontColor" --value "#C8CDD4"
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual.text.verticalAlignment" --value middle
pbir visuals position "Test.Report/Übersicht.Page/chrome_header_subtitle.Visual" --z 4

# Filter-Panel — Flaeche
pbir set "Test.Report/Übersicht.Page/chrome_filter_bg.Visual.shape.tileShape" --value rectangle
pbir set "Test.Report/Übersicht.Page/chrome_filter_bg.Visual.fill.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_filter_bg.Visual.fill.fillColor" --value "#F1F3F5"
pbir set "Test.Report/Übersicht.Page/chrome_filter_bg.Visual.outline.show" --value false
pbir visuals position "Test.Report/Übersicht.Page/chrome_filter_bg.Visual" --z 0

# Filter-Überschrift — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.text" --value Auswahl
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.fontSize" --value 16
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.verticalAlignment" --value middle
pbir set "Test.Report/Übersicht.Page/chrome_filter_title.Visual.text.bold" --value true
pbir visuals position "Test.Report/Übersicht.Page/chrome_filter_title.Visual" --z 4

# Filter-Hinweistext — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Übersicht.Page/chrome_filter_text.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_filter_text.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_filter_text.Visual.text.text" --value "Alle Werte in Tsd. EUR. Stand: Vormonat."
pbir set "Test.Report/Übersicht.Page/chrome_filter_text.Visual.text.fontSize" --value 14.5
pbir set "Test.Report/Übersicht.Page/chrome_filter_text.Visual.text.fontColor" --value "#6B7280"
pbir set "Test.Report/Übersicht.Page/chrome_filter_text.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Übersicht.Page/chrome_filter_text.Visual.text.verticalAlignment" --value top
pbir visuals position "Test.Report/Übersicht.Page/chrome_filter_text.Visual" --z 4

# Achtung: pbir schreibt --target 1:1 in navigationSection.
# Springt der Button in Desktop nicht, den INTERNEN Seitennamen
# (page.json -> name, z. B. c98a70696fe77757) als --target setzen.

# Nav-Button 'Übersicht' — aktive Seite, ohne Aktion
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.fill.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.fill.fillColor" --value "#C25A2D"
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.text.fontColor" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.text.text" --value "Übersicht"
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.text.fontSize" --value 14.5
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.text.horizontalAlignment" --value center
pbir set "Test.Report/Übersicht.Page/chrome_nav_1.Visual.text.verticalAlignment" --value middle
pbir visuals position "Test.Report/Übersicht.Page/chrome_nav_1.Visual" --z 5

# Nav-Button 'Detail' -> Seite 'Detail'
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.text.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.outline.show" --value true
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.outline.lineColor" --value "#E5E7EB"
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.outline.weight" --value 1
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.text.text" --value Detail
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.text.fontSize" --value 14.5
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.text.horizontalAlignment" --value center
pbir set "Test.Report/Übersicht.Page/chrome_nav_2.Visual.text.verticalAlignment" --value middle
pbir visuals action "Test.Report/Übersicht.Page/chrome_nav_2.Visual" --type PageNavigation --target Detail
pbir visuals position "Test.Report/Übersicht.Page/chrome_nav_2.Visual" --z 5

# Fußleiste — Text (Shape ohne Fuellung; Textboxen koennen per CLI keinen Text bekommen)
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.text" --value "Quelle: DWH · Stand Vormonat"
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.fontSize" --value 14
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.fontColor" --value "#6B7280"
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Übersicht.Page/chrome_footer_text.Visual.text.verticalAlignment" --value middle
pbir visuals position "Test.Report/Übersicht.Page/chrome_footer_text.Visual" --z 4

# Text-Kachel „Hinweis" — Text als shape (eine Textbox bliebe per CLI leer)
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.fill.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.outline.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.text.text" --value "Die Regionen sind nach Umsatz sortiert."
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.text.fontSize" --value 16
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.text.fontColor" --value "#0F1E2E"
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.text.horizontalAlignment" --value left
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.text.verticalAlignment" --value top
pbir visuals position "Test.Report/Übersicht.Page/mk_txt1.Visual" --z 10

# Kachel-Container aus design: tileStyle 'border', Ecken 6 px, Hintergrund #FFFFFF — dasselbe steht als Theme-Fragment in theme-fragment.json (Theme schlaegt Overrides)
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.border.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.border.color" --value "#E5E7EB"
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.border.width" --value 1
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.border.radius" --value 6
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.border.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.border.color" --value "#E5E7EB"
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.border.width" --value 1
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.border.radius" --value 6
pbir set "Test.Report/Übersicht.Page/mk_bar1.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_bar1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/mk_bar1.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/mk_bar1.Visual.border.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_bar1.Visual.border.color" --value "#E5E7EB"
pbir set "Test.Report/Übersicht.Page/mk_bar1.Visual.border.width" --value 1
pbir set "Test.Report/Übersicht.Page/mk_bar1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_bar1.Visual.border.radius" --value 6
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.background.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.background.color" --value "#FFFFFF"
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.background.transparency" --value 0
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.border.show" --value true
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.border.color" --value "#E5E7EB"
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.border.width" --value 1
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.dropShadow.show" --value false
pbir set "Test.Report/Übersicht.Page/mk_txt1.Visual.border.radius" --value 6

# Typografie aus design.typography: Titel 16 pt, Untertitel 12.5 pt (Kacheln mit eigener Skalierung weichen ab)
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.title.fontSize" --value 16
pbir set "Test.Report/Übersicht.Page/mk_kpi1.Visual.subTitle.fontSize" --value 12.5
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.title.fontSize" --value 21
pbir set "Test.Report/Übersicht.Page/mk_col1.Visual.subTitle.fontSize" --value 16
pbir set "Test.Report/Übersicht.Page/mk_bar1.Visual.title.fontSize" --value 16
pbir set "Test.Report/Übersicht.Page/mk_bar1.Visual.subTitle.fontSize" --value 12.5

# Slicer „Year" als Dropdown (zones.filter.slicers[0].type = dropdown)
pbir set "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual.data.mode" --value Dropdown

# Slicer „Region" als Kacheln (horizontal) (zones.filter.slicers[1].type = tile)
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.data.mode" --value Basic
pbir set "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual.general.orientation" --value 1

# Slicer „Date" als Datumsbereich (zones.filter.slicers[2].type = date)
pbir set "Test.Report/Übersicht.Page/mk_slicer_Date_p1.Visual.data.mode" --value Between

# Inhalt ueber die Chrome-Flaechen legen (--from-json vergibt immer z=0)
pbir visuals position "Test.Report/Übersicht.Page/mk_kpi1.Visual" --z 10
pbir visuals position "Test.Report/Übersicht.Page/mk_col1.Visual" --z 10
pbir visuals position "Test.Report/Übersicht.Page/mk_bar1.Visual" --z 10
pbir visuals position "Test.Report/Übersicht.Page/mk_txt1.Visual" --z 10

# Slicer
pbir visuals position "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual" --z 10
pbir visuals position "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual" --z 10
pbir visuals position "Test.Report/Übersicht.Page/mk_slicer_Date_p1.Visual" --z 10

