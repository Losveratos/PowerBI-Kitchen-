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

### Tool 0.4.1 (specVersion bleibt 3)

Wieder abwärtskompatibel. Fehlen die Schlüssel, ist die jeweilige Variante aus.

| Neu | Wo |
|---|---|
| `visuals[].analysis.smallMultiples` | Small Multiples je Kachel — siehe [Darstellungsvarianten](#darstellungsvarianten-tool-041) |
| `visuals[].analysis.fieldParam` | Kategorieachse aus einem **Feldparameter** — ebenda |
| Rolle `multiples` | Aufteilungsfeld der Small Multiples (Spalte, max. 1) |
| Kachel-Typen `ncolumn`, `nbar`, `nline`, `ndonut` | Gruppe „Native Klassiker": Säule, Balken, Linie, Donut ohne Szenario-Notation, Engine **nur** `native` |
| `zones.header.navOn` | bool, Vorgabe `true`. `false` = **keine** Seitennavigation im Kopfband |
| Issue-Codes `SM_NO_FIELD`, `FIELDPARAM_FEW` | siehe [`issues[]`](#issues-ab-v3) |

> **Hash-Stabilität:** `smallMultiples` und `fieldParam` zählen nur dann in
> `meta.specHash` mit, wenn sie **gesetzt** sind. Ein v1/v2-Mockup behält so
> denselben Hash wie vor 0.4.1 — sonst meldete der nächste Lauf an einem
> bereits gebauten Bericht fälschlich eine Änderung
> (`mockup_spec.HASH_SKIP_ANALYSIS_IF_NULL`, dieselbe Idee wie bei `design`).

### Tool 0.4.2 bis 0.4.4 (specVersion bleibt 3)

Wieder abwärtskompatibel: fehlt ein Schlüssel, baut der Skill genau wie vorher
(alle alten Goldens bleiben unverändert). Details im Abschnitt
[Tool 0.4.4](#tool-044-typografie-filterbereich-slicer-art-barrierefreiheit).

| Neu | Tool | Wo |
|---|---|---|
| `visuals[].interaction` | 0.4.2 | Drill-down, Cross-Filter, Drill-through je Kachel |
| `zones.header.navPosition`, `zones.footer.nav`, `zones.footer.navPosition` | 0.4.3 | Seitennavigation im Kopfband, in der Fußleiste oder aus |
| `design.typography`, `visuals[].typography` | 0.4.3 | Schriftgrößen (Titel, Untertitel, Diagramm) und Kachel-Faktor |
| `zones.filter.heading`, `zones.filter.text` | 0.4.4 | Überschrift (oder keine) und Hinweistext im Filterbereich |
| `fields[].expression`, `formatExpression`, `formatDynamic`, `displayFolder`, `formatDescription`, `formatSample`, `formatWish`, `formatWishString`, `daxComment` | 0.5.3 | Aus dem TMDL-Import: DAX-Formel, dynamischer Formatausdruck, Anzeigeordner, Format in Klartext mit Beispiel. Aus dem Workshop: Kommentar zu Berechnung/Beschreibung und gewünschte Darstellung (`formatWishString` ist ein Vorschlag, den der Agent nach Rückfrage per `te` als formatString setzt). Die DAX-Formel ist Information, kein Bauauftrag |
| `visuals[].samples`, `design.nativePalette` | 0.4.7 | Beispielwerte je Kachel (`categories`, `values`, `refValues`, nur Anschauung) und Farbschema der Skizzen für native Visuals (`neutral`/`pbi`/`kitchen`). Beides ist **kein** Bauauftrag: keine Daten in den Bericht schreiben, Datenfarben regelt das Theme |
| `zones.filter.slicers[].type` | 0.4.4 / 0.4.6 | Slicer-Art `dropdown` · `list` · `tile` · `between` · `date` · `search` · ab 0.4.6 `relative` · `button` |
| `design.sourceReport` | 0.6 | nur ohne Live-Helfer: Gestaltung stammt aus dem eingelesenen Bericht, kein Seitenhintergrund und kein Kachelstil für Seiten und Kacheln aus dem Bericht, siehe [`design.sourceReport`](#designsourcereport-gestaltung-aus-dem-bericht) |
| Issue-Codes `A11Y_*` | 0.4.4 | Befunde der Barrierefreiheits-Prüfung |

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
| `NEW_FIELD_NEW_TABLE` | neues Feld in einer Tabelle, die nicht in `model.tables` steht (`newFields[].newTable: true`). `info`, wenn im Tool ausdrücklich als neue Tabelle bestätigt, sonst `warn` (Tippfehler?). `model-todos.md` kommentiert das `te add` dafür aus |
| `FIELD_NOT_IN_MODEL` | gebundenes Feld (Kachel oder Slicer) fehlt im geladenen Modell und ist nicht als neu vorgemerkt, z. B. nach einem TMDL-Neuimport (`error`). Das Feld trägt `missing: true`, `isNew` bleibt `false`; eine native Kachel damit steht nicht in `pbir-visuals.json` (Checkliste: „Nicht gebaute Kacheln"), ein solcher Slicer ebenso nicht, die übrigen Slicer rücken ohne Lücke nach (Checkliste: „Nicht gebaute Slicer"). Als offene Entscheidung vorlegen: umbenennen, mappen oder neu anlegen |
| `SCENARIO_REF_MISMATCH` | Szenario (bzw. gesetzte Δ-Basis) und gebundene Referenz widersprechen sich, z. B. Szenario `AC/PY`, gebunden ist `_Measures.PL` (`warn`). Nicht still umdeuten, sondern nachfragen |
| `REPORT_NO_AUDIENCE`, `REPORT_NO_DECISION` | Berichtskopf unvollständig |
| `SM_NO_FIELD` | Small Multiples eingeschaltet, aber kein Aufteilungsfeld gebunden (`warn`, ab 0.4.1) — die Kachel wird trotzdem gebaut, nur ohne Aufteilung |
| `FIELDPARAM_FEW` | Feldparameter mit weniger als zwei Feldern (`info`, ab 0.4.1) — zum Umschalten braucht es mindestens zwei |
| `A11Y_*` | Barrierefreiheit (ab 0.4.4): `A11Y_CONTRAST_TEXT`, `A11Y_CONTRAST_HEADER`, `A11Y_CONTRAST_ACCENT`, `A11Y_PALETTE_COLOUR_ONLY`, `A11Y_FONT_MIN`, `A11Y_TILE_SMALL`, `A11Y_TITLE_MISSING`, `A11Y_DENSITY`, `A11Y_READING_ORDER`, `A11Y_NAV_OFF`, `A11Y_SLICER_LABEL` — eigener Block, siehe [Tool 0.4.4](#barrierefreiheit-issues-mit-a11y_) |

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
| `fontScale` | = `uiScale` | Faktor k für alle Schriftgrößen. Chrome: Kitchen-px × k × 0,75 pt (Kopfband-Titel 17 px, Untertitel 11, Fußleiste 10, Filter-Überschrift 11 — Tabelle in `chrome-build.md`); `pbir` akzeptiert 6–45 pt |
| `headerStyle: "custom"` | ab 0.4 | Kopfbandfarben kommen aus `colors.headerBackground` / `colors.headerInk`; Trennlinie nur, wenn die Fläche hell ist |
| `variancePalette` | `teal` · `ibcs` | wählt die Abweichungsfarben: `teal` = `#1E8F9E`/`#D64541`, `ibcs` = `#3A9A5B`/`#C8412F` |
| `varianceColors` | `{good, bad}` | die konkreten Farben (das Tool schreibt sie passend zur Palette mit); gehen ins Theme-Fragment als `good` / `bad` |
| `colors` | `{pageBackground, tileBackground, ink, headerBackground, headerInk}`, optional `panel`, `rule`, `tileBorder`, `muted`, `slicerBorder`, `slicerBackground`, `slicerInk`, `footerNavInk`, `footerBackground` | vollständiger Farbsatz. `ink` ist die Vordergrundfarbe (Theme `foreground`, Titel), die Kopfbandfarben ersetzen die Herleitung aus `headerStyle`. Die optionalen Chrome-Farben fehlen → Kitchen-Vorgaben (`#ECEBE5`, `#E3E1D8`, `#E1DFD6`, `#6B7280`, `#D9D6CC`, `#FFFFFF`, `#374151`, `#475569`, Seitenhintergrund) |
| `nativePalette` | `neutral` · `pbi` · `kitchen` | Datenfarben der nativen Klassiker: `dataColors` im Theme-Fragment und `dataPoint.field(…).fill` je Kennzahl; `pbi` = Power-BI-Standard, dann nichts |
| `typography` | ab 0.4.3: `{basis, scale, title, sub, chart}` | Schriftgrößen in px bei 1280 px Breite; wirksam `× scale × fontScale`, im Bericht `× 0,75` in pt. Siehe [Tool 0.4.4](#typografie-designtypography-visualstypography) |
| `darkMode` | bool | `true`, wenn die Kachelfarbe dunkel ist; steht in `checklist.md` und im Theme-Kommentar. Farben kommen trotzdem aus `colors` — es wird nichts umgerechnet |
| `sourceReport` | bool, optional (Konverter 0.6, nur ohne Live-Helfer) | `true`: Gestaltung aus dem Bericht übernommen. Seiten mit `pbir.page` bekommen keinen `pbir pages background`, Kacheln mit `pbir.visual` keine Fläche, keinen Rahmen und keinen Schatten. Details unten |

### `design.sourceReport`: Gestaltung aus dem Bericht

Befund B2 aus dem Demo-Test vom 02.10.2026: Ein fertig gestalteter Bericht mit 23
Seiten wurde eingelesen, eine Seite kam dazu. Der erste Deploy schrieb trotzdem den
Kitchen-Seitenhintergrund auf alle 23 Seiten und glich den Kachelstil jeder
eingelesenen Kachel ab. Das verletzt „das PBIP ist die Wahrheit" und macht jede
Seite zur geänderten Seite.

- **Wer setzt es:** ein Agent, der den Konverter **ohne Live-Helfer** auf eine Spec
  anwendet, die aus einem fertigen Bericht eingelesen wurde, solange die Gestaltung
  dort gelten soll. Ändert der Nutzer die Gestaltung bewusst, fällt der Schlüssel weg
  (oder wird `false`), und der Konverter schreibt die Gestaltung wie bisher überall.
- **Im Live-Betrieb nicht:** Das Kitchen setzt das Flag nicht, und der Live-Runner
  liest es nicht. Dort übernimmt das Kitchen beim Einlesen die Gestaltung des
  Berichts in `design` (Grundlinie `baseline-spec.json`), und der Runner schreibt
  Seitenhintergrund, Kachelstil und Theme auf eingelesene Seiten nur, wenn `design`
  von der Grundlinie bzw. dem letzten Deploy abweicht (`mockup-live/CONTRACT.md`,
  „Abgleich mit dem Bericht" und „Gestaltung aus dem Bericht: gewählte Regel").
- **Was der Konverter dann weglässt:** für Seiten mit `pbir.page` den Schritt
  `pbir pages background` (`chrome-commands.sh`, Schritt `background:<Seite>` in
  `plan.json`, `commands.md`; in `acceptance.json` steht `background: null`); für
  Kacheln mit `pbir.visual` die Container-Setzungen `background.*`, `border.*`,
  `dropShadow.*` in `chrome-batch.json` bzw. `chrome-commands.sh` und in den
  Containern von `chartkitchen-slots.json` und `custom-visuals/<id>.visual.json`.
  Titel, Untertitel und Bindungen bleiben wie bisher.
- **Was bleibt:** neue Seiten und neue Kacheln (ohne `pbir`) bekommen Hintergrund und
  Kachelstil aus `design`; das ist ja die Gestaltung des Berichts. Das Theme-Fragment
  bleibt, sein `$comment` sagt, dass die Gestaltung aus dem Bericht stammt.
- **`plan.json`:** `reportStyle: {sourceReport: true, pages: [...], visuals: [{page,
  visual}]}` nennt, was unberührt bleibt. Der Live-Runner wertet `reportStyle` nicht
  aus (er entscheidet über den Vergleich mit der Grundlinie).
- **Spec-Hash:** `sourceReport` zählt im Hash nur, wenn es gesetzt ist (wie in
  `export.js`). Die Herkunft `pages[].pbir` hält `upgrade()` jetzt in der gehobenen
  Spec fest; sie zählt nicht im Hash.

> Der Enum-Wert für abgerundete Shapes heißt `rectangleRounded`
> (nicht `roundedRectangle`) — `pbir set` lehnt den falschen Namen ab und
> `set -euo pipefail` bricht dann das ganze Chrome-Skript ab.

## `zones`

Alle Zonen haben `x`, `y`, `w`, `h`. Vorhanden ist nur, was der Mensch
eingeschaltet hat — `content` immer. Die Zonen gelten für **jede** Seite.

| Zone | Zusätzliche Felder |
|---|---|
| `nav` | `pages` (Namen aller Seiten — ein Button je Seite in der linken Leiste) |
| `header` | `style` (= `design.headerStyle`), `logoPos` (`left`/`right`/`none`), `title`, `subtitle`, `nav` (Seitennamen für die Buttons), **`navOn`** (ab 0.4.1, Vorgabe `true`), **`navPosition`** (ab 0.4.3: `header`/`footer`/`off`), `navAuto` (Nav folgt automatisch den Seiten), `burger` (Burger-Button fürs Filter-Overlay) |
| `filter` | `mode`, `side`, `collapsible`, `slicers[]` (ab 0.4.4 mit `type`), **`heading`** und **`text`** (ab 0.4.4), bei Overlay zusätzlich `overlay: true`, `note`, `bookmarks[]` |
| `footer` | `text`, **`nav`** und **`navPosition`** (ab 0.4.3) |
| `content` | – (hier und nur hier liegen die Visuals) |

Geometrie-Logik des Tools (`app.js` → `zones()`): Nav-Leiste nimmt links Platz
weg, danach Kopfband und Fußleiste oben/unten, dann das Filter-Panel seitlich
oder oben; der Rest minus `margin` ist `content`.

**`header.navOn: false`** (ab 0.4.1) heißt: das Kopfband bekommt **keine**
Seitennavigation. `nav` ist dann ohnehin leer, weil `buildSpec` die Liste
verwirft — der Skill wertet die Flagge trotzdem aus, damit eine von Hand
geschriebene Spec mit `navOn: false` **und** gefüllter `nav`-Liste nicht
heimlich doch Buttons bekommt. Es entstehen keine `chrome_nav_*`; der
Seitenwechsel läuft über die Registerkarten (oder über die linke Nav-Leiste
`zones.nav`, die `navOn` **nicht** betrifft — sie ist eine eigene Zone).
`chrome-commands.sh`, `checklist.md` und `navigation.md` sagen das ausdrücklich.

### Filter-Modi

| `mode` | Zone | Slicer-Platzierung (`k` = `uiScale`) | Besonderheit |
|---|---|---|---|
| `right` | rechte Spalte zwischen Kopf und Fuß | gestapelt: `x+8k`, `y+40k+i·64k`, `w-16k`, `56k` | Inhalt wird schmaler |
| `left` | linke Spalte | wie `right` | Inhalt wird schmaler |
| `top` | Leiste unter dem Kopfband, volle Breite | nebeneinander: `x+8k+i·168k`, `y+8k`, `160k`, `h-16k` | Inhalt wird niedriger |
| `burger` | **keine** eigene Zone im Layout; Panel liegt rechts **über** dem Inhalt | wie `right` | `overlay: true`, Burger-Button im Kopfband, zwei Lesezeichen |

Das sind die Maße **ohne** `heading`/`text` (Specs vor 0.4.4). Mit den neuen
Schlüsseln beginnen die Slicer unter der Überschrift und dem Hinweistext (bzw.
in der Leiste oben rechts daneben) — `mockup_to_pbir.filter_layout()`, siehe
[Filterbereich](#filterbereich-zonesfilterheading-text-slicerstype).

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
| `pbir` | optional, ab Tool 0.6: `{ page, visual }` = Ordnernamen im `<Name>.Report`, wenn die Kachel aus dem Projekt eingelesen wurde (Seiten ebenso mit `pbir.page`). Dann wird genau dieses PBIR-Objekt per Delta aktualisiert statt neu angelegt, siehe `mockup-live/CONTRACT.md` |
| `slug` | ASCII-Kurzform des Titels (ab v3) |
| `page` | Seitenname (redundant, praktisch beim Filtern) |
| `kind` | Katalog-Typ (`kombi`, `varint`, `bars`, `kpi`, …) |
| `label` | Anzeigename des Typs |
| `engine` | `ck` · `native` · `deneb` |
| `chartKitchenType` | ChartKitchen-Typ-ID (nur bei `engine: "ck"`, sonst `null`) |
| `chartKitchenMode` | der `chart.orientation`-Wert aus dem Katalog (ab v3) — **diesen nehmen**, die Tabelle weiter unten ist nur der Ersatz für v1/v2 |
| `content` | Text einer Text- oder Button-Kachel (ab v3). Wird als `shape`/`actionButton` mit `text.default.text` gebaut (Text-Formatierung im Zustand `default`, siehe chrome-build.md), **nicht** als Textbox |
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
| `smallMultiples` | `{field}` · `null` | ab 0.4.1 — ein Mini-Chart je Ausprägung, siehe unten |
| `fieldParam` | `{name, role, fields}` · `null` | ab 0.4.1 — Achse per Feldparameter, siehe unten |

Visualtypen ohne Datenbeschriftung (`tableEx`, `pivotTable`,
`decompositionTreeVisual`, Slicer, Shapes) bekommen keine Anzeigeeinheiten —
dort wird daraus ein To-do. Alles, was nicht gesetzt werden konnte, steht mit
Code in `mockup-out/analysis-todos.md`.

## Darstellungsvarianten (Tool 0.4.1)

Zwei Schalter je Kachel, die der Katalog nur für Typen mit **Kategorieachse**
anbietet (`catalog.js` → `variantsFor`). Ausgenommen sind `multiples`, `map`,
`treemap`, `decomp`, `pie`, `gauge` und `ndonut` (`NO_VARIANT_KINDS`).

### `analysis.smallMultiples`

```json
"smallMultiples": { "field": "DimRegion.Region" }
```

`null` heißt aus. Das Aufteilungsfeld steht **doppelt** in der Spec: hier und
als Rolle `multiples`. Ist `field` `null`, hat der Mensch die Variante
eingeschaltet, aber kein Feld gezogen → Tool-Issue `SM_NO_FIELD`; die Kachel
wird trotzdem gebaut, nur ohne Aufteilung.

| Fall | Was der Skill macht |
|---|---|
| natives kartesisches Visual, Feld gebunden | Projektion in den PBIR-Bucket **`Rows`** von `pbir-visuals.json` |
| Feld fehlt | Kachel bleibt, To-do `SM_NO_FIELD` in `analysis-todos.md` |
| natives Visual **ohne** den Bucket (`waterfallChart`, `scatterChart`, `card`, `donutChart`, `pieChart`, `treemap`, `map`, `tableEx`, `pivotTable`, `gauge`, `decompositionTreeVisual`) | To-do `SM_NO_BUCKET` — anderen Typ wählen oder ein Raster aus Einzelkacheln bauen |
| `engine: ck` / `deneb` / `custom` | To-do `SM_NOT_NATIVE` — ChartKitchen und Deneb haben keinen Small-Multiples-Bucket |

> **`Rows` ist verifiziert, nicht geraten** (pbir 0.9.32):
> `pbir schema roles clusteredColumnChart` nennt `Category, Y, Series, Rows,
> Tooltips`; eine per `--from-json` gesetzte `Rows`-Bindung steht danach als
> eigene `queryState`-Projektion in der `visual.json` und `pbir validate
> --fields` nimmt sie an. Gegenprobe: `donutChart` lehnt sie ab
> („Role 'Rows' not valid for donutChart"). Dasselbe Mapping benutzt der
> Katalog schon länger für den Kachel-Typ `multiples` (`series` → `Rows`).
>
> **`pivotTable` hat zwar auch eine Rolle `Rows`** — das ist dort aber der
> Matrix-Zeilenbereich, **nicht** Small Multiples. Deshalb führt der Skill eine
> Positivliste (`mockup_spec.SMALL_MULTIPLES_TYPES`), keine „hat `Rows`"-Prüfung.

### `analysis.fieldParam`

```json
"fieldParam": {
  "name": "Achse",
  "role": "category",
  "fields": ["DimRegion.Region", "DimProduct.Category", "DimCustomer.Segment"]
}
```

Die Kategorieachse kommt aus einem **Feldparameter**: einer berechneten Tabelle
mit dem `NAMEOF`-Muster
(`Achse = { ("Region", NAMEOF('DimRegion'[Region]), 0), … }`). Tabelle und
sichtbare Spalte heißen gleich, deshalb ist der Feldverweis `'<Name>'[<Name>]`
bzw. im pbir-Format **`<Name>.<Name>`**. Weniger als zwei Felder → Tool-Issue
`FIELDPARAM_FEW`.

Der Skill macht daraus dreierlei:

1. **Modell-To-do** in `model-todos.md`: das fertige C#-Skript für
   `te script … --save`, die Prüfbefehle und die erwartete TMDL, ausdrücklich
   mit **prüfen** markiert. Die Parametertabelle muss **vor** dem Bauen
   existieren — ein fehlendes Feld lässt `pbir add visual --from-json` die
   **ganze** Datei ablehnen. Im Plan steht sie als eigener Schritt
   `fieldparams`.
2. **Bindung** in `pbir-visuals.json`: die Kategorie-Felder der Kachel werden
   durch `<Name>.<Name>` ersetzt. Welcher Bucket das ist, wird **gesucht**, nicht
   geraten — der Katalog mappt `category` je nach Typ auf `Category`, `Rows`
   oder `ExplainBy` (`mockup_to_pbir.param_bucket`). Andere Buckets (`Series`,
   `Y`) bleiben unangetastet.
3. **Slicer-Vorschlag**: ohne Slicer kann niemand umschalten. Der fertige
   Aufruf steht **auskommentiert** in `<Seitenslug>/analysis-commands.sh` (Platz
   in der nächsten freien Zeile des Filter-Panels, sonst links oben im
   Inhaltsbereich) und als To-do `FIELDPARAM_SLICER`. Er wird **nicht**
   ausgeführt: das Mockup sieht diese Kachel nicht vor, also entscheidet der
   Mensch.

Bei `engine: ck`/`deneb`/`custom` gehört der Parameter trotzdem ins Modell, die
Achsenbindung zieht man im Slot nach (To-do `FIELDPARAM_SLOT`).

> Drei Dinge brechen still: `ParameterMetadata` (`{"version":3,"kind":2}`) muss
> auf der **versteckten** `NAMEOF`-Spalte liegen, `sortByColumn` auf die
> Order-Spalte zeigen, und `Value3` eine dichte Folge 0, 1, 2 … sein. Ein
> Feldparameter taugt außerdem **nicht** als Drill-through- oder Tooltip-Feld.
> Deshalb schreibt der Skill das DAX nicht mit `te add` zusammen, sondern nimmt
> die headless-Fassung des Makros „Create Field Parameter"
> (`tabular-editor:c-sharp-scripting` → `examples/tables/add-field-parameter.csx`).
> Verifiziert: `Model.AddCalculatedTable` legt die drei Spalten im `te`-CLI
> **nicht** von selbst an (anders als in Tabular Editor 3) — das Skript ruft
> deshalb `AddCalculatedTableColumn` auf.

## Rollen-Vokabular

| Rolle | Label im Tool | Art | max |
|---|---|---|---|
| `category` | Kategorie / Achse bzw. Zeit / Periode bzw. Geo-Feld | Spalte | 1 (mit `fieldParam` bis 8) |
| `subcategory` | Unterkategorie | Spalte | 1 |
| `series` | Reihe / Legende (bei Kachel-Typ `multiples`: Facette) | Spalte | 1 |
| `multiples` | Small Multiples nach — ab 0.4.1, Aufteilungsfeld | Spalte | 1 |
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
| `ncolumn` | `clusteredColumnChart` | category/time→`Category`, series→`Series`, values→`Y` (bis 5) |
| `nbar` | `clusteredBarChart` | category→`Category`, series→`Series`, values→`Y` (bis 5) |
| `nline` | `lineChart` | time→`Category`, series→`Series`, values→`Y` (bis 5) |
| `ndonut` | `donutChart` | category→`Category`, ac→`Y` |
| `pie` | `pieChart` | category→`Category`, ac→`Y` |
| `treemap` | `treemap` | category→`Group`, ac→`Values` |
| `map` | `map` | category→`Category`, size→`Size` |
| `slicer` | `slicer` | field→`Values` |
| `text` / `image` / `button` | `textbox` / `image` / `actionButton` | keine Datenrollen |
| `marimekko`, `wfint`, `wfkombi`, `varint`, `boxplot`, `gantt` | – | kein natives Gegenstück (`native: null`) |

Im JSON stehen diese Mappings bereits fertig unter `visuals[].native.buckets`.
Mehrere Felder pro Bucket (z. B. AC und PL beide in `Y`) werden im
`--from-json`-Format zu einer Liste: `"Y": ["_Measures.AC", "_Measures.PL"]`.

Die Gruppe **„Native Klassiker"** (`ncolumn`, `nbar`, `nline`, `ndonut`, ab
0.4.1) kennt als Engine **nur** `native` — kein ChartKitchen, kein Deneb, keine
Szenario-Notation. Sie ist für Berichte gedacht, die bewusst bei den
Standard-Visuals bleiben: Legende optional (`series`), bis zu fünf Kennzahlen
(`values`). `ndonut` hat stattdessen `category` + `ac` und bietet **keine**
Darstellungsvarianten an.

Zwei Buckets stehen **nicht** im Katalog-Mapping und setzt der Skill selbst:
`Rows` bei Small Multiples und die Parameterspalte anstelle der Kategorie-Felder
bei einem Feldparameter — siehe
[Darstellungsvarianten](#darstellungsvarianten-tool-041).

## Rollen → ChartKitchen-Datenrollen

Zielnamen ausschließlich aus
[`chartkitchen-report/references/field-contract.md`](../../chartkitchen-report/references/field-contract.md).
Das Skript schlägt vor, die Referenz-Instanz entscheidet.

| Mockup-Rolle | ChartKitchen | Anmerkung |
|---|---|---|
| `category` | `category` | |
| `rows` | `category` | Tabelle |
| `series` | `series` | bei `kind: "multiples"` stattdessen `multiples` |
| `multiples` | `multiples` | ab 0.4.1 — dieselbe Zielrolle wie beim Kachel-Typ `multiples`. ChartKitchen zeichnet das Raster in `columns`, `bars` und `line` selbst; `SM_NOT_NATIVE` gibt es nur noch für andere Modi, Deneb und Custom Visuals |
| `subcategory`, `columns` | `colgroup` | nur Tabelle, max. 2 Ebenen |
| `ac`, `indicator`, `values` | `actual` | |
| `ref` (1./2. Feld) | `plan` bzw. `previousYear` | nach dem Szenario im Feldnamen (PY/VJ → `previousYear`, PL/Plan/BU/Budget → `plan`, FC → `forecast`), sonst Reihenfolge aus `scenario`; überzählige Referenzen → `benchmark`. Bei `colline` wird die erste Referenz `lineMeasure` (Säulen + Linie einer zweiten Kennzahl) |
| `goal` | `plan` | bei Monitoring-Zielwerten ggf. `benchmark` — nachfragen |
| `fc` | `fcFlag` | **Zahl 1/0**, nicht Boolean |
| `rowType` | `rowType` | Pflicht nur bei `orientation: pnl` (`sum`/`delta` je Zeile). `waterfall` zeichnet ohne die Rolle einen Beitrags-Wasserfall mit Σ bzw. mit gebundener Referenz eine Varianz-Brücke (geprüft in `ibcsInspiredChartDeck/src/visual.ts` → `buildWaterfall`) |
| `x`, `y`, `size`, `start`, `end`, `field`, `text` | – | kein Gegenstück; diese Typen kann ChartKitchen nicht |

### Kachel-Typ → `chart.orientation`

> Ab specVersion 3 steht der Wert bereits in `visuals[].chartKitchenMode` — diese
> Tabelle ist die Rückfallebene für v1/v2 und zum Nachschlagen. Eine bekannte
> Fehlzuordnung korrigiert der Skill auch gegen die Spec (`CK_MODE_FIX`):
> `wfint` mit `intwaterfall` wird `catbridge` — `intwaterfall` ist die Zeit-Brücke
> und zeigte im Deploy 4 bei jeder Region dieselbe Δ% (`mockup-live/AUDIT-DEPLOY4.md`).
> `bridge` mit `catbridge` wird `waterfall` — die Kitchen-Skizze ist senkrecht
> (Σ Referenz → Δ je Kategorie → Σ AC als Säulen), `catbridge` zeichnet waagrechte
> Zeilen (Live-Lauf 8). Der Slot nennt den Spec-Wert dann in `orientationFrom`.

Maßstab ist die Kitchen-Skizze (`assets/mockup/sketches.js`), geprüft gegen
`ibcsInspiredChartDeck/src/visual.ts` 1.43:

| Kitchen-Typ | Skizze | ChartKitchen-Modus | Was ChartKitchen zeichnet |
|---|---|---|---|
| `bridge` | `S.bridge`: senkrechte Säulen Σ Referenz → Δ je Kategorie → Σ AC, Netto-Δ-Plakette | `waterfall` | ohne `rowType`, mit Referenz: Varianz-Brücke (`buildWaterfall`), senkrecht (`renderWaterfall`); eigene Δ-Ebene entfällt, Δ% nur mit `showRelativeVariance` |
| `wfint` | `S.wfint`: waagrechte Zeilen Σ PL/PY → Kategorien → Σ AC, Δ-Kaskade, Δ%-Pins | `catbridge` | Struktur-Zeilen mit Kaskade und doppelter Abstimmung |
| `waterfall`, `wfkombi` | senkrechte Beiträge → Σ | `waterfall` | ohne Referenz: Beitrags-Wasserfall mit Σ |
| `varint` | Zeit-Brücke mit Monatssäulen und Pins | `intwaterfall` | integrierte Zeit-Brücke |

| Typen | `orientation` |
|---|---|
| `columns`, `kombi`, `colline`, `absvar`, `relvar`, `stackcol`, `multiples` | `columns` |
| `bars`, `barskombi`, `bullet`, `tornado`, `stackbar` | `bars` |
| `dotplot` | `dumbbell` |
| `pareto` | `pareto` |
| `line`, `fan`, `zchart` | `line` |
| `slope` | `slope` |
| `varint` | `intwaterfall` |
| `wfint` | `catbridge` (Struktur-Brücke) |
| `waterfall`, `wfkombi` | `waterfall` |
| `bridge` | `waterfall` (Varianz-Brücke, senkrecht) |
| `kpi` | – (kein CK-Modus: `cards` zeichnet eine Karte je Kategorie, mit Monat zwölf Karten) → Custom Visual `ibcsKpiCard`, siehe unten |
| `table`, `sparktable`, `heatmap` | `table` |
| `marimekko`, `tree`, `scatter`, `boxplot`, `gantt` | kein Modus → Deneb oder natives Visual |

### `chartkitchen-slots.json` — fertige Einstellungen (`objects`)

Der Skill legt ChartKitchen-Visuals nicht selbst an (pbir kennt die GUID nicht);
der Live-Runner bzw. der Mensch schreibt die `visual.json`. Alles, was die Spec
dafür hergibt, steht je Slot bereit:

| Feld | Inhalt |
|---|---|
| `orientation`, `orientationFrom` | wirksamer Modus; `orientationFrom` = abweichender Spec-Wert |
| `chartKitchenRoles` | Rollen-Vorschlag (Tabelle oben) |
| `ckSettings` | dieselben Einstellungen flach und lesbar: `{"chart.comparisonMode": "plan", …}` |
| `objects` | **fertig für `visual.objects`** in Desktop-Form: `{objekt: [{"properties": {eigenschaft: {"expr": {"Literal": {"Value": "'plan'"}}}}}]}`, Farben als `{"solid": {"color": …}}` |
| `container` | `visualContainerObjects` (Kachel-Fläche, Rahmen, Radius, Schatten); Titel und Untertitel bleiben als Text stehen, sind aber aus — ChartKitchen zeigt sie im eigenen Kopf |
| `title`, `titleText`, `titleShown` | sichtbarer Titel (`""` = keiner), Titeltext, Kitchen zeigt einen Kopf |
| `nativeFallback`, `nativeFallbackDropped` | natives Ersatzvisual bzw. warum es keines gibt |
| `chartProps` | wie bisher `orientation` und `invert` (für ältere Runner) |

Inhalt von `ckSettings`/`objects` (Namen und Enums aus der `capabilities.json` in
`ibcsInspiredChartDeck/dist/chartKitchenByDatenWG…1.43.0.0.pbiviz`, von
`tests/run_tests.py` gegengeprüft):

| Einstellung | Quelle in der Spec | Regel |
|---|---|---|
| `chart.orientation` | `chartKitchenMode` / Typ | s. o. |
| `chart.comparisonMode` | `analysis.deltaBasis` (ab 0.5.5 die **wirksame** Basis) | PY → `py`, PL/BU → `plan`, nur wenn die Rolle gebunden ist; sonst und bei FC `auto` mit Warnung (CK kennt kein AC gegen FC) |
| `chart.showAbsoluteVariance`, `chart.showRelativeVariance` | `display.drawn.delta` (0.5.5), sonst `analysis.deltaKind` | `absvar` immer nur abs, `relvar` nur rel, `bridge` keine (die Brücken-Säulen sind die Δ) |
| `chart.invert` | `analysis.polarity` | `lower` → `true`, sonst `false` |
| `chart.topN` | `analysis.topN` | nur in `bars`, `catbridge`, `table`, `dumbbell`, `cards` (max. 50); sonst To-do `TOPN_CK_MODE` |
| `chart.cumulative`, `chart.cumulativeKind` | `analysis.cumulative` | `true` + `ytd` in `columns`, `line`, `table` — ChartKitchen kumuliert selbst, keine YTD-Kennzahl nötig; sonst To-do `CUMULATIVE_CK_MODE` |
| `chart.showTotal` | `display.drawn.total` | nur wenn angegeben |
| `chart.chartButtons`, `chart.smartStart` | – | immer `false` (das Kitchen zeigt keine In-Chart-Buttons und keinen Vorschlags-Chip) |
| `labels.displayUnits`, `labels.decimals` | `display.numbers` (0.5.5), sonst `analysis` | `none`/`K`/`M` → `none`/`k`/`m`, sonst `auto`; Stellen 0–3, Kitchen „auto" → `0` (die Skizze zeigt keine) |
| `labels.show` | `display.drawn.labels` | nur wenn angegeben |
| `labels.fontPreset`, `labels.fontScale` | `display.fontPx.title`, sonst `design.typography` | Preset `compact`, Faktor so, dass der IBCS-Titel (`round(12 × fontK)` px, `drawTitleBlock` in 1.43) die Kitchen-Titelgröße trifft: 18 px → `fontScale` 150; Werte/Achse = Kitchen-px ÷ Faktor |
| `labels.fontSize`, `categoryAxis.fontSize` | `display.fontPx.label`/`axis`, sonst Diagrammschrift | Kitchen-px ÷ Faktor (6–24) |
| `colors.appearance` | `design.darkMode` | `dark` bzw. `light` |
| `colors.goodColor`, `colors.badColor` | `design.varianceColors` | Teal- bzw. IBCS-Palette |
| `ibcsTitle.show`, `.kpi`, `.period`, `.message` | sichtbarer Titel, `subtitle`, `analysis.message` | Der IBCS-Kopf hängt an den Titel immer „ in <Einheit> · <Zeitraum>: AC vs. PL, PY" an (kein Schalter in 1.43; ein leerer Zeitraum wird bei Säulen aus erster/letzter Kategorie gebildet). Das Kitchen zeigt nur Titel und Untertitel → **ohne Kernaussage** `ibcsTitle.show=false` (`kpi` bleibt gesetzt) und der Container-Titel zeigt den Kopf: `title.fontSize` = `display.fontPt.title`, `bold`, Ink; `subTitle.fontSize` = `display.fontPt.subtitle`, Ink mit 70 % Deckkraft. **Mit Kernaussage** zeichnet ChartKitchen den Kopf (Titel als `kpi`, Untertitel als `period`, Aussage als `message`), Container-Titel aus, Hinweis in den Warnungen |

Für die Analyse-Angaben, die so im Slot stehen, entstehen keine To-dos mehr
(`CK_INVERT`, `DELTA_BASIS`, `DISPLAY_UNITS_SLOT`, `CUMULATIVE`, `MESSAGE` bei
ChartKitchen). Was nicht aufgeht, steht als Warnung im Slot.

**Natives Ersatzvisual (`--ck-fallback`).** Für `absvar`, `relvar` und `bridge`
gibt es keines mehr: ohne Δ-Kennzahl zeigte ein natives Diagramm etwas anderes
(AC statt Δ, AC-Wasserfall statt Brücke). Es bleibt ein Platzhalter, dazu das
To-do `CK_NO_NATIVE`. `heatmap` (Matrix) und `sparktable` (Tabelle) nehmen die
Referenz in `Values` mit, `tree` (Zerlegungsbaum) als `Tooltips`.

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
| `kpi` (engine `ck`) | `ibcsKpiCard` | `ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682` | `category`, `ac`, `py`, `pl`, `fc`, `trend` |

**`kpi` → `ibcsKpiCard` 2.3.** Eine `kpi`-Kachel mit `engine: "ck"` stellt
`mockup_spec.upgrade()` auf `engine: "custom"` um (`engineSource: "ck"`),
**nach** dem Spec-Hash, damit der Hash gleich bleibt. Der Live-Runner nutzt
dieselbe Funktion und sieht die Kachel deshalb ebenfalls als Custom Visual.
Rollen: `indicator` → `ac`; `goal` (und `ref`) → `py`/`pl`/`fc` nach dem Szenario
im Feldnamen (ohne Treffer `pl`); die Zeitrolle des Kitchens (`category`,
„Sparkline") → `trend` — **nicht** `category`, das hieße eine Karte je Monat.
Die erzeugte `visual.json` trägt fertige `objects`: `display.title`
(sichtbarer Titel), `display.periodLabel` (Untertitel), `display.comparisonMode`
(auto/py/plan aus der Δ-Basis), `display.invert`, `display.showSparkline` (nur
an, wenn `trend` gebunden), `display.showBridge=false` und
`display.showSecondary=false` (die Skizze zeigt weder Mini-Brücke noch eine zweite
Bezugszeile), `display.chartButtons=false`, `labels.fontPreset` und
`display.titleSize` nach der Formel unten, `labels.displayUnits`,
`labels.decimals`, `colors.goodColor`/`badColor`; der Container-Kopf ist aus (die
Karte zeichnet Titel und Zeitraum selbst). Build: `ibcsKpiCard/dist/ibcsKpiCard*.2.3.0.0.pbiviz`.

**Kartengröße der Einzelkarte (Befund B3, Demo-Test 02.10.2026, in Desktop zu
prüfen).** Bis 02.10. stand bei der Einzelkarte immer `compact`. In einer Kachel
386 × 190 auf einer 1920er-Seite (Titel 18 px) gab das `titleSize` 21,5 und in
Desktop einen kleinen Kasten „UMSATZ 118M" mitten in der Kachel. Nachgemessen im
Desktop-Bild (Zoom 0,529): Karte 48 × 38 px = 91 × 72 Seiten-px, Zahl 21 px,
Titel 18 px. Daraus und aus `ibcsKpiCard/src/visual.ts` (`render`, `buildCard`):

- Desktop übergibt dem Visual das Viewport in **Seiten-px**, der Zoom wirkt erst
  danach. Viewport `W × H` = Kachel minus Container-Innenabstand (angenommen 5 px je
  Seite).
- Skalierung `k = clamp(0,7 … 2,6; min(W/460, H/150)) × Preset` mit compact 1,
  fullhd 1,5, presentation 2. Die Karte ist **so groß wie ihr Inhalt**
  (ibcsKpiCard streckt sie nicht) und sitzt mittig in einer Fläche mit 8 px Rand.
- Inhalt in Karten-Einheiten (Zeilenhöhe 1,33): Höhe = 24 + 1,33 × `titleSize` + 3
  + 1,33 × 26 (Zahl), mit Bezug (`py`/`pl`) + 8 + 1,33 × 12, mit Sparkline
  `max(Textblock, 104) + 24`. Breite = 30 + max(Titel, Zahl mit 6 Zeichen
  + Δ-Pille), mit Sparkline + 142.
- `display.titleSize` = Kitchen-Titel px ÷ k (Titel so groß wie im Kitchen).
- **Gewählt wird das größte Preset, bei dem die Karte noch passt:** Höhe höchstens
  85 % von `H − 16`, Breite höchstens `W − 16`, Zahl (26 × k) nicht größer als in der
  Skizze (`40 × design.fontScale` px), `titleSize` mindestens 8. Mit `trend` nur
  Presets mit mindestens 340 Einheiten Breite (`W ÷ k`), sonst fehlt die Sparkline
  (Live-Lauf 02.10.2026: 960 × 480 mit `fullhd` = 307 Einheiten); mit Bezug
  mindestens 210, sonst fehlt die Bezugszeile. Passt nichts, bleibt `compact`.
- Ergebnis bei 386 × 190 und k 1,5: nur Istwert `presentation` (Zahl 42 px, Karte
  etwa 200 × 125 px), mit Bezug `fullhd` (Zahl 32 px), mit Sparkline `compact`
  (Zahl 21 px, Sparkline daneben). Ist die Einzelkarte mit `trend` schmaler als
  248 px, steht ein Hinweis in den Warnungen.
- **In Desktop zu prüfen:** Container-Innenabstand, Zeilenhöhe und die angenommene
  Länge der Zahl. Beleg mit einem Screenshot der Seite (Kachel 386 × 190).

Im Kartenraster (`category` gebunden) bleibt das Preset aus k (compact < 1,25 ≤
fullhd < 1,75 ≤ presentation), Kachelbreite `minTile = 240 × Preset`.

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
| `ibcsKpiCard` | `ac` |

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
`--from-json` die ganze Datei ablehnen. ChartKitchen-, Custom- und
Deneb-Kacheln stehen nie in der Tool-Datei; eine Seite nur aus solchen Kacheln
ergibt `[]`, das ist kein Fehler (der Export-Dialog nennt die Anzahl je Seite).

`mockup_to_pbir.py` erzeugt diese Dateien neu — als
`mockup-out/<Seitenslug>/pbir-visuals.json` — und legt daneben ab:

- **Text- und Button-Kacheln** stehen in `text-visuals.json` als `shape` bzw.
  `actionButton` mit echtem Text. Ab Tool 0.5.2 lässt auch die Tool-Datei sie
  weg; ältere Exporte führen sie noch als `textbox`, und eine Textbox bleibt
  über die CLI leer (siehe `chrome-build.md`).
- Mit `--ck-fallback` kommen zusätzlich die ChartKitchen-Kacheln als natives
  Ersatzvisual hinein, sofern die Spec eines kennt. Das ist der einzige
  Unterschied zur Tool-Datei ab 0.5.2.

Wer die Tool-Originale nimmt, nimmt die passende Seitendatei — und baut die
Text-Kacheln aus `text-visuals.json` (oder von Hand) nach.

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

## `zones.header.navPosition` und `zones.footer.nav` (Tool 0.4.3)

Die Seitennavigation kann im Kopfband (`navPosition: "header"`, wie bisher, `zones.header.nav` gefüllt), in der
Fußleiste (`navPosition: "footer"`, dann steht die Liste in `zones.footer.nav`, `zones.header.nav` ist leer) oder
aus sein (`"off"`). `zones.header.navOn` bleibt als Kurzform `navPosition === "header"` erhalten. Beim Bau in der
Fußleiste gehören die Nav-Buttons rechts in die Fußzone, kleiner als im Kopfband (Schrift ca. 9,5 px × Skalierung).

**So baut es der Skill** (`build_chrome`, ab dieser Fassung):

- `mockup_spec.nav_position(zones)` liest `navPosition` aus Kopfband oder Fußleiste; ältere Specs ohne den
  Schlüssel fallen auf `navOn` zurück (`false` → `off`, sonst `header`).
- `header`: wie bisher, `chrome_nav_<i>` rechtsbündig im Kopfband (Schrift 10 × k).
- `footer`: dieselben Namen `chrome_nav_<i>` (damit `navigation.md`, Lesezeichen und Abnahme gleich bleiben),
  aber als `actionButton` **rechtsbündig in der Fußzone**: Rand rechts 16 × k, Abstand 5 × k, Höhe höchstens
  20 × k, Breite nach Textlänge (mindestens 48 × k), Schrift 9,5 × k auf 0,5 gerundet (bei k = 1,5 also 14,5
  gegenüber 15 im Kopfband). Die aktive Seite bekommt Akzentfüllung und keine Aktion, die anderen einen
  dünnen Rahmen (`outline.show/lineColor/weight`, mit `pbir schema describe actionButton outline` geprüft) und
  `PageNavigation`. Der Fußzeilentext `chrome_footer_text` endet links vor den Buttons.
- `footer`, aber Fußleiste aus: keine Buttons, Hinweis in `checklist.md`.
- `off`: keine Buttons, Hinweis in `checklist.md` und `navigation.md` (wie `navOn: false`).

## `visuals[].interaction` (Tool 0.4.2)

Verhalten der Kachel, im Tool über das Kachel-Fenster (Button „Notiz & Einstellungen", Taste N) gesetzt:

```json
"interaction": {
  "drillDown": true,
  "crossFilter": false,
  "drillThrough": { "pageId": "bne8qqd", "pageName": "Detail", "field": "DimRegion.Region" }
}
```

- `drillDown` (Vorgabe `false`): Hierarchie in der Kachel aufklappbar; im Bericht Drill-Modus des Visuals
  erlauben, die Kategorie-Rolle trägt dann mehrere Ebenen.
- `crossFilter` (Vorgabe `true`): `false` heißt, ein Klick auf diese Kachel filtert die anderen Kacheln der
  Seite nicht (Interaktionen im Bericht auf „Keine" stellen).
- `drillThrough`: identisch mit `links[]` (Drill-through auf die Zielseite mit `field` als Drill-Feld), hier
  nur zusätzlich je Kachel notiert; `null`, wenn kein Ziel gesetzt ist. Buttons führen Navigation, kein
  Drill-through.

Der Agent-Brief fasst das je Kachel als Zeile „Verhalten: Drill-down · kein Cross-Filter · Drill-through → Seite"
zusammen. Fehlt der Block (ältere Specs), gelten die Vorgaben.

## Tool 0.4.4: Typografie, Filterbereich, Slicer-Art, Barrierefreiheit

Alle vier Erweiterungen sind optional. Fehlen die Schlüssel, entstehen dieselben
Dateien wie vorher (die Goldens der älteren Fixtures sind unverändert).
Testfall: `tests/fixtures/v3-typo-filter.json` (Full HD, Fußleisten-Navigation,
Typografie mit Kachel-Override, Filterbereich mit Überschrift, Hinweis und drei
Slicer-Arten, zwei `A11Y_*`-Befunde).

### Typografie (`design.typography`, `visuals[].typography`)

```json
"design": { "fontScale": 1.5,
            "typography": { "basis": "1280px", "scale": 1.1, "title": 13, "sub": 10, "chart": 9 } },
"visuals": [ { "id": "mk_col1", "typography": { "scale": 1.3 } }, { "id": "mk_kpi1", "typography": null } ]
```

Basisgrößen in px bei 1280 px Seitenbreite (Tool-Vorgabe 12 / 9,5 / 9, `scale` 1).
Die Seite skaliert mit `k = canvas.width / 1280` (steht als `design.fontScale`
in der Spec). Wirksam — wie im Tool (`render-png.js`: `ty.scale × tileScale × k`):

| Größe | Formel | im Bericht |
|---|---|---|
| Visual-Titel | `title × scale × tile × k` | pt = px × 0,75, auf 0,5 gerundet, 6–45 |
| Untertitel | `sub × scale × tile × k` | dito |
| Diagrammbeschriftung | `chart × scale × tile × k` | dito |

`tile` ist `visuals[].typography.scale` (fehlt/`null` = 1). Beispiel oben:
Titel 13 × 1,1 × 1,5 = 21,45 px → **16 pt**, mit Kachel-Faktor 1,3 → **21 pt**.
`mockup_spec.type_sizes(nspec, visual)` rechnet das; ohne `design.typography`
liefert es `None`, und der Skill bleibt bei den alten festen Größen.

Wohin es geht:

- **`chrome-batch.json`** (und `chrome-commands.sh`): je nativem Visual
  `title.fontSize` und `subTitle.fontSize` in pt (Container-Objekte, von `pbir`
  als `"16D"` geschrieben — geprüft mit `pbir batch run` und `pbir visuals
  json`). Text-Kacheln und Slicer bleiben außen vor.
  **Nicht** in `pbir-visuals.json`: `--from-json` erlaubt nur `visual_type,
  name, title, x, y, width, height, fields`; jeder weitere Schlüssel verwirft
  die ganze Datei.
- **`theme-fragment.json`**: `visualStyles.page.*.outspace` (Umgebung der Seite,
  Kitchen-Bühne `#EAE8E1` bzw. `design.stageBackground`) und
  `visualStyles.page.*.background` (= `design.pageBackground`), je mit
  `transparency: 0`; dazu `visualStyles.*.*.title.fontSize` (Titel global)
  und `subTitle.fontSize`, dazu `textClasses` — `largeTitle` = Visual-Titel,
  `title` = Achsentitel/Slicer-Kopf und `label` = Werte und Beschriftungen,
  beide aus der Diagrammbeschriftung. `callout` (KPI-Werte) kennt das Mockup
  nicht und bleibt dem Theme überlassen. Farben in `textClasses` als reiner
  Hex-String (nicht `{solid: …}`), `title` bekommt Ink ausdrücklich.
- **Custom Visuals**: `title`/`subTitle.fontSize` direkt in der erzeugten
  `visual.json`.
- **ChartKitchen-/Deneb-Slots**: Block `typography` (`titlePt`, `subtitlePt`,
  `labelPt`, `labelPx`, `tileScale`) — im Format-Bereich des Visuals setzen.
- **`checklist.md`, `plan.json` (`typography`), Workshop-Doku**: die wirksamen
  Größen und die Kacheln mit eigenem Faktor.

> Die Chrome-Texte (Kopfband, Fußleiste, Filter-Überschrift) folgen seit dem
> 01.10.2026 derselben Regel: Kitchen-px × k × 0,75 pt (Tabelle in `chrome-build.md`).

### Filterbereich (`zones.filter.heading`, `text`, `slicers[].type`)

```json
"filter": { "mode": "right", "heading": "Auswahl", "text": "Alle Werte in Tsd. EUR.",
            "slicers": [ { "ref": "DimDate.Year", "type": "dropdown" },
                         { "ref": "DimRegion.Region", "type": "tile" },
                         { "ref": "DimDate.Date", "type": "date" } ] }
```

- `heading`: sichtbarer Überschriftstext; `null` = keine Überschrift (das Tool
  blendet sie bei „auto" aus, sobald Slicer da sind). Wird als Shape
  `chrome_filter_title` gebaut; fehlt der Schlüssel ganz (alte Spec), bleibt es
  bei „Filter".
- `text`: Hinweistext oder `null`. Shape `chrome_filter_text` (Schrift 9,5 × k,
  grau) unter der Überschrift, in der Leiste oben rechts daneben (höchstens
  220 × k breit).
- Die Slicer rücken nach: Panel = unter Überschrift (32 × k) und Text
  (Zeilen × 13 × k), Leiste oben = rechts neben beiden. Ohne Überschrift und
  Text beginnen sie 8 × k unter der Oberkante.
- Lesezeichen „Filter öffnen/schließen" nehmen `chrome_filter_title` und
  `chrome_filter_text` nur auf, wenn es sie gibt.

**Slicer-Art → PBIR-Formatierung** (in `chrome-batch.json`/`chrome-commands.sh`;
`mockup_to_pbir.SLICER_FORMAT`). **Verifiziert mit pbir 0.9.32** an einem
Probe-Report (sechs Slicer, `pbir batch run`, danach `pbir validate --fields`
ohne Befund und `pbir visuals json` gelesen):

| `type` | Setzung | Quelle / Prüfung |
|---|---|---|
| `dropdown` | `data.mode = Dropdown` | Enum aus `pbir schema describe slicer data --json`; Vorgabe im Microsoft-Theme Fluent2 |
| `list` | `data.mode = Basic`, `general.orientation = 0` | Fluent2-Stilvorlage „List" (`visualStyles.slicer.List`) |
| `tile` | `data.mode = Basic`, `general.orientation = 1` | Fluent2-Stilvorlage „Tile" |
| `between` | `data.mode = Between` | Enum; Feld muss numerisch oder Datum sein |
| `date` | `data.mode = Between` | wie `between`, Feld muss `Date`/`DateTime` sein (Hinweis in `checklist.md`) |
| `search` | `data.mode = Basic`, `general.orientation = 0`, `general.selfFilterEnabled = true` | `selfFilterEnabled` ist das Suchfeld-Flag des Slicers; `pbir` nimmt es an — **in Desktop gegenprüfen** |
| `relative` (0.4.6) | `data.mode = Relative` | relatives Datum (letzte N Tage/Monate); Feld muss `Date`/`DateTime` sein; Zeitraum in Desktop wählen. Verifiziert am Testbed-Report |
| `button` (0.4.6) | eigenes Visual `advancedSlicerVisual`, Feld in Rolle `Values` (`SLICER_VISUAL_TYPE`) | der neue Button-Slicer; Layout (Spalten/Zeilen, Bilder) in Desktop. `pbir add visual --from-json` legt ihn an, `validate --fields` ohne Befund |

`data.mode` ist ein Enum (`VerticalList, HorizontalList, Between, Before, After,
Basic, Dropdown, Relative, Single, RelativeTime, RelativeDatePicker`);
`pbir set … data.mode --value List` wird abgelehnt. Specs ohne `type` bekommen
nichts gesetzt.

### Barrierefreiheit (`issues[]` mit `A11Y_*`)

Das Tool (Modul `a11y.js`) schreibt seine Befunde als ganz normale Issues mit
`code` = `A11Y_…` und `level` `error`/`warn`/`info`; der Text enthält den
Hinweis in Klammern. Der Skill zieht sie aus der allgemeinen Issue-Tabelle
heraus und zeigt sie in einem eigenen Block:

- **`checklist.md`** → „Barrierefreiheit": Tabelle mit Schwere, Code, Seite,
  Kachel, Befund; `error` ist als **Blocker** markiert.
- **`plan.json`** → erster Schritt `accessibility` (op `confirm`, listet die
  Blocker) und Block `accessibility` mit `acceptBeforeBuild`, `blockers`,
  `findings`. Fehler muss der Mensch **vor** dem Bau im Mockup beheben oder
  ausdrücklich akzeptieren; Warnungen und Hinweise werden vorgelegt.
- **Workshop-Doku** (`mockup_to_docs.py`, deutsch und englisch): Abschnitt
  „Barrierefreiheit" / „Accessibility" vor den offenen Punkten, in der
  PowerPoint eine eigene Folie. Unter „Offene Punkte" stehen sie nicht noch
  einmal.

| Code | Level im Tool | Worum es geht |
|---|---|---|
| `A11Y_CONTRAST_TEXT` | error | Text gegen Kachelgrund unter 4,5:1 |
| `A11Y_CONTRAST_HEADER` | error | Kopfband-Text gegen Kopfband-Fläche unter 4,5:1 |
| `A11Y_CONTRAST_ACCENT` | warn | Akzent gegen Kachelgrund unter 3:1 |
| `A11Y_PALETTE_COLOUR_ONLY` | info | Grün/Rot-Palette (Rot-Grün-Schwäche) |
| `A11Y_FONT_MIN` | warn | Titel/Untertitel auf dieser Leinwand zu klein |
| `A11Y_TILE_SMALL` | error/warn | Kachel zu klein bzw. knapp |
| `A11Y_TITLE_MISSING` | warn | Kachel ohne Titel (Screenreader) |
| `A11Y_DENSITY` | info | viele Kacheln auf einer Seite |
| `A11Y_READING_ORDER` | info | Layout tief verschachtelt (Tab-Reihenfolge) |
| `A11Y_NAV_OFF` | info | Seitennavigation aus |
| `A11Y_SLICER_LABEL` | warn | Slicer ohne Feldnamen |

## `page-<Index>-<Seitenslug>.png` (Tool-Ausgabe, ab v3)

Wählt der Mensch im Export „Alle Dateien", legt das Tool je Seite ein
Seitenbild daneben (Rendering des Mockups, Faktor 2). `mockup_to_docs.py`
bettet es in die Seitenfolie ein, wenn es im selben Ordner wie die Spec liegt;
sonst zeichnet es das Wireframe aus nativen Shapes.


## Kachel-Anzeige (Kitchen 0.5.5, specVersion bleibt 3)

Quelle: `mockup-live/CONTRACT.md`, Abschnitt „Kachel-Anzeige in der Spec". Alle
Felder sind optional; ältere Specs laufen wie bisher. Was der Konverter daraus
macht:

| Feld | Bedeutung | Wirkung im Skill |
|---|---|---|
| `title` | **geändert:** sichtbarer Kachelkopf, `""` ohne Kopf | `""` → kein sichtbarer Titel (nativ `title.show=false`, ChartKitchen `ibcsTitle.show=false`, Custom Visual Container-Titel aus) |
| `titleShown` | Kachel zeigt einen Kopf | gewinnt immer. Ohne Feld (ältere Exporte, dort war `title` = Titel oder Label): Titel gleich Katalog-Label ohne Untertitel gilt als „kein Kopf" — so zeichnete es das Kitchen (`headH = v.title \|\| v.sub`) |
| `displayName` | Name für Auswahlbereich und Meldungen | Container-Titeltext bzw. `title` in `pbir-visuals.json`, wenn `title` leer ist |
| `analysis.deltaBasis` | **geändert:** wirksame Basis (PL > BU > PY wie ChartKitchen `auto`), `null` ohne Bezug | → `chart.comparisonMode` bzw. `display.comparisonMode` der KPI-Karte |
| `analysis.deltaBasisSource`, `deltaBasisRequested` | Herkunft, nicht gezeigte Wahl | nur informativ (`SCENARIO_REF_MISMATCH` kommt aus der Spec) |
| `display.scenarios`, `refSource`, `placeholders` | gezeigte Szenarien, Herkunft des Bezugs | Platzhalter-Bezüge sind nicht gebunden — es entsteht keiner |
| `display.drawn.delta` | gezeichnete Δ-Ebenen | `chart.showAbsoluteVariance`/`showRelativeVariance` (vor `deltaKind`) |
| `display.drawn.labels` | Wertbeschriftung an/aus | ChartKitchen `labels.show`, nativ `labels.show` |
| `display.drawn.total` | Σ sichtbar | `chart.showTotal` |
| `display.numbers` | `displayUnits`, `decimals`, `unitText` | vor `analysis.displayUnits`/`decimals`: ChartKitchen `labels.*`, KPI-Karte `labels.*`, nativ `labelDisplayUnits`/`labelPrecision` |
| `display.fontPx`, `display.fontPt` | `title`, `subtitle`, `label`, `axis` (Faktoren eingerechnet) | Kacheltitel/-untertitel in pt (nativ, Container), ChartKitchen-Schriften (`labels.fontScale`, `labels.fontSize`, `categoryAxis.fontSize`), native `labels.fontSize` |

