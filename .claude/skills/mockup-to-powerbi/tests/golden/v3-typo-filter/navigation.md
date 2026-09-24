# Navigation, Drill-through und Lesezeichen

Erzeugt aus `mockup-spec.json`. Alle Befehle laufen **nach** dem Anlegen der Seiten und Visuals.

## Seiten

| # | Seite | Ordner-Seed | Fragestellung | Visuals | Zweck |
|---|---|---|---|---|---|
| 1 | Übersicht | `Ubersicht.Page` | Wo stehen Umsatz und Kosten je Region? | 4 | – |
| 2 | Detail | `Detail.Page` | Wie läuft AC gegen Plan im Jahresverlauf? | 2 | – |

## Nav-Buttons (auf jeder Seite)

Seitennavigation **in der Fußleiste** (`navPosition: "footer"`, Tool 0.4.3): die Buttons stehen rechtsbündig in der Fußzone, kleiner als im Kopfband (Schrift ca. 9,5 px × Skalierung); das Kopfband bleibt ohne Nav.

Ziel-Reihenfolge: Übersicht · Detail. Die Buttons heißen auf jeder Seite `chrome_nav_1 … chrome_nav_n`; der Button der eigenen Seite bekommt Akzentfüllung und **keine** Aktion (das erledigt `chrome-commands.sh` bzw. `chrome-batch.json` bereits).

| Seite | Button | Ziel | Aktion |
|---|---|---|---|
| Übersicht | `chrome_nav_1` | – | aktiv, Akzentfüllung, keine Aktion |
| Übersicht | `chrome_nav_2` | Detail | `PageNavigation` |
| Detail | `chrome_nav_1` | Übersicht | `PageNavigation` |
| Detail | `chrome_nav_2` | – | aktiv, Akzentfüllung, keine Aktion |

> `pbir visuals action --target` schreibt den Text 1:1 in `navigationSection`. Springt ein Button in Desktop nicht, den internen Seitennamen aus `definition/pages/<ordner>/page.json` (`name`) als `--target` setzen:

```bash
pbir cat "Test.Report/Übersicht.Page" | head -5   # interner name
```

## Drill-through

Keine Drill-through-Verknüpfung im Mockup.

## Filter-Panel und Lesezeichen

Filter-Modus `right` — festes Panel, keine Lesezeichen nötig.

## Slicer-Vorauswahl

Aus `zones.filter.slicers[].default`. Die Befehle stehen je Seite in `<Seitenslug>/analysis-commands.sh`:

| Slicer | Feld | Vorauswahl |
|---|---|---|
| Year | `DimDate.Year` | 2026 |

> `pbir add filter … --values` legt einen kategorialen Filter auf dem Slicer-Visual an. Ob Power BI die Auswahl auch im Slicer anzeigt, in Desktop gegenprüfen.
