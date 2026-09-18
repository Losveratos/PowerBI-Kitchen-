# `mockup-spec.json` — Format

Abgeleitet aus `assets/mockup/export.js` (`buildSpec`, `bucketsFor`, `buildPbir`,
`buildDocs`) und `assets/mockup/catalog.js` (Typen, Rollen, Engines, native
Mappings) des Tools **MockupKitchen byDatenWG**.

Beispiele: [`example/mockup-spec.v3.json`](example/mockup-spec.v3.json) (aktuell,
zwei Seiten, Drill-through, Burger-Filter, Analyse-Block, Steckbriefe) mit den
zugehörigen Tool-Ausgaben [`example/AGENT-BRIEF.v3.md`](example/AGENT-BRIEF.v3.md)
und [`example/WORKSHOP-DOKU.v3.md`](example/WORKSHOP-DOKU.v3.md), dazu
[`example/mockup-spec.v2.json`](example/mockup-spec.v2.json) und
[`example/mockup-spec.json`](example/mockup-spec.json) (alte einseitige Fassung).
Geprüft wird gegen [`mockup-spec.schema.json`](mockup-spec.schema.json).

Alle Koordinaten sind absolute Canvas-Pixel, `x`/`y` = linke obere Ecke, und
**bereits mit `canvas.uiScale` multipliziert**. Nichts nachrechnen.

## Versionen

`meta.specVersion` sagt, welche Form vorliegt:

| | specVersion 1 (Tool 0.1) | specVersion 2 (Tool 0.2) | specVersion 3 (Tool 0.3, aktuell) |
|---|---|---|---|
| Seiten | eine, `page: {name, notes}` | viele, `pages[]` | wie v2, zusätzlich `pages[].question` |
| Visuals | `visuals[]` oben | `pages[].visuals[]` | wie v2 |
| Visual-IDs | `v05_Titel` | `p1_v05_Titel` (Position + Titel) | **`mk_<stableId>`, stabil** — unabhängig von Position und Titel |
| Gestaltung | keine | `design` | wie v2 |
| Skalierung | keine | `canvas.uiScale`, `design.fontScale` | wie v2 |
| Verknüpfungen | keine | `links[]`, `visuals[].link` | zusätzlich `links[].drillField` |
| Filter | `side: left\|right` | `mode: right\|left\|top\|burger` | zusätzlich `slicers[].default` |
| Berichtskopf | – | – | `report {audience, purpose, decision, …}` |
| Analyse je Kachel | – | – | `visuals[].analysis` (Polarität, Δ-Basis, Sortierung, Top-N, Einheiten …) |
| Workshop-Status | – | – | `visuals[].workshop {priority, status, openQuestion}` |
| Text-Kacheln | nur Titel | nur Titel | `visuals[].content` (der echte Text) |
| Kennzahlen | `model.usedFields` | `model.usedFields` | `fields[]` mit Steckbrief (Alias, Owner, Quelle, Ziel, bestätigt) |
| Befunde | `warnings[]` (Strings) | `warnings[]` | zusätzlich `issues[]` mit `level`/`code`/`page`/`visual` |
| Provenienz | – | – | `meta.specHash` (FNV-1a über den Bau-Kern), `meta.lang` |
| pbir-Datei | eine `pbir-visuals.json` | eine je Seite | eine je Seite, **ohne** Visuals mit leerer Pflichtrolle |
| Seitenbilder | – | – | `page-<Index>-<Slug>.png` bei „Alle Dateien" |

`mockup_to_pbir.py` und `mockup_to_docs.py` lesen **alle drei** Versionen und
heben v1/v2 intern auf die v3-Form (`scripts/mockup_spec.py → upgrade()`):
Analyse-Block mit Vorgaben, `workshop` auf „offen", `content` leer, `fields` aus
`model.usedFields`, `issues` aus den vorhandenen `warnings`, `drillField` aus dem
Kategorie-Feld der Quellkachel, `specHash` nachgerechnet. v1 wird zusätzlich auf
genau eine Seite normalisiert (Seitenname aus `page.name`, per `--page-name`
überschreibbar, `design` auf Vorgaben mit Kopfband-Stil `dark`). Die
**Visualnamen bleiben, wie die jeweilige Version sie vergibt** — sonst würde ein
zweiter Lauf an einem alten Bericht Dubletten anlegen.

Eine **höhere** Hauptversion bricht ab (`Spec-Version 4 wird von diesem Skill
nicht unterstützt`). Dann ist MockupKitchen neuer als der Skill; raten wäre falsch.

### Tool 0.4 (specVersion bleibt 3)

MockupKitchen 0.4 erweitert die v3-Form abwärtskompatibel — ältere Specs laufen
unverändert weiter:

