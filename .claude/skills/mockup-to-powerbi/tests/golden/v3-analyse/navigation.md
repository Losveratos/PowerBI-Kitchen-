# Navigation, Drill-through und Lesezeichen

Erzeugt aus `mockup-spec.json`. Alle Befehle laufen **nach** dem Anlegen der Seiten und Visuals.

## Seiten

| # | Seite | Ordner-Seed | Fragestellung | Visuals | Zweck |
|---|---|---|---|---|---|
| 1 | Übersicht | `Ubersicht.Page` | Liegen wir im Plan? | 9 | – |
| 2 | Detail Produktlinie | `Detail_Produktlinie.Page` | – | 7 | – |

## Nav-Buttons (auf jeder Seite)

Ziel-Reihenfolge: Übersicht · Detail Produktlinie. Die Buttons heißen auf jeder Seite `chrome_nav_1 … chrome_nav_n`; der Button der eigenen Seite bekommt Akzentfüllung und **keine** Aktion (das erledigt `chrome-commands.sh` bzw. `chrome-batch.json` bereits).

| Seite | Button | Ziel | Aktion |
|---|---|---|---|
| Übersicht | `chrome_nav_1` | – | aktiv, Akzentfüllung, keine Aktion |
| Übersicht | `chrome_nav_2` | Detail Produktlinie | `PageNavigation` |
| Detail Produktlinie | `chrome_nav_1` | Übersicht | `PageNavigation` |
| Detail Produktlinie | `chrome_nav_2` | – | aktiv, Akzentfüllung, keine Aktion |

> `pbir visuals action --target` schreibt den Text 1:1 in `navigationSection`. Springt ein Button in Desktop nicht, den internen Seitennamen aus `definition/pages/<ordner>/page.json` (`name`) als `--target` setzen:

```bash
pbir cat "Test.Report/Übersicht.Page" | head -5   # interner name
```

## Drill-through

Für jede Verknüpfung: **Zielseite** bekommt das Drill-through-Feld, die Quellkachel braucht nichts weiter (Power BI bietet den Drill im Kontextmenü an). Das Drill-Feld steht in der Spec unter `links[].drillField` (Kategorie-Feld der Quellkachel).

```bash
# Übersicht / mk_7rbkjp5 → Detail Produktlinie
pbir pages drillthrough "Test.Report/Detail Produktlinie.Page" --table "DimProduct" --field "Category"
```

Zurück-Button auf jeder Drill-Zielseite (Power BI setzt ihn beim Drill automatisch aktiv):

```bash
pbir add visual actionButton "Test.Report/Detail Produktlinie.Page" -n chrome_back -x 24 -y 80 -w 90 -h 28
pbir set "Test.Report/Detail Produktlinie.Page/chrome_back.Visual.text.text" --value "← Zurück"
pbir set "Test.Report/Detail Produktlinie.Page/chrome_back.Visual.fill.fillColor" --value "#FFFFFF"
pbir visuals action "Test.Report/Detail Produktlinie.Page/chrome_back.Visual" --type Back
pbir visuals position "Test.Report/Detail Produktlinie.Page/chrome_back.Visual" --z 24
```

> **Offene Entscheidung:** Das Mockup sieht für den Zurück-Button keinen eigenen Platz vor. Er liegt hier in der linken oberen Ecke des Inhaltsbereichs und überlappt damit die erste Kachel (`pbir` meldet `PBIR_VISUAL_OVERLAP`, legt ihn aber an). Mit dem Menschen klären: eigene Kachel im Mockup vorsehen, in das Kopfband schieben oder als schwebendes Icon so lassen.

## Button-Kacheln mit Seitenwechsel

Diese Kacheln sind im Mockup vom Typ `button` und tragen eine Seitenverknüpfung (die Aktion steht schon in `chrome-commands.sh`):

```bash
pbir visuals action "Test.Report/Detail Produktlinie.Page/mk_btn01.Visual" --type PageNavigation --target "Übersicht"
```

## Filter-Panel und Lesezeichen

Filter-Modus `right` — festes Panel, keine Lesezeichen nötig.

## Slicer-Vorauswahl

Aus `zones.filter.slicers[].default`. Die Befehle stehen je Seite in `<Seitenslug>/analysis-commands.sh`:

| Slicer | Feld | Vorauswahl |
|---|---|---|
| Year | `DimDate.Year` | 2026 |

> `pbir add filter … --values` legt einen kategorialen Filter auf dem Slicer-Visual an. Ob Power BI die Auswahl auch im Slicer anzeigt, in Desktop gegenprüfen.
