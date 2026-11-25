# MockupKitchen · Bauplan (v0.4)

Positionierung (aus dem Review): kein Report-Generator, sondern ein **Anforderungswerkzeug mit deterministischem
Ausgang**. Der Workshop legt Struktur, Felder und Entscheidungen fest; der Bau ist eine Ableitung.

## Neu in v0.9.0 (25.11.2026, `feat/mockup-kitchen`, PR #78)

- **Arbeitsbereich „Visual einrichten“** (`studio.js`, `MK_STUDIO.open(leafId)`): „Einrichten“ in der Kachel-Leiste
  öffnet einen ganzseitigen Dialog für genau eine Kachel. Links die Felder des Modells mit Suche, in der Mitte die
  große Vorschau mit Titel und Untertitel, rechts die Rollen und die Darstellung, unten „Fertig“.
- **Rollen erklären sich selbst:** jede Rolle zeigt Feldart, Pflicht oder freiwillig, die Höchstzahl und in einem Satz,
  was sie im Visual bewirkt (Texte aus `tip.role.*`). Eine Rolle anklicken, dann links ein Feld wählen; unpassende
  Felder treten zurück. Ziehen geht auch. Leere Rollen zeigen bis zu drei Vorschläge, „Felder vorschlagen“ füllt alle.
- **Darstellung an einer Stelle:** Vergleich (Szenario), Abweichung absolut und in Prozent, Bewertung, Sortierung,
  Top N, kumuliert, Small Multiples, die ChartKitchen-Optionen des Typs und die Kernaussage. Es erscheinen nur die
  Schalter, die der Typ hat. Jede Änderung wirkt sofort auf Vorschau und Kachel (ein Rückgängig-Schritt je Änderung).
- **„Das kann dieses Visual“:** kurze Liste je Umsetzung (ChartKitchen-Modus, P&L byDatenWG, Gantt, nativ, Deneb) mit
  Etikett „hier einstellbar“, „über Typ ändern“ oder „im Bericht einstellbar“. Das Etikett wird an der Kachel
  geprüft (`capWhere`), es verspricht also nie einen Schalter, den der Dialog nicht zeigt. Quelle der Liste sind die
  AGENT-GUIDEs der Visuals; sie ist bewusst kurz und nennt keine Property-Namen.
- **Typ und Alternativen im Kopf:** „Typ ändern“ öffnet die Typauswahl über dem Arbeitsbereich, die Fassungen einer
  Kachel sind als Schalter sichtbar, „+ Alternative“ und „Alternative entfernen“ sitzen daneben.
- Der frühere Zoom auf die Kachel (`MK.focusTile`) bleibt als Rückfall im Code, hat aber keinen Knopf mehr.
- Nicht geändert: Spec-Format und Skill. Der Arbeitsbereich schreibt dieselben Felder wie der Kachel-Reiter.

## Neu in v0.8.1 (25.11.2026, lokal auf `feat/mockup-kitchen`)

- **Feld-Vorschläge je Rolle** (`suggestFor`, `autoFill` in `appmode.js`): Leere Rollen im Kachel-Reiter zeigen bis zu
  drei passende Felder aus dem Modell als Knöpfe, ein Klick ordnet zu. Im Einrichten-Modus füllt „Felder vorschlagen“
  alle leeren Rollen auf einmal (Pflichtrollen immer, freiwillige nur bei klarem Treffer), als ein Rückgängig-Schritt.
  Die Regeln lesen nur Namen und Feldart: Zeitfelder, Szenario-Kennzahlen (AC, PL, PY, BU, FC nach dem Szenario der
  Kachel), Dimensionen ohne Schlüssel- und Sortierspalten, FC-Kennzeichen, Zeilentyp.
- **Visual-Wechsel an einer Kachel** (`v.alts`, `v.altIx`, `addAlt`, `switchAlt`): eine Kachel kann mehrere Fassungen
  haben, z. B. Balken und Tabelle. „+ Alternative“ im Einrichten-Modus kopiert die Fassung samt Feldern und öffnet die
  Typauswahl. Der Schalter sitzt oben rechts in der Kachel und ist in der Präsentation klickbar. Bearbeitet wird immer
  die gezeigte Fassung. Export: `visuals[].switchLabel`, `switchIndex`, `alternatives[]`; Issues
  `BOOKMARKS_TILE_SWITCH` (Power BI braucht Lesezeichen) bzw. `APP_TILE_SWITCH`.
- **Nachgezogen:** Ansichten-Schalter im PNG-Export, aktive Hauptseite in der PNG-Navigation, Kopfleiste bis 1640 px
  enger (bei 1500 px einzeilig), keine Bearbeiten-Knöpfe an der Kachel in der Präsentation.
- Branch auf `origin/main` vom 25.11. nachgezogen (konfliktfrei).

## Neu in v0.8.0 (25.11.2026, lokal auf `feat/mockup-kitchen`)

