# Chrome bauen — Kopfband, Nav, Filter-Panel, Fußleiste mit `pbir`

„Chrome" = alles, was kein Daten-Visual ist. MockupKitchen liefert die Zonen
millimetergenau; hier steht, aus welchen nativen Elementen sie entstehen und
welche Befehle dafür verifiziert sind (pbir 0.9.32, echtes PBIP).

`scripts/mockup_to_pbir.py` erzeugt daraus **je Seite** in
`mockup-out/<Seitenslug>/`:

| Datei | Inhalt |
|---|---|
| `chrome-visuals.json` | Geometrie (Flächen, Textrahmen, Buttons) für `pbir add visual --from-json` |
| `text-visuals.json` | Text- und Button-Kacheln der Seite, ebenfalls als `shape`/`actionButton` |
| `chrome-batch.json` | **Hauptweg**: alle Setzungen als `pbir batch`-Spec (Version 2) |
| `chrome-commands.sh` / `.ps1` | dieselben Setzungen als Einzelaufrufe — Fallback |
| `analysis-commands.sh` / `.ps1` | was `batch` nicht kann: Button-Aktionen, Sortierung, Top-N, Slicer-Vorauswahl, Annotationen |
| `delta-batch.json` | zweiter Lauf: Position, Größe und Bindung vorhandener Visuals |

Die Zonen sind auf allen Seiten identisch, deshalb heißen die Chrome-Elemente
auf jeder Seite gleich (`chrome_header_bg`, `chrome_nav_1`, …) — Visualnamen
müssen nur innerhalb einer Seite eindeutig sein. Unterschiedlich ist nur, welcher
Nav-Button als **aktiv** markiert wird.

## Warum `shape` und nicht `textbox`

`pbir add visual --from-json` kennt nur `visual_type, name, title, x, y, width,
height, fields`. Einen Textinhalt kann man dort nicht mitgeben, und `title`
landet im Container-Titel, nicht im Text.

Nachträglich Text setzen geht nur bei `shape` und `actionButton`:

```bash
pbir set "<Report>.Report/<Seite>.Page/chrome_footer_text.Visual.text.text" \
  --value "Stand: 18.09.2026 · Quelle: DWH"
```

Bei `textbox` müsste dafür `general.paragraphs` ein Array aus Absätzen mit
`textRuns` sein. `pbir set …general.paragraphs --value "Text"` schreibt
stattdessen ein String-Literal, die Textbox bleibt leer — und `pbir validate`
merkt es nicht. Deshalb: **Textzeilen als `shape` mit ausgeschalteter Füllung.**

Ausnahme, wenn eine echte Textbox gebraucht wird (z. B. Rich Text): `pbir add
title "<Seite>.Page" "Text"` bzw. `pbir add subtitle …` schreiben korrekte
`paragraphs` — aber fest mit 24 pt / 14 pt bei (20, 20). Danach verschieben:

```bash
pbir visuals position "<Seite>.Page/Title.Visual" --x 16 --y 696 --width 800 --height 24
```

Mehrfaches `pbir add title` auf derselben Seite erzeugt `Title`, `Title_1`,
`Title_2` — die Namen sind eindeutig, aber nicht sprechend.

Dasselbe gilt für **Text-Kacheln aus der Spec** (`kind: text|button` mit
`content`, ab specVersion 3). Das Tool exportiert sie in seiner eigenen
`pbir-visuals.<Seite>.json` als `textbox` — dort kämen sie leer an. Der Skill
baut sie deshalb in `text-visuals.json` als `shape` (Text linksbündig oben, 11 pt)
bzw. als `actionButton` (zentriert, Akzentfüllung, plus `PageNavigation`, wenn
die Kachel verknüpft ist). Die Kachel-Container-Formatierung bekommen sie wie
jedes andere Inhalts-Visual.

## Verifizierte Property-Namen

Ermittelt mit `pbir schema describe <typ> <objekt>` — nur diese verwenden.

