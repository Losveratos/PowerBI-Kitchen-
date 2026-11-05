/*
 * Frozen head in a scaled stage and in a low tile (headless Chromium over test/test.html).
 *
 * 1.5.3: a Fabric App draws its pages on a stage scaled with a CSS transform
 * (1.25×, 2×). getBoundingClientRect then reports screen pixels while sticky
 * offsets work in layout pixels — the column header stuck one head height too
 * low, in the middle of the rows. And in a low tile the frozen head plus a
 * sticky footnote block took the whole height: no row was visible.
 *   1. T03A at 1.5×: the sticky offset of the column header equals the head height (layout px)
 *   2. scrolled: the column header sits directly under the head, no rows between
 *   3. 12A with three comments in a 260 px tile: footnotes stay in flow, rows visible
 *   4. the notation footer inside a multi-column footnote block spans all columns
 *
 * Run: node test/stage-scale.js  (npm run test:stage)
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
    const page = await browser.newPage({ viewport: { width: 1800, height: 1400 } });
    let errors = 0;
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    page.on("console", m => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
    await page.goto("file://" + __dirname + "/test.html");
    await page.waitForTimeout(300);

    const mount = (id, w, h, scale, rows, objects) => page.evaluate(({ id, w, h, scale, rows, objects }) => {
        const stage = document.createElement("div");
        stage.style.cssText = `position:absolute;left:0;top:0;transform:scale(${scale});transform-origin:0 0;background:#fff;z-index:99;`;
        const box = document.createElement("div");
        box.id = id; box.style.cssText = `width:${w}px;height:${h}px;position:relative;`;
        stage.appendChild(box);
        document.body.appendChild(stage);
        const v = new Visual({ element: box, host: makeHost("en-US") });
        const data = rows === "12A"
            ? MEGA_DEMO.statement("12A").map(r => ({ lic: "Licence deal pulled forward from Q1", per: "Two senior hires in sales",
                oth: "Minority share of the services unit" }[r.account] ? { ...r, comment: { lic: "Licence deal pulled forward from Q1",
                per: "Two senior hires in sales", oth: "Minority share of the services unit" }[r.account] } : r))
            : MEGA_DEMO.statement("T03");
        v.update({ dataViews: [dvRows(data, objects)], viewport: { width: w, height: h }, type: 2 });
        window["__" + id] = stage;
    }, { id, w, h, scale, rows, objects });
    const state = (id) => page.evaluate((id) => {
        const box = document.getElementById(id);
        const head = box.querySelector('[data-pnl="head"]');
        const mh = box.querySelector('[data-pnl="mega-head-wrap"]');
        const fn = box.querySelector('[data-pnl="footnotes"]');
        const ft = box.querySelector('[data-pnl="footer"]');
        const root = head ? head.parentElement : null;
        return {
            headH: head ? head.offsetHeight : -1,
            stickyTop: mh ? parseFloat(mh.style.top) : NaN,
            headBottom: head ? head.getBoundingClientRect().bottom : NaN,
            megaTop: mh ? mh.getBoundingClientRect().top : NaN,
            rootBottom: root ? root.getBoundingClientRect().bottom : NaN,
            notesSticky: fn ? fn.getAttribute("data-pnl-sticky") === "1" : null,
            footerInNotes: !!(fn && ft && fn.contains(ft)),
            footerSpan: ft ? ft.style.columnSpan : "",
            scrollMax: root ? root.scrollHeight - root.clientHeight : 0,
        };
    }, id);
    const scroll = (id, y) => page.evaluate(({ id, y }) => {
        const head = document.getElementById(id).querySelector('[data-pnl="head"]');
        head.parentElement.scrollTop = y;
        head.parentElement.dispatchEvent(new Event("scroll"));
    }, { id, y });

    // 1 + 2 — T03A on a 1.5× stage, tile lower than the statement
    const T03 = { titleBlock: { unitLine: "Pharmaceutical Inc.", measureLine: "Profit after tax in kEUR", periodLine: "2026" },
        toolbar: { show: false }, hierarchy: { defaultLevel: 0 }, columns: { template: "T03A" } };
    await mount("s1", 900, 420, 1.5, "T03", T03);
    await page.waitForTimeout(500);
    let s = await state("s1");
    check("1 1.5× stage: sticky offset = head height in layout px", Math.abs(s.stickyTop - s.headH) <= 1,
        `top ${s.stickyTop} px, head ${s.headH} px`);
    check("1 the statement scrolls inside the tile", s.scrollMax > 40, `${s.scrollMax} px`);
    await scroll("s1", 80);
    await page.waitForTimeout(300);
    s = await state("s1");
    check("2 scrolled: column header directly under the head (screen px)", Math.abs(s.megaTop - s.headBottom) <= 2,
        `head bottom ${s.headBottom.toFixed(1)}, header top ${s.megaTop.toFixed(1)}`);
    await page.evaluate(() => window.__s1.remove());

    // 3 + 4 — 12A with three comments in a low tile (unscaled)
    const A12 = { titleBlock: { unitLine: "Software and Service Group", measureLine: "Profit and loss statement in kEUR",
        periodLine: "AC 2025, PY and ΔPY" }, toolbar: { show: false }, hierarchy: { defaultLevel: 0 }, columns: { template: "12A" } };
    await mount("s2", 1100, 260, 1, "12A", A12);
    await page.waitForTimeout(500);
    s = await state("s2");
    check("3 low tile: footnotes are not frozen over the rows", s.notesSticky === false, String(s.notesSticky));
    check("3 low tile: room for rows below head and column header", s.rootBottom - (s.megaTop + 20) > 60,
        `${(s.rootBottom - s.megaTop).toFixed(0)} px below the header`);
    await page.evaluate(() => window.__s2.remove());

    // 4 — the same comments in a mid-size tile: frozen footnotes, footer across all columns
    await mount("s3", 1400, 520, 1, "12A", A12);
    await page.waitForTimeout(500);
    s = await state("s3");
    if (s.footerInNotes) {
        check("4 footer inside the footnote block spans all columns", s.footerSpan === "all", s.footerSpan || "(none)");
    } else {
        notes.push("  -- 4 footer stays in flow at this size (nothing to check)");
    }

    check("no page errors", errors === 0, String(errors));
    await browser.close();
    console.log(notes.join("\n"));
    if (failures.length) {
        console.log("\nFAILED:\n  " + failures.join("\n  "));
        process.exit(1);
    }
    console.log(`\nstage-scale: ${notes.length} checks green`);
})();
