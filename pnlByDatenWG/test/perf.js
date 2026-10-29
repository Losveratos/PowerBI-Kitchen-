// perf regression test — 5.000 accounts x 12 months (level mode, 4 levels).
// Deterministic synthetic data (no Date.now, no randomness): the same run on the
// same machine yields the same tree. Measures, via Playwright:
//   * first paint of the visual after update() with the full data view
//   * a rerender triggered by an expand click
//   * 1.6: the switch into the Sankey flow view (same data, memoized parse) —
//     the flow over the card-budgeted graph of 5.000 accounts
//   * 1.7: the same data as stocks (statement.stockMode = allStock): reparse,
//     every YTD value read as the stand of the last month (windowValue)
//   * 1.7 cross-highlight: another visual marks every third account at 40 %
//     (`highlights` next to the values) — two parses, two engine runs — in the
//     table, then the same highlight in the Sankey (inner ribbons)
// Fails when first render > 1500 ms, expand rerender > 300 ms, the Sankey
// switch > 1000 ms, the stock render > 1500 ms, the highlight render > 1500 ms
// or the highlighted Sankey > 1000 ms.
const path = require("path");

let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const ACCOUNTS = 5000;
const MONTHS = 12;
const FIRST_RENDER_BUDGET_MS = 1500;
const EXPAND_BUDGET_MS = 300;
const SANKEY_BUDGET_MS = 1000;

const PAGE = "<!DOCTYPE html><html><head><meta charset=\"utf-8\">"
    + "<style>html,body{margin:0;padding:0;font-family:'Segoe UI',sans-serif;}"
    + "#stage{width:1400px;height:900px;}</style></head>"
    + "<body><div id=\"stage\"></div></body></html>";

