# Navigation, Drill-through und Lesezeichen

Erzeugt aus `mockup-spec.json`. Alle Befehle laufen **nach** dem Anlegen der Seiten und Visuals.

## Seiten

| # | Seite | Ordner-Seed | Fragestellung | Visuals | Zweck |
|---|---|---|---|---|---|
| 1 | Übersicht | `Ubersicht.Page` | – | 6 | – |

## Nav-Buttons (auf jeder Seite)

Ziel-Reihenfolge: Übersicht · Umsatz · Kosten. Die Buttons heißen auf jeder Seite `chrome_nav_1 … chrome_nav_n`; der Button der eigenen Seite bekommt Akzentfüllung und **keine** Aktion (das erledigt `chrome-commands.sh` bzw. `chrome-batch.json` bereits).

| Seite | Button | Ziel | Aktion |
|---|---|---|---|
| Übersicht | `chrome_nav_1` | – | aktiv, Akzentfüllung, keine Aktion |
| Übersicht | `chrome_nav_2` | Umsatz | `PageNavigation` |
| Übersicht | `chrome_nav_3` | Kosten | `PageNavigation` |

> Achtung: „Umsatz", „Kosten" steht in der Nav-Liste, ist aber keine Seite im Mockup. Entweder Seite anlegen oder den Eintrag streichen.

> `pbir visuals action --target` schreibt den Text 1:1 in `navigationSection`. Springt ein Button in Desktop nicht, den internen Seitennamen aus `definition/pages/<ordner>/page.json` (`name`) als `--target` setzen:

```bash
pbir cat "Test.Report/Übersicht.Page" | head -5   # interner name
```

## Drill-through

Keine Drill-through-Verknüpfung im Mockup.

## Filter-Panel und Lesezeichen

Filter-Modus `right` — festes Panel, keine Lesezeichen nötig.
