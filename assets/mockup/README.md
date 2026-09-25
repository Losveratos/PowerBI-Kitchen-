# MockupKitchen · Bauplan (v0.4)

Positionierung (aus dem Review): kein Report-Generator, sondern ein **Anforderungswerkzeug mit deterministischem
Ausgang**. Der Workshop legt Struktur, Felder und Entscheidungen fest; der Bau ist eine Ableitung.

## Neu in v0.4 (erstes Nutzer-Feedback)

- **Skizzen:** Δ-Ebene in `varint` als echte kumulierte Brücke (`deltaBridge()`, Verbinder, Labels, Σ-Spalte); Balkenbreiten
  zentral über `colGeom()/rowGeom()`; Optionen `palette` (`teal` Standard = ChartKitchen-Farben `#1E8F9E/#D64541`, `ibcs` =
  Grün/Rot), `ink`, `dark`, `paper` (Kachelgrund); keine globalen Farbkonstanten mehr (`theme(o)`); neuer Typ `pnl`.
- **Custom Visuals:** Engine `custom` mit `customVisual {name, guid, map}` im Katalog; `gantt` → `dataKitchenGantt`
  (Rollen task/start/end/phase), `pnl` → `pnlByDatenWG` (levels/ac/py/pl/fc/rowType, Referenz-Measures nach Namen auf
  py/pl verteilt). GUIDs aus den `pbiviz.json` im Repo. Export: `visuals[].customVisual.buckets`, Badge „CV".
- **Design:** Palette-Umschalter, eigene Farben für Seite (`pageBg: custom` + Hex), Kachelgrund, Schrift und Kopfband
  (`header: custom` + zwei Farben). Dunkler Kachelgrund schaltet Skizzen und PNG-Renderer auf helle Schrift.
  Export: `design.variancePalette`, `varianceColors`, `colors{…}`, `darkMode`.
- **Demo-Modelle:** fünf typische Modelle (Controlling, Sales, HR, Online-Marketing, GuV) über `CAT.demoModels`, Auswahl
  im Modell-Panel; `S.demoId` merkt sich die Wahl.

- **Darstellungsvarianten je Kachel (v0.4.1):** Checkbox *Small Multiples* (Zusatzrolle „Small Multiples nach", Skizze als
  2×2/3×2-Raster über `MK_SKETCH.small`, Export `analysis.smallMultiples.field`) und *Achse per Feldparameter* (Achsenrolle nimmt
  bis zu acht Felder, Name des Parameters, Export `analysis.fieldParam {name, role, fields}`); Rollen je Kachel über
  `CAT.rolesFor(def, v)`. Issues `SM_NO_FIELD`, `FIELDPARAM_FEW`.
