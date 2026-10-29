# Navigation, Drill-through und Lesezeichen

Erzeugt aus `mockup-spec.json`. Alle Befehle laufen **nach** dem Anlegen der Seiten und Visuals.

## Seiten

| # | Seite | Ordner-Seed | Fragestellung | Visuals | Zweck |
|---|---|---|---|---|---|
| 1 | Übersicht | `Ubersicht.Page` | Liegen wir im Plan? | 5 | – |

## Nav-Buttons (auf jeder Seite)

Ziel-Reihenfolge: Übersicht. Die Buttons heißen auf jeder Seite `chrome_nav_1 … chrome_nav_n`; der Button der eigenen Seite bekommt Akzentfüllung und **keine** Aktion (das erledigt `chrome-commands.sh` bzw. `chrome-batch.json` bereits).

| Seite | Button | Ziel | Aktion |
|---|---|---|---|
| Übersicht | `chrome_nav_1` | – | aktiv, Akzentfüllung, keine Aktion |

> `pbir visuals action --target` schreibt den Text 1:1 in `navigationSection`. Springt ein Button in Desktop nicht, den internen Seitennamen aus `definition/pages/<ordner>/page.json` (`name`) als `--target` setzen:

```bash
pbir cat "Test.Report/Übersicht.Page" | head -5   # interner name
```

## Drill-through

Keine Drill-through-Verknüpfung im Mockup.

## Filter-Panel und Lesezeichen

Filter-Modus `burger` (Overlay per Burger-Button). Lesezeichen erfassen **nur die Sichtbarkeit**, nicht den Datenzustand — sonst friert das Lesezeichen die Slicer-Auswahl ein.

```bash
# Seite Übersicht
pbir add bookmark "Test.Report" "Filter öffnen" --no-data --no-current-page
pbir bookmarks visuals "Test.Report" "Filter öffnen" "chrome_filter_bg" "chrome_filter_title" "chrome_filter_close" "mk_slicer_Year_p1" "mk_slicer_Region_p1"
pbir add bookmark "Test.Report" "Filter schließen" --no-data --no-current-page
pbir bookmarks visuals "Test.Report" "Filter schließen" "chrome_filter_bg" "chrome_filter_title" "chrome_filter_close" "mk_slicer_Year_p1" "mk_slicer_Region_p1"
#   Grundzustand: Panel ausgeblendet
pbir visuals hide "Test.Report/Übersicht.Page/chrome_filter_bg.Visual"
pbir visuals hide "Test.Report/Übersicht.Page/chrome_filter_title.Visual"
pbir visuals hide "Test.Report/Übersicht.Page/chrome_filter_close.Visual"
pbir visuals hide "Test.Report/Übersicht.Page/mk_slicer_Year_p1.Visual"
pbir visuals hide "Test.Report/Übersicht.Page/mk_slicer_Region_p1.Visual"
pbir visuals action "Test.Report/Übersicht.Page/chrome_burger.Visual" --type Bookmark --target "Filter öffnen"
pbir visuals action "Test.Report/Übersicht.Page/chrome_filter_close.Visual" --type Bookmark --target "Filter schließen"

```

```bash
pbir bookmarks list "Test.Report"
```

> `pbir add bookmark` legt das Lesezeichen an; den **Zustand** füllt Power BI erst, wenn das Lesezeichen in Desktop einmal aktualisiert wird (Ansicht → Lesezeichen → … → Aktualisieren). Also: Report in Desktop öffnen, Panel sichtbar schalten, „Filter öffnen" aktualisieren; Panel ausblenden, „Filter schließen" aktualisieren. Das ist der einzige Schritt dieses Skills, der Desktop braucht.

## Slicer-Vorauswahl

Aus `zones.filter.slicers[].default`. Die Befehle stehen je Seite in `<Seitenslug>/analysis-commands.sh`:

| Slicer | Feld | Vorauswahl |
|---|---|---|
| Year | `DimDate.Year` | 2026 |

> `pbir add filter … --values` legt einen kategorialen Filter auf dem Slicer-Visual an. Ob Power BI die Auswahl auch im Slicer anzeigt, in Desktop gegenprüfen.
