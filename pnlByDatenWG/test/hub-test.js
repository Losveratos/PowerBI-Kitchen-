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

test("the gallery lists the pane's templates in pane order (off first, then T01A … 12H, 1.7 T05A · T05B)", () => {
    const items = new M.VisualFormattingSettingsModel().columnsCard.template.items.map(i => i.value);
    assert.deepStrictEqual(M.HUB_TEMPLATES, items);
    assert.strictEqual(M.HUB_TEMPLATES.length, 20);
    assert.deepStrictEqual(M.HUB_TEMPLATES.slice(-2), ["T05A", "T05B"]);
    // capabilities.json carries the same enumeration (the pane reads it, PBIR writes it)
    const capsT = JSON.parse(fs.readFileSync(path.join(ROOT, "capabilities.json"), "utf8"))
        .objects.columns.properties.template.type.enumeration.map(e => e.value);
    assert.deepStrictEqual(capsT, items);
});

test("1.7 stock templates: T05A sets every row a stock without tokens (auto with tokens), T05B auto, P&L templates take back allStock only", () => {
    const P = M.MEGA_PRESETS;
    // balance sheet: PY · AC · ΔPY · ΔPY%, one YTD block (the reporting date), no chart
    assert.ok(P.T05A.showPY && P.T05A.showMin && P.T05A.dPyAbs && P.T05A.dPyPct && !P.T05A.showPL && !P.T05A.valueCascade);
    assert.strictEqual(P.T05A.blockKind, "ytd"); assert.strictEqual(P.T05A.secondBlock, false);
    // cash flow: PY + AC value cascades (the bridge), ΔPY · ΔPY%, month | _YTD
    assert.ok(P.T05B.showPY && P.T05B.showMin && P.T05B.valueCascade && P.T05B.dPyAbs && P.T05B.dPyPct && P.T05B.secondBlock);
    assert.deepStrictEqual(M.templateSwitches("T05A").stmt, { stockMode: "allStock" });
    assert.deepStrictEqual(M.templateSwitches("T05A", true).stmt, { stockMode: "auto" }, "tokens decide");
    assert.deepStrictEqual(M.templateSwitches("T05B").stmt, { stockMode: "auto" });
    assert.deepStrictEqual(M.templateSwitches("T05B", false, "allStock").stmt, { stockMode: "auto" });
    for (const t of Object.keys(P).filter(x => !M.STOCK_TEMPLATES.includes(x))) {
        assert.deepStrictEqual(M.templateSwitches(t).stmt, {}, t + " leaves the mode alone");
        assert.deepStrictEqual(M.templateSwitches(t, false, "allFlow").stmt, {}, t + " keeps allFlow");
        assert.deepStrictEqual(M.templateSwitches(t, false, "allStock").stmt, { stockMode: "auto" }, t + " takes back allStock");
    }
    assert.strictEqual(M.templateDemo("T05A"), "bilanz");
    assert.strictEqual(M.templateDemo("T05B"), "cashflow");
    assert.strictEqual(M.templateDemo("T03A"), undefined);
    // the balance-sheet preview carries its stock mode, the cash flow's needs none (its example has tokens)
    assert.deepStrictEqual(M.miniObjects({ view: "table", tpl: "T05A", w: 1, h: 1 }, false).statement, { stockMode: "allStock" });
    assert.strictEqual(M.miniObjects({ view: "table", tpl: "T05B", w: 1, h: 1 }, false).statement, undefined);
    assert.strictEqual(M.miniObjects({ view: "table", tpl: "T04B", w: 1, h: 1 }, false).statement, undefined);
});

