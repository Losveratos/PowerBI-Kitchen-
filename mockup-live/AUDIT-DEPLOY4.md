> Stand 01.10.2026 · Paket 0b aus `PLAN-V2.md`. Audit des Deploys 4 (29.09.2026, 00:49 bis 00:56) an `Desktop\MockupLive-Test`.

# Audit Deploy 4: Kitchen gegen Desktop

## Grundlage und Vorgehen
- **Kitchen-Bild:** Der Kitchen-Stand wurde aus `mockup/mockup-spec.json` (specHash `9e79e5b2`, gleich wie `.state/last-applied-spec.json`) rekonstruiert. Das Kitchen kann keine Spec öffnen (`#fileOpen` verlangt einen gespeicherten Zustand mit `layout`), deshalb wurde der Zustand aus `layoutTree`, `visuals`, `zones`, `design` und `spacing.base` nachgebaut. Das Modell kommt per TMDL-Import aus dem Testprojekt. Kontrolle: alle 4 Kachel-Rechtecke und die Zonen stimmen pixelgenau mit der Spec überein, die Analyse (Polarität, Δ-Basis) ebenso. Gerendert wurde mit `MK_PNG.pagePng` (render-png.js) in 1920 × 1080. Kitchen-Version beim Rendern: 0.5.4, Export war 0.5.3. Die Skizzen nutzen dieselben Seeds (Kachel-IDs), sind also das Bild, das Michael gesehen hat.
- **Desktop-Bild:** `shots/4` (Seite FitToPage, Faktor 0,529, Seite liegt bei x 0 bis 1015, y 114 bis 685). `shots/5` zeigt leere ChartKitchen-Visuals (Desktop neu gestartet, Custom Visuals nicht freigegeben) und wurde nur zur Kenntnis genommen.
- **Dateien:** Der aktuelle Bericht ist byte-gleich mit `backup/5`, also mit dem Stand nach Deploy 4. Deploy 5 hat nichts geändert.
- **Gegenprobe Konverter:** Der heutige Konverter (HEAD) lief zusätzlich in den Scratch-Ordner (`audit/conv-now`), damit klar ist, was seit dem Deploy schon behoben ist.
- `pbir validate --fields` auf einer Kopie des Berichts: gültig. Die Abweichungen sind also keine Schemafehler, sondern Fehler in der Umsetzung.

