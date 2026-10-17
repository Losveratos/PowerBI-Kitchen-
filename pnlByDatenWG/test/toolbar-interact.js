/*
 * Toolbar buttons in every view against a Power-BI-like host (headless
 * Chromium over test/test.html) — the regression net for the 1.0.1 fixes of
 * the owner's report "die AC etc buttons gehen nicht so ganz".
 *
 * The host mock behaves like Power BI: persistProperties merges into the
 * stored objects and the host answers with an update carrying them (the
 * "echo"). The echo queue is driven by the test, so stale updates and late
 * echoes can be played on purpose.
 *
 *   A  template + Bars/Waterfall: a mega template takes over the TABLE view
 *      only; Bars and Waterfall render their own columns (1.0.0 drew the mega
 *      table there and every button of those views did nothing)
 *   B  the column-preset group and "% of revenue" exist only in the table view
 *   C  sweep: every unlocked button of the preset / Δ reference / period groups
 *      changes the columns on screen; every locked one changes nothing and
 *      persists nothing — in table, bars and waterfall, over several states
 *   D  classic table: YTD switches the YTD block off while another block shows;
 *      the uniform Δ scale follows the blocks on screen
 *   E  format pane: a changed preset / Δ reference / scaling wins over the
 *      stored toolbar state — before and after a toolbar click — and is stored
 *   F  echo guard: a stale update between a click and its echo keeps the click;
 *      two quick clicks with late echoes end on the second click, no flicker
 *   G  hit targets: every toolbar button is the topmost element at its centre
 *      and its label fits, in all four locales, three widths, scrolled or not
 *
 * Run: node test/toolbar-interact.js  (npm run test:toolbar)
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

    await page.evaluate(() => {
        document.querySelectorAll(".case").forEach(c => { c.style.display = "none"; });
        const T = {};
        window.__T = T;
        // a stage with a Power-BI-like host; echoes queue up until flushed
        T.mk = (id, data, objects, locale) => {
            const box = document.createElement("div");
            box.id = id; box.style.cssText = "width:1400px;height:900px;position:relative;";
            document.body.prepend(box);
            const host = makeHost(locale || "en-US");
            const st = { objects: JSON.parse(JSON.stringify(objects)), persists: [], echoes: [] };
            const dvOf = (objs) => data === "pharma" ? dv(objs)
                : dvRows(data === "regions" ? MEGA_DEMO.regions() : MEGA_DEMO.statement(data), objs);
            const v = new Visual({ element: box, host });
            st.update = (objs) => v.update({ dataViews: [dvOf(objs || st.objects)],
                viewport: { width: 1400, height: 900 }, type: 2 });
            host.persistProperties = (p) => {
                st.persists.push(JSON.parse(JSON.stringify(p)));
                for (const m of p.merge || []) {
                    st.objects[m.objectName] = { ...(st.objects[m.objectName] || {}), ...m.properties };
                }
                // the echo carries the objects as they are right after THIS write
                st.echoes.push(JSON.parse(JSON.stringify(st.objects)));
            };
            st.flush = () => { while (st.echoes.length) { st.update(st.echoes.shift()); } };
            st.update();
            st.flush();
            T[id] = st;
        };
        T.box = (id) => document.getElementById(id);
        T.buttons = (id) => [...T.box(id).querySelectorAll('[data-pnl="head"] button')].map((b, i) => ({
            i, g: b.parentElement.previousElementSibling ? b.parentElement.previousElementSibling.textContent : "",
            t: b.textContent, active: b.style.fontWeight === "600", locked: b.hasAttribute("data-pnl-locked"),
            tip: b.title || "",
        }));
        T.click = (id, group, text) => {
            const b = [...T.box(id).querySelectorAll('[data-pnl="head"] button')].find(x =>
                x.textContent === text && (!group || (x.parentElement.previousElementSibling
                    && x.parentElement.previousElementSibling.textContent === group)));
            if (!b) { return false; }
            b.click();
            return true;
        };
        T.body = (id) => {
            const root = T.box(id).querySelector(".pnl-root");
            const html = [...root.children].filter(c => c.getAttribute("data-pnl") !== "head").map(c => c.outerHTML).join("");
            let h = 0;
            for (let i = 0; i < html.length; i++) { h = (h * 31 + html.charCodeAt(i)) | 0; }
            return h;
        };
        T.state = (id) => {
            const box = T.box(id);
            const s = T[id].objects.state && T[id].objects.state.uiState;
            return {
                mega: !!box.querySelector('svg[data-pnl="mega-head"]'),
                hdr: [...box.querySelectorAll('[data-pnl="hdr-row"]')].map(r => r.textContent).join(" | "),
                scale: (box.querySelector('[data-pnl="scale-note"]') || {}).textContent || "",
                title: (box.querySelector('[data-pnl="head"]') || {}).textContent || "",
                ui: s ? JSON.parse(s) : null,
                persists: T[id].persists.length,
                groups: [...new Set(T.buttons(id).map(b => b.g))],
            };
        };
    });
    const ev = (fn, ...args) => page.evaluate(fn, args);
    const click = (id, g, t) => ev(([id, g, t]) => { const ok = window.__T.click(id, g, t); window.__T[id].flush(); return ok; }, id, g, t);
    const state = (id) => ev(([id]) => window.__T.state(id), id);

    // ---- A · template + Bars / Waterfall ---------------------------------
    await ev(() => window.__T.mk("ta", "regions", { hierarchy: { defaultLevel: 0 }, columns: { template: "T02A" } }));
    let s = await state("ta");
    check("A table view + T02A renders the mega table", s.mega && !s.hdr, s.hdr);
    await click("ta", "View", "Bars");
    s = await state("ta");
    check("A Bars with a template renders the bars view, not the mega table", !s.mega && /AC · PL/.test(s.hdr), s.hdr);
    check("A Bars: view persisted and echoed", s.ui && s.ui.view === "bars");
    check("A Bars: the title talks about the bars columns (Δ reference), not the mega columns",
        /AC, PY, PL · Δ PL/.test(s.title), s.title);
    const barsBefore = await ev(([id]) => window.__T.body(id), "ta");
    await click("ta", "Δ reference", "PY");
    s = await state("ta");
    check("A Bars with a template: Δ reference PY switches the bars to AC · PY",
        /AC · PY/.test(s.hdr) && (await ev(([id]) => window.__T.body(id), "ta")) !== barsBefore, s.hdr);
    await click("ta", "View", "Waterfall");
    s = await state("ta");
    check("A Waterfall with a template renders the waterfall view", !s.mega && /PY.*AC.*ΔPY/.test(s.hdr), s.hdr);
    await click("ta", "View", "Table");
    s = await state("ta");
    check("A back in the table view the template is there again", s.mega && !s.hdr);
    check("A the template was applied exactly once (no re-apply on view changes)",
        s.persists >= 1 && (await ev(([id]) => window.__T.ta.persists.filter(p =>
            p.merge.some(m => m.objectName === "columns")).length, "ta")) === 1);

    // ---- B · groups per view ----------------------------------------------
    await ev(() => window.__T.mk("tb", "pharma", { hierarchy: { defaultLevel: 1 } }));
    s = await state("tb");
    const hasPct = async () => (await ev(([id]) => window.__T.buttons(id).some(b => b.t === "% of revenue"), "tb"));
    check("B table view: column preset group + % of revenue", s.groups.includes("Column preset") && await hasPct());
    for (const view of ["Bars", "Waterfall"]) {
        await click("tb", "View", view);
        s = await state("tb");
        check(`B ${view}: no column preset group, no % of revenue`, !s.groups.includes("Column preset") && !(await hasPct()),
            s.groups.join("/"));
        check(`B ${view}: Δ reference and periods stay`, s.groups.includes("Δ reference") && s.groups.includes("Periods"));
    }

    // ---- C · sweep: unlocked buttons act, locked ones do not ----------------
    // states: every preset in the table (with and without MTD), bars and
    // waterfall with every block combination — data with PY/PL and FC FY
    const sweep = async (id, label) => {
        const btns = await ev(([id]) => window.__T.buttons(id), id);
        for (const b of btns) {
            if (!["Column preset", "Δ reference", "Periods"].includes(b.g)) { continue; }
            const snap = () => ev(([id]) => ({ body: window.__T.body(id), n: window.__T[id].persists.length,
                ui: JSON.stringify(window.__T[id].objects.state || null),
                refLock: window.__T.buttons(id).filter(x => x.g === "Δ reference").map(x => x.locked).join(),
                ref: (window.__T.buttons(id).find(x => x.g === "Δ reference" && x.active) || { t: "" }).t.toLowerCase() }), id);
            const before = await snap();
            await click(id, b.g, b.t);
            const after = await snap();
            if (b.locked) {
                check(`C ${label} · ${b.g} ${b.t} locked: no persist, no change`,
                    after.n === before.n && after.body === before.body && after.ui === before.ui && b.tip.length > 10);
            } else if (!b.active || b.g === "Periods") {
                // "AC vs Ref" with reference PL shows the very columns of
                // "AC·PL·ΔPL" — by design; the switch then shows in the Δ
                // reference group, which follows "AC vs Ref" and is locked
                // for the fixed preset
                // (with an MTD block both follow the reference — then the two
                // are identical until the reference changes: the one pair the
                // sweep accepts as equal)
                const ui = JSON.parse(JSON.parse(before.ui).uiState);
                const twin = { "AC·PY·ΔPY": "py", "AC·PL·ΔPL": "pl" };
                const equalPair = b.g === "Column preset" && ui.blocks.mtd
                    && ((b.t === "AC vs Ref" && (ui.preset === "acpydpy" || ui.preset === "acpldpl")
                        && ui.preset.slice(2, 4) === before.ref)
                        || (ui.preset === "acref" && twin[b.t] === before.ref));
                check(`C ${label} · ${b.g} ${b.t}: the click changes the columns (or, between equal presets, the Δ reference lock)`,
                    after.body !== before.body || equalPair || (b.g === "Column preset" && after.refLock !== before.refLock));
            }
            // restore the state for the next button
            if (after.ui !== before.ui) {
                await ev(([id, ui]) => {
                    const T = window.__T;
                    T[id].objects.state = JSON.parse(ui);
                    T[id].update(); T[id].flush();
                }, id, before.ui);
            }
        }
    };
    const setUi = (id, patch) => ev(([id, patch]) => {
        const T = window.__T;
        const cur = T[id].objects.state && T[id].objects.state.uiState ? JSON.parse(T[id].objects.state.uiState) : {};
        T[id].objects.state = { uiState: JSON.stringify({ ...cur, ...patch }) };
        T[id].update(); T[id].flush();
    }, id, patch);
    await ev(() => window.__T.mk("tc", "pharma", { hierarchy: { defaultLevel: 1 } }));
    let sweeps = 0;
    for (const preset of ["full", "acref", "dall", "acpydpy", "acpldpl", "dpct"]) {
        for (const mtd of [false, true]) {
            await setUi("tc", { view: "table", preset, blocks: { mtd, ytd: true, fy: true } });
            await sweep("tc", `table ${preset}${mtd ? " +MTD" : ""}`); sweeps++;
        }
    }
    for (const view of ["bars", "waterfall"]) {
        for (const blocks of [{ mtd: false, ytd: true, fy: true }, { mtd: true, ytd: false, fy: true },
            { mtd: false, ytd: true, fy: false }, { mtd: true, ytd: true, fy: false }]) {
            await setUi("tc", { view, blocks });
            await sweep("tc", `${view} ${JSON.stringify(blocks)}`); sweeps++;
        }
    }
    const locked = await ev(() => {
        const T = window.__T; const out = [];
        T.tc.objects.state = { uiState: JSON.stringify({ view: "table", preset: "full", blocks: { mtd: false, ytd: true, fy: true } }) };
        T.tc.update(); T.tc.flush();
        out.push(T.buttons("tc").filter(b => b.g === "Δ reference").every(b => b.locked));
        T.tc.objects.state = { uiState: JSON.stringify({ view: "table", preset: "acref", blocks: { mtd: false, ytd: true, fy: true } }) };
        T.tc.update(); T.tc.flush();
        out.push(T.buttons("tc").filter(b => b.g === "Δ reference").every(b => !b.locked));
        return out;
    });
    check("C preset AC·PY·PL·FC fixes its references → Δ reference locked with tooltip", locked[0]);
    check("C preset AC vs Ref → Δ reference live", locked[1]);
    check(`C sweep covered ${sweeps} toolbar states`, sweeps === 20);

    // ---- D · classic YTD toggle + scale follows the blocks -------------------
    await setUi("tc", { view: "table", preset: "acpldpl", blocks: { mtd: true, ytd: true, fy: true } });
    s = await state("tc");
    check("D MTD + YTD both on screen", /month/.test(s.hdr) && /year to date/.test(s.hdr), s.hdr);
    const scaleBoth = s.scale;
    await click("tc", "Periods", "YTD");
    s = await state("tc");
    check("D classic table: YTD off hides the YTD block", /month/.test(s.hdr) && !/year to date/.test(s.hdr), s.hdr);
    check("D the uniform Δ scale follows the blocks on screen", s.scale !== scaleBoth && s.scale !== "", `${scaleBoth} → ${s.scale}`);
    const ytdBtn = await ev(() => window.__T.buttons("tc").find(b => b.t === "YTD"));
    check("D YTD now reads off and is live", !ytdBtn.active && !ytdBtn.locked);
    await click("tc", "Periods", "MTD");
    s = await state("tc");
    const ytdForced = await ev(() => window.__T.buttons("tc").find(b => b.t === "YTD"));
    check("D the last block stays: YTD reappears, reads on and is locked",
        /year to date/.test(s.hdr) && ytdForced.active && ytdForced.locked, s.hdr);
    const pct = await ev(() => {
        const T = window.__T;
        T.tc.objects.state = { uiState: JSON.stringify({ view: "table", preset: "full", blocks: { mtd: true, ytd: false, fy: false } }) };
        T.tc.update(); T.tc.flush();
        return T.buttons("tc").find(b => b.t === "% of revenue");
    });
    check("D % of revenue is locked while the YTD block is off", pct && pct.locked);

    // ---- E · format pane defaults win when changed ---------------------------
    await ev(() => window.__T.mk("te", "pharma", { hierarchy: { defaultLevel: 1 } }));
    const paneUpd = (patch) => ev(([patch]) => {
        const T = window.__T;
        for (const [card, props] of Object.entries(patch)) { T.te.objects[card] = { ...(T.te.objects[card] || {}), ...props }; }
        T.te.update(); T.te.flush();
        return T.state("te");
    }, patch);
    s = await paneUpd({ columns: { preset: "dpct" } });
    check("E pane preset change applies at once (no toolbar click yet)", /ΔPY%ΔPL%/.test(s.hdr) && !/PYΔPY/.test(s.hdr), s.hdr);
    check("E … and is stored in the toolbar state", s.ui && s.ui.preset === "dpct");
    await click("te", "Unit", "kEUR");
    s = await paneUpd({ columns: { preset: "acref", reference: "py" } });
    check("E after a toolbar click the pane preset + reference still win", /AC% RevPYΔPYΔPY%/.test(s.hdr), s.hdr);
    check("E the reader's own choice (kEUR) survives the pane edit", s.ui && s.ui.unit === "k" && s.ui.preset === "acref" && s.ui.ref === "py");
    const n0 = s.persists;
    s = await paneUpd({ columns: { preset: "acref", reference: "py" } });
    check("E an unchanged pane writes nothing", s.persists === n0);
    s = await paneUpd({ numbers: { scaling: "m" } });
    check("E pane scaling change reaches the toolbar unit", s.ui && s.ui.unit === "m");
    await click("te", "Column preset", "AC·PY·PL·FC");
    s = await state("te");
    check("E the toolbar still overrides the pane afterwards", s.ui.preset === "full" && /PYΔPY/.test(s.hdr));

    // ---- F · echo guard ------------------------------------------------------
    await ev(() => window.__T.mk("tf", "pharma", { hierarchy: { defaultLevel: 1 } }));
    const f = await ev(() => {
        const T = window.__T; const st = T.tf; const out = {};
        // a report that already carries a stored toolbar state
        T.click("tf", "Unit", "kEUR"); st.flush();
        st.persists.length = 0;
        const stale = JSON.parse(JSON.stringify(st.objects));
        T.click("tf", "View", "Bars");
        st.update(stale);                                   // a resize with the old objects
        out.afterStale = T.state("tf").hdr;
        st.flush();
        out.afterEcho = T.state("tf").hdr;
        out.persists = st.persists.length;
        // two quick clicks, echoes arrive late and in order
        T.click("tf", "View", "Waterfall");
        T.click("tf", "View", "Table");
        const views = [];
        while (st.echoes.length) { st.update(st.echoes.shift()); views.push(T.state("tf").hdr.includes("AC · ") ? "bars"
            : /PL.?AC/.test(T.state("tf").hdr.split(" | ")[1] || "") ? "waterfall" : "table"); }
        out.views = views;
        out.final = T.state("tf");
        // a bookmark arrives while a click still waits for its echo (a host
        // that echoes late or never): a state the visual never wrote wins at once
        T.click("tf", "Unit", "mEUR");
        const bm = JSON.parse(JSON.stringify(st.objects));
        bm.state = { uiState: JSON.stringify({ view: "waterfall", unit: "k" }) };
        st.echoes.length = 0;
        st.update(bm);
        out.bookmark = T.state("tf").hdr;
        return out;
    });
    check("F a stale update between click and echo keeps the click (Bars stays)", /AC · PL/.test(f.afterStale), f.afterStale);
    check("F the echo confirms it without another write", /AC · PL/.test(f.afterEcho) && f.persists === 1);
    check("F two quick clicks: no flicker back to the first click while the echoes arrive",
        f.views.every(v => v === "table"), f.views.join(","));
    check("F … and the stored state ends on the second click", f.final.ui.view === "table" && !/AC · PL/.test(f.final.hdr));
    check("F a bookmark during a pending write is applied at once (waterfall)",
        /PL.?AC/.test(f.bookmark.split(" | ")[1] || ""), f.bookmark);

    // ---- G · hit targets in every locale -------------------------------------
    const hit = await ev(() => {
        const bad = []; let n = 0;
        for (const loc of ["en-US", "de-DE", "es-ES", "ja-JP"]) {
            for (const w of [1400, 760, 420]) {
                const cases = [
                    ["pharma", { hierarchy: { defaultLevel: 1 }, state: { uiState: JSON.stringify({ blocks: { mtd: true, ytd: true, fy: true } }) } }],
                    ["pharma", { state: { uiState: JSON.stringify({ view: "bars" }) } }],
                    ["regions", { hierarchy: { defaultLevel: 0 }, columns: { template: "T02A" } }],
                    ["pharma", { state: { uiState: JSON.stringify({ view: "tree", treeV: 2 }) } }],
                ];
                for (const [data, obj] of cases) {
                    for (const scroll of [0, 300]) {
                        const box = document.createElement("div");
                        box.style.cssText = `width:${w}px;height:600px;position:relative;`;
                        document.body.prepend(box);
                        const v = new Visual({ element: box, host: makeHost(loc) });
                        v.update({ dataViews: [data === "pharma" ? dv(obj) : dvRows(MEGA_DEMO.regions(), obj)],
                            viewport: { width: w, height: 600 }, type: 2 });
                        const root = box.querySelector(".pnl-root");
                        root.scrollTop = scroll; root.dispatchEvent(new Event("scroll"));
                        for (const b of box.querySelectorAll('[data-pnl="head"] button')) {
                            n++;
                            const r = b.getBoundingClientRect();
                            for (const [x, y] of [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 2, r.top + 2], [r.right - 2, r.bottom - 2]]) {
                                const el = document.elementFromPoint(x, y);
                                if (!el || !(el === b || b.contains(el))) { bad.push(`${loc} w${w} ${b.textContent}`); break; }
                            }
                            if (b.scrollWidth > b.clientWidth + 1) { bad.push(`${loc} w${w} ${b.textContent} overflows`); }
                        }
                        box.remove();
                    }
                }
            }
        }
        return { n, bad };
    });
    check(`G ${hit.n} toolbar buttons are hit-testable and fit their labels`, hit.bad.length === 0 && hit.n > 500,
        hit.bad.slice(0, 5).join("; "));

    await browser.close();
    for (const n of notes) { console.log(n); }
    if (errors > 0) { failures.push(errors + " page errors"); }
    if (failures.length) {
        console.error("\n" + failures.length + " check(s) failed:\n  ✗ " + failures.join("\n  ✗ "));
        process.exit(1);
    }
    console.log(`\n${notes.length} toolbar checks passed`);
})();
