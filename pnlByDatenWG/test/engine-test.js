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

// 1.4.2 — sort column on another scale than the data index (SortOrder = 6 × position, rows arrive by account id):
// a synthetic intermediate level must not hand its placeholder index up to the root
test("levels: root order follows the sort column through synthetic intermediate levels", () => {
    const m = buildLevels([
        lrow(["Umsatz", "Segment A", "EMEA"], { account: "400100", sort: 30, values: { ac: 100 }, index: 0 }),
        lrow(["Sonstiges Ergebnis", "Erträge", "Anlagenabgänge"], { account: "440000", sort: 29604, values: { ac: 5 }, index: 1 }),
        lrow(["Material", "Kaufteile", "Mechanik"], { account: "500000", sign: -1, sort: 13152, values: { ac: 40 }, index: 2 }),
        lrow(["Rohertrag"], { account: "F-GP", rowType: "formula", formulaDef: "[Umsatz]+[Material]", sort: 23352, index: 3 }),
    ]);
    assert.deepEqual(m.roots.map(r => r.row.name), ["Umsatz", "Material", "Rohertrag", "Sonstiges Ergebnis"]);
    assert.equal(m.byId.get("F-GP").computed.ac, 60);
});

test("levels: without a sort column the data order still decides", () => {
    const m = buildLevels([
        lrow(["B", "b1", "x"], { values: { ac: 1 }, index: 0 }),
        lrow(["A", "a1", "y"], { values: { ac: 2 }, index: 1 }),
    ]);
    assert.deepEqual(m.roots.map(r => r.row.name), ["B", "A"]);
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

// v0.15 — syntheticTotal: the virtual root of a driver tree that has no
// formula row to start from. It must behave exactly like a subtotal row.
test("syntheticTotal: sums the model roots per scenario", () => {
    const m = E.buildModel([
        row("A", null, { rowType: "subtotal" }),
        row("a1", "A", { values: { ac: 10, py: 8, pl: 9, fcfy: 100, plfy: 90 } }),
        row("a2", "A", { values: { ac: 5, py: 4, pl: 5, fcfy: 50, plfy: 45 } }),
        row("B", null, { rowType: "subtotal" }),
        row("b1", "B", { values: { ac: 7, py: 6, pl: 7, fcfy: 70, plfy: 66 } }),
    ], "U");
    const t = E.syntheticTotal(m);
    assert.equal(t.row.id, E.TOTAL_ID);
    assert.equal(E.TOTAL_ID, "__TOTAL__");
    assert.equal(t.row.rowType, "subtotal");
    assert.equal(t.row.sign, 1);
    assert.equal(t.row.name, "");                    // the view supplies the label
    assert.equal(t.level, 0);
    assert.ok(t.hasChildren);
    assert.equal(t.children.length, 2);
    assert.ok(!m.byId.has(E.TOTAL_ID), "the virtual root is no row of the model");
    assert.equal(t.computed.ac, 22);
    assert.equal(t.computed.py, 18);
    assert.equal(t.computed.pl, 21);
    // FY scalars roll up here exactly like in the engine's subtotal branch —
    // their first-wins rule lives one level below, in aggregateMonthly
    assert.equal(t.computed.fcfy, 220);
    assert.equal(t.computed.plfy, 201);
});

test("syntheticTotal: sign weighting, ratio roots, single root, empty model", () => {
    // a cost root with sign −1 subtracts, exactly as under a subtotal parent
    const m = E.buildModel([
        row("rev", null, { rowType: "subtotal" }),
        row("r1", "rev", { values: { ac: 100 } }),
        row("cost", null, { rowType: "subtotal", sign: -1 }),
        row("c1", "cost", { values: { ac: 40 } }),
    ], "U");
    assert.equal(m.byId.get("cost").computed.ac, -40);
    assert.equal(E.syntheticTotal(m).computed.ac, 60);

    // ratio and separator roots never contribute to a sum (contributes())
    const m2 = E.buildModel([
        row("A", null, { values: { ac: 10 } }),
        row("K", null, { rowType: "kpi", formulaDef: "[A]/[A]" }),
        row("S", null, { rowType: "separator" }),
    ], "U");
    assert.equal(m2.byId.get("K").computed.ac, 1);
    assert.equal(E.syntheticTotal(m2).computed.ac, 10);

    // one root: the total repeats it — the visual uses the root itself instead
    const m3 = E.buildModel([
        row("only", null, { rowType: "subtotal" }),
        row("o1", "only", { values: { ac: 12, py: 11 } }),
    ], "U");
    assert.equal(m3.roots.length, 1);
    assert.equal(E.syntheticTotal(m3).computed.ac, 12);

    // no scenario value anywhere stays null instead of turning into a 0
    const m4 = E.buildModel([row("x", null, {}), row("y", null, {})], "U");
    const t4 = E.syntheticTotal(m4);
    assert.equal(t4.computed.ac, null);
    assert.equal(t4.computed.plfy, null);
});

test("syntheticTotal: monthly series roll up like a subtotal", () => {
    const m = buildLevels([
        lrow(["Pharma", "Rx"], { account: "Rx", values: { ac: 10, pl: 9 }, month: "2026-01", index: 0 }),
        lrow(["Pharma", "Rx"], { account: "Rx", values: { ac: 12, pl: 11 }, month: "2026-02", index: 1 }),
        lrow(["Consumer", "Care"], { account: "Care", values: { ac: 5, pl: 6 }, month: "2026-01", index: 2 }),
        lrow(["Consumer", "Care"], { account: "Care", values: { ac: 6, pl: 6 }, month: "2026-02", index: 3 }),
        // a cost branch: sign −1 turns its months negative before they are summed
        lrow(["Cost", "Materials"], { account: "Mat", sign: -1, values: { ac: 4 }, month: "2026-01", index: 4 }),
        lrow(["Cost", "Materials"], { account: "Mat", sign: -1, values: { ac: 3 }, month: "2026-02", index: 5 }),
    ]);
    assert.equal(m.roots.length, 3);
    const t = E.syntheticTotal(m);
    assert.deepEqual(t.series.ac, [11, 15]);          // 10 + 5 − 4 · 12 + 6 − 3
    assert.deepEqual(t.series.pl, [15, 17]);          // the cost branch carries no PL
    assert.equal(t.computed.ac, 26);
    // scenarios without any series stay out of the series map entirely
    assert.equal(t.series.py, undefined);
});

// v0.16 — the period parser: every shape a period column really arrives in
test("period parsing: keys, dates, month names, numbers, junk", () => {
    const p = (s) => E.parsePeriod(s);
    const eq = (s, y, mo, d) => assert.deepEqual(p(s), { y, m: mo, d }, "parse " + s);

    // the classic text keys — unchanged
    eq("2026-01", 2026, 1, 0);
    eq("2026-12", 2026, 12, 0);
    eq("2026-01-15", 2026, 1, 15);
    eq("2026-03-01T00:00:00Z", 2026, 3, 1);
    eq("2026/07", 2026, 7, 0);
    assert.equal(p("2026-13"), null);                  // no such month

    // German month names, short and long, with and without a dot, any casing
    eq("Dez", null, 12, 0);
    eq("dez.", null, 12, 0);
    eq("Dezember", null, 12, 0);
    eq("MÄRZ", null, 3, 0);
    eq("Mär", null, 3, 0);
    eq("Mrz", null, 3, 0);
    eq("Jan", null, 1, 0);
    eq("Sept.", null, 9, 0);
    eq("Okt", null, 10, 0);

    // English, short and long
    eq("Dec", null, 12, 0);
    eq("March", null, 3, 0);
    eq("May", null, 5, 0);
    eq("october", null, 10, 0);

    // month name plus a four-digit year, on either side
    eq("Mär 2026", 2026, 3, 0);
    eq("2026 Mar", 2026, 3, 0);
    eq("Dez. 2025", 2025, 12, 0);

    // plain calendar numbers
    eq("1", null, 1, 0);
    eq("12", null, 12, 0);
    eq("07", null, 7, 0);
    assert.equal(p("0"), null);
    assert.equal(p("13"), null);

    // an epoch timestamp in milliseconds
    const ms = new Date(2026, 4, 15).getTime();
    assert.deepEqual(p(String(ms)), { y: 2026, m: 5, d: 15 });

    // …and everything the visual must NOT guess at
    for (const junk of ["", null, undefined, "   ", "P07", "KW 12", "Quartal 1", "FY26", "-"]) {
        assert.equal(p(junk), null, "junk " + junk);
    }
});

test("period sorting: auto / data / calendar", () => {
    const DE = ["Dez", "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov"];
    const CAL = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

    // auto: readable labels go into calendar order …
    assert.deepEqual(E.sortMonths(DE, "auto"), CAL);
    assert.deepEqual(E.sortMonths(DE), CAL);                       // auto is the default
    // … and the classic key path stays exactly what .sort() produced before
    const keys = ["2026-03", "2026-01", "2025-12", "2026-02"];
    assert.deepEqual(E.sortMonths(keys, "auto"), ["2025-12", "2026-01", "2026-02", "2026-03"]);
    assert.deepEqual(E.sortMonths(keys, "auto"), [...keys].sort());
    // days inside one month keep their day order
    assert.deepEqual(E.sortMonths(["2026-01-30", "2026-01-02"], "auto"),
        ["2026-01-02", "2026-01-30"]);

    // auto: one unreadable label and the whole column falls back to data order
    const fiscal = ["P04", "P05", "P06", "P07"];
    assert.deepEqual(E.sortMonths(fiscal, "auto"), fiscal);
    assert.deepEqual(E.sortMonths(["Jan", "P02", "Mär"], "auto"), ["Jan", "P02", "Mär"]);

    // data: the sequence is never touched, however readable it is
    assert.deepEqual(E.sortMonths(DE, "data"), DE);
    assert.deepEqual(E.sortMonths(keys, "data"), keys);

    // calendar: forced, unreadable labels keep their data order behind the rest
    assert.deepEqual(E.sortMonths(["Jan", "P02", "Mär"], "calendar"), ["Jan", "Mär", "P02"]);
    assert.deepEqual(E.sortMonths(["Zeta", "Alpha"], "calendar"), ["Zeta", "Alpha"]);
    // with years the year wins over the calendar position
    assert.deepEqual(E.sortMonths(["Mär 2026", "Dez 2025", "Jan 2026"], "calendar"),
        ["Dez 2025", "Jan 2026", "Mär 2026"]);

    // data order is stable: equal keys never shuffle
    assert.deepEqual(E.sortMonths(["Jul", "Jul", "Jan"], "auto"), ["Jan", "Jul", "Jul"]);
});

test("period sorting: the monthly series follow the period order", () => {
    const mk = (sort) => {
        const rows = [
            ["Dez", 12], ["Jan", 1], ["Feb", 2], ["Mär", 3],
        ].map(([m, v], i) => lrow(["Umsatz", "Produkte"], {
            month: m, values: { ac: v }, index: i,
        }));
        const lr = E.rowsFromLevels(rows, sort);
        return { model: E.buildModel(lr.rows, "U", lr.months), months: lr.months };
    };
    const prod = (r) => [...r.model.byId.values()].find(x => x.row.name === "Produkte");

    const auto = mk("auto");
    assert.deepEqual(auto.months, ["Jan", "Feb", "Mär", "Dez"]);
    assert.deepEqual(auto.model.months, auto.months);
    assert.deepEqual(prod(auto).series.ac, [1, 2, 3, 12]);   // series indices follow the months
    assert.equal(prod(auto).computed.ac, 18);                // the YTD sum is order-free

    const data = mk("data");
    assert.deepEqual(data.months, ["Dez", "Jan", "Feb", "Mär"]);
    assert.deepEqual(prod(data).series.ac, [12, 1, 2, 3]);
    assert.equal(prod(data).computed.ac, 18);

    const cal = mk("calendar");
    assert.deepEqual(cal.months, ["Jan", "Feb", "Mär", "Dez"]);
    assert.deepEqual(prod(cal).series.ac, [1, 2, 3, 12]);

    // the classic key path is untouched by any of this
    const keyRows = ["2026-02", "2026-01"].map((m, i) => lrow(["Umsatz", "Produkte"], {
        month: m, values: { ac: i === 0 ? 20 : 10 }, index: i,
    }));
    const kr = E.rowsFromLevels(keyRows);
    assert.deepEqual(kr.months, ["2026-01", "2026-02"]);
    const km = E.buildModel(kr.rows, "U", kr.months);
    assert.deepEqual([...km.byId.values()].find(x => x.row.name === "Produkte").series.ac, [10, 20]);
});

// mega table — variance on raw values + display orientation (T01–T04)
test("varianceOf: the variance rule on raw values", () => {
    assert.deepEqual(E.varianceOf(110, 100, false), { delta: 10, deltaPct: 0.1, good: true });
    assert.deepEqual(E.varianceOf(-110, -100, false), { delta: -10, deltaPct: -0.1, good: false });
    assert.equal(E.varianceOf(110, 100, true).good, false);              // VarianceInvert flips the colour only
    assert.equal(E.varianceOf(5, 0, false).deltaPct, null);              // Δ% against zero is undefined
    assert.deepEqual(E.varianceOf(null, 100, false), { delta: null, deltaPct: null, good: true });
    // variance() is exactly varianceOf on node.computed
    const m = E.buildModel([row("a", null, { values: { ac: 12, py: 10 }, varianceInvert: true })], "U");
    assert.deepEqual(E.variance(m.byId.get("a"), "py"), E.varianceOf(12, 10, true));
});

test("displayVariance: cost rows, VarianceInvert costs, margin rows (%p)", () => {
    // T03A Operating expenses: costs stored negative (sign −1) and shown positive
    const cost = row("opex", null, { sign: -1, displayInvert: true });
    const d = E.displayVariance(cost, -602.6, -565.2);
    assert.ok(Math.abs(d.d - 37.4) < 1e-9, "Δ follows the shown values: costs up = +37.4");
    assert.ok(Math.abs(d.p - 37.4 / 565.2) < 1e-12, "Δ% +6.6 %");
    assert.equal(d.good, false);
    assert.ok(d.impact < 0 && Math.abs(d.impact + 37.4) < 1e-9, "impact in good orientation: −37.4 (red below −20)");
    assert.equal(d.pp, false);
    // the other cost convention: positive costs + VarianceInvert — same picture
    const cost2 = row("opex2", null, { varianceInvert: true });
    const d2 = E.displayVariance(cost2, 602.6, 565.2);
    assert.ok(Math.abs(d2.d - 37.4) < 1e-9 && d2.good === false && d2.impact < 0);
    assert.ok(d2.impactPct < 0);
    // revenue row: plain
    const rev = E.displayVariance(row("rev", null), 896.4, 713.3);
    assert.ok(rev.good && rev.impact > 0 && Math.abs(rev.d - 183.1) < 1e-9);
    // T03A Gross margin: 45.3 % vs 36.7 % → +8.6 %p, relative +23 %
    const kpi = row("gm", null, { rowType: "kpi" });
    const k = E.displayVariance(kpi, 467.4 / 1031.2, 302.1 / 822.3);
    assert.equal(k.pp, true);
    assert.ok(Math.abs(k.d - (467.4 / 1031.2 - 302.1 / 822.3) * 100) < 1e-9);
    assert.equal(Math.round(k.d * 10) / 10, 8.6);
    assert.equal(Math.round(k.p * 100), 23);
    assert.equal(k.good, true);
    assert.equal(E.displayVariance(rev ? row("x", null) : null, null, 3), null);
});

// demo data hygiene — the forbidden trio (SignConvention −1 + VarianceInvert true) turns the
// rating twice: a cost overrun would be coloured favourable (finance-data-model, konten-dimension §6)
test("demo data: no sign −1 row carries VarianceInvert; tax overrun rates unfavourable", () => {
    const sb = { window: {} };
    require("vm").runInNewContext(require("fs").readFileSync(path.join(__dirname, "demo-data.js"), "utf8"), sb);
    const rows = sb.window.PNL_DEMO.levelRows;
    const bad = rows.filter(r => r.sign < 0 && r.varianceInvert);
    assert.deepEqual(bad.map(r => r.account), [], "forbidden trio -1 · * · true in demo data");
    const tax = rows.find(r => r.account === "900110");
    assert.ok(tax && tax.sign === -1 && tax.displayInvert === true && tax.varianceInvert === false);
    // AC 18.5 against PL 16.9 (more tax than planned): computed −18.5 vs −16.9
    const d = E.displayVariance(tax, tax.sign * 18.5, tax.sign * 16.9);
    assert.equal(d.good, false, "more tax than planned = unfavourable (red)");
    assert.ok(Math.abs(d.d - 1.6) < 1e-9 && d.impact < 0);
    // …and less tax than planned = favourable
    assert.equal(E.displayVariance(tax, -15, -16.9).good, true);
});

// 1.1 Paket B — numbers.sumSafeRounding (largest remainder along the hierarchy)
test("largestRemainder: floors + the biggest remainders, surplus from the smallest, ties in order", () => {
    assert.deepEqual(E.largestRemainder([1.4, 1.4, 1.4], 4), [2, 1, 1]);
    assert.deepEqual(E.largestRemainder([1.2, 1.7, 1.1], 4), [1, 2, 1]);
    // already consistent: plain rounding comes back
    assert.deepEqual(E.largestRemainder([1.2, 1.7, 2.6], 6), [1, 2, 3]);
    // a parent rounded down by its own parent: one unit comes off the smallest remainder
    assert.deepEqual(E.largestRemainder([1.1, 1.8], 2), [1, 1]);
    // negative values floor towards −∞
    assert.deepEqual(E.largestRemainder([-1.4, -1.4, -1.4], -4), [-1, -1, -2]);
    assert.deepEqual(E.largestRemainder([], 0), []);
});

test("sumSafeRound: printed children add up to the printed subtotal, formulas + margins excluded", () => {
    const m = E.buildModel([
        row("rev", null, { rowType: "subtotal" }),
        row("a", "rev", { values: { ac: 1.4 } }), row("b", "rev", { values: { ac: 1.4 } }), row("c", "rev", { values: { ac: 1.4 } }),
        row("cost", null, { rowType: "subtotal", sign: -1, displayInvert: true }),
        row("x", "cost", { values: { ac: 0.6 } }), row("y", "cost", { values: { ac: 0.6 } }),
        row("res", null, { rowType: "formula", formulaDef: "[rev]+[cost]" }),
        row("gm", null, { rowType: "kpi", formulaDef: "[res]/[rev]" }),
    ], "Unassigned");
    const ss = E.sumSafeRound(m.roots, n => n.computed.ac, 1);
    // 1.4 × 3 = 4.2 → 4: plain rounding prints 1 + 1 + 1 = 3
    assert.equal(ss.get("rev"), 4);
    assert.deepEqual(["a", "b", "c"].map(k => ss.get(k)), [2, 1, 1]);
    // cost = −1 × (0.6 + 0.6) = −1.2 → −1: the children share +1 (sign −1 of the parent)
    assert.equal(ss.get("cost"), -1);
    assert.equal(ss.get("x") + ss.get("y"), 1);
    // formula row: exact rounding (4.2 − 1.2 = 3.0), margin row: never in the map
    assert.equal(ss.get("res"), 3);
    assert.equal(ss.has("gm"), false);
    // quantum 0.1 (one decimal) — the values already sum exactly: nothing moves
    const s1 = E.sumSafeRound(m.roots, n => n.computed.ac, 0.1);
    assert.ok(Math.abs(s1.get("a") - 1.4) < 1e-9 && Math.abs(s1.get("rev") - 4.2) < 1e-9);
    assert.equal(E.sumSafeRound(m.roots, n => n.computed.ac, 0).size, 0, "no quantum, no map");
});

test("sumSafeRound: random hierarchies — Σ printed children = printed parent, each within one quantum", () => {
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let iter = 0; iter < 300; iter++) {
        const rows = [];
        let id = 0;
        const grow = (parent, depth) => {
            const k = 1 + Math.floor(rnd() * 4);
            for (let i = 0; i < k; i++) {
                const me = "n" + (id++);
                const sub = depth < 3 && rnd() < 0.4;
                rows.push(row(me, parent, sub ? { rowType: "subtotal", sign: rnd() < 0.3 ? -1 : 1 }
                    : { values: { ac: Math.round((rnd() - 0.3) * 100000) / 100 } }));
                if (sub) { grow(me, depth + 1); }
            }
        };
        grow(null, 0);
        const m = E.buildModel(rows, "Unassigned");
        const quantum = [1, 0.1, 10][iter % 3];
        const ss = E.sumSafeRound(m.roots, n => n.computed.ac, quantum);
        for (const n of m.byId.values()) {
            const v = n.computed.ac; const p = ss.get(n.row.id);
            if (v == null) { continue; }
            assert.ok(Math.abs(p - v) < 1.5 * quantum + 1e-9, "within reach of the exact value");
            const kids = n.children.filter(c => c.computed.ac != null);
            if (n.row.rowType !== "subtotal" || kids.length === 0) { continue; }
            const sum = kids.reduce((a, c) => a + ss.get(c.row.id), 0) * n.row.sign;
            assert.ok(Math.abs(sum - p) < 1e-6 * Math.max(1, Math.abs(p)), `iter ${iter}: ${sum} vs ${p}`);
        }
    }
});

console.log(`\n${n} engine test blocks passed`);
