/**
 * P&L calc engine — pure TypeScript, no Power BI dependencies.
 *
 * Responsibilities (requirements F1–F4):
 *  - build an unbalanced parent-child tree from account-dimension rows,
 *    orphans go to a visible "unassigned" bucket (never silently dropped)
 *  - subtotal rows sum their children using each row's sign convention
 *  - formula rows evaluate FormulaDef expressions like "[EBITDA]/[Revenue]"
 *    with cycle detection; errors surface on the row instead of breaking
 *  - variances Δ / Δ% against a selectable reference scenario with
 *    variance-invert support (costs below plan = good)
 *
 * The engine only ever computes on the rows it is given — RLS/filters are
 * respected by construction (rule 4.4: never invent values).
 */

export type Scenario = "ac" | "py" | "pl" | "fc" | "fcfy" | "plfy";
export const SCENARIOS: Scenario[] = ["ac", "py", "pl", "fc", "fcfy", "plfy"];
/** Full-year scalars: repeated per month in month-grain data — first value wins, never summed. */
export const FY_SCENARIOS: Scenario[] = ["fcfy", "plfy"];
/** Scenarios that carry a monthly series for sparklines. */
export const SERIES_SCENARIOS: Scenario[] = ["ac", "py", "pl", "fc"];

export type RowType = "account" | "subtotal" | "formula" | "kpi" | "separator";

/**
 * 1.7 stock vs flow (Bestand vs. Fluss): how a STOCK row aggregates over a
 * period window — "last" = the stand at the end of the window (balance sheet,
 * cash, working capital, headcount; the default of the stock token), "first"
 * = the stand at the start of the window (opening balance of a cash-flow
 * bridge). A flow row (null) sums its months, as before 1.7.
 */
export type StockAgg = "last" | "first";

/**
 * statement.stockMode (1.7): "auto" reads the stock tokens of the row-type
 * cell (and inherits them to totals), "allStock" treats every row as a stock
 * (a pure balance sheet without a token column), "allFlow" is the behaviour
 * before 1.7 — every row a flow, tokens ignored.
 */
export type StockMode = "auto" | "allStock" | "allFlow";

export interface InputRow {
    id: string;
    parent: string | null;
    name: string;
    sort: number;
    rowType: RowType;
    formulaDef: string | null;
    sign: number;
    displayInvert: boolean;
    varianceInvert: boolean;
    /** 1.7 explicit stock token of the row-type cell (stock / opening …); absent = none */
    stock?: StockAgg | null;
    /** 1.7 explicit flow token (flow / fluss …) — overrides the inheritance of a total or formula */
    flow?: boolean;
    values: Partial<Record<Scenario, number | null>>;
    /** Monthly series (aligned to PnlModel.months) for sparklines; signed like values. */
    series?: Partial<Record<Scenario, (number | null)[]>>;
    comment: string | null;
    index: number;
    /**
     * Every data-view row index this row was built from. A month-grain account
     * folds twelve source rows into one InputRow — `index` keeps the first one
     * (sort fallback), `srcIdx` keeps all of them, which is what a Power BI
     * selection id has to be built over (one id per source row). Generated rows
     * (synthetic level parents, the orphan bucket) carry none; their selection
     * is the union of the leaves below them.
     */
    srcIdx?: number[];
}

export interface PnlNode {
    row: InputRow;
    children: PnlNode[];
    level: number;
    computed: Record<Scenario, number | null>;
    /** Rolled-up monthly series (subtotals: child sums; formulas: per-month eval). */
    series: Partial<Record<Scenario, (number | null)[]>>;
    error: string | null;
    hasChildren: boolean;
    isOrphanBucket: boolean;
    /**
     * 1.7 effective stock class after statement.stockMode, the explicit tokens
     * and the inheritance (totals / formulas whose operands are all stocks);
     * null = flow. Optional so that hand-built nodes (tests, the virtual
     * total) read as flows.
     */
    stock?: StockAgg | null;
    /**
     * 1.7 a stock is involved below this row (operand, child or deeper): its
     * period values are then evaluated on the window values of its operands
     * (windowValue) instead of summing its own monthly series.
     */
    stockInside?: boolean;
    /** 1.7 operands / children mix stocks and flows — the classification followed the first operand */
    stockMix?: boolean;
}

export interface PnlModel {
    roots: PnlNode[];
    byId: Map<string, PnlNode>;
    maxDepth: number;
    months: string[];
    warnings: string[];
    /** 1.7 statement.stockMode the model was built with */
    stockMode?: StockMode;
}

/** 1.7 options of buildModel */
export interface BuildOptions {
    /** statement.stockMode (default auto) */
    stockMode?: StockMode;
    /**
     * FY outlook from the monthly series where no FY measure is bound (the
     * visual sets it for models with stock rows): fcfy ← AC up to the last
     * actuals month + FC for the rest of the year (stocks: the stand at the end
     * of that combined series), plfy ← PL (stocks: the PL stand at the end).
     */
    fyFromSeries?: { fcfy?: boolean; plfy?: boolean };
}

export interface Variance {
    delta: number | null;
    deltaPct: number | null;
    good: boolean;
}

const ORPHAN_ID = "__unassigned__";
/** id of the virtual total root (see syntheticTotal) — never a real row id */
export const TOTAL_ID = "__TOTAL__";
const LEVEL_PREFIX = "L:";
const LEVEL_SEP = "¦"; // ¦ — unlikely in account names

/** Input row for the star-schema variant: flattened level columns L1..Ln. */
export interface LevelInputRow {
    levels: (string | null)[];
    account: string | null;
    name: string | null;
    sort: number | null;
    rowType: RowType;
    formulaDef: string | null;
    sign: number;
    displayInvert: boolean;
    varianceInvert: boolean;
    /** 1.7 explicit stock token (see InputRow.stock) */
    stock?: StockAgg | null;
    /** 1.7 explicit flow token (see InputRow.flow) */
    flow?: boolean;
    values: Partial<Record<Scenario, number | null>>;
    month: string | null;
    comment: string | null;
    index: number;
}

// ---- period keys: one place decides in which order the periods are read

/** How the bound period column is ordered (format pane: columns.periodSort). */
export type PeriodSort = "auto" | "data" | "calendar";

/**
 * A period label broken into its calendar position. `y` is null when the label
 * carries no year at all ("Dez", "March", "7") — such a column can only be put
 * in calendar order, never on a timeline.
 */
export interface PeriodKey {
    y: number | null;
    /** 1..12 */
    m: number;
    /** day of month, 0 when the label names no day */
    d: number;
}

/**
 * Month stems, German and English, long and short. Everything is folded to
 * lower case without umlauts first, then looked up whole and — failing that —
 * by its first three letters, so "Dezember", "Dez.", "Dec", "March", "März"
 * and "Mrz" all land on the same number.
 */
const MONTH_STEM: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, mrz: 3, apr: 4, mai: 5, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dez: 12, dec: 12,
};

/** lower case, umlauts folded — the shape MONTH_STEM is keyed on */
function foldWord(s: string): string {
    return s.toLowerCase()
        .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "s");
}

/**
 * Below this a bare number is a figure (a month position, a fiscal period),
 * above it an epoch timestamp in milliseconds (~1973 and later). Hosts hand
 * date columns over as ISO text or as Date objects; a numeric stamp only shows
 * up when the model itself carries one.
 */
const MS_EPOCH_MIN = 1e11;

/**
 * Read one period label into its calendar position — the single parser behind
 * every ordering decision. Supported, in this order:
 *
 *  · "YYYY-MM", "YYYY-MM-DD", ISO timestamps ("2026-03-01T00:00:00Z"),
 *    "YYYY/MM" — the classic text key, unchanged;
 *  · a plain number: 1..12 is a calendar position, a large one an epoch
 *    timestamp in milliseconds;
 *  · a month name, German or English, long or short, with or without a dot and
 *    in any casing ("Dez", "Dez.", "Dezember", "Dec", "March", "Mär", "Mrz"),
 *    optionally with a four-digit year on either side ("Mär 2026", "2026 Mar").
 *
 * Anything else returns null — the caller then falls back to data order rather
 * than guessing (fiscal calendars, week labels, "P01".."P13" …).
 */
