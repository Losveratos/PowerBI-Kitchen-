/* eslint-disable powerbi-visuals/non-literal-fs-path -- test tooling, paths are fixed under the repo */
/*
 * 1.0 package (headless Chromium over test/test.html):
 *   A · Smart Start — demo statement while no fields are bound: edit mode only,
 *       never in reading mode or exports, missing-role hint, local-only state,
 *       localized demo (names AND formulas), clean hand-over to real data
 *   B · Dark mode — auto in a light theme renders byte-identical to "light";
 *       dark / auto-on-a-dark-theme palettes, high contrast stays light,
 *       two visuals on one page keep their own palette
 *   C · Format pane — card order and the visibility gates (getFormattingModel)
 *   D · Languages in the picture — per locale a mega-table screenshot
 *       (test/i18n-<locale>.png) + a format-pane dump (test/i18n-pane-<locale>.json):
 *       no German in en/es/ja, number and month formats of the locale
 *
 * Run: node test/start-dark-test.js  (after node test/build.js; npm run test:start)
 */
const fs = require("fs");
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const failures = [];
const notes = [];
function check(label, cond, detail) {
    if (cond) { notes.push("  ok · " + label); return; }
    failures.push(label + (detail ? " — " + detail : ""));
}
const GERMAN = /[äöüÄÖÜß„]|\b(und|oder|nicht|Zeile|Zeilen|Spalte|Spalten|Standard|anzeigen|Abweichung|Ebene|Kachel|Baum|Monat|Ansicht|Einheit|Dichte|Optionen|günstige|Jahresverlauf|Ausblick)\b/;

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
    let errors = 0;
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    page.on("console", m => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
    await page.goto("file://" + __dirname + "/test.html");
    await page.waitForTimeout(300);

    // shared page helpers
    await page.evaluate(() => {
        document.querySelectorAll(".case").forEach(c => c.remove());
        window.__stage = (id, w, h) => {
            const d = document.createElement("div");
            d.id = id; d.style.cssText = `width:${w}px;height:${h}px;position:relative;margin:8px;`;
            document.body.appendChild(d);
            return d;
        };
        window.__mk = (id, w, h, locale, hostOpts) => {
            const el = window.__stage(id, w, h);
            const host = makeHost(locale || "en-US");
            host.__persist = [];
            host.persistProperties = (p) => { host.__persist.push(JSON.parse(JSON.stringify(p))); };
            Object.assign(host, hostOpts || {});
            const v = new Visual({ element: el, host });
            v.__host = host; v.__el = el; v.__w = w; v.__h = h;
            v.__upd = (dataViews, viewMode) => v.update({ dataViews, viewport: { width: w, height: h }, type: 2, viewMode });
            return v;
        };
        window.__texts = (el) => [el.innerText, ...[...el.querySelectorAll("svg text")].map(t => t.textContent)].join("\n");
        /** visible pane: [{card, groups: [{group, slices: [propertyName]}]}] + every display string */
        window.__pane = (v) => {
            const fm = v.getFormattingModel();
            const strings = [];
            const cards = fm.cards.map(c => {
                strings.push(c.displayName, c.description);
                return {
                    card: c.uid.replace(/-card$/, ""),
                    groups: c.groups.map(g => {
                        strings.push(g.displayName, g.description);
                        return {
                            group: g.uid.replace(/-group$/, ""),
                            slices: (g.slices || []).map(s => {
                                strings.push(s.displayName, s.description);
                                const p = s.control && s.control.properties;
                                for (const it of (p && p.items) || []) { strings.push(it.displayName); }
                                if (p && p.placeholder) { strings.push(p.placeholder); }
                                return p && p.descriptor ? p.descriptor.propertyName : s.uid;
                            }),
                        };
                    }),
                };
            });
            return { cards, strings: strings.filter(x => x != null) };
        };
        window.__visible = (pane) => new Set(pane.cards.flatMap(c => c.groups.flatMap(g => g.slices.map(s => c.card + "." + s))));
    });

    // ===================================================================== A · Smart Start
    const A = await page.evaluate(() => {
        const out = {};
        // A1 — dropped on a page in edit mode (harness: host gives no view mode = edit)
        const v = __mk("s1", 1100, 640);
        v.__upd([]);
        const el = v.__el;
        out.banner = !!el.querySelector('[data-pnl="demo-banner"]');
        out.badge = (el.querySelector('[data-pnl="demo-badge"]') || {}).textContent;
        out.title = el.innerText.includes("Sample Pharma Group · demo data");
        out.rows = el.querySelectorAll('[data-pnl="hdr-row"]').length > 0;
        out.texts = __texts(el);
        out.selHandles = el.querySelectorAll("[data-pnl-row]").length;
        // explore: toolbar → tree view, nothing may be persisted
        const tree = [...el.querySelectorAll("button")].find(b => b.textContent === "Tree");
        tree.click();
        out.treeCards = el.querySelectorAll("svg g rect[rx='4']").length;
        out.persistAfterClick = v.__host.__persist.length;
        // a right click on a card does not reach the host either
        window.__selReset();
        el.querySelector("svg g").dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: 10, clientY: 10 }));
        out.selCalls = window.__selLog.length;
        // A6 — real data arrives: the demo leaves, persisted state of the report applies
        v.__upd([dv({ state: { uiState: JSON.stringify({ view: "bars" }) } })]);
        out.afterBanner = !!el.querySelector('[data-pnl="demo-banner"]');
        out.afterBars = [...el.querySelectorAll("button")].some(b => b.textContent === "Bars" && b.style.fontWeight === "600");
        out.afterUnitLine = el.innerText.includes("Sample Pharma Group");
        out.afterSel = el.querySelectorAll("[data-pnl-row]").length;
        // and back to no data: the demo returns
        v.__upd([]);
        out.backDemo = !!el.querySelector('[data-pnl="demo-banner"]');

        // A2 — reading mode (ViewMode.View = 0): plain landing, no demo numbers
        const r = __mk("s2", 1100, 640); r.__upd([], 0);
        out.readBanner = !!r.__el.querySelector('[data-pnl="demo-banner"]');
        out.readLanding = r.__el.innerText.includes("Add the AC measure");
        out.readNumbers = /1\s?685\.3/.test(r.__el.innerText);
        // in-focus edit (2) is edit
        const f = __mk("s2b", 1100, 640); f.__upd([], 2);
        out.focusBanner = !!f.__el.querySelector('[data-pnl="demo-banner"]');
        // A3 — export / subscription: allowInteractions = false
        const x = __mk("s3", 1100, 640, "en-US", { hostCapabilities: { allowInteractions: false } }); x.__upd([], 1);
        out.exportBanner = !!x.__el.querySelector('[data-pnl="demo-banner"]');
        out.exportLanding = x.__el.innerText.includes("Add the AC measure");
        // A4 — too small for a statement: text landing
        const t = __mk("s4", 280, 200); t.__upd([]);
        out.tinyBanner = !!t.__el.querySelector('[data-pnl="demo-banner"]');
        // A5 — fields half bound: the hint names what is missing
        const h = __mk("s5", 1100, 640);
        const col = (role, name, vals) => ({ source: { roles: { [role]: true }, displayName: name }, values: vals });
        h.__upd([{ categorical: { categories: [col("levels", "L1", ["a", "b"])], values: [] },
            metadata: { objects: {}, columns: [{ roles: { levels: true }, displayName: "L1" }] } }]);
        out.missing = (h.__el.querySelector('[data-pnl="demo-missing"]') || {}).textContent;
        const h2 = __mk("s5b", 1100, 640);
        h2.__upd([{ categorical: { categories: [], values: [col("ac", "AC", [1])] },
            metadata: { objects: {}, columns: [{ roles: { ac: true }, displayName: "AC" }] } }]);
        out.missing2 = (h2.__el.querySelector('[data-pnl="demo-missing"]') || {}).textContent;
        // A7 — the demo speaks the report's language, formulas included
        const de = __mk("s7", 1100, 900, "de-DE"); de.__upd([]);
        out.deTexts = __texts(de.__el);
        const ja = __mk("s7b", 1100, 900, "ja-JP"); ja.__upd([]);
        out.jaTexts = __texts(ja.__el);
        // A8 — a mega template picked in the pane applies to the demo
        const mt = __mk("s8", 1300, 700); mt.__upd([{ metadata: { objects: { columns: { template: "T03A" } } } }]);
        out.megaDemo = !!mt.__el.querySelector('svg[data-pnl="mega-head"]');
        out.megaPersist = mt.__host.__persist.length;
        return out;
    });
    check("Smart Start: the demo banner appears in edit mode", A.banner);
    check("Smart Start: the DEMO badge is there", A.badge === "DEMO", A.badge);
    check("Smart Start: the title carries the demo unit line", A.title);
    check("Smart Start: the demo renders a real statement table", A.rows);
    check("Smart Start: demo EBITDA reconciles (AC 571.2)", /EBITDA[\s\S]{0,40}571\.2/.test(A.texts));
    check("Smart Start: demo net income reconciles (AC 339.5)", /Net income[\s\S]{0,40}339\.5/.test(A.texts));
    check("Smart Start: no selection handles on demo rows", A.selHandles === 0, A.selHandles);
    check("Smart Start: the toolbar works on the demo (tree view)", A.treeCards > 3, A.treeCards);
    check("Smart Start: exploring the demo persists nothing", A.persistAfterClick === 0, A.persistAfterClick);
    check("Smart Start: no selection / context menu calls on the demo", A.selCalls === 0, A.selCalls);
    check("Smart Start: real data removes the banner", !A.afterBanner);
    check("Smart Start: the report's persisted state applies after the demo", A.afterBars);
    check("Smart Start: the demo unit line leaves with the demo", !A.afterUnitLine);
    check("Smart Start: real rows are selectable again", A.afterSel > 0, A.afterSel);
    check("Smart Start: removing the fields brings the demo back", A.backDemo);
    check("Smart Start: reading mode shows no demo", !A.readBanner && A.readLanding && !A.readNumbers);
    check("Smart Start: in-focus edit counts as edit", A.focusBanner);
    check("Smart Start: exports (allowInteractions = false) never show the demo", !A.exportBanner && A.exportLanding);
    check("Smart Start: a tiny visual gets the text landing", !A.tinyBanner);
    check("Smart Start: missing AC is named", A.missing === "Still missing: AC (actual)", A.missing);
    check("Smart Start: missing hierarchy is named", A.missing2 === "Still missing: level columns or account ID", A.missing2);
    check("Smart Start: German demo — names and formulas localized (EBITDA 571,2)",
        A.deTexts.includes("Umsatzerlöse") && /EBITDA[\s\S]{0,40}571,2/.test(A.deTexts) && A.deTexts.includes("Beispiel-GuV"));
    check("Smart Start: Japanese demo — names localized (売上高, 当期純利益 339.5)",
        A.jaTexts.includes("売上高") && /当期純利益[\s\S]{0,40}339\.5/.test(A.jaTexts) && A.jaTexts.includes("デモ"));
    check("Smart Start: a pane template reaches the demo (mega table)", A.megaDemo);

    // ===================================================================== B · Dark mode
    const B = await page.evaluate(() => {
        const out = {};
        const cases = {
            table: (o) => [dv({ hierarchy: { defaultLevel: 2 }, ...o })],
            mega: (o) => [dvRows(MEGA_DEMO.statement("T04"), { toolbar: { show: false }, hierarchy: { defaultLevel: 0 },
                columns: { template: "T04B" }, ...o })],
            tree: (o) => [dv({ state: { uiState: JSON.stringify({ view: "tree", treeV: 2 }) }, ...o })],
            tile: (o) => [dv({ state: { uiState: JSON.stringify({ view: "tree", treeV: 2, treeZoom: "F_EBITDA" }) }, ...o })],
            waterfall: (o) => [dv({ state: { uiState: JSON.stringify({ view: "waterfall" }) }, ...o })],
        };
        // B1 — auto in a light theme == light == the untouched default, byte for byte
        out.identical = {};
        for (const [k, mk] of Object.entries(cases)) {
            const html = {};
            for (const ap of ["default", "auto", "light"]) {
                const v = __mk("b1" + k + ap, 1300, 800, "en-US", { colorPalette: { isHighContrast: false, background: { value: "#FFFFFF" } } });
                v.__upd(mk(ap === "default" ? {} : { style: { appearance: ap } }));
                html[ap] = v.__el.innerHTML.replace(/(id="|url\(#)[^")]+/g, "$1X");
                v.__el.remove();
            }
            out.identical[k] = html.default === html.auto && html.auto === html.light;
        }
        // B2 — explicit dark
        const d = __mk("b2", 1300, 800); d.__upd(cases.table({ style: { appearance: "dark" } }));
        const root = d.__el.querySelector(".pnl-root");
        out.darkBg = getComputedStyle(root).backgroundColor;
        out.darkInk = getComputedStyle(root).color;
        out.darkBars = [...d.__el.querySelectorAll("svg rect")].map(r => r.getAttribute("fill"));
        const act = [...d.__el.querySelectorAll("button")].find(b => b.textContent === "Table");
        out.darkActive = [act.style.backgroundColor, act.style.color];
        const tm = __mk("b2m", 1300, 800); tm.__upd(cases.mega({ style: { appearance: "dark" } }));
        out.megaText = [...tm.__el.querySelectorAll('svg[data-pnl="mega-body"] text')].map(t => t.getAttribute("fill") || "");
        out.megaRoot = tm.__el.querySelector('svg[data-pnl="mega-body"]').getAttribute("fill");
        out.megaFills = [...tm.__el.querySelectorAll('svg[data-pnl="mega-body"] rect')].map(r => r.getAttribute("fill"));
        const tr = __mk("b2t", 1300, 800); tr.__upd(cases.tree({ style: { appearance: "dark" } }));
        out.treeCardFill = [...tr.__el.querySelectorAll("svg rect[rx='4']")].map(r => r.getAttribute("fill"))[0];
        out.treeText = [...tr.__el.querySelectorAll("svg text")].map(t => t.getAttribute("fill"));
        const ti = __mk("b2z", 1420, 1100); ti.__upd(cases.tile({ style: { appearance: "dark" } }));
        out.tileBg = getComputedStyle(ti.__el.querySelector('[data-pnl="zoom-center"]')).backgroundColor;
        out.tileBack = getComputedStyle(ti.__el.querySelector('[data-pnl="zoom-back"]')).color;
        // B3 — auto on a dark report theme follows the theme, paper = theme background
        const a = __mk("b3", 900, 500, "en-US", { colorPalette: { isHighContrast: false, background: { value: "#202020" } } });
        a.__upd(cases.table({}));
        out.autoBg = getComputedStyle(a.__el.querySelector(".pnl-root")).backgroundColor;
        // B4 — high contrast keeps the light path even when dark is picked
        const hc = __mk("b4", 900, 500, "en-US", { colorPalette: { isHighContrast: true, background: { value: "#000000" } } });
        hc.__upd(cases.table({ style: { appearance: "dark" } }));
        out.hcBg = getComputedStyle(hc.__el.querySelector(".pnl-root")).backgroundColor;
        // B5 — an explicit accent / page colour stays the author's choice
        const c = __mk("b5", 900, 500); c.__upd(cases.table({ style: { appearance: "dark",
            accentColor: { solid: { color: "#C25A2D" } }, pageBackground: { solid: { color: "#102030" } } } }));
        const cAct = [...c.__el.querySelectorAll("button")].find(b => b.textContent === "Table");
        out.customAccent = cAct.style.backgroundColor;
        out.customBg = getComputedStyle(c.__el.querySelector(".pnl-root")).backgroundColor;
        // B6 — a light visual rendered after a dark one keeps its own palette
        const l = __mk("b6", 900, 500); l.__upd(cases.table({}));
        out.lightAfter = getComputedStyle(l.__el.querySelector(".pnl-root")).backgroundColor;
        d.__upd(cases.table({ style: { appearance: "dark" } }));   // dark again …
        [...l.__el.querySelectorAll("button")].find(b => b.textContent === "Bars").click(); // … then a light rerender
        out.lightRerender = getComputedStyle(l.__el.querySelector(".pnl-root")).backgroundColor;
        out.lightRerenderInk = getComputedStyle(l.__el.querySelector(".pnl-root")).color;
        // B7 — the demo in dark mode
        const dd = __mk("b7", 1100, 640); dd.__upd([{ metadata: { objects: { style: { appearance: "dark" } } } }]);
        out.demoDarkBg = getComputedStyle(dd.__el.querySelector(".pnl-root")).backgroundColor;
        out.demoDarkBanner = getComputedStyle(dd.__el.querySelector('[data-pnl="demo-banner"]')).backgroundColor;
        return out;
    });
    for (const [k, same] of Object.entries(B.identical)) {
        check(`Dark mode: default "auto" in a light theme is byte-identical to "light" (${k})`, same);
    }
    check("Dark mode: dark paper", B.darkBg === "rgb(30, 30, 30)", B.darkBg);
    check("Dark mode: light ink", B.darkInk === "rgb(224, 224, 224)", B.darkInk);
    check("Dark mode: teal / red variance bars use the dark pair (#3FB3C2 / #E4635F)",
        B.darkBars.includes("#3FB3C2") && B.darkBars.includes("#E4635F") && !B.darkBars.includes("#0E8585"));
    check("Dark mode: active toolbar button = light accent with dark text",
        B.darkActive[0] === "rgb(217, 217, 217)" && B.darkActive[1] === "rgb(30, 30, 30)", B.darkActive.join(" / "));
    check("Dark mode: mega table ink is light", B.megaRoot === "#E0E0E0", B.megaRoot);
    check("Dark mode: mega table keeps no light-paper fills", !B.megaFills.includes("#FFFFFF"), B.megaFills.filter(f => /^#F/.test(f)).join(","));
    check("Dark mode: tree cards on the dark card fill", B.treeCardFill === "#262624", B.treeCardFill);
    check("Dark mode: tree labels in light ink", B.treeText.includes("#E0E0E0") && !B.treeText.includes("#1A1A1A"));
    check("Dark mode: the big tile is dark", B.tileBg === "rgb(38, 38, 36)", B.tileBg);
    check("Dark mode: back button text readable on the light accent", B.tileBack === "rgb(30, 30, 30)", B.tileBack);
    check("Dark mode: auto follows a dark report theme (theme background as paper)", B.autoBg === "rgb(32, 32, 32)", B.autoBg);
    check("Dark mode: high contrast stays on the light path", B.hcBg === "rgb(255, 255, 255)", B.hcBg);
    check("Dark mode: a chosen accent stays", B.customAccent === "rgb(194, 90, 45)", B.customAccent);
    check("Dark mode: a chosen page background stays", B.customBg === "rgb(16, 32, 48)", B.customBg);
    check("Dark mode: a light visual next to a dark one stays light", B.lightAfter === "rgb(255, 255, 255)", B.lightAfter);
    check("Dark mode: … also when it re-renders after the dark one",
        B.lightRerender === "rgb(255, 255, 255)" && B.lightRerenderInk === "rgb(26, 26, 26)", B.lightRerender + " " + B.lightRerenderInk);
    check("Dark mode: the demo goes dark too", B.demoDarkBg === "rgb(30, 30, 30)" && B.demoDarkBanner !== "rgb(247, 246, 243)");

    // ===================================================================== C · Format pane
    const C = await page.evaluate(() => {
        const out = {};
        const pane = (rows, objects, locale) => {
            window.__cN = (window.__cN || 0) + 1;
            const v = __mk("c" + window.__cN, 1200, 600, locale || "en-US");
            v.__upd(rows ? [dvRows(rows, objects)] : [dv(objects)]);
            const p = __pane(v);
            v.__el.remove();
            return p;
        };
        const p0 = pane(null, {});
        out.order = p0.cards.map(c => c.card);
        out.groups = p0.cards.map(c => c.card + ":" + c.groups.map(g => g.group).join("|"));
        out.base = [...__visible(p0)];
        // statement data, nothing switched on
        out.regions = [...__visible(pane(MEGA_DEMO.regions(), {}))];
        out.t01a = [...__visible(pane(MEGA_DEMO.regions(), { columns: { template: "T01A", templateApplied: "T01A",
            showPY: true, showMinuend: true, dPyAbs: true, dPyPct: true, thresholds: true, secondBlock: true } }))];
        out.th1 = [...__visible(pane(MEGA_DEMO.regions(), { columns: { dPyAbs: true, thresholds: true } }))];
        out.sortCat = [...__visible(pane(MEGA_DEMO.regions(), { columns: { secondBlock: true, sort: "min" } }))];
        out.stmt = [...__visible(pane(MEGA_DEMO.statement("T03"), {}))];
        out.tree = [...__visible(pane(null, { state: { uiState: JSON.stringify({ view: "tree", treeV: 2 }) } }))];
        out.bars = [...__visible(pane(null, { state: { uiState: JSON.stringify({ view: "bars" }) } }))];
        out.noTb = [...__visible(pane(null, { toolbar: { show: false }, titleBlock: { show: false } }))];
        out.charts = [...__visible(pane(MEGA_DEMO.regions(), { columns: { showPL: true, dPlBar: true } }))];
        const noPy = MEGA_DEMO.statement("T03").map(r => ({ ...r, values: { ...r.values, py: null } }));
        const vNoPy = __mk("cnopy", 1200, 600);
        const dvx = dvRows(noPy, {});
        dvx.categorical.values = dvx.categorical.values.filter(c => !c.source.roles.py);
        vNoPy.__upd([dvx]);
        out.noPy = [...__visible(__pane(vNoPy))];
        // the empty visual (demo): every data gate open
        const e = __mk("cempty", 1100, 640); e.__upd([]);
        out.empty = [...__visible(__pane(e))];
        // German pane: names and descriptions localized, "Standard:" in the tone of ChartKitchen
        const pd = pane(null, {}, "de-DE");
        out.deStrings = pd.strings;
        return out;
    });
    const has = (arr, s) => arr.includes(s);
    check("Pane: card order columns → display → numbers → style → title → hierarchy",
        C.order.join(",") === "columns,toolbar,numbers,style,titleBlock,hierarchy", C.order.join(","));
    check("Pane: columns card = table | mega table (tree group gated), style card = colors | type | behavior",
        C.groups[0].startsWith("columns:columnsGeneral|columnsMega") && C.groups[3] === "style:styleColors|styleType|styleBehavior", C.groups.join(" ; "));
    check("Pane: mega switches visible in the table view", has(C.base, "columns.template") && has(C.base, "columns.dPlBar"));
    check("Pane: tree start settings hidden in the table view", !has(C.base, "columns.treeRoot"));
    check("Pane: tree view hides the mega switches and shows the tree start",
        !has(C.tree, "columns.template") && has(C.tree, "columns.treeRoot") && has(C.tree, "columns.treeCard"));
    check("Pane: bars view hides both mega and tree groups", !has(C.bars, "columns.template") && !has(C.bars, "columns.treeRoot"));
    check("Pane: threshold switch hidden without a Δ number column", !has(C.regions, "columns.thresholds"));
    check("Pane: threshold inputs only with thresholds = on",
        !has(C.regions, "columns.thresholdAbs") && has(C.th1, "columns.thresholdAbs") && has(C.th1, "columns.thresholdPct"));
    check("Pane: YTD thresholds only with the second block", !has(C.th1, "columns.thresholdYtdAbs") && has(C.t01a, "columns.thresholdYtdAbs"));
    check("Pane: sorting block only with two blocks and a sort", has(C.sortCat, "columns.sortBlock") && !has(C.t01a, "columns.sortBlock"));
    check("Pane: FC minuend only with a bound FC field", !has(C.base, "columns.minuend") && has(C.regions, "columns.minuend"));
    check("Pane: structure data shows subtotal blocks + sort, hides margin rows",
        has(C.regions, "columns.structureSubtotals") && has(C.regions, "columns.sort") && !has(C.regions, "columns.showPctRows"));
    check("Pane: statement data shows margin rows, hides subtotal blocks + sort",
        has(C.stmt, "columns.showPctRows") && !has(C.stmt, "columns.structureSubtotals") && !has(C.stmt, "columns.sort"));
    check("Pane: ΔPY switches hidden without PY, ΔPL stays", !has(C.noPy, "columns.dPyBar") && !has(C.noPy, "columns.showPY") && has(C.noPy, "columns.dPlBar"));
    check("Pane: value cascade only with a value column", !has(C.regions, "columns.valueCascade") && has(C.t01a, "columns.valueCascade"));
    check("Pane: chart labels / outlier arrows only with chart columns",
        !has(C.regions, "columns.chartLabels") && has(C.charts, "columns.chartLabels") && has(C.charts, "columns.capBars"));
    check("Pane: toolbar groups and title lines gated by their main switch",
        !has(C.noTb, "toolbar.showView") && has(C.noTb, "toolbar.showLegend") && !has(C.noTb, "titleBlock.unitLine")
        && has(C.base, "toolbar.showView") && has(C.base, "titleBlock.unitLine"));
    check("Pane: the empty visual / demo keeps every data gate open",
        has(C.empty, "columns.minuend") && has(C.empty, "columns.dPyBar") && has(C.empty, "columns.sort") && has(C.empty, "columns.showPctRows"));
    check("Pane: dark mode dropdown in the style card", has(C.base, "style.appearance"));
    check("Pane (de-DE): card names localized", C.deStrings.includes("Spalten & Mega-Table") && C.deStrings.includes("Darstellung & Toolbar"));
    check("Pane (de-DE): descriptions in the ChartKitchen tone with the default", C.deStrings.filter(s => /Standard: /.test(s)).length > 40);
    check("Pane (de-DE): enum items localized", C.deStrings.includes("Tausend (k)") && C.deStrings.includes("T03A · Statement PY·PL·AC + ΔPY·ΔPL"));

    // ===================================================================== D · languages in the picture
    const LOC = { "de-DE": { dec: ",", month: "Juni" }, "en-US": { dec: ".", month: "June" },
        "es-ES": { dec: ",", month: "junio" }, "ja-JP": { dec: ".", month: "6月" } };
    for (const [loc, exp] of Object.entries(LOC)) {
        const D = await page.evaluate((loc) => {
            const v = __mk("d" + loc, 1500, 1000, loc);
            // the pharma demo as a mega table T03A with month | _YTD blocks, toolbar + legend on
            v.__upd([dv({ hierarchy: { defaultLevel: 2 }, titleBlock: { measureLine: "" },
                columns: { template: "T03A", templateApplied: "T03A", showPY: true, showPL: true, showMinuend: true,
                    dPyAbs: true, dPyPct: true, dPlAbs: true, dPlPct: true, secondBlock: true, thresholds: true } })]);
            const p = __pane(v);
            return { texts: __texts(v.__el), pane: p.strings, head: [...v.__el.querySelectorAll('svg[data-pnl="mega-head"] text')].map(t => t.textContent) };
        }, loc);
        await page.locator("#d" + loc).screenshot({ path: path.join(__dirname, `i18n-${loc}.png`) });
        fs.writeFileSync(path.join(__dirname, `i18n-pane-${loc}.json`), JSON.stringify(D.pane, null, 1));
        // the data itself (pharma account names) is English in every locale — only UI text is checked
        const ui = D.texts.split("\n").filter(l => l.trim() !== "");
        if (loc !== "de-DE") {
            const bad = ui.filter(l => GERMAN.test(l));
            check(`${loc}: no German in the rendered visual`, bad.length === 0, bad.slice(0, 3).join(" | "));
            const badPane = D.pane.filter(s => GERMAN.test(s));
            check(`${loc}: no German in the format pane`, badPane.length === 0, badPane.slice(0, 3).join(" | "));
        } else {
            const words = ["Tabelle", "Wasserfall", "günstige Δ", "Notation nach den IBCS"];
            check("de-DE: the visual speaks German (toolbar, legend, footer)",
                words.every(w => D.texts.includes(w)), words.filter(w => !D.texts.includes(w)).join(","));
        }
        check(`${loc}: no raw resource key on screen or in the pane`,
            !/\b(UI|Enum|Desc|Mega|Style|Columns|Card|Toolbar|Title|Numbers|Hierarchy)_[A-Z][A-Za-z]+\b/.test(D.texts + D.pane.join("\n")));
        check(`${loc}: decimal separator "${exp.dec}" (EBITDA AC 571${exp.dec}2)`, D.texts.includes("571" + exp.dec + "2"));
        check(`${loc}: long month name of the locale in the block head (${exp.month})`, D.head.some(t => t.includes(exp.month)), D.head.slice(0, 4).join(","));
        if (loc === "ja-JP") {
            check("ja-JP: Japanese toolbar and footer", ["表示", "テーブル", "良い Δ", "表記は IBCS"].every(w => D.texts.includes(w)));
            check("ja-JP: short month labels in the title (1月..6月)", D.texts.includes("1月..6月"));
        }
        if (loc === "es-ES") {
            const words = ["Cascada", "Tabla", "Δ favorable", "Notación basada"];
            check("es-ES: Spanish toolbar and footer", words.every(w => D.texts.includes(w)), words.filter(w => !D.texts.includes(w)).join(","));
        }
    }

    await browser.close();
    for (const l of notes) { console.log(l); }
    if (errors > 0) { failures.push(errors + " page errors"); }
    if (failures.length > 0) {
        console.error("\nFAILED:\n  " + failures.join("\n  "));
        process.exit(1);
    }
    console.log("\n" + notes.length + " smart-start / dark-mode / pane / language checks passed — see test/i18n-*.png");
})();