Rückmeldung der Nutzer: das Tool ist viel geworden. Diese Fassung macht den Einstieg leichter.

- **Einfach-Modus** (`#btnSimple` in der Kopfleiste, `body.simple`, gemerkt unter `mockupkitchen.simple.v1`, Vorgabe an):
  blendet aus, was man für die ersten Entwürfe nicht braucht: Reiter Bericht, Typografie, Barrierefreiheit, Pixelraster
  und Abstände, Seitenleiste links, Feinheiten von Kopfband, Filter und Fußleiste, Engine-Wahl, Varianten,
  ChartKitchen-Optionen, Workshop-Angaben, Vergleich, TMDL-Knopf (die Ablagefläche links bleibt). Reines CSS in
  `appmode.js`, nichts geht verloren; der Schalter zeigt alles wieder.
- **Kachel-Leiste und Einrichten-Modus** (`#tileBar`, `MK.focusTile`/`MK.unfocusTile`): Ein Klick auf eine Kachel zeigt
  an ihr „Visual wählen“ und „Einrichten“. Einrichten zoomt die Kachel groß in die Mitte, der Rest der Seite tritt
  zurück; Felder zieht man von links auf die Kachel oder ordnet sie rechts den Rollen zu. „Fertig“ oder Esc führt
  zurück zum vorigen Zoom.
- **Farbschema „Klar“** (an IBCS orientiert): dritte Wahl neben Kitchen Basis und Firmenfarben, auch im Dialog „Neu“.
  Weiße Seite, flache Kacheln ohne Rahmen und Rundung, kein Logo, Akzent in Dunkelgrau, Abweichungen Grün/Rot.
  Beim Zurückschalten kommen Rahmen, Rundung, Teal/Rot und das Logo wieder.
- **Ansichten einer Seite** (`p.viewOf`, `p.viewLabel`, `MK.viewFamily`, `MK.addView`, Reiter Seite): mehrere Fassungen
  derselben Seite, z. B. Diagramm und Tabelle. Im Kopfband erscheint ein Schalter, in der Präsentation ist er
  klickbar; beim Blättern zählen Ansichten als ihre Hauptseite. Ansichten haben die Rolle `detail`. Export:
  `pages[].viewGroup`, `viewLabel`, `views[]`, Issues `VIEW_SWITCH` (Power BI: Schaltflächen mit Seitennavigation)
  bzw. `APP_VIEW_SWITCH` (Vorgabe für die App-Shell).
- **Essentials-Tour** (`tour.js`, `MK_TOUR.start('essentials'|'app')`, Knopf „Tour“ neben den Vorlagen): zehn Karten
  mit Spotlight vom Ziel über Vorlagen, Kachel einrichten, Felder, Gestaltung bis Präsentieren und Export; danach
  wahlweise die kurze App-Tour (Burger-Menü, gespeicherte Filter, Handy-Vorlage, Präsentation). Beim ersten Besuch
  erscheint unten rechts ein Angebot (`mockupkitchen.tour.v1`). Die Tour ändert nichts am Projekt.

## Neu in v0.7.2 (24.11.2026, lokal auf `feat/mockup-kitchen`)

Zwei Punkte aus dem ersten Test.

- **KPI-Karte mit mehr Inhalt** (`S.kpi` in `sketches.js`): KPI-Kacheln sind breit und flach, die Skizze fiel dort in
  den Klein-Modus (Zahl 16 px, kein Verlauf, halbe Fläche leer). Neu sind zwei Aufbauten: *flach* (große Zahl mit
  Einheit, Δ-Zeile, Vergleichsbalken AC gegen Bezug in Szenario-Notation mit Werten, Verlauf rechts) und *hoch* (Zahl,
  Δ-Zeile, Vergleichsbalken, Verlauf unten). In der Kachel zeichnet die Skizze ohne eigenen Rahmen (`o.bare`), nur der
  Status-Akzent links bleibt. Der Kacheltitel von `kpi` und `card` ist kleiner und ruhiger (Klasse `k-<kind>` an der
  Kachel), auch im PNG.
- **Farbschema** (Reiter Design, `appmode.js`): „Kitchen Basis“ oder „Firmenfarben“. Firmenfarben kommen aus einer
  Power-BI-Theme-Datei (`dataColors`, `background`, `foreground`, `tableAccent`), aus einer beliebigen Textdatei mit
  Hex-Werten (CSS, Text) oder aus einer eingefügten Liste. Zustand `design.scheme` und `design.brand { name, colors[],
  source, head?, accent? }`. Wirkung: Kopfband (erste Farbe, Schrift nach Kontrast), Akzent (erste kräftige Farbe mit
  mindestens 3:1 auf Weiß), native Visuals (`nativePalette: 'brand'`, Skizzen-Option `nativeColors`). Kopfband und
  Akzent lassen sich per Klick auf eine Farbe umstellen. Die Szenario-Notation der ChartKitchen-Skizzen bleibt
  unverändert. Export: `design.colors.brand { name, palette[], source, active }`; der Konverter nimmt die Palette als
  `dataColors` des Themes und für native Visuals (`native_palette()` in `mockup_to_pbir.py`).

