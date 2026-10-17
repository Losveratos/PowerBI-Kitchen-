// mega-table virtualization test (1.1 Paket C) — in the pattern of test/perf.js.
//
// 2 000 accounts of a structure hierarchy (Total → 200 groups → accounts)
// as a mega table with PL / AC value columns, ΔPL bars, the integrated ΔPL
// waterfall and ΔPL% pins. Measures, via Playwright:
//   * first paint of the visual after update() with the full data view
//   * the repaint when scrolling to the far end of the table
// and asserts the virtualization contract:
//   * above MEGA_VIRT_MIN_ROWS (150) only the rows around the viewport carry
//     elements / hit areas, the body keeps its full height, the axes run through
//   * scrolling repaints the window: the last account becomes reachable
//   * selection (click), fold (label click) and tooltips work on repainted rows
//   * painting with a window over ALL rows is byte-identical to painting
//     without a window (megatable.ts bundle, same layout) — below the threshold
//     the visual never passes a window, so its output is exactly that of 1.0
// Fails when first render > 2000 ms or a scroll repaint > 250 ms.
const path = require("path");
const esbuild = require("esbuild");

let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const ACCOUNTS = 2000;
const FIRST_RENDER_BUDGET_MS = 2000;
const SCROLL_BUDGET_MS = 250;

const PAGE = "<!DOCTYPE html><html><head><meta charset=\"utf-8\">"
    + "<style>html,body{margin:0;padding:0;font-family:'Segoe UI',sans-serif;}"
    + "#stage{width:1400px;height:900px;}</style></head>"
    + "<body><div id=\"stage\"></div></body></html>";

// megatable.ts alone, as a browser global (the identity check paints it directly)
const MEGA_BUNDLE = path.join(__dirname, ".tmp-megatable-iife.js");
esbuild.buildSync({
    entryPoints: [path.join(__dirname, "..", "src/megatable.ts")],
    bundle: true, format: "iife", globalName: "PnlMega", outfile: MEGA_BUNDLE,
});

// runs inside the page: builds the data view, drives the visual, measures
function bench(cfg) {
    const N = cfg.accounts;
    const lv1 = []; const lv2 = []; const lv3 = []; const acc = []; const srt = []; const typ = [];
    const ac = []; const pl = []; const py = [];
    for (let a = 0; a < N; a++) {
        lv1.push("Total"); lv2.push("Group " + String(Math.floor(a / 10)).padStart(3, "0"));
        lv3.push("Account " + String(a).padStart(4, "0"));
        acc.push("A" + (100000 + a)); srt.push(a); typ.push("account");
        const base = ((a * 7919) % 900) + 100;
        ac.push(base); pl.push(Math.round(base * (0.9 + (a % 7) * 0.03))); py.push(Math.round(base * 0.93));
    }
    const col = (role, name, values) => ({
        source: { roles: { [role]: true }, displayName: name, queryName: name, index: 0 }, values,
    });
    const dataView = {
        categorical: {
            categories: [col("levels", "L1", lv1), col("levels", "L2", lv2), col("levels", "L3", lv3), col("account", "AccountID", acc),
                col("sortOrder", "Sort", srt), col("rowType", "RowType", typ)],
            values: [col("ac", "AC", ac), col("pl", "PL", pl), col("py", "PY", py)],
        },
        metadata: {
            columns: [], objects: {
                hierarchy: { defaultLevel: 0 }, toolbar: { show: false },
                numbers: { scaling: "none", decimals: 0 },
                columns: { showPL: true, showMinuend: true, dPlBar: true, dPlWaterfall: true, dPlPin: true },
            },
        },
    };
    const sel = []; const tips = [];
    const host = {
        locale: "en-US",
        colorPalette: { isHighContrast: false },
        eventService: { renderingStarted() { /* noop */ }, renderingFinished() { /* noop */ }, renderingFailed(o, e) { console.error("renderfail", e); } },
        createSelectionManager: () => ({
            select: (ids) => { sel.push(ids); return Promise.resolve([]); }, clear: () => Promise.resolve(),
            showContextMenu() { /* noop */ }, registerOnSelectCallback() { /* noop */ }, getSelectionIds: () => [],
        }),
        createSelectionIdBuilder: () => ({
            withCategory() { return this; }, createSelectionId() { return { equals: () => false }; },
        }),
        tooltipService: { enabled: () => true, show(o) { tips.push(o); }, move() { /* noop */ }, hide() { /* noop */ } },
        createLocalizationManager: () => ({ getDisplayName: () => "" }),
        persistProperties: () => { /* noop */ },
        fetchMoreData: () => false,
    };
    const el = document.getElementById("stage");
    const visual = new window.PnlByDatenWG.Visual({ element: el, host });
    const options = { dataViews: [dataView], viewport: { width: el.clientWidth, height: el.clientHeight }, type: 2, operationKind: 0 };
    const paint = () => new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now())));
    });
    const body = () => el.querySelector('svg[data-pnl="mega-body"]');
    const hitRows = () => [...body().querySelectorAll('rect[data-pnl-part="cells"]')].map(r => r.getAttribute("data-pnl-row"));

    return (async () => {
        const t0 = performance.now();
        visual.update(options);
        void document.body.offsetHeight;
        const tFirst = await paint();
        const root = el.firstElementChild;
        const rowsAtTop = hitRows();
        const bodyH = +body().getAttribute("height");
        const axesTop = body().querySelectorAll('g[data-pnl="mega-chart"] > g[shape-rendering] > line').length;
        const lastId = "A" + (100000 + N - 1);

        // scroll to the far end: the window repaints
        const s0 = performance.now();
        root.scrollTop = root.scrollHeight;
        root.dispatchEvent(new Event("scroll"));
        const s1 = await paint();
        await paint();
        const rowsAtBottom = hitRows();
        const bodyH2 = +body().getAttribute("height");
        const connAtBottom = body().querySelectorAll('g[data-pnl="mega-conn"] line').length;

        // selection on a repainted row
        const hit = body().querySelector(`rect[data-pnl-part="cells"][data-pnl-row="${lastId}"]`);
        if (hit) { hit.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 10, clientY: 10 })); }
        await paint();
        // tooltip on a repainted row
        const hit2 = body().querySelector(`rect[data-pnl-part="cells"][data-pnl-row="${lastId}"]`);
        if (hit2) { hit2.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, clientX: 10, clientY: 10 })); }
        const tipRow = tips.length ? (tips[tips.length - 1].dataItems[0] || {}).value : null;

        // fold a group near the end (label click) — the table rerenders, still windowed
        const lastGroupId = rowsAtBottom.filter(id => !/^A\d+$/.test(id) && id !== "")[0];
        const lab = lastGroupId ? body().querySelector(`rect[data-pnl-part="label"][data-pnl-row="${lastGroupId}"]`) : null;
        const before = +body().getAttribute("height");
        if (lab) { lab.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
        await paint(); await paint();
        const after = +body().getAttribute("height");

        return {
            rows: N, firstRenderMs: tFirst - t0, scrollMs: s1 - s0,
            atTop: rowsAtTop.length, atBottom: rowsAtBottom.length, bodyH, bodyH2, axesTop, connAtBottom,
            lastAtTop: rowsAtTop.includes(lastId), lastAtBottom: rowsAtBottom.includes(lastId),
            selected: sel.length, tipRow, folded: before - after, foldedGroup: lastGroupId || null,
            windowedAfterFold: hitRows().length < N,
        };
    })();
}

