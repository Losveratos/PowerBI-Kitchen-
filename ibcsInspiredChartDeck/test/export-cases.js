// Export-Layout-Suite: the four sheets that really get printed, each in three
// export-typical tile sizes, rendered in the non-interactive host context
// (hostCapabilities.allowInteractions = false, viewMode 0 = View) — what Power BI
// Desktop's PDF export and printing use (the service export renders certified
// visuals only, so it applies after certification).
//
//   1  Monatssäulen + Δ   columns · 12 months · AC + PL + PY · ΔPL / ΔPL% panels
//   2  Struktur-Balken    bars · 16 customers (long names) · AC + PY · Δ panels right
//   3a Kategorie-Brücke   catbridge PY → AC
//   3b GuV-Wasserfall     waterfall with rowType sum/delta + PY (variance tiers)
//   4  Matrix mit YTD     table + colgroup Quartal → Monat (Jan–Aug), Σ = YTD,
//                         Q2/Q3 collapsed on screen (export: expand all)
//
// Sizes: A4-quer full page 1100×620 · half page 540×620 · PowerPoint 16:9 960×540.
// Presets: every sheet × size with HD (compact, default) and Full HD; UHD once.
//
// Criteria per render:
//   (a) no in-chart buttons / chrome / hover remnants / start-hub elements
//   (b) no clipped or overlapping labels, categories, legends, titles
//   (c) Δ panels, scales and footers completely inside the tile
//   (d) matrix: collapsed groups expanded (exportExpandAll), YTD (Σ) column
//       visible, no horizontal cut without a hint
//   (e) font preset scales the text as chosen
//   (f) renderingStarted/Finished exactly once, nothing async afterwards,
//       no persistProperties / drill / selection from an export render
//
// Run: node test/build.js && node test/export-cases.js   (npm run test:export)
// Screenshots: test/export-<sheet>-<size>-<preset>.png (gitignored).
// VERBOSE=1 prints every ok line.
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const SIZES = [
    { id: "a4", w: 1100, h: 620 },
    { id: "half", w: 540, h: 620 },
    { id: "ppt", w: 960, h: 540 }
];