## Neu in v0.7.1 (24.11.2026, lokal auf `feat/mockup-kitchen`)

Vorlagen für das Ziel Fabric App, darunter eine Handy-Vorlage im Hochformat.

- **Fünf neue Vorlagen** (`TEMPLATES` in `catalog.js`, mit Feldbindungen auf das Demo-Modell):
  `app-phone` (Handy · Übersicht), `app-hub` (Start-Hub), `app-detail` (Übersicht mit Detail-Panel), `app-pnl`
  (GuV-Cockpit, nur ChartKitchen und P&L) und `app-monthly` (Monatsgespräch). Dazu zwei versteckte Bausteine
  (`app-phone-trend`, `app-phone-list`, `hidden: true`) für die Zusatzseiten der Handy-Vorlage.
- **Vorlagen mit Vorgaben** (`setup`): Eine Vorlage kann Canvas, Ziel und Rahmen setzen (`applyTplSetup`), Zusatzseiten
  anlegen, wenn das Projekt erst eine Seite hat, und ihre Kacheln mit vorhandenen Seiten verknüpfen (`applyTplAfter`,
  Start-Hub). Der Toast nennt, was gesetzt wurde; Strg+Z nimmt alles in einem Schritt zurück.
- **Kennzeichen in der Vorlagenauswahl** (`targets`, `form`): Handy, Fabric App, Power BI; das aktuelle Ziel ist
  hervorgehoben, die Handy-Vorlage zeigt ihre Vorschau im Hochformat.
- **Handy-Format** (`canvas.base`): 1080 × 1920 mit logischer Breite 400. `ui()` rechnet `Breite / base`, also Faktor
  2,7 statt 0,84; ohne `base` gilt 1280 wie bisher. `pixelgrid.js` bleibt unberührt, `uiComp()` gleicht Rahmenmaße
  und Ränder aus. Canvas-Vorgabe „Handy · 1080 × 1920“ (`1080x1920@400`). `a11y.js` prüft Mindestgrößen mit
  demselben Faktor: die vier Karten der Handy-Vorlage sind 472 × 261 px (Warnschwelle 432 × 243), auch mit Chip-Zeile
  bleibt es ohne Befund.
- **Tab-Leiste unten** (`chrome.navPos = 'tabs'`): bis zu fünf Seiten in der Fußleiste, im Entwurf, im PNG und auf der
  Bühne (Klick wechselt die Seite). Im Hochformat steht die Steuerleiste der Bühne rechts neben der Seite.
- **Export:** `canvas.base`, `canvas.form`, `zones.footer.navPosition: "tabs"` mit `tabBar`, `app.shell.resolution:
  "phone"`.
- **Geprüft:** Pixelraster (`checkLattice`) und `gridcheck` ohne Befund für alle fünf Vorlagen, Felder vollständig
  gebunden, im Ziel App keine nicht erzeugbaren Kacheln bei Handy, Hub und GuV-Cockpit (Detail-Panel und Monatsgespräch
  enthalten je eine Text-Kachel für den Kommentar).

## Neu in v0.7.0 (24.11.2026, lokal auf `feat/mockup-kitchen`)

MockupKitchen als Workshop-Werkzeug, Design-Werkzeug und Vorlage für Rayfin-Apps. Hintergrund, Abgleich mit der
dwg cli und Vorschläge für weitere Funktionen: [`KONZEPT-APPMODUS.md`](KONZEPT-APPMODUS.md).

- **Zielmodus** (`S.target`, Export `meta.target`): Power BI, Fabric App oder Wireframe. Auswahl im Dialog „Neu“,
  über die Pille oben links und im Reiter Bericht. Fabric App setzt Burger-Menü, Kopfleiste 96 px bei Full HD und das
  12er-Pixelraster; Wireframe zeichnet in Grautönen. Modul `appmode.js` (`MK_APPMODE.applyTarget`).
- **Gespeicherte Filter** (`S.views[] = { id, name, filters }`, Reiter Zonen): Chip-Zeile unter dem Kopfband, eigene
  Zone `chips` (30 px bei 1280). Im Ziel Power BI erscheint der Hinweis „Achtung Lesezeichen“, im Export die Issues
  `BOOKMARKS_SAVED_FILTERS` und `BOOKMARKS_BURGER_NAV`.
