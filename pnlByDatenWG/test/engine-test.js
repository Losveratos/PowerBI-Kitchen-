// unit tests for the calc engine (F1–F4, F7) — plain node, no test framework
const esbuild = require("esbuild");
const path = require("path");
const assert = require("assert");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, ".tmp-engine.cjs");

esbuild.buildSync({
    entryPoints: [path.join(ROOT, "src/engine.ts")],
    bundle: true, format: "cjs", platform: "node", outfile: OUT,
});
const E = require("./.tmp-engine.cjs");

const row = (id, parent, over = {}) => ({
    id, parent, name: over.name ?? id, sort: over.sort ?? 0,
    rowType: over.rowType ?? "account", formulaDef: over.formulaDef ?? null,
    sign: over.sign ?? 1, displayInvert: over.displayInvert ?? false,
    varianceInvert: over.varianceInvert ?? false, values: over.values ?? {}, index: 0,
});

let n = 0;
const test = (name, fn) => { fn(); n++; console.log("  ok · " + name); };

// F1 — unbalanced parent-child hierarchy + orphan bucket
test("unbalanced tree, levels, orphans", () => {
    const m = E.buildModel([
        row("root", null, { rowType: "subtotal" }),
        row("a", "root", { values: { ac: 10 } }),
        row("b", "root", { rowType: "subtotal" }),
        row("b1", "b", { values: { ac: 5 } }),
        row("b11", "b1", { values: { ac: 2 } }),
        row("lost", "nope", { values: { ac: 7 } }),
    ], "Unassigned");
    assert.equal(m.maxDepth, 4);
    assert.equal(m.byId.get("a").level, 1);
    assert.equal(m.byId.get("b11").level, 3);
    const orphanRoot = m.roots.find(r => r.isOrphanBucket);
    assert.ok(orphanRoot, "orphan bucket exists");
    assert.equal(orphanRoot.children[0].row.id, "lost");
    assert.equal(orphanRoot.computed.ac, 7);
    assert.ok(m.warnings.some(w => w.includes("orphan")));
});

// F2 — subtotals sum children with sign convention; account with children adds own value
test("subtotal sums with sign; postable parent", () => {
    const m = E.buildModel([
        row("gp", null, { rowType: "subtotal" }),
        row("rev", "gp", { sign: 1, values: { ac: 100, py: 90 } }),
        row("cogs", "gp", { sign: -1, values: { ac: 40, py: 38 } }),
        row("post", null, { values: { ac: 5 } }),
        row("postChild", "post", { values: { ac: 3 } }),
    ], "U");
    assert.equal(m.byId.get("gp").computed.ac, 60);   // 100 - 40
    assert.equal(m.byId.get("gp").computed.py, 52);
    assert.equal(m.byId.get("post").computed.ac, 8);  // own 5 + child 3
});

// F2 — formula rows: EBITDA, formula-on-formula, cycle, unknown ref, div/0
test("formula engine", () => {
    const m = E.buildModel([
        row("rev", null, { values: { ac: 200, pl: 180 } }),
        row("opex", null, { sign: -1, values: { ac: 80, pl: 90 } }),
        row("ebitda", null, { rowType: "formula", formulaDef: "[rev]+[opex]" }),
        row("margin", null, { rowType: "kpi", formulaDef: "[ebitda]/[rev]" }),
        row("half", null, { rowType: "formula", formulaDef: "[rev]*0.5-10" }),
        row("c1", null, { rowType: "formula", formulaDef: "[c2]" }),
        row("c2", null, { rowType: "formula", formulaDef: "[c1]" }),
        row("bad", null, { rowType: "formula", formulaDef: "[missing]+1" }),
        row("div0", null, { rowType: "formula", formulaDef: "[rev]/([rev]-[rev])" }),
    ], "U");
    assert.equal(m.byId.get("ebitda").computed.ac, 120);   // 200 + (-80)
    assert.equal(m.byId.get("ebitda").computed.pl, 90);
    assert.equal(m.byId.get("margin").computed.ac, 0.6);   // formula referencing formula
    assert.equal(m.byId.get("half").computed.ac, 90);
    assert.ok(m.byId.get("c1").error.includes("cycle"));
    assert.ok(m.byId.get("c2").error.includes("cycle"));
    assert.ok(m.byId.get("bad").error.includes("missing"));
    assert.equal(m.byId.get("div0").computed.ac, null);    // div by zero -> null, no crash
    // formula rows never leak into parent sums
    const m2 = E.buildModel([
        row("s", null, { rowType: "subtotal" }),
        row("x", "s", { values: { ac: 10 } }),
        row("f", "s", { rowType: "formula", formulaDef: "[x]*2" }),
    ], "U");
    assert.equal(m2.byId.get("s").computed.ac, 10); // not 30
});