export function parsePeriod(raw: string | null | undefined): PeriodKey | null {
    const s = String(raw ?? "").trim();
    if (s === "") { return null; }

    const iso = /^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/.exec(s);
    if (iso) {
        const m = Number(iso[2]);
        if (m < 1 || m > 12) { return null; }
        return { y: Number(iso[1]), m, d: iso[3] == null ? 0 : Number(iso[3]) };
    }

    if (/^-?\d+(?:[.,]\d+)?$/.test(s)) {
        const n = Number(s.replace(",", "."));
        if (!isFinite(n)) { return null; }
        if (Number.isInteger(n) && n >= 1 && n <= 12) { return { y: null, m: n, d: 0 }; }
        if (Math.abs(n) >= MS_EPOCH_MIN) {
            const dt = new Date(n);
            if (!isNaN(dt.getTime())) {
                return { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() };
            }
        }
        return null;
    }

    let m = 0;
    let y: number | null = null;
    for (const tok of foldWord(s).split(/[^0-9a-z]+/)) {
        if (tok === "") { continue; }
        if (/^\d+$/.test(tok)) {
            if (tok.length === 4 && y == null) { y = Number(tok); }
            continue;
        }
        if (m !== 0) { continue; }
        const hit = MONTH_STEM[tok] ?? MONTH_STEM[tok.slice(0, 3)];
        if (hit) { m = hit; }
    }
    return m === 0 ? null : { y, m, d: 0 };
}

/**
 * THE one place the period order is decided. `keys` arrive in data order (first
 * appearance in the data view) and come back in render order. Everything
 * downstream — the monthly series indices, the YTD window, the combo chart, the
 * sparklines, the "_Aug" marker — reads PnlModel.months, so the whole visual
 * follows this single decision and no consumer sorts on its own.
 *
 *  · "data"     — first appearance wins (fiscal years, models with their own
 *                 sort column on the period attribute);
 *  · "calendar" — Jan..Dec; where the labels carry a year, year first;
 *  · "auto"     — calendar as soon as *every* label parses, data order
 *                 otherwise (default).
 *
 * Labels that do not parse keep their data order and sort behind the dated
 * ones — a column that mixes the two is a modelling accident, and guessing
 * would only hide it.
 */
export function sortMonths(keys: string[], mode: PeriodSort = "auto"): string[] {
    if (mode === "data") { return [...keys]; }
    const idx = new Map<string, number>();
    const parsed = new Map<string, PeriodKey | null>();
    keys.forEach((k, i) => {
        if (idx.has(k)) { return; }
        idx.set(k, i);
        parsed.set(k, parsePeriod(k));
    });
    if (mode === "auto") {
        for (const p of parsed.values()) { if (p == null) { return [...keys]; } }
    }
    return [...keys].sort((a, b) => {
        const ia = idx.get(a) ?? 0; const ib = idx.get(b) ?? 0;
        const pa = parsed.get(a) ?? null; const pb = parsed.get(b) ?? null;
        if (pa == null || pb == null) {
            if (pa == null && pb == null) { return ia - ib; }
            return pa == null ? 1 : -1;
        }
        return (pa.y ?? -1) - (pb.y ?? -1) || pa.m - pb.m || pa.d - pb.d || ia - ib;
    });
}

/**
 * Month-grain aggregation: merge rows sharing an id into one InputRow —
 * regular scenarios sum up and fill the monthly series, FY scalars
 * (fcfy/plfy, repeated on every month row) take the first value.
 *
 * The period order comes from sortMonths (see there) — the months array this
 * returns is the order every series index in the model is built against.
 */
export function aggregateMonthly(
    rows: (InputRow & { month: string | null })[], sort: PeriodSort = "auto"
): { rows: InputRow[]; months: string[] } {
    const months = sortMonths(
        [...new Set(rows.map(r => r.month).filter((m): m is string => m != null))], sort);
    const byId = new Map<string, InputRow>();
    for (const r of rows) {
        let t = byId.get(r.id);
        if (!t) {
            t = { ...r, values: {}, series: {}, srcIdx: [] };
            delete (t as { month?: string | null }).month;
            byId.set(r.id, t);
        }
        // every source row of this account stays addressable — the selection id
        // of a month-grain account is one id per month, not one for the first
        if (r.index >= 0) { (t.srcIdx as number[]).push(r.index); }
        if (t.comment == null && r.comment != null) { t.comment = r.comment; }
        const mi = r.month != null ? months.indexOf(r.month) : -1;
        for (const s of SCENARIOS) {
            const v = r.values[s];
            if (v == null) { continue; }
            if (FY_SCENARIOS.includes(s)) {
                if (t.values[s] == null) { t.values[s] = v; }
                continue;
            }
            t.values[s] = (t.values[s] ?? 0) + v;
            if (mi >= 0 && SERIES_SCENARIOS.includes(s)) {
                const store = t.series as Partial<Record<Scenario, (number | null)[]>>;
                let arr = store[s];
                if (!arr) { arr = new Array(months.length).fill(null); store[s] = arr; }
                arr[mi] = (arr[mi] ?? 0) + v;
            }
        }
    }
    return { rows: [...byId.values()], months };
}

/**
 * Star-schema mode: build parent-child InputRows from flattened level
 * columns. Ragged rules (both supported):
 *  - trailing empty levels → the last filled level is the leaf
 *  - a level repeating the previous level's value → hierarchy ends there
 * Rows sharing the same effective path are aggregated (fact grain finer
 * than the hierarchy). A leaf that turns out to have children becomes a
 * subtotal, so its own value acts as the per-scenario fallback instead of
 * double counting.
 */
export function rowsFromLevels(
    rows: LevelInputRow[], sort: PeriodSort = "auto"
): { rows: InputRow[]; months: string[] } {
    const synth = new Map<string, InputRow>();
    const leaves: (InputRow & { month: string | null })[] = [];
    const pathId = (path: string[]): string => LEVEL_PREFIX + path.join(LEVEL_SEP);

    for (const r of rows) {
        const path: string[] = [];
        for (const raw of r.levels) {
            const v = raw == null ? "" : String(raw).trim();
            if (v === "") { break; }
            if (path.length > 0 && v === path[path.length - 1]) { break; }
            path.push(v);
        }
        if (path.length === 0) { continue; }

        for (let d = 1; d < path.length; d++) {
            const id = pathId(path.slice(0, d));
            if (!synth.has(id)) {
                synth.set(id, {
                    id, parent: d > 1 ? pathId(path.slice(0, d - 1)) : null,
                    name: path[d - 1], sort: r.index, rowType: "subtotal",
                    formulaDef: null, sign: 1, displayInvert: false,
                    varianceInvert: false, values: {}, comment: null, index: -1,
                });
            }
        }

        const leafId = (r.account ?? "").trim() || pathId(path);
        leaves.push({
            id: leafId,
            parent: path.length > 1 ? pathId(path.slice(0, -1)) : null,
            name: r.name ?? path[path.length - 1],
            sort: r.sort ?? r.index,
            rowType: r.rowType, formulaDef: r.formulaDef, sign: r.sign,
            displayInvert: r.displayInvert, varianceInvert: r.varianceInvert,
            values: { ...r.values }, comment: r.comment,
            month: r.month, index: r.index,
            // 1.7 the stock / flow tokens travel only when the cell carried one —
            // a row without a token stays shaped exactly as before
            ...(r.stock ? { stock: r.stock } : {}), ...(r.flow ? { flow: true } : {}),
        });
    }

    // month-grain rows sharing a path merge into one leaf (values summed,
    // FY scalars first-wins, monthly series filled)
    const agg = aggregateMonthly(leaves, sort);
    // a real data row at a synthetic parent's path replaces the synthetic
    for (const leaf of agg.rows) { synth.delete(leaf.id); }
    const out = [...synth.values(), ...agg.rows];

    // synthetic parents inherit the smallest child sort — otherwise their
    // first-seen data index would shuffle the P&L order at the root level.
    // A synthetic child passes on only what its own children gave it, never
    // its placeholder index: with a sort column bound the index (0…n) lives on
    // another scale than the sort values, and every block with an intermediate
    // level would jump ahead of the formula rows (Gross profit after D&A).
    const minSort = new Map<string, number>();
    for (let pass = 0; pass < 8; pass++) {
        let changed = false;
        for (const r of out) {
            if (r.parent == null) { continue; }
            const inherited = minSort.get(r.id);
            const candidate = r.index === -1 ? inherited : Math.min(r.sort, inherited ?? r.sort);
            if (candidate == null) { continue; }
            const cur = minSort.get(r.parent);
            if (cur == null || candidate < cur) { minSort.set(r.parent, candidate); changed = true; }
        }
        if (!changed) { break; }
    }
    for (const r of out) {
        if (r.index === -1 && minSort.has(r.id)) { r.sort = minSort.get(r.id)!; }
    }

    // an account leaf that other rows use as parent must aggregate like a
    // subtotal (own value = per-scenario fallback, no double counting)
    const parentIds = new Set<string>();
    for (const r of out) { if (r.parent) { parentIds.add(r.parent); } }
    for (const r of out) {
        if (r.rowType === "account" && parentIds.has(r.id)) { r.rowType = "subtotal"; }
    }

    // synthetic parents inherit display/variance invert when all their
    // contributing children agree — a cost block shown positive on the
    // leaves must not flip to negative on its (generated) subtotal
    const childrenOf = new Map<string, InputRow[]>();
    for (const r of out) {
        if (r.parent == null) { continue; }
        const list = childrenOf.get(r.parent);
        if (list) { list.push(r); } else { childrenOf.set(r.parent, [r]); }
    }
    for (let pass = 0; pass < 8; pass++) {
        let changed = false;
        for (const r of out) {
            if (r.index !== -1) { continue; } // only generated rows
            const kids = (childrenOf.get(r.id) ?? [])
                .filter(c => c.rowType === "account" || c.rowType === "subtotal");
            if (kids.length === 0) { continue; }
            const allDisp = kids.every(c => c.displayInvert);
            const allVar = kids.every(c => c.varianceInvert);
            if (allDisp && !r.displayInvert) { r.displayInvert = true; changed = true; }
            if (allVar && !r.varianceInvert) { r.varianceInvert = true; changed = true; }
        }
        if (!changed) { break; }
    }
    return { rows: out, months: agg.months };
}

