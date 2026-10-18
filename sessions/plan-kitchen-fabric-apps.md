# Plan · Kitchen für Fabric Apps

_Stand: 18.10.2026 · betrifft die Repos `PowerBI-Kitchen-` und `Fabric-Apps-Demo` · Arbeitsname **dwg cli**_

> **Update 18.10.2026:** Plan auf ein MVP eingedampft (siehe Phasen). Daten kommen in der Regel aus Fabric-Semantikmodellen.
> Start mit dem Adapter für ChartKitchen und P&L: **Spike erledigt, Urteil Go.** Code, Messwerte und Screenshots in
> [`dwg/visuals/`](../dwg/visuals/README.md). 17 von 17 Browser-Prüfungen grün, Original-Visuals ohne Codeänderung,
> Querfilter per Klick, Dark Mode, 210–480 ms bis vier Visuals stehen, ChartKitchen 218 KB / P&L 139 KB gzip.

## Ziel

Eine Fabric App mit IBCS-inspirierten Grafiken soll in Minuten stehen, nicht in einer Stunde Agentenarbeit:

```bash
npx dwg new vertrieb --blueprint monitoring --model "Vertriebscontrolling" --workspace dev
npx dwg up
```

Drei Grundsätze:

1. **Die echten Kitchen-Visuals rendern, keine Nachbauten.** ChartKitchen und P&L Statement laufen in der App mit
   demselben Code wie in Power BI. Jede Verbesserung am Visual kommt automatisch in den Apps an.
2. **Ein Standard ohne MockupKitchen.** Blaupausen (Monitoring, Monatsreport, Sales-Analyse, GuV) liefern Seiten,
   Kacheln und Feld-Mapping. Die MockupKitchen ist der optionale, reichere Eingang in dasselbe Format.
3. **Rayfin bleibt der Unterbau.** Wir bauen eine dünne Schicht darauf (Pack, Template, CLI), das Deployen macht `rayfin up`.

## Ausgangslage (Befund)

**Die Apps bauen die Visuals nach.** In `Fabric-Apps-Demo/apps/` sind `VarIntChart`, `TimeChart`, `StructureBridge`,
`SmallMultiples`, `DriverTree` und die GuV-Engine Handportierungen der ChartKitchen- bzw. P&L-Renderfunktionen
(`varint.ts` sagt es im Kopfkommentar selbst). Je App gibt es eine eigene Fassung:

| Datei | Fassungen in 6 Apps |
| --- | --- |
| `rayfin-auth.service.ts`, `rayfin-client.ts`, `use-theme.ts` | 1 (identisch kopiert) |
| `use-semantic-model-query.ts` | 1 (in 5 Apps) |
| `Tile.tsx`, `ibcs/Ibcs.tsx`, `global.css` | 2 |
| `varint.ts`, `VarIntChart.tsx`, `KpiCards.tsx`, `FilterPanel.tsx` | 3 bis 4 |
| `lib/pnl/engine.ts` (555 Zeilen) gegen `pnlByDatenWG/src/engine.ts` (1.069 Zeilen) | Teilport |

**Die Visuals laufen schon außerhalb von Power BI.** Beide Test-Harnesses bündeln `src/visual.ts` mit esbuild, ersetzen
`powerbi-visuals-api` durch einen leeren Shim (`test/pbi-shim.js`) und reichen einen nachgebauten Host plus DataView
herein (`makeHost()` in `ibcsInspiredChartDeck/test/test.html`). Gezeichnet wird reines SVG per `createElementNS`, ohne d3.
Beim P&L-Visual sind `engine.ts`, `waterfall.ts` und `megatable.ts` bereits frei von Power-BI-Importen.

**Rayfin hat einen Erweiterungsweg.** Das Microsoft-Template `universal-app` (Basis aller sechs Apps) kennt
Capability Packs: `npm run pack:add -- <pack>` liest `.agents/skills/<pack>/pack.json`, kopiert ein `kit/`, ergänzt
Abhängigkeiten und setzt Schalter in `rayfin/rayfin.yml`. Eigene Templates gehen über `rayfin-template.yml` und
`npx rayfin init <app> -t <git-url>#<tag>`.