// F3 — acceptance criterion from the spec:
// costs raw 50 vs plan raw 60, sign -1 => display 50, delta +10, green
test("sign / display / variance invert", () => {
    const m = E.buildModel([
        row("cost", null, { sign: -1, displayInvert: true, values: { ac: 50, pl: 60 } }),
    ], "U");
    const node = m.byId.get("cost");
    assert.equal(node.computed.ac, -50);
    assert.equal(E.displayValue(node, "ac"), 50);
    const v = E.variance(node, "pl");
    assert.equal(v.delta, 10);         // -50 - (-60)
    assert.equal(v.good, true);        // below plan on a cost row = good
    // varianceInvert flips color when data arrives already signed without sign convention
    const m2 = E.buildModel([
        row("cost2", null, { varianceInvert: true, values: { ac: 50, pl: 60 } }),
    ], "U");
    const v2 = E.variance(m2.byId.get("cost2"), "pl");
    assert.equal(v2.delta, -10);
    assert.equal(v2.good, true);       // 10 below plan, inverted -> good
});

// F4 — variance against selectable reference
test("variance vs py / pl, delta pct", () => {
    const m = E.buildModel([
        row("rev", null, { values: { ac: 110, py: 100, pl: 120 } }),
    ], "U");
    const node = m.byId.get("rev");
    const vsPy = E.variance(node, "py");
    assert.equal(vsPy.delta, 10);
    assert.ok(Math.abs(vsPy.deltaPct - 0.1) < 1e-9);
    assert.equal(vsPy.good, true);
    const vsPl = E.variance(node, "pl");
    assert.equal(vsPl.delta, -10);
    assert.equal(vsPl.good, false);
    // null-safe
    const m2 = E.buildModel([row("x", null, { values: { ac: 5 } })], "U");
    assert.equal(E.variance(m2.byId.get("x"), "py").delta, null);
});

// F7 — flatten with collapse state + expand-to-level
test("flatten / collapse to level", () => {
    const m = E.buildModel([
        row("r", null, { rowType: "subtotal" }),
        row("r1", "r", { rowType: "subtotal", sort: 1 }),
        row("r11", "r1", { values: { ac: 1 } }),
        row("r2", "r", { sort: 2, values: { ac: 2 } }),
    ], "U");
    assert.deepEqual(E.flattenVisible(m.roots, new Set()).map(x => x.row.id), ["r", "r1", "r11", "r2"]);
    assert.deepEqual(E.flattenVisible(m.roots, new Set(["r1"])).map(x => x.row.id), ["r", "r1", "r2"]);
    const c1 = E.collapseToLevel(m.roots, 1);
    assert.deepEqual(E.flattenVisible(m.roots, c1).map(x => x.row.id), ["r"]);
    const c2 = E.collapseToLevel(m.roots, 2);
    assert.deepEqual(E.flattenVisible(m.roots, c2).map(x => x.row.id), ["r", "r1", "r2"]);
});

// review fix — parent-child cycle rows surface in the orphan bucket, never vanish
test("parent-child cycle -> orphan bucket + warning", () => {
    const m = E.buildModel([
        row("root", null, { values: { ac: 1 } }),
        row("x", "y", { values: { ac: 10 } }),
        row("y", "x", { values: { ac: 20 } }),
    ], "U");
    const bucket = m.roots.find(r => r.isOrphanBucket);
    assert.ok(bucket, "bucket exists");
    assert.deepEqual(bucket.children.map(c => c.row.id).sort(), ["x", "y"]);
    assert.equal(bucket.computed.ac, 30);              // values kept, not lost
    assert.ok(m.warnings.some(w => w.includes("cycle")));
    // flatten must terminate (cycle links were cut)
    assert.equal(E.flattenVisible(m.roots, new Set()).length, 4);
});

