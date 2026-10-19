// runs test/scale.html headless (1.52 IBCS scaling geometry): prints the
// measurements, fails on FAIL checks or page errors. SHOT=1 writes test/scale.png
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    let errors = 0, oks = 0;
    page.on("console", m => {
        const t = m.text();
        if (m.type() === "error") { errors++; console.log(t); }
        else if (t.startsWith("ok ·")) { oks++; if (process.env.VERBOSE) { console.log(t); } }
        else if (t.startsWith("measure ·")) { console.log(t); }
    });
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    await page.goto("file://" + __dirname + "/scale.html");
    await page.waitForTimeout(300);
    if (process.env.SHOT) { await page.screenshot({ path: __dirname + "/scale.png", fullPage: true, timeout: 60000 }); }
    await browser.close();
    console.log(oks + " checks ok, " + errors + " errors");
    if (errors > 0) { process.exit(1); }
})();
