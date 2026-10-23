# P&L Statement byDatenWG — Documentation

> Markdown version of [pnl-doku_en.html](../pnl-doku_en.html) · https://datenwgknowledgekitchen.com/pnl-doku_en.html · generated with scripts/build_md.py — if the two differ, the HTML version prevails.

Power BI visual · End-user documentation

The IBCS-inspired P&L visual for Power BI: a statement straight from your account dimension — as a classic table or as a mega table with the IBCS templates T01–T04, 12A, 12G and 12H, plus structure bars, row waterfall, value driver tree and tile zoom. This documentation leads from the import through data model, views and templates to the complete settings reference.

Version · **1.5.3.0** · As of · **2026-10-23** · IBCS-inspired

## Contents

1. [What is the visual?](#intro)
2. [The product family](#family)
3. [The start hub](#hub)
4. [Quick start & import](#quickstart)
5. [Data model & roles](#data)
6. [The views](#views)
7. [IBCS templates](#templates)
8. [Settings reference](#settings)
9. [Interaction](#interaction)
10. [Deviations from the IBCS sheets](#deviations)
11. [Troubleshooting](#faq)
12. [Version note 1.5.3.0](#version)

## 01 · What is the visual?

**P&L Statement byDatenWG** is a standalone Power BI custom visual for the income statement and any other account hierarchy — the sister visual of [ChartKitchen](../chartkitchen-doku_en.html); the two form a product family with a shared notation and handling (chapter 02). It reads the hierarchy from your dimension table (star-schema levels L1..Ln or parent-child), computes subtotals, formula and margin rows itself and shows the scenarios **AC** (actual), **PY** (previous year), **PL** (plan) and **FC** (forecast) with their variances.

*One* data binding gives four views, switched in the toolbar above the statement — readers need no format pane for it:

- **P&L statement (table):** accounts, subtotals, formula and margin rows with the period blocks MTD · YTD · FY outlook, Δ bars and Δ% pins on one scale per unit across all rows and blocks.
- **Mega table:** the same table view as an IBCS table — value and Δ columns freely combined, Δ as number, bar, pin or integrated waterfall, value cascades, two period blocks, thresholds with a footer. A template (T01A … 12H) sets all switches at once.
- **Structure bars and row waterfall:** the same rows as size bars against the reference, or as a cascade in which the result rows anchor on the zero line.
- **Value driver tree with tiles:** the formula graph as a DuPont tree (or, without formula rows, the plain hierarchy) with a mini chart on every card; a click opens the node's tile view with combo chart, scenario grid and drivers.

The notation follows the **IBCS® principles**: AC filled in dark gray (#404040), PY gray, PL white with an outline, FC hatched; labels outside with an explicit “+”, one scale per unit across all rows and period blocks (following IBCS 2.0 / ISO 24896), margin rows with Δ in percentage points, no gridlines. The interface speaks German, English, Spanish and Japanese (it follows the report language), has a dark mode and high contrast, and welcomes authors with a start hub when they drag it onto the page (chapter 03). The visual makes no external calls, stores nothing outside the report and sends no telemetry.

> **Documented deviation: teal instead of green.** Favorable variances are teal (#0E8585) by default, unfavorable ones red (#E02B1D) — instead of the IBCS green #8CB400 / red #FF2600. This keeps variances readable with red–green color-vision deficiency; legend and footer name the deviation. Switch it under Style → Variance colors (IBCS classic green) or with the variance color preset Blue / orange (ColorBrewer #2C7BB6 / #E66101, distinguishable even without color vision and in black-and-white print). Dark mode uses the ChartKitchen pair #3FB3C2 / #E4635F.

This guide describes version **1.5.3.0**. Every default in the settings reference has been checked against the visual's settings model. New since 1.5: scaling following IBCS 2.0 / ISO 24896 as the default in every view (one scale per unit, outlier zone, scale note; chapter 06), collapsible control bars (☰, chapter 08) and the auto headline as a full sentence. Since 1.3 and 1.4: the start hub (chapter 03) with the template gallery by purpose, “🚀 Get started”, the HD · Full HD · UHD font-size bar and docs button, ☰ Start as the first toolbar button, “↺ Back to template” including re-apply, and the calm landing card for readers.

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

[Go to the ChartKitchen docs →](../chartkitchen-doku_en.html#family)

Depth · tables & statements

#### P&L Statement byDatenWG

The income statement row by row — “What is in the P&L, and why does it deviate?”.

- **Mega table:** the IBCS table templates T01–T04 plus 12A, 12G and 12H — value cascades, Δ waterfalls, pins, thresholds.
- **Formula engine:** hierarchy, subtotals, formula and margin rows straight from the account dimension (level columns or parent-child).
- **Value driver tree:** the formula graph as a DuPont tree with mini charts on every card and a tile zoom per node.
- **Period blocks:** month · YTD · FY outlook side by side; readers switch columns, reference and unit in the toolbar.
- **Structure bars & row waterfall:** the same P&L rows as size bars or as a cascade with result anchors.

✓ This documentation

> **A typical report page uses both side by side** — the P&L from P&L Statement on the left, ChartKitchen with the monthly trend, a driver bridge or KPI cards on the right. With `fixedMax` they share the scale: enter the same amount in ChartKitchen under *Scale & reference line → Scale minimum maximum* and in P&L Statement under *Numbers → Scale minimum-maximum (values)* — equal amounts then give bars of equal length (IBCS: identical scales).

### Shared handling

If you can operate one of the two visuals, you can operate the other: getting started, templates and rendering follow one shared specification. The table lists what is the same and where it sits in each visual.

| Shared | ChartKitchen | P&L Statement |
| --- | --- | --- |
| **Start hub** 🚀 Get started plus four buttons: tour · template gallery · demo · explain fields — edit mode only. | Tour with 11 cards, demo = gallery of the 13 chart types, field guide with all 19 roles. | Tour with 7 cards (real mini renderings), demo = example P&L, field guide with all 20 roles. |
| **Templates as presets** Gallery by purpose; one click sets every switch, afterwards everything is free. “↺ Back to template” restores the template state. | 11 IBCS chart templates C01–C13 (without C07/C11) in four groups; ↺ at the bottom left of the chart. | 17 IBCS table templates T01A–12H plus the classic table in four groups; ↺ next to the template dropdown. |
| **Font size HD · Full HD · UHD** Bar at the bottom of every hub page, with “📖 Open docs” on the right. | Saves *Data labels → Size preset* (in the format pane Compact · Full HD · Presentation; ×1 · ×1.5 · ×2). | Saves *Style → Font size preset* (HD · Full HD · UHD; ×1 · ×1.25 · ×1.6). |
| **IBCS notation, teal by default** AC filled, PY grey, PL outlined, FC hatched; favourable variances teal instead of green — readable with red–green colour-vision deficiency. | Teal #1E8F9E · red #D64541; colour preset blue/orange. | Teal #0E8585 · red #E02B1D; presets IBCS green and blue/orange. |
| **Four languages** German, English, Spanish, Japanese — follows the report language, in the hub too. | Format pane, chart texts and hub. | Format pane, toolbar, statement and hub. |
| **Dark mode & high contrast** “Auto” detects dark report themes; in high contrast, patterns instead of colours carry the message. | *IBCS colors → Appearance*. | *Style → Appearance*. |
| **Keyboard** Every button via Tab, Enter or Space triggers, Esc goes back one level or closes. | Tour: ‹ ›, arrow keys, Home/End. | Hub: digits 1–4 open the buttons; tour: ‹ › and arrow keys. |
| **Reader landing** Without data, readers and exports see a calm card without buttons; the author's own empty-state text wins. | Since 1.51.1. | Since 1.4.1. |

## 03 · The start hub

Drag P&L Statement onto a report page without fields and since 1.3 you no longer get a demo table but the **start hub** — explore first, then bind fields. Since 1.4 it is tailored to controller self-service, since 1.4.1 it looks like the one in the sister visual ChartKitchen. The hub is an author's tool: it appears in edit mode only, while fields are missing — or on demand via ☰ Start. Navigation inside the hub is local state; none of it is saved.

### The start page: get started and four buttons

At the top sits the product name with the subtitle “Explore the visual before you bind fields — or just get going.”, below it the full-width teal button **🚀 Get started** and four large tiles. The digits 1–4 open the tiles directly.

- **What can the visual do?** — a tour in 7 cards: the P&L as a table, mega table with IBCS templates, value driver tree, structure bars, row waterfall, tiles, dark mode & high contrast. Every card shows a real, scaled-down rendering of the visual over the built-in demo — no images. Page with ‹ › or the arrow keys.
- **Templates** — the template gallery by purpose (see below).
- **Show demo** — the example P&L with pharma data (Smart Start), on which views, toolbar and templates already work.
- **Explain fields** — all 20 data roles in four groups (“Required · structure and actual”, “Scenarios and time”, “Statement logic”, “Extras”), each with one sentence of purpose and ✓ once bound. Plus two premises: *IBCS notation* (AC filled · PY grey · PL outline or double line · FC hatched; rule “minuend → fill, reference → axis”) and *structure vs time* (accounts run vertically in rows, time horizontally in blocks month | _YTD | FY).

Every sub-page and level carries the **“← Back”** pill at the top left; Esc goes back one level and the focus returns to the tile or the get-started button. Everything is a native button (Tab · Enter · Space); dark mode and high contrast apply in the hub too.

### The template gallery by purpose

18 tiles — the classic table and the 17 IBCS templates (chapter 07) — sit in four groups, each with one sentence of purpose. Every tile carries a finance title, a benefit line and the T number as a small badge on the preview; templates that analyse the forecast show a preview with simulated FC.

| Group | Template | Tile title | Benefit line |
| --- | --- | --- | --- |
| **Structure comparison** Regions, products, cost centres side by side — who is above, who below plan? | T01A | Regions with plan variance | Values and Δ as figures, month \| YTD; thresholds flag outliers in red. |
|  | T01B | Regions with subtotals | Like T01A, grouped into subtotal blocks per area — for group and segment views. |
|  | T02A | Plan variance as bars | ΔPL bars and pins: which area is above, which below plan — at a glance. |
|  | T02B | Ranking by actual (YTD) | T02A sorted by AC: the largest areas on top — for top / flop lists. |
|  | T02C | Ranking by variance (month) | T02A sorted by the month's Δ: the biggest issues first — for the monthly review. |
| **Forecast** The expected outcome (FC) against plan and previous year — hatched as in IBCS. | T02E | Forecast vs previous year | FC hatched, ΔPY bars and pins, sorted by variance — is the area growing? |
|  | T02F | Forecast vs plan | Will the area land on budget? ΔPL bars and pins for the forecast, largest gaps first. |
|  | T03B | Forecast P&L with Δ to PY and plan | The outlook as a statement: PY · PL · FC and both variances as figures. |
|  | T04D | Forecast P&L with plan waterfall | How the forecast gets from plan to result: ΔPL waterfall row by row. |
|  | T04E | Forecast P&L with PY waterfall | What drives the expected result against the previous year? ΔPY waterfall with pins. |
| **P&L statement** The P&L row by row — variances as figures, bars or waterfall. | T03A | P&L with variance to PY and plan | The standard statement for the monthly report: PY · PL · AC, ΔPY and ΔPL as figures. |
|  | T04A | P&L with plan variance bars | Every row with ΔPL bars and pins — cost and revenue variances become visible. |
|  | T04B | P&L with Δ waterfall | From planned to actual result: the integrated ΔPL waterfall shows how much each row contributes. |
|  | T04C | P&L with PY waterfall | The result bridge to the previous year: ΔPY waterfall on a gray axis, pins for Δ %. |
| **Report views** Cascades, full-year outlook, plan statement — and the classic table. | 12A | Value cascades PY and actual | PY and AC cascades side by side, ΔPY bars and pins — the P&L as a picture. |
|  | 12G | Full-year outlook (FY) | Actual + forecast as the full year against PY: YTD solid, rest of year hatched, with a headline. |
|  | 12H | Plan statement vs previous year | For the budget round: PL outlined against PY, variances outlined, headline slot. |
|  | Off | Classic P&L table | Column presets, sparklines and period blocks — readers switch for themselves in the toolbar. |

- **Click = apply.** The tile writes the same as the toolbar dropdown: template, every switch, decimals and, where relevant, the headline slot in one save. The active tile carries “✓ active”, an accent border and a tinted background; clicking it again applies the template once more.
- **Without fields** the choice is saved (“Saved: T03A — becomes active once fields are bound.”) and takes effect on binding.
- **In the overlay** (via ☰ Start) a click applies the template, switches to the table view — from bars, waterfall or tree too — and closes the overlay on the result.

### 🚀 Get started — the first three minutes

Three steps from empty field wells to a finished P&L: a guided checklist whose ticks follow live. None of it is saved.

1. **Bind the fields** — the fast way first. Required: level columns L1..Ln (or account ID + parent ID) and AC. Recommended: PY and/or PL (variances), period (month | YTD blocks) and row type + sign (result and margin rows). “All fields explained →” jumps to the field guide.
2. **Pick a template** — shows the current state (“Selected: …” or still the classic table) and jumps to the gallery with “Open the template gallery →”.
3. **Fine-tuning** — in the format pane, in this order: house terms (Scenario names → AC = “Actual”, PL = “Budget”), thresholds (Columns & mega table → Δ in red if below threshold · materiality) and decimals (Numbers → decimals) — with ✓ once set.

### The bottom bar: font size and docs

A fixed bar closes every hub page — start page, get started, tour, gallery, demo, fields and every page in the overlay:

- **Aa · HD · Full HD · UHD** — the three pills write *Style → Font size preset* (×1 · ×1.25 · ×1.6), the active one is filled teal; next to them the hint “Font size — HD for laptops · Full HD for monitors · UHD for projectors & 4K”, the only element that gives way when space is short. A click saves and redraws at once — in the overlay the P&L underneath too.
- **📖 Open docs** — an outlined pill on the right: opens this page in the browser (the German version for a German report language, otherwise this English one). It is the only outbound call — on click only and in edit mode only.
- Below, centred, the signature “made by Daten-WG”.

### With data: ☰ Start and ↺ Back to template

- **☰ Start** is the *first* element of the toolbar in edit mode — before the template picker, with an accent border and bold type. It opens the hub as an overlay above the P&L; “✕ Close” or Esc removes the layer, the view underneath is exactly as before (scroll position included) and the focus returns to the button. If the host switches to reading view, the overlay closes.
- **↺ Back to template** sits next to the template dropdown (edit mode, table view) as soon as a template is set and at least one template switch (columns, headline) deviates. A click restores the template state — every switch and the decimals. Changed decimals alone do not count as a deviation.

### What readers see

Readers, PDF export and subscriptions never see the hub, the overlay or the bar. Without data the visual shows them a calm **landing card** since 1.4.1: the product name in bold, below it “This visual has no data yet — fields are bound in edit mode.” and a static row of three chart schematics — no buttons, no pills, no docs link. The author's own empty-state text still wins. The same rule applies in ChartKitchen.

> You can do without the hub: *Empty state → While fields are missing (edit mode)* offers the demo statement (Smart Start), the field guide or your own message (chapter 08). Reports that saved `demo` or `fields` do not change. Visuals smaller than 300 × 220 px show only the hint text instead of the hub, even while editing.

## 04 · Quick start & import

### 1 · Import the visual

1. Download the file [`pnlByDatenWG…1.5.3.0.pbiviz`](https://raw.githubusercontent.com/Losveratos/PowerBI-Kitchen-/main/pnlByDatenWG/dist/pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358.1.5.3.0.pbiviz) (extension `.pbiviz`, also via the button at the top right).
2. In Power BI Desktop: *Visualizations* → *⋯* → *Import a visual from a file* and pick the `.pbiviz`. An older version is replaced.
3. Draw the visual generously (at least about 1200 × 800 px) — the toolbar and two column blocks need width. Freshly placed, it shows the **start hub** in edit mode (chapter 03): “🚀 Get started” walks you through fields, template and fine-tuning with ticks, “Show demo” opens the example statement on which views, toolbar and templates already work.

### 2 · Minimal setup

1. Drag the levels of your hierarchy into **Level columns (L1..Ln)** — top to bottom. Alternative: **Account ID (key)** + **Parent account ID**.
2. Bind your main measure to **AC (Actual)**. As soon as AC and a hierarchy are bound, the start hub disappears and the statement appears.
3. Set every grouping field to **“Don't summarize”** — otherwise Power BI aggregates them and the visual receives empty values.

### 3 · Extend

1. Bind **PY · PL · FC** — every bound scenario unlocks its Δ columns.
2. Bind **Period (month)** — for the month and YTD block, sparklines and monthly cards.
3. For a real P&L: **Row type**, **Formula definition** and the **sign trio** (chapter 05); for the full-year outlook **FC Full Year** and **PL Full Year** as `MAX` measures.
4. Optionally pick an IBCS template: with one click in the template gallery of the start hub (☰ Start), in edit mode via the **Template** dropdown right after ☰ Start in the toolbar (table view), or via format pane → *Columns & mega table* → *Template* (chapter 07).

> Both paths step by step — the plain hierarchy in two minutes and the full P&L with formula rows —, a sample account dimension and the pharma demo data to play along are on the [quick start page](../pnl-schnellstart_en.html).

## 05 · Data model & roles

The visual needs an account dimension — one row per P&L row — and a fact table with the measures. There are two fully supported input modes for the hierarchy:

- **Star schema (level columns, primary mode):** L1..Ln in drag order, at most 8. The visual builds the tree itself. Ragged branches follow both common conventions: if a deeper level is empty, the last filled level is the leaf; if a level repeats the text of the previous one (L2 = L1), the path ends there. Rows with the same path are aggregated; aggregate rows (e.g. PY only on L1) act as a scenario fallback.
- **Parent-child:** Account ID + Parent account ID, any depth, unbalanced. Orphans land visibly in “Not assigned” instead of disappearing silently. If level columns and parent ID are both bound, parent-child wins.

Subtotals are synthesized from the level paths; a synthetic subtotal inherits *Display invert* and *Variance invert* when all its children agree. Formula rows refer to other rows by their unique name.

### Field roles (in field-well order)

At most one field per role, at most eight level columns. The visual reads every column by its role, never by its position — since 1.2 the field list is in the familiar order levels → keys → AC · PY · PL · FC → period → special roles.

| Field role | Type | Purpose |
| --- | --- | --- |
| Level columns (L1..Ln) | Grouping · up to 8 | Star-schema hierarchy in drag order — the primary mode. Ragged rules see above. |
| Account ID (key) | Grouping | Unique, stable account key. Required in parent-child mode, optional in level mode (leaf ID). Basis of selection and drillthrough. Without level columns and account ID the visual shows the empty state (the start hub in edit mode). |
| Account name | Grouping | Display name of the row. Without it the visual shows the account ID, or in level mode the text of the last filled level. |
| Parent account ID | Grouping | Parent-child link; unbalanced hierarchies are allowed. Wins when level columns are bound as well. |
| AC (Actual) | Measure · required | Actual value — the primary measure, drawn filled. |
| PY (Previous Year) | Measure | Previous-year value, drawn gray — basis of ΔPY. |
| PL (Plan / Budget) | Measure | Plan or budget value, drawn outlined — basis of ΔPL; in the mega table also the analysed scenario (plan statement, 12H). |
| FC (Forecast) | Measure | Forecast value, drawn hatched; can be the analysed scenario of the mega table (T02E/F, T03B, T04D/E). |
| Period (month) | Grouping | Month column for sparklines, the month and YTD block, the second period block and the monthly cards. Read formats: YYYY-MM, YYYY-MM-DD, ISO timestamps, YYYY/MM, date columns, German and English month names (long/short, with year) and numbers 1–12. “Month” is the last month *with AC data*; YTD is the period-matched window up to it. |
| Column category | Grouping · 1.2 | Optional, classic table only: the column set of the YTD block repeats once per value of this field (e.g. segment or quarter) under a group header, followed by the total block. Mega table, bars and waterfall ignore the field. |
| Row type | Grouping | `Account` · `Subtotal` · `Formula` · `KPI` · `Separator` (case-insensitive). KPI is a margin row: % display, Δ in percentage points. |
| Formula definition | Grouping | For formula and KPI rows, e.g. `[EBITDA]/[Revenue]`: `+ − * /` and parentheses, reference by unique row name, formula on formula allowed. A circular reference shows as an error on the row. |
| Sign convention (±1) | Grouping | The sign the row calculates with: revenue `1`, costs `-1`. A subtotal is sign × sum of its children. |
| Display invert | Grouping | Show positive although the calculated value is negative (cost rows). Changes the display only, not the calculation. |
| Variance invert | Grouping | Flips the favorable / unfavorable rating of a row. |
| Sort order | Grouping | Number per row that fixes the P&L order within the parent (e.g. 10, 20, 30). |
| Comment | Grouping | Comment text per row — shown as a numbered marker (①, ②) with a footnote and in the tooltip. |
| Filter info (footer) | Measure (text) | Text measure carrying the current filter context (e.g. via `CONCATENATEX`/`SELECTEDVALUE`) — shown as a second footer line when the filter footer is enabled. Report filters are otherwise invisible to custom visuals. |
| FC Full Year (outlook) | Measure | Full-year forecast (AC&FC) as a scalar, repeated on every month row; the first value wins, never summed. Unlocks the FY outlook (mega table block kind FY, template 12G). |
| PL Full Year | Measure | Full-year plan scalar for the outlook block. The FY block of the classic table needs both FY fields. |

### The sign trio

Three fields of the account dimension decide how a row calculates, how it looks and how its variance is rated. They are independent of each other — the sign logic runs through the dimension, nothing is “bent” inside the visual.

| Field | Question | Effect |
| --- | --- | --- |
| Sign convention (±1) | How does the row enter sums and formulas? | The booked value is multiplied by ±1. Costs booked positive with `-1` enter the sum negative, so `[Revenue]+[Cost of goods sold]` yields gross profit. |
| Display invert | How is the row shown? | Flips the sign for display only: −50 calculated, 50 shown. In the mega table Δ and Δ % follow the shown values. |
| Variance invert | Is “more” good or bad? | The rating uses the variance of the *calculated* value: a plus is favorable. The switch flips this rating for rows whose sign does not come through the dimension. |

> **Example — cost row “Materials”, AC 50 against PL 60.** The costs are booked positive in the fact table. With sign convention `-1` the visual calculates −50 against −60; the variance of the calculated value is +10, i.e. *favorable* (teal) — less cost than planned. *Display invert* = `true` shows the row as 50 and 60. Result for the typical cost row (as in the pharma demo): `-1` · `true` · `false`.
>
> **The other convention:** if costs arrive positive and without a sign convention (`1`) and are only subtracted by a formula, “more cost” is a plus in the calculation. Then you set *Variance invert* = `true` — the same example gives the same picture: 10 below plan, favorable. Do not combine `-1` with *Variance invert* as well unless higher values of that row really are good: the rating flips otherwise, and a cost overrun shows as favorable.

### Column category (1.2)

A field such as segment or quarter in **Column category** makes the classic table repeat its column set per category value — the column set of the YTD block (otherwise of the first block) stands under one group header per value, followed by the existing blocks as “Total”. Each category calculates completely, formulas and margins included; the months lie on the calendar of the overall model, and one uniform Δ scale applies across all blocks. At most 24 categories; further values are named in a footnote. “% of revenue” and sum-safe rounding stay in the total block. Measures must be additive (total = sum of the categories), otherwise the total block shows the sum instead of the model value. Mega table, bars and waterfall ignore the role; in edit mode a note below the table says so.

> **DAX rules models fail on:** FY measures with `MAX`, not `SUM` (the full-year values repeat on every month row); filter one reporting year, otherwise AC/PY/PL/FC sum across years; measures that return a value for non-existing account/period combinations (`COALESCE(x, 0)`, `+0`) create ghost rows — guard pattern `IF(COUNTROWS('Fact') > 0, …)`. Time intelligence, currency conversion and row-level security stay in the model: the visual only computes with the data it receives.

## 06 · The views

The toolbar group *View* switches between table, bars, waterfall and tree. The mega table is not a view of its own but a mode of the table view; the tile view opens from the tree. The chosen view is reader state and is saved with the report and in bookmarks.

### 01 · Table (classic)

The statement: accounts, subtotals, formula and margin rows with expand and collapse per row. The columns come from the **column preset** — *AC·PY·PL·FC (full)* (AC, % of revenue, PY with ΔPY bar, PL with ΔPL bar and ΔPL% pin), *AC vs reference*, *AC vs PY·PL·FC* (Δ bar and Δ% pin per bound reference), *AC·PY·ΔPY*, *AC·PL·ΔPL*, *ΔPY% · ΔPL%* (pins only) and since 1.2 *Own selection* (AC, PY, PL, FC and Δ as separate switches). Three period blocks: **MTD** (AC against the Δ reference), **YTD** and the **FY outlook** (AC&FC against PL full year, with both FY fields, in the full preset and in the own selection). All Δ bars share one scale across all rows and period blocks. If a Δ% pin exceeds ±40 %, ±40 % take the inner 80 % of the track; the outlier runs into the outer zone, a break mark separates it and a triangle points in the direction of growth (since 1.5). With a bound period, a chip per row opens a monthly sparkline; comments appear as numbered markers with a footnote.

### 02 · Mega table

As soon as a column switch of the mega table is on in the table view (value column PY, PL or AC/FC, or any ΔPY/ΔPL display), the visual draws the IBCS table; all switches off = classic table. Value and Δ columns combine freely: Δ as a number, as bars on one zero line, as an **integrated waterfall** (each Δ bar starts where the previous one ended, “=” rows restart from the zero line), Δ % as a number or pin; value columns optionally as **value cascades** (12A). One or two **period blocks** (month · YTD · FY outlook) on one shared scale, **thresholds** (“Δ in red if …”) with a footer, margin rows in italics with Δ in percentage points (pp) instead of Δ %, scenario underlines in the header and closing row. With structure data (regions instead of a P&L) there are subtotal blocks with a spacer row and a sort with “(↓)” at the sorting header, the rows of each block and the blocks themselves in the same direction (since 1.5.2, one-child groups like blocks); rows named “Other …” stay at the bottom; a spacer row follows every element of the top visible level, also between two single rows, and a group with exactly one shown child is one row (“Germany · Saxony”) without a repeated subtotal (1.5.1). Pins cap outliers automatically (Tukey fence Q3 + 4 × IQR, one limit for the whole table); the capped element runs into an outlier zone, separated by a break mark, with a triangle and the number outside. From 150 visible rows the mega table only draws the window around the viewport; the export always draws everything. In mega mode the toolbar hides column preset, Δ reference, periods and fit — the columns come from the format pane.

> **Scaling following IBCS 2.0 / ISO 24896 (since 1.5):** Same unit, same scale. All Δ bars and Δ waterfalls of all period blocks (month, YTD, FY) share one scale, all Δ% pins a second one; there is no factor between blocks, even if the month gets short (1.5.1). In 12A, 12G and 12H the Δ bars are drawn on the scale of the value cascades. Only if they would fall below the minimum data area there, a round factor (2, 5, 10, 20 …) applies to all Δ columns of the table: the column head names it (“ΔPY ×5”), and a scale note stands right-aligned above the table. Nothing is ever rescaled silently. Capped outliers run into an outlier zone (12 % of the column) with a break mark, a triangle and the number outside. Comment footnotes always stay visible: if space runs short, the visual sets them in several columns, then reduces the row height and finally keeps the block at the bottom edge while the table scrolls behind it.

### 03 · Structure bars

The same rows with one size bar each: AC against the Δ reference, plus ΔRef bar and ΔRef% pin — a look at the structure of the result without giving up the numbers. Blocks: YTD and (with both FY fields) the FY outlook. The default is a narrow AC bar inside the full reference band. Since 1.2 the **ChartKitchen notation** is available as switches (Columns & mega table → Table): *overlapping scenario bars* puts AC in front at full strength and the reference equally tall, slightly offset behind it (PY gray, PL outlined, FC hatched); *triangle marks* place small triangles at the value of every other bound scenario above the bars — PY filled gray, PL hollow outlined, FC hatched. The notation lives in the shape, not only in the color; the marks enter the value scale and are never clipped. Both switches are off by default, and the view then stays pixel-identical to 1.1. Since 1.5 the Δ bars are drawn on the scale of the value bars: if they reach beyond the column, it gets wider; if they would stay below half a column, a round factor applies, named by the column head (“ΔPL ×5”) and the scale note.

### 04 · Row waterfall

The P&L as a cascade on the root level of the hierarchy: contributions cascade, totals anchor — result anchors such as revenue, gross profit, EBITDA, EBIT, EBT and net income stand on the zero line, the cost blocks float in between. Per block one cascade for the reference and one for AC, plus ΔRef bar and ΔRef% pin; blocks MTD, YTD and FY outlook. The cascade geometry is the same function as in the integrated Δ waterfall of the mega table. Since 1.5 the Δ bars are drawn on the scale of the cascades, otherwise with a round factor and note as in the bars view.

### 05 · Value driver tree

The result tree as a DuPont graph: the root is the last formula/KPI row with operands (or the root row named in the format pane), the edges carry the operators ÷ × + − as circles. Without formula rows the tree grows straight from the hierarchy — with exactly one root it is the tree root, with several a virtual **Total root** carries them as children; the edges then carry the calculation sign. Tidy layout with one column per level, compact cards further down. Every card shows a mini chart of your choice — *monthly columns* (AC solid, reference behind), *variance columns* (AC − reference per month) or *mini bridge* (reference → Δ → AC, YTD) — and optionally a status edge in the variance color. ▾ expands and collapses a node (Shift: the whole branch), ⌖ makes a card the root, the breadcrumb and ⌂ lead back; hovering a card opens the IBCS detail view. When the card budget is reached, a note names the branches not drawn. Since 1.5 all cards of the same unit (amounts; percentage measures separately) are drawn on one scale; if a card would then cover less than a quarter of its area, it is magnified by a round factor and carries “×5” at the top right, explained by its tooltip. The hover detail view deliberately keeps its own scale and says so (“magnifying glass”). Mega table and finance switches do not act on the tree; it keeps its own fold state.

### 06 · Tiles (tile view)

A click on the chart of a tree card zooms the node to the full area: combo chart of monthly columns (reference offset behind AC) and bridge, below it the scenario grid, next to it the micro cards “Feeds into” and “Driven by” (pageable when there are many drivers). The page fits itself into the viewport — the chart is the elastic element, the grid gets more compact when height is tight. “← Back to tree” and the breadcrumb lead out; “↗ Drill” sets the node's selection and opens the context menu with the drillthrough targets in one go. Ratio rows (margins) show no bridge, because percentages are not additive. The micro cards of one column share one scale per unit (×n marked); the main chart is labelled as a magnifying glass with its own scale. Only Δ reference and unit remain in the toolbar.

## 07 · IBCS templates

The mega table rebuilds the official IBCS templates T01A–T04E as well as the report variants 12A, 12G and 12H. A template is only a **preset**: it sets all switches of the mega table group and the decimals (12G and 12H also the headline slot) in *one* save — afterwards every switch is free, you can show or hide every element individually. Templates only act in the *Table* view; *Off (classic table)* resets all mega switches.

- **Template gallery (since 1.3, most visual):** in the start hub or via ☰ Start every template appears as a tile with a preview, grouped by purpose (chapter 03); a click applies it, again too.
- **Toolbar (since 1.2, fastest):** in edit mode the *Template* dropdown sits right after ☰ Start (table view only). It writes the same settings as the format pane; readers and exports never see it. Switch it off under Display & toolbar → *Template picker in edit mode*.
- **Format pane:** card *Columns & mega table* → first group *Mega table (IBCS templates)* → *Template (IBCS table)*.

> **Scenario rule (one rule for every element):** the **minuend** — the analysed scenario — decides the **fill**: AC solid, FC hatched, PL outlined, the Δ elements too (outlined in red / green on paper, plan statement; since 1.5.1). The **reference** decides the **axis**: PY = gray axis, PL = double line. The same code appears as an underline below the column heads (AC solid, PY gray, PL double, FC hatched). In the FY block the minuend is AC&FC — mostly forecast, so its Δ elements are hatched.

| Template | What it shows | Data requirement | Preset switches | Decimals (values / Δ %) |
| --- | --- | --- | --- | --- |
| T01A | Flat structure: PY · PL · AC, ΔPY / ΔPY % / ΔPL / ΔPL % as numbers, month \| _YTD, threshold red with footer | Structure + period + AC / PY / PL | Minuend AC · value columns PY, PL, AC · ΔPY + ΔPY % as number · ΔPL + ΔPL % as number · second block · subtotals off · thresholds on | 0 / 1 |
| T01B | like T01A with subtotal blocks (e.g. Europe / Americas / RoW) | Hierarchy levels | like T01A · subtotal blocks on | 0 / 1 |
| T02A | PL · AC with ΔPL bars and ΔPL % pins, two blocks | AC / PL (+ period) | Minuend AC · value columns PL, AC · ΔPL bars + ΔPL % pins · second block · subtotals on | 0 / 1 |
| T02B | like T02A, sorted by AC descending (“(↓)” in the header) | like T02A | like T02A · sort AC/FC descending · sorting block YTD | 0 / 1 |
| T02C | like T02A, sorted by ΔPL descending | like T02A | like T02A · sort Δ descending · sorting block month | 0 / 1 |
| T02E | FC instead of AC (hatched bars), reference PY with gray axis | FC + PY | Minuend FC · value columns PY, FC · ΔPY bars + ΔPY % pins · second block · sort Δ descending (YTD) | 0 / 1 |
| T02F | FC instead of AC, reference PL with double-line axis | FC + PL | Minuend FC · value columns PL, FC · ΔPL bars + ΔPL % pins · second block · sort Δ descending (YTD) | 0 / 1 |
| T03A | P&L statement: + / − / = rows, PY · PL · AC and Δ number columns, margin row in pp | Account dimension with row type | Minuend AC · value columns PY, PL, AC · ΔPY + ΔPY % · ΔPL + ΔPL % as number · one block | 1 / 1 |
| T03B | like T03A with FC as the analysed scenario | like T03A + FC | like T03A · minuend FC | 1 / 1 |
| T04A | Statement with ΔPL bars and ΔPL % pins | like T03A | Minuend AC · value columns PL, AC · ΔPL bars + ΔPL % pins | 1 / 1 |
| T04B | Statement with integrated ΔPL waterfall (cascading bars, = anchors) and pins | like T03A | Minuend AC · value columns PL, AC · ΔPL waterfall + ΔPL % pins | 2 / 1 |
| T04C | Statement with integrated ΔPY waterfall and pins | like T03A | Minuend AC · value columns PY, AC · ΔPY waterfall + ΔPY % pins | 2 / 1 |
| T04D | like T04B with FC (hatched) | like T03A + FC | like T04B · minuend FC | 2 / 1 |
| T04E | like T04C with FC (hatched) | like T03A + FC | like T04C · minuend FC | 2 / 1 |
| 12A | PY and AC value cascades as columns of their own, plus ΔPY bars and pins | like T03A | Minuend AC · value columns PY, AC as value cascades · ΔPY bars + ΔPY % pins · margin rows off | 0 / 1 |
| 12G | FY outlook: YTD solid and rest of year hatched in the same bar, Δ on the year against the whole previous year | like T03A + FC Full Year (+ period) | Minuend AC (FY block: AC&FC) · value columns PY, AC as value cascades · ΔPY bars + ΔPY % pins · period block FY · headline slot on | 0 / 1 |
| 12H | Plan statement: PL cascade outlined, cost rows on a pale ground, ΔPY bars outlined in red / green | like T03A + PL as minuend | Minuend PL · value columns PY, PL as value cascades · ΔPY bars + ΔPY % pins · margin rows off · headline slot on | 0 / 1 |

For every template: decimals Δ % = 1 (uniform since 1.5; saved reports keep their value until the template is applied again), scenario underlines and numbers at bars / pins / cascades on, outlier arrows for Δ bars off, period block YTD (except 12G: FY), second block on the left = month; switches not named are off. The second period block needs the period field — without a period, “month” and the second block silently fall back to one YTD block; without FC Full Year, FY falls back to YTD.

> Re-applying the same template works since 1.3: a click on the active tile in the gallery or “↺ Back to template” next to the toolbar dropdown restores the template state — the native dropdown itself cannot report an entry that is already selected. If you write reports as PBIR, set `columns.template` and `columns.templateApplied` to the same value; otherwise the visual applies the template on its first render and overwrites the switches you wrote (see the [AGENT-GUIDE](https://github.com/Losveratos/PowerBI-Kitchen-/blob/main/pnlByDatenWG/AGENT-GUIDE.md)). For comparison with the reference sheets: [TEMPLATE-GUIDE](https://github.com/Losveratos/PowerBI-Kitchen-/blob/main/pnlByDatenWG/TEMPLATE-GUIDE.md) and the HTML prototype `pnlByDatenWG/prototype/megatable.html`.

## 08 · Settings reference

The format pane has eight cards in this order: **Columns & mega table** → **Display & toolbar** → **Numbers** → **Scenario names** → **Style** → **Title block** → **Hierarchy** → **Empty state**. The tables list every setting with options and default; names follow the English interface.

> **Visibility:** the format pane only shows what fits the current view and the bound fields — the mega table group only in the table view, the tree group only in the tree, ΔPY switches only with PY, threshold fields only while thresholds are on. A hidden switch keeps its value; hiding never changes what renders. Without data (and in the demo) everything stays visible. The “Visible …” notes in the tables name these conditions.

### Columns & mega table

#### Mega table (IBCS templates)

The first group of the card since 1.2. Visible in the table view. Every switch acts on its own; the template only writes their defaults.

| Setting | Description | Options / Default |
| --- | --- | --- |
| Template (IBCS table) | Sets the switches below to the template defaults — afterwards every switch is free. | Options: Off (classic table) \| T01A \| T01B \| T02A \| T02B \| T02C \| T02E \| T02F \| T03A \| T03B \| T04A \| T04B \| T04C \| T04D \| T04E \| 12A \| 12G \| 12H · Default “Off (classic table)” |
| Analysed scenario (minuend) | AC filled, FC hatched, PL outlined; the Δ bars follow the minuend (PL: outlined in red / green, plan statement 12H). The Δ columns compare it with PY / PL. FC and PL need their field. With PL there is no ΔPL; value column PL and value column AC/FC then give one PL column. Visible with FC or PL bound. | Options: AC (actual) \| FC (forecast) \| PL (plan statement) · Default “AC (actual)” |
| Value column PY | Previous-year values as a number column. Visible with PY bound. | On / Off · Default Off |
| Value column PL | Plan values as a number column. Visible with PL bound. | On / Off · Default Off |
| Value column AC / FC | Values of the analysed scenario as a number column. | On / Off · Default Off |
| Value columns as value cascades (12A) | Every shown scenario becomes a cascade chart column: steps on the running total, = rows from zero, cost rows light. Visible as soon as a value column is on. | On / Off · Default Off |
| ΔPY as number | Absolute variance against the previous year. Visible with PY bound (applies to all ΔPY switches). | On / Off · Default Off |
| ΔPY as bars | Variance bars on one zero line, gray PY axis. | On / Off · Default Off |
| ΔPY as integrated waterfall | Each Δ bar starts where the previous one ended; = rows restart from the zero line (T04C/E). | On / Off · Default Off |
| ΔPY% as number | Relative variance against the previous year. | On / Off · Default Off |
| ΔPY% as pins | Relative variance as pins (lollipops). | On / Off · Default Off |
| ΔPL as number | Absolute variance against plan. Visible with PL bound (applies to all ΔPL switches). | On / Off · Default Off |
| ΔPL as bars | Variance bars on one zero line, double PL axis. | On / Off · Default Off |
| ΔPL as integrated waterfall | Each Δ bar starts where the previous one ended; = rows restart from the zero line (T04B/D). | On / Off · Default Off |
| ΔPL% as number | Relative variance against plan. | On / Off · Default Off |
| ΔPL% as pins | Relative variance as pins (lollipops). | On / Off · Default Off |
| % of revenue column | Share of every row in the revenue base row (group Table), right of the value columns. | On / Off · Default Off |
| Second period block (month \| _YTD) | The month of the last actuals left, the year to date right. Visible with the period bound. | On / Off · Default Off |
| Period block | Month of the last actuals, year to date or FY outlook (AC&FC vs PL, needs the FY fields); with a second block the right one. Visible with the period or the FY fields. | Options: Month \| YTD \| FY outlook (AC&FC vs PL) · Default “YTD” |
| Second block (left) | Period of the block left of the period block when the second block is on. Visible with the period and the second block on. | Options: Month \| YTD \| FY outlook (AC&FC vs PL) · Default “Month” |
| Subtotal blocks (structure data) | Regions / structure hierarchies: subtotal blocks with a spacer row; off = leaves + total only. Visible with structure data (no P&L row types). | On / Off · Default On |
| Margin / % rows | KPI rows (margins) in italics, their Δ in percentage points (“+8.6 pp”), without a relative Δ %; margins use the Δ% decimals. Applies to T03 and T04 alike; in T04 the pp number stands at the axis of the Δ bars or the Δ waterfall. Visible with P&L data. | On / Off · Default On |
| Δ in red if below threshold (+ footer) | Δ numbers below the thresholds turn red; a footer names the rule. Visible as soon as a Δ number column (ΔPY/ΔPL or Δ% as number) is on. | On / Off · Default Off |
| Threshold Δ (month / single block) | In display units (after k/m scaling). The default −20 means thousands and is converted at m and b scaling (m: −0.02); a value you set applies as typed. Visible while thresholds are on. | Number · Default −20 (k) |
| Threshold Δ% (month / single block) | In whole percent. Visible while thresholds are on. | Number · Default −10 |
| Threshold Δ (_YTD block) | Threshold of the second block, in display units. The default −220 means thousands and is converted at m and b scaling (m: −0.22). Visible with thresholds, second block and period. | Number · Default −220 (k) |
| Threshold Δ% (_YTD block) | Threshold of the second block, in whole percent. Visible with thresholds, second block and period. | Number · Default −10 |
| Scenario underlines (head + closing) | AC solid, PY gray, PL double, FC hatched under the column heads. | On / Off · Default On |
| Numbers at bars / pins / cascades | Value labels next to every chart element. Visible as soon as a chart column (Δ bars, pins, waterfall or value cascade) is on. | On / Off · Default On |
| Outlier arrows for Δ bars too | Pins always cap outliers (Q3 + 4 × IQR); this extends it to the Δ bars. Capped elements run past the regular maximum into an outlier zone, a break mark separates them, a triangle points in the direction of growth, the number stands outside (since 1.5). Visible with ΔPY or ΔPL bars. | On / Off · Default Off |
| Sort (structure data) | Per subtotal block; rows named Other … stay at the bottom. Visible with structure data. | Options: Category order \| AC/FC descending \| Δ descending · Default “Category order” |
| Sorting block | Which period block decides the order. Visible with structure data, second block, period and a sort other than category order. | Options: Month block \| YTD block · Default “YTD block” |

#### Table

Classic table, bars and waterfall. The defaults of this group apply when the report opens; readers switch much of it in the toolbar. A default *changed* in the format pane wins over the saved reader state (only the changed one).

| Setting | Description | Options / Default |
| --- | --- | --- |
| Default column preset | Column set of the classic table when the report opens; readers switch it in the toolbar. “Own selection” (1.2) builds the columns from the five switches below. | Options: AC·PY·PL·FC (full) \| AC vs reference \| AC vs PY·PL·FC \| AC·PY·ΔPY \| AC·PL·ΔPL \| ΔPY% · ΔPL% \| Own selection (switches below) · Default “AC·PY·PL·FC (full)” |
| Own selection: AC column | Actual values as a number column (with % of revenue, if on). Visible with the preset “Own selection”. | On / Off · Default On |
| Own selection: PY column | Previous-year values as a number column. Visible with “Own selection” and PY bound. | On / Off · Default On |
| Own selection: PL column | Plan values as a number column. Visible with “Own selection” and PL bound. | On / Off · Default On |
| Own selection: FC column | Forecast values as a number column. Visible with “Own selection” and FC bound. | On / Off · Default Off |
| Own selection: Δ bar + Δ% pin | Variance of AC against the Δ reference as bar and pin. Visible with the preset “Own selection”. | On / Off · Default On |
| Default Δ reference | Basis of the Δ columns, bars and tree cards. Auto takes PL, else PY. | Options: Auto (PL, else PY) \| Previous Year (PY) \| Plan (PL) \| Forecast (FC) · Default “Auto (PL, else PY)” |
| Bars view: overlapping scenario bars | AC in front at full strength, the reference (PY gray / PL outlined / FC hatched) behind it and slightly offset — the ChartKitchen notation. Visible in the bars view. | On / Off · Default Off |
| Bars view: triangle marks for further scenarios | Small triangles at the value of every other bound scenario (PY gray, PL outlined, FC hatched) above the bars. Visible in the bars view. | On / Off · Default Off |
| Period sort order | Automatic reads YYYY-MM keys, dates and month names; data order keeps the model's own sequence (fiscal years); calendar year forces Jan..Dec. Visible with the period bound. | Options: Automatic \| Data order (fiscal year) \| Calendar year · Default “Automatic” |
| % of revenue column | Share of every row in the revenue base row, next to AC. | On / Off · Default On |
| Revenue base row (id or name) | Row the % of revenue refers to. Empty = first top-level row. Visible when one of the two % of revenue columns is on. | Text · Default empty |
| Hide zero rows (default) | Rows without any value disappear; readers can switch it in the toolbar. | On / Off · Default Off |
| Fit table to width (default) | Squeezes the chart columns until the table fits the viewport — no horizontal scrolling. | On / Off · Default Off |
| Export: expand all rows | PDF / PowerPoint export and subscriptions print every row expanded, whatever is folded on screen. | On / Off · Default On |
| Highlight rows | Comma-separated row names (or ids), case-insensitive: a quiet band runs over all columns of these rows (IBCS EMPHASIZE). Empty = off. | Text · Default empty |
| Materiality from (absolute) | Variances below this absolute amount (data units, before k/m scaling) are shown in soft gray instead of the variance colors — numbers, bars, pins and waterfall steps. 0 = off. | ≥ 0 · Default 0 |
| Materiality from (%) | Variances below this Δ% are shown in soft gray. If both thresholds are set, a variance must exceed both to be colored. 0 = off. | 0–100 · Default 0 |

#### Value driver tree

Start of the tree view. Visible in the tree view.

| Setting | Description | Options / Default |
| --- | --- | --- |
| Driver tree root row (id, name or category) | Empty = last formula/KPI row with operands, otherwise the model root. | Text · Default empty |
| Driver tree start depth | How many levels of the tree are open when it starts. 0 = the whole tree. | 0–8 · Default 0 |
| Driver tree card chart | Mini chart on every card: monthly columns, variance columns or a mini bridge. | Options: Monthly columns (AC vs PL) \| Variance columns (Δ vs reference) \| Mini bridge (REF → Δ → AC) · Default “Monthly columns (AC vs PL)” |
| Driver tree status indicator (Δ colour) | Card edge and Δ% in the card head in the variance colour. | On / Off · Default On |

### Display & toolbar

What readers see above the statement and what they may switch themselves. A hidden group only takes the button away from readers — the default from the format pane keeps acting.

| Setting | Description | Options / Default |
| --- | --- | --- |
| Show toolbar (viewers can switch views) | Buttons above the statement: view, columns, unit, density, levels. | On / Off · Default On |
| Show scenario legend row | AC · PY · PL · FC chips plus favorable / unfavorable Δ under the toolbar. | On / Off · Default On |
| Group: view | Table · Bars · Waterfall · Tree. Visible while the toolbar is shown (applies to every group switch). | On / Off · Default On |
| Group: column presets | Column sets of the classic table. | On / Off · Default On |
| Group: Δ reference | PY · PL · FC as the basis of every Δ. | On / Off · Default On |
| Group: periods (MTD/YTD/FY) | Period blocks of the classic table. | On / Off · Default On |
| Group: unit | Switch between thousands and millions. | On / Off · Default On |
| Group: density | Normal or compact rows. | On / Off · Default On |
| Group: expand level | Open the hierarchy down to level 1, 2 … or completely. | On / Off · Default On |
| Group: options | % of revenue, hide zero rows, fit to width. | On / Off · Default On |
| Group: scenario (mega table) | Readers switch the analysed scenario AC / FC and the reference view ΔPY · ΔPL · both of the mega table. | On / Off · Default Off |
| Group: value columns (scenarios one by one) | Readers combine the value columns freely — AC, PY, PL, FC and Δ against the Δ reference (classic table), analysed scenario · PY · PL (mega table). The column presets stay as quick picks. | On / Off · Default Off |
| Template picker in edit mode | A compact template dropdown at the front of the toolbar, right after ☰ Start, while you edit the report (table view). Readers and exports never see it. | On / Off · Default On |
| Control bars collapsible (☰) | Toolbar, legend and hint lines (scale note, tree hint) fold behind a small ☰ button; folded, one slim row remains. For small tiles. Title, column heads with a scaling factor and the ×n marks of the cards stay visible; exports always print the legend. Since 1.5. | On / Off · Default Off |
| Start collapsed | The visual opens folded, readers unfold it with ☰. The reader's choice applies at run time and is not saved. Since 1.5. Visible with collapsible control bars. | On / Off · Default On |

### Numbers

| Setting | Description | Options / Default |
| --- | --- | --- |
| Scaling | Auto switches to k from 50,000, to m from 50 million and to b from 50 billion. Readers switch the unit in the toolbar (b only when the data needs it). | Options: Auto \| None \| Thousands (k) \| Millions (m) \| Billions (b) · Default “Auto” |
| Unit (e.g. EUR) | Follows k / m in the title, the scale note and the cards. | Text · Default “EUR” |
| Decimals (values) | Decimal places of values and Δ. A template sets them too. | 0–3 · Default 1 |
| Decimals (Δ%) | Decimal places of Δ% and margins. A template sets them too (since 1.5 every template to 1). | 0–2 · Default 1 |
| Finance format (parentheses) | Finance convention: negative values in parentheses instead of a minus sign — (1 234) — and zero as “–”. Applies to values, Δ and Δ%; positive Δ keep their “+”. | On / Off · Default Off |
| Sum-safe rounding | Rounds the value columns with the largest-remainder method so printed children add up exactly to their printed subtotal (formula and margin rows keep exact rounding). The Δ number is then the difference of the printed values. | On / Off · Default Off |
| Scale minimum-maximum (values) | Value bars and value cascades are scaled at least up to this amount — identical scales across several visuals (IBCS), also next to ChartKitchen. Data units, k / m / b allowed (e.g. 1.5m). The text is in data units before k/m/b scaling (comma or point). It is a minimum maximum: larger values still widen the scale. Holds the value cascades (12A, 12G, 12H) at [0, max]; Δ% pins always stay automatic. In edit mode “Scale fixed” appears below the table; for readers and in the export the scale note of the mega table names the fixed scale. | Text · Default empty (automatic) |
| Scale minimum-maximum (Δ) | Same for the Δ bars and integrated Δ waterfalls (symmetric ±max). Data units before scaling, k / m / b allowed. In 12A, 12G and 12H cascade and Δ are one unit: set both values, otherwise one tab may get “ΔPY ×5” and another not. Equal pixels per amount across the tabs of a page group require equally sized tiles, the same template column set and the same font size, as long as no tab exceeds the values. | Text · Default empty (automatic) |

### Scenario names

House terms for AC, PY, PL and FC — e.g. “Actual”, “LY” or “Budget”. They appear in toolbar, legend, column heads (ΔPY/ΔPL too), tooltips, title and footers.

| Setting | Description | Options / Default |
| --- | --- | --- |
| Rename AC | Custom term for AC. Empty = AC. | Text · Default empty (AC) |
| Rename PY | Custom term for PY, also in the ΔPY heads. Empty = PY. | Text · Default empty (PY) |
| Rename PL | Custom term for PL, also in the ΔPL heads. Empty = PL. | Text · Default empty (PL) |
| Rename FC | Custom term for FC. Empty = FC. | Text · Default empty (FC) |

### Style

#### Colors & appearance

| Setting | Description | Options / Default |
| --- | --- | --- |
| Appearance | Dark mode: Auto detects dark report themes from the background colour (luminance below 0.35) and switches ink, axes and surfaces to light tones; pages painted dark by hand need “Dark”. In a light report Auto renders identically to Light. | Options: Auto (follow the report theme) \| Light \| Dark · Default “Auto (follow the report theme)” |
| Variance color preset | Blue / orange is the ColorBrewer pair #2C7BB6 / #E66101 (dark #5BA3DC / #F0821E) — distinguishable even with complete color blindness and in black-and-white print. Auto keeps the variance colors below. The two color pickers still override. | Options: Like variance colors (teal / IBCS) \| Teal / red (color-vision safe) \| IBCS green / red \| Blue / orange (ColorBrewer) · Default “Like variance colors (teal / IBCS)” |
| Variance colors | Teal replaces IBCS green to stay readable with red-green color-vision deficiency (documented deviation). Visible while the preset is “Like variance colors”. | Options: Teal deviation (color-vision safe) \| IBCS classic green · Default “Teal deviation” |
| Favorable Δ color (override) | Empty = color of the variance mode. | Color · Default empty |
| Unfavorable Δ color (override) | Empty = color of the variance mode. | Color · Default empty |
| Accent color (controls) | Active toolbar buttons, back button and breadcrumb hover — never data marks or axes. | Color · Default #404040 |
| Page background | Ground of the statement, the tree and the tile view (dark in dark mode). | Color · Default #FFFFFF |
| Card background | Fill of tree cards, tiles and the hover panel (dark in dark mode). | Color · Default #FFFFFF |

#### Type & rows

| Setting | Description | Options / Default |
| --- | --- | --- |
| Font size preset | Scales every label at once: HD ×1 · Full HD ×1.25 · UHD ×1.6. Since 1.4 also via the HD · Full HD · UHD bar at the bottom of the start hub; since 1.4.1 the entries in the format pane are named just HD, Full HD and UHD too (saved values `hd` · `fullhd` · `uhd` unchanged). | Options: HD \| Full HD \| UHD · Default “HD” |
| Font fine scaling (%) | On top of the size preset (100 = preset unchanged). The product of preset and fine scaling is capped at 2.2. | 80–160 · Default 100 |
| Header font size (px) | 0 = automatic (built-in sizes), otherwise 7–20 px; also acts on the mega table heads. | 0–20 · Default 0 |
| Header font color (override) | Empty = the built-in soft gray. | Color · Default empty |
| Default density | Row height when the report opens; readers switch it in the toolbar. | Options: Normal \| Compact · Default “Normal” |

#### Behavior

| Setting | Description | Options / Default |
| --- | --- | --- |
| Freeze the header while scrolling | Title, toolbar, legend and the column headers stay on top while the rows scroll. | On / Off · Default On |
| Selection & context menu active | Click sets the page selection (cross-filtering, drillthrough), right click opens the native menu. Off = a pure display without click handlers. | On / Off · Default On |

> In Windows high-contrast mode the mega table ignores every color setting and tells the scenarios apart by pattern instead of color; the classic views keep their palette.

### Title block

The three-line IBCS title (reporting unit · measure + unit · period + scenarios) with message, headline and footers. Every field except the main switch is visible only while the title block is on.

| Setting | Description | Options / Default |
| --- | --- | --- |
| Show title block | IBCS title: reporting unit · measure + unit · period + scenarios. | On / Off · Default On |
| Line 1 · reporting unit | Who reports — company, segment, consolidation scope. | Text · Default empty |
| Line 2 · measure + unit | Empty = “Income statement (P&L) in <unit>” from the data. | Text · Default empty (automatic) |
| Line 3 · period + scenarios | Empty = period and scenarios from the data (with the “_month” status marker of the last actual month). | Text · Default empty (automatic) |
| Message headline (interpretation) | The finding in one sentence, bold above the title (IBCS SAY). | Text · Default empty |
| Auto message | Builds the message headline from the variance of the result row and the strongest / weakest driver when no own message is entered. Since 1.5 a full sentence, e.g. “EBIT is 691 k EUR (−29 %) below previous year; strongest driver is Licences with +120 k EUR higher income, largest drag is Logistics with +813 k EUR higher costs.” The unit comes from the second title line (“… in m EUR”), otherwise from scaling and unit; if the minuend is not AC, the scenario appears in the sentence. | On / Off · Default Off |
| Headline slot (large message) | Shows the message as a large headline next to the title (IBCS 12-series layout); without an own message the generated auto message. 12G and 12H switch it on. | On / Off · Default Off |
| Footer (data status · source) | Footer line under the statement — e.g. data status and source; printed in exports too. | Text · Default empty |
| Show filter footer | Second footer line with the filter context: the bound “Filter info” text measure (report filters are not visible to custom visuals) plus the visual's own state — hidden zero rows, reader scenario view. | On / Off · Default Off |

### Hierarchy

| Setting | Description | Options / Default |
| --- | --- | --- |
| Default expand level | How deep the statement opens. 0 = expand everything. | 0–8 · Default 2 |
| Indent per level (px) | Indentation of the row labels per hierarchy level. | 6–32 · Default 16 |

### Empty state

What the visual shows when there is nothing to display. Start hub, demo and field guide appear in edit mode only; readers, PDF export and subscriptions see the calm landing card (since 1.4.1) or the own message, never demo numbers.

| Setting | Description | Options / Default |
| --- | --- | --- |
| While fields are missing (edit mode) | Start hub = big buttons for get started, feature tour, template gallery, demo and field guide, with HD · Full HD · UHD and the docs at the bottom (chapter 03; default since 1.3) · Demo = example statement (Smart Start) · Field guide = which field goes where, minimal and extended, with ✓ for bound roles · Own message = the title and text below. Also switchable by button right in the empty state (“Explain fields” / “Show demo”). | Options: Start hub (tour, templates, demo, fields) \| Demo statement (Smart Start) \| Field guide (which field goes where) \| Own message (title / text below) · Default “Start hub (tour, templates, demo, fields)” |
| Custom title | Replaces the heading when nothing is displayed (no fields bound in reading view, or the selection returns no rows). Empty = standard text. | Text · Default empty |
| Custom text | Body text below the title in the empty state — e.g. which filters the reader should check. Empty = standard text. | Text · Default empty |

> Two properties do not appear in the format pane: `columns.templateApplied` (the last applied template, echo guard) and `state.uiState` (the reader state of the toolbar as JSON, bookmarkable). Property names, types and the schema for PBIR authoring are in the [AGENT-GUIDE](https://github.com/Losveratos/PowerBI-Kitchen-/blob/main/pnlByDatenWG/AGENT-GUIDE.md).

## 09 · Interaction

### Toolbar

The toolbar above the statement shows, per view, only the groups that do something there. Below it sits the scenario legend with the chips AC · PY · PL · FC, favorable and unfavorable Δ and the note on how the Δ axes encode the reference. Above the mega table a right-aligned scale note appears as soon as anything deviates from the one scale (factor ×n or fixed scale). With “Control bars collapsible” the toolbar, legend and hint lines fold behind a small ☰ button.

| Group | When visible | What it switches |
| --- | --- | --- |
| ☰ Start | edit mode, always the first element | Opens the start hub as an overlay: get started, tour, templates, demo, fields, docs (chapter 03). |
| Template | edit mode, table view | Dropdown of all IBCS templates; writes template and switches in one save. |
| ↺ Back to template | edit mode, table view, once a template switch deviates | Restores every switch and the decimals of the selected template. |
| View | always, except in the tile view | Table · Bars · Waterfall · Tree. |
| Column preset | classic table | The six presets as quick picks. |
| Value columns | classic table or mega table, with “Group: value columns” | Classic: AC · PY · PL · FC · ΔRef as separate buttons. Mega table: analysed scenario · PY · PL. |
| Δ reference | classic views, tree, tile | PY · PL · FC — only bound scenarios get a button. |
| Periods | classic views, from two blocks | MTD · YTD · FY. No MTD in bars, FY only with both FY fields. |
| Unit | always | kEUR · mEUR (bEUR only from 50 billion or when the format pane picks b). |
| Density | except the tile view | Normal · Compact. |
| Cards | tree | Months · Δ · Bridge as the card chart, plus Status (colored card edge). |
| Expand to level | table views and tree | 1 · 2 · … · All; in the tree also ⌂ (back to the top root, whole tree open). |
| Scenario · Reference view | mega table, with “Group: scenario” | Scenario AC · FC (only with the FC field), reference view ΔPY · ΔPL · both. |
| Options | classic views or mega table | Classic: % of revenue (table only), hide zero rows, fit. Mega table: hide zero rows. |
| ☰ Control bars | with “Control bars collapsible” (since 1.5) | Folds the toolbar, legend and hint lines in and out; unfolded, ☰ leads the toolbar. |

### Value column and scenario group

- **Classic table:** a click on a value-column button turns the current column set into the *Own selection* and flips exactly that switch — e.g. to get AC + PL + FC. The presets stay quick picks and set the buttons again; from “AC·PY·ΔPY” and “AC·PL·ΔPL” the reference is kept. The MTD and FY blocks follow the same switches.
- **Mega table:** the same group switches analysed scenario, PY and PL as a reader layer on top of the format-pane switches. The last column is locked so the mega table never falls back to the classic table by a click. When the author changes the value columns in the format pane, the reader's choice ends.
- **Scenario group:** readers switch the analysed scenario AC / FC and the reference view ΔPY · ΔPL · both. The filter footer names the chosen view.

### Locked buttons

A button that would change nothing in the current state is **locked**: dimmed, without hover, with a tooltip that says where it acts — a click saves nothing. Whether a button acts is checked against the columns actually produced. Typical cases: the Δ reference under the preset “AC·PY·PL·FC” (which shows its references fixed), the FY block outside the presets that carry it, “% of revenue” while the YTD block is hidden, the last visible period block, the last value column or Δ without a reference field, and in the mega table a scenario choice its columns do not use. The period buttons show what is on screen — a forced YTD block reads as “on”.

### Selection, cross-filter & drillthrough

- **Left click** on a value or chart column of a row (table, mega table, bars, waterfall) or on the head of the tile sets the Power BI selection of that row — with all source rows of the account (e.g. every month). Subtotals select the leaves below them, formula rows the leaves of their operands. A second click or a click on empty space clears the selection.
- **Cross-filter:** the selection filters the rest of the report page; the page's drillthrough buttons become live with exactly this context. The visual itself does not support highlighting — cross-interaction from outside filters it.
- **Right click** on a row, tree card, micro card or the big tile opens the native context menu with the page's drillthrough targets; in the tile view “↗ Drill” does selection and menu in one go.
- The marking sits only on the chosen element (pale accent wash and a 2 px underline); other rows are not dimmed. At most 2,000 source rows are selected per node; where the cap applies, the tooltip says so.
- A row's name folds, the chevron folds, a click on a tree card opens the tile — selection runs through the value and chart columns. Switch it off under Style → *Selection & context menu active*; exports and subscriptions have no interaction.

1. **Target page:** create a new page (e.g. “Account detail”) and drag exactly the column bound as *Account ID (key)* into *Visualizations → Drill through* — without an account ID, the first level column (L1).
2. **Button:** on the source page *Insert → Buttons → Blank*, then *Action → On*, *Type = Drill through*, *Destination = Account detail*.
3. **Use it:** click a value column in the visual — the button becomes active. Alternatively right-click, or “↗ Drill” in the tile view.

### Bookmarks

All toolbar states are saved in the report and bookmarkable: view, column preset and value columns, Δ reference, unit, density, options, period blocks, collapsed rows and open sparklines, root, folding, card chart, status and zoom of the tree, and the reader view of the mega table. A bookmark with a foreign state acts immediately. A default changed in the format pane wins only for the changed setting; the reader's other choices stay. A bookmark with a selection restores the filter through Power BI; the marking inside the visual is not redrawn, and a bookmark without a selection removes it.

### Tooltips

In table, mega table, bars and waterfall, rows, cells, bars, pins and cascades show a tooltip with the row name, the bound scenarios of the block (with unit), the variance per reference in absolute and percent (margins in %p), the materiality note, the comment and, where it applies, the selection cap. In light mode it is the native Power BI tooltip, in dark mode a dark box of its own. The value driver tree uses its hover detail view and SVG titles.

### Keyboard

Toolbar buttons and the expand/collapse controls of the rows are reachable with `Tab`; `Enter` or `Space` triggers them or folds and unfolds. The focus shows as a ring — on re-drawn rows of long mega tables too. In the start hub the digits 1–4 open the four tiles, ‹ › and the arrow keys page the tour, Esc goes back one level or closes the overlay.

## 10 · Known deviations from the IBCS sheets

The visual rebuilds the reference sheets as closely as possible but deliberately does not reproduce their inconsistencies and misprints. Four deviations are documented (in full in [SPEC-MEGATABLE.md](https://github.com/Losveratos/PowerBI-Kitchen-/blob/main/pnlByDatenWG/SPEC-MEGATABLE.md), section “Bewusst offen / Abweichungen”):

1. **T01A/B — decimal in the YTD block:** the original's YTD ΔPY column prints one decimal (+431.0) while the other columns are integers. That is an inconsistency of the reference; the visual has one decimal rule per table and prints uniformly (+431).
2. **T02F — early capping:** the original caps Δ% pins already at a jump of 1.35×. The visual's Tukey automatic (Q3 + 4 × IQR) does not cap there — any rule that would hit T02F would wrongly cap in T02A.
3. **T03A — misprints of the sheets:** the original prints the ΔPL value (+162.5) by mistake in ΔPY of the group result; the visual calculates correctly (+186.2). The same goes for the financial-income pin in T04C/E (the visual draws −9.59 with the correct sign) and the operating result in 12H.
4. **12A — arrowheads:** multiple arrowheads on capped values (+983 →→→) are a single arrowhead in the visual; the value stands at the element as a number anyway.

Independently of these, the teal coloring is a deliberate, documented deviation (chapter 01).

## 11 · Troubleshooting

### Buttons seem “dead”.

Since 1.0.1 buttons without effect are dimmed and the tooltip says why — for example the Δ reference under the full preset. A template only acts in the *Table* view.

### The ΔPL columns stay empty.

The PL role is not bound — the format pane then hides the ΔPL switches. An FC minuend needs the FC role, PL as minuend the PL role.

### The thresholds do not color anything.

Thresholds apply in **display units**, i.e. after k/m scaling. The defaults −20 / −220 mean thousands and since 1.5.1 are converted at m and b scaling (−0.02 / −0.22 m); a value you set applies as typed, so −20 then means −20 million. They also need a Δ number column.

### The column head says “ΔPY ×5”.

A scaling indicator following IBCS 2.0 / ISO 24896: in 12A, 12G and 12H the Δ bars are drawn on the scale of the value cascades; if they would be too small there, the visual magnifies them by a round factor and names it in the head and in the scale note above the table. The same applies in the bars and waterfall views. To scale several tabs alike, set both scale minimum-maximums (chapter 08).

### Since 1.5 the month bars look much shorter.

Intended: month, YTD and FY share one scale per unit; up to 1.4 every block had its own, without a note. Small monthly variances are now as short as they are relative to YTD.

### Toolbar and legend take too much space in a small tile.

Switch on Display & toolbar → Control bars collapsible (☰) (since 1.5). Folded, one slim row remains; readers unfold with ☰.

### Picked the same template again — nothing happens.

A native dropdown cannot report the entry that is already selected. Since 1.3 a click on the active tile in the template gallery (start hub or ☰ Start) applies the template again; if switches deviate, “↺ Back to template” next to the dropdown restores the template state.

### A start hub appears instead of the demo statement.

The default for authors since 1.3 (chapter 03); the demo statement sits behind “Show demo”. To see it directly, set Empty state → *While fields are missing* to “Demo statement (Smart Start)”. Readers and exports never see the hub.

### Do readers see “☰ Start” or “↺ Back to template”?

No. ☰ Start, the template picker and ↺ appear in edit mode only; readers, export and subscriptions never see them.

### The template dropdown is missing from the toolbar.

It appears only in edit mode and in the *Table* view. Check the switch Display & toolbar → *Template picker in edit mode*.

### Column category bound, but no blocks.

The mega table ignores the column category (note below the table in edit mode). It acts in the classic table, i.e. with template “Off”.

### Export/PDF looks different from the screen.

Intended: the export prints without the toolbar and fully expanded (switch *Export: expand all rows*), without virtualization and without the author note “Scale fixed” below the table; in the mega table the scale note names a fixed scale.

### All values are empty.

The grouping fields are set to “Summarize” instead of “Don't summarize”.

### The FY columns are many times too large.

The FY measure is defined as `SUM` instead of `MAX` (or `AVERAGE`); the full-year value repeats on every month row.

### The months are in the wrong order.

The period label is not readable or it is a fiscal year — set Columns & mega table → Table → *Period sort order* to “Data order (fiscal year)”.

### A row shows “·” or “⚠ cycle”.

“·”: the reference name in the formula is not unique, or the scenario has no data. “⚠ cycle”: a circular reference in the formula definition or in parent-child.

### “Not assigned” appears red with ⚠.

A parent or level path points nowhere. This is an intended data-quality signal: the visual never swallows accounts.

### Costs show as favorable although they are above plan.

The cost row carries sign convention `-1` *and* variance invert = `true` — the two mechanisms cancel each other out. With `-1`, do not flip the variance color as well (chapter 05).

## 12 · Version note 1.5.3.0

This documentation describes **version 1.5.3.0** of 23 October 2026 (GUID `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358`). The visual is not listed in Microsoft AppSource and therefore not certified by Microsoft. Field roles, property names and the saved toolbar state are stable since 1.0; every new setting is off by default or behaves as before. Changed defaults since 1.2: in edit mode without fields the start hub appears instead of the demo statement (1.3); since 1.5 scaling following IBCS 2.0 / ISO 24896 is the default, so existing reports change their picture.

- **1.5.3.0 · column header on a scaled stage:** in a Fabric App (stage scaled with a CSS transform) the sticky column header sat too low by the stage factor and covered rows; the visual now measures in layout pixels. In low tiles the footnotes only stick while rows stay visible; the IBCS notation line spans all footnote columns. Nothing changes in Power BI.
- **1.5.2.0 · cosmetic remaining points:** the IBCS notation line stays inside the tile with a comment block; trademark note “IBCS Institute”; 12G headline “(forecast)”; 12G YTD numbers before the bar when they do not fit inside; tooltip “pp”; blocks and one-child groups sorted in the same direction as the rows (T02E/T02F); Δ waterfall connectors interrupted at numbers; a Δ that rounds to zero keeps its sign (“+0.00”).
- **1.5.1.0 — remaining points of the scale measurement:** no factor between period blocks any more, scaling indicator ×n only for Δ against the value cascade (one factor per table); headline with the driver's Δ including its effect in words (“higher costs”) and the unit “m EUR”; margin rows without Δ %, Δ in pp with the Δ% decimals; threshold defaults converted at m scaling; spacer row after every element of the top level, single-child groups without a repeated subtotal; comment footnotes in several columns and always visible; Δ bars with minuend PL outlined in red / green; readable YTD numbers in 12G; true minus sign “−”.
- **1.5.0.0 — scaling following IBCS 2.0 / ISO 24896 as the default:** one Δ scale across all period blocks, Δ on the scale of the value cascades, outlier zone with break mark and triangle, scale note above the table; the same rule in the bars, waterfall and tree views (hover magnifier marked as its own scale); auto headline as a full sentence; Δ % with one decimal in every template; collapsible control bars (☰, default off); the footnote names IBCS 2.0 (ISO 24896).
- **1.4.2.0 — fix:** P&L order in level mode with a sort column; generated intermediate levels inherit the smallest sort of their children, formula rows are back in place.
- **1.4.1.0 — family hub:** one look with the sister visual ChartKitchen — bottom bar with HD · Full HD · UHD and “📖 Open docs”, “← Back” as a pill, get started in teal across the full width, gallery groups as an eyebrow; preset names HD · Full HD · UHD in the format pane too; calm landing card for readers and exports without data.
- **1.4.0.0 — hub polish for controllers:** template gallery by purpose (four groups, finance titles, benefit line), “🚀 Get started” checklist, field guide with all 20 roles and two premises, font-size bar and docs button on every hub page, “← Back” everywhere, ☰ Start as the first toolbar element.
- **1.3.0.0 — start hub:** four buttons instead of the demo table (tour, templates, demo, fields), ☰ Start as an overlay above the P&L, re-apply a template, “↺ Back to template”.
- **1.2.0.0 — ease of use:** combine value columns freely (preset “Own selection”, toolbar group value columns, also in the mega table), template picker in the toolbar, template group first in the format pane, empty state with field guide, field list in the familiar order, bars view like ChartKitchen (overlapping, triangles), column category.
- **1.1.0.0:** 12G, 12H and the headline slot, scale sync, blue/orange, virtualization of long mega tables; finance craft from ChartKitchen (tooltips, sum-safe rounding, parentheses, billions, house terms, auto message, footers, highlight, materiality, reader scenario, empty state, keyboard); block kinds month · YTD · FY.
- **1.0.1.0:** toolbar buttons act in every view, locked buttons with tooltip, format-pane defaults win after a change, echo guard for the toolbar state.
- **1.0.0.0:** mega table (T01–T04, 12A), four languages, Smart Start, dark mode, format pane with visibility rules.
- **0.17.0.0:** selection, cross-filtering and the native context menu with drillthrough.

The complete version history is in the [CHANGELOG](https://github.com/Losveratos/PowerBI-Kitchen-/blob/main/pnlByDatenWG/CHANGELOG.md) (German).

**P&L Statement byDatenWG** · Version 1.5.3.0

Sister visual: [ChartKitchen byDatenWG – documentation](../chartkitchen-doku_en.html)

Contact: Michael Tenner · [michael.tenner84@gmail.com](mailto:michael.tenner84@gmail.com)

Quick start: [pnl-schnellstart_en.html](../pnl-schnellstart_en.html) · Download: [.pbiviz 1.5.3.0](https://raw.githubusercontent.com/Losveratos/PowerBI-Kitchen-/main/pnlByDatenWG/dist/pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358.1.5.3.0.pbiviz) · Source code and changelog: [pnlByDatenWG in the repository](https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/pnlByDatenWG) · For AI agents: [AGENT-GUIDE](https://github.com/Losveratos/PowerBI-Kitchen-/blob/main/pnlByDatenWG/AGENT-GUIDE.md)

> Notation follows the IBCS® Standards 2.0 (ISO 24896) of the IBCS Association (CC BY-SA 4.0, ibcs.com). Documented deviation: teal replaces the IBCS variance green to stay readable with red–green color-vision deficiency. IBCS® is a registered trademark of the IBCS Institute. This visual is not certified by the IBCS Association and is not affiliated with it.

---

## Other versions of this page

- HTML (authoritative): https://datenwgknowledgekitchen.com/pnl-doku_en.html
- German: [pnl-doku.html](../pnl-doku.html) · [pnl-doku.md](pnl-doku.md)
- Quick start: [pnl-schnellstart_en.html](../pnl-schnellstart_en.html)
- Reference for AI agents (data contract, all format properties): [pnlByDatenWG/AGENT-GUIDE.md](../pnlByDatenWG/AGENT-GUIDE.md)
