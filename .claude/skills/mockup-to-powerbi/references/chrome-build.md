# Chrome bauen — Kopfband, Nav, Filter-Panel, Fußleiste mit `pbir`

„Chrome" = alles, was kein Daten-Visual ist. MockupKitchen liefert die Zonen
millimetergenau; hier steht, aus welchen nativen Elementen sie entstehen und
welche Befehle dafür verifiziert sind (pbir 0.9.32, echtes PBIP).

`scripts/mockup_to_pbir.py` erzeugt daraus **je Seite** zwei Dateien in
`mockup-out/<Seitenslug>/`: `chrome-visuals.json` (Geometrie) und
`chrome-commands.sh` / `.ps1` (Seitenhintergrund, Text, Farbe,
Kachel-Container, Aktion, z-Order).

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

## Gestaltung aus `design` (specVersion 2)

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
| `dark` | Ink (`--ink`) | Weiß | – |
| `accent` | `design.accent` | Weiß | – |

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
| Nav-Buttons | `chrome_nav_1…n` | rechtsbündig, je 112×32, Lücke 8 (alle skaliert) | **inaktiv:** `fill.show=false`, `text.fontColor=<Kopfbandschrift>`, `pbir visuals action … --type PageNavigation --target "<Seite>"`; **aktive Seite:** `fill.fillColor=<Akzent>`, weiße Schrift, **keine** Aktion; `--z 5` |

### Linke Nav-Leiste (`zones.nav`)

Existiert die Zone, wandern Logo (40×40 oben) und ein Button je Seite
(`zones.nav.pages`) dorthin — gestapelt bei `x+8`, Höhe 40, Abstand 48 px,
Fläche in Ink. Das Kopfband behält Titel und Untertitel.

### Filter-Panel (`zones.filter`)

| Element | Name | Geometrie |
|---|---|---|
| Fläche | `chrome_filter_bg` | Zone 1:1, `fill.fillColor` eine Stufe heller/dunkler als der Seitenhintergrund |
| Überschrift | `chrome_filter_title` | seitliches Panel: `x+8`, `y+8`, `w-16`, 24 px · Leiste oben: `x+8`, `y`, 56 px breit, volle Höhe. Text „Filter", 11 pt, fett |
| Schließen | `chrome_filter_close` | `x+w-36`, `y+8`, 28×24, Text `✕` — nur bei `collapsible` oder Overlay |
| Slicer | `p<Seite>_slicer1_<Feld>` … | seitlich gestapelt `x+8k`, `y+40k+i·64k`, `w-16k`, `56k` · oben nebeneinander `x+8k+i·168k`, `y+8k`, `160k`, `h-16k` — stehen bereits in `pbir-visuals.json` |

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
  "chrome_filter_bg" "chrome_filter_title" "chrome_filter_close" "p1_slicer1_Year" …
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
4. `bash <Seitenslug>/chrome-commands.sh` — Seitenhintergrund, Texte, Farben,
   Kachel-Container, Aktionen, und zum Schluss die z-Ebenen

Erst wenn **alle** Seiten stehen: Nav-Ziele, Drill-through und Lesezeichen
(`navigation.md`) — vorher existieren die Zielseiten nicht.

Vergebene Ebenen: Chrome-Flächen `0` (Kopfband-Unterkante `1`), Chrome-Texte `4`,
Buttons `5`, Inhalt `10`, Overlay-Filterpanel `20`, dessen Text `22`, dessen
Slicer und Schließen-Button `24`.

Schritt 4 dauert: jede Property ist ein eigener `pbir`-Prozessstart, gemessen
rund 1,5 s. Kopfband, Filter-Panel, Fußleiste **und** Kachel-Formatierung
ergeben im zweiseitigen Beispiel 121 Setzungen je Seite — also gut drei
Minuten pro Seite. Im Hintergrund laufen lassen und nicht abbrechen.
Wer es kürzer will, gießt dieselben Setzungen in eine `pbir batch`-Spec
(`pbir batch schema --version 2` zeigt das Format, dann `validate` → `plan` →
`run`) — ein Prozess statt hundertdreißig.

`chrome-commands.sh` startet mit `set -euo pipefail`: ein einziger abgelehnter
Wert bricht den Rest ab. Der Exit-Code sagt also verlässlich, ob alles saß.

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
