/*
 * Driver-tree interaction test (headless Chromium over test/test.html).
 *
 * Drives the controls a reader actually uses — chevrons on formula operands and
 * on hierarchy children, the "expand to level" buttons, the ⌖ re-root mark, the
 * breadcrumb, the three card modes and the status toggle — and asserts the tree
 * state after every step. It also checks the IBCS notation of the month cards:
 * offset AC/reference columns (UN 4.1 overlapped grouped columns) and the
 * scenario triangles for the second reference scenario.
 *
 * Run: node test/tree-interact.js  (npm run test:tree)
 */
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const STAGE = "p8";
const failures = [];
const notes = [];

function check(label, cond, detail) {
    if (cond) { notes.push("  ok · " + label); return; }
    failures.push(label + (detail ? " — " + detail : ""));
}

/** runs in the page: everything the assertions need about the tree on #p8 */
function readState(stageId) {
    const stage = document.getElementById(stageId);
    const svg = stage.querySelector("svg");
    const txt = (t) => (t.firstChild ? String(t.firstChild.nodeValue) : "");
    const texts = [...stage.querySelectorAll("svg text")].map(txt);
    const clipped = [];
    stage.querySelectorAll("svg text").forEach(t => {
        const own = t.ownerSVGElement;
        const b = t.getBBox();
        const w = parseFloat(own.getAttribute("width"));
        if (b.x < -0.5 || b.x + b.width > w + 0.5) { clipped.push(t.textContent); }
    });
    // card = the rounded white box; its title is the first bold text in the group
    const cardBoxes = [...stage.querySelectorAll("svg > g > g > rect[rx='4']")];
    const cards = cardBoxes.map(r => {
        const g = r.parentElement;
        // the card title is the only bold text without a text-anchor (the Δ%
        // label in the header is bold too, but anchored to the right edge)
        const title = [...g.querySelectorAll("text")].find(t => t.getAttribute("font-weight") === "600"
            && t.getAttribute("text-anchor") == null);
        return {
            name: title ? txt(title) : "",
            x: parseFloat(r.getAttribute("x")),
            y: parseFloat(r.getAttribute("y")),
            h: parseFloat(r.getAttribute("height")),
            chevron: [...g.querySelectorAll("text")].map(txt).filter(v => v === "▸" || v === "▾")[0] || "",
            reroot: [...g.querySelectorAll("title")].some(t => t.textContent.indexOf("Show as root") === 0),
        };
    });
    // operator circles live directly under the tree group, next to their glyph
    const ops = [...stage.querySelectorAll("svg > g > circle")].map(c => {
        const cx = parseFloat(c.getAttribute("cx")); const cy = parseFloat(c.getAttribute("cy"));
        const t = [...stage.querySelectorAll("svg > g > text")].find(e =>
            Math.abs(parseFloat(e.getAttribute("x")) - cx) < 0.5
            && Math.abs(parseFloat(e.getAttribute("y")) - cy) < 8);
        return { cx, cy, op: t ? txt(t) : "" };
    });
    // month columns of the first card: AC rects are solid, reference rects white
    const first = cardBoxes[0] ? cardBoxes[0].parentElement : null;
    const bars = first ? [...first.querySelectorAll("rect")]
        .filter(r => r.getAttribute("rx") == null)
        .map(r => ({
            x: parseFloat(r.getAttribute("x")), w: parseFloat(r.getAttribute("width")),
            fill: r.getAttribute("fill"), stroke: r.getAttribute("stroke"),
        })) : [];
    // value labels of the chart: centred, in the ink colour (tags are soft gray)
    const valueLabels = first ? [...first.querySelectorAll("text")]
        .filter(t => t.getAttribute("text-anchor") === "middle" && t.getAttribute("fill") === "#1A1A1A")
        .map(txt) : [];
    const tris = first ? [...first.querySelectorAll("path")].map(p => ({
        d: p.getAttribute("d"), fill: p.getAttribute("fill"),
        tip: p.querySelector("title") ? p.querySelector("title").textContent : "",
    })) : [];
    return {
        cards, ops, bars, tris, clipped, valueLabels,
        chevrons: texts.filter(t => t === "▸" || t === "▾").length,
        collapsed: texts.filter(t => t === "▸").length,
        crumbs: [...stage.querySelectorAll("span")]
            .filter(d => d.title && d.title.indexOf("Back to") === 0).length,
        svgW: svg ? parseFloat(svg.getAttribute("width")) : 0,
        svgH: svg ? parseFloat(svg.getAttribute("height")) : 0,
    };
}

