# ChartKitchen byDatenWG — Documentation

> Markdown version of [chartkitchen-doku_en.html](../chartkitchen-doku_en.html) · https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html · generated with scripts/build_md.py — if the two differ, the HTML version prevails.

Power BI visual · End-user documentation

An IBCS-inspired chart deck for Power BI: 13 chart modes in a single visual, with a consistent scenario notation (AC filled, PY grey, PL outlined, FC hatched) and variances built in throughout. This documentation takes you from import through the 13 modes and the key features to the complete settings reference.

Version · **1.53.0.0** · As of · **2026-10-24** · IBCS-inspired

## Contents

1. [What is ChartKitchen?](#intro)
2. [The product family](#family)
3. [The start hub](#hub)
4. [Quick start](#quickstart)
5. [The 13 modes](#modes)
6. [ChartKitchen in action](#inaction)
7. [Features in detail](#features)
8. [Settings reference](#settings)
9. [FAQ & troubleshooting](#faq)

## 01 · What is ChartKitchen?

**ChartKitchen byDatenWG** is a single Power BI custom visual that unifies 13 chart modes — from columns, bars and lines through waterfall and bridge layouts to an IBCS table (with a matrix variant), KPI cards, a full P&L statement and a scatter/bubble plot for correlations. Instead of picking a different visual for every question, you switch the orientation and keep the same notation, colours and scaling logic. For the income statement in depth there is the sister visual [P&L Statement byDatenWG](../pnl-doku_en.html) — same notation, same start hub; chapter 02 “The product family” shows how the two work together.

The design is inspired by the **IBCS® principles** (International Business Communication Standards): one consistent scenario notation — **AC** (actual) filled, **PY** (prior year) grey, **PL** (plan) outlined, **FC** (forecast) hatched — and variances that are always present: absolute and relative variance panels appear automatically next to or above the base chart. Every chart reads by the same rules, whichever mode you choose.

This guide describes the state of version **1.53.0.0**. The count matches the visual itself: 13 chart types — the matrix is not a separate type but the table with the column role filled; it still gets its own card in chapter 05. New since 1.48: the start hub for getting started (chapter 03), the IBCS templates C01–C13, loading up to 30,000 rows, bookmarks that restore the selection, locked instead of silent chips, selectable empty states and real high contrast (chapter 07). Since 1.52 the visual scales according to IBCS 2.0 / ISO 24896 (chapter 07, “Scaling according to IBCS 2.0 / ISO 24896”). New in 1.53: row structure as a data contract via [rowType tokens](#rowtype), negative values in both bridges (chapter 05) and a tested [export layout](#export) with honest limits in the Power BI service (chapter 07).

## 02 · The product family

ChartKitchen and P&L Statement are two visuals from one kitchen: the same IBCS notation, the same handling, the same start hub. They do not compete, they complement each other — ChartKitchen covers the **breadth** of chart forms, P&L Statement the **depth** of the income statement.

### Which visual for what?

Breadth · 13 chart modes

#### ChartKitchen byDatenWG

One visual for every question about trend, structure and correlation — “How is … developing?”, “Who drives …?”.

- **Time series:** columns and line, the integrated bridge PY → AC across the months, hatched forecast, YTD at a click.
- **Structures:** bars, category bridge, Pareto, dumbbell and slope, plus the IBCS table and matrix.
- **Scatter & bubble:** two measures against each other, with quadrants, trend line, movement arrows and play mode.
- **KPI cards:** monitoring tiles with status light, bullet against a benchmark and trend sparkline.
- **Small multiples:** one tile per region or product, all on the same scale, with Σ and top-N tiles.

✓ This documentation

Depth · tables & statements

#### P&L Statement byDatenWG

The income statement row by row — “What is in the P&L, and why does it deviate?”.

- **Mega table:** the IBCS table templates T01–T04 plus 12A, 12G and 12H — value cascades, Δ waterfalls, pins, thresholds.
- **Formula engine:** hierarchy, subtotals, formula and margin rows straight from the account dimension (level columns or parent-child).
- **Value driver tree:** the formula graph as a DuPont tree with mini charts on every card and a tile zoom per node.
- **Period blocks:** month · YTD · FY outlook side by side; readers switch columns, reference and unit in the toolbar.
- **Structure bars & row waterfall:** the same P&L rows as size bars or as a cascade with result anchors.

[Go to the P&L docs →](../pnl-doku_en.html#family)

> **A typical report page uses both side by side** — the P&L from P&L Statement on the left, ChartKitchen with the monthly trend, a driver bridge or KPI cards on the right. With `fixedMax` they share the scale: enter the same amount in ChartKitchen under *Scale & reference line → Scale minimum maximum* and in P&L Statement under *Numbers → Scale minimum-maximum (values)* — equal amounts then give bars of equal length (IBCS: identical scales).

### Shared handling

If you can operate one of the two visuals, you can operate the other: getting started, templates and rendering follow one shared specification. The table lists what is the same and where it sits in each visual.

| Shared | ChartKitchen | P&L Statement |
| --- | --- | --- |
| **Start hub** 🚀 Get started plus four buttons: tour · template gallery · demo · explain fields — edit mode only. | Tour with 11 cards, demo = gallery of the 13 chart types, field guide with all 19 roles. | Tour with 7 cards (real mini renderings), demo = example P&L, field guide with all 20 roles. |
| **Templates as presets** Gallery by purpose; one click sets every switch, afterwards everything is free. “↺ Back to template” restores the template state. | 11 IBCS chart templates C01–C13 (without C07/C11) in four groups; ↺ at the bottom left of the chart. | 17 IBCS table templates T01A–12H plus the classic table in four groups; ↺ next to the template dropdown. |
| **Font size HD · Full HD · UHD** Bar at the bottom of every hub page, with “📖 Open docs” on the right. | Saves *Data labels → Size preset* (in the format pane HD · Full HD · UHD; ×1 · ×1.5 · ×2). | Saves *Style → Font size preset* (HD · Full HD · UHD; ×1 · ×1.25 · ×1.6). |
| **IBCS notation, teal by default** AC filled, PY grey, PL outlined, FC hatched; favourable variances teal instead of green — readable with red–green colour-vision deficiency. | Teal #1E8F9E · red #D64541; colour preset blue/orange. | Teal #0E8585 · red #E02B1D; presets IBCS green and blue/orange. |
| **Four languages** German, English, Spanish, Japanese — follows the report language, in the hub too. | Format pane, chart texts and hub. | Format pane, toolbar, statement and hub. |
| **Dark mode & high contrast** “Auto” detects dark report themes; in high contrast, patterns instead of colours carry the message. | *IBCS colors → Appearance*. | *Style → Appearance*. |
| **Keyboard** Every button via Tab, Enter or Space triggers, Esc goes back one level or closes. | Tour: ‹ ›, arrow keys, Home/End. | Hub: digits 1–4 open the buttons; tour: ‹ › and arrow keys. |
| **Reader landing** Without data, readers and exports see a calm card without buttons; the author's own empty-state text wins. | Since 1.51.1. | Since 1.4.1. |

## 03 · The start hub

Drag ChartKitchen onto a report page without fields and you do not get an error message but the **start hub** (since 1.50, polished for controller self-service in 1.51 and 1.51.1). It is an author's tool: it appears in edit mode only, while no data is displayed — or on demand via ☰ Start. Readers and exports never see it, and nothing of the navigation inside the hub is saved in the report.

### The start page: get started and four buttons

At the top sit the product name and the line “Start — pick what you want to do first”, below it the full-width teal button **🚀 Get started** and four large entry tiles:

- **What can the visual do?** — a feature tour in 11 cards with mini previews: the 13 chart modes in four groups (time series, structure, bridges & P&L, analysis), variance panels, small multiples, comments, dark mode & high contrast, play & animation, YTD/materiality/exceptions, and templates & Smart-Start. Page with ‹ ›, the arrow keys or Home/End; “Open templates →” jumps to the gallery, the last card leads home with “← Back to start”.
- **Templates** — the template gallery by purpose (see below).
- **View demo** — the gallery of all 13 chart types with mini previews and the fields each mode needs; a click picks the mode. Up to 1.49 this was the landing page.
- **Explain fields** — all 19 data roles in four sections (required & axis · scenarios · breakdown · special), each with a short purpose and ✓ once bound. Plus two premise boxes: *IBCS notation* (AC filled · PY grey · PL outlined · FC hatched, good/bad) and *time vs. structure* (“time runs horizontally, structure vertically”). Whatever does not fit on one page pages with ‹ n / N ›.

Every sub-page carries the **“← Back”** pill at the top left; Esc goes back as well. Every button is reachable with Tab and triggers with Enter or Space. Dark mode and high contrast apply in the hub too.

### The template gallery by purpose

The eleven IBCS templates (chapter 07) appear as tiles with a preview in four groups. Every tile names its purpose in finance language, with a benefit line below; the C number sits as a small badge in the preview. Groups that fit side by side share a row; with little space the gallery pages row by row.

| Group | Template | Tile title | Benefit line |
| --- | --- | --- | --- |
| **Time series** | C01 | Stacked columns by segment | Revenue mix per month |
|  | C03 | Columns with prior-year variance | Monthly report AC vs. PY |
|  | C05 | Integrated year bridge | PY → AC/FC across the months |
|  | C08 | Line for long series | Weekly or daily trend vs. PY |
| **Structure** | C02 | Stacked bars by segment | Cost structure per unit |
|  | C04 | Bars with plan variance | Regions or products AC vs. PL |
|  | C06 | Driver bridge by category | Which units explain ΔPY? |
| **Correlation** | C09 | Scatter with quadrants | Revenue vs. margin per customer |
|  | C10 | Bubble chart | Plus volume as bubble size |
| **Bridges & multiples** | C12 | Waterfall / P&L bridge | Revenue → EBIT step by step |
|  | C13 | Small multiples | One chart per region, same scale |

- **Click = apply.** The tile writes the same as the dropdown in the format pane — the template and all its settings in one save. The active template carries “✓ active” and a strong border; clicking it again applies it once more.
- **Without fields** the choice is saved (“✓ C03 saved — becomes active as soon as fields are bound”) and takes effect on binding. If a template needs another field (stack series, bubble size, small multiples), the tile names it.
- **In the overlay** (via ☰ Start) a click applies the template and closes the overlay so you see the result right away.

### 🚀 Get started — the first three minutes

The highlighted button opens a guided checklist. The ticks follow live; none of it is saved.

1. **Bind fields** — ✓ per role: Actual (AC) is required, category, previous year (PY) and plan (PL) are recommended; a hint shows where the field wells are.
2. **Pick a template** — jump into the template gallery; ✓ once a template is set.
3. **Fine-tune** — comparison & variance, IBCS title and size preset.

### The bottom bar: font size and docs

Every hub page — start, get started, tour, templates, demo, fields — ends in the same bar:

- **Aa · HD · Full HD · UHD** — three pills, the active one filled teal, next to them the hint “Font size — HD for laptops · Full HD for monitors · UHD for projectors & 4K”. A click saves the size preset at once (HD ×1, Full HD ×1.5, UHD ×2) and redraws the hub in the new size; in the overlay the chart appears in the new size when you close it.
- **📖 Open docs** — an outlined pill on the right: opens this page in the browser, the German version for a German report language, otherwise the English one.
- Below, centred, the signature “made by Daten-WG”.

### With data: ☰ Start and ↺ Back to template

- **☰ Start** sits at the bottom left above the finished chart in edit mode — subtle at half opacity, fully visible on hover or Tab focus. If chart text lies underneath (for example the first axis label), the chip bar moves up one step. The button opens the same hub as an overlay; the chart is only hidden underneath, “✕ Close” or Esc shows it exactly as before.
- **↺ Back to template** appears next to it as soon as a template is set and one of its settings deviates. A click restores the template state; every other setting stays. To keep your changes, set the template to “Off” in the format pane.

### What readers see

Readers in reading view and exports (PDF, PowerPoint, subscriptions) see neither the hub nor the chips nor the bar. If the visual has no data for them, it shows a **calm landing card** since 1.51.1: the product name, below it “This visual has no data yet — fields are bound in edit mode.” and three static mini schematics — no buttons, no pills, no docs link. If you have set your own title or text in the *Empty state* card, they take its place (then without schematics). The same rule applies in the sister visual P&L Statement.

> You can do without the hub: *Empty state → Empty state in edit mode* offers the demo gallery (behaviour up to 1.49), the field guide or your own message (chapter 07, “Empty state”). Visuals smaller than 300 × 220 px show the demo gallery instead of the hub even while editing. For PBIR authors: `emptyState.mode = "demo"` restores the old gallery.

## 04 · Quick start

### 1 · Import the visual

1. Download the file [`chartkitchen-byDatenWG-latest.pbiviz`](../downloads/chartkitchen-byDatenWG-latest.pbiviz) (extension `.pbiviz`) — the link always delivers the current version, at present 1.53.0.0.
2. In Power BI Desktop: in the *Visualizations* pane click *… (More options)* → *Import a visual from a file* and select the `.pbiviz`.
3. The ChartKitchen icon appears in the Visualizations pane. Drag it onto the report page.

### 2 · Minimal setup

1. Assign your axis to the **Category** role — a time axis (months, quarters) or a structure (regions, products, accounts).
2. Assign your main measure to the **Actual (AC)** role. With just these two fields the visual already draws labelled columns with a title and a Σ header.
3. While fields are missing, ChartKitchen shows the **start hub** in edit mode (chapter 03): “🚀 Get started” walks you through fields, template and fine-tuning with ticks, “Templates” sets an IBCS template in one click, “View demo” shows the tile gallery of every mode with the fields each one needs.

### Field roles

| Field role | Type | What for |
| --- | --- | --- |
| Category | Grouping | Time axis (months) or structure (e.g. countries, products). A second category forms a hierarchy in the table — since 1.47 it expands into the row tree automatically. Optional since 1.41: without a category the visual renders a single KPI tile titled with the AC measure's name. |
| Actual (AC) | Measure | The actual value — the main measure, drawn filled. Required. |
| Previous Year (PY) | Measure | Prior-year value, drawn grey. Basis for the ΔPY variance panels. |
| Plan / Budget (PL) | Measure | Plan or budget value, drawn as an outline. Basis for the ΔPL variance panels. |
| Forecast (FC) | Measure | Forecast value — drawn hatched automatically. |
| Benchmark (BM) | Measure | Reference value per category (e.g. market average, target) — shown as a tick marker; basis for the KPI-card status light and the bullet. |
| Prior-month FC (revision) | Measure | Forecast from the previous cycle — selectable as a variance basis (FC revision: what has shifted since the last forecast?). |
| Line (combo) | Measure | Second measure as a line over the columns (e.g. margin %) with its own axis on the right. Columns mode only. |
| Stack series (Stacked) | Grouping | When filled, columns/bars stack by this series (AC per series, with a legend and a total label). |
| Columns (matrix) | Grouping | Table only: pivots the values into column groups (e.g. quarter → month, max. 2 levels) — with a collapsible column hierarchy like the Power BI matrix. |
| Filter info (footer) | Measure | Text measure with the current filter context (e.g. via CONCATENATEX/SELECTEDVALUE) — shown as a second footer when the filter footer is on. |
| Comments | Measure | Text measure: categories with a comment get a numbered marker, the text appears in the tooltip and the comment list. |
| Small Multiples | Grouping | Splits the chart into small tiles per group — with identical scaling (IBCS small multiples). |
| Waterfall type (rowType) | Grouping | Row structure as tokens per row (waterfall, P&L statement, table): result row (`total`, formerly “sum”), movement (“delta”), margin row (`pct`) and flags such as `exclude`, `hide`, `davon`, `invert`, `emphasize`, `graphic` — combinable, e.g. `davon \| exclude`. The same column feeds the [P&L Statement](../pnl-doku_en.html). Token table: [chapter 07](#rowtype). |
| Forecast flag (0=actual · 1=FC · 2=preliminary) | Grouping | Alternative to the FC measure: a 1/0 column — rows flagged 1 are drawn as forecast (hatched), the AC measure runs through. |
| X axis (scatter) | Measure | Scatter/bubble only (since 1.47): measure for the X axis — the Y axis stays AC. |
| X axis PY (scatter) | Measure | Scatter/bubble only, optional (since 1.48, max. 1 field): prior-year value for the X axis. With PY bound and movement arrows enabled the arrows show true 2D movement from (X PY, PY) to the AC position — without this field only the Y axis moves. |
| Bubble size | Measure | Scatter/bubble only, optional: scales the dot area proportionally to the value (3–22 px) — turning the scatter into a bubble chart. |
| Trend (time) | Grouping | KPI cards only (since 1.47): a time field turns every card into a time series with a mini chart (sparkline or columns). Other modes ignore the role and re-aggregate the rows. |

![Demo gallery (in the start hub under “View demo”, the landing page up to 1.49): a tile overview of every mode with the fields each one needs — a click picks the mode.](../doku-assets/feature-landing.png)

### 3 · First comparison with PY

1. Add the matching measure to the **Previous Year (PY)** role. The variance panels *ΔPY absolute* and *ΔPY %* appear above the base chart immediately — green when better, red when worse.
2. For a plan comparison also bind **Plan / Budget (PL)**; under *Chart → Variance basis* you choose what the panels compute against (Auto uses PL, otherwise PY).
3. From here you change the mode under *Chart → Chart type* — since 1.45 the Chart card is the first card in the format pane. Everything that follows builds on that.
4. Shortcut: an IBCS template sets mode, basis and panels in one step — for example *C03 · Columns + variances (PY)* under Chart → IBCS chart template, or with one click in the template gallery of the start hub.

## 05 · The 13 modes

ChartKitchen counts 13 chart types — exactly as the demo gallery in the start hub shows them. The matrix is not a separate type but the table variant with the column role filled; it is described here as card 07b.

### 01 · Columns

![Columns (time series): AC against PY as overlaid columns, topped by the variance panels ΔPY absolute and ΔPY in percent.](../doku-assets/mode-columns.png)

![As it looks in Power BI Desktop: Columns mode with four stacked variance panels — ΔPL %, ΔPL, ΔPY % and ΔPY — above the AC columns; the forecast months from July on are hatched.](../doku-assets/pbi/pbi-columns.png)

The default for time series: months or quarters as columns, AC filled, PY grey (or a triangle when PL is also bound). The variance panels ΔPY absolute and in percent sit above the columns. Use this mode when the time axis is manageable (up to about 24 points) and the deviation per period matters.

### 02 · Bars

![Bars (structure): products ranked by AC descending, with side ΔPY and ΔPY% panels for reading the deviations.](../doku-assets/mode-bars.png)

For structural comparisons without a time axis — products, regions, accounts. Categories appear as horizontal bars stacked top to bottom, sorted by AC descending by default, with ΔPY and ΔPY% panels on the side. Ideal when category names are long or there are many of them.

### 03 · Line

![Line (many data points): AC solid, PY thin and grey, plus a 6-period moving average for the trend.](../doku-assets/mode-line.png)

![As it looks in Power BI Desktop: Line mode across the fiscal year: AC solid, PL dashed and the forecast section set apart, topped by the ΔPL and ΔPL % panels per month.](../doku-assets/pbi/pbi-line.png)

For long time series with many data points (weeks, days) where columns would get too dense. All absolute lines have the same weight: AC dark, PY light grey, PL hollow, only FC dashed; optionally a moving average over N periods for the trend. The focus is on the trajectory and turning points, not the single period.

### 04 · Waterfall

![Waterfall: P&L cascade from revenue to EBIT, subtotal rows as solid columns, delta rows as floating bridge segments.](../doku-assets/mode-waterfall.png)

The classic P&L cascade: via the “Waterfall type” role (sum/delta), subtotals are drawn as solid columns and movements as floating bridge segments — from revenue to EBIT. Also usable as a plain basis→AC bridge. Use it when a result is built additively from contributions.

### 05 · Integrated bridge

![Integrated bridge: PY total column on the left, ΔPY cascade with monthly columns, stacked AC+FC total column on the right.](../doku-assets/mode-intwaterfall.png)

The year bridge: the PY total column on the left, the ΔPY cascade across the months in the middle, the stacked AC+FC total column on the right. It answers “how do we get from last year to today?” over time. It needs PY or PL as a basis. **Negative values (since 1.53):** loss months hang below the zero line. If an anchor or a cascade level falls below zero (prior-year loss → profit, a cost series as negative amounts), the cascade gets its own visible zero line: the anchors stand as full bars upward or downward, the steps float at their true height — including a step that crosses zero (+2 → −5 → −3). The monthly columns then sit in a strip of their own below (split layout). “Shorten anchors” never cuts across zero; on all-negative bridges the cut is mirrored below the zero line.

### 06 · Category bridge

![Category bridge: PY row on top, each driver as an AC-PY bar plus cascade segment and ΔPY% pin, AC row as reconciliation at the bottom.](../doku-assets/mode-catbridge.png)

![As it looks in Power BI Desktop: Structure bridge by country: PL and PY reference rows on top, an AC bar per country, the ΔPL cascade with ΔPL % pins on the right and the AC total at the bottom.](../doku-assets/pbi/pbi-bridge-structure.png)

The driver bridge across categories: a PY row on top, each driver as an AC-PY bar plus a cascade segment and a ΔPY% pin, an AC reconciliation row at the bottom. You see at a glance which category drives the total variance. The biggest driver is flagged automatically with a note. Since 1.47 the orientation is selectable (Chart → Bridge): “Automatic”, “Bars” (as before) or “Columns” — a vertical column cascade from the PY anchor through the drivers to AC, with Δ% pins on top. **Negative values (since 1.53):** with all-negative totals (for example a cost series as negative amounts) the zero line sits on the right (bars) or at the top (columns), labels stay outside, colouring follows the sign logic and “Invert” works as usual. If the cascade runs through a row's own bars, that row shows bars on top and the step below instead of painted-over bars. With small multiples and “Same scale”, one negative tile sets the shared zero line for all tiles.

### 07 · Table

![Table (IBCS): flat value table with AC-PY bars, a ΔPL bar column, ΔPL% pins and a Σ total row.](../doku-assets/mode-table.png)

![As it looks in Power BI Desktop: Table by country: AC-PY-PL bars per row, a dedicated ΔPL bar column, ΔPL % pins and the Σ total row at the bottom.](../doku-assets/pbi/pbi-table.png)

The flat IBCS value table: an AC-PY bar per row, a Δbasis bar column, Δbasis% pins and a Σ total row. It combines numeric precision with in-cell IBCS graphics and is the basis for hierarchies, result/skip rows and the matrix. Ideal for board- and print-ready KPI sheets. Multiple category fields expand automatically into the row tree since 1.47 (toggle “Auto-expand hierarchy”, default on).

### 07b · Matrix

![Matrix: row categories against the Quarter→Month column hierarchy, collapsed to quarter blocks with Σ, ΔPY and ΔPY% on the right.](../doku-assets/mode-matrix.png)

![As it looks in Power BI Desktop: Matrix with the Category→Product hierarchy and four deviation columns at once — ΔPL, ΔPL %, ΔPY and ΔPY % — each with bars or pins, plus a Σ total.](../doku-assets/pbi/pbi-matrix-ytd.png)

The table variant with the column role filled (not a separate chart type): row categories against a column hierarchy (e.g. quarter → month, max. 2 levels), value and Δbasis per block, a frozen Σ block on the right. Column groups collapse and expand, wide matrices scroll horizontally. For KPIs across two dimensions at once.

### 08 · Pareto

![Pareto: AC columns descending with a cumulative percentage line and an 80% reference marker for ABC analysis.](../doku-assets/mode-pareto.png)

The ABC analysis: AC columns descending with a cumulative percentage line and an 80% reference marker. You immediately see which few categories make up the bulk. Use it for assortment, customer or root-cause analyses.

### 09 · Dumbbell

![Dumbbell: a PY and an AC dot per category, the coloured connector shows the direction and size of the change.](../doku-assets/mode-dumbbell.png)

![As it looks in Power BI Desktop: Dumbbell as small multiples per country: a PL and an AC dot per product, the connector showing the PL→AC change.](../doku-assets/pbi/pbi-dumbbell.png)

Before/after per category as a dot pair: a PY and an AC dot, the coloured connector shows the direction and size of the change. Calmer than two bar series when only two scenarios are compared. Needs AC and PY/PL per category.

### 10 · Slope

![Slope: rank shifts between two points in time, PY on the left and AC on the right, slope and colour per category.](../doku-assets/mode-slope.png)

![As it looks in Power BI Desktop: Slope mode per product: PY on the left, AC on the right, each line a country — slope and colour reveal risers and fallers at a glance.](../doku-assets/pbi/pbi-slope.png)

Rank shifts between two points in time: PY on the left, AC on the right, one line per category — slope and colour show risers and fallers. Ideal for telling the story of position changes in a ranking. Needs AC and PY/PL per category.

### 11 · KPI cards

![KPI cards: one tile per metric with the AC value, ΔPL and ΔPY rows plus a mini bridge PL→Δ→AC.](../doku-assets/mode-cards.png)

KPI tiles for monitoring: one card per metric with a large AC value, ΔPL and ΔPY rows and a mini bridge PL→Δ→AC. Optionally with a status light, background tint and a bullet against the benchmark. For overview pages and control-room walls. With a time field in the “Trend (time)” role every card becomes a time series — a sparkline with a PY ghost line or zero-based columns, card value “Last value” or “Sum” (since 1.47).

### 12 · P&L statement

![P&L statement: income statement with subtotal, delta and margin rows, PY/AC cascade columns and ΔPY plus ΔPY% pins.](../doku-assets/mode-pnl.png)

![As it looks in Power BI Desktop: P&L statement for two entities side by side: subtotal, delta and margin (pp) row types, the AC&FC cascade column plus ΔPY and ΔPY %.](../doku-assets/pbi/pbi-pnl.png)

The full P&L statement: an income statement with subtotal, delta and margin rows, PY/AC cascade columns and ΔPY plus ΔPY% pins. Levels (subtotals only / all line items) and views (AC / AC+FC / PL) toggle via buttons. The closing mode for formal reporting. Needs PY (or PL) as a reference.

### 13 · Scatter / bubble (correlation)

The correlation mode (new in 1.47): every category as a dot, Y axis = AC, X axis = the new “X axis (scatter)” role; with the “Bubble size” role filled it becomes a bubble chart (dot area proportional, 3–22 px). Quadrant lines can sit at the mean or median of both axes — set reference lines (including the new X reference line) override them. The axes show at most 5 round ticks with the unit in the axis title; labels avoid collisions automatically (emphasized categories before biggest bubbles before extreme points). An optional status coloring tints the dots by ΔPY/ΔPL including the materiality threshold. Emphasis (EMPHASIZE), FC hatching, comments, cross-filtering, dark mode and high contrast work as in the other modes.

Since 1.48 the mode has been extended substantially: a field in the small-multiples role now creates true scatter tiles with a shared X/Y scale — quadrant lines, reference lines and the bubble scale apply to all tiles alike; the Σ and top-N rest tiles are deliberately off in scatter (no sums over ratios). The point coloring “By group/series” uses six muted colors without red or green (those stay reserved for good/bad) and shows a legend on top — from the 7th group on with “+n more”. The new “X axis PY (scatter)” role turns the PY→AC movement arrows into true 2D movement. And play mode (Rosling animation) turns the category into a time axis: one dot per series per frame, the current period as a large watermark in the background, without playing the chart shows the last period — only for the single dot cloud, not with tiles. On top of that: a trend line with an R² label, a size legend, shapes per group, quadrant corner labels, fixable axes and log scales (settings reference, chapter 08).

## 06 · ChartKitchen in action

The following captures come straight from Power BI Desktop, with sample data from a real report. The other figures in this documentation are produced by the same renderer — here you see the visual as it works together in day-to-day reporting.

![A complete report page: KPI cards, an AC/FC monthly bridge and a YTD bridge by product — every tile from the same visual, sharing one scenario notation.](../doku-assets/pbi/pbi-demo-report.png)

![Integrated bridges per category on top, the same bridge as small multiples per country below — making each region's contribution to the total deviation comparable.](../doku-assets/pbi/pbi-bridges-multiples.png)

![A freely chosen colour palette: the same integrated bridge with monthly columns in blue instead of the IBCS greys — scenario logic and the forecast hatching stay intact.](../doku-assets/pbi/pbi-custom-color.png)

![Bar comparison: a click marks and directly contrasts two countries, while the ΔPL and ΔPL % panels on the right keep the deviation in view.](../doku-assets/pbi/pbi-compare.png)

![Top N with a catch-all: a KPI-card bridge per country, the smaller drivers grouped into “Rest (4)” — the total stays complete.](../doku-assets/pbi/pbi-topn.png)

![Year-to-go view: the remaining-year requirement per country against plan and benchmark, with the PL→AC cascade on the right and the strongest and weakest driver in the message line.](../doku-assets/pbi/pbi-ytg.png)

## 07 · Features in detail

### IBCS templates C01–C13

Since 1.49 ChartKitchen ships the IBCS chart templates as **presets** — the same pattern as the table templates in the sister visual P&L Statement. A template is only a starting point: it sets chart type, variance basis, variance panels and the matching switches in one save; afterwards every setting is free to change.

1. Format pane → *Chart* → group *Chart type* → *IBCS chart template* (first position of the Chart card, default “Off”) — or click a tile in the template gallery of the start hub (chapter 03).
2. If a setting of the template deviates afterwards, **“↺ Back to template”** appears at the bottom left in edit mode: a click restores the template state, every other setting stays.
3. To apply the same template again, click the active tile in the gallery — the dropdown in the format pane cannot report an entry that is already selected.
4. C07 (area) and C11 (distribution) do not exist in the visual, so they are missing from the list.

| Template | What it sets | Also bind |
| --- | --- | --- |
| C01 · Stacked columns | Columns, variance basis Auto, no variance panels | Stack series |
| C02 · Stacked bars | like C01, as bars | Stack series |
| C03 · Columns + variances (PY) | Columns, basis previous year, variance absolute and in % | Previous Year (PY) |
| C04 · Bars + variances (PL) | Bars, basis plan, variance absolute and in % | Plan (PL) |
| C05 · Integrated bridge | Integrated bridge, basis previous year, variance absolute and in % | Previous Year (PY) |
| C06 · Category bridge vertical | Category bridge as a column cascade, basis previous year | Previous Year (PY) |
| C08 · Line | Line, basis Auto, absolute variance | — |
| C09 · Scatter | Scatter, quadrants at the mean, single colour | X axis (scatter) |
| C10 · Bubble | like C09, plus the size legend | X axis + bubble size |
| C12 · Waterfall / bridge | Waterfall, basis Auto, variance absolute and in % | Waterfall type recommended |
| C13 · Small multiples | Σ total tile and same scale; the chart type stays | Small Multiples |

For PBIR authors: set `chart.template` and the hidden property `chart.templateApplied` to the same value — otherwise the visual applies the template on its first render (details in the [AGENT-GUIDE](https://github.com/Losveratos/PowerBI-Kitchen-/blob/main/ibcsInspiredChartDeck/AGENT-GUIDE.md)).

### Scenarios, forecast hatching & benchmark

![Four scenarios: AC, PY, PL and FC in one chart, forecast hatched, benchmark markers as triangles and a target reference line.](../doku-assets/feature-scenarios.png)

1. Bind AC, PY, PL and FC to their field roles — all four appear in one chart.
2. FC is drawn hatched automatically. As an alternative to the FC measure you can bind a 1/0 column to the “Forecast flag” role.
3. With three scenarios (AC + PY + PL) IBCS shows PY as a grey triangle on the column. Turn it off under Chart → “PY as triangle”. In the integrated bridge (C05) PY is a grey column with only two scenarios (AC&FC + PY).
4. For a target value per category fill the Benchmark role — it appears as a tick marker (triangle).
5. For a fixed target or threshold line use Scale → Reference line (value + label) instead.

### Small multiples

![Small multiples: one tile per region on a shared axis, each with its own variance panels and a zoom icon.](../doku-assets/feature-multiples.png)

![As it looks in Power BI Desktop: Trellis by region (Americas · EMEA · APAC): the top countries per region as KPI cards with bullet bars, the remainder bundled into “Rest (N)”, each group independently sortable.](../doku-assets/pbi/pbi-trellis-topn.png)

1. Drag a grouping field (e.g. region) into the “Small Multiples” role. The visual splits into one tile per group on a shared scale (IBCS).
2. Under Chart → Small Multiples you control a leading “Σ Total” tile, Top-N tiles (the rest is aggregated into “Other”) and a larger first tile.
3. For the bridge modes (integrated/category bridge) force an identical scale with “Bridges: same scale for all tiles”; columns, bars and waterfall share it anyway.
4. Clicking a tile’s zoom icon enlarges it temporarily. Since 1.52 the group name is followed by the scale relative to the overview (“scale ×3.5 of the overview”).

### Matrix: column groups, drill & horizontal scrolling

![Wide matrix in a narrow visual: the block strip becomes horizontally scrollable while the name column on the left and the Σ block on the right stay frozen.](../doku-assets/feature-matrix-scroll.png)

![As it looks in Power BI Desktop: Wide matrix in action: AC by month against the Category→Country column groups; the name column on the left and the Σ column on the right stay frozen while the block strip scrolls horizontally.](../doku-assets/pbi/pbi-matrix-ac.png)

1. In addition to the category, fill the “Columns (matrix)” role with up to two levels (e.g. quarter, month).
2. Collapse and expand column groups by clicking the header; the ⊞/⊟ button in the header opens or closes all column groups at once, the double chevron all rows.
3. When the matrix gets wider than the tile, the block strip becomes horizontally scrollable (Shift + mouse wheel or the scrollbar at the bottom). The name column on the left and the Σ block on the right stay frozen.
4. Drag column widths at the handle on the right edge; a double-click fits the column to the longest visible content (auto-fit). The widths are stored in the report.
5. On export/print the “… +n” hint remains, because a still image cannot scroll.

### Two-row compact mode

![Two-row compact mode (cellLayout stacked): value on top, small ΔPY below — this fits more columns without scrolling.](../doku-assets/feature-matrix-stacked.png)

1. Under Chart → Table → “Cell layout (matrix)” choose “Two rows”: the value sits large on top, the smaller Δ number directly below it in the same cell.
2. This makes the matrix roughly half as wide and it often fits without horizontal scrolling.
3. The Δ mini-bar is dropped in this layout; value columns (AC · PY · PL) stay as their own columns next to the value.

### Value columns

![Value columns "all": each block shows the numeric reference values AC · PY · PL next to the ΔPL bar column and the Σ block.](../doku-assets/feature-valuecols.png)

1. Under Chart → Table → “Value columns” switch between “AC only”, “AC + variance basis” and “AC · PY · PL”.
2. The numeric reference values then sit next to the Δbasis bar column and the Σ block — for print- and board-ready tables without bar interpretation.

### Σ row position

![Σ row on top (totalRowPosition top): the total sits directly under the header, the detail rows follow below.](../doku-assets/feature-total-top.png)

1. Under Chart → Table → “Total (Σ) row position” choose “Top” (right under the header, IBCS) or “Bottom” (default, German P&L reading).
2. In both cases the Σ row stays frozen while scrolling vertically.

### Table comfort: zebra, grid, density, search, sorting

![Reading comfort: zebra stripes and grid lines plus an expanded Region→Country hierarchy with indentation and chevrons.](../doku-assets/feature-table-comfort.png)

1. Under Chart → Table set zebra stripes, row height (compact/normal/airy) and grid lines (horizontal/none/both).
2. A second category field creates a hierarchy (e.g. region → country): expand single rows with the chevron, all of them with the double chevron ⇕ in the header.
3. Use the magnifier icon to search the row names; clicking a column header sorts by that column (click again: ascending / off).

### P&L statement & row types

1. In the “P&L statement” mode (or waterfall) the “Waterfall type” role (rowType) sets what each row is: result row (subtotal, anchor), movement or margin row. Since 1.53 this works through tokens that can also carry flags such as “memo” or “of which” — see the next section.
2. Without that role (or additionally as an override) you structure via lists under Chart → Table: result rows (bold anchor), exclude rows from totals, hide, indent (“of which”), chart only listed rows.
3. Formula rows (e.g. “Margin = EBIT / Revenue”) and per-row number formats (e.g. “Margin = 0.0 %”) add calculated or mixed €/%/unit rows.
4. Structure mode (Chart → Table → “Edit row structure”) sets these properties by clicking a row; the choice is persisted in the lists. Properties that come from the data via token appear there ticked and locked — they can only be changed in the model.

### Row structure by token: the “Waterfall type” role (rowType, since 1.53)

Row names are not a stable data contract: rename or translate a row and the name lists stop working. Since 1.53 the “Waterfall type” role (technically `rowType`) therefore carries the structure from the data — one column in the account dimension, one or more tokens per row. Renaming, translating and multilingual models no longer break anything.

| Token | Aliases (selection) | P&L value | Effect · matches the list |
| --- | --- | --- | --- |
| total | summe, ergebnis, zwischensumme, sum, subtotal, result, formula | Subtotal, Formula | Result row: bold, separator line, anchor in the waterfall, not in Σ · “Result rows” |
| pct | prozent, marge, quote, kennzahl, margin, ratio, kpi | KPI | Margin row: % display, Δ in percentage points · no list |
| exclude | nachrichtlich, ausnehmen, memo | — | not in Σ, scales and cascade, shown subtly · “Skip rows (exclude from totals)” |
| hide | ausblenden, versteckt | — | hidden, Σ keeps computing · “Hide rows” |
| davon | of-which, thereof | — | indented and subtle · “Indent rows (davon)” |
| invert | invertieren, kosten, cost | — | rating reversed (higher cost is bad) · “Invert per category” |
| emphasize | hervorheben, highlight | — | IBCS emphasis (EMPHASIZE) · “Highlight categories” |
| graphic | grafik, chart | — | only rows with this token show bar/pin graphics · “Chart only these rows” |
| detail | normal, delta, konto, leer | Account, Separator | plain movement row · nothing |

1. **Separators:** separate several tokens per cell with a comma, semicolon, space or `|`; case does not matter — e.g. `total; graphic` or `davon | exclude`.
2. **Union with the lists:** what applies is the union of role and list. The lists under Chart → Table stay as an override for models without a role column; stating something twice does no harm, but a list cannot cancel a token — change the model for that.
3. **Existing reports:** cells with the previous values `sum`, `delta` and `pct` behave unchanged. A cell with flags only (for example just `invert`) makes no structure statement; if the column carries only such cells, the model does not count as a P&L.
4. **Hierarchies:** tokens apply to the leaf that carries the value; parent nodes only inherit the structure of their first child, not flags.
5. **Unknown tokens** (typos, free text such as “Erlös”) are ignored. Only in edit mode, a note at the bottom right of the chart names up to three of them (plus “+n”); readers and exports see nothing.

**Example:** a column `DimKonto[RowType]` next to the account name bound as category:

| Account (category) | Cell in rowType | Result |
| --- | --- | --- |
| Revenue | `Account` | plain row |
| of which export | `davon \| exclude` | indented, not in Σ |
| Cost of materials | `Account; invert` | plain row, rating reversed (cost) |
| Gross profit | `Subtotal` | result row (bold, anchor) |

**One column for both visuals:** the same column feeds the [P&L Statement byDatenWG](../pnl-doku_en.html#data) (role “Row type”: Account · Subtotal · Formula · KPI · Separator). ChartKitchen understands these values directly, so a translating helper measure is no longer needed. The P&L Statement reads only its own values from the cell; extra tokens such as `davon` or `invert` do not disturb it but have no effect there. In the shared column, therefore write `Subtotal` rather than `total` — only the former is also known to the P&L Statement.

### Comments

![Comments: numbered markers ① ② on the affected columns and the matching comment list to the right of the chart.](../doku-assets/feature-comments.png)

![As it looks in Power BI Desktop: Comment mode: numbered markers ①–④ sit on the affected bars, the matching notes appear as a list to the right of the chart.](../doku-assets/pbi/pbi-comments.png)

1. Bind a text measure to the “Comments” role — categories with text get a numbered marker ① ②, the list sits to the right of the chart and stays visible on export.
2. Alternatively enable comment mode under Comments → “Capture comments in chart”: clicking a category opens an input field, the text is stored in the report (bookmark-capable, travels with the PBIX).
3. Show/hide the comment list and set its font size in the same “Comments” card.

### Finance format

![Finance format: negative values in parentheses instead of a minus sign, combined with the P&L row types subtotal, delta and margin.](../doku-assets/feature-finance.png)

1. Under Data labels → “Finance format (parentheses)” negative values are shown in parentheses instead of a minus sign — (1,234) — and zero as “–”.
2. This applies to value and Δ labels including Δ % and matches the P&L row types subtotal, delta and margin.

### IBCS title, footers & labels

![IBCS title and footers: "KPI · unit · period: scenarios" with a message line on top, filter context and data status as footers at the bottom.](../doku-assets/feature-title.png)

1. The IBCS title (“KPI · unit · period: scenarios”) is built automatically; override the KPI name and period in the “IBCS title” card. Since 1.52.1 it states the unit once in long form (“in mEUR”) and adds no scenario suffix when the period already names scenario codes (section “Scaling according to IBCS 2.0 / ISO 24896”).
2. Enter a message line (IBCS: SAY) at the top or let “Auto message” build it from the total variance and the biggest drivers.
3. Two footers are available: “Footer (data status · source)” at the bottom left and the filter footer with the bound filter-info measure plus the display state (YTD, Top-N, sorting …).
4. Scale all fonts centrally via Data labels → Size preset (HD/Full HD/UHD — identical to the start-hub bar) and the “Scale all labels %” factor; label density controls the thinning.

### Monitoring cards (status light & bullet)

![Monitoring cards: status stripe and background traffic light judge AC against the benchmark, with a ΔBM row and a bullet micro-chart per tile.](../doku-assets/feature-cards-status.png)

![As it looks in Power BI Desktop: Monitoring cards per country: the coloured status stripe on the left judges AC against the benchmark, with the ΔPY value in absolute and percentage terms below.](../doku-assets/pbi/pbi-monitoring.png)

1. In KPI-card mode, under Chart → KPI cards, set the status basis: against the variance basis (ΔPL/ΔPY) or against the bound benchmark measure.
2. The background tint (traffic light) with its intensity and the highlight direction (both / only bad / only good) rate AC against that basis.
3. Show the bullet against the benchmark (optionally zoomed to the target range) and the mini bridge as needed; with “Same scale for all cards” all mini bridges share one scale; you can sort by deviation (biggest top-left).
4. The benchmark role must be filled for the benchmark rating.

### Trend cards: KPI cards with a time series

1. In addition to the category, drag a time field into the “Trend (time)” role — every KPI card becomes a series (since 1.47).
2. Under Chart → KPI cards pick the mini chart: a sparkline (with a PY ghost line, FC dashed, the last actual point labelled) or zero-based columns (negatives below the zero line, FC hatched) — or Off.
3. The card value shows “Last value” (default — the Δ rows and the traffic light consistently refer to the same period) or “Sum”.
4. Without a trend field everything stays exactly as before; other modes ignore the role (the rows are re-aggregated).

### Dark mode (appearance)

1. Under IBCS colors → “Appearance” choose Auto · Light · Dark (since 1.43). “Auto” detects dark report themes from the luminance of the theme background color; for manually darkened pages without a dark theme, “Dark” is the explicit switch.
2. In dark mode, ink, paper and secondary grey switch to light tones; halos and hollow markers fill with the dark page background so they blend with the page.
3. Color pickers still on their light defaults (AC/PL, PY, good, bad) are replaced automatically by their light counterparts — colors you chose yourself stay untouched. The blue/orange preset lightens accordingly.
4. The start hub, the demo gallery and the HTML overlays (row search, structure menu, comment editor) follow the appearance; high-contrast mode remains its own path.
5. Since 1.44 the visual also draws the hover tooltip itself in dark mode: a dark box, light text, the category as header — in light mode the native Power BI tooltip remains.

### Large data: loading up to 30,000 rows

1. Power BI hands a visual its data in windows of 1,000 category rows. Up to 1.48 the visual silently stopped at the first window; since 1.49 ChartKitchen fetches the further segments.
2. While loading, a subtle “⏳ n rows loaded …” appears at the bottom right. The first window is drawn right away and, once everything has arrived, the complete data set once.
3. If Power BI refuses further segments (the host's memory limit of about 100 MB) or the safety limit of 30,000 category rows kicks in, a note in the chart says that the data is incomplete — there is no silent truncation any more.
4. Up to 1,000 rows nothing changes.

### Locked instead of silent chips

1. Since 1.49, in-chart buttons that would have no effect in the current state are dimmed and not clickable; the tooltip names the reason. A click on them saves nothing.
2. Typical cases: YTD on P&L rows or with a single period · ⇅ when the order already equals the impact sort · ⚠ when there is nothing to condense (e.g. benchmark cards without ΔPY/ΔPL) · the card sort without a comparison value · ▶, ⇅ and ΔPY|ΔPL of a bridge that only shows its hint.
3. P&L Statement locks its toolbar buttons by the same rule.

### High contrast: patterns instead of colour

1. In Windows high-contrast mode ChartKitchen takes its colours from the host palette since 1.49 — foreground, background and `foregroundSelected` for highlight and hover.
2. Status then lives in the pattern instead of the colour: good filled, bad hollow, immaterial dashed — in the KPI cards (status stripe, mini bridge) and in the scatter status too. The PY line in line mode is dashed.
3. The start hub and the field guide use the same palette. Without high contrast nothing changes.

### Empty state: start hub, demo, field guide or own message

1. In the *Empty state* card, “Empty state in edit mode” decides what you as the author see while no data is displayed: **start hub** (default since 1.50, chapter 03) · **demo gallery** (pick a chart type, the behaviour up to 1.49) · **field guide** (which field goes where, ✓ on bound roles) · **own message** (title and text below).
2. The field guide and the own message carry switch buttons, among them “☰ Start hub”; a click saves the chosen mode.
3. Custom title and custom text (since 1.44) replace the “ChartKitchen byDatenWG” branding whenever no data is shown (empty field wells or a selection without rows).
4. Readers and exports never see the hub, the gallery or buttons, but since 1.51.1 the calm landing card — with your title and text, if set.

### Scaling according to IBCS 2.0 / ISO 24896

Since 1.52 ChartKitchen scales every chart type according to IBCS 2.0 / ISO 24896: one unit, one scale across all panels of a chart, otherwise a visible factor. IBCS serves as a reference; the visual is not certified.

> **Existing reports change their look.** This is intended and cannot be switched off: Δ panels get flatter because they show the true size of the variance, columns and bars get a little wider, Δ numbers shorter. Review pages built around fixed panel heights (screenshots, subscription PDFs) after the update.

1. **Δ in the scale of the base.** Absolute Δ panels (ΔPY, ΔPL, double variance, the ΔPY step above the P&L waterfall) are drawn at the same scale (px per unit) as the base chart. Their height (columns) or width (bars) follows the Δ span plus room for the labels; fixed height shares are gone. Likewise the table’s Δ bars run at the scale of the AC·PY bar column and the P&L statement’s Δ column at the scale of the cascade. Δ% pins keep their own scale because they show a different unit.
2. **Magnifier instead of silent enlargement.** If the largest variance would be too small to read at the base scale, the visual enlarges the Δ panel by a round factor (2, 4, 5, 10, 20 …) and says so: title “ΔPY ×4” and a light-blue scale band at the same value in the base and the Δ panel. Table and P&L statement show a factor in the column header (“×0.5”, “×4”), the bridge panel of columns/bars with waterfall bridge in its title (“PL → AC ×0.025”). Nothing is enlarged without a mark.
3. **Widths.** Columns and bars for absolute values take 2/3 of the category in every slot-based mode (columns, bars, bridge panel, waterfall, vertical category bridge, Pareto, stacked). Δ columns below a line are as wide as the slot.
4. **At most three digits.** Numbers in charts have at most three digits, counted after rounding (“161.8K” becomes “162K”, “99.96” becomes “100”). The largest variance sets the decimals of the Δ labels; small values that would otherwise round to zero get extra digits (“+0.04M”). Values below the display threshold show “0” without unit or sign; a Δ that is not zero but still rounds to zero keeps its sign (“+0.0”, since 1.52.2), negative Δ use the true minus sign. KPI cards of the same unit give value and Δ the same decimals, without extra digits on the Δ (since 1.52.2). Scatter and bubble name the unit in long form in the axis title (“in thousands”), the Ø line and the size caption go without K/M. Table and P&L statement keep their decimals. With “Sum-safe label rounding” one precision applies to labels and Σ so the total adds up.
5. **Same scale across small multiples and cards.** Small multiples share their value range and magnifier factor. A tile’s ⤢ zoom states its scale relative to the overview next to the group name (“scale ×3.5 of the overview”), and the Δ panels follow the enlarged base. For KPI cards, Chart → KPI cards → “Same scale for all cards” (`chart.cardSameScale`, since 1.51.2, default off) switches on one common scale for all mini bridges: equal amounts give equally tall bars. Meant for cards of one measure per category; leave it off for cards with different units.
6. **Integrated bridge (C05).** Anchors, bridge steps and month pairs have the same width (2/3 of the category), the month columns stand on the anchor scale. Only when they would reach into the cascade or be unreadably small do they get a round factor, stated in the panel caption (for example “×0.5”) plus a scale band. The bridge steps are drawn at their true height with a 1 px hairline below; there is no minimum height any more. With AC&FC and PY (two scenarios) PY is a grey, offset column as in C03; the PY triangle only appears with the third scenario (AC + PY + PL).
7. **Shortened bridge anchors.** Chart → Bridge → “Shorten anchors (axis break)” (`chart.bridgeBreak`, default off) shortens the total anchors with a visible ⫽; the steps above run on one linear scale and become readable. C05: month columns in the lower band with a stated factor, the cut is named in the caption (“axis broken from 45.0M”). C06 vertical: anchors PY, PL and AC with ⫽. C12: switches on the axis break under Scale → Waterfall axis while that is set to “Off”. The axis is only cut when every level lies above the cut; small multiples with the same scale stay zero-based.
8. **Unit once in the title.** The title states magnitude and unit in long form (“Net revenue in mEUR per channel”, “in k hl”), never a bare “M” or “K”. If the measure name has no unit, the visual adds it from the format string. Scatter and bubble carry their units on the axis titles. If you switch Data Labels → “Unit on every label” off (`labels.unitSuffix`, default on), labels show the number only (“18.5”) and KPI cards use one common unit for all cards. The abbreviation stays “K” as in Power BI.
9. **Scenario suffix without repetition.** If the period in the IBCS Title card already names scenario codes (AC, PY, PL, BU, FC), the visual appends nothing. Otherwise it builds the suffix from the variance basis and the bound roles; the actual is called “AC&FC” when a forecast share is shown. Waterfall, category bridge, Pareto, dumbbell and slope name only the basis.
10. **Line notation (C08).** All absolute lines have the same weight: AC dark solid, PY light grey solid, PL hollow (outline with a light core), only FC dashed. The AC label sits above the point when AC is on top and below it when AC is at the bottom.
11. **Stack legend at the stack.** For stacked columns and bars (C01/C02) the series names sit right at the stack: next to the last column for columns, for bars each series above its widest segment (since 1.52.2 also when the first bar does not carry every series). When they do not fit (overlap, negative segments, small multiples), the key stays at the top. Switch: Chart → Display → “Stack legend at the stack” (`chart.stackLegendDirect`, default on). A stack with only one labelled segment shows the value once.
12. **Control menu ☰.** Chart → Interaction in the report → “Fold chart controls (☰)” (`chart.chipMenu`, default off) puts the in-chart controls (sort ⇅, YTD, ⫽ axis, ΔPY|ΔPL, ▶, exception chip, mode chips, card sorting, scatter play, P&L view) behind a small ☰ at the top right. One click unfolds them, ✕ folds them again; nothing is saved. Off: everything visible as before.

### Scaling guarantees & axis break (waterfall)

1. Since 1.45 hard scaling guarantees apply: the ΔPY and ΔPL panels share ONE scale (absolute and %), bridges include every cascade intermediate in the scale, stacked small multiples share a common scale, and values and variances use ONE unit scale — no more “k€ next to thousands”. Formats with their own prefix (“#,0 T€”, “Mio €”) switch the auto unit off.
2. “Scale minimum maximum” and outlier capping now also apply in the waterfall; the ⫽ marker sits on every capped element (PY, PL, BM, line).
3. Δ% shows “n.a.” when the basis is 0 or the sign flips between basis and actual — instead of misleading values like “−250 %”. P&L cost rows with a consistently negative basis keep their percentages.
4. Axis break in the waterfall (IBCS UN 5.3, since 1.45): under Scale → “Waterfall axis” set the break to Off · Auto · On; the axis is only cut when all anchors and deltas sit entirely above the break. Anchors become stubs with ⫽ across the full bar width; a title suffix and the export footer disclose the break, and small multiples share ONE break. For the integrated bridge and the vertical category bridge, “Shorten anchors (axis break)” under Chart → Bridge is available since 1.52.1; since 1.53 the cut on all-negative bridges is mirrored below the zero line, and a cut never crosses zero.
5. Alternatively click the in-chart chip “⫽ axis”: it toggles the break, highlights itself on an auto suggestion, and is disabled when a break would be invalid — the tooltip names the reason or the blocking tile.

### Cross-filter, tooltips & bookmarks

1. Clicking a category filters the other visuals on the page (cross-filter). Exceptions: while comment, compare or structure mode is active, clicks do not cross-filter.
2. In the other direction, since 1.46: a selection in another visual always **filters** ChartKitchen — Power BI no longer offers the “highlight” interaction for this visual. Σ header and scales therefore work consistently on the filtered data during cross-interaction; the visual's own selection (click, Ctrl = multi-select) still dims locally.
3. In scatter/bubble mode there is additionally a rectangle selection since 1.48: dragging a rectangle on empty plot area selects all contained dots as ONE multi-select and filters the other visuals (cross-filter). A click on empty area clears the selection as before.
4. On hover, default and canvas tooltips show values, variances, series and comment; canvas tooltips (report-page tooltips) are supported. In dark mode the visual draws the hover tooltip itself (a dark box with the category as header).
5. Interactive states are bookmark-capable: the variance basis, the YTD view, in-chart sorting, expanded rows/columns, captured comments and column widths travel with the report or the bookmark.
6. Since 1.49 bookmarks also restore the **selection**: a bookmark with selected categories (likewise a selection set by another visual) dims the other marks as after a click; a bookmark without a selection removes the dimming.

### Export: desktop PDF, print and the limit in the Power BI service

1. **What happens in the export context:** the visual shows a calm still image — no buttons or toolbars, data marks are no longer focusable, titles that are too long wrap onto a second line, bar panels reserve room for the widest label. The export writes nothing back to the report (no bookmark or column-width changes, no comments).
2. **Everything expanded:** with the switch Chart → Display → “Export: expand all levels” (default on), table, matrix and P&L statement render all row and column levels expanded; the expand arrows are omitted. Off = the export shows the current state.
3. **Matrix:** if the expanded months do not fit the tile, the export falls back first to the report's expand state and then to collapsed quarter blocks instead of cutting quarters off; the “… +n” hint sits in the header of the name column.
4. **Tested** is the layout for monthly columns with Δ, structure bars, category bridge, P&L waterfall and matrix with a YTD column, each as an A4-landscape tile (1100×620), half page (540×620) and PowerPoint tile (960×540), in HD and Full HD.
5. **The honest limit:** according to Microsoft, PDF/PowerPoint export and subscription emails in the Power BI service render only *certified* visuals; ChartKitchen is not certified until the AppSource certification (the submission is in preparation, no date can be promised). There the export option is greyed out or the visual is missing, and subscription emails show an error icon. **Until then** export works via **Power BI Desktop** (File → Export → PDF) and **browser print**. Background, sources and admin checklist: [Security & operations](../visuals-sicherheit_en.html#deployment).

## 08 · Settings reference

The following schematics show the structure and order of the format pane (naming as in Power BI). Each card and subgroup appears as a schematic sketch next to its settings table, so you can locate every toggle and dropdown in the pane itself. The German format pane is shown; the English pane is laid out identically.

Since 1.45 the format pane follows the working order: the Chart card sits at position 1, “Orientation” is now called “Chart type”, and the card order is Chart → IBCS title → Data labels → Category axis → IBCS colors → Scale & reference line → Comments → Empty state. The sketches show the cards schematically (state before the pane rework); all setting names and effects are unchanged.

![Schematic: Format pane: the visual's eight cards (collapsed). Pane order since 1.45: Chart, IBCS title, Data labels, Category axis, IBCS colors, Scale & reference line, Comments, Empty state (sketch: arrangement before 1.45). German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-overview.png)

> The tables below list every setting in the format pane, grouped by cards and groups. Since 1.45 the Chart card is regrouped in the pane (Chart type · Comparison & variance · Data & time · Interaction in the report · Appearance · Small Multiples · Bridge · Table · KPI cards) — a pure display reordering; names and effects of the settings are unchanged. The “Chart” card bundles most settings; many apply only in certain modes (e.g. the “Table”, “Small Multiples”, “Bridge” and “KPI cards” groups).

### Chart

#### Layout

![Schematic: Format pane → Chart: chart type (formerly “Orientation”), variance basis and the deviation options (sketch: state before 1.45). German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-chart-layout.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| IBCS chart template | Since 1.49, first position of the Chart card (group Chart type): a starting point after the IBCS chart templates — sets chart type, variance basis, variance panels and the matching switches in one step; afterwards every setting is free to change. C01/C02 stack via the “Stack series” field, C10 additionally needs “Bubble size”, C13 keeps the chart type and needs “Small Multiples”. Not included: C07 (area) and C11. | Options: Off (no template) \| C01 · Stacked columns (series) \| C02 · Stacked bars (series) \| C03 · Columns + variances (PY) \| C04 · Bars + variances (PL) \| C05 · Integrated bridge (time) \| C06 · Category bridge vertical \| C08 · Line (long time series) \| C09 · Scatter \| C10 · Bubble (scatter + size) \| C12 · Waterfall / bridge \| C13 · Small multiples · default „Off (no template)“ |
| Chart type | The chart mode — called “Orientation” until 1.45; since then at the very top of the first card in the format pane. | Options: Columns (Time) \| Bars (Structure) \| Line (Time, many points) \| Waterfall / Bridge \| Integrated Bridge (Time) \| Category Bridge (Structure) \| Table (IBCS) \| Pareto (Structure) \| Dumbbell (Structure) \| Slope · Before/After \| KPI Cards (Tiles) \| P&L Statement (IBCS) \| Scatter / Bubble (Correlation) · default „Columns (Time)“ |
| Smart-Start suggestions | Shows a subtle suggestion chip top-left of the chart when the bound fields clearly point to a better-fitting mode (e.g. date + AC + PL → columns with ΔPL). Only visible in edit mode, never in the read view or in exports. | On / Off · default On |
| Variance basis | Basis for the variance panels. Auto: PL if available, otherwise PY. | Options: Auto \| Previous Year (PY) \| Plan (PL) \| Prior-month FC (revision) · default „Auto“ |
| Absolute variance (ΔAC) | — | On / Off · default On |
| Relative variance (ΔAC %) | — | On / Off · default On |
| Dual variance (PL + PY) | Additionally shows the variance panels for the second basis — ΔPL and ΔPY at the same time (requires PY and PL). | On / Off · default Off |
| PY as triangle (AC + PY + PL) | IBCS notation with three scenarios: when AC, PY and PL are bound, the previous year is shown as a grey triangle (▶) at the column/bar edge at PY height instead of as a third column — less cluttered. Off = PY shown as a grey column again. In the integrated bridge (C05) the triangle only appears with the third scenario since 1.52; with AC&FC + PY, PY is a grey, offset column. | On / Off · default On |
| Total (Σ) header | Shows the total and the total variance as a header row. | On / Off · default On |
| Group separator every N categories | Draws a thin separator line after every N categories, across all panels — for structural comparisons with natural subgroups (e.g. regions). 0 = off. | 0–50 · default 0 |

#### Analysis

![Schematic: Format pane → Chart → Analysis: cumulation (YTD), moving average, Top N, highlighting, inversion, materiality and pin shape. German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-chart-analyse.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| Cumulative (YTD) | Switches all panels to a cumulative view: columns, Δbasis and Δbasis % show year-to-date values. | On / Off · default Off |
| Cumulation kind | YTD resets at the start of the fiscal year, QTD at each quarter start, R12 sums the last 12 periods on a rolling basis. Month detection uses the category labels (Jan…Dec, 01…12). | Options: YTD (year to date) \| QTD (quarter to date) \| R12 (rolling 12 periods) · default „YTD (year to date)“ |
| Fiscal year starts in month | 1 = January … 12 = December. Determines where YTD/QTD reset (e.g. 4 for a fiscal year starting in April). | 1–12 · default 1 |
| YTD button in chart | Shows a clickable "YTD" button at the top right of the chart (Columns/Line) — the end user toggles the cumulative view directly in the report; the choice is persisted. Off by default. | On / Off · default Off |
| Moving average (periods) | Thin overlay line with a moving average over N periods (Columns/Line). 0 = off. | 0–24 · default 0 |
| Top N (bars) | Structure modes (Bars, Category bridge, Table, Dumbbell, KPI cards): shows the N largest categories, the rest is aggregated. 0 = all. | 0–50 · default 0 |
| Highlight categories | Comma-separated category names to emphasize (IBCS EMPHASIZE), e.g. the current month. Since 1.53 alternatively as token `emphasize` in the “Waterfall type” role (rowType, [token table](#rowtype)) — what applies is the union of role and list. | Free text · z. B. Jul, Aug |
| Invert (higher is bad) | For cost KPIs: a higher value is bad (red), a lower value is good (green). | On / Off · default Off |
| Invert per category | Comma-separated categories whose rating is reversed (e.g. cost rows next to revenue rows in KPI cards or the P&L table). Applies in addition to the global invert switch. Since 1.53 alternatively as token `invert` in the “Waterfall type” role (rowType, [token table](#rowtype)) — what applies is the union of role and list. | Free text · z. B. Opex, Materialaufwand |
| Compare on click | Columns/Bars only: clicking two columns/bars shows the difference (absolute + %) as an overlay — clicks then no longer cross-filter. Clicking empty space resets. Off by default. | On / Off · default Off |
| Materiality from (absolute) | Materiality threshold: variances below this absolute amount are shown in grey instead of red/green (panels, waterfall steps, table). 0 = off. | from 0 · default 0 |
| Materiality from (%) | Materiality threshold in percent: variances below this Δ % are shown in grey. If both thresholds are set, a variance must exceed both to be colored. 0 = off. | 0–100 · default 0 |
| Δ%-pin shape | Shape of the lollipop head of the Δ% pins. "Automatic" keeps the previous style per mode (Columns/Bars/Waterfall round, bridges and table square); "Round" or "Square" unify all modes. | Options: Automatic (per mode) \| Round \| Square · default „Automatic (per mode)“ |
| Trend icons ▲▼● | Prefixes the Δ values in the table and KPI cards with direction arrows: ▲ increase, ▼ decrease, ● immaterial (below the materiality threshold). Also readable in black-and-white print and for color-blind users — color still rates good/bad. | On / Off · default Off |
| Stack legend at the stack | Display group, since 1.52.1 (property `chart.stackLegendDirect`): stacked columns and bars show the series names right at the stack (columns: next to the last column, bars: above the widest segment of each series) instead of a key at the top. When they do not fit, the key stays. Off = always the key at the top. | On / Off · default On |

#### Small Multiples

![Schematic: Format pane → Chart → Small Multiples: total tile, Top N tiles, first tile large and shared bridge scale. German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-chart-multiples.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| Total tile (Σ) | Prepends a "Σ Total" tile — the sum across all groups, on the same scale (IBCS). | On / Off · default Off |
| Top N tiles | Shows only the N largest groups (by total AC) as tiles — the rest are aggregated into a "Remainder" tile. 0 = all. | 0–24 · default 0 |
| First tile large | Gives the first tile (e.g. "Σ Total" or the largest group) more room — all tiles keep the same scale (IBCS CT 13). | On / Off · default Off |
| Bridges: same scale for all tiles | Also scales the bridge modes (Integrated bridge, Category bridge) identically across all tiles (IBCS). Default: off — each bridge tile scales on its own. Columns, bars and waterfall always share the scale. | On / Off · default Off |

#### Bridge

![Schematic: Format pane → Chart → Bridge: waterfall bridge, sort by impact, in-chart buttons and driver note. German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-chart-bruecke.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| Waterfall bridge | Columns/Bars only: shows the categories as a waterfall bridge from the basis (PY/PL) to AC with connecting lines instead of individual bars. Optional — off by default. | On / Off · default Off |
| Sort by impact | Waterfall bridge only: sorts the categories by variance size (biggest driver first). A Top-N remainder row stays at the end. Also toggleable by clicking the ⇅ symbol in the chart. | On / Off · default Off |
| In-chart buttons | Integrated/Category bridge: shows clickable buttons at the top right of the chart — ΔPY/ΔPL reference toggle, ⇅ sorting and ▶ build-up animation. The end user can switch the variance basis directly in the report; the choice is persisted. | On / Off · default On |
| Fold chart controls (☰) | Interaction in the report group, since 1.52 (property `chart.chipMenu`): folds the in-chart controls (sort ⇅, YTD, ⫽ axis, ΔPY\|ΔPL, ▶, exception chip, mode chips, card sorting, scatter play, P&L view) behind a small ☰ at the top right. One click unfolds them, ✕ folds them again; nothing is saved. Off: always visible as before. | On / Off · default Off |
| Driver note in chart | Category bridge: italic note at the biggest driver ("biggest driver · n % of the total variance") — overlays the row area, can be turned off here. | On / Off · default On |
| Bridge: orientation | Category bridge (since 1.47): “Automatic” picks as before, “Bars” forces the horizontal bridge, “Columns” the vertical column cascade (PY anchor → drivers → AC with a Δbasis reconciliation, Δ% pins on top). Emphasis, driver note, the n.a. rule and the small-multiples scale apply there too. | Options: Automatic \| Bars \| Columns · default “Automatic” |
| Shorten anchors (axis break) | Since 1.52.1 (property `chart.bridgeBreak`): integrated bridge, category bridge (columns) and waterfall shorten the total anchors with a visible ⫽ so the bridge steps become readable at their true height; all steps keep one linear scale. The axis is only cut when every level lies above the cut. In the waterfall the option switches on the axis break (Scale → Waterfall axis) while that is set to “Off”. | On / Off · default Off |

#### Table

![Schematic: Format pane → Chart → Table: value columns, structure lists (result, skip, hide, chart, indent rows), formula rows plus cell layout, Σ position, zebra, row density and grid lines. German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-chart-tabelle.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| Value columns | Extra number columns next to AC: the variance basis (PY or PL, depending on the comparison basis) or both reference scenarios — for print- and board-ready tables without bar interpretation. | Options: AC only \| AC + variance basis \| AC · PY · PL · default „AC only“ |
| Edit row structure (click) | Edit mode: clicking a row opens a small menu with "Invert", "Result row" and "Exclude from totals" — the one-click P&L without changing the data model. The choice is persisted in the lists below; turn off again to report. Properties that come from the data via rowType token appear ticked and locked. | On / Off · default Off |
| Result rows | Comma-separated row names that are formatted as result rows (bold, separator line, excluded from Σ; anchors in the waterfall) — an alternative to the waterfall type role. Since 1.53 alternatively as token `total` in the “Waterfall type” role (rowType, [token table](#rowtype)) — what applies is the union of role and list. | Free text · z. B. EBIT, Rohertrag |
| Skip rows (exclude from totals) | Comma-separated row names that do not flow into the Σ row, the scales and the waterfall cascade (e.g. memo items). The row stays visible but is shown subtly. Since 1.53 alternatively as token `exclude` in the “Waterfall type” role (rowType, [token table](#rowtype)) — what applies is the union of role and list. | Free text · z. B. Davon-Positionen |
| Hide rows | Comma-separated row names that are only hidden — the Σ row, scales and formulas still compute with them (unlike "Exclude from totals"). Can also be set by clicking in structure mode. Since 1.53 alternatively as token `hide` in the “Waterfall type” role (rowType, [token table](#rowtype)) — what applies is the union of role and list. | Free text · z. B. Sonstige, Intern |
| Chart only these rows | Comma-separated row names: when filled, only these rows show the bar/pin graphics — all others stay pure number rows. Empty = graphics everywhere. The Σ row always keeps its graphic. Since 1.53 alternatively as token `graphic` in the “Waterfall type” role (rowType, [token table](#rowtype)) — what applies is the union of role and list. | Free text · z. B. Umsatz, EBIT |
| Indent rows (davon) | Comma-separated row names shown indented and subtly as "of which:" items — without a hierarchy field. Usually combined with "Exclude from totals". Since 1.53 alternatively as token `davon` in the “Waterfall type” role (rowType, [token table](#rowtype)) — what applies is the union of role and list. | Free text · z. B. davon Export |
| Row number formats | Number format per row, semicolon-separated: "Margin = 0.0 %; Quantity = #,0". Percent multiplies by 100; values appear unscaled (no k€ division) — for mixed €, % and unit rows. | Free text · z. B. Marge = 0.0 % |
| Matrix: column comparison | Comparison within the matrix columns: "Δ vs. previous column" replaces the Δbasis per block with the change to the previous column (period comparison Q2 vs. Q1, Mar vs. Feb …). | Options: Off (Δ vs. basis) \| Δ vs. previous column · default „Off (Δ vs. basis)“ |
| Formula rows | Calculated rows, semicolon-separated: "EBIT = Revenue - Costs" adds a subtotal row, "Margin = EBIT / Revenue" a % row. Operands are row names; please surround operators with spaces. Formula rows do not flow into the Σ row. | Free text · z. B. Marge = EBIT / Umsatz |
| Total (Σ) row position | Where the Σ total row sits: “Bottom” (default, German P&L reading) below all rows, “Top” right under the header (IBCS). Stays frozen while scrolling. | Options: Bottom (below rows) \| Top (below header) · default „Bottom (below rows)“ |
| Zebra stripes | Shades every second data row with a very subtle background — easier row tracking in wide tables. Off in high-contrast mode. Off by default. | On / Off · default Off |
| Row density | Row height: “Compact” for dense tables, “Normal” (default) as before, “Airy” for more whitespace. Scales only the cap; very tall visuals stay bounded. | Options: Compact \| Normal \| Airy · default „Compact“ |
| Grid lines | Separator style: “Horizontal” (default) row lines only, “None” for a calm look, “Horizontal + vertical” adds subtle column/block dividers. | Options: Horizontal \| None \| Horizontal + vertical · default „Horizontal“ |
| Cell layout (matrix) | Matrix only: “Columns” (default) shows the value and Δbasis side by side. “Two rows” puts the value large on top and the smaller Δ number directly below it in the same cell — the matrix becomes roughly half as wide. The Δ mini-bar is dropped; reference (value) columns stay as their own columns next to the value. | Options: Columns (value · Δ side by side) \| Two rows: value on top, Δ below · default „Columns (value · Δ side by side)“ |
| Auto-expand hierarchy | Multiple fields in the category role (table/P&L): the visual expands the drill hierarchy into the clickable row tree automatically — once per field constellation; manual collapsing is preserved. Since 1.47. | On / Off · default On |
| Export: expand all levels | Table, matrix and P&L statement only (group Display): PDF/PowerPoint export and subscription emails render all row and column levels expanded — the printout shows everything regardless of the on-screen collapse state. Off = the export shows the current state. See [Export](#export). | On / Off · default On |

#### KPI cards

![Schematic: Format pane → Chart → KPI cards: status basis, highlight status, sorting, mini bridge, background tint and bullet options. German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-chart-karten.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| Status basis (stripe & background) | What the stripe and background traffic light rate against: the comparison basis (ΔPL or ΔPY) or the bound benchmark measure — for monitoring against targets/thresholds. | Options: Variance basis (ΔPL/ΔPY) \| Benchmark (BM) · default „Variance basis (ΔPL/ΔPY)“ |
| Highlight status | Which direction is highlighted in color: both (traffic light), only bad (problem monitoring — positives stay neutral) or only good (success board). Applies to stripes, background, Δ rows and bullet. | Options: Good & bad \| Only bad \| Only good · default „Good & bad“ |
| Sort by deviation | Orders the cards by the color-relevant variance (benchmark or ΔPL/ΔPY, depending on the status basis): biggest variance top-left — for maximum focus. "Data order" leaves them as in the model. | Options: Data order \| Biggest deviation first \| Worst first (bad on top) \| Best first (good on top) · default „Data order“ |
| Show mini bridge (AC/PY bars) | Shows the small bar bridge basis → Δ → AC at the bottom of the card. Off: pure number card (large value + Δ rows), calmer for dense KPI walls. | On / Off · default On |
| Same scale for all cards | Since 1.51.2 (property `chart.cardSameScale`): all mini bridges share one scale across the cards, equal amounts give equally tall bars (IBCS: identical scales). For cards of one measure per category (e.g. revenue per channel). Off: each card scales on its own, needed for cards with different units. | On / Off · default Off |
| Tint card background | Subtly tints the card background: slightly green when better, slightly red when worse than the status basis — neutral (below materiality) stays uncolored. For monitoring walls; off in high-contrast mode. | On / Off · default Off |
| Tint intensity % | Opacity of the background tint in percent (4–40). Default 12 — stronger for control-room monitors, subtler for board reports. | 4–40 · default 12 |
| Bullet vs. benchmark | Small bullet chart on the card: AC bar on a light band, benchmark as a tick — below the number (stacked layout) or next to the Δ rows (flat layout). Requires the benchmark role. | On / Off · default Off |
| Bullet: zoom to target range | Spreads the bullet across the range around AC and benchmark instead of starting at zero — KPIs close to target (97 vs. 99) become distinguishable. The axis break at the left bar end marks the truncated scale. | On / Off · default Off |
| Show reference values | Shows the comparison values themselves in addition to the Δ rows: “Basis value” adds the comparison basis as its own row, “All bound scenarios” additionally PY, plan, forecast and benchmark — in ink above the coloured Δ rows, so the deviation keeps the visual weight. Since 1.41. | Options: Deviations only \| Basis value \| All bound scenarios · default “Deviations only” |
| Mini chart (trend) | Only with a time field in the “Trend (time)” role (since 1.47): a mini chart per card — a sparkline with a PY ghost line, FC dashed and the last actual point labelled, or zero-based columns (negatives below the zero line, FC hatched). | Options: Off \| Sparkline \| Columns |
| Card value (with trend) | “Last value” shows the most recent value of the series — Δ rows and traffic light consistently refer to the same period. “Sum” aggregates the series. | Options: Last value \| Sum · default “Last value” |

#### Scatter / bubble

| Setting | Description | Options / default |
| --- | --- | --- |
| Quadrant lines | Scatter/bubble (since 1.47): places quadrant lines at the mean or median of both axes. Set reference lines (Scale card) override the quadrants. | Options: Off \| Mean \| Median · default “Mean” |
| Dot coloring | “Status” tints the dots by the variance basis (ΔPY/ΔPL) good/bad, including the materiality threshold. “By group/series” (since 1.48) colors per value of the series field — six muted colors without red/green (reserved for good/bad), a legend on top with “+n more” from the 7th group; without a series field a single color, no effect in high contrast. | Options: Single color (AC) \| Status (Δbasis) \| By group/series · default “Single color” |
| Shape per group | Only with dot coloring “By group/series” (since 1.48): every group additionally gets its own dot shape (circle · square · triangle · diamond, area-matched) — shown in the legend too. Readable in black-and-white print and with color-vision deficiency; outline shapes in high contrast. | On / Off · default Off |
| Movement arrows PY → AC | Only with prior year (PY), since 1.48: a thin arrow from a small grey PY start dot to the AC marker edge of every dot. With the “X axis PY (scatter)” role true 2D movement, otherwise only Y moves; the tooltip states Δ per axis and the axes include the PY positions. | On / Off · default Off |
| Trend line | Linear regression over the visible dots (since 1.48) as a thin dotted line across the plot width, per tile with small multiples; computed in log space on log axes — the line stays straight. At least 3 dots. | Options: Off \| Linear · default “Off” |
| Show R² | Only with an active trend line: labels the end of the line with the coefficient of determination (“R² = 0.87”). | On / Off · default Off |
| Size legend | Only with a bound bubble size: three nested reference circles (small · medium · large, rounded to friendly values) compactly in the first free plot corner; exactly once with small multiples. | On / Off · default On |
| Quadrant label top right | Only with active quadrant lines (since 1.48): a subtle corner label (e.g. “Stars” top right), avoiding dots where possible. Empty = off. | Free text · empty = off |
| Quadrant label top left | — | Free text · empty = off |
| Quadrant label bottom left | — | Free text · empty = off |
| Quadrant label bottom right | — | Free text · empty = off |
| Play button (animation) | Scatter without small multiples only (since 1.48): shows a ▶ button (Rosling mode) — the category becomes the time axis, one dot per series per frame, the period sits as a large watermark in the background (click = back to the start). Axes, quadrants and bubble scale stay fixed across all frames; without playing the chart shows the last period, exports render the full dot cloud. The playback state is not persisted. | On / Off · default Off |

### IBCS Title

![Schematic: Format pane → IBCS title: title toggle, KPI name, period, message line, auto message, footer and filter footer. German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-ibcs-titel.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| Show labels | — | On / Off · default On |
| KPI name (auto if empty) | — | Free text · z. B. Umsatz |
| Period (auto if empty) | — | Free text · z. B. 2026 |
| Message line | — | Free text · Kernbotschaft der Grafik (IBCS: SAY) |
| Auto message | Automatically builds the message line (driver text) from the total variance and the biggest drivers when no custom message is entered. Off by default. | On / Off · default Off |
| Footer (data status · source) | Footer at the bottom left — e.g. data status and source: "Actuals as of Jun 2026 · status 05.07. · source: SAP FI". | Free text · z. B. Ist per Jun 2026 · Stand 05.07. |
| Show filter footer | Second footer with the filter context: shows the bound "Filter info" text measure (report filters are not exposed to custom visuals via API) plus the visual's own display state — YTD, Top-N, in-chart sorting, Σ exclusions, comparison. | On / Off · default Off |

### Data Labels

![Schematic: Format pane → Data labels: display, density, size preset, scaling, text size, decimals, units, finance format and sum-safe rounding. German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-beschriftungen.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| Show labels | — | On / Off · default On |
| Label density | Controls the thinning of value labels: "Automatic" hides them when space is tight (previous behavior), "All" labels every point (may overlap), "First · last · extremes" shows only the first/last value plus minimum and maximum. | Options: Automatic (thin out) \| All \| First · last · extremes · default „Automatic (thin out)“ |
| Size preset | Scales all fonts in the visual at once: HD ×1 (default) · Full HD ×1.5 (recommended for 1080p reports) · UHD ×2. In the start hub the same setting appears as the bar HD · Full HD · UHD. | Options: HD (dashboard tile) \| Full HD (1080p) \| UHD (4K / projector) · default „HD (dashboard tile)“ |
| Scale all labels % | Enlarges or shrinks ALL labels on top of the preset by a free factor (50–300 %). 100 = neutral. Preset × factor gives the effective font size. | 50–300 · default 100 |
| Font size | — | 6–24 · default 10 |
| Decimal places | Applies unchanged to the table and the P&L statement. In charts every number has at most three digits since 1.52.1: from 10 of the display unit at most one decimal, from 100 none. | 0–3 · default 1 |
| Display units | — | Options: Auto \| None \| Thousands (k) \| Millions (M) \| Billions (B) · default „Auto“ |
| Finance format (parentheses) | Finance convention for numbers: negative values in parentheses instead of a minus sign — (1,234) — and zero as "–". Applies to value and Δ labels including Δ %. | On / Off · default Off |
| Sum-safe label rounding | Rounds the value labels using the largest-remainder method so they add up exactly to the Σ header — no more rounding-difference questions. Off = mathematically exact individual rounding, but a rounding note appears below the Σ row when there is a discrepancy. Since 1.52.1 the option applies one precision to labels and Σ, set by the largest number; without it the rounding note compares the printed numbers. | On / Off · default Off |
| Unit on every label | Since 1.52.1 (property `labels.unitSuffix`): On = every label carries magnitude and unit (“18.5M”). Off = the number only (“18.5”), the unit appears once in the title (“Net revenue in mEUR”), as IBCS recommends; KPI cards then use one common unit. The abbreviation stays “K” as in Power BI. | On / Off · default On |

### Category Axis

![Schematic: Format pane → Category axis: text size of the axis labels. German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-kategorienachse.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| Font size | — | 6–24 · default 10 |

### IBCS Colors

![Schematic: Format pane → IBCS colors: theme adoption plus the scenario colors – Actual (AC) dark grey, Previous year (PY) light grey, Plan (PL) as outline, good variance teal, bad variance red. German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-ibcs-farben.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| Use report theme colors | Takes the good/bad and neutral colors from the report theme instead of the color pickers below. | On / Off · default Off |
| Appearance | Since 1.43: “Auto” detects dark report themes from the luminance of the theme background color and switches ink, axes and areas to light tones; “Dark” forces this for manually darkened pages. Color pickers on their light defaults are replaced automatically by their light counterparts; your own colors stay. In dark mode the visual also draws the hover tooltip itself (since 1.44). | Options: Auto \| Light \| Dark · default “Auto” |
| Color preset | “Blue/orange” (ColorBrewer #2C7BB6/#E66101) overrides the good/bad pickers — distinguishable by lightness even with achromatopsia and in black-and-white print; lightened automatically in dark mode. | Options: Custom colors \| Blue/orange · default “Custom colors” |
| Actual (AC) | — | default #404040 |
| Previous Year (PY) | — | default #B3B3B3 |
| Plan outline (PL) | — | default #404040 |
| Good variance | The default is the DatenWG teal (#1E8F9E) instead of classic green — the blue component keeps "good" clearly distinguishable from red even with red-green color deficiency. Overridable here. | default #1E8F9E |
| Bad variance | — | default #D64541 |

### Scale & Reference Line

#### Scale sync

![Schematic: Format pane → Scale & reference line: Scale-sync subgroup (minimum maxima, cap outliers) and Reference-line subgroup (value & label). German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-skala.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| Scale minimum maximum | Scales the base chart at least up to this value — for identical scales across multiple visuals (IBCS). 0 = automatic. Larger data values still extend the scale. Since 1.45 it also applies in the waterfall. | from 0 · default 0 |
| Variance minimum maximum | As above, for the variance panels (symmetric ±). 0 = automatic. Since 1.45 the ΔPY and ΔPL panels share ONE scale — the value applies to both. Since 1.52 the Δ panels run at the scale of the base; the value acts as the lower limit of the Δ span. | from 0 · default 0 |
| Cap outliers at maximum | Makes the scale maximum hard: larger values are capped and marked with a ⫽ double stroke (the label shows the real value). Since 1.45 every capped element carries the marker (including PY, PL, BM and lines); a target line above the cap no longer stretches the axis. | On / Off · default Off |

#### Scatter axes

| Setting | Description | Options / default |
| --- | --- | --- |
| X axis minimum | Scatter mode only (since 1.48): fixes the axis bound — for identical axes across several scatter visuals on a page. Empty = automatic, 0 is a valid value, k/M/B suffixes as for the reference line (e.g. “50k”). Dots outside the fixed bounds are not drawn but counted (“n outside the axes”). | Free text · empty = automatic |
| X axis maximum | As above — fixes the upper X bound. | Free text · empty = automatic |
| Y axis minimum | As above, for the Y axis (AC). | Free text · empty = automatic |
| Y axis maximum | As above, for the Y axis (AC). | Free text · empty = automatic |
| X axis logarithmic | Scatter mode only (since 1.48): logarithmic X axis with decade ticks (1-2-5 steps for a narrow span). Applies only when all X values, including the reference line and fixed bounds, are greater than 0 — otherwise the axis stays linear, with a note in edit mode. One deck-wide decision with small multiples; the trend line regresses in log space. | On / Off · default Off |
| Y axis logarithmic | As above, for the Y axis (AC): only when all Y values are greater than 0, otherwise linear with a note. | On / Off · default Off |

#### Reference line

| Setting | Description | Options / default |
| --- | --- | --- |
| Reference line (value) | Draws a target/threshold line at this value across the base chart. Empty = off. | Free text · z. B. 1200000 |
| Reference line (label) | — | Free text · z. B. Ziel |
| X reference line (scatter) | Vertical reference line on the X axis in scatter/bubble mode (since 1.47); together with the reference line it overrides the quadrant lines. | Free text · empty = off |

#### Waterfall axis

| Setting | Description | Options / default |
| --- | --- | --- |
| Axis break | IBCS axis break in the waterfall (since 1.45): anchors become stubs with ⫽ across the full bar width. The axis is only cut when all anchors and deltas sit entirely above the break; a title suffix and the export footer disclose it, and small multiples share ONE break. “Auto” highlights the in-chart chip “⫽ axis” — the cut happens only on click. “Shorten anchors (axis break)” under Chart → Bridge switches the break on while it is set to “Off”. | Options: Off \| Auto \| On · default “Off” |
| Break at value | Manual break value; 0 = automatic (a round value below the lowest cascade level). | from 0 · default 0 |

### Comments

![Schematic: Format pane → Comments: show comment list, comment font size and capturing comments in the chart. German format pane shown; the English pane has the identical structure.](../doku-assets/pane/pane-kommentare.png)

| Setting | Description | Options / default |
| --- | --- | --- |
| Show comment list | Shows the comments as a numbered list to the right of the chart — stays visible in PDF/PowerPoint export too. | On / Off · default On |
| Comment font size | Font size of the comment list in pt (8–24). Also multiplied by the font preset and the scaling factor, so it scales with the rest of the visual. | 8–24 · default 10 |
| Capture comments in chart | Comment mode: clicking a category opens an input field — the comment is stored in the report (bookmark-capable, travels with the PBIX). While the mode is on, clicks do not cross-filter. Off by default. | On / Off · default Off |

### Empty State

| Setting | Description | Options / default |
| --- | --- | --- |
| Empty state in edit mode | What the report author sees while no data is displayed: the start hub (“Get started” checklist, feature tour, IBCS templates by purpose, demo gallery, field guide with every role; HD · Full HD · UHD and the docs at the bottom), only the demo gallery for picking the chart type (behaviour up to 1.49), the field guide or the own message from title/text below. Since 1.49, start hub since 1.50. Readers and exports see the calm landing card regardless. | Options: Start hub (get started, tour, templates, demo, fields) \| Demo gallery (pick a chart type) \| Field guide (which field goes where) \| Own message (title / text below) · default „Start hub (get started, tour, templates, demo, fields)“ |
| Custom title | Replaces the “ChartKitchen byDatenWG” heading in the empty state (no fields bound, or a selection without rows) — for readers and exports on the calm landing card (since 1.51.1), while editing in the “Own message” mode. Since 1.44. | Free text · empty = default |
| Custom text | Your own text below the title — e.g. a hint which fields to bind or why the selection is empty. | Free text · empty = default |

## 09 · FAQ & troubleshooting

### The visual only shows a hint like “requires PY or PL”.

The integrated bridge, category bridge, P&L statement, dumbbell and slope modes need a comparison basis. Bind a measure to the Previous Year (PY) or Plan (PL) role.

### Why is there no running total (YTD) in the matrix?

Cumulation is deliberately disabled in the matrix: it would cumulate over the flat row list and double-count the column groups (e.g. quarters). Use YTD in columns or line mode, or compute the running total as a measure in the data model.

### What does the bridge look like with negative values or losses?

Since 1.53 the integrated and category bridge draw negative values instead of falling back to a hint (up to 1.52.4 the docs said “does not support all-negative totals”). Loss months hang below a zero line, anchors below zero become bars pointing down, and all-negative category bridges are mirrored (zero line on the right or at the top). Details and special cases are under the “Integrated bridge” and “Category bridge” modes in chapter 05. If the bridge still shows only a hint, the comparison basis PY/PL is missing or, in the integrated bridge, there is not enough room.

### Numbers appear in k€ instead of thousands as expected.

The display units are set to Auto or Thousands (k). Set Data labels → Display units to the level you want; the unit appears in the title. For mixed €/%/unit rows use “Row number formats” in the table.

### Horizontal scrolling of the matrix is missing in the PDF/PowerPoint export.

A still image cannot scroll, so the “… +n” hint applies on export (since 1.53 in the header of the name column). If the expanded months do not fit the tile, the export falls back first to the report's expand state and then to collapsed quarter blocks instead of cutting quarters off. Narrow the matrix beforehand: two-row compact mode, fewer value columns, adjusted column widths or collapsed column groups.

### In the Power BI service “Export to PDF/PowerPoint” is greyed out or the visual is missing from the subscription email.

That is not a setting in the visual: PDF/PowerPoint export and subscription emails in the service render only **certified** visuals, and ChartKitchen is not certified until the AppSource certification. Until then, export via Power BI Desktop (File → Export → PDF) or browser print — details and a link to the security page in the section [“Export”](#export) in chapter 07.

### PY appears as a triangle instead of a column.

With three bound scenarios (AC + PY + PL) the visual shows PY as a grey triangle per IBCS so as not to clutter the column. Turn it off under Chart → “PY as triangle”.

### The good/bad colours don’t match my KPI (e.g. costs).

For costs a higher value is bad. Enable Chart → “Invert” globally or “Invert per category” for individual rows (e.g. expense items next to revenue).

### The filter context is not shown in the footer.

Report filters are not exposed to custom visuals via API. Bind a text measure (e.g. via SELECTEDVALUE/CONCATENATEX) to the “Filter info” role and enable the filter footer in the “IBCS title” card.

### A rounding note appears below the Σ row.

Enable Data labels → “Sum-safe label rounding”. The individual labels are then rounded with the largest-remainder method so they add up exactly to the Σ header.

### Δ% shows “n.a.” — why?

Deliberate since 1.45: when the basis is 0 or the sign flips between basis and actual, any percentage would be misleading (e.g. “−250 %” for an improvement). The visual then shows “n.a.” — everywhere: labels, pins, tooltips, table, cards, Σ header and the P&L statement. P&L cost rows with a consistently negative basis keep their percentages.

### Clicking in another visual filters ChartKitchen instead of highlighting it.

Intended (since 1.46): the visual interaction for ChartKitchen is always “filter” — Power BI no longer offers “highlight” for this visual. That way the Σ header, scales and all modes work consistently on the filtered data during cross-interaction. The visual's own selection (click on a bar/row/card, Ctrl = multi-select) still dims locally.

### On dark report pages the text is barely readable.

Set IBCS colors → “Appearance” to “Auto” (detects dark themes from the background luminance) or explicitly to “Dark” — ink, axes, areas and, since 1.44, the hover tooltip then switch to a dark rendering with light text.

### Instead of the mode gallery a start hub with large buttons appears.

The default for authors since 1.50 (chapter 03). The previous gallery sits behind “View demo”; to see it directly, set Empty state → “Empty state in edit mode” to “Demo gallery”. Readers never see the hub.

### “⏳ n rows loaded …” or a note about incomplete data appears at the bottom right.

Since 1.49 the visual fetches more than 1,000 category rows. The note about incomplete data appears when Power BI delivers no further segments or the 30,000-row limit kicks in — then condense the category or filter the page.

### A button in the chart is grey and does not react.

It is locked because it would have no effect in the current state; the tooltip names the reason (chapter 07, “Locked instead of silent chips”).

### “↺ Back to template” appears at the bottom left.

An IBCS template is set and at least one of its settings has been changed. A click restores the template state; to keep your changes, set Chart → IBCS chart template to “Off”. Readers and exports never see the chip.

**ChartKitchen byDatenWG** · Version 1.53.0.0

Download: [chartkitchen-byDatenWG-latest.pbiviz](../downloads/chartkitchen-byDatenWG-latest.pbiviz) (always the current version) · Sister visual: [P&L Statement byDatenWG – documentation](../pnl-doku_en.html) · For IT & admins: [Security & deployment](../visuals-sicherheit_en.html)

Contact: Michael Tenner · [michael.tenner84@gmail.com](mailto:michael.tenner84@gmail.com)

A changelog ships with the visual package.

> IBCS® is a registered trademark of the IBCS Association. This visual is inspired by the IBCS principles and is not affiliated with the IBCS Association.

---

## Other versions of this page

- HTML (authoritative): https://datenwgknowledgekitchen.com/chartkitchen-doku_en.html
- PDF: [chartkitchen-doku_en.pdf](../chartkitchen-doku_en.pdf)
- German: [chartkitchen-doku.html](../chartkitchen-doku.html) · [chartkitchen-doku.md](chartkitchen-doku.md)
- Quick start: [chartkitchen-schnellstart_en.html](../chartkitchen-schnellstart_en.html) · [chartkitchen-schnellstart_en.md](chartkitchen-schnellstart_en.md)
- Reference for AI agents (data contract, all format properties): [ibcsInspiredChartDeck/AGENT-GUIDE.md](../ibcsInspiredChartDeck/AGENT-GUIDE.md)
