// Spike-Demo: vier Kacheln mit den echten Kitchen-Visuals auf Fixture-Daten im Format
// des Semantikmodell-Konnektors. Ein Klick auf einen Monat in der Varianzanalyse filtert
// GuV, KPI-Karten und Kostenbrücke (Querfilter der App, wie in den Fabric Apps).

import { daxQuery, mountVisual, VERSIONS, type QueryTable, type SelectionKey, type VisualHandle } from "../src/index";
import fixtures from "./fixtures.json";

const F = fixtures as Record<"guv" | "zeit" | "kpis" | "kosten", QueryTable>;
const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

let theme: "light" | "dark" = "light";
let month: string | null = null;
const handles: Record<string, VisualHandle> = {};
const timings: Record<string, number> = {};

// GuV- und KPI-Zeilen auf den gewählten Monat einschränken. In einer echten App wäre
// das ein TREATAS-Filter in daxQuery(); hier filtert die App die Fixture-Zeilen.
function guvFor(m: string | null): QueryTable {
    if (!m) { return F.guv; }
    const mi = F.guv.columns.findIndex(c => c.name === "Kalender[Monat]");
    return { columns: F.guv.columns, rows: F.guv.rows.filter(r => r[mi] == null || r[mi] === m) };
}

function kpisFor(m: string | null): QueryTable {
    if (!m) { return F.kpis; }
    const g = guvFor(m);
    const col = (n: string) => g.columns.findIndex(c => c.name === n);
    const [l1, typ, sign, ac, py, pl] = ["Konten[Ebene 1]", "Konten[Zeilentyp]", "Konten[Vorzeichen]", "[ac]", "[py]", "[pl]"].map(col);
    const sum = (name: unknown, i: number) => Math.abs(g.rows
        .filter(r => r[l1] === name && r[typ] === "account")
        .reduce((s, r) => s + (Number(r[i]) || 0) * Number(r[sign]), 0));
    return { columns: F.kpis.columns, rows: F.kpis.rows.map(r => [r[0], r[1], sum(r[0], ac), sum(r[0], py), sum(r[0], pl)]) };
}

function renderChips() {
    const box = $("#chips");
    box.replaceChildren();
    if (!month) { box.hidden = true; return; }
    box.hidden = false;
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.textContent = `Monat: ${month}  ×`;
    chip.title = "Filter aufheben";
    chip.onclick = () => setMonth(null, true);
    box.appendChild(chip);
}

function setMonth(m: string | null, fromChip = false) {
    month = m;
    if (fromChip) { handles.zeit?.clearSelection(); }
    handles.guv?.update({ table: guvFor(month), objects: { ...handles.guv.objects, titleBlock: { measureLine: "GuV in EUR", periodLine: month ? `${month} 2026` : "Jan–Jun 2026" } } });
    handles.kpis?.update({ table: kpisFor(month) });
    renderChips();
}

function showTimings() {
    $("#timings").textContent = Object.entries(timings).map(([k, v]) => `${k} ${v.toFixed(0)} ms`).join(" · ");
}

async function main() {
    $("#versions").textContent = `ChartKitchen ${VERSIONS.chartkitchen} · P&L ${VERSIONS.pnl}`;
    // so sähe die Abfrage für die Varianzanalyse gegen ein echtes Semantikmodell aus
    const q = daxQuery("chartkitchen", {
        category: "'Kalender'[Monat]",
        actual: "[Umsatz AC]", previousYear: "[Umsatz PY]", plan: "[Umsatz PL]", forecast: "[Umsatz FC]",
    }, { sortBy: { "'Kalender'[Monat]": "'Kalender'[MonatNr]" } });
    $("#dax").textContent = q.query;

    const common = (name: string) => ({
        locale: "de-DE", theme,
        onRendered: (ms: number) => { timings[name] = ms; showTimings(); },
        onError: (e: unknown) => { console.error(name, e); $("#errors").textContent += `${name}: ${String(e)}\n`; },
    });

    const t0 = performance.now();
    const [kpis, zeit, kosten, guv] = await Promise.all([
        mountVisual($("#v-kpis"), {
            visual: "chartkitchen", table: kpisFor(null), ...common("KPI"),
            bindings: { category: "KPI[Name]", actual: "[actual]", previousYear: "[previousYear]", plan: "[plan]" },
            displayNames: { "[actual]": "Kennzahlen" },
            objects: { chart: { orientation: "cards", invertList: "Herstellungskosten, Betriebsaufwand, Abschreibungen" } },
        }),
        mountVisual($("#v-zeit"), {
            visual: "chartkitchen", table: F.zeit, ...common("VarInt"), bindings: q.bindings, displayNames: q.displayNames,
            objects: {
                chart: { orientation: "intwaterfall" },
                ibcsTitle: { kpi: "Umsatz", period: "2026", message: "Umsatz liegt Jan–Jun über Vorjahr, Forecast hält den Plan." },
            },
            onSelect: (keys: SelectionKey[]) => {
                const m = keys.length ? String(keys[0]["Kalender[Monat]"] ?? "") : null;
                setMonth(m && F.guv.rows.some(r => r[10] === m) ? m : null);
                $("#last-select").textContent = JSON.stringify(keys);
            },
        }),
        mountVisual($("#v-kosten"), {
            visual: "chartkitchen", table: F.kosten, ...common("Kostenbrücke"),
            bindings: { category: "Konten[Kostenart]", actual: "[actual]", plan: "[plan]" },
            objects: {
                chart: { orientation: "catbridge", comparisonMode: "plan", invert: true, sortByImpact: true },
                ibcsTitle: { kpi: "Kosten", period: "Jan–Jun 2026" },
            },
        }),
        mountVisual($("#v-guv"), {
            visual: "pnl", table: guvFor(null), ...common("GuV"),
            bindings: {
                levels: ["Konten[Ebene 1]", "Konten[Ebene 2]", "Konten[Ebene 3]"], account: "Konten[Konto]",
                sortOrder: "Konten[Sortierung]", rowType: "Konten[Zeilentyp]", formulaDef: "Konten[Formel]",
                signConvention: "Konten[Vorzeichen]", displayInvert: "Konten[Kosten positiv]",
                varianceInvert: "Konten[Abweichung invertiert]", period: "Kalender[Monat]",
                ac: "[ac]", py: "[py]", pl: "[pl]", fcFy: "[fcFy]", plFy: "[plFy]",
            },
            objects: { titleBlock: { measureLine: "GuV in EUR", periodLine: "Jan–Jun 2026" } },
        }),
    ]);
    Object.assign(handles, { kpis, zeit, kosten, guv });
    $("#mount-ms").textContent = `${(performance.now() - t0).toFixed(0)} ms bis alle vier Visuals stehen`;
    document.body.dataset.ready = "1";

    $("#theme").onclick = () => {
        theme = theme === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = theme;
        for (const h of Object.values(handles)) { h.update({ theme }); }
    };
}

main().catch(e => { $("#errors").textContent += String(e?.stack ?? e); });
