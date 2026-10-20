// renders test.html headless, counts render errors and FAIL checks.
// The page is far taller than Chromium's screenshot limit, so a fullPage shot
// hangs; instead it writes render.png (first viewport) and, with
// SHOT=c3,c22 (stage ids), one PNG per stage: test/shot-<id>.png.
// Playwright is resolved from node_modules, NODE_PATH or the CI image.
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1400, height: 3400 } });
    let errors = 0, fails = 0, oks = 0;
    page.on("console", m => {
        const t = m.text();
        if (m.type() === "error") { errors++; if (t.startsWith("FAIL")) fails++; console.log("[console]", t); }
        else if (t.startsWith("ok ·")) oks++;
        else if (process.env.VERBOSE) console.log("[log]", t);
    });
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    await page.goto("file://" + __dirname + "/test.html");
    await page.waitForTimeout(600);
    await page.screenshot({ path: __dirname + "/render.png", timeout: 60000 });
    const ids = (process.env.SHOT || "").split(",").map(s => s.trim()).filter(Boolean);
    for (const id of ids) {
        const el = await page.$("#" + id);
        if (!el) { console.log("[shot] stage " + id + " fehlt"); continue; }
        await el.screenshot({ path: __dirname + "/shot-" + id + ".png", timeout: 60000 });
    }
    await browser.close();
    console.log(oks + " checks ok, " + fails + " FAIL, " + errors + " errors");
    if (errors > 0) { console.error(errors + " render errors"); process.exit(1); }
    console.log("render ok — see test/render.png");
})();