/** the row-type rule on one lower-case text (unchanged since 1.0) */
function classifyRowType(s: string): RowType {
    if (s.startsWith("sub") || s.startsWith("zwischen") || s === "sum" || s === "summe") { return "subtotal"; }
    if (s.startsWith("form")) { return "formula"; }
    if (s === "kpi" || s === "ratio" || s === "margin" || s === "kennzahl" || s === "marge" || s === "quote") { return "kpi"; }
    if (s.startsWith("sep") || s.startsWith("trenn") || s.startsWith("leer")) { return "separator"; }
    return "account";
}

/** 1.7 tokens of the row-type cell: a stock (stand at the end of the window) … */
export const STOCK_TOKENS = ["stock", "bestand", "balance", "stichtag", "point"];
/** … an opening stock (stand at the start of the window: the opening balance of a bridge) … */
export const OPENING_TOKENS = ["opening", "anfangsbestand", "eröffnung", "eroeffnung", "open", "begin"];
/** … and an explicit flow (overrides the stock inheritance of a total or formula) */
export const FLOW_TOKENS = ["flow", "fluss", "bewegung", "movement"];

/** what the row-type cell says: the row type plus the 1.7 stock / flow token */
export interface RowTypeInfo {
    rowType: RowType;
    /** explicit stock token — "last" (stock …) or "first" (opening …); null = none */
    stock: StockAgg | null;
    /** explicit flow token */
    flow: boolean;
}

/**
 * Read the row-type cell (1.7). Several tokens may share one cell, separated
 * by comma, semicolon, blank or "|" — "Subtotal stock", "Account; opening",
 * "Formula | flow". Only a cell that carries a stock / opening / flow token is
 * split: every other value is read whole by the rule of 1.0 (so no existing
 * value changes its meaning — "net margin" stays an account, exactly as
 * before). In a split cell the remaining words decide the row type, the first
 * word naming one wins; the last stock / opening / flow token wins over an
 * earlier one.
 */
export function parseRowTypeInfo(raw: unknown): RowTypeInfo {
    const s = String(raw ?? "").trim().toLowerCase();
    const toks = s.split(/[\s,;|]+/).filter(t => t !== "");
    let stock: StockAgg | null = null;
    let flow = false;
    const rest: string[] = [];
    for (const t of toks) {
        if (STOCK_TOKENS.includes(t)) { stock = "last"; flow = false; }
        else if (OPENING_TOKENS.includes(t)) { stock = "first"; flow = false; }
        else if (FLOW_TOKENS.includes(t)) { stock = null; flow = true; }
        else { rest.push(t); }
    }
    if (rest.length === toks.length) { return { rowType: classifyRowType(s), stock: null, flow: false }; }
    let rowType = classifyRowType(rest.join(" "));
    if (rowType === "account") {
        for (const t of rest) {
            const r = classifyRowType(t);
            if (r !== "account") { rowType = r; break; }
        }
    }
    return { rowType, stock, flow };
}

export function parseRowType(raw: unknown): RowType {
    return parseRowTypeInfo(raw).rowType;
}

export function parseBool(raw: unknown): boolean {
    if (typeof raw === "boolean") { return raw; }
    if (typeof raw === "number") { return raw !== 0; }
    const s = String(raw ?? "").trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "ja" || s === "j" || s === "x" || s === "wahr";
}

export function parseSign(raw: unknown): number {
    if (typeof raw === "number") { return raw < 0 ? -1 : 1; }
    const s = String(raw ?? "").trim();
    const n = Number(s);
    if (isFinite(n)) { return n < 0 ? -1 : 1; }
    // text columns like "-" or "negativ": a leading/contained minus flips the sign
    return s.includes("-") || s.toLowerCase().startsWith("neg") ? -1 : 1;
}

export function buildModel(rows: InputRow[], orphanLabel: string, months: string[] = [], opts: BuildOptions = {}): PnlModel {
    const warnings: string[] = [];
    const byId = new Map<string, PnlNode>();
    const stockMode: StockMode = opts.stockMode === "allStock" || opts.stockMode === "allFlow" ? opts.stockMode : "auto";

    for (const row of rows) {
        if (byId.has(row.id)) {
            warnings.push(`duplicate id: ${row.id}`);
            continue;
        }
        byId.set(row.id, {
            row, children: [], level: 0,
            computed: { ac: null, py: null, pl: null, fc: null, fcfy: null, plfy: null },
            series: {},
            error: null, hasChildren: false, isOrphanBucket: false,
        });
    }

    const roots: PnlNode[] = [];
    const orphans: PnlNode[] = [];
    for (const node of byId.values()) {
        const pid = node.row.parent;
        if (pid == null || pid === "" || pid === node.row.id) {
            roots.push(node);
        } else {
            const parent = byId.get(pid);
            if (parent) { parent.children.push(node); }
            else { orphans.push(node); }
        }
    }

    // rows caught in a parent-child cycle (x→y→x) are reachable from no root —
    // they must surface in the orphan bucket, never vanish silently (F1)
    const reachable = new Set<PnlNode>();
    const markReachable = (nodes: PnlNode[]): void => {
        for (const n of nodes) {
            if (reachable.has(n)) { continue; }
            reachable.add(n);
            markReachable(n.children);
        }
    };
    markReachable(roots);
    markReachable(orphans); // known orphans (and their subtrees) already go to the bucket
    let cycleCount = 0;
    for (const node of byId.values()) {
        if (reachable.has(node)) { continue; }
        node.children = node.children.filter(c => reachable.has(c));
        orphans.push(node);
        cycleCount++;
    }
    if (cycleCount > 0) { warnings.push(`${cycleCount} row(s) in a parent-child cycle`); }

    if (orphans.length > 0) {
        const bucketRow: InputRow = {
            id: ORPHAN_ID, parent: null, name: orphanLabel, sort: Number.MAX_SAFE_INTEGER,
            rowType: "subtotal", formulaDef: null, sign: 1,
            displayInvert: false, varianceInvert: false, values: {}, comment: null, index: -1,
        };
        const bucket: PnlNode = {
            row: bucketRow, children: orphans, level: 0,
            computed: { ac: null, py: null, pl: null, fc: null, fcfy: null, plfy: null },
            series: {},
            error: null, hasChildren: true, isOrphanBucket: true,
        };
        byId.set(ORPHAN_ID, bucket);
        roots.push(bucket);
        warnings.push(`${orphans.length} orphan row(s) moved to "${orphanLabel}"`);
    }

    const bySort = (a: PnlNode, b: PnlNode): number =>
        (a.row.sort - b.row.sort) || a.row.name.localeCompare(b.row.name);
    const sortRec = (nodes: PnlNode[], level: number): void => {
        nodes.sort(bySort);
        for (const n of nodes) {
            n.level = level;
            n.hasChildren = n.children.length > 0;
            sortRec(n.children, level + 1);
        }
    };
    sortRec(roots, 0);

    let maxDepth = 0;
    for (const n of byId.values()) { maxDepth = Math.max(maxDepth, n.level + 1); }

    const resolve = resolverOf(byId);
    // 1.7 stock classification first: the roll-up below reads it
    classifyStock(byId, resolve, stockMode);
    computeValues(roots, byId, warnings, months, resolve, opts.fyFromSeries ?? {});
    const model: PnlModel = { roots, byId, maxDepth, months, warnings };
    if (stockMode !== "auto") { model.stockMode = stockMode; }
    return model;
}

