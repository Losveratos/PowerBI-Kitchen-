/* eslint-disable powerbi-visuals/non-literal-fs-path -- test tooling, paths are fixed under the repo */
/*
 * 1.1 Paket B — finance features (headless Chromium over test/test.html):
 *   F1  tooltips: host tooltipService on rows / cells / bars / pins / cascades,
 *       no title attributes on data rows, dark mode draws its own box
 *   F2  sum-safe rounding: printed children = printed subtotal (classic + mega),
 *       formula rows keep exact rounding
 *   F3  finance format: (1 234), + on positive Δ, threshold footer stays a rule
 *   F4  billions: numbers.scaling = b, auto picks b from 50 billion, toolbar button
 *   F5  house terms: toolbar, legend, column heads, mega heads, title, tooltips
 *   F6  title block: auto message, footer, filter footer + filterInfo, export
 *   F7  highlight band: classic + mega, high contrast outline, dark ink
 *   F8  materiality: soft Δ bars / pins / numbers / waterfall + tooltip note
 *   F9  toolbar scenario group (mega): minuend AC/FC, reference view, locks,
 *       persistence, echo guard, pane change resets the reader view
 *   F10 emptyState: own title / text (no rows · reading view without fields)
 *   F11 keyboard: tabindex / role / aria on fold controls, Enter / Space fold,
 *       focus ring, toolbar buttons announce their state
 *   + capabilities: tooltips, supportsKeyboardFocus, filterInfo role
 *
 * Screenshots: test/finance-*.png. Run: node test/finance-test.js (after node test/build.js)
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

const caps = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "capabilities.json"), "utf8"));
check("capabilities: tooltips default + canvas, supportsKeyboardFocus",
    caps.tooltips && caps.tooltips.supportedTypes.default === true && caps.tooltips.supportedTypes.canvas === true
    && caps.supportsKeyboardFocus === true);
const fi = caps.dataRoles.find(r => r.name === "filterInfo");
check("capabilities: optional text measure filterInfo (max 1) bound into the values",
    fi && fi.kind === "Measure" && caps.dataViewMappings[0].conditions[0].filterInfo.max === 1
    && caps.dataViewMappings[0].categorical.values.select.some(s => s.bind && s.bind.to === "filterInfo"));
check("capabilities: new objects (numbers.financeFormat/sumSafeRounding/scaling b, labels, titleBlock footers, columns highlight/materiality, emptyState, toolbar.showScenario)",
    caps.objects.numbers.properties.financeFormat && caps.objects.numbers.properties.sumSafeRounding
    && caps.objects.numbers.properties.scaling.type.enumeration.some(e => e.value === "b")
    && ["labelAc", "labelPy", "labelPl", "labelFc"].every(k => caps.objects.labels.properties[k])
    && ["autoMessage", "footer", "filterFooter"].every(k => caps.objects.titleBlock.properties[k])
    && ["highlight", "materialityAbs", "materialityPct"].every(k => caps.objects.columns.properties[k])
    && caps.objects.emptyState.properties.title && caps.objects.emptyState.properties.body
    && caps.objects.toolbar.properties.showScenario);

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
    let errors = 0;
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    page.on("console", m => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
    await page.goto("file://" + __dirname + "/test.html");
    await page.waitForTimeout(300);

    await page.evaluate(() => {
        document.querySelectorAll(".case").forEach(c => c.remove());
        // a small statement whose rounding does NOT add up: 3 × 1.4 = 4.2 → 4, 2 × 0.6 = 1.2 → 1
        window.FIN_ROWS = (over) => {
            const r = (levels, account, sort, v, o) => Object.assign({
                levels, account, sort, rowType: "account", formulaDef: null, sign: 1, displayInvert: false,
                varianceInvert: false, month: null, comment: null, values: v,
            }, o || {});
            const rows = [
                r(["Revenue", "Alpha"], "a", 1, { ac: 1.4, py: 1.0, pl: 1.3, fc: 1.5 }, { comment: "Price effect" }),
                r(["Revenue", "Beta"], "b", 2, { ac: 1.4, py: 1.1, pl: 1.0, fc: 1.2 }),
                r(["Revenue", "Gamma"], "c", 3, { ac: 1.4, py: 1.6, pl: 1.5, fc: 1.4 }),
                r(["Costs", "Material"], "x", 4, { ac: 0.6, py: 0.5, pl: 0.7, fc: 0.6 }, { sign: -1, displayInvert: true }),
                r(["Costs", "Services"], "y", 5, { ac: 0.6, py: 0.9, pl: 0.5, fc: 0.7 }, { sign: -1, displayInvert: true }),
                r(["Result"], "res", 9, {}, { rowType: "formula", formulaDef: "[Revenue]+[Costs]" }),
            ];
            return over ? rows.map(over) : rows;
        };
        window.__stage = (id, w, h) => {
            const d = document.createElement("div");
            d.id = id; d.style.cssText = `width:${w}px;height:${h}px;position:relative;margin:8px;border:1px solid #ddd;`;
            document.body.appendChild(d);
            return d;
        };
        window.__tips = [];
        window.__mk = (id, w, h, hostOpts) => {
            const el = window.__stage(id, w, h);
            const host = makeHost("en-US");
            host.__persist = [];
            host.persistProperties = (p) => { host.__persist.push(JSON.parse(JSON.stringify(p))); };
            host.tooltipService = {
                enabled: () => true,
                show: (o) => window.__tips.push({ id, call: "show", items: o.dataItems, ids: (o.identities || []).length }),
                move: () => window.__tips.push({ id, call: "move" }),
                hide: () => window.__tips.push({ id, call: "hide" }),
            };
            Object.assign(host, hostOpts || {});
            const v = new Visual({ element: el, host });
            v.__host = host; v.__el = el;
            v.__upd = (dataViews, viewMode) => v.update({ dataViews, viewport: { width: w, height: h }, type: 2, viewMode });
            return v;
        };
        /** dvRows + an optional filterInfo text measure */
        window.__dv = (rows, objects, filterInfo) => {
            const d = dvRows(rows, objects);
            if (rows.some(r => r.comment)) {
                d.categorical.categories.push({ source: { roles: { comment: true }, displayName: "Comment", index: 0 },
                    values: rows.map(r => r.comment) });
            }
            if (filterInfo != null) {
                d.categorical.values.push({ source: { roles: { filterInfo: true }, displayName: "Filter", index: 0 },
                    values: rows.map(() => filterInfo) });
            }
            return d;
        };
        /** classic table: row name → texts of its cells */
        window.__cells = (el) => {
            const out = {};
            el.querySelectorAll("[data-pnl-row]").forEach(r => {
                const kids = [...r.children];
                const name = kids[0].querySelector("span:last-of-type") ? kids[0].innerText.replace(/[▾▸]\s*/, "").trim() : kids[0].innerText;
                out[r.getAttribute("data-pnl-row")] = { name, cells: kids.slice(1).map(k => k.innerText.trim()), el: r };
            });
            return out;
        };
        /** mega body: label → the number texts of its row (left to right) */
        window.__megaRows = (el) => {
            const body = el.querySelector('svg[data-pnl="mega-body"]');
            const texts = [...body.querySelectorAll("text")].filter(t => !t.closest('g[data-pnl="mega-chart"]'))
                .map(t => ({ t: t.textContent, x: +t.getAttribute("x"), y: Math.round(+t.getAttribute("y")), fill: t.getAttribute("fill") }));
            const byY = new Map();
            for (const t of texts) { if (!byY.has(t.y)) { byY.set(t.y, []); } byY.get(t.y).push(t); }
            const out = {};
            for (const arr of byY.values()) {
                arr.sort((a, b) => a.x - b.x);
                const lab = arr.find(t => /[A-Za-z]/.test(t.t) && !/^[(+\-–0-9]/.test(t.t));
                if (!lab) { continue; }
                out[lab.t.replace(/\s*[▸①-⑳].*$/, "").trim()] = arr.filter(t => t.x > lab.x).map(t => t.t);
            }
            return out;
        };
        window.__heads = (el) => [...el.querySelectorAll('svg[data-pnl="mega-head"] text')].map(t => t.textContent);
        window.__btn = (el, label) => [...el.querySelectorAll("button")].find(b => b.textContent === label);
    });
    const shot = async (id, file) => {
        const el = await page.$("#" + id);
        if (el) { await el.screenshot({ path: path.join(__dirname, file) }); }
    };
    // 1.5.1: numbers carry the typographic minus (U+2212)
    const n = (s) => Number(String(s).replace(/[  \s]/g, "").replace(/\u2212/g, "-").replace(/^\((.*)\)$/, "-$1").replace("–", "0"));

    // ===================================================================== F1 · tooltips
    const F1 = await page.evaluate(() => {
        const out = {};
        const v = __mk("f1", 1100, 520);
        v.__upd([__dv(FIN_ROWS(), { columns: { preset: "acpldpl", pctRevenue: false }, numbers: { scaling: "none", decimals: 1 },
            hierarchy: { defaultLevel: 0 } })]);
        const rows = __cells(v.__el);
        out.titles = [...v.__el.querySelectorAll("[data-pnl-row], [data-pnl-row] *")].filter(e => e.getAttribute("title")).length;
        window.__tips.length = 0;
        rows.a.el.children[3].dispatchEvent(new MouseEvent("mouseover", { bubbles: true, clientX: 300, clientY: 200 }));
        rows.a.el.children[3].dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 302, clientY: 201 }));
        rows.a.el.children[3].dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
        out.calls = window.__tips.map(t => t.call);
        out.items = window.__tips[0] ? window.__tips[0].items : [];
        out.ids = window.__tips[0] ? window.__tips[0].ids : 0;
        // mega table: the hit rect of a row carries the tooltip (bars, pins, numbers)
        const m = __mk("f1m", 1300, 560);
        m.__upd([__dv(FIN_ROWS(), { columns: { template: "T04A" }, numbers: { scaling: "none" }, toolbar: { show: false } })]);
        window.__tips.length = 0;
        const hit = m.__el.querySelector('rect[data-pnl-part="cells"][data-pnl-row="b"]');
        hit.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, clientX: 500, clientY: 200 }));
        out.megaItems = window.__tips[0] ? window.__tips[0].items : [];
        out.megaTitles = m.__el.querySelectorAll("svg title").length;
        // dark mode: own box, the host is not asked
        const d = __mk("f1d", 1100, 520);
        d.__upd([__dv(FIN_ROWS(), { columns: { preset: "acpldpl", pctRevenue: false }, numbers: { scaling: "none", decimals: 1 },
            style: { appearance: "dark" }, hierarchy: { defaultLevel: 0 } })]);
        window.__tips.length = 0;
        const dr = __cells(d.__el).a.el;
        dr.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, clientX: 300, clientY: 200 }));
        const box = d.__el.querySelector('[data-pnl="dark-tip"]');
        out.darkBox = !!box;
        out.darkBg = box ? box.style.background : "";
        out.darkText = box ? box.innerText : "";
        out.darkHost = window.__tips.length;
        dr.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
        out.darkGone = !d.__el.querySelector('[data-pnl="dark-tip"]');
        return out;
    });
    const it = (arr, name) => (arr.find(x => x.displayName === name) || {}).value;
    check("F1 tooltip: no title attributes on data rows / cells", F1.titles === 0, String(F1.titles));
    check("F1 tooltip: show → move → hide on the host tooltipService", F1.calls.join(",") === "show,move,hide", F1.calls.join(","));
    check("F1 tooltip: row header, AC/PY/PL/FC, ΔPL abs + %, comment, identities",
        it(F1.items, "Row") === "Alpha" && it(F1.items, "AC") === "1.4 EUR" && it(F1.items, "PY") === "1.0 EUR"
        && it(F1.items, "PL") === "1.3 EUR" && it(F1.items, "FC") === "1.5 EUR" && it(F1.items, "ΔPL") === "+0.1 EUR"
        && it(F1.items, "ΔPL %") === "+7.7%" && it(F1.items, "① Comment") === "Price effect" && F1.ids > 0,
        JSON.stringify(F1.items));
    check("F1 tooltip (mega): Δ in display orientation of the table's reference, no svg <title>",
        it(F1.megaItems, "Row") === "Beta" && it(F1.megaItems, "ΔPL") === "+0.4 EUR" && it(F1.megaItems, "ΔPL %") === "+40.0%"
        && F1.megaTitles === 0, JSON.stringify(F1.megaItems));
    check("F1 tooltip (dark): own #2B2B2B box with the row, host not asked, gone on mouseout",
        F1.darkBox && /rgb\(43, 43, 43\)|#2B2B2B/i.test(F1.darkBg) && F1.darkText.startsWith("Alpha") && F1.darkHost === 0 && F1.darkGone,
        JSON.stringify([F1.darkBg, F1.darkText, F1.darkHost]));

    // ===================================================================== F2 · sum-safe rounding
    const F2 = await page.evaluate(() => {
        const out = {};
        const base = { columns: { preset: "acpldpl", pctRevenue: false }, numbers: { scaling: "none", decimals: 0 }, hierarchy: { defaultLevel: 0 } };
        const off = __mk("f2off", 1000, 420); off.__upd([__dv(FIN_ROWS(), base)]);
        const on = __mk("f2on", 1000, 420);
        on.__upd([__dv(FIN_ROWS(), { ...base, numbers: { ...base.numbers, sumSafeRounding: true } })]);
        const pick = (el) => { const c = __cells(el); const o = {}; for (const k of Object.keys(c)) { o[k] = c[k].cells; } return o; };
        out.off = pick(off.__el); out.on = pick(on.__el);
        // mega: T03A-like columns, structure of the statement
        const cols = { showPY: true, showPL: true, showMinuend: true, dPyAbs: true, dPlAbs: true };
        const mOff = __mk("f2moff", 1200, 420);
        mOff.__upd([__dv(FIN_ROWS(), { columns: cols, numbers: { scaling: "none", decimals: 0 }, toolbar: { show: false } })]);
        const mOn = __mk("f2mon", 1200, 420);
        mOn.__upd([__dv(FIN_ROWS(), { columns: cols, numbers: { scaling: "none", decimals: 0, sumSafeRounding: true }, toolbar: { show: false } })]);
        out.mOff = __megaRows(mOff.__el); out.mOn = __megaRows(mOn.__el);
        return out;
    });
    // classic cells: [AC, PL, ΔPL bar, ΔPL% pin]
    const ac = (o, k) => n(o[k][0]);
    check("F2 sum-safe off: plain rounding does not add up (1 + 1 + 1 ≠ 4) — the test data bites",
        ac(F2.off, "a") + ac(F2.off, "b") + ac(F2.off, "c") === 3 && ac(F2.off, "L:Revenue") === 4, JSON.stringify(F2.off));
    check("F2 sum-safe on (classic): Alpha + Beta + Gamma = Revenue, Material + Services = Costs",
        ac(F2.on, "a") + ac(F2.on, "b") + ac(F2.on, "c") === ac(F2.on, "L:Revenue")
        && ac(F2.on, "x") + ac(F2.on, "y") === ac(F2.on, "L:Costs"), JSON.stringify(F2.on));
    check("F2 sum-safe on (classic): the formula row keeps its exact rounding (4.2 − 1.2 = 3)", ac(F2.on, "res") === 3, F2.on.res && F2.on.res[0]);
    check("F2 sum-safe on (classic): PL column too, Δ label = printed AC − printed PL",
        n(F2.on.a[1]) + n(F2.on.b[1]) + n(F2.on.c[1]) === n(F2.on["L:Revenue"][1])
        && ["a", "b", "c", "L:Revenue"].every(k => n(F2.on[k][2]) === n(F2.on[k][0]) - n(F2.on[k][1])), JSON.stringify(F2.on));
    const mv = (o, k, i) => n(o[k][i]);
    // mega numbers per row: PY | PL | AC | ΔPY | ΔPL
    check("F2 sum-safe on (mega): every value column adds up, Δ = printed AC − printed reference",
        [0, 1, 2].every(i => mv(F2.mOn, "Alpha", i) + mv(F2.mOn, "Beta", i) + mv(F2.mOn, "Gamma", i) === mv(F2.mOn, "Revenue", i))
        && [0, 1, 2].every(i => mv(F2.mOn, "Material", i) + mv(F2.mOn, "Services", i) === mv(F2.mOn, "Costs", i))
        && ["Alpha", "Beta", "Gamma", "Revenue"].every(k => mv(F2.mOn, k, 3) === mv(F2.mOn, k, 2) - mv(F2.mOn, k, 0)),
        JSON.stringify(F2.mOn));
    check("F2 sum-safe off (mega): unchanged plain rounding (Alpha AC 1, Revenue AC 4)",
        mv(F2.mOff, "Alpha", 2) === 1 && mv(F2.mOff, "Revenue", 2) === 4, JSON.stringify(F2.mOff));
    await shot("f2on", "finance-f2-sumsafe.png");

    // ===================================================================== F3 · finance format
    const F3 = await page.evaluate(() => {
        const out = {};
        const v = __mk("f3", 1100, 420);
        v.__upd([__dv(FIN_ROWS(), { columns: { preset: "acpldpl", pctRevenue: false }, numbers: { scaling: "none", decimals: 1, financeFormat: true },
            hierarchy: { defaultLevel: 0 } })]);
        out.cells = __cells(v.__el);
        out.cells = Object.fromEntries(Object.entries(out.cells).map(([k, x]) => [k, x.cells]));
        out.svgText = [...v.__el.querySelectorAll("[data-pnl-row] svg text")].map(t => t.textContent);
        const m = __mk("f3m", 1320, 760);
        m.__upd([dvRows(MEGA_DEMO.regions(), { columns: { template: "T01A" }, numbers: { financeFormat: true }, toolbar: { show: false }, hierarchy: { defaultLevel: 0 } })]);
        const body = m.__el.querySelector('svg[data-pnl="mega-body"]');
        out.megaTexts = [...body.querySelectorAll("text")].map(t => t.textContent);
        return out;
    });
    check("F3 finance (classic): negative Δ in parentheses, positive Δ keeps +, no leading minus anywhere",
        F3.svgText.some(t => /^\(\d/.test(t)) && F3.svgText.some(t => /^\+\d/.test(t))
        && !F3.svgText.some(t => /^[-\u2212]\d/.test(t)) && !Object.values(F3.cells).flat().some(t => /^[-\u2212]\d/.test(t)), JSON.stringify(F3.svgText));
    check("F3 finance (classic): Δ% in parentheses with the % inside", F3.svgText.some(t => /^\(\d+\.\d%\)/.test(t)), JSON.stringify(F3.svgText));
    check("F3 finance (mega T01A): (85) style Δ, (…%) Δ%, the threshold footer stays “<−20”",
        F3.megaTexts.some(t => /^\(\d+\)$/.test(t)) && F3.megaTexts.some(t => /^\(\d+\.\d%\)$/.test(t))
        && F3.megaTexts.includes("<\u221220") && !F3.megaTexts.some(t => /^[-\u2212]\d/.test(t)), F3.megaTexts.filter(t => /^[(<-]/.test(t)).join(" "));
    await shot("f3m", "finance-f3-parentheses.png");

    // ===================================================================== F4 · billions
    const F4 = await page.evaluate(() => {
        const out = {};
        const big = FIN_ROWS(r => ({ ...r, values: Object.fromEntries(Object.entries(r.values).map(([k, x]) => [k, x * 4e10])) }));
        const v = __mk("f4", 1100, 420);
        v.__upd([__dv(big, { columns: { preset: "acpldpl", pctRevenue: false }, hierarchy: { defaultLevel: 0 } })]);
        out.auto = v.__el.innerText;
        out.bBtn = !!__btn(v.__el, "bEUR");
        out.bOn = __btn(v.__el, "bEUR") && __btn(v.__el, "bEUR").getAttribute("aria-pressed");
        const s = __mk("f4s", 1100, 420);
        s.__upd([__dv(FIN_ROWS(r => ({ ...r, values: Object.fromEntries(Object.entries(r.values).map(([k, x]) => [k, x * 1e9])) })),
            { columns: { preset: "acpldpl", pctRevenue: false }, numbers: { scaling: "b" }, hierarchy: { defaultLevel: 0 } })]);
        out.pane = s.__el.innerText;
        const c = __cells(s.__el);
        out.alpha = c.a.cells[0];
        // below 50 billion: k | m as before, no b button
        const k = __mk("f4k", 1100, 420);
        k.__upd([__dv(FIN_ROWS(r => ({ ...r, values: Object.fromEntries(Object.entries(r.values).map(([kk, x]) => [kk, x * 1e9])) })),
            { columns: { preset: "acpldpl", pctRevenue: false }, hierarchy: { defaultLevel: 0 } })]);
        out.noB = !__btn(k.__el, "bEUR") && /in mEUR/.test(k.__el.innerText);
        return out;
    });
    check("F4 billions: auto picks b from 50 billion (title “in bEUR”), toolbar offers bEUR",
        /in bEUR/.test(F4.auto) && F4.bBtn, F4.auto.slice(0, 200));
    check("F4 billions: numbers.scaling = b divides by 10⁹ (1.4e9 → 1.4), button active", /in bEUR/.test(F4.pane) && F4.alpha === "1.4", F4.alpha);
    check("F4 billions: data below 50 billion keeps k | m (no b button)", F4.noB);

    // ===================================================================== F5 · house terms
    const F5 = await page.evaluate(() => {
        const out = {};
        const L = { labels: { labelAc: "Ist", labelPy: "VJ", labelPl: "Budget", labelFc: "Prognose" } };
        const v = __mk("f5", 1200, 460);
        v.__upd([__dv(FIN_ROWS(), { ...L, columns: { preset: "full", pctRevenue: false }, numbers: { scaling: "none" }, hierarchy: { defaultLevel: 0 } })]);
        out.buttons = [...v.__el.querySelectorAll("button")].map(b => b.textContent);
        out.head = v.__el.querySelector('[data-pnl="head"]').innerText;
        out.hdr = [...v.__el.querySelectorAll('[data-pnl="hdr-row"]')].map(r => r.textContent).join(" | ");
        window.__tips.length = 0;
        __cells(v.__el).a.el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, clientX: 10, clientY: 10 }));
        out.tip = window.__tips[0].items.map(x => x.displayName);
        const m = __mk("f5m", 1300, 460);
        m.__upd([__dv(FIN_ROWS(), { ...L, columns: { template: "T03A" }, numbers: { scaling: "none" }, toolbar: { show: false } })]);
        out.megaHeads = __heads(m.__el);
        out.megaHead = m.__el.querySelector('[data-pnl="head"]').innerText;
        // no house term: the codes stay byte-identical
        const z = __mk("f5z", 1300, 460);
        z.__upd([__dv(FIN_ROWS(), { columns: { template: "T03A" }, numbers: { scaling: "none" }, toolbar: { show: false } })]);
        out.plainHeads = __heads(z.__el);
        return out;
    });
    check("F5 house terms: toolbar presets + reference buttons", F5.buttons.includes("VJ") && F5.buttons.includes("Budget")
        && F5.buttons.some(b => b.includes("Ist·VJ·Budget")), F5.buttons.join("|"));
    check("F5 house terms: legend and title line", /Ist/.test(F5.head) && /Prognose/.test(F5.head) && !/ AC actual/.test(F5.head)
        && /Ist, VJ, Budget · Δ Budget/.test(F5.head), F5.head);
    check("F5 house terms: classic column heads", /ΔBudget/.test(F5.hdr) && /VJ/.test(F5.hdr) && !/ΔPL/.test(F5.hdr), F5.hdr);
    check("F5 house terms: tooltip names", F5.tip.includes("Ist") && F5.tip.includes("ΔBudget") && !F5.tip.includes("AC"), F5.tip.join("|"));
    check("F5 house terms (mega): heads VJ · Budget · Ist · ΔVJ · ΔBudget …, title scenarios",
        ["VJ", "Budget", "Ist", "ΔVJ", "ΔBudget"].every(h => F5.megaHeads.includes(h)) && !F5.megaHeads.some(h => /(?<![A-Za-z])(AC|PY|PL)(?![A-Za-z])/.test(h))
        && /VJ, Budget, Ist · Δ VJ, Budget/.test(F5.megaHead), F5.megaHeads.join("|") + " / " + F5.megaHead);
    check("F5 house terms empty: mega heads keep the IBCS codes", ["PY", "PL", "AC", "ΔPY", "ΔPL"].every(h => F5.plainHeads.includes(h)), F5.plainHeads.join("|"));
    await shot("f5m", "finance-f5-houseterms.png");

    // ===================================================================== F6 · title block
    const F6 = await page.evaluate(() => {
        const out = {};
        const TB = { titleBlock: { autoMessage: true, footer: "Actuals as of Jun 2026 · source: SAP FI", filterFooter: true } };
        const v = __mk("f6", 1100, 520);
        v.__upd([__dv(FIN_ROWS(), { ...TB, columns: { preset: "acpldpl", pctRevenue: false, hideZeroRows: true }, numbers: { scaling: "none" },
            hierarchy: { defaultLevel: 0 } }, "Region = EMEA · Year = 2026")]);
        out.text = v.__el.innerText;
        const tf = v.__el.querySelector('[data-pnl="title-footer"]');
        out.footer = tf ? tf.innerText : "";
        // an own message wins over the generated one
        const o = __mk("f6o", 1100, 520);
        o.__upd([__dv(FIN_ROWS(), { titleBlock: { ...TB.titleBlock, message: "Own finding" }, numbers: { scaling: "none" } })]);
        out.own = o.__el.innerText;
        // export: no toolbar, both footer lines printed
        const x = __mk("f6x", 1100, 520, { hostCapabilities: { allowInteractions: false } });
        x.__upd([__dv(FIN_ROWS(), { ...TB, numbers: { scaling: "none" } }, "Region = EMEA")]);
        const xf = x.__el.querySelector('[data-pnl="title-footer"]');
        out.exportFooter = xf ? xf.innerText : "";
        out.exportButtons = x.__el.querySelectorAll("button").length;
        // filter footer without filterInfo and nothing of the visual's own state: no second line
        const e = __mk("f6e", 1100, 520);
        e.__upd([__dv(FIN_ROWS(), { titleBlock: { filterFooter: true }, numbers: { scaling: "none" } })]);
        out.emptyFooter = !e.__el.querySelector('[data-pnl="title-footer"]');
        // title block off: no footers
        const h = __mk("f6h", 1100, 520);
        h.__upd([__dv(FIN_ROWS(), { titleBlock: { ...TB.titleBlock, show: false }, numbers: { scaling: "none" } }, "X")]);
        out.hidden = !h.__el.querySelector('[data-pnl="title-footer"]');
        return out;
    });
    // 1.5: one sentence; the drivers carry the sign of their effect on the result
    check("F6 auto message: one sentence, result row Δ vs reference + strongest driver + largest drag",
        /Result is 0\.4\u00A0EUR \(\+15\.4\u202F%\) above plan; strongest driver is Beta with \+0\.4\u00A0EUR higher income, largest drag is \w+ with \u22120\.1\u00A0EUR lower income\./.test(F6.text),
        F6.text.slice(0, 260));
    check("F6 auto message: an own message wins", /Own finding/.test(F6.own) && !/strongest driver/.test(F6.own));
    check("F6 footer + filter footer: free text, then “Filter: <filterInfo> · zero rows hidden”",
        F6.footer === "Actuals as of Jun 2026 · source: SAP FI\nFilter: Region = EMEA · Year = 2026 · zero rows hidden", JSON.stringify(F6.footer));
    check("F6 export prints both footer lines (no toolbar)",
        /Actuals as of Jun 2026/.test(F6.exportFooter) && /Filter: Region = EMEA/.test(F6.exportFooter) && F6.exportButtons === 0, F6.exportFooter);
    check("F6 filter footer without content draws no empty line; title block off hides the footers", F6.emptyFooter && F6.hidden);
    await shot("f6", "finance-f6-title.png");

    // ===================================================================== F7 · highlight
    const F7 = await page.evaluate(() => {
        const out = {};
        const v = __mk("f7", 1100, 420);
        v.__upd([__dv(FIN_ROWS(), { columns: { preset: "acpldpl", pctRevenue: false, highlight: "beta, RES" }, numbers: { scaling: "none" },
            hierarchy: { defaultLevel: 0 } })]);
        const hl = [...v.__el.querySelectorAll('[data-pnl-hl="1"]')];
        out.rows = hl.map(r => r.getAttribute("data-pnl-row"));
        out.bg = hl.length ? hl[0].children[0].style.background : "";
        out.allCells = hl.length ? [...hl[0].children].every(c => c.style.background === out.bg) : false;
        const m = __mk("f7m", 1300, 460);
        m.__upd([__dv(FIN_ROWS(), { columns: { template: "T04A", highlight: "Beta,Result" }, numbers: { scaling: "none" }, toolbar: { show: false } })]);
        out.mega = [...m.__el.querySelectorAll('rect[data-pnl="mega-hl"]')].map(r => [r.getAttribute("fill"), r.getAttribute("fill-opacity"), r.getAttribute("stroke")]);
        const pal = { isHighContrast: true, foreground: { value: "#FFFF00" }, background: { value: "#000000" }, foregroundSelected: { value: "#00FFFF" } };
        const hc = __mk("f7hc", 1300, 460, { colorPalette: pal });
        hc.__upd([__dv(FIN_ROWS(), { columns: { template: "T04A", highlight: "Beta" }, numbers: { scaling: "none" }, toolbar: { show: false } })]);
        out.hc = [...hc.__el.querySelectorAll('rect[data-pnl="mega-hl"]')].map(r => [r.getAttribute("fill"), r.getAttribute("stroke")]);
        const d = __mk("f7d", 1300, 460);
        d.__upd([__dv(FIN_ROWS(), { columns: { template: "T04A", highlight: "Beta" }, numbers: { scaling: "none" }, toolbar: { show: false },
            style: { appearance: "dark" } })]);
        out.dark = [...d.__el.querySelectorAll('rect[data-pnl="mega-hl"]')].map(r => r.getAttribute("fill"));
        return out;
    });
    check("F7 highlight (classic): named rows, case-insensitive, by name or id, band on every cell",
        F7.rows.join(",") === "b,res" && /rgba\(64, 64, 64, 0\.07\)/.test(F7.bg) && F7.allCells, JSON.stringify(F7));
    check("F7 highlight (mega): one ink band at 7 % per highlighted row", F7.mega.length === 2
        && F7.mega.every(x => x[0] === "#404040" && x[1] === "0.07" && x[2] == null), JSON.stringify(F7.mega));
    check("F7 highlight (high contrast): outline in the foreground, no fill", F7.hc.length === 1 && F7.hc[0][0] === "none" && F7.hc[0][1] === "#FFFF00", JSON.stringify(F7.hc));
    check("F7 highlight (dark): the dark ink", F7.dark.length === 1 && F7.dark[0] === "#D9D9D9", JSON.stringify(F7.dark));
    await shot("f7m", "finance-f7-highlight.png");

    // ===================================================================== F8 · materiality
    const F8 = await page.evaluate(() => {
        const out = {};
        // ΔPL: Alpha +0.1 (7.7 %), Beta +0.4, Gamma −0.1, Material −0.1, Services +0.1
        const v = __mk("f8", 1100, 420);
        v.__upd([__dv(FIN_ROWS(), { columns: { preset: "acpldpl", pctRevenue: false, materialityAbs: 0.15 }, numbers: { scaling: "none" },
            hierarchy: { defaultLevel: 0 } })]);
        const c = __cells(v.__el);
        const barFill = (id) => { const r = c[id].el.children[3].querySelector("rect"); return r ? r.getAttribute("fill") : null; };
        out.alpha = barFill("a"); out.beta = barFill("b");
        out.alphaPin = c.a.el.children[4].querySelector("line:not([stroke-dasharray])") ? [...c.a.el.children[4].querySelectorAll("line")].map(l => l.getAttribute("stroke")) : [];
        window.__tips.length = 0;
        c.a.el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, clientX: 10, clientY: 10 }));
        out.tip = window.__tips[0].items.map(x => x.displayName + "=" + x.value);
        const m = __mk("f8m", 1300, 460);
        m.__upd([__dv(FIN_ROWS(), { columns: { template: "T04B", materialityPct: 10 }, numbers: { scaling: "none" }, toolbar: { show: false } })]);
        out.megaRects = [...m.__el.querySelectorAll('g[data-pnl="mega-chart"] > rect')].map(r => r.getAttribute("fill"));
        out.megaStems = [...m.__el.querySelectorAll('g[data-pnl="mega-chart"] g:not([shape-rendering]) > line')].map(l => l.getAttribute("stroke"));
        const off = __mk("f8off", 1300, 460);
        off.__upd([__dv(FIN_ROWS(), { columns: { template: "T04B" }, numbers: { scaling: "none" }, toolbar: { show: false } })]);
        out.offRects = [...off.__el.querySelectorAll('g[data-pnl="mega-chart"] > rect')].map(r => r.getAttribute("fill"));
        return out;
    });
    check("F8 materiality (classic): |Δ| below 0.15 → soft bar, material Δ keeps its colour",
        F8.alpha === "#8A8886" && F8.beta === "#0E8585", JSON.stringify([F8.alpha, F8.beta]));
    check("F8 materiality (classic): the pin of an immaterial row is soft too", F8.alphaPin.includes("#8A8886"), JSON.stringify(F8.alphaPin));
    check("F8 materiality: tooltip names the threshold", F8.tip.includes("Materiality=below threshold — shown in gray"), F8.tip.join("|"));
    check("F8 materiality (mega T04B, 10 %): soft waterfall steps + pins next to coloured ones, off = no soft at all",
        F8.megaRects.includes("#8A8886") && F8.megaRects.some(f => f === "#0E8585" || f === "#E02B1D")
        && F8.megaStems.includes("#8A8886") && !F8.offRects.includes("#8A8886"), JSON.stringify([F8.megaRects, F8.megaStems, F8.offRects]));
    await shot("f8m", "finance-f8-materiality.png");

    // ===================================================================== F9 · scenario group
    const F9 = await page.evaluate(() => {
        const out = {};
        const obj = { columns: { template: "T02A" }, toolbar: { showScenario: true }, hierarchy: { defaultLevel: 0 } };
        const v = __mk("f9", 1400, 820);
        v.__upd([dvRows(MEGA_DEMO.regions(), obj)]);
        // the template write is echoed — the pane now carries the T02A switches
        const pane = { columns: { template: "T02A", templateApplied: "T02A", showPL: true, showMinuend: true, dPlBar: true, dPlPin: true, secondBlock: true },
            numbers: { decimals: 0, pctDecimals: 1 }, toolbar: { showScenario: true }, hierarchy: { defaultLevel: 0 } };
        v.__upd([dvRows(MEGA_DEMO.regions(), pane)]);
        const caps = [...v.__el.querySelectorAll("button")].map(b => b.textContent);
        out.buttons = caps;
        out.acOn = __btn(v.__el, "AC").getAttribute("aria-pressed");
        out.plOn = __btn(v.__el, "ΔPL").getAttribute("aria-pressed");
        out.headsBefore = __heads(v.__el);
        const n0 = v.__host.__persist.length;
        __btn(v.__el, "FC").click();
        out.headsFc = __heads(v.__el);
        const p = v.__host.__persist.slice(n0).map(x => x.merge[0].properties.uiState).filter(Boolean);
        out.persisted = p.length ? JSON.parse(p[p.length - 1]) : null;
        // a stale update (the state before the click) must not undo the click
        v.__upd([dvRows(MEGA_DEMO.regions(), pane)]);
        out.headsStale = __heads(v.__el);
        // the echo arrives
        v.__upd([dvRows(MEGA_DEMO.regions(), { ...pane, state: { uiState: p[p.length - 1] } })]);
        out.headsEcho = __heads(v.__el);
        __btn(v.__el, "ΔPY").click();
        out.headsPy = __heads(v.__el);
        __btn(v.__el, "both").click();
        out.headsBoth = __heads(v.__el);
        const st = v.__host.__persist.map(x => x.merge[0].properties.uiState).filter(Boolean);
        const last = st[st.length - 1];
        // the author changes a Δ switch in the pane: the reader's reference view ends
        v.__upd([dvRows(MEGA_DEMO.regions(), { ...pane, columns: { ...pane.columns, dPlPin: false }, state: { uiState: last } })]);
        out.headsPane = __heads(v.__el);
        const st2 = v.__host.__persist.map(x => x.merge[0].properties.uiState).filter(Boolean);
        out.afterPane = JSON.parse(st2[st2.length - 1]);
        // only value columns PY: AC / FC change nothing → FC locked; no FC field → no minuend group
        const w = __mk("f9w", 1300, 600);
        w.__upd([dvRows(MEGA_DEMO.regions(), { columns: { showPY: true }, toolbar: { showScenario: true } })]);
        const fc = __btn(w.__el, "FC");
        out.fcLocked = fc && fc.getAttribute("data-pnl-locked") === "1" && fc.style.opacity === "0.4";
        const noFc = __mk("f9n", 1300, 600);
        const dvNoFc = __dv(FIN_ROWS(), { columns: { template: "T03A" }, toolbar: { showScenario: true }, numbers: { scaling: "none" } });
        dvNoFc.categorical.values = dvNoFc.categorical.values.filter(c => !c.source.roles.fc);
        noFc.__upd([dvNoFc]);
        out.noFcGroup = !__btn(noFc.__el, "FC") && !!__btn(noFc.__el, "ΔPY");
        // switch off (default): the toolbar of 1.0.1
        const d = __mk("f9d", 1300, 600);
        d.__upd([dvRows(MEGA_DEMO.regions(), { columns: { template: "T02A" } })]);
        out.defaultNoGroup = !__btn(d.__el, "FC") && !__btn(d.__el, "both");
        return out;
    });
    check("F9 scenario group: AC / FC and ΔPY · ΔPL · both, the author's view pressed",
        ["AC", "FC", "ΔPY", "ΔPL", "both"].every(b => F9.buttons.includes(b)) && F9.acOn === "true" && F9.plOn === "true", F9.buttons.join("|"));
    check("F9 scenario group: FC click → FC columns, persisted as megaMin “fc”",
        F9.headsFc.includes("FC") && !F9.headsFc.includes("AC") && F9.persisted && F9.persisted.megaMin === "fc", F9.headsFc.join("|"));
    check("F9 scenario group: echo guard — a stale update keeps the click, the echo confirms it",
        F9.headsStale.includes("FC") && F9.headsEcho.includes("FC"), F9.headsStale.join("|"));
    check("F9 reference view: ΔPY moves the author's bars + pins to PY, “both” shows both",
        F9.headsPy.includes("ΔPY") && !F9.headsPy.includes("ΔPL") && F9.headsBoth.includes("ΔPY") && F9.headsBoth.includes("ΔPL"),
        F9.headsPy.join("|") + " / " + F9.headsBoth.join("|"));
    check("F9 a pane change of the mega switches ends the reader's reference view (persisted “”)",
        F9.afterPane.megaRef === "" && F9.headsPane.includes("ΔPL") && !F9.headsPane.includes("ΔPY"), JSON.stringify(F9.afterPane) + F9.headsPane.join("|"));
    check("F9 a choice without effect is locked + dimmed (Paket-A pattern)", F9.fcLocked);
    check("F9 no FC field: no analysed-scenario group, the reference view stays", F9.noFcGroup);
    check("F9 toolbar.showScenario off (default): no scenario group", F9.defaultNoGroup);
    await shot("f9", "finance-f9-scenario.png");

    // ===================================================================== F10 · emptyState
    const F10 = await page.evaluate(() => {
        const out = {};
        const ES = { emptyState: { title: "No data for this selection", body: "Please adjust the period." } };
        const v = __mk("f10", 800, 240);
        v.__upd([__dv([], ES)]);
        out.custom = v.__el.innerText;
        const s = __mk("f10s", 800, 240);
        s.__upd([__dv([], {})]);
        out.standard = s.__el.innerText;
        const b = __mk("f10b", 800, 240);
        b.__upd([__dv([], { emptyState: { title: "Nothing here" } })]);
        out.titleOnly = b.__el.innerText;
        // reading view without the AC field: the author's text instead of the field instructions
        const noAc = (objects) => ({ categorical: { categories: [], values: [] }, metadata: { objects, columns: [] } });
        const r = __mk("f10r", 800, 240);
        r.__upd([noAc(ES)], 0);
        out.reading = r.__el.innerText;
        const e = __mk("f10e", 800, 240);
        e.__upd([noAc(ES)], 1);
        out.edit = e.__el.innerText;
        return out;
    });
    check("F10 emptyState: own title + text when the selection has no rows",
        F10.custom.startsWith("No data for this selection") && /Please adjust the period\./.test(F10.custom), F10.custom);
    check("F10 emptyState: empty card keeps the standard text", F10.standard.trim() === "No data for the current selection.", F10.standard);
    check("F10 emptyState: a title alone keeps the standard text below it", /Nothing here/.test(F10.titleOnly) && /No data for the current selection/.test(F10.titleOnly));
    check("F10 emptyState: reading view without fields shows the own text, edit view the demo / instructions",
        /Please adjust the period/.test(F10.reading) && !/Please adjust the period/.test(F10.edit), JSON.stringify([F10.reading, F10.edit.slice(0, 80)]));

    // ===================================================================== F11 · keyboard
    const F11 = await page.evaluate(() => {
        const out = {};
        const v = __mk("f11", 1100, 420);
        v.__upd([__dv(FIN_ROWS(), { columns: { preset: "acpldpl", pctRevenue: false }, numbers: { scaling: "none" }, hierarchy: { defaultLevel: 0 } })]);
        const fold = () => v.__el.querySelector('[data-pnl-row="L:Revenue"] [data-pnl-kb="fold"]');
        const f = fold();
        out.attrs = f ? [f.getAttribute("tabindex"), f.getAttribute("role"), f.getAttribute("aria-expanded"), f.getAttribute("aria-label")] : null;
        out.rowsBefore = v.__el.querySelectorAll("[data-pnl-row]").length;
        f.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        out.rowsFolded = v.__el.querySelectorAll("[data-pnl-row]").length;
        out.expandedAfter = fold().getAttribute("aria-expanded");
        fold().dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
        out.rowsOpen = v.__el.querySelectorAll("[data-pnl-row]").length;
        out.otherKey = (() => { fold().dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true })); return v.__el.querySelectorAll("[data-pnl-row]").length; })();
        out.pressed = [...v.__el.querySelectorAll("button")].map(b => b.getAttribute("aria-pressed"));
        const m = __mk("f11m", 1300, 460);
        m.__upd([__dv(FIN_ROWS(), { columns: { template: "T03A" }, numbers: { scaling: "none" }, toolbar: { show: false } })]);
        const ml = () => m.__el.querySelector('rect[data-pnl-part="label"][data-pnl-row="L:Costs"]');
        out.megaAttrs = [ml().getAttribute("tabindex"), ml().getAttribute("role"), ml().getAttribute("aria-expanded")];
        const n0 = m.__el.querySelectorAll('rect[data-pnl-part="cells"]').length;
        ml().dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
        out.megaFold = [n0, m.__el.querySelectorAll('rect[data-pnl-part="cells"]').length, ml().getAttribute("aria-expanded")];
        out.leafNoTab = m.__el.querySelector('rect[data-pnl-part="label"][data-pnl-row="lic"]') == null
            || m.__el.querySelector('rect[data-pnl-part="label"][data-pnl-row="a"]').getAttribute("tabindex") == null;
        return out;
    });
    check("F11 keyboard (classic): fold cell = tabindex 0 · role button · aria-expanded · aria-label",
        JSON.stringify(F11.attrs) === JSON.stringify(["0", "button", "true", "Revenue"]), JSON.stringify(F11.attrs));
    check("F11 keyboard (classic): Enter folds, Space unfolds, other keys do nothing",
        F11.rowsFolded === F11.rowsBefore - 3 && F11.expandedAfter === "false" && F11.rowsOpen === F11.rowsBefore && F11.otherKey === F11.rowsBefore,
        JSON.stringify([F11.rowsBefore, F11.rowsFolded, F11.rowsOpen, F11.otherKey]));
    check("F11 keyboard: toolbar buttons announce their state (aria-pressed)", F11.pressed.length > 0 && F11.pressed.every(p => p === "true" || p === "false"));
    check("F11 keyboard (mega): label hit rect = tabindex 0 · role button, Space folds the block",
        JSON.stringify(F11.megaAttrs) === JSON.stringify(["0", "button", "true"]) && F11.megaFold[1] === F11.megaFold[0] - 2 && F11.megaFold[2] === "false",
        JSON.stringify([F11.megaAttrs, F11.megaFold]));
    check("F11 keyboard (mega): leaf rows are no tab stops", F11.leafNoTab);
    // focus ring: real keyboard focus (Tab) — accent ring on HTML, 2 px stroke on the SVG hit rect
    await page.evaluate(() => { document.activeElement && document.activeElement.blur(); });
    await page.focus('#f11 [data-pnl-row="L:Revenue"] [data-pnl-kb="fold"]');
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => {
        const a = document.activeElement;
        return { kb: a.getAttribute("data-pnl-kb"), outline: a.style.outline };
    });
    check("F11 focus ring: keyboard focus draws a 2 px accent outline", ring.kb === "fold" && /2px/.test(ring.outline) && /solid/.test(ring.outline), JSON.stringify(ring));
    await page.focus('#f11m rect[data-pnl-part="label"][data-pnl-row="L:Costs"]');
    const svgRing = await page.evaluate(() => {
        const a = document.querySelector('#f11m rect[data-pnl-part="label"][data-pnl-row="L:Costs"]');
        const s = [a.getAttribute("stroke"), a.getAttribute("stroke-width")];
        a.blur();
        return { s, after: a.getAttribute("stroke") };
    });
    check("F11 focus ring (mega): 2 px stroke while focused, gone on blur",
        svgRing.s[1] === "2" && svgRing.s[0] && svgRing.after == null, JSON.stringify(svgRing));
    // high contrast: the ring takes the host's selection colour
    const hcRing = await page.evaluate(() => {
        const pal = { isHighContrast: true, foreground: { value: "#FFFF00" }, background: { value: "#000000" }, foregroundSelected: { value: "#00FFFF" } };
        const m = __mk("f11hc", 1300, 460, { colorPalette: pal });
        m.__upd([__dv(FIN_ROWS(), { columns: { template: "T03A" }, numbers: { scaling: "none" }, toolbar: { show: false } })]);
        const r = m.__el.querySelector('rect[data-pnl-part="label"][data-pnl-row="L:Costs"]');
        r.focus();
        return r.getAttribute("stroke");
    });
    check("F11 focus ring (high contrast): foregroundSelected", hcRing === "#00FFFF", hcRing);

    await browser.close();
    if (errors > 0) { failures.push(errors + " page errors"); }
    console.log(notes.join("\n"));
    if (failures.length) {
        console.error("\nFAILED:\n  " + failures.join("\n  "));
        process.exit(1);
    }
    console.log(`\n${notes.length} finance-feature checks passed — see test/finance-*.png`);
})();
