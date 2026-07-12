// renders test.html headless and writes render.png; fails on page errors
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1040, height: 3400 } });
    let errors = 0;
    page.on("console", m => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    await page.goto("file://" + __dirname + "/test.html");
    await page.waitForTimeout(600);
    await page.screenshot({ path: __dirname + "/render.png", fullPage: true });
    await browser.close();
    if (errors > 0) { console.error(errors + " render errors"); process.exit(1); }
    console.log("render ok — see test/render.png");
})();
