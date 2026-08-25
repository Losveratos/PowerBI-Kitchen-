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
 * On top of that it verifies the tidy-tree geometry: level columns, the leaf
 * gap vs. the (larger) subtree gap, the one bus per parent that stays inside
 * the column gap, the operator circles on the parent stub (uniform branch) or
 * right before the child card (mixed branch), and the automatic compact cards
 * on deep levels.
 *
 * Run: node test/tree-interact.js  (npm run test:tree)
 */
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const STAGE = "p8";
const failures = [];
const notes = [];
/** tidy-tree gaps at font scale 1 / density normal (src/visual.ts) */
const LEAF_GAP = 10;
const SUB_GAP = 18;
const CARD_H = 104;
const CARD_H_COMPACT = 44;
const COMPACT_LEVEL = 4;

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

/**
 * runs in the page: the drawn tidy-tree geometry — cards, the parent buses with
 * their stub/elbow lines, and the operator circles with their glyph. Parent and
 * children of a bus are recovered from the line ends, so the assertions below
 * see exactly what a reader sees, not what the layout intended.
 */
function readGeom(stageId) {
    const stage = document.getElementById(stageId);
    const inner = stage.querySelector("svg > g");
    if (!inner) { return { cards: [], buses: [], links: [], ops: [] }; }
    const num = (e, a) => parseFloat(e.getAttribute(a));
    // own text only — a <title> child inside a <text> must not leak into the label
    const own = (t) => (t && t.firstChild ? String(t.firstChild.nodeValue) : "");
    const top = [...inner.children];
    const eps = 0.6;

    const cards = [...stage.querySelectorAll("svg > g > g > rect[rx='4']")].map((r, i) => {
        const g = r.parentElement;
        const title = [...g.querySelectorAll("text")].find(t => t.getAttribute("font-weight") === "600"
            && t.getAttribute("text-anchor") == null);
        const boxTip = r.querySelector("title");
        return {
            i, name: own(title),
            x: num(r, "x"), y: num(r, "y"), w: num(r, "width"), h: num(r, "height"),
            chevron: [...g.querySelectorAll("text")]
                .map(own).filter(v => v === "▸" || v === "▾")[0] || "",
            reroot: [...g.querySelectorAll("title")].some(t => t.textContent.indexOf("Show as root") === 0),
            edges: [...g.querySelectorAll("rect")].filter(x => x.getAttribute("rx") === "1.5").length,
            tip: boxTip ? boxTip.textContent : "",
        };
    });

    const lines = top.filter(e => e.tagName === "line")
        .map(l => ({ x1: num(l, "x1"), y1: num(l, "y1"), x2: num(l, "x2"), y2: num(l, "y2") }));
    const glyphs = top.filter(e => e.tagName === "text")
        .map(t => ({ x: num(t, "x"), y: num(t, "y"), v: own(t) }));
    const ops = top.filter(e => e.tagName === "circle").map(c => {
        const cx = num(c, "cx"); const cy = num(c, "cy");
        const gl = glyphs.find(t => Math.abs(t.x - cx) < eps && Math.abs(t.y - cy) < 8);
        return { cx, cy, r: num(c, "r"), op: gl ? gl.v : "" };
    });

    // a bus may be degenerate (one child on the parent's own centre line), so the
    // horizontal set explicitly excludes zero-width lines
    const vert = lines.filter(l => Math.abs(l.x1 - l.x2) < eps);
    const horiz = lines.filter(l => Math.abs(l.y1 - l.y2) < eps && Math.abs(l.x1 - l.x2) > eps);
    const buses = vert.map(l => ({ x: l.x1, y1: Math.min(l.y1, l.y2), y2: Math.max(l.y1, l.y2) }));
    const links = buses.map(b => {
        // every parent of one level puts its bus on the same x, so a bus owns
        // only the lines inside its own vertical span
        const mine = horiz.filter(h => h.y1 >= b.y1 - eps && h.y1 <= b.y2 + eps);
        // stub: the one horizontal line that *ends* on the bus (comes from the parent)
        const stub = mine.find(h => Math.abs(Math.max(h.x1, h.x2) - b.x) < eps);
        const parent = stub ? cards.find(c => Math.abs(c.x + c.w - Math.min(stub.x1, stub.x2)) < eps
            && Math.abs(c.y + c.h / 2 - stub.y1) < eps) : null;
        // elbows: horizontal lines that *start* on the bus and end on a card edge
        const kids = mine.filter(h => Math.abs(Math.min(h.x1, h.x2) - b.x) < eps)
            .map(h => cards.find(c => Math.abs(c.x - Math.max(h.x1, h.x2)) < eps
                && Math.abs(c.y + c.h / 2 - h.y1) < eps))
            .filter(c => c != null);
        return {
            busX: b.x, y1: b.y1, y2: b.y2,
            parent: parent ? parent.i : -1,
            parentRight: parent ? parent.x + parent.w : null,
            kids: kids.map(c => c.i),
            stubOps: parent == null ? [] : ops.filter(o => o.cx > parent.x + parent.w
                && o.cx < b.x - eps && Math.abs(o.cy - (parent.y + parent.h / 2)) < eps)
                .map(o => o.op),
            edgeOps: kids.map(c => {
                const o = ops.find(z => z.cx > b.x + eps && z.cx < c.x
                    && Math.abs(z.cy - (c.y + c.h / 2)) < eps);
                return o ? o.op : "";
            }),
        };
    });
    return { cards, buses, links, ops };
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
const colsOf = (geom) => [...new Set(geom.cards.map(c => Math.round(c.x)))].sort((a, b) => a - b);

/** the tidy-tree invariants that must hold in every state of the tree */
function tidyChecks(geom, tag) {
    const parentOf = new Map();
    for (const l of geom.links) { for (const k of l.kids) { parentOf.set(k, l.parent); } }
    const nameOf = (i) => (geom.cards[i] ? geom.cards[i].name : "?");

    // level columns: one x slot per level, evenly spaced (card width + gap)
    const cols = colsOf(geom);
    const pitch = cols.length > 1 ? cols[1] - cols[0] : 0;
    check(tag + "cards sit on evenly spaced level columns",
        cols.every((x, i) => Math.abs(x - cols[0] - i * pitch) < 1.5), cols.join(","));

    // one bus per branching parent, and it runs in the gap between two columns
    check(tag + "exactly one bus per branching parent",
        geom.links.every(l => l.parent >= 0 && l.kids.length > 0)
        && new Set(geom.links.map(l => l.parent)).size === geom.links.length,
        "buses=" + geom.links.length + " parents="
        + new Set(geom.links.map(l => l.parent)).size);
    check(tag + "the parent bus stays in the column gap and crosses no card",
        geom.buses.every(b => geom.cards.every(c => b.x < c.x - 0.5 || b.x > c.x + c.w + 0.5)),
        geom.buses.map(b => b.x.toFixed(0)).join(","));

    // operator circles never sit between two siblings on the bus any more
    check(tag + "no operator circle sits on the sibling bus",
        geom.ops.every(o => geom.buses.every(b => Math.abs(o.cx - b.x) > o.r)),
        geom.ops.map(o => o.op + "@" + o.cx.toFixed(0)).join(","));

    // uniform branch → one circle on the parent stub, no edge circles;
    // mixed branch → one circle per child edge, nothing on the stub
    const badOps = [];
    for (const l of geom.links) {
        const stub = l.stubOps.length;
        const edge = l.edgeOps.filter(o => o !== "").length;
        const uniform = l.edgeOps.every(o => o === l.edgeOps[0]);
        if (stub === 1 && edge === 0) { continue; }
        if (stub === 0 && edge === l.kids.length && !uniform) { continue; }
        badOps.push(nameOf(l.parent) + " stub=" + stub + " edge=" + l.edgeOps.join(""));
    }
    check(tag + "one operator on the stub for a uniform branch, one per edge for a mixed one",
        badOps.length === 0, badOps.join(" | "));

    // vertical air: siblings keep the leaf gap, cards of different parents the
    // (larger) subtree gap — two limbs may never butt against each other
    const byCol = new Map();
    for (const c of geom.cards) {
        const k = Math.round(c.x);
        if (!byCol.has(k)) { byCol.set(k, []); }
        byCol.get(k).push(c);
    }
    const tight = [];
    for (const list of byCol.values()) {
        list.sort((a, b) => a.y - b.y);
        for (let i = 1; i < list.length; i++) {
            const gap = list[i].y - (list[i - 1].y + list[i - 1].h);
            const same = parentOf.get(list[i].i) === parentOf.get(list[i - 1].i);
            const need = same ? LEAF_GAP : SUB_GAP;
            if (gap < need - 0.5) {
                tight.push(list[i - 1].name + "/" + list[i].name + " gap=" + gap.toFixed(1)
                    + " need=" + need);
            }
        }
    }
    check(tag + "leaf gap between siblings, subtree gap between limbs of different parents",
        tight.length === 0, tight.slice(0, 3).join(" | "));

    // no card overlaps another, in any direction
    let hit = "";
    for (let i = 0; i < geom.cards.length && hit === ""; i++) {
        for (let j = i + 1; j < geom.cards.length; j++) {
            const a = geom.cards[i]; const b = geom.cards[j];
            if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
                hit = a.name + "/" + b.name; break;
            }
        }
    }
    check(tag + "no two cards overlap", hit === "", hit);

    // post-order centring: every parent exactly on the middle of its own block
    const off = [];
    for (const l of geom.links) {
        const kids = l.kids.map(i => geom.cards[i]);
        const p = geom.cards[l.parent];
        if (!p || kids.length === 0) { continue; }
        const mid = (Math.min(...kids.map(k => k.y)) + Math.max(...kids.map(k => k.y + k.h))) / 2;
        if (Math.abs(p.y + p.h / 2 - mid) > 1.5) { off.push(p.name); }
    }
    check(tag + "every parent sits on the vertical centre of its children",
        off.length === 0, off.join(","));
}

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
    check("uniform hierarchy branch carries exactly one + circle",
        st.ops.filter(o => o.op === "+").length === 1, st.ops.map(o => o.op).join(""));
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

    // ---- 3b) tidy-tree geometry: columns, gaps, one bus per parent, operators
    let geom = await page.evaluate(readGeom, STAGE);
    tidyChecks(geom, "");
    check("three levels are open at once and fan out as a tree",
        colsOf(geom).length === 3, colsOf(geom).join(","));
    check("the ÷ of the root ratio sits on the parent stub (DuPont)",
        geom.links.some(l => l.stubOps.length === 1 && l.stubOps[0] === "÷"),
        geom.links.map(l => l.stubOps.join("")).join("|"));
    check("full cards on the shallow levels",
        geom.cards.every(c => Math.abs(c.h - CARD_H) < 1.5),
        [...new Set(geom.cards.map(c => c.h))].join(","));

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

    // ---- 6b) the deep tree: tidy invariants, mixed branches, compact cards
    geom = await page.evaluate(readGeom, STAGE);
    tidyChecks(geom, "expand all: ");
    const cols = colsOf(geom);
    check("expand all fans out over many levels", cols.length >= 6, "levels=" + cols.length);
    const mixed = geom.links.filter(l => l.stubOps.length === 0);
    check("mixed branches label every child edge instead of the stub",
        mixed.length >= 1 && mixed.every(l => l.edgeOps.every(o => "+−×÷".indexOf(o) >= 0)),
        "mixed=" + mixed.length + " ops=" + mixed.map(l => l.edgeOps.join("")).join("|"));
    check("a mixed branch really carries different operators",
        mixed.some(l => new Set(l.edgeOps).size > 1),
        mixed.map(l => l.edgeOps.join("")).join("|"));
    const deep = geom.cards.filter(c => cols.indexOf(Math.round(c.x)) >= COMPACT_LEVEL);
    check("levels " + COMPACT_LEVEL + "+ switch to the compact card automatically",
        deep.length > 0 && deep.every(c => Math.abs(c.h - CARD_H_COMPACT) < 1.5),
        "deep=" + deep.length + " h=" + [...new Set(deep.map(c => c.h))].join(","));
    check("shallow levels keep the full card",
        geom.cards.filter(c => cols.indexOf(Math.round(c.x)) < COMPACT_LEVEL)
            .every(c => Math.abs(c.h - CARD_H) < 1.5),
        [...new Set(geom.cards.map(c => c.h))].join(","));
    check("compact cards keep chevron, ⌖ and the status edge",
        deep.some(c => c.chevron !== "") && deep.some(c => c.reroot) && deep.some(c => c.edges > 0),
        "chev=" + deep.filter(c => c.chevron !== "").length
        + " reroot=" + deep.filter(c => c.reroot).length
        + " edge=" + deep.filter(c => c.edges > 0).length);
    check("compact cards name the monthly values in a tooltip",
        deep.every(c => c.tip !== "") && deep.some(c => /Jan|Jun/.test(c.tip)),
        (deep.find(c => c.tip === "") || {}).name || (deep[0] || {}).tip);

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

    // ---- 10) a fully expanded tree on a small stage falls back to compact cards
    const tiny = await page.evaluate(() => {
        const d = document.createElement("div");
        d.className = "stage"; d.id = "tiny";
        d.style.cssText = "width:1200px;height:200px;overflow:hidden;";
        document.body.appendChild(d);
        run("tiny", {
            titleBlock: { measureLine: "compact fallback" },
            toolbar: { show: false, showLegend: false },
            state: { uiState: JSON.stringify({ view: "tree", treeV: 2, treeCollapsed: [] }) },
        });
        const hs = [...document.querySelectorAll("#tiny svg > g > g > rect[rx='4']")]
            .map(r => Math.round(parseFloat(r.getAttribute("height"))));
        return { heights: [...new Set(hs)], cards: hs.length };
    });
    check("a layout far taller than the stage switches every card to compact",
        tiny.cards > 10 && tiny.heights.length === 1 && tiny.heights[0] === CARD_H_COMPACT,
        "cards=" + tiny.cards + " h=" + tiny.heights.join(","));

    // ---- 11) v0.9.1: untouched default = whole tree; author start depth folds;
    // one expand click opens the entire limb, not just the next level
    const whole = await page.evaluate(() => {
        const mk = (id) => {
            const d = document.createElement("div");
            d.className = "stage"; d.id = id;
            d.style.cssText = "width:1400px;height:900px;";
            document.body.appendChild(d);
            return d;
        };
        const cols = (el) => new Set([...el.querySelectorAll("svg rect[rx='4']")]
            .map(r => Math.round(parseFloat(r.getAttribute("x"))))).size;
        const cards = (el) => el.querySelectorAll("svg rect[rx='4']").length;

        const a = mk("whole-a");
        run("whole-a", { toolbar: { show: false, showLegend: false },
            state: { uiState: JSON.stringify({ view: "tree" }) } });
        const b = mk("whole-b");
        run("whole-b", { toolbar: { show: false, showLegend: false },
            columns: { treeLevel: 2 },
            state: { uiState: JSON.stringify({ view: "tree" }) } });
        const before = { cols: cols(b), cards: cards(b) };
        const findChev = () => [...b.querySelectorAll("svg text")]
            .find(t => t.textContent.startsWith("▸"));
        // plain click: exactly one more level, the revealed children stay folded
        const chev = findChev();
        if (chev) { chev.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
        const oneLevel = { cols: cols(b), cards: cards(b) };
        // shift click on a revealed folded child: its whole limb fans out
        const chev2 = findChev();
        if (chev2) {
            chev2.dispatchEvent(new MouseEvent("click", { bubbles: true, shiftKey: true }));
        }
        // a state persisted by a pre-v0.9.1 version (no treeV): its re-root and
        // fold list must be dropped on load — whole tree from the true root
        const c = mk("whole-c");
        run("whole-c", { toolbar: { show: false, showLegend: false },
            state: { uiState: JSON.stringify({
                view: "tree", treeRoot: "F_GROSSPROFIT",
                treeCollapsed: ["F_NETINCOME", "F_EBIT", "L:Net revenue"],
            }) } });
        return {
            defCols: cols(a), defCards: cards(a),
            lvl2: before, chev: !!chev, chev2: !!chev2, oneLevel,
            after: { cols: cols(b), cards: cards(b) },
            migrated: { cols: cols(c), cards: cards(c) },
        };
    });
    check("untouched default opens the whole tree", whole.defCols > 2 && whole.defCards > 20,
        "cols=" + whole.defCols + " cards=" + whole.defCards);
    check("author start depth 2 folds to two columns", whole.lvl2.cols === 2,
        "cols=" + whole.lvl2.cols);
    check("a plain expand click opens exactly one more level",
        whole.chev && whole.oneLevel.cols === 3 && whole.oneLevel.cards > whole.lvl2.cards,
        JSON.stringify(whole.oneLevel));
    check("a shift expand click opens the whole limb",
        whole.chev2 && whole.after.cols > whole.oneLevel.cols
        && whole.after.cards > whole.oneLevel.cards,
        JSON.stringify(whole.after));
    check("pre-v0.9.1 persisted tree state is dropped on load (whole tree again)",
        whole.migrated.cols === whole.defCols && whole.migrated.cards === whole.defCards,
        JSON.stringify(whole.migrated) + " vs default " + whole.defCols + "/" + whole.defCards);

    // ---- 12) hover zoom: dwelling on a card opens the IBCS detail panel
    await page.evaluate((stageId) => {
        const stage = document.getElementById(stageId);
        const g = [...stage.querySelectorAll("svg > g > g")].find(x => x.querySelector("rect[rx='4']"));
        g.dispatchEvent(new MouseEvent("mouseenter"));
    }, STAGE);
    await page.waitForTimeout(500);
    const zoom = await page.evaluate((stageId) => {
        const stage = document.getElementById(stageId);
        const panel = [...stage.querySelectorAll("div")].find(d => d.style.zIndex === "40");
        if (!panel) { return null; }
        return {
            svgs: panel.querySelectorAll("svg").length,
            gridRows: [...panel.querySelectorAll("div")]
                .filter(d => d.style.display === "table-row").length,
            w: panel.offsetWidth,
            text: panel.textContent.slice(0, 60),
        };
    }, STAGE);
    check("hover zoom opens with the three IBCS charts", !!zoom && zoom.svgs === 3,
        JSON.stringify(zoom));
    check("hover zoom shows the scenario grid (AC + references)",
        !!zoom && zoom.gridRows >= 3, zoom ? String(zoom.gridRows) : "no panel");
    await page.evaluate((stageId) => {
        const stage = document.getElementById(stageId);
        const g = [...stage.querySelectorAll("svg > g > g")].find(x => x.querySelector("rect[rx='4']"));
        g.dispatchEvent(new MouseEvent("mouseleave"));
    }, STAGE);
    const zoomGone = await page.evaluate((stageId) => {
        const stage = document.getElementById(stageId);
        return ![...stage.querySelectorAll("div")].some(d => d.style.zIndex === "40");
    }, STAGE);
    check("hover zoom closes again on mouseleave", zoomGone);

    // ---- 13) v0.11: clicking a card's chart face opens the tile view, the
    // neighbour cards navigate the graph and the back button restores the tree
    const zoomStage = await page.evaluate(() => {
        const d = document.createElement("div");
        d.className = "stage"; d.id = "tile"; d.style.cssText = "width:1340px;height:1150px;";
        document.body.appendChild(d);
        run("tile", { titleBlock: { measureLine: "tile view" },
            state: { uiState: JSON.stringify({ view: "tree", treeV: 2 }) } });
        const face = [...d.querySelectorAll("svg rect")].find(r => {
            const t = r.querySelector("title");
            return t && t.textContent.indexOf("Open the tile view") === 0;
        });
        if (!face) { return { face: false }; }
        face.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        return { face: true };
    });
    check("every tree card offers a chart-face click target", zoomStage.face);
    await page.waitForTimeout(260);

    const readTile = (id) => {
        const stage = document.getElementById(id);
        const zoom = stage.querySelector('[data-pnl="zoom"]');
        if (!zoom) { return null; }
        const title = zoom.querySelector('[data-pnl="zoom-title"]');
        const clipped = [];
        zoom.querySelectorAll("svg text").forEach(t => {
            const own = t.ownerSVGElement;
            const b = t.getBBox();
            const w = parseFloat(own.getAttribute("width"));
            if (b.x < -0.5 || b.x + b.width > w + 0.5) { clipped.push(t.textContent); }
        });
        return {
            title: title ? title.textContent : "",
            back: !!zoom.querySelector('[data-pnl="zoom-back"]'),
            crumbs: [...zoom.querySelectorAll("span")]
                .filter(s => s.style.cursor === "pointer").length,
            parents: zoom.querySelectorAll('[data-pnl="zoom-parent"]').length,
            children: zoom.querySelectorAll('[data-pnl="zoom-child"]').length,
            centerCharts: zoom.querySelectorAll('[data-pnl="zoom-center"] svg').length,
            // v0.12: one integrated chart instead of the two stacked ones
            combo: zoom.querySelectorAll('[data-pnl="zoom-combo"]').length,
            months: zoom.querySelectorAll('[data-pnl="zoom-months"]').length,
            anchors: [...zoom.querySelectorAll('[data-pnl="combo-anchor"]')]
                .map(r => r.getAttribute("data-scen")),
            steps: zoom.querySelectorAll('[data-pnl="combo-step"]').length,
            fcSteps: zoom.querySelectorAll('[data-pnl="combo-step"][data-fc="1"]').length,
            monthCols: zoom.querySelectorAll('[data-pnl="combo-month"]').length,
            fcMonths: zoom.querySelectorAll('[data-pnl="combo-month"][data-fc="1"]').length,
            // v0.13: the reference column that sits behind each monthly column
            monthRefs: [...zoom.querySelectorAll('[data-pnl="combo-month-ref"]')].map(r => ({
                x: parseFloat(r.getAttribute("x")), w: parseFloat(r.getAttribute("width")),
                empty: r.getAttribute("data-empty") === "1",
            })),
            acCols: [...zoom.querySelectorAll('[data-pnl="combo-month"]')].map(r => ({
                x: parseFloat(r.getAttribute("x")), w: parseFloat(r.getAttribute("width")),
            })),
            pins: zoom.querySelectorAll('[data-pnl="combo-pin"]').length,
            fcLine: zoom.querySelectorAll('[data-pnl="combo-fcline"]').length,
            totalAc: zoom.querySelectorAll('[data-pnl="combo-total-ac"]').length,
            totalFc: zoom.querySelectorAll('[data-pnl="combo-total-fc"]').length,
            badge: zoom.querySelectorAll('[data-pnl="combo-badge"]').length,
            note: zoom.querySelectorAll('[data-pnl="zoom-note"]').length,
            texts: [...zoom.querySelectorAll('[data-pnl="zoom-center"] svg text')]
                .map(t => t.textContent),
            gridRows: [...zoom.querySelectorAll('[data-pnl="zoom-center"] div')]
                .filter(x => x.style.display === "table-row").length,
            clipped,
        };
    };
    let tile = await page.evaluate(readTile, "tile");
    check("the chart click opens the tile view", tile != null && tile.back,
        JSON.stringify(tile));
    check("the tile view names the node and draws exactly one integrated chart",
        !!tile && tile.title.length > 0 && tile.centerCharts === 1,
        tile ? tile.title + " charts=" + tile.centerCharts : "no tile");
    check("the tile view carries the scenario grid", !!tile && tile.gridRows >= 3,
        tile ? String(tile.gridRows) : "no tile");
    check("the tile view offers driver cards to walk down",
        !!tile && tile.children >= 1, tile ? "children=" + tile.children : "no tile");
    // the default root of the demo is the Net margin ratio — not additive, so
    // it keeps the monthly chart and says why the bridge is missing
    check("a ratio row keeps the monthly chart instead of the bridge",
        !!tile && tile.months === 1 && tile.combo === 0,
        tile ? "months=" + tile.months + " combo=" + tile.combo : "no tile");
    check("a ratio row explains the missing bridge in a note",
        !!tile && tile.note === 1, tile ? "notes=" + tile.note : "no tile");
    check("a ratio row draws neither bridge steps nor an AC+FC stack",
        !!tile && tile.steps === 0 && tile.totalFc === 0,
        tile ? "steps=" + tile.steps : "no tile");
    check("no clipped labels in the tile view", !!tile && tile.clipped.length === 0,
        tile ? tile.clipped.join(", ") : "no tile");

    const rootTitle = tile ? tile.title : "";
    await step((id) => {
        const kid = document.getElementById(id).querySelector('[data-pnl="zoom-child"]');
        kid.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        return true;
    }, "tile");
    tile = await page.evaluate(readTile, "tile");
    check("clicking a driver card navigates the tile view down",
        !!tile && tile.title !== "" && tile.title !== rootTitle,
        (tile ? tile.title : "no tile") + " was " + rootTitle);
    check("the node below the root knows what it feeds into",
        !!tile && tile.parents >= 1, tile ? "parents=" + tile.parents : "no tile");
    check("the tile view breadcrumb offers the way back up",
        !!tile && tile.crumbs >= 1, tile ? "crumbs=" + tile.crumbs : "no tile");

    await step((id) => {
        document.getElementById(id).querySelector('[data-pnl="zoom-back"]').click();
        return true;
    }, "tile");
    const backToTree = await page.evaluate((id) => {
        const stage = document.getElementById(id);
        return {
            zoom: stage.querySelectorAll('[data-pnl="zoom"]').length,
            cards: stage.querySelectorAll("svg rect[rx='4']").length,
        };
    }, "tile");
    check("back to the tree restores the card tree",
        backToTree.zoom === 0 && backToTree.cards >= 3, JSON.stringify(backToTree));

    // a persisted tile view on a row the model does not know falls back silently
    const stale = await page.evaluate(() => {
        const d = document.createElement("div");
        d.className = "stage"; d.id = "tile-stale"; d.style.cssText = "width:1340px;height:900px;";
        document.body.appendChild(d);
        run("tile-stale", { toolbar: { show: false, showLegend: false },
            state: { uiState: JSON.stringify({ view: "tree", treeV: 2, treeZoom: "NO_SUCH_ROW" }) } });
        return { zoom: d.querySelectorAll('[data-pnl="zoom"]').length,
            cards: d.querySelectorAll("svg rect[rx='4']").length };
    });
    check("an unknown persisted tile target falls back to the tree",
        stale.zoom === 0 && stale.cards >= 3, JSON.stringify(stale));

    // ---- 14) v0.11: the Fit option squeezes the table into the stage width
    const fitRes = await page.evaluate(() => {
        const W = 1500;
        const mk = (id, fit) => {
            const d = document.createElement("div");
            d.className = "stage"; d.id = id; d.style.cssText = `width:${W}px;height:700px;`;
            document.body.appendChild(d);
            run(id, { titleBlock: { measureLine: "fit" },
                state: { uiState: JSON.stringify({ view: "table", fit,
                    preset: "full", blocks: { mtd: true, ytd: true, fy: true } }) } });
            const t = [...d.querySelectorAll("div")].find(x => x.style.display === "table");
            const clipped = [];
            d.querySelectorAll("svg text").forEach(e => {
                const own = e.ownerSVGElement;
                const b = e.getBBox();
                const w = parseFloat(own.getAttribute("width"));
                if (b.x < -0.5 || b.x + b.width > w + 0.5) { clipped.push(e.textContent); }
            });
            return { w: t ? t.getBoundingClientRect().width : -1, clipped, stage: W,
                fitBtn: [...d.querySelectorAll("button")].some(b => b.textContent === "Fit") };
        };
        return { off: mk("fit-off", false), on: mk("fit-on", true) };
    });
    check("the Fit button sits in the toolbar options", fitRes.off.fitBtn);
    check("without Fit the three-block table overflows the stage",
        fitRes.off.w > fitRes.off.stage,
        "table=" + Math.round(fitRes.off.w) + " stage=" + fitRes.off.stage);
    check("Fit squeezes the same table inside the stage width",
        fitRes.on.w <= fitRes.on.stage - 2 * 14 + 1,
        "table=" + Math.round(fitRes.on.w) + " stage=" + fitRes.on.stage);
    check("Fit clips no number", fitRes.on.clipped.length === 0, fitRes.on.clipped.join(", "));

    // ---- 15) v0.11: the AC vs PY·PL·FC preset shows all three references
    const presetRes = await page.evaluate(() => {
        // the shared demo data view carries no monthly FC — build one that does,
        // so the preset can be checked against all three references at once
        const rows = PNL_DEMO.levelRows;
        const col = (role, name, vals) => ({
            source: { roles: { [role]: true }, displayName: name, index: 0 }, values: vals });
        const L = (i) => rows.map(r => r.levels[i] ?? null);
        const dataView = {
            categorical: {
                categories: [
                    col("levels", "L1", L(0)), col("levels", "L2", L(1)), col("levels", "L3", L(2)),
                    col("account", "AccountID", rows.map(r => r.account)),
                    col("sortOrder", "Sort", rows.map(r => r.sort)),
                    col("rowType", "RowType", rows.map(r => r.rowType)),
                    col("formulaDef", "Formula", rows.map(r => r.formulaDef)),
                    col("signConvention", "Sign", rows.map(r => r.sign)),
                    col("displayInvert", "DispInv", rows.map(r => r.displayInvert)),
                    col("varianceInvert", "VarInv", rows.map(r => r.varianceInvert)),
                    col("period", "Monat", rows.map(r => r.month)),
                ],
                values: [
                    col("ac", "AC", rows.map(r => r.values.ac ?? null)),
                    col("py", "PY", rows.map(r => r.values.py ?? null)),
                    col("pl", "PL", rows.map(r => r.values.pl ?? null)),
                    col("fc", "FC", rows.map(r => r.values.pl == null ? null
                        : Math.round(r.values.pl * 101) / 100)),
                ],
            },
            metadata: { objects: { state: { uiState: JSON.stringify({
                view: "table", preset: "dall", fit: false }) } } },
        };
        const d = document.createElement("div");
        d.className = "stage"; d.id = "dall"; d.style.cssText = "width:1500px;height:700px;";
        document.body.appendChild(d);
        const v = new PnlByDatenWG.Visual({ element: d, host: makeHost("en-US") });
        v.update({ dataViews: [dataView], viewport: { width: 1500, height: 700 }, type: 2 });
        const heads = [...d.querySelectorAll("div")]
            .filter(x => x.style.display === "table-cell").map(x => x.textContent);
        // Δ axes: gray = PY, double line = PL, dashed = FC (IBCS UN 4.1)
        const axes = [...d.querySelectorAll("svg line")].map(l => ({
            stroke: l.getAttribute("stroke"), dash: l.getAttribute("stroke-dasharray") }));
        return {
            heads: [...new Set(heads)].filter(t => t.indexOf("Δ") === 0),
            presetBtn: [...d.querySelectorAll("button")].some(b => b.textContent === "AC vs PY·PL·FC"),
            gray: axes.some(a => a.stroke === "#B3B3B3"),
            dashed: axes.some(a => a.dash === "3,2"),
        };
    });
    for (const label of ["ΔPY", "ΔPY%", "ΔPL", "ΔPL%", "ΔFC", "ΔFC%"]) {
        check("preset AC vs PY·PL·FC shows the " + label + " column",
            presetRes.heads.indexOf(label) >= 0, presetRes.heads.join(","));
    }
    check("the AC vs PY·PL·FC preset button sits in the toolbar", presetRes.presetBtn);
    check("the Δ axes keep encoding their reference (gray PY, dashed FC)",
        presetRes.gray && presetRes.dashed,
        "gray=" + presetRes.gray + " dashed=" + presetRes.dashed);

    // ---- 16) v0.11: header font size and colour of the table headers
    const headRes = await page.evaluate(() => {
        const mk = (id, style) => {
            const d = document.createElement("div");
            d.className = "stage"; d.id = id; d.style.cssText = "width:1300px;height:600px;";
            document.body.appendChild(d);
            run(id, { titleBlock: { measureLine: "header" }, style,
                state: { uiState: JSON.stringify({ view: "table" }) } });
            // the block title row and the column label row, in that order
            const cells = [...d.querySelectorAll("div")]
                .filter(x => x.style.display === "table-cell" && x.textContent !== "");
            const block = cells.find(x => x.textContent.indexOf("year to date") >= 0);
            const label = cells.find(x => x.textContent === "% Rev");
            return {
                blockFs: block ? block.style.fontSize : "",
                labelFs: label ? label.style.fontSize : "",
                color: label ? label.style.color : "",
            };
        };
        return { auto: mk("hd-auto", {}), big: mk("hd-big", { headerFontSize: 18,
            headerColor: { solid: { color: "#0064FF" } } }) };
    });
    check("automatic header sizing keeps the built-in 9 / 9.5 px",
        headRes.auto.blockFs === "9px" && headRes.auto.labelFs === "9.5px",
        JSON.stringify(headRes.auto));
    check("automatic header colour keeps the built-in soft gray",
        headRes.auto.color === "rgb(138, 136, 134)", headRes.auto.color);
    check("a header font size scales both header rows",
        parseFloat(headRes.big.blockFs) === 18 && parseFloat(headRes.big.labelFs) === 19,
        JSON.stringify(headRes.big));
    check("a header colour override reaches the column labels",
        headRes.big.color === "rgb(0, 100, 255)", headRes.big.color);


    // ---- 17) v0.12: the integrated ChartKitchen chart in the tile view —
    // anchors, monthly columns, cumulated bridge, Δ% pins, AC+FC total, badge
    await page.evaluate(() => {
        const d = document.createElement("div");
        d.className = "stage"; d.id = "combo"; d.style.cssText = "width:1420px;height:1250px;";
        document.body.appendChild(d);
        run("combo", { titleBlock: { measureLine: "combo" },
            state: { uiState: JSON.stringify({ view: "tree", treeV: 2, ref: "pl",
                treeZoom: "F_EBITDA" }) } });
    });
    await page.waitForTimeout(260);
    const combo = await page.evaluate(readTile, "combo");
    const MONTHS = 6; // the pharma demo runs 2026-01..2026-06
    check("a value row draws the integrated chart, not the monthly one",
        !!combo && combo.combo === 1 && combo.months === 0,
        combo ? "combo=" + combo.combo + " months=" + combo.months : "no tile");
    check("the integrated chart anchors PY and PL on the left",
        !!combo && combo.anchors.length === 2
        && combo.anchors.indexOf("py") >= 0 && combo.anchors.indexOf("pl") >= 0,
        combo ? combo.anchors.join(",") : "no tile");
    check("the bridge draws exactly one step per month",
        !!combo && combo.steps === MONTHS,
        combo ? "steps=" + combo.steps + " months=" + MONTHS : "no tile");
    check("one monthly column per month sits under the bridge",
        !!combo && combo.monthCols === MONTHS,
        combo ? "cols=" + combo.monthCols : "no tile");
    check("the Δ% pin row carries a pin per month plus the total",
        !!combo && combo.pins === MONTHS + 1,
        combo ? "pins=" + combo.pins : "no tile");
    check("the chart names the reference in its caption line",
        !!combo && combo.texts.some(t => t.indexOf("PL →") === 0),
        combo ? combo.texts.slice(0, 2).join(" | ") : "no tile");
    check("the Δ% zone is labelled with the reference",
        !!combo && combo.texts.indexOf("ΔPL%") >= 0,
        combo ? combo.texts.slice(0, 4).join(" | ") : "no tile");
    check("the total column and the variance badge close the chart on the right",
        !!combo && combo.totalAc === 1 && combo.badge === 1,
        combo ? "ac=" + combo.totalAc + " badge=" + combo.badge : "no tile");
    check("a series without forecast months draws no FC divider and no FC stack",
        !!combo && combo.fcLine === 0 && combo.totalFc === 0 && combo.fcMonths === 0,
        combo ? "line=" + combo.fcLine + " stack=" + combo.totalFc : "no tile");
    check("no clipped labels in the integrated chart",
        !!combo && combo.clipped.length === 0, combo ? combo.clipped.join(", ") : "no tile");

    // ---- 18) v0.12: the toolbar collapses to what still works in the tile view
    const zoomBar = await page.evaluate((id) => {
        const d = document.getElementById(id);
        const labels = [...d.querySelectorAll("div")]
            .filter(x => x.style.textTransform === "uppercase" && x.style.letterSpacing !== "")
            .map(x => x.textContent);
        const back = d.querySelector('[data-pnl="zoom-back"]');
        return {
            groups: labels,
            buttons: [...d.querySelectorAll("button")].map(b => b.textContent),
            back: back ? { fs: back.style.fontSize, bg: back.style.background,
                color: back.style.color } : null,
        };
    }, "combo");
    // the group labels are typeset in caps by css — the text stays as written
    for (const gone of ["View", "Column preset", "Periods", "Density", "Cards",
        "Expand to level", "Options"]) {
        check("the tile view hides the toolbar group " + gone,
            zoomBar.groups.indexOf(gone) < 0, zoomBar.groups.join(" | "));
    }
    check("the tile view keeps the Δ reference group",
        zoomBar.groups.indexOf("Δ reference") >= 0, zoomBar.groups.join(" | "));
    check("the tile view keeps the unit group", zoomBar.groups.indexOf("Unit") >= 0,
        zoomBar.groups.join(" | "));
    check("the neighbour columns use the very same caps label style",
        zoomBar.groups.indexOf("Feeds into") >= 0 && zoomBar.groups.indexOf("Driven by") >= 0,
        zoomBar.groups.join(" | "));
    check("no view button survives in the tile view",
        ["Table", "Bars", "Waterfall", "Tree"].every(t => zoomBar.buttons.indexOf(t) < 0),
        zoomBar.buttons.join(","));
    check("the back button is the dominant control of the tile header",
        zoomBar.back != null && parseFloat(zoomBar.back.fs) >= 13
        && zoomBar.back.color === "rgb(255, 255, 255)",
        JSON.stringify(zoomBar.back));

    // ---- 19) v0.12: the accent colour of the interactive chrome
    const accent = await page.evaluate(() => {
        const mk = (id, style) => {
            const d = document.createElement("div");
            d.className = "stage"; d.id = id; d.style.cssText = "width:1300px;height:600px;";
            document.body.appendChild(d);
            run(id, { titleBlock: { measureLine: "accent" }, style,
                state: { uiState: JSON.stringify({ view: "tree", treeV: 2 }) } });
            const active = [...d.querySelectorAll("button")].find(b => b.textContent === "Tree");
            // the AC column fill must never follow the accent (IBCS)
            const acFill = [...d.querySelectorAll("svg rect")]
                .filter(r => r.getAttribute("fill") === "#404040").length;
            return { bg: active ? active.style.backgroundColor : "",
                color: active ? active.style.color : "", radius: active ? active.style.borderRadius : "",
                acFill };
        };
        return { def: mk("acc-def", {}),
            set: mk("acc-set", { accentColor: { solid: { color: "#C25A2D" } } }) };
    });
    check("the default accent keeps the previous ink on the active button",
        accent.def.bg === "rgb(64, 64, 64)", accent.def.bg);
    check("an accent override paints the active toolbar button",
        accent.set.bg === "rgb(194, 90, 45)" && accent.set.color === "rgb(255, 255, 255)",
        accent.set.bg + " / " + accent.set.color);
    check("toolbar buttons keep the 4 px radius", accent.set.radius === "4px", accent.set.radius);
    check("the accent never reaches the AC column fill",
        accent.set.acFill > 0 && accent.set.acFill === accent.def.acFill,
        "set=" + accent.set.acFill + " def=" + accent.def.acFill);

    // ---- 20) v0.12: forecast months. The pharma demo binds no monthly FC role,
    // so the forecast zone gets a synthetic model: AC Jan..Jun, FC Jul..Sep,
    // PL and PY over all nine months.
    await page.evaluate(() => {
        const MON = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06",
            "2026-07", "2026-08", "2026-09"];
        const rows = [];
        const mk = (l1, l2, acF, plF) => MON.forEach((m, i) => rows.push({
            levels: [l1, l2], account: l2, sort: 10, rowType: "account", formulaDef: null,
            sign: 1, month: m,
            values: { ac: i < 6 ? acF(i) : null, fc: i >= 6 ? acF(i) * 1.04 : null,
                pl: plF(i), py: plF(i) * 0.93 },
        }));
        mk("Revenue", "Products", i => 100 + i * 4, i => 98 + i * 4);
        mk("Revenue", "Services", i => 40 + i * 2, i => 41 + i * 2);
        rows.push({ levels: ["Total revenue", null], account: "F_TOT", sort: 90,
            rowType: "formula", formulaDef: "[Products]+[Services]", sign: 1,
            month: null, values: {} });
        const col = (role, name, vals) =>
            ({ source: { roles: { [role]: true }, displayName: name, index: 0 }, values: vals });
        const L = (i) => rows.map(r => r.levels[i] ?? null);
        const dataView = {
            categorical: {
                categories: [
                    col("levels", "L1", L(0)), col("levels", "L2", L(1)),
                    col("account", "A", rows.map(r => r.account)),
                    col("sortOrder", "S", rows.map(r => r.sort)),
                    col("rowType", "RT", rows.map(r => r.rowType)),
                    col("formulaDef", "F", rows.map(r => r.formulaDef)),
                    col("signConvention", "SG", rows.map(r => r.sign)),
                    col("period", "P", rows.map(r => r.month)),
                ],
                values: [
                    col("ac", "AC", rows.map(r => r.values.ac ?? null)),
                    col("py", "PY", rows.map(r => r.values.py ?? null)),
                    col("pl", "PL", rows.map(r => r.values.pl ?? null)),
                    col("fc", "FC", rows.map(r => r.values.fc ?? null)),
                ],
            },
            metadata: { objects: { state: { uiState: JSON.stringify({
                view: "tree", treeV: 2, ref: "pl", treeZoom: "F_TOT" }) } } },
        };
        const d = document.createElement("div");
        d.className = "stage"; d.id = "fc"; d.style.cssText = "width:1420px;height:1050px;";
        document.body.appendChild(d);
        const v = new PnlByDatenWG.Visual({ element: d, host: makeHost("en-US") });
        v.update({ dataViews: [dataView], viewport: { width: 1420, height: 1050 }, type: 2 });
    });
    await page.waitForTimeout(260);
    const fc = await page.evaluate(readTile, "fc");
    check("the forecast model opens its tile view", fc != null && fc.combo === 1,
        JSON.stringify(fc && fc.combo));
    check("nine months give nine bridge steps and nine columns",
        !!fc && fc.steps === 9 && fc.monthCols === 9,
        fc ? "steps=" + fc.steps + " cols=" + fc.monthCols : "no tile");
    check("the three forecast months are drawn hatched",
        !!fc && fc.fcMonths === 3, fc ? "fcMonths=" + fc.fcMonths : "no tile");
    check("their bridge steps keep the hatched forecast notation",
        !!fc && fc.fcSteps === 3, fc ? "fcSteps=" + fc.fcSteps : "no tile");
    check("a vertical rule separates the last actual from the first forecast month",
        !!fc && fc.fcLine === 1, fc ? "line=" + fc.fcLine : "no tile");
    check("the rule is labelled FC", !!fc && fc.texts.indexOf("FC") >= 0,
        fc ? fc.texts.join(" | ").slice(0, 120) : "no tile");
    check("the total column stacks AC solid and FC hatched",
        !!fc && fc.totalAc === 1 && fc.totalFc === 1,
        fc ? "ac=" + fc.totalAc + " fc=" + fc.totalFc : "no tile");
    check("the stack is named AC+FC under the axis",
        !!fc && fc.texts.indexOf("AC+FC") >= 0, fc ? "no AC+FC label" : "no tile");
    check("the caption follows the forecast into PL → AC/FC",
        !!fc && fc.texts.some(t => t.indexOf("PL → AC/FC") === 0),
        fc ? fc.texts[0] : "no tile");
    check("the forecast chart clips no label", !!fc && fc.clipped.length === 0,
        fc ? fc.clipped.join(", ") : "no tile");

    // ---- 21) v0.13: the frozen head. Title, toolbar, legend and the scale note
    // ride in one sticky wrapper; the two table header rows keep their own top
    // offset below it, so the columns stay named however far the body scrolls.
    const stickyRes = await page.evaluate(() => {
        const mk = (id, style) => {
            const d = document.createElement("div");
            d.className = "stage"; d.id = id; d.style.cssText = "width:1300px;height:520px;";
            document.body.appendChild(d);
            run(id, { titleBlock: { measureLine: "sticky" }, style,
                hierarchy: { defaultLevel: 0 },
                state: { uiState: JSON.stringify({ view: "table" }) } });
            const root = d.querySelector(".pnl-root");
            const head = d.querySelector('[data-pnl="head"]');
            const rows = [...d.querySelectorAll('[data-pnl="hdr-row"]')];
            root.scrollTop = 260;
            root.dispatchEvent(new Event("scroll"));
            const rb = root.getBoundingClientRect();
            const top = (e) => Math.round(e.getBoundingClientRect().top - rb.top);
            return {
                scrolled: root.scrollTop > 0,
                headTop: head ? top(head) : null,
                headH: head ? Math.round(head.getBoundingClientRect().height) : 0,
                stuck: head ? head.className.indexOf("pnl-head-stuck") >= 0 : false,
                shadow: head ? head.style.boxShadow : "",
                border: head ? head.style.borderBottomColor : "",
                noteInHead: !!(head && head.querySelector('[data-pnl="scale-note"]')),
                // the visible header is the floating clone (Chromium paints
                // stickied table-cells behind body content, so the in-table
                // rows are width-drivers only, visibility:hidden)
                floatRowTops: (() => {
                    const fh = d.querySelector('[data-pnl="float-head"]');
                    return fh ? [...fh.children].map(r => top(r)) : [];
                })(),
                srcHidden: rows.map(r => r.children[0].style.visibility),
                // a body row really is scrolled out from under the header
                bodyBelow: [...d.querySelectorAll("div")]
                    .filter(x => x.style.display === "table-row"
                        && x.getAttribute("data-pnl") !== "hdr-row").length,
            };
        };
        return { on: mk("sticky-on", {}), off: mk("sticky-off", { stickyHeader: false }) };
    });
    check("the head block stays at the top edge while the body scrolls",
        stickyRes.on.scrolled && stickyRes.on.headTop === 0,
        "top=" + stickyRes.on.headTop);
    check("the scale note rides in the frozen head", stickyRes.on.noteInHead);
    check("the two column header rows stick right under the head",
        stickyRes.on.srcHidden.every(v => v === "hidden")
        && stickyRes.on.floatRowTops.length === 2
        && Math.abs(stickyRes.on.floatRowTops[0] - stickyRes.on.headH) <= 1
        && stickyRes.on.floatRowTops[1] > stickyRes.on.floatRowTops[0],
        JSON.stringify(stickyRes.on.floatRowTops) + " headH=" + stickyRes.on.headH);
    check("a scrolled head draws its divider and the quiet shadow",
        stickyRes.on.stuck && stickyRes.on.shadow !== "" && stickyRes.on.shadow !== "none"
        && stickyRes.on.border !== "transparent",
        stickyRes.on.shadow + " / " + stickyRes.on.border);
    check("switching the setting off releases head and header rows",
        stickyRes.off.srcHidden.every(v => v !== "hidden")
        && stickyRes.off.floatRowTops.length === 0 && !stickyRes.off.stuck,
        JSON.stringify(stickyRes.off.srcHidden) + " float=" + stickyRes.off.floatRowTops.length);

    // ---- 22) v0.13: the tile view fits the viewport without vertical scrolling
    const fitZoom = await page.evaluate(() => {
        const mk = (id, h) => {
            const d = document.createElement("div");
            d.className = "stage"; d.id = id; d.style.cssText = `width:1340px;height:${h}px;`;
            document.body.appendChild(d);
            run(id, { titleBlock: { measureLine: "zoom fit" },
                state: { uiState: JSON.stringify({ view: "tree", treeV: 2, ref: "pl",
                    treeZoom: "F_EBITDA" }) } });
            const root = d.querySelector(".pnl-root");
            const chart = d.querySelector('[data-pnl="zoom-combo"]');
            const head = d.querySelector('[data-pnl="zoom-head"]');
            return {
                scrollH: root.scrollHeight, clientH: root.clientHeight,
                chartH: chart ? parseFloat(chart.getAttribute("height")) : 0,
                headSticky: head ? head.style.position : "",
                gridFs: (() => {
                    const g = d.querySelector('[data-pnl="scen-grid"]');
                    return g && g.firstElementChild
                        ? g.firstElementChild.children[0].style.fontSize : "";
                })(),
            };
        };
        return { tall: mk("zfit-tall", 1000), short: mk("zfit-short", 760) };
    });
    check("the tile view fits a standard viewport without vertical scrolling",
        fitZoom.tall.scrollH <= fitZoom.tall.clientH + 1,
        "scroll=" + fitZoom.tall.scrollH + " client=" + fitZoom.tall.clientH);
    check("a shorter viewport squeezes the chart instead of scrolling",
        fitZoom.short.scrollH <= fitZoom.short.clientH + 1
        && fitZoom.short.chartH < fitZoom.tall.chartH && fitZoom.short.chartH >= 260,
        "short=" + fitZoom.short.chartH + " tall=" + fitZoom.tall.chartH
        + " scroll=" + fitZoom.short.scrollH + "/" + fitZoom.short.clientH);
    check("the back button row of the tile view is frozen too",
        fitZoom.tall.headSticky === "sticky", fitZoom.tall.headSticky);

    // ---- 23) v0.13: alignment of the tile page — one line on every outer edge
    const align = await page.evaluate(() => {
        const d = document.getElementById("zfit-tall");
        const box = (sel, i) => {
            const list = d.querySelectorAll(sel);
            const e = list[i == null ? 0 : i];
            if (!e) { return null; }
            const b = e.getBoundingClientRect();
            return { l: b.left, r: b.right, t: b.top, b: b.bottom };
        };
        const sides = d.querySelectorAll('[data-pnl="zoom-side"]');
        return {
            back: box('[data-pnl="zoom-back"]'),
            head: box('[data-pnl="zoom-head"]'),
            tile: box('[data-pnl="zoom-center"]'),
            left: box('[data-pnl="zoom-side"]', 0),
            right: box('[data-pnl="zoom-side"]', sides.length - 1),
        };
    });
    const near = (a, b) => Math.abs(a - b) <= 1;
    check("the back button starts on the left edge of the left driver column",
        near(align.back.l, align.left.l), align.back.l + " vs " + align.left.l);
    check("the right driver column ends on the right edge of the head",
        near(align.right.r, align.head.r), align.right.r + " vs " + align.head.r);
    check("left column, big tile and right column share one top edge",
        near(align.left.t, align.tile.t) && near(align.right.t, align.tile.t),
        [align.left.t, align.tile.t, align.right.t].join(" / "));
    check("the driver columns end where the tile ends",
        near(align.left.b, align.tile.b) && near(align.right.b, align.tile.b),
        [align.left.b, align.tile.b, align.right.b].join(" / "));

    // ---- 24) v0.13: the status edge of the tree cards reaches the tile page
    const edges = await page.evaluate(() => {
        const d = document.getElementById("zfit-tall");
        const read = (sel) => [...d.querySelectorAll(sel)].map(e => ({
            w: e.style.borderLeftWidth, c: e.style.borderLeftColor,
            h: Math.round(e.getBoundingClientRect().height),
            name: (e.querySelector('[data-pnl="micro-name"]') || {}).textContent || "",
            nameFs: (e.querySelector('[data-pnl="micro-name"]') || { style: {} }).style.fontSize,
            deltaFs: (e.querySelector('[data-pnl="micro-delta"]') || { style: {} }).style.fontSize,
            valueFs: [...e.querySelectorAll("svg text")]
                .filter(t => t.getAttribute("fill") === "#1A1A1A")
                .map(t => parseFloat(t.getAttribute("font-size"))),
        }));
        return { micro: read('[data-pnl="zoom-child"]'), tile: read('[data-pnl="zoom-center"]') };
    });
    check("every micro card carries the 3 px status edge on its left side",
        edges.micro.length > 0 && edges.micro.every(m => m.w === "3px" && m.c !== ""),
        JSON.stringify(edges.micro.map(m => m.w + "/" + m.c)));
    check("the big tile wears the same edge, quietly",
        edges.tile.length === 1 && edges.tile[0].w === "3px", JSON.stringify(edges.tile[0]));
    check("micro cards are tall enough to be read (96–108 px)",
        edges.micro.every(m => m.h >= 96 && m.h <= 108),
        edges.micro.map(m => m.h).join(","));
    check("micro card name and Δ% are set at 11 px",
        edges.micro.every(m => m.nameFs === "11px" && (m.deltaFs === "11px" || m.deltaFs === "")),
        edges.micro.map(m => m.nameFs + "/" + m.deltaFs).join(" "));
    check("the numbers inside a micro chart are drawn at 8.5 px or more",
        edges.micro.some(m => m.valueFs.length > 0)
        && edges.micro.every(m => m.valueFs.every(v => v >= 8.5)),
        JSON.stringify(edges.micro.map(m => m.valueFs)));

    // ---- 25) v0.13: page and card background reach the page and the cards
    const bg = await page.evaluate(() => {
        const mk = (id, style) => {
            const d = document.createElement("div");
            d.className = "stage"; d.id = id; d.style.cssText = "width:1340px;height:1000px;";
            document.body.appendChild(d);
            run(id, { titleBlock: { measureLine: "background" }, style,
                state: { uiState: JSON.stringify({ view: "tree", treeV: 2, ref: "pl",
                    treeZoom: "F_EBITDA" }) } });
            const root = d.querySelector(".pnl-root");
            return {
                page: root.style.background,
                head: d.querySelector('[data-pnl="head"]').style.background,
                tile: d.querySelector('[data-pnl="zoom-center"]').style.background,
                micro: d.querySelector('[data-pnl="zoom-child"]').style.background,
            };
        };
        const treeCards = (id, style) => {
            const d = document.createElement("div");
            d.className = "stage"; d.id = id; d.style.cssText = "width:1340px;height:900px;";
            document.body.appendChild(d);
            run(id, { toolbar: { show: false, showLegend: false }, style,
                state: { uiState: JSON.stringify({ view: "tree", treeV: 2 }) } });
            return [...new Set([...d.querySelectorAll("svg rect[rx='4']")]
                .map(r => r.getAttribute("fill")))];
        };
        return {
            def: mk("bg-def", {}),
            set: mk("bg-set", { pageBackground: { solid: { color: "#F4F1EA" } },
                cardBackground: { solid: { color: "#FFFDF7" } } }),
            treeDef: treeCards("bg-tree-def", {}),
            treeSet: treeCards("bg-tree-set", { cardBackground: { solid: { color: "#FFFDF7" } } }),
        };
    });
    check("the defaults keep the previous white page and white cards",
        bg.def.page === "rgb(255, 255, 255)" && bg.def.tile === "rgb(255, 255, 255)"
        && bg.def.micro === "rgb(255, 255, 255)" && bg.treeDef.join() === "#FFFFFF",
        JSON.stringify(bg.def) + " tree=" + bg.treeDef.join());
    check("a page background paints the page and the frozen head",
        bg.set.page === "rgb(244, 241, 234)" && bg.set.head === "rgb(244, 241, 234)",
        bg.set.page + " / " + bg.set.head);
    check("a card background paints tile, micro cards and the tree cards",
        bg.set.tile === "rgb(255, 253, 247)" && bg.set.micro === "rgb(255, 253, 247)"
        && bg.treeSet.join() === "#FFFDF7",
        bg.set.tile + " / " + bg.set.micro + " / " + bg.treeSet.join());

    // ---- 26) v0.13: months without actuals are not zero months. AC runs
    // Jan..Aug, PL and PY over all twelve months, no monthly FC is bound.
    await page.evaluate(() => {
        window.PNL_GAP_DV = (uiState) => {
            const MON = [];
            for (let m = 1; m <= 12; m++) { MON.push("2026-" + String(m).padStart(2, "0")); }
            const rows = [];
            const mk = (l1, l2, acF, plF) => MON.forEach((m, i) => rows.push({
                levels: [l1, l2], account: l2, sort: 10, rowType: "account", formulaDef: null,
                sign: 1, month: m,
                // actuals stop after August — those months carry no value at all
                values: { ac: i < 8 ? acF(i) : null, pl: plF(i), py: plF(i) * 0.93 },
            }));
            mk("Revenue", "Products", i => 100 + i * 4, i => 98 + i * 4);
            mk("Revenue", "Services", i => 40 + i * 2, i => 41 + i * 2);
            rows.push({ levels: ["Total revenue", null], account: "F_TOT", sort: 90,
                rowType: "formula", formulaDef: "[Products]+[Services]", sign: 1,
                month: null, values: {} });
            const col = (role, name, vals) =>
                ({ source: { roles: { [role]: true }, displayName: name, index: 0 }, values: vals });
            const L = (i) => rows.map(r => r.levels[i] ?? null);
            return {
                categorical: {
                    categories: [
                        col("levels", "L1", L(0)), col("levels", "L2", L(1)),
                        col("account", "A", rows.map(r => r.account)),
                        col("sortOrder", "S", rows.map(r => r.sort)),
                        col("rowType", "RT", rows.map(r => r.rowType)),
                        col("formulaDef", "F", rows.map(r => r.formulaDef)),
                        col("signConvention", "SG", rows.map(r => r.sign)),
                        col("period", "P", rows.map(r => r.month)),
                    ],
                    values: [
                        col("ac", "AC", rows.map(r => r.values.ac ?? null)),
                        col("py", "PY", rows.map(r => r.values.py ?? null)),
                        col("pl", "PL", rows.map(r => r.values.pl ?? null)),
                    ],
                },
                metadata: { objects: { state: { uiState: JSON.stringify(uiState) } } },
            };
        };
        const stage = (id, w, h, uiState) => {
            const d = document.createElement("div");
            d.className = "stage"; d.id = id; d.style.cssText = `width:${w}px;height:${h}px;`;
            document.body.appendChild(d);
            const v = new PnlByDatenWG.Visual({ element: d, host: makeHost("en-US") });
            v.update({ dataViews: [window.PNL_GAP_DV(uiState)],
                viewport: { width: w, height: h }, type: 2 });
        };
        stage("gap-zoom", 1420, 1000,
            { view: "tree", treeV: 2, ref: "pl", treeZoom: "F_TOT" });
        stage("gap-table", 1420, 700,
            { view: "table", preset: "full", blocks: { mtd: true, ytd: true, fy: false } });
    });
    await page.waitForTimeout(300);
    const gap = await page.evaluate(readTile, "gap-zoom");
    check("a month without AC and without FC draws no zero column",
        !!gap && gap.monthCols === 8, gap ? "cols=" + gap.monthCols : "no tile");
    check("the bridge stops at the last month that carries data",
        !!gap && gap.steps === 8, gap ? "steps=" + gap.steps : "no tile");
    check("the Δ% pins count only the months with data (plus the total)",
        !!gap && gap.pins === 9, gap ? "pins=" + gap.pins : "no tile");
    check("no −100 % ghost pin and no 0.00 column label survives",
        !!gap && gap.texts.every(t => !/^[-−]100/.test(t) && !/^0\.00$/.test(t)),
        gap ? gap.texts.filter(t => /100|0\.00/.test(t)).join(" | ") : "no tile");
    check("the empty months keep their reference column, drawn pale",
        !!gap && gap.monthRefs.length === 12
        && gap.monthRefs.filter(r => r.empty).length === 4,
        gap ? "refs=" + gap.monthRefs.length
            + " pale=" + gap.monthRefs.filter(r => r.empty).length : "no tile");
    check("the missing months are named in a note under the chart",
        !!gap && gap.note === 1, gap ? "notes=" + gap.note : "no tile");
    check("the gap chart clips no label", !!gap && gap.clipped.length === 0,
        gap ? gap.clipped.join(", ") : "no tile");

    const gapTable = await page.evaluate(() => {
        const d = document.getElementById("gap-table");
        const cells = [...d.querySelectorAll("div")]
            .filter(x => x.style.display === "table-cell" && x.textContent !== "");
        const mtd = cells.find(x => x.textContent.indexOf("MTD") === 0);
        // the first body row: AC of the MTD block must be the August actual
        const rows = [...d.querySelectorAll("div")].filter(x => x.style.display === "table-row");
        const body = rows.slice(2).find(r => r.textContent.indexOf("Products") >= 0);
        return {
            mtd: mtd ? mtd.textContent : "",
            body: body ? [...body.children].map(c => c.textContent).filter(t => t !== "") : [],
        };
    });
    check("the MTD block names the last month that carries actuals",
        gapTable.mtd.indexOf("MTD Aug") === 0, gapTable.mtd);
    check("the MTD column reports the August actual, not a zero December",
        gapTable.body.length > 1 && gapTable.body.indexOf("0.0") < 0,
        gapTable.body.join(" | "));

    // ---- 26b) v0.13.2: YTD is period-matched. The references in the grid and
    // in the Δ headline read over the same window as AC (Jan..Aug) instead of
    // the full bound year — no more red −37 % next to an all-teal bridge.
    const gapGrid = await page.evaluate(() => {
        const d = document.getElementById("gap-zoom");
        const grid = d.querySelector('[data-pnl="scen-grid"]');
        if (!grid) { return null; }
        return { rows: [...grid.children].map(r => [...r.children].map(c => c.textContent)) };
    });
    check("the scenario grid says which window it reads (YTD _Aug)",
        !!gapGrid && gapGrid.rows[0].join(" ").indexOf("_Aug") >= 0,
        gapGrid ? gapGrid.rows[0].join(" ") : "no grid");
    const gapPl = gapGrid ? gapGrid.rows.find(r => r[0] === "PL") : null;
    check("ΔPL agrees with the bridge: +8.0 over the eight AC months",
        !!gapPl && gapPl.some(t => t.indexOf("+8.0") >= 0)
        && gapPl.some(t => /1[\s.,  ]?280/.test(t))
        && gapPl.every(t => t.indexOf("776") < 0),
        gapPl ? gapPl.join(" | ") : "no PL row");

    // ---- 27) v0.13: the monthly zone draws the IBCS pair, AC in front and the
    // reference behind it, offset to the right (UN 4.1) — same as the cards
    check("every month draws an AC column and a reference column",
        !!combo && combo.acCols.length === MONTHS && combo.monthRefs.length === MONTHS,
        combo ? "ac=" + combo.acCols.length + " ref=" + combo.monthRefs.length : "no tile");
    check("the reference column is offset against the AC column and wider",
        !!combo && combo.monthRefs[0].x > combo.acCols[0].x + 0.5
        && combo.monthRefs[0].w > combo.acCols[0].w,
        combo ? JSON.stringify([combo.acCols[0], combo.monthRefs[0]]) : "no tile");
    check("the reference column sits behind the AC column",
        !!combo && combo.monthRefs[0].x < combo.acCols[0].x + combo.acCols[0].w,
        combo ? JSON.stringify([combo.acCols[0], combo.monthRefs[0]]) : "no tile");

    // ---- 28) v0.13: a column with more drivers than height offers the pager
    const pager = await page.evaluate(() => {
        const MON = ["2026-01", "2026-02", "2026-03"];
        const rows = [];
        const drivers = [];
        for (let k = 1; k <= 11; k++) { drivers.push("Driver " + k); }
        drivers.forEach((name, k) => MON.forEach((m, i) => rows.push({
            levels: ["Cost", name], account: name, sort: 10 + k, rowType: "account",
            formulaDef: null, sign: 1, month: m,
            values: { ac: 20 + k + i, pl: 21 + k + i, py: 19 + k + i },
        })));
        rows.push({ levels: ["Total cost", null], account: "F_COST", sort: 90,
            rowType: "formula", sign: 1, month: null, values: {},
            formulaDef: drivers.map(d => "[" + d + "]").join("+") });
        const col = (role, name, vals) =>
            ({ source: { roles: { [role]: true }, displayName: name, index: 0 }, values: vals });
        const L = (i) => rows.map(r => r.levels[i] ?? null);
        const dataView = {
            categorical: {
                categories: [
                    col("levels", "L1", L(0)), col("levels", "L2", L(1)),
                    col("account", "A", rows.map(r => r.account)),
                    col("sortOrder", "S", rows.map(r => r.sort)),
                    col("rowType", "RT", rows.map(r => r.rowType)),
                    col("formulaDef", "F", rows.map(r => r.formulaDef)),
                    col("signConvention", "SG", rows.map(r => r.sign)),
                    col("period", "P", rows.map(r => r.month)),
                ],
                values: [
                    col("ac", "AC", rows.map(r => r.values.ac ?? null)),
                    col("py", "PY", rows.map(r => r.values.py ?? null)),
                    col("pl", "PL", rows.map(r => r.values.pl ?? null)),
                ],
            },
            metadata: { objects: { state: { uiState: JSON.stringify({
                view: "tree", treeV: 2, ref: "pl", treeZoom: "F_COST" }) } } },
        };
        const d = document.createElement("div");
        d.className = "stage"; d.id = "pager"; d.style.cssText = "width:1340px;height:900px;";
        document.body.appendChild(d);
        const v = new PnlByDatenWG.Visual({ element: d, host: makeHost("en-US") });
        v.update({ dataViews: [dataView], viewport: { width: 1340, height: 900 }, type: 2 });
        const list = [...d.querySelectorAll('[data-pnl="micro-list"]')].pop();
        const down = [...d.querySelectorAll('[data-pnl="micro-down"]')].pop();
        const up = [...d.querySelectorAll('[data-pnl="micro-up"]')].pop();
        const before = { down: down.style.display, text: down.textContent, up: up.style.display };
        down.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        // no card may be cut in half by the column edge
        const lb = list.getBoundingClientRect();
        const stumps = [...list.children].filter(c => {
            const b = c.getBoundingClientRect();
            return b.top < lb.bottom - 1 && b.bottom > lb.bottom + 1;
        }).length;
        return {
            cards: d.querySelectorAll('[data-pnl="zoom-child"]').length,
            before, after: { up: up.style.display, down: down.style.display },
            scrolled: list.scrollTop > 0, stumps,
            listOverflow: list.scrollHeight > list.clientHeight,
        };
    });
    check("all eleven drivers are built into the column", pager.cards === 11,
        "cards=" + pager.cards);
    check("a column that cannot show them all offers the ▼ pager",
        pager.before.down === "block" && /^▼ \d+ more$/.test(pager.before.text),
        pager.before.down + " '" + pager.before.text + "'");
    check("at the top of the column the ▲ pager stays away",
        pager.before.up === "none", pager.before.up);
    check("a click on ▼ pages the column and reveals the ▲",
        pager.scrolled && pager.after.up === "block",
        "scrolled=" + pager.scrolled + " up=" + pager.after.up);
    check("no driver card is left cut in half at the column edge",
        pager.listOverflow && pager.stumps === 0, "stumps=" + pager.stumps);

    // ---- 29) v0.13: a ratio row talks in percent and percentage points, a
    // value row keeps its unit — the grid header says which of the two it is
    const pp = await page.evaluate(() => {
        const mk = (id, zoomId) => {
            const d = document.createElement("div");
            d.className = "stage"; d.id = id; d.style.cssText = "width:1340px;height:1000px;";
            document.body.appendChild(d);
            run(id, { titleBlock: { measureLine: "pp" },
                state: { uiState: JSON.stringify({ view: "tree", treeV: 2, ref: "pl",
                    unit: "m", treeZoom: zoomId }) } });
            const grid = d.querySelector('[data-pnl="zoom-center"] [data-pnl="scen-grid"]');
            const rows = grid ? [...grid.children] : [];
            const cells = (r) => [...r.children].map(c => c.textContent);
            const tile = d.querySelector('[data-pnl="zoom-center"]');
            return {
                head: rows[0] ? cells(rows[0]) : [],
                body: rows.slice(1).map(cells),
                unit: tile ? tile.textContent.indexOf("mEUR") >= 0 : false,
                pct: tile ? tile.textContent.indexOf("%") >= 0 : false,
            };
        };
        return { ratio: mk("pp-ratio", "K_NETMARGIN"), value: mk("pp-value", "F_EBITDA") };
    });
    check("a ratio row heads its absolute Δ column with percentage points",
        pp.ratio.head[2] === "Δ pp", pp.ratio.head.join(" | "));
    check("a ratio row shows no mEUR unit anywhere on the tile",
        !pp.ratio.unit && pp.ratio.pct, "unit=" + pp.ratio.unit + " pct=" + pp.ratio.pct);
    check("a ratio row prints its grid values as percentages",
        pp.ratio.body.some(r => /%$/.test(r[1] || "")),
        JSON.stringify(pp.ratio.body[0]));
    check("a value row keeps Δ AC and its unit",
        pp.value.head[2] === "Δ AC" && pp.value.unit,
        pp.value.head.join(" | ") + " unit=" + pp.value.unit);

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
