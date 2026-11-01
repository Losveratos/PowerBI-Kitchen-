/*
 * 1.7.1 tile view (Kachel-Zoom) test over test/tile.html.
 *
 *  · one scale for every Δ of the tile: step height / |Δ| is the same for every
 *    step above one hairline (no 3.5 px minimum bricks any more), the zone label
 *    carries the IBCS scaling indicator "ΔPL ×n" when the Δ scale magnifies the
 *    value scale, and ×1 when every Δ is zero;
 *  · one value scale for anchors, monthly columns and the total;
 *  · an actuals measure that returns 0 instead of BLANK for unposted months:
 *    the forecast still fills them (hatched), the total and the badge are the
 *    same as with BLANK, and edit mode shows the author hint;
 *  · stocks: stands instead of month sums — the total is the stand at the end of
 *    the AC&FC series and the badge compares stand with stand.
 *
 * Run: node test/build.js && node test/tile-test.js  (npm run test:tile)
 */
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const path = require("path");

const failures = []; const notes = [];
const check = (label, cond, detail) => {
    if (cond) { notes.push("  ok · " + label); return; }
    failures.push(label + (detail ? " — " + detail : ""));
};
const ui = (x) => ({ uiState: JSON.stringify(Object.assign({ treeV: 2, ref: "pl" }, x)) });

