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
        st.update(stale);                                  // stale: still template off
        out.afterStale = { mega: T.state("ti").mega, sel: sel() ? sel().value : "" };
        st.flush();
        out.afterEcho = { mega: T.state("ti").mega, sel: sel() ? sel().value : "", persists: st.persists.length };
        return out;
    });
    check("I edit mode: the template picker is there, with every template", pick.there && pick.n === 18 && pick.cur === "off", JSON.stringify(pick));
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
                    // 1.2 the value-column switches of the classic and the mega table
                    ["pharma", { toolbar: { showValues: true }, columns: { preset: "custom" } }],
                    ["regions", { hierarchy: { defaultLevel: 0 }, toolbar: { showValues: true }, columns: { template: "T02A" } }],
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
