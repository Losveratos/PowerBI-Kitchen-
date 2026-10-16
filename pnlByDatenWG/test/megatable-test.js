// unit tests for the mega-table layout (src/megatable.ts) — plain node, no DOM:
// presets → toggles → columns, notation, number format, outlier cap, the scale
// solver, minimum data span, thresholds, sorting and the "(↓)" indicator
const esbuild = require("esbuild");
const path = require("path");
const assert = require("assert");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, ".tmp-megatable.cjs");
esbuild.buildSync({
    entryPoints: [path.join(ROOT, "src/megatable.ts")],
    bundle: true, format: "cjs", platform: "node", outfile: OUT,
});
const M = require("./.tmp-megatable.cjs");

let n = 0;
const test = (name, fn) => { fn(); n++; console.log("  ok · " + name); };

/** preset → MegaToggles (the same mapping Visual.megaToggles does from the pane) */
const toggles = (p) => ({
    min: p.min, showPY: p.showPY, showPL: p.showPL, showMin: p.showMin,
    d: {
        PY: { num: p.dPyAbs, bar: p.dPyBar, pct: p.dPyPct, pin: p.dPyPin },
        PL: { num: p.dPlAbs, bar: p.dPlBar, pct: p.dPlPct, pin: p.dPlPin },
    },
    thresholds: p.thresholds, marks: p.scenarioMarks, labels: p.chartLabels, capBars: p.capBars,
    sort: p.sort, sortBlock: p.sortBlock === "period" ? 0 : 1,
});
const num = (a, d) => a.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const measure = (t, fs, bold) => t.length * fs * (bold ? 0.6 : 0.55);

test("presets: T01–T04 only set toggles, 'off' switches the mega table off", () => {
    for (const k of ["T01A", "T01B", "T02A", "T02B", "T02C", "T02E", "T02F", "T03A", "T03B", "T04A"]) {
        assert.ok(M.megaActive(toggles(M.MEGA_PRESETS[k])), k + " is a mega table");
    }
    assert.equal(M.megaActive(toggles(M.MEGA_PRESETS.off)), false);
    assert.equal(M.MEGA_PRESETS.T01B.structureSubtotals, true);
    assert.equal(M.MEGA_PRESETS.T01A.structureSubtotals, false);
    assert.equal(M.MEGA_PRESETS.T03B.min, "FC");
    assert.equal(M.MEGA_PRESETS.T02E.min, "FC");
    assert.equal(M.MEGA_PRESETS.T02E.dPyBar && M.MEGA_PRESETS.T02E.dPyPin && !M.MEGA_PRESETS.T02E.dPlBar, true);
    assert.deepEqual([M.MEGA_PRESETS.T02B.sort, M.MEGA_PRESETS.T02B.sortBlock], ["min", "ytd"]);
    assert.deepEqual([M.MEGA_PRESETS.T02C.sort, M.MEGA_PRESETS.T02C.sortBlock], ["delta", "period"]);
    // derived Δ% decimals (SPEC "Zahlenformat"): T01 1 · T03 0 · T02/T04A pins 1
    assert.deepEqual([M.MEGA_PRESETS.T01A.decimals, M.MEGA_PRESETS.T01A.pctDecimals], [0, 1]);
    assert.deepEqual([M.MEGA_PRESETS.T03A.decimals, M.MEGA_PRESETS.T03A.pctDecimals], [1, 0]);
    assert.deepEqual([M.MEGA_PRESETS.T04A.decimals, M.MEGA_PRESETS.T04A.pctDecimals], [1, 1]);
});

test("columns from toggles: T03A one block, T01A two blocks with the label column in between", () => {
    const t3 = M.buildColumns(toggles(M.MEGA_PRESETS.T03A), 1);
    assert.deepEqual(t3.map(c => c.type + (c.scen || c.ref || "")),
        ["label", "valuePY", "valuePL", "valueAC", "deltaPY", "dpctPY", "deltaPL", "dpctPL"]);
    assert.deepEqual(t3.map(c => c.gap), ["none", "group", "col", "col", "group", "col", "group", "col"]);
    const t1 = M.buildColumns(toggles(M.MEGA_PRESETS.T01A), 2);
    assert.equal(t1.length, 15);
    assert.equal(t1[7].type, "label");
    assert.equal(t1[7].gap, "block");
    assert.equal(t1[8].gap, "block");
    const t2e = M.buildColumns(toggles(M.MEGA_PRESETS.T02E), 1);
    assert.deepEqual(t2e.map(c => c.type + (c.scen || c.ref || "")), ["label", "valuePY", "valueFC", "barPY", "pinPY"]);
});