| Objekt | Properties (Auszug) | gilt für |
|---|---|---|
| `fill` | `show`, `fillColor`, `transparency` | shape, actionButton |
| `outline` | `show`, `lineColor`, `weight`, `transparency` | shape, actionButton |
| `shape` | `tileShape` (**`rectangle`, `rectangleRounded`, `rectangleRoundedByPixel`, `pill`, `oval`, …** — *nicht* `roundedRectangle`), `rectangleRoundedCurve`, `roundEdge` | shape |
| `text` | `text`, `fontSize` (6–45), `fontColor`, `fontFamily`, `bold`, `italic`, `horizontalAlignment` (`left`/`center`/`right`), `verticalAlignment` (`top`/`middle`/`bottom`), `leftMargin` … | shape, actionButton |
| `icon` | 14 Properties | actionButton |
| `title` / `subTitle` | `show`, `text`, `fontSize`, `fontColor`, `alignment`, `heading`, `titleWrap` | jedes Visual (Container) |
| `background` | `show`, `color`, `transparency` | jedes Visual (Container) |
| `border` | `show`, `color`, `width`, `radius` | jedes Visual (Container) |
| `dropShadow` | `show`, `preset` (`BottomRight` …), `position` (`Outer`/`Inner`), `color`, `transparency`, `shadowBlur`, `shadowDistance`, `shadowSpread`, `angle` | jedes Visual (Container) |

Farbwerte als Hex übergeben (`--value "#0F1E2E"`); `pbir` kodiert sie selbst als
`{ solid: { color: … } }`. Geschrieben wird nach
`visual.visualContainerObjects.<objekt>` in der `visual.json`.

## Gestaltung aus `design` (ab specVersion 2)

`design` beschreibt die Kachel-Optik. Sie gehört in die **Container-Formatierung**
jedes Inhalts-Visuals (nicht der Slicer, nicht der Chrome-Shapes) und in den
Seitenhintergrund. `chrome-commands.sh` setzt das automatisch:

```bash
# Seitenhintergrund — Page-Objekt, nicht Visual
pbir pages background "<Seite>.Page" --color "#F4F4F1" --transparency 0

# je Inhalts-Visual
pbir set "<Seite>.Page/<id>.Visual.background.show"  --value true
pbir set "<Seite>.Page/<id>.Visual.background.color" --value "#FFFFFF"
pbir set "<Seite>.Page/<id>.Visual.background.transparency" --value 0
# tileStyle = border
pbir set "<Seite>.Page/<id>.Visual.border.show"   --value true
pbir set "<Seite>.Page/<id>.Visual.border.color"  --value "#E5E7EB"
pbir set "<Seite>.Page/<id>.Visual.border.width"  --value 1
pbir set "<Seite>.Page/<id>.Visual.dropShadow.show" --value false
# tileStyle = shadow: border.show=false, dropShadow.show=true,
#             dropShadow.preset=BottomRight, dropShadow.color/-transparency
# tileStyle = flat:   beides aus
pbir set "<Seite>.Page/<id>.Visual.border.radius" --value 8   # cornerRadius
```

`pbir pages background` schreibt nach `page.json → objects.background`, nicht in
ein Visual. Ergebnis mit `pbir cat "<Seite>.Page"` prüfen, nicht raten.

`headerStyle` steuert die Füllung der Kopfband-Shape und alle Textfarben darin:

| `headerStyle` | Fläche | Schrift | zusätzlich |
|---|---|---|---|
| `light` | `#FFFFFF` | Ink | 1-px-Shape `chrome_header_rule` als Unterkante |
| `dark` | Ink | Weiß | – |
| `accent` | `design.accent` | Weiß | – |
| `custom` | `design.colors.headerBackground` | `design.colors.headerInk` | Unterkante nur, wenn die Fläche hell ist (Luminanz > 150) |

