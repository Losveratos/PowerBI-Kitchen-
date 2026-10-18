/* eslint-disable powerbi-visuals/non-literal-fs-path -- test tooling, paths are fixed under the repo */
// Start hub, pure parts (plain node): the switches a template writes, the tour
// cards, the mini-rendering objects, and their ties to the pane + resjson.
// Run: node test/hub-test.js  (part of npm test)
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, ".tmp-hub.cjs");
esbuild.buildSync({
    stdin: {
        contents: 'export * from "./src/hub"; export { MEGA_PRESETS } from "./src/megatable"; export { VisualFormattingSettingsModel } from "./src/settings";',
        resolveDir: ROOT, loader: "ts",
    },
    bundle: true, format: "cjs", platform: "node", outfile: OUT,
    alias: { "powerbi-visuals-api": path.join(__dirname, "pbi-shim.js") },
});
const M = require("./.tmp-hub.cjs");
const res = JSON.parse(fs.readFileSync(path.join(ROOT, "stringResources/en-US/resources.resjson"), "utf8"));

let n = 0;
const test = (name, fn) => { fn(); n++; console.log("  ok · " + name); };

test("every template writes exactly the switch set of the pre-1.3 inline code (name by name, preset by preset)", () => {
    for (const [tpl, p] of Object.entries(M.MEGA_PRESETS)) {
        const sw = M.templateSwitches(tpl);
        assert.deepStrictEqual(sw.cols, {
            minuend: p.min.toLowerCase(),
            showPY: p.showPY, showPL: p.showPL, showMinuend: p.showMin, valueCascade: p.valueCascade,
            dPyAbs: p.dPyAbs, dPyBar: p.dPyBar, dPyWaterfall: p.dPyWf, dPyPct: p.dPyPct, dPyPin: p.dPyPin,
            dPlAbs: p.dPlAbs, dPlBar: p.dPlBar, dPlWaterfall: p.dPlWf, dPlPct: p.dPlPct, dPlPin: p.dPlPin,
            secondBlock: p.secondBlock, structureSubtotals: p.structureSubtotals, showPctRows: p.showPctRows,
            thresholds: p.thresholds, scenarioMarks: p.scenarioMarks, chartLabels: p.chartLabels,
            capBars: p.capBars, sort: p.sort, sortBlock: p.sortBlock, blockKind: p.blockKind, leftBlockKind: "month",
        }, tpl);
        assert.deepStrictEqual(sw.nums, tpl === "off" ? {} : { decimals: p.decimals, pctDecimals: p.pctDecimals }, tpl + " numbers");
        assert.deepStrictEqual(sw.title, p.headline ? { headline: true } : {}, tpl + " headline");
    }
});

test("only 12G and 12H switch the headline on", () => {
    const on = Object.keys(M.MEGA_PRESETS).filter(t => M.templateSwitches(t).title.headline === true);
    assert.deepStrictEqual(on, ["12G", "12H"]);
});

test("the gallery lists the pane's templates in pane order (off first, then T01A … 12H)", () => {
    const items = new M.VisualFormattingSettingsModel().columnsCard.template.items.map(i => i.value);
    assert.deepStrictEqual(M.HUB_TEMPLATES, items);
    assert.strictEqual(M.HUB_TEMPLATES.length, 18);
});

test("the tour has seven cards with title + text in the language files, numbered 1..7", () => {
    assert.strictEqual(M.TOUR_CARDS.length, 7);
    M.TOUR_CARDS.forEach((c, i) => {
        assert.strictEqual(c.n, i + 1);
        assert.ok(res["UI_Tour" + c.n + "T"] && res["UI_Tour" + c.n + "X"], "card " + c.n);
        assert.ok(c.mini.w > 0 && c.mini.h > 0);
    });
    assert.deepStrictEqual(M.TOUR_CARDS.map(c => c.mini.view), ["table", "table", "tree", "bars", "waterfall", "tree", "table"]);
    assert.ok(M.TOUR_CARDS[5].mini.zoom && M.TOUR_CARDS[6].mini.dark);
});

test("mini objects: body only (no toolbar / title), template switches + templateApplied, dark follows the flag", () => {
    const o = M.miniObjects({ view: "table", tpl: "T04B", w: 1, h: 1 }, true);
    assert.strictEqual(o.toolbar.show, false);
    assert.strictEqual(o.titleBlock.show, false);
    assert.strictEqual(o.style.appearance, "dark");
    assert.strictEqual(o.columns.template, "T04B");
    assert.strictEqual(o.columns.templateApplied, "T04B");
    assert.strictEqual(o.columns.dPlWaterfall, true);
    assert.strictEqual(o.numbers.decimals, 2);
    const c = M.miniObjects({ view: "table", w: 1, h: 1 }, false);
    assert.deepStrictEqual(c.columns, {}, "the classic table keeps the pane defaults");
    assert.strictEqual(c.style.appearance, "light");
    const b = M.miniObjects({ view: "bars", bars: true, w: 1, h: 1 }, false);
    assert.strictEqual(b.columns.barOverlap, true);
    const t = M.miniObjects({ view: "tree", w: 1, h: 1 }, false);
    assert.strictEqual(t.columns.treeLevel, 4);
    assert.strictEqual(M.miniObjects({ view: "tree", zoom: "F_EBITDA", w: 1, h: 1 }, false).columns.treeLevel, undefined);
    const full = M.miniObjects({ view: "table", full: true, w: 1, h: 1 }, false);
    assert.strictEqual(full.toolbar.show, undefined, "the overlay's full demo keeps its toolbar and title");
});

test("templates that analyse FC are flagged (their preview carries a simulated forecast)", () => {
    const fc = M.HUB_TEMPLATES.filter(M.templateNeedsFc);
    assert.deepStrictEqual(fc, ["T02E", "T02F", "T03B", "T04D", "T04E"]);
});

test("the enum of emptyState.mode: hub first (the default), then demo · fields · message", () => {
    const m = new M.VisualFormattingSettingsModel().emptyStateCard.mode;
    assert.deepStrictEqual(m.items.map(i => i.value), ["hub", "demo", "fields", "message"]);
    assert.strictEqual(m.value.value, "hub");
    const caps = JSON.parse(fs.readFileSync(path.join(ROOT, "capabilities.json"), "utf8"));
    assert.deepStrictEqual(caps.objects.emptyState.properties.mode.type.enumeration.map(e => e.value), ["hub", "demo", "fields", "message"]);
});

fs.unlinkSync(OUT);
console.log("\n" + n + " start-hub unit checks passed");