/** click a card's chevron by card title */
function clickChevron(args) {
    const stageId = args[0]; const name = args[1];
    const stage = document.getElementById(stageId);
    const box = [...stage.querySelectorAll("svg > g > g > rect[rx='4']")].find(r => {
        const g = r.parentElement;
        return [...g.querySelectorAll("text")].some(t => t.getAttribute("font-weight") === "600"
            && t.getAttribute("text-anchor") == null
            && String(t.firstChild ? t.firstChild.nodeValue : "").indexOf(name) === 0);
    });
    if (!box) { return false; }
    const ch = [...box.parentElement.querySelectorAll("text")]
        .find(t => { const v = t.firstChild ? t.firstChild.nodeValue : ""; return v === "▸" || v === "▾"; });
    if (!ch) { return false; }
    ch.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
}

/** click a card's ⌖ re-root mark by card title */
function clickReroot(args) {
    const stageId = args[0]; const name = args[1];
    const stage = document.getElementById(stageId);
    const box = [...stage.querySelectorAll("svg > g > g > rect[rx='4']")].find(r => {
        const g = r.parentElement;
        return [...g.querySelectorAll("text")].some(t => t.getAttribute("font-weight") === "600"
            && t.getAttribute("text-anchor") == null
            && String(t.firstChild ? t.firstChild.nodeValue : "").indexOf(name) === 0);
    });
    if (!box) { return false; }
    const mark = [...box.parentElement.querySelectorAll("g")]
        .find(g => { const t = g.querySelector("title"); return t && t.textContent.indexOf("Show as root") === 0; });
    if (!mark) { return false; }
    mark.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
}

function clickToolbar(args) {
    const stageId = args[0]; const label = args[1];
    const b = [...document.getElementById(stageId).querySelectorAll("button")]
        .find(x => x.textContent === label);
    if (!b) { return false; }
    b.click();
    return true;
}

function clickLevel(args) {
    const stageId = args[0]; const label = args[1];
    const stage = document.getElementById(stageId);
    const head = [...stage.querySelectorAll("div")]
        .filter(d => d.textContent.trim() === "Expand to level")[0];
    if (!head) { return false; }
    const rows = head.parentElement.querySelectorAll("button");
    const b = [...rows].find(x => x.textContent === label);
    if (!b) { return false; }
    b.click();
    return true;
}

