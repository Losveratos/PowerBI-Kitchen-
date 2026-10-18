# IBCS-Templates mit „P&L Statement byDatenWG" nachstellen · Kurzanleitung

Stand: **Visual 1.4.0.0** (18.10.2026). Für die lokale Arbeit in Power BI Desktop —
alles Nötige, um die offiziellen IBCS-Templates (T01A–T04E, 12A, 12G, 12H)
nachzubauen. Referenzbilder liegen in `prototype/refs/`, der interaktive
HTML-Prototyp in `prototype/megatable.html` (im Browser öffnen, Referenz-Dropdown
stellt jedes Blatt 1:1 nach — gut zum Vergleichen neben Power BI).

## 1 · Visual besorgen

- Download: https://datenwgknowledgekitchen.com/pnl-schnellstart.html (Button „.pbiviz laden")
- oder GitHub: https://github.com/Losveratos/power-bi-custom-visuals-bydatenwg → `pnl-statement/`
- Import in Power BI Desktop: Visualisierungen → … → *Visual aus Datei importieren*.

## 2 · Datenmodell (Minimum für die Templates)

**Struktur-Templates (T01/T02):** eine Dimensionstabelle mit Regionen
(Land → Region → World) auf den Rollen **Level-Spalten (L1..Ln)** oder
**Parent/Account-ID**, dazu Faktentabelle mit **Periode (Monat)** und den
Measures **AC, PY, PL** (für T02E/F zusätzlich **FC**).

**Statement-Templates (T03/T04/12er):** Kontendimension mit
**RowType** (`+`/`-`-Zeilen, `sum`, `formula`, `margin`), optional
**FormulaDef** (EBITDA etc.), **SignConvention/DisplayInvert/VarianceInvert**
für Kostenzeilen, dazu AC/PY/PL(/FC); für 12G zusätzlich **FC** und sinnvoll
**PL FY/FC FY**. Beispiel-Daten mit allen Zahlen der Referenzblätter:
`demoData/` bzw. eingebettet im Prototyp.

**Wichtig:** Kostenzeilen bekommen das Trio `SignConvention = -1` ·
`DisplayInvert = true` · `VarianceInvert = false` (mehr Kosten = rot). **Nicht**
`-1` zusammen mit `VarianceInvert = true` setzen: das dreht die Bewertung doppelt
und färbt eine Kostenüberschreitung fälschlich günstig. Die Vorzeichenlogik läuft
über die Dimension — nichts im Visual „verbiegen".

## 3 · Template wählen — eine Einstellung

Drei Wege, dasselbe Ergebnis:

- **Start-Hub (1.3, am anschaulichsten):** Ohne gebundene Felder zeigt das Visual
  im Bearbeitungsmodus den Hub, Knopf **Templates** öffnet die Galerie: 18 Kacheln
  mit Mini-Vorschau auf Demo-Daten, seit 1.4 **nach Zweck gruppiert** — siehe
  Tabelle unten — mit Finance-Titel, T-Nummer als Badge und einer Nutzen-Zeile.
  Ein Klick wendet das Template an. Ohne Felder wird die Wahl gespeichert und
  greift beim Binden. Mit gebundenen Daten steht als erstes Element der Toolbar
  (nur Bearbeitung) **☰ Start**: das Overlay hat dieselbe Galerie, ein Klick
  wendet an, stellt die Ansicht *Tabelle* ein und schließt. Neu in 1.4:
  **🚀 Loslegen** führt in drei Schritten (Felder → Template → Feinschliff)
  zur fertigen Tabelle; die Leiste unten schaltet **HD · Full HD · UHD**.

  | Galerie-Gruppe (1.4) | Templates | Finance-Titel der Kacheln |
  |---|---|---|
  | Struktur-Vergleich | T01A, T01B, T02A, T02B, T02C | Regionen mit Plan-Abweichung · Regionen mit Zwischensummen · Plan-Abweichung als Balken · Ranking nach Ist (YTD) · Ranking nach Abweichung (Monat) |
  | Forecast | T02E, T02F, T03B, T04D, T04E | Forecast gegen Vorjahr · Forecast gegen Plan · Forecast-GuV mit Δ zu Vorjahr und Plan · Forecast-GuV mit Plan-Wasserfall · Forecast-GuV mit Vorjahres-Wasserfall |
  | GuV-Statement | T03A, T04A, T04B, T04C | GuV mit Abweichung zu Vorjahr und Plan · GuV mit Plan-Abweichungsbalken · GuV mit Δ-Wasserfall · GuV mit Vorjahres-Wasserfall |
  | Report-Ansichten | 12A, 12G, 12H, klassisch | Wert-Kaskaden Vorjahr und Ist · Jahresausblick (FY) · Planrechnung gegen Vorjahr · Klassische GuV-Tabelle |