Ab Tool 0.4 kommen Fläche und Schrift **immer** aus `design.colors`
(`headerBackground`, `headerInk`); für `light`/`dark`/`accent` füllt
`mockup_spec.normalise_design()` sie genau mit den Werten aus der Tabelle, wenn
die Spec sie nicht mitliefert. `Ink` ist `design.colors.ink` (Vorgabe
`#0F1E2E`), per `--ink` überschreibbar.

Schriftgrößen werden mit `design.fontScale` (= `canvas.uiScale`) multipliziert und
auf 6–45 pt begrenzt — außerhalb lehnt `pbir set` ab.

## Aufbau je Zone

Maße folgen `powerbi-design-framework/references/chrome-layouts.md`, Variante A
(Kopfband) bzw. B (linke Nav-Leiste). Die Zonen-Rechtecke kommen unverändert aus
der Spec, die Elemente darin werden relativ dazu gesetzt.

### Kopfband (`zones.header`)

| Element | Name | Geometrie | Befehle |
|---|---|---|---|
| Fläche | `chrome_header_bg` | Zone 1:1 | `shape.tileShape=rectangle`, `fill.show=true`, `fill.fillColor` je `headerStyle`, `outline.show=false`, `--z 0` |
| Unterkante | `chrome_header_rule` | `x`, `y+h-1`, `w`, 1 px — nur bei `headerStyle: light` | `fill.fillColor=<Rahmenfarbe>`, `--z 1` |
| Burger | `chrome_burger` | links im Band, 84×28 — nur bei `header.burger` bzw. Filter-Modus `burger` | `fill.fillColor=<Akzent>`, `text.text="☰ Filter"`, Aktion `--type Bookmark --target "Filter öffnen · <Seite>"`, `--z 5` |
| Logo | `chrome_logo` | `logoPos: left` → hinter Burger/Rand; `right` → `x+w-16-120`; vertikal zentriert, 120×32 | Platzhalter-Shape mit Kontur und Text `LOGO`; ersetzen durch `pbir add visual image "<Seite>.Page" -n chrome_logo -x … --image "<Pfad|URL|Table.Measure>"` |
| Titel | `chrome_header_title` | hinter Burger/Logo, Breite bis vor die Nav-Buttons | `fill.show=false`, `outline.show=false`, `text.text=<title>`, `fontSize 16·fontScale`, `bold`, `fontColor` je `headerStyle`, `verticalAlignment=middle`, `--z 4` |
| Untertitel | `chrome_header_subtitle` | unter dem Titel, nur wenn das Band ≥ 48 px hoch ist | wie Titel, `fontSize 10·fontScale`, gedämpfte Farbe |
| Nav-Buttons | `chrome_nav_1…n` | rechtsbündig, je 112×32, Lücke 8 (alle skaliert) — **nur wenn `header.navOn` nicht `false` ist** | **inaktiv:** `fill.show=false`, `text.fontColor=<Kopfbandschrift>`, `pbir visuals action … --type PageNavigation --target "<Seite>"`; **aktive Seite:** `fill.fillColor=<Akzent>`, weiße Schrift, **keine** Aktion; `--z 5` |

