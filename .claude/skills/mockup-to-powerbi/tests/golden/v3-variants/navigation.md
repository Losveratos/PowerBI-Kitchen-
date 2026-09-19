# Navigation, Drill-through und Lesezeichen

Erzeugt aus `mockup-spec.json`. Alle Befehle laufen **nach** dem Anlegen der Seiten und Visuals.

## Seiten

| # | Seite | Ordner-Seed | Fragestellung | Visuals | Zweck |
|---|---|---|---|---|---|
| 1 | Varianten | `Varianten.Page` | Wo steht der Umsatz je Region und wie entwickelt er sich? | 6 | Testfall fuer Small Multiples, Feldparameter und die nativen Klassiker. |

## Nav-Buttons (auf jeder Seite)

`zones.header.navOn: false` — das Kopfband bekommt **keine** Seitennavigation. Es entstehen keine `chrome_nav_*`-Buttons; Seitenwechsel läuft über die Registerkarten.

## Drill-through

Keine Drill-through-Verknüpfung im Mockup.

## Filter-Panel und Lesezeichen

Filter-Modus `right` — festes Panel, keine Lesezeichen nötig.