// runs inside the page: builds the data view, drives the visual, measures
function bench(cfg) {
    const N = cfg.accounts;
    const M = cfg.months;
    const L1 = 5; const L2 = 25; const L3 = 125; // 3 level columns + account leaf = 4 levels

    const lv1 = []; const lv2 = []; const lv3 = [];
    const acc = []; const srt = []; const typ = []; const per = [];
    const ac = []; const py = []; const pl = [];
    for (let a = 0; a < N; a++) {
        const id = "A" + (100000 + a);
        const s1 = "Segment " + (a % L1);
        const s2 = "Division " + (a % L2);
        const s3 = "Unit " + (a % L3);
        for (let m = 0; m < M; m++) {
            lv1.push(s1); lv2.push(s2); lv3.push(s3);
            acc.push(id); srt.push(a * 10); typ.push("account");
            per.push("2026-" + (m < 9 ? "0" : "") + (m + 1));
            const base = ((a * 7919 + m * 104729) % 1000) + 50;
            ac.push(base);
            py.push(Math.round(base * 94) / 100);
            pl.push(Math.round(base * 98) / 100);
        }
    }

    const col = (role, name, values) => ({
        source: { roles: { [role]: true }, displayName: name, queryName: name, index: 0 },
        values,
    });
    const dataView = {
        categorical: {
            categories: [
                col("levels", "L1", lv1), col("levels", "L2", lv2), col("levels", "L3", lv3),
                col("account", "AccountID", acc), col("sortOrder", "Sort", srt),
                col("rowType", "RowType", typ), col("period", "Month", per),
            ],
            values: [col("ac", "AC", ac), col("py", "PY", py), col("pl", "PL", pl)],
        },
        metadata: { columns: [], objects: { hierarchy: { defaultLevel: 0 } } },
    };

    const host = {
        locale: "en-US",
        colorPalette: { isHighContrast: false },
        eventService: {
            renderingStarted() { /* noop */ },
            renderingFinished() { /* noop */ },
            renderingFailed(o, e) { console.error("renderfail", e); },
        },
        createSelectionManager: () => ({
            select: () => Promise.resolve([]), clear: () => Promise.resolve(),
            showContextMenu() { /* noop */ }, registerOnSelectCallback() { /* noop */ },
            getSelectionIds: () => [],
        }),
        createSelectionIdBuilder: () => ({
            withCategory() { return this; }, createSelectionId() { return { equals: () => false }; },
        }),
        tooltipService: { enabled: () => false, show() { /* noop */ }, move() { /* noop */ }, hide() { /* noop */ } },
        createLocalizationManager: () => ({ getDisplayName: () => "" }),
        persistProperties: () => { /* noop */ },
        fetchMoreData: () => false,
    };

    const el = document.getElementById("stage");
    const visual = new window.PnlByDatenWG.Visual({ element: el, host });
    const options = {
        dataViews: [dataView],
        viewport: { width: el.clientWidth, height: el.clientHeight },
        type: 2,
        operationKind: 0,
    };

    const paint = () => new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now())));
    });
    const countRows = () => {
        let n = 0;
        el.querySelectorAll("div").forEach(d => { if (d.style.display === "table-row") { n++; } });
        return n;
    };
    const chevron = () => {
        const spans = el.querySelectorAll("span");
        for (const s of spans) {
            if (s.textContent === "▾ " || s.textContent === "▸ ") { return s; }
        }
        return null;
    };

    return (async () => {
        // --- first render ------------------------------------------------
        const t0 = performance.now();
        visual.update(options);
        const tUpdate = performance.now();
        void document.body.offsetHeight;
        const tFirstPaint = await paint();

        const domRows = countRows();
        const lastId = "A" + (100000 + N - 1);
        const windowedAtTop = el.textContent.indexOf(lastId) < 0;

        // --- scrolling reaches the far end of the list --------------------
        const root = el.firstElementChild;
        root.scrollTop = root.scrollHeight;
        await paint();
        await paint();
        const lastRowReachable = el.textContent.indexOf(lastId) >= 0;
        const domRowsBottom = countRows();
        root.scrollTop = 0;
        await paint();
        await paint();

        // --- expand rerender ---------------------------------------------
        const collapse = chevron();
        if (!collapse) { throw new Error("no expandable row found"); }
        collapse.click();
        await paint();
        const expand = chevron();
        if (!expand) { throw new Error("no collapsed row found after collapse"); }
        const e0 = performance.now();
        expand.click();
        void document.body.offsetHeight;
        const eFirstPaint = await paint();

        // --- a repeated update with identical data must not reparse -------
        const r0 = performance.now();
        visual.update(options);
        void document.body.offsetHeight;
        const rerenderMs = performance.now() - r0;

        // --- 1.6: switch into the Sankey (stored view, same data) -----------
        const s0 = performance.now();
        visual.update({ ...options, dataViews: [{ ...dataView, metadata: { columns: [], objects: {
            hierarchy: { defaultLevel: 0 }, state: { uiState: JSON.stringify({ view: "sankey", treeV: 2 }) } } } }] });
        void document.body.offsetHeight;
        const sFirstPaint = await paint();
        const sankeyNodes = el.querySelectorAll('[data-pnl="sk-node"]').length;

        // --- 1.7: the same data as stocks (every row a stock): a new parse, stands instead of sums
        const k0 = performance.now();
        visual.update({ ...options, dataViews: [{ ...dataView, metadata: { columns: [], objects: {
            hierarchy: { defaultLevel: 0 }, statement: { stockMode: "allStock" },
            state: { uiState: JSON.stringify({ view: "table" }) } } } }] });
        void document.body.offsetHeight;
        const kFirstPaint = await paint();

        // --- 1.7 cross-highlight: the host adds `highlights` to every measure column
        const hlValues = dataView.categorical.values.map(c => ({ ...c,
            highlights: c.values.map((v, i) => (Math.floor(i / M) % 3 === 0 ? Math.round(v * 40) / 100 : null)) }));
        const hlDv = (ui) => ({ ...dataView, categorical: { ...dataView.categorical, values: hlValues },
            metadata: { columns: [], objects: { hierarchy: { defaultLevel: 0 }, state: { uiState: JSON.stringify(ui) } } } });
        const h0 = performance.now();
        visual.update({ ...options, dataViews: [hlDv({ view: "table" })] });
        void document.body.offsetHeight;
        const hFirstPaint = await paint();
        // polish: the table reads a foreign selection like a filter — no note; only the Sankey has one
        const hlNote = !el.querySelector('[data-pnl="hl-note"]');
        const hs0 = performance.now();
        visual.update({ ...options, dataViews: [hlDv({ view: "sankey", treeV: 2 })] });
        void document.body.offsetHeight;
        const hsFirstPaint = await paint();
        const hlParts = el.querySelectorAll('[data-sk-hl="part"]').length;
        const hlSkNote = !!el.querySelector('[data-pnl="hl-note"]');

        // --- 1.7 polish: ⚡ hide in the cascade view (quiet steps folded into "other (n)") and the Sankey
        const excDv = (ui) => ({ ...dataView, metadata: { columns: [], objects: { hierarchy: { defaultLevel: 0 },
            exceptions: { enabled: true, thresholdPct: 5, mode: "hide" }, state: { uiState: JSON.stringify(ui) } } } });
        const x0 = performance.now();
        visual.update({ ...options, dataViews: [excDv({ view: "waterfall" })] });
        void document.body.offsetHeight;
        const xFirstPaint = await paint();
        const excNote = (el.querySelector('[data-pnl="exc-note"]') || {}).textContent || "";
        const xs0 = performance.now();
        visual.update({ ...options, dataViews: [excDv({ view: "sankey", treeV: 2 })] });
        void document.body.offsetHeight;
        const xsFirstPaint = await paint();

        return {
            excMs: xFirstPaint - x0, excNote, excSankeyMs: xsFirstPaint - xs0,
            hlMs: hFirstPaint - h0, hlNote,
            hlSankeyMs: hsFirstPaint - hs0, hlParts, hlSkNote,
            dataRows: N * M,
            domRows, domRowsBottom, windowedAtTop, lastRowReachable,
            updateMs: tUpdate - t0,
            firstRenderMs: tFirstPaint - t0,
            expandMs: eFirstPaint - e0,
            reupdateMs: rerenderMs,
            sankeyMs: sFirstPaint - s0,
            sankeyNodes,
            stockMs: kFirstPaint - k0,
        };
    })();
}

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    let errors = 0;
    page.on("console", m => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });

    await page.setContent(PAGE);
    await page.addScriptTag({ path: path.join(__dirname, "visual.bundle.js") });
    const r = await page.evaluate(bench, { accounts: ACCOUNTS, months: MONTHS });
    await browser.close();

    const ms = v => v.toFixed(0) + " ms";
    console.log(`  data rows          ${r.dataRows} (${ACCOUNTS} accounts x ${MONTHS} months)`);
    console.log(`  update() only      ${ms(r.updateMs)}`);
    console.log(`  first render       ${ms(r.firstRenderMs)}   (budget ${FIRST_RENDER_BUDGET_MS} ms)`);
    console.log(`  expand rerender    ${ms(r.expandMs)}   (budget ${EXPAND_BUDGET_MS} ms)`);
    console.log(`  update, same data  ${ms(r.reupdateMs)}   (memoized parse)`);
    console.log(`  DOM rows           ${r.domRows} at top, ${r.domRowsBottom} at bottom`);
    console.log(`  Sankey switch      ${ms(r.sankeyMs)}   (budget ${SANKEY_BUDGET_MS} ms, ${r.sankeyNodes} nodes)`);
    console.log(`  stocks (allStock)  ${ms(r.stockMs)}   (budget ${FIRST_RENDER_BUDGET_MS} ms, reparse + stands)`);
    console.log(`  highlight (table)  ${ms(r.hlMs)}   (budget ${FIRST_RENDER_BUDGET_MS} ms, three parses + three engine runs: whole, marked in its shape, filter)`);
    console.log(`  highlight (Sankey) ${ms(r.hlSankeyMs)}   (budget ${SANKEY_BUDGET_MS} ms, ${r.hlParts} inner ribbons)`);
    console.log(`  ⚡ hide (waterfall) ${ms(r.excMs)}   (budget ${FIRST_RENDER_BUDGET_MS} ms, ${(r.excNote.match(/(\d+) steps/) || ["", "0"])[1]} steps folded)`);
    console.log(`  ⚡ hide (Sankey)    ${ms(r.excSankeyMs)}   (budget ${SANKEY_BUDGET_MS} ms)`);

    const fail = [];
    if (errors > 0) { fail.push(errors + " console/page errors"); }
    if (!r.windowedAtTop) { fail.push("windowed rendering inactive (whole list in the DOM)"); }
    if (!r.lastRowReachable) { fail.push("scrolling to the bottom does not render the last row"); }
    if (r.firstRenderMs > FIRST_RENDER_BUDGET_MS) {
        fail.push(`first render ${ms(r.firstRenderMs)} > ${FIRST_RENDER_BUDGET_MS} ms`);
    }
    if (r.expandMs > EXPAND_BUDGET_MS) {
        fail.push(`expand rerender ${ms(r.expandMs)} > ${EXPAND_BUDGET_MS} ms`);
    }
    if (r.sankeyNodes < 10) { fail.push("the Sankey did not render (" + r.sankeyNodes + " nodes)"); }
    if (r.sankeyMs > SANKEY_BUDGET_MS) {
        fail.push(`Sankey switch ${ms(r.sankeyMs)} > ${SANKEY_BUDGET_MS} ms`);
    }
    if (r.stockMs > FIRST_RENDER_BUDGET_MS) {
        fail.push(`stock render ${ms(r.stockMs)} > ${FIRST_RENDER_BUDGET_MS} ms`);
    }
    if (!r.hlNote) { fail.push("the highlighted table shows a footer note (it must read like a filter)"); }
    if (!r.hlSkNote) { fail.push("the highlighted Sankey shows no footer note"); }
    if (r.hlMs > FIRST_RENDER_BUDGET_MS) { fail.push(`highlight render ${ms(r.hlMs)} > ${FIRST_RENDER_BUDGET_MS} ms`); }
    if (r.hlParts < 10) { fail.push("the highlighted Sankey drew no inner ribbons (" + r.hlParts + ")"); }
    if (r.hlSankeyMs > SANKEY_BUDGET_MS) { fail.push(`highlighted Sankey ${ms(r.hlSankeyMs)} > ${SANKEY_BUDGET_MS} ms`); }
    if (!/steps below the threshold combined/.test(r.excNote)) { fail.push("⚡ hide folded nothing in the waterfall (" + r.excNote + ")"); }
    if (r.excMs > FIRST_RENDER_BUDGET_MS) { fail.push(`⚡ hide waterfall ${ms(r.excMs)} > ${FIRST_RENDER_BUDGET_MS} ms`); }
    if (r.excSankeyMs > SANKEY_BUDGET_MS) { fail.push(`⚡ hide Sankey ${ms(r.excSankeyMs)} > ${SANKEY_BUDGET_MS} ms`); }
    if (fail.length > 0) {
        console.error("perf test failed: " + fail.join("; "));
        process.exit(1);
    }
    console.log("perf ok");
})();