// ------------------------------------------------------------------ in-page lib
// Serialized into the page (no closures over Node scope).
function pageLib() {
    const Visual = window.ChartKitchen.Visual;
    const M = 1e6, K = 1e3;

    window.makeExportHost = function (log) {
        return {
            hostCapabilities: { allowInteractions: false },
            colorPalette: { isHighContrast: false },
            eventService: {
                renderingStarted() { log.started++; },
                renderingFinished() { log.finished++; },
                renderingFailed(o, e) { log.failed++; log.errors.push(String(e)); }
            },
            createSelectionManager: () => ({
                select: () => { log.select++; return Promise.resolve([]); },
                clear: () => Promise.resolve(), getSelectionIds: () => [], showContextMenu() {}
            }),
            createSelectionIdBuilder: () => ({ withCategory() { return this; }, withMeasure() { return this; },
                withSeries() { return this; }, createSelectionId() { return { equals: () => false }; } }),
            tooltipService: { show() {}, move() {}, hide() {} },
            createLocalizationManager: () => ({ getDisplayName: () => "" }),
            persistProperties: (c) => { log.persist.push(JSON.stringify(c)); },
            drill: (a) => { log.drill.push(JSON.stringify(a)); },
            launchUrl: () => { log.launch++; },
            locale: "de-DE"
        };
    };
    const col = (role, values, format, name) => ({
        source: { displayName: name || role, roles: { [role]: true }, isMeasure: true, format }, values
    });

    // ---- sheet data
    const mon12 = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    const acY = [3.62, 3.75, 3.98, 4.05, 4.12, 4.21, 4.30, 4.18, null, null, null, null].map(v => v == null ? null : v * M);
    const pyY = [3.50, 3.66, 3.80, 3.95, 3.90, 4.05, 3.98, 4.02, 4.10, 4.20, 4.40, 4.70].map(v => v * M);
    const plY = [3.70, 3.70, 3.90, 4.10, 4.00, 4.30, 4.20, 4.25, 4.20, 4.30, 4.50, 4.80].map(v => v * M);
    const filterTxt = "Region: DACH · Kanal: Handel · Jahr: 2026";

    const custs = ["Getränke Großhandel Süd GmbH", "Brauhaus am Markt KG", "Edeka Südwest Logistik",
        "Metro Cash & Carry Deutschland", "Gastro-Service Rhein-Main", "Hotelgruppe Alpenblick AG",
        "Kaufland Warenhandel", "Rewe Markt Region Ost", "Biergarten Betriebsgesellschaft mbH",
        "Stadionbetrieb Nordkurve", "Export Benelux B.V.", "Export Österreich", "Lieferdienst Flaschenpost",
        "Getränkefachmarkt Kette West", "Vereinsheime & Kantinen", "Sonstige Kunden"];
    const custAc = [1840, 1620, 1490, 1310, 1180, 960, 905, 870, 640, 590, 520, 470, 430, 395, 260, 710].map(v => v * K);
    const custPy = [1720, 1680, 1350, 1400, 1100, 1010, 820, 910, 610, 650, 480, 455, 300, 420, 290, 760].map(v => v * K);

    const brCats = ["Preis", "Menge Inland", "Menge Export", "Produktmix", "Rabatte", "Neukunden",
        "Verlorene Kunden", "Währung", "Sortimentsbereinigung", "Sonstiges"];
    const brAc = [14.9, 31.2, 9.8, 6.1, -4.2, 3.6, 0, 1.4, 2.2, 1.1].map(v => v * M);
    const brPy = [13.2, 30.4, 10.6, 5.5, -3.6, 0, 2.9, 1.7, 3.0, 0.9].map(v => v * M);

    const pnlCats = ["Umsatzerlöse", "Bestandsveränderungen", "Materialaufwand", "Rohertrag", "Personalaufwand",
        "Abschreibungen", "Sonstige betriebliche Aufwendungen", "EBIT", "Finanzergebnis", "EBT", "Ertragsteuern",
        "Jahresüberschuss"];
    const pnlTypes = ["delta", "delta", "delta", "sum", "delta", "delta", "delta", "sum", "delta", "sum", "delta", "sum"];
    const pnlAc = [98.4, 1.2, -41.8, 57.8, -27.5, -6.1, -11.9, 12.3, -1.4, 10.9, -3.3, 7.6].map(v => v * M);
    const pnlPy = [91.0, -0.6, -38.9, 51.5, -26.1, -5.8, -10.7, 8.9, -1.6, 7.3, -2.2, 5.1].map(v => v * M);

    const mxRows = ["Nord", "West", "Süd", "Ost", "Mitte", "Export EU", "Export Übersee", "Online-Shop"];
    const mxQM = { Q1: ["Jan", "Feb", "Mär"], Q2: ["Apr", "Mai", "Jun"], Q3: ["Jul", "Aug"] };
    const mxCat = [], mxL0 = [], mxL1 = [], mxAc = [], mxPy = [];
    mxRows.forEach((r, ri) => Object.keys(mxQM).forEach((q, qi) => mxQM[q].forEach((m, mi) => {
        mxCat.push(r); mxL0.push(q); mxL1.push(m);
        mxAc.push((410 + ri * 85 + qi * 22 + mi * 9 - (ri % 3) * 31) * K);
        mxPy.push((400 + ri * 82 + qi * 18 + mi * 7 - (ri % 2) * 24) * K);
    })));

    const dv = (catName, cats, cols, objects, extraCats) => {
        const categories = [{ source: { displayName: catName, roles: { category: true } }, values: cats }];
        for (const [role, name, values] of (extraCats || [])) {
            categories.push({ source: { displayName: name, roles: { [role]: true } }, values });
        }
        return { metadata: { columns: [], objects }, categorical: { categories, values: cols } };
    };
    const withPreset = (obj, preset) => Object.assign({}, obj, { labels: Object.assign({}, obj.labels || {}, { fontPreset: preset }) });

    window.SHEETS = {
        cols: {
            title: "Monatssäulen + Δ (ΔPL, ΔPL%)",
            make: preset => dv("Monat", mon12, [col("actual", acY, "#,0", "Umsatz AC"), col("plan", plY, "#,0", "Umsatz PL"),
                col("previousYear", pyY, "#,0", "Umsatz PY"), col("filterInfo", mon12.map(() => filterTxt), undefined, "Filter")],
                withPreset({
                    chart: { orientation: "columns", comparisonMode: "plan", showAbsoluteVariance: true, showRelativeVariance: true,
                        cumulativeButton: true, chartButtons: true },
                    ibcsTitle: { show: true, kpi: "Nettoumsatz in EUR", period: "Jan bis Dez 2026, Ist bis Aug",
                        footer: "Quelle: SAP FI · Stand 05.09.2026", filterFooter: true }
                }, preset)),
            expect: [/^ΔPL( ×[\d,]+)?$/, /^ΔPL ?%$/]
        },
        bars: {
            title: "Struktur-Balken (16 Kunden, ΔPY)",
            make: preset => dv("Kunde", custs, [col("actual", custAc, "#,0", "DB AC"), col("previousYear", custPy, "#,0", "DB PY")],
                withPreset({
                    chart: { orientation: "bars", comparisonMode: "py", showAbsoluteVariance: true, showRelativeVariance: true,
                        chartButtons: true, compareClick: false },
                    ibcsTitle: { show: true, kpi: "Deckungsbeitrag in EUR je Kunde", period: "Jan bis Aug 2026",
                        footer: "Quelle: CO-PA · Stand 05.09.2026" }
                }, preset)),
            expect: [/^ΔPY( ×[\d,]+)?$/, /^ΔPY ?%$/]
        },
        bridge: {
            title: "Kategorie-Brücke PY → AC",
            make: preset => dv("Treiber", brCats, [col("actual", brAc, "#,0", "Umsatz AC"), col("previousYear", brPy, "#,0", "Umsatz PY")],
                withPreset({
                    chart: { orientation: "catbridge", comparisonMode: "py", showAbsoluteVariance: true, showRelativeVariance: true,
                        chartButtons: true, sortByImpact: true },
                    ibcsTitle: { show: true, kpi: "Umsatzbrücke in EUR", period: "Jan bis Aug 2026",
                        footer: "Quelle: SAP FI · Stand 05.09.2026" }
                }, preset)),
            expect: [/^PY$/, /^AC$/, /^ΔPY ?%$/]
        },
        pnl: {
            title: "GuV-Wasserfall mit Ergebniszeilen + ΔPY",
            make: preset => dv("Position", pnlCats, [col("actual", pnlAc, "#,0", "GuV AC"), col("previousYear", pnlPy, "#,0", "GuV PY")],
                withPreset({
                    chart: { orientation: "waterfall", comparisonMode: "py", showAbsoluteVariance: true, showRelativeVariance: true,
                        showTotal: false },
                    ibcsTitle: { show: true, kpi: "GuV in EUR", period: "Jan bis Aug 2026",
                        footer: "Quelle: SAP FI · Stand 05.09.2026" }
                }, preset), [["rowType", "Typ", pnlTypes]]),
            expect: [/^EBIT$/, /^ΔPY( ×[\d,]+)?$/, /^ΔPY ?%$/],
            // long P&L line names: complete (wrapped, hyphenated) where the slot allows
            fullNames: (w, preset) => w >= 960 && preset === "compact" || w >= 1100 && preset === "fullhd"
                ? ["Jahresüberschuss", "Umsatzerlöse", "Materialaufwand", "Ertragsteuern"] : []
        },
        matrix: {
            title: "Matrix Quartal → Monat + Σ (YTD)",
            make: preset => dv("Region", mxCat, [col("actual", mxAc, "#,0", "Umsatz AC"), col("previousYear", mxPy, "#,0", "Umsatz PY")],
                withPreset({
                    chart: { orientation: "table", comparisonMode: "py", showAbsoluteVariance: true, showRelativeVariance: true,
                        showTotal: true, tableColExpanded: JSON.stringify(["col¦Q1"]) },
                    ibcsTitle: { show: true, kpi: "Umsatz in EUR je Region", period: "Jan bis Aug 2026 (YTD)",
                        footer: "Quelle: SAP FI · Stand 05.09.2026" }
                }, preset), [["colgroup", "Quartal", mxL0], ["colgroup", "Monat", mxL1]]),
            months: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug"]
        }
    };

    // ---- render one export tile
    window.renderExport = function (id, sheetKey, preset, w, h, viewMode) {
        const wrap = document.createElement("div");
        wrap.className = "case";
        wrap.innerHTML = `<h4>${id}</h4><div class="stage" id="${id}" style="width:${w}px;height:${h}px"></div>`;
        document.body.appendChild(wrap);
        const el = document.getElementById(id);
        const log = { started: 0, finished: 0, failed: 0, errors: [], persist: [], drill: [], select: 0, launch: 0 };
        const v = new Visual({ element: el, host: window.makeExportHost(log) });
        v.update({ viewport: { width: w, height: h }, dataViews: [window.SHEETS[sheetKey].make(preset)],
            viewMode: viewMode, type: 2 });
        window.__exp = window.__exp || {};
        window.__exp[id] = { log, html: el.innerHTML };
        return id;
    };

    // ---- measurement helpers
    const visible = (e, stage) => {
        for (let n = e; n && n !== stage; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) { return false; }
            if (n.getAttribute && (n.getAttribute("opacity") === "0" || n.getAttribute("fill-opacity") === "0" && n.tagName === "text")) { return false; }
        }
        return true;
    };
    const clipped = (e, stage) => {
        for (let n = e.parentElement; n && n !== stage; n = n.parentElement) {
            if (n.getAttribute && n.getAttribute("clip-path")) { return true; }
        }
        return false;
    };
    const CHROME_GLYPHS = ["☰", "⇅", "▶", "⏸", "↺", "⤢", "✎", "⚙", "⇄", "🔍", "⌕", "✕", "⫽ Achse", "⫽ Axis", "🚀"];
    const CHEVRONS = ["▸", "▾", "▶", "▼", "›", "⌄"];

    window.inspectExport = function (id) {
        const stage = document.getElementById(id);
        const sr = stage.getBoundingClientRect();
        const svg = stage.querySelector("svg");
        const out = { id, chrome: [], clip: [], overlap: [], outside: [], ellipsis: [], texts: [], fontSizes: [] };
        // (a) chrome
        const sel = (q) => [...stage.querySelectorAll(q)];
        const ctl = sel("[data-ck-ctl]").length, rb = sel("[role=button]").length, ti = sel("[tabindex]").length;
        if (ctl) { out.chrome.push(ctl + "× [data-ck-ctl]"); }
        if (rb) { out.chrome.push(rb + "× [role=button]"); }
        if (ti) { out.chrome.push(ti + "× [tabindex]"); }
        const hub = sel('[data-icd^="hub"],[data-icd="chip-bar"],[data-icd="chip-menu"],[data-icd="reader-card"],[data-icd="field-intro"]');
        if (hub.length) { out.chrome.push("Hub/Chip: " + hub.map(e => e.getAttribute("data-icd")).join(",")); }
        const html = [...stage.querySelectorAll("*")].filter(e => !(e instanceof SVGElement));
        if (html.length) { out.chrome.push("HTML-Overlay: " + html.map(e => e.tagName.toLowerCase() + (e.getAttribute("data-icd") ? "[" + e.getAttribute("data-icd") + "]" : "")).join(",")); }
        const cur = [...stage.querySelectorAll("svg *")].filter(e => {
            const c = (e.style && e.style.cursor) || e.getAttribute("cursor") || "";
            return c && c !== "default" && c !== "auto";
        });
        if (cur.length) { out.chrome.push(cur.length + "× cursor (" + [...new Set(cur.map(e => e.style.cursor || e.getAttribute("cursor")))].join(",") + ")"); }
        // texts
        const texts = [...svg.querySelectorAll("text")].filter(t => visible(t, stage) && t.textContent.trim() !== "");
        for (const t of texts) {
            const s = t.textContent.trim();
            if (CHROME_GLYPHS.some(g => s === g || s.startsWith(g + " "))) { out.chrome.push("Glyphe „" + s + "“"); }
            if (CHEVRONS.some(g => s === g || s.startsWith(g))) { out.chrome.push("Chevron „" + s + "“"); }
        }
        // the full label of a text: tspans with their own y/dy are wrapped lines —
        // "Jahres-" + "überschuss" reads "Jahresüberschuss", "Sonstige" + "betriebl…" with a blank
        const fullText = t => {
            const parts = [...t.childNodes];
            if (!parts.some(n => n.nodeType === 1 && (n.getAttribute("dy") || n.getAttribute("y")))) { return t.textContent.trim(); }
            let out = "";
            parts.forEach((n, i) => {
                const txt = n.textContent;
                const brk = i > 0 && n.nodeType === 1 && (n.getAttribute("dy") || n.getAttribute("y"));
                if (brk && /[a-zäöüß]-$/i.test(out) && /^[a-zäöüß]/.test(txt)) { out = out.slice(0, -1) + txt; }
                else if (brk && !/\s$/.test(out)) { out += " " + txt; }
                else { out += txt; }
            });
            return out.trim();
        };
        const boxes = texts.map(t => {
            const r = t.getBoundingClientRect();
            const fs = parseFloat(t.getAttribute("font-size") || getComputedStyle(t).fontSize);
            return { t, s: fullText(t), x0: r.left - sr.left, x1: r.right - sr.left, y0: r.top - sr.top, y1: r.bottom - sr.top, fs, clip: clipped(t, stage) };
        }).filter(b => b.x1 - b.x0 > 0.5);
        out.texts = boxes.map(b => b.s);
        out.fontSizes = boxes.map(b => b.fs).filter(v => isFinite(v));
        // (b) clipped at the tile edge
        for (const b of boxes) {
            if (b.x0 < -1 || b.y0 < -1 || b.x1 > sr.width + 1 || b.y1 > sr.height + 1) {
                out.clip.push(`„${b.s.slice(0, 40)}“ @${Math.round(b.x0)},${Math.round(b.y0)}–${Math.round(b.x1)},${Math.round(b.y1)}`);
            }
            if (/…$/.test(b.s) || /^…/.test(b.s)) { out.ellipsis.push(b.s); }
        }
        // (b) overlaps — glyph box ≈ inner 60 % of the line box vertically
        const core = b => { const hh = (b.y1 - b.y0) * 0.2; return { x0: b.x0 + 0.5, x1: b.x1 - 0.5, y0: b.y0 + hh, y1: b.y1 - hh }; };
        for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
                const a = boxes[i], b = boxes[j];
                // halo duplicates (same string drawn twice at the same spot)
                if (a.s === b.s && Math.abs(a.x0 - b.x0) < 1 && Math.abs(a.y0 - b.y0) < 1) { continue; }
                // one hidden inside a clipped scroll strip — the clip decides
                const A = core(a), B = core(b);
                const ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0);
                const oy = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0);
                if (ox > 1.5 && oy > 1.5) {
                    out.overlap.push(`„${a.s.slice(0, 28)}“ × „${b.s.slice(0, 28)}“ (${Math.round(ox)}×${Math.round(oy)}px)`);
                }
            }
        }
        // (c) graphics outside the tile (skip elements inside clip groups / defs)
        const shapes = [...svg.querySelectorAll("rect,path,line,circle,polygon,polyline,ellipse")]
            .filter(e => !e.closest("defs") && !e.closest("clipPath") && !e.closest("pattern") && !e.closest("mask") && visible(e, stage) && !clipped(e, stage));
        for (const e of shapes) {
            const r = e.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) { continue; }
            const x0 = r.left - sr.left, y0 = r.top - sr.top, x1 = r.right - sr.left, y1 = r.bottom - sr.top;
            if (x0 < -1.5 || y0 < -1.5 || x1 > sr.width + 1.5 || y1 > sr.height + 1.5) {
                out.outside.push(`${e.tagName}${e.getAttribute("data-icd") ? "[" + e.getAttribute("data-icd") + "]" : ""} @${Math.round(x0)},${Math.round(y0)}–${Math.round(x1)},${Math.round(y1)}`);
            }
        }
        out.lowestText = boxes.reduce((m, b) => Math.max(m, b.y1), 0);
        out.svgH = svg ? parseFloat(svg.getAttribute("height")) : 0;
        return out;
    };
}