**Die Regeln liegen als Text vor:** `Fabric-Apps-Demo/memory/04-design-ibcs.md` (Notation, Farben, Interaktion),
`03-daten.md` (Datenfallen), `02-rayfin-deploy.md` (Deploy-Ablauf mit zweitem `rayfin up`).

**Drei verschiedene Teal-Töne für „gut":** Apps `#117865`, ChartKitchen `#1E8F9E`, P&L `#0E8585` (Rot: `#c0392b`,
`#D64541`, `#E02B1D`). Muss vor dem Token-Paket entschieden werden.

## Architektur

```
                   ┌──────────────────────────────┐
 MockupKitchen ──► │  app-spec.json               │ ◄── Blaupause (Standard)
 (optional)        │  Seiten · Kacheln · Rollen · │     monitoring · monatsreport
                   │  Visual-Props · Filter       │     sales · guv
                   └──────────────┬───────────────┘
                                  │  dwg new / dwg add
                                  ▼
 ┌─────────────────────────────── Rayfin-Projekt (universal-app) ─────────────────────────────┐
 │  Pack kitchen-ibcs                                                                          │
 │   ├─ Rahmen: Kopfband + Nav, KPI-Leiste, Kachelraster, Filterpanel + Chips, Fußzeile, Tile   │
 │   ├─ Tokens + Dark Mode (eine Quelle)                                                       │
 │   ├─ Daten: Query-Hook, Würfel laden, Text-/Datums-Normalisierung, Szenario-Logik           │
 │   └─ @dwg/visuals                                                           │
 │        <ChartKitchen kind="varint" …/>   <PnlStatement …/>                                  │
 │        = originaler visual.ts + Host-Adapter (DataView, Auswahl, Tooltip, Theme, Sprache)   │
 └─────────────────────────────────────────────────────────────────────────────────────────────┘
                                  │  dwg lint · dwg check · dwg up
                                  ▼
                        rayfin up (+ connector apply + zweites up)
```

**Der Kern: eine Kachel-Definition für beide Welten.** Eine Kachel wird so beschrieben, wie MockupKitchen sie heute schon
exportiert und wie PBIR sie in `visual.json` speichert:

```json
{ "kind": "varint", "title": "Umsatz", "message": "auto",
  "roles": { "category": "Kalender[Monat]", "actual": "[Umsatz AC]", "reference": "[Umsatz PY]" },
  "props": { "chart": { "bridgeOrientation": "auto" } } }
```

`props` sind dieselben Objekte wie in `capabilities.json` des Visuals. Damit rendert dieselbe Definition in Power BI
(über den Skill `chartkitchen-report`) und in der App (über den Host-Adapter).

## Bausteine

### A · `@dwg/visuals` (Host-Adapter)

Liegt im Repo `PowerBI-Kitchen-` neben dem Visual-Code, damit Adapter und Visual zusammen versioniert und getestet werden.

- **Build:** esbuild bündelt `ibcsInspiredChartDeck/src/visual.ts` und `pnlByDatenWG/src/visual.ts` als ESM mit
  Shim, kompiliertes `visual.less` als CSS. Keine Änderung am Visual-Code nötig (Ziel), höchstens kleine Hooks.
- **`buildDataView(roles, rows, meta)`:** baut aus DAX-Zeilen (`{columns, rows}` des Konnektors) eine kategoriale
  DataView mit Rollen, Formatstrings und Anzeigenamen.
- **`createHost(opts)`:** auf Basis von `makeHost()` aus dem Harness.
  - Auswahl: `createSelectionIdBuilder` liefert Schlüssel der Zeilen, `select()` ruft `onSelect(keys)` → Querfilter
    und Filter-Chips der App.
  - Tooltips → Tooltip der App. `persistProperties` (z. B. Auf-/Zuklappen im P&L) → URL-Hash.
  - `locale` (DE/EN), Farbpalette und Hintergrund für Dark Mode, `allowInteractions`, `eventService` als No-op.
- **React-Hülle:** `<ChartKitchen>` und `<PnlStatement>` mit ResizeObserver → `update({viewport})`.
  In der App immer `emptyMode` ohne Start-Hub und Demo, Lesemodus.
