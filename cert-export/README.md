# ChartKitchen byDatenWG — Power BI Custom Visual

*inspired by IBCS*

IBCS-inspired chart deck for Power BI: columns/bars with scenario notation
(AC · PY · PL · FC), integrated variance bridges, category bridges, waterfall,
P&L statement mode, an IBCS table with multi-level hierarchy, frozen-header
scrolling and formula rows, KPI cards, small multiples, comments, and
localized UI (de-DE, en-US, es-ES, ja-JP).

This repository contains the complete, buildable source of the visual as
submitted to AppSource / Microsoft certification. It contains no external
services: the visual makes no network requests, embeds no external JS, and
collects no data.

## Build

Requirements: Node.js 18+ and npm.

```bash
npm ci
npx pbiviz package
```

The `.pbiviz` package is written to `dist/`. The build is deterministic from
`package-lock.json` (`npm ci`), `npm audit` reports 0 vulnerabilities.

## Verify

```bash
npx eslint src/          # eslint-plugin-powerbi-visuals, recommended profile
npm run test:render      # headless render suite (68 cases, needs Chromium/Playwright)
```

## Repository layout

| Path | Purpose |
| --- | --- |
| `src/visual.ts` | Visual implementation (rendering, interactions) |
| `src/settings.ts` | Formatting-pane model (formattingmodel utils) |
| `capabilities.json` | Data roles, objects, properties |
| `stringResources/` | Localized UI strings (de-DE, en-US, es-ES, ja-JP) |
| `assets/` | Visual icon (20×20 PNG) + SVG source |
| `test/` | Self-contained headless render harness |
| `demoData/` | CSV demo datasets for the bridge/P&L modes |

## Roadmap

See [BACKLOG.md](BACKLOG.md) for the curated idea backlog (accessibility,
table/matrix, cards, charts, localization). New requests welcome as issues.

## Certification notes

- API version: 5.11.0, tools: powerbi-visuals-tools 7.x
- No `eval`, `innerHTML`, `fetch`/XHR/WebSocket, storage or cookie access
- `externalJS: null` — all code is bundled from `src/`
- Privacy: the visual processes data only inside the Power BI sandbox and
  transmits nothing

## License

Licensed under the **Apache License, Version 2.0** — see [LICENSE](LICENSE) and
[NOTICE](NOTICE). The license covers the source code only; the name and logo
("ChartKitchen", "byDatenWG", the DWG logo) are trademarks of the Daten-WG team
and are not licensed — forks must use their own branding. "IBCS" is a
registered trademark of the IBCS Association; this project is not certified and
uses the term descriptively. Contributions: see
[CONTRIBUTING.md](CONTRIBUTING.md) (Developer Certificate of Origin,
`git commit -s`).
