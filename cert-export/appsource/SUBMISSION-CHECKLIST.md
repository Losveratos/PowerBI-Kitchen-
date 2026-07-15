# AppSource submission checklist — ChartKitchen byDatenWG

Free listing via Partner Center. Certification is optional and can be requested
later. Status legend: ✅ done here · 🟡 your action.

## 1. Package
- ✅ Valid `.pbiviz` (current: `dist/chartKitchenByDatenWG…pbiviz`, API 5.11.0)
- ✅ No external services (`externalJS: null`, no network/storage/eval)
- ✅ `npm audit` = 0, ESLint clean, deterministic build (`npm ci`)
- ✅ `supportUrl` + `gitHubUrl` set to the public repo
- ✅ Icon 20×20 in the package (`assets/icon.png`)

## 2. Listing assets (in this folder / scratchpad)
- ✅ Listing copy (EN): `listing-copy-en.md`
- ✅ Privacy policy text: `PRIVACY.md` — 🟡 host it at a public URL
      (raw GitHub file or GitHub Pages) and paste that URL in Partner Center
- ✅ 300×300 listing icon: `listing-icon-300.png`
- ✅ Listing screenshots: `screenshot-*.png` (1280×720)
- 🟡 Optional: a short demo GIF/video

## 3. Sample report (required by AppSource)
- 🟡 A `.pbix` with the visual on a page and demo data. You have the demo
      report in the `DevCustomVizPowerBI` repo — open it in Power BI Desktop,
      drop the visual on a page, bind the demo fields, save as `.pbix`.
      (Can't be produced without Power BI Desktop.)

## 4. Partner Center (your action)
- 🟡 Create/verify a **Partner Center** account (Microsoft AI/Cloud Partner
      Program; publisher verification can take a few days)
- 🟡 New offer → **Power BI custom visual**
- 🟡 Upload the `.pbiviz`, the 300×300 icon, screenshots, sample `.pbix`
- 🟡 Paste name, summary, description, keywords, categories from
      `listing-copy-en.md`
- 🟡 Set **Price: Free**
- 🟡 Support URL, privacy URL, terms (Apache-2.0)
- 🟡 Submit for validation (automated + manual review, typically days)

## 5. Certification (optional, later)
- 🟡 Only after the visual is live on AppSource
- 🟡 Requires the public source repo so Microsoft can rebuild from source
      (the `DevCustomVizPowerBI` repo already contains the full buildable
      source + README build steps)
- 🟡 Request certification in Partner Center; adds the "certified" badge and
      enables export-to-PDF/PowerPoint and email subscriptions with the visual

## Notes
- Publisher/brand: **Daten-WG**. Do not use Microsoft or IBCS logos in the
  listing artwork; keep "IBCS" as descriptive text only (see NOTICE).
- Keep the listing version in sync with the `.pbiviz` version on each update.
