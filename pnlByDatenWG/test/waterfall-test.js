// render tests for the IBCS waterfall module (src/waterfall.ts).
// bundles the module as IIFE, renders test/waterfall-test.html headless and
// checks: no page/console errors, columns are drawn, connectors exist,
// scenario fill follows the notation, and no label leaves its svg viewBox.
const esbuild = require("esbuild");
const path = require("path");

let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const ROOT = path.join(__dirname, "..");
const BUNDLE = path.join(__dirname, ".tmp-waterfall.js");

esbuild.buildSync({
    entryPoints: [path.join(ROOT, "src/waterfall.ts")],
    bundle: true, format: "iife", globalName: "WF", outfile: BUNDLE,
    absWorkingDir: ROOT,
});
console.log("  ok · bundle");

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 900, height: 1800 } });
    const problems = [];
    page.on("console", m => { if (m.type() === "error") { problems.push("[console] " + m.text()); } });
    page.on("pageerror", e => { problems.push("[pageerror] " + e.message); });

    await page.goto("file://" + path.join(__dirname, "waterfall-test.html"));
    await page.waitForTimeout(400);

    const report = await page.evaluate(() => {
        const out = { cases: [], clipped: [], svgCount: document.querySelectorAll("svg").length };
        for (const c of window.__wfCases) {
            const svg = document.querySelector("#" + c.id + " svg");
            if (!svg) { out.cases.push({ id: c.id, missing: true }); continue; }
            out.cases.push({
                id: c.id,
                expected: c.bars,
                rects: svg.querySelectorAll(":scope > rect").length,
                lines: svg.querySelectorAll(":scope > line").length,
                texts: svg.querySelectorAll(":scope > text").length,
                titles: svg.querySelectorAll("title").length,
                fill: (svg.querySelector(":scope > rect") || {}).getAttribute
                    ? svg.querySelector(":scope > rect").getAttribute("fill") : null,
                patterns: svg.querySelectorAll("defs pattern").length,
                w: parseFloat(svg.getAttribute("width")),
                h: parseFloat(svg.getAttribute("height")),
            });
        }
        document.querySelectorAll("svg text").forEach(t => {
            const svg = t.ownerSVGElement;
            const b = t.getBBox();
            const w = parseFloat(svg.getAttribute("width"));
            const h = parseFloat(svg.getAttribute("height"));
            if (b.x < -0.5 || b.x + b.width > w + 0.5 || b.y < -0.5 || b.y + b.height > h + 0.5) {
                problemLabel(t, b, w, h);
            }
            function problemLabel(node, box, sw, sh) {
                out.clipped.push(`"${node.textContent}" box=${box.x.toFixed(1)},${box.y.toFixed(1)} ` +
                    `${box.width.toFixed(1)}×${box.height.toFixed(1)} svg=${sw}×${sh}`);
            }
        });
        return out;
    });

    await page.screenshot({ path: path.join(__dirname, "waterfall.png"), fullPage: true });
    await browser.close();

    const fail = msg => { problems.push(msg); };

    for (const c of report.cases) {
        if (c.missing) { fail(`${c.id}: no svg rendered`); continue; }
        if (c.rects !== c.expected) {
            fail(`${c.id}: ${c.rects} columns, expected ${c.expected}`);
        }
        if (c.expected > 0) {
            // zero line + (n-1) assisting lines
            if (c.lines !== c.expected) { fail(`${c.id}: ${c.lines} lines, expected ${c.expected}`); }
            if (c.texts < c.expected) { fail(`${c.id}: only ${c.texts} labels`); }
            if (c.titles < c.expected) { fail(`${c.id}: only ${c.titles} <title> tooltips`); }
        } else if (c.texts !== 1) {
            fail(`${c.id}: empty case must render exactly one hint text, got ${c.texts}`);
        }
    }

    const w1 = report.cases.find(c => c.id === "w1");
    const w2 = report.cases.find(c => c.id === "w2");
    if (w1 && w1.fill !== "#404040") { fail(`w1 (ac) fill is ${w1.fill}, expected solid #404040`); }
    if (w2 && !/^url\(#wf-hatch-2\)$/.test(w2.fill || "")) {
        fail(`w2 (fcfy) fill is ${w2.fill}, expected the hatch pattern`);
    }
    if (w2 && w2.patterns !== 1) { fail("w2: hatch <pattern> missing in defs"); }
    if (report.clipped.length > 0) {
        fail(report.clipped.length + " clipped svg labels:\n    " + report.clipped.slice(0, 6).join("\n    "));
    }

    if (problems.length > 0) {
        console.error("waterfall render FAILED:");
        for (const p of problems) { console.error("  ✗ " + p); }
        process.exit(1);
    }
    for (const c of report.cases) {
        console.log(`  ok · ${c.id} — ${c.rects} columns, ${c.lines} lines, ${c.texts} labels (${c.w}×${c.h})`);
    }
    console.log(`waterfall ok — ${report.svgCount} charts, see test/waterfall.png`);
})();
