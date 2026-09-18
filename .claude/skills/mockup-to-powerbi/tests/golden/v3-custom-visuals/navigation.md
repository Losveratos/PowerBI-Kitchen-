# Navigation, Drill-through und Lesezeichen

Erzeugt aus `mockup-spec.json`. Alle Befehle laufen **nach** dem Anlegen der Seiten und Visuals.

## Seiten

| # | Seite | Ordner-Seed | Fragestellung | Visuals | Zweck |
|---|---|---|---|---|---|
| 1 | Projekt & GuV | `Projekt_GuV.Page` | Liegt das Rollout im Plan und was kostet es? | 4 | Gantt links, GuV rechts. |

## Nav-Buttons (auf jeder Seite)

Ziel-Reihenfolge: Projekt & GuV. Die Buttons heißen auf jeder Seite `chrome_nav_1 … chrome_nav_n`; der Button der eigenen Seite bekommt Akzentfüllung und **keine** Aktion (das erledigt `chrome-commands.sh` bzw. `chrome-batch.json` bereits).

| Seite | Button | Ziel | Aktion |
|---|---|---|---|
| Projekt & GuV | `chrome_nav_1` | – | aktiv, Akzentfüllung, keine Aktion |

> `pbir visuals action --target` schreibt den Text 1:1 in `navigationSection`. Springt ein Button in Desktop nicht, den internen Seitennamen aus `definition/pages/<ordner>/page.json` (`name`) als `--target` setzen:

```bash
pbir cat "Test.Report/Projekt & GuV.Page" | head -5   # interner name
```

## Drill-through

Keine Drill-through-Verknüpfung im Mockup.

## Filter-Panel und Lesezeichen

Kein Filter-Panel im Mockup.