Bilder (Scratch, nebeneinander: links Kitchen, rechts Desktop hochskaliert):
`<Scratchpad>\audit\sbs\` (lokaler Arbeitsordner, nicht im Repo)

| Bild | Inhalt |
|---|---|
| `IBCS_Testbed__page.png`, `Seite_1__page.png` | ganze Seite |
| `IBCS_Testbed__kzpdyen.png`, `__dpfod5i.png`, `__gtnf74b.png`, `Seite_1__9txmfza.png` | je Kachel |
| `<Seite>__chrome_header.png`, `__chrome_filter.png`, `__chrome_footer.png` | Rahmen |

Kitchen-Renders allein: `audit\kitchen\*.png` (render-png) und `*_dom.png` (Bildschirmansicht). Skripte: `audit\render_kitchen.py`, `audit\side_by_side.py`.

Ursachen-Kürzel: **K** Konverter (`mockup_to_pbir.py`), **R** Runner (`live_runner.py`), **NM** nicht gemappt, **KI** Kitchen selbst (Skizze oder Export), **D** Desktop-Grenze oder Daten.

## Seite „IBCS Testbed" (`pageIBCS`)

| Kachel | Kitchen zeigt | Desktop zeigt | Ursache | Fix-Idee |
|---|---|---|---|---|
| **MonthName** `mk_kzpdyen` (kombi → CK `columns`) | Säulen AC gegen PL (Umriss), darüber ΔPL und ΔPL %. Chips AC, PY (gestrichelt: Szenario passt nicht), PL. Σ-Zeile rechts oben | Gleicher Aufbau, aber die Rollen sind vertauscht: `plan` = `_Measures.PY`, `previousYear` = `_Measures.PL`. Beschriftet ist „ΔPL", gerechnet wird aber gegen PY (+106 % in jedem Monat). Die Dreiecke tragen die PY-Markierung, sind aber PL | **K** Zuordnung `ref[i]` nach Position. Seit 416c802 (01:38, nach dem Deploy) geht sie nach Namen. Der HEAD-Lauf mappt richtig, ist aber noch nicht deployt | Neu deployen. Regressionstest „ref = [PY, PL]" im Konverter |
| | Δ-Basis: Die Skizze zeigt ΔPL (Szenario AC/PL), die Analyse sagt `deltaBasis: PY` (auto aus `ref[0]`) | `chart.comparisonMode` ist nicht gesetzt, also „auto" | **NM** + **KI** (Kitchen widerspricht sich selbst) | `comparisonMode` aus `deltaBasis` schreiben (`py`/`plan`), `showAbsoluteVariance`/`showRelativeVariance` aus `deltaKind`. Im Kitchen sollte die Skizze dieselbe Basis wie `analysisOf` nehmen |
| | Nur AC und PL gezeichnet, PY ist gebunden, aber nicht zu sehen | AC, PL-Umriss und PY-Dreiecke | **KI** Die Skizze ignoriert die zweite Referenz | Die Skizze zeigt alle gebundenen Szenarien (Dreieck für PY) |
| | Kein Untertitel | Eigene CK-Kopfzeile „AC in M · Jan – Dez: AC vs. PL, PY", Fußnote „Summe weicht rundungsbedingt ab" | **NM** (`ibcsTitle`, `labels.sumSafeRounding`) | Im Kitchen als Kopfzeile darstellen oder `ibcsTitle.show` bewusst setzen. Achtung: HEAD schreibt jetzt `ibcsTitle.kpi = Titel`, das kann den Titel doppeln (prüfen) |
| | Beschriftung 13,5 px (Typo „chart 9" × 1,5), Zahlen ohne Einheit | Beschriftungen deutlich kleiner, Einheit M (Auto) | **NM** `typography.labelPt` steht im Slot, wird aber nicht geschrieben | `labels.fontSize` (oder `fontScale`) aus dem Slot setzen |
| | 6 Monate Beispieldaten | 12 Monate, Okt bis Dez ohne AC | **D** Echte Daten | Keine Abweichung |
| | Titel 18 px, Rahmen, Radius 12, weiß, Position 15/99/838×457 | Titel 13,5 pt (= 18 px), Rahmen #E5E7EB, Radius 12, Position gleich, z 10 | ok | Rahmenfarbe siehe Rahmen |
| **Kosten** `mk_dpfod5i` (multiples → CK `columns` + `multiples`) | 6 Panels (Nord, Süd …) mit AC gegen PL-Umriss und Δ % je Panel | 4 Panels „1, 2, 3, 4" (RegionKey), nur AC, Σ je Panel, Beschriftung auf den Säulen | **KI** Die Skizze zeigt eine Referenz und Δ % ohne gebundene `ref`. **D** RegionKey ist numerisch, die Beispielnamen täuschen | Die Skizze zeichnet nur gebundene Szenarien, die Facettennamen aus dem Feld (Schlüssel = Zahlen). Optional ein Hinweis „keine Referenz gebunden" |
| | Polarität „lower" (Kosten) | `chart.invert = true` | ok | – |
| | – | „AC"-Zeilenlabel, Ausklapp-Symbol je Panel, Rundungsfußnote | **NM** (`multiplesTotal`, `multiplesSameScale`, `labels.*`) | In FIDELITY.md (0a) aufnehmen |
| **AC** `mk_gtnf74b` (wfint → CK `intwaterfall`) | **Horizontaler** Struktur-Wasserfall: PL, PY, Regionen als Balken mit Δ-Spalte, ΔPL % als Nadeln rechts, AC-Summe | **Senkrechte** „Integrierte Brücke (Zeit)": PY, PL, Treppe je Region, AC, oben ΔPL % mit +67,4 % bei **jeder** Region (für eine Struktur-Kategorie unsinnig) | **K/Katalog** `wfint → intwaterfall` (`catalog.js` Z. 159, `mockup_spec.py` Z. 74). CK hat keine waagrechte Brücke, und `intwaterfall` ist für Monate gedacht | Struktur-Kategorie auf `catbridge` mappen (Kategorie-Brücke). Die Kitchen-Skizze von wfint senkrecht zeichnen wie CK, oder das Label ehrlich machen |
| | Rollen Region, AC, PL, PY | `plan` = PL, `previousYear` = PY | ok (zufällig richtige Reihenfolge) | – |
| | Δ-Basis PL | Schalter ΔPY / ΔPL, ΔPL aktiv | ok | – |
| | – | CK-Kopfzeile „AC in M · APAC – North America …", „PL → AC · Brücke + Monatssäulen", Schalter, Abspielknopf | **NM** (`ibcsTitle`, `chartButtons`) | wie oben |

## Seite „Seite 1" (`c84aaf283cd327268e4e`)

| Kachel | Kitchen zeigt | Desktop zeigt | Ursache | Fix-Idee |
|---|---|---|---|---|
| **Säulen** `e1b0858b01a0175d62dd` (aus dem Bericht übernommen, CK `columns`, keine Rollen) | Kachel mit Rahmen und Radius, Skizze (Δ-Balken und Säulen gegen Referenz), kein Titel (Titel leer), roter Punkt (Pflichtrollen leer) | CK-Platzhalter „ChartKitchen byDatenWG · Beispieldaten — füge Category und Ac…" ohne Titel und ohne Kitchen-Rahmen. z 0 | **D** Ohne Felder zeigt CK seinen Platzhalter (erwartbar). **R** Bei übernommenen Visuals schreibt der Delta-Lauf nur die Position: Container-Stil bleibt absichtlich (`ORIGIN_KEEP_PREFIXES`), Titel und `orientation` gelten als „unverändert", weil die Baseline denselben Stand hat. z bleibt 0 | Die Baseline als „Kitchen-Interpretation" behandeln, nicht als Ist-Stand im Bericht: beim ersten Deploy einer Kachel den Stil des Kitchens schreiben, wenn der Mensch das bestätigt (Deploy ist führend). z aus der Spec setzen |
| | Spec-Titel = Label „Säulen (AC vs Referenz)", das Kitchen zeigt aber keinen Titel | kein Titel | **KI** `buildSpec` füllt `title` mit dem Label, auch wenn die Kachel keinen Titel zeigt | Export: `title` leer lassen oder ein Feld `titleShown`. Sonst schreibt ein künftiger Runner einen Titel, den das Kitchen nie zeigte |
| | Position 39/99/227×236 | gleich | ok | – |
| **Leere Zellen** `dng4ymz` (8 px breit!), `o6i2xtg`, `auq9pme` | schraffierte Platzhalter „Visual wählen …" | nichts | **D** erwartbar. **KI** Der 8-px-Streifen ist ein Import-Artefakt: Das Raster aus der Originalposition x = 10 wurde übernommen | MK_PBIR: Spuren unter Rand/Zwischenraum verwerfen statt als Zelle anzulegen |

## Rahmen (beide Seiten gleich)

| Element | Kitchen zeigt | Desktop zeigt | Ursache | Fix-Idee |
|---|---|---|---|---|
| Kopfband-Titel und -Untertitel | „MockupKitchen to Power BI", „Values for 2026" | **unsichtbar** (Shapes sind da, Text steht in `objects.text`) | **K** `chrome-batch.json` setzt `text.text/fontSize/…`, aber nie `text.show = true`. Der Schalter ist bei Shapes standardmäßig aus (`pbir schema describe shape text` kennt `show`). Auch in HEAD noch so | `"text.show": true` für jede Text-Shape (Titel, Untertitel, Fußleiste, Platzhalter) |
| Fußleiste | Band mit Oberlinie #E3E1D8, Text „Test for Fabcon" | kein Band, keine Linie, Text unsichtbar | **K** gleicher Fehler mit `text.show`. Für Band und Linie der Fußleiste baut der Konverter keine Shape | `chrome_footer_bg`/`chrome_footer_rule` analog zum Kopfband |
| Seitenhintergrund | #F4F4F1 | #F7F7F7 (Theme-Vorgabe), `page.json` ohne `objects.background` | **R** `pbir pages background` läuft nur bei `design_changed or fresh`. Basis war `baseline-spec.json`, deren `design` die Kitchen-Vorgabe ist (identisch mit der Spec), beide Seiten standen schon in der Baseline → Schritt übersprungen. Der Befehl selbst funktioniert (auf einer Kopie getestet) | Hintergrund gegen den Ist-Stand in `page.json` prüfen, nicht gegen die Baseline. Beim ersten Deploy immer setzen |
| Filter-Panel Fläche | #ECEBE5 | #F1F3F5 | **K** fester Wert `--panel` statt Kitchen-Farbe | Farbe aus der Spec exportieren (`design.colors.panel`) und übernehmen |
| Slicer | 3 kompakte weiße Kästen (ca. 40 px, Rahmen #D9D6CC), Feldname einmal | 3 Slicer je 84 px (y 96/192/288): Container-Titel **und** Slicer-Kopf zeigen den Namen doppelt, Dropdown transparent auf dem Panel | **K** Slicer-Kopf nicht ausgeschaltet, Höhe fest 84 px, kein Kasten-Stil | `header.show = false` (oder den Container-Titel aus), Höhe und Abstand aus dem Kitchen-Raster, Hintergrund/Rahmen wie die Kitchen-Kästen |
| Kopfband-Linie, Kachelrahmen | warmes Grau #E3E1D8 / #E1DFD6 | #E5E7EB (kühles Grau) | **K** feste Vorgaben (`--tile-border`) | Farben aus der Spec (`design.colors`) exportieren und übernehmen |
| Navigation | aus | aus | ok | – |
| Desktop-Filterbereich | – | Der Filterbereich von Power BI ist offen und nimmt ein Viertel des Fensters | **D** Desktop-Oberfläche | Optional per Berichtseinstellung ausblenden. Für Screenshots ist `pbir desktop screenshot` ohne Bereich besser |
| Ausgeblendete Titel der Shapes | – | Titel `'FuÃŸleiste'` (Mojibake, sichtbar im Auswahlbereich) | **R** `add visual --from-json` liest die UTF-8-Datei des Runners als cp1252. Auf einer Kopie reproduziert. Mit `ensure_ascii=True` wird es korrekt, eine BOM lehnt pbir ab | In `_from_json` `json.dump(..., ensure_ascii=True)` schreiben |
| tabOrder | – | alle 0 | **R/K** nicht gesetzt | tabOrder aus der Lesereihenfolge der Spec |

## Ursachen nach Gewicht (sichtbarer Schaden zuerst)

1. **Text-Shapes ohne `text.show`** (K, noch in HEAD): Kopfband-Titel, Untertitel und Fußleistentext fehlen auf allen Seiten. Das fällt als Erstes auf und ist eine Zeile im Konverter.
2. **Szenario-Rollen vertauscht** (K, in HEAD seit 416c802 behoben, noch nicht deployt) und **Vergleichsbasis nicht gemappt** (NM): Die Kombi rechnet „ΔPL" gegen PY. Dazu der Widerspruch im Kitchen selbst: Die Skizze zeigt ΔPL, die Analyse sagt PY.
3. **wfint auf `intwaterfall` gemappt** (Katalog/K): Statt eines waagrechten Struktur-Wasserfalls kommt eine senkrechte Zeit-Brücke mit unsinnigen ΔPL % (+67,4 % in jeder Region). Besser `catbridge`, und die Kitchen-Skizze passt sich an CK an.
4. **Runner vergleicht gegen die Baseline statt gegen den Bericht** (R): Seitenhintergrund nie gesetzt. Übernommene Visuals bekommen weder Titel noch Stil, `orientation` oder z, weil die Baseline denselben Stand hat wie die Spec. Die Baseline ist die Kitchen-Deutung, nicht der Ist-Zustand.
5. **Filter-Panel weicht ab** (K): Slicer-Namen doppelt, 84 px hoch, andere Panel-Farbe, kein Kasten-Stil.
6. **Kitchen-Skizzen zeigen mehr oder anderes als gebunden** (KI): Small Multiples mit Referenz und Δ % ohne `ref`, die Kombi ohne die gebundene PY. Dazu Beispiel-Facetten mit Namen, wo der Schlüssel eine Zahl ist. Desktop kann das so nicht liefern.
7. **CK-Eigenheiten nicht gemappt** (NM): eigene Kopfzeile (`ibcsTitle`), Rundungsfußnote, Schalter, Beschriftungsgröße (`labelPt` liegt im Slot, wird nicht geschrieben), Einheit M. Desktop sieht dadurch voller und kleiner aus als das Kitchen.
8. **Farbtöne aus festen Vorgaben** (K): Rahmen, Linien und Panel kühlgrau statt der warmen Kitchen-Töne. Fußleisten-Band und -Linie fehlen ganz.
9. **Kleinigkeiten:** Mojibake über `--from-json` (R), Spec-Titel = Label bei titellosen Kacheln (KI), 8-px-Importzelle (KI), tabOrder 0.
10. **Keine Mängel** (D): Platzhalter ohne Felder, echte statt Beispieldaten (12 Monate, Regionen APAC …), Desktop-Filterbereich, leere Kitchen-Zellen.

Was stimmt: Positionen und Größen aller Kacheln und Rahmenzonen (pixelgenau), Visual-Typ ChartKitchen, Kategorie- und AC-Bindungen, `invert` bei Kosten, Kachel-Hintergrund, Radius 12, Titelgröße 13,5 pt = 18 px, Kopfband-Fläche und -Linie, Reihenfolge der Ebenen (Rahmen 0/1/4, Inhalt 10).
