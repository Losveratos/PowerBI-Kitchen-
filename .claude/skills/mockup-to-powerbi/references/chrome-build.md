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
pbir set "<Report>.Report/<Seite>.Page/chrome_footer_text.Visual.text.show" --value true
pbir set "<Report>.Report/<Seite>.Page/chrome_footer_text.Visual.text.default.text" \
  --value "Stand: 18.09.2026 · Quelle: DWH"
pbir set "<Report>.Report/<Seite>.Page/chrome_footer_text.Visual.text.default.fontColor" \
  --value "#6B7280"
```

**Text-Formatierung nur im Zustand `default`.** Power BI Desktop liest bei
`shape` und `actionButton` alle Text-Eigenschaften (`text`, `fontSize`,
`fontColor`, `fontFamily`, `bold`, `italic`, `horizontalAlignment`,
`verticalAlignment`, `leftMargin` … `bottomMargin`) nur aus dem Eintrag mit
`"selector": {"id": "default"}`; ohne Selektor wirkt allein `show`. Verifiziert im
Live-Lauf 02.10.2026: ohne Zustand stand im Kopfband kein Text, mit `text` und
`fontSize` im Zustand war er da, aber mittig, hellgrau und klein, solange
Ausrichtung, Farbe, Fett und Ränder ohne Selektor lagen. `pbir set
"<Visual>.text.default.<prop>"` und dieselben Schlüssel in `pbir batch` schreiben
den Selektor. Bei `actionButton` gilt das auch für `shape.tileShape` und
`shape.rectangleRoundedCurve` (`shape.default.*`, so speichert Desktop Buttons);
`fill.fillColor` und `outline.*` legt `pbir` von sich aus unter `default` ab.
Der Skill schreibt die Schlüssel so in `chrome-batch.json` und
`chrome-commands.sh/.ps1` (`state_key()` in `mockup_to_pbir.py`).

Zielform in der `visual.json` (wie Desktop sie speichert):

```json
"text": [
  { "properties": { "show": true } },
  { "properties": { "text": "…", "fontSize": 19, "fontColor": "…", "bold": true,
                    "horizontalAlignment": "left", "verticalAlignment": "middle",
                    "leftMargin": 0, "rightMargin": 0, "topMargin": 0, "bottomMargin": 0 },
    "selector": { "id": "default" } }
]
```

**`text.show = true` ist Pflicht.** Der Schalter steht bei `shape` und
`actionButton` standardmäßig auf aus (`pbir schema describe shape text` nennt
`show`). Ohne ihn steht der Text in `objects.text`, ist aber unsichtbar — so
fehlten im Deploy 4 Kopfband-Titel, Untertitel und Fußleistentext auf allen
Seiten (`mockup-live/AUDIT-DEPLOY4.md`). Der Skill setzt ihn bei jedem Chrome-Text,
jedem Nav-Button und jeder Text-/Button-Kachel. Die Textränder stehen auf 0, die
Position ist schon die Textposition aus dem Kitchen.

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
| `data` | `mode` (Enum: `Dropdown`, `Basic`, `Between`, `Before`, `After`, `Relative`, `Single`, …) | slicer |
| `general` | `orientation` (`0` Liste, `1` Kacheln), `selfFilterEnabled` (Suchfeld) | slicer |

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
pbir set "<Seite>.Page/<id>.Visual.border.color"  --value "#E1DFD6"   # Kitchen .tile
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

**Chrome-Farben** kommen aus `design.colors` (`panel`, `rule`, `tileBorder`,
`muted`, `slicerBorder`, `slicerBackground`, `slicerInk`, `footerNavInk`,
`footerBackground`), sonst aus dem Kitchen-CSS (`mockup-kitchen.html`):

| Schlüssel | Kitchen-Vorgabe | wofür |
|---|---|---|
| `panel` | `#ECEBE5` | Fläche des Filterbereichs |
| `rule` | `#E3E1D8` | Linie unter dem hellen Kopfband, am Filterbereich, über der Fußleiste |
| `tileBorder` | `#E1DFD6` | Kachelrahmen (`tileStyle: border`) |
| `muted` | `#6B7280` | Fußleistentext, Filter-Überschrift und -Hinweis |
| `slicerBorder` / `slicerBackground` / `slicerInk` | `#D9D6CC` / `#FFFFFF` / `#374151` | Slicer-Kasten |
| `footerNavInk` | `#475569` | inaktive Nav-Pillen in der Fußleiste |

Die CLI-Flags `--panel`, `--rule`, `--tile-border`, `--muted` gewinnen vor beidem.

