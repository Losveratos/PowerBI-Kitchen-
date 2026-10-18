/*
 * 1.3 Start hub + template UX (headless Chromium over test/test.html), the
 * pattern of test/ease-interact.js and test/toolbar-interact.js. The host mock
 * behaves like Power BI: persistProperties merges into the stored objects and
 * the host answers with an update carrying them (the echo, driven by the test).
 *
 *   H  hub: the default of emptyState.mode, four buttons, readers / exports /
 *      tiny visuals never see it, modes demo / fields / message unchanged
 *   T  feature tour: 7 cards, ‹ › dots arrow keys, every card draws a real
 *      mini rendering (statement, mega table, tree, bars, waterfall, tile view,
 *      dark), nothing is persisted
 *   G  template gallery: 18 mini previews, a click writes ONE persist (like the
 *      toolbar dropdown), without fields it is saved and applies when fields are
 *      bound, a second click on the same template writes again (re-apply)
 *   N  navigation: demo + field guide as sub pages with "← Zurück", Esc, digit
 *      keys, focus follows, the demo is unchanged, nothing is persisted
 *   O  overlay: "☰ Start" in the toolbar (edit mode only), closing restores the
 *      statement byte for byte, a gallery click closes it on the result (and
 *      brings the table view along), Esc / ✕ close and the focus returns
 *   R  "↺ Zum Template zurück": only with a set template whose switches
 *      deviate, edit mode + table view only, one click writes the template again
 *   L  four languages, dark, palette safety (a dark mini never darkens the hub)
 *
 * Run: node test/hub-interact.js  (npm run test:hub, after node test/build.js)
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

(async () => {
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
            return st;
        };
        T.box = (id) => document.getElementById(id);
        T.q = (id, sel) => T.box(id).querySelector(sel);
        T.qa = (id, sel) => [...T.box(id).querySelectorAll(sel)];
        // no field bound: the host still sends the objects (supportsEmptyDataView)
        T.empty = (objs) => ({ metadata: { objects: objs || {}, columns: [] }, categorical: { categories: [], values: [] } });
        // wait until the mini renderings of the hub page are drawn (the gallery draws in batches)
        T.ready = async (id) => {
            for (let i = 0; i < 400; i++) {
                const h = T.q(id, '[data-pnl="hub"]');
                if (h && h.getAttribute("data-hub-ready") === "1") { return true; }
                await new Promise(r => setTimeout(r, 25));
            }
            return false;
        };
        T.click = (id, name) => { const b = T.q(id, `[data-pnl="${name}"]`); if (b) { b.click(); } return !!b; };
        T.key = (id, name, key) => {
            const b = T.q(id, `[data-pnl="${name}"]`) || T.box(id).querySelector('[data-pnl="hub"]');
            (b || T.box(id)).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
        };
        T.hash = (s) => { s = s.replace(/\s*outline[^;"]*;?/g, ""); return T.hash0(s); };
        T.hash0 = (s) => { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return h; };
        T.rootHash = (id) => T.hash(T.box(id).querySelector(".pnl-root").innerHTML);
        T.page = (id) => { const h = T.q(id, '[data-pnl="hub"]'); return h ? h.getAttribute("data-hub-page") : null; };
        T.raw = (id) => /UI_[A-Za-z0-9]+|Enum_|Role_/.test(T.box(id).textContent);
        T.statement = (o) => dv(o);
    });

    // ================================================================== H · the hub
    const H = await ev(() => {
        const T = window.__T; const out = {};
        // edit mode (viewMode 1) and the harness (no view mode = edit, as in 1.1/1.2): the hub is the default
        T.mk("h1", T.empty, {}, { viewMode: 1 });
        out.tiles = ["tour", "templates", "demo", "fields"].map(n => !!T.q("h1", `[data-pnl="hub-tile-${n}"]`));
        out.noDemo = !T.q("h1", '[data-pnl="demo-banner"]') && !T.q("h1", '[data-pnl="field-guide"]');
        out.title = T.q("h1", '[data-pnl="hub-title"]').textContent;
        out.persists = T.h1.persists.length;
        out.buttons = T.qa("h1", '[data-pnl="hub"] button').every(b => b.tagName === "BUTTON" && b.tabIndex >= 0);
        T.mk("h2", null, {});
        out.harness = !!T.q("h2", '[data-pnl="hub-tile-tour"]');
        // readers, exports, tiny visuals: never the hub — the landing text as before
        T.mk("h3", T.empty, {}, { viewMode: 0 });
        out.readerNoHub = !T.q("h3", '[data-pnl="hub"]') && /AC/.test(T.box("h3").textContent);
        T.mk("h4", T.empty, {}, { host: { allowInteractions: false }, viewMode: 1 });
        out.exportNoHub = !T.q("h4", '[data-pnl="hub"]') && /AC/.test(T.box("h4").textContent);
        T.mk("h5", T.empty, {}, { w: 280, h: 200, viewMode: 1 });
        out.tinyNoHub = !T.q("h5", '[data-pnl="hub"]');
        // in-focus edit (2) is edit
        T.mk("h6", T.empty, {}, { viewMode: 2 });
        out.focusHub = !!T.q("h6", '[data-pnl="hub-tile-tour"]');
        // the other modes keep their 1.2 behaviour, the hub is only the new default
        T.mk("h7", T.empty, { emptyState: { mode: "demo" } }, { viewMode: 1 });
        out.demoMode = !!T.q("h7", '[data-pnl="demo-banner"]') && !T.q("h7", '[data-pnl="hub"]') && !T.q("h7", '[data-pnl="hub-back"]')
            && !!T.q("h7", '[data-pnl="es-fields"]');
        T.mk("h8", T.empty, { emptyState: { mode: "fields" } }, { viewMode: 1 });
        out.fieldsMode = !!T.q("h8", '[data-pnl="field-guide"]') && !T.q("h8", '[data-pnl="hub"]') && !!T.q("h8", '[data-pnl="es-demo"]');
        T.mk("h9", T.empty, { emptyState: { mode: "message", title: "Bitte Felder binden" } }, { viewMode: 1 });
        out.messageMode = /Bitte Felder binden/.test(T.box("h9").textContent) && !T.q("h9", '[data-pnl="hub"]');
        // half bound: the hub names what is missing
        T.mk("h10", (o) => ({ metadata: { objects: o, columns: [{ roles: { levels: true }, displayName: "L1" }] }, categorical: { categories: [], values: [] } }), {}, { viewMode: 1 });
        out.missing = (T.q("h10", '[data-pnl="hub-missing"]') || {}).textContent;
        // real data: the statement, no hub
        T.mk("h11", T.statement, { hierarchy: { defaultLevel: 1 } }, { viewMode: 1 });
        out.dataNoHub = !T.q("h11", '[data-pnl="hub"]') && T.qa("h11", "[data-pnl-row]").length > 5;
        return out;
    });
    check("H default emptyState.mode = hub: four big buttons in edit mode, no demo banner, nothing persisted",
        H.tiles.every(Boolean) && H.noDemo && H.persists === 0, JSON.stringify(H.tiles));
    check("H the hub title is the product name", H.title === "P&L Statement byDatenWG", H.title);
    check("H every control of the hub is a native button (Tab · Enter · Space)", H.buttons);
    check("H the harness without a view mode shows the hub too (edit, like the 1.1 demo)", H.harness);
    check("H readers get the landing text, never the hub", H.readerNoHub);
    check("H exports (allowInteractions = false) never see the hub", H.exportNoHub);
    check("H a tiny visual gets the text landing", H.tinyNoHub);
    check("H in-focus edit counts as edit", H.focusHub);
    check("H mode demo: the 1.2 demo with its switch, no hub, no back button", H.demoMode);
    check("H mode fields: the 1.2 field guide with its switch, no hub", H.fieldsMode);
    check("H mode message: the own message, no hub", H.messageMode);
    check("H half bound: the hub names the missing role", /Still missing: AC \(actual\)/.test(H.missing || ""), H.missing);
    check("H real data replaces the hub by the statement", H.dataNoHub);

    // ================================================================== T · the tour
    const T1 = await ev(async () => {
        const T = window.__T; const out = {};
        T.mk("t1", T.empty, {}, { viewMode: 1 });
        T.click("t1", "hub-tile-tour");
        out.page = T.page("t1");
        out.card1 = T.q("t1", '[data-pnl="hub-tour"]').getAttribute("data-tour-card");
        out.count = T.q("t1", '[data-pnl="tour-count"]').textContent.trim();
        out.dots = T.qa("t1", '[data-pnl^="tour-dot-"]').length;
        out.prevLocked = T.q("t1", '[data-pnl="tour-prev"]').getAttribute("aria-disabled") === "true";
        out.nextLocked = T.q("t1", '[data-pnl="tour-next"]').getAttribute("aria-disabled") === "true";
        out.focusBack = document.activeElement && document.activeElement.getAttribute("data-pnl");
        const cards = [];
        for (let i = 1; i <= 7; i++) {
            const t0 = performance.now();
            if (i > 1) { T.click("t1", i === 2 ? "tour-next" : "tour-dot-" + i); }
            await T.ready("t1");
            const mini = T.q("t1", '[data-pnl="hub-mini"]');
            const inner = mini.firstElementChild;
            cards.push({
                n: T.q("t1", '[data-pnl="hub-tour"]').getAttribute("data-tour-card"),
                title: T.q("t1", '[data-pnl="tour-title"]').textContent,
                text: T.q("t1", '[data-pnl="tour-text"]').textContent,
                rows: mini.querySelectorAll("[data-pnl-row]").length,
                hdr: mini.querySelectorAll('[data-pnl="hdr-row"]').length, svgs: mini.querySelectorAll("svg").length,
                megaHead: !!mini.querySelector('svg[data-pnl="mega-head"]'),
                treeCards: mini.querySelectorAll("svg g rect[rx='4']").length,
                zoomBack: !!mini.querySelector('[data-pnl="zoom-back"]'),
                bars: mini.querySelectorAll('polygon[data-pnl^="bar-tri-"]').length,
                bg: getComputedStyle(mini.querySelector(".pnl-root")).backgroundColor,
                toolbar: mini.querySelectorAll("button").length,
                banner: !!mini.querySelector('[data-pnl="demo-banner"]'),
                size: [mini.getBoundingClientRect().width, mini.getBoundingClientRect().height],
                scaled: inner.style.transform,
                pointer: getComputedStyle(mini).pointerEvents,
                ms: Math.round(performance.now() - t0),
            });
        }
        out.cards = cards;
        out.persists = T.t1.persists.length;
        // ‹ ›: step back, the arrow keys, ends locked
        T.click("t1", "tour-prev"); await T.ready("t1");
        out.afterPrev = T.q("t1", '[data-pnl="hub-tour"]').getAttribute("data-tour-card");
        T.key("t1", "tour-prev", "ArrowLeft"); await T.ready("t1");
        out.afterLeft = T.q("t1", '[data-pnl="hub-tour"]').getAttribute("data-tour-card");
        T.key("t1", "tour-prev", "ArrowRight"); T.key("t1", "tour-prev", "ArrowRight"); await T.ready("t1");
        out.afterRight = T.q("t1", '[data-pnl="hub-tour"]').getAttribute("data-tour-card");
        T.click("t1", "tour-dot-7"); await T.ready("t1");
        out.last = { n: T.q("t1", '[data-pnl="hub-tour"]').getAttribute("data-tour-card"),
            nextLocked: T.q("t1", '[data-pnl="tour-next"]').getAttribute("aria-disabled") === "true" };
        T.click("t1", "tour-next"); await T.ready("t1");
        out.stays7 = T.q("t1", '[data-pnl="hub-tour"]').getAttribute("data-tour-card");
        out.activeDot = T.q("t1", '[data-pnl="tour-dot-7"]').getAttribute("aria-current");
        out.raw = T.raw("t1");
        T.click("t1", "hub-back");
        out.backHome = T.page("t1");
        out.focusTile = document.activeElement && document.activeElement.getAttribute("data-pnl");
        out.persistsEnd = T.t1.persists.length;
        return out;
    });
    check("T the tour tile opens the tour at card 1 of 7 with seven dots", T1.page === "tour" && T1.card1 === "1" && T1.count === "1 / 7" && T1.dots === 7,
        `${T1.page} ${T1.card1} ${T1.count} ${T1.dots}`);
    check("T the first card has no ‹, the next button is live", T1.prevLocked && !T1.nextLocked);
    check("T after opening a page the focus sits on ← Zurück (keyboard flow)", T1.focusBack === "hub-back", T1.focusBack);
    const c = T1.cards;
    check("T seven cards, titled and described, in order", c.length === 7 && c.every((x, i) => x.n === String(i + 1) && x.title.length > 3 && x.text.length > 40),
        c.map(x => x.n + ":" + x.title).join(" | "));
    check("T card 1 mini = a real statement table (rows, no toolbar, no demo banner)", c[0].hdr > 0 && c[0].svgs > 10 && c[0].toolbar === 0 && !c[0].banner, JSON.stringify(c[0]));
    check("T card 2 mini = the mega table of a template (T04B)", c[1].megaHead);
    check("T card 3 mini = the value driver tree (cards)", c[2].treeCards > 3, String(c[2].treeCards));
    check("T card 4 mini = bars with overlap + triangle marks", c[3].bars > 5, String(c[3].bars));
    check("T card 5 mini = the row waterfall (rows, no mega table)", c[4].hdr > 0 && c[4].svgs > 10 && !c[4].megaHead);
    check("T card 6 mini = the tile view (back-to-tree button of the real tile page)", c[5].zoomBack);
    check("T card 7 mini = dark", c[6].bg === "rgb(30, 30, 30)", c[6].bg);
    check("T every mini is scaled down, non-interactive and the size of its frame", c.every(x => /scale\(/.test(x.scaled) && x.pointer === "none"
        && x.size[0] > 200 && x.size[1] > 120), JSON.stringify(c.map(x => x.size)));
    check("T ‹ steps back, ← → leaf through the cards, the last card locks ›", T1.afterPrev === "6" && T1.afterLeft === "5" && T1.afterRight === "7"
        && T1.last.n === "7" && T1.last.nextLocked && T1.stays7 === "7", JSON.stringify([T1.afterPrev, T1.afterLeft, T1.afterRight, T1.last, T1.stays7]));
    check("T the current dot is announced (aria-current)", T1.activeDot === "true");
    check("T no raw resource key on the tour pages", !T1.raw);
    check("T ← Zurück returns to the home page and the focus goes back to the tile", T1.backHome === "hub" && T1.focusTile === "hub-tile-tour", T1.focusTile);
    check("T the whole tour persists nothing", T1.persists === 0 && T1.persistsEnd === 0);

    // ================================================================== G · the template gallery
    const G = await ev(async () => {
        const T = window.__T; const out = {};
        const st = T.mk("g1", T.empty, {}, { viewMode: 1 });
        T.click("g1", "hub-tile-templates");
        out.ready = await T.ready("g1");
        out.page = T.page("g1");
        out.tiles = T.qa("g1", '[data-pnl^="tpl-"][data-active]').map(b => b.getAttribute("data-pnl").slice(4));
        out.minis = T.qa("g1", '[data-pnl="hub-mini"]').map(m => m.querySelectorAll("svg").length + m.querySelectorAll("[data-pnl-row]").length);
        out.mega = T.qa("g1", '[data-pnl="hub-mini"]').filter(m => m.querySelector('svg[data-pnl="mega-head"]')).length;
        out.noteNoFields = (T.q("g1", '[data-pnl="hub-tpl-note"]') || {}).textContent;
        out.activeDefault = T.qa("g1", '[data-pnl^="tpl-"][data-active="1"]').map(b => b.getAttribute("data-pnl"));
        out.persists0 = st.persists.length;
        out.raw = T.raw("g1");
        // pick T03A: ONE persist, the same write as the toolbar dropdown
        T.click("g1", "tpl-T03A");
        out.persistN = st.persists.length;
        const m = st.persists[0] && st.persists[0].merge;
        out.objs = m ? m.map(x => x.objectName) : [];
        const cols = m && m[0].properties;
        out.cols = cols ? { template: cols.template, applied: cols.templateApplied, showPY: cols.showPY, showPL: cols.showPL, showMinuend: cols.showMinuend,
            dPyAbs: cols.dPyAbs, dPlPct: cols.dPlPct, blockKind: cols.blockKind } : null;
        out.nums = m && m[1] ? m[1].properties : null;
        out.savedNote = (T.q("g1", '[data-pnl="hub-tpl-note"]') || {}).textContent;
        out.activeNow = T.qa("g1", '[data-pnl^="tpl-"][data-active="1"]').map(b => b.getAttribute("data-pnl"));
        out.focus = document.activeElement && document.activeElement.getAttribute("data-pnl");
        // a stale update before the echo keeps the pick (echo guard), the echo confirms it
        st.update({});
        out.afterStale = T.qa("g1", '[data-pnl^="tpl-"][data-active="1"]').map(b => b.getAttribute("data-pnl"));
        await T.ready("g1");
        st.flush();
        await T.ready("g1");
        out.afterEcho = T.qa("g1", '[data-pnl^="tpl-"][data-active="1"]').map(b => b.getAttribute("data-pnl"));
        out.persistAfterEcho = st.persists.length;
        // the same template again writes again (re-apply) — also after a switch was changed by hand
        st.objects.columns = { ...st.objects.columns, dPyAbs: false };
        st.update(); st.flush(); await T.ready("g1");
        T.click("g1", "tpl-T03A");
        out.reapply = st.persists.length;
        out.reapplyDPy = st.persists[st.persists.length - 1].merge[0].properties.dPyAbs;
        // the pane keeps the pick: bind the fields and the statement is the mega table
        st.flush();
        const keep = JSON.parse(JSON.stringify(st.objects));
        T.mk("g2", T.statement, { ...keep, hierarchy: { defaultLevel: 1 } }, { viewMode: 1 });
        out.boundMega = !!T.q("g2", 'svg[data-pnl="mega-head"]') && !T.q("g2", '[data-pnl="hub"]');
        out.boundPersist = T.g2.persists.length;
        // "off": the classic table tile
        T.click("g1", "tpl-off");
        const off = st.persists[st.persists.length - 1].merge;
        out.off = { tpl: off[0].properties.template, applied: off[0].properties.templateApplied, nums: off.length };
        return out;
    });
    check("G the template tile opens the gallery: 18 tiles (the classic table + 17 templates), all minis drawn", G.ready && G.page === "templates" && G.tiles.length === 18
        && G.tiles[0] === "off" && G.tiles[1] === "T01A" && G.tiles[17] === "12H", G.tiles.join(","));
    check("G every tile carries a mini rendering", G.minis.length === 18 && G.minis.every(n => n > 3), JSON.stringify(G.minis));
    check("G 17 of the minis are mega tables (the classic table is the 18th)", G.mega === 17, String(G.mega));
    check("G without fields: the note says the choice is saved and applies on binding", /^No fields bound yet/.test(G.noteNoFields || ""), G.noteNoFields);
    check("G the classic table is the active tile before any pick, nothing persisted by browsing",
        G.activeDefault.join() === "tpl-off" && G.persists0 === 0);
    check("G no raw resource key in the gallery", !G.raw);
    check("G a click = ONE persist: columns (template + templateApplied + every switch) and numbers", G.persistN === 1 && G.objs.join() === "columns,numbers"
        && G.cols && G.cols.template === "T03A" && G.cols.applied === "T03A" && G.cols.showPY === true && G.cols.showPL === true && G.cols.showMinuend === true
        && G.cols.dPyAbs === true && G.cols.dPlPct === true && G.cols.blockKind === "ytd", JSON.stringify(G.cols) + JSON.stringify(G.objs));
    check("G the number format travels with the template (T03A: 1 / 0 decimals)", G.nums && G.nums.decimals === 1 && G.nums.pctDecimals === 0, JSON.stringify(G.nums));
    check("G without fields the pick is shown as saved, the tile active, the focus stays on the tile",
        /^Saved: T03A/.test(G.savedNote || "") && G.activeNow.join() === "tpl-T03A" && G.focus === "tpl-T03A", `${G.savedNote} | ${G.activeNow} | ${G.focus}`);
    check("G echo guard: a stale update keeps the pick, the echo confirms it, no second write",
        G.afterStale.join() === "tpl-T03A" && G.afterEcho.join() === "tpl-T03A" && G.persistAfterEcho === 1, `${G.afterStale} ${G.afterEcho} ${G.persistAfterEcho}`);
    check("G re-apply: the same template again writes again and restores a switch changed by hand", G.reapply === 2 && G.reapplyDPy === true, `${G.reapply} ${G.reapplyDPy}`);
    check("G the stored pick applies when fields are bound (mega table, no write)", G.boundMega && G.boundPersist === 0);
    check("G the classic-table tile writes template off", G.off.tpl === "off" && G.off.applied === "off" && G.off.nums === 1, JSON.stringify(G.off));

    // ================================================================== N · navigation, keyboard
    const N = await ev(async () => {
        const T = window.__T; const out = {};
        const st = T.mk("n1", T.empty, {}, { viewMode: 1 });
        // demo as a sub page
        T.click("n1", "hub-tile-demo");
        out.demoBanner = !!T.q("n1", '[data-pnl="demo-banner"]');
        out.demoBack = !!T.q("n1", '[data-pnl="hub-back"]');
        out.demoNoSwitch = !T.q("n1", '[data-pnl="es-switches"]');
        out.demoRows = T.qa("n1", '[data-pnl="hdr-row"]').length > 0 && /Net income[\s\S]{0,40}339\.5/.test(T.box("n1").innerText);
        out.demoFocus = document.activeElement && document.activeElement.getAttribute("data-pnl");
        T.click("n1", "hub-back");
        out.backHub = T.page("n1");
        // field guide as a sub page
        T.click("n1", "hub-tile-fields");
        out.guide = !!T.q("n1", '[data-pnl="field-guide"]') && !!T.q("n1", '[data-pnl="hub-back"]') && !T.q("n1", '[data-pnl="es-switches"]');
        out.guideTitle = T.q("n1", '[data-pnl="hub-title"]').textContent;
        // Esc steps back
        T.key("n1", "hub", "Escape");
        out.escBack = T.page("n1");
        // digit keys on the home page
        T.key("n1", "hub", "2"); out.key2 = T.page("n1");
        T.key("n1", "hub", "Escape");
        T.key("n1", "hub", "3"); out.key3 = !!T.q("n1", '[data-pnl="demo-banner"]');
        T.click("n1", "hub-back");
        T.key("n1", "hub", "1"); out.key1 = T.page("n1");
        T.click("n1", "hub-back");
        T.key("n1", "hub", "4"); out.key4 = !!T.q("n1", '[data-pnl="field-guide"]');
        // the mode switch of the 1.2 demo never appears and nothing was persisted
        out.persists = st.persists.length;
        out.stillHub = String(st.objects.emptyState && st.objects.emptyState.mode || "hub");
        // a resize / unrelated update keeps the page and does not redraw it
        T.click("n1", "hub-back");
        const el = T.q("n1", '[data-pnl="hub"]');
        st.update(); st.update();
        out.sameNode = T.q("n1", '[data-pnl="hub"]') === el;
        // the demo explored inside the hub persists nothing either
        T.click("n1", "hub-tile-demo");
        [...T.box("n1").querySelectorAll("button")].find(b => b.textContent === "Tree").click();
        out.demoTree = T.box("n1").querySelectorAll("svg g rect[rx='4']").length > 3;
        out.persistsDemo = st.persists.length;
        T.click("n1", "hub-back");
        out.homeAgain = T.page("n1");
        // data arrives while a sub page shows: the statement takes over, the hub starts at home next time
        T.click("n1", "hub-tile-tour");
        st.v.update({ dataViews: [dv({ hierarchy: { defaultLevel: 1 } })], viewport: { width: 1300, height: 760 }, type: 2, viewMode: 1 });
        out.dataWins = !T.q("n1", '[data-pnl="hub"]') && T.qa("n1", "[data-pnl-row]").length > 5;
        st.v.update({ dataViews: [T.empty({})], viewport: { width: 1300, height: 760 }, type: 2, viewMode: 1 });
        out.homeAfterData = T.page("n1");
        return out;
    });
    check("N demo = a sub page: the 1.0 demo unchanged, ← Zurück instead of the 1.2 switch, focus on the back button",
        N.demoBanner && N.demoBack && N.demoNoSwitch && N.demoRows && N.demoFocus === "hub-back", JSON.stringify([N.demoBanner, N.demoBack, N.demoNoSwitch, N.demoRows, N.demoFocus]));
    check("N ← Zurück from the demo returns to the hub home", N.backHub === "hub");
    check("N field guide = a sub page with ← Zurück, no 1.2 switch", N.guide && N.guideTitle === "Explain fields", N.guideTitle);
    check("N Esc steps back from a sub page", N.escBack === "hub");
    check("N digit keys 1–4 open the four pages", N.key2 === "templates" && N.key3 && N.key1 === "tour" && N.key4, JSON.stringify([N.key2, N.key3, N.key1, N.key4]));
    check("N navigating the whole hub persists nothing (mode stays the default)", N.persists === 0 && N.stillHub === "hub");
    check("N an update that changes nothing does not redraw the page", N.sameNode);
    check("N exploring the demo inside the hub persists nothing", N.demoTree && N.persistsDemo === 0 && N.homeAgain === "hub");
    check("N real data replaces a hub sub page; without data the hub starts at home again", N.dataWins && N.homeAfterData === "hub");

    // ================================================================== O · overlay with a bound statement
    const O = await ev(async () => {
        const T = window.__T; const out = {};
        const objs = { hierarchy: { defaultLevel: 1 }, state: { uiState: JSON.stringify({ view: "bars" }) } };
        const st = T.mk("o1", T.statement, objs, { viewMode: 1 });
        out.open = !!T.q("o1", '[data-pnl="hub-open"]');
        out.label = T.q("o1", '[data-pnl="hub-open"]').textContent;
        out.inToolbar = !!T.q("o1", '[data-pnl="head"] [data-pnl="hub-open"]');
        // readers, exports, hosts without a view mode: no button
        T.mk("o2", T.statement, objs, { viewMode: 0 });
        T.mk("o3", T.statement, objs, { host: { allowInteractions: false }, viewMode: 1 });
        T.mk("o4", T.statement, objs);
        out.noOpen = [!T.q("o2", '[data-pnl="hub-open"]'), !T.q("o3", '[data-pnl="hub-open"]'), !T.q("o4", '[data-pnl="hub-open"]')];
        // open → the layer; the statement below is untouched
        const root = T.q("o1", ".pnl-root");
        root.scrollTop = 40;
        const before = T.rootHash("o1");
        const scrollBefore = root.scrollTop;
        T.click("o1", "hub-open");
        out.overlay = !!T.q("o1", '[data-pnl="hub-overlay"]');
        out.role = T.q("o1", '[data-pnl="hub-overlay"]').getAttribute("role");
        out.tiles = T.qa("o1", '[data-pnl="hub-overlay"] [data-pnl^="hub-tile-"]').length;
        out.closeFocus = document.activeElement && document.activeElement.getAttribute("data-pnl");
        out.covers = (() => { const a = T.q("o1", '[data-pnl="hub-overlay"]').getBoundingClientRect(); const b = T.box("o1").getBoundingClientRect();
            return Math.abs(a.width - b.width) < 2 && Math.abs(a.height - b.height) < 2; })();
        out.underHash = T.rootHash("o1") === before;
        // close with the button: exactly the statement it was
        T.click("o1", "hub-close");
        out.closed = !T.q("o1", '[data-pnl="hub-overlay"]');
        out.sameHash = T.rootHash("o1") === before && root.scrollTop === scrollBefore;
        out.focusBack = document.activeElement && document.activeElement.getAttribute("data-pnl");
        out.persistsOpenClose = st.persists.length;
        // Esc on the home page closes, Esc on a sub page steps back first
        T.click("o1", "hub-open"); T.click("o1", "hub-tile-tour");
        out.tourInOverlay = !!T.q("o1", '[data-pnl="hub-overlay"] [data-pnl="hub-tour"]');
        T.key("o1", "hub", "Escape"); out.escStep = !!T.q("o1", '[data-pnl="hub-overlay"]') && T.page("o1") === "hub";
        T.key("o1", "hub", "Escape"); out.escClose = !T.q("o1", '[data-pnl="hub-overlay"]');
        out.sameHash2 = T.rootHash("o1") === before;
        // field guide and the demo inside the overlay
        T.click("o1", "hub-open"); T.click("o1", "hub-tile-fields");
        out.guide = !!T.q("o1", '[data-pnl="hub-overlay"] [data-pnl="field-guide"]');
        T.click("o1", "hub-back"); T.click("o1", "hub-tile-demo");
        out.demoInOverlay = !!T.q("o1", '[data-pnl="hub-overlay"] [data-pnl="hub-demo"] [data-pnl="hdr-row"]');
        out.demoBanner = !!T.q("o1", '[data-pnl="hub-overlay"] [data-pnl="demo-banner"]');
        T.click("o1", "hub-close");
        // the gallery: a click closes the overlay on the result and brings the table view along
        T.click("o1", "hub-open"); T.click("o1", "hub-tile-templates");
        await T.ready("o1");
        out.noNoteWithData = !T.q("o1", '[data-pnl="hub-tpl-note"]');
        st.persists.length = 0;
        T.click("o1", "tpl-T04B");
        const p = st.persists.map(x => x.merge.map(m => m.objectName).join("+"));
        out.pickPersists = p;
        const ui = st.persists.find(x => x.merge[0].objectName === "state");
        out.uiView = ui ? JSON.parse(ui.merge[0].properties.uiState).view : null;
        out.closedByPick = !T.q("o1", '[data-pnl="hub-overlay"]');
        st.flush();
        out.megaNow = !!T.q("o1", 'svg[data-pnl="mega-head"]');
        out.toolbarTemplate = T.q("o1", '[data-pnl="tb-template"]').value;
        out.focusAfterPick = document.activeElement && document.activeElement.getAttribute("data-pnl");
        // reader flip while the overlay is open: the layer goes away
        T.click("o1", "hub-open");
        st.v.update({ dataViews: [dv(st.objects)], viewport: { width: 1300, height: 760 }, type: 2, viewMode: 0 });
        out.readerFlip = !T.q("o1", '[data-pnl="hub-overlay"]') && !T.q("o1", '[data-pnl="hub-open"]');
        return out;
    });
    check("O the toolbar carries a quiet \"☰ Start\" in edit mode", O.open && O.label === "☰ Start" && O.inToolbar, O.label);
    check("O readers, exports and hosts without a view mode get no Start button", O.noOpen.every(Boolean), JSON.stringify(O.noOpen));
    check("O the hub opens as a dialog layer over the whole visual, the statement below untouched, the close button focused",
        O.overlay && O.role === "dialog" && O.tiles === 4 && O.covers && O.underHash && O.closeFocus === "hub-close", JSON.stringify([O.overlay, O.role, O.tiles, O.covers, O.underHash, O.closeFocus]));
    check("O closing restores the statement byte for byte (DOM + scroll position) and the focus returns to \"☰ Start\"",
        O.closed && O.sameHash && O.focusBack === "hub-open", JSON.stringify([O.closed, O.sameHash, O.focusBack]));
    check("O opening and closing persists nothing", O.persistsOpenClose === 0);
    check("O Esc: sub page → home → closed, the statement unchanged", O.tourInOverlay && O.escStep && O.escClose && O.sameHash2);
    check("O the field guide and the demo work inside the overlay", O.guide && O.demoInOverlay && O.demoBanner);
    check("O the gallery with fields: no \"no fields\" note", O.noNoteWithData);
    check("O a gallery click closes the overlay and writes the template + the table view (the click came from Bars)",
        O.closedByPick && O.pickPersists.includes("columns+numbers") && O.uiView === "table", JSON.stringify(O.pickPersists) + " " + O.uiView);
    check("O … and the result is on screen: mega table, toolbar dropdown on T04B", O.megaNow && O.toolbarTemplate === "T04B", String(O.toolbarTemplate));
    check("O a host that flips to reading view takes the layer and the button away", O.readerFlip);

    // ================================================================== R · ↺ back to the template
    const R = await ev(async () => {
        const T = window.__T; const out = {};
        const full = { hierarchy: { defaultLevel: 0 }, columns: { template: "T03A", templateApplied: "T03A", showPY: true, showPL: true, showMinuend: true,
            dPyAbs: true, dPyPct: true, dPlAbs: true, dPlPct: true } };
        const mk = (id, objs, opts) => T.mk(id, (o) => dvRows(MEGA_DEMO.statement("T03"), o), objs, { viewMode: 1, ...(opts || {}) });
        // the switches match the template: no button
        mk("r1", full);
        out.matchNoBtn = !T.q("r1", '[data-pnl="tb-template-reset"]');
        out.pickerThere = !!T.q("r1", '[data-pnl="tb-template"]');
        // one switch off: the button
        const dev = JSON.parse(JSON.stringify(full)); dev.columns.dPlAbs = false;
        const st = mk("r2", dev);
        out.btn = !!T.q("r2", '[data-pnl="tb-template-reset"]');
        out.label = T.q("r2", '[data-pnl="tb-template-reset"]').textContent;
        out.tip = T.q("r2", '[data-pnl="tb-template-reset"]').title;
        out.inGroup = !!T.q("r2", '[data-pnl="tb-template-group"] [data-pnl="tb-template-reset"]');
        out.before = T.qa("r2", 'svg[data-pnl="mega-head"] text').map(t => t.textContent).join("|");
        st.persists.length = 0;
        T.click("r2", "tb-template-reset");
        out.persistN = st.persists.length;
        const m = st.persists[0] && st.persists[0].merge;
        out.write = m ? { objs: m.map(x => x.objectName), tpl: m[0].properties.template, applied: m[0].properties.templateApplied, dPlAbs: m[0].properties.dPlAbs } : null;
        out.afterClick = !T.q("r2", '[data-pnl="tb-template-reset"]');
        st.update(JSON.parse(JSON.stringify(dev)));     // a stale update keeps the restored switches (echo guard)
        out.afterStale = !T.q("r2", '[data-pnl="tb-template-reset"]');
        st.flush();
        out.afterEcho = !T.q("r2", '[data-pnl="tb-template-reset"]') && st.persists.length === 1;
        out.after = T.qa("r2", 'svg[data-pnl="mega-head"] text').map(t => t.textContent).join("|");
        // the dropdown re-picking the same value (a change event) applies it again as well
        const st3 = mk("r3", dev);
        st3.persists.length = 0;
        const sel = T.q("r3", '[data-pnl="tb-template"]');
        sel.value = "T03A"; sel.dispatchEvent(new Event("change", { bubbles: true }));
        out.dropdownReapply = st3.persists.length === 1 && st3.persists[0].merge[0].properties.dPlAbs === true;
        // reader / export / other views / template off / no template: no button
        mk("r4", dev, { viewMode: 0 });
        mk("r5", dev, { host: { allowInteractions: false }, viewMode: 1 });
        mk("r6", { ...dev, state: { uiState: JSON.stringify({ view: "bars" }) } });
        const off = JSON.parse(JSON.stringify(dev)); off.columns.template = "off"; off.columns.templateApplied = "off";
        mk("r7", off);
        mk("r8", { hierarchy: { defaultLevel: 0 }, columns: { showPY: true, showMinuend: true } });
        out.noBtn = ["r4", "r5", "r6", "r7", "r8"].map(id => !T.q(id, '[data-pnl="tb-template-reset"]'));
        // a toolbar switch of the picker group: "Template" off → no picker, no button
        mk("r9", { ...dev, toolbar: { showTemplate: false } });
        out.pickerOff = !T.q("r9", '[data-pnl="tb-template-reset"]') && !T.q("r9", '[data-pnl="tb-template"]');
        // 12G: the headline switch is part of the template state
        const g = { hierarchy: { defaultLevel: 0 }, columns: { template: "12G", templateApplied: "12G" } };
        mk("r10", g);
        out.headlineDev = !!T.q("r10", '[data-pnl="tb-template-reset"]');
        // the overlay's gallery re-applies the active template (restores the deviating switch)
        const st11 = mk("r11", dev);
        T.click("r11", "hub-open"); T.click("r11", "hub-tile-templates"); await T.ready("r11");
        st11.persists.length = 0;
        T.click("r11", "tpl-T03A");
        out.galleryReapply = st11.persists.length === 1 && st11.persists[0].merge[0].properties.dPlAbs === true && !T.q("r11", '[data-pnl="hub-overlay"]');
        return out;
    });
    check("R switches equal to the template: no ↺ button (the picker is there)", R.matchNoBtn && R.pickerThere);
    check("R a deviating switch shows \"↺ Zum Template zurück\" with a tooltip naming the template, next to the dropdown",
        R.btn && /Back to template/.test(R.label) && /T03A/.test(R.tip) && R.inGroup, R.label + " | " + R.tip);
    check("R one click = ONE persist: template + templateApplied + every switch (dPlAbs back on) + numbers",
        R.persistN === 1 && R.write && R.write.objs.join() === "columns,numbers" && R.write.tpl === "T03A" && R.write.applied === "T03A" && R.write.dPlAbs === true, JSON.stringify(R.write));
    check("R the table follows at once; a stale update keeps it; no second write after the echo; the button is gone",
        R.afterClick && R.afterStale && R.afterEcho && R.before !== R.after);
    check("R re-picking the same value in the dropdown (change event) applies the template again", R.dropdownReapply);
    check("R no ↺ for readers, exports, the bars view, template off, no template", R.noBtn.every(Boolean), JSON.stringify(R.noBtn));
    check("R the toolbar switch \"template picker\" off removes the picker and the button", R.pickerOff);
    check("R 12G: the title headline is part of the template state (off by default → deviation)", R.headlineDev);
    check("R the gallery click on the ACTIVE template restores its state (re-apply) and closes the overlay", R.galleryReapply);

    // ================================================================== L · languages, dark, palette
    const L = await ev(async () => {
        const T = window.__T; const out = {};
        for (const loc of ["en-US", "de-DE", "es-ES", "ja-JP"]) {
            const id = "l" + loc.slice(0, 2);
            T.mk(id, T.empty, {}, { viewMode: 1, locale: loc });
            const home = T.box(id).textContent;
            T.click(id, "hub-tile-tour"); await T.ready(id);
            const tour = T.q(id, '[data-pnl="tour-text"]').textContent;
            const dots = T.q(id, '[data-pnl="tour-dot-2"]').getAttribute("aria-label");
            T.click(id, "hub-back"); T.click(id, "hub-tile-templates"); await T.ready(id);
            const gal = T.box(id).textContent;
            out[loc] = { home, tour, dots, gal, raw: T.raw(id), tiles: T.qa(id, '[data-pnl^="tpl-"][data-active]').length };
        }
        // dark hub: dark paper + dark minis
        T.mk("ld", T.empty, { style: { appearance: "dark" } }, { viewMode: 1 });
        T.click("ld", "hub-tile-templates"); await T.ready("ld");
        out.darkBg = getComputedStyle(T.q("ld", ".pnl-root")).backgroundColor;
        out.darkMini = getComputedStyle(T.q("ld", '[data-pnl="hub-mini"] .pnl-root')).backgroundColor;
        // light hub with a dark mini (tour card 7): the hub chrome stays light, hover handlers use the light palette
        T.mk("ll", T.empty, {}, { viewMode: 1 });
        T.click("ll", "hub-tile-tour"); T.click("ll", "tour-dot-7"); await T.ready("ll");
        out.lightBg = getComputedStyle(T.q("ll", ".pnl-root")).backgroundColor;
        out.darkCardMini = getComputedStyle(T.q("ll", '[data-pnl="hub-mini"] .pnl-root')).backgroundColor;
        const prev = T.q("ll", '[data-pnl="tour-prev"]');
        prev.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        out.hover = prev.style.background;
        prev.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
        out.rest = prev.style.background;
        // a host in high contrast keeps the hub readable (no throw, tiles there)
        T.mk("lh", T.empty, {}, { viewMode: 1, host: { palette: { isHighContrast: true, foreground: { value: "#FFFF00" }, background: { value: "#000000" }, foregroundSelected: { value: "#00FFFF" } } } });
        out.hcTiles = T.qa("lh", '[data-pnl^="hub-tile-"]').length;
        // a narrow visual: one column of tiles, no horizontal scroll
        T.mk("ln", T.empty, {}, { viewMode: 1, w: 420, h: 700 });
        out.narrowTiles = T.qa("ln", '[data-pnl^="hub-tile-"]').length;
        const nr = T.q("ln", ".pnl-root");
        out.narrowScroll = nr.scrollWidth > nr.clientWidth;
        T.click("ln", "hub-tile-templates"); await T.ready("ln");
        out.narrowGalleryScroll = nr.scrollWidth > nr.clientWidth;
        out.narrowGalleryCols = new Set(T.qa("ln", '[data-pnl^="tpl-"][data-active]').map(b => Math.round(b.getBoundingClientRect().left))).size;
        T.click("ln", "hub-back"); T.click("ln", "hub-tile-tour"); await T.ready("ln");
        out.narrowTourScroll = nr.scrollWidth > nr.clientWidth;
        return out;
    });
    check("L four languages: home, tour card and gallery are localized, no raw key, 18 tiles",
        ["en-US", "de-DE", "es-ES", "ja-JP"].every(l => !L[l].raw && L[l].tiles === 18 && L[l].home.length > 80 && L[l].tour.length > 40));
    check("L German and Japanese differ from English", L["de-DE"].tour !== L["en-US"].tour && L["ja-JP"].tour !== L["en-US"].tour
        && L["es-ES"].tour !== L["en-US"].tour && L["de-DE"].home !== L["en-US"].home);
    check("L Japanese texts are Japanese, Spanish ones Spanish", /[぀-ヿ一-鿿]/.test(L["ja-JP"].tour) && /[ñáéíóú]/i.test(L["es-ES"].tour + L["es-ES"].home));
    check("L the dot labels are localized", L["de-DE"].dots === "Karte 2" && L["en-US"].dots === "Card 2" && L["es-ES"].dots === "Tarjeta 2" && L["ja-JP"].dots === "カード2",
        [L["de-DE"].dots, L["en-US"].dots, L["es-ES"].dots, L["ja-JP"].dots].join(","));
    check("L dark hub: dark paper, dark mini previews", L.darkBg === "rgb(30, 30, 30)" && L.darkMini === "rgb(30, 30, 30)", L.darkBg + " " + L.darkMini);
    check("L a light hub with a dark mini stays light; hover uses the light palette (the mini re-armed the shared palette)",
        L.lightBg === "rgb(255, 255, 255)" && L.darkCardMini === "rgb(30, 30, 30)" && L.hover === "rgb(244, 243, 240)" && L.rest === "rgb(255, 255, 255)",
        [L.lightBg, L.darkCardMini, L.hover, L.rest].join(" | "));
    check("L high contrast host: the hub renders", L.hcTiles === 4);
    check("L narrow visual (420 px): four tiles, no horizontal scroll on home, gallery or tour, a single column of gallery tiles",
        L.narrowTiles === 4 && !L.narrowScroll && !L.narrowGalleryScroll && !L.narrowTourScroll && L.narrowGalleryCols === 1,
        JSON.stringify([L.narrowScroll, L.narrowGalleryScroll, L.narrowTourScroll, L.narrowGalleryCols]));

    await browser.close();
    for (const n of notes) { console.log(n); }
    if (errors > 0) { failures.push(errors + " page errors"); }
    if (failures.length) {
        console.error("\n" + failures.length + " check(s) failed:\n  ✗ " + failures.join("\n  ✗ "));
        process.exit(1);
    }
    console.log(`\n${notes.length} start-hub checks passed`);
})();
