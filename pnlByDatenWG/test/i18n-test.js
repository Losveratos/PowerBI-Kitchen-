/* eslint-disable powerbi-visuals/non-literal-fs-path -- test tooling, paths are fixed under the repo */
// language files (plain node): stringResources/<locale>/resources.resjson for
// de-DE · en-US · es-ES · ja-JP must carry the SAME keys, every key the code
// asks for must exist, the English fallback table of src/i18n.ts must equal
// en-US, placeholders must match, and no German may leak into en/es/ja.
// Run: node test/i18n-test.js  (part of npm test)
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.join(__dirname, "..");
const LOCALES = ["de-DE", "en-US", "es-ES", "ja-JP"];
const res = {};
for (const loc of LOCALES) {
    res[loc] = JSON.parse(fs.readFileSync(path.join(ROOT, "stringResources", loc, "resources.resjson"), "utf8"));
}

// settings + i18n compiled for node (powerbi-visuals-api is types + const enums only)
const OUT = path.join(__dirname, ".tmp-settings.cjs");
esbuild.buildSync({
    stdin: {
        contents: 'export * from "./src/settings"; export { UI_EN, fillArgs } from "./src/i18n";',
        resolveDir: ROOT, loader: "ts",
    },
    bundle: true, format: "cjs", platform: "node", outfile: OUT,
    alias: { "powerbi-visuals-api": path.join(__dirname, "pbi-shim.js") },
});
const M = require("./.tmp-settings.cjs");

let n = 0;
const test = (name, fn) => { fn(); n++; console.log("  ok · " + name); };
const keysOf = (o) => Object.keys(o).sort();

test("four locale folders, nothing else (Power BI reads stringResources/<locale>/resources.resjson)", () => {
    const dirs = fs.readdirSync(path.join(ROOT, "stringResources")).sort();
    assert.deepStrictEqual(dirs, LOCALES);
    const pbiviz = JSON.parse(fs.readFileSync(path.join(ROOT, "pbiviz.json"), "utf8"));
    assert.deepStrictEqual(pbiviz.stringResources, [], "pbiviz.json lists no legacy json files");
});

test("identical key sets in de-DE, en-US, es-ES and ja-JP", () => {
    const base = keysOf(res["en-US"]);
    for (const loc of LOCALES) {
        const k = keysOf(res[loc]);
        const missing = base.filter(x => !k.includes(x));
        const extra = k.filter(x => !base.includes(x));
        assert.deepStrictEqual([missing, extra], [[], []], loc + " differs from en-US");
    }
    console.log("       " + base.length + " keys per locale");
});

test("no empty value, placeholders {0} {1} identical in every locale", () => {
    for (const k of Object.keys(res["en-US"])) {
        const ph = (s) => (s.match(/\{\d\}/g) || []).sort().join(",");
        for (const loc of LOCALES) {
            assert.ok(typeof res[loc][k] === "string" && res[loc][k].trim() !== "", loc + " " + k + " empty");
            assert.strictEqual(ph(res[loc][k]), ph(res["en-US"][k]), loc + " " + k + " placeholders");
        }
    }
});

test("English fallback table (src/i18n.ts) equals en-US", () => {
    for (const [k, v] of Object.entries(M.UI_EN)) {
        assert.strictEqual(res["en-US"][k], v, "UI_EN." + k);
    }
});

test("every tr(\"…\") key of the visual exists", () => {
    const src = fs.readFileSync(path.join(ROOT, "src/visual.ts"), "utf8");
    const used = new Set([...src.matchAll(/\btr\("([A-Za-z0-9_]+)"/g)].map(m => m[1]));
    // keys handed around as strings (trMsg rules, demo names)
    for (const m of src.matchAll(/"(UI_[A-Za-z0-9_]+)"/g)) { used.add(m[1]); }
    // 1.4: the hub's catalogues (gallery groups + tiles, field roles, checklist) name their keys in src/hub.ts
    const hub = fs.readFileSync(path.join(ROOT, "src/hub.ts"), "utf8");
    for (const m of hub.matchAll(/"(UI_[A-Za-z0-9_]+)"/g)) { used.add(m[1]); }
    // the Smart Start demo and (1.7) the balance-sheet / cash-flow examples of the gallery
    const demo = fs.readFileSync(path.join(ROOT, "src/demo.ts"), "utf8") + fs.readFileSync(path.join(ROOT, "src/demo-stock.ts"), "utf8");
    const levels = [...demo.matchAll(/levels: (\[[^\]]*\])/g)].flatMap(m => JSON.parse(m[1]));
    const refs = [...demo.matchAll(/\[@([A-Za-z]+)\]/g)].map(m => m[1]);
    for (const k of [...levels, ...refs]) { used.add("UI_DN_" + k); }
    assert.ok(used.size > 120, "found " + used.size + " keys");
    const missing = [...used].filter(k => !(k in res["en-US"]));
    assert.deepStrictEqual(missing, []);
    // and nothing the visual does not use anymore
    const uiKeys = Object.keys(res["en-US"]).filter(k => k.startsWith("UI_"));
    const unused = uiKeys.filter(k => !used.has(k));
    assert.deepStrictEqual(unused, [], "unused UI keys");
});

