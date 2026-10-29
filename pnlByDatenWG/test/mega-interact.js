/*
 * Template dropdown of the mega table (headless Chromium over test/test.html).
 *
 * Plays the host's side of the format pane: the author picks a template, the
 * visual writes the switches via persistProperties and must survive the
 * updates around it —
 *   1. pick T02A            → ONE persist (switches + templateApplied + decimals), mega renders T02A
 *   2. stale update         → no persist, still T02A (echo guard)
 *   3. echo of the write    → no persist, guard cleared
 *   4. author switches a single toggle off (dPlPin) → no persist, the toggle wins
 *   5. pick T03A            → ONE persist with T03A
 *   6. echo lost: 6 stale updates → the guard expires after its TTL, the pane
 *      wins again and the template is NOT re-applied in a loop
 *   7. pick "off"           → persist all switches off, numbers untouched → classic table
 *   8. pick T04B (statement) → one persist, waterfall + pins; guard, echo, single switch
 *   9. pick 12A             → one persist, two value cascades + ΔPY bars + pins
 *  10. T04D, then the minuend dropdown of the format pane FC → AC → FC: the
 *      slice is there, the fill follows (hatched ↔ solid), nothing is persisted
 *
 * Run: node test/mega-interact.js  (npm run test:mega)
 */
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const failures = [];
const notes = [];
function check(label, cond, detail) {
    if (cond) { notes.push("  ok · " + label); return; }
    failures.push(label + (detail ? " — " + detail : ""));
}

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    let errors = 0;
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    page.on("console", m => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
    await page.goto("file://" + __dirname + "/test.html");
    await page.waitForTimeout(300);

    await page.evaluate(() => {
        const box = document.createElement("div");
        box.id = "mi"; box.style.cssText = "width:1300px;height:800px;position:relative;";
        document.body.appendChild(box);
        const host = makeHost("en-US");
        window.__miPersist = [];
        host.persistProperties = (p) => { window.__miPersist.push(JSON.parse(JSON.stringify(p))); };
        window.__mi = new Visual({ element: box, host });
        window.__miUpd = (objects) => window.__mi.update({
            dataViews: [dvRows(MEGA_DEMO.regions(), objects)],
            viewport: { width: 1300, height: 800 }, type: 2,
        });
        window.__miState = () => {
            const st = document.getElementById("mi");
            const head = st.querySelector('svg[data-pnl="mega-head"]');
            return {
                mega: !!head,
                heads: head ? [...head.querySelectorAll("text")].map(t => t.textContent) : [],
                charts: st.querySelectorAll('g[data-pnl="mega-chart"]').length,
                classic: st.querySelectorAll('[data-pnl="hdr-row"]').length > 0,
                persists: window.__miPersist.length,
                last: window.__miPersist[window.__miPersist.length - 1] || null,
            };
        };
    });
    const upd = (objects) => page.evaluate((o) => { window.__miUpd(o); return window.__miState(); }, objects);
    const BASE = { hierarchy: { defaultLevel: 0 }, toolbar: { show: false } };

    // 1 — the author picks T02A
    let s = await upd({ ...BASE, columns: { template: "T02A" } });
    check("1 pick T02A: one persist", s.persists === 1, String(s.persists));
    const cols = s.last && s.last.merge.find(m => m.objectName === "columns").properties;
    const nums = s.last && s.last.merge.find(m => m.objectName === "numbers");
    check("1 persist carries the switches + templateApplied", cols && cols.templateApplied === "T02A"
        && cols.dPlBar === true && cols.dPlPin === true && cols.showPL === true && cols.showPY === false
        && cols.secondBlock === true && cols.minuend === "ac" && cols.sort === "cat", JSON.stringify(cols));
    check("1 persist carries decimals 0 / Δ% 1", nums && nums.properties.decimals === 0 && nums.properties.pctDecimals === 1);
    check("1 renders T02A at once (4 chart columns)", s.mega && s.charts === 4, JSON.stringify(s.heads));

    // 2 — a stale update (the host has not echoed yet)
    s = await upd({ ...BASE, columns: { template: "T02A" } });
    check("2 stale update: no second persist", s.persists === 1);
    check("2 stale update: still T02A (echo guard)", s.mega && s.charts === 4);

    // 3 — the echo arrives
    // the pane keeps the template the author picked, the host adds what the visual wrote
    const ECHO = { ...BASE, columns: { ...cols, template: "T02A" }, numbers: { decimals: 0, pctDecimals: 1 } };
    s = await upd(ECHO);
    check("3 echo: no persist, T02A", s.persists === 1 && s.charts === 4);

    // 4 — the author switches the ΔPL% pins off by hand
    s = await upd({ ...ECHO, columns: { ...ECHO.columns, dPlPin: false } });
    check("4 single toggle wins, nothing re-applied", s.persists === 1 && s.charts === 2, `${s.persists} / ${s.charts}`);

    // 5 — the author picks T03A
    s = await upd({ ...ECHO, columns: { ...cols, dPlPin: false, template: "T03A" } });
    check("5 pick T03A: one more persist", s.persists === 2 && s.last.merge[0].properties.templateApplied === "T03A");
    check("5 T03A renders numbers only (no charts), paired Δ heads", s.mega && s.charts === 0
        && s.heads.includes("ΔPY") && s.heads.includes("ΔPL"), JSON.stringify(s.heads));

    // 6 — the echo is lost: stale updates keep coming
    const STALE = { ...ECHO, columns: { ...cols, dPlPin: false, template: "T03A" } };
    const seen = [];
    for (let i = 0; i < 7; i++) { s = await upd(STALE); seen.push(s.charts); }
    check("6 guard holds T03A for the first stale updates", seen[0] === 0 && seen[1] === 0, seen.join(","));
    check("6 after the TTL the pane wins again (T02A switches, pins off)", seen[seen.length - 1] === 2, seen.join(","));
    check("6 no re-apply loop (no further persist)", s.persists === 2, String(s.persists));

    // 7 — back to the classic table
    s = await upd({ ...ECHO, columns: { ...cols, template: "off", templateApplied: "T02A" } });
    const offCols = s.last.merge[0].properties;
    check("7 pick off: persist all column switches off", s.persists === 3 && offCols.templateApplied === "off"
        && offCols.showPL === false && offCols.dPlBar === false && offCols.dPlPin === false);
    check("7 'off' leaves the number format alone", s.last.merge.length === 1);
    check("7 classic table renders", !s.mega && s.classic);

    // ---- rows of the mega table: the label folds, the cells select ------------
    const T01B = { ...BASE, columns: { showPY: true, showPL: true, showMinuend: true, dPyAbs: true, dPyPct: true,
        dPlAbs: true, dPlPct: true, secondBlock: true } };
    // the host echoes step 7 first (guard released), then the author builds T01B by hand
    await upd({ ...BASE, columns: { ...offCols, template: "off" } });
    await page.evaluate(() => { window.__selReset(); });
    s = await upd({ ...T01B, columns: { ...offCols, template: "off", ...T01B.columns } });
    check("hand-built T01B (no template) renders without persisting", s.mega && s.persists === 3);
    const rowsOf = () => page.evaluate(() => [...document.querySelectorAll('#mi rect[data-pnl-part="cells"]')]
        .map(r => r.getAttribute("data-pnl-row")));
    let rows = await rowsOf();
    check("fold: Europe block open (Austria visible)", rows.includes("Europe:Austria") && rows.includes("L:World¦Europe"));
    await page.evaluate(() => {
        const lab = document.querySelector('#mi rect[data-pnl-part="label"][data-pnl-row="L:World¦Europe"]');
        lab.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    rows = await rowsOf();
    check("fold: a click on the Europe label folds its block", !rows.includes("Europe:Austria") && rows.includes("L:World¦Europe"));
    const folded = await page.evaluate(() => [...document.querySelectorAll('#mi svg[data-pnl="mega-body"] text')]
        .some(t => t.textContent.includes("Europe") && t.textContent.includes("▸")));
    check("fold: the folded total carries ▸", folded);
    await page.evaluate(() => {
        const r = document.querySelector('#mi rect[data-pnl-part="cells"][data-pnl-row="Americas:USA"]');
        r.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const sel = await page.evaluate(() => window.__selLog.slice());
    const pick = sel.find(x => x.call === "select");
    check("select: a click on the USA cells selects its 11 month rows", pick && pick.n === 11, JSON.stringify(sel));
    const wash = await page.evaluate(() => document.querySelectorAll('#mi svg[data-pnl="mega-body"] > g > rect[height="2"]').length);
    check("select: the selected row carries the accent underline", wash >= 1);
    await page.evaluate(() => {
        const r = document.querySelector('#mi rect[data-pnl-part="cells"][data-pnl-row="Americas:USA"]');
        r.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: 50, clientY: 60 }));
    });
    const menu = await page.evaluate(() => window.__selLog.find(x => x.call === "menu"));
    check("context menu: right click opens the host menu", menu != null);

    // ---- sticky head: the column heads stay under the frozen title block ------
    await page.evaluate(() => {
        const box = document.getElementById("mi"); box.style.height = "420px";
        window.__mi.update({ dataViews: [dvRows(MEGA_DEMO.regions(), { hierarchy: { defaultLevel: 0 },
            columns: { showPL: true, showMinuend: true, dPlBar: true, dPlPin: true, secondBlock: true } })],
        viewport: { width: 1300, height: 420 }, type: 2 });
    });
    const stick = await page.evaluate(() => {
        const root = document.querySelector("#mi .pnl-root");
        root.scrollTop = 260;
        const head = document.querySelector('#mi [data-pnl="head"]').getBoundingClientRect();
        const mh = document.querySelector('#mi [data-pnl="mega-head-wrap"]').getBoundingClientRect();
        return { scroll: root.scrollTop, headBottom: Math.round(head.bottom), megaTop: Math.round(mh.top) };
    });
    check("sticky: after scrolling the column heads sit right under the frozen head",
        stick.scroll > 0 && Math.abs(stick.headBottom - stick.megaTop) <= 1, JSON.stringify(stick));

    // ---- phase 3: T04B / 12A through the same template + echo-guard path ------
    await page.evaluate(() => {
        const box = document.createElement("div");
        box.id = "mi3"; box.style.cssText = "width:1300px;height:800px;position:relative;";
        document.body.appendChild(box);
        const host = makeHost("en-US");
        window.__mi3Persist = [];
        host.persistProperties = (p) => { window.__mi3Persist.push(JSON.parse(JSON.stringify(p))); };
        window.__mi3 = new Visual({ element: box, host });
        window.__mi3Upd = (objects) => {
            window.__mi3.update({ dataViews: [dvRows(MEGA_DEMO.statement("T04"), objects)],
                viewport: { width: 1300, height: 800 }, type: 2 });
            const st = document.getElementById("mi3");
            return {
                charts: st.querySelectorAll('g[data-pnl="mega-chart"]').length,
                conn: st.querySelectorAll('g[data-pnl="mega-conn"]').length,
                persists: window.__mi3Persist.length,
                last: window.__mi3Persist[window.__mi3Persist.length - 1] || null,
            };
        };
    });
    const upd3 = (objects) => page.evaluate((o) => window.__mi3Upd(o), objects);
    s = await upd3({ ...BASE, columns: { template: "T04B" } });
    const c4 = s.last && s.last.merge.find(m => m.objectName === "columns").properties;
    check("8 pick T04B: one persist with dPlWaterfall + templateApplied", s.persists === 1 && c4
        && c4.templateApplied === "T04B" && c4.dPlWaterfall === true && c4.dPlBar === false && c4.valueCascade === false);
    check("8 T04B renders at once: waterfall (with connectors) + pins", s.charts === 2 && s.conn === 1, `${s.charts} / ${s.conn}`);
    s = await upd3({ ...BASE, columns: { template: "T04B" } });
    check("8 stale update: guard holds T04B, no second persist", s.persists === 1 && s.charts === 2 && s.conn === 1);
    const ECHO3 = { ...BASE, columns: { ...c4, template: "T04B" }, numbers: { decimals: 2, pctDecimals: 1 } };
    s = await upd3(ECHO3);
    check("8 echo: no persist", s.persists === 1 && s.charts === 2);
    s = await upd3({ ...ECHO3, columns: { ...ECHO3.columns, dPlWaterfall: false } });
    check("8 the waterfall switch acts on its own (pins stay)", s.persists === 1 && s.charts === 1 && s.conn === 0, `${s.charts}`);
    s = await upd3({ ...ECHO3, columns: { ...c4, dPlWaterfall: false, template: "12A" } });
    const c12 = s.last.merge.find(m => m.objectName === "columns").properties;
    check("9 pick 12A: one more persist with valueCascade", s.persists === 2 && c12.templateApplied === "12A"
        && c12.valueCascade === true && c12.dPyBar === true && c12.dPlWaterfall === false);
    check("9 12A renders two value cascades + ΔPY bars + pins", s.charts === 4 && s.conn === 2, `${s.charts} / ${s.conn}`);

    // ---- 10: minuend AC ↔ FC through the format pane (T04D) -------------------
    // the pane slice as Power BI builds it, then the write Power BI makes
    const mn = await page.evaluate(() => {
        const objs = { hierarchy: { defaultLevel: 0 }, toolbar: { show: false }, columns: { template: "T04D" } };
        const upd = () => { window.__mi3Upd(objs); };
        window.__mi3Persist.length = 0;
        upd();                                   // the author picks T04D …
        const w = window.__mi3Persist[window.__mi3Persist.length - 1];
        for (const m of (w ? w.merge : [])) { objs[m.objectName] = { ...(objs[m.objectName] || {}), ...m.properties }; }
        upd();                                   // … and the host echoes the write
        const slice = () => {
            for (const card of window.__mi3.getFormattingModel().cards) {
                for (const g of card.groups || []) {
                    for (const sl of g.slices || []) {
                        const d = sl.control && sl.control.properties && sl.control.properties.descriptor;
                        if (d && d.objectName === "columns" && d.propertyName === "minuend") {
                            return { value: sl.control.properties.value.value, visible: sl.visible !== false && g.visible !== false };
                        }
                    }
                }
            }
            return null;
        };
        const read = () => {
            const st = document.getElementById("mi3");
            const head = st.querySelector('svg[data-pnl="mega-head"]');
            const chart = st.querySelector('g[data-pnl="mega-chart"]');
            const segs = [...chart.querySelectorAll("rect")].filter(r => r.getAttribute("data-pnl") !== "mega-halo" && +r.getAttribute("height") > 6);
            return { heads: [...head.querySelectorAll("text")].map(t => t.textContent).join(" "),
                hatched: segs.filter(r => /^url\(/.test(r.getAttribute("fill") || "")).length,
                solid: segs.filter(r => /^#/.test(r.getAttribute("fill") || "")).length };
        };
        const out = { slice0: slice(), r0: read(), persists0: window.__mi3Persist.length };
        objs.columns = { ...objs.columns, minuend: "ac" }; upd();
        out.slice1 = slice(); out.r1 = read();
        objs.columns = { ...objs.columns, minuend: "fc" }; upd();
        out.r2 = read(); out.persists2 = window.__mi3Persist.length;
        return out;
    });
    check("10 T04D: the pane shows the minuend slice with FC", mn.slice0 && mn.slice0.visible && mn.slice0.value === "fc", JSON.stringify(mn.slice0));
    check("10 T04D renders FC hatched", /PL FC ΔPL/.test(mn.r0.heads) && mn.r0.hatched === 20 && mn.r0.solid === 0, JSON.stringify(mn.r0));
    check("10 pane minuend → AC: solid waterfall, AC head, pane follows", /PL AC ΔPL/.test(mn.r1.heads) && mn.r1.solid === 20
        && mn.r1.hatched === 0 && mn.slice1.value === "ac", JSON.stringify(mn.r1));
    check("10 pane minuend → FC again: hatched, template untouched (no persist)", mn.r2.hatched === 20
        && mn.persists2 === mn.persists0, JSON.stringify(mn.r2));

    // ---- 11: 1.1 Paket C — 12G / 12H write blockKind, minuend PL and the headline slot
    await page.evaluate(() => {
        const box = document.createElement("div");
        box.id = "mi4"; box.style.cssText = "width:1300px;height:800px;position:relative;";
        document.body.appendChild(box);
        const host = makeHost("en-US");
        window.__mi4Persist = [];
        host.persistProperties = (p) => { window.__mi4Persist.push(JSON.parse(JSON.stringify(p))); };
        window.__mi4 = new Visual({ element: box, host });
        window.__mi4Upd = (objects, rows) => {
            window.__mi4.update({ dataViews: [dvRows(rows === "12A" ? MEGA_DEMO.statement("12A") : MEGA_DEMO.statement12G(), objects)],
                viewport: { width: 1300, height: 800 }, type: 2 });
            const st = document.getElementById("mi4");
            const head = st.querySelector('svg[data-pnl="mega-head"]');
            const hl = st.querySelector('[data-pnl="headline"]');
            return {
                heads: head ? [...head.querySelectorAll("text")].map(t => t.textContent) : [],
                headline: hl ? hl.textContent : null,
                stacked: st.querySelectorAll('text[data-pnl="mega-ytd"]').length,
                persists: window.__mi4Persist.length,
                last: window.__mi4Persist[window.__mi4Persist.length - 1] || null,
            };
        };
    });
    const upd4 = (objects, rows) => page.evaluate(([o, r]) => window.__mi4Upd(o, r), [objects, rows]);
    const part = (st, name) => ((st.last && st.last.merge.find(m => m.objectName === name)) || {}).properties || {};
    s = await upd4({ ...BASE, columns: { template: "12G" } });
    check("11 pick 12G: one persist — blockKind fy, value cascades, titleBlock.headline on",
        s.persists === 1 && part(s, "columns").blockKind === "fy" && part(s, "columns").valueCascade === true
        && part(s, "titleBlock").headline === true && part(s, "numbers").decimals === 0, JSON.stringify(s.last));
    check("11 12G renders at once: FY block, stacked AC&FC (YTD numbers inside), headline from the generator",
        s.heads.includes("FY 2025") && s.heads.includes("YTD") && s.heads.includes("AC&FC") && s.stacked >= 5
        && /^Group result \(forecast\) is 144(\u00A0k?EUR)? \(\+76\.6\u202F%\) above previous year; strongest driver is Licences with \+721(\u00A0k?EUR)? higher income, /.test(s.headline || ""),
        JSON.stringify([s.heads, s.stacked, s.headline]));
    s = await upd4({ ...BASE, columns: { template: "12G" } });
    check("11 stale update: the guard holds blockKind + headline, no second persist", s.persists === 1
        && s.heads.includes("FY 2025") && s.headline != null);
    s = await upd4({ ...BASE, columns: { template: "12H" } }, "12A");
    check("11 pick 12H: minuend pl + headline persisted, blockKind back to ytd", s.persists === 2
        && part(s, "columns").minuend === "pl" && part(s, "columns").blockKind === "ytd" && part(s, "titleBlock").headline === true,
        JSON.stringify(s.last));
    check("11 12H renders PY | PL cascades and ΔPY only (no ΔPL against itself)",
        JSON.stringify(s.heads) === JSON.stringify(["PY", "PL", "ΔPY", "ΔPY%"]), s.heads.join("|"));
    // an own message beats the generator; the headline switch off returns the bold line
    const echo12H = { ...BASE, columns: { ...part(s, "columns"), template: "12H" }, numbers: { decimals: 0, pctDecimals: 1 },
        titleBlock: { headline: true, message: "Own message" } };
    s = await upd4(echo12H, "12A");
    check("11 headline shows the own message", s.headline === "Own message" && s.persists === 2);
    s = await upd4({ ...echo12H, titleBlock: { headline: false, message: "Own message" } }, "12A");
    check("11 headline off: no headline slot", s.headline === null && s.persists === 2);

    await browser.close();
    for (const n of notes) { console.log(n); }
    if (errors > 0) { failures.push(errors + " render errors"); }
    if (failures.length) {
        console.error("\n" + failures.length + " check(s) failed:\n  ✗ " + failures.join("\n  ✗ "));
        process.exit(1);
    }
    console.log(`\n${notes.length} template/echo-guard checks passed`);
})();