- **Paritätstest:** die vorhandenen Harness-Fälle laufen zusätzlich über die Hülle, SVG-Vergleich gegen den Harness.

### B · Pack `kitchen-ibcs` und Template `kitchen-cockpit`

Liegt im Repo `Fabric-Apps-Demo` (neuer Ordner `kitchen/`).

- **Pack** im Format von `pack.json`: kopiert Rahmen, Tokens, Daten-Helfer und Adapter ins Projekt, setzt
  `services.data.enabled: false` und den Konnektor-Schalter, bringt einen Agent-Skill mit (`SKILL.md` mit den Regeln aus
  `memory/04` und dem Ablauf aus `memory/05`).
- **Rahmen** aus der jeweils besten Fassung der Apps zusammengeführt: `Tile` (Titel, Untertitel, Kernaussage, Zoom,
  einklappbar), `KpiCards` mit KPI-Auswahl, `FilterPanel` mit Chips, Kopfband, Seiten-Navigation im URL-Hash, Dark Mode.
- **Daten-Helfer** aus `memory/03`: Würfel laden und im Browser rechnen, `str()`-Zwang, Trim inkl. U+00A0, Datum auf
  10 Zeichen, fehlende Spalten abfangen, PY aus AC Vorjahr, VP wenn es kein Vorjahr gibt.
- **Template** `kitchen-cockpit` = `universal-app` + Pack vorinstalliert + Beispielseite, verteilt per Git-Tag:
  `npx rayfin init my-app -t https://github.com/…/kitchen-cockpit.git#v1.0.0`.

### C · App-Spec und Blaupausen (Standard ohne MockupKitchen)

- **`app-spec.json`** ist eine Teilmenge der MockupKitchen-Spec: `meta`, `pages[]` (Name, Frage, Kacheln, Layout als
  Spuren), `visuals[]` (kind, roles, props, message), `filters[]`, `fields[].semantics`. Ein JSON-Schema prüft sie.
- **Blaupausen** übernehmen die Seitenfolgen der Skills `chartkitchen-report` (`references/blueprints.md`, inkl.
  Settings je Seite) und `pnl-report`. Jede folgt dem Shneiderman-Mantra (Übersicht → Zoom/Filter → Details):

| Blaupause | Seiten (ChartKitchen-Modus bzw. Visual) |
| --- | --- |
| `monitoring` | S1 Cockpit: `cards` mit Benchmark + Small Multiples je Bereich (gleiche Skala) · S2 Trend (opt.): `columns`/`line` mit Varianz |
| `monatsreport` | S1 Summary: `cards` + `columns` mit Varianz · S2 Abweichung: `waterfall`/`catbridge`, `intwaterfall` über Zeit · S3 Regionen: `table` mit Spaltengruppen oder Small Multiples · S4 GuV: P&L Statement · S5 Detail (opt.): `table` |
| `sales` | S1 Overview: `cards` + Small Multiples je Region · S2 Struktur: `pareto`, `bars` mit Varianz, `dumbbell` · S3 Trend: `columns`/`line`, `intwaterfall`, `slope` · S4 Details: `table` Kunde × Produkt × Zeit (Ziel des Detailpanels) |
| `guv` | P&L Statement (reine Hierarchie oder volle GuV mit Formelzeilen, wie im Skill `pnl-report`) · Treiberbaum (`columns.treeRoot`) · Mega-Table (z. B. 12G YTD + Restjahr) |

- **Feld-Mapping ohne Mockup:** `dwg map` liest das Semantikmodell (Rayfin-Skill `schema-discovery` bzw. TMDL),
  schlägt Rollen per Namensregel vor (dieselbe Regel wie `catalog.js` für AC/PY/PL/FC, inkl. Fix R1) und fragt nur die
  offenen Punkte ab: Zeitfeld, Vergleich, Polarität je KPI, additiv ja/nein. Ergebnis landet in `app-spec.json`.

### D · CLI `dwg` (Arbeitsname)

Node-Paket `@dwg/cli`, dünn, ruft Rayfin und npm auf.