- **Native Klassiker (v0.4.1):** `ncolumn`, `nbar`, `nline`, `ndonut` (Gruppe „Native Klassiker & Sonstige") ohne
  Szenario-Notation (`plain: true` → Skizze mit Szenario AC), Rollen Kategorie/Legende/Werte, Donut-Skizze `S.donut`.
- **Pixelgenau prüfen (v0.5.0):** Modul `gridcheck.js` (`MK_GRIDCHECK.check/snap/marginFix`, Node-testbar). Knopf unter Seite → Raster und „⌗" in der Fußleiste der Bühne: Befunde je Seite (Kanten, die um 1 bis 3 px auseinanderliegen; Zwischenräume ≠ g px; fast gleiche Spuren; Pixelrest am Rand; Teilungsbaum), „Ausrichten" überführt regelmäßige Bäume aus Vorlagen ins Raster und gleicht Spuren an, „Rand anpassen" verschiebt Rand und notfalls Zwischenraum um 1 bis 2 px, damit gleiche Spalten und Zeilen ohne Rest aufgehen. Export-Issue `LAYOUT_NOT_PIXEL_PERFECT` (info) je Seite mit Abweichungen.
- **Echtes Raster (v0.4.9, Nutzer-Feedback):** „Inhalt neu aufteilen" legt einen Layoutknoten `grid` an (`cols[]`, `rows[]` als Spurgewichte, `children[] = {r, c, rs, cs, node}`). Spuren werden einmal berechnet, damit alle Zellen einer Spalte bzw. Zeile exakt fluchten; Zwischenraum ziehen ändert die ganze Spur; Verbinden über „+" waagerecht und senkrecht hält das Raster ein (nur Nachbarn gleicher Höhe bzw. Breite, sonst Hinweis); Teilen einer verbundenen Zelle stellt die Zellen wieder her; „+" am Rand legt eine Spur an. Vorlagen bleiben Bäume (`split`). Export `layoutTree` kennt `{grid, cells}`. Behoben damit: willkürliches Verbinden, nur waagerecht, Zwischenräume verschiedener Zeilen nicht auf einer Linie.
- **Rechtes Panel aufgeräumt (v0.4.8):** Kachel-Reiter mit Klappgruppen Darstellung, Analyse (zu, Badge „n gesetzt“) und Workshop (offen, Badge Priorität); Canvas, Abstände und Standard-Szenario von „Seite“ nach „Design“ (Gruppen Canvas, Kacheln & Flächen, Farben, Typografie, Barrierefreiheit zu); „Stände vergleichen“ ans Ende von „Bericht“; Zonen als Klappgruppen (Zahnrad/Doppelklick klappt auf). Zustand der Gruppen liegt in `localStorage` (`mockupkitchen.panels.v1`), Inspector-Gruppen über `grp(key, title, inner, default, badge)`.
- **Beispielwerte, Farbschema, Vergleich (v0.4.7):** Kachel-Fenster mit Box „Beispielwerte" (Kategorien, Werte, Vergleich als Text, `v.samples`, Export `visuals[].samples {categories, values, refValues}`), Skizzen zeigen die Namen und formatierte Zahlen; Design „Farbschema native Visuals" (`design.nativePalette` neutral/pbi/kitchen, Vorgabe neutral); Reiter „Bericht" → „Stände vergleichen": gespeicherte Datei oder Export gegen den aktuellen Stand (`diff.js`, `MK_DIFF.compare`), Dialog + Markdown-Kopie; Tooltip an Kacheln erklärt Tauschen per Drag.
- **Einfügen am Rand, neue Slicer-Arten (v0.4.6):** „+" an den vier Seitenrändern fügt eine Kachel auf der obersten Ebene ein und verteilt alle Kacheln dieser Ebene gleich (aus 2 gleichen werden 3 gleiche; `MK.insertEdge(side)`); Slicer-Arten `relative` (relatives Datum, `data.mode = Relative`) und `button` (Button-Slicer = `advancedSlicerVisual`), im Skill mit pbir am Testbed verifiziert.
- **Skizzen näher an ChartKitchen und Power BI (v0.4.5):** `sketches.js` überarbeitet (53 Skizzenarten, Node-Matrix 13.804 Renderings): Varianzanalyse mit drei Ebenen (Δ%, Δ-Brücke, Säulen AC/FC vs PL), Kombi, Tabelle, KPI-Kacheln; native Klassiker mit eigenem Look (`ncolumn`, `nbar`, `nline`); GuV-Skizze mit Darstellungsmodi (`mode: full|acref|dall|acpydpy|acpldpl|dpct`, `treeCard`, `density`); Skizzen übernehmen `fontScale`/`fonts` aus der Typografie und den dunklen Kachelgrund. Fix: Barrierefreiheits-Check warf bei Fußleisten-Navigation einen Fehler.
- **Typografie, Filter, Barrierefreiheit (v0.4.4):** zentrale Schriftgrößen im Design-Reiter (`design.typo {scale,title,sub,chart}`,
  Basis 1280 px, skaliert mit der Seite; CSS-Variablen `--fs-title/--fs-sub`, Skizzen-Option `fontScale`/`fonts`), je Kachel
  übersteuerbar (`visual.typo.scale`, Kachel-Fenster). Filterbereich: Überschrift auto/immer/nie mit eigenem Titel, Freitext,
  Slicer-Art je Feld (dropdown, list, tile, between, date, search) mit Glyphe auf der Seite; Export `zones.filter.heading/text`,
  `slicers[].type`, `design.typography`, `visuals[].typography`. Reiter „Rahmen" heißt „Zonen". Modul `a11y.js`
  (`MK_A11Y.check/summary/guide/renderList/renderGuide`, Node-Test `a11y-test.js`): Kontrast, Schriftgrößen, Kachelgrößen,
  fehlende Titel, Dichte, Lesereihenfolge, Navigation, Slicer-Namen; Ergebnis im Design-Reiter und als `A11Y_*`-Issues im
  Export. Neue Projekte starten in Full HD (1920 × 1080).
- **Layout und Zonen (v0.4.3):** gleiche Kachelbreiten (Pixelrest an den Rand), Nachbarn verbinden über „+" im
  Zwischenraum (`mergeGutter`), Zahnrad je Zone und Doppelklick auf Kopfband/Filter/Fußleiste öffnen den passenden
  Abschnitt im Reiter „Rahmen" (`openFrameSection`), Seitennavigation im Kopfband, in der Fußleiste oder aus
  (`chrome.navPos`, Export `zones.header.navPosition`, `zones.footer.nav`).
- **Kachel-Fenster (v0.4.2):** Button „Notiz & Einstellungen" oben im Inspector (Taste N) öffnet einen Dialog mit Titel,
  Priorität, Status, offener Frage, großer Notiz, Verhalten (Drill-down, Cross-Filter, Drill-through-Ziel) und
  Darstellung (Small Multiples, Feldparameter). Export `visuals[].interaction {drillDown, crossFilter, drillThrough}`,
  Brief-Zeile „Verhalten: …". Tooltips von Öffnen/Speichern erklären den Weiterarbeiten-Weg (.mockup.json).
- **Kopfband (v0.4.1):** Seitennavigation abschaltbar (`chrome.header.navOn`, Export `zones.header.navOn`);
  Pille „← Knowledge Kitchen" unten links (im Präsentiermodus ausgeblendet).

## Neu in v0.3 (Roadmap aus dem Sechs-Personen-Review, `REVIEW-2026-09-18.md`)

- **Spec v3:** stabile Visual-IDs (`mk_<Knoten-ID>`), `meta.specHash`, `report` (Berichtskopf), `analysis` je Kachel
  (Polarität, Δ-Basis/-Art, Einheit, Anzeige-Einheit, Dezimalen, Sortierung, Top-N, Zeitgranularität, kumuliert,
  Skalengruppe, Kernaussage), `workshop` (Priorität, Status, offene Frage), `content` bei Text/Button, `fields`
  (Steckbrief je gebundenem Feld: Alias, bestätigt, Owner, Quelle, Ziel, Einheit, Anmerkung), `links[].drillField`,
  `slicers[].default`, strukturierte `issues[]`.
- **Tool:** Reiter „Bericht" (Zielgruppe, Ziel, Entscheidung, Version, Datenstand, Teilnehmende, Sprache), Fragestellung
  je Seite, Rollenmenü statt Raten bei mehrdeutiger Feldzuweisung, Klick-Fallback (Chip anklicken → gewählte Kachel),
  Kacheln per Tastatur (Tab/Enter), Präsentiermodus (Taste P, Panels weg, Zoom ~100 %), Undo/Redo-Buttons,
  gegenskalierte Editier-Controls, rote Markierung leerer Pflichtrollen, Anti-Pattern-Überzug (Kreis, Tacho),
  Engine-Whitelist (Typen ohne ChartKitchen-Modus bekommen keine ck-Engine), Steckbrief per Doppelklick auf ein Feld.
- **Skizzen:** `polarity`, `scenarios`/`deltaBasis`, `lang`, `unit`, `antiPattern` als Optionen.
- **Export:** Seitenbilder als PNG (`render-png.js`), Native Visuals mit leeren Pflichtrollen werden nicht mehr in
  `pbir-visuals` geschrieben, Text-Kacheln tragen `content`.
- **Sprache:** `i18n.js`, Umschalter DE/EN; Skizzen-Beschriftungen und Export-Dokumente folgen `S.lang`.

Mockup-Tool für Power-BI-Berichte mit mehreren Seiten. Einstieg: `mockup-kitchen.html` im Repo-Root, lokal über
`python -m http.server 8022` (launch.json „static") öffnen. Kein Build, keine Abhängigkeiten. Doppelklick auf die
Datei (file://) funktioniert ebenfalls.

## Dateien

| Datei | Aufgabe |
|---|---|
| `../../mockup-kitchen.html` | Markup + CSS (Topbar, Modell-Panel, Seitenleiste, Zeichenfläche, Inspector mit Element / Seite / Rahmen / Design, Dialoge) |
| `catalog.js` | Visual-Katalog: 47 Typen (ChartKitchen, native PBI, Custom Visuals Gantt/P&L), Datenrollen, Engines, Mapping auf pbir- und Custom-Visual-Buckets, fünf Demo-Modelle, Seitenvorlagen mit Feldbindungen |
| `sketches.js` | SVG-Skizzen je Typ, `MK_SKETCH(kind, w, h, {scenario, seed, variance, dense, label, scale, polarity, lang, unit, palette, ink, dark, paper})`, Farben je Aufruf aus `theme(o)` |
| `app.js` | Zustand v2 (Seiten, Design, Chrome), Container-Split-Layout → Canvas-Pixel, Skalierung (`ui = canvas.w / 1280`), Drag-and-drop, TMDL-Parser (BOM-fest), Inspector, Undo |
| `export.js` | `mockup-spec.json` (specVersion 2), `AGENT-BRIEF.md`, `WORKSHOP-DOKU.md`, `pbir-visuals.<Seite>.json`, Prompt; Speichern/Öffnen als `.mockup.json` |
| `sketches-test.html` | Testblatt: alle Skizzen in drei Größen und Skalierungen, meldet NaN/undefined |

## Datenmodell des Mockups (Kurzfassung)

```
state = {
  version:2, name, canvas:{w,h,preset}, spacing:{margin,gutter,pad} (HD-Basiswerte), defScenario,
  chrome:{ header:{on,h,logoPos:'left'|'right'|'none',title,sub,navAuto,nav[]}, nav:{on,w},
           filter:{on,side:'right'|'left'|'top'|'burger',w,topH,collapsible,fields[]}, footer:{on,h,text} },
  design:{ radius, tile:'border'|'shadow'|'flat', pageBg:'light'|'soft'|'white', header:'light'|'dark'|'accent', accent },
  pages:[{ id, name, notes, layout }], cur,
  layout: { type:'split', dir:'row'|'col', children:[{size, node}] } | { type:'leaf', visual|null },
  visual:  { kind, engine:'ck'|'native'|'deneb', title, sub, scenario, roles:{ roleKey:[fieldRef] }, notes, link:pageId },
  fieldRef:{ table, name, kind:'measure'|'column', type, isNew },
  model:  { tables:[{name, columns[], measures[]}], source }, newFields:[{name, table, kind, desc, open}]
}
```

Rechtecke entstehen aus dem Baum: Zonen (Kopfband, Nav, Filter, Fußleiste) schneiden den Inhaltsbereich aus der Canvas,
`layoutRects()` verteilt ihn rekursiv nach Gewichten mit `gutter` dazwischen. Alle Chrome-Höhen, Abstände und
Schriften werden mit `ui` skaliert, damit Full HD und Ultra HD lesbar bleiben. Die Kachel-Rechtecke sind die späteren
`x/y/width/height` der PBIR-Visuals.

## Export → Power BI

1. „Export für Claude Code" → Dateien in den PBIP-Projektordner legen (Spec, Brief, Workshop-Doku, je Seite eine
   pbir-visuals-Datei).
2. In Claude Code den Skill `mockup-to-powerbi` (`.claude/skills/mockup-to-powerbi/`) aufrufen; er baut Seiten,
   Chrome-Zonen, native Visuals, Navigation/Drill und Bookmarks, ChartKitchen-Slots über die Referenz-Instanz, und
   erzeugt aus der Spec die Workshop-Doku als Markdown und PowerPoint.

Rollen-Vokabular (Spec): `category, subcategory, series, ac, ref, fc, values, rows, columns, x, y, size,
indicator, goal, start, end, field, text`. Mapping auf pbir-Buckets steht je Typ in `catalog.js` (`native.map`).

## Erweitern

- Neuer Typ: Eintrag in `catalog.js` (`K(id, label, group, {...})`) plus Skizze in `sketches.js` unter demselben Schlüssel.
- Neue Vorlage: `TEMPLATES` in `catalog.js` (`col([[gewicht, node], ...])`, `row(...)`, `leaf(kind, titel, {rolle:['Tabelle.Feld']}, {scenario, sub, notes})`).
  Feldreferenzen werden gegen das geladene Modell aufgelöst; ohne Modell lädt das Tool das Demo-Modell.
- Änderungen am Spec-Format: `export.js` und `references/spec-format.md` im Skill synchron halten.

## Backlog

- Dark Mode (Schalter ist angelegt, Skizzen und Zonen brauchen eine dunkle Palette).
- Echte ChartKitchen-Renderings statt Skizzen.
- Mehrere Berichte / Mockup-Bibliothek.
- Teilen per Link (Zustand komprimiert in der URL, ohne Server).
