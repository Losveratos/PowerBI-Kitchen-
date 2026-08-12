---
name: powerbi-design-framework
description: >
  Entwirft per kurzem, nativem Interview das Grundgerüst einer Power-BI-
  Berichtsseite: Branding/Farben aus Firmen-Präsentation, Webseite oder Logo
  ableiten, Navigation, Kopfband, Logo, Fußleiste und Filter-Panel festlegen,
  Kachel-Raster nach modernen Gestaltungsregeln aufbauen und alles als
  theme.json + Design-Spec + Agent-Brief ablegen — inkl. Accessibility-Checks
  (WCAG-Kontrast, Schriftgrößen). Dazu: IBCS-Modus (Strukturelemente als
  benannte Slots), Atomic-Design-Komponentenseite zum Kopieren, Bulk-Restyle
  über die PBIP/PBIR-Dateien (z. B. „überall Schatten aus, runde Ecken an")
  und ein Design-Linter. Optional mit ChartKitchen-Visuals. Auslösen, wenn
  der Nutzer sinngemäß sagt „bau mir ein Report-Layout / Seitengerüst",
  „mach mir ein Power-BI-Design aus unserer Website/Präsi", „Corporate Design
  für meinen Report", „Theme/Farben für Power BI", „Filterpanel + Navigation
  anlegen", „Report-Seite konsistent gestalten", „ändere das Design überall
  auf einmal", „prüf mein Report-Design" — auch wenn er nicht explizit
  „Design-Framework" sagt.
---

# Power BI Design Framework — Interview → Seitengerüst

Hilft menschlichen **und agentischen** Power-BI-Entwicklern, Berichtsseiten
schneller und konsistenter aufzubauen. Kern-Idee: Ein kurzes Interview (oder
eine Branding-Quelle wie Firmen-Präsi/Webseite) → daraus entsteht ein
verbindliches Grundgerüst: Farben, Typografie, Raster, „Chrome" (Navigation,
Logo, Fußleiste, Filter-Panel) und Kachel-Struktur.

> **Sicherheitsprinzip — „vorbereiten + Plan":** Dieser Skill schreibt **nicht
> ungefragt** in eine bestehende PBIP/PBIR-Datei. Er erzeugt Artefakte in
> `design-out/` (Theme, Spec, Schritte) — der Mensch importiert/bestätigt in
> Power BI Desktop. Direktes Schreiben ins `*.Report/` nur auf ausdrücklichen
> Wunsch, mit Backup/Commit vorher.

## Warum ein Framework (und nicht nur ein Theme)
Ein Theme allein macht Farben konsistent — aber nicht Layout, Abstände und
Struktur. Agentische Entwickler brauchen zusätzlich **explizite, maschinen-
lesbare Regeln** (Raster-Koordinaten, Zonen, Verbote), sonst platziert jeder
Agent Visuals anders. Deshalb sind die Ausgaben zweigeteilt: `DESIGN-SPEC.md`
für Menschen, `AGENT-BRIEF.md` als kompakter Regelsatz für Agenten.

## Ablauf

### Schritt 0 · Kontext erfassen
- Gibt es schon ein Projekt (`*.Report/` + `*.SemanticModel/` = PBIP) oder
  startet der Nutzer auf der grünen Wiese? Beides ist okay — der Skill braucht
  kein PBIP, er erzeugt Vorgaben.
- Gibt es eine **Branding-Quelle**? (Firmen-Präsentation `.pptx`/`.pdf`,
  Webseiten-URL, Logo-Datei, bestehendes Corporate-Design-Dokument). Wenn ja:
  zuerst analysieren (Schritt 2), **dann** nur noch die Fragen stellen, die
  die Quelle nicht beantwortet. Das hält den Einstieg nativ und kurz.

### Schritt 1 · Interview (kurz, mit Defaults)
Stelle die Fragen **kompakt in einem Rutsch** und nenne zu jeder den Default —
so kann der Nutzer auch einfach „nimm die Standards" sagen. Fragen, die die
Branding-Quelle schon beantwortet hat, weglassen.

1. **Zweck & Zielgruppe:** Management-Report · operatives Monitoring ·
   Self-Service-Analyse? (prägt Dichte und Detailtiefe)
2. **Branding:** Quelle vorhanden (Präsi/Webseite/Logo)? Sonst: Primärfarbe +
   Akzent nennen, oder neutrale moderne Palette? *(Default: neutral modern)*
3. **Canvas:** 1280×720 (Standard 16:9) oder 1920×1080? *(Default: 1280×720)*
4. **Navigation:** Kopfband mit Seiten-Buttons · linke Nav-Leiste · nur native
   Seitenreiter? *(Default: Kopfband)*
5. **Logo:** vorhanden? Position? *(Default: links im Kopfband)*
6. **Fußleiste:** Datenstand, Quelle, Kontakt/Impressum? *(Default: ja, mit
   Datenstand + Quelle)*
