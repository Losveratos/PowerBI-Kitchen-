# MockupKitchen · Bauplan

Mockup-Tool für Power-BI-Berichtsseiten. Einstieg: `mockup-kitchen.html` im Repo-Root, lokal über
`python -m http.server 8022` (launch.json „static") öffnen. Kein Build, keine Abhängigkeiten.

## Dateien

| Datei | Aufgabe |
|---|---|
| `../../mockup-kitchen.html` | Markup + CSS (Topbar, Modell-Panel, Zeichenfläche, Inspector, Dialoge) |
| `catalog.js` | Visual-Katalog: 46 Typen (ChartKitchen-IBCS + native PBI), Datenrollen, Engines, Mapping auf pbir-Buckets, Seitenvorlagen |
| `sketches.js` | SVG-Skizzen je Typ, `MK_SKETCH(kind, w, h, {scenario, seed, variance, dense})`, IBCS-Farben hart kodiert |
| `app.js` | Zustand (localStorage), Container-Split-Layout → Canvas-Pixel, Drag-and-drop, TMDL-Parser, Inspector, Undo |
| `export.js` | `mockup-spec.json`, `AGENT-BRIEF.md`, `pbir-visuals.json`, Prompt; Speichern/Öffnen als `.mockup.json` |
| `sketches-test.html` | Testblatt: alle Skizzen in drei Größen, meldet NaN/undefined |

## Datenmodell des Mockups (Kurzfassung)

```
state = {
  canvas:{w,h,preset}, spacing:{margin,gutter,pad}, defScenario,
  chrome:{ header:{on,h,logo,title,sub,nav[]}, nav:{on,w}, filter:{on,side,w,collapsible,fields[]}, footer:{on,h,text} },
  layout: { type:'split', dir:'row'|'col', children:[{size, node}] } | { type:'leaf', visual|null },
  visual:  { kind, engine:'ck'|'native'|'deneb', title, sub, scenario, roles:{ roleKey:[fieldRef] }, notes },
  fieldRef:{ table, name, kind:'measure'|'column', type, isNew },
  model:  { tables:[{name, columns[], measures[]}], source }, newFields:[...]
}
```

Rechtecke entstehen aus dem Baum: Zonen (Kopfband, Nav, Filter, Fußleiste) schneiden den Inhaltsbereich aus der Canvas,
`layoutRects()` verteilt ihn rekursiv nach Gewichten mit `gutter` dazwischen. Die Kachel-Rechtecke sind die
späteren `x/y/width/height` der PBIR-Visuals.

## Export → Power BI

1. „Export für Claude Code" → drei Dateien in den PBIP-Projektordner legen.
2. In Claude Code den Skill `mockup-to-powerbi` (`.claude/skills/mockup-to-powerbi/`) aufrufen; er liest die Spec,
   legt native Visuals per `pbir add visual --from-json` an, ChartKitchen-Slots über die Referenz-Instanz
   (`chartkitchen-report`) und Chrome-Zonen als Shapes/Textfelder.

Rollen-Vokabular (Spec): `category, subcategory, series, ac, ref, fc, values, rows, columns, x, y, size,
indicator, goal, start, end, field, text`. Mapping auf pbir-Buckets steht je Typ in `catalog.js` (`native.map`).

## Erweitern

- Neuer Typ: Eintrag in `catalog.js` (`K(id, label, group, {...})`) plus Skizze in `sketches.js` unter demselben Schlüssel.
- Neue Vorlage: `TEMPLATES` in `catalog.js` (`col([[gewicht, node], ...])`, `row(...)`, `leaf(kind, titel)`).
- Änderungen am Spec-Format: `export.js` und `references/spec-format.md` im Skill synchron halten.
