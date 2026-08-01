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

console.log(`\n${n} engine test blocks passed`);
