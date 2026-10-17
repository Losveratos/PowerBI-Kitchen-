/*
 * Mega-table render test (headless Chromium over test/test.html, cases m1..m10).
 *
 * Writes one screenshot per case (test/mega-<id>.png) for the visual
 * comparison with prototype/refs/, and asserts what can be asserted from the
 * DOM: no render errors, no clipped labels, the column set of every template,
 * the scenario marks, the %p margin row, the red threshold numbers + footer,
 * the subtotal spacer rows, one shared zero axis per chart column, the hatch
 * fill of the FC minuend, the axis notation (PY gray / PL double) and the
 * "(↓)" sort indicator with the sorted order; phase 3 (m11..m16): the
 * integrated Δ waterfall T04B–E (cascade, connectors, notation per minuend ×
 * subtrahend) and the value cascades of 12A.
 *
 * Run: node test/mega-shot.js  (after node test/build.js; npm run test:mega)
 */
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const failures = [];
const notes = [];
function check(label, cond, detail) {
    if (cond) { notes.push("  ok · " + label); return; }
    failures.push(label + (detail ? " — " + detail : ""));
}

/** runs in the page: everything the assertions need about one mega table */
function readMega(id) {
    const stage = document.getElementById(id);
    const head = stage.querySelector('svg[data-pnl="mega-head"]');
    const body = stage.querySelector('svg[data-pnl="mega-body"]');
    if (!head || !body) { return null; }
    const txt = t => t.textContent;
    const texts = (svg) => [...svg.querySelectorAll("text")].map(t => ({
        t: txt(t), x: +t.getAttribute("x"), y: +t.getAttribute("y"),
        anchor: t.getAttribute("text-anchor"), fill: t.getAttribute("fill"),
        bold: t.getAttribute("font-weight") === "bold", italic: t.getAttribute("font-style") === "italic",
    }));
    const clipped = [];
    for (const svg of [head, body]) {
        const w = parseFloat(svg.getAttribute("width"));
        svg.querySelectorAll("text").forEach(t => {
            const b = t.getBBox();
            if (b.x < -0.5 || b.x + b.width > w + 0.5) { clipped.push(t.textContent); }
        });
    }
    const charts = [...body.querySelectorAll('g[data-pnl="mega-chart"]')].map(g => {
        const lines = [...g.querySelectorAll(":scope > g[shape-rendering]:not([data-pnl]) > line")];
        return {
            conn: g.querySelectorAll('g[data-pnl="mega-conn"] line').length,
            labels: [...g.querySelectorAll("text")].map(t => ({ t: t.textContent, x: +t.getAttribute("x"),
                anchor: t.getAttribute("text-anchor"), bold: t.getAttribute("font-weight") === "bold" })),
            bars: [...g.querySelectorAll(":scope > rect, :scope > g:not([shape-rendering]) > rect")].map(r => ({ x: +r.getAttribute("x"), w: +r.getAttribute("width"),
                y: +r.getAttribute("y"), fill: r.getAttribute("fill"), stroke: r.getAttribute("stroke") })),
            axes: lines.map(l => ({ x: +l.getAttribute("x1"), stroke: l.getAttribute("stroke"), sw: +l.getAttribute("stroke-width") })),
            rects: [...g.querySelectorAll("rect")].map(r => ({ fill: r.getAttribute("fill"), stroke: r.getAttribute("stroke"),
                w: +r.getAttribute("width"), h: +r.getAttribute("height") })),
            stems: [...g.querySelectorAll("g:not([shape-rendering]) > line")].length,
            arrows: g.querySelectorAll("path").length,
        };
    });
    const rowIds = [...body.querySelectorAll('rect[data-pnl-part="cells"]')].map(r => r.getAttribute("data-pnl-row"));
    const rowY = [...body.querySelectorAll('rect[data-pnl-part="cells"]')].map(r => +r.getAttribute("y"));
    const ruleColors = [...body.querySelectorAll("g[shape-rendering] > line")].map(l => l.getAttribute("stroke"));
    const headLines = head.querySelectorAll("line").length;
    const headRects = [...head.querySelectorAll("rect")].map(r => ({ fill: r.getAttribute("fill"), h: +r.getAttribute("height") }));
    const patterns = head.querySelectorAll("pattern").length + body.querySelectorAll("pattern").length;
    const toolbar = stage.querySelectorAll("button").length;
    return { head: texts(head), body: texts(body), clipped, charts, rowIds, rowY, headRects, patterns, toolbar, ruleColors, headLines,
        bodyH: +body.getAttribute("height"), width: +body.getAttribute("width") };
}

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
    let errors = 0;
    page.on("console", m => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    await page.goto("file://" + __dirname + "/test.html");
    await page.waitForTimeout(600);

    const ids = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m13", "m14", "m15", "m16"];
    const S = {};
    for (const id of ids) {
        S[id] = await page.evaluate(readMega, id);
        const el = await page.$("#" + id);
        await el.screenshot({ path: `${__dirname}/mega-${id}.png` });
    }
    for (const id of ids) {
        check(`${id}: mega table rendered`, S[id] != null);
        if (S[id]) { check(`${id}: no clipped labels`, S[id].clipped.length === 0, S[id].clipped.slice(0, 5).join(", ")); }
    }
    const heads = id => S[id] ? S[id].head.map(t => t.t) : [];
    // numbers group with a narrow no-break space (U+202F) — tests write a blank
    const nb = t => t.replace(/(\d) (\d)/g, "$1\u202F$2");
    const has = (id, t) => S[id] && S[id].body.some(x => x.t === nb(t));
    const cell = (id, t) => S[id] && S[id].body.find(x => x.t === t);

    // ---- T03A: column set, values, %p row, marks, sign column ---------------
    check("m1 T03A heads PY PL AC ΔPY ΔPL (paired Δ%)", JSON.stringify(heads("m1")) === JSON.stringify(["PY", "PL", "AC", "ΔPY", "ΔPL"]), heads("m1").join("|"));
    check("m1 Sales revenue AC 1 031.2", has("m1", "1 031.2"));
    check("m1 Operating expenses ΔPY +37.4 (display orientation, costs up)", has("m1", "+37.4"));
    check("m1 Operating expenses ΔPY% +7%", has("m1", "+7%"));
    check("m1 Gross margin AC 45.3% italic", cell("m1", "45.3%") && cell("m1", "45.3%").italic);
    check("m1 Gross margin ΔPY +8.6%p", has("m1", "+8.6%p"));
    check("m1 Gross margin ΔPY% relative +23", has("m1", "+23"));
    check("m1 Group result AC 422.2 bold", cell("m1", "422.2") && cell("m1", "422.2").bold);
    check("m1 sign column: = / + / -", has("m1", "=") && has("m1", "+") && has("m1", "-"));
    check("m1 head marks: AC solid ink + PY gray", S.m1 && S.m1.headRects.some(r => r.fill === "#404040" && r.h === 4)
        && S.m1.headRects.some(r => r.fill === "#B3B3B3" && r.h === 4));
    check("m1 no chart columns", S.m1 && S.m1.charts.length === 0);
    check("m1 no thresholds footer", !has("m1", "Δ in red if:"));
    // ---- T03B: FC hatched mark --------------------------------------------
    check("m2 T03B heads PY PL FC", JSON.stringify(heads("m2").slice(0, 3)) === JSON.stringify(["PY", "PL", "FC"]), heads("m2").join("|"));
    check("m2 FC mark hatched (pattern)", S.m2 && S.m2.patterns > 0 && S.m2.headRects.some(r => /^url\(/.test(r.fill || "")));
    check("m2 FC Sales revenue 1 031.4", has("m2", "1 031.4"));

    // ---- T01A: two blocks, thresholds, flattened leaves ---------------------
    check("m3 block titles November / _November", heads("m3").includes("November") && heads("m3").includes("_November"));
    check("m3 heads per block PY PL AC ΔPY ΔPY% ΔPL ΔPL%",
        JSON.stringify(heads("m3").slice(2, 9)) === JSON.stringify(["PY", "PL", "AC", "ΔPY", "ΔPY%", "ΔPL", "ΔPL%"]), heads("m3").join("|"));
    check("m3 World AC month 3 254 + YTD 32 489", has("m3", "3 254") && has("m3", "32 489"));
    check("m3 duplicate leaves named after their region", has("m3", "Other Europe") && has("m3", "Other Americas"));
    check("m3 no subtotal rows (Europe hidden)", !has("m3", "Europe"));
    const red = (id, t) => S[id] && S[id].body.some(x => x.t === t && x.fill === "#E02B1D");
    check("m3 Germany ΔPY -85 red (< -20)", red("m3", "-85"));
    check("m3 Germany ΔPY% -24.6% red (< -10%)", red("m3", "-24.6%"));
    check("m3 Austria ΔPY +59 not red", has("m3", "+59") && !red("m3", "+59"));
    check("m3 YTD Germany ΔPY -274 red (< -220)", red("m3", "-274"));
    check("m3 footer Δ in red if: <-20 <-10% <-220", has("m3", "Δ in red if:") && has("m3", "<-20") && has("m3", "<-10%") && has("m3", "<-220"));
    // ---- T01B: subtotal blocks + spacer rows --------------------------------
    check("m4 subtotals Europe / Americas / Rest of World / World", ["Europe", "Americas", "Rest of World", "World"].every(t => has("m4", t)));
    check("m4 Europe ΔPL YTD -653 bold red", red("m4", "-653") && cell("m4", "-653").bold);
    if (S.m4) {
        const ids4 = S.m4.rowIds; const ys = S.m4.rowY;
        const iEu = ids4.indexOf("L:World¦Europe");
        const iWorld = ids4.indexOf("L:World");
        check("m4 spacer row after Europe (gap > row height)", iEu >= 0 && ys[iEu + 1] - ys[iEu] > 22 + 5, `${ys[iEu]} → ${ys[iEu + 1]}`);
        check("m4 spacer row before World", iWorld > 0 && ys[iWorld] - ys[iWorld - 1] > 22 + 5);
    }

    // ---- T02A: AC vs PL bars + pins, shared axis, two scales ----------------
    if (S.m5) {
        check("m5 four chart columns (ΔPL bar + pin per block)", S.m5.charts.length === 4);
        check("m5 PL axis = double line", S.m5.charts.every(c => c.axes.length === 2 && c.axes.every(a => a.stroke === "#404040" && a.sw === 1)));
        check("m5 AC bars solid teal/red", S.m5.charts[0].rects.some(r => r.fill === "#0E8585") && S.m5.charts[0].rects.some(r => r.fill === "#E02B1D"));
        check("m5 pins: ink heads + stems", S.m5.charts[1].rects.some(r => r.fill === "#404040" && r.w === 8) && S.m5.charts[1].stems > 10);
        check("m5 bar labels with explicit +", has("m5", "+47") && has("m5", "-31"));
        check("m5 pin labels without %", has("m5", "+16.5") && has("m5", "-19.4"));
        check("m5 heads ΔPL / ΔPL% centred", heads("m5").includes("ΔPL") && heads("m5").includes("ΔPL%"));
    }
    // ---- T02E: FC vs PY: hatched bars, gray axis, sorted Δ↓ (_YTD) -----------
    if (S.m6) {
        check("m6 PY axis = gray 3 px", S.m6.charts.every(c => c.axes.length === 1 && c.axes[0].stroke === "#B3B3B3" && c.axes[0].sw === 3));
        check("m6 FC bars hatched with outline", S.m6.charts[0].rects.some(r => /^url\(/.test(r.fill) && r.stroke));
        check("m6 FC pin heads hatched", S.m6.charts[1].rects.some(r => /^url\(/.test(r.fill) && r.stroke === "#404040"));
        check("m6 sort indicator ΔPY(↓) on the YTD block", heads("m6").filter(t => t === "ΔPY(↓)").length === 1);
        const ids6 = S.m6.rowIds;
        const eu = ids6.filter(x => x.startsWith("Europe:") || x.startsWith("L:") ? false : x.includes("Europe:"));
        void eu;
        const euRows = S.m6.rowIds.filter(x => x.startsWith("Europe:"));
        check("m6 Europe sorted by YTD ΔFC-PY desc, Other last", euRows[euRows.length - 1] === "Europe:Other" && euRows[0] === "Europe:Austria", euRows.join(","));
    }
    // ---- T02F: FC vs PL --------------------------------------------------------
    if (S.m7) {
        check("m7 PL axis double + hatched FC bars", S.m7.charts.every(c => c.axes.length === 2)
            && S.m7.charts[0].rects.some(r => /^url\(/.test(r.fill)));
    }
    // ---- AC vs PY from single switches, AC↓ on the month block, IBCS green --
    if (S.m8) {
        check("m8 gray PY axes + solid AC bars in IBCS green", S.m8.charts.every(c => c.axes[0].stroke === "#B3B3B3")
            && S.m8.charts[0].rects.some(r => r.fill === "#8CB400"));
        check("m8 AC(↓) on the month block only", heads("m8").filter(t => t === "AC(↓)").length === 1);
        const euRows = S.m8.rowIds.filter(x => x.startsWith("Europe:"));
        check("m8 Europe sorted by month AC desc (Austria 559, Other 545 stays last)",
            euRows[0] === "Europe:Austria" && euRows[euRows.length - 1] === "Europe:Other", euRows.join(","));
    }
    // ---- pharma demo with month | _YTD -----------------------------------------
    if (S.m9) {
        check("m9 block titles June / _June", heads("m9").includes("June") && heads("m9").includes("_June"), heads("m9").slice(0, 4).join("|"));
        check("m9 Net revenue chain start '=' + EBITDA formula", has("m9", "Net revenue") && has("m9", "EBITDA"));
        check("m9 comment markers in the label column", S.m9.body.some(x => /①/.test(x.t)));
    }
    // ---- T04A ------------------------------------------------------------------
    if (S.m10) {
        check("m10 ΔPL bars + pins on a statement", S.m10.charts.length === 2);
        check("m10 margin row has no bar", !S.m10.body.some(x => /%p$/.test(x.t)));
    }

    // ---- T04B–E: integrated Δ waterfall (phase 3) ---------------------------------
    const wfCase = (id, ref, hatched, axis) => {
        const D = S[id];
        if (!D) { return; }
        check(`${id} heads ${ref === "PL" ? "PL AC|FC" : "PY AC|FC"} Δ${ref} Δ${ref}%`, heads(id).includes("Δ" + ref) && heads(id).includes("Δ" + ref + "%"), heads(id).join("|"));
        check(`${id} two chart columns: waterfall + pins`, D.charts.length === 2);
        const wf = D.charts[0];
        // 20 statement rows carry a segment (the margin row is skipped)
        check(`${id} one cascade segment per row (20)`, wf.bars.length === 20, String(wf.bars.length));
        check(`${id} thin connectors between the segments`, wf.conn >= 15, String(wf.conn));
        check(`${id} waterfall fill by minuend (${hatched ? "hatched + outline" : "solid"})`,
            wf.bars.every(r => hatched ? /^url\(/.test(r.fill) && r.stroke : /^#/.test(r.fill) && !r.stroke));
        check(`${id} axis by subtrahend (${axis})`, axis === "double"
            ? D.charts.every(c => c.axes.length === 2 && c.axes.every(a => a.stroke === "#404040"))
            : D.charts.every(c => c.axes.length === 1 && c.axes[0].stroke === "#B3B3B3" && c.axes[0].sw === 3));
        // = rows restart at the zero line: every anchor segment touches the axis
        const ax = wf.axes.length === 2 ? (wf.axes[0].x + wf.axes[1].x) / 2 : wf.axes[0].x;
        const rowsY = D.rowY; const ids2 = D.rowIds;
        const anchorIds = ["L:Sales revenue", "opres", "rbt", "rat", "grp"];
        const anchors = anchorIds.map(a => ids2.indexOf(a)).filter(i => i >= 0)
            .map(i => wf.bars.find(b => b.y > rowsY[i] && b.y < rowsY[i] + 22));
        check(`${id} = rows anchored on the zero line (5)`, anchors.length === 5 && anchors.every(b => b
            && (Math.abs(b.x - ax) < 1.5 || Math.abs(b.x + b.w - ax) < 1.5)), JSON.stringify(anchors.map(b => b && [b.x, b.w, ax])));
    };
    wfCase("m11", "PL", false, "double");
    wfCase("m12", "PY", false, "gray");
    wfCase("m13", "PL", true, "double");
    wfCase("m14", "PY", true, "gray");
    if (S.m11) {
        const wf = S.m11.charts[0];
        const pur = wf.labels.find(l => l.t === "+11.12");
        check("m11 Purchases +11.12 (raw Δ, cost) left of its bar, bar red", pur && pur.anchor === "end"
            && wf.bars.some(b => b.fill === "#E02B1D" && Math.abs(b.x - 3 - pur.x) < 0.6));
        check("m11 Group result +6.04 bold", wf.labels.some(l => l.t === "+6.04" && l.bold));
        check("m11 pins with 2 decimals (+25.26)", S.m11.charts[1].labels.some(l => l.t === "+25.26"));
        check("m11 margin row keeps its %p-free values (10.99%)", has("m11", "10.99%"));
        // the cascade really runs on: Other op. income starts where Sales revenue ended
        const ids11 = S.m11.rowIds; const y11 = S.m11.rowY;
        const seg = id => { const i = ids11.indexOf(id); return wf.bars.find(b => b.y > y11[i] && b.y < y11[i] + 22); };
        const sales = seg("L:Sales revenue"); const ooi = seg("ooi");
        check("m11 Other op. income starts at the end of Sales revenue", sales && ooi && Math.abs(ooi.x - (sales.x + sales.w)) < 0.6,
            sales && ooi ? `${sales.x + sales.w} vs ${ooi.x}` : "");
    }
    // ---- 12A: value cascades -------------------------------------------------------
    if (S.m15) {
        const D = S.m15;
        check("m15 12A heads PY AC ΔPY ΔPY%", JSON.stringify(heads("m15")) === JSON.stringify(["PY", "AC", "ΔPY", "ΔPY%"]), heads("m15").join("|"));
        check("m15 four chart columns (2 value cascades + bars + pins)", D.charts.length === 4);
        const [py, ac] = D.charts;
        check("m15 PY cascade gray, cost rows light", py.bars.some(b => b.fill === "#B3B3B3") && py.bars.some(b => b.fill === "#D9D9D9"));
        check("m15 AC cascade ink, cost rows light", ac.bars.some(b => b.fill === "#404040") && ac.bars.some(b => b.fill === "#8A8886"));
        check("m15 value cascade axis: 1 px ink line", py.axes.length === 1 && py.axes[0].stroke === "#404040" && py.axes[0].sw === 1);
        check("m15 value labels (Sales revenue AC 1 061 bold, Operating expenses 752)",
            ac.labels.some(l => l.t === nb("1 061") && l.bold) && ac.labels.some(l => l.t === "752"));
        check("m15 cascade connectors", py.conn >= 15 && ac.conn >= 15, `${py.conn}/${ac.conn}`);
        check("m15 ΔPY% outliers +983 / +391 capped with arrows", D.charts[3].arrows === 2);
        check("m15 no gray row rules, no head rules (12A)", !D.ruleColors.includes("#D9D9D9") && D.headLines === 0);
        check("m15 no margin row", !D.body.some(x => /%$/.test(x.t)));
        check("m15 one value-cascade scale for PY and AC (same Licences px per kEUR)", (() => {
            const i = D.rowIds.indexOf("lic"); const y = D.rowY[i];
            const a = py.bars.find(b => b.y > y && b.y < y + 22); const c = ac.bars.find(b => b.y > y && b.y < y + 22);
            return a && c && Math.abs(a.w / 713 - c.w / 896) < 0.01;
        })());
    }
    // ---- single switches on structure data: waterfall next to bars + pins ----------
    if (S.m16) {
        const D = S.m16;
        check("m16 six chart columns (bar, waterfall, pins per block)", D.charts.length === 6);
        const wf0 = D.charts[1];
        check("m16 subtotal blocks span their regions (Europe -36 left of its bar)", wf0.labels.some(l => l.t === "-36" && l.bold && l.anchor === "end"));
        check("m16 World anchored on the zero line", (() => {
            const i = D.rowIds.indexOf("L:World"); const y = D.rowY[i];
            const b = wf0.bars.find(r => r.y > y && r.y < y + 22);
            const ax = (wf0.axes[0].x + wf0.axes[1].x) / 2;
            return b && Math.abs(b.x + b.w - ax) < 1.5;
        })());
        check("m16 waterfall and bars share the Δ scale of the block (Europe -36 equally long)", (() => {
            const i = D.rowIds.indexOf("L:World¦Europe"); const y = D.rowY[i];
            const a = D.charts[0].bars.find(r => r.y > y && r.y < y + 22); const b = wf0.bars.find(r => r.y > y && r.y < y + 22);
            return a && b && Math.abs(a.w - b.w) < 1;
        })());
        check("m16 IBCS green", wf0.bars.some(b => b.fill === "#8CB400"));
    }

    // ---- preset dropdown wrote the switches (persistProperties payload) ----------
    const persist = await page.evaluate(() => (window.__persist || []).map(x => ({ id: x.id, p: x.p })));
    const m1p = persist.find(x => x.id === "m1");
    const colObj = m1p && m1p.p.merge.find(o => o.objectName === "columns");
    const numObj = m1p && m1p.p.merge.find(o => o.objectName === "numbers");
    check("preset T03A persisted the switches + templateApplied", colObj && colObj.properties.templateApplied === "T03A"
        && colObj.properties.dPyAbs === true && colObj.properties.dPlPct === true && colObj.properties.secondBlock === false);
    check("preset T03A persisted decimals 1 / Δ% 0", numObj && numObj.properties.decimals === 1 && numObj.properties.pctDecimals === 0);
    check("single switches (m8) persist nothing", !persist.some(x => x.id === "m8"));
    const tplP = (id) => { const x = persist.find(q => q.id === id); return x ? x.p.merge : []; };
    const colsOf = id => (tplP(id).find(o => o.objectName === "columns") || {}).properties || {};
    const numsOf = id => (tplP(id).find(o => o.objectName === "numbers") || {}).properties || {};
    check("preset T04B persisted dPlWaterfall + pins, decimals 2 / Δ% 2", colsOf("m11").templateApplied === "T04B"
        && colsOf("m11").dPlWaterfall === true && colsOf("m11").dPlBar === false && colsOf("m11").dPlPin === true
        && numsOf("m11").decimals === 2 && numsOf("m11").pctDecimals === 2);
    check("preset T04C persisted dPyWaterfall, PY column, no PL", colsOf("m12").dPyWaterfall === true && colsOf("m12").showPY === true
        && colsOf("m12").showPL === false && colsOf("m12").dPlWaterfall === false);
    check("presets T04D / T04E persisted minuend FC", colsOf("m13").minuend === "fc" && colsOf("m14").minuend === "fc"
        && colsOf("m13").dPlWaterfall === true && colsOf("m14").dPyWaterfall === true);
    check("preset 12A persisted valueCascade + ΔPY bars/pins, no margins, decimals 0 / 0", colsOf("m15").valueCascade === true
        && colsOf("m15").dPyBar === true && colsOf("m15").dPyPin === true && colsOf("m15").showPctRows === false
        && numsOf("m15").decimals === 0 && numsOf("m15").pctDecimals === 0);
    check("single switches (m16) persist nothing", !persist.some(x => x.id === "m16"));
    check("synced template (m9) persists nothing", !persist.some(x => x.id === "m9"));

    await browser.close();
    for (const n of notes) { console.log(n); }
    if (errors > 0) { failures.push(errors + " render errors"); }
    if (failures.length) {
        console.error("\n" + failures.length + " mega check(s) failed:\n  ✗ " + failures.join("\n  ✗ "));
        process.exit(1);
    }
    console.log(`\n${notes.length} mega checks passed — see test/mega-m*.png`);
})();
