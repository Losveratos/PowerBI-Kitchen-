# MockupKitchen · Bauplan (v0.3)

Positionierung (aus dem Review): kein Report-Generator, sondern ein **Anforderungswerkzeug mit deterministischem
Ausgang**. Der Workshop legt Struktur, Felder und Entscheidungen fest; der Bau ist eine Ableitung.

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
| `catalog.js` | Visual-Katalog: 46 Typen (ChartKitchen-IBCS + native PBI), Datenrollen, Engines, Mapping auf pbir-Buckets, Demo-Modell, Seitenvorlagen mit Feldbindungen |
| `sketches.js` | SVG-Skizzen je Typ, `MK_SKETCH(kind, w, h, {scenario, seed, variance, dense, label, scale})`, IBCS-Farben hart kodiert |
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
