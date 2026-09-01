# P&L Statement byDatenWG — Feld-Vertrag (Datenrollen + Format-Properties)

Verifiziert aus `pnlByDatenWG/capabilities.json` (dataRoles, dataViewMappings,
objects), `pnlByDatenWG/src/settings.ts` (Enum-Werte) und
`pnlByDatenWG/stringResources/de-DE.json` (deutsche Anzeigenamen).
**Nur diese Namen/Werte verwenden** — nichts erfinden. Im Zweifel in die
Quelldateien schauen, sie sind die maßgebliche Wahrheit.

Visual-GUID: `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358`
Version: **0.17.0.0 (Beta)** · API 5.11.0 · `supportsMultiVisualSelection: true`

## Datenrollen (dataRoles)
„kind": Grouping = Feld/Dimension (landet in `categorical.categories`),
Measure = Kennzahl (`categorical.values`). „max" aus den `conditions`.

| name | Anzeige (DE) | kind | max | Zweck |
|---|---|---|---|---|
| `levels` | Ebenen-Spalten (L1..Ln) | Grouping | 8 | Sternschema-Hierarchie; **Reihenfolge = Ziehreihenfolge** |
| `account` | Konto-ID (Key) | Grouping | 1 | eindeutiger, stabiler Schlüssel; trägt Selektion + Drillthrough |
| `accountName` | Kontoname | Grouping | 1 | Anzeigename |
| `parent` | Parent-Konto-ID | Grouping | 1 | Parent-Child-Modus (unbalanciert erlaubt) |
| `sortOrder` | Sortierung | Grouping | 1 | Reihenfolge innerhalb des Parents |
| `rowType` | Zeilentyp | Grouping | 1 | `Account` · `Subtotal` · `Formula` · `KPI` · `Separator` |
| `formulaDef` | Formeldefinition | Grouping | 1 | z. B. `[EBITDA]/[Net revenue]`; `+ - * /`, Klammern, Formel auf Formel |
| `signConvention` | Rechenvorzeichen (±1) | Grouping | 1 | Erlös `+1`, Kosten `-1` |
| `displayInvert` | Anzeige invertieren | Grouping | 1 | Kosten positiv anzeigen (Text „true"/„false" wird selbst geparst) |
| `varianceInvert` | Abweichungsfarbe drehen | Grouping | 1 | Kosten/Steuern unter Plan = günstig |
| `period` | Periode (Monat) | Grouping | 1 | Monatssäulen, Sparklines, MTD/YTD |
| `comment` | Kommentar | Grouping | 1 | Freitext je Konto → Marker + Fußnote |
| `ac` | AC (Ist) | Measure | 1 | **Pflicht** |
| `py` | PY (Vorjahr) | Measure | 1 | optional |
| `pl` | PL (Plan / Budget) | Measure | 1 | optional |
| `fc` | FC (Forecast) | Measure | 1 | optional, schraffiert |
| `fcFy` | FC Gesamtjahr (Ausblick) | Measure | 1 | Jahres-**Skalar** → `MAX`/`AVERAGE`, nie `SUM` |
| `plFy` | PL Gesamtjahr | Measure | 1 | Jahres-**Skalar** → `MAX`/`AVERAGE`, nie `SUM` |

**DataView**: `categorical` mit `dataReductionAlgorithm.window.count = 30000` —
darüber meldet das Visual sichtbar eine Warnung statt still zu kappen.

## Format-Objekte (`objects`) — Property-Schlüssel im PBIR `objects.<card>`