// review fix — subtotal own value is a per-scenario fallback (PY aggregate-only data)
test("subtotal per-scenario own-value fallback", () => {
    const m = E.buildModel([
        row("s", null, { rowType: "subtotal", values: { ac: 999, py: 95 } }),
        row("s1", "s", { values: { ac: 60 } }),
        row("s2", "s", { values: { ac: 40 } }),
    ], "U");
    const s = m.byId.get("s");
    assert.equal(s.computed.ac, 100);  // children win over own 999
    assert.equal(s.computed.py, 95);   // no child data for PY -> own value
});

// review fix — SignConvention on a subtotal applies to its aggregate
test("subtotal sign flips child aggregate", () => {
    const m = E.buildModel([
        row("gp", null, { rowType: "subtotal" }),
        row("rev", "gp", { values: { ac: 100 } }),
        row("costs", "gp", { rowType: "subtotal", sign: -1 }),
        row("k1", "costs", { values: { ac: 40 } }),
        row("k2", "costs", { values: { ac: 10 } }),
    ], "U");
    assert.equal(m.byId.get("costs").computed.ac, -50);
    assert.equal(m.byId.get("gp").computed.ac, 50);
});

// review fix — subtree under a non-contributing row warns instead of silent loss
test("separator with children warns", () => {
    const m = E.buildModel([
        row("total", null, { rowType: "subtotal" }),
        row("sec", "total", { rowType: "separator" }),
        row("a", "sec", { values: { ac: 100 } }),
        row("b", "total", { values: { ac: 5 } }),
    ], "U");
    assert.equal(m.byId.get("total").computed.ac, 5);  // documented limitation...
    assert.ok(m.warnings.some(w => w.includes("sec"))); // ...but never silent
});

// review fix — German row types + tolerant sign/bool parsing
test("German row types, sign and bool parsing", () => {
    assert.equal(E.parseRowType("Zwischensumme"), "subtotal");
    assert.equal(E.parseRowType("Kennzahl"), "kpi");
    assert.equal(E.parseRowType("Marge"), "kpi");
    assert.equal(E.parseRowType("Trennzeile"), "separator");
    assert.equal(E.parseRowType("Konto"), "account");
    assert.equal(E.parseSign("-1"), -1);
    assert.equal(E.parseSign(-1), -1);
    assert.equal(E.parseSign("-"), -1);
    assert.equal(E.parseSign("negativ"), -1);
    assert.equal(E.parseSign("1"), 1);
    assert.equal(E.parseSign("Erlös"), 1);
    assert.equal(E.parseBool("wahr"), true);
    assert.equal(E.parseBool("j"), true);
    assert.equal(E.parseBool("falsch"), false);
});

// review fix — formula errors poison consumers visibly instead of silent null
test("formula error propagates to consumers", () => {
    const m = E.buildModel([
        row("a", null, { values: { ac: 1 } }),
        row("bad", null, { rowType: "formula", formulaDef: "[missing]" }),
        row("user", null, { rowType: "formula", formulaDef: "[bad]+[a]" }),
    ], "U");
    assert.ok(m.byId.get("user").error.includes("ref [bad]"));
    assert.equal(m.byId.get("user").computed.ac, null);
});

// star-schema mode — flattened L1..Ln level columns
const lrow = (levels, over = {}) => ({
    levels,
    account: over.account ?? null, name: over.name ?? null, sort: over.sort ?? null,
    rowType: over.rowType ?? "account", formulaDef: over.formulaDef ?? null,
    sign: over.sign ?? 1, displayInvert: over.displayInvert ?? false,
    varianceInvert: over.varianceInvert ?? false, values: over.values ?? {},
    month: over.month ?? null, comment: over.comment ?? null, index: over.index ?? 0,
});
const buildLevels = (levelRows, label = "U") => {
    const lr = E.rowsFromLevels(levelRows);
    return E.buildModel(lr.rows, label, lr.months);
};