| Befehl | Zweck |
| --- | --- |
| `dwg doctor` | Node, npm 11, Rayfin-Login, Region und Tenant-Schalter als Hinweisliste |
| `dwg new <app> [--blueprint …] [--from mockup-spec.json] --model … --workspace …` | `rayfin init` mit Template, Konnektor anlegen, App-Spec erzeugen, Seiten und Kacheln generieren, DAX-Abfragen als `.dax` |
| `dwg map` | Feld-Mapping vorschlagen und prüfen |
| `dwg add page \| tile` | Seite oder Kachel aus Katalog ergänzen |
| `dwg lint` | IBCS- und Textregeln (siehe unten) |
| `dwg check` | typecheck, ESLint, Tests, Build in einem Lauf |
| `dwg up [--workspace …]` | `rayfin up`, bei Semantikmodell-Konnektor `connector apply` und zweites `up`, Ausgabe URL als JSON |

**Regeln für `dwg lint`** (aus `memory/04` und den Visual-Regeln):
Brücke nur bei additiven KPIs · keine Brücke gegen Vorwoche · VP statt PY, wenn kein Vorjahr · Polarität je KPI gesetzt ·
gemeinsame Skala für vergleichbare Kacheln · Szenario-Notation nur über Tokens, keine freien Farben ·
jede Kachel hat Titel und Kernaussage · keine Gedankenstriche in UI-Texten · IBCS-Markenhinweis genau einmal ·
keine externen CDNs.

### E · MockupKitchen-Brücke

Im Repo `PowerBI-Kitchen-`, `assets/mockup/`:

- Zielschalter `meta.targets: ["powerbi", "fabric-app"]`, Export „App-Spec" zusätzlich zu Spec und Brief.
- Optionale Blöcke aus dem Persona-Review vom 09.10.: `fields[].semantics`, `filters[]` (feste Filter), `page.behaviour`
  (KPI-Auswahl, Zoom, Periodenwechsel, Detailpanel), `layoutTree` als Spuren-Vertrag.
- Kacheln mit Engine `ck` und `custom` (`pnlByDatenWG`) gehen 1:1 in die App-Spec, native Typen werden auf den
  nächstliegenden ChartKitchen-Modus abgebildet oder als „nicht unterstützt" gemeldet.

## Phasen (MVP)

Jede Stufe endet mit einer Go/No-Go-Entscheidung. Aufwand grob in Arbeitstagen mit Agenten.

| Stufe | Inhalt | Ergebnis / Abnahme | Aufwand | Stand |
| --- | --- | --- | --- | --- |
| **1 · Spike Adapter** | ChartKitchen (Karten, VarInt, Brücke) und P&L (GuV) über Host-Adapter, Querfilter, Dark Mode, DAX-Generator | 17/17 Browser-Prüfungen, Messwerte, Screenshots | 1 | **erledigt, Go** |
| **2 · Adapter ausbauen** | React-Hülle `<DwgVisual>`, alle ChartKitchen-Modi und P&L-Ansichten als Paritätstests gegen die Harness-Fälle, Kontextmenü → Detailpanel, `persistProperties` live, Sprachressourcen je Sprache nachladen, Toolbar-Frage klären | Paritätstests grün, Hülle in einer Vite-Seite | 3–4 | offen |
| **3 · Eine App umstellen** | Sales Cockpit: Nachbauten (`VarIntChart`, `TimeChart`, `StructureBridge` …) durch `@dwg/visuals` ersetzen, Daten per `daxQuery` aus dem Semantikmodell | Tests grün, Sichtvergleich alt/neu online durch Michael. **Go/No-Go für den Rest** | 2–3 | offen |
| **4 · Template + Skill** | Template `kitchen-cockpit` (Rahmen, Tokens, Adapter), Agent-Skill mit Blaupausen und IBCS-Regeln statt eigener CLI | `rayfin init -t …` ergibt lauffähige App mit Blaupause | 3–4 | offen |
| **5 · `dwg` CLI** | `new`, `map`, `add`, `lint`, `check`, `up`, `doctor`, erst wenn Stufe 4 stabil ist und andere es nutzen sollen | Deploy in Dev-Workspace mit einem Befehl | 2–3 | später |
| **6 · Restliche Apps** | Finance, Auslastung, Rhein, PnL (Library bleibt) | je App Tests grün, Sichtprüfung | je ~1 | später |
| **7 · MockupKitchen-Brücke** | Zielschalter `fabric-app`, App-Spec-Export, Zusatzblöcke | `dwg new --from` aus dem Review-Mockup | 3–5 | später |

