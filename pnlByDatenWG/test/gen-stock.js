/* eslint-disable powerbi-visuals/non-literal-fs-path -- generator, paths are fixed under the repo */
// 1.7 stock vs flow (Bestand vs. Fluss): ONE generator for the balance-sheet and
// cash-flow examples, so that every copy carries the same numbers:
//
//   test/stock-data.js            — harness / node fixture (window.STOCK_DEMO, module.exports)
//   src/demo-stock.ts             — the hub's mini previews of T05A / T05B (names as UI_DN_ keys)
//   demoData/bilanz-dim-konten.csv + bilanz-fact.csv       — balance sheet, contract of the
//   demoData/cashflow-dim-konten.csv + cashflow-fact.csv   — finance-data-model skill
//
// Daten-WG Brauerei, 2026, kEUR inside (EUR in the outputs). AC Jan–Sep (the
// open months stay empty, rule 1 of the skill), PY / PL / FC Jan–Dec, FC as
// version 9+3 (actual months carry the actuals). The cash flow closes the cash
// position of the balance sheet month by month (Endbestand = Kasse und Bank),
// and assets = equity and liabilities in every month and scenario.
//
// Run: node test/gen-stock.js            (writes the four targets)
//      node test/gen-stock.js --check    (exit 1 when a target is stale — test/i18n-test.js)
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const MONTHS = Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, "0")}`);
const AC_MONTHS = 9; // actuals through September 2026
const END = ["31", "28", "31", "30", "31", "30", "31", "31", "30", "31", "30", "31"];

// ---- monthly drivers per scenario (kEUR) ---------------------------------------
// net income, depreciation, change of working capital (cash effect), capex (−),
// disposals (+), loan repayment (−), dividend (−); inventories, receivables and
// provisions as monthly changes of the stand (the payables close the balance)
const season = [0.7, 0.75, 0.9, 1.0, 1.1, 1.35, 1.45, 1.4, 1.05, 0.9, 0.8, 0.95];
function drivers(kind) {
    const k = { ac: 1, py: 0.86, pl: 0.95, fcRest: 0.92 }[kind];
    return MONTHS.map((_, i) => {
        const ni = Math.round(season[i] * 95 * k);
        const dep = Math.round(kind === "py" ? 52 : 55);
        const dInv = Math.round((season[i] - 1) * 60 * (kind === "py" ? 0.9 : 1));
        const dRec = Math.round((season[i] - 1) * 80 * (kind === "pl" ? 0.9 : 1));
        const dProv = i % 3 === 2 ? 15 : -4;
        const capex = -Math.round(i === 5 ? 420 * (kind === "py" ? 0.6 : kind === "pl" ? 0.85 : 1) : 40 * k);
        const disp = i === 7 ? 25 : 0;
        const repay = -(kind === "py" ? 50 : 60);
        const div = i === 4 ? -Math.round(kind === "py" ? 180 : 220) : 0;
        // working capital cash effect: −(Δ inventories + Δ receivables − Δ provisions − Δ payables)
        const dPay = Math.round((season[i] - 1) * 45);
        const wc = -(dInv + dRec - dProv - dPay);
        return { ni, dep, wc, capex, disp, repay, div, dInv, dRec, dProv, dPay };
    });
}

// opening stands 2026 (the closing stands of December 2025)
const OPEN = {
    cur: { ppe: 4800, inv: 1200, rec: 1500, cash: 600, eq: 3200, prov: 700, bank: 2600, pay: 1600 },
};

/** a scenario's twelve months: the flows and the stands they move */
function path12(open, drv) {
    const st = { ...open };
    const out = [];
    for (const d of drv) {
        const opening = st.cash;
        const flows = { ni: d.ni, dep: d.dep, wc: d.wc, capex: d.capex, disp: d.disp, repay: d.repay, div: d.div };
        const cf = Object.values(flows).reduce((a, b) => a + b, 0);
        st.cash += cf;
        st.ppe += -d.capex - d.dep - d.disp;
        st.inv += d.dInv; st.rec += d.dRec; st.prov += d.dProv;
        st.eq += d.ni + d.div; st.bank += d.repay;
        // the payables close the balance (they carry the rest of the working capital)
        const assets = st.ppe + st.inv + st.rec + st.cash;
        st.pay = assets - st.eq - st.prov - st.bank;
        out.push({ opening, flows, stands: { ...st } });
    }
    return out;
}

const AC = path12(OPEN.cur, drivers("ac"));
// the previous year ends where 2026 starts: its opening stands are the 2026 opening
// minus the movements of the previous year, so every PY December stand is the
// opening stand of January 2026 (the payables close the balance by themselves)
const PY = (() => {
    const d = drivers("py");
    const sum = (f) => d.reduce((a, x) => a + f(x), 0);
    const o = OPEN.cur;
    return path12({
        ppe: o.ppe - sum(x => -x.capex - x.dep - x.disp), inv: o.inv - sum(x => x.dInv), rec: o.rec - sum(x => x.dRec),
        cash: o.cash - sum(x => x.ni + x.dep + x.wc + x.capex + x.disp + x.repay + x.div),
        eq: o.eq - sum(x => x.ni + x.div), prov: o.prov - sum(x => x.dProv), bank: o.bank - sum(x => x.repay), pay: 0,
    }, d);
})();
const PL = path12(OPEN.cur, drivers("pl"));
// FC 9+3: the actual months, then a forecast from the September actuals
const FC = (() => {
    const rest = path12(AC[AC_MONTHS - 1].stands, drivers("fcRest").slice(AC_MONTHS));
    return [...AC.slice(0, AC_MONTHS), ...rest];
})();
const SCN = { ac: AC, py: PY, pl: PL, fc: FC };

// ---- the rows ------------------------------------------------------------------
// [id, key, levels (keys), sort, rowType cell, formula (keys) | null, sign, displayInvert, varianceInvert, value(month)]
// balance sheet: no stock token — the template T05A sets statement.stockMode = allStock
// (a pure balance sheet without a token column); the source delivers credit balances
// negative (trial balance), so the equity-and-liabilities side carries SignConvention −1
const BS = [
    ["A_SACH", "BsPpe", ["BsAssets", "BsPpe"], 11, "Account", null, 1, false, false, m => m.stands.ppe],
    ["A_VORR", "BsInventory", ["BsAssets", "BsInventory"], 12, "Account", null, 1, false, true, m => m.stands.inv],
    ["A_FORD", "BsReceivables", ["BsAssets", "BsReceivables"], 13, "Account", null, 1, false, true, m => m.stands.rec],
    ["A_KASSE", "BsCash", ["BsAssets", "BsCash"], 14, "Account", null, 1, false, false, m => m.stands.cash],
    ["P_EK", "BsEquity", ["BsLiabEq", "BsEquity"], 21, "Account", null, -1, false, false, m => -m.stands.eq],
    ["P_RUECK", "BsProvisions", ["BsLiabEq", "BsProvisions"], 22, "Account", null, -1, false, true, m => -m.stands.prov],
    ["P_BANK", "BsBank", ["BsLiabEq", "BsBank"], 23, "Account", null, -1, false, true, m => -m.stands.bank],
    ["P_VLUL", "BsPayables", ["BsLiabEq", "BsPayables"], 24, "Account", null, -1, false, true, m => -m.stands.pay],
];
// cash flow: opening stand (token "opening") → three flow blocks → closing stand (formula, token "stock")
const CF = [
    ["CF_ANF", "CfOpening", ["CfOpening"], 10, "Account opening", null, 1, false, false, m => m.opening],
    ["CF_JUE", "CfNetIncome", ["CfOperating", "CfNetIncome"], 21, "Account", null, 1, false, false, m => m.flows.ni],
    ["CF_ABS", "CfDepreciation", ["CfOperating", "CfDepreciation"], 22, "Account", null, 1, false, false, m => m.flows.dep],
    ["CF_WC", "CfWorkingCapital", ["CfOperating", "CfWorkingCapital"], 23, "Account", null, 1, false, false, m => m.flows.wc],
    ["CF_INV", "CfCapex", ["CfInvesting", "CfCapex"], 31, "Account", null, 1, false, false, m => m.flows.capex],
    ["CF_DES", "CfDisposals", ["CfInvesting", "CfDisposals"], 32, "Account", null, 1, false, false, m => m.flows.disp],
    ["CF_TIL", "CfRepayment", ["CfFinancing", "CfRepayment"], 41, "Account", null, 1, false, false, m => m.flows.repay],
    ["CF_DIV", "CfDividend", ["CfFinancing", "CfDividend"], 42, "Account", null, 1, false, false, m => m.flows.div],
    ["CF_END", "CfClosing", ["CfClosing"], 50, "Formula stock",
        "[@CfOpening]+[@CfOperating]+[@CfInvesting]+[@CfFinancing]", 1, false, false, null],
];

const DE = {
    BsAssets: "Aktiva", BsPpe: "Sachanlagen", BsInventory: "Vorräte", BsReceivables: "Forderungen LuL",
    BsCash: "Kasse und Bank", BsLiabEq: "Passiva", BsEquity: "Eigenkapital", BsProvisions: "Rückstellungen",
    BsBank: "Verbindlichkeiten Kreditinstitute", BsPayables: "Verbindlichkeiten LuL",
    CfOpening: "Anfangsbestand Zahlungsmittel", CfOperating: "Operativer Cashflow", CfNetIncome: "Jahresüberschuss",
    CfDepreciation: "Abschreibungen", CfWorkingCapital: "Veränderung Working Capital", CfInvesting: "Investiver Cashflow",
    CfCapex: "Investitionen Sachanlagen", CfDisposals: "Anlagenabgänge", CfFinancing: "Finanzierungs-Cashflow",
    CfRepayment: "Tilgung Darlehen", CfDividend: "Dividende", CfClosing: "Endbestand Zahlungsmittel",
};

/** monthly values of a row, kEUR: { ac, py, pl, fc } arrays (AC empty after September) */
function seriesOf(val) {
    const o = {};
    for (const [s, p] of Object.entries(SCN)) {
        o[s] = p.map((m, i) => (s === "ac" && i >= AC_MONTHS ? null : val(m)));
    }
    return o;
}
/** FY scalars of the fact table (FC_FY / PL_FY), kEUR — stocks: the stand at the end (opening: the start) */
function fyOf(ser, kind) {
    const acfc = ser.fc; // FC 9+3 = AC through September + forecast
    if (kind === "flow") { return { fcfy: acfc.reduce((a, b) => a + b, 0), plfy: ser.pl.reduce((a, b) => a + b, 0) }; }
    if (kind === "first") { return { fcfy: acfc[0], plfy: ser.pl[0] }; }
    return { fcfy: acfc[11], plfy: ser.pl[11] };
}

// ---- outputs -------------------------------------------------------------------
const outputs = {};

// (1) harness / node fixture
{
    const rowsOf = (defs, kindOf) => defs.map(([id, key, levels, sort, rt, f, sign, disp, vinv, val]) => {
        const ser = val ? seriesOf(val) : null;
        return {
            id, name: DE[key], levels: levels.map(k => DE[k]), sort, rowType: rt,
            formulaDef: f ? f.replace(/\[@([A-Za-z]+)\]/g, (_, k) => "[" + DE[k] + "]") : null,
            sign, displayInvert: disp, varianceInvert: vinv,
            series: ser ? Object.fromEntries(Object.entries(ser).map(([s, a]) => [s, a.map(v => (v == null ? null : v * 1000))])) : null,
            fy: ser ? Object.fromEntries(Object.entries(fyOf(ser, kindOf(id))).map(([s, v]) => [s, v * 1000])) : null,
        };
    });
    const data = {
        months: MONTHS, acMonths: AC_MONTHS,
        bilanz: rowsOf(BS, () => "last"),
        cashflow: rowsOf(CF, id => (id === "CF_ANF" ? "first" : "flow")),
    };
    outputs["test/stock-data.js"] = `// GENERATED by test/gen-stock.js — do not edit by hand.
