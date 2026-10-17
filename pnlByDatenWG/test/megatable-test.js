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
const OUT_WF = path.join(__dirname, ".tmp-waterfall.cjs");
esbuild.buildSync({
    entryPoints: [path.join(ROOT, "src/waterfall.ts")],
    bundle: true, format: "cjs", platform: "node", outfile: OUT_WF,
});
const WF = require("./.tmp-waterfall.cjs");

let n = 0;
const test = (name, fn) => { fn(); n++; console.log("  ok · " + name); };

/** preset → MegaToggles (the same mapping Visual.megaToggles does from the pane) */
const toggles = (p) => ({
    min: p.min, showPY: p.showPY, showPL: p.showPL, showMin: p.showMin, valueCascade: p.valueCascade,
    d: {
        PY: { num: p.dPyAbs, bar: p.dPyBar, wf: p.dPyWf, pct: p.dPyPct, pin: p.dPyPin },
        PL: { num: p.dPlAbs, bar: p.dPlBar, wf: p.dPlWf, pct: p.dPlPct, pin: p.dPlPin },
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
    // margin rows: the relative change carries its % sign (T03A "+23%"), %p is the point difference
    assert.equal(f.rel(0.234), "+23%");
    assert.equal(f.share(0.4532), "45%");
});

test("threshold footer decimals: the value as the author typed it (−20.5 stays −20.5)", () => {
    assert.equal(M.megaDecimals(-20), 0);
    assert.equal(M.megaDecimals(-20.5), 1);
    assert.equal(M.megaDecimals(-0.105 * 100), 1, "−10.5 % via the fraction");
    assert.equal(M.megaDecimals(-12.25), 2);
    const f = M.megaFmt(num, 0, 1);
    assert.equal(f.signed(-20.5, M.megaDecimals(-20.5), false), "-20.5");
    assert.equal(f.signed(-220, M.megaDecimals(-220), false), "-220");
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

// ============================================================================
// Phase 3 — integrated Δ waterfall (T04B–E), value cascade (12A), cascade()
// ============================================================================

test("presets T04B–E / 12A: waterfall + pins, value cascades, decimals like the prototype", () => {
    const P = M.MEGA_PRESETS;
    for (const k of ["T04B", "T04C", "T04D", "T04E", "12A"]) { assert.ok(M.megaActive(toggles(P[k])), k); }
    assert.deepEqual([P.T04B.dPlWf, P.T04B.dPlBar, P.T04B.dPlPin, P.T04B.showPY, P.T04B.min], [true, false, true, false, "AC"]);
    assert.deepEqual([P.T04C.dPyWf, P.T04C.dPyPin, P.T04C.dPlWf, P.T04C.dPlPin, P.T04C.showPY, P.T04C.showPL], [true, true, false, false, true, false]);
    assert.deepEqual([P.T04D.min, P.T04D.dPlWf], ["FC", true]);
    assert.deepEqual([P.T04E.min, P.T04E.dPyWf], ["FC", true]);
    for (const k of ["T04B", "T04C", "T04D", "T04E"]) {
        assert.deepEqual([P[k].decimals, P[k].pctDecimals, P[k].showPctRows], [2, 2, true], k);
    }
    assert.deepEqual([P["12A"].valueCascade, P["12A"].showPY, P["12A"].showPL, P["12A"].showMin, P["12A"].dPyBar,
        P["12A"].dPyPin, P["12A"].showPctRows, P["12A"].decimals, P["12A"].pctDecimals],
    [true, true, false, true, true, true, false, 0, 0]);
    // nothing of phase 3 leaks into the phase-1/2 presets
    for (const k of ["off", "T01A", "T01B", "T02A", "T02B", "T02C", "T02E", "T02F", "T03A", "T03B", "T04A"]) {
        assert.deepEqual([P[k].valueCascade, P[k].dPyWf, P[k].dPlWf], [false, false, false], k);
    }
});

test("columns: Δ waterfall after the bar in its Δ group, value cascades one group per scenario", () => {
    const t4 = M.buildColumns(toggles(M.MEGA_PRESETS.T04B), 1);
    assert.deepEqual(t4.map(c => c.type + (c.scen || c.ref || "")), ["label", "valuePL", "valueAC", "wfPL", "pinPL"]);
    const both = M.buildColumns(Object.assign(toggles(M.MEGA_PRESETS.T04A), {
        d: { PY: { num: false, bar: false, wf: false, pct: false, pin: false }, PL: { num: true, bar: true, wf: true, pct: false, pin: true } },
    }), 1);
    assert.deepEqual(both.map(c => c.type).slice(3), ["delta", "bar", "wf", "pin"]);
    const a12 = M.buildColumns(toggles(M.MEGA_PRESETS["12A"]), 1);
    assert.deepEqual(a12.map(c => c.type + (c.scen || c.ref || "")), ["label", "vwfPY", "vwfAC", "barPY", "pinPY"]);
    assert.deepEqual(a12.map(c => c.gap), ["none", "group", "group", "group", "col"]);
    assert.deepEqual(M.activeRefs(toggles(M.MEGA_PRESETS.T04C)), ["PY"]);
});

test("notation: value cascade per scenario, cost rows light (12A)", () => {
    const hatch = c => "url(#h" + c + ")";
    const N = M.notation("AC", "PY");
    assert.deepEqual(N.value("PY", false, hatch), { fill: "#B3B3B3", stroke: null, sw: 0 });
    assert.deepEqual(N.value("PY", true, hatch), { fill: "#D9D9D9", stroke: null, sw: 0 });
    assert.deepEqual(N.value("AC", false, hatch), { fill: "#404040", stroke: null, sw: 0 });
    assert.deepEqual(N.value("AC", true, hatch), { fill: "#8A8886", stroke: null, sw: 0 });
    assert.deepEqual(N.value("FC", false, hatch), { fill: "url(#h#404040)", stroke: "#404040", sw: 1 });
    // 1.1 Paket C (12H): the cost rows of the outlined PL cascade sit on a pale ground
    assert.deepEqual(N.value("PL", true, hatch), { fill: "#F2F2F2", stroke: "#404040", sw: 1 });
    assert.deepEqual(N.value("PL", false, hatch), { fill: "#FFFFFF", stroke: "#404040", sw: 1 });
});

/**
 * The row-waterfall view's cascade BEFORE the extraction (visual.ts
 * cascadeSegments, verbatim) — cascade(…, "value") must reproduce it exactly.
 */
function legacyCascadeSegments(roots, read) {
    const segs = new Map();
    const walkChildren = (node, start) => {
        let cum = start;
        for (const c of node.children) {
            const t = c.row.rowType;
            if (t === "kpi" || t === "separator") { continue; }
            const v = read(c);
            if (t === "formula") { continue; }
            if (v == null) { continue; }
            segs.set(c.row.id, { s: cum, e: cum + v });
            walkChildren(c, cum);
            cum += v;
        }
    };
    let rootCum = 0;
    for (const r of roots) {
        const t = r.row.rowType;
        if (t === "kpi" || t === "separator") { continue; }
        const v = read(r);
        if (v == null) { continue; }
        if (t === "formula") { segs.set(r.row.id, { s: 0, e: v }); walkChildren(r, 0); rootCum = v; }
        else { segs.set(r.row.id, { s: rootCum, e: rootCum + v }); walkChildren(r, rootCum); rootCum += v; }
    }
    return segs;
}
/** the new visual.ts cascadeSegments: tree → cascade(…, "value") */
function sharedCascadeSegments(roots, read) {
    const node = (n, root) => {
        const t = n.row.rowType;
        const skip = t === "kpi" || t === "separator" || (!root && t === "formula");
        return { id: n.row.id, value: skip ? null : read(n), anchor: root && t === "formula",
            children: skip ? [] : n.children.map(c => node(c, false)) };
    };
    return WF.cascade(roots.map(r => node(r, true)), "value");
}

test("cascade() parity: the row waterfall view's segments are unchanged (5 000 random trees)", () => {
    let seed = 7;
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    const TYPES = ["account", "account", "subtotal", "formula", "kpi", "separator"];
    let id = 0; let compared = 0;
    const mk = (depth) => {
        const n = { row: { id: "n" + (id++), rowType: TYPES[Math.floor(rnd() * TYPES.length)] }, children: [],
            v: rnd() < 0.1 ? null : Math.round((rnd() * 2 - 1) * 1e4) / 100 };
        const k = depth < 3 ? Math.floor(rnd() * 4) : 0;
        for (let i = 0; i < k; i++) { n.children.push(mk(depth + 1)); }
        return n;
    };
    for (let i = 0; i < 5000; i++) {
        const roots = Array.from({ length: 1 + Math.floor(rnd() * 8) }, () => mk(0));
        const read = n => n.v;
        const a = legacyCascadeSegments(roots, read); const b = sharedCascadeSegments(roots, read);
        assert.equal(b.size, a.size);
        for (const [k, v] of a) {
            const w = b.get(k);
            assert.ok(w && w.s === v.s && w.e === v.e, `${k}: ${JSON.stringify(v)} vs ${JSON.stringify(w)}`);
            compared++;
        }
    }
    assert.ok(compared > 20000, String(compared));
});

/** the T04 statement as mega rows (children first, total below) with eff / anchor */
function statementInput(over) {
    const R = (id, label, kind, op, group, eff, anchor, level) => ({ id, label, kind, op, level: level || 0, group, other: false, eff, anchor });
    const rows = [
        R("lic", "Licences", "acc", "+", "sales", 1), R("con", "Consulting", "acc", "+", "sales", 1),
        R("mai", "Maintenance", "acc", "+", "sales", 1), R("orev", "Other revenue", "acc", "+", "sales", 1),
        R("sales", "Sales revenue", "sum", "=", null, 1, true),
        { id: "", label: "", kind: "gap", op: "", level: 0, group: null, other: false },
        R("ooi", "Other op. income", "acc", "+", null, 1),
        R("pur", "Purchases", "acc", "", "opex", -1, false, 1), R("mat", "Material expenses", "acc", "", "opex", -1, false, 1),
        R("per", "Personnel expenses", "acc", "", "opex", -1, false, 1), R("amo", "Amortization", "acc", "", "opex", -1, false, 1),
        R("oox", "Other op. expenses", "acc", "", "opex", -1, false, 1),
        R("opex", "Operating expenses", "sum", "-", null, -1),
        R("opres", "Operating result", "formula", "=", null, 1, true),
        { id: "gm", label: "Gross margin", kind: "pct", op: "", level: 0, group: null, other: false },
        { id: "", label: "", kind: "gap", op: "", level: 0, group: null, other: false },
        R("inv", "Investment income", "acc", "+", null, 1), R("fin", "Financial income, net", "acc", "+", null, 1),
        R("rbt", "Result before tax", "formula", "=", null, 1, true),
        { id: "", label: "", kind: "gap", op: "", level: 0, group: null, other: false },
        R("tax", "Income tax", "acc", "-", null, -1), R("rat", "Result after tax", "formula", "=", null, 1, true),
        { id: "", label: "", kind: "gap", op: "", level: 0, group: null, other: false },
        R("oth", "Profit to other investors", "acc", "-", null, -1), R("grp", "Group result", "formula", "=", null, 1, true),
    ];
    // displayed values (costs positive) — T04 sheet
    const IDS = ["lic", "con", "mai", "orev", "ooi", "pur", "mat", "per", "amo", "oox", "inv", "fin", "tax", "oth"];
    const SRC = {
        PY: [751.30, 76.45, 22.01, 55.70, 45.02, 603.58, 48.66, 76.03, 56.02, 78.03, 43.02, 73.03, 132.06, 50.00],
        PL: [748.97, 75.63, 22.01, 62.77, 40.54, 589.45, 55.89, 79.83, 56.02, 76.00, 44.68, 66.00, 127.79, 52.00],
        AC: [745.89, 80.11, 27.57, 65.03, 49.68, 600.57, 54.02, 85.62, 47.46, 79.67, 53.02, 66.03, 135.31, 55.02],
    };
    const V = {};
    for (const s of Object.keys(SRC)) {
        const v = {}; IDS.forEach((id, i) => { v[id] = SRC[s][i]; });
        v.sales = v.lic + v.con + v.mai + v.orev;
        v.opex = v.pur + v.mat + v.per + v.amo + v.oox;
        v.opres = v.sales + v.ooi - v.opex; v.rbt = v.opres + v.inv + v.fin;
        v.rat = v.rbt - v.tax; v.grp = v.rat - v.oth; v.gm = v.opres / v.sales;
        V[s] = v;
    }
    const cost = new Set(["pur", "mat", "per", "amo", "oox", "opex", "tax", "oth"]);
    const block = {
        name: "2026", th: { abs: -20, pct: -0.1 },
        value: (r, s) => V[s][r.id] ?? null,
        delta: (r, min, ref) => {
            const a = V[min][r.id]; const b = V[ref][r.id];
            if (a == null || b == null) { return null; }
            if (r.kind === "pct") { return { d: (a - b) * 100, p: a / b - 1, good: a >= b, impact: (a - b) * 100, impactPct: a / b - 1, pp: true }; }
            const d = a - b; const good = cost.has(r.id) ? d <= 0 : d >= 0;
            return { d, p: d / Math.abs(b), good, impact: cost.has(r.id) ? -d : d, impactPct: (cost.has(r.id) ? -d : d) / Math.abs(b), pp: false };
        },
    };
    return Object.assign({
        rows, statement: true, fs: 13, viewW: 1320, dec: 2, pdec: 2, num, measure,
        pal: { good: "#0E8585", bad: "#E02B1D" }, redIf: "Δ in red if:",
        blocks: [block], t: toggles(M.MEGA_PRESETS.T04B),
    }, over || {});
}

test("Δ waterfall T04B: steps on the run, = rows from zero, totals span their children", () => {
    const L = M.layoutMega(statementInput());
    const wf = L.charts.find(c => c.type === "wf");
    const seg = id => wf.casc.get(id);
    const close = (a, b) => Math.abs(a - b) < 1e-9;
    // Licences −3.08 from 0, Consulting +4.48 on top …
    assert.ok(close(seg("lic").s, 0) && close(seg("lic").e, -3.08));
    assert.ok(close(seg("con").s, -3.08) && close(seg("con").e, 1.40));
    // = Sales revenue restarts from the zero line
    assert.equal(seg("sales").type, "anchor");
    assert.ok(close(seg("sales").s, 0) && close(seg("sales").e, 9.22), JSON.stringify(seg("sales")));
    assert.ok(close(seg("ooi").s, 9.22) && close(seg("ooi").e, 18.36));
    // costs: Purchases +11.12 (shown) steps −11.12 on the result
    assert.ok(close(seg("pur").s, 18.36) && close(seg("pur").e, 7.24));
    // − Operating expenses spans from before Purchases to after Other op. expenses
    assert.equal(seg("opex").type, "span");
    assert.ok(close(seg("opex").s, 18.36) && close(seg("opex").e, 18.36 - 10.15), JSON.stringify(seg("opex")));
    assert.ok(close(seg("opres").e, 8.21) && seg("opres").type === "anchor");
    assert.ok(close(seg("grp").e, 6.04));
    assert.equal(wf.casc.has("gm"), false, "margin rows carry no segment");
    // the waterfall shares the Δ family scale; labels: the raw Δ of the row
    assert.ok(L.famK["0:delta"] > 0 && L.famK["0:pct"] > 0);
    for (const c of L.charts) {
        for (const e of c.els) {
            assert.ok(c.x0 + e.p * c.k - e.a >= c.x - 0.5 && c.x0 + e.q * c.k + e.c <= c.x + c.w + 0.5, c.type);
        }
    }
    // width weights: waterfall 1.2 × the pin column (both inside the clamp)
    const pin = L.charts.find(c => c.type === "pin");
    assert.ok(Math.abs(wf.w / pin.w - 1.2) < 0.02 || wf.w === Math.round(13 * 22), `${wf.w} / ${pin.w}`);
    assert.equal(L.style.closing, false);
    assert.equal(L.style.rowRules, true);
});

test("Δ waterfall T04C (vs PY) and bars side by side share one Δ scale", () => {
    const t = Object.assign(toggles(M.MEGA_PRESETS.T04C), {});
    t.d.PY.bar = true;
    const L = M.layoutMega(statementInput({ t }));
    const bar = L.charts.find(c => c.type === "bar"); const wf = L.charts.find(c => c.type === "wf");
    assert.equal(bar.k, wf.k);
    assert.ok(Math.abs(wf.casc.get("grp").e - (29.66 - 22.15)) < 1e-9);
});

test("value cascade 12A: one scale for all scenarios (family valueCascade), weight 1.5, 12A style", () => {
    const t = toggles(M.MEGA_PRESETS["12A"]);
    const L = M.layoutMega(statementInput({ t, dec: 0, pdec: 0 }));
    const v = L.charts.filter(c => c.type === "vwf");
    assert.equal(v.length, 2);
    assert.ok(L.famK["0:valueCascade"] > 0);
    assert.equal(v[0].k, v[1].k);
    assert.notEqual(v[0].k, L.famK["0:delta"]);
    // PY: Sales revenue anchor 905.46, Operating expenses spans down by 862.32
    const py = v.find(c => c.scen === "PY").casc;
    assert.equal(py.get("sales").type, "anchor");
    assert.ok(Math.abs(py.get("sales").e - 905.46) < 1e-9);
    assert.ok(Math.abs(py.get("opex").s - (905.46 + 45.02)) < 1e-9 && Math.abs(py.get("opex").e - (905.46 + 45.02 - 862.32)) < 1e-9);
    assert.ok(Math.abs(py.get("grp").e - 22.15) < 1e-9);
    const bar = L.charts.find(c => c.type === "bar");
    assert.ok(Math.abs(v[0].w / bar.w - 1.5) < 0.02 || v[0].w === 13 * 28 || v[0].w === 13 * 7, `${v[0].w} / ${bar.w}`);
    assert.deepEqual([L.style.rowRules, L.style.continuousSumRules, L.style.headerRules], [false, true, false]);
    assert.deepEqual(L.cols.map(c => c.head), ["", "PY", "AC", "ΔPY", "ΔPY%"]);
});

test("megaCascade: a folded total (no child row shown) is a plain step; structure grand total anchors", () => {
    const rows = [
        { id: "a", kind: "acc", group: "eu", eff: 1 }, { id: "b", kind: "acc", group: "eu", eff: 1 },
        { id: "eu", kind: "sum", group: "w", eff: 1 }, { id: "am", kind: "sum", group: "w", eff: 1 },
        { id: "w", kind: "sum", group: null, eff: 1, anchor: true },
    ];
    const V = { a: 5, b: -2, eu: 3, am: 4, w: 7 };
    const m = M.megaCascade(rows, r => V[r.id]);
    assert.deepEqual(m.get("eu"), { s: 0, e: 3, type: "span" });
    assert.deepEqual(m.get("am"), { s: 3, e: 7, type: "step" });
    assert.deepEqual(m.get("w"), { s: 0, e: 7, type: "anchor" });
});


// ============================================================================
// 1.1 package A — conformity fixes
// ============================================================================

test("head font (style.headerFontSize): default keeps fs / rowH, a larger head grows head rows + widths", () => {
    const L0 = M.layoutMega(regionInput());
    assert.deepEqual([L0.headFs, L0.headRowH, L0.colHeadY, L0.markY], [13, 22, 24, 46]);
    const L1 = M.layoutMega(regionInput({ headFs: 26 }));
    assert.equal(L1.headFs, 26);
    assert.equal(L1.headRowH, 44);
    assert.equal(L1.markY, L1.colHeadY + 44);
    assert.equal(L1.colHeadY, 2 + 44, "the block title row grows too");
    const w = (L, h) => L.cols.find(c => c.head === h && c.block === 0).w;
    assert.ok(w(L1, "ΔPY%") >= measure("ΔPY%", 26) + 2 * 5, "number heads are measured in the head font");
    // the body (rows, numbers) stays as it was
    assert.deepEqual(L1.R.map(x => x.y - L1.R[0].y), L0.R.map(x => x.y - L0.R[0].y));
    const L2 = M.layoutMega(regionInput({ headFs: 10 }));
    assert.equal(L2.headRowH, 22, "a smaller head font never shrinks the head row");
});

test("sort indicator: on the sorting column, on the category head when that column is off", () => {
    // Δ↓ by ΔPL, ΔPL bars off (only pins): order unchanged, indicator names the key
    const t = Object.assign(toggles(M.MEGA_PRESETS.T02A), { sort: "delta", sortBlock: 0 });
    const on = M.layoutMega(regionInput({ t }));
    t.d = { PY: t.d.PY, PL: Object.assign({}, t.d.PL, { bar: false }) };
    const off = M.layoutMega(regionInput({ t }));
    assert.deepEqual(off.rows.map(r => r.id), on.rows.map(r => r.id), "the author's sort stays");
    assert.deepEqual(off.cols.map(c => c.head).filter(h => /↓/.test(h)), ["(↓) ΔPL November"]);
    const lab = off.cols.find(c => c.type === "label");
    assert.ok(lab.w >= measure("(↓) ΔPL November", 13) + 2 * 5, "the category column fits the indicator");
    // AC↓ on the YTD block with the AC value column switched off
    const t2 = Object.assign(toggles(M.MEGA_PRESETS.T02B), { showMin: false });
    const L2 = M.layoutMega(regionInput({ t: t2 }));
    assert.deepEqual(L2.cols.map(c => c.head).filter(h => /↓/.test(h)), ["(↓) AC _November"]);
    // the visible sorting column keeps the plain "(↓)" (T02B / T02C unchanged)
    const L3 = M.layoutMega(regionInput({ t: toggles(M.MEGA_PRESETS.T02B) }));
    assert.deepEqual(L3.cols.map(c => c.head).filter(h => /↓/.test(h)), ["AC(↓)"]);
});

/** one block where the ΔPL bars are `ratio` × the ΔPY bars — two bar columns of one Δ family */
function familyInput(ratio, viewW) {
    const base = { a: 1, o: -2, g: 3, eu: 0.5 };
    const block = {
        name: "November", th: { abs: -20, pct: -0.1 },
        value: () => 100,
        delta: (r, min, ref) => {
            const d = base[r.id] * (ref === "PL" ? ratio : 1);
            return { d, p: d / 100, good: d >= 0, impact: d, impactPct: d / 100, pp: false };
        },
    };
    const t = Object.assign(toggles(M.MEGA_PRESETS.T02A), { showPY: false, showPL: false, showMin: false,
        d: { PY: { num: false, bar: true, wf: false, pct: false, pin: false }, PL: { num: false, bar: true, wf: false, pct: false, pin: false } } });
    return regionInput({ t, blocks: [block], viewW });
}
const dataSpan = c => (Math.max(...c.els.map(e => e.q)) - Math.min(...c.els.map(e => e.p))) * c.k;

test("minimum data span holds at the SHARED family scale (ΔPY bars next to 3× larger ΔPL bars)", () => {
    const L = M.layoutMega(familyInput(3, 200));
    const [py, pl] = L.charts;
    assert.equal(py.k, pl.k, "one Δ scale for the block");
    assert.ok(dataSpan(py) >= 39 - 1e-6, "ΔPY data span " + dataSpan(py));
    assert.ok(dataSpan(pl) >= 39 - 1e-6);
    // the binding ΔPL column grew instead of squeezing the ΔPY bars
    for (const c of L.charts) {
        for (const e of c.els) { assert.ok(c.x0 + e.p * c.k - e.a >= c.x - 0.5 && c.x0 + e.q * c.k + e.c <= c.x + c.w + 0.5); }
    }
});

test("minimum data span at the family scale stops at the column width limit (one scale wins)", () => {
    const L = M.layoutMega(familyInput(200, 200));
    const [py, pl] = L.charts;
    assert.equal(py.k, pl.k);
    assert.ok(pl.w <= 13 * 22 + 1, "ΔPL grows at most to chartMax: " + pl.w);
    assert.ok(dataSpan(pl) >= 39 - 1e-6);
    assert.ok(dataSpan(py) < 39, "tiny ΔPY bars stay short next to 200× larger ones");
    // without a family partner nothing changes: one column keeps its own k
    const one = M.layoutMega(Object.assign(familyInput(3, 200), {}));
    assert.ok(one.charts.every(c => c.k > 0));
});

test("% of revenue column: right of the value columns, small italic soft numbers, none on margin rows", () => {
    const t = Object.assign(toggles(M.MEGA_PRESETS.T03A), { share: true });
    const cols = M.buildColumns(t, 1);
    assert.deepEqual(cols.map(c => c.type + (c.scen || c.ref || "")),
        ["label", "valuePY", "valuePL", "valueAC", "share", "deltaPY", "dpctPY", "deltaPL", "dpctPL"]);
    assert.equal(cols[4].gap, "col");
    const inp = statementInput({ t, shareHead: "% Rev" });
    inp.blocks = [Object.assign({}, inp.blocks[0], { share: r => r.id === "sales" ? 1 : r.id === "pur" ? 0.6531 : null })];
    const L = M.layoutMega(Object.assign(inp, { pdec: 1 }));
    const sc = L.cols.find(c => c.type === "share");
    assert.equal(sc.head, "% Rev");
    const pur = L.cellText(sc, L.rows.find(r => r.id === "pur"));
    assert.deepEqual([pur.t, pur.italic, pur.fs, pur.color], ["65.3%", true, L.G.fsSmall, "#8A8886"]);
    assert.equal(L.cellText(sc, L.rows.find(r => r.id === "sales")).bold, true);
    assert.equal(L.cellText(sc, L.rows.find(r => r.id === "gm")), null, "no share on margin rows");
    // default off: no share column
    assert.ok(!M.buildColumns(toggles(M.MEGA_PRESETS.T03A), 1).some(c => c.type === "share"));
    // value cascade: the share column becomes its own group
    const c12 = M.buildColumns(Object.assign(toggles(M.MEGA_PRESETS["12A"]), { share: true }), 1);
    assert.deepEqual(c12.map(c => c.type), ["label", "vwf", "vwf", "share", "bar", "pin"]);
});

test("FY / month blocks: alias heads (AC&FC) and a titled single statement block", () => {
    const t = toggles(M.MEGA_PRESETS.T03A);
    const inp = statementInput({ t });
    inp.blocks = [Object.assign({}, inp.blocks[0], { name: "FY 2026", titled: true, alias: { AC: "AC&FC", FC: "FC" } })];
    const L = M.layoutMega(inp);
    assert.equal(L.style.blockTitles, true);
    assert.deepEqual(L.cols.map(c => c.head).slice(1, 4), ["PY", "PL", "AC&FC"]);
    // an untitled single statement block keeps the T03 look (no block title)
    assert.equal(M.layoutMega(statementInput({ t })).style.blockTitles, false);
});

test("high contrast: palette → host fg / bg, red threshold numbers underlined", () => {
    M.setMegaPalette(false, undefined, { fg: "#FFFF00", bg: "#000000" });
    try {
        assert.deepEqual([M.MEGA_C.ink, M.MEGA_C.py, M.MEGA_C.rule, M.MEGA_C.text, M.MEGA_C.white],
            ["#FFFF00", "#FFFF00", "#FFFF00", "#FFFF00", "#000000"]);
        const L = M.layoutMega(regionInput({ hc: true, pal: { good: "#FFFF00", bad: "#FFFF00" } }));
        const d = L.cols.find(c => c.type === "delta" && c.ref === "PY" && c.block === 0);
        const g = L.cellText(d, L.rows.find(r => r.id === "g"));
        assert.deepEqual([g.t, g.color, g.underline], ["-85", "#FFFF00", true]);
        assert.equal(L.cellText(d, L.rows.find(r => r.id === "a")).underline, undefined);
    } finally { M.setMegaPalette(false); }
    assert.equal(M.MEGA_C.ink, "#404040", "the light palette is back");
    // outside high contrast a red number is never underlined
    const L0 = M.layoutMega(regionInput());
    const d0 = L0.cols.find(c => c.type === "delta" && c.ref === "PY" && c.block === 0);
    assert.equal(L0.cellText(d0, L0.rows.find(r => r.id === "g")).underline, undefined);
});
// 1.1 Paket B ---------------------------------------------------------------
test("finance format: (1 234) with the unit inside, + stays on positive Δ, exact zero –, footer rule unchanged", () => {
    const f = M.megaFmt(num, 1, 1, true);
    const k = num(1234.5, 1);
    assert.equal(f.val(-1234.5), "(" + k + ")");
    assert.equal(f.val(1234.5), k);
    assert.equal(f.delta(-3.25), "(3.3)");
    assert.equal(f.delta(3.25), "+3.3");
    assert.equal(f.pct(-0.1234), "(12.3%)");
    assert.equal(f.pct(0.1234), "+12.3%");
    assert.equal(f.pin(-0.05), "(5.0)");
    assert.equal(f.margin(-0.367), "(36.7%)");
    assert.equal(f.pp(-8.6), "(8.6%p)");
    assert.equal(f.rel(-0.23), "(23%)");
    assert.equal(f.share(0.25), "25.0%");
    assert.equal(f.val(0), "–", "exact zero");
    assert.equal(f.val(-0.04), "0.0", "a rounded zero has neither sign nor parentheses");
    // the threshold footer is a rule, not a figure
    assert.equal(f.signed(-20, 0, false), "-20");
    // off: the 1.0 format, byte for byte
    const o = M.megaFmt(num, 1, 1);
    assert.deepEqual([o.val(-1234.5), o.delta(3.25), o.pct(-0.1234), o.val(0)], ["-" + k, "+3.3", "-12.3%", "0.0"]);
    const L = M.layoutMega(regionInput({ fin: true }));
    const d = L.cols.find(c => c.type === "delta" && c.ref === "PY" && c.block === 0);
    assert.equal(L.cellText(d, L.rows.find(r => r.id === "g")).t, "(85)");
});

test("house terms: relabel rewrites every head (values, Δ, Δ%, sort indicator)", () => {
    const rl = (s) => s.replace(/(?<![A-Za-z])(AC|PY|PL|FC)(?![A-Za-z])/g, m => ({ AC: "Ist", PY: "VJ", PL: "Budget" })[m] || m);
    const L = M.layoutMega(regionInput({ relabel: rl }));
    const heads = L.cols.map(c => c.head).filter(Boolean);
    assert.ok(heads.includes("Ist") && heads.includes("VJ") && heads.includes("Budget"), heads.join("|"));
    assert.ok(heads.includes("ΔVJ") && heads.includes("ΔBudget%"), heads.join("|"));
    assert.ok(!heads.some(h => /(?<![A-Za-z])(AC|PY|PL)(?![A-Za-z])/.test(h)), "no IBCS code left");
    // the head width follows the longer term
    const L0 = M.layoutMega(regionInput());
    const w = (LL) => LL.cols.find(c => c.type === "delta" && c.ref === "PL" && c.block === 0).w;
    assert.ok(w(L) >= w(L0));
});

test("materiality: an immaterial Δ number is soft, an explicit red threshold wins", () => {
    const base = regionInput();
    const soft = (bi) => ({ ...base.blocks[bi], delta: (r, min, ref) => ({ ...base.blocks[bi].delta(r, min, ref), immaterial: true }) });
    const L = M.layoutMega(regionInput({ blocks: [soft(0), soft(1)] }));
    const dPY0 = L.cols.find(c => c.type === "delta" && c.ref === "PY" && c.block === 0);
    const a = L.cellText(dPY0, L.rows.find(r => r.id === "a"));
    assert.equal(a.color, M.MEGA_C.soft, "Austria ΔPY +59: material colour gone");
    const g = L.cellText(dPY0, L.rows.find(r => r.id === "g"));
    assert.equal(g.color, "#E02B1D", "Germany −85 < −20 stays red");
    // without the flag: ink as before
    const L0 = M.layoutMega(regionInput());
    assert.equal(L0.cellText(L0.cols.find(c => c === L0.cols.find(x => x.type === "delta" && x.ref === "PY" && x.block === 0)),
        L0.rows.find(r => r.id === "a")).color, M.MEGA_C.text);
});

// 1.1 Paket C ---------------------------------------------------------------
test("presets 12G / 12H: FY outlook block + headline, PL minuend; the older presets keep YTD and leave the headline", () => {
    const g = M.MEGA_PRESETS["12G"]; const h = M.MEGA_PRESETS["12H"];
    assert.deepEqual([g.min, g.blockKind, g.headline, g.valueCascade, g.showPY, g.showMin, g.dPyBar, g.dPyPin], ["AC", "fy", true, true, true, true, true, true]);
    assert.deepEqual([h.min, h.blockKind, h.headline, h.valueCascade, h.showPctRows], ["PL", "ytd", true, true, false]);
    for (const k of Object.keys(M.MEGA_PRESETS).filter(x => !/^12[GH]$/.test(x))) {
        assert.equal(M.MEGA_PRESETS[k].blockKind, "ytd", k);
        assert.equal(M.MEGA_PRESETS[k].headline, false, k);
    }
    assert.ok(M.megaActive(toggles(g)) && M.megaActive(toggles(h)));
});

test("PL minuend (12H): one PL value column, no ΔPL against itself, activeRefs = PY", () => {
    const t = Object.assign(toggles(M.MEGA_PRESETS["12H"]), { showPL: true, d: {
        PY: { num: true, bar: true, wf: false, pct: false, pin: true }, PL: { num: true, bar: true, wf: false, pct: true, pin: true } } });
    assert.deepEqual(M.activeRefs(t), ["PY"]);
    const cols = M.buildColumns(t, 1);
    assert.deepEqual(cols.map(c => c.type + (c.scen || c.ref || "")), ["label", "vwfPY", "vwfPL", "deltaPY", "barPY", "pinPY"]);
    // AC / FC minuends keep both references
    assert.deepEqual(M.activeRefs(Object.assign({}, t, { min: "AC" })), ["PY", "PL"]);
});

test("notation: PL minuend tints the Δ area (pale good / bad in an ink outline), dark pendant, HC solid", () => {
    const hatch = (c) => "url(#h" + c + ")";
    const N = M.notation("PL", "PY");
    const a = N.area("#0E8585", hatch);
    assert.deepEqual([a.fill, a.stroke, a.sw], [M.megaTint("#0E8585"), M.MEGA_C.ink, 1]);
    assert.equal(M.megaTint("#0E8585"), "#BCDDDD", "72 % paper on white");
    assert.equal(M.megaTint("#E02B1D"), "#F6C4C0");
    assert.equal(M.megaTint("#FFF"), "#FFFFFF");
    assert.equal(M.megaTint("rgb(1,2,3)"), "rgb(1,2,3)", "unparsable colours stay");
    // the PL pin head stays outlined, PY axis
    assert.deepEqual([N.head(hatch).fill, N.head(hatch).stroke, N.axis], [M.MEGA_C.white, M.MEGA_C.ink, "gray"]);
    // dark paper: the tint mixes toward the dark paper (dark pendant)
    M.setMegaPalette(true);
    try { assert.equal(M.megaTint("#3FB3C2"), "#27484C"); } finally { M.setMegaPalette(false); }
    // high contrast: no mid tones — the area is solid
    const hcA = M.notation("PL", "PY", true).area("#FFFF00", hatch);
    assert.deepEqual([hcA.fill, hcA.stroke], ["#FFFF00", null]);
    // AC / FC areas unchanged
    assert.deepEqual(M.notation("AC", "PY").area("#0E8585", hatch), { fill: "#0E8585", stroke: null, sw: 0 });
    assert.deepEqual(M.notation("FC", "PL").area("#0E8585", hatch), { fill: "url(#h#0E8585)", stroke: "#0E8585", sw: 1 });
    // an outlined PL value cascade: cost rows on the pale ground (12H)
    assert.equal(N.value("PL", true, hatch).fill, M.MEGA_C.outlineLight);
    assert.equal(N.value("PL", false, hatch).fill, M.MEGA_C.white);
});

test("12G stack: the minuend value cascade of a block with a YTD share stacks, two heads, Δ fill per block", () => {
    const t = toggles(M.MEGA_PRESETS["12G"]);
    const inp = statementInput({ t, dec: 0, pdec: 0 });
    inp.blocks = [Object.assign({}, inp.blocks[0], { name: "FY 2025", titled: true, alias: { AC: "AC&FC", FC: "FC" },
        minFill: "FC", ytd: (r) => r.kind === "pct" ? null : inp.blocks[0].value(r, "AC") * 0.4 })];
    const L = M.layoutMega(inp);
    const v = L.charts.filter(c => c.type === "vwf");
    assert.deepEqual(v.map(c => [c.scen, !!c.stack]), [["PY", false], ["AC", true]]);
    const st = v[1];
    assert.deepEqual([st.head, st.head2], ["AC&FC", "YTD"]);
    // the stacked column fits both heads
    assert.ok(st.w >= measure("AC&FC", 13) + measure("YTD", 13) + 3 * L.G.pad);
    // the block's Δ elements are hatched (minFill FC), the head marks keep the scenario
    assert.equal(L.NB[0].area("#0E8585", c => "H" + c).fill, "H#0E8585");
    assert.equal(L.N.area("#0E8585", c => "H" + c).fill, "#0E8585");
    // without a YTD share (no FY block) nothing stacks
    const L0 = M.layoutMega(statementInput({ t, dec: 0, pdec: 0 }));
    assert.ok(L0.charts.every(c => !c.stack && !c.head2));
    assert.equal(L0.NB[0], L0.N);
    // house terms reach the second head too
    const L2 = M.layoutMega(Object.assign({}, inp, { ytdHead: "YTD", relabel: (x) => x.replace("YTD", "kum.") }));
    assert.equal(L2.charts.find(c => c.stack).head2, "kum.");
});

test("parseAmount: k / m / b suffixes, comma decimals, empty / invalid / ≤ 0 = automatic", () => {
    assert.equal(M.parseAmount("1500"), 1500);
    assert.equal(M.parseAmount("1.5k"), 1500);
    assert.equal(M.parseAmount("2,5m"), 2.5e6);
    assert.equal(M.parseAmount(" 3 B "), 3e9);
    assert.equal(M.parseAmount("250K"), 250000);
    for (const x of ["", "  ", "abc", "-5", "0", "1.5x", "1e3"]) { assert.equal(M.parseAmount(x), null, JSON.stringify(x)); }
});

test("scale sync: fixedVarMax / fixedMax hold the family scale — equal k for different data inside the max", () => {
    const t = toggles(M.MEGA_PRESETS.T04B);
    const base = statementInput({ t, dec: 2, pdec: 2 });
    const kOf = (inp) => M.layoutMega(inp).famK["0:delta"];
    const k0 = kOf(base);
    const k60 = kOf(Object.assign({}, base, { fixedVarMax: 60 }));
    assert.ok(k60 < k0, `${k60} < ${k0}`);
    // halve every Δ: the automatic scale doubles, the fixed one stays
    const half = Object.assign({}, base, { blocks: [Object.assign({}, base.blocks[0], {
        delta: (r, min, ref) => { const D = base.blocks[0].delta(r, min, ref); return D && { ...D, d: D.d / 2, impact: D.impact / 2 }; },
    })] });
    assert.ok(kOf(half) > k0 * 1.5, "automatic scale follows the data");
    assert.ok(Math.abs(kOf(Object.assign({}, half, { fixedVarMax: 60 })) - k60) < 1e-6, "fixed scale holds");
    // larger data than the max still widens the scale (CK minimum maximum)
    assert.ok(Math.abs(kOf(Object.assign({}, base, { fixedVarMax: 1 })) - k0) < 1e-9);
    // value cascades: fixedMax on the valueCascade family only
    const t12 = toggles(M.MEGA_PRESETS["12A"]);
    const v0 = M.layoutMega(statementInput({ t: t12, dec: 0, pdec: 0 }));
    const v1 = M.layoutMega(statementInput({ t: t12, dec: 0, pdec: 0, fixedMax: 3000 }));
    assert.ok(v1.famK["0:valueCascade"] < v0.famK["0:valueCascade"]);
    assert.equal(v1.famK["0:pct"], v0.famK["0:pct"], "pins are not part of the scale sync");
    // off: byte-identical layout numbers
    const off = M.layoutMega(Object.assign({}, base, { fixedVarMax: undefined, fixedMax: undefined }));
    assert.deepEqual(off.famK, M.layoutMega(base).famK);
});

console.log(`\n${n} mega-table layout test blocks passed`);