test("levels: ragged via trailing nulls AND repeated values", () => {
    const m = buildLevels([
        lrow(["Umsatz", "Produkte", null], { values: { ac: 100 }, index: 0 }),
        lrow(["Umsatz", "Service", null], { values: { ac: 50 }, index: 1 }),
        lrow(["Sonstiges", "Sonstiges", "Sonstiges"], { values: { ac: 7 }, index: 2 }), // repeat -> depth 1
        lrow(["Opex", "Personal", "Löhne"], { sign: -1, values: { ac: 30 }, index: 3 }),
        lrow(["Opex", "Personal", "Sozial"], { sign: -1, values: { ac: 10 }, index: 4 }),
    ]);
    assert.equal(m.roots.length, 3);                       // Umsatz, Sonstiges, Opex
    const umsatz = m.roots.find(r => r.row.name === "Umsatz");
    assert.equal(umsatz.computed.ac, 150);
    assert.equal(umsatz.children.length, 2);
    const sonst = m.roots.find(r => r.row.name === "Sonstiges");
    assert.equal(sonst.hasChildren, false);                // repeat ended the branch
    assert.equal(sonst.computed.ac, 7);
    const opex = m.roots.find(r => r.row.name === "Opex");
    assert.equal(opex.computed.ac, -40);                   // sign -1 leaves
    assert.equal(m.maxDepth, 3);
});

test("levels: same-path aggregation + aggregate row becomes subtotal fallback", () => {
    const m = buildLevels([
        lrow(["Umsatz", "Produkte"], { values: { ac: 60 }, index: 0 }),
        lrow(["Umsatz", "Produkte"], { values: { ac: 40 }, index: 1 }),   // finer fact grain
        lrow(["Umsatz"], { values: { py: 90 }, index: 2 }),               // PY aggregate-only row
    ]);
    const umsatz = m.roots.find(r => r.row.name === "Umsatz");
    assert.equal(umsatz.children.length, 1);
    assert.equal(umsatz.children[0].computed.ac, 100);     // 60+40 aggregated
    assert.equal(umsatz.computed.ac, 100);                 // children win for AC
    assert.equal(umsatz.computed.py, 90);                  // own-value fallback for PY
});

test("levels: synthetic parents inherit uniform display/variance invert", () => {
    const m = buildLevels([
        lrow(["Opex", "Personal", "Löhne"], { sign: -1, displayInvert: true, values: { ac: 30 }, index: 0 }),
        lrow(["Opex", "Personal", "Sozial"], { sign: -1, displayInvert: true, values: { ac: 10 }, index: 1 }),
        lrow(["Opex", "Material"], { sign: -1, displayInvert: true, values: { ac: 5 }, index: 2 }),
        lrow(["Mixed", "A"], { displayInvert: true, values: { ac: 1 }, index: 3 }),
        lrow(["Mixed", "B"], { displayInvert: false, values: { ac: 2 }, index: 4 }),
    ]);
    const opex = m.roots.find(r => r.row.name === "Opex");
    assert.equal(opex.computed.ac, -45);
    assert.equal(opex.row.displayInvert, true);            // inherited transitively
    assert.equal(E.displayValue(opex, "ac"), 45);
    const pers = opex.children.find(c => c.row.name === "Personal");
    assert.equal(pers.row.displayInvert, true);
    const mixed = m.roots.find(r => r.row.name === "Mixed");
    assert.equal(mixed.row.displayInvert, false);          // children disagree -> no inherit
});

test("levels: formula rows reference by unique name", () => {
    const m = buildLevels([
        lrow(["Umsatzerlöse", "Produkte"], { values: { ac: 100 }, index: 0 }),
        lrow(["Betriebsaufwand", "Material"], { sign: -1, values: { ac: 40 }, index: 1 }),
        lrow(["EBITDA"], { rowType: "formula", formulaDef: "[Umsatzerlöse]+[Betriebsaufwand]", index: 2 }),
        lrow(["Marge"], { rowType: "kpi", formulaDef: "[EBITDA]/[Umsatzerlöse]", index: 3 }),
    ]);
    const byName = n => [...m.byId.values()].find(x => x.row.name === n);
    assert.equal(byName("EBITDA").computed.ac, 60);
    assert.equal(byName("Marge").computed.ac, 0.6);
});

