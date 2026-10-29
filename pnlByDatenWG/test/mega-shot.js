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
 * subtrahend) and the value cascades of 12A. 1.7 (m39..m42, p28, p29): stocks —
 * the balance sheet (T05A: the stand at the reporting date, "=" blocks with the
 * double rule, statement.stockMode persisted), the cash-flow bridge (T05B:
 * opening and closing balance anchor at the zero line, the flows float), the
 * FY outlook of stocks (FC end stand, hatched), the row waterfall and the
 * classic table over stocks. 1.7 ⚡ "only exceptions" (m43..m46): the rest
 * greys in T01A while the red thresholds stay, mode "hide" in T04A takes out
 * exactly the counted detail rows, over the T04B cascade it greys instead,
 * high contrast draws the rest dashed.
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
                anchor: t.getAttribute("text-anchor"), bold: t.getAttribute("font-weight") === "bold",
                x0: t.getBBox().x, x1: t.getBBox().x + t.getBBox().width })),
            halos: [...g.querySelectorAll('rect[data-pnl="mega-halo"]')].map(r => ({ x0: +r.getAttribute("x"),
                x1: +r.getAttribute("x") + +r.getAttribute("width") })),
            bars: [...g.querySelectorAll(":scope > rect:not([data-pnl=mega-halo]), :scope > g:not([shape-rendering]) > rect")].map(r => ({ x: +r.getAttribute("x"), w: +r.getAttribute("width"),
                y: +r.getAttribute("y"), fill: r.getAttribute("fill"), stroke: r.getAttribute("stroke") })),
            axes: lines.map(l => ({ x: +l.getAttribute("x1"), stroke: l.getAttribute("stroke"), sw: +l.getAttribute("stroke-width") })),
            rects: [...g.querySelectorAll("rect")].map(r => ({ fill: r.getAttribute("fill"), stroke: r.getAttribute("stroke"),
                w: +r.getAttribute("width"), h: +r.getAttribute("height") })),
            stems: [...g.querySelectorAll("g:not([shape-rendering]) > line")].length,
            arrows: g.querySelectorAll('path:not([data-pnl="mega-break"])').length,
            // 1.5: break marks of capped elements (outlier zone, UN 5.3)
            breaks: g.querySelectorAll('path[data-pnl="mega-break"]').length,
        };
    });
    const rowIds = [...body.querySelectorAll('rect[data-pnl-part="cells"]')].map(r => r.getAttribute("data-pnl-row"));
    const rowY = [...body.querySelectorAll('rect[data-pnl-part="cells"]')].map(r => +r.getAttribute("y"));
    const ruleColors = [...body.querySelectorAll("g[shape-rendering] > line")].map(l => l.getAttribute("stroke"));
    const headLines = head.querySelectorAll("line").length;
    const headRects = [...head.querySelectorAll("rect")].map(r => ({ fill: r.getAttribute("fill"), h: +r.getAttribute("height") }));
    const patterns = head.querySelectorAll("pattern").length + body.querySelectorAll("pattern").length;
    const toolbar = stage.querySelectorAll("button").length;
    // 1.1: legend text, colours of every mega element, the high-contrast patterns
    const headEl = stage.querySelector('[data-pnl="head"]');
    const legend = headEl ? headEl.innerText : "";
    const megaEls = [...stage.querySelectorAll('svg[data-pnl^="mega"] *')];
    const paints = [...new Set(megaEls.flatMap(e => [e.getAttribute("fill"), e.getAttribute("stroke")]).filter(Boolean))];
    const underlined = [...body.querySelectorAll('text[text-decoration="underline"]')].map(t => t.textContent);
    const pyMarkDashed = head.querySelectorAll('line[data-pnl="mega-mark-py"]').length;
    const dashedRects = body.querySelectorAll("rect[stroke-dasharray]").length;
    const headFs = [...head.querySelectorAll("text")].map(t => +(t.getAttribute("font-size") || 0));
    const bg = getComputedStyle(stage.firstElementChild).backgroundColor;
    return { head: texts(head), body: texts(body), clipped, charts, rowIds, rowY, headRects, patterns, toolbar, ruleColors, headLines,
        bodyH: +body.getAttribute("height"), width: +body.getAttribute("width"),
        legend, paints, underlined, pyMarkDashed, dashedRects, headFs, bg };
}

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
    let errors = 0;
    page.on("console", m => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    await page.goto("file://" + __dirname + "/test.html");
    await page.waitForTimeout(600);

    const ids = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m13", "m14", "m15", "m16",
        "m17", "m18", "m19", "m20", "m21", "m22", "m23", "m24", "m25", "m26", "m27", "m28", "m29", "m30", "m31", "m32", "m33",
        "m34", "m35", "m36", "m37", "m38", "m39", "m40", "m41", "m42", "m43", "m44", "m45", "m46"];
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
    // 1.5.1: numbers carry the typographic minus (U+2212) — tests write "-85"
    const nb = t => t.replace(/(\d) (\d)/g, "$1\u202F$2").replace(/(^|[<(\s])-(?=\d)/g, "$1\u2212");
    const has = (id, t) => S[id] && S[id].body.some(x => x.t === nb(t));
    const cell = (id, t) => S[id] && S[id].body.find(x => x.t === nb(t));

    // ---- T03A: column set, values, %p row, marks, sign column ---------------
    check("m1 T03A heads PY PL AC ΔPY ΔPL (paired Δ%)", JSON.stringify(heads("m1")) === JSON.stringify(["PY", "PL", "AC", "ΔPY", "ΔPL"]), heads("m1").join("|"));
    check("m1 Sales revenue AC 1 031.2", has("m1", "1 031.2"));
    check("m1 Operating expenses ΔPY +37.4 (display orientation, costs up)", has("m1", "+37.4"));
    check("m1 Operating expenses ΔPY% +6.6% (1.5: one Δ% decimal in every template)", has("m1", "+6.6%"));
    check("m1 Gross margin AC 45.3% italic", cell("m1", "45.3%") && cell("m1", "45.3%").italic);
    check("m1 Gross margin ΔPY +8.6 pp (1.5.1: pp, Δ% decimals)", has("m1", "+8.6\u202Fpp"));
    check("m1 Gross margin: no relative Δ% any more (1.5.1)", !has("m1", "+23%") && !has("m1", "+23"));
    check("m1 Group result AC 422.2 bold", cell("m1", "422.2") && cell("m1", "422.2").bold);
    check("m1 sign column: = / + / − (U+2212)", has("m1", "=") && has("m1", "+") && has("m1", "\u2212"));
    check("1.5.1 no hyphen-minus in front of a number anywhere (m1, m3, m5, m15)", ["m1", "m3", "m5", "m15"].every(id => S[id]
        && !S[id].body.some(x => /(^|[^A-Za-z])-\d/.test(x.t)) && !S[id].charts.some(c => c.labels.some(l => /(^|[^A-Za-z])-\d/.test(l.t)))));
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
    const red = (id, t) => S[id] && S[id].body.some(x => x.t === nb(t) && x.fill === "#E02B1D");
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
        // a number beside the zero line sits ON the axis band (T04B "+5.79"): it
        // gets the paper halo, the axis pauses behind it — and nothing else does
        const band = wf.axes.length === 2 ? [Math.min(wf.axes[0].x, wf.axes[1].x) - 0.5, Math.max(wf.axes[0].x, wf.axes[1].x) + 0.5]
            : [wf.axes[0].x - wf.axes[0].sw / 2, wf.axes[0].x + wf.axes[0].sw / 2];
        // (half a pixel of tolerance, like the painter: a digit touching the line counts)
        const onAxis = wf.labels.filter(l => l.x0 < band[1] + 0.5 && l.x1 > band[0] - 0.5);
        check(`${id} every label on the axis band carries a halo, no other label does (${onAxis.length})`,
            wf.halos.length === onAxis.length && onAxis.every(l => wf.halos.some(h => h.x0 <= l.x0 + 0.5 && h.x1 >= l.x1 - 0.5)),
            JSON.stringify({ onAxis: onAxis.map(l => l.t), halos: wf.halos.length }));
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
        check("m11 pins with one decimal (+25.3, 1.5)", S.m11.charts[1].labels.some(l => l.t === "+25.3"));
        // 1.5.1: the margin carries the Δ% decimals (11.0 %, not 10.99 %), its Δ prints as pp at the waterfall axis
        check("m11 margin row with pctDecimals (11.0%, not 10.99%)", has("m11", "11.0%") && !has("m11", "10.99%"));
        check("m11 margin row: +0.8 pp at the ΔPL waterfall axis, no bar", wf.labels.some(l => l.t === "+0.8\u202Fpp"));
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
        check("m15 ΔPY% outliers +983.3 / +390.9 capped: triangle + break mark each", D.charts[3].arrows === 2 && D.charts[3].breaks === 2);
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
        check("m16 subtotal blocks span their regions (Europe -36 left of its bar)", wf0.labels.some(l => l.t === "\u221236" && l.bold && l.anchor === "end"));
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

    // ==== 1.1 package A ==========================================================
    // fix 1 — margin rows: relative Δ% with %, %p only for the point difference
    // 1.5.1: margin rows: the point difference in pp, no relative Δ% (a percentage of a percentage)
    check("m2 T03B margin row +7.7 pp, no relative +21% / +20%", has("m2", "+7.7\u202Fpp") && !has("m2", "+21%") && !has("m2", "+20%"));
    // fix 3 — legend = the scenarios the mega columns show; axis note only for real Δ axes
    const lg = id => S[id] ? S[id].legend : "";
    check("m7 T02F legend PL + FC only (no AC, no PY)", /PL plan/.test(lg("m7")) && /FC forecast/.test(lg("m7"))
        && !/AC actual/.test(lg("m7")) && !/PY previous/.test(lg("m7")), lg("m7"));
    check("m7 axis note names the PL axis only (no 'dashed = FC')", /double line = PL\./.test(lg("m7")) && !/dashed = FC/.test(lg("m7")) && !/gray = PY/.test(lg("m7")));
    check("m1 T03A (no chart column) has no axis note", !/axes encode/.test(lg("m1")) && /AC actual/.test(lg("m1")) && !/FC forecast/.test(lg("m1")));
    check("m15 12A legend AC + PY, axis note gray = PY", /AC actual/.test(lg("m15")) && /PY previous/.test(lg("m15")) && !/PL plan/.test(lg("m15"))
        && /gray = PY\./.test(lg("m15")));
    // fix 8 — export: no toolbar, every row expanded (exportExpandAll), switch off keeps the fold
    if (S.m17 && S.m18 && S.m4) {
        check("m17 export prints no toolbar buttons (toolbar.show on)", S.m17.toolbar === 0);
        check("m17 export keeps the legend (notation)", /AC actual/.test(S.m17.legend));
        check("m17 export renders level-1-folded T01B fully expanded (= m4 rows)", JSON.stringify(S.m17.rowIds) === JSON.stringify(S.m4.rowIds),
            S.m17.rowIds.length + " vs " + S.m4.rowIds.length);
        check("m18 exportExpandAll off keeps the fold (World only)", S.m18.rowIds.length === 1 && S.m18.toolbar === 0, String(S.m18.rowIds.length));
    }
    // fix 7 — high contrast: host foreground / background only, patterns instead of colour
    if (S.m19) {
        const D = S.m19;
        check("m19 HC: mega paints only foreground #FFFF00 / background #000000", D.paints.every(c => ["#FFFF00", "#000000", "none"].includes(c)), D.paints.join(","));
        check("m19 HC: page background = host background", D.bg === "rgb(0, 0, 0)", D.bg);
        const bars = D.charts.filter((c, i) => i % 2 === 0);
        check("m19 HC: unfavourable Δ bars hollow (bg fill + fg outline), favourable solid fg",
            bars.every(c => c.bars.some(b => b.fill === "#000000" && b.stroke === "#FFFF00") && c.bars.some(b => b.fill === "#FFFF00" && !b.stroke)));
        check("m19 HC: unfavourable pin heads hollow", D.charts[1].rects.some(r => r.fill === "#000000" && r.stroke === "#FFFF00" && r.w === 8));
        check("m19 HC: PY head mark dashed", D.pyMarkDashed === 2, String(D.pyMarkDashed));
        check("m19 HC: red threshold numbers underlined (−85, −274)", D.underlined.includes("\u221285") && D.underlined.includes("\u2212274")
            && !D.underlined.includes("+59"), D.underlined.join(","));
        check("m19 HC: no teal note in the legend", !/teal/.test(D.legend));
    }
    if (S.m20) {
        check("m20 HC 12A: PY value cascade dashed, AC cascade solid fg", S.m20.dashedRects >= 15
            && S.m20.charts[1].bars.some(b => b.fill === "#FFFF00"), String(S.m20.dashedRects));
        check("m20 HC: only fg / bg", S.m20.paints.every(c => ["#FFFF00", "#000000", "none"].includes(c)), S.m20.paints.join(","));
    }
    // fix 2 — header font size reaches the mega heads (18 px → 13 × 18 / 9 = 26)
    if (S.m21 && S.m1) {
        check("m21 heads at 26 px", S.m21.headFs.length === 5 && S.m21.headFs.every(f => f === 26), S.m21.headFs.join(","));
        check("m21 body unchanged vs m1 (same rows, same numbers)", JSON.stringify(S.m21.body.map(t => t.t)) === JSON.stringify(S.m1.body.map(t => t.t)));
        check("m1 heads keep the body size (no font-size attribute)", S.m1.headFs.every(f => f === 0));
    }
    // fix 9 — period blocks: _YTD | FY outlook, month only
    check("m22 blocks _June | FY 2026, FY minuend head AC&FC", heads("m22").includes("_June") && heads("m22").includes("FY 2026")
        && heads("m22").includes("AC&FC"), heads("m22").join("|"));
    check("m22 FY block carries values (Net revenue FY AC&FC 3 254.1 vs PL 3 316.0)", has("m22", "3 254.1") && has("m22", "3 316.0") && has("m22", "-61.9"));
    check("m23 month-only block titled June, no _YTD block", heads("m23")[0] === "June" && !heads("m23").some(h => /^_/.test(h)), heads("m23").join("|"));
    // fix 10 — % of revenue in the mega table
    if (S.m24) {
        check("m24 % Rev right after AC", JSON.stringify(heads("m24").slice(0, 4)) === JSON.stringify(["PY", "PL", "AC", "% Rev"]), heads("m24").join("|"));
        const lic = cell("m24", "86.9%");
        check("m24 Licences 86.9% italic, right-aligned", lic && lic.italic && lic.anchor === "end");
        check("m24 off by default (m1 has no % Rev)", !heads("m1").includes("% Rev"));
    }
    // fix 4 — sort indicator moves to the category head when the sorting column is off
    check("m25 (↓) ΔPL November on the category head, nowhere else", heads("m25").filter(h => /↓/.test(h)).join("|") === "(↓) ΔPL November",
        heads("m25").join("|"));
    // fix 6 — threshold footer with the decimals the thresholds carry
    check("m26 footer <-20.5 / <-10.5% (YTD <-220 / <-10% unchanged)", has("m26", "<-20.5") && has("m26", "<-10.5%")
        && has("m26", "<-220") && !has("m26", "<-21"));

    // ---- 1.1 Paket C ------------------------------------------------------------
    const pageInfo = await page.evaluate(() => {
        const o = {};
        for (const id of ["m27", "m28", "m29", "m30", "m1", "m15", "m5", "m11", "m33", "m36", "m37", "m38"]) {
            const st = document.getElementById(id);
            const hl = st.querySelector('[data-pnl="headline"]');
            const note = st.querySelector('[data-pnl="scale-fixed"]');
            const sn = st.querySelector('[data-pnl="scale-note"]');
            o[id] = { headline: hl ? hl.textContent : null, headlineFs: hl ? parseFloat(hl.style.fontSize) : 0,
                note: note ? note.textContent : null, scaleNote: sn ? sn.textContent : null, text: st.innerText,
                ytd: [...st.querySelectorAll('text[data-pnl="mega-ytd"]')].map(t => ({ t: t.textContent, fill: t.getAttribute("fill"), out: t.getAttribute("data-pos") === "out" })) };
        }
        return o;
    });
    if (S.m27) {
        check("m27 12G heads: FY 2025 · PY · YTD + AC&FC · ΔPY · ΔPY%", ["FY 2025", "PY", "YTD", "AC&FC", "ΔPY", "ΔPY%"].every(h => heads("m27").includes(h)),
            heads("m27").join("|"));
        // the stacked bar: YTD inside, the year outside (Licences 538 ▓ 1 434, Sales revenue 637 ▓ 1 698)
        const ytd = pageInfo.m27.ytd.map(x => x.t);
        const fillOf = t => (pageInfo.m27.ytd.find(x => x.t === t) || {}).fill;
        // 1.5.2: a YTD number that no longer fits the solid part moves before the bar in ink
        const posOf = t => (pageInfo.m27.ytd.find(x => x.t === t) || {}).out;
        check("m27 YTD numbers inside the solid part (538, 637, 267) on the paper tone",
            ["538", "637", "267"].every(x => ytd.includes(x) && fillOf(x) === "#FFFFFF" && !posOf(x)), ytd.join(","));
        check("m27 short YTD numbers (196, 200) before the bar start in dark ink (1.5.2)",
            ["196", "200"].every(x => ytd.includes(x) && posOf(x) && fillOf(x) === "#1A1A1A"), JSON.stringify(pageInfo.m27.ytd));
        // 1.5.1: on the light cost tone (#8A8886) the number is dark ink (≥ 4.5:1), not white (~3.5:1)
        check("m27 YTD numbers of cost rows (227, 451) in dark ink on the light tone (1.5.1)",
            ["227", "451"].every(x => fillOf(x) === "#1A1A1A"), JSON.stringify(pageInfo.m27.ytd));
        check("m27 year numbers outside (1 434, 1 698, 1 202)", has("m27", "1 434") && has("m27", "1 698") && has("m27", "1 202"));
        const vwf = S.m27.charts[1];
        // 1.5.2: every stacked row shows its YTD number — inside when it fits, else before the bar start
        const stacked = vwf.bars.filter(b => /^url\(/.test(b.fill)).length;
        check("m27 every stacked row carries its YTD number (inside or before the bar)",
            pageInfo.m27.ytd.length >= stacked && pageInfo.m27.ytd.some(x => x.out), `${pageInfo.m27.ytd.length} / ${stacked} ` + JSON.stringify(pageInfo.m27.ytd));
        check("m27 AC&FC cascade: solid YTD + hatched rest of year per row", vwf.bars.filter(b => /^url\(/.test(b.fill)).length >= 15
            && vwf.bars.filter(b => b.fill === "#404040").length >= 8, JSON.stringify(vwf.bars.slice(0, 4)));
        // Δ on the year: Licences +721 (1 434 − 713), Sales revenue +885, bars hatched (AC&FC mostly forecast)
        check("m27 ΔPY on the year (+721, +885, +637 costs)", has("m27", "+721") && has("m27", "+885") && has("m27", "+637"));
        check("m27 ΔPY bars hatched", S.m27.charts[2].bars.length > 10 && S.m27.charts[2].bars.every(b => /^url\(/.test(b.fill)));
        check("m27 legend explains the hatch (FC) next to PY + AC", /FC/.test(S.m27.legend) && /PY/.test(S.m27.legend) && /AC/.test(S.m27.legend));
        // 1.5: one sentence, drivers with their effect on the result, the unit of the title line
        // 1.5.1: drivers with the Δ the table shows (+262 for the cost overrun), unit and effect in words, "%" after a narrow space
        // 1.5.2: FY outlook with minuend AC = AC&FC, the subject says "forecast"
        check("m27 headline slot: generated sentence, large", pageInfo.m27.headline === "Group result (forecast) is 144\u00A0kEUR (+76.6\u202F%) above previous year; "
            + "strongest driver is Licences with +721\u00A0kEUR higher income, largest drag is Purchases with +262\u00A0kEUR higher costs."
            && pageInfo.m27.headlineFs >= 16, JSON.stringify(pageInfo.m27.headline));
    }
    if (S.m28) {
        check("m28 12H heads PY | PL | ΔPY | ΔPY%", JSON.stringify(heads("m28")) === JSON.stringify(["PY", "PL", "ΔPY", "ΔPY%"]), heads("m28").join("|"));
        const bars = S.m28.charts[2].bars;
        // 1.5.1: PL minuend = outlined Δ bars (good / bad outline on paper), no pale tint any more
        check("m28 ΔPY bars outlined teal / red on paper", bars.length > 10
            && bars.every(b => b.fill === "#FFFFFF" && (b.stroke === "#0E8585" || b.stroke === "#E02B1D"))
            && bars.some(b => b.stroke === "#E02B1D"), JSON.stringify(bars.slice(0, 3)));
        check("m28 PL cascade outlined, cost rows on the pale ground", S.m28.charts[1].bars.some(b => b.fill === "#FFFFFF" && b.stroke === "#404040")
            && S.m28.charts[1].bars.some(b => b.fill === "#F2F2F2"));
        check("m28 PL pins: outlined heads", S.m28.charts[3].rects.some(r => r.fill === "#FFFFFF" && r.stroke === "#404040"));
        check("m28 values PL vs PY: Group result +111, Licences +183", has("m28", "+111") && has("m28", "+183"));
        check("m28 headline = the own message", pageInfo.m28.headline === "Compared to 2025 we plan a better group result for 2026 (+139 kEUR)");
        check("m28 legend PY + PL, no AC", /PY/.test(S.m28.legend) && /PL/.test(S.m28.legend) && !/AC actual/.test(S.m28.legend), S.m28.legend);
        check("headline off by default (m1, m15 have none)", pageInfo.m1.headline === null && pageInfo.m15.headline === null);
    }
    if (S.m29) {
        const bars = S.m29.charts[2].bars;
        check("m29 dark + blue/orange: Δ bars outlined #5BA3DC / #F0821E on the dark paper", bars.length > 10
            && bars.every(b => b.fill === "#1E1E1E" && (b.stroke === "#5BA3DC" || b.stroke === "#F0821E")), [...new Set(bars.map(b => b.fill + b.stroke))].join(","));
        // 1.5.1: the minuend PL is named in the subject of the generated headline
        check("m29 headline names the plan in the subject: “Group result (plan) is …”", /^Group result \(plan\) is 111\u00A0kEUR \(\+59\.0\u202F%\) above previous year; /.test(pageInfo.m29.headline || ""),
            JSON.stringify(pageInfo.m29.headline));
        check("m29 pins in #5BA3DC / #F0821E, no teal", S.m29.paints.includes("#5BA3DC") && S.m29.paints.includes("#F0821E")
            && !S.m29.paints.includes("#3FB3C2"));
        check("m29 deviation notes name blue / orange", /blue \/ orange/.test(pageInfo.m29.text) && !/teal replaces/.test(pageInfo.m29.text));
    }
    if (S.m30 && S.m11) {
        // same template + data as m11, the Δ scale held at ±60: every waterfall step is shorter
        const w = id => S[id].charts[0].bars.map(b => b.w);
        const a = w("m11"); const b = w("m30");
        check("m30 fixedVarMax 60: the T04B waterfall is drawn on the fixed (smaller) scale", a.length === b.length
            && b.every((x, i) => x <= a[i] + 0.01) && b.some((x, i) => x < a[i] - 1), JSON.stringify([a.slice(0, 4), b.slice(0, 4)]));
        check("m30 edit-mode note “Scale fixed” with both amounts", /^Scale fixed/.test(pageInfo.m30.note || "")
            && /2\u202F?000/.test(pageInfo.m30.note) && /±60/.test(pageInfo.m30.note), pageInfo.m30.note);
        check("no scale note without fixed scales (m11)", !/Scale fixed/.test(S.m11.legend));
    }
    // scale sync in the classic views: the uniform Δ scale note and the value bars follow the fixed maxima
    const classic = await page.evaluate(() => {
        const mk = (objects, view) => {
            const box = document.createElement("div");
            box.style.cssText = "width:1200px;height:700px;position:relative;";
            document.body.appendChild(box);
            const v = new Visual({ element: box, host: makeHost("en-US") });
            const o = { ...objects, state: { uiState: JSON.stringify({ view }) } };
            v.update({ dataViews: [dv(o)], viewport: { width: 1200, height: 700 }, type: 2 });
            const note = box.querySelector('[data-pnl="scale-note"]');
            const fixed = box.querySelector('[data-pnl="scale-fixed"]');
            const out = { note: note ? note.textContent : null, fixed: fixed ? fixed.textContent : null, html: box.innerHTML.length,
                rects: [...box.querySelectorAll("svg rect")].map(r => +r.getAttribute("width") || 0).reduce((a, b) => a + b, 0) };
            box.remove();
            return out;
        };
        return {
            t0: mk({ hierarchy: { defaultLevel: 1 } }, "table"),
            t1: mk({ hierarchy: { defaultLevel: 1 }, numbers: { fixedVarMax: "5b" } }, "table"),
            b0: mk({ hierarchy: { defaultLevel: 1 } }, "bars"),
            b1: mk({ hierarchy: { defaultLevel: 1 }, numbers: { fixedMax: "50b" } }, "bars"),
        };
    });
    check("classic table: fixedVarMax widens the uniform Δ scale (note) and shrinks the Δ bars, edit-mode note",
        classic.t0.note !== classic.t1.note && classic.t1.rects < classic.t0.rects && /^Scale fixed/.test(classic.t1.fixed || "")
        && classic.t0.fixed === null, JSON.stringify([classic.t0.note, classic.t1.note, classic.t0.rects, classic.t1.rects]));
    check("classic bars view: fixedMax holds the value scale (shorter value bars)", classic.b1.rects < classic.b0.rects,
        JSON.stringify([classic.b0.rects, classic.b1.rects]));
    if (S.m31) {
        check("m31 virtualization: 441 rows, only the rows around the viewport painted", S.m31.rowIds.length > 20 && S.m31.rowIds.length < 120
            && S.m31.bodyH > 400 * 22, `${S.m31.rowIds.length} rows, body ${S.m31.bodyH}`);
        check("below the threshold every row is painted (m15: 20 rows)", S.m15.rowIds.length === 20, String(S.m15.rowIds.length));
    }

    // ==== 1.5 · IBCS 2.0 / ISO 24896 scaling ======================================
    const rowBar = (id, ci, rowId) => {
        const i = S[id].rowIds.indexOf(rowId); const y = S[id].rowY[i];
        return S[id].charts[ci].bars.find(b => b.y > y && b.y < y + 22);
    };
    if (S.m5) {
        // 1.5.1: one Δ scale over month and YTD, no factor between blocks (1.5 drew the month "ΔPL ×5")
        check("m5 no scaling indicator between blocks (two plain ΔPL heads)",
            !heads("m5").some(h => /×/.test(h)) && heads("m5").filter(h => h === "ΔPL").length === 2, heads("m5").join("|"));
        check("m5 no scale note (nothing magnified, nothing fixed)", pageInfo.m5.scaleNote === null, pageInfo.m5.scaleNote);
        const m = rowBar("m5", 0, "L:World¦Europe"); const y = rowBar("m5", 2, "L:World¦Europe");
        const ratio = m && y ? (m.w / 36) / (y.w / 653) : 0;
        check("m5 px per kEUR: month = YTD (Europe −36 vs −653, ratio 1)", Math.abs(ratio - 1) < 0.05, String(ratio));
        // pins: one scale over both blocks; Japan +65.5 % capped into the outlier zone
        const pinY = S.m5.charts[3];
        const jp = pinY.labels.find(l => l.t === "+65.5"); const cn = pinY.labels.find(l => l.t === "+24.6");
        check("m5 Japan +65.5 runs past China +24.6 (outlier zone), break mark + triangle, number outside",
            pinY.breaks === 1 && pinY.arrows === 1 && jp && cn && jp.anchor === "start" && jp.x0 > cn.x0 + 10,
            JSON.stringify({ jp, cn, b: pinY.breaks }));
        check("m5 no paper halo on capped numbers any more", S.m5.charts.every(c => c.halos.length === 0));
    }
    if (S.m15) {
        const i = S.m15.rowIds.indexOf(S.m15.rowIds.find(r => /lic$/.test(r)));
        const yy = S.m15.rowY[i];
        const ac = S.m15.charts[1].bars.find(b => b.y > yy && b.y < yy + 22);
        const dpy = S.m15.charts[2].bars.find(b => b.y > yy && b.y < yy + 22);
        const r = ac && dpy ? (dpy.w / 183) / (ac.w / 896) : 0;
        check("m15 ΔPY bars on the scale of the value cascades (Licences +183 vs AC 896: same px per kEUR)",
            Math.abs(r - 1) < 0.03 && !heads("m15").some(h => /×/.test(h)), String(r));
        check("m15 no scale note (nothing magnified, nothing fixed)", pageInfo.m15.scaleNote === null, pageInfo.m15.scaleNote);
    }
    if (S.m32) {
        const ids = S.m32.rowIds; const ys = S.m32.rowY;
        const iSk = ids.findIndex(r => /Slovakia$/.test(r)); const iCz = ids.findIndex(r => /Czechia$/.test(r));
        check("m32 single-node regions Czechia / Slovakia shown as rows", iCz >= 0 && iSk === iCz + 1, ids.join(","));
        check("m32 spacer between Slovakia and the next row (1.5.1: Hungary · Budapest)", iSk >= 0 && ys[iSk + 1] - ys[iSk] > 22 + 5
            && /Budapest$/.test(ids[iSk + 1]), `${ys[iSk]} → ${ys[iSk + 1]} ${ids[iSk + 1]}`);
        check("m32 spacer after Europe stays (sum → row)", iCz > 0 && ys[iCz] - ys[iCz - 1] > 22 + 5);
        // 1.5.1: a gap after EVERY element of the top level, also between two single rows
        check("m32 gap between Czechia and Slovakia (1.5.1: every top-level element)", ys[iSk] - ys[iCz] > 22 + 5, `${ys[iCz]} → ${ys[iSk]}`);
        // 1.5.1: Hungary has one child — no subtotal that repeats Budapest, one row "Hungary · Budapest" between gaps
        const iHu = ids.findIndex(r => /Budapest$/.test(r));
        const labels32 = S.m32.body.map(x => x.t);
        check("m32 one-child group: one row “Hungary · Budapest”, no Hungary subtotal", iHu === iSk + 1
            && labels32.includes("Hungary · Budapest") && !labels32.includes("Hungary") && !ids.some(r => /Hungary$/.test(r)), ids.join(","));
        check("m32 one-child group stands between gaps like the others", ys[iHu] - ys[iSk] > 22 + 5 && ys[iHu + 1] - ys[iHu] > 22 + 5);
    }
    // ==== 1.5.1 ====================================================================
    if (S.m34) {
        // numbers.scaling m: the built-in thresholds −20 / −220 (thousands) are −0.02 / −0.22
        check("m34 thresholds converted at m: footer <−0.02 / <−0.22", has("m34", "<-0.02") && has("m34", "<-0.22") && !has("m34", "<-20"));
        const redM = t => { const c = cell("m34", t); return c && c.fill === "#E02B1D"; };
        check("m34 Germany ΔPY −0.085 red (< −0.02), YTD −0.274 red (< −0.22), Austria +0.059 not", redM("-0.085") && redM("-0.274")
            && !redM("+0.059"));
    }
    if (S.m38) {
        // T02B: one Δ scale over month and YTD, no factor between blocks
        check("m38 T02B: no ×n in any head", !heads("m38").some(h => /×/.test(h)), heads("m38").join("|"));
        const m = rowBar("m38", 0, "L:World¦Europe"); const y = rowBar("m38", 2, "L:World¦Europe");
        const ratio = m && y ? (m.w / 36) / (y.w / 653) : 0;
        check("m38 px per kEUR: month = YTD (ratio 1)", Math.abs(ratio - 1) < 0.05, String(ratio));
        check("m38 no scale note", pageInfo.m38.scaleNote === null, pageInfo.m38.scaleNote);
    }
    if (pageInfo.m36) {
        check("m36 de-DE headline: unit before the comma (Mio. EUR), Δ and effect in words, −/narrow space",
            pageInfo.m36.headline === "Group result liegt im Forecast 144\u00A0Mio.\u00A0EUR (+76,6\u202F%) über Vorjahr; stärkster Treiber ist Licences mit "
            + "+721\u00A0Mio.\u00A0EUR Mehrertrag, größte Belastung ist Purchases mit +262\u00A0Mio.\u00A0EUR Mehrkosten.", JSON.stringify(pageInfo.m36.headline));
        check("m37 de-DE headline without a measure line: unit from scaling + unitText (Mio. EUR, never mEUR)",
            /^Group result liegt im Forecast 144\u00A0Mio\.\u00A0EUR /.test(pageInfo.m37.headline || "") && !/mEUR/.test(pageInfo.m37.headline || ""),
            JSON.stringify(pageInfo.m37.headline));
    }
    if (S.m35) {
        // every comment marked in the table (①②③) is visible in the tile without scrolling
        const fit = await page.evaluate(() => {
            const st = document.getElementById("m35");
            const root = st.firstElementChild;
            const rb = root.getBoundingClientRect();
            const notes = [...st.querySelectorAll('[data-pnl="footnote"]')];
            const foot = st.querySelector('[data-pnl="footer"]');
            const fb = foot ? foot.getBoundingClientRect() : null;
            return { n: notes.length, scroll: root.scrollTop,
                inside: notes.map(li => { const b = li.getBoundingClientRect(); return b.top >= rb.top - 0.5 && b.bottom <= rb.bottom + 0.5; }),
                footer: !!fb && fb.top >= rb.top - 0.5 && fb.bottom <= rb.bottom + 0.5,
                marks: (st.querySelector('svg[data-pnl="mega-body"]').textContent.match(/[①②③]/g) || []).length };
        });
        check("m35 three comments marked in the table and all three footnotes inside the visible tile",
            fit.n === 3 && fit.marks === 3 && fit.inside.every(Boolean) && fit.scroll === 0, JSON.stringify(fit));
        // 1.5.2: the IBCS notation line under the footnotes is inside the tile too
        check("m35 the footer (IBCS notation line) is inside the visible tile", fit.footer, JSON.stringify(fit));
    }
    if (S.m33) {
        const bar = S.m33.charts[0];
        const ws = bar.bars.map(b => b.w).sort((a, b) => b - a);
        check("m33 capped Δ bars: break mark + triangle each (Consulting, Purchases, Sales revenue, Operating expenses)",
            bar.breaks >= 2 && bar.breaks === bar.arrows, `${bar.breaks} / ${bar.arrows}`);
        check("m33 a capped bar runs ≥ 15 px past the longest regular bar", ws[bar.breaks - 1] - ws[bar.breaks] >= 15, ws.slice(0, 6).join(","));
    }
    check("footer names IBCS 2.0 (ISO 24896), not certified", /IBCS® Standards 2\.0 \(ISO 24896\)/.test(pageInfo.m1.text)
        && !/Standards 1\.2/.test(pageInfo.m1.text) && /not certified/.test(pageInfo.m1.text)
        && /trademark of the IBCS Institute/.test(pageInfo.m1.text) && !/HICHERT/.test(pageInfo.m1.text));

    // ---- preset dropdown wrote the switches (persistProperties payload) ----------
    const persist = await page.evaluate(() => (window.__persist || []).map(x => ({ id: x.id, p: x.p })));
    const m1p = persist.find(x => x.id === "m1");
    const colObj = m1p && m1p.p.merge.find(o => o.objectName === "columns");
    const numObj = m1p && m1p.p.merge.find(o => o.objectName === "numbers");
    check("preset T03A persisted the switches + templateApplied", colObj && colObj.properties.templateApplied === "T03A"
        && colObj.properties.dPyAbs === true && colObj.properties.dPlPct === true && colObj.properties.secondBlock === false);
    check("preset T03A persisted decimals 1 / Δ% 1", numObj && numObj.properties.decimals === 1 && numObj.properties.pctDecimals === 1);
    check("single switches (m8) persist nothing", !persist.some(x => x.id === "m8"));
    const tplP = (id) => { const x = persist.find(q => q.id === id); return x ? x.p.merge : []; };
    const colsOf = id => (tplP(id).find(o => o.objectName === "columns") || {}).properties || {};
    const numsOf = id => (tplP(id).find(o => o.objectName === "numbers") || {}).properties || {};
    check("preset T04B persisted dPlWaterfall + pins, decimals 2 / Δ% 1", colsOf("m11").templateApplied === "T04B"
        && colsOf("m11").dPlWaterfall === true && colsOf("m11").dPlBar === false && colsOf("m11").dPlPin === true
        && numsOf("m11").decimals === 2 && numsOf("m11").pctDecimals === 1);
    check("preset T04C persisted dPyWaterfall, PY column, no PL", colsOf("m12").dPyWaterfall === true && colsOf("m12").showPY === true
        && colsOf("m12").showPL === false && colsOf("m12").dPlWaterfall === false);
    check("presets T04D / T04E persisted minuend FC", colsOf("m13").minuend === "fc" && colsOf("m14").minuend === "fc"
        && colsOf("m13").dPlWaterfall === true && colsOf("m14").dPyWaterfall === true);
    check("preset 12A persisted valueCascade + ΔPY bars/pins, no margins, decimals 0 / Δ% 1", colsOf("m15").valueCascade === true
        && colsOf("m15").dPyBar === true && colsOf("m15").dPyPin === true && colsOf("m15").showPctRows === false
        && numsOf("m15").decimals === 0 && numsOf("m15").pctDecimals === 1);
    check("single switches (m16) persist nothing", !persist.some(x => x.id === "m16"));
    check("synced template (m9) persists nothing", !persist.some(x => x.id === "m9"));

    // ==== 1.7 stock vs flow (Bestand vs. Fluss) ==================================
    if (S.m39 && S.m40 && S.m41 && S.m42) {
        // m39 T05A: one titled block (the reporting date), PY · AC · ΔPY (ΔPY% paired), the stands of September
        check("m39 T05A heads: September · PY AC ΔPY", JSON.stringify(heads("m39")) === JSON.stringify(["September", "PY", "AC", "ΔPY"]), heads("m39").join("|"));
        check("m39 Kasse und Bank: AC 498 (the September stand, not the sum of nine months), PY 440, ΔPY +58 / +13,2%",
            has("m39", "498") && has("m39", "440") && has("m39", "+58") && has("m39", "+13,2%") && !has("m39", "4 590"));
        check("m39 Aktiva = Passiva = 8 316 (bold), both \"=\" rows", cell("m39", "8 316") && cell("m39", "8 316").bold
            && S.m39.body.filter(x => x.t === nb("8 316")).length === 2 && S.m39.body.filter(x => x.t === "=").length === 2,
            JSON.stringify(S.m39.body.filter(x => x.t === "=").length));
        check("m39 liabilities: −690 less bank debt (favourable — VarianceInvert), Eigenkapital +920",
            has("m39", "-690") && has("m39", "+920"));
        // the double rule: two ink lines 3 px apart under each balance-sheet total
        const dbl = await page.evaluate(() => {
            const body = document.querySelector('#m39 svg[data-pnl="mega-body"]');
            const rows = [...body.querySelectorAll('rect[data-pnl-part="cells"]')].map(r => ({ id: r.getAttribute("data-pnl-row"),
                y: +r.getAttribute("y"), h: +r.getAttribute("height") }));
            const lines = [...body.querySelectorAll("g[shape-rendering] > line")].filter(l => l.getAttribute("stroke") === "#404040"
                && l.getAttribute("y1") === l.getAttribute("y2")).map(l => +l.getAttribute("y1"));
            const at = (id) => { const r = rows.find(x => x.id === id); if (!r) { return null; }
                const b = r.y + r.h; return [lines.filter(y => Math.abs(y - (b - 0.5)) < 0.01).length, lines.filter(y => Math.abs(y - (b - 3.5)) < 0.01).length]; };
            return { aktiva: at("L:Aktiva"), passiva: at("L:Passiva"), kasse: at("A_KASSE") };
        });
        check("m39 double rule under Aktiva and Passiva (two ink lines, 3 px apart), none under a position",
            dbl.aktiva && dbl.aktiva[0] >= 3 && dbl.aktiva[1] >= 3 && dbl.passiva && dbl.passiva[1] >= 3 && dbl.kasse && dbl.kasse[1] === 0,
            JSON.stringify(dbl));
        const p39 = (persist.find(x => x.id === "m39") || { p: { merge: [] } }).p.merge;
        const st39 = (p39.find(o => o.objectName === "statement") || {}).properties || {};
        const co39 = (p39.find(o => o.objectName === "columns") || {}).properties || {};
        check("m39 T05A persisted statement.stockMode = allStock in the same merge as the switches (no token in the data)",
            st39.stockMode === "allStock" && co39.templateApplied === "T05A" && co39.dPyPct === true && co39.showPL === false, JSON.stringify(st39));
        // m41: the tokens decide (auto), PL by hand: PY PL AC ΔPY ΔPL
        check("m41 tokens + PL: heads September · PY PL AC ΔPY ΔPL, the same stands (498, 8 316)",
            JSON.stringify(heads("m41")) === JSON.stringify(["September", "PY", "PL", "AC", "ΔPY", "ΔPL"]) && has("m41", "498") && has("m41", "8 316"),
            heads("m41").join("|"));
        check("m41 Kasse ΔPL −37 against the plan stand of September (535)", has("m41", "535") && has("m41", "-37"));
        // m40 T05B: month | _September, PY + AC cascades, ΔPY · ΔPY%
        check("m40 T05B heads: September | _September, PY AC ΔPY twice",
            JSON.stringify(heads("m40")) === JSON.stringify(["September", "_September", "PY", "AC", "ΔPY", "PY", "AC", "ΔPY"]), heads("m40").join("|"));
        check("m40 YTD bridge: opening 600 → … → closing 498, the month: opening 433 → closing 498", has("m40", "+249") && has("m40", "+58")
            && S.m40.charts.some(c => c.labels.some(l => l.t === "600")) && S.m40.charts.some(c => c.labels.some(l => l.t === "433"))
            && S.m40.charts.filter(c => c.labels.some(l => l.t === "498")).length === 2);
        // the anchors: opening and closing stand start at the axis of the cascade, the first flow starts at the opening's end
        const anchor = (id, ci) => {
            const ax = S[id].charts[ci].axes.length ? S[id].charts[ci].axes[0].x : null;
            const o = rowBar(id, ci, "CF_ANF"); const e = rowBar(id, ci, "CF_END"); const j = rowBar(id, ci, "CF_JUE");
            return { ax, o, e, j };
        };
        const a40 = anchor("m40", 3); // the AC cascade of the _September block
        check("m40 opening and closing balance anchor at the zero line, net income floats from the opening's end",
            a40.o && a40.e && a40.j && Math.abs(a40.o.x - a40.ax) < 1 && Math.abs(a40.e.x - a40.ax) < 1 && Math.abs(a40.j.x - (a40.o.x + a40.o.w)) < 1,
            JSON.stringify(a40));
        check("m40 \"=\" on the opening and the closing balance, double rule only under the closing balance",
            S.m40.body.filter(x => x.t === "=").length === 2);
        // m42: YTD | FY outlook without FY measures — stocks at their FC end stand (hatched), flows AC + FC rest
        check("m42 blocks _September | FY 2026", heads("m42").includes("_September") && heads("m42").includes("FY 2026"), heads("m42").join("|"));
        const fyCasc = S.m42.charts[S.m42.charts.length - 1 - 0];
        check("m42 FY: closing 645 (FC December), opening 600, PY closing 600 (December of the previous year)",
            S.m42.charts.some(c => c.labels.some(l => l.t === "645")) && S.m42.charts.some(c => c.labels.some(l => l.t === "600")) && has("m42", "+45"));
        const hatchedEnd = (() => { for (const c of S.m42.charts) { const b = rowBar("m42", S.m42.charts.indexOf(c), "CF_END");
            if (b && /^url\(/.test(b.fill || "")) { return true; } } return false; })();
        check("m42 the closing balance in the AC&FC column is one hatched bar (no YTD share in a stock)", hatchedEnd);
        void fyCasc;
    }
    // p28 / p29: the row waterfall and the classic table over stocks
    const cls = await page.evaluate(() => {
        const out = {};
        const st = document.getElementById("p28");
        const rows = (id) => [...document.getElementById(id).querySelectorAll("[data-pnl-row]")];
        const geo = (row) => [...row.querySelectorAll("svg")].map(svg => {
            const r = svg.querySelector("rect"); const lines = [...svg.querySelectorAll("line")];
            const axis = lines[lines.length - 1];
            return r && axis ? { x: +r.getAttribute("x"), w: +r.getAttribute("width"), ax: +axis.getAttribute("x1") } : null;
        }).filter(Boolean).slice(0, 2); // the PL and AC cascade cells (the Δ bar and pin follow)
        const by = (id, rid) => rows(id).find(r => r.getAttribute("data-pnl-row") === rid);
        out.anf = geo(by("p28", "CF_ANF")); out.end = geo(by("p28", "CF_END")); out.op = geo(by("p28", "L:Operativer Cashflow"));
        out.p28text = st.innerText;
        const kasse = by("p29", "A_KASSE"); const akt = by("p29", "L:Aktiva");
        out.kasse = kasse ? kasse.innerText : "";
        out.aktDbl = akt ? [...akt.children].some(c => /double/.test(c.style.borderBottom)) : false;
        out.kasseDbl = kasse ? [...kasse.children].some(c => /double/.test(c.style.borderBottom)) : true;
        out.p29tip = [...document.querySelectorAll("#p29 button")].map(b => b.title).filter(t => /stand|balance/i.test(t));
        return out;
    });
    check("p28 row waterfall: opening and closing balance anchor at the axis (PL and AC), operating cash flow floats",
        cls.anf.length >= 2 && cls.end.length >= 2 && cls.anf.every(g => Math.abs(g.x - g.ax) < 0.6) && cls.end.every(g => Math.abs(g.x - g.ax) < 0.6)
        && cls.op.length >= 2 && cls.op.every(g => Math.abs(g.x - g.ax) > 2), JSON.stringify([cls.anf, cls.end, cls.op]));
    check("p28 the PL bridge closes in the YTD window: 600 → 1 331 → −636 → −760 → 535",
        /600,0/.test(cls.p28text) && /1\u202f331,0|1 331,0/.test(cls.p28text) && /535,0/.test(cls.p28text), cls.p28text.slice(0, 200));
    check("p29 classic table over a balance sheet: Kasse AC 498.0 / PY 440.0 (the September stands)",
        /498\.0/.test(cls.kasse) && /440\.0/.test(cls.kasse), cls.kasse);
    check("p29 double rule under the top-level stock total only", cls.aktDbl && !cls.kasseDbl);
    check("p29 the period buttons explain the stock rule (tooltips)", cls.p29tip.length >= 2, JSON.stringify(cls.p29tip));

    // ---- 1.7 ⚡ "only exceptions" (m43..m46) ----------------------------------------
    const exc = await page.evaluate(() => {
        const note = (id) => (document.querySelector(`#${id} [data-pnl="exc-note"]`) || {}).textContent || "";
        const texts = (id) => [...document.querySelectorAll(`#${id} svg[data-pnl="mega-body"] text`)].map(t => ({
            t: t.textContent, x: +t.getAttribute("x"), y: +t.getAttribute("y"), fill: t.getAttribute("fill") }));
        const ids = (id) => [...document.querySelectorAll(`#${id} svg[data-pnl="mega-body"] rect[data-pnl-part="cells"]`)].map(r => r.getAttribute("data-pnl-row"));
        const rectFills = (id) => [...document.querySelectorAll(`#${id} svg[data-pnl="mega-body"] g[data-pnl="mega-chart"] rect`)].map(r => r.getAttribute("fill"));
        const dashed = (id) => [...document.querySelectorAll(`#${id} svg[data-pnl="mega-body"] g[data-pnl="mega-chart"] rect[stroke-dasharray="2,2"]`)].length;
        // closure of a cascade column: a total ("span") reaches exactly as far as its own value
        const close = (id) => {
            const L = window.__visuals[id].megaLast; let n = 0; let bad = 0;
            for (const c of L.cols.filter(c => c.type === "wf" && c.casc)) {
                // the value the cascade steps with: the row's Δ in its effect on the result
                const val = new Map();
                for (const r of L.rows) {
                    const D = r.id ? L.input.blocks[c.block].delta(r, L.input.t.min, c.ref) : null;
                    if (D && !D.pp) { val.set(r.id, D.d * (r.eff ?? 1)); }
                }
                for (const [rid, seg] of c.casc) {
                    if (seg.type !== "span" || !val.has(rid)) { continue; }
                    n++;
                    if (Math.abs((seg.e - seg.s) - val.get(rid)) > 1e-6 * (1 + Math.abs(val.get(rid)))) { bad++; }
                }
                // every "=" row lands where the run before it ended
                let prev = null;
                for (const r of L.rows) {
                    const seg = r.id ? c.casc.get(r.id) : null;
                    if (!seg) { continue; }
                    if (seg.type === "anchor" && prev) { n++; if (Math.abs(prev.e - seg.e) > 1e-6 * (1 + Math.abs(seg.e))) { bad++; } }
                    prev = seg;
                }
            }
            return { n, bad };
        };
        return { n43: note("m43"), n44: note("m44"), n45: note("m45"), n46: note("m46"),
            t3: texts("m3"), t43: texts("m43"), ids10: ids("m10"), ids44: ids("m44"), ids11: ids("m11"), ids45: ids("m45"),
            f11: rectFills("m11"), f45: rectFills("m45"), d46: dashed("m46"), d5: dashed("m5"),
            lbl45: [...document.querySelectorAll('#m45 svg[data-pnl="mega-body"] text')].map(t => t.textContent).filter(t => /^other \(/.test(t)),
            close11: close("m11"), close45: close("m45") };
    });
    {
        const SOFT = "#8A8886";
        const same = exc.t3.length === exc.t43.length && exc.t3.every((t, i) => t.t === exc.t43[i].t && t.x === exc.t43[i].x);
        const changed = exc.t3.map((t, i) => [t, exc.t43[i]]).filter(([a, b]) => same && a.fill !== b.fill);
        const isDelta = (s) => /^[+\u2212-]|%$/.test(s.trim());
        const red = (arr) => arr.filter(t => t.fill && /^#(E02B1D|FF2600)$/i.test(t.fill)).length;
        const rowOf = (label) => { const l = exc.t43.find(t => t.t === label); return l ? exc.t43.filter(t => Math.abs(t.y - l.y) < 0.5) : []; };
        const softIn = (label) => rowOf(label).filter(t => t.fill === SOFT && isDelta(t.t)).length;
        check("m43 ⚡ T01A: the same table as m3 — only Δ numbers of non-exceptions change, to the soft ink",
            same && changed.length > 10 && changed.every(([a, b]) => b.fill === SOFT && isDelta(a.t)), String(changed.length));
        check("m43 ⚡ the explicit “Δ in red if” rule still wins (red numbers unchanged)", red(exc.t3) > 0 && red(exc.t3) === red(exc.t43),
            `${red(exc.t3)} / ${red(exc.t43)}`);
        check("m43 ⚡ row rule: Other Europe (no block ≥ 10 %) grey; Austria (ΔPY +11.8 % in the month) keeps its ink",
            softIn("Other Europe") >= 4 && softIn("Austria") === 0, `${softIn("Other Europe")} / ${softIn("Austria")}`);
        check("m43 ⚡ footer note names the rule and the references of the view",
            /Colour only for exceptions: \|Δ%\| ≥ 10 % vs PY · PL$/.test(exc.n43), exc.n43);
        const gone = exc.ids10.filter(i => !exc.ids44.includes(i));
        const hidN = Number((exc.n44.match(/(\d+) rows below the threshold hidden/) || [])[1] || 0);
        check("m44 ⚡ hide in T04A: detail rows leave the table, the note counts exactly them",
            gone.length > 0 && exc.ids44.every(i => exc.ids10.includes(i)) && hidN === gone.length, `${gone.join(",")} · ${exc.n44}`);
        check("m44 ⚡ hide: totals (L:…) and the result row (last row) always stay",
            exc.ids10.filter(i => i.startsWith("L:")).every(i => exc.ids44.includes(i))
            && exc.ids44[exc.ids44.length - 1] === exc.ids10[exc.ids10.length - 1], JSON.stringify(exc.ids44));
        // polish: hide over a cascade folds the quiet steps of a section into one "other (n)" step;
        // a total without an exception below it keeps no children — the cascade stays closed
        const rest45 = exc.ids45.filter(i => i.startsWith("__exc_rest__"));
        const nSum = Number((exc.n45.match(/(\d+) steps below the threshold combined/) || [])[1] || 0);
        check("m45 ⚡ hide over the integrated Δ waterfall (T04B): quiet steps leave, “other (n)” rows take their sum, the note counts them",
            rest45.length > 0 && exc.ids45.length < exc.ids11.length && nSum > 0 && exc.lbl45.every(l => /^other \(\d+\)$/.test(l))
            && exc.lbl45.length === rest45.length && exc.f45.includes(SOFT) && !exc.f11.includes(SOFT), `${rest45.length} · ${exc.n45}`);
        check("m45 ⚡ every kept row of m11 stays, in the same order",
            JSON.stringify(exc.ids45.filter(i => !i.startsWith("__exc_rest__"))) === JSON.stringify(exc.ids11.filter(i => exc.ids45.includes(i))));
        check("m45 ⚡ the Δ waterfall stays closed: every total spans exactly its own Δ (m11 and m45)",
            exc.close11.n >= 3 && exc.close11.bad === 0 && exc.close45.n >= 3 && exc.close45.bad === 0, JSON.stringify([exc.close11, exc.close45]));
        check("m46 ⚡ high contrast: non-exceptions are dashed outlines (no grey, no pattern); without ⚡ nothing is dashed",
            exc.d46 > 4 && exc.d5 === 0 && /Colour only/.test(exc.n46), `${exc.d46} / ${exc.d5}`);
    }

    await browser.close();
    for (const n of notes) { console.log(n); }
    if (errors > 0) { failures.push(errors + " render errors"); }
    if (failures.length) {
        console.error("\n" + failures.length + " mega check(s) failed:\n  ✗ " + failures.join("\n  ✗ "));
        process.exit(1);
    }
    console.log(`\n${notes.length} mega checks passed — see test/mega-m*.png`);
})();
