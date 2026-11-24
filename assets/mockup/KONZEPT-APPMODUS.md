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

## 6. Vorlagen für die App und das Handy-Format (0.7.1)

Fünf Vorlagen sind für das Ziel Fabric App gedacht und in der Auswahl gekennzeichnet:

| Vorlage | Aufbau | In dwg erzeugbar |
|---|---|---|
| Handy · Übersicht | Hochformat 1080 × 1920: Kopfleiste mit Burger, vier Karten 2 × 2, Verlauf in voller Breite, Top 5 der Abweichungen, Tab-Leiste unten. Legt zwei Zusatzseiten für die Tabs an | ja (KPI, integrierte Brücke, Balken) |
| Start-Hub | sechs Karten 3 × 2, je Seite eine Kennzahl, mit vorhandenen Seiten verknüpft | ja, Sprungziele kennt dwg noch nicht |
| Übersicht mit Detail-Panel | Ranking links, rechts Tabelle und Kommentar zur Auswahl | bis auf die Kommentar-Kachel |
| GuV-Cockpit | P&L Statement auf zwei Dritteln, rechts Ergebnisbrücke und zwei Karten | ja |
| Monatsgespräch | Karten AC gegen PL und FC, integrierte Brücke, Abweichung je Region, Kommentarzeile | bis auf die Kommentar-Kachel |

**Handy-Format.** Eine Seite mit 1080 px Breite steht für ein Gerät mit rund 400 CSS-Pixeln. Die Basismaße des Tools
(Schrift 12 px, Kopfband 56 px, Zwischenraum 12 px) beziehen sich deshalb auf die logische Breite `canvas.base = 400`,
der Faktor ist 2,7. Daraus ergeben sich bei 1080 × 1920: Kopfleiste 151 px, Tab-Leiste 151 px, Rand 52 px,
Zwischenraum 32 px, zwölf Spalten zu 84 px Schritt. Regeln der Vorlage: nur untereinander, nebeneinander stehen allein
die Karten; jede Karte über 432 × 243 px (Warnschwelle aus `a11y.js`); Filter und weitere Seiten im Burger-Menü,
die drei bis fünf wichtigsten Seiten in der Tab-Leiste.

**Was die dwg-Seite für das Handy-Layout braucht** (Auftrag für die spätere dwg-Session):

1. `mockup import` liest `canvas.base`/`canvas.form` bzw. `app.shell.resolution: "phone"` und trägt die Seite mit
   `width: 1080, height: 1920` in die App-Spec ein, statt die Rechtecke auf das Querformat umzurechnen.
2. Die Shell braucht eine Auflösung `phone` neben `fullhd`, `hd`, `responsive`: Seite im Hochformat, auf Gerätebreite
   skaliert (1080 Seitenpixel auf die Breite des Viewports), senkrecht scrollbar statt der heutigen Stapelung unter 900 px.
3. Die Rahmenmaße der Shell sind heute fest für 1920 × 1080 (Kopf 96, Filter-Panel 300, Fuß 36, Rand 27,
   Zwischenraum 18). Für `phone` gelten Kopf 151, kein festes Filter-Panel, Tab-Leiste 151, Rand 52, Zwischenraum 32.
   Am saubersten rechnet die Shell wie das Mockup mit `pixelgrid.zones()` und einem Faktor aus `width / base`;
   dafür müsste `pixelgrid.js` die Basisbreite als Option bekommen (heute fest 1280, im Mockup über `uiComp()` ausgeglichen).
4. Tab-Leiste unten (`zones.footer.navPosition: "tabs"`, bis zu fünf Seiten) als Navigationsart der Shell.
5. Burger-Menü als Panel über der Seite für Filter und alle Seiten (`app.shell.navigation`, `filterPanel: "burger"`);
   das feste Filter-Panel links passt nicht auf 1080 px Breite.
6. Schriftgrößen der Visuals: ChartKitchen und P&L brauchen im Handy-Format den Faktor 2,7 (`labels.fontScale` bzw.
   Preset), sonst sind Achsen und Werte auf dem Gerät zu klein. Der Konverter rechnet das für Power BI schon aus `uiScale`.
7. Lint: Mindestgröße je Kachel aus `a11y.js` mit dem Faktor der Seite prüfen (432 × 243 px bei `phone`).
8. Optional: `pages[].group` für die Tab-Leiste (welche Seiten in die Tabs, welche nur ins Burger-Menü).

## 7. Was sich noch vorgeben ließe (Vorschläge, nicht gebaut)

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