// v0.3 — month grain: series, YTD sums, FY first-wins, formula series, minuend
test("monthly aggregation: series + FY scalars + subtotal rollup", () => {
    const m = buildLevels([
        lrow(["Umsatz", "Produkte"], { month: "2026-01", values: { ac: 10, py: 9, fcfy: 250, plfy: 240 }, index: 0 }),
        lrow(["Umsatz", "Produkte"], { month: "2026-02", values: { ac: 12, py: 10, fcfy: 250, plfy: 240 }, index: 1 }),
        lrow(["Umsatz", "Service"], { month: "2026-01", values: { ac: 5 }, index: 2 }),
        lrow(["Umsatz", "Service"], { month: "2026-02", values: { ac: 6 }, index: 3 }),
        lrow(["Opex", "Material"], { sign: -1, month: "2026-01", values: { ac: 4 }, index: 4 }),
        lrow(["Opex", "Material"], { sign: -1, month: "2026-02", values: { ac: 5 }, index: 5 }),
        lrow(["EBITDA"], { rowType: "formula", formulaDef: "[Umsatz]+[Opex]", index: 6 }),
    ]);
    assert.deepEqual(m.months, ["2026-01", "2026-02"]);
    const prod = [...m.byId.values()].find(x => x.row.name === "Produkte");
    assert.equal(prod.computed.ac, 22);                  // YTD sum
    assert.equal(prod.computed.fcfy, 250);               // first-wins, NOT 500
    assert.equal(prod.computed.plfy, 240);
    assert.deepEqual(prod.series.ac, [10, 12]);
    const umsatz = m.roots.find(r => r.row.name === "Umsatz");
    assert.deepEqual(umsatz.series.ac, [15, 18]);        // children summed per month
    const opex = m.roots.find(r => r.row.name === "Opex");
    assert.deepEqual(opex.series.ac, [-4, -5]);          // sign applied
    const ebitda = [...m.byId.values()].find(x => x.row.name === "EBITDA");
    assert.equal(ebitda.computed.ac, 33 - 9);            // 33 rev - 9 opex
    assert.deepEqual(ebitda.series.ac, [11, 13]);        // formula evaluated per month
});

test("variance minuend FC vs PL (FY outlook block)", () => {
    const m = E.buildModel([
        row("rev", null, { values: { ac: 100, fcfy: 250, plfy: 240 } }),
    ], "U");
    const v = E.variance(m.byId.get("rev"), "plfy", "fcfy");
    assert.equal(v.delta, 10);
    assert.equal(v.good, true);
    assert.ok(Math.abs(v.deltaPct - 10 / 240) < 1e-9);
});

test("isZeroRow + revenueBase", () => {
    const m = E.buildModel([
        row("zero", null, { values: { ac: 0, py: 0 }, sort: 1 }),
        row("rev", null, { values: { ac: 100 }, sort: 2 }),
        row("kpiRow", null, { rowType: "kpi", formulaDef: "[rev]/[rev]", sort: 3 }),
    ], "U");
    assert.equal(E.isZeroRow(m.byId.get("zero")), true);
    assert.equal(E.isZeroRow(m.byId.get("rev")), false);
    assert.equal(E.revenueBase(m).row.id, "zero");       // first contributing root
    assert.equal(E.revenueBase(m, "rev").row.id, "rev"); // explicit override wins
});

// parser hygiene
test("formula parser rejects garbage cleanly", () => {
    const mk = def => E.buildModel([
        row("a", null, { values: { ac: 1 } }),
        row("f", null, { rowType: "formula", formulaDef: def }),
    ], "U").byId.get("f");
    assert.ok(mk("[a]+").error);
    assert.ok(mk("([a]").error);
    assert.ok(mk("[a] [a]").error);
    assert.ok(mk("").error);
    assert.equal(mk("-[a]+2,5").computed.ac, 1.5); // unary minus + decimal comma
});

