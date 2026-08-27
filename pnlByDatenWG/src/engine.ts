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
    values: Partial<Record<Scenario, number | null>>;
    /** Monthly series (aligned to PnlModel.months) for sparklines; signed like values. */
    series?: Partial<Record<Scenario, (number | null)[]>>;
    comment: string | null;
    index: number;
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
}

export interface PnlModel {
    roots: PnlNode[];
    byId: Map<string, PnlNode>;
    maxDepth: number;
    months: string[];
    warnings: string[];
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
    values: Partial<Record<Scenario, number | null>>;
    month: string | null;
    comment: string | null;
    index: number;
}

/**
 * Month-grain aggregation: merge rows sharing an id into one InputRow —
 * regular scenarios sum up and fill the monthly series, FY scalars
 * (fcfy/plfy, repeated on every month row) take the first value.
 */
export function aggregateMonthly(
    rows: (InputRow & { month: string | null })[]
): { rows: InputRow[]; months: string[] } {
    const months = [...new Set(rows.map(r => r.month).filter((m): m is string => m != null))].sort();
    const byId = new Map<string, InputRow>();
    for (const r of rows) {
        let t = byId.get(r.id);
        if (!t) {
            t = { ...r, values: {}, series: {} };
            delete (t as { month?: string | null }).month;
            byId.set(r.id, t);
        }
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
export function rowsFromLevels(rows: LevelInputRow[]): { rows: InputRow[]; months: string[] } {
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
        });
    }

    // month-grain rows sharing a path merge into one leaf (values summed,
    // FY scalars first-wins, monthly series filled)
    const agg = aggregateMonthly(leaves);
    // a real data row at a synthetic parent's path replaces the synthetic
    for (const leaf of agg.rows) { synth.delete(leaf.id); }
    const out = [...synth.values(), ...agg.rows];

    // synthetic parents inherit the smallest child sort — otherwise their
    // first-seen data index would shuffle the P&L order at the root level
    const minSort = new Map<string, number>();
    for (let pass = 0; pass < 8; pass++) {
        let changed = false;
        for (const r of out) {
            if (r.parent == null) { continue; }
            const cur = minSort.get(r.parent);
            const candidate = Math.min(r.sort, minSort.get(r.id) ?? r.sort);
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

export function parseRowType(raw: unknown): RowType {
    const s = String(raw ?? "").trim().toLowerCase();
    if (s.startsWith("sub") || s.startsWith("zwischen") || s === "sum" || s === "summe") { return "subtotal"; }
    if (s.startsWith("form")) { return "formula"; }
    if (s === "kpi" || s === "ratio" || s === "margin" || s === "kennzahl" || s === "marge" || s === "quote") { return "kpi"; }
    if (s.startsWith("sep") || s.startsWith("trenn") || s.startsWith("leer")) { return "separator"; }
    return "account";
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

export function buildModel(rows: InputRow[], orphanLabel: string, months: string[] = []): PnlModel {
    const warnings: string[] = [];
    const byId = new Map<string, PnlNode>();

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

    computeValues(roots, byId, warnings, months);
    return { roots, byId, maxDepth, months, warnings };
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
export function aggregateSubtotal(node: PnlNode): void {
    for (const s of SCENARIOS) {
        const childAcc = childSum(node, s);
        const base = childAcc != null ? childAcc : node.row.values[s];
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

function computeValues(roots: PnlNode[], byId: Map<string, PnlNode>, warnings: string[], months: string[]): void {
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

        if (t === "subtotal") { aggregateSubtotal(node); return; }

        // postable parent account: own value + children
        for (const s of SCENARIOS) {
            const own = node.row.values[s];
            const childAcc = childSum(node, s);
            let acc: number | null = own != null ? own * node.row.sign : null;
            if (childAcc != null) { acc = (acc ?? 0) + childAcc; }
            node.computed[s] = acc;
        }

        // monthly series roll up with the same semantics (sparklines)
        for (const s of SERIES_SCENARIOS) {
            const ownRaw = node.row.series?.[s];
            const own = ownRaw ? ownRaw.map(v => (v == null ? null : v * node.row.sign)) : null;
            const childAcc = childSeriesSum(node, s);
            if (own && childAcc) {
                node.series[s] = own.map((v, i) =>
                    v == null && childAcc[i] == null ? null : (v ?? 0) + (childAcc[i] ?? 0));
            } else if (own || childAcc) {
                node.series[s] = (own ?? childAcc)!;
            }
        }
    };
    for (const r of roots) { sumNode(r); }

    // pass 2: formula / kpi rows with memoized evaluation + cycle detection.
    // [Refs] resolve by id first, then by unique row name — level mode has
    // synthetic path ids, so "[Umsatzerlöse]" must work by name there.
    const byName = new Map<string, PnlNode | null>(); // null = ambiguous
    for (const node of byId.values()) {
        const n = node.row.name;
        if (!byName.has(n)) { byName.set(n, node); }
        else if (byName.get(n) !== node) { byName.set(n, null); }
    }
    const resolve = (id: string): PnlNode | undefined =>
        byId.get(id) ?? (byName.get(id) || undefined);

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

// ---- variances

export function variance(node: PnlNode, ref: Scenario, minuend: Scenario = "ac"): Variance {
    const ac = node.computed[minuend];
    const rv = node.computed[ref];
    if (ac == null || rv == null) { return { delta: null, deltaPct: null, good: true }; }
    const delta = ac - rv;
    const deltaPct = rv !== 0 ? delta / Math.abs(rv) : null;
    let good = delta >= 0;
    if (node.row.varianceInvert) { good = !good; }
    return { delta, deltaPct, good };
}

/** Value as shown in the value columns (DisplayInvert flips the sign for cost rows). */
export function displayValue(node: PnlNode, s: Scenario): number | null {
    const v = node.computed[s];
    if (v == null) { return null; }
    return node.row.displayInvert ? -v : v;
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
    };
    aggregateSubtotal(node);
    return node;
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