- **Navigation im Burger-Menü** (`chrome.navPos = 'burger'`), zusätzlich zum Filter-Panel per Burger.
- **Bühne** (`stage.js`, `MK_STAGE`): Die Präsentation ist klickbar. Burger-Menü mit Seiten, gespeicherten Filtern
  und Slicern, Chips zum Wegklicken, Querfilter per Klick auf eine Kachel, Sprungziele, Doppelklick vergrößert,
  Steuerleiste unten, Tasten ← → M F R Esc. Gefiltert wird nur der Startwert der Skizzen (`MK_STAGE.shift`), der
  Zustand ist flüchtig und steht nicht im Export.
- **Typauswahl mit Schlagwort-Chips** (`MK_CATALOG.tagIds`, `tagsOf`): Zeit, Struktur, Abweichung, KPI, Tabelle,
  Anteil, Verteilung, Karte, IBCS-Notation, Nativ, Steuerung, Text und Bild. Im Ziel Fabric App zusätzlich „nur für
  das Ziel passende“; nicht erzeugbare Typen tragen ⚠ (`def.targets`).
- **Neue Typen aus ChartKitchen 1.57 und P&L 1.8.3** (63 statt 51): `stockflow`, `areastack`, `cumline`, `lineidx`,
  `scatpath`, `bubshare`, `ckpnl`, `ckmatrix`, `pnlmega`, `pnlbs`, `pnltree`, `pnlsankey`; `marimekko` hat jetzt den
  ChartKitchen-Modus `bars`. Feste Voreinstellungen je Typ in `ckFixed` bzw. `cvFixed`, wählbare in `CK_OPTS`.
- **Export:** `meta.target`, `zones.chips { views, bookmarks }`, `zones.header.burgerNav`, Block `app { shell,
  notBuildable }`, Issues `APP_SHELL_*`, `APP_NOT_BUILDABLE`. `meta.target` und `app` zählen nicht zum specHash, die
  Chip-Zeile über `zones` schon. Texte der neuen Teile in `i18n-app.js` (flache Schlüssel, nach `i18n.js` geladen).
- **KPI als ChartKitchen-Karte:** Der Konverter baut `kpi` mit Engine ChartKitchen als `cards` mit Trend statt als
  `ibcsKpiCard` (Schalter `--kpi-card ibcs` für den alten Weg). Das passt zur dwg cli, die KPI-Kacheln ebenfalls
  als ChartKitchen `cards` anlegt.
- **Für später:** Die dwg-Shell kennt weder Burger-Menü noch gespeicherte Ansichten; der Export nennt beides als
  Vorgabe. `dwg mockup import` liest `meta.target`, `app` und `zones.chips` noch nicht.

## Stand und Arbeitszweig (24.11.2026)

Der weitere Ausbau von MockupKitchen geschieht auf dem Branch **`feat/mockup-kitchen`**. Er setzt auf `origin/main`
(69b3ba1) auf und führt drei Stände zusammen, die vorher verstreut lagen:

- `origin/main` mit der dort veröffentlichten 0.6.0 (ChartKitchen 1.47: Streudiagramm mit Engine ChartKitchen,
  `chartKitchenProps`, selbst gehostete Schriften, gemeinsame Navigation),
- das lokale `main` mit 0.6.0 live, 0.6.1 und 0.6.2 (Live-/Agent-Modus, `live.js`, `mockup-live/`, Seitenrolle),
- `feat/mockup-pixelgrid` (Pixelraster als Modul, Abschnitt unten).

Die Versionsnummer **0.6.0 gibt es deshalb zweimal** mit verschiedenem Inhalt (online: ChartKitchen 1.47, lokal: Live-Modus);
maßgeblich ist jetzt 0.6.2 mit beidem. Entscheidungen beim Zusammenführen:

- Skizzen-Optionen laufen über `MK.sketchOpts()` (lokal); die ChartKitchen-Optionen (`ckSketchOpt`, online) fließen dort ein,
  Bildschirm, PNG-Export und Vorschau im Kachel-Reiter zeichnen also dasselbe.
- KPI-Verlauf: die Skizze beachtet beide Schalter, `o.spark` (kein Zeitfeld gebunden) und `o.trend` (Option `cardTrendChart`).
- Spec-Hash zählt Seitenrolle (≠ nav) und `chartKitchenProps`.
- Konverter: beim Zusammenführen blieb `kpi` mit Engine ChartKitchen zunächst `ibcsKpiCard`. **Entschieden am
  24.11.2026:** `kpi` wird als ChartKitchen `cards` mit Rolle `trend` gebaut (ab ChartKitchen 1.47). `ibcsKpiCard`
  bleibt als Schalter (`--kpi-card ibcs`, `MK_KPI_CARD=ibcs`); der Live-Runner setzt ihn vorerst selbst, bis ein
  Desktop-Lauf die ChartKitchen-Karte dort bestätigt hat.
- Nichts davon ist gepusht. Das lokale `main` und `feat/mockup-pixelgrid` bleiben unverändert stehen.

