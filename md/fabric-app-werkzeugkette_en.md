---
title: Fabric App Toolchain
url: https://datenwgknowledgekitchen.com/fabric-app-werkzeugkette_en.html
lang: en
as_of: 2026-11-27
---

# Fabric App Toolchain

This is how Daten-WG builds its Fabric apps and Power BI reports: a sketch becomes a spec, the dwg cli turns the spec into a Fabric app, a Power BI report or both with the same visuals, and every delivery is checked before an audience sees it. The data comes from an existing source or is generated synthetically for a demo.

## Flow

1. **Prepare:** MockupKitchen (sketch the pages) and the data source (existing or demo).
2. **Building blocks:** app spec (JSON), the visuals ChartKitchen 1.58 and P&L Statement 1.8.4, the semantic model (existing or new, with fab and te).
3. **Generate:** the dwg cli reads spec, model and visuals and generates DAX queries, pages and tiles, and PBIR visuals. It tests without Fabric (mini-DAX) and checks with `dwg check`, `dwg lint` and the parity test.
4. **Deliver:** Fabric app via `rayfin up`, Power BI report via `fab import` and pbir. App, report or both.
5. **Check:** `pbir visuals test` (every query in the service), template test bench (reference, app, Power BI), fabscan (governance), Playwright (browser tests). Findings flow into the next releases of the visuals.

Above it all: Claude Code orchestrates. The agent plans, the CLI executes, the check verifies. Parallel sessions, review with Fable, a person approves releases.

## Why it works this way

- **One spec, one or two targets:** the same file produces only a Fabric app, only a Power BI report, or both. When both are built, they show the same numbers with the same visuals.
- **Same command, same result:** every step is a CLI call instead of clicks in the portal.
- **Notation as a guardrail:** ChartKitchen and P&L bring scenario notation, scaling and templates.
- **Checking is part of the chain:** parity, service queries, test bench and governance run before an audience sees anything.

## Tools

| Tool | Origin | Does | Benefit |
|---|---|---|---|
| MockupKitchen | ours | mockups for Power BI pages and Fabric apps in the browser | business team sees the result early; `dwg mockup import` turns it into a spec |
| Data source | existing or generated | existing lakehouse, warehouse or semantic model; synthetic Parquet data with Python for demos | same path for real data and demos |
| App spec (JSON) | ours, part of the dwg cli | pages, tiles, roles, filters, formats, navigation, template per tile | versioned in Git, `dwg check` validates against the model |
| ChartKitchen byDatenWG 1.58.0.0 | ours | custom visual, 14 chart modes, 24 templates (C01 to C25), scenario notation and scaling | one visual for Power BI and Fabric app |
| P&L Statement byDatenWG 1.8.4.0 | ours | income statements and financial tables, 23 templates, ROI tree, Sankey, balance sheet, cash flow | pick a template instead of formatting |
| fab (Fabric CLI) | Microsoft | workspaces, lakehouse upload, `table load`, import, refresh, rebind | scriptable instead of portal clicks |
| te (Tabular Editor CLI) | Tabular Editor, preview | load semantic models as TMDL, validate, change by script | model changes as text, validated before deployment |
| dwg cli | ours, public, early preview | builds the Fabric app, the PBIP report or both from spec and model | same spec, same result |
| Parity test | ours, in the dwg cli | renders every tile the Power BI way and the app way, fails on differences; only when both targets come from the same spec on the same semantic model | differences show up while building |
| Rayfin CLI (Fabric apps) | Microsoft, preview | creates and deploys the Fabric app item, connectors, hosting, Entra sign-in | the scriptable route to a Fabric app |
| pbir CLI | used | checks and changes PBIR reports, `rebind`, tests every visual query in the service (showcase 282 of 282, as of 25 Nov 2026) | the CLI finds errors, not the audience |
| Git and GitHub | used | spec, PBIP and visual code in Git, tests via GitHub Actions | releases with pull request and green tests |
| Template test bench | ours | checks each template against the reference, app and Power BI side by side, measurements | wave plan from findings |
| fabscan | ours, CLI and skill | governance check for Fabric apps: calculations in the app, lineage, security, modified queries | findings with stable IDs, exceptions with reasons |
| Playwright | Microsoft | browser tests and screenshots | actual rendering proven |
| Claude Code and Fable | Anthropic | parallel sessions, skills for dwg, fabscan and mockups, independent review | a person approves push, merge and deployment |

ChartKitchen and P&L Statement are inspired by IBCS. They are not certified, and there is no affiliation with the IBCS Association. The data in the examples mentioned is synthetic.

---

## Read on

- HTML (authoritative): https://datenwgknowledgekitchen.com/fabric-app-werkzeugkette_en.html
- German version: [fabric-app-werkzeugkette.html](../fabric-app-werkzeugkette.html) · [fabric-app-werkzeugkette.md](fabric-app-werkzeugkette.md)
- dwg cli: https://github.com/Losveratos/dwg-cli
- ChartKitchen docs: [chartkitchen-doku_en.md](chartkitchen-doku_en.md) · P&L docs: [pnl-doku_en.md](pnl-doku_en.md)
