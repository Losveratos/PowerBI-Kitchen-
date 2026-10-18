/* eslint-disable powerbi-visuals/non-literal-fs-path -- test tooling, paths are fixed under the repo */
/*
 * 1.2 ease-of-use package (headless Chromium over test/test.html) — the
 * points of the owner's list that are not toolbar switches (those live in
 * test/toolbar-interact.js, sections H–J):
 *
 *   P  pane order: the mega table group with the template dropdown is the
 *      FIRST group of the FIRST card; the own-selection switches show only
 *      with the preset "custom", the bar switches only in the bars view
 *   R  data roles: the order of capabilities.json follows the visual logic
 *      (levels → keys → AC PY PL FC → period → specials) and the mapping
 *      lists every role; the visual reads its columns by ROLE — a data view
 *      with the columns in any order renders the very same statement
 *   E  empty state: default = the demo (unchanged); mode "fields" = the field
 *      guide with a check per bound role, in four languages; mode "message"
 *      = the own message; readers always the landing text; the switch
 *      buttons exist only in edit mode, write emptyState.mode and survive a
 *      stale update (echo guard)
 *   B  bars view: overlapping scenario bars (equal height, offset, AC in
 *      front), triangle marks for the further scenarios (PY gray / PL
 *      outlined / FC hatched), dark + high contrast; default path untouched
 *   C  column category: one block per category value + the total block,
 *      categories add up to the total, one uniform Δ scale over all blocks,
 *      ignored (with an edit-mode note) by the mega table and the bars view,
 *      more than 24 values are cut with a footnote
 *
 * Run: node test/ease-interact.js  (npm run test:ease, after node test/build.js)
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

(async () => {
    // ---- R (static part) · capabilities.json ---------------------------------
    const caps = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "capabilities.json"), "utf8"));
    const order = caps.dataRoles.map(r => r.name);
    check("R role order: levels → keys → AC PY PL FC → period → column category → specials → filter info → FY",
        order.join(",") === "levels,account,accountName,parent,ac,py,pl,fc,period,colCategory,rowType,formulaDef,"
            + "signConvention,displayInvert,varianceInvert,sortOrder,comment,filterInfo,fcFy,plFy", order.join(","));
    const map = caps.dataViewMappings[0];
    const cond = Object.keys(map.conditions[0]);
    const sel = [...map.categorical.categories.select.map(x => x.for.in), ...map.categorical.values.select.map(x => x.bind.to)];
    check("R every role has a condition (max) and a select/bind entry — nothing lost in the reorder",
        order.every(r => cond.includes(r) && sel.includes(r)) && cond.length === order.length && sel.length === order.length,
        JSON.stringify({ cond: cond.length, sel: sel.length }));
    check("R colCategory: Grouping, max 1", caps.dataRoles.find(r => r.name === "colCategory").kind === "Grouping"
        && map.conditions[0].colCategory.max === 1);

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
    let errors = 0;
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    page.on("console", m => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
    await page.goto("file://" + __dirname + "/test.html");
    await page.waitForTimeout(300);
    const ev = (fn, ...args) => page.evaluate(fn, args);

    await ev(() => {
        document.querySelectorAll(".case").forEach(c => { c.style.display = "none"; });
        const T = {};
        window.__T = T;
        // a stage with a Power-BI-like host (persist → objects → echo on flush)
        T.mk = (id, dataFn, objects, opts) => {
            const o = opts || {};
            const box = document.createElement("div");
            box.id = id; box.style.cssText = `width:${o.w || 1300}px;height:${o.h || 760}px;position:relative;`;
            document.body.prepend(box);
            const host = makeHost(o.locale || "en-US", o.host);
            const st = { objects: JSON.parse(JSON.stringify(objects || {})), persists: [], echoes: [] };
            const v = new Visual({ element: box, host });
            st.v = v;
            st.update = (objs) => v.update({ dataViews: dataFn ? [dataFn(objs || st.objects)] : [],
                viewport: { width: o.w || 1300, height: o.h || 760 }, type: 2,
                ...(o.viewMode != null ? { viewMode: o.viewMode } : {}) });
            host.persistProperties = (p) => {
                st.persists.push(JSON.parse(JSON.stringify(p)));
                for (const m of p.merge || []) { st.objects[m.objectName] = { ...(st.objects[m.objectName] || {}), ...m.properties }; }
                st.echoes.push(JSON.parse(JSON.stringify(st.objects)));
            };
            st.flush = () => { while (st.echoes.length) { st.update(st.echoes.shift()); } };
            st.update(); st.flush();
            T[id] = st;
            return true;
        };
        T.box = (id) => document.getElementById(id);
        T.q = (id, sel) => T.box(id).querySelector(sel);
        T.body = (id) => {
            const html = T.box(id).querySelector(".pnl-root").innerHTML;
            let h = 0;
            for (let i = 0; i < html.length; i++) { h = (h * 31 + html.charCodeAt(i)) | 0; }
            return h;
        };
        // a data view with the metadata columns the host sends along (roles of the bound fields)
        T.withMeta = (d) => {
            const cols = [...(d.categorical.categories || []), ...(d.categorical.values || [])]
                .map(c => ({ roles: c.source.roles, displayName: c.source.displayName }));
            return { ...d, metadata: { ...d.metadata, columns: cols } };
        };
        // only some roles bound (an incomplete data view, as the host sends it)
        T.partial = (roles) => (objs) => {
            const cols = roles.map(r => ({ roles: { [r]: true }, displayName: r }));
            return { metadata: { objects: objs || {}, columns: cols }, categorical: { categories: [], values: [] } };
        };
    });

    // ---- P · pane order + gates ---------------------------------------------------
    await ev(() => window.__T.mk("pp", (o) => dv(o), { hierarchy: { defaultLevel: 1 } }));
    const pane = await ev(() => {
        const fm = window.__T.pp.v.getFormattingModel();
        return fm.cards.map(c => ({ uid: c.uid, groups: (c.groups || []).map(g => ({ uid: g.uid, slices: (g.slices || []).map(s => s.uid) })) }));
    });
    check("P the first card is Columns & mega table", pane[0].uid === "columns-card", pane[0].uid);
    check("P its first group is the mega table, the template dropdown first",
        pane[0].groups[0].uid === "columnsMega-group" && pane[0].groups[0].slices[0] === "columns-template",
        JSON.stringify(pane[0].groups.map(g => g.uid)));
    const general = pane[0].groups.find(g => g.uid === "columnsGeneral-group").slices;
    check("P own-selection switches hidden while the preset is not custom; bar switches hidden in the table view",
        !general.some(s => /col(Ac|Py|Pl|Fc|Delta)|bar(Overlap|Triangles)/.test(s)), general.join(","));
    const pane2 = await ev(() => {
        const T = window.__T;
        T.pp.objects.columns = { preset: "custom" };
        T.pp.objects.state = { uiState: JSON.stringify({ view: "bars" }) };
        T.pp.update(); T.pp.flush();
        const fm = T.pp.v.getFormattingModel();
        return fm.cards[0].groups.find(g => g.uid === "columnsGeneral-group").slices.map(s => s.uid);
    });
    check("P preset custom shows colAc / colPy / colPl / colDelta (colFc only with the FC field), bars view the bar switches",
        ["columns-colAc", "columns-colPy", "columns-colPl", "columns-colDelta", "columns-barOverlap", "columns-barTriangles"]
            .every(u => pane2.includes(u)) && !pane2.includes("columns-colFc"), pane2.join(","));
    const tbSlices = pane.find(c => c.uid === "toolbar-card").groups[0].slices;
    check("P toolbar card lists showValues + showTemplate", tbSlices.includes("toolbar-showValues") && tbSlices.includes("toolbar-showTemplate"));
    const esSlices = pane.find(c => c.uid === "emptyState-card").groups[0].slices;
    check("P empty-state card: mode first, then title / body", esSlices.join(",") === "emptyState-mode,emptyState-title,emptyState-body", esSlices.join(","));

    // ---- R (render part) · mapping independent of column order -------------------
    const rr = await ev(() => {
        const T = window.__T;
        T.mk("r1", (o) => dv(o), { hierarchy: { defaultLevel: 1 } });
        T.mk("r2", (o) => {
            const d = dv(o);
            // the host may hand the columns over in field-list order — every
            // column reversed here, only the level columns keep their drag order
            // (L1..Ln IS the hierarchy)
            const lv = d.categorical.categories.filter(c => c.source.roles.levels);
            const rest = d.categorical.categories.filter(c => !c.source.roles.levels).reverse();
            return { ...d, categorical: { categories: [...rest, ...lv], values: [...d.categorical.values].reverse() } };
        }, { hierarchy: { defaultLevel: 1 } });
        const strip = (id) => T.box(id).querySelector(".pnl-root").innerHTML.replace(/pnlh\w+|data-pnl-row="[^"]*"/g, "");
        const a = strip("r1"); const b = strip("r2");
        return { same: a === b, rows: T.box("r1").querySelectorAll('[data-pnl-row]').length };
    });
    check(`R a data view with reversed column order renders the identical statement (${rr.rows} rows)`, rr.same && rr.rows > 10);

    // ---- E · empty state ------------------------------------------------------------
    const e1 = await ev(() => {
        const T = window.__T; const out = {};
        // 1.3: the default is the Start hub (test/hub-interact.js); the 1.1 / 1.2 demo is the explicit mode "demo"
        T.mk("e0", T.partial([]), { emptyState: { mode: "demo" } });         // harness: no view mode (= edit, as in 1.1)
        out.demoDefault = !!T.q("e0", '[data-pnl="demo-banner"]');
        out.noSwitchNoMode = !T.q("e0", '[data-pnl="es-switches"]');
        T.mk("e1", T.partial([]), { emptyState: { mode: "demo" } }, { viewMode: 1 });
        out.demoEdit = !!T.q("e1", '[data-pnl="demo-banner"]');
        out.switchInDemo = !!T.q("e1", '[data-pnl="es-fields"]') && !T.q("e1", '[data-pnl="es-demo"]');
        // no field bound: the host still sends the objects (supportsEmptyDataView)
        T.mk("e2", T.partial([]), { emptyState: { mode: "fields" } }, { viewMode: 0 });
        out.readerLanding = !T.q("e2", '[data-pnl="field-guide"]') && !T.q("e2", '[data-pnl="demo-banner"]')
            && /AC/.test(T.box("e2").textContent);
        T.mk("e3", T.partial([]), { emptyState: { mode: "fields" } }, { host: { allowInteractions: false } });
        out.exportLanding = !T.q("e3", '[data-pnl="field-guide"]');
        T.mk("e4", T.partial([]), { emptyState: { mode: "message", title: "Bitte Felder binden", body: "Ebenen + AC" } }, { viewMode: 1 });
        out.message = /Bitte Felder binden/.test(T.box("e4").textContent) && !!T.q("e4", '[data-pnl="es-demo"]')
            && !!T.q("e4", '[data-pnl="es-fields"]');
        T.mk("e5", T.partial([]), { emptyState: { mode: "message" } }, { viewMode: 1 });
        out.messageNoText = !!T.q("e5", '[data-pnl="empty-state"]') && /AC/.test(T.box("e5").textContent);
        return out;
    });
    check("E mode demo = the 1.1 Smart Start (no switches without the host's view mode)", e1.demoDefault && e1.noSwitchNoMode);
    check("E edit mode: the demo banner carries the switch \"Explain fields\"", e1.demoEdit && e1.switchInDemo);
    check("E mode fields: readers get the landing text, never the guide", e1.readerLanding);
    check("E mode fields: exports get the landing text", e1.exportLanding);
    check("E mode message: the own title + text, both switches in edit mode", e1.message);
    check("E mode message without own text: the standard landing text", e1.messageNoText);
    const guide = await ev(() => {
        const T = window.__T; const out = {};
        for (const loc of ["en-US", "de-DE", "es-ES", "ja-JP"]) {
            const id = "eg" + loc.slice(0, 2);
            T.mk(id, T.partial(["ac", "py", "period"]), { emptyState: { mode: "fields" } }, { locale: loc, viewMode: 1 });
            const g = T.q(id, '[data-pnl="field-guide"]');
            const marks = {};
            T.box(id).querySelectorAll('[data-pnl^="fi-"][data-on]').forEach(m => { marks[m.getAttribute("data-pnl").slice(3)] = m.getAttribute("data-on"); });
            out[loc] = { there: !!g, text: g ? g.textContent : "", marks, missing: !!T.q(id, '[data-pnl="fi-missing"]'),
                chips: g ? g.querySelectorAll("span > span").length : 0 };
        }
        return out;
    });
    for (const [loc, g] of Object.entries(guide)) {
        check(`E field guide ${loc}: rendered, no raw keys, minimal + extended rows`,
            g.there && !/UI_|Role_/.test(g.text) && Object.keys(g.marks).length === 9, g.text.slice(0, 120));
        check(`E field guide ${loc}: checks for AC, PY, period; open for levels, PL, FC; the missing hierarchy named`,
            g.marks.ac === "1" && g.marks.py === "1" && g.marks.period === "1" && g.marks.levels === "0"
            && g.marks.pl === "0" && g.marks.fc === "0" && g.missing, JSON.stringify(g.marks));
    }
    check("E field guide: German and Japanese texts differ from English (localized)",
        guide["de-DE"].text !== guide["en-US"].text && guide["ja-JP"].text !== guide["en-US"].text);
    const sw = await ev(() => {
        const T = window.__T; const st = T.e1; const out = {};
        st.persists.length = 0;
        const stale = JSON.parse(JSON.stringify(st.objects));
        T.q("e1", '[data-pnl="es-fields"]').click();
        out.guideAtOnce = !!T.q("e1", '[data-pnl="field-guide"]');
        const m = st.persists[0] && st.persists[0].merge[0];
        out.persist = m ? m.objectName + "." + Object.keys(m.properties).join() + "=" + m.properties.mode : "";
        st.update(stale);
        out.afterStale = !!T.q("e1", '[data-pnl="field-guide"]');
        st.flush();
        out.afterEcho = !!T.q("e1", '[data-pnl="field-guide"]') && st.persists.length === 1;
        T.q("e1", '[data-pnl="es-demo"]').click(); st.flush();
        out.backToDemo = !!T.q("e1", '[data-pnl="demo-banner"]') && st.objects.emptyState.mode === "demo";
        // real data arrives while the guide shows: the statement takes over
        T.mk("e6", T.partial(["ac"]), { emptyState: { mode: "fields" } }, { viewMode: 1 });
        T.e6.update = (objs) => T.e6.v.update({ dataViews: [dv(objs || T.e6.objects)], viewport: { width: 1300, height: 760 }, type: 2, viewMode: 1 });
        T.e6.update();
        out.dataWins = !T.q("e6", '[data-pnl="field-guide"]') && T.box("e6").querySelectorAll("[data-pnl-row]").length > 5;
        return out;
    });
    check("E the switch shows the guide at once", sw.guideAtOnce);
    check("E the switch writes emptyState.mode = fields", sw.persist === "emptyState.mode=fields", sw.persist);
    check("E echo guard: a stale update keeps the guide", sw.afterStale);
    check("E after the echo: guide, no second write", sw.afterEcho);
    check("E \"Show demo\" goes back to the demo and stores it", sw.backToDemo);
    check("E real data replaces the guide", sw.dataWins);

    // ---- B · bars view notation -------------------------------------------------------
    const bars = await ev(() => {
        const T = window.__T; const out = {};
        const read = (id) => {
            const svgs = [...T.box(id).querySelectorAll("[data-pnl-row] svg")].filter(s => s.querySelector("rect") && s.querySelector("line"));
            const first = svgs[0];
            const rects = first ? [...first.querySelectorAll(":scope > rect")].map(r => ({
                y: +r.getAttribute("y"), h: +r.getAttribute("height"), w: +r.getAttribute("width"), fill: r.getAttribute("fill"),
                stroke: r.getAttribute("stroke") })) : [];
            const tris = [...T.box(id).querySelectorAll('polygon[data-pnl^="bar-tri-"]')];
            return { rects, tris: tris.map(t => ({ sc: t.getAttribute("data-pnl").slice(8), fill: t.getAttribute("fill"),
                stroke: t.getAttribute("stroke"), dash: t.getAttribute("stroke-dasharray") })) };
        };
        const ui = { state: { uiState: JSON.stringify({ view: "bars" }) } };
        T.mk("b0", (o) => dv(o), { ...ui });
        out.def = read("b0");
        T.mk("b1", (o) => dv(o), { ...ui, columns: { barOverlap: true } });
        out.ov = read("b1");
        T.mk("b2", (o) => dv(o), { ...ui, columns: { barOverlap: true, barTriangles: true } });
        out.tri = read("b2");
        T.mk("b3", (o) => dvRows(MEGA_DEMO.regions(), o), { hierarchy: { defaultLevel: 0 },
            state: { uiState: JSON.stringify({ view: "bars", ref: "fc" }) }, columns: { barTriangles: true } });
        out.fcRef = read("b3");
        T.mk("b4", (o) => dv(o), { ...ui, columns: { barTriangles: true } },
            { host: { palette: { isHighContrast: true, foreground: { value: "#FFFF00" }, background: { value: "#000000" }, foregroundSelected: { value: "#00FFFF" } } } });
        out.hc = read("b4");
        T.mk("b5", (o) => dv(o), { ...ui, columns: { barOverlap: true, barTriangles: true }, style: { appearance: "dark" } });
        out.dark = read("b5");
        const clipped = [];
        for (const id of ["b1", "b2", "b3", "b5"]) {
            T.box(id).querySelectorAll("svg text").forEach(t => {
                const w = parseFloat(t.ownerSVGElement.getAttribute("width")); const b = t.getBBox();
                if (b.x < -0.5 || b.x + b.width > w + 0.5) { clipped.push(id + ":" + t.textContent); }
            });
        }
        out.clipped = clipped;
        return out;
    });
    const [dRef, dAc] = bars.def.rects;
    check("B default bars view unchanged: full-height reference behind, narrow AC, no triangles",
        bars.def.tris.length === 0 && dRef && dAc && dRef.h > dAc.h * 1.5, JSON.stringify(bars.def.rects));
    const [oRef, oAc] = bars.ov.rects;
    check("B overlap: reference and AC equally high, offset (reference above, AC in front below)",
        oRef && oAc && Math.abs(oRef.h - oAc.h) < 0.01 && oAc.y > oRef.y && oAc.y < oRef.y + oRef.h, JSON.stringify(bars.ov.rects));
    check("B overlap: the PL reference is outlined (paper fill, ink stroke)", oRef && oRef.stroke != null && oRef.fill !== oAc.fill);
    check("B triangles: one PY mark per value row (reference PL), gray, no FC without the field",
        bars.tri.tris.length > 20 && bars.tri.tris.every(t => t.sc === "py"), JSON.stringify(bars.tri.tris.slice(0, 2)));
    check("B triangles with reference FC: PY gray + PL outlined marks",
        bars.fcRef.tris.some(t => t.sc === "py") && bars.fcRef.tris.some(t => t.sc === "pl" && t.stroke && t.fill !== t.stroke)
        && !bars.fcRef.tris.some(t => t.sc === "fc"), JSON.stringify(bars.fcRef.tris.slice(0, 3)));
    // the classic views keep their 1.1 palette under high contrast (the HC path is the mega
    // table's); the marks still differ by shape, not colour alone: PY filled, PL hollow, FC hatched
    check("B high-contrast host: triangles render, every mark carries an outline",
        bars.hc.tris.length > 0 && bars.hc.tris.every(t => t.stroke), JSON.stringify(bars.hc.tris.slice(0, 1)));
    check("B dark: triangles drawn, no label clipped in any new mode", bars.dark.tris.length > 0 && bars.clipped.length === 0,
        bars.clipped.slice(0, 4).join(", "));

    // ---- C · column category ------------------------------------------------------------
    const cat = await ev(() => {
        const T = window.__T; const out = {};
        T.mk("c1", (o) => dvCat(o), { hierarchy: { defaultLevel: 1 }, columns: { preset: "acpldpl", pctRevenue: false } }, { w: 1500 });
        const hdr = [...T.box("c1").querySelectorAll('[data-pnl="hdr-row"]')];
        out.blocks = [...hdr[0].children].map(c => c.textContent).filter(Boolean);
        out.cols = [...hdr[1].children].map(c => c.textContent.trim());
        // AC of every value row: North + South = Total
        const num = (t) => parseFloat(t.replace(/[\s  ]/g, "").replace("−", "-"));
        const bad = [];
        T.box("c1").querySelectorAll("[data-pnl-row]").forEach(r => {
            const cells = [...r.children].map(c => c.textContent.trim());
            // name | N: AC PL ΔPL ΔPL% | gap | S: AC PL ΔPL ΔPL% | gap | total AC PL ΔPL ΔPL%
            const n = num(cells[1]); const s = num(cells[6]); const t = num(cells[11]);
            if (/%$/.test(cells[1]) || isNaN(n) || isNaN(t)) { return; }
            if (Math.abs(n + s - t) > 0.15) { bad.push(cells[0] + ": " + n + "+" + s + "≠" + t); }
        });
        out.sumBad = bad;
        out.rows = T.box("c1").querySelectorAll("[data-pnl-row]").length;
        // one uniform Δ scale: pixels per unit equal in every block
        const ppu = [];
        T.box("c1").querySelectorAll("[data-pnl-row] svg").forEach(svg => {
            const r = svg.querySelector("rect"); const t = svg.querySelector("text");
            if (!r || !t || !/^[+-−]/.test(t.textContent)) { return; }
            const d = Math.abs(num(t.textContent.replace("+", "")));
            const w = +r.getAttribute("width");
            if (d >= 5 && w > 3) { ppu.push(w / d); }
        });
        out.ppuSpread = ppu.length ? (Math.max(...ppu) - Math.min(...ppu)) / Math.max(...ppu) : 1;
        out.ppuN = ppu.length;
        out.scrolls = T.box("c1").querySelector(".pnl-root").scrollWidth > 1500;
        // the mega table ignores it, with a note in edit mode only
        T.mk("c2", (o) => dvCat(o), { hierarchy: { defaultLevel: 1 }, columns: { template: "T03A", templateApplied: "T03A",
            showPY: true, showPL: true, showMinuend: true, dPyAbs: true, dPlAbs: true } });
        out.megaNote = !!T.q("c2", '[data-pnl="cat-note"]') && !!T.q("c2", 'svg[data-pnl="mega-head"]')
            && !/North/.test(T.q("c2", 'svg[data-pnl="mega-head"]').textContent);
        T.mk("c3", (o) => dvCat(o), { hierarchy: { defaultLevel: 1 }, columns: { template: "T03A", templateApplied: "T03A",
            showPY: true, showMinuend: true, dPyAbs: true } }, { viewMode: 0 });
        out.megaReader = !T.q("c3", '[data-pnl="cat-note"]');
        T.mk("c4", (o) => dvCat(o), { hierarchy: { defaultLevel: 1 }, state: { uiState: JSON.stringify({ view: "bars" }) } });
        out.barsNote = !!T.q("c4", '[data-pnl="cat-note"]') && !/North/.test(T.box("c4").querySelector('[data-pnl="hdr-row"]').textContent);
        // 30 category values → 24 blocks + a footnote
        T.mk("c5", (o) => {
            const d = dvCat(o);
            const cc = d.categorical.categories.find(c => c.source.roles.colCategory);
            cc.values = cc.values.map((v, i) => "S" + String(i % 30).padStart(2, "0"));
            return d;
        }, { hierarchy: { defaultLevel: 1 }, columns: { preset: "dpct" } });
        out.capBlocks = [...T.box("c5").querySelector('[data-pnl="hdr-row"]').children].map(c => c.textContent).filter(Boolean).length;
        out.capNote = /6 further values/.test(T.box("c5").textContent);
        return out;
    });
    check("C one block per segment + the total block", cat.blocks.length === 3 && cat.blocks[0] === "North" && cat.blocks[1] === "South"
        && /^Total · /.test(cat.blocks[2]), cat.blocks.join(" | "));
    check("C the column set repeats per category (AC PL ΔPL ΔPL% ×3)",
        cat.cols.filter(c => /ΔPL%$/.test(c)).length === 3 && cat.cols.filter(c => /AC$/.test(c)).length === 3, cat.cols.join(","));
    check(`C North + South = Total on every value row (${cat.rows} rows)`, cat.sumBad.length === 0 && cat.rows > 10, cat.sumBad.slice(0, 3).join("; "));
    check(`C one uniform Δ scale over all blocks (${cat.ppuN} bars, spread ${(cat.ppuSpread * 100).toFixed(1)} %)`,
        cat.ppuN > 10 && cat.ppuSpread < 0.12);
    check("C many columns scroll horizontally", cat.scrolls);
    check("C mega table: no category blocks, an edit-mode note says the field is ignored", cat.megaNote);
    check("C mega table: readers get no note", cat.megaReader);
    check("C bars view: ignored with the note", cat.barsNote);
    check("C more than 24 values: 24 category blocks + total, footnote names the rest", cat.capBlocks === 25 && cat.capNote,
        cat.capBlocks + " blocks");

    await browser.close();
    for (const n of notes) { console.log(n); }
    if (errors > 0) { failures.push(errors + " page errors"); }
    if (failures.length) {
        console.error("\n" + failures.length + " check(s) failed:\n  ✗ " + failures.join("\n  ✗ "));
        process.exit(1);
    }
    console.log(`\n${notes.length} ease-of-use checks passed`);
})();
