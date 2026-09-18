# Chrome bauen — Kopfband, Nav, Filter-Panel, Fußleiste mit `pbir`

„Chrome" = alles, was kein Daten-Visual ist. MockupKitchen liefert die Zonen
millimetergenau; hier steht, aus welchen nativen Elementen sie entstehen und
welche Befehle dafür verifiziert sind (pbir 0.9.32, echtes PBIP).

`scripts/mockup_to_pbir.py` erzeugt daraus zwei Dateien:
`chrome-visuals.json` (Geometrie) und `chrome-commands.sh` / `.ps1`
(Text, Farbe, Aktion, z-Order).

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
| `shape` | `tileShape` (`rectangle`, `roundedRectangle`, …), `rectangleRoundedCurve`, `roundEdge` | shape |
| `text` | `text`, `fontSize` (6–45), `fontColor`, `fontFamily`, `bold`, `italic`, `horizontalAlignment` (`left`/`center`/`right`), `verticalAlignment` (`top`/`middle`/`bottom`), `leftMargin` … | shape, actionButton |
| `icon` | 14 Properties | actionButton |
| `title` / `subTitle` | `show`, `text`, `fontSize`, `fontColor`, `alignment`, `heading`, `titleWrap` | jedes Visual (Container) |

Farbwerte als Hex übergeben (`--value "#0F1E2E"`); `pbir` kodiert sie selbst als
`{ solid: { color: … } }`.

## Aufbau je Zone

Maße folgen `powerbi-design-framework/references/chrome-layouts.md`, Variante A
(Kopfband) bzw. B (linke Nav-Leiste). Die Zonen-Rechtecke kommen unverändert aus
der Spec, die Elemente darin werden relativ dazu gesetzt.

### Kopfband (`zones.header`)

| Element | Name | Geometrie | Befehle |
|---|---|---|---|
| Fläche | `chrome_header_bg` | Zone 1:1 | `shape.tileShape=rectangle`, `fill.show=true`, `fill.fillColor=<Ink>`, `outline.show=false`, `--z 0` |
| Logo | `chrome_logo` | `x+16`, vertikal zentriert, 120×32 | Platzhalter-Shape mit Kontur und Text `LOGO`; ersetzen durch `pbir add visual image "<Seite>.Page" -n chrome_logo -x … --image "<Pfad|URL|Table.Measure>"` |
| Titel | `chrome_header_title` | ab `x+16` (mit Logo: `x+152`), Breite bis vor die Nav-Buttons | `fill.show=false`, `outline.show=false`, `text.text=<title>`, `fontSize 16`, `bold`, `fontColor=<OnInk>`, `verticalAlignment=middle`, `--z 4` |
| Untertitel | `chrome_header_subtitle` | unter dem Titel, nur wenn das Band ≥ 48 px hoch ist | wie Titel, `fontSize 10`, gedämpfte Farbe |
| Nav-Buttons | `chrome_nav_1…n` | rechtsbündig, je 112×32, Lücke 8 | `fill.fillColor=<Ink>`, `text.text=<Seitenname>`, `horizontalAlignment=center`, `pbir visuals action … --type PageNavigation --target "<Seite>"`, `--z 5` |

### Linke Nav-Leiste (`zones.nav`)

Existiert die Zone, wandern Logo (40×40 oben) und die Buttons aus
`header.nav` dorthin — gestapelt bei `x+8`, Höhe 40, Abstand 48 px. Das Kopfband
behält Titel und Untertitel.

### Filter-Panel (`zones.filter`)

| Element | Name | Geometrie |
|---|---|---|
| Fläche | `chrome_filter_bg` | Zone 1:1, `fill.fillColor` eine Stufe heller/dunkler als der Seitenhintergrund, `--z 0` |
| Überschrift | `chrome_filter_title` | `x+8`, `y+8`, `w-16`, 24 px, Text „Filter", 11 pt, fett |
| Slicer | `slicer1_<Feld>` … | `x+8`, `y+40+i·64`, `w-16`, 56 px — stehen bereits in `pbir-visuals.json` |

`collapsible: true` bedeutet: der Mensch will das Panel per Bookmark ein- und
ausblenden. Das baut `pbir` nicht; als Desktop-Schritt im Abschlussbericht
nennen (Panel + Öffnen/Schließen-Button, zwei Lesezeichen, Aktion „Lesezeichen").

### Fußleiste (`zones.footer`)

Ein `shape` ohne Füllung über die Zone, `x+16`, `w-32`, Text aus `footer.text`,
9 pt, gedämpftes Grau, `verticalAlignment=middle`.

## Reihenfolge und z-Order

`--from-json` schreibt **immer** `z = 0`. Ohne Korrektur liegen Chrome-Flächen
und Inhalts-Visuals auf derselben Ebene — das Filter-Panel kann seine eigenen
Slicer verdecken. Deshalb:

1. `pbir add page …` + `pbir rm "<Seite>.Page/Title.Visual" -f`
2. `pbir add visual "<Seite>.Page" --from-json chrome-visuals.json`
3. `pbir add visual "<Seite>.Page" --from-json pbir-visuals.json`
4. `bash chrome-commands.sh` — setzt Texte, Farben, Aktionen und hebt zum Schluss
   jedes Inhalts-Visual auf `--z 10`

Vergebene Ebenen: Flächen `0`, Texte `4`, Buttons `5`, Inhalt `10`.

Schritt 4 dauert: jede Property ist ein eigener `pbir`-Prozessstart, ein
vollständiges Kopfband mit Filter-Panel und Fußleiste kommt auf rund 90 Aufrufe
und braucht über zwei Minuten. Im Hintergrund laufen lassen und nicht abbrechen.
Wer es kürzer will, gießt dieselben Setzungen in eine `pbir batch`-Spec
(`pbir batch schema --version 2` zeigt das Format, dann `validate` → `plan` →
`run`) — ein Prozess statt neunzig.

## Fallstricke

- **`--target` bei Buttons** wird 1:1 nach `navigationSection` geschrieben, ohne
  Auflösung auf den internen Seitennamen. In Desktop testen; wenn nichts
  passiert, den `name` aus `definition/pages/<ordner>/page.json` als `--target`
  setzen.
- **Konsolen-Mojibake** (`Ãœ`, `Î”`) ist reine Anzeige; die geschriebenen Dateien
  sind UTF-8. Zum Prüfen die JSON lesen, nicht die Konsolenausgabe.
- **Design-Linter**: Chrome liegt absichtlich außerhalb der Content-Zone.
  `--skip-types shape,textbox,actionButton,image,slicer` setzen, sonst werden
  alle Chrome-Elemente als Zonen-Verstoß gemeldet.
- **Shapes mit Text sind keine Accessibility-Lösung.** Für Screenreader zählt der
  Alt-Text; `tabOrder` und Alt-Texte in Desktop nachziehen (siehe
  `powerbi-design-framework/references/design-rules.md`).
