> Ergebnis eines Designpanels vom 25.09.2026: vier unabhängige Entwürfe (Löser, Workshop-Bedienung, Power-BI-Treue, minimale Änderung), drei Jurys (Pixelgenauigkeit, Bedienbarkeit, Umsetzungsrisiko), ein Angreifer mit Gegenbeispielen. Sieger: Linienraster im Pitch-Raum. Noch nicht umgesetzt.

# Empfehlung: pixelgenaue Verteilung in MockupKitchen

## 1. Kernidee
Heute rundet jeder Split seinen Pixelrest selbst, deshalb laufen Zeilen um 1 bis 6 px auseinander. Neu wird jede Kante als Bruchteil einer gemeinsamen Linie berechnet und pro Seite nur einmal auf ein ganzes Pixel gerundet. Den unvermeidbaren Rest nehmen die Außenränder auf (höchstens ±3 px). Sie werden so gewählt, dass die Fläche durch 12 teilbar ist. Damit sind Kanten, Zwischenräume und die Bündigkeit mit dem Inhaltsrand immer exakt. 1, 2, 3, 4, 6 und 12 gleiche Spalten oder Zeilen sind auf das Pixel gleich.

## 2. Die Regel
Die Eingaben bleiben wie bisher: k = clamp(W/1280; 0,6; 3,2) und R(x) = floor(x + 0,5). Neu gilt g = R(12·k) und m0 = R(18·k), die Basis für den Rand wird also **18** statt 16. Z ist die Fläche nach Kopf, Fuß, Filter und Nav. zones() bleibt dafür unverändert, nur mit Rand 0.

**a) Ränder:** einmal pro Bericht und Achse berechnet, nie gespeichert.
- mL liegt in [m0-3; m0+3], mR ist mL oder mL+1. Daraus folgt der Schritt P = Z.w - mL - mR + g.
- Pflicht: P mod 12 = 0. Das ist immer lösbar, solange m0 ≥ 3, denn 13 aufeinanderfolgende Randsummen treffen jeden Rest.
- Gibt es mehrere Lösungen, gilt diese feste Reihenfolge, unabhängig vom Seiteninhalt:
  1. P mod 24 = 0, damit halbierte KPIs exakt werden,
  2. symmetrische Ränder,
  3. kleinste Abweichung von m0.

**b) Brüche statt Pixel:** Ein Split mit den Gewichten w1..wn über [A; B] gibt Kind i den Bereich [A + (B-A)·C(i-1)/S; A + (B-A)·C(i)/S]. Dabei ist C(i) die Teilsumme der Gewichte und S ihre Summe. Grids rechnen genauso über cols und rows. Die Gewichte sind ganze Zahlen und bedeuten „Kachel plus ein Zwischenraum“.

**c) Linie:** L(n/d) = floor((2·n·P + d) / (2·d)). Das ist reine Ganzzahl-Arithmetik und liefert in JS und Python dasselbe. Python-round() darf dafür nicht verwendet werden.

**d) Kachel:** x = content.x + L(a) und w = L(b) - L(a) - g. Für y gilt dasselbe.

Das ist durch die Konstruktion garantiert:
- Gleicher Bruch heißt gleiches Pixel, über Zeilen und Verschachtelungsebenen hinweg.
- Jeder Zwischenraum ist genau g.
- Die erste und letzte Kachel sind bündig mit dem Inhaltsrand.
- Eine Spanne von j/12 ist immer j·P/12 - g breit.

## 3. Werte je Canvas (Basis Rand 18, Zwischenraum 12, 12er-Raster, per Skript geprüft)

**Standard-Chrome, Filter rechts:**

| Canvas | k | g | Rand L/R/O/U | Inhalt | Spaltenschritt | 1 Spalte | KPI (3 Sp.) | Zeilenschritt | halbe KPI |
|---|---|---|---|---|---|---|---|---|---|
| HD 1280×720 | 1 | 12 | 18/18/20/20 | 1044×600 | 88 | 76 | 252 | 51 | 120\|120 |
| FHD 1920×1080 | 1,5 | 18 | 27/27/27/27 | 1566×906 | 132 | 114 | 378 | 77 | 180\|180 |
| UHD 3840×2160 | 3 | 36 | 54/54/54/54 | 3132×1812 | 264 | 228 | 756 | 154 | 360\|360 |
| 4:3 1280×960 | 1 | 12 | 18/18/20/20 | 1044×840 | 88 | 76 | 252 | 71 | 120\|120 |
| Hoch 1080×1920 | 0,844 | 10 | 16/17/13/14 | 878×1826 | 74 | 64 | 212 | 153 | 101\|101 |
| 1366×768 | 1,067 | 13 | 19/19/17/18 | 1115×647 | 94 | 81 | 269 | 55 | 128\|128 |
| 1600×900 | 1,25 | 15 | 22/23/23/24 | 1305×753 | 110 | 95 | 315 | 64 | 150\|150 |

**Ohne Filter:**