// v0.6 — formula operands for the value driver tree (DuPont)
test("formulaOperands: DuPont chain, mixed ops, unknown refs", () => {
    const m = E.buildModel([
        row("Sales", null, { name: "Sales", values: { ac: 1000 } }),
        row("Ret", null, { name: "Ret", values: { ac: 100 } }),
        row("Cap", null, { name: "Cap", values: { ac: 500 } }),
        row("ROS", null, { name: "ROS", rowType: "kpi", formulaDef: "[Ret]/[Sales]" }),
        row("CT", null, { name: "CT", rowType: "kpi", formulaDef: "[Sales]/[Cap]" }),
        row("ROI", null, { name: "ROI", rowType: "kpi", formulaDef: "[ROS]*[CT]" }),
        row("mix", null, { rowType: "formula", formulaDef: "[Ret]*[CT]+[Cap]" }),
        row("minus", null, { rowType: "formula", formulaDef: "[Sales]-[Ret]" }),
        row("nested", null, { rowType: "formula", formulaDef: "[Sales]-([Ret]-[Cap])" }),
        row("scaled", null, { rowType: "formula", formulaDef: "[Ret]*2" }),
        row("ghost", null, { rowType: "formula", formulaDef: "[nope]+[alsoNope]" }),
        row("halfGhost", null, { rowType: "formula", formulaDef: "[Sales]+[nope]" }),
        row("broken", null, { rowType: "formula", formulaDef: "[Sales]+" }),
        row("plain", null, { values: { ac: 1 } }),
    ], "U");
    const resolve = E.nodeResolver(m);
    const ops = id => E.formulaOperands(m.byId.get(id), resolve)
        .map(o => o.op + o.child.row.name);

    // multiplication and division: one branch operator for the whole group
    assert.deepEqual(ops("ROI"), ["×ROS", "×CT"]);
    assert.deepEqual(ops("ROS"), ["÷Ret", "÷Sales"]);
    assert.deepEqual(ops("CT"), ["÷Sales", "÷Cap"]);
    // the operands are real nodes with computed values (ROI = 0.1 * 2 = 0.2)
    const roi = E.formulaOperands(m.byId.get("ROI"), resolve);
    assert.equal(roi.length, 2);
    assert.equal(roi[0].child.computed.ac, 0.1);
    assert.equal(roi[1].child.computed.ac, 2);
    // mixed / additive formulas keep the operator per edge
    assert.deepEqual(ops("mix"), ["×Ret", "×CT", "+Cap"]);
    assert.deepEqual(ops("minus"), ["+Sales", "−Ret"]);
    assert.deepEqual(ops("nested"), ["+Sales", "−Ret", "+Cap"]);   // -(-Cap) adds again
    assert.deepEqual(ops("scaled"), ["+Ret"]);                     // literals are no operands
    // unresolvable references drop out, a parse error yields nothing
    assert.deepEqual(ops("ghost"), []);
    assert.deepEqual(ops("halfGhost"), ["+Sales"]);
    assert.deepEqual(ops("broken"), []);
    assert.deepEqual(ops("plain"), []);                            // no formula at all
});

test("formulaOperands: name resolution in level mode", () => {
    const m = buildLevels([
        lrow(["Umsatzerlöse", "Produkte"], { values: { ac: 100 }, index: 0 }),
        lrow(["Betriebsaufwand", "Material"], { sign: -1, values: { ac: 40 }, index: 1 }),
        lrow(["EBITDA"], { rowType: "formula", formulaDef: "[Umsatzerlöse]+[Betriebsaufwand]", index: 2 }),
        lrow(["Marge"], { rowType: "kpi", formulaDef: "[EBITDA]/[Umsatzerlöse]", index: 3 }),
    ]);
    const resolve = E.nodeResolver(m);
    const byName = nm => [...m.byId.values()].find(x => x.row.name === nm);
    const marge = E.formulaOperands(byName("Marge"), resolve);
    assert.deepEqual(marge.map(o => o.op), ["÷", "÷"]);
    assert.deepEqual(marge.map(o => o.child.row.name), ["EBITDA", "Umsatzerlöse"]);
    assert.equal(marge[0].child.computed.ac, 60);                  // synthetic path id resolved by name
    const ebitda = E.formulaOperands(byName("EBITDA"), resolve);
    assert.deepEqual(ebitda.map(o => o.op + o.child.row.name), ["+Umsatzerlöse", "+Betriebsaufwand"]);
});

console.log(`\n${n} engine test blocks passed`);