**`header.navOn: false`** (ab Tool 0.4.1): das Kopfband bekommt **keine**
Seitennavigation. Es entsteht kein einziges `chrome_nav_*` und keine
`PageNavigation`-Aktion; Titel, Untertitel, Logo und Burger bleiben, und der
Titel darf die volle Breite bis zum rechten Rand nutzen. Das Tool liefert
`header.nav` dann ohnehin leer — der Skill wertet die Flagge trotzdem
ausdrücklich aus, damit eine von Hand geschriebene Spec mit `navOn: false`
**und** gefüllter `nav`-Liste nicht heimlich doch Buttons bekommt. Der Hinweis
steht in `checklist.md` („Hinweise aus dem Chrome-Aufbau") und in
`navigation.md`. Fehlt der Schlüssel, gilt `true` — ältere Specs verhalten sich
unverändert.

### Linke Nav-Leiste (`zones.nav`)

`navOn` betrifft sie **nicht**: die linke Leiste ist eine eigene Zone und
existiert nur, wenn der Mensch sie eingeschaltet hat.

Existiert die Zone, wandern Logo (40×40 oben) und ein Button je Seite
(`zones.nav.pages`) dorthin — gestapelt bei `x+8`, Höhe 40, Abstand 48 px,
Fläche in Ink. Das Kopfband behält Titel und Untertitel.

### Filter-Panel (`zones.filter`)

| Element | Name | Geometrie |
|---|---|---|
| Fläche | `chrome_filter_bg` | Zone 1:1, `fill.fillColor` eine Stufe heller/dunkler als der Seitenhintergrund |
| Überschrift | `chrome_filter_title` | seitliches Panel: `x+8`, `y+8`, `w-16`, 24 px · Leiste oben: `x+8`, `y`, 56 px breit, volle Höhe. Text „Filter", 11 pt, fett |
| Schließen | `chrome_filter_close` | `x+w-36`, `y+8`, 28×24, Text `✕` — nur bei `collapsible` oder Overlay |
| Slicer | v3 `mk_slicer_<Feld>_p<Seite>`, v2 `p<Seite>_slicer<i>_<Feld>`, v1 `slicer<i>_<Feld>` | seitlich gestapelt `x+8k`, `y+40k+i·64k`, `w-16k`, `56k` · oben nebeneinander `x+8k+i·168k`, `y+8k`, `160k`, `h-16k` — stehen bereits in `pbir-visuals.json` |

Die Modi im Einzelnen:

| `mode` | Wirkung | z-Ebene von Panel/Slicer |
|---|---|---|
| `right` / `left` | feste Spalte, Inhalt wird schmaler | `0` / `10` |
| `top` | feste Leiste unter dem Kopfband, Slicer nebeneinander | `0` / `10` |
| `burger` | Panel liegt **über** dem Inhalt (`overlay: true`), Burger-Button im Kopfband | `20` / `24` |

#### Lesezeichen-Rezept (bei `burger` und bei `collapsible: true`)

Ein Lesezeichen hält den Zustand **einer** Seite, also je Seite ein Paar. Die
fertigen Befehle stehen in `mockup-out/navigation.md`:

```bash
pbir add bookmark "<Report>.Report" "Filter öffnen · <Seite>" --no-data --no-current-page
pbir bookmarks visuals "<Report>.Report" "Filter öffnen · <Seite>" \
  "chrome_filter_bg" "chrome_filter_title" "chrome_filter_close" "mk_slicer_Year_p1" …
# dito "Filter schließen · <Seite>"
pbir visuals hide "<Report>.Report/<Seite>.Page/chrome_filter_bg.Visual"   # Grundzustand
pbir visuals action "<Report>.Report/<Seite>.Page/chrome_burger.Visual" \
  --type Bookmark --target "Filter öffnen · <Seite>"
pbir visuals action "<Report>.Report/<Seite>.Page/chrome_filter_close.Visual" \
  --type Bookmark --target "Filter schließen · <Seite>"
```

`--no-data` ist Pflicht, sonst friert das Lesezeichen die Slicer-Auswahl ein.
Verifiziert: die erzeugte `*.bookmark.json` enthält danach
`options: { targetVisualNames: [...], suppressData: true, suppressActiveSection: true }`
— aber **keinen** `explorationState`. Die Sichtbarkeits-Momentaufnahme entsteht
erst, wenn das Lesezeichen in Desktop einmal aktualisiert wird
(Ansicht → Lesezeichen → … → Aktualisieren). Das im Abschlussbericht nennen.

### Fußleiste (`zones.footer`)

Ein `shape` ohne Füllung über die Zone, `x+16`, `w-32`, Text aus `footer.text`,
9 pt, gedämpftes Grau, `verticalAlignment=middle`.

## Reihenfolge und z-Order

`--from-json` schreibt **immer** `z = 0`. Ohne Korrektur liegen Chrome-Flächen
und Inhalts-Visuals auf derselben Ebene — das Filter-Panel kann seine eigenen
Slicer verdecken. Deshalb:

Je Seite:

1. `pbir add page …` + `pbir rm "<Seite>.Page/Title.Visual" -f`
2. `pbir add visual "<Seite>.Page" --from-json <Seitenslug>/chrome-visuals.json`
3. `pbir add visual "<Seite>.Page" --from-json <Seitenslug>/pbir-visuals.json`
4. `pbir add visual "<Seite>.Page" --from-json <Seitenslug>/text-visuals.json`
5. `pbir pages background "<Seite>.Page" --color <design.pageBackground> --transparency 0`
6. `pbir batch run <Seitenslug>/chrome-batch.json --root "<Report>.Report"` —
   Texte, Farben, Kachel-Container, Anzeigeeinheiten und z-Ebenen
7. `bash <Seitenslug>/analysis-commands.sh` — Button-Aktionen, Sortierung,
   Top-N, Untertitel, Slicer-Vorauswahl, Annotationen

Erst wenn **alle** Seiten stehen: Nav-Ziele, Drill-through und Lesezeichen
(`navigation.md`) — vorher existieren die Zielseiten nicht.

Vergebene Ebenen: Chrome-Flächen `0` (Kopfband-Unterkante `1`), Chrome-Texte `4`,
Buttons `5`, Inhalt `10`, Overlay-Filterpanel `20`, dessen Text `22`, dessen
Slicer und Schließen-Button `24`.

## Warum Batch statt hundert Einzelaufrufe

Jede Property als eigener `pbir`-Aufruf ist ein eigener Prozessstart, gemessen
rund 1,5 s. Kopfband, Filter-Panel, Fußleiste **und** Kachel-Formatierung ergeben
im zweiseitigen Beispiel über 120 Setzungen je Seite — gut drei Minuten. Dieselben
Setzungen als `pbir batch`-Spec (Version 2) liefen im Testbed in **1,8 s je
Seite**.

`chrome-batch.json` sieht so aus (gekürzt):

```json
{
  "version": 2,
  "name": "mockup · Übersicht",
  "root": "PBI-IBCS-Testbed.Report",
  "stop_on_error": false,
  "steps": [
    { "id": "format", "op": "set", "select": "Übersicht.Page/chrome_header_bg.Visual",
      "set": { "shape.tileShape": "rectangle", "fill.show": true,
               "fill.fillColor": "#FFFFFF", "outline.show": false,
               "position.z": 0 },
      "continue_on_error": true }
  ]
}
```

Ablauf: `pbir batch validate <Datei>` → `pbir batch plan <Datei> --root …` →
`pbir batch run <Datei> --root …`. Das Format zeigt `pbir batch schema
--version 2`, Vorlagen `pbir batch examples` / `pbir batch example brand-format`.

Verifiziert und wichtig:

- **Keine Zusatzschlüssel.** Die Spec hat `additionalProperties: false` — schon
  ein `$comment` lässt `pbir batch validate` die Datei ablehnen. Erklärungen
  gehören nach `commands.md`.
- **z-Order über `set` → `position.z`.** Der Op `zorder` kennt nur
  `action: front|back`, keine Zahl.
- **Seitenhintergrund geht nicht.** `set` kennt auf Seitenebene nur
  `display_name`, `display_option`, `height`, `is_hidden`, `page_type`,
  `visibility`, `width`. Ein Versuch mit `background.color` bricht den **ganzen**
  Lauf ab, auch mit `continue_on_error`. Deshalb vorher
  `pbir pages background … --color`.
- **Kein Op für Button-Aktionen, Sortierung, Filter oder Annotationen.** Die
  stehen in `analysis-commands.sh`.
- **Exit-Code.** Mit `continue_on_error: true` laufen die übrigen Schritte
  weiter, der Gesamt-Exit ist trotzdem ≠ 0. Die Ergebnistabelle lesen.

`chrome-commands.sh` bleibt als Fallback und startet mit `set -euo pipefail`: ein
einziger abgelehnter Wert bricht den Rest ab. Der Exit-Code sagt also
verlässlich, ob alles saß. `analysis-commands.sh` läuft bewusst **ohne** `set -e`
— ein Visualtyp ohne Datenbeschriftung darf den Rest nicht mitreißen.

## Zweiter Lauf (Delta)

Ab specVersion 3 sind die Visualnamen stabil (`mk_<stableId>`). Ein zweiter
`pbir add visual --from-json` scheitert deshalb an den vorhandenen Namen.
Stattdessen `delta-batch.json`: je Visual `move` + `resize`, für gebundene
Buckets `bind` mit `clear` und anschließendem `add`. Verifiziert: zweimal
hintereinander ausgeführt entstehen **keine** doppelten Projektionen, und ein
von Hand verschobenes Visual landet wieder auf seiner Position aus dem Mockup.
Visuals, die es noch nicht gibt, melden schlicht `targets=0`.

## Theme statt Overrides

`mockup-out/theme-fragment.json` enthält dieselbe Kachel-Optik als
`visualStyles`-`*`-Eintrag:

```json
{ "visualStyles": { "*": { "*": {
  "background": [{ "show": true, "color": { "solid": { "color": "#FFFFFF" } }, "transparency": 0 }],
  "border":     [{ "show": false, "color": { "solid": { "color": "#E5E7EB" } }, "radius": 12 }],
  "dropShadow": [{ "show": true, "preset": "BottomRight", "color": { "solid": { "color": "#0F1E2E" } }, "transparency": 85 }],
  "title":      [{ "show": true, "fontSize": 12, "fontColor": { "solid": { "color": "#0F1E2E" } } }]
} } } }
```

Wer ein Theme pflegt, merged das Fragment dorthin (Skill
`reports:modifying-theme-json` bzw. `powerbi-design-framework`) und lässt die
`background`/`border`/`dropShadow`-Schritte in `chrome-batch.json` weg — dann
steht die Gestaltung an **einer** Stelle statt an jedem Visual. Per Visual nur
noch Ausnahmen. Seitenhintergrund und Akzentfarbe bleiben außerhalb des
Fragments (Seiten-Objekt bzw. Nav-Buttons).

## Fallstricke

- **`shape.tileShape` heißt `rectangleRounded`**, nicht `roundedRectangle`.
  Der falsche Name wird abgelehnt (`Validation error: … not in [...]`) und reißt
  wegen `set -e` das ganze Chrome-Skript mit. Der Eckenradius kommt über
  `shape.rectangleRoundedCurve`.
- **`--target` bei Buttons** wird 1:1 nach `navigationSection` geschrieben, ohne
  Auflösung auf den internen Seitennamen. In Desktop testen; wenn nichts
  passiert, den `name` aus `definition/pages/<ordner>/page.json` als `--target`
  setzen.
- **Zurück-Button beim Drill-through** hat im Mockup keinen Platz. `navigation.md`
  setzt ihn in die linke obere Ecke des Inhaltsbereichs; `pbir` meldet
  `PBIR_VISUAL_OVERLAP` (Warnung, kein Fehler) und legt ihn an. Platzierung mit
  dem Menschen klären.
- **Konsolen-Mojibake** (`Ãœ`, `Î”`) ist reine Anzeige; die geschriebenen Dateien
  sind UTF-8. Zum Prüfen die JSON lesen, nicht die Konsolenausgabe.
- **Design-Linter**: Chrome liegt absichtlich außerhalb der Content-Zone.
  `--skip-types shape,textbox,actionButton,image,slicer` setzen, sonst werden
  alle Chrome-Elemente als Zonen-Verstoß gemeldet.
- **Shapes mit Text sind keine Accessibility-Lösung.** Für Screenreader zählt der
  Alt-Text; `tabOrder` und Alt-Texte in Desktop nachziehen (siehe
  `powerbi-design-framework/references/design-rules.md`).