| Canvas | Rand L/R/O/U | Spaltenschritt | 1 Spalte | KPI | halbe KPI |
|---|---|---|---|---|---|
| HD | 16/16/20/20 | 105 | 93 | 303 | ±1 px |
| FHD | 27/27/27/27 | 157 | 139 | 453 | ±1 px |
| UHD | 54 rundum | 314 | 278 | 906 | 435\|435 |
| 4:3 | 16/16/20/20 | 105 | 93 | 303 | ±1 px |
| Hoch | 17/17/13/14 | 88 | 78 | 254 | 122\|122 |
| 1366 | 17/18/17/18 | 112 | 99 | 323 | 155\|155 |
| 1600 | 21/22/23/24 | 131 | 116 | 378 | ±1 px |

**Standardprojekt FHD, heute und neu:**
- Heute: KPIs bei x = 25/422/819/1216, Breite 379, Höhe 178. Der Check meldet EDGE_NEAR.
- Neu: KPIs bei x = 27/423/819/1215, Breite 378, Höhe 167. Hauptzeile 1038 + 510.

Geprüft über 7 Canvas × 5 Chrome-Varianten × 10 Vorlagen: 0 Kanten-, Spalt- oder Bündigkeitsfehler. Im Sweep über 14.724 Konfigurationen (alle Breiten 320 bis 4000) war das 12er-Raster immer lösbar, bei höchstens 3 px Randabweichung.

## 4. Was der Nutzer sieht und tut
- **Design > Abstände:** Auswahl „Pixelraster: 12 (Standard) · 10 · 8 · aus“. Darunter eine Lesezeile, z. B. „Rand 27 · 27 · 27 · 27 · Zwischenraum 18 · Spalte 132 (114 + 18) · Zeile 77“.
- **Statusbadge neben dem Zoom:** grün „Pixelgenau · Raster 12“, gelb bei Info-Befunden, grau „Raster aus · Pixelgenau machen“.
- **Zwischenraum ziehen:**
  - Das Raster wird eingeblendet, auch mit der Taste G.
  - Die Kante rastet auf j/12 ein und magnetisch auf Linien anderer Zeilen.
  - Ein Tooltip zeigt z. B. „8 | 4 Spalten · 1038 | 510 px“.
  - Mit Shift wird frei gezogen. Die Kante bleibt trotzdem bündig und der Spalt exakt. Frei gezogene Splits werden gelb markiert und bekommen einen Chip „ins Raster“.
- **Split-Dialog:** Anzahlen 1 bis 6, 8, 10 und 12. Anzahlen, die nicht aufgehen, tragen ein Badge „±1 px“.
- **Mindestgröße 48k px:** Sie wird hart vor jedem Teilen, Ziehen oder Einfügen geprüft.
- **„Rand anpassen“ entfällt**, weil die Ränder automatisch gelöst werden. „Ausrichten“ rastet nur noch nahe Linien ein.

## 5. Export und Skill (Power BI bekommt dasselbe)
**export.js:**
- Die Rechtecke gehen unverändert durch, sie sind bereits ganzzahlig.
- Neu: `canvas.pixel` {mode, n, pitchX, pitchY, gutter, margins l/r/t/b}, eine `cell` pro Visual und ganzzahlige layoutTree-Gewichte statt toFixed(3).
- Die Breite des Burger-Overlays kommt aus der Zone, statt neu gerechnet zu werden.

**Skill** (alles nur, wenn der pixel-Block vorhanden ist):
- Toleranz 0.
- Ganzzahl-Prüfung statt Abschneiden mit int().
- k exakt aus W und Rundung mit R(x). Python-round() weicht bei 933 von 3.681 Breiten ab.
- Einzug der Kopf- und Fußtexte = mL.
- Slicer-Stapel aus dem Raster: Einzug gleich Rand, Abstand g, Oberkante auf content.y. Er wird einmal als `zones.filter.slicers[]` exportiert und von export.js, render-png und Skill gelesen.
- Padding und Rahmen explizit auf allen Kacheln, keine Visual-Gruppen.

**mockup_verify:**
- Rohwerte vergleichen. near() castet heute mit int(), deshalb bestehen 27,6 und 27 sogar bei Toleranz 0.
- Neue Befunde: NONINT (Position nicht ganzzahlig) und parentGroupName (Visual in einer Gruppe) wird abgelehnt.
- Optional `--resnap --dry-run` über `pbir visuals position`, danach `pbir validate --fields`.

**Brief für Autoren:**
- „Spalte j beginnt bei content.x + j·pitchX“.
- In Desktop „Objekte am Raster ausrichten“ ausschalten.
- Pixel nur in „Tatsächliche Größe“ prüfen. Optional schreibt der Skill displayOption ActualSize.