Zurückgestellt bis nach Stufe 3: npm-Veröffentlichung, CLI, MockupKitchen-Brücke.

**Datenweg:** Standard ist `daxQuery()` je Kachel gegen das Semantikmodell. Die Zahlen kommen dann aus den Measures
und stimmen mit dem Power-BI-Bericht überein (keine zweite Wahrheit). Das Würfel-Muster aus `memory/03` (einmal laden,
im Browser rechnen) bleibt für Seiten, die Interaktion ohne Wartezeit brauchen. In Stufe 3 messen: Wartezeit je Klick
und das API-Limit von 120 Abfragen pro Minute und Nutzer.

## Risiken

| Risiko | Gegenmaßnahme |
| --- | --- |
| Visual zeichnet bei jedem `update` die ganze SVG neu, mit 8+ Kacheln und Zoom zu langsam | im Spike messen, Updates bündeln, nur sichtbare Kacheln rendern |
| Bundle zu groß (zwei Visuals mit zusammen ~23.000 Zeilen) | messen, Visuals per dynamischem Import nur bei Bedarf laden |
| Visual nutzt Host-Funktionen, die der Shim nicht abdeckt (Kontextmenü, Drillthrough, Download) | Liste aus `makeHost()` übernehmen, fehlende als No-op mit Warnung, Drillthrough → Detailpanel der App |
| Auswahl-Logik: in Power BI filtert die Engine, in der App die App | Auswahl-IDs tragen Zeilenschlüssel, Filter-Zustand in einem App-Context |
| Rayfin und `universal-app` sind Preview, Pack-Format ist intern | eigenes Template als Rückfallebene, Versionen pinnen, Deploy nur über `rayfin up` |
| Zweite Wahrheit: KPIs im Browser statt im Modell (`memory/03`) | Kontrollwerte aus dem Modell als Unit-Tests, `fields[].semantics` dokumentiert die Rechnung |
| Online-Prüfung braucht Fabric-SSO, Agenten können sich nicht anmelden | Abnahme online bleibt bei Michael, lokal Playwright gegen Fixture-Daten |

## Offene Entscheidungen

1. **Verteilung des Adapters:** öffentliches npm-Paket `@datenwg/…` (wie die Visuals Open Source), Git-Tag, oder
   als Kopie im Pack? Empfehlung: zuerst Kopie im Pack, npm ab Stufe 5.
2. **Eine Farbe für gut/schlecht:** `#1E8F9E`/`#D64541` (ChartKitchen), `#0E8585`/`#E02B1D` (P&L) oder `#117865`/`#c0392b`
   (Apps)? Empfehlung: ChartKitchen-Werte, weil das Visual sie in der App ohnehin zeichnet.
3. **App-eigene Grafiken:** Ports ganz ersetzen oder dort behalten, wo die App mehr kann (z. B. Zoom zu Small Multiples,
   Simulation im PnL)? Empfehlung: ersetzen, App-Extras als Hülle um das Visual.
4. ~~Name der CLI~~ entschieden: Arbeitsname `dwg cli`, Pakete `@dwg/visuals`, später `@dwg/cli`.
5. **Öffentlich oder privat:** `Fabric-Apps-Demo` ist privat. Pack, Template und CLI eigenes öffentliches Repo?

## Nächster Schritt

Stufe 2 (Adapter ausbauen) und parallel Entscheidungen 1–3. Danach Stufe 3 im Repo `Fabric-Apps-Demo` auf einem Branch.

IBCS® ist eine eingetragene Marke des IBCS Institute. Die Kitchen-Visuals sind an IBCS angelehnt, nicht zertifiziert.