- **Toolbar (1.2, am schnellsten):** Im Bearbeitungsmodus steht ganz links in
  der Toolbar das Dropdown **Template** (nur Ansicht *Tabelle*). Auswählen,
  fertig — es schreibt dieselben Einstellungen wie der Formatbereich. Leser
  sehen das Dropdown nie. Abschalten: Darstellung & Toolbar →
  „Template-Auswahl im Bearbeitungsmodus".
- **Formatbereich:** Karte **Spalten & Mega-Table** → erste Gruppe
  **Mega-Table** → Dropdown **Template** (seit 1.2 die erste Gruppe der Karte).

Jedes Template ist nur ein Preset: Es setzt alle Schalter
(Spalten, Balken/Pins/Wasserfall, Blöcke, Dezimalen) und danach kannst du
**jedes Element einzeln** ein-/ausblenden. Übersicht:

| Template | Was es zeigt | Daten-Voraussetzung |
|---|---|---|
| **T01A** | Struktur flach, PY·PL·AC + ΔPY/ΔPY%/ΔPL/ΔPL% als Zahlen, Monat \| _YTD, Schwellen-Rot + Fußzeile | Struktur + Periode + AC/PY/PL |
| **T01B** | wie T01A mit Zwischensummen-Blöcken (Europe/Americas/RoW) | Hierarchie-Ebenen |
| **T02A** | PL·AC + ΔPL-Balken + ΔPL%-Pins, zwei Blöcke | AC/PL |
| **T02B/C** | wie T02A, sortiert nach AC↓ bzw. ΔPL↓ („(↓)" im Kopf) | — |
| **T02E/F** | FC statt AC (schraffierte Balken), Referenz PY bzw. PL (graue bzw. Doppellinien-Achse) | FC + PY bzw. PL |
| **T03A/B** | GuV-Statement: +/−/=-Zeilen, PY·PL·AC(bzw. FC) + Δ-Zahlenspalten, Margen-Zeile in %p | Kontendimension mit RowType |
| **T04A–E** | Statement mit **integriertem Δ-Wasserfall** (kaskadierende Balken, =-Anker) + Δ%-Pins; A/B = vs. PL, C = vs. PY, D/E = FC | wie T03 |
| **12A** | PY- und AC-**Wert-Kaskaden** als eigene Spalten + ΔPY-Balken/Pins (Headline bleibt aus; nur 12G und 12H schalten sie ein) | wie T03 |
| **12G** | FY-Block: YTD voll + Restjahr **schraffiert im selben Balken**, Δ aufs Jahr | FC (+ FY-Werte) |
| **12H** | Plan-Kaskade umrandet, Varianzbalken **blass getönt** | PL als Minuend |

**Szenario-Logik (eine Regel):** Minuend bestimmt die Füllung (AC voll ·
FC schraffiert · PL getönt/umrandet), Referenz bestimmt die Achse
(PY = grau · PL = Doppellinie). Minuend AC/FC/PL: Karte Spalten →
**Analysiertes Szenario**; für Leser optional als Toolbar-Buttons
(Karte Toolbar → **Szenario-Gruppe**, Standard aus).

## 4 · Die wichtigsten Einstellungen (1.1 / 1.2)

- **Spalten** einzeln: PY/PL/AC(FC) · je Referenz getrennt Δ-Zahl, Δ-Balken,
  Δ-Wasserfall, Δ%-Zahl, Δ%-Pins · Wert-Kaskade · % vom Umsatz · Margen-Zeilen
- **Blöcke:** 1 oder 2; Block-Art je Seite: **Monat / YTD / FY** (FY = AC&FC vs. PL FY)
- **Schwellen:** „Δ in red if" absolut + % je Block, Fußzeile zeigt sie an
- **Zahlen:** Dezimalen, k/m/**b**, **Σ-treue Rundung**, **Klammern-Negativ**
- **Beschriftungen:** Hausbegriffe (z. B. PL → „Budget")
- **Titelblock:** 3-Zeilen-Titel, **Auto-Message**, große **Headline**,
  Quellen-Fußzeile, **Filter-Fußzeile** (Rolle „Filter-Info" binden)
- **Hervorheben** (Zeilennamen-Liste) und **Wesentlichkeit** (Δ unter Schwelle grau)
- **Skalen-Sync:** Zahlen → fixedMax/fixedVarMax (leer = auto, k/m/b-Suffixe) —
  gleiche Skala über mehrere Instanzen, auch neben ChartKitchen
- **Farben:** Teal = Standard (farbfehlsicher), Presets ibcs-Grün und Blau/Orange;
  Dark Mode Auto/Hell/Dunkel
- **Wertspalten für Leser (1.2):** Darstellung & Toolbar → „Gruppe: Wertspalten"
  an → im Mega-Table schalten Leser analysiertes Szenario · PY · PL einzeln zu
  (die letzte Spalte bleibt gesperrt). In der klassischen Tabelle: AC · PY · PL ·
  FC · Δ frei kombinierbar, Preset „Eigene Auswahl"
- **Leerzustand (1.2):** Leer-Zustand → Modus *Demo* · *Feld-Intro* · *Eigene
  Nachricht*; im Bearbeitungsmodus per Knopf „Felder erklären" / „Demo ansehen"

## 5 · Bekannte, bewusste Abweichungen von den Referenzblättern

(Vollständig in `SPEC-MEGATABLE.md` → „Bewusst offen / Abweichungen")

1. **T01A/B:** Die YTD-ΔPY-Spalte des Originals druckt eine Dezimale (+431.0)
   bei sonst ganzzahligen Spalten — Referenz-Inkonsistenz, wir drucken einheitlich.
2. **T02F:** Das Original kappt Pins schon bei 1,35× Sprung; unsere
   Tukey-Automatik (Q3+4×IQR) kappt dort nicht — jede Regel, die das träfe,
   würde in T02A fälschlich kappen.
3. **T03A:** Das Original druckt in ΔPY des Group result versehentlich den
   ΔPL-Wert (+162.5) — wir rechnen korrekt (+186.2). Ebenso T04C/E-Pin und
   12H-Operating-result: Druckfehler der Blätter.
4. **12A:** Mehrfach-Pfeilspitzen (+983 →→→) sind bei uns eine einfache Spitze.

## 6 · Troubleshooting lokal

- **Buttons wirken „tot":** Seit 1.0.1 sind wirkungslose Buttons gedimmt +
  Tooltip sagt warum (z. B. Δ-Referenz unter Vollpreset). Template wirkt nur
  in der **Tabellen-Ansicht**.
- **ΔPL-Spalten leer:** PL-Rolle nicht gebunden (Pane blendet die Schalter
  dann aus). FC-Minuend braucht die FC-Rolle.
- **Schwellen färben nicht:** Schwellen gelten in **Anzeige-Einheiten**
  (nach k/m-Skalierung).
- **Template erneut anwenden** (z. B. nach Schalter-Änderungen): Seit 1.3 reicht
  ein Klick auf die aktive Kachel der Galerie oder auf **↺ Zum Template zurück**
  neben dem Dropdown (erscheint, sobald Schalter vom Template abweichen). Das
  native Dropdown kann den schon gewählten Eintrag nicht noch einmal wählen — der
  Umweg „kurz anderes Template und zurück" ist nicht mehr nötig.
- **Kein Template-Dropdown in der Toolbar:** nur im Bearbeitungsmodus und in der
  Ansicht *Tabelle*; Schalter „Template-Auswahl im Bearbeitungsmodus" prüfen.
- **Spalten-Kategorie gebunden, aber keine Blöcke:** Der Mega-Table ignoriert
  sie (Hinweis unter der Tabelle im Bearbeitungsmodus). Sie wirkt in der
  klassischen Tabelle, also Template „Aus".
- **Export/PDF:** druckt ohne Toolbar und voll aufgeklappt (Schalter
  „Export klappt alles auf").

## 7 · Weiterführend

- `SPEC-MEGATABLE.md` — Spezifikation, Maße, Schalter-Liste, Umsetzungsstand
- `AGENT-GUIDE.md` — Property-Referenz, persistierte Zustände, Fallen (für Agenten/Skills)
- `prototype/megatable.html` + `prototype/refs/` — Soll-Bilder und 1:1-Vergleich
- `CHANGELOG.md` — was 1.0 → 1.0.1 → 1.1 → 1.2 jeweils kam
- Skill `.claude/skills/pnl-report` — baut GuV-Seiten in PBIP-Projekten auf
