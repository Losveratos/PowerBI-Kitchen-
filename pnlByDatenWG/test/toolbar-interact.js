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
 *      (1.2: including the value-column switches)
 *   H  1.2 value columns as independent switches (classic table): sweep over
 *      every preset × MTD — an unlocked switch changes the columns and turns
 *      the preset into "custom", a locked one changes nothing; AC + PL + FC
 *      combine freely; a preset click sets the switches again; the pane's own
 *      selection (preset custom + colAc …) wins when changed; echo guard
 *   I  1.2 template picker: only in edit mode (viewMode 1) and the table
 *      view; a pick writes template + templateApplied + switches in ONE merge,
 *      a stale update between pick and echo keeps the picked template
 *   J  1.2 mega value switches: analysed scenario · PY · PL on top of the
 *      author's switches; the last column is locked (the mega table never
 *      falls back to the classic table by a click)
 *   K  1.5 collapsible control bars (toolbar.foldable / startFolded): folded,
 *      one slim row with ☰; ☰ unfolds toolbar, legend and scale note without
 *      persisting anything; off by default
 *   L  1.6 offered views (toolbar.viewTable … viewSankey): only offered
 *      buttons, no group for a single view, a stored view the author switched
 *      off falls back to the first offered one on screen without being
 *      rewritten (and returns when switched on again), a tile view opens only
 *      with its carrier view; the Sankey toolbar; the pane gates
 *   M  1.7 "only exceptions" (toolbar group ⚡, card exceptions): the group is
 *      there by default with ⚡ off (one compact button), gone with
 *      toolbar.showExceptions = false; ⚡ greys the non-exceptions and writes
 *      uiState + the six exceptions.* properties in ONE merge; stepper,
 *      absolute threshold (from materialityAbs), reference, direction and the
 *      mode "hide" (rows leave, the footer counts them); echo guard (stale
 *      update, own mirror echo is no pane change, two quick clicks); a changed
 *      pane wins; bookmark; readers (viewMode 0) use it; a template pick leaves
 *      it untouched; tree and Sankey grey with it. Polish: ⊘ hide works in every
 *      view (bars drop rows, the waterfall folds quiet steps into "other (n)"
 *      and stays closed, tree "+n", Sankey bundles), persists through view
 *      switches, and at the default expand level folded groups without an
 *      exception leave the table (the owner's "Wegfiltern geht nicht")
 *   N  1.7 toolbar colours (card toolbarColors): own fill / label / frame of
 *      the toolbar buttons, pressed fill / label (automatic ink), ☰ and the
 *      template dropdown; empty = byte-identical; dark mode; high contrast
 *      ignores them; the start hub never takes them
 *   O  1.7 layout.maximize: off = byte-identical; on: a lower toolbar (group
 *      names beside the buttons), the mega table / table / bars scale to the
 *      tile height (×1.6 up, 9 px down, then scroll), Sankey and tree fill
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
        T.mk = (id, data, objects, locale, opts) => {
            const box = document.createElement("div");
            box.id = id; box.style.cssText = "width:1400px;height:900px;position:relative;";
            document.body.prepend(box);
            const host = makeHost(locale || "en-US");
            const st = { objects: JSON.parse(JSON.stringify(objects)), persists: [], echoes: [] };
            const dvOf = (objs) => data === "pharma" ? dv(objs)
                : dvRows(data === "regions" ? MEGA_DEMO.regions() : MEGA_DEMO.statement(data), objs);
            const v = new Visual({ element: box, host });
            st.v = v;
            const vm = opts && opts.viewMode != null ? { viewMode: opts.viewMode } : {};
            st.update = (objs) => v.update({ dataViews: [dvOf(objs || st.objects)],
                viewport: { width: 1400, height: 900 }, type: 2, ...vm });
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

    // ---- H · 1.2 value columns as independent switches (classic table) -------
    const G_VAL = "Value columns";
    await ev(() => window.__T.mk("th", "pharma", { hierarchy: { defaultLevel: 1 }, toolbar: { showValues: true } }));
    s = await state("th");
    check("H the value-column group is there in the table view", s.groups.includes(G_VAL), s.groups.join("/"));
    const valBtns = async (id) => (await ev(([id]) => window.__T.buttons(id), id)).filter(b => b.g === G_VAL);
    let vb = await valBtns("th");
    check("H only bound scenarios get a switch (pharma: AC PY PL, no FC) + Δ",
        vb.map(b => b.t).join(",") === "AC,PY,PL,ΔPL", vb.map(b => b.t).join(","));
    check("H preset AC·PY·PL·FC: AC, PY, PL and Δ read on", vb.every(b => b.active), JSON.stringify(vb));
    for (const view of ["Bars", "Waterfall"]) {
        await click("th", "View", view);
        s = await state("th");
        check(`H ${view}: no value-column group (those views build their own columns)`, !s.groups.includes(G_VAL));
    }
    await click("th", "View", "Table");
    // sweep: every preset × MTD, every switch
    let hSweeps = 0;
    for (const preset of ["full", "acref", "dall", "acpydpy", "acpldpl", "dpct", "custom"]) {
        for (const mtd of [false, true]) {
            await setUi("th", { view: "table", preset, blocks: { mtd, ytd: true, fy: true },
                vals: { ac: true, py: false, pl: true, fc: false, d: true } });
            const btns = await valBtns("th");
            for (const b of btns) {
                const snap = () => ev(([id]) => ({ body: window.__T.body(id), n: window.__T[id].persists.length,
                    ui: JSON.stringify(window.__T[id].objects.state || null) }), "th");
                const before = await snap();
                await click("th", G_VAL, b.t);
                const after = await snap();
                const ui = after.ui !== "null" ? JSON.parse(JSON.parse(after.ui).uiState) : null;
                if (b.locked) {
                    check(`H ${preset}${mtd ? "+MTD" : ""} · ${b.t} locked: no persist, no change`,
                        after.n === before.n && after.body === before.body && b.tip.length > 10);
                } else {
                    check(`H ${preset}${mtd ? "+MTD" : ""} · ${b.t}: the click changes the columns and sets preset custom`,
                        after.body !== before.body && ui && ui.preset === "custom");
                    const nb = (await valBtns("th")).find(x => x.t.replace(/^Δ.*/, "Δ") === b.t.replace(/^Δ.*/, "Δ"));
                    check(`H ${preset}${mtd ? "+MTD" : ""} · ${b.t}: the switch flips its state`, nb && nb.active === !b.active);
                }
                hSweeps++;
                if (after.ui !== before.ui) {
                    await ev(([ui]) => { const T = window.__T; T.th.objects.state = JSON.parse(ui); T.th.update(); T.th.flush(); }, before.ui);
                }
            }
        }
    }
    check(`H sweep covered ${hSweeps} value switches in 14 states`, hSweeps >= 14 * 4);
    // the last column cannot be switched off
    await setUi("th", { view: "table", preset: "custom", blocks: { mtd: false, ytd: true, fy: false },
        vals: { ac: true, py: false, pl: false, fc: false, d: false } });
    vb = await valBtns("th");
    check("H AC alone: the AC switch is locked (the table keeps one column)", vb.find(b => b.t === "AC").locked);
    // a preset click sets all switches again
    await click("th", "Column preset", "AC·PY·ΔPY");
    vb = await valBtns("th");
    check("H preset AC·PY·ΔPY sets the switches: AC PY Δ on, PL off",
        vb.map(b => (b.active ? "1" : "0")).join("") === "1101" && /ΔPY/.test(vb[3].t), JSON.stringify(vb.map(b => b.t + b.active)));
    // from a fixed-reference preset the Δ stays on its reference
    await click("th", G_VAL, "PL");
    s = await state("th");
    check("H switching PL on from AC·PY·ΔPY keeps ΔPY (reference handed over)",
        s.ui.preset === "custom" && s.ui.ref === "py" && /PYPLΔPYΔPY%/.test(s.hdr.replace(/\s/g, "")), s.hdr);
    // AC + PL + FC on data with FC: free combination
    await ev(() => window.__T.mk("th2", "regions", { hierarchy: { defaultLevel: 0 }, toolbar: { showValues: true } }));
    await click("th2", G_VAL, "PY");
    await click("th2", G_VAL, "FC");
    s = await state("th2");
    check("H AC + PL + FC (PY off) combine in one table, Δ against the Δ reference",
        /AC.*PL.*FC.*ΔPL.*ΔPL%/.test(s.hdr) && !/\bPY\b/.test(s.hdr.split(" | ")[1] || ""), s.hdr);
    check("H the combination is stored in the toolbar state", s.ui.vals && s.ui.vals.fc === true && s.ui.vals.py === false);
    await click("th2", "Δ reference", "PY");
    s = await state("th2");
    check("H the Δ reference stays its own choice (ΔPY next to AC · PL · FC)", /FC.*ΔPY/.test(s.hdr), s.hdr);
    // pane: preset custom with the own selection
    await ev(() => window.__T.mk("th3", "regions", { hierarchy: { defaultLevel: 0 },
        columns: { preset: "custom", colPy: false, colFc: true, colDelta: false } }));
    s = await state("th3");
    check("H pane preset custom + colPy off + colFc on + colDelta off: AC · PL · FC, no Δ",
        /AC.*PL.*FC/.test(s.hdr) && !/Δ/.test(s.hdr.split(" | ")[1] || ""), s.hdr);
    s = await ev(() => { const T = window.__T; T.th3.objects.columns.colDelta = true; T.th3.update(); T.th3.flush(); return T.state("th3"); });
    check("H a changed pane switch wins at once", /ΔPL/.test(s.hdr), s.hdr);
    // echo guard: a stale update between click and echo keeps the switch
    const hf = await ev(() => {
        const T = window.__T; const st = T.th2;
        st.flush();
        const stale = JSON.parse(JSON.stringify(st.objects));
        T.click("th2", "Value columns", "PY");
        st.update(stale);
        const mid = T.buttons("th2").find(b => b.g === "Value columns" && b.t === "PY").active;
        st.flush();
        return { mid, end: T.buttons("th2").find(b => b.g === "Value columns" && b.t === "PY").active };
    });
    check("H echo guard: a stale update keeps the clicked switch", hf.mid === true && hf.end === true, JSON.stringify(hf));

    // ---- I · 1.2 template picker (edit mode) ------------------------------------
    await ev(() => window.__T.mk("ti0", "regions", { hierarchy: { defaultLevel: 0 } }));
    check("I no template picker without the host saying edit mode",
        !(await ev(() => !!window.__T.box("ti0").querySelector('[data-pnl="tb-template"]'))));
    await ev(() => window.__T.mk("ti1", "regions", { hierarchy: { defaultLevel: 0 } }, "en-US", { viewMode: 0 }));
    check("I no template picker for readers (viewMode 0)",
        !(await ev(() => !!window.__T.box("ti1").querySelector('[data-pnl="tb-template"]'))));
    await ev(() => window.__T.mk("ti", "regions", { hierarchy: { defaultLevel: 0 } }, "en-US", { viewMode: 1 }));
    const pick = await ev(() => {
        const T = window.__T; const st = T.ti; const out = {};
        const sel = () => T.box("ti").querySelector('[data-pnl="tb-template"]');
        out.there = !!sel();
        out.n = sel() ? sel().options.length : 0;
        out.cur = sel() ? sel().value : "";
        const stale = JSON.parse(JSON.stringify(st.objects));
        st.persists.length = 0;
        sel().value = "T03A"; sel().dispatchEvent(new Event("change"));
        out.immediate = T.state("ti").mega;
        out.merges = st.persists.length;
        const m = st.persists[0] && st.persists[0].merge.find(x => x.objectName === "columns");
        out.props = m ? m.properties : {};
        out.statement = !!(st.persists[0] && st.persists[0].merge.find(x => x.objectName === "statement"));
        st.update(stale);                                  // stale: still template off
        out.afterStale = { mega: T.state("ti").mega, sel: sel() ? sel().value : "" };
        st.flush();
        out.afterEcho = { mega: T.state("ti").mega, sel: sel() ? sel().value : "", persists: st.persists.length };
        return out;
    });
    check("I edit mode: the template picker is there, with every template (1.7: 20 with T05A / T05B)", pick.there && pick.n === 20 && pick.cur === "off", JSON.stringify(pick));
    check("I 1.7 a P&L template leaves statement.stockMode alone while it is not allStock (no statement object in the merge)",
        pick.merges === 1 && pick.statement === false, JSON.stringify(pick.statement));
    check("I a pick renders the template at once", pick.immediate);
    check("I one merge carries template + templateApplied + the switches",
        pick.merges === 1 && pick.props.template === "T03A" && pick.props.templateApplied === "T03A" && pick.props.showPY === true,
        JSON.stringify(pick.props));
    check("I a stale update keeps the picked template (picker and table)", pick.afterStale.mega && pick.afterStale.sel === "T03A",
        JSON.stringify(pick.afterStale));
    check("I after the echo: T03A, no second write", pick.afterEcho.mega && pick.afterEcho.sel === "T03A" && pick.afterEcho.persists === 1,
        JSON.stringify(pick.afterEcho));
    const off = await ev(() => {
        const T = window.__T; const sel = T.box("ti").querySelector('[data-pnl="tb-template"]');
        sel.value = "off"; sel.dispatchEvent(new Event("change")); T.ti.flush();
        const a = T.state("ti").mega;
        T.click("ti", "View", "Bars"); T.ti.flush();
        return { mega: a, inBars: !!T.box("ti").querySelector('[data-pnl="tb-template"]') };
    });
    check("I picking off returns to the classic table", off.mega === false);
    check("I the picker belongs to the table view (not in Bars)", off.inBars === false);

    // ---- J · 1.2 mega value switches --------------------------------------------
    await ev(() => window.__T.mk("tj", "regions", { hierarchy: { defaultLevel: 0 }, toolbar: { showValues: true },
        columns: { template: "T02A", templateApplied: "T02A", showPL: true, showMinuend: true, dPlBar: true, dPlPin: true } }));
    let jb = await valBtns("tj");
    check("J mega: switches for the analysed scenario, PY and PL", jb.map(b => b.t).join(",") === "AC,PY,PL", jb.map(b => b.t).join(","));
    check("J they show the author's switches (AC, PL on; PY off)", jb.map(b => (b.active ? 1 : 0)).join("") === "101");
    const jBefore = await ev(() => window.__T.body("tj"));
    await click("tj", G_VAL, "PY");
    s = await state("tj");
    check("J PY on adds the PY value column to the mega table", s.mega && s.ui.megaVals && s.ui.megaVals.py === true
        && (await ev(() => window.__T.body("tj"))) !== jBefore);
    await ev(() => window.__T.mk("tj2", "regions", { hierarchy: { defaultLevel: 0 }, toolbar: { showValues: true },
        columns: { showMinuend: true } }));
    jb = await valBtns("tj2");
    check("J the last mega column is locked (no silent fall back to the classic table)",
        jb.find(b => b.t === "AC").locked && jb.find(b => b.t === "AC").active);
    s = await ev(() => { const T = window.__T; T.tj.objects.columns.showPY = false; T.tj.objects.columns.showMinuend = false;
        T.tj.update(); T.tj.flush(); return T.state("tj"); });
    check("J an author change of the mega value switches ends the reader's choice", s.ui.megaVals === null);

    // ---- K · 1.5 collapsible control bars (toolbar.foldable) ---------------------
    const fold = (id) => page.evaluate((id) => {
        const b = __T.box(id); const head = b.querySelector('[data-pnl="head"]');
        return {
            folded: !!b.querySelector('[data-pnl="tb-folded"]'),
            burger: !!b.querySelector('[data-pnl="tb-burger"]'),
            first: head && head.querySelector("button") ? head.querySelector("button").getAttribute("data-pnl") : null,
            btns: head ? head.querySelectorAll("button").length : 0,
            legend: head ? /AC actual/.test(head.textContent) : false,
            note: !!b.querySelector('[data-pnl="scale-note"]'),
            headH: head ? Math.round(head.getBoundingClientRect().height) : 0,
            // the control part of the head: from the row of the ☰ button down (the title stays)
            ctlH: (() => {
                const bt = b.querySelector('[data-pnl="tb-burger"]');
                return head && bt ? Math.round(head.getBoundingClientRect().bottom - bt.parentElement.getBoundingClientRect().top) : 0;
            })(),
            persists: __T[id].persists.length,
        };
    }, id);
    await page.evaluate(() => { __T.mk("tk0", "pharma", { toolbar: { show: true } }); });
    let k = await fold("tk0");
    check("K default: no ☰, the head as before", !k.burger && !k.folded && k.btns > 5 && k.legend, JSON.stringify(k));
    await page.evaluate(() => { __T.mk("tk", "pharma", { toolbar: { show: true, foldable: true } }); });
    k = await fold("tk");
    check("K foldable (start folded by default): one slim row with ☰ only, no legend, no scale note",
        k.folded && k.btns === 1 && k.first === "tb-burger" && !k.legend && !k.note, JSON.stringify(k));
    const hFolded = k.ctlH;
    await page.evaluate(() => { __T.box("tk").querySelector('[data-pnl="tb-burger"]').click(); });
    k = await fold("tk");
    check("K ☰ unfolds: toolbar with ☰ first, legend and scale note back, nothing persisted",
        !k.folded && k.first === "tb-burger" && k.btns > 5 && k.legend && k.note && k.persists === 0, JSON.stringify(k));
    check("K folded, the control part is at most a third of the unfolded one (title unchanged)", hFolded > 0 && hFolded * 3 <= k.ctlH,
        `${hFolded} / ${k.ctlH}`);
    await page.evaluate(() => { __T.box("tk").querySelector('[data-pnl="tb-burger"]').click(); });
    k = await fold("tk");
    check("K ☰ folds again", k.folded && k.btns === 1, JSON.stringify(k));
    await page.evaluate(() => { __T.mk("tk2", "pharma", { toolbar: { show: true, foldable: true, startFolded: false } }); });
    k = await fold("tk2");
    check("K startFolded off: opens unfolded, ☰ leads the toolbar", !k.folded && k.first === "tb-burger" && k.legend, JSON.stringify(k));
    await page.evaluate(() => { __T.mk("tk3", "pharma", { toolbar: { show: false, showLegend: true, foldable: true, startFolded: false } }); });
    k = await fold("tk3");
    check("K toolbar off, legend on: ☰ leads the legend row", !k.folded && k.burger && k.legend && k.btns === 1, JSON.stringify(k));
    await page.evaluate(() => { ["tk0", "tk", "tk2", "tk3"].forEach(id => __T.box(id).remove()); });

    // ---- L · 1.6 offered views (toolbar.viewTable … viewSankey) + the Sankey toolbar --------
    const views = (id) => page.evaluate((id) => {
        const b = __T.box(id);
        const head = [...b.querySelectorAll('[data-pnl="head"] div')].find(d => d.textContent === "View"
            && d.style.textTransform === "uppercase");
        const btns = head ? [...head.parentElement.querySelectorAll("button")] : [];
        const s = __T[id].objects.state && __T[id].objects.state.uiState;
        return {
            btns: btns.map(x => x.textContent),
            active: (btns.find(x => x.getAttribute("aria-pressed") === "true") || { textContent: "" }).textContent,
            sankey: !!b.querySelector('svg[data-pnl="sankey"]'),
            zoom: !!b.querySelector('[data-pnl="zoom-center"]'),
            table: [...b.querySelectorAll("div")].filter(x => x.style.display === "table-row").length,
            ui: s ? JSON.parse(s) : null,
            persists: __T[id].persists.length,
            groups: [...new Set(__T.buttons(id).map(x => x.g))],
        };
    }, id);
    await page.evaluate(() => { __T.mk("tl", "pharma", {}); });
    let L = await views("tl");
    check("L default: all five views offered, Sankey last", L.btns.join(",") === "Table,Bars,Waterfall,Tree,Sankey", L.btns.join(","));
    await click("tl", "View", "Sankey");
    L = await views("tl");
    check("L Sankey: the click is persisted and echoed, the flow is on screen",
        L.sankey && L.active === "Sankey" && L.ui && L.ui.view === "sankey", JSON.stringify([L.sankey, L.active, L.ui && L.ui.view]));
    check("L Sankey toolbar: view · Δ reference · unit · density · levels — no preset, period, option or card groups",
        ["View", "Δ reference", "Unit", "Density", "Expand to level"].every(g => L.groups.indexOf(g) >= 0)
        && ["Column preset", "Periods", "Options", "Cards"].every(g => L.groups.indexOf(g) < 0), L.groups.join(" | "));
    const before = L.persists;
    // the author switches the Sankey off in the pane: the reader's state stays, the screen falls back
    await page.evaluate(() => { const st = __T.tl; st.objects.toolbar = { viewSankey: false }; st.update(); st.flush(); });
    L = await views("tl");
    check("L viewSankey off: the button disappears, the first offered view (table) is shown",
        !L.sankey && L.table > 10 && L.btns.join(",") === "Table,Bars,Waterfall,Tree" && L.active === "Table",
        JSON.stringify([L.sankey, L.table, L.btns, L.active]));
    check("L the fallback rewrites nothing: stored view still sankey, no persist",
        L.ui.view === "sankey" && L.persists === before, JSON.stringify([L.ui.view, L.persists, before]));
    await click("tl", "Unit", "mEUR");
    L = await views("tl");
    check("L a toolbar click in the fallback keeps the stored view (unit written, view untouched)",
        L.ui.view === "sankey" && L.ui.unit === "m" && L.persists === before + 1, JSON.stringify(L.ui));
    await page.evaluate(() => { const st = __T.tl; st.objects.toolbar = { viewSankey: true }; st.update(); st.flush(); });
    L = await views("tl");
    check("L the author switches the Sankey back on: the reader's Sankey returns, with the unit chosen meanwhile",
        L.sankey && L.active === "Sankey" && L.ui.unit === "m", JSON.stringify([L.sankey, L.active, L.ui.unit]));
    await page.evaluate(() => { const st = __T.tl; st.objects.toolbar = { viewTable: false, viewBars: false, viewWaterfall: false, viewTree: false }; st.update(); st.flush(); });
    L = await views("tl");
    check("L a single offered view: no view group at all, the view itself stays",
        L.sankey && L.btns.length === 0 && L.groups.indexOf("View") < 0, L.groups.join(" | "));
    // tile view only with its carrier view
    await page.evaluate(() => { __T.mk("tlz", "pharma", { toolbar: { viewTree: false },
        state: { uiState: JSON.stringify({ view: "tree", treeV: 2, treeZoom: "F_EBITDA" }) } }); });
    L = await views("tlz");
    check("L a stored tile view stays closed while its carrier view (tree) is switched off",
        !L.zoom && L.table > 10 && L.ui.treeZoom === "F_EBITDA", JSON.stringify([L.zoom, L.table, L.ui && L.ui.treeZoom]));
    await page.evaluate(() => { const st = __T.tlz; st.objects.toolbar = { viewTree: true }; st.update(); st.flush(); });
    L = await views("tlz");
    check("L the tree offered again: the stored tile view opens", L.zoom, JSON.stringify(L));
    // the pane: the five switches follow the view group (and the toolbar)
    const pane = await page.evaluate(() => {
        // the slices on screen (the card's revert descriptors list hidden ones too)
        const slices = (v) => v.getFormattingModel().cards.flatMap(c => c.groups.flatMap(g => (g.slices || [])
            .map(sl => ((sl.control && sl.control.properties && sl.control.properties.descriptor) || {}).propertyName)));
        const has = (id) => {
            const m = slices(__T[id].v);
            return ["viewTable", "viewBars", "viewWaterfall", "viewTree", "viewSankey"].map(p => m.indexOf(p) >= 0);
        };
        __T.mk("tlp", "pharma", {});
        const on = has("tlp");
        __T.mk("tlp2", "pharma", { toolbar: { showView: false } });
        const off = has("tlp2");
        __T.mk("tlp3", "pharma", { state: { uiState: JSON.stringify({ view: "sankey", treeV: 2 }) } });
        const m3 = slices(__T.tlp3.v);
        return { on, off, treeGroup: m3.indexOf("treeRoot") >= 0, mega: m3.indexOf("template") >= 0 };
    });
    check("L pane: the five view switches show with the view group …", pane.on.every(Boolean), JSON.stringify(pane.on));
    check("L pane: … and hide with it (values kept)", pane.off.every(x => !x), JSON.stringify(pane.off));
    check("L pane: in the Sankey the tree start settings (root, depth) are offered, the mega group is not",
        pane.treeGroup && !pane.mega, JSON.stringify(pane));
    await page.evaluate(() => { ["tl", "tlz", "tlp", "tlp2", "tlp3"].forEach(id => __T.box(id).remove()); });

    // ---- M · 1.7 "only exceptions" (toolbar ⚡ / card exceptions) -----------------
    await ev(() => window.__T.mk("tm", "pharma", { hierarchy: { defaultLevel: 0 } }));
    const excState = (id) => ev(([id]) => {
        const T = window.__T; const box = T.box(id);
        const g = box.querySelector('[data-pnl="tb-exc-group"]');
        const ui = T.state(id).ui;
        return {
            group: !!g, label: g ? g.firstElementChild.textContent : "",
            btns: g ? [...g.querySelectorAll("button")].map(b => ({ t: b.textContent, on: b.getAttribute("aria-pressed") === "true",
                k: b.getAttribute("data-pnl") || "", locked: b.hasAttribute("data-pnl-locked"), tip: b.title })) : [],
            pct: g && g.querySelector('[data-pnl="tb-exc-pct"]') ? g.querySelector('[data-pnl="tb-exc-pct"]').textContent : "",
            rows: box.querySelectorAll("[data-pnl-row]").length,
            grey: box.querySelectorAll('[data-pnl-row][data-pnl-exc="0"]').length,
            colour: box.querySelectorAll('[data-pnl-row][data-pnl-exc="1"]').length,
            note: (box.querySelector('[data-pnl="exc-note"]') || {}).textContent || "",
            exc: ui ? ui.exc : null, pane: T[id].objects.exceptions || null, persists: T[id].persists.length,
            lastMerge: T[id].persists.length ? T[id].persists[T[id].persists.length - 1].merge.map(m => m.objectName) : [],
        };
    }, id);
    const excClick = (id, key) => ev(([id, key]) => {
        const b = window.__T.box(id).querySelector(`[data-pnl="${key}"]`);
        if (!b) { return false; }
        b.click(); window.__T[id].flush(); return true;
    }, id, key);
    let m = await excState("tm");
    check("M the group Exceptions is offered by default, ⚡ off and compact (one button, no controls)",
        m.group && m.label === "Exceptions" && m.btns.length === 1 && m.btns[0].t === "⚡" && !m.btns[0].on && m.grey === 0,
        JSON.stringify(m.btns));
    check("M ⚡ off: no row carries an exception mark, no footer note (the table renders as before)",
        m.grey === 0 && m.colour === 0 && m.note === "");
    check("M the ⚡ tooltip states the rule (threshold, reference, any visible block)",
        /\|Δ%\| ≥ 5 %/.test(m.btns[0].tip) && /vs PY · PL/.test(m.btns[0].tip) && /period block/.test(m.btns[0].tip), m.btns[0].tip);
    const p0 = m.persists;
    await excClick("tm", "tb-exc");
    m = await excState("tm");
    check("M ⚡ on: the button reads “⚡ Only exceptions”, the controls appear (stepper, reference, direction, mode)",
        m.btns[0].on && m.btns[0].t === "⚡ Only exceptions" && ["tb-exc-less", "tb-exc-more", "tb-exc-ref-auto", "tb-exc-ref-py",
            "tb-exc-ref-pl", "tb-exc-up", "tb-exc-down", "tb-exc-both", "tb-exc-gray", "tb-exc-hide"].every(k => m.btns.some(b => b.k === k))
        && m.pct === "|Δ%| ≥ 5 %", JSON.stringify(m.btns.map(b => b.k)) + " " + m.pct);
    check("M ⚡ on: rows split into exceptions (colour) and the rest (grey), the footer names the rule",
        m.grey > 3 && m.colour > 3 && /Colour only for exceptions: \|Δ%\| ≥ 5 % vs PY · PL/.test(m.note), `${m.grey}/${m.colour} ${m.note}`);
    check("M one click = ONE merge: state.uiState + the six exceptions.* properties (pane mirror)",
        m.persists === p0 + 1 && m.lastMerge.join() === "state,exceptions" && m.pane && m.pane.enabled === true
        && m.pane.thresholdPct === 5 && m.pane.thresholdAbs === 0 && m.pane.reference === "auto" && m.pane.direction === "both" && m.pane.mode === "gray",
        JSON.stringify([m.lastMerge, m.pane]));
    check("M the stored toolbar state carries the same six values", m.exc && m.exc.on === true && m.exc.pct === 5 && m.exc.mode === "gray",
        JSON.stringify(m.exc));
    // the colours: a grey row draws its Δ bar / pin in the soft ink, an exception keeps good / bad
    const ink = await ev(() => {
        const box = window.__T.box("tm");
        const fills = (sel) => [...box.querySelectorAll(sel)].flatMap(r => [...r.querySelectorAll("svg rect, svg circle")]
            .map(e => e.getAttribute("fill"))).filter(f => f && f.startsWith("#") && f !== "#FFF" && f !== "#404040" && f !== "#B3B3B3");
        return { grey: [...new Set(fills('[data-pnl-row][data-pnl-exc="0"]'))], colour: [...new Set(fills('[data-pnl-row][data-pnl-exc="1"]'))] };
    });
    check("M grey rows paint their Δ marks in the soft ink only; exception rows in the variance colours",
        ink.grey.every(c => c === "#8A8886") && ink.colour.some(c => c === "#0E8585" || c === "#E02B1D"), JSON.stringify(ink));
    // stepper: 5 → 10 → 5; the pane mirror follows
    const g5 = m.grey;
    await excClick("tm", "tb-exc-more");
    m = await excState("tm");
    check("M + raises the threshold to the next step (10 %), more rows turn grey, the pane mirror follows",
        m.pct === "|Δ%| ≥ 10 %" && m.exc.pct === 10 && m.pane.thresholdPct === 10 && m.grey > g5, `${m.pct} ${m.grey}>${g5}`);
    await excClick("tm", "tb-exc-less");
    m = await excState("tm");
    check("M − lowers it again (5 %)", m.pct === "|Δ%| ≥ 5 %" && m.grey === g5);
    // direction ▲: only Δ above the reference stays — in display orientation, not the rating
    await excClick("tm", "tb-exc-up");
    const dirUp = await ev(() => {
        const box = window.__T.box("tm");
        // COGS (a cost shown positive) grew vs PY: Δ > 0 although unfavourable — an exception with ▲
        const row = (id) => box.querySelector(`[data-pnl-row="${id}"]`);
        const ids = [...box.querySelectorAll("[data-pnl-row]")].map(r => r.getAttribute("data-pnl-row"));
        const cogs = ids.find(i => /cost of goods/i.test(i));
        return { cogs: cogs ? row(cogs).getAttribute("data-pnl-exc") : null, n: box.querySelectorAll('[data-pnl-row][data-pnl-exc="1"]').length };
    });
    m = await excState("tm");
    check("M ▲ keeps only Δ above the reference — a cost that grew (unfavourable, Δ > 0) is an exception",
        m.exc.dir === "up" && m.pane.direction === "up" && dirUp.cogs === "1" && dirUp.n < m.rows, JSON.stringify(dirUp));
    await excClick("tm", "tb-exc-down");
    m = await excState("tm");
    const downCogs = await ev(() => { const r = [...window.__T.box("tm").querySelectorAll("[data-pnl-row]")].find(x => /cost of goods/i.test(x.getAttribute("data-pnl-row")));
        return r ? r.getAttribute("data-pnl-exc") : null; });
    check("M ▼ keeps only Δ below the reference (the grown cost turns grey)", m.exc.dir === "down" && downCogs === "0", downCogs);
    await excClick("tm", "tb-exc-both");
    // reference: PY fixed — the note names it, the Auto tooltip names what auto stands for
    m = await excState("tm");
    const autoTip = (m.btns.find(b => b.k === "tb-exc-ref-auto") || {}).tip || "";
    await excClick("tm", "tb-exc-ref-py");
    m = await excState("tm");
    check("M reference PY: stored, mirrored, the note says “vs PY”; the Auto tooltip names the view's references",
        m.exc.ref === "py" && m.pane.reference === "py" && / vs PY$/.test(m.note) && /PY · PL/.test(autoTip), `${m.note} | ${autoTip}`);
    await excClick("tm", "tb-exc-ref-auto");
    // mode hide: detail rows leave, totals stay, the footer counts them
    const rowsBefore = (await excState("tm")).rows;
    await excClick("tm", "tb-exc-hide");
    m = await excState("tm");
    const hid = await ev(() => {
        const box = window.__T.box("tm");
        const ids = [...box.querySelectorAll("[data-pnl-row]")].map(r => r.getAttribute("data-pnl-row"));
        return { totals: ["F_GROSSPROFIT", "F_EBITDA", "F_EBIT", "F_NETINCOME"].every(i => ids.includes(i)) };
    });
    const nHidden = Number((m.note.match(/(\d+) rows below the threshold hidden/) || [])[1] || 0);
    check("M ⊘ hide: detail rows below the threshold leave the table, the footer counts exactly them",
        m.exc.mode === "hide" && m.pane.mode === "hide" && m.rows < rowsBefore && nHidden === rowsBefore - m.rows, `${rowsBefore}→${m.rows} note ${m.note}`);
    check("M ⊘ hide: totals and result rows always stay (grey when no exception themselves)", hid.totals && m.grey > 0);
    // polish: hide works in every view — bars drop rows, the waterfall folds the quiet steps of a
    // section into one "other (n)" step (the cascade stays closed), tree and Sankey fold / bundle
    const perView = await ev(() => {
        const T = window.__T; const box = T.box("tm"); const out = {};
        const note = () => (box.querySelector('[data-pnl="exc-note"]') || {}).textContent || "";
        for (const vw of ["Bars", "Waterfall", "Tree", "Sankey"]) {
            T.click("tm", "View", vw); T.tm.flush();
            const ui = T.state("tm").ui;
            out[vw] = { note: note(), rows: box.querySelectorAll("[data-pnl-row]").length,
                rest: [...box.querySelectorAll("[data-pnl-rest]")].map(r => ({ n: +r.getAttribute("data-pnl-rest"), name: (r.querySelector("span") || r).textContent })),
                treeRest: box.querySelectorAll('[data-pnl="tree-rest"]').length, mode: ui.exc.mode,
                hideOn: box.querySelector('[data-pnl="tb-exc-hide"]').getAttribute("aria-pressed") };
            if (vw === "Waterfall") {
                // closure: in the row waterfall a parent floats with its value, its (folded) children
                // cascade inside it — the last child ends exactly where the parent ends
                const v = T.tm.v; const segs = v.wfSegs.get("ytd:ac"); const plan = v.excPlan();
                let n = 0; let bad = 0;
                for (const [pid, kids] of plan.kids) {
                    const ps = segs.get(pid); const ks = kids.map(k => segs.get(k.row.id)).filter(Boolean);
                    if (!ps || ks.length === 0) { continue; }
                    n++;
                    if (Math.abs(ks[0].s - ps.s) > 1e-6 || Math.abs(ks[ks.length - 1].e - ps.e) > 1e-6) { bad++; }
                }
                out.close = { n, bad };
            }
        }
        T.click("tm", "View", "Table"); T.tm.flush();
        out.back = { mode: T.state("tm").ui.exc.mode, pane: T.tm.objects.exceptions.mode,
            hideOn: box.querySelector('[data-pnl="tb-exc-hide"]').getAttribute("aria-pressed") };
        return out;
    });
    check("M ⊘ hide in the bars view: detail rows leave, the footer counts them",
        /\d+ rows? below the threshold hidden/.test(perView.Bars.note) && perView.Bars.rest.length === 0, perView.Bars.note);
    check("M ⊘ hide in the waterfall: the quiet steps of a section become ONE “other (n)” row each, the footer counts them",
        perView.Waterfall.rest.length > 0 && perView.Waterfall.rest.every(r => r.n >= 2 && /other \(\d+\)/.test(r.name))
        && /\d+ steps below the threshold combined/.test(perView.Waterfall.note), JSON.stringify(perView.Waterfall.rest) + " " + perView.Waterfall.note);
    check("M ⊘ hide in the waterfall: the cascade stays closed (every folded parent ends where its last step ends)",
        perView.close.n > 0 && perView.close.bad === 0, JSON.stringify(perView.close));
    check("M ⊘ hide in the tree and the Sankey: “+n” cards, bundled streams, a footer count each",
        perView.Tree.treeRest > 0 && /nodes? below the threshold folded/.test(perView.Tree.note)
        && /streams below the threshold bundled|^⚡/.test(perView.Sankey.note), perView.Tree.note + " | " + perView.Sankey.note);
    check("M ⊘ hide persists through every view (uiState + pane mirror, the button stays pressed)",
        ["Bars", "Waterfall", "Tree", "Sankey"].every(v => perView[v].mode === "hide" && perView[v].hideOn === "true")
        && perView.back.mode === "hide" && perView.back.pane === "hide" && perView.back.hideOn === "true", JSON.stringify(perView.back));
    // the owner's report: at the default expand level (folded level groups) nothing left the
    // table, because only leaf accounts could go — folded groups without an exception go now
    await ev(() => window.__T.mk("tmd", "regions", { exceptions: { enabled: true, mode: "hide", thresholdPct: 20 } }));
    const dl = await ev(() => {
        const box = window.__T.box("tmd");
        return { rows: [...box.querySelectorAll("[data-pnl-row]")].map(r => r.getAttribute("data-pnl-row")),
            note: (box.querySelector('[data-pnl="exc-note"]') || {}).textContent || "", collapsed: window.__T.state("tmd").ui ? null : null };
    });
    check("M ⊘ hide at the default expand level: folded groups without an exception below leave the table, totals stay",
        /\d+ rows? below the threshold hidden/.test(dl.note) && dl.rows.includes("L:World") && !dl.rows.some(r => /Europe:|Americas:/.test(r)),
        dl.note + " " + dl.rows.join(","));
    await click("tm", "View", "Table");
    await excClick("tm", "tb-exc-gray");
    // the absolute threshold — offered with the value of columns.materialityAbs
    await ev(() => window.__T.mk("tma", "pharma", { hierarchy: { defaultLevel: 0 }, columns: { materialityAbs: 30 },
        exceptions: { enabled: true, thresholdPct: 100 } }));
    m = await excState("tma");
    const absBtn = m.btns.find(b => b.k === "tb-exc-abs");
    check("M absolute threshold: offered from Materiality from (absolute), off until clicked",
        absBtn && absBtn.t === "|Δ| ≥ 30" && !absBtn.on, JSON.stringify(absBtn));
    const gAbs0 = m.grey;
    await excClick("tma", "tb-exc-abs");
    m = await excState("tma");
    check("M |Δ| ≥ 30 on: one of both thresholds is enough — fewer grey rows, thresholdAbs mirrored",
        m.exc.abs === 30 && m.pane.thresholdAbs === 30 && m.grey < gAbs0 && /or \|Δ\| ≥ 30/.test(m.note), `${gAbs0}→${m.grey} ${m.note}`);
    // echo guard: a stale update between click and echo, two quick clicks, the own mirror echo
    await ev(() => window.__T.mk("tme", "pharma", { hierarchy: { defaultLevel: 0 } }));
    const eg = await ev(() => {
        const T = window.__T; const st = T.tme; const out = {};
        const btn = (k) => T.box("tme").querySelector(`[data-pnl="${k}"]`);
        st.persists.length = 0;
        const stale = JSON.parse(JSON.stringify(st.objects));
        btn("tb-exc").click();
        st.update(stale);
        out.afterStale = btn("tb-exc").getAttribute("aria-pressed");
        st.flush();
        out.afterEcho = btn("tb-exc").getAttribute("aria-pressed");
        out.persists = st.persists.length;
        // two quick clicks, the echoes come late: no flicker back to 5 %
        btn("tb-exc-more").click();
        btn("tb-exc-more").click();
        const seen = [];
        while (st.echoes.length) { st.update(st.echoes.shift()); seen.push(T.box("tme").querySelector('[data-pnl="tb-exc-pct"]').textContent); }
        out.seen = seen;
        out.persists2 = st.persists.length;
        return out;
    });
    check("M a stale update between ⚡ and its echo keeps ⚡ on; the echo (uiState + mirror) writes nothing more",
        eg.afterStale === "true" && eg.afterEcho === "true" && eg.persists === 1, JSON.stringify(eg));
    check("M two quick + clicks: the mirror echo of the first is no pane change — no flicker back, ends on 15 %",
        eg.seen.every(t => t === "|Δ%| ≥ 15 %") && eg.persists2 === 3, JSON.stringify(eg.seen) + " " + eg.persists2);
    // a changed pane wins (like every pane default) and is stored in the toolbar state
    const pw = await ev(() => {
        const T = window.__T; const st = T.tme;
        st.objects.exceptions = { ...(st.objects.exceptions || {}), thresholdPct: 20, mode: "hide" };
        st.update(); st.flush();
        return { ui: T.state("tme").ui.exc, pct: T.box("tme").querySelector('[data-pnl="tb-exc-pct"]').textContent };
    });
    check("M a changed pane (thresholdPct 20, mode hide) wins over the toolbar and is stored",
        pw.ui.pct === 20 && pw.ui.mode === "hide" && pw.pct === "|Δ%| ≥ 20 %", JSON.stringify(pw));
    // bookmark: a foreign uiState with ⚡ applies at once
    const bm = await ev(() => {
        const T = window.__T;
        T.mk("tmb", "pharma", { hierarchy: { defaultLevel: 0 } });
        const st = T.tmb;
        const objs = JSON.parse(JSON.stringify(st.objects));
        objs.state = { uiState: JSON.stringify({ exc: { on: true, pct: 10, dir: "down" } }) };
        st.update(objs);
        const box = T.box("tmb");
        return { on: box.querySelector('[data-pnl="tb-exc"]').getAttribute("aria-pressed"),
            pct: box.querySelector('[data-pnl="tb-exc-pct"]').textContent,
            down: box.querySelector('[data-pnl="tb-exc-down"]').getAttribute("aria-pressed"),
            mode: box.querySelector('[data-pnl="tb-exc-gray"]').getAttribute("aria-pressed") };
    });
    check("M a bookmark (partial exc state) applies at once, missing fields from the pane",
        bm.on === "true" && bm.pct === "|Δ%| ≥ 10 %" && bm.down === "true" && bm.mode === "true", JSON.stringify(bm));
    // toolbar.showExceptions = false: no group; the stored ⚡ still renders (export, bookmarks)
    await ev(() => window.__T.mk("tmo", "pharma", { hierarchy: { defaultLevel: 0 }, toolbar: { showExceptions: false },
        exceptions: { enabled: true } }));
    m = await excState("tmo");
    check("M toolbar.showExceptions = false: the group is gone, the author's ⚡ still greys",
        !m.group && m.grey > 0 && /Colour only/.test(m.note), JSON.stringify([m.group, m.grey]));
    // readers (viewMode 0) use ⚡ like every other group
    await ev(() => window.__T.mk("tmr", "pharma", { hierarchy: { defaultLevel: 0 } }, "en-US", { viewMode: 0 }));
    await excClick("tmr", "tb-exc");
    m = await excState("tmr");
    check("M readers (viewMode 0): the group is there and ⚡ works", m.group && m.btns[0].on && m.grey > 0);
    // a template pick (edit mode) leaves the exceptions alone
    await ev(() => window.__T.mk("tmt", "regions", { hierarchy: { defaultLevel: 0 }, exceptions: { enabled: true, thresholdPct: 10 } },
        "en-US", { viewMode: 1 }));
    const tp = await ev(() => {
        const T = window.__T; const st = T.tmt;
        st.persists.length = 0;
        const sel = T.box("tmt").querySelector('[data-pnl="tb-template"]');
        sel.value = "T02A"; sel.dispatchEvent(new Event("change")); st.flush();
        const box = T.box("tmt");
        return { objs: st.persists.flatMap(p => p.merge.map(x => x.objectName)), mega: T.state("tmt").mega,
            on: box.querySelector('[data-pnl="tb-exc"]').getAttribute("aria-pressed"),
            pane: st.objects.exceptions };
    });
    check("M a template pick writes no exceptions object and keeps ⚡ (mega table now, still on)",
        !tp.objs.includes("exceptions") && tp.mega && tp.on === "true" && tp.pane.thresholdPct === 10, JSON.stringify(tp));
    // tree and Sankey: the group is there, cards / streams grey
    await ev(() => window.__T.mk("tmg", "pharma", { exceptions: { enabled: true, thresholdPct: 8 },
        state: { uiState: JSON.stringify({ view: "tree", treeV: 2 }) } }));
    const tg = await ev(() => {
        const T = window.__T; const box = T.box("tmg");
        const out = { tree: [box.querySelectorAll('[data-pnl-exc="0"]').length, box.querySelectorAll('[data-pnl-exc="1"]').length] };
        T.click("tmg", "View", "Sankey"); T.tmg.flush();
        out.sankey = [box.querySelectorAll('[data-sk-exc="0"]').length, box.querySelectorAll('[data-sk-exc="1"]').length];
        out.group = !!box.querySelector('[data-pnl="tb-exc-group"]');
        return out;
    });
    check("M tree and Sankey: the group stays, non-exceptions grey, exceptions colour",
        tg.tree[0] > 0 && tg.tree[1] > 0 && tg.sankey[0] > 0 && tg.sankey[1] > 0 && tg.group, JSON.stringify(tg));

    // ---- N · 1.7 polish: toolbar colours (card toolbarColors) ------------------------
    const TC = { buttonBackground: { solid: { color: "#FFF4E5" } }, buttonText: { solid: { color: "#7A3E00" } },
        activeBackground: { solid: { color: "#C25A2D" } }, activeText: { solid: { color: "#FFFFFF" } },
        groupBorder: { solid: { color: "#E8B48F" } } };
    const tcol = await ev(([TC]) => {
        const T = window.__T;
        const norm = (c) => { const d = document.createElement("div"); d.style.color = c; return d.style.color; };
        const read = (id) => {
            const box = T.box(id);
            const btns = [...box.querySelectorAll('[data-pnl="head"] button')].filter(b => b.getAttribute("data-pnl") !== "hub-open");
            return {
                inactive: btns.filter(b => b.getAttribute("aria-pressed") === "false" && b.getAttribute("data-pnl") !== "tb-burger")
                    .map(b => [b.style.backgroundColor, b.style.color, b.style.borderColor]),
                active: btns.filter(b => b.getAttribute("aria-pressed") === "true").map(b => [b.style.backgroundColor, b.style.color]),
                burger: (() => { const b = box.querySelector('[data-pnl="tb-burger"]'); return b ? [b.style.backgroundColor, b.style.color, b.style.borderColor] : null; })(),
                sel: (() => { const x = box.querySelector('[data-pnl="tb-template"]'); return x ? [x.style.backgroundColor, x.style.color, x.style.borderColor] : null; })(),
                rules: [...box.querySelectorAll('[data-pnl="tb-exc-group"] span[aria-hidden="true"]')].map(r => r.style.borderLeftColor),
                head: box.querySelector('[data-pnl="head"]').outerHTML,
                body: T.body(id),
                legend: (box.querySelector('[data-pnl="head"]').textContent || "").length,
            };
        };
        const out = { want: { bg: norm("#FFF4E5"), fg: norm("#7A3E00"), act: norm("#C25A2D"), actFg: norm("#FFFFFF"), edge: norm("#E8B48F") } };
        const base = { hierarchy: { defaultLevel: 0 }, toolbar: { foldable: true, startFolded: false }, exceptions: { enabled: true } };
        T.mk("tc0", "pharma", base, "en-US", { viewMode: 1 });
        T.mk("tc1", "pharma", { ...base, toolbarColors: TC }, "en-US", { viewMode: 1 });
        T.mk("tcE", "pharma", { ...base, toolbarColors: {} }, "en-US", { viewMode: 1 });
        out.c0 = read("tc0"); out.c1 = read("tc1"); out.cE = read("tcE");
        // only the pressed fill set: the label picks white or dark ink by itself
        T.mk("tcL", "pharma", { ...base, toolbarColors: { activeBackground: { solid: { color: "#F2C14E" } } } });
        out.cL = read("tcL"); out.dark = norm("#1E1E1E"); out.white = norm("#FFF");
        // dark mode: automatic = the dark look; high contrast: every own colour ignored
        T.mk("tcD0", "pharma", { ...base, style: { appearance: "dark" } });
        T.mk("tcD1", "pharma", { ...base, style: { appearance: "dark" }, toolbarColors: { buttonText: TC.buttonText } });
        out.d0 = read("tcD0"); out.d1 = read("tcD1");
        // the hub keeps the family look: no own colour reaches it
        const hub = (objs) => {
            const el = document.createElement("div"); el.style.cssText = "width:1200px;height:800px;position:relative;";
            document.body.prepend(el);
            const v = new Visual({ element: el, host: makeHost("en-US") });
            v.update({ dataViews: [{ metadata: { objects: objs, columns: [] }, categorical: { categories: [], values: [] } }],
                viewport: { width: 1200, height: 800 }, type: 2, viewMode: 1 });
            const h = el.innerHTML; el.remove(); return h;
        };
        out.hubSame = hub({}) === hub({ toolbarColors: TC });
        out.hubIsHub = /data-pnl="hub/.test(hub({}));
        ["tc0", "tc1", "tcE", "tcL", "tcD0", "tcD1"].forEach(id => T.box(id).remove());
        return out;
    }, TC);
    {
        const w = tcol.want;
        check("N toolbar colours: every button that is not pressed takes the own fill, label and frame",
            tcol.c1.inactive.length > 10 && tcol.c1.inactive.every(([b, c, e]) => b === w.bg && c === w.fg && e === w.edge),
            JSON.stringify(tcol.c1.inactive.slice(0, 2)));
        check("N toolbar colours: every pressed button takes the own active fill and label",
            tcol.c1.active.length > 3 && tcol.c1.active.every(([b, c]) => b === w.act && c === w.actFg), JSON.stringify(tcol.c1.active.slice(0, 2)));
        check("N toolbar colours: ☰, the template dropdown and the ⚡ dividers follow (frame, fill, label)",
            JSON.stringify(tcol.c1.burger) === JSON.stringify([w.bg, w.fg, w.edge]) && JSON.stringify(tcol.c1.sel) === JSON.stringify([w.bg, w.fg, w.edge])
            && tcol.c1.rules.length > 0 && tcol.c1.rules.every(r => r === w.edge), JSON.stringify([tcol.c1.burger, tcol.c1.sel, tcol.c1.rules]));
        check("N toolbar colours: the statement below the toolbar is untouched",
            tcol.c1.body === tcol.c0.body);
        check("N toolbar colours empty = automatic: the toolbar is byte-identical to a report without the card",
            tcol.cE.head === tcol.c0.head && tcol.cE.body === tcol.c0.body);
        check("N toolbar colours: an own light active fill gets dark ink automatically, the rest stays automatic",
            tcol.cL.active.length > 3 && tcol.cL.active.every(([b, c]) => b === "rgb(242, 193, 78)" && c === tcol.dark)
            && tcol.cL.inactive.every(x => JSON.stringify(x) === JSON.stringify(tcol.c0.inactive[0])),
            JSON.stringify(tcol.cL.active.slice(0, 2)));
        check("N toolbar colours in dark mode: automatic = the dark look, an own label colour applies as given",
            tcol.d0.inactive.every(([b]) => b !== w.bg && b !== "rgb(255, 255, 255)") && tcol.d1.inactive.every(([, c]) => c === w.fg)
            && tcol.d1.inactive.every(([b], i) => b === tcol.d0.inactive[i][0]), JSON.stringify([tcol.d0.inactive[0], tcol.d1.inactive[0]]));
        check("N toolbar colours never reach the start hub (family look)", tcol.hubIsHub && tcol.hubSame);
    }
    // high contrast: the host's colours rule — own toolbar colours are ignored
    const tcHc = await ev(([TC]) => {
        const HCP = { isHighContrast: true, foreground: { value: "#FFFF00" }, background: { value: "#000000" }, foregroundSelected: { value: "#00FFFF" } };
        const mk = (objs) => {
            const el = document.createElement("div"); el.style.cssText = "width:1200px;height:600px;position:relative;";
            document.body.prepend(el);
            const v = new Visual({ element: el, host: makeHost("en-US", { palette: HCP }) });
            v.update({ dataViews: [dv(objs)], viewport: { width: 1200, height: 600 }, type: 2 });
            const h = el.querySelector('[data-pnl="head"]').outerHTML; el.remove(); return h;
        };
        return { same: mk({ columns: { template: "T03A" } }) === mk({ columns: { template: "T03A" }, toolbarColors: TC }),
            sameClassic: mk({}) === mk({ toolbarColors: TC }) };
    }, TC);
    check("N high contrast ignores the toolbar colours (mega table and classic table)", tcHc.same && tcHc.sameClassic, JSON.stringify(tcHc));

    // ---- O · 1.7 polish: layout.maximize -------------------------------------------
    const mx = await ev(() => {
        const out = {};
        const run = (data, objs, w, h) => {
            const el = document.createElement("div"); el.style.cssText = `width:${w}px;height:${h}px;position:relative;`;
            document.body.prepend(el);
            const v = new Visual({ element: el, host: makeHost("en-US") });
            v.update({ dataViews: [data === "pharma" ? dv(objs) : dvRows(MEGA_DEMO.regions(), objs)], viewport: { width: w, height: h }, type: 2 });
            const root = el.querySelector(".pnl-root");
            const head = el.querySelector('[data-pnl="head"]');
            const last = root.lastElementChild;
            const r = {
                k: v.bodyK, treeK: v.treeK, headH: head ? head.offsetHeight : 0,
                bottom: Math.ceil(last.getBoundingClientRect().bottom - root.getBoundingClientRect().top + root.scrollTop),
                client: root.clientHeight, scrollH: root.scrollHeight, overX: root.scrollWidth - root.clientWidth,
                groupsRow: [...el.querySelectorAll('[data-pnl="head"] > div > div')].filter(g => g.style.flexDirection === "row").length,
                tbRows: (() => { const tb = head && [...head.children].find(c => c.querySelector("button")); if (!tb) { return 0; }
                    return new Set([...tb.children].map(c => Math.round(c.getBoundingClientRect().top))).size; })(),
                fs: (() => { const c = el.querySelector('[data-pnl-row] > div'); return c ? parseFloat(c.style.fontSize) : 0; })(),
                megaFs: v.megaLast ? v.megaLast.G.fs : 0,
                html: el.innerHTML,
            };
            el.remove();
            return r;
        };
        const MX = { layout: { maximize: true } };
        out.offA = run("pharma", { hierarchy: { defaultLevel: 1 } }, 1400, 900);
        out.offB = run("pharma", { hierarchy: { defaultLevel: 1 }, layout: { maximize: false } }, 1400, 900);
        out.megaOff = run("pharma", { hierarchy: { defaultLevel: 1 }, columns: { template: "T04B" } }, 1400, 900);
        out.megaOn = run("pharma", { hierarchy: { defaultLevel: 1 }, columns: { template: "T04B" }, ...MX }, 1400, 900);
        out.smallOn = run("pharma", { hierarchy: { defaultLevel: 1 }, columns: { template: "T04B" }, ...MX }, 1400, 520);
        out.tblOn = run("pharma", { hierarchy: { defaultLevel: 0 }, columns: { preset: "acref" }, ...MX }, 1100, 700);
        out.tblOff = run("pharma", { hierarchy: { defaultLevel: 0 }, columns: { preset: "acref" } }, 1100, 700);
        out.bigOn = run("regions", { hierarchy: { defaultLevel: 0 }, ...MX }, 1400, 380);
        out.barsOn = run("pharma", { hierarchy: { defaultLevel: 1 }, state: { uiState: JSON.stringify({ view: "bars" }) }, ...MX }, 1800, 900);
        out.barsNarrow = run("pharma", { hierarchy: { defaultLevel: 1 }, state: { uiState: JSON.stringify({ view: "bars" }) }, ...MX }, 1400, 900);
        out.skOn = run("pharma", { state: { uiState: JSON.stringify({ view: "sankey", treeV: 2 }) }, ...MX }, 1400, 900);
        out.skOff = run("pharma", { state: { uiState: JSON.stringify({ view: "sankey", treeV: 2 }) } }, 1400, 900);
        out.treeOn = run("pharma", { state: { uiState: JSON.stringify({ view: "tree", treeV: 2, treeCollapsed: ["F_GROSSPROFIT", "F_EBIT"] }) }, ...MX }, 1400, 1100);
        return out;
    });
    check("O maximize off (default and explicit false) renders byte-identically, body scale 1",
        mx.offA.html === mx.offB.html && mx.offA.k === 1 && mx.offA.groupsRow === 0);
    check("O maximize: the toolbar is only as tall as needed — group names beside the buttons, a shorter head",
        mx.megaOn.groupsRow > 3 && mx.megaOn.headH < mx.megaOff.headH && mx.megaOn.tbRows <= 2, `${mx.megaOff.headH}→${mx.megaOn.headH} rows ${mx.megaOn.tbRows}`);
    check("O maximize: the mega table grows into the tile height (≤ ×1.6) and fills it without a scrollbar",
        mx.megaOn.k > 1.05 && mx.megaOn.k <= 1.6 + 1e-9 && mx.megaOn.megaFs > mx.megaOff.megaFs
        && (mx.megaOn.k >= 1.6 - 1e-9 || mx.megaOn.client - mx.megaOn.bottom <= 24) && mx.megaOn.scrollH <= mx.megaOn.client + 1 && mx.megaOn.overX <= 1,
        JSON.stringify({ k: mx.megaOn.k, b: mx.megaOn.bottom, c: mx.megaOn.client, fs: mx.megaOn.megaFs }));
    check("O maximize: in a low tile the mega table shrinks instead of scrolling (font ≥ 9 px)",
        mx.smallOn.k < 1 && mx.smallOn.megaFs >= 9 && (mx.smallOn.scrollH <= mx.smallOn.client + 1 || mx.smallOn.megaFs <= 9.5),
        JSON.stringify({ k: mx.smallOn.k, fs: mx.smallOn.megaFs, s: mx.smallOn.scrollH, c: mx.smallOn.client }));
    check("O maximize: the classic table scales rows and type to the height (shrinks here: 30 rows in 700 px)",
        mx.tblOn.k < 1 && mx.tblOn.fs >= 9 && mx.tblOn.fs < mx.tblOff.fs && mx.tblOn.scrollH < mx.tblOff.scrollH,
        JSON.stringify({ k: mx.tblOn.k, fs: [mx.tblOff.fs, mx.tblOn.fs], s: [mx.tblOff.scrollH, mx.tblOn.scrollH] }));
    check("O maximize: below the 9 px floor the rows scroll (long structure table, low tile)",
        Math.abs(mx.bigOn.fs - 9) <= 0.6 && mx.bigOn.scrollH > mx.bigOn.client, JSON.stringify({ k: mx.bigOn.k, fs: mx.bigOn.fs }));
    check("O maximize: the structure bars scale like the table — but never past the tile width (a body already wider does not grow)",
        mx.barsOn.k > 1 && mx.barsOn.k <= 1.6 + 1e-9 && mx.barsOn.overX <= 1 && mx.barsNarrow.k === 1, JSON.stringify([mx.barsOn.k, mx.barsOn.overX, mx.barsNarrow.k]));
    check("O maximize: the Sankey fills the tile height exactly (no gap, no scrollbar — without maximize it scrolls a little)",
        Math.abs(mx.skOn.client - mx.skOn.bottom) <= 8 && mx.skOn.scrollH <= mx.skOn.client + 1 && mx.skOff.scrollH > mx.skOff.client,
        JSON.stringify([mx.skOn.bottom, mx.skOn.client, mx.skOff.bottom]));
    check("O maximize: the tree scales its cards into the tile (×0.8 … ×1.6)",
        mx.treeOn.treeK !== 1 && mx.treeOn.treeK >= 0.8 && mx.treeOn.treeK <= 1.6 && mx.treeOn.overX <= 1, String(mx.treeOn.treeK));

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
                    // 1.6 the Sankey and its toolbar
                    ["pharma", { state: { uiState: JSON.stringify({ view: "sankey", treeV: 2 }) } }],
                    // 1.2 the value-column switches of the classic and the mega table
                    ["pharma", { toolbar: { showValues: true }, columns: { preset: "custom" } }],
                    ["regions", { hierarchy: { defaultLevel: 0 }, toolbar: { showValues: true }, columns: { template: "T02A" } }],
                    // 1.7 the ⚡ group switched on: stepper, |Δ| threshold, reference, direction, mode
                    ["pharma", { columns: { materialityAbs: 20 }, exceptions: { enabled: true } }],
                    ["regions", { hierarchy: { defaultLevel: 0 }, columns: { template: "T02A" }, exceptions: { enabled: true, mode: "hide" } }],
                    // 1.7 polish: the maximized toolbar (group names beside the buttons) and own toolbar colours
                    ["pharma", { layout: { maximize: true }, exceptions: { enabled: true }, toolbarColors: { activeBackground: { solid: { color: "#C25A2D" } } } }],
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