test("notation: minuend fills, subtrahend axes, scenario marks", () => {
    const hatch = c => "url(#h" + c + ")";
    const acpl = M.notation("AC", "PL");
    assert.equal(acpl.axis, "double");
    assert.deepEqual(acpl.area("#0E8585", hatch), { fill: "#0E8585", stroke: null, sw: 0 });
    const fcpy = M.notation("FC", "PY");
    assert.equal(fcpy.axis, "gray");
    assert.deepEqual(fcpy.area("#E02B1D", hatch), { fill: "url(#h#E02B1D)", stroke: "#E02B1D", sw: 1 });
    assert.deepEqual(fcpy.head(hatch), { fill: "url(#h#404040)", stroke: "#404040", sw: 1 });
    assert.deepEqual(["AC", "PY", "PL", "FC"].map(acpl.mark), ["solid", "gray", "double", "hatch"]);
});

test("number format: explicit +, '-' minus, zero without a sign, %p and relative Δ%", () => {
    const f = M.megaFmt(num, 1, 0);
    assert.equal(f.delta(37.36), "+37.4");
    assert.equal(f.delta(-0.04), "0.0");
    assert.equal(f.val(1031.2), "1 031.2");
    assert.equal(f.pct(0.0662), "+7%");
    assert.equal(f.pin(-0.154), "-15");
    assert.equal(f.margin(0.4532), "45.3%");
    assert.equal(f.pp(8.62), "+8.6%p");
    assert.equal(f.rel(0.234), "+23");
});

test("outlier cap: Tukey fence Q3 + 4·IQR (12A ΔPY% pins: +983/+391 capped, +95 fits)", () => {
    const pins12A = [25.7, 25, -54.5, 983.3, -62.2, 10.2, 390.9, 67.1, -28.6, 94.9, 23.3, -9.6, -15.9, -38.2,
        30.5, 33.1, 11.3, 8.8, 20.6, 48.4];
    assert.equal(M.outlierCap(pins12A), 94.9);
    // T02A month ΔPL% (+16.5 is not an outlier): nothing capped
    const t02a = [-5.3, -19.4, -10.1, -6.8, -5.5, 6.2, -5.7, 9.4, -2.0, 11.0, -16.9, -4.6, -0.5, -1.9, -6.1, 13.2, -8.3, -17.6, -5.8, -2.6];
    assert.equal(M.outlierCap(t02a), Infinity);
    assert.equal(M.outlierCap([1, 2, 300]), Infinity, "fewer than 8 values never cap");
});

test("scale solver: largest k with left + right need ≤ width", () => {
    const k = M.solveK([{ p: 0, q: 0, a: 3, c: 3 }, { p: 0, q: 10, a: 0, c: 20 }], 123);
    assert.ok(Math.abs(k - 10) < 1e-6, String(k));
    const k2 = M.solveK([{ p: -50, q: 0, a: 30, c: 0 }, { p: 0, q: 25, a: 0, c: 30 }], 210);
    // (210 − 60) / 75 = 2
    assert.ok(Math.abs(k2 - 2) < 1e-6, String(k2));
    const [L, R] = M.megaNeeds([{ p: -50, q: 0, a: 30, c: 0 }, { p: 0, q: 25, a: 0, c: 30 }], 2);
    assert.deepEqual([L, R], [130, 80]);
});

/** a small structure table: two regions, month + YTD block */
function regionInput(over) {
    const rows = [
        { id: "a", label: "Austria", kind: "acc", op: "", level: 0, group: "eu", other: false },
        { id: "o", label: "Other", kind: "acc", op: "", level: 0, group: "eu", other: true },
        { id: "g", label: "Germany", kind: "acc", op: "", level: 0, group: "eu", other: false },
        { id: "eu", label: "Europe", kind: "sum", op: "", level: 0, group: null, other: false },
    ];
    const V = { // [PY, PL, AC] month | ytd
        a: [[500, 590, 559], [5078, 5611, 5509]], o: [[502, 498, 545], [5602, 6022, 5441]],
        g: [[345, 279, 260], [3124, 2815, 2850]], eu: [[1347, 1367, 1364], [13804, 14448, 13800]],
    };
    const IX = { PY: 0, PL: 1, AC: 2, FC: 2 };
    const block = (bi, name, th) => ({
        name, th,
        value: (r, s) => V[r.id][bi][IX[s]],
        delta: (r, min, ref) => {
            const a = V[r.id][bi][IX[min]]; const b = V[r.id][bi][IX[ref]];
            const d = a - b; const p = d / Math.abs(b);
            return { d, p, good: d >= 0, impact: d, impactPct: p, pp: false };
        },
    });
    return Object.assign({
        rows, statement: false, fs: 13, viewW: 1200, dec: 0, pdec: 1, num, measure,
        pal: { good: "#0E8585", bad: "#E02B1D" }, redIf: "Δ in red if:",
        blocks: [block(0, "November", { abs: -20, pct: -0.1 }), block(1, "_November", { abs: -220, pct: -0.1 })],
        t: toggles(M.MEGA_PRESETS.T01A),
    }, over || {});
}