7. **Filter-Panel:** rechts · links · ausklappbar (Bookmark) · keins?
   *(Default: rechts, fest, ~200 px)*
8. **Kachel-Struktur:** KPI-Reihe oben? Wie viele Kern-KPIs (3–5)?
   *(Default: 4 KPI-Kacheln + 2×2-Analyse-Raster)*
9. **Accessibility-Level:** WCAG AA (Kontrast ≥ 4,5:1, Text ≥ 9 pt) reicht
   meist; AAA nur wenn gefordert. Farbfehlsicht-sichere Datenfarben?
   *(Default: AA + farbfehlsicht-geprüfte Palette)*
10. **IBCS-Modus?** Bei Management-Reporting, Plan/Ist/Forecast oder
    ChartKitchen-Einsatz anbieten: Notation regiert die Farben,
    Strukturelemente (Titelblock, Notationsband, Kommentarspalte …) werden
    benannte Slots — siehe
    [`references/ibcs-mode.md`](references/ibcs-mode.md).
11. **ChartKitchen:** Sollen die ChartKitchen-/IBCS-Visuals des Projekts
    eingesetzt werden? *(optional — wenn ja, siehe Schritt 5)*
12. **Komponenten-Seite:** Soll eine versteckte `_Design-System`-Seite mit
    fertigen Bausteinen (Buttons, KPI-Kacheln, Kopfband mit Logo …) zum
    Kopieren entstehen? *(Default: ja — sie ist der größte
    Konsistenz-Hebel, siehe
    [`references/components-page.md`](references/components-page.md))*

### Schritt 2 · Branding extrahieren + prüfen
Wenn eine Quelle existiert, Farben/Schrift daraus ableiten — Vorgehen je
Quellentyp (PPTX-Theme, Webseiten-CSS, Logo-Pixel, PDF) steht in
[`references/branding-extraction.md`](references/branding-extraction.md).
Grundregeln:
- **Eine** Akzentfarbe fürs UI-Chrome, Rest neutral (Grauleiter aus der
  Ink-Farbe). Corporate-Farben sind selten gute **Daten**farben — trennen:
  Chrome-Palette vs. Datenfarben.
- Jede Text-/Hintergrund-Kombination durch den Kontrast-Check jagen:
  `python scripts/check_contrast.py "#<fg>" --bg "#<bg>"` — das Skript
  schlägt bei Verfehlung automatisch eine angepasste Variante vor.
  Nicht per Augenmaß entscheiden; der Check ist der Schiedsrichter.

### Schritt 3 · Grundgerüst entwerfen
Mit den Antworten das Layout festlegen:
- Zonen & exakte Maße (Kopfband, Nav, Filter-Panel, Fußleiste, Content-Raster)
  aus [`references/chrome-layouts.md`](references/chrome-layouts.md) — dort
  stehen fertige, durchgerechnete Varianten für beide Canvas-Größen.