/** reference resolver over a node map: id first, then the unique row name (null = ambiguous) */
function resolverOf(byId: Map<string, PnlNode>): (id: string) => PnlNode | undefined {
    const byName = new Map<string, PnlNode | null>();
    for (const node of byId.values()) {
        const n = node.row.name;
        if (!byName.has(n)) { byName.set(n, node); }
        else if (byName.get(n) !== node) { byName.set(n, null); }
    }
    return (id: string): PnlNode | undefined => byId.get(id) ?? (byName.get(id) || undefined);
}

/** parsed FormulaDef per node (computeValues fills it; windowValue reads it) */
const AST_OF = new WeakMap<PnlNode, Ast>();

/** the [refs] of a formula in reading order (unresolvable ones skipped) */
function astRefs(ast: Ast, resolve: (id: string) => PnlNode | undefined, out: PnlNode[] = []): PnlNode[] {
    switch (ast.kind) {
        case "ref": { const n = resolve(ast.id); if (n) { out.push(n); } break; }
        case "neg": astRefs(ast.arg, resolve, out); break;
        case "bin": astRefs(ast.left, resolve, out); astRefs(ast.right, resolve, out); break;
        default: break;
    }
    return out;
}

/**
 * 1.7 stock classification of every node (PnlNode.stock / stockInside /
 * stockMix), by statement.stockMode:
 *
 *  - allFlow:  every row a flow (the behaviour before 1.7, tokens ignored);
 *  - allStock: every row except separators a stock — an opening token keeps
 *              its "first" aggregation;
 *  - auto:     the explicit tokens decide; a total (subtotal, generated level
 *              node, postable parent) without a token inherits "stock" when all
 *              of its contributing children are stocks (analogous to the
 *              DisplayInvert inheritance of the level mode), a formula / KPI
 *              without a token when all of its operands are stocks. Mixed
 *              operands (stock ± flow) follow the FIRST operand — a stock
 *              moved by flows is the closing stand ("last"), so an opening
 *              balance plus the cash flows gives the closing balance — and
 *              the row is marked stockMix (edit-mode note). Mixed children of a
 *              total leave it a flow (stockMix). Several opening stocks
 *              inherit "first", anything else "last".
 *
 * stockInside: a stock is involved anywhere below (children / operands,
 * transitively) — the visual then evaluates the row's period windows from its
 * operands (windowValue) instead of summing its own series.
 */
function classifyStock(byId: Map<string, PnlNode>, resolve: (id: string) => PnlNode | undefined, mode: StockMode): void {
    for (const n of byId.values()) { n.stock = null; n.stockInside = false; n.stockMix = false; }
    if (mode === "allFlow") { return; }
    if (mode === "allStock") {
        for (const n of byId.values()) {
            if (n.row.rowType === "separator") { continue; }
            n.stock = n.row.stock === "first" ? "first" : "last";
        }
        for (const n of byId.values()) {
            n.stockInside = n.row.rowType !== "separator" && (n.children.length > 0 || n.row.rowType === "formula" || n.row.rowType === "kpi");
        }
        return;
    }
    const done = new Set<PnlNode>();
    const busy = new Set<PnlNode>();
    const visit = (n: PnlNode): void => {
        if (done.has(n) || busy.has(n)) { return; }
        busy.add(n);
        const t = n.row.rowType;
        let parts: PnlNode[] = [];
        if (t === "formula" || t === "kpi") {
            const def = (n.row.formulaDef ?? "").trim();
            try { parts = def === "" ? [] : astRefs(parseFormula(def), resolve); } catch { parts = []; }
        } else if (t !== "separator") {
            parts = n.children.filter(c => c.row.rowType === "account" || c.row.rowType === "subtotal");
        }
        for (const p of parts) { visit(p); }
        const stocks = parts.filter(p => p.stock != null);
        n.stockInside = parts.some(p => p.stock != null || p.stockInside === true);
        const mixed = stocks.length > 0 && stocks.length < parts.length;
        if (t === "separator") {
            n.stock = null;
        } else if (n.row.flow) {
            n.stock = null;
        } else if (n.row.stock) {
            n.stock = n.row.stock;
        } else if (parts.length > 0 && stocks.length === parts.length) {
            n.stock = stocks.every(p => p.stock === "first") ? "first" : "last";
        } else if (mixed && (t === "formula" || t === "kpi")) {
            // stock ± flow: the result follows its first operand
            n.stock = parts[0].stock != null ? "last" : null;
        } else {
            n.stock = null;
        }
        n.stockMix = mixed;
        busy.delete(n);
        done.add(n);
    };
    for (const n of byId.values()) { visit(n); }
}

/** Sum contribution of a node into its parent: accounts and subtotals count, ratio/separator rows never do. */
function contributes(node: PnlNode): boolean {
    const t = node.row.rowType;
    return t === "account" || t === "subtotal";
}

/** per-scenario sum of the contributing children (null when no child carries a value) */
function childSum(node: PnlNode, s: Scenario): number | null {
    let acc: number | null = null;
    for (const c of node.children) {
        if (!contributes(c)) { continue; }
        const cv = c.computed[s];
        if (cv == null) { continue; }
        acc = (acc ?? 0) + cv;
    }
    return acc;
}

/** per-month sum of the contributing children (null when no child carries a series) */
function childSeriesSum(node: PnlNode, s: Scenario): (number | null)[] | null {
    let acc: (number | null)[] | null = null;
    for (const c of node.children) {
        if (!contributes(c)) { continue; }
        const cs = c.series[s];
        if (!cs) { continue; }
        if (!acc) { acc = new Array(cs.length).fill(null); }
        for (let i = 0; i < cs.length; i++) {
            const v = cs[i];
            if (v == null) { continue; }
            acc[i] = (acc[i] ?? 0) + v;
        }
    }
    return acc;
}

/**
 * Subtotal semantics on one node: the children win, the row's own value is the
 * per-scenario fallback for aggregate-only data (e.g. PY delivered without
 * account detail), and the row's own sign applies to the aggregate — values and
 * monthly series alike. FY scalars (fcfy/plfy) roll up like every other
 * scenario here; their first-wins rule lives in aggregateMonthly, one level
 * below. The engine's roll-up pass and syntheticTotal() share this definition.
 */
export function aggregateSubtotal(node: PnlNode, own: (s: Scenario) => number | null | undefined = s => node.row.values[s]): void {
    for (const s of SCENARIOS) {
        const childAcc = childSum(node, s);
        const base = childAcc != null ? childAcc : own(s);
        node.computed[s] = base == null ? null : base * node.row.sign;
    }
    for (const s of SERIES_SCENARIOS) {
        const ownRaw = node.row.series?.[s];
        const own = ownRaw ? ownRaw.map(v => (v == null ? null : v * node.row.sign)) : null;
        const childAcc = childSeriesSum(node, s);
        const base = childAcc
            ? (node.row.sign === -1 ? childAcc.map(v => (v == null ? null : -v)) : childAcc)
            : own;
        if (base) { node.series[s] = base; }
    }
}

/**
 * 1.7 model-wide first / last month index that carries a value of each series
 * scenario — the stand of a stock row over the whole bound period is read at
 * these (AC: the last actuals month, PY / PL / FC: normally December).
 * -1 = the scenario has no monthly value at all.
 */
function seriesBounds(byId: Map<string, PnlNode>, n: number): { first: Record<string, number>; last: Record<string, number> } {
    const first: Record<string, number> = {}; const last: Record<string, number> = {};
    for (const s of SERIES_SCENARIOS) { first[s] = -1; last[s] = -1; }
    if (n === 0) { return { first, last }; }
    for (const node of byId.values()) {
        for (const s of SERIES_SCENARIOS) {
            const arr = node.row.series?.[s];
            if (!arr) { continue; }
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] == null) { continue; }
                if (first[s] < 0 || i < first[s]) { first[s] = i; }
                if (i > last[s]) { last[s] = i; }
            }
        }
    }
    return { first, last };
}