## 6. Fälle ohne exakte Lösung
- **Gleiche Gruppen, deren Anzahl 12 nicht teilt** (5, 7 oder 9 Spalten, Achtel bei P mod 24 ≠ 0): Kanten, Spalten und Bündigkeit bleiben exakt, nur die Breiten weichen um ±1 px ab. Beispiel FHD mit 5 Spalten: 299/299/298/299/299. Das wird als Info-Befund OFF_LATTICE_EQUAL mit diesem Muster gemeldet.
- **„Raster 10“** wird nur angeboten, wenn berichtsweit mehr Gruppen exakt werden als brechen.
- **Basisrand unter 3 px:** Der Rand bleibt fest. Der Rest geht in die angrenzende Chrome, also Filter oder Nav, Kopf oder Fuß, höchstens ±6 px. Gibt es auf der Achse keine Chrome, gilt der Rückfall auf ±1 px.
- **Vorlage kpi4-2x2 bleibt 1:4:** Die Detailzeilen weichen um ±1 px ab und werden als Info gemeldet. 1:5 wäre zwar immer exakt, unterschreitet aber mit Filter oben die A11Y-Mindesthöhe (FHD 122 < 135).

## 7. Umsetzung
1. **Stufe 0, ohne Geometrieänderung:**
   - mockup_verify.py: near(), NONINT, parentGroupName, --resnap.
   - Canvas-Breite und -Höhe bei der Eingabe runden (app.js:760).
   - Burger-Overlay aus der Zone (export.js:86).
2. **Stufe 1, Geometrie hinter `S.pixel = {mode:'lattice', n:12}`:** Fehlt der Block, bleibt alles byte-identisch wie heute.
   - Neues Modul `assets/mockup/pixelgrid.js` (solveMargins, spans, Lpx, place), rein funktional und in Node testbar.
   - zones(), layoutRects() und computeAll() nutzen es im Rastermodus.
   - gridcheck.check() bekommt NOT_FLUSH, die Prüfung „gleicher Bruch, gleiche Linie“ und OFF_LATTICE_EQUAL. Die Toleranz von EDGE_NEAR skaliert mit g.
   - Das Zurückschreiben der Ränder in gcMargin entfällt.
   - defaultState: Basisrand 18, Rastermodus an.
   - „Pixelgenau machen“ als ein Undo-Schritt mit Vorschau über diff.js.
   - Tests in `assets/mockup/gridcheck-test.js`.
3. **Stufe 2, Bearbeiten und Export:**
   - Drag-Handler (app.js:458-477), splitLeaf, insertEdge, Split-Dialog, Badge und Rasterüberlagerung.
   - export.js buildSpec.
   - Die Skill-Änderungen hängen am pixel-Block. Ohne diese Kopplung ändern sich 4 Referenzdateien (Goldens) in v3-typo-filter.

## 8. Risiken und Befunde des Angreifers
- **Migration (hoch):** Alte Gewichte dürfen nicht umgedeutet werden, sonst werden die KPIs 386/386/366/386 breit. Beim Einschalten werden die Gewichte aus den sichtbaren Pixeln gebaut (w = Kachel-px + g). Die Verschiebung beträgt dann 2 bis 4 px. Ein Regressionstest sichert ab: was vorher gleich breit war, bleibt gleich breit.
- **Kleiner Rand (hoch):** gelöst über den Chrome-Ausgleich aus Abschnitt 6. Die Garantie ist formal auf m0 ≥ 3 beschränkt.
- **Alltägliche Teilungen (mittel):** Der feste Vorrang für P mod 24 macht halbe KPIs exakt in 7.984 von 14.724 Konfigurationen und in allen Presets mit Filter rechts.
- **Negative Kachelgrößen (mittel):** verhindert durch die harte Mindestgröße.
- **Strenge Rasterprüfung (mittel):** Sie würde die Standardvorlage melden. Deshalb prüft sie nur Linien, die gleiche Gruppen bilden oder über Zeilen fluchten. 1/5 ist eine freie Linie.
- **Slicer, FitToPage, Raster 10 (mittel):** siehe Abschnitte 5 und 6. Die Zusage lautet: exakt in der Datei. Auf dem Bildschirm gilt das nur bei tatsächlicher Größe (ActualSize).
- **Ungleiche Ränder zwischen x und y (niedrig):** Mit Basis 18 sind die Ränder bei FHD und UHD rundum gleich. Im Sweep haben aber nur 586 von 14.724 Konfigurationen vier gleiche Ränder. Ein Ausgleich über Kopf- und Fußhöhe wäre eine Option, kein Standard.
- **Nahe Kanten verschiedener Brüche mit 1 bis 3 px Abstand (niedrig):** Beim Teilen in Zellen zieht ein 3-px-Magnet sie zusammen.
- **Wachsende Nenner bei freiem Ziehen (niedrig):** BigInt verwenden oder die Gewichte auf 1/12.000 begrenzen.
- **Offen:**
  - Desktop speichert nach jedem Anfassen Kommazahlen (3.610 von 6.724 Visuals), die Rastergröße beim Einrasten ist undokumentiert. Dafür gibt es --resnap.
  - Ob Rahmen innen oder außen gezeichnet werden und wie groß der Tastatur-Schritt ist, lässt sich nur per Screenshot-Test in Desktop klären.

Die Prüfskripte liegen in `C:\Users\MICHAE~1\AppData\Local\Temp\claude\C--Users-MichaelTenner-Desktop-Daten-WG-Knowlegde-Kitchen\71120346-b50f-4444-bfdd-53d1d88962e9\scratchpad\pixel\final\`: `final.js`, `tpl2.js` und `sweep.js`. Keine Repo-Datei wurde geändert.