- Gestaltungsregeln (8-px-Raster, Ausrichtung, Weißraum, visuelle Hierarchie,
  Kachel-Regeln, Typo-Skala, Standard-Look „modern-soft", Accessibility) aus
  [`references/design-rules.md`](references/design-rules.md).
- Im IBCS-Modus zusätzlich die Slot- und Override-Regeln aus
  [`references/ibcs-mode.md`](references/ibcs-mode.md).
Zeige dem Nutzer ein kurzes ASCII-Wireframe der gewählten Variante zur
Bestätigung, bevor du die Artefakte schreibst — das ist billiger als ein
Redesign hinterher.

### Schritt 4 · Artefakte ablegen (`design-out/`)
Lege im Projekt (oder aktuellen Ordner) `design-out/` an mit:

- **`theme.json`** — importierbares Power-BI-Theme. Basis:
  [`assets/theme-template.json`](assets/theme-template.json), Aufbau und
  welche Schlüssel wie befüllt werden:
  [`references/theme-json.md`](references/theme-json.md).
- **`DESIGN-SPEC.md`** — das Design-System für Menschen: Farbrollen (mit
  geprüften Kontrastwerten!), Typo-Skala, Zonen-Maße, Wireframe, Do/Don't.
- **`AGENT-BRIEF.md`** — kompakter Regelsatz für agentische Entwickler:
  Canvas-Größe, Zonen als `x,y,w,h`, Raster/Gutter, Kachel-Slots mit
  Koordinaten, Pflicht-Properties je Visual (Titelgröße, Hintergrund,
  Rahmen), verbotene Abweichungen, im IBCS-Modus die benannten Slots.
  Ziel: Ein Agent, der nur diese Datei liest, platziert Visuals konsistent
  zum Rest.
- **`zones.json`** — die Zonen aus dem AGENT-BRIEF maschinenlesbar
  (`{"content": [x,y,w,h], "ignorePages": ["_Design-System"]}`) — direkt
  verwendbar als Eingabe für den Design-Linter (Schritt 6).
- **`STEPS.md`** — exakte Desktop-Schritte: Theme importieren (Ansicht →
  Designs → Nach Designs suchen), Canvas-Größe setzen, Chrome-Elemente
  (Shapes/Buttons/Textfelder) mit den Spec-Maßen anlegen, Filter-Panel bauen
  (inkl. Bookmark-Technik, falls ausklappbar), Komponenten-Seite
  `_Design-System` aufbauen
  ([`references/components-page.md`](references/components-page.md)),
  Tab-Reihenfolge + Alt-Texte setzen.
- Im IBCS-Modus zusätzlich **`theme-ibcs.json`** (Overrides laut
  [`references/ibcs-mode.md`](references/ibcs-mode.md)), damit Standard-
  und IBCS-Look nicht vermischt werden.

### Schritt 4b · Gegen die PBIP-Datei arbeiten (auf Wunsch)
Wenn ein PBIP-Projekt existiert, kann der Skill über `design-out/` hinaus
direkt mit den Report-Dateien arbeiten — Regeln, Risiko-Leiter und die
verifizierten PBIR-Fakten (Container-Objekte, Literal-Kodierung) stehen in
[`references/pbir-integration.md`](references/pbir-integration.md).
Eine „API von Power BI Desktop" für Report-Layout existiert nicht — der
Datei-Weg **ist** die Schnittstelle. Kernwerkzeug ist
`scripts/bulk_restyle.py`:
- **Bulk-Änderungen** („überall Schatten aus, leichte Hintergründe, runde
  Ecken"): `--preset modern-soft` bzw. `--preset ibcs` oder eigene
  `--rules`-Datei. Dry-Run ist Default, `--apply` schreibt mit Backup.
- **Overrides entfernen** (`--strip background,border,dropShadow`), damit
  wieder das Theme regiert — nachhaltiger als Werte hart zu setzen.
- **Design-Linter** (`--check --zones design-out/zones.json`): prüft
  Raster, Schatten-Verbot, Schriftgrößen/-familien, Content-Zone und
  `tabOrder` — als Qualitäts-Gate vor jedem Publish. Nach jedem
  agentischen Seitenbau einmal laufen lassen und Verstöße beheben.

### Schritt 5 · Optional: ChartKitchen einbinden
Wenn der Nutzer ChartKitchen-Visuals will, **nicht duplizieren**, sondern den
Skill `chartkitchen-report` (bzw. `deploy-to-powerbi` für Deneb-Templates)
für Visual-Auswahl und Feld-Mapping nutzen. Dieser Skill liefert dann das
„Wo und Wie groß" (Slots im AGENT-BRIEF) und die Format-Vorgaben; der andere
das „Was und Womit". Im AGENT-BRIEF vermerken, welche Slots für
ChartKitchen-Instanzen reserviert sind.

### Schritt 6 · Verifizieren & übergeben
- Kontrast-Check-Ausgabe in die DESIGN-SPEC übernehmen (Belege, nicht nur
  Behauptungen).
- `theme.json` gegen JSON-Syntax prüfen (`python -m json.tool`).
- Wenn ein PBIP existiert: Design-Linter laufen lassen
  (`python scripts/bulk_restyle.py <Report> --check --zones
  design-out/zones.json`) und das Ergebnis berichten.
- **Layout ansehen statt raten:** `python scripts/render_wireframe.py
  <Report> --zones design-out/zones.json --html` rendert je Seite ein
  SVG-Wireframe (Zonen-Overlay, tabOrder-Badges, Zonen-Verletzungen rot)
  nach `design-out/wireframes/` — der visuelle Feedback-Loop ohne Desktop.
  Nach jedem agentischen Seitenbau rendern und das Ergebnis prüfen/zeigen;
  Linter prüft Zahlen, das Wireframe zeigt Proportionen und Lücken.
- Zusammenfassen: was liegt wo, welche Entscheidungen sind offen, was macht
  der Mensch als Nächstes in Desktop.

## Leitplanken
- Nie ungefragt in `*.Report/`-Dateien schreiben; `design-out/` ist der
  Übergabepunkt. Direktschreiben nur auf Wunsch + Backup, entlang der
  Risiko-Leiter in `references/pbir-integration.md` (additiv vor mutierend;
  `bulk_restyle.py` immer erst als Dry-Run zeigen). `--check` ist immer
  erlaubt — es schreibt nie.
- Bei mehrdeutigem Branding (z. B. drei Kandidaten für die Primärfarbe):
  als **offene Entscheidung** mit Vorschau-Hexwerten vorlegen, nicht raten.
- Kontrast- und Schriftgrößen-Regeln sind nicht verhandelbar nach unten;
  wenn eine Corporate-Farbe AA reißt, die angepasste Variante vorschlagen
  und die Abweichung dokumentieren.
- Keine `.pbix` (binär) anfassen; nur PBIP/PBIR (Text) und `design-out/`.
- Datenfarben-Empfehlungen farbfehlsicht-tauglich halten (keine
  Rot/Grün-einzige Kodierung; Ampeln immer mit zweitem Kanal wie Symbol
  oder Position).