// 1.7 stock vs flow fixtures (Daten-WG Brauerei 2026, EUR): a balance sheet with
// eight positions (no stock token: the template sets statement.stockMode =
// allStock) and a cash flow (opening stand "Account opening" → three flow blocks
// → closing stand "Formula stock"). AC Jan–Sep, PY / PL / FC Jan–Dec (FC 9+3).
// STOCK_DEMO.rows(set, opt) gives level-input rows (one per account × month, the
// formula row once); opt.fy adds the FY scalars, opt.flat drops the period.
(function () {
  const D = ${JSON.stringify(data)};
  function rows(set, opt) {
    const o = opt || {};
    const out = [];
    let index = 0;
    for (const r of D[set]) {
      const base = { levels: [...r.levels, null, null].slice(0, 3), account: r.id, name: null, sort: r.sort,
        rowType: r.rowType, formulaDef: r.formulaDef, sign: r.sign, displayInvert: r.displayInvert,
        varianceInvert: r.varianceInvert, comment: null };
      if (!r.series) { out.push({ ...base, values: {}, month: null, index: index++ }); continue; }
      D.months.forEach((m, i) => {
        if (o.flat && i !== (o.flatMonth ?? D.acMonths - 1)) { return; }
        const v = {};
        for (const s of ["ac", "py", "pl", "fc"]) { if (r.series[s][i] != null && !(o.noFc && s === "fc")) { v[s] = r.series[s][i]; } }
        if (o.fy && r.fy) { v.fcfy = r.fy.fcfy; v.plfy = r.fy.plfy; }
        out.push({ ...base, values: v, month: o.flat ? null : m, index: index++ });
      });
    }
    if (o.rowType) { for (const x of out) { x.rowType = o.rowType(x); } }
    return out;
  }
  const api = { data: D, rows };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof window !== "undefined") { window.STOCK_DEMO = api; }
})();
`;
}

// (2) the hub's mini previews (compact, kEUR; names as resource keys)
{
    const lines = [];
    for (const [set, defs] of [["bilanz", BS], ["cashflow", CF]]) {
        for (const [id, , levels, sort, rt, f, sign, disp, vinv, val] of defs) {
            const ser = val ? seriesOf(val) : null;
            lines.push(`    { set: ${JSON.stringify(set)}, id: ${JSON.stringify(id)}, levels: ${JSON.stringify(levels)}, sort: ${sort}, ` +
                `type: ${JSON.stringify(rt)}, f: ${JSON.stringify(f)}, sign: ${sign}, disp: ${disp}, varInv: ${vinv}` +
                (ser ? `,\n      ac: ${JSON.stringify(ser.ac)}, py: ${JSON.stringify(ser.py)}, pl: ${JSON.stringify(ser.pl)}, fc: ${JSON.stringify(ser.fc)}` : "") +
                " },");
        }
    }
    outputs["src/demo-stock.ts"] = `/*
 * 1.7 stock vs flow — the balance sheet and the cash flow of the hub's mini
 * previews (templates T05A / T05B). GENERATED by test/gen-stock.js — do not
 * edit by hand. Values in kEUR (buildStockDemoRows turns them into EUR), AC
 * January to September, PY / PL / FC the whole year. Level names and formula
 * references are resource keys (UI_DN_<key>), like the Smart Start demo.
 * The balance sheet carries no stock token (T05A sets statement.stockMode =
 * allStock); the cash flow marks its opening and closing stand.
 */
import { LevelInputRow, parseRowTypeInfo } from "./engine";

export const STOCK_DEMO_MONTHS = ${JSON.stringify(MONTHS)};

/** which example a mini preview draws */
export type StockDemoSet = "bilanz" | "cashflow";

interface StockDemoRow {
    set: StockDemoSet; id: string; levels: string[]; sort: number; type: string; f: string | null;
    sign: number; disp: boolean; varInv: boolean;
    ac?: (number | null)[]; py?: (number | null)[]; pl?: (number | null)[]; fc?: (number | null)[];
}

const ROWS: StockDemoRow[] = [
${lines.join("\n")}
];

/** one example as level-input rows (one per account × month, the formula row once) */
export function buildStockDemoRows(set: StockDemoSet, name: (key: string) => string): LevelInputRow[] {
    const nm = (k: string): string => name("UI_DN_" + k);
    const rows: LevelInputRow[] = [];
    let index = 0;
    for (const r of ROWS) {
        if (r.set !== set) { continue; }
        const info = parseRowTypeInfo(r.type);
        const lv: (string | null)[] = [...r.levels.map(nm), null, null].slice(0, 3);
        const base = {
            levels: lv, account: r.id, name: null,
            sort: r.sort, rowType: info.rowType, stock: info.stock, flow: info.flow,
            formulaDef: r.f == null ? null : r.f.replace(/\\[@([A-Za-z]+)\\]/g, (_m: string, k: string) => "[" + nm(k) + "]"),
            sign: r.sign, displayInvert: r.disp, varianceInvert: r.varInv, comment: null,
        };
        if (!r.ac) { rows.push({ ...base, values: {}, month: null, index: index++ }); continue; }
        STOCK_DEMO_MONTHS.forEach((m, i) => {
            const v = (a?: (number | null)[]): number | null => (a && a[i] != null ? a[i]! * 1000 : null);
            rows.push({ ...base, month: m, index: index++, values: { ac: v(r.ac), py: v(r.py), pl: v(r.pl), fc: v(r.fc) } });
        });
    }
    return rows;
}
`;
}

// (3) demoData CSVs — the column contract of the finance-data-model skill
{
    const dimHead = "AccountID;AccountName;L1;L2;SortOrder;RowType;FormulaDef;SignConvention;DisplayInvert;VarianceInvert;Einheit;Comment";
    const factHead = "AccountID;Datum;Periode;AC;PY;PL;FC;PL_FY;FC_FY";
    const comments = {
        A_SACH: "Investition Abfüllanlage im Juni.",
        P_RUECK: "Rückstellungen höher = ungünstig (VarianceInvert).",
        CF_ANF: "Anfangsbestand: Stand am Periodenbeginn (Token opening).",
        CF_END: "Endbestand = Anfangsbestand + Cashflows (Formel, Token stock).",
    };
    const dim = (defs, bs) => [dimHead, ...defs.map(([id, key, levels, sort, rt, f, sign, disp, vinv]) => [
        id, DE[key], DE[levels[0]], levels[1] ? DE[levels[1]] : "", sort,
        // the CSV of the balance sheet carries the token, so the model also works with stockMode = auto
        bs ? "Account stock" : rt,
        f ? f.replace(/\[@([A-Za-z]+)\]/g, (_, k) => "[" + DE[k] + "]") : "", sign, disp, vinv, "EUR", comments[id] || "",
    ].join(";"))].join("\n") + "\n";
    const fact = (defs, kindOf) => {
        const lines = [factHead];
        for (const [id, , , , , , , , , val] of defs) {
            if (!val) {
                // the formula row gets one empty fact row (the join keeps it, skill §9)
                lines.push([id, "2026-01-31", "2026-01", "", "", "", "", "", ""].join(";"));
                continue;
            }
            const ser = seriesOf(val);
            const fy = fyOf(ser, kindOf(id));
            MONTHS.forEach((m, i) => {
                const e = (v) => (v == null ? "" : String(Math.round(v * 1000)));
                lines.push([id, `${m}-${END[i]}`, m, e(ser.ac[i]), e(ser.py[i]), e(ser.pl[i]), e(ser.fc[i]),
                    e(fy.plfy), e(fy.fcfy)].join(";"));
            });
        }
        return lines.join("\n") + "\n";
    };
    outputs["demoData/bilanz-dim-konten.csv"] = dim(BS, true);
    outputs["demoData/bilanz-fact.csv"] = fact(BS, () => "last");
    outputs["demoData/cashflow-dim-konten.csv"] = dim(CF, false);
    outputs["demoData/cashflow-fact.csv"] = fact(CF, id => (id === "CF_ANF" ? "first" : "flow"));
}

// ---- self-checks: the books balance --------------------------------------------
for (const [s, p] of Object.entries(SCN)) {
    p.forEach((m, i) => {
        const a = m.stands.ppe + m.stands.inv + m.stands.rec + m.stands.cash;
        const l = m.stands.eq + m.stands.prov + m.stands.bank + m.stands.pay;
        if (Math.abs(a - l) > 1e-9) { throw new Error(`${s} ${MONTHS[i]}: assets ${a} ≠ liabilities ${l}`); }
        if (i > 0 && Math.abs(m.opening - p[i - 1].stands.cash) > 1e-9) { throw new Error(`${s} ${MONTHS[i]}: opening ≠ previous closing`); }
        if (m.stands.pay <= 0) { throw new Error(`${s} ${MONTHS[i]}: payables ${m.stands.pay} ≤ 0`); }
    });
}
for (const [k, v] of Object.entries(OPEN.cur)) {
    if (Math.abs(PY[11].stands[k] - v) > 1e-9) { throw new Error(`PY closing December ${k} ${PY[11].stands[k]} ≠ opening 2026 ${v}`); }
}

if (process.argv.includes("--check")) {
    const stale = Object.entries(outputs).filter(([f, c]) => !fs.existsSync(path.join(ROOT, f))
        || fs.readFileSync(path.join(ROOT, f), "utf8") !== c).map(([f]) => f);
    if (stale.length) { console.error("stale: " + stale.join(", ") + " — run node test/gen-stock.js"); process.exit(1); }
    console.log("stock fixtures up to date");
} else {
    for (const [f, c] of Object.entries(outputs)) { fs.writeFileSync(path.join(ROOT, f), c); }
    console.log("wrote " + Object.keys(outputs).join(", "));
    const last = AC[AC_MONTHS - 1];
    console.log(`AC Sep: assets ${last.stands.ppe + last.stands.inv + last.stands.rec + last.stands.cash} · cash ${last.stands.cash}` +
        ` · PY Sep cash ${PY[AC_MONTHS - 1].stands.cash} · FC Dec cash ${FC[11].stands.cash} · PL Dec cash ${PL[11].stands.cash}`);
}