test("the tour has eight cards with title + text in the language files, numbered 1..8 (1.6: Sankey last)", () => {
    assert.strictEqual(M.TOUR_CARDS.length, 8);
    M.TOUR_CARDS.forEach((c, i) => {
        assert.strictEqual(c.n, i + 1);
        assert.ok(res["UI_Tour" + c.n + "T"] && res["UI_Tour" + c.n + "X"], "card " + c.n);
        assert.ok(c.mini.w > 0 && c.mini.h > 0);
    });
    assert.deepStrictEqual(M.TOUR_CARDS.map(c => c.mini.view), ["table", "table", "tree", "bars", "waterfall", "tree", "table", "sankey"]);
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

// ---- 1.4 hub polish ----
const caps = JSON.parse(fs.readFileSync(path.join(ROOT, "capabilities.json"), "utf8"));
const locs = ["de-DE", "en-US", "es-ES", "ja-JP"].map(l => JSON.parse(fs.readFileSync(path.join(ROOT, "stringResources", l, "resources.resjson"), "utf8")));

test("1.4 gallery: five purpose groups in the owner's order (1.7: balance sheet & cash flow), every template exactly once", () => {
    assert.deepStrictEqual(M.HUB_GALLERY.map(g => g.id), ["structure", "forecast", "statement", "balance", "report"]);
    const by = Object.fromEntries(M.HUB_GALLERY.map(g => [g.id, g.tiles.map(t => t.tpl)]));
    assert.deepStrictEqual(by.structure, ["T01A", "T01B", "T02A", "T02B", "T02C"]);
    assert.deepStrictEqual(by.forecast, ["T02E", "T02F", "T03B", "T04D", "T04E"]);
    assert.deepStrictEqual(by.statement, ["T03A", "T04A", "T04B", "T04C"]);
    assert.deepStrictEqual(by.balance, ["T05A", "T05B"]);
    assert.deepStrictEqual(by.report, ["12A", "12G", "12H", "off"]);
    const all = M.HUB_GALLERY.flatMap(g => g.tiles.map(t => t.tpl));
    assert.strictEqual(new Set(all).size, all.length, "no template twice");
    assert.deepStrictEqual(all.slice().sort(), M.HUB_TEMPLATES.slice().sort(), "the pane's templates, no more, no less");
});

test("1.4 gallery: every group head and every tile title + use line exists in all four languages (no T number in the title)", () => {
    for (const g of M.HUB_GALLERY) {
        for (const k of [g.title, g.sub, ...g.tiles.flatMap(t => [t.title, t.use])]) {
            for (const r of locs) { assert.ok(r[k] && r[k].trim(), k); }
        }
        for (const t of g.tiles) { assert.ok(!/\bT0\d[A-F]\b|\b12[AGH]\b/.test(res[t.title]), "finance title without code: " + t.title); }
    }
});

test("1.4 field guide: every data role of capabilities.json exactly once in four groups, names + sentences in the language files", () => {
    assert.deepStrictEqual(M.FIELD_GROUPS.map(g => g.id), ["required", "scenarios", "logic", "extras"]);
    const roles = M.FIELD_GROUPS.flatMap(g => g.roles.map(r => r.role));
    assert.strictEqual(new Set(roles).size, roles.length, "no role twice");
    assert.deepStrictEqual(roles.slice().sort(), caps.dataRoles.map(r => r.name).sort());
    assert.ok(roles.length >= 20, String(roles.length));
    for (const g of M.FIELD_GROUPS) {
        for (const r of locs) { assert.ok(r[g.title], g.title); }
        for (const x of g.roles) {
            const capRole = caps.dataRoles.find(c => c.name === x.role);
            assert.strictEqual(x.name, capRole.displayNameKey, x.role + ": the name of the field well");
            for (const r of locs) { assert.ok(r[x.name] && r[x.text], x.role); }
        }
    }
    // the scenario roles carry their IBCS chip
    const chips = Object.fromEntries(M.FIELD_GROUPS.flatMap(g => g.roles).filter(r => r.chip).map(r => [r.role, r.chip]));
    assert.deepStrictEqual(chips, { ac: "ac", py: "py", pl: "pl", fc: "fc" });
});

test("1.4 get started, step ①: level columns first, AC, then the recommended roles; a line ticks with any of its roles", () => {
    assert.deepStrictEqual(M.START_FIELD_STEPS.map(s => s.id), ["levels", "ac", "refs", "period", "logic"]);
    assert.deepStrictEqual(M.START_FIELD_STEPS.filter(s => s.required).map(s => s.id), ["levels", "ac"]);
    const none = M.startFieldTicks(() => false);
    assert.ok(Object.values(none).every(v => v === false));
    const t = M.startFieldTicks(r => ["account", "ac", "pl"].includes(r));
    assert.deepStrictEqual(t, { levels: true, ac: true, refs: true, period: false, logic: false }, "account ID counts as hierarchy, PL as reference");
    for (const s of M.START_FIELD_STEPS) { for (const r of locs) { assert.ok(r[s.text], s.text); } }
});

test("1.4 bottom bar: HD · Full HD · UHD in this order, the values of style.fontPreset", () => {
    assert.deepStrictEqual(M.FONT_PRESETS.map(p => p.label), ["HD", "Full HD", "UHD"]);
    const items = new M.VisualFormattingSettingsModel().styleCard.fontPreset.items.map(i => i.value);
    assert.deepStrictEqual(M.FONT_PRESETS.map(p => p.value), items);
});

test("1.4 docs: German locales open pnl-doku.html, every other locale the English page", () => {
    assert.strictEqual(M.docsUrl("de-DE"), "https://datenwgknowledgekitchen.com/pnl-doku.html");
    assert.strictEqual(M.docsUrl("de-AT"), "https://datenwgknowledgekitchen.com/pnl-doku.html");
    for (const l of ["en-US", "es-ES", "ja-JP", "", "dea"]) {
        assert.strictEqual(M.docsUrl(l), "https://datenwgknowledgekitchen.com/pnl-doku_en.html", l);
    }
    // the pages exist next to the visual (the site root of the repository)
    for (const f of ["pnl-doku.html", "pnl-doku_en.html"]) { assert.ok(fs.existsSync(path.join(ROOT, "..", f)), f); }
});

fs.unlinkSync(OUT);
console.log("\n" + n + " start-hub unit checks passed");
