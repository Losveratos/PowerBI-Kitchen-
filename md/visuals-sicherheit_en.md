# Security & Deployment of the byDatenWG Visuals

> Markdown version of [visuals-sicherheit_en.html](../visuals-sicherheit_en.html) · https://datenwgknowledgekitchen.com/visuals-sicherheit_en.html · generated with scripts/build_md.py — if the two differ, the HTML version prevails.

Power BI visuals · for admins, IT security, data protection

One page for everyone who has to approve a custom visual: what the visuals do, what they do not do, what is stored in the report, how release through the organizational store works, and where the limits are. Factual and verifiable — every statement can be traced to the source code or to Microsoft's documentation, and the checklist in section 07 walks you through the audit.

As of 23 Oct 2026 · privileges: [] in all three visuals · Source code open · not certified by Microsoft

## 00 · Summary

> - **No network access:** `capabilities.json` of all three visuals contains `"privileges": []` — no web-access, download or local-storage permission. The source code has 0 hits for `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `eval(`, `new Function`, `localStorage`, `sessionStorage`, `document.cookie`, `indexedDB`.
> - **No telemetry, no external fonts or scripts:** `externalJS` is empty, the stylesheet contains no `url()` and no `@import`.
> - **Only presentation is stored:** format settings and view state via `persistProperties` in the report file, plus texts entered by the author (titles, comments).
> - **One exception when opening links:** ChartKitchen and P&L have an “Open docs” button (`host.launchUrl`); on click it opens our documentation in a new tab. No data is appended.
> - **Not certified:** As of today the visuals are not listed on AppSource and not certified. Consequence according to Microsoft: export to PDF and PowerPoint and subscription emails do not show uncertified visuals (section 04).

## 01 · What the visuals are

Three Power BI custom visuals by Michael Tenner (Daten-WG), developed together in one public repository. They are *IBCS-inspired* (notation following the IBCS principles) and **not IBCS-certified**; IBCS® is a registered trademark of the IBCS Association.

### ChartKitchen byDatenWG

- **Version:** `1.53.0.0`
- **API:** `5.11.0`
- **GUID:** `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D`
- **License:** Apache-2.0 (`LICENSE` + `NOTICE`)
- **Folder:** [ibcsInspiredChartDeck/](https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/ibcsInspiredChartDeck)

### P&L Statement byDatenWG

- **Version:** `1.5.3.0`
- **API:** `5.11.0`
- **GUID:** `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358`
- **License:** MIT (`LICENSE` in the repository root)
- **Folder:** [pnlByDatenWG/](https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/pnlByDatenWG)

### dataKitchenGantt

- **Version:** `1.15.0.0`
- **API:** `5.3.0`
- **GUID:** `dataKitchenGanttD7C41F0A93E24B6BA1F3C5E8A20D9B44`
- **License:** MIT (`LICENSE` in the repository root)
- **Folder:** [dataKitchenGantt/](https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/dataKitchenGantt)

Source of these details: `pbiviz.json` (version, API, GUID) in the respective folder of the repository [Losveratos/PowerBI-Kitchen-](https://github.com/Losveratos/PowerBI-Kitchen-). The `pbiviz.json` of the file you are auditing is authoritative — later releases carry a higher version but keep the GUID. For the license, the `LICENSE` file in the respective scope applies: ChartKitchen ships its own Apache-2.0 license; the names and logo “ChartKitchen”, “byDatenWG”, “Daten-WG” are excluded from it (`NOTICE`).

## 02 · Data flow & network

The visuals receive their data solely through the Power BI host interface (`update()` with the DataView) and draw it into their own container. The code contains no way to send data out. Microsoft states that custom visual code runs in a sandbox; judging whether a visual is trustworthy is, according to the white paper, the customer's responsibility ([Power BI security white paper](https://learn.microsoft.com/power-bi/guidance/white-paper-powerbi-security)). Hence the evidence below, so you can check it yourself.

### Permissions (capabilities.json)

| Property | ChartKitchen | P&L Statement | dataKitchenGantt |
| --- | --- | --- | --- |
| `privileges` | [] | [] | [] |
| `externalJS` (pbiviz.json) | null | null | null |
| `dependencies` (pbiviz.json) | null | null | null |

An empty `privileges` array means: no `WebAccess` (no allowed URLs), no `ExportContent` (no file download from the visual), no `LocalStorage`. Since API 4.6.0 privileges must be declared explicitly ([Microsoft: Capabilities](https://learn.microsoft.com/power-bi/developer/visuals/capabilities#privileges-define-the-special-permissions-that-your-visual-requires)); all three visuals use API 5.x.

### Hit counts in the source code (`src/`)

| Search pattern | ChartKitchen | P&L Statement | dataKitchenGantt |
| --- | --- | --- | --- |
| fetch( | 0 | 0 | 0 |
| XMLHttpRequest | 0 | 0 | 0 |
| WebSocket | 0 | 0 | 0 |
| navigator.sendBeacon | 0 | 0 | 0 |
| <script src | 0 | 0 | 0 |
| eval( | 0 | 0 | 0 |
| new Function | 0 | 0 | 0 |
| innerHTML | 0 | 0 | 1 * |
| localStorage | 0 | 0 | 0 |
| sessionStorage | 0 | 0 | 0 |
| document.cookie | 0 | 0 | 0 |
| indexedDB | 0 | 0 | 0 |
| Source files in `src/` | 2 | 8 | 3 |

* The single hit in dataKitchenGantt is a comment (`gantt.ts`, line 20: “Rendering per DOM node (textContent, no innerHTML)” — in German in the source), not a call. Further patterns with no hits in all three source trees: `importScripts`, `window.open`, `postMessage`, `createObjectURL`, `new Worker`, `iframe`, `DOMParser`, `document.write`, `insertAdjacentHTML`, `outerHTML`, `navigator.`, `FontFace`. The same twelve patterns (for `<script` without the “src” attribute) also give 0 hits in the **built package** (`.pbiviz`, state of the three files in the repository on 23 Oct 2026); the only URLs in the bundle are the SVG namespace `http://www.w3.org/2000/svg`, the documentation addresses of our website (ChartKitchen, P&L) and the support links in the metadata.

### The one exception: “Open docs”

ChartKitchen (`visual.ts`, start hub) and P&L Statement (`visual.ts`/`hub.ts`, edit mode only) call `host.launchUrl(…)` when you click “Open docs”. The address is a fixed constant (`datenwgknowledgekitchen.com/chartkitchen-doku.html` or `pnl-doku.html`, with `_en` depending on the locale); no data is appended. Power BI opens the page in a new browser tab — the visual itself sends nothing. `launchUrl` needs no entry in `privileges` ([Microsoft: Launch URL](https://learn.microsoft.com/power-bi/developer/visuals/launch-url)). dataKitchenGantt has no such button.

### Fonts, telemetry, third-party code

- **Fonts:** The bundled stylesheet contains no `@font-face`, no `url()` and no `@import`; the visuals use system fonts or the report's font. No web fonts are loaded.
- **Telemetry:** There is no code path that transmits usage or error data (see hit counts: no network API). No account, no license server, no tracking.
- **Third-party code in the package:** only the Microsoft helper packages `powerbi-visuals-api` and `powerbi-visuals-utils-formattingmodel` (ChartKitchen additionally `powerbi-visuals-utils-formattingutils`); no third-party charting or UI library (`dependencies` in the respective `package.json`).

> **Limits of this audit:** A search proves the absence of the listed patterns, not the absence of every conceivable workaround (for example dynamically assembled function names). The robust statement therefore combines the empty `privileges` (enforced by the host), the source review and your own network observation (section 07, step 6). The visuals have not been audited by Microsoft.

## 03 · What is stored

Everything the visuals retain goes through the host interface `persistProperties` into the report file (.pbix / PBIR) — the same place where the report's other format settings live. Outside the report file the visuals store nothing (no browser storage, no cookies, no server).

| Visual | Persisted objects (`capabilities.json`) | Content |
| --- | --- | --- |
| ChartKitchen | `ibcsTitle`, `chart`, `colors`, `labels`, `emptyState`, `commentsPanel`, `scale`, `categoryAxis` | Formatting and view state (sort order, expanded rows, column widths, last applied template); texts entered by the author: title lines, scenario labels, empty-state text and **comments** (`commentsPanel.userComments`, JSON). |
| P&L Statement | `toolbar`, `columns`, `numbers`, `style`, `titleBlock`, `labels`, `emptyState`, `hierarchy`, `state` | Formatting; view state as JSON (`state.uiState`, e.g. collapsed rows, value-driver-tree root); title block and empty-state text from the author. |
| dataKitchenGantt | `darstellung`, `spalten`, `meilensteine`, `basisplan`, `schrift`, `dataPoint` | Formatting, colors, table width (dragged via the splitter). |

> **Note for data protection:** No measure values or data rows are persisted. The view state can, however, contain *labels* from your data — for example the keys of expanded or hidden rows, or the category a comment is attached to. Comments and titles are free text by the report author; do not enter anything there that does not belong in the report file. The statement about the kind of properties follows from the declared types in `capabilities.json` (text, number, boolean); we did not evaluate every single write site in the code.

**Bookmarks:** ChartKitchen and P&L Statement register a selection callback (`registerOnSelectCallback`) and adopt a selection restored by the host when a bookmark is applied. dataKitchenGantt has no bookmark-specific logic — selection and formatting behave like the host's standard mechanisms (not tested separately).

## 04 · Release & deployment

The statements about Power BI below come from Microsoft's documentation (retrieved 23 Oct 2026; links below).

### Three ways into reporting

| Route | How it works | What applies |
| --- | --- | --- |
| Import per report | Visualizations → “…” → *Import a visual from a file* (`.pbiviz`). The visual is then stored in the report file. | In the service the tenant setting *Allow visuals created using the Power BI SDK* applies (disabled by default according to Microsoft) and, if set, *Add and use certified visuals only*. In Desktop, group policies control this (`EnableCustomVisuals`, `EnableUncertifiedVisuals`). |
| Organizational visual | Admin portal → *Organizational visuals* → *Add visual* → *From a file*; set name, icon, description, access. Optionally *Enable for Visualization Pane* so the visual is offered to all authors directly; otherwise authors find it under *Get more visuals → My organization*. | **Not affected** by the two tenant settings above: organizational visuals work even if file import and uncertified visuals are blocked. Central versioning, enable/disable, delete. Microsoft's own warning: an uploaded file can contain code with security risks — verify the source (section 07). |
| AppSource (certified) | Import the visual from the marketplace or use *Add visual → From AppSource* to put it in the org store. | **Not yet available for our visuals** (section 05). |

### Update path

- **Organizational visual:** select the visual → *Settings* → *Browse* → choose the new `.pbiviz` → *Update*. According to Microsoft, all reports using this visual then receive the new version automatically — there is one centrally controlled version that you can test beforehand.
- **Same GUID:** the GUID (section 01) is the identity of the visual; we do not change it between releases. Before replacing, check that the GUID of the new file matches the existing one (checklist, step 5). Microsoft's update page names no explicit GUID rule.
- **Import per report:** the file has to be imported again per report; older reports keep their embedded version until then.
- **Disable/delete:** when disabled, the visual no longer renders in existing reports (“This custom visual is no longer available”); deletion is irreversible. Power BI Report Server does not support organizational visuals.

### Export to PDF, PowerPoint and subscription emails

> **Rendering events are implemented — but that alone does not enable export.** All three visuals call `renderingStarted` at the start of `update()` and finish with `renderingFinished` or `renderingFailed` (`visual.ts`). That is the technical prerequisite for export and for certification. Microsoft documents, however, that custom visuals are supported in *Export to PDF*, *Export to PowerPoint* and subscription emails **only if they are certified**; organizational visuals (from a file) explicitly are not. For uncertified visuals the export option is greyed out or missing; in subscription emails an error symbol appears. Until certification, plan without PDF/PPT export and without these visuals in subscription emails — native visuals or a screenshot are an option for export pages.

Microsoft sources: [Manage Power BI visuals admin settings](https://learn.microsoft.com/fabric/admin/organizational-visuals) · [Power BI organizational visuals](https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-organization) · [Certified Power BI visuals](https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified) · [Export to PDF](https://learn.microsoft.com/power-bi/collaborate-share/end-user-pdf) · [Export to PowerPoint](https://learn.microsoft.com/power-bi/collaborate-share/end-user-powerpoint) · [Rendering events](https://learn.microsoft.com/power-bi/developer/visuals/event-service) · [Import a visual](https://learn.microsoft.com/power-bi/developer/visuals/import-visual)

## 05 · Certification status

- **Today:** None of the three visuals is listed on Microsoft AppSource or certified by Microsoft.
- **ChartKitchen:** technically prepared for AppSource submission — the folder [cert-export/](https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/cert-export) holds the buildable source state, listing texts, privacy text and a submission checklist. The submission is **in preparation** and has not happened yet; no date or outcome can be promised. Certification is optional and decided by Microsoft.
- **P&L Statement and dataKitchenGantt:** there is no submission package for these two visuals.
- **What “prepared” does not mean:** The properties evidenced above (empty `privileges`, no `fetch`/`XMLHttpRequest`/`eval`, rendering events) correspond to requirements on Microsoft's certification list. Whether a visual meets all points is decided by Microsoft in its review — we do not claim that.

## 06 · Accessibility (brief)

| Feature | ChartKitchen | P&L Statement | dataKitchenGantt |
| --- | --- | --- | --- |
| `supportsKeyboardFocus` | true | true | not set |
| `supportsHighlight` | false | false | not set |
| High contrast (`colorPalette.isHighContrast` in code) | yes | yes | no |
| Keyboard handlers in code (`keydown`/`tabindex`) | yes | yes | no |

ChartKitchen and P&L Statement evaluate the host's high-contrast palette; there, patterns instead of colors carry the message (scenario notation AC/PY/PL/FC). Controls in the start hub are reachable by Tab. `supportsHighlight: false` means: emphasis from other visuals does not use the highlight interface (cross-filtering by selection is independent of it). dataKitchenGantt has **no** high-contrast handling and no keyboard control — it is currently not suitable for reports with accessibility requirements. No formal accessibility audit (for example with a screen reader) exists for any of the visuals.

## 07 · Audit checklist for admins

Seven steps you can run without us. Example: ChartKitchen; for the other visuals swap file name and GUID. The commands are PowerShell (Windows); on macOS/Linux, `unzip` and `grep` work accordingly.

1. **Secure the file and record its hash.** Download the `.pbiviz` (ChartKitchen: `downloads/chartkitchen-byDatenWG-latest.pbiviz` on this website) and note the SHA-256 in your approval record. Recompute after every update.

```
Get-FileHash .\chartkitchen-byDatenWG-latest.pbiviz -Algorithm SHA256
```

2. **Unpack the package.** A `.pbiviz` is a ZIP archive with `package.json` and `resources/<GUID>.pbiviz.json`.

```
Copy-Item .\chartkitchen-byDatenWG-latest.pbiviz .\ck.zip
Expand-Archive .\ck.zip -DestinationPath .\ck
```

3. **Read the permissions.** In the unpacked JSON file, `capabilities.privileges` and `externalJS` must both be empty; `apiVersion` and `visual.version` are in the same document.

```
$j = Get-Content .\ck\resources\*.pbiviz.json -Raw | ConvertFrom-Json
$j.capabilities.privileges   # empty output = empty
$j.externalJS                # empty output = empty
$j.apiVersion; $j.visual.version
```

4. **Search the code.** The first command must end without output. The second lists all URLs in the package (expected: SVG namespace, documentation and support links).

```
Select-String -Path .\ck\resources\*.pbiviz.json -Pattern 'fetch\(|XMLHttpRequest|WebSocket|sendBeacon|eval\(|new Function|\.innerHTML|localStorage|sessionStorage|document\.cookie|indexedDB' -AllMatches
Select-String -Path .\ck\resources\*.pbiviz.json -Pattern 'https?://[^"'' )\\]+' -AllMatches | % { $_.Matches.Value } | Sort-Object -Unique
```

5. **Compare the GUID.** The GUID in the file name of the JSON file, in the field `visual.guid` and in the repository's `pbiviz.json` (section 01) must match; when replacing a visual in the org store it must equal the one already installed.

6. **Observe at runtime.** Use the visual in a test report with test data, open the browser developer tools (F12 → Network) and work with the visual (filter, sort, add a comment). Expectation: no requests originating from the visual; only a click on “Open docs” opens a new tab to `datenwgknowledgekitchen.com`.

7. **Cross-check the source.** Get the source state from the repository (the commit that set the version in `pbiviz.json`), build it yourself, and compare source and bundle. An identical hash is not guaranteed (build metadata); a content comparison is possible.

```
git clone https://github.com/Losveratos/PowerBI-Kitchen-
cd PowerBI-Kitchen-\ibcsInspiredChartDeck
npm ci
npx pbiviz package
```

Then: upload it as an organizational visual in a test environment, test it with your organization's tenant settings and only then release it to the visualization pane (section 04).

## 08 · Contact & status

- **Contact:** Michael Tenner, Daten-WG · [michael.tenner84@gmail.com](mailto:michael.tenner84@gmail.com?subject=Security%20question%20byDatenWG%20visuals). Also for security findings and for questions from your data protection officer.
- **Bugs and requests:** issues in the [repository](https://github.com/Losveratos/PowerBI-Kitchen-/issues).
- **State of this page:** 23 Oct 2026 · ChartKitchen 1.53.0.0 · P&L Statement 1.5.3.0 · dataKitchenGantt 1.15.0.0. Newer releases carry higher version numbers; audit every file according to section 07.
- **Warranty:** The visuals are provided without warranty (license texts in the repository). This page is not a legal assurance but an audit aid.

**Security & deployment · byDatenWG visuals** · as of 23 Oct 2026

Documentation: [ChartKitchen](../chartkitchen-doku_en.html) · [P&L Statement](../pnl-doku_en.html) · Quick start: [ChartKitchen](../chartkitchen-schnellstart_en.html) · [P&L](../pnl-schnellstart_en.html)

Contact: Michael Tenner · [michael.tenner84@gmail.com](mailto:michael.tenner84@gmail.com)

> IBCS® is a registered trademark of the IBCS Association. The visuals are inspired by the IBCS principles and are not affiliated with the IBCS Association; they are not IBCS-certified.