function computeValues(roots: PnlNode[], byId: Map<string, PnlNode>, warnings: string[], months: string[],
    resolve: (id: string) => PnlNode | undefined, fy: { fcfy?: boolean; plfy?: boolean }): void {
    const bounds = seriesBounds(byId, months.length);
    // 1.7 the AC&FC series of the FY fallback: AC up to the last actuals month, FC after it
    const lastAc = bounds.last.ac;
    const acFc = (node: PnlNode): (number | null)[] | null => {
        const ac = node.row.series?.ac; const fc = node.row.series?.fc;
        if (!ac && !fc) { return null; }
        return months.map((_, i) => (i <= lastAc ? ac?.[i] ?? null : fc?.[i] ?? null));
    };
    const acFcFirst = Math.min(...[bounds.first.ac, bounds.first.fc].filter(i => i >= 0), Infinity);
    const acFcLast = Math.max(bounds.last.ac, bounds.last.fc);
    /**
     * own (raw, unsigned) value of a row in a scenario. 1.7 FY fallback (no FY
     * measure bound, see BuildOptions.fyFromSeries): a flow's outlook is the
     * sum of AC&FC (AC up to the last actuals month, FC after it) resp. of PL;
     * a stock's outlook is the stand at the end (an opening stock: the start)
     * of that series.
     */
    const own = (node: PnlNode, s: Scenario): number | null | undefined => {
        const v = node.row.values[s];
        if (v != null || !((s === "fcfy" && fy.fcfy) || (s === "plfy" && fy.plfy))) { return v; }
        if (s === "plfy") {
            const arr = node.row.series?.pl;
            if (!node.stock || !arr) { return node.row.values.pl; }
            const i = node.stock === "first" ? bounds.first.pl : bounds.last.pl;
            return i >= 0 ? arr[i] ?? null : null;
        }
        const arr = acFc(node);
        if (!arr) { return node.row.values.fc ?? null; }
        if (!node.stock) {
            let sum = 0; let seen = false;
            for (const x of arr) { if (x != null) { sum += x; seen = true; } }
            return seen ? sum : null;
        }
        const i = node.stock === "first" ? acFcFirst : acFcLast;
        return i >= 0 && isFinite(i) ? arr[i] ?? null : null;
    };
    const useOwn = fy.fcfy === true || fy.plfy === true;
    /**
     * 1.7 a stock row over the whole bound period is its stand — at the last
     * month with a value of that scenario (an opening stock: the first) —
     * never the sum of its months. Rows without monthly series keep the value
     * as delivered.
     */
    const stockStand = (node: PnlNode): void => {
        if (!node.stock || months.length === 0) { return; }
        for (const s of SERIES_SCENARIOS) {
            const arr = node.series[s];
            if (!arr) { continue; }
            const i = node.stock === "first" ? bounds.first[s] : bounds.last[s];
            node.computed[s] = i >= 0 ? arr[i] ?? null : null;
        }
    };

    // pass 1: additive values bottom-up (accounts + subtotals)
    const sumNode = (node: PnlNode): void => {
        for (const c of node.children) { sumNode(c); }
        const t = node.row.rowType;

        // children below a separator/formula/kpi row can never roll up — warn
        // instead of silently dropping the subtree (rule 4.4)
        if (!contributes(node) && node.children.some(c => contributes(c))) {
            warnings.push(`subtree under ${node.row.id} (${t}) is excluded from parent sums`);
        }

        if (t !== "account" && t !== "subtotal") { return; } // formula/kpi in pass 2

        if (t === "subtotal") {
            if (useOwn) { aggregateSubtotal(node, s => own(node, s)); } else { aggregateSubtotal(node); }
            stockStand(node);
            return;
        }

        // postable parent account: own value + children
        for (const s of SCENARIOS) {
            const own0 = useOwn ? own(node, s) : node.row.values[s];
            const childAcc = childSum(node, s);
            let acc: number | null = own0 != null ? own0 * node.row.sign : null;
            if (childAcc != null) { acc = (acc ?? 0) + childAcc; }
            node.computed[s] = acc;
        }

        // monthly series roll up with the same semantics (sparklines)
        for (const s of SERIES_SCENARIOS) {
            const ownRaw = node.row.series?.[s];
            const ownS = ownRaw ? ownRaw.map(v => (v == null ? null : v * node.row.sign)) : null;
            const childAcc = childSeriesSum(node, s);
            if (ownS && childAcc) {
                node.series[s] = ownS.map((v, i) =>
                    v == null && childAcc[i] == null ? null : (v ?? 0) + (childAcc[i] ?? 0));
            } else if (ownS || childAcc) {
                node.series[s] = (ownS ?? childAcc)!;
            }
        }
        stockStand(node);
    };
    for (const r of roots) { sumNode(r); }

    // pass 2: formula / kpi rows with memoized evaluation + cycle detection.
    // [Refs] resolve by id first, then by unique row name — level mode has
    // synthetic path ids, so "[Umsatzerlöse]" must work by name there.

    const visiting = new Set<string>();
    const done = new Set<string>();

    const evalNode = (node: PnlNode): void => {
        const t = node.row.rowType;
        if (t !== "formula" && t !== "kpi") { return; }
        if (done.has(node.row.id)) { return; }
        if (visiting.has(node.row.id)) {
            node.error = "cycle";
            return;
        }
        visiting.add(node.row.id);
        const def = (node.row.formulaDef ?? "").trim();
        if (def === "") {
            node.error = "empty formula";
        } else {
            try {
                const ast = parseFormula(def);
                AST_OF.set(node, ast);
                for (const s of SCENARIOS) {
                    node.computed[s] = evalAst(ast, resolve, evalNode, node, n => n.computed[s]);
                    if (node.error) { break; }
                }
                if (!node.error && months.length > 0) {
                    for (const s of SERIES_SCENARIOS) {
                        const arr = months.map((_, mi) =>
                            evalAst(ast, resolve, evalNode, node, n => n.series[s]?.[mi] ?? null));
                        if (node.error) { break; }
                        if (arr.some(v => v != null)) { node.series[s] = arr; }
                    }
                }
            } catch (e) {
                node.error = e instanceof Error ? e.message : "parse error";
            }
        }
        visiting.delete(node.row.id);
        done.add(node.row.id);
        if (node.error) {
            for (const s of SCENARIOS) { node.computed[s] = null; }
            warnings.push(`formula error in ${node.row.id}: ${node.error}`);
        }
    };
    for (const n of byId.values()) { evalNode(n); }
}

// ---- formula parser (recursive descent: + - * / parentheses, [refs], numbers)

type Ast =
    | { kind: "num"; value: number }
    | { kind: "ref"; id: string }
    | { kind: "bin"; op: "+" | "-" | "*" | "/"; left: Ast; right: Ast }
    | { kind: "neg"; arg: Ast };

function parseFormula(src: string): Ast {
    let pos = 0;
    const skipWs = (): void => { while (pos < src.length && /\s/.test(src[pos])) { pos++; } };
    const peek = (): string => { skipWs(); return src[pos] ?? ""; };

    const parsePrimary = (): Ast => {
        skipWs();
        const ch = src[pos];
        if (ch === "(") {
            pos++;
            const inner = parseAddSub();
            skipWs();
            if (src[pos] !== ")") { throw new Error("missing )"); }
            pos++;
            return inner;
        }
        if (ch === "[") {
            const end = src.indexOf("]", pos);
            if (end < 0) { throw new Error("missing ]"); }
            const id = src.slice(pos + 1, end).trim();
            pos = end + 1;
            if (id === "") { throw new Error("empty reference"); }
            return { kind: "ref", id };
        }
        if (ch === "-") { pos++; return { kind: "neg", arg: parsePrimary() }; }
        const m = /^\d+(?:[.,]\d+)?/.exec(src.slice(pos));
        if (m) {
            pos += m[0].length;
            return { kind: "num", value: parseFloat(m[0].replace(",", ".")) };
        }
        throw new Error(`unexpected "${ch}"`);
    };

    const parseMulDiv = (): Ast => {
        let left = parsePrimary();
        for (;;) {
            const op = peek();
            if (op !== "*" && op !== "/") { return left; }
            pos++;
            left = { kind: "bin", op, left, right: parsePrimary() };
        }
    };

    const parseAddSub = (): Ast => {
        let left = parseMulDiv();
        for (;;) {
            const op = peek();
            if (op !== "+" && op !== "-") { return left; }
            pos++;
            left = { kind: "bin", op, left, right: parseMulDiv() };
        }
    };

    const ast = parseAddSub();
    skipWs();
    if (pos < src.length) { throw new Error(`trailing "${src.slice(pos)}"`); }
    return ast;
}

function evalAst(
    ast: Ast, resolve: (id: string) => PnlNode | undefined,
    evalNode: (n: PnlNode) => void, owner: PnlNode,
    read: (n: PnlNode) => number | null
): number | null {
    switch (ast.kind) {
        case "num": return ast.value;
        case "neg": {
            const v = evalAst(ast.arg, resolve, evalNode, owner, read);
            return v == null ? null : -v;
        }
        case "ref": {
            const target = resolve(ast.id);
            if (!target) { owner.error = `unknown reference [${ast.id}]`; return null; }
            evalNode(target);
            if (target.error) {
                // any error in a referenced row poisons the consumer visibly —
                // a silent null would look like "no data" in a finance report
                owner.error = owner.error ?? `ref [${ast.id}]: ${target.error}`;
                return null;
            }
            return read(target);
        }
        case "bin": {
            const l = evalAst(ast.left, resolve, evalNode, owner, read);
            const r = evalAst(ast.right, resolve, evalNode, owner, read);
            if (l == null || r == null) { return null; }
            switch (ast.op) {
                case "+": return l + r;
                case "-": return l - r;
                case "*": return l * r;
                case "/": return r === 0 ? null : l / r;
            }
        }
    }
}