const names = (st) => st.cards.map(c => c.name);
const card = (st, n) => st.cards.find(c => c.name.indexOf(n) === 0);

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1300, height: 1000 } });
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", m => { if (m.type() === "error") { errors.push(m.text()); } });
    await page.goto("file://" + __dirname + "/test.html");
    await page.waitForTimeout(600);

    const state = async () => page.evaluate(readState, STAGE);
    const step = async (fn, arg) => {
        const ok = await page.evaluate(fn, arg);
        await page.waitForTimeout(220);
        return ok;
    };

    // ---- 1) initial: root + formula operands, Net revenue drilled open
    let st = await state();
    check("initial tree renders cards", st.cards.length >= 3, "cards=" + st.cards.length);
    check("root card present", card(st, "Net margin") != null, names(st).join(","));
    check("formula operands branch with ÷", st.ops.some(o => o.op === "÷"),
        st.ops.map(o => o.op).join(""));
    check("hierarchy children of Net revenue are cards",
        card(st, "Pharmaceuticals") != null && card(st, "Consumer Health") != null,
        names(st).join(","));
    check("hierarchy branch uses + for income rows", st.ops.filter(o => o.op === "+").length >= 2,
        st.ops.map(o => o.op).join(""));
    check("no clipped labels", st.clipped.length === 0, st.clipped.join(", "));

    // ---- 2) IBCS notation on the month cards: offset columns + triangles
    const acBars = st.bars.filter(b => b.fill !== "#FFF" && b.fill.indexOf("url(") !== 0);
    const refBars = st.bars.filter(b => b.fill === "#FFF");
    check("month card draws AC and reference columns",
        acBars.length >= 6 && refBars.length >= 6,
        "ac=" + acBars.length + " ref=" + refBars.length);
    check("reference column is offset against the AC column (UN 4.1)",
        refBars.length > 0 && acBars.length > 0 && Math.abs(refBars[0].x - acBars[0].x) > 0.5,
        "acX=" + (acBars[0] || {}).x + " refX=" + (refBars[0] || {}).x);
    check("reference column is wider than the AC column",
        refBars.length > 0 && acBars.length > 0 && refBars[0].w > acBars[0].w,
        "acW=" + (acBars[0] || {}).w + " refW=" + (refBars[0] || {}).w);
    check("reference column sits behind the AC column",
        st.bars.indexOf(refBars[0]) < st.bars.indexOf(acBars[0]));
    check("scenario triangles for the second reference (PY) exist",
        st.tris.length >= 6, "triangles=" + st.tris.length);
    check("triangle carries the PY scenario fill",
        st.tris.every(t => t.fill !== "#FFF"), st.tris.map(t => t.fill).join(","));
    check("triangle carries a PY value tooltip",
        st.tris.length > 0 && /^PY /.test(st.tris[0].tip), (st.tris[0] || {}).tip);
    check("at most three value labels per month card (IBCS label discipline)",
        st.valueLabels.length > 0 && st.valueLabels.length <= 3, st.valueLabels.join(","));

    // ---- 3) layout: parent exactly centred on its children block
    const centred = await page.evaluate((id) => {
        const stage = document.getElementById(id);
        const boxes = [...stage.querySelectorAll("svg > g > g > rect[rx='4']")]
            .map(r => ({ x: parseFloat(r.getAttribute("x")), y: parseFloat(r.getAttribute("y")),
                h: parseFloat(r.getAttribute("height")) }));
        // group by column, then check every parent column card against the block
        const cols = [...new Set(boxes.map(b => Math.round(b.x)))].sort((a, b) => a - b);
        if (cols.length < 2) { return { ok: true, delta: 0 }; }
        const root = boxes.find(b => Math.round(b.x) === cols[0]);
        const kids = boxes.filter(b => Math.round(b.x) === cols[1]);
        const mid = (Math.min(...kids.map(k => k.y)) + Math.max(...kids.map(k => k.y + k.h))) / 2;
        return { ok: Math.abs((root.y + root.h / 2) - mid) < 1.5, delta: (root.y + root.h / 2) - mid };
    }, STAGE);
    check("parent card centred on its children block", centred.ok, "delta=" + centred.delta);

    const overlap = await page.evaluate((id) => {
        const stage = document.getElementById(id);
        const boxes = [...stage.querySelectorAll("svg > g > g > rect[rx='4']")]
            .map(r => ({ x: parseFloat(r.getAttribute("x")), y: parseFloat(r.getAttribute("y")),
                w: parseFloat(r.getAttribute("width")), h: parseFloat(r.getAttribute("height")) }));
        for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
                const a = boxes[i]; const b = boxes[j];
                if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
                    return i + "/" + j;
                }
            }
        }
        return "";
    }, STAGE);
    check("no two cards overlap", overlap === "", overlap);

    // ---- 4) chevron on a hierarchy card: fold Net revenue away again
    check("chevron click on Net revenue", await step(clickChevron, [STAGE, "Net revenue"]) !== false);
    st = await state();
    check("hierarchy children folded away", card(st, "Pharmaceuticals") == null, names(st).join(","));
    check("chevron stays on the folded card",
        card(st, "Net revenue") != null && card(st, "Net revenue").chevron === "▸");

    // ---- 5) chevron on a formula card: open the Net income operands
    await step(clickChevron, [STAGE, "Net income"]);
    st = await state();
    check("formula operands opened", card(st, "EBT") != null && card(st, "Income taxes") != null,
        names(st).join(","));

    // ---- 6) toolbar depth buttons cover both kinds of branch
    await step(clickLevel, [STAGE, "All"]);
    st = await state();
    check("expand all reaches the posted accounts",
        card(st, "Materials") != null && card(st, "Production") != null
        && card(st, "Other cost of s") != null, names(st).join(","));
    check("cost children branch with −",
        st.ops.filter(o => o.op === "−").length >= 2, st.ops.map(o => o.op).join(""));
    check("expand all opens every chevron", st.collapsed === 0, "collapsed=" + st.collapsed);
    check("card budget respected", st.cards.length <= 400, "cards=" + st.cards.length);
    check("no clipped labels after expand all", st.clipped.length === 0, st.clipped.join(", "));

    await step(clickLevel, [STAGE, "2"]);
    st = await state();
    check("level 2 folds back to root + direct children", st.cards.length === 3,
        names(st).join(","));

    // ---- 7) re-root on a subtotal card with hierarchy children
    await step(clickLevel, [STAGE, "All"]);
    check("⌖ on the cost of goods sold card", await step(clickReroot, [STAGE, "Cost of goods"]) !== false);
    st = await state();
    check("re-rooted on the subtotal", st.cards.length > 0 && st.cards[0].name.indexOf("Cost of goods") === 0,
        names(st).join(","));
    check("subtotal root branches into its accounts",
        card(st, "Materials") != null, names(st).join(","));
    check("breadcrumb offers the way back", st.crumbs >= 1, "crumbs=" + st.crumbs);

    await step((id) => {
        const seg = [...document.getElementById(id).querySelectorAll("span")]
            .find(s => s.style.cursor === "pointer");
        seg.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        return true;
    }, STAGE);
    st = await state();
    check("breadcrumb returns to the home root",
        st.cards[0].name.indexOf("Net margin") === 0, names(st).join(","));

    // ---- 8) card modes and the status indicator keep working
    for (const label of ["Δ", "Bridge", "Months"]) {
        await step(clickToolbar, [STAGE, label]);
        st = await state();
        check("card mode " + label + " renders", st.cards.length >= 3 && st.clipped.length === 0,
            "cards=" + st.cards.length + " clipped=" + st.clipped.join(","));
    }
    await step(clickToolbar, [STAGE, "Status"]);
    st = await state();
    check("status off still renders", st.cards.length >= 3);
    await step(clickToolbar, [STAGE, "Status"]);

    // ---- 9) swapping the Δ reference swaps column and triangle scenarios
    await step(clickToolbar, [STAGE, "PY"]);
    st = await state();
    const grayRef = st.bars.some(b => b.fill === "#9A9A9A");
    check("Δ reference PY puts the gray PY column behind the AC column", grayRef,
        st.bars.map(b => b.fill).join(","));
    check("PL becomes the triangle scenario",
        st.tris.length > 0 && /^PL /.test(st.tris[0].tip), (st.tris[0] || {}).tip);
    await step(clickToolbar, [STAGE, "PL"]);

    await page.screenshot({ path: __dirname + "/tree-interact.png", fullPage: false });
    await browser.close();

    for (const n of notes) { console.log(n); }
    if (errors.length > 0) {
        console.error("page errors: " + errors.join(" | "));
        process.exit(1);
    }
    if (failures.length > 0) {
        console.error("\n" + failures.length + " tree interaction checks failed:");
        for (const f of failures) { console.error("  ✗ " + f); }
        process.exit(1);
    }
    console.log("\n" + notes.length + " tree interaction checks passed — see test/tree-interact.png");
})();