| Neu | Wo |
|---|---|
| Engine `custom` und `visuals[].customVisual` | Kacheln, die ein **Custom Visual** aus dem Repository sind (Gantt, GuV) — siehe [Custom Visuals](#custom-visuals) |
| Rolle `rowType` | Rollen-Vokabular (Spalte: Position / Summe / Formel) |
| `design.variancePalette`, `design.varianceColors` | Abweichungsfarben (gut / schlecht) |
| `design.colors` | Farbsatz: Seite, Kachel, Ink, Kopfband-Fläche, Kopfband-Text |
| `design.headerStyle: "custom"` | frei gewählte Kopfband-Farben statt light/dark/accent |

Fehlen die Schlüssel, setzt `mockup_spec.normalise_design()` genau die Werte,
die der Skill vorher fest verdrahtet hatte (Teal-Palette, weiße Kacheln,
Ink `#0F1E2E`, Kopfbandfarben aus `headerStyle`). Die Ausgabe eines alten
Mockups ändert sich dadurch nicht.

## Oberste Ebene (specVersion 3)

| Schlüssel | Inhalt |
|---|---|
| `meta` | `tool`, `version`, `specVersion`, `specHash`, `name` (Mockup-Name), `lang` (`de`/`en`), `exportedAt` (ISO), `skill: "mockup-to-powerbi"` |
| `report` | Berichtskopf, siehe unten |
| `fields` | Kennzahlen-Steckbriefe (identisch zu `model.usedFields`), siehe unten |
| `issues` | strukturierte Befunde, siehe unten |
| `canvas` | `width`, `height`, `preset` (`1280x720` · `1920x1080` · `3840x2160` · `custom`), `uiScale` (1 · 1.5 · 3) |
| `spacing` | `margin`, `gutter`, `tilePadding` — schon skaliert und in die Rechtecke eingerechnet; `base` hält die HD-Ausgangswerte |
| `design` | Gestaltungsentscheidungen, siehe unten |
| `zones` | Chrome + Inhaltsbereich, auf **allen** Seiten gleich, siehe unten |
| `pages` | die Seiten, siehe unten |
| `links` | Seitenverknüpfungen, siehe unten |
| `model` | `source` (Ordnername des Semantikmodells), `tables` (Namen), `usedFields` (alle gebundenen Felder, dedupliziert) |
| `newFields` | im Mockup neu erfundene Felder: `table`, `name`, `kind`, `ref`, `description`, **`unit`, `target`, `owner`, `source`**, `openQuestion`, `used` |
| `warnings` | dieselben Befunde wie `issues` (ohne `info`) als fertige Sätze — bleibt für ältere Leser erhalten |

## `report` (Berichtskopf, ab v3)

Der Kopf des Workshops: wofür der Bericht da ist. Gehört in Plan, Doku und
Abschlussbericht, nicht in den PBIR.

| Schlüssel | Bedeutung |
|---|---|
| `name` | Berichtsname (= `meta.name`) |
| `audience` | Zielgruppe (z. B. „GF", „Vertriebsleitung") |
| `purpose` | Ziel des Berichts in einem Satz |
| `decision` | Welche Entscheidung damit getroffen wird — die härteste Frage im Workshop |
| `participants` | Wer dabei war |
| `version` | Stand des Mockups (`0.1`, `0.2` …) |
| `dataDate` | Datenstand / Aktualisierungsrhythmus |

Fehlen `audience` oder `decision`, meldet das Tool das als `issues`-Eintrag
(`REPORT_NO_AUDIENCE`, `REPORT_NO_DECISION`) — Hinweis, kein Fehler.

## `fields[]` (Kennzahlen-Steckbrief, ab v3)

Alle gebundenen Felder (Kacheln **und** Slicer), dedupliziert; inhaltsgleich zu
`model.usedFields`. Über die Herkunft hinaus steht hier, was der Fachbereich
dazu gesagt hat:

| Schlüssel | Bedeutung |
|---|---|
| `table`, `name`, `kind`, `ref`, `isNew` | wie in den Rollen |
| `description` | Definition laut Modell (oder aus dem Workshop, wenn neu) |
| `formatString`, `dataType` | aus dem Modell, sofern angebunden |
| `alias` | wie der Fachbereich das Feld nennt |
| `renameInModel` | **Wunsch**, das Feld im Modell umzubenennen — erst nach Freigabe, danach `pbir fields replace` + `pbir validate --fields` |
| `confirmed` | Definition im Workshop bestätigt (☑/☐) |
| `owner`, `source`, `target`, `unit`, `note` | fachlicher Owner, Quelle, Zielwert, Einheit, freie Notiz |

`checklist.md` und die Workshop-Doku zeigen die Tabelle vollständig. Nicht
bestätigte Definitionen sind der häufigste Grund für „die Zahl stimmt nicht".

## `issues[]` (ab v3)

`{level, code, text, page, visual}` — `level` ist `error`, `warn` oder `info`.

| Code | Bedeutung |
|---|---|
| `ROLE_EMPTY` | Pflichtrolle leer (bei `engine: native` ein `error`, sonst `warn`) |
| `ANTI_PATTERN` | Typ ist nicht IBCS-konform (Torte, 3-D …) |
| `CK_NO_MODE` | ChartKitchen kennt für diesen Typ keinen Modus |
| `NO_NATIVE` | kein natives Power-BI-Visual für diesen Typ |
| `TEXT_EMPTY` | Text-/Button-Kachel ohne `content` — käme leer im Bericht an |
| `DELTA_NO_REF` | Titel verspricht eine Abweichung, es ist aber keine Referenz gebunden |
| `EMPTY_TILE` | leere Kachel im Layout |
| `PAGE_NO_QUESTION` | Seite ohne Fragestellung |
| `NAV_OVERFLOW` | zu viele Nav-Buttons im Kopfband (ab ~6 Seiten) |
| `RENAME_REQUEST` | Umbenennungswunsch aus dem Fachbereich |
| `NEW_FIELD_UNUSED` | neues Feld auf keiner Kachel gebunden |
| `REPORT_NO_AUDIENCE`, `REPORT_NO_DECISION` | Berichtskopf unvollständig |

`error` zuerst klären: Kacheln mit leerer Pflichtrolle stehen **nicht** in
`pbir-visuals.json`, sonst würde `--from-json` die ganze Datei ablehnen.

## `design`

Das sind die Gestaltungsentscheidungen aus dem Workshop. Sie gehören in die
**Container-Formatierung** der Visuals und in den Seitenhintergrund, nicht in
ein Theme (Theme macht der Skill `powerbi-design-framework`).

| Schlüssel | Werte | Umsetzung mit `pbir` |
|---|---|---|
| `cornerRadius` | px, schon skaliert | `border.radius` je Kachel; bei Chrome-Overlay-Shapes `shape.tileShape=rectangleRounded` + `shape.rectangleRoundedCurve` |
| `tileStyle` | `border` · `shadow` · `flat` | `border.show/color/width` bzw. `dropShadow.show/preset/color/transparency`, jeweils das andere aus |
| `tileBackground` | Hex | `background.show=true`, `background.color` |
| `pageBackground` | Hex | `pbir pages background "<Seite>.Page" --color <Hex> --transparency 0` |
| `headerStyle` | `light` · `dark` · `accent` | Füllung der Kopfband-Shape: weiß + Trennlinie unten · Ink · Akzentfarbe; Textfarbe entsprechend |
| `accent` | Hex | aktiver Nav-Button, Burger-Button, Akzentlinie |
| `fontScale` | = `uiScale` | alle Schriftgrößen multiplizieren (Visual-Titel ≈ 12 · `fontScale` pt, Kopfband-Titel ≈ 16 ·, Fußleiste ≈ 9 ·); `pbir` akzeptiert 6–45 pt |
| `headerStyle: "custom"` | ab 0.4 | Kopfbandfarben kommen aus `colors.headerBackground` / `colors.headerInk`; Trennlinie nur, wenn die Fläche hell ist |
| `variancePalette` | `teal` · `ibcs` | wählt die Abweichungsfarben: `teal` = `#1E8F9E`/`#D64541`, `ibcs` = `#3A9A5B`/`#C8412F` |
| `varianceColors` | `{good, bad}` | die konkreten Farben (das Tool schreibt sie passend zur Palette mit); gehen ins Theme-Fragment als `good` / `bad` |
| `colors` | `{pageBackground, tileBackground, ink, headerBackground, headerInk}` | vollständiger Farbsatz. `ink` ist die Vordergrundfarbe (Theme `foreground`, Titel, Fußleiste), die Kopfbandfarben ersetzen die Herleitung aus `headerStyle` |
| `darkMode` | bool | `true`, wenn die Kachelfarbe dunkel ist; steht in `checklist.md` und im Theme-Kommentar. Farben kommen trotzdem aus `colors` — es wird nichts umgerechnet |

> Der Enum-Wert für abgerundete Shapes heißt `rectangleRounded`
> (nicht `roundedRectangle`) — `pbir set` lehnt den falschen Namen ab und
> `set -euo pipefail` bricht dann das ganze Chrome-Skript ab.

## `zones`

Alle Zonen haben `x`, `y`, `w`, `h`. Vorhanden ist nur, was der Mensch
eingeschaltet hat — `content` immer. Die Zonen gelten für **jede** Seite.

| Zone | Zusätzliche Felder |
|---|---|
| `nav` | `pages` (Namen aller Seiten — ein Button je Seite in der linken Leiste) |
| `header` | `style` (= `design.headerStyle`), `logoPos` (`left`/`right`/`none`), `title`, `subtitle`, `nav` (Seitennamen für die Buttons), `navAuto` (Nav folgt automatisch den Seiten), `burger` (Burger-Button fürs Filter-Overlay) |
| `filter` | `mode`, `side`, `collapsible`, `slicers[]`, bei Overlay zusätzlich `overlay: true`, `note`, `bookmarks[]` |
| `footer` | `text` |
| `content` | – (hier und nur hier liegen die Visuals) |

Geometrie-Logik des Tools (`app.js` → `zones()`): Nav-Leiste nimmt links Platz
weg, danach Kopfband und Fußleiste oben/unten, dann das Filter-Panel seitlich
oder oben; der Rest minus `margin` ist `content`.

### Filter-Modi

| `mode` | Zone | Slicer-Platzierung (`k` = `uiScale`) | Besonderheit |
|---|---|---|---|
| `right` | rechte Spalte zwischen Kopf und Fuß | gestapelt: `x+8k`, `y+40k+i·64k`, `w-16k`, `56k` | Inhalt wird schmaler |
| `left` | linke Spalte | wie `right` | Inhalt wird schmaler |
| `top` | Leiste unter dem Kopfband, volle Breite | nebeneinander: `x+8k+i·168k`, `y+8k`, `160k`, `h-16k` | Inhalt wird niedriger |
| `burger` | **keine** eigene Zone im Layout; Panel liegt rechts **über** dem Inhalt | wie `right` | `overlay: true`, Burger-Button im Kopfband, zwei Lesezeichen |

`bookmarks` steht bei `mode: "burger"` **und** bei `collapsible: true`:
`[{name: "Filter öffnen", showsPanel: true}, {name: "Filter schließen", showsPanel: false}]`.
Rezept dazu in [`chrome-build.md`](chrome-build.md); die fertigen Befehle
schreibt `mockup_to_pbir.py` nach `mockup-out/navigation.md`.

## `pages[]`

| Schlüssel | Bedeutung |
|---|---|
| `id` | interne Tool-ID, Ziel von `links[].toPageId` |
| `index` | 1-basiert; steckt im Slicer-Namen und im PNG-Dateinamen |
| `name` | Seitenname in Power BI (`pbir add page -n`) — muss eindeutig sein |
| `question` | Fragestellung / Kernbotschaft der Seite (ab v3) |
| `notes` | Zweck der Seite, Freitext aus dem Workshop |
| `contentRect` | Inhaltsbereich dieser Seite (identisch zu `zones.content`, solange das Tool die Zonen global hält) |
| `visuals` | Kachel-Slots, siehe unten |
| `layoutTree` | Container-Baum (`split`/`children`/`leaf`) — nur zur Orientierung, maßgeblich sind die Rechtecke |

## `links[]`

| Schlüssel | Bedeutung |
|---|---|
| `fromVisual` | ID der Quellkachel |
| `fromPage` / `toPage` | Seitennamen |
| `toPageId` | `pages[].id` des Ziels |
| `kind` | `navigation` (Quelle ist eine Button-Kachel → `pbir visuals action --type PageNavigation`) oder `drillthrough` (jede andere Kachel → Zielseite bekommt ein Drill-through-Feld) |
| `drillField` | ab v3: das Drill-Feld als `Tabelle.Feld` (bei `navigation` `null`) |

Beim Drill-through ist das Drill-Feld das **Kategorie-Feld der Quellkachel** —
in dieser Reihenfolge: `category`, `rows`, `subcategory`, `series`. In v3 steht
es fertig in `drillField`; bei v1/v2 leitet der Konverter es genauso ab. Daraus
wird `pbir pages drillthrough "<Ziel>.Page" --table <Tabelle> --field <Feld>`.

## `visuals[]` (je Seite)

| Schlüssel | Bedeutung |
|---|---|
| `id` | eindeutiger Name — wird 1:1 der `name` des PBIR-Visuals. Ab v3 `mk_<stableId>` und **stabil**: verschieben, umbenennen oder Typwechsel ändern die ID nicht. Deshalb ist ein zweiter Lauf ein Delta, kein Neubau |
| `stableId` | die rohe Tool-ID ohne Präfix (ab v3) |
| `slug` | ASCII-Kurzform des Titels (ab v3) |
| `page` | Seitenname (redundant, praktisch beim Filtern) |
| `kind` | Katalog-Typ (`kombi`, `varint`, `bars`, `kpi`, …) |
| `label` | Anzeigename des Typs |
| `engine` | `ck` · `native` · `deneb` |
| `chartKitchenType` | ChartKitchen-Typ-ID (nur bei `engine: "ck"`, sonst `null`) |
| `chartKitchenMode` | der `chart.orientation`-Wert aus dem Katalog (ab v3) — **diesen nehmen**, die Tabelle weiter unten ist nur der Ersatz für v1/v2 |
| `content` | Text einer Text- oder Button-Kachel (ab v3). Wird als `shape`/`actionButton` mit `text.text` gebaut, **nicht** als Textbox |
| `analysis` | Analyse-Entscheidungen, siehe unten (ab v3) |
| `workshop` | `{priority: must\|should\|could\|null, status: open\|agreed\|approved, openQuestion: bool}` (ab v3) — landet als Annotation am Visual und in der Doku |
| `native` | `{ type, buckets }` — natives Power-BI-Visual und die fertig gemappten pbir-Datenrollen. Wird **auch bei `engine: "ck"`** befüllt, sofern der Typ ein natives Gegenstück hat → brauchbar als Ersatzvisual |
| `customVisual` | `{ name, guid, buckets }` — nur bei `engine: "custom"`, sonst `null`. `buckets` ist genauso aufgebaut wie `native.buckets`, die Schlüssel sind aber die Datenrollen des Custom Visuals aus seiner `capabilities.json`. Siehe [Custom Visuals](#custom-visuals) |
| `title`, `subtitle` | Visual-Titel und Untertitel/Einheit |
| `scenario` | z. B. `AC/PL`, `AC/PY`, `AC/PL/FC` — nur bei Typen mit Referenz-Rolle, sonst `null` |
| `rect` | `{x, y, w, h}` — exakt übernehmen |
| `roles` | Mockup-Rolle → Liste von Feldern (`table`, `name`, `kind`, `ref`, `isNew`) |
| `notes` | Freitext des Menschen (→ Annotation im Bericht) |
| `link` | `{pageId, pageName}` oder `null` — Ziel des Sprungs |
| `warnings` | z. B. „Pflichtrolle … ist leer", „Nicht IBCS-konform" |

`ref` ist immer `Tabelle.Feld` — in `te` entspricht das `Tabelle/Feld`.

`scenario` kennt ab v3 auch `AC/PL/PY`, `AC/BU` und `PL/FC`.

## `visuals[].analysis` (ab v3)

Was der Mensch über die **Aussage** der Kachel entschieden hat. `…Auto: true`
heißt: aus Namen oder Szenario abgeleitet — ein Vorschlag, keine Entscheidung.

| Schlüssel | Werte | Umsetzung |
|---|---|---|
| `polarity` | `higher` · `lower` | ChartKitchen `chart.invert = true` bei `lower`; nativ nur als To-do (Power BI färbt nicht von selbst um) |
| `polarityAuto` | bool | aus dem Kennzahlnamen abgeleitet (Kosten, Ausschuss, Retouren …) |
| `deltaBasis` | `PL` · `PY` · `BU` · `FC` · `null` | bestimmt, welche ChartKitchen-Rolle die Referenz bekommt (`plan` / `previousYear` / `forecast`) |
| `deltaBasisAuto` | bool | aus `scenario` abgeleitet |
| `deltaKind` | `["abs"]` · `["rel"]` · beides | welche Abweichungen gezeigt werden |
| `unit` | Freitext (`T€`) | wird Untertitel, wenn die Kachel keinen hat |
| `displayUnits` | `none` · `K` · `M` · `null` (auto) | `pbir visuals labels --labelDisplayUnits None/Thousands/Millions`, im Batch `labels.labelDisplayUnits` = `1` / `1000` / `1000000` |
| `decimals` | 0–6 · `null` | `--labelPrecision` bzw. `labels.labelPrecision` |
| `sort` | `{by: value\|delta\|category, dir: asc\|desc}` | `pbir visuals sort --field <führende Kennzahl bzw. Kategorie> --direction Ascending/Descending`; `delta` geht nicht (das Modell hat keine Delta-Spalte) → To-do |
| `topN` | 1–100 · `null` | `pbir add filter <Kategorie-Tabelle> <Feld> -v "<Visual>" --type TopN --n N --by-table/--by-field <führende Kennzahl>` |
| `timeGrain` | `day` … `year` | nur als To-do: das Kategorie-Feld muss auf dieser Ebene gebunden sein |
| `cumulative` | bool | nur als To-do: braucht eine YTD-Kennzahl im Modell |
| `scaleGroup` | Freitext | nur als To-do: gleiche Wertachse auf allen Kacheln der Gruppe (`pbir visuals axis … value --min --max`) |
| `message` | Freitext | Kernaussage für die Titelzeile — To-do, weil sie den Titel aus dem Mockup überschreiben würde |

Visualtypen ohne Datenbeschriftung (`tableEx`, `pivotTable`,
`decompositionTreeVisual`, Slicer, Shapes) bekommen keine Anzeigeeinheiten —
dort wird daraus ein To-do. Alles, was nicht gesetzt werden konnte, steht mit
Code in `mockup-out/analysis-todos.md`.

## Rollen-Vokabular

| Rolle | Label im Tool | Art | max |
|---|---|---|---|
| `category` | Kategorie / Achse bzw. Zeit / Periode bzw. Geo-Feld | Spalte | 1 |
| `subcategory` | Unterkategorie | Spalte | 1 |
| `series` | Reihe / Legende (bei Small Multiples: Facette) | Spalte | 1 |
| `ac` | AC · Ist-Wert | Measure | 1 |
| `ref` | Referenz (PL / PY / BU) | Measure | 2 |
| `fc` | FC-Flag (1/0) | Spalte | 1 |
| `values` | Werte / Felder | Measure bzw. beliebig | 12–20 |
| `rows` | Zeilen | Spalte | 4 |
| `columns` | Spalten | Spalte | 3 |
| `x`, `y` | X-/Y-Wert (Streudiagramm) | Measure | 1 |
| `size` | Größe | Measure | 1 |
| `indicator` | Kennzahl (KPI/Karte/Tacho) | Measure | 1 |
| `goal` | Ziel / Referenz | Measure | 1 |
| `start`, `end` | Start / Ende (Gantt) | Spalte | 1 |
| `field` | Feld (Slicer) | Spalte | 1 |
| `text` | Text (statisch oder Measure) | beliebig | 1 |
| `rowType` | Zeilentyp (Position / Summe / Formel) — ab 0.4, für GuV und Wasserfall | Spalte | 1 |

## Engines

| `engine` | Bedeutung | Umsetzung |
|---|---|---|
| `native` | Standard-Power-BI-Visual | `pbir add visual "<Seite>.Page" --from-json <Seitenslug>/pbir-visuals.json` |
| `ck` | ChartKitchen byDatenWG (Custom Visual) | Referenz-Instanz replizieren; ohne Instanz Platzhalter |
| `deneb` | Deneb/Vega | Skill `deploy-to-powerbi`, `pbir visuals deneb` |
| `custom` | anderes Custom Visual aus dem Repository (ab 0.4) | fertige `visual.json` aus `<Seitenslug>/custom-visuals/` über einen Platzhalter kopieren — siehe unten |

`buildPbir` im Tool exportiert **nur** `engine == "native"` plus die Slicer. Das
Skript `mockup_to_pbir.py` macht es genauso; mit `--ck-fallback` nimmt es
zusätzlich das `native`-Gegenstück der ck-Slots auf (nützlich, solange keine
Referenz-Instanz existiert).

## Rollen → pbir-Datenrollen je nativem Typ

Aus `catalog.js` (`native.map`), gegengeprüft mit `pbir add visual --list`
(dort stehen die zulässigen Rollen je Typ; Pflichtrollen ohne Klammern,
optionale in Klammern).

| Kachel-Typ | natives Visual | Mapping |
|---|---|---|
| `columns`, `kombi`, `absvar`, `relvar`, `multiples` | `clusteredColumnChart` | category→`Category`, ac→`Y`, ref→`Y` (multiples zusätzlich series→`Rows`) |
| `colline`, `pareto` | `lineClusteredColumnComboChart` | category→`Category`, ac→`Y`, ref→`Y2` |
| `bars`, `barskombi`, `bullet`, `tornado`, `dotplot` | `clusteredBarChart` | category→`Category`, ac→`Y`, ref→`Y` |
| `stackcol` | `columnChart` | category→`Category`, series→`Series`, ac→`Y` |
| `stackbar` | `barChart` | category→`Category`, series→`Series`, ac→`Y` |
| `line`, `slope`, `fan`, `zchart` | `lineChart` | category→`Category`, ac→`Y`, ref→`Y` |
| `area` | `areaChart` | category→`Category`, ac→`Y`, series→`Series` |
| `waterfall`, `bridge` | `waterfallChart` | category→`Category`, ac→`Y` |
| `tree`, `decomp` | `decompositionTreeVisual` | ac→`Analyze`, category/subcategory→`ExplainBy` |
| `heatmap`, `matrix` | `pivotTable` | rows/category→`Rows`, columns/subcategory→`Columns`, values/ac→`Values` |
| `scatter` | `scatterChart` | category→`Category`, x→`X`, y→`Y`, size→`Size` |
| `kpi`, `card` | `card` | indicator→`Values` |
| `multirow` | `multiRowCard` | values→`Values` |
| `table`, `sparktable` | `tableEx` | rows/ac/ref→alle nach `Values` |
| `gauge` | `gauge` | indicator→`Y`, goal→`TargetValue` |
| `pie` | `pieChart` | category→`Category`, ac→`Y` |
| `treemap` | `treemap` | category→`Group`, ac→`Values` |
| `map` | `map` | category→`Category`, size→`Size` |
| `slicer` | `slicer` | field→`Values` |
| `text` / `image` / `button` | `textbox` / `image` / `actionButton` | keine Datenrollen |
| `marimekko`, `wfint`, `wfkombi`, `varint`, `boxplot`, `gantt` | – | kein natives Gegenstück (`native: null`) |

Im JSON stehen diese Mappings bereits fertig unter `visuals[].native.buckets`.
Mehrere Felder pro Bucket (z. B. AC und PL beide in `Y`) werden im
`--from-json`-Format zu einer Liste: `"Y": ["_Measures.AC", "_Measures.PL"]`.

## Rollen → ChartKitchen-Datenrollen

Zielnamen ausschließlich aus
[`chartkitchen-report/references/field-contract.md`](../../chartkitchen-report/references/field-contract.md).
Das Skript schlägt vor, die Referenz-Instanz entscheidet.

| Mockup-Rolle | ChartKitchen | Anmerkung |
|---|---|---|
| `category` | `category` | |
| `rows` | `category` | Tabelle |
| `series` | `series` | bei `kind: "multiples"` stattdessen `multiples` |
| `subcategory`, `columns` | `colgroup` | nur Tabelle, max. 2 Ebenen |
| `ac`, `indicator`, `values` | `actual` | |
| `ref` (1./2. Feld) | `plan` bzw. `previousYear` | Reihenfolge aus `scenario`: `PL`/`BU` → `plan`, `PY` → `previousYear`; überzählige Referenzen → `benchmark` |
| `goal` | `plan` | bei Monitoring-Zielwerten ggf. `benchmark` — nachfragen |
| `fc` | `fcFlag` | **Zahl 1/0**, nicht Boolean |
| `rowType` | `rowType` | Pflicht bei `orientation` `waterfall` und `pnl` (`sum`/`delta` je Zeile) |
| `x`, `y`, `size`, `start`, `end`, `field`, `text` | – | kein Gegenstück; diese Typen kann ChartKitchen nicht |

### Kachel-Typ → `chart.orientation`

> Ab specVersion 3 steht der Wert bereits in `visuals[].chartKitchenMode` — diese
> Tabelle ist die Rückfallebene für v1/v2 und zum Nachschlagen.

| Typen | `orientation` |
|---|---|
| `columns`, `kombi`, `colline`, `absvar`, `relvar`, `stackcol`, `multiples` | `columns` |
| `bars`, `barskombi`, `bullet`, `tornado`, `stackbar` | `bars` |
| `dotplot` | `dumbbell` |
| `pareto` | `pareto` |
| `line`, `fan`, `zchart` | `line` |
| `slope` | `slope` |
| `varint`, `wfint` | `intwaterfall` |
| `waterfall`, `wfkombi` | `waterfall` |
| `bridge` | `catbridge` |
| `kpi` | `cards` |
| `table`, `sparktable`, `heatmap` | `table` |
| `marimekko`, `tree`, `scatter`, `boxplot`, `gantt` | kein Modus → Deneb oder natives Visual |

Für GuV-Seiten gibt es in ChartKitchen zusätzlich `pnl` (Skill `pnl-report`).
Ab Tool 0.4 hat das Mockup dafür einen **eigenen Typ** `pnl` — der läuft aber
nicht über ChartKitchen, sondern über das Custom Visual `pnlByDatenWG`
(`engine: "custom"`, siehe unten).


## Custom Visuals

Kacheln mit `engine: "custom"` sind Custom Visuals aus diesem Repository. Sie
tragen den Block:

```json
"customVisual": {
  "name": "pnlByDatenWG",
  "guid": "pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358",
  "buckets": {
    "levels": [{ "ref": "DimAccount.L1", "kind": "column", "isNew": false }],
    "ac":     [{ "ref": "_Measures.AC",  "kind": "measure", "isNew": false }]
  }
}
```

| Kachel-Typ | `name` | GUID | Datenrollen (`buckets`) |
|---|---|---|---|
| `gantt` | `dataKitchenGantt` | `dataKitchenGanttD7C41F0A93E24B6BA1F3C5E8A20D9B44` | `task`, `start`, `end`, `phase`, `projekt`, `progress`, `status`, `owner`, `deps`, `planStart`, `planEnd`, `sort`, `statusDate` |
| `pnl` | `pnlByDatenWG` | `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358` | `account`, `accountName`, `levels`, `parent`, `sortOrder`, `rowType`, `formulaDef`, `signConvention`, `displayInvert`, `varianceInvert`, `period`, `comment`, `ac`, `py`, `pl`, `fc`, `fcFy`, `plFy` |

Vollständig stehen die Rollen in der `capabilities.json` des jeweiligen Visuals
(`dataKitchenGantt/capabilities.json`, `pnlByDatenWG/capabilities.json` im
Repo-Wurzelverzeichnis). Das Mockup bindet nur eine Auswahl; der Rest wird in
Desktop nachgezogen.

**Pflichtrollen** (ohne sie zeichnet das Visual nichts) prüft
`mockup_to_pbir.py` und meldet sie als Warnung in `checklist.md` und unter
`issues` in `plan.json`:

| Visual | Pflicht |
|---|---|
| `dataKitchenGantt` | `task` **und** `start` |
| `pnlByDatenWG` | `levels` **oder** `account`, dazu `ac` |

### Warum nicht in `pbir-visuals.json`

`pbir` kann Custom Visuals **nicht anlegen** (verifiziert, 0.9.32):

```
pbir add visual pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358 "<Seite>.Page"
  -> Unknown visual type 'pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358'
```

In einer `--from-json`-Datei reißt so ein Eintrag die **ganze Datei** mit
(„no visuals were created"). Deshalb stehen Custom Visuals nicht in
`pbir-visuals.json`, sondern als fertige PBIR-`visual.json` in
`mockup-out/<Seitenslug>/custom-visuals/<id>.visual.json`, dazu ein Index
`custom-visuals.json` und `custom-commands.sh`/`.ps1`.

Die erzeugte Datei hat genau die Form, die `pbir add visual` selbst schreibt
(Schema `…/visualContainer/2.9.0/schema.json`, `visualContainerObjects` als
Arrays, Zahlen als `"12D"`), mit zwei Custom-Teilen:

- `visual.visualType` = die **GUID**
- `visual.query.queryState` = je Bucket ein Eintrag mit `projections`; Spalten
  als `Column`, Measures als `Measure`, `queryRef` = `Tabelle.Feld`,
  `nativeQueryRef` = Feldname. Die erste Projektion einer Spaltenrolle bekommt
  `"active": true`.

Ablauf (steht fertig in `custom-commands.sh`):

1. `.pbiviz` in den Bericht importieren (Desktop) — sonst bleibt die Kachel leer:
   `dataKitchenGantt/dist/*.pbiviz`, `pnlByDatenWG/dist/*.pbiviz`; fehlt der
   Build, im Visual-Ordner `pbiviz package` laufen lassen.
2. Platzhalter anlegen: `pbir add visual shape "<Seite>.Page" -n "<id>" -x … -y …`
   — damit schreibt pbir Ordner, Visualname und Seiteneintrag korrekt.
3. Die erzeugte `visual.json` über die des Platzhalters kopieren. Den Ordner
   liefert `find "<Report>/definition/pages" -type d -name "<id>"`; `pbir ls
   "<Seite>.Page" --json` nennt zu jedem Visual ebenfalls seinen `path`.
4. `pbir validate "<Report>" --fields` — die Datei wird angenommen (verifiziert).

**Reihenfolge:** erst `chrome-batch.json`, dann kopieren. Die Kopie überschreibt
sonst die Formatierung — sie steckt bereits vollständig in der Datei
(Hintergrund, Rahmen/Schatten, Eckenradius, Titel, z-Order).

`pbir visuals bind` kann bei einem Custom Visual nur Rollen bedienen, die in der
`queryState` schon stehen („Role 'x' not valid … Available: …"). Die erzeugte
Datei enthält deshalb alle Rollen der Spec von Anfang an. Im **zweiten Lauf**
reicht Schritt 3 allein; `delta-batch.json` fasst Custom Visuals bewusst nicht an.

## `pbir-visuals.<Seitenslug>.json` (Tool-Ausgabe, eine Datei je Seite)

Liste im `--from-json`-Format von `pbir add visual`, **nur die nativen Visuals
und die Slicer dieser Seite**. Nur diese Schlüssel sind erlaubt, jeder weitere
bricht den kompletten Import ab:

```json
[
  { "visual_type": "card", "name": "p1_v02_Kosten", "title": "Kosten",
    "x": 345, "y": 72, "width": 312, "height": 119,
    "fields": { "Values": "_Measures.Kosten" } }
]
```

`title` setzt den **Container-Titel** (`visualContainerObjects.title.text`), nicht
den Inhalt einer Textbox. Slicer heißen je nach Quellversion:

| specVersion | Slicer-Name |
|---|---|
| 3 | `mk_slicer_<Feld>_p<Seitenindex>` |
| 2 | `p<Seitenindex>_slicer<i>_<Feld>` |
| 1 | `slicer<i>_<Feld>` |

Ab v3 lässt das Tool Visuals mit **leerer Pflichtrolle** weg — sonst würde
`--from-json` die ganze Datei ablehnen.

`mockup_to_pbir.py` erzeugt diese Dateien neu — als
`mockup-out/<Seitenslug>/pbir-visuals.json` — mit zwei bewussten Unterschieden:

- **Text- und Button-Kacheln** stehen dort **nicht** drin, sondern in
  `text-visuals.json` als `shape` bzw. `actionButton`. In der Tool-Datei landen
  sie als `textbox`, und eine Textbox bleibt über die CLI leer (siehe
  `chrome-build.md`).
- Mit `--ck-fallback` kommen zusätzlich die ChartKitchen-Kacheln als natives
  Ersatzvisual hinein, sofern die Spec eines kennt.

Wer die Tool-Originale nimmt, nimmt die passende Seitendatei — und baut die
Text-Kacheln von Hand nach.

## `AGENT-BRIEF.md` und `WORKSHOP-DOKU.md` (Tool-Ausgaben)

Beide sind die menschenlesbaren Fassungen derselben Daten — lesen, aber nicht als
zweite Wahrheit behandeln. Maßgeblich ist `mockup-spec.json`.

- **`AGENT-BRIEF.md`** (`buildBrief`): Berichtskopf, Canvas und Gestaltung,
  Zonen-Tabelle mit Maßen, je Kachel Typ/Engine/Position/stabile ID/Rollen/
  pbir-Buckets/Analyse/Workshop-Status, Navigation und Drill mit Drill-Feld,
  Kennzahlen-Steckbrief, neue Felder, Regeln für die Umsetzung, offene Punkte.
  Beispiel: [`example/AGENT-BRIEF.v3.md`](example/AGENT-BRIEF.v3.md).
- **`WORKSHOP-DOKU.md`** (`buildDocs`): das Protokoll — Kopftabelle
  (Teilnehmende, Zielgruppe, Ziel, Entscheidung, Datenstand, Seiten,
  Datenmodell), Gestaltungsentscheidungen, je Seite Fragestellung und
  Kachel-Tabelle (Felder, Analyse, Prio, Status), Navigation/Drill,
  Kennzahlen-Steckbrief, neue Felder, offene Punkte, Hinweise, nächste Schritte.
  Felder in eckigen Klammern (`[ausfüllen]`) füllt der Mensch. Beispiel:
  [`example/WORKSHOP-DOKU.v3.md`](example/WORKSHOP-DOKU.v3.md).

`mockup_to_docs.py` erzeugt die Workshop-Doku in derselben Struktur, falls die
Datei fehlt, auf Wunsch englisch (`--lang en`), und macht daraus eine PowerPoint
— Details im Skill-Schritt „Doku und PowerPoint".

## `page-<Index>-<Seitenslug>.png` (Tool-Ausgabe, ab v3)

Wählt der Mensch im Export „Alle Dateien", legt das Tool je Seite ein
Seitenbild daneben (Rendering des Mockups, Faktor 2). `mockup_to_docs.py`
bettet es in die Seitenfolie ein, wenn es im selben Ordner wie die Spec liegt;
sonst zeichnet es das Wireframe aus nativen Shapes.