Tests auf diesem Stand: `pixelgrid-test` 49, `gridcheck-test` 8, `a11y-test` 30, `diff-test` 48, `fmtinfo-test` 37,
Skill `run_tests.py` 620 von 620. Nächster Schritt laut `KONZEPT-PIXELRASTER.md`: Stufe 2 (Einrasten beim Ziehen,
„Pixelgenau machen“, Skill wertet `canvas.pixel` aus).

## Pixelraster als gemeinsames Modul (20.10.2026)

- **`pixelgrid.js`** setzt Stufe 1 aus `KONZEPT-PIXELRASTER.md` als reines Rechenmodul um: `zones()` (Raster als
  Standard, `{legacy: true}` = fester Rand wie 0.6.2, byte-gleich, Test über 384 Fälle), `solveMargins()`, `line()`
  (Ganzzahl-Brüche, BigInt), `place()` und `placeFrac()`, `layout()` (Baum und Grid im Pitch-Raum), `cellOf()` und
  `transfer()` (Seite pixelgenau in eine andere Auflösung), `slicerStack()`, `inside()`, `lines()`, `pixelBlock()`,
  Chrome-Vorlagen `MOCKUP_CHROME` und `DWG_CHROME`. Typen in `pixelgrid.d.ts`. Die API folgt der ersten dwg-Fassung
  (`dwg/layout/pixelgrid.mjs` der Showcase-Runde), damit deren Aufrufer und Tests unverändert bleiben.
- **Eine Quelle für zwei Werkzeuge:** MockupKitchen lädt die Datei per `<script>` vor `gridcheck.js` und `app.js`
  (`window.MK_PIXELGRID`). Die dwg cli (Repo Fabric-Apps-Demo) erzeugt daraus mit `dwg mockup build` ihr ES-Modul
  `dwg/layout/pixelgrid.mjs` (Inhalt unverändert plus Export-Zeilen) und holt `gridcheck.js`, `a11y.js` und den
  Konverter des Skills `mockup-to-powerbi` nach `dwg/mockup/vendor/`. Warum hier: MockupKitchen ist ein Browser-Tool
  ohne Build und kann nichts aus dem dwg-Repo laden; dwg hat schon den Weg „aus dem Kitchen-Repo bauen“ (`dwg visuals
  build`) und prüft per Manifest, dass niemand die geholten Dateien von Hand ändert. Änderungen also nur hier.
- **Rastermodus im Tool:** Design > Abstände > „Pixelraster“ (aus · 12er-Raster). Mit Raster lösen sich die Ränder
  (Basis 18), die Lesezeile zeigt Rand, Zwischenraum, Spalten- und Zeilenschritt; die Rand-Eingabe ruht. Zustand
  `S.pixel = {mode: 'lattice', n: 12}`, Export `canvas.pixel` und `visuals[].cell` (Brüche), beides ohne Einfluss auf
  den specHash. Standardprojekt FHD: KPIs 27/423/819/1215, 378 × 167, Hauptzeile 1038 + 510 wie im Konzept.
- **`gridcheck.checkLattice(rects, lat)`:** Befunde `OFF_LATTICE` (Kante 1 bis 3 px neben einer Linie j/12 bzw. j/24),
  `NOT_FLUSH` (Außenkante knapp nicht am Inhaltsrand), `OUTSIDE_CONTENT`. Freie Linien wie 1/5 bleiben erlaubt.
- **Tests:** `node assets/mockup/pixelgrid-test.js` (alle Tabellenwerte aus Abschnitt 3, Sweep 320 bis 4000 px),
  `node assets/mockup/gridcheck-test.js`. `a11y.js` exportiert für Node zusätzlich per `module.exports`.
- **Offen (Stufe 2):** Einrasten beim Ziehen, Split-Dialog mit „±1 px“-Badge, Mindestgröße 48k, „Pixelgenau machen“
  mit Gewichten aus den sichtbaren Pixeln (ohne das verschiebt das Einschalten Kacheln um bis zu 6 px), Skill-Seite
  (Toleranz 0, NONINT, `--resnap`).

## Neu in v0.6.2 (stabiler Stand)

Führt den Live-Zweig (v0.6.0, v0.6.1) mit den Punkten aus dem Persona-Review (v0.5.5, v0.5.6) zusammen.

- **Seiten sortieren (v0.6.1, Kundenfeedback):** Reiter in der Seitenleiste per Ziehen umstellen; im Reiter „Seite" eine
  Liste „Alle Seiten" zum Ziehen, mit ↑/↓ für die Tastatur.
- **Seitenrolle:** je Seite *Navigation* (Standard), *Detailseite* oder *Drillthrough*. Detail- und Drillthrough-Seiten
  stehen nicht in Kopfband-, Fußleisten- und linker Navigation, tragen ein Abzeichen am Reiter und werden vom Skill in
  Power BI ausgeblendet (`visibility: HiddenInViewMode`). Export: `pages[].role` und `pages[].hidden`, Brief-Hinweis je
  Seite, Prüfung `DRILL_NO_SOURCE`. Der PBIR-Import liest ausgeblendete Seiten als Detail-, Drillthrough-Bindungen als
  Drillthrough-Seite. Im Spec-Hash zählt die Rolle nur, wenn sie vom Standard abweicht (gleiche Regel in `export.js`
  und `mockup_spec.py`, im Browser gegen Python nachgerechnet).