**Schriftgrößen im Chrome: pt = Kitchen-px × k × 0,75**, auf 0,5 pt gerundet und
auf 6–45 pt begrenzt (außerhalb lehnt `pbir set` ab) — dieselbe Regel wie für die
Kacheltitel. `k` ist `design.fontScale` (= `canvas.uiScale`). Bis 01.10.2026 galt
„Basis × k" in pt; das war rund ein Drittel zu groß (`mockup-live/FIDELITY.md`,
Lücke 10).

| Text | Kitchen-px | bei k = 1,5 |
|---|---|---|
| Kopfband-Titel (fett) | 17 | 19 pt |
| Kopfband-Untertitel (70 % Deckkraft → Mischfarbe) | 11 | 12,5 pt |
| Nav-Pillen im Kopfband | 11,5 | 13 pt |
| Logo-Platzhalter | 10 | 11,5 pt |
| Filter-Überschrift (Versalien, grau, fett wie `h4`) | 11 | 12,5 pt |
| Filter-Hinweis | 9,5 | 10,5 pt |
| Slicer-Kopf und -Einträge | 10,5 | 12 pt |
| Fußleistentext | 10 | 11,5 pt |
| Nav-Pillen in der Fußleiste | 9,5 | 10,5 pt |

## Aufbau je Zone

Maße folgen `powerbi-design-framework/references/chrome-layouts.md`, Variante A
(Kopfband) bzw. B (linke Nav-Leiste). Die Zonen-Rechtecke kommen unverändert aus
der Spec, die Elemente darin werden relativ dazu gesetzt.

### Kopfband (`zones.header`)

| Element | Name | Geometrie | Befehle |
|---|---|---|---|
| Fläche | `chrome_header_bg` | Zone 1:1 | `shape.tileShape=rectangle`, `fill.show=true`, `fill.fillColor` je `headerStyle`, `outline.show=false`, `--z 0` |
| Unterkante | `chrome_header_rule` | `x`, `y+h-1`, `w`, 1 px — nur bei hellem Kopfband | `fill.fillColor=<rule>`, `--z 1` |
| Burger | `chrome_burger` | Rand 16 px, 32×32 (× k), senkrecht mittig — nur bei `header.burger` bzw. Filter-Modus `burger` | ohne Füllung, Umriss in Kopfbandschrift mit 70 % (dunkel 60 %) Transparenz, Radius 4, `text.default.text="☰"`, Aktion `--type Bookmark --target "Filter öffnen · <Seite>"` (navigation.md), `--z 5` |
| Logo | `chrome_logo` | `logoPos: left` → hinter Burger + 14 px; `right` → `x+w-16-88`; senkrecht mittig, 88×30 | Platzhalter-Shape mit Umriss (Kitchen: gestrichelt, das kann Power BI nicht) und Text `LOGO`; ersetzen durch `pbir add visual image "<Seite>.Page" -n chrome_logo -x … --image "<Pfad|URL|Table.Measure>"` |
| Titel | `chrome_header_title` | hinter Burger/Logo + 14 px, Breite bis vor die Nav-Pillen; mit Untertitel beide als Block senkrecht mittig (Zeilenhöhe 1,45) | `text.show=true`, `fill.show=false`, `outline.show=false`, `text.default.text=<title>` (alle Text-Eigenschaften in `text.default.*`), 17 px → pt, `bold`, Farbe je `headerStyle`, Ränder 0, `--z 4` |
| Untertitel | `chrome_header_subtitle` | direkt unter dem Titel, nur wenn das Band hoch genug ist | wie Titel, 11 px → pt, Kopfbandschrift zu 70 % gemischt |
| Nav-Pillen | `chrome_nav_1…n` | rechtsbündig, Breite nach Text (11,5 px, Polster 12 px), Höhe ≈ 29 × k, Lücke 6 — **nur wenn `header.navOn` nicht `false` ist** | **inaktiv:** keine Füllung, Umriss in Kopfbandschrift (Transparenz 70 bzw. 65), Radius 4, `PageNavigation`; **aktive Seite:** Akzent (im Akzent-Kopfband Ink), weiße Schrift, **keine** Aktion; `--z 5` |

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
| Fläche | `chrome_filter_bg` | Zone 1:1, `fill.fillColor` = `panel` (Kitchen `#ECEBE5`) |
| Kante | `chrome_filter_rule` | 1 px in `rule` zur Inhaltsseite (rechts: linke Kante, links: rechte Kante, oben: Unterkante) — nicht beim Overlay |
| Überschrift | `chrome_filter_title` | seitliches Panel: `x+10k`, `y+12k`, `w-20k`, 16k · Leiste oben: `x+16k`, volle Höhe, Breite nach Text. Text in **Versalien**, 11 px → pt, `muted`, fett (Kitchen `h4`) |
| Hinweistext | `chrome_filter_text` | nur mit `zones.filter.text` (Tool 0.4.4): 8k unter der Überschrift, `w-20k`, Höhe nach Zeilen (Zeile 1,35); Leiste oben rechts daneben, höchstens 220 px. 9,5 px → pt, `muted`, oben bündig |
| Schließen | `chrome_filter_close` | `x+w-36`, `y+8`, 28×24, Text `✕` in `muted` — nur bei `collapsible` oder Overlay |
| Slicer | v3 `mk_slicer_<Feld>_p<Seite>`, v2 `p<Seite>_slicer<i>_<Feld>`, v1 `slicer<i>_<Feld>` | seitlich gestapelt ab 8k unter Überschrift/Hinweis, `x+10k`, `w-20k`, Abstand 7k; Höhe Dropdown & Co. (27 + 25) × k, **mindestens 76 px**, Liste/Suche 94k, Kacheln/Button-Slicer 64k · oben nebeneinander 160k breit, Abstand 8k, senkrecht mittig — stehen bereits in `pbir-visuals.json` |

