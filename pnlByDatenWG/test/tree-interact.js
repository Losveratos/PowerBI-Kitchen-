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
            // the bridge draws one anchor per side plus a step per month
            bridgeBars: zoom.querySelectorAll('[data-pnl="zoom-center"] svg:last-of-type rect').length,
            gridRows: [...zoom.querySelectorAll('[data-pnl="zoom-center"] div')]
                .filter(x => x.style.display === "table-row").length,
            clipped,
        };
    };
    let tile = await page.evaluate(readTile, "tile");
    check("the chart click opens the tile view", tile != null && tile.back,
        JSON.stringify(tile));
    check("the tile view names the node and shows both big charts",
        !!tile && tile.title.length > 0 && tile.centerCharts === 2,
        tile ? tile.title + " charts=" + tile.centerCharts : "no tile");
    check("the tile view carries the scenario grid", !!tile && tile.gridRows >= 3,
        tile ? String(tile.gridRows) : "no tile");
    check("the tile view offers driver cards to walk down",
        !!tile && tile.children >= 1, tile ? "children=" + tile.children : "no tile");
    check("the big bridge draws both anchors plus a step per month",
        !!tile && tile.bridgeBars >= 8, tile ? "bars=" + tile.bridgeBars : "no tile");
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
