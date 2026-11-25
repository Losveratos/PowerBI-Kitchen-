/*
 * 1.5 scale test of the classic views and the driver tree (headless Chromium
 * over test/test.html): IBCS 2.0 / ISO 24896 "same unit, same scale".
 *
 *   bars view (p7, p16), waterfall view (p2): the Δ bars take the scale of
 *     the value bars / cascades, or a round multiple that the column head
 *     ("ΔPL ×5") and the scale note name — measured as px per unit of the
 *     drawn bars against their labels
 *   table view (p1): one Δ scale for every block; Δ% pins beyond ±40 % run
 *     into an outlier zone with a break mark and a triangle (no "▸")
 *   driver tree (p8, p10): every card of one unit draws at one px per unit;
 *     a card that would be unreadable carries a round factor "×n" and is
 *     drawn exactly n times larger
 *
 * Run: node test/scale-views.js  (after node test/build.js; npm run test:scale)
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

/** runs in the page: px per unit of every chart column of a classic table (largest regular element) */
function classic(id) {
    const st = document.getElementById(id);
    const num = (s) => { const v = parseFloat(String(s).replace(/−/g, "-").replace(/[   ]/g, "").replace(/[()▸%]/g, "")); return isFinite(v) ? v : null; };
    const hdr = [...st.querySelectorAll('[data-pnl="hdr-row"]')].pop();
    const heads = hdr ? [...hdr.children].map(c => c.textContent.trim()) : [];
    const rows = [...st.querySelectorAll("[data-pnl-row]")].filter(r => r.children.length === heads.length);
    const cols = [];
    heads.forEach((h, i) => {
        if (!/Δ|AC|PL|PY/.test(h) || /%$/.test(h)) { return; }
        let best = null;
        for (const r of rows) {
            const svg = r.children[i] && r.children[i].querySelector("svg");
            if (!svg) { continue; }
            const t = [...svg.querySelectorAll("text")].pop();
            const v = t ? num(t.textContent) : null;
            if (v == null || v === 0) { continue; }
            const rects = [...svg.querySelectorAll("rect")].filter(x => +x.getAttribute("width") > 0);
            if (!rects.length) { continue; }
            const minH = Math.min(...rects.map(x => +x.getAttribute("height")));
            const bar = rects.filter(x => +x.getAttribute("height") === minH)
                .sort((a, c) => +c.getAttribute("width") - +a.getAttribute("width"))[0];
            const len = +bar.getAttribute("width");
            if (len < 8) { continue; }
            if (!best || Math.abs(v) > Math.abs(best.v)) { best = { v, len }; }
        }
        if (best) { cols.push({ h, i, ppu: best.len / Math.abs(best.v) }); }
    });
    const note = st.querySelector('[data-pnl="scale-note"]');
    return {
        heads, cols, note: note ? note.textContent : "",
        pinOut: st.querySelectorAll('[data-pnl="pin-outlier"]').length,
        pinBreak: st.querySelectorAll('[data-pnl="pin-break"]').length,
        // 1.8.4 a capped pin keeps its head; a Δ% without meaning reads "n.a." (no pin)
        pinHead: [...st.querySelectorAll('[data-pnl="pin-head"]')].map(c => c.getAttribute("fill")),
        // 1.8.4 every head of an AC&FC (FY) pin: hatched (pattern) with its colour as outline, never an empty ring
        fcHeads: [...st.querySelectorAll('circle[data-pnl-fc]')].map(c => ({ fill: c.getAttribute("fill"), stroke: c.getAttribute("stroke") })),
        // an empty ring: a head filled with the page colour (light #FFF…, dark #1E1E1E …) and only an outline
        rings: [...st.querySelectorAll("circle")].filter(c => {
            const f = (c.getAttribute("fill") || "").toUpperCase();
            return c.getAttribute("stroke") && (/^#F/.test(f) || f === "#1E1E1E" || f === getComputedStyle(st.querySelector(".pnl-root")).backgroundColor);
        }).length,
        // 1.8.4 one hatch <defs> per table, none inside the pin cells; its stripes in ink on the page colour
        pinDefs: [...st.querySelectorAll('svg[data-pnl="pin-defs"] pattern')].map(p => ({ id: p.id, w: p.getAttribute("width"),
            bg: p.children[0] && p.children[0].getAttribute("fill"), ink: p.children[1] && p.children[1].getAttribute("fill"),
            line: p.children[1] && p.children[1].getAttribute("width") })),
        cellDefs: [...st.querySelectorAll('[data-pnl-row] svg defs pattern[id^="pnlpinfc"]')].length,
        stems: [...st.querySelectorAll('circle[data-pnl-fc]')].map(c => { const l = [...c.parentNode.querySelectorAll("line")].find(x => x.getAttribute("stroke-width") === "1.4"); return l ? l.getAttribute("stroke") : null; }),
        pinHeadAt: [...st.querySelectorAll('[data-pnl="pin-head"]')].map(c => {
            const tri = c.parentNode.querySelector('[data-pnl="pin-outlier"]');
            const m = tri ? /M([\d.\-]+),/.exec(tri.getAttribute("d")) : null;
            return { cx: +c.getAttribute("cx"), tip: m ? +m[1] : null };
        }),
        pinNaRow: [...st.querySelectorAll('[data-pnl="pin-na"]')].map(t => ({ t: t.textContent, italic: t.getAttribute("font-style") === "italic",
            fill: t.getAttribute("fill"), row: (t.closest("[data-pnl-row]") || { getAttribute: () => "" }).getAttribute("data-pnl-row") })),
        pinNa: [...st.querySelectorAll('[data-pnl="pin-na"]')].map(t => t.textContent),
        arrows: [...st.querySelectorAll("text")].filter(t => /▸$/.test(t.textContent)).length,
    };
}

/** runs in the page: px per unit of every months card of the tree (labelled AC column), with its ×n */
function tree(id) {
    const st = document.getElementById(id);
    const svg = st.querySelector("svg[style*='margin-top']") || st.querySelector("svg");
    const cards = [];
    const inner = svg.querySelector("g");
    for (const g of inner.children) {
        if (g.tagName !== "g") { continue; }
        const title = [...g.querySelectorAll("text")].find(t => t.getAttribute("font-weight") === "600");
        const mag = g.querySelector('[data-pnl="tree-mag"]');
        // AC columns (ink) in the months cards, the Δ columns (good / bad) in the Δ cards
        const rects = [...g.querySelectorAll("rect")].filter(r => /^#(404040|0E8585|E02B1D)$/i.test(r.getAttribute("fill") || ""));
        let best = null;
        for (const t of g.querySelectorAll("text")) {
            const v = parseFloat(t.textContent.replace(/−/g, "-").replace(/[   +]/g, ""));
            if (!isFinite(v) || v === 0 || /%|pp/.test(t.textContent)) { continue; }
            const x = +t.getAttribute("x");
            const r = rects.map(rc => ({ rc, d: Math.abs(+rc.getAttribute("x") + +rc.getAttribute("width") / 2 - x) }))
                .sort((a, b) => a.d - b.d)[0];
            if (!r || r.d > 4) { continue; }
            const hgt = +r.rc.getAttribute("height");
            if (hgt < 4) { continue; }
            if (!best || Math.abs(v) > Math.abs(best.v)) { best = { v, hgt }; }
        }
        if (best) {
            cards.push({ name: title ? title.textContent : "?", mag: mag ? +mag.getAttribute("data-factor") : 1,
                ppu: best.hgt / Math.abs(best.v) });
        }
    }
    const note = st.querySelector('[data-pnl="tree-scale-note"]');
    return { cards, marks: st.querySelectorAll('[data-pnl="tree-mag"]').length, note: note ? note.textContent : "" };
}

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 2200, height: 1400 } });
    let errors = 0;
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    await page.goto("file://" + __dirname + "/test.html");
    await page.waitForTimeout(1000);

    // ---- bars + waterfall: Δ bars on the value scale (or a named round multiple)
    for (const id of ["p7", "p16", "p2"]) {
        const r = await page.evaluate(classic, id);
        const vals = r.cols.filter(c => !/^Δ/.test(c.h));
        const ds = r.cols.filter(c => /^Δ/.test(c.h));
        const vPpu = vals.length ? Math.max(...vals.map(c => c.ppu)) : 0;
        check(`${id}: one value scale for all value bars / cascades`, vals.length > 0
            && vals.every(c => Math.abs(c.ppu / vPpu - 1) < 0.03), JSON.stringify(vals));
        for (const d of ds) {
            const m = /×(\d+)$/.exec(d.h); const f = m ? +m[1] : 1;
            check(`${id}: ${d.h} = ${f} × the value scale (px per unit)`, Math.abs(d.ppu / (vPpu * f) - 1) < 0.06,
                `${d.ppu} vs ${vPpu} × ${f}`);
        }
        const mag = ds.some(d => /×\d+$/.test(d.h));
        check(`${id}: the scale note names the rule${mag ? " and the factor" : ""}`,
            mag ? /magnified ×\d+ against the value bars/.test(r.note) : /on the scale of the value bars/.test(r.note), r.note);
    }

    // ---- table view: one Δ scale over the blocks, pins with an outlier zone
    {
        const r = await page.evaluate(classic, "p1");
        const ds = r.cols.filter(c => /^Δ/.test(c.h));
        check("p1 table: one Δ scale over every block and reference", ds.length >= 2
            && ds.every(c => Math.abs(c.ppu / ds[0].ppu - 1) < 0.06), JSON.stringify(ds));
        check("p1 table: Δ% outliers run into the zone — break mark + triangle, no ▸",
            r.pinOut > 0 && r.pinBreak === r.pinOut && r.arrows === 0, JSON.stringify({ o: r.pinOut, b: r.pinBreak, a: r.arrows }));
        check("p1 table: the note keeps the uniform Δ scale", /uniform Δ scale/.test(r.note), r.note);
        check("p1 1.8.4 every capped pin keeps its head before the triangle (head centre inside, tip beyond)",
            r.pinOut > 0 && r.pinHead.length === r.pinOut && r.pinHead.every(f => f && f !== "none")
            && r.pinHeadAt.every(h => h.tip != null && Math.abs(h.tip - h.cx) > 2), JSON.stringify(r.pinHeadAt));
        check("p1 1.8.4 the AC&FC (FY) pin heads as in sheet 12G: ink outline, hatched in ink, the stem alone in the variance colour",
            r.fcHeads.length > 0 && r.fcHeads.every(h => /^url\(#pnlpinfc/.test(h.fill) && h.stroke === "#404040") && r.rings === 0
            && r.stems.length > 0 && r.stems.every(c => c && c !== "#404040"), JSON.stringify({ fc: r.fcHeads.slice(0, 2), rings: r.rings, stems: r.stems.slice(0, 3) }));
        check("p1 1.8.4 one shared hatch per table (period 2.0, line 0.9, ink #404040 on paper), none inside the cells",
            r.pinDefs.length === 1 && r.pinDefs[0].w === "2" && r.pinDefs[0].line === "0.9" && r.pinDefs[0].ink === "#404040" && r.cellDefs === 0,
            JSON.stringify({ defs: r.pinDefs, cell: r.cellDefs }));
        // dark mode (p13) and the blue / orange preset: the head stays ink on the page colour, the stem follows the preset
        const dk = await page.evaluate(classic, "p13");
        check("p13 dark: the AC&FC heads hatched in the light ink (#D9D9D9) on dark paper, no empty ring",
            dk.fcHeads.length > 0 && dk.fcHeads.every(h => h.stroke === "#D9D9D9") && dk.rings === 0 && dk.pinDefs.length === 1
            && dk.pinDefs[0].ink === "#D9D9D9" && dk.pinDefs[0].bg !== "#FFFFFF", JSON.stringify({ fc: dk.fcHeads.slice(0, 2), defs: dk.pinDefs, rings: dk.rings }));
        const bo = await page.evaluate(() => {
            const d = document.createElement("div"); d.className = "stage"; d.id = "fy-bo"; d.style.cssText = "width:1900px;height:900px;";
            document.body.appendChild(d);
            const v = new PnlByDatenWG.Visual({ element: d, host: makeHost("en-US") });
            v.update({ dataViews: [dv({ titleBlock: TITLE, hierarchy: { defaultLevel: 2 }, style: { variancePreset: "blueOrange" } })],
                viewport: { width: 1900, height: 900 }, type: 2 });
            return true;
        });
        const b = bo ? await page.evaluate(classic, "fy-bo") : null;
        // a hidden twin (display:none) earlier in the DOM must not lend its pattern: every head finds
        // the hatch inside its own visual (until the review the id had no instance part: empty rings)
        const twin = await page.evaluate(() => {
            const mk = (id, hidden) => { const d = document.createElement("div"); d.id = id; d.className = "stage";
                d.style.cssText = `width:1900px;height:900px;${hidden ? "display:none;" : ""}`; document.body.prepend(d);
                const v = new PnlByDatenWG.Visual({ element: d, host: makeHost("en-US") });
                v.update({ dataViews: [dv({ titleBlock: TITLE, hierarchy: { defaultLevel: 2 } })], viewport: { width: 1900, height: 900 }, type: 2 }); return d; };
            const vis = mk("fy-vis", false); mk("fy-hid", true);
            const heads = [...vis.querySelectorAll("circle[data-pnl-fc]")];
            const own = heads.every(c => { const id = (/url\(#([^)]+)\)/.exec(c.getAttribute("fill") || "") || [])[1]; return id && vis.querySelector("#" + id) != null
                && document.getElementById(id) === vis.querySelector("#" + id); });
            const ids = new Set([...document.querySelectorAll('svg[data-pnl="pin-defs"] pattern')].map(x => x.id));
            return { n: heads.length, own, ids: ids.size };
        });
        check("1.8.4 a hidden twin visual earlier in the DOM does not lend its pattern: the heads use their own (instance id)",
            twin.n > 0 && twin.own && twin.ids >= 2, JSON.stringify(twin));
        check("blue / orange: the AC&FC heads stay ink, the stems take #2C7BB6 / #E66101",
            b && b.fcHeads.length > 0 && b.fcHeads.every(h => h.stroke === "#404040") && b.stems.every(c => /#2C7BB6|#E66101/i.test(c || "")),
            JSON.stringify(b && { fc: b.fcHeads.slice(0, 1), stems: [...new Set(b.stems)] }));
        const q = await page.evaluate(classic, "p30");
        check("p30 1.8.4 classic Δ% pins: Financial income crosses zero, \"n.a.\" (italic, soft ink) on its row instead of a pin; Other revenue +62.7 % capped with its filled head",
            q.pinNaRow.length >= 1 && q.pinNaRow.every(x => x.t === "n.a." && x.italic && /^#8A8886$/i.test(x.fill))
            && q.pinNaRow.some(x => /fin/.test(x.row)) && q.pinOut >= 1 && q.pinHead.length === q.pinOut
            && q.pinHead.every(f => f && !/^url/.test(f)), JSON.stringify({ na: q.pinNaRow, out: q.pinOut, head: q.pinHead }));
    }

    // ---- driver tree: one px per unit across the cards, ×n exact
    for (const id of ["p8", "p10"]) {
        const r = await page.evaluate(tree, id);
        const amt = r.cards;
        const base = amt.filter(c => c.mag === 1).map(c => c.ppu);
        const ref = base.length ? Math.min(...base) : 0;
        check(`${id} tree: ${amt.length} measured cards, every one at the shared scale × its mark`, amt.length >= 3 && ref > 0
            && amt.every(c => Math.abs(c.ppu / (ref * c.mag) - 1) < 0.12),
            JSON.stringify(amt.map(c => [c.name, +c.ppu.toFixed(3), c.mag])));
        check(`${id} tree: hint line names the rule`, /One scale per unit across all cards/.test(r.note), r.note.slice(-140));
    }
    {
        const r = await page.evaluate(tree, "p8");
        check("p8 tree: small cards are magnified and marked (×n)", r.marks >= 1, String(r.marks));
    }

    await browser.close();
    for (const n of notes) { console.log(n); }
    if (errors > 0) { failures.push(errors + " page errors"); }
    if (failures.length) {
        console.error("\n" + failures.length + " scale check(s) failed:\n  ✗ " + failures.join("\n  ✗ "));
        process.exit(1);
    }
    console.log(`\n${notes.length} scale checks passed`);
})();