test("every key of the format pane (cards, groups, slices, descriptions, enums, placeholders) exists", () => {
    const keys = M.paneKeys(new M.VisualFormattingSettingsModel());
    assert.ok(keys.length > 150, "pane keys: " + keys.length);
    const missing = keys.filter(k => !(k in res["en-US"]));
    assert.deepStrictEqual(missing, []);
});

test("every slice of the pane carries a name key AND a description key", () => {
    const m = new M.VisualFormattingSettingsModel();
    const bad = [];
    for (const card of m.cards) {
        const groups = card.groups || [card];
        for (const g of groups) {
            for (const s of g.slices) {
                if (!s.displayNameKey || !s.descriptionKey) { bad.push(card.name + "." + s.name); }
            }
        }
    }
    assert.deepStrictEqual(bad, []);
});

test("capabilities.json: every role name + description key exists", () => {
    const caps = JSON.parse(fs.readFileSync(path.join(ROOT, "capabilities.json"), "utf8"));
    const missing = [];
    for (const r of caps.dataRoles) {
        for (const k of [r.displayNameKey, r.descriptionKey]) {
            if (!k || !(k in res["en-US"])) { missing.push(r.name + ":" + k); }
        }
    }
    assert.deepStrictEqual(missing, []);
});

test("no German in en-US, es-ES, ja-JP (umlauts, ß, „“, German words)", () => {
    const de = /[äöüÄÖÜß„]|\b(und|oder|nicht|Zeile|Zeilen|Spalte|Wert|Standard|anzeigen|Abweichung|Ebene|Kachel|Baum|Monat)\b/;
    for (const loc of ["en-US", "es-ES", "ja-JP"]) {
        const hits = Object.entries(res[loc]).filter(([k, v]) => de.test(v)
            // demo account names that are the same proper name in every language
            && !["UI_DN_Consumer"].includes(k));
        assert.deepStrictEqual(hits.map(([k, v]) => k + "=" + v), [], loc);
    }
});

test("ja-JP is Japanese and es-ES is Spanish wherever English has words", () => {
    const words = (s) => (s.match(/[A-Za-z]{3,}/g) || []).filter(w => !/^(AC|PY|PL|FC|YTD|MTD|FY|IBCS|EBIT|EBITDA|EUR|DuPont|Full|HD|UHD|Auto|Rev|Ref|SAY|CC|BY|SA|ibcs|com|HICHERT|FAISST|GmbH|Standards|Association|DEMO|Rx|Consumer|Health|Drill|Teal|Normal|Status|Forecast|Plan|Contoso|Group|Consolidated|DWG|Pins|demo|data)$/i.test(w));
    const jp = /[぀-ヿ一-鿿]/;
    const notJa = []; const sameEs = [];
    for (const [k, en] of Object.entries(res["en-US"])) {
        if (words(en).length < 2) { continue; }
        if (!jp.test(res["ja-JP"][k])) { notJa.push(k); }
        if (res["es-ES"][k] === en) { sameEs.push(k); }
    }
    assert.deepStrictEqual(notJa, [], "ja-JP not translated");
    assert.deepStrictEqual(sameEs, [], "es-ES equals English");
});

test("ChartKitchen terminology: scenario names as in its resjson", () => {
    const ck = path.join(ROOT, "..", "ibcsInspiredChartDeck", "stringResources");
    if (!fs.existsSync(ck)) { return; }
    const ckRes = (loc) => JSON.parse(fs.readFileSync(path.join(ck, loc, "resources.resjson"), "utf8"));
    for (const loc of LOCALES) {
        const c = ckRes(loc);
        // PY / PL / FC reference items carry exactly ChartKitchen's wording
        assert.strictEqual(res[loc].Enum_Ref_Py, c.Enum_Comparison_Py, loc + " PY");
        assert.strictEqual(res[loc].Enum_Ref_Pl, c.Enum_Comparison_Plan, loc + " PL");
        assert.strictEqual(res[loc].Enum_Appearance_Dark, c.Enum_Appearance_Dark, loc + " dark");
        assert.strictEqual(res[loc].Enum_Appearance_Light, c.Enum_Appearance_Light, loc + " light");
        assert.strictEqual(res[loc].Style_Appearance, c.Colors_Appearance, loc + " appearance");
    }
});

test("src/demo.ts is in sync with its generator (test/gen-demo.js)", () => {
    const { execFileSync } = require("child_process");
    const fresh = execFileSync(process.execPath, [path.join(__dirname, "gen-demo.js"), "--print"], { encoding: "utf8" });
    assert.strictEqual(fs.readFileSync(path.join(ROOT, "src/demo.ts"), "utf8"), fresh);
});

test("1.7 the stock fixtures (test/stock-data.js, src/demo-stock.ts, demoData/*.csv) are in sync with test/gen-stock.js", () => {
    const { execFileSync } = require("child_process");
    const out = execFileSync(process.execPath, [path.join(__dirname, "gen-stock.js"), "--check"], { encoding: "utf8" });
    assert.ok(/up to date/.test(out), out);
});

fs.unlinkSync(OUT);
console.log("\n" + n + " language-file checks passed");
