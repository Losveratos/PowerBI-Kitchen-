# IBCS-Gap-Check · ChartKitchen byDatenWG

**Prüfobjekt:** Power-BI-Custom-Visual „ChartKitchen byDatenWG", Version **1.44.0.0** (07.10.2026), Repo-Ordner `ibcsInspiredChartDeck/`
**Prüfdatum:** 16.10.2026
**Maßstab:** IBCS® Standards 1.2 (SUCCESS-Formel, semantische Notation UN 1–5, CHECK, SIMPLIFY, CONDENSE, EXPRESS) in der verdichteten Fassung des Skills `ibcs-charts`
**Art der Prüfung:** reine Analyse, am Code wurde nichts geändert

## Methode

- **Code-Lektüre:** `src/visual.ts` (9 749 Zeilen), `src/settings.ts` (Defaults), `capabilities.json`, `AGENT-GUIDE.md`, `CHANGELOG.md`, dazu der Vorgänger-Audit `AUDIT-2026-07.md`.
- **Render-Harness:** `npm run test:render` lief ohne Fehler („render ok"). Jeder der 132 vorhandenen Testfälle wurde mit Playwright/Chromium einzeln abfotografiert.
- **Zusatzfälle:** Sechs eigene Fälle wurden mit demselben Bundle gerendert (Datei `extra.html` im Scratchpad):
  - x1: Blau/Orange-Preset
  - x2: Titel maximal befüllt
  - x3: Einheiten-Mix
  - x4: zwei Instanzen auf einer Seite
  - x5: Δ%-Ausreißer
  - dazu Graustufen-Renderings (S/W-Druck-Simulation)
- **Beleg-Screenshots:** `audit-ibcs-NN-*.png` im selben Ordner wie dieser Report (Index im Anhang).
- **Grenzen der Prüfung:**
  - Der Harness ist nicht Power BI Desktop. Die Lokalisierung wird dort gestubbt, deshalb erscheinen einzelne Hinweise englisch („Totals may differ due to rounding", „Other (9)", „largest driver").
  - Theme, Schrift und Pixeldichte können im Service abweichen.
  - Befunde, die nur im Rendering sichtbar sind, sind je einmal belegt.
  - Code-Befunde sind mit Datei:Zeile belegt.

> **Vorbemerkung zur Einordnung:** Das Visual bezeichnet sich korrekt als „inspired by IBCS" (Rebranding 1.31, CHANGELOG Z. 634 ff.) und ist **nicht IBCS-zertifiziert**. Für einen Konzern-Einkauf ist das der wichtigste Satz: Die Kern-Notation ist auf Zertifizierungsniveau, das Gesamtpaket aber (noch) nicht.

> **Korrektur zur Aufgabenstellung:** Die Doppellinie an der Achse steht in IBCS für **PL/BU** (Referenz = Plan), nicht für PY. Eine **dicke hellgraue Vollachse** steht für **PY** (UN 4.1). Das Visual setzt genau diese Zuordnung um (siehe E-5). Gestrichelte Achsen unter FC-Perioden sind keine explizite IBCS-Regel, sondern eine zulässige Zusatzkennzeichnung des Visuals.

---

## Kurzfazit für den Einkauf

1. **Stark:** Die Szenario-Notation (AC dunkel, PY hellgrau, PL Umriss, FC schraffiert) ist in allen Kernmodi sauber umgesetzt, die Farbwerte entsprechen 1:1 den IBCS-Referenzwerten.
   - Hinzu kommen die mehrstufigen Varianz-Charts (ΔPL/ΔPL% über der Basis), die Achsen-Notation der Referenz, Wasserfälle mit Konnektoren, Kommentar-Nummerierung, Top-N + Rest, Small Multiples, Hochkontrast und Dark Mode.
   - Für ein Power-BI-Visual ist das ungewöhnlich weit.
2. **Größte Lücken für ein Konzern-Reporting:**
   - **(a) Titelkonzept:** Es fehlt die Zeile „Berichtseinheit" (wer); Titel und Message sind nicht IBCS-gemäß angeordnet.
   - **(b) Skalen-Integrität:**
     - Varianz-Panels sind gegenüber der Basis überhöht.
     - Es gibt keine Skalierungsindikatoren zwischen Instanzen einer Seite.
     - Δ%-Ausreißer werden in den Chart-Modi nicht gekappt.
   - **(c) Zahlen und Einheiten:**
     - Werte und Varianzen werden im selben Chart unterschiedlich skaliert.
     - Statt „n.a." erscheint ein Prozentwert bei negativer Basis.
     - Es werden „K€/M€" statt „kEUR/mEUR" ausgegeben.
   - **(d) Modusübergreifende Inkonsistenzen:** Pin-Köpfe und Pin-Achsen sehen je nach Modus unterschiedlich aus. Das verletzt das UNIFY-Prinzip.
3. **Hausfarbe statt IBCS-Grün:** Gut ist Teal `#1E8F9E` statt IBCS-Grün. Das ist **vertretbar** und per Picker oder Theme änderbar. Es gibt aber zwei Schwächen:
   - Gut und Schlecht sind in Graustufen praktisch **nicht unterscheidbar** (Luminanzkontrast 1,14 : 1).
   - Das Blau/Orange-Preset nutzt Blau, das in IBCS „neutral" bedeutet.
4. **Seit dem Juli-Audit offen:** Die dort als „IBCS-Paket" empfohlenen Punkte sind auch zehn Versionen später **offen** (Status-Tabelle in Abschnitt 4). Die Releases 1.35–1.44 haben Funktionsumfang und UX erweitert, aber keinen dieser Notationspunkte geschlossen.

**Prioritäten-Legende:**
- **hoch:** Ein Konzern-Controlling oder ein IBCS-geschulter Prüfer bemerkt den Punkt sofort, oder er kann zu Fehlinterpretation führen.
- **mittel:** Sichtbare Abweichung, aber per Setting umgehbar oder selten.
- **niedrig:** Kosmetik oder Nice-to-have.

---

## 1 · ERFÜLLT (IBCS-konform umgesetzt)

| # | Element | IBCS-Regel | Beleg |
|---|---|---|---|
| E-1 | **Szenario-Farben 1:1 IBCS** | UN 3.2: AC `#404040` solid, PY `#B3B3B3` solid hell, PL weiß + dunkler Rand | `settings.ts:902-919` (AC `#404040`, PY `#B3B3B3`, PL `#404040` als Rahmen); Screenshot 01, 02 |
| E-2 | **FC schraffiert** | UN 3.2: diagonale dunkle Streifen auf Weiß, umrandet | Hatch-Pattern 45°, Ink auf Papier: `visual.ts:2331-2342`; Varianzen unter FC ebenfalls schraffiert (gut/schlecht); Screenshot 01, 02, 32 |
| E-3 | **Überlappende Szenario-Gruppen** | UN 3.2: AC im Vordergrund, Referenz versetzt dahinter | PL-Umriss bzw. PY-Säule versetzt hinter AC: `visual.ts:7298-7303`; Screenshot 01, 32 |
| E-4 | **Szenario-Dreiecke für PY** bei drei Szenarien | UN 4.1: Scenario triangles | `chart.pyTriangle` (Default an, `settings.ts:436-441`); graue ▶ in Screenshot 01, 06 |
| E-5 | **Referenzachse codiert den Subtrahenden** (Columns/Bars/Line) | UN 4.1: hellgraue Vollachse = vs PY, Doppellinie = vs PL | `drawBaseline` `visual.ts:8831-8864` (PY: grau 3 px; PL: zwei Linien ±1,2 px); Screenshot 02 (ΔPL-Panels Doppellinie, ΔPY-Panels graue Vollachse) |
| E-6 | **FC-Zeitraum an der Kategorienachse gekennzeichnet** | Zusatz zu UN 3.2 (keine Pflichtregel) | Achsen unter FC-Perioden gestrichelt, AC/FC-Trennlinie: `visual.ts:7362-7378`; Screenshot 01, 32 |
| E-7 | **Mehrstufiges Varianz-Chart** (ΔPL% über ΔPL über Basis) | EX 1.1 / CO 4: „AC/PL columns below, ΔPL bars and ΔPL% pins above, aligned per period" | `splitPanels` `visual.ts:8775-8810`; Doppel-Varianz ΔPL + ΔPY (`dualVariance`); Screenshot 01, 02 |
| E-8 | **Absolute Varianz als Säule/Balken, relative als Pin** | UN 4.1 | Screenshot 01, 03, 11 |
| E-9 | **Varianzfarben nach Business-Impact inkl. Invertierung** | UN 4.1: grün = positive Wirkung, rot = negative | `cfg.isGood` mit globalem `invert` und KPI-genauem `invertList`: `visual.ts:2193-2199`; Screenshot 03 (Kosten invertiert: Mehrkosten rot) |
| E-10 | **Varianz-Füllung = Minuend** (AC solide, FC schraffiert, PL umrandet) | UN 4.1 | Columns/Bars: FC-Varianzen schraffiert (Screenshot 01); GuV-Statement-Sichten AC / AC&FC / PL (Testfälle c51–c53); Pins im GuV-Modus solid/schraffiert/umrandet: `visual.ts:4048-4051` |
| E-11 | **Varianz-Labels außen in Wachstumsrichtung, „+" bei positiven Abweichungen** | UN 4.1 / UN 1 | `fmtSigned` `visual.ts:1247-1249`, `fmtPercent` 1251-1257; Screenshot 01 |
| E-12 | **Datenlabels statt Werteachse und Gitter** | SI 3.1 | Keine Werteachse, keine Gitterlinien im Chart-Default; Screenshot 01, 03 |
| E-13 | **Nullbasierte Werteachse** bei Säulen und Balken | CH 1.1 | `extent()` verankert immer bei 0: `visual.ts:335-343` |
| E-14 | **Zeit horizontal, Struktur vertikal** | UN 3.3 / UN 3.4 | Modi `columns` und `bars`, Smart-Start schlägt bei Text-Kategorien „bars" vor (CHANGELOG 1.42) |
| E-15 | **Kategorienlabels horizontal**, nie gedreht | UN 2.3 | Keine `rotate()` für Achsentexte im Code (nur in Hatch-Patterns) |
| E-16 | **Wasserfall-Konnektoren** und Kaskade | EX 1.1 | GuV-Wasserfall, Integrierte Brücke, Kategorie-Brücke und Bridge-Tier mit dünnen Konnektoren; Screenshot 04, 06, 08 |
| E-17 | **Differenz-Marker** | UN 5.1 | Gesamtabweichung als roter/teal Balken plus Pill (−42 / −28 / +83); Screenshot 06, 08. Zwei-Klick-Vergleich (`compareClick`) für beliebige Paare |
| E-18 | **EMPHASIZE / Hervorhebung** | UN 5.1: Hilfsflächen zum Hervorheben | `chart.highlight` als Band plus fettes Label in **allen** Modi seit 1.42 (Hochkontrast: Rahmen); Screenshot 01 (Jul), 09 (Süd, Export) |
| E-19 | **Kommentare nummeriert und verknüpft** | UN 2.4 | ①②③ im Chart plus Fußnoten-Spalte; Screenshot 01 |
| E-20 | **Ausreißer-/Skalenbruch-Marker an gekappten Balken** | UN 5.3 / CH 2.1: Bruchsymbol plus echter Wert | `drawCapMarker` ⫽ `visual.ts:8670-8693`; Screenshot 03 (Deutschland 5400, Frankreich 3100 gekappt bei 3000 mit Bruch und echtem Label). KPI-Bullet mit Bruch-Marker bei Zoom: Screenshot 22 |
| E-21 | **Δ%-Pins im GuV-Statement gekappt mit Ausreißer-Pfeil** | UN 5.3 | `P_CAP = 100`, „▸▸" plus echter Wert: `visual.ts:3909`, `4038-4057` |
| E-22 | **Small Multiples mit gleicher Skala** (Columns/Bars) | CO 5.1 / CH 4.1 | Screenshot 26 (4 Regionen, gemeinsame Skala, Größenunterschiede sichtbar) |
| E-23 | **Gestapelte Säulen: unterstes Segment in AC-Farbe, darüber Grauabstufungen, Summe oben** | UN 3.2 | Screenshot 27 |
| E-24 | **Top-N + Rest, absteigend sortiert, Rest unten** | EX 1.1 | Testfall c5 |
| E-25 | **AC + FC im selben Monat als Split-Säule** (solider Sockel, schraffierter Aufsatz) | UN 3.2: AC&FC | Screenshot 29 (Juli) |
| E-26 | **Vorläufiges Ist** (dünne Überlager-Schraffur) | Erweiterung, konsistent mit „Füllen beim Materialisieren" | Screenshot 32 (Jul) |
| E-27 | **Keine verbotenen Charttypen** (Torte, Tacho, Radar, 3D, Ampel als Hauptaussage) | EX 2 | Orientierungs-Enum `settings.ts:19-32`. Pareto, Dumbbell und Slope sind als Nicht-IBCS-Typen mit grauem Untertitel gekennzeichnet (Screenshot 24) |
| E-28 | **Schlichtes Design** | SI: weißer Hintergrund, eine serifenlose Schrift, keine Schatten oder 3D | `FONT` Segoe UI → Helvetica → Arial: `visual.ts:35` |
| E-29 | **Σ-Kopf mit Gesamtabweichung abs + rel, Rundungshinweis, Σ-treue Rundung** | CO / CH | Screenshot 01 („Σ 12,7M€ ΔPL +171,0K€ · +1,4%"), `labels.sumSafeRounding` |
| E-30 | **Hochkontrast-Modus** | Barrierefreiheit (keine IBCS-Regel, aber Konzern-Pflicht) | Palette wird erzwungen; gut solide, schlecht hohl: `visual.ts:2200`, `7675`; Screenshot 13 |
| E-31 | **Farbfehlsicht-Preset Blau/Orange** | UN 4.1: Ersatzfarben bei Farbfehlsicht | `variancePreset = blueOrange` (`#2C7BB6` / `#E66101`): `visual.ts:2201-2214`; Screenshot 14. Bewertung der Grenzen siehe T-4 |
| E-32 | **Wesentlichkeitsschwelle** (unwesentliche Abweichungen grau) | Ersatzfarbe Grau, UN 4.1 sinngemäß | `materialityAbs` / `materialityPct`; Screenshot 31 |
| E-33 | **Hausbegriffe statt Kürzel** (Ist, VJ, Budget, Prognose) konsistent in Titeln, Köpfen und Tooltips | UN 1: ein Glossar je Organisation | `labels.labelAc..labelFc`, `scenL` `visual.ts:2244-2257` |
| E-34 | **Theme-Farben übernehmbar** (Konzern-CI) | — | `colors.useTheme`: `visual.ts:2180-2182`; Screenshot 28 (Theme-Grün) |

---

## 2 · TEILWEISE / ABWEICHEND

### T-1 · Varianzfarben-Default: Teal statt IBCS-Grün · **mittel**

- **IBCS-Regel:** UN 4.1 (grün = positiv, rot = negativ, blau = neutral). Referenzwerte: `#8CB400` / `#FF2600`. Bei Farbfehlsicht ist Blaugrün als Ersatz vorgesehen. Ohne Farbe gilt: rot → dunkelgrau, grün → hellgrau.
- **Ist-Zustand:**
  - Default Gut = `#1E8F9E` (DatenWG-Teal), Schlecht = `#D64541` (`settings.ts:923-935`).
  - Picker und Theme erlauben IBCS-Werte (Screenshot 17 mit `#8CB400` / `#FF2600`).
- **Bewertung:** Die Wahl ist **bewusst und fachlich vertretbar**. Teal liegt nahe am IBCS-Ersatz „Blaugrün" und ist für Rot-Grün-Schwäche besser als `#8CB400`. Zwei Schwächen bleiben:
  - **(1) Graustufen:** Teal und Rot haben fast identische Luminanz (0,224 vs. 0,189, Kontrast **1,14 : 1**; Rec.-601-Graustufe ≈ 111 vs. 112). Im S/W-Druck verschwindet die Gut/Schlecht-Unterscheidung vollständig (Screenshot 15). Lesbar bleiben nur noch Richtung und Vorzeichen.
  - **(2) Verwechslung mit Neutral:** Teal kann von IBCS-geschulten Lesern als „neutral blau" gelesen werden.
- **Umsetzungsidee:**
  - Ein Preset „IBCS-Standard" (`#8CB400` / `#FF2600`) neben „DatenWG" und „Blau/Orange" anbieten.
  - Zusätzlich ein Preset „S/W-Druck" nach IBCS-Fallback (gut = hellgrau `#B3B3B3`-nah, schlecht = dunkelgrau) mit klarem Helligkeitsabstand.

### T-2 · Varianz-Panels nicht im Maßstab der Basis · **hoch**

- **IBCS-Regel:** UN 4.1: „Variance columns/bars: same width and **same scale** as base". CH 4.1: gleiche Einheit = gleiche Skala.
- **Ist-Zustand:**
  - Jedes Panel erhält einen festen Flächenanteil (rel 0,34 / abs 0,38 / Basis 1,0: `visual.ts:8784-8789`) und eine eigene Domäne (`makePanelScale(domains.abs, panels.abs…)` `visual.ts:7340`).
  - Eine Abweichung von +55 k€ wird dadurch etwa so hoch wie eine Basissäule von 0,3–0,4 M€ (Screenshot 01).
  - Bei einem Ausreißer (+400 bei Basis 100) dominiert der ΔPY-Balken das Chart (Screenshot 20).
  - Es gibt keinen Hinweis auf die Überhöhung. `scale.fixedVarMax` synchronisiert nur Varianz-Panels untereinander, nicht mit der Basis.
- **Umsetzungsidee:**
  - Eine Option „Varianz im Basismaßstab" (Default an für Konzern-Presets) einführen.
  - Bleibt die Überhöhung, an der Panel-Überschrift einen Skalierungsindikator ergänzen (z. B. „ΔPL ×4" oder ein Skalierungsband nach UN 5.2).

### T-3 · Pin-Köpfe uneinheitlich zwischen den Modi · **mittel**

- **IBCS-Regel:** UN 4.1: Pin-Kopf trägt die Füllung des **Minuenden** (AC solide, FC schraffiert, PL umrandet); der Stiel trägt die Impact-Farbe. UNIFY/ST 1: Gleiches muss gleich aussehen.
- **Ist-Zustand:** Sechs Varianten in einem Visual:

  | Modus | Kopf | Beleg |
  |---|---|---|
  | Columns / Bars / Line | rund, **Impact-Farbe**; FC **hohl** (= PL-Notation) | `visual.ts:7675-7683`, `7721-7729` |
  | GuV-Wasserfall CT 12 | rund, Impact-Farbe, ohne FC-Unterscheidung | `visual.ts:2911` |
  | Integrierte Brücke | eckig dunkel, FC schraffiert ✓ | `visual.ts:3136-3139` |
  | Kategorie-Brücke | eckig dunkel, immer AC | `visual.ts:3561`, `3565` |
  | Tabelle | eckig dunkel, FC **hohl** | `visual.ts:4963-4965` |
  | GuV-Statement | solide / schraffiert / umrandet ✓ | `visual.ts:4048-4051` |

- **Beleg:** Screenshot 01 (farbige Rundköpfe, FC hohl) gegen Screenshot 10 und 06 (dunkle Quadrate, FC schraffiert).
- **Umsetzungsidee:**
  - Einen zentralen Helfer `pinHeadFill(p)` nach der GuV-Statement-Logik einführen und in allen Modi nutzen.
  - `pinStyle` bestimmt dann nur noch die Form.

### T-4 · Blau/Orange-Preset: semantische Kollision und überschätzte S/W-Tauglichkeit · **mittel**

- **IBCS-Regel:** UN 4.1: **Blau = neutral**. Bei Farbfehlsicht gilt grün → blaugrün.
- **Ist-Zustand:**
  - Das Preset nutzt Blau `#2C7BB6` für **gut** (`visual.ts:2209`). Ein IBCS-Leser liest es als „neutral".
  - CHANGELOG 1.39 (Z. 173-175) verspricht Unterscheidbarkeit „bei Achromatopsie und im S/W-Druck über die Helligkeit". Gemessen: Luminanz 0,181 vs. 0,254, Kontrast **1,32 : 1**. In Graustufen sind beide Töne kaum unterscheidbar (Screenshot 16).
- **Umsetzungsidee:**
  - Für „gut" ein Blaugrün und für „schlecht" ein deutlich helleres Orange wählen; Zielkontrast ≥ 2 : 1 zwischen beiden.
  - Die CHANGELOG-Aussage relativieren, bevor sie in Einkaufsunterlagen landet.

### T-5 · Titelkonzept: einzeilig, ohne Berichtseinheit, Message unter dem Titel · **hoch**

- **IBCS-Regel:**
  - UN 2.2: 3-zeiliger Titel. Zeile 1 = Berichtseinheit (wer), Zeile 2 = **Messgröße** fett + Einheit regular und Dimension (was), Zeile 3 = Zeit / Szenarien / Varianzen (wann).
  - SA 3.2 / UN 2.1: Die **Message steht als oberste Headline** über dem Titel.
- **Ist-Zustand:**
  - `drawTitleBlock` (`visual.ts:8059-8105`) schreibt **eine** Zeile: „**Umsatz** in M€ · Jan – Dez: AC, FC vs. PL, PY".
  - Die Message erscheint kursiv, kleiner (11 px) und **unter** dem Titel (`visual.ts:8094-8102`).
  - `ibcsTitle` kennt nur `show`, `kpi`, `period`, `message`, `autoMessage`, `footer` und `filterFooter` (`capabilities.json:133 ff.`). Es gibt **kein Feld für die Berichtseinheit**.
  - Erfüllt: Messgröße fett, Einheit regular, Szenarien benannt.
  - Screenshot 17 zeigt das Maximum, das per Settings erreichbar ist.
- **Umsetzungsidee:**
  - Neues Property `ibcsTitle.unit` (Berichtseinheit, optional aus Feldrolle/Filterkontext) und Layout-Enum `titleLayout = oneLine | ibcs3`.
  - Die Message wird als oberste, fette Zeile über dem Titelblock gesetzt.

### T-6 · Zeitraum-Slot im Titel bei Strukturmodi · **mittel**

- **IBCS-Regel:** UN 2.2: Zeile 3 enthält nur Zeit und Szenarien; Strukturdimensionen gehören in Zeile 2 („by countries"). Zeitspannen werden mit „..": `Jan..Dez` notiert.
- **Ist-Zustand:**
  - `period = \`${first} – ${last}\`` wird auch für Pareto, Slope und Brücken gesetzt (`visual.ts:8067-8069`).
  - Ergebnis: „Umsatz · Deutschland – Portugal: AC" (Screenshot 24), „Produkt A – Service: AC vs. PY" (Screenshot 07).
  - Zeitspannen verwenden „–" statt „..".
- **Umsetzungsidee:** Den Auto-Zeitraum nur bei Datums- oder Zeit-Kategorien setzen, die Notation „Jan..Dez" verwenden und bei Strukturmodi „nach ‹Kategoriename›" in Zeile 2 schreiben.

### T-7 · Einheiten und Skalierung uneinheitlich innerhalb eines Charts · **hoch**

- **IBCS-Regel:** UN 1: eine Einheit je Objekt; maximal 3 Ziffern im Chart (4 in Tabellen); Präfixe k/m/b; ISO-4217-Code (kEUR, mEUR).
- **Ist-Zustand:** Werte und Varianzen bekommen getrennte Formatter-Domänen (`fmt` / `fmtVar` `visual.ts:2305-2306`). Die Auto-Schwelle liegt bei ≥ 10 000 → k (`visual.ts:1190`). Folgen:
  - Screenshot 18: Werte „54,2K", Σ „151,7K", aber ΔPL „+3200" ohne Einheit. Das ist ein Faktor-1000-Missverständnis im selben Chart, und der Titel sagt „in K".
  - Screenshot 01: Titel „in M€", Varianzen „+20,0K€".
  - Screenshot 23: Karte „9,8M€" mit Δ „+300,0K€".
  - „K€/M€" in Großbuchstaben kommt aus dem Power-BI-Formatter. „kEUR/mEUR" ist nicht erreichbar.
  - Werte 1 000–9 999 bleiben vierstellig („5400", „Σ 22830", Screenshot 11). Mit `displayUnits = k` entstehen „1.150K €" (Screenshot 17).
- **Umsetzungsidee:**
  - Eine gemeinsame Einheit je Instanz aus dem Werte-Maximum ableiten und auf Varianzen anwenden; Varianzen dürfen mehr Dezimalen bekommen, aber keine andere Einheit.
  - Optionaler IBCS-Einheitenstil mit `k/m/b` + ISO-Code und Einheit **nur im Titel** (Labels ohne Suffix, siehe T-11).

### T-8 · Pin-Achsen in Tabelle und Brücken immer als PY-Notation · **mittel**

- **IBCS-Regel:** UN 4.1: Die Achse codiert die Referenz; bei PL ist sie eine Doppellinie.
- **Ist-Zustand:**
  - Tabelle: Achsen für Δ, Δ% und Δ2 sind immer graue Vollbalken (`visual.ts:4749`, `4755`, `4760`).
  - Integrierte Brücke: `visual.ts:3122-3129`.
  - Kategorie-Brücke: `visual.ts:3541-3548`.
  - Columns/Bars machen es richtig (E-5). Screenshot 06: ΔPL%-Achse einfach grau trotz PL-Basis. Screenshot 08: ΔPL% ebenso.
- **Umsetzungsidee:** Alle Achsen über `drawBaseline(…, cfg.basisMode)` zeichnen; der Helfer existiert bereits.

### T-9 · Integrierte Brücke: Total-Pin immer schraffiert · **niedrig**

- **IBCS-Regel:** UN 3.2/4.1: Schraffur bedeutet „enthält Forecast".
- **Ist-Zustand:** `pin(cxTot, pctTot, true, bg)` (`visual.ts:3152`) ist hart auf `true` gesetzt. Screenshot 07 zeigt einen schraffierten Total-Pin bei reinen AC/PY-Daten.
- **Umsetzungsidee:** `hollow = cfg.hasFc` übergeben.

### T-10 · GuV-Wasserfall ohne Referenz in Varianzfarben · **mittel**

- **IBCS-Regel:** UN 4.1: Rot und Grün sind für **Varianzen** reserviert. EX 1.1: Beitragswasserfälle tragen die Szenario-Füllung (AC dunkel).
- **Ist-Zustand:**
  - `segs.push({… kind: "delta", good: good(p.value, p) …})` färbt Ist-Beiträge nach Vorzeichen (`visual.ts:2801`, `2820`).
  - Aufwand erscheint rot, obwohl keine Abweichung gezeigt wird (Screenshot 04).
  - In Screenshot 05 (CT 12 mit ΔPY-Stufe) bedeutet dasselbe Rot auf **einer** Seite einmal „Aufwand" und einmal „schlechte Abweichung".
- **Umsetzungsidee:** Delta-Segmente ohne Referenz in AC-Füllung (bzw. FC-Schraffur) zeichnen. Die Farbcodierung bleibt optional über ein Setting `waterfallColor = scenario | sign`.

### T-11 · Redundante Einheiten und Dezimalen in Labels · **niedrig**

- **IBCS-Regel:** SI 4 (keine Redundanz), UN 1.
- **Ist-Zustand:**
  - Jedes Label trägt „M€" bzw. „K€", obwohl der Titel „in M€" sagt (Screenshot 01, 27).
  - Der Default `decimals = 1` (`settings.ts:996-999`) erzeugt „+20,0K€" und „240,0K€".
  - Das GuV-Statement zeigt „9.100,0 T€" (Screenshot 12).
- **Umsetzungsidee:** Ein Schalter „Einheit nur im Titel", der den Suffix in Labels unterdrückt, und Dezimalen nur, wenn sie Information tragen (≤ 3 signifikante Stellen).

### T-12 · Small Multiples der Brückenmodi standardmäßig je Kachel skaliert · **mittel**

- **IBCS-Regel:** CH 4.1 / CO 5.1: gleiche Skala; sonst Skalierungsindikatoren (UN 5.2).
- **Ist-Zustand:**
  - `multiplesSameScale` ist per Default `false` (`settings.ts:565-570`).
  - Nord (PY 9 930) und Süd (PY 3 310) rendern gleich lang, ohne Hinweis (Screenshot 25).
  - Columns und Bars sind konform (E-22).
- **Umsetzungsidee:** Default auf `true` setzen. Bei `false` je Kachel einen Skalierungsindikator zeichnen.

### T-13 · Schriftgrößen-Default „Kompakt" · **niedrig**

- **IBCS-Regel:** CO verlangt kleine Schrift. Für Bildschirm-Reporting gilt praktische Lesbarkeit.
- **Ist-Zustand:**
  - Default `fontPreset = compact` (`settings.ts:962-968`, Faktor 1,0 → Labels 10 px, Titel 12 px, Panel-Titel 10 px grau).
  - AGENT-GUIDE empfiehlt „fullhd" (×1,5) als Default-Empfehlung. Der tatsächliche Default weicht davon ab.
  - Positiv: Sekundärtexte sind auf `#6E6E6E` angehoben (Kontrast 5,1 : 1, WCAG AA).
- **Umsetzungsidee:** Für ein Konzern-Paket „fullhd" als Default oder eine automatische Wahl nach Visual-Größe vorsehen.

### T-14 · Δ% bei negativer Referenz wird als Prozentwert ausgegeben · **hoch**

- **IBCS-Regel:** UN 4.1: „Show **n.a.** when the reference value is negative/uninterpretable".
- **Ist-Zustand:**
  - `varRel = varAbs / Math.abs(basis) * 100` ohne Guard (`visual.ts:956-958`; analog 5337, 6299, 8216).
  - Screenshot 21: „−100,0 %" bei PL = −40 und „−250,0 %" bei PY = −20.
  - Bei Ergebnisgrößen (EBIT, Cashflow) ist eine negative Basis im Konzern Alltag.
- **Umsetzungsidee:** Bei `basis < 0` (bzw. Vorzeichenwechsel, konfigurierbar) „n.a." ausgeben und keinen Pin zeichnen. Σ-Kopf und Karten analog behandeln.

### T-15 · Ausreißer bei Δ% und Δ in den Chart-Modi ungekappt · **mittel**

- **IBCS-Regel:** UN 5.3 / CH 2.1.
- **Ist-Zustand:**
  - Die Kappung existiert nur für Basisbalken (manuell über `fixedMax` + `capOverflow`, Default aus, `settings.ts:1213-1218`) und im GuV-Statement (E-21).
  - Columns/Bars-Pins und Varianzbalken skalieren auf das Maximum. Ein +400-%-Monat staucht alle anderen Pins auf wenige Pixel (Screenshot 20).
  - Eine automatische Ausreißer-Erkennung fehlt.
- **Umsetzungsidee:** Automatisches Kappen nach robuster Schwelle (z. B. > 3 × Median |Δ%|) mit Bruch-Marker ⫽ bzw. „▸▸" plus echtem Label; abschaltbar.

### T-16 · Benchmark-Szenario fehlt im Titel; Kartentitel mit falscher Einheit · **mittel**

- **IBCS-Regel:** UN 2.2, Zeile 3: alle gezeigten Szenarien und Varianzen nennen.
- **Ist-Zustand:**
  - Die `refScen`-Logik kennt kein BM (`visual.ts:8071-8075`).
  - Screenshot 22 zeigt den Titel „Umsatz in K · AC", obwohl die Karten ΔBM als Leitvergleich führen und heterogene Einheiten haben (%, kWh, Stück).
  - Screenshot 23 betitelt sechs verschiedene KPIs mit „Umsatz".
- **Umsetzungsidee:**
  - BM in die Szenario-Liste aufnehmen.
  - Im Kartenmodus mit mehreren Einheiten die Einheit aus dem Titel weglassen und je Karte zeigen.
  - Den Titel-Default bei Karten auf ein neutrales Feld wie „Kennzahlen" setzen.

### T-17 · Direkte Beschriftung statt Legende nur teilweise · **niedrig**

- **IBCS-Regel:** UN 2.3: Serien direkt an den Daten beschriften; Szenario-Labels nahe den Elementen oder unter der Achse.
- **Ist-Zustand:**
  - Columns/Bars nutzen eine Panel-Überschrift „AC · PY · PL · FC · BM –" als Legende (Screenshot 01).
  - Gestapelt nutzt eine abgesetzte Farblegende oben (Screenshot 27).
  - Line: Die PY-Linie ist unbeschriftet, das Ø6-Label am Rand abgeschnitten („06"), Achsenlabels „KW..." mehrdeutig (Screenshot 28).
  - Die Brücken beschriften korrekt unter der Achse (PY / PL / AC+FC, „FC").
- **Umsetzungsidee:** Szenario-Kürzel an der ersten bzw. letzten Säule und Segmentnamen rechts neben der letzten Säule (Stacked) setzen; die Line-Endlabels kollisionsfrei nach innen ziehen.

### T-18 · Kleinere Darstellungsfehler in den Brücken · **niedrig**

- **Treiber-Notiz:** „largest driver · N % of total variance" überlagert Pin und Label (Screenshot 09: „+49,0%" durchgestrichen; Screenshot 25: „+11,5%ariance"). Fundstelle `visual.ts:3638-3650`.
- **Abgesetztes Label:** Das AC-Label der Kategorie-Brücke steht losgelöst vom Balken, wenn PY ≫ AC (Screenshot 08, Illinois „169").
- **PL-Anker im Bridge-Tier:** Bei geringer Tier-Höhe wird der PL-Anker zum dunklen Strich und liest sich als AC (Screenshot 30, „PL 12,5M€").
- **Umsetzungsidee:** Kollisionsprüfung für die Treiber-Notiz, Label-Anker am Balkenende und eine Mindesthöhe für Umriss-Anker.

### T-19 · Zahlentypografie · **niedrig**

- **IBCS-Regel:** UN 1: Tausendertrenner als schmales Leerzeichen; eine Minus-Konvention.
- **Ist-Zustand:**
  - Der Tausendertrenner folgt der Locale („9.800"). Für DACH-Konzerne ist das üblich und akzeptabel.
  - Absolutwerte nutzen „-" (Hyphen), Prozentwerte „−" (U+2212) (`visual.ts:1255`); sichtbar in Screenshot 10 („-300 T€" neben „−7,7%").
- **Umsetzungsidee:** U+2212 einheitlich verwenden. Optional einen IBCS-Zahlenstil mit schmalem Leerzeichen (U+202F) anbieten.

### T-20 · Status-Elemente auf KPI-Karten · **niedrig**

- **IBCS-Regel:** SI (keine farbigen Hintergründe), EX 2 (Ampeln durch Varianzwerte ersetzen).
- **Ist-Zustand:**
  - Der linke Statusstreifen ist immer an.
  - Die Hintergrund-Tönung `cardTint` ist per Default aus. Eingeschaltet wirkt sie wie eine Ampel (Screenshot 22).
  - `deltaIcons` ▲▼ richten sich nach dem Vorzeichen, nicht nach der Wirkung (Default aus).
  - Abgemildert, weil die Varianzwerte immer daneben stehen.
- **Umsetzungsidee:** Den Streifen abschaltbar machen und die Icon-Richtung optional nach Impact setzen.

### T-21 · Hochkontrast und Dark Mode: Notationskonflikte · **niedrig**

- **Hochkontrast:** Schlechte Varianzen sind **hohl** und kollidieren damit mit der PL-Notation (Umriss), Screenshot 13. Bei einer Ein-Farb-Palette ist das ein vertretbarer Kompromiss.
- **Dark Mode:** Er verlässt bewusst die IBCS-Regel „weißer Hintergrund" (SI), hält aber die Hierarchie AC hell = stärkster Kontrast und PY gedämpft (`DARK_COLOR_SWAP` `visual.ts:51`). Achtung: Bei `appearance = auto` (Default) kippt das Visual auf dunklen Themes **automatisch**.
- **Umsetzungsidee:** Dokumentieren. In Konzern-Vorlagen `appearance = light` fixieren. Im Hochkontrast schlechte Varianzen alternativ als Kreuzschraffur zeichnen.

### T-22 · Auto-Message: inhaltlich ein Datenauszug, sprachlich fest deutsch · **niedrig**

- **IBCS-Regel:** SA 3.2: Die Message ist eine wertende Aussage, keine Datenzusammenfassung.
- **Ist-Zustand:**
  - `buildAutoMessage` liefert „ΔPL +171K€ (+1,4%) · stärkster Treiber: … · schwächster: …" (`visual.ts:8113-8145`). Das ist eine Detection, die am Rand von SA 3 liegt.
  - Die Textteile sind hartcodiert deutsch (`visual.ts:8141`).
  - Default aus (`settings.ts:197-202`).
- **Umsetzungsidee:** Die Strings lokalisieren und eine Satzvorlage in der Form „‹KPI› ‹über/unter› ‹Basis› um …" verwenden.

---

## 3 · FEHLT (IBCS-Elemente, die das Visual noch nicht kann)

| # | IBCS-Element | Regel | Ist-Zustand (Beleg) | Prio | Umsetzungsidee |
|---|---|---|---|---|---|
| F-1 | **3-zeiliger Titel mit Berichtseinheit** („wer") | UN 2.2 | Kein Property (`capabilities.json:133 ff.`), siehe T-5 | **hoch** | `ibcsTitle.unit` plus Layout `ibcs3`; die Message darüber |
| F-2 | **Skalierungslinien / Skalierungsbänder** zwischen Charts gleicher Einheit auf einer Seite | UN 5.2 / CH 4.1 | Kein Code (Suche nach „scaling/scale band": 0 Treffer). Nur manuelle Synchronisierung per `scale.fixedMax` / `fixedVarMax`. Screenshot 19: „Konzern" (1 100 €) und „Tochter" (110 €) mit identischen Säulenhöhen, ohne Hinweis | **hoch** | Option „Skalierungsband ab Wert X": eine Linie auf identischer numerischer Höhe in allen Instanzen und eine hell hinterlegte Fläche darunter. Zusätzlich eine Seiten-Gruppe (Sync-Key), in der Instanzen ihr Maximum teilen |
| F-3 | **„n.a." bei negativer oder nicht interpretierbarer Referenz** | UN 4.1 | Fehlt, siehe T-14 | **hoch** | siehe T-14 |
| F-4 | **Neutrale Varianz (blau)** für KPIs ohne Gut/Schlecht-Richtung (Headcount, FX, Volumen) | UN 4.1 | Nur gut/schlecht/grau (`isGood` `visual.ts:2193-2199`). Kein Neutral-Status; Grau ist für „unwesentlich" belegt | **mittel** | `neutralList` analog `invertList` plus Neutralfarbe (IBCS `#0064FF`) |
| F-5 | **Automatische Ausreißer-Kennzeichnung** für Pins und Varianzbalken in den Chart-Modi | UN 5.3 | Fehlt, siehe T-15 | **mittel** | siehe T-15 |
| F-6 | **Index-Darstellung mit Referenzpfeil** (▸ 100 % bei Basisperiode) | UN 4.2 / UN 5.1 | Kein Code (Suche „index": 0 Treffer) | **mittel** | Option `indexBase = <Kategorie>`: Werte als % der Basisperiode, ▸ mit Label „100 %" links |
| F-7 | **Durchschnitts-Marker ⌀** in Strukturcharts | UN 4.3 | Nur gleitender Durchschnitt „ØN" in Zeitreihen (`visual.ts:8596`), kein Strukturdurchschnitt | **niedrig** | Pfeilspitze bzw. Hilfslinie auf Mittelwert-Höhe plus Label „⌀" |
| F-8 | **Trendpfeile (CAGR)** | UN 5.1 | Fehlt (0 Treffer) | **niedrig** | Pfeil vom ersten zum letzten Punkt eines Fensters, beschriftet „CAGR +x,x %", Farbe nach Impact |
| F-9 | **Hervorhebungs-Ellipse** | UN 5.1 / SA 4 | Fehlt; Bänder (E-18) sind eine zulässige Alternative | **niedrig** | Optionaler Stil `highlightStyle = band \| ellipse` |
| F-10 | **Sortierindikator im Titel** („sortiert (↓)") | UN 4.3 / UN 2.2 | Sortierung ist über das PBI-Sortiermenü möglich (`capabilities.json:490`, `sorting.default`), der Titel zeigt sie aber nicht | **niedrig** | Bei erkannter Sortierung nach Wert „, sortiert (↓)" an Titelzeile 2 anhängen |
| F-11 | **IBCS-Zeitnotation**: `_Jun` für YTD, `~Jun` für rollierend, `Jan..Dez` für Spannen, ISO-Daten | UN 3.3 / UN 4.2 | YTD/QTD/R12 als Präfix „YTD ·" im Panel-Titel; Spannen „–"; Datumskategorien als „Mär 26" | **niedrig** | Optionaler Zeitnotations-Stil `ibcs` in Titel- und Kategorie-Formatierung |
| F-12 | **Einheiten im IBCS-Stil** (kEUR, mEUR, bEUR; ISO-Währung) | UN 1 | Nicht erreichbar, da der Power-BI-`valueFormatter` K/M/bn liefert; siehe T-7 | **mittel** | Eigener Suffix-Builder statt PBI-Display-Units, wenn „IBCS-Zahlenstil" aktiv ist |
| F-13 | **Kategoriebreite codiert den Periodentyp** (Jahr breiter als Quartal breiter als Monat) | UN 3.3 | Fehlt; alle Slots gleich breit | **niedrig** | Bei gemischten Periodentypen (z. B. Vorjahr + Monate) Gewichtung je Kategorie |
| F-14 | **Seitenweite Skalensynchronisierung ohne Handarbeit** | CH 4.1 / ST 1 | Custom Visuals sehen keine Nachbarinstanzen. Möglich ist nur ein gemeinsamer manueller Wert oder ein Measure | **mittel** | Feldrolle `scaleMax` (Measure), damit ein DAX-Measure (z. B. `MAXX(ALLSELECTED(...))`) die gemeinsame Skala für alle Instanzen liefert. Robuster als manuelle Zahlen |
| F-15 | **Szenario-Kennzeichnung der Kategorienachse jenseits von FC** | UN 3.2 / UN 2.3 | Nur FC gestrichelt (E-6); kein „FC"-Label unter der Achse in Columns (die Integrierte Brücke hat es, Screenshot 06) | **niedrig** | „FC"-Kennung unter dem ersten FC-Monat auch im Columns-Modus |
| F-16 | **Bereinigungs-Schicht** (Inflation, FX, M&A explizit) | UN 4.4 / CH 5 | Fehlt; nur freier Fußzeilentext | **niedrig** | Optionale Rolle `adjustment` als heller Aufsatz-Layer plus Fußnote „*bereinigt" |

---

## 4 · Status der IBCS-Funde aus dem Juli-Audit (v1.34.1 → v1.44.0)

| Fund (AUDIT-2026-07, Abschnitt 4) | Status 1.44 | Beleg |
|---|---|---|
| Matrix: Σ-Zeilen-Minibalken überläuft | **behoben** (1.34.2) | CHANGELOG Z. 460 ff. |
| Tabelle: rowFormats verfälscht Einheit (9,8K€ statt T€) | **behoben** (1.34.3) | CHANGELOG Z. 428 ff. |
| rowFormats „#,0" als Dezimalstelle | **behoben** (1.34.3) | CHANGELOG Z. 424 ff. |
| Skip-Zeilen-Pins ungekappt | **behoben** (1.34.3) | CHANGELOG Z. 432 ff. |
| Finance-Format uneinheitlich | **behoben** (1.34.3) | CHANGELOG Z. 435 ff. |
| AC-Wasserfall in Varianzfarben | **offen** | T-10, `visual.ts:2801` |
| Pin-Achsen Brücken/Tabelle immer PY-Notation | **offen** | T-8 |
| FC-Pin-Köpfe hohl (= PL-Notation) | **offen** | T-3, `visual.ts:7675` |
| Total-Pin Integrierte Brücke immer schraffiert | **offen** | T-9, `visual.ts:3152` |
| Δ% bei negativer Basis statt „n.a." | **offen** | T-14 |
| Titel einzeilig, keine Berichtseinheit, Message unten | **offen** | T-5 |
| Benchmark fehlt im Titel; Karten-Einheit falsch | **offen** | T-16 |
| Zeitraum-Slot bei Strukturmodi | **offen** | T-6 |
| Multiples (Brücken) Default je Kachel skaliert | **offen** | T-12 |
| Treiber-Notiz kollidiert mit Pins | **offen** | T-18 |
| Illinois-Label losgelöst / PL-Anker kollabiert | **offen** | T-18 |
| Minus-Typografie gemischt | **offen** | T-19 |
| Line: Achsenlabels mehrdeutig | **teilweise** („KW..." statt „K", weiterhin mehrdeutig) | Screenshot 28 |
| cardTint / deltaIcons | unverändert (Default aus, akzeptabel) | T-20 |

**Fazit:** Die Bug-Klasse (falsche Zahlen, Überläufe) wurde im Juli konsequent abgearbeitet. Die **Notations-Klasse** (Schritt 5 der damaligen Fix-Empfehlung) ist unberührt.

---

## 5 · Empfehlung: Reihenfolge für Konzern-Tauglichkeit

1. **Integrität zuerst** (hoch, jeweils S–M):
   - „n.a." bei negativer Basis (T-14)
   - einheitliche Einheit für Werte und Varianzen (T-7)
   - Varianz-Panels im Basismaßstab oder mit sichtbarem Überhöhungsfaktor (T-2)
2. **Titelkonzept** (hoch, M): Berichtseinheit, 3-Zeilen-Layout, Message oben (T-5 / F-1), dazu BM im Titel und kein Struktur-Zeitraum (T-6, T-16).
3. **Skalen über die Seite** (hoch, M–L): Feldrolle `scaleMax` und Skalierungsband (F-2, F-14); Brücken-Multiples per Default mit gleicher Skala (T-12).
4. **UNIFY-Paket** (mittel, S–M): ein Pin-Kopf-Helfer für alle Modi (T-3), `drawBaseline` für alle Pin-Achsen (T-8), Total-Pin (T-9), AC-Wasserfall in Szenario-Füllung (T-10).
5. **Farbpresets** (mittel, S): „IBCS-Standard" und „S/W-Druck" ergänzen, Blau/Orange korrigieren und die CHANGELOG-Aussage relativieren (T-1, T-4); neutrale Varianz (F-4).
6. **Ausreißer** (mittel, M): automatisches Kappen von Pins und Varianzbalken (T-15 / F-5).
7. **Politur** (niedrig): Einheit nur im Titel, Dezimalen, Typografie, direkte Beschriftung, Brücken-Kollisionen, Zeitnotation, Index, ⌀, CAGR, Ellipse (T-11, T-13, T-17–T-22, F-6 bis F-16).

Die Punkte 1–4 machen aus „IBCS-inspiriert" ein Visual, das einer IBCS-Prüfung (z. B. vor einer Zertifizierung) im Kern standhält. Der Aufwand ist überschaubar, weil die nötigen Helfer (`drawBaseline`, `drawCapMarker`, die Pin-Logik des GuV-Statements) bereits im Code existieren.

---

## Anhang · Beleg-Screenshots

Alle Dateien liegen in `/tmp/claude-0/-home-user-PowerBI-Kitchen-/48cefe9d-d129-536d-a96e-98e1dded6421/scratchpad/`.

| Datei | Testfall | Inhalt |
|---|---|---|
| audit-ibcs-01-columns-notation.png | c1 | Kernnotation, mehrstufige Varianz, Kommentare, Hervorhebung, Titel einzeilig, Einheiten-Mix M€/K€ |
| audit-ibcs-02-dual-variance.png | c12 | ΔPL (Doppellinie) und ΔPY (graue Achse), FC-Pins hohl |
| audit-ibcs-03-bars-invert-cap.png | c4 | Invertierung, Bruch-Marker ⫽, 4-stellige Labels |
| audit-ibcs-04-waterfall-ac-varianzfarben.png | c8 | AC-Wasserfall in Rot/Teal |
| audit-ibcs-05-waterfall-ct12.png | c39 | Rot mit doppelter Bedeutung auf einer Seite |
| audit-ibcs-06-intbridge-pl-pinachse.png | c50 | ΔPL%-Achse in PY-Notation; korrekte Pin-Köpfe (Quadrat, FC schraffiert) |
| audit-ibcs-07-intbridge-totalpin.png | c83 | Total-Pin schraffiert ohne FC; Struktur als Zeitraum im Titel |
| audit-ibcs-08-catbridge.png | c23 | Kategorie-Brücke, ΔPL%-Achse einfach grau, Illinois-Label |
| audit-ibcs-09-catbridge-drivernote.png | c127 | Hervorhebungsband; Treiber-Notiz überlagert Pin |
| audit-ibcs-10-tabelle-guv.png | c25 | IBCS-Tabelle; Minus-Typografie gemischt |
| audit-ibcs-11-tabelle-dual.png | c26 | Tabelle Dual; „22830" ohne Trenner und ohne Einheit |
| audit-ibcs-12-pnl-statement.png | c51 | GuV-Statement; „9.100,0 T€" |
| audit-ibcs-13-hochkontrast.png | c6 | Hochkontrast |
| audit-ibcs-14-blau-orange.png | x1 (eigener Fall) | Blau/Orange-Preset |
| audit-ibcs-15-graustufen-default.png | c12, Graustufen | Teal und Rot in S/W nicht unterscheidbar |
| audit-ibcs-16-graustufen-blau-orange.png | x1, Graustufen | Blau/Orange in S/W kaum unterscheidbar |
| audit-ibcs-17-titel-maximal.png | x2 (eigener Fall) | Maximal befüllter Titel; IBCS-Farben per Picker; „1.150K €" |
| audit-ibcs-18-einheitenmix-bars.png | x3 (eigener Fall) | Werte in K, Varianzen unskaliert |
| audit-ibcs-19-zwei-instanzen-ohne-skalierung.png | x4 (eigener Fall) | Gleiche Höhe bei Faktor 10, ohne Skalierungsindikator |
| audit-ibcs-20-pct-ausreisser.png | x5 (eigener Fall) | +400 % ungekappt, Varianz-Überhöhung |
| audit-ibcs-21-negative-basis.png | c13 | −100 % / −250 % statt n.a. |
| audit-ibcs-22-karten-benchmark.png | c70 | Titel ohne BM, falsche Einheit, Tönung |
| audit-ibcs-23-karten-einheiten.png | c42 | M€ und K€ in einer Karte; Titel „Umsatz" für 6 KPIs |
| audit-ibcs-24-pareto-titel.png | c31 | „Deutschland – Portugal" als Zeitraum |
| audit-ibcs-25-multiples-bruecke-skala.png | c81 | Kacheln ungleich skaliert; Notiz-Kollision |
| audit-ibcs-26-multiples-columns.png | c7 | Gleiche Skala (konform) |
| audit-ibcs-27-gestapelt.png | c35 | Grauabstufung (konform); Legende abgesetzt; Einheit je Label |
| audit-ibcs-28-linie.png | c3 | Line: „KW...", Ø6 abgeschnitten, PY unbeschriftet; Theme-Grün |
| audit-ibcs-29-acfc-split.png | c121 | AC+FC-Splitsäule (konform) |
| audit-ibcs-30-bridge-tier-pl-anker.png | c18 | PL-Anker kollabiert zum dunklen Strich |
| audit-ibcs-31-wesentlichkeit.png | c40 | Unwesentliche Abweichungen grau |
| audit-ibcs-32-prelim-fc.png | c54 | Vorläufiges Ist, FC schraffiert, PY-Säulen |

**Reproduktion:**
- Harness: `cd ibcsInspiredChartDeck && npm install && npm run test:render` (ohne Fehler).
- Einzelfälle: `shoot.js` im Scratchpad, mit `PAGE=…/extra.html` für die Fälle x1–x5.
- Graustufen: `shoot_gray.js`.
- Luminanzwerte nach WCAG-Formel.

---
*IBCS® ist eine eingetragene Marke der HICHERT+FAISST GmbH. Die Regelzitate sind abgeleitet aus den IBCS Standards 1.2 der IBCS Association (CC BY-SA 4.0, www.ibcs.com/standards).*