// ---- formula operands (value-driver tree)

/** Operator shown at the branch point of a driver tree. */
export type FormulaOp = "×" | "÷" | "+" | "−";

export interface FormulaOperand {
    child: PnlNode;
    /** operator that binds this operand to the one before it (see formulaOperands) */
    op: FormulaOp;
}

/**
 * Reference resolver with the same semantics the formula evaluator uses:
 * by row id first, then by *unique* row name — level mode has synthetic path
 * ids, so "[Net revenue]" must resolve by name there.
 */
export function nodeResolver(model: PnlModel): (id: string) => PnlNode | undefined {
    const byName = new Map<string, PnlNode | null>(); // null = ambiguous
    for (const node of model.byId.values()) {
        const n = node.row.name;
        if (!byName.has(n)) { byName.set(n, node); }
        else if (byName.get(n) !== node) { byName.set(n, null); }
    }
    return (id: string): PnlNode | undefined => model.byId.get(id) ?? (byName.get(id) || undefined);
}

/** operator that binds the right-hand side of `op` inside an inherited context */
function combineOp(inherited: FormulaOp, op: "+" | "-" | "*" | "/"): FormulaOp {
    const mapped: FormulaOp = op === "+" ? "+" : op === "-" ? "−" : op === "*" ? "×" : "÷";
    // an inverted context flips its right side: a-(b-c) adds c, a/(b/c) multiplies c
    if (inherited === "−") { return mapped === "+" ? "−" : mapped === "−" ? "+" : mapped; }
    if (inherited === "÷") { return mapped === "×" ? "÷" : mapped === "÷" ? "×" : mapped; }
    return mapped;
}

/**
 * Operands of a formula/KPI row in reading order, each with the operator that
 * connects it to the operand before it — the input for a DuPont-style value
 * driver tree, where the operator sits at the branch point between two cards.
 *
 * Conventions:
 *  - `[a]*[b]` → both `×`, `[a]/[b]` → both `÷` (the first operand adopts a
 *    multiplicative branch operator so a two-operand ratio reads as one group)
 *  - `[a]+[b]` → `+`,`+`; `[a]-[b]` → `+`,`−` (the minus belongs to b)
 *  - mixed formulas keep the operator per edge: `[a]*[b]+[c]` → `×`,`×`,`+`
 *  - references that resolve to nothing are skipped, a parse error yields [];
 *    a lone operand (`[a]*2`) keeps `+` — there is no branch point to label
 *
 * The list is flat: parentheses around additive groups (`[a]/([b]+[c])`) cannot
 * be expressed by a single chain of operators and are not reconstructed.
 */
export function formulaOperands(
    node: PnlNode, resolve: (id: string) => PnlNode | undefined
): FormulaOperand[] {
    const def = (node.row.formulaDef ?? "").trim();
    if (def === "") { return []; }
    let ast: Ast;
    try { ast = parseFormula(def); } catch { return []; }

    const out: FormulaOperand[] = [];
    const walk = (a: Ast, inherited: FormulaOp): void => {
        switch (a.kind) {
            case "num": return;
            case "ref": {
                const child = resolve(a.id);
                if (child) { out.push({ child, op: inherited }); }
                return;
            }
            case "neg":
                walk(a.arg, inherited === "+" ? "−" : inherited === "−" ? "+" : inherited);
                return;
            case "bin":
                walk(a.left, inherited);
                walk(a.right, combineOp(inherited, a.op));
                return;
        }
    };
    walk(ast, "+");

    if (out.length > 1 && (out[1].op === "×" || out[1].op === "÷")) { out[0].op = out[1].op; }
    return out;
}

// ---- 1.7 stock vs flow: period windows

/** one reference resolver per model (windowValue runs per row and scenario) */
const RESOLVER_OF = new WeakMap<PnlModel, (id: string) => PnlNode | undefined>();

/** the series sum over months lo..hi (null when no month carries a value) — the flow rule */
function seriesSum(arr: (number | null)[] | undefined, lo: number, hi: number): number | null {
    if (!arr) { return null; }
    let sum = 0; let seen = false;
    for (let i = Math.max(0, lo); i <= hi && i < arr.length; i++) {
        const v = arr[i];
        if (v != null) { sum += v; seen = true; }
    }
    return seen ? sum : null;
}

/** true when the period values of this row follow the 1.7 stock rule (a stock, or a stock below it) */
export function stockish(node: PnlNode): boolean {
    return node.stock != null || node.stockInside === true;
}

/** true when any row of the model is a stock (statement.stockMode / tokens) */
export function modelHasStock(model: PnlModel): boolean {
    for (const n of model.byId.values()) { if (n.stock != null) { return true; } }
    return false;
}

/**
 * 1.7 raw (calculation-signed) value of a row over the period window of the
 * months lo..hi (the YTD window: 0..last actuals month):
 *
 *  - flow:        the sum of its months (as before);
 *  - stock:       the stand at the end of the window (hi) — an opening stock
 *                 the stand at its start (lo); the same Stichtag for every
 *                 scenario, so Δ PY / PL / FC compare stands of the same month;
 *  - formula / KPI with a stock among its operands: the formula evaluated on
 *                 the WINDOW values of its operands (an opening balance plus
 *                 the year's cash flows = the closing balance; a closing minus
 *                 an opening stock = the change of the year);
 *  - a flow total with stocks below: sign × Σ of its children's window values.
 *
 * Without monthly series (no period role) every row keeps its delivered value
 * (node.computed). KPI rows without a stock keep node.computed, like the visual.
 */
export function windowValue(model: PnlModel, node: PnlNode, s: Scenario, lo: number, hi: number): number | null {
    if (model.months.length === 0 || FY_SCENARIOS.includes(s)) { return node.computed[s] ?? null; }
    let resolve = RESOLVER_OF.get(model);
    if (!resolve) { resolve = nodeResolver(model); RESOLVER_OF.set(model, resolve); }
    const memo = new Map<PnlNode, number | null>();
    const rec = (n: PnlNode): number | null => {
        if (memo.has(n)) { return memo.get(n)!; }
        memo.set(n, null); // cycle guard
        let v: number | null;
        const t = n.row.rowType;
        if (t === "separator" || n.error) {
            v = null;
        } else if (t === "formula" || t === "kpi") {
            const ast = AST_OF.get(n);
            if (ast && stockish(n)) {
                v = evalAst(ast, resolve, () => undefined, n, rec);
                if (n.error) { v = null; }
            } else {
                v = t === "kpi" ? n.computed[s] ?? null : seriesSum(n.series[s], lo, hi);
            }
        } else if (n.stock) {
            const arr = n.series[s];
            v = arr ? arr[n.stock === "first" ? lo : hi] ?? null : null;
        } else if (n.stockInside) {
            let acc: number | null = null;
            if (t === "account") {
                const own = n.row.series?.[s];
                const o = own ? seriesSum(own, lo, hi) : null;
                if (o != null) { acc = o * n.row.sign; }
            }
            let kids: number | null = null;
            for (const c of n.children) {
                if (!contributes(c)) { continue; }
                const cv = rec(c);
                if (cv != null) { kids = (kids ?? 0) + cv; }
            }
            if (t === "subtotal") {
                const base = kids != null ? kids : seriesSum(n.row.series?.[s], lo, hi);
                v = base == null ? null : base * n.row.sign;
            } else {
                v = kids == null ? acc : (acc ?? 0) + kids;
            }
        } else {
            v = seriesSum(n.series[s], lo, hi);
        }
        memo.set(n, v);
        return v;
    };
    return rec(node);
}

// ---- variances

export function variance(node: PnlNode, ref: Scenario, minuend: Scenario = "ac"): Variance {
    return varianceOf(node.computed[minuend], node.computed[ref], node.row.varianceInvert);
}

/**
 * The variance rule on two raw (calculation-signed) values — the single
 * definition behind variance() and every period block (month, YTD window) that
 * reads its values from the monthly series instead of node.computed.
 */
export function varianceOf(a: number | null, rv: number | null, varianceInvert: boolean): Variance {
    if (a == null || rv == null) { return { delta: null, deltaPct: null, good: true }; }
    const delta = a - rv;
    const deltaPct = rv !== 0 ? delta / Math.abs(rv) : null;
    let good = delta >= 0;
    if (varianceInvert) { good = !good; }
    return { delta, deltaPct, good };
}

/**
 * 1.7 "Only exceptions" (exceptions.* / toolbar ⚡): the threshold of a row.
 * `pct` in whole percent (|Δ%| ≥ pct), `abs` in data units (|Δ| ≥ abs, before
 * k / m scaling); 0 = that threshold is off. `dir` reads the sign of Δ in
 * DISPLAY orientation against the reference (above / below the reference,
 * not favourable / unfavourable — that stays the engine rating).
 */
