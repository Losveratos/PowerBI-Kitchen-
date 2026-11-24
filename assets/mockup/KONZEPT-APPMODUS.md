# MockupKitchen · Zielmodus, App-Modus und Bühne (0.7.0)

Stand 24.11.2026, Branch `feat/mockup-kitchen`. MockupKitchen soll drei Dinge zugleich sein: Workshop-Werkzeug,
Design-Werkzeug und Vorlage für Rayfin-Apps aus der dwg cli. Dieses Dokument hält fest, was dafür gebaut ist,
wie es mit der dwg cli zusammenhängt und was als Nächstes sinnvoll wäre.

## 1. Zielmodus

Jedes Projekt hat ein Ziel (`S.target`, Export `meta.target`):

| Ziel | Wirkung im Tool | Export |
|---|---|---|
| `pbi` Power BI | wie bisher; gespeicherte Filter und Burger-Navigation lösen den Hinweis „Achtung Lesezeichen“ aus | Issues `BOOKMARKS_SAVED_FILTERS`, `BOOKMARKS_BURGER_NAV`, `zones.chips.bookmarks` |
| `app` Fabric App | Vorgaben beim Anlegen: Burger-Menü für Navigation und Filter, Kopfleiste 96 px bei Full HD, 12er-Pixelraster; Typen, die die dwg cli nicht erzeugen kann, tragen ⚠ | Block `app { shell, notBuildable }`, Issues `APP_SHELL_*`, `APP_NOT_BUILDABLE` |
| `wire` Wireframe | Skizzen und Rahmen in Grautönen | Brief nennt kein Zielsystem |

Auswahl: Dialog „Neu“ (drei Karten), Pille neben dem Namen oben links, Feld im Reiter Bericht. Ein Wechsel
ändert Kacheln und Seiten nicht; die Vorgaben des Ziels für den Rahmen sind im Dialog abwählbar.
`meta.target` und `app` zählen nicht zum specHash, die Chip-Zeile über `zones` schon.

## 2. Gespeicherte Filter

`S.views[] = { id, name, filters }`, gepflegt im Reiter Zonen. `filters` ist bewusst Freitext aus dem Workshop
(`Region = Nord, West; Year = 2026`); der Export zerlegt ihn zusätzlich in `parsed[{ field, values }]`.
Gibt es mindestens einen Filter, entsteht unter dem Kopfband eine Chip-Zeile (30 px bei 1280, Zone `chips`).
`pixelgrid.js` bleibt unberührt: die Zeile wird dem Kopfband zugeschlagen und in `app.js` wieder abgetrennt.

## 3. Bühne (Präsentation)

`stage.js` macht aus der Ansicht eine klickbare Demo. Der Zustand ist flüchtig und wandert nicht in den Export.

- Burger im Kopfband öffnet ein Panel: Seiten, Detailseiten, gespeicherte Filter als Schalter, Slicer mit Beispielwerten.
- Chips über den Kacheln: wegklicken (✕), wieder einschalten (Klick), „Zurücksetzen“.
- Klick auf eine Kachel = Querfilter (Chip „Auswahl: …“, die anderen Kacheln zeichnen neu). Kacheln mit
  `interaction.crossFilter = false` reagieren nicht. Kacheln mit Sprungziel wechseln die Seite, ↩ führt zurück.
- Doppelklick vergrößert eine Kachel. Slicer im sichtbaren Filterbereich schalten per Klick durch ihre Werte.
- Tasten: ← → Seiten, M Menü, F Vollbild, R Filter zurücksetzen, Esc schließt bzw. beendet.
- „Filtern“ verschiebt nur den Startwert der Skizzen (`MK_STAGE.shift`), es sind keine echten Daten im Spiel.
  Das steht im Menü („Demo: Zahlen sind Beispielwerte“).

## 4. Typauswahl

Schlagwort-Chips zusätzlich zur Suche (`MK_CATALOG.tagIds`, `tagsOf`): Zeit, Struktur, Abweichung, KPI, Tabelle,
Anteil, Verteilung, Karte, IBCS-Notation, Nativ, Steuerung, Text und Bild. Mehrere Chips schränken gemeinsam ein.
Im Ziel Fabric App gibt es zusätzlich „nur für das Ziel passende“.

## 5. Abgleich mit der dwg cli

Gelesen wurde der Worktree `Desktop\PnL Demo\Fabric-Apps-Demo-dwg-mockup` (Branch `feat/dwg-mockup`).

| MockupKitchen | dwg heute | Folge |
|---|---|---|
| `cell`, `canvas.pixel` (12er-Raster) | `mockup import` überträgt exakt | im App-Ziel ist das Raster Vorgabe |
| ChartKitchen- und P&L-Kacheln | `chartkitchen`, `pnl` | direkt erzeugbar |
| native Visuals, Text, Deneb, Gantt | kein Gegenstück | ⚠ in der Typauswahl, `app.notBuildable` |
| Slicer (`zones.filter.slicers`) | Wertelisten im Panel links | Datumsbereich fehlt in der Shell |
| Burger-Menü | Kopfleiste und Panel links | Vorgabe an die Shell (`app.shell.navigation`) |
| gespeicherte Filter | nur Querfilter-Chips | Vorgabe an die Shell (`app.shell.savedFilters`) |
| Sprungziele (`link`) | nicht umgesetzt | bleibt Hinweis |

Der nächste Schritt auf dwg-Seite wäre, in `mockup import` `meta.target`, `app.shell` und `zones.chips.views` zu
lesen und in `DwgShell.tsx` Burger-Panel und gespeicherte Ansichten zu bauen. Das ist dort ein eigener Auftrag.

## 6. Was sich noch vorgeben ließe (Vorschläge, nicht gebaut)

1. **Zustände je Kachel:** leer, lädt, Fehler, keine Berechtigung. In der Bühne per Taste umschaltbar; für Apps Pflicht.
2. **Responsive Vorschau:** dieselbe Seite bei 1920, 1280 und unter 900 px (gestapelt), so wie die dwg-Shell skaliert.
3. **Hell und Dunkel:** Umschalter in der Bühne; die Shell kann beides (`isDark`).
4. **Detail-Panel statt Drill-Seite:** Klick auf eine Kachel öffnet rechts ein Panel mit Tabelle und Kommentar.
5. **Kommentare und Annotationen:** Marker an Kacheln (wie die Fußnoten des P&L-Visuals), im Workshop gesetzt.
6. **Zeitraum-Wahl als eigenes Element:** Monat, YTD, R12 in der Kopfleiste; passt zu den Vergleichsmodi von ChartKitchen.
7. **Teilen per Link:** Ansicht im URL-Hash; der Entwurf der Dashboard-Kitchen sieht das für Apps ohnehin vor.
8. **Rollen und Sichtbarkeit:** welche Seite welcher Nutzergruppe gehört; landet als Hinweis in der App-Spec.
9. **Export-Aktionen:** PDF, Excel, „In Power BI öffnen“ als Schaltflächen der Shell.
10. **Geführter Ablauf:** in der Bühne eine Abfolge von Schritten (Seite, Filter, Kachel im Fokus) als Storyline für die Abnahme.