test("layout T01A: thresholds turn Δ red (impact below), footer + block titles on", () => {
    const L = M.layoutMega(regionInput());
    assert.equal(L.style.thresholds, true);
    assert.equal(L.style.blockTitles, true);
    assert.equal(L.style.signs, false);
    const dPY0 = L.cols.find(c => c.type === "delta" && c.ref === "PY" && c.block === 0);
    const g = L.rows.find(r => r.id === "g");
    const a = L.rows.find(r => r.id === "a");
    assert.equal(L.cellText(dPY0, g).t, "-85");
    assert.equal(L.cellText(dPY0, g).color, "#E02B1D");
    assert.equal(L.cellText(dPY0, a).color, "#1A1A1A");
    const dPY1 = L.cols.find(c => c.type === "delta" && c.ref === "PY" && c.block === 1);
    assert.equal(L.cellText(dPY1, g).t, "-274");
    assert.equal(L.cellText(dPY1, g).color, "#E02B1D", "YTD threshold −220");
    const pct0 = L.cols.find(c => c.type === "dpct" && c.ref === "PY" && c.block === 0);
    assert.equal(L.cellText(pct0, g).t, "-24.6%");
    // sum rows bold, row y strictly increasing, spacer-free flat list
    assert.equal(L.cellText(dPY0, L.rows.find(r => r.id === "eu")).bold, true);
    assert.deepEqual(L.R.map(x => x.y - L.R[0].y), [0, 22, 44, 66]);
});

test("layout T02: Δ↓ sort per run keeps Other last, (↓) on the sorting block's first Δ head", () => {
    const t = Object.assign(toggles(M.MEGA_PRESETS.T02A), { sort: "delta", sortBlock: 0 });
    const L = M.layoutMega(regionInput({ t }));
    // ΔPL month: Germany −19 before Austria −31 (descending), Other (+47) stays last
    assert.deepEqual(L.rows.map(r => r.id), ["g", "a", "o", "eu"]);
    const heads = L.cols.map(c => c.head);
    assert.deepEqual(heads.filter(h => /↓/.test(h)), ["ΔPL(↓)"]);
    assert.equal(L.cols.find(c => c.head === "ΔPL(↓)").block, 0);
});

test("layout T02: one scale per block × family, shared by all its chart columns", () => {
    const t = Object.assign(toggles(M.MEGA_PRESETS.T02A), { d: { PY: { num: false, bar: true, pct: false, pin: true },
        PL: { num: false, bar: true, pct: false, pin: true } }, showPY: true });
    const L = M.layoutMega(regionInput({ t }));
    const bars0 = L.charts.filter(c => c.block === 0 && c.type === "bar");
    assert.equal(bars0.length, 2);
    assert.equal(bars0[0].k, bars0[1].k, "ΔPY and ΔPL bars of the month share k");
    const bars1 = L.charts.filter(c => c.block === 1 && c.type === "bar");
    assert.notEqual(bars0[0].k, bars1[0].k, "month and YTD have their own scale");
    assert.ok(L.famK["0:delta"] > 0 && L.famK["0:pct"] > 0 && L.famK["1:delta"] > 0);
    // the axis sits where the data needs it: every element fits inside its column
    for (const c of L.charts) {
        for (const e of c.els) {
            assert.ok(c.x0 + e.p * c.k - e.a >= c.x - 0.5 && c.x0 + e.q * c.k + e.c <= c.x + c.w + 0.5);
        }
    }
});

test("layout: minimum data span — a squeezed chart column grows instead of collapsing", () => {
    const t = toggles(M.MEGA_PRESETS.T02A);
    const L = M.layoutMega(regionInput({ t, viewW: 100 }));
    for (const c of L.charts) {
        const span = Math.max(...c.els.map(e => e.q)) - Math.min(...c.els.map(e => e.p));
        assert.ok(c.kSelf * span >= 39 - 1e-6, `${c.type}${c.block}: ${c.kSelf * span}`);
    }
    assert.ok(L.tableW > 100, "the table scrolls horizontally");
});

test("layout T03 statement: sign column, paired Δ head, closing marks only without charts", () => {
    const t = toggles(M.MEGA_PRESETS.T03A);
    const L = M.layoutMega(regionInput({ t, statement: true, blocks: regionInput().blocks.slice(0, 1) }));
    assert.equal(L.style.signs, true);
    assert.equal(L.style.pairHeader, true);
    assert.equal(L.style.closing, true);
    assert.equal(L.style.blockTitles, false);
    const L2 = M.layoutMega(regionInput({ t: toggles(M.MEGA_PRESETS.T04A), statement: true, blocks: regionInput().blocks.slice(0, 1) }));
    assert.equal(L2.style.closing, false);
    // marks off → no closing underline
    const L3 = M.layoutMega(regionInput({ t: Object.assign(t, { marks: false }), statement: true, blocks: regionInput().blocks.slice(0, 1) }));
    assert.equal(L3.style.closing, false);
});

console.log(`\n${n} mega-table layout test blocks passed`);