**Slicer-Optik** (`chrome-batch.json`): Container-Titel **aus** und Slicer-Kopf
**an** (`header.show`), damit der Feldname genau einmal dasteht (Deploy 4 zeigte
ihn doppelt); Kitchen-Kasten mit `background.color=slicerBackground`,
`border.color=slicerBorder`, Radius 4 × k; `header.textSize`/`items.textSize`
10,5 px → pt in `slicerInk`. Beim Button-Slicer (`advancedSlicerVisual`) nur der
Container. Unter 76 px meldet `pbir validate --qa` `SLICER_HEIGHT_BELOW_FLOOR`
(„the header or selector will clip", am Testbed geprüft) — deshalb die Untergrenze,
auch wenn der Kitchen-Kasten flacher ist.

Ab Tool 0.4.4 steht der Überschriftstext in `zones.filter.heading` (`null` =
keine Überschrift, dann kein `chrome_filter_title`); die Slicer rücken unter
Überschrift und Hinweistext. Die Slicer-Art (`slicers[].type`) setzt
`chrome-batch.json` über `data.mode` / `general.orientation` /
`general.selfFilterEnabled` — Tabelle in `spec-format.md` → Tool 0.4.4.

Die Modi im Einzelnen:

| `mode` | Wirkung | z-Ebene von Panel/Slicer |
|---|---|---|
| `right` / `left` | feste Spalte, Inhalt wird schmaler | `0` / `10` |
| `top` | feste Leiste unter dem Kopfband, Slicer nebeneinander | `0` / `10` |
| `burger` | Panel liegt **über** dem Inhalt (`overlay: true`), Burger-Button im Kopfband; Panel, Überschrift, Hinweis, Schließen-Button und Slicer werden **ausgeblendet angelegt** (`pbir visuals hide` in `analysis-commands.sh`, `pbir batch` kennt kein `isHidden`) | `20` / `24` |

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

Wie im Kitchen (`.zone.footer`): Band `chrome_footer_bg` über die Zone
(Fläche `footerBackground`, sonst Seitenhintergrund — das Kitchen-Band ist
transparent), Linie `chrome_footer_rule` 1 px in `rule` an der Oberkante und
`chrome_footer_text`: Shape ohne Füllung, `x+16k`, Text aus `footer.text`,
10 px → pt, `muted`, `text.show=true`, senkrecht mittig.

**Seitennavigation in der Fußleiste** (Tool 0.4.3, `navPosition: "footer"`,
Liste in `zones.footer.nav`): `actionButton`s `chrome_nav_<i>` rechtsbündig
(Rand 16 × k, Abstand 5 × k, Höhe ≈ 22 × k, Breite nach Text), Schrift
9,5 px → pt — kleiner als im Kopfband. Aktive Seite: Akzentfüllung, keine Aktion;
die anderen: Umriss in Ink mit 70 % Transparenz, Radius 3, Schrift
`footerNavInk`, `PageNavigation`.
Der Fußzeilentext wird entsprechend schmaler. Das Kopfband bekommt dann keine
Nav-Buttons.

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

Vergebene Ebenen: Chrome-Flächen `0` (Linien `1`), Chrome-Texte `4`,
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

Dazu die Seite und ihre Umgebung (ab 02.10.2026):

```json
"page": { "*": {
  "outspace":   [{ "color": { "solid": { "color": "#EAE8E1" } }, "transparency": 0 }],
  "background": [{ "color": { "solid": { "color": "<design.pageBackground>" } }, "transparency": 0 }]
} }
```

Ohne `outspace` leitet Desktop die Fläche um die Seite aus der dunklen
Vordergrundfarbe ab (Live-Lauf: dunkelblauer Rand). Farbe ist die Bühne des
Kitchens `#EAE8E1`; `design.stageBackground` (oder `design.colors.stage`)
überschreibt sie, im dunklen Modus wird der Seitenhintergrund um 35 % abgedunkelt.
Einzeln setzbar mit `pbir theme set-formatting "<Report>" "page.*.outspace.color"
--value "#EAE8E1"` und `"page.*.outspace.transparency" --value 0` (schreibt nur die
Theme-Datei).

Wer ein Theme pflegt, merged das Fragment dorthin (Skill
`reports:modifying-theme-json` bzw. `powerbi-design-framework`) und lässt die
`background`/`border`/`dropShadow`-Schritte in `chrome-batch.json` weg — dann
steht die Gestaltung an **einer** Stelle statt an jedem Visual. Per Visual nur
noch Ausnahmen. Seitenhintergrund und Akzentfarbe bleiben außerhalb des
Fragments (Seiten-Objekt bzw. Nav-Buttons).

## Native Visuals in Kitchen-Optik

`chrome-batch.json` setzt je nativem Visual (auch dem ChartKitchen-Ersatz aus
`--ck-fallback`), was die Kitchen-Skizze zeigt. Die Objekte je Typ sind mit
`pbir schema describe <typ> <objekt>` geprüft, die Selektor-Syntax
`dataPoint.field(<Tabelle.Kennzahl>).fill` mit `pbir batch` am Testbed
(`selector.metadata` = queryRef der Kennzahl):

| Kitchen | Power BI |
|---|---|
| IBCS-Skizze: keine Legende, keine Wertachse, kein Gitter | `legend.show=false`, `valueAxis.show=false`, `valueAxis.gridlineShow=false` |
| Werte an den Datenpunkten | `labels.show` (aus `display.drawn.labels`, sonst an), `labels.color`, `labels.fontSize` = Diagrammschrift in pt |
| AC dunkel, PY grau, PL weiß mit Umriss | `dataPoint.field(<AC>).fill=#404040`, `…(<PY>).fill=#B3B3B3`, `…(<PL>).fill=#FFFFFF` + `borderShow/borderColor/borderSize` (Linien: PL grau) — Szenario nach Feldname wie bei ChartKitchen |
| Wasserfall gut/schlecht | `sentimentColors.increaseFill/decreaseFill/totalFill` (Polarität dreht) |
| Einheiten/Stellen | `labels.show=true` + `labelDisplayUnits`/`labelPrecision` (sonst unsichtbar) |
| Power-BI-Klassiker (`ncolumn`, `nbar`, `nline`, …) | Legende bleibt, `valueAxis.gridlineStyle=dotted`, Kennzahlfarben aus `design.nativePalette` (nicht bei `pbi`) |
| Kachel ohne Kopf (`title` leer bzw. `titleShown: false`) | `title.show=false`, Titeltext bleibt für den Auswahlbereich |

Kennzahlen, die als **Spalte** gebunden sind, bekommen keine Farbe (pbir
projiziert sie als `Sum(...)`, der Selektor dafür ist ungeprüft).

## Fallstricke

- **`--from-json` liest die Datei als cp1252.** Eine UTF-8-Datei mit „Fußleiste"
  kommt als „FuÃŸleiste" an (am Testbed nachgestellt), eine BOM lehnt pbir ab.
  Der Skill schreibt `chrome-visuals.json`, `pbir-visuals.json` und
  `text-visuals.json` deshalb mit `\u`-Escapes (reines ASCII). Wer selbst eine
  `--from-json`-Datei erzeugt: `json.dump(..., ensure_ascii=True)`.
  `pbir batch` liest UTF-8 korrekt.
- **`pbir visuals labels --labelDisplayUnits`** bricht in 0.9.32 ab („Expected
  integer, got str", auch mit `1000000`). `pbir set "<Visual>.labels.labelDisplayUnits"
  --value 1000000` funktioniert — so steht es in `analysis-commands.sh`.

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