function read(id) {
    const s = document.getElementById(id);
    const H = (e) => parseFloat(e.getAttribute("height"));
    const steps = [...s.querySelectorAll('[data-pnl="combo-step"]')].map(e => ({ h: H(e), d: Math.abs(+e.getAttribute("data-d")), fc: e.getAttribute("data-fc") === "1" }));
    const months = [...s.querySelectorAll('[data-pnl="combo-month"]')].map(e => ({ h: H(e), v: Math.abs(+e.getAttribute("data-v")), fc: e.getAttribute("data-fc") === "1" }));
    const lab = s.querySelector('[data-pnl="combo-dlabel"]');
    const dtot = s.querySelector('[data-pnl="combo-dtotal"]');
    const badge = s.querySelector('[data-pnl="combo-badge"]');
    const anchors = [...s.querySelectorAll('[data-pnl="combo-anchor"]')].map(e => ({ scen: e.getAttribute("data-scen"), h: H(e) }));
    const totAc = s.querySelector('[data-pnl="combo-total-ac"]'); const totFc = s.querySelector('[data-pnl="combo-total-fc"]');
    const foot = [...s.querySelectorAll('[data-pnl="footnotes"] div')].map(d => d.textContent).join(" | ");
    const clipped = [];
    s.querySelectorAll('[data-pnl="zoom-combo"] text, svg text').forEach(t => {
        const own = t.ownerSVGElement; const b = t.getBBox(); const w = parseFloat(own.getAttribute("width"));
        if (b.x < -0.5 || b.x + b.width > w + 0.5) { clipped.push(t.textContent); }
    });
    return { steps, months, mag: lab ? +lab.getAttribute("data-mag") : null, label: lab ? lab.firstChild.nodeValue : null,
        dTot: dtot ? +dtot.getAttribute("data-d") : null, badge: badge && badge.nextSibling ? badge.nextSibling.textContent : null,
        anchors, totAc: totAc ? H(totAc) : 0, totFc: totFc ? H(totFc) : 0, foot, clipped };
}
const spread = (a) => (a.length ? Math.max(...a) / Math.min(...a) : 1);

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto("file://" + path.join(__dirname, "tile.html"));
    await page.waitForTimeout(200);
    const render = async (id, set, objects, opt) => {
        await page.evaluate(([id, set, objects, opt]) => window.RENDER(id, set, Object.assign({ toolbar: { show: false } }, objects), 1050, 700, Object.assign({ noComment: true }, opt)), [id, set, objects, opt || {}]);
        await page.waitForTimeout(150);
        return page.evaluate(read, id);
    };

    // ---- flows: one Δ scale, one value scale, scaling indicator
    const a = await render("flowA", "flow", { state: ui({ view: "tree", treeZoom: "A" }) });
    const stepR = a.steps.filter(x => x.h > 2 && x.d > 0).map(x => x.h / x.d);
    check("every Δ step of a tile sits on one scale (height ∝ |Δ|)", stepR.length >= 6 && spread(stepR) < 1.02,
        "spread " + spread(stepR).toFixed(3) + " n=" + stepR.length);
    check("no minimum-height bricks: the smallest step is smaller than the biggest by the ratio of their Δ",
        Math.min(...a.steps.map(x => x.h)) < Math.max(...a.steps.map(x => x.h)) / 2, JSON.stringify(a.steps.map(x => x.h.toFixed(1))));
    const monR = a.months.filter(m => m.h > 2).map(m => m.h / m.v);
    check("anchors, monthly columns and total share one value scale", spread(monR) < 1.02, spread(monR).toFixed(3));
    check("a magnified Δ zone says so: ΔPL ×n with n > 1", a.mag > 1 && /^ΔPL ×\d+$/.test(a.label), a.label);
    check("the forecast months are hatched columns and hatched steps", a.months.filter(m => m.fc).length === 3 && a.steps.filter(x => x.fc).length === 3);

    const fcRef = await render("flowFc", "flow", { state: ui({ view: "tree", treeZoom: "A", ref: "fc" }) });
    check("all Δ zero (reference FC = AC&FC): no magnification, ×1", fcRef.mag === 1 && fcRef.label === "ΔFC", fcRef.label);

    // ---- AC 0 instead of BLANK for the unposted months
    const z = await render("flowZero", "flow", { state: ui({ view: "tree", treeZoom: "A" }) }, { acZero: "2026-09" });
    check("AC 0 in unposted months: the forecast still fills Oct–Dec", z.months.filter(m => m.fc).length === 3,
        "fc months " + z.months.filter(m => m.fc).length);
    check("AC 0 in unposted months: same total Δ as with BLANK", Math.abs(z.dTot - a.dTot) < 1e-6, z.dTot + " vs " + a.dTot);
    check("AC 0 in unposted months: same badge as with BLANK", z.badge === a.badge, z.badge + " vs " + a.badge);
    check("reader view: no author hint in the footnotes", !/BLANK/.test(z.foot), z.foot);
    const ze = await render("flowZeroEdit", "flow", { state: ui({ view: "tree", treeZoom: "A" }) }, { acZero: "2026-09", viewMode: 1 });
    check("edit mode: the author hint names the months and the fix", /Okt–Dez/.test(ze.foot) && /BLANK/.test(ze.foot), ze.foot.slice(0, 160));

    // ---- stocks: stands, not sums
    const k = await render("kasse", "bilanz", { statement: { stockMode: "allStock" }, state: ui({ view: "tree", treeZoom: "A_KASSE", ref: "py" }) });
    const kasse = await page.evaluate(() => {
        const rows = window.STOCK_DEMO.rows("bilanz").filter(r => r.account === "A_KASSE");
        const dec = rows.find(r => r.month === "2026-12"); return { fc: dec.values.fc, py: dec.values.py };
    });
    check("stock tile: the total Δ is the stand Δ at the end (FC Dec − PY Dec)", Math.abs(k.dTot - (kasse.fc - kasse.py) / 1000) < 1e-6 || Math.abs(k.dTot - (kasse.fc - kasse.py)) < 1e-6,
        k.dTot + " vs " + (kasse.fc - kasse.py));
    const kR = k.months.filter(m => m.h > 2).map(m => m.h / m.v);
    check("stock tile: monthly stands on the value scale of the total", spread(kR) < 1.02, spread(kR).toFixed(3));
    const kStep = k.steps.filter(x => x.h > 2 && x.d > 0).map(x => x.h / x.d);
    check("stock tile: Δ per month on one scale, never cumulated", spread(kStep) < 1.02, spread(kStep).toFixed(3));
    check("no clipped labels in the tiles", [a, z, k].every(x => x.clipped.length === 0), [a, z, k].map(x => x.clipped.join(",")).join(" / "));
    check("no page errors", errors.length === 0, errors.join(" | "));

    await browser.close();
    console.log(notes.join("\n"));
    if (failures.length) { console.error("\nFAIL\n  " + failures.join("\n  ")); process.exit(1); }
    console.log(`\ntile test ok (${notes.length} checks)`);
})();