export interface ExceptionRule {
    pct: number;
    abs: number;
    dir: "both" | "up" | "down";
}

/**
 * True when the variance `v` (raw, calculation-signed — variance(),
 * varianceOf() or a period block of the visual) of `row` is an exception:
 * |Δ%| ≥ pct OR |Δ| ≥ abs (one of them is enough), in the direction asked.
 * A reference of 0 with a non-zero Δ is an infinite Δ% (an exception as soon
 * as the percent threshold is on). Margin / KPI rows read the percent
 * threshold in percentage points (Δ pp, ×100); the absolute threshold does
 * not apply to them. With both thresholds at 0 every non-zero Δ counts.
 */
export function isExceptionVariance(row: InputRow, v: Variance, rule: ExceptionRule): boolean {
    if (v.delta == null || v.delta === 0 || !isFinite(v.delta)) { return false; }
    const kpi = row.rowType === "kpi";
    const d = kpi ? v.delta : (row.displayInvert ? -v.delta : v.delta);
    if (rule.dir === "up" && d <= 0) { return false; }
    if (rule.dir === "down" && d >= 0) { return false; }
    const pct = Math.max(0, Number(rule.pct) || 0);
    const abs = Math.max(0, Number(rule.abs) || 0);
    const eps = 1e-9;
    if (pct <= 0 && abs <= 0) { return true; }
    if (kpi) { return pct > 0 && Math.abs(v.delta * 100) >= pct - eps; }
    if (abs > 0 && Math.abs(v.delta) >= abs * (1 - eps)) { return true; }
    if (pct > 0) { return v.deltaPct == null || Math.abs(v.deltaPct * 100) >= pct - eps; }
    return false;
}

/**
 * Variance in DISPLAY orientation, as an IBCS statement table prints it
 * (templates T01–T04, see SPEC-MEGATABLE.md):
 *
 *  - value rows: Δ and Δ% follow the shown values — a cost row shown positive
 *    (DisplayInvert) that grows prints "+37.3 / +7%", in red. `good` keeps the
 *    engine rule (calculation sign + VarianceInvert); `impact` / `impactPct` are
 *    Δ and Δ% turned into the "good" orientation (≥ 0 ⇔ favourable) — the value
 *    a "Δ in red if < threshold" test compares, so cost logic needs no extra flag;
 *  - margin / KPI rows (rowType kpi): Δ in percentage points (`pp`, ×100),
 *    Δ% as the relative change a / b − 1 of the two ratios.
 *
 * `a` / `rv` are raw values of the minuend / reference (node.computed or a
 * period window of the series). Null when either side is missing.
 */
export interface DisplayVariance {
    d: number;
    p: number | null;
    good: boolean;
    impact: number;
    impactPct: number | null;
    pp: boolean;
}

export function displayVariance(row: InputRow, a: number | null, rv: number | null): DisplayVariance | null {
    const v = varianceOf(a, rv, row.varianceInvert);
    if (v.delta == null || a == null || rv == null) { return null; }
    if (row.rowType === "kpi") {
        const d = v.delta * 100;
        const p = rv !== 0 ? a / rv - 1 : null;
        const flip = row.varianceInvert ? -1 : 1;
        return { d, p, good: v.good, impact: d * flip, impactPct: p == null ? null : p * flip, pp: true };
    }
    const disp = row.displayInvert ? -1 : 1;
    const eff = row.varianceInvert ? -1 : 1;
    return {
        d: v.delta * disp,
        p: v.deltaPct == null ? null : v.deltaPct * disp,
        good: v.good,
        impact: v.delta * eff,
        impactPct: v.deltaPct == null ? null : v.deltaPct * eff,
        pp: false,
    };
}

/** Value as shown in the value columns (DisplayInvert flips the sign for cost rows). */
export function displayValue(node: PnlNode, s: Scenario): number | null {
    const v = node.computed[s];
    if (v == null) { return null; }
    return node.row.displayInvert ? -v : v;
}

/**
 * Integer quanta `z` with Σ z = target, each z as close to its `y` as the
 * largest-remainder method allows (ChartKitchen sumSafeAdjust): floors first,
 * the missing units go to the largest remainders, a surplus is taken from the
 * smallest. Ties keep the input order.
 */
export function largestRemainder(y: number[], target: number): number[] {
    const out = y.map(v => Math.floor(v));
    let need = target - out.reduce((a, v) => a + v, 0);
    if (y.length === 0 || need === 0) { return out; }
    const order = y.map((v, i) => ({ i, r: v - Math.floor(v) }))
        .sort((a, b) => (b.r - a.r) || (a.i - b.i)).map(e => e.i);
    for (let k = 0; need > 0; k++, need--) { out[order[k % order.length]]++; }
    for (let k = 0; need < 0; k++, need++) { out[order[order.length - 1 - (k % order.length)]]--; }
    return out;
}

/**
 * Sum-safe rounding along the hierarchy (numbers.sumSafeRounding): every value
 * is rounded to `quantum` (display unit × 10^-decimals) so that the printed
 * children of a subtotal add up exactly to the printed subtotal. Top-down: a
 * root (or any row whose value is not its children's sum) rounds normally,
 * its contributing children (accounts / subtotals with a value) share the
 * printed parent by largest remainder — the parent's SignConvention included
 * (parent = sign × Σ children) — and pass their printed value on to their own
 * children. Formula, margin and separator rows are never distributed: they
 * keep the exact rounding and start a new distribution below them.
 *
 * `read` gives the raw (calculation-signed) value of the period block; the
 * result maps row id → value that formats exactly at the quantum. Rows
 * without a value are absent. Rounding of a half is away from zero, like
 * Intl.NumberFormat.
 */
/** 1.7 the kind of a row for the sum-safe distribution: flow, a stock aggregation, or a mixed total */
function stockClass(n: PnlNode): string {
    return n.stock ?? (n.stockInside ? "mix" : "flow");
}

export function sumSafeRound(roots: PnlNode[], read: (n: PnlNode) => number | null, quantum: number): Map<string, number> {
    const out = new Map<string, number>();
    if (!(quantum > 0) || !isFinite(quantum)) { return out; }
    const q = (v: number): number => Math.round((v / quantum) * 1e6) / 1e6;
    const rnd = (x: number): number => (x < 0 ? -1 : 1) * Math.round(Math.abs(x));
    const distributable = (n: PnlNode): boolean => n.row.rowType === "account" || n.row.rowType === "subtotal";
    const visit = (n: PnlNode, printed: number | null): void => {
        const t = n.row.rowType;
        const v = t === "kpi" || t === "separator" ? null : read(n);
        let p: number | null = null;
        if (v != null && isFinite(v)) {
            p = printed != null && distributable(n) ? printed : rnd(q(v));
            out.set(n.row.id, p * quantum);
        }
        const kids = n.children.filter(c => distributable(c) && (() => { const cv = read(c); return cv != null && isFinite(cv); })());
        // only a parent that IS the sum of its children may hand its printed value down —
        // 1.7: and only among rows of one kind (all flows, or all stocks of the same
        // Stichtag): a total that mixes stands and movements, or an opening and a
        // closing stand, is never distributed
        let share = false;
        if (p != null && distributable(n) && kids.length > 0 && kids.every(c => stockClass(c) === stockClass(n))) {
            const sum = kids.reduce((a, c) => a + (read(c) as number), 0) * (n.row.sign < 0 ? -1 : 1);
            share = Math.abs(sum - (v as number)) <= 1e-9 * Math.max(1, Math.abs(sum), Math.abs(v as number));
        }
        const given = new Map<PnlNode, number>();
        if (share) {
            const target = p! * (n.row.sign < 0 ? -1 : 1);
            const z = largestRemainder(kids.map(c => q(read(c) as number)), target);
            kids.forEach((c, i) => given.set(c, z[i]));
        }
        for (const c of n.children) { visit(c, given.get(c) ?? null); }
    };
    for (const r of roots) { visit(r, null); }
    return out;
}

/** True when the row carries no value in any scenario (candidate for zero-row hiding). */
export function isZeroRow(node: PnlNode): boolean {
    return SCENARIOS.every(s => {
        const v = node.computed[s];
        return v == null || v === 0;
    });
}

/**
 * Base row for the "% of revenue" column: explicit override (id or unique
 * name) if given, otherwise the first contributing root row.
 */