// runs inside the page: paintMega with a window over every row vs. without a window
function identity() {
    const P = window.PnlMega;
    const rows = []; const V = {};
    for (let g = 0; g < 20; g++) {
        for (let a = 0; a < 9; a++) {
            const id = "a" + g + "_" + a;
            rows.push({ id, label: "Account " + id, kind: "acc", op: "", level: 1, group: "g" + g, other: false, eff: 1 });
            V[id] = { AC: 100 + ((g * 31 + a * 17) % 90), PL: 100 + ((g * 13 + a * 29) % 90), PY: 95 + ((g * 7 + a * 11) % 90) };
        }
        rows.push({ id: "g" + g, label: "Group " + g, kind: "sum", op: "", level: 0, group: "t", other: false, eff: 1 });
        V["g" + g] = { AC: 0, PL: 0, PY: 0 };
        for (let a = 0; a < 9; a++) { for (const s of ["AC", "PL", "PY"]) { V["g" + g][s] += V["a" + g + "_" + a][s]; } }
        rows.push({ id: "", label: "", kind: "gap", op: "", level: 0, group: null, other: false });
    }
    rows.push({ id: "t", label: "Total", kind: "sum", op: "", level: 0, group: null, other: false, eff: 1, anchor: true });
    V.t = { AC: 0, PL: 0, PY: 0 };
    for (let g = 0; g < 20; g++) { for (const s of ["AC", "PL", "PY"]) { V.t[s] += V["g" + g][s]; } }
    const off = { num: false, bar: false, wf: false, pct: false, pin: false };
    const t = {
        min: "AC", showPY: false, showPL: true, showMin: true, valueCascade: false,
        d: { PY: { ...off }, PL: { num: true, bar: true, wf: true, pct: true, pin: true } },
        thresholds: true, marks: true, labels: true, capBars: false, sort: "cat", sortBlock: 1,
    };
    const block = {
        name: "", th: { abs: -20, pct: -0.1 },
        value: (r, s) => V[r.id] ? V[r.id][s] : null,
        delta: (r, min, ref) => {
            const v = V[r.id]; if (!v) { return null; }
            const d = v[min] - v[ref]; const p = d / Math.abs(v[ref]);
            return { d, p, good: d >= 0, impact: d, impactPct: p, pp: false };
        },
    };
    const cv = document.createElement("canvas").getContext("2d");
    const L = P.layoutMega({
        rows, blocks: [block], t, statement: false, fs: 13, viewW: 1300, dec: 0, pdec: 1,
        num: (a, d) => a.toFixed(d), measure: (s, fs, b, i) => { cv.font = `${i ? "italic " : ""}${b ? "bold " : ""}${fs}px sans-serif`; return cv.measureText(s).width; },
        pal: { good: "#0E8585", bad: "#E02B1D" }, redIf: "Δ in red if:",
    });
    const opts = {
        font: "sans-serif", headInk: "#404040", uid: "u", selectedId: "a3_4", selWash: "#eee", selAccent: "#404040",
        hatchPattern: (svg, id, color) => {
            const p = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
            p.setAttribute("id", id); p.setAttribute("fill", color); svg.appendChild(p);
        },
        highlight: { ids: new Set(["g5", "a7_1"]), ink: "#404040", hc: false },
    };
    const a = P.paintMega(L, opts);
    const b = P.paintMega(L, { ...opts, window: { from: 0, to: L.R.length } });
    const w = P.paintMega(L, { ...opts, window: { from: 100, to: 140 } });
    return {
        rows: L.R.length,
        headSame: a.head.outerHTML === b.head.outerHTML,
        bodySame: a.body.outerHTML === b.body.outerHTML,
        hitsAll: a.hits.length, hitsWin: w.hits.length,
        elsAll: a.body.querySelectorAll("*").length, elsWin: w.body.querySelectorAll("*").length,
        heightSame: a.body.getAttribute("height") === w.body.getAttribute("height"),
        // every connector of the window crosses its y range
        connWin: w.body.querySelectorAll('g[data-pnl="mega-conn"] line').length,
    };
}

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    let errors = 0;
    page.on("console", m => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });

    await page.setContent(PAGE);
    await page.addScriptTag({ path: path.join(__dirname, "visual.bundle.js") });
    await page.addScriptTag({ path: MEGA_BUNDLE });
    const id = await page.evaluate(identity);
    const r = await page.evaluate(bench, { accounts: ACCOUNTS });
    await browser.close();

    const ms = v => v.toFixed(0) + " ms";
    console.log(`  accounts           ${r.rows}`);
    console.log(`  first render       ${ms(r.firstRenderMs)}   (budget ${FIRST_RENDER_BUDGET_MS} ms)`);
    console.log(`  scroll repaint     ${ms(r.scrollMs)}   (budget ${SCROLL_BUDGET_MS} ms)`);
    console.log(`  painted rows       ${r.atTop} at top, ${r.atBottom} at bottom (body ${r.bodyH} px)`);
    console.log(`  identity           ${id.rows} rows: window over all rows ${id.bodySame && id.headSame ? "byte-identical" : "DIFFERS"}; `
        + `window 100..140: ${id.hitsWin} hits, ${id.elsWin} / ${id.elsAll} elements, ${id.connWin} connectors`);

    const fail = [];
    if (errors > 0) { fail.push(errors + " console/page errors"); }
    if (!(id.headSame && id.bodySame)) { fail.push("paintMega with a full window differs from the unwindowed paint"); }
    if (id.hitsAll !== id.rows || id.hitsWin !== 40) { fail.push(`window hits ${id.hitsWin} / all ${id.hitsAll}`); }
    if (!(id.elsWin < id.elsAll / 2) || !id.heightSame || id.connWin === 0) { fail.push("windowed paint does not shrink / keep height / connectors"); }
    if (!(r.atTop > 0 && r.atTop < 200)) { fail.push(`not windowed at the top (${r.atTop} rows painted)`); }
    if (r.lastAtTop) { fail.push("last account painted at the top"); }
    if (!r.lastAtBottom) { fail.push("scrolling to the bottom does not paint the last account"); }
    if (r.bodyH !== r.bodyH2 || r.bodyH < ACCOUNTS * 20) { fail.push(`body height ${r.bodyH} / ${r.bodyH2}`); }
    if (r.axesTop === 0 || r.connAtBottom === 0) { fail.push("axes / connectors missing in the window"); }
    if (r.selected === 0) { fail.push("click on a repainted row selects nothing"); }
    if (r.tipRow !== "Account " + String(ACCOUNTS - 1).padStart(4, "0")) { fail.push("tooltip on a repainted row: " + r.tipRow); }
    if (!(r.folded > 0) || !r.windowedAfterFold) { fail.push(`fold of ${r.foldedGroup} on a repainted row: −${r.folded} px`); }
    if (r.firstRenderMs > FIRST_RENDER_BUDGET_MS) { fail.push(`first render ${ms(r.firstRenderMs)} > ${FIRST_RENDER_BUDGET_MS} ms`); }
    if (r.scrollMs > SCROLL_BUDGET_MS) { fail.push(`scroll repaint ${ms(r.scrollMs)} > ${SCROLL_BUDGET_MS} ms`); }
    if (fail.length > 0) {
        console.error("mega perf test failed: " + fail.join("; "));
        process.exit(1);
    }
    console.log("mega perf ok");
})();
