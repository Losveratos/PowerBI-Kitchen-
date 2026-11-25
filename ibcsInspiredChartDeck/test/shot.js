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
    // the harness renders 600+ stages; on a busy machine the load event takes > 30 s
    await page.goto("file://" + __dirname + "/test.html", { timeout: 180000 });
    await page.waitForTimeout(600);
    // 1.53 rowType tokens: the unknown-token note may only appear where a case
    // feeds deliberate typos/free texts — every other stage (sum/delta/pct and
    // known tokens) must stay silent
    const noteStages = await page.evaluate(() => [...document.querySelectorAll('[data-icd="rowtype-note"]')]
        .map(n => n.closest(".stage")?.id).filter(Boolean).sort().join(","));
    if (noteStages === "c253,c257") { oks++; }
    else { errors++; fails++; console.log("FAIL · rowType-Hinweis nur in c253/c257, gefunden in: " + (noteStages || "–")); }
    // 1.58 (Welle 1 review B1): pixel probe — the FC pin heads of c1040 (round) and c1041
    // (square), r = 2,5 on 24 columns, must show the hatch. The stage SVG is rasterised by
    // the browser at 4× (serialised into an <img>, drawn on a canvas); every FC head needs
    // dark pixels inside its inner area — an empty head reads as the plan notation
    for (const id of ["c1040", "c1041"]) {
        const res = await page.evaluate(async (id) => {
            const st = document.getElementById(id);
            const svg = st && st.querySelector('[data-pin="fc"]') && st.querySelector('[data-pin="fc"]').ownerSVGElement;
            if (!svg) { return null; }
            const S = 4, w = svg.width.baseVal.value || st.clientWidth, h = svg.height.baseVal.value || st.clientHeight;
            const c = svg.cloneNode(true);
            c.setAttribute("width", w * S); c.setAttribute("height", h * S); c.setAttribute("viewBox", `0 0 ${w} ${h}`);
            const img = new Image();
            img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(c));
            await img.decode();
            const cv = document.createElement("canvas"); cv.width = w * S; cv.height = h * S;
            const cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(img, 0, 0);
            const ctm = el => { const b = el.getBBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
            return [...svg.querySelectorAll('[data-pin="fc"]')].map(hd => {
                const half = hd.tagName === "circle" ? +hd.getAttribute("r") : +hd.getAttribute("width") / 2;
                const m = ctm(hd), ri = (half - 1.0) * S, mx = m.x * S, my = m.y * S;
                const x0 = Math.floor(mx - ri), y0 = Math.floor(my - ri), n = Math.ceil(2 * ri) + 1;
                const d = cx.getImageData(x0, y0, n, n).data;
                let dark = 0, all = 0;
                for (let y = 0; y < n; y++) {
                    for (let x = 0; x < n; x++) {
                        const dx = x0 + x + 0.5 - mx, dy = y0 + y + 0.5 - my;
                        if (Math.abs(dx) > ri || Math.abs(dy) > ri) { continue; }
                        if (hd.tagName === "circle" && dx * dx + dy * dy > ri * ri) { continue; }
                        const i = (y * n + x) * 4; all++;
                        if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] < 150) { dark++; }
                    }
                }
                return { dark, all };
            });
        }, id);
        const empty = (res || []).filter(p => p.dark < 3);
        if (res && res.length === 14 && empty.length === 0) { oks++; if (process.env.VERBOSE) { console.log("ok · Pixelprobe " + id); } }
        else { errors++; fails++; console.log(`FAIL · Pixelprobe ${id}: ${res ? res.length : 0} FC-Köpfe, leer ${empty.length} (${(res || []).map(p => p.dark + "/" + p.all).join(" ")})`); }
    }
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
