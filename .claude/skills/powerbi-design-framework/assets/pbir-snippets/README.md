# PBIR-Snippets — Referenz-Bibliothek für Standard-Visuals

Kleine Sammlung echter `visual.json`-Beispiele für die vier häufigsten
Standard-Visuals einer Komponenten-Seite (Weg B aus
`../../references/components-page.md`): Textbox, Action-Button, Shape,
Image. Kein selbst erfundenes JSON — jede Datei stammt aus einem
öffentlichen Repository und wurde nur auf Text-/Farbwerte hin neutralisiert
(siehe „Was wurde geändert" je Snippet).

## Herkunft

Alle vier Dateien stammen aus:

**Repo:** [`data-goblin/power-bi-agentic-development`](https://github.com/data-goblin/power-bi-agentic-development)
(Plugin-Marketplace für Power-BI-Agenten-Skills, GPL-3.0)
**Pfad:** `plugins/pbip/skills/pbir-format/examples/visuals/`
**Index:** [`examples/visuals/__index.md`](https://github.com/data-goblin/power-bi-agentic-development/blob/main/plugins/pbip/skills/pbir-format/examples/visuals/__index.md)
listet dort insgesamt 54 Stand-alone-`visual.json`-Beispiele in zwei
Unterordnern `default/` (minimal, nur Theme) und `formatted/` (mit
individueller Formatierung).

| Snippet hier | Quelldatei im Repo (raw-URL) |
| --- | --- |
| `textbox.visual.json` | `.../examples/visuals/formatted/textbox.json` — [raw](https://raw.githubusercontent.com/data-goblin/power-bi-agentic-development/main/plugins/pbip/skills/pbir-format/examples/visuals/formatted/textbox.json) |
| `action-button.visual.json` | `.../examples/visuals/formatted/actionButton.json` — [raw](https://raw.githubusercontent.com/data-goblin/power-bi-agentic-development/main/plugins/pbip/skills/pbir-format/examples/visuals/formatted/actionButton.json) |
| `shape.visual.json` | `.../examples/visuals/formatted/shape.json` — [raw](https://raw.githubusercontent.com/data-goblin/power-bi-agentic-development/main/plugins/pbip/skills/pbir-format/examples/visuals/formatted/shape.json) |
| `image.visual.json` (Bonus) | `.../examples/visuals/default/image.json` — [raw](https://raw.githubusercontent.com/data-goblin/power-bi-agentic-development/main/plugins/pbip/skills/pbir-format/examples/visuals/default/image.json) |

**Schema-Version der Fundstücke:** `$schema` verweist in allen vier Dateien
auf
`https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.7.0/schema.json`
— **unverändert übernommen**, wie in `pbir-integration.md` gefordert. Das
ist die Schema-Version, mit der der Quell-Report gespeichert wurde; sie
muss vor Einsatz gegen die übrigen Dateien des Ziel-Reports abgeglichen
werden (siehe Warnungen unten).

Für `action-button.visual.json` und `shape.visual.json` waren die
Original-`name`-Werte Desktop-generierte Zufalls-IDs
(z. B. `4e7f3679ee7ce6d4b914`) — hier durch sprechende Platzhalternamen
(`action_button_example`, `shape_example`) ersetzt und die
Positionskoordinaten auf 2 Nachkommastellen gerundet (rein kosmetisch,
keine strukturelle Änderung). `textbox.visual.json` und
`image.visual.json` hatten bereits sprechende Namen aus dem
Default-/Formatted-Beispielsatz des Quell-Repos und blieben unverändert.

## Was wurde geändert (Text/Farbe → neutrale Platzhalter)

- **`textbox.visual.json`:** Texte „Sales Overview" / „Year-to-date
  performance against targets" → `Beispiel-Titel` / `Beispiel-Untertitel`.
  Textfarben `#252423` / `#605E5C` → `#1F2937` (dunkler Ink-Platzhalter) /
  `#6B7280` (gedämpfter Platzhalter). Struktur (Titel + Untertitel als zwei
  Absätze, `visualContainerObjects` schaltet Titel/Hintergrund/Rahmen der
  Karte selbst aus) unverändert.
- **`action-button.visual.json`:** keine Klartexte/Literal-Farben im
  Original (Füllfarbe läuft über `ThemeDataColor`, nicht über Literal-Hex)
  — nur Name/Position bereinigt, sonst 1:1 wie gefunden.
- **`shape.visual.json`:** Tooltip- und Header-Literal-Farben
  `#E6DFCF` / `#3B4244` / `#F4F4F4` → neutrales Platzhalter-Paar
  `#F3F4F6` (hell) / `#1F2937` (dunkel) / `#FFFFFF`. Die
  Kachel-Hintergrundfarbe selbst läuft über `ThemeDataColor` (Theme-Slot 0)
  und wurde nicht angefasst.
- **`image.visual.json`:** `ItemName` des referenzierten Registered
  Resource `logo.png` → `logo-placeholder.png` (siehe Warnung unten, das
  ist kein automatisch funktionierender Wert).

## Was fehlt

Kein fünfter Typ wurde als „gefunden" ergänzt, der es nicht ist — es gibt
nur die vier oben gelisteten Dateien. Falls später weitere Standard-Visual-
Typen gebraucht werden (z. B. `slicer`, `card`, `basicShape`-Varianten wie
Pfeil/Linie, oder ein Action-Button mit sichtbarem `text`-Objekt statt nur
Icon/Fill), sind sie **hier nicht enthalten** und müssten entweder per
Desktop-Export aus einem echten Report nachgeliefert oder aus
`examples/visuals/__index.md` des Quell-Repos nachgezogen werden (dort
liegen laut Index noch 50 weitere Beispiele, u. a. vermutlich Slicer- und
Card-Varianten, aber nicht einzeln verifiziert/heruntergeladen für dieses
Set).

## Warnungen — vor Einsatz lesen

1. **Referenz-Instanz-Prinzip geht vor:** Diese Snippets sind Startpunkte
   für den Fall, dass der Ziel-Report noch **kein** Exemplar des jeweiligen
   Visual-Typs enthält. Sobald der Ziel-Report bereits eine Textbox/einen
   Button/ein Shape hat, ist **dieses vorhandene Exemplar immer die
   bessere Vorlage** (siehe `pbir-integration.md` und
   `chartkitchen-report/references/pbir-insertion.md`) — insbesondere weil
   es garantiert mit der richtigen Schema-Version und denselben
   `ThemeDataColor`-Slots des Ziel-Reports funktioniert.
2. **Vor dem Einspielen anpassen:**
   - `name` eindeutig neu vergeben (muss reportweit eindeutig sein —
     Kollision mit bestehenden Visual-Namen vermeiden).
   - `position` (x/y/z/height/width/tabOrder) auf die Ziel-Seite und das
     8-px-Raster der Spec anpassen; die hier enthaltenen Koordinaten
     stammen aus dem Quell-Report und passen nirgendwo automatisch.
   - `$schema`-Version gegen eine **vorhandene** `visual.json` desselben
     Ziel-Reports abgleichen (z. B. `grep '"$schema"' pfad/zum/Report/definition/pages/*/visuals/*/visual.json | sort -u`)
     — weicht die Version ab, im Zweifel die Version des Ziel-Reports
     übernehmen, nicht die hier mitgelieferte.
   - Bei `shape.visual.json` und `action-button.visual.json`:
     `ThemeDataColor`-Referenzen (`ColorId: 0`, `ColorId: 2`) zeigen auf
     Slots im **Quell-Theme** — im Ziel-Report können an denselben
     Slot-Nummern andere Farben liegen; gegen `theme.json` des Ziel-Reports
     prüfen.
   - Bei `image.visual.json`: `ItemName` referenziert eine **Registered
     Resource** (`RegisteredResources`-Package) — das Bild muss im
     Ziel-Report tatsächlich unter genau diesem Namen registriert sein
     (Desktop: Formatbereich → Bild → Durchsuchen, dabei legt Desktop den
     Resource-Eintrag an). Ohne passende Registrierung bleibt das Bild
     leer/kaputt.
3. **Nach dem Einspielen in Desktop verifizieren:** Desktop öffnen, Seite
   ansehen, Auswahl-Bereich prüfen (Name korrekt, keine Fehl-Overlaps),
   und — falls der Skill zuvor mit `bulk_restyle.py --check` lief — den
   Check erneut laufen lassen, um sicherzustellen, dass die neuen Visuals
   den Spec-Regeln (Raster, Schriftgrößen, kein Schatten, `tabOrder`)
   genügen.