- **Zusammengeführt:** Botschaftszeile, Sortierung, Top-N und leere Kennzahl laufen über `tileGeom`/`sketchOpts`, damit
  Bildschirm, PNG, Vergleichsbild (Live) und Export-Analyse gleich rechnen. TMDL-Import: Modellname aus
  `database.tmdl`/`model.tmdl`, dann Projektname (Live), dann `*.SemanticModel`-Ordner, sonst Abfrage.

## Neu in v0.6 für alle (auch ohne Live-Modus)

Die Live-Oberfläche erscheint nur mit `?live=1` (Schalter, siehe `mockup-live/BETA.md`). Für alle Nutzerinnen und Nutzer
geändert hat sich nur, was die Skizze ehrlicher macht (Praxistest 02.10.2026, Befund B3):

- **KPI-Kachel (`kpi`):** Die Verlaufslinie erscheint nur, wenn das Zeitfeld (Rolle „Zeit (Sparkline)") gebunden ist. Ist
  nur die Hauptkennzahl gebunden, gibt es keine Linie, so wie Desktop es zeigt. Ohne jede Bindung bleibt die
  Platzhalter-Skizze mit Linie. Ohne gebundenen Bezug gibt es weiter keine Δ-Zeile.
- **Tacho (`gauge`):** Die Zielnadel erscheint nur mit gebundenem Ziel.
- **Spec:** neues Feld `display.drawn.sparkline` (`true`/`false`); der Konverter setzt daraus `showSparkline` der
  KPI-Karte (`ibcsKpiCard`).

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
- **ChartKitchen 1.47 (v0.6.0):** *Streudiagramm / Bubble* hat jetzt die Engine ChartKitchen (`CK_MODE.scatter = 'scatter'`, Vorgabe für neue Kacheln; native `scatterChart` bleibt Alternative, gespeicherte Kacheln behalten ihre Engine). Rollen-Schlüssel `x`, `y`, `size` bleiben, beschriftet als X-Achse, Y-Achse · AC und Blasengröße; der Skill bildet sie auf `xValue`, `actual`, `bubbleSize` ab. *KPI-Kachel:* das optionale Zeitfeld (Schlüssel `category`) heißt „Trend (Zeit)" und geht im Skill in die ChartKitchen-Rolle `trend`. *ChartKitchen-Optionen* je Kachel (Klappgruppe im Reiter „Kachel", nur bei Engine ChartKitchen, Katalog `CK_OPTS`): KPI Mini-Chart Sparkline/Säulen/aus und Kartenwert letzter Wert/Summe, Brücke Ausrichtung automatisch/Balken/Säulen, Scatter Quadranten Mittelwert/Median/aus. Zustand `v.ckProps` (nur bewusst gewählte Werte), Export `visuals[].chartKitchenProps` mit aufgelösten Werten, nur bei Engine `ck` (zählt zum specHash, nur wenn vorhanden), AGENT-BRIEF-Zeilen „ChartKitchen-Optionen" und „ChartKitchen-Rollen", Stände vergleichen erkennt die Optionen. *Skizzen* folgen der Wahl: KPI mit Sparkline oder Säulen, ohne Zeitfeld ohne Verlauf; Brücke waagerecht (`auto`/`bars`, wie ChartKitchen) oder als Säulen-Kaskade; Scatter mit Quadranten-Kreuz (Ø/Md) und Blasen nur mit gebundener Größe. Ohne diese Optionen sind alle Skizzen byte-identisch zu 0.5.6.
- **Sofort-Punkte aus dem Persona-Review (v0.5.6, `REVIEW-2026-10-09.md`):** *Skizze* zeigt Sortierung und Top-N aus dem Analyse-Block (Balken, Kombi, Bullet, Punktdiagramm, Tabelle, Varianzen, native Balken/Säulen; Top-N wählt wie der Konverter nach dem Wert), die Kernaussage als Botschaftszeile unter dem Titel (Bühne, Präsentation, PNG), eine KPI-, Karten- oder Tacho-Kachel ohne Kennzahl zeigt „?" und „Kennzahl fehlt" statt einer Zahl, die Legende von `bars` nur gezeichnete Szenarien (R7, R16). *Bedienung:* Eine gewählte Kachel holt den Reiter „Kachel" nach vorn (R8); Doppelklick auf Kopfband, Filter und Fußleiste öffnet die Zonen wieder, das Zahnrad ist dauerhaft sichtbar (R9); Teilen, Entfernen, Tauschen, Rollen setzen und entfernen und der Wechsel der Umsetzung melden sich mit Namen und Knopf „Rückgängig", Strg+Z und Strg+Y sagen, was sie zurücknehmen, die Undo-Knöpfe sind ohne Verlauf deaktiviert. *Hilfe:* Tooltips an allen Bedienelementen, Analyse-Feldern, Datenrollen, Szenario-Optionen, Umsetzungen und Badges; Hilfe-Abschnitt „Begriffe", Verbinden und Rand-„+" erklärt, vollständige Tastaturliste, F1 und ? öffnen die Hilfe. *Export:* Der Dialog öffnet auf dem Prompt; Seitenbilder ohne Feldnamen und Notizsymbole, zwei Schalter blenden sie ein. *Modell:* Name aus `database.tmdl`/`model.tmdl` oder dem `*.SemanticModel`-Ordner, sonst Abfrage, per Klick änderbar (R20); Formatklartext liest `+`/`-` als Vorzeichen statt als Einheit (R22, `fmtinfo-test.js`). *Skill:* Ladetexte und Demo-Modelle werden in `te -m` zum Platzhalter `<Modell>.SemanticModel` mit Hinweis, Namen ohne Endung bekommen `.SemanticModel`. Favicon eingebunden.
- **Fixes aus dem Persona-Review vom 09.10. (v0.5.5, `REVIEW-2026-10-09.md`):** *R1* Die Namensregel für die Szenario-Rollen des GuV-Visuals griff seit v0.4 nie (in `catalog.js` standen Backspace-Steuerzeichen statt `\b`), Referenzen wurden der Reihe nach verteilt und BU landete als Vorjahr im Bericht. Jetzt Lookarounds auf Buchstaben (erkennt auch `PL2`, `FC1` bis `FC3`, `AC_PY`, nicht mehr „Monthly“ oder „Supply“), eine geratene Zuordnung meldet der Export als `CV_ROLE_GUESS`, und `mockup_to_pbir.py` warnt bei alten Exporten mit vertauschten Buckets. *R2* `render-png.js` benennt Seitenbilder wie `export.js` und der Skill (`page-1-Ubersicht.png`), die PowerPoint des Skills bettet sie wieder ein; alte Namen findet `mockup_to_docs.py` weiterhin. *R3* `meta.specHash` ist aus der Spec nachrechenbar, `--validate` prüft ihn; reine Protokoll-Angaben im Steckbrief (bestätigt, Owner, Quelle, Zielwert, Notiz, DAX-Kommentar, offene Frage) zählen nicht mehr zum Bau-Hash. *R4* Kacheltypen ohne Referenz-Rolle exportieren keine Δ-Basis und Δ-Art mehr, Typen ohne Kennzahl-Rolle (Slicer) keine Polarität; der AGENT-BRIEF schreibt sie dort nicht mehr hin. Das ändert den Hash solcher Kacheln einmalig. *R5* „Neu“ behält das geladene Modell (vorher wurde ein TMDL-Import still durch das Demo-Modell ersetzt).
- **Verbinden hält die Achsen (v0.5.4, Tester-Feedback):** Ist eine Seite ein verschachtelter Baum (Spalten mit Zeilen oder umgekehrt), überführt ein Klick auf „+" sie zuerst pixelgenau in ein echtes Raster (`pageToGrid`, Spuren über `MK_PBIR.solveRects`, höchstens 2 px Versatz beim Umstellen) und verbindet dann die beiden Zellen am „+". Damit geht Verbinden waagerecht und senkrecht über Gruppengrenzen hinweg, und keine andere Kachel verschiebt sich. Lässt sich die Seite nicht exakt als Raster darstellen, bleibt das bisherige Verhalten.
- **DAX im Kennzahlen-Steckbrief (v0.5.3):** Der TMDL-Import liest die DAX-Formel von Measures und berechneten Spalten (einzeilig, mehrzeilig, ```-Blöcke), dynamische Formate und den Anzeigeordner. Der Steckbrief zeigt Formel, Beschreibung und das Format in Klartext mit Beispiel (Modul `fmtinfo.js`, `MK_FMTINFO.describe`), dazu ein Kommentarfeld zu Berechnung und Beschreibung und die gewünschte Darstellung. Export: `fields[].expression/formatDescription/formatWish/formatWishString/daxComment` u. a.; Brief und Workshop-Doku bekommen den Abschnitt „Definitionen und Kommentare" mit DAX-Codeblöcken.
- **Review-Fixes (v0.5.2):** 43 Befunde aus `REVIEW-2026-09-25.md` behoben, in fünf Gruppen. *Modell und Felder:* Szenario-Wechsel meldet eine unpassende Referenz-Kennzahl und bietet im Panel Tauschen, Szenario übernehmen oder Δ-Basis automatisch an, die KPI-Skizze folgt der gebundenen Referenz, Export-Issue `SCENARIO_REF_MISMATCH` (B2, B13); gebundene Felder, die nach einem TMDL-Neuimport fehlen, stehen rot in der Gruppe „Fehlt im Modell" und gehen als `missing: true` mit Issue `FIELD_NOT_IN_MODEL` in den Export (B3); ein neues Feld in einer unbekannten Tabelle fragt nach (Tippfehler oder neue Tabelle), `newFields[].newTable`, Issue `NEW_FIELD_NEW_TABLE` (B26); Abbrechen des Rollen-Menüs legt nichts ab, Esc schließt es (B15, B36). *Barrierefreiheit und Darstellung:* Fokusfang in offenen Dialogen mit sichtbarem Fokusring, Esc zum Abwählen lässt den Fokus auf der Seite (B4, B42); alle Dialoge mit `aria-labelledby`, Icon-Buttons mit `aria-label` (B29, B30); „Export für Claude Code" mit AA-Kontrast (B43); Kacheltitel und Eyebrow auf dunklem Kachelgrund lesbar, Kontrasthinweis im Design (B5); Hinweis „Bitte am Desktop öffnen" auf Handy-Breite, Topbar bei 1280 und 1366 px in einer Zeile, Zoom-Anzeige frei (B6, B38, B39); Notiz-Popup nicht mehr gequetscht oder abgeschnitten (B47). *Raster:* Greifen eines Zwischenraums zieht die Spur, verbunden wird erst per Klick (B17); „Rand anpassen" nur bei Bedarf, übersetzt, mit Wert im Label, Rückfrage für alle Seiten und Neuprüfung aller Seiten (B10, B21); bewusst gesetzte Spaltenbreiten gelten nicht mehr als „fast gleich" (B23); „Inhalt neu aufteilen" fragt, bevor Visuals wegfallen, und weist ungültige Werte ab (B16, B32); das Rand-„+" hält die Mindestgröße der Kacheln ein (B49). *Export und Vergleich:* eine Versionskonstante `MK_VERSION` in `app.js` für Kopfzeile, `meta.version`, AGENT-BRIEF und WORKSHOP-DOKU (B7); Export-Dialog nennt je Seite native und ChartKitchen-Visuals und erklärt leere `pbir-visuals`-Dateien (B1); Text-Kacheln nicht mehr als `textbox` in der Tool-Datei (B25); Kopieren meldet eine verweigerte Zwischenablage (B33); Markdown-Exporte mit sauberer Verhaltenszeile, Seitennamen in den Hinweisen und entschärftem Nutzertext (B34, B35, B50); Stände vergleichen erkennt Kachel-Ecken und weitere Design-Felder, spricht Fachsprache statt interner Werte, übersteht Seiten-Umbenennungen und setzt Anführungszeichen je Sprache, Node-Test `diff-test.js` (B44, B45, B46, B41). *Texte und Sprache:* Öffnen fragt mit „Speichern und öffnen" und „Verwerfen und öffnen" (B8); Text-Kacheln zeigen ihren Inhalt in Canvas, Präsentation und PNG (B14); der Sprachwechsel übersetzt unveränderte Standardtexte und das Demo-Modell samt Bindungen, auch in PNG und Visual-Picker (B27, B28, B40, B11); der erste Klick nach dem Tippen in eine Notiz geht nicht mehr verloren (B12); Tooltip von „Neu" beschreibt die Startseite (B37); Verlauf mit 200 Schritten und ehrlicher Meldung am Ende (B48). Offen für das Konzept Pixelraster: B18 bis B20, B22, B31; B24 bleibt offen, B9 ist so gewollt.
- **Fix „Ausrichten" (v0.5.1):** Die Überführung Baum → Raster legte Zeilen mit weniger Kacheln in die ersten Spalten (Löcher, Hauptdiagramm der Standardvorlage schrumpfte von 2/3 auf 1/4). Jetzt: jede Linie wird in Pixeln ausgelegt, Spalten entstehen zwischen den Zwischenräumen aller Linien (Abstand < 1,2 % bzw. 3 px → zusammengelegt), Spurgewichte = Spurbreiten in px. Ergebnis in allen Vorlagen: keine Löcher, Kacheln bleiben auf ±1 px, nur fast fluchtende Kanten werden bewusst zusammengezogen.
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
| `studio.js` | Arbeitsbereich „Visual einrichten“ (ab 0.9.0): ganzseitiger Dialog je Kachel mit Feldern, Vorschau, Rollen, Darstellung und „Das kann dieses Visual“ |
| `pixelgrid.js` | Pixelraster: Zonen, Ränder, Linien, Kacheln aus Brüchen; gemeinsam mit der dwg cli (Test `pixelgrid-test.js`) |
| `gridcheck.js` | Raster prüfen und ausrichten, `checkLattice()` für den Rastermodus (Test `gridcheck-test.js`) |
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
