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