// ------------------------------------------------------------------------ runner
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    let errors = 0, oks = 0;
    const fails = [];
    page.on("pageerror", e => { errors++; console.log("[pageerror]", e.message); });
    page.on("console", m => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
    await page.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body { font-family: 'Segoe UI', sans-serif; background: #f2f2f2; margin: 20px; }
        .case { background: #fff; border: 1px solid #ddd; margin-bottom: 24px; padding: 8px; display: inline-block; }
        .case h4 { margin: 0 0 6px 0; font-size: 12px; color: #666; }
        .stage { position: relative; overflow: hidden; background: #fff; }
        </style></head><body></body></html>`);
    await page.addScriptTag({ path: path.join(__dirname, "visual.bundle.js") });
    await page.addScriptTag({ content: `(${pageLib.toString()})();` });

    const check = (cond, msg, detail) => {
        if (cond) { oks++; if (process.env.VERBOSE) { console.log("ok · " + msg); } }
        else { fails.push(msg + (detail ? " — " + detail : "")); console.log("FAIL · " + msg + (detail ? " — " + detail : "")); }
    };
    const measure = (msg) => console.log("measure · " + msg);
    const sheets = await page.evaluate(() => Object.keys(window.SHEETS));
    const only = (process.env.SHEET || "").split(",").filter(Boolean);
    const median = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
    const fontMed = {};

    const runOne = async (sheet, size, preset, viewMode, shot) => {
        const id = `export-${sheet}-${size.id}-${preset}${viewMode === 1 ? "-edit" : ""}`;
        await page.evaluate(([i, s, p, w, h, vm]) => window.renderExport(i, s, p, w, h, vm), [id, sheet, preset, size.w, size.h, viewMode]);
        // (f) nothing async may change the picture after renderingFinished
        await page.waitForTimeout(350);
        const res = await page.evaluate(i => {
            const r = window.inspectExport(i);
            const e = window.__exp[i];
            r.log = e.log;
            r.stable = document.getElementById(i).innerHTML === e.html;
            r.sheet = window.SHEETS[i.split("-")[1]];
            r.expect = r.sheet.expect ? r.sheet.expect.map(x => x.source) : null;
            r.months = r.sheet.months || null;
            const sz = document.getElementById(i).getBoundingClientRect().width;
            r.fullNames = r.sheet.fullNames ? r.sheet.fullNames(Math.round(sz), i.split("-")[3]) : [];
            delete r.sheet;
            return r;
        }, id);
        const tag = `${sheet} ${size.w}×${size.h} ${preset}${viewMode === 1 ? " (Edit-Flag)" : ""}`;
        check(res.chrome.length === 0, `(a) ${tag}: kein Chrome im Export`, res.chrome.join("; "));
        check(res.clip.length === 0, `(b) ${tag}: keine am Rand abgeschnittene Beschriftung`, res.clip.slice(0, 6).join("; "));
        check(res.overlap.length === 0, `(b) ${tag}: keine überlappenden Beschriftungen`, res.overlap.slice(0, 6).join("; "));
        check(res.outside.length === 0, `(c) ${tag}: alle Grafikelemente innerhalb der Kachel`, res.outside.slice(0, 6).join("; "));
        if (res.expect) {
            const miss = res.expect.filter(x => !res.texts.some(t => new RegExp(x).test(t)));
            check(miss.length === 0, `(c) ${tag}: Panels/Zeilen vollständig beschriftet (${res.expect.join(" ")})`, "fehlt: " + miss.join(" "));
        }
        if (res.fullNames.length) {
            const miss = res.fullNames.filter(x => !res.texts.includes(x));
            check(miss.length === 0, `(b) ${tag}: lange Zeilennamen vollständig (umbrochen)`, "fehlt: " + miss.join(", "));
        }
        // shortened labels stay recognisable: ≥ 4 characters and mutually distinct
        const cut = res.ellipsis.filter(t => /…$/.test(t));
        const weak = cut.filter(t => t.replace(/[\s…-]/g, "").length < 4);
        check(weak.length === 0 && new Set(cut).size === cut.length,
            `(b) ${tag}: gekürzte Beschriftungen eindeutig (≥ 4 Zeichen)`, cut.join(" | "));
        const hasFooter = res.texts.some(t => t.includes("Quelle:"));
        check(hasFooter, `(c) ${tag}: Fußzeile sichtbar`);
        if (res.months) {
            const shown = res.months.filter(m => res.texts.includes(m));
            const hint = res.texts.some(t => /^…\s*\+\d+/.test(t) || /\+\d+$/.test(t));
            check(shown.length === res.months.length || hint, `(d) ${tag}: alle Monate aufgeklappt oder Hinweis`, "gezeigt: " + shown.join(","));
            // every month is visible itself or inside its collapsed quarter block
            const qOf = m => "Q" + (Math.floor(res.months.indexOf(m) / 3) + 1);
            const lost = res.months.filter(m => !res.texts.includes(m)
                && !(res.texts.includes(qOf(m)) && !res.months.some(m2 => qOf(m2) === qOf(m) && res.texts.includes(m2))));
            check(lost.length === 0, `(d) ${tag}: jede Periode vertreten (Monat oder Quartalsblock)`, "fehlt: " + lost.join(","));
            check(res.texts.some(t => /^Σ/.test(t)), `(d) ${tag}: Σ-/YTD-Spalte sichtbar`);
        }
        check(res.log.started === 1 && res.log.finished === 1 && res.log.failed === 0,
            `(f) ${tag}: renderingStarted/Finished genau einmal`, JSON.stringify({ s: res.log.started, f: res.log.finished, x: res.log.failed, e: res.log.errors }));
        check(res.stable, `(f) ${tag}: nach renderingFinished keine asynchrone Änderung`);
        check(res.log.persist.length === 0 && res.log.drill.length === 0 && res.log.select === 0 && res.log.launch === 0,
            `(f) ${tag}: Export schreibt/drillt nichts`, JSON.stringify({ persist: res.log.persist, drill: res.log.drill }));
        if (res.ellipsis.length) { measure(`${tag}: gekürzt ${res.ellipsis.length}: ${res.ellipsis.slice(0, 5).join(" | ")}`); }
        fontMed[`${sheet}|${size.id}|${preset}`] = median(res.fontSizes);
        if (shot) {
            const el = await page.$("#" + id);
            await el.screenshot({ path: path.join(__dirname, id + ".png"), timeout: 60000 });
        }
        return res;
    };

    for (const sheet of sheets) {
        if (only.length && !only.includes(sheet)) { continue; }
        for (const size of SIZES) {
            for (const preset of ["compact", "fullhd"]) {
                await runOne(sheet, size, preset, 0, true);
            }
        }
        // the export host may also report the edit flag (export started from the
        // editor): chrome must still be suppressed — allowInteractions decides
        await runOne(sheet, SIZES[2], "compact", 1, false);
        await runOne(sheet, SIZES[0], "presentation", 0, true);
        // (e) preset ratios on the same tile (median text size)
        for (const size of SIZES) {
            const c = fontMed[`${sheet}|${size.id}|compact`], f = fontMed[`${sheet}|${size.id}|fullhd`];
            measure(`${sheet} ${size.id}: Median-Schrift HD ${c} · Full HD ${f} (×${(f / c).toFixed(2)})`);
            check(f / c >= 1.35 && f / c <= 1.65, `(e) ${sheet} ${size.w}×${size.h}: Full HD ≈ ×1,5 HD`, `×${(f / c).toFixed(2)}`);
        }
        const c0 = fontMed[`${sheet}|a4|compact`], p0 = fontMed[`${sheet}|a4|presentation`];
        measure(`${sheet} a4: Median-Schrift UHD ${p0} (×${(p0 / c0).toFixed(2)})`);
        check(p0 / c0 >= 1.8 && p0 / c0 <= 2.2, `(e) ${sheet} 1100×620: UHD ≈ ×2 HD`, `×${(p0 / c0).toFixed(2)}`);
    }
    await browser.close();
    console.log(oks + " checks ok, " + fails.length + " FAIL, " + errors + " errors");
    if (fails.length > 0 || errors > 0) { process.exit(1); }
})();
