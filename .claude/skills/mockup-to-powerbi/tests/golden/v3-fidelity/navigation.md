# Navigation, Drill-through und Lesezeichen

Erzeugt aus `mockup-spec.json`. Alle Befehle laufen **nach** dem Anlegen der Seiten und Visuals.

## Seiten

| # | Seite | Ordner-Seed | Fragestellung | Visuals | Zweck |
|---|---|---|---|---|---|
| 1 | Fidelity | `Fidelity.Page` | Kommt das Kitchen-Bild an? | 12 | – |

## Nav-Buttons (auf jeder Seite)

`zones.header.navOn: false` — das Kopfband bekommt **keine** Seitennavigation. Es entstehen keine `chrome_nav_*`-Buttons; Seitenwechsel läuft über die Registerkarten.

## Drill-through

Keine Drill-through-Verknüpfung im Mockup.

## Filter-Panel und Lesezeichen

Filter-Modus `burger` (Overlay per Burger-Button). Lesezeichen erfassen **nur die Sichtbarkeit**, nicht den Datenzustand — sonst friert das Lesezeichen die Slicer-Auswahl ein.

```bash
# Seite Fidelity
pbir add bookmark "Test.Report" "Filter öffnen" --no-data --no-current-page
pbir bookmarks visuals "Test.Report" "Filter öffnen" "chrome_filter_bg" "chrome_filter_title" "chrome_filter_text" "chrome_filter_close" "mk_slicer_Region_p1" "mk_slicer_Category_p1" "mk_slicer_Year_p1"
pbir add bookmark "Test.Report" "Filter schließen" --no-data --no-current-page
pbir bookmarks visuals "Test.Report" "Filter schließen" "chrome_filter_bg" "chrome_filter_title" "chrome_filter_text" "chrome_filter_close" "mk_slicer_Region_p1" "mk_slicer_Category_p1" "mk_slicer_Year_p1"
#   Grundzustand: Panel ausgeblendet
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_bg.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_title.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_text.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/chrome_filter_close.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/mk_slicer_Region_p1.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/mk_slicer_Category_p1.Visual"
pbir visuals hide "Test.Report/Fidelity.Page/mk_slicer_Year_p1.Visual"
pbir visuals action "Test.Report/Fidelity.Page/chrome_burger.Visual" --type Bookmark --target "Filter öffnen"
pbir visuals action "Test.Report/Fidelity.Page/chrome_filter_close.Visual" --type Bookmark --target "Filter schließen"

```

```bash
pbir bookmarks list "Test.Report"
```

> `pbir add bookmark` legt das Lesezeichen an; den **Zustand** füllt Power BI erst, wenn das Lesezeichen in Desktop einmal aktualisiert wird (Ansicht → Lesezeichen → … → Aktualisieren). Also: Report in Desktop öffnen, Panel sichtbar schalten, „Filter öffnen" aktualisieren; Panel ausblenden, „Filter schließen" aktualisieren. Das ist der einzige Schritt dieses Skills, der Desktop braucht.