export function revenueBase(model: PnlModel, override?: string): PnlNode | null {
    const o = (override ?? "").trim();
    if (o !== "") {
        const direct = model.byId.get(o);
        if (direct) { return direct; }
        let match: PnlNode | null = null;
        for (const n of model.byId.values()) {
            if (n.row.name === o) { match = match == null ? n : null; if (match == null) { break; } }
        }
        if (match) { return match; }
    }
    for (const r of model.roots) {
        if (r.isOrphanBucket) { continue; }
        const t = r.row.rowType;
        if ((t === "account" || t === "subtotal") && r.computed.ac != null) { return r; }
    }
    return null;
}

/**
 * Virtual total over all model roots — the top of a driver tree built from a
 * plain dimension hierarchy, where no formula or KPI row offers a natural root.
 * It aggregates exactly like a subtotal row of the engine (sign-weighted sum of
 * the contributing roots per scenario, the same for the monthly series), so the
 * cards, the bridge and the scenario grid read the node like any other row.
 *
 * The node is deliberately NOT registered in model.byId: it belongs to the
 * view, not to the data. Its name is left empty — the caller labels it in the
 * reader's language.
 */
export function syntheticTotal(model: PnlModel): PnlNode {
    const row: InputRow = {
        id: TOTAL_ID, parent: null, name: "", sort: Number.MIN_SAFE_INTEGER,
        rowType: "subtotal", formulaDef: null, sign: 1,
        displayInvert: false, varianceInvert: false, values: {}, comment: null, index: -1,
    };
    const node: PnlNode = {
        row, children: [...model.roots], level: 0,
        computed: { ac: null, py: null, pl: null, fc: null, fcfy: null, plfy: null },
        series: {},
        error: null, hasChildren: model.roots.length > 0, isOrphanBucket: false,
        stock: null, stockInside: false, stockMix: false,
    };
    aggregateSubtotal(node);
    return node;
}

/**
 * 1.7 ⚡ "only exceptions", mode hide: several sibling rows folded into ONE
 * synthetic leaf row ("other (n)" — the caller names it in the reader's
 * language). Values and monthly series are the plain sums of the members'
 * computed values, i.e. exactly what they contribute to their parent's Σ —
 * a cascade over the folded list therefore closes like the original one
 * (Σ kept rows + rest = parent). Flags come from the members where they agree;
 * DisplayInvert follows the majority (it only orients the display, the raw sum
 * stays the same), VarianceInvert only when every member carries it. A stock
 * class survives only when all members share it. No comment, no error, no
 * formula; like syntheticTotal the node is NOT registered in model.byId.
 */
export function mergeNodes(members: PnlNode[], id: string, name: string, parent: string | null,
    srcIdx?: number[]): PnlNode {
    const first = members[0];
    const computed = { ac: null, py: null, pl: null, fc: null, fcfy: null, plfy: null } as Record<Scenario, number | null>;
    for (const s of SCENARIOS) {
        let acc: number | null = null;
        for (const m of members) {
            const v = m.computed[s];
            if (v != null && isFinite(v)) { acc = (acc ?? 0) + v; }
        }
        computed[s] = acc;
    }
    const series: Partial<Record<Scenario, (number | null)[]>> = {};
    for (const s of SCENARIOS) {
        const lists = members.map(m => m.series[s]).filter((x): x is (number | null)[] => x != null);
        if (lists.length === 0) { continue; }
        const len = Math.max(...lists.map(l => l.length));
        const out: (number | null)[] = [];
        for (let i = 0; i < len; i++) {
            let acc: number | null = null;
            for (const l of lists) {
                const v = l[i];
                if (v != null && isFinite(v)) { acc = (acc ?? 0) + v; }
            }
            out.push(acc);
        }
        series[s] = out;
    }
    const inv = members.filter(m => m.row.displayInvert).length;
    const stock = members.every(m => (m.stock ?? null) === (first.stock ?? null)) ? (first.stock ?? null) : null;
    const row: InputRow = {
        id, parent, name, sort: members[members.length - 1].row.sort,
        rowType: "account", formulaDef: null,
        sign: members.every(m => m.row.sign === first.row.sign) ? first.row.sign : 1,
        displayInvert: inv * 2 > members.length,
        varianceInvert: members.every(m => m.row.varianceInvert),
        values: { ...computed }, series, comment: null, index: first.row.index,
    };
    if (srcIdx && srcIdx.length > 0) { row.srcIdx = srcIdx; }
    return {
        row, children: [], level: Math.min(...members.map(m => m.level)), computed, series,
        error: null, hasChildren: false, isOrphanBucket: false,
        stock, stockInside: members.some(m => m.stockInside === true), stockMix: false,
    };
}

// ---- visible rows (expand/collapse)

export function flattenVisible(roots: PnlNode[], collapsed: ReadonlySet<string>): PnlNode[] {
    const out: PnlNode[] = [];
    const walk = (nodes: PnlNode[]): void => {
        for (const n of nodes) {
            out.push(n);
            if (n.hasChildren && !collapsed.has(n.row.id)) { walk(n.children); }
        }
    };
    walk(roots);
    return out;
}

/** Collapse set for "expand everything down to level n" (n = 1-based; n>=maxDepth expands all). */
export function collapseToLevel(roots: PnlNode[], level: number): Set<string> {
    const collapsed = new Set<string>();
    const walk = (nodes: PnlNode[]): void => {
        for (const n of nodes) {
            if (n.hasChildren && n.level + 1 >= level) { collapsed.add(n.row.id); }
            walk(n.children);
        }
    };
    walk(roots);
    return collapsed;
}

// ---- 1.7 cross-highlight (supportsHighlight): the marked part next to the whole

/**
 * The marked share of a value, 0..1, measured in the direction of the full
 * value: a marked part of the same sign reads as its fraction, a marked part
 * against the sign of the whole (or a missing / zero whole) as 0, a marked
 * part beyond the whole (non-additive measures) as 1. The Sankey fills its
 * bars with it, the tree draws it as the share strip of a card.
 */
export function markedShare(marked: number | null | undefined, full: number | null | undefined): number {
    if (marked == null || full == null || !isFinite(marked) || !isFinite(full) || full === 0) { return 0; }
    const r = marked / full;
    return r <= 0 ? 0 : r >= 1 ? 1 : r;
}

/** one stacked matching of sources against targets (see stackPairs) */
export interface StackMatch {
    /** amount per matched pair, keyed "i|j" (source index | target index) */
    pairs: Map<string, number>;
    /** what each source has left over after the matching */
    restS: number[];
    /** what each target has left over after the matching */
    restT: number[];
}

/**
 * The stacked two-pointer matching of the Sankey port, as a pure function:
 * sources and targets are poured top to bottom, every step moves the smaller
 * remainder of the current pair. The Sankey runs it a second time on the
 * marked amounts (same order of sources and targets), so every ribbon knows
 * which part of it belongs to the marked selection — a marked revenue splits
 * into a marked gross profit and a marked cost of sales exactly like the
 * whole does. Negative amounts count as 0.
 */
export function stackPairs(S: number[], T: number[]): StackMatch {
    const pairs = new Map<string, number>();
    const s = S.map(v => (isFinite(v) && v > 0 ? v : 0));
    const t = T.map(v => (isFinite(v) && v > 0 ? v : 0));
    const total = s.reduce((a, b) => a + b, 0) + t.reduce((a, b) => a + b, 0);
    const eps = Math.max(1e-9, total * 1e-9);
    const restS = [...s]; const restT = [...t];
    let i = 0; let j = 0;
    while (i < s.length && j < t.length) {
        if (restS[i] <= eps) { restS[i] = Math.max(0, restS[i]); i++; continue; }
        if (restT[j] <= eps) { restT[j] = Math.max(0, restT[j]); j++; continue; }
        const amt = Math.min(restS[i], restT[j]);
        pairs.set(i + "|" + j, (pairs.get(i + "|" + j) ?? 0) + amt);
        restS[i] -= amt; restT[j] -= amt;
    }
    return { pairs, restS, restT };
}

/**
 * True when two models carry the same rows in the same tree — the check
 * behind the second engine run of a cross-highlight: the marked model is
 * built from the very rows of the full model (only the measure values
 * differ), so every node of one has its twin in the other by id.
 */
export function sameShape(a: PnlModel, b: PnlModel): boolean {
    if (a.byId.size !== b.byId.size || a.roots.length !== b.roots.length) { return false; }
    if (a.months.length !== b.months.length || a.months.some((m, i) => m !== b.months[i])) { return false; }
    for (const [id, n] of a.byId) {
        const t = b.byId.get(id);
        if (!t || t.level !== n.level || t.children.length !== n.children.length
            || (t.row.parent ?? null) !== (n.row.parent ?? null)
            || t.row.rowType !== n.row.rowType) { return false; }
        for (let k = 0; k < n.children.length; k++) {
            if (n.children[k].row.id !== t.children[k].row.id) { return false; }
        }
    }
    return true;
}