### `columns` (Karte „Spalten")
| Property | Typ / Werte | Zweck |
|---|---|---|
| `preset` | enum `full` · `acref` · `dall` · `acpydpy` · `acpldpl` · `dpct` | Standard-Spalten-Preset |
| `reference` | enum `auto` · `py` · `pl` · `fc` | Standard-Δ-Referenz (auto = PL, sonst PY) |
| `periodSort` | enum `auto` · `data` · `calendar` | Perioden-Sortierung; `data` = Datenreihenfolge (**Fiskaljahr**) |
| `pctRevenue` | bool | %-vom-Umsatz-Spalte |
| `revenueBase` | text | Umsatz-Basiszeile (ID oder Name); leer = „Net revenue" |
| `hideZeroRows` | bool | Nullzeilen ausblenden |
| `fitWidth` | bool | Tabelle auf Breite einpassen |
| `treeRoot` | text | Wurzelzeile Treiberbaum (ID, Name oder Kategorie) |
| `treeLevel` | numeric | Start-Tiefe (0 = ganzer Baum) |
| `treeCard` | enum `months` · `delta` · `bridge` | Karten-Diagramm im Baum |
| `treeStatus` | bool | Status-Indikator der Karten (Δ-Farbe) |

### `numbers` (Karte „Zahlen")
`scaling` (enum `auto` · `none` · `k` · `m`), `unitText` (text),
`decimals` (numeric), `pctDecimals` (numeric).

### `style` (Karte „Stil")
| Property | Typ / Werte | Zweck |
|---|---|---|
| `colorMode` | enum `teal` · `ibcs` | Abweichungsfarben (teal = dokumentierte Abweichung, Standard) |
| `density` | enum `normal` · `compact` | Standard-Dichte |
| `fontPreset` | enum `hd` · `fullhd` · `uhd` | Schriftgrößen-Preset |
| `fontZoom` | numeric (80–160) | Schrift-Feinskalierung in %; Produkt mit Preset bei 2,2 gedeckelt |
| `headerFontSize` | numeric | Schriftgröße Kopfzeilen (0 = automatisch) |
| `headerColor`, `goodColor`, `badColor`, `accentColor` | fill `{solid:{color}}` | Farb-Überschreibungen |
| `stickyHeader` | bool | Kopfbereich fixieren |
| `pageBackground`, `cardBackground` | fill | Hintergründe |
| `interactions` | bool | **Selektion & Kontextmenü aktiv** (aus = Stand vor 0.17) |

### `titleBlock` (Karte „Titelblock")
`show` (bool), `unitLine` · `measureLine` · `periodLine` · `message` (text) —
der dreizeilige IBCS-Titel plus optionale Message-Zeile.

### `hierarchy` (Karte „Hierarchie")
`defaultLevel` (numeric, Standard-Aufklapp-Ebene), `indent` (numeric, px je Ebene).

### `toolbar` (Karte „Toolbar")
`show` (Toolbar ganz aus/an), `showLegend`, und je Gruppe: `showView`,
`showPresets`, `showReference`, `showPeriods`, `showUnit`, `showDensity`,
`showLevels`, `showOptions` (alle bool). Ausgeblendete Gruppen wirken weiter —
sie sind nur nicht mehr umschaltbar.

### `state`
`uiState` (text) — vom Visual selbst per `persistProperties` gepflegter
Toolbar-/Baum-Zustand (bookmark-fähig). **Nie von Hand schreiben.**

## Belegungsregeln
- `levels` **oder** `parent`; sind beide gebunden, **gewinnt Parent-Child**.
- Alle Grouping-Rollen im Feldbereich auf **„Nicht zusammenfassen"**.
- `ac` ist Pflicht; ohne `period` gibt es keine Monatssäulen, Sparklines und
  keinen MTD/YTD-Block.
- `fcFy`/`plFy` sind Jahres-Skalare (auf jeder Monatszeile identisch) →
  Measure mit `MAX`/`AVERAGE`.
- Formelzeilen referenzieren **Zeilennamen**, nicht IDs — Namen müssen
  eindeutig sein.
- Ein Berichtsjahr filtern, sonst summieren AC/PY/PL/FC über Jahre.
- Drillthrough-Feld auf der Zielseite = die im Visual gebundene `account`-Spalte;
  ohne `account` die **erste** `levels`-Spalte.
